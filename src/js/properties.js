window.IE = window.IE || {};

(function (IE) {
  'use strict';

  var util = IE.util;

  var SHAPE_KINDS = ['rect', 'roundrect', 'circle', 'triangle', 'line', 'polygon', 'arrow', 'icon'];

  var SHADOW_PRESETS = [
    { id: 'none', label: '없음' },
    { id: 'soft', label: '부드럽게', color: 'rgba(15,23,42,0.22)', blur: 16, offsetX: 0, offsetY: 6 },
    { id: 'drop', label: '떠 있게', color: 'rgba(15,23,42,0.38)', blur: 20, offsetX: 5, offsetY: 9 },
    { id: 'hard', label: '진하게', color: 'rgba(0,0,0,0.55)', blur: 4, offsetX: 4, offsetY: 4 },
    { id: 'glow', label: '빛나게', color: 'rgba(37,99,235,0.55)', blur: 24, offsetX: 0, offsetY: 0 }
  ];

  var shadowPresetById = {};
  SHADOW_PRESETS.forEach(function (preset) { shadowPresetById[preset.id] = preset; });

  /** 템플릿 정의에서 그림자를 쓰고 싶을 때 */
  function shadowFromDef(def) {
    if (!def.shadow) return null;
    var spec = (typeof def.shadow === 'string') ? shadowPresetById[def.shadow] : def.shadow;
    if (!spec || spec.id === 'none') return null;
    return new fabric.Shadow({
      color: spec.color || 'rgba(15,23,42,0.35)',
      blur: spec.blur == null ? 12 : spec.blur,
      offsetX: spec.offsetX == null ? 4 : spec.offsetX,
      offsetY: spec.offsetY == null ? 6 : spec.offsetY
    });
  }

  var CLIP_SHAPES = [
    { value: 'none', label: '없음' },
    { value: 'rect', label: '사각' },
    { value: 'rounded', label: '둥근' },
    { value: 'circle', label: '원' }
  ];

  /** 증명사진 배경으로 실제 사용되는 색 위주 */
  var BG_PRESETS = [
    { label: '흰색', value: '#ffffff' },
    { label: '하늘색', value: '#4a90d9' },
    { label: '연회색', value: '#d8dde3' },
    { label: '연분홍', value: '#f2dfe0' }
  ];

  /* ------------------------------------------------------------- 유틸 */

  function isShape(obj) {
    return SHAPE_KINDS.indexOf(obj.kind) !== -1;
  }

  function round2(value) {
    return Math.round(value * 100) / 100;
  }

  function normalizeColor(value) {
    if (typeof value !== 'string') return '#000000';
    if (/^#[0-9a-fA-F]{6}$/.test(value)) return value.toLowerCase();
    if (/^#[0-9a-fA-F]{3}$/.test(value)) {
      return ('#' + value[1] + value[1] + value[2] + value[2] + value[3] + value[3]).toLowerCase();
    }
    return '#000000';
  }

  function isTransparent(value) {
    return !value || value === 'transparent' || /rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)/.test(value);
  }

  /* --------------------------------------------------------- HTML 조각 */

  function row(label, inner, extraClass) {
    return '<div class="field' + (extraClass ? ' ' + extraClass : '') + '">' +
      '<label>' + label + '</label>' + inner + '</div>';
  }

  function pair(label, tagA, htmlA, tagB, htmlB) {
    return '<div class="field"><label>' + label + '</label>' +
      '<div class="pair">' +
        '<span class="pair-tag">' + tagA + '</span>' + htmlA +
        '<span class="pair-tag">' + tagB + '</span>' + htmlB +
      '</div></div>';
  }

  function numberInput(prop, value, opts) {
    opts = opts || {};
    var html = '<input type="number" data-prop="' + prop + '" value="' + round2(value) + '"';
    if (opts.min != null) html += ' min="' + opts.min + '"';
    if (opts.max != null) html += ' max="' + opts.max + '"';
    if (opts.step != null) html += ' step="' + opts.step + '"';
    return html + '>';
  }

  function colorInput(prop, value) {
    return '<input type="color" data-prop="' + prop + '" value="' + normalizeColor(value) + '">';
  }

  function rangeInput(prop, value, min, max, step) {
    return '<div class="range-row">' +
      '<input type="range" data-prop="' + prop + '" min="' + min + '" max="' + max +
        '" step="' + step + '" value="' + value + '">' +
      '<output data-out="' + prop + '">' + formatOutput(prop, value) + '</output>' +
    '</div>';
  }

  function selectInput(prop, value, options) {
    var html = '<select data-prop="' + prop + '">';
    options.forEach(function (option) {
      html += '<option value="' + option.value + '"' +
        (option.value === value ? ' selected' : '') + '>' + util.escapeHtml(option.label) + '</option>';
    });
    return html + '</select>';
  }

  /**
   * 글꼴 고르기 — 이름을 그 글꼴로 그려서 보여 준다.
   * 기본 글꼴과 이 PC 에 설치된 글꼴을 묶어서 보여 준다.
   */
  function fontSelect(value) {
    var current = value || IE.canvas.FONT;
    var groups = IE.fonts.groups(current);

    var html = '<select data-prop="fontFamily" class="font-select" title="글꼴">';

    groups.forEach(function (group) {
      html += '<optgroup label="' + util.escapeHtml(group.label) + '">';

      group.fonts.forEach(function (font) {
        html += '<option value="' + util.escapeHtml(font.value) + '"' +
          ' style="font-family:' + IE.fonts.css(font.value) + ',sans-serif"' +
          (font.value === current ? ' selected' : '') + '>' +
          util.escapeHtml(font.label) + '</option>';
      });

      html += '</optgroup>';
    });

    return html + '</select>';
  }

  function segButtons(items, activeValue) {
    var html = '<div class="seg">';
    items.forEach(function (item) {
      html += '<button type="button" data-set="' + item.prop + '" data-value="' + item.value + '"' +
        (item.value === activeValue ? ' class="is-active"' : '') + '>' + item.label + '</button>';
    });
    return html + '</div>';
  }

  function formatOutput(prop, value) {
    var n = parseFloat(value);
    if (isNaN(n)) return String(value);
    if (prop === 'opacity' || prop === 'lineHeight') return n.toFixed(2);
    if (prop === 'cropx' || prop === 'cropy') return (n > 0 ? '+' : '') + Math.round(n) + '%';
    return String(Math.round(n));
  }

  /* ------------------------------------------------------- 패널 구성 */

  function shapePanel(obj) {
    var html = '<div class="prop-group"><div class="prop-title">도형</div>';

    var supported = (obj.kind === 'rect' || obj.kind === 'roundrect' || obj.kind === 'bg' ||
      obj.kind === 'circle' || obj.kind === 'triangle');

    if (supported) {
      html += row('그라데이션', gradientSeg(obj));
      html += row('채우기', colorInput('fill', util.isTransparent(obj.fill) ? '#ffffff' : obj.fill));
    } else {
      html += row('채우기', colorInput('fill', util.isTransparent(obj.fill) ? '#ffffff' : obj.fill));
    }

    html += row('선 색', colorInput('stroke', obj.stroke || '#2563eb'));
    html += row('선 두께', numberInput('strokeWidth', obj.strokeWidth || 0, { min: 0, max: 200, step: 0.5 }));

    if (obj.kind === 'rect' || obj.kind === 'roundrect' || obj.kind === 'bg') {
      html += row('모서리', numberInput('rx', obj.rx || 0, { min: 0, max: 600 }));
    }

    html += shadowRow(obj);
    html += '</div>';
    return html;
  }

  function textPanel(obj) {
    return '<div class="prop-group">' +
      '<div class="prop-title">텍스트</div>' +
      row('내용', '<textarea data-prop="text">' + util.escapeHtml(obj.text || '') + '</textarea>', 'stack') +
      row('글꼴', fontSelect(obj.fontFamily)) +
      row('크기', numberInput('fontSize', obj.fontSize, { min: 1, max: 1200 })) +
      row('색상', colorInput('fill', obj.fill)) +
      row('스타일', '<div class="seg">' +
        '<button type="button" data-toggle="fontWeight" class="' + (obj.fontWeight === 'bold' ? 'is-active' : '') + '"><b>B</b></button>' +
        '<button type="button" data-toggle="fontStyle" class="' + (obj.fontStyle === 'italic' ? 'is-active' : '') + '"><i>I</i></button>' +
        '<button type="button" data-toggle="underline" class="' + (obj.underline ? 'is-active' : '') + '"><u>U</u></button>' +
      '</div>') +
      row('정렬', segButtons([
        { prop: 'textAlign', value: 'left', label: '좌' },
        { prop: 'textAlign', value: 'center', label: '중' },
        { prop: 'textAlign', value: 'right', label: '우' },
        { prop: 'textAlign', value: 'justify', label: '양' }
      ], obj.textAlign || 'left')) +
      row('자간', rangeInput('charSpacing', round2(obj.charSpacing || 0), -100, 800, 10)) +
      row('행간', rangeInput('lineHeight', round2(obj.lineHeight || 1.35), 0.8, 3, 0.05)) +
      '</div>' +
      '<div class="prop-group">' +
      '<div class="prop-title">외곽선 · 그림자</div>' +
      row('외곽선 색', colorInput('stroke', util.isTransparent(obj.stroke) ? '#ffffff' : obj.stroke)) +
      row('외곽선 두께', numberInput('strokeWidth', obj.strokeWidth || 0, { min: 0, max: 60, step: 0.5 })) +
      shadowRow(obj) +
      '</div>';
  }

  function gradientSeg(obj) {
    return '<div class="seg wrap">' +
      IE.canvas.gradientPresets.map(function (preset) {
        var active = (obj.gradientPreset || 'none') === preset.id;
        var preview = gradientPreviewStyle(preset);
        return '<button type="button" data-gradient="' + preset.id + '"' +
          (active ? ' class="is-active"' : '') +
          ' title="' + preset.label + '" style="' + preview + '"></button>';
      }).join('') +
    '</div>';
  }

  function gradientPreviewStyle(preset) {
    if (preset.id === 'none') {
      return 'background:repeating-linear-gradient(45deg,#e2e8f0 0 4px,#fff 4px 8px)';
    }
    var stops = preset.stops.map(function (stop) {
      return stop.color + ' ' + Math.round(stop.offset * 100) + '%';
    }).join(',');
    return 'background:linear-gradient(90deg,' + stops + ')';
  }

  function shadowRow(obj) {
    return row('그림자', '<div class="seg wrap">' +
      SHADOW_PRESETS.map(function (preset) {
        var active = (obj.shadowPreset || 'none') === preset.id;
        return '<button type="button" data-shadow="' + preset.id + '"' +
          (active ? ' class="is-active"' : '') + '>' + preset.label + '</button>';
      }).join('') +
    '</div>');
  }

  function clipSeg(obj) {
    return segButtons(CLIP_SHAPES.map(function (item) {
      return { prop: 'clipShape', value: item.value, label: item.label };
    }), obj.clipShape || 'none');
  }

  function cropRow(label, axis, offset) {
    var percent = Math.round((offset || 0) * 100);
    return row(label,
      '<div class="range-row">' +
        '<input type="range" data-crop="' + axis + '" min="-100" max="100" step="1" value="' + percent + '">' +
        '<output data-out="crop' + axis + '">' + formatOutput('crop' + axis, percent) + '</output>' +
      '</div>');
  }

  function imagePanel(obj) {
    var html = '<div class="prop-group">' +
      '<div class="prop-title">이미지</div>' +
      '<button type="button" class="prop-action" data-action="replace-image">다른 이미지로 교체</button>' +
      '<button type="button" class="prop-action prop-action-solid" data-action="imgedit">이미지 편집 · 누끼 · 인물 보정</button>' +
      row('모양 자르기', clipSeg(obj)) +
    '</div>';

    if (obj.cropInfo) {
      html += '<div class="prop-group">' +
        '<div class="prop-title">사진 구도 조절</div>' +
        '<button type="button" class="prop-action" data-action="crop-mode">캔버스에서 직접 조절</button>' +
        cropRow('좌우', 'x', obj.cropOffsetX) +
        cropRow('상하', 'y', obj.cropOffsetY) +
        '<button type="button" class="prop-action" data-action="crop-reset">구도 초기화</button>' +
        '<div class="fo-hint">사진만 움직이고 사진 틀은 고정됩니다. 캔버스에서 사진을 더블클릭해도 조절할 수 있습니다.</div>' +
      '</div>';
    } else {
      html += '<div class="prop-group">' +
        '<div class="prop-title">사진 자르기</div>' +
        '<button type="button" class="prop-action" data-action="crop-mode">캔버스에서 구도 조절</button>' +
        '<div class="fo-hint">사진을 끌어 위치를 맞추고, 휠로 확대하거나 축소할 수 있습니다.</div>' +
      '</div>';
    }

    return html;
  }

  function bgPanel(obj) {
    var swatches = BG_PRESETS.map(function (preset) {
      return '<button type="button" class="swatch" data-fill="' + preset.value + '" ' +
        'title="' + preset.label + '" style="background:' + preset.value + '"></button>';
    }).join('');

    return '<div class="prop-group">' +
      '<div class="prop-title">배경</div>' +
      row('색상', colorInput('fill', obj.fill)) +
      '<div class="field stack"><label>빠른 선택</label><div class="swatch-row">' + swatches + '</div></div>' +
      '<div class="fo-hint">배경을 지운(누끼) 투명 PNG 사진을 올리면 이 배경색이 그대로 보입니다.</div>' +
    '</div>';
  }

  var ALIGN_ITEMS = [
    { mode: 'left', label: '좌' },
    { mode: 'center-h', label: '가로 중앙' },
    { mode: 'right', label: '우' },
    { mode: 'top', label: '상' },
    { mode: 'center-v', label: '세로 중앙' },
    { mode: 'bottom', label: '하' }
  ];

  function alignPanel(multi) {
    var buttons = ALIGN_ITEMS.map(function (item) {
      return '<button type="button" data-align="' + item.mode + '">' + item.label + '</button>';
    }).join('');

    var spread = '<div class="action-grid two">' +
      '<button type="button" data-align="dist-h"' + (multi ? '' : ' disabled') + '>가로 균등</button>' +
      '<button type="button" data-align="dist-v"' + (multi ? '' : ' disabled') + '>세로 균등</button>' +
      '</div>';

    return '<div class="prop-group">' +
      '<div class="prop-title">정렬' + (multi ? ' (선택 영역 기준)' : ' (문서 기준)') + '</div>' +
      '<div class="action-grid">' + buttons + '</div>' +
      spread +
    '</div>';
  }

  var CELL_COLUMNS = 'ABCDEFGHIJKLMNOPQRST';

  function cellName(r, c) {
    return (CELL_COLUMNS.charAt(c) || (c + 1)) + (r + 1);
  }

  function cellRangeLabel(rect) {
    var a = cellName(rect.r1, rect.c1);
    var b = cellName(rect.r2, rect.c2);
    return a === b ? a : a + ':' + b;
  }

  /**
   * 표의 병합 상태를 그대로 보여 주는 작은 격자.
   * 칸을 누르거나 끌어서 고른다 — 합쳐진 칸은 한 덩어리로 나온다.
   */
  function cellPickHtml(data, rect) {
    var biggest = Math.max(data.cols, data.rows, 1);
    var side = Math.max(9, Math.min(20, Math.floor(200 / biggest)));
    var cells = '';

    for (var r = 0; r < data.rows; r++) {
      for (var c = 0; c < data.cols; c++) {
        var v = data.cells[r][c];
        if (v.hidden) continue;

        var rs = Math.min(v.rowSpan, data.rows - r);
        var cs = Math.min(v.colSpan, data.cols - c);
        var on = r <= rect.r2 && r + rs - 1 >= rect.r1 && c <= rect.c2 && c + cs - 1 >= rect.c1;

        var style = 'grid-area:' + (r + 1) + '/' + (c + 1) + '/span ' + rs + '/span ' + cs;
        if (v.fill) style += ';background:' + v.fill;

        cells += '<span class="cp-cell' + (on ? ' is-on' : '') +
          (rs > 1 || cs > 1 ? ' is-merged' : '') + '"' +
          ' data-cell-rc="' + r + ':' + c + '"' +
          ' data-cell-rs="' + rs + '" data-cell-cs="' + cs + '"' +
          ' style="' + style + '" title="' + cellName(r, c) + '"></span>';
      }
    }

    return '<div class="cell-pick" id="cell-pick"' +
      ' style="grid-template-columns:repeat(' + data.cols + ',1fr);grid-auto-rows:' + side + 'px">' +
      cells + '</div>';
  }

  var V_ALIGN_ITEMS = [
    { prop: 'tableCellValign', value: 'top', label: '위' },
    { prop: 'tableCellValign', value: 'middle', label: '중간' },
    { prop: 'tableCellValign', value: 'bottom', label: '아래' }
  ];

  function tablePanel(obj) {
    var data = obj.tableData;
    var st = IE.table.state(obj, obj.cellSel);
    var rect = st.rect;
    var head = data.cells[rect.r1][rect.c1];
    var rowH = Math.round(data.rowHeights[rect.r1] || 0);
    var colW = Math.round(data.colWidths[rect.c1] || 0);
    var count = st.cells;

    return '<div class="prop-group">' +
      '<div class="prop-title">표</div>' +
      row('크기', '<div class="pair">' +
        '<span class="pair-tag">행</span>' + numberInput('tableRows', data.rows, { min: 1, max: 40 }) +
        '<span class="pair-tag">열</span>' + numberInput('tableCols', data.cols, { min: 1, max: 20 }) +
      '</div>') +
      '<div class="layer-actions" style="grid-template-columns:repeat(4,1fr);margin-bottom:8px">' +
        '<button type="button" class="btn-mini" data-table="add-row">행+</button>' +
        '<button type="button" class="btn-mini" data-table="remove-row">행−</button>' +
        '<button type="button" class="btn-mini" data-table="add-col">열+</button>' +
        '<button type="button" class="btn-mini" data-table="remove-col">열−</button>' +
      '</div>' +
      '<button type="button" class="prop-action" data-action="edit-table">표 내용 편집</button>' +
      '</div>' +

      '<div class="prop-group">' +
      '<div class="prop-title">셀 <span class="fo-count">' + cellRangeLabel(rect) +
        (count > 1 ? ' · ' + count + '칸' : '') + '</span></div>' +
      cellPickHtml(data, rect) +
      '<div class="fo-hint">칸을 누르거나 끌어서 고른 뒤 합칩니다.</div>' +
      '<div class="layer-actions" style="grid-template-columns:repeat(3,1fr);margin-bottom:8px">' +
        '<button type="button" class="btn-mini" data-table="merge"' +
          (count > 1 ? '' : ' disabled title="두 칸 이상 골라야 합니다"') + '>병합</button>' +
        '<button type="button" class="btn-mini" data-table="split"' +
          (st.merged ? '' : ' disabled title="합쳐진 칸에서만 됩니다"') + '>나누기</button>' +
        '<button type="button" class="btn-mini" data-table="split-all"' +
          (st.anyMerge ? '' : ' disabled title="합쳐진 칸이 없습니다"') + '>모두 나누기</button>' +
      '</div>' +
      row('행 높이', numberInput('tableRowH', rowH, { min: 20, max: 2000 })) +
      row('열 너비', numberInput('tableColW', colW, { min: 20, max: 4000 })) +
      '<div class="layer-actions" style="grid-template-columns:repeat(2,1fr);margin-bottom:8px">' +
        '<button type="button" class="btn-mini" data-table="even-row">높이 같게</button>' +
        '<button type="button" class="btn-mini" data-table="even-col">너비 같게</button>' +
      '</div>' +
      '</div>' +

      '<div class="prop-group">' +
      '<div class="prop-title">고른 칸 서식' + (count > 1 ? ' (' + count + '칸)' : '') + '</div>' +
      row('채우기', colorInput('tableCellFill', head.fill || data.bodyFill)) +
      row('글자 색', colorInput('tableCellColor', head.color || data.color)) +
      row('가로 정렬', segButtons([
        { prop: 'tableCellAlign', value: 'left', label: '좌' },
        { prop: 'tableCellAlign', value: 'center', label: '중' },
        { prop: 'tableCellAlign', value: 'right', label: '우' }
      ], head.align || data.align)) +
      row('세로 정렬', segButtons(V_ALIGN_ITEMS, head.valign || data.valign)) +
      '<div class="layer-actions" style="grid-template-columns:repeat(2,1fr);margin-bottom:8px">' +
        '<button type="button" class="btn-mini" data-table="cell-bold">굵게</button>' +
        '<button type="button" class="btn-mini" data-table="cell-clear">서식 지우기</button>' +
      '</div>' +
      '</div>' +

      '<div class="prop-group">' +
      '<div class="prop-title">표 모양</div>' +
      row('글자 크기', numberInput('tableFontSize', Math.round(data.fontSize), { min: 6, max: 200 })) +
      row('글자 색', colorInput('tableColor', data.color)) +
      row('가로 정렬', segButtons([
        { prop: 'tableAlign', value: 'left', label: '좌' },
        { prop: 'tableAlign', value: 'center', label: '중' },
        { prop: 'tableAlign', value: 'right', label: '우' }
      ], data.align)) +
      row('세로 정렬', segButtons([
        { prop: 'tableValign', value: 'top', label: '위' },
        { prop: 'tableValign', value: 'middle', label: '중간' },
        { prop: 'tableValign', value: 'bottom', label: '아래' }
      ], data.valign || 'middle')) +
      row('테두리 색', colorInput('tableBorderColor', data.borderColor)) +
      row('테두리 두께', numberInput('tableBorderWidth', data.borderWidth, { min: 0, max: 20 })) +
      row('안 여백', numberInput('tablePadding', data.padding, { min: 0, max: 200 })) +
      row('본문 배경', colorInput('tableBodyFill', data.bodyFill)) +
      row('머리글 배경', colorInput('tableHeaderFill', data.headerFill)) +
      row('머리글', '<div class="seg">' +
        '<button type="button" data-table="toggle-header-row" class="' + (data.headerRow ? 'is-active' : '') + '">첫 행</button>' +
        '<button type="button" data-table="toggle-header-col" class="' + (data.headerCol ? 'is-active' : '') + '">첫 열</button>' +
      '</div>') +
      '</div>';
  }

  /** 아이콘 색 조합 — 눌러서 여러 색을 한 번에 바꾼다 */
  var ICON_COMBOS = [
    { style: 'badge', main: '#2563eb' },
    { style: 'badge', main: '#003478' },
    { style: 'badge', main: '#059669' },
    { style: 'badge', main: '#dc2626' },
    { style: 'badge', main: '#d97706' },
    { style: 'badge', main: '#7c3aed' },
    { style: 'soft', main: '#2563eb' },
    { style: 'soft', main: '#059669' },
    { style: 'soft', main: '#d97706' },
    { style: 'circle', main: '#0f172a' },
    { style: 'circle', main: '#dc2626' },
    { style: 'circle', main: '#1d4ed8' },
    { style: 'frame', main: '#2563eb' },
    { style: 'frame', main: '#003478' },
    { style: 'doubleRing', main: '#059669' },
    { style: 'doubleRing', main: '#dc2626' },
    { style: 'emblem', main: '#2563eb' },
    { style: 'emblem', main: '#7c3aed' },
    { style: 'parts', main: '#2563eb', icon: 'ribbon' },
    { style: 'parts', main: '#dc2626', icon: 'ribbon' }
  ];

  function iconPanel(obj) {
    var shapes = IE.shapes;
    var style = shapes.iconStyleOf(obj);
    var colors = shapes.iconColorsOf(obj);
    var names = shapes.iconSlotNames(style, obj.iconName);

    var styleButtons = shapes.iconStyles.map(function (item) {
      return '<button type="button"' + (item.id === style ? ' class="is-active"' : '') +
        ' data-icon-style="' + item.id + '" title="' + item.name + '">' + item.name + '</button>';
    }).join('');

    var slots = names.map(function (name, index) {
      return row(name, colorInput('iconColor' + index, colors[index] || '#2563eb'));
    }).join('');

    var combos = ICON_COMBOS.map(function (combo) {
      var pair = IE.shapes.iconColorsFor(combo.main, combo.style, combo.icon);
      var dots = pair.map(function (color) {
        return '<span style="background:' + color + '"></span>';
      }).join('');
      return '<button type="button" class="icon-combo" data-icon-combo="' + combo.style + ':' +
        combo.main + '" title="' + combo.style + ' ' + combo.main + '">' + dots + '</button>';
    }).join('');

    var html = '<div class="prop-group">' +
      '<div class="prop-title">아이콘</div>' +
      '<div class="field stack"><label>스타일</label><div class="seg wrap">' +
        styleButtons + '</div></div>' +
      slots +
      '<div class="field stack"><label>색 조합</label><div class="icon-combos">' + combos + '</div></div>' +
      row('크기', numberInput('size', IE.shapes.iconSizeOf(obj), { min: 12, max: 2000 })) +
      '<button type="button" class="prop-action" data-action="swap-icon">다른 아이콘으로 바꾸기</button>' +
      shadowRow(obj) +
    '</div>';

    return html;
  }

  /** 아이콘 색 슬롯 하나를 바꾼다 */
  function setIconColor(obj, index, color) {
    if (!obj || obj.kind !== 'icon') return;
    var list = IE.shapes.iconColorsOf(obj).slice();
    list[index] = color;
    IE.shapes.recolorIcon(obj, list);
  }

  /** 스타일을 바꾼다 — 같은 자리에서 같은 크기로 다시 만든다 */
  function changeIconStyle(style, mainColor) {
    var sel = selection();
    if (!sel) return;

    var canvas = IE.state.canvas;
    var last = null;

    sel.objects.forEach(function (obj) {
      if (obj.kind !== 'icon') return;

      var colors = mainColor ? mainColor : IE.shapes.iconColorsOf(obj);
      var replacement = IE.shapes.makeIcon(
        obj.iconName || 'star',
        IE.shapes.iconSizeOf(obj),
        colors,
        style
      );

      replacement.set({
        left: obj.left,
        top: obj.top,
        angle: obj.angle,
        opacity: obj.opacity,
        shadow: obj.shadow
      });
      replacement.setCoords();

      var index = canvas.getObjects().indexOf(obj);
      canvas.remove(obj);
      if (index >= 0) canvas.insertAt(replacement, Math.min(index, canvas.size()));
      else canvas.add(replacement);
      last = replacement;
    });

    if (!last) return;

    canvas.setActiveObject(last);
    canvas.requestRenderAll();
    IE.state.history.snapshot();
    IE.layers.refresh();
    refresh(true);
    if (IE.app) IE.app.updateStatus();
  }

  /** 도형 색 조합 — 눌러서 여러 색을 한 번에 바꾼다 */
  var FIGURE_COMBOS = [
    '#2563eb', '#003478', '#0f172a', '#059669',
    '#dc2626', '#d97706', '#7c3aed', '#0891b2'
  ];

  function figurePanel(obj) {
    var shapes = IE.shapes;
    var key = obj.figureName || 'square';
    var style = shapes.figureStyleOf(obj);
    var colors = shapes.figureColorsOf(obj);
    var names = shapes.figureSlotNames(key);
    var layered = names.length > 1;

    var styleButtons = shapes.figureStyles.map(function (item) {
      return '<button type="button"' + (item.id === style ? ' class="is-active"' : '') +
        ' data-figure-style="' + item.id + '" title="' + item.name + '">' + item.name + '</button>';
    }).join('');

    var slots = names.map(function (name, index) {
      return row(name, colorInput('figureColor' + index, colors[index] || '#2563eb'));
    }).join('');

    var isIllust = shapes.figureIsIllustration(key);

    var combos = isIllust ? '' : FIGURE_COMBOS.map(function (main) {
      var pair = shapes.figureColorsFor(main, key);
      return '<button type="button" class="icon-combo" data-figure-combo="' + main +
        '" title="' + main + '">' +
        '<span style="background:' + pair[0] + '"></span>' +
        '<span style="background:' + (pair[1] || pair[0]) + '"></span>' +
      '</button>';
    }).join('');

    var html = '<div class="prop-group">' +
      '<div class="prop-title">' + (isIllust ? '일러스트' : '도형') + '</div>';

    if (!layered) {
      html += '<div class="field stack"><label>스타일</label><div class="seg wrap">' +
        styleButtons + '</div></div>';
    }

    html += slots;

    if (isIllust) {
      html += '<div class="fo-hint">색이 미리 정해져 있는 그림입니다. ' +
        '위에서 <b>부품마다 색을 따로</b> 바꿀 수 있습니다.</div>';
    } else {
      html += '<div class="field stack"><label>색 조합</label><div class="icon-combos">' +
        combos + '</div></div>';
    }

    html += row('크기', numberInput('figureSize', IE.shapes.figureSizeOf(obj), { min: 12, max: 4000 }));
    html += shadowRow(obj);
    html += '</div>';

    return html;
  }

  /** 도형 색 슬롯 하나를 바꾼다 */
  function setFigureColor(obj, index, color) {
    if (!obj || obj.kind !== 'figure') return;
    var list = IE.shapes.figureColorsOf(obj).slice();
    list[index] = color;
    IE.shapes.recolorFigure(obj, list);
  }

  /** 도형 스타일·색 조합을 바꾼다 — 같은 자리에서 같은 크기로 다시 만든다 */
  function changeFigureStyle(style, mainColor) {
    var sel = selection();
    if (!sel) return;

    var canvas = IE.state.canvas;
    var last = null;

    sel.objects.forEach(function (obj) {
      if (obj.kind !== 'figure') return;

      var key = obj.figureName || 'square';
      var activeStyle = style || IE.shapes.figureStyleOf(obj);
      var colors = mainColor
        ? IE.shapes.figureColorsFor(mainColor, key)
        : IE.shapes.figureColorsOf(obj);

      var replacement = IE.shapes.makeFigure(
        key, IE.shapes.figureSizeOf(obj), colors, activeStyle
      );

      replacement.set({
        left: obj.left,
        top: obj.top,
        angle: obj.angle,
        opacity: obj.opacity,
        shadow: obj.shadow
      });
      replacement.setCoords();

      var index = canvas.getObjects().indexOf(obj);
      canvas.remove(obj);
      if (index >= 0) canvas.insertAt(replacement, Math.min(index, canvas.size()));
      else canvas.add(replacement);
      last = replacement;
    });

    if (!last) return;

    canvas.setActiveObject(last);
    canvas.requestRenderAll();
    IE.state.history.snapshot();
    IE.layers.refresh();
    refresh(true);
    if (IE.app) IE.app.updateStatus();
  }

  function slotPanel() {
    return '<div class="prop-group">' +
      '<div class="prop-title">이미지 영역</div>' +
      '<button type="button" class="prop-action" data-action="fill-slot">이미지 넣기</button>' +
    '</div>';
  }

  function guidePanel() {
    return '<div class="prop-group">' +
      '<div class="prop-title">가이드</div>' +
      '<div class="fo-hint">가이드는 편집을 돕기 위한 선이며, 내보내기 결과에는 포함되지 않습니다.</div>' +
    '</div>';
  }

  function transformPanel(obj) {
    var width = Math.abs((obj.width || 0) * (obj.scaleX == null ? 1 : obj.scaleX));
    var height = Math.abs((obj.height || 0) * (obj.scaleY == null ? 1 : obj.scaleY));

    var html = '<div class="prop-group"><div class="prop-title">위치 · 크기</div>';

    html += pair('위치',
      'X', numberInput('left', obj.left || 0),
      'Y', numberInput('top', obj.top || 0));

    html += pair('크기',
      'W', numberInput('width', width, { min: 1 }),
      'H',
      obj.kind === 'text'
        ? '<input type="text" value="자동" disabled>'
        : numberInput('height', height, { min: 1 }));

    html += row('회전', numberInput('angle', obj.angle || 0, { min: -360, max: 360 }));
    html += row('투명도', rangeInput('opacity', round2(obj.opacity == null ? 1 : obj.opacity), 0, 1, 0.05));
    html += '</div>';

    return html;
  }

  function actionsPanel(multi, obj) {
    var html = '<div class="prop-group"><div class="prop-title">동작</div><div class="layer-actions">';

    html += '<button type="button" class="btn-mini" data-action="dup">복제</button>';
    html += '<button type="button" class="btn-mini" data-action="del">삭제</button>';

    if (!multi) {
      html += '<button type="button" class="btn-mini" data-action="front">맨앞</button>';
      html += '<button type="button" class="btn-mini" data-action="back">맨뒤</button>';
      html += '<button type="button" class="btn-mini" data-action="center-h">가로 중앙</button>';
      html += '<button type="button" class="btn-mini" data-action="center-v">세로 중앙</button>';
    }

    html += '</div></div>';
    return html;
  }

  function singleHtml(obj) {
    var html = '<div class="prop-head">' +
      '<span class="prop-kind">' + IE.canvas.iconOf(obj) + '</span>' +
      '<span class="prop-name">' + util.escapeHtml(IE.canvas.labelOf(obj)) + '</span>' +
    '</div>';

    if (obj.kind === 'text') html += textPanel(obj);
    if (obj.kind === 'image') html += imagePanel(obj);
    if (obj.kind === 'icon') html += iconPanel(obj);
    if (obj.kind === 'figure') html += figurePanel(obj);
    if (obj.kind === 'table') html += tablePanel(obj);
    if (obj.isSlot) html += slotPanel(obj);
    if (obj.kind === 'bg') html += bgPanel(obj);
    if (isShape(obj) && !obj.isGuide && obj.kind !== 'icon' && obj.kind !== 'table') html += shapePanel(obj);
    if (obj.isGuide) html += guidePanel(obj);

    html += transformPanel(obj);
    html += alignPanel(false);
    html += actionsPanel(false, obj);
    return html;
  }

  function multiHtml(selection) {
    var objects = selection.objects;
    var allText = objects.every(function (o) { return o.kind === 'text'; });
    var allShape = objects.every(function (o) { return isShape(o) && !o.isGuide; });

    var html = '<div class="prop-head">' +
      '<span class="prop-kind">▣</span>' +
      '<span class="prop-name">' + objects.length + '개 객체 선택됨</span>' +
    '</div>';

    if (allText) html += textPanel(objects[0]);
    else if (allShape) html += shapePanel(objects[0]);

    html += '<div class="prop-group"><div class="prop-title">공통</div>' +
      row('투명도', rangeInput('opacity', round2(selection.ref.opacity == null ? 1 : selection.ref.opacity), 0, 1, 0.05)) +
      '</div>';

    html += alignPanel(true);
    html += actionsPanel(true, null);
    return html;
  }

  /* --------------------------------------------------------- 값 반영 */

  function selection() {
    var canvas = IE.state.canvas;
    if (!canvas) return null;

    var active = canvas.getActiveObject();
    if (!active) return null;

    if (active.type === 'activeSelection') {
      return { multi: true, objects: active.getObjects(), ref: active };
    }
    return { multi: false, objects: [active], ref: active };
  }

  function setWidth(obj, value) {
    value = Math.max(1, value);

    // 아이콘은 가로·세로가 묶여 있다 — 어느 쪽을 만져도 같은 크기로 커진다
    if (obj.kind === 'icon') {
      IE.shapes.setIconSize(obj, value);
      return;
    }

    if (obj.kind === 'figure') {
      IE.shapes.setFigureSize(obj, value);
      return;
    }

    if (obj.kind === 'text') {
      obj.set({ width: value, scaleX: 1 });
      return;
    }
    if (obj.kind === 'image') {
      var uniform = value / (obj.width || 1);
      obj.set({ scaleX: uniform, scaleY: uniform });
      return;
    }
    if (obj.kind === 'rect' || obj.kind === 'line' || obj.kind === 'triangle') {
      obj.set({ width: value, scaleX: 1 });
      return;
    }
    obj.set('scaleX', value / (obj.width || 1));
  }

  function setHeight(obj, value) {
    value = Math.max(1, value);

    if (obj.kind === 'icon') {
      IE.shapes.setIconSize(obj, value);
      return;
    }

    if (obj.kind === 'figure') {
      IE.shapes.setFigureSize(obj, value);
      return;
    }

    if (obj.kind === 'image') {
      var uniform = value / (obj.height || 1);
      obj.set({ scaleX: uniform, scaleY: uniform });
      return;
    }
    if (obj.kind === 'rect' || obj.kind === 'line' || obj.kind === 'triangle') {
      obj.set({ height: value, scaleY: 1 });
      return;
    }
    obj.set('scaleY', value / (obj.height || 1));
  }

  function setProp(obj, prop, value) {
    switch (prop) {
      case 'text': obj.set('text', String(value)); break;
      case 'fontSize': obj.set('fontSize', util.clamp(value, 1, 2000)); break;
      case 'strokeWidth': obj.set('strokeWidth', Math.max(0, value)); break;
      case 'rx': obj.set({ rx: Math.max(0, value), ry: Math.max(0, value) }); break;
      case 'lineHeight': obj.set('lineHeight', util.clamp(value, 0.5, 5)); break;
      case 'opacity': obj.set('opacity', util.clamp(value, 0, 1)); break;
      case 'left': obj.set('left', value); obj.setCoords(); break;
      case 'top': obj.set('top', value); obj.setCoords(); break;
      case 'angle': obj.set('angle', value); obj.setCoords(); break;
      case 'width': setWidth(obj, value); obj.setCoords(); break;
      case 'height': setHeight(obj, value); obj.setCoords(); break;
      case 'size':
        if (obj.kind === 'icon') {
          IE.shapes.setIconSize(obj, util.clamp(value, 12, 2000));
        }
        break;
      case 'figureSize':
        if (obj.kind === 'figure') {
          IE.shapes.setFigureSize(obj, util.clamp(value, 12, 4000));
        }
        break;
      default: obj.set(prop, value);
    }
  }

  function readControlValue(el) {
    if (el.type === 'number' || el.type === 'range') {
      var parsed = parseFloat(el.value);
      return isNaN(parsed) ? null : parsed;
    }
    if (el.type === 'checkbox') return el.checked;
    return el.value;
  }

  var TABLE_PROPS = {
    tableFontSize: 'fontSize',
    tableColor: 'color',
    tableAlign: 'align',
    tableValign: 'valign',
    tableBorderColor: 'borderColor',
    tableBorderWidth: 'borderWidth',
    tableBodyFill: 'bodyFill',
    tableHeaderFill: 'headerFill',
    tablePadding: 'padding'
  };

  /* 고른 칸에만 얹는 서식 */
  var TABLE_CELL_PROPS = {
    tableCellFill: 'fill',
    tableCellColor: 'color',
    tableCellAlign: 'align',
    tableCellValign: 'valign'
  };

  /** 표는 그룹을 다시 그려야 하므로 전용 경로로 처리한다 */
  function applyTable(group, prop, value) {
    if (!IE.table.isTable(group)) return;

    if (prop === 'tableRows') {
      var target = util.clamp(Math.round(value), 1, 40);
      while (group.tableData.rows < target) {
        group = IE.table.addRow(group);
      }
      while (group.tableData.rows > target) {
        group = IE.table.removeRow(group);
      }
      return;
    }

    if (prop === 'tableCols') {
      var targetCols = util.clamp(Math.round(value), 1, 20);
      while (group.tableData.cols < targetCols) {
        group = IE.table.addCol(group);
      }
      while (group.tableData.cols > targetCols) {
        group = IE.table.removeCol(group);
      }
      return;
    }

    /* 고른 칸 서식 */
    if (TABLE_CELL_PROPS[prop]) {
      var cellPatch = {};
      cellPatch[TABLE_CELL_PROPS[prop]] = value;
      IE.table.formatCells(group, group.cellSel, cellPatch);
      return;
    }

    if (prop === 'tableRowH') {
      IE.table.sizeCells(group, group.cellSel, 'row', value);
      return;
    }

    if (prop === 'tableColW') {
      IE.table.sizeCells(group, group.cellSel, 'col', value);
      return;
    }

    var key = TABLE_PROPS[prop];
    if (!key) return;

    var patch = {};
    patch[key] = value;
    IE.table.update(group, patch);
  }

  function apply(prop, source) {
    var value = (source && source.tagName) ? readControlValue(source) : source;
    if (value === null || value === undefined) return;

    var sel = selection();
    if (!sel) return;

    // 표 전용 속성
    if (prop.indexOf('table') === 0) {
      var tableTarget = sel.objects.filter(IE.table.isTable)[0];
      if (tableTarget) applyTable(tableTarget, prop, value);
      // 표를 다시 그리면 패널도 다시 그려야 하지만, 숫자를 치는 중이면
      // 포커스를 뺏지 않도록 refresh 가 알아서 건너뛴다
      refresh(false);
      return;
    }

    // 아이콘 색 슬롯 (그림·배경) — 자식 경로를 직접 다시 칠한다
    if (prop.indexOf('iconColor') === 0) {
      var slotIndex = parseInt(prop.slice(9), 10) || 0;
      sel.objects.forEach(function (obj) { setIconColor(obj, slotIndex, value); });
      IE.state.canvas.requestRenderAll();
      IE.state.history.snapshotSoon(500);
      return;
    }

    // 도형 색 슬롯 — 겹 도형은 자식 경로를 직접 다시 칠한다
    if (prop.indexOf('figureColor') === 0) {
      var figureSlot = parseInt(prop.slice(11), 10) || 0;
      sel.objects.forEach(function (obj) { setFigureColor(obj, figureSlot, value); });
      IE.state.canvas.requestRenderAll();
      IE.state.history.snapshotSoon(500);
      return;
    }

    // 모양 자르기는 clipPath 를 다시 만들어야 하므로 전용 경로로 처리한다
    if (prop === 'clipShape') {
      sel.objects.forEach(function (obj) {
        if (obj.kind === 'image') IE.canvas.setClipShape(obj, value);
      });
      refresh(true);
      return;
    }

    var isTransform = (prop === 'left' || prop === 'top' || prop === 'angle' ||
      prop === 'width' || prop === 'height');
    if (sel.multi && isTransform) return;

    sel.objects.forEach(function (obj) { setProp(obj, prop, value); });

    var canvas = IE.state.canvas;
    if (sel.ref.setCoords) sel.ref.setCoords();
    canvas.requestRenderAll();

    IE.state.history.snapshotSoon(500);
    if (IE.app) IE.app.updateStatus();
  }

  function toggle(prop) {
    var sel = selection();
    if (!sel) return;

    sel.objects.forEach(function (obj) {
      if (prop === 'fontWeight') {
        obj.set('fontWeight', obj.fontWeight === 'bold' ? 'normal' : 'bold');
      } else if (prop === 'fontStyle') {
        obj.set('fontStyle', obj.fontStyle === 'italic' ? 'normal' : 'italic');
      } else if (prop === 'underline') {
        obj.set('underline', !obj.underline);
      }
    });

    IE.state.canvas.requestRenderAll();
    IE.state.history.snapshot();
    refresh(true);
  }

  function center(axis) {
    var sel = selection();
    if (!sel || sel.multi) return;

    var obj = sel.objects[0];
    var width = Math.abs((obj.width || 0) * (obj.scaleX == null ? 1 : obj.scaleX));
    var height = Math.abs((obj.height || 0) * (obj.scaleY == null ? 1 : obj.scaleY));

    if (axis === 'h') obj.set('left', (IE.state.docW - width) / 2);
    else obj.set('top', (IE.state.docH - height) / 2);

    obj.setCoords();
    IE.state.canvas.requestRenderAll();
    IE.state.history.snapshot();
    refresh(true);
  }

  function runAction(action) {
    var sel = selection();

    if (action === 'dup') IE.canvas.duplicateActive();
    else if (action === 'del') IE.canvas.deleteActive();
    else if (action === 'front') IE.canvas.reorder('front');
    else if (action === 'back') IE.canvas.reorder('back');
    else if (action === 'center-h') center('h');
    else if (action === 'center-v') center('v');
    else if (action === 'crop-reset' && sel) resetCrop(sel);
    else if (action === 'crop-mode' && sel) IE.crop.enter(sel.objects[0]);
    else if (action === 'edit-table' && sel && IE.table.isTable(sel.objects[0])) {
      IE.table.openEditor(sel.objects[0]);
    }
    else if (action === 'replace-image' && sel) IE.app.pickImageForReplace();
    else if (action === 'imgedit' && sel) IE.imgedit.open(sel.objects[0]);
    else if (action === 'cutout' && sel) IE.imgedit.open(sel.objects[0], 'cutout');
    else if (action === 'retouch' && sel) IE.imgedit.open(sel.objects[0], 'retouch');
    else if (action === 'fill-slot' && sel) IE.app.pickImageForSlot(sel.objects[0]);
    else if (action === 'swap-icon' && sel) IE.app.openIconPicker(function (name) {
      swapIcon(sel.objects[0], name);
    });
  }

  function swapIcon(obj, name) {
    if (!obj || obj.kind !== 'icon') return;

    // 스타일과 색 슬롯을 그대로 이어받는다 — 모양만 바꾸려던 것이 색까지 초기화되면 곤란하다
    var replacement = IE.shapes.makeIcon(
      name,
      IE.shapes.iconSizeOf(obj),
      IE.shapes.iconColorsOf(obj),
      IE.shapes.iconStyleOf(obj)
    );

    replacement.set({
      left: obj.left,
      top: obj.top,
      angle: obj.angle,
      opacity: obj.opacity,
      shadow: obj.shadow
    });
    replacement.setCoords();

    var canvas = IE.state.canvas;
    var index = canvas.getObjects().indexOf(obj);
    canvas.remove(obj);
    if (index >= 0) canvas.insertAt(replacement, Math.min(index, canvas.size()));
    else canvas.add(replacement);

    canvas.setActiveObject(replacement);
    canvas.requestRenderAll();
    IE.state.history.snapshot();
    IE.layers.refresh();
    refresh(true);
    if (IE.app) IE.app.updateStatus();
  }

  function resetCrop(sel) {
    sel.objects.forEach(function (obj) {
      if (obj.cropInfo) IE.canvas.setCropOffset(obj, 0, 0);
    });
    IE.state.history.snapshot();
    refresh(true);
  }

  /* --------------------------------------------------------- 이벤트 */

  function closestAction(el) {
    while (el && el !== document.body) {
      if (el.hasAttribute && (el.hasAttribute('data-set') || el.hasAttribute('data-toggle') ||
        el.hasAttribute('data-action') || el.hasAttribute('data-fill') ||
        el.hasAttribute('data-align') || el.hasAttribute('data-gradient') ||
        el.hasAttribute('data-shadow') || el.hasAttribute('data-table') ||
        el.hasAttribute('data-icon-style') || el.hasAttribute('data-icon-combo') ||
        el.hasAttribute('data-figure-style') || el.hasAttribute('data-figure-combo'))) {
        return el;
      }
      el = el.parentNode;
    }
    return null;
  }

  function syncOutput(prop, el) {
    var panel = util.$('props-body');
    if (!panel) return;
    var output = panel.querySelector('[data-out="' + prop + '"]');
    if (!output) return;
    output.textContent = formatOutput(prop, el.value);
  }

  function handleInput(ev) {
    var el = ev.target;
    if (!el || !el.getAttribute) return;

    // 사진 구도 슬라이더 (-100 ~ 100 -> -1 ~ 1)
    var cropAxis = el.getAttribute('data-crop');
    if (cropAxis) {
      var sel = selection();
      if (!sel) return;

      var offset = parseFloat(el.value) / 100;
      sel.objects.forEach(function (obj) {
        if (!obj.cropInfo) return;
        if (cropAxis === 'x') IE.canvas.setCropOffset(obj, offset, obj.cropOffsetY || 0);
        else IE.canvas.setCropOffset(obj, obj.cropOffsetX || 0, offset);
      });
      syncOutput('crop' + cropAxis, el);
      return;
    }

    var prop = el.getAttribute('data-prop');
    if (!prop) return;

    apply(prop, el);
    syncOutput(prop, el);
  }

  function handleClick(ev) {
    var el = closestAction(ev.target);
    if (!el) return;

    ev.preventDefault();

    var setPropName = el.getAttribute('data-set');
    if (setPropName) {
      apply(setPropName, el.getAttribute('data-value'));
      refresh(true);
      return;
    }

    var fill = el.getAttribute('data-fill');
    if (fill) {
      apply('fill', fill);
      refresh(true);
      return;
    }

    var alignMode = el.getAttribute('data-align');
    if (alignMode) {
      if (alignMode === 'dist-h') IE.canvas.distribute('h');
      else if (alignMode === 'dist-v') IE.canvas.distribute('v');
      else IE.canvas.align(alignMode);
      refresh(true);
      return;
    }

    var iconStyleId = el.getAttribute('data-icon-style');
    if (iconStyleId) {
      changeIconStyle(iconStyleId);
      return;
    }

    var iconCombo = el.getAttribute('data-icon-combo');
    if (iconCombo) {
      var parts = iconCombo.split(':');
      // 색은 대표값 하나만 넘긴다 — 아이콘마다 슬롯 수가 달라 나머지는 그 자리에서 만든다
      changeIconStyle(parts[0], parts[1]);
      return;
    }

    var figureStyleId = el.getAttribute('data-figure-style');
    if (figureStyleId) {
      changeFigureStyle(figureStyleId);
      return;
    }

    var figureCombo = el.getAttribute('data-figure-combo');
    if (figureCombo) {
      changeFigureStyle(null, figureCombo);
      return;
    }

    var gradientId = el.getAttribute('data-gradient');
    if (gradientId) {
      var gradSel = selection();
      if (gradSel) {
        gradSel.objects.forEach(function (obj) { IE.canvas.setGradient(obj, gradientId); });
      }
      refresh(true);
      return;
    }

    var tableAction = el.getAttribute('data-table');
    if (tableAction) {
      var tableSel = selection();
      var tableGroup = tableSel ? tableSel.objects.filter(IE.table.isTable)[0] : null;

      if (tableGroup) {
        var cellSel = tableGroup.cellSel;

        if (tableAction === 'add-row') IE.table.addRow(tableGroup);
        else if (tableAction === 'remove-row') IE.table.removeRow(tableGroup);
        else if (tableAction === 'add-col') IE.table.addCol(tableGroup);
        else if (tableAction === 'remove-col') IE.table.removeCol(tableGroup);
        else if (tableAction === 'merge') IE.table.merge(tableGroup, cellSel);
        else if (tableAction === 'split') IE.table.split(tableGroup, cellSel);
        else if (tableAction === 'split-all') IE.table.splitAll(tableGroup);
        else if (tableAction === 'even-row') IE.table.evenSizes(tableGroup, 'row');
        else if (tableAction === 'even-col') IE.table.evenSizes(tableGroup, 'col');
        else if (tableAction === 'cell-bold') IE.table.toggleBold(tableGroup, cellSel);
        else if (tableAction === 'cell-clear') {
          IE.table.formatCells(tableGroup, cellSel,
            { fill: null, color: null, align: null, valign: null, bold: null });
        } else if (tableAction === 'toggle-header-row') {
          IE.table.update(tableGroup, { headerRow: !tableGroup.tableData.headerRow });
        } else if (tableAction === 'toggle-header-col') {
          IE.table.update(tableGroup, { headerCol: !tableGroup.tableData.headerCol });
        }
      }
      refresh(true);
      return;
    }

    var shadowId = el.getAttribute('data-shadow');
    if (shadowId) {
      var shadowSel = selection();
      if (shadowSel) {
        var spec = shadowPresetById[shadowId];
        shadowSel.objects.forEach(function (obj) { IE.canvas.setShadow(obj, spec); });
      }
      refresh(true);
      return;
    }

    var toggleProp = el.getAttribute('data-toggle');
    if (toggleProp) {
      toggle(toggleProp);
      return;
    }

    var action = el.getAttribute('data-action');
    if (action) runAction(action);
  }

  function refresh(force) {
    var body = util.$('props-body');
    var empty = util.$('props-empty');
    if (!body || !empty) return;

    if (!force && document.activeElement && body.contains(document.activeElement)) return;

    var sel = selection();

    if (!sel) {
      empty.hidden = false;
      body.hidden = true;
      body.innerHTML = '';
      return;
    }

    empty.hidden = true;
    body.hidden = false;
    body.innerHTML = sel.multi ? multiHtml(sel) : singleHtml(sel.objects[0]);
  }

  /* ------------------------------------------------- 표 셀 고르기 격자 */

  var cellDrag = null;

  function cellEl(node) {
    while (node && node !== document) {
      if (node.classList && node.classList.contains('cp-cell')) return node;
      node = node.parentNode;
    }
    return null;
  }

  function cellRC(el) {
    var parts = el.getAttribute('data-cell-rc').split(':');
    return {
      r: parseInt(parts[0], 10),
      c: parseInt(parts[1], 10),
      rs: parseInt(el.getAttribute('data-cell-rs'), 10) || 1,
      cs: parseInt(el.getAttribute('data-cell-cs'), 10) || 1
    };
  }

  function tableOfSelection() {
    var sel = selection();
    return sel ? sel.objects.filter(IE.table.isTable)[0] : null;
  }

  /** 끄는 동안에는 패널을 다시 그리지 않고 켜진 칸만 바꾼다 */
  function paintCellSel(group) {
    var pick = util.$('cell-pick');
    if (!pick) return;

    var sel = group.cellSel;
    var r1 = Math.min(sel.r1, sel.r2), r2 = Math.max(sel.r1, sel.r2);
    var c1 = Math.min(sel.c1, sel.c2), c2 = Math.max(sel.c1, sel.c2);

    Array.prototype.forEach.call(pick.querySelectorAll('.cp-cell'), function (el) {
      var at = cellRC(el);
      var on = at.r <= r2 && at.r + at.rs - 1 >= r1 && at.c <= c2 && at.c + at.cs - 1 >= c1;
      el.classList.toggle('is-on', on);
    });
  }

  function handleCellPick(ev) {
    var el = cellEl(ev.target);
    if (!el) return;

    var group = tableOfSelection();
    if (!group) return;

    var at = cellRC(el);
    ev.preventDefault();

    cellDrag = { group: group, r1: at.r, c1: at.c, r2: at.r, c2: at.c, moved: false };
    group.cellSel = { r1: at.r, c1: at.c, r2: at.r, c2: at.c };
    paintCellSel(group);

    document.addEventListener('mousemove', handleCellDrag);
    document.addEventListener('mouseup', handleCellDrop);
  }

  function handleCellDrag(ev) {
    if (!cellDrag) return;

    var el = cellEl(document.elementFromPoint(ev.clientX, ev.clientY));
    if (!el) return;

    var at = cellRC(el);
    if (at.r === cellDrag.r2 && at.c === cellDrag.c2) return;

    cellDrag.r2 = at.r;
    cellDrag.c2 = at.c;
    cellDrag.moved = true;
    cellDrag.group.cellSel = { r1: cellDrag.r1, c1: cellDrag.c1, r2: at.r, c2: at.c };
    paintCellSel(cellDrag.group);
  }

  function handleCellDrop() {
    document.removeEventListener('mousemove', handleCellDrag);
    document.removeEventListener('mouseup', handleCellDrop);

    if (!cellDrag) return;
    cellDrag = null;

    // 고른 범위에 맞춰 '병합/나누기' 버튼 상태와 안내 글을 다시 그린다
    refresh(true);
  }

  function init() {
    var body = util.$('props-body');
    body.addEventListener('input', handleInput);
    body.addEventListener('change', handleInput);
    body.addEventListener('click', handleClick);
    body.addEventListener('mousedown', handleCellPick);

    // 표는 값을 치는 동안 패널을 다시 그리지 않는다 (포커스를 뺏기지 않게).
    // 입력이 끝나 포커스가 빠지면 그때 한 번 맞춰 준다.
    body.addEventListener('focusout', function () {
      setTimeout(function () { refresh(false); }, 0);
    });
  }

  IE.properties = {
    init: init,
    refresh: refresh,
    shadowFromDef: shadowFromDef,
    shadowPresets: SHADOW_PRESETS
  };
})(window.IE);
