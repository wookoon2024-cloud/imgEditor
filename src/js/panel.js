window.IE = window.IE || {};

(function (IE) {
  'use strict';

  var util = IE.util;

  var current = null;
  var iconCategory = null;
  var iconCallback = null;
  var tableSize = { rows: 3, cols: 3 };
  var tableHeader = true;

  var recentImages = [];

  /* ============================================================ 내용 조각 */

  /* 도형 한글 이름은 shapes.js 가 갖고 있다 (캔버스 레이어 이름에도 쓴다) */

  var elColor = '#2563eb';
  var elStyle = 'badge';
  var elFigureStyle = 'fill';
  var elTab = 'figure';
  var elSearch = '';
  var cartoonCat = 'all';
  var cartoonSearch = '';

  /** 요소를 넣기 **전에** 색을 고른다 — 넣고 나서 속성까지 갈 일이 없다 */
  function colorRowHtml() {
    var customRow = '<div class="el-color-group el-color-custom-group">' +
      '<span class="el-color-name">직접 선택</span>' +
      '<div class="el-color-custom-bar">' +
        '<label class="color-picker-box" title="클릭하여 색상 선택">' +
          '<input type="color" id="el-custom-color" value="' + elColor + '">' +
          '<span class="color-picker-thumb" id="el-custom-thumb" style="background:' + elColor + '"></span>' +
        '</label>' +
        '<input type="text" id="el-custom-hex" class="color-hex-input" value="' + elColor.toUpperCase() + '" maxlength="7" spellcheck="false" placeholder="#000000">' +
      '</div>' +
    '</div>';

    return customRow + IE.shapes.paletteGroups.map(function (group) {
      return '<div class="el-color-group">' +
        '<span class="el-color-name">' + group.name + '</span>' +
        '<div class="el-color-row">' +
          group.colors.map(function (color) {
            return '<button type="button" class="el-color' +
              (color.toLowerCase() === elColor.toLowerCase() ? ' is-active' : '') +
              '" data-el-color="' + color + '" style="background:' + color +
              '" title="' + color + '"></button>';
          }).join('') +
        '</div>' +
      '</div>';
    }).join('');
  }

  function figureCell(key) {
    return '<button type="button" class="el-cell el-cell-figure" data-figure="' + key +
      '" title="' + IE.shapes.figureLabel(key) + '">' +
      IE.shapes.figureSvg(key, elFigureStyle, IE.shapes.figureColorsFor(elColor, key)) +
    '</button>';
  }

  function figureStyleRowHtml() {
    return '<div class="el-styles">' +
      IE.shapes.figureStyles.map(function (item) {
        return '<button type="button" class="el-style' +
          (item.id === elFigureStyle ? ' is-active' : '') +
          '" data-el-figstyle="' + item.id + '">' + item.name + '</button>';
      }).join('') +
    '</div>';
  }

  /** 아이콘 스타일 — 색을 몇 개 쓸지 (단색 1 → 엠블럼 4) */
  function styleRowHtml() {
    return '<div class="el-styles">' +
      IE.shapes.iconStyles.map(function (item) {
        return '<button type="button" class="el-style' +
          (item.id === elStyle ? ' is-active' : '') +
          '" data-el-style="' + item.id + '">' + item.name + '</button>';
      }).join('') +
    '</div>';
  }

  function iconCell(name) {
    return '<button type="button" class="el-cell el-cell-icon" data-icon="' + name +
      '" title="' + IE.shapes.label(name) + '">' +
      IE.shapes.iconSvg(name, elStyle, IE.shapes.iconColorsFor(elColor, elStyle, name)) +
    '</button>';
  }

  /** 검색어가 있으면 전체에서, 없으면 고른 분류에서 */
  function elGridHtml() {
    if (elSearch) {
      var q = elSearch.toLowerCase();
      var hits = IE.shapes.iconList.filter(function (name) {
        return name.toLowerCase().indexOf(q) !== -1 ||
          IE.shapes.label(name).toLowerCase().indexOf(q) !== -1;
      });

      if (!hits.length) {
        return '<p class="fo-hint">"' + elSearch + '" 와 맞는 요소가 없습니다.</p>';
      }
      return hits.map(iconCell).join('');
    }

    var category = null;
    IE.shapes.categories.forEach(function (item) {
      if (item.id === iconCategory) category = item;
    });

    return (category ? category.items : IE.shapes.iconList).map(iconCell).join('');
  }

  /** id 가 illust- 면 일러스트(그림), icon-deco- 면 아이콘 성격의 단색 장식,
      deco- 면 색이 정해진 일러스트형 장식 */
  function isIllustGroup(group) {
    return group.id.indexOf('illust') === 0;
  }

  function isIconFigureGroup(group) {
    return group.id.indexOf('icon-deco-') === 0;
  }

  function isDecoGroup(group) {
    return group.id.indexOf('deco-') === 0;
  }

  function groupItems(groups) {
    var total = 0;
    groups.forEach(function (group) { total += group.items.length; });
    return total;
  }

  function illustGroups() {
    return IE.shapes.figureGroups.filter(isIllustGroup);
  }

  function iconFigureGroups() {
    return IE.shapes.figureGroups.filter(isIconFigureGroup);
  }

  function decoGroups() {
    return IE.shapes.figureGroups.filter(isDecoGroup);
  }

  function shapeCount() {
    var total = 0;
    IE.shapes.figureGroups.forEach(function (group) {
      if (isIllustGroup(group) || isDecoGroup(group) || isIconFigureGroup(group)) return;
      total += group.items.length;
    });
    return total;
  }

  /** 큰 탭 — 도형 · 아이콘 · 일러스트 · 장식 · 카툰을 나눠 본다 */
  function tabRowHtml() {
    var tabs = [
      ['figure', '도형', shapeCount()],
      ['icon', '아이콘', IE.shapes.iconList.length],
      ['illust', '일러스트', groupItems(illustGroups())],
      ['deco', '장식', groupItems(decoGroups())],
      ['cartoon', '이미지·카툰', IE.cartoons ? IE.cartoons.all.length : 10]
    ];

    return '<div class="el-tabs">' +
      tabs.map(function (tab) {
        return '<button type="button" class="el-tab' + (tab[0] === elTab ? ' is-active' : '') +
          '" data-el-tab="' + tab[0] + '">' + tab[1] + ' <b>' + tab[2] + '</b></button>';
      }).join('') +
    '</div>';
  }

  /** 묶음들을 제목 + 큰 그리드로 그린다 (일러스트 · 장식 공용) */
  function bigGroupsHtml(groups, gridClass) {
    return groups.map(function (group) {
      return '<div class="fo-section">' +
        '<h3 class="fo-title">' + group.name +
          ' <b style="font-weight:400;color:var(--ink-3)">' + group.items.length + '</b></h3>' +
        '<div class="el-grid ' + gridClass + '" data-fig-group="' + group.id + '">' +
          group.items.map(figureCell).join('') +
        '</div>' +
      '</div>';
    }).join('');
  }

  /** 일러스트 — 부품마다 색이 정해져 있어 크게 보여 준다 */
  function illustHtml() {
    return bigGroupsHtml(illustGroups(), 'el-grid-illust') +
      '<p class="fo-hint">일러스트 <b>' + groupItems(illustGroups()) +
        '종</b> — 부품마다 색이 미리 정해져 있습니다. ' +
        '누르면 <b>그 배색 그대로</b> 들어가고, 넣은 뒤 속성 패널에서 잎·기둥처럼 ' +
        '<b>부품별로 색을 바꿀 수 있습니다.</b></p>';
  }

  /** PPT 장식 — 색이 미리 정해진 컬러 장식 */
  function decoHtml() {
    return bigGroupsHtml(decoGroups(), 'el-grid-deco') +
      '<p class="fo-hint">장식 <b>' + groupItems(decoGroups()) +
        '종</b> — 처음부터 색이 정해진 <b>컬러 장식</b>입니다. ' +
        '넣은 뒤 속성 패널에서 부품마다 색을 바꿀 수 있습니다.' +
        '<br>색을 테마에 맞춰야 하는 <b>단색 장식 33종은 아이콘 탭</b>에 있습니다.</p>';
  }

  /** 아이콘 성격의 단색 장식 — 아이콘 탭에서 함께 보여 준다 */
  function iconFiguresHtml() {
    var groups = iconFigureGroups();
    if (!groups.length) return '';

    return bigGroupsHtml(groups, 'el-grid-deco') +
      '<p class="fo-hint">장식 도형 <b>' + groupItems(groups) +
        '종</b> — 위에서 고른 색 하나로 배색이 <b>자동으로 배합</b>됩니다. ' +
        '색이 정해진 <b>컬러 장식은 장식 탭</b>에 있습니다.</p>';
  }

  function figuresHtml() {
    var groups = IE.shapes.figureGroups.filter(function (group) {
      return !isIllustGroup(group) && !isDecoGroup(group) && !isIconFigureGroup(group);
    }).map(function (group) {
      return '<div class="fo-section">' +
        '<h3 class="fo-title">' + group.name +
          ' <b style="font-weight:400;color:var(--ink-3)">' + group.items.length + '</b></h3>' +
        '<div class="el-grid" data-fig-group="' + group.id + '">' +
          group.items.map(figureCell).join('') +
        '</div>' +
      '</div>';
    }).join('');

    return '<div class="fo-section">' +
        '<h3 class="fo-title">도형 스타일</h3>' +
        figureStyleRowHtml() +
        '<p class="fo-hint">색을 고른 뒤 도형을 누르면 <b>그 색으로</b> 들어갑니다. ' +
          '<b>테두리 · 그라데이션</b>은 두 색을, <b>장식 · 무늬</b>는 여러 색을 함께 씁니다. ' +
          '넣은 뒤 속성 패널에서 색마다 바꿀 수 있습니다.</p>' +
      '</div>' +
      groups +
      '<div class="fo-section" style="margin-top:14px;padding-top:10px;border-top:1px solid var(--line);">' +
        '<h3 class="fo-title">빠른 배너 버튼 삽입</h3>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px;">' +
          '<button class="fo-btn" data-shape="btn-circle-chevron" style="margin-top:0" title="원형 화살표(셰브론) 버튼 추가">' +
            '<svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:none;"><circle cx="12" cy="12" r="10" fill="#2563eb"/><path d="M10.5 7.5l4.5 4.5-4.5 4.5" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>원형 화살표 버튼</button>' +
          '<button class="fo-btn" data-shape="btn-pill-cta" style="margin-top:0" title="배너용 완성형 바로가기 캡슐 버튼 추가">' +
            '<svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:none;"><rect x="1" y="6" width="22" height="12" rx="6" fill="#2563eb"/><circle cx="18" cy="12" r="4" fill="#ffffff"/><path d="M17 10.5l1.8 1.5-1.8 1.5" stroke="#2563eb" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>바로가기 캡슐</button>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">' +
          '<button class="fo-btn" data-shape="pill" style="margin-top:0" title="배너 버튼용 알약형 라운드 사각형">' +
            '<svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;"><rect x="2" y="7" width="20" height="10" rx="5"/></svg>캡슐(반원) 도형</button>' +
          '<button class="fo-btn" data-shape="line" style="margin-top:0">' +
            '<svg viewBox="0 0 24 24"><path d="M3.5 12h17"/></svg>가로 선 추가</button>' +
        '</div>' +
      '</div>';
  }

  function iconsHtml() {
    if (!iconCategory) iconCategory = IE.shapes.categories[0].id;

    var search = '<label class="el-search">' +
      '<svg viewBox="0 0 24 24"><path d="M10 2a8 8 0 1 0 4.9 14.3l5.4 5.4 1.4-1.4-5.4-5.4A8 8 0 0 0 10 2zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12z"/></svg>' +
      '<input type="search" id="el-search" placeholder="이름으로 찾기 — 화살표, 사람, 차트…" value="' +
        elSearch.replace(/"/g, '&quot;') + '">' +
    '</label>';

    var chips = '<div class="chip-row" id="el-cats">' +
      IE.shapes.categories.map(function (category) {
        return '<button class="chip' +
          (category.id === iconCategory && !elSearch ? ' is-active' : '') +
          '" data-el-cat="' + category.id + '">' + category.name +
          ' <b>' + category.items.length + '</b></button>';
      }).join('') +
    '</div>';

    return '<div class="fo-section">' +
        '<h3 class="fo-title">아이콘 스타일</h3>' +
        styleRowHtml() +
        '<p class="fo-hint">아이콘 스타일에 따라 <b>1~4색</b>이 함께 정해집니다. ' +
          '<b>부품</b>은 리본의 가운데 띠와 양쪽 끈처럼 <b>조각마다 색이 다르고</b>, ' +
          '넣은 뒤 속성 패널에서 색마다 바꿀 수 있습니다.</p>' +
      '</div>' +
      iconFiguresHtml() +
      '<div class="fo-section">' +
        '<h3 class="fo-title">아이콘 <b style="font-weight:400;color:var(--ink-3)">' +
          IE.shapes.iconList.length + '</b></h3>' +
        search + chips +
        '<div class="el-grid" id="el-grid">' + elGridHtml() + '</div>' +
      '</div>';
  }

  function cartoonGridHtml(items) {
    if (!items.length) {
      return '<div style="grid-column:1/-1;padding:28px 0;text-align:center;color:var(--ink-3);font-size:12px;">일치하는 캐릭터 이미지가 없습니다.</div>';
    }
    return items.map(function (it) {
      return '<button type="button" class="el-cartoon-card" data-cartoon-id="' + it.id + '" title="' + it.title + ' — 클릭하여 캔버스에 추가">' +
        '<div class="el-cartoon-thumb">' +
          '<img src="' + it.src + '" alt="' + it.title + '" loading="lazy" />' +
        '</div>' +
        '<div class="el-cartoon-info">' +
          '<div class="el-cartoon-title">' + it.title + '</div>' +
          '<div class="el-cartoon-sub">' + it.categoryName + '</div>' +
        '</div>' +
      '</button>';
    }).join('');
  }

  function cartoonHtml() {
    var categories = (IE.cartoons && IE.cartoons.categories) || [
      { id: 'all', name: '전체' },
      { id: 'military', name: '국군 · 병영' },
      { id: 'gov', name: '공공기관 · 행정' },
      { id: 'anime', name: '일본 만화풍' }
    ];

    var chips = '<div class="chip-row" id="el-cartoon-cats" style="margin-bottom:10px;">' +
      categories.map(function (c) {
        var count = 0;
        if (c.id === 'all') count = (IE.cartoons && IE.cartoons.all ? IE.cartoons.all.length : 0);
        else count = (IE.cartoons && IE.cartoons.all ? IE.cartoons.all.filter(function (it) { return it.category === c.id; }).length : 0);
        return '<button type="button" class="chip' + (c.id === cartoonCat && !cartoonSearch ? ' is-active' : '') +
          '" data-cartoon-cat="' + c.id + '">' + c.name + ' <b>' + count + '</b></button>';
      }).join('') +
    '</div>';

    var items = (IE.cartoons && IE.cartoons.all) || [];
    if (cartoonCat !== 'all') {
      items = items.filter(function (it) { return it.category === cartoonCat; });
    }
    if (cartoonSearch) {
      var q = cartoonSearch.toLowerCase();
      items = items.filter(function (it) {
        return (it.title && it.title.toLowerCase().indexOf(q) !== -1) ||
               (it.desc && it.desc.toLowerCase().indexOf(q) !== -1) ||
               (it.tags && it.tags.some(function(t) { return t.toLowerCase().indexOf(q) !== -1; }));
      });
    }

    var searchBox = '<label class="el-search" style="margin-bottom:8px;">' +
      '<svg viewBox="0 0 24 24"><path d="M10 2a8 8 0 1 0 4.9 14.3l5.4 5.4 1.4-1.4-5.4-5.4A8 8 0 0 0 10 2zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12z"/></svg>' +
      '<input type="search" id="el-cartoon-search" placeholder="이름으로 찾기 — 군인, 장병, 안내, 응원, 만화…" value="' +
        cartoonSearch.replace(/"/g, '&quot;') + '">' +
    '</label>';

    return '<div class="fo-section">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">' +
        '<h3 class="fo-title" style="margin:0;">카툰 · AI 캐릭터 일러스트 <b style="font-weight:400;color:var(--ink-3)">' + items.length + '</b></h3>' +
        '<span style="font-size:10.5px;color:var(--brand-700);font-weight:600;background:var(--brand-soft);padding:2px 7px;border-radius:10px;border:1px solid rgba(37,99,235,0.2);">투명 배경 Cutout</span>' +
      '</div>' +
      searchBox +
      chips +
      '<div class="el-cartoon-grid" id="el-cartoon-grid">' + cartoonGridHtml(items) + '</div>' +
      '<p class="fo-hint" style="margin-top:10px;">' +
        '모든 캐릭터 이미지는 <b>배경이 투명하게 제거(누끼)</b>되어 있어 배너, 카드뉴스, 보고서 슬라이드 등 어디에나 자연스럽게 얹어 사용할 수 있습니다.' +
      '</p>' +
    '</div>';
  }

  function elementsHtml() {
    var body = iconsHtml();
    if (elTab === 'figure') body = figuresHtml();
    else if (elTab === 'illust') body = illustHtml();
    else if (elTab === 'deco') body = decoHtml();
    else if (elTab === 'cartoon') body = cartoonHtml();

    // 일러스트 · 장식 · 카툰은 색이 미리 정해져 있어 색 팔레트를 보여 주지 않는다
    if (elTab === 'illust' || elTab === 'deco' || elTab === 'cartoon') return tabRowHtml() + body;

    var colors = '<div class="fo-section">' +
      '<h3 class="fo-title">색</h3>' +
      '<div class="el-colors" id="el-colors">' + colorRowHtml() + '</div>' +
    '</div>';

    return tabRowHtml() + colors + body;
  }

  function textPreview(kind) {
    var spec = {
      title: { size: 22, weight: 700, text: '제목' },
      subtitle: { size: 16, weight: 600, text: '부제목' },
      body: { size: 13, weight: 400, text: '본문' },
      caption: { size: 11, weight: 400, text: '작은 글씨' }
    }[kind];

    return '<span style="font-size:' + spec.size + 'px;font-weight:' + spec.weight +
      ';line-height:1">' + spec.text + '</span>';
  }

  /* ------------------------------------------------------------ 글꼴 고르기

     글꼴이 수십 개라 이름을 그 글꼴로 그려 주고, 지금 고른 텍스트가 쓰는
     글꼴을 강조한다. 이 PC에 설치된 글꼴은 따로 묶고, 이름으로 찾을 수 있다. */

  var fontTab = '한글';
  var fontSearch = '';

  /** 지금 고른 텍스트가 쓰는 글꼴 (없으면 null) */
  function currentFontFamily() {
    var canvas = IE.state.canvas;
    var active = canvas && canvas.getActiveObject();
    if (!active) return null;

    if (active.type === 'activeSelection') {
      var list = active.getObjects();
      for (var i = 0; i < list.length; i++) {
        if (list[i].kind === 'text') return list[i].fontFamily || null;
      }
      return null;
    }

    return active.kind === 'text' ? (active.fontFamily || null) : null;
  }

  function fontMatches(font) {
    if (!fontSearch) return true;

    var q = fontSearch.toLowerCase();
    return font.label.toLowerCase().indexOf(q) !== -1 ||
      font.value.toLowerCase().indexOf(q) !== -1;
  }

  function fontRowHtml(font, current) {
    var family = IE.fonts.css(font.value) + ',sans-serif';

    return '<button type="button" class="font-row' +
      (font.value === current ? ' is-current' : '') +
      '" data-font="' + font.value + '" data-no-fit="1" title="' + font.value + '">' +
      '<span class="font-row-name" style="font-family:' + family + '">' +
        font.label + '</span>' +
      '<span class="font-row-sample" style="font-family:' + family + '">가나다 Aa 123</span>' +
    '</button>';
  }

  /** 글꼴 목록 알맹이 — 검색할 때 이 부분만 다시 그린다 */
  function fontBlocksHtml() {
    var data = IE.fonts.all();
    var current = currentFontFamily();
    var safe = data.safe.filter(fontMatches);
    var mine = (fontTab === '영문' ? data.latin : data.korean).filter(fontMatches);

    if (!safe.length && !mine.length) {
      return '<p class="fo-hint">맞는 글꼴이 없습니다.</p>';
    }

    var blocks = '<div class="font-group">' +
      '<span class="font-group-name">어디에나 있음</span>' +
      safe.map(function (f) { return fontRowHtml(f, current); }).join('') +
      '</div>';

    if (mine.length) {
      blocks += '<div class="font-group">' +
        '<span class="font-group-name">내 PC · ' + fontTab +
          ' <b>' + mine.length + '</b></span>' +
        mine.map(function (f) { return fontRowHtml(f, current); }).join('') +
        '</div>';
    }

    return blocks;
  }

  function fontListHtml() {
    var data = IE.fonts.all();
    var counts = IE.fonts.counts();

    var tabs = [['한글', data.korean.length], ['영문', data.latin.length]];

    var chips = tabs.map(function (t) {
      return '<button type="button" class="photo-tab' + (t[0] === fontTab ? ' is-active' : '') +
        '" data-font-tab="' + t[0] + '">' + t[0] + ' <b>' + t[1] + '</b></button>';
    }).join('');

    return '<div class="fo-section">' +
      '<h3 class="fo-title">글꼴 <b style="font-weight:400;color:var(--ink-3)">' +
        (counts.safe + counts.korean + counts.latin) + '</b></h3>' +
      '<label class="el-search">' +
        '<svg viewBox="0 0 24 24"><path d="M10 2a8 8 0 1 0 4.9 14.3l5.4 5.4 1.4-1.4-5.4-5.4A8 8 0 0 0 10 2zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12z"/></svg>' +
        '<input type="search" id="font-search" placeholder="글꼴 이름으로 찾기" value="' +
          fontSearch.replace(/"/g, '&quot;') + '">' +
      '</label>' +
      '<div class="photo-tabs">' + chips + '</div>' +
      '<div class="font-list" id="font-list">' + fontBlocksHtml() + '</div>' +
      '<p class="fo-hint">글꼴을 누르면 <b>고른 텍스트</b>에 바로 적용됩니다. ' +
        '<b>내 PC</b> 묶음은 이 컴퓨터에 설치된 글꼴 ' +
        (counts.korean + counts.latin) + '개입니다.</p>' +
      '<button class="fo-btn" id="font-apply-all">이 페이지의 모든 텍스트에 적용</button>' +
    '</div>';
  }

  function textHtml() {
    return '<div class="fo-section">' +
      '<h3 class="fo-title">텍스트 스타일</h3>' +
      '<div class="text-styles">' +
        ['title', 'subtitle', 'body', 'caption'].map(function (kind) {
          return '<button class="fo-btn" data-text="' + kind + '">' +
            textPreview(kind) + '</button>';
        }).join('') +
      '</div>' +
    '</div>' +
    '<div class="fo-section">' +
      '<h3 class="fo-title">직접 추가</h3>' +
      '<button class="fo-btn solid" data-text="plain">빈 텍스트 상자 추가</button>' +
    '</div>' +
    fontListHtml();
  }

  var photoCat = '배경';
  var photoGroup = '전체';
  var photoSearch = '';

  function photoHtml() {
    var recent = '';

    if (recentImages.length) {
      recent = '<div class="fo-section">' +
        '<h3 class="fo-title">최근 올린 이미지</h3>' +
        '<div class="el-grid">' +
          recentImages.map(function (src, i) {
            return '<button class="el-cell" data-recent="' + i + '" style="padding:0;overflow:hidden">' +
              '<img src="' + src + '" alt="" style="width:100%;height:100%;object-fit:cover">' +
            '</button>';
          }).join('') +
        '</div>' +
      '</div>';
    }

    return '<div class="fo-section">' +
      '<div class="drop-zone" id="drop-zone">' +
        '<svg viewBox="0 0 24 24"><path d="M12 16V4M7.5 8.5 12 4l4.5 4.5M4 16v3a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 19v-3"/></svg>' +
        '<b>내 사진을 끌어다 놓으세요</b>' +
        '<small>또는 클릭해서 파일 선택</small>' +
      '</div>' +
    '</div>' + recent + photoTemplatesHtml();
  }

  /**
   * 기본으로 넣어 둔 사진 — 배경 / 인물 / 에셋.
   * 배포물에 그림이 그대로 박혀 있어 인터넷이 없어도 나온다.
   *
   * 갈래마다 160장, 모두 480장이라 한 줄로 늘어놓으면 못 찾는다.
   *   갈래 탭(배경 / 인물 / 에셋) → 그 안의 묶음(사무 · 업무 / 자연 …) → 사진
   * 으로 좁혀 들어가고, 이름으로도 찾을 수 있다.
   */
  function photoTemplatesHtml() {
    var all = IE.photos || [];
    if (!all.length) return '';

    var cats = [];
    all.forEach(function (p) { if (cats.indexOf(p.cat) < 0) cats.push(p.cat); });
    if (cats.indexOf(photoCat) < 0) photoCat = cats[0];

    var tabs = cats.map(function (c) {
      var n = all.filter(function (p) { return p.cat === c; }).length;
      return '<button type="button" class="photo-tab' + (c === photoCat ? ' is-active' : '') +
        '" data-photo-cat="' + c + '">' + c + ' <b>' + n + '</b></button>';
    }).join('');

    /* 이 갈래의 사진과, 사진이 놓인 차례대로의 묶음 */
    var mine = all.filter(function (p) { return p.cat === photoCat; });
    var groups = [];

    mine.forEach(function (p) {
      var g = p.group || '기본';
      if (groups.indexOf(g) < 0) groups.push(g);
    });

    if (photoGroup !== '전체' && groups.indexOf(photoGroup) < 0) photoGroup = '전체';

    function groupOf(p) { return p.group || '기본'; }
    function countIn(g) {
      return mine.filter(function (p) { return groupOf(p) === g; }).length;
    }

    var picker = '<label class="photo-pick">' +
      '<span>묶음</span>' +
      '<select id="photo-group">' +
        '<option value="전체"' + (photoGroup === '전체' ? ' selected' : '') + '>' +
          '전체 보기 — ' + mine.length + '장</option>' +
        groups.map(function (g) {
          return '<option value="' + g + '"' + (g === photoGroup ? ' selected' : '') + '>' +
            g + ' — ' + countIn(g) + '장</option>';
        }).join('') +
      '</select>' +
    '</label>';

    var needle = photoSearch.replace(/\s+/g, '');
    var shown = mine.filter(function (p) {
      if (photoGroup !== '전체' && groupOf(p) !== photoGroup) return false;
      if (!needle) return true;
      return (p.label + groupOf(p)).replace(/\s+/g, '').indexOf(needle) >= 0;
    });

    /* 묶음 차례를 지키면서 머리글을 끼워 넣는다 */
    var blocks = [];
    var curGroup = null;
    var buf = [];

    function flush() {
      if (!buf.length) return;
      blocks.push('<h4 class="photo-group">' +
        '<span>' + curGroup + '</span><b>' + buf.length + '</b></h4>' +
        '<div class="photo-grid">' + buf.join('') + '</div>');
      buf = [];
    }

    shown.forEach(function (p) {
      var g = groupOf(p);
      if (g !== curGroup) { flush(); curGroup = g; }
      buf.push('<button type="button" class="photo-card" data-photo="' + p.id +
        '" title="' + p.label + '">' +
        '<img src="' + p.src + '" alt="" loading="lazy" decoding="async">' +
        '<b>' + p.label + '</b>' +
      '</button>');
    });
    flush();

    var body = blocks.length
      ? blocks.join('')
      : '<p class="fo-hint">' + (needle
          ? '"' + photoSearch + '" 와 맞는 사진이 없습니다.'
          : '이 묶음에는 아직 사진이 없습니다.') + '</p>';

    return '<div class="fo-section">' +
      '<h3 class="fo-title">기본 사진 <span class="fo-count">' + all.length + '장</span></h3>' +
      '<div class="photo-tabs">' + tabs + '</div>' +
      '<label class="el-search">' +
        '<svg viewBox="0 0 24 24"><path d="M10 2a8 8 0 1 0 4.9 14.3l5.4 5.4 1.4-1.4-5.4-5.4A8 8 0 0 0 10 2zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12z"/></svg>' +
        '<input type="search" id="photo-search" placeholder="사진 이름으로 찾기" value="' +
          photoSearch.replace(/"/g, '&quot;') + '">' +
      '</label>' +
      picker +
      '<div class="photo-list" id="photo-list">' + body + '</div>' +
      '<p class="fo-hint">누르면 캔버스에 올라갑니다. ' +
        '<b>배경</b> 사진은 페이지를 꽉 채워 맨 뒤에 깔립니다.</p>' +
    '</div>';
  }

  function tableHtml() {
    var cells = '';
    for (var r = 1; r <= 8; r++) {
      for (var c = 1; c <= 8; c++) {
        cells += '<span data-cell="' + r + 'x' + c + '"></span>';
      }
    }

    return '<div class="fo-section">' +
      '<h3 class="fo-title">표 크기</h3>' +
      '<div class="table-picker">' +
        '<div class="table-picker-readout" id="tbl-readout">' +
          tableSize.rows + ' × ' + tableSize.cols + '</div>' +
        '<div class="table-picker-grid" id="tbl-grid">' + cells + '</div>' +
      '</div>' +
    '</div>' +
    '<div class="fo-section">' +
      '<label class="check-row"><input type="checkbox" id="tbl-header"' +
        (tableHeader ? ' checked' : '') + '><span>첫 행을 머리글로 사용</span></label>' +
    '</div>' +
    '<button class="fo-btn solid" id="tbl-insert">표 추가</button>' +
    '<p class="fo-hint" style="margin-top:10px">표를 선택하면 오른쪽에서 행·열·테두리를 바꿀 수 있습니다.</p>';
  }

  var BG_COLORS = [
    '#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0',
    '#f0f9ff', '#e0f2fe', '#bae6fd', '#7dd3fc',
    '#fff7ed', '#fef9c3', '#ecfdf5', '#eff6ff',
    '#eef2ff', '#fdf2f8', '#1e293b', '#0f172a'
  ];

  function backgroundHtml() {
    var page = IE.doc ? IE.doc.current() : null;
    var active = (page && page.background) || '#ffffff';
    var activeHex = (typeof active === 'string' && active.indexOf('#') === 0) ? active : '#ffffff';

    var swatches = BG_COLORS.map(function (color) {
      return '<button class="swatch' + (color.toLowerCase() === String(active).toLowerCase() ? ' is-active' : '') +
        '" data-bg="' + color + '" style="background:' + color + '" title="' + color + '"></button>';
    }).join('');

    var gradients = IE.canvas.gradientPresets.filter(function (p) {
      return p.id !== 'none';
    }).map(function (preset) {
      var stops = preset.stops.map(function (s) {
        return s.color + ' ' + Math.round(s.offset * 100) + '%';
      }).join(',');
      return '<button class="swatch" data-bg-gradient="' + preset.id + '" title="' + preset.label +
        '" style="background:linear-gradient(135deg,' + stops + ')"></button>';
    }).join('');

    var skyPhotos = (IE.photos || []).filter(function (p) {
      return p.cat === '배경' && (p.label.indexOf('하늘') >= 0 || p.label.indexOf('구름') >= 0 || p.label.indexOf('노을') >= 0);
    });

    var skyPhotoHtml = '';
    if (skyPhotos.length) {
      skyPhotoHtml = '<div class="fo-section">' +
        '<h3 class="fo-title">하늘 · 구름 사진 배경</h3>' +
        '<div class="el-grid" style="grid-template-columns:repeat(3,1fr);gap:8px">' +
          skyPhotos.map(function (p) {
            return '<button class="el-cell" data-bg-photo="' + p.id + '" style="padding:0;overflow:hidden;height:68px;position:relative" title="' + p.label + '">' +
              '<img src="' + p.src + '" alt="' + p.label + '" style="width:100%;height:100%;object-fit:cover">' +
              '<span style="position:absolute;bottom:0;left:0;right:0;background:rgba(15,23,42,0.65);color:#fff;font-size:10px;text-align:center;padding:2px 0">' + p.label + '</span>' +
            '</button>';
          }).join('') +
        '</div>' +
      '</div>';
    }

    var customBg = '<div class="custom-bg-picker-bar">' +
      '<label class="color-picker-box" title="클릭하여 색상 선택">' +
        '<input type="color" id="panel-bg-custom" value="' + activeHex + '">' +
        '<span class="color-picker-thumb" id="panel-bg-thumb" style="background:' + activeHex + '"></span>' +
      '</label>' +
      '<input type="text" id="panel-bg-hex" class="color-hex-input" value="' + activeHex.toUpperCase() + '" maxlength="7" spellcheck="false" placeholder="#FFFFFF">' +
      '<span class="custom-bg-label">직접 선택</span>' +
    '</div>';

    return '<div class="fo-section">' +
      '<h3 class="fo-title">배경색</h3>' +
      customBg +
      '<div class="swatch-row">' + swatches + '</div>' +
    '</div>' +
    '<div class="fo-section">' +
      '<h3 class="fo-title">그라데이션</h3>' +
      '<div class="swatch-row">' + gradients + '</div>' +
    '</div>' +
    skyPhotoHtml +
    '<div class="fo-section">' +
      '<label class="check-row"><input type="checkbox" id="bg-all">' +
      '<span>모든 페이지에 적용</span></label>' +
    '</div>' +
    '<button class="fo-btn" id="bg-clear">배경 없애기 (투명)</button>';
  }

  var SECTIONS = {
    templates: { title: '템플릿', html: function () { return IE.gallery.bodyHtml(); }, bind: bindTemplates },
    elements: { title: '요소', html: elementsHtml, bind: bindElements },
    text: { title: '텍스트', html: textHtml, bind: bindText },
    photo: { title: '사진', html: photoHtml, bind: bindPhoto },
    table: { title: '표', html: tableHtml, bind: bindTable },
    background: { title: '배경', html: backgroundHtml, bind: bindBackground },
    privacy: {
      title: '개인정보 점검',
      html: function () { return IE.privacy ? IE.privacy.panelHtml() : ''; },
      bind: function (h) { if (IE.privacy) IE.privacy.bindPanel(h); }
    },
    market: {
      title: '공유마켓 · 템플릿 나눔',
      html: function () { return IE.market ? IE.market.panelHtml() : ''; },
      bind: function (h) { if (IE.market) IE.market.bindPanel(h); }
    }
  };

  /* ============================================================ 열기/닫기 */

  function body() { return util.$('flyout-body'); }

  function render() {
    if (!current) return;

    var section = SECTIONS[current];
    if (!section) return;

    util.$('flyout-title').textContent = section.title;
    body().innerHTML = section.html();
    section.bind(body());

    util.watchFit(body());
    util.refitButtonsSoon(body());
  }

  function setRailActive() {
    Array.prototype.forEach.call(document.querySelectorAll('.rail-item'), function (item) {
      item.classList.toggle('is-active', item.getAttribute('data-panel') === current);
    });
  }

  function open(id) {
    if (!SECTIONS[id]) return;

    current = id;
    util.$('flyout').hidden = false;
    setRailActive();
    render();

    if (IE.state.autoFit && IE.canvas) {
      setTimeout(function () { IE.canvas.zoomToFit(); }, 0);
    }
  }

  function close() {
    current = null;
    iconCallback = null;
    util.$('flyout').hidden = true;
    setRailActive();

    if (IE.state.autoFit && IE.canvas) {
      setTimeout(function () { IE.canvas.zoomToFit(); }, 0);
    }
  }

  function toggle(id) {
    if (current === id) close();
    else open(id);
  }

  function refresh() {
    if (current) render();
  }

  function currentId() { return current; }

  /* ============================================================ 바인딩 */

  function bindTemplates(host) {
    IE.gallery.bind(host);
  }

  /** 요소 칸에 클릭을 건다 — 지금 고른 색을 실어 보낸다 */
  function bindElementCells(scope) {
    Array.prototype.forEach.call(scope.querySelectorAll('[data-icon]'), function (button) {
      button.addEventListener('click', function () {
        var name = button.getAttribute('data-icon');

        if (iconCallback) {
          var cb = iconCallback;
          iconCallback = null;
          cb(name);
          close();
          return;
        }
        IE.canvas.addIcon(name, IE.shapes.iconColorsFor(elColor, elStyle), elStyle);
      });
    });

    Array.prototype.forEach.call(scope.querySelectorAll('[data-figure]'), function (button) {
      button.addEventListener('click', function () {
        var figName = button.getAttribute('data-figure');
        if (figName === 'roundSquare') {
          IE.canvas.addShape('roundrect', elColor);
          return;
        }
        if (figName === 'square') {
          IE.canvas.addShape('rect', elColor);
          return;
        }
        IE.canvas.addFigure(figName, elColor, elFigureStyle);
      });
    });
  }

  function bindElements(host) {
    bindElementCells(host);

    Array.prototype.forEach.call(host.querySelectorAll('[data-shape]'), function (button) {
      button.addEventListener('click', function () {
        IE.canvas.addShape(button.getAttribute('data-shape'), elColor);
      });
    });

    Array.prototype.forEach.call(host.querySelectorAll('[data-decor]'), function (button) {
      button.addEventListener('click', function () {
        IE.canvas.addDecor(button.getAttribute('data-decor'), elColor);
      });
    });

    function updateElColorUI(hex) {
      elColor = hex;
      var picker = host.querySelector('#el-custom-color');
      var thumb = host.querySelector('#el-custom-thumb');
      var hexIn = host.querySelector('#el-custom-hex');
      if (picker) picker.value = hex;
      if (thumb) thumb.style.background = hex;
      if (hexIn) hexIn.value = hex.toUpperCase();

      Array.prototype.forEach.call(host.querySelectorAll('[data-el-color]'), function (other) {
        other.classList.toggle('is-active', other.getAttribute('data-el-color').toLowerCase() === hex.toLowerCase());
      });
    }

    var customPicker = host.querySelector('#el-custom-color');
    var customHex = host.querySelector('#el-custom-hex');

    if (customPicker) {
      var onPickerInput = function (ev) {
        updateElColorUI(ev.target.value);
        repaintAll();
      };
      customPicker.addEventListener('input', onPickerInput);
      customPicker.addEventListener('change', onPickerInput);
    }

    if (customHex) {
      var applyHexInput = function () {
        var raw = customHex.value.trim();
        var valid = null;
        if (/^#?[0-9a-fA-F]{6}$/.test(raw)) {
          valid = (raw.indexOf('#') === 0 ? raw : '#' + raw).toLowerCase();
        } else if (/^#?[0-9a-fA-F]{3}$/.test(raw)) {
          var c = raw.replace('#', '');
          valid = ('#' + c[0] + c[0] + c[1] + c[1] + c[2] + c[2]).toLowerCase();
        }
        if (valid) {
          updateElColorUI(valid);
          repaintAll();
        } else {
          customHex.value = elColor.toUpperCase();
        }
      };
      customHex.addEventListener('change', applyHexInput);
      customHex.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          applyHexInput();
        }
      });
    }

    // 색 고르기 — 미리보기까지 그 색으로 바뀌어서 누르기 전에 보인다
    Array.prototype.forEach.call(host.querySelectorAll('[data-el-color]'), function (button) {
      button.addEventListener('click', function () {
        var nextColor = button.getAttribute('data-el-color');
        updateElColorUI(nextColor);
        repaintAll();
      });
    });

    // 아이콘 스타일 — 단색 / 배지 / 연한 / 원형
    Array.prototype.forEach.call(host.querySelectorAll('[data-el-style]'), function (button) {
      button.addEventListener('click', function () {
        elStyle = button.getAttribute('data-el-style');

        Array.prototype.forEach.call(host.querySelectorAll('[data-el-style]'), function (other) {
          other.classList.toggle('is-active', other === button);
        });

        repaintAll();
      });
    });

    // 도형 스타일 — 면 / 테두리 / 그라데이션
    Array.prototype.forEach.call(host.querySelectorAll('[data-el-figstyle]'), function (button) {
      button.addEventListener('click', function () {
        elFigureStyle = button.getAttribute('data-el-figstyle');

        Array.prototype.forEach.call(host.querySelectorAll('[data-el-figstyle]'), function (other) {
          other.classList.toggle('is-active', other === button);
        });

        repaintFigures();
      });
    });

    // 도형 / 아이콘 탭 — 패널을 통째로 다시 그린다
    Array.prototype.forEach.call(host.querySelectorAll('[data-el-tab]'), function (button) {
      button.addEventListener('click', function () {
        elTab = button.getAttribute('data-el-tab');
        render();
      });
    });

    /** 도형 그리드를 지금 색·스타일로 다시 그린다 */
    function repaintFigures() {
      Array.prototype.forEach.call(host.querySelectorAll('[data-fig-group]'), function (grid) {
        var id = grid.getAttribute('data-fig-group');
        var group = null;

        IE.shapes.figureGroups.forEach(function (item) { if (item.id === id) group = item; });

        grid.innerHTML = (group ? group.items : []).map(figureCell).join('');
        bindElementCells(grid);
      });
    }

    /** 색·스타일이 바뀌면 미리보기를 다시 그린다 (칸마다 이벤트를 다시 건다) */
    function repaintAll() {
      repaintFigures();

      var grid = host.querySelector('#el-grid');
      if (grid) {
        grid.innerHTML = elGridHtml();
        bindElementCells(grid);
      }
    }

    // 검색 — 목록만 다시 그린다. 칸을 통째로 새로 그리면 입력 중에 커서가 끊긴다
    function repaint() {
      var grid = host.querySelector('#el-grid');
      if (!grid) return;
      grid.innerHTML = elGridHtml();
      bindElementCells(grid);
    }

    var search = host.querySelector('#el-search');
    if (search) {
      search.addEventListener('input', function () {
        elSearch = search.value.trim();

        Array.prototype.forEach.call(host.querySelectorAll('[data-el-cat]'), function (chip) {
          chip.classList.remove('is-active');
        });

        repaint();
      });
    }

    Array.prototype.forEach.call(host.querySelectorAll('[data-el-cat]'), function (button) {
      button.addEventListener('click', function () {
        iconCategory = button.getAttribute('data-el-cat');

        var box = host.querySelector('#el-search');
        if (box) box.value = '';
        elSearch = '';

        Array.prototype.forEach.call(host.querySelectorAll('[data-el-cat]'), function (other) {
          other.classList.toggle('is-active', other === button);
        });

        repaint();
      });
    });

    // 카툰 카드 클릭 이벤트 바인딩
    function bindCartoonCards(scope) {
      Array.prototype.forEach.call(scope.querySelectorAll('[data-cartoon-id]'), function (btn) {
        btn.addEventListener('click', function () {
          var cid = btn.getAttribute('data-cartoon-id');
          var item = IE.cartoons ? IE.cartoons.get(cid) : null;
          if (item && item.src) {
            IE.canvas.addImage(item.src);
          }
        });
      });
    }

    bindCartoonCards(host);

    // 카툰 카테고리 칩 클릭
    Array.prototype.forEach.call(host.querySelectorAll('[data-cartoon-cat]'), function (btn) {
      btn.addEventListener('click', function () {
        cartoonCat = btn.getAttribute('data-cartoon-cat');
        var searchIn = host.querySelector('#el-cartoon-search');
        if (searchIn) searchIn.value = '';
        cartoonSearch = '';
        render();
      });
    });

    // 카툰 검색 입력
    var cSearch = host.querySelector('#el-cartoon-search');
    if (cSearch) {
      cSearch.addEventListener('input', function () {
        cartoonSearch = cSearch.value.trim();
        var grid = host.querySelector('#el-cartoon-grid');
        if (grid && IE.cartoons) {
          var items = IE.cartoons.all;
          if (cartoonCat !== 'all') {
            items = items.filter(function (it) { return it.category === cartoonCat; });
          }
          if (cartoonSearch) {
            var q = cartoonSearch.toLowerCase();
            items = items.filter(function (it) {
              return (it.title && it.title.toLowerCase().indexOf(q) !== -1) ||
                     (it.desc && it.desc.toLowerCase().indexOf(q) !== -1) ||
                     (it.tags && it.tags.some(function(t) { return t.toLowerCase().indexOf(q) !== -1; }));
            });
          }
          grid.innerHTML = cartoonGridHtml(items);
          bindCartoonCards(grid);
        }
      });
    }
  }

  function bindText(host) {
    Array.prototype.forEach.call(host.querySelectorAll('[data-text]'), function (button) {
      button.addEventListener('click', function () {
        IE.canvas.addTextPreset(button.getAttribute('data-text'));
      });
    });

    Array.prototype.forEach.call(host.querySelectorAll('[data-font-tab]'), function (button) {
      button.addEventListener('click', function () {
        fontTab = button.getAttribute('data-font-tab');
        refresh();
      });
    });

    bindFontRows(host);

    // 검색 — 목록만 다시 그린다. 칸을 통째로 새로 그리면 입력 중에 커서가 끊긴다
    var search = host.querySelector('#font-search');
    if (search) {
      search.addEventListener('input', function () {
        fontSearch = search.value.trim();

        var list = host.querySelector('#font-list');
        if (!list) return;

        list.innerHTML = fontBlocksHtml();
        bindFontRows(list);
      });
    }

    var all = host.querySelector('#font-apply-all');
    if (all) {
      all.addEventListener('click', function () {
        applyFont(null);
      });
    }
  }

  /** 글꼴 줄에 클릭을 건다 (검색으로 다시 그린 뒤에도 다시 걸어야 한다) */
  function bindFontRows(scope) {
    Array.prototype.forEach.call(scope.querySelectorAll('[data-font]'), function (button) {
      button.addEventListener('click', function () {
        applyFont(button.getAttribute('data-font'));
      });
    });
  }

  /** 마지막으로 고른 글꼴 — "모든 텍스트에 적용" 이 이걸 쓴다 */
  var lastFont = null;

  /**
   * 글꼴을 적용한다.
   *
   *  - 글꼴을 누르면 : 텍스트를 골라 뒀으면 그것만, 안 골랐으면 페이지 전체
   *  - [모든 텍스트에 적용] : 방금 고른 글꼴을 페이지 전체에
   *
   * 이 앱의 텍스트는 fabric.Textbox 라서 type 이 'textbox' 다.
   * 앱이 붙여 둔 표시(kind === 'text')로 골라야 한다.
   */
  function applyFont(name) {
    var canvas = IE.state.canvas;
    var active = canvas.getActiveObject();
    var target = active && active.kind === 'text' ? active : null;

    if (name) lastFont = name;

    var family = name || lastFont || (target && target.fontFamily) || IE.canvas.FONT;
    var texts = canvas.getObjects().filter(function (obj) { return obj.kind === 'text'; });
    if (!texts.length) return;

    // 글꼴을 직접 고른 경우에만 "고른 것 하나"로 좁힌다
    var only = (name && target) ? target : null;

    texts.forEach(function (obj) {
      if (only && obj !== only) return;
      obj.set('fontFamily', family);
      obj.dirty = true;
    });

    canvas.requestRenderAll();
    IE.state.history.snapshot();
    IE.properties.refresh();
    refresh();
  }

  function bindPhoto(host) {
    var zone = host.querySelector('#drop-zone');

    if (zone) {
      zone.addEventListener('click', function () {
        IE.app.openImagePicker(null, null);
      });

      zone.addEventListener('dragover', function (ev) {
        ev.preventDefault();
        zone.classList.add('is-over');
      });
      zone.addEventListener('dragleave', function () {
        zone.classList.remove('is-over');
      });
      zone.addEventListener('drop', function (ev) {
        ev.preventDefault();
        zone.classList.remove('is-over');
        var files = ev.dataTransfer && ev.dataTransfer.files;
        if (files && files.length) IE.app.addImageFiles(files);
      });
    }

    Array.prototype.forEach.call(host.querySelectorAll('[data-recent]'), function (button) {
      button.addEventListener('click', function () {
        var src = recentImages[parseInt(button.getAttribute('data-recent'), 10)];
        if (src) IE.canvas.addImage(src);
      });
    });

    Array.prototype.forEach.call(host.querySelectorAll('[data-photo-cat]'), function (button) {
      button.addEventListener('click', function () {
        photoCat = button.getAttribute('data-photo-cat');
        photoGroup = '전체';
        refresh();
      });
    });

    /* 묶음 고르기 — 이 갈래 안에서 다시 좁힌다 */
    var picker = host.querySelector('#photo-group');
    if (picker) {
      picker.addEventListener('change', function () {
        photoGroup = picker.value;
        refresh();
      });
    }

    /* 사진 카드 — 목록만 다시 그릴 때도 다시 묶어야 하므로 함수로 빼 둔다 */
    function bindPhotoCards(root) {
      Array.prototype.forEach.call(root.querySelectorAll('[data-photo]'), function (button) {
        button.addEventListener('click', function () {
          var id = button.getAttribute('data-photo');
          var photo = null;

          (IE.photos || []).forEach(function (p) { if (p.id === id) photo = p; });
          if (!photo) return;

          var isBackdrop = photo.cat === '배경';
          IE.canvas.addImage(photo.src, null, { cover: isBackdrop, back: isBackdrop });
        });
      });
    }

    bindPhotoCards(host);

    /* 검색 — 목록만 다시 그린다 (입력 중에 커서가 끊기지 않게) */
    var photoFind = host.querySelector('#photo-search');
    if (photoFind) {
      photoFind.addEventListener('input', function () {
        photoSearch = photoFind.value.trim();

        // 찾기는 갈래 전체에서 본다 — 묶음이 걸려 있으면 풀어 준다
        photoGroup = '전체';
        if (picker) picker.value = '전체';

        var box = host.querySelector('#photo-list');
        if (!box) return;
        var again = document.createElement('div');
        again.innerHTML = photoTemplatesHtml();
        var fresh = again.querySelector('#photo-list');
        box.innerHTML = fresh ? fresh.innerHTML : '';
        bindPhotoCards(box);
      });
    }
  }

  function bindTable(host) {
    var grid = host.querySelector('#tbl-grid');
    var readout = host.querySelector('#tbl-readout');
    if (!grid) return;

    function paint(rows, cols) {
      Array.prototype.forEach.call(grid.querySelectorAll('span'), function (cell) {
        var parts = cell.getAttribute('data-cell').split('x');
        var r = parseInt(parts[0], 10);
        var c = parseInt(parts[1], 10);
        cell.classList.toggle('on', r <= rows && c <= cols);
        cell.classList.toggle('edge', r === rows && c === cols);
      });
      readout.textContent = rows + ' × ' + cols;
    }

    paint(tableSize.rows, tableSize.cols);

    Array.prototype.forEach.call(grid.querySelectorAll('span'), function (cell) {
      var parts = cell.getAttribute('data-cell').split('x');
      var rows = parseInt(parts[0], 10);
      var cols = parseInt(parts[1], 10);

      cell.addEventListener('mouseenter', function () { paint(rows, cols); });
      cell.addEventListener('click', function () {
        tableSize = { rows: rows, cols: cols };
        paint(rows, cols);
      });
    });

    grid.addEventListener('mouseleave', function () {
      paint(tableSize.rows, tableSize.cols);
    });

    var header = host.querySelector('#tbl-header');
    if (header) {
      header.addEventListener('change', function () {
        tableHeader = header.checked;
      });
    }

    host.querySelector('#tbl-insert').addEventListener('click', function () {
      var cellW = Math.max(90, Math.round((IE.state.docW * 0.8) / tableSize.cols));
      IE.table.add({
        rows: tableSize.rows,
        cols: tableSize.cols,
        cellW: cellW,
        headerRow: tableHeader
      });
    });
  }

  function bindBackground(host) {
    function applyAll() {
      var box = host.querySelector('#bg-all');
      return !!(box && box.checked);
    }

    function updatePanelBgUI(hex) {
      var p = host.querySelector('#panel-bg-custom');
      var t = host.querySelector('#panel-bg-thumb');
      var h = host.querySelector('#panel-bg-hex');
      if (p) p.value = hex;
      if (t) t.style.background = hex;
      if (h) h.value = hex.toUpperCase();

      Array.prototype.forEach.call(host.querySelectorAll('[data-bg]'), function (other) {
        other.classList.toggle('is-active', other.getAttribute('data-bg').toLowerCase() === hex.toLowerCase());
      });
    }

    var bgPicker = host.querySelector('#panel-bg-custom');
    var bgHex = host.querySelector('#panel-bg-hex');

    if (bgPicker) {
      var onBgPicker = function (ev) {
        var val = ev.target.value;
        updatePanelBgUI(val);
        IE.doc.setBackground(val, applyAll());
      };
      bgPicker.addEventListener('input', onBgPicker);
      bgPicker.addEventListener('change', onBgPicker);
    }

    if (bgHex) {
      var applyBgHex = function () {
        var raw = bgHex.value.trim();
        var valid = null;
        if (/^#?[0-9a-fA-F]{6}$/.test(raw)) {
          valid = (raw.indexOf('#') === 0 ? raw : '#' + raw).toLowerCase();
        } else if (/^#?[0-9a-fA-F]{3}$/.test(raw)) {
          var c = raw.replace('#', '');
          valid = ('#' + c[0] + c[0] + c[1] + c[1] + c[2] + c[2]).toLowerCase();
        }
        if (valid) {
          updatePanelBgUI(valid);
          IE.doc.setBackground(valid, applyAll());
        } else {
          var page = IE.doc ? IE.doc.current() : null;
          var curBg = (page && page.background) || '#ffffff';
          bgHex.value = (curBg.indexOf('#') === 0 ? curBg : '#ffffff').toUpperCase();
        }
      };
      bgHex.addEventListener('change', applyBgHex);
      bgHex.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          applyBgHex();
        }
      });
    }

    Array.prototype.forEach.call(host.querySelectorAll('[data-bg]'), function (button) {
      button.addEventListener('click', function () {
        var bg = button.getAttribute('data-bg');
        updatePanelBgUI(bg);
        IE.doc.setBackground(bg, applyAll());
        refresh();
      });
    });

    Array.prototype.forEach.call(host.querySelectorAll('[data-bg-gradient]'), function (button) {
      button.addEventListener('click', function () {
        IE.doc.setBackgroundGradient(button.getAttribute('data-bg-gradient'), applyAll());
        refresh();
      });
    });

    Array.prototype.forEach.call(host.querySelectorAll('[data-bg-photo]'), function (button) {
      button.addEventListener('click', function () {
        var id = button.getAttribute('data-bg-photo');
        var photo = null;
        (IE.photos || []).forEach(function (p) { if (p.id === id) photo = p; });
        if (!photo) return;
        IE.canvas.addImage(photo.src, null, { cover: true, back: true });
        util.toast('「' + photo.label + '」 사진 배경을 적용했습니다.');
      });
    });

    var clear = host.querySelector('#bg-clear');
    if (clear) {
      clear.addEventListener('click', function () {
        IE.doc.setBackground('transparent', applyAll());
        refresh();
      });
    }
  }

  /* ============================================================ 초기화 */

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('.rail-item'), function (item) {
      item.addEventListener('click', function () {
        toggle(item.getAttribute('data-panel'));
      });
    });

    util.on('flyout-close', 'click', close);

    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && current && !util.$('flyout').hidden) {
        close();
      }
    });
  }

  IE.panel = {
    init: init,
    open: open,
    close: close,
    toggle: toggle,
    refresh: refresh,
    current: currentId,
    isOpen: function () { return !!current; },

    /* 요소 찾기 모드 (아이콘 교체 등) */
    pickIcon: function (callback) {
      iconCallback = callback || null;
      open('elements');
    },

    addRecent: function (src) {
      if (recentImages.indexOf(src) === -1) {
        recentImages.unshift(src);
        if (recentImages.length > 12) recentImages.pop();
      }
      if (current === 'photo') refresh();
    }
  };
})(window.IE);
