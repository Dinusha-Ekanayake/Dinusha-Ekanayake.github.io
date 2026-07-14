const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-palette-qa-'));
const shots = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-palette-shots-'));
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
    await evaluate(`(()=>{document.documentElement.dataset.theme=${JSON.stringify(theme)};document.documentElement.style.scrollBehavior='auto';const section=document.getElementById('skills');scrollTo(0,section.getBoundingClientRect().top+scrollY);dispatchEvent(new Event('resize'));return true})()`);
    await wait(650);
    const state = await evaluate(`(()=>{
      const root=getComputedStyle(document.documentElement);
      const tokenNames=['--hero-glow-gold','--hero-glow-teal','--hero-glow-coral'];
      const tokens=tokenNames.map(name=>root.getPropertyValue(name).trim());
      const channels=document.documentElement.dataset.theme==='light'
        ? ['148, 104, 24','20, 124, 115','182, 56, 78']
        : ['212, 168, 83','46, 196, 182','232, 93, 117'];
      const hasPalette=image=>channels.every(channel=>image.includes(channel));
      const heroImage=getComputedStyle(document.querySelector('.hero-glow')).backgroundImage;
      const shellImage=getComputedStyle(document.querySelector('.post-hero-shell')).backgroundImage;
      const sections=[...document.querySelectorAll('.post-hero-shell>.sw')].map(section=>({
        id:section.querySelector('section[id]')?.id||'',
        image:getComputedStyle(section).backgroundImage,
        aura:getComputedStyle(section,'::before').backgroundImage,
        expected:section.classList.contains('sw-warm')?channels[0]:section.classList.contains('sw-sky')?channels[2]:channels[1]
      }));
      const ambientGrid=getComputedStyle(document.querySelector('.ambient-grid')).backgroundImage;
      const labels=[...document.querySelectorAll('.post-hero-shell .label')].map(label=>getComputedStyle(label).color);
      const paletteColors=['rgb(212, 168, 83)','rgb(46, 196, 182)','rgb(232, 93, 117)','rgb(148, 104, 24)','rgb(20, 124, 115)','rgb(182, 56, 78)'];
      return {
        tokens,heroPalette:hasPalette(heroImage),shellPalette:hasPalette(shellImage),
        sections:sections.map(section=>({id:section.id,palette:hasPalette(section.image),aura:section.aura.includes(section.expected)})),
        ambientPalette:ambientGrid.includes(channels[1]),
        labelsMatch:labels.every(color=>paletteColors.includes(color)),
        overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth
      };
    })()`);
    assert(state.tokens.every(Boolean), `${label}: shared hero palette tokens are missing`);
    assert(state.heroPalette, `${label}: hero glow does not expose the complete gold, teal, and coral palette`);
    assert(state.shellPalette, `${label}: post-hero atmosphere does not reuse the hero palette`);
    assert(state.sections.length === 8 && state.sections.every(section => section.palette), `${label}: not every major section reuses all hero background colors`);
    assert(state.sections.every(section => section.aura), `${label}: responsive section glows do not follow the active hero theme colors`);
    assert(state.ambientPalette, `${label}: animated background grid does not follow the active hero teal`);
    assert(state.labelsMatch, `${label}: section labels use colors outside the hero palette`);
    assert(!state.overflow, `${label}: unified section backgrounds introduce horizontal overflow`);
    const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(path.join(shots, `${label}.png`), Buffer.from(shot.data, 'base64'));
    summaries[label] = { sections: state.sections.length, paletteComplete: state.sections.every(section => section.palette), overflow: state.overflow };
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
