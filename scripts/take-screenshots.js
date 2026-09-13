const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9222;
const HTML_PATH = 'file:///' + path.resolve(__dirname, '../dist/ImgEditor.html').replace(/\\/g, '/');
const OUTPUT_DIR = path.resolve(__dirname, '../assets/screenshots');

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
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
      this.ws.onopen = () => resolve();
      this.ws.onerror = (e) => reject(e);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const cb = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) {
            cb.reject(new Error(msg.error.message));
          } else {
            cb.resolve(msg.result);
          }
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

  async screenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const target = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(target, buffer);
    console.log(`Saved: ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
  }

  close() {
    this.ws.close();
  }
}

async function main() {
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${PORT}`,
    '--window-size=1600,1000',
    '--disable-extensions',
    '--no-first-run',
    HTML_PATH
  ]);

  let targets = null;
  for (let i = 0; i < 20; i++) {
    await sleep(500);
    try {
      targets = await fetchJson(`http://127.0.0.1:${PORT}/json`);
      if (targets && targets.length > 0) break;
    } catch (e) {
    }
  }

  if (!targets || targets.length === 0) {
    chromeProc.kill();
    process.exit(1);
  }

  const target = targets.find(t => t.type === 'page') || targets[0];
  const cdp = new CDP(target.webSocketDebuggerUrl);
  await cdp.init();
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');

  await sleep(2500);

  // 1. 메인 에디터
  await cdp.screenshot('01_main_editor.png');

  // 2. 템플릿 패널
  await cdp.evaluate(`window.IE.panel.open('templates');`);
  await sleep(800);
  await cdp.screenshot('02_templates_panel.png');

  // 3. 요소 패널
  await cdp.evaluate(`window.IE.panel.open('elements');`);
  await sleep(800);
  await cdp.screenshot('03_elements_panel.png');

  // 4. 사진 패널
  await cdp.evaluate(`window.IE.panel.open('photo');`);
  await sleep(800);
  await cdp.screenshot('04_photo_panel.png');

  // 5. 표 패널
  await cdp.evaluate(`window.IE.panel.open('table');`);
  await sleep(800);
  await cdp.screenshot('05_table_panel.png');

  // 6. PPT 템플릿 적용
  await cdp.evaluate(`
    window.IE.panel.close();
    const tpl = window.IE.templates.byId('ppt-deck-blue');
    if (tpl) {
      window.IE.canvas.applyTemplate(tpl);
    }
  `);
  await sleep(2000);
  await cdp.screenshot('06_ppt_deck.png');

  cdp.close();
  chromeProc.kill();
  console.log('Capture complete!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
