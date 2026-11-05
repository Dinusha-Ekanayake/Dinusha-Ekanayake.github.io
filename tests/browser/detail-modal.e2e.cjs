const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-detail-modal-qa-'));
const shots = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-detail-modal-shots-'));
const port = 9351;
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
  await waitForCDP();
  const target = await json(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(pageUrl)}`, { method: 'PUT' });
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let nextId = 0;
  const pending = new Map();
  const runtimeErrors = [];
  ws.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) { pending.get(message.id)(message); pending.delete(message.id); }
    if (message.method === 'Runtime.exceptionThrown') runtimeErrors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
  };
  const send = (method, params = {}) => new Promise(resolve => { const id = ++nextId; pending.set(id, resolve); ws.send(JSON.stringify({ id, method, params })); });
  const evaluate = async expression => {
    const response = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (response.result?.exceptionDetails) throw new Error(response.result.exceptionDetails.exception?.description || response.result.exceptionDetails.text);
    return response.result.result.value;
  };
  await send('Page.enable');
  await send('Runtime.enable');

  const summaries = {};
  for (const [label, width, height, theme] of [['desktop-dark', 1440, 900, 'dark'], ['laptop-dark', 1366, 768, 'dark'], ['mobile-light', 390, 844, 'light']]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 });
    await evaluate('window.__staleDocument = true');
    await send('Page.navigate', { url: pageUrl });
    for (let attempt = 0; attempt < 150 && !(await evaluate(`!window.__staleDocument && document.readyState === 'complete' && typeof openAch === 'function'`)); attempt++) await wait(100);
    await wait(1500);
    await evaluate(`(()=>{document.documentElement.dataset.theme='${theme}';document.documentElement.style.scrollBehavior='auto';document.body.style.overflow='';return true})()`);

    // Every achievement card opens a dialog with image, title, description and details.
    const cards = await evaluate(`document.querySelectorAll('#achievements .award-card[data-ach]').length`);
    assert(cards === 3, `${label}: expected 3 interactive achievement cards, received ${cards}`);
    for (let index = 0; index < cards; index++) {
      await evaluate(`document.querySelectorAll('#achievements .award-card[data-ach]')[${index}].scrollIntoView({block:'center'})`);
      await wait(500);
      await evaluate(`document.querySelectorAll('#achievements .award-card[data-ach]')[${index}].click()`);
      await wait(250);
      const modal = await evaluate(`(()=>{const m=document.getElementById('projModal');const img=m.querySelector('.modal-img');const panel=m.querySelector('.modal-panel').getBoundingClientRect();return {open:m.classList.contains('open'),title:document.getElementById('mTitle').textContent,desc:document.getElementById('mDesc').textContent,type:document.getElementById('mType').textContent,chips:document.querySelectorAll('#mTechs span').length,imgOk:!!img&&img.complete&&img.naturalWidth>0,imgAlt:img?.alt||'',links:document.querySelectorAll('#mLinks a').length,fits:panel.width<=innerWidth&&panel.height<=innerHeight+1,locked:document.body.style.overflow==='hidden',focus:document.activeElement?.className||'',scrolls:(()=>{const p=m.querySelector('.modal-panel');return p.scrollHeight>p.clientHeight+1})(),panelWidth:Math.round(panel.width)}})()`);
      assert(modal.open && modal.title && modal.desc.length > 40 && modal.type && modal.chips >= 3, `${label}: achievement ${index} modal is missing its title, description, or details ${JSON.stringify(modal)}`);
      assert(modal.imgOk && modal.imgAlt === modal.title, `${label}: achievement ${index} modal image did not load with an accessible description`);
      assert(modal.fits && modal.locked && /modal-close/.test(modal.focus), `${label}: achievement ${index} modal does not fit the viewport, lock scrolling, or move focus to the close button`);
      if (width >= 1000) assert(!modal.scrolls && modal.panelWidth <= 720, `${label}: achievement ${index} modal should fit without inner scrolling and stay compact (width ${modal.panelWidth}, scrolls ${modal.scrolls})`);
      summaries[`${label}-scroll-${index}`] = modal.scrolls;
      if (index === 0) {
        const shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(shots, `${label}-achievement.png`), Buffer.from(shot.result.data, 'base64'));
      }
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      await wait(200);
      const closed = await evaluate(`({open:document.getElementById('projModal').classList.contains('open'),locked:document.body.style.overflow==='hidden',returned:document.activeElement===document.querySelectorAll('#achievements .award-card[data-ach]')[${index}]})`);
      assert(!closed.open && !closed.locked, `${label}: achievement ${index} modal did not close with Escape`);
      assert(closed.returned, `${label}: focus did not return to achievement card ${index}`);
    }

    // Keyboard activation and link isolation.
    await evaluate(`(()=>{const c=document.querySelector('#achievements .award-card[data-ach="1"]');c.focus();return true})()`);
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
    await wait(200);
    assert(await evaluate(`document.getElementById('projModal').classList.contains('open')`), `${label}: Enter key did not open the achievement modal`);
    await evaluate(`document.querySelector('#projModal .modal-close').click()`);
    await wait(150);
    const linkClick = await evaluate(`(()=>{const link=document.querySelector('#achievements .award-card[data-ach="1"] .award-link');let prevented=false;link.addEventListener('click',e=>{prevented=e.defaultPrevented;e.preventDefault()},{once:true});link.click();return {open:document.getElementById('projModal').classList.contains('open')}})()`);
    assert(!linkClick.open, `${label}: clicking a card link should follow the link, not open the modal`);

    // Project cards still open the shared modal with their image, title and description.
    await evaluate(`(()=>{const card=document.querySelector('#projects .proj-card[onclick]');if(!card)throw new Error('no project card');card.click();return true})()`);
    await wait(250);
    const project = await evaluate(`(()=>({open:document.getElementById('projModal').classList.contains('open'),title:document.getElementById('mTitle').textContent,desc:document.getElementById('mDesc').textContent.length,img:!!document.querySelector('#modalImgWrap img,#modalImgWrap .modal-img-placeholder'),tech:document.querySelectorAll('#mTechs span').length}))()`);
    assert(project.open && project.title && project.desc > 40 && project.img && project.tech > 0, `${label}: project modal is missing image, title, description, or details`);
    await evaluate(`document.querySelector('#projModal .modal-close').click()`);
    summaries[label] = { achievementModals: cards, project: project.title };
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
