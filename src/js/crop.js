window.IE = window.IE || {};

(function (IE) {
  'use strict';

  var util = IE.util;
  var api = {};

  var target = null;
  var dragging = false;
  var lastPoint = null;
  var wheelBound = false;

  var MIN_CROP = 24;

  function canvas() { return IE.state.canvas; }

  function isActive() { return !!target; }

  api.isActive = isActive;

  /** 표시 영역(프레임) 정보를 얻는다. 없으면 현재 보이는 크기로 만든다 */
  function ensureFrame(img) {
    if (!img.frameRect) {
      img.frameRect = {
        left: img.left,
        top: img.top,
        width: img.width * (img.scaleX || 1),
        height: img.height * (img.scaleY || 1),
        angle: img.angle || 0
      };
    }
    return img.frameRect;
  }

  /** 크롭 정보가 없으면 현재 보이는 영역을 크롭으로 본다 */
  function ensureCrop(img) {
    if (img.cropInfo) return img.cropInfo;

    var cropX = img.cropX || 0;
    var cropY = img.cropY || 0;

    img.cropInfo = {
      x: cropX,
      y: cropY,
      width: img.width,
      height: img.height,
      sourceW: img.width + cropX * 2,
      sourceH: img.height + cropY * 2
    };

    if (typeof img.cropOffsetX !== 'number') img.cropOffsetX = 0;
    if (typeof img.cropOffsetY !== 'number') img.cropOffsetY = 0;

    return img.cropInfo;
  }

  /** 크롭 값 -> 표시 크기/위치 반영 */
  function syncFromCrop(img) {
    var info = img.cropInfo;
    var frame = ensureFrame(img);

    img.set({
      width: info.width,
      height: info.height,
      left: frame.left,
      top: frame.top,
      scaleX: frame.width / info.width,
      scaleY: frame.height / info.height
    });
    img.setCoords();
  }

  /** 슬라이더 UI 와 동기화되도록 오프셋도 갱신 */
  function syncOffsets(img) {
    var info = img.cropInfo;
    var rangeX = info.sourceW - info.width;
    var rangeY = info.sourceH - info.height;

    img.cropOffsetX = rangeX > 1 ? (info.x / rangeX) * 2 - 1 : 0;
    img.cropOffsetY = rangeY > 1 ? (info.y / rangeY) * 2 - 1 : 0;
  }

  /** 화면(장면) 좌표 이동량을 사진 안에서의 이동으로 환산 */
  function dragBy(dxScene, dyScene) {
    var img = target;
    if (!img) return;

    var info = img.cropInfo;
    if (!info) return;

    var scaleX = img.scaleX || 1;
    var scaleY = img.scaleY || 1;

    // 사진을 오른쪽으로 끌면 더 왼쪽 부분이 보인다 -> cropX 감소
    info.x = util.clamp(info.x - dxScene / scaleX, 0, Math.max(0, info.sourceW - info.width));
    info.y = util.clamp(info.y - dyScene / scaleY, 0, Math.max(0, info.sourceH - info.height));

    img.set({ cropX: info.x, cropY: info.y });
    syncOffsets(img);
    canvas().requestRenderAll();
  }

  /** 휠 확대/축소 — 프레임 비율을 유지한 채 사진을 확대/축소 */
  function zoomBy(factor) {
    var img = target;
    if (!img || !factor) return;

    var info = img.cropInfo;
    if (!info) return;

    var frame = ensureFrame(img);
    var aspect = frame.width / frame.height;

    var newW = info.width / factor;
    var newH = newW / aspect;

    if (newW > info.sourceW) { newW = info.sourceW; newH = newW / aspect; }
    if (newH > info.sourceH) { newH = info.sourceH; newW = newH * aspect; }
    if (newW < MIN_CROP) { newW = MIN_CROP; newH = newW / aspect; }
    if (newH < MIN_CROP) { newH = MIN_CROP; newW = newH * aspect; }

    var centerX = info.x + info.width / 2;
    var centerY = info.y + info.height / 2;

    info.width = newW;
    info.height = newH;
    info.x = util.clamp(centerX - newW / 2, 0, Math.max(0, info.sourceW - newW));
    info.y = util.clamp(centerY - newH / 2, 0, Math.max(0, info.sourceH - newH));

    img.set({ cropX: info.x, cropY: info.y });
    syncFromCrop(img);
    syncOffsets(img);
    canvas().requestRenderAll();
  }

  /* ------------------------------------------------------------- 오버레이 */

  function draw(ctx) {
    if (!target) return;

    var sheet = canvas();
    var viewport = sheet.viewportTransform;
    var zoom = sheet.getZoom();
    var frame = target.frameRect;
    if (!frame) return;

    var w = IE.state.docW;
    var h = IE.state.docH;

    ctx.save();
    ctx.translate(viewport[4], viewport[5]);
    ctx.scale(zoom, zoom);

    // 프레임 바깥을 어둡게 해서 시선을 모은다
    ctx.fillStyle = 'rgba(15, 23, 42, 0.42)';
    ctx.fillRect(-w * 2, -h * 2, w * 5, frame.top + h * 2);
    ctx.fillRect(-w * 2, frame.top + frame.height, w * 5, h * 5);
    ctx.fillRect(-w * 2, frame.top, frame.left + w * 2, frame.height);
    ctx.fillRect(frame.left + frame.width, frame.top, w * 3, frame.height);

    // 삼분할 안내선
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1 / zoom;
    for (var i = 1; i <= 2; i++) {
      var x = frame.left + (frame.width * i) / 3;
      var y = frame.top + (frame.height * i) / 3;

      ctx.beginPath();
      ctx.moveTo(x, frame.top);
      ctx.lineTo(x, frame.top + frame.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(frame.left, y);
      ctx.lineTo(frame.left + frame.width, y);
      ctx.stroke();
    }

    // 프레임 테두리
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2 / zoom;
    ctx.setLineDash([]);
    ctx.strokeRect(frame.left, frame.top, frame.width, frame.height);
    ctx.restore();
  }

  function syncBadge() {
    var badge = util.$('crop-badge');
    if (!badge) return;
    badge.hidden = !target;

    if (!target) return;

    var info = target.cropInfo;
    var pct = Math.round((info.width / info.sourceW) * 100);
    var zoomOut = util.$('crop-zoom');
    if (zoomOut) zoomOut.textContent = pct + '%';
  }

  /* --------------------------------------------------------------- 진입/종료 */

  api.enter = function (img) {
    if (!img || img.kind !== 'image') return false;
    if (target === img) return true;

    if (target) api.exit(false);

    ensureFrame(img);
    ensureCrop(img);

    target = img;

    img.selectable = false;
    img.evented = false;

    var sheet = canvas();
    sheet.skipTargetFind = true;
    sheet.discardActiveObject();
    sheet.defaultCursor = 'move';
    sheet.hoverCursor = 'move';
    sheet.setCursor('move');
    sheet.requestRenderAll();

    bindWheel();
    syncBadge();

    util.toast('사진을 끌어 위치를 맞추고, 휠로 확대/축소하세요. Esc 로 끝냅니다.');

    if (IE.app) IE.app.updateStatus();
    return true;
  };

  api.exit = function (commit) {
    if (!target) return;

    var img = target;
    target = null;

    img.selectable = true;
    img.evented = true;
    img.setCoords();

    var sheet = canvas();
    sheet.skipTargetFind = false;
    sheet.defaultCursor = 'default';
    sheet.hoverCursor = 'move';
    sheet.setCursor('default');
    sheet.setActiveObject(img);
    sheet.requestRenderAll();

    syncBadge();

    if (commit !== false && IE.state.history) IE.state.history.snapshot();

    if (IE.panels) IE.panels.refresh();
    if (IE.app) IE.app.updateStatus();
  };

  api.toggle = function (img) {
    if (isActive()) api.exit(true);
    else api.enter(img || canvas().getActiveObject());
  };

  api.reset = function () {
    if (!target) return;
    var info = target.cropInfo;

    info.x = (info.sourceW - info.width) / 2;
    info.y = (info.sourceH - info.height) / 2;

    target.set({ cropX: info.x, cropY: info.y });
    syncFromCrop(target);
    syncOffsets(target);
    canvas().requestRenderAll();
    syncBadge();
  };

  /* --------------------------------------------------------------- 이벤트 */

  function bindWheel() {
    if (wheelBound) return;
    wheelBound = true;

    var stage = util.$('stage');
    if (!stage) return;

    stage.addEventListener('wheel', function (ev) {
      if (!target) return;

      ev.preventDefault();
      ev.stopPropagation();

      zoomBy(ev.deltaY < 0 ? 1.06 : 1 / 1.06);
      syncBadge();
    }, { passive: false, capture: true });
  }

  api.init = function () {
    var sheet = canvas();

    sheet.on('mouse:down', function (opt) {
      if (!target) return;

      var ev = opt.e;
      if (ev.button !== 0) return;

      var pointer = sheet.getPointer(ev);
      var frame = target.frameRect;

      var inside = pointer.x >= frame.left && pointer.x <= frame.left + frame.width &&
        pointer.y >= frame.top && pointer.y <= frame.top + frame.height;

      if (!inside) return;

      dragging = true;
      lastPoint = pointer;
      sheet.setCursor('grabbing');
      ev.preventDefault();
    });

    sheet.on('mouse:move', function (opt) {
      if (!target || !dragging || !lastPoint) return;

      var pointer = sheet.getPointer(opt.e);
      dragBy(pointer.x - lastPoint.x, pointer.y - lastPoint.y);
      lastPoint = pointer;
    });

    sheet.on('mouse:up', function () {
      if (!dragging) return;
      dragging = false;
      lastPoint = null;
      if (target) {
        canvas().setCursor('move');
        syncBadge();
      }
    });

    sheet.on('after:render', function () { draw(sheet.contextContainer); });

    sheet.on('mouse:dblclick', function () {
      if (!target) return;
      // 크롭 모드에서는 더블클릭으로 종료
      api.exit(true);
    });

    util.on('crop-exit', 'click', function () { api.exit(true); });
    util.on('crop-reset', 'click', function () { api.reset(); });
  };

  // 휠 확대/축소와 드래그 이동은 UI 이벤트와 테스트 양쪽에서 같은 경로를 쓴다
  api.dragBy = function (dx, dy) { dragBy(dx, dy); };
  api.zoomBy = function (factor) { zoomBy(factor); };

  IE.crop = api;
})(window.IE);
