window.IE = window.IE || {};

(function (IE) {
  'use strict';

  /**
   * 오프라인 얼굴 검출.
   *
   * 세상에 나가 있는 얼굴 인식 서비스는 인터넷이 있어야 한다. 행정망에서는 쓸 수 없으므로
   * pico.js(5KB) + facefinder(230KB) 를 **배포 파일 안에 심어** 두고 여기서 돌린다.
   * 서버도, 인터넷도, 권한도 필요 없다.
   *
   * 사진 전체를 다 훑으면 느리므로 긴 변을 WORK_EDGE 로 줄여서 찾고,
   * 찾은 자리만 원본 좌표로 되돌려 준다.
   */

  /** 검출에 쓰는 작업 크기 — 이 정도면 충분하고 빠르다 */
  var WORK_EDGE = 340;

  /** 너무 작거나 큰 얼굴은 버린다 (작업 크기 기준) */
  var MIN_FACE = 34;

  var cascade = null;
  var state = 'idle';   // idle | ready | failed

  /* ------------------------------------------------------------ 준비 */

  function fromBase64(text) {
    var binary = atob(text);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  function prepare() {
    if (state === 'ready') return true;
    if (state === 'failed') return false;

    try {
      if (!window.pico || typeof window.pico.unpack_cascade !== 'function' || !IE.faceModel) {
        state = 'failed';
        return false;
      }

      cascade = window.pico.unpack_cascade(fromBase64(IE.faceModel));
      state = 'ready';
      return true;
    } catch (err) {
      state = 'failed';
      return false;
    }
  }

  /* ------------------------------------------------------- 회색조 만들기 */

  var work = null;

  function grayFrom(source, sw, sh, dw, dh) {
    if (!work || work.width !== dw || work.height !== dh) {
      work = document.createElement('canvas');
      work.width = dw;
      work.height = dh;
    }

    var ctx = work.getContext('2d');
    ctx.drawImage(source, 0, 0, sw, sh, 0, 0, dw, dh);

    var data = ctx.getImageData(0, 0, dw, dh).data;
    var pixels = new Uint8Array(dw * dh);

    // pico 는 한 줄에 ldim 칸씩, 위에서 아래로 읽는다
    for (var i = 0, p = 0; i < pixels.length; i++, p += 4) {
      pixels[i] = (data[p] * 299 + data[p + 1] * 587 + data[p + 2] * 114) / 1000;
    }

    return { pixels: pixels, nrows: dh, ncols: dw, ldim: dw };
  }

  /* ---------------------------------------------------------- 검출 */

  var empty = { found: false };

  /**
   * 얼굴 하나를 찾는다.
   * 돌려주는 좌표는 **원본 픽셀 기준**이다.
   */
  function detect(source, naturalW, naturalH) {
    if (!prepare() || !naturalW || !naturalH) return empty;

    var scale = Math.min(1, WORK_EDGE / Math.max(naturalW, naturalH));
    var dw = Math.max(24, Math.round(naturalW * scale));
    var dh = Math.max(24, Math.round(naturalH * scale));

    var image;
    try {
      image = grayFrom(source, naturalW, naturalH, dw, dh);
    } catch (err) {
      return empty;
    }

    var dets;
    try {
      dets = window.pico.run_cascade(image, cascade, {
        shiftfactor: 0.1,
        minsize: MIN_FACE,
        maxsize: Math.round(Math.min(dw, dh) * 0.95),
        scalefactor: 1.1
      });
      dets = window.pico.cluster_detections(dets, 0.2);
    } catch (err) {
      return empty;
    }

    if (!dets || !dets.length) return empty;

    // 가장 확실한 것 하나만 쓴다 (q 가 클수록 확실하다)
    var best = dets[0];
    for (var i = 1; i < dets.length; i++) {
      if (dets[i][3] > best[3]) best = dets[i];
    }

    // pico 는 [행, 열, 크기, 점수] 로 준다.
    // 여기서 (행, 열)은 **상자가 아니라 중심**이고 크기는 **지름**이다.
    // (pico 공식 예제도 arc(열, 행, 크기/2) 로 원을 그린다)
    var back = 1 / scale;
    var size = best[2] * back;
    var cx = best[1] * back;
    var cy = best[0] * back;

    var side = Math.max(8, Math.min(size, Math.min(naturalW, naturalH)));

    return {
      found: true,
      score: best[3],
      x: Math.max(0, Math.min(cx - side / 2, naturalW - side)),
      y: Math.max(0, Math.min(cy - side / 2, naturalH - side)),
      w: side,
      h: side,
      count: dets.length
    };
  }

  /**
   * 얼굴이 없을 때 쓸 자리.
   *
   * 사진 가운데 위쪽에 얼굴이 있다고 보고 상자를 만든다.
   * 검출이 안 되는 사진(옆모습·너무 작은 얼굴)에서도 프리셋이 완전히 엉뚱해지지 않게 한다.
   */
  function guess(w, h) {
    var fw = Math.min(0.42 * w, 0.58 * h);
    var fh = fw * 1.3;

    return {
      found: false,
      x: (w - fw) / 2,
      y: Math.max(0, 0.50 * h - fh * 0.56),
      w: fw,
      h: fh
    };
  }

  /** 얼굴 자리를 얻는다 — 못 찾으면 추정한 자리를 준다 */
  function locate(source, naturalW, naturalH) {
    var hit = detect(source, naturalW, naturalH);
    if (hit.found) return hit;
    return guess(naturalW, naturalH);
  }

  IE.facedet = {
    detect: detect,
    locate: locate,
    guess: guess,
    isReady: function () { return prepare(); }
  };
})(window.IE);
