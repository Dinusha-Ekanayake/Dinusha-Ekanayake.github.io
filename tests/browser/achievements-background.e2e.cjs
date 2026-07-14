const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-achievement-bg-qa-'));
const shots = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-achievement-bg-shots-'));
const port = 9347;
const pageUrl = `file:///${path.resolve('index.html').replace(/\\/g, '/')}`;
const browser = spawn(edge, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank'
], { stdio: 'ignore', windowsHide: true });
let ws;

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const assert = (condition, message) => { if (!condition) throw new Error(`ASSERTION: ${message}`); };
async function json(url, options) { return (await fetch(url, options)).json(); }
async function waitForCDP() {
  for (let attempt = 0; attempt < 60; attempt++) {
    try { return await json(`http://127.0.0.1:${port}/json/version`); } catch { await wait(100); }
  }
  throw new Error('Edge CDP did not start');
}

async function main() {
  const dataAsset = path.resolve('assets/achievements/dataxplore-finalist.jpg');
  const academicAsset = path.resolve('assets/achievements/best-al-results.jpg');
  assert(fs.existsSync(dataAsset) && fs.statSync(dataAsset).size > 40_000, 'DataXplore background asset is missing or unexpectedly small');
  assert(fs.existsSync(academicAsset) && fs.statSync(academicAsset).size > 100_000, 'G.C.E. A/L award background asset is missing or unexpectedly small');
  await waitForCDP();
  const target = await json(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(pageUrl)}`, { method: 'PUT' });
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let sequence = 0;
  const pending = new Map();
  const runtimeErrors = [];
  ws.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const handlers = pending.get(message.id);
      pending.delete(message.id);
      return message.error ? handlers.reject(new Error(message.error.message)) : handlers.resolve(message.result);
    }
    if (message.method === 'Runtime.exceptionThrown') runtimeErrors.push(message.params.exceptionDetails.text);
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const response = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (response.exceptionDetails) throw new Error(response.exceptionDetails.text);
    return response.result.value;
  };

  await send('Runtime.enable');
  await send('Page.enable');
  await wait(1700);
  const summaries = {};
  for (const [label, width, height, theme] of [
    ['desktop-dark', 1440, 900, 'dark'],
    ['tablet-light', 768, 900, 'light'],
    ['mobile-dark', 375, 812, 'dark']
  ]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 });
    await evaluate(`(()=>{document.documentElement.dataset.theme=${JSON.stringify(theme)};document.documentElement.style.scrollBehavior='auto';document.querySelectorAll('#achievements .rv').forEach(node=>node.classList.add('vis'));document.getElementById('achievements').scrollIntoView({block:'start'});dispatchEvent(new Event('resize'));return true})()`);
    await wait(650);
    const state = await evaluate(`(()=>{
      const cards=[...document.querySelectorAll('#achievements .award-card')];
      const dataCard=cards.find(card=>card.querySelector('.award-title')?.textContent.includes('DataXplore'));
      const academicCard=cards.find(card=>card.querySelector('.award-title')?.textContent.includes('G.C.E. A/L'));
      const image=dataCard?.querySelector('.award-bg');
      const academicImage=academicCard?.querySelector('.award-bg');
      const cardStyle=dataCard?getComputedStyle(dataCard):null;
      const title=dataCard?.querySelector('.award-title');
      const titleStyle=title?getComputedStyle(title):null;
      const academicStyle=academicCard?getComputedStyle(academicCard):null;
      const academicTitle=academicCard?.querySelector('.award-title');
      const academicTitleStyle=academicTitle?getComputedStyle(academicTitle):null;
      const index=dataCard?.querySelector('.award-index');
      const academicIndex=academicCard?.querySelector('.award-index');
      return {
        cardCount:cards.length,photoClass:dataCard?.classList.contains('award-card-photo')||false,
        image:{count:dataCard?.querySelectorAll('.award-bg').length||0,src:image?.getAttribute('src')||'',alt:image?.getAttribute('alt')??null,hidden:image?.getAttribute('aria-hidden')||'',loaded:!!image&&image.complete&&image.naturalWidth>0,fit:image?getComputedStyle(image).objectFit:''},
        academicPhotoClass:academicCard?.classList.contains('award-card-photo')||false,
        academicImage:{count:academicCard?.querySelectorAll('.award-bg').length||0,src:academicImage?.getAttribute('src')||'',alt:academicImage?.getAttribute('alt')??null,hidden:academicImage?.getAttribute('aria-hidden')||'',loaded:!!academicImage&&academicImage.complete&&academicImage.naturalWidth>0,fit:academicImage?getComputedStyle(academicImage).objectFit:'',position:academicImage?getComputedStyle(academicImage).objectPosition:''},
        overlay:cardStyle?.getPropertyValue('--award-photo-overlay').trim()||'',indexPosition:index?getComputedStyle(index).position:'',
        academicOverlay:academicStyle?.getPropertyValue('--award-photo-overlay').trim()||'',academicIndexPosition:academicIndex?getComputedStyle(academicIndex).position:'',
        titleColor:titleStyle?.color||'',academicTitleColor:academicTitleStyle?.color||'',overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth
      };
    })()`);
    assert(state.cardCount===2&&state.photoClass, `${label}: DataXplore card is not configured as the photo achievement`);
    assert(state.image.count===1&&state.image.src==='assets/achievements/dataxplore-finalist.jpg'&&state.image.alt===''&&state.image.hidden==='true'&&state.image.loaded&&state.image.fit==='cover', `${label}: DataXplore background image is missing, inaccessible, or incorrectly fitted`);
    assert(state.academicPhotoClass, `${label}: G.C.E. A/L card is not configured as a photo achievement`);
    assert(state.academicImage.count===1&&state.academicImage.src==='assets/achievements/best-al-results.jpg'&&state.academicImage.alt===''&&state.academicImage.hidden==='true'&&state.academicImage.loaded&&state.academicImage.fit==='cover', `${label}: G.C.E. A/L background image is missing, inaccessible, or incorrectly fitted`);
    assert(state.overlay&&state.academicOverlay&&state.titleColor==='rgb(255, 255, 255)'&&state.academicTitleColor==='rgb(255, 255, 255)', `${label}: an achievement photo lacks a readable text overlay`);
    assert(state.indexPosition==='absolute'&&state.academicIndexPosition==='absolute', `${label}: an achievement card index is not anchored to the top-right corner`);
    assert(!state.overflow, `${label}: achievement image introduces horizontal overflow`);
    const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(path.join(shots, `${label}.png`), Buffer.from(shot.data, 'base64'));
    summaries[label] = { dataPhotoLoaded: state.image.loaded, academicPhotoLoaded: state.academicImage.loaded, academicCrop: state.academicImage.position, overflow: state.overflow };
  }
  assert(runtimeErrors.length === 0, `runtime errors: ${runtimeErrors.join('; ')}`);
  console.log(JSON.stringify({ pass: true, summaries, screenshots: shots }));
}

main().catch(error => { console.error(error.stack || error); process.exitCode = 1; }).finally(async () => {
  try { ws?.close(); } catch {}
  await wait(150);
  browser.kill();
  await wait(400);
  try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
});
