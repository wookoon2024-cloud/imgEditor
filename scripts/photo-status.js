'use strict';

/**
 * 사진 진행 상황 보기.
 *   node scripts/photo-status.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'photos');
const RAW = path.join(OUT, '_raw');
const PLAN = path.join(RAW, '_plan.json');

if (!fs.existsSync(PLAN)) {
  console.log('아직 계획이 없습니다. node scripts/gen-photos.js 를 먼저 돌리세요.');
  process.exit(0);
}

const plan = JSON.parse(fs.readFileSync(PLAN, 'utf8'));

function count(dir, ext) {
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir).filter(function (f) { return f.slice(-ext.length) === ext; }).length;
}

const rawN = count(RAW, '.jpg');
const cutN = count(OUT, '.jpg');

console.log('사진 진행 상황');
console.log('  원본 받음   ' + rawN + ' / ' + plan.length);
console.log('  오려냄      ' + cutN + ' / ' + plan.length);

/* 갈래·묶음별 */
const cats = [];
plan.forEach(function (p) { if (cats.indexOf(p.cat) < 0) cats.push(p.cat); });

cats.forEach(function (cat) {
  const mine = plan.filter(function (p) { return p.cat === cat; });
  const gotRaw = mine.filter(function (p) { return fs.existsSync(path.join(RAW, p.id + '.jpg')); }).length;
  const gotCut = mine.filter(function (p) {
    const f = path.join(OUT, p.id + '.jpg');
    return fs.existsSync(f) && fs.statSync(f).size > 2000;
  }).length;

  console.log('\n[' + cat + ']  원본 ' + gotRaw + '/' + mine.length + ' · 오려냄 ' + gotCut + '/' + mine.length);

  const groups = [];
  mine.forEach(function (p) { if (groups.indexOf(p.group) < 0) groups.push(p.group); });
  groups.forEach(function (g) {
    const gm = mine.filter(function (p) { return p.group === g; });
    const gc = gm.filter(function (p) {
      const f = path.join(OUT, p.id + '.jpg');
      return fs.existsSync(f) && fs.statSync(f).size > 2000;
    }).length;
    const bar = '█'.repeat(Math.round((gc / gm.length) * 12)) + '·'.repeat(12 - Math.round((gc / gm.length) * 12));
    console.log('   ' + g.padEnd(14, ' ') + ' ' + bar + ' ' + gc + '/' + gm.length);
  });
});

/* 크기 — 갈래마다 그림 크기가 달라 갈래별 평균으로 따로 센다 */
const OUT_DIR = OUT;
function sizeOf(id) {
  const f = path.join(OUT_DIR, id + '.jpg');
  return fs.existsSync(f) ? fs.statSync(f).size : 0;
}

let bytes = 0;
plan.forEach(function (p) { bytes += sizeOf(p.id); });

const avgAll = cutN ? Math.round(bytes / cutN) : 0;

let guess = 0;
let guessed = 0;
plan.forEach(function (p) {
  const mine = plan.filter(function (q) { return q.cat === p.cat; });
  const have = mine.filter(function (q) { return sizeOf(q.id) > 2000; });
  const per = have.length
    ? have.reduce(function (s, q) { return s + sizeOf(q.id); }, 0) / have.length
    : avgAll;
  guess += per;
  if (!have.length) guessed++;
});

console.log('\n오려낸 사진 ' + (bytes / 1048576).toFixed(2) + ' MB' +
  (cutN ? ' · 한 장 평균 ' + Math.round(avgAll / 1024) + 'KB' : ''));
console.log(plan.length + '장이 다 되면 약 ' + (guess / 1048576).toFixed(1) + ' MB ' +
  '(배포 HTML 은 base64 로 약 1.35배 → ' + ((guess * 1.35) / 1048576).toFixed(1) + ' MB)' +
  (guessed ? ' · ' + guessed + '종은 아직 없어 전체 평균으로 추정' : ''));

const left = plan.length - cutN;
if (left > 0) {
  const mins = Math.round(left * 45 / 60);
  console.log('\n남은 ' + left + '장 — 약 ' + mins + '분 (장당 45초 기준)');
  console.log('이어서 받으려면:  node scripts/gen-photos.js');
  console.log('오려내려면:       node scripts/crop-photos.js');
} else {
  console.log('\n전부 끝났습니다. node scripts/build.js 로 배포물을 만들세요.');
}
