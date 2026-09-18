window.IE = window.IE || {};

(function (IE) {
  'use strict';

  var util = IE.util;

  var KEY = 'imgeditor.templates.v1';
  var BUNDLE = 'ImgEditorTemplates';
  var DB_NAME = 'imgeditor_db';
  var DB_VERSION = 1;
  var STORE_NAME = 'templates';

  /* --------------------------------------------------- 가용성 점검 */

  function probeLocalStorage() {
    try {
      var test = '__imgeditor_probe__';
      window.localStorage.setItem(test, '1');
      window.localStorage.removeItem(test);
      return true;
    } catch (err) {
      return false;
    }
  }

  function probeIndexedDB() {
    try {
      return !!(typeof window !== 'undefined' && window.indexedDB);
    } catch (err) {
      return false;
    }
  }

  var lsAvailable = probeLocalStorage();
  var idbAvailable = probeIndexedDB();
  var available = idbAvailable || lsAvailable;

  /* --------------------------------------------------- localStorage Fallback */

  function readLocalStorage() {
    if (!lsAvailable) return [];
    try {
      var raw = window.localStorage.getItem(KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  function writeLocalStorage(list) {
    if (!lsAvailable) return false;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(list));
      return true;
    } catch (err) {
      return false;
    }
  }

  /* --------------------------------------------------- 인메모리 캐시 & IndexedDB */

  // 초기 응답 속도(0ms) 및 하위 호환성을 위해 localStorage 데이터를 1차 캐시로 적재
  var cache = readLocalStorage();
  var dbInstance = null;
  var dbReady = false;
  var pendingQueue = [];

  function getAllFromStore(store, callback) {
    if (typeof store.getAll === 'function') {
      var req = store.getAll();
      req.onsuccess = function () {
        callback(null, req.result || []);
      };
      req.onerror = function (e) {
        callback(e, []);
      };
    } else {
      var items = [];
      var cursorReq = store.openCursor();
      cursorReq.onsuccess = function (e) {
        var cursor = e.target.result;
        if (cursor) {
          items.push(cursor.value);
          cursor.continue();
        } else {
          callback(null, items);
        }
      };
      cursorReq.onerror = function (e) {
        callback(e, []);
      };
    }
  }

  function openDB(onSuccess, onError) {
    if (!idbAvailable) {
      if (onError) onError(new Error('IndexedDB not supported'));
      return;
    }
    if (dbInstance) {
      if (onSuccess) onSuccess(dbInstance);
      return;
    }

    try {
      var req = window.indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = function (e) {
        var db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      req.onsuccess = function (e) {
        dbInstance = e.target.result;
        dbReady = true;

        dbInstance.onversionchange = function () {
          dbInstance.close();
          dbInstance = null;
          dbReady = false;
        };

        if (onSuccess) onSuccess(dbInstance);

        while (pendingQueue.length) {
          var task = pendingQueue.shift();
          task(dbInstance);
        }
      };

      req.onerror = function (e) {
        console.warn('[IE.store] IndexedDB open error, fallback to memory/localStorage', e);
        idbAvailable = false;
        dbReady = false;
        if (onError) onError(e);
      };
    } catch (err) {
      console.warn('[IE.store] IndexedDB init exception', err);
      idbAvailable = false;
      dbReady = false;
      if (onError) onError(err);
    }
  }

  function withStore(mode, action) {
    if (dbReady && dbInstance) {
      try {
        var tx = dbInstance.transaction(STORE_NAME, mode);
        var st = tx.objectStore(STORE_NAME);
        action(st, tx);
      } catch (e) {
        console.warn('[IE.store] Transaction failed', e);
      }
    } else if (idbAvailable) {
      pendingQueue.push(function (db) {
        try {
          var tx = db.transaction(STORE_NAME, mode);
          var st = tx.objectStore(STORE_NAME);
          action(st, tx);
        } catch (e) {
          console.warn('[IE.store] Queued transaction failed', e);
        }
      });
      openDB();
    }
  }

  // 초기화 및 localStorage -> IndexedDB 자동 마이그레이션
  function initStore() {
    if (!idbAvailable) return;

    openDB(function (db) {
      try {
        var tx = db.transaction(STORE_NAME, 'readonly');
        var st = tx.objectStore(STORE_NAME);

        getAllFromStore(st, function (err, idbList) {
          if (!err && idbList) {
            var migratedKey = '__imgeditor_idb_migrated__';
            var alreadyMigrated = false;
            try { alreadyMigrated = !!window.localStorage.getItem(migratedKey); } catch(e) {}

            if (idbList.length > 0) {
              cache = idbList;
              try { window.localStorage.setItem(migratedKey, '1'); } catch(e) {}
              writeLocalStorage(cache);
              if (IE.panel && typeof IE.panel.refresh === 'function') {
                IE.panel.refresh();
              }
            } else if (!alreadyMigrated && cache.length > 0) {
              // 최초 1회에 한해 구버전 localStorage 데이터를 IndexedDB로 이관
              var writeTx = db.transaction(STORE_NAME, 'readwrite');
              var writeSt = writeTx.objectStore(STORE_NAME);
              cache.forEach(function (item) {
                writeSt.put(item);
              });
              try { window.localStorage.setItem(migratedKey, '1'); } catch(e) {}
            } else {
              // IndexedDB가 비어있고 이미 마이그레이션 후라면 사용자가 삭제한 것이므로 빈 상태 유지
              cache = [];
              writeLocalStorage([]);
              if (IE.panel && typeof IE.panel.refresh === 'function') {
                IE.panel.refresh();
              }
            }
          }
        });
      } catch (err) {
        console.warn('[IE.store] Initial read failed', err);
      }
    });
  }

  // 로드 즉시 초기화 시작
  initStore();

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
  api.DB_NAME = DB_NAME;

  api.isTemplate = isTemplate;

  /** 내장 + 사용자 템플릿을 합친 전체 목록 (동기 조회) */
  api.all = function () {
    return IE.templates.all.concat(cache);
  };

  /** 사용자 저장 템플릿 목록 (동기 조회) */
  api.userTemplates = function () {
    return cache;
  };

  api.byId = function (id) {
    return api.all().filter(function (tpl) { return tpl.id === id; })[0] || null;
  };

  /** 템플릿 저장 (동기 즉시 반환 + 비동기 IndexedDB 대용량 영구 저장) */
  api.save = function (template, options, callback) {
    options = options || {};

    var entry = normalize(template);

    if (options.overwrite) {
      var index = cache.findIndex(function (tpl) { return tpl.id === entry.id; });
      if (index >= 0) {
        entry.createdAt = cache[index].createdAt || entry.createdAt;
        entry.updatedAt = new Date().toISOString();
        cache[index] = entry;
      } else {
        cache.push(entry);
      }
    } else {
      entry.id = util.uid('user');
      cache.push(entry);
    }

    // 항상 localStorage 캐시도 동기화 시도
    writeLocalStorage(cache);
    try { window.localStorage.setItem('__imgeditor_idb_migrated__', '1'); } catch (e) {}

    if (idbAvailable) {
      withStore('readwrite', function (store) {
        var req = store.put(entry);
        req.onsuccess = function () {
          if (callback) callback({ ok: true, template: entry });
        };
        req.onerror = function (e) {
          console.warn('[IE.store] IDB save failed', e);
          if (callback) callback({ ok: false, template: entry, reason: 'idb_error' });
        };
      });
    } else {
      if (callback) callback({ ok: true, template: entry });
    }

    return { ok: true, template: entry };
  };

  /** 템플릿 단건 삭제 */
  api.remove = function (id, callback) {
    var next = cache.filter(function (tpl) { return tpl.id !== id; });
    cache = next;
    writeLocalStorage(cache);
    try { window.localStorage.setItem('__imgeditor_idb_migrated__', '1'); } catch (e) {}

    if (idbAvailable) {
      withStore('readwrite', function (store) {
        var req = store.delete(id);
        req.onsuccess = function () {
          if (callback) callback(true);
        };
        req.onerror = function () {
          if (callback) callback(false);
        };
      });
    } else {
      if (callback) callback(true);
    }
    return true;
  };

  /** 템플릿 전체 삭제 */
  api.clear = function (callback) {
    cache = [];
    writeLocalStorage([]);
    try { window.localStorage.setItem('__imgeditor_idb_migrated__', '1'); } catch (e) {}

    if (idbAvailable) {
      withStore('readwrite', function (store) {
        var req = store.clear();
        req.onsuccess = function () {
          if (callback) callback(true);
        };
        req.onerror = function () {
          if (callback) callback(false);
        };
      });
    } else {
      if (callback) callback(true);
    }
    return true;
  };

  /** 템플릿 이름 변경 */
  api.rename = function (id, name, callback) {
    var target = cache.filter(function (tpl) { return tpl.id === id; })[0];
    if (!target) return false;
    target.name = name;
    target.updatedAt = new Date().toISOString();
    writeLocalStorage(cache);

    if (idbAvailable) {
      withStore('readwrite', function (store) {
        var req = store.put(target);
        req.onsuccess = function () {
          if (callback) callback(true);
        };
      });
    } else {
      if (callback) callback(true);
    }
    return true;
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
    var list = (templates === undefined || templates === null) ? cache : templates;
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
   * 콜백: (result) => result = { ok, added, skipped, persisted, reason }
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
      var addedEntries = [];
      valid.forEach(function (item) {
        var entry = normalize(item);
        entry.id = util.uid('user');
        cache.push(entry);
        addedEntries.push(entry);
        added++;
      });

      if (idbAvailable) {
        withStore('readwrite', function (store) {
          addedEntries.forEach(function (entry) {
            store.put(entry);
          });
          callback({
            ok: true,
            added: added,
            skipped: skipped,
            persisted: true
          });
        });
      } else {
        var stored = writeLocalStorage(cache);
        callback({
          ok: true,
          added: added,
          skipped: skipped,
          persisted: stored
        });
      }
    });
  };

  IE.store = api;
})(window.IE);
