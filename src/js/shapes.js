window.IE = window.IE || {};

(function (IE) {
  'use strict';

  var util = IE.util;

  /* ============================================================ 색

     상용 에디터는 요소를 넣기 **전에** 색을 고른다. 색을 먼저 정하고
     넣으면 속성 패널까지 갈 일이 없다. 색은 크게 세 줄로 나눈다 —
     기본(무채색) / 은은한 색 / 진한 색. 공문서에 쓰기 좋은 톤 위주다. */

  var PALETTE_GROUPS = [
    {
      id: 'basic',
      name: '기본',
      colors: ['#111827', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#ffffff']
    },
    {
      id: 'soft',
      name: '은은한',
      colors: ['#fee2e2', '#ffedd5', '#fef3c7', '#dcfce7', '#cffafe', '#dbeafe',
        '#e0e7ff', '#f3e8ff', '#fce7f3', '#ecfccb']
    },
    {
      id: 'deep',
      name: '진한',
      colors: ['#dc2626', '#ea580c', '#d97706', '#16a34a', '#0891b2', '#2563eb',
        '#4f46e5', '#7c3aed', '#db2777', '#65a30d']
    },
    {
      id: 'gov',
      name: '공공',
      colors: ['#003478', '#0b4da2', '#1d4ed8', '#0369a1', '#047857', '#b91c1c',
        '#a16207', '#4d7c0f', '#334155', '#1e293b']
    }
  ];

  var PALETTE = [];
  PALETTE_GROUPS.forEach(function (group) {
    group.colors.forEach(function (color) {
      if (PALETTE.indexOf(color) === -1) PALETTE.push(color);
    });
  });

  /* ============================================================ 도형

     24×24 기준 **면** 경로. 아이콘과 달리 속을 채워 넣는 도형이다.
     정다각형·별은 계산으로 만든다 — 손으로 찍으면 삐뚤어진다. */

  function round1(value) {
    return Math.round(value * 100) / 100;
  }

  function ringPoints(count, outer, inner, phase) {
    var step = (Math.PI * 2) / count;
    var start = (phase === undefined) ? -Math.PI / 2 : phase;
    var points = [];

    for (var i = 0; i < count; i++) {
      var radius = (inner && (i % 2)) ? inner : outer;
      var angle = step * i + start;
      points.push(round1(12 + radius * Math.cos(angle)) + ' ' +
        round1(12 + radius * Math.sin(angle)));
    }

    return points;
  }

  function areaPath(points) {
    return 'M' + points.join(' ') + 'z';
  }

  function polygonPath(sides, phase) {
    return areaPath(ringPoints(sides, 11, 0, phase));
  }

  function starPath(points, ratio) {
    return areaPath(ringPoints(points * 2, 11, 11 * ratio));
  }

  var FIGURES = {
    /* --- 기본 --- */
    square: 'M2 2h20v20H2z',
    roundSquare: 'M6 2h12a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4z',
    circle: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z',
    ellipse: 'M12 4c5 0 9 3.6 9 8s-4 8-9 8-9-3.6-9-8 4-8 9-8z',
    semicircle: 'M2 16a10 10 0 0 1 20 0z',
    quarter: 'M2 2v20a20 20 0 0 0 20-20z',
    ring: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z' +
      'M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10z',

    /* --- 사각 계열 --- */
    trapezoid: 'M6 4h12l4 16H2z',
    parallelogram: 'M7 4h15l-5 16H2z',
    arrowBlock: 'M3 8h9V3l9 9-9 9v-5H3z',
    arrowBlockUp: 'M3 21v-9H3l9-9 9 9h-5v9z',
    cross: 'M9 2h6v7h7v6h-7v7H9v-7H2V9h7z',
    chevronBlock: 'M2 2h12l8 10-8 10H2l8-10z',

    /* --- 곡선 --- */
    heart: 'M12 21s-7.2-4.55-9.05-8.9C1.5 8.3 3.6 5.2 6.75 5.2c1.95 0 3.5 1.05 5.25 2.9' +
      ' 1.75-1.85 3.3-2.9 5.25-2.9 3.15 0 5.25 3.1 3.8 6.9C19.2 16.45 12 21 12 21z',
    drop: 'M12 2c4 5 7 8.5 7 12a7 7 0 1 1-14 0c0-3.5 3-7 7-12z',
    shield: 'M12 2l8 3v7c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V5z',
    blob: 'M13.4 2.2c3.3.4 6 2.7 6.8 5.7.8 3-.6 5.2-1.6 7.3-1 2.1-1.6 4.5-3.9 5.6' +
      '-2.3 1.1-5.6.9-8-.5-2.4-1.4-3.9-4.2-3.9-7.1 0-3.2 1.8-6 4.3-7.9 1.6-1.2 3-3.4 6.3-3.1z',
    wave: 'M1 15c3-4 5 2 8-2s5 2 8-2 5 2 6-1v5c-1 3-3-1-6 1s-5-2-8 2-5-2-8 2z'
  };

  /* 정다각형 */
  [['triangle', 3], ['diamond', 4], ['pentagon', 5], ['hexagon', 6],
    ['heptagon', 7], ['octagon', 8], ['nonagon', 9], ['decagon', 10]].forEach(function (pair) {
    FIGURES[pair[0]] = polygonPath(pair[1], pair[0] === 'diamond' ? 0 : undefined);
  });

  /* 별 · 톱니 */
  [['star5', 5, 0.45], ['star6', 6, 0.5], ['star7', 7, 0.55],
    ['star8', 8, 0.56], ['star12', 12, 0.68], ['burst', 16, 0.78],
    ['sealEdge', 24, 0.9]].forEach(function (spec) {
    FIGURES[spec[0]] = starPath(spec[1], spec[2]);
  });

  /* ==================================================== 여러 색 도형

     도형도 아이콘처럼 여러 색을 쓸 수 있다.
       - 슬롯이 하나뿐인 도형   : 면 / 테두리 / 그라데이션 스타일로 칠한다
       - 슬롯이 여럿인 도형(장식·무늬) : 정의에 담긴 layers 로 색을 나눠 칠한다
     한 색만 고르면 나머지 색은 그 색에서 조화롭게 만들어 낸다. */

  function circlePath(cx, cy, r) {
    return 'M' + round1(cx - r) + ' ' + round1(cy) +
      'a' + round1(r) + ' ' + round1(r) + ' 0 1 0 ' + round1(r * 2) + ' 0' +
      'a' + round1(r) + ' ' + round1(r) + ' 0 1 0 ' + round1(-r * 2) + ' 0z';
  }

  function rectPath(x, y, w, h) {
    return 'M' + round1(x) + ' ' + round1(y) + 'h' + round1(w) + 'v' + round1(h) +
      'H' + round1(x) + 'z';
  }

  function polygonD(points) {
    return 'M' + points.map(function (pt) {
      return round1(pt.x) + ' ' + round1(pt.y);
    }).join('L') + 'z';
  }

  function bumpPath(x, y, r) {
    return 'M' + round1(x) + ' ' + round1(y) +
      'a' + round1(r) + ' ' + round1(r) + ' 0 0 1 ' + round1(r * 2) + ' 0z';
  }

  function triangleD(ax, ay, bx, by, cx, cy) {
    return polygonD([{ x: ax, y: ay }, { x: bx, y: by }, { x: cx, y: cy }]);
  }

  /** 볼록 다각형을 반평면 a·x + b·y + c ≥ 0 으로 잘라 낸다 (대각 줄무늬용) */
  function clipPlane(poly, a, b, c) {
    var out = [];

    for (var i = 0; i < poly.length; i++) {
      var p1 = poly[i];
      var p2 = poly[(i + 1) % poly.length];
      var v1 = a * p1.x + b * p1.y + c;
      var v2 = a * p2.x + b * p2.y + c;

      if (v1 >= 0) out.push(p1);
      if ((v1 >= 0) !== (v2 >= 0)) {
        var t = v1 / (v1 - v2);
        out.push({ x: p1.x + (p2.x - p1.x) * t, y: p1.y + (p2.y - p1.y) * t });
      }
    }

    return out;
  }

  function diagonalStripes(step, thickness) {
    var box = [{ x: 0, y: 0 }, { x: 24, y: 0 }, { x: 24, y: 24 }, { x: 0, y: 24 }];
    var paths = [];

    for (var c = -24; c < 24; c += step) {
      var poly = clipPlane(clipPlane(box, 1, -1, -c), -1, 1, c + thickness);
      if (poly.length >= 3) paths.push(polygonD(poly));
    }

    return paths;
  }

  /** 같은 경로를 가운데 기준으로 줄여 가며 겹친 도형 — 여러 색 장식의 기본형 */
  function layeredFigure(basePath, scales) {
    return {
      slots: ['바깥', '가운데', '안쪽'].slice(0, scales.length),
      layers: scales.map(function (scale, index) {
        return { d: basePath, slot: index, scale: scale };
      })
    };
  }

  /** 바탕 한 장 위에 무늬를 얹는 도형 — 슬롯 0 이 무늬, 슬롯 1 이 바탕 */
  function bandFigure(slotNames, backgroundD, motifPaths) {
    var layers = [{ d: backgroundD, slot: 1 }];
    motifPaths.forEach(function (d) { layers.push({ d: d, slot: 0 }); });
    return { slots: slotNames, layers: layers };
  }

  /* 장식 — 한 요소 안에 여러 색이 들어간다 (바깥 → 안쪽 순서로 색을 나눠 칠함) */
  var DECOR_FIGURES = {
    emblemCircle: layeredFigure(FIGURES.circle, [1, 0.72, 0.44]),
    emblemShield: layeredFigure(FIGURES.shield, [1, 0.72, 0.44]),
    emblemStar: layeredFigure(FIGURES.star5, [1, 0.7, 0.4]),
    emblemHeart: layeredFigure(FIGURES.heart, [1, 0.7, 0.4]),
    emblemDrop: layeredFigure(FIGURES.drop, [1, 0.7, 0.4]),
    emblemHex: layeredFigure(FIGURES.hexagon, [1, 0.72, 0.44]),
    emblemDiamond: layeredFigure(FIGURES.diamond, [1, 0.7, 0.4]),
    emblemRing: layeredFigure(FIGURES.ring, [1, 0.7]),
    sealMedal: layeredFigure(FIGURES.sealEdge, [1, 0.72, 0.44]),
    burstStar: layeredFigure(FIGURES.burst, [1, 0.62]),
    arrowTrio: layeredFigure(FIGURES.arrowBlock, [1, 0.68, 0.36]),
    chevronTrio: layeredFigure(FIGURES.chevronBlock, [1, 0.68, 0.36]),
    labelStack: {
      slots: ['위', '가운데', '아래'],
      layers: [
        { d: rectPath(2, 4, 20, 4.4), slot: 0 },
        { d: rectPath(2, 9.8, 20, 4.4), slot: 1 },
        { d: rectPath(2, 15.6, 20, 4.4), slot: 2 }
      ]
    },
    frameTriple: {
      slots: ['바깥', '가운데', '안쪽'],
      layers: [
        { d: rectPath(2, 2, 20, 20), slot: 0 },
        { d: rectPath(5, 5, 14, 14), slot: 1 },
        { d: rectPath(8.5, 8.5, 7, 7), slot: 2 }
      ]
    }
  };

  /* 무늬 — 채우기처럼 반복되는 결. 24×24 한 칸을 여백 없이 채운다 */
  var PATTERN_FIGURES = {
    patternStripesH: bandFigure(['줄', '바탕'], rectPath(0, 0, 24, 24), [
      rectPath(0, 2.5, 24, 3), rectPath(0, 8.5, 24, 3),
      rectPath(0, 14.5, 24, 3), rectPath(0, 20.5, 24, 3)
    ]),
    patternStripesV: bandFigure(['줄', '바탕'], rectPath(0, 0, 24, 24), [
      rectPath(2.5, 0, 3, 24), rectPath(8.5, 0, 3, 24),
      rectPath(14.5, 0, 3, 24), rectPath(20.5, 0, 3, 24)
    ]),
    patternStripesD: bandFigure(['줄', '바탕'], rectPath(0, 0, 24, 24),
      diagonalStripes(8, 3.4)),
    patternDots: bandFigure(['점', '바탕'], rectPath(0, 0, 24, 24),
      [[4, 4], [12, 4], [20, 4], [8, 12], [16, 12], [4, 20], [12, 20], [20, 20]]
        .map(function (pt) { return circlePath(pt[0], pt[1], 2.4); })),
    patternGrid: bandFigure(['선', '바탕'], rectPath(0, 0, 24, 24), (function () {
      var list = [];
      [1, 8, 15, 22].forEach(function (v) {
        list.push(rectPath(0, v - 0.5, 24, 1));
        list.push(rectPath(v - 0.5, 0, 1, 24));
      });
      return list;
    })()),
    patternChecks: bandFigure(['칸', '바탕'], rectPath(0, 0, 24, 24), (function () {
      var list = [];
      [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]].forEach(function (cell) {
        list.push(rectPath(cell[0] * 8, cell[1] * 8, 8, 8));
      });
      return list;
    })()),
    patternWaves: bandFigure(['물결', '바탕'], rectPath(0, 0, 24, 24), (function () {
      var list = [];
      [4, 12, 20].forEach(function (y) {
        [0, 6, 12, 18].forEach(function (x) { list.push(bumpPath(x, y, 3)); });
      });
      return list;
    })()),
    patternTriangles: bandFigure(['삼각', '바탕'], rectPath(0, 0, 24, 24), (function () {
      var list = [];
      [2, 13].forEach(function (y, row) {
        [1, 11].forEach(function (x, i) {
          if ((i + row) % 2 === 0) list.push(triangleD(x, y + 9, x + 5, y, x + 10, y + 9));
          else list.push(triangleD(x, y, x + 10, y, x + 5, y + 9));
        });
      });
      return list;
    })())
  };

  /* ==================================================== 일러스트 (그림)

     도형·아이콘과 달리 **부품마다 색이 미리 정해져 있는** 그림이다.
     잎은 초록, 기둥은 갈색처럼 자연스러운 배색을 그대로 쓰고, 넣은 뒤
     속성 패널에서 부품별로 색을 바꿀 수 있다. 48×48 기준으로 그린다. */

  function ellipsePath(cx, cy, rx, ry) {
    return 'M' + round1(cx - rx) + ' ' + round1(cy) +
      'a' + round1(rx) + ' ' + round1(ry) + ' 0 1 0 ' + round1(rx * 2) + ' 0' +
      'a' + round1(rx) + ' ' + round1(ry) + ' 0 1 0 ' + round1(-rx * 2) + ' 0z';
  }

  function roundRectPath(x, y, w, h, r) {
    if (!r) return rectPath(x, y, w, h);
    return 'M' + round1(x + r) + ' ' + round1(y) + 'h' + round1(w - 2 * r) +
      'a' + r + ' ' + r + ' 0 0 1 ' + r + ' ' + r + 'v' + round1(h - 2 * r) +
      'a' + r + ' ' + r + ' 0 0 1 ' + (-r) + ' ' + r + 'H' + round1(x + r) +
      'a' + r + ' ' + r + ' 0 0 1 ' + (-r) + ' ' + (-r) + 'V' + round1(y + r) +
      'a' + r + ' ' + r + ' 0 0 1 ' + r + ' ' + (-r) + 'z';
  }

  /** 중심에서 바깥으로 뻗는 삼각 광선 — 해 같은 그림에 쓴다 */
  function rayPaths(cx, cy, r1, r2, half, count) {
    var list = [];

    for (var i = 0; i < count; i++) {
      var angle = (Math.PI * 2 / count) * i - Math.PI / 2;
      list.push(polygonD([
        { x: cx + r1 * Math.cos(angle - half), y: cy + r1 * Math.sin(angle - half) },
        { x: cx + r2 * Math.cos(angle), y: cy + r2 * Math.sin(angle) },
        { x: cx + r1 * Math.cos(angle + half), y: cy + r1 * Math.sin(angle + half) }
      ]));
    }

    return list;
  }

  function part(d, slot) { return { d: d, slot: slot }; }
  function partsOf(list, slot) {
    return list.map(function (d) { return { d: d, slot: slot }; });
  }

  /** 고리 — 바깥 원과 안쪽 원을 반대 방향으로 그려 가운데를 뚫는다 */
  function ringPath(cx, cy, rOut, rIn) {
    return 'M' + round1(cx - rOut) + ' ' + round1(cy) +
      'a' + rOut + ' ' + rOut + ' 0 1 0 ' + round1(rOut * 2) + ' 0 ' +
      rOut + ' ' + rOut + ' 0 1 0 ' + round1(-rOut * 2) + ' 0z' +
      'M' + round1(cx - rIn) + ' ' + round1(cy) +
      'a' + rIn + ' ' + rIn + ' 0 1 1 ' + round1(rIn * 2) + ' 0 ' +
      rIn + ' ' + rIn + ' 0 1 1 ' + round1(-rIn * 2) + ' 0z';
  }

  /** 두 반지름 사이의 호 띠 — 무지개·소리 파동에 쓴다 (각도는 도) */
  function arcBandPath(cx, cy, rIn, rOut, a1, a2) {
    function pt(r, deg) {
      var a = deg * Math.PI / 180;
      return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
    }

    var o1 = pt(rOut, a1);
    var o2 = pt(rOut, a2);
    var i2 = pt(rIn, a2);
    var i1 = pt(rIn, a1);
    var large = Math.abs(a2 - a1) > 180 ? 1 : 0;

    return 'M' + round1(o1.x) + ' ' + round1(o1.y) +
      'A' + rOut + ' ' + rOut + ' 0 ' + large + ' 1 ' + round1(o2.x) + ' ' + round1(o2.y) +
      'L' + round1(i2.x) + ' ' + round1(i2.y) +
      'A' + rIn + ' ' + rIn + ' 0 ' + large + ' 0 ' + round1(i1.x) + ' ' + round1(i1.y) + 'z';
  }

  /** 지정한 자리에 그리는 별 (그림용) — 도형의 starPath 와 달리 위치를 받는다 */
  function starAt(cx, cy, points, outer, inner) {
    var pts = [];

    for (var i = 0; i < points * 2; i++) {
      var angle = (Math.PI / points) * i - Math.PI / 2;
      var radius = (i % 2 === 0) ? outer : inner;
      pts.push({ x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) });
    }

    return polygonD(pts);
  }

  /** 가운데가 뚫린 사각 테두리 — 바깥은 시계방향, 안쪽은 반대로 그어 구멍을 낸다 */
  function rectRingPath(x, y, w, h, t) {
    return 'M' + round1(x) + ' ' + round1(y) + 'h' + round1(w) + 'v' + round1(h) +
      'H' + round1(x) + 'z' +
      'M' + round1(x + t) + ' ' + round1(y + t) + 'v' + round1(h - 2 * t) +
      'h' + round1(w - 2 * t) + 'V' + round1(y + t) + 'z';
  }

  /** 지정한 자리·반지름의 정다각형 (그림용) */
  function polyAt(cx, cy, radius, sides, phaseDeg) {
    var pts = [];
    var start = (phaseDeg == null ? -90 : phaseDeg) * Math.PI / 180;

    for (var i = 0; i < sides; i++) {
      var angle = start + (Math.PI * 2 / sides) * i;
      pts.push({ x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) });
    }

    return polygonD(pts);
  }

  function sparkleAt(cx, cy, r) {
    return starAt(cx, cy, 4, r, r * 0.3);
  }

  /** 중심 둘레에 놓는 꽃잎 하나 (각도는 도) */
  function petalAt(cx, cy, r, deg) {
    var a = deg * Math.PI / 180;
    return circlePath(cx + r * Math.cos(a), cy + r * Math.sin(a), r * 0.58);
  }

  /** (x, y)에서 dir 방향(1=위, -1=아래)으로 뻗는 나뭇잎 */
  function leafAt(x, y, len, dir) {
    var h = len * 0.62;

    return 'M' + round1(x) + ' ' + round1(y) +
      'C' + round1(x + len * 0.22) + ' ' + round1(y - h * dir) +
      ' ' + round1(x + len * 0.78) + ' ' + round1(y - h * dir) +
      ' ' + round1(x + len) + ' ' + round1(y) +
      'C' + round1(x + len * 0.78) + ' ' + round1(y - h * 0.42 * dir) +
      ' ' + round1(x + len * 0.22) + ' ' + round1(y - h * 0.42 * dir) +
      ' ' + round1(x) + ' ' + round1(y) + 'z';
  }

  var ILLUSTRATIONS = {

    /* -------------------------------------------- 자연 · 계절 */
    illTree: {
      box: 48, slots: ['잎', '잎 그늘', '기둥', '땅'],
      colors: ['#4caf50', '#2e7d32', '#8d6e63', '#c8e6c9'],
      layers: [
        part(ellipsePath(24, 43, 18, 4), 3),
        part(roundRectPath(21, 22, 6, 18, 2), 2),
        part(circlePath(24, 17, 12), 0),
        part(circlePath(13, 23, 8), 0),
        part(circlePath(35, 23, 8), 0),
        part(circlePath(30, 22, 7), 1)
      ]
    },

    illFlower: {
      box: 48, slots: ['꽃잎', '꽃 가운데', '줄기', '잎'],
      colors: ['#f06292', '#ffca28', '#4caf50', '#81c784'],
      layers: [
        part(roundRectPath(23, 24, 2.4, 20, 1), 2),
        part(ellipsePath(16.5, 32, 7, 3.4), 3),
        part(ellipsePath(31.5, 37, 7, 3.4), 3)
      ].concat(partsOf([
        circlePath(24, 7.5, 5.4), circlePath(31.6, 11.6, 5.4), circlePath(31.6, 19.4, 5.4),
        circlePath(24, 23.5, 5.4), circlePath(16.4, 19.4, 5.4), circlePath(16.4, 11.6, 5.4)
      ], 0)).concat([
        part(circlePath(24, 15.5, 5), 1)
      ])
    },

    illSun: {
      box: 48, slots: ['해', '해 속', '빛'],
      colors: ['#ffca28', '#fff176', '#ffb300'],
      layers: partsOf(rayPaths(24, 24, 13, 21, 0.16, 8), 2).concat([
        part(circlePath(24, 24, 11), 0),
        part(circlePath(24, 24, 7), 1)
      ])
    },

    illRain: {
      box: 48, slots: ['구름', '구름 그늘', '빗방울'],
      colors: ['#e6ebef', '#ccd5db', '#4fc3f7'],
      layers: [
        part(circlePath(17, 18, 8), 0),
        part(circlePath(30, 18, 8), 0),
        part(circlePath(23.5, 14, 9), 0),
        part(roundRectPath(9, 17, 30, 9, 4.5), 0),
        part(ellipsePath(24, 23, 14, 2.8), 1),
        part(ellipsePath(16, 36, 2.2, 4), 2),
        part(ellipsePath(24, 39, 2.2, 4), 2),
        part(ellipsePath(32, 36, 2.2, 4), 2)
      ]
    },

    illMountain: {
      box: 48, slots: ['뒷산', '앞산', '눈', '해'],
      colors: ['#90a4ae', '#546e7a', '#ffffff', '#ffca28'],
      layers: [
        part(circlePath(37, 12, 5), 3),
        part(polygonD([{ x: 2, y: 40 }, { x: 17, y: 13 }, { x: 32, y: 40 }]), 0),
        part(polygonD([{ x: 12, y: 40 }, { x: 29, y: 16 }, { x: 46, y: 40 }]), 1),
        part(polygonD([
          { x: 14.5, y: 18.6 }, { x: 17, y: 13 }, { x: 19.5, y: 18.6 }, { x: 17, y: 16.5 }
        ]), 2),
        part(polygonD([
          { x: 26.5, y: 22.4 }, { x: 29, y: 16 }, { x: 31.5, y: 22.4 }, { x: 29, y: 20 }
        ]), 2)
      ]
    },

    /* -------------------------------------------- 업무 · 사무 */
    illLaptop: {
      box: 48, slots: ['화면', '화면 테두리', '받침', '손잡이'],
      colors: ['#42a5f5', '#263238', '#90a4ae', '#eceff1'],
      layers: [
        part(roundRectPath(9, 6, 30, 22, 2.5), 1),
        part(rectPath(11.5, 8.5, 25, 17), 0),
        part(polygonD([{ x: 4, y: 29 }, { x: 44, y: 29 }, { x: 47, y: 37 }, { x: 1, y: 37 }]), 2),
        part(roundRectPath(18, 31.5, 12, 2.4, 1.2), 3)
      ]
    },

    illDocument: {
      box: 48, slots: ['종이', '테두리 · 접힘', '글줄', '표시'],
      colors: ['#f8fafc', '#cbd5e1', '#94a3b8', '#3b82f6'],
      layers: [
        part(roundRectPath(9.5, 3.5, 29, 41, 3), 1),
        part(roundRectPath(11, 5, 26, 38, 2.5), 0),
        part(polygonD([{ x: 31, y: 5 }, { x: 37, y: 11 }, { x: 31, y: 11 }]), 1),
        part(roundRectPath(16, 16, 16, 2.4, 1.2), 2),
        part(roundRectPath(16, 22, 16, 2.4, 1.2), 2),
        part(roundRectPath(16, 28, 11, 2.4, 1.2), 2),
        part(roundRectPath(16, 34, 16, 4, 2), 3)
      ]
    },

    illCalendar: {
      box: 48, slots: ['본체', '머리띠', '고리 · 테두리', '날짜'],
      colors: ['#ffffff', '#ef5350', '#90a4ae', '#cfd8dc'],
      layers: [
        part(roundRectPath(6.5, 8.5, 35, 35, 4), 2),
        part(roundRectPath(8, 10, 32, 32, 3), 0),
        part(roundRectPath(8, 10, 32, 9, 3), 1),
        part(rectPath(8, 15, 32, 4), 1),
        part(roundRectPath(15, 6, 3.4, 7, 1.7), 2),
        part(roundRectPath(29.6, 6, 3.4, 7, 1.7), 2),
        part(roundRectPath(13, 24, 6, 5, 1), 3),
        part(roundRectPath(21, 24, 6, 5, 1), 3),
        part(roundRectPath(29, 24, 6, 5, 1), 3),
        part(roundRectPath(13, 32, 6, 5, 1), 3),
        part(roundRectPath(21, 32, 6, 5, 1), 3)
      ]
    },

    illChart: {
      box: 48, slots: ['화면', '테두리', '막대1', '막대2', '받침'],
      colors: ['#ffffff', '#37474f', '#42a5f5', '#66bb6a', '#90a4ae'],
      layers: [
        part(roundRectPath(5, 6, 38, 26, 3), 1),
        part(rectPath(7.5, 8.5, 33, 21), 0),
        part(roundRectPath(12, 21, 5, 6, 1), 2),
        part(roundRectPath(19, 17, 5, 10, 1), 2),
        part(roundRectPath(26, 13, 5, 14, 3), 3),
        part(rectPath(22, 32, 4, 6), 4),
        part(roundRectPath(13, 38, 22, 3.4, 1.7), 4)
      ]
    },

    illBriefcase: {
      box: 48, slots: ['가방', '손잡이', '잠금', '띠'],
      colors: ['#8d6e63', '#5d4037', '#ffca28', '#a1887f'],
      layers: [
        part(roundRectPath(17, 10, 14, 10, 3), 1),
        part(rectPath(21, 13, 6, 7), 0),
        part(roundRectPath(5, 19, 38, 22, 3), 0),
        part(rectPath(5, 27, 38, 3.4), 3),
        part(roundRectPath(20, 25.4, 8, 6, 1.6), 2)
      ]
    },

    /* -------------------------------------------- 생활 · 사물 */
    illHouse: {
      box: 48, slots: ['지붕', '벽', '문', '창', '굴뚝'],
      colors: ['#e57373', '#ffe0b2', '#8d6e63', '#4fc3f7', '#a1887f'],
      layers: [
        part(rectPath(32, 7, 5, 10), 4),
        part(rectPath(10, 21, 28, 21), 1),
        part(polygonD([{ x: 4, y: 22 }, { x: 24, y: 5 }, { x: 44, y: 22 }]), 0),
        part(roundRectPath(19, 30, 10, 12, 1.5), 2),
        part(roundRectPath(13, 25, 7, 6, 1), 3),
        part(roundRectPath(29, 25, 7, 6, 1), 3)
      ]
    },

    illGift: {
      box: 48, slots: ['상자', '뚜껑', '리본', '나비'],
      colors: ['#ef5350', '#e53935', '#ffca28', '#fdd835'],
      layers: [
        part(circlePath(17, 11.5, 5), 3),
        part(circlePath(31, 11.5, 5), 3),
        part(circlePath(24, 13, 3.4), 3),
        part(roundRectPath(8, 19, 32, 23, 2), 0),
        part(roundRectPath(6, 14, 36, 8, 2), 1),
        part(rectPath(21, 14, 6, 28), 2),
        part(rectPath(6, 24, 36, 6), 2)
      ]
    },

    illCar: {
      box: 48, slots: ['차체', '창', '바퀴', '휠'],
      colors: ['#42a5f5', '#b3e5fc', '#37474f', '#bdbdbd'],
      layers: [
        part(roundRectPath(12, 15, 22, 12, 4), 0),
        part(roundRectPath(4, 22, 40, 14, 4), 0),
        part(roundRectPath(14, 17.5, 7.5, 7.5, 1), 1),
        part(roundRectPath(23.5, 17.5, 8.5, 7.5, 1), 1),
        part(circlePath(13.5, 35, 5.4), 2),
        part(circlePath(34.5, 35, 5.4), 2),
        part(circlePath(13.5, 35, 2.2), 3),
        part(circlePath(34.5, 35, 2.2), 3)
      ]
    },

    illBook: {
      box: 48, slots: ['표지', '책등', '페이지', '제목'],
      colors: ['#5c6bc0', '#3f51b5', '#eceff1', '#ffca28'],
      layers: [
        part(roundRectPath(7, 7, 34, 34, 2.5), 0),
        part(roundRectPath(7, 7, 7, 34, 2.5), 1),
        part(roundRectPath(16, 10, 22, 28, 1.5), 2),
        part(roundRectPath(20, 15, 14, 3, 1.5), 3),
        part(roundRectPath(20, 21, 10, 2.2, 1.1), 1),
        part(roundRectPath(20, 26, 12, 2.2, 1.1), 1)
      ]
    },

    illPhone: {
      box: 48, slots: ['본체', '화면', '버튼'],
      colors: ['#37474f', '#4fc3f7', '#90a4ae'],
      layers: [
        part(roundRectPath(13, 4, 22, 40, 4.5), 0),
        part(rectPath(15.5, 8, 17, 26), 1),
        part(roundRectPath(19.5, 5.8, 9, 1.6, 0.8), 2),
        part(circlePath(24, 39, 2.6), 2)
      ]
    },

    /* -------------------------------------------- 사람 · 캐릭터 */
    illPerson: {
      box: 48, slots: ['피부', '머리', '옷', '넥타이', '바지'],
      colors: ['#ffcc80', '#4e342e', '#42a5f5', '#e53935', '#37474f'],
      layers: [
        part(roundRectPath(18.5, 33, 4, 11, 1), 4),
        part(roundRectPath(25.5, 33, 4, 11, 1), 4),
        part(roundRectPath(11.5, 21, 5, 13, 2.5), 2),
        part(roundRectPath(31.5, 21, 5, 13, 2.5), 2),
        part(roundRectPath(16.5, 19, 15, 16, 3), 2),
        part(roundRectPath(22.5, 20, 3.4, 12, 1), 3),
        part(rectPath(21.5, 18.5, 5, 3), 0),
        part(circlePath(24, 12.5, 8), 1),
        part(circlePath(24, 15, 7), 0)
      ]
    },

    illStudent: {
      box: 48, slots: ['피부', '머리', '옷', '가방'],
      colors: ['#ffcc80', '#3e2723', '#66bb6a', '#ef5350'],
      layers: [
        part(roundRectPath(18, 33, 4, 11, 1), 2),
        part(roundRectPath(26, 33, 4, 11, 1), 2),
        part(roundRectPath(30, 22, 12, 15, 3), 3),
        part(roundRectPath(13, 21, 5, 12, 2.5), 2),
        part(roundRectPath(31, 21, 5, 12, 2.5), 2),
        part(roundRectPath(17, 19, 14, 15, 3), 2),
        part(rectPath(21.5, 18.5, 5, 3), 0),
        part(circlePath(24, 12.5, 8), 1),
        part(circlePath(24, 15, 7), 0)
      ]
    },

    illFamily: {
      box: 48, slots: ['어른1 옷', '어른2 옷', '아이 옷', '피부', '머리'],
      colors: ['#5c6bc0', '#ef5350', '#66bb6a', '#ffcc80', '#4e342e'],
      layers: [
        part(roundRectPath(4, 33, 3.6, 11, 1), 0),
        part(roundRectPath(10.4, 33, 3.6, 11, 1), 0),
        part(roundRectPath(0.6, 21, 4.4, 13, 2.2), 0),
        part(roundRectPath(12.8, 21, 4.4, 13, 2.2), 0),
        part(roundRectPath(3.4, 19, 11, 16, 3), 0),
        part(circlePath(8.9, 12.5, 7.2), 4),
        part(circlePath(8.9, 15, 6.3), 3),

        part(roundRectPath(40.4, 33, 3.6, 11, 1), 1),
        part(roundRectPath(34.6, 33, 3.6, 11, 1), 1),
        part(roundRectPath(31.6, 21, 4.4, 13, 2.2), 1),
        part(roundRectPath(42.6, 21, 4.4, 13, 2.2), 1),
        part(roundRectPath(33.4, 19, 11, 16, 3), 1),
        part(circlePath(38.9, 12.5, 7.2), 4),
        part(circlePath(38.9, 15, 6.3), 3),

        part(roundRectPath(21.6, 37, 3, 7, 1), 2),
        part(roundRectPath(27.4, 37, 3, 7, 1), 2),
        part(roundRectPath(19.6, 28, 4, 10, 2), 2),
        part(roundRectPath(28.4, 28, 4, 10, 2), 2),
        part(roundRectPath(20.6, 27, 8.8, 12, 2.6), 2),
        part(circlePath(25, 21.5, 6), 4),
        part(circlePath(25, 23.4, 5.2), 3)
      ]
    },

    illDoctor: {
      box: 48, slots: ['피부', '머리', '가운', '명찰', '테두리 · 바지'],
      colors: ['#ffcc80', '#37474f', '#f0f4f8', '#42a5f5', '#cbd5e1'],
      layers: [
        part(roundRectPath(18.5, 33, 4, 11, 1), 4),
        part(roundRectPath(25.5, 33, 4, 11, 1), 4),
        part(roundRectPath(15.5, 18, 17, 18, 4), 4),
        part(roundRectPath(11.5, 21, 5, 13, 2.5), 2),
        part(roundRectPath(31.5, 21, 5, 13, 2.5), 2),
        part(roundRectPath(16.5, 19, 15, 16, 3), 2),
        part(roundRectPath(26.5, 24, 5, 4, 1.2), 3),
        part(rectPath(21.5, 18.5, 5, 3), 0),
        part(circlePath(24, 12.5, 8), 1),
        part(circlePath(24, 15, 7), 0)
      ]
    },

    illWorker: {
      box: 48, slots: ['피부', '안전모', '옷', '조끼', '머리'],
      colors: ['#ffcc80', '#ffca28', '#546e7a', '#ff7043', '#4e342e'],
      layers: [
        part(roundRectPath(18.5, 33, 4, 11, 1), 2),
        part(roundRectPath(25.5, 33, 4, 11, 1), 2),
        part(roundRectPath(11.5, 21, 5, 13, 2.5), 2),
        part(roundRectPath(31.5, 21, 5, 13, 2.5), 2),
        part(roundRectPath(16.5, 19, 15, 16, 3), 2),
        part(roundRectPath(18.5, 20, 11, 15, 2.5), 3),
        part(rectPath(21.5, 18.5, 5, 3), 0),
        part(circlePath(24, 13.5, 8), 4),
        part(circlePath(24, 15.5, 7), 0),
        part('M15 14.5a9 9 0 0 1 18 0z', 1),
        part(roundRectPath(13.5, 13.8, 21, 3.2, 1.6), 1)
      ]
    },

    /* -------------------------------------------- 자연 · 계절 (2) */
    illCloud: {
      box: 48, slots: ['구름', '구름 그늘'],
      colors: ['#eef2f6', '#ccd6de'],
      layers: [
        part(circlePath(16, 22, 9), 0),
        part(circlePath(31, 22, 9), 0),
        part(circlePath(23.5, 17, 10), 0),
        part(roundRectPath(7, 21, 34, 10, 5), 0),
        part(ellipsePath(24, 28, 16, 3), 1)
      ]
    },

    illRainbow: {
      box: 48, slots: ['빨강', '주황', '노랑', '초록', '구름'],
      colors: ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#f4f7fa'],
      layers: [
        part(arcBandPath(24, 42, 17, 21, 180, 360), 0),
        part(arcBandPath(24, 42, 13, 17, 180, 360), 1),
        part(arcBandPath(24, 42, 9, 13, 180, 360), 2),
        part(arcBandPath(24, 42, 5, 9, 180, 360), 3),
        part(circlePath(8, 38, 5), 4),
        part(circlePath(13, 39, 6), 4),
        part(roundRectPath(2, 37, 17, 7, 3.5), 4),
        part(circlePath(40, 38, 5), 4),
        part(circlePath(35, 39, 6), 4),
        part(roundRectPath(29, 37, 17, 7, 3.5), 4)
      ]
    },

    illMoon: {
      box: 48, slots: ['달', '별'],
      colors: ['#ffca28', '#fff176'],
      layers: [
        part('M42 25.58A18 18 0 1 1 22.42 6 14 14 0 0 0 42 25.58z', 0),
        part(sparkleAt(39, 12, 6), 1),
        part(sparkleAt(44, 24, 4), 1),
        part(sparkleAt(34, 6, 3.5), 1)
      ]
    },

    illLeaf: {
      box: 48, slots: ['잎', '잎맥', '줄기'],
      colors: ['#e2673a', '#b34a24', '#7a5230'],
      layers: [
        part('M24 5C37 13 37 31 24 43 11 31 11 13 24 5z', 0),
        part(roundRectPath(23.2, 10, 1.6, 28, 0.8), 1),
        part(roundRectPath(23.2, 40, 1.6, 7, 0.8), 2)
      ]
    },

    illSnowman: {
      box: 48, slots: ['몸', '그늘', '코', '목도리', '단추'],
      colors: ['#eef4f9', '#d7e3ee', '#f57c00', '#e53935', '#37474f'],
      layers: [
        part(ellipsePath(24, 44, 12, 2.6), 1),
        part(circlePath(24, 33, 11), 0),
        part(circlePath(24, 16, 8), 0),
        part(roundRectPath(16, 22, 16, 4, 2), 3),
        part(roundRectPath(28, 25, 5, 10, 2), 3),
        part(polygonD([{ x: 24, y: 16.5 }, { x: 31, y: 18.5 }, { x: 24, y: 20.5 }]), 2),
        part(circlePath(21, 13.5, 1.3), 4),
        part(circlePath(27, 13.5, 1.3), 4),
        part(circlePath(24, 29, 1.4), 4),
        part(circlePath(24, 35, 1.4), 4)
      ]
    },

    /* -------------------------------------------- 동물 */
    illDog: {
      box: 48, slots: ['얼굴', '귀', '주둥이', '코 · 눈', '혀'],
      colors: ['#e0b070', '#b9803f', '#f7ead8', '#3e2723', '#ef8a8a'],
      layers: [
        part(ellipsePath(11, 16, 5, 9), 1),
        part(ellipsePath(37, 16, 5, 9), 1),
        part(circlePath(24, 24, 14), 0),
        part(ellipsePath(24, 30, 9, 6.5), 2),
        part(roundRectPath(22.5, 33, 3.5, 4, 1.75), 4),
        part(ellipsePath(24, 26.5, 3, 2.2), 3),
        part(circlePath(18, 21, 1.8), 3),
        part(circlePath(30, 21, 1.8), 3)
      ]
    },

    illCat: {
      box: 48, slots: ['얼굴', '귀 안', '코 · 눈', '수염'],
      colors: ['#f0a860', '#f7cfa8', '#37474f', '#b0bec5'],
      layers: [
        part(polygonD([{ x: 8, y: 19 }, { x: 13, y: 4 }, { x: 25, y: 14 }]), 0),
        part(polygonD([{ x: 40, y: 19 }, { x: 35, y: 4 }, { x: 23, y: 14 }]), 0),
        part(polygonD([{ x: 12, y: 16.5 }, { x: 15, y: 8 }, { x: 21.5, y: 14 }]), 1),
        part(polygonD([{ x: 36, y: 16.5 }, { x: 33, y: 8 }, { x: 26.5, y: 14 }]), 1),
        part(circlePath(24, 26, 14), 0),
        part(circlePath(18, 23, 2), 2),
        part(circlePath(30, 23, 2), 2),
        part(polygonD([{ x: 22, y: 29 }, { x: 26, y: 29 }, { x: 24, y: 31.5 }]), 2),
        part(rectPath(2, 26.5, 11, 1), 3),
        part(rectPath(2, 30, 11, 1), 3),
        part(rectPath(35, 26.5, 11, 1), 3),
        part(rectPath(35, 30, 11, 1), 3)
      ]
    },

    illBird: {
      box: 48, slots: ['몸', '날개', '부리 · 다리', '눈'],
      colors: ['#4fc3f7', '#29a3d4', '#ffb300', '#263238'],
      layers: [
        part(polygonD([{ x: 9, y: 26 }, { x: 1, y: 18 }, { x: 3, y: 30 }, { x: 11, y: 32 }]), 0),
        part(ellipsePath(22, 28, 13, 10), 0),
        part(circlePath(33, 19, 8), 0),
        part(ellipsePath(18, 28, 7, 5.5), 1),
        part(polygonD([{ x: 40, y: 18 }, { x: 47, y: 21 }, { x: 40, y: 24 }]), 2),
        part(rectPath(20, 37, 1.8, 7), 2),
        part(rectPath(25, 37, 1.8, 7), 2),
        part(circlePath(34, 17, 1.4), 3)
      ]
    },

    illButterfly: {
      box: 48, slots: ['날개', '무늬', '몸'],
      colors: ['#ab47bc', '#f3e5f5', '#5e35b1'],
      layers: [
        part(ellipsePath(14, 18, 9, 11), 0),
        part(ellipsePath(34, 18, 9, 11), 0),
        part(ellipsePath(17, 34, 7, 8), 0),
        part(ellipsePath(31, 34, 7, 8), 0),
        part(circlePath(14, 18, 3), 1),
        part(circlePath(34, 18, 3), 1),
        part(roundRectPath(22.5, 12, 3, 27, 1.5), 2),
        part(polygonD([{ x: 22.5, y: 13 }, { x: 17, y: 5 }, { x: 18.5, y: 4 }, { x: 24, y: 11 }]), 2),
        part(polygonD([{ x: 25.5, y: 13 }, { x: 31, y: 5 }, { x: 29.5, y: 4 }, { x: 24, y: 11 }]), 2)
      ]
    },

    illFish: {
      box: 48, slots: ['몸', '지느러미', '눈', '아가미'],
      colors: ['#ffa726', '#fb8c00', '#263238', '#e65100'],
      layers: [
        part(polygonD([{ x: 6, y: 26 }, { x: 0, y: 17 }, { x: 0, y: 35 }]), 1),
        part(polygonD([{ x: 18, y: 17 }, { x: 24, y: 9 }, { x: 30, y: 18 }]), 1),
        part(polygonD([{ x: 18, y: 35 }, { x: 24, y: 43 }, { x: 29, y: 35 }]), 1),
        part(ellipsePath(22, 26, 15, 10), 0),
        part(roundRectPath(25.5, 18, 1.6, 16, 0.8), 3),
        part(circlePath(31, 23, 2.4), 2)
      ]
    },

    /* -------------------------------------------- 음식 */
    illApple: {
      box: 48, slots: ['사과', '잎', '꼭지', '하이라이트'],
      colors: ['#e53935', '#66bb6a', '#6d4c41', '#ffcdd2'],
      layers: [
        part(roundRectPath(23.4, 9, 2.4, 9, 1.2), 2),
        part(ellipsePath(31, 12, 6.5, 3.5), 1),
        part(circlePath(19, 28, 12), 0),
        part(circlePath(29, 28, 12), 0),
        part(ellipsePath(17, 22, 3, 5), 3)
      ]
    },

    illCoffee: {
      box: 48, slots: ['컵', '커피', '받침', '김'],
      colors: ['#e2e9ef', '#6d4c41', '#cfd8dc', '#aab6bf'],
      layers: [
        part(ellipsePath(22, 42, 15, 2.6), 2),
        part(ringPath(37, 26, 7, 4.2), 0),
        part(polygonD([{ x: 10, y: 18 }, { x: 34, y: 18 }, { x: 31, y: 38 }, { x: 13, y: 38 }]), 0),
        part(ellipsePath(22, 18, 12, 3.4), 1),
        part(roundRectPath(15, 5, 2.4, 9, 1.2), 3),
        part(roundRectPath(22, 2, 2.4, 11, 1.2), 3),
        part(roundRectPath(29, 6, 2.4, 8, 1.2), 3)
      ]
    },

    illCake: {
      box: 48, slots: ['크림', '시트', '초', '접시', '불꽃'],
      colors: ['#f8bbd0', '#d7a06a', '#ef5350', '#eceff1', '#ffca28'],
      layers: [
        part(ellipsePath(24, 43, 17, 2.6), 3),
        part(roundRectPath(8, 31, 32, 11, 2), 1),
        part(roundRectPath(11, 22, 26, 10, 2), 1),
        part(roundRectPath(10, 19, 28, 5, 2.5), 0),
        part(circlePath(14, 24, 2.4), 0),
        part(circlePath(20, 25, 2.4), 0),
        part(circlePath(28, 25, 2.4), 0),
        part(circlePath(34, 24, 2.4), 0),
        part(roundRectPath(22.6, 11, 2.8, 9, 1.4), 2),
        part(ellipsePath(24, 8, 2, 3), 4)
      ]
    },

    illBread: {
      box: 48, slots: ['빵', '윗면', '칼집'],
      colors: ['#e0a86a', '#c98a4b', '#a86b33'],
      layers: [
        part(roundRectPath(5, 22, 38, 19, 8), 0),
        part(ellipsePath(24, 22, 19, 7), 1),
        part(roundRectPath(14, 18, 8, 2.4, 1.2), 2),
        part(roundRectPath(24, 16, 8, 2.4, 1.2), 2),
        part(roundRectPath(20, 24, 10, 2.4, 1.2), 2)
      ]
    },

    illIcecream: {
      box: 48, slots: ['콘', '아이스크림', '체리', '시럽'],
      colors: ['#d9a05b', '#f8bbd0', '#e53935', '#ce93d8'],
      layers: [
        part(circlePath(24, 8, 4.5), 2),
        part(circlePath(18, 19, 9), 1),
        part(circlePath(30, 19, 9), 1),
        part(ellipsePath(24, 24, 9, 4), 3),
        part(polygonD([{ x: 13, y: 22 }, { x: 35, y: 22 }, { x: 24, y: 45 }]), 0)
      ]
    },

    /* -------------------------------------------- 업무 · 사무 (2) */
    illDesktop: {
      box: 48, slots: ['화면', '테두리', '받침', '화면 표시'],
      colors: ['#42a5f5', '#263238', '#90a4ae', '#e3f2fd'],
      layers: [
        part(roundRectPath(5, 7, 38, 25, 2.5), 1),
        part(rectPath(7.5, 9.5, 33, 20), 0),
        part(roundRectPath(11, 14, 11, 3, 1.5), 3),
        part(roundRectPath(11, 20, 20, 3, 1.5), 3),
        part(rectPath(22, 32, 4, 5), 2),
        part(roundRectPath(16, 37, 16, 3, 1.5), 2)
      ]
    },

    illFolder: {
      box: 48, slots: ['폴더', '앞장', '서류'],
      colors: ['#ffca28', '#ffb300', '#fafafa'],
      layers: [
        part(polygonD([{ x: 3, y: 12 }, { x: 18, y: 12 }, { x: 21, y: 17 },
          { x: 45, y: 17 }, { x: 45, y: 42 }, { x: 3, y: 42 }]), 0),
        part(rectPath(10, 10, 28, 26), 2),
        part(polygonD([{ x: 3, y: 22 }, { x: 45, y: 22 }, { x: 45, y: 42 }, { x: 3, y: 42 }]), 1)
      ]
    },

    illCalculator: {
      box: 48, slots: ['몸', '화면', '버튼', '숫자'],
      colors: ['#546e7a', '#cfd8dc', '#eceff1', '#ffb300'],
      layers: [
        part(roundRectPath(8, 4, 32, 40, 3), 0),
        part(roundRectPath(12, 8, 24, 8, 1.5), 1),
        part(roundRectPath(13, 20, 5, 4, 1), 2),
        part(roundRectPath(21.5, 20, 5, 4, 1), 2),
        part(roundRectPath(30, 20, 5, 4, 1), 2),
        part(roundRectPath(13, 27, 5, 4, 1), 2),
        part(roundRectPath(21.5, 27, 5, 4, 1), 2),
        part(roundRectPath(30, 27, 5, 4, 1), 3),
        part(roundRectPath(13, 34, 5, 4, 1), 2),
        part(roundRectPath(21.5, 34, 5, 4, 1), 2),
        part(roundRectPath(30, 34, 5, 4, 1), 3)
      ]
    },

    illSearch: {
      box: 48, slots: ['유리', '테두리', '손잡이', '반짝'],
      colors: ['#bbdefb', '#546e7a', '#37474f', '#ffffff'],
      layers: [
        part(circlePath(20, 20, 13), 0),
        part(ringPath(20, 20, 13, 10.6), 1),
        part(polygonD([{ x: 28, y: 28 }, { x: 41, y: 41 }, { x: 38.5, y: 43.5 },
          { x: 25.5, y: 30.5 }]), 2),
        part(ellipsePath(15, 15, 3, 4.5), 3)
      ]
    },

    illClock: {
      box: 48, slots: ['테두리', '판', '바늘', '눈금'],
      colors: ['#42a5f5', '#ffffff', '#37474f', '#90a4ae'],
      layers: [
        part(circlePath(24, 24, 19), 0),
        part(circlePath(24, 24, 15.5), 1),
        part(rectPath(23, 9, 2, 4), 3),
        part(rectPath(23, 35, 2, 4), 3),
        part(rectPath(9, 23, 4, 2), 3),
        part(rectPath(35, 23, 4, 2), 3),
        part(roundRectPath(23, 13, 2, 12, 1), 2),
        part(roundRectPath(24, 23, 9, 2, 1), 2),
        part(circlePath(24, 24, 1.8), 2)
      ]
    },

    /* -------------------------------------------- 생활 · 교통 */
    illUmbrella: {
      box: 48, slots: ['천', '천 그늘', '손잡이', '꼭대기'],
      colors: ['#42a5f5', '#1e88e5', '#8d6e63', '#e53935'],
      layers: [
        part('M4 27a20 20 0 0 1 40 0z', 0),
        part(roundRectPath(4, 24.5, 40, 3, 1.5), 1),
        part(rectPath(23, 27, 2, 13), 2),
        part(roundRectPath(17, 40, 8, 2.4, 1.2), 2),
        part(circlePath(24, 5, 2), 3)
      ]
    },

    illBag: {
      box: 48, slots: ['가방', '손잡이', '무늬'],
      colors: ['#ef5350', '#b71c1c', '#ffca28'],
      layers: [
        part(ringPath(24, 16, 9, 6.4), 1),
        part(polygonD([{ x: 8, y: 16 }, { x: 40, y: 16 }, { x: 43, y: 43 }, { x: 5, y: 43 }]), 0),
        part(circlePath(24, 30, 5), 2)
      ]
    },

    illKey: {
      box: 48, slots: ['열쇠', '하이라이트'],
      colors: ['#f9a825', '#ffe082'],
      layers: [
        part(ringPath(14, 24, 9.5, 5.5), 0),
        part(rectPath(22, 22.5, 21, 5), 0),
        part(rectPath(36, 27.5, 3, 6), 0),
        part(rectPath(30, 27.5, 3, 4.5), 0),
        part(roundRectPath(24, 23.6, 9, 1.6, 0.8), 1)
      ]
    },

    illBicycle: {
      box: 48, slots: ['바퀴', '프레임', '안장', '핸들'],
      colors: ['#37474f', '#42a5f5', '#8d6e63', '#546e7a'],
      layers: [
        part(ringPath(13, 33, 8.5, 6.7), 0),
        part(ringPath(35, 33, 8.5, 6.7), 0),
        part(polygonD([{ x: 12, y: 33 }, { x: 20, y: 19 }, { x: 22.5, y: 20 },
          { x: 14.5, y: 34 }]), 1),
        part(polygonD([{ x: 20, y: 20 }, { x: 26, y: 33 }, { x: 23, y: 33 },
          { x: 17.5, y: 21 }]), 1),
        part(polygonD([{ x: 24, y: 32 }, { x: 35, y: 30 }, { x: 35.5, y: 33 },
          { x: 24.5, y: 35 }]), 1),
        part(roundRectPath(15, 16, 11, 3, 1.5), 2),
        part(roundRectPath(32, 14, 9, 2.6, 1.3), 3),
        part(polygonD([{ x: 35, y: 16 }, { x: 37, y: 16 }, { x: 36, y: 22 }, { x: 34, y: 22 }]), 3)
      ]
    },

    illBus: {
      box: 48, slots: ['차체', '창', '바퀴', '문'],
      colors: ['#42a5f5', '#e3f2fd', '#37474f', '#cfd8dc'],
      layers: [
        part(roundRectPath(4, 8, 40, 28, 4), 0),
        part(roundRectPath(8, 12, 9, 9, 1), 1),
        part(roundRectPath(19, 12, 9, 9, 1), 1),
        part(roundRectPath(30, 12, 10, 18, 1), 3),
        part(circlePath(13, 37, 4.6), 2),
        part(circlePath(35, 37, 4.6), 2)
      ]
    },

    /* -------------------------------------------- 행정 · 공공 */
    illGov: {
      box: 48, slots: ['지붕', '기둥', '바닥', '문양'],
      colors: ['#90a4ae', '#cfd8dc', '#78909c', '#c62828'],
      layers: [
        part(polygonD([{ x: 24, y: 3 }, { x: 46, y: 15 }, { x: 2, y: 15 }]), 0),
        part(rectPath(4, 15, 40, 4), 0),
        part(rectPath(8, 19, 4, 18), 1),
        part(rectPath(17, 19, 4, 18), 1),
        part(rectPath(27, 19, 4, 18), 1),
        part(rectPath(36, 19, 4, 18), 1),
        part(rectPath(2, 37, 44, 5), 2),
        part(circlePath(24, 28, 4.5), 3)
      ]
    },

    illStamp: {
      box: 48, slots: ['손잡이', '도장', '별'],
      colors: ['#8d6e63', '#c62828', '#ffe0e0'],
      layers: [
        part(roundRectPath(17, 3, 14, 4, 2), 0),
        part(polygonD([{ x: 19, y: 7 }, { x: 29, y: 7 }, { x: 31, y: 14 }, { x: 17, y: 14 }]), 0),
        part(ringPath(24, 30, 13, 10.5), 1),
        part(circlePath(24, 30, 10), 1),
        part(starAt(24, 30, 5, 6.5, 2.9), 2)
      ]
    },

    illVote: {
      box: 48, slots: ['상자', '투표지', '입구', '표'],
      colors: ['#42a5f5', '#e8eef4', '#1e88e5', '#ffca28'],
      layers: [
        part(roundRectPath(18, 4, 12, 18, 1.5), 1),
        part(roundRectPath(6, 20, 36, 23, 3), 0),
        part(rectPath(14, 22, 20, 3.4), 2),
        part(starAt(24, 12, 5, 5, 2.2), 3)
      ]
    },

    illSpeaker: {
      box: 48, slots: ['확성기', '소리', '손잡이'],
      colors: ['#ef5350', '#ffca28', '#8d6e63'],
      layers: [
        part(polygonD([{ x: 7, y: 17 }, { x: 30, y: 7 }, { x: 30, y: 41 }, { x: 7, y: 31 }]), 0),
        part(ellipsePath(30, 24, 4, 17), 0),
        part(roundRectPath(12, 30, 6, 11, 2), 2),
        part(arcBandPath(34, 24, 7, 8.6, -55, 55), 1),
        part(arcBandPath(34, 24, 12, 13.6, -55, 55), 1)
      ]
    },

    /* -------------------------------------------- 사람 · 캐릭터 (2) */
    illChef: {
      box: 48, slots: ['피부', '머리', '옷', '앞치마', '모자'],
      colors: ['#ffcc80', '#4e342e', '#cfd9e2', '#ffffff', '#e6edf4'],
      layers: [
        part(roundRectPath(18.5, 33, 4, 11, 1), 2),
        part(roundRectPath(25.5, 33, 4, 11, 1), 2),
        part(roundRectPath(11.5, 21, 5, 13, 2.5), 2),
        part(roundRectPath(31.5, 21, 5, 13, 2.5), 2),
        part(roundRectPath(16.5, 19, 15, 16, 3), 2),
        part(roundRectPath(19, 22, 10, 15, 2), 3),
        part(circlePath(24, 11, 7), 4),
        part(circlePath(16.5, 12, 4.5), 4),
        part(circlePath(31.5, 12, 4.5), 4),
        part(rectPath(21.5, 18.5, 5, 3), 0),
        part(circlePath(24, 12.5, 8), 1),
        part(circlePath(24, 15, 7), 0),
        part(roundRectPath(16, 14.5, 16, 4, 2), 2)
      ]
    },

    illSenior: {
      box: 48, slots: ['피부', '머리', '옷', '안경', '지팡이'],
      colors: ['#ffcc80', '#e0e0e0', '#7986cb', '#37474f', '#8d6e63'],
      layers: [
        part(roundRectPath(18.5, 33, 4, 11, 1), 2),
        part(roundRectPath(25.5, 33, 4, 11, 1), 2),
        part(roundRectPath(11.5, 21, 5, 13, 2.5), 2),
        part(roundRectPath(31.5, 21, 5, 13, 2.5), 2),
        part(roundRectPath(16.5, 19, 15, 16, 3), 2),
        part(roundRectPath(38, 18, 2.4, 26, 1.2), 4),
        part(ringPath(39, 17, 5, 3.2), 4),
        part(rectPath(21.5, 18.5, 5, 3), 0),
        part(circlePath(24, 12.5, 8), 1),
        part(circlePath(24, 15, 7), 0),
        part(ringPath(20.5, 15.5, 3.4, 2.2), 3),
        part(ringPath(27.5, 15.5, 3.4, 2.2), 3),
        part(rectPath(23, 15, 2, 1.2), 3)
      ]
    },

    illNote: {
      box: 48, slots: ['머리', '기둥', '깃', '빛'],
      colors: ['#5c6bc0', '#3f51b5', '#283593', '#c5cae9'],
      layers: [
        part('M27.6 8h4v24H27.6z', 1),
        part('M31.6 8L41 14L41 20.6L31.6 14.6z', 2),
        part('M11 32a9 6.8 0 1 0 18 0a9 6.8 0 1 0 -18 0z', 0),
        part('M14.5 30a3 2.2 0 1 0 6 0a3 2.2 0 1 0 -6 0z', 3)
      ]
    },

    illNoteDouble: {
      box: 48, slots: ['머리', '기둥', '빔', '빛'],
      colors: ['#26a69a', '#00897b', '#00695c', '#b2dfdb'],
      layers: [
        part('M15.6 9h3.6v23H15.6z', 1),
        part('M33.6 9h3.6v23H33.6z', 1),
        part('M15.6 9L37.2 6.5L37.2 13L15.6 15.5z', 2),
        part('M4.5 32a7.5 5.8 0 1 0 15 0a7.5 5.8 0 1 0 -15 0z', 0),
        part('M22.5 32a7.5 5.8 0 1 0 15 0a7.5 5.8 0 1 0 -15 0z', 0)
      ]
    },

    illGuitar: {
      box: 48, slots: ['몸통', '구멍', '넥', '머리'],
      colors: ['#d9a15b', '#4e342e', '#8d6e63', '#5d4037'],
      layers: [
        part('M28 14L39 4.5L41.5 7L30.5 16.5z', 2),
        part('M39 4.5L44.5 1L46 3L41.5 7z', 3),
        part('M8.5 34a12.5 12.5 0 1 0 25 0a12.5 12.5 0 1 0 -25 0z', 0),
        part('M12.2 20a8.8 8.8 0 1 0 17.6 0a8.8 8.8 0 1 0 -17.6 0z', 0),
        part('M16 36h10v2.2H16z', 2),
        part('M16.6 29a4.4 4.4 0 1 0 8.8 0a4.4 4.4 0 1 0 -8.8 0z', 1)
      ]
    },

    illMic: {
      box: 48, slots: ['헤드', '그릴', '손잡이', '테'],
      colors: ['#607d8b', '#cfd8dc', '#455a64', '#37474f'],
      layers: [
        part('M18.5 24L29.5 24L32 41.5L16 41.5z', 2),
        part('M13 17a11 11 0 1 0 22 0a11 11 0 1 0 -22 0z', 0),
        part('M16.3 12h15.4a0.8 0.8 0 0 1 0.8 0.8v0a0.8 0.8 0 0 1 -0.8 0.8H16.3a0.8 0.8 0 0 1 -0.8 -0.8V12.8a0.8 0.8 0 0 1 0.8 -0.8z', 1),
        part('M14.8 17h18.4a0.8 0.8 0 0 1 0.8 0.8v0a0.8 0.8 0 0 1 -0.8 0.8H14.8a0.8 0.8 0 0 1 -0.8 -0.8V17.8a0.8 0.8 0 0 1 0.8 -0.8z', 1),
        part('M16.3 22h15.4a0.8 0.8 0 0 1 0.8 0.8v0a0.8 0.8 0 0 1 -0.8 0.8H16.3a0.8 0.8 0 0 1 -0.8 -0.8V22.8a0.8 0.8 0 0 1 0.8 -0.8z', 1),
        part('M17.6 31h12.8v2.6H17.6z', 3)
      ]
    },

    illPiano: {
      box: 48, slots: ['흰건반', '검은건반', '테'],
      colors: ['#fafafa', '#212121', '#455a64'],
      layers: [
        part('M5 12h38a2 2 0 0 1 2 2v20a2 2 0 0 1 -2 2H5a2 2 0 0 1 -2 -2V14a2 2 0 0 1 2 -2z', 2),
        part('M5.2 14h5v20H5.2z', 0),
        part('M10.6 14h5v20H10.6z', 0),
        part('M16 14h5v20H16z', 0),
        part('M21.4 14h5v20H21.4z', 0),
        part('M26.8 14h5v20H26.8z', 0),
        part('M32.2 14h5v20H32.2z', 0),
        part('M37.6 14h5v20H37.6z', 0),
        part('M9.1 14h3v12H9.1z', 1),
        part('M14.5 14h3v12H14.5z', 1),
        part('M25.3 14h3v12H25.3z', 1),
        part('M30.7 14h3v12H30.7z', 1),
        part('M36.1 14h3v12H36.1z', 1)
      ]
    },

    illHeadphone: {
      box: 48, slots: ['밴드', '이어컵', '쿠션'],
      colors: ['#37474f', '#546e7a', '#90a4ae'],
      layers: [
        part('M3 24A21 21 0 0 1 45 24L41 24A17 17 0 0 0 7 24z', 0),
        part('M6.4 22h1.2a3.4 3.4 0 0 1 3.4 3.4v9.2a3.4 3.4 0 0 1 -3.4 3.4H6.4a3.4 3.4 0 0 1 -3.4 -3.4V25.4a3.4 3.4 0 0 1 3.4 -3.4z', 1),
        part('M40.4 22h1.2a3.4 3.4 0 0 1 3.4 3.4v9.2a3.4 3.4 0 0 1 -3.4 3.4H40.4a3.4 3.4 0 0 1 -3.4 -3.4V25.4a3.4 3.4 0 0 1 3.4 -3.4z', 1),
        part('M11.6 25h0.2a1.6 1.6 0 0 1 1.6 1.6v6.8a1.6 1.6 0 0 1 -1.6 1.6H11.6a1.6 1.6 0 0 1 -1.6 -1.6V26.6a1.6 1.6 0 0 1 1.6 -1.6z', 2),
        part('M36.2 25h0.2a1.6 1.6 0 0 1 1.6 1.6v6.8a1.6 1.6 0 0 1 -1.6 1.6H36.2a1.6 1.6 0 0 1 -1.6 -1.6V26.6a1.6 1.6 0 0 1 1.6 -1.6z', 2)
      ]
    },

    illTrumpet: {
      box: 48, slots: ['관', '밸브', '나팔', '입구'],
      colors: ['#ffca28', '#f9a825', '#fff59d', '#f57f17'],
      layers: [
        part('M34 15L44.5 11.5L44.5 36.5L34 33z', 2),
        part('M8 22h26v4H8z', 0),
        part('M4 21h5v6H4z', 3),
        part('M14 15h3.4v8H14z', 1),
        part('M20 15h3.4v8H20z', 1),
        part('M26 15h3.4v8H26z', 1),
        part('M13.3 14a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0z', 1),
        part('M19.3 14a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0z', 1),
        part('M25.3 14a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0z', 1)
      ]
    },

    illViolin: {
      box: 48, slots: ['몸통', '몸통 그늘', '넥', '머리', '현'],
      colors: ['#c8874f', '#a86b38', '#8d6e63', '#5d4037', '#f5f5f5'],
      layers: [
        part('M26.5 12L36 2.5L38.5 5L29 14.5z', 2),
        part('M33.6 5.5a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0z', 3),
        part('M12 17a9 9 0 1 0 18 0a9 9 0 1 0 -18 0z', 0),
        part('M9.5 35a11.5 11.5 0 1 0 23 0a11.5 11.5 0 1 0 -23 0z', 0),
        part('M14.6 30a1.4 5.4 0 1 0 2.8 0a1.4 5.4 0 1 0 -2.8 0z', 3),
        part('M24.6 30a1.4 5.4 0 1 0 2.8 0a1.4 5.4 0 1 0 -2.8 0z', 3),
        part('M19.6 41.5h2.8v4.6H19.6z', 3),
        part('M20.5 13h1v21H20.5z', 4)
      ]
    },

    illClipboard: {
      box: 48, slots: ['판', '클립', '종이', '줄'],
      colors: ['#8d6e63', '#b0bec5', '#ffffff', '#90a4ae'],
      layers: [
        part('M10 5h28a3 3 0 0 1 3 3v34a3 3 0 0 1 -3 3H10a3 3 0 0 1 -3 -3V8a3 3 0 0 1 3 -3z', 0),
        part('M12 10h24a2 2 0 0 1 2 2v28a2 2 0 0 1 -2 2H12a2 2 0 0 1 -2 -2V12a2 2 0 0 1 2 -2z', 2),
        part('M14 16h20v2H14z', 3),
        part('M14 22h20v2H14z', 3),
        part('M14 28h13v2H14z', 3),
        part('M14 34h17v2H14z', 3),
        part('M19 2h10a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2H19a2 2 0 0 1 -2 -2V4a2 2 0 0 1 2 -2z', 1)
      ]
    },

    illPushpin: {
      box: 48, slots: ['머리', '머리 그늘', '바늘', '빛'],
      colors: ['#e53935', '#b71c1c', '#90a4ae', '#ef9a9a'],
      layers: [
        part('M22.4 28L25.6 28L24 46z', 2),
        part('M9 20a11 11 0 0 0 22 0z', 1),
        part('M9 18a11 11 0 1 0 22 0a11 11 0 1 0 -22 0z', 0),
        part('M12 14a4 2.8 0 1 0 8 0a4 2.8 0 1 0 -8 0z', 3)
      ]
    },

    illStapler: {
      box: 48, slots: ['몸통', '손잡이', '받침'],
      colors: ['#546e7a', '#37474f', '#90a4ae'],
      layers: [
        part('M6 30L42 30L42 36L6 36z', 0),
        part('M8 24L40 18L40 24L8 30z', 1),
        part('M5 36L43 36L43 42L5 42z', 2),
        part('M37 27a3 3 0 1 0 6 0a3 3 0 1 0 -6 0z', 2),
        part('M12 33h20v1.6H12z', 1)
      ]
    },

    illScissors: {
      box: 48, slots: ['칼날', '칼날2', '손잡이', '나사'],
      colors: ['#b0bec5', '#90a4ae', '#e53935', '#455a64'],
      layers: [
        part('M13 38.5L16.8 34L45 6L42 4z', 1),
        part('M13 9.5L16.8 14L45 42L42 44z', 0),
        part('M2.5 13a7 7 0 1 0 14 0 7 7 0 1 0 -14 0zM5.9 13a3.6 3.6 0 1 1 7.2 0 3.6 3.6 0 1 1 -7.2 0z', 2),
        part('M2.5 35a7 7 0 1 0 14 0 7 7 0 1 0 -14 0zM5.9 35a3.6 3.6 0 1 1 7.2 0 3.6 3.6 0 1 1 -7.2 0z', 2),
        part('M23.7 24a2.8 2.8 0 1 0 5.6 0a2.8 2.8 0 1 0 -5.6 0z', 3)
      ]
    },

    illTape: {
      box: 48, slots: ['롤', '롤 그늘', '끈', '구멍'],
      colors: ['#ffca28', '#f9a825', '#ffecb3', '#fff8e1'],
      layers: [
        part('M34 20L46 22L46 31L34 29z', 2),
        part('M6 23a15 15 0 1 0 30 0 15 15 0 1 0 -30 0zM14 23a7 7 0 1 1 14 0 7 7 0 1 1 -14 0z', 0),
        part('M7.09 19.27A14.4 14.4 0 0 1 18.01 8.91L18.8 12.63A10.6 10.6 0 0 0 10.76 20.26z', 1),
        part('M14 23a7 7 0 1 0 14 0a7 7 0 1 0 -14 0z', 3)
      ]
    },

    illPen: {
      box: 48, slots: ['몸통', '뚜껑', '펜촉', '클립'],
      colors: ['#1e88e5', '#1565c0', '#cfd8dc', '#90a4ae'],
      layers: [
        part('M17 36L27 36L22 46z', 2),
        part('M19 8h6a2 2 0 0 1 2 2v24a2 2 0 0 1 -2 2H19a2 2 0 0 1 -2 -2V10a2 2 0 0 1 2 -2z', 0),
        part('M17 29h10v3H17z', 1),
        part('M27 9L36.5 9L36.5 12.4L27 12.4z', 3),
        part('M27 12.4h3v5H27z', 3)
      ]
    },

    illPaperclip: {
      box: 48, slots: ['바깥', '가운데', '안쪽'],
      colors: ['#90a4ae', '#cfd8dc', '#607d8b'],
      layers: [
        part('M24 5h0a12 12 0 0 1 12 12v14a12 12 0 0 1 -12 12H24a12 12 0 0 1 -12 -12V17a12 12 0 0 1 12 -12zM24 8a9 9 0 0 0 -9 9v14a9 9 0 0 0 9 9h0a9 9 0 0 0 9 -9V17a9 9 0 0 0 -9 -9z', 0),
        part('M24 10h0a8 8 0 0 1 8 8v14a8 8 0 0 1 -8 8H24a8 8 0 0 1 -8 -8V18a8 8 0 0 1 8 -8zM24 12.6a5.4 5.4 0 0 0 -5.4 5.4v14a5.4 5.4 0 0 0 5.4 5.4h0a5.4 5.4 0 0 0 5.4 -5.4V18a5.4 5.4 0 0 0 -5.4 -5.4z', 1),
        part('M24.1 15h0a4.5 4.5 0 0 1 4.5 4.5v13a4.5 4.5 0 0 1 -4.5 4.5H24.1a4.5 4.5 0 0 1 -4.5 -4.5V19.5a4.5 4.5 0 0 1 4.5 -4.5zM24.1 17.4a2.1 2.1 0 0 0 -2.1 2.1v13a2.1 2.1 0 0 0 2.1 2.1h0a2.1 2.1 0 0 0 2.1 -2.1V19.5a2.1 2.1 0 0 0 -2.1 -2.1z', 2)
      ]
    },

    illChartPie: {
      box: 48, slots: ['1', '2', '3', '바탕'],
      colors: ['#1e88e5', '#43a047', '#ffca28', '#eceff1'],
      layers: [
        part('M7 25a16 16 0 1 0 32 0a16 16 0 1 0 -32 0z', 3),
        part('M23 25L23 9L24.37 9.06L25.73 9.24L27.07 9.53L28.38 9.93L29.66 10.45L30.88 11.07L32.04 11.8L33.14 12.62L34.16 13.54L35.11 14.54L35.96 15.61L36.71 16.76L37.37 17.97L37.92 19.22L38.36 20.52L38.69 21.86L38.9 23.21L38.99 24.58L38.97 25.95L38.83 27.32L38.57 28.67L38.2 29.99L37.72 31.27L37.13 32.51z', 0),
        part('M23 25L36.57 33.48L35.79 34.61L34.92 35.67L33.96 36.65L32.92 37.55L31.81 38.36L30.63 39.06L29.4 39.66L28.12 40.16L26.8 40.54L25.46 40.81L24.09 40.96L22.72 41L21.35 40.91L19.99 40.71L18.66 40.4L17.35 39.97L16.09 39.43L14.88 38.79L13.73 38.04L12.64 37.2L11.64 36.26L10.71 35.25L9.88 34.16L9.14 33z', 1),
        part('M23 25L8.62 32.01L8.09 30.8L7.66 29.54L7.34 28.26L7.12 26.95L7.01 25.63L7.02 24.3L7.13 22.98L7.35 21.67L7.68 20.39L8.11 19.14L8.65 17.92L9.29 16.76L10.01 15.65L10.83 14.61L11.74 13.64L12.72 12.74L13.77 11.93L14.88 11.21L16.05 10.59L17.27 10.06L18.52 9.64L19.81 9.32L21.12 9.11L22.44 9.01z', 2)
      ]
    },

    illPaw: {
      box: 48, slots: ['발바닥', '발가락'],
      colors: ['#8d6e63', '#6d4c41'],
      layers: [
        part('M13 34a11 9.5 0 1 0 22 0a11 9.5 0 1 0 -22 0z', 0),
        part('M6.9 22a4.6 4.6 0 1 0 9.2 0a4.6 4.6 0 1 0 -9.2 0z', 1),
        part('M13.9 14a4.6 4.6 0 1 0 9.2 0a4.6 4.6 0 1 0 -9.2 0z', 1),
        part('M24.9 14a4.6 4.6 0 1 0 9.2 0a4.6 4.6 0 1 0 -9.2 0z', 1),
        part('M31.9 22a4.6 4.6 0 1 0 9.2 0a4.6 4.6 0 1 0 -9.2 0z', 1)
      ]
    },

    illBone: {
      box: 48, slots: ['관절', '뼈'],
      colors: ['#eceff1', '#b0bec5'],
      layers: [
        part('M7.5 17a5.5 5.5 0 1 0 11 0a5.5 5.5 0 1 0 -11 0z', 0),
        part('M7.5 31a5.5 5.5 0 1 0 11 0a5.5 5.5 0 1 0 -11 0z', 0),
        part('M29.5 17a5.5 5.5 0 1 0 11 0a5.5 5.5 0 1 0 -11 0z', 0),
        part('M29.5 31a5.5 5.5 0 1 0 11 0a5.5 5.5 0 1 0 -11 0z', 0),
        part('M13 20h22v8H13z', 1)
      ]
    },

    illDoghouse: {
      box: 48, slots: ['지붕', '벽', '문', '지붕선'],
      colors: ['#e57373', '#ffe0b2', '#8d6e63', '#c62828'],
      layers: [
        part('M4 25L24 8L44 25z', 0),
        part('M9 24h30v20H9z', 1),
        part('M19 44v-11a5 5 0 0 1 10 0v11z', 2),
        part('M4 22.6h40v2.6H4z', 3)
      ]
    },

    illFishbowl: {
      box: 48, slots: ['유리', '물', '모래', '물고기'],
      colors: ['#b3e5fc', '#4fc3f7', '#ffe082', '#ff7043'],
      layers: [
        part('M5 26a19 19 0 1 0 38 0a19 19 0 1 0 -38 0z', 0),
        part('M7.4 28a16.6 16.6 0 1 0 33.2 0a16.6 16.6 0 1 0 -33.2 0z', 1),
        part('M10.5 39a13.5 5.5 0 1 0 27 0a13.5 5.5 0 1 0 -27 0z', 2),
        part('M16.5 24L10 19.5L10 28.5z', 3),
        part('M16 24a7 4.2 0 1 0 14 0a7 4.2 0 1 0 -14 0z', 3),
        part('M25.7 22.5a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0 -2.6 0z', 0),
        part('M13 7h22v2.6H13z', 0)
      ]
    },

    illBowl: {
      box: 48, slots: ['그릇', '테', '사료'],
      colors: ['#42a5f5', '#1e88e5', '#8d6e63'],
      layers: [
        part('M6 20a18 18 0 0 0 36 0z', 0),
        part('M6 20a18 4.4 0 1 0 36 0a18 4.4 0 1 0 -36 0z', 1),
        part('M9.4 19a14.6 3.2 0 1 0 29.2 0a14.6 3.2 0 1 0 -29.2 0z', 2)
      ]
    },

    illHamster: {
      box: 48, slots: ['몸', '배', '귀', '볼', '눈'],
      colors: ['#e0a96d', '#fff3e0', '#c58a52', '#ffb3c1', '#3e2723'],
      layers: [
        part('M6 13a6 6 0 1 0 12 0a6 6 0 1 0 -12 0z', 2),
        part('M30 13a6 6 0 1 0 12 0a6 6 0 1 0 -12 0z', 2),
        part('M9 13a3 3 0 1 0 6 0a3 3 0 1 0 -6 0z', 3),
        part('M33 13a3 3 0 1 0 6 0a3 3 0 1 0 -6 0z', 3),
        part('M9 29a15 14 0 1 0 30 0a15 14 0 1 0 -30 0z', 0),
        part('M15 33a9 9 0 1 0 18 0a9 9 0 1 0 -18 0z', 1),
        part('M7.5 33a5.5 5.5 0 1 0 11 0a5.5 5.5 0 1 0 -11 0z', 3),
        part('M29.5 33a5.5 5.5 0 1 0 11 0a5.5 5.5 0 1 0 -11 0z', 3),
        part('M17 26a2 2 0 1 0 4 0a2 2 0 1 0 -4 0z', 4),
        part('M27 26a2 2 0 1 0 4 0a2 2 0 1 0 -4 0z', 4),
        part('M22.2 31a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0z', 4)
      ]
    },

    illRabbit: {
      box: 48, slots: ['몸', '귀 안', '배', '눈'],
      colors: ['#bdbdbd', '#f8bbd0', '#e0e0e0', '#3e2723'],
      layers: [
        part('M12.8 14a4.2 11 0 1 0 8.4 0a4.2 11 0 1 0 -8.4 0z', 0),
        part('M26.8 14a4.2 11 0 1 0 8.4 0a4.2 11 0 1 0 -8.4 0z', 0),
        part('M14.8 14.5a2.2 8 0 1 0 4.4 0a2.2 8 0 1 0 -4.4 0z', 1),
        part('M28.8 14.5a2.2 8 0 1 0 4.4 0a2.2 8 0 1 0 -4.4 0z', 1),
        part('M11 34a13 12 0 1 0 26 0a13 12 0 1 0 -26 0z', 0),
        part('M16 37a8 8 0 1 0 16 0a8 8 0 1 0 -16 0z', 2),
        part('M17.1 30a1.9 1.9 0 1 0 3.8 0a1.9 1.9 0 1 0 -3.8 0z', 3),
        part('M27.1 30a1.9 1.9 0 1 0 3.8 0a1.9 1.9 0 1 0 -3.8 0z', 3),
        part('M22.4 35a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0z', 1)
      ]
    },

    illLeash: {
      box: 48, slots: ['목줄', '고리', '줄'],
      colors: ['#e53935', '#b0bec5', '#8d6e63'],
      layers: [
        part('M39 22.5L42.5 23.5L46.8 6L43.4 5.2z', 2),
        part('M40.42 24.4A17 17 0 0 1 7.58 24.4L12.41 23.11A12 12 0 0 0 35.59 23.11z', 0),
        part('M19 38a5 5 0 1 0 10 0a5 5 0 1 0 -10 0z', 1),
        part('M21.6 30.5a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0z', 1)
      ]
    },

    illTrain: {
      box: 48, slots: ['차체', '창', '지붕', '바퀴'],
      colors: ['#37474f', '#b3e5fc', '#546e7a', '#263238'],
      layers: [
        part('M8 16h32a4 4 0 0 1 4 4v12a4 4 0 0 1 -4 4H8a4 4 0 0 1 -4 -4V20a4 4 0 0 1 4 -4z', 0),
        part('M9 11h30a3 3 0 0 1 3 3v0a3 3 0 0 1 -3 3H9a3 3 0 0 1 -3 -3V14a3 3 0 0 1 3 -3z', 2),
        part('M8 20h7v6H8z', 1),
        part('M18 20h7v6H18z', 1),
        part('M28 20h7v6H28z', 1),
        part('M4 34h40v2.4H4z', 3),
        part('M8.4 39a3.6 3.6 0 1 0 7.2 0a3.6 3.6 0 1 0 -7.2 0z', 3),
        part('M20.4 39a3.6 3.6 0 1 0 7.2 0a3.6 3.6 0 1 0 -7.2 0z', 3),
        part('M32.4 39a3.6 3.6 0 1 0 7.2 0a3.6 3.6 0 1 0 -7.2 0z', 3)
      ]
    },

    illAirplane: {
      box: 48, slots: ['몸통', '날개', '꼬리', '창'],
      colors: ['#eceff1', '#90a4ae', '#607d8b', '#42a5f5'],
      layers: [
        part('M22 22L34 7L38 8.6L28 23z', 1),
        part('M22 26L34 41L38 39.4L28 25z', 2),
        part('M6 21L5 11L11 11L15 21z', 2),
        part('M4 24a19 5.4 0 1 0 38 0a19 5.4 0 1 0 -38 0z', 0),
        part('M22.6 24a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0z', 3),
        part('M27.6 24a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0z', 3),
        part('M32.6 24a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0z', 3)
      ]
    },

    illShip: {
      box: 48, slots: ['선체', '갑판', '돛', '깃발'],
      colors: ['#1e88e5', '#eceff1', '#ffffff', '#e53935'],
      layers: [
        part('M25 10L40 26L25 26z', 2),
        part('M22 12L9 26L22 26z', 2),
        part('M22.6 8h2.6v20H22.6z', 1),
        part('M25 7L31.4 9.5L25 12z', 3),
        part('M3 30L45 30L39 42L9 42z', 0),
        part('M3 27h42v3H3z', 1)
      ]
    },

    illTaxi: {
      box: 48, slots: ['차체', '창', '바퀴', '표시등'],
      colors: ['#ffca28', '#b3e5fc', '#263238', '#212121'],
      layers: [
        part('M14 18L20 8L32 8L38 18z', 1),
        part('M10 18h28a4 4 0 0 1 4 4v6a4 4 0 0 1 -4 4H10a4 4 0 0 1 -4 -4V22a4 4 0 0 1 4 -4z', 0),
        part('M18 4h12v4.4H18z', 3),
        part('M9.6 34a4.4 4.4 0 1 0 8.8 0a4.4 4.4 0 1 0 -8.8 0z', 2),
        part('M29.6 34a4.4 4.4 0 1 0 8.8 0a4.4 4.4 0 1 0 -8.8 0z', 2)
      ]
    },

    illTruck: {
      box: 48, slots: ['짐칸', '운전석', '바퀴', '창'],
      colors: ['#78909c', '#455a64', '#263238', '#b3e5fc'],
      layers: [
        part('M3 14h24v20H3z', 0),
        part('M29 18h8a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2H29a2 2 0 0 1 -2 -2V20a2 2 0 0 1 2 -2z', 1),
        part('M29 21h8v6H29z', 3),
        part('M2 32h38v2.4H2z', 2),
        part('M5.8 37a4.2 4.2 0 1 0 8.4 0a4.2 4.2 0 1 0 -8.4 0z', 2),
        part('M16.8 37a4.2 4.2 0 1 0 8.4 0a4.2 4.2 0 1 0 -8.4 0z', 2),
        part('M28.8 37a4.2 4.2 0 1 0 8.4 0a4.2 4.2 0 1 0 -8.4 0z', 2)
      ]
    },

    illMotorcycle: {
      box: 48, slots: ['바퀴', '차체', '핸들', '시트'],
      colors: ['#37474f', '#e53935', '#90a4ae', '#263238'],
      layers: [
        part('M5 34a7 7 0 1 0 14 0 7 7 0 1 0 -14 0zM7.6 34a4.4 4.4 0 1 1 8.8 0 4.4 4.4 0 1 1 -8.8 0z', 0),
        part('M31 34a7 7 0 1 0 14 0 7 7 0 1 0 -14 0zM33.6 34a4.4 4.4 0 1 1 8.8 0 4.4 4.4 0 1 1 -8.8 0z', 0),
        part('M12 33L20 22L34 22L38 33L34 31L28 25L16 31z', 1),
        part('M20 17h10a2 2 0 0 1 2 2v1a2 2 0 0 1 -2 2H20a2 2 0 0 1 -2 -2V19a2 2 0 0 1 2 -2z', 3),
        part('M34 13h10v2.4H34z', 2),
        part('M32 11h2.4v8H32z', 2)
      ]
    },

    illHelicopter: {
      box: 48, slots: ['몸통', '로터', '꼬리', '창'],
      colors: ['#43a047', '#90a4ae', '#37474f', '#b3e5fc'],
      layers: [
        part('M4 7h40v2.2H4z', 1),
        part('M22.8 7h2.4v6H22.8z', 1),
        part('M32 19L44 15L44 20L33 24z', 2),
        part('M38.6 12a4.4 4.4 0 1 0 8.8 0 4.4 4.4 0 1 0 -8.8 0zM40 12a3 3 0 1 1 6 0 3 3 0 1 1 -6 0z', 1),
        part('M8 22a13 9 0 1 0 26 0a13 9 0 1 0 -26 0z', 0),
        part('M8.6 20a5.4 5.4 0 1 0 10.8 0a5.4 5.4 0 1 0 -10.8 0z', 3),
        part('M10 33h22v2.2H10z', 2)
      ]
    },

    illYacht: {
      box: 48, slots: ['선체', '돛', '돛2', '깃발'],
      colors: ['#eceff1', '#ffffff', '#ffca28', '#e53935'],
      layers: [
        part('M26 8L42 30L26 30z', 1),
        part('M21 10L8 30L21 30z', 2),
        part('M23.4 6h2.4v26H23.4z', 0),
        part('M26 5L32.4 7.5L26 10z', 3),
        part('M4 32L44 32L38 42L10 42z', 0)
      ]
    },

    illRocket: {
      box: 48, slots: ['몸통', '창', '날개', '불꽃'],
      colors: ['#eceff1', '#42a5f5', '#e53935', '#ffca28'],
      layers: [
        part('M17 25L8 38L17 38z', 2),
        part('M31 25L40 38L31 38z', 2),
        part('M24 3c5 4 7 10 7 16v14H17V19c0-6 2-12 7-16z', 0),
        part('M20 17a4 4 0 1 0 8 0a4 4 0 1 0 -8 0z', 1),
        part('M19 33L29 33L24 46z', 3)
      ]
    },

    illSkateboard: {
      box: 48, slots: ['보드', '바퀴', '그립'],
      colors: ['#ff7043', '#37474f', '#212121'],
      layers: [
        part('M7.6 33a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0z', 1),
        part('M33.6 33a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0z', 1),
        part('M6 24h36a3 3 0 0 1 3 3v0a3 3 0 0 1 -3 3H6a3 3 0 0 1 -3 -3V27a3 3 0 0 1 3 -3z', 0),
        part('M6.5 23h35a1.5 1.5 0 0 1 1.5 1.5v0a1.5 1.5 0 0 1 -1.5 1.5H6.5a1.5 1.5 0 0 1 -1.5 -1.5V24.5a1.5 1.5 0 0 1 1.5 -1.5z', 2)
      ]
    },

    illBaseball: {
      box: 48, slots: ['공', '실밥', '방망이', '손잡이', '테'],
      colors: ['#fafafa', '#e53935', '#d7a86e', '#8d6e63', '#b0bec5'],
      layers: [
        part('M26 24L39 8L45 13L32 29z', 2),
        part('M12 38L15 35L29 24L33 28L19 39z', 3),
        part('M6.4 18a9.6 9.6 0 1 0 19.2 0a9.6 9.6 0 1 0 -19.2 0z', 4),
        part('M7.2 18a8.8 8.8 0 1 0 17.6 0a8.8 8.8 0 1 0 -17.6 0z', 0),
        part('M9.11 14.79A7.6 7.6 0 0 1 22.89 14.79L21.62 15.38A6.2 6.2 0 0 0 10.38 15.38z', 1),
        part('M22.89 21.21A7.6 7.6 0 0 1 9.11 21.21L10.38 20.62A6.2 6.2 0 0 0 21.62 20.62z', 1)
      ]
    },

    illTennis: {
      box: 48, slots: ['라켓', '줄', '그립', '공'],
      colors: ['#e53935', '#b0bec5', '#455a64', '#d4e157'],
      layers: [
        part('M25 32L30 28L35 34L29 40z', 2),
        part('M7 19a13 15 0 1 0 26 0a13 15 0 1 0 -26 0zM9.6 19a10.4 12.4 0 1 1 20.8 0a10.4 12.4 0 1 1 -20.8 0z', 0),
        part('M19.2 7h1v24H19.2z', 1),
        part('M15.2 8h1v21H15.2z', 1),
        part('M23.2 8h1v21H23.2z', 1),
        part('M9 18.4h22v1H9z', 1),
        part('M10 23.4h20v1H10z', 1),
        part('M35.6 20a5.4 5.4 0 1 0 10.8 0a5.4 5.4 0 1 0 -10.8 0z', 3)
      ]
    },

    illBadminton: {
      box: 48, slots: ['라켓', '줄', '그립', '셔틀콕'],
      colors: ['#43a047', '#b0bec5', '#455a64', '#fafafa'],
      layers: [
        part('M24 30L28 26L34 32L28 38z', 2),
        part('M7 18a12 14 0 1 0 24 0a12 14 0 1 0 -24 0zM9.4 18a9.6 11.6 0 1 1 19.2 0a9.6 11.6 0 1 1 -19.2 0z', 0),
        part('M18.2 7h1v22H18.2z', 1),
        part('M14.4 8h1v19H14.4z', 1),
        part('M22 8h1v19H22z', 1),
        part('M8 17.4h22v1H8z', 1),
        part('M33.6 15a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0z', 3),
        part('M39 12.6L47 8L47 22L39 17.4z', 3)
      ]
    },

    illBowling: {
      box: 48, slots: ['핀', '핀 줄', '공', '구멍', '핀 테'],
      colors: ['#fafafa', '#e53935', '#37474f', '#90a4ae', '#b0bec5'],
      layers: [
        part('M5.9 10.2a4.1 4.7 0 1 0 8.2 0a4.1 4.7 0 1 0 -8.2 0z', 4),
        part('M8.7 12h2.6a3.4 3.4 0 0 1 3.4 3.4v8.2a3.4 3.4 0 0 1 -3.4 3.4H8.7a3.4 3.4 0 0 1 -3.4 -3.4V15.4a3.4 3.4 0 0 1 3.4 -3.4z', 4),
        part('M6.4 10.2a3.6 4.2 0 1 0 7.2 0a3.6 4.2 0 1 0 -7.2 0z', 0),
        part('M8.8 12h2.4a3 3 0 0 1 3 3v8.4a3 3 0 0 1 -3 3H8.8a3 3 0 0 1 -3 -3V15a3 3 0 0 1 3 -3z', 0),
        part('M6.8 16.4h6.4v2H6.8z', 1),
        part('M15.9 7.2a4.1 4.7 0 1 0 8.2 0a4.1 4.7 0 1 0 -8.2 0z', 4),
        part('M18.7 9h2.6a3.4 3.4 0 0 1 3.4 3.4v8.2a3.4 3.4 0 0 1 -3.4 3.4H18.7a3.4 3.4 0 0 1 -3.4 -3.4V12.4a3.4 3.4 0 0 1 3.4 -3.4z', 4),
        part('M16.4 7.2a3.6 4.2 0 1 0 7.2 0a3.6 4.2 0 1 0 -7.2 0z', 0),
        part('M18.8 9h2.4a3 3 0 0 1 3 3v8.4a3 3 0 0 1 -3 3H18.8a3 3 0 0 1 -3 -3V12a3 3 0 0 1 3 -3z', 0),
        part('M16.8 13.4h6.4v2H16.8z', 1),
        part('M25.9 10.2a4.1 4.7 0 1 0 8.2 0a4.1 4.7 0 1 0 -8.2 0z', 4),
        part('M28.7 12h2.6a3.4 3.4 0 0 1 3.4 3.4v8.2a3.4 3.4 0 0 1 -3.4 3.4H28.7a3.4 3.4 0 0 1 -3.4 -3.4V15.4a3.4 3.4 0 0 1 3.4 -3.4z', 4),
        part('M26.4 10.2a3.6 4.2 0 1 0 7.2 0a3.6 4.2 0 1 0 -7.2 0z', 0),
        part('M28.8 12h2.4a3 3 0 0 1 3 3v8.4a3 3 0 0 1 -3 3H28.8a3 3 0 0 1 -3 -3V15a3 3 0 0 1 3 -3z', 0),
        part('M26.8 16.4h6.4v2H26.8z', 1),
        part('M26 35a10 10 0 1 0 20 0a10 10 0 1 0 -20 0z', 2),
        part('M31 31.5a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0z', 3),
        part('M38 31.5a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0z', 3),
        part('M34.5 38a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0z', 3)
      ]
    },

    illGolf: {
      box: 48, slots: ['채', '헤드', '깃발', '잔디', '공'],
      colors: ['#90a4ae', '#37474f', '#e53935', '#2e7d32', '#fafafa'],
      layers: [
        part('M6 41a20 5 0 1 0 40 0a20 5 0 1 0 -40 0z', 3),
        part('M31 16h1.8v23H31z', 0),
        part('M32.8 17L43 21L32.8 25z', 2),
        part('M7 8h2.4v24H7z', 0),
        part('M6 31L12 34L13 38L5 38L4 33z', 1),
        part('M21 39a5 2.4 0 1 0 10 0a5 2.4 0 1 0 -10 0z', 1),
        part('M16.2 37a2.8 2.8 0 1 0 5.6 0a2.8 2.8 0 1 0 -5.6 0z', 4)
      ]
    },

    illPingPong: {
      box: 48, slots: ['채', '고무', '손잡이', '공'],
      colors: ['#e53935', '#212121', '#8d6e63', '#ffca28'],
      layers: [
        part('M8 20a13 15 0 1 0 26 0a13 15 0 1 0 -26 0z', 1),
        part('M9.4 20a11.6 13.6 0 1 0 23.2 0a11.6 13.6 0 1 0 -23.2 0z', 0),
        part('M24 32L30 26L37 33L31 39z', 2),
        part('M36 14a5 5 0 1 0 10 0a5 5 0 1 0 -10 0z', 3)
      ]
    },

    illIceSkate: {
      box: 48, slots: ['부츠', '날', '끈', '창'],
      colors: ['#455a64', '#cfd8dc', '#90a4ae', '#b3e5fc'],
      layers: [
        part('M6 33L38 29.6L38 32.6L6 36z', 1),
        part('M6 31h4v3H6z', 1),
        part('M15 6h12a3 3 0 0 1 3 3v16a3 3 0 0 1 -3 3H15a3 3 0 0 1 -3 -3V9a3 3 0 0 1 3 -3z', 0),
        part('M14 5h8a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2H14a2 2 0 0 1 -2 -2V7a2 2 0 0 1 2 -2z', 2),
        part('M30 16L38 20L38 28L30 28z', 0),
        part('M17 22h8a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2H17a2 2 0 0 1 -2 -2V24a2 2 0 0 1 2 -2z', 2),
        part('M18.6 13a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0z', 3)
      ]
    },

    illHiking: {
      box: 48, slots: ['배낭', '어깨끈', '포켓', '표'],
      colors: ['#2e7d32', '#1b5e20', '#a5d6a7', '#ffca28'],
      layers: [
        part('M14 6h4.4v10H14z', 1),
        part('M29.6 6h4.4v10H29.6z', 1),
        part('M16 12h16a7 7 0 0 1 7 7v18a7 7 0 0 1 -7 7H16a7 7 0 0 1 -7 -7V19a7 7 0 0 1 7 -7z', 0),
        part('M15 10h18a4 4 0 0 1 4 4v0a4 4 0 0 1 -4 4H15a4 4 0 0 1 -4 -4V14a4 4 0 0 1 4 -4z', 1),
        part('M18 24h12a4 4 0 0 1 4 4v6a4 4 0 0 1 -4 4H18a4 4 0 0 1 -4 -4V28a4 4 0 0 1 4 -4z', 2),
        part('M19 30h10v3H19z', 3)
      ]
    },

    illSwim: {
      box: 48, slots: ['테', '렌즈', '끈'],
      colors: ['#29b6f6', '#212121', '#e53935'],
      layers: [
        part('M2 21h5v5H2z', 2),
        part('M41 21h5v5H41z', 2),
        part('M6.4 24a8.6 8.6 0 1 0 17.2 0 8.6 8.6 0 1 0 -17.2 0zM8.6 24a6.4 6.4 0 1 1 12.8 0 6.4 6.4 0 1 1 -12.8 0z', 0),
        part('M24.4 24a8.6 8.6 0 1 0 17.2 0 8.6 8.6 0 1 0 -17.2 0zM26.6 24a6.4 6.4 0 1 1 12.8 0 6.4 6.4 0 1 1 -12.8 0z', 0),
        part('M8.8 24a6.2 6.2 0 1 0 12.4 0a6.2 6.2 0 1 0 -12.4 0z', 1),
        part('M26.8 24a6.2 6.2 0 1 0 12.4 0a6.2 6.2 0 1 0 -12.4 0z', 1),
        part('M22 22h4v3.4H22z', 0)
      ]
    },

    illJumpRope: {
      box: 48, slots: ['줄', '손잡이', '고리'],
      colors: ['#e53935', '#37474f', '#ffca28'],
      layers: [
        part('M41.67 24.2A20.4 20.4 0 0 1 6.33 24.2L8.41 23A18 18 0 0 0 39.59 23z', 0),
        part('M8.4 12h0.2a2.4 2.4 0 0 1 2.4 2.4v7.2a2.4 2.4 0 0 1 -2.4 2.4H8.4a2.4 2.4 0 0 1 -2.4 -2.4V14.4a2.4 2.4 0 0 1 2.4 -2.4z', 1),
        part('M39.4 12h0.2a2.4 2.4 0 0 1 2.4 2.4v7.2a2.4 2.4 0 0 1 -2.4 2.4H39.4a2.4 2.4 0 0 1 -2.4 -2.4V14.4a2.4 2.4 0 0 1 2.4 -2.4z', 1),
        part('M6.9 25a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0z', 2),
        part('M37.9 25a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0z', 2)
      ]
    },

    illLightning: {
      box: 48, slots: ['번개', '구름 그늘', '구름'],
      colors: ['#ffca28', '#78909c', '#90a4ae'],
      layers: [
        part('M27 18L17 33L23.4 33L19 46L34.4 28.6L28 28.6L33 18z', 0),
        part('M14 14a10 10 0 1 0 20 0a10 10 0 1 0 -20 0z', 2),
        part('M7 18a7 7 0 1 0 14 0a7 7 0 1 0 -14 0z', 2),
        part('M27 18a7 7 0 1 0 14 0a7 7 0 1 0 -14 0z', 2),
        part('M8 22a16 3.2 0 1 0 32 0a16 3.2 0 1 0 -32 0z', 1)
      ]
    },

    illSnowflake: {
      box: 48, slots: ['줄기', '가지', '가운데'],
      colors: ['#4fc3f7', '#b3e5fc', '#e1f5fe'],
      layers: [
        part('M24 25.3L45 25.3L45 22.7L24 22.7z', 0),
        part('M22.87 24.65L33.37 42.84L35.63 41.54L25.13 23.35z', 0),
        part('M22.87 23.35L12.37 41.54L14.63 42.84L25.13 24.65z', 0),
        part('M24 22.7L3 22.7L3 25.3L24 25.3z', 0),
        part('M25.13 23.35L14.63 5.16L12.37 6.46L22.87 24.65z', 0),
        part('M25.13 24.65L35.63 6.46L33.37 5.16L22.87 23.35z', 0),
        part('M34.26 24.82L38.72 28.83L40.19 27.2L35.74 23.18z', 1),
        part('M35.74 24.82L40.19 20.8L38.72 19.17L34.26 23.18z', 1),
        part('M39.26 24.82L43.72 28.83L45.19 27.2L40.74 23.18z', 1),
        part('M40.74 24.82L45.19 20.8L43.72 19.17L39.26 23.18z', 1),
        part('M28.42 33.3L27.18 39.17L29.33 39.62L30.58 33.75z', 1),
        part('M29.16 34.57L34.87 36.43L35.55 34.33L29.84 32.48z', 1),
        part('M30.92 37.63L29.68 43.5L31.83 43.95L33.08 38.09z', 1),
        part('M31.66 38.9L37.37 40.76L38.05 38.66L32.34 36.81z', 1),
        part('M18.16 32.48L12.45 34.33L13.13 36.43L18.84 34.57z', 1),
        part('M17.42 33.75L18.67 39.62L20.82 39.17L19.58 33.3z', 1),
        part('M15.66 36.81L9.95 38.66L10.63 40.76L16.34 38.9z', 1),
        part('M14.92 38.09L16.17 43.95L18.32 43.5L17.08 37.63z', 1),
        part('M13.74 23.18L9.28 19.17L7.81 20.8L12.26 24.82z', 1),
        part('M12.26 23.18L7.81 27.2L9.28 28.83L13.74 24.82z', 1),
        part('M8.74 23.18L4.28 19.17L2.81 20.8L7.26 24.82z', 1),
        part('M7.26 23.18L2.81 27.2L4.28 28.83L8.74 24.82z', 1),
        part('M19.58 14.7L20.82 8.83L18.67 8.38L17.42 14.25z', 1),
        part('M18.84 13.43L13.13 11.57L12.45 13.67L18.16 15.52z', 1),
        part('M17.08 10.37L18.32 4.5L16.17 4.05L14.92 9.91z', 1),
        part('M16.34 9.1L10.63 7.24L9.95 9.34L15.66 11.19z', 1),
        part('M29.84 15.52L35.55 13.67L34.87 11.57L29.16 13.43z', 1),
        part('M30.58 14.25L29.33 8.38L27.18 8.83L28.42 14.7z', 1),
        part('M32.34 11.19L38.05 9.34L37.37 7.24L31.66 9.1z', 1),
        part('M33.08 9.91L31.83 4.05L29.68 4.5L30.92 10.37z', 1),
        part('M20 24a4 4 0 1 0 8 0a4 4 0 1 0 -8 0z', 1),
        part('M22 24a2 2 0 1 0 4 0a2 2 0 1 0 -4 0z', 2)
      ]
    },

    illWind: {
      box: 48, slots: ['바람1', '바람2', '잎'],
      colors: ['#b0bec5', '#cfd8dc', '#66bb6a'],
      layers: [
        part('M4.8 12h22.4a1.8 1.8 0 0 1 1.8 1.8v0a1.8 1.8 0 0 1 -1.8 1.8H4.8a1.8 1.8 0 0 1 -1.8 -1.8V13.8a1.8 1.8 0 0 1 1.8 -1.8z', 0),
        part('M4.8 22h30.4a1.8 1.8 0 0 1 1.8 1.8v0a1.8 1.8 0 0 1 -1.8 1.8H4.8a1.8 1.8 0 0 1 -1.8 -1.8V23.8a1.8 1.8 0 0 1 1.8 -1.8z', 1),
        part('M4.8 32h16.4a1.8 1.8 0 0 1 1.8 1.8v0a1.8 1.8 0 0 1 -1.8 1.8H4.8a1.8 1.8 0 0 1 -1.8 -1.8V33.8a1.8 1.8 0 0 1 1.8 -1.8z', 0),
        part('M33 7L42 2.6L44 6L35 10.4z', 2),
        part('M27 36L36 31.6L38 35L29 39.4z', 2)
      ]
    },

    illFog: {
      box: 48, slots: ['안개1', '안개2', '해'],
      colors: ['#cfd8dc', '#eceff1', '#ffca28'],
      layers: [
        part('M16 14a8 8 0 1 0 16 0a8 8 0 1 0 -16 0z', 2),
        part('M5 20h38a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2H5a2 2 0 0 1 -2 -2V22a2 2 0 0 1 2 -2z', 0),
        part('M8 27h32a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2H8a2 2 0 0 1 -2 -2V29a2 2 0 0 1 2 -2z', 1),
        part('M5 34h38a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2H5a2 2 0 0 1 -2 -2V36a2 2 0 0 1 2 -2z', 0),
        part('M10 41h28a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2H10a2 2 0 0 1 -2 -2V43a2 2 0 0 1 2 -2z', 1)
      ]
    },

    illTyphoon: {
      box: 48, slots: ['소용돌이', '눈', '바깥'],
      colors: ['#26c6da', '#00838f', '#b2ebf2'],
      layers: [
        part('M24 18L24.87 17.84L25.78 17.81L26.71 17.91L27.65 18.16L28.57 18.55L29.45 19.09L30.26 19.77L30.99 20.59L31.61 21.53L32.1 22.57L32.44 23.71L32.62 24.91L32.62 26.15L32.45 27.41L32.08 28.67L31.53 29.88L30.79 31.03L29.88 32.09L28.8 33.03L27.57 33.81L26.22 34.43L24.76 34.86L23.22 35.08L21.64 35.09L20.05 34.86L18.47 34.4L16.95 33.71L15.51 32.79L14.19 31.66L13.03 30.33L12.05 28.83L11.28 27.17L10.74 25.39L10.45 23.53L10.43 21.61L10.69 19.67L11.22 17.77L12.03 15.92L13.1 14.19L14.43 12.59L15.99 11.19L17.76 9.99L19.71 9.05L21.8 8.38L24 8L26.26 7.94L28.53 8.19L30.78 8.77L32.95 9.68L35 10.89L36.88 12.4L38.55 14.18L39.98 16.21L41.12 18.44L41.95 20.84L42.43 23.36L42.56 25.95L42.33 28.57L41.72 31.16L40.74 33.67L39.41 36.04L37.74 38.23L35.76 40.18L33.49 41.86L30.99 43.21L28.3 44.22L25.46 44.84L22.53 45.06L19.56 44.87L16.63 44.26L13.78 43.23L11.07 41.8L13.42 38.56L15.65 39.7L18 40.5L20.4 40.95L22.81 41.07L25.18 40.85L27.47 40.3L29.62 39.45L31.62 38.32L33.4 36.94L34.96 35.35L36.26 33.58L37.28 31.67L38.01 29.66L38.45 27.6L38.59 25.53L38.44 23.5L38.01 21.53L37.31 19.67L36.38 17.96L35.24 16.42L33.91 15.08L32.43 13.96L30.83 13.07L29.15 12.43L27.43 12.04L25.7 11.9L24 12L22.36 12.34L20.81 12.89L19.39 13.65L18.11 14.58L17 15.66L16.07 16.86L15.34 18.16L14.81 19.52L14.49 20.91L14.37 22.3L14.45 23.67L14.72 24.98L15.16 26.2L15.76 27.33L16.49 28.33L17.35 29.2L18.29 29.91L19.3 30.47L20.35 30.87L21.42 31.1L22.48 31.17L23.5 31.09L24.48 30.87L25.39 30.52L26.2 30.06L26.92 29.49L27.53 28.85L28.01 28.16L28.38 27.42L28.62 26.67L28.74 25.91L28.74 25.18L28.64 24.49L28.44 23.84L28.16 23.27L27.8 22.76L27.4 22.34L26.95 22.01L26.48 21.77L26 21.62L25.53 21.55L25.08 21.56L24.67 21.65L24.31 21.8L24 22z', 2),
        part('M24 19L24.76 18.9L25.55 18.93L26.35 19.07L27.14 19.35L27.89 19.75L28.6 20.28L29.23 20.92L29.77 21.67L30.2 22.51L30.5 23.43L30.67 24.41L30.68 25.42L30.54 26.45L30.24 27.46L29.78 28.44L29.17 29.36L28.41 30.19L27.52 30.91L26.51 31.49L25.4 31.93L24.21 32.21L22.98 32.3L21.72 32.2L20.47 31.92L19.26 31.44L18.11 30.77L17.06 29.93L16.13 28.92L15.35 27.76L14.74 26.48L14.33 25.1L14.12 23.65L14.13 22.17L14.36 20.68L14.82 19.22L15.51 17.83L16.4 16.53L17.5 15.37L18.77 14.37L20.2 13.56L21.75 12.96L23.4 12.6L25.11 12.48L26.84 12.63L28.54 13.03L30.19 13.69L31.75 14.6L33.17 15.75L34.41 17.11L35.45 18.66L36.26 20.37L36.82 22.2L37.1 24.11L37.09 26.07L36.78 28.03L36.18 29.94L35.3 31.76L34.14 33.45L32.72 34.97L31.08 36.27L29.25 37.32L27.26 38.1L25.15 38.58L22.97 38.74L20.77 38.58L18.59 38.08L16.5 37.26L14.53 36.13L12.73 34.7L11.14 33L9.82 31.07L8.78 28.94L12.59 27.71L13.4 29.29L14.42 30.71L15.63 31.94L16.99 32.97L18.47 33.78L20.03 34.35L21.63 34.67L23.25 34.75L24.83 34.59L26.36 34.2L27.78 33.6L29.08 32.8L30.23 31.84L31.21 30.73L32 29.5L32.59 28.19L32.97 26.83L33.14 25.45L33.1 24.08L32.86 22.76L32.43 21.5L31.83 20.35L31.08 19.32L30.19 18.42L29.2 17.69L28.13 17.12L27.01 16.72L25.87 16.51L24.73 16.47L23.61 16.59L22.55 16.88L21.57 17.32L20.68 17.88L19.9 18.56L19.25 19.34L18.74 20.18L18.37 21.07L18.14 21.98L18.06 22.9L18.11 23.79L18.3 24.65L18.61 25.45L19.02 26.17L19.52 26.8L20.1 27.33L20.74 27.75L21.41 28.06L22.1 28.26L22.79 28.35L23.47 28.33L24.11 28.21L24.7 27.99L25.24 27.7L25.7 27.34L26.09 26.93L26.39 26.48L26.61 26L26.75 25.52L26.8 25.05L26.77 24.59L26.68 24.16L26.52 23.78L26.31 23.45L26.06 23.17L25.78 22.95L25.49 22.79L25.19 22.7L24.9 22.66L24.63 22.68L24.38 22.75L24.17 22.86L24 23z', 0),
        part('M20.6 24a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0z', 1)
      ]
    },

    illStormCloud: {
      box: 48, slots: ['구름', '그늘', '비', '번개'],
      colors: ['#607d8b', '#455a64', '#4fc3f7', '#ffca28'],
      layers: [
        part('M13 16a11 11 0 1 0 22 0a11 11 0 1 0 -22 0z', 0),
        part('M5 20a8 8 0 1 0 16 0a8 8 0 1 0 -16 0z', 0),
        part('M27 20a8 8 0 1 0 16 0a8 8 0 1 0 -16 0z', 0),
        part('M7 24a17 3.2 0 1 0 34 0a17 3.2 0 1 0 -34 0z', 1),
        part('M13.3 28h0a1.3 1.3 0 0 1 1.3 1.3v3.4a1.3 1.3 0 0 1 -1.3 1.3H13.3a1.3 1.3 0 0 1 -1.3 -1.3V29.3a1.3 1.3 0 0 1 1.3 -1.3z', 2),
        part('M23.3 30h0a1.3 1.3 0 0 1 1.3 1.3v3.4a1.3 1.3 0 0 1 -1.3 1.3H23.3a1.3 1.3 0 0 1 -1.3 -1.3V31.3a1.3 1.3 0 0 1 1.3 -1.3z', 2),
        part('M33.3 28h0a1.3 1.3 0 0 1 1.3 1.3v3.4a1.3 1.3 0 0 1 -1.3 1.3H33.3a1.3 1.3 0 0 1 -1.3 -1.3V29.3a1.3 1.3 0 0 1 1.3 -1.3z', 2),
        part('M30 32L25 40L28 40L25 46L34 37L30.6 37L33 32z', 3)
      ]
    },

    illSunset: {
      box: 48, slots: ['수평선', '해', '바다', '노을'],
      colors: ['#ff7043', '#ffca28', '#42a5f5', '#ffab91'],
      layers: [
        part('M2 4h44v3H2z', 3),
        part('M6 9.5h36v3H6z', 3),
        part('M12 15h24v3H12z', 3),
        part('M13 27a11 11 0 1 0 22 0a11 11 0 1 0 -22 0z', 1),
        part('M2 34h44v10H2z', 2),
        part('M2 32h44v2H2z', 0),
        part('M4 38h12v1.6H4z', 3),
        part('M30 39.6h14v1.6H30z', 3)
      ]
    },

    illMeteor: {
      box: 48, slots: ['별', '꼬리', '꼬리2'],
      colors: ['#ffca28', '#ffe082', '#fff59d'],
      layers: [
        part('M2 2L28 26L24 30L1 6z', 1),
        part('M6 1L33 24L30 28L5 4z', 2),
        part('M34 22L36.94 29.95L45.41 30.29L38.76 35.55L41.05 43.71L34 39L26.95 43.71L29.24 35.55L22.59 30.29L31.06 29.95z', 0),
        part('M9.4 19a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0z', 2),
        part('M17.6 9a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0z', 2)
      ]
    },

    illHail: {
      box: 48, slots: ['구름', '우박', '그늘'],
      colors: ['#90a4ae', '#e1f5fe', '#546e7a'],
      layers: [
        part('M13 15a11 11 0 1 0 22 0a11 11 0 1 0 -22 0z', 0),
        part('M5 19a8 8 0 1 0 16 0a8 8 0 1 0 -16 0z', 0),
        part('M27 19a8 8 0 1 0 16 0a8 8 0 1 0 -16 0z', 0),
        part('M7 23a17 3.2 0 1 0 34 0a17 3.2 0 1 0 -34 0z', 2),
        part('M8.6 31a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0z', 1),
        part('M18.6 29a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0z', 1),
        part('M28.6 31a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0z', 1),
        part('M13.6 40a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0z', 1),
        part('M24.6 41a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0z', 1)
      ]
    },

    illDew: {
      box: 48, slots: ['잎', '이슬', '빛'],
      colors: ['#66bb6a', '#4fc3f7', '#e1f5fe'],
      layers: [
        part('M23 40h2v7H23z', 0),
        part('M11 24a13 19 0 1 0 26 0a13 19 0 1 0 -26 0z', 0),
        part('M13 20a4 5 0 1 0 8 0a4 5 0 1 0 -8 0z', 1),
        part('M25.8 28a3.2 4 0 1 0 6.4 0a3.2 4 0 1 0 -6.4 0z', 1),
        part('M18.4 34a2.6 3.4 0 1 0 5.2 0a2.6 3.4 0 1 0 -5.2 0z', 1),
        part('M14.6 18.4a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0 -2.4 0z', 2),
        part('M27 26.6a1 1 0 1 0 2 0a1 1 0 1 0 -2 0z', 2)
      ]
    },

    illSharpener: {
      box: 48, slots: ['몸통', '구멍', '칼날', '연필'],
      colors: ['#42a5f5', '#263238', '#b0bec5', '#ffca28'],
      layers: [
        part('M28 16L38 7L41 11L32 20z', 3),
        part('M14 14h20a5 5 0 0 1 5 5v16a5 5 0 0 1 -5 5H14a5 5 0 0 1 -5 -5V19a5 5 0 0 1 5 -5z', 0),
        part('M17.6 22a6.4 6.4 0 1 0 12.8 0a6.4 6.4 0 1 0 -12.8 0z', 1),
        part('M13 34L35 30L36 34L14 37z', 2)
      ]
    },

    illRuler: {
      box: 48, slots: ['자', '긴 눈금', '짧은 눈금'],
      colors: ['#ffca28', '#5d4037', '#8d6e63'],
      layers: [
        part('M6 18h36a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2H6a2 2 0 0 1 -2 -2V20a2 2 0 0 1 2 -2z', 0),
        part('M6 18h1v8H6z', 1),
        part('M13.2 18h1v8H13.2z', 1),
        part('M20.4 18h1v8H20.4z', 1),
        part('M27.6 18h1v8H27.6z', 1),
        part('M34.8 18h1v8H34.8z', 1),
        part('M42 18h1v8H42z', 1),
        part('M9.6 18h1v8H9.6z', 2),
        part('M16.8 18h1v8H16.8z', 2),
        part('M24 18h1v8H24z', 2),
        part('M31.2 18h1v8H31.2z', 2),
        part('M38.4 18h1v8H38.4z', 2)
      ]
    },

    illProtractor: {
      box: 48, slots: ['각도기', '안', '눈금'],
      colors: ['#ab47bc', '#f3e5f5', '#6a1b9a'],
      layers: [
        part('M4 34a20 20 0 0 1 40 0z', 0),
        part('M9 34a15 15 0 0 1 30 0z', 1),
        part('M8 33.3L4.6 33.3L4.6 34.7L8 34.7z', 2),
        part('M8.73 29.18L5.44 28.3L5.08 29.66L8.36 30.54z', 2),
        part('M10.49 25.39L7.55 23.69L6.85 24.91L9.79 26.61z', 2),
        part('M13.18 22.19L10.78 19.79L9.79 20.78L12.19 23.18z', 2),
        part('M16.61 19.79L14.91 16.85L13.69 17.55L15.39 20.49z', 2),
        part('M20.54 18.36L19.66 15.08L18.3 15.44L19.18 18.73z', 2),
        part('M24.7 18L24.7 14.6L23.3 14.6L23.3 18z', 2),
        part('M28.82 18.73L29.7 15.44L28.34 15.08L27.46 18.36z', 2),
        part('M32.61 20.49L34.31 17.55L33.09 16.85L31.39 19.79z', 2),
        part('M35.81 23.18L38.21 20.78L37.22 19.79L34.82 22.19z', 2),
        part('M38.21 26.61L41.15 24.91L40.45 23.69L37.51 25.39z', 2),
        part('M39.64 30.54L42.92 29.66L42.56 28.3L39.27 29.18z', 2),
        part('M40 34.7L43.4 34.7L43.4 33.3L40 33.3z', 2),
        part('M22 34a2 2 0 1 0 4 0a2 2 0 1 0 -4 0z', 2)
      ]
    },

    illExam: {
      box: 48, slots: ['종이', '줄', '동그라미', '표시'],
      colors: ['#ffffff', '#90a4ae', '#e53935', '#ffca28'],
      layers: [
        part('M10 4h28a3 3 0 0 1 3 3v34a3 3 0 0 1 -3 3H10a3 3 0 0 1 -3 -3V7a3 3 0 0 1 3 -3z', 0),
        part('M12 12h24v2H12z', 1),
        part('M12 18h24v2H12z', 1),
        part('M12 24h24v2H12z', 1),
        part('M12 30h14v2H12z', 1),
        part('M25 34a5 5 0 1 0 10 0 5 5 0 1 0 -10 0zM26.4 34a3.6 3.6 0 1 1 7.2 0 3.6 3.6 0 1 1 -7.2 0z', 2),
        part('M14 34L17 38L26 28L28 31L17 42L12 36z', 3)
      ]
    },

    illFlask: {
      box: 48, slots: ['유리', '액체', '목', '기포'],
      colors: ['#b3e5fc', '#ce93d8', '#cfd8dc', '#e1f5fe'],
      layers: [
        part('M20 6h8v12H20z', 2),
        part('M20 18L9 39a3 3 0 0 0 2.6 4h24.8A3 3 0 0 0 39 39L28 18z', 0),
        part('M17 26L11 38L37 38L31 26z', 1),
        part('M18.4 33a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0z', 3),
        part('M26.6 30a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0z', 3)
      ]
    },

    illTestTube: {
      box: 48, slots: ['유리', '액체', '입구'],
      colors: ['#b3e5fc', '#66bb6a', '#cfd8dc'],
      layers: [
        part('M18 6h12v26a6 6 0 0 1 -12 0z', 0),
        part('M18 22h12v10a6 6 0 0 1 -12 0z', 1),
        part('M16 4h16v3H16z', 2)
      ]
    },

    illGrade: {
      box: 48, slots: ['종이', '머리', '줄', '도장'],
      colors: ['#ffffff', '#1e88e5', '#90a4ae', '#e53935'],
      layers: [
        part('M8 4h32a2 2 0 0 1 2 2v36a2 2 0 0 1 -2 2H8a2 2 0 0 1 -2 -2V6a2 2 0 0 1 2 -2z', 0),
        part('M6 4h36v8H6z', 1),
        part('M10 16h28v2H10z', 2),
        part('M10 22h28v2H10z', 2),
        part('M10 28h28v2H10z', 2),
        part('M10 34h18v2H10z', 2),
        part('M27 37a6 6 0 1 0 12 0 6 6 0 1 0 -12 0zM29 37a4 4 0 1 1 8 0 4 4 0 1 1 -8 0z', 3)
      ]
    },

    illSchedule: {
      box: 48, slots: ['표', '머리', '칸', '글'],
      colors: ['#ffffff', '#42a5f5', '#e3f2fd', '#90a4ae'],
      layers: [
        part('M7 6h34a2 2 0 0 1 2 2v32a2 2 0 0 1 -2 2H7a2 2 0 0 1 -2 -2V8a2 2 0 0 1 2 -2z', 0),
        part('M5 6h38v8H5z', 1),
        part('M8 16h8.6a1 1 0 0 1 1 1v5a1 1 0 0 1 -1 1H8a1 1 0 0 1 -1 -1V17a1 1 0 0 1 1 -1z', 2),
        part('M9 18.6h6.6v1.8H9z', 3),
        part('M20 16h8.6a1 1 0 0 1 1 1v5a1 1 0 0 1 -1 1H20a1 1 0 0 1 -1 -1V17a1 1 0 0 1 1 -1z', 2),
        part('M21 18.6h6.6v1.8H21z', 3),
        part('M32 16h8.6a1 1 0 0 1 1 1v5a1 1 0 0 1 -1 1H32a1 1 0 0 1 -1 -1V17a1 1 0 0 1 1 -1z', 2),
        part('M33 18.6h6.6v1.8H33z', 3),
        part('M8 24.6h8.6a1 1 0 0 1 1 1v5a1 1 0 0 1 -1 1H8a1 1 0 0 1 -1 -1V25.6a1 1 0 0 1 1 -1z', 2),
        part('M9 27.2h6.6v1.8H9z', 3),
        part('M20 24.6h8.6a1 1 0 0 1 1 1v5a1 1 0 0 1 -1 1H20a1 1 0 0 1 -1 -1V25.6a1 1 0 0 1 1 -1z', 2),
        part('M21 27.2h6.6v1.8H21z', 3),
        part('M32 24.6h8.6a1 1 0 0 1 1 1v5a1 1 0 0 1 -1 1H32a1 1 0 0 1 -1 -1V25.6a1 1 0 0 1 1 -1z', 2),
        part('M33 27.2h6.6v1.8H33z', 3),
        part('M8 33.2h8.6a1 1 0 0 1 1 1v5a1 1 0 0 1 -1 1H8a1 1 0 0 1 -1 -1V34.2a1 1 0 0 1 1 -1z', 2),
        part('M9 35.8h6.6v1.8H9z', 3),
        part('M20 33.2h8.6a1 1 0 0 1 1 1v5a1 1 0 0 1 -1 1H20a1 1 0 0 1 -1 -1V34.2a1 1 0 0 1 1 -1z', 2),
        part('M21 35.8h6.6v1.8H21z', 3),
        part('M32 33.2h8.6a1 1 0 0 1 1 1v5a1 1 0 0 1 -1 1H32a1 1 0 0 1 -1 -1V34.2a1 1 0 0 1 1 -1z', 2),
        part('M33 35.8h6.6v1.8H33z', 3)
      ]
    },

    illSchoolBag: {
      box: 48, slots: ['가방', '뚜껑', '끈', '포켓'],
      colors: ['#ef5350', '#c62828', '#90a4ae', '#ffcdd2'],
      layers: [
        part('M13 6h4.4v10H13z', 2),
        part('M30.6 6h4.4v10H30.6z', 2),
        part('M14 14h20a6 6 0 0 1 6 6v18a6 6 0 0 1 -6 6H14a6 6 0 0 1 -6 -6V20a6 6 0 0 1 6 -6z', 0),
        part('M15 12h18a5 5 0 0 1 5 5v4a5 5 0 0 1 -5 5H15a5 5 0 0 1 -5 -5V17a5 5 0 0 1 5 -5z', 1),
        part('M17 30h14a3 3 0 0 1 3 3v6a3 3 0 0 1 -3 3H17a3 3 0 0 1 -3 -3V33a3 3 0 0 1 3 -3z', 3)
      ]
    },

    illMicroscope: {
      box: 48, slots: ['받침', '경통', '렌즈', '시료'],
      colors: ['#37474f', '#546e7a', '#90a4ae', '#b3e5fc'],
      layers: [
        part('M8 44L40 44L36 40L12 40z', 0),
        part('M24 16h7v24H24z', 1),
        part('M12 32h20v3H12z', 0),
        part('M27 5L38 5L38 16L27 16z', 1),
        part('M29.1 19a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0z', 2),
        part('M16 30h8v2H16z', 3)
      ]
    },

    illBloodPressure: {
      box: 48, slots: ['몸통', '화면', '커프', '줄'],
      colors: ['#eceff1', '#42a5f5', '#37474f', '#90a4ae'],
      layers: [
        part('M15 22h7v3H15z', 3),
        part('M5 14h8a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3H5a3 3 0 0 1 -3 -3V17a3 3 0 0 1 3 -3z', 2),
        part('M24 12h16a4 4 0 0 1 4 4v18a4 4 0 0 1 -4 4H24a4 4 0 0 1 -4 -4V16a4 4 0 0 1 4 -4z', 0),
        part('M26 16h12a2 2 0 0 1 2 2v7a2 2 0 0 1 -2 2H26a2 2 0 0 1 -2 -2V18a2 2 0 0 1 2 -2z', 1),
        part('M23.8 32a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0z', 2),
        part('M30.8 32a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0z', 2)
      ]
    },

    illWheelchair: {
      box: 48, slots: ['바퀴', '의자', '손잡이', '발판'],
      colors: ['#37474f', '#1e88e5', '#90a4ae', '#546e7a'],
      layers: [
        part('M10 32a12 12 0 1 0 24 0 12 12 0 1 0 -24 0zM12.4 32a9.6 9.6 0 1 1 19.2 0 9.6 9.6 0 1 1 -19.2 0z', 0),
        part('M33.4 38a4.6 4.6 0 1 0 9.2 0 4.6 4.6 0 1 0 -9.2 0zM35 38a3 3 0 1 1 6 0 3 3 0 1 1 -6 0z', 0),
        part('M30 8h3v15H30z', 1),
        part('M18 22h15v3H18z', 1),
        part('M20 16h13v2.4H20z', 2),
        part('M23 25h2.4v12H23z', 3),
        part('M23 36h12v2.4H23z', 3)
      ]
    },

    illMask: {
      box: 48, slots: ['천', '주름', '끈'],
      colors: ['#b3e5fc', '#4fc3f7', '#78909c'],
      layers: [
        part('M1 20h8v2.4H1z', 2),
        part('M39 20h8v2.4H39z', 2),
        part('M8 14h32v11c0 7-7 12-16 12s-16-5-16-12z', 0),
        part('M11 18h26v1.6H11z', 1),
        part('M11 23h26v1.6H11z', 1),
        part('M12 28h24v1.6H12z', 1)
      ]
    },

    illHospital: {
      box: 48, slots: ['벽', '지붕', '십자', '문'],
      colors: ['#eceff1', '#90a4ae', '#e53935', '#42a5f5'],
      layers: [
        part('M4 10h40v5H4z', 1),
        part('M9 14h30a3 3 0 0 1 3 3v24a3 3 0 0 1 -3 3H9a3 3 0 0 1 -3 -3V17a3 3 0 0 1 3 -3z', 0),
        part('M20 19h8v21H20z', 2),
        part('M14 26h20v8H14z', 2),
        part('M21 34h6a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2H21a2 2 0 0 1 -2 -2V36a2 2 0 0 1 2 -2z', 3)
      ]
    },

    illAmbulance: {
      box: 48, slots: ['차체', '창', '바퀴', '십자', '테'],
      colors: ['#fafafa', '#b3e5fc', '#263238', '#e53935', '#90a4ae'],
      layers: [
        part('M9 15L15 6L33 6L39 15z', 4),
        part('M7 13h34a5 5 0 0 1 5 5v12a5 5 0 0 1 -5 5H7a5 5 0 0 1 -5 -5V18a5 5 0 0 1 5 -5z', 4),
        part('M10 14L16 7L32 7L38 14z', 0),
        part('M17 9h13v5H17z', 1),
        part('M30 4h10v3.4H30z', 1),
        part('M7 14h34a4 4 0 0 1 4 4v12a4 4 0 0 1 -4 4H7a4 4 0 0 1 -4 -4V18a4 4 0 0 1 4 -4z', 0),
        part('M21 18h6v13H21z', 3),
        part('M17.5 21.5h13v6H17.5z', 3),
        part('M7.6 36a4.4 4.4 0 1 0 8.8 0a4.4 4.4 0 1 0 -8.8 0z', 2),
        part('M31.6 36a4.4 4.4 0 1 0 8.8 0a4.4 4.4 0 1 0 -8.8 0z', 2)
      ]
    },

    illIV: {
      box: 48, slots: ['봉', '주머니', '액체', '줄'],
      colors: ['#90a4ae', '#e0e0e0', '#4fc3f7', '#cfd8dc'],
      layers: [
        part('M12 44L34 44L30 40L16 40z', 0),
        part('M20 4h2.4v40H20z', 0),
        part('M20 6h7v2H20z', 0),
        part('M27 8h10a3 3 0 0 1 3 3v14a3 3 0 0 1 -3 3H27a3 3 0 0 1 -3 -3V11a3 3 0 0 1 3 -3z', 1),
        part('M28 14h8a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2H28a2 2 0 0 1 -2 -2V16a2 2 0 0 1 2 -2z', 2),
        part('M31 28h1.6v12H31z', 3)
      ]
    },

    illECG: {
      box: 48, slots: ['화면', '파형', '눈금'],
      colors: ['#0d47a1', '#4caf50', '#1e88e5'],
      layers: [
        part('M6 8h36a3 3 0 0 1 3 3v22a3 3 0 0 1 -3 3H6a3 3 0 0 1 -3 -3V11a3 3 0 0 1 3 -3z', 0),
        part('M6 18h36v0.8H6z', 2),
        part('M6 26h36v0.8H6z', 2),
        part('M6 20.6L13 20.6L16 16.6L19 25.6L22 10.6L25 31.6L28 20.6L34 20.6L37 16.6L40 23.6L42 23.6L42 26.4L40 26.4L37 19.4L34 23.4L28 23.4L25 34.4L22 13.4L19 28.4L16 19.4L13 23.4L6 23.4z', 1)
      ]
    },

    illXray: {
      box: 48, slots: ['필름', '뼈대', '허파'],
      colors: ['#e0f7fa', '#eceff1', '#00695c'],
      layers: [
        part('M8 3h32a2 2 0 0 1 2 2v38a2 2 0 0 1 -2 2H8a2 2 0 0 1 -2 -2V5a2 2 0 0 1 2 -2z', 0),
        part('M8 26a8 13 0 1 0 16 0a8 13 0 1 0 -16 0z', 2),
        part('M24 26a8 13 0 1 0 16 0a8 13 0 1 0 -16 0z', 2),
        part('M22.4 12h3.2v28H22.4z', 1),
        part('M10.84 17.21A14 14 0 0 1 21.57 8.21L21.92 10.18A12 12 0 0 0 12.72 17.9z', 1),
        part('M26.43 8.21A14 14 0 0 1 37.16 17.21L35.28 17.9A12 12 0 0 0 26.08 10.18z', 1),
        part('M10.84 23.21A14 14 0 0 1 21.57 14.21L21.92 16.18A12 12 0 0 0 12.72 23.9z', 1),
        part('M26.43 14.21A14 14 0 0 1 37.16 23.21L35.28 23.9A12 12 0 0 0 26.08 16.18z', 1),
        part('M10.84 29.21A14 14 0 0 1 21.57 20.21L21.92 22.18A12 12 0 0 0 12.72 29.9z', 1),
        part('M26.43 20.21A14 14 0 0 1 37.16 29.21L35.28 29.9A12 12 0 0 0 26.08 22.18z', 1),
        part('M10.84 35.21A14 14 0 0 1 21.57 26.21L21.92 28.18A12 12 0 0 0 12.72 35.9z', 1),
        part('M26.43 26.21A14 14 0 0 1 37.16 35.21L35.28 35.9A12 12 0 0 0 26.08 28.18z', 1),
        part('M10.84 41.21A14 14 0 0 1 21.57 32.21L21.92 34.18A12 12 0 0 0 12.72 41.9z', 1),
        part('M26.43 32.21A14 14 0 0 1 37.16 41.21L35.28 41.9A12 12 0 0 0 26.08 34.18z', 1)
      ]
    },

    illSanitizer: {
      box: 48, slots: ['병', '펌프', '라벨', '방울'],
      colors: ['#e1f5fe', '#90a4ae', '#42a5f5', '#ffffff'],
      layers: [
        part('M18 18h12a4 4 0 0 1 4 4v18a4 4 0 0 1 -4 4H18a4 4 0 0 1 -4 -4V22a4 4 0 0 1 4 -4z', 0),
        part('M20 12h8v7H20z', 1),
        part('M18 8h16v3.4H18z', 1),
        part('M30 8h3v8H30z', 1),
        part('M19 24h10a2 2 0 0 1 2 2v7a2 2 0 0 1 -2 2H19a2 2 0 0 1 -2 -2V26a2 2 0 0 1 2 -2z', 2),
        part('M21 30a3 3 0 1 0 6 0a3 3 0 1 0 -6 0z', 3),
        part('M24 25L26.6 29L21.4 29z', 3)
      ]
    },

    illCrutch: {
      box: 48, slots: ['대', '받침', '손잡이', '발'],
      colors: ['#8d6e63', '#90a4ae', '#546e7a', '#37474f'],
      layers: [
        part('M13.6 13A10.4 10.4 0 0 1 34.4 13L31 13A7 7 0 0 0 17 13z', 1),
        part('M19 14h2.6v26H19z', 0),
        part('M26.4 14h2.6v26H26.4z', 0),
        part('M16 22h16v3.4H16z', 2),
        part('M20 39h8a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2H20a2 2 0 0 1 -2 -2V41a2 2 0 0 1 2 -2z', 3)
      ]
    },

    illBlender: {
      box: 48, slots: ['몸통', '물병', '뚜껑', '칼날'],
      colors: ['#e53935', '#b3e5fc', '#90a4ae', '#cfd8dc'],
      layers: [
        part('M14 6h20a2 2 0 0 1 2 2v1a2 2 0 0 1 -2 2H14a2 2 0 0 1 -2 -2V8a2 2 0 0 1 2 -2z', 2),
        part('M13 10L35 10L33 33L15 33z', 1),
        part('M16 30L32 30L24 21z', 3),
        part('M13 33h22a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3H13a3 3 0 0 1 -3 -3V36a3 3 0 0 1 3 -3z', 0),
        part('M21.4 38.4a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0z', 2)
      ]
    },

    illToaster: {
      box: 48, slots: ['몸통', '빵', '손잡이', '틈'],
      colors: ['#90a4ae', '#d7a86e', '#546e7a', '#37474f'],
      layers: [
        part('M17 7h4a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2H17a2 2 0 0 1 -2 -2V9a2 2 0 0 1 2 -2z', 1),
        part('M27 7h4a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2H27a2 2 0 0 1 -2 -2V9a2 2 0 0 1 2 -2z', 1),
        part('M11 16h26a4 4 0 0 1 4 4v16a4 4 0 0 1 -4 4H11a4 4 0 0 1 -4 -4V20a4 4 0 0 1 4 -4z', 0),
        part('M12 16h24v3H12z', 3),
        part('M41 22h4v10H41z', 2),
        part('M10 40h6v2.4H10z', 2),
        part('M32 40h6v2.4H32z', 2)
      ]
    },

    illRiceCooker: {
      box: 48, slots: ['몸통', '뚜껑', '손잡이', '표시'],
      colors: ['#eceff1', '#90a4ae', '#546e7a', '#e53935'],
      layers: [
        part('M15.6 12A8.4 8.4 0 0 1 32.4 12L30 12A6 6 0 0 0 18 12z', 2),
        part('M10 12h28a3 3 0 0 1 3 3v2a3 3 0 0 1 -3 3H10a3 3 0 0 1 -3 -3V15a3 3 0 0 1 3 -3z', 1),
        part('M13 18h22a4 4 0 0 1 4 4v16a4 4 0 0 1 -4 4H13a4 4 0 0 1 -4 -4V22a4 4 0 0 1 4 -4z', 0),
        part('M19.4 26h9.2a1.4 1.4 0 0 1 1.4 1.4v3.2a1.4 1.4 0 0 1 -1.4 1.4H19.4a1.4 1.4 0 0 1 -1.4 -1.4V27.4a1.4 1.4 0 0 1 1.4 -1.4z', 3),
        part('M13 42h6v2H13z', 1),
        part('M29 42h6v2H29z', 1)
      ]
    },

    illKettle: {
      box: 48, slots: ['몸통', '뚜껑', '손잡이', '주둥이'],
      colors: ['#42a5f5', '#1e88e5', '#90a4ae', '#546e7a'],
      layers: [
        part('M36 20L46 14L46 19L37 25z', 3),
        part('M10.6 18A12.4 12.4 0 0 1 35.4 18L33 18A10 10 0 0 0 13 18z', 2),
        part('M15 18h16a6 6 0 0 1 6 6v12a6 6 0 0 1 -6 6H15a6 6 0 0 1 -6 -6V24a6 6 0 0 1 6 -6z', 0),
        part('M17 13h12a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2H17a2 2 0 0 1 -2 -2V15a2 2 0 0 1 2 -2z', 1),
        part('M20.6 12a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0z', 1)
      ]
    },

    illOven: {
      box: 48, slots: ['몸통', '문', '손잡이', '창'],
      colors: ['#90a4ae', '#546e7a', '#37474f', '#b3e5fc'],
      layers: [
        part('M9 8h30a3 3 0 0 1 3 3v30a3 3 0 0 1 -3 3H9a3 3 0 0 1 -3 -3V11a3 3 0 0 1 3 -3z', 0),
        part('M11 14h26a2 2 0 0 1 2 2v21a2 2 0 0 1 -2 2H11a2 2 0 0 1 -2 -2V16a2 2 0 0 1 2 -2z', 1),
        part('M13.4 18h21.2a1.4 1.4 0 0 1 1.4 1.4v9.2a1.4 1.4 0 0 1 -1.4 1.4H13.4a1.4 1.4 0 0 1 -1.4 -1.4V19.4a1.4 1.4 0 0 1 1.4 -1.4z', 3),
        part('M12 37h24v2.6H12z', 2),
        part('M10.2 11a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0z', 2),
        part('M34.2 11a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0z', 2)
      ]
    },

    illWhisk: {
      box: 48, slots: ['손잡이', '거품기', '테'],
      colors: ['#546e7a', '#b0bec5', '#90a4ae'],
      layers: [
        part('M23 4h2a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3H23a3 3 0 0 1 -3 -3V7a3 3 0 0 1 3 -3z', 0),
        part('M15 15h18v3H15z', 2),
        part('M16 29a8 13 0 1 0 16 0a8 13 0 1 0 -16 0zM17.2 29a6.8 11.8 0 1 1 13.6 0a6.8 11.8 0 1 1 -13.6 0z', 1),
        part('M19.4 29a4.6 13 0 1 0 9.2 0a4.6 13 0 1 0 -9.2 0zM20.6 29a3.3999999999999995 11.8 0 1 1 6.799999999999999 0a3.3999999999999995 11.8 0 1 1 -6.799999999999999 0z', 1),
        part('M22.4 29a1.6 13 0 1 0 3.2 0a1.6 13 0 1 0 -3.2 0zM23.6 29a0.40000000000000013 11.8 0 1 1 0.8000000000000003 0a0.40000000000000013 11.8 0 1 1 -0.8000000000000003 0z', 1)
      ]
    },

    illMeasuringCup: {
      box: 48, slots: ['컵', '눈금', '손잡이', '액체'],
      colors: ['#e1f5fe', '#90a4ae', '#42a5f5', '#b3e5fc'],
      layers: [
        part('M30 20a6 6 0 1 0 12 0 6 6 0 1 0 -12 0zM32 20a4 4 0 1 1 8 0 4 4 0 1 1 -8 0z', 2),
        part('M10 10L34 10L32 40L12 40z', 0),
        part('M12.4 24L31.6 24L30.8 39L13.2 39z', 3),
        part('M12.5 15h9v1.6H12.5z', 1),
        part('M12 19.4h6.5v1.6H12z', 1),
        part('M12.5 30h9v1.6H12.5z', 1)
      ]
    },

    illChefKnife: {
      box: 48, slots: ['날', '손잡이', '리벳'],
      colors: ['#cfd8dc', '#263238', '#90a4ae'],
      layers: [
        part('M20 4h8a3 3 0 0 1 3 3v6a3 3 0 0 1 -3 3H20a3 3 0 0 1 -3 -3V7a3 3 0 0 1 3 -3z', 1),
        part('M18 16L30 16L30 33L24 42L18 33z', 0),
        part('M19.6 9a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0z', 2),
        part('M25.6 9a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0z', 2)
      ]
    },

    illPlate: {
      box: 48, slots: ['테', '안', '음식', '음식2'],
      colors: ['#eceff1', '#fafafa', '#ff7043', '#66bb6a'],
      layers: [
        part('M5 26a19 19 0 1 0 38 0a19 19 0 1 0 -38 0z', 0),
        part('M9.4 26a14.6 14.6 0 1 0 29.2 0a14.6 14.6 0 1 0 -29.2 0z', 1),
        part('M13 23a6 4.4 0 1 0 12 0a6 4.4 0 1 0 -12 0z', 2),
        part('M23.6 29a5.4 4 0 1 0 10.8 0a5.4 4 0 1 0 -10.8 0z', 3),
        part('M25.4 19a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0z', 3)
      ]
    },

    illCup: {
      box: 48, slots: ['컵', '액체', '받침', '빛'],
      colors: ['#ffffff', '#8d6e63', '#cfd8dc', '#e0e0e0'],
      layers: [
        part('M7 40a17 4 0 1 0 34 0a17 4 0 1 0 -34 0z', 2),
        part('M32 24a6 6 0 1 0 12 0 6 6 0 1 0 -12 0zM34 24a4 4 0 1 1 8 0 4 4 0 1 1 -8 0z', 2),
        part('M11 14L37 14L34 38L14 38z', 0),
        part('M14.4 19L33.6 19L32.4 32L15.6 32z', 1),
        part('M11 14a13 3 0 1 0 26 0a13 3 0 1 0 -26 0z', 0),
        part('M17.6 22h2v10H17.6z', 3)
      ]
    },

    illReceipt: {
      box: 48, slots: ['종이', '줄', '합계', '바코드'],
      colors: ['#ffffff', '#90a4ae', '#e53935', '#212121'],
      layers: [
        part('M9 4h30v36l-3.75-3-3.75 3-3.75-3-3.75 3-3.75-3-3.75 3-3.75-3-3.75 3z', 0),
        part('M13 10h22v2H13z', 1),
        part('M13 15h18v2H13z', 1),
        part('M13 20h22v2H13z', 1),
        part('M13 25h14v2H13z', 1),
        part('M13 31h12v2.6H13z', 2),
        part('M27 31h9v2.6H27z', 3)
      ]
    },

    illWallet: {
      box: 48, slots: ['지갑', '카드', '동전', '뚜껑'],
      colors: ['#8d6e63', '#42a5f5', '#ffca28', '#5d4037'],
      layers: [
        part('M30 7h12v11H30z', 1),
        part('M8 14h32a4 4 0 0 1 4 4v14a4 4 0 0 1 -4 4H8a4 4 0 0 1 -4 -4V18a4 4 0 0 1 4 -4z', 0),
        part('M7 14h34a3 3 0 0 1 3 3v2a3 3 0 0 1 -3 3H7a3 3 0 0 1 -3 -3V17a3 3 0 0 1 3 -3z', 3),
        part('M35 26a3 3 0 1 0 6 0a3 3 0 1 0 -6 0z', 2)
      ]
    },

    illCoin: {
      box: 48, slots: ['동전', '무늬', '테'],
      colors: ['#ffca28', '#f57f17', '#ffe082'],
      layers: [
        part('M6 24a18 18 0 1 0 36 0a18 18 0 1 0 -36 0z', 0),
        part('M6 24a18 18 0 1 0 36 0a18 18 0 1 0 -36 0zM8.6 24a15.4 15.4 0 1 1 30.8 0a15.4 15.4 0 1 1 -30.8 0z', 2),
        part('M24 14L26.59 20.44L33.51 20.91L28.18 25.36L29.88 32.09L24 28.4L18.12 32.09L19.82 25.36L14.49 20.91L21.41 20.44z', 1)
      ]
    },

    illCard: {
      box: 48, slots: ['카드', '번호', '칩', '띠'],
      colors: ['#1e88e5', '#ffffff', '#ffca28', '#0d47a1'],
      layers: [
        part('M7 12h34a3 3 0 0 1 3 3v20a3 3 0 0 1 -3 3H7a3 3 0 0 1 -3 -3V15a3 3 0 0 1 3 -3z', 0),
        part('M4 18h40v5H4z', 3),
        part('M11.4 27h5.2a1.4 1.4 0 0 1 1.4 1.4v3.2a1.4 1.4 0 0 1 -1.4 1.4H11.4a1.4 1.4 0 0 1 -1.4 -1.4V28.4a1.4 1.4 0 0 1 1.4 -1.4z', 2),
        part('M22 28h18v1.8H22z', 1),
        part('M22 32h14v1.8H22z', 1)
      ]
    },

    illBarcode: {
      box: 48, slots: ['바탕', '막대', '숫자'],
      colors: ['#ffffff', '#212121', '#90a4ae'],
      layers: [
        part('M4 12h40a2 2 0 0 1 2 2v20a2 2 0 0 1 -2 2H4a2 2 0 0 1 -2 -2V14a2 2 0 0 1 2 -2z', 0),
        part('M5.4 16h1.8v14H5.4z', 1),
        part('M8.1 16h1v14H8.1z', 1),
        part('M10.8 16h1v14H10.8z', 1),
        part('M13.5 16h1.8v14H13.5z', 1),
        part('M16.2 16h1v14H16.2z', 1),
        part('M18.9 16h1v14H18.9z', 1),
        part('M21.6 16h1.8v14H21.6z', 1),
        part('M24.3 16h1v14H24.3z', 1),
        part('M27 16h1v14H27z', 1),
        part('M29.7 16h1.8v14H29.7z', 1),
        part('M32.4 16h1v14H32.4z', 1),
        part('M35.1 16h1v14H35.1z', 1),
        part('M37.8 16h1.8v14H37.8z', 1),
        part('M40.5 16h1v14H40.5z', 1),
        part('M8 32h32v1.6H8z', 2)
      ]
    },

    illStockBox: {
      box: 48, slots: ['상자', '테이프', '뚜껑', '표'],
      colors: ['#d7a86e', '#8d6e63', '#e0b98a', '#ffffff'],
      layers: [
        part('M8 13h32a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2H8a2 2 0 0 1 -2 -2V15a2 2 0 0 1 2 -2z', 2),
        part('M8 20h32a2 2 0 0 1 2 2v18a2 2 0 0 1 -2 2H8a2 2 0 0 1 -2 -2V22a2 2 0 0 1 2 -2z', 0),
        part('M21 13h6v29H21z', 1),
        part('M11 27h11a1 1 0 0 1 1 1v9a1 1 0 0 1 -1 1H11a1 1 0 0 1 -1 -1V28a1 1 0 0 1 1 -1z', 3)
      ]
    },

    illHandcart: {
      box: 48, slots: ['수레', '바퀴', '상자', '손잡이'],
      colors: ['#90a4ae', '#37474f', '#d7a86e', '#546e7a'],
      layers: [
        part('M33 25L45 14L47 17L35 28z', 3),
        part('M10 11h22v13H10z', 2),
        part('M8 24L36 24L36 28L8 28z', 0),
        part('M10 28h2v6H10z', 0),
        part('M32 28h2v6H32z', 0),
        part('M9.6 35a4.4 4.4 0 1 0 8.8 0a4.4 4.4 0 1 0 -8.8 0z', 1),
        part('M27.6 35a4.4 4.4 0 1 0 8.8 0a4.4 4.4 0 1 0 -8.8 0z', 1)
      ]
    },

    illBusinessCard: {
      box: 48, slots: ['카드', '글', '로고'],
      colors: ['#ffffff', '#90a4ae', '#1e88e5'],
      layers: [
        part('M5 13h38a3 3 0 0 1 3 3v16a3 3 0 0 1 -3 3H5a3 3 0 0 1 -3 -3V16a3 3 0 0 1 3 -3z', 1),
        part('M5 14h38a2 2 0 0 1 2 2v16a2 2 0 0 1 -2 2H5a2 2 0 0 1 -2 -2V16a2 2 0 0 1 2 -2z', 0),
        part('M8 24a5 5 0 1 0 10 0a5 5 0 1 0 -10 0z', 2),
        part('M22 20h16v2H22z', 1),
        part('M22 25h20v1.6H22z', 1),
        part('M22 29h12v1.6H22z', 1)
      ]
    },

    illDisplayStand: {
      box: 48, slots: ['선반', '물건', '가격'],
      colors: ['#8d6e63', '#42a5f5', '#e53935'],
      layers: [
        part('M6 6h3v38H6z', 0),
        part('M39 6h3v38H39z', 0),
        part('M10 10h8v8H10z', 1),
        part('M22 11h7v7H22z', 1),
        part('M33 10h6v8H33z', 1),
        part('M6 18h36v3H6z', 0),
        part('M10 24h7v8H10z', 1),
        part('M21 25h9v7H21z', 1),
        part('M31 26h8v6H31z', 2),
        part('M6 32h36v3H6z', 0)
      ]
    },

    illGiftWrap: {
      box: 48, slots: ['상자', '리본', '카드'],
      colors: ['#e53935', '#ffca28', '#ffffff'],
      layers: [
        part('M8 18h32a2 2 0 0 1 2 2v22a2 2 0 0 1 -2 2H8a2 2 0 0 1 -2 -2V20a2 2 0 0 1 2 -2z', 0),
        part('M6 14h36a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2H6a2 2 0 0 1 -2 -2V16a2 2 0 0 1 2 -2z', 0),
        part('M21 14h6v30H21z', 1),
        part('M4 30h40v5H4z', 1),
        part('M15 12a4 4 0 1 0 8 0a4 4 0 1 0 -8 0z', 1),
        part('M25 12a4 4 0 1 0 8 0a4 4 0 1 0 -8 0z', 1),
        part('M31 34h10a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1H31a1 1 0 0 1 -1 -1V35a1 1 0 0 1 1 -1z', 2)
      ]
    },

    illPassport: {
      box: 48, slots: ['표지', '문장', '테두리', '글'],
      colors: ['#1e88e5', '#ffca28', '#0d47a1', '#ffffff'],
      layers: [
        part('M12 4h24a3 3 0 0 1 3 3v34a3 3 0 0 1 -3 3H12a3 3 0 0 1 -3 -3V7a3 3 0 0 1 3 -3z', 0),
        part('M14 8h20a2 2 0 0 1 2 2v28a2 2 0 0 1 -2 2H14a2 2 0 0 1 -2 -2V10a2 2 0 0 1 2 -2z', 2),
        part('M18 19a6 6 0 1 0 12 0a6 6 0 1 0 -12 0z', 1),
        part('M17 29h14v2H17z', 1),
        part('M19 33h10v1.6H19z', 3)
      ]
    },

    illBinoculars: {
      box: 48, slots: ['몸통', '렌즈', '연결', '테'],
      colors: ['#37474f', '#b3e5fc', '#546e7a', '#263238'],
      layers: [
        part('M10 12h6a4 4 0 0 1 4 4v18a4 4 0 0 1 -4 4H10a4 4 0 0 1 -4 -4V16a4 4 0 0 1 4 -4z', 0),
        part('M32 12h6a4 4 0 0 1 4 4v18a4 4 0 0 1 -4 4H32a4 4 0 0 1 -4 -4V16a4 4 0 0 1 4 -4z', 0),
        part('M19 20h10v9H19z', 2),
        part('M7.6 15a5.4 5.4 0 1 0 10.8 0a5.4 5.4 0 1 0 -10.8 0z', 3),
        part('M29.6 15a5.4 5.4 0 1 0 10.8 0a5.4 5.4 0 1 0 -10.8 0z', 3),
        part('M7.6 34a5.4 5.4 0 1 0 10.8 0a5.4 5.4 0 1 0 -10.8 0z', 1),
        part('M29.6 34a5.4 5.4 0 1 0 10.8 0a5.4 5.4 0 1 0 -10.8 0z', 1)
      ]
    },

    illStrawHat: {
      box: 48, slots: ['챙', '머리', '리본'],
      colors: ['#ffca28', '#ffd54f', '#e53935'],
      layers: [
        part('M4 28a20 9 0 1 0 40 0a20 9 0 1 0 -40 0z', 0),
        part('M14 20a10 8 0 1 0 20 0a10 8 0 1 0 -20 0z', 1),
        part('M14.4 24h19.2v3.4H14.4z', 2)
      ]
    },

    illParasol: {
      box: 48, slots: ['천', '줄무늬', '기둥', '모래'],
      colors: ['#e53935', '#ffffff', '#8d6e63', '#ffe082'],
      layers: [
        part('M3 22a21 21 0 0 1 42 0z', 0),
        part('M3.32 18.35A21 21 0 0 1 6.8 9.95L23.59 21.71A0.5 0.5 0 0 0 23.51 21.91z', 1),
        part('M11.95 4.8A21 21 0 0 1 20.35 1.32L23.91 21.51A0.5 0.5 0 0 0 23.71 21.59z', 1),
        part('M27.65 1.32A21 21 0 0 1 36.05 4.8L24.29 21.59A0.5 0.5 0 0 0 24.09 21.51z', 1),
        part('M41.2 9.95A21 21 0 0 1 44.68 18.35L24.49 21.91A0.5 0.5 0 0 0 24.41 21.71z', 1),
        part('M23 22h2v18H23z', 2),
        part('M6 42a18 4 0 1 0 36 0a18 4 0 1 0 -36 0z', 3)
      ]
    },

    illLantern: {
      box: 48, slots: ['몸통', '유리', '손잡이', '불빛'],
      colors: ['#37474f', '#ffca28', '#90a4ae', '#fff59d'],
      layers: [
        part('M14.6 14A9.4 9.4 0 0 1 33.4 14L31 14A7 7 0 0 0 17 14z', 2),
        part('M14 14L34 14L31 19L17 19z', 0),
        part('M18 19h12a2 2 0 0 1 2 2v13a2 2 0 0 1 -2 2H18a2 2 0 0 1 -2 -2V21a2 2 0 0 1 2 -2z', 1),
        part('M19.6 27a4.4 4.4 0 1 0 8.8 0a4.4 4.4 0 1 0 -8.8 0z', 3),
        part('M17 36L31 36L34 42L14 42z', 0)
      ]
    },

    illSleepingBag: {
      box: 48, slots: ['겉', '안', '베개', '지퍼'],
      colors: ['#3949ab', '#9fa8da', '#eceff1', '#90a4ae'],
      layers: [
        part('M14 10h20a5 5 0 0 1 5 5v22a5 5 0 0 1 -5 5H14a5 5 0 0 1 -5 -5V15a5 5 0 0 1 5 -5z', 0),
        part('M17 14h14a4 4 0 0 1 4 4v16a4 4 0 0 1 -4 4H17a4 4 0 0 1 -4 -4V18a4 4 0 0 1 4 -4z', 1),
        part('M15 17a9 4.4 0 1 0 18 0a9 4.4 0 1 0 -18 0z', 2),
        part('M23 10h2v32H23z', 3)
      ]
    },

    illWaterBottle: {
      box: 48, slots: ['몸통', '뚜껑', '라벨', '물'],
      colors: ['#e1f5fe', '#1e88e5', '#42a5f5', '#b3e5fc'],
      layers: [
        part('M21 5h6a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2H21a2 2 0 0 1 -2 -2V7a2 2 0 0 1 2 -2z', 1),
        part('M20 11h8v4H20z', 1),
        part('M18 15h12a4 4 0 0 1 4 4v20a4 4 0 0 1 -4 4H18a4 4 0 0 1 -4 -4V19a4 4 0 0 1 4 -4z', 0),
        part('M19 24h10a3 3 0 0 1 3 3v11a3 3 0 0 1 -3 3H19a3 3 0 0 1 -3 -3V27a3 3 0 0 1 3 -3z', 3),
        part('M14 22h20v8H14z', 2)
      ]
    },

    illMapPin: {
      box: 48, slots: ['핀', '안', '그림자'],
      colors: ['#e53935', '#ffffff', '#b71c1c'],
      layers: [
        part('M16 44a8 2.4 0 1 0 16 0a8 2.4 0 1 0 -16 0z', 2),
        part('M24 42C16 32 10 27 10 20a14 14 0 0 1 28 0c0 7-6 12-14 22z', 0),
        part('M18 20a6 6 0 1 0 12 0a6 6 0 1 0 -12 0z', 1)
      ]
    },

    illCarrier: {
      box: 48, slots: ['몸통', '손잡이', '바퀴', '테'],
      colors: ['#37474f', '#90a4ae', '#263238', '#546e7a'],
      layers: [
        part('M16 12A8 8 0 0 1 32 12L30 12A6 6 0 0 0 18 12z', 1),
        part('M13 12h22a3 3 0 0 1 3 3v22a3 3 0 0 1 -3 3H13a3 3 0 0 1 -3 -3V15a3 3 0 0 1 3 -3z', 0),
        part('M10 20h28v2.4H10z', 3),
        part('M10 30h28v2.4H10z', 3),
        part('M12.4 41a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0z', 2),
        part('M30.4 41a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0z', 2)
      ]
    },

    illBeachMat: {
      box: 48, slots: ['매트', '줄', '그늘'],
      colors: ['#26c6da', '#ffca28', '#00838f'],
      layers: [
        part('M5 22h38a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2H5a2 2 0 0 1 -2 -2V24a2 2 0 0 1 2 -2z', 0),
        part('M6 22h4v18H6z', 1),
        part('M16 22h4v18H16z', 1),
        part('M26 22h4v18H26z', 1),
        part('M36 22h4v18H36z', 1),
        part('M4 44a20 3 0 1 0 40 0a20 3 0 1 0 -40 0z', 2)
      ]
    },

    illPrinter: {
      box: 48, slots: ['몸통', '종이', '트레이', '표시'],
      colors: ['#90a4ae', '#ffffff', '#546e7a', '#4caf50'],
      layers: [
        part('M13 7h24v12H13z', 1),
        part('M11 18h28a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3H11a3 3 0 0 1 -3 -3V21a3 3 0 0 1 3 -3z', 0),
        part('M11 16h28v3H11z', 2),
        part('M14 34h22a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2H14a2 2 0 0 1 -2 -2V36a2 2 0 0 1 2 -2z', 2),
        part('M32.8 24a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0z', 3)
      ]
    },

    illMonitor: {
      box: 48, slots: ['테', '화면', '받침', '그래프'],
      colors: ['#37474f', '#1e88e5', '#546e7a', '#4caf50'],
      layers: [
        part('M7 7h34a2 2 0 0 1 2 2v22a2 2 0 0 1 -2 2H7a2 2 0 0 1 -2 -2V9a2 2 0 0 1 2 -2z', 0),
        part('M9 10h30a1 1 0 0 1 1 1v18a1 1 0 0 1 -1 1H9a1 1 0 0 1 -1 -1V11a1 1 0 0 1 1 -1z', 1),
        part('M21 33h6v6H21z', 2),
        part('M16.6 39h14.8a1.6 1.6 0 0 1 1.6 1.6v0.2a1.6 1.6 0 0 1 -1.6 1.6H16.6a1.6 1.6 0 0 1 -1.6 -1.6V40.6a1.6 1.6 0 0 1 1.6 -1.6z', 2),
        part('M13 22h4v8H13z', 3),
        part('M19 17h4v13H19z', 3),
        part('M25 20h4v10H25z', 3)
      ]
    },

    illKeyboard: {
      box: 48, slots: ['판', '키', '테'],
      colors: ['#455a64', '#cfd8dc', '#263238'],
      layers: [
        part('M5 15h38a2 2 0 0 1 2 2v15a2 2 0 0 1 -2 2H5a2 2 0 0 1 -2 -2V17a2 2 0 0 1 2 -2z', 0),
        part('M5 30h38v3H5z', 2),
        part('M5.6 18h2.8v3.2H5.6z', 1),
        part('M9.4 18h2.8v3.2H9.4z', 1),
        part('M13.2 18h2.8v3.2H13.2z', 1),
        part('M17 18h2.8v3.2H17z', 1),
        part('M20.8 18h2.8v3.2H20.8z', 1),
        part('M24.6 18h2.8v3.2H24.6z', 1),
        part('M28.4 18h2.8v3.2H28.4z', 1),
        part('M32.2 18h2.8v3.2H32.2z', 1),
        part('M36 18h2.8v3.2H36z', 1),
        part('M39.8 18h2.8v3.2H39.8z', 1),
        part('M5.6 22h2.8v3.2H5.6z', 1),
        part('M9.4 22h2.8v3.2H9.4z', 1),
        part('M13.2 22h2.8v3.2H13.2z', 1),
        part('M17 22h2.8v3.2H17z', 1),
        part('M20.8 22h2.8v3.2H20.8z', 1),
        part('M24.6 22h2.8v3.2H24.6z', 1),
        part('M28.4 22h2.8v3.2H28.4z', 1),
        part('M32.2 22h2.8v3.2H32.2z', 1),
        part('M36 22h2.8v3.2H36z', 1),
        part('M39.8 22h2.8v3.2H39.8z', 1),
        part('M5.6 26h2.8v3.2H5.6z', 1),
        part('M9.4 26h2.8v3.2H9.4z', 1),
        part('M13.2 26h2.8v3.2H13.2z', 1),
        part('M17 26h2.8v3.2H17z', 1),
        part('M20.8 26h2.8v3.2H20.8z', 1),
        part('M24.6 26h2.8v3.2H24.6z', 1),
        part('M28.4 26h2.8v3.2H28.4z', 1),
        part('M32.2 26h2.8v3.2H32.2z', 1),
        part('M36 26h2.8v3.2H36z', 1),
        part('M39.8 26h2.8v3.2H39.8z', 1),
        part('M16 30h16v2.6H16z', 1)
      ]
    },

    illMouse: {
      box: 48, slots: ['몸통', '버튼', '휠'],
      colors: ['#90a4ae', '#cfd8dc', '#546e7a'],
      layers: [
        part('M11 18a6.5 9 0 1 0 13 0a6.5 9 0 1 0 -13 0z', 1),
        part('M24 18a6.5 9 0 1 0 13 0a6.5 9 0 1 0 -13 0z', 1),
        part('M11 26a13 18 0 1 0 26 0a13 18 0 1 0 -26 0z', 0),
        part('M24 10h0a1.2 1.2 0 0 1 1.2 1.2v5.6a1.2 1.2 0 0 1 -1.2 1.2H24a1.2 1.2 0 0 1 -1.2 -1.2V11.2a1.2 1.2 0 0 1 1.2 -1.2z', 2)
      ]
    },

    illDesk: {
      box: 48, slots: ['상판', '다리', '서랍', '물건'],
      colors: ['#a1887f', '#8d6e63', '#d7a86e', '#42a5f5'],
      layers: [
        part('M9 10h11a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1H9a1 1 0 0 1 -1 -1V11a1 1 0 0 1 1 -1z', 3),
        part('M3.6 18h40.8a1.6 1.6 0 0 1 1.6 1.6v1.8a1.6 1.6 0 0 1 -1.6 1.6H3.6a1.6 1.6 0 0 1 -1.6 -1.6V19.6a1.6 1.6 0 0 1 1.6 -1.6z', 0),
        part('M6 23h4v20H6z', 1),
        part('M38 23h4v20H38z', 1),
        part('M29.6 23h10.8a1.6 1.6 0 0 1 1.6 1.6v8.8a1.6 1.6 0 0 1 -1.6 1.6H29.6a1.6 1.6 0 0 1 -1.6 -1.6V24.6a1.6 1.6 0 0 1 1.6 -1.6z', 2),
        part('M32 28h6v2H32z', 1)
      ]
    },

    illChair: {
      box: 48, slots: ['등받이', '앉는판', '기둥', '바퀴'],
      colors: ['#546e7a', '#37474f', '#263238', '#90a4ae'],
      layers: [
        part('M17 6h14a3 3 0 0 1 3 3v10a3 3 0 0 1 -3 3H17a3 3 0 0 1 -3 -3V9a3 3 0 0 1 3 -3z', 0),
        part('M13 21h22a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2H13a2 2 0 0 1 -2 -2V23a2 2 0 0 1 2 -2z', 1),
        part('M22 27h4v9H22z', 2),
        part('M12 36h24v3H12z', 2),
        part('M11.4 41.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0z', 3),
        part('M31.4 41.5a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0z', 3)
      ]
    },

    illWhiteboard: {
      box: 48, slots: ['판', '테', '글', '받침'],
      colors: ['#ffffff', '#90a4ae', '#e53935', '#546e7a'],
      layers: [
        part('M5 6h38a2 2 0 0 1 2 2v24a2 2 0 0 1 -2 2H5a2 2 0 0 1 -2 -2V8a2 2 0 0 1 2 -2z', 1),
        part('M6 8h36a1 1 0 0 1 1 1v22a1 1 0 0 1 -1 1H6a1 1 0 0 1 -1 -1V9a1 1 0 0 1 1 -1z', 0),
        part('M9 14h16v2H9z', 2),
        part('M9 19h22v2H9z', 2),
        part('M9 24h12v2H9z', 2),
        part('M6 34h36v2.4H6z', 1),
        part('M10 36h3v8H10z', 3),
        part('M35 36h3v8H35z', 3)
      ]
    },

    illFileCabinet: {
      box: 48, slots: ['몸통', '서랍', '손잡이', '라벨'],
      colors: ['#607d8b', '#90a4ae', '#37474f', '#ffffff'],
      layers: [
        part('M11 4h26a2 2 0 0 1 2 2v36a2 2 0 0 1 -2 2H11a2 2 0 0 1 -2 -2V6a2 2 0 0 1 2 -2z', 0),
        part('M13 8h22a1 1 0 0 1 1 1v7a1 1 0 0 1 -1 1H13a1 1 0 0 1 -1 -1V9a1 1 0 0 1 1 -1z', 1),
        part('M14.8 10.5h6.4a0.8 0.8 0 0 1 0.8 0.8v2.4a0.8 0.8 0 0 1 -0.8 0.8H14.8a0.8 0.8 0 0 1 -0.8 -0.8V11.3a0.8 0.8 0 0 1 0.8 -0.8z', 3),
        part('M25 11.5h8v2H25z', 2),
        part('M13 19h22a1 1 0 0 1 1 1v7a1 1 0 0 1 -1 1H13a1 1 0 0 1 -1 -1V20a1 1 0 0 1 1 -1z', 1),
        part('M14.8 21.5h6.4a0.8 0.8 0 0 1 0.8 0.8v2.4a0.8 0.8 0 0 1 -0.8 0.8H14.8a0.8 0.8 0 0 1 -0.8 -0.8V22.3a0.8 0.8 0 0 1 0.8 -0.8z', 3),
        part('M25 22.5h8v2H25z', 2),
        part('M13 30h22a1 1 0 0 1 1 1v7a1 1 0 0 1 -1 1H13a1 1 0 0 1 -1 -1V31a1 1 0 0 1 1 -1z', 1),
        part('M14.8 32.5h6.4a0.8 0.8 0 0 1 0.8 0.8v2.4a0.8 0.8 0 0 1 -0.8 0.8H14.8a0.8 0.8 0 0 1 -0.8 -0.8V33.3a0.8 0.8 0 0 1 0.8 -0.8z', 3),
        part('M25 33.5h8v2H25z', 2)
      ]
    },

    illMeetingTable: {
      box: 48, slots: ['상판', '다리', '의자', '서류'],
      colors: ['#a1887f', '#8d6e63', '#546e7a', '#ffffff'],
      layers: [
        part('M5 16h4a2 2 0 0 1 2 2v5a2 2 0 0 1 -2 2H5a2 2 0 0 1 -2 -2V18a2 2 0 0 1 2 -2z', 2),
        part('M39 16h4a2 2 0 0 1 2 2v5a2 2 0 0 1 -2 2H39a2 2 0 0 1 -2 -2V18a2 2 0 0 1 2 -2z', 2),
        part('M5 29h4a2 2 0 0 1 2 2v5a2 2 0 0 1 -2 2H5a2 2 0 0 1 -2 -2V31a2 2 0 0 1 2 -2z', 2),
        part('M39 29h4a2 2 0 0 1 2 2v5a2 2 0 0 1 -2 2H39a2 2 0 0 1 -2 -2V31a2 2 0 0 1 2 -2z', 2),
        part('M8 22a16 6.4 0 1 0 32 0a16 6.4 0 1 0 -32 0z', 0),
        part('M22 26h4v12H22z', 1),
        part('M15 39a9 2.6 0 1 0 18 0a9 2.6 0 1 0 -18 0z', 1),
        part('M19 18h10v7H19z', 3)
      ]
    },

    illStand: {
      box: 48, slots: ['갓', '기둥', '받침', '빛'],
      colors: ['#37474f', '#546e7a', '#263238', '#fff59d'],
      layers: [
        part('M15 24L33 24L40 38L8 38z', 3),
        part('M11 22L37 22L32 8L16 8z', 0),
        part('M23 22h2.6v16H23z', 1),
        part('M15 41a9 3 0 1 0 18 0a9 3 0 1 0 -18 0z', 2)
      ]
    },

    illPadlock: {
      box: 48, slots: ['몸통', '고리', '열쇠구멍'],
      colors: ['#ffca28', '#90a4ae', '#8d6e63'],
      layers: [
        part('M13.6 20A10.4 10.4 0 0 1 34.4 20L31 20A7 7 0 0 0 17 20z', 1),
        part('M13 20h22a4 4 0 0 1 4 4v16a4 4 0 0 1 -4 4H13a4 4 0 0 1 -4 -4V24a4 4 0 0 1 4 -4z', 0),
        part('M21 29a3 3 0 1 0 6 0a3 3 0 1 0 -6 0z', 2),
        part('M22.4 30L25.6 30L26.6 38L21.4 38z', 2)
      ]
    },

    illShield: {
      box: 48, slots: ['방패', '테', '별'],
      colors: ['#1e88e5', '#0d47a1', '#ffffff'],
      layers: [
        part('M24 4l16 5v14c0 10-7 18-16 21-9-3-16-11-16-21V9z', 0),
        part('M24 8l12 3.8v11c0 7.6-5.2 13.6-12 16-6.8-2.4-12-8.4-12-16v-11z', 1),
        part('M24 15L25.76 19.57L30.66 19.84L26.85 22.93L28.11 27.66L24 25L19.89 27.66L21.15 22.93L17.34 19.84L22.24 19.57z', 2)
      ]
    },

    illAlarm: {
      box: 48, slots: ['몸통', '확성기', '버튼', '받침'],
      colors: ['#e53935', '#b71c1c', '#ffca28', '#37474f'],
      layers: [
        part('M27 17L44 7L44 41L27 31z', 1),
        part('M10 17h14a4 4 0 0 1 4 4v6a4 4 0 0 1 -4 4H10a4 4 0 0 1 -4 -4V21a4 4 0 0 1 4 -4z', 0),
        part('M13 24a4 4 0 1 0 8 0a4 4 0 1 0 -8 0z', 2),
        part('M8 31h6v9H8z', 1),
        part('M5.6 39h12.8a1.6 1.6 0 0 1 1.6 1.6v0.8a1.6 1.6 0 0 1 -1.6 1.6H5.6a1.6 1.6 0 0 1 -1.6 -1.6V40.6a1.6 1.6 0 0 1 1.6 -1.6z', 3)
      ]
    },

    illCCTV: {
      box: 48, slots: ['몸통', '렌즈', '받침', '표시'],
      colors: ['#546e7a', '#263238', '#37474f', '#e53935'],
      layers: [
        part('M14 4h13v3H14z', 2),
        part('M19 6h3v8H19z', 2),
        part('M11 14h20a3 3 0 0 1 3 3v10a3 3 0 0 1 -3 3H11a3 3 0 0 1 -3 -3V17a3 3 0 0 1 3 -3z', 0),
        part('M28 22a7 7 0 1 0 14 0a7 7 0 1 0 -14 0z', 1),
        part('M11.2 18a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0z', 3),
        part('M20 30h3v8H20z', 2),
        part('M13.5 39a8 2.6 0 1 0 16 0a8 2.6 0 1 0 -16 0z', 2)
      ]
    },

    illHelmet: {
      box: 48, slots: ['모자', '챙', '줄'],
      colors: ['#ffca28', '#f9a825', '#546e7a'],
      layers: [
        part('M22 14h4v16H22z', 1),
        part('M8 30a16 16 0 0 1 32 0z', 0),
        part('M6.4 29h35.2a2.4 2.4 0 0 1 2.4 2.4v0.2a2.4 2.4 0 0 1 -2.4 2.4H6.4a2.4 2.4 0 0 1 -2.4 -2.4V31.4a2.4 2.4 0 0 1 2.4 -2.4z', 1),
        part('M23.2 34h1.6v8H23.2z', 2)
      ]
    },

    illLifeJacket: {
      box: 48, slots: ['조끼', '테', '줄', '어깨'],
      colors: ['#ff7043', '#e64a19', '#37474f', '#ffccbc'],
      layers: [
        part('M12 10h1a3 3 0 0 1 3 3v7a3 3 0 0 1 -3 3H12a3 3 0 0 1 -3 -3V13a3 3 0 0 1 3 -3z', 3),
        part('M35 10h1a3 3 0 0 1 3 3v7a3 3 0 0 1 -3 3H35a3 3 0 0 1 -3 -3V13a3 3 0 0 1 3 -3z', 3),
        part('M13 12L19 7L29 7L35 12L35 36L13 36z', 0),
        part('M19 7L24 16L29 7z', 2),
        part('M17 17h3v19H17z', 2),
        part('M28 17h3v19H28z', 2),
        part('M13 24h22v4H13z', 1),
        part('M13 31h22v4H13z', 1)
      ]
    },

    illTrafficLight: {
      box: 48, slots: ['몸통', '빨강', '노랑', '초록', '기둥'],
      colors: ['#37474f', '#e53935', '#ffca28', '#4caf50', '#546e7a'],
      layers: [
        part('M22.5 14h3v30H22.5z', 4),
        part('M20 4h8a5 5 0 0 1 5 5v20a5 5 0 0 1 -5 5H20a5 5 0 0 1 -5 -5V9a5 5 0 0 1 5 -5z', 0),
        part('M20 11a4 4 0 1 0 8 0a4 4 0 1 0 -8 0z', 1),
        part('M20 19a4 4 0 1 0 8 0a4 4 0 1 0 -8 0z', 2),
        part('M20 27a4 4 0 1 0 8 0a4 4 0 1 0 -8 0z', 3),
        part('M16 43h16v3H16z', 4)
      ]
    },

    illExit: {
      box: 48, slots: ['판', '문', '화살', '글'],
      colors: ['#2e7d32', '#42a5f5', '#a5d6a7', '#ffffff'],
      layers: [
        part('M6 14h36a3 3 0 0 1 3 3v14a3 3 0 0 1 -3 3H6a3 3 0 0 1 -3 -3V17a3 3 0 0 1 3 -3z', 0),
        part('M7 18h12v12H7z', 1),
        part('M9.5 22h7v4H9.5z', 3),
        part('M25 18.6L37 24L25 29.4z', 2),
        part('M29 22.6h9v2.8H29z', 3)
      ]
    },

    illHose: {
      box: 48, slots: ['호스', '노즐', '테'],
      colors: ['#e53935', '#90a4ae', '#b71c1c'],
      layers: [
        part('M34 15L44 9L46 13L36 19z', 1),
        part('M5 26a17 17 0 1 0 34 0 17 17 0 1 0 -34 0zM12 26a10 10 0 1 1 20 0 10 10 0 1 1 -20 0z', 0),
        part('M12 26a10 10 0 1 0 20 0 10 10 0 1 0 -20 0zM17 26a5 5 0 1 1 10 0 5 5 0 1 1 -10 0z', 2)
      ]
    },

    illSafe: {
      box: 48, slots: ['몸통', '문', '손잡이', '다이얼'],
      colors: ['#455a64', '#546e7a', '#90a4ae', '#ffca28'],
      layers: [
        part('M9 42h6v2H9z', 0),
        part('M33 42h6v2H33z', 0),
        part('M9 10h30a3 3 0 0 1 3 3v26a3 3 0 0 1 -3 3H9a3 3 0 0 1 -3 -3V13a3 3 0 0 1 3 -3z', 0),
        part('M11 13h26a2 2 0 0 1 2 2v22a2 2 0 0 1 -2 2H11a2 2 0 0 1 -2 -2V15a2 2 0 0 1 2 -2z', 1),
        part('M7 16h2v5H7z', 2),
        part('M7 31h2v5H7z', 2),
        part('M13 24h7v3H13z', 2),
        part('M22 26a6 6 0 1 0 12 0a6 6 0 1 0 -12 0z', 3)
      ]
    },

    illCactus: {
      box: 48, slots: ['몸', '팔', '화분', '꽃'],
      colors: ['#43a047', '#2e7d32', '#d7a86e', '#f06292'],
      layers: [
        part('M14 12h0a3 3 0 0 1 3 3v6a3 3 0 0 1 -3 3H14a3 3 0 0 1 -3 -3V15a3 3 0 0 1 3 -3z', 1),
        part('M11 20h10v4H11z', 1),
        part('M34 16h0a3 3 0 0 1 3 3v6a3 3 0 0 1 -3 3H34a3 3 0 0 1 -3 -3V19a3 3 0 0 1 3 -3z', 1),
        part('M28 24h10v4H28z', 1),
        part('M24 6h0a4 4 0 0 1 4 4v22a4 4 0 0 1 -4 4H24a4 4 0 0 1 -4 -4V10a4 4 0 0 1 4 -4z', 0),
        part('M15 34h18a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2H15a2 2 0 0 1 -2 -2V36a2 2 0 0 1 2 -2z', 2),
        part('M21 5a3 3 0 1 0 6 0a3 3 0 1 0 -6 0z', 3)
      ]
    },

    illPalmTree: {
      box: 48, slots: ['줄기', '잎', '모래'],
      colors: ['#a1887f', '#43a047', '#ffe082'],
      layers: [
        part('M8 43a16 4 0 1 0 32 0a16 4 0 1 0 -32 0z', 2),
        part('M21 16L27 16L30 42L18 42z', 0),
        part('M24 12.2L11.6 12.2L11.6 19.8L24 19.8z', 1),
        part('M26.44 13.09L16.94 5.12L12.06 10.94L21.56 18.91z', 1),
        part('M27.8 16L27.8 3.6L20.2 3.6L20.2 16z', 1),
        part('M26.44 18.91L35.94 10.94L31.06 5.12L21.56 13.09z', 1),
        part('M24 19.8L36.4 19.8L36.4 12.2L24 12.2z', 1)
      ]
    },

    illPineTree: {
      box: 48, slots: ['잎', '잎 그늘', '기둥'],
      colors: ['#2e7d32', '#1b5e20', '#795548'],
      layers: [
        part('M22 33h5v13H22z', 2),
        part('M24 4L36 18L12 18z', 0),
        part('M24 11L39 27L9 27z', 1),
        part('M24 19L42 36L6 36z', 0)
      ]
    },

    illMaple: {
      box: 48, slots: ['잎', '잎 그늘', '기둥', '땅'],
      colors: ['#e53935', '#b71c1c', '#8d6e63', '#ffcc80'],
      layers: [
        part('M7 43a17 4 0 1 0 34 0a17 4 0 1 0 -34 0z', 3),
        part('M22 24h5v19H22z', 2),
        part('M5 22a8 8 0 1 0 16 0a8 8 0 1 0 -16 0z', 0),
        part('M27 22a8 8 0 1 0 16 0a8 8 0 1 0 -16 0z', 0),
        part('M12 16a12 12 0 1 0 24 0a12 12 0 1 0 -24 0z', 0),
        part('M21.6 20a7.4 7.4 0 1 0 14.8 0a7.4 7.4 0 1 0 -14.8 0z', 1)
      ]
    },

    illTulip: {
      box: 48, slots: ['꽃', '꽃 속', '줄기', '잎'],
      colors: ['#e53935', '#ffcdd2', '#4caf50', '#66bb6a'],
      layers: [
        part('M23.5 30L10 22L8 26L23 36z', 3),
        part('M24.5 32L38 24L40 28L25 38z', 3),
        part('M23 22h2.4v22H23z', 2),
        part('M24 4c4 0 7 5 7 11v3a7 7 0 0 1 -14 0v-3c0-6 3-11 7-11z', 0),
        part('M24 7c2.4 0 4 3.4 4 7.6V17a4 4 0 0 1 -8 0v-2.4c0-4.2 1.6-7.6 4-7.6z', 1)
      ]
    },

    illClover: {
      box: 48, slots: ['잎', '가운데', '줄기'],
      colors: ['#43a047', '#2e7d32', '#66bb6a'],
      layers: [
        part('M24 28L26 28L28 44L22 44z', 2),
        part('M8 16a8 8 0 1 0 16 0a8 8 0 1 0 -16 0z', 0),
        part('M24 16a8 8 0 1 0 16 0a8 8 0 1 0 -16 0z', 0),
        part('M8 32a8 8 0 1 0 16 0a8 8 0 1 0 -16 0z', 0),
        part('M24 32a8 8 0 1 0 16 0a8 8 0 1 0 -16 0z', 0),
        part('M19 24a5 5 0 1 0 10 0a5 5 0 1 0 -10 0z', 1)
      ]
    },

    illShell: {
      box: 48, slots: ['조개', '테', '빛'],
      colors: ['#ffab91', '#f4511e', '#ffccbc'],
      layers: [
        part('M4 34a20 20 0 0 1 40 0z', 0),
        part('M24 33.3L4.6 33.3L4.6 34.7L24 34.7z', 1),
        part('M24.24 33.34L6.01 26.71L5.53 28.02L23.76 34.66z', 1),
        part('M24.45 33.46L9.59 20.99L8.69 22.07L23.55 34.54z', 1),
        part('M24.61 33.65L14.91 16.85L13.69 17.55L23.39 34.35z', 1),
        part('M24.69 33.88L21.32 14.77L19.94 15.02L23.31 34.12z', 1),
        part('M24.69 34.12L28.06 15.02L26.68 14.77L23.31 33.88z', 1),
        part('M24.61 34.35L34.31 17.55L33.09 16.85L23.39 33.65z', 1),
        part('M24.45 34.54L39.31 22.07L38.41 20.99L23.55 33.46z', 1),
        part('M24.24 34.66L42.47 28.02L41.99 26.71L23.76 33.34z', 1),
        part('M24 34.7L43.4 34.7L43.4 33.3L24 33.3z', 1),
        part('M5 32.6h38v3H5z', 1),
        part('M21.6 36a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0z', 2)
      ]
    },

    illCoral: {
      box: 48, slots: ['산호', '산호2', '바닥'],
      colors: ['#f06292', '#ec407a', '#ffcc80'],
      layers: [
        part('M6 42a18 4 0 1 0 36 0a18 4 0 1 0 -36 0z', 2),
        part('M21 42L27 42L27 24L21 24z', 0),
        part('M21 32L15 26L11 30L19 38z', 1),
        part('M27 28L33 22L37 26L29 34z', 1),
        part('M20 22a4 4 0 1 0 8 0a4 4 0 1 0 -8 0z', 0),
        part('M9 27a4 4 0 1 0 8 0a4 4 0 1 0 -8 0z', 1),
        part('M31 24a4 4 0 1 0 8 0a4 4 0 1 0 -8 0z', 1)
      ]
    },

    illStarfish: {
      box: 48, slots: ['몸', '팔', '점'],
      colors: ['#ff7043', '#f4511e', '#ffccbc'],
      layers: [
        part('M28 18L28 3.5L20 3.5L20 18z', 1),
        part('M30.94 25.95L44.73 21.47L42.26 13.86L28.47 18.34z', 1),
        part('M24.29 31.21L32.81 42.94L39.29 38.23L30.76 26.5z', 1),
        part('M17.24 26.5L8.71 38.23L15.19 42.94L23.71 31.21z', 1),
        part('M19.53 18.34L5.74 13.86L3.27 21.47L17.06 25.95z', 1),
        part('M15.6 24a8.4 8.4 0 1 0 16.8 0a8.4 8.4 0 1 0 -16.8 0z', 0),
        part('M22.4 20a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0z', 2),
        part('M18.4 27a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0z', 2),
        part('M26.4 27a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0z', 2)
      ]
    },

    illSeaweed: {
      box: 48, slots: ['해초', '해초2', '모래'],
      colors: ['#00897b', '#26a69a', '#ffe082'],
      layers: [
        part('M6 43a18 4 0 1 0 36 0a18 4 0 1 0 -36 0z', 2),
        part('M17 43C17 28 19 16 24 8l3 1c-5 8-7 20-7 34z', 1),
        part('M24 43C25 30 28 20 34 13l2.6 1.6c-5 7-7.6 17-8.6 28.4z', 0),
        part('M10 43C10 34 11 26 13.6 20l2.6 1c-2.4 6-3.2 14-3.2 22z', 0)
      ]
    },

    illCherryBlossom: {
      box: 48, slots: ['꽃잎', '가운데', '수술'],
      colors: ['#f8bbd0', '#fff9c4', '#f48fb1'],
      layers: [
        part('M17 14.4a7 7 0 1 0 14 0a7 7 0 1 0 -14 0z', 0),
        part('M26.13 21.03a7 7 0 1 0 14 0a7 7 0 1 0 -14 0z', 0),
        part('M22.64 31.77a7 7 0 1 0 14 0a7 7 0 1 0 -14 0z', 0),
        part('M11.36 31.77a7 7 0 1 0 14 0a7 7 0 1 0 -14 0z', 0),
        part('M7.87 21.03a7 7 0 1 0 14 0a7 7 0 1 0 -14 0z', 0),
        part('M19 24a5 5 0 1 0 10 0a5 5 0 1 0 -10 0z', 1),
        part('M22.6 20.6a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0z', 2),
        part('M25.54 25.7a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0z', 2),
        part('M19.66 25.7a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0z', 2)
      ]
    },

    illMapleLeaf: {
      box: 48, slots: ['잎', '잎맥', '줄기'],
      colors: ['#e53935', '#b71c1c', '#8d6e63'],
      layers: [
        part('M24 3L29 13L36 8L35 17L45 19L38 25L44 33L34 32L32 42L24 35L16 42L14 32L4 33L10 25L3 19L13 17L12 8L19 13z', 0),
        part('M24.7 30L24.7 20L23.3 20L23.3 30z', 1),
        part('M24.45 29.46L16.02 22.39L15.12 23.47L23.55 30.54z', 1),
        part('M24.45 30.54L32.88 23.47L31.98 22.39L23.55 29.46z', 1),
        part('M24 29.3L12 29.3L12 30.7L24 30.7z', 1),
        part('M24 30.7L36 30.7L36 29.3L24 29.3z', 1),
        part('M23 33h2v11H23z', 2)
      ]
    },

    illLeafPile: {
      box: 48, slots: ['잎1', '잎2', '잎3'],
      colors: ['#e53935', '#ffb300', '#8d6e63'],
      layers: [
        part('M3.42 27.61L11.48 25.92L16.58 32.39L8.52 34.08z', 0),
        part('M13.45 28.59L17.16 19.94L26.55 19.41L22.84 28.06z', 1),
        part('M27.76 19.94L35.76 23.37L36.24 32.06L28.24 28.63z', 2),
        part('M33.62 33.71L38.94 28.05L46.38 30.29L41.06 35.95z', 0),
        part('M11.26 32.48L18.66 38.3L16.74 47.52L9.34 41.7z', 1),
        part('M21.7 43.45L21.38 33.33L30.3 28.55L30.62 38.67z', 2),
        part('M31.94 37.5L40.17 37.24L44.06 44.5L35.83 44.76z', 0),
        part('M4.08 43.26L2.74 36.81L7.92 32.74L9.26 39.19z', 1),
        part('M17.5 42.85L24.71 39.97L30.5 45.15L23.29 48.03z', 2)
      ]
    },

    illFan: {
      box: 48, slots: ['날개', '테', '기둥', '가운데'],
      colors: ['#e1f5fe', '#90a4ae', '#546e7a', '#37474f'],
      layers: [
        part('M27.11 25.11L36.59 15.64L30.36 9.41L20.89 18.89z', 0),
        part('M20.89 25.11L30.36 34.59L36.59 28.36L27.11 18.89z', 0),
        part('M20.89 18.89L11.41 28.36L17.64 34.59L27.11 25.11z', 0),
        part('M27.11 18.89L17.64 9.41L11.41 15.64L20.89 25.11z', 0),
        part('M8 22a16 16 0 1 0 32 0a16 16 0 1 0 -32 0zM9.4 22a14.6 14.6 0 1 1 29.2 0a14.6 14.6 0 1 1 -29.2 0z', 1),
        part('M20.6 22a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0z', 3),
        part('M22 38h4v6H22z', 2),
        part('M15 44a9 2.6 0 1 0 18 0a9 2.6 0 1 0 -18 0z', 2)
      ]
    },

    illHeater: {
      box: 48, slots: ['몸통', '불', '테', '다리'],
      colors: ['#90a4ae', '#ff7043', '#546e7a', '#37474f'],
      layers: [
        part('M11 12h26a3 3 0 0 1 3 3v18a3 3 0 0 1 -3 3H11a3 3 0 0 1 -3 -3V15a3 3 0 0 1 3 -3z', 0),
        part('M11 14h3v20H11z', 2),
        part('M15.6 14h3v20H15.6z', 2),
        part('M20.2 14h3v20H20.2z', 2),
        part('M24.8 14h3v20H24.8z', 2),
        part('M29.4 14h3v20H29.4z', 2),
        part('M34 14h3v20H34z', 2),
        part('M10 34h28v3H10z', 1),
        part('M12 36h4v6H12z', 3),
        part('M32 36h4v6H32z', 3)
      ]
    },

    illGloves: {
      box: 48, slots: ['장갑', '손목', '줄'],
      colors: ['#e53935', '#b71c1c', '#ffcdd2'],
      layers: [
        part('M4 26a5 5 0 1 0 10 0a5 5 0 1 0 -10 0z', 0),
        part('M21 10h2a9 9 0 0 1 9 9v8a9 9 0 0 1 -9 9H21a9 9 0 0 1 -9 -9V19a9 9 0 0 1 9 -9z', 0),
        part('M13 34h18a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2H13a2 2 0 0 1 -2 -2V36a2 2 0 0 1 2 -2z', 1),
        part('M12 37.4h20v1.8H12z', 2)
      ]
    },

    illScarf: {
      box: 48, slots: ['목도리', '줄', '술'],
      colors: ['#7e57c2', '#b39ddb', '#ffca28'],
      layers: [
        part('M10 18a14 10 0 1 0 28 0a14 10 0 1 0 -28 0zM16 18a8 4 0 1 1 16 0a8 4 0 1 1 -16 0z', 0),
        part('M22 24L32 24L33 42L21 42z', 0),
        part('M22 29h10v2.4H22z', 1),
        part('M21.4 35h11v2.4H21.4z', 1),
        part('M22 42h1.8v4H22z', 2),
        part('M24.8 42h1.8v4H24.8z', 2),
        part('M27.6 42h1.8v4H27.6z', 2),
        part('M30.4 42h1.8v4H30.4z', 2)
      ]
    },

    illHandWarmer: {
      box: 48, slots: ['몸통', '테', '불', '뚜껑'],
      colors: ['#ff7043', '#90a4ae', '#ffca28', '#e64a19'],
      layers: [
        part('M19 8h10a8 8 0 0 1 8 8v16a8 8 0 0 1 -8 8H19a8 8 0 0 1 -8 -8V16a8 8 0 0 1 8 -8z', 0),
        part('M21 12h6a6 6 0 0 1 6 6v12a6 6 0 0 1 -6 6H21a6 6 0 0 1 -6 -6V18a6 6 0 0 1 6 -6z', 1),
        part('M18 24a6 6 0 1 0 12 0a6 6 0 1 0 -12 0z', 2),
        part('M20 3h8a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2H20a2 2 0 0 1 -2 -2V5a2 2 0 0 1 2 -2z', 3)
      ]
    },

    illRaincoat: {
      box: 48, slots: ['우비', '후드', '단추'],
      colors: ['#ffca28', '#f9a825', '#8d6e63'],
      layers: [
        part('M14 16L6 22L8 38L14 36z', 0),
        part('M34 16L42 22L40 38L34 36z', 0),
        part('M14 14L34 14L38 42L10 42z', 0),
        part('M15 12a9 8 0 1 0 18 0a9 8 0 1 0 -18 0z', 1),
        part('M22.4 22a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0z', 2),
        part('M22.4 28a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0z', 2),
        part('M22.4 34a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0z', 2)
      ]
    },

    illSwimRing: {
      box: 48, slots: ['튜브', '줄무늬', '구멍'],
      colors: ['#ffca28', '#e53935', '#4fc3f7'],
      layers: [
        part('M6 25a18 14 0 1 0 36 0a18 14 0 1 0 -36 0zM12 25a12 8 0 1 1 24 0a12 8 0 1 1 -24 0z', 0),
        part('M40.91 31.16A18 18 0 0 1 36.04 38.38L32.03 33.92A12 12 0 0 0 35.28 29.1z', 1),
        part('M17.84 41.91A18 18 0 0 1 10.62 37.04L15.08 33.03A12 12 0 0 0 19.9 36.28z', 1),
        part('M7.09 18.84A18 18 0 0 1 11.96 11.62L15.97 16.08A12 12 0 0 0 12.72 20.9z', 1),
        part('M30.16 8.09A18 18 0 0 1 37.38 12.96L32.92 16.97A12 12 0 0 0 28.1 13.72z', 1),
        part('M12 25a12 8 0 1 0 24 0a12 8 0 1 0 -24 0z', 2)
      ]
    },

    illTablet: {
      box: 48, slots: ['테', '화면', '앱', '버튼'],
      colors: ['#37474f', '#e1f5fe', '#42a5f5', '#90a4ae'],
      layers: [
        part('M10 4h28a4 4 0 0 1 4 4v32a4 4 0 0 1 -4 4H10a4 4 0 0 1 -4 -4V8a4 4 0 0 1 4 -4z', 0),
        part('M11 8h26a2 2 0 0 1 2 2v28a2 2 0 0 1 -2 2H11a2 2 0 0 1 -2 -2V10a2 2 0 0 1 2 -2z', 1),
        part('M22.4 42a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0z', 3),
        part('M13.6 12h3.4a1.6 1.6 0 0 1 1.6 1.6v3.4a1.6 1.6 0 0 1 -1.6 1.6H13.6a1.6 1.6 0 0 1 -1.6 -1.6V13.6a1.6 1.6 0 0 1 1.6 -1.6z', 2),
        part('M22.2 12h3.4a1.6 1.6 0 0 1 1.6 1.6v3.4a1.6 1.6 0 0 1 -1.6 1.6H22.2a1.6 1.6 0 0 1 -1.6 -1.6V13.6a1.6 1.6 0 0 1 1.6 -1.6z', 2),
        part('M30.8 12h3.4a1.6 1.6 0 0 1 1.6 1.6v3.4a1.6 1.6 0 0 1 -1.6 1.6H30.8a1.6 1.6 0 0 1 -1.6 -1.6V13.6a1.6 1.6 0 0 1 1.6 -1.6z', 2),
        part('M13.6 20.6h3.4a1.6 1.6 0 0 1 1.6 1.6v3.4a1.6 1.6 0 0 1 -1.6 1.6H13.6a1.6 1.6 0 0 1 -1.6 -1.6V22.2a1.6 1.6 0 0 1 1.6 -1.6z', 2),
        part('M22.2 20.6h3.4a1.6 1.6 0 0 1 1.6 1.6v3.4a1.6 1.6 0 0 1 -1.6 1.6H22.2a1.6 1.6 0 0 1 -1.6 -1.6V22.2a1.6 1.6 0 0 1 1.6 -1.6z', 2),
        part('M30.8 20.6h3.4a1.6 1.6 0 0 1 1.6 1.6v3.4a1.6 1.6 0 0 1 -1.6 1.6H30.8a1.6 1.6 0 0 1 -1.6 -1.6V22.2a1.6 1.6 0 0 1 1.6 -1.6z', 2)
      ]
    },

    illSpeaker2: {
      box: 48, slots: ['몸통', '유닛', '가운데'],
      colors: ['#546e7a', '#90a4ae', '#37474f'],
      layers: [
        part('M16 4h16a3 3 0 0 1 3 3v34a3 3 0 0 1 -3 3H16a3 3 0 0 1 -3 -3V7a3 3 0 0 1 3 -3z', 0),
        part('M19 14a5 5 0 1 0 10 0a5 5 0 1 0 -10 0z', 1),
        part('M22 14a2 2 0 1 0 4 0a2 2 0 1 0 -4 0z', 2),
        part('M16 32a8 8 0 1 0 16 0a8 8 0 1 0 -16 0z', 1),
        part('M20.6 32a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0z', 2)
      ]
    },

    illHeadset: {
      box: 48, slots: ['밴드', '이어컵', '마이크', '쿠션'],
      colors: ['#37474f', '#546e7a', '#e53935', '#90a4ae'],
      layers: [
        part('M4 24A20 20 0 0 1 44 24L40 24A16 16 0 0 0 8 24z', 0),
        part('M5.4 22h2.2a3.4 3.4 0 0 1 3.4 3.4v9.2a3.4 3.4 0 0 1 -3.4 3.4H5.4a3.4 3.4 0 0 1 -3.4 -3.4V25.4a3.4 3.4 0 0 1 3.4 -3.4z', 1),
        part('M40.4 22h2.2a3.4 3.4 0 0 1 3.4 3.4v9.2a3.4 3.4 0 0 1 -3.4 3.4H40.4a3.4 3.4 0 0 1 -3.4 -3.4V25.4a3.4 3.4 0 0 1 3.4 -3.4z', 1),
        part('M11 25h0.4a1.6 1.6 0 0 1 1.6 1.6v6.8a1.6 1.6 0 0 1 -1.6 1.6H11a1.6 1.6 0 0 1 -1.6 -1.6V26.6a1.6 1.6 0 0 1 1.6 -1.6z', 3),
        part('M36.2 25h0.4a1.6 1.6 0 0 1 1.6 1.6v6.8a1.6 1.6 0 0 1 -1.6 1.6H36.2a1.6 1.6 0 0 1 -1.6 -1.6V26.6a1.6 1.6 0 0 1 1.6 -1.6z', 3),
        part('M32.12 34.81A10.6 10.6 0 0 1 15.88 34.81L17.11 33.79A9 9 0 0 0 30.89 33.79z', 2),
        part('M21 39a3 3 0 1 0 6 0a3 3 0 1 0 -6 0z', 2)
      ]
    },

    illWebcam: {
      box: 48, slots: ['몸통', '렌즈', '표시', '받침'],
      colors: ['#37474f', '#e1f5fe', '#4caf50', '#546e7a'],
      layers: [
        part('M16 12h16a5 5 0 0 1 5 5v12a5 5 0 0 1 -5 5H16a5 5 0 0 1 -5 -5V17a5 5 0 0 1 5 -5z', 0),
        part('M17 23a7 7 0 1 0 14 0a7 7 0 1 0 -14 0z', 1),
        part('M20.6 23a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0z', 3),
        part('M14.4 16a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0z', 2),
        part('M19 34h10v5H19z', 3),
        part('M13.6 38h20.8a1.6 1.6 0 0 1 1.6 1.6v0.2a1.6 1.6 0 0 1 -1.6 1.6H13.6a1.6 1.6 0 0 1 -1.6 -1.6V39.6a1.6 1.6 0 0 1 1.6 -1.6z', 3)
      ]
    },

    illUSB: {
      box: 48, slots: ['몸통', '금속', '표시'],
      colors: ['#f06292', '#90a4ae', '#ffca28'],
      layers: [
        part('M16 4h16a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2H16a2 2 0 0 1 -2 -2V6a2 2 0 0 1 2 -2z', 1),
        part('M16.4 7h15.2v2H16.4z', 2),
        part('M16.4 11h15.2v2H16.4z', 2),
        part('M20 16h8a3 3 0 0 1 3 3v14a3 3 0 0 1 -3 3H20a3 3 0 0 1 -3 -3V19a3 3 0 0 1 3 -3z', 0),
        part('M17 20h14v2H17z', 1),
        part('M23.2 26h1.6a1.6 1.6 0 0 1 1.6 1.6v3.8a1.6 1.6 0 0 1 -1.6 1.6H23.2a1.6 1.6 0 0 1 -1.6 -1.6V27.6a1.6 1.6 0 0 1 1.6 -1.6z', 1)
      ]
    },

    illWifi: {
      box: 48, slots: ['전파', '점'],
      colors: ['#1e88e5', '#0d47a1'],
      layers: [
        part('M1.48 27A26 26 0 0 1 46.52 27L43.05 29A22 22 0 0 0 4.95 29z', 0),
        part('M7.55 30.5A19 19 0 0 1 40.45 30.5L36.99 32.5A15 15 0 0 0 11.01 32.5z', 0),
        part('M13.61 34A12 12 0 0 1 34.39 34L30.93 36A8 8 0 0 0 17.07 36z', 0),
        part('M20 40a4 4 0 1 0 8 0a4 4 0 1 0 -8 0z', 1)
      ]
    },

    illBattery: {
      box: 48, slots: ['몸통', '충전', '빈칸', '단자'],
      colors: ['#37474f', '#4caf50', '#90a4ae', '#546e7a'],
      layers: [
        part('M31.4 6h5.2a1.4 1.4 0 0 1 1.4 1.4v1.2a1.4 1.4 0 0 1 -1.4 1.4H31.4a1.4 1.4 0 0 1 -1.4 -1.4V7.4a1.4 1.4 0 0 1 1.4 -1.4z', 3),
        part('M9 9h30a3 3 0 0 1 3 3v20a3 3 0 0 1 -3 3H9a3 3 0 0 1 -3 -3V12a3 3 0 0 1 3 -3z', 0),
        part('M10 13h8v18H10z', 1),
        part('M20 13h8v18H20z', 1),
        part('M30 13h8v18H30z', 2)
      ]
    },

    illCharger: {
      box: 48, slots: ['몸통', '단자', '줄', '표시'],
      colors: ['#eceff1', '#90a4ae', '#546e7a', '#4caf50'],
      layers: [
        part('M17 4h3.4v7H17z', 1),
        part('M27.6 4h3.4v7H27.6z', 1),
        part('M16 10h16a4 4 0 0 1 4 4v16a4 4 0 0 1 -4 4H16a4 4 0 0 1 -4 -4V14a4 4 0 0 1 4 -4z', 0),
        part('M21.4 22a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0z', 3),
        part('M35.28 38.1A12 12 0 0 1 12.72 38.1L14.6 37.42A10 10 0 0 0 33.4 37.42z', 2)
      ]
    },

    illSmartWatch: {
      box: 48, slots: ['몸통', '화면', '밴드', '버튼'],
      colors: ['#37474f', '#4fc3f7', '#546e7a', '#90a4ae'],
      layers: [
        part('M20 2h8a3 3 0 0 1 3 3v6a3 3 0 0 1 -3 3H20a3 3 0 0 1 -3 -3V5a3 3 0 0 1 3 -3z', 2),
        part('M20 34h8a3 3 0 0 1 3 3v6a3 3 0 0 1 -3 3H20a3 3 0 0 1 -3 -3V37a3 3 0 0 1 3 -3z', 2),
        part('M16 12h16a5 5 0 0 1 5 5v14a5 5 0 0 1 -5 5H16a5 5 0 0 1 -5 -5V17a5 5 0 0 1 5 -5z', 0),
        part('M17 15h14a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3H17a3 3 0 0 1 -3 -3V18a3 3 0 0 1 3 -3z', 1),
        part('M37 20h3v6H37z', 3)
      ]
    },

    illDrone: {
      box: 48, slots: ['몸통', '로터', '팔', '카메라'],
      colors: ['#37474f', '#90a4ae', '#546e7a', '#e53935'],
      layers: [
        part('M22.44 19.9L15.37 12.83L12.83 15.37L19.9 22.44z', 2),
        part('M7.1 14.1a7 2.6 0 1 0 14 0a7 2.6 0 1 0 -14 0z', 1),
        part('M28.1 22.44L35.17 15.37L32.63 12.83L25.56 19.9z', 2),
        part('M26.9 14.1a7 2.6 0 1 0 14 0a7 2.6 0 1 0 -14 0z', 1),
        part('M19.9 25.56L12.83 32.63L15.37 35.17L22.44 28.1z', 2),
        part('M7.1 33.9a7 2.6 0 1 0 14 0a7 2.6 0 1 0 -14 0z', 1),
        part('M25.56 28.1L32.63 35.17L35.17 32.63L28.1 25.56z', 2),
        part('M26.9 33.9a7 2.6 0 1 0 14 0a7 2.6 0 1 0 -14 0z', 1),
        part('M21 17h6a4 4 0 0 1 4 4v6a4 4 0 0 1 -4 4H21a4 4 0 0 1 -4 -4V21a4 4 0 0 1 4 -4z', 0),
        part('M20.6 28a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0z', 3)
      ]
    }
  };

  /* ==================================================== PPT 장식 요소

     그림(일러스트)과 달리 **꾸미는 도형**이다. 기본 배색을 박아 두지 않아
     요소 패널에서 고른 색 하나로 슬롯 색이 배합된다 —
       슬롯0 주색 · 슬롯1 옅은 톤 · 슬롯2 진한 톤
     그래서 발표 자료의 테마 색에 그대로 맞출 수 있다. 48×48 기준. */

  var DECORATIONS = {

    /* -------------------------------------------- 배경 장식 */
    decoBlob: {
      box: 48, slots: ['블롭', '옅은 무늬'],
      layers: [
        part('M24 5C34 3.5 44 11 43.5 21.5 43 32 35 44 24 43 13 42 4.5 34 5 23.5 5.5 13 14 6.5 24 5z', 0),
        part(circlePath(18, 18, 6), 1),
        part(circlePath(33, 30, 4.5), 1)
      ]
    },

    decoBlobSoft: {
      box: 48, slots: ['작은 블롭', '큰 블롭', '점'],
      layers: [
        part('M24 7C33 5.5 42 12 42 21 42 30 34 41 24 41 14 41 6 33 6 24 6 15 15 8.5 24 7z', 1),
        part('M22 16C28 15 34 19 34 25 34 31 28 36 22 35.5 16 35 11 30 11 25 11 20 16 16.5 22 16z', 0),
        part(circlePath(34, 15, 3), 2)
      ]
    },

    decoWaveBand: {
      box: 48, slots: ['물결', '아래 물결'],
      layers: [
        part('M0 28C8 20 16 36 24 28 32 20 40 36 48 28L48 48H0z', 0),
        part('M0 38C8 31 16 45 24 38 32 31 40 45 48 38L48 48H0z', 1)
      ]
    },

    decoDiagonalBand: {
      box: 48, slots: ['띠1', '띠2', '띠3'],
      layers: [
        part(polygonD([{ x: 0, y: 14 }, { x: 48, y: 0 }, { x: 48, y: 9 }, { x: 0, y: 23 }]), 0),
        part(polygonD([{ x: 0, y: 26 }, { x: 48, y: 12 }, { x: 48, y: 21 }, { x: 0, y: 35 }]), 1),
        part(polygonD([{ x: 0, y: 38 }, { x: 48, y: 24 }, { x: 48, y: 33 }, { x: 0, y: 47 }]), 2)
      ]
    },

    decoCircleCluster: {
      box: 48, slots: ['원1', '원2', '원3'],
      layers: [
        part(circlePath(17, 18, 12), 0),
        part(circlePath(32, 21, 13), 1),
        part(circlePath(24, 34, 11), 2)
      ]
    },

    decoTriangleMosaic: {
      box: 48, slots: ['큰 삼각', '반대 삼각', '강조'],
      layers: [
        part(polygonD([{ x: 3, y: 3 }, { x: 45, y: 3 }, { x: 3, y: 45 }]), 0),
        part(polygonD([{ x: 45, y: 3 }, { x: 45, y: 45 }, { x: 3, y: 45 }]), 1),
        part(polygonD([{ x: 24, y: 11 }, { x: 37, y: 24 }, { x: 24, y: 37 }, { x: 11, y: 24 }]), 2)
      ]
    },

    /* -------------------------------------------- 구분선 · 띠 */
    decoDividerWave: {
      box: 48, slots: ['띠', '옅은 띠'],
      layers: [
        part('M0 20C8 12 16 28 24 20 32 12 40 28 48 20L48 30C40 38 32 22 24 30 16 38 8 22 0 30z', 0),
        part('M8 36C14 32 18 40 24 36 30 32 34 40 40 36L40 40C34 44 30 36 24 40 18 44 14 36 8 40z', 1)
      ]
    },

    decoDividerPeak: {
      box: 48, slots: ['산', '옅은 띠'],
      layers: [
        part(polygonD([{ x: 0, y: 22 }, { x: 8, y: 12 }, { x: 16, y: 22 }, { x: 24, y: 10 },
          { x: 32, y: 22 }, { x: 40, y: 12 }, { x: 48, y: 22 },
          { x: 48, y: 28 }, { x: 0, y: 28 }]), 0),
        part(rectPath(0, 32, 48, 3), 1)
      ]
    },

    decoDividerCurve: {
      box: 48, slots: ['곡선', '옅은 띠'],
      layers: [
        part('M0 26C12 10 36 10 48 26L48 32C36 18 12 18 0 32z', 0),
        part(rectPath(0, 38, 48, 3), 1)
      ]
    },

    decoDividerDots: {
      box: 48, slots: ['가운데 점', '옅은 선'],
      layers: [
        part(rectPath(0, 23, 15, 2), 1),
        part(rectPath(33, 23, 15, 2), 1),
        part(circlePath(24, 24, 4.5), 0),
        part(circlePath(13, 24, 2.2), 1),
        part(circlePath(35, 24, 2.2), 1)
      ]
    },

    decoDividerDiamond: {
      box: 48, slots: ['마름모', '선', '가운데'],
      layers: [
        part(rectPath(0, 23, 11, 2), 1),
        part(rectPath(37, 23, 11, 2), 1),
        part(polygonD([{ x: 24, y: 12 }, { x: 35, y: 24 }, { x: 24, y: 36 }, { x: 13, y: 24 }]), 0),
        part(polygonD([{ x: 24, y: 19 }, { x: 29, y: 24 }, { x: 24, y: 29 }, { x: 19, y: 24 }]), 2)
      ]
    },

    decoDividerRibbon: {
      box: 48, slots: ['배지', '선', '가운데'],
      layers: [
        part(rectPath(0, 23, 16, 2), 1),
        part(rectPath(32, 23, 16, 2), 1),
        part(circlePath(24, 24, 8), 0),
        part(circlePath(24, 24, 3.4), 2)
      ]
    },

    /* -------------------------------------------- 리본 · 배지 */
    decoRibbon: {
      box: 48, slots: ['리본', '윗면', '접힘'],
      layers: [
        part(polygonD([{ x: 1, y: 20 }, { x: 12, y: 20 }, { x: 12, y: 34 }, { x: 1, y: 30 }]), 2),
        part(polygonD([{ x: 36, y: 20 }, { x: 47, y: 20 }, { x: 47, y: 30 }, { x: 36, y: 34 }]), 2),
        part(roundRectPath(9, 13, 30, 17, 2), 0),
        part(rectPath(9, 13, 30, 4), 1)
      ]
    },

    decoRibbonTail: {
      box: 48, slots: ['리본', '윗면', '접힘'],
      layers: [
        part(polygonD([{ x: 7, y: 12 }, { x: 17, y: 12 }, { x: 17, y: 26 }, { x: 7, y: 22 }]), 2),
        part(polygonD([{ x: 31, y: 12 }, { x: 41, y: 12 }, { x: 41, y: 22 }, { x: 31, y: 26 }]), 2),
        part(roundRectPath(14, 6, 20, 30, 2), 0),
        part(rectPath(14, 6, 20, 4), 1),
        part(polygonD([{ x: 14, y: 36 }, { x: 24, y: 29 }, { x: 34, y: 36 },
          { x: 34, y: 45 }, { x: 24, y: 38 }, { x: 14, y: 45 }]), 0)
      ]
    },

    decoBannerFlag: {
      box: 48, slots: ['깃발', '윗면', '깃대'],
      layers: [
        part(roundRectPath(7, 3, 2.6, 41, 1.3), 2),
        part(circlePath(8.3, 3.6, 2.6), 2),
        part(polygonD([{ x: 11, y: 6 }, { x: 44, y: 6 }, { x: 36, y: 14.5 },
          { x: 44, y: 23 }, { x: 11, y: 23 }]), 0),
        part(rectPath(11, 6, 33, 3.4), 1)
      ]
    },

    decoLabelTag: {
      box: 48, slots: ['태그', '구멍', '선'],
      layers: [
        part(polygonD([{ x: 5, y: 13 }, { x: 33, y: 13 }, { x: 44, y: 24 },
          { x: 33, y: 35 }, { x: 5, y: 35 }]), 0),
        part(circlePath(14, 24, 3.4), 1),
        part(rectPath(20, 20, 15, 3), 2),
        part(rectPath(20, 26, 10, 3), 2)
      ]
    },

    decoBookmark: {
      box: 48, slots: ['본체', '윗면'],
      layers: [
        part(polygonD([{ x: 15, y: 5 }, { x: 33, y: 5 }, { x: 33, y: 43 },
          { x: 24, y: 35 }, { x: 15, y: 43 }]), 0),
        part(rectPath(15, 5, 18, 5), 1)
      ]
    },

    decoBadge: {
      box: 48, slots: ['원', '안쪽', '별 · 꼬리'],
      layers: [
        part(polygonD([{ x: 7, y: 28 }, { x: 18, y: 28 }, { x: 18, y: 45 },
          { x: 12.5, y: 39 }, { x: 7, y: 45 }]), 2),
        part(polygonD([{ x: 30, y: 28 }, { x: 41, y: 28 }, { x: 41, y: 45 },
          { x: 35.5, y: 39 }, { x: 30, y: 45 }]), 2),
        part(circlePath(24, 21, 15), 0),
        part(circlePath(24, 21, 11), 1),
        part(starAt(24, 21, 5, 7, 3), 2)
      ]
    },

    decoPillBadge: {
      box: 48, slots: ['배지', '안쪽', '점'],
      layers: [
        part(roundRectPath(2, 14, 44, 20, 10), 0),
        part(roundRectPath(5.5, 17.5, 37, 13, 6.5), 1),
        part(circlePath(24, 24, 3.4), 2)
      ]
    },

    decoHexBadge: {
      box: 48, slots: ['배지', '안쪽', '가운데'],
      layers: [
        part(polyAt(24, 24, 21, 6), 0),
        part(polyAt(24, 24, 16, 6), 1),
        part(polyAt(24, 24, 7, 6), 2)
      ]
    },

    /* -------------------------------------------- 프레임 · 테두리 */
    decoFrameDouble: {
      box: 48, slots: ['바깥', '안쪽'],
      layers: [
        part(rectRingPath(2, 2, 44, 44, 3), 0),
        part(rectRingPath(9, 9, 30, 30, 2.4), 1)
      ]
    },

    decoFrameCorners: {
      box: 48, slots: ['모서리'],
      layers: partsOf([
        polygonD([{ x: 3, y: 3 }, { x: 21, y: 3 }, { x: 21, y: 7.5 }, { x: 7.5, y: 7.5 },
          { x: 7.5, y: 21 }, { x: 3, y: 21 }]),
        polygonD([{ x: 45, y: 3 }, { x: 45, y: 21 }, { x: 40.5, y: 21 }, { x: 40.5, y: 7.5 },
          { x: 27, y: 7.5 }, { x: 27, y: 3 }]),
        polygonD([{ x: 3, y: 45 }, { x: 3, y: 27 }, { x: 7.5, y: 27 }, { x: 7.5, y: 40.5 },
          { x: 21, y: 40.5 }, { x: 21, y: 45 }]),
        polygonD([{ x: 45, y: 45 }, { x: 27, y: 45 }, { x: 27, y: 40.5 }, { x: 40.5, y: 40.5 },
          { x: 40.5, y: 27 }, { x: 45, y: 27 }])
      ], 0)
    },

    decoFrameDots: {
      box: 48, slots: ['점선'],
      layers: (function () {
        var list = [];

        [4, 11.2, 18.4, 25.6, 32.8, 40].forEach(function (v) {
          list.push(part(rectPath(v, 2, 4.4, 3), 0));
          list.push(part(rectPath(v, 43, 4.4, 3), 0));
          list.push(part(rectPath(2, v, 3, 4.4), 0));
          list.push(part(rectPath(43, v, 3, 4.4), 0));
        });

        return list;
      })()
    },

    decoFrameBadge: {
      box: 48, slots: ['테두리', '배지', '가운데'],
      layers: [
        part(rectRingPath(2, 8, 44, 38, 3), 0),
        part(circlePath(24, 8, 8), 1),
        part(circlePath(24, 8, 3.6), 2)
      ]
    },

    decoCorner: {
      box: 48, slots: ['삼각', '선'],
      layers: [
        part(polygonD([{ x: 2, y: 2 }, { x: 26, y: 2 }, { x: 2, y: 26 }]), 0),
        part(rectPath(2, 2, 22, 2.6), 1),
        part(rectPath(2, 2, 2.6, 22), 1),
        part(rectPath(30, 2, 16, 2.6), 1)
      ]
    },

    /* -------------------------------------------- 강조 · 화살표 */
    decoQuote: {
      box: 48, slots: ['따옴표'],
      layers: [
        part(circlePath(15, 17, 8), 0),
        part(polygonD([{ x: 7, y: 22 }, { x: 15, y: 22 }, { x: 11.5, y: 37 }, { x: 4.5, y: 37 }]), 0),
        part(circlePath(33, 17, 8), 0),
        part(polygonD([{ x: 25, y: 22 }, { x: 33, y: 22 }, { x: 29.5, y: 37 }, { x: 22.5, y: 37 }]), 0)
      ]
    },

    decoSparkBurst: {
      box: 48, slots: ['폭발', '반짝'],
      layers: [
        part(starAt(22, 24, 12, 20, 13), 0),
        part(sparkleAt(41, 10, 6), 1),
        part(sparkleAt(43, 36, 4), 1),
        part(sparkleAt(6, 40, 4.5), 1)
      ]
    },

    decoFocusLines: {
      box: 48, slots: ['빛살', '가운데', '속'],
      layers: partsOf(rayPaths(24, 24, 17, 23.5, 0.055, 12), 0).concat([
        part(circlePath(24, 24, 11), 1),
        part(circlePath(24, 24, 6), 2)
      ])
    },

    decoChevron3: {
      box: 48, slots: ['1', '2', '3'],
      layers: [
        part(polygonD([{ x: 1, y: 12 }, { x: 12, y: 12 }, { x: 18, y: 24 },
          { x: 12, y: 36 }, { x: 1, y: 36 }, { x: 7, y: 24 }]), 0),
        part(polygonD([{ x: 16, y: 12 }, { x: 27, y: 12 }, { x: 33, y: 24 },
          { x: 27, y: 36 }, { x: 16, y: 36 }, { x: 22, y: 24 }]), 1),
        part(polygonD([{ x: 31, y: 12 }, { x: 42, y: 12 }, { x: 48, y: 24 },
          { x: 42, y: 36 }, { x: 31, y: 36 }, { x: 37, y: 24 }]), 2)
      ]
    },

    decoSteps: {
      box: 48, slots: ['1단', '2단', '3단'],
      layers: [
        part(roundRectPath(3, 30, 13, 15, 2), 0),
        part(roundRectPath(17.5, 22, 13, 23, 2), 1),
        part(roundRectPath(32, 14, 13, 31, 2), 2)
      ]
    },

    decoArrowRibbon: {
      box: 48, slots: ['화살표', '안쪽'],
      layers: [
        part(polygonD([{ x: 2, y: 15 }, { x: 29, y: 15 }, { x: 29, y: 6 }, { x: 46, y: 24 },
          { x: 29, y: 42 }, { x: 29, y: 33 }, { x: 2, y: 33 }]), 0),
        part(polygonD([{ x: 7, y: 20 }, { x: 29, y: 20 }, { x: 29, y: 12.5 }, { x: 39, y: 24 },
          { x: 29, y: 35.5 }, { x: 29, y: 28 }, { x: 7, y: 28 }]), 1)
      ]
    },

    decoCycle: {
      box: 48, slots: ['1', '2', '3'],
      layers: [
        part(arcBandPath(24, 24, 12, 18, -155, -35), 0),
        part(arcBandPath(24, 24, 12, 18, -35, 85), 1),
        part(arcBandPath(24, 24, 12, 18, 85, 205), 2)
      ]
    },

    decoRibbonArrow: {
      box: 48, slots: ['화살표', '꼬리', '점'],
      layers: [
        part(polygonD([{ x: 2, y: 34 }, { x: 18, y: 18 }, { x: 27, y: 27 }, { x: 38, y: 16 },
          { x: 32, y: 16 }, { x: 32, y: 10 }, { x: 46, y: 10 }, { x: 46, y: 24 },
          { x: 40, y: 24 }, { x: 40, y: 18 }, { x: 27, y: 31 }, { x: 18, y: 22 },
          { x: 2, y: 38 }]), 0),
        part(rectPath(2, 34, 16, 4), 1),
        part(circlePath(43, 43, 3.5), 2)
      ]
    }
  };

  /* ==================================================== 일러스트형 장식

     아이콘처럼 한 색에서 배합되지 않고, **처음부터 색이 정해진** 꾸미기 요소다.
     (가랜드·풍선·금장 배지·월계관처럼 색이 곧 뜻인 것들) 그래서 요소 패널에서
     고른 색과 무관하게 자기 배색으로 들어가고, 넣은 뒤 부품별로 바꿀 수 있다.
     반대로 색을 테마에 맞춰야 하는 단색 장식은 아이콘 탭에 있다. */

  var ART_DECORATIONS = {

    /* -------------------------------------------- 행사 · 파티 */
    artGarland: {
      box: 48, slots: ['줄', '빨강', '노랑', '파랑', '초록'],
      colors: ['#90a4ae', '#ef5350', '#ffca28', '#42a5f5', '#66bb6a'],
      layers: [
        part('M0 9C12 18 36 18 48 9L48 12.5C36 21.5 12 21.5 0 12.5z', 0),
        part(polygonD([{ x: 3, y: 13 }, { x: 11, y: 13 }, { x: 7, y: 25 }]), 1),
        part(polygonD([{ x: 12, y: 16 }, { x: 20, y: 16 }, { x: 16, y: 28 }]), 2),
        part(polygonD([{ x: 21, y: 17.5 }, { x: 29, y: 17.5 }, { x: 25, y: 29.5 }]), 3),
        part(polygonD([{ x: 30, y: 16 }, { x: 38, y: 16 }, { x: 34, y: 28 }]), 4),
        part(polygonD([{ x: 39, y: 13 }, { x: 47, y: 13 }, { x: 43, y: 25 }]), 1)
      ]
    },

    artConfetti: {
      box: 48, slots: ['빨강', '노랑', '파랑', '초록', '보라'],
      colors: ['#ef5350', '#ffca28', '#42a5f5', '#66bb6a', '#ab47bc'],
      layers: [
        part(rectPath(5, 7, 4, 4), 0),
        part(circlePath(16, 10, 2.6), 1),
        part(rectPath(28, 5, 4, 4), 2),
        part(circlePath(40, 10, 2.6), 3),
        part(rectPath(10, 20, 4, 4), 4),
        part(circlePath(24, 18, 2.4), 0),
        part(rectPath(36, 22, 4, 4), 1),
        part(circlePath(7, 33, 2.6), 2),
        part(rectPath(18, 30, 4, 4), 3),
        part(circlePath(31, 33, 2.4), 4),
        part(rectPath(41, 36, 4, 4), 0),
        part(circlePath(14, 42, 2.4), 1),
        part(rectPath(26, 41, 4, 4), 2)
      ]
    },

    artBalloons: {
      box: 48, slots: ['빨강', '노랑', '파랑', '끈'],
      colors: ['#ef5350', '#ffca28', '#42a5f5', '#90a4ae'],
      layers: [
        part(polygonD([{ x: 13, y: 29 }, { x: 14.5, y: 29 }, { x: 23.5, y: 43 }, { x: 22, y: 43 }]), 3),
        part(polygonD([{ x: 23.5, y: 24 }, { x: 25, y: 24 }, { x: 24.6, y: 43 }, { x: 23.1, y: 43 }]), 3),
        part(polygonD([{ x: 35, y: 29 }, { x: 33.5, y: 29 }, { x: 24.5, y: 43 }, { x: 26, y: 43 }]), 3),
        part(ellipsePath(14, 18, 9, 11), 0),
        part(polygonD([{ x: 11, y: 28 }, { x: 17, y: 28 }, { x: 14, y: 31 }]), 0),
        part(ellipsePath(24, 12, 8, 10), 1),
        part(polygonD([{ x: 21.5, y: 21.5 }, { x: 26.5, y: 21.5 }, { x: 24, y: 24 }]), 1),
        part(ellipsePath(34, 18, 9, 11), 2),
        part(polygonD([{ x: 31, y: 28 }, { x: 37, y: 28 }, { x: 34, y: 31 }]), 2)
      ]
    },

    artPartyHat: {
      box: 48, slots: ['모자', '줄무늬', '방울', '테두리'],
      colors: ['#ffca28', '#ef5350', '#42a5f5', '#f9a825'],
      layers: [
        part(polygonD([{ x: 24, y: 5 }, { x: 38, y: 41 }, { x: 10, y: 41 }]), 0),
        part(polygonD([{ x: 19, y: 21 }, { x: 29, y: 21 }, { x: 31, y: 27 }, { x: 17, y: 27 }]), 1),
        part(circlePath(24, 6, 4.2), 2),
        part(roundRectPath(9, 40, 30, 3.4, 1.7), 3)
      ]
    },

    artBunting: {
      box: 48, slots: ['줄', '깃발1', '깃발2', '점'],
      colors: ['#8d6e63', '#42a5f5', '#ef5350', '#ffffff'],
      layers: [
        part('M0 11C12 19 36 19 48 11L48 13.5C36 21.5 12 21.5 0 13.5z', 0),
        part('M3 16a4 4 0 0 0 8 0z', 1),
        part('M12 16a4 4 0 0 0 8 0z', 2),
        part('M21 16a4 4 0 0 0 8 0z', 1),
        part('M30 16a4 4 0 0 0 8 0z', 2),
        part('M39 16a4 4 0 0 0 8 0z', 1),
        part(circlePath(7, 20, 1.1), 3),
        part(circlePath(25, 20, 1.1), 3),
        part(circlePath(43, 20, 1.1), 3)
      ]
    },

    artCurtain: {
      box: 48, slots: ['1', '2', '3', '4'],
      colors: ['#ef5350', '#ffca28', '#66bb6a', '#42a5f5'],
      layers: [
        part(polygonD([{ x: 2, y: 5 }, { x: 13, y: 5 }, { x: 13, y: 37 },
          { x: 7.5, y: 45 }, { x: 2, y: 37 }]), 0),
        part(polygonD([{ x: 14, y: 5 }, { x: 25, y: 5 }, { x: 25, y: 37 },
          { x: 19.5, y: 45 }, { x: 14, y: 37 }]), 1),
        part(polygonD([{ x: 26, y: 5 }, { x: 37, y: 5 }, { x: 37, y: 37 },
          { x: 31.5, y: 45 }, { x: 26, y: 37 }]), 2),
        part(polygonD([{ x: 38, y: 5 }, { x: 46, y: 5 }, { x: 46, y: 37 },
          { x: 42, y: 45 }, { x: 38, y: 37 }]), 3)
      ]
    },

    /* -------------------------------------------- 상장 · 기념 */
    artAward: {
      box: 48, slots: ['금장', '별', '리본', '그림자'],
      colors: ['#fbc02d', '#ffffff', '#e53935', '#b71c1c'],
      layers: [
        part(polygonD([{ x: 8, y: 27 }, { x: 19, y: 27 }, { x: 19, y: 45 },
          { x: 13.5, y: 39 }, { x: 8, y: 45 }]), 3),
        part(polygonD([{ x: 29, y: 27 }, { x: 40, y: 27 }, { x: 40, y: 45 },
          { x: 34.5, y: 39 }, { x: 29, y: 45 }]), 3),
        part(circlePath(24, 21, 15), 0),
        part(circlePath(24, 21, 11.5), 2),
        part(starAt(24, 21, 5, 8, 3.6), 1)
      ]
    },

    artLaurel: {
      box: 48, slots: ['잎', '잎 그늘', '열매'],
      colors: ['#66bb6a', '#388e3c', '#fbc02d'],
      layers: (function () {
        var list = [];
        var i, x, y;

        function leaf(x1, y1, dx, dir) {
          var x2 = x1 + dx * dir;
          var x3 = x1 + dx * 0.72 * dir;
          var x4 = x1 + dx * 0.35 * dir;

          return 'M' + round1(x1) + ' ' + round1(y1) +
            'C' + round1(x4 + dx * 0.07 * dir) + ' ' + round1(y1 - 3) +
            ' ' + round1(x3 + dx * 0.07 * dir) + ' ' + round1(y1 - 5) +
            ' ' + round1(x2) + ' ' + round1(y1 - 5) +
            'C' + round1(x3 - dx * 0.2 * dir) + ' ' + round1(y1 + 0.5) +
            ' ' + round1(x4 - dx * 0.1 * dir) + ' ' + round1(y1 + 0.5) +
            ' ' + round1(x1) + ' ' + round1(y1) + 'z';
        }

        for (i = 0; i < 7; i++) {
          x = 4 + i * 2.6;
          y = 34 - i * 3.4;
          list.push(part(leaf(x, y, 9.5, 1), i % 2 ? 1 : 0));
          list.push(part(leaf(44 - i * 2.6, y, 9.5, -1), i % 2 ? 1 : 0));
        }

        list.push(part(circlePath(6, 38, 2.4), 2));
        list.push(part(circlePath(42, 38, 2.4), 2));
        list.push(part(circlePath(24, 44, 2.6), 2));
        return list;
      })()
    },

    artMedals: {
      box: 48, slots: ['금', '은', '동', '리본'],
      colors: ['#fbc02d', '#cfd8dc', '#a1887f', '#ef5350'],
      layers: (function () {
        var list = [];

        [9, 24, 39].forEach(function (x, i) {
          list.push(part(polygonD([{ x: x - 4, y: 3 }, { x: x + 4, y: 3 }, { x: x + 4, y: 14 },
            { x: x, y: 9.5 }, { x: x - 4, y: 14 }]), 3));
          list.push(part(circlePath(x, 25, 7.6), i));
          list.push(part(circlePath(x, 25, 4.4), 0));
        });

        return list;
      })()
    },

    artCrown: {
      box: 48, slots: ['왕관', '보석', '보석2', '테두리'],
      colors: ['#fbc02d', '#ef5350', '#42a5f5', '#f9a825'],
      layers: [
        part(polygonD([{ x: 4, y: 33 }, { x: 4, y: 15 }, { x: 13, y: 24 }, { x: 24, y: 7 },
          { x: 35, y: 24 }, { x: 44, y: 15 }, { x: 44, y: 33 }]), 0),
        part(circlePath(24, 14, 3.6), 1),
        part(circlePath(13, 25, 3), 2),
        part(circlePath(35, 25, 3), 2),
        part(roundRectPath(4, 33, 40, 6, 1.6), 3)
      ]
    },

    artGoldFrame: {
      box: 48, slots: ['금', '안쪽', '리본', '그늘'],
      colors: ['#fbc02d', '#fff8e1', '#e53935', '#f9a825'],
      layers: [
        part(polygonD([{ x: 2, y: 2 }, { x: 22, y: 2 }, { x: 2, y: 22 }]), 2),
        part(rectRingPath(2, 2, 44, 44, 3.6), 0),
        part(rectRingPath(9.5, 9.5, 29, 29, 2.4), 3)
      ]
    },

    artStarTrio: {
      box: 48, slots: ['금별', '은별', '동별'],
      colors: ['#fbc02d', '#cfd8dc', '#a1887f'],
      layers: [
        part(starAt(24, 16, 5, 12, 5), 0),
        part(starAt(11, 33, 5, 8, 3.4), 1),
        part(starAt(37, 33, 5, 8, 3.4), 2)
      ]
    },

    /* -------------------------------------------- 자연 장식 */
    artLeafLine: {
      box: 48, slots: ['잎', '잎 그늘', '줄기'],
      colors: ['#66bb6a', '#388e3c', '#8d6e63'],
      layers: [part(roundRectPath(2, 22.8, 44, 2.4, 1.2), 2)].concat(
        partsOf([leafAt(6, 22.8, 12, 1), leafAt(18, 22.8, 12, 1), leafAt(30, 22.8, 12, 1),
          leafAt(12, 25.2, 10, -1), leafAt(24, 25.2, 10, -1), leafAt(36, 25.2, 10, -1)], 0)
      ).concat(
        partsOf([leafAt(11, 22.8, 9, 1), leafAt(23, 22.8, 9, 1), leafAt(35, 22.8, 9, 1)], 1)
      )
    },

    artFlowerSprig: {
      box: 48, slots: ['꽃잎', '꽃 가운데', '줄기', '잎'],
      colors: ['#f06292', '#ffca28', '#4caf50', '#81c784'],
      layers: [part(roundRectPath(23, 24, 2.4, 21, 1.2), 2),
        part(leafAt(8, 30, 16, 1), 3),
        part(leafAt(40, 24, -16, -1), 3),
        part(circlePath(24, 15, 4.6), 1)].concat(
        partsOf([petalAt(24, 15, 7, -90), petalAt(24, 15, 7, -30), petalAt(24, 15, 7, 30),
          petalAt(24, 15, 7, 90), petalAt(24, 15, 7, 150), petalAt(24, 15, 7, 210)], 0)
      )
    },

    artVineCorner: {
      box: 48, slots: ['줄기', '잎', '꽃'],
      colors: ['#8d6e63', '#4caf50', '#f06292'],
      layers: [part('M4 44C4 24 16 8 40 6L40 9C19 11 8 26 8 44z', 0)].concat(
        partsOf([leafAt(7, 32, 13, 1), leafAt(12, 22, 13, 1), leafAt(22, 14, 13, 1),
          leafAt(34, 12, 13, 1)], 1)
      ).concat([
        part(petalAt(40, 6, 5, 0), 2),
        part(circlePath(40, 6, 2.6), 2)
      ])
    },

    artLeafFrame: {
      box: 48, slots: ['테두리', '잎1', '잎2'],
      colors: ['#a5d6a7', '#66bb6a', '#388e3c'],
      layers: [part(rectRingPath(4, 4, 40, 40, 2.6), 0)].concat(
        partsOf([leafAt(7, 9, 11, -1), leafAt(19, 9, 11, -1), leafAt(31, 9, 11, -1)], 1)
      ).concat(
        partsOf([leafAt(11, 39, 11, 1), leafAt(25, 39, 11, 1)], 2)
      )
    },

    artFlowerBadge: {
      box: 48, slots: ['꽃잎', '가운데', '잎'],
      colors: ['#f06292', '#ffca28', '#66bb6a'],
      layers: [part(circlePath(24, 22, 5.4), 1)].concat(
        partsOf([petalAt(24, 22, 9, -90), petalAt(24, 22, 9, -18), petalAt(24, 22, 9, 54),
          petalAt(24, 22, 9, 126), petalAt(24, 22, 9, 198)], 0)
      ).concat([
        part(leafAt(14, 36, 16, -1), 2)
      ])
    },

    /* -------------------------------------------- 색 장식 */
    artDotLine: {
      box: 48, slots: ['1', '2', '3', '4', '5', '선'],
      colors: ['#ef5350', '#ffa726', '#fdd835', '#66bb6a', '#42a5f5', '#cfd8dc'],
      layers: [
        part(rectPath(0, 22.8, 48, 2.4), 5),
        part(circlePath(8, 24, 4), 0),
        part(circlePath(16, 24, 4), 1),
        part(circlePath(24, 24, 4.6), 2),
        part(circlePath(32, 24, 4), 3),
        part(circlePath(40, 24, 4), 4)
      ]
    },

    artColorBlobs: {
      box: 48, slots: ['1', '2', '3'],
      colors: ['#ef5350', '#42a5f5', '#ffca28'],
      layers: [
        part('M14 8C19 6 24 10 24 15 24 20 20 24 15 24 10 24 6 20 6 15 6 11 9 9.5 14 8z', 0),
        part('M31 12C36 10 42 14 42 20 42 26 37 31 31 30 25 29 22 24 23 19 24 15 27 13 31 12z', 1),
        part('M20 30C25 28 31 31 31 36 31 41 27 44 22 43.5 17 43 14 39 14.5 35 15 32 17 31 20 30z', 2)
      ]
    },

    artColorTriangles: {
      box: 48, slots: ['1', '2', '3', '4'],
      colors: ['#ef5350', '#42a5f5', '#ffca28', '#66bb6a'],
      layers: [
        part(polygonD([{ x: 4, y: 40 }, { x: 16, y: 12 }, { x: 28, y: 40 }]), 0),
        part(polygonD([{ x: 20, y: 40 }, { x: 32, y: 16 }, { x: 44, y: 40 }]), 1),
        part(polygonD([{ x: 24, y: 12 }, { x: 30, y: 24 }, { x: 18, y: 24 }]), 2),
        part(polygonD([{ x: 34, y: 12 }, { x: 40, y: 24 }, { x: 28, y: 24 }]), 3)
      ]
    },

    artColorRings: {
      box: 48, slots: ['1', '2', '3', '4'],
      colors: ['#ef5350', '#ffca28', '#42a5f5', '#66bb6a'],
      layers: [
        part(circlePath(17, 17, 12), 0),
        part(circlePath(31, 19, 12), 1),
        part(circlePath(21, 32, 12), 2),
        part(circlePath(35, 33, 10), 3)
      ]
    },

    artColorBands: {
      box: 48, slots: ['1', '2', '3', '4'],
      colors: ['#ef5350', '#ffca28', '#66bb6a', '#42a5f5'],
      layers: [
        part(polygonD([{ x: 0, y: 16 }, { x: 48, y: 2 }, { x: 48, y: 8 }, { x: 0, y: 22 }]), 0),
        part(polygonD([{ x: 0, y: 26 }, { x: 48, y: 12 }, { x: 48, y: 18 }, { x: 0, y: 32 }]), 1),
        part(polygonD([{ x: 0, y: 36 }, { x: 48, y: 22 }, { x: 48, y: 28 }, { x: 0, y: 42 }]), 2),
        part(polygonD([{ x: 0, y: 46 }, { x: 48, y: 32 }, { x: 48, y: 38 }, { x: 0, y: 48 }]), 3)
      ]
    },

    /* -------------------------------------------- 강조 · 표시 */
    artStamp: {
      box: 48, slots: ['인장', '별', '테두리'],
      colors: ['#c62828', '#ffe0e0', '#e53935'],
      layers: [
        part(circlePath(24, 24, 20), 2),
        part(circlePath(24, 24, 17), 0),
        part(circlePath(24, 24, 13.5), 2),
        part(starAt(24, 24, 5, 9, 4), 1)
      ]
    },

    artHighlight: {
      box: 48, slots: ['형광', '글자선'],
      colors: ['#fff176', '#f9a825'],
      layers: [
        part(roundRectPath(2, 22, 44, 12, 3), 0),
        part(rectPath(6, 12, 34, 3), 1),
        part(rectPath(6, 19, 26, 3), 1),
        part(rectPath(6, 30, 18, 3), 1)
      ]
    },

    artWashi: {
      box: 48, slots: ['테이프1', '테이프2', '무늬'],
      colors: ['#f8bbd0', '#b3e5fc', '#ffffff'],
      layers: [
        part(polygonD([{ x: 20, y: 2 }, { x: 46, y: 12 }, { x: 42, y: 22 }, { x: 16, y: 12 }]), 0),
        part(polygonD([{ x: 2, y: 20 }, { x: 28, y: 30 }, { x: 24, y: 40 }, { x: 0, y: 30 }]), 1),
        part(circlePath(31, 12, 1.6), 2),
        part(circlePath(37, 14, 1.6), 2),
        part(circlePath(13, 26, 1.6), 2),
        part(circlePath(19, 28, 1.6), 2)
      ]
    },

    artClip: {
      box: 48, slots: ['클립', '그늘'],
      colors: ['#90a4ae', '#607d8b'],
      layers: [
        part('M18 10h3v22a3 3 0 0 0 6 0V10h3v22a6 6 0 0 1-12 0z', 0),
        part('M27 6h3v26a7 7 0 0 1-14 0V8h3v24a4 4 0 0 0 8 0z', 1)
      ]
    },

    artNote: {
      box: 48, slots: ['종이', '접힘', '선'],
      colors: ['#fff176', '#fdd835', '#f9a825'],
      layers: [
        part(roundRectPath(8, 6, 32, 36, 2), 0),
        part(polygonD([{ x: 40, y: 30 }, { x: 40, y: 42 }, { x: 28, y: 42 }]), 1),
        part(rectPath(13, 13, 22, 2.6), 2),
        part(rectPath(13, 20, 22, 2.6), 2),
        part(rectPath(13, 27, 14, 2.6), 2)
      ]
    },

    artBirthday: {
      box: 48, slots: ['크림', '시트', '초', '불꽃', '접시'],
      colors: ['#f8bbd0', '#d7a06a', '#ef5350', '#ffca28', '#cfd8dc'],
      layers: [
        part('M6 43.5a18 2.6 0 1 0 36 0a18 2.6 0 1 0 -36 0z', 4),
        part('M9 30h30a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2H9a2 2 0 0 1 -2 -2V32a2 2 0 0 1 2 -2z', 1),
        part('M13 21h22a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2H13a2 2 0 0 1 -2 -2V23a2 2 0 0 1 2 -2z', 1),
        part('M8.5 28h31a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2H8.5a2 2 0 0 1 -2 -2V30a2 2 0 0 1 2 -2z', 0),
        part('M12.5 19h23a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2H12.5a2 2 0 0 1 -2 -2V21a2 2 0 0 1 2 -2z', 0),
        part('M9.1 32.4a1.9 1.9 0 1 0 3.8 0a1.9 1.9 0 1 0 -3.8 0z', 0),
        part('M35.1 32.4a1.9 1.9 0 1 0 3.8 0a1.9 1.9 0 1 0 -3.8 0z', 0),
        part('M15 12h2.4v8H15z', 2),
        part('M23 10h2.4v10H23z', 2),
        part('M31 12h2.4v8H31z', 2),
        part('M14.6 9.6a1.6 2.6 0 1 0 3.2 0a1.6 2.6 0 1 0 -3.2 0z', 3),
        part('M22.6 7.6a1.6 2.6 0 1 0 3.2 0a1.6 2.6 0 1 0 -3.2 0z', 3),
        part('M30.6 9.6a1.6 2.6 0 1 0 3.2 0a1.6 2.6 0 1 0 -3.2 0z', 3)
      ]
    },

    artPopper: {
      box: 48, slots: ['폭죽', '조각1', '조각2', '조각3'],
      colors: ['#ef5350', '#ffca28', '#42a5f5', '#66bb6a'],
      layers: [
        part('M5 43L14 46L25 27L16 23z', 0),
        part('M12 30h5v2.6H12z', 1),
        part('M27 24L32 18L35 21L30 27z', 1),
        part('M24 15L26 7L30 9L28 17z', 2),
        part('M34 28L42 26L43 30L35 32z', 3),
        part('M30 34L37 38L34 41L27 37z', 2),
        part('M17.8 17a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0z', 3),
        part('M38 18a2 2 0 1 0 4 0a2 2 0 1 0 -4 0z', 1)
      ]
    },

    artBalloonArch: {
      box: 48, slots: ['1', '2', '3', '끈'],
      colors: ['#ef5350', '#ffca28', '#42a5f5', '#90a4ae'],
      layers: [
        part('M2 44C2 22 12 6 24 6C36 6 46 22 46 44L44 44C44 23 35 8 24 8C13 8 4 23 4 44z', 3),
        part('M0.61 32.37a4.6 5.6 0 1 0 9.2 0a4.6 5.6 0 1 0 -9.2 0z', 0),
        part('M3.53 23.3a4.6 5.6 0 1 0 9.2 0a4.6 5.6 0 1 0 -9.2 0z', 1),
        part('M7.93 16.15a4.6 5.6 0 1 0 9.2 0a4.6 5.6 0 1 0 -9.2 0z', 2),
        part('M13.39 11.57a4.6 5.6 0 1 0 9.2 0a4.6 5.6 0 1 0 -9.2 0z', 0),
        part('M19.4 10a4.6 5.6 0 1 0 9.2 0a4.6 5.6 0 1 0 -9.2 0z', 1),
        part('M25.41 11.57a4.6 5.6 0 1 0 9.2 0a4.6 5.6 0 1 0 -9.2 0z', 2),
        part('M30.87 16.15a4.6 5.6 0 1 0 9.2 0a4.6 5.6 0 1 0 -9.2 0z', 0),
        part('M35.27 23.3a4.6 5.6 0 1 0 9.2 0a4.6 5.6 0 1 0 -9.2 0z', 1),
        part('M38.19 32.37a4.6 5.6 0 1 0 9.2 0a4.6 5.6 0 1 0 -9.2 0z', 2)
      ]
    },

    artCupcake: {
      box: 48, slots: ['컵', '크림', '체리', '줄무늬'],
      colors: ['#f8bbd0', '#fff3e0', '#e53935', '#ce93d8'],
      layers: [
        part('M12 25L36 25L31 44L17 44z', 0),
        part('M14 30L34 30L33 34L15 34z', 3),
        part('M16 38L32 38L31.3 41.5L16.7 41.5z', 3),
        part('M11.5 21a6.5 6.5 0 1 0 13 0a6.5 6.5 0 1 0 -13 0z', 1),
        part('M23.5 21a6.5 6.5 0 1 0 13 0a6.5 6.5 0 1 0 -13 0z', 1),
        part('M18 14a6 6 0 1 0 12 0a6 6 0 1 0 -12 0z', 1),
        part('M20.4 6.5a3.6 3.6 0 1 0 7.2 0a3.6 3.6 0 1 0 -7.2 0z', 2)
      ]
    },

    artToast: {
      box: 48, slots: ['잔', '술', '빛'],
      colors: ['#fbc02d', '#f8bbd0', '#ffffff'],
      layers: [
        part('M7 8L19 8L17 21L9 21z', 0),
        part('M12.4 21h1.6v8H12.4z', 0),
        part('M10.2 29h5.6a1.2 1.2 0 0 1 1.2 1.2v0a1.2 1.2 0 0 1 -1.2 1.2H10.2a1.2 1.2 0 0 1 -1.2 -1.2V30.2a1.2 1.2 0 0 1 1.2 -1.2z', 0),
        part('M29 8L41 8L39 21L31 21z', 0),
        part('M34.4 21h1.6v8H34.4z', 0),
        part('M32.2 29h5.6a1.2 1.2 0 0 1 1.2 1.2v0a1.2 1.2 0 0 1 -1.2 1.2H32.2a1.2 1.2 0 0 1 -1.2 -1.2V30.2a1.2 1.2 0 0 1 1.2 -1.2z', 0),
        part('M8.6 11L17.4 11L16.5 19L9.5 19z', 1),
        part('M30.6 11L39.4 11L38.5 19L31.5 19z', 1),
        part('M10.4 15a1.1 1.1 0 1 0 2.2 0a1.1 1.1 0 1 0 -2.2 0z', 2),
        part('M14.1 13a0.9 0.9 0 1 0 1.8 0a0.9 0.9 0 1 0 -1.8 0z', 2),
        part('M32.4 15a1.1 1.1 0 1 0 2.2 0a1.1 1.1 0 1 0 -2.2 0z', 2),
        part('M36.1 13a0.9 0.9 0 1 0 1.8 0a0.9 0.9 0 1 0 -1.8 0z', 2)
      ]
    },

    artFirework: {
      box: 48, slots: ['빛1', '빛2', '중심', '점'],
      colors: ['#ffca28', '#42a5f5', '#ef5350', '#ffffff'],
      layers: [
        part('M32.96 23.1L47 24L32.96 24.9z', 0),
        part('M30.97 29.7L40.26 40.26L29.7 30.97z', 0),
        part('M24.9 32.96L24 47L23.1 32.96z', 0),
        part('M18.3 30.97L7.74 40.26L17.03 29.7z', 0),
        part('M15.04 24.9L1 24L15.04 23.1z', 0),
        part('M17.03 18.3L7.74 7.74L18.3 17.03z', 0),
        part('M23.1 15.04L24 1L24.9 15.04z', 0),
        part('M29.7 17.03L40.26 7.74L30.97 18.3z', 0),
        part('M32.59 26.68L38.78 30.12L31.97 28.18z', 1),
        part('M28.18 31.97L30.12 38.78L26.68 32.59z', 1),
        part('M21.32 32.59L17.88 38.78L19.82 31.97z', 1),
        part('M16.03 28.18L9.22 30.12L15.41 26.68z', 1),
        part('M15.41 21.32L9.22 17.88L16.03 19.82z', 1),
        part('M19.82 16.03L17.88 9.22L21.32 15.41z', 1),
        part('M26.68 15.41L30.12 9.22L28.18 16.03z', 1),
        part('M31.97 19.82L38.78 17.88L32.59 21.32z', 1),
        part('M19.4 24a4.6 4.6 0 1 0 9.2 0a4.6 4.6 0 1 0 -9.2 0z', 2),
        part('M6.4 9a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0z', 3),
        part('M39.4 11a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0z', 3),
        part('M36.4 40a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0z', 3),
        part('M7.4 38a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0z', 3)
      ]
    },

    artTrophy: {
      box: 48, slots: ['컵', '손잡이', '받침', '빛'],
      colors: ['#fbc02d', '#f9a825', '#8d6e63', '#fff59d'],
      layers: [
        part('M2 16a6.5 6.5 0 1 0 13 0 6.5 6.5 0 1 0 -13 0zM4.5 16a4 4 0 1 1 8 0 4 4 0 1 1 -8 0z', 1),
        part('M33 16a6.5 6.5 0 1 0 13 0 6.5 6.5 0 1 0 -13 0zM35.5 16a4 4 0 1 1 8 0 4 4 0 1 1 -8 0z', 1),
        part('M11 9L37 9L33 27L15 27z', 0),
        part('M11.7 7h24.6a1.7 1.7 0 0 1 1.7 1.7v0a1.7 1.7 0 0 1 -1.7 1.7H11.7a1.7 1.7 0 0 1 -1.7 -1.7V8.7a1.7 1.7 0 0 1 1.7 -1.7z', 1),
        part('M15 11L19 11L16.5 25L14 25z', 3),
        part('M21.5 27h5v5H21.5z', 1),
        part('M15 32L33 32L36 41L12 41z', 2),
        part('M10.7 41h26.6a1.7 1.7 0 0 1 1.7 1.7v0a1.7 1.7 0 0 1 -1.7 1.7H10.7a1.7 1.7 0 0 1 -1.7 -1.7V42.7a1.7 1.7 0 0 1 1.7 -1.7z', 2)
      ]
    },

    artRosette: {
      box: 48, slots: ['원', '주름', '꼬리', '가운데'],
      colors: ['#42a5f5', '#90caf9', '#1e88e5', '#ffffff'],
      layers: [
        part('M13 30L21 30L19 46L16 41L13 46z', 2),
        part('M27 30L35 30L36 46L33 41L30 46z', 2),
        part('M24 6L26.85 5.85L29.47 6.96L25.91 11.17z', 1),
        part('M29.47 6.96L32.2 7.8L34.28 9.74L29.5 12.47z', 1),
        part('M34.28 9.74L36.56 11.46L37.86 14L32.43 14.93z', 1),
        part('M37.86 14L39.41 16.39L39.76 19.22L34.34 18.24z', 1),
        part('M39.76 19.22L40.4 22L39.76 24.78L35 22z', 1),
        part('M39.76 24.78L39.41 27.61L37.86 30L34.34 25.76z', 1),
        part('M37.86 30L36.56 32.54L34.28 34.26L32.43 29.07z', 1),
        part('M34.28 34.26L32.2 36.2L29.47 37.04L29.5 31.53z', 1),
        part('M29.47 37.04L26.85 38.15L24 38L25.91 32.83z', 1),
        part('M24 38L21.15 38.15L18.53 37.04L22.09 32.83z', 1),
        part('M18.53 37.04L15.8 36.2L13.72 34.26L18.5 31.53z', 1),
        part('M13.72 34.26L11.44 32.54L10.14 30L15.57 29.07z', 1),
        part('M10.14 30L8.59 27.61L8.24 24.78L13.66 25.76z', 1),
        part('M8.24 24.78L7.6 22L8.24 19.22L13 22z', 1),
        part('M8.24 19.22L8.59 16.39L10.14 14L13.66 18.24z', 1),
        part('M10.14 14L11.44 11.46L13.72 9.74L15.57 14.93z', 1),
        part('M13.72 9.74L15.8 7.8L18.53 6.96L18.5 12.47z', 1),
        part('M18.53 6.96L21.15 5.85L24 6L22.09 11.17z', 1),
        part('M13 22a11 11 0 1 0 22 0a11 11 0 1 0 -22 0z', 0),
        part('M20 22a4 4 0 1 0 8 0a4 4 0 1 0 -8 0z', 3)
      ]
    },

    artShieldGold: {
      box: 48, slots: ['테두리', '바탕', '별', '리본'],
      colors: ['#fbc02d', '#1e3a8a', '#ffffff', '#e53935'],
      layers: [
        part('M13 30L22 30L22 46L17.5 41L13 46z', 3),
        part('M35 30L26 30L26 46L30.5 41L35 46z', 3),
        part('M24 3L42 9L42 22L24 42L6 22L6 9z', 0),
        part('M24 7L38 12L38 21L24 37L10 21L10 12z', 1),
        part('M24 12L26.06 17.17L31.61 17.53L27.33 21.08L28.7 26.47L24 23.5L19.3 26.47L20.67 21.08L16.39 17.53L21.94 17.17z', 2)
      ]
    },

    artMedalBig: {
      box: 48, slots: ['금', '안쪽', '별', '리본'],
      colors: ['#fbc02d', '#f9a825', '#ffffff', '#e53935'],
      layers: [
        part('M17 3L31 3L31 16L24 11L17 16z', 3),
        part('M8 29a16 16 0 1 0 32 0a16 16 0 1 0 -32 0z', 0),
        part('M11.6 29a12.4 12.4 0 1 0 24.8 0a12.4 12.4 0 1 0 -24.8 0z', 1),
        part('M24 20L26.35 25.76L32.56 26.22L27.8 30.24L29.29 36.28L24 33L18.71 36.28L20.2 30.24L15.44 26.22L21.65 25.76z', 2)
      ]
    },

    artCertificate: {
      box: 48, slots: ['테두리', '안쪽', '코너', '도장'],
      colors: ['#1e3a8a', '#ffffff', '#fbc02d', '#c62828'],
      layers: [
        part('M2 2h44v44H2zM4.6 4.6v38.8h38.8V4.6z', 0),
        part('M6.5 6.5h35v35H6.5zM8.1 8.1v31.8h31.8V8.1z', 2),
        part('M6.1 8a1.9 1.9 0 1 0 3.8 0a1.9 1.9 0 1 0 -3.8 0z', 2),
        part('M38.1 8a1.9 1.9 0 1 0 3.8 0a1.9 1.9 0 1 0 -3.8 0z', 2),
        part('M6.1 40a1.9 1.9 0 1 0 3.8 0a1.9 1.9 0 1 0 -3.8 0z', 2),
        part('M38.1 40a1.9 1.9 0 1 0 3.8 0a1.9 1.9 0 1 0 -3.8 0z', 2),
        part('M12.3 20h23.4a1.3 1.3 0 0 1 1.3 1.3v0a1.3 1.3 0 0 1 -1.3 1.3H12.3a1.3 1.3 0 0 1 -1.3 -1.3V21.3a1.3 1.3 0 0 1 1.3 -1.3z', 1),
        part('M12.3 26h17.4a1.3 1.3 0 0 1 1.3 1.3v0a1.3 1.3 0 0 1 -1.3 1.3H12.3a1.3 1.3 0 0 1 -1.3 -1.3V27.3a1.3 1.3 0 0 1 1.3 -1.3z', 1),
        part('M31 36a5 5 0 1 0 10 0a5 5 0 1 0 -10 0z', 3),
        part('M33 36a3 3 0 1 0 6 0a3 3 0 1 0 -6 0z', 0)
      ]
    },

    artWreath: {
      box: 48, slots: ['잎1', '잎2', '꽃', '열매'],
      colors: ['#66bb6a', '#43a047', '#f06292', '#fbc02d'],
      layers: [
        part('M38.4 24a3.6 2.4 0 1 0 7.2 0a3.6 2.4 0 1 0 -7.2 0z', 0),
        part('M37.52 29.56a3.6 2.4 0 1 0 7.2 0a3.6 2.4 0 1 0 -7.2 0z', 1),
        part('M34.96 34.58a3.6 2.4 0 1 0 7.2 0a3.6 2.4 0 1 0 -7.2 0z', 0),
        part('M30.98 38.56a3.6 2.4 0 1 0 7.2 0a3.6 2.4 0 1 0 -7.2 0z', 1),
        part('M25.96 41.12a3.6 2.4 0 1 0 7.2 0a3.6 2.4 0 1 0 -7.2 0z', 0),
        part('M20.4 42a3.6 2.4 0 1 0 7.2 0a3.6 2.4 0 1 0 -7.2 0z', 1),
        part('M14.84 41.12a3.6 2.4 0 1 0 7.2 0a3.6 2.4 0 1 0 -7.2 0z', 0),
        part('M9.82 38.56a3.6 2.4 0 1 0 7.2 0a3.6 2.4 0 1 0 -7.2 0z', 1),
        part('M5.84 34.58a3.6 2.4 0 1 0 7.2 0a3.6 2.4 0 1 0 -7.2 0z', 0),
        part('M3.28 29.56a3.6 2.4 0 1 0 7.2 0a3.6 2.4 0 1 0 -7.2 0z', 1),
        part('M2.4 24a3.6 2.4 0 1 0 7.2 0a3.6 2.4 0 1 0 -7.2 0z', 0),
        part('M3.28 18.44a3.6 2.4 0 1 0 7.2 0a3.6 2.4 0 1 0 -7.2 0z', 1),
        part('M5.84 13.42a3.6 2.4 0 1 0 7.2 0a3.6 2.4 0 1 0 -7.2 0z', 0),
        part('M9.82 9.44a3.6 2.4 0 1 0 7.2 0a3.6 2.4 0 1 0 -7.2 0z', 1),
        part('M14.84 6.88a3.6 2.4 0 1 0 7.2 0a3.6 2.4 0 1 0 -7.2 0z', 0),
        part('M20.4 6a3.6 2.4 0 1 0 7.2 0a3.6 2.4 0 1 0 -7.2 0z', 1),
        part('M25.96 6.88a3.6 2.4 0 1 0 7.2 0a3.6 2.4 0 1 0 -7.2 0z', 0),
        part('M30.98 9.44a3.6 2.4 0 1 0 7.2 0a3.6 2.4 0 1 0 -7.2 0z', 1),
        part('M34.96 13.42a3.6 2.4 0 1 0 7.2 0a3.6 2.4 0 1 0 -7.2 0z', 0),
        part('M37.52 18.44a3.6 2.4 0 1 0 7.2 0a3.6 2.4 0 1 0 -7.2 0z', 1),
        part('M26.27 9.2a3.132 3.132 0 1 0 6.264 0a3.132 3.132 0 1 0 -6.264 0z', 2),
        part('M22.54 14.34a3.132 3.132 0 1 0 6.264 0a3.132 3.132 0 1 0 -6.264 0z', 2),
        part('M16.5 12.37a3.132 3.132 0 1 0 6.264 0a3.132 3.132 0 1 0 -6.264 0z', 2),
        part('M16.5 6.03a3.132 3.132 0 1 0 6.264 0a3.132 3.132 0 1 0 -6.264 0z', 2),
        part('M22.54 4.06a3.132 3.132 0 1 0 6.264 0a3.132 3.132 0 1 0 -6.264 0z', 2),
        part('M21.52 9.2a2.4840000000000004 2.4840000000000004 0 1 0 4.968000000000001 0a2.4840000000000004 2.4840000000000004 0 1 0 -4.968000000000001 0z', 3),
        part('M10.93 34a2.6679999999999997 2.6679999999999997 0 1 0 5.335999999999999 0a2.6679999999999997 2.6679999999999997 0 1 0 -5.335999999999999 0z', 2),
        part('M7.75 38.37a2.6679999999999997 2.6679999999999997 0 1 0 5.335999999999999 0a2.6679999999999997 2.6679999999999997 0 1 0 -5.335999999999999 0z', 2),
        part('M2.61 36.7a2.6679999999999997 2.6679999999999997 0 1 0 5.335999999999999 0a2.6679999999999997 2.6679999999999997 0 1 0 -5.335999999999999 0z', 2),
        part('M2.61 31.3a2.6679999999999997 2.6679999999999997 0 1 0 5.335999999999999 0a2.6679999999999997 2.6679999999999997 0 1 0 -5.335999999999999 0z', 2),
        part('M7.75 29.63a2.6679999999999997 2.6679999999999997 0 1 0 5.335999999999999 0a2.6679999999999997 2.6679999999999997 0 1 0 -5.335999999999999 0z', 2),
        part('M6.88 34a2.116 2.116 0 1 0 4.232 0a2.116 2.116 0 1 0 -4.232 0z', 3),
        part('M40.93 34a2.6679999999999997 2.6679999999999997 0 1 0 5.335999999999999 0a2.6679999999999997 2.6679999999999997 0 1 0 -5.335999999999999 0z', 2),
        part('M37.75 38.37a2.6679999999999997 2.6679999999999997 0 1 0 5.335999999999999 0a2.6679999999999997 2.6679999999999997 0 1 0 -5.335999999999999 0z', 2),
        part('M32.61 36.7a2.6679999999999997 2.6679999999999997 0 1 0 5.335999999999999 0a2.6679999999999997 2.6679999999999997 0 1 0 -5.335999999999999 0z', 2),
        part('M32.61 31.3a2.6679999999999997 2.6679999999999997 0 1 0 5.335999999999999 0a2.6679999999999997 2.6679999999999997 0 1 0 -5.335999999999999 0z', 2),
        part('M37.75 29.63a2.6679999999999997 2.6679999999999997 0 1 0 5.335999999999999 0a2.6679999999999997 2.6679999999999997 0 1 0 -5.335999999999999 0z', 2),
        part('M36.88 34a2.116 2.116 0 1 0 4.232 0a2.116 2.116 0 1 0 -4.232 0z', 3),
        part('M35.8 13a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0z', 3),
        part('M9.8 14a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0z', 3)
      ]
    },

    artBouquet: {
      box: 48, slots: ['꽃잎', '가운데', '잎', '포장'],
      colors: ['#f06292', '#ffca28', '#66bb6a', '#ce93d8'],
      layers: [
        part('M13 27L35 27L28 45L20 45z', 3),
        part('M15 29L33 29L30 35L18 35z', 0),
        part('M17.6 17a3.5959999999999996 3.5959999999999996 0 1 0 7.191999999999999 0a3.5959999999999996 3.5959999999999996 0 1 0 -7.191999999999999 0z', 0),
        part('M13.32 22.9a3.5959999999999996 3.5959999999999996 0 1 0 7.191999999999999 0a3.5959999999999996 3.5959999999999996 0 1 0 -7.191999999999999 0z', 0),
        part('M6.39 20.64a3.5959999999999996 3.5959999999999996 0 1 0 7.191999999999999 0a3.5959999999999996 3.5959999999999996 0 1 0 -7.191999999999999 0z', 0),
        part('M6.39 13.36a3.5959999999999996 3.5959999999999996 0 1 0 7.191999999999999 0a3.5959999999999996 3.5959999999999996 0 1 0 -7.191999999999999 0z', 0),
        part('M13.32 11.1a3.5959999999999996 3.5959999999999996 0 1 0 7.191999999999999 0a3.5959999999999996 3.5959999999999996 0 1 0 -7.191999999999999 0z', 0),
        part('M12.15 17a2.8520000000000003 2.8520000000000003 0 1 0 5.704000000000001 0a2.8520000000000003 2.8520000000000003 0 1 0 -5.704000000000001 0z', 1),
        part('M26.86 11a3.9439999999999995 3.9439999999999995 0 1 0 7.887999999999999 0a3.9439999999999995 3.9439999999999995 0 1 0 -7.887999999999999 0z', 0),
        part('M22.16 17.47a3.9439999999999995 3.9439999999999995 0 1 0 7.887999999999999 0a3.9439999999999995 3.9439999999999995 0 1 0 -7.887999999999999 0z', 0),
        part('M14.55 15a3.9439999999999995 3.9439999999999995 0 1 0 7.887999999999999 0a3.9439999999999995 3.9439999999999995 0 1 0 -7.887999999999999 0z', 0),
        part('M14.55 7a3.9439999999999995 3.9439999999999995 0 1 0 7.887999999999999 0a3.9439999999999995 3.9439999999999995 0 1 0 -7.887999999999999 0z', 0),
        part('M22.16 4.53a3.9439999999999995 3.9439999999999995 0 1 0 7.887999999999999 0a3.9439999999999995 3.9439999999999995 0 1 0 -7.887999999999999 0z', 0),
        part('M20.87 11a3.128 3.128 0 1 0 6.256 0a3.128 3.128 0 1 0 -6.256 0z', 1),
        part('M35.6 17a3.5959999999999996 3.5959999999999996 0 1 0 7.191999999999999 0a3.5959999999999996 3.5959999999999996 0 1 0 -7.191999999999999 0z', 0),
        part('M31.32 22.9a3.5959999999999996 3.5959999999999996 0 1 0 7.191999999999999 0a3.5959999999999996 3.5959999999999996 0 1 0 -7.191999999999999 0z', 0),
        part('M24.39 20.64a3.5959999999999996 3.5959999999999996 0 1 0 7.191999999999999 0a3.5959999999999996 3.5959999999999996 0 1 0 -7.191999999999999 0z', 0),
        part('M24.39 13.36a3.5959999999999996 3.5959999999999996 0 1 0 7.191999999999999 0a3.5959999999999996 3.5959999999999996 0 1 0 -7.191999999999999 0z', 0),
        part('M31.32 11.1a3.5959999999999996 3.5959999999999996 0 1 0 7.191999999999999 0a3.5959999999999996 3.5959999999999996 0 1 0 -7.191999999999999 0z', 0),
        part('M30.15 17a2.8520000000000003 2.8520000000000003 0 1 0 5.704000000000001 0a2.8520000000000003 2.8520000000000003 0 1 0 -5.704000000000001 0z', 1),
        part('M9 24C12 20 16 18 20 18L19 22C16 22 12.5 24 10.5 27z', 2),
        part('M39 24C36 20 32 18 28 18L29 22C32 22 35.5 24 37.5 27z', 2)
      ]
    },

    artSunflower: {
      box: 48, slots: ['꽃잎', '가운데', '씨', '줄기'],
      colors: ['#fdd835', '#8d6e63', '#5d4037', '#4caf50'],
      layers: [
        part('M24 28h0a1.2 1.2 0 0 1 1.2 1.2v15.6a1.2 1.2 0 0 1 -1.2 1.2H24a1.2 1.2 0 0 1 -1.2 -1.2V29.2a1.2 1.2 0 0 1 1.2 -1.2z', 3),
        part('M10 36C13 32 18 30 22 30L21 34C17 34 13 36 11 39z', 3),
        part('M38 32C35 28 30 26 26 26L27 30C31 30 35 32 37 35z', 3),
        part('M29.88 23.5a8.12 8.12 0 1 0 16.24 0a8.12 8.12 0 1 0 -16.24 0z', 0),
        part('M28 30.5a8.12 8.12 0 1 0 16.24 0a8.12 8.12 0 1 0 -16.24 0z', 0),
        part('M22.88 35.62a8.12 8.12 0 1 0 16.24 0a8.12 8.12 0 1 0 -16.24 0z', 0),
        part('M15.88 37.5a8.12 8.12 0 1 0 16.24 0a8.12 8.12 0 1 0 -16.24 0z', 0),
        part('M8.88 35.62a8.12 8.12 0 1 0 16.24 0a8.12 8.12 0 1 0 -16.24 0z', 0),
        part('M3.76 30.5a8.12 8.12 0 1 0 16.24 0a8.12 8.12 0 1 0 -16.24 0z', 0),
        part('M1.88 23.5a8.12 8.12 0 1 0 16.24 0a8.12 8.12 0 1 0 -16.24 0z', 0),
        part('M3.76 16.5a8.12 8.12 0 1 0 16.24 0a8.12 8.12 0 1 0 -16.24 0z', 0),
        part('M8.88 11.38a8.12 8.12 0 1 0 16.24 0a8.12 8.12 0 1 0 -16.24 0z', 0),
        part('M15.88 9.5a8.12 8.12 0 1 0 16.24 0a8.12 8.12 0 1 0 -16.24 0z', 0),
        part('M22.88 11.38a8.12 8.12 0 1 0 16.24 0a8.12 8.12 0 1 0 -16.24 0z', 0),
        part('M28 16.5a8.12 8.12 0 1 0 16.24 0a8.12 8.12 0 1 0 -16.24 0z', 0),
        part('M14.8 23.5a9.2 9.2 0 1 0 18.4 0a9.2 9.2 0 1 0 -18.4 0z', 1),
        part('M19.8 21a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0 -2.4 0z', 2),
        part('M25.8 22a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0 -2.4 0z', 2),
        part('M22.8 26a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0 -2.4 0z', 2),
        part('M18.8 25.5a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0 -2.4 0z', 2),
        part('M26.8 26a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0 -2.4 0z', 2)
      ]
    },

    artBlossom: {
      box: 48, slots: ['가지', '꽃잎', '수술'],
      colors: ['#8d6e63', '#f8bbd0', '#fff59d'],
      layers: [
        part('M2 43C10 36 18 28 28 21C34 17 40 12 44 6L46 8C42 14 36 19 30 23C20 30 12 38 4 45z', 0),
        part('M33.77 18a3.8279999999999994 3.8279999999999994 0 1 0 7.655999999999999 0a3.8279999999999994 3.8279999999999994 0 1 0 -7.655999999999999 0z', 1),
        part('M29.21 24.28a3.8279999999999994 3.8279999999999994 0 1 0 7.655999999999999 0a3.8279999999999994 3.8279999999999994 0 1 0 -7.655999999999999 0z', 1),
        part('M21.83 21.88a3.8279999999999994 3.8279999999999994 0 1 0 7.655999999999999 0a3.8279999999999994 3.8279999999999994 0 1 0 -7.655999999999999 0z', 1),
        part('M21.83 14.12a3.8279999999999994 3.8279999999999994 0 1 0 7.655999999999999 0a3.8279999999999994 3.8279999999999994 0 1 0 -7.655999999999999 0z', 1),
        part('M29.21 11.72a3.8279999999999994 3.8279999999999994 0 1 0 7.655999999999999 0a3.8279999999999994 3.8279999999999994 0 1 0 -7.655999999999999 0z', 1),
        part('M27.96 18a3.036 3.036 0 1 0 6.072 0a3.036 3.036 0 1 0 -6.072 0z', 2),
        part('M39.85 10a3.2479999999999998 3.2479999999999998 0 1 0 6.4959999999999996 0a3.2479999999999998 3.2479999999999998 0 1 0 -6.4959999999999996 0z', 1),
        part('M35.98 15.33a3.2479999999999998 3.2479999999999998 0 1 0 6.4959999999999996 0a3.2479999999999998 3.2479999999999998 0 1 0 -6.4959999999999996 0z', 1),
        part('M29.72 13.29a3.2479999999999998 3.2479999999999998 0 1 0 6.4959999999999996 0a3.2479999999999998 3.2479999999999998 0 1 0 -6.4959999999999996 0z', 1),
        part('M29.72 6.71a3.2479999999999998 3.2479999999999998 0 1 0 6.4959999999999996 0a3.2479999999999998 3.2479999999999998 0 1 0 -6.4959999999999996 0z', 1),
        part('M35.98 4.67a3.2479999999999998 3.2479999999999998 0 1 0 6.4959999999999996 0a3.2479999999999998 3.2479999999999998 0 1 0 -6.4959999999999996 0z', 1),
        part('M34.92 10a2.576 2.576 0 1 0 5.152 0a2.576 2.576 0 1 0 -5.152 0z', 2),
        part('M18 28C20 25 23 24 26 24L25 27C23 27 20.5 28 19 30z', 0)
      ]
    },

    artGrassLine: {
      box: 48, slots: ['밑동', '잔디1', '잔디2', '꽃'],
      colors: ['#a5d6a7', '#66bb6a', '#43a047', '#ffca28'],
      layers: [
        part('M0 39h48v9H0z', 0),
        part('M0 40L3 31L6 40z', 2),
        part('M5 40L8 26L11 40z', 1),
        part('M10 40L13 21L16 40z', 2),
        part('M15 40L18 31L21 40z', 1),
        part('M20 40L23 26L26 40z', 2),
        part('M25 40L28 21L31 40z', 1),
        part('M30 40L33 31L36 40z', 2),
        part('M35 40L38 26L41 40z', 1),
        part('M40 40L43 21L46 40z', 2),
        part('M8.8 34a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0z', 3),
        part('M26.8 32a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0z', 3)
      ]
    },

    artLeafCorner: {
      box: 48, slots: ['줄기', '잎1', '잎2'],
      colors: ['#8d6e63', '#66bb6a', '#388e3c'],
      layers: [
        part('M3 3C11 5 20 12 28 24L25 26C18 16 10 8 3 6z', 0),
        part('M6 6C9 9 12 13 15 18L11 20C9 15 7 10 4 7z', 1),
        part('M12 11C16 13 19 16 22 21L18 23C16 18 14 14 10 12z', 2),
        part('M18 17C22 19 25 22 28 27L24 29C22 24 20 20 16 18z', 1),
        part('M24 23C28 25 31 29 34 34L30 36C28 31 26 27 22 25z', 2),
        part('M29 30C33 32 36 36 39 41L35 43C33 38 31 34 27 32z', 1)
      ]
    },

    artBow: {
      box: 48, slots: ['고리', '그늘', '매듭', '꼬리'],
      colors: ['#ef5350', '#b71c1c', '#e53935', '#ffcdd2'],
      layers: [
        part('M3.5 20a9.5 10.5 0 1 0 19 0a9.5 10.5 0 1 0 -19 0z', 0),
        part('M25.5 20a9.5 10.5 0 1 0 19 0a9.5 10.5 0 1 0 -19 0z', 0),
        part('M10.5 20a5 6 0 1 0 10 0a5 6 0 1 0 -10 0z', 1),
        part('M27.5 20a5 6 0 1 0 10 0a5 6 0 1 0 -10 0z', 1),
        part('M22.9 16h2.2a3.4 3.4 0 0 1 3.4 3.4v7.2a3.4 3.4 0 0 1 -3.4 3.4H22.9a3.4 3.4 0 0 1 -3.4 -3.4V19.4a3.4 3.4 0 0 1 3.4 -3.4z', 2),
        part('M18 28L24 28L21 46L16 40L12 46z', 3),
        part('M30 28L24 28L27 46L32 40L36 46z', 3)
      ]
    },

    artCloudSun: {
      box: 48, slots: ['구름', '그늘', '해'],
      colors: ['#e8eef4', '#c8d4de', '#ffca28'],
      layers: [
        part('M30 12a7 7 0 1 0 14 0a7 7 0 1 0 -14 0z', 2),
        part('M3.5 34a6.5 6.5 0 1 0 13 0a6.5 6.5 0 1 0 -13 0z', 0),
        part('M12 32a8 8 0 1 0 16 0a8 8 0 1 0 -16 0z', 0),
        part('M24.5 34a6.5 6.5 0 1 0 13 0a6.5 6.5 0 1 0 -13 0z', 0),
        part('M9 32h30a5 5 0 0 1 5 5v0a5 5 0 0 1 -5 5H9a5 5 0 0 1 -5 -5V37a5 5 0 0 1 5 -5z', 0),
        part('M5 41a17 2.4 0 1 0 34 0a17 2.4 0 1 0 -34 0z', 1)
      ]
    },

    artSparkles: {
      box: 48, slots: ['반짝1', '반짝2', '점'],
      colors: ['#ffca28', '#fff59d', '#42a5f5'],
      layers: [
        part('M15 5L17.12 12.88L25 15L17.12 17.12L15 25L12.88 17.12L5 15L12.88 12.88z', 0),
        part('M35 12.5L36.59 18.41L42.5 20L36.59 21.59L35 27.5L33.41 21.59L27.5 20L33.41 18.41z', 1),
        part('M20 30L21.27 34.73L26 36L21.27 37.27L20 42L18.73 37.27L14 36L18.73 34.73z', 0),
        part('M39 33.5L39.95 37.05L43.5 38L39.95 38.95L39 42.5L38.05 38.95L34.5 38L38.05 37.05z', 1),
        part('M25.4 27a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0z', 2),
        part('M6.4 30a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0z', 2),
        part('M41.4 9a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0z', 2)
      ]
    },

    artDrops: {
      box: 48, slots: ['물방울', '빛'],
      colors: ['#42a5f5', '#ffffff'],
      layers: [
        part('M17 11C28.05 20.75 30 28.55 17 37C4 28.55 5.95 20.75 17 11z', 0),
        part('M10.6 22a2.4 3.6 0 1 0 4.8 0a2.4 3.6 0 1 0 -4.8 0z', 1),
        part('M36 22.5C43.23 28.88 44.5 33.98 36 39.5C27.5 33.98 28.78 28.88 36 22.5z', 0),
        part('M31.9 30a1.6 2.4 0 1 0 3.2 0a1.6 2.4 0 1 0 -3.2 0z', 1),
        part('M35 6C40.1 10.5 41 14.1 35 18C29 14.1 29.9 10.5 35 6z', 0)
      ]
    },

    artPaperPlane: {
      box: 48, slots: ['겉', '안', '그늘'],
      colors: ['#ffffff', '#e3f2fd', '#90a4ae'],
      layers: [
        part('M4 25L45 7L28 41z', 0),
        part('M4 25L28 41L26 23z', 1),
        part('M4 25L45 7L26 23z', 2),
        part('M2.9 33h5.2a0.9 0.9 0 0 1 0.9 0.9v0a0.9 0.9 0 0 1 -0.9 0.9H2.9a0.9 0.9 0 0 1 -0.9 -0.9V33.9a0.9 0.9 0 0 1 0.9 -0.9z', 2),
        part('M5.9 38h4.2a0.9 0.9 0 0 1 0.9 0.9v0a0.9 0.9 0 0 1 -0.9 0.9H5.9a0.9 0.9 0 0 1 -0.9 -0.9V38.9a0.9 0.9 0 0 1 0.9 -0.9z', 2),
        part('M3.9 43h3.2a0.9 0.9 0 0 1 0.9 0.9v0a0.9 0.9 0 0 1 -0.9 0.9H3.9a0.9 0.9 0 0 1 -0.9 -0.9V43.9a0.9 0.9 0 0 1 0.9 -0.9z', 2)
      ]
    },

    artSticker: {
      box: 48, slots: ['테두리', '바탕', '별'],
      colors: ['#ffffff', '#42a5f5', '#ffca28'],
      layers: [
        part('M41.8 24a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0z', 0),
        part('M40.59 30.84a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0z', 0),
        part('M37.12 36.86a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0z', 0),
        part('M31.8 41.32a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0z', 0),
        part('M25.27 43.7a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0z', 0),
        part('M18.33 43.7a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0z', 0),
        part('M11.8 41.32a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0z', 0),
        part('M6.48 36.86a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0z', 0),
        part('M3.01 30.84a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0z', 0),
        part('M1.8 24a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0z', 0),
        part('M3.01 17.16a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0z', 0),
        part('M6.48 11.14a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0z', 0),
        part('M11.8 6.68a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0z', 0),
        part('M18.33 4.3a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0z', 0),
        part('M25.27 4.3a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0z', 0),
        part('M31.8 6.68a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0z', 0),
        part('M37.12 11.14a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0z', 0),
        part('M40.59 17.16a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0z', 0),
        part('M6 24a18 18 0 1 0 36 0a18 18 0 1 0 -36 0z', 1),
        part('M24 12L27.06 19.79L35.41 20.29L28.95 25.61L31.05 33.71L24 29.2L16.95 33.71L19.05 25.61L12.59 20.29L20.94 19.79z', 2)
      ]
    },

    artXmasTree: {
      box: 48, slots: ['나무', '장식1', '장식2', '별', '줄기'],
      colors: ['#2e7d32', '#e53935', '#ffca28', '#fdd835', '#8d6e63'],
      layers: [
        part('M21 38h6v7H21z', 4),
        part('M24 6L38 23L10 23z', 0),
        part('M24 15L42 32L6 32z', 0),
        part('M24 24L46 41L2 41z', 0),
        part('M24 1L25.41 4.06L28.76 4.45L26.28 6.74L26.94 10.05L24 8.4L21.06 10.05L21.72 6.74L19.24 4.45L22.59 4.06z', 3),
        part('M18.1 27a1.9 1.9 0 1 0 3.8 0a1.9 1.9 0 1 0 -3.8 0z', 1),
        part('M27.1 31a1.9 1.9 0 1 0 3.8 0a1.9 1.9 0 1 0 -3.8 0z', 1),
        part('M13.1 37a1.9 1.9 0 1 0 3.8 0a1.9 1.9 0 1 0 -3.8 0z', 1),
        part('M31.1 37a1.9 1.9 0 1 0 3.8 0a1.9 1.9 0 1 0 -3.8 0z', 1),
        part('M22.1 35a1.9 1.9 0 1 0 3.8 0a1.9 1.9 0 1 0 -3.8 0z', 2)
      ]
    },

    artSantaHat: {
      box: 48, slots: ['모자', '테두리'],
      colors: ['#e53935', '#f5f5f5'],
      layers: [
        part('M7 33C7 17 17 6 30 6C38 6 43 12 43 20C43 27 38 32 32 34L7 33z', 0),
        part('M8 30h34a3 3 0 0 1 3 3v0a3 3 0 0 1 -3 3H8a3 3 0 0 1 -3 -3V33a3 3 0 0 1 3 -3z', 1),
        part('M38.6 20a4.4 4.4 0 1 0 8.8 0a4.4 4.4 0 1 0 -8.8 0z', 1)
      ]
    },

    artStocking: {
      box: 48, slots: ['양말', '테두리', '무늬'],
      colors: ['#e53935', '#ffffff', '#66bb6a'],
      layers: [
        part('M13 10h15v20H13z', 0),
        part('M20.5 25h10a7.5 7.5 0 0 1 7.5 7.5v0a7.5 7.5 0 0 1 -7.5 7.5H20.5a7.5 7.5 0 0 1 -7.5 -7.5V32.5a7.5 7.5 0 0 1 7.5 -7.5z', 0),
        part('M30.5 32a7.5 7.5 0 1 0 15 0a7.5 7.5 0 1 0 -15 0z', 0),
        part('M13.5 4h14a2.5 2.5 0 0 1 2.5 2.5v2a2.5 2.5 0 0 1 -2.5 2.5H13.5a2.5 2.5 0 0 1 -2.5 -2.5V6.5a2.5 2.5 0 0 1 2.5 -2.5z', 1),
        part('M16.9 18a3.6 3.6 0 1 0 7.2 0a3.6 3.6 0 1 0 -7.2 0z', 2)
      ]
    },

    artPumpkin: {
      box: 48, slots: ['호박', '꼭지', '눈'],
      colors: ['#fb8c00', '#4e342e', '#3e2723'],
      layers: [
        part('M7 28a17 13 0 1 0 34 0a17 13 0 1 0 -34 0z', 0),
        part('M6 28a7 12 0 1 0 14 0a7 12 0 1 0 -14 0z', 0),
        part('M28 28a7 12 0 1 0 14 0a7 12 0 1 0 -14 0z', 0),
        part('M22 14L26 14L27.5 9L24.5 7L21.5 9.5z', 1),
        part('M16 24L21 27L16 30z', 2),
        part('M32 24L27 27L32 30z', 2),
        part('M19 33L29 33L27 38L21 38z', 2)
      ]
    },

    artGradCap: {
      box: 48, slots: ['모자', '테두리', '술', '방울'],
      colors: ['#1e3a8a', '#0f172a', '#fbc02d', '#f9a825'],
      layers: [
        part('M24 7L46 17L24 27L2 17z', 0),
        part('M13 21L13 32L24 38L35 32L35 21L24 26.5z', 1),
        part('M42.3 19h0a0.9 0.9 0 0 1 0.9 0.9v9.2a0.9 0.9 0 0 1 -0.9 0.9H42.3a0.9 0.9 0 0 1 -0.9 -0.9V19.9a0.9 0.9 0 0 1 0.9 -0.9z', 2),
        part('M39.7 31a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0z', 3)
      ]
    },

    artDiploma: {
      box: 48, slots: ['종이', '테두리', '리본', '도장'],
      colors: ['#fff8e1', '#c9b98f', '#e53935', '#c62828'],
      layers: [
        part('M11 10h26a2 2 0 0 1 2 2v26a2 2 0 0 1 -2 2H11a2 2 0 0 1 -2 -2V12a2 2 0 0 1 2 -2z', 0),
        part('M12 13h24v24H12zM13.2 14.2v21.6h21.6V14.2z', 1),
        part('M16 18h16v2H16z', 1),
        part('M16 23h16v2H16z', 1),
        part('M20 4h8v11H20z', 2),
        part('M20 15L28 15L24 22z', 2),
        part('M26.4 32a4.6 4.6 0 1 0 9.2 0a4.6 4.6 0 1 0 -9.2 0z', 3),
        part('M28.2 32a2.8 2.8 0 1 0 5.6 0a2.8 2.8 0 1 0 -5.6 0z', 0)
      ]
    },

    artLuckyBag: {
      box: 48, slots: ['주머니', '끈', '무늬'],
      colors: ['#e53935', '#fbc02d', '#ffca28'],
      layers: [
        part('M12 30a12 12 0 1 0 24 0a12 12 0 1 0 -24 0z', 0),
        part('M13 20L35 20L31 28L17 28z', 0),
        part('M20 14h8a3 3 0 0 1 3 3v0a3 3 0 0 1 -3 3H20a3 3 0 0 1 -3 -3V17a3 3 0 0 1 3 -3z', 1),
        part('M21 15a3 3 0 1 0 6 0a3 3 0 1 0 -6 0z', 1),
        part('M19.6 30a4.4 4.4 0 1 0 8.8 0a4.4 4.4 0 1 0 -8.8 0z', 2),
        part('M15.8 33a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0z', 2),
        part('M27.8 33a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0z', 2)
      ]
    },

    artWhistle: {
      box: 48, slots: ['본체', '구멍', '고리'],
      colors: ['#90a4ae', '#eceff1', '#546e7a'],
      layers: [
        part('M5 22a6 6 0 1 0 12 0 6 6 0 1 0 -12 0zM7 22a4 4 0 1 1 8 0 4 4 0 1 1 -8 0z', 2),
        part('M20 15h10a5 5 0 0 1 5 5v4a5 5 0 0 1 -5 5H20a5 5 0 0 1 -5 -5V20a5 5 0 0 1 5 -5z', 0),
        part('M34 19L45 21.5L45 26.5L34 29z', 0),
        part('M20.6 22a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0z', 1)
      ]
    },

    artStopwatch: {
      box: 48, slots: ['테두리', '판', '바늘', '버튼'],
      colors: ['#ef5350', '#ffffff', '#37474f', '#90a4ae'],
      layers: [
        part('M17 2.5h2a2 2 0 0 1 2 2v1a2 2 0 0 1 -2 2H17a2 2 0 0 1 -2 -2V4.5a2 2 0 0 1 2 -2z', 3),
        part('M29 2.5h2a2 2 0 0 1 2 2v1a2 2 0 0 1 -2 2H29a2 2 0 0 1 -2 -2V4.5a2 2 0 0 1 2 -2z', 3),
        part('M22.4 5h3.2v4H22.4z', 3),
        part('M7 27a17 17 0 1 0 34 0a17 17 0 1 0 -34 0z', 0),
        part('M10.5 27a13.5 13.5 0 1 0 27 0a13.5 13.5 0 1 0 -27 0z', 1),
        part('M23 16h2v4H23z', 3),
        part('M23 34h2v4H23z', 3),
        part('M16 26h4v2H16z', 3),
        part('M28 26h4v2H28z', 3),
        part('M24 18h0a0.8 0.8 0 0 1 0.8 0.8v8.4a0.8 0.8 0 0 1 -0.8 0.8H24a0.8 0.8 0 0 1 -0.8 -0.8V18.8a0.8 0.8 0 0 1 0.8 -0.8z', 2),
        part('M22 27a2 2 0 1 0 4 0a2 2 0 1 0 -4 0z', 2)
      ]
    },

    artPodium: {
      box: 48, slots: ['1위', '2위', '3위', '별'],
      colors: ['#fbc02d', '#cfd8dc', '#a1887f', '#ef5350'],
      layers: [
        part('M4 28h9a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2H4a2 2 0 0 1 -2 -2V30a2 2 0 0 1 2 -2z', 1),
        part('M35 33h9a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2H35a2 2 0 0 1 -2 -2V35a2 2 0 0 1 2 -2z', 2),
        part('M19 20h10a2 2 0 0 1 2 2v22a2 2 0 0 1 -2 2H19a2 2 0 0 1 -2 -2V22a2 2 0 0 1 2 -2z', 0),
        part('M24 21L25.29 24.22L28.76 24.45L26.09 26.68L26.94 30.05L24 28.2L21.06 30.05L21.91 26.68L19.24 24.45L22.71 24.22z', 3)
      ]
    },

    artSneaker: {
      box: 48, slots: ['갑피', '밑창', '장식', '끈'],
      colors: ['#42a5f5', '#37474f', '#e53935', '#ffffff'],
      layers: [
        part('M4 37C4 32 8 30 14 30L40 30C44 30 46 32 46 35V37z', 1),
        part('M10 30C10 20 16 12 24 12C30 12 34 16 38 22L44 30z', 0),
        part('M36 23C40 25 43 27 44 30H36z', 3),
        part('M13 28L33 23L33 27L14 31z', 2),
        part('M20 16h10v2H20z', 3)
      ]
    },

    artSoccer: {
      box: 48, slots: ['흰', '검'],
      colors: ['#ffffff', '#263238'],
      layers: [
        part('M5 24a19 19 0 1 0 38 0a19 19 0 1 0 -38 0z', 0),
        part('M24 16.4L31.23 21.65L28.47 30.15L19.53 30.15L16.77 21.65z', 1),
        part('M27.4 9.5L25.05 12.73L21.25 11.5L21.25 7.5L25.05 6.27z', 1),
        part('M38.84 22.75L35.04 21.52L35.04 17.52L38.84 16.29L41.19 19.52z', 1),
        part('M29.77 37.73L29.77 33.73L33.57 32.5L35.92 35.73L33.57 38.96z', 1),
        part('M12.73 33.73L16.53 32.5L18.88 35.73L16.53 38.96L12.73 37.73z', 1),
        part('M11.26 16.29L13.61 19.52L11.26 22.75L7.46 21.52L7.46 17.52z', 1)
      ]
    },

    artBasketball: {
      box: 48, slots: ['공', '줄'],
      colors: ['#fb8c00', '#4e342e'],
      layers: [
        part('M5 24a19 19 0 1 0 38 0a19 19 0 1 0 -38 0z', 0),
        part('M22.8 5.5h2.4v37H22.8z', 1),
        part('M5.5 22.8h37v2.4H5.5z', 1),
        part('M38.38 32.3A16.6 16.6 0 0 1 9.62 32.3L11.44 31.25A14.5 14.5 0 0 0 36.56 31.25z', 1),
        part('M9.62 15.7A16.6 16.6 0 0 1 38.38 15.7L36.56 16.75A14.5 14.5 0 0 0 11.44 16.75z', 1)
      ]
    },

    artScoreboard: {
      box: 48, slots: ['판', '화면', '왼쪽', '오른쪽'],
      colors: ['#37474f', '#eceff1', '#ef5350', '#42a5f5'],
      layers: [
        part('M6 8h36a3 3 0 0 1 3 3v24a3 3 0 0 1 -3 3H6a3 3 0 0 1 -3 -3V11a3 3 0 0 1 3 -3z', 0),
        part('M8.5 11.5h31a2 2 0 0 1 2 2v19a2 2 0 0 1 -2 2H8.5a2 2 0 0 1 -2 -2V13.5a2 2 0 0 1 2 -2z', 1),
        part('M12 15h7a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2H12a2 2 0 0 1 -2 -2V17a2 2 0 0 1 2 -2z', 2),
        part('M29 15h7a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2H29a2 2 0 0 1 -2 -2V17a2 2 0 0 1 2 -2z', 3),
        part('M22.5 21h3v4H22.5z', 0)
      ]
    },

    artCheerPom: {
      box: 48, slots: ['1', '2', '손잡이'],
      colors: ['#ef5350', '#ffca28', '#90a4ae'],
      layers: [
        part('M23.5 28h1a2 2 0 0 1 2 2v13a2 2 0 0 1 -2 2H23.5a2 2 0 0 1 -2 -2V30a2 2 0 0 1 2 -2z', 2),
        part('M15 19a9 9 0 1 0 18 0a9 9 0 1 0 -18 0z', 1),
        part('M23.36 15.05L24 0L24.64 15.05z', 0),
        part('M24.92 15.11L31.27 1.45L26.1 15.6z', 1),
        part('M26.34 15.76L37.44 5.56L27.24 16.66z', 0),
        part('M27.4 16.9L41.55 11.73L27.89 18.08z', 1),
        part('M27.95 18.36L43 19L27.95 19.64z', 0),
        part('M27.89 19.92L41.55 26.27L27.4 21.1z', 1),
        part('M27.24 21.34L37.44 32.44L26.34 22.24z', 0),
        part('M26.1 22.4L31.27 36.55L24.92 22.89z', 1),
        part('M24.64 22.95L24 38L23.36 22.95z', 0),
        part('M23.08 22.89L16.73 36.55L21.9 22.4z', 1),
        part('M21.66 22.24L10.56 32.44L20.76 21.34z', 0),
        part('M20.6 21.1L6.45 26.27L20.11 19.92z', 1),
        part('M20.05 19.64L5 19L20.05 18.36z', 0),
        part('M20.11 18.08L6.45 11.73L20.6 16.9z', 1),
        part('M20.76 16.66L10.56 5.56L21.66 15.76z', 0),
        part('M21.9 15.6L16.73 1.45L23.08 15.11z', 1)
      ]
    },

    artBlackboard: {
      box: 48, slots: ['판', '테두리', '분필', '글'],
      colors: ['#2e7d32', '#8d6e63', '#ffffff', '#fdd835'],
      layers: [
        part('M5 7h38a2 2 0 0 1 2 2v27a2 2 0 0 1 -2 2H5a2 2 0 0 1 -2 -2V9a2 2 0 0 1 2 -2z', 1),
        part('M6 10h36v25H6z', 0),
        part('M10 16h20v2.4H10z', 2),
        part('M10 21h26v2.4H10z', 2),
        part('M10 26h13v2.4H10z', 3),
        part('M9.5 35h29a1.5 1.5 0 0 1 1.5 1.5v0a1.5 1.5 0 0 1 -1.5 1.5H9.5a1.5 1.5 0 0 1 -1.5 -1.5V36.5a1.5 1.5 0 0 1 1.5 -1.5z', 1)
      ]
    },

    artBookStack: {
      box: 48, slots: ['1', '2', '3', '갈피'],
      colors: ['#5c6bc0', '#ef5350', '#43a047', '#fbc02d'],
      layers: [
        part('M8.5 35h31a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1 -1.5 1.5H8.5a1.5 1.5 0 0 1 -1.5 -1.5V36.5a1.5 1.5 0 0 1 1.5 -1.5z', 0),
        part('M6.5 25h35a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1 -1.5 1.5H6.5a1.5 1.5 0 0 1 -1.5 -1.5V26.5a1.5 1.5 0 0 1 1.5 -1.5z', 1),
        part('M10.5 15h27a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1 -1.5 1.5H10.5a1.5 1.5 0 0 1 -1.5 -1.5V16.5a1.5 1.5 0 0 1 1.5 -1.5z', 2),
        part('M30 15L33 15L33 26L31.5 24L30 26z', 3)
      ]
    },

    artPencil: {
      box: 48, slots: ['몸통', '깎인 면', '심', '지우개'],
      colors: ['#fdd835', '#e0b98a', '#4e342e', '#f48fb1'],
      layers: [
        part('M22.5 3h3a2.5 2.5 0 0 1 2.5 2.5v1a2.5 2.5 0 0 1 -2.5 2.5H22.5a2.5 2.5 0 0 1 -2.5 -2.5V5.5a2.5 2.5 0 0 1 2.5 -2.5z', 3),
        part('M20 9h8v3.6H20z', 1),
        part('M20 12.6h8v20H20z', 0),
        part('M20 32.6L28 32.6L24 44z', 1),
        part('M22.6 38.4L25.4 38.4L24 43.4z', 2)
      ]
    },

    artBell: {
      box: 48, slots: ['종', '테두리', '고리'],
      colors: ['#fbc02d', '#f9a825', '#8d6e63'],
      layers: [
        part('M19 8a5 5 0 1 0 10 0 5 5 0 1 0 -10 0zM21 8a3 3 0 1 1 6 0 3 3 0 1 1 -6 0z', 2),
        part('M14 33C14 21 17 11 24 11C31 11 34 21 34 33z', 0),
        part('M13.5 31h21a2.5 2.5 0 0 1 2.5 2.5v0a2.5 2.5 0 0 1 -2.5 2.5H13.5a2.5 2.5 0 0 1 -2.5 -2.5V33.5a2.5 2.5 0 0 1 2.5 -2.5z', 1),
        part('M20.6 39a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0z', 2)
      ]
    },

    artLocker: {
      box: 48, slots: ['문', '테두리', '손잡이', '통풍구'],
      colors: ['#42a5f5', '#1e88e5', '#37474f', '#cfd8dc'],
      layers: [
        part('M10 5h28a2 2 0 0 1 2 2v35a2 2 0 0 1 -2 2H10a2 2 0 0 1 -2 -2V7a2 2 0 0 1 2 -2z', 1),
        part('M11 8h12.5v33H11z', 0),
        part('M24.5 8h12.5v33H24.5z', 0),
        part('M19.5 22h2.6v7H19.5z', 2),
        part('M25.9 22h2.6v7H25.9z', 2),
        part('M14 12h6.5v1.8H14z', 3),
        part('M27.5 12h6.5v1.8H27.5z', 3)
      ]
    },

    artGlobe: {
      box: 48, slots: ['바다', '땅', '받침', '축'],
      colors: ['#42a5f5', '#66bb6a', '#8d6e63', '#90a4ae'],
      layers: [
        part('M11 43L37 43L33 38L15 38z', 2),
        part('M22.8 34h2.4v5H22.8z', 2),
        part('M9 21a15 15 0 1 0 30 0a15 15 0 1 0 -30 0z', 0),
        part('M14 15C18 12 22 14 24 17C26 20 31 19 34 22C32 28 27 32 24 33C19 32 15 27 14 22z', 1),
        part('M30 8L36 11L34 15L29 13z', 1),
        part('M23 4h2v5H23z', 3)
      ]
    },

    artLantern: {
      box: 48, slots: ['등', '테두리', '끈'],
      colors: ['#e53935', '#fbc02d', '#8d6e63'],
      layers: [
        part('M23.2 2h1.6v8H23.2z', 2),
        part('M16 9h16v3.6H16z', 1),
        part('M10 24a14 11.5 0 1 0 28 0a14 11.5 0 1 0 -28 0z', 0),
        part('M16 35.4h16v3.6H16z', 1),
        part('M22.8 39h2.4v6H22.8z', 1),
        part('M21 45L27 45L24 48z', 1)
      ]
    },

    artFan: {
      box: 48, slots: ['살', '천', '손잡이', '무늬'],
      colors: ['#8d6e63', '#f8bbd0', '#fbc02d', '#f06292'],
      layers: [
        part('M23.5 36h1a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2H23.5a2 2 0 0 1 -2 -2V38a2 2 0 0 1 2 -2z', 2),
        part('M24 38L3 18C9 10 16 6 24 6C32 6 39 10 45 18z', 1),
        part('M24 38L2.79 12.72L4.61 11.3z', 0),
        part('M24 38L12.17 7.19L14.35 6.44z', 0),
        part('M24 38L22.85 5.02L25.15 5.02z', 0),
        part('M24 38L33.65 6.44L35.83 7.19z', 0),
        part('M24 38L43.39 11.3L45.21 12.72z', 0),
        part('M20.6 16a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0z', 3),
        part('M13.6 24a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0z', 3),
        part('M29.6 24a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0z', 3)
      ]
    },

    artKite: {
      box: 48, slots: ['연', '무늬', '테두리', '꼬리'],
      colors: ['#fdd835', '#ffffff', '#8d6e63', '#e53935'],
      layers: [
        part('M24 4L42 22L24 44L6 22z', 0),
        part('M24 13L33 22L24 34L15 22z', 1),
        part('M23.4 4h1.2v40H23.4z', 2),
        part('M6 21.4h36v1.2H6z', 2),
        part('M24 44L27 46.5L24 48L21 46.5z', 3)
      ]
    },

    artDrum: {
      box: 48, slots: ['통', '테두리', '가죽'],
      colors: ['#e53935', '#8d6e63', '#fdd835'],
      layers: [
        part('M8 34a16 5 0 1 0 32 0a16 5 0 1 0 -32 0z', 0),
        part('M8 15h32v19H8z', 0),
        part('M8 15a16 5 0 1 0 32 0a16 5 0 1 0 -32 0z', 2),
        part('M8 11.5h32v3.6H8z', 1),
        part('M8 33.9h32v3.6H8z', 1),
        part('M21 15a3 3 0 1 0 6 0a3 3 0 1 0 -6 0z', 1)
      ]
    },

    artSongpyeon: {
      box: 48, slots: ['송편', '옅은 송편', '접시'],
      colors: ['#a5d6a7', '#c8e6c9', '#8d6e63'],
      layers: [
        part('M6 39a18 3.4 0 1 0 36 0a18 3.4 0 1 0 -36 0z', 2),
        part('M8 34a6 6 0 0 1 12 0z', 0),
        part('M28 32a6.5 6.5 0 0 1 13 0z', 1),
        part('M17 37a5.5 5.5 0 0 1 11 0z', 0),
        part('M12.6 31a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0z', 2),
        part('M32.6 29a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0z', 2)
      ]
    },

    artPlum: {
      box: 48, slots: ['가지', '꽃잎', '꽃 가운데', '잎'],
      colors: ['#8d6e63', '#f06292', '#ffca28', '#66bb6a'],
      layers: [
        part('M2 43C10 35 18 27 30 21C36 18 42 13 46 8L47 10C43 15 38 20 32 23C20 29 12 37 4 45z', 0),
        part('M16 30C18.2 23.8 23.8 23.8 26 30C23.8 27.4 18.2 27.4 16 30z', 3),
        part('M30 22C32.2 28.2 37.8 28.2 40 22C37.8 24.6 32.2 24.6 30 22z', 3),
        part('M40.18 12a3.016 3.016 0 1 0 6.032 0a3.016 3.016 0 1 0 -6.032 0z', 1),
        part('M36.59 16.95a3.016 3.016 0 1 0 6.032 0a3.016 3.016 0 1 0 -6.032 0z', 1),
        part('M30.78 15.06a3.016 3.016 0 1 0 6.032 0a3.016 3.016 0 1 0 -6.032 0z', 1),
        part('M30.78 8.94a3.016 3.016 0 1 0 6.032 0a3.016 3.016 0 1 0 -6.032 0z', 1),
        part('M36.59 7.05a3.016 3.016 0 1 0 6.032 0a3.016 3.016 0 1 0 -6.032 0z', 1),
        part('M35.82 12a2.184 2.184 0 1 0 4.368 0a2.184 2.184 0 1 0 -4.368 0z', 2),
        part('M29.93 22a2.6679999999999997 2.6679999999999997 0 1 0 5.335999999999999 0a2.6679999999999997 2.6679999999999997 0 1 0 -5.335999999999999 0z', 1),
        part('M26.75 26.37a2.6679999999999997 2.6679999999999997 0 1 0 5.335999999999999 0a2.6679999999999997 2.6679999999999997 0 1 0 -5.335999999999999 0z', 1),
        part('M21.61 24.7a2.6679999999999997 2.6679999999999997 0 1 0 5.335999999999999 0a2.6679999999999997 2.6679999999999997 0 1 0 -5.335999999999999 0z', 1),
        part('M21.61 19.3a2.6679999999999997 2.6679999999999997 0 1 0 5.335999999999999 0a2.6679999999999997 2.6679999999999997 0 1 0 -5.335999999999999 0z', 1),
        part('M26.75 17.63a2.6679999999999997 2.6679999999999997 0 1 0 5.335999999999999 0a2.6679999999999997 2.6679999999999997 0 1 0 -5.335999999999999 0z', 1),
        part('M26.07 22a1.9319999999999997 1.9319999999999997 0 1 0 3.8639999999999994 0a1.9319999999999997 1.9319999999999997 0 1 0 -3.8639999999999994 0z', 2),
        part('M41.76 26a2.436 2.436 0 1 0 4.872 0a2.436 2.436 0 1 0 -4.872 0z', 1),
        part('M38.86 29.99a2.436 2.436 0 1 0 4.872 0a2.436 2.436 0 1 0 -4.872 0z', 1),
        part('M34.17 28.47a2.436 2.436 0 1 0 4.872 0a2.436 2.436 0 1 0 -4.872 0z', 1),
        part('M34.17 23.53a2.436 2.436 0 1 0 4.872 0a2.436 2.436 0 1 0 -4.872 0z', 1),
        part('M38.86 22.01a2.436 2.436 0 1 0 4.872 0a2.436 2.436 0 1 0 -4.872 0z', 1),
        part('M38.24 26a1.764 1.764 0 1 0 3.528 0a1.764 1.764 0 1 0 -3.528 0z', 2)
      ]
    },

    artTaeguk: {
      box: 48, slots: ['빨강', '파랑'],
      colors: ['#c62828', '#1e3a8a'],
      layers: [
        part('M4 24a20 20 0 0 1 40 0a10 10 0 0 0-20 0a10 10 0 0 1-20 0z', 0),
        part('M4 24a20 20 0 0 0 40 0a10 10 0 0 1-20 0a10 10 0 0 0-20 0z', 1)
      ]
    },

    artKnot: {
      box: 48, slots: ['매듭', '술'],
      colors: ['#e53935', '#fbc02d'],
      layers: [
        part('M5 18a9 7 0 1 0 18 0a9 7 0 1 0 -18 0z', 0),
        part('M25 18a9 7 0 1 0 18 0a9 7 0 1 0 -18 0z', 0),
        part('M18.6 18a5.4 5.4 0 1 0 10.8 0a5.4 5.4 0 1 0 -10.8 0z', 0),
        part('M20 25L28 25L31 44L17 44z', 1),
        part('M19 44h10v3.4H19z', 1)
      ]
    },

    artSignpost: {
      box: 48, slots: ['기둥', '판1', '판2', '판3'],
      colors: ['#546e7a', '#42a5f5', '#66bb6a', '#fb8c00'],
      layers: [
        part('M24 4h0a1.6 1.6 0 0 1 1.6 1.6v38.8a1.6 1.6 0 0 1 -1.6 1.6H24a1.6 1.6 0 0 1 -1.6 -1.6V5.6a1.6 1.6 0 0 1 1.6 -1.6z', 0),
        part('M5 7L36 7L43 13L36 19L5 19z', 1),
        part('M43 22L12 22L5 28L12 34L43 34z', 2),
        part('M5 37L36 37L43 43L5 46z', 3)
      ]
    },

    artArrowSign: {
      box: 48, slots: ['판', '화살표', '테두리'],
      colors: ['#1e3a8a', '#ffffff', '#fbc02d'],
      layers: [
        part('M5 13h38a3 3 0 0 1 3 3v16a3 3 0 0 1 -3 3H5a3 3 0 0 1 -3 -3V16a3 3 0 0 1 3 -3z', 0),
        part('M7 16h34a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2H7a2 2 0 0 1 -2 -2V18a2 2 0 0 1 2 -2z', 2),
        part('M11 21h16v-4l11 7-11 7v-4H11z', 1)
      ]
    },

    artWarningSign: {
      box: 48, slots: ['표지', '테두리', '느낌표'],
      colors: ['#fbc02d', '#37474f', '#ffffff'],
      layers: [
        part('M24 3L46 42L2 42z', 1),
        part('M24 9L40 38L8 38z', 0),
        part('M22.6 16h2.8v12H22.6z', 1),
        part('M22.1 32.5a1.9 1.9 0 1 0 3.8 0a1.9 1.9 0 1 0 -3.8 0z', 1)
      ]
    },

    artInfoSign: {
      box: 48, slots: ['표지', '기호'],
      colors: ['#1d4ed8', '#ffffff'],
      layers: [
        part('M4 24a20 20 0 1 0 40 0a20 20 0 1 0 -40 0z', 0),
        part('M22.6 21h2.8v13H22.6z', 1),
        part('M21.9 15.5a2.1 2.1 0 1 0 4.2 0a2.1 2.1 0 1 0 -4.2 0z', 1)
      ]
    },

    artExitSign: {
      box: 48, slots: ['판', '문', '화살표'],
      colors: ['#43a047', '#ffffff', '#ffffff'],
      layers: [
        part('M4.5 14h39a2.5 2.5 0 0 1 2.5 2.5v15a2.5 2.5 0 0 1 -2.5 2.5H4.5a2.5 2.5 0 0 1 -2.5 -2.5V16.5a2.5 2.5 0 0 1 2.5 -2.5z', 0),
        part('M8 31L8 20L15 17L15 31z', 1),
        part('M20 21h11v-3l11 6-11 6v-3H20z', 2)
      ]
    },

    artNumberTag: {
      box: 48, slots: ['판', '번호', '끈'],
      colors: ['#ef5350', '#ffffff', '#b71c1c'],
      layers: [
        part('M21.6 6a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0z', 2),
        part('M13 9h22a3 3 0 0 1 3 3v27a3 3 0 0 1 -3 3H13a3 3 0 0 1 -3 -3V12a3 3 0 0 1 3 -3z', 0),
        part('M16 13h16a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2H16a2 2 0 0 1 -2 -2V15a2 2 0 0 1 2 -2z', 1),
        part('M18 17h3v5H18z', 2),
        part('M25 17h5v2H25z', 2),
        part('M21 34a3 3 0 1 0 6 0a3 3 0 1 0 -6 0z', 1)
      ]
    },

    artDirectory: {
      box: 48, slots: ['판', '표시1', '표시2', '글줄'],
      colors: ['#1e3a8a', '#fbc02d', '#66bb6a', '#ffffff'],
      layers: [
        part('M6 5h36a3 3 0 0 1 3 3v32a3 3 0 0 1 -3 3H6a3 3 0 0 1 -3 -3V8a3 3 0 0 1 3 -3z', 0),
        part('M8 11h7v7H8z', 1),
        part('M8 21h7v7H8z', 2),
        part('M8 31h7v7H8z', 1),
        part('M19 13h21v3H19z', 3),
        part('M19 23h21v3H19z', 3),
        part('M19 33h14v3H19z', 3)
      ]
    },

    artParkingSign: {
      box: 48, slots: ['표지', '기호'],
      colors: ['#1d4ed8', '#ffffff'],
      layers: [
        part('M10 4h28a4 4 0 0 1 4 4v32a4 4 0 0 1 -4 4H10a4 4 0 0 1 -4 -4V8a4 4 0 0 1 4 -4z', 0),
        part('M15 12h4.4v24H15z', 1),
        part('M17.4 19a6.6 6.6 0 1 0 13.2 0a6.6 6.6 0 1 0 -13.2 0z', 1)
      ]
    },

    artSuitcase: {
      box: 48, slots: ['가방', '띠', '손잡이', '라벨'],
      colors: ['#1565c0', '#b0bec5', '#546e7a', '#ffca28'],
      layers: [
        part('M21.6 5h4.8a2.6 2.6 0 0 1 2.6 2.6v1.8a2.6 2.6 0 0 1 -2.6 2.6H21.6a2.6 2.6 0 0 1 -2.6 -2.6V7.6a2.6 2.6 0 0 1 2.6 -2.6z', 2),
        part('M9 12h30a4 4 0 0 1 4 4v22a4 4 0 0 1 -4 4H9a4 4 0 0 1 -4 -4V16a4 4 0 0 1 4 -4z', 0),
        part('M14 12h3.4v30H14z', 1),
        part('M30.6 12h3.4v30H30.6z', 1),
        part('M20.6 21h6.8a1.6 1.6 0 0 1 1.6 1.6v5.8a1.6 1.6 0 0 1 -1.6 1.6H20.6a1.6 1.6 0 0 1 -1.6 -1.6V22.6a1.6 1.6 0 0 1 1.6 -1.6z', 3)
      ]
    },

    artCamera: {
      box: 48, slots: ['몸통', '렌즈', '유리', '버튼'],
      colors: ['#37474f', '#90a4ae', '#e1f5fe', '#ffca28'],
      layers: [
        part('M16 6h10a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2H16a2 2 0 0 1 -2 -2V8a2 2 0 0 1 2 -2z', 0),
        part('M7 12h34a4 4 0 0 1 4 4v20a4 4 0 0 1 -4 4H7a4 4 0 0 1 -4 -4V16a4 4 0 0 1 4 -4z', 0),
        part('M13.5 26a10.5 10.5 0 1 0 21 0a10.5 10.5 0 1 0 -21 0z', 1),
        part('M17.6 26a6.4 6.4 0 1 0 12.8 0a6.4 6.4 0 1 0 -12.8 0z', 2),
        part('M7 16h6v3H7z', 3),
        part('M36.4 17a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0z', 3)
      ]
    },

    artMap: {
      box: 48, slots: ['종이', '접힌 선', '경로', '핀'],
      colors: ['#ffe082', '#d7ccc8', '#43a047', '#e53935'],
      layers: [
        part('M5 11L17 7L31 12L43 8L43 37L31 41L17 36L5 40z', 0),
        part('M16.4 7L18 7L18 36L16.4 36z', 1),
        part('M30.4 12L32 12L32 41L30.4 41z', 1),
        part('M9.2 24a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0z', 2),
        part('M21.2 30a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0z', 2),
        part('M35.2 20a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0z', 2),
        part('M28.4 20a4.6 4.6 0 1 0 9.2 0a4.6 4.6 0 1 0 -9.2 0z', 3),
        part('M29.6 23L36.4 23L33 29.6z', 3)
      ]
    },

    artCompass: {
      box: 48, slots: ['테', '바늘', '남쪽', '눈금'],
      colors: ['#455a64', '#e53935', '#78909c', '#eceff1'],
      layers: [
        part('M4 24a20 20 0 1 0 40 0a20 20 0 1 0 -40 0z', 0),
        part('M7.6 24a16.4 16.4 0 1 0 32.8 0a16.4 16.4 0 1 0 -32.8 0z', 3),
        part('M24 9.5L27.6 24L20.4 24z', 1),
        part('M24 38.5L20.4 24L27.6 24z', 2),
        part('M21.6 24a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0z', 1),
        part('M23 3.4h2v3H23z', 0),
        part('M23 41.6h2v3H23z', 0)
      ]
    },

    artTicket: {
      box: 48, slots: ['표', '별', '홈'],
      colors: ['#ff7043', '#ffe0b2', '#ffffff'],
      layers: [
        part('M6.4 13h35.2a2.4 2.4 0 0 1 2.4 2.4v17.2a2.4 2.4 0 0 1 -2.4 2.4H6.4a2.4 2.4 0 0 1 -2.4 -2.4V15.4a2.4 2.4 0 0 1 2.4 -2.4z', 0),
        part('M0.4 24a3.6 3.6 0 1 0 7.2 0a3.6 3.6 0 1 0 -7.2 0z', 2),
        part('M40.4 24a3.6 3.6 0 1 0 7.2 0a3.6 3.6 0 1 0 -7.2 0z', 2),
        part('M16 18L17.65 21.73L21.71 22.15L18.66 24.87L19.53 28.85L16 26.8L12.47 28.85L13.34 24.87L10.29 22.15L14.35 21.73z', 1),
        part('M30 15h1.6v3H30z', 2),
        part('M30 21h1.6v3H30z', 2),
        part('M30 27h1.6v3H30z', 2),
        part('M30 33h1.6v3H30z', 2)
      ]
    },

    artSunglasses: {
      box: 48, slots: ['렌즈', '테', '다리'],
      colors: ['#263238', '#546e7a', '#37474f'],
      layers: [
        part('M8.5 16h8a4.5 4.5 0 0 1 4.5 4.5v4a4.5 4.5 0 0 1 -4.5 4.5H8.5a4.5 4.5 0 0 1 -4.5 -4.5V20.5a4.5 4.5 0 0 1 4.5 -4.5z', 0),
        part('M31.5 16h8a4.5 4.5 0 0 1 4.5 4.5v4a4.5 4.5 0 0 1 -4.5 4.5H31.5a4.5 4.5 0 0 1 -4.5 -4.5V20.5a4.5 4.5 0 0 1 4.5 -4.5z', 0),
        part('M21 18.4h6v2.6H21z', 1),
        part('M1.7 12.6h3.8a1.3 1.3 0 0 1 1.3 1.3v0a1.3 1.3 0 0 1 -1.3 1.3H1.7a1.3 1.3 0 0 1 -1.3 -1.3V13.9a1.3 1.3 0 0 1 1.3 -1.3z', 2),
        part('M42.5 12.6h3.8a1.3 1.3 0 0 1 1.3 1.3v0a1.3 1.3 0 0 1 -1.3 1.3H42.5a1.3 1.3 0 0 1 -1.3 -1.3V13.9a1.3 1.3 0 0 1 1.3 -1.3z', 2)
      ]
    },

    artBeachBall: {
      box: 48, slots: ['1', '2', '3'],
      colors: ['#e53935', '#ffca28', '#29b6f6'],
      layers: [
        part('M4 24a20 20 0 1 0 40 0a20 20 0 1 0 -40 0z', 2),
        part('M24 24L4.4 24L4.42 23.15L4.47 22.29L4.57 21.44L4.7 20.6L4.86 19.76L5.07 18.93L5.31 18.11L5.58 17.3L5.89 16.5L6.24 15.72L6.61 14.95L7.03 14.2L7.47 13.47L7.94 12.76L8.45 12.07L8.99 11.4L9.55 10.76L10.14 10.14L10.76 9.55L11.4 8.99L12.07 8.45L12.76 7.94L13.47 7.47L14.2 7.03z', 0),
        part('M24 24L14.2 7.03L14.95 6.61L15.72 6.24L16.5 5.89L17.3 5.58L18.11 5.31L18.93 5.07L19.76 4.86L20.6 4.7L21.44 4.57L22.29 4.47L23.15 4.42L24 4.4L24.85 4.42L25.71 4.47L26.56 4.57L27.4 4.7L28.24 4.86L29.07 5.07L29.89 5.31L30.7 5.58L31.5 5.89L32.28 6.24L33.05 6.61L33.8 7.03z', 1),
        part('M24 24L33.8 7.03L34.53 7.47L35.24 7.94L35.93 8.45L36.6 8.99L37.24 9.55L37.86 10.14L38.45 10.76L39.01 11.4L39.55 12.07L40.06 12.76L40.53 13.47L40.97 14.2L41.39 14.95L41.76 15.72L42.11 16.5L42.42 17.3L42.69 18.11L42.93 18.93L43.14 19.76L43.3 20.6L43.43 21.44L43.53 22.29L43.58 23.15L43.6 24z', 2),
        part('M24 24L43.6 24L43.58 24.85L43.53 25.71L43.43 26.56L43.3 27.4L43.14 28.24L42.93 29.07L42.69 29.89L42.42 30.7L42.11 31.5L41.76 32.28L41.39 33.05L40.97 33.8L40.53 34.53L40.06 35.24L39.55 35.93L39.01 36.6L38.45 37.24L37.86 37.86L37.24 38.45L36.6 39.01L35.93 39.55L35.24 40.06L34.53 40.53L33.8 40.97z', 0),
        part('M24 24L33.8 40.97L33.05 41.39L32.28 41.76L31.5 42.11L30.7 42.42L29.89 42.69L29.07 42.93L28.24 43.14L27.4 43.3L26.56 43.43L25.71 43.53L24.85 43.58L24 43.6L23.15 43.58L22.29 43.53L21.44 43.43L20.6 43.3L19.76 43.14L18.93 42.93L18.11 42.69L17.3 42.42L16.5 42.11L15.72 41.76L14.95 41.39L14.2 40.97z', 1),
        part('M24 24L14.2 40.97L13.47 40.53L12.76 40.06L12.07 39.55L11.4 39.01L10.76 38.45L10.14 37.86L9.55 37.24L8.99 36.6L8.45 35.93L7.94 35.24L7.47 34.53L7.03 33.8L6.61 33.05L6.24 32.28L5.89 31.5L5.58 30.7L5.31 29.89L5.07 29.07L4.86 28.24L4.7 27.4L4.57 26.56L4.47 25.71L4.42 24.85L4.4 24z', 2)
      ]
    },

    artTent: {
      box: 48, slots: ['천', '입구', '말뚝'],
      colors: ['#2e7d32', '#1b5e20', '#8d6e63'],
      layers: [
        part('M2 41L24 8L46 41z', 0),
        part('M15 41L24 20L33 41z', 1),
        part('M2 41h6v2.6H2z', 2),
        part('M40 41h6v2.6H40z', 2)
      ]
    },

    artPan: {
      box: 48, slots: ['팬', '손잡이', '음식'],
      colors: ['#455a64', '#6d4c41', '#ffca28'],
      layers: [
        part('M5 26a14 14 0 1 0 28 0a14 14 0 1 0 -28 0z', 0),
        part('M7.8 26a11.2 11.2 0 1 0 22.4 0a11.2 11.2 0 1 0 -22.4 0z', 2),
        part('M32.6 23.4h11.8a2.6 2.6 0 0 1 2.6 2.6v0a2.6 2.6 0 0 1 -2.6 2.6H32.6a2.6 2.6 0 0 1 -2.6 -2.6V26a2.6 2.6 0 0 1 2.6 -2.6z', 1)
      ]
    },

    artPot: {
      box: 48, slots: ['몸통', '뚜껑', '손잡이'],
      colors: ['#c62828', '#eceff1', '#37474f'],
      layers: [
        part('M11 20h26a3 3 0 0 1 3 3v15a3 3 0 0 1 -3 3H11a3 3 0 0 1 -3 -3V23a3 3 0 0 1 3 -3z', 0),
        part('M3 26h5v4.4H3z', 2),
        part('M40 26h5v4.4H40z', 2),
        part('M9 18a15 8 0 0 1 30 0z', 1),
        part('M6 17h36v3H6z', 1),
        part('M21 8.4a3 3 0 1 0 6 0a3 3 0 1 0 -6 0z', 2)
      ]
    },

    artCuttingBoard: {
      box: 48, slots: ['도마', '칼', '자루', '구멍'],
      colors: ['#d7a86e', '#cfd8dc', '#5d4037', '#ffffff'],
      layers: [
        part('M6 12h20a3 3 0 0 1 3 3v24a3 3 0 0 1 -3 3H6a3 3 0 0 1 -3 -3V15a3 3 0 0 1 3 -3z', 0),
        part('M22.8 17a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0z', 3),
        part('M35 7L43 7L43 27L39 33L35 27z', 1),
        part('M38.4 31h1.2a2.4 2.4 0 0 1 2.4 2.4v7.2a2.4 2.4 0 0 1 -2.4 2.4H38.4a2.4 2.4 0 0 1 -2.4 -2.4V33.4a2.4 2.4 0 0 1 2.4 -2.4z', 2)
      ]
    },

    artLadle: {
      box: 48, slots: ['국자', '손잡이', '국물'],
      colors: ['#90a4ae', '#546e7a', '#ffca28'],
      layers: [
        part('M30 18L46 8L47.6 10.8L31.6 21z', 1),
        part('M9 21a11.5 11.5 0 0 0 23 0z', 0),
        part('M9 21a11.5 3.2 0 1 0 23 0a11.5 3.2 0 1 0 -23 0z', 2)
      ]
    },

    artFriedEgg: {
      box: 48, slots: ['흰자', '노른자'],
      colors: ['#eceff1', '#ffb300'],
      layers: [
        part('M24 7C34 5 44 13 43 24 42 35 33 43 23 42 12 41 4 33 5 22 6 11 14 9 24 7z', 0),
        part('M15 25a9 9 0 1 0 18 0a9 9 0 1 0 -18 0z', 1)
      ]
    },

    artPepperMill: {
      box: 48, slots: ['몸통', '뚜껑', '후추'],
      colors: ['#6d4c41', '#8d6e63', '#37474f'],
      layers: [
        part('M16 18L32 18L30 43L18 43z', 0),
        part('M17 9L31 9L32 18L16 18z', 1),
        part('M16.7 5.4a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0 -2.6 0z', 2),
        part('M22.7 3.4a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0 -2.6 0z', 2),
        part('M28.7 5.4a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0 -2.6 0z', 2)
      ]
    },

    artOvenMitt: {
      box: 48, slots: ['장갑', '손목', '무늬'],
      colors: ['#e53935', '#b71c1c', '#ffffff'],
      layers: [
        part('M20 11h8a8 8 0 0 1 8 8v11a8 8 0 0 1 -8 8H20a8 8 0 0 1 -8 -8V19a8 8 0 0 1 8 -8z', 0),
        part('M10 24h3a5 5 0 0 1 5 5v0a5 5 0 0 1 -5 5H10a5 5 0 0 1 -5 -5V29a5 5 0 0 1 5 -5z', 0),
        part('M12 36.5h24a3 3 0 0 1 3 3v2.5a3 3 0 0 1 -3 3H12a3 3 0 0 1 -3 -3V39.5a3 3 0 0 1 3 -3z', 1),
        part('M17.8 21a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0z', 2),
        part('M25.8 21a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0z', 2),
        part('M21.8 29a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0z', 2)
      ]
    },

    artRollingPin: {
      box: 48, slots: ['원통', '손잡이'],
      colors: ['#d7a86e', '#8d6e63'],
      layers: [
        part('M14 19h20a4 4 0 0 1 4 4v2a4 4 0 0 1 -4 4H14a4 4 0 0 1 -4 -4V23a4 4 0 0 1 4 -4z', 0),
        part('M4.6 21.4h4.8a2.6 2.6 0 0 1 2.6 2.6v0a2.6 2.6 0 0 1 -2.6 2.6H4.6a2.6 2.6 0 0 1 -2.6 -2.6V24a2.6 2.6 0 0 1 2.6 -2.6z', 1),
        part('M38.6 21.4h4.8a2.6 2.6 0 0 1 2.6 2.6v0a2.6 2.6 0 0 1 -2.6 2.6H38.6a2.6 2.6 0 0 1 -2.6 -2.6V24a2.6 2.6 0 0 1 2.6 -2.6z', 1)
      ]
    },

    artStethoscope: {
      box: 48, slots: ['줄', '이어피스', '흉부'],
      colors: ['#37474f', '#90a4ae', '#b0bec5'],
      layers: [
        part('M10 4h0a1.7 1.7 0 0 1 1.7 1.7v5.6a1.7 1.7 0 0 1 -1.7 1.7H10a1.7 1.7 0 0 1 -1.7 -1.7V5.7a1.7 1.7 0 0 1 1.7 -1.7z', 1),
        part('M38 4h0a1.7 1.7 0 0 1 1.7 1.7v5.6a1.7 1.7 0 0 1 -1.7 1.7H38a1.7 1.7 0 0 1 -1.7 -1.7V5.7a1.7 1.7 0 0 1 1.7 -1.7z', 1),
        part('M38 14A14 14 0 0 1 10 14L13 14A11 11 0 0 0 35 14z', 0),
        part('M22.6 26h2.8v8H22.6z', 0),
        part('M17.6 38a6.4 6.4 0 1 0 12.8 0a6.4 6.4 0 1 0 -12.8 0z', 2),
        part('M20.6 38a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0z', 1)
      ]
    },

    artBandage: {
      box: 48, slots: ['대', '거즈', '구멍'],
      colors: ['#ffb74d', '#fff3e0', '#d7ccc8'],
      layers: [
        part('M8 18h32a6 6 0 0 1 6 6v0a6 6 0 0 1 -6 6H8a6 6 0 0 1 -6 -6V24a6 6 0 0 1 6 -6z', 0),
        part('M19.4 16.6h9.2a2.4 2.4 0 0 1 2.4 2.4v10a2.4 2.4 0 0 1 -2.4 2.4H19.4a2.4 2.4 0 0 1 -2.4 -2.4V19a2.4 2.4 0 0 1 2.4 -2.4z', 1),
        part('M6.7 24a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0 -2.6 0z', 2),
        part('M10.7 24a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0 -2.6 0z', 2),
        part('M34.7 24a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0 -2.6 0z', 2),
        part('M38.7 24a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0 -2.6 0z', 2)
      ]
    },

    artPills: {
      box: 48, slots: ['캡슐', '캡슐2', '속'],
      colors: ['#e53935', '#ffca28', '#ffffff'],
      layers: [
        part('M10.5 14h0a5.5 5.5 0 0 1 5.5 5.5v11a5.5 5.5 0 0 1 -5.5 5.5H10.5a5.5 5.5 0 0 1 -5.5 -5.5V19.5a5.5 5.5 0 0 1 5.5 -5.5z', 0),
        part('M5 25h11v5.5a5.5 5.5 0 0 1 -11 0z', 2),
        part('M24 10h0a5.5 5.5 0 0 1 5.5 5.5v11a5.5 5.5 0 0 1 -5.5 5.5H24a5.5 5.5 0 0 1 -5.5 -5.5V15.5a5.5 5.5 0 0 1 5.5 -5.5z', 1),
        part('M18.5 21h11v5.5a5.5 5.5 0 0 1 -11 0z', 2),
        part('M37.5 15h0a5.5 5.5 0 0 1 5.5 5.5v11a5.5 5.5 0 0 1 -5.5 5.5H37.5a5.5 5.5 0 0 1 -5.5 -5.5V20.5a5.5 5.5 0 0 1 5.5 -5.5z', 0),
        part('M32 26h11v5.5a5.5 5.5 0 0 1 -11 0z', 2)
      ]
    },

    artSyringe: {
      box: 48, slots: ['통', '피스톤', '바늘', '약'],
      colors: ['#eceff1', '#90a4ae', '#b0bec5', '#42a5f5'],
      layers: [
        part('M15 12h10a2 2 0 0 1 2 2v20a2 2 0 0 1 -2 2H15a2 2 0 0 1 -2 -2V14a2 2 0 0 1 2 -2z', 0),
        part('M16 22h8a1.4 1.4 0 0 1 1.4 1.4v9.6a1.4 1.4 0 0 1 -1.4 1.4H16a1.4 1.4 0 0 1 -1.4 -1.4V23.4a1.4 1.4 0 0 1 1.4 -1.4z', 3),
        part('M15 9h10v3.4H15z', 1),
        part('M17.4 5h5.2v5H17.4z', 1),
        part('M19.4 36h1.6v10H19.4z', 2),
        part('M23 15h4v1.2H23z', 1),
        part('M23 18.4h4v1.2H23z', 1)
      ]
    },

    artFirstAid: {
      box: 48, slots: ['상자', '십자', '손잡이'],
      colors: ['#e53935', '#ffffff', '#b71c1c'],
      layers: [
        part('M20.6 9h6.8a2.6 2.6 0 0 1 2.6 2.6v1.8a2.6 2.6 0 0 1 -2.6 2.6H20.6a2.6 2.6 0 0 1 -2.6 -2.6V11.6a2.6 2.6 0 0 1 2.6 -2.6z', 2),
        part('M7 16h34a3 3 0 0 1 3 3v21a3 3 0 0 1 -3 3H7a3 3 0 0 1 -3 -3V19a3 3 0 0 1 3 -3z', 0),
        part('M20.4 21h7.2v17H20.4z', 1),
        part('M15.5 25.9h17v7.2H15.5z', 1)
      ]
    },

    artHeartPulse: {
      box: 48, slots: ['심장', '맥박'],
      colors: ['#e53935', '#ffffff'],
      layers: [
        part('M24 41C13 33 5 26 5 17.5 5 11 10 6 15.5 6 19 6 21.8 8 24 11 26.2 8 29 6 32.5 6 38 6 43 11 43 17.5 43 26 35 33 24 41z', 0),
        part('M9 23L15 23L18 17.5L22 29L25 23L39 23L39 25.6L25 25.6L22 32L18 21L15 25.6L9 25.6z', 1)
      ]
    },

    artThermometer: {
      box: 48, slots: ['막대', '수은', '눈금'],
      colors: ['#eceff1', '#e53935', '#b0bec5'],
      layers: [
        part('M24 5h0a5 5 0 0 1 5 5v22a5 5 0 0 1 -5 5H24a5 5 0 0 1 -5 -5V10a5 5 0 0 1 5 -5z', 0),
        part('M24 19h0a2.5 2.5 0 0 1 2.5 2.5v12a2.5 2.5 0 0 1 -2.5 2.5H24a2.5 2.5 0 0 1 -2.5 -2.5V21.5a2.5 2.5 0 0 1 2.5 -2.5z', 1),
        part('M17.6 38a6.4 6.4 0 1 0 12.8 0a6.4 6.4 0 1 0 -12.8 0z', 1),
        part('M29.6 12h5v1.4H29.6z', 2),
        part('M29.6 17h5v1.4H29.6z', 2),
        part('M29.6 22h5v1.4H29.6z', 2)
      ]
    },

    artExtinguisher: {
      box: 48, slots: ['몸통', '밴드', '손잡이'],
      colors: ['#c62828', '#eceff1', '#37474f'],
      layers: [
        part('M19 14h10a5 5 0 0 1 5 5v20a5 5 0 0 1 -5 5H19a5 5 0 0 1 -5 -5V19a5 5 0 0 1 5 -5z', 0),
        part('M21.6 8h4.8a1.6 1.6 0 0 1 1.6 1.6v3.8a1.6 1.6 0 0 1 -1.6 1.6H21.6a1.6 1.6 0 0 1 -1.6 -1.6V9.6a1.6 1.6 0 0 1 1.6 -1.6z', 2),
        part('M28.4 8.4h9.2a1.4 1.4 0 0 1 1.4 1.4v0a1.4 1.4 0 0 1 -1.4 1.4H28.4a1.4 1.4 0 0 1 -1.4 -1.4V9.8a1.4 1.4 0 0 1 1.4 -1.4z', 2),
        part('M14 26h20v4H14z', 1)
      ]
    },

    artCart: {
      box: 48, slots: ['바구니', '손잡이', '바퀴'],
      colors: ['#90a4ae', '#546e7a', '#37474f'],
      layers: [
        part('M3.5 5.6h9a1.5 1.5 0 0 1 1.5 1.5v0a1.5 1.5 0 0 1 -1.5 1.5H3.5a1.5 1.5 0 0 1 -1.5 -1.5V7.1a1.5 1.5 0 0 1 1.5 -1.5z', 1),
        part('M6.4 7h2.6v9H6.4z', 1),
        part('M8 14L42 14L36 31L14 31z', 0),
        part('M19.4 14h1.6v17H19.4z', 1),
        part('M27.4 14h1.6v17H27.4z', 1),
        part('M16 31h2.4v5H16z', 2),
        part('M31.6 31h2.4v5H31.6z', 2),
        part('M13 39a4 4 0 1 0 8 0a4 4 0 1 0 -8 0z', 2),
        part('M29 39a4 4 0 1 0 8 0a4 4 0 1 0 -8 0z', 2)
      ]
    },

    artSaleTag: {
      box: 48, slots: ['태그', '구멍', '%'],
      colors: ['#e53935', '#ffffff', '#ffffff'],
      layers: [
        part('M13 7L35 7L35 34L24 43L13 34z', 0),
        part('M21.2 13.4a2.8 2.8 0 1 0 5.6 0a2.8 2.8 0 1 0 -5.6 0z', 1),
        part('M17.6 23a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0z', 2),
        part('M25.6 31a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0z', 2),
        part('M18.4 32.8L29.6 20.6L31 21.9L19.8 34.1z', 2)
      ]
    },

    artGiftBox: {
      box: 48, slots: ['상자', '뚜껑', '리본'],
      colors: ['#1e88e5', '#1565c0', '#ffca28'],
      layers: [
        part('M8 20h32v22H8z', 0),
        part('M13.5 10.4a5 3.6 0 1 0 10 0a5 3.6 0 1 0 -10 0z', 2),
        part('M24.5 10.4a5 3.6 0 1 0 10 0a5 3.6 0 1 0 -10 0z', 2),
        part('M7.6 14h32.8a1.6 1.6 0 0 1 1.6 1.6v4.8a1.6 1.6 0 0 1 -1.6 1.6H7.6a1.6 1.6 0 0 1 -1.6 -1.6V15.6a1.6 1.6 0 0 1 1.6 -1.6z', 1),
        part('M21 14h6v28H21z', 2)
      ]
    },

    artCoupon: {
      box: 48, slots: ['쿠폰', '뜯는 선', '글자'],
      colors: ['#26a69a', '#ffffff', '#ffffff'],
      layers: [
        part('M6 12h36a3 3 0 0 1 3 3v18a3 3 0 0 1 -3 3H6a3 3 0 0 1 -3 -3V15a3 3 0 0 1 3 -3z', 0),
        part('M27.4 12a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0z', 1),
        part('M27.4 36a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0z', 1),
        part('M30 16h1.4v3H30z', 1),
        part('M30 22h1.4v3H30z', 1),
        part('M30 28h1.4v3H30z', 1),
        part('M8 19h16v3H8z', 2),
        part('M8 25h11v3H8z', 2),
        part('M38 18.4L39.41 22.06L43.33 22.27L40.28 24.74L41.29 28.53L38 26.4L34.71 28.53L35.72 24.74L32.67 22.27L36.59 22.06z', 2)
      ]
    },

    artBasket: {
      box: 48, slots: ['바구니', '손잡이', '격자'],
      colors: ['#ffb74d', '#8d6e63', '#e65100'],
      layers: [
        part('M10 20A14 14 0 0 1 38 20L35 20A11 11 0 0 0 13 20z', 1),
        part('M8 20L40 20L36 43L12 43z', 0),
        part('M9.4 27h30v2.2H9.4z', 2),
        part('M10.6 34h27v2.2H10.6z', 2)
      ]
    },

    artCashRegister: {
      box: 48, slots: ['몸통', '화면', '글자'],
      colors: ['#455a64', '#80deea', '#263238'],
      layers: [
        part('M6.4 16h35.2a2.4 2.4 0 0 1 2.4 2.4v18.2a2.4 2.4 0 0 1 -2.4 2.4H6.4a2.4 2.4 0 0 1 -2.4 -2.4V18.4a2.4 2.4 0 0 1 2.4 -2.4z', 0),
        part('M9.4 20h18.2a1.4 1.4 0 0 1 1.4 1.4v8.2a1.4 1.4 0 0 1 -1.4 1.4H9.4a1.4 1.4 0 0 1 -1.4 -1.4V21.4a1.4 1.4 0 0 1 1.4 -1.4z', 1),
        part('M10.6 22.6h15v1.6H10.6z', 2),
        part('M10.6 26h9v1.6H10.6z', 2),
        part('M32 20h4.4v4.4H32z', 2),
        part('M38 20h4.4v4.4H38z', 2),
        part('M32 26.6h4.4v4.4H32z', 2),
        part('M38 26.6h4.4v4.4H38z', 2),
        part('M4 33h40v2.4H4z', 2)
      ]
    },

    artPriceBadge: {
      box: 48, slots: ['배지', '안쪽', '별'],
      colors: ['#ffca28', '#f9a825', '#ffffff'],
      layers: [
        part('M24 2L27.92 6.84L33.55 4.18L34.97 10.24L41.2 10.28L39.86 16.36L45.45 19.1L41.6 24L45.45 28.9L39.86 31.64L41.2 37.72L34.97 37.76L33.55 43.82L27.92 41.16L24 46L20.08 41.16L14.45 43.82L13.03 37.76L6.8 37.72L8.14 31.64L2.55 28.9L6.4 24L2.55 19.1L8.14 16.36L6.8 10.28L13.03 10.24L14.45 4.18L20.08 6.84z', 0),
        part('M10 24a14 14 0 1 0 28 0a14 14 0 1 0 -28 0z', 1),
        part('M24 16L26 21.25L31.61 21.53L27.23 25.05L28.7 30.47L24 27.4L19.3 30.47L20.77 25.05L16.39 21.53L22 21.25z', 2)
      ]
    },

    artCard: {
      box: 48, slots: ['카드', '띠', '칩'],
      colors: ['#3949ab', '#ffca28', '#eceff1'],
      layers: [
        part('M6 12h36a3 3 0 0 1 3 3v20a3 3 0 0 1 -3 3H6a3 3 0 0 1 -3 -3V15a3 3 0 0 1 3 -3z', 0),
        part('M3 18h42v6H3z', 1),
        part('M9.4 27h6.2a1.4 1.4 0 0 1 1.4 1.4v3.6a1.4 1.4 0 0 1 -1.4 1.4H9.4a1.4 1.4 0 0 1 -1.4 -1.4V28.4a1.4 1.4 0 0 1 1.4 -1.4z', 2),
        part('M28.5 31a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0z', 2),
        part('M32.9 31a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0z', 2),
        part('M37.3 31a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0z', 2)
      ]
    },

    artReedTrio: {
      box: 48, slots: ['줄기', '이삭', '잎'],
      colors: ['#8d6e63', '#a1887f', '#66bb6a'],
      layers: [
        part('M13.5 14h2v30H13.5z', 0),
        part('M22 12h2v32H22z', 0),
        part('M30.5 16h2v28H30.5z', 0),
        part('M11.1 10a3.4 6 0 1 0 6.8 0a3.4 6 0 1 0 -6.8 0z', 1),
        part('M19.6 8a3.4 6.5 0 1 0 6.8 0a3.4 6.5 0 1 0 -6.8 0z', 1),
        part('M28.1 12a3.4 6 0 1 0 6.8 0a3.4 6 0 1 0 -6.8 0z', 1),
        part('M15.5 34L6 26L5 29L15 36z', 2),
        part('M32.5 32L42 24L43 27L33 34z', 2),
        part('M23.5 26L33 19L34 22L24.5 28z', 2)
      ]
    },

    artBerryBranch: {
      box: 48, slots: ['가지', '잎', '열매', '열매2'],
      colors: ['#795548', '#43a047', '#e53935', '#ff7043'],
      layers: [
        part('M4 42L5.5 39L30 11L32 13.5L6 43.5z', 0),
        part('M24 22L33 17L35 20L26 25z', 1),
        part('M16 30L7 26L5 29L14 33z', 1),
        part('M29 15L37 9L39 12L31 18z', 1),
        part('M9 19a4 4 0 1 0 8 0a4 4 0 1 0 -8 0z', 2),
        part('M18 11a4 4 0 1 0 8 0a4 4 0 1 0 -8 0z', 2),
        part('M36 26a4 4 0 1 0 8 0a4 4 0 1 0 -8 0z', 3),
        part('M34.4 36a3.6 3.6 0 1 0 7.2 0a3.6 3.6 0 1 0 -7.2 0z', 2)
      ]
    },

    artPineBranch: {
      box: 48, slots: ['가지', '잎', '잎 그늘'],
      colors: ['#795548', '#2e7d32', '#1b5e20'],
      layers: [
        part('M4 27L5 23.6L44 20L43 23.4z', 0),
        part('M6 22L13.5 10.5L15 11.2z', 1),
        part('M11.4 22L18.9 10.5L20.4 11.2z', 1),
        part('M16.8 22L24.3 10.5L25.8 11.2z', 1),
        part('M22.2 22L29.7 10.5L31.2 11.2z', 1),
        part('M27.6 22L35.1 10.5L36.6 11.2z', 1),
        part('M33 22L40.5 10.5L42 11.2z', 1),
        part('M38.4 22L45.9 10.5L47.4 11.2z', 1),
        part('M8.7 26L16.2 37.5L17.7 36.8z', 2),
        part('M14.1 26L21.6 37.5L23.1 36.8z', 2),
        part('M19.5 26L27 37.5L28.5 36.8z', 2),
        part('M24.9 26L32.4 37.5L33.9 36.8z', 2),
        part('M30.3 26L37.8 37.5L39.3 36.8z', 2),
        part('M35.7 26L43.2 37.5L44.7 36.8z', 2)
      ]
    },

    artFern: {
      box: 48, slots: ['줄기', '잎', '잎 그늘'],
      colors: ['#558b2f', '#7cb342', '#33691e'],
      layers: [
        part('M22 45L25.5 45L27 10L23.5 10z', 0),
        part('M24 13L21 7L24 4L27 7z', 1),
        part('M23.8 39L10.8 33.5L13.4 41z', 1),
        part('M23.8 33.5L12.2 28L14.52 35.5z', 1),
        part('M23.8 28L13.6 22.5L15.64 30z', 1),
        part('M23.8 22.5L15 17L16.76 24.5z', 1),
        part('M23.8 17L16.4 11.5L17.88 19z', 1),
        part('M23.8 11.5L17.8 6L19 13.5z', 1),
        part('M25.7 39L38.7 33.5L36.1 41z', 2),
        part('M25.7 33.5L37.3 28L34.98 35.5z', 2),
        part('M25.7 28L35.9 22.5L33.86 30z', 2),
        part('M25.7 22.5L34.5 17L32.74 24.5z', 2),
        part('M25.7 17L33.1 11.5L31.62 19z', 2),
        part('M25.7 11.5L31.7 6L30.5 13.5z', 2)
      ]
    },

    artBamboo: {
      box: 48, slots: ['대', '마디', '잎'],
      colors: ['#66bb6a', '#2e7d32', '#43a047'],
      layers: [
        part('M10 6h7v38H10z', 0),
        part('M20.5 13h7v31H20.5z', 0),
        part('M31 9h7v35H31z', 0),
        part('M10 14h7v2H10z', 1),
        part('M10 26h7v2H10z', 1),
        part('M10 38h7v2H10z', 1),
        part('M20.5 20h7v2H20.5z', 1),
        part('M20.5 30h7v2H20.5z', 1),
        part('M20.5 40h7v2H20.5z', 1),
        part('M31 16h7v2H31z', 1),
        part('M31 28h7v2H31z', 1),
        part('M31 40h7v2H31z', 1),
        part('M38 11L46 4L47 6.4L39 13.4z', 2),
        part('M17 9L9 2L8 4.4L16 11.4z', 2)
      ]
    },

    artMushroom: {
      box: 48, slots: ['갓', '갓 그늘', '기둥', '점'],
      colors: ['#e53935', '#b71c1c', '#fff3e0', '#ffffff'],
      layers: [
        part('M21 25h6a3 3 0 0 1 3 3v13a3 3 0 0 1 -3 3H21a3 3 0 0 1 -3 -3V28a3 3 0 0 1 3 -3z', 2),
        part('M4 26a20 18 0 0 1 40 0z', 0),
        part('M4 25a20 4 0 1 0 40 0a20 4 0 1 0 -40 0z', 1),
        part('M11.4 17a3.6 3.6 0 1 0 7.2 0a3.6 3.6 0 1 0 -7.2 0z', 3),
        part('M24.8 14a4.2 4.2 0 1 0 8.4 0a4.2 4.2 0 1 0 -8.4 0z', 3),
        part('M33.4 20a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0z', 3),
        part('M18.6 22a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0z', 3)
      ]
    },

    artAcorn: {
      box: 48, slots: ['갓', '갓 무늬', '열매', '꼭지'],
      colors: ['#8d6e63', '#5d4037', '#d7a86e', '#4e342e'],
      layers: [
        part('M23 9h2.6v5H23z', 3),
        part('M14 22h20v9a10 10 0 0 1 -20 0z', 2),
        part('M12 22a12 9 0 0 1 24 0z', 0),
        part('M16 17h2.6v4.5H16z', 1),
        part('M22.6 15.6h2.6v4.5H22.6z', 1),
        part('M29 17h2.6v4.5H29z', 1)
      ]
    },

    artIvyLine: {
      box: 48, slots: ['줄', '잎', '잎 그늘'],
      colors: ['#795548', '#43a047', '#2e7d32'],
      layers: [
        part('M22.7 3L25.77 5L28.55 7L30.76 9L32.19 11L32.7 13L32.24 15L30.86 17L28.68 19L25.93 21L22.87 23L19.78 25L16.98 27L14.74 29L13.26 31L12.7 33L13.11 35L14.45 37L16.58 39L19.31 41L22.37 43L25.46 45L28.06 45L24.97 43L21.91 41L19.18 39L17.05 37L15.71 35L15.3 33L15.86 31L17.34 29L19.58 27L22.38 25L25.47 23L28.53 21L31.28 19L33.46 17L34.84 15L35.3 13L34.79 11L33.36 9L31.15 7L28.37 5L25.3 3z', 0),
        part('M18.85 7a5.5 3.4 0 1 0 11 0a5.5 3.4 0 1 0 -11 0z', 1),
        part('M33.54 15a5.5 3.4 0 1 0 11 0a5.5 3.4 0 1 0 -11 0z', 2),
        part('M13.17 23a5.5 3.4 0 1 0 11 0a5.5 3.4 0 1 0 -11 0z', 1),
        part('M14.56 31a5.5 3.4 0 1 0 11 0a5.5 3.4 0 1 0 -11 0z', 2),
        part('M6.88 39a5.5 3.4 0 1 0 11 0a5.5 3.4 0 1 0 -11 0z', 1)
      ]
    },

    artLaceEdge: {
      box: 48, slots: ['띠', '레이스', '점'],
      colors: ['#f06292', '#fce4ec', '#ffffff'],
      layers: [
        part('M2 20h44v8H2z', 0),
        part('M1.8 28a3.2 3.2 0 0 0 6.4 0z', 1),
        part('M8.1 28a3.2 3.2 0 0 0 6.4 0z', 1),
        part('M14.4 28a3.2 3.2 0 0 0 6.4 0z', 1),
        part('M20.7 28a3.2 3.2 0 0 0 6.4 0z', 1),
        part('M27 28a3.2 3.2 0 0 0 6.4 0z', 1),
        part('M33.3 28a3.2 3.2 0 0 0 6.4 0z', 1),
        part('M39.6 28a3.2 3.2 0 0 0 6.4 0z', 1),
        part('M3.6 24a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0z', 2),
        part('M9.9 24a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0z', 2),
        part('M16.2 24a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0z', 2),
        part('M22.5 24a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0z', 2),
        part('M28.8 24a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0z', 2),
        part('M35.1 24a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0z', 2),
        part('M41.4 24a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0z', 2)
      ]
    },

    artScallopEdge: {
      box: 48, slots: ['띠', '둥근 테', '선'],
      colors: ['#42a5f5', '#e3f2fd', '#1565c0'],
      layers: [
        part('M2 16h44v1.6H2z', 2),
        part('M2 20h44v7H2z', 0),
        part('M1.6 27a2.8 2.8 0 0 0 5.6 0z', 1),
        part('M7.2 27a2.8 2.8 0 0 0 5.6 0z', 1),
        part('M12.8 27a2.8 2.8 0 0 0 5.6 0z', 1),
        part('M18.4 27a2.8 2.8 0 0 0 5.6 0z', 1),
        part('M24 27a2.8 2.8 0 0 0 5.6 0z', 1),
        part('M29.6 27a2.8 2.8 0 0 0 5.6 0z', 1),
        part('M35.2 27a2.8 2.8 0 0 0 5.6 0z', 1),
        part('M40.8 27a2.8 2.8 0 0 0 5.6 0z', 1)
      ]
    },

    artChevronEdge: {
      box: 48, slots: ['띠', '위 꺾쇠', '아래 꺾쇠'],
      colors: ['#ff7043', '#ffe0b2', '#e64a19'],
      layers: [
        part('M2 22h44v6H2z', 0),
        part('M1 22L4 16L7 22z', 1),
        part('M14.2 22L17.2 16L20.2 22z', 1),
        part('M27.4 22L30.4 16L33.4 22z', 1),
        part('M40.6 22L43.6 16L46.6 22z', 1),
        part('M7.6 28L10.6 34L13.6 28z', 2),
        part('M20.8 28L23.8 34L26.8 28z', 2),
        part('M34 28L37 34L40 28z', 2)
      ]
    },

    artDotEdge: {
      box: 48, slots: ['띠', '큰 점', '작은 점'],
      colors: ['#26a69a', '#b2dfdb', '#ffffff'],
      layers: [
        part('M2 20h44v8H2z', 0),
        part('M4.6 24a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0z', 1),
        part('M12.6 24a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0z', 1),
        part('M20.6 24a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0z', 1),
        part('M28.6 24a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0z', 1),
        part('M36.6 24a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0z', 1),
        part('M9.8 24a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0 -2.4 0z', 2),
        part('M17.8 24a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0 -2.4 0z', 2),
        part('M25.8 24a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0 -2.4 0z', 2),
        part('M33.8 24a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0 -2.4 0z', 2),
        part('M41.8 24a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0 -2.4 0z', 2)
      ]
    },

    artBracketEdge: {
      box: 48, slots: ['괄호', '점'],
      colors: ['#5c6bc0', '#c5cae9'],
      layers: [
        part('M10 8h-6v32h6v-3.4h-2.6V11.4H10z', 0),
        part('M38 8h6v32h-6v-3.4h2.6V11.4H38z', 0),
        part('M22 18a2 2 0 1 0 4 0a2 2 0 1 0 -4 0z', 1),
        part('M22 24a2 2 0 1 0 4 0a2 2 0 1 0 -4 0z', 1),
        part('M22 30a2 2 0 1 0 4 0a2 2 0 1 0 -4 0z', 1)
      ]
    },

    artSwirlLine: {
      box: 48, slots: ['소용돌이', '점'],
      colors: ['#ab47bc', '#ce93d8'],
      layers: [
        part('M24 21.1L24.49 20.92L25.03 20.82L25.62 20.82L26.23 20.93L26.84 21.16L27.42 21.51L27.97 21.98L28.45 22.55L28.84 23.23L29.12 24L29.28 24.84L29.29 25.72L29.16 26.63L28.86 27.53L28.41 28.41L27.79 29.22L27.03 29.95L26.13 30.56L25.11 31.03L24 31.34L22.82 31.47L21.59 31.41L20.36 31.14L19.16 30.66L18.02 29.98L16.98 29.1L16.07 28.04L15.32 26.82L14.77 25.46L14.43 24L14.33 22.47L14.48 20.91L14.88 19.35L15.54 17.85L16.45 16.45L17.59 15.18L18.95 14.09L20.49 13.21L22.19 12.58L24 12.21L25.88 12.14L27.78 12.37L29.65 12.9L31.45 13.74L33.12 14.88L34.62 16.29L35.89 17.94L36.9 19.81L37.62 21.84L38.01 24L38.06 26.23L37.75 28.47L37.08 30.66L36.05 32.76L34.69 34.69L33.02 36.41L31.07 37.87L28.88 39.02L26.5 39.81L24 40.23L21.43 40.25L18.85 39.86L16.33 39.06L13.94 37.85L11.74 36.26L9.79 34.33L8.15 32.08L6.87 29.57L5.99 26.85L5.54 24L5.55 21.08L6.03 18.16L8.69 19.02L8.32 21.52L8.34 24L8.76 26.41L9.53 28.7L10.64 30.8L12.05 32.68L13.72 34.28L15.58 35.59L17.6 36.56L19.71 37.2L21.86 37.49L24 37.43L26.07 37.05L28.01 36.35L29.8 35.38L31.37 34.15L32.71 32.71L33.79 31.11L34.58 29.39L35.09 27.6L35.29 25.79L35.21 24L34.85 22.28L34.24 20.67L33.4 19.21L32.35 17.93L31.14 16.86L29.81 16.01L28.38 15.4L26.92 15.03L25.44 14.9L24 15.01L22.63 15.34L21.36 15.87L20.22 16.58L19.24 17.45L18.43 18.43L17.81 19.5L17.38 20.63L17.14 21.77L17.1 22.91L17.23 24L17.54 25.02L17.99 25.95L18.56 26.77L19.24 27.45L20 28L20.81 28.4L21.63 28.64L22.46 28.74L23.25 28.71L24 28.54L24.68 28.27L25.27 27.9L25.76 27.46L26.15 26.96L26.43 26.43L26.6 25.89L26.66 25.36L26.63 24.85L26.51 24.4L26.32 24L26.07 23.67L25.79 23.42L25.48 23.25L25.16 23.16L24.86 23.14L24.58 23.2L24.35 23.32L24.17 23.48L24.05 23.68L24 23.9z', 0),
        part('M5.8 41a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0z', 1),
        part('M38.8 8a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0z', 1)
      ]
    },

    artZigzag: {
      box: 48, slots: ['띠', '띠2'],
      colors: ['#ffca28', '#f57f17'],
      layers: [
        part('M2 15L3.38 16.74L4.75 18.33L6.13 19.64L7.5 20.54L8.88 20.97L10.25 20.88L11.63 20.29L13 19.24L14.38 17.83L15.75 16.17L17.13 14.41L18.5 12.7L19.88 11.19L21.25 10.01L22.63 9.26L24 9L25.38 9.26L26.75 10.01L28.13 11.19L29.5 12.7L30.88 14.41L32.25 16.17L33.63 17.83L35 19.24L36.38 20.29L37.75 20.88L39.13 20.97L40.5 20.54L41.88 19.64L43.25 18.33L44.63 16.74L46 15L46 19L44.63 20.74L43.25 22.33L41.88 23.64L40.5 24.54L39.13 24.97L37.75 24.88L36.38 24.29L35 23.24L33.63 21.83L32.25 20.17L30.88 18.41L29.5 16.7L28.13 15.19L26.75 14.01L25.38 13.26L24 13L22.63 13.26L21.25 14.01L19.88 15.19L18.5 16.7L17.13 18.41L15.75 20.17L14.38 21.83L13 23.24L11.63 24.29L10.25 24.88L8.88 24.97L7.5 24.54L6.13 23.64L4.75 22.33L3.38 20.74L2 19z', 0),
        part('M2 28L3.38 29.74L4.75 31.33L6.13 32.64L7.5 33.54L8.88 33.97L10.25 33.88L11.63 33.29L13 32.24L14.38 30.83L15.75 29.17L17.13 27.41L18.5 25.7L19.88 24.19L21.25 23.01L22.63 22.26L24 22L25.38 22.26L26.75 23.01L28.13 24.19L29.5 25.7L30.88 27.41L32.25 29.17L33.63 30.83L35 32.24L36.38 33.29L37.75 33.88L39.13 33.97L40.5 33.54L41.88 32.64L43.25 31.33L44.63 29.74L46 28L46 32L44.63 33.74L43.25 35.33L41.88 36.64L40.5 37.54L39.13 37.97L37.75 37.88L36.38 37.29L35 36.24L33.63 34.83L32.25 33.17L30.88 31.41L29.5 29.7L28.13 28.19L26.75 27.01L25.38 26.26L24 26L22.63 26.26L21.25 27.01L19.88 28.19L18.5 29.7L17.13 31.41L15.75 33.17L14.38 34.83L13 36.24L11.63 37.29L10.25 37.88L8.88 37.97L7.5 37.54L6.13 36.64L4.75 35.33L3.38 33.74L2 32z', 1)
      ]
    },

    artRopeEdge: {
      box: 48, slots: ['밧줄', '꼬임', '꼬임2'],
      colors: ['#d7a86e', '#8d6e63', '#f2e0c4'],
      layers: [
        part('M2 21h44v6H2z', 0),
        part('M2 21L4.5 21L5.5 27L2 27z', 1),
        part('M10.8 21L13.3 21L14.3 27L10.8 27z', 2),
        part('M19.6 21L22.1 21L23.1 27L19.6 27z', 1),
        part('M28.4 21L30.9 21L31.9 27L28.4 27z', 2),
        part('M37.2 21L39.7 21L40.7 27L37.2 27z', 1)
      ]
    },

    artStreamer: {
      box: 48, slots: ['1', '2', '3'],
      colors: ['#e53935', '#ffca28', '#29b6f6'],
      layers: [
        part('M2 12.2L3.38 13.22L4.75 14.14L6.13 14.91L7.5 15.43L8.88 15.68L10.25 15.63L11.63 15.29L13 14.67L14.38 13.85L15.75 12.88L17.13 11.86L18.5 10.86L19.88 9.98L21.25 9.29L22.63 8.85L24 8.7L25.38 8.85L26.75 9.29L28.13 9.98L29.5 10.86L30.88 11.86L32.25 12.88L33.63 13.85L35 14.67L36.38 15.29L37.75 15.63L39.13 15.68L40.5 15.43L41.88 14.91L43.25 14.14L44.63 13.22L46 12.2L46 15.8L44.63 16.82L43.25 17.74L41.88 18.51L40.5 19.03L39.13 19.28L37.75 19.23L36.38 18.89L35 18.27L33.63 17.45L32.25 16.48L30.88 15.46L29.5 14.46L28.13 13.58L26.75 12.89L25.38 12.45L24 12.3L22.63 12.45L21.25 12.89L19.88 13.58L18.5 14.46L17.13 15.46L15.75 16.48L14.38 17.45L13 18.27L11.63 18.89L10.25 19.23L8.88 19.28L7.5 19.03L6.13 18.51L4.75 17.74L3.38 16.82L2 15.8z', 0),
        part('M2 25.46L3.38 25.69L4.75 25.62L6.13 25.25L7.5 24.62L8.88 23.78L10.25 22.81L11.63 21.78L13 20.79L14.38 19.92L15.75 19.25L17.13 18.83L18.5 18.7L19.88 18.87L21.25 19.33L22.63 20.04L24 20.93L25.38 21.93L26.75 22.96L28.13 23.92L29.5 24.73L30.88 25.32L32.25 25.65L33.63 25.67L35 25.4L36.38 24.86L37.75 24.08L39.13 23.14L40.5 22.12L41.88 21.11L43.25 20.19L44.63 19.45L46 18.94L46 22.54L44.63 23.05L43.25 23.79L41.88 24.71L40.5 25.72L39.13 26.74L37.75 27.68L36.38 28.46L35 29L33.63 29.27L32.25 29.25L30.88 28.92L29.5 28.33L28.13 27.52L26.75 26.56L25.38 25.53L24 24.53L22.63 23.64L21.25 22.93L19.88 22.47L18.5 22.3L17.13 22.43L15.75 22.85L14.38 23.52L13 24.39L11.63 25.38L10.25 26.41L8.88 27.38L7.5 28.22L6.13 28.85L4.75 29.22L3.38 29.29L2 29.06z', 1),
        part('M2 34.56L3.38 33.71L4.75 32.73L6.13 31.7L7.5 30.72L8.88 29.86L10.25 29.21L11.63 28.81L13 28.7L14.38 28.9L15.75 29.38L17.13 30.1L18.5 31L19.88 32.01L21.25 33.03L22.63 33.98L24 34.78L25.38 35.36L26.75 35.66L28.13 35.66L29.5 35.37L30.88 34.81L32.25 34.02L33.63 33.07L35 32.05L36.38 31.04L37.75 30.13L39.13 29.4L40.5 28.91L41.88 28.71L43.25 28.8L44.63 29.19L46 29.84L46 33.44L44.63 32.79L43.25 32.4L41.88 32.31L40.5 32.51L39.13 33L37.75 33.73L36.38 34.64L35 35.65L33.63 36.67L32.25 37.62L30.88 38.41L29.5 38.97L28.13 39.26L26.75 39.26L25.38 38.96L24 38.38L22.63 37.58L21.25 36.63L19.88 35.61L18.5 34.6L17.13 33.7L15.75 32.98L14.38 32.5L13 32.3L11.63 32.41L10.25 32.81L8.88 33.46L7.5 34.32L6.13 35.3L4.75 36.33L3.38 37.31L2 38.16z', 2)
      ]
    },

    artStarBurst: {
      box: 48, slots: ['큰 별', '작은 별', '빛'],
      colors: ['#ffca28', '#fff176', '#ffb300'],
      layers: [
        part('M43.75 20.87A20 20 0 0 1 43.75 27.13L36.84 26.03A13 13 0 0 0 36.84 21.97z', 2),
        part('M40.18 35.76A20 20 0 0 1 35.76 40.18L31.64 34.52A13 13 0 0 0 34.52 31.64z', 2),
        part('M27.13 43.75A20 20 0 0 1 20.87 43.75L21.97 36.84A13 13 0 0 0 26.03 36.84z', 2),
        part('M12.24 40.18A20 20 0 0 1 7.82 35.76L13.48 31.64A13 13 0 0 0 16.36 34.52z', 2),
        part('M4.25 27.13A20 20 0 0 1 4.25 20.87L11.16 21.97A13 13 0 0 0 11.16 26.03z', 2),
        part('M7.82 12.24A20 20 0 0 1 12.24 7.82L16.36 13.48A13 13 0 0 0 13.48 16.36z', 2),
        part('M20.87 4.25A20 20 0 0 1 27.13 4.25L26.03 11.16A13 13 0 0 0 21.97 11.16z', 2),
        part('M35.76 7.82A20 20 0 0 1 40.18 12.24L34.52 16.36A13 13 0 0 0 31.64 13.48z', 2),
        part('M24 12L26.94 19.95L35.41 20.29L28.76 25.55L31.05 33.71L24 29L16.95 33.71L19.24 25.55L12.59 20.29L21.06 19.95z', 0),
        part('M8 3.8L9.34 6.66L12.2 8L9.34 9.34L8 12.2L6.66 9.34L3.8 8L6.66 6.66z', 1),
        part('M40 35.8L41.34 38.66L44.2 40L41.34 41.34L40 44.2L38.66 41.34L35.8 40L38.66 38.66z', 1)
      ]
    },

    artHeartTrio: {
      box: 48, slots: ['큰', '중간', '작은'],
      colors: ['#e53935', '#f06292', '#f8bbd0'],
      layers: [
        part('M4.5 22.85a5.775 5.775 0 1 0 11.55 0a5.775 5.775 0 1 0 -11.55 0zM13.95 22.85a5.775 5.775 0 1 0 11.55 0a5.775 5.775 0 1 0 -11.55 0zM4.81 24.11L25.19 24.11L15 36.5z', 0),
        part('M29 14.9a3.8500000000000005 3.8500000000000005 0 1 0 7.700000000000001 0a3.8500000000000005 3.8500000000000005 0 1 0 -7.700000000000001 0zM35.3 14.9a3.8500000000000005 3.8500000000000005 0 1 0 7.700000000000001 0a3.8500000000000005 3.8500000000000005 0 1 0 -7.700000000000001 0zM29.21 15.74L42.79 15.74L36 24z', 1),
        part('M30 35.2a3.3000000000000003 3.3000000000000003 0 1 0 6.6000000000000005 0a3.3000000000000003 3.3000000000000003 0 1 0 -6.6000000000000005 0zM35.4 35.2a3.3000000000000003 3.3000000000000003 0 1 0 6.6000000000000005 0a3.3000000000000003 3.3000000000000003 0 1 0 -6.6000000000000005 0zM30.18 35.92L41.82 35.92L36 43z', 2)
      ]
    },

    artFlagLine: {
      box: 48, slots: ['줄', '깃발', '깃발2'],
      colors: ['#795548', '#e53935', '#29b6f6'],
      layers: [
        part('M2 8h44v1.8H2z', 0),
        part('M4.6 9.8L9.6 9.8L7.1 18.8z', 1),
        part('M19 9.8L24 9.8L21.5 18.8z', 1),
        part('M33.4 9.8L38.4 9.8L35.9 18.8z', 1),
        part('M11.8 9.8L16.8 9.8L14.3 18.8z', 2),
        part('M26.2 9.8L31.2 9.8L28.7 18.8z', 2),
        part('M40.6 9.8L45.6 9.8L43.1 18.8z', 2)
      ]
    },

    artLanternString: {
      box: 48, slots: ['줄', '등', '불빛', '꼭지'],
      colors: ['#8d6e63', '#e53935', '#ffca28', '#b71c1c'],
      layers: [
        part('M2 8h44v1.8H2z', 0),
        part('M9 9.8h6v2.4H9z', 3),
        part('M4 22a8 10 0 1 0 16 0a8 10 0 1 0 -16 0z', 1),
        part('M4 16h16v2H4z', 3),
        part('M4 26h16v2H4z', 3),
        part('M8 22a4 6 0 1 0 8 0a4 6 0 1 0 -8 0z', 2),
        part('M11 32h2v6H11z', 3),
        part('M21 9.8h6v2.4H21z', 3),
        part('M16 22a8 10 0 1 0 16 0a8 10 0 1 0 -16 0z', 1),
        part('M16 16h16v2H16z', 3),
        part('M16 26h16v2H16z', 3),
        part('M20 22a4 6 0 1 0 8 0a4 6 0 1 0 -8 0z', 2),
        part('M23 32h2v6H23z', 3),
        part('M33 9.8h6v2.4H33z', 3),
        part('M28 22a8 10 0 1 0 16 0a8 10 0 1 0 -16 0z', 1),
        part('M28 16h16v2H28z', 3),
        part('M28 26h16v2H28z', 3),
        part('M32 22a4 6 0 1 0 8 0a4 6 0 1 0 -8 0z', 2),
        part('M35 32h2v6H35z', 3)
      ]
    },

    artBeadString: {
      box: 48, slots: ['줄', '큰 구슬', '작은 구슬'],
      colors: ['#8d6e63', '#e53935', '#ffca28'],
      layers: [
        part('M2 23h44v1.6H2z', 0),
        part('M3.4 24a4.6 4.6 0 1 0 9.2 0a4.6 4.6 0 1 0 -9.2 0z', 1),
        part('M13.4 24a4.6 4.6 0 1 0 9.2 0a4.6 4.6 0 1 0 -9.2 0z', 1),
        part('M23.4 24a4.6 4.6 0 1 0 9.2 0a4.6 4.6 0 1 0 -9.2 0z', 1),
        part('M33.4 24a4.6 4.6 0 1 0 9.2 0a4.6 4.6 0 1 0 -9.2 0z', 1),
        part('M10.4 24a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0z', 2),
        part('M20.4 24a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0z', 2),
        part('M30.4 24a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0z', 2),
        part('M40.4 24a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0z', 2)
      ]
    },

    artCandleTrio: {
      box: 48, slots: ['초', '초2', '불꽃', '심지'],
      colors: ['#f06292', '#ce93d8', '#ffca28', '#8d6e63'],
      layers: [
        part('M9.6 22h5.8a1.6 1.6 0 0 1 1.6 1.6v20.8a1.6 1.6 0 0 1 -1.6 1.6H9.6a1.6 1.6 0 0 1 -1.6 -1.6V23.6a1.6 1.6 0 0 1 1.6 -1.6z', 0),
        part('M12.1 19h1.6v3H12.1z', 3),
        part('M12.9 17.6c3.24 -4.5 3.6 -7.2 0 -9c-3.6 1.8 -3.24 4.5 -3.24 6.3a3.24 2.7 0 0 0 6.48 0z', 2),
        part('M21.1 16h5.8a1.6 1.6 0 0 1 1.6 1.6v26.8a1.6 1.6 0 0 1 -1.6 1.6H21.1a1.6 1.6 0 0 1 -1.6 -1.6V17.6a1.6 1.6 0 0 1 1.6 -1.6z', 1),
        part('M23.6 13h1.6v3H23.6z', 3),
        part('M24.4 11.6c3.24 -4.5 3.6 -7.2 0 -9c-3.6 1.8 -3.24 4.5 -3.24 6.3a3.24 2.7 0 0 0 6.48 0z', 2),
        part('M32.6 20h5.8a1.6 1.6 0 0 1 1.6 1.6v22.8a1.6 1.6 0 0 1 -1.6 1.6H32.6a1.6 1.6 0 0 1 -1.6 -1.6V21.6a1.6 1.6 0 0 1 1.6 -1.6z', 0),
        part('M35.1 17h1.6v3H35.1z', 3),
        part('M35.9 15.6c3.24 -4.5 3.6 -7.2 0 -9c-3.6 1.8 -3.24 4.5 -3.24 6.3a3.24 2.7 0 0 0 6.48 0z', 2)
      ]
    },

    artRibbonKnot: {
      box: 48, slots: ['고리', '매듭', '끈'],
      colors: ['#e53935', '#b71c1c', '#ffca28'],
      layers: [
        part('M23 24C14 16 8 11.5 4.8 14.8 1.6 18.1 2.6 25.2 7.8 29 12.2 32.2 19.4 30 23 24z', 0),
        part('M25 24C34 16 40 11.5 43.2 14.8 46.4 18.1 45.4 25.2 40.2 29 35.8 32.2 28.6 30 25 24z', 0),
        part('M20.5 28L14 41L19 43L23 30z', 2),
        part('M27.5 28L34 41L29 43L25 30z', 2),
        part('M18.6 24a5.4 6 0 1 0 10.8 0a5.4 6 0 1 0 -10.8 0z', 1),
        part('M21.8 24a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0z', 2)
      ]
    },

    artPencilHolder: {
      box: 48, slots: ['통', '연필', '연필2', '자'],
      colors: ['#42a5f5', '#ffca28', '#e53935', '#90a4ae'],
      layers: [
        part('M20 6L23 6L23 24L20 24z', 1),
        part('M20 3L23 6L20 6z', 2),
        part('M26 9L29 9L29 24L26 24z', 2),
        part('M31 12h2.6v12H31z', 3),
        part('M17 22h14a3 3 0 0 1 3 3v14a3 3 0 0 1 -3 3H17a3 3 0 0 1 -3 -3V25a3 3 0 0 1 3 -3z', 0),
        part('M14 27h20v2.4H14z', 3)
      ]
    },

    artStickerSheet: {
      box: 48, slots: ['판', '별', '하트', '동그라미'],
      colors: ['#ffffff', '#ffca28', '#e53935', '#42a5f5'],
      layers: [
        part('M9 4h30a3 3 0 0 1 3 3v34a3 3 0 0 1 -3 3H9a3 3 0 0 1 -3 -3V7a3 3 0 0 1 3 -3z', 0),
        part('M9 4h30a3 3 0 0 1 3 3v2a3 3 0 0 1 -3 3H9a3 3 0 0 1 -3 -3V7a3 3 0 0 1 3 -3z', 3),
        part('M15 13.6L16.65 17.73L21.09 18.02L17.66 20.87L18.76 25.18L15 22.8L11.24 25.18L12.34 20.87L8.91 18.02L13.35 17.73z', 1),
        part('M27 18.2a3.3000000000000003 3.3000000000000003 0 1 0 6.6000000000000005 0a3.3000000000000003 3.3000000000000003 0 1 0 -6.6000000000000005 0zM32.4 18.2a3.3000000000000003 3.3000000000000003 0 1 0 6.6000000000000005 0a3.3000000000000003 3.3000000000000003 0 1 0 -6.6000000000000005 0zM27.18 18.92L38.82 18.92L33 26z', 2),
        part('M9 35a6 6 0 1 0 12 0a6 6 0 1 0 -12 0z', 3),
        part('M33 28.6L34.65 32.73L39.09 33.02L35.66 35.87L36.76 40.18L33 37.8L29.24 40.18L30.34 35.87L26.91 33.02L31.35 32.73z', 1),
        part('M21 27a3 3 0 1 0 6 0a3 3 0 1 0 -6 0z', 2)
      ]
    },

    artMagnetClip: {
      box: 48, slots: ['클립', '자석', '고리'],
      colors: ['#90a4ae', '#e53935', '#546e7a'],
      layers: [
        part('M22 12h4a8 8 0 0 1 8 8v10a8 8 0 0 1 -8 8H22a8 8 0 0 1 -8 -8V20a8 8 0 0 1 8 -8z', 0),
        part('M23 16h2a5 5 0 0 1 5 5v8a5 5 0 0 1 -5 5H23a5 5 0 0 1 -5 -5V21a5 5 0 0 1 5 -5z', 1),
        part('M22 4h4a3 3 0 0 1 3 3v4a3 3 0 0 1 -3 3H22a3 3 0 0 1 -3 -3V7a3 3 0 0 1 3 -3z', 2),
        part('M22 9a2 2 0 1 0 4 0a2 2 0 1 0 -4 0z', 1)
      ]
    },

    artBookmark: {
      box: 48, slots: ['갈피', '술', '무늬'],
      colors: ['#8e24aa', '#ffca28', '#ce93d8'],
      layers: [
        part('M13 4L35 4L35 44L24 36L13 44z', 0),
        part('M24 11L25.76 15.57L30.66 15.84L26.85 18.93L28.11 23.66L24 21L19.89 23.66L21.15 18.93L17.34 15.84L22.24 15.57z', 2),
        part('M22.8 40h2.4v5H22.8z', 1),
        part('M21.6 45.6a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0z', 1)
      ]
    },

    artStampSet: {
      box: 48, slots: ['손잡이', '바닥', '잉크', '무늬'],
      colors: ['#8d6e63', '#d7a86e', '#e53935', '#5d4037'],
      layers: [
        part('M28 10h8a4 4 0 0 1 4 4v12a4 4 0 0 1 -4 4H28a4 4 0 0 1 -4 -4V14a4 4 0 0 1 4 -4z', 0),
        part('M27 28h10a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2H27a2 2 0 0 1 -2 -2V30a2 2 0 0 1 2 -2z', 3),
        part('M6 30h14a2 2 0 0 1 2 2v7a2 2 0 0 1 -2 2H6a2 2 0 0 1 -2 -2V32a2 2 0 0 1 2 -2z', 2),
        part('M4 30h18v4H4z', 3),
        part('M13 32.6L14.18 35.38L17.18 35.64L14.9 37.62L15.59 40.56L13 39L10.41 40.56L11.1 37.62L8.82 35.64L11.82 35.38z', 1)
      ]
    },

    artInkBottle: {
      box: 48, slots: ['병', '잉크', '뚜껑', '라벨'],
      colors: ['#e1f5fe', '#1a237e', '#37474f', '#90a4ae'],
      layers: [
        part('M21 6h6a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2H21a2 2 0 0 1 -2 -2V8a2 2 0 0 1 2 -2z', 2),
        part('M18 13h12a5 5 0 0 1 5 5v20a5 5 0 0 1 -5 5H18a5 5 0 0 1 -5 -5V18a5 5 0 0 1 5 -5z', 0),
        part('M19 24h10a3 3 0 0 1 3 3v10a3 3 0 0 1 -3 3H19a3 3 0 0 1 -3 -3V27a3 3 0 0 1 3 -3z', 1),
        part('M16 18h16v5H16z', 3)
      ]
    },

    artFountainPen: {
      box: 48, slots: ['몸통', '뚜껑', '촉', '클립'],
      colors: ['#1a237e', '#283593', '#cfd8dc', '#90a4ae'],
      layers: [
        part('M21 36L27 36L24 45z', 2),
        part('M22 14h4a2 2 0 0 1 2 2v19a2 2 0 0 1 -2 2H22a2 2 0 0 1 -2 -2V16a2 2 0 0 1 2 -2z', 0),
        part('M22 5h4a3 3 0 0 1 3 3v4a3 3 0 0 1 -3 3H22a3 3 0 0 1 -3 -3V8a3 3 0 0 1 3 -3z', 1),
        part('M19 14h10v2.4H19z', 1),
        part('M29 6L38 6L38 9.4L29 9.4z', 3)
      ]
    },

    artNotebook: {
      box: 48, slots: ['표지', '종이', '스프링', '줄'],
      colors: ['#43a047', '#ffffff', '#90a4ae', '#b0bec5'],
      layers: [
        part('M17 6h20a3 3 0 0 1 3 3v32a3 3 0 0 1 -3 3H17a3 3 0 0 1 -3 -3V9a3 3 0 0 1 3 -3z', 0),
        part('M13 6h20a3 3 0 0 1 3 3v32a3 3 0 0 1 -3 3H13a3 3 0 0 1 -3 -3V9a3 3 0 0 1 3 -3z', 1),
        part('M10 6h4v38H10z', 0),
        part('M7.6 9a3.4 1.8 0 1 0 6.8 0a3.4 1.8 0 1 0 -6.8 0z', 2),
        part('M7.6 14.4a3.4 1.8 0 1 0 6.8 0a3.4 1.8 0 1 0 -6.8 0z', 2),
        part('M7.6 19.8a3.4 1.8 0 1 0 6.8 0a3.4 1.8 0 1 0 -6.8 0z', 2),
        part('M7.6 25.2a3.4 1.8 0 1 0 6.8 0a3.4 1.8 0 1 0 -6.8 0z', 2),
        part('M7.6 30.6a3.4 1.8 0 1 0 6.8 0a3.4 1.8 0 1 0 -6.8 0z', 2),
        part('M7.6 36a3.4 1.8 0 1 0 6.8 0a3.4 1.8 0 1 0 -6.8 0z', 2),
        part('M7.6 41.4a3.4 1.8 0 1 0 6.8 0a3.4 1.8 0 1 0 -6.8 0z', 2),
        part('M17 14h16v1.6H17z', 3),
        part('M17 20h16v1.6H17z', 3),
        part('M17 26h16v1.6H17z', 3),
        part('M17 32h16v1.6H17z', 3)
      ]
    },

    artPencilCase: {
      box: 48, slots: ['통', '지퍼', '연필', '장식'],
      colors: ['#ec407a', '#37474f', '#ffca28', '#ffffff'],
      layers: [
        part('M14 8L17 8L17 22L14 22z', 2),
        part('M14 5L17 8L14 8z', 3),
        part('M12 20h24a6 6 0 0 1 6 6v8a6 6 0 0 1 -6 6H12a6 6 0 0 1 -6 -6V26a6 6 0 0 1 6 -6z', 0),
        part('M6 24h36v3H6z', 1),
        part('M32.6 25.5a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0z', 1),
        part('M20 27.6L21.41 31.06L25.14 31.33L22.28 33.74L23.17 37.37L20 35.4L16.83 37.37L17.72 33.74L14.86 31.33L18.59 31.06z', 3)
      ]
    },

    artEraser: {
      box: 48, slots: ['몸', '띠', '글'],
      colors: ['#f8bbd0', '#eceff1', '#90a4ae'],
      layers: [
        part('M9 20h30a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3H9a3 3 0 0 1 -3 -3V23a3 3 0 0 1 3 -3z', 0),
        part('M9 20h30a3 3 0 0 1 3 3v0a3 3 0 0 1 -3 3H9a3 3 0 0 1 -3 -3V23a3 3 0 0 1 3 -3z', 1),
        part('M12 29h18v2H12z', 2)
      ]
    },

    artDonut: {
      box: 48, slots: ['반죽', '초코', '스프링클', '구멍'],
      colors: ['#d7a86e', '#795548', '#e53935', '#f5f5f5'],
      layers: [
        part('M6 25a18 18 0 1 0 36 0 18 18 0 1 0 -36 0zM18 25a6 6 0 1 1 12 0 6 6 0 1 1 -12 0z', 0),
        part('M6 23a18 18 0 1 0 36 0 18 18 0 1 0 -36 0zM18 23a6 6 0 1 1 12 0 6 6 0 1 1 -12 0z', 1),
        part('M18 25a6 6 0 1 0 12 0a6 6 0 1 0 -12 0z', 3),
        part('M15 14h2v5H15z', 2),
        part('M28 12h2v5H28z', 2),
        part('M10 22h2v5H10z', 2),
        part('M34 20h2v5H34z', 2),
        part('M19 36h2v4.4H19z', 2),
        part('M30 34h2v4.4H30z', 2)
      ]
    },

    artMacaron: {
      box: 48, slots: ['윗', '아랫', '크림', '점'],
      colors: ['#f48fb1', '#f06292', '#fff3e0', '#f8bbd0'],
      layers: [
        part('M15 12h18a6 6 0 0 1 6 6v0a6 6 0 0 1 -6 6H15a6 6 0 0 1 -6 -6V18a6 6 0 0 1 6 -6z', 0),
        part('M15 24h18a6 6 0 0 1 6 6v0a6 6 0 0 1 -6 6H15a6 6 0 0 1 -6 -6V30a6 6 0 0 1 6 -6z', 1),
        part('M14 22h20a2 2 0 0 1 2 2v1a2 2 0 0 1 -2 2H14a2 2 0 0 1 -2 -2V24a2 2 0 0 1 2 -2z', 2),
        part('M15.2 17a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0z', 3),
        part('M22.2 15a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0z', 3),
        part('M29.2 17a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0z', 3)
      ]
    },

    artIceCreamCone: {
      box: 48, slots: ['콘', '1단', '2단', '체리'],
      colors: ['#d7a86e', '#f8bbd0', '#fff59d', '#e53935'],
      layers: [
        part('M19.6 8a4.4 4.4 0 1 0 8.8 0a4.4 4.4 0 1 0 -8.8 0z', 3),
        part('M9 16a8 8 0 1 0 16 0a8 8 0 1 0 -16 0z', 1),
        part('M23 16a8 8 0 1 0 16 0a8 8 0 1 0 -16 0z', 1),
        part('M15.6 14a8.4 8.4 0 1 0 16.8 0a8.4 8.4 0 1 0 -16.8 0z', 2),
        part('M11 18L37 18L24 44z', 0)
      ]
    },

    artCakeSlice: {
      box: 48, slots: ['시트', '크림', '딸기', '접시'],
      colors: ['#ffe0b2', '#fff3e0', '#e53935', '#cfd8dc'],
      layers: [
        part('M4 41a20 4 0 1 0 40 0a20 4 0 1 0 -40 0z', 3),
        part('M11 13h26a2 2 0 0 1 2 2v23a2 2 0 0 1 -2 2H11a2 2 0 0 1 -2 -2V15a2 2 0 0 1 2 -2z', 1),
        part('M9 21h30v6H9z', 0),
        part('M9 32h30v5H9z', 0),
        part('M11 11h26a2 2 0 0 1 2 2v1a2 2 0 0 1 -2 2H11a2 2 0 0 1 -2 -2V13a2 2 0 0 1 2 -2z', 1),
        part('M20 7a4 4 0 1 0 8 0a4 4 0 1 0 -8 0z', 2),
        part('M20 8L28 8L24 14z', 2)
      ]
    },

    artMuffin: {
      box: 48, slots: ['컵', '윗', '점', '체리'],
      colors: ['#8d6e63', '#d7a86e', '#5d4037', '#e53935'],
      layers: [
        part('M12 24L36 24L32 42L16 42z', 0),
        part('M9 18a8 8 0 1 0 16 0a8 8 0 1 0 -16 0z', 1),
        part('M23 18a8 8 0 1 0 16 0a8 8 0 1 0 -16 0z', 1),
        part('M15.4 15a8.6 8.6 0 1 0 17.2 0a8.6 8.6 0 1 0 -17.2 0z', 1),
        part('M17.4 15a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0z', 2),
        part('M27.4 17a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0z', 2),
        part('M22.4 24a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0z', 2),
        part('M20.6 7a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0z', 3)
      ]
    },

    artSodaGlass: {
      box: 48, slots: ['유리', '음료', '빨대', '얼음'],
      colors: ['#e1f5fe', '#4fc3f7', '#e53935', '#ffffff'],
      layers: [
        part('M22 3L26 3L28 18L25 18z', 2),
        part('M15 10h18a3 3 0 0 1 3 3v26a3 3 0 0 1 -3 3H15a3 3 0 0 1 -3 -3V13a3 3 0 0 1 3 -3z', 0),
        part('M16 20h16a2 2 0 0 1 2 2v16a2 2 0 0 1 -2 2H16a2 2 0 0 1 -2 -2V22a2 2 0 0 1 2 -2z', 1),
        part('M18.4 24h3.2a1.4 1.4 0 0 1 1.4 1.4v3.2a1.4 1.4 0 0 1 -1.4 1.4H18.4a1.4 1.4 0 0 1 -1.4 -1.4V25.4a1.4 1.4 0 0 1 1.4 -1.4z', 3),
        part('M25.4 30h4.2a1.4 1.4 0 0 1 1.4 1.4v4.2a1.4 1.4 0 0 1 -1.4 1.4H25.4a1.4 1.4 0 0 1 -1.4 -1.4V31.4a1.4 1.4 0 0 1 1.4 -1.4z', 3)
      ]
    },

    artCoffeeBeans: {
      box: 48, slots: ['봉지', '라벨', '콩', '테'],
      colors: ['#8d6e63', '#fff3e0', '#5d4037', '#d7a86e'],
      layers: [
        part('M13 10h22a3 3 0 0 1 3 3v26a3 3 0 0 1 -3 3H13a3 3 0 0 1 -3 -3V13a3 3 0 0 1 3 -3z', 0),
        part('M10 18h28v9H10z', 1),
        part('M13.6 32a4.4 5.6 0 1 0 8.8 0a4.4 5.6 0 1 0 -8.8 0z', 2),
        part('M25.6 34a4.4 5.6 0 1 0 8.8 0a4.4 5.6 0 1 0 -8.8 0z', 2),
        part('M22.4 26a3.6 4.6 0 1 0 7.2 0a3.6 4.6 0 1 0 -7.2 0z', 3),
        part('M10 12h28v3H10z', 3)
      ]
    },

    artCroissant: {
      box: 48, slots: ['빵', '빵 그늘', '속'],
      colors: ['#e0a860', '#c8873f', '#ffe0b2'],
      layers: [
        part('M24 16L38 22L42 32L36 36L24 28z', 0),
        part('M24 16L10 22L6 32L12 36L24 28z', 0),
        part('M15 25a9 9 0 1 0 18 0a9 9 0 1 0 -18 0z', 1),
        part('M18 25a6 4.4 0 1 0 12 0a6 4.4 0 1 0 -12 0z', 2)
      ]
    },

    artPudding: {
      box: 48, slots: ['푸딩', '캐러멜', '크림', '접시'],
      colors: ['#ffca28', '#c8873f', '#fff3e0', '#cfd8dc'],
      layers: [
        part('M4 40a20 4 0 1 0 40 0a20 4 0 1 0 -40 0z', 3),
        part('M11 18L37 18L33 38L15 38z', 0),
        part('M11 18L37 18L36 23L12 23z', 1),
        part('M18 14a6 6 0 1 0 12 0a6 6 0 1 0 -12 0z', 2)
      ]
    },

    artChurros: {
      box: 48, slots: ['츄러스', '설탕', '봉투'],
      colors: ['#d7a86e', '#fff3e0', '#8d6e63'],
      layers: [
        part('M8 8L14 8L40 38L34 38z', 0),
        part('M20 22h6v2H20z', 1),
        part('M26 28h6v2H26z', 1),
        part('M31 34h12a3 3 0 0 1 3 3v6a3 3 0 0 1 -3 3H31a3 3 0 0 1 -3 -3V37a3 3 0 0 1 3 -3z', 2)
      ]
    },

    artRose: {
      box: 48, slots: ['꽃잎', '꽃 속', '줄기', '잎'],
      colors: ['#e53935', '#b71c1c', '#4caf50', '#66bb6a'],
      layers: [
        part('M23 26h2.4v20H23z', 2),
        part('M23.5 34L12 27L10 31L23 39z', 3),
        part('M24.5 38L36 31L38 35L25 43z', 3),
        part('M12 17a12 12 0 1 0 24 0a12 12 0 1 0 -24 0z', 0),
        part('M16 17a8 8 0 1 0 16 0a8 8 0 1 0 -16 0z', 1),
        part('M20 17a4 4 0 1 0 8 0a4 4 0 1 0 -8 0z', 0)
      ]
    },

    artDaisy: {
      box: 48, slots: ['꽃잎', '가운데', '줄기', '잎'],
      colors: ['#ffffff', '#ffca28', '#4caf50', '#81c784'],
      layers: [
        part('M23 24h2.4v22H23z', 2),
        part('M23.5 32L11 25L9 29L23 37z', 3),
        part('M27.6 17a6.4 3.6 0 1 0 12.8 0a6.4 3.6 0 1 0 -12.8 0z', 0),
        part('M24.67 24.07a6.4 3.6 0 1 0 12.8 0a6.4 3.6 0 1 0 -12.8 0z', 0),
        part('M17.6 27a6.4 3.6 0 1 0 12.8 0a6.4 3.6 0 1 0 -12.8 0z', 0),
        part('M10.53 24.07a6.4 3.6 0 1 0 12.8 0a6.4 3.6 0 1 0 -12.8 0z', 0),
        part('M7.6 17a6.4 3.6 0 1 0 12.8 0a6.4 3.6 0 1 0 -12.8 0z', 0),
        part('M10.53 9.93a6.4 3.6 0 1 0 12.8 0a6.4 3.6 0 1 0 -12.8 0z', 0),
        part('M17.6 7a6.4 3.6 0 1 0 12.8 0a6.4 3.6 0 1 0 -12.8 0z', 0),
        part('M24.67 9.93a6.4 3.6 0 1 0 12.8 0a6.4 3.6 0 1 0 -12.8 0z', 0),
        part('M18.6 17a5.4 5.4 0 1 0 10.8 0a5.4 5.4 0 1 0 -10.8 0z', 1)
      ]
    },

    artLavender: {
      box: 48, slots: ['꽃', '꽃2', '줄기', '잎'],
      colors: ['#9575cd', '#b39ddb', '#558b2f', '#7cb342'],
      layers: [
        part('M23 16h2.4v30H23z', 2),
        part('M23.5 34L14 28L11 32L23 39z', 3),
        part('M24.5 38L34 32L37 36L25 43z', 3),
        part('M17 6a7 2.6 0 1 0 14 0a7 2.6 0 1 0 -14 0z', 0),
        part('M17.7 9.4a6.3 2.6 0 1 0 12.6 0a6.3 2.6 0 1 0 -12.6 0z', 1),
        part('M18.4 12.8a5.6 2.6 0 1 0 11.2 0a5.6 2.6 0 1 0 -11.2 0z', 0),
        part('M19.1 16.2a4.9 2.6 0 1 0 9.8 0a4.9 2.6 0 1 0 -9.8 0z', 1),
        part('M19.8 19.6a4.2 2.6 0 1 0 8.4 0a4.2 2.6 0 1 0 -8.4 0z', 0),
        part('M20.5 23a3.5 2.6 0 1 0 7 0a3.5 2.6 0 1 0 -7 0z', 1)
      ]
    },

    artCosmos: {
      box: 48, slots: ['꽃잎', '가운데', '줄기', '잎'],
      colors: ['#f48fb1', '#ffca28', '#66bb6a', '#43a047'],
      layers: [
        part('M23 22h2.4v24H23z', 2),
        part('M23.5 32L12 26L10 30L23 37z', 3),
        part('M26 15a7 3.4 0 1 0 14 0a7 3.4 0 1 0 -14 0z', 0),
        part('M23.36 21.36a7 3.4 0 1 0 14 0a7 3.4 0 1 0 -14 0z', 0),
        part('M17 24a7 3.4 0 1 0 14 0a7 3.4 0 1 0 -14 0z', 0),
        part('M10.64 21.36a7 3.4 0 1 0 14 0a7 3.4 0 1 0 -14 0z', 0),
        part('M8 15a7 3.4 0 1 0 14 0a7 3.4 0 1 0 -14 0z', 0),
        part('M10.64 8.64a7 3.4 0 1 0 14 0a7 3.4 0 1 0 -14 0z', 0),
        part('M17 6a7 3.4 0 1 0 14 0a7 3.4 0 1 0 -14 0z', 0),
        part('M23.36 8.64a7 3.4 0 1 0 14 0a7 3.4 0 1 0 -14 0z', 0),
        part('M19.6 15a4.4 4.4 0 1 0 8.8 0a4.4 4.4 0 1 0 -8.8 0z', 1)
      ]
    },

    artCarnation: {
      box: 48, slots: ['꽃잎', '꽃 속', '줄기', '잎'],
      colors: ['#ec407a', '#f06292', '#4caf50', '#66bb6a'],
      layers: [
        part('M23 22h2.4v24H23z', 2),
        part('M23.5 34L11 28L9 32L23 39z', 3),
        part('M27 15a5 5 0 1 0 10 0a5 5 0 1 0 -10 0z', 0),
        part('M25.47 19.7a5 5 0 1 0 10 0a5 5 0 1 0 -10 0z', 0),
        part('M21.47 22.61a5 5 0 1 0 10 0a5 5 0 1 0 -10 0z', 0),
        part('M16.53 22.61a5 5 0 1 0 10 0a5 5 0 1 0 -10 0z', 0),
        part('M12.53 19.7a5 5 0 1 0 10 0a5 5 0 1 0 -10 0z', 0),
        part('M11 15a5 5 0 1 0 10 0a5 5 0 1 0 -10 0z', 0),
        part('M12.53 10.3a5 5 0 1 0 10 0a5 5 0 1 0 -10 0z', 0),
        part('M16.53 7.39a5 5 0 1 0 10 0a5 5 0 1 0 -10 0z', 0),
        part('M21.47 7.39a5 5 0 1 0 10 0a5 5 0 1 0 -10 0z', 0),
        part('M25.47 10.3a5 5 0 1 0 10 0a5 5 0 1 0 -10 0z', 0),
        part('M17 15a7 7 0 1 0 14 0a7 7 0 1 0 -14 0z', 1)
      ]
    },

    artLily: {
      box: 48, slots: ['꽃잎', '수술', '줄기', '잎'],
      colors: ['#fff9c4', '#ffca28', '#558b2f', '#7cb342'],
      layers: [
        part('M23 22h2.4v24H23z', 2),
        part('M23.5 32L10 24L8 28L23 38z', 3),
        part('M24.5 36L36 28L38 32L25 42z', 3),
        part('M19 12a5 11 0 1 0 10 0a5 11 0 1 0 -10 0z', 0),
        part('M11.6 17a4.4 9 0 1 0 8.8 0a4.4 9 0 1 0 -8.8 0z', 0),
        part('M27.6 17a4.4 9 0 1 0 8.8 0a4.4 9 0 1 0 -8.8 0z', 0),
        part('M23 8h1.6v8H23z', 1),
        part('M21.6 9a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0z', 1)
      ]
    },

    artCamellia: {
      box: 48, slots: ['꽃잎', '가운데', '줄기', '잎'],
      colors: ['#e53935', '#ffca28', '#2e7d32', '#43a047'],
      layers: [
        part('M23 26h2.4v20H23z', 2),
        part('M6 32a8 4.4 0 1 0 16 0a8 4.4 0 1 0 -16 0z', 3),
        part('M26 36a8 4.4 0 1 0 16 0a8 4.4 0 1 0 -16 0z', 3),
        part('M17.6 10.4a6.4 6.4 0 1 0 12.8 0a6.4 6.4 0 1 0 -12.8 0z', 0),
        part('M24.18 14.2a6.4 6.4 0 1 0 12.8 0a6.4 6.4 0 1 0 -12.8 0z', 0),
        part('M24.18 21.8a6.4 6.4 0 1 0 12.8 0a6.4 6.4 0 1 0 -12.8 0z', 0),
        part('M17.6 25.6a6.4 6.4 0 1 0 12.8 0a6.4 6.4 0 1 0 -12.8 0z', 0),
        part('M11.02 21.8a6.4 6.4 0 1 0 12.8 0a6.4 6.4 0 1 0 -12.8 0z', 0),
        part('M11.02 14.2a6.4 6.4 0 1 0 12.8 0a6.4 6.4 0 1 0 -12.8 0z', 0),
        part('M19 18a5 5 0 1 0 10 0a5 5 0 1 0 -10 0z', 1)
      ]
    },

    artViolet: {
      box: 48, slots: ['꽃잎', '가운데', '줄기', '잎'],
      colors: ['#7e57c2', '#fff59d', '#558b2f', '#7cb342'],
      layers: [
        part('M23 24h2.4v22H23z', 2),
        part('M23.5 30L12 24L10 28L23 35z', 3),
        part('M18 9a6 6 0 1 0 12 0a6 6 0 1 0 -12 0z', 0),
        part('M24.66 13.84a6 6 0 1 0 12 0a6 6 0 1 0 -12 0z', 0),
        part('M22.11 21.66a6 6 0 1 0 12 0a6 6 0 1 0 -12 0z', 0),
        part('M13.89 21.66a6 6 0 1 0 12 0a6 6 0 1 0 -12 0z', 0),
        part('M11.34 13.84a6 6 0 1 0 12 0a6 6 0 1 0 -12 0z', 0),
        part('M20.4 16a3.6 3.6 0 1 0 7.2 0a3.6 3.6 0 1 0 -7.2 0z', 1)
      ]
    },

    artFlowerBasket: {
      box: 48, slots: ['바구니', '꽃1', '꽃2', '잎'],
      colors: ['#d7a86e', '#e53935', '#ffca28', '#43a047'],
      layers: [
        part('M9 20a6 5 0 1 0 12 0a6 5 0 1 0 -12 0z', 3),
        part('M27 20a6 5 0 1 0 12 0a6 5 0 1 0 -12 0z', 3),
        part('M17 14a7 7 0 1 0 14 0a7 7 0 1 0 -14 0z', 1),
        part('M9.6 18a5.4 5.4 0 1 0 10.8 0a5.4 5.4 0 1 0 -10.8 0z', 2),
        part('M27.6 18a5.4 5.4 0 1 0 10.8 0a5.4 5.4 0 1 0 -10.8 0z', 1),
        part('M8 24L40 24L34 42L14 42z', 0),
        part('M8 24h32v3.4H8z', 3),
        part('M12 35a12 3 0 1 0 24 0a12 3 0 1 0 -24 0z', 3)
      ]
    },

    artPotPlant: {
      box: 48, slots: ['화분', '꽃', '잎', '줄기'],
      colors: ['#ef6c00', '#f06292', '#43a047', '#66bb6a'],
      layers: [
        part('M11 42a13 3 0 1 0 26 0a13 3 0 1 0 -26 0z', 2),
        part('M14 30L34 30L31 42L17 42z', 0),
        part('M13 28h22v4H13z', 3),
        part('M23 16h2.4v13H23z', 3),
        part('M8 24a7 4 0 1 0 14 0a7 4 0 1 0 -14 0z', 2),
        part('M26 22a7 4 0 1 0 14 0a7 4 0 1 0 -14 0z', 2),
        part('M17.6 13a6.4 6.4 0 1 0 12.8 0a6.4 6.4 0 1 0 -12.8 0z', 1),
        part('M13.6 17a4.4 4.4 0 1 0 8.8 0a4.4 4.4 0 1 0 -8.8 0z', 1),
        part('M25.6 17a4.4 4.4 0 1 0 8.8 0a4.4 4.4 0 1 0 -8.8 0z', 1)
      ]
    },

    artWreath2: {
      box: 48, slots: ['잎', '잎 그늘', '열매', '리본'],
      colors: ['#2e7d32', '#1b5e20', '#e53935', '#e53935'],
      layers: [
        part('M33 24a6 3.6 0 1 0 12 0a6 3.6 0 1 0 -12 0z', 1),
        part('M30.99 31.5a6 3.6 0 1 0 12 0a6 3.6 0 1 0 -12 0z', 0),
        part('M25.5 36.99a6 3.6 0 1 0 12 0a6 3.6 0 1 0 -12 0z', 1),
        part('M18 39a6 3.6 0 1 0 12 0a6 3.6 0 1 0 -12 0z', 0),
        part('M10.5 36.99a6 3.6 0 1 0 12 0a6 3.6 0 1 0 -12 0z', 1),
        part('M5.01 31.5a6 3.6 0 1 0 12 0a6 3.6 0 1 0 -12 0z', 0),
        part('M3 24a6 3.6 0 1 0 12 0a6 3.6 0 1 0 -12 0z', 1),
        part('M5.01 16.5a6 3.6 0 1 0 12 0a6 3.6 0 1 0 -12 0z', 0),
        part('M10.5 11.01a6 3.6 0 1 0 12 0a6 3.6 0 1 0 -12 0z', 1),
        part('M18 9a6 3.6 0 1 0 12 0a6 3.6 0 1 0 -12 0z', 0),
        part('M25.5 11.01a6 3.6 0 1 0 12 0a6 3.6 0 1 0 -12 0z', 1),
        part('M30.99 16.5a6 3.6 0 1 0 12 0a6 3.6 0 1 0 -12 0z', 0),
        part('M21.4 9a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0z', 2),
        part('M36.4 24a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0z', 2),
        part('M21.4 39a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0z', 2),
        part('M6.4 24a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0z', 2),
        part('M16.4 39a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0z', 2),
        part('M26.4 39a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0z', 2),
        part('M19 39.5a2.75 2.75 0 1 0 5.5 0a2.75 2.75 0 1 0 -5.5 0zM23.5 39.5a2.75 2.75 0 1 0 5.5 0a2.75 2.75 0 1 0 -5.5 0zM19.15 40.1L28.85 40.1L24 46z', 3)
      ]
    },

    artSantaBoot: {
      box: 48, slots: ['장화', '테', '버클', '선'],
      colors: ['#c62828', '#fafafa', '#ffca28', '#37474f'],
      layers: [
        part('M13 6L30 6L30 30L44 30L44 40L13 40z', 0),
        part('M13 4h17v5H13z', 1),
        part('M13 35h31v5H13z', 1),
        part('M20 12h8v4H20z', 2)
      ]
    },

    artRudolph: {
      box: 48, slots: ['얼굴', '뿔', '코', '눈'],
      colors: ['#c8874f', '#8d6e63', '#e53935', '#3e2723'],
      layers: [
        part('M13.6 5h2.2v13H13.6z', 1),
        part('M9 7h5v2.2H9z', 1),
        part('M32.2 5h2.2v13H32.2z', 1),
        part('M34 7h5v2.2H34z', 1),
        part('M7 22a4 6 0 1 0 8 0a4 6 0 1 0 -8 0z', 0),
        part('M33 22a4 6 0 1 0 8 0a4 6 0 1 0 -8 0z', 0),
        part('M23 12h2a8 8 0 0 1 8 8v10a8 8 0 0 1 -8 8H23a8 8 0 0 1 -8 -8V20a8 8 0 0 1 8 -8z', 0),
        part('M15 33a9 6 0 1 0 18 0a9 6 0 1 0 -18 0z', 0),
        part('M20.6 34a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0z', 2),
        part('M17.2 25a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0z', 3),
        part('M27.2 25a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0z', 3)
      ]
    },

    artSnowman2: {
      box: 48, slots: ['몸', '단추', '모자', '코'],
      colors: ['#ffffff', '#37474f', '#263238', '#ff7043'],
      layers: [
        part('M12 34a12 11 0 1 0 24 0a12 11 0 1 0 -24 0z', 0),
        part('M15 15a9 9 0 1 0 18 0a9 9 0 1 0 -18 0z', 0),
        part('M15.4 4h17.2a1.4 1.4 0 0 1 1.4 1.4v1.2a1.4 1.4 0 0 1 -1.4 1.4H15.4a1.4 1.4 0 0 1 -1.4 -1.4V5.4a1.4 1.4 0 0 1 1.4 -1.4z', 2),
        part('M17 7h14a2 2 0 0 1 2 2v1a2 2 0 0 1 -2 2H17a2 2 0 0 1 -2 -2V9a2 2 0 0 1 2 -2z', 1),
        part('M24 15L33 17L24 19z', 3),
        part('M19.2 12.6a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0z', 1),
        part('M26 12.6a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0z', 1),
        part('M22.4 30a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0z', 1),
        part('M22.4 35a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0z', 1),
        part('M22.4 40a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0z', 1)
      ]
    },

    artGingerbread: {
      box: 48, slots: ['쿠키', '아이싱', '단추'],
      colors: ['#b5651d', '#ffffff', '#e53935'],
      layers: [
        part('M17.6 8a6.4 6.4 0 1 0 12.8 0a6.4 6.4 0 1 0 -12.8 0z', 0),
        part('M17 14h14a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4H17a4 4 0 0 1 -4 -4V18a4 4 0 0 1 4 -4z', 0),
        part('M13 16L6 21L6 29L13 26z', 0),
        part('M35 16L42 21L42 29L35 26z', 0),
        part('M18 29L30 29L30 44L18 44z', 0),
        part('M19.6 6.5a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0z', 1),
        part('M25.6 6.5a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0z', 1),
        part('M22 19a2 2 0 1 0 4 0a2 2 0 1 0 -4 0z', 1),
        part('M22 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0z', 1),
        part('M19.4 33a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0z', 2),
        part('M25.4 38a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0z', 2)
      ]
    },

    artCandyCane: {
      box: 48, slots: ['대', '줄', '테'],
      colors: ['#e53935', '#ffffff', '#90a4ae'],
      layers: [
        part('M14.4 14A11.6 11.6 0 0 1 37.6 14L29.4 14A3.4 3.4 0 0 0 22.6 14z', 2),
        part('M29.4 13.4h8.2v31.2H29.4z', 2),
        part('M15 14A11 11 0 0 1 37 14L30 14A4 4 0 0 0 22 14z', 1),
        part('M30 14h7v30H30z', 1),
        part('M30 18h7v3H30z', 0),
        part('M30 24h7v3H30z', 0),
        part('M30 30h7v3H30z', 0),
        part('M30 36h7v3H30z', 0),
        part('M30 42h7v3H30z', 0),
        part('M15.66 10.24A11 11 0 0 1 16.99 7.69L22.72 11.71A4 4 0 0 0 22.24 12.63z', 0),
        part('M20.5 4.47A11 11 0 0 1 23.15 3.37L24.96 10.14A4 4 0 0 0 24 10.54z', 0),
        part('M27.91 3.17A11 11 0 0 1 30.65 4.03L27.69 10.37A4 4 0 0 0 26.69 10.06z', 0),
        part('M34.43 6.93A11 11 0 0 1 35.97 9.35L29.63 12.31A4 4 0 0 0 29.06 11.43z', 0)
      ]
    },

    artBellOrnament: {
      box: 48, slots: ['종', '테', '고리', '방울'],
      colors: ['#ffca28', '#f57f17', '#90a4ae', '#fff59d'],
      layers: [
        part('M18 12A6 6 0 0 1 30 12L28 12A4 4 0 0 0 20 12z', 2),
        part('M13 36a11 11 0 0 1 22 0z', 0),
        part('M12 35h24v3.4H12z', 1),
        part('M20 42a4 4 0 1 0 8 0a4 4 0 1 0 -8 0z', 3),
        part('M17.4 26a2.6 5 0 1 0 5.2 0a2.6 5 0 1 0 -5.2 0z', 3)
      ]
    },

    artGiftTag: {
      box: 48, slots: ['태그', '구멍', '리본', '글'],
      colors: ['#ffca28', '#ffffff', '#e53935', '#f57f17'],
      layers: [
        part('M10 8L28 8L38 18L28 36L10 36z', 0),
        part('M12.4 14a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0z', 1),
        part('M16 20h14v2H16z', 3),
        part('M16 25h10v2H16z', 3),
        part('M15 14C8 8 2 12 4 18s9 5 11 1z', 2)
      ]
    },

    artCandleDecor: {
      box: 48, slots: ['초', '불꽃', '받침', '잎'],
      colors: ['#fafafa', '#ffca28', '#ffca28', '#2e7d32'],
      layers: [
        part('M9 43a15 4 0 1 0 30 0a15 4 0 1 0 -30 0z', 3),
        part('M20 40h8a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2H20a2 2 0 0 1 -2 -2V42a2 2 0 0 1 2 -2z', 2),
        part('M21 16h6a2 2 0 0 1 2 2v21a2 2 0 0 1 -2 2H21a2 2 0 0 1 -2 -2V18a2 2 0 0 1 2 -2z', 0),
        part('M23.2 12h1.6v4H23.2z', 2),
        part('M24 3c2.6 3 3 5 3 6.4a3 3 0 0 1 -6 0c0-1.4 .4-3.4 3-6.4z', 1),
        part('M27.49 42.83a5 3 0 1 0 10 0a5 3 0 1 0 -10 0z', 3),
        part('M10.51 42.83a5 3 0 1 0 10 0a5 3 0 1 0 -10 0z', 3),
        part('M10.51 37.17a5 3 0 1 0 10 0a5 3 0 1 0 -10 0z', 3),
        part('M27.49 37.17a5 3 0 1 0 10 0a5 3 0 1 0 -10 0z', 3)
      ]
    },

    artSnowflakeDecor: {
      box: 48, slots: ['줄기', '가지', '가운데'],
      colors: ['#81d4fa', '#e1f5fe', '#0288d1'],
      layers: [
        part('M23.3 25.21L40.62 35.21L42.02 32.79L24.7 22.79z', 0),
        part('M22.6 24L22.6 44L25.4 44L25.4 24z', 0),
        part('M23.3 22.79L5.98 32.79L7.38 35.21L24.7 25.21z', 0),
        part('M24.7 22.79L7.38 12.79L5.98 15.21L23.3 25.21z', 0),
        part('M25.4 24L25.4 4L22.6 4L22.6 24z', 0),
        part('M24.7 25.21L42.02 15.21L40.62 12.79L23.3 22.79z', 0),
        part('M31.6 29.28L33 34.5L35.12 33.93L33.72 28.72z', 1),
        part('M32.94 30.06L38.16 28.66L37.59 26.54L32.38 27.94z', 1),
        part('M35.93 31.78L37.33 37L39.45 36.43L38.05 31.22z', 1),
        part('M37.28 32.56L42.49 31.16L41.92 29.04L36.71 30.44z', 1),
        part('M23.22 33.22L19.4 37.04L20.96 38.6L24.78 34.78z', 1),
        part('M23.22 34.78L27.04 38.6L28.6 37.04L24.78 33.22z', 1),
        part('M23.22 38.22L19.4 42.04L20.96 43.6L24.78 39.78z', 1),
        part('M23.22 39.78L27.04 43.6L28.6 42.04L24.78 38.22z', 1),
        part('M15.62 27.94L10.41 26.54L9.84 28.66L15.06 30.06z', 1),
        part('M14.28 28.72L12.88 33.93L15 34.5L16.4 29.28z', 1),
        part('M11.29 30.44L6.08 29.04L5.51 31.16L10.72 32.56z', 1),
        part('M9.95 31.22L8.55 36.43L10.67 37L12.07 31.78z', 1),
        part('M16.4 18.72L15 13.5L12.88 14.07L14.28 19.28z', 1),
        part('M15.06 17.94L9.84 19.34L10.41 21.46L15.62 20.06z', 1),
        part('M12.07 16.22L10.67 11L8.55 11.57L9.95 16.78z', 1),
        part('M10.72 15.44L5.51 16.84L6.08 18.96L11.29 17.56z', 1),
        part('M24.78 14.78L28.6 10.96L27.04 9.4L23.22 13.22z', 1),
        part('M24.78 13.22L20.96 9.4L19.4 10.96L23.22 14.78z', 1),
        part('M24.78 9.78L28.6 5.96L27.04 4.4L23.22 8.22z', 1),
        part('M24.78 8.22L20.96 4.4L19.4 5.96L23.22 9.78z', 1),
        part('M32.38 20.06L37.59 21.46L38.16 19.34L32.94 17.94z', 1),
        part('M33.72 19.28L35.12 14.07L33 13.5L31.6 18.72z', 1),
        part('M36.71 17.56L41.92 18.96L42.49 16.84L37.28 15.44z', 1),
        part('M38.05 16.78L39.45 11.57L37.33 11L35.93 16.22z', 1),
        part('M19.6 24a4.4 4.4 0 1 0 8.8 0a4.4 4.4 0 1 0 -8.8 0z', 2)
      ]
    },

    artSofa: {
      box: 48, slots: ['몸', '쿠션', '다리', '팔'],
      colors: ['#5c6bc0', '#7986cb', '#8d6e63', '#3f51b5'],
      layers: [
        part('M9 18h4a3 3 0 0 1 3 3v10a3 3 0 0 1 -3 3H9a3 3 0 0 1 -3 -3V21a3 3 0 0 1 3 -3z', 3),
        part('M35 18h4a3 3 0 0 1 3 3v10a3 3 0 0 1 -3 3H35a3 3 0 0 1 -3 -3V21a3 3 0 0 1 3 -3z', 3),
        part('M13 20h22a3 3 0 0 1 3 3v6a3 3 0 0 1 -3 3H13a3 3 0 0 1 -3 -3V23a3 3 0 0 1 3 -3z', 1),
        part('M11 26h26a3 3 0 0 1 3 3v4a3 3 0 0 1 -3 3H11a3 3 0 0 1 -3 -3V29a3 3 0 0 1 3 -3z', 0),
        part('M11 36h4v5H11z', 2),
        part('M33 36h4v5H33z', 2)
      ]
    },

    artBed: {
      box: 48, slots: ['이불', '베개', '프레임', '머리'],
      colors: ['#42a5f5', '#ffffff', '#8d6e63', '#5d4037'],
      layers: [
        part('M6 8h2a2 2 0 0 1 2 2v26a2 2 0 0 1 -2 2H6a2 2 0 0 1 -2 -2V10a2 2 0 0 1 2 -2z', 3),
        part('M9 24h32a3 3 0 0 1 3 3v6a3 3 0 0 1 -3 3H9a3 3 0 0 1 -3 -3V27a3 3 0 0 1 3 -3z', 0),
        part('M12 17h8a3 3 0 0 1 3 3v2a3 3 0 0 1 -3 3H12a3 3 0 0 1 -3 -3V20a3 3 0 0 1 3 -3z', 1),
        part('M6 33h36a2 2 0 0 1 2 2v1a2 2 0 0 1 -2 2H6a2 2 0 0 1 -2 -2V35a2 2 0 0 1 2 -2z', 2),
        part('M8 38h4v5H8z', 2),
        part('M36 38h4v5H36z', 2)
      ]
    },

    artLamp: {
      box: 48, slots: ['갓', '기둥', '받침', '빛'],
      colors: ['#ffca28', '#546e7a', '#37474f', '#fff59d'],
      layers: [
        part('M14 22L34 22L39 34L9 34z', 3),
        part('M15 20L33 20L29 6L19 6z', 0),
        part('M22.6 22h2.8v16H22.6z', 1),
        part('M14 41a10 3.2 0 1 0 20 0a10 3.2 0 1 0 -20 0z', 2)
      ]
    },

    artPictureFrame: {
      box: 48, slots: ['테', '그림', '산', '해'],
      colors: ['#8d6e63', '#e1f5fe', '#43a047', '#ffca28'],
      layers: [
        part('M9 8h30a2 2 0 0 1 2 2v28a2 2 0 0 1 -2 2H9a2 2 0 0 1 -2 -2V10a2 2 0 0 1 2 -2z', 0),
        part('M10 11h28v26H10z', 1),
        part('M28 18a4 4 0 1 0 8 0a4 4 0 1 0 -8 0z', 3),
        part('M10 37L20 22L28 37z', 2),
        part('M22 37L30 26L38 37z', 2)
      ]
    },

    artRug: {
      box: 48, slots: ['러그', '테', '무늬'],
      colors: ['#ef5350', '#ffcdd2', '#fff3e0'],
      layers: [
        part('M5 14h38a2 2 0 0 1 2 2v16a2 2 0 0 1 -2 2H5a2 2 0 0 1 -2 -2V16a2 2 0 0 1 2 -2z', 0),
        part('M8 17h32a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2H8a2 2 0 0 1 -2 -2V19a2 2 0 0 1 2 -2z', 1),
        part('M10 23h28v2.4H10z', 2),
        part('M14 19h20v1.6H14z', 2),
        part('M14 28h20v1.6H14z', 2)
      ]
    },

    artCurtains: {
      box: 48, slots: ['커튼', '커튼2', '봉', '끈'],
      colors: ['#7e57c2', '#b39ddb', '#8d6e63', '#ffca28'],
      layers: [
        part('M2 8h44v2.6H2z', 2),
        part('M0.4 9.4a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0z', 2),
        part('M42.4 9.4a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0z', 2),
        part('M8 11h10v33c-3-2-7-6-10-14z', 0),
        part('M40 11H30v33c3-2 7-6 10-14z', 1),
        part('M21 11h6v32H21z', 3)
      ]
    },

    artBookshelf: {
      box: 48, slots: ['장', '책1', '책2', '책3'],
      colors: ['#8d6e63', '#e53935', '#42a5f5', '#ffca28'],
      layers: [
        part('M5 4h3v40H5z', 0),
        part('M40 4h3v40H40z', 0),
        part('M5 18h38v3H5z', 0),
        part('M5 32h38v3H5z', 0),
        part('M5 4h38v3H5z', 0),
        part('M9 9h5.2v9H9z', 1),
        part('M15.4 9h5.2v9H15.4z', 2),
        part('M21.8 9h5.2v9H21.8z', 3),
        part('M28.2 9h5.2v9H28.2z', 1),
        part('M34.6 9h5.2v9H34.6z', 2),
        part('M9 22h5.2v9H9z', 2),
        part('M15.4 22h5.2v9H15.4z', 3),
        part('M21.8 22h5.2v9H21.8z', 1),
        part('M28.2 22h5.2v9H28.2z', 2),
        part('M34.6 22h5.2v9H34.6z', 3),
        part('M9 35h5.2v9H9z', 3),
        part('M15.4 35h5.2v9H15.4z', 1),
        part('M21.8 35h5.2v9H21.8z', 2),
        part('M28.2 35h5.2v9H28.2z', 3),
        part('M34.6 35h5.2v9H34.6z', 1)
      ]
    },

    artFireplace: {
      box: 48, slots: ['벽', '불', '선반', '장작'],
      colors: ['#795548', '#ff7043', '#5d4037', '#8d6e63'],
      layers: [
        part('M8 8h32a2 2 0 0 1 2 2v30a2 2 0 0 1 -2 2H8a2 2 0 0 1 -2 -2V10a2 2 0 0 1 2 -2z', 0),
        part('M14 42v-12a10 10 0 0 1 20 0v12z', 3),
        part('M6 6h36v4H6z', 2),
        part('M19 36a5 5 0 1 0 10 0a5 5 0 1 0 -10 0z', 1),
        part('M15.6 38a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0z', 1),
        part('M25.6 38a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0z', 1)
      ]
    },

    artPlantStand: {
      box: 48, slots: ['대', '화분', '잎', '꽃'],
      colors: ['#8d6e63', '#ef6c00', '#43a047', '#f06292'],
      layers: [
        part('M8 16h32v3H8z', 0),
        part('M22 19h4v22H22z', 0),
        part('M10 41h28v3H10z', 0),
        part('M17 6L31 6L29 16L19 16z', 1),
        part('M20 6a4 4 0 1 0 8 0a4 4 0 1 0 -8 0z', 2),
        part('M12.6 9a4.4 4.4 0 1 0 8.8 0a4.4 4.4 0 1 0 -8.8 0z', 2),
        part('M26.6 9a4.4 4.4 0 1 0 8.8 0a4.4 4.4 0 1 0 -8.8 0z', 2),
        part('M21.4 3a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0z', 3)
      ]
    },

    artFox: {
      box: 48, slots: ['얼굴', '귀', '볼', '눈'],
      colors: ['#f57c00', '#e65100', '#fff3e0', '#3e2723'],
      layers: [
        part('M8 14L14 4L19 14z', 1),
        part('M40 14L34 4L29 14z', 1),
        part('M10 20L24 10L38 20L30 38L18 38z', 0),
        part('M17.6 30a6.4 6.4 0 1 0 12.8 0a6.4 6.4 0 1 0 -12.8 0z', 2),
        part('M21.6 32a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0z', 3),
        part('M15 22a2 2 0 1 0 4 0a2 2 0 1 0 -4 0z', 3),
        part('M29 22a2 2 0 1 0 4 0a2 2 0 1 0 -4 0z', 3)
      ]
    },

    artBear: {
      box: 48, slots: ['얼굴', '귀', '주둥이', '눈'],
      colors: ['#8d6e63', '#6d4c41', '#d7a86e', '#3e2723'],
      layers: [
        part('M5 12a6 6 0 1 0 12 0a6 6 0 1 0 -12 0z', 1),
        part('M31 12a6 6 0 1 0 12 0a6 6 0 1 0 -12 0z', 1),
        part('M7 25a17 17 0 1 0 34 0a17 17 0 1 0 -34 0z', 0),
        part('M15 31a9 7 0 1 0 18 0a9 7 0 1 0 -18 0z', 2),
        part('M21.4 28a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0z', 3),
        part('M16 20a2 2 0 1 0 4 0a2 2 0 1 0 -4 0z', 3),
        part('M28 20a2 2 0 1 0 4 0a2 2 0 1 0 -4 0z', 3)
      ]
    },

    artPanda: {
      box: 48, slots: ['얼굴', '귀', '눈', '코'],
      colors: ['#fafafa', '#212121', '#3e2723', '#546e7a'],
      layers: [
        part('M5 12a6 6 0 1 0 12 0a6 6 0 1 0 -12 0z', 1),
        part('M31 12a6 6 0 1 0 12 0a6 6 0 1 0 -12 0z', 1),
        part('M7 25a17 17 0 1 0 34 0a17 17 0 1 0 -34 0z', 0),
        part('M12 22a5 6 0 1 0 10 0a5 6 0 1 0 -10 0z', 1),
        part('M26 22a5 6 0 1 0 10 0a5 6 0 1 0 -10 0z', 1),
        part('M15.5 22a2 2 0 1 0 4 0a2 2 0 1 0 -4 0z', 0),
        part('M28.5 22a2 2 0 1 0 4 0a2 2 0 1 0 -4 0z', 0),
        part('M21.4 30a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0z', 2),
        part('M20 33a4 2.6 0 1 0 8 0a4 2.6 0 1 0 -8 0z', 3)
      ]
    },

    artLion: {
      box: 48, slots: ['갈기', '얼굴', '주둥이', '눈'],
      colors: ['#f9a825', '#ffcc80', '#fff3e0', '#3e2723'],
      layers: [
        part('M32 25a6 4.4 0 1 0 12 0a6 4.4 0 1 0 -12 0z', 0),
        part('M30.12 32a6 4.4 0 1 0 12 0a6 4.4 0 1 0 -12 0z', 0),
        part('M25 37.12a6 4.4 0 1 0 12 0a6 4.4 0 1 0 -12 0z', 0),
        part('M18 39a6 4.4 0 1 0 12 0a6 4.4 0 1 0 -12 0z', 0),
        part('M11 37.12a6 4.4 0 1 0 12 0a6 4.4 0 1 0 -12 0z', 0),
        part('M5.88 32a6 4.4 0 1 0 12 0a6 4.4 0 1 0 -12 0z', 0),
        part('M4 25a6 4.4 0 1 0 12 0a6 4.4 0 1 0 -12 0z', 0),
        part('M5.88 18a6 4.4 0 1 0 12 0a6 4.4 0 1 0 -12 0z', 0),
        part('M11 12.88a6 4.4 0 1 0 12 0a6 4.4 0 1 0 -12 0z', 0),
        part('M18 11a6 4.4 0 1 0 12 0a6 4.4 0 1 0 -12 0z', 0),
        part('M25 12.88a6 4.4 0 1 0 12 0a6 4.4 0 1 0 -12 0z', 0),
        part('M30.12 18a6 4.4 0 1 0 12 0a6 4.4 0 1 0 -12 0z', 0),
        part('M11 25a13 13 0 1 0 26 0a13 13 0 1 0 -26 0z', 1),
        part('M16 31a8 6 0 1 0 16 0a8 6 0 1 0 -16 0z', 2),
        part('M21.6 28a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0z', 3),
        part('M17 21a2 2 0 1 0 4 0a2 2 0 1 0 -4 0z', 3),
        part('M27 21a2 2 0 1 0 4 0a2 2 0 1 0 -4 0z', 3)
      ]
    },

    artElephant: {
      box: 48, slots: ['얼굴', '귀', '코', '눈'],
      colors: ['#90a4ae', '#b0bec5', '#78909c', '#37474f'],
      layers: [
        part('M2 24a7 10 0 1 0 14 0a7 10 0 1 0 -14 0z', 1),
        part('M32 24a7 10 0 1 0 14 0a7 10 0 1 0 -14 0z', 1),
        part('M8 22a16 16 0 1 0 32 0a16 16 0 1 0 -32 0z', 0),
        part('M23 28h2a3 3 0 0 1 3 3v10a3 3 0 0 1 -3 3H23a3 3 0 0 1 -3 -3V31a3 3 0 0 1 3 -3z', 2),
        part('M15.8 20a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0z', 3),
        part('M27.8 20a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0z', 3)
      ]
    },

    artGiraffe: {
      box: 48, slots: ['얼굴', '무늬', '뿔', '눈'],
      colors: ['#f9a825', '#c8873f', '#8d6e63', '#3e2723'],
      layers: [
        part('M14.6 4h2.4v8H14.6z', 2),
        part('M13.4 4.4a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0z', 2),
        part('M31 4h2.4v8H31z', 2),
        part('M29.8 4.4a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0z', 2),
        part('M4 21a5 3.4 0 1 0 10 0a5 3.4 0 1 0 -10 0z', 0),
        part('M34 21a5 3.4 0 1 0 10 0a5 3.4 0 1 0 -10 0z', 0),
        part('M13 24a11 16 0 1 0 22 0a11 16 0 1 0 -22 0z', 0),
        part('M16.6 33a7.4 6 0 1 0 14.8 0a7.4 6 0 1 0 -14.8 0z', 1),
        part('M16.4 15a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0z', 1),
        part('M26.4 15a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0z', 1),
        part('M20.3 34a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0 -2.4 0z', 3),
        part('M25.3 34a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0 -2.4 0z', 3),
        part('M17.7 22a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0z', 3),
        part('M26.7 22a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0z', 3)
      ]
    },

    artPenguin: {
      box: 48, slots: ['몸', '배', '부리', '눈'],
      colors: ['#263238', '#fafafa', '#ffca28', '#ffffff'],
      layers: [
        part('M9 25a15 19 0 1 0 30 0a15 19 0 1 0 -30 0z', 0),
        part('M14 29a10 14 0 1 0 20 0a10 14 0 1 0 -20 0z', 1),
        part('M24 22L31 26L24 30z', 2),
        part('M13.6 18a4.4 5.4 0 1 0 8.8 0a4.4 5.4 0 1 0 -8.8 0z', 3),
        part('M25.6 18a4.4 5.4 0 1 0 8.8 0a4.4 5.4 0 1 0 -8.8 0z', 3),
        part('M16.2 19a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0z', 0),
        part('M28.2 19a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0z', 0),
        part('M9 34L9 44L14 44z', 2),
        part('M39 34L39 44L34 44z', 2)
      ]
    },

    artOwl: {
      box: 48, slots: ['몸', '배', '눈', '부리'],
      colors: ['#8d6e63', '#d7a86e', '#ffffff', '#f9a825'],
      layers: [
        part('M10 14L12 3L20 12z', 0),
        part('M38 14L36 3L28 12z', 0),
        part('M9 26a15 17 0 1 0 30 0a15 17 0 1 0 -30 0z', 0),
        part('M14 30a10 12 0 1 0 20 0a10 12 0 1 0 -20 0z', 1),
        part('M10.6 20a6.4 6.4 0 1 0 12.8 0a6.4 6.4 0 1 0 -12.8 0z', 2),
        part('M24.6 20a6.4 6.4 0 1 0 12.8 0a6.4 6.4 0 1 0 -12.8 0z', 2),
        part('M14 20a3 3 0 1 0 6 0a3 3 0 1 0 -6 0z', 0),
        part('M28 20a3 3 0 1 0 6 0a3 3 0 1 0 -6 0z', 0),
        part('M24 24L28 28L24 32L20 28z', 3)
      ]
    }
  };

  Object.keys(DECOR_FIGURES).forEach(function (key) { FIGURES[key] = DECOR_FIGURES[key]; });
  Object.keys(PATTERN_FIGURES).forEach(function (key) { FIGURES[key] = PATTERN_FIGURES[key]; });
  Object.keys(ILLUSTRATIONS).forEach(function (key) { FIGURES[key] = ILLUSTRATIONS[key]; });
  Object.keys(DECORATIONS).forEach(function (key) { FIGURES[key] = DECORATIONS[key]; });
  Object.keys(ART_DECORATIONS).forEach(function (key) { FIGURES[key] = ART_DECORATIONS[key]; });

  /* 찾기 좋게 묶는다 — 분류에 빠진 도형은 '기타' 로 모은다 */
  var FIGURE_GROUPS = [
    {
      id: 'basic', name: '기본 도형',
      items: ['square', 'roundSquare', 'circle', 'ellipse', 'semicircle', 'quarter',
        'ring', 'trapezoid', 'parallelogram', 'arrowBlock', 'arrowBlockUp', 'cross',
        'chevronBlock', 'heart', 'drop', 'shield', 'blob', 'wave', 'triangle', 'diamond',
        'pentagon', 'hexagon', 'heptagon', 'octagon', 'nonagon', 'decagon',
        'star5', 'star6', 'star7', 'star8', 'star12', 'burst', 'sealEdge']
    },
    { id: 'decor', name: '장식 (여러 색)', items: Object.keys(DECOR_FIGURES) },
    { id: 'pattern', name: '무늬 (채우기)', items: Object.keys(PATTERN_FIGURES) },

    /* 일러스트는 주제별로 나눈다 — id 가 illust 로 시작하면 그림 탭에서 보인다 */
    { id: 'illust-nature', name: '자연 · 계절', items: [
      'illTree', 'illFlower', 'illSun', 'illRain', 'illMountain',
      'illCloud', 'illRainbow', 'illMoon', 'illLeaf', 'illSnowman'] },
    { id: 'illust-animal', name: '동물', items: [
      'illDog', 'illCat', 'illBird', 'illButterfly', 'illFish'] },
    { id: 'illust-food', name: '음식', items: [
      'illApple', 'illCoffee', 'illCake', 'illBread', 'illIcecream'] },
    { id: 'illust-work', name: '업무 · 사무', items: [
      'illLaptop', 'illDocument', 'illCalendar', 'illChart', 'illBriefcase',
      'illDesktop', 'illFolder', 'illCalculator', 'illSearch', 'illClock'] },
    { id: 'illust-life', name: '생활 · 교통', items: [
      'illHouse', 'illGift', 'illCar', 'illBook', 'illPhone',
      'illUmbrella', 'illBag', 'illKey', 'illBicycle', 'illBus'] },
    { id: 'illust-public', name: '행정 · 공공', items: [
      'illGov', 'illStamp', 'illVote', 'illSpeaker'] },
    { id: 'illust-people', name: '사람 · 캐릭터', items: [
      'illPerson', 'illStudent', 'illFamily', 'illDoctor', 'illWorker',
      'illChef', 'illSenior'] },

    /* 단색 장식 — 아이콘과 같은 성격이라 아이콘 탭에 함께 보인다.
       (고른 색 하나로 배색이 만들어진다) */
    { id: 'icon-deco-back', name: '배경 장식', items: [
      'decoBlob', 'decoBlobSoft', 'decoWaveBand', 'decoDiagonalBand',
      'decoCircleCluster', 'decoTriangleMosaic'] },
    { id: 'icon-deco-line', name: '구분선 · 띠', items: [
      'decoDividerWave', 'decoDividerPeak', 'decoDividerCurve',
      'decoDividerDots', 'decoDividerDiamond', 'decoDividerRibbon'] },
    { id: 'icon-deco-ribbon', name: '리본 · 배지', items: [
      'decoRibbon', 'decoRibbonTail', 'decoBannerFlag', 'decoLabelTag',
      'decoBookmark', 'decoBadge', 'decoPillBadge', 'decoHexBadge'] },
    { id: 'icon-deco-frame', name: '프레임 · 테두리', items: [
      'decoFrameDouble', 'decoFrameCorners', 'decoFrameDots',
      'decoFrameBadge', 'decoCorner'] },
    { id: 'icon-deco-accent', name: '강조 · 화살표', items: [
      'decoQuote', 'decoSparkBurst', 'decoFocusLines', 'decoChevron3',
      'decoSteps', 'decoArrowRibbon', 'decoCycle', 'decoRibbonArrow'] },

    /* 일러스트형 장식 — 색이 정해진 컬러 장식. 장식 탭에 보인다 */
    { id: 'deco-party', name: '행사 · 파티', items: [
      'artGarland', 'artConfetti', 'artBalloons', 'artPartyHat',
      'artBunting', 'artCurtain',
      'artBirthday', 'artPopper', 'artBalloonArch', 'artCupcake', 'artToast', 'artFirework'] },
    { id: 'deco-award', name: '상장 · 기념', items: [
      'artAward', 'artLaurel', 'artMedals', 'artCrown',
      'artGoldFrame', 'artStarTrio',
      'artTrophy', 'artRosette', 'artShieldGold', 'artMedalBig', 'artCertificate', 'artWreath'] },
    { id: 'deco-nature', name: '자연 장식', items: [
      'artLeafLine', 'artFlowerSprig', 'artVineCorner', 'artLeafFrame',
      'artFlowerBadge',
      'artBouquet', 'artSunflower', 'artBlossom', 'artGrassLine', 'artLeafCorner'] },
    { id: 'deco-color', name: '색 장식', items: [
      'artDotLine', 'artColorBlobs', 'artColorTriangles', 'artColorRings',
      'artColorBands'] },
    { id: 'deco-mark', name: '강조 · 표시', items: [
      'artStamp', 'artHighlight', 'artWashi', 'artClip', 'artNote'] },
    { id: 'deco-fancy', name: '반짝 · 꾸밈', items: [
      'artBow', 'artCloudSun', 'artSparkles', 'artDrops', 'artPaperPlane', 'artSticker'] },
    { id: 'deco-season', name: '계절 · 이벤트', items: [
      'artXmasTree', 'artSantaHat', 'artStocking', 'artPumpkin', 'artGradCap', 'artDiploma', 'artLuckyBag'] },
    { id: 'deco-sports', name: '운동회 · 스포츠', items: [
      'artWhistle', 'artStopwatch', 'artPodium', 'artSneaker', 'artSoccer', 'artBasketball', 'artScoreboard', 'artCheerPom'] },
    { id: 'deco-school', name: '학교 · 졸업', items: [
      'artBlackboard', 'artBookStack', 'artPencil', 'artBell', 'artLocker', 'artGlobe'] },
    { id: 'deco-holiday', name: '명절 · 전통', items: [
      'artLantern', 'artFan', 'artKite', 'artDrum', 'artSongpyeon', 'artPlum', 'artTaeguk', 'artKnot'] },
    { id: 'deco-sign', name: '안내 · 표지', items: [
      'artSignpost', 'artArrowSign', 'artWarningSign', 'artInfoSign', 'artExitSign', 'artNumberTag', 'artDirectory', 'artParkingSign'] },
    { id: 'deco-travel', name: '여행 · 나들이', items: [
      'artSuitcase', 'artCamera', 'artMap', 'artCompass', 'artTicket', 'artSunglasses', 'artBeachBall', 'artTent'] },
    { id: 'deco-kitchen', name: '요리 · 주방', items: [
      'artPan', 'artPot', 'artCuttingBoard', 'artLadle', 'artFriedEgg', 'artPepperMill', 'artOvenMitt', 'artRollingPin'] },
    { id: 'deco-medical', name: '의료 · 안전', items: [
      'artStethoscope', 'artBandage', 'artPills', 'artSyringe', 'artFirstAid', 'artHeartPulse', 'artThermometer', 'artExtinguisher'] },
    { id: 'deco-shop', name: '쇼핑 · 세일', items: [
      'artCart', 'artSaleTag', 'artGiftBox', 'artCoupon', 'artBasket', 'artCashRegister', 'artPriceBadge', 'artCard'] },
    { id: 'illust-music', name: '음악 · 공연', items: [
      'illNote', 'illNoteDouble', 'illGuitar', 'illMic', 'illPiano', 'illHeadphone', 'illTrumpet', 'illViolin'] },
    { id: 'illust-office', name: '사무 · 도구', items: [
      'illClipboard', 'illPushpin', 'illStapler', 'illScissors', 'illTape', 'illPen', 'illPaperclip', 'illChartPie'] },
    { id: 'illust-pet', name: '반려동물', items: [
      'illPaw', 'illBone', 'illDoghouse', 'illFishbowl', 'illBowl', 'illHamster', 'illRabbit', 'illLeash'] },
    { id: 'deco-branch', name: '자연 가지', items: [
      'artReedTrio', 'artBerryBranch', 'artPineBranch', 'artFern', 'artBamboo', 'artMushroom', 'artAcorn', 'artIvyLine'] },
    { id: 'deco-edge', name: '꾸밈 테두리', items: [
      'artLaceEdge', 'artScallopEdge', 'artChevronEdge', 'artDotEdge', 'artBracketEdge', 'artSwirlLine', 'artZigzag', 'artRopeEdge'] },
    { id: 'deco-festive', name: '축하 띠', items: [
      'artStreamer', 'artStarBurst', 'artHeartTrio', 'artFlagLine', 'artLanternString', 'artBeadString', 'artCandleTrio', 'artRibbonKnot'] },
    { id: 'illust-transport', name: '교통수단', items: [
      'illTrain', 'illAirplane', 'illShip', 'illTaxi', 'illTruck', 'illMotorcycle', 'illHelicopter', 'illYacht', 'illRocket', 'illSkateboard'] },
    { id: 'illust-sports', name: '스포츠', items: [
      'illBaseball', 'illTennis', 'illBadminton', 'illBowling', 'illGolf', 'illPingPong', 'illIceSkate', 'illHiking', 'illSwim', 'illJumpRope'] },
    { id: 'illust-weather', name: '날씨', items: [
      'illLightning', 'illSnowflake', 'illWind', 'illFog', 'illTyphoon', 'illStormCloud', 'illSunset', 'illMeteor', 'illHail', 'illDew'] },
    { id: 'illust-school', name: '학교', items: [
      'illSharpener', 'illRuler', 'illProtractor', 'illExam', 'illFlask', 'illTestTube', 'illGrade', 'illSchedule', 'illSchoolBag', 'illMicroscope'] },
    { id: 'illust-medical', name: '의료', items: [
      'illBloodPressure', 'illWheelchair', 'illMask', 'illHospital', 'illAmbulance', 'illIV', 'illECG', 'illXray', 'illSanitizer', 'illCrutch'] },
    { id: 'illust-cooking', name: '요리', items: [
      'illBlender', 'illToaster', 'illRiceCooker', 'illKettle', 'illOven', 'illWhisk', 'illMeasuringCup', 'illChefKnife', 'illPlate', 'illCup'] },
    { id: 'illust-shopping', name: '쇼핑', items: [
      'illReceipt', 'illWallet', 'illCoin', 'illCard', 'illBarcode', 'illStockBox', 'illHandcart', 'illBusinessCard', 'illDisplayStand', 'illGiftWrap'] },
    { id: 'illust-travel', name: '여행', items: [
      'illPassport', 'illBinoculars', 'illStrawHat', 'illParasol', 'illLantern', 'illSleepingBag', 'illWaterBottle', 'illMapPin', 'illCarrier', 'illBeachMat'] },
    { id: 'illust-officegear', name: '사무기기', items: [
      'illPrinter', 'illMonitor', 'illKeyboard', 'illMouse', 'illDesk', 'illChair', 'illWhiteboard', 'illFileCabinet', 'illMeetingTable', 'illStand'] },
    { id: 'illust-safety', name: '보안 · 안전', items: [
      'illPadlock', 'illShield', 'illAlarm', 'illCCTV', 'illHelmet', 'illLifeJacket', 'illTrafficLight', 'illExit', 'illHose', 'illSafe'] },
    { id: 'illust-nature2', name: '자연', items: [
      'illCactus', 'illPalmTree', 'illPineTree', 'illMaple', 'illTulip', 'illClover', 'illShell', 'illCoral', 'illStarfish', 'illSeaweed'] },
    { id: 'illust-season', name: '계절 용품', items: [
      'illCherryBlossom', 'illMapleLeaf', 'illLeafPile', 'illFan', 'illHeater', 'illGloves', 'illScarf', 'illHandWarmer', 'illRaincoat', 'illSwimRing'] },
    { id: 'illust-digital', name: '디지털', items: [
      'illTablet', 'illSpeaker2', 'illHeadset', 'illWebcam', 'illUSB', 'illWifi', 'illBattery', 'illCharger', 'illSmartWatch', 'illDrone'] },
    { id: 'deco-stationery', name: '문구', items: [
      'artPencilHolder', 'artStickerSheet', 'artMagnetClip', 'artBookmark', 'artStampSet', 'artInkBottle', 'artFountainPen', 'artNotebook', 'artPencilCase', 'artEraser'] },
    { id: 'deco-dessert', name: '카페 · 디저트', items: [
      'artDonut', 'artMacaron', 'artIceCreamCone', 'artCakeSlice', 'artMuffin', 'artSodaGlass', 'artCoffeeBeans', 'artCroissant', 'artPudding', 'artChurros'] },
    { id: 'deco-flower', name: '꽃', items: [
      'artRose', 'artDaisy', 'artLavender', 'artCosmos', 'artCarnation', 'artLily', 'artCamellia', 'artViolet', 'artFlowerBasket', 'artPotPlant'] },
    { id: 'deco-xmas', name: '크리스마스', items: [
      'artWreath2', 'artSantaBoot', 'artRudolph', 'artSnowman2', 'artGingerbread', 'artCandyCane', 'artBellOrnament', 'artGiftTag', 'artCandleDecor', 'artSnowflakeDecor'] },
    { id: 'deco-interior', name: '집 · 인테리어', items: [
      'artSofa', 'artBed', 'artLamp', 'artPictureFrame', 'artRug', 'artCurtains', 'artBookshelf', 'artFireplace', 'artPlantStand'] },
    { id: 'deco-face', name: '동물 얼굴', items: [
      'artFox', 'artBear', 'artPanda', 'artLion', 'artElephant', 'artGiraffe', 'artPenguin', 'artOwl'] }
  ];

  (function collectRestFigures() {
    var seen = {};
    FIGURE_GROUPS.forEach(function (group) {
      group.items.forEach(function (key) { seen[key] = true; });
    });

    var rest = Object.keys(FIGURES).filter(function (key) { return !seen[key]; });
    if (rest.length) FIGURE_GROUPS.push({ id: 'rest', name: '기타', items: rest });
  })();

  /* 도형 한글 이름 — 마우스를 올렸을 때 영어 키가 뜨면 아무도 못 알아본다 */
  var FIGURE_LABELS = {
    square: '사각형', roundSquare: '둥근 사각형', circle: '원', ellipse: '타원',
    semicircle: '반원', quarter: '부채꼴', ring: '도넛', trapezoid: '사다리꼴',
    parallelogram: '평행사변형', arrowBlock: '화살표', arrowBlockUp: '위 화살표',
    cross: '십자', chevronBlock: '꺾쇠', heart: '하트', drop: '물방울', shield: '방패',
    blob: '블롭', wave: '물결', triangle: '삼각형', diamond: '다이아몬드',
    pentagon: '오각형', hexagon: '육각형', heptagon: '칠각형', octagon: '팔각형',
    nonagon: '구각형', decagon: '십각형', star5: '별 5각', star6: '별 6각',
    star7: '별 7각', star8: '별 8각', star12: '별 12각', burst: '폭발',
    sealEdge: '인장 톱니',

    emblemCircle: '원 엠블럼', emblemShield: '방패 엠블럼', emblemStar: '별 엠블럼',
    emblemHeart: '하트 엠블럼', emblemDrop: '물방울 엠블럼', emblemHex: '육각 엠블럼',
    emblemDiamond: '마름모 엠블럼', emblemRing: '고리 엠블럼', sealMedal: '인장 메달',
    burstStar: '폭발 별', arrowTrio: '삼색 화살표', chevronTrio: '삼색 꺾쇠',
    labelStack: '삼색 라벨', frameTriple: '삼중 테두리',

    patternStripesH: '가로 줄무늬', patternStripesV: '세로 줄무늬',
    patternStripesD: '대각 줄무늬', patternDots: '물방울무늬', patternGrid: '격자무늬',
    patternChecks: '체크무늬', patternWaves: '물결무늬', patternTriangles: '삼각무늬',

    illTree: '나무', illFlower: '꽃', illSun: '해', illRain: '비',
    illMountain: '산', illLaptop: '노트북', illDocument: '문서', illCalendar: '달력',
    illChart: '발표 자료', illBriefcase: '서류 가방', illHouse: '집', illGift: '선물',
    illCar: '자동차', illBook: '책', illPhone: '휴대전화', illPerson: '직장인',
    illStudent: '학생', illFamily: '가족', illDoctor: '의료진', illWorker: '안전모 작업자',

    illCloud: '구름', illRainbow: '무지개', illMoon: '달과 별', illLeaf: '나뭇잎',
    illSnowman: '눈사람', illDog: '강아지', illCat: '고양이', illBird: '새',
    illButterfly: '나비', illFish: '물고기', illApple: '사과', illCoffee: '커피',
    illCake: '케이크', illBread: '빵', illIcecream: '아이스크림', illDesktop: '데스크톱',
    illFolder: '폴더', illCalculator: '계산기', illSearch: '돋보기', illClock: '시계',
    illUmbrella: '우산', illBag: '쇼핑백', illKey: '열쇠', illBicycle: '자전거',
    illBus: '버스', illGov: '관공서', illStamp: '인장', illVote: '투표',
    illSpeaker: '확성기', illChef: '요리사', illSenior: '어르신',

    decoBlob: '블롭', decoBlobSoft: '블롭 (겹침)', decoWaveBand: '물결 띠',
    decoDiagonalBand: '비스듬 띠', decoCircleCluster: '겹친 원',
    decoTriangleMosaic: '삼각 모자이크',
    decoDividerWave: '물결 구분선', decoDividerPeak: '산 구분선', decoDividerCurve: '곡선 구분선',
    decoDividerDots: '점 구분선', decoDividerDiamond: '다이아 구분선',
    decoDividerRibbon: '배지 구분선',
    decoRibbon: '접힌 리본', decoRibbonTail: '꼬리 리본', decoBannerFlag: '깃발 배너',
    decoLabelTag: '라벨 태그', decoBookmark: '책갈피', decoBadge: '메달 배지',
    decoPillBadge: '알약 배지', decoHexBadge: '육각 배지',
    decoFrameDouble: '이중 테두리', decoFrameCorners: '모서리 테두리',
    decoFrameDots: '점선 테두리', decoFrameBadge: '배지 테두리', decoCorner: '코너 장식',
    decoQuote: '인용 따옴표', decoSparkBurst: '폭발 강조', decoFocusLines: '집중선',
    decoChevron3: '쉐브론 3단', decoSteps: '계단 상승', decoArrowRibbon: '화살표 리본',
    decoCycle: '순환 화살표', decoRibbonArrow: '오름 화살표',

    artGarland: '가랜드', artConfetti: '색종이', artBalloons: '풍선',
    artPartyHat: '파티 모자', artBunting: '둥근 깃발 줄', artCurtain: '리본 커튼',
    artAward: '금장 배지', artLaurel: '월계관', artMedals: '메달 3종',
    artCrown: '보석 왕관', artGoldFrame: '금 테두리', artStarTrio: '별 3종',
    artLeafLine: '나뭇잎 구분선', artFlowerSprig: '꽃 가지', artVineCorner: '덩굴 코너',
    artLeafFrame: '잎 테두리', artFlowerBadge: '꽃 배지',
    artDotLine: '색 점 구분선', artColorBlobs: '색 블롭 3개', artColorTriangles: '색 삼각형',
    artColorRings: '색 원 겹침', artColorBands: '색 띠',
    artStamp: '빨간 인장', artHighlight: '형광 밑줄', artWashi: '마스킹테이프',
    artClip: '클립', artNote: '포스트잇',
    artBirthday: '생일 케이크',
    artPopper: '파티 폭죽',
    artBalloonArch: '풍선 아치',
    artCupcake: '컵케이크',
    artToast: '건배',
    artFirework: '불꽃놀이',
    artTrophy: '트로피',
    artRosette: '리본 로제트',
    artShieldGold: '금테 방패',
    artMedalBig: '큰 금메달',
    artCertificate: '상장 테두리',
    artWreath: '화환',
    artBouquet: '꽃다발',
    artSunflower: '해바라기',
    artBlossom: '벚꽃 가지',
    artGrassLine: '잔디 띠',
    artLeafCorner: '잎 코너',
    artBow: '나비 리본',
    artCloudSun: '구름과 해',
    artSparkles: '반짝임 모음',
    artDrops: '물방울',
    artPaperPlane: '종이 비행기',
    artSticker: '별 스티커',
    artXmasTree: '크리스마스트리',
    artSantaHat: '산타 모자',
    artStocking: '크리스마스 양말',
    artPumpkin: '할로윈 호박',
    artGradCap: '학사모',
    artDiploma: '졸업장',
    artLuckyBag: '복주머니',
    artWhistle: '호루라기',
    artStopwatch: '초시계',
    artPodium: '시상대',
    artSneaker: '운동화',
    artSoccer: '축구공',
    artBasketball: '농구공',
    artScoreboard: '점수판',
    artCheerPom: '응원 폼폼',
    artBlackboard: '칠판',
    artBookStack: '책 더미',
    artPencil: '연필',
    artBell: '종',
    artLocker: '사물함',
    artGlobe: '지구본',
    artLantern: '홍등',
    artFan: '부채',
    artKite: '방패연',
    artDrum: '북',
    artSongpyeon: '송편',
    artPlum: '매화 가지',
    artTaeguk: '태극 문양',
    artKnot: '매듭',
    artSignpost: '이정표',
    artArrowSign: '화살표 표지판',
    artWarningSign: '주의 표지',
    artInfoSign: '안내 표지',
    artExitSign: '비상구 표지',
    artNumberTag: '번호표',
    artDirectory: '방향 안내판',
    artParkingSign: '주차 표지',
    artSuitcase: '여행 가방',
    artCamera: '카메라',
    artMap: '접힌 지도',
    artCompass: '나침반',
    artTicket: '티켓',
    artSunglasses: '선글라스',
    artBeachBall: '비치볼',
    artTent: '텐트',
    artPan: '프라이팬',
    artPot: '냄비',
    artCuttingBoard: '도마와 칼',
    artLadle: '국자',
    artFriedEgg: '계란후라이',
    artPepperMill: '후추통',
    artOvenMitt: '오븐장갑',
    artRollingPin: '밀대',
    artStethoscope: '청진기',
    artBandage: '반창고',
    artPills: '알약',
    artSyringe: '주사기',
    artFirstAid: '구급상자',
    artHeartPulse: '심장 맥박',
    artThermometer: '체온계',
    artExtinguisher: '소화기',
    artCart: '쇼핑카트',
    artSaleTag: '세일 태그',
    artGiftBox: '선물상자',
    artCoupon: '쿠폰',
    artBasket: '쇼핑바구니',
    artCashRegister: '금전등록기',
    artPriceBadge: '가격 배지',
    artCard: '상품권',
    illNote: '음표',
    illNoteDouble: '겹음표',
    illGuitar: '기타',
    illMic: '마이크',
    illPiano: '피아노',
    illHeadphone: '헤드폰',
    illTrumpet: '트럼펫',
    illViolin: '바이올린',
    illClipboard: '클립보드',
    illPushpin: '압정',
    illStapler: '스테이플러',
    illScissors: '가위',
    illTape: '테이프',
    illPen: '펜',
    illPaperclip: '클립',
    illChartPie: '원형 차트',
    illPaw: '발바닥',
    illBone: '뼈다귀',
    illDoghouse: '강아지집',
    illFishbowl: '어항',
    illBowl: '밥그릇',
    illHamster: '햄스터',
    illRabbit: '토끼',
    illLeash: '목줄',
    artReedTrio: '갈대',
    artBerryBranch: '열매 가지',
    artPineBranch: '솔잎 가지',
    artFern: '고사리',
    artBamboo: '대나무',
    artMushroom: '버섯',
    artAcorn: '도토리',
    artIvyLine: '담쟁이',
    artLaceEdge: '레이스 띠',
    artScallopEdge: '둥근 테두리',
    artChevronEdge: '꺾쇠 테두리',
    artDotEdge: '점 테두리',
    artBracketEdge: '괄호 장식',
    artSwirlLine: '소용돌이',
    artZigzag: '지그재그 띠',
    artRopeEdge: '밧줄 테두리',
    artStreamer: '색 띠',
    artStarBurst: '별 폭발',
    artHeartTrio: '하트 세 개',
    artFlagLine: '깃발 줄',
    artLanternString: '등 줄',
    artBeadString: '구슬 줄',
    artCandleTrio: '초 세 개',
    artRibbonKnot: '매듭 리본',
    illTrain: '기차',
    illAirplane: '비행기',
    illShip: '배',
    illTaxi: '택시',
    illTruck: '트럭',
    illMotorcycle: '오토바이',
    illHelicopter: '헬리콥터',
    illYacht: '요트',
    illRocket: '로켓',
    illSkateboard: '스케이트보드',
    illBaseball: '야구',
    illTennis: '테니스',
    illBadminton: '배드민턴',
    illBowling: '볼링',
    illGolf: '골프',
    illPingPong: '탁구',
    illIceSkate: '아이스 스케이트',
    illHiking: '등산',
    illSwim: '수영',
    illJumpRope: '줄넘기',
    illLightning: '번개',
    illSnowflake: '눈송이',
    illWind: '바람',
    illFog: '안개',
    illTyphoon: '태풍',
    illStormCloud: '먹구름',
    illSunset: '해질녘',
    illMeteor: '별똥별',
    illHail: '우박',
    illDew: '이슬',
    illSharpener: '연필깎이',
    illRuler: '자',
    illProtractor: '각도기',
    illExam: '시험지',
    illFlask: '플라스크',
    illTestTube: '시험관',
    illGrade: '성적표',
    illSchedule: '시간표',
    illSchoolBag: '책가방',
    illMicroscope: '현미경',
    illBloodPressure: '혈압계',
    illWheelchair: '휠체어',
    illMask: '마스크',
    illHospital: '병원',
    illAmbulance: '구급차',
    illIV: '수액',
    illECG: '심전도',
    illXray: 'X선',
    illSanitizer: '손소독제',
    illCrutch: '목발',
    illBlender: '믹서',
    illToaster: '토스터',
    illRiceCooker: '전기밥솥',
    illKettle: '주전자',
    illOven: '오븐',
    illWhisk: '거품기',
    illMeasuringCup: '계량컵',
    illChefKnife: '식칼',
    illPlate: '접시',
    illCup: '컵',
    illReceipt: '영수증',
    illWallet: '지갑',
    illCoin: '동전',
    illCard: '카드',
    illBarcode: '바코드',
    illStockBox: '재고 상자',
    illHandcart: '손수레',
    illBusinessCard: '명함',
    illDisplayStand: '진열대',
    illGiftWrap: '선물 포장',
    illPassport: '여권',
    illBinoculars: '망원경',
    illStrawHat: '밀짚모자',
    illParasol: '파라솔',
    illLantern: '랜턴',
    illSleepingBag: '침낭',
    illWaterBottle: '물병',
    illMapPin: '지도 핀',
    illCarrier: '캐리어',
    illBeachMat: '비치 매트',
    illPrinter: '프린터',
    illMonitor: '모니터',
    illKeyboard: '키보드',
    illMouse: '마우스',
    illDesk: '책상',
    illChair: '의자',
    illWhiteboard: '화이트보드',
    illFileCabinet: '서류함',
    illMeetingTable: '회의 테이블',
    illStand: '스탠드',
    illPadlock: '자물쇠',
    illShield: '방패',
    illAlarm: '경보기',
    illCCTV: 'CCTV',
    illHelmet: '안전모',
    illLifeJacket: '구명조끼',
    illTrafficLight: '신호등',
    illExit: '비상구',
    illHose: '소방 호스',
    illSafe: '금고',
    illCactus: '선인장',
    illPalmTree: '야자수',
    illPineTree: '소나무',
    illMaple: '단풍나무',
    illTulip: '튤립',
    illClover: '클로버',
    illShell: '조개',
    illCoral: '산호',
    illStarfish: '불가사리',
    illSeaweed: '해초',
    illCherryBlossom: '벚꽃',
    illMapleLeaf: '단풍잎',
    illLeafPile: '낙엽 더미',
    illFan: '선풍기',
    illHeater: '난로',
    illGloves: '장갑',
    illScarf: '목도리',
    illHandWarmer: '손난로',
    illRaincoat: '우비',
    illSwimRing: '튜브',
    illTablet: '태블릿',
    illSpeaker2: '스피커',
    illHeadset: '헤드셋',
    illWebcam: '웹캠',
    illUSB: 'USB',
    illWifi: '와이파이',
    illBattery: '배터리',
    illCharger: '충전기',
    illSmartWatch: '스마트워치',
    illDrone: '드론',
    artPencilHolder: '연필꽂이',
    artStickerSheet: '스티커 판',
    artMagnetClip: '자석 클립',
    artBookmark: '책갈피',
    artStampSet: '도장 세트',
    artInkBottle: '잉크병',
    artFountainPen: '만년필',
    artNotebook: '공책',
    artPencilCase: '필통',
    artEraser: '지우개',
    artDonut: '도넛',
    artMacaron: '마카롱',
    artIceCreamCone: '아이스크림 콘',
    artCakeSlice: '케이크 조각',
    artMuffin: '머핀',
    artSodaGlass: '소다 잔',
    artCoffeeBeans: '커피콩 봉지',
    artCroissant: '크루아상',
    artPudding: '푸딩',
    artChurros: '츄러스',
    artRose: '장미',
    artDaisy: '데이지',
    artLavender: '라벤더',
    artCosmos: '코스모스',
    artCarnation: '카네이션',
    artLily: '백합',
    artCamellia: '동백',
    artViolet: '제비꽃',
    artFlowerBasket: '꽃바구니',
    artPotPlant: '화분',
    artWreath2: '리스',
    artSantaBoot: '산타 장화',
    artRudolph: '루돌프',
    artSnowman2: '눈사람',
    artGingerbread: '진저브레드',
    artCandyCane: '캔디 케인',
    artBellOrnament: '종 장식',
    artGiftTag: '선물 태그',
    artCandleDecor: '촛불 장식',
    artSnowflakeDecor: '눈결정 장식',
    artSofa: '소파',
    artBed: '침대',
    artLamp: '스탠드 조명',
    artPictureFrame: '액자',
    artRug: '러그',
    artCurtains: '커튼',
    artBookshelf: '책장',
    artFireplace: '벽난로',
    artPlantStand: '화분대',
    artFox: '여우',
    artBear: '곰',
    artPanda: '판다',
    artLion: '사자',
    artElephant: '코끼리',
    artGiraffe: '기린',
    artPenguin: '펭귄',
    artOwl: '올빼미'
  };

  /* ============================================================ 아이콘

     24×24 기준 **선/면** 경로. 벡터라 확대·인쇄에서도 깨지지 않는다.
     분류는 실제로 찾는 순서를 따랐다 — 기호 → 화살표 → 도형감 있는 것 →
     업무 → 공공 → 사람 → 생활 → 자연 … */

  var ICONS = {
    /* --- 기호 --- */
    check: 'M9.2 16.4 4.8 12l-1.5 1.5 5.9 5.9 12-12-1.5-1.5z',
    checkCircle: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.2 14.4-4-4 1.6-1.6 2.4 2.4 5.2-5.2 1.6 1.6z',
    checkDouble: 'M2.7 12.6 7 16.9 19.4 4.5l-1.5-1.5L7 13.9 4.2 11.1zm8.5 4.3 1.5 1.5 8.8-8.8-1.5-1.5z',
    close: 'M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3z',
    closeCircle: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm3.5 12.1-1.4 1.4L12 13.4l-2.1 2.1-1.4-1.4L10.6 12 8.5 9.9l1.4-1.4L12 10.6l2.1-2.1 1.4 1.4L13.4 12z',
    plus: 'M11 3h2v8h8v2h-8v8h-2v-8H3v-2h8z',
    minus: 'M3 11h18v2H3z',
    question: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-2h2zm1.8-6.2-.9.9c-.6.6-.9 1.1-.9 2.3h-2c0-1.6.5-2.5 1.3-3.3l1.2-1.2A2 2 0 1 0 9 8H7a4 4 0 1 1 7.8 2.8z',
    exclamation: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-2h2zm0-4h-2V6h2z',
    info: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-6h2zm0-8h-2V7h2z',
    asterisk: 'M11 2h2v6.3l5.5-3.1 1 1.7L14 10l5.5 3.1-1 1.7L13 11.7V18h-2v-6.3l-5.5 3.1-1-1.7L10 10 4.5 6.9l1-1.7L11 8.3z',
    hash: 'M9 2h2l-.8 5H14l.8-5h2l-.8 5H20v2h-4.3l-.5 3H19v2h-4l-.8 5h-2l.8-5H9.2l-.8 5h-2l.8-5H3v-2h4.5l.5-3H4V7h4.3zm.4 7-.5 3h3.8l.5-3z',
    at: 'M12 2a10 10 0 1 0 4.6 18.9l.7-1.9A8 8 0 1 1 20 12v1a1.5 1.5 0 0 1-3 0v-1a5 5 0 1 0-1.5 3.5l.4 2A8 8 0 0 0 20 12a10 10 0 0 0-8-10zm0 5a5 5 0 1 1-3.5 8.5A5 5 0 0 1 12 7z',
    percent: 'M18.5 3.5 5.5 20.5l-1.6-1.2 13-17zM6.5 3a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm0 2a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM17.5 14a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm0 2a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z',
    ban: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM4 12a8 8 0 0 1 12.9-6.3L5.7 16.9A7.9 7.9 0 0 1 4 12zm8 8a7.9 7.9 0 0 1-4.9-1.7L18.3 7.1A8 8 0 0 1 12 20z',
    power: 'M11 2h2v10h-2zM6.3 5.4A9 9 0 1 0 17.7 5.4l-1.4 1.4a7 7 0 1 1-8.6 0z',
    menu: 'M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z',
    more: 'M6 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',

    /* --- 화살표 --- */
    arrowRight: 'M4 10.5h11.1l-4.6-4.6L12 4.4 19.6 12 12 19.6l-1.5-1.5 4.6-4.6H4z',
    arrowLeft: 'M20 10.5H8.9l4.6-4.6L12 4.4 4.4 12 12 19.6l1.5-1.5-4.6-4.6H20z',
    arrowUp: 'M10.5 20V8.9l-4.6 4.6L4.4 12 12 4.4 19.6 12l-1.5 1.5-4.6-4.6V20z',
    arrowDown: 'M13.5 4v11.1l4.6-4.6L19.6 12 12 19.6 4.4 12l1.5-1.5 4.6 4.6V4z',
    arrowUpRight: 'M8 4h12v12h-2V7.4L6.7 18.7l-1.4-1.4L16.6 6H8z',
    arrowUpLeft: 'M16 4H4v12h2V7.4l11.3 11.3 1.4-1.4L7.4 6H16z',
    arrowDownRight: 'M6.7 5.3 18 16.6V8h2v12H8v-2h8.6L5.3 6.7z',
    arrowDownLeft: 'M17.3 5.3 6 16.6V8H4v12h12v-2H7.4L18.7 6.7z',
    arrowFatRight: 'M3 8h9V3l9 9-9 9v-5H3z',
    arrowFatLeft: 'M21 8h-9V3l-9 9 9 9v-5h9z',
    arrowFatUp: 'M8 21v-9H3l9-9 9 9h-5v9z',
    arrowFatDown: 'M8 3v9H3l9 9 9-9h-5V3z',
    arrowDouble: 'M4 12l5-5v3h6V7l5 5-5 5v-3H9v3z',
    arrowDoubleH: 'M2 12l5-5v3h10V7l5 5-5 5v-3H7v3z',
    arrowDoubleV: 'M12 2l5 5h-3v10h3l-5 5-5-5h3V7H7z',
    arrowCurved: 'M14 4l6 5-6 5v-3.5H9.5A3.5 3.5 0 0 0 6 14v6H4v-6a5.5 5.5 0 0 1 5.5-5.5H14z',
    arrowCurvedLeft: 'M10 4 4 9l6 5v-3.5h4.5A3.5 3.5 0 0 1 18 14v6h2v-6a5.5 5.5 0 0 0-5.5-5.5H10z',
    arrowCorner: 'M6 3h2v11h9.1l-3.6-3.6L15 9l6 6-6 6-1.5-1.4 3.6-3.6H8a2 2 0 0 1-2-2z',
    arrowSplit: 'M4 10.5h5.6l6-6L17 6l-5 5h8v2h-8l5 5-1.4 1.5-6-6H4z',
    arrowMerge: 'M4 10.5h7.6l5-5L18 7l-6 6 6 6-1.4 1.5-5-5H4z',
    arrowRefresh: 'M17.65 6.35A8 8 0 1 0 19.7 14h-2.1a6 6 0 1 1-1.4-6.2L13 11h7V4z',
    arrowRefreshLeft: 'M6.35 6.35A8 8 0 1 1 4.3 14h2.1a6 6 0 1 0 1.4-6.2L11 11H4V4z',
    arrowSync: 'M12 3V1L8 5l4 4V6a5 5 0 0 1 4.6 7l1.7 1.2A7 7 0 0 0 12 3zM7.4 11 5.7 9.8A7 7 0 0 0 12 21v2l4-4-4-4v3a5 5 0 0 1-4.6-7z',
    arrowCircleRight: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16zm-1.4 3.6L9.2 9l3 3-3 3 1.4 1.4L14.6 12z',
    chevronRight: 'M8.6 4.6 16 12l-7.4 7.4L7.2 18l6-6-6-6z',
    chevronLeft: 'M15.4 4.6 8 12l7.4 7.4L16.8 18l-6-6 6-6z',
    chevronUp: 'M4.6 15.4 12 8l7.4 7.4L18 16.8l-6-6-6 6z',
    chevronDown: 'M4.6 8.6 12 16l7.4-7.4L18 7.2l-6 6-6-6z',
    caretUp: 'M12 7l6 8H6z',
    caretDown: 'M12 17l-6-8h12z',
    arrowEnter: 'M4 4h2v10h11.1l-4.6-4.6L14 8l6 6-6 6-1.5-1.4 4.6-4.6H4z',
    arrowExpand: 'M4 4h7v2H6v5H4zm9 0h7v7h-2V6h-5zM4 13h2v5h5v2H4zm14 0h2v7h-7v-2h5z',
    arrowCollapse: 'M6 2h2v5H3V5h3zm10 0h2v3h3v2h-5zM3 17h5v5H6v-3H3zm13 0h5v2h-3v3h-2z',

    /* --- 별 · 마음 --- */
    star: 'M12 2l2.95 6.32 6.9.82-5.08 4.72 1.35 6.83L12 17.4l-6.12 3.29 1.35-6.83L2.15 9.14l6.9-.82z',
    starSix: 'M12 2l3 5h6l-3 5 3 5h-6l-3 5-3-5H3l3-5-3-5h6z',
    starBadge: 'M12 1.5l2.6 2 3.3-.2 1.1 3.1 2.6 2-1.1 3.1 1.1 3.1-2.6 2-1.1 3.1-3.3-.2-2.6 2-2.6-2-3.3.2-1.1-3.1-2.6-2 1.1-3.1-1.1-3.1 2.6-2 1.1-3.1 3.3.2z',
    sparkle: 'M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z',
    sparkleStar: 'M9 2l1.3 4.4L14.7 7.7 10.3 9 9 13.4 7.7 9 3.3 7.7 7.7 6.4zM17 12l.9 3 3 .9-3 .9-.9 3-.9-3-3-.9 3-.9z',
    sparkles: 'M10 3l1.1 3.6L14.7 7.7 11.1 8.8 10 12.4 8.9 8.8 5.3 7.7 8.9 6.6zM17 11l.8 2.7 2.7.8-2.7.8-.8 2.7-.8-2.7-2.7-.8 2.7-.8zM6.5 14l.6 2.1 2.1.6-2.1.6-.6 2.1-.6-2.1-2.1-.6 2.1-.6z',
    heart: 'M12 21s-7.2-4.55-9.05-8.9C1.5 8.3 3.6 5.2 6.75 5.2c1.95 0 3.5 1.05 5.25 2.9 1.75-1.85 3.3-2.9 5.25-2.9 3.15 0 5.25 3.1 3.8 6.9C19.2 16.45 12 21 12 21z',
    heartDouble: 'M9 5.5c1.1-1.3 2.3-2 3.6-2 2.4 0 4 2.4 2.9 5.3-1.1 3-5.2 6.7-5.2 6.7S6.3 11.8 5.2 8.8C4.1 5.9 5.7 3.5 8.1 3.5c.4 0 .6.6 1 2zm8.5 6c.9-1 1.8-1.6 2.8-1.6 1.9 0 3.1 1.9 2.3 4.1-.9 2.3-4 5.2-4 5.2s-3.1-2.9-4-5.2c-.8-2.2.4-4.1 2.3-4.1.3 0 .4.5.6 1.6z',
    heartPulse: 'M12 21s-7.2-4.55-9.05-8.9C1.5 8.3 3.6 5.2 6.75 5.2c1.95 0 3.5 1.05 5.25 2.9 1.75-1.85 3.3-2.9 5.25-2.9 3.15 0 5.25 3.1 3.8 6.9C19.2 16.45 12 21 12 21zM7 11h2l1.5-3 2.5 6 1.5-3h3v2h-1.6l-2.4 4.6-2.5-6L10 12H7z',
    fire: 'M12 2c3 4 6 6.5 6 10.5a6 6 0 0 1-12 0C6 9 9 6 12 2zm0 17a3 3 0 0 0 3-3c0-1.8-1.2-3.2-3-5.2-1.8 2-3 3.4-3 5.2a3 3 0 0 0 3 3z',
    crown: 'M2 8l4 3 6-7 6 7 4-3v11H2z',
    diamond: 'M8 2h8l6 7-10 13L2 9z',
    gem: 'M8 2h8l6 7-10 13L2 9zm1.7 2L5.4 9h13.2l-4.3-5zM12 19.2 17.7 11H6.3z',
    trophy: 'M18 4h2a2 2 0 0 1 2 2c0 2.6-1.7 4.8-4.1 5.6A6 6 0 0 1 13 15.9V18h3v2H8v-2h3v-2.1A6 6 0 0 1 6.1 11.6C3.7 10.8 2 8.6 2 6a2 2 0 0 1 2-2h2V2h12zM6 6H4c0 1.5.7 2.8 1.8 3.4A8.4 8.4 0 0 1 6 8zm12 2c0 .5-.1 1-.2 1.4C18.9 8.8 20 7.5 20 6h-2z',
    medal: 'M8 2h8v6a4 4 0 0 1-8 0zm4 12a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm0 3l1 2.1 2.3.3-1.7 1.6.4 2.3-2-1.1-2 1.1.4-2.3-1.7-1.6 2.3-.3z',

    /* --- 말풍선 --- */
    bubbleRound: 'M4 3h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-6l-5 4v-4H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z',
    bubbleRect: 'M2 4h20v11H9l-5 5v-5H2z',
    bubbleDots: 'M4 4h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm3 5a1.6 1.6 0 1 0 0 3.2A1.6 1.6 0 0 0 7 9zm5 0a1.6 1.6 0 1 0 0 3.2A1.6 1.6 0 0 0 12 9zm5 0a1.6 1.6 0 1 0 0 3.2A1.6 1.6 0 0 0 17 9z',
    bubbleThought: 'M4 3h12a4 4 0 0 1 0 8H4a4 4 0 0 1 0-8zm-1 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-1.5 5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z',
    bubbleCloud: 'M6 18h11a5 5 0 0 0 .6-10A7 7 0 0 0 4.5 9.2 4.5 4.5 0 0 0 6 18zM8 20a2 2 0 1 0 0 3 2 2 0 0 0 0-3z',
    bubbleShout: 'M2 3l2.5 3L2 9l2.5 3L2 15l2.5 3L2 21l20-9z',
    bubbleAngry: 'M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm4 6.5 3 2-3 2zm8 0v4l-3-2z',
    quoteOpen: 'M9 5C6 5 4 7 4 10v9h7v-9H7c0-2 1-3 3-3zm11 0c-3 0-5 2-5 5v9h7v-9h-4c0-2 1-3 3-3z',
    quoteRight: 'M20 5c3 0 5 2 5 5v9h-7v-9h4c0-2-1-3-3-3zM9 5c3 0 5 2 5 5v9H7v-9h4c0-2-1-3-3-3z',
    megaphone: 'M3 10v4a1 1 0 0 0 1 1h2l3 5h2l-.6-5H11l8 4V5l-8 4H4a1 1 0 0 0-1 1z',
    chat: 'M4 3h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-8l-6 5v-5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm3 5h10v2H7zm0 4h7v2H7z',

    /* --- 리본 · 배지 --- */
    ribbon: 'M2 4h20v7H2zM4 11l-2 6 5-3zM20 11l2 6-5-3z',
    ribbonCorner: 'M2 2h14L2 16zM2 22l4-4-4-4z',
    ribbonBanner: 'M4 3h16v7H4zm-2 7h20l-2 3 2 3H2l2-3z',
    ribbonTail: 'M12 2l4 3h6l-3 4 3 4h-6l-4 3-4-3H2l3-4-3-4h6z',
    badgeCircle: 'M12 2l2.3 1.8 2.9-.2.9 2.8L20.4 8l-1 2.8 1 2.8-2.3 1.7-.9 2.8-2.9-.2L12 19.7 9.7 17.9l-2.9.2-.9-2.8L3.6 13.6l1-2.8-1-2.8 2.3-1.7.9-2.8 2.9.2z',
    badgeShield: 'M12 2l8 3v7c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V5z',
    badgeStarRound: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 3.6 1.9 3.9 4.3.6-3.1 3 .7 4.3-3.8-2-3.8 2 .7-4.3-3.1-3 4.3-.6z',
    shieldCheck: 'M12 2l8 3v7c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V5zm-1 13.4 5.5-5.5-1.4-1.4L11 12.6l-2.1-2.1-1.4 1.4z',
    flag: 'M6 2v20h2v-7h11l-2.5-4L19 7H8V2z',
    flagWaving: 'M4 2v20h2v-7c3-2 5 2 8 0 2-1.4 4-.4 5 .6V4c-1-1-3-2-5-.6-3 2-5-2-8 0V2z',
    seal: 'M12 1.5l2.2 1.7 2.7-.5 1.2 2.5 2.5 1.2-.5 2.7 1.7 2.2-1.7 2.2.5 2.7-2.5 1.2-1.2 2.5-2.7-.5-2.2 1.7-2.2-1.7-2.7.5-1.2-2.5-2.5-1.2.5-2.7L1.8 12l1.7-2.2-.5-2.7 2.5-1.2 1.2-2.5 2.7.5zm0 4.5a6 6 0 1 0 0 12 6 6 0 0 0 0-12z',
    stamp: 'M9 2h6v5H9zM6 8h12l1.5 8H4.5zM3 18h18v4H3z',
    priceTag: 'M2 2h11l9 9-11 11-9-9zm5 3.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z',
    award: 'M12 2a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm0 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10zM7.5 15.5 5 22l7-3.5L19 22l-2.5-6.5a8.9 8.9 0 0 1-9 0z',

    /* --- 구분선 --- */
    dividerLine: 'M2 11h20v2H2z',
    dividerDashed: 'M2 11h4v2H2zM9 11h6v2H9zM17 11h5v2h-5z',
    dividerDots: 'M4 10.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm8 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm8 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z',
    dividerWave: 'M1 12c2.5-3 4.5 3 7 0s4.5 3 7 0 4.5 3 7 0v2c-2.5 3-4.5-3-7 0s-4.5-3-7 0-4.5-3-7 0z',
    dividerZigzag: 'M2 11l3-3 3 3 3-3 3 3 3-3 3 3v2l-3-3-3 3-3-3-3 3-3-3-3 3z',
    dividerDouble: 'M2 9h20v1.5H2zM2 13.5h20V15H2z',
    dividerOrnament: 'M2 11h7v2H2zm13 0h7v2h-7zM12 7l3 5-3 5-3-5z',
    dividerDiamond: 'M2 11h6v2H2zm14 0h6v2h-6zM12 6l4 6-4 6-4-6z',
    dividerLeaf: 'M1 12h6c1.5-3 4-3 5 0-1 3-3.5 3-5 0zm16 0h6c-1.5 3-4 3-5 0 1-3 3.5-3 5 0zM11 11h2v2h-2z',
    dividerArrow: 'M2 11h5v2H2zm15 0h5v2h-5zM12 6l4 6-4 6-4-6z',
    dividerScallop: 'M1 11.5a2 2 0 0 1 4 0 2 2 0 0 1 4 0 2 2 0 0 1 4 0 2 2 0 0 1 4 0 2 2 0 0 1 4 0v2a2 2 0 0 0-4 0 2 2 0 0 0-4 0 2 2 0 0 0-4 0 2 2 0 0 0-4 0 2 2 0 0 0-4 0z',

    /* --- 프레임 --- */
    framePhoto: 'M2 2h20v20H2zm2 2v16h16V4zm2 13 3.5-4.5 2.5 3 3-3.5L18 17zM8 7a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z',
    frameCorners: 'M2 2h7v2H4v5H2zm13 0h7v7h-2V4h-5zM2 15h2v5h5v2H2zm18 0h2v7h-7v-2h5z',
    frameArc: 'M2 12a10 10 0 0 1 20 0h-2a8 8 0 0 0-16 0zm2 3h16v2H4zm3 4h10v2H7z',
    framePolaroid: 'M2 3h20v18H2zm2 2v11h16V5zm3 13h10v2H7z',
    frameCircle: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16zm0 2a6 6 0 1 0 0 12 6 6 0 0 0 0-12z',
    frameTicket: 'M3 5h18v4a2 2 0 0 0 0 4v6H3v-6a2 2 0 0 0 0-4zm2 2v1.3a4 4 0 0 1 0 5.4V17h14v-1.3a4 4 0 0 1 0-5.4V7z',
    frameStamp: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 3a7 7 0 1 1 0 14 7 7 0 0 1 0-14zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z',

    /* --- 차트 --- */
    chartBar: 'M4 12h4v9H4zM10 6h4v15h-4zM16 9h4v12h-4z',
    chartBarH: 'M3 4h14v4H3zm0 6h9v4H3zm0 6h18v4H3z',
    chartLine: 'M3 19l5-5 4 3 7-8 2 1.7-8.3 9.5-4.2-3.1L4.7 21z',
    chartArea: 'M2 20h20v2H2zM2 16l5-5 4 3 7-8 4 3v7z',
    chartPie: 'M12 2v10h10A10 10 0 0 0 12 2zm-2 2.2A8 8 0 1 0 19.8 14H10z',
    chartDonut: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 5a5 5 0 1 1 0 10 5 5 0 0 1 0-10z',
    chartRadar: 'M12 2 3.4 8.2l3.3 10.1h10.6l3.3-10.1zm0 4.5 4.6 3.3-1.8 5.4H9.2L7.4 9.8z',
    chartScatter: 'M4 6a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm6 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7-4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm-3 9a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM3 20h18v2H3z',
    chartGauge: 'M12 4a9 9 0 0 0-9 9h2a7 7 0 1 1 14 0h2a9 9 0 0 0-9-9zm1 8.3V7h-2v5.3a2 2 0 1 0 2 0z',
    chartFunnel: 'M2 3h20l-8 8.5V21l-4-2.5v-7z',
    trendUp: 'M3.5 17.5 9 12l3.5 3.5L20 8h-5V6h8v8h-2V9.4l-8.5 8.5-3.5-3.5-4 4z',
    trendDown: 'M3.5 6.5 9 12l3.5-3.5L20 16h-5v2h8v-8h-2v4.6l-8.5-8.5L9 9.6l-4-4z',

    /* --- 업무 · 문서 --- */
    doc: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm2 16H8v-2h8zm0-4H8v-2h8zm-3-5V3.5L18.5 9z',
    docs: 'M8 2h8l4 4v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 8h8v2H8zm0 4h8v2H8z',
    docText: 'M6 2h8l5 5v15H6zm2 2v16h9V8h-4V4zm1 6h7v2H9zm0 4h7v2H9zm0 4h5v2H9z',
    clipboard: 'M9 2h6v2h3a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3zm0 4v2h6V6zm-1 6h8v2H8zm0 4h6v2H8z',
    clipboardCheck: 'M9 2h6v2h3a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3zm-1 12.4 4 4 6-6-1.4-1.4L12 15.6l-2.6-2.6z',
    folder: 'M3 4h6l2 2h10a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
    folderOpen: 'M2 6a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2v1H2zm0 5h20l-2.5 9H4.5z',
    archive: 'M2 3h20v5H2zm1 6h18v12H3zm6 3v2h6v-2z',
    inbox: 'M3 4h18v10h-5a4 4 0 0 1-8 0H3zm0 12h5.3a6 6 0 0 0 7.4 0H21v5H3z',
    send: 'M2 3l20 9-20 9 4-9zm2.8 2L17 12 4.8 19 7 13h6v-2H7z',
    briefcase: 'M9 2h6a2 2 0 0 1 2 2v2h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3V4a2 2 0 0 1 2-2zm0 4h6V4H9zm-7 6v8h20v-8h-7v2H9v-2z',
    printer: 'M7 2h10v4H7zm-3 6h16a2 2 0 0 1 2 2v7h-4v5H6v-5H2v-7a2 2 0 0 1 2-2zm4 9v3h8v-3zm-2-4a1 1 0 1 0 0 2 1 1 0 0 0 0-2z',
    calculator: 'M5 2h14a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm2 3v4h10V5zm0 6h3v3H7zm5 0h3v3h-3zm5 0h0v3h-3v-3zM7 15h3v3H7zm5 0h3v3h-3zm5 0h0v3h-3v-3z',
    pen: 'M3 17.2 14.6 5.6l3.8 3.8L6.8 21H3zM16 4.2 17.6 2.6a1.5 1.5 0 0 1 2.1 0l1.7 1.7a1.5 1.5 0 0 1 0 2.1L19.8 8z',
    pencil: 'M2 22l1.5-5.5L15.5 4.5l4 4L7.5 20.5zM18 2l4 4-1.5 1.5-4-4z',
    ruler: 'M2.8 15.6 15.6 2.8l5.6 5.6L8.4 21.2zM12 9.4l1.4 1.4-1.4 1.4-1.4-1.4zm-2.5 2.5 1.4 1.4-1.4 1.4-1.4-1.4zm5 0 1.4 1.4-1.4 1.4-1.4-1.4z',
    scissors: 'M9.6 6.4 6.7 3.5 5.3 4.9l2.9 2.9zM6 2a4 4 0 1 1 2.8 6.8L10.6 10.6 20 20l-1.4 1.4-9.4-9.4L6.4 14.8A4 4 0 1 1 6 2zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm8 14.4 1.4-1.4 1.5 1.5a4 4 0 1 1-1.4 1.4z',
    pushpin: 'M14.5 2 22 9.5l-1.4 1.4-1.1-1.1-4.2 4.2.7 4.3-1.4 1.4-4-4-5 5L4.2 19.3l5-5-4-4L6.6 9l4.3.7 4.2-4.2-1.1-1.1z',
    paperclip: 'M18 7v9.5a5.5 5.5 0 0 1-11 0V6a3.5 3.5 0 0 1 7 0v9.5a1.5 1.5 0 0 1-3 0V7H9.5v8.5a3 3 0 0 0 6 0V6a5 5 0 0 0-10 0v10.5a7 7 0 0 0 14 0V7z',
    tag: 'M2 12l10 10 10-10V2H12zm14-5a2 2 0 1 1 0 4 2 2 0 0 1 0-4z',
    link: 'M10 13a5 5 0 0 1 0-7l2-2a5 5 0 0 1 7 7l-1 1-1.5-1.5 1-1a2.5 2.5 0 0 0-3.5-3.5l-2 2a2.5 2.5 0 0 0 0 3.5zM14 11a5 5 0 0 1 0 7l-2 2a5 5 0 0 1-7-7l1-1 1.5 1.5-1 1a2.5 2.5 0 0 0 3.5 3.5l2-2a2.5 2.5 0 0 0 0-3.5z',
    search: 'M10 2a8 8 0 1 0 4.9 14.3l5.4 5.4 1.4-1.4-5.4-5.4A8 8 0 0 0 10 2zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12z',
    filter: 'M2 4h20l-8 9v7l-4 3v-10z',
    gridView: 'M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z',
    listView: 'M3 4h4v4H3zm6 0h12v4H9zM3 10h4v4H3zm6 0h12v4H9zM3 16h4v4H3zm6 0h12v4H9z',
    kanban: 'M3 3h5v18H3zm6.5 0h5v12h-5zM16 3h5v15h-5z',
    database: 'M12 2c5 0 9 1.3 9 3v14c0 1.7-4 3-9 3s-9-1.3-9-3V5c0-1.7 4-3 9-3zm0 2c-4 0-7 .9-7 1s3 1 7 1 7-.9 7-1-3-1-7-1zM5 8.6V12c0 .1 3 1 7 1s7-.9 7-1V8.6c-1.7.6-4.1.9-7 .9s-5.3-.3-7-.9zm0 6V19c0 .1 3 1 7 1s7-.9 7-1v-4.4c-1.7.6-4.1.9-7 .9s-5.3-.3-7-.9z',
    server: 'M3 3h18v7H3zm0 11h18v7H3zM6 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm0 11a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z',
    cloudUpload: 'M6 18h11a5 5 0 0 0 .6-10A7 7 0 0 0 4.5 9.2 4.5 4.5 0 0 0 6 18zM11 12.4V8h2v4.4l1.8-1.8 1.4 1.4-4.2 4.2-4.2-4.2 1.4-1.4z',
    settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM10.3 2h3.4l.4 2.5 1.8 1 2.4-.9 1.7 2.9-1.9 1.7v2l1.9 1.7-1.7 2.9-2.4-.9-1.8 1-.4 2.5h-3.4l-.4-2.5-1.8-1-2.4.9-1.7-2.9 1.9-1.7v-2L4.1 7.5l1.7-2.9 2.4.9 1.8-1z',
    key: 'M14 2a8 8 0 0 0-7.6 10.5L2 17v5h5l1-1v-2h2v-2h2v-2l1.1-1.1A8 8 0 1 0 14 2zm2 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4z',
    lock: 'M12 2a5 5 0 0 0-5 5v2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm-3 7V7a3 3 0 0 1 6 0v2z',
    unlock: 'M12 2a5 5 0 0 0-5 5h2a3 3 0 0 1 6 0v2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5z',
    eye: 'M12 5C6.5 5 2.5 9 1 12c1.5 3 5.5 7 11 7s9.5-4 11-7c-1.5-3-5.5-7-11-7zm0 2c3.8 0 6.9 2.6 8.6 5-1.7 2.4-4.8 5-8.6 5s-6.9-2.6-8.6-5C5.1 9.6 8.2 7 12 7zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
    trash: 'M9 3h6l1 2h5v2H3V5h5zM5 8h14l-1 13H6zm4 2v9h2v-9zm4 0v9h2v-9z',
    bulb: 'M12 2a7 7 0 0 0-4 12.7V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.3A7 7 0 0 0 12 2zm-2 18h4v1a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z',

    /* --- 공공 · 행정 --- */
    government: 'M12 2 2 8v3h20V8zm-7 11v7h3v-7zm5 0v7h4v-7zm6 0v7h3v-7zM2 21h20v2H2z',
    bank: 'M12 1.5 1.5 7v2.5h21V7zM4 11h2.5v8H4zm6.8 0h2.5v8h-2.5zm6.7 0H20v8h-2.5zM2 20h20v2.5H2z',
    idCard: 'M2 5h20v14H2zm2 2v10h16V7zM5 10h4v4H5zm5.5 0h8v1.5h-8zm0 3h6v1.5h-6z',
    certificate: 'M4 2h16v16H4zm2 2v12h12V4zM7 6h10v1.5H7zm0 3h10v1.5H7zm0 3h6v1.5H7zm3 8 2-2 2 2v4l-2-1.5L10 22z',
    contract: 'M6 2h9l5 5v15H6zm2 2v16h10V8h-4V4zm2 6h6v1.5H10zm0 4h6v1.5H10zm0 4h4v1.5h-4z',
    receipt: 'M5 2h14v20l-3-2-2.5 2-1.5-2-1.5 2-2.5-2-3 2zM8 6h8v2H8zm0 4h8v2H8zm0 4h5v2H8z',
    notice: 'M4 3h16v18H4zm2 2v14h12V5zm2 3h8v2H8zm0 4h8v1.5H8zm0 3h5v1.5H8z',
    vote: 'M4 12h16v9H4zm2 2v5h12v-5zM12 2l6 7H6zm-2 3.5h4v2h-4z',
    gavel: 'M2.5 20h11v2h-11zM14.6 2.4l3.1 3.1-1.6 1.6-3.1-3.1zM9.5 7.5l3.1 3.1-6.4 6.4L3.1 13.9zM12 11l1.6 1.6-6.4 6.4-1.6-1.6zM14 14.5l5.3 5.3-1.6 1.6-5.3-5.3z',
    scale: 'M12 2v2h-1v2.1L6 7.5 6 12H3v2h6v-2H6V8.6l4.2-1.2L12 9l1.8-1.6L18 8.6V12h-3v2h6v-2h-3V7.5L13 6.1V3zM6 14l3 7H3zm12 0 3 7h-6zM11 17h2v5h-2z',
    badgeId: 'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 4v6h10V6zm0 9v1.5h10V15zm0 3v1.5h6V18z',
    building: 'M4 2h10v20H4zm2 3v2h2V5zm4 0v2h2V5zM6 9v2h2V9zm4 0v2h2V9zM6 13v2h2v-2zm4 0v2h2v-2zM14 8h6v14h-6zm2 3v2h2v-2zm0 4v2h2v-2z',
    city: 'M2 22V9l6-4v17zm8 0V13l6-4v13zm8 0V6l4-3v19zM5 11v2h2v-2zm0 4v2h2v-2zm8-2v2h2v-2zm0 4v2h2v-2z',
    hospital: 'M4 3h16v18H4zm2 2v14h12V5zm4 2h4v3h3v4h-3v3h-4v-3H7V9h3z',

    /* --- 사람 --- */
    person: 'M12 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 10c4.4 0 8 2.2 8 5v1H4v-1c0-2.8 3.6-5 8-5z',
    people: 'M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 2c-2.7 0-6 1.35-6 4v3h12v-3c0-2.65-3.3-4-6-4zm8 0c-.9 0-1.95.15-2.9.42 1.15.85 1.9 2 1.9 3.58v3h7v-3c0-2.65-3.3-4-6-4z',
    peopleGroup: 'M12 6a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zM6 8a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zm12 0a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zm0 7c2.5 0 4.5 1.2 4.5 2.8V20H14v-1.8c0-1.2-.6-2.2-1.6-2.9.9-.2 1.7-.3 2.6-.3zM6 15c2.3 0 4.2 1.1 4.2 2.6V20H1.8v-2.4C1.8 16.1 3.7 15 6 15zm6-1c3 0 5.5 1.5 5.5 3.4V20h-11v-2.6c0-1.9 2.5-3.4 5.5-3.4z',
    personPlus: 'M10 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 10c4.4 0 8 2.2 8 5v1H2v-1c0-2.8 3.6-5 8-5zm12-8v2h-2v2h-2V8h-2V6h2V4h2v2z',
    personCheck: 'M10 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 10c4.4 0 8 2.2 8 5v1H2v-1c0-2.8 3.6-5 8-5zm11.3-3.7-1.4-1.4-4.3 4.3-1.6-1.6-1.4 1.4 3 3z',
    personSearch: 'M10 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 10c2.2 0 4.2.5 5.7 1.4l4.4 4.4-1.4 1.4-4.4-4.4A9.6 9.6 0 0 1 10 18c-4.4 0-8-2.2-8-5v-1h2v1c0 1.5 2.7 3 6 3z',
    handshake: 'M11 6 8.5 8.5 6 6l3-3zM2 7l4-4 4 4-4 4zm9.5 2.5L9 12l2.5 2.5L14 12zM13 4l4 4-4 4-4-4zm5 4 4-4-2-2-4 4zM7 14l4 4-4 4-4-4zm10 0-4-4-2 2 4 4z',
    hand: 'M8 2a1.5 1.5 0 0 1 3 0v7h1V4a1.5 1.5 0 0 1 3 0v5h1V6a1.5 1.5 0 0 1 3 0v9a7 7 0 0 1-7 7h-1a7 7 0 0 1-7-7v-3a1.5 1.5 0 0 1 3 0v2h1z',
    thumbsup: 'M7 22H4V10h3zm3.5 0H18a2 2 0 0 0 2-1.7l1-6A2 2 0 0 0 19 12h-4.5l.8-4.4A2 2 0 0 0 13.4 5l-.9.9L10.5 8.9 9 10.4z',
    thumbsdown: 'M7 2h3v12H7zm3.5 0H18a2 2 0 0 1 2 1.7l1 6A2 2 0 0 1 19 12h-4.5l.8 4.4A2 2 0 0 1 13.4 19l-.9-.9-2-3.1L9 13.6z',
    accessibility: 'M12 2a2.2 2.2 0 1 1 0 4.4A2.2 2.2 0 0 1 12 2zM4 8h16v2h-5v3l3 9h-2.3l-2.4-7H10.7l-2.4 7H6l3-9v-3H4z',
    baby: 'M12 2a6 6 0 0 0-6 6c0 2 1 3.6 2.4 4.7V19a3 3 0 0 0 3 3h1.2a3 3 0 0 0 3-3v-6.3A6 6 0 0 0 18 8a6 6 0 0 0-6-6zm-2 5a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm4 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm-2 3.5c.9 0 1.6.5 1.6 1H10.4c0-.5.7-1 1.6-1z',

    /* --- 자연 · 날씨 --- */
    sun: 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM11 1h2v3h-2zm0 19h2v3h-2zM1 11h3v2H1zm19 0h3v2h-3zM4.2 5.6 5.6 4.2l2.1 2.1-1.4 1.4zM16.3 17.7l1.4-1.4 2.1 2.1-1.4 1.4zM17.7 4.2l1.4 1.4-2.1 2.1-1.4-1.4zM4.2 18.4l2.1-2.1 1.4 1.4-2.1 2.1z',
    moon: 'M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z',
    sunrise: 'M12 3.5 15.5 7h-2.2v4h-2.6V7H8.5zM3 13h18v2H3zm2 4h14v2H5zm-1 4h16v2H4z',
    cloud: 'M6 18h11a5 5 0 0 0 .6-10A7 7 0 0 0 4.5 9.2 4.5 4.5 0 0 0 6 18z',
    cloudSun: 'M12 4a4 4 0 0 1 3.7 2.5A5.5 5.5 0 0 1 16 17H7a4.5 4.5 0 0 1-.6-8.9A4 4 0 0 1 12 4zM4 3.5 5.4 4.9 4 6.3 2.6 4.9zM20.4 6.3 19 4.9l1.4-1.4L21.8 4.9z',
    cloudRain: 'M6 15h11a5 5 0 0 0 .6-10A7 7 0 0 0 4.5 6.2 4.5 4.5 0 0 0 6 15zm2 3 .1 3.4L6.7 22l-.1-3.4zm5 0 .1 3.4L11.7 22l-.1-3.4zm5 0 .1 3.4L16.7 22l-.1-3.4z',
    cloudSnow: 'M6 14h11a5 5 0 0 0 .6-10A7 7 0 0 0 4.5 5.2 4.5 4.5 0 0 0 6 14zm2.5 3.5 1.5 1-1.5 1-1.5-1zm6 0 1.5 1-1.5 1-1.5-1zm-3 3.5 1.5 1-1.5 1-1.5-1z',
    cloudLightning: 'M6 13h11a5 5 0 0 0 .6-10A7 7 0 0 0 4.5 4.2 4.5 4.5 0 0 0 6 13zm6 3h3l-3 6v-4h-3z',
    rainbow: 'M12 5C7 5 3 9.5 3 15h2c0-4.4 3.2-8 7-8s7 3.6 7 8h2c0-5.5-4-10-9-10zm0 4c-3.1 0-5.5 2.7-5.5 6h2c0-2.2 1.6-4 3.5-4s3.5 1.8 3.5 4h2c0-3.3-2.4-6-5.5-6z',
    wind: 'M3 8h10a2.5 2.5 0 1 0-2.5-2.5H8.5A4.5 4.5 0 1 1 13 13H3zm0 5h14a2.5 2.5 0 1 1-2.5 2.5h-2A4.5 4.5 0 1 0 17 11H3z',
    umbrella: 'M12 2a10 10 0 0 1 10 10H2A10 10 0 0 1 12 2zm-1 10v7a2 2 0 0 0 4 0h-2a1 1 0 0 1-1 1 1 1 0 0 1-1-1v-7z',
    snowflake: 'M11 2h2v4.2l2.4-1.4 1 1.7L12 9l-4.4-2.5 1-1.7L11 6.2zM2 11h4.2L4.8 8.6l1.7-1L9 12l-2.5 4.4-1.7-1L6.2 13H2zm20 0v2h-4.2l1.4 2.4-1.7 1L15 12l2.5-4.4 1.7 1L17.8 11zM11 15.8V22h2v-6.2l2.4 1.4 1-1.7L12 12.8l-4.4 2.7 1 1.7z',
    thermometer: 'M14 14.8V4a2 2 0 1 0-4 0v10.8a4 4 0 1 0 4 0z',
    lightning: 'M13 2 4 14h6l-1 8 9-12h-6z',
    leaf: 'M20 3C10 3 4 8 4 16a5 5 0 0 0 5 5c8 0 11-7 11-18zM8 19c2-5 6-8 10-9-4 3-7 6-9 10z',
    flower: 'M12 2a3 3 0 0 1 3 3 3 3 0 0 1 4 4 3 3 0 0 1-1 5 3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-1-5 3 3 0 0 1 4-4 3 3 0 0 1 3-3z',
    plant: 'M12 22v-8c0-3 2-5 5-5-1 3-2 4-4 5 3.5-.5 6 1.5 6 5zM9 9c-2 0-4-1.5-4-4 2.5 0 4 1 5 3z',
    tree: 'M12 2l6 8h-4l5 7h-5v5h-4v-5H5l5-7H6z',
    mountain: 'M2 20 9 7l4 7 2-3.5L22 20z',
    wave: 'M1 15c2.5-3 4.5 3 7 0s4.5 3 7 0 4.5 3 7 0v3c-2.5 3-4.5-3-7 0s-4.5-3-7 0-4.5-3-7 0z',
    drop: 'M12 2c4 5 7 8.5 7 12a7 7 0 1 1-14 0c0-3.5 3-7 7-12z',

    /* --- 생활 --- */
    home: 'M12 3l9 8h-3v10h-5v-6h-2v6H6V11H3z',
    gift: 'M20 7h-2.2a3.5 3.5 0 0 0-4.3-4.4A3.5 3.5 0 0 0 8.2 7H6a2 2 0 0 0-2 2v2h2v8h12v-8h2V9a2 2 0 0 0-2-2zm-8 0H8.2a1.5 1.5 0 0 1 2.9-.9zM12 7h-.1a1.5 1.5 0 0 1 2.9.9H12zm0 4h6v8h-6zm-2 8v-8H4v8z',
    book: 'M4 2h13a3 3 0 0 1 3 3v17H7a3 3 0 0 1-3-3zm3 16a1 1 0 0 0 0 2h11v-2z',
    bookOpen: 'M2 4h8a3 3 0 0 1 2 1 3 3 0 0 1 2-1h8v16h-8a3 3 0 0 0-2 1 3 3 0 0 0-2-1H2zm2 2v12h5a4 4 0 0 1 2 .5V7a3 3 0 0 0-2-1zm16 0h-5a3 3 0 0 0-2 1v11.5a4 4 0 0 1 2-.5h5z',
    notebook: 'M5 2h14v20H5zm2 2v16h10V4zm2 3h6v1.5H9zm0 3h6v1.5H9z',
    backpack: 'M8 6V5a4 4 0 0 1 8 0v1h2a3 3 0 0 1 3 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a3 3 0 0 1 3-3zm2-1v1h4V5a2 2 0 0 0-4 0zm-5 6v10h14V11z',
    coffee: 'M4 4h13v8a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zm15 1h1.5a2.5 2.5 0 0 1 0 5H19v-2h1.5a.5.5 0 0 0 0-1H19zM3 19h15v2H3z',
    cart: 'M2 2h3l3.6 11h9.8l3.2-8H6.6l-.6-2H2zm5 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
    wallet: 'M3 6h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V6zm15 6a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z',
    cake: 'M4 10h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-2V6a2 2 0 0 1 4 0v2zm8 0V4a2 2 0 0 1 4 0v4z',
    globe: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2c1.5 0 2.8 2.6 3 6H9c.2-3.4 1.5-6 3-6zM4.3 11h2.8c.1-1.8.4-3.4.9-4.6A8 8 0 0 0 4.3 11zm0 2a8 8 0 0 0 3.7 4.6c-.5-1.2-.8-2.8-.9-4.6zm4.8 0h5.8c-.2 3.4-1.5 6-3 6s-2.8-2.6-3-6zm6.9 4.6A8 8 0 0 0 19.7 13h-2.8c-.1 1.8-.4 3.4-.9 4.6zM16.9 11h2.8a8 8 0 0 0-3.7-4.6c.5 1.2.8 2.8.9 4.6z',
    download: 'M11 3h2v8h4l-5 5-5-5h4zM4 17h2v3h12v-3h2v5H4z',
    upload: 'M11 21h2v-8h4l-5-5-5 5h4zM4 2h2v3h12V2h2v5H4z',
    bell: 'M12 2a6 6 0 0 0-6 6v4l-2 3v1h16v-1l-2-3V8a6 6 0 0 0-6-6zm-2 16a2 2 0 1 0 4 0z',
    bellRing: 'M12 2a6 6 0 0 0-6 6v4l-2 3v1h16v-1l-2-3V8a6 6 0 0 0-6-6zm-2 16a2 2 0 1 0 4 0zM2.5 6 1 4.5A10 10 0 0 1 4 1.6l1 1.7A8 8 0 0 0 2.5 6zm19 0a8 8 0 0 0-2.5-2.7l1-1.7a10 10 0 0 1 3 2.9z',
    clock: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 5h-2v6l5 3 1-1.7-4-2.3z',
    calendar: 'M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H5V9h14z',
    calendarCheck: 'M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H5V9h14zm-8.4-1.4-3-3 1.4-1.4 1.6 1.6 4-4 1.4 1.4z',
    mail: 'M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4.2-8 5-8-5V6l8 5 8-5z',
    phone: 'M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.3 1z',
    mobile: 'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 3v14h10V5zm4 15h2v1h-2z',
    monitor: 'M3 4h18a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-7v2h4v2H6v-2h4v-2H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm1 2v9h16V6z',
    laptop: 'M4 5h16a1 1 0 0 1 1 1v10H3V6a1 1 0 0 1 1-1zm1 2v7h14V7zM1 18h22l-1 2H2z',
    keyboard: 'M2 6h20a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zm1 2v8h18V8zm2 1h2v2H5zm3 0h2v2H8zm3 0h2v2h-2zm3 0h2v2h-2zm3 0h2v2h-2zM5 13h14v2H5z',
    plug: 'M9 2h2v6H9zm4 0h2v6h-2zM6 8h12v4a6 6 0 0 1-5 5.9V22h-2v-4.1A6 6 0 0 1 6 12z',
    wifi: 'M12 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0-6c1.9 0 3.6.8 4.9 2l1.4-1.4A9 9 0 0 0 12 10a9 9 0 0 0-6.3 2.6L7.1 14A6.9 6.9 0 0 1 12 12zm0-5c3.3 0 6.3 1.3 8.5 3.5l1.4-1.4A14 14 0 0 0 12 5a14 14 0 0 0-9.9 4.1l1.4 1.4A12 12 0 0 1 12 7z',
    battery: 'M2 8h16v8H2zm2 2v4h12v-4zM20 10h2v4h-2z',
    tv: 'M2 5h20a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1 2v10h18V7zM8 2h8v2H8z',
    camera: 'M9 3l-1.5 2H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.5L15 3zm3 5a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z',
    image: 'M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm2 12 3.5-4.5 2.5 3 3-3.5L20 18H6zm2.5-6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
    video: 'M2 6a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zm15 4.5 5-3.5v10l-5-3.5z',
    music: 'M9 3l11-2v3.2L11 6.2V17a4 4 0 1 1-2-3.5z',
    palette: 'M12 2a10 10 0 0 0 0 20c1.7 0 2.5-1.1 2.5-2.4 0-2-1.9-2.1-1.9-3.6 0-1.1.9-2 2.2-2H17a5 5 0 0 0 5-5C22 5 17.5 2 12 2zM6.5 13a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3-5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm4 3.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z',
    brush: 'M14.5 2.5 21 9l-2 2-6.5-6.5zM11 7.5 16.5 13 9 20.5H3.5L6 18l-2-2z',
    broom: 'M13 2h2l1 8-2 .5zM9 12h8l2 10H7zm2 3v5h4v-5z',
    magnet: 'M6 2h4v10a2 2 0 0 0 4 0V2h4v10a6 6 0 0 1-12 0zM6 4.5h4V7H6zm8 0h4V7h-4z',
    lightbulb: 'M12 2a7 7 0 0 0-4 12.7V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.3A7 7 0 0 0 12 2zm-2 18h4v1a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z',

    /* --- 미디어 --- */
    play: 'M6 3l15 9-15 9z',
    pause: 'M6 3h5v18H6zm7 0h5v18h-5z',
    stop: 'M4 4h16v16H4z',
    next: 'M4 3l12 9-12 9zm14 0h3v18h-3z',
    prev: 'M20 3 8 12l12 9zM3 3h3v18H3z',
    volume: 'M4 9h4l5-4v14l-5-4H4zm12.5-2.1A7 7 0 0 1 16.5 17l-1.5-1.4a5 5 0 0 0 0-7.2z',
    volumeMute: 'M4 9h4l5-4v14l-5-4H4zm12 1.6 1.4-1.4 2 2 2-2 1.4 1.4-2 2 2 2-1.4 1.4-2-2-2 2-1.4-1.4 2-2z',
    mic: 'M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3zm-6 9a6 6 0 0 0 5 5.9V20H9v2h6v-2h-2v-3.1A6 6 0 0 0 18 11h-2a4 4 0 0 1-8 0z',
    headphones: 'M12 2a9 9 0 0 0-9 9v6a3 3 0 0 0 3 3h2v-8H5v-1a7 7 0 0 1 14 0v1h-3v8h2a3 3 0 0 0 3-3v-6a9 9 0 0 0-9-9z',
    musicNote: 'M9 3l11-2v3.2L11 6.2V17a4 4 0 1 1-2-3.5z',
    film: 'M2 4h20v16H2zm2 2v3h3V6zm5 0v12h6V6zm8 0v3h3V6zM4 11v3h3v-3zm13 0v3h3v-3zM4 16v3h3v-3zm13 0v3h3v-3z',
    radio: 'M12 6a9 9 0 0 0-9 9h2a7 7 0 0 1 14 0h2a9 9 0 0 0-9-9zm0 4a5 5 0 0 0-5 5h2a3 3 0 0 1 6 0h2a5 5 0 0 0-5-5zm0 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z',

    /* --- 의료 · 안전 --- */
    medicalCross: 'M9 2h6v7h7v6h-7v7H9v-7H2V9h7z',
    pill: 'M14.1 2.5a4.9 4.9 0 0 1 6.9 6.9l-1.5 1.5-6.9-6.9zM11.1 5.5l6.9 6.9-4.6 4.6a4.9 4.9 0 0 1-6.9-6.9z',
    firstAid: 'M9 2h6v3h5v15H4V5h5zm2 2v1h2V4zM6 7v11h12V7zm5 2h2v3h3v2h-3v3h-2v-3H8v-2h3z',
    stethoscope: 'M6 2h2v6a4 4 0 0 0 8 0V2h2v6a6 6 0 0 1-5 5.9V16a4 4 0 0 0 8 0v-1.1a3 3 0 1 1 2 0V16a6 6 0 0 1-12 0v-2.1A6 6 0 0 1 6 8z',
    hospitalSign: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1 4h2v3h3v2h-3v3h-2v-3H8V9h3z',
    warning: 'M12 2 1 21h22zm0 5 7.5 12h-15zM11 10v5h2v-5zm0 6v2h2v-2z',
    exit: 'M10 3H4v18h6v-2H6V5h4zm4.6 3.6L13.2 8l3 3H8v2h8.2l-3 3 1.4 1.4L20.6 12z',
    lifebuoy: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2c1.2 0 2.4.3 3.4.8l-1.8 1.8a4 4 0 0 0-3.2 0L8.6 4.8A8 8 0 0 1 12 4zM4 12c0-1.2.3-2.4.8-3.4l1.8 1.8a4 4 0 0 0 0 3.2l-1.8 1.8A8 8 0 0 1 4 12zm8 8a8 8 0 0 1-3.4-.8l1.8-1.8a4 4 0 0 0 3.2 0l1.8 1.8A8 8 0 0 1 12 20zm8-8a8 8 0 0 1-.8 3.4l-1.8-1.8a4 4 0 0 0 0-3.2l1.8-1.8A8 8 0 0 1 20 12z',
    helmet: 'M12 3a9 9 0 0 0-9 9v4h6v-4H7a5 5 0 0 1 10 0h-2v4h6v-4a9 9 0 0 0-9-9zM4 18h16v3H4z',
    fireExtinguisher: 'M9 2h6v2H9zM10 4h4v2h-4zM8 7h8v15H8zm2 3v10h4V10zM16 4h3l1 5h-2l-.6-3H16z',
    safetyGoggles: 'M2 7h20v7a4 4 0 0 1-4 4h-2a3 3 0 0 1-3-3h-2a3 3 0 0 1-3 3H6a4 4 0 0 1-4-4zm2 2v5h16V9z',

    /* --- 교육 --- */
    graduation: 'M12 3 1 8.5 12 14l9-4.5V16h2V8.5zM5 12.6V17c0 1.7 3.1 3 7 3s7-1.3 7-3v-4.4l-7 3.5z',
    school: 'M12 2 1 9v2h22V9zm-9 11v8h6v-5h6v5h6v-8z',
    abc: 'M2 18 5.5 6h3L12 18h-2.4l-.7-2.6H5.1L4.4 18zm3.6-4.6h2.3L6.8 9.7zM14 6h5.5a2.5 2.5 0 0 1 0 5A2.5 2.5 0 0 1 19.5 16H14zm2.2 2v2.1h2.6a1.05 1.05 0 0 0 0-2.1zm0 4v2.1h2.8a1.05 1.05 0 0 0 0-2.1z',
    microscope: 'M6 20h14v2H6zM12 2a4 4 0 0 0-2 7.5V12h4V9.5A4 4 0 0 0 12 2zM8 14h6l2 4H6z',
    backpackSchool: 'M8 6V5a4 4 0 0 1 8 0v1h2a3 3 0 0 1 3 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a3 3 0 0 1 3-3zm2-1v1h4V5a2 2 0 0 0-4 0zM5 13h14v2H5z',

    /* --- 교통 · 여행 --- */
    car: 'M5 10.5 6.8 5.6A2 2 0 0 1 8.7 4.2h6.6a2 2 0 0 1 1.9 1.4L19 10.5h1.5A1.5 1.5 0 0 1 22 12v5h-3v2h-3v-2H8v2H5v-2H2v-5a1.5 1.5 0 0 1 1.5-1.5zm2.4 0h9.2L15.5 6.2h-7zM7 13a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm10 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z',
    bus: 'M5 3h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2v2h-3v-2H8v2H5v-2a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm0 2v6h14V5zm1.5 9a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z',
    truck: 'M1 5h13v9h2.5l3.5-4h2v10h-2v-2H3v2H1zm2 2v7h9V7zm11 0v5h1.7l2.3-2.6V7z',
    train: 'M6 2h12a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3zm0 2v6h12V4zm0 8v3h12v-3zM7 19l-2 3h2.5l1-2h7l1 2H19l-2-3z',
    subway: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2c1.2 0 2.3.3 3.3.8l-3.3 3.9-3.3-3.9A7.9 7.9 0 0 1 12 4zm-5.6 2.4 3.4 4-4.4 3.2a8 8 0 0 1 1-7.2zm11.2 0a8 8 0 0 1 1 7.2l-4.4-3.2zM6.1 15.1l4.6-3.4 1.3 1.5-4.2 3a8 8 0 0 1-1.7-1.1zm11.8 0a8 8 0 0 1-1.7 1.1l-4.2-3 1.3-1.5zM12 17a8 8 0 0 1-3.1-.6l2.3-1.6h1.6l2.3 1.6A8 8 0 0 1 12 17z',
    airplane: 'M21 15v-2l-7-4V3.5A1.5 1.5 0 0 0 12.5 2 1.5 1.5 0 0 0 11 3.5V9l-7 4v2l7-2v5l-2 1.5V21l3.5-1 3.5 1v-1.5L14 18v-5z',
    ship: 'M3 12h18l-2.5 7h-13zM5 6h5v6H5zm6 0h3v6h-3zM2 21h20v1.5H2z',
    rocket: 'M12 2c3.5 3.5 5 8 5 12l-2.5 2.5h-5L7 14c0-4 1.5-8.5 5-12zm0 5a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM8 15l-2 2 1 4 2-3zm8 0 2 2-1 4-2-3z',
    bicycle: 'M6 13a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm12-2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM11 5h2v4h-2zm2 0h4l3 5-1.7 1-2.5-4.2H13zM9 9l2.5-4 1.7 1L10.7 10z',
    taxi: 'M5 10.5 6.8 5.6A2 2 0 0 1 8.7 4.2h6.6a2 2 0 0 1 1.9 1.4L19 10.5h1.5A1.5 1.5 0 0 1 22 12v5h-3v2h-3v-2H8v2H5v-2H2v-5a1.5 1.5 0 0 1 1.5-1.5zM9 2h6v2H9zm-1.6 8.5h9.2L15.5 6.2h-7zM7 13a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm10 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z',
    parking: 'M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm2 2v14h12V5zm3 2h4.2a3.5 3.5 0 0 1 0 7H11v3H9zm2 2v3h2.2a1.5 1.5 0 0 0 0-3z',
    trafficLight: 'M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm4 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 5a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 5a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
    map: 'M9 3 3 5v16l6-2 6 2 6-2V3l-6 2zm0 2.2 4 1.3v11.3l-4-1.3zm6 1.3 4-1.3v11.3l-4 1.3z',
    pin: 'M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z',
    compass: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16zm4.5 3.5-6 2.5-2.5 6 6-2.5z',
    luggage: 'M9 2h6v2h3a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3zm2 2h2V3h-2zM7 6v14h10V6zm2 2h1.5v10H9zm4.5 0H15v10h-1.5z',
    ticket: 'M3 6h18v4a2 2 0 0 0 0 4v4H3v-4a2 2 0 0 0 0-4zm2 2v1.3a4 4 0 0 1 0 5.4V16h14v-1.3a4 4 0 0 1 0-5.4V8z',
    hotel: 'M3 4h18v16H3zm2 2v12h9V6zm11 2h3v2h-3zm0 4h3v2h-3zM6 12h5v4H6z',
    tent: 'M12 3 1 21h7l4-8 4 8h7zm0 6 3.4 6.8L12 14l-3.4 1.8z',
    beach: 'M12 3a9 9 0 0 0-9 9h18a9 9 0 0 0-9-9zM3 14h18a9 9 0 0 1-9 7 9 9 0 0 1-9-7zM11 2h2v1.5h-2z',

    /* --- 음식 --- */
    utensils: 'M5 2v7h1.5V2H8v7h1.5V2H11v8a3 3 0 0 1-2.5 2.9V22H6.5v-9.1A3 3 0 0 1 4 10V2zM17 2c1.7 0 3 1.8 3 4v6h-2.5v10h-2V2z',
    apple: 'M12 6.5c-1-1.5-2.5-2.5-4-2.5-3 0-5 2.8-5 6 0 4.5 3.5 9.5 6 9.5.8 0 1.5-.5 3-.5s2.2.5 3 .5c2.5 0 6-5 6-9.5 0-3.2-2-6-5-6-1.5 0-3 1-4 2.5zm0-2.5c0-1.5 1-3 3-3.5.3 2-1.2 3.5-3 3.5z',
    pizza: 'M12 2 2 20a20 20 0 0 0 20 0zM12 5.5 18 16a16 16 0 0 1-12 0zM9 13a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm6-1a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-3-3a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z',
    burger: 'M4 9a8 8 0 0 1 16 0zM3 11h18v2H3zm2 4h14v1a5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5z',
    icecream: 'M8 2a4 4 0 0 1 8 0 4 4 0 0 1 3 6.5 3.5 3.5 0 0 1-2 6.3L12 22 7 14.8a3.5 3.5 0 0 1-2-6.3A4 4 0 0 1 8 2z',
    wine: 'M6 2h12v6a6 6 0 0 1-5 5.9V20h3v2H8v-2h3v-6.1A6 6 0 0 1 6 8zm2 2v4a4 4 0 0 0 8 0V4z',
    bread: 'M4 8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v12H4zm2 2v8h12v-8z',
    cup: 'M4 4h13v11a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zm15 1h1.5a2.5 2.5 0 0 1 0 5H19v-2h1.5a.5.5 0 0 0 0-1H19zM3 21h16v2H3z',

    /* --- 쇼핑 · 결제 --- */
    creditCard: 'M2 5h20a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1 3v2h18V8zm0 4v5h18v-5z',
    cash: 'M2 5h20v14H2zm2 2v10h16V7zm8 1a4 4 0 1 1 0 8 4 4 0 0 1 0-8z',
    coin: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16zm1 3h-2v1.1c-1.4.3-2.5 1.2-2.5 2.6 0 1.9 2 2.3 3.5 2.7.9.2 1.5.5 1.5 1 0 .6-.8 1-1.5 1-.9 0-1.6-.4-1.9-1.1l-1.9.7c.5 1.4 1.7 2.2 3.3 2.4V19h2v-1.3c1.4-.3 2.5-1.2 2.5-2.7 0-1.9-2-2.4-3.5-2.8-.9-.2-1.5-.4-1.5-.9 0-.5.7-.9 1.5-.9.8 0 1.4.4 1.7 1l1.9-.7c-.4-1.2-1.5-2-2.6-2.2z',
    bag: 'M8 7V5a4 4 0 0 1 8 0v2h3v15H5V7zm2 0h4V5a2 2 0 0 0-4 0zM7 9v11h10V9z',
    basket: 'M8 7V5a4 4 0 0 1 8 0v2h2.5l2.5 13H3L5.5 7zm2 0h4V5a2 2 0 0 0-4 0zm-4 9h12l.8-4H6.8z',
    sale: 'M2 2h11l9 9-11 11-9-9zm5 3.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM19 3l2 2-8 8-2-2z',
    package: 'M12 2 2 7v10l10 5 10-5V7zm0 2.3 7 3.5-7 3.5-7-3.5zM4 9.3l7 3.5v6.9l-7-3.5zm9 10.4v-6.9l7-3.5v6.9z',
    truckDelivery: 'M1 5h13v9h2.5l3.5-4h2v10h-2v-2H3v2H1zm2 2v7h9V7zm11 0v5h1.7l2.3-2.6V7z',

    /* --- 소셜 · 통신 --- */
    share: 'M18 2a3 3 0 1 0 2.1 5.1L9.9 12l10.2 4.9A3 3 0 1 0 18 22a3 3 0 0 0-2.6-3l-10.2-4.9a3 3 0 1 0 0-4.2L15.4 5A3 3 0 0 0 18 2z',
    reply: 'M10 4v4c6 0 9 3 10 10-3-5-6-6-10-6v4l-8-6z',
    forward: 'M14 4l8 6-8 6v-4c-6 0-9 3-10 10 3-5 6-6 10-6z',
    mention: 'M12 2a10 10 0 1 0 4.6 18.9l.7-1.9A8 8 0 1 1 20 12v1a1.5 1.5 0 0 1-3 0v-1a5 5 0 1 0-1.5 3.5l.4 2A8 8 0 0 0 20 12a10 10 0 0 0-8-10zm0 5a5 5 0 1 1-3.5 8.5A5 5 0 0 1 12 7z',
    heartHand: 'M12 20s-6-3.8-7.5-7.4C3.3 9.4 5 7 7.5 7c1.6 0 2.9.9 4.5 2.5C13.6 7.9 14.9 7 16.5 7 19 7 20.7 9.4 19.5 12.6 18 16.2 12 20 12 20zM2 19h4v2H2z',
    users: 'M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 2c-2.7 0-6 1.35-6 4v3h12v-3c0-2.65-3.3-4-6-4zm8 0c-.9 0-1.95.15-2.9.42 1.15.85 1.9 2 1.9 3.58v3h7v-3c0-2.65-3.3-4-6-4z'
  };

  /* ============================================================ 한글 이름

     마우스를 올렸을 때 영어 키가 뜨면 아무도 못 알아본다. */

  var LABELS = {
    check: '체크', checkCircle: '체크 원', checkDouble: '이중 체크', close: '엑스', closeCircle: '엑스 원',
    plus: '더하기', minus: '빼기', question: '물음표', exclamation: '느낌표', info: '안내',
    asterisk: '별표', hash: '샵', at: '골뱅이', percent: '퍼센트', ban: '금지', power: '전원',
    menu: '메뉴', more: '더보기',

    arrowRight: '오른쪽 화살표', arrowLeft: '왼쪽 화살표', arrowUp: '위 화살표', arrowDown: '아래 화살표',
    arrowUpRight: '오른쪽 위 대각선', arrowUpLeft: '왼쪽 위 대각선', arrowDownRight: '오른쪽 아래 대각선',
    arrowDownLeft: '왼쪽 아래 대각선', arrowFatRight: '굵은 오른쪽', arrowFatLeft: '굵은 왼쪽',
    arrowFatUp: '굵은 위', arrowFatDown: '굵은 아래', arrowDouble: '양방향', arrowDoubleH: '좌우 양방향',
    arrowDoubleV: '상하 양방향', arrowCurved: '꺾인 화살표', arrowCurvedLeft: '꺾인 화살표(왼쪽)',
    arrowCorner: '모서리 화살표', arrowSplit: '갈라지는 화살표', arrowMerge: '합쳐지는 화살표',
    arrowRefresh: '새로고침', arrowRefreshLeft: '되돌리기 화살표', arrowSync: '순환 화살표',
    arrowCircleRight: '원형 화살표', chevronRight: '꺾쇠 오른쪽', chevronLeft: '꺾쇠 왼쪽',
    chevronUp: '꺾쇠 위', chevronDown: '꺾쇠 아래', caretUp: '작은 삼각형 위', caretDown: '작은 삼각형 아래',
    arrowEnter: '진입 화살표', arrowExpand: '펼치기', arrowCollapse: '접기',

    star: '별', starSix: '육각별', starBadge: '별 배지', sparkle: '반짝임', sparkleStar: '반짝 별',
    sparkles: '반짝 세 개', heart: '하트', heartDouble: '하트 두 개', heartPulse: '하트 박동',
    fire: '불꽃', crown: '왕관', diamond: '다이아몬드', gem: '보석', trophy: '트로피', medal: '훈장',

    bubbleRound: '둥근 말풍선', bubbleRect: '네모 말풍선', bubbleDots: '점 세 개 말풍선',
    bubbleThought: '생각 말풍선', bubbleCloud: '구름 말풍선', bubbleShout: '외침 말풍선',
    bubbleAngry: '화난 말풍선', quoteOpen: '따옴표', quoteRight: '닫는 따옴표',
    megaphone: '확성기', chat: '대화',

    ribbon: '리본', ribbonCorner: '코너 리본', ribbonBanner: '배너', ribbonTail: '리본 배지',
    badgeCircle: '원 배지', badgeShield: '방패 배지', badgeStarRound: '원형 별 배지',
    shieldCheck: '방패 체크', flag: '깃발', flagWaving: '펄럭이는 깃발', seal: '인장', stamp: '도장',
    priceTag: '가격표', award: '어워드',

    dividerLine: '실선', dividerDashed: '파선', dividerDots: '점선', dividerWave: '물결선',
    dividerZigzag: '지그재그', dividerDouble: '이중선', dividerOrnament: '장식선',
    dividerDiamond: '다이아 선', dividerLeaf: '잎사귀 선', dividerArrow: '화살표 선',
    dividerScallop: '반원선',

    framePhoto: '사진 프레임', frameCorners: '모서리 프레임', frameArc: '아치 프레임',
    framePolaroid: '폴라로이드', frameCircle: '원 프레임', frameTicket: '티켓 프레임',
    frameStamp: '우표 프레임',

    chartBar: '막대 차트', chartBarH: '가로 막대', chartLine: '꺾은선 차트', chartArea: '영역 차트',
    chartPie: '원 차트', chartDonut: '도넛 차트', chartRadar: '레이더 차트', chartScatter: '산점도',
    chartGauge: '계기판', chartFunnel: '깔때기', trendUp: '상승 화살표', trendDown: '하락 화살표',

    doc: '문서', docs: '문서 여러 장', docText: '문서(글)', clipboard: '클립보드',
    clipboardCheck: '클립보드 체크', folder: '폴더', folderOpen: '열린 폴더', archive: '보관함',
    inbox: '받은함', send: '보내기', briefcase: '서류 가방', printer: '프린터', calculator: '계산기',
    pen: '펜', pencil: '연필', ruler: '자', scissors: '가위', pushpin: '압정', paperclip: '클립',
    tag: '태그', link: '링크', search: '돋보기', filter: '필터', gridView: '격자', listView: '목록',
    kanban: '칸반', database: '데이터베이스', server: '서버', cloudUpload: '클라우드 업로드',
    settings: '설정', key: '열쇠', lock: '자물쇠', unlock: '열린 자물쇠', eye: '눈', trash: '휴지통',
    bulb: '전구',

    government: '관공서', bank: '은행', idCard: '신분증', certificate: '상장 · 증서',
    contract: '계약서', receipt: '영수증', notice: '공고문', vote: '투표', gavel: '법봉',
    scale: '저울', badgeId: '사원증', building: '건물', city: '도시', hospital: '병원',

    person: '사람', people: '두 사람', peopleGroup: '여러 사람', personPlus: '사람 추가',
    personCheck: '사람 체크', personSearch: '사람 찾기', handshake: '악수', hand: '손',
    thumbsup: '따봉', thumbsdown: '싫어요', accessibility: '접근성', baby: '아기',

    sun: '해', moon: '달', sunrise: '일출', cloud: '구름', cloudSun: '해 구름',
    cloudRain: '비', cloudSnow: '눈', cloudLightning: '번개 구름', rainbow: '무지개',
    wind: '바람', umbrella: '우산', snowflake: '눈송이', thermometer: '온도계',
    lightning: '번개', leaf: '나뭇잎', flower: '꽃', plant: '새싹', tree: '나무',
    mountain: '산', wave: '파도', drop: '물방울',

    home: '집', gift: '선물', book: '책', bookOpen: '펼친 책', notebook: '공책',
    backpack: '책가방', coffee: '커피', cart: '장바구니', wallet: '지갑', cake: '케이크',
    globe: '지구', download: '내려받기', upload: '올리기', bell: '종', bellRing: '울리는 종',
    clock: '시계', calendar: '달력', calendarCheck: '일정 달력', mail: '편지', phone: '전화',
    mobile: '휴대전화', monitor: '모니터', laptop: '노트북', keyboard: '키보드', plug: '플러그',
    wifi: '와이파이', battery: '배터리', tv: '티비', camera: '카메라', image: '사진',
    video: '동영상', music: '음악', palette: '팔레트', brush: '붓', broom: '빗자루',
    magnet: '자석', lightbulb: '전구',

    play: '재생', pause: '일시정지', stop: '정지', next: '다음', prev: '이전',
    volume: '소리', volumeMute: '음소거', mic: '마이크', headphones: '헤드폰',
    musicNote: '음표', film: '필름', radio: '라디오',

    medicalCross: '의료 십자', pill: '알약', firstAid: '구급함', stethoscope: '청진기',
    hospitalSign: '병원 표시', warning: '경고', exit: '비상구', lifebuoy: '구명튜브',
    helmet: '안전모', fireExtinguisher: '소화기', safetyGoggles: '보안경',

    graduation: '학사모', school: '학교', abc: '글자', microscope: '현미경',
    backpackSchool: '학생 가방',

    car: '자동차', bus: '버스', truck: '트럭', train: '기차', subway: '지하철',
    airplane: '비행기', ship: '배', rocket: '로켓', bicycle: '자전거', taxi: '택시',
    parking: '주차', trafficLight: '신호등', map: '지도', pin: '위치 표시',
    compass: '나침반', luggage: '여행 가방', ticket: '티켓', hotel: '숙소', tent: '텐트',
    beach: '해변',

    utensils: '식기', apple: '사과', pizza: '피자', burger: '햄버거', icecream: '아이스크림',
    wine: '와인', bread: '빵', cup: '컵',

    creditCard: '카드', cash: '현금', coin: '동전', bag: '쇼핑백', basket: '바구니',
    sale: '세일', package: '택배 상자', truckDelivery: '배송 트럭',

    share: '공유', reply: '답장', forward: '전달', mention: '멘션', heartHand: '마음',
    users: '사용자들'
  };

  /* ============================================================ 분류

     개수가 많아지면 분류가 전부다. 실제로 찾는 순서대로 두었다. */

  var CATEGORIES = [
    { id: 'symbol', name: '기호', items: ['check', 'checkCircle', 'checkDouble', 'close', 'closeCircle', 'plus', 'minus', 'question', 'exclamation', 'info', 'asterisk', 'hash', 'at', 'percent', 'ban', 'power', 'menu', 'more'] },
    { id: 'arrow', name: '화살표', items: ['arrowRight', 'arrowLeft', 'arrowUp', 'arrowDown', 'arrowUpRight', 'arrowUpLeft', 'arrowDownRight', 'arrowDownLeft', 'arrowFatRight', 'arrowFatLeft', 'arrowFatUp', 'arrowFatDown', 'arrowDouble', 'arrowDoubleH', 'arrowDoubleV', 'arrowCurved', 'arrowCurvedLeft', 'arrowCorner', 'arrowSplit', 'arrowMerge', 'arrowRefresh', 'arrowRefreshLeft', 'arrowSync', 'arrowCircleRight', 'chevronRight', 'chevronLeft', 'chevronUp', 'chevronDown', 'caretUp', 'caretDown', 'arrowEnter', 'arrowExpand', 'arrowCollapse'] },
    { id: 'star', name: '별 · 마음', items: ['star', 'starSix', 'starBadge', 'sparkle', 'sparkleStar', 'sparkles', 'heart', 'heartDouble', 'heartPulse', 'fire', 'crown', 'diamond', 'gem', 'trophy', 'medal'] },
    { id: 'bubble', name: '말풍선', items: ['bubbleRound', 'bubbleRect', 'bubbleDots', 'bubbleThought', 'bubbleCloud', 'bubbleShout', 'bubbleAngry', 'quoteOpen', 'quoteRight', 'megaphone', 'chat'] },
    { id: 'ribbon', name: '리본 · 배지', items: ['ribbon', 'ribbonCorner', 'ribbonBanner', 'ribbonTail', 'badgeCircle', 'badgeShield', 'badgeStarRound', 'shieldCheck', 'flag', 'flagWaving', 'seal', 'stamp', 'priceTag', 'award'] },
    { id: 'divider', name: '구분선', items: ['dividerLine', 'dividerDashed', 'dividerDots', 'dividerWave', 'dividerZigzag', 'dividerDouble', 'dividerOrnament', 'dividerDiamond', 'dividerLeaf', 'dividerArrow', 'dividerScallop'] },
    { id: 'frame', name: '프레임', items: ['framePhoto', 'frameCorners', 'frameArc', 'framePolaroid', 'frameCircle', 'frameTicket', 'frameStamp'] },
    { id: 'chart', name: '차트', items: ['chartBar', 'chartBarH', 'chartLine', 'chartArea', 'chartPie', 'chartDonut', 'chartRadar', 'chartScatter', 'chartGauge', 'chartFunnel', 'trendUp', 'trendDown'] },
    { id: 'work', name: '업무 · 문서', items: ['doc', 'docs', 'docText', 'clipboard', 'clipboardCheck', 'folder', 'folderOpen', 'archive', 'inbox', 'send', 'briefcase', 'printer', 'calculator', 'pen', 'pencil', 'ruler', 'scissors', 'pushpin', 'paperclip', 'tag', 'link', 'search', 'filter', 'gridView', 'listView', 'kanban', 'database', 'server', 'cloudUpload', 'settings', 'key', 'lock', 'unlock', 'eye', 'trash', 'bulb'] },
    { id: 'public', name: '공공 · 행정', items: ['government', 'bank', 'idCard', 'certificate', 'contract', 'receipt', 'notice', 'vote', 'gavel', 'scale', 'badgeId', 'building', 'city', 'hospital'] },
    { id: 'people', name: '사람', items: ['person', 'people', 'peopleGroup', 'users', 'personPlus', 'personCheck', 'personSearch', 'handshake', 'hand', 'thumbsup', 'thumbsdown', 'accessibility', 'baby'] },
    { id: 'nature', name: '자연 · 날씨', items: ['sun', 'moon', 'sunrise', 'cloud', 'cloudSun', 'cloudRain', 'cloudSnow', 'cloudLightning', 'rainbow', 'wind', 'umbrella', 'snowflake', 'thermometer', 'lightning', 'leaf', 'flower', 'plant', 'tree', 'mountain', 'wave', 'drop'] },
    { id: 'life', name: '생활', items: ['home', 'gift', 'book', 'bookOpen', 'notebook', 'backpack', 'coffee', 'cart', 'wallet', 'cake', 'globe', 'download', 'upload', 'bell', 'bellRing', 'clock', 'calendar', 'calendarCheck', 'mail', 'phone', 'mobile', 'monitor', 'laptop', 'keyboard', 'plug', 'wifi', 'battery', 'tv', 'camera', 'image', 'video', 'music', 'palette', 'brush', 'broom', 'magnet', 'lightbulb'] },
    { id: 'media', name: '미디어', items: ['play', 'pause', 'stop', 'next', 'prev', 'volume', 'volumeMute', 'mic', 'headphones', 'musicNote', 'film', 'radio'] },
    { id: 'health', name: '의료 · 안전', items: ['medicalCross', 'pill', 'firstAid', 'stethoscope', 'hospitalSign', 'warning', 'exit', 'lifebuoy', 'helmet', 'fireExtinguisher', 'safetyGoggles'] },
    { id: 'edu', name: '교육', items: ['graduation', 'school', 'abc', 'microscope', 'backpackSchool'] },
    { id: 'travel', name: '교통 · 여행', items: ['car', 'bus', 'truck', 'train', 'subway', 'airplane', 'ship', 'rocket', 'bicycle', 'taxi', 'parking', 'trafficLight', 'map', 'pin', 'compass', 'luggage', 'ticket', 'hotel', 'tent', 'beach'] },
    { id: 'food', name: '음식', items: ['utensils', 'apple', 'pizza', 'burger', 'icecream', 'wine', 'bread', 'cup', 'cake'] },
    { id: 'shopping', name: '쇼핑 · 결제', items: ['creditCard', 'cash', 'coin', 'bag', 'basket', 'sale', 'package', 'truckDelivery', 'cart', 'wallet'] },
    { id: 'social', name: '소셜 · 통신', items: ['share', 'reply', 'forward', 'mention', 'heartHand', 'users', 'chat', 'mail', 'megaphone'] }
  ];

  /* 분류에 안 들어간 아이콘이 생기면 '기타' 로 모은다 — 조용히 사라지지 않게 */
  function collectRest() {
    var seen = {};
    CATEGORIES.forEach(function (category) {
      category.items.forEach(function (name) { seen[name] = true; });
    });

    var rest = Object.keys(ICONS).filter(function (name) { return !seen[name]; });
    if (rest.length) CATEGORIES.push({ id: 'rest', name: '기타', items: rest });
  }

  collectRest();

  var FIGURE_LIST = Object.keys(FIGURES);
  var ICON_LIST = Object.keys(ICONS);

  function scaleOf(size) {
    return (size || 120) / 24;
  }

  function iconPath(name) {
    return ICONS[name] || ICONS.star;
  }

  /* ==================================================== 아이콘 부품 (여러 색)

     아이콘 하나가 여러 조각으로 그려진 경우가 많다 (예: 리본 = 가운데 띠 +
     왼쪽 끈 + 오른쪽 끈). 조각마다 색을 따로 주면 훨씬 다양하게 쓸 수 있다.
     조각을 떼어 내도 위치가 어긋나지 않도록 **상대 명령(m)을 절대 좌표로
     바로잡아** 준다. 조각이 많은 아이콘은 PART_MAX 색까지만 나눈다. */

  var PART_MAX = 5;

  var PART_SLOT_NAMES = {
    ribbon: ['가운데 띠', '왼쪽 끈', '오른쪽 끈'],
    ribbonBanner: ['가운데 띠', '양쪽 깃'],
    checkCircle: ['동그라미', '체크'],
    shieldCheck: ['방패', '체크'],
    eye: ['눈 테두리', '눈동자', '동공']
  };

  /**
   * SVG 경로를 서브패스(부품)별로 쪼갠다.
   * 각 조각은 절대 좌표로 시작하는 독립된 경로 문자열이 된다.
   */
  function splitSubpaths(d) {
    var re = /([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]*)/g;
    var tokens = [];
    var hit;

    while ((hit = re.exec(d))) {
      var nums = (hit[2].match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi) || []).map(Number);
      tokens.push({ cmd: hit[1], nums: nums });
    }

    var out = [];
    var cur = null;
    var startX = 0, startY = 0, curX = 0, curY = 0;

    function flush() { if (cur) out.push(cur); cur = null; }

    tokens.forEach(function (token) {
      var up = token.cmd.toUpperCase();
      var rel = token.cmd !== up;
      var n = token.nums;
      var i;

      if (up === 'M') {
        flush();

        var x = n[0];
        var y = n[1];
        if (rel) { x += curX; y += curY; }
        curX = x; curY = y; startX = x; startY = y;
        cur = 'M' + round1(x) + ' ' + round1(y);

        // 뒤에 이어지는 좌표쌍은 L 로 이어진다
        for (i = 2; i + 1 < n.length; i += 2) {
          var lx = n[i];
          var ly = n[i + 1];
          if (rel) { lx += curX; ly += curY; }
          curX = lx; curY = ly;
          cur += 'L' + round1(lx) + ' ' + round1(ly);
        }
        return;
      }

      if (cur === null) cur = 'M0 0';
      cur += token.cmd + n.join(' ');

      if (up === 'L' || up === 'T') {
        for (i = 0; i + 1 < n.length; i += 2) {
          curX = rel ? curX + n[i] : n[i];
          curY = rel ? curY + n[i + 1] : n[i + 1];
        }
      } else if (up === 'H') {
        n.forEach(function (v) { curX = rel ? curX + v : v; });
      } else if (up === 'V') {
        n.forEach(function (v) { curY = rel ? curY + v : v; });
      } else if (up === 'C') {
        for (i = 0; i + 5 < n.length; i += 6) {
          curX = rel ? curX + n[i + 4] : n[i + 4];
          curY = rel ? curY + n[i + 5] : n[i + 5];
        }
      } else if (up === 'S' || up === 'Q') {
        for (i = 0; i + 3 < n.length; i += 4) {
          curX = rel ? curX + n[i + 2] : n[i + 2];
          curY = rel ? curY + n[i + 3] : n[i + 3];
        }
      } else if (up === 'A') {
        for (i = 0; i + 6 < n.length; i += 7) {
          curX = rel ? curX + n[i + 5] : n[i + 5];
          curY = rel ? curY + n[i + 6] : n[i + 6];
        }
      } else if (up === 'Z') {
        curX = startX;
        curY = startY;
      }
    });

    flush();
    return out;
  }

  var subpathCache = {};

  /** 아이콘의 부품 경로들 — 한 번 쪼개면 기억해 둔다 */
  function iconParts(name) {
    if (!subpathCache[name]) subpathCache[name] = splitSubpaths(iconPath(name));
    return subpathCache[name];
  }

  function iconPartCount(name) {
    return Math.min(PART_MAX, Math.max(1, iconParts(name).length));
  }

  function partSlotNames(name) {
    var count = iconPartCount(name);
    var custom = PART_SLOT_NAMES[name];
    var names = [];

    for (var i = 0; i < count; i++) {
      names.push((custom && custom[i]) || ('부품 ' + (i + 1)));
    }
    return names;
  }

  /** 부품 색 — 주색에서 진한 톤 · 밝은 톤을 만들어 조각마다 다르게 준다 */
  function partPalette(main, count) {
    if (count <= 1) return [main];
    return [main, mixColor(main, -0.36), mixColor(main, 0.5),
      mixColor(main, -0.6), mixColor(main, 0.74)].slice(0, count);
  }

  /* ==================================================== 아이콘 색상 슬롯

     아이콘은 스타일에 따라 색이 1~4개다. 단색은 그림 하나, 배지·연한·원형은
     그림·배경 둘, 테두리·겹원은 그림·배경·테두리 셋, 엠블럼은 넷이다.
     넣은 뒤에도 속성 패널에서 슬롯마다 색을 바꿀 수 있고, 한 색만 고르면
     나머지 색은 서로 조화롭게 자동으로 맞춰 준다. */

  var ROUND_RECT_24 = 'M6.5 1h11A5.5 5.5 0 0 1 23 6.5v11a5.5 5.5 0 0 1-5.5 5.5h-11A5.5 5.5 0 0 1 1 17.5v-11A5.5 5.5 0 0 1 6.5 1z';
  var ROUND_RECT_INNER = 'M7 2.5h10a4.5 4.5 0 0 1 4.5 4.5v10a4.5 4.5 0 0 1-4.5 4.5H7a4.5 4.5 0 0 1-4.5-4.5V7A4.5 4.5 0 0 1 7 2.5z';
  var CIRCLE_24 = 'M0.5 12a11.5 11.5 0 1 0 23 0a11.5 11.5 0 1 0-23 0z';
  var CIRCLE_INNER = 'M2.4 12a9.6 9.6 0 1 0 19.2 0 9.6 9.6 0 1 0-19.2 0z';
  var CIRCLE_MID = 'M4.4 12a7.6 7.6 0 1 0 15.2 0 7.6 7.6 0 1 0-15.2 0z';
  var GLYPH_SCALE = 0.62;
  /** 아이콘 경로가 그려지는 기준 좌표계 크기 */
  var ICON_BOX = 24;

  /**
   * 조각 하나를 fabric.Path 로 만든다.
   *
   * fabric.Path 는 **제 bbox 를 꽉 채운 채 bbox 기준으로** 놓인다.
   * 그리고 `pathOffset` 은 bbox 의 최소값이 아니라 **중심**이다.
   * → origin 을 좌상단으로 잡고 left/top 을 `중심 - 크기/2` 로 두면
   *   조각이 **원래 그린 좌표 그대로** 놓인다.
   *   scale 이 있으면 bbox 중심을 축으로 줄어들도록 `- 크기/2 × scale` 로 보정한다.
   *
   * origin 은 **반드시 생성자에서** 정한다. 나중에 set() 으로 바꾸면 fabric 이
   * left/top 을 밀어 버려 조각이 다시 어긋난다.
   */
  function makeLayerPath(d, fill, scale, opacity) {
    var s = scale || 1;

    var child = new fabric.Path(d, {
      fill: fill,
      stroke: null,
      strokeWidth: 0,
      originX: 'left',
      originY: 'top',
      opacity: opacity == null ? 1 : opacity
    });

    child.set({
      left: child.pathOffset.x - (child.width / 2) * s,
      top: child.pathOffset.y - (child.height / 2) * s,
      scaleX: s,
      scaleY: s
    });

    return child;
  }

  var ICON_STYLES = [
    { id: 'solid', name: '단색', slots: [{ index: 0, name: '그림' }] },
    { id: 'badge', name: '배지', slots: [{ index: 0, name: '그림' }, { index: 1, name: '배경' }] },
    { id: 'soft', name: '연한', slots: [{ index: 0, name: '그림' }, { index: 1, name: '배경' }] },
    { id: 'circle', name: '원형', slots: [{ index: 0, name: '그림' }, { index: 1, name: '배경' }] },
    {
      id: 'frame', name: '테두리',
      slots: [{ index: 0, name: '그림' }, { index: 1, name: '배경' }, { index: 2, name: '테두리' }]
    },
    {
      id: 'doubleRing', name: '겹원',
      slots: [{ index: 0, name: '그림' }, { index: 1, name: '안쪽 배경' }, { index: 2, name: '바깥 고리' }]
    },
    {
      id: 'emblem', name: '엠블럼',
      slots: [{ index: 0, name: '그림' }, { index: 1, name: '가운데 원' },
        { index: 2, name: '배경' }, { index: 3, name: '테두리' }]
    },
    {
      // 부품 색 — 슬롯 수는 아이콘마다 다르다(조각 수). 이름은 iconSlotNames 가 만든다.
      id: 'parts', name: '부품',
      slots: [{ index: 0, name: '부품' }]
    }
  ];

  function styleSpec(style) {
    var found = null;
    ICON_STYLES.forEach(function (item) {
      if (item.id === style) found = item;
    });
    return found || ICON_STYLES[0];
  }

  function hexToRgb(hex) {
    var value = String(hex || '').replace('#', '');
    if (value.length === 3) {
      value = value[0] + value[0] + value[1] + value[1] + value[2] + value[2];
    }
    if (!/^[0-9a-f]{6}$/i.test(value)) return { r: 37, g: 99, b: 235 };
    return {
      r: parseInt(value.slice(0, 2), 16),
      g: parseInt(value.slice(2, 4), 16),
      b: parseInt(value.slice(4, 6), 16)
    };
  }

  function channelHex(value) {
    var hex = Math.round(Math.max(0, Math.min(255, value))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }

  /** amount > 0 이면 흰색 쪽으로, < 0 이면 검정 쪽으로 섞는다 */
  function mixColor(hex, amount) {
    var rgb = hexToRgb(hex);
    var target = amount >= 0 ? 255 : 0;
    var ratio = Math.abs(amount);

    return '#' +
      channelHex(rgb.r + (target - rgb.r) * ratio) +
      channelHex(rgb.g + (target - rgb.g) * ratio) +
      channelHex(rgb.b + (target - rgb.b) * ratio);
  }

  /** 배경 위에 얹을 그림 색 — 어떤 색을 골라도 묻히지 않게 대비를 맞춘다 */
  function inkOn(hex) {
    var rgb = hexToRgb(hex);
    var luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.62 ? '#111827' : '#ffffff';
  }

  /** 스타일 + 아이콘에 따라 색 슬롯이 몇 개인가 (부품은 아이콘마다 다르다) */
  function iconSlotCount(style, name) {
    if (styleSpec(style).id === 'parts') return iconPartCount(name);
    return styleSpec(style).slots.length;
  }

  /** 고른 색 하나로 스타일에 맞는 색 조합을 만들어 낸다 (슬롯 수만큼) */
  function iconColorsFor(mainColor, style, name) {
    var main = mainColor || '#2563eb';
    var id = styleSpec(style).id;

    if (id === 'solid') return [main];
    if (id === 'soft') return [main, mixColor(main, 0.86)];
    if (id === 'frame') return [main, mixColor(main, 0.86), main];
    if (id === 'doubleRing') return [main, mixColor(main, 0.86), main];
    if (id === 'emblem') {
      return [inkOn(main), main, mixColor(main, 0.86), mixColor(main, -0.3)];
    }
    if (id === 'parts') return partPalette(main, iconPartCount(name));
    return [inkOn(main), main];
  }

  /** 색 배열을 슬롯 수에 맞춘다. 한 색만 주면 나머지는 자동으로 만든다 */
  function normaliseIconColors(colors, style, name) {
    var count = iconSlotCount(style, name);
    var list = Array.isArray(colors) ? colors.slice() : (colors ? [colors] : []);

    if (count === 1) return [list[0] || '#2563eb'];
    if (list.length >= count) return list.slice(0, count);

    return iconColorsFor(list[0], style, name);
  }

  var api = {};

  api.ICONS = ICONS;
  api.FIGURES = FIGURES;
  api.iconList = ICON_LIST;
  api.figureList = FIGURE_LIST;
  api.categories = CATEGORIES;
  api.palette = PALETTE;
  api.paletteGroups = PALETTE_GROUPS;
  api.iconStyles = ICON_STYLES;
  api.iconColorsFor = iconColorsFor;
  api.mixColor = mixColor;

  /** 편집할 수 있는 색 슬롯 이름 — 부품 스타일은 아이콘마다 다르다 */
  api.iconSlotNames = function (style, name) {
    if (styleSpec(style).id === 'parts' && name) return partSlotNames(name);
    return styleSpec(style).slots.map(function (slot) { return slot.name; });
  };

  /**
   * 스타일별 아이콘 레이어 정의.
   * 모든 레이어는 24×24 틀 안에 들어가야 한다 — 밖으로 나가면 그룹 크기가 흔들린다.
   */
  function glyphLayer(name) {
    return { d: iconPath(name), slot: 0, scale: GLYPH_SCALE };
  }

  function iconShapes(spec, name) {
    if (spec.id === 'solid') return [{ d: iconPath(name), slot: 0, scale: 1 }];

    if (spec.id === 'parts') {
      return iconParts(name).map(function (d, index) {
        return { d: d, slot: Math.min(index, PART_MAX - 1), scale: 1 };
      });
    }

    if (spec.id === 'circle') {
      return [{ d: CIRCLE_24, slot: 1, scale: 1 }, glyphLayer(name)];
    }

    if (spec.id === 'frame') {
      return [
        { d: ROUND_RECT_24, slot: 2, scale: 1 },
        { d: ROUND_RECT_INNER, slot: 1, scale: 1 },
        glyphLayer(name)
      ];
    }

    if (spec.id === 'doubleRing') {
      return [
        { d: CIRCLE_24, slot: 2, scale: 1 },
        { d: CIRCLE_INNER, slot: 1, scale: 1 },
        glyphLayer(name)
      ];
    }

    if (spec.id === 'emblem') {
      return [
        { d: ROUND_RECT_24, slot: 3, scale: 1 },
        { d: ROUND_RECT_INNER, slot: 2, scale: 1 },
        { d: CIRCLE_MID, slot: 1, scale: 1 },
        { d: iconPath(name), slot: 0, scale: 0.5 }
      ];
    }

    return [{ d: ROUND_RECT_24, slot: 1, scale: 1 }, glyphLayer(name)];
  }

  /**
   * 아이콘 레이어를 계산한다.
   * 화면 미리보기(SVG)와 캔버스(fabric)가 **같은 정의**를 쓰도록 한 곳에서 만든다.
   */
  api.iconLayers = function (name, style, colors) {
    var spec = styleSpec(style);
    var palette = normaliseIconColors(colors, spec.id, name);

    return iconShapes(spec, name).map(function (layer) {
      return {
        d: layer.d,
        slot: layer.slot,
        scale: layer.scale,
        fill: palette[layer.slot] || palette[0]
      };
    });
  };

  /** 요소 패널 미리보기용 SVG — 캔버스와 같은 레이어 정의를 그대로 그린다 */
  api.iconSvg = function (name, style, colors) {
    var body = api.iconLayers(name, style, colors).map(function (layer) {
      var scale = layer.scale === 1 ? '' :
        ' style="transform-box:fill-box;transform-origin:center;transform:scale(' +
        layer.scale + ')"';
      return '<path d="' + layer.d + '" fill="' + layer.fill + '"' + scale + '/>';
    }).join('');

    return '<svg viewBox="0 0 24 24">' + body + '</svg>';
  };

  api.iconStyleOf = function (obj) {
    return (obj && obj.iconStyle) || 'solid';
  };

  /** 아이콘의 현재 색 배열 — 옛 단색 아이콘도 한 슬롯짜리로 읽어 준다 */
  api.iconColorsOf = function (obj) {
    if (!obj) return [];
    if (Array.isArray(obj.iconColors) && obj.iconColors.length) return obj.iconColors.slice();
    if (obj.fill) return [obj.fill];
    return ['#2563eb'];
  };

  /**
   * 표시 크기 — 저장해 둔 값을 우선 쓴다.
   * 단색 아이콘은 24×24 기준 좌표계를 그대로 쓰므로 배율 × 24 가 곧 요청한 크기다.
   * (fabric.Path 의 width 는 경로 자체의 크기라 크기 기준으로 쓸 수 없다)
   */
  api.iconSizeOf = function (obj) {
    if (!obj) return 120;
    if (obj.iconSize) return Math.round(obj.iconSize);
    if (obj.type === 'group') return Math.round((obj.width || 24) * (obj.scaleX || 1));
    return Math.round(ICON_BOX * (obj.scaleX || 1));
  };

  api.setIconSize = function (obj, size) {
    if (!obj) return;
    var value = Math.max(8, size || 120);

    // 배지는 실제 그룹 크기를, 단색은 24 기준 좌표계를 기준으로 삼는다
    var span = (obj.type === 'group')
      ? Math.max(obj.width || ICON_BOX, obj.height || ICON_BOX)
      : ICON_BOX;

    var unit = value / span;
    obj.set({ scaleX: unit, scaleY: unit });
    obj.set('iconSize', value);
    obj.setCoords();
  };

  /** 슬롯별 색을 다시 칠한다 — 배지 아이콘은 자식 경로의 slot 을 따라간다 */
  api.recolorIcon = function (obj, colors, style) {
    if (!obj || obj.kind !== 'icon') return;

    var activeStyle = style || api.iconStyleOf(obj);
    var list;

    if (obj.type === 'group') {
      list = normaliseIconColors(colors, activeStyle, obj.iconName);
      obj.getObjects().forEach(function (child) {
        if (child.slot === undefined || child.slot === null) return;
        child.set('fill', list[child.slot] || list[0]);
      });
    } else {
      list = [Array.isArray(colors) ? colors[0] : colors];
      obj.set('fill', list[0]);
    }

    obj.set({ iconColors: list, iconStyle: activeStyle });
    obj.dirty = true;
    obj.setCoords();
  };

  /** 한글 이름 — 없으면 키를 그대로 쓴다 (빈 툴팁이 생기지 않게) */
  api.label = function (name) {
    return LABELS[name] || name;
  };

  api.categoryOf = function (name) {
    var found = null;
    CATEGORIES.forEach(function (category) {
      if (category.items.indexOf(name) !== -1) found = category.id;
    });
    return found;
  };

  /**
   * 아이콘을 만든다.
   * 색이 하나면 지금까지처럼 `fabric.Path` 하나로, 여러 색이면 색 슬롯을 가진
   * `fabric.Group` 으로 만든다. 24×24 기준 틀을 두어 배지와 글리프의 비율이
   * 크기와 무관하게 일정하다.
   */
  api.makeIcon = function (name, size, colors, style) {
    var spec = styleSpec(style);
    var palette = normaliseIconColors(colors, spec.id, name);
    var layers = api.iconLayers(name, spec.id, palette);
    var iconSize = size || 120;

    if (layers.length === 1) {
      var scale = scaleOf(iconSize);
      // width/height 는 경로 자체의 크기로 둔다.
      // 여기에 요청 크기를 덮어쓰면 scaleX 와 곱해져 선택 박스가 몇 배로 부풀어 오른다.
      return new fabric.Path(layers[0].d, {
        fill: palette[0],
        stroke: null,
        strokeWidth: 0,
        scaleX: scale,
        scaleY: scale,
        originX: 'center',
        originY: 'center',
        iconName: name,
        iconStyle: 'solid',
        iconColors: palette.slice(),
        iconSize: iconSize,
        kind: 'icon'
      });
    }

    var children = layers.map(function (layer) {
      var child = makeLayerPath(layer.d, layer.fill, layer.scale);
      child.slot = layer.slot;
      return child;
    });

    // 배지 바깥 테두리를 기준으로 삼아 글리프가 조금 튀어나가도 크기가 흔들리지 않게 한다
    var frame = new fabric.Rect({
      width: 24, height: 24, left: 0, top: 0,
      fill: 'transparent', stroke: null, strokeWidth: 0,
      originX: 'left', originY: 'top',
      selectable: false, evented: false
    });
    frame.slot = null;

    var group = new fabric.Group([frame].concat(children), {
      originX: 'center',
      originY: 'center',
      kind: 'icon',
      iconName: name,
      iconStyle: spec.id,
      iconColors: palette.slice(),
      iconSize: iconSize
    });

    // 그룹의 실제 크기를 재서 배율을 잡는다 — 요청한 크기와 화면 크기를 정확히 맞춘다
    var span = Math.max(group.width || 24, group.height || 24);
    var unit = iconSize / span;
    group.set({ scaleX: unit, scaleY: unit });
    group.setCoords();
    return group;
  };

  /* ==================================================== 도형 색

     슬롯이 하나뿐인 도형은 '면 / 테두리 / 그라데이션' 세 가지 스타일로 칠하고,
     슬롯이 여럿인 도형(장식·무늬)은 정의의 layers 를 슬롯 색으로 칠한다.
     색 하나만 골라도 나머지는 그 색에서 조화롭게 만들어 낸다. */

  var FIGURE_STYLES = [
    { id: 'fill', name: '면' },
    { id: 'outline', name: '테두리' },
    { id: 'gradient', name: '그라데이션' }
  ];

  var FIGURE_BOX = 24;
  /** 도형 슬롯 색 — index 0 진한 주색, 1 밝은 톤, 2 어두운 톤, 3 대비색 */
  function figurePalette(main) {
    return [main, mixColor(main, 0.78), mixColor(main, -0.32), inkOn(main)];
  }

  function figureDef(key) {
    var raw = FIGURES[key] || FIGURES.star5;
    if (typeof raw === 'string') return { slots: ['면'], layers: [{ d: raw, slot: 0 }] };
    return raw;
  }

  /** 도형이 그려지는 기준 크기 — 일러스트는 48, 나머지는 24 */
  function figureBox(key) {
    return figureDef(key).box || FIGURE_BOX;
  }

  /** 일러스트인가 — 부품마다 색이 미리 정해져 있는 그림 */
  api.figureIsIllustration = function (key) {
    var def = figureDef(key);
    return !!(def.colors && def.colors.length);
  };

  /** 고른 색 하나로 도형의 슬롯 색을 모두 만들어 낸다 */
  function figureColorsFor(mainColor, key) {
    var main = mainColor || '#2563eb';
    var def = figureDef(key);
    // 일러스트는 자연스러운 기본 배색을 그대로 쓴다 (고른 색과 무관)
    if (def.colors && def.colors.length) return def.colors.slice(0, def.slots.length);
    if (def.slots.length <= 1) return [main];

    var palette = figurePalette(main);
    while (palette.length < def.slots.length) {
      palette.push(mixColor(main, 0.3 * palette.length - 0.6));
    }
    return palette.slice(0, def.slots.length);
  }

  function normaliseFigureColors(colors, key) {
    var def = figureDef(key);
    var list = Array.isArray(colors) ? colors.slice() : (colors ? [colors] : []);

    if (def.colors && def.colors.length) {
      if (list.length >= def.slots.length) return list.slice(0, def.slots.length);
      return def.colors.slice(0, def.slots.length);
    }

    if (def.slots.length <= 1) return [list[0] || '#2563eb'];
    if (list.length >= def.slots.length) return list.slice(0, def.slots.length);
    return figureColorsFor(list[0], key);
  }

  function figureGradient(color) {
    return new fabric.Gradient({
      type: 'linear',
      gradientUnits: 'percentage',
      coords: { x1: 0, y1: 0, x2: 1, y2: 1 },
      colorStops: [
        { offset: 0, color: mixColor(color, 0.3) },
        { offset: 1, color: mixColor(color, -0.32) }
      ]
    });
  }

  /**
   * 도형을 만든다.
   * 경로가 하나면 fabric.Path 하나로, 여러 겹이면 색 슬롯을 가진 fabric.Group 으로.
   */
  api.makeFigure = function (key, size, colors, style) {
    var def = figureDef(key);
    var figStyle = style || 'fill';
    var figSize = size || 120;
    var box = figureBox(key);
    var palette = normaliseFigureColors(colors, key);

    if (def.layers.length === 1) {
      var spec = {
        scaleX: figSize / box,
        scaleY: figSize / box,
        originX: 'center',
        originY: 'center',
        stroke: null,
        strokeWidth: 0,
        figureName: key,
        figureStyle: 'fill',
        figureColors: palette.slice(),
        figureSize: figSize,
        kind: 'figure'
      };

      if (figStyle === 'outline') {
        spec.fill = mixColor(palette[0], 0.88);
        spec.stroke = palette[0];
        spec.strokeWidth = 1.6;
        spec.strokeLineJoin = 'round';
        spec.figureStyle = 'outline';
      } else if (figStyle === 'gradient') {
        spec.fill = figureGradient(palette[0]);
        spec.figureStyle = 'gradient';
      } else {
        spec.fill = palette[0];
      }

      // width/height 는 경로 자체의 크기로 둔다. 여기에 요청 크기를 덮어쓰면
      // scale 과 곱해져 선택 박스가 몇 배로 부푼다 (아이콘과 같은 이유).
      return new fabric.Path(def.layers[0].d, spec);
    }

    var children = def.layers.map(function (layer) {
      var child = makeLayerPath(layer.d, palette[layer.slot] || palette[0],
        layer.scale, layer.opacity);
      child.slot = layer.slot;
      return child;
    });

    var frame = new fabric.Rect({
      width: box, height: box, left: 0, top: 0,
      fill: 'transparent', stroke: null, strokeWidth: 0,
      originX: 'left', originY: 'top',
      selectable: false, evented: false
    });
    frame.slot = null;

    var group = new fabric.Group([frame].concat(children), {
      originX: 'center',
      originY: 'center',
      kind: 'figure',
      figureName: key,
      figureStyle: 'layered',
      figureColors: palette.slice(),
      figureSize: figSize
    });

    var span = Math.max(group.width || box, group.height || box);
    var unit = figSize / span;
    group.set({ scaleX: unit, scaleY: unit });
    group.setCoords();
    return group;
  };

  api.figureStyles = FIGURE_STYLES;
  api.figureGroups = FIGURE_GROUPS;
  api.figureColorsFor = figureColorsFor;

  /** 한글 도형 이름 — 없으면 키를 그대로 쓴다 */
  api.figureLabel = function (key) {
    return FIGURE_LABELS[key] || key;
  };

  /** 도형의 색 슬롯 이름 — 겹 도형은 여러 개다 */
  api.figureSlotNames = function (key) {
    return figureDef(key).slots.slice();
  };

  api.figureStyleOf = function (obj) {
    if (obj && (obj.figureStyle === 'outline' || obj.figureStyle === 'gradient' ||
      obj.figureStyle === 'layered')) return obj.figureStyle;
    return 'fill';
  };

  /** 도형의 현재 색 배열 — 옛 단색 도형도 한 슬롯짜리로 읽어 준다 */
  api.figureColorsOf = function (obj) {
    if (!obj) return ['#2563eb'];
    if (Array.isArray(obj.figureColors) && obj.figureColors.length) return obj.figureColors.slice();
    if (typeof obj.fill === 'string' && /^#/.test(obj.fill)) return [obj.fill];
    return ['#2563eb'];
  };

  api.figureSizeOf = function (obj) {
    if (!obj) return 120;
    if (obj.figureSize) return Math.round(obj.figureSize);
    if (obj.type === 'group') return Math.round((obj.width || FIGURE_BOX) * (obj.scaleX || 1));
    return Math.round(figureBox(obj.figureName) * (obj.scaleX || 1));
  };

  api.setFigureSize = function (obj, size) {
    if (!obj) return;
    var value = Math.max(8, size || 120);
    var span = (obj.type === 'group')
      ? Math.max(obj.width || FIGURE_BOX, obj.height || FIGURE_BOX)
      : figureBox(obj.figureName);
    var unit = value / span;

    obj.set({ scaleX: unit, scaleY: unit });
    obj.set('figureSize', value);
    obj.setCoords();
  };

  /** 슬롯별 색을 다시 칠한다 — 겹 도형은 자식 경로의 slot 을 따라간다 */
  api.recolorFigure = function (obj, colors, style) {
    if (!obj || obj.kind !== 'figure') return;

    var key = obj.figureName || 'square';
    var activeStyle = style || api.figureStyleOf(obj);
    var list = normaliseFigureColors(colors, key);

    if (obj.type === 'group') {
      obj.getObjects().forEach(function (child) {
        if (child.slot === undefined || child.slot === null) return;
        child.set('fill', list[child.slot] || list[0]);
      });
      activeStyle = 'layered';
    } else if (activeStyle === 'outline') {
      obj.set({ fill: mixColor(list[0], 0.88), stroke: list[0], strokeWidth: obj.strokeWidth || 1.6 });
    } else if (activeStyle === 'gradient') {
      obj.set({ fill: figureGradient(list[0]), stroke: null, strokeWidth: 0 });
    } else {
      obj.set({ fill: list[0], stroke: null, strokeWidth: 0 });
    }

    obj.set({ figureColors: list, figureStyle: activeStyle });
    obj.dirty = true;
    obj.setCoords();
  };

  /** 요소 패널 미리보기용 SVG — 캔버스와 같은 색 규칙을 그대로 그린다 */
  api.figureSvg = function (key, style, colors) {
    var def = figureDef(key);
    var figStyle = style || 'fill';
    var box = figureBox(key);
    var view = ' viewBox="0 0 ' + box + ' ' + box + '"';
    var palette = normaliseFigureColors(colors, key);

    if (def.layers.length === 1) {
      var d = def.layers[0].d;

      if (figStyle === 'outline') {
        return '<svg' + view + '><path d="' + d + '" fill="' +
          mixColor(palette[0], 0.88) + '" stroke="' + palette[0] +
          '" stroke-width="1.4" stroke-linejoin="round"/></svg>';
      }

      if (figStyle === 'gradient') {
        var id = 'fig-grad-' + key;
        return '<svg' + view + '><defs><linearGradient id="' + id +
          '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' +
          mixColor(palette[0], 0.3) + '"/><stop offset="1" stop-color="' +
          mixColor(palette[0], -0.32) + '"/></linearGradient></defs><path d="' + d +
          '" fill="url(#' + id + ')"/></svg>';
      }

      return '<svg' + view + '><path d="' + d + '" fill="' + palette[0] + '"/></svg>';
    }

    var body = def.layers.map(function (layer) {
      var transform = (layer.scale && layer.scale !== 1)
        ? ' style="transform-box:fill-box;transform-origin:center;transform:scale(' +
          layer.scale + ')"'
        : '';
      return '<path d="' + layer.d + '" fill="' +
        (palette[layer.slot] || palette[0]) + '"' + transform + '/>';
    }).join('');

    return '<svg' + view + '>' + body + '</svg>';
  };

  /** 장식 요소 — 아이콘과 같은 경로를 쓰되 종류를 구분해 둔다 */
  api.makeDecor = function (name, size, color) {
    var obj = api.makeIcon(name, size, color);
    obj.set('decorName', name);
    return obj;
  };

  api.makeStar = function (size) {
    return api.makeIcon('star', size, '#f59e0b');
  };

  /** 꼭짓점 수를 지정할 수 있는 별 폴리곤 */
  api.makeStarPolygon = function (size, points, fill) {
    size = size || 140;
    points = points || 5;
    var outer = size / 2;
    var inner = outer * 0.42;
    var coords = [];

    for (var i = 0; i < points * 2; i++) {
      var radius = (i % 2 === 0) ? outer : inner;
      var angle = (Math.PI / points) * i - Math.PI / 2;
      coords.push({
        x: outer + radius * Math.cos(angle),
        y: outer + radius * Math.sin(angle)
      });
    }

    return new fabric.Polygon(coords, {
      left: 0, top: 0,
      fill: fill || '#f59e0b',
      stroke: null, strokeWidth: 0,
      originX: 'left', originY: 'top',
      kind: 'polygon'
    });
  };

  api.makeHexagon = function (size, fill) {
    size = size || 140;
    var r = size / 2;
    var coords = [];

    for (var i = 0; i < 6; i++) {
      var angle = (Math.PI / 3) * i - Math.PI / 6;
      coords.push({ x: r + r * Math.cos(angle), y: r + r * Math.sin(angle) });
    }

    return new fabric.Polygon(coords, {
      left: 0, top: 0,
      fill: fill || '#93c5fd',
      stroke: null, strokeWidth: 0,
      originX: 'left', originY: 'top',
      kind: 'polygon'
    });
  };

  /** 오른쪽을 향하는 화살표 (본체 + 머리) */
  api.makeArrow = function (width, height, fill) {
    width = width || 240;
    height = height || 90;
    var head = width * 0.34;
    var bodyH = height * 0.46;
    var top = (height - bodyH) / 2;
    var color = fill || '#2563eb';

    var body = new fabric.Rect({
      left: 0, top: top,
      width: width - head, height: bodyH,
      fill: color, stroke: null, strokeWidth: 0
    });

    var tip = new fabric.Triangle({
      left: width - head, top: 0,
      width: head, height: height,
      fill: color, stroke: null, strokeWidth: 0,
      angle: 90
    });

    return new fabric.Group([body, tip], { left: 0, top: 0, kind: 'arrow' });
  };

  api.makeChevron = function (size, fill) {
    return api.makeIcon('chevronRight', size, fill || '#2563eb');
  };

  IE.shapes = api;
})(window.IE);
