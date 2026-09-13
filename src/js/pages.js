window.IE = window.IE || {};

(function (IE) {
  'use strict';

  var util = IE.util;
  var api = {};

  var dragFrom = -1;
  var renderToken = 0;

  var THUMB = { w: 96, h: 72 };

  function strip() { return util.$('pages-strip'); }

  /* ------------------------------------------------------------ 렌더링 */

  function thumbStyle(page) {
    // 페이지 비율을 유지하면서 박스 안에 맞춘다
    var scale = Math.min(THUMB.w / page.width, THUMB.h / page.height);
    return 'width:' + Math.max(24, Math.round(page.width * scale)) + 'px;' +
      'height:' + Math.max(24, Math.round(page.height * scale)) + 'px';
  }

  function itemHtml(index, page, active) {
    var label = IE.doc.label(index);

    return '' +
      '<div class="page-item' + (active ? ' is-active' : '') + '" data-page="' + index + '" draggable="true">' +
        '<div class="page-thumb" style="' + thumbStyle(page) + '">' +
          '<img alt="" data-thumb="' + index + '">' +
          '<span class="page-num">' + (index + 1) + '</span>' +
          '<div class="page-hover">' +
            '<button type="button" data-page-dup="' + index + '" title="복제">' +
              '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg>' +
            '</button>' +
            '<button type="button" class="danger" data-page-del="' + index + '" title="삭제">' +
              '<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/></svg>' +
            '</button>' +
          '</div>' +
        '</div>' +
        '<div class="page-name" title="더블클릭하면 이름을 바꿉니다">' + util.escapeHtml(label) + '</div>' +
      '</div>';
  }

  function addTileHtml() {
    return '<button type="button" class="page-add" id="page-add-tile" title="페이지 추가">' +
      '<svg viewBox="0 0 24 24"><path d="M12 6v12M6 12h12"/></svg>' +
      '<span>페이지 추가</span>' +
    '</button>';
  }

  function refresh() {
    if (!IE.doc) return;

    var bar = util.$('pagesbar');
    if (!bar) return;

    // 재진입 가드: 패널 갱신이 다시 패널 갱신을 부르면 무한 루프가 된다
    if (api._refreshing) return;
    api._refreshing = true;

    try {
      var pages = IE.doc.pages();
      var current = IE.doc.index();

      util.$('pages-count').textContent = String(pages.length);
      util.$('btn-page-left').disabled = current <= 0;
      util.$('btn-page-right').disabled = current >= pages.length - 1;

      strip().innerHTML = pages.map(function (page, i) {
        return itemHtml(i, page, i === current);
      }).join('') + addTileHtml();

      loadThumbs();
      bindItems();
    } finally {
      api._refreshing = false;
    }
  }

  /** 썸네일은 비동기로 채운다 (현재 페이지는 캔버스에서 바로 뽑아 빠르게) */
  function loadThumbs() {
    var pages = IE.doc.pages();
    var current = IE.doc.index();
    var token = ++renderToken;

    pages.forEach(function (page, i) {
      var image = strip().querySelector('[data-thumb="' + i + '"]');
      if (!image) return;

      if (page.thumb) {
        image.src = page.thumb;
        return;
      }

      IE.doc.renderThumb(page, THUMB.w * 2, THUMB.h * 2, function (url) {
        if (token !== renderToken) return;
        page.thumb = url;
        var target = strip().querySelector('[data-thumb="' + i + '"]');
        if (target) target.src = url;
      });
    });

    // 현재 페이지는 실제 캔버스 상태를 즉시 반영
    var live = strip().querySelector('[data-thumb="' + current + '"]');
    if (live) {
      var url = liveCanvasThumb(THUMB.w * 2, THUMB.h * 2);
      if (url) {
        live.src = url;
        pages[current].thumb = url;
      }
    }
  }

  /**
   * 현재 캔버스에서 직접 썸네일을 뽑는다.
   *
   * 주의: 여기서 discardActiveObject() 나 setActiveObject() 를 부르면 안 된다.
   *   setActiveObject → selection:created → notifyPanels → pages.refresh
   *     → loadThumbs → (여기) → discardActiveObject
   *   로 이어져 방금 한 선택이 사라진다 (정렬·복사·삭제가 모두 실패한다).
   *
   * 대신 _renderOverlay 를 잠시 막아 선택 테두리만 빼고 그린다.
   */
  function liveCanvasThumb(maxW, maxH) {
    var canvas = IE.state.canvas;
    if (!canvas) return null;

    var zoom = canvas.getZoom();
    var url = null;
    var previousOverlay = canvas._renderOverlay;

    try {
      canvas._renderOverlay = function () {};
      canvas.setDimensions({ width: IE.state.docW, height: IE.state.docH });
      canvas.setZoom(1);
      canvas.renderAll();

      var scale = Math.min(maxW / IE.state.docW, maxH / IE.state.docH);
      url = canvas.toDataURL({
        format: 'png',
        multiplier: scale,
        enableRetinaScaling: false
      });
    } catch (err) {
      url = null;
    }

    canvas._renderOverlay = previousOverlay;
    canvas.setDimensions({
      width: Math.round(IE.state.docW * zoom),
      height: Math.round(IE.state.docH * zoom)
    });
    canvas.setZoom(zoom);
    canvas.requestRenderAll();

    return url;
  }

  /* ------------------------------------------------------------- 이벤트 */

  function bindItems() {
    var list = strip();

    var addTile = list.querySelector('#page-add-tile');
    if (addTile) {
      addTile.addEventListener('click', function () { IE.doc.add(); });
    }

    Array.prototype.forEach.call(list.querySelectorAll('.page-item'), function (item) {
      var index = parseInt(item.getAttribute('data-page'), 10);

      item.addEventListener('click', function (ev) {
        if (ev.target.closest && ev.target.closest('.page-hover')) return;
        if (index === IE.doc.index()) return;
        IE.doc.goto(index);
      });

      item.addEventListener('dblclick', function () {
        renamePage(index);
      });

      item.addEventListener('dragstart', function (ev) {
        dragFrom = index;
        item.classList.add('is-dragging');
        if (ev.dataTransfer) {
          ev.dataTransfer.effectAllowed = 'move';
          ev.dataTransfer.setData('text/plain', String(index));
        }
      });

      item.addEventListener('dragend', function () {
        dragFrom = -1;
        item.classList.remove('is-dragging');
      });

      item.addEventListener('dragover', function (ev) {
        if (dragFrom < 0 || dragFrom === index) return;
        ev.preventDefault();
        item.classList.add('is-drop');
      });

      item.addEventListener('dragleave', function () {
        item.classList.remove('is-drop');
      });

      item.addEventListener('drop', function (ev) {
        ev.preventDefault();
        item.classList.remove('is-drop');
        if (dragFrom < 0 || dragFrom === index) return;
        IE.doc.move(dragFrom, index);
        dragFrom = -1;
      });
    });

    Array.prototype.forEach.call(list.querySelectorAll('[data-page-dup]'), function (button) {
      button.addEventListener('click', function (ev) {
        ev.stopPropagation();
        IE.doc.goto(parseInt(button.getAttribute('data-page-dup'), 10));
        IE.doc.duplicate();
      });
    });

    Array.prototype.forEach.call(list.querySelectorAll('[data-page-del]'), function (button) {
      button.addEventListener('click', function (ev) {
        ev.stopPropagation();

        var index = parseInt(button.getAttribute('data-page-del'), 10);
        var pages = IE.doc.pages();

        if (pages.length <= 1) {
          util.toast('페이지가 하나뿐이라 삭제할 수 없습니다.');
          return;
        }
        if (!window.confirm('「' + IE.doc.label(index) + '」 페이지를 삭제할까요?')) return;

        IE.doc.remove(index);
      });
    });
  }

  function renamePage(index) {
    var name = window.prompt('페이지 이름', IE.doc.label(index));
    if (name === null) return;
    IE.doc.rename(index, name);
    refresh();
  }

  /* ------------------------------------------------------------ 표시/숨김 */

  function setVisible(visible) {
    var bar = util.$('pagesbar');
    if (!bar) return;
    bar.hidden = !visible;

    var button = util.$('btn-pages');
    if (button) button.classList.toggle('is-off', !visible);

    if (visible) refresh();

    if (IE.state.autoFit && IE.canvas) {
      setTimeout(function () { IE.canvas.zoomToFit(); }, 0);
    }
  }

  function toggle() {
    setVisible(util.$('pagesbar').hidden);
  }

  function isVisible() {
    var bar = util.$('pagesbar');
    return !!(bar && !bar.hidden);
  }

  /* --------------------------------------------------------------- 초기화 */

  function init() {
    util.on('btn-pages', 'click', toggle);
    util.on('btn-pages-close', 'click', function () { setVisible(false); });

    util.on('btn-page-add', 'click', function () {
      if (!isVisible()) setVisible(true);
      IE.doc.add();
    });

    util.on('btn-page-settings', 'click', function () { IE.pagesettings.open(); });
    util.on('btn-page-export', 'click', function () { IE.exporter.exportAllPages('png', 2); });
    util.on('btn-page-left', 'click', function () { IE.doc.goto(IE.doc.index() - 1); });
    util.on('btn-page-right', 'click', function () { IE.doc.goto(IE.doc.index() + 1); });
  }

  api.init = init;
  api.refresh = refresh;
  api.setVisible = setVisible;
  api.toggle = toggle;
  api.isVisible = isVisible;
  api.liveCanvasThumb = liveCanvasThumb;
  api.renamePage = renamePage;

  IE.pages = api;
})(window.IE);
