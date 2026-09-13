'use strict';

/**
 * 사진 마무리 감시기 — 원본이 다 모일 때까지 지켜보다가
 * 오려내기와 빌드까지 자동으로 끝낸다.
 *
 *   node scripts/finish-photos.js
 *
 * 이미 도는 gen-photos.js 를 방해하지 않는다 (파일만 본다).
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const RAW = path.join(ROOT, 'assets', 'photos', '_raw');
const PLAN = path.join(RAW, '_plan.json');

if (!fs.existsSync(PLAN)) {
  console.error('_plan.json 이 없습니다.');
  process.exit(1);
}

const plan = JSON.parse(fs.readFileSync(PLAN, 'utf8'));
const TOTAL = plan.length;
const NODE = process.execPath;
const sleep = ms => new Promise(r => setTimeout(r, ms));

function rawCount() {
  if (!fs.existsSync(RAW)) return 0;
  return fs.readdirSync(RAW).filter(f => f.slice(-4) === '.jpg').length;
}

function cutCount() {
  const dir = path.join(ROOT, 'assets', 'photos');
  return plan.filter(p => {
    const f = path.join(dir, p.id + '.jpg');
    return fs.existsSync(f) && fs.statSync(f).size > 2000;
  }).length;
}

function run(script, args) {
  try {
    const out = execFileSync(NODE, [path.join(ROOT, 'scripts', script)].concat(args || []),
      { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    return out.trim();
  } catch (err) {
    return '실패: ' + err.message;
  }
}

(async function () {
  console.log('감시 시작 — 원본 ' + rawCount() + '/' + TOTAL);
  let idle = 0;
  let last = -1;

  for (;;) {
    await sleep(60000);
    const n = rawCount();

    if (n !== last) { last = n; idle = 0; } else { idle++; }

    /* 새로 온 것이 있으면 바로 오려낸다 */
    if (n > cutCount()) {
      const out = run('crop-photos.js');
      const m = out.match(/manifest \d+장[^\n]*/);
      console.log('[원본 ' + n + '/' + TOTAL + '] ' + (m ? m[0] : '오려냄'));
    }

    if (n >= TOTAL) {
      console.log('\n원본이 다 모였습니다 (' + n + '/' + TOTAL + ').');
      break;
    }

    /* 5분 넘게 늘지 않으면 생성기가 멈춘 것으로 본다 */
    if (idle >= 5) {
      console.log('\n원본이 5분째 늘지 않습니다 (' + n + '/' + TOTAL + '). 생성을 다시 시작합니다.');
      run('gen-photos.js');
      idle = 0;
    }
  }

  console.log('\n오려내기 마무리 (품질 0.8 로 전부 다시)');
  console.log(run('crop-photos.js', ['--force']));

  console.log('\n배포물 만들기');
  console.log(run('build.js'));

  console.log('\n끝났습니다. dist\\ImgEditor.html 확인하세요.');
})();
