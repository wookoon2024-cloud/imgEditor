window.IE = window.IE || {};

(function (IE) {
  'use strict';

  var util = IE.util;
  var api = {};

  var FONT = 'Pretendard';

  api.FONT = FONT;

  /* ------------------------------------------------------- 그라데이션 */

  var GRADIENT_PRESETS = [
    { id: 'none', label: '없음' },
    { id: 'sky', label: '맑은 하늘', angle: 180, stops: [{ offset: 0, color: '#38bdf8' }, { offset: 0.55, color: '#bae6fd' }, { offset: 1, color: '#f0f9ff' }] },
    { id: 'sky_soft', label: '소프트 하늘', angle: 180, stops: [{ offset: 0, color: '#7dd3fc' }, { offset: 0.7, color: '#e0f2fe' }, { offset: 1, color: '#ffffff' }] },
    { id: 'sky_clouds', label: '구름 하늘', angle: 135, stops: [{ offset: 0, color: '#0284c7' }, { offset: 0.45, color: '#38bdf8' }, { offset: 0.85, color: '#e0f2fe' }, { offset: 1, color: '#ffffff' }] },
    { id: 'blue', label: '파랑', angle: 90, stops: [{ offset: 0, color: '#1d4ed8' }, { offset: 1, color: '#3b82f6' }] },
    { id: 'deep', label: '남색', angle: 120, stops: [{ offset: 0, color: '#0f172a' }, { offset: 1, color: '#1e3a8a' }] },
    { id: 'warm', label: '주황', angle: 120, stops: [{ offset: 0, color: '#f97316' }, { offset: 1, color: '#db2777' }] },
    { id: 'mint', label: '청록', angle: 120, stops: [{ offset: 0, color: '#0d9488' }, { offset: 1, color: '#22d3ee' }] },
    { id: 'gold', label: '금색', angle: 110, stops: [{ offset: 0, color: '#b45309' }, { offset: 1, color: '#f59e0b' }] },
    { id: 'violet', label: '보라', angle: 120, stops: [{ offset: 0, color: '#6d28d9' }, { offset: 1, color: '#c084fc' }] },
    { id: 'gray', label: '회색', angle: 90, stops: [{ offset: 0, color: '#334155' }, { offset: 1, color: '#94a3b8' }] }
  ];

  var gradientPresetById = {};
  GRADIENT_PRESETS.forEach(function (preset) { gradientPresetById[preset.id] = preset; });

  api.gradientPresets = GRADIENT_PRESETS;

  /**
   * fabric 의 gradientUnits:'percentage' 를 쓰면 좌표가 0~1 로 정규화된다
   * (0,0 = 객체 좌상단, 1,1 = 우하단). 각도(0=오른쪽, 90=아래)를 단위벡터로 환산한다.
   */
  api.makeGradient = function (preset) {
    var spec = (typeof preset === 'string') ? gradientPresetById[preset] : preset;
    if (!spec || spec.id === 'none' || !spec.stops) return null;

    var rad = (spec.angle || 0) * Math.PI / 180;
    var dx = Math.cos(rad) / 2;
    var dy = Math.sin(rad) / 2;

    return new fabric.Gradient({
      type: 'linear',
      gradientUnits: 'percentage',
      coords: {
        x1: 0.5 - dx, y1: 0.5 - dy,
        x2: 0.5 + dx, y2: 0.5 + dy
      },
      colorStops: spec.stops.map(function (stop) {
        return { offset: stop.offset, color: stop.color };
      })
    });
  };

  /** 템플릿 정의의 gradient({angle,stops}) 를 fabric 그라데이션으로 변환 */
  function gradientFromDef(def) {
    if (!def.gradient) return null;
    return api.makeGradient(def.gradient);
  }

  var panelsRefreshing = false;

  function notifyPanels() {
    // 패널 갱신이 다시 패널 갱신을 유발하는 순환을 막는다
    if (panelsRefreshing) return;
    if (!IE.panels) return;

    panelsRefreshing = true;
    try {
      IE.panels.refresh();
    } finally {
      panelsRefreshing = false;
    }
  }

  function notifyStatus() {
    if (IE.app) IE.app.updateStatus();
  }

  function addAndSelect(obj) {
    var canvas = IE.state.canvas;
    canvas.add(obj);
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
    IE.state.history.snapshot();
    if (IE.app && IE.app.hideHint) IE.app.hideHint();
    notifyPanels();
    notifyStatus();
  }

  /* ------------------------------------------------------------ 객체 생성 */

  function makeSlot(def) {
    var w = def.width || 200;
    var h = def.height || 160;

    var rect = new fabric.Rect({
      left: 0, top: 0, width: w, height: h,
      fill: def.fill || 'rgba(100, 116, 139, 0.10)',
      stroke: def.stroke || '#94a3b8',
      strokeWidth: def.strokeWidth != null ? def.strokeWidth : 2,
      strokeDashArray: def.strokeDashArray || [10, 7],
      rx: def.rx || 3, ry: def.ry || 3,
      originX: 'left', originY: 'top'
    });

    var labelText = def.label || '이미지';
    var fontSize = Math.max(13, Math.min(30, Math.floor(w / (labelText.length * 0.95))));

    var label = new fabric.Text('▣  ' + labelText, {
      left: w / 2, top: h / 2,
      originX: 'center', originY: 'center',
      fontSize: fontSize,
      fill: def.labelColor || '#64748b',
      fontFamily: FONT,
      selectable: false, evented: false
    });

    var group = new fabric.Group([rect, label], {
      left: def.left || 0,
      top: def.top || 0,
      originX: def.originX || 'left',
      originY: def.originY || 'top',
      angle: def.angle || 0,
      opacity: def.opacity == null ? 1 : def.opacity,
      isSlot: true,
      slotLabel: labelText,
      slotW: w,
      slotH: h,
      transparentCorners: false,
      cornerColor: '#2563eb',
      cornerStyle: 'circle',
      cornerSize: 9,
      borderColor: '#2563eb',
      borderScaleFactor: 1.4
    });

    return group;
  }

  function resolveShadow(def) {
    if (!def) return null;
    if (def.shadow) {
      if (typeof def.shadow === 'object' && !(def.shadow instanceof fabric.Shadow)) {
        return new fabric.Shadow(def.shadow);
      }
      return def.shadow;
    }
    if (IE.properties && IE.properties.shadowFromDef) {
      return IE.properties.shadowFromDef(def);
    }
    return null;
  }

  api.makeObject = function (def) {
    if (!def) return null;
    var obj = null;
    var opacity = def.opacity == null ? 1 : def.opacity;

    switch (def.type) {
      case 'text':
      case 'textbox':
      case 'i-text':
        var textContent = def.text != null ? def.text : (def.type === 'text' ? '텍스트' : '');
        obj = new fabric.Textbox(textContent, {
          left: def.left || 0,
          top: def.top || 0,
          originX: def.originX || 'left',
          originY: def.originY || 'top',
          width: def.width || 400,
          fontFamily: def.fontFamily || FONT,
          fontSize: def.fontSize || 40,
          fontWeight: def.fontWeight || 'normal',
          fontStyle: def.fontStyle || 'normal',
          underline: !!def.underline,
          overline: !!def.overline,
          linethrough: !!def.linethrough,
          fill: def.fill || '#111827',
          textAlign: def.textAlign || 'left',
          lineHeight: def.lineHeight || 1.35,
          charSpacing: def.charSpacing || 0,
          scaleX: def.scaleX == null ? 1 : def.scaleX,
          scaleY: def.scaleY == null ? 1 : def.scaleY,
          angle: def.angle || 0,
          opacity: opacity,
          splitByGrapheme: def.splitByGrapheme !== false,
          editable: true,
          shadow: resolveShadow(def)
        });
        if (def.styles) {
          try {
            obj.styles = JSON.parse(JSON.stringify(def.styles));
          } catch (e) {
            obj.styles = def.styles;
          }
        }
        break;

      case 'image':
        var imgSrc = def.src || def._elementSrc || '';
        if (imgSrc) {
          if (!api._imgCache) api._imgCache = {};
          var imgEl = null;
          if (def._element && (def._element.complete || def._element.naturalWidth > 0)) {
            imgEl = def._element;
          } else if (api._imgCache[imgSrc] && (api._imgCache[imgSrc].complete || api._imgCache[imgSrc].naturalWidth > 0)) {
            imgEl = api._imgCache[imgSrc];
          } else {
            imgEl = api._imgCache[imgSrc] || fabric.util.createImage();
            imgEl.crossOrigin = 'anonymous';
            imgEl.onload = function () {
              if (IE.state && IE.state.canvas) {
                IE.state.canvas.requestRenderAll();
              }
            };
            if (!imgEl.src) imgEl.src = imgSrc;
            api._imgCache[imgSrc] = imgEl;
          }
          obj = new fabric.Image(imgEl, {
            left: def.left || 0,
            top: def.top || 0,
            originX: def.originX || 'left',
            originY: def.originY || 'top',
            width: def.width,
            height: def.height,
            cropX: def.cropX || 0,
            cropY: def.cropY || 0,
            scaleX: def.scaleX == null ? 1 : def.scaleX,
            scaleY: def.scaleY == null ? 1 : def.scaleY,
            angle: def.angle || 0,
            opacity: opacity,
            shadow: resolveShadow(def)
          });
        }
        break;

      case 'rect':
      case 'bg':
      case 'roundrect':
        var rectFill = gradientFromDef(def) || def.fill || '#dbeafe';
        obj = new fabric.Rect({
          left: def.left || 0,
          top: def.top || 0,
          originX: def.originX || 'left',
          originY: def.originY || 'top',
          width: def.width || 100,
          height: def.height || 100,
          scaleX: def.scaleX == null ? 1 : def.scaleX,
          scaleY: def.scaleY == null ? 1 : def.scaleY,
          fill: rectFill,
          stroke: def.stroke || null,
          strokeWidth: def.strokeWidth || 0,
          strokeDashArray: def.strokeDashArray || null,
          rx: def.rx == null ? (def.type === 'roundrect' ? 16 : 0) : def.rx,
          ry: def.ry == null ? (def.type === 'roundrect' ? 16 : 0) : def.ry,
          angle: def.angle || 0,
          opacity: opacity,
          isGuide: !!def.isGuide,
          selectable: !def.isGuide,
          evented: !def.isGuide,
          gradientPreset: def.gradientPreset || null,
          shadow: resolveShadow(def)
        });
        break;

      case 'icon':
        obj = IE.shapes.makeIcon(def.iconName || 'star', def.size || 120,
          def.iconColors || def.fill || '#2563eb', def.iconStyle);
        obj.set({
          left: def.left || 0,
          top: def.top || 0,
          originX: def.originX || 'left',
          originY: def.originY || 'top',
          scaleX: def.scaleX == null ? 1 : def.scaleX,
          scaleY: def.scaleY == null ? 1 : def.scaleY,
          angle: def.angle || 0,
          opacity: opacity,
          shadow: resolveShadow(def)
        });
        break;

      case 'figure':
        obj = IE.shapes.makeFigure(def.figureName || 'square', def.size || 120,
          def.figureColors || def.fill || '#2563eb', def.figureStyle);
        obj.set({
          left: def.left || 0,
          top: def.top || 0,
          originX: def.originX || 'left',
          originY: def.originY || 'top',
          scaleX: def.scaleX == null ? 1 : def.scaleX,
          scaleY: def.scaleY == null ? 1 : def.scaleY,
          angle: def.angle || 0,
          opacity: opacity,
          shadow: resolveShadow(def)
        });
        break;

      case 'polygon':
        obj = IE.shapes.makeHexagon(def.size || 140, def.fill || '#93c5fd');
        obj.set({
          left: def.left || 0,
          top: def.top || 0,
          originX: def.originX || 'left',
          originY: def.originY || 'top',
          scaleX: def.scaleX == null ? 1 : def.scaleX,
          scaleY: def.scaleY == null ? 1 : def.scaleY,
          angle: def.angle || 0,
          opacity: opacity,
          shadow: resolveShadow(def)
        });
        break;

      case 'arrow':
        obj = IE.shapes.makeArrow(def.width || 240, def.height || 90, def.fill || '#2563eb');
        obj.set({
          left: def.left || 0,
          top: def.top || 0,
          originX: def.originX || 'left',
          originY: def.originY || 'top',
          scaleX: def.scaleX == null ? 1 : def.scaleX,
          scaleY: def.scaleY == null ? 1 : def.scaleY,
          angle: def.angle || 0,
          opacity: opacity,
          shadow: resolveShadow(def)
        });
        break;

      case 'circle':
        obj = new fabric.Circle({
          left: def.left || 0,
          top: def.top || 0,
          originX: def.originX || 'left',
          originY: def.originY || 'top',
          radius: def.radius || Math.min(def.width || 100, def.height || 100) / 2,
          scaleX: def.scaleX == null ? 1 : def.scaleX,
          scaleY: def.scaleY == null ? 1 : def.scaleY,
          fill: def.fill || '#dbeafe',
          stroke: def.stroke || null,
          strokeWidth: def.strokeWidth || 0,
          strokeDashArray: def.strokeDashArray || null,
          angle: def.angle || 0,
          opacity: opacity,
          shadow: resolveShadow(def)
        });
        break;

      case 'triangle':
        obj = new fabric.Triangle({
          left: def.left || 0,
          top: def.top || 0,
          originX: def.originX || 'left',
          originY: def.originY || 'top',
          width: def.width || 120,
          height: def.height || 120,
          scaleX: def.scaleX == null ? 1 : def.scaleX,
          scaleY: def.scaleY == null ? 1 : def.scaleY,
          fill: def.fill || '#dbeafe',
          stroke: def.stroke || null,
          strokeWidth: def.strokeWidth || 0,
          strokeDashArray: def.strokeDashArray || null,
          angle: def.angle || 0,
          opacity: opacity,
          shadow: resolveShadow(def)
        });
        break;

      case 'line':
        obj = new fabric.Rect({
          left: def.left || 0,
          top: def.top || 0,
          originX: def.originX || 'left',
          originY: def.originY || 'top',
          width: def.width || 200,
          height: def.height || 6,
          scaleX: def.scaleX == null ? 1 : def.scaleX,
          scaleY: def.scaleY == null ? 1 : def.scaleY,
          fill: def.fill || '#2563eb',
          angle: def.angle || 0,
          opacity: opacity
        });
        break;

      case 'table':
        var tableData = def.tableData || (IE.table && IE.table.create(def));
        if (tableData && IE.table) {
          obj = IE.table.build(tableData, def.left || 0, def.top || 0);
          if (obj && (def.scaleX != null || def.scaleY != null)) {
            obj.set({
              scaleX: def.scaleX == null ? 1 : def.scaleX,
              scaleY: def.scaleY == null ? 1 : def.scaleY,
              angle: def.angle || 0
            });
          }
        }
        break;

      case 'decor':
        obj = IE.shapes.makeDecor(def.decorName || 'divider-line', def.size || 240, def.fill || '#2563eb');
        obj.set({
          left: def.left || 0,
          top: def.top || 0,
          originX: def.originX || 'left',
          originY: def.originY || 'top',
          scaleX: def.scaleX == null ? 1 : def.scaleX,
          scaleY: def.scaleY == null ? 1 : def.scaleY,
          angle: def.angle || 0,
          opacity: opacity
        });
        break;

      case 'slot':
        obj = makeSlot(def);
        break;

      case 'path':
        obj = new fabric.Path(def.path || def.d, {
          left: def.left || 0,
          top: def.top || 0,
          originX: def.originX || 'left',
          originY: def.originY || 'top',
          fill: def.fill || 'transparent',
          stroke: def.stroke || null,
          strokeWidth: def.strokeWidth || 0,
          strokeLineCap: def.strokeLineCap || 'round',
          strokeLineJoin: def.strokeLineJoin || 'round',
          strokeDashArray: def.strokeDashArray || null,
          scaleX: def.scaleX == null ? 1 : def.scaleX,
          scaleY: def.scaleY == null ? 1 : def.scaleY,
          angle: def.angle || 0,
          opacity: opacity,
          selectable: def.selectable !== false,
          evented: def.evented !== false,
          shadow: resolveShadow(def)
        });
        break;

      case 'group':
        if (def.kind === 'table' && def.tableData && IE.table) {
          obj = IE.table.build(def.tableData, def.left || 0, def.top || 0);
          if (obj && (def.scaleX != null || def.scaleY != null)) {
            obj.set({
              scaleX: def.scaleX == null ? 1 : def.scaleX,
              scaleY: def.scaleY == null ? 1 : def.scaleY,
              angle: def.angle || 0
            });
          }
          break;
        }
        var subObjs = (def.objects || []).map(function (subDef) {
          return api.makeObject(subDef);
        }).filter(Boolean);
        obj = new fabric.Group(subObjs, {
          left: def.left || 0,
          top: def.top || 0,
          originX: def.originX || 'left',
          originY: def.originY || 'top',
          scaleX: def.scaleX == null ? 1 : def.scaleX,
          scaleY: def.scaleY == null ? 1 : def.scaleY,
          angle: def.angle || 0,
          opacity: opacity,
          selectable: def.selectable !== false,
          evented: def.evented !== false,
          shadow: resolveShadow(def)
        });
        break;

      default:
        var klassName = fabric.util.string.capitalize(def.type || '');
        if (klassName && typeof fabric[klassName] === 'function') {
          try {
            obj = new fabric[klassName](def);
          } catch (e) {
            obj = null;
          }
        } else {
          obj = null;
        }
    }

    if (obj) {
      if (def.kind) obj.set('kind', def.kind);
      else if (!obj.kind) obj.set('kind', def.type);
      if (def.name) obj.set('name', def.name);
      if (def.isSlot) obj.set('isSlot', true);
      if (def.slotLabel) obj.set('slotLabel', def.slotLabel);
      if (def.tableData) obj.tableData = def.tableData;

      if (def.flipX) obj.set('flipX', true);
      if (def.flipY) obj.set('flipY', true);

      if (def.isLocked || def.lockMovementX) {
        obj.set({
          isLocked: true,
          lockMovementX: true,
          lockMovementY: true,
          lockRotation: true,
          lockScalingX: true,
          lockScalingY: true,
          hasControls: false
        });
      }

      if (util.EXTRA_PROPS && Array.isArray(util.EXTRA_PROPS)) {
        util.EXTRA_PROPS.forEach(function (prop) {
          if (def[prop] !== undefined) {
            obj.set(prop, def[prop]);
          }
        });
      }

      obj.setCoords();
    }
    return obj;
  };

  /* --------------------------------------------------------------- 캔버스 */

  api.createCanvas = function (elementId) {
    var state = IE.state;

    var canvas = new fabric.Canvas(elementId, {
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
      enableRetinaScaling: false,
      selectionColor: 'rgba(37, 99, 235, 0.12)',
      selectionBorderColor: '#2563eb',
      selectionLineWidth: 1
    });

    state.canvas = canvas;
    state.docW = 1240;
    state.docH = 1754;
    state.zoom = 1;
    state.guidesVisible = true;
    state.autoFit = true;
    // 문서/페이지 모듈이 캔버스를 필요로 하므로 여기서 즉시 연결한다
    state.pages = null;
    state.pageIndex = 0;

    canvas.on('object:modified', function (opt) {
      var target = (opt && opt.target) ? opt.target : canvas.getActiveObject();
      if (target && (target.type === 'rect' || target.kind === 'rect' || target.kind === 'roundrect' || target.kind === 'bg')) {
        if (target.scaleX !== 1 || target.scaleY !== 1) {
          var w = Math.round(target.width * Math.abs(target.scaleX));
          var h = Math.round(target.height * Math.abs(target.scaleY));
          target.set({
            width: Math.max(1, w),
            height: Math.max(1, h),
            scaleX: target.scaleX < 0 ? -1 : 1,
            scaleY: target.scaleY < 0 ? -1 : 1
          });
          var maxR = Math.floor(Math.min(w, h) / 2);
          if (target.rx > maxR) target.set({ rx: maxR, ry: maxR });
          target.setCoords();
        }
      }
      state.history.snapshot();
      notifyPanels();
      notifyStatus();
    });

    canvas.on('text:editing:exited', function () {
      state.history.snapshot();
      notifyPanels();
    });

    canvas.on('text:selection:changed', function (opt) {
      var target = (opt && opt.target) ? opt.target : canvas.getActiveObject();
      if (target && target.isEditing) {
        target._lastSelection = {
          start: target.selectionStart,
          end: target.selectionEnd
        };
        notifyPanels();
      }
    });

    canvas.on('selection:created', function () { notifyPanels(); notifyStatus(); });
    canvas.on('selection:updated', function () { notifyPanels(); notifyStatus(); });
    canvas.on('selection:cleared', function () { notifyPanels(); notifyStatus(); });

    canvas.on('mouse:dblclick', function (opt) {
      var target = opt.target || canvas.findTarget(opt.e);

      if (target && (target.kind === 'text' || target.type === 'textbox')) {
        var corner = target._findTargetCorner ? target._findTargetCorner(opt.e) : null;
        var isRightHandle = (corner === 'mr');
        if (!isRightHandle && opt.e && target.getBoundingRect) {
          var pointer = canvas.getPointer(opt.e);
          var bound = target.getBoundingRect();
          // 오른쪽 끝 조절점 근처 (우측 26px 이내) 더블클릭 시 텍스트 너비 맞춤
          if (pointer.x >= (bound.left + bound.width - 26)) {
            isRightHandle = true;
          }
        }
        if (isRightHandle) {
          if (opt.e && opt.e.preventDefault) opt.e.preventDefault();
          if (opt.e && opt.e.stopPropagation) opt.e.stopPropagation();
          api.fitTextboxWidth(target);
          return;
        }
      }

      if (target && target.isSlot) {
        IE.app.pickImageForSlot(target);
        return;
      }
      if (target && target.kind === 'table') {
        IE.table.openEditor(target);
        return;
      }
      if (target && target.kind === 'image') {
        IE.crop.enter(target);
      }
    });

    canvas.on('object:added', function () { notifyStatus(); });
    canvas.on('object:removed', function () { notifyStatus(); });

    if (canvas.upperCanvasEl && typeof canvas.upperCanvasEl.addEventListener === 'function') {
      canvas.upperCanvasEl.addEventListener('contextmenu', function (ev) {
        ev.preventDefault();
        if (ev.stopPropagation) ev.stopPropagation();

        var target = canvas.findTarget ? canvas.findTarget(ev) : null;
        var active = canvas.getActiveObject();

        if (target) {
          if (!active) {
            canvas.setActiveObject(target);
            canvas.requestRenderAll();
            notifyPanels();
            notifyStatus();
          } else if (active !== target && active.type !== 'activeSelection') {
            canvas.setActiveObject(target);
            canvas.requestRenderAll();
            notifyPanels();
            notifyStatus();
          } else if (active.type === 'activeSelection') {
            if (typeof active.getObjects === 'function' && active.getObjects().indexOf(target) === -1) {
              canvas.setActiveObject(target);
              canvas.requestRenderAll();
              notifyPanels();
              notifyStatus();
            }
          }
        }

        api.showContextMenu(ev.clientX, ev.clientY);
      });
    }

    if (typeof document !== 'undefined' && document.getElementById) {
      var canvasHost = document.getElementById('canvas-host') || (canvas.upperCanvasEl && canvas.upperCanvasEl.parentElement);
      if (canvasHost && typeof canvasHost.addEventListener === 'function') {
        canvasHost.addEventListener('contextmenu', function (ev) {
          if (ev.target !== canvas.upperCanvasEl && !(ev.target.closest && ev.target.closest('.canvas-context-menu'))) {
            ev.preventDefault();
            api.showContextMenu(ev.clientX, ev.clientY);
          }
        });
      }
    }

    return canvas;
  };

  api.setDocSize = function (width, height) {
    var canvas = IE.state.canvas;
    IE.state.docW = width;
    IE.state.docH = height;
    canvas.setDimensions({ width: width, height: height });
    canvas.setZoom(1);
    IE.state.zoom = 1;
  };

  api.setZoom = function (zoom) {
    var canvas = IE.state.canvas;
    zoom = util.clamp(zoom, 0.05, 6);
    IE.state.zoom = zoom;
    canvas.setDimensions({
      width: Math.round(IE.state.docW * zoom),
      height: Math.round(IE.state.docH * zoom)
    });
    canvas.setZoom(zoom);
    canvas.requestRenderAll();
    notifyStatus();
    return zoom;
  };

  api.zoomToFit = function (allowUpscale) {
    var stage = util.$('stage');
    if (!stage) return IE.state.zoom;

    var padding = 56;
    var availW = Math.max(120, stage.clientWidth - padding);
    var availH = Math.max(120, stage.clientHeight - padding);
    var zoom = Math.min(availW / IE.state.docW, availH / IE.state.docH);

    // 100% 미만일 때는 화면에 맞추어 축소하고, 100% 이상일 때는 100%로 고정
    if (!allowUpscale && zoom > 1) {
      zoom = 1;
    }

    zoom = util.clamp(zoom, 0.05, 4);

    IE.state.autoFit = true;
    var res = api.setZoom(zoom);
    stage.scrollTop = 0;
    stage.scrollLeft = 0;
    return res;
  };


  /* ------------------------------------------------------------ 문서 관리 */

  api.createDocument = function (width, height, background, objects) {
    var canvas = IE.state.canvas;
    var history = IE.state.history;

    history.locked = true;
    canvas.clear();
    canvas.backgroundColor = background || '#ffffff';
    api.setDocSize(width, height);

    canvas.renderOnAddRemove = false;
    (objects || []).forEach(function (def) {
      var obj = api.makeObject(def);
      if (obj) canvas.add(obj);
    });
    canvas.renderOnAddRemove = true;

    canvas.discardActiveObject();
    canvas.requestRenderAll();

    history.locked = false;
    history.reset();
    history.snapshot();

    api.zoomToFit();
    notifyPanels();
    notifyStatus();
  };

  api.applyTemplate = function (template) {
    // 여러 장짜리 덱 — 문서 전체를 새로 만든다
    if (IE.doc && template.pages && template.pages.length) {
      if (IE.doc.count() > 1) {
        var ok = window.confirm(
          '지금 문서(' + IE.doc.count() + '페이지)를 접고 「' + template.name + '」 ' +
          template.pages.length + '장으로 새로 시작할까요?'
        );
        if (!ok) return false;
      }

      IE.state.docName = template.id;
      IE.doc.newDocumentFromTemplate(template);
      if (IE.pages && typeof IE.pages.setVisible === 'function') {
        IE.pages.setVisible(true);
      }
      util.toast('템플릿 「' + template.name + '」 ' + template.pages.length + '장을 불러왔습니다.');
      return true;
    }

    IE.state.docName = template.id;

    if (IE.doc) {
      // 여러 페이지 문서에서는 페이지 전체를 날리지 않고 현재 페이지만 교체한다
      if (IE.doc.count() > 1) {
        IE.doc.applyTemplateToCurrentPage(
          template.width, template.height, template.background, template.objects
        );
      } else {
        IE.doc.newDocument(
          template.width, template.height, template.background, template.objects
        );
      }
    } else {
      api.createDocument(template.width, template.height, template.background, template.objects);
    }

    util.toast('템플릿 「' + template.name + '」 을(를) 불러왔습니다.');
    return true;
  };

  api.blankDocument = function (width, height) {
    IE.state.docName = 'blank';
    var w = width || 1240;
    var h = height || 1754;

    if (IE.doc) {
      if (IE.doc.count() > 1) {
        IE.doc.applyTemplateToCurrentPage(w, h, '#ffffff', []);
      } else {
        IE.doc.newDocument(w, h, '#ffffff', []);
      }
    } else {
      api.createDocument(w, h, '#ffffff', []);
    }

    util.toast('빈 문서를 만들었습니다.');
  };

  /* ------------------------------------------------------------ 객체 추가 */

  api.addText = function () {
    var w = IE.state.docW;
    var h = IE.state.docH;

    var obj = new fabric.Textbox('텍스트를 입력하세요', {
      left: Math.round(w * 0.12),
      top: Math.round(h * 0.16),
      width: Math.round(w * 0.76),
      fontFamily: FONT,
      fontSize: Math.round(Math.min(w, h) * 0.05),
      fill: '#111827',
      textAlign: 'left',
      lineHeight: 1.35,
      splitByGrapheme: true,
      kind: 'text'
    });

    addAndSelect(obj);
    return obj;
  };

  /**
   * 텍스트박스의 너비를 내용 글자 길이에 딱 맞추어 오른쪽 공백을 제거한다.
   * 오른쪽 가운데 조절점(mr) 더블클릭 또는 패널 버튼 클릭으로 실행된다.
   */
  api.fitTextboxWidth = function (textbox) {
    if (!textbox || !textbox.text) return;

    var maxW = 0;
    if (textbox._textLines && textbox._textLines.length) {
      for (var i = 0; i < textbox._textLines.length; i++) {
        var w = textbox.getLineWidth(i);
        if (w > maxW) maxW = w;
      }
    } else if (textbox.calcTextWidth) {
      maxW = textbox.calcTextWidth();
    }

    if (maxW <= 0) {
      var lines = (textbox.text || '').split('\n');
      var probe = document.createElement('canvas');
      var ctx = probe.getContext('2d');
      ctx.font = (textbox.fontStyle || 'normal') + ' ' + (textbox.fontWeight || 'normal') + ' ' + (textbox.fontSize || 24) + 'px ' + (textbox.fontFamily || 'sans-serif');
      lines.forEach(function (line) {
        maxW = Math.max(maxW, ctx.measureText(line).width);
      });
    }

    if (maxW > 0) {
      textbox.set({
        width: Math.ceil(maxW) + 12,
        scaleX: 1
      });
      textbox.setCoords();
      canvas.requestRenderAll();
      state.history.snapshot();
      notifyPanels();
      notifyStatus();
    }
  };

  /** 텍스트 스타일 프리셋 — 제목/부제목/본문/작은 글씨 */
  var TEXT_PRESETS = {
    title: {
      text: '제목을 입력하세요', ratio: 0.075, weight: 'bold',
      topRatio: 0.20, lineHeight: 1.22, fill: '#111827'
    },
    subtitle: {
      text: '부제목을 입력하세요', ratio: 0.042, weight: 'normal',
      topRatio: 0.32, lineHeight: 1.35, fill: '#3d4049'
    },
    body: {
      text: '내용을 입력하세요. 필요한 문장을 자유롭게 적어 주세요.',
      ratio: 0.030, weight: 'normal', topRatio: 0.42, lineHeight: 1.7, fill: '#3d4049'
    },
    caption: {
      text: '작은 글씨', ratio: 0.022, weight: 'normal',
      topRatio: 0.55, lineHeight: 1.4, fill: '#6a6e7c'
    },
    plain: {
      text: '텍스트를 입력하세요', ratio: 0.050, weight: 'normal',
      topRatio: 0.45, lineHeight: 1.35, fill: '#111827'
    }
  };

  api.addTextPreset = function (kind) {
    var spec = TEXT_PRESETS[kind] || TEXT_PRESETS.plain;
    var w = IE.state.docW;
    var h = IE.state.docH;
    var base = Math.min(w, h);

    var obj = new fabric.Textbox(spec.text, {
      left: Math.round(w * 0.10),
      top: Math.round(h * spec.topRatio),
      width: Math.round(w * 0.80),
      fontFamily: FONT,
      fontSize: Math.max(11, Math.round(base * spec.ratio)),
      fontWeight: spec.weight,
      fill: spec.fill,
      textAlign: 'left',
      lineHeight: spec.lineHeight,
      splitByGrapheme: true,
      kind: 'text'
    });

    addAndSelect(obj);
    return obj;
  };

  /**
   * 기본 도형을 문서 가운데에 놓는다.
   * 색을 주면 그 색으로 채운다 — 안 주면 옅은 바탕에 파란 테두리(예전 모습).
   */
  api.addShape = function (kind, color) {
    var w = IE.state.docW;
    var h = IE.state.docH;
    var size = Math.round(Math.min(w, h) * 0.18);
    var left = Math.round(w / 2 - size / 2);
    var top = Math.round(h / 2 - size / 2);
    var paint = color || '#2563eb';
    var obj;

    if (kind === 'icon' || kind === 'polygon' || kind === 'arrow') {
      if (kind === 'icon') obj = IE.shapes.makeIcon('star', size, paint);
      else if (kind === 'polygon') obj = IE.shapes.makeHexagon(size, paint);
      else obj = IE.shapes.makeArrow(Math.round(size * 1.7), Math.round(size * 0.64), paint);

      obj.set({
        left: Math.round(w / 2 - (obj.width * (obj.scaleX || 1)) / 2),
        top: Math.round(h / 2 - (obj.height * (obj.scaleY || 1)) / 2)
      });

      addAndSelect(obj);
      return obj;
    }

    var base = {
      left: left, top: top,
      fill: color || '#bfdbfe',
      stroke: color ? null : '#2563eb',
      strokeWidth: 0,
      strokeUniform: true,
      opacity: 1, kind: kind
    };

    if (kind === 'circle') {
      obj = new fabric.Circle(Object.assign({}, base, { radius: size / 2 }));
    } else if (kind === 'triangle') {
      obj = new fabric.Triangle(Object.assign({}, base, { width: size, height: size }));
    } else if (kind === 'line') {
      obj = new fabric.Rect({
        left: left, top: top,
        width: size, height: Math.max(4, Math.round(size * 0.04)),
        fill: paint, opacity: 1, kind: 'line'
      });
    } else if (kind === 'pill') {
      var pillW = Math.round(size * 1.6);
      var pillH = Math.round(size * 0.45);
      var pillR = Math.round(pillH / 2);
      obj = new fabric.Rect(Object.assign({}, base, {
        width: pillW, height: pillH, rx: pillR, ry: pillR,
        fill: paint, kind: 'roundrect'
      }));
    } else if (kind === 'btn-circle-chevron') {
      var btnSize = Math.max(48, Math.round(size * 0.55));
      obj = IE.shapes.makeFigure('btnCircleChevron', btnSize, [paint, '#ffffff']);
      obj.set({
        left: Math.round(w / 2),
        top: Math.round(h / 2)
      });
      addAndSelect(obj);
      return obj;
    } else if (kind === 'btn-circle-arrow') {
      var btnSize = Math.max(48, Math.round(size * 0.55));
      obj = IE.shapes.makeFigure('btnCircleArrow', btnSize, [paint, '#ffffff']);
      obj.set({
        left: Math.round(w / 2),
        top: Math.round(h / 2)
      });
      addAndSelect(obj);
      return obj;
    } else if (kind === 'btn-pill-cta') {
      var pillW = Math.max(160, Math.round(size * 1.85));
      var pillH = Math.max(44, Math.round(size * 0.52));
      var pillR = Math.round(pillH / 2);
      var bg = new fabric.Rect({
        width: pillW, height: pillH, rx: pillR, ry: pillR,
        fill: paint, originX: 'left', originY: 'top', left: 0, top: 0
      });
      var badgeR = Math.round(pillH * 0.35);
      var badgeCircle = new fabric.Circle({
        radius: badgeR, fill: '#ffffff',
        originX: 'center', originY: 'center',
        left: pillW - pillR, top: pillH / 2
      });
      var chevScale = (badgeR * 1.05) / 24;
      var chevron = new fabric.Path('M17 12a2.6 2.6 0 0 1 3.7 0l12 10.6a2 2 0 0 1 0 2.8l-12 10.6a2.6 2.6 0 0 1-3.7-3.6l10-8.4-10-8.4a2.6 2.6 0 0 1 0-3.6z', {
        fill: paint, originX: 'center', originY: 'center',
        left: pillW - pillR + 1, top: pillH / 2,
        scaleX: chevScale, scaleY: chevScale
      });
      var text = new fabric.Text('바로가기', {
        fontSize: Math.round(pillH * 0.38),
        fontFamily: 'Pretendard',
        fontWeight: '700',
        fill: '#ffffff',
        originX: 'left', originY: 'center',
        left: Math.round(pillR * 0.8), top: pillH / 2
      });
      obj = new fabric.Group([bg, text, badgeCircle, chevron], {
        left: Math.round(w / 2 - pillW / 2),
        top: Math.round(h / 2 - pillH / 2),
        kind: 'button'
      });
      addAndSelect(obj);
      return obj;
    } else if (kind === 'roundrect') {
      obj = new fabric.Rect(Object.assign({}, base, {
        width: size, height: size, rx: Math.round(size * 0.16), ry: Math.round(size * 0.16)
      }));
    } else {
      obj = new fabric.Rect(Object.assign({}, base, { width: size, height: size, rx: 4, ry: 4 }));
    }

    addAndSelect(obj);
    return obj;
  };

  /** 면 도형(별·하트·다각형·블롭 등)을 문서 가운데에 놓는다 */
  api.addFigure = function (key, color, style) {
    if (key === 'roundSquare') {
      return api.addShape('roundrect', color);
    }
    if (key === 'square') {
      return api.addShape('rect', color);
    }

    var w = IE.state.docW;
    var h = IE.state.docH;
    var size = Math.round(Math.min(w, h) * 0.22);
    var obj = IE.shapes.makeFigure(key, size, color || '#2563eb', style);

    // 도형은 가운데 기준(originX/Y: center)이라 문서 한가운데에 그대로 놓는다
    obj.set({ left: Math.round(w / 2), top: Math.round(h / 2) });
    obj.setCoords();

    addAndSelect(obj);
    return obj;
  };

  /**
   * figure(SVG 경로 기반 사각형/둥근 사각형)를 fabric.Rect(스마트 사각형)로 변환한다.
   * 가로/세로 비율을 늘려도 모서리가 왜곡되지 않고 rx 곡률을 자유롭게 조절할 수 있다.
   */
  api.convertFigureToRect = function (obj, targetRx) {
    if (!obj) return null;
    var canvas = IE.state.canvas;
    if (!canvas) return null;

    var effW = Math.round((obj.width || 0) * (obj.scaleX == null ? 1 : Math.abs(obj.scaleX)));
    var effH = Math.round((obj.height || 0) * (obj.scaleY == null ? 1 : Math.abs(obj.scaleY)));
    effW = Math.max(10, effW);
    effH = Math.max(10, effH);
    var maxR = Math.floor(Math.min(effW, effH) / 2);

    var r;
    if (targetRx === 'pill') {
      r = maxR;
    } else if (targetRx != null) {
      r = Math.min(maxR, Math.max(0, parseInt(targetRx, 10) || 0));
    } else {
      r = (obj.figureName === 'square') ? 0 : Math.min(maxR, 16);
    }

    if (obj.kind === 'rect' || obj.kind === 'roundrect') {
      obj.set({ rx: r, ry: r, scaleX: 1, scaleY: 1, width: effW, height: effH });
      obj.setCoords();
      canvas.requestRenderAll();
      IE.state.history.snapshot();
      return obj;
    }

    var center = (typeof obj.getCenterPoint === 'function') ? obj.getCenterPoint() : { x: obj.left, y: obj.top };

    var fill = obj.fill;
    if (!fill || typeof fill !== 'string' || fill === 'none') {
      var colors = (IE.shapes && typeof IE.shapes.figureColorsOf === 'function')
        ? IE.shapes.figureColorsOf(obj) : null;
      fill = (colors && colors[0]) ? colors[0] : '#2563eb';
    }

    var rect = new fabric.Rect({
      left: center.x,
      top: center.y,
      originX: 'center',
      originY: 'center',
      width: effW,
      height: effH,
      scaleX: 1,
      scaleY: 1,
      angle: obj.angle || 0,
      fill: fill,
      stroke: obj.stroke || null,
      strokeWidth: obj.strokeWidth || 0,
      strokeUniform: true,
      opacity: obj.opacity == null ? 1 : obj.opacity,
      shadow: obj.shadow || null,
      rx: r,
      ry: r,
      kind: 'roundrect'
    });

    var idx = canvas.getObjects().indexOf(obj);
    canvas.remove(obj);
    if (idx !== -1) {
      canvas.insertAt(rect, idx, false);
    } else {
      canvas.add(rect);
    }
    rect.setCoords();
    canvas.setActiveObject(rect);
    canvas.requestRenderAll();
    IE.state.history.snapshot();
    return rect;
  };

  api.addIcon = function (name, colors, style) {
    var w = IE.state.docW;
    var h = IE.state.docH;
    var size = Math.round(Math.min(w, h) * 0.16);
    var obj = IE.shapes.makeIcon(name, size, colors || '#2563eb', style);

    obj.set({
      left: Math.round(w / 2),
      top: Math.round(h / 2)
    });
    obj.setCoords();

    addAndSelect(obj);
    return obj;
  };

  /** 장식 요소(구분선·리본·배지 등)를 문서 중앙에 추가 */
  api.addDecor = function (name, color) {
    var w = IE.state.docW;
    var h = IE.state.docH;
    var size = Math.round(Math.min(w, h) * 0.42);

    var obj = IE.shapes.makeDecor(name, size, color || '#2563eb');
    obj.set({
      left: Math.round((w - size) / 2),
      top: Math.round((h - size) / 2)
    });

    addAndSelect(obj);
    return obj;
  };

  /**
   * 이미지를 캔버스에 올린다.
   * options.cover 를 주면 페이지를 여백 없이 꽉 채우고(배경 사진용),
   * options.back 을 주면 맨 뒤로 보낸다.
   */
  api.addImage = function (dataURL, callback, options) {
    var canvas = IE.state.canvas;
    var opt = options || {};

    fabric.Image.fromURL(dataURL, function (img) {
      var scale;

      if (opt.cover) {
        scale = Math.max(IE.state.docW / img.width, IE.state.docH / img.height);
      } else {
        var maxW = IE.state.docW * 0.6;
        var maxH = IE.state.docH * 0.6;
        scale = Math.min(1, util.fitContain(img.width, img.height, maxW, maxH));
      }

      img.set({
        left: (IE.state.docW - img.width * scale) / 2,
        top: (IE.state.docH - img.height * scale) / 2,
        scaleX: scale,
        scaleY: scale,
        kind: 'image'
      });

      addAndSelect(img);
      if (opt.back) canvas.sendToBack(img);
      if (callback) callback(img);
    });
  };

  /**
   * 프레임(영역)을 꽉 채우는 최소 크롭 영역을 계산한다 (CSS object-fit: cover 와 같은 규칙).
   * 크롭한 뒤 프레임 크기로 확대하면 여백 없이 영역이 채워진다.
   */
  function coverCrop(imageW, imageH, frameW, frameH) {
    var frameRatio = frameW / frameH;
    var cropW;
    var cropH;

    if (imageW / imageH > frameRatio) {
      cropH = imageH;
      cropW = cropH * frameRatio;
    } else {
      cropW = imageW;
      cropH = cropW / frameRatio;
    }

    return {
      x: (imageW - cropW) / 2,
      y: (imageH - cropH) / 2,
      width: cropW,
      height: cropH,
      sourceW: imageW,
      sourceH: imageH
    };
  }

  /** 이미지의 cropX/cropY 를 '구도' 오프셋(-1 ~ 1)으로 옮긴다. */
  function applyCropOffset(img, offsetX, offsetY) {
    var info = img.cropInfo;
    if (!info) return;

    var rangeX = info.sourceW - info.width;
    var rangeY = info.sourceH - info.height;

    img.set({
      cropX: rangeX * (util.clamp(offsetX, -1, 1) + 1) / 2,
      cropY: rangeY * (util.clamp(offsetY, -1, 1) + 1) / 2
    });
  }

  api.fillSlot = function (group, dataURL) {
    var canvas = IE.state.canvas;

    var frame = {
      left: group.left,
      top: group.top,
      width: (group.slotW || group.width) * (group.scaleX || 1),
      height: (group.slotH || group.height) * (group.scaleY || 1),
      angle: group.angle || 0
    };
    var index = canvas.getObjects().indexOf(group);

    fabric.Image.fromURL(dataURL, function (img) {
      var crop = coverCrop(img.width, img.height, frame.width, frame.height);

      img.set({
        cropX: crop.x,
        cropY: crop.y,
        width: crop.width,
        height: crop.height,
        left: frame.left,
        top: frame.top,
        scaleX: frame.width / crop.width,
        scaleY: frame.height / crop.height,
        angle: frame.angle,
        opacity: group.opacity == null ? 1 : group.opacity,
        kind: 'image',
        frameRect: frame,
        cropInfo: crop,
        cropOffsetX: 0,
        cropOffsetY: 0
      });

      canvas.remove(group);
      if (index >= 0) {
        canvas.insertAt(img, Math.min(index, canvas.size()));
      } else {
        canvas.add(img);
      }

      canvas.setActiveObject(img);
      canvas.requestRenderAll();
      IE.state.history.snapshot();
      notifyPanels();
      notifyStatus();
    });
  };

  /** 사진 구도 조절: 프레임은 고정한 채 사진만 상하좌우로 움직인다. */
  api.setCropOffset = function (img, offsetX, offsetY) {
    if (!img || !img.cropInfo) return;

    img.set({
      cropOffsetX: util.clamp(offsetX, -1, 1),
      cropOffsetY: util.clamp(offsetY, -1, 1)
    });
    applyCropOffset(img, img.cropOffsetX, img.cropOffsetY);

    IE.state.canvas.requestRenderAll();
    IE.state.history.snapshotSoon(600);
  };

  /** 이미지를 영역 모양(사각/원형/둥근)으로 잘라 보여준다. */
  api.setClipShape = function (img, shape) {
    if (!img || img.kind !== 'image') return;

    var clip = null;
    var base = { originX: 'center', originY: 'center' };

    if (shape === 'circle') {
      base.radius = Math.min(img.width, img.height) / 2;
      clip = new fabric.Circle(base);
    } else if (shape === 'rounded') {
      base.width = img.width;
      base.height = img.height;
      base.rx = Math.min(img.width, img.height) * 0.12;
      base.ry = base.rx;
      clip = new fabric.Rect(base);
    } else if (shape === 'rect') {
      base.width = img.width;
      base.height = img.height;
      clip = new fabric.Rect(base);
    }

    img.set('clipPath', clip);
    img.set('clipShape', clip ? shape : 'none');
    img.setCoords();

    IE.state.canvas.requestRenderAll();
    IE.state.history.snapshot();
    notifyPanels();
  };

  /* --------------------------------------------------------- 정렬 · 분배 */

  function shiftBy(obj, dx, dy) {
    if (!dx && !dy) return;
    obj.set({ left: obj.left + dx, top: obj.top + dy });
    obj.setCoords();
  }

  function boundingRect(obj) {
    var r = obj.getBoundingRect(true, true);
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  }

  /**
   * 정렬. 대상이 1개면 문서(캔버스) 기준, 2개 이상이면 선택 그룹 기준으로 맞춘다.
   * 회전된 객체도 시각적으로 맞도록 바운딩 박스를 사용한다.
   */
  api.align = function (mode) {
    var canvas = IE.state.canvas;
    var active = canvas.getActiveObject();
    if (!active) return;

    var multi = active.type === 'activeSelection';
    var objects = multi ? active.getObjects().slice() : [active];
    if (!objects.length) return;

    if (multi) {
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    }

    var rects = objects.map(function (obj) { return { obj: obj, rect: boundingRect(obj) }; });

    var minLeft, maxRight, minTop, maxBottom;

    if (objects.length === 1) {
      minLeft = 0;
      maxRight = IE.state.docW;
      minTop = 0;
      maxBottom = IE.state.docH;
    } else {
      minLeft = Math.min.apply(null, rects.map(function (r) { return r.rect.left; }));
      maxRight = Math.max.apply(null, rects.map(function (r) { return r.rect.left + r.rect.width; }));
      minTop = Math.min.apply(null, rects.map(function (r) { return r.rect.top; }));
      maxBottom = Math.max.apply(null, rects.map(function (r) { return r.rect.top + r.rect.height; }));
    }

    var centerX = (minLeft + maxRight) / 2;
    var centerY = (minTop + maxBottom) / 2;

    rects.forEach(function (entry) {
      var rect = entry.rect;
      var dx = 0;
      var dy = 0;

      if (mode === 'left') dx = minLeft - rect.left;
      else if (mode === 'right') dx = maxRight - (rect.left + rect.width);
      else if (mode === 'center-h') dx = centerX - (rect.left + rect.width / 2);
      else if (mode === 'top') dy = minTop - rect.top;
      else if (mode === 'bottom') dy = maxBottom - (rect.top + rect.height);
      else if (mode === 'center-v') dy = centerY - (rect.top + rect.height / 2);

      shiftBy(entry.obj, dx, dy);
    });

    if (multi && objects.length > 1) {
      canvas.setActiveObject(new fabric.ActiveSelection(objects, { canvas: canvas }));
    }

    canvas.requestRenderAll();
    IE.state.history.snapshot();
    notifyPanels();
  };

  /** 3개 이상 선택 시 균등 간격으로 배치한다. */
  api.distribute = function (axis) {
    var canvas = IE.state.canvas;
    var active = canvas.getActiveObject();
    if (!active || active.type !== 'activeSelection') return;

    var objects = active.getObjects().slice();
    if (objects.length < 3) {
      util.toast('균등 배분은 3개 이상 선택해야 합니다.');
      return;
    }

    canvas.discardActiveObject();
    canvas.requestRenderAll();

    var isHorizontal = axis === 'h';
    var entries = objects.map(function (obj) {
      var r = boundingRect(obj);
      return {
        obj: obj,
        rect: r,
        center: isHorizontal ? r.left + r.width / 2 : r.top + r.height / 2
      };
    }).sort(function (a, b) { return a.center - b.center; });

    var first = entries[0].rect;
    var last = entries[entries.length - 1].rect;
    var start = isHorizontal ? first.left + first.width / 2 : first.top + first.height / 2;
    var end = isHorizontal ? last.left + last.width / 2 : last.top + last.height / 2;
    var gap = (end - start) / (entries.length - 1);

    entries.forEach(function (entry, i) {
      var target = start + gap * i;
      if (isHorizontal) shiftBy(entry.obj, target - entry.center, 0);
      else shiftBy(entry.obj, 0, target - entry.center);
    });

    canvas.setActiveObject(new fabric.ActiveSelection(objects, { canvas: canvas }));
    canvas.requestRenderAll();
    IE.state.history.snapshot();
    notifyPanels();
  };

  /**
   * 선택된 이미지의 그림만 교체한다.
   * 영역에 넣은 사진(프레임 정보가 있는 경우)은 프레임 비율을 유지한 채 새 사진을 다시 맞춘다.
   */
  api.replaceImage = function (target, dataURL) {
    var canvas = IE.state.canvas;
    var frame = target.frameRect || null;

    fabric.Image.fromURL(dataURL, function (img) {
      var props = {
        angle: target.angle || 0,
        opacity: target.opacity,
        kind: 'image',
        clipShape: target.clipShape || 'none',
        clipPath: target.clipPath || null
      };

      if (frame) {
        var crop = coverCrop(img.width, img.height, frame.width, frame.height);
        props.cropX = crop.x;
        props.cropY = crop.y;
        props.width = crop.width;
        props.height = crop.height;
        props.left = frame.left;
        props.top = frame.top;
        props.scaleX = frame.width / crop.width;
        props.scaleY = frame.height / crop.height;
        props.frameRect = frame;
        props.cropInfo = crop;
        props.cropOffsetX = 0;
        props.cropOffsetY = 0;
      } else {
        var boxW = target.width * (target.scaleX || 1);
        var boxH = target.height * (target.scaleY || 1);
        var scale = util.fitContain(img.width, img.height, boxW, boxH);
        props.left = target.left + (boxW - img.width * scale) / 2;
        props.top = target.top + (boxH - img.height * scale) / 2;
        props.scaleX = scale;
        props.scaleY = scale;
      }

      img.set(props);

      var index = canvas.getObjects().indexOf(target);
      canvas.remove(target);
      if (index >= 0) {
        canvas.insertAt(img, Math.min(index, canvas.size()));
      } else {
        canvas.add(img);
      }

      if (props.clipShape && props.clipShape !== 'none') {
        api.setClipShape(img, props.clipShape);
      }

      canvas.setActiveObject(img);
      canvas.requestRenderAll();
      IE.state.history.snapshot();
      notifyPanels();
      notifyStatus();
    });
  };

  /**
   * 같은 객체를 유지한 채 이미지 픽셀만 바꾼다 (누끼 적용 등).
   * 원본 크기가 같으면 크롭·프레임·자르기 모양이 그대로 유지된다.
   */
  api.setImageSource = function (target, dataURL, done) {
    if (!target || target.kind !== 'image') {
      if (done) done(null);
      return;
    }

    var frame = target.frameRect || null;
    var info = target.cropInfo || null;
    var oldSourceW = (info && info.sourceW) || target.width;
    var oldSourceH = (info && info.sourceH) || target.height;

    fabric.Image.fromURL(dataURL, function (fresh) {
      target.setElement(fresh.getElement());
      target.set('src', dataURL);
      target.set({ width: fresh.width, height: fresh.height });

      var naturalW = fresh.width;
      var naturalH = fresh.height;

      if (info) {
        var ratioX = naturalW / (oldSourceW || naturalW);
        var ratioY = naturalH / (oldSourceH || naturalH);

        info.width = Math.min(info.width * ratioX, naturalW);
        info.height = Math.min(info.height * ratioY, naturalH);
        info.sourceW = naturalW;
        info.sourceH = naturalH;
        info.x = util.clamp(info.x * ratioX, 0, Math.max(0, naturalW - info.width));
        info.y = util.clamp(info.y * ratioY, 0, Math.max(0, naturalH - info.height));

        target.set({
          cropX: info.x,
          cropY: info.y,
          width: info.width,
          height: info.height
        });

        var boxW = frame ? frame.width : info.width;
        var boxH = frame ? frame.height : info.height;

        target.set({
          left: frame ? frame.left : target.left,
          top: frame ? frame.top : target.top,
          scaleX: boxW / info.width,
          scaleY: boxH / info.height
        });
      }

      if (target.clipPath) {
        target.clipPath.set({
          width: target.width * (target.scaleX || 1),
          height: target.height * (target.scaleY || 1)
        });
      }

      target.setCoords();
      IE.state.canvas.requestRenderAll();
      IE.state.history.snapshot();
      notifyPanels();
      notifyStatus();

      if (done) done(target);
    }, { crossOrigin: null });
  };

  /* ------------------------------------------------- 그라데이션 · 그림자 */

  api.setGradient = function (obj, presetId) {
    if (!obj) return;

    if (presetId === 'none' || !presetId) {
      obj.set('fill', obj.gradientPreset && gradientPresetById[obj.gradientPreset]
        ? gradientSolidFallback(obj)
        : obj.fill);
      obj.set('gradientPreset', null);
    } else {
      var gradient = api.makeGradient(presetId);
      if (!gradient) return;
      obj.set('fill', gradient);
      obj.set('gradientPreset', presetId);
    }

    IE.state.canvas.requestRenderAll();
    IE.state.history.snapshot();
    notifyPanels();
  };

  /** 그라데이션을 해제할 때 채울 단색 (프리셋 첫 색으로 되돌린다) */
  function gradientSolidFallback(obj) {
    var preset = gradientPresetById[obj.gradientPreset];
    if (preset && preset.stops && preset.stops.length) return preset.stops[0].color;
    return '#dbeafe';
  }

  api.setShadow = function (obj, spec) {
    if (!obj) return;

    if (!spec || spec.id === 'none') {
      obj.set('shadow', null);
      obj.set('shadowPreset', null);
    } else {
      obj.set('shadow', new fabric.Shadow({
        color: spec.color || 'rgba(15,23,42,0.35)',
        blur: spec.blur == null ? 12 : spec.blur,
        offsetX: spec.offsetX == null ? 4 : spec.offsetX,
        offsetY: spec.offsetY == null ? 6 : spec.offsetY
      }));
      obj.set('shadowPreset', spec.id);
    }

    IE.state.canvas.requestRenderAll();
    IE.state.history.snapshot();
    notifyPanels();
  };

  /* ------------------------------------------------------- 복사 · 붙여넣기 */

  var clipboard = null;

  api.copyActive = function () {
    var canvas = IE.state.canvas;
    var targets = canvas.getActiveObjects();
    if (!targets.length) return 0;

    clipboard = targets.map(function (obj) {
      return obj.toObject(util.EXTRA_PROPS);
    });

    util.toast(clipboard.length + '개 복사됨');
    return clipboard.length;
  };

  api.hasClipboard = function () {
    return !!(clipboard && clipboard.length);
  };

  /** enliven 이 복원하지 않는 커스텀 속성을 직렬화 데이터에서 되살린다 */
  function restoreExtras(obj, data) {
    util.EXTRA_PROPS.forEach(function (key) {
      if (data[key] !== undefined) obj.set(key, data[key]);
    });
    return obj;
  }

  api.paste = function () {
    if (!clipboard || !clipboard.length) return 0;

    var canvas = IE.state.canvas;
    var added = [];
    var pending = clipboard.length;

    clipboard.forEach(function (data) {
      // 3번째 인자는 namespace, 4번째가 reviver 다 (여기에 속성 배열을 넘기면 안 된다)
      fabric.util.enlivenObjects([data], function (objects) {
        objects.forEach(function (obj) {
          restoreExtras(obj, data);
          obj.set({
            left: (obj.left || 0) + 28,
            top: (obj.top || 0) + 28
          });
          obj.setCoords();
          canvas.add(obj);
          added.push(obj);
        });

        pending -= 1;
        if (pending > 0) return;

        canvas.discardActiveObject();
        if (added.length === 1) {
          canvas.setActiveObject(added[0]);
        } else if (added.length > 1) {
          canvas.setActiveObject(new fabric.ActiveSelection(added, { canvas: canvas }));
        }

        canvas.requestRenderAll();
        IE.state.history.snapshot();
        notifyPanels();
        notifyStatus();
      }, null, null);
    });

    return clipboard.length;
  };

  /** 방향키로 선택 객체를 미세 이동 (shift 면 크게) */
  api.nudge = function (dx, dy) {
    var canvas = IE.state.canvas;
    var active = canvas.getActiveObject();
    if (!active) return false;

    if (active.type === 'activeSelection') {
      active.getObjects().forEach(function (obj) {
        obj.set({ left: obj.left + dx, top: obj.top + dy });
        obj.setCoords();
      });
      active.setCoords();
    } else {
      active.set({ left: active.left + dx, top: active.top + dy });
      active.setCoords();
    }

    canvas.requestRenderAll();
    IE.state.history.snapshotSoon(500);
    if (IE.app) IE.app.updateStatus();
    return true;
  };

  /* ------------------------------------------------------------ 편집 동작 */

  api.deleteActive = function () {
    var canvas = IE.state.canvas;
    var targets = canvas.getActiveObjects();
    if (!targets.length) return false;

    targets.forEach(function (obj) { canvas.remove(obj); });
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    IE.state.history.snapshot();
    notifyPanels();
    notifyStatus();
    return true;
  };

  api.duplicateActive = function () {
    var canvas = IE.state.canvas;
    var target = canvas.getActiveObject();
    if (!target) return false;

    if (target.type === 'activeSelection') {
      target.clone(function (cloned) {
        cloned.canvas = canvas;
        var added = [];
        cloned.forEachObject(function (obj) {
          obj.set({
            left: (obj.left || 0) + 24,
            top: (obj.top || 0) + 24
          });
          obj.setCoords();
          canvas.add(obj);
          added.push(obj);
        });
        canvas.discardActiveObject();
        if (added.length > 1) {
          canvas.setActiveObject(new fabric.ActiveSelection(added, { canvas: canvas }));
        } else if (added.length === 1) {
          canvas.setActiveObject(added[0]);
        }
        canvas.requestRenderAll();
        IE.state.history.snapshot();
        notifyPanels();
        notifyStatus();
      }, util.EXTRA_PROPS);
      return true;
    }

    target.clone(function (clone) {
      clone.set({
        left: (target.left || 0) + 24,
        top: (target.top || 0) + 24,
        kind: target.kind
      });
      canvas.add(clone);
      canvas.setActiveObject(clone);
      canvas.requestRenderAll();
      IE.state.history.snapshot();
      notifyPanels();
      notifyStatus();
    }, util.EXTRA_PROPS);

    return true;
  };

  /** 다중 선택된 객체들을 하나의 그룹으로 묶는다 (Ctrl+G) */
  api.groupActive = function () {
    var canvas = IE.state.canvas;
    var active = canvas.getActiveObject();
    if (!active || active.type !== 'activeSelection') {
      util.toast('그룹화하려면 2개 이상의 객체를 선택해 주세요.');
      return null;
    }

    var group = active.toGroup();
    group.kind = 'group';
    group.name = '그룹 (' + group.getObjects().length + '개)';
    canvas.setActiveObject(group);
    canvas.requestRenderAll();
    IE.state.history.snapshot();
    notifyPanels();
    notifyStatus();
    util.toast('선택한 ' + group.getObjects().length + '개 객체를 그룹화했습니다. (Ctrl+Shift+G 로 해제)');
    return group;
  };

  /** 그룹 객체를 개별 객체들로 분리한다 (Ctrl+Shift+G) */
  api.ungroupActive = function () {
    var canvas = IE.state.canvas;
    var active = canvas.getActiveObject();
    if (!active) {
      util.toast('그룹 해제할 그룹 객체를 선택해 주세요.');
      return null;
    }

    if (active.type === 'group' && typeof active.toActiveSelection === 'function') {
      var count = active.getObjects().length;
      var activeSelection = active.toActiveSelection();
      canvas.setActiveObject(activeSelection);
      canvas.requestRenderAll();
      IE.state.history.snapshot();
      notifyPanels();
      notifyStatus();
      util.toast('그룹을 해제했습니다. (' + count + '개 분리)');
      return activeSelection;
    } else {
      util.toast('선택된 객체가 그룹이 아닙니다.');
      return null;
    }
  };

  /** 선택된 객체(들)의 이동 및 크기 조절을 잠그거나 해제한다 (Ctrl+L) */
  api.toggleLockActive = function () {
    var canvas = IE.state.canvas;
    var active = canvas.getActiveObject();
    if (!active) return;

    var multi = active.type === 'activeSelection';
    var objects = multi ? active.getObjects() : [active];
    if (!objects.length) return;

    var currentlyLocked = objects.some(function (obj) { return obj.isLocked || obj.lockMovementX; });
    var newLockState = !currentlyLocked;

    objects.forEach(function (obj) {
      obj.isLocked = newLockState;
      obj.lockMovementX = newLockState;
      obj.lockMovementY = newLockState;
      obj.lockRotation = newLockState;
      obj.lockScalingX = newLockState;
      obj.lockScalingY = newLockState;
      obj.hasControls = !newLockState;
    });

    if (multi) {
      active.lockMovementX = newLockState;
      active.lockMovementY = newLockState;
      active.lockRotation = newLockState;
      active.lockScalingX = newLockState;
      active.lockScalingY = newLockState;
      active.hasControls = !newLockState;
    }

    canvas.requestRenderAll();
    IE.state.history.snapshot();
    notifyPanels();
    notifyStatus();
    util.toast(newLockState ? '선택한 객체를 잠갔습니다. (Ctrl+L 로 해제)' : '선택한 객체의 잠금을 해제했습니다.');
  };

  api.reorder = function (direction) {
    var canvas = IE.state.canvas;
    var target = canvas.getActiveObject();
    if (!target) return;

    if (target.type === 'activeSelection') {
      var objs = target.getObjects().slice();
      if (direction === 'down' || direction === 'back') objs.reverse();
      objs.forEach(function (obj) {
        if (direction === 'up') canvas.bringForward(obj);
        else if (direction === 'down') canvas.sendBackwards(obj);
        else if (direction === 'front') canvas.bringToFront(obj);
        else if (direction === 'back') canvas.sendToBack(obj);
      });
    } else {
      if (direction === 'up') canvas.bringForward(target);
      else if (direction === 'down') canvas.sendBackwards(target);
      else if (direction === 'front') canvas.bringToFront(target);
      else if (direction === 'back') canvas.sendToBack(target);
    }

    canvas.requestRenderAll();
    IE.state.history.snapshot();
    notifyPanels();
  };

  api.setGuidesVisible = function (visible) {
    IE.state.guidesVisible = !!visible;
    var canvas = IE.state.canvas;
    canvas.getObjects().forEach(function (obj) {
      if (obj.isGuide) obj.set('visible', !!visible);
    });
    canvas.requestRenderAll();
    notifyStatus();
  };

  /** 편집 화면 전용 객체(내보내기에서 제외): 가이드 선, 아직 채우지 않은 이미지 영역 */
  api.editorOnly = function (obj) {
    return !!(obj && (obj.isGuide || obj.isSlot));
  };

  api.guidesHidden = function (fn) {
    var canvas = IE.state.canvas;
    var hidden = [];
    canvas.getObjects().forEach(function (obj) {
      if (api.editorOnly(obj) && obj.visible !== false) {
        obj.set('visible', false);
        hidden.push(obj);
      }
    });
    try {
      fn();
    } finally {
      hidden.forEach(function (obj) { obj.set('visible', true); });
    }
  };

  /* ------------------------------------------------------- 레이어 표시용 정보 */

  api.labelOf = function (obj) {
    if (obj.isGuide) return '가이드 (내보내기 제외)';
    if (obj.isSlot) return '이미지 영역 · ' + (obj.slotLabel || '');
    if (obj.kind === 'text') {
      var text = String(obj.text || '').replace(/\s+/g, ' ').trim();
      return text.length > 16 ? text.slice(0, 16) + '…' : (text || '텍스트');
    }
    if (obj.kind === 'image') return '이미지 (사진)';
    if (obj.kind === 'bg') return '배경';
    if (obj.kind === 'rect') return '사각형';
    if (obj.kind === 'roundrect') return '둥근 사각형';
    if (obj.kind === 'circle') return '원';
    if (obj.kind === 'triangle') return '삼각형';
    if (obj.kind === 'line') return '선';
    if (obj.kind === 'polygon') return '다각형';
    if (obj.kind === 'arrow') return '화살표';
    if (obj.kind === 'icon') return '요소 · ' + (obj.iconName || '');
    if (obj.kind === 'figure') return '도형 · ' + IE.shapes.figureLabel(obj.figureName || '');
    if (obj.type === 'group' || obj.kind === 'group') {
      var count = obj.getObjects ? obj.getObjects().length : 0;
      return obj.name || ('그룹 (' + count + '개)');
    }
    if (obj.kind === 'table') {
      var t = obj.tableData;
      return '표 ' + (t ? t.rows + '×' + t.cols : '');
    }
    return obj.type || '객체';
  };

  api.iconOf = function (obj) {
    if (obj.isGuide) return '⌗';
    if (obj.isSlot) return '▣';
    if (obj.kind === 'text') return 'T';
    if (obj.kind === 'image') return '▤';
    if (obj.type === 'group' || obj.kind === 'group') return '⧉';
    if (obj.kind === 'bg') return '▦';
    if (obj.kind === 'circle') return '○';
    if (obj.kind === 'triangle') return '△';
    if (obj.kind === 'line') return '─';
    if (obj.kind === 'polygon') return '⬡';
    if (obj.kind === 'arrow') return '➜';
    if (obj.kind === 'icon') return '★';
    if (obj.kind === 'figure') return '◆';
    if (obj.kind === 'table') return '▦';
    if (obj.kind === 'roundrect') return '▢';
    return '□';
  };

  /**
   * 다중 선택이면 첫 객체를 기준으로 공통 속성만 다룬다.
   * (fabric 의 다중 선택은 그룹 객체라서 개별 편집이 복잡해진다)
   */
  api.editableTarget = function () {
    var canvas = IE.state.canvas;
    var active = canvas.getActiveObject();
    if (!active) return null;
    if (active.type === 'activeSelection') {
      return { selection: true, objects: active.getObjects(), ref: active };
    }
    return { selection: false, objects: [active], ref: active };
  };

  /* ------------------------------------------------ 캔버스 우클릭 메뉴 */

  var activeContextMenu = null;

  api.closeContextMenu = function () {
    if (activeContextMenu && activeContextMenu.parentNode) {
      activeContextMenu.parentNode.removeChild(activeContextMenu);
    }
    activeContextMenu = null;
    if (typeof window !== 'undefined') {
      window.removeEventListener('click', api.closeContextMenu);
      window.removeEventListener('keydown', onMenuKey);
    }
  };

  function onMenuKey(ev) {
    if (ev.key === 'Escape') api.closeContextMenu();
  }

  api.showContextMenu = function (clientX, clientY) {
    api.closeContextMenu();

    if (typeof document === 'undefined') return;

    var canvas = IE.state.canvas;
    if (!canvas) return;

    var active = canvas.getActiveObject();
    var menu = document.createElement('div');
    menu.className = 'canvas-context-menu';

    var items = [];

    if (active && active.type === 'activeSelection') {
      var count = typeof active.getObjects === 'function' ? active.getObjects().length : 2;
      var multiLocked = typeof active.getObjects === 'function' && active.getObjects().some(function (o) { return o.isLocked || o.lockMovementX; });
      items.push({
        id: 'group',
        label: '그룹화 (' + count + '개)',
        shortcut: 'Ctrl+G',
        icon: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M10 6.5h4M6.5 10v4M17.5 10v4M10 17.5h4" stroke-dasharray="2 2"/></svg>',
        isPrimary: true,
        action: function () { api.groupActive(); }
      });
      items.push({
        id: 'lock',
        label: multiLocked ? '선택 잠금 해제' : '선택 잠금',
        shortcut: 'Ctrl+L',
        icon: '<svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
        action: function () { api.toggleLockActive(); }
      });
      items.push('sep');
      items.push({
        id: 'dup',
        label: '복제',
        shortcut: 'Ctrl+D',
        icon: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
        action: function () { api.duplicateActive(); }
      });
      items.push({
        id: 'copy',
        label: '복사',
        shortcut: 'Ctrl+C',
        icon: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
        action: function () { api.copy(); }
      });
      items.push('sep');
      items.push({
        id: 'front',
        label: '맨 앞으로',
        shortcut: 'Ctrl+]',
        icon: '<svg viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
        action: function () { api.reorder('front'); }
      });
      items.push({
        id: 'back',
        label: '맨 뒤로',
        shortcut: 'Ctrl+[',
        icon: '<svg viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2" opacity="0.4"/><polyline points="2 12 12 17 22 12" opacity="0.4"/><polyline points="2 17 12 22 22 17"/></svg>',
        action: function () { api.reorder('back'); }
      });
      items.push('sep');
      items.push({
        id: 'del',
        label: '삭제',
        shortcut: 'Delete',
        icon: '<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
        danger: true,
        action: function () { api.deleteActive(); }
      });
    } else if (active && (active.type === 'group' || active.kind === 'group')) {
      var isGroupLocked = active.isLocked || active.lockMovementX;
      items.push({
        id: 'ungroup',
        label: '그룹 해제',
        shortcut: 'Ctrl+Shift+G',
        icon: '<svg viewBox="0 0 24 24"><rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="14" width="8" height="8" rx="1"/><path d="M7 17l10-10M13 7h4v4M11 17H7v-4"/></svg>',
        isPrimary: true,
        action: function () { api.ungroupActive(); }
      });
      items.push({
        id: 'lock',
        label: isGroupLocked ? '잠금 해제' : '잠금',
        shortcut: 'Ctrl+L',
        icon: '<svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
        action: function () { api.toggleLockActive(); }
      });
      items.push('sep');
      items.push({
        id: 'dup',
        label: '복제',
        shortcut: 'Ctrl+D',
        icon: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
        action: function () { api.duplicateActive(); }
      });
      items.push({
        id: 'copy',
        label: '복사',
        shortcut: 'Ctrl+C',
        icon: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
        action: function () { api.copy(); }
      });
      items.push('sep');
      items.push({
        id: 'front',
        label: '맨 앞으로',
        shortcut: 'Ctrl+]',
        icon: '<svg viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
        action: function () { api.reorder('front'); }
      });
      items.push({
        id: 'back',
        label: '맨 뒤로',
        shortcut: 'Ctrl+[',
        icon: '<svg viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2" opacity="0.4"/><polyline points="2 12 12 17 22 12" opacity="0.4"/><polyline points="2 17 12 22 22 17"/></svg>',
        action: function () { api.reorder('back'); }
      });
      items.push('sep');
      items.push({
        id: 'del',
        label: '삭제',
        shortcut: 'Delete',
        icon: '<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
        danger: true,
        action: function () { api.deleteActive(); }
      });
    } else if (active) {
      var isSingleLocked = active.isLocked || active.lockMovementX;
      items.push({
        id: 'lock',
        label: isSingleLocked ? '잠금 해제' : '잠금',
        shortcut: 'Ctrl+L',
        icon: '<svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
        action: function () { api.toggleLockActive(); }
      });
      items.push('sep');
      items.push({
        id: 'dup',
        label: '복제',
        shortcut: 'Ctrl+D',
        icon: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
        action: function () { api.duplicateActive(); }
      });
      items.push({
        id: 'copy',
        label: '복사',
        shortcut: 'Ctrl+C',
        icon: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
        action: function () { api.copy(); }
      });
      items.push('sep');
      items.push({
        id: 'up',
        label: '한 단계 앞으로',
        shortcut: ']',
        icon: '<svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>',
        action: function () { api.reorder('up'); }
      });
      items.push({
        id: 'down',
        label: '한 단계 뒤로',
        shortcut: '[',
        icon: '<svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>',
        action: function () { api.reorder('down'); }
      });
      items.push({
        id: 'front',
        label: '맨 앞으로',
        shortcut: 'Ctrl+]',
        icon: '<svg viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
        action: function () { api.reorder('front'); }
      });
      items.push({
        id: 'back',
        label: '맨 뒤로',
        shortcut: 'Ctrl+[',
        icon: '<svg viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2" opacity="0.4"/><polyline points="2 12 12 17 22 12" opacity="0.4"/><polyline points="2 17 12 22 22 17"/></svg>',
        action: function () { api.reorder('back'); }
      });
      items.push('sep');
      items.push({
        id: 'centerH',
        label: '가로 중앙 정렬',
        icon: '<svg viewBox="0 0 24 24"><line x1="12" y1="3" x2="12" y2="21"/><rect x="6" y="7" width="12" height="10" rx="1"/></svg>',
        action: function () { api.align('center-h'); }
      });
      items.push({
        id: 'centerV',
        label: '세로 중앙 정렬',
        icon: '<svg viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><rect x="7" y="6" width="10" height="12" rx="1"/></svg>',
        action: function () { api.align('center-v'); }
      });
      items.push('sep');
      items.push({
        id: 'del',
        label: '삭제',
        shortcut: 'Delete',
        icon: '<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
        danger: true,
        action: function () { api.deleteActive(); }
      });
    } else {
      // 빈 캔버스 바탕
      items.push({
        id: 'paste',
        label: '붙여넣기',
        shortcut: 'Ctrl+V',
        icon: '<svg viewBox="0 0 24 24"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>',
        action: function () { api.paste(); }
      });
      items.push({
        id: 'selectAll',
        label: '모든 객체 선택',
        shortcut: 'Ctrl+A',
        icon: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="3 3"/></svg>',
        action: function () {
          var objects = canvas.getObjects().filter(function (o) { return o.selectable && o.visible !== false; });
          if (objects.length) {
            canvas.setActiveObject(new fabric.ActiveSelection(objects, { canvas: canvas }));
            canvas.requestRenderAll();
            notifyPanels();
            notifyStatus();
          }
        }
      });
      items.push('sep');
      items.push({
        id: 'zoomFit',
        label: '화면에 맞춤',
        shortcut: '0',
        icon: '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
        action: function () { api.zoomFit(); }
      });
    }

    var html = '';
    items.forEach(function (item, idx) {
      if (item === 'sep') {
        html += '<div class="page-context-sep"></div>';
        return;
      }
      var cls = 'canvas-context-item' + (item.danger ? ' danger' : '') + (item.isPrimary ? ' is-primary' : '');
      html += '<button type="button" class="' + cls + '" data-act-idx="' + idx + '">' +
        item.icon +
        '<span>' + item.label + '</span>' +
        (item.shortcut ? '<span class="canvas-context-shortcut">' + item.shortcut + '</span>' : '') +
        '</button>';
    });

    menu.innerHTML = html;

    menu.addEventListener('click', function (ev) {
      var btn = ev.target.closest('.canvas-context-item');
      if (!btn) return;
      var idx = parseInt(btn.getAttribute('data-act-idx'), 10);
      var item = items[idx];
      if (item && typeof item.action === 'function') {
        api.closeContextMenu();
        item.action();
      }
    });

    document.body.appendChild(menu);
    activeContextMenu = menu;

    var posX = clientX;
    var posY = clientY;
    var rect = menu.getBoundingClientRect();
    if (typeof window !== 'undefined') {
      if (posX + rect.width > window.innerWidth - 8) posX = window.innerWidth - rect.width - 8;
      if (posY + rect.height > window.innerHeight - 8) posY = window.innerHeight - rect.height - 8;
      if (posX < 8) posX = 8;
      if (posY < 8) posY = 8;
    }
    menu.style.left = posX + 'px';
    menu.style.top = posY + 'px';

    if (typeof window !== 'undefined') {
      setTimeout(function () {
        window.addEventListener('click', api.closeContextMenu);
        window.addEventListener('keydown', onMenuKey);
      }, 10);
    }
  };

  IE.canvas = api;
})(window.IE);
