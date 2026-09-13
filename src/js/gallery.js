window.IE = window.IE || {};

(function (IE) {
  'use strict';

  var util = IE.util;
  var cache = {};
  var currentTab = 'builtin';
  var currentCategory = 'all';

  /* ------------------------------------------------------------ 썸네일 */

  /** 여러 장짜리 템플릿(덱)은 첫 장을 대표로 쓴다 */
  function firstPage(template) {
    if (template.pages && template.pages.length) {
      var page = template.pages[0];
      return {
        width: page.width || template.width,
        height: page.height || template.height,
        background: page.background || template.background,
        objects: page.objects || []
      };
    }
    return {
      width: template.width,
      height: template.height,
      background: template.background,
      objects: template.objects || []
    };
  }

  function pageCount(template) {
    return (template.pages && template.pages.length) ? template.pages.length : 1;
  }

  function thumbnail(template, maxW, maxH) {
    var key = template.id + '@' + maxW + 'x' + maxH;
    if (cache[key]) return cache[key];

    var cover = firstPage(template);
    var zoom = Math.min(maxW / cover.width, maxH / cover.height);
    var element = document.createElement('canvas');

    var preview = new fabric.StaticCanvas(element, {
      width: cover.width,
      height: cover.height,
      backgroundColor: cover.background || '#ffffff',
      enableRetinaScaling: false
    });

    (cover.objects || []).forEach(function (def) {
      var obj = null;
      try {
        obj = IE.canvas.makeObject(def);
      } catch (err) {
        obj = null;
      }
      if (obj) preview.add(obj);
    });

    preview.setDimensions({
      width: Math.max(1, Math.round(cover.width * zoom)),
      height: Math.max(1, Math.round(cover.height * zoom))
    });
    preview.setZoom(zoom);
    preview.renderAll();

    var url = preview.toDataURL({ format: 'png', multiplier: 1 });
    preview.dispose();

    cache[key] = url;
    return url;
  }

  function invalidate(id) {
    Object.keys(cache).forEach(function (key) {
      if (key.indexOf(id + '@') === 0) delete cache[key];
    });
  }

  /* ------------------------------------------------------------- 카드 */

  function cardHtml(template, isUser) {
    var wide = isWide(template);
    var thumb = wide ? thumbnail(template, 560, 300) : thumbnail(template, 260, 200);
    var pages = pageCount(template);

    return '' +
      '<div class="tpl-card" data-template="' + template.id + '">' +
        '<div class="tpl-thumb">' +
          '<img alt="" src="' + thumb + '">' +
          (pages > 1 ? '<span class="tpl-pages">' + pages + '장</span>' : '') +
          (isUser ? '<span class="tpl-tag">내 템플릿</span>' : '') +
        '</div>' +
        '<div>' +
          '<div class="tpl-name">' + util.escapeHtml(template.name) + '</div>' +
          '<div class="tpl-size">' +
            util.escapeHtml(template.note || (template.width + ' × ' + template.height)) +
          '</div>' +
        '</div>' +
        '<div class="tpl-actions">' +
          '<button type="button" data-export="' + template.id + '">내보내기</button>' +
          (isUser ? '<button type="button" class="danger" data-delete="' + template.id + '">삭제</button>' : '') +
        '</div>' +
      '</div>';
  }

  /** 가로로 긴 템플릿(PPT·배너 등)은 한 줄에 하나씩 크게 보여준다 */
  function isWide(template) {
    return template.width > template.height * 1.3;
  }

  function groupHtml(title, templates, isUser) {
    if (!templates.length) return '';

    var wideCount = templates.filter(isWide).length;
    var wide = wideCount > templates.length / 2;

    return '<div class="fo-section">' +
      '<h3 class="fo-title">' + util.escapeHtml(title) + ' · ' + templates.length + '</h3>' +
      '<div class="tpl-grid' + (wide ? ' wide' : '') + '">' +
        templates.map(function (tpl) { return cardHtml(tpl, isUser); }).join('') +
      '</div></div>';
  }

  function storageNotice() {
    if (IE.store.available) return '';
    return '<div class="storage-warning">' +
      '이 브라우저에서는 <b>내 템플릿 보관이 막혀 있습니다</b>. ' +
      '브라우저가 <code>file://</code> 페이지의 저장소 접근을 차단한 경우입니다. ' +
      '파일 내보내기 / 가져오기로 주고받을 수 있습니다.' +
    '</div>';
  }

  /* ----------------------------------------------------------- 본문 */

  function bodyHtml() {
    var modes = '<div class="chip-row">' +
      '<button class="chip' + (currentTab === 'builtin' ? ' is-active' : '') +
        '" data-tpl-tab="builtin">기본 템플릿</button>' +
      '<button class="chip' + (currentTab === 'user' ? ' is-active' : '') +
        '" data-tpl-tab="user">내 템플릿</button>' +
    '</div>';

    if (currentTab === 'user') {
      var list = IE.store.userTemplates();
      var docPages = IE.doc ? IE.doc.count() : 1;

      var toolbar = '<div class="fo-toolbar">' +
        '<button class="btn-mini btn-mini-solid" data-user-action="save-current">' +
          (docPages > 1 ? '전체 ' + docPages + '장 저장' : '현재 페이지 저장') +
        '</button>' +
        '<button class="btn-mini" data-user-action="import">가져오기</button>' +
        '<button class="btn-mini" data-user-action="export-all">전체 내보내기</button>' +
        '<button class="btn-mini btn-mini-danger" data-user-action="delete-all">전체 삭제</button>' +
      '</div>';

      if (!list.length) {
        return modes + storageNotice() + toolbar +
          '<p class="fo-hint" style="text-align:center;padding:24px 8px">' +
          (IE.store.available
            ? '아직 저장한 템플릿이 없습니다.<br>마음에 든 결과를 <b>현재 페이지 저장</b>으로 보관해 보세요.'
            : '이 환경에서는 보관함을 쓸 수 없습니다.<br><b>가져오기</b>로 템플릿 파일을 불러오세요.') +
          '</p>';
      }

      return modes + storageNotice() + toolbar + groupHtml('내 템플릿', list, true);
    }

    // 기본 템플릿: 분류 칩으로 좁혀서 본다
    var categories = IE.templates.categories.filter(function (category) {
      return category.id !== 'user' && IE.templates.byCategory(category.id).length > 0;
    });

    var chips = '<div class="chip-row chip-scroll">' +
      '<button class="chip' + (currentCategory === 'all' ? ' is-active' : '') +
        '" data-tpl-cat="all">전체 ' + IE.templates.all.length + '</button>' +
      categories.map(function (category) {
        var count = IE.templates.byCategory(category.id).length;
        return '<button class="chip' + (currentCategory === category.id ? ' is-active' : '') +
          '" data-tpl-cat="' + category.id + '">' +
          util.escapeHtml(category.name) + ' ' + count + '</button>';
      }).join('') +
    '</div>';

    var grid = '<div id="template-grid">';

    if (currentCategory === 'all') {
      categories.forEach(function (category) {
        grid += groupHtml(category.name, IE.templates.byCategory(category.id), false);
      });
    } else {
      var picked = categories.filter(function (c) { return c.id === currentCategory; })[0];
      if (picked) grid += groupHtml(picked.name, IE.templates.byCategory(picked.id), false);
      else currentCategory = 'all';
    }

    return modes + storageNotice() + chips + grid + '</div>';
  }

  /* ---------------------------------------------------------- 이벤트 */

  function bind(host) {
    Array.prototype.forEach.call(host.querySelectorAll('[data-tpl-tab]'), function (button) {
      button.addEventListener('click', function () {
        currentTab = button.getAttribute('data-tpl-tab');
        IE.panel.refresh();
      });
    });

    Array.prototype.forEach.call(host.querySelectorAll('[data-tpl-cat]'), function (button) {
      button.addEventListener('click', function () {
        currentCategory = button.getAttribute('data-tpl-cat');
        IE.panel.refresh();
      });
    });

    Array.prototype.forEach.call(host.querySelectorAll('.tpl-card'), function (card) {
      card.addEventListener('click', function () {
        var template = IE.store.byId(card.getAttribute('data-template'));
        if (!template) return;
        IE.canvas.applyTemplate(template);
        IE.panel.close();
      });
    });

    Array.prototype.forEach.call(host.querySelectorAll('[data-export]'), function (button) {
      button.addEventListener('click', function (ev) {
        ev.stopPropagation();
        var template = IE.store.byId(button.getAttribute('data-export'));
        if (!template) return;
        IE.store.exportTemplates([template], safeName(template.name) + '.json');
      });
    });

    Array.prototype.forEach.call(host.querySelectorAll('[data-delete]'), function (button) {
      button.addEventListener('click', function (ev) {
        ev.stopPropagation();

        var id = button.getAttribute('data-delete');
        var template = IE.store.byId(id);
        if (!template) return;
        if (!window.confirm('「' + template.name + '」 템플릿을 삭제할까요?')) return;

        invalidate(id);
        IE.store.remove(id);
        util.toast('템플릿을 삭제했습니다.');
        IE.panel.refresh();
      });
    });

    Array.prototype.forEach.call(host.querySelectorAll('[data-user-action]'), function (button) {
      button.addEventListener('click', function (ev) {
        ev.stopPropagation();
        handleUserAction(button.getAttribute('data-user-action'));
      });
    });
  }

  function safeName(name) {
    return String(name || 'template').replace(/[\\/:*?"<>|]/g, '_').trim() || 'template';
  }

  function suggestedName() {
    var template = IE.templates.byId(IE.state.docName);
    if (template) return template.name + ' 복사본';
    return '내 템플릿 ' + util.timestamp().slice(0, 8);
  }

  function handleUserAction(action) {
    if (action === 'save-current') {
      var pages = IE.doc ? IE.doc.count() : 1;
      var name = window.prompt(
        pages > 1
          ? '템플릿 이름을 입력하세요. (현재 문서 ' + pages + '장을 한 템플릿으로 저장합니다)'
          : '템플릿 이름을 입력하세요.',
        suggestedName()
      );
      if (!name) return;

      var template = IE.store.fromCurrentDocument(name.trim(), 'user', pages > 1);
      var result = IE.store.save(template, { overwrite: false });

      if (result.ok) {
        util.toast('「' + name.trim() + '」 템플릿으로 저장했습니다.' +
          (pages > 1 ? ' (' + pages + '장)' : ''));
      } else if (result.reason === 'unavailable') {
        util.toast('보관함을 쓸 수 없어 파일로 내보냅니다.');
        IE.store.exportTemplates([template], safeName(name) + '.json');
        return;
      }

      IE.panel.refresh();
      return;
    }

    if (action === 'import') {
      util.pickFile('file-template', '.json,application/json', function (file) {
        IE.store.importFile(file, function (result) {
          if (!result.ok) {
            var messages = {
              read: '파일을 읽지 못했습니다.',
              parse: 'JSON 형식이 아닙니다.',
              shape: 'ImgEditor 템플릿 형식이 아닙니다.'
            };
            util.toast(messages[result.reason] || '가져오지 못했습니다.');
            return;
          }

          var note = '템플릿 ' + result.added + '개를 가져왔습니다.' +
            (result.skipped ? ' (' + result.skipped + '개 형식 제외)' : '');
          if (result.persisted === false) note = '가져왔지만 이 브라우저에는 보관되지 않습니다.';
          util.toast(note);
          IE.panel.refresh();
        });
      });
      return;
    }

    if (action === 'export-all') {
      var list = IE.store.userTemplates();
      if (!list.length) {
        util.toast('내보낼 내 템플릿이 없습니다.');
        return;
      }
      IE.store.exportTemplates(list, 'my_templates_' + util.timestamp() + '.json');
      return;
    }

    if (action === 'delete-all') {
      var all = IE.store.userTemplates();
      if (!all.length) {
        util.toast('삭제할 템플릿이 없습니다.');
        return;
      }
      if (!window.confirm('내 템플릿 ' + all.length + '개를 모두 삭제할까요?')) return;

      all.forEach(function (tpl) {
        invalidate(tpl.id);
        IE.store.remove(tpl.id);
      });
      util.toast('내 템플릿을 모두 삭제했습니다.');
      IE.panel.refresh();
    }
  }

  IE.gallery = {
    thumbnail: thumbnail,
    bodyHtml: bodyHtml,
    bind: bind,
    setTab: function (tab) { currentTab = tab; },
    currentTab: function () { return currentTab; },
    setCategory: function (id) { currentCategory = id || 'all'; },
    currentCategory: function () { return currentCategory; },
    open: function (tab, category) {
      if (tab) currentTab = tab;
      if (category) currentCategory = category;
      IE.panel.open('templates');
    },
    close: function () { IE.panel.close(); },
    isOpen: function () { return IE.panel.current() === 'templates'; }
  };
})(window.IE);
