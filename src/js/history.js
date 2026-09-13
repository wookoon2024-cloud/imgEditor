window.IE = window.IE || {};

(function (IE) {
  'use strict';

  var util = IE.util;

  /**
   * 문서 전체(모든 페이지)를 JSON 스냅샷으로 저장하는 되돌리기 스택.
   * 이미지가 data URL 로 들어 있어 스냅샷 하나가 클 수 있으므로 개수를 제한한다.
   */
  function History(canvas) {
    this.canvas = canvas;
    this.stack = [];
    this.index = -1;
    this.limit = 30;
    this.locked = false;
    this.onChange = null;
    this._timer = null;
  }

  History.prototype.serialize = function () {
    if (IE.doc && IE.doc.serialize) {
      return JSON.stringify(IE.doc.serialize());
    }
    return JSON.stringify(this.canvas.toJSON(util.EXTRA_PROPS));
  };

  History.prototype.reset = function () {
    this.stack = [];
    this.index = -1;
  };

  History.prototype.snapshot = function () {
    if (this.locked) return;

    var json = this.serialize();
    if (this.index >= 0 && this.stack[this.index] === json) return;

    this.stack = this.stack.slice(0, this.index + 1);
    this.stack.push(json);

    if (this.stack.length > this.limit) {
      this.stack.shift();
    }
    this.index = this.stack.length - 1;
    this.changed();
  };

  History.prototype.snapshotSoon = function (wait) {
    var self = this;
    clearTimeout(this._timer);
    this._timer = setTimeout(function () { self.snapshot(); }, wait || 300);
  };

  History.prototype.changed = function () {
    if (typeof this.onChange === 'function') this.onChange();
  };

  History.prototype.canUndo = function () {
    return this.index > 0;
  };

  History.prototype.canRedo = function () {
    return this.index >= 0 && this.index < this.stack.length - 1;
  };

  History.prototype.jump = function (target) {
    if (target < 0 || target >= this.stack.length) return;

    var self = this;
    var zoom = this.canvas.getZoom();

    this.index = target;
    this.locked = true;

    var data;
    try {
      data = JSON.parse(this.stack[target]);
    } catch (err) {
      this.locked = false;
      return;
    }

    var finish = function () {
      // apply/restore 가 잠금을 건드릴 수 있으므로 확실히 다시 잡는다
      self.locked = true;
      if (IE.canvas) {
        IE.canvas.setZoom(zoom);
      }
      self.canvas.discardActiveObject();
      self.canvas.requestRenderAll();
      self.locked = false;
      self.changed();
      if (IE.panels) IE.panels.refresh();
      if (IE.app) IE.app.updateStatus();
    };

    if (IE.doc && data.pages) {
      IE.doc.restore(data, finish);
      return;
    }

    // 구버전(단일 캔버스) 스냅샷 호환
    this.canvas.loadFromJSON(data, function () {
      self.canvas.backgroundColor = data.background || '#ffffff';
      finish();
    }, IE.table.reviver);
  };

  History.prototype.undo = function () {
    if (!this.canUndo()) return false;
    this.jump(this.index - 1);
    return true;
  };

  History.prototype.redo = function () {
    if (!this.canRedo()) return false;
    this.jump(this.index + 1);
    return true;
  };

  /** 스냅샷을 즉시 저장 (잠금 중이어도 강제) */
  History.prototype.forceSnapshot = function () {
    var wasLocked = this.locked;
    this.locked = false;
    this.snapshot();
    this.locked = wasLocked;
  };

  IE.History = History;
})(window.IE);
