window.IE = window.IE || {};

(function (IE) {
  'use strict';

  /**
   * 사진 보정 엔진 — 순수 픽셀 계산만 한다 (인터넷·AI 없음).
   *
   *  · 자동 보정   : 히스토그램을 보고 밝기·대비·색감을 계산해 준다
   *  · 피부 보정   : YCbCr 로 피부색을 찾아 그 부분만 부드럽게
   *  · 선명하게    : 언샤프 마스크 (원본 - 흐린본)
   *  · 얼굴 성형   : 리퀴파이(액화) — 픽셀을 국소적으로 밀고 당긴다
   *
   * 모두 브라우저 안에서만 돌아간다.
   */

  var api = {};

  function clamp255(v) {
    return v < 0 ? 0 : (v > 255 ? 255 : v);
  }

  function clampIndex(v, max) {
    return v < 0 ? 0 : (v > max ? max : v);
  }

  /* ==================================================== 자동 보정 */

  /**
   * 이미지를 보고 보정값을 계산한다.
   *  - 대비: 밝기 분포가 좁으면 넓혀 준다
   *  - 밝기: 보정 후 중간 밝기가 128 근처가 되게 맞춘다
   *  - 색감: 회색 세계 가정으로 색 치우침을 되돌린다
   */
  api.autoParams = function (imageData) {
    var data = imageData.data;
    var total = imageData.width * imageData.height;
    if (!total) return { brightness: 0, contrast: 0, saturation: 0, warmth: 0 };

    var histogram = new Uint32Array(256);
    var sumR = 0;
    var sumG = 0;
    var sumB = 0;
    var sumChroma = 0;
    var sampled = 0;

    // 성능을 위해 성기게 훑는다 (전체를 다 볼 필요는 없다)
    var step = Math.max(1, Math.floor(total / 40000));

    for (var i = 0; i < total; i += step) {
      var at = i * 4;
      var r = data[at];
      var g = data[at + 1];
      var b = data[at + 2];

      histogram[Math.round(0.299 * r + 0.587 * g + 0.114 * b)]++;
      sumR += r;
      sumG += g;
      sumB += b;
      sumChroma += Math.max(r, g, b) - Math.min(r, g, b);
      sampled++;
    }

    if (!sampled) return { brightness: 0, contrast: 0, saturation: 0, warmth: 0 };

    // 밝기 분포의 아래 1% / 위 99% 지점
    var lowTarget = sampled * 0.01;
    var highTarget = sampled * 0.99;
    var running = 0;
    var low = 0;
    var high = 255;

    for (var v = 0; v < 256; v++) {
      running += histogram[v];
      if (running <= lowTarget) low = v;
      if (running <= highTarget) high = v;
    }

    if (high - low < 8) high = Math.min(255, low + 8);

    // 대비: 분포를 230 정도로 펴 준다
    var spread = high - low;
    var factor = Math.min(2.2, Math.max(1, 230 / spread));
    var contrast = Math.round((factor - 1) * 100);

    // 밝기: 대비 적용 후 중간값이 128 이 되도록
    var mid = (low + high) / 2;
    var afterContrast = (mid - 128) * factor + 128;
    var brightness = Math.round(Math.max(-60, Math.min(60, 128 - afterContrast)));

    // 색감: 파랑이 강하면 따뜻하게, 빨강이 강하면 차갑게
    var meanR = sumR / sampled;
    var meanB = sumB / sampled;
    var warmth = Math.round(Math.max(-40, Math.min(40, (meanB - meanR) * 0.5)));

    // 채도: 이미 알록달록하면 건드리지 않고, 칙칙하면 살짝 올린다
    var meanChroma = sumChroma / sampled;
    var saturation = meanChroma < 42 ? 8 : 0;

    return { brightness: brightness, contrast: contrast, saturation: saturation, warmth: warmth };
  };

  /**
   * 밝기·대비·채도·따뜻함을 적용한다.
   * 밝기/대비는 256칸 표로 만들어 빠르게 처리한다.
   */
  api.applyTone = function (imageData, params) {
    var data = imageData.data;
    var brightness = params.brightness || 0;
    var contrast = params.contrast || 0;
    var saturation = params.saturation || 0;
    var warmth = params.warmth || 0;

    var gray = !!params.gray;

    if (!brightness && !contrast && !saturation && !warmth && !gray) return imageData;

    // 밝기·대비 표
    var factor = (100 + contrast) / 100;
    var offset = brightness * 1.2;
    var lut = new Uint8ClampedArray(256);

    for (var v = 0; v < 256; v++) {
      lut[v] = clamp255((v - 128) * factor + 128 + offset);
    }

    // 흑백은 채도를 완전히 빼앗는다 (슬라이더 범위 -50 으로는 닿지 않는 값)
    var satFactor = gray ? 0 : (100 + saturation) / 100;
    var warmR = warmth * 0.7;
    var warmB = -warmth * 0.7;

    for (var i = 0; i < data.length; i += 4) {
      var r = lut[data[i]];
      var g = lut[data[i + 1]];
      var b = lut[data[i + 2]];

      r = clamp255(r + warmR);
      b = clamp255(b + warmB);

      if (satFactor !== 1) {
        var luma = 0.299 * r + 0.587 * g + 0.114 * b;
        r = clamp255(luma + (r - luma) * satFactor);
        g = clamp255(luma + (g - luma) * satFactor);
        b = clamp255(luma + (b - luma) * satFactor);
      }

      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }

    return imageData;
  };

  /* ==================================================== 흐리게 / 선명하게 */

  /** 한 채널을 O(n) 박스 블러로 흐린다 */
  function blurPlane(plane, w, h, radius) {
    var count = radius * 2 + 1;
    var tmp = new Float32Array(w * h);
    var out = new Float32Array(w * h);
    var x, y, sum, at;

    for (y = 0; y < h; y++) {
      var row = y * w;
      sum = 0;
      for (x = -radius; x <= radius; x++) sum += plane[row + clampIndex(x, w - 1)];
      for (x = 0; x < w; x++) {
        tmp[row + x] = sum / count;
        sum += plane[row + clampIndex(x + radius + 1, w - 1)] -
          plane[row + clampIndex(x - radius, w - 1)];
      }
    }

    for (x = 0; x < w; x++) {
      sum = 0;
      for (y = -radius; y <= radius; y++) sum += tmp[clampIndex(y, h - 1) * w + x];
      for (y = 0; y < h; y++) {
        at = y * w + x;
        out[at] = sum / count;
        sum += tmp[clampIndex(y + radius + 1, h - 1) * w + x] -
          tmp[clampIndex(y - radius, h - 1) * w + x];
      }
    }

    return out;
  }

  /** RGB 세 채널을 흐린 결과를 RGBA 배열로 돌려준다 (알파는 그대로) */
  api.blurRGB = function (imageData, radius) {
    var w = imageData.width;
    var h = imageData.height;
    var data = imageData.data;
    var total = w * h;

    var out = new Uint8ClampedArray(data.length);

    for (var c = 0; c < 3; c++) {
      var plane = new Float32Array(total);
      for (var i = 0; i < total; i++) plane[i] = data[i * 4 + c];

      var blurred = blurPlane(plane, w, h, radius);

      for (var j = 0; j < total; j++) out[j * 4 + c] = blurred[j];
    }

    for (var k = 0; k < total; k++) out[k * 4 + 3] = data[k * 4 + 3];

    return out;
  };

  /* ==================================================== 피부 마스크 */

  /**
   * 피부색 영역을 찾는다 (YCbCr 고전 범위).
   * 경계가 각지지 않게 살짝 흐려서 돌려준다.
   */
  api.skinMask = function (imageData, feather) {
    var w = imageData.width;
    var h = imageData.height;
    var data = imageData.data;
    var total = w * h;

    var mask = new Float32Array(total);

    for (var i = 0; i < total; i++) {
      var at = i * 4;
      var r = data[at];
      var g = data[at + 1];
      var b = data[at + 2];

      var y = 0.299 * r + 0.587 * g + 0.114 * b;
      var cb = -0.168736 * r - 0.331264 * g + 0.5 * b + 128;
      var cr = 0.5 * r - 0.418688 * g - 0.081312 * b + 128;

      var isSkin = cb >= 77 && cb <= 130 && cr >= 132 && cr <= 178 && y > 50 && y < 250;
      mask[i] = isSkin ? 1 : 0;
    }

    var radius = Math.max(1, feather == null ? 3 : feather);
    var soft = blurPlane(mask, w, h, radius);

    var out = new Uint8ClampedArray(total);
    for (var k = 0; k < total; k++) out[k] = Math.round(soft[k] * 255);

    return out;
  };

  /* ==================================================== 보정 적용 */

  /**
   * 흐린 본 + 피부 마스크를 이용해 피부를 부드럽게 하고 전체를 선명하게 한다.
   * blurred 는 api.blurRGB 결과, mask 는 api.skinMask 결과.
   */
  api.applyDetail = function (imageData, blurred, mask, smoothAmount, sharpenAmount) {
    var data = imageData.data;
    var total = imageData.width * imageData.height;

    var smooth = (smoothAmount || 0) / 100;
    var sharpen = (sharpenAmount || 0) / 100;

    for (var i = 0; i < total; i++) {
      var at = i * 4;

      if (smooth > 0) {
        // 피부인 곳만 흐린 본과 섞는다
        var weight = smooth * (mask ? mask[i] / 255 : 0);
        if (weight > 0) {
          var keep = 1 - weight;
          data[at] = data[at] * keep + blurred[at] * weight;
          data[at + 1] = data[at + 1] * keep + blurred[at + 1] * weight;
          data[at + 2] = data[at + 2] * keep + blurred[at + 2] * weight;
        }
      }

      if (sharpen > 0) {
        // 언샤프 마스크 — 채널마다 따로 하면 색 경계에 테두리(컬러 프린지)가 생기고
        // 흑백 사진이 다시 물드는 원인이 된다. 밝기 차이 하나로 세 채널을 함께 민다.
        var amount = sharpen * 1.4;
        var here = 0.299 * data[at] + 0.587 * data[at + 1] + 0.114 * data[at + 2];
        var soft = 0.299 * blurred[at] + 0.587 * blurred[at + 1] + 0.114 * blurred[at + 2];
        var delta = (here - soft) * amount;

        data[at] = clamp255(data[at] + delta);
        data[at + 1] = clamp255(data[at + 1] + delta);
        data[at + 2] = clamp255(data[at + 2] + delta);
      }
    }

    return imageData;
  };

  /* ==================================================== 얼굴 성형(리퀴파이) */

  /**
   * 브러시 영역만 국소적으로 휜다.
   *
   * 영역을 통째로 복사해 두고, 각 픽셀이 '어디서 왔는지'를 역으로 계산해
   * 이중선형 보간으로 가져온다. 그래서 한 번에 여러 번 문질러도 뭉개지지 않는다.
   *
   * mode
   *   push   : 끌어온 방향으로 민다 (윤곽 옮기기)
   *   pinch  : 중심으로 모은다 (턱 갸름·볼 살 빼기)
   *   bulge  : 중심에서 밀어낸다 (눈·입 키우기)
   */
  api.liquify = function (ctx, w, h, options) {
    var cx = options.x;
    var cy = options.y;
    var radius = Math.max(3, options.radius);
    var strength = options.strength;
    var mode = options.mode;
    var dx = options.dx || 0;
    var dy = options.dy || 0;

    if (!strength) return;

    var pad = Math.ceil(radius * Math.abs(strength)) + 2;
    var x0 = Math.max(0, Math.floor(cx - radius - pad));
    var y0 = Math.max(0, Math.floor(cy - radius - pad));
    var x1 = Math.min(w, Math.ceil(cx + radius + pad));
    var y1 = Math.min(h, Math.ceil(cy + radius + pad));

    var rw = x1 - x0;
    var rh = y1 - y0;
    if (rw <= 0 || rh <= 0) return;

    var src = ctx.getImageData(x0, y0, rw, rh).data;
    var out = ctx.createImageData(rw, rh);
    var dst = out.data;

    var radiusSq = radius * radius;

    for (var y = 0; y < rh; y++) {
      for (var x = 0; x < rw; x++) {
        var px = x0 + x;
        var py = y0 + y;
        var ox = px - cx;
        var oy = py - cy;

        var distSq = ox * ox + oy * oy;
        var sx = px;
        var sy = py;

        if (distSq < radiusSq) {
          var dist = Math.sqrt(distSq);
          var t = 1 - dist / radius;
          var falloff = t * t * (3 - 2 * t);   // 부드러운 감쇠
          var k = strength * falloff;

          if (mode === 'push') {
            sx = px - dx * k;
            sy = py - dy * k;
          } else if (mode === 'pinch') {
            sx = cx + ox * (1 + k);
            sy = cy + oy * (1 + k);
          } else if (mode === 'bulge') {
            sx = cx + ox * (1 - k);
            sy = cy + oy * (1 - k);
          } else if (mode === 'swirl') {
            var angle = k * 2.4;
            var cos = Math.cos(angle);
            var sin = Math.sin(angle);
            sx = cx + ox * cos - oy * sin;
            sy = cy + ox * sin + oy * cos;
          }
        }

        sampleBilinear(src, rw, rh, sx - x0, sy - y0, dst, (y * rw + x) * 4);
      }
    }

    ctx.putImageData(out, x0, y0);
  };

  /** 이중선형 보간으로 한 점을 읽어 dst 에 쓴다 (영역 밖은 가장자리로 처리) */
  function sampleBilinear(src, w, h, fx, fy, dst, at) {
    var x = fx < 0 ? 0 : (fx > w - 1 ? w - 1 : fx);
    var y = fy < 0 ? 0 : (fy > h - 1 ? h - 1 : fy);

    var x0 = Math.floor(x);
    var y0 = Math.floor(y);
    var x1 = Math.min(w - 1, x0 + 1);
    var y1 = Math.min(h - 1, y0 + 1);

    var tx = x - x0;
    var ty = y - y0;

    var i00 = (y0 * w + x0) * 4;
    var i10 = (y0 * w + x1) * 4;
    var i01 = (y1 * w + x0) * 4;
    var i11 = (y1 * w + x1) * 4;

    for (var c = 0; c < 4; c++) {
      var top = src[i00 + c] * (1 - tx) + src[i10 + c] * tx;
      var bottom = src[i01 + c] * (1 - tx) + src[i11 + c] * tx;
      dst[at + c] = top * (1 - ty) + bottom * ty;
    }
  }

  /* ==================================================== 잡티 제거 */

  /**
   * 잡티 제거 — 점·흉터를 **주변 피부 조각으로 덮어** 지운다.
   *
   * 그냥 흐리게 만들면 자국이 남는다. 그래서 고리 둘레 여덟 방향에 후보 조각을
   * 놓고 **테두리 색이 가장 잘 맞는 곳**을 골라, 부드러운 원형으로 덮는다.
   * 피부 결이 살아 있는 채로 점만 사라진다.
   *
   * src 는 한 획 동안 고정해 둔 원본이다. 문지를 때 방금 덮은 자리를 다시
   * 베끼면 번지므로, 항상 처음 상태에서 가져온다.
   * cx, cy 는 imageData 안에서의 좌표다.
   */
  api.healSpot = function (imageData, src, cx, cy, radius) {
    var w = imageData.width;
    var h = imageData.height;
    var data = imageData.data;
    var r = Math.max(2, radius);

    var dist = Math.max(3, Math.round(r * 2.2));
    var bestX = 0;
    var bestY = 0;
    var bestScore = Infinity;
    var found = false;
    var a, t;

    for (a = 0; a < 8; a++) {
      var ang = (a / 8) * Math.PI * 2;
      var ox = Math.round(Math.cos(ang) * dist);
      var oy = Math.round(Math.sin(ang) * dist);

      if (cx + ox - r - 2 < 0 || cx + ox + r + 2 >= w) continue;
      if (cy + oy - r - 2 < 0 || cy + oy + r + 2 >= h) continue;

      var score = 0;
      var n = 0;

      // 안쪽 내용은 보지 않고 테두리 고리끼리만 비교한다
      for (t = 0; t < 40; t++) {
        var ta = (t / 40) * Math.PI * 2;
        var rx = Math.round(cx + Math.cos(ta) * (r + 1.5));
        var ry = Math.round(cy + Math.sin(ta) * (r + 1.5));

        if (rx < 0 || ry < 0 || rx >= w || ry >= h) continue;

        var i1 = (ry * w + rx) * 4;
        var i2 = ((ry + oy) * w + (rx + ox)) * 4;

        var d0 = data[i1] - data[i2];
        var d1 = data[i1 + 1] - data[i2 + 1];
        var d2 = data[i1 + 2] - data[i2 + 2];
        score += d0 * d0 + d1 * d1 + d2 * d2;
        n++;
      }

      if (n < 8) continue;
      score /= n;

      if (score < bestScore) {
        bestScore = score;
        bestX = ox;
        bestY = oy;
        found = true;
      }
    }

    if (!found) return 0;

    var rr = r * r;
    var x0 = Math.max(0, Math.floor(cx - r));
    var x1 = Math.min(w - 1, Math.ceil(cx + r));
    var y0 = Math.max(0, Math.floor(cy - r));
    var y1 = Math.min(h - 1, Math.ceil(cy + r));
    var touched = 0;

    for (var y = y0; y <= y1; y++) {
      for (var x = x0; x <= x1; x++) {
        var dx = x - cx;
        var dy = y - cy;
        var d2r = dx * dx + dy * dy;
        if (d2r > rr) continue;

        var d = Math.sqrt(d2r) / r;
        var cover = 1 - d * d * (3 - 2 * d);      // 가운데 1, 가장자리 0
        if (cover <= 0) continue;

        var at = (y * w + x) * 4;
        var sa = ((y + bestY) * w + (x + bestX)) * 4;

        if (data[at + 3] === 0 || src[sa + 3] === 0) continue;

        data[at] = data[at] * (1 - cover) + src[sa] * cover;
        data[at + 1] = data[at + 1] * (1 - cover) + src[sa + 1] * cover;
        data[at + 2] = data[at + 2] * (1 - cover) + src[sa + 2] * cover;
        touched++;
      }
    }

    return touched;
  };

  /* ==================================================== 비네트 */

  /**
   * 비네트 — 네 모서리를 부드럽게 어둡게 해서 시선을 가운데로 모은다.
   * 가운데 45% 는 그대로 두고 바깥으로 갈수록 짙어진다.
   */
  api.applyVignette = function (imageData, amount) {
    var k = (amount || 0) / 100;
    if (k <= 0) return imageData;

    var data = imageData.data;
    var w = imageData.width;
    var h = imageData.height;
    var cx = (w - 1) / 2;
    var cy = (h - 1) / 2;
    var maxD = Math.sqrt(cx * cx + cy * cy) || 1;

    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var dx = (x - cx) / maxD;
        var dy = (y - cy) / maxD;
        var d = Math.sqrt(dx * dx + dy * dy);
        var t = (d - 0.45) / 0.55;
        if (t <= 0) continue;
        if (t > 1) t = 1;

        var factor = 1 - t * t * k * 0.85;
        var at = (y * w + x) * 4;

        data[at] *= factor;
        data[at + 1] *= factor;
        data[at + 2] *= factor;
      }
    }

    return imageData;
  };

  /* ==================================================== 미리보기용 축소 */

  /** 큰 사진은 줄여서 다룬다 (메모리·속도) */
  api.fitSize = function (w, h, maxEdge) {
    var scale = Math.min(1, maxEdge / Math.max(w, h));
    return {
      width: Math.max(1, Math.round(w * scale)),
      height: Math.max(1, Math.round(h * scale)),
      scale: scale
    };
  };

  IE.enhance = api;
})(window.IE);
