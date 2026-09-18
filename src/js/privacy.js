window.IE = window.IE || {};

(function (IE) {
  'use strict';

  // 12종 점검 대상 정의
  var TARGET_DEFS = [
    { key: 'rrn', label: '주민등록번호', badgeColor: '#dc2626' },
    { key: 'phone', label: '전화·휴대폰', badgeColor: '#d97706' },
    { key: 'military', label: '군번', badgeColor: '#2563eb' },
    { key: 'email', label: '이메일', badgeColor: '#059669' },
    { key: 'name', label: '이름(성명)', badgeColor: '#7c3aed' },
    { key: 'face', label: '인물 얼굴(사진)', badgeColor: '#e11d48' },
    { key: 'card', label: '카드번호', badgeColor: '#ea580c' },
    { key: 'account', label: '계좌번호', badgeColor: '#0284c7' },
    { key: 'license', label: '운전면허번호', badgeColor: '#4f46e5' },
    { key: 'passport', label: '여권번호', badgeColor: '#0891b2' },
    { key: 'birth', label: '생년월일', badgeColor: '#db2777' },
    { key: 'biz', label: '사업자등록번호', badgeColor: '#475569' }
  ];

  var RRN_REGEX = /\b(\d{6})[-.\s]?([1-4]\d{6})\b/g;
  var PHONE_REGEX = /\b(01[016789]|02|0[3-6][1-5])[-.\s]?(\d{3,4})[-.\s]?(\d{4})\b/g;
  var MILITARY_REGEX = /(?<![0-9-])\b(\d{2})[-.\s](\d{5,8})\b(?![0-9-])/g;
  var EMAIL_REGEX = /\b([a-zA-Z0-9._%+-]{1,3})([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g;
  var NAME_KEYWORD_REGEX = /(성명|이름|담당자|신청인|작성자|대표자|민원인|성\s*명|수령인|보호자)\s*[:：]\s*([가-힣]{2,4})/g;

  var CARD_REGEX = /\b([0-9]{4})[-.\s]?([0-9]{4})[-.\s]?([0-9]{4})[-.\s]?([0-9]{4})\b/g;
  var BIZ_REGEX = /\b(\d{3})[-.\s]?(\d{2})[-.\s]?(\d{5})\b/g;
  var LICENSE_REGEX = /\b(서울|경기|부산|대구|인천|광주|대전|울산|강원|충북|충남|전북|전남|경북|경남|제주|\d{2})[-.\s]?(\d{2})[-.\s]?(\d{6})[-.\s]?(\d{2})\b/g;
  var PASSPORT_REGEX = /\b([MSRDGmsrdg]\d{8}|[A-Za-z]\d{3}[A-Za-z]\d{4})\b/g;
  var BIRTH_REGEX = /\b(19\d{2}|20\d{2})[-./년\s]+(0?[1-9]|1[0-2])[-./월\s]+(0?[1-9]|[12]\d|3[01])(?:\s*일)?\b/g;
  var ACCOUNT_KEYWORD_REGEX = /(계좌|계좌번호|급여계좌|입금계좌|환불계좌)\s*[:：]?\s*([0-9-]{10,18})/g;
  var ACCOUNT_DASH_REGEX = /(?<![0-9-])\b(\d{3,6})-(\d{2,6})-(\d{3,6})\b(?![0-9-])/g;

  var currentResults = [];

  function maskRRN(match, p1, p2) {
    return p1 + '-' + p2.charAt(0) + '******';
  }

  function maskPhone(match, p1, p2, p3) {
    return p1 + '-****-' + p3;
  }

  function maskMilitary(match, p1, p2) {
    var prefix = p2.slice(0, 2);
    return p1 + '-' + prefix + '******';
  }

  function maskEmail(match, p1, p2, p3) {
    return p1 + '****@' + p3;
  }

  function maskKoreanName(name) {
    if (!name || name.length < 2) return name;
    if (name.length === 2) return name.charAt(0) + '*';
    if (name.length === 3) return name.charAt(0) + '*' + name.charAt(2);
    return name.charAt(0) + name.charAt(1) + '*' + name.charAt(3);
  }

  function maskCard(match, p1, p2, p3, p4) {
    return p1 + '-****-****-' + p4;
  }

  function maskBiz(match, p1, p2, p3) {
    return p1 + '-' + p2 + '-*****';
  }

  function maskLicense(match, p1, p2, p3, p4) {
    return (p1 ? p1 + '-' : '') + p2 + '-******-' + p4;
  }

  function maskPassport(match) {
    if (match.length < 8) return match;
    return match.substring(0, 2) + '****' + match.slice(-2);
  }

  function maskBirth(match, year, month, day) {
    var hasKorean = match.indexOf('년') !== -1 || match.indexOf('월') !== -1;
    var hasIl = match.indexOf('일') !== -1;
    var sep = match.indexOf('.') !== -1 ? '.' : (match.indexOf('/') !== -1 ? '/' : '-');
    if (hasKorean) {
      return year + '년 **월 **' + (hasIl ? '일' : '');
    }
    return year + sep + '**' + sep + '**';
  }

  function maskAccountDash(match, p1, p2, p3) {
    return p1 + '-****-' + p3;
  }

  function maskAccountKeyword(match, key, num) {
    var parts = num.split('-');
    if (parts.length === 3) {
      return key + ': ' + parts[0] + '-****-' + parts[2];
    }
    var clean = num.replace(/[^0-9]/g, '');
    var maskedNum = clean.slice(0, 3) + '-****-' + clean.slice(-3);
    return key + ': ' + maskedNum;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function scanText(text, obj, row, col, options, results) {
    if (!text) return;

    function addResult(item) {
      var exists = results.some(function (r) {
        return r.obj === item.obj && r.row === item.row && r.col === item.col && r.original === item.original;
      });
      if (!exists) {
        results.push(item);
      }
    }

    // 1. 주민등록번호
    if (options.rrn) {
      var rrnRegex = new RegExp(RRN_REGEX.source, 'g');
      var rrnMatch;
      while ((rrnMatch = rrnRegex.exec(text)) !== null) {
        var orig = rrnMatch[0];
        addResult({
          id: 'rrn_' + results.length + '_' + Date.now(),
          type: 'rrn',
          typeLabel: '주민등록번호',
          badgeColor: '#dc2626',
          original: orig,
          masked: maskRRN(orig, rrnMatch[1], rrnMatch[2]),
          obj: obj,
          row: row,
          col: col,
          selected: true
        });
      }
    }

    // 2. 전화번호·휴대전화
    if (options.phone) {
      var phoneRegex = new RegExp(PHONE_REGEX.source, 'g');
      var phoneMatch;
      while ((phoneMatch = phoneRegex.exec(text)) !== null) {
        var origPhone = phoneMatch[0];
        addResult({
          id: 'phone_' + results.length + '_' + Date.now(),
          type: 'phone',
          typeLabel: '전화번호·휴대폰',
          badgeColor: '#d97706',
          original: origPhone,
          masked: maskPhone(origPhone, phoneMatch[1], phoneMatch[2], phoneMatch[3]),
          obj: obj,
          row: row,
          col: col,
          selected: true
        });
      }
    }

    // 3. 군번
    if (options.military) {
      var milRegex = new RegExp(MILITARY_REGEX.source, 'g');
      var milMatch;
      while ((milMatch = milRegex.exec(text)) !== null) {
        var origMil = milMatch[0];
        addResult({
          id: 'mil_' + results.length + '_' + Date.now(),
          type: 'military',
          typeLabel: '군번',
          badgeColor: '#2563eb',
          original: origMil,
          masked: maskMilitary(origMil, milMatch[1], milMatch[2], milMatch[3]),
          obj: obj,
          row: row,
          col: col,
          selected: true
        });
      }
    }

    // 4. 이메일
    if (options.email) {
      var emailRegex = new RegExp(EMAIL_REGEX.source, 'g');
      var emailMatch;
      while ((emailMatch = emailRegex.exec(text)) !== null) {
        var origEmail = emailMatch[0];
        addResult({
          id: 'email_' + results.length + '_' + Date.now(),
          type: 'email',
          typeLabel: '이메일',
          badgeColor: '#059669',
          original: origEmail,
          masked: maskEmail(origEmail, emailMatch[1], emailMatch[2], emailMatch[3]),
          obj: obj,
          row: row,
          col: col,
          selected: true
        });
      }
    }

    // 5. 카드번호
    if (options.card) {
      var cardRegex = new RegExp(CARD_REGEX.source, 'g');
      var cardMatch;
      while ((cardMatch = cardRegex.exec(text)) !== null) {
        var origCard = cardMatch[0];
        addResult({
          id: 'card_' + results.length + '_' + Date.now(),
          type: 'card',
          typeLabel: '카드번호',
          badgeColor: '#ea580c',
          original: origCard,
          masked: maskCard(origCard, cardMatch[1], cardMatch[2], cardMatch[3], cardMatch[4]),
          obj: obj,
          row: row,
          col: col,
          selected: true
        });
      }
    }

    // 6. 계좌번호
    if (options.account) {
      var accRegex = new RegExp(ACCOUNT_KEYWORD_REGEX.source, 'g');
      var accMatch;
      while ((accMatch = accRegex.exec(text)) !== null) {
        var origAcc = accMatch[0];
        addResult({
          id: 'acc_' + results.length + '_' + Date.now(),
          type: 'account',
          typeLabel: '계좌번호',
          badgeColor: '#0284c7',
          original: origAcc,
          masked: maskAccountKeyword(origAcc, accMatch[1], accMatch[2]),
          obj: obj,
          row: row,
          col: col,
          selected: true
        });
      }
      var accDashRegex = new RegExp(ACCOUNT_DASH_REGEX.source, 'g');
      var accDashMatch;
      while ((accDashMatch = accDashRegex.exec(text)) !== null) {
        var origDash = accDashMatch[0];
        if (!(accDashMatch[1].length === 3 && accDashMatch[2].length === 2 && accDashMatch[3].length === 5)) {
          addResult({
            id: 'acc_' + results.length + '_' + Date.now(),
            type: 'account',
            typeLabel: '계좌번호',
            badgeColor: '#0284c7',
            original: origDash,
            masked: maskAccountDash(origDash, accDashMatch[1], accDashMatch[2], accDashMatch[3]),
            obj: obj,
            row: row,
            col: col,
            selected: true
          });
        }
      }
    }

    // 7. 운전면허번호
    if (options.license) {
      var licRegex = new RegExp(LICENSE_REGEX.source, 'g');
      var licMatch;
      while ((licMatch = licRegex.exec(text)) !== null) {
        var origLic = licMatch[0];
        addResult({
          id: 'lic_' + results.length + '_' + Date.now(),
          type: 'license',
          typeLabel: '운전면허번호',
          badgeColor: '#4f46e5',
          original: origLic,
          masked: maskLicense(origLic, licMatch[1], licMatch[2], licMatch[3], licMatch[4]),
          obj: obj,
          row: row,
          col: col,
          selected: true
        });
      }
    }

    // 8. 여권번호
    if (options.passport) {
      var passRegex = new RegExp(PASSPORT_REGEX.source, 'g');
      var passMatch;
      while ((passMatch = passRegex.exec(text)) !== null) {
        var origPass = passMatch[0];
        addResult({
          id: 'pass_' + results.length + '_' + Date.now(),
          type: 'passport',
          typeLabel: '여권번호',
          badgeColor: '#0891b2',
          original: origPass,
          masked: maskPassport(origPass),
          obj: obj,
          row: row,
          col: col,
          selected: true
        });
      }
    }

    // 9. 생년월일
    if (options.birth) {
      var birthRegex = new RegExp(BIRTH_REGEX.source, 'g');
      var birthMatch;
      while ((birthMatch = birthRegex.exec(text)) !== null) {
        var origBirth = birthMatch[0];
        addResult({
          id: 'birth_' + results.length + '_' + Date.now(),
          type: 'birth',
          typeLabel: '생년월일',
          badgeColor: '#db2777',
          original: origBirth,
          masked: maskBirth(origBirth, birthMatch[1], birthMatch[2], birthMatch[3]),
          obj: obj,
          row: row,
          col: col,
          selected: true
        });
      }
    }

    // 10. 사업자등록번호
    if (options.biz) {
      var bizRegex = new RegExp(BIZ_REGEX.source, 'g');
      var bizMatch;
      while ((bizMatch = bizRegex.exec(text)) !== null) {
        var origBiz = bizMatch[0];
        addResult({
          id: 'biz_' + results.length + '_' + Date.now(),
          type: 'biz',
          typeLabel: '사업자등록번호',
          badgeColor: '#475569',
          original: origBiz,
          masked: maskBiz(origBiz, bizMatch[1], bizMatch[2], bizMatch[3]),
          obj: obj,
          row: row,
          col: col,
          selected: true
        });
      }
    }

    // 11. 이름 (키워드 매칭)
    if (options.name) {
      var nameRegex = new RegExp(NAME_KEYWORD_REGEX.source, 'g');
      var nameMatch;
      while ((nameMatch = nameRegex.exec(text)) !== null) {
        var origTarget = nameMatch[2];
        var fullOrig = nameMatch[0];
        var maskedTarget = maskKoreanName(origTarget);
        var fullMasked = fullOrig.replace(origTarget, maskedTarget);
        addResult({
          id: 'name_' + results.length + '_' + Date.now(),
          type: 'name',
          typeLabel: '이름(성명)',
          badgeColor: '#7c3aed',
          original: fullOrig,
          masked: fullMasked,
          obj: obj,
          row: row,
          col: col,
          selected: true
        });
      }
    }
  }

  function scan(options) {
    if (!options) {
      options = {};
      TARGET_DEFS.forEach(function (t) { options[t.key] = true; });
    }
    var canvas = IE.state.canvas;
    if (!canvas) return [];

    var results = [];
    var objects = canvas.getObjects();

    objects.forEach(function (obj) {
      if (obj.isGuide) return;

      // 텍스트 상자
      if (obj.kind === 'text' || obj.type === 'textbox' || obj.type === 'i-text' || obj.type === 'text') {
        scanText(String(obj.text || ''), obj, null, null, options, results);
      }

      // 표 셀 내부 텍스트
      if (obj.kind === 'table' && obj.tableData && obj.tableData.cells) {
        var cells = obj.tableData.cells;
        for (var r = 0; r < cells.length; r++) {
          for (var c = 0; c < cells[r].length; c++) {
            scanText(String(cells[r][c].text || ''), obj, r, c, options, results);
          }
        }
      }

      // 사진 내 얼굴 탐지
      if (options.face && (obj.kind === 'image' || obj.type === 'image') && obj._element) {
        try {
          var imgEl = obj._element;
          var nw = imgEl.naturalWidth || imgEl.width || 0;
          var nh = imgEl.naturalHeight || imgEl.height || 0;
          if (nw > 40 && nh > 40 && IE.facedet && IE.facedet.isReady()) {
            var hit = IE.facedet.detect(imgEl, nw, nh);
            if (hit && hit.found) {
              results.push({
                id: 'face_' + results.length + '_' + Date.now(),
                type: 'face',
                typeLabel: '인물 얼굴(초상권)',
                badgeColor: '#e11d48',
                original: '얼굴 ' + (hit.count || 1) + '명 감지됨',
                masked: '얼굴 모자이크 처리',
                obj: obj,
                faceBox: hit,
                selected: true
              });
            }
          }
        } catch (e) {
          // 탐지 오류 무시
        }
      }
    });

    currentResults = results;
    return results;
  }

  function applyFaceMosaic(imgObj, faceBox) {
    var elem = imgObj._element;
    if (!elem) return;

    var nw = elem.naturalWidth || elem.width;
    var nh = elem.naturalHeight || elem.height;
    var cvs = document.createElement('canvas');
    cvs.width = nw;
    cvs.height = nh;
    var ctx = cvs.getContext('2d');
    ctx.drawImage(elem, 0, 0, nw, nh);

    var padW = faceBox.w * 0.15;
    var padH = faceBox.h * 0.15;
    var fx = Math.max(0, Math.round(faceBox.x - padW));
    var fy = Math.max(0, Math.round(faceBox.y - padH));
    var fw = Math.min(nw - fx, Math.round(faceBox.w + padW * 2));
    var fh = Math.min(nh - fy, Math.round(faceBox.h + padH * 2));

    var blockSize = Math.max(8, Math.round(Math.min(fw, fh) / 8));

    var smallCanvas = document.createElement('canvas');
    var sw = Math.max(1, Math.floor(fw / blockSize));
    var sh = Math.max(1, Math.floor(fh / blockSize));
    smallCanvas.width = sw;
    smallCanvas.height = sh;
    var sctx = smallCanvas.getContext('2d');
    sctx.drawImage(cvs, fx, fy, fw, fh, 0, 0, sw, sh);

    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.drawImage(smallCanvas, 0, 0, sw, sh, fx, fy, fw, fh);

    var dataURL = cvs.toDataURL('image/png');
    var newImg = new Image();
    newImg.onload = function () {
      imgObj.setElement(newImg);
      imgObj.setCoords();
      IE.state.canvas.requestRenderAll();
      IE.state.history.snapshot();
    };
    newImg.src = dataURL;
  }

  function applyMask(items) {
    if (!items || !items.length) return 0;
    var canvas = IE.state.canvas;
    if (!canvas) return 0;

    var count = 0;

    items.forEach(function (item) {
      if (!item.selected) return;

      // 텍스트 객체 마스킹
      if (item.obj && (item.obj.kind === 'text' || item.obj.type === 'textbox' || item.obj.type === 'i-text' || item.obj.type === 'text')) {
        if (item.obj.text && item.obj.text.indexOf(item.original) !== -1) {
          item.obj.set({
            text: item.obj.text.replace(item.original, item.masked)
          });
          item.obj.setCoords();
          count++;
        }
      }

      // 표 셀 내부 마스킹
      if (item.obj && item.obj.kind === 'table' && item.row != null && item.col != null) {
        var td = item.obj.tableData;
        if (td && td.cells && td.cells[item.row] && td.cells[item.row][item.col]) {
          var cell = td.cells[item.row][item.col];
          if (cell.text && cell.text.indexOf(item.original) !== -1) {
            cell.text = cell.text.replace(item.original, item.masked);
            IE.table.update(item.obj, {});
            count++;
          }
        }
      }

      // 사진 내 얼굴 모자이크
      if (item.type === 'face' && item.obj && item.faceBox) {
        applyFaceMosaic(item.obj, item.faceBox);
        count++;
      }
    });

    if (count > 0) {
      canvas.requestRenderAll();
      IE.state.history.snapshot();
    }
    return count;
  }

  function panelHtml() {
    var itemsHtml = TARGET_DEFS.map(function (t) {
      return '<label class="priv-target-label" title="' + t.label + '">' +
        '<input type="checkbox" class="chk-priv-target" id="chk-priv-' + t.key + '" checked>' +
        '<span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + t.label + '</span>' +
      '</label>';
    }).join('');

    return '<div class="fo-section">' +
      '<div style="background:var(--brand-soft);border:1px solid var(--brand-line);border-radius:var(--r-md);padding:10px 12px;margin-bottom:14px;">' +
        '<b style="display:block;color:var(--brand-700);font-size:12.5px;margin-bottom:4px;">개인정보 안심 점검</b>' +
        '<div class="fo-hint" style="color:var(--ink-2);font-size:11px;line-height:1.5;">' +
          '문서 내 민감정보 및 사진 속 얼굴을 외부 유출 없이 로컬 브라우저에서 안전하게 탐지하여 마스킹합니다.' +
        '</div>' +
      '</div>' +
    '</div>' +

    '<div class="fo-section">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">' +
        '<h3 class="fo-title" style="margin:0;">점검 대상 항목 (<span id="priv-target-count">' + TARGET_DEFS.length + '</span>/' + TARGET_DEFS.length + ')</h3>' +
        '<button type="button" class="btn-mini" id="btn-priv-target-toggle-all" style="font-size:11px;padding:2px 8px;">전체 해제</button>' +
      '</div>' +

      '<div style="display:grid;grid-template-columns:repeat(2, 1fr);gap:6px;margin-bottom:14px;">' +
        itemsHtml +
      '</div>' +

      '<button type="button" class="fo-btn solid" id="btn-privacy-scan">화면 개인정보 검사 시작</button>' +
    '</div>' +

    '<div class="fo-section" id="privacy-results-host">' +
      '<p class="fo-hint" style="text-align:center;margin-top:10px;">' +
        '위 항목을 선택한 후 <b>[화면 개인정보 검사 시작]</b> 버튼을 누르면<br>캔버스의 모든 텍스트와 사진을 점검합니다.' +
      '</p>' +
    '</div>';
  }

  function renderResultsHtml(results) {
    if (!results || !results.length) {
      return '<div style="background:var(--brand-soft);border:1px solid var(--brand-line);border-radius:var(--r-md);padding:16px;text-align:center;">' +
        '<div style="font-size:13px;font-weight:700;color:var(--brand-700);margin-bottom:4px;">' +
          '개인정보 안심 인증 완료' +
        '</div>' +
        '<div class="fo-hint" style="font-size:11.5px;color:var(--ink-2);line-height:1.5;">' +
          '현재 화면에서 감지된 민감 개인정보가 없습니다.<br>안심하고 문서를 배포·인쇄하실 수 있습니다.' +
        '</div>' +
      '</div>';
    }

    var listHtml = results.map(function (item, idx) {
      return '<div class="priv-item-card" style="border:1px solid var(--line);border-radius:var(--r-sm);padding:8px 10px;background:var(--surface);font-size:11.5px;margin-bottom:6px;transition:border-color 0.12s;">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">' +
          '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:700;color:var(--ink-1);margin:0;">' +
            '<input type="checkbox" class="chk-priv-item" data-priv-idx="' + idx + '" ' + (item.selected ? 'checked' : '') + ' style="accent-color:var(--brand);width:14px;height:14px;cursor:pointer;">' +
            '<span>' + item.typeLabel + '</span>' +
          '</label>' +
          '<span style="font-size:10px;color:#fff;background:' + item.badgeColor + ';padding:1px 6px;border-radius:3px;font-weight:600;">주의</span>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:6px;padding-left:20px;color:var(--ink-3);font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' +
          '<span style="text-decoration:line-through;color:#e11d48;max-width:110px;overflow:hidden;text-overflow:ellipsis;" title="' + escapeHtml(item.original) + '">' + escapeHtml(item.original) + '</span>' +
          '<span>➔</span>' +
          '<span style="font-weight:700;color:#2563eb;max-width:110px;overflow:hidden;text-overflow:ellipsis;" title="' + escapeHtml(item.masked) + '">' + escapeHtml(item.masked) + '</span>' +
        '</div>' +
      '</div>';
    }).join('');

    return '<div style="margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;">' +
      '<span style="font-size:12px;font-weight:700;color:#e11d48;">' +
        '감지된 민감 정보: <b>' + results.length + '건</b>' +
      '</span>' +
      '<button type="button" class="btn-mini" id="btn-priv-toggle-all" style="font-size:10.5px;padding:2px 6px;">전체 선택/해제</button>' +
    '</div>' +
    '<div class="priv-list" style="max-height:260px;overflow-y:auto;margin-bottom:10px;padding-right:2px;">' +
      listHtml +
    '</div>' +
    '<button type="button" class="fo-btn solid" id="btn-priv-apply-mask" style="background:#e11d48;border-color:#be123c;">선택 항목 마스킹 일괄 적용</button>';
  }

  function bindPanel(host) {
    var btnScan = host.querySelector('#btn-privacy-scan');
    var resultsHost = host.querySelector('#privacy-results-host');
    var btnToggleTarget = host.querySelector('#btn-priv-target-toggle-all');
    var countEl = host.querySelector('#priv-target-count');

    function updateTargetCount() {
      var checkedCount = 0;
      TARGET_DEFS.forEach(function (t) {
        var cb = host.querySelector('#chk-priv-' + t.key);
        if (cb && cb.checked) checkedCount++;
      });
      if (countEl) countEl.textContent = checkedCount;
      if (btnToggleTarget) {
        btnToggleTarget.textContent = (checkedCount === 0) ? '전체 선택' : '전체 해제';
      }
    }

    if (btnToggleTarget) {
      btnToggleTarget.addEventListener('click', function () {
        var anyChecked = TARGET_DEFS.some(function (t) {
          var cb = host.querySelector('#chk-priv-' + t.key);
          return cb && cb.checked;
        });
        var newState = !anyChecked;
        TARGET_DEFS.forEach(function (t) {
          var cb = host.querySelector('#chk-priv-' + t.key);
          if (cb) cb.checked = newState;
        });
        updateTargetCount();
      });
    }

    TARGET_DEFS.forEach(function (t) {
      var cb = host.querySelector('#chk-priv-' + t.key);
      if (cb) {
        cb.addEventListener('change', updateTargetCount);
      }
    });

    function readOptions() {
      var opts = {};
      TARGET_DEFS.forEach(function (t) {
        var cb = host.querySelector('#chk-priv-' + t.key);
        opts[t.key] = !!(cb && cb.checked);
      });
      return opts;
    }

    function doScan() {
      var opts = readOptions();
      var anySelected = Object.keys(opts).some(function (k) { return opts[k]; });
      if (!anySelected) {
        if (IE.util && IE.util.toast) {
          IE.util.toast('점검 대상 항목을 최소 1개 이상 선택해주세요.');
        }
        return;
      }
      var results = scan(opts);
      resultsHost.innerHTML = renderResultsHtml(results);
      bindResults();
    }

    function bindResults() {
      var btnApply = resultsHost.querySelector('#btn-priv-apply-mask');
      if (btnApply) {
        btnApply.addEventListener('click', function () {
          var count = applyMask(currentResults);
          if (count > 0) {
            if (IE.util && IE.util.toast) {
              IE.util.toast(count + '개 개인정보 항목이 안전하게 마스킹되었습니다.');
            }
          }
          // 재검사 진행
          doScan();
        });
      }

      var btnToggleAll = resultsHost.querySelector('#btn-priv-toggle-all');
      if (btnToggleAll) {
        btnToggleAll.addEventListener('click', function () {
          var anyUnchecked = currentResults.some(function (r) { return !r.selected; });
          currentResults.forEach(function (r) { r.selected = anyUnchecked; });
          Array.prototype.forEach.call(resultsHost.querySelectorAll('.chk-priv-item'), function (cb) {
            cb.checked = anyUnchecked;
          });
        });
      }

      Array.prototype.forEach.call(resultsHost.querySelectorAll('.chk-priv-item'), function (cb) {
        cb.addEventListener('change', function () {
          var idx = parseInt(cb.getAttribute('data-priv-idx'), 10);
          if (currentResults[idx]) {
            currentResults[idx].selected = cb.checked;
          }
        });
      });
    }

    if (btnScan) {
      btnScan.addEventListener('click', doScan);
    }
  }

  IE.privacy = {
    scan: scan,
    applyMask: applyMask,
    panelHtml: panelHtml,
    bindPanel: bindPanel,
    TARGET_DEFS: TARGET_DEFS
  };

})(window.IE);
