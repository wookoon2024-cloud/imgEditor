window.IE = window.IE || {};

(function (IE) {
  'use strict';

  var util = IE.util;

  IE.state = {
    canvas: null,
    history: null,
    docW: 1240,
    docH: 1754,
    zoom: 1,
    docName: 'untitled',
    guidesVisible: true,
    autoFit: true
  };

  /** 첫 조작이 있으면 안내 문구를 치운다 */
  function hideHint() {
    var hint = util.$('stage-hint');
    if (!hint || hint.hidden) return;
    hint.hidden = true;
  }

  IE.panels = {
    refresh: function () {
      if (IE.properties) IE.properties.refresh();
      if (IE.layers) IE.layers.refresh();
      if (IE.pages) IE.pages.refresh();
    }
  };

  var pendingSlot = null;
  var pendingReplaceTarget = null;

  var spaceDown = false;
  var panning = false;
  var panStart = null;

  /* ------------------------------------------------------------ 상태 표시 */

  function updateStatus() {
    var canvas = IE.state.canvas;
    if (!canvas) return;

    var sizeEl = util.$('status-size');
    var countEl = util.$('status-count');
    var selEl = util.$('status-sel');
    var zoomEl = util.$('zoom-label');

    var pageNote = '';
    if (IE.doc && IE.doc.count() > 1) {
      pageNote = ' · ' + (IE.doc.index() + 1) + '/' + IE.doc.count() + 'p';
    }

    if (sizeEl) sizeEl.textContent = '문서 ' + IE.state.docW + ' × ' + IE.state.docH + pageNote;
    if (countEl) countEl.textContent = '객체 ' + canvas.getObjects().length;

    var active = canvas.getActiveObjects();
    if (selEl) {
      if (!active.length) selEl.textContent = '선택 없음';
      else if (active.length === 1) selEl.textContent = '선택: ' + IE.canvas.labelOf(active[0]);
      else selEl.textContent = '선택 ' + active.length + '개';
    }

    if (zoomEl) zoomEl.textContent = Math.round(IE.state.zoom * 100) + '%';

    var undoBtn = util.$('btn-undo');
    var redoBtn = util.$('btn-redo');
    if (undoBtn) undoBtn.disabled = !IE.state.history.canUndo();
    if (redoBtn) redoBtn.disabled = !IE.state.history.canRedo();

    var guidesBtn = util.$('btn-guides');
    if (guidesBtn) guidesBtn.classList.toggle('is-off', !IE.state.guidesVisible);
  }

  function toggleGuides() {
    IE.canvas.setGuidesVisible(!IE.state.guidesVisible);
    IE.panels.refresh();
    updateStatus();
  }

  /* -------------------------------------------------------------- 이미지 */

  function openImagePicker(slot, replaceTarget) {
    pendingSlot = slot || null;
    pendingReplaceTarget = replaceTarget || null;
    var input = util.$('file-image');
    input.value = '';
    input.click();
  }

  function pickImageForSlot(slot) {
    openImagePicker(slot, null);
  }

  function pickImageForReplace(target) {
    openImagePicker(null, target || IE.state.canvas.getActiveObject());
  }

  /**
   * 외부 이미지 파일을 불러오기 전 저작권·초상권 안심 확인 플로팅 팝업을 띄운다.
   * 사용자가 [확인하고 불러오기]를 눌러야만 진행된다.
   */
  function confirmCopyrightAndProceed(onConfirm, onCancel) {
    var modal = util.$('modal-copyright-confirm');
    if (!modal) {
      if (typeof onConfirm === 'function') onConfirm();
      return;
    }

    var btnProceed = util.$('btn-copyright-proceed');
    var btnCancel = util.$('btn-copyright-cancel');
    var btnClose = util.$('btn-copyright-cancel-x');
    var chkAgree = util.$('chk-copyright-agree');

    modal.hidden = false;
    if (chkAgree) {
      chkAgree.checked = true;
      chkAgree.onchange = function () {
        if (btnProceed) btnProceed.disabled = !chkAgree.checked;
      };
    }
    if (btnProceed) btnProceed.disabled = false;

    function cleanup() {
      modal.hidden = true;
      if (btnProceed) btnProceed.removeEventListener('click', handleProceed);
      if (btnCancel) btnCancel.removeEventListener('click', handleCancel);
      if (btnClose) btnClose.removeEventListener('click', handleCancel);
    }

    function handleProceed() {
      cleanup();
      if (typeof onConfirm === 'function') onConfirm();
    }

    function handleCancel() {
      cleanup();
      if (typeof onCancel === 'function') onCancel();
    }

    if (btnProceed) btnProceed.addEventListener('click', handleProceed);
    if (btnCancel) btnCancel.addEventListener('click', handleCancel);
    if (btnClose) btnClose.addEventListener('click', handleCancel);
  }

  function onImagesChosen(files) {
    var list = Array.prototype.slice.call(files || []).filter(function (file) {
      return /^image\//.test(file.type);
    });

    if (!list.length) {
      util.toast('이미지 파일이 아닙니다.');
      return;
    }

    confirmCopyrightAndProceed(function () {
      // 영역 채우기 / 이미지 교체는 첫 파일만 사용한다
      if (pendingSlot || pendingReplaceTarget) {
        var target = pendingSlot;
        var replace = pendingReplaceTarget;
        pendingSlot = null;
        pendingReplaceTarget = null;

        util.readAsDataURL(list[0], function (err, dataURL) {
          if (err) {
            util.toast('이미지를 읽지 못했습니다.');
            return;
          }
          IE.panel.addRecent(dataURL);

          if (target) IE.canvas.fillSlot(target, dataURL);
          else if (replace) IE.canvas.replaceImage(replace, dataURL);
        });
        return;
      }

      addImageFilesInternal(list);
    }, function () {
      pendingSlot = null;
      pendingReplaceTarget = null;
      util.toast('이미지 불러오기가 취소되었습니다.');
    });
  }

  function addImageFilesInternal(list) {
    var queue = Array.prototype.slice.call(list || []);
    if (!queue.length) return;

    var step = function () {
      var file = queue.shift();
      if (!file) return;

      util.readAsDataURL(file, function (err, dataURL) {
        if (err) {
          setTimeout(step, 0);
          return;
        }

        IE.panel.addRecent(dataURL);
        IE.canvas.addImage(dataURL, function () {
          setTimeout(step, 80);
        });
      });
    };

    step();
  }

  /** 여러 장을 순서대로 추가 (저작권 확인 거침) */
  function addImageFiles(list) {
    var files = Array.prototype.slice.call(list || []).filter(function (file) {
      return /^image\//.test(file.type);
    });
    if (!files.length) return;

    confirmCopyrightAndProceed(function () {
      addImageFilesInternal(files);
    }, function () {
      util.toast('이미지 불러오기가 취소되었습니다.');
    });
  }

  /* ---------------------------------------------------------------- 배선 */

  function closeMenus() {
    var fileMenu = util.$('file-menu');
    var exportMenu = util.$('export-menu');
    if (fileMenu) fileMenu.hidden = true;
    if (exportMenu) exportMenu.hidden = true;
  }

  function initFileMenu() {
    var button = util.$('btn-file-menu');
    var menu = util.$('file-menu');

    button.addEventListener('click', function (ev) {
      ev.stopPropagation();
      var wasOpen = !menu.hidden;
      closeMenus();
      menu.hidden = wasOpen;
    });

    Array.prototype.forEach.call(menu.querySelectorAll('[data-file]'), function (item) {
      item.addEventListener('click', function (ev) {
        ev.stopPropagation();
        closeMenus();
        runFileAction(item.getAttribute('data-file'));
      });
    });
  }

  function openNewDocModal() {
    var modal = util.$('modal-new-doc');
    if (!modal) {
      IE.doc.newDocument(IE.state.docW, IE.state.docH, '#ffffff', []);
      util.toast('새 문서를 만들었습니다.');
      return;
    }
    modal.hidden = false;
  }

  function initNewDocModal() {
    var modal = util.$('modal-new-doc');
    if (!modal) return;
    var closeBtn = util.$('modal-new-doc-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        modal.hidden = true;
      });
    }
    modal.addEventListener('mousedown', function (ev) {
      if (ev.target === modal) modal.hidden = true;
    });

    var SPECS = {
      'web-banner': { w: 1200, h: 400, name: '홈페이지 배너 (1200×400)' },
      'sub-banner': { w: 1200, h: 200, name: '홈페이지 띠배너 (1200×200)' },
      'popup-small': { w: 400, h: 400, name: '홈페이지 작은 팝업 (400×400)' },
      'popup-medium': { w: 500, h: 650, name: '홈페이지 레이어 팝업 (500×650)' },
      banner: { w: 2400, h: 800, name: '현수막 / 와이드 배너 (2400×800)' },
      poster: { w: 1240, h: 1754, name: '홍보물 / 안내 포스터 (A4 1240×1754)' },
      sns: { w: 1080, h: 1080, name: 'SNS / 카드뉴스 (1080×1080)' },
      doc: { w: 1240, h: 1754, name: '공문서 / 보고서 (A4 1240×1754)' },
      ppt: { w: 1920, h: 1080, name: '발표자료 (PPT 1920×1080)' },
      photo: { w: 413, h: 531, name: '증명사진 (3.5×4.5cm)' },
      card: { w: 1063, h: 591, name: '명함 (90×50mm)' }
    };

    Array.prototype.forEach.call(modal.querySelectorAll('[data-new-type]'), function (btn) {
      btn.addEventListener('click', function () {
        var type = btn.getAttribute('data-new-type');
        modal.hidden = true;
        if (type === 'custom') {
          IE.pagesettings.open();
          return;
        }
        var spec = SPECS[type];
        if (spec) {
          IE.doc.newDocument(spec.w, spec.h, '#ffffff', []);
          util.toast(spec.name + ' 규격으로 새 문서를 시작합니다.');
        }
      });
    });
  }

  function runFileAction(action) {
    if (action === 'new') {
      openNewDocModal();
      return;
    }
    if (action === 'open') {
      var input = util.$('file-project');
      input.value = '';
      input.click();
      return;
    }
    if (action === 'save') {
      IE.exporter.saveProject();
      return;
    }
    if (action === 'save-template') {
      IE.panel.open('templates');
      IE.gallery.setTab('user');
      IE.panel.refresh();
      return;
    }
    if (action === 'page-settings') {
      IE.pagesettings.open();
      return;
    }
    if (action === 'shortcuts') {
      util.$('modal-shortcuts').hidden = false;
      return;
    }
    if (action === 'beta-notice') {
      util.$('modal-beta-notice').hidden = false;
      return;
    }
    if (action === 'about-license') {
      util.$('modal-about-license').hidden = false;
      return;
    }
  }

  function initExportMenu() {
    var button = util.$('btn-export');
    var menu = util.$('export-menu');

    button.addEventListener('click', function (ev) {
      ev.stopPropagation();
      var wasOpen = !menu.hidden;
      closeMenus();
      menu.hidden = wasOpen;
    });

    Array.prototype.forEach.call(menu.querySelectorAll('button'), function (item) {
      item.addEventListener('click', function (ev) {
        ev.stopPropagation();
        closeMenus();

        if (item.getAttribute('data-export-all')) {
          IE.exporter.exportAllPages('png', 2);
          return;
        }

        if (item.getAttribute('data-export-pptx')) {
          IE.exporter.exportPPTX();
          return;
        }

        if (item.getAttribute('data-export-hwpx')) {
          IE.exporter.exportHWPX();
          return;
        }

        IE.exporter.exportImage(
          item.getAttribute('data-format'),
          parseFloat(item.getAttribute('data-scale')) || 1
        );
      });
    });

    document.addEventListener('click', closeMenus);
  }

  function initTopbar() {
    util.on('btn-undo', 'click', function () {
      IE.state.history.undo();
      updateStatus();
    });

    util.on('btn-redo', 'click', function () {
      IE.state.history.redo();
      updateStatus();
    });

    util.on('btn-zoom-in', 'click', function () {
      IE.state.autoFit = false;
      IE.canvas.setZoom(IE.state.zoom * 1.2);
    });

    util.on('btn-zoom-out', 'click', function () {
      IE.state.autoFit = false;
      IE.canvas.setZoom(IE.state.zoom / 1.2);
    });

    util.on('btn-zoom-fit', 'click', function () { IE.canvas.zoomToFit(); });

    util.on('zoom-label', 'click', function () {
      IE.state.autoFit = false;
      IE.canvas.setZoom(1);
    });

    util.on('btn-guides', 'click', toggleGuides);
  }

  function initTabs() {
    var tabs = document.querySelectorAll('.tab');

    Array.prototype.forEach.call(tabs, function (tab) {
      tab.addEventListener('click', function () {
        Array.prototype.forEach.call(tabs, function (t) { t.classList.remove('is-active'); });
        tab.classList.add('is-active');

        var name = tab.getAttribute('data-tab');
        util.$('panel-props').hidden = name !== 'props';
        util.$('panel-layers').hidden = name !== 'layers';

        if (name === 'layers') IE.layers.refresh();
      });
    });
  }

  function initFileInputs() {
    util.$('file-image').addEventListener('change', function (ev) {
      onImagesChosen(ev.target.files);
      ev.target.value = '';
    });

    util.$('file-project').addEventListener('change', function (ev) {
      var file = ev.target.files && ev.target.files[0];
      if (file) IE.exporter.loadProject(file);
      ev.target.value = '';
    });
  }

  function initKeyboard() {
    document.addEventListener('keydown', function (ev) {
      var tag = (ev.target && ev.target.tagName) || '';
      var inField = (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT');
      var canvas = IE.state.canvas;
      var active = canvas.getActiveObject();
      var editing = !!(active && active.isEditing);
      var ctrl = ev.ctrlKey || ev.metaKey;

      if (ev.key === 'Escape') {
        if (IE.imgedit && IE.imgedit.isOpen()) { IE.imgedit.close(false); ev.preventDefault(); return; }

        var openModal = ['modal-table', 'modal-page', 'modal-shortcuts', 'modal-about-license'].filter(function (id) {
          var el = util.$(id);
          return el && !el.hidden;
        })[0];

        if (IE.crop && IE.crop.isActive()) { IE.crop.exit(true); ev.preventDefault(); return; }
        if (openModal) { util.$(openModal).hidden = true; ev.preventDefault(); return; }
        if (IE.panel.isOpen()) { IE.panel.close(); ev.preventDefault(); return; }
        closeMenus();
        return;
      }

      // 이미지 편집 창이 열려 있으면 캔버스 편집 키를 막는다
      if (IE.imgedit && IE.imgedit.isOpen()) return;

      // 구도 조절 중에는 일반 편집 키를 막는다
      if (IE.crop && IE.crop.isActive() && !inField) {
        if (ev.key === 'Enter') { IE.crop.reset(); ev.preventDefault(); }
        return;
      }

      // 스페이스 누른 채 드래그 = 화면 이동
      if (ev.code === 'Space' && !inField && !editing) {
        spaceDown = true;
        var stage = util.$('stage');
        if (stage) stage.classList.add('is-panning');
        ev.preventDefault();
        return;
      }

      if (ctrl && !ev.altKey) {
        var key = String(ev.key).toLowerCase();
        var redoCombo = (key === 'y') || (key === 'z' && ev.shiftKey);

        if (key === 'z' && !ev.shiftKey) {
          if (inField && !editing) return;
          ev.preventDefault();
          IE.state.history.undo();
          updateStatus();
          return;
        }
        if (redoCombo) {
          if (inField && !editing) return;
          ev.preventDefault();
          IE.state.history.redo();
          updateStatus();
          return;
        }
        if (key === 'd' && !inField && !editing) {
          ev.preventDefault();
          IE.canvas.duplicateActive();
          return;
        }
        if (key === 'c' && !inField && !editing) {
          ev.preventDefault();
          IE.canvas.copyActive();
          return;
        }
        if (key === 'v' && !inField && !editing) {
          ev.preventDefault();
          IE.canvas.paste();
          return;
        }
        if (key === 'a' && !inField && !editing) {
          ev.preventDefault();
          var objects = canvas.getObjects().filter(function (obj) {
            return obj.selectable && obj.visible !== false;
          });
          if (objects.length) {
            canvas.setActiveObject(new fabric.ActiveSelection(objects, { canvas: canvas }));
            canvas.requestRenderAll();
            IE.panels.refresh();
            updateStatus();
          }
          return;
        }
        if (key === 'g' && !inField && !editing) {
          ev.preventDefault();
          if (ev.shiftKey) {
            IE.canvas.ungroupActive();
          } else {
            IE.canvas.groupActive();
          }
          return;
        }
        if (key === 'l' && !inField && !editing) {
          ev.preventDefault();
          IE.canvas.toggleLockActive();
          return;
        }
        if (key === ']' && !inField && !editing) {
          ev.preventDefault();
          IE.canvas.reorder(ev.shiftKey ? 'front' : 'up');
          return;
        }
        if (key === '[' && !inField && !editing) {
          ev.preventDefault();
          IE.canvas.reorder(ev.shiftKey ? 'back' : 'down');
          return;
        }
        if (key === 'o') {
          ev.preventDefault();
          runFileAction('open');
          return;
        }
        if (key === 's') {
          ev.preventDefault();
          IE.exporter.saveProject();
          return;
        }
      }

      if (inField || editing) return;

      if (ev.key === '?' || (ev.key === '/' && ev.shiftKey)) {
        util.$('modal-shortcuts').hidden = false;
        ev.preventDefault();
        return;
      }

      // 화살표 미세 이동 (shift = 10px)
      var arrows = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
      if (arrows[ev.key]) {
        var stepSize = ev.shiftKey ? 10 : 1;
        var delta = arrows[ev.key];
        if (IE.canvas.nudge(delta[0] * stepSize, delta[1] * stepSize)) ev.preventDefault();
        return;
      }

      if (ev.key === 'Delete' || ev.key === 'Backspace') {
        if (IE.canvas.deleteActive()) ev.preventDefault();
        return;
      }
      if (ev.key === '+' || ev.key === '=') {
        IE.state.autoFit = false;
        IE.canvas.setZoom(IE.state.zoom * 1.2);
        return;
      }
      if (ev.key === '-' || ev.key === '_') {
        IE.state.autoFit = false;
        IE.canvas.setZoom(IE.state.zoom / 1.2);
        return;
      }
      if (ev.key === '0') {
        IE.canvas.zoomToFit();
        return;
      }
      if (ev.key === 'F5') {
        ev.preventDefault();
        if (IE.preview) IE.preview.open();
        return;
      }
    });

    document.addEventListener('keyup', function (ev) {
      if (ev.code === 'Space') {
        spaceDown = false;
        var stage = util.$('stage');
        if (stage) stage.classList.remove('is-panning');
      }
    });

    window.addEventListener('blur', function () {
      spaceDown = false;
      panning = false;
      var stage = util.$('stage');
      if (stage) stage.classList.remove('is-panning');
    });
  }

  /** ctrl+휠 로 커서 위치를 기준으로 확대/축소, 스페이스+드래그로 화면 이동 */
  function initZoomPan() {
    var stage = util.$('stage');

    stage.addEventListener('wheel', function (ev) {
      if (!ev.ctrlKey && !ev.metaKey) return;
      ev.preventDefault();

      IE.state.autoFit = false;

      var prevZoom = IE.state.zoom || 1;
      var nextZoom = util.clamp(prevZoom * Math.pow(0.998, ev.deltaY), 0.05, 6);
      if (Math.abs(nextZoom - prevZoom) < 0.001) return;

      var stageRect = stage.getBoundingClientRect();
      var mouseX = ev.clientX - stageRect.left;
      var mouseY = ev.clientY - stageRect.top;

      var ratio = nextZoom / prevZoom;
      var targetScrollTop = (stage.scrollTop + mouseY) * ratio - mouseY;
      var targetScrollLeft = (stage.scrollLeft + mouseX) * ratio - mouseX;

      IE.canvas.setZoom(nextZoom);

      stage.scrollTop = Math.max(0, targetScrollTop);
      stage.scrollLeft = Math.max(0, targetScrollLeft);

      updateStatus();
      if (IE.panels) IE.panels.refresh();
    }, { passive: false });

    stage.addEventListener('mousedown', function (ev) {
      if (!spaceDown) return;
      panning = true;
      panStart = { x: ev.clientX, y: ev.clientY, scrollLeft: stage.scrollLeft, scrollTop: stage.scrollTop };
      stage.classList.add('is-grabbing');
      ev.preventDefault();
    });

    window.addEventListener('mousemove', function (ev) {
      if (!panning || !panStart) return;
      stage.scrollLeft = panStart.scrollLeft - (ev.clientX - panStart.x);
      stage.scrollTop = panStart.scrollTop - (ev.clientY - panStart.y);
      ev.preventDefault();
    });

    window.addEventListener('mouseup', function () {
      if (!panning) return;
      panning = false;
      panStart = null;
      stage.classList.remove('is-grabbing');
    });
  }

  /** 캔버스 아무 곳에나 이미지를 끌어다 놓으면 추가된다 */
  function initStageDrop() {
    var stage = util.$('stage');

    ['dragover', 'drop'].forEach(function (type) {
      stage.addEventListener(type, function (ev) {
        if (!ev.dataTransfer) return;
        var hasFiles = Array.prototype.some.call(ev.dataTransfer.types || [], function (t) {
          return t === 'Files';
        });
        if (!hasFiles) return;

        ev.preventDefault();
        if (type === 'drop') {
          addImageFiles(ev.dataTransfer.files);
        } else {
          ev.dataTransfer.dropEffect = 'copy';
        }
      });
    });
  }

  function initShortcutModal() {
    util.on('btn-shortcuts', 'click', function () { util.$('modal-shortcuts').hidden = false; });
    util.on('modal-shortcuts-close', 'click', function () { util.$('modal-shortcuts').hidden = true; });
    util.on('modal-shortcuts', 'mousedown', function (ev) {
      if (ev.target === util.$('modal-shortcuts')) util.$('modal-shortcuts').hidden = true;
    });
  }

  function initAboutLicenseModal() {
    util.on('btn-about-license', 'click', function () { util.$('modal-about-license').hidden = false; });
    util.on('modal-about-license-close', 'click', function () { util.$('modal-about-license').hidden = true; });
    util.on('modal-about-license-ok', 'click', function () { util.$('modal-about-license').hidden = true; });
    util.on('modal-about-license', 'mousedown', function (ev) {
      if (ev.target === util.$('modal-about-license')) util.$('modal-about-license').hidden = true;
    });
  }

  function initBetaNoticeModal() {
    var modal = util.$('modal-beta-notice');
    if (!modal) return;

    var btnOk = util.$('btn-beta-notice-confirm');
    var btnX = util.$('btn-beta-notice-x');
    var chkToday = util.$('chk-beta-notice-today');

    function closeModal() {
      if (chkToday && chkToday.checked) {
        try {
          localStorage.setItem('hide_beta_notice_forever', '1');
        } catch (e) {}
      }
      modal.hidden = true;
    }

    if (btnOk) btnOk.addEventListener('click', closeModal);
    if (btnX) btnX.addEventListener('click', closeModal);
    util.on('btn-beta-notice', 'click', function () { modal.hidden = false; });
    modal.addEventListener('mousedown', function (ev) {
      if (ev.target === modal) closeModal();
    });

    // 실행 즉시 팝업 오픈 (다시 보지 않기 여부 체크)
    var hideForever = false;
    try {
      hideForever = localStorage.getItem('hide_beta_notice_forever') === '1' ||
                    (parseInt(localStorage.getItem('hide_beta_notice_until') || '0', 10) > Date.now());
    } catch (e) {}

    if (!hideForever) {
      modal.hidden = false;
    }
  }

  function initResize() {
    window.addEventListener('resize', function () {
      if (IE.state.autoFit) IE.canvas.zoomToFit();
    });
  }

  /* ---------------------------------------------------------------- 시작 */

  function init() {
    IE.canvas.createCanvas('c');

    IE.state.history = new IE.History(IE.state.canvas);
    IE.state.history.onChange = function () { updateStatus(); };

    IE.properties.init();
    IE.layers.init();
    IE.guides.init();
    IE.crop.init();
    IE.imgedit.init();
    IE.table.init();
    IE.pagesettings.init();
    IE.pages.init();
    IE.panel.init();
    if (IE.preview) IE.preview.init();

    initTopbar();
    initTabs();
    initFileMenu();
    initExportMenu();
    initFileInputs();
    initKeyboard();
    initZoomPan();
    initStageDrop();
    initShortcutModal();
    initAboutLicenseModal();
    initBetaNoticeModal();
    initNewDocModal();
    initResize();

    var starter = IE.templates.byId('notice-a4') || {
      id: 'blank-a4',
      width: 1240,
      height: 1754,
      background: '#ffffff',
      objects: []
    };
    IE.state.docName = starter.id;
    IE.doc.newDocument(starter.width, starter.height, starter.background, starter.objects);

    IE.pages.setVisible(false);
    updateStatus();

    // 처음 실행 시 템플릿 패널 기본 열기
    IE.panel.open('templates');


  }

  IE.app = {
    init: init,
    updateStatus: updateStatus,
    toggleGuides: toggleGuides,
    hideHint: hideHint,
    pickImageForSlot: pickImageForSlot,
    pickImageForReplace: pickImageForReplace,
    openImagePicker: openImagePicker,
    addImageFiles: addImageFiles,
    confirmCopyrightAndProceed: confirmCopyrightAndProceed,
    closeMenus: closeMenus,
    runFileAction: runFileAction,
    /* 이전 API 호환 */
    openIconPicker: function (callback) {
      if (callback) IE.panel.pickIcon(callback);
      else IE.panel.open('elements');
    },
    closeIconPicker: function () { if (IE.panel.current() === 'elements') IE.panel.close(); }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window.IE);
