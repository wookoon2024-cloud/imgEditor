const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9333;
const BRAIN_DIR = "C:\\Users\\user\\.gemini\\antigravity\\brain\\bef997b6-0059-4eca-9eec-ac6234b790db";
const OUT_CARTOONS_DIR = path.resolve(__dirname, '../assets/cartoons');
const CARTOONS_JS = path.resolve(__dirname, '../src/js/cartoons.js');

const ITEMS = [
  {
    id: 'mil_airforce_pilot',
    file: 'airforce_pilot_1789776758569.jpg',
    title: '공군 전투조종사',
    category: 'military',
    categoryName: '국군 · 병영',
    desc: '비행복과 조종 헬멧을 착용한 늠름하고 자신감 넘치는 공군 전투조종사 (AI 생성)',
    tags: ['공군', '조종사', '파일럿', '전투기', '비행복', '헬멧', '국방', 'AI']
  },
  {
    id: 'mil_navy_sailor',
    file: 'navy_sailor_1789776773345.jpg',
    title: '해군 수병',
    category: 'military',
    categoryName: '국군 · 병영',
    desc: '하얀 세일러복과 수병모를 착용하고 당당하게 거수경례하는 대한민국 해군 수병 (AI 생성)',
    tags: ['해군', '수병', '세일러복', '거수경례', '해상', '국방', 'AI']
  },
  {
    id: 'mil_navy_officer',
    file: 'navy_officer_1789776789185.jpg',
    title: '해군 장교',
    category: 'military',
    categoryName: '국군 · 병영',
    desc: '네이비 정복과 금장 계급장, 정모를 착용하고 든든하게 팔짱을 낀 해군 장교 (AI 생성)',
    tags: ['해군', '장교', '정복', '계급장', '정모', '국방', '지휘', 'AI']
  },
  {
    id: 'mil_marine_red',
    file: 'marine_soldier_1789776802767.jpg',
    title: '해병대 병사',
    category: 'military',
    categoryName: '국군 · 병영',
    desc: '상륙 디지털 위장복과 상징적인 빨간 명찰, 팔각모를 쓰고 엄지척을 하는 늠름한 해병대원 (AI 생성)',
    tags: ['해병대', '해병', '빨간명찰', '팔각모', '위장복', '엄지척', '국방', 'AI']
  },
  {
    id: 'mil_airforce_mechanic',
    file: 'airforce_mechanic_1789776817917.jpg',
    title: '공군 항공정비사',
    category: 'military',
    categoryName: '국군 · 병영',
    desc: '작업복과 렌치를 들고 항공기 안전을 점검하는 밝고 성실한 공군 정비사 (AI 생성)',
    tags: ['공군', '정비사', '항공기', '렌치', '작업복', '정비', '국방', 'AI']
  },
  {
    id: 'mil_doctor',
    file: 'military_doctor_1789776836087.jpg',
    title: '군의관',
    category: 'military',
    categoryName: '국군 · 병영',
    desc: '군복 위에 의사 가운을 걸치고 청진기와 차트를 든 친절한 군의관 (AI 생성)',
    tags: ['군의관', '의무', '군복', '청진기', '가운', '의무병', '국방', 'AI']
  }
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

class CDP {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 0;
    this.callbacks = new Map();
  }
  init() {
    return new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const cb = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) cb.reject(new Error(msg.error.message));
          else cb.resolve(msg.result);
        }
      };
    });
  }
  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.id;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true
    });
    return res.result ? res.result.value : null;
  }
  close() { this.ws.close(); }
}

async function main() {
  console.log('Starting Chrome for cartoon image processing...');
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${PORT}`,
    'about:blank'
  ]);

  let targets = null;
  for (let i = 0; i < 20; i++) {
    await sleep(500);
    try {
      targets = await fetchJson(`http://127.0.0.1:${PORT}/json`);
      if (targets && targets.length > 0) break;
    } catch (e) {}
  }

  const target = targets.find(t => t.type === 'page') || targets[0];
  const cdp = new CDP(target.webSocketDebuggerUrl);
  await cdp.init();
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');

  const processedResults = [];

  for (const item of ITEMS) {
    const fullPath = path.join(BRAIN_DIR, item.file);
    if (!fs.existsSync(fullPath)) {
      console.error('File not found:', fullPath);
      continue;
    }
    const b64 = fs.readFileSync(fullPath).toString('base64');
    const dataUrl = `data:image/jpeg;base64,${b64}`;

    console.log(`Processing ${item.title} (${item.id})...`);

    // 브라우저 내부에서 Canvas flood fill 누끼 및 리사이즈 수행
    const result = await cdp.evaluate(`
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const w = img.naturalWidth;
          const h = img.naturalHeight;
          const c = document.createElement('canvas');
          c.width = w;
          c.height = h;
          const ctx = c.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, w, h);
          const data = imgData.data;

          // 외곽 테두리에서 시작하는 BFS flood-fill로 배경 투명화
          const isBg = new Uint8Array(w * h);
          const queue = [];

          function isWhiteBg(idx) {
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            // 밝은 흰색/미색 배경 (RGB 모두 238 이상)
            return r >= 238 && g >= 238 && b >= 238;
          }

          // 4면 가장자리 픽셀을 큐에 삽입
          for (let x = 0; x < w; x++) {
            const topIdx = x * 4;
            const btmIdx = ((h - 1) * w + x) * 4;
            if (isWhiteBg(topIdx)) { isBg[x] = 1; queue.push(x); }
            const btmP = (h - 1) * w + x;
            if (isWhiteBg(btmIdx)) { isBg[btmP] = 1; queue.push(btmP); }
          }
          for (let y = 0; y < h; y++) {
            const leftIdx = (y * w) * 4;
            const rightIdx = (y * w + (w - 1)) * 4;
            const leftP = y * w;
            const rightP = y * w + (w - 1);
            if (!isBg[leftP] && isWhiteBg(leftIdx)) { isBg[leftP] = 1; queue.push(leftP); }
            if (!isBg[rightP] && isWhiteBg(rightIdx)) { isBg[rightP] = 1; queue.push(rightP); }
          }

          let head = 0;
          while (head < queue.length) {
            const p = queue[head++];
            const x = p % w;
            const y = (p - x) / w;

            const neighbors = [
              x > 0 ? p - 1 : -1,
              x < w - 1 ? p + 1 : -1,
              y > 0 ? p - w : -1,
              y < h - 1 ? p + w : -1
            ];

            for (let i = 0; i < 4; i++) {
              const np = neighbors[i];
              if (np >= 0 && !isBg[np]) {
                if (isWhiteBg(np * 4)) {
                  isBg[np] = 1;
                  queue.push(np);
                }
              }
            }
          }

          // 알파 마스크 적용 & 테두리 페더링
          for (let i = 0; i < w * h; i++) {
            if (isBg[i]) {
              data[i * 4 + 3] = 0; // 완전 투명
            }
          }

          // 경계면 안티앨리어싱: 투명 픽셀과 맞닿은 가장자리 부드럽게
          for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
              const p = y * w + x;
              if (data[p * 4 + 3] > 0) {
                // 주변에 투명 픽셀이 있는지 확인
                let transparentNeighbors = 0;
                if (isBg[p - 1]) transparentNeighbors++;
                if (isBg[p + 1]) transparentNeighbors++;
                if (isBg[p - w]) transparentNeighbors++;
                if (isBg[p + w]) transparentNeighbors++;

                if (transparentNeighbors > 0) {
                  // 가장자리 픽셀 흰색 번짐 제거(디컨태미네이션) 및 알파 스무딩
                  data[p * 4 + 3] = Math.round(255 * (1 - transparentNeighbors * 0.22));
                }
              }
            }
          }

          ctx.putImageData(imgData, 0, 0);

          // 최종 360x360 캔버스로 리사이즈
          const targetSize = 360;
          const outCanvas = document.createElement('canvas');
          outCanvas.width = targetSize;
          outCanvas.height = targetSize;
          const outCtx = outCanvas.getContext('2d');
          outCtx.imageSmoothingEnabled = true;
          outCtx.imageSmoothingQuality = 'high';

          // 가운데 정렬 맞춤
          const scale = Math.min(targetSize / w, targetSize / h);
          const dw = w * scale;
          const dh = h * scale;
          const dx = (targetSize - dw) / 2;
          const dy = (targetSize - dh) / 2;
          outCtx.drawImage(c, dx, dy, dw, dh);

          const webpUri = outCanvas.toDataURL('image/webp', 0.88);
          const pngUri = outCanvas.toDataURL('image/png');
          resolve({ webpUri, pngUri });
        };
        img.onerror = reject;
        img.src = "${dataUrl}";
      })
    `);

    // 1. assets/cartoons/<id>.png 저장
    const pngB64 = result.pngUri.replace(/^data:image\/png;base64,/, '');
    const outPngPath = path.join(OUT_CARTOONS_DIR, `${item.id}.png`);
    fs.writeFileSync(outPngPath, Buffer.from(pngB64, 'base64'));

    processedResults.push({
      ...item,
      src: result.webpUri // WebP 인라인 Data URI
    });
    console.log(`Saved ${item.id}.png and generated WebP URI (${Math.round(result.webpUri.length / 1024)} KB)`);
  }

  cdp.close();
  chromeProc.kill();

  console.log('Updating cartoons.js...');
  // cartoons.js 파일 업데이트
  // window.IE.cartoons.all 로드 후 새 항목들로 대체/추가
  let cartoonsJsContent = fs.readFileSync(CARTOONS_JS, 'utf8');

  // JSON 파싱을 위해 기존 CARTOONS 배열 추출
  const startMarker = 'var CARTOONS = [';
  const endMarker = '];';
  const startIdx = cartoonsJsContent.indexOf(startMarker);
  const endIdx = cartoonsJsContent.indexOf(endMarker, startIdx);

  if (startIdx === -1 || endIdx === -1) {
    throw new Error('CARTOONS array not found in cartoons.js');
  }

  const existingJsonStr = cartoonsJsContent.substring(startIdx + startMarker.length - 1, endIdx + 1);
  const existingList = JSON.parse(existingJsonStr);

  // ID별로 덮어쓰거나 추가
  const updatedList = [...existingList];
  for (const newItem of processedResults) {
    const idx = updatedList.findIndex(x => x.id === newItem.id);
    const cartoonItem = {
      id: newItem.id,
      title: newItem.title,
      category: newItem.category,
      categoryName: newItem.categoryName,
      desc: newItem.desc,
      tags: newItem.tags,
      src: newItem.src
    };
    if (idx >= 0) {
      updatedList[idx] = cartoonItem;
      console.log(`Replaced existing: ${newItem.id}`);
    } else {
      updatedList.push(cartoonItem);
      console.log(`Added new: ${newItem.id}`);
    }
  }

  const newArrayStr = JSON.stringify(updatedList, null, 2);
  const newContent = cartoonsJsContent.substring(0, startIdx + startMarker.length - 1) +
    newArrayStr +
    cartoonsJsContent.substring(endIdx + 1);

  fs.writeFileSync(CARTOONS_JS, newContent, 'utf8');
  console.log(`Successfully updated cartoons.js! Total items: ${updatedList.length}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
