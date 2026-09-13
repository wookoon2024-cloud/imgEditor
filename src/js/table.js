window.IE = window.IE || {};

(function (IE) {
  'use strict';

  var util = IE.util;
  var api = {};

  var FONT = 'Malgun Gothic';

  /* ------------------------------------------------------------ 데이터 */

  function create(opts) {
    opts = opts || {};

    var rows = Math.max(1, opts.rows || 3);
    var cols = Math.max(1, opts.cols || 3);
    var cellW = opts.cellW || 300;
    var cellH = opts.cellH || 90;

    var data = {
      rows: rows,
      cols: cols,
      colWidths: [],
      rowHeights: [],
      cells: [],
      borderColor: opts.borderColor || '#94a3b8',
      borderWidth: opts.borderWidth == null ? 2 : opts.borderWidth,
      fontSize: opts.fontSize || 28,
      color: opts.color || '#111827',
      align: opts.align || 'center',
      valign: opts.valign || 'middle',
      headerRow: opts.headerRow !== false,
      headerCol: !!opts.headerCol,
      headerFill: opts.headerFill || '#e2e8f0',
      bodyFill: opts.bodyFill || '#ffffff',
      padding: opts.padding == null ? 12 : opts.padding
    };

    for (var c = 0; c < cols; c++) {
      data.colWidths.push((opts.colWidths && opts.colWidths[c]) || cellW);
    }
    for (var r = 0; r < rows; r++) {
      data.rowHeights.push((opts.rowHeights && opts.rowHeights[r]) || cellH);
    }
    for (var y = 0; y < rows; y++) {
      var line = [];
      for (var x = 0; x < cols; x++) {
        var preset = (opts.cells && opts.cells[y] && opts.cells[y][x]) || null;
        var cell = typeof preset === 'string' ? { text: preset } : (preset || { text: '' });
        if (cell.rowSpan == null) cell.rowSpan = 1;
        if (cell.colSpan == null) cell.colSpan = 1;
        if (cell.hidden == null) cell.hidden = false;
        line.push(cell);
      }
      data.cells.push(line);
    }

    return data;
  }

  api.create = create;

  api.isTable = function (obj) {
    return !!(obj && obj.kind === 'table' && obj.tableData && obj.tableData.cells);
  };

  /* -------------------------------------------------------- 병합 구조 */
  /*
   * 병합은 칸 하나가 차지하는 범위로 적는다.
   *   왼쪽 위 칸  ... rowSpan / colSpan 으로 몇 칸을 먹는지
   *   먹힌 칸    ... hidden = true (그리지도, 글자를 받지도 않는다)
   * cells 는 언제나 rows × cols 사각형으로 유지해서 행/열 추가·삭제가 그대로 돌아간다.
   */

  /** 어긋난 병합 정보를 바로잡는다 (옛 문서 · 잘못된 조작 대비) */
  function normalize(data) {
    var r, c, y, x, v, t;

    if (!data.rows || !data.cols) return data;

    for (r = 0; r < data.rows; r++) {
      if (!data.cells[r]) data.cells[r] = [];
      for (c = 0; c < data.cols; c++) {
        v = data.cells[r][c];
        if (typeof v === 'string') v = data.cells[r][c] = { text: v };
        if (!v || typeof v !== 'object') v = data.cells[r][c] = { text: '' };
        if (v.text == null) v.text = '';
        v.rowSpan = Math.max(1, Math.min(data.rows - r, Math.round(v.rowSpan) || 1));
        v.colSpan = Math.max(1, Math.min(data.cols - c, Math.round(v.colSpan) || 1));
        v.hidden = false;
      }
      data.cells[r].length = data.cols;
    }
    data.cells.length = data.rows;

    /* 왼쪽 위부터 훑으며 먹힌 칸을 표시한다 — 겹치면 먼저 온 칸이 이긴다 */
    for (r = 0; r < data.rows; r++) {
      for (c = 0; c < data.cols; c++) {
        v = data.cells[r][c];
        if (v.hidden || (v.rowSpan === 1 && v.colSpan === 1)) continue;
        for (y = r; y < r + v.rowSpan; y++) {
          for (x = c; x < c + v.colSpan; x++) {
            if (y === r && x === c) continue;
            t = data.cells[y][x];
            t.hidden = true;
            t.rowSpan = 1;
            t.colSpan = 1;
          }
        }
      }
    }

    return data;
  }

  /** 칸마다 어느 병합 덩어리에 속하는지 — '왼쪽위행:열' 열쇠로 적는다 */
  function regionMap(data) {
    var map = [];
    var r, c, y, x, v;

    for (r = 0; r < data.rows; r++) {
      var line = [];
      for (c = 0; c < data.cols; c++) line.push(r + ':' + c);
      map.push(line);
    }

    for (r = 0; r < data.rows; r++) {
      for (c = 0; c < data.cols; c++) {
        v = data.cells[r][c];
        if (v.hidden || (v.rowSpan === 1 && v.colSpan === 1)) continue;
        for (y = r; y < r + v.rowSpan; y++) {
          for (x = c; x < c + v.colSpan; x++) map[y][x] = r + ':' + c;
        }
      }
    }

    return map;
  }

  function anchorAt(data, map, r, c) {
    var parts = map[r][c].split(':');
    return { r: parseInt(parts[0], 10), c: parseInt(parts[1], 10) };
  }

  /** 고른 범위를 문서 안으로 자르고 순서를 바로 세운다 */
  function rectOf(data, sel) {
    if (!sel) return { r1: 0, c1: 0, r2: 0, c2: 0 };
    return {
      r1: util.clamp(Math.min(sel.r1, sel.r2), 0, data.rows - 1),
      c1: util.clamp(Math.min(sel.c1, sel.c2), 0, data.cols - 1),
      r2: util.clamp(Math.max(sel.r1, sel.r2), 0, data.rows - 1),
      c2: util.clamp(Math.max(sel.c1, sel.c2), 0, data.cols - 1)
    };
  }

  /** 고른 범위가 병합 덩어리를 반쯤 자르면, 그 덩어리를 통째로 삼키도록 넓힌다 */
  function growRect(data, map, rect) {
    var r1 = rect.r1, c1 = rect.c1, r2 = rect.r2, c2 = rect.c2;
    var moved = true;

    while (moved) {
      moved = false;
      for (var r = r1; r <= r2; r++) {
        for (var c = c1; c <= c2; c++) {
          var a = anchorAt(data, map, r, c);
          var v = data.cells[a.r][a.c];
          var br = a.r + v.rowSpan - 1;
          var bc = a.c + v.colSpan - 1;
          if (a.r < r1) { r1 = a.r; moved = true; }
          if (a.c < c1) { c1 = a.c; moved = true; }
          if (br > r2) { r2 = br; moved = true; }
          if (bc > c2) { c2 = bc; moved = true; }
        }
      }
    }

    return { r1: r1, c1: c1, r2: r2, c2: c2 };
  }

  /** 범위 안 덩어리들의 왼쪽 위 칸을 한 번씩만 돌려준다 */
  function anchorsIn(data, map, rect) {
    var out = [];
    var seen = {};
    for (var r = rect.r1; r <= rect.r2; r++) {
      for (var c = rect.c1; c <= rect.c2; c++) {
        var key = map[r][c];
        if (seen[key]) continue;
        seen[key] = 1;
        out.push(anchorAt(data, map, r, c));
      }
    }
    return out;
  }

  function sizeOf(data, anchor) {
    var v = data.cells[anchor.r][anchor.c];
    return { r: v.rowSpan, c: v.colSpan };
  }

  /** 이 범위가 통째로 한 덩어리인지 (나눌 게 있는지) */
  function mergedIn(data, map, rect) {
    return anchorsIn(data, map, rect).some(function (a) {
      var s = sizeOf(data, a);
      return s.r > 1 || s.c > 1;
    });
  }

  /* ---------------------------------------------------------- 좌표 계산 */

  function offsets(sizes) {
    var out = [0];
    var acc = 0;
    sizes.forEach(function (size) {
      acc += size;
      out.push(acc);
    });
    return out;
  }

  function total(sizes) {
    return sizes.reduce(function (a, b) { return a + b; }, 0);
  }

  /* --------------------------------------------------------------- 생성 */

  function build(data, left, top) {
    normalize(data);

    var children = [];
    var W = total(data.colWidths);
    var H = total(data.rowHeights);
    var xs = offsets(data.colWidths);
    var ys = offsets(data.rowHeights);
    var map = regionMap(data);

    /** 병합을 반영한 칸 자리 — 왼쪽 위 좌표와 넓이 */
    function span(r, c) {
      var v = data.cells[r][c];
      var rs = Math.min(v.rowSpan || 1, data.rows - r);
      var cs = Math.min(v.colSpan || 1, data.cols - c);
      return {
        x: xs[c], y: ys[r],
        w: xs[c + cs] - xs[c],
        h: ys[r + rs] - ys[r]
      };
    }

    /** 연속된 구간만 골라낸다 — 병합 안쪽처럼 건너뛸 구간을 빼고 */
    function runs(count, skip) {
      var out = [];
      var from = -1;
      for (var i = 0; i < count; i++) {
        if (skip(i)) {
          if (from >= 0) { out.push([from, i - 1]); from = -1; }
        } else if (from < 0) {
          from = i;
        }
      }
      if (from >= 0) out.push([from, count - 1]);
      return out;
    }

    // 본문 배경
    children.push(new fabric.Rect({
      left: 0, top: 0, width: W, height: H,
      fill: data.bodyFill, stroke: null, strokeWidth: 0,
      selectable: false, evented: false
    }));

    // 헤더 배경
    if (data.headerRow && data.rows > 0) {
      children.push(new fabric.Rect({
        left: 0, top: 0, width: W, height: data.rowHeights[0],
        fill: data.headerFill, selectable: false, evented: false
      }));
    }
    if (data.headerCol && data.cols > 0) {
      children.push(new fabric.Rect({
        left: 0, top: 0, width: data.colWidths[0], height: H,
        fill: data.headerFill, selectable: false, evented: false
      }));
    }

    // 셀 개별 배경 — 병합된 칸은 합친 넓이만큼
    for (var r = 0; r < data.rows; r++) {
      for (var c = 0; c < data.cols; c++) {
        var cell = data.cells[r][c];
        if (cell.hidden || !cell.fill) continue;
        var box = span(r, c);
        children.push(new fabric.Rect({
          left: box.x, top: box.y, width: box.w, height: box.h,
          fill: cell.fill, selectable: false, evented: false
        }));
      }
    }

    // 격자선 — 병합된 칸 안쪽은 긋지 않는다
    var lw = data.borderWidth;
    if (lw > 0) {
      var lineFill = data.borderColor;
      var half = lw / 2;

      function band(x, y, w, h) {
        children.push(new fabric.Rect({
          left: x, top: y, width: w, height: h,
          fill: lineFill, selectable: false, evented: false
        }));
      }

      /* 세로선 i — 양옆 칸이 같은 덩어리인 행 구간은 건너뛴다 */
      for (var i = 0; i <= data.cols; i++) {
        var lx = Math.max(0, Math.min(xs[i] - (i === 0 ? 0 : half), W - lw));
        runs(data.rows, function (r) {
          return i > 0 && i < data.cols && map[r][i - 1] === map[r][i];
        }).forEach(function (run) {
          var y0 = Math.max(0, ys[run[0]] - half);
          var y1 = Math.min(H, ys[run[1] + 1] + half);
          band(lx, y0, lw, y1 - y0);
        });
      }

      /* 가로선 j — 위아래 칸이 같은 덩어리인 열 구간은 건너뛴다 */
      for (var j = 0; j <= data.rows; j++) {
        var ly = Math.max(0, Math.min(ys[j] - (j === 0 ? 0 : half), H - lw));
        runs(data.cols, function (c) {
          return j > 0 && j < data.rows && map[j - 1][c] === map[j][c];
        }).forEach(function (run) {
          var x0 = Math.max(0, xs[run[0]] - half);
          var x1 = Math.min(W, xs[run[1] + 1] + half);
          band(x0, ly, x1 - x0, lw);
        });
      }
    }

    // 셀 텍스트 — 병합된 칸은 합친 넓이의 한가운데
    for (var rr = 0; rr < data.rows; rr++) {
      for (var cc = 0; cc < data.cols; cc++) {
        var value = data.cells[rr][cc];
        var text = value.text || '';
        if (value.hidden || !text) continue;

        var isHeader = (data.headerRow && rr === 0) || (data.headerCol && cc === 0);
        var spot = span(rr, cc);
        var valign = value.valign || data.valign || 'middle';

        children.push(new fabric.Textbox(text, {
          left: spot.x + spot.w / 2,
          top: valign === 'top' ? spot.y + data.padding
            : valign === 'bottom' ? spot.y + spot.h - data.padding
            : spot.y + spot.h / 2,
          width: Math.max(10, spot.w - data.padding * 2),
          originX: 'center',
          originY: valign === 'top' ? 'top' : (valign === 'bottom' ? 'bottom' : 'center'),
          fontFamily: FONT,
          fontSize: data.fontSize,
          fontWeight: value.bold != null ? (value.bold ? 'bold' : 'normal')
            : (isHeader ? 'bold' : 'normal'),
          fill: value.color || data.color,
          textAlign: value.align || data.align,
          lineHeight: 1.3,
          splitByGrapheme: true,
          selectable: false,
          evented: false,
          kind: 'cell'
        }));
      }
    }

    var group = new fabric.Group(children, {
      left: left || 0,
      top: top || 0,
      originX: 'left',
      originY: 'top',
      kind: 'table',
      transparentCorners: false,
      cornerColor: '#2563eb',
      cornerStyle: 'circle',
      cornerSize: 9,
      borderColor: '#2563eb',
      borderScaleFactor: 1.4
    });

    // tableData 는 구조가 깊어 propertiesToInclude 로 넘기면 위험하다.
    // 직렬화는 이 객체에서 직접 책임진다.
    group.tableData = data;
    /* 속성 패널이 쓰는 '고른 칸' — 아무것도 안 골랐으면 왼쪽 위 한 칸 */
    group.cellSel = { r1: 0, c1: 0, r2: 0, c2: 0 };
    group.toObject = function (props) {
      var out = fabric.Group.prototype.toObject.call(this, props || []);
      out.kind = 'table';
      out.tableData = util.clone(this.tableData);
      return out;
    };

    return group;
  }

  /**
   * loadFromJSON 이 표 그룹을 만날 때 tableData 를 되살리는 reviver.
   * canvas.loadFromJSON(json, cb, IE.table.reviver) 형태로 넘긴다.
   */
  api.reviver = function (serialized, instance) {
    if (!instance) return instance;

    if (serialized && serialized.kind === 'table' && serialized.tableData) {
      instance.tableData = serialized.tableData;
      instance.kind = 'table';
    }
    if (serialized && serialized.tableData === undefined && instance.kind === 'table' && !instance.tableData) {
      // 안전장치: 데이터가 유실된 표는 최소 구조로 되살린다
      instance.tableData = create({});
    }

    // 불러온 표에는 아직 '고른 칸'이 없다
    if (instance.tableData && !instance.cellSel) {
      instance.cellSel = { r1: 0, c1: 0, r2: 0, c2: 0 };
    }
    return instance;
  };

  api.build = build;

  /** 그룹에 적용된 확대/축소를 데이터(픽셀 값)로 흡수시킨다 */
  api.bake = function (group) {
    var data = group.tableData;
    if (!data) return;

    var sx = group.scaleX || 1;
    var sy = group.scaleY || 1;

    if (Math.abs(sx - 1) > 0.002) {
      data.colWidths = data.colWidths.map(function (w) { return Math.max(20, w * sx); });
      data.fontSize = Math.max(6, data.fontSize * sx);
      data.borderWidth = Math.max(0.5, data.borderWidth * sx);
      data.padding = data.padding * sx;
    }
    if (Math.abs(sy - 1) > 0.002) {
      data.rowHeights = data.rowHeights.map(function (h) { return Math.max(20, h * sy); });
    }

    group.set({ scaleX: 1, scaleY: 1 });
  };

  /** 기존 그룹 자리에 새 그룹을 만들어 끼운다 */
  api.rebuild = function (group) {
    if (!api.isTable(group)) return null;

    var canvas = IE.state.canvas;
    var data = group.tableData;

    var fresh = build(data, group.left, group.top);
    fresh.set({
      angle: group.angle || 0,
      opacity: group.opacity == null ? 1 : group.opacity
    });
    fresh.setCoords();

    // 고른 칸은 다시 그려도 그대로 남는다
    if (group.cellSel) fresh.cellSel = group.cellSel;

    var index = canvas.getObjects().indexOf(group);
    canvas.remove(group);
    if (index >= 0) canvas.insertAt(fresh, Math.min(index, canvas.size()));
    else canvas.add(fresh);

    canvas.setActiveObject(fresh);
    canvas.requestRenderAll();

    if (IE.state.history) IE.state.history.snapshot();
    if (IE.panels) IE.panels.refresh();

    return fresh;
  };

  /** 데이터를 패치하고 다시 그린다 (확대된 상태면 먼저 픽셀에 반영) */
  api.update = function (group, patch) {
    if (!api.isTable(group)) return null;

    api.bake(group);

    Object.keys(patch || {}).forEach(function (key) {
      group.tableData[key] = patch[key];
    });

    return api.rebuild(group);
  };

  /* ------------------------------------------------------- 행/열 조작 */

  api.addRow = function (group) {
    if (!api.isTable(group)) return null;
    api.bake(group);

    var data = group.tableData;
    var lastHeight = data.rowHeights[data.rowHeights.length - 1] || 80;
    data.rowHeights.push(lastHeight);

    var line = [];
    for (var c = 0; c < data.cols; c++) line.push({ text: '' });
    data.cells.push(line);
    data.rows = data.rowHeights.length;

    return api.rebuild(group);
  };

  api.removeRow = function (group) {
    if (!api.isTable(group)) return null;
    api.bake(group);

    var data = group.tableData;
    if (data.rows <= 1) {
      util.toast('행이 하나뿐이라 삭제할 수 없습니다.');
      return group;
    }

    /* 마지막 행까지 내려온 병합은 한 줄 줄여 준다 */
    normalize(data);
    for (var r = 0; r < data.rows; r++) {
      for (var c = 0; c < data.cols; c++) {
        var v = data.cells[r][c];
        if (v.hidden) continue;
        if (v.rowSpan > 1 && r + v.rowSpan - 1 === data.rows - 1) v.rowSpan--;
      }
    }

    data.rowHeights.pop();
    data.cells.pop();
    data.rows = data.rowHeights.length;

    return api.rebuild(group);
  };

  api.addCol = function (group) {
    if (!api.isTable(group)) return null;
    api.bake(group);

    var data = group.tableData;
    var lastWidth = data.colWidths[data.colWidths.length - 1] || 200;
    data.colWidths.push(lastWidth);

    data.cells.forEach(function (line) { line.push({ text: '' }); });
    data.cols = data.colWidths.length;

    return api.rebuild(group);
  };

  api.removeCol = function (group) {
    if (!api.isTable(group)) return null;
    api.bake(group);

    var data = group.tableData;
    if (data.cols <= 1) {
      util.toast('열이 하나뿐이라 삭제할 수 없습니다.');
      return group;
    }

    /* 끝 열까지 뻗은 병합은 한 칸 줄여 준다 */
    normalize(data);
    for (var r = 0; r < data.rows; r++) {
      for (var c = 0; c < data.cols; c++) {
        var v = data.cells[r][c];
        if (v.hidden) continue;
        if (v.colSpan > 1 && c + v.colSpan - 1 === data.cols - 1) v.colSpan--;
      }
    }

    data.colWidths.pop();
    data.cells.forEach(function (line) { line.pop(); });
    data.cols = data.colWidths.length;

    return api.rebuild(group);
  };

  /* ------------------------------------------------------- 셀 병합/나누기 */

  /** 고른 범위를 한 칸으로 합친다 */
  api.merge = function (group, sel) {
    if (!api.isTable(group)) return null;
    api.bake(group);

    var data = group.tableData;
    normalize(data);

    var map = regionMap(data);
    var rect = growRect(data, map, rectOf(data, sel));

    if (rect.r1 === rect.r2 && rect.c1 === rect.c2) {
      util.toast('두 칸 이상 골라야 합칠 수 있습니다.');
      return group;
    }

    var anchor = data.cells[rect.r1][rect.c1];
    var lost = 0;

    for (var r = rect.r1; r <= rect.r2; r++) {
      for (var c = rect.c1; c <= rect.c2; c++) {
        if (r === rect.r1 && c === rect.c1) continue;
        var v = data.cells[r][c];
        if (v.text) lost++;
        v.text = '';
        v.fill = undefined;
        v.color = undefined;
        v.align = undefined;
        v.valign = undefined;
        v.bold = undefined;
      }
    }

    anchor.rowSpan = rect.r2 - rect.r1 + 1;
    anchor.colSpan = rect.c2 - rect.c1 + 1;

    var fresh = api.rebuild(group);
    if (fresh) fresh.cellSel = { r1: rect.r1, c1: rect.c1, r2: rect.r2, c2: rect.c2 };

    if (lost) util.toast('칸 ' + lost + '개의 내용은 지워졌습니다.');
    if (fresh) IE.state.canvas.requestRenderAll();

    return fresh;
  };

  /** 고른 범위에 걸린 병합을 도로 편다 */
  api.split = function (group, sel) {
    if (!api.isTable(group)) return null;
    api.bake(group);

    var data = group.tableData;
    normalize(data);

    var map = regionMap(data);
    var rect = growRect(data, map, rectOf(data, sel));
    var targets = anchorsIn(data, map, rect);
    var count = 0;

    targets.forEach(function (a) {
      var v = data.cells[a.r][a.c];
      if (v.rowSpan === 1 && v.colSpan === 1) return;
      v.rowSpan = 1;
      v.colSpan = 1;
      count++;
    });

    if (!count) {
      util.toast('나눌 병합이 없습니다.');
      return group;
    }

    var fresh = api.rebuild(group);
    if (fresh) fresh.cellSel = { r1: rect.r1, c1: rect.c1, r2: rect.r2, c2: rect.c2 };
    return fresh;
  };

  /** 표 전체의 병합을 한 번에 편다 */
  api.splitAll = function (group) {
    if (!api.isTable(group)) return null;
    api.bake(group);

    var data = group.tableData;
    normalize(data);

    var count = 0;
    for (var r = 0; r < data.rows; r++) {
      for (var c = 0; c < data.cols; c++) {
        var v = data.cells[r][c];
        if (v.hidden) continue;
        if (v.rowSpan > 1 || v.colSpan > 1) count++;
        v.rowSpan = 1;
        v.colSpan = 1;
      }
    }

    if (!count) {
      util.toast('나눌 병합이 없습니다.');
      return group;
    }

    var fresh = api.rebuild(group);
    if (fresh) fresh.cellSel = { r1: 0, c1: 0, r2: 0, c2: 0 };
    return fresh;
  };

  /* --------------------------------------------------------- 셀 서식 */

  /**
   * 고른 칸들에만 서식을 준다.
   * patch 값이 null 이면 그 서식을 지우고 표 기본값을 따라간다.
   */
  api.formatCells = function (group, sel, patch) {
    if (!api.isTable(group)) return null;
    api.bake(group);

    var data = group.tableData;
    normalize(data);

    var map = regionMap(data);
    var rect = growRect(data, map, rectOf(data, sel));

    anchorsIn(data, map, rect).forEach(function (a) {
      var v = data.cells[a.r][a.c];
      Object.keys(patch).forEach(function (key) {
        if (patch[key] === null || patch[key] === undefined) delete v[key];
        else v[key] = patch[key];
      });
    });

    var fresh = api.rebuild(group);
    if (fresh) fresh.cellSel = { r1: rect.r1, c1: rect.c1, r2: rect.r2, c2: rect.c2 };
    return fresh;
  };

  /** 고른 범위의 행 높이 / 열 너비를 한 값으로 */
  api.sizeCells = function (group, sel, axis, value) {
    if (!api.isTable(group)) return null;
    api.bake(group);

    var data = group.tableData;
    var rect = rectOf(data, sel);
    var size = Math.max(20, Math.round(value));

    if (axis === 'row') {
      for (var r = rect.r1; r <= rect.r2; r++) data.rowHeights[r] = size;
    } else {
      for (var c = rect.c1; c <= rect.c2; c++) data.colWidths[c] = size;
    }

    var fresh = api.rebuild(group);
    if (fresh) fresh.cellSel = { r1: rect.r1, c1: rect.c1, r2: rect.r2, c2: rect.c2 };
    return fresh;
  };

  /** 행 높이 / 열 너비를 고르게 */
  api.evenSizes = function (group, axis) {
    if (!api.isTable(group)) return null;
    api.bake(group);

    var data = group.tableData;

    if (axis === 'row') {
      var h = total(data.rowHeights) / data.rows;
      data.rowHeights = data.rowHeights.map(function () { return h; });
    } else {
      var w = total(data.colWidths) / data.cols;
      data.colWidths = data.colWidths.map(function () { return w; });
    }

    var fresh = api.rebuild(group);
    return fresh;
  };

  /** 고른 칸들의 굵기를 한 번에 — 이미 다 굵으면 도로 푼다 */
  api.toggleBold = function (group, sel) {
    if (!api.isTable(group)) return null;

    var data = group.tableData;
    normalize(data);

    var map = regionMap(data);
    var rect = growRect(data, map, rectOf(data, sel));
    var anchors = anchorsIn(data, map, rect);

    var allBold = anchors.every(function (a) {
      var v = data.cells[a.r][a.c];
      var isHeader = (data.headerRow && a.r === 0) || (data.headerCol && a.c === 0);
      return v.bold != null ? !!v.bold : isHeader;
    });

    return api.formatCells(group, sel, { bold: !allBold });
  };

  /** 표가 지금 어떤 병합 상태인지 — 패널이 버튼을 켜고 끄는 데 쓴다 */
  api.state = function (group, sel) {
    var data = group.tableData;
    normalize(data);

    var map = regionMap(data);
    var rect = growRect(data, map, rectOf(data, sel));
    var anchors = anchorsIn(data, map, rect);
    var merged = mergedIn(data, map, rect);
    var cells = 0;

    anchors.forEach(function (a) {
      var s = sizeOf(data, a);
      cells += s.r * s.c;
    });

    var anyMerge = false;
    for (var r = 0; r < data.rows && !anyMerge; r++) {
      for (var c = 0; c < data.cols; c++) {
        var v = data.cells[r][c];
        if (!v.hidden && (v.rowSpan > 1 || v.colSpan > 1)) { anyMerge = true; break; }
      }
    }

    return {
      rect: rect,
      cells: cells,
      anchors: anchors,
      merged: merged,
      anyMerge: anyMerge
    };
  };

  /* --------------------------------------------------------- 문서 삽입 */

  api.add = function (opts) {
    var data = create(opts || {});
    var W = total(data.colWidths);
    var H = total(data.rowHeights);

    var left = Math.round((IE.state.docW - W) / 2);
    var top = Math.round((IE.state.docH - H) / 2);

    var group = build(data, left, top);

    var canvas = IE.state.canvas;
    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.requestRenderAll();

    if (IE.state.history) IE.state.history.snapshot();
    if (IE.panels) IE.panels.refresh();
    if (IE.app) IE.app.updateStatus();

    return group;
  };

  /* ------------------------------------------------------- 셀 편집 모달 */

  var editing = null;

  api.openEditor = function (group) {
    if (!api.isTable(group)) return;

    editing = group;
    var data = group.tableData;
    var host = util.$('table-editor');
    if (!host) return;

    normalize(data);

    var html = '<table class="cell-table"><tbody>';
    for (var r = 0; r < data.rows; r++) {
      html += '<tr>';
      for (var c = 0; c < data.cols; c++) {
        var cell = data.cells[r][c];
        /* 합쳐진 칸은 한 칸으로 보여 준다 — 먹힌 칸은 아예 그리지 않는다 */
        if (cell.hidden) continue;
        var isHeader = (data.headerRow && r === 0) || (data.headerCol && c === 0);
        var span = '';
        if (cell.rowSpan > 1) span += ' rowspan="' + cell.rowSpan + '"';
        if (cell.colSpan > 1) span += ' colspan="' + cell.colSpan + '"';
        html += '<td' + (isHeader ? ' class="is-header"' : '') + span + '>' +
          '<textarea data-cell="' + r + ':' + c + '" rows="' + (cell.rowSpan > 1 ? 4 : 2) + '">' +
          util.escapeHtml(cell.text || '') +
          '</textarea></td>';
      }
      html += '</tr>';
    }
    html += '</tbody></table>';

    host.innerHTML = html;
    util.$('modal-table').hidden = false;

    var first = host.querySelector('textarea');
    if (first) first.focus();
  };

  api.closeEditor = function () {
    util.$('modal-table').hidden = true;
    editing = null;
  };

  function applyEditor() {
    if (!editing || !api.isTable(editing)) {
      api.closeEditor();
      return;
    }

    var host = util.$('table-editor');
    var data = editing.tableData;

    Array.prototype.forEach.call(host.querySelectorAll('textarea[data-cell]'), function (area) {
      var parts = area.getAttribute('data-cell').split(':');
      var r = parseInt(parts[0], 10);
      var c = parseInt(parts[1], 10);
      if (!data.cells[r] || !data.cells[r][c]) return;
      data.cells[r][c].text = area.value;
    });

    var group = editing;
    api.closeEditor();
    api.rebuild(group);
  }

  api.init = function () {
    util.on('modal-table-close', 'click', api.closeEditor);
    util.on('table-editor-cancel', 'click', api.closeEditor);
    util.on('table-editor-apply', 'click', applyEditor);

    util.on('modal-table', 'mousedown', function (ev) {
      if (ev.target === util.$('modal-table')) api.closeEditor();
    });
  };

  IE.table = api;
})(window.IE);
