window.IE = window.IE || {};

(function (IE) {
  'use strict';

  var util = IE.util;

  var THRESHOLD = 6;
  var COLOR = '#ec4899';

  var api = {};

  var active = false;
  var lines = [];

  function docW() { return IE.state.docW; }
  function docH() { return IE.state.docH; }

  /**
   * 객체의 좌표 후보를 바운딩 박스 기준으로 뽑는다.
   * left/top 은 origin/패딩/회전 때문에 실제 보이는 위치와 어긋나므로
   * 반드시 getBoundingRect 로 계산해야 스냅 목표와 보정량이 일치한다.
   */
  function edgesOf(obj) {
    var rect = obj.getBoundingRect(true, true);
    return {
      rect: rect,
      v: [
        { value: rect.left, type: 'left' },
        { value: rect.left + rect.width / 2, type: 'center' },
        { value: rect.left + rect.width, type: 'right' }
      ],
      h: [
        { value: rect.top, type: 'top' },
        { value: rect.top + rect.height / 2, type: 'center' },
        { value: rect.top + rect.height, type: 'bottom' }
      ]
    };
  }

  /** 문서(캔버스) 기준 스냅 후보 */
  function canvasEdges() {
    var w = docW();
    var h = docH();
    return {
      v: [
        { value: 0, type: 'left' },
        { value: w / 2, type: 'center' },
        { value: w, type: 'right' }
      ],
      h: [
        { value: 0, type: 'top' },
        { value: h / 2, type: 'center' },
        { value: h, type: 'bottom' }
      ]
    };
  }

  /**
   * moving 객체를 다른 객체·캔버스의 정렬선과 맞춘다.
   * 맞는 항목이 있으면 left/top 보정량을 돌려주고, 표시할 선을 lines 에 담는다.
   */
  function computeSnap(moving) {
    var canvas = IE.state.canvas;
    var movingEdges = edgesOf(moving);

    var candidatesV = canvasEdges().v.slice();
    var candidatesH = canvasEdges().h.slice();

    var members = (moving.type === 'activeSelection') ? moving.getObjects() : [];

    canvas.getObjects().forEach(function (obj) {
      if (obj === moving) return;
      if (members.indexOf(obj) !== -1) return;
      if (!obj.selectable || obj.visible === false) return;

      var other = edgesOf(obj);
      candidatesV = candidatesV.concat(other.v);
      candidatesH = candidatesH.concat(other.h);
    });

    var bestV = null;
    var bestH = null;

    movingEdges.v.forEach(function (mine) {
      candidatesV.forEach(function (target) {
        var distance = Math.abs(mine.value - target.value);
        if (distance > THRESHOLD) return;
        if (!bestV || distance < bestV.distance) {
          bestV = { distance: distance, delta: target.value - mine.value, value: target.value };
        }
      });
    });

    movingEdges.h.forEach(function (mine) {
      candidatesH.forEach(function (target) {
        var distance = Math.abs(mine.value - target.value);
        if (distance > THRESHOLD) return;
        if (!bestH || distance < bestH.distance) {
          bestH = { distance: distance, delta: target.value - mine.value, value: target.value };
        }
      });
    });

    lines = [];
    if (bestV) lines.push({ axis: 'v', value: bestV.value });
    if (bestH) lines.push({ axis: 'h', value: bestH.value });

    return { dx: bestV ? bestV.delta : 0, dy: bestH ? bestH.delta : 0 };
  }

  function draw(ctx) {
    if (!active || !lines.length) return;

    var canvas = IE.state.canvas;
    var zoom = canvas.getZoom();
    var vpt = canvas.viewportTransform;
    var w = docW();
    var h = docH();

    ctx.save();
    ctx.translate(vpt[4], vpt[5]);
    ctx.scale(zoom, zoom);
    ctx.strokeStyle = COLOR;
    ctx.lineWidth = 1 / zoom;
    ctx.setLineDash([6 / zoom, 4 / zoom]);

    lines.forEach(function (line) {
      ctx.beginPath();
      if (line.axis === 'v') {
        ctx.moveTo(line.value, -h * 0.05);
        ctx.lineTo(line.value, h * 1.05);
      } else {
        ctx.moveTo(-w * 0.05, line.value);
        ctx.lineTo(w * 1.05, line.value);
      }
      ctx.stroke();
    });

    ctx.restore();
  }

  api.onMoving = function (opt) {
    var target = opt.target;
    if (!target) return;

    active = true;

    var snap = computeSnap(target);
    if (snap.dx || snap.dy) {
      if (snap.dx) target.set('left', target.left + snap.dx);
      if (snap.dy) target.set('top', target.top + snap.dy);
      target.setCoords();
    }
  };

  api.onEnd = function () {
    active = false;
    lines = [];
    var canvas = IE.state.canvas;
    if (canvas) canvas.requestRenderAll();
  };

  /** 내보내기 전에 정렬선을 확실히 지운다 (결과물에 섞이지 않게) */
  api.clear = function () {
    active = false;
    lines = [];
  };

  api.isActive = function () {
    return active && lines.length > 0;
  };

  api.init = function () {
    var canvas = IE.state.canvas;

    canvas.on('object:moving', api.onMoving);
    canvas.on('object:scaling', function (opt) {
      if (opt.target) api.onMoving(opt);
    });
    canvas.on('mouse:up', api.onEnd);
    canvas.on('after:render', function () { draw(canvas.contextContainer); });
    canvas.on('selection:cleared', api.onEnd);
  };

  IE.guides = api;
})(window.IE);
