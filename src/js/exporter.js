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

  /* ============================================================ 순수 오프라인 ZIP 패키저 */
  var CRC_TABLE = (function () {
    var table = new Uint32Array(256);
    for (var i = 0; i < 256; i++) {
      var c = i;
      for (var k = 0; k < 8; k++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[i] = c >>> 0;
    }
    return table;
  })();

  function crc32(bytes) {
    var crc = 0xFFFFFFFF;
    for (var i = 0, len = bytes.length; i < len; i++) {
      crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ bytes[i]) & 0xFF];
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  function dataURLToUint8Array(dataURL) {
    var parts = dataURL.split(',');
    var base64 = parts[1] || '';
    var binary = atob(base64);
    var len = binary.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  function SimpleZip() {
    this.files = [];
  }

  SimpleZip.prototype.add = function (name, data) {
    var bytes;
    if (typeof data === 'string') {
      bytes = new TextEncoder().encode(data);
    } else if (data instanceof Uint8Array) {
      bytes = data;
    } else if (data instanceof ArrayBuffer) {
      bytes = new Uint8Array(data);
    } else {
      bytes = new Uint8Array(0);
    }
    this.files.push({
      name: name,
      nameBytes: new TextEncoder().encode(name),
      bytes: bytes,
      crc: crc32(bytes),
      size: bytes.length
    });
  };

  SimpleZip.prototype.generateBlob = function (mimeType) {
    var totalLocalSize = 0;
    var totalCdSize = 0;

    for (var i = 0; i < this.files.length; i++) {
      var f = this.files[i];
      totalLocalSize += 30 + f.nameBytes.length + f.size;
      totalCdSize += 46 + f.nameBytes.length;
    }

    var totalSize = totalLocalSize + totalCdSize + 22;
    var buf = new ArrayBuffer(totalSize);
    var view = new DataView(buf);
    var u8 = new Uint8Array(buf);

    var offset = 0;
    var cdOffset = totalLocalSize;
    var cdPos = cdOffset;

    var now = new Date();
    var dosTime = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xFFFF;
    var dosDate = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xFFFF;

    for (var j = 0; j < this.files.length; j++) {
      var file = this.files[j];
      var localHeaderOffset = offset;

      // Local file header (30 bytes)
      view.setUint32(offset, 0x04034b50, true);
      view.setUint16(offset + 4, 20, true);
      view.setUint16(offset + 6, 0x0800, true); // UTF-8
      view.setUint16(offset + 8, 0, true);      // Store
      view.setUint16(offset + 10, dosTime, true);
      view.setUint16(offset + 12, dosDate, true);
      view.setUint32(offset + 14, file.crc, true);
      view.setUint32(offset + 18, file.size, true);
      view.setUint32(offset + 22, file.size, true);
      view.setUint16(offset + 26, file.nameBytes.length, true);
      view.setUint16(offset + 28, 0, true);
      offset += 30;

      u8.set(file.nameBytes, offset);
      offset += file.nameBytes.length;

      u8.set(file.bytes, offset);
      offset += file.size;

      // Central directory header (46 bytes)
      view.setUint32(cdPos, 0x02014b50, true);
      view.setUint16(cdPos + 4, 20, true);
      view.setUint16(cdPos + 6, 20, true);
      view.setUint16(cdPos + 8, 0x0800, true);
      view.setUint16(cdPos + 10, 0, true);
      view.setUint16(cdPos + 12, dosTime, true);
      view.setUint16(cdPos + 14, dosDate, true);
      view.setUint32(cdPos + 16, file.crc, true);
      view.setUint32(cdPos + 20, file.size, true);
      view.setUint32(cdPos + 24, file.size, true);
      view.setUint16(cdPos + 28, file.nameBytes.length, true);
      view.setUint16(cdPos + 30, 0, true);
      view.setUint16(cdPos + 32, 0, true);
      view.setUint16(cdPos + 34, 0, true);
      view.setUint16(cdPos + 36, 0, true);
      view.setUint32(cdPos + 38, 0, true);
      view.setUint32(cdPos + 42, localHeaderOffset, true);
      cdPos += 46;

      u8.set(file.nameBytes, cdPos);
      cdPos += file.nameBytes.length;
    }

    // End of central directory record (22 bytes)
    var eocdPos = cdPos;
    view.setUint32(eocdPos, 0x06054b50, true);
    view.setUint16(eocdPos + 4, 0, true);
    view.setUint16(eocdPos + 6, 0, true);
    view.setUint16(eocdPos + 8, this.files.length, true);
    view.setUint16(eocdPos + 10, this.files.length, true);
    view.setUint32(eocdPos + 12, totalCdSize, true);
    view.setUint32(eocdPos + 16, cdOffset, true);
    view.setUint16(eocdPos + 20, 0, true);

    return new Blob([buf], { type: mimeType || 'application/zip' });
  };

  function collectAllPages(scale, onComplete) {
    if (IE.doc) IE.doc.sync();
    var pages = IE.doc ? IE.doc.pages() : [{
      width: IE.state.docW,
      height: IE.state.docH,
      background: IE.state.canvas.backgroundColor
    }];

    var results = [];
    var index = 0;

    util.toast('문서 변환 준비 중 (총 ' + pages.length + '장)...');

    function step() {
      if (index >= pages.length) {
        onComplete(results, pages);
        return;
      }

      var i = index;
      var page = pages[i];
      index++;
      util.toast('페이지 렌더링 중 (' + index + ' / ' + pages.length + ')...');

      renderPage(page, 'png', scale, function (dataURL) {
        results.push({
          index: i,
          width: page.width,
          height: page.height,
          dataURL: dataURL,
          bytes: dataURLToUint8Array(dataURL)
        });
        setTimeout(step, 15);
      });
    }

    step();
  }

  /** PPT 프레젠테이션 (.pptx) 내보내기 */
  function exportPPTX() {
    collectAllPages(2, function (renderedPages, pages) {
      if (!renderedPages.length) {
        util.toast('내보낼 페이지가 없습니다.');
        return;
      }

      util.toast('PPTX 파일 패키징 중...');

      var zip = new SimpleZip();
      var first = renderedPages[0];

      // 1px = 9525 EMU (96 DPI 기준)
      var cx = Math.round(first.width * 9525);
      var cy = Math.round(first.height * 9525);

      // 1. [Content_Types].xml
      var contentTypes = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n' +
        '  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\n' +
        '  <Default Extension="xml" ContentType="application/xml"/>\n' +
        '  <Default Extension="png" ContentType="image/png"/>\n' +
        '  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>\n';

      for (var i = 1; i <= renderedPages.length; i++) {
        contentTypes += '  <Override PartName="/ppt/slides/slide' + i + '.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>\n';
      }
      contentTypes += '</Types>';
      zip.add('[Content_Types].xml', contentTypes);

      // 2. _rels/.rels
      var rootRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n' +
        '  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>\n' +
        '</Relationships>';
      zip.add('_rels/.rels', rootRels);

      // 3. ppt/presentation.xml
      var presXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
        '<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">\n' +
        '  <p:sldMasterIdLst/>\n' +
        '  <p:sldIdLst>\n';

      for (var j = 0; j < renderedPages.length; j++) {
        presXml += '    <p:sldId id="' + (256 + j) + '" r:id="rId' + (j + 1) + '"/>\n';
      }
      presXml += '  </p:sldIdLst>\n' +
        '  <p:sldSz cx="' + cx + '" cy="' + cy + '" type="custom"/>\n' +
        '  <p:notesSz cx="' + cy + '" cy="' + cx + '"/>\n' +
        '</p:presentation>';
      zip.add('ppt/presentation.xml', presXml);

      // 4. ppt/_rels/presentation.xml.rels
      var presRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n';

      for (var k = 0; k < renderedPages.length; k++) {
        presRels += '  <Relationship Id="rId' + (k + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide' + (k + 1) + '.xml"/>\n';
      }
      presRels += '</Relationships>';
      zip.add('ppt/_rels/presentation.xml.rels', presRels);

      // 5. 각 슬라이드 및 이미지
      for (var s = 0; s < renderedPages.length; s++) {
        var pageNum = s + 1;
        var pItem = renderedPages[s];
        var sWidth = Math.round(pItem.width * 9525);
        var sHeight = Math.round(pItem.height * 9525);

        var slideXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
          '<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">\n' +
          '  <p:cSld>\n' +
          '    <p:spTree>\n' +
          '      <p:nvGrpSpPr>\n' +
          '        <p:cNvPr id="1" name=""/>\n' +
          '        <p:cNvGrpSpPr/>\n' +
          '        <p:nvPr/>\n' +
          '      </p:nvGrpSpPr>\n' +
          '      <p:grpSpPr>\n' +
          '        <a:xfrm>\n' +
          '          <a:off x="0" y="0"/>\n' +
          '          <a:ext cx="' + sWidth + '" cy="' + sHeight + '"/>\n' +
          '          <a:chOff x="0" y="0"/>\n' +
          '          <a:chExt cx="' + sWidth + '" cy="' + sHeight + '"/>\n' +
          '        </a:xfrm>\n' +
          '      </p:grpSpPr>\n' +
          '      <p:pic>\n' +
          '        <p:nvPicPr>\n' +
          '          <p:cNvPr id="2" name="Slide Image"/>\n' +
          '          <p:cNvPicPr>\n' +
          '            <a:picLocks noChangeAspect="1"/>\n' +
          '          </p:cNvPicPr>\n' +
          '          <p:nvPr/>\n' +
          '        </p:nvPicPr>\n' +
          '        <p:blipFill>\n' +
          '          <a:blip r:embed="rId1"/>\n' +
          '          <a:stretch>\n' +
          '            <a:fillRect/>\n' +
          '          </a:stretch>\n' +
          '        </p:blipFill>\n' +
          '        <p:spPr>\n' +
          '          <a:xfrm>\n' +
          '            <a:off x="0" y="0"/>\n' +
          '            <a:ext cx="' + sWidth + '" cy="' + sHeight + '"/>\n' +
          '          </a:xfrm>\n' +
          '          <a:prstGeom prst="rect">\n' +
          '            <a:avLst/>\n' +
          '          </a:prstGeom>\n' +
          '        </p:spPr>\n' +
          '      </p:pic>\n' +
          '    </p:spTree>\n' +
          '  </p:cSld>\n' +
          '</p:sld>';
        zip.add('ppt/slides/slide' + pageNum + '.xml', slideXml);

        var slideRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
          '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n' +
          '  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image' + pageNum + '.png"/>\n' +
          '</Relationships>';
        zip.add('ppt/slides/_rels/slide' + pageNum + '.xml.rels', slideRels);

        zip.add('ppt/media/image' + pageNum + '.png', pItem.bytes);
      }

      var blob = zip.generateBlob('application/vnd.openxmlformats-officedocument.presentationml.presentation');
      var filename = safeName(IE.state.docName) + '_' + util.timestamp() + '.pptx';
      util.download(filename, blob);
      util.toast('PPTX 내보내기 완료: ' + filename + ' (' + renderedPages.length + '슬라이드)');
    });
  }

  /** 한글 문서 (.hwpx) 내보내기 (KS X 6101 OWPML 표준) */
  function exportHWPX() {
    collectAllPages(2, function (renderedPages, pages) {
      if (!renderedPages.length) {
        util.toast('내보낼 페이지가 없습니다.');
        return;
      }

      util.toast('한글(HWPX) 파일 패키징 중...');

      var zip = new SimpleZip();
      var first = renderedPages[0];
      var isLandscape = first.width > first.height;

      // HWPUNIT: A4 기준 (210mm x 297mm -> 59528 x 84188 HWPUNIT)
      var paperW = isLandscape ? 84188 : 59528;
      var paperH = isLandscape ? 59528 : 84188;

      // 1. mimetype (Store 무압축)
      zip.add('mimetype', 'application/hwp+zip');

      // 2. META-INF/manifest.xml
      var manifest = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
        '<odf:manifest xmlns:odf="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0">\n' +
        '  <odf:file-entry odf:media-type="application/hwp+zip" odf:full-path="/"/>\n' +
        '  <odf:file-entry odf:media-type="application/xml" odf:full-path="Contents/content.hpf"/>\n' +
        '  <odf:file-entry odf:media-type="application/xml" odf:full-path="Contents/header.xml"/>\n' +
        '  <odf:file-entry odf:media-type="application/xml" odf:full-path="Contents/section0.xml"/>\n';

      for (var m = 1; m <= renderedPages.length; m++) {
        manifest += '  <odf:file-entry odf:media-type="image/png" odf:full-path="BinData/image' + m + '.png"/>\n';
      }
      manifest += '</odf:manifest>';
      zip.add('META-INF/manifest.xml', manifest);

      // 3. Contents/content.hpf
      var hpf = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
        '<package xmlns="http://www.hancom.co.kr/hwpml/2011/package" version="1.0">\n' +
        '  <metadata>\n' +
        '    <title>' + util.escapeHtml(IE.state.docName || '문서') + '</title>\n' +
        '    <creator>ImgEditor</creator>\n' +
        '  </metadata>\n' +
        '  <manifest>\n' +
        '    <item id="header" href="Contents/header.xml" media-type="application/xml"/>\n' +
        '    <item id="section0" href="Contents/section0.xml" media-type="application/xml"/>\n';

      for (var h = 1; h <= renderedPages.length; h++) {
        hpf += '    <item id="image' + h + '" href="BinData/image' + h + '.png" media-type="image/png"/>\n';
      }
      hpf += '  </manifest>\n' +
        '  <spine>\n' +
        '    <itemref idref="section0"/>\n' +
        '  </spine>\n' +
        '</package>';
      zip.add('Contents/content.hpf', hpf);

      // 4. Contents/header.xml
      var headerXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
        '<hh:head xmlns:hh="http://www.hancom.co.kr/hwpml/2011/head" version="1.0">\n' +
        '  <hh:docConfig>\n' +
        '    <hh:grid charGrid="0" lineGrid="0"/>\n' +
        '  </hh:docConfig>\n' +
        '  <hh:refList>\n' +
        '    <hh:fontfaces itemCnt="1">\n' +
        '      <hh:fontface lang="hangul" fontCnt="1">\n' +
        '        <hh:font id="0" face="맑은 고딕" type="ttf"/>\n' +
        '      </hh:fontface>\n' +
        '    </hh:fontfaces>\n' +
        '    <hh:charProperties itemCnt="1">\n' +
        '      <hh:charPr id="0" height="1000" textColor="#000000" fontRef="0"/>\n' +
        '    </hh:charProperties>\n' +
        '    <hh:tabProperties itemCnt="1">\n' +
        '      <hh:tabPr id="0" autoTabLeft="0" autoTabRight="0"/>\n' +
        '    </hh:tabProperties>\n' +
        '    <hh:paraProperties itemCnt="2">\n' +
        '      <hh:paraPr id="0" align="center" tabPrIDRef="0"/>\n' +
        '      <hh:paraPr id="1" align="left" tabPrIDRef="0"/>\n' +
        '    </hh:paraProperties>\n' +
        '    <hh:styles itemCnt="1">\n' +
        '      <hh:style id="0" type="para" name="바탕글" engName="Normal" paraPrIDRef="0" charPrIDRef="0"/>\n' +
        '    </hh:styles>\n' +
        '  </hh:refList>\n' +
        '</hh:head>';
      zip.add('Contents/header.xml', headerXml);

      // 5. Contents/section0.xml
      var secXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
        '<hs:sec xmlns:hs="http://www.hancom.co.kr/hwpml/2011/section" xmlns:hp="http://www.hancom.co.kr/hwpml/2011/paragraph">\n' +
        '  <hp:p paraPrIDRef="0" styleIDRef="0">\n' +
        '    <hp:secPr id="0" textDirection="horizontal" spaceColumns="1134" tabStop="8000">\n' +
        '      <hp:pagePr width="' + paperW + '" height="' + paperH + '" orientation="' + (isLandscape ? 'landscape' : 'portrait') + '">\n' +
        '        <hp:margin left="0" right="0" top="0" bottom="0" header="0" footer="0" gutter="0"/>\n' +
        '      </hp:pagePr>\n' +
        '    </hp:secPr>\n' +
        '  </hp:p>\n';

      for (var p = 0; p < renderedPages.length; p++) {
        var num = p + 1;
        var pObj = renderedPages[p];

        // 그림 크기 계산 (HWPUNIT)
        var imgW = paperW;
        var imgH = Math.round(paperW * (pObj.height / pObj.width));
        if (imgH > paperH) {
          imgH = paperH;
          imgW = Math.round(paperH * (pObj.width / pObj.height));
        }

        secXml += '  <hp:p paraPrIDRef="0" styleIDRef="0">\n' +
          '    <hp:run charPrIDRef="0">\n' +
          '      <hp:pic id="' + (1000 + p) + '" zOrder="' + p + '" textWrap="inFrontOfText" textFlow="bothSides">\n' +
          '        <hp:offset x="0" y="0"/>\n' +
          '        <hp:orgSz width="' + imgW + '" height="' + imgH + '"/>\n' +
          '        <hp:curSz width="' + imgW + '" height="' + imgH + '"/>\n' +
          '        <hp:imgBinData href="BinData/image' + num + '.png"/>\n' +
          '      </hp:pic>\n' +
          '    </hp:run>\n' +
          (p < renderedPages.length - 1 ? '    <hp:pageBreak/>\n' : '') +
          '  </hp:p>\n';

        zip.add('BinData/image' + num + '.png', pObj.bytes);
      }

      secXml += '</hs:sec>';
      zip.add('Contents/section0.xml', secXml);

      var blob = zip.generateBlob('application/x-hwp+zip');
      var filename = safeName(IE.state.docName) + '_' + util.timestamp() + '.hwpx';
      util.download(filename, blob);
      util.toast('한글 문서(HWPX) 내보내기 완료: ' + filename + ' (' + renderedPages.length + '페이지)');
    });
  }

  IE.exporter = {
    exportImage: exportImage,
    exportAllPages: exportAllPages,
    exportPPTX: exportPPTX,
    exportHWPX: exportHWPX,
    saveProject: saveProject,
    loadProject: loadProject
  };
})(window.IE);
