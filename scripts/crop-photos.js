'use strict';

/**
 * 워터마크 오려내기 — _raw 에 받아 둔 원본에서 오른쪽 아래 워터마크를 잘라내고
 * 목표 크기로 assets/photos 에 저장한다. 목록과 상자는 _raw/_plan.json 을 따른다.
 *
 *   node scripts/crop-photos.js            전체
 *   node scripts/crop-photos.js --cat 배경  한 갈래만
 *   node scripts/crop-photos.js --jobs 30   한 번에 몇 장씩 (기본 30)
 *   node scripts/crop-photos.js --force     이미 있어도 다시 오려낸다
 *   node scripts/crop-photos.js --quality 0.75   JPEG 품질 (기본 0.8)
 *
 * 이미 잘라 둔 파일이 있으면 건너뛴다.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'photos');
const RAW = path.join(OUT, '_raw');
const PLAN = path.join(RAW, '_plan.json');

const args = process.argv.slice(2);
function opt(name) { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; }
function flag(name) { return args.indexOf(name) >= 0; }

const CAT = opt('--cat');
const BATCH = Math.max(1, parseInt(opt('--jobs') || '30', 10) || 30);
const FORCE = flag('--force');
const QUALITY = parseFloat(opt('--quality') || '0.8');

const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
].find(p => fs.existsSync(p));

if (!CHROME) {
  console.error('크롬을 찾을 수 없습니다.');
  process.exit(1);
}

if (!fs.existsSync(PLAN)) {
  console.error('_plan.json 이 없습니다. 먼저 node scripts/gen-photos.js 를 돌리세요.');
  process.exit(1);
}

const plan = JSON.parse(fs.readFileSync(PLAN, 'utf8'));
let todo = plan.filter(function (p) {
  if (CAT && p.cat !== CAT) return false;
  if (FORCE) return true;
  const out = path.join(OUT, p.id + '.jpg');
  return !fs.existsSync(out) || fs.statSync(out).size < 2000;
}).filter(function (p) {
  return fs.existsSync(path.join(RAW, p.id + '.jpg'));
});

const missing = plan.filter(function (p) {
  return !fs.existsSync(path.join(RAW, p.id + '.jpg'));
}).length;

if (!todo.length) {
  console.log('오려낼 것이 없습니다. (원본 ' + plan.length + '장 중 ' + missing + '장은 아직 없음)');
  process.exit(0);
}

console.log('오려낼 사진 ' + todo.length + '장 · 한 번에 ' + BATCH + '장' +
  (missing ? ' · 원본 없는 것 ' + missing + '장' : '') + '\n');

function chunk(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

function buildPage(items) {
  const payload = items.map(function (it) {
    const b64 = fs.readFileSync(path.join(RAW, it.id + '.jpg')).toString('base64');
    return { id: it.id, src: 'data:image/jpeg;base64,' + b64, crop: it.crop };
  });

  return '<!doctype html><meta charset="utf-8"><pre id="out">working</pre><script>\n' +
    'var ITEMS = ' + JSON.stringify(payload) + ';\n' +
    'var Q = ' + QUALITY + ';\n' +
    'window.addEventListener("load", function () {\n' +
    '  var results = [];\n' +
    '  function one(i) {\n' +
    '    if (i >= ITEMS.length) {\n' +
    '      document.getElementById("out").textContent = "JSON:" + JSON.stringify(results);\n' +
    '      return;\n' +
    '    }\n' +
    '    var it = ITEMS[i];\n' +
    '    var img = new Image();\n' +
    '    img.onload = function () {\n' +
    '      var c = document.createElement("canvas");\n' +
    '      c.width = it.crop.w; c.height = it.crop.h;\n' +
    '      var g = c.getContext("2d");\n' +
    '      g.drawImage(img, it.crop.x, it.crop.y, it.crop.w, it.crop.h, 0, 0, it.crop.w, it.crop.h);\n' +
    '      results.push({ id: it.id, data: c.toDataURL("image/jpeg", Q).split(",")[1] });\n' +
    '      one(i + 1);\n' +
    '    };\n' +
    '    img.onerror = function () { results.push({ id: it.id, data: null }); one(i + 1); };\n' +
    '    img.src = it.src;\n' +
    '  }\n' +
    '  one(0);\n' +
    '});\n' +
    '</script>';
}

const pageFile = path.join(ROOT, 'scripts', '_crop.html');
let done = 0;
let bytes = 0;

const batches = chunk(todo, BATCH);

batches.forEach(function (items, bi) {
  fs.writeFileSync(pageFile, buildPage(items), 'utf8');

  const prof = path.join(ROOT, 'scripts', '_crop_prof');
  let dom;
  try {
    dom = execFileSync(CHROME, [
      '--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
      '--window-size=1000,800', '--user-data-dir=' + prof,
      '--virtual-time-budget=60000', '--dump-dom',
      'file:///' + pageFile.replace(/\\/g, '/')
    ], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
  } catch (err) {
    console.log('  묶음 ' + (bi + 1) + ' 크롬 실행 실패: ' + err.message);
    return;
  } finally {
    fs.rmSync(prof, { recursive: true, force: true });
  }

  const m = dom.match(/JSON:(\[[\s\S]*?\])<\/pre>/);
  if (!m) {
    console.log('  묶음 ' + (bi + 1) + ' 결과를 못 읽었습니다.');
    return;
  }

  const got = JSON.parse(m[1]);
  got.forEach(function (r) {
    if (!r.data) { console.log('  실패 ' + r.id); return; }
    const buf = Buffer.from(r.data, 'base64');
    fs.writeFileSync(path.join(OUT, r.id + '.jpg'), buf);
    done++;
    bytes += buf.length;
  });

  console.log('  묶음 ' + (bi + 1) + '/' + batches.length + ' — ' + got.length + '장 처리');
});

fs.rmSync(pageFile, { force: true });
fs.rmSync(path.join(ROOT, 'scripts', '_crop_prof'), { recursive: true, force: true });

/* 잘라낸 결과만 모아 manifest 를 다시 쓴다 (빌드가 이 파일을 읽는다) */
const ready = plan.filter(function (p) {
  const f = path.join(OUT, p.id + '.jpg');
  return fs.existsSync(f) && fs.statSync(f).size > 2000;
});
const manifest = ready.map(function (p) {
  return { id: p.id, cat: p.cat, group: p.group, label: p.label, file: p.id + '.jpg', w: p.w, h: p.h };
});
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');

const total = ready.reduce(function (s, p) { return s + fs.statSync(path.join(OUT, p.id + '.jpg')).size; }, 0);
const byCat = {};
ready.forEach(function (p) { byCat[p.cat] = (byCat[p.cat] || 0) + 1; });

console.log('\n오려낸 사진 ' + done + '장 · ' + (bytes / 1048576).toFixed(2) + ' MB');
console.log('manifest ' + manifest.length + '장 — ' +
  Object.keys(byCat).map(function (c) { return c + ' ' + byCat[c]; }).join(' · ') +
  ' · 전체 ' + (total / 1048576).toFixed(2) + ' MB');

/* 잘라 둔 것이 다 있으면 _raw 는 지워도 된다 */
const left = plan.filter(function (p) {
  return !fs.existsSync(path.join(OUT, p.id + '.jpg'));
}).length;
if (!left) {
  console.log('모두 끝났습니다. _raw 폴더는 지워도 됩니다 (지우려면 --clean).');
  if (flag('--clean')) {
    fs.rmSync(RAW, { recursive: true, force: true });
    console.log('_raw 를 지웠습니다.');
  }
} else {
  console.log('아직 오려내지 못한 원본이 ' + left + '장 있습니다. 다시 실행하세요.');
}
