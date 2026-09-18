window.IE = window.IE || {};

(function (IE) {
  'use strict';

  var util = IE.util;
  var api = {};

  var dragFrom = -1;
  var renderToken = 0;
  var liveThumbTimer = null;

  var STORAGE_HEIGHT_KEY = 'imgeditor.pagesbar.h';
  var MIN_BAR_H = 105;
  var MAX_BAR_H = 440;
  var DEFAULT_BAR_H = 148;

  var THUMB = { w: 96, h: 72 };

  function updateThumbDimensions(barHeight) {
    // 썸네일 가용 높이 = 전체 높이 - 헤더(34px) - 여백 및 라벨(38px)
    var availH = Math.max(24, (barHeight || DEFAULT_BAR_H) - 72);
    var h = Math.min(240, availH);
    var w = Math.round(h * (4 / 3));
    THUMB.w = w;
    THUMB.h = h;
  }

  function updateThumbElementsFast() {
    var pages = IE.doc ? IE.doc.pages() : [];
    var list = strip();
    if (!list) return;
    var thumbs = list.querySelectorAll('.page-thumb');
    for (var i = 0; i < thumbs.length; i++) {
      var page = pages[i];
      if (page) {
        var scale = Math.min(THUMB.w / page.width, THUMB.h / page.height);
        var w = Math.max(20, Math.round(page.width * scale));
        var h = Math.max(20, Math.round(page.height * scale));
        thumbs[i].style.width = w + 'px';
        thumbs[i].style.height = h + 'px';
      }
    }
  }

  function applyBarHeight(h, isDragging) {
    var bar = util.$('pagesbar');
    if (!bar) return;
    h = Math.max(MIN_BAR_H, Math.min(MAX_BAR_H, h));
    bar.style.height = h + 'px';
    bar.style.maxHeight = h + 'px';
    bar.style.setProperty('--pagesbar-h', h + 'px');
    bar.classList.toggle('is-compact', h < 135);
    updateThumbDimensions(h);
    if (!isDragging) {
      try {
        localStorage.setItem(STORAGE_HEIGHT_KEY, String(h));
      } catch (e) {}
    }
  }

  function strip() { return util.$('pages-strip'); }

  /* ------------------------------------------------------------ 렌더링 */

  function thumbStyle(page) {
    // 페이지 비율을 유지하면서 박스 안에 맞춘다
    var scale = Math.min(THUMB.w / page.width, THUMB.h / page.height);
    var w = Math.max(20, Math.round(page.width * scale));
    var h = Math.max(20, Math.round(page.height * scale));
    return 'width:' + w + 'px;height:' + h + 'px;aspect-ratio:' + (page.width / page.height) + ';';
  }

  function isThumbSmall(page) {
    var bar = util.$('pagesbar');
    var barH = bar ? (bar.offsetHeight || parseInt(bar.style.height, 10) || DEFAULT_BAR_H) : DEFAULT_BAR_H;
    if (barH < 135) return true;
    if (!page || !page.width || !page.height) return false;
    var scale = Math.min(THUMB.w / page.width, THUMB.h / page.height);
    var w = Math.round(page.width * scale);
    var h = Math.round(page.height * scale);
    return w < 62 || h < 52;
  }

  function itemHtml(index, page, active) {
    var label = IE.doc.label(index);
    var small = isThumbSmall(page);

    var hoverHtml = small ? '' : (
      '<div class="page-hover">' +
        '<button type="button" data-page-dup="' + index + '" title="복제">' +
          '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg>' +
        '</button>' +
        '<button type="button" class="danger" data-page-del="' + index + '" title="삭제">' +
          '<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/></svg>' +
        '</button>' +
      '</div>'
    );

    return '' +
      '<div class="page-item' + (active ? ' is-active' : '') + (small ? ' is-small-thumb' : '') + '" data-page="' + index + '" draggable="true">' +
        '<div class="page-thumb" style="' + thumbStyle(page) + '">' +
          '<img alt="" data-thumb="' + index + '">' +
          '<span class="page-num">' + (index + 1) + '</span>' +
          hoverHtml +
        '</div>' +
        '<div class="page-name" title="더블클릭: 이름 변경, 우클릭: 메뉴">' + util.escapeHtml(label) + '</div>' +
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

      var btnDel = util.$('btn-page-del');
      if (btnDel) btnDel.disabled = pages.length <= 1;

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

    // 현재 페이지 썸네일은 캔버스 렌더링 직후 비동기로 뽑아 템플릿 전환 시 메인 스레드 멈춤 방지
    clearTimeout(liveThumbTimer);
    liveThumbTimer = setTimeout(function () {
      if (token !== renderToken) return;
      var el = strip();
      if (!el) return;
      var live = el.querySelector('[data-thumb="' + current + '"]');
      if (live) {
        var url = liveCanvasThumb(THUMB.w * 2, THUMB.h * 2);
        if (url) {
          live.src = url;
          if (pages[current]) pages[current].thumb = url;
        }
      }
    }, 40);
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

  var activeContextMenu = null;

  function closeContextMenu() {
    if (activeContextMenu && activeContextMenu.parentNode) {
      activeContextMenu.parentNode.removeChild(activeContextMenu);
    }
    activeContextMenu = null;
    window.removeEventListener('click', closeContextMenu);
    window.removeEventListener('contextmenu', onDocContextMenu);
  }

  function onDocContextMenu(ev) {
    if (activeContextMenu && !activeContextMenu.contains(ev.target)) {
      closeContextMenu();
    }
  }

  function showContextMenu(x, y, index) {
    closeContextMenu();

    var pages = IE.doc ? IE.doc.pages() : [];
    var totalPages = pages.length;

    var menu = document.createElement('div');
    menu.className = 'page-context-menu';

    menu.innerHTML = '' +
      '<button type="button" class="page-context-item" data-act="goto">' +
        '<svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>' +
        '<span>이 페이지로 이동</span>' +
      '</button>' +
      '<button type="button" class="page-context-item" data-act="dup">' +
        '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg>' +
        '<span>페이지 복제</span>' +
      '</button>' +
      '<button type="button" class="page-context-item" data-act="rename">' +
        '<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>' +
        '<span>이름 바꾸기</span>' +
      '</button>' +
      '<div class="page-context-sep"></div>' +
      '<button type="button" class="page-context-item danger" data-act="del"' + (totalPages <= 1 ? ' disabled' : '') + '>' +
        '<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/></svg>' +
        '<span>페이지 삭제</span>' +
      '</button>';

    menu.addEventListener('click', function (ev) {
      var btn = ev.target.closest('.page-context-item');
      if (!btn || btn.disabled) return;
      var act = btn.getAttribute('data-act');
      closeContextMenu();

      if (act === 'goto') {
        IE.doc.goto(index);
      } else if (act === 'dup') {
        IE.doc.goto(index);
        IE.doc.duplicate();
      } else if (act === 'rename') {
        renamePage(index);
      } else if (act === 'del') {
        if (IE.doc.pages().length <= 1) {
          util.toast('페이지가 하나뿐이라 삭제할 수 없습니다.');
          return;
        }
        if (window.confirm('「' + IE.doc.label(index) + '」 페이지를 삭제할까요?')) {
          IE.doc.remove(index);
        }
      }
    });

    document.body.appendChild(menu);

    var rect = menu.getBoundingClientRect();
    var posX = Math.min(x, window.innerWidth - rect.width - 8);
    var posY = Math.min(y, window.innerHeight - rect.height - 8);
    if (posY < 8) posY = 8;
    menu.style.left = posX + 'px';
    menu.style.top = posY + 'px';

    activeContextMenu = menu;

    setTimeout(function () {
      window.addEventListener('click', closeContextMenu);
      window.addEventListener('contextmenu', onDocContextMenu);
    }, 10);
  }

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

      item.addEventListener('contextmenu', function (ev) {
        ev.preventDefault();
        showContextMenu(ev.clientX, ev.clientY, index);
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

  function initResizer() {
    var resizer = util.$('pages-resizer');
    var bar = util.$('pagesbar');
    if (!resizer || !bar) return;

    var savedH = parseInt(localStorage.getItem(STORAGE_HEIGHT_KEY), 10);
    if (savedH && !isNaN(savedH)) {
      applyBarHeight(savedH, false);
    } else {
      applyBarHeight(DEFAULT_BAR_H, false);
    }

    var startY = 0;
    var startH = 0;
    var dragging = false;

    function onMouseMove(e) {
      if (!dragging) return;
      var dy = startY - e.clientY;
      var newH = startH + dy;
      applyBarHeight(newH, true);
      updateThumbElementsFast();
    }

    function onMouseUp() {
      if (!dragging) return;
      dragging = false;
      resizer.classList.remove('is-dragging');
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      applyBarHeight(bar.offsetHeight, false);
      refresh();
      if (IE.state && IE.state.autoFit && IE.canvas) {
        IE.canvas.zoomToFit();
      }
    }

    resizer.addEventListener('mousedown', function (e) {
      e.preventDefault();
      dragging = true;
      startY = e.clientY;
      startH = bar.offsetHeight;
      resizer.classList.add('is-dragging');
      document.body.style.cursor = 'row-resize';
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });
  }

  /* --------------------------------------------------------------- 초기화 */

  function init() {
    initResizer();

    util.on('btn-pages', 'click', toggle);
    util.on('btn-pages-close', 'click', function () { setVisible(false); });

    util.on('btn-page-add', 'click', function () {
      if (!isVisible()) setVisible(true);
      IE.doc.add();
    });

    util.on('btn-page-dup', 'click', function () {
      if (!IE.doc) return;
      IE.doc.duplicate();
    });

    util.on('btn-page-del', 'click', function () {
      if (!IE.doc) return;
      var pages = IE.doc.pages();
      if (pages.length <= 1) {
        util.toast('페이지가 하나뿐이라 삭제할 수 없습니다.');
        return;
      }
      var cur = IE.doc.index();
      if (!window.confirm('「' + IE.doc.label(cur) + '」 페이지를 삭제할까요?')) return;
      IE.doc.remove(cur);
    });

    util.on('btn-page-settings', 'click', function () { IE.pagesettings.open(); });
    util.on('btn-page-preview', 'click', function () { if (IE.preview) IE.preview.open(); });
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
  api.applyBarHeight = applyBarHeight;

  IE.pages = api;
})(window.IE);
