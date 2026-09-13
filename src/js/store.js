window.IE = window.IE || {};

(function (IE) {
  'use strict';

  var util = IE.util;

  var KEY = 'imgeditor.templates.v1';
  var BUNDLE = 'ImgEditorTemplates';

  /**
   * file:// 로 연 페이지에서는 브라우저가 localStorage 접근을 막는 경우가 있다.
   * 저장이 안 되면 사용자 템플릿을 '파일로만' 다루게 하고, UI 에 그 사실을 알린다.
   */
  function probe() {
    try {
      var test = '__imgeditor_probe__';
      window.localStorage.setItem(test, '1');
      window.localStorage.removeItem(test);
      return true;
    } catch (err) {
      return false;
    }
  }

  var available = probe();

  function readAll() {
    if (!available) return [];
    try {
      var raw = window.localStorage.getItem(KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  function writeAll(list) {
    if (!available) return false;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(list));
      return true;
    } catch (err) {
      util.toast('저장 공간이 부족해 템플릿을 보관하지 못했습니다. 파일로 내보내 주세요.');
      return false;
    }
  }

  /* --------------------------------------------------- 형식 검증 */

  function pageCountOf(template) {
    return (template && template.pages && template.pages.length) ? template.pages.length : 1;
  }

  /** 한 장짜리(objects)와 여러 장짜리(pages) 둘 다 허용한다 */
  function isTemplate(value) {
    if (!value || typeof value !== 'object') return false;
    if (typeof value.name !== 'string') return false;
    if (typeof value.width !== 'number' || value.width <= 0) return false;
    if (typeof value.height !== 'number' || value.height <= 0) return false;

    if (Array.isArray(value.pages) && value.pages.length) {
      return value.pages.every(function (page) {
        return !!(page && Array.isArray(page.objects));
      });
    }
    return Array.isArray(value.objects);
  }

  function normalize(template) {
    var copy = util.clone(template);
    var count = pageCountOf(copy);

    copy.id = copy.id || util.uid('user');
    copy.category = copy.category || 'user';
    copy.note = copy.note ||
      (copy.width + ' × ' + copy.height + (count > 1 ? ' · ' + count + '장' : ''));
    copy.user = true;
    copy.createdAt = copy.createdAt || new Date().toISOString();
    return copy;
  }

  /* --------------------------------------------------- 공개 API */

  var api = {};

  api.available = available;
  api.BUNDLE = BUNDLE;
  api.KEY = KEY;

  api.isTemplate = isTemplate;

  /** 내장 + 사용자 템플릿을 합친 전체 목록 */
  api.all = function () {
    return IE.templates.all.concat(readAll());
  };

  api.userTemplates = function () {
    return readAll();
  };

  api.byId = function (id) {
    return api.all().filter(function (tpl) { return tpl.id === id; })[0] || null;
  };

  api.save = function (template, options) {
    options = options || {};

    var list = readAll();
    var entry = normalize(template);

    if (options.overwrite) {
      var index = list.findIndex(function (tpl) { return tpl.id === entry.id; });
      if (index >= 0) {
        entry.createdAt = list[index].createdAt || entry.createdAt;
        entry.updatedAt = new Date().toISOString();
        list[index] = entry;
      } else {
        list.push(entry);
      }
    } else {
      entry.id = util.uid('user');
      list.push(entry);
    }

    if (!writeAll(list)) {
      return { ok: false, template: entry, reason: available ? 'quota' : 'unavailable' };
    }
    return { ok: true, template: entry };
  };

  api.remove = function (id) {
    var list = readAll();
    var next = list.filter(function (tpl) { return tpl.id !== id; });
    if (next.length === list.length) return false;
    return writeAll(next);
  };

  api.rename = function (id, name) {
    var list = readAll();
    var target = list.filter(function (tpl) { return tpl.id === id; })[0];
    if (!target) return false;
    target.name = name;
    target.updatedAt = new Date().toISOString();
    return writeAll(list);
  };

  /**
   * 현재 문서를 재사용 가능한 템플릿 정의로 만든다.
   * allPages 가 참이고 문서가 2장 이상이면 모든 페이지를 한 템플릿으로 묶는다.
   */
  api.fromCurrentDocument = function (name, category, allPages) {
    var canvas = IE.state.canvas;

    var base = {
      id: util.uid('user'),
      category: category || 'user',
      name: name || '내 템플릿',
      width: IE.state.docW,
      height: IE.state.docH,
      user: true,
      createdAt: new Date().toISOString()
    };

    if (allPages && IE.doc && IE.doc.count() > 1) {
      IE.doc.sync();
      var data = IE.doc.serialize();

      base.note = base.width + ' × ' + base.height + ' · ' + data.pages.length + '장';
      base.background = data.pages[0].background || '#ffffff';
      base.pages = data.pages.map(function (page, index) {
        return {
          name: page.name || ('페이지 ' + (index + 1)),
          width: page.width,
          height: page.height,
          background: page.background,
          objects: (page.json && page.json.objects) || []
        };
      });

      return base;
    }

    base.note = base.width + ' × ' + base.height;
    base.background = canvas.backgroundColor || '#ffffff';
    base.objects = canvas.toJSON(util.EXTRA_PROPS).objects;
    return base;
  };

  /* --------------------------------------------- 파일 가져오기/내보내기 */

  api.exportTemplates = function (templates, filename) {
    // undefined/null 이면 '내 템플릿 전부', 빈 배열이면 '내보낼 것 없음'
    var list = (templates === undefined || templates === null) ? readAll() : templates;
    if (!list.length) {
      util.toast('내보낼 템플릿이 없습니다.');
      return false;
    }

    var payload = {
      type: BUNDLE,
      version: util.VERSION,
      exportedAt: new Date().toISOString(),
      templates: list
    };

    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    util.download(filename || ('templates_' + util.timestamp() + '.json'), blob);
    util.toast('템플릿 ' + list.length + '개를 내보냈습니다.');
    return true;
  };

  /**
   * 파일 하나 또는 묶음을 읽어 사용자 템플릿으로 등록한다.
   * 콜백: (result) => result = { ok, added, skipped, reason }
   */
  api.importFile = function (file, callback) {
    util.readAsText(file, function (err, text) {
      if (err) {
        callback({ ok: false, added: 0, skipped: 0, reason: 'read' });
        return;
      }

      var parsed;
      try {
        parsed = JSON.parse(text);
      } catch (parseError) {
        callback({ ok: false, added: 0, skipped: 0, reason: 'parse' });
        return;
      }

      var incoming = [];
      if (Array.isArray(parsed)) incoming = parsed;
      else if (parsed && Array.isArray(parsed.templates)) incoming = parsed.templates;
      else if (isTemplate(parsed)) incoming = [parsed];

      var valid = incoming.filter(isTemplate);
      var skipped = incoming.length - valid.length;

      if (!valid.length) {
        callback({ ok: false, added: 0, skipped: skipped, reason: 'shape' });
        return;
      }

      var added = 0;
      var list = readAll();
      valid.forEach(function (item) {
        var entry = normalize(item);
        entry.id = util.uid('user');
        list.push(entry);
        added++;
      });

      var stored = writeAll(list);
      callback({
        ok: true,
        added: added,
        skipped: skipped,
        persisted: stored
      });
    });
  };

  IE.store = api;
})(window.IE);
