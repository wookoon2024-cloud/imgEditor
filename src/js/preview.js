window.IE = window.IE || {};

(function (IE) {
  'use strict';

  var util = IE.util;
  var api = {};

  var currentIndex = 0;
  var isOpen = false;
  var isRendering = false;

  function modal() { return util.$('modal-preview'); }
  function previewImg() { return util.$('preview-img'); }
  function counter() { return util.$('preview-counter'); }
  function titleEl() { return util.$('preview-doc-title'); }
  function prevBtn() { return util.$('btn-preview-prev'); }
  function nextBtn() { return util.$('btn-preview-next'); }
  function leftArrow() { return util.$('btn-preview-nav-left'); }
  function rightArrow() { return util.$('btn-preview-nav-right'); }

  function updateNav() {
    var pages = IE.doc ? IE.doc.pages() : [];
    var total = Math.max(1, pages.length);
    var hasPrev = currentIndex > 0;
    var hasNext = currentIndex < total - 1;

    if (counter()) counter().textContent = (currentIndex + 1) + ' / ' + total;
    if (titleEl()) titleEl().textContent = IE.state ? IE.state.docName : '미리보기';

    if (prevBtn()) prevBtn().disabled = !hasPrev;
    if (nextBtn()) nextBtn().disabled = !hasNext;
    if (leftArrow()) leftArrow().style.display = hasPrev ? '' : 'none';
    if (rightArrow()) rightArrow().style.display = hasNext ? '' : 'none';
  }

  function renderCurrent() {
    if (!IE.doc) return;
    var pages = IE.doc.pages();
    if (!pages.length) return;

    if (currentIndex < 0) currentIndex = 0;
    if (currentIndex >= pages.length) currentIndex = pages.length - 1;

    updateNav();

    var page = pages[currentIndex];
    var img = previewImg();
    if (!img) return;

    var thisIndex = currentIndex;

    // 1. FAST PATH: 현재 편집 중인 페이지는 캔버스에서 즉시 캡처 (0초 지연)
    var hasFastImg = false;
    if (thisIndex === IE.doc.index() && IE.pages && IE.pages.liveCanvasThumb) {
      var liveUrl = IE.pages.liveCanvasThumb(1920, 1080);
      if (liveUrl) {
        img.src = liveUrl;
        img.style.opacity = '1';
        hasFastImg = true;
      }
    } else if (page.thumb) {
      img.src = page.thumb;
      img.style.opacity = '0.9';
      hasFastImg = true;
    }

    if (!hasFastImg) {
      img.style.opacity = '0.35';
    }

    isRendering = true;

    // 2. HIGH-RES PATH: 비동기 2x 고해상도 렌더링으로 자연스럽게 교체
    IE.doc.renderFull(page, 'png', 2, function (dataURL) {
      isRendering = false;
      if (!isOpen || currentIndex !== thisIndex) return;
      if (img && dataURL) {
        img.src = dataURL;
        img.style.opacity = '1';
      }
    });
  }

  function gotoPage(index) {
    if (!IE.doc) return;
    var pages = IE.doc.pages();
    if (index < 0 || index >= pages.length) return;
    currentIndex = index;
    renderCurrent();
  }

  function prev() {
    if (currentIndex > 0) {
      gotoPage(currentIndex - 1);
    }
  }

  function next() {
    var pages = IE.doc ? IE.doc.pages() : [];
    if (currentIndex < pages.length - 1) {
      gotoPage(currentIndex + 1);
    }
  }

  function toggleFullscreen() {
    var elem = util.$('preview-container');
    if (!elem) return;
    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) elem.requestFullscreen();
      else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
      else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
  }

  function onKeyDown(e) {
    if (!isOpen) return;

    if (e.key === 'Escape') {
      if (!document.fullscreenElement) {
        close();
      }
      return;
    }

    if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      prev();
    } else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
      e.preventDefault();
      next();
    } else if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      toggleFullscreen();
    } else if (e.key === 'Home') {
      e.preventDefault();
      gotoPage(0);
    } else if (e.key === 'End') {
      var pages = IE.doc ? IE.doc.pages() : [];
      e.preventDefault();
      gotoPage(pages.length - 1);
    }
  }

  function open(optIndex) {
    if (!IE.doc) return;
    IE.doc.sync();

    var m = modal();
    if (!m) return;

    isOpen = true;
    m.hidden = false;
    m.style.display = 'flex';

    if (typeof optIndex === 'number') {
      currentIndex = optIndex;
    } else {
      currentIndex = IE.doc.index();
    }

    renderCurrent();
    window.addEventListener('keydown', onKeyDown);
  }

  function close() {
    var m = modal();
    if (m) {
      m.hidden = true;
      m.style.display = 'none';
    }
    isOpen = false;
    window.removeEventListener('keydown', onKeyDown);
    if (document.fullscreenElement) {
      try { document.exitFullscreen(); } catch (e) {}
    }
  }

  function init() {
    util.on('btn-preview', 'click', function () { open(); });
    util.on('btn-page-preview', 'click', function () { open(); });
    util.on('btn-preview-close', 'click', close);
    util.on('btn-preview-prev', 'click', prev);
    util.on('btn-preview-next', 'click', next);
    util.on('btn-preview-nav-left', 'click', prev);
    util.on('btn-preview-nav-right', 'click', next);
    util.on('btn-preview-fullscreen', 'click', toggleFullscreen);

    var m = modal();
    if (m) {
      m.addEventListener('click', function (e) {
        if (e.target === m || e.target.id === 'preview-stage' || e.target.id === 'preview-body') {
          close();
        }
      });
    }
  }

  api.init = init;
  api.open = open;
  api.close = close;
  api.prev = prev;
  api.next = next;
  api.gotoPage = gotoPage;

  IE.preview = api;
})(window.IE);
