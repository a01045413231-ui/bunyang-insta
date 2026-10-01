// 사용법: node card/render.js data/파일.json  →  output/파일.png
const path = require('path');
const fs = require('fs');

function loadPlaywright() {
  for (const p of ['playwright', '/opt/node-tools/node_modules/playwright']) {
    try { return require(p); } catch {}
  }
  throw new Error('playwright 를 찾을 수 없습니다 (npm i playwright)');
}

const FIXED = { phone: '010-4541-3231', agency: '필수부동산' };

(async () => {
  const input = process.argv[2];
  if (!input) { console.error('사용법: node card/render.js data/파일.json'); process.exit(1); }
  const data = { ...FIXED, ...JSON.parse(fs.readFileSync(input, 'utf8')) };
  const out = path.join('output', path.basename(input, '.json') + '.png');
  fs.mkdirSync('output', { recursive: true });

  const { chromium } = loadPlaywright();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  await page.goto('file://' + path.resolve(__dirname, 'template.html'));
  await page.evaluate(d => document.fonts.ready.then(() => render(d)), data);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: out });
  await browser.close();
  console.log('완료:', out);
})();
