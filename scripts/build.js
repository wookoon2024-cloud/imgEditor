'use strict';

/**
 * 폐쇄망 배포용 단일 HTML 빌드 스크립트.
 *
 *   src/index.html + src/styles.css + src/vendor/fabric.min.js + src/js/*.js
 *      -> dist/ImgEditor.html  (외부 요청 0회, 인터넷/CDN 불필요)
 *
 * JS_ORDER 순서가 곧 <script> 실행 순서다. 의존성이 생기면 여기서만 조정하면 된다.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

const JS_ORDER = [
  'util.js',
  'fonts.js',
  'facedet.js',
  'shapes.js',
  'table.js',
  'templates.js',
  'store.js',
  'history.js',
  'canvas.js',
  'guides.js',
  'crop.js',
  'enhance.js',
  'cutout.js',
  'imgedit.js',
  'doc.js',
  'pagesettings.js',
  'pages.js',
  'panel.js',
  'gallery.js',
  'layers.js',
  'properties.js',
  'exporter.js',
  'app.js'
];

const VERSION = require(path.join(ROOT, 'package.json')).version;
const STAMP = new Date().toISOString();

/**
 * 각 모듈이 반드시 남겨야 하는 전역 (window.IE 기준 경로).
 * 하나라도 없으면 그 모듈이 로드 중에 예외로 죽었다는 뜻이다.
 */
const REQUIRED_EXPORTS = {
  'util.js': ['util.VERSION', 'util.$', 'util.on'],
  'fonts.js': ['fonts.list', 'fonts.groups', 'fonts.has', 'fonts.counts'],
  'facedet.js': ['facedet.detect', 'facedet.locate', 'facedet.guess'],
  'shapes.js': ['shapes.iconList', 'shapes.makeIcon'],
  'table.js': ['table.add', 'table.isTable'],
  'templates.js': ['templates.all', 'templates.byId', 'templates.categories', 'templates.isDeck'],
  'store.js': ['store.all', 'store.byId', 'store.save', 'store.importFile'],
  'history.js': ['History'],
  'canvas.js': ['canvas.applyTemplate', 'canvas.setImageSource', 'canvas.makeObject'],
  'guides.js': ['guides.init', 'guides.onMoving'],
  'crop.js': ['crop.enter', 'crop.isActive'],
  'enhance.js': [
    'enhance.autoParams', 'enhance.applyTone', 'enhance.liquify', 'enhance.skinMask',
    'enhance.blurRGB', 'enhance.applyDetail',
    'enhance.healSpot', 'enhance.applyVignette'
  ],
  'cutout.js': [
    'cutout.autoRemove', 'cutout.keepLargestComponent', 'cutout.sampleBackgrounds',
    'cutout.magicSelect', 'cutout.mergeMask', 'cutout.clearMask', 'cutout.softenMaskEdge',
    'cutout.brushSelect', 'cutout.invertMask', 'cutout.blurMask',
    'cutout.thresholdMask', 'cutout.fadeMask',
    'cutout.matteEdge', 'cutout.blurRGBA', 'cutout.blurMasked'
  ],
  'imgedit.js': [
    'imgedit.open', 'imgedit.isOpen', 'imgedit.setTab',
    'imgedit.selectAt', 'imgedit.selectStroke', 'imgedit.refineSelection',
    'imgedit.deleteSelection', 'imgedit.matteSelection', 'imgedit.blurSelection',
    'imgedit.clearSelection',
    'imgedit.setCropRatio', 'imgedit.resizeCropRect', 'imgedit.applyCropRatio',
    'imgedit.rotateCrop', 'imgedit.flipCrop', 'imgedit.setStraighten',
    'imgedit.defaultCropRect', 'imgedit.applyCrop', 'imgedit.resetCrop',
    'imgedit.applyPreset', 'imgedit.renderPresets', 'imgedit.healAt',
    'imgedit.facePresets', 'imgedit.renderFacePresets', 'imgedit.applyFacePreset',
    'imgedit.runFaceOps'
  ],
  'doc.js': ['doc.newDocument', 'doc.newDocumentFromTemplate', 'doc.count'],
  'pagesettings.js': ['pagesettings.init'],
  'pages.js': ['pages.refresh', 'pages.setVisible'],
  'panel.js': ['panel.open', 'panel.close'],
  'gallery.js': ['gallery.thumbnail', 'gallery.bodyHtml'],
  'layers.js': ['layers.refresh'],
  'properties.js': ['properties.refresh'],
  'exporter.js': ['exporter.saveProject', 'exporter.loadProject'],
  'app.js': ['app.init']
};

function read(file) {
  return fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
}

/** 인라인한 JS 안에 </script> 가 있으면 파서가 스크립트를 조기 종료시킨다. 이스케이프한다. */
function guardScript(code) {
  return code.replace(/<\/script/gi, '<\\/script');
}

/* ------------------------------------------------------------------ *
 * 모듈 로드 검사
 *
 * 실제로 모듈을 실행해 본다. 하나의 <script> 안에서 예외가 나면 그 뒤가
 * 전부 죽기 때문에(그리고 배포 파일은 눈으로 확인하기 어렵기 때문에)
 * 빌드 단계에서 잡는다.
 * ------------------------------------------------------------------ */

function elementStub() {
  const noop = function () {};
  return {
    style: {}, dataset: {},
    classList: { add: noop, remove: noop, toggle: noop, contains: function () { return false; } },
    addEventListener: noop, removeEventListener: noop, appendChild: noop, removeChild: noop,
    setAttribute: noop, getAttribute: function () { return null; }, hasAttribute: function () { return false; },
    querySelector: function () { return null; }, querySelectorAll: function () { return []; },
    getContext: function () { return null; },
    getBoundingClientRect: function () { return { width: 100, height: 100, left: 0, top: 0, right: 100, bottom: 100 }; },
    children: [], hidden: false, innerHTML: '', textContent: '', value: '', files: [],
    width: 0, height: 0, checked: false, max: '', min: ''
  };
}

function moduleSandbox() {
  const noop = function () {};

  const store = {};
  const localStorage = {
    getItem: function (k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
    setItem: function (k, v) { store[k] = String(v); },
    removeItem: function (k) { delete store[k]; }
  };

  const document = {
    createElement: function () { return elementStub(); },
    getElementById: function () { return null; },
    querySelector: function () { return null; },
    querySelectorAll: function () { return []; },
    addEventListener: noop,
    body: elementStub(),
    documentElement: elementStub()
  };

  const sandbox = {
    console: { log: noop, warn: noop, error: noop },
    document: document,
    navigator: { userAgent: 'build-check' },
    location: { href: 'file:///ImgEditor.html' },
    localStorage: localStorage,
    sessionStorage: localStorage,
    fabric: {},
    setTimeout: function () { return 0; },
    clearTimeout: noop,
    setInterval: function () { return 0; },
    clearInterval: noop,
    requestAnimationFrame: function () { return 0; },
    cancelAnimationFrame: noop,
    setTimeout_: noop,
    alert: noop,
    confirm: function () { return true; },
    prompt: function () { return null; },
    Image: function () { return elementStub(); },
    Blob: function () {},
    FileReader: function () {},
    URL: { createObjectURL: function () { return ''; }, revokeObjectURL: noop },
    Event: function () {},
    MouseEvent: function () {},
    addEventListener: noop,
    removeEventListener: noop
  };

  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.IE = {};

  return sandbox;
}

/** 로드되자마자 스스로 시작하는 모듈 — 격리 실행에서는 실패하는 게 정상이다 */
const AUTO_START = new Set(['app.js']);

/**
 * 모듈들을 실제 순서대로 하나의 샌드박스에서 실행한다.
 * 페이지에서 일어나는 일과 같은 조건이라, 의존 모듈(util 등)이 없는 상태에서
 * 잘못 죽는 경우까지 잡힌다.
 */
function checkModules(files) {
  const vm = require('vm');
  const sandbox = moduleSandbox();
  const failures = [];
  const notes = [];

  files.forEach((file) => {
    const name = path.basename(file);
    const code = read(file);

    let loadError = null;
    try {
      vm.runInNewContext(code, sandbox, { filename: name, timeout: 8000 });
    } catch (err) {
      loadError = err;
    }

    const root = sandbox.IE || {};
    const missing = [];

    (REQUIRED_EXPORTS[name] || []).forEach((dotted) => {
      const parts = dotted.split('.');
      let target = root;

      for (let i = 0; i < parts.length && target != null; i++) {
        target = target[parts[i]];
      }

      if (target === undefined || target === null) missing.push('IE.' + dotted);
    });

    if (missing.length) {
      const cause = loadError ? '  (원인: ' + loadError.message + ')' : '';
      failures.push(name + ': ' + missing.join(', ') + ' 가 없습니다' + cause);
      return;
    }

    // 전역은 남겼는데 오류가 났다면 자동 시작 때문일 수 있다. 알려만 준다.
    if (loadError && !AUTO_START.has(name)) {
      notes.push(name + ': 로드 중 오류 — ' + loadError.message);
    }
  });

  return { failures: failures, notes: notes };
}

/**
 * 기본 사진 템플릿을 data URI 로 심는다.
 *
 * assets/photos/ 에 만들어 둔 jpg 를 그대로 base64 로 넣기 때문에,
 * 배포 파일 하나만 복사해도 사진이 나온다 (인터넷·별도 파일 필요 없음).
 */
function photosScript() {
  const dir = path.join(ROOT, 'assets', 'photos');
  const manifestPath = path.join(dir, 'manifest.json');
  const header = 'window.IE = window.IE || {};\n';

  if (!fs.existsSync(manifestPath)) {
    return header + 'IE.photos = [];\n';
  }

  const manifest = JSON.parse(read(manifestPath));
  const items = [];

  manifest.forEach((p) => {
    const file = path.join(dir, p.file);
    if (!fs.existsSync(file)) return;

    const buf = fs.readFileSync(file);
    const ext = path.extname(p.file).slice(1).toLowerCase();
    const mime = ext === 'png' ? 'image/png' : 'image/jpeg';

    items.push({
      id: p.id,
      cat: p.cat,
      group: p.group || '',
      label: p.label,
      src: 'data:' + mime + ';base64,' + buf.toString('base64')
    });
  });

  const bytes = items.reduce((sum, it) => sum + it.src.length, 0);
  console.log('  기본 사진 ' + items.length + '장 (' +
    (bytes / 1024 / 1024).toFixed(2) + ' MB, 생성: scripts/gen-photos.js)');

  return header +
    '/* 기본 사진 ' + items.length + '장 — HuggingFace SD 3 Medium 으로 생성 (scripts/gen-photos.js) */\n' +
    'IE.photos = ' + JSON.stringify(items) + ';\n';
}

/**
 * 얼굴 검출기(pico.js + facefinder)를 심는다.
 *
 * 얼굴 인식은 보통 인터넷에 있는 서비스를 부른다. 행정망에서는 그럴 수 없으니
 * 검출기와 모델(약 230KB)을 통째로 넣어 브라우저 안에서 직접 돌린다.
 */
function faceModelScript() {
  const picoFile = path.join(SRC, 'vendor', 'pico.js');
  const binFile = path.join(SRC, 'vendor', 'facefinder.bin');
  const header = 'window.IE = window.IE || {};\n';

  if (!fs.existsSync(picoFile) || !fs.existsSync(binFile)) {
    console.log('  참고: 얼굴 검출기를 찾지 못했습니다 (성형 프리셋이 추정 위치로 동작)');
    return header;
  }

  const b64 = fs.readFileSync(binFile).toString('base64');
  console.log('  얼굴 검출기 pico.js + facefinder (' +
    (b64.length / 1024 / 1024).toFixed(2) + ' MB, 오프라인 동작)');

  return guardScript(read(picoFile)) + '\n\n' +
    header +
    '/* nenadmarkus/pico facefinder — 오프라인 얼굴 검출용 모델 */\n' +
    'IE.faceModel = "' + b64 + '";\n';
}

function build() {
  const missing = [];
  const jsFiles = JS_ORDER.map((name) => {
    const full = path.join(SRC, 'js', name);
    if (!fs.existsSync(full)) missing.push(path.relative(ROOT, full));
    return full;
  });
  const vendorFile = path.join(SRC, 'vendor', 'fabric.min.js');
  if (!fs.existsSync(vendorFile)) missing.push(path.relative(ROOT, vendorFile));
  const cssFile = path.join(SRC, 'styles.css');
  if (!fs.existsSync(cssFile)) missing.push(path.relative(ROOT, cssFile));

  if (missing.length) {
    console.error('빌드 중단 - 다음 파일이 없습니다:\n  ' + missing.join('\n  '));
    process.exit(1);
  }

  // 모듈을 실제 순서대로 실행해 보고, 필요한 전역이 남았는지 확인한다
  const report = checkModules(jsFiles);

  report.notes.forEach((note) => console.log('  참고: ' + note));

  if (report.failures.length) {
    console.error('빌드 중단 - 모듈 검사 실패:\n  ' + report.failures.join('\n  '));
    process.exit(1);
  }

  const shell = read(path.join(SRC, 'index.html'));
  const styles = read(cssFile);
  const vendor = read(vendorFile);

  const appJs = jsFiles
    .map((file) => {
      const name = path.basename(file);
      return (
        '<script>\n/* ===== src/js/' + name + ' ===== */\n' +
        guardScript(read(file)) +
        '\n</script>'
      );
    })
    .join('\n') +
    '\n<script>\n/* ===== 기본 사진 템플릿 ===== */\n' +
    guardScript(photosScript()) +
    '\n</script>' +
    '\n<script>\n/* ===== 오프라인 얼굴 검출기 ===== */\n' +
    faceModelScript() +
    '\n</script>';

  const banner = '/* ImgEditor v' + VERSION + ' | built ' + STAMP + ' | offline single-file build */';

  const out = shell
    .replace('/*@@STYLES@@*/', () => '\n' + styles + '\n')
    .replace('/*@@FABRIC@@*/', () => '\n' + banner + '\n' + guardScript(vendor) + '\n')
    .replace('/*@@APP@@*/', () => '\n' + appJs + '\n')
    .replace(/@@VERSION@@/g, VERSION)
    .replace(/@@BUILD_DATE@@/g, STAMP);

  if (out.indexOf('/*@@') !== -1) {
    console.error('빌드 중단 - 치환되지 않은 토큰이 남아 있습니다.');
    process.exit(1);
  }

  fs.mkdirSync(DIST, { recursive: true });
  const outFile = path.join(DIST, 'ImgEditor.html');
  fs.writeFileSync(outFile, out, 'utf8');

  const kb = (Buffer.byteLength(out, 'utf8') / 1024).toFixed(1);
  console.log('빌드 완료: ' + path.relative(ROOT, outFile) + '  (' + kb + ' KB)');
  console.log('모듈 ' + JS_ORDER.length + '개 + fabric + CSS -> 단일 HTML 1개');
}

build();
