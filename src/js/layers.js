window.IE = window.IE || {};

(function (IE) {
  'use strict';

  var util = IE.util;

  var dragSourceVisualIndex = -1;

  function refresh() {
    var canvas = IE.state.canvas;
    if (!canvas) return;

    var list = util.$('layer-list');
    var empty = util.$('layers-empty');
    var objects = canvas.getObjects().slice().reverse();
    var activeObjects = canvas.getActiveObjects();

    empty.hidden = objects.length > 0;

    var html = '';
    objects.forEach(function (obj, visualIdx) {
      var index = canvas.getObjects().indexOf(obj);
      var isActive = activeObjects.indexOf(obj) !== -1;
      var hidden = obj.visible === false;
      var locked = !!(obj.isLocked || obj.lockMovementX);

      html += '<div class="layer-item' + (isActive ? ' is-active' : '') + '" data-index="' + index + '" data-visual="' + visualIdx + '" draggable="true">' +
        '<span class="layer-drag-handle" title="드래그하여 순서 변경">⋮⋮</span>' +
        '<span class="layer-ico">' + IE.canvas.iconOf(obj) + '</span>' +
        '<span class="layer-name">' + util.escapeHtml(IE.canvas.labelOf(obj)) + '</span>' +
        '<button class="layer-lock' + (locked ? ' is-locked' : '') + '" data-lock="' + index +
          '" title="' + (locked ? '잠금 해제' : '잠금') + '">' + (locked ? '🔒' : '🔓') + '</button>' +
        '<button class="layer-eye' + (hidden ? ' is-off' : '') + '" data-eye="' + index +
          '" title="표시 / 숨김">' + (hidden ? '○' : '●') + '</button>' +
      '</div>';
    });

    list.innerHTML = html;

    Array.prototype.forEach.call(list.querySelectorAll('.layer-item'), function (row) {
      row.addEventListener('click', function (ev) {
        if (ev.target.hasAttribute && (ev.target.hasAttribute('data-eye') || ev.target.hasAttribute('data-lock'))) return;

        var obj = canvas.getObjects()[parseInt(row.getAttribute('data-index'), 10)];
        if (!obj) return;
        if (obj.visible === false) return;

        canvas.setActiveObject(obj);
        canvas.requestRenderAll();
      });

      row.addEventListener('dragstart', function (ev) {
        if (ev.target.closest && (ev.target.closest('.layer-lock') || ev.target.closest('.layer-eye'))) {
          ev.preventDefault();
          return;
        }
        var visualIdx = parseInt(row.getAttribute('data-visual'), 10);
        dragSourceVisualIndex = visualIdx;
        row.classList.add('is-dragging');
        if (ev.dataTransfer) {
          ev.dataTransfer.effectAllowed = 'move';
          ev.dataTransfer.setData('text/plain', String(visualIdx));
        }
      });

      row.addEventListener('dragend', function () {
        dragSourceVisualIndex = -1;
        Array.prototype.forEach.call(list.querySelectorAll('.layer-item'), function (el) {
          el.classList.remove('is-dragging', 'is-drop-above', 'is-drop-below');
        });
      });

      row.addEventListener('dragover', function (ev) {
        if (dragSourceVisualIndex < 0) return;
        ev.preventDefault();
        if (ev.dataTransfer) ev.dataTransfer.dropEffect = 'move';

        var rect = row.getBoundingClientRect();
        var isAbove = (ev.clientY < rect.top + rect.height / 2);
        row.classList.toggle('is-drop-above', isAbove);
        row.classList.toggle('is-drop-below', !isAbove);
      });

      row.addEventListener('dragleave', function () {
        row.classList.remove('is-drop-above', 'is-drop-below');
      });

      row.addEventListener('drop', function (ev) {
        ev.preventDefault();
        row.classList.remove('is-drop-above', 'is-drop-below');
        if (dragSourceVisualIndex < 0) return;

        var targetVisualIdx = parseInt(row.getAttribute('data-visual'), 10);
        var rect = row.getBoundingClientRect();
        var isAbove = (ev.clientY < rect.top + rect.height / 2);

        var fromVisual = dragSourceVisualIndex;
        var insertVisual = isAbove ? targetVisualIdx : targetVisualIdx + 1;
        if (fromVisual < insertVisual) {
          insertVisual--;
        }

        dragSourceVisualIndex = -1;

        if (fromVisual === insertVisual) return;

        var currentVisualObjs = canvas.getObjects().slice().reverse();
        var moved = currentVisualObjs.splice(fromVisual, 1)[0];
        if (!moved) return;

        currentVisualObjs.splice(insertVisual, 0, moved);

        canvas._objects = currentVisualObjs.slice().reverse();
        canvas.setActiveObject(moved);
        canvas.requestRenderAll();

        IE.state.history.snapshot();
        refresh();
        if (IE.properties) IE.properties.refresh(true);
        if (IE.app) IE.app.updateStatus();
      });
    });

    list.addEventListener('dragover', function (ev) {
      if (dragSourceVisualIndex < 0) return;
      ev.preventDefault();
    });

    list.addEventListener('drop', function (ev) {
      if (ev.target === list && dragSourceVisualIndex >= 0) {
        ev.preventDefault();
        var fromVisual = dragSourceVisualIndex;
        dragSourceVisualIndex = -1;
        var currentVisualObjs = canvas.getObjects().slice().reverse();
        var moved = currentVisualObjs.splice(fromVisual, 1)[0];
        if (!moved) return;

        currentVisualObjs.push(moved);
        canvas._objects = currentVisualObjs.slice().reverse();
        canvas.setActiveObject(moved);
        canvas.requestRenderAll();

        IE.state.history.snapshot();
        refresh();
        if (IE.properties) IE.properties.refresh(true);
        if (IE.app) IE.app.updateStatus();
      }
    });


    Array.prototype.forEach.call(list.querySelectorAll('.layer-lock'), function (button) {
      button.addEventListener('click', function (ev) {
        ev.stopPropagation();

        var obj = canvas.getObjects()[parseInt(button.getAttribute('data-lock'), 10)];
        if (!obj) return;

        var newLock = !(obj.isLocked || obj.lockMovementX);
        obj.isLocked = newLock;
        obj.lockMovementX = newLock;
        obj.lockMovementY = newLock;
        obj.lockRotation = newLock;
        obj.lockScalingX = newLock;
        obj.lockScalingY = newLock;
        obj.hasControls = !newLock;

        canvas.requestRenderAll();
        IE.state.history.snapshot();
        refresh();
        if (IE.properties) IE.properties.refresh(true);
        if (IE.app) IE.app.updateStatus();
        util.toast(newLock ? '레이어를 잠갔습니다.' : '레이어 잠금을 해제했습니다.');
      });
    });

    Array.prototype.forEach.call(list.querySelectorAll('.layer-eye'), function (button) {
      button.addEventListener('click', function (ev) {
        ev.stopPropagation();

        var obj = canvas.getObjects()[parseInt(button.getAttribute('data-eye'), 10)];
        if (!obj) return;

        var wasVisible = obj.visible !== false;
        obj.set('visible', !wasVisible);
        if (obj.isGuide) IE.state.guidesVisible = !wasVisible;

        canvas.requestRenderAll();
        IE.state.history.snapshot();
        refresh();
        if (IE.app) IE.app.updateStatus();
      });
    });
  }

  function init() {
    util.on('btn-layer-group', 'click', function () { IE.canvas.groupActive(); });
    util.on('btn-layer-ungroup', 'click', function () { IE.canvas.ungroupActive(); });
    util.on('btn-layer-lock', 'click', function () { IE.canvas.toggleLockActive(); });
    util.on('btn-layer-up', 'click', function () { IE.canvas.reorder('up'); });
    util.on('btn-layer-down', 'click', function () { IE.canvas.reorder('down'); });
    util.on('btn-layer-front', 'click', function () { IE.canvas.reorder('front'); });
    util.on('btn-layer-back', 'click', function () { IE.canvas.reorder('back'); });
    util.on('btn-layer-dup', 'click', function () { IE.canvas.duplicateActive(); });
    util.on('btn-layer-del', 'click', function () { IE.canvas.deleteActive(); });
  }

  IE.layers = { init: init, refresh: refresh };
})(window.IE);
