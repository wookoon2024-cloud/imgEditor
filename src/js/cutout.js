window.IE = window.IE || {};

(function (IE) {
  'use strict';

  /**
   * 누끼(배경 제거) 계산 엔진.
   *
   * 화면(UI)은 imgedit.js 가 맡고, 여기서는 픽셀 계산만 한다.
   * 인터넷도 AI 모델도 쓸 수 없으므로 순수 계산으로 처리한다.
   *
   *  · 자동 제거 : 테두리를 한 바퀴 읽어 배경색을 판단하고, 테두리에서 이어진
   *                '배경과 확실히 비슷한 픽셀'만 따라가며 지운다
   *  · 매직툴    : 클릭한 지점과 비슷한 색을 골라낸다 (이어진 영역 / 전체)
   *  · 조각 정리 : 남은 불투명 영역 중 가장 큰 덩어리만 남긴다
   *
   * 원본 픽셀은 UI 쪽에서 따로 보관하므로 '복원'과 '되돌리기'가 언제나 가능하다.
   */

  /* ------------------------------------------------------------ 공통 */

  /**
   * 감도(0~100) -> 채널당 허용 오차.
   *
   * 예전에는 이 값을 유클리드 거리로 100 넘게 잡아서, 흰 배경과 밝은 살색의
   * 차이(60~90)보다 커지는 바람에 이마·볼 하이라이트를 타고 얼굴까지 먹어
   * 들어갔다. 이제는 '채널별 최대 차이'로 재고 훨씬 보수적으로 잡는다.
   */
  function limitFrom(tolerance) {
    return Math.max(5, Math.round(tolerance * 1.6));
  }

  function medianOf(list) {
    var sorted = list.slice().sort(function (a, b) { return a - b; });
    return sorted[Math.floor(sorted.length / 2)];
  }

  function colorAt(data, w, x, y) {
    var i = (y * w + x) * 4;
    return { r: data[i], g: data[i + 1], b: data[i + 2] };
  }

  /** 채널별 최대 차이 (0~255) */
  function channelDistance(r, g, b, ref) {
    var dr = Math.abs(r - ref.r);
    var dg = Math.abs(g - ref.g);
    var db = Math.abs(b - ref.b);
    return Math.max(dr, dg, db);
  }

  /** 비슷한 색을 하나로 합친다 (계산량을 줄이고 판정을 단순하게) */
  function dedupeColors(list, minGap) {
    var out = [];

    list.forEach(function (color) {
      var duplicate = out.some(function (kept) {
        return channelDistance(color.r, color.g, color.b, kept) <= minGap;
      });
      if (!duplicate) out.push(color);
    });

    return out.length ? out : list.slice(0, 1);
  }

  /* --------------------------------------------------- 배경색 판단 */

  /** 테두리를 한 바퀴 순서대로 읽는다 */
  function borderRing(data, w, h, inset) {
    var ring = [];
    var x, y;
    var top = Math.min(h - 1, inset);
    var bottom = Math.max(0, h - 1 - inset);
    var left = Math.min(w - 1, inset);
    var right = Math.max(0, w - 1 - inset);

    for (x = 0; x < w; x++) ring.push(colorAt(data, w, x, top));
    for (y = 1; y < h - 1; y++) ring.push(colorAt(data, w, right, y));
    for (x = w - 1; x >= 0; x--) ring.push(colorAt(data, w, x, bottom));
    for (y = h - 2; y > 0; y--) ring.push(colorAt(data, w, left, y));

    return ring;
  }

  /**
   * 테두리에서 배경색 후보를 뽑는다.
   *
   * 모서리도, 변(邊)의 중앙값도 배경이라고 단정할 수 없다.
   *  - 증명사진처럼 어깨가 아래쪽을 가득 채우면 아래 테두리 대부분이 옷 색이고,
   *    심하면 아래 모서리까지 옷으로 덮인다.
   *
   * 그래서 테두리를 한 바퀴 순회하며 **이어진 구간(run)** 으로 나눈다.
   * 배경은 보통 테두리의 가장 긴 구간을 차지하고, 옷처럼 색이 확 바뀌는 곳에서
   * 구간이 끊기기 때문이다. 그라데이션 배경은 이웃 색이 조금씩만 달라서
   * 한 구간으로 이어지므로, 그 구간에서 여러 색을 뽑아 쓰면 범위가 덮인다.
   */
  function sampleBackgrounds(data, w, h) {
    var ring = borderRing(data, w, h, 2);
    if (!ring.length) return [colorAt(data, w, 0, 0)];

    var LOCAL_STEP = 28;   // 이 정도 이내면 같은 구간으로 본다 (그라데이션 허용)
    var runs = [];
    var current = { colors: [ring[0]] };

    for (var i = 1; i < ring.length; i++) {
      var prev = ring[i - 1];
      var here = ring[i];

      if (channelDistance(here.r, here.g, here.b, prev) <= LOCAL_STEP) {
        current.colors.push(here);
      } else {
        runs.push(current);
        current = { colors: [here] };
      }
    }
    runs.push(current);

    // 테두리는 원이므로 끝과 처음을 이어 준다
    if (runs.length > 1) {
      var last = runs[runs.length - 1];
      var first = runs[0];
      var tail = last.colors[last.colors.length - 1];
      var head = first.colors[0];

      if (channelDistance(tail.r, tail.g, tail.b, head) <= LOCAL_STEP) {
        last.colors = last.colors.concat(first.colors);
        runs.shift();
      }
    }

    var longest = runs.reduce(function (a, b) {
      return b.colors.length > a.colors.length ? b : a;
    }, runs[0]);

    // 가장 긴 구간의 60% 이상인 구간만 배경으로 인정한다
    var threshold = Math.max(4, longest.colors.length * 0.6);
    var refs = [];

    runs.forEach(function (run) {
      if (run.colors.length < threshold) return;

      var picks = Math.min(4, run.colors.length);
      for (var k = 0; k < picks; k++) {
        var at = picks === 1 ? 0 : Math.floor(k * (run.colors.length - 1) / (picks - 1));
        refs.push(run.colors[Math.min(run.colors.length - 1, at)]);
      }
    });

    if (!refs.length) refs.push(longest.colors[0]);

    return dedupeColors(refs, 14);
  }

  /** 전체 대표 배경색 하나 */
  function sampleBackground(data, w, h) {
    var refs = sampleBackgrounds(data, w, h);
    return refs[refs.length - 1];
  }

  /** 여러 배경 후보 중 가장 가까운 것과의 거리 */
  function distanceToBackgrounds(data, index, refs) {
    var i = index * 4;
    var r = data[i];
    var g = data[i + 1];
    var b = data[i + 2];
    var best = 255;

    for (var k = 0; k < refs.length; k++) {
      var d = channelDistance(r, g, b, refs[k]);
      if (d < best) best = d;
    }
    return best;
  }

  /* ------------------------------------------------------- 자동 제거 */

  /**
   * 테두리에서 연결된 '배경과 확실히 비슷한' 픽셀만 지운다.
   *
   * 핵심은 보수적인 임계값이다. 얼굴 안쪽의 밝은 부분(이마·볼 하이라이트)은
   * 피부색에 둘러싸여 있어 테두리와 연결되지 않으므로, 임계값만 낮으면
   * 침범당하지 않는다.
   */
  function autoRemove(imageData, tolerance) {
    var data = imageData.data;
    var w = imageData.width;
    var h = imageData.height;
    var total = w * h;

    var refs = sampleBackgrounds(data, w, h);
    var limit = limitFrom(tolerance);

    var mask = new Uint8Array(total);
    var stack = new Int32Array(total);
    var top = 0;

    var push = function (index) {
      if (index < 0 || index >= total) return;
      if (mask[index]) return;
      if (distanceToBackgrounds(data, index, refs) > limit) return;
      mask[index] = 1;
      stack[top++] = index;
    };

    // 테두리 전체를 시작점으로
    for (var x = 0; x < w; x++) { push(x); push((h - 1) * w + x); }
    for (var y = 0; y < h; y++) { push(y * w); push(y * w + w - 1); }

    var removed = 0;

    while (top > 0) {
      var index = stack[--top];
      data[index * 4 + 3] = 0;
      removed++;

      var px = index % w;
      var py = (index - px) / w;

      if (px > 0) push(index - 1);
      if (px < w - 1) push(index + 1);
      if (py > 0) push(index - w);
      if (py < h - 1) push(index + w);
    }

    softEdges(data, w, h, refs, limit, mask);

    return { removed: removed, total: total, refs: refs, limit: limit };
  }

  /**
   * 지워진 영역에 닿아 있는 픽셀만 반투명하게 만들어 가장자리를 부드럽게 한다.
   * 안쪽 픽셀은 건드리지 않으므로 얼굴이 뭉개지지 않는다.
   */
  function softEdges(data, w, h, refs, limit, mask) {
    var outer = limit * 2.2;

    for (var y = 1; y < h - 1; y++) {
      for (var x = 1; x < w - 1; x++) {
        var index = y * w + x;
        if (mask[index]) continue;

        var touches = mask[index - 1] || mask[index + 1] ||
          mask[index - w] || mask[index + w] ||
          mask[index - w - 1] || mask[index - w + 1] ||
          mask[index + w - 1] || mask[index + w + 1];

        if (!touches) continue;

        var d = distanceToBackgrounds(data, index, refs);
        if (d >= outer) continue;

        var ratio = (d - limit) / (outer - limit);
        if (ratio < 0) ratio = 0;
        data[index * 4 + 3] = Math.min(data[index * 4 + 3], Math.round(ratio * 255));
      }
    }
  }

  /**
   * 남은 불투명 영역 중 가장 큰 덩어리만 남기고 작은 조각을 지운다.
   * 자동 제거가 남긴 배경 자투리를 정리할 때 쓴다.
   */
  function keepLargestComponent(imageData) {
    var data = imageData.data;
    var w = imageData.width;
    var h = imageData.height;
    var total = w * h;

    var label = new Int32Array(total);
    for (var f = 0; f < total; f++) label[f] = -1;

    var stack = new Int32Array(total);
    var sizes = [];

    for (var start = 0; start < total; start++) {
      if (label[start] !== -1) continue;
      if (data[start * 4 + 3] === 0) continue;

      var id = sizes.length;
      var top = 0;
      stack[top++] = start;
      label[start] = id;

      var count = 0;

      while (top > 0) {
        var index = stack[--top];
        count++;

        var px = index % w;
        var py = (index - px) / w;

        for (var dy = -1; dy <= 1; dy++) {
          for (var dx = -1; dx <= 1; dx++) {
            if (!dx && !dy) continue;
            var nx = px + dx;
            var ny = py + dy;
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;

            var next = ny * w + nx;
            if (label[next] !== -1) continue;
            if (data[next * 4 + 3] === 0) continue;

            label[next] = id;
            stack[top++] = next;
          }
        }
      }

      sizes.push(count);
    }

    if (sizes.length < 2) return 0;

    var biggest = 0;
    for (var k = 1; k < sizes.length; k++) {
      if (sizes[k] > sizes[biggest]) biggest = k;
    }

    var cleared = 0;
    for (var i = 0; i < total; i++) {
      if (label[i] >= 0 && label[i] !== biggest && data[i * 4 + 3] !== 0) {
        data[i * 4 + 3] = 0;
        cleared++;
      }
    }
    return cleared;
  }

  /* ---------------------------------------------------------- 매직툴 */

  /**
   * 매직툴 — 클릭한 지점과 색이 비슷한 픽셀을 골라낸다.
   *
   *  contiguous = true  : 클릭한 곳에서 이어진 영역만 (색이 끊기면 멈춤)
   *  contiguous = false : 이미지 전체에서 비슷한 색을 전부
   *
   * 지우지 않고 '선택'만 한다. 무엇이 지워질지 눈으로 확인한 뒤 지우는 것이
   * 안전하기 때문이다. 돌려주는 값은 선택된 픽셀을 표시한 마스크.
   */
  function magicSelect(imageData, x, y, tolerance, contiguous) {
    var data = imageData.data;
    var w = imageData.width;
    var h = imageData.height;
    var total = w * h;

    var mask = new Uint8Array(total);
    mask.count = 0;

    var sx = Math.round(x);
    var sy = Math.round(y);
    if (sx < 0 || sy < 0 || sx >= w || sy >= h) return mask;

    var seed = sy * w + sx;

    // 이미 투명한 곳은 선택 대상이 아니다
    if (data[seed * 4 + 3] === 0) return mask;

    var limit = limitFrom(tolerance);
    var ref = {
      r: data[seed * 4],
      g: data[seed * 4 + 1],
      b: data[seed * 4 + 2]
    };

    var similar = function (index) {
      var i = index * 4;
      if (data[i + 3] === 0) return false;
      return channelDistance(data[i], data[i + 1], data[i + 2], ref) <= limit;
    };

    var count = 0;

    if (!contiguous) {
      for (var k = 0; k < total; k++) {
        if (similar(k)) {
          mask[k] = 1;
          count++;
        }
      }
      mask.count = count;
      return mask;
    }

    // 이어진 영역만: 씨앗에서 시작해 비슷한 픽셀만 따라간다
    var stack = new Int32Array(total);
    var top = 0;

    mask[seed] = 1;
    stack[top++] = seed;

    while (top > 0) {
      var index = stack[--top];
      count++;

      var px = index % w;
      var py = (index - px) / w;

      if (px > 0 && !mask[index - 1] && similar(index - 1)) {
        mask[index - 1] = 1;
        stack[top++] = index - 1;
      }
      if (px < w - 1 && !mask[index + 1] && similar(index + 1)) {
        mask[index + 1] = 1;
        stack[top++] = index + 1;
      }
      if (py > 0 && !mask[index - w] && similar(index - w)) {
        mask[index - w] = 1;
        stack[top++] = index - w;
      }
      if (py < h - 1 && !mask[index + w] && similar(index + w)) {
        mask[index + w] = 1;
        stack[top++] = index + w;
      }
    }

    mask.count = count;
    return mask;
  }

  /** 두 선택을 합친다 (Shift 클릭으로 선택 추가) */
  function mergeMask(target, add) {
    var count = 0;

    for (var i = 0; i < target.length; i++) {
      if (add[i]) target[i] = 1;
      if (target[i]) count++;
    }

    target.count = count;
    return target;
  }

  /** 선택한 픽셀의 알파를 0으로 만든다 */
  function clearMask(imageData, mask) {
    var data = imageData.data;
    var cleared = 0;

    for (var i = 0; i < mask.length; i++) {
      if (!mask[i]) continue;
      if (data[i * 4 + 3] === 0) continue;
      data[i * 4 + 3] = 0;
      cleared++;
    }

    return cleared;
  }

  /**
   * 지운 자리의 가장자리를 부드럽게 한다 (매직툴은 경계가 각져 보이기 쉽다).
   * 선택 영역에 닿아 있는 바깥 픽셀만 반투명하게 만든다.
   */
  function softenMaskEdge(imageData, mask) {
    var data = imageData.data;
    var w = imageData.width;
    var h = imageData.height;

    for (var y = 1; y < h - 1; y++) {
      for (var x = 1; x < w - 1; x++) {
        var index = y * w + x;
        if (mask[index]) continue;
        if (data[index * 4 + 3] === 0) continue;

        var touches = mask[index - 1] || mask[index + 1] ||
          mask[index - w] || mask[index + w];

        if (touches) data[index * 4 + 3] = Math.min(data[index * 4 + 3], 120);
      }
    }
  }

  /* -------------------------------------------------------- 선택 브러시 */

  /**
   * 붓으로 선택에 더하거나 뺀다 (포토샵 '퀵 셀렉트' 방식).
   *
   * 붓 안을 무조건 칠하지 않고 **붓 중심의 색과 비슷한 픽셀만** 고른다.
   * 그래서 배경 위를 문지르면 배경만 따라 붙고 인물은 넘어간다.
   * 감도를 올리면 붓 안을 통째로 고르는 것과 같아진다.
   *
   * subtract 가 true 면 선택에서 뺀다.
   */
  function brushSelect(mask, imageData, x, y, radius, tolerance, subtract) {
    var data = imageData.data;
    var w = imageData.width;
    var h = imageData.height;

    var cx = Math.round(x);
    var cy = Math.round(y);
    var r = Math.max(1, Math.round(radius / 2));

    var seedX = Math.min(w - 1, Math.max(0, cx));
    var seedY = Math.min(h - 1, Math.max(0, cy));
    var seed = seedY * w + seedX;

    // 투명한 곳에서는 붓이 먹지 않는다
    if (data[seed * 4 + 3] === 0) return 0;

    var limit = limitFrom(tolerance);
    var ref = {
      r: data[seed * 4],
      g: data[seed * 4 + 1],
      b: data[seed * 4 + 2]
    };

    var minX = Math.max(0, cx - r);
    var maxX = Math.min(w - 1, cx + r);
    var minY = Math.max(0, cy - r);
    var maxY = Math.min(h - 1, cy + r);
    var r2 = r * r;

    var changed = 0;

    for (var py = minY; py <= maxY; py++) {
      var dy = py - cy;

      for (var px = minX; px <= maxX; px++) {
        var dx = px - cx;
        if (dx * dx + dy * dy > r2) continue;

        var index = py * w + px;
        var at = index * 4;
        if (data[at + 3] === 0) continue;
        if (channelDistance(data[at], data[at + 1], data[at + 2], ref) > limit) continue;

        if (subtract) {
          if (mask[index]) {
            mask[index] = 0;
            changed--;
          }
        } else if (!mask[index]) {
          mask[index] = 1;
          changed++;
        }
      }
    }

    mask.count = Math.max(0, (mask.count || 0) + changed);
    return changed;
  }

  /** 선택을 뒤집는다 (배경을 고른 뒤 반전하면 인물만 남는다) */
  function invertMask(mask, imageData) {
    var data = imageData.data;
    var out = new Uint8Array(mask.length);
    var count = 0;

    for (var i = 0; i < mask.length; i++) {
      // 이미 투명한 곳은 선택할 수 없다
      if (data[i * 4 + 3] === 0) continue;
      if (!mask[i]) {
        out[i] = 1;
        count++;
      }
    }

    out.count = count;
    return out;
  }

  /* ------------------------------------------------------ 선택 다듬기 */

  /**
   * 0/1 마스크를 0~255 '덮인 정도'로 부드럽게 만든다 (박스 블러, 가로·세로 2패스).
   *
   * 페더(경계 부드럽게)와 확장/축소의 바탕이 된다.
   * 경계 부근에서 0 과 255 사이의 값이 나오고, 그 값을 그대로 알파에 곱하면
   * 계단 없이 사라지는 가장자리가 만들어진다.
   */
  function blurMask(mask, w, h, radius) {
    var r = Math.max(1, Math.round(radius));
    var tmp = new Float32Array(w * h);
    var out = new Uint8Array(w * h);

    var x, y, k, at, sum, count, row;

    // 가로
    for (y = 0; y < h; y++) {
      row = y * w;
      for (x = 0; x < w; x++) {
        sum = 0;
        count = 0;
        for (k = -r; k <= r; k++) {
          at = x + k;
          if (at < 0 || at >= w) continue;
          sum += mask[row + at] ? 255 : 0;
          count++;
        }
        tmp[row + x] = sum / count;
      }
    }

    // 세로
    for (x = 0; x < w; x++) {
      for (y = 0; y < h; y++) {
        sum = 0;
        count = 0;
        for (k = -r; k <= r; k++) {
          at = y + k;
          if (at < 0 || at >= h) continue;
          sum += tmp[at * w + x];
          count++;
        }
        var v = Math.round(sum / count);
        out[y * w + x] = v < 0 ? 0 : (v > 255 ? 255 : v);
      }
    }

    return out;
  }

  /**
   * 커버리지를 기준값으로 잘라 선택을 넓히거나 좁힌다.
   * 낮게 자르면 번진 부분까지 포함되어 **확장**, 높게 자르면 **축소**된다.
   */
  function thresholdMask(soft, level) {
    var out = new Uint8Array(soft.length);
    var count = 0;

    for (var i = 0; i < soft.length; i++) {
      if (soft[i] >= level) {
        out[i] = 1;
        count++;
      }
    }

    out.count = count;
    return out;
  }

  /**
   * 덮인 정도만큼 알파를 깎는다.
   * 255면 완전히 지우고, 128이면 반투명, 0이면 그대로 둔다.
   * → 페더(부드러운 경계)가 이렇게 만들어진다.
   */
  function fadeMask(imageData, soft) {
    var data = imageData.data;
    var changed = 0;

    for (var i = 0; i < soft.length; i++) {
      var cover = soft[i];
      if (!cover) continue;

      var at = i * 4 + 3;
      if (!data[at]) continue;

      var next = Math.round(data[at] * (1 - cover / 255));
      if (next !== data[at]) {
        data[at] = next;
        changed++;
      }
    }

    return changed;
  }

  /* ---------------------------------------------------- 머리카락 매팅 */

  /** 한 줄을 굴리는 창(running window)으로 평균 낸다 — 가장자리는 잘라 낸다 */
  function boxPass(src, dst, w, h, r, horizontal) {
    var outer = horizontal ? h : w;
    var inner = horizontal ? w : h;
    var step = horizontal ? 1 : w;
    var lineStep = horizontal ? w : 1;

    var o, i, at, s0, s1, s2, s3, count;

    for (o = 0; o < outer; o++) {
      var base = o * lineStep;
      s0 = s1 = s2 = s3 = 0;
      count = 0;

      for (i = 0; i <= r && i < inner; i++) {
        at = base + i * step;
        s0 += src[at * 4];
        s1 += src[at * 4 + 1];
        s2 += src[at * 4 + 2];
        s3 += src[at * 4 + 3];
        count++;
      }

      for (i = 0; i < inner; i++) {
        at = base + i * step;
        dst[at * 4] = s0 / count;
        dst[at * 4 + 1] = s1 / count;
        dst[at * 4 + 2] = s2 / count;
        dst[at * 4 + 3] = s3 / count;

        var add = i + r + 1;
        if (add < inner) {
          var pa = base + add * step;
          s0 += src[pa * 4];
          s1 += src[pa * 4 + 1];
          s2 += src[pa * 4 + 2];
          s3 += src[pa * 4 + 3];
          count++;
        }

        var drop = i - r;
        if (drop >= 0) {
          var pd = base + drop * step;
          s0 -= src[pd * 4];
          s1 -= src[pd * 4 + 1];
          s2 -= src[pd * 4 + 2];
          s3 -= src[pd * 4 + 3];
          count--;
        }
      }
    }
  }

  /**
   * 박스 블러를 여러 번 겹쳐 가우시안에 가깝게 만든다 (가로 → 세로 → 반복).
   * 배경 흐림에 쓴다. 브라우저의 canvas filter 에 기대지 않아 어디서나 같게 나온다.
   */
  function blurRGBA(src, w, h, radius, passes) {
    var n = w * h;
    var a = new Float32Array(n * 4);
    var b = new Float32Array(n * 4);
    var i;

    for (i = 0; i < n * 4; i++) a[i] = src[i];

    var rounds = Math.max(1, passes || 3);
    var r = Math.max(1, Math.round(radius / rounds));

    for (i = 0; i < rounds; i++) {
      boxPass(a, b, w, h, r, true);
      boxPass(b, a, w, h, r, false);
    }

    var out = new Uint8ClampedArray(n * 4);
    for (i = 0; i < n * 4; i++) out[i] = a[i];
    return out;
  }

  /** (x,y) 주변에서 mask 값이 want 인 픽셀들의 평균색. 너무 적으면 null */
  function sampleMean(data, mask, w, h, x, y, win, want) {
    var x0 = Math.max(0, x - win);
    var x1 = Math.min(w - 1, x + win);
    var y0 = Math.max(0, y - win);
    var y1 = Math.min(h - 1, y + win);

    var rs = 0, gs = 0, bs = 0, n = 0;

    for (var yy = y0; yy <= y1; yy++) {
      for (var xx = x0; xx <= x1; xx++) {
        var i = yy * w + xx;
        if (data[i * 4 + 3] === 0) continue;
        if ((mask[i] ? 1 : 0) !== want) continue;
        rs += data[i * 4];
        gs += data[i * 4 + 1];
        bs += data[i * 4 + 2];
        n++;
      }
    }

    if (n < 4) return null;
    return { r: rs / n, g: gs / n, b: bs / n };
  }

  /**
   * 알파 매팅 — 지운 자리의 **머리카락 한 올까지 살린다**.
   *
   * 단단히 자르면 경계가 칼로 자른 듯하고, 남은 픽셀에 배경색이 묻어 테두리가 뜬다.
   * 여기서는 경계 픽셀 하나하나를 **전경색과 배경색의 혼합**으로 보고
   * ① 섞인 비율(알파)을 계산해 투명도로 쓰고
   * ② 묻은 배경색을 걷어낸다(디컨태미네이션).
   *
   * 그래서 잔머리와 반투명한 가장자리가 자연스럽게 남는다.
   */
  function matteEdge(imageData, mask, w, h, radius, strength) {
    var data = imageData.data;

    // 표본(전경색·배경색)은 **항상 원본에서** 읽는다.
    // 결과를 data 에 바로 쓰기 때문에, 제자리에서 읽으면 앞서 지워진 픽셀이
    // 표본에서 빠지고 이미 보정된 색이 섞여 값이 한쪽으로 쏠린다.
    var ref = new Uint8ClampedArray(data);

    var soft = blurMask(mask, w, h, radius);
    var win = Math.max(2, Math.round(radius));
    var k = strength == null ? 1 : strength;
    var touched = 0;

    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var i = y * w + x;
        var at = i * 4;

        if (data[at + 3] === 0) continue;

        var cover = soft[i];
        if (cover === 0) continue;

        // 확실한 배경은 그냥 지운다
        if (cover >= 250) {
          data[at + 3] = 0;
          touched++;
          continue;
        }

        // 확실한 전경은 건드리지 않는다
        if (cover <= 5) continue;

        // 살릴 것(전경)과 지울 것(배경)의 색을 주변에서 구한다 (원본 기준)
        var F = sampleMean(ref, mask, w, h, x, y, win, 0);
        var B = sampleMean(ref, mask, w, h, x, y, win, 1);

        var alpha;

        if (F && B) {
          var fr = F.r - B.r;
          var fg = F.g - B.g;
          var fb = F.b - B.b;
          var denom = fr * fr + fg * fg + fb * fb;

          if (denom >= 900) {
            // 픽셀을 배경색→전경색 선분에 투영해 섞인 비율을 구한다
            var pr = data[at] - B.r;
            var pg = data[at + 1] - B.g;
            var pb = data[at + 2] - B.b;

            alpha = (pr * fr + pg * fg + pb * fb) / denom;
            alpha = alpha < 0 ? 0 : (alpha > 1 ? 1 : alpha);

            // 묻은 배경색을 걷어낸다
            if (alpha > 0.15) {
              var r = (data[at] - (1 - alpha) * B.r) / alpha;
              var g = (data[at + 1] - (1 - alpha) * B.g) / alpha;
              var b = (data[at + 2] - (1 - alpha) * B.b) / alpha;
              data[at] = r < 0 ? 0 : (r > 255 ? 255 : r);
              data[at + 1] = g < 0 ? 0 : (g > 255 ? 255 : g);
              data[at + 2] = b < 0 ? 0 : (b > 255 ? 255 : b);
            }
          } else {
            // 전경과 배경이 너무 비슷해 판단할 수 없다 — 덮인 정도로 대신한다
            alpha = 1 - cover / 255;
          }
        } else {
          alpha = 1 - cover / 255;
        }

        alpha = alpha * k + (1 - cover / 255) * (1 - k);

        var next = data[at + 3] * alpha;
        data[at + 3] = next < 0 ? 0 : (next > 255 ? 255 : next);
        touched++;
      }
    }

    return touched;
  }

  /* -------------------------------------------------------- 배경 흐림 */

  /**
   * 고른 영역만 흐리게 만든다 (아웃포커스).
   * 경계는 부드럽게 섞어 흐린 자리와 선명한 자리가 어긋나 보이지 않게 한다.
   */
  function blurMasked(imageData, mask, w, h, radius, feather) {
    var data = imageData.data;
    var featherPx = Math.max(2, Math.round(feather > 0 ? feather : radius / 2));
    var cover = blurMask(mask, w, h, featherPx);
    var blurred = blurRGBA(data, w, h, radius, 3);
    var changed = 0;

    for (var i = 0; i < w * h; i++) {
      var c = cover[i] / 255;
      if (c <= 0) continue;

      var at = i * 4;
      if (data[at + 3] === 0) continue;

      data[at] = data[at] * (1 - c) + blurred[at] * c;
      data[at + 1] = data[at + 1] * (1 - c) + blurred[at + 1] * c;
      data[at + 2] = data[at + 2] * (1 - c) + blurred[at + 2] * c;
      changed++;
    }

    return changed;
  }

  IE.cutout = {
    // 감도
    limitFrom: limitFrom,

    // 자동 제거
    autoRemove: autoRemove,
    keepLargestComponent: keepLargestComponent,
    sampleBackgrounds: sampleBackgrounds,
    sampleBackground: sampleBackground,

    // 매직툴
    magicSelect: magicSelect,
    mergeMask: mergeMask,
    clearMask: clearMask,
    softenMaskEdge: softenMaskEdge,

    // 선택 브러시 · 다듬기
    brushSelect: brushSelect,
    invertMask: invertMask,
    blurMask: blurMask,
    thresholdMask: thresholdMask,
    fadeMask: fadeMask,

    // 머리카락 매팅 · 배경 흐림
    matteEdge: matteEdge,
    blurRGBA: blurRGBA,
    blurMasked: blurMasked
  };
})(window.IE);
