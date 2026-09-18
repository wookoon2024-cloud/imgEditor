window.IE = window.IE || {};

(function (IE) {
  'use strict';

  var util = IE.util;
  var api = {};

  /**
   * 문서 = 여러 페이지. 현재 페이지의 내용만 실제 canvas 에 올라가 있고,
   * 나머지 페이지는 fabric JSON 으로 보관한다. 페이지를 옮길 때 sync/apply 를 거친다.
   */

  function makePage(width, height, background) {
    return {
      id: util.uid('page'),
      name: '',
      width: width || 1240,
      height: height || 1754,
      background: background || '#ffffff',
      json: null,
      thumb: null
    };
  }

  api.makePage = makePage;

  function ensure() {
    if (!IE.state.pages) IE.state.pages = [];
    if (typeof IE.state.pageIndex !== 'number') IE.state.pageIndex = 0;
    if (!IE.state.pages.length) {
      IE.state.pages.push(makePage(IE.state.docW, IE.state.docH, '#ffffff'));
      IE.state.pageIndex = 0;
    }
    if (IE.state.pageIndex >= IE.state.pages.length) {
      IE.state.pageIndex = IE.state.pages.length - 1;
    }
  }

  api.pages = function () { ensure(); return IE.state.pages; };
  api.index = function () { ensure(); return IE.state.pageIndex; };
  api.current = function () { ensure(); return IE.state.pages[IE.state.pageIndex]; };
  api.count = function () { return api.pages().length; };

  api.label = function (index) {
    var page = api.pages()[index];
    if (!page) return String(index + 1);
    return page.name || String(index + 1);
  };

  /** 현재 캔버스 상태를 현재 페이지 레코드에 저장 */
  api.sync = function () {
    ensure();
    var canvas = IE.state.canvas;
    var page = api.current();
    if (!canvas || !page) return;

    // 재진입 가드: 직렬화 도중 다시 sync 가 불리면 무한 루프가 된다
    if (api._syncing) {
      throw new Error('doc.sync 재진입 감지');
    }
    api._syncing = true;

    try {
      page.json = canvas.toJSON(util.EXTRA_PROPS);
    } finally {
      api._syncing = false;
    }

    page.width = IE.state.docW;
    page.height = IE.state.docH;
    page.background = canvas.backgroundColor || '#ffffff';
    page.thumb = null;

    // 2페이지 이상일 때만 이름을 자동 부여한다 (1페이지 문서는 이름 없음)
    if (!page.name && IE.state.pages.length > 1) {
      page.name = '페이지 ' + (IE.state.pageIndex + 1);
    }
  };

  /** 페이지 레코드를 캔버스에 올린다. history 잠금은 호출자가 관리한다. */
  api.apply = function (page, done) {
    var canvas = IE.state.canvas;
    if (!canvas || !page) { if (done) done(); return; }

    canvas.clear();
    canvas.backgroundColor = page.background || '#ffffff';
    IE.canvas.setDocSize(page.width, page.height);

    var objects = page.json && page.json.objects;

    var finish = function () {
      canvas.backgroundColor = page.background || '#ffffff';
      canvas.setDimensions({ width: page.width, height: page.height });
      canvas.setZoom(1);
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      if (IE.guides) IE.guides.clear();
      if (done) done();
    };

    if (!objects || !objects.length) {
      finish();
      return;
    }

    canvas.loadFromJSON(page.json, finish, IE.table.reviver);
  };

  /** 다른 페이지로 이동 */
  api.goto = function (index, done) {
    ensure();
    var pages = api.pages();
    if (index < 0 || index >= pages.length) return false;

    if (index === IE.state.pageIndex) {
      if (done) done();
      return true;
    }

    api.sync();
    IE.state.pageIndex = index;

    var history = IE.state.history;
    var wasLocked = history.locked;
    history.locked = true;

    IE.state.docW = pages[index].width;
    IE.state.docH = pages[index].height;

    api.apply(pages[index], function () {
      history.locked = wasLocked;
      if (IE.canvas) IE.canvas.zoomToFit();
      if (IE.panels) IE.panels.refresh();
      if (IE.app) IE.app.updateStatus();
      if (done) done();
    });

    return true;
  };

  /** 새 페이지 추가 (현재 페이지 뒤) */
  api.add = function (width, height, background) {
    ensure();
    api.sync();

    var page = makePage(
      width || IE.state.docW,
      height || IE.state.docH,
      background || api.current().background || '#ffffff'
    );

    var at = IE.state.pageIndex + 1;
    IE.state.pages.splice(at, 0, page);
    renumber();

    IE.state.history.snapshot();
    api.goto(at);
    return page;
  };

  /** 현재 페이지 복제 */
  api.duplicate = function () {
    ensure();
    api.sync();

    var source = api.current();
    var copy = {
      id: util.uid('page'),
      name: '',
      width: source.width,
      height: source.height,
      background: source.background,
      json: util.clone(source.json),
      thumb: null
    };

    var at = IE.state.pageIndex + 1;
    IE.state.pages.splice(at, 0, copy);
    renumber();

    IE.state.history.snapshot();
    api.goto(at);
    return copy;
  };

  /** 페이지 삭제 (최소 1장은 남긴다) */
  api.remove = function (index) {
    ensure();
    var pages = api.pages();
    if (pages.length <= 1) return false;

    var target = (typeof index === 'number') ? index : IE.state.pageIndex;
    if (target < 0 || target >= pages.length) return false;

    var wasCurrent = (target === IE.state.pageIndex);

    // 현재 페이지를 지우는 경우, 지우기 전에 다른 페이지로 빠져나간다
    if (wasCurrent && pages.length > 1) {
      api.sync();
      var fallback = (target === pages.length - 1) ? target - 1 : target + 1;
      IE.state.pageIndex = fallback;
      pages.splice(target, 1);
      renumber();

      var history = IE.state.history;
      var wasLocked = history.locked;
      history.locked = true;
      var next = api.pages()[IE.state.pageIndex];
      IE.state.docW = next.width;
      IE.state.docH = next.height;
      api.apply(next, function () {
        history.locked = wasLocked;
        history.snapshot();
        if (IE.canvas) IE.canvas.zoomToFit();
        if (IE.panels) IE.panels.refresh();
        if (IE.app) IE.app.updateStatus();
      });
      return true;
    }

    pages.splice(target, 1);
    renumber();
    if (target < IE.state.pageIndex) IE.state.pageIndex -= 1;

    IE.state.history.snapshot();
    if (IE.panels) IE.panels.refresh();
    if (IE.app) IE.app.updateStatus();
    return true;
  };

  /** 페이지 순서 이동 */
  api.move = function (from, to) {
    ensure();
    var pages = api.pages();
    if (from < 0 || from >= pages.length) return false;
    if (to < 0 || to >= pages.length) return false;
    if (from === to) return false;

    var currentPage = api.current();
    var wasLocked = IE.state.history.locked;
    IE.state.history.locked = true;
    api.sync();
    IE.state.history.locked = wasLocked;

    var moved = pages.splice(from, 1)[0];
    pages.splice(to, 0, moved);

    IE.state.pageIndex = pages.indexOf(currentPage);
    renumber();

    IE.state.history.snapshot();
    if (IE.panels) IE.panels.refresh();
    if (IE.app) IE.app.updateStatus();
    return true;
  };

  api.rename = function (index, name) {
    var pages = api.pages();
    if (!pages[index]) return false;
    pages[index].name = String(name || '').trim();
    return true;
  };

  /** 페이지가 2장 이상이면 이름을 '페이지 N' 으로 정리 */
  function renumber() {
    var pages = api.pages();
    if (pages.length <= 1) {
      if (pages[0]) pages[0].name = '';
      return;
    }
    pages.forEach(function (page, i) {
      page.name = '페이지 ' + (i + 1);
    });
  }

  /* ------------------------------------------------------- 페이지 속성 */

  /** 페이지 크기 변경 (객체 위치는 그대로 둔다) */
  api.resize = function (width, height, allPages) {
    ensure();
    var history = IE.state.history;
    var wasLocked = history.locked;
    history.locked = true;

    if (allPages) {
      IE.state.pages.forEach(function (page) {
        page.width = width;
        page.height = height;
        page.thumb = null;
      });
    } else {
      var page = api.current();
      page.width = width;
      page.height = height;
      page.thumb = null;
    }

    IE.state.docW = width;
    IE.state.docH = height;
    IE.canvas.setDocSize(width, height);
    IE.canvas.zoomToFit();

    history.locked = wasLocked;
    history.snapshot();
    if (IE.panels) IE.panels.refresh();
    if (IE.app) IE.app.updateStatus();
  };

  /** 페이지 배경색 변경 */
  api.setBackground = function (color, allPages) {
    ensure();
    var canvas = IE.state.canvas;
    var history = IE.state.history;
    var wasLocked = history.locked;
    history.locked = true;

    var value = (color === 'transparent') ? 'rgba(0, 0, 0, 0)' : color;

    if (allPages) {
      IE.state.pages.forEach(function (page) {
        page.background = value;
        page.thumb = null;
      });
    } else {
      var page = api.current();
      page.background = value;
      page.thumb = null;
    }

    canvas.backgroundColor = value;

    // 그라데이션 배경 레이어가 깔려 있으면 단색으로 바꾼다
    canvas.getObjects().forEach(function (obj) {
      if (obj.kind === 'bg' && obj.gradientPreset) {
        obj.set({ fill: value, gradientPreset: null });
      }
    });

    canvas.requestRenderAll();
    history.locked = wasLocked;
    history.snapshot();
    if (IE.panels) IE.panels.refresh();
  };

  /**
   * 그라데이션 배경. 페이지 배경색으로는 표현할 수 없어
   * 맨 뒤에 배경 레이어(bg 사각형)를 넣는다. (현재 페이지만 적용)
   */
  api.setBackgroundGradient = function (presetId) {
    ensure();
    var canvas = IE.state.canvas;
    var history = IE.state.history;

    var gradient = IE.canvas.makeGradient(presetId);
    if (!gradient) return;

    var width = IE.state.docW;
    var height = IE.state.docH;
    var wasLocked = history.locked;
    history.locked = true;

    var existing = canvas.getObjects().filter(function (obj) {
      return obj.kind === 'bg';
    })[0];

    if (existing) {
      existing.set({
        left: 0, top: 0, width: width, height: height,
        scaleX: 1, scaleY: 1,
        fill: gradient, gradientPreset: presetId
      });
      existing.setCoords();
    } else {
      var rect = new fabric.Rect({
        left: 0, top: 0, width: width, height: height,
        fill: gradient, kind: 'bg', gradientPreset: presetId
      });
      canvas.add(rect);
      canvas.sendToBack(rect);
    }

    // 배경 레이어가 바탕을 채우므로 캔버스 색은 비운다
    canvas.backgroundColor = 'rgba(0, 0, 0, 0)';
    var page = api.current();
    page.background = 'rgba(0, 0, 0, 0)';
    page.thumb = null;

    canvas.requestRenderAll();
    history.locked = wasLocked;
    history.snapshot();
    if (IE.panels) IE.panels.refresh();
  };

  /* ----------------------------------------------------- 문서 생성/복원 */

  /**
   * 여러 장짜리 템플릿(덱)을 새 문서로 만든다.
   * 각 슬라이드를 실제로 한 번씩 캔버스에 그려 JSON 을 확보한 뒤 첫 장을 남긴다.
   */
  api.newDocumentFromTemplate = function (template) {
    var canvas = IE.state.canvas;
    var history = IE.state.history;
    var defs = template.pages;

    IE.state.pages = defs.map(function (def, i) {
      var page = makePage(
        def.width || template.width,
        def.height || template.height,
        def.background || template.background
      );
      page.name = def.name || ('페이지 ' + (i + 1));
      return page;
    });
    IE.state.pageIndex = 0;
    IE.state.docW = IE.state.pages[0].width;
    IE.state.docH = IE.state.pages[0].height;

    history.locked = true;

    var draw = function (index) {
      var page = IE.state.pages[index];
      var def = defs[index];

      IE.state.docW = page.width;
      IE.state.docH = page.height;

      canvas.clear();
      canvas.backgroundColor = page.background || '#ffffff';
      canvas.setDimensions({ width: page.width, height: page.height });
      canvas.setZoom(1);

      canvas.renderOnAddRemove = false;
      (def.objects || []).forEach(function (item) {
        var obj = IE.canvas.makeObject(item);
        if (obj) canvas.add(obj);
      });
      canvas.renderOnAddRemove = true;

      canvas.discardActiveObject();
      canvas.renderAll();

      page.json = canvas.toJSON(util.EXTRA_PROPS);
      page.thumb = null;
    };

    // 모든 페이지를 순서대로 그려서 저장하고, 마지막에 첫 페이지로 되돌린다
    for (var i = 0; i < IE.state.pages.length; i++) draw(i);
    draw(0);

    IE.state.docW = IE.state.pages[0].width;
    IE.state.docH = IE.state.pages[0].height;

    if (IE.guides) IE.guides.clear();

    history.locked = false;
    history.reset();
    history.snapshot();

    IE.canvas.zoomToFit();
    if (IE.panels) IE.panels.refresh();
    if (IE.app) IE.app.updateStatus();
    if (IE.pages && typeof IE.pages.setVisible === 'function' && IE.state.pages.length > 1) {
      IE.pages.setVisible(true);
    }
  };

  api.newDocument = function (width, height, background, objects) {
    var canvas = IE.state.canvas;
    var history = IE.state.history;

    var page = makePage(width, height, background);
    IE.state.pages = [page];
    IE.state.pageIndex = 0;
    IE.state.docW = width;
    IE.state.docH = height;

    history.locked = true;
    canvas.clear();
    canvas.backgroundColor = background || '#ffffff';
    canvas.setDimensions({ width: width, height: height });
    canvas.setZoom(1);

    canvas.renderOnAddRemove = false;
    (objects || []).forEach(function (def) {
      var obj = IE.canvas.makeObject(def);
      if (obj) canvas.add(obj);
    });
    canvas.renderOnAddRemove = true;

    canvas.discardActiveObject();
    canvas.requestRenderAll();
    if (IE.guides) IE.guides.clear();

    history.locked = false;
    history.reset();
    history.snapshot();

    page.json = canvas.toJSON(util.EXTRA_PROPS);
    page.thumb = null;

    IE.canvas.zoomToFit();
    if (IE.panels) IE.panels.refresh();
    if (IE.app) IE.app.updateStatus();
  };

  /**
   * 템플릿을 '현재 페이지에' 적용한다.
   * 여러 페이지 문서에서 페이지 전체를 날리지 않도록 현재 페이지만 교체한다.
   */
  api.applyTemplateToCurrentPage = function (width, height, background, objects) {
    var canvas = IE.state.canvas;
    var history = IE.state.history;

    ensure();
    var page = api.current();

    page.width = width;
    page.height = height;
    page.background = background || '#ffffff';
    page.thumb = null;

    IE.state.docW = width;
    IE.state.docH = height;

    history.locked = true;
    canvas.clear();
    canvas.backgroundColor = page.background;
    canvas.setDimensions({ width: width, height: height });
    canvas.setZoom(1);

    canvas.renderOnAddRemove = false;
    (objects || []).forEach(function (def) {
      var obj = IE.canvas.makeObject(def);
      if (obj) canvas.add(obj);
    });
    canvas.renderOnAddRemove = true;

    canvas.discardActiveObject();
    canvas.requestRenderAll();
    if (IE.guides) IE.guides.clear();

    history.locked = false;
    history.snapshot();

    page.json = canvas.toJSON(util.EXTRA_PROPS);

    IE.canvas.zoomToFit();
    if (IE.panels) IE.panels.refresh();
    if (IE.app) IE.app.updateStatus();
  };

  /** 되돌리기 / 프로젝트 저장용 전체 문서 직렬화 */
  api.serialize = function () {
    api.sync();
    ensure();

    return {
      version: util.VERSION,
      docName: IE.state.docName,
      pageIndex: IE.state.pageIndex,
      width: IE.state.docW,
      height: IE.state.docH,
      pages: IE.state.pages.map(function (page) {
        return {
          id: page.id,
          name: page.name,
          width: page.width,
          height: page.height,
          background: page.background,
          json: page.json
        };
      })
    };
  };

  /** 직렬화 데이터로 문서 전체 복원 */
  api.restore = function (data, done) {
    var pages = (data && data.pages && data.pages.length) ? data.pages : null;

    IE.state.pages = (pages || [{
      width: (data && data.width) || 1240,
      height: (data && data.height) || 1754,
      background: '#ffffff',
      json: data && data.canvas ? data.canvas : null
    }]).map(function (page) {
      return {
        id: page.id || util.uid('page'),
        name: page.name || '',
        width: page.width || 1240,
        height: page.height || 1754,
        background: page.background || '#ffffff',
        json: page.json || null,
        thumb: null
      };
    });

    IE.state.pageIndex = util.clamp(
      (data && data.pageIndex) || 0, 0, IE.state.pages.length - 1
    );
    IE.state.docName = (data && data.docName) || 'untitled';

    var page = api.pages()[IE.state.pageIndex];
    IE.state.docW = page.width;
    IE.state.docH = page.height;

    api.apply(page, done);
  };

  /* ------------------------------------------------------- 썸네일 생성 */

  /** 페이지를 오프스크린 시트에 올린다. 편집 화면 전용 객체(가이드·미채운 영역)는 제외한다. */
  function sheetFrom(page, cb) {
    var element = document.createElement('canvas');
    var sheet = new fabric.StaticCanvas(element, {
      width: page.width,
      height: page.height,
      enableRetinaScaling: false
    });

    var objects = page.json && page.json.objects;
    if (!objects || !objects.length) {
      cb(sheet);
      return;
    }

    var called = false;
    var done = function () {
      if (called) return;
      called = true;
      try {
        sheet.getObjects().forEach(function (obj) {
          if (IE.canvas.editorOnly && IE.canvas.editorOnly(obj)) obj.set('visible', false);
        });
      } catch (e) {}
      cb(sheet);
    };

    var fallbackTimer = setTimeout(function () {
      done();
    }, 2500);

    try {
      sheet.loadFromJSON(page.json, function () {
        clearTimeout(fallbackTimer);
        done();
      }, IE.table.reviver);
    } catch (err) {
      clearTimeout(fallbackTimer);
      done();
    }
  }

  /** 미리보기용 작은 이미지 */
  api.renderThumb = function (page, maxW, maxH, cb) {
    var zoom = Math.min(maxW / page.width, maxH / page.height);

    sheetFrom(page, function (sheet) {
      sheet.backgroundColor = page.background || '#ffffff';
      sheet.setDimensions({
        width: Math.max(1, Math.round(page.width * zoom)),
        height: Math.max(1, Math.round(page.height * zoom))
      });
      sheet.setZoom(zoom);
      sheet.renderAll();

      var url = sheet.toDataURL({ format: 'png', multiplier: 1 });
      sheet.dispose();
      cb(url);
    });
  };

  /** 내보내기용 원본 해상도 이미지 */
  api.renderFull = function (page, format, multiplier, cb) {
    sheetFrom(page, function (sheet) {
      sheet.backgroundColor = page.background || '#ffffff';
      sheet.setDimensions({ width: page.width, height: page.height });
      sheet.setZoom(1);
      sheet.renderAll();

      var url = sheet.toDataURL({
        format: format,
        multiplier: multiplier || 1,
        quality: format === 'jpeg' ? 0.92 : 1,
        enableRetinaScaling: false
      });

      sheet.dispose();
      cb(url);
    });
  };

  IE.doc = api;
})(window.IE);
