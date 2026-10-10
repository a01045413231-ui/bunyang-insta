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

// 인스타 설명란(캡션) 문구
function caption(d) {
  const tag = d.complex.replace(/\s+/g, '');
  return [
    `🏢 ${d.complex} ${d.type} 실시간 매물`,
    '',
    ...d.listings.map(l => `✔️ ${[l.dong, l.floor, l.memo].filter(Boolean).join(' ')} | ${l.price}`),
    '',
    `📅 ${d.date} 기준 · 실시간 거래중 · 시세 변동 가능`,
    '',
    '📞 매물 문의 요망 · 편하게 연락주세요!',
    d.agency,
    d.phone,
    '',
    `#${tag} #${tag}${d.type.replace(/타입$/, '')} #${tag}매물 #${d.agency} #실시간매물`,
  ].join('\n');
}

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
  const txt = out.replace(/\.png$/, '.txt');
  fs.writeFileSync(txt, caption(data) + '\n');
  console.log('완료:', out, txt);
  console.log('\n' + caption(data));
})();
