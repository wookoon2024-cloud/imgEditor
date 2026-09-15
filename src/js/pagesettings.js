window.IE = window.IE || {};

(function (IE) {
  'use strict';

  var util = IE.util;

  /** mm 기준은 150dpi, 사진 규격·명함은 300dpi 로 계산한 픽셀값 */
  var PRESETS = [
    { id: 'a4', name: 'A4', note: '210 × 297 mm', w: 1240, h: 1754 },
    { id: 'a3', name: 'A3', note: '297 × 420 mm', w: 1754, h: 2480 },
    { id: 'a5', name: 'A5', note: '148 × 210 mm', w: 874, h: 1240 },
    { id: 'b5', name: 'B5', note: '182 × 257 mm', w: 1075, h: 1518 },
    { id: 'card', name: '명함', note: '90 × 50 mm', w: 1063, h: 591 },
    { id: 'photo', name: '증명사진', note: '3.5 × 4.5 cm', w: 413, h: 531 },
    { id: 'square', name: '정사각', note: '1080 × 1080', w: 1080, h: 1080 },
    { id: 'wide', name: '와이드', note: '1920 × 1080', w: 1920, h: 1080 },
    { id: 'banner', name: '현수막', note: '2400 × 800', w: 2400, h: 800 }
  ];

  var BG_COLORS = [
    '#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0',
    '#fff7ed', '#fef9c3', '#ecfdf5', '#eff6ff',
    '#eef2ff', '#fdf2f8', '#1e293b', '#0f172a'
  ];

  var selectedPreset = null;
  var orientation = 'portrait';
  var selectedBg = null;

  function $(id) { return util.$('page-' + id); }

  function renderPresets() {
    var host = util.$('page-presets');
    host.innerHTML = PRESETS.map(function (preset) {
      return '<button type="button" class="preset' + (preset.id === selectedPreset ? ' is-active' : '') +
        '" data-preset="' + preset.id + '">' +
        '<b>' + preset.name + '</b><span>' + preset.note + '</span>' +
      '</button>';
    }).join('');

    Array.prototype.forEach.call(host.querySelectorAll('[data-preset]'), function (button) {
      button.addEventListener('click', function () {
        selectedPreset = button.getAttribute('data-preset');
        applyOrientationToInputs();
        renderPresets();
      });
    });
  }

  function renderSwatches() {
    var host = util.$('page-bg-swatches');
    var curColor = (selectedBg && selectedBg.indexOf('#') === 0) ? selectedBg : '#ffffff';

    var swatches = BG_COLORS.map(function (color) {
      return '<button type="button" class="swatch' +
        (selectedBg && color.toLowerCase() === selectedBg.toLowerCase() ? ' is-active' : '') +
        '" data-bg="' + color + '" style="background:' + color + '" title="' + color + '"></button>';
    }).join('');

    var customBg = '<div class="page-bg-custom-wrap" title="직접 색상 선택">' +
      '<label class="color-picker-box" title="클릭하여 색상 선택">' +
        '<input type="color" id="page-bg-custom-color" value="' + curColor + '">' +
        '<span class="color-picker-thumb" id="page-bg-custom-thumb" style="background:' + curColor + '"></span>' +
      '</label>' +
      '<input type="text" id="page-bg-custom-hex" class="color-hex-input" value="' + curColor.toUpperCase() + '" maxlength="7" spellcheck="false" placeholder="#FFFFFF">' +
    '</div>';

    host.innerHTML = swatches + customBg;

    Array.prototype.forEach.call(host.querySelectorAll('[data-bg]'), function (button) {
      button.addEventListener('click', function () {
        selectedBg = button.getAttribute('data-bg');
        renderSwatches();
      });
    });

    var pColor = util.$('page-bg-custom-color');
    var pHex = util.$('page-bg-custom-hex');
    var pThumb = util.$('page-bg-custom-thumb');

    if (pColor) {
      var onPageColor = function (e) {
        selectedBg = e.target.value;
        if (pThumb) pThumb.style.background = selectedBg;
        if (pHex) pHex.value = selectedBg.toUpperCase();
        Array.prototype.forEach.call(host.querySelectorAll('[data-bg]'), function (other) {
          other.classList.toggle('is-active', other.getAttribute('data-bg').toLowerCase() === selectedBg.toLowerCase());
        });
      };
      pColor.addEventListener('input', onPageColor);
      pColor.addEventListener('change', onPageColor);
    }

    if (pHex) {
      var onHexChange = function () {
        var raw = pHex.value.trim();
        var valid = null;
        if (/^#?[0-9a-fA-F]{6}$/.test(raw)) {
          valid = (raw.indexOf('#') === 0 ? raw : '#' + raw).toLowerCase();
        } else if (/^#?[0-9a-fA-F]{3}$/.test(raw)) {
          var c = raw.replace('#', '');
          valid = ('#' + c[0] + c[0] + c[1] + c[1] + c[2] + c[2]).toLowerCase();
        }
        if (valid) {
          selectedBg = valid;
          if (pColor) pColor.value = valid;
          if (pThumb) pThumb.style.background = valid;
          pHex.value = valid.toUpperCase();
          Array.prototype.forEach.call(host.querySelectorAll('[data-bg]'), function (other) {
            other.classList.toggle('is-active', other.getAttribute('data-bg').toLowerCase() === valid.toLowerCase());
          });
        } else {
          pHex.value = (selectedBg || '#FFFFFF').toUpperCase();
        }
      };
      pHex.addEventListener('change', onHexChange);
      pHex.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          onHexChange();
        }
      });
    }
  }

  function presetById(id) {
    return PRESETS.filter(function (p) { return p.id === id; })[0] || null;
  }

  function applyOrientationToInputs() {
    var preset = presetById(selectedPreset);
    if (!preset) return;

    var w = Math.min(preset.w, preset.h);
    var h = Math.max(preset.w, preset.h);

    if (orientation === 'landscape') {
      var swap = w; w = h; h = swap;
    }

    $('w').value = w;
    $('h').value = h;
  }

  function syncOrientationFromSize() {
    var w = parseInt($('w').value, 10) || 0;
    var h = parseInt($('h').value, 10) || 0;
    var next = (w && h && w > h) ? 'landscape' : 'portrait';

    if (next !== orientation) {
      orientation = next;
      updateOrientButtons();
    }
  }

  function updateOrientButtons() {
    Array.prototype.forEach.call(util.$('page-orient').querySelectorAll('[data-orient]'), function (button) {
      button.classList.toggle('is-active', button.getAttribute('data-orient') === orientation);
    });
  }

  /* ------------------------------------------------------------ 열기/닫기 */

  function open() {
    var page = IE.doc.current();

    selectedPreset = matchPreset(page.width, page.height);
    orientation = (page.width > page.height) ? 'landscape' : 'portrait';
    selectedBg = util.toHex(page.background) || '#ffffff';

    if (!selectedPreset) {
      $('w').value = page.width;
      $('h').value = page.height;
    } else {
      applyOrientationToInputs();
    }

    renderPresets();
    renderSwatches();
    updateOrientButtons();
    util.$('page-apply-all').checked = false;

    util.$('modal-page').hidden = false;
  }

  function matchPreset(w, h) {
    var found = null;
    PRESETS.forEach(function (preset) {
      if ((preset.w === w && preset.h === h) ||
        (preset.w === h && preset.h === w)) {
        found = preset.id;
      }
    });
    return found;
  }

  function close() {
    util.$('modal-page').hidden = true;
  }

  function apply() {
    var w = util.clamp(parseInt($('w').value, 10) || 0, 40, 8000);
    var h = util.clamp(parseInt($('h').value, 10) || 0, 40, 8000);
    var all = util.$('page-apply-all').checked;

    if (!w || !h) {
      util.toast('가로·세로 크기를 입력하세요.');
      return;
    }

    IE.doc.resize(w, h, all);

    if (selectedBg) {
      IE.doc.setBackground(selectedBg, all);
    }

    close();
    util.toast('페이지 설정을 적용했습니다 (' + w + ' × ' + h + 'px' +
      (all ? ', 모든 페이지' : '') + ').');
  }

  /* --------------------------------------------------------------- 초기화 */

  function init() {
    util.on('modal-page-close', 'click', close);
    util.on('modal-page-cancel', 'click', close);
    util.on('modal-page-apply', 'click', apply);

    util.on('modal-page', 'mousedown', function (ev) {
      if (ev.target === util.$('modal-page')) close();
    });

    Array.prototype.forEach.call(util.$('page-orient').querySelectorAll('[data-orient]'), function (button) {
      button.addEventListener('click', function () {
        orientation = button.getAttribute('data-orient');
        updateOrientButtons();

        if (selectedPreset) {
          applyOrientationToInputs();
        } else {
          var w = parseInt($('w').value, 10) || 0;
          var h = parseInt($('h').value, 10) || 0;
          if (w && h) {
            $('w').value = Math.min(w, h);
            $('h').value = Math.max(w, h);
            if (orientation === 'landscape') {
              var swap = $('w').value;
              $('w').value = $('h').value;
              $('h').value = swap;
            }
          }
        }
      });
    });

    ['w', 'h'].forEach(function (key) {
      var input = $(key);
      input.addEventListener('input', function () {
        // 직접 입력하면 프리셋 선택을 해제한다
        if (selectedPreset && !presetMatchesInput()) {
          selectedPreset = null;
          renderPresets();
        }
        syncOrientationFromSize();
      });
    });
  }

  function presetMatchesInput() {
    var preset = presetById(selectedPreset);
    if (!preset) return false;

    var w = parseInt($('w').value, 10);
    var h = parseInt($('h').value, 10);
    return (preset.w === w && preset.h === h) || (preset.w === h && preset.h === w);
  }

  IE.pagesettings = {
    init: init,
    open: open,
    close: close,
    presets: PRESETS
  };
})(window.IE);
