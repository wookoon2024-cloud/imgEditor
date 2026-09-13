window.IE = window.IE || {};

(function (IE) {
  'use strict';

  var util = IE.util;

  function refresh() {
    var canvas = IE.state.canvas;
    if (!canvas) return;

    var list = util.$('layer-list');
    var empty = util.$('layers-empty');
    var objects = canvas.getObjects().slice().reverse();
    var activeObjects = canvas.getActiveObjects();

    empty.hidden = objects.length > 0;

    var html = '';
    objects.forEach(function (obj) {
      var index = canvas.getObjects().indexOf(obj);
      var isActive = activeObjects.indexOf(obj) !== -1;
      var hidden = obj.visible === false;

      html += '<div class="layer-item' + (isActive ? ' is-active' : '') + '" data-index="' + index + '">' +
        '<span class="layer-ico">' + IE.canvas.iconOf(obj) + '</span>' +
        '<span class="layer-name">' + util.escapeHtml(IE.canvas.labelOf(obj)) + '</span>' +
        '<button class="layer-eye' + (hidden ? ' is-off' : '') + '" data-eye="' + index +
          '" title="표시 / 숨김">' + (hidden ? '○' : '●') + '</button>' +
      '</div>';
    });

    list.innerHTML = html;

    Array.prototype.forEach.call(list.querySelectorAll('.layer-item'), function (row) {
      row.addEventListener('click', function (ev) {
        if (ev.target.hasAttribute && ev.target.hasAttribute('data-eye')) return;

        var obj = canvas.getObjects()[parseInt(row.getAttribute('data-index'), 10)];
        if (!obj) return;
        if (obj.visible === false) return;

        canvas.setActiveObject(obj);
        canvas.requestRenderAll();
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
    util.on('btn-layer-up', 'click', function () { IE.canvas.reorder('up'); });
    util.on('btn-layer-down', 'click', function () { IE.canvas.reorder('down'); });
    util.on('btn-layer-front', 'click', function () { IE.canvas.reorder('front'); });
    util.on('btn-layer-back', 'click', function () { IE.canvas.reorder('back'); });
    util.on('btn-layer-dup', 'click', function () { IE.canvas.duplicateActive(); });
    util.on('btn-layer-del', 'click', function () { IE.canvas.deleteActive(); });
  }

  IE.layers = { init: init, refresh: refresh };
})(window.IE);
