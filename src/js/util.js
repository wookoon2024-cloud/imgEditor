window.IE = window.IE || {};

(function (IE) {
  'use strict';

  var util = {};

  util.VERSION = '1.10.0';

  /**
   * fabric 직렬화(toJSON/loadFromJSON) 시 함께 보존해야 하는 커스텀 속성.
   * 표의 tableData 처럼 구조가 깊은 값은 여기 넣지 않고 각 객체의 toObject 에서 직접 다룬다.
   * (fabric 이 propertiesToInclude 를 깊은 복사하면서 순환/폭주할 수 있다)
   */
  util.EXTRA_PROPS = [
    'kind', 'name', 'isSlot', 'slotLabel', 'slotW', 'slotH', 'isGuide',
    'isLocked', 'lockMovementX', 'lockMovementY', 'lockRotation', 'lockScalingX', 'lockScalingY', 'hasControls',
    'frameRect', 'cropInfo', 'cropOffsetX', 'cropOffsetY', 'clipShape',
    'gradientPreset', 'shadowPreset', 'iconName', 'decorName',
    'iconStyle', 'iconColors', 'iconSize', 'slot',
    'figureName', 'figureStyle', 'figureColors', 'figureSize'
  ];

  util.$ = function (id) {
    return document.getElementById(id);
  };

  /** 이벤트 배선용 — 요소가 없으면 조용히 건너뛴다 (초기화 전체가 죽지 않게) */
  util.on = function (id, event, handler) {
    var el = document.getElementById(id);
    if (!el) return null;
    el.addEventListener(event, handler);
    return el;
  };

  util.clamp = function (value, min, max) {
    return value < min ? min : (value > max ? max : value);
  };

  util.round = function (value) {
    return Math.round(value);
  };

  util.escapeHtml = function (value) {
    return String(value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  };

  var toastTimer = null;

  util.toast = function (message, ms) {
    var el = util.$('toast');
    if (!el) return;
    el.textContent = message;
    el.hidden = false;
    // 강제 리플로우로 hidden 해제 직후 트랜지션이 걸리게 한다
    void el.offsetWidth;
    el.classList.add('show');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.remove('show');
      setTimeout(function () { el.hidden = true; }, 220);
    }, ms || 1800);
  };

  util.dataURLToBlob = function (dataURL) {
    var parts = dataURL.split(',');
    var mimeMatch = parts[0].match(/:(.*?);/);
    var mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    var binary = atob(parts[1]);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: mime });
  };

  util.download = function (filename, data) {
    var blob = (typeof data === 'string') ? util.dataURLToBlob(data) : data;
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  };

  util.readAsDataURL = function (file, cb) {
    var reader = new FileReader();
    reader.onload = function () { cb(null, reader.result); };
    reader.onerror = function () { cb(reader.error || new Error('파일을 읽지 못했습니다.')); };
    reader.readAsDataURL(file);
  };

  util.readAsText = function (file, cb) {
    var reader = new FileReader();
    reader.onload = function () { cb(null, reader.result); };
    reader.onerror = function () { cb(reader.error || new Error('파일을 읽지 못했습니다.')); };
    reader.readAsText(file, 'utf-8');
  };

  util.fitContain = function (imageW, imageH, boxW, boxH) {
    if (!imageW || !imageH) return 1;
    return Math.min(boxW / imageW, boxH / imageH);
  };

  util.timestamp = function () {
    var d = new Date();
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    return String(d.getFullYear()) + pad(d.getMonth() + 1) + pad(d.getDate()) +
      '_' + pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
  };

  util.debounce = function (fn, wait) {
    var timer = null;
    return function () {
      var args = arguments;
      var self = this;
      clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(self, args); }, wait);
    };
  };

  var uidCounter = 0;

  util.uid = function (prefix) {
    uidCounter += 1;
    return (prefix || 'id') + '-' + Date.now().toString(36) + '-' + uidCounter.toString(36);
  };

  util.clone = function (value) {
    return JSON.parse(JSON.stringify(value));
  };

  /** 색상 밝기 계산 (0=검정, 1=흰색) — 대비되는 글자색을 고를 때 사용 */
  util.luminance = function (color) {
    var hex = util.toHex(color);
    if (!hex) return 1;
    var r = parseInt(hex.slice(1, 3), 16) / 255;
    var g = parseInt(hex.slice(3, 5), 16) / 255;
    var b = parseInt(hex.slice(5, 7), 16) / 255;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  var NAMED_COLORS = {
    white: '#ffffff', black: '#000000', red: '#ff0000', blue: '#0000ff',
    green: '#008000', gray: '#808080', grey: '#808080', transparent: null
  };

  util.toHex = function (color) {
    if (typeof color !== 'string') return null;
    var value = color.trim().toLowerCase();

    if (Object.prototype.hasOwnProperty.call(NAMED_COLORS, value)) return NAMED_COLORS[value];
    if (/^#[0-9a-f]{6}$/.test(value)) return value;
    if (/^#[0-9a-f]{3}$/.test(value)) {
      return '#' + value[1] + value[1] + value[2] + value[2] + value[3] + value[3];
    }

    var rgb = value.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/);
    if (rgb) {
      return '#' + [1, 2, 3].map(function (i) {
        var part = Math.round(parseFloat(rgb[i]));
        return ('0' + Math.max(0, Math.min(255, part)).toString(16)).slice(-2);
      }).join('');
    }
    return null;
  };

  util.isTransparent = function (color) {
    if (!color) return true;
    if (typeof color !== 'string') return false;
    return /^rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)$/.test(color.trim()) ||
      color.trim() === 'transparent';
  };

  /** 파일 선택 대화상자를 열고 선택된 파일 하나를 콜백으로 넘긴다. */
  util.pickFile = function (inputId, accept, onFile) {
    var input = util.$(inputId);
    input.setAttribute('accept', accept);
    input.value = '';
    input.onchange = function () {
      var file = input.files && input.files[0];
      if (file) onFile(file);
      input.value = '';
    };
    input.click();
  };

  /* ================================================== 버튼 글자 넘침 막기 */

  var fitting = false;

  function fitPass(root) {
    var changed = 0;

    Array.prototype.forEach.call(root.querySelectorAll('button'), function (btn) {
      // 한 버튼에서 문제가 생겨도 나머지는 계속 처리한다
      try {
        changed += fitOne(btn);
      } catch (err) {
        if (window.console && console.warn) console.warn('버튼 폭 계산 실패', err);
      }
    });

    return changed;
  }

  function fitOne(btn) {
    // 숨은 칸(폭 0)의 버튼은 잴 수 없다 — 건드리면 멀쩡한 버튼이 아이콘만 남는다
    if (!btn.clientWidth) return 0;

    // 여러 조각으로 된 버튼은 글자를 감싸면 모양이 깨진다 (글꼴 목록 등) — 손대지 않는다
    if (btn.hasAttribute('data-no-fit')) return 0;

    // 이미 아이콘만 남긴 버튼은 다시 재지 않는다.
    // 글자를 숨기면 폭이 0 이 되어, 그대로 재면 "들어간다"고 잘못 판단해
    // 다시 글자를 보여 주는 진동이 생긴다. 되돌리려면 refitButtons 를 쓴다.
    if (btn.classList.contains('is-icon-only')) return 0;

    // 사진 카드처럼 그림이 들어간 버튼은 글자를 감싸면 모양이 깨진다
    if (btn.querySelector('img, canvas, input, textarea, select')) return 0;

    // 아이콘(svg) 말고 다른 요소가 들어 있으면 내용이 여러 조각이다
    // (글꼴 줄의 이름+견본, 색 조합 스와치, 미리보기 글자 …).
    // 글자를 span 하나로 감싸면 조각들이 뭉개지거나 잘려 사라진다.
    for (var k = 0; k < btn.children.length; k++) {
      if (btn.children[k].tagName.toLowerCase() !== 'svg') return 0;
    }

    var svg = null;
    var i;

    for (i = 0; i < btn.children.length; i++) {
      if (btn.children[i].tagName.toLowerCase() === 'svg') { svg = btn.children[i]; break; }
    }

    var label = btn.querySelector('.btn-label');

    // 아이콘이 있든 없든 글자를 span 으로 감싼다 — 좁을 때 잘라내려면 필요하다
    if (!label) {
      var moving = [];
      for (i = 0; i < btn.childNodes.length; i++) {
        if (btn.childNodes[i] !== svg) moving.push(btn.childNodes[i]);
      }
      if (!moving.length) return 0;

      label = document.createElement('span');
      label.className = 'btn-label';
      moving.forEach(function (node) { label.appendChild(node); });
      btn.appendChild(label);
    }

    if (!label.textContent.trim()) return 0;

    // 글자를 숨기면 이름을 알 길이 없으니 title 로 옮겨 둔다
    if (!btn.getAttribute('title')) {
      btn.setAttribute('title', label.textContent.replace(/\s+/g, ' ').trim());
    }

    // 글자가 안 들어가거나, 버튼 자체가 제 칸을 넘치면 접는다
    var clipped = label.scrollWidth > label.clientWidth + 1 ||
      btn.scrollWidth > btn.clientWidth + 1;

    // 아이콘이 있으면 글자를 아예 지우고 아이콘만 남긴다.
    // 없으면 잘린 채로 두되, 밖으로 넘치지는 않게 한다 (CSS 의 말줄임표 처리)
    var iconOnly = clipped && !!svg;

    if (iconOnly === btn.classList.contains('is-icon-only')) return 0;

    btn.classList.toggle('is-icon-only', iconOnly);
    return 1;
  }

  /**
   * 좁은 칸에 들어간 버튼은 글자가 상자 밖으로 삐져나온다.
   * 아이콘이 함께 있는 버튼은, 글자가 안 들어가면 글자를 숨기고 아이콘만 남긴다.
   * 마우스를 올리면 title 로 이름이 뜬다.
   *
   * 한 버튼이 아이콘만 남으면 이웃 자리가 넓어지므로, 더 고칠 게 없을 때까지
   * 몇 번 돌린다 (보통 한두 번이면 끝난다).
   */
  util.fitButtons = function (root) {
    if (fitting) return;

    fitting = true;
    util.__fitRuns = (util.__fitRuns || 0) + 1;

    try {
      for (var i = 0; i < 4; i++) {
        if (fitPass(root || document) === 0) break;
      }
    } finally {
      // 예외가 나도 반드시 풀어 준다. 잠기면 그 뒤로 아무것도 못 재는다.
      fitting = false;
    }
  };

  /** 처음부터 다시 잰다 (넓어지면 글자가 돌아온다) */
  util.refitButtons = function (root) {
    var scope = root || document;
    if (fitting) return;

    Array.prototype.forEach.call(scope.querySelectorAll('button.is-icon-only'), function (btn) {
      btn.classList.remove('is-icon-only');
    });
    util.fitButtons(scope);
  };

  var fitTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(fitTimer);
    fitTimer = setTimeout(function () { util.refitButtons(document); }, 120);
  });

  /**
   * 지금 재고, 잠시 뒤 한 번 더 잰다.
   *
   * 글꼴이 늦게 적용되거나 줄바꿈이 일어나면 버튼 폭이 달라진다.
   * 한 번만 재면 "아까는 들어갔는데 지금은 잘리는" 경우를 놓친다.
   */
  util.refitButtonsSoon = function (root) {
    var scope = root || document;

    util.refitButtons(scope);
    setTimeout(function () { util.refitButtons(scope); }, 0);
    setTimeout(function () { util.refitButtons(scope); }, 160);
    setTimeout(function () { util.refitButtons(scope); }, 520);
  };

  /**
   * 이 칸의 폭이 바뀌면 다시 잰다.
   *
   * 사진이 늦게 올라오면 내용이 길어져 **스크롤바가 생기고**, 그만큼 칸이 좁아진다.
   * 그때 글자가 잘리기 시작하는데, 한 번 잰 값으로는 알 수 없다.
   */
  util.watchFit = function (el) {
    if (!el || !window.ResizeObserver || el.__fitWatched) return;

    el.__fitWatched = true;

    var observer = new ResizeObserver(function () {
      util.refitButtons(el);
    });
    observer.observe(el);
  };

  // 글꼴이 바뀌면 글자 폭이 달라진다
  if (document.fonts && document.fonts.ready && document.fonts.ready.then) {
    document.fonts.ready.then(function () { util.refitButtons(document); });
  }

  IE.util = util;
})(window.IE);
