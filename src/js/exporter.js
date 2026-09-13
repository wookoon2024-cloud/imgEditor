window.IE = window.IE || {};

(function (IE) {
  'use strict';

  var util = IE.util;

  function extensionOf(format) {
    return format === 'jpeg' ? 'jpg' : 'png';
  }

  function safeName(name) {
    return String(name || 'image').replace(/[\\/:*?"<>|]/g, '_').trim() || 'image';
  }

  /** 오프스크린 렌더가 가능하면 그쪽을 쓴다 (화면 줌/패닝과 완전히 무관해진다) */
  function renderPage(page, format, scale, cb) {
    if (IE.doc && IE.doc.renderFull) {
      IE.doc.renderFull(page, format, scale, cb);
      return;
    }

    var canvas = IE.state.canvas;
    var zoom = canvas.getZoom();
    var dataURL = null;

    IE.canvas.guidesHidden(function () {
      canvas.setDimensions({ width: IE.state.docW, height: IE.state.docH });
      canvas.setZoom(1);
      canvas.renderAll();
      dataURL = canvas.toDataURL({
        format: format,
        multiplier: scale,
        quality: format === 'jpeg' ? 0.92 : 1,
        enableRetinaScaling: false
      });
    });

    canvas.setDimensions({
      width: Math.round(IE.state.docW * zoom),
      height: Math.round(IE.state.docH * zoom)
    });
    canvas.setZoom(zoom);
    canvas.requestRenderAll();
    cb(dataURL);
  }

  /** 현재 페이지를 이미지로 내보내기 */
  function exportImage(format, scale) {
    var ext = extensionOf(format);

    if (IE.doc) IE.doc.sync();
    var page = IE.doc ? IE.doc.current() : {
      width: IE.state.docW,
      height: IE.state.docH,
      background: IE.state.canvas.backgroundColor
    };

    renderPage(page, format, scale, function (dataURL) {
      if (!dataURL) {
        util.toast('내보내기에 실패했습니다.');
        return;
      }

      var filename = safeName(IE.state.docName) + '_' + util.timestamp() + '.' + ext;
      util.download(filename, dataURL);
      util.toast('내보내기 완료: ' + filename + ' (' +
        Math.round(page.width * scale) + ' × ' + Math.round(page.height * scale) + ')');
    });
  }

  /** 모든 페이지를 순서대로 내보내기 (파일이 여러 개 생긴다) */
  function exportAllPages(format, scale) {
    if (!IE.doc) {
      exportImage(format, scale);
      return;
    }

    IE.doc.sync();
    var pages = IE.doc.pages();
    var ext = extensionOf(format);
    var base = safeName(IE.state.docName);
    var stamp = util.timestamp();
    var index = 0;

    util.toast('페이지 ' + pages.length + '장을 내보냅니다...');

    var step = function () {
      if (index >= pages.length) {
        util.toast('전체 내보내기 완료: ' + pages.length + '장');
        return;
      }

      var page = pages[index];
      var number = index + 1;
      index += 1;

      renderPage(page, format, scale, function (dataURL) {
        if (dataURL) {
          var filename = base + '_' + number + 'p_' + stamp + '.' + ext;
          util.download(filename, dataURL);
        }
        // 브라우저가 연속 다운로드를 막지 않도록 간격을 둔다
        setTimeout(step, 420);
      });
    };

    step();
  }

  /** 작업 파일(JSON)로 저장 — 모든 페이지가 들어간다 */
  function saveProject() {
    var payload = IE.doc
      ? IE.doc.serialize()
      : {
        version: util.VERSION,
        docName: IE.state.docName,
        width: IE.state.docW,
        height: IE.state.docH,
        background: IE.state.canvas.backgroundColor || '#ffffff',
        canvas: IE.state.canvas.toJSON(util.EXTRA_PROPS)
      };

    payload.app = 'ImgEditor';
    payload.savedAt = new Date().toISOString();

    var filename = safeName(IE.state.docName) + '_' + util.timestamp() + '.json';
    var blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });

    util.download(filename, blob);

    var pageCount = payload.pages ? payload.pages.length : 1;
    util.toast('작업 파일을 저장했습니다 (' + pageCount + '페이지): ' + filename);
  }

  /** 작업 파일 불러오기 */
  function loadProject(file) {
    util.readAsText(file, function (err, text) {
      if (err) {
        util.toast('파일을 읽지 못했습니다.');
        return;
      }

      var payload;
      try {
        payload = JSON.parse(text);
      } catch (parseError) {
        util.toast('올바른 작업 파일(.json)이 아닙니다.');
        return;
      }

      var hasPages = payload && Array.isArray(payload.pages) && payload.pages.length;
      var hasCanvas = payload && payload.canvas && payload.canvas.objects;

      if (!hasPages && !hasCanvas) {
        util.toast('올바른 작업 파일(.json)이 아닙니다.');
        return;
      }

      IE.state.docName = payload.docName || 'untitled';

      var history = IE.state.history;
      var wasLocked = history.locked;
      history.locked = true;

      var finish = function () {
        history.locked = false;
        history.reset();
        history.snapshot();
        IE.canvas.zoomToFit();
        IE.panels.refresh();
        if (IE.app) IE.app.updateStatus();
        util.toast('작업 파일을 불러왔습니다' +
          (hasPages ? ' (' + payload.pages.length + '페이지)' : '') + '.');
      };

      if (IE.doc) {
        IE.doc.restore(payload, finish);
      } else {
        history.locked = wasLocked;
        util.toast('문서 모듈을 찾을 수 없습니다.');
      }
    });
  }

  IE.exporter = {
    exportImage: exportImage,
    exportAllPages: exportAllPages,
    saveProject: saveProject,
    loadProject: loadProject
  };
})(window.IE);
