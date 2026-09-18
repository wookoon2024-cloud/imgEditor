window.IE = window.IE || {};

(function (IE) {
  'use strict';

  var util = IE.util;

  /**
   * 이미지 편집 창 — 누끼(배경 제거)와 인물 보정을 한 곳에서.
   *
   * 예전에는 창이 두 개로 나뉘어 있어서, 누끼를 적용하고 나서 다시 보정 창을
   * 열어야 했다. 이제는 한 창 안에서 탭으로 오가며 작업하고 **마지막에 한 번만**
   * 적용한다. 되돌리기도 하나로 합쳐져 있어 Ctrl+Z 가 어느 탭에서든 통한다.
   *
   * 레이어가 셋이다.
   *   source : 손대지 않은 원본 (복원·비교용)
   *   base   : 누끼 결과 (알파 포함) — 누끼 도구가 직접 고친다
   *   work   : base 에 밝기·색·피부 보정을 입힌 것 (화면에 보이는 것)
   *
   * 그래서 파이프라인은  source -> [누끼 도구] -> base -> [성형·보정] -> work 다.
   */

  var MAX_EDGE = 1500;
  var HISTORY_LIMIT = 6;

  var state = null;

  function canvas2d(w, h) {
    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }

  /* ---------------------------------------------------------- 도구 정의 */

  var CUT_MODES = {
    magic: {
      label: '매직툴',
      hint: '지울 곳을 클릭하세요. 선택된 영역이 분홍색으로 표시됩니다. Shift+클릭으로 추가 선택.'
    },
    brush: {
      label: '선택 브러시',
      hint: '문질러서 선택에 더합니다. Alt 를 누르거나 오른쪽 버튼으로 문지르면 선택에서 뺍니다.'
    },
    erase: {
      label: '지우개',
      hint: '문질러서 지웁니다.'
    },
    restore: {
      label: '복원',
      hint: '지워진 곳을 원본 픽셀로 되살립니다.'
    }
  };

  var SCULPT_MODES = {
    push: { label: '밀기', hint: '끌어서 윤곽을 옮깁니다.' },
    pinch: { label: '턱 갸름', hint: '턱선을 따라 안쪽으로 문지르면 오므라듭니다.' },
    bulge: { label: '눈 키우기', hint: '눈 위에서 살짝 문지르면 커집니다.' },
    swirl: { label: '돌리기', hint: '문지르면 비틀립니다.' }
  };

  /** 자르기 비율 — 증명사진은 3.5×4.5cm 비율이다 */
  var CROP_RATIOS = [
    { id: 'free', label: '자유', ratio: null },
    { id: '1-1', label: '1 : 1', ratio: 1 },
    { id: '3-4', label: '3 : 4', ratio: 3 / 4 },
    { id: '4-3', label: '4 : 3', ratio: 4 / 3 },
    { id: '2-3', label: '2 : 3', ratio: 2 / 3 },
    { id: '3-2', label: '3 : 2', ratio: 3 / 2 },
    { id: '9-16', label: '9 : 16', ratio: 9 / 16 },
    { id: '16-9', label: '16 : 9', ratio: 16 / 9 },
    { id: 'id-photo', label: '증명 3.5×4.5', ratio: 3.5 / 4.5 },
    { id: 'half', label: '반명함 5:7', ratio: 5 / 7 }
  ];

  /** 인물 보정 프리셋 — 누르면 슬라이더가 이 값으로 바로 바뀐다 */
  var TONE_PRESETS = [
    {
      id: 'natural', label: '자연스럽게',
      tone: { brightness: 6, contrast: 10, saturation: 6, warmth: 4 }, smooth: 0, sharpen: 0
    },
    {
      id: 'bright', label: '밝고 화사',
      tone: { brightness: 24, contrast: 12, saturation: 12, warmth: 8 }, smooth: 10, sharpen: 0
    },
    {
      id: 'clear', label: '맑고 선명',
      tone: { brightness: 8, contrast: 20, saturation: 10, warmth: -2 }, smooth: 0, sharpen: 28
    },
    {
      id: 'soft', label: '부드럽게',
      tone: { brightness: 14, contrast: 6, saturation: 6, warmth: 6 }, smooth: 42, sharpen: 0
    },
    {
      id: 'id', label: '증명사진',
      tone: { brightness: 12, contrast: 16, saturation: 2, warmth: 0 }, smooth: 14, sharpen: 16
    },
    {
      id: 'warm', label: '따뜻하게',
      tone: { brightness: 8, contrast: 8, saturation: 10, warmth: 26 }, smooth: 0, sharpen: 0
    },
    {
      id: 'cool', label: '차분하게',
      tone: { brightness: 4, contrast: 12, saturation: 2, warmth: -22 }, smooth: 0, sharpen: 0
    },
    {
      id: 'mono', label: '흑백',
      tone: { brightness: 8, contrast: 18, saturation: 0, warmth: 0, gray: true },
      smooth: 0, sharpen: 12
    }
  ];

  /**
   * 얼굴 성형 프리셋 — 누르면 자동으로 적용된다.
   *
   * 좌표는 **얼굴 상자 기준**이다 (사진 전체 기준이 아니다).
   * 얼굴 상자는 오프라인 검출기(pico.js + facefinder)가 찾아 준다.
   * 못 찾으면 사진 가운데 위쪽에 있다고 추정한다.
   *
   * fx, fy : 얼굴 상자 안에서의 자리 (0~1)
   * fr     : 반지름 (얼굴 가로 길이에 대한 비율)
   * k      : 세기 — 클수록 많이 휜다
   *
   * 얼굴 상자는 이마부터 턱까지 덮으므로 눈은 위쪽 0.42, 턱은 아래쪽 0.95 즈음이다.
   */
  var FACE_PRESETS = [
    {
      id: 'jaw', label: '턱 갸름',
      ops: [{ mode: 'pinch', fx: 0.50, fy: 0.95, fr: 0.36, k: 0.38 }]
    },
    {
      id: 'jaw-soft', label: '턱 살짝',
      ops: [{ mode: 'pinch', fx: 0.50, fy: 0.91, fr: 0.28, k: 0.20 }]
    },
    {
      id: 'slim', label: '얼굴 갸름',
      ops: [{ mode: 'pinch', fx: 0.50, fy: 0.56, fr: 0.54, k: 0.26 }]
    },
    {
      id: 'eyes', label: '눈 키우기',
      ops: [
        { mode: 'bulge', fx: 0.31, fy: 0.42, fr: 0.17, k: 0.34 },
        { mode: 'bulge', fx: 0.69, fy: 0.42, fr: 0.17, k: 0.34 }
      ]
    },
    {
      id: 'cheek', label: '광대 정리',
      ops: [
        { mode: 'pinch', fx: 0.12, fy: 0.56, fr: 0.21, k: 0.28 },
        { mode: 'pinch', fx: 0.88, fy: 0.56, fr: 0.21, k: 0.28 }
      ]
    },
    {
      id: 'vivid', label: '또렷하게',
      ops: [
        { mode: 'bulge', fx: 0.50, fy: 0.45, fr: 0.32, k: 0.22 },
        { mode: 'pinch', fx: 0.50, fy: 0.99, fr: 0.32, k: 0.20 }
      ]
    }
  ];

  /** 미리보기 카드의 고정 크기 — 어느 사진이든 카드가 똑같이 보이도록 */
  var PREVIEW_W = 84;
  var PREVIEW_H = 63;

  /* -------------------------------------------------------------- 열기 */

  function open(img, tab) {
    if (!img || img.kind !== 'image') return false;

    var source = img.getElement ? img.getElement() : img._element;
    if (!source) {
      util.toast('이미지를 읽을 수 없습니다.');
      return false;
    }

    var naturalW = source.naturalWidth || source.width;
    var naturalH = source.naturalHeight || source.height;
    if (!naturalW || !naturalH) {
      util.toast('이미지를 읽을 수 없습니다.');
      return false;
    }

    var fit = IE.enhance.fitSize(naturalW, naturalH, MAX_EDGE);
    var w = fit.width;
    var h = fit.height;

    var sourceCanvas = canvas2d(w, h);
    sourceCanvas.getContext('2d').drawImage(source, 0, 0, w, h);

    var base = canvas2d(w, h);
    base.getContext('2d').drawImage(sourceCanvas, 0, 0);

    var work = util.$('image-canvas');
    work.width = w;
    work.height = h;

    state = {
      img: img,
      source: sourceCanvas,
      base: base,
      work: work,
      size: { w: w, h: h },
      natural: { w: naturalW, h: naturalH },

      // 얼굴 자리 — 성형 프리셋이 여기를 기준으로 움직인다 (없으면 추정한 자리)
      face: IE.facedet.locate(base, w, h),

      tab: tab || 'cutout',

      mode: null,
      brushSize: Math.max(16, Math.round(Math.max(w, h) * 0.05)),
      tolerance: 22,
      magicTolerance: 24,
      magicContiguous: true,
      tidy: false,
      selection: null,
      selectionFeather: 0,
      blurStrength: 10,
      selVersion: 0,
      brushSubtract: false,
      brushData: null,

      // 자르기가 크기를 바꾸므로, '원본으로' 용 원본은 크기까지 따로 보관한다
      origin: sourceCanvas,
      originSize: { w: w, h: h },

      params: { brightness: 0, contrast: 0, saturation: 0, warmth: 0, gray: false, vignette: 0 },
      smooth: 0,
      sharpen: 0,
      preset: null,
      healOn: false,
      healSize: Math.max(12, Math.round(Math.min(w, h) * 0.045)),
      healSrc: null,
      crop: null,
      blurred: null,
      mask: null,
      cacheReady: false,

      sculpt: null,
      sculptSize: Math.max(24, Math.round(Math.max(w, h) * 0.12)),
      sculptIntensity: 45,

      history: [],
      painting: false,
      dirty: false,
      showOriginal: false,
      zoom: 1
    };

    util.$('modal-image').hidden = false;

    var s = state;

    if (s.tab === 'retouch') renderAllPresets();

    renderCropRatios();
    syncTabs();
    syncControls();
    syncCropBox();
    fitView();
    refreshWork();
    refreshAll();
    hideBrush();
    updateBrushCursor();
    updateInfo('작업할 도구를 선택하세요.');

    return true;
  }

  function close(apply) {
    var s = state;
    if (!s) return;

    if (apply && s.dirty) {
      // 선택 표시(분홍색)나 자르기 미리보기가 결과에 구워지지 않도록
      // 화면을 '있는 그대로의 결과'로 되돌린 뒤 저장한다
      var wasOriginal = s.showOriginal;
      s.showOriginal = false;
      s.selection = null;
      s.crop = null;
      s.tab = 'cutout';
      overlayCache = null;
      refreshWork();
      if (wasOriginal) s.showOriginal = true;

      IE.canvas.setImageSource(s.img, s.work.toDataURL('image/png'));
      util.toast('이미지를 편집했습니다.');
    }

    state = null;
    util.$('modal-image').hidden = true;
    hideBrush();
  }

  /* ------------------------------------------------------------ 탭 */

  function setTab(tab) {
    var s = state;
    if (!s) return;

    s.tab = (tab === 'retouch' || tab === 'crop') ? tab : 'cutout';

    if (s.tab === 'crop') {
      fitView();
      syncCropBox();
    } else if (s.crop) {
      // 자르지 않고 탭만 옮기면 미리보기만 버린다 (사진은 그대로)
      s.crop = null;
      fitView();
      syncCropBox();
    }

    syncTabs();
    syncControls();

    if (s.tab === 'cutout') {
      updateInfo(s.mode && CUT_MODES[s.mode]
        ? (CUT_MODES[s.mode].hint + (s.selection ? ' · ' + selectionText() : ''))
        : '도구를 선택하세요 (매직툴, 선택 브러시, 지우개, 복원).');
    } else if (s.tab === 'retouch') {
      renderAllPresets();
      updateInfo(s.healOn
        ? '점·흉터를 클릭하거나 문질러 지우세요. 주변 피부 조각으로 덮습니다.'
        : (s.sculpt && SCULPT_MODES[s.sculpt]
            ? SCULPT_MODES[s.sculpt].hint
            : '얼굴 성형 도구(밀기·턱 갸름 등) 또는 잡티 제거를 선택하세요.'));
    } else {
      updateInfo(s.crop
        ? '자를 영역을 끌어 옮기고, 모서리 손잡이로 크기를 바꾸세요. [이 영역으로 자르기] 를 눌러야 확정됩니다.'
        : '자를 비율(자유, 1:1, 3:4 등)을 선택하거나 사진 위를 끌어 자를 영역을 정하세요.');
    }

    refreshAll();
    updateBrushCursor();
  }

  function syncTabs() {
    var s = state;
    if (!s) return;

    Array.prototype.forEach.call(
      document.querySelectorAll('#image-tabs [data-image-tab]'),
      function (button) {
        button.classList.toggle(
          'is-active',
          button.getAttribute('data-image-tab') === s.tab
        );
      }
    );

    ['cutout', 'retouch', 'crop'].forEach(function (key) {
      var el = util.$('image-pane-' + key);
      if (!el) return;

      el.hidden = s.tab !== key;

      // 보이는 칸의 버튼만 잰다 — 숨은 칸은 폭이 0 이라 잘못 판단한다
      if (!el.hidden) {
        util.watchFit(el);
        util.refitButtonsSoon(el);
      }
    });

    var overlay = util.$('image-crop');
    if (overlay) overlay.hidden = s.tab !== 'crop';

    updateNowBar();
  }

  /* ------------------------------------------------------- 파이프라인 */

  function invalidateCache() {
    if (state) state.cacheReady = false;
  }

  function ensureCache() {
    var s = state;
    if (!s || s.cacheReady) return;

    var img = s.base.getContext('2d').getImageData(0, 0, s.size.w, s.size.h);
    var radius = Math.max(1, Math.round(Math.min(s.size.w, s.size.h) / 150));

    s.blurred = IE.enhance.blurRGB(img, radius);
    s.mask = IE.enhance.skinMask(img, 3);
    s.cacheReady = true;
  }

  /** 지금 화면에 보이는 그림의 크기 — 자르기 중에는 회전본이라 크기가 다르다 */
  function viewSize() {
    var s = state;
    if (s.tab === 'crop' && s.crop) return s.crop.txSize;
    return s.size;
  }

  /** base -> (밝기·색·비네트) -> (피부·선명) -> work  /  '원본 비교' 중이면 원본을 그린다 */
  function refreshWork() {
    var s = state;
    if (!s) return;

    if (s.tab === 'crop') {
      refreshCropView();
      return;
    }

    var ctx = s.work.getContext('2d');
    if (s.work.width !== s.size.w || s.work.height !== s.size.h) {
      s.work.width = s.size.w;
      s.work.height = s.size.h;
    }

    ctx.clearRect(0, 0, s.size.w, s.size.h);

    if (s.showOriginal) {
      ctx.drawImage(s.source, 0, 0, s.size.w, s.size.h);
      return;
    }

    ctx.drawImage(s.base, 0, 0);
    applyTone(ctx, s.size.w, s.size.h, true);
  }

  /** 자르기 탭의 미리보기 — 회전·기울기·뒤집기가 적용된 그림을 그린다 */
  function refreshCropView() {
    var s = state;
    var c = s.crop;
    if (!c) return;

    if (!c.tx) rebuildCropSource();

    var t = c.txSize;
    var ctx = s.work.getContext('2d');
    if (s.work.width !== t.w || s.work.height !== t.h) {
      s.work.width = t.w;
      s.work.height = t.h;
    }

    ctx.clearRect(0, 0, t.w, t.h);
    ctx.drawImage(c.tx, 0, 0);
    applyTone(ctx, t.w, t.h, false);
  }

  /**
   * 캔버스에 밝기·색·비네트·피부 보정을 입힌다.
   * cached 를 켜면 흐린본·피부마스크를 재사용한다 (슬라이더를 끌 때 매번 계산하지 않도록).
   */
  function applyTone(ctx, w, h, cached) {
    var s = state;

    var needsTone = s.params.brightness || s.params.contrast ||
      s.params.saturation || s.params.warmth || s.params.gray;
    var needsVignette = s.params.vignette > 0;
    var needsDetail = s.smooth > 0 || s.sharpen > 0;

    if (!needsTone && !needsVignette && !needsDetail) return;

    var img = ctx.getImageData(0, 0, w, h);

    if (needsTone) IE.enhance.applyTone(img, s.params);
    if (needsVignette) IE.enhance.applyVignette(img, s.params.vignette);

    if (needsDetail) {
      var blurred;
      var mask;

      if (cached) {
        ensureCache();
        blurred = s.blurred;
        mask = s.mask;
      } else {
        var radius = Math.max(1, Math.round(Math.min(w, h) / 150));
        blurred = IE.enhance.blurRGB(img, radius);
        mask = IE.enhance.skinMask(img, 3);
      }

      IE.enhance.applyDetail(img, blurred, mask, s.smooth, s.sharpen);
    }

    ctx.putImageData(img, 0, 0);
  }

  /**
   * 화면 갱신 = refreshWork + (선택 표시 덧그리기).
   *
   * 선택 표시는 work 위에 '덧그리는' 것이라, 그대로 내보내면 분홍색이 함께
   * 저장된다. 그래서 적용 직전에는 반드시 refreshWork 만 다시 부른다.
   */
  function refreshAll() {
    var s = state;
    if (!s) return;

    refreshWork();

    if (s.showOriginal || !s.selection) return;

    var overlay = selectionOverlay();
    if (overlay) s.work.getContext('2d').drawImage(overlay, 0, 0);
  }

  var refreshSoon = util.debounce(function () {
    if (state) refreshAll();
  }, 90);

  /* -------------------------------------------------------- 화면 그리기 */

  function fitView() {
    var s = state;
    if (!s) return;

    var stage = util.$('image-stage');
    if (!stage) return;

    var availW = Math.max(120, stage.clientWidth - 24);
    var availH = Math.max(120, stage.clientHeight - 24);
    var size = viewSize();
    var zoom = Math.min(availW / size.w, availH / size.h, 4);

    s.zoom = zoom;
    s.work.style.width = Math.round(size.w * zoom) + 'px';
    s.work.style.height = Math.round(size.h * zoom) + 'px';
  }

  /**
   * 선택 영역을 분홍색으로 칠한 그림을 만든다.
   * 선택이 바뀔 때만 다시 만든다 (전체 픽셀을 훑기 때문).
   */
  var overlayCache = null;

  function selectionOverlay() {
    var s = state;
    if (!s || !s.selection || !s.selection.count) {
      overlayCache = null;
      return null;
    }

    // 붓으로 문지르는 동안에는 페더를 계산하지 않는다 (매 움직임마다 전체를
    // 훑으면 무거워진다). 손을 떼면 페더가 반영된 모습을 보여 준다.
    var useFeather = s.selectionFeather > 0 && !s.painting;

    if (overlayCache &&
        overlayCache.version === s.selVersion &&
        overlayCache.feather === (useFeather ? s.selectionFeather : 0)) {
      return overlayCache.canvas;
    }

    var soft = useFeather
      ? IE.cutout.blurMask(s.selection, s.size.w, s.size.h, s.selectionFeather)
      : null;

    var canvas = canvas2d(s.size.w, s.size.h);
    var ctx = canvas.getContext('2d');
    var data = ctx.createImageData(s.size.w, s.size.h);
    var px = data.data;
    var mask = s.selection;

    for (var i = 0; i < mask.length; i++) {
      var cover = soft ? soft[i] : (mask[i] ? 255 : 0);
      if (!cover) continue;

      var at = i * 4;
      px[at] = 255;
      px[at + 1] = 40;
      px[at + 2] = 130;
      px[at + 3] = Math.round(cover * 0.5);
    }

    ctx.putImageData(data, 0, 0);
    overlayCache = {
      version: s.selVersion,
      feather: useFeather ? s.selectionFeather : 0,
      canvas: canvas
    };

    return canvas;
  }

  /* ------------------------------------------------------- 되돌리기 */

  function snapshot() {
    var s = state;
    if (!s) return;

    try {
      s.history.push({
        base: s.base.getContext('2d').getImageData(0, 0, s.size.w, s.size.h),
        // 자르기는 크기까지 바꾸므로 size 와 원본도 함께 기억한다.
        // source 는 어디서도 제자리에서 고치지 않으므로 참조만 들고 있어도 안전하다.
        size: { w: s.size.w, h: s.size.h },
        source: s.source,
        params: {
          brightness: s.params.brightness,
          contrast: s.params.contrast,
          saturation: s.params.saturation,
          warmth: s.params.warmth,
          gray: s.params.gray,
          vignette: s.params.vignette
        },
        smooth: s.smooth,
        sharpen: s.sharpen,
        preset: s.preset,
        label: s.tab
      });
    } catch (err) {
      // 용량 초과는 무시
    }

    if (s.history.length > HISTORY_LIMIT) s.history.shift();
  }

  function undo() {
    var s = state;
    if (!s) return;

    if (!s.history.length) {
      util.toast('되돌릴 단계가 없습니다.');
      return;
    }

    var previous = s.history.pop();

    // 자르기를 되돌리면 크기와 원본도 함께 돌아가야 한다
    if (previous.size && (previous.size.w !== s.size.w || previous.size.h !== s.size.h)) {
      s.size = { w: previous.size.w, h: previous.size.h };
      s.base = canvas2d(s.size.w, s.size.h);
      if (previous.source) s.source = previous.source;
      s.crop = null;
    }

    s.base.getContext('2d').putImageData(previous.base, 0, 0);
    s.params = previous.params;
    s.smooth = previous.smooth;
    s.sharpen = previous.sharpen;
    s.preset = previous.preset || null;
    s.showOriginal = false;

    s.dirty = true;
    clearSelection(true);
    invalidateCache();
    fitView();
    refreshWork();
    refreshAll();
    syncControls();
    renderAllPresets();
    updateInfo('한 단계 되돌렸습니다.');
  }

  function resetAll() {
    var s = state;
    if (!s) return;

    snapshot();

    // 자르기까지 되돌려 처음 크기로 돌아간다
    s.size = { w: s.originSize.w, h: s.originSize.h };
    s.source = copyCanvas(s.origin);
    s.base = copyCanvas(s.origin);
    s.crop = null;

    // 크기가 돌아왔으니 얼굴 자리도 처음 것으로
    s.face = IE.facedet.locate(s.base, s.size.w, s.size.h);

    s.params = { brightness: 0, contrast: 0, saturation: 0, warmth: 0, gray: false, vignette: 0 };
    s.smooth = 0;
    s.sharpen = 0;
    s.preset = null;
    s.showOriginal = false;
    s.dirty = true;

    clearSelection(true);
    invalidateCache();
    fitView();
    refreshWork();
    refreshAll();
    syncControls();
    renderAllPresets();
    updateInfo('처음 상태로 되돌렸습니다.');
  }

  /* ---------------------------------------------------------- 브러시 */

  function activeBrushSize() {
    var s = state;
    if (!s) return 0;
    if (s.tab === 'cutout') return s.brushSize;
    return s.healOn ? s.healSize : s.sculptSize;
  }

  function brushLabel() {
    var s = state;
    if (!s) return '';
    if (s.tab === 'cutout') return (s.mode && CUT_MODES[s.mode]) ? CUT_MODES[s.mode].label : '';
    return s.healOn ? '잡티 제거' : (s.sculpt && SCULPT_MODES[s.sculpt] ? SCULPT_MODES[s.sculpt].label : '');
  }

  /** 지금 도구가 브러시(원형 커서)를 쓰는지 */
  function usesBrush() {
    var s = state;
    if (!s) return false;
    if (s.tab === 'crop') return false;
    if (s.tab === 'cutout') {
      return s.mode === 'brush' || s.mode === 'erase' || s.mode === 'restore';
    }
    if (s.tab === 'retouch') {
      return !!s.healOn || !!s.sculpt;
    }
    return false;
  }

  function showBrush(clientX, clientY) {
    var s = state;
    var ring = util.$('image-brush');
    var view = util.$('image-canvas');
    if (!s || !ring || !view) return;

    if (!usesBrush()) {
      hideBrush();
      return;
    }

    var rect = view.getBoundingClientRect();
    var x = clientX - rect.left;
    var y = clientY - rect.top;

    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      hideBrush();
      return;
    }

    var size = Math.max(6, activeBrushSize() * s.zoom);

    ring.hidden = false;
    ring.style.width = Math.round(size) + 'px';
    ring.style.height = Math.round(size) + 'px';
    ring.style.left = Math.round(x - size / 2) + 'px';
    ring.style.top = Math.round(y - size / 2) + 'px';
    ring.className = 'image-brush' + (s.painting ? ' is-painting' : '');
  }

  function hideBrush() {
    var ring = util.$('image-brush');
    if (ring) ring.hidden = true;
  }

  /** 탭·도구가 바뀌면 커서 모양을 다시 정한다 */
  function updateBrushCursor() {
    var s = state;
    var view = util.$('image-canvas');
    if (!s || !view) return;

    if (s.tab === 'crop') {
      view.style.cursor = 'default';
      hideBrush();
      return;
    }

    if (s.tab === 'cutout') {
      if (!s.mode) {
        view.style.cursor = 'default';
        hideBrush();
        return;
      }
      view.style.cursor = 'crosshair';
      if (!usesBrush()) hideBrush();
      return;
    }

    if (s.tab === 'retouch') {
      if (!s.healOn && !s.sculpt) {
        view.style.cursor = 'default';
        hideBrush();
        return;
      }
      view.style.cursor = 'crosshair';
      if (!usesBrush()) hideBrush();
      return;
    }

    view.style.cursor = 'default';
    if (!usesBrush()) hideBrush();
  }

  /* ------------------------------------------------------ 누끼 도구 */

  function paint(x, y) {
    var s = state;
    if (!s) return;

    var radius = s.brushSize / 2;
    var ctx = s.base.getContext('2d');

    ctx.save();

    if (s.mode === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,1)';
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      // 복원: 원본 픽셀을 그 자리에 다시 그린다
      ctx.globalCompositeOperation = 'source-over';
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(s.source, 0, 0, s.size.w, s.size.h, 0, 0, s.size.w, s.size.h);
      ctx.restore();
    }
  }

  function runAuto() {
    var s = state;
    if (!s) return;

    snapshot();

    var ctx = s.base.getContext('2d');
    var imageData = ctx.getImageData(0, 0, s.size.w, s.size.h);
    var result = IE.cutout.autoRemove(imageData, s.tolerance);

    if (!result.removed) {
      util.toast('지울 배경을 찾지 못했습니다. 감도를 올려 보세요.');
      updateInfo('배경을 찾지 못했습니다. 감도를 올려 보세요.');
      return;
    }

    var percent = Math.round((result.removed / result.total) * 100);

    // 거의 다 지워졌다면(피사체 침범) 적용하지 않고 알려 준다.
    // 배경이 넓은 인물 사진도 90% 안팎까지는 정상이므로 아주 높게 잡는다.
    if (percent > 95) {
      util.toast('배경이 ' + percent + '% 지워졌습니다. 피사체까지 지워진 것 같아 되돌렸습니다. 감도를 낮춰 보세요.');
      updateInfo('배경 ' + percent + '% — 피사체까지 지워져 되돌렸습니다. 감도를 낮춰 다시 시도하세요.');
      s.history.pop();
      return;
    }

    if (s.tidy) {
      var cleared = IE.cutout.keepLargestComponent(imageData);
      if (cleared) percent = Math.round(((result.removed + cleared) / result.total) * 100);
    }

    ctx.putImageData(imageData, 0, 0);

    s.dirty = true;
    invalidateCache();
    refreshWork();
    refreshAll();
    updateInfo('배경 ' + percent + '% 를 지웠습니다. 남은 부분은 지우개로 다듬으세요.');
  }

  function selectionText() {
    var s = state;
    if (!s || !s.selection) return '';
    var count = s.selection.count || 0;
    var percent = Math.round((count / (s.size.w * s.size.h)) * 100);
    return '선택 ' + count.toLocaleString() + '픽셀 (' + percent + '%)';
  }

  function emptyMask(s) {
    var mask = new Uint8Array(s.size.w * s.size.h);
    mask.count = 0;
    return mask;
  }

  function selectAt(point, addToSelection) {
    var s = state;
    if (!s) return;

    var img = s.base.getContext('2d').getImageData(0, 0, s.size.w, s.size.h);
    var mask = IE.cutout.magicSelect(
      img, point.x, point.y, s.magicTolerance, s.magicContiguous
    );

    if (!mask.count) {
      if (!addToSelection) clearSelection(false);
      util.toast('그 지점에서 선택할 영역을 찾지 못했습니다. 감도를 올려 보세요.');
      updateInfo('선택된 영역이 없습니다. 감도를 올리거나 다른 지점을 클릭하세요.');
      return false;
    }

    if (addToSelection && s.selection) {
      IE.cutout.mergeMask(s.selection, mask);
    } else {
      s.selection = mask;
    }

    // 선택 표시 그림을 새로 만들게 한다 (마스크를 제자리에서 합쳤을 수 있다)
    s.selVersion++;
    overlayCache = null;

    refreshAll();
    syncControls();
    updateInfo(selectionText() + ' — [선택 삭제] 를 누르거나 Delete 키를 누르세요.');
    return true;
  }

  /** 선택 브러시로 한 지점을 칠한다 */
  function selectStroke(point) {
    var s = state;
    if (!s || !s.selection || !s.brushData) return;

    IE.cutout.brushSelect(
      s.selection,
      s.brushData,
      point.x,
      point.y,
      s.brushSize,
      s.magicTolerance,
      s.brushSubtract
    );

    s.selVersion++;
    overlayCache = null;

    // 붓을 문지르는 동안에도 몇 픽셀이 잡혔는지 바로 보이게 한다
    updateSelectionSummary();
  }

  /** 선택을 조금 다듬는다 — 페더를 바꾸거나 확장/축소/반전한다 */
  function refineSelection(action) {
    var s = state;
    if (!s || !s.selection || !s.selection.count) {
      util.toast('먼저 매직툴이나 선택 브러시로 영역을 고르세요.');
      return;
    }

    if (action === 'invert') {
      var img = s.base.getContext('2d').getImageData(0, 0, s.size.w, s.size.h);
      s.selection = IE.cutout.invertMask(s.selection, img);
      updateInfo(selectionText() + ' — 선택을 뒤집었습니다.');
    } else {
      // 살짝 번지게 만든 뒤 기준값으로 잘라 낸다 (낮게 = 확장, 높게 = 축소)
      var soft = IE.cutout.blurMask(s.selection, s.size.w, s.size.h, 2);
      s.selection = IE.cutout.thresholdMask(soft, action === 'grow' ? 40 : 215);
      updateInfo(selectionText() +
        (action === 'grow' ? ' — 1px 넓혔습니다.' : ' — 1px 좁혔습니다.'));
    }

    s.selVersion++;
    overlayCache = null;
    refreshAll();
    syncControls();
  }

  function deleteSelection() {
    var s = state;
    if (!s) return;

    if (!s.selection || !s.selection.count) {
      util.toast('먼저 매직툴이나 선택 브러시로 지울 영역을 고르세요.');
      return;
    }

    snapshot();

    var mask = s.selection;
    var ctx = s.base.getContext('2d');
    var imageData = ctx.getImageData(0, 0, s.size.w, s.size.h);

    if (s.selectionFeather > 0) {
      // 페더: 덮인 정도만큼 알파를 깎아 경계를 부드럽게 만든다
      var soft = IE.cutout.blurMask(mask, s.size.w, s.size.h, s.selectionFeather);
      IE.cutout.fadeMask(imageData, soft);
    } else {
      IE.cutout.clearMask(imageData, mask);
      IE.cutout.softenMaskEdge(imageData, mask);
    }

    ctx.putImageData(imageData, 0, 0);

    var percent = Math.round(((mask.count || 0) / (s.size.w * s.size.h)) * 100);

    s.dirty = true;
    clearSelection(false);
    invalidateCache();
    refreshWork();
    refreshAll();

    updateInfo('선택한 영역 ' + percent + '% 를 지웠습니다. 이어서 더 고르거나 지우개로 다듬으세요.');
  }

  /**
   * 머리카락까지 살려서 지운다 (알파 매팅).
   * 단단히 자르면 칼로 자른 듯하고 테두리에 배경색이 묻어 뜨는데,
   * 경계 픽셀의 섞인 비율을 계산해 잔머리와 반투명 끝을 남긴다.
   */
  function matteSelection() {
    var s = state;
    if (!s || !s.selection || !s.selection.count) {
      util.toast('먼저 매직툴이나 선택 브러시로 지울 영역을 고르세요.');
      return;
    }

    snapshot();

    var mask = s.selection;
    var ctx = s.base.getContext('2d');
    var imageData = ctx.getImageData(0, 0, s.size.w, s.size.h);

    // 페더를 크게 잡으면 매팅이 뭉개지므로 다듬는 폭만 쓴다
    var radius = Math.max(2, Math.min(s.selectionFeather || 3, 6));
    var touched = IE.cutout.matteEdge(imageData, mask, s.size.w, s.size.h, radius, 1);

    ctx.putImageData(imageData, 0, 0);

    var percent = Math.round(((mask.count || 0) / (s.size.w * s.size.h)) * 100);

    s.dirty = true;
    clearSelection(false);
    invalidateCache();
    refreshWork();
    refreshAll();

    updateInfo('머리카락을 살려 ' + percent + '% 를 지웠습니다 (' +
      touched.toLocaleString() + '개 픽셀의 경계를 다듬음).');
  }

  /** 고른 영역을 흐리게 만든다 (아웃포커스) — 배경을 고르고 누르면 인물만 선명해진다 */
  function blurSelection() {
    var s = state;
    if (!s) return;

    if (!s.selection || !s.selection.count) {
      util.toast('먼저 흐리게 만들 영역(보통 배경)을 고르세요.');
      return;
    }

    snapshot();

    var ctx = s.base.getContext('2d');
    var imageData = ctx.getImageData(0, 0, s.size.w, s.size.h);

    IE.cutout.blurMasked(
      imageData, s.selection, s.size.w, s.size.h, s.blurStrength, s.selectionFeather
    );

    ctx.putImageData(imageData, 0, 0);

    s.dirty = true;
    invalidateCache();
    refreshWork();
    refreshAll();

    updateInfo('고른 영역을 흐리게 했습니다 (강도 ' + s.blurStrength + '). ' +
      '더 흐리게 하려면 [선택 영역 흐리게] 를 한 번 더 누르세요.');
  }

  function clearSelection(silent) {
    var s = state;
    if (!s) return;

    s.selection = null;
    s.brushData = null;
    s.selVersion++;
    overlayCache = null;
    refreshWork();
    refreshAll();
    syncControls();

    if (!silent) {
      updateInfo(s.mode && CUT_MODES[s.mode] ? CUT_MODES[s.mode].hint : '선택을 해제했습니다.');
    }
  }

  function setCutMode(mode) {
    var s = state;
    if (!s) return;

    if (s.mode === mode) {
      s.mode = null;
    } else {
      s.mode = mode;
      s.sculpt = null;
      s.healOn = false;
      s.crop = null;
    }

    // 선택을 쓰지 않는 도구로 바꾸면 선택 표시를 지운다
    if (s.mode !== 'magic' && s.mode !== 'brush') clearSelection(true);

    // 매직툴은 클릭, 선택 브러시는 문지르기다 — 붓 크기를 도구에 맞춰 준다
    if (s.mode === 'brush' && s.brushSize < 24) {
      s.brushSize = Math.max(24, Math.round(s.size.w * 0.08));
    }

    syncControls();
    syncCropBox();
    updateBrushCursor();
    updateInfo(s.mode && CUT_MODES[s.mode]
      ? (CUT_MODES[s.mode].hint + (s.selection ? ' · ' + selectionText() : ''))
      : '도구를 선택하세요 (매직툴, 선택 브러시, 지우개, 복원).');
  }

  /* ================================================== 사진 자르기 */

  function copyCanvas(src) {
    var c = canvas2d(src.width, src.height);
    c.getContext('2d').drawImage(src, 0, 0);
    return c;
  }

  function initCrop() {
    var s = state;
    if (!s) return null;
    if (s.crop) return s.crop;

    s.crop = {
      tx: null,
      srcTx: null,
      txSize: { w: s.size.w, h: s.size.h },
      rect: { x: 0, y: 0, w: s.size.w, h: s.size.h },
      ratioId: 'free',
      ratio: null,
      rotation: 0,
      straighten: 0,
      flipH: false,
      flipV: false
    };

    rebuildCropSource();
    return s.crop;
  }

  /**
   * 회전·기울기·뒤집기를 적용한 임시 그림을 만든다.
   *
   * 기울기를 주면 네 모서리가 비므로, 돌아간 그림을 **전부 담는 큰 캔버스**에
   * 그린 뒤 그 안에서 자르게 한다 (라이트룸의 '기울기 후 자동 자르기' 방식).
   * 누끼 이전의 원본도 똑같이 변환해 둔다 — 자른 뒤 [복원]이 제대로 동작하려면
   * 원본도 같은 크기·같은 위치여야 한다.
   */
  function rebuildCropSource() {
    var s = state;
    var c = s.crop;
    if (!s || !c) return;

    var w = s.size.w;
    var h = s.size.h;
    var ang = (c.rotation * 90 + c.straighten) * Math.PI / 180;
    var cos = Math.abs(Math.cos(ang));
    var sin = Math.abs(Math.sin(ang));

    var W = Math.max(1, Math.round(w * cos + h * sin));
    var H = Math.max(1, Math.round(w * sin + h * cos));

    var build = function (from) {
      var cv = canvas2d(W, H);
      var ctx = cv.getContext('2d');
      ctx.translate(W / 2, H / 2);
      ctx.rotate(ang);
      ctx.scale(c.flipH ? -1 : 1, c.flipV ? -1 : 1);
      ctx.drawImage(from, -w / 2, -h / 2);
      return cv;
    };

    c.tx = build(s.base);
    c.srcTx = build(s.source);
    c.txSize = { w: W, h: H };
    c.rect = defaultCropRect(c);
  }

  /**
   * 비율에 맞는 가장 큰 영역.
   * 기울기가 있으면 **빈 모서리를 피해** 안쪽으로 들어간다 —
   * 회전한 사각형 안에 들어가는 가장 큰 사각형을 계산한 것이다.
   */
  function defaultCropRect(c) {
    var s = state;
    var W = c.txSize.w;
    var H = c.txSize.h;

    // 90도 회전까지 반영한 '사진 자체'의 크기
    var swapped = (c.rotation % 2) === 1;
    var ew = swapped ? s.size.h : s.size.w;
    var eh = swapped ? s.size.w : s.size.h;

    var t = Math.abs(c.straighten) * Math.PI / 180;
    var cos = Math.cos(t);
    var sin = Math.sin(t);

    var a = c.ratio || (ew / eh);
    var uh = Math.min(ew / (a * cos + sin), eh / (a * sin + cos));
    var uw = a * uh;

    // 회전 캔버스 밖으로 나가지 않게
    var k = Math.min(1, W / uw, H / uh);
    uw *= k;
    uh *= k;

    // 기울였을 때 딱 맞는 크기는 회전 경계와 정확히 닿는다. 그 자리 픽셀은
    // 반투명하게 남아 잘린 티가 나므로, 1px 안쪽으로 들여 깨끗하게 만든다.
    if (Math.abs(c.straighten) > 0.001) {
      uw = Math.max(8, uw - 1);
      uh = Math.max(8, uh - 1);
    }

    return { x: (W - uw) / 2, y: (H - uh) / 2, w: uw, h: uh };
  }

  function setShade(id, css) {
    var el = util.$(id);
    if (el) el.style.cssText = css;
  }

  /**
   * 자르기 상자를 화면에 반영한다.
   * 픽셀 좌표를 % 로 바꿔 넣기 때문에 확대·축소해도 그대로 따라간다.
   */
  function syncCropBox() {
    var s = state;
    var box = util.$('image-crop-box');
    var applyBtn = util.$('image-crop-apply');
    if (!s || !box) return;

    if (!s.crop) {
      box.hidden = true;
      ['ic-shade-t', 'ic-shade-b', 'ic-shade-l', 'ic-shade-r'].forEach(function (id) {
        setShade(id, 'display:none');
      });
      setText('image-crop-size', '-');
      if (applyBtn) {
        applyBtn.classList.remove('btn-mini-solid', 'is-active');
      }
      return;
    }

    box.hidden = false;
    var c = s.crop;
    var W = c.txSize.w;
    var H = c.txSize.h;
    var r = c.rect;

    var l = (r.x / W) * 100;
    var t = (r.y / H) * 100;
    var wp = (r.w / W) * 100;
    var hp = (r.h / H) * 100;

    box.style.left = l + '%';
    box.style.top = t + '%';
    box.style.width = wp + '%';
    box.style.height = hp + '%';

    setShade('ic-shade-t', 'left:0;right:0;top:0;height:' + t + '%');
    setShade('ic-shade-b', 'left:0;right:0;top:' + (t + hp) + '%;bottom:0');
    setShade('ic-shade-l', 'left:0;width:' + l + '%;top:' + t + '%;height:' + hp + '%');
    setShade('ic-shade-r', 'left:' + (l + wp) + '%;right:0;top:' + t + '%;height:' + hp + '%');

    setText('image-crop-size',
      Math.round(r.w) + ' × ' + Math.round(r.h) + ' px  ·  ' + ratioLabel(c));

    if (applyBtn) {
      applyBtn.classList.add('btn-mini-solid', 'is-active');
    }
  }

  function ratioLabel(c) {
    for (var i = 0; i < CROP_RATIOS.length; i++) {
      if (CROP_RATIOS[i].id === c.ratioId) {
        return c.ratio
          ? CROP_RATIOS[i].label
          : '자유 (' + (c.txSize.w / c.txSize.h).toFixed(2) + ')';
      }
    }
    return '자유';
  }

  /** 비율을 고르면 그 비율의 가장 큰 영역으로 맞춘다 */
  function setCropRatio(id) {
    var s = state;
    if (!s) return;

    if (s.crop && s.crop.ratioId === id) {
      s.crop = null;
      syncCropBox();
      syncControls();
      updateInfo('자르기 영역 선택을 해제했습니다.');
      return;
    }

    s.mode = null;
    s.sculpt = null;
    s.healOn = false;

    if (!s.crop) initCrop();

    var preset = null;
    for (var i = 0; i < CROP_RATIOS.length; i++) {
      if (CROP_RATIOS[i].id === id) preset = CROP_RATIOS[i];
    }
    if (!preset) return;

    s.crop.ratioId = preset.id;
    s.crop.ratio = preset.ratio;
    s.crop.rect = defaultCropRect(s.crop);

    syncCropBox();
    syncControls();
    updateInfo(preset.ratio
      ? preset.label + ' 비율로 맞췄습니다. 상자를 끌어 위치와 크기를 조절하세요.'
      : '자유 비율입니다. 사진 위를 끌어 원하는 만큼 자르세요.');
  }

  /** 비율이 정해져 있으면 상자를 그 비율에 맞춰 줄인다 (가운데 기준) */
  function applyCropRatio(c) {
    if (!c.ratio) return;

    var W = c.txSize.w;
    var H = c.txSize.h;
    var r = c.rect;

    var w = r.w;
    var h = w / c.ratio;
    if (h > r.h) { h = r.h; w = h * c.ratio; }

    var cx = r.x + r.w / 2;
    var cy = r.y + r.h / 2;

    r.w = w;
    r.h = h;
    r.x = util.clamp(cx - w / 2, 0, Math.max(0, W - w));
    r.y = util.clamp(cy - h / 2, 0, Math.max(0, H - h));
  }

  function resizeCropRect(c, handle, p) {
    var r = c.rect;
    var W = c.txSize.w;
    var H = c.txSize.h;

    var west = handle === 'w' || handle === 'nw' || handle === 'sw';
    var east = handle === 'e' || handle === 'ne' || handle === 'se';
    var north = handle === 'n' || handle === 'nw' || handle === 'ne';
    var south = handle === 's' || handle === 'sw' || handle === 'se';

    var left = r.x;
    var right = r.x + r.w;
    var top = r.y;
    var bottom = r.y + r.h;

    if (west) left = Math.min(p.x, right - 8);
    if (east) right = Math.max(p.x, left + 8);
    if (north) top = Math.min(p.y, bottom - 8);
    if (south) bottom = Math.max(p.y, top + 8);

    left = util.clamp(left, 0, W);
    right = util.clamp(right, 0, W);
    top = util.clamp(top, 0, H);
    bottom = util.clamp(bottom, 0, H);

    r.x = Math.min(left, right);
    r.y = Math.min(top, bottom);
    r.w = Math.max(8, Math.abs(right - left));
    r.h = Math.max(8, Math.abs(bottom - top));

    applyCropRatio(c);
  }

  function rotateCrop(delta) {
    var s = state;
    if (!s || !s.crop) return;

    s.crop.rotation = (s.crop.rotation + delta + 4) % 4;
    rebuildCropSource();
    syncCropBox();
    syncControls();
    fitView();
    refreshWork();
    refreshAll();
    updateInfo('사진을 ' + (delta > 0 ? '오른쪽' : '왼쪽') + '으로 90° 돌렸습니다.');
  }

  function flipCrop(axis) {
    var s = state;
    if (!s || !s.crop) return;

    if (axis === 'h') s.crop.flipH = !s.crop.flipH;
    else s.crop.flipV = !s.crop.flipV;

    rebuildCropSource();
    syncCropBox();
    syncControls();
    refreshWork();
    refreshAll();
    updateInfo(axis === 'h' ? '좌우로 뒤집었습니다.' : '상하로 뒤집었습니다.');
  }

  function setStraighten(value) {
    var s = state;
    if (!s || !s.crop) return;

    s.crop.straighten = value;
    rebuildCropSource();
    syncCropBox();
    updateValueLabels();
    fitView();
    refreshWork();
    refreshAll();
  }

  function maxCrop() {
    var s = state;
    if (!s || !s.crop) return;
    s.crop.rect = defaultCropRect(s.crop);
    syncCropBox();
    updateInfo('비율에 맞는 가장 큰 영역으로 맞췄습니다.');
  }

  function centerCrop() {
    var s = state;
    if (!s || !s.crop) return;

    var r = s.crop.rect;
    r.x = (s.crop.txSize.w - r.w) / 2;
    r.y = (s.crop.txSize.h - r.h) / 2;
    syncCropBox();
  }

  function resetCrop() {
    var s = state;
    if (!s) return;

    if (s.crop) {
      s.crop.rotation = 0;
      s.crop.straighten = 0;
      s.crop.flipH = false;
      s.crop.flipV = false;
      s.crop.ratioId = 'free';
      s.crop.ratio = null;
    }
    s.crop = null;

    syncCropBox();
    syncControls();
    fitView();
    refreshWork();
    refreshAll();
    updateInfo('자르기 설정을 처음으로 되돌렸습니다.');
  }

  /**
   * 자르기 확정 — 회전·기울기·뒤집기까지 구워서 새 base 를 만든다.
   * 밝기·피부 보정은 파이프라인이 다시 입히므로 여기서는 raw 픽셀만 자른다.
   */
  function applyCrop() {
    var s = state;
    var c = s.crop;
    if (!s || !c) return;

    var r = c.rect;
    var x = util.clamp(Math.round(r.x), 0, Math.max(0, c.txSize.w - 1));
    var y = util.clamp(Math.round(r.y), 0, Math.max(0, c.txSize.h - 1));
    var w = Math.max(1, Math.min(c.txSize.w - x, Math.round(r.w)));
    var h = Math.max(1, Math.min(c.txSize.h - y, Math.round(r.h)));

    var untouched = (w === s.size.w && h === s.size.h && w === c.txSize.w &&
      h === c.txSize.h && !c.rotation && !c.straighten && !c.flipH && !c.flipV);

    if (untouched) {
      util.toast('자를 영역이 사진과 같습니다. 상자를 줄여 보세요.');
      updateInfo('자를 영역이 사진 전체와 같습니다. 손잡이를 끌어 줄이세요.');
      return;
    }

    snapshot();

    var cut = function (from) {
      var cv = canvas2d(w, h);
      cv.getContext('2d').drawImage(from, x, y, w, h, 0, 0, w, h);
      return cv;
    };

    var wasRotation = c.rotation;
    var wasStraighten = c.straighten;
    var wasFlip = c.flipH || c.flipV;

    s.base = cut(c.tx);
    s.source = cut(c.srcTx);
    s.size = { w: w, h: h };

    // 잘라내면 얼굴 자리도 달라진다 — 다시 찾는다
    s.face = IE.facedet.locate(s.base, w, h);

    s.crop = null;
    s.dirty = true;
    s.showOriginal = false;
    s.selection = null;
    s.brushData = null;
    s.selVersion++;
    overlayCache = null;

    invalidateCache();
    syncCropBox();
    syncControls();
    fitView();
    refreshWork();
    refreshAll();
    renderAllPresets();

    var parts = [];
    if (wasRotation) parts.push('회전 ' + (wasRotation * 90) + '°');
    if (wasStraighten) parts.push('기울기 ' + wasStraighten + '°');
    if (wasFlip) parts.push('뒤집기');

    updateInfo('사진을 ' + w + ' × ' + h + 'px 로 잘랐습니다' +
      (parts.length ? ' (' + parts.join(' · ') + ')' : '') +
      '. 되돌리려면 [한 단계 취소] 를 누르세요.');
  }

  function renderCropRatios() {
    var host = util.$('image-crop-ratios');
    if (!host || host.childNodes.length) return;

    CROP_RATIOS.forEach(function (preset) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'ratio-btn';
      b.setAttribute('data-crop-ratio', preset.id);
      b.textContent = preset.label;
      host.appendChild(b);
    });
  }

  /* ============================================ 인물 보정 프리셋 */

  /**
   * 미리보기 한 장을 담을 고정 크기 캔버스와, 그 안에서 사진이 차지하는 자리를
   * 계산한다. 사진 비율이 제각각이어도 카드 크기는 늘 같아야 보기 좋다.
   */
  function previewFrame() {
    var s = state;
    var scale = Math.min(PREVIEW_W / s.size.w, PREVIEW_H / s.size.h);

    return {
      x: Math.round((PREVIEW_W - s.size.w * scale) / 2),
      y: Math.round((PREVIEW_H - s.size.h * scale) / 2),
      w: Math.max(4, Math.round(s.size.w * scale)),
      h: Math.max(4, Math.round(s.size.h * scale))
    };
  }

  function previewCard(host, attr, id, label, art) {
    var card = document.createElement('button');
    card.type = 'button';
    card.className = 'tone-preset';
    card.setAttribute(attr, id);

    var frame = document.createElement('span');
    frame.className = 'tone-preset-art';
    frame.appendChild(art);

    var name = document.createElement('b');
    name.textContent = label;

    card.appendChild(frame);
    card.appendChild(name);
    host.appendChild(card);
    return card;
  }

  /**
   * 프리셋 카드마다 **지금 사진에 그 보정을 실제로 입힌 미리보기**를 그린다.
   * 글자만 있는 목록이 아니라 결과를 보고 고를 수 있어야 쓸 만하다.
   */
  function renderPresets() {
    var s = state;
    var host = util.$('image-presets');
    if (!s || !host) return;

    var rect = previewFrame();

    // 원본을 한 번만 줄여 두고 카드마다 복사해서 쓴다
    var small = canvas2d(rect.w, rect.h);
    small.getContext('2d').drawImage(s.base, 0, 0, rect.w, rect.h);

    host.innerHTML = '';

    TONE_PRESETS.forEach(function (preset) {
      var art = canvas2d(PREVIEW_W, PREVIEW_H);
      var actx = art.getContext('2d');
      actx.drawImage(small, rect.x, rect.y);

      var img = actx.getImageData(0, 0, PREVIEW_W, PREVIEW_H);
      IE.enhance.applyTone(img, preset.tone);

      if (preset.smooth > 0) {
        IE.enhance.applyDetail(
          img, IE.enhance.blurRGB(img, 1), IE.enhance.skinMask(img, 2),
          preset.smooth, preset.sharpen
        );
      } else if (preset.sharpen > 0) {
        IE.enhance.applyDetail(img, IE.enhance.blurRGB(img, 1), null, 0, preset.sharpen);
      }

      actx.putImageData(img, 0, 0);
      previewCard(host, 'data-preset', preset.id, preset.label, art);
    });

    syncPresetActive();
  }

  /**
   * 얼굴 성형 프리셋 카드 — 여기는 **실제로 휘어 본 모습**을 미리 보여 준다.
   * 리퀴파이는 캔버스에 바로 적용되는 계산이라 작은 미리보기에도 똑같이 돌아간다.
   */
  function renderFacePresets() {
    var s = state;
    var host = util.$('image-face-presets');
    if (!s || !host) return;

    var rect = previewFrame();

    var small = canvas2d(rect.w, rect.h);
    small.getContext('2d').drawImage(s.base, 0, 0, rect.w, rect.h);

    host.innerHTML = '';

    FACE_PRESETS.forEach(function (preset) {
      var art = canvas2d(PREVIEW_W, PREVIEW_H);
      art.getContext('2d').drawImage(small, rect.x, rect.y);
      runFaceOps(art, preset, faceIn(rect, s));

      previewCard(host, 'data-face-preset', preset.id, preset.label, art);
    });

    syncFaceStatus();
  }

  /**
   * 인식한 얼굴 자리를 사진 위에 그려 보여 준다.
   * "프리셋이 왜 엉뚱하게 나오지?" 를 눈으로 바로 확인할 수 있다.
   */
  var MAP_W = 224;
  var MAP_H = 168;

  /** 프리셋이 실제로 건드리는 자리들 (턱 · 눈 · 광대) */
  var FACE_MARKS = [
    [0.12, 0.56, '#a78bfa'],
    [0.88, 0.56, '#a78bfa'],
    [0.31, 0.42, '#f472b6'],
    [0.69, 0.42, '#f472b6'],
    [0.50, 0.95, '#38bdf8']
  ];

  function faceMap() {
    var s = state;
    var scale = Math.min(MAP_W / s.size.w, MAP_H / s.size.h);
    var w = Math.max(4, Math.round(s.size.w * scale));
    var h = Math.max(4, Math.round(s.size.h * scale));
    var ox = Math.round((MAP_W - w) / 2);
    var oy = Math.round((MAP_H - h) / 2);

    var art = canvas2d(MAP_W, MAP_H);
    var x = art.getContext('2d');

    x.fillStyle = '#0b1220';
    x.fillRect(0, 0, MAP_W, MAP_H);
    x.drawImage(s.base, ox, oy, w, h);

    var f = s.face;
    var fx = ox + f.x * scale;
    var fy = oy + f.y * scale;
    var fw = f.w * scale;
    var fh = f.h * scale;

    FACE_MARKS.forEach(function (m) {
      x.beginPath();
      x.arc(fx + m[0] * fw, fy + m[1] * fh, 2.5, 0, 7);
      x.fillStyle = m[2];
      x.fill();
    });

    x.strokeStyle = f.found ? '#22c55e' : '#f59e0b';
    x.lineWidth = 2;
    x.setLineDash([5, 3]);
    x.strokeRect(fx, fy, fw, fh);
    x.setLineDash([]);

    return art;
  }

  /**
   * 얼굴을 찾았는지, 어디로 봤는지 알려 준다.
   * 못 찾았는데 아무 말도 없으면 "고장 난 것"처럼 보인다.
   */
  function syncFaceStatus() {
    var s = state;
    var box = util.$('image-face-status');
    if (!s || !box) return;

    var face = s.face;
    var label;

    if (face.found) {
      label = '<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>' +
        '<span>얼굴을 찾았습니다 <i>' + Math.round(face.score * 100) + '%</i></span>';
    } else {
      label = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/>' +
        '<path d="M12 8v.01M12 11.5v4.5"/></svg>' +
        '<span>얼굴을 못 찾아 <b>가운데 기준</b>으로 잡았습니다</span>';
    }

    box.className = face.found ? 'face-detect is-ok' : 'face-detect is-guess';
    box.innerHTML = '';

    var line = document.createElement('div');
    line.className = 'face-detect-line';
    line.innerHTML = label;

    var figure = document.createElement('figure');
    figure.className = 'face-map';
    figure.appendChild(faceMap());

    var caption = document.createElement('figcaption');
    caption.innerHTML = '<b>초록 점선</b> = 얼굴로 본 곳 &nbsp;·&nbsp; ' +
      '점 = 프리셋이 건드릴 자리 (<b>턱</b>·<b>눈</b>·<b>광대</b>)';
    figure.appendChild(caption);

    box.appendChild(line);
    box.appendChild(figure);
  }

  /**
   * 얼굴 상자를 다른 좌표계로 옮긴다.
   * 미리보기는 사진을 줄여 그리므로 같은 비율로 줄여야 자리가 맞는다.
   */
  function faceIn(rect, s) {
    var face = s.face;
    var scale = rect.w / s.size.w;

    return {
      x: rect.x + face.x * scale,
      y: rect.y + face.y * scale,
      w: face.w * scale,
      h: face.h * scale
    };
  }

  /** 성형 동작을 캔버스에 적용한다 — 자리는 얼굴 상자(face)를 기준으로 잡는다 */
  function runFaceOps(canvas, preset, face) {
    var ctx = canvas.getContext('2d');

    preset.ops.forEach(function (op) {
      IE.enhance.liquify(ctx, canvas.width, canvas.height, {
        x: face.x + op.fx * face.w,
        y: face.y + op.fy * face.h,
        radius: Math.max(3, op.fr * face.w),
        strength: op.k,
        mode: op.mode
      });
    });
  }

  function applyFacePreset(id) {
    var s = state;
    if (!s) return;

    var preset = null;
    for (var i = 0; i < FACE_PRESETS.length; i++) {
      if (FACE_PRESETS[i].id === id) preset = FACE_PRESETS[i];
    }
    if (!preset) return;

    snapshot();

    runFaceOps(s.base, preset, s.face);

    s.dirty = true;
    invalidateCache();
    refreshWork();
    refreshAll();

    updateInfo(preset.label + ' 을(를) 적용했습니다. 마음에 안 들면 [한 단계 취소], ' +
      '더 다듬으려면 아래 브러시로 문지르세요.');
  }

  function renderAllPresets() {
    renderPresets();
    renderFacePresets();
  }

  function applyPreset(id) {
    var s = state;
    if (!s) return;

    var preset = null;
    for (var i = 0; i < TONE_PRESETS.length; i++) {
      if (TONE_PRESETS[i].id === id) preset = TONE_PRESETS[i];
    }
    if (!preset) return;

    snapshot();

    s.params = {
      brightness: preset.tone.brightness || 0,
      contrast: preset.tone.contrast || 0,
      saturation: preset.tone.saturation || 0,
      warmth: preset.tone.warmth || 0,
      gray: !!preset.tone.gray,
      vignette: s.params.vignette
    };
    s.smooth = preset.smooth;
    s.sharpen = preset.sharpen;
    s.preset = preset.id;
    s.dirty = true;

    invalidateCache();
    syncControls();
    syncPresetActive();
    refreshWork();
    refreshAll();

    updateInfo(preset.label + ' — 밝기 ' + s.params.brightness + ' · 대비 ' + s.params.contrast +
      ' · 채도 ' + s.params.saturation + ' · 색감 ' + s.params.warmth +
      (s.smooth ? ' · 부드럽게 ' + s.smooth + '%' : '') +
      (s.sharpen ? ' · 선명하게 ' + s.sharpen + '%' : ''));
  }

  function syncPresetActive() {
    var s = state;
    if (!s) return;

    Array.prototype.forEach.call(
      document.querySelectorAll('#image-presets [data-preset]'),
      function (el) {
        el.classList.toggle('is-active', el.getAttribute('data-preset') === s.preset);
      }
    );
  }

  /** 슬라이더를 손으로 건드리면 '프리셋'에서 벗어난다 */
  function clearPreset() {
    var s = state;
    if (!s || !s.preset) return;
    s.preset = null;
    syncPresetActive();
  }

  /* ==================================================== 잡티 제거 */

  function healAt(point) {
    var s = state;
    if (!s || !s.healSrc) return 0;

    var ctx = s.base.getContext('2d');
    var r = Math.max(3, s.healSize / 2);
    var pad = Math.ceil(r * 3.6) + 3;      // 이웃 조각을 찾을 여유

    var x0 = Math.max(0, Math.floor(point.x - pad));
    var y0 = Math.max(0, Math.floor(point.y - pad));
    var x1 = Math.min(s.size.w, Math.ceil(point.x + pad));
    var y1 = Math.min(s.size.h, Math.ceil(point.y + pad));
    var pw = x1 - x0;
    var ph = y1 - y0;
    if (pw <= 6 || ph <= 6) return 0;

    var patch = ctx.getImageData(x0, y0, pw, ph);

    // 한 획 동안 고정된 원본에서 필요한 만큼만 잘라 온다
    var srcPatch = new Uint8ClampedArray(pw * ph * 4);
    var sw = s.size.w;
    for (var y = 0; y < ph; y++) {
      var from = ((y0 + y) * sw + x0) * 4;
      srcPatch.set(s.healSrc.data.subarray(from, from + pw * 4), y * pw * 4);
    }

    var touched = IE.enhance.healSpot(patch, srcPatch, point.x - x0, point.y - y0, r);
    if (!touched) return 0;

    ctx.putImageData(patch, x0, y0);

    s.dirty = true;
    invalidateCache();
    refreshWork();
    refreshAll();
    return touched;
  }

  /* ---------------------------------------------------- 인물 보정 */

  function runAutoTone() {
    var s = state;
    if (!s) return;

    var img = s.base.getContext('2d').getImageData(0, 0, s.size.w, s.size.h);
    var params = IE.enhance.autoParams(img);

    s.params = params;
    s.dirty = true;

    syncControls();
    refreshWork();

    updateInfo('자동 보정: 밝기 ' + params.brightness + ' · 대비 ' + params.contrast +
      ' · 채도 ' + params.saturation + ' · 색감 ' + params.warmth);
  }

  /** 모드별 강도 — 밀기는 끄는 거리에, 나머지는 반복 횟수에 비례한다 */
  function strengthFor(mode, intensity) {
    var k = intensity / 100;
    if (mode === 'push') return k * 1.1;
    if (mode === 'swirl') return k * 0.05;
    return k * 0.075;
  }

  function sculptStroke(point, dx, dy) {
    var s = state;
    if (!s) return;

    var options = {
      x: point.x,
      y: point.y,
      radius: s.sculptSize / 2,
      strength: strengthFor(s.sculpt, s.sculptIntensity),
      mode: s.sculpt,
      dx: dx,
      dy: dy
    };

    // base 와 work 양쪽에 같은 워프를 적용한다 (미리보기 반응)
    IE.enhance.liquify(s.base.getContext('2d'), s.size.w, s.size.h, options);
    IE.enhance.liquify(s.work.getContext('2d'), s.size.w, s.size.h, options);
  }

  /* ---------------------------------------------------------- 컨트롤 */

  function setText(id, text) {
    var el = util.$(id);
    if (el) el.textContent = text;
  }

  function setValue(id, value) {
    var el = util.$(id);
    if (el) el.value = String(value);
  }

  var MODE_NAME = { magic: '매직툴', brush: '선택 브러시', erase: '지우개', restore: '복원' };
  var SCULPT_NAME = { push: '밀기', pinch: '턱 갸름', bulge: '눈 키우기', swirl: '돌리기' };

  /**
   * '지금 도구' 줄.
   *
   * 칸마다 버튼이 하나씩 켜져 있으면(성형 브러시 + 잡티 토글처럼) 무엇으로
   * 그리는지 알 수 없다. 도구 이름을 한 곳에 못 박아 그 혼동을 없앤다.
   */
  function updateNowBar() {
    var s = state;
    if (!s) return;

    var cutout = util.$('co-now-cutout');
    if (cutout) {
      cutout.innerHTML = s.mode
        ? '지금 도구 <b>' + (MODE_NAME[s.mode] || s.mode) + '</b>'
        : '지금 도구 <b>선택 안 됨</b>';
    }

    var retouch = util.$('co-now-retouch');
    if (retouch) {
      if (s.healOn) {
        retouch.innerHTML = '지금 도구 <b>잡티 제거</b> — 문질러 지웁니다';
      } else if (s.sculpt) {
        retouch.innerHTML = '지금 도구 <b>' + (SCULPT_NAME[s.sculpt] || s.sculpt) + '</b> — 끌어서 밀어 줍니다';
      } else {
        retouch.innerHTML = '지금 도구 <b>선택 안 됨</b>';
      }
    }

    var crop = util.$('co-now-crop');
    if (crop) {
      crop.innerHTML = s.crop
        ? '지금 도구 <b>자르기 · 회전</b> — 상자를 끌어 정합니다'
        : '지금 도구 <b>선택 안 됨</b>';
    }
  }

  function syncControls() {
    var s = state;
    if (!s) return;

    Array.prototype.forEach.call(
      document.querySelectorAll('#image-modes [data-image-mode]'),
      function (button) {
        button.classList.toggle(
          'is-active',
          !!s.mode && button.getAttribute('data-image-mode') === s.mode
        );
      }
    );

    Array.prototype.forEach.call(
      document.querySelectorAll('#image-sculpt [data-image-sculpt]'),
      function (button) {
        button.classList.toggle(
          'is-active',
          !!s.sculpt && button.getAttribute('data-image-sculpt') === s.sculpt
        );
      }
    );

    setValue('image-brush-size', s.brushSize);
    setValue('image-tolerance', s.tolerance);
    setValue('image-magic-tolerance', s.magicTolerance);
    setValue('image-sculpt-size', s.sculptSize);
    setValue('image-sculpt-intensity', s.sculptIntensity);
    setValue('image-brightness', s.params.brightness);
    setValue('image-contrast', s.params.contrast);
    setValue('image-saturation', s.params.saturation);
    setValue('image-warmth', s.params.warmth);
    setValue('image-smooth', s.smooth);
    setValue('image-sharpen', s.sharpen);
    setValue('image-sel-feather', s.selectionFeather);
    setValue('image-blur-strength', s.blurStrength);
    setValue('image-heal-size', s.healSize);
    setValue('image-vignette', s.params.vignette);
    setValue('image-straighten', s.crop ? s.crop.straighten : 0);

    Array.prototype.forEach.call(
      document.querySelectorAll('#image-heal-row [data-image-heal]'),
      function (button) {
        var action = button.getAttribute('data-image-heal');
        button.classList.toggle('is-active', action === 'on' && !!s.healOn);
      }
    );

    Array.prototype.forEach.call(
      document.querySelectorAll('#image-crop-ratios [data-crop-ratio]'),
      function (button) {
        button.classList.toggle(
          'is-active',
          !!s.crop && button.getAttribute('data-crop-ratio') === s.crop.ratioId
        );
      }
    );

    var contiguous = util.$('image-magic-contiguous');
    if (contiguous) contiguous.checked = !!s.magicContiguous;

    var tidy = util.$('image-tidy');
    if (tidy) tidy.checked = !!s.tidy;

    updateNowBar();

    // 매직툴 전용 설정
    var magicBox = util.$('image-magic-options');
    if (magicBox) magicBox.hidden = s.mode !== 'magic';

    // 붓 굵기 — 매직툴(클릭)만 빼고 모두 쓴다 (도구가 선택되었을 때만)
    var brushBox = util.$('image-brush-options');
    if (brushBox) brushBox.hidden = !s.mode || s.mode === 'magic';

    // 선택 다듬기 — 고른 게 있을 때만 할 일이 있다
    updateSelectionSummary();

    updateValueLabels();
  }

  /**
   * '선택 다듬기' 칸의 요약과 활성 상태만 갱신한다.
   * 붓을 문지르는 동안 매번 부르므로 가볍게 유지한다.
   */
  function updateSelectionSummary() {
    var s = state;
    if (!s) return;

    var refineBox = util.$('image-refine');
    if (refineBox) refineBox.classList.toggle('is-idle', !s.selection);

    var blurBox = util.$('image-blur');
    if (blurBox) blurBox.classList.toggle('is-idle', !s.selection);

    var selInfo = util.$('image-refine-count');
    if (selInfo) {
      selInfo.textContent = s.selection
        ? selectionText() + (s.selectionFeather > 0 ? ' · 페더 ' + s.selectionFeather + 'px' : '')
        : '고른 영역이 없습니다';
    }
  }

  function updateValueLabels() {
    var s = state;
    if (!s) return;

    setText('image-brush-size-label', Math.round(s.brushSize) + 'px');
    setText('image-tolerance-label', String(s.tolerance));
    setText('image-magic-tolerance-label', String(s.magicTolerance));
    setText('image-sculpt-size-label', Math.round(s.sculptSize) + 'px');
    setText('image-sculpt-intensity-label', String(s.sculptIntensity));
    setText('image-brightness-label', String(s.params.brightness));
    setText('image-contrast-label', String(s.params.contrast));
    setText('image-saturation-label', String(s.params.saturation));
    setText('image-warmth-label', String(s.params.warmth));
    setText('image-smooth-label', s.smooth + '%');
    setText('image-sharpen-label', s.sharpen + '%');
    setText('image-sel-feather-label',
      s.selectionFeather > 0 ? s.selectionFeather + 'px' : '없음');
    setText('image-blur-strength-label', String(s.blurStrength));
    setText('image-heal-size-label', Math.round(s.healSize) + 'px');
    setText('image-vignette-label', String(s.params.vignette));
    setText('image-straighten-label',
      (s.crop ? s.crop.straighten : 0).toFixed(1).replace(/\.0$/, '') + '°');
  }

  function updateInfo(text) {
    var el = util.$('image-info');
    if (el) el.textContent = text;
  }

  function adjustActiveBrush(delta) {
    var s = state;
    if (!s) return;

    if (s.tab === 'cutout') {
      s.brushSize = util.clamp(s.brushSize + delta, 4, Math.round(Math.max(s.size.w, s.size.h) * 0.6));
    } else if (s.healOn) {
      s.healSize = util.clamp(s.healSize + delta, 8, Math.round(Math.max(s.size.w, s.size.h) * 0.4));
    } else {
      s.sculptSize = util.clamp(s.sculptSize + delta, 8, Math.round(Math.max(s.size.w, s.size.h) * 0.8));
    }

    syncControls();
  }

  /* ---------------------------------------------------------- 이벤트 */

  function pointFrom(event) {
    var s = state;
    var view = util.$('image-canvas');
    if (!s || !view) return null;

    var rect = view.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / s.zoom,
      y: (event.clientY - rect.top) / s.zoom
    };
  }

  function bindCanvas() {
    var view = util.$('image-canvas');
    if (!view) return;

    var last = null;

    var cutStroke = function (event) {
      var point = pointFrom(event);
      if (!point) return;

      if (last) {
        var dx = point.x - last.x;
        var dy = point.y - last.y;
        var steps = Math.max(1, Math.ceil(Math.sqrt(dx * dx + dy * dy) / 3));

        for (var i = 1; i <= steps; i++) {
          paint(last.x + (dx * i) / steps, last.y + (dy * i) / steps);
        }
      } else {
        paint(point.x, point.y);
      }

      last = point;
    };

    var sculptStrokeAt = function (event) {
      var s = state;
      var point = pointFrom(event);
      if (!s || !point) return;

      if (!last) {
        last = point;
        sculptStroke(point, 0, 0);
        return;
      }

      var dx = point.x - last.x;
      var dy = point.y - last.y;
      var steps = Math.max(1, Math.ceil(Math.sqrt(dx * dx + dy * dy) / 4));

      for (var i = 1; i <= steps; i++) {
        sculptStroke(
          { x: last.x + (dx * i) / steps, y: last.y + (dy * i) / steps },
          dx / steps,
          dy / steps
        );
      }

      last = point;
    };

    // 선택 브러시: 픽셀은 건드리지 않고 선택만 넓히거나 좁힌다
    var selectBrushAt = function (event) {
      var s = state;
      var point = pointFrom(event);
      if (!s || !point) return;

      if (last) {
        var dx = point.x - last.x;
        var dy = point.y - last.y;
        var spacing = Math.max(3, s.brushSize / 6);
        var steps = Math.max(1, Math.ceil(Math.sqrt(dx * dx + dy * dy) / spacing));

        for (var i = 1; i <= steps; i++) {
          selectStroke({ x: last.x + (dx * i) / steps, y: last.y + (dy * i) / steps });
        }
      } else {
        selectStroke(point);
      }

      last = point;
    };

    // 잡티 제거: 문지르는 동안 그 자리를 계속 주변 조각으로 덮는다
    var healStrokeAt = function (event) {
      var s = state;
      var point = pointFrom(event);
      if (!s || !point) return;

      if (last) {
        var dx = point.x - last.x;
        var dy = point.y - last.y;
        var spacing = Math.max(2, s.healSize / 5);
        var steps = Math.max(1, Math.ceil(Math.sqrt(dx * dx + dy * dy) / spacing));

        for (var i = 1; i <= steps; i++) {
          healAt({ x: last.x + (dx * i) / steps, y: last.y + (dy * i) / steps });
        }
      } else {
        healAt(point);
      }

      last = point;
    };

    var isSelectBrush = function (s) {
      return s.tab === 'cutout' && s.mode === 'brush';
    };

    view.addEventListener('mousedown', function (event) {
      var s = state;
      if (!s) return;

      // 선택 브러시는 오른쪽 버튼으로도 뺄 수 있다
      if (event.button !== 0 && !(event.button === 2 && isSelectBrush(s))) return;
      event.preventDefault();

      var point = pointFrom(event);
      if (!point) return;

      // 매직툴은 '클릭 한 번 = 선택' 이다 (문지르지 않는다)
      if (s.tab === 'cutout') {
        if (!s.mode) {
          util.toast('먼저 도구를 선택하세요.');
          return;
        }
        if (s.mode === 'magic') {
          selectAt(point, event.shiftKey);
          return;
        }
      }

      // 선택 브러시는 되돌리기 스택을 쓰지 않는다 — 픽셀을 건드리지 않으므로
      // 잘못 골라도 [선택 해제] 로 언제든 처음부터 다시 고르면 된다
      if (isSelectBrush(s)) {
        if (!s.selection) s.selection = emptyMask(s);

        // 붓 한 획 동안 쓰는 픽셀을 한 번만 읽어 둔다
        s.brushData = s.base.getContext('2d').getImageData(0, 0, s.size.w, s.size.h);
        s.brushSubtract = event.altKey || event.button === 2;
        s.painting = true;
        last = null;

        selectBrushAt(event);
        refreshAll();
        updateInfo(selectionText());
        return;
      }

      // 잡티 제거 — 한 획 동안 쓸 원본을 한 번만 떠 둔다
      // (덮은 자리를 다시 베끼면 번지므로 항상 처음 상태에서 가져온다)
      if (s.tab === 'retouch') {
        if (!s.healOn && !s.sculpt) {
          util.toast('먼저 얼굴 성형 도구 또는 잡티 제거를 선택하세요.');
          return;
        }

        if (s.healOn) {
          snapshot();
          s.painting = true;
          s.dirty = true;
          s.healSrc = s.base.getContext('2d').getImageData(0, 0, s.size.w, s.size.h);
          last = null;

          healStrokeAt(event);
          updateInfo('잡티를 주변 조각으로 덮는 중…');
          return;
        }
      }

      snapshot();
      s.painting = true;
      s.dirty = true;
      invalidateCache();
      last = null;

      if (s.tab === 'cutout') cutStroke(event);
      else if (s.tab === 'retouch' && s.sculpt) sculptStrokeAt(event);

      refreshAll();
    });

    window.addEventListener('mousemove', function (event) {
      var s = state;

      if (!s) return;

      // 누르고 있는 동안에도 원형 커서가 손끝을 따라가야 한다.
      // (예전에는 손을 떼야만 커서가 움직여서, 어디를 문지르는지 알 수 없었다)
      showBrush(event.clientX, event.clientY);

      if (!s.painting) return;

      event.preventDefault();

      if (isSelectBrush(s)) selectBrushAt(event);
      else if (s.tab === 'cutout') cutStroke(event);
      else if (s.healOn) healStrokeAt(event);
      else sculptStrokeAt(event);

      refreshAll();
    });

    window.addEventListener('mouseup', function () {
      var s = state;
      if (!s || !s.painting) return;

      s.painting = false;
      last = null;

      if (isSelectBrush(s)) {
        s.brushData = null;
        s.brushSubtract = false;
        // 손을 떼면 페더가 반영된 선택 모습을 다시 그린다
        overlayCache = null;
        refreshAll();
        syncControls();
        updateInfo(selectionText() + ' — [선택 삭제] 를 누르거나 Delete 키를 누르세요.');
        return;
      }

      if (s.tab === 'retouch') {
        // 성형·잡티 제거는 base 를 직접 고쳤으므로 보정 파이프라인을 다시 입힌다
        s.healSrc = null;
        invalidateCache();
        refreshWork();
        refreshAll();

        if (s.healOn) {
          updateInfo('잡티를 지웠습니다. 이어서 더 문지르거나 [한 단계 취소] 로 되돌리세요.');
        }
      }
    });

    view.addEventListener('mouseleave', hideBrush);

    // 선택 브러시의 오른쪽 버튼(빼기)을 위해 기본 메뉴를 막는다
    view.addEventListener('contextmenu', function (event) {
      var s = state;
      if (s && isSelectBrush(s)) event.preventDefault();
    });
  }

  /**
   * 자르기 상자 조작 — 끌어 옮기고, 손잡이로 크기를 바꾸고, 바깥을 끌면 새로 그린다.
   * 좌표는 화면이 아니라 '회전본 픽셀' 기준이라 확대·축소와 무관하다.
   */
  function bindCrop() {
    var wrap = util.$('image-crop');
    var box = util.$('image-crop-box');
    if (!wrap || !box) return;

    var drag = null;

    var pointAt = function (event) {
      var s = state;
      var view = util.$('image-canvas');
      if (!s || !view) return null;

      var rect = view.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;

      var txW = s.crop ? s.crop.txSize.w : s.size.w;
      var txH = s.crop ? s.crop.txSize.h : s.size.h;

      return {
        x: ((event.clientX - rect.left) / rect.width) * txW,
        y: ((event.clientY - rect.top) / rect.height) * txH
      };
    };

    wrap.addEventListener('mousedown', function (event) {
      var s = state;
      if (!s || event.button !== 0) return;

      var p = pointAt(event);
      if (!p) return;
      event.preventDefault();

      if (!s.crop) {
        initCrop();
        s.mode = null;
        s.sculpt = null;
        s.healOn = false;
        s.crop.rect = { x: p.x, y: p.y, w: 8, h: 8 };
        drag = { kind: 'new', from: p };
        syncCropBox();
        syncControls();
        updateBrushCursor();
        return;
      }

      var handle = event.target.getAttribute && event.target.getAttribute('data-ic');

      if (handle) {
        drag = { kind: 'resize', handle: handle };
      } else if (event.target === box || box.contains(event.target)) {
        drag = { kind: 'move', from: p, origin: { x: s.crop.rect.x, y: s.crop.rect.y } };
      } else {
        drag = { kind: 'new', from: p };
        s.crop.rect = { x: p.x, y: p.y, w: 8, h: 8 };
      }

      updateBrushCursor();
    });

    window.addEventListener('mousemove', function (event) {
      var s = state;
      if (!s || !s.crop || !drag) return;

      var p = pointAt(event);
      if (!p) return;
      event.preventDefault();

      var r = s.crop.rect;
      var W = s.crop.txSize.w;
      var H = s.crop.txSize.h;

      if (drag.kind === 'move') {
        r.x = util.clamp(drag.origin.x + (p.x - drag.from.x), 0, Math.max(0, W - r.w));
        r.y = util.clamp(drag.origin.y + (p.y - drag.from.y), 0, Math.max(0, H - r.h));
      } else if (drag.kind === 'resize') {
        resizeCropRect(s.crop, drag.handle, p);
      } else {
        var x0 = Math.min(drag.from.x, p.x);
        var y0 = Math.min(drag.from.y, p.y);
        var x1 = Math.max(drag.from.x, p.x);
        var y1 = Math.max(drag.from.y, p.y);

        r.x = util.clamp(x0, 0, Math.max(0, W - 8));
        r.y = util.clamp(y0, 0, Math.max(0, H - 8));
        r.w = util.clamp(x1 - r.x, 8, W - r.x);
        r.h = util.clamp(y1 - r.y, 8, H - r.y);

        applyCropRatio(s.crop);
      }

      syncCropBox();
    });

    window.addEventListener('mouseup', function () {
      if (!drag) return;
      drag = null;
      if (state && state.crop) {
        syncCropBox();
        updateInfo('자를 영역 ' + Math.round(state.crop.rect.w) + ' × ' +
          Math.round(state.crop.rect.h) + 'px — [이 영역으로 자르기] 로 확정합니다.');
      }
    });
  }

  function bindControls() {
    util.on('image-close', 'click', function () { close(false); });
    util.on('image-cancel', 'click', function () { close(false); });
    util.on('image-apply', 'click', function () { close(true); });

    util.on('modal-image', 'mousedown', function (ev) {
      if (ev.target === util.$('modal-image')) close(false);
    });

    Array.prototype.forEach.call(
      document.querySelectorAll('#image-tabs [data-image-tab]'),
      function (button) {
        button.addEventListener('click', function () {
          setTab(button.getAttribute('data-image-tab'));
        });
      }
    );

    Array.prototype.forEach.call(
      document.querySelectorAll('#image-modes [data-image-mode]'),
      function (button) {
        button.addEventListener('click', function () {
          setCutMode(button.getAttribute('data-image-mode'));
        });
      }
    );

    Array.prototype.forEach.call(
      document.querySelectorAll('#image-sculpt [data-image-sculpt]'),
      function (button) {
        button.addEventListener('click', function () {
          if (!state) return;
          var target = button.getAttribute('data-image-sculpt');
          if (state.sculpt === target) {
            state.sculpt = null;
            updateInfo('얼굴 성형 도구 선택을 해제했습니다.');
          } else {
            state.sculpt = target;
            state.healOn = false;
            state.mode = null;
            if (state.crop) { state.crop = null; syncCropBox(); }
            updateInfo(SCULPT_MODES[state.sculpt].hint);
          }
          syncControls();
          updateBrushCursor();
        });
      }
    );

    var slider = function (id, onChange) {
      util.on(id, 'input', function () {
        if (!state) return;
        onChange(parseFloat(this.value) || 0);
        updateValueLabels();
        updateBrushCursor();
      });
    };

    slider('image-brush-size', function (v) { state.brushSize = v; });
    slider('image-tolerance', function (v) { state.tolerance = v; });
    slider('image-magic-tolerance', function (v) { state.magicTolerance = v; });
    slider('image-sculpt-size', function (v) { state.sculptSize = v; });
    slider('image-sculpt-intensity', function (v) { state.sculptIntensity = v; });

    slider('image-sel-feather', function (v) {
      state.selectionFeather = Math.round(v);
      overlayCache = null;
      updateValueLabels();
      updateSelectionSummary();
      refreshSoon();
    });

    slider('image-blur-strength', function (v) { state.blurStrength = Math.round(v); });

    slider('image-heal-size', function (v) {
      state.healSize = Math.round(v);
      updateBrushCursor();
    });

    slider('image-vignette', function (v) {
      state.params.vignette = Math.round(v);
      state.dirty = true;
      refreshSoon();
    });

    slider('image-straighten', function (v) {
      setStraighten(Math.round(v * 2) / 2);
    });

    Array.prototype.forEach.call(
      document.querySelectorAll('#image-heal-row [data-image-heal]'),
      function (button) {
        button.addEventListener('click', function () {
          if (!state) return;
          var target = button.getAttribute('data-image-heal');
          if (target === 'on') {
            if (state.healOn) {
              state.healOn = false;
              updateInfo('잡티 제거를 껐습니다.');
            } else {
              state.healOn = true;
              state.sculpt = null;
              state.mode = null;
              if (state.crop) { state.crop = null; syncCropBox(); }
              updateInfo('점·흉터를 클릭하거나 문질러 지우세요. 주변 피부 조각으로 덮습니다.');
            }
          } else {
            state.healOn = false;
            updateInfo('잡티 제거를 껐습니다.');
          }
          syncControls();
          updateBrushCursor();
        });
      }
    );

    // 프리셋 카드는 사진마다 새로 그리므로 한 곳에서 받는다
    var presetHost = util.$('image-presets');
    if (presetHost) {
      presetHost.addEventListener('click', function (event) {
        var card = event.target.closest ? event.target.closest('[data-preset]') : null;
        if (card) applyPreset(card.getAttribute('data-preset'));
      });
    }

    var faceHost = util.$('image-face-presets');
    if (faceHost) {
      faceHost.addEventListener('click', function (event) {
        var card = event.target.closest ? event.target.closest('[data-face-preset]') : null;
        if (card) applyFacePreset(card.getAttribute('data-face-preset'));
      });
    }

    var ratioHost = util.$('image-crop-ratios');
    if (ratioHost) {
      ratioHost.addEventListener('click', function (event) {
        var btn = event.target.closest ? event.target.closest('[data-crop-ratio]') : null;
        if (btn) setCropRatio(btn.getAttribute('data-crop-ratio'));
      });
    }

    util.on('image-rot-left', 'click', function () { rotateCrop(-1); });
    util.on('image-rot-right', 'click', function () { rotateCrop(1); });
    util.on('image-flip-h', 'click', function () { flipCrop('h'); });
    util.on('image-crop-apply', 'click', function () {
      if (!state) return;
      if (!state.crop) {
        initCrop();
        state.mode = null;
        state.sculpt = null;
        state.healOn = false;
        syncCropBox();
        syncControls();
        updateInfo('자를 영역을 조절한 뒤 다시 [이 영역으로 자르기]를 누르세요.');
        return;
      }
      applyCrop();
    });
    util.on('image-crop-max', 'click', function () {
      if (!state) return;
      if (!state.crop) initCrop();
      state.mode = null;
      state.sculpt = null;
      state.healOn = false;
      maxCrop();
      syncControls();
    });
    util.on('image-crop-center', 'click', function () {
      if (!state) return;
      if (!state.crop) initCrop();
      state.mode = null;
      state.sculpt = null;
      state.healOn = false;
      centerCrop();
      syncControls();
    });
    util.on('image-crop-reset', 'click', resetCrop);

    slider('image-brightness', function (v) {
      state.params.brightness = v; state.dirty = true; clearPreset(); refreshSoon();
    });
    slider('image-contrast', function (v) {
      state.params.contrast = v; state.dirty = true; clearPreset(); refreshSoon();
    });
    slider('image-saturation', function (v) {
      state.params.saturation = v; state.dirty = true; clearPreset(); refreshSoon();
    });
    slider('image-warmth', function (v) {
      state.params.warmth = v; state.dirty = true; clearPreset(); refreshSoon();
    });

    slider('image-smooth', function (v) {
      state.smooth = v;
      state.dirty = true;
      clearPreset();
      refreshSoon();
    });
    slider('image-sharpen', function (v) {
      state.sharpen = v;
      state.dirty = true;
      clearPreset();
      refreshSoon();
    });

    util.on('image-magic-contiguous', 'change', function () {
      if (state) state.magicContiguous = !!this.checked;
    });

    util.on('image-tidy', 'change', function () {
      if (state) state.tidy = !!this.checked;
    });

    util.on('image-auto', 'click', runAuto);
    util.on('image-auto-tone', 'click', runAutoTone);
    util.on('image-undo', 'click', undo);
    util.on('image-reset', 'click', resetAll);

    util.on('image-sel-delete', 'click', deleteSelection);
    util.on('image-sel-clear', 'click', function () { clearSelection(); });
    util.on('image-sel-grow', 'click', function () { refineSelection('grow'); });
    util.on('image-sel-shrink', 'click', function () { refineSelection('shrink'); });
    util.on('image-sel-invert', 'click', function () { refineSelection('invert'); });
    util.on('image-sel-matte', 'click', matteSelection);
    util.on('image-blur-apply', 'click', blurSelection);

    util.on('image-original', 'click', function () {
      var s = state;
      if (!s) return;

      s.showOriginal = !s.showOriginal;
      this.classList.toggle('is-active', s.showOriginal);

      refreshAll();
      if (s.showOriginal) hideBrush();
    });

    window.addEventListener('resize', function () {
      if (state) fitView();
    });

    window.addEventListener('keydown', function (ev) {
      var s = state;
      if (!s) return;

      if (ev.key === 'Escape') {
        close(false);
        ev.preventDefault();
        return;
      }

      if ((ev.ctrlKey || ev.metaKey) && String(ev.key).toLowerCase() === 'z') {
        undo();
        ev.preventDefault();
        return;
      }

      if (ev.key === 'Delete' || ev.key === 'Backspace') {
        if (s.tab === 'cutout' && s.selection) {
          deleteSelection();
          ev.preventDefault();
        }
        return;
      }

      if (ev.key === '[') adjustActiveBrush(-8);
      else if (ev.key === ']') adjustActiveBrush(8);
    });
  }

  var ready = false;

  function init() {
    if (ready) return;
    ready = true;

    bindCanvas();
    bindCrop();
    bindControls();
    renderCropRatios();
  }

  IE.imgedit = {
    init: init,
    open: open,
    close: close,
    isOpen: function () { return !!state; },
    setTab: setTab,
    modes: CUT_MODES,
    sculpts: SCULPT_MODES,
    ratios: CROP_RATIOS,
    presets: TONE_PRESETS,
    strengthFor: strengthFor,
    // 테스트용
    state: function () { return state; },
    selectAt: selectAt,
    selectStroke: selectStroke,
    refineSelection: refineSelection,
    deleteSelection: deleteSelection,
    matteSelection: matteSelection,
    blurSelection: blurSelection,
    clearSelection: clearSelection,
    selectionText: selectionText,
    // 자르기 · 프리셋 · 잡티
    setCropRatio: setCropRatio,
    resizeCropRect: resizeCropRect,
    applyCropRatio: applyCropRatio,
    rotateCrop: rotateCrop,
    flipCrop: flipCrop,
    setStraighten: setStraighten,
    defaultCropRect: defaultCropRect,
    applyCrop: applyCrop,
    resetCrop: resetCrop,
    applyPreset: applyPreset,
    renderPresets: renderPresets,
    facePresets: FACE_PRESETS,
    renderFacePresets: renderFacePresets,
    applyFacePreset: applyFacePreset,
    runFaceOps: runFaceOps,
    healAt: healAt
  };
})(window.IE);
