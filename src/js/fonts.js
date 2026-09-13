window.IE = window.IE || {};

(function (IE) {
  'use strict';

  /**
   * 글꼴 목록.
   *
   * 행정망은 인터넷이 없으니 웹폰트를 받아올 수 없다. 그래서
   *   - 어디에나 있는 기본 글꼴(SAFE)은 항상 목록에 넣고,
   *   - 나머지 후보(CANDIDATES)는 **이 PC 에 실제로 설치된 것만** 골라 넣는다.
   *
   * 설치 여부는 같은 글자를 두 글꼴로 그려 폭을 비교해 판단한다.
   * 설치돼 있지 않으면 대체 글꼴로 그려져 폭이 기준과 똑같아진다.
   */

  /** 설치 여부와 상관없이 항상 보여 줄 글꼴 (없으면 브라우저가 비슷한 것으로 대체) */
  var SAFE = [
    { value: 'Malgun Gothic', label: '맑은 고딕' },
    { value: 'Batang', label: '바탕' },
    { value: 'Gungsuh', label: '궁서' },
    { value: 'Gulim', label: '굴림' },
    { value: 'Dotum', label: '돋움' },
    { value: 'Arial', label: 'Arial' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Verdana', label: 'Verdana' }
  ];

  /** 한글 글꼴 — 한글 문서에서 흔히 쓰는 것들 */
  var KOREAN = [
    ['Malgun Gothic', '맑은 고딕'],
    ['Gulim', '굴림'],
    ['GulimChe', '굴림체'],
    ['Dotum', '돋움'],
    ['DotumChe', '돋움체'],
    ['Batang', '바탕'],
    ['BatangChe', '바탕체'],
    ['Gungsuh', '궁서'],
    ['GungsuhChe', '궁서체'],
    ['New Gulim', '새굴림'],
    ['Gowun Batang', '고운바탕'],
    ['Gowun Dodum', '고운돋움'],

    ['HCR Batang', '한컴바탕'],
    ['HCR Dotum', '한컴돋움'],
    ['HCR Gothic', '한컴고딕'],
    ['HCR Malgun', '한컴맑은고딕'],
    ['HCR SunBatang', '한컴순바탕'],
    ['HCR Jamo', '한컴자모'],

    ['HYHeadLine M', 'HY헤드라인M'],
    ['HYGothic-Medium', 'HY중고딕'],
    ['HYGungSo-Bold', 'HY궁서B'],
    ['HYMyeongJo-Medium', 'HY명조'],
    ['HYSinMyeongJo-Medium', 'HY신명조'],
    ['HYPost-Medium', 'HY포스트'],
    ['HYGraphic-Medium', 'HY그래픽'],
    ['HYRim-Medium', 'HY림'],
    ['HYBackJa-Medium', 'HY백자'],
    ['HYStory-Medium', 'HY스토리'],
    ['HYGyeongPil-Medium', 'HY경필'],

    ['NanumGothic', '나눔고딕'],
    ['NanumMyeongjo', '나눔명조'],
    ['NanumBarunGothic', '나눔바른고딕'],
    ['NanumGothicCoding', '나눔고딕코딩'],
    ['NanumSquare', '나눔스퀘어'],
    ['Noto Sans KR', '본고딕 (Noto Sans)'],
    ['Noto Serif KR', '본명조 (Noto Serif)'],
    ['Pretendard', '프리텐다드'],
    ['Spoqa Han Sans', '스포카 한 산스'],
    ['D2Coding', 'D2 코딩'],
    ['MaruBuri', '마루부리'],
    ['Gmarket Sans', '지마켓 산스'],
    ['Cafe24Ssurround', '카페24 써라운드'],
    ['S-Core Dream', '에스코어 드림'],
    ['SeoulHangang', '서울한강체'],
    ['SeoulNamsan', '서울남산체'],
    ['KoPub Batang', 'KoPub 바탕'],
    ['KoPub Dotum', 'KoPub 돋움'],
    ['Baekmuk Batang', '백묵 바탕'],
    ['UnBatang', '은바탕'],
    ['UnDotum', '은돋움'],
    ['UnGungsuh', '은궁서'],
    ['Binggrae', '빙그레체'],
    ['Chosunilbo Myeongjo', '조선일보명조']
  ];

  /** 영문 글꼴 */
  var LATIN = [
    ['Arial', 'Arial'],
    ['Arial Black', 'Arial Black'],
    ['Arial Narrow', 'Arial Narrow'],
    ['Bahnschrift', 'Bahnschrift'],
    ['Calibri', 'Calibri'],
    ['Cambria', 'Cambria'],
    ['Candara', 'Candara'],
    ['Comic Sans MS', 'Comic Sans MS'],
    ['Consolas', 'Consolas'],
    ['Constantia', 'Constantia'],
    ['Corbel', 'Corbel'],
    ['Courier New', 'Courier New'],
    ['Ebrima', 'Ebrima'],
    ['Franklin Gothic Medium', 'Franklin Gothic'],
    ['Gabriola', 'Gabriola'],
    ['Gadugi', 'Gadugi'],
    ['Georgia', 'Georgia'],
    ['Impact', 'Impact'],
    ['Ink Free', 'Ink Free'],
    ['Lucida Console', 'Lucida Console'],
    ['Lucida Sans Unicode', 'Lucida Sans'],
    ['Microsoft Sans Serif', 'Microsoft Sans Serif'],
    ['MS Gothic', 'MS 고딕'],
    ['MS Mincho', 'MS 명조'],
    ['Palatino Linotype', 'Palatino'],
    ['Segoe Print', 'Segoe Print'],
    ['Segoe Script', 'Segoe Script'],
    ['Segoe UI', 'Segoe UI'],
    ['SimSun', 'SimSun'],
    ['Sitka Text', 'Sitka'],
    ['Sylfaen', 'Sylfaen'],
    ['Tahoma', 'Tahoma'],
    ['Times New Roman', 'Times New Roman'],
    ['Trebuchet MS', 'Trebuchet MS'],
    ['Verdana', 'Verdana'],
    ['Yu Gothic', 'Yu Gothic']
  ];

  var GENERIC = [
    ['sans-serif', '기본 고딕'],
    ['serif', '기본 명조'],
    ['monospace', '고정폭'],
    ['cursive', '손글씨풍'],
    ['fantasy', '장식']
  ];

  /* -------------------------------------------------------- 설치 여부 재기 */

  var BOGUS = '___cmdc_not_a_font___';
  var SAMPLE = '가나다라마바사아자차 ABC abc WM 0123 @#%';
  var BASES = ['monospace', 'serif', 'sans-serif'];
  var probe = null;

  function measure(family) {
    if (!probe) {
      probe = document.createElement('canvas');
      probe.width = 8;
      probe.height = 8;
    }

    var c = probe.getContext('2d');
    c.font = '64px ' + family;
    return c.measureText(SAMPLE).width;
  }

  function installed(name) {
    var quoted = '"' + String(name).replace(/["\\]/g, '') + '"';
    var i;

    for (i = 0; i < BASES.length; i++) {
      var withFont = measure(quoted + ', ' + BASES[i]);
      var control = measure('"' + BOGUS + '", ' + BASES[i]);

      // 폭이 다르면 그 글꼴로 그려진 것 = 설치돼 있다
      if (withFont > 0 && Math.abs(withFont - control) > 0.5) return true;
    }
    return false;
  }

  /* ------------------------------------------------------------------ 목록 */

  var cached = null;

  /**
   * 글꼴 목록을 만든다. 한 번만 계산하고 그 뒤로는 재사용한다.
   * (글꼴을 새로 설치하면 새로 고침해야 보인다)
   */
  function build() {
    var safeValues = {};
    var safe = SAFE.map(function (f) {
      safeValues[f.value] = true;
      return { value: f.value, label: f.label, group: '기본' };
    });

    var local = [];

    function add(pairs, group) {
      pairs.forEach(function (pair) {
        if (safeValues[pair[0]]) return;
        safeValues[pair[0]] = true;
        if (!installed(pair[0])) return;
        local.push({ value: pair[0], label: pair[1], group: group });
      });
    }

    add(KOREAN, '한글');
    add(LATIN, '영문');

    return {
      safe: safe,
      korean: local.filter(function (f) { return f.group === '한글'; }),
      latin: local.filter(function (f) { return f.group === '영문'; }),
      local: local
    };
  }

  var api = {};

  api.SAFE = SAFE;

  api.all = function () {
    if (!cached) cached = build();
    return cached;
  };

  /** 평평한 목록 — 지금 쓰는 값이 목록에 없으면 맨 앞에 끼워 넣는다 */
  api.list = function (current) {
    var data = api.all();
    var out = data.safe.concat(data.local);

    if (current && !out.some(function (f) { return f.value === current; })) {
      out = [{ value: current, label: current + ' (현재)', group: '기타' }].concat(out);
    }
    return out;
  };

  /** 목록에 넣을 수 있게 묶음으로 — 기본 / 내 PC 한글 / 내 PC 영문 */
  api.groups = function (current) {
    var data = api.all();
    var groups = [{ label: '기본', fonts: data.safe }];

    if (data.korean.length) groups.push({ label: '내 PC · 한글', fonts: data.korean });
    if (data.latin.length) groups.push({ label: '내 PC · 영문', fonts: data.latin });

    if (current && !data.safe.concat(data.local).some(function (f) { return f.value === current; })) {
      groups.unshift({ label: '기타', fonts: [{ value: current, label: current }] });
    }
    return groups;
  };

  api.has = function (name) { return installed(name); };

  api.counts = function () {
    var data = api.all();
    return { safe: data.safe.length, korean: data.korean.length, latin: data.latin.length };
  };

  /** style="..." 안에 바로 넣을 수 있는 글꼴 이름 (홑따옴표) */
  api.css = function (name) {
    return "'" + String(name).replace(/['\\]/g, '') + "'";
  };

  IE.fonts = api;
})(window.IE);
