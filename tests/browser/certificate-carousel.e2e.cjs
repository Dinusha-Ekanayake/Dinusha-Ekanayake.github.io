const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-cert-carousel-qa-'));
const port = 9341;
const pageUrl = `file:///${path.resolve('index.html').replace(/\\/g, '/')}`;
const shotDir = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-cert-carousel-shots-'));
const browser = spawn(edge, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank'
], { stdio: 'ignore', windowsHide: true });

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function fetchJSON(url, options) { return (await fetch(url, options)).json(); }
async function waitForCDP() {
  for (let attempt = 0; attempt < 60; attempt++) {
    try { return await fetchJSON(`http://127.0.0.1:${port}/json/version`); } catch { await wait(100); }
  }
  throw new Error('Edge CDP did not start');
}

async function main() {
  await waitForCDP();
  const target = await fetchJSON(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(pageUrl)}`, { method: 'PUT' });
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let sequence = 0;
  const pending = new Map();
  const runtimeErrors = [];
  const consoleErrors = [];
  ws.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const handlers = pending.get(message.id);
      pending.delete(message.id);
      return message.error ? handlers.reject(new Error(message.error.message)) : handlers.resolve(message.result);
    }
    if (message.method === 'Runtime.exceptionThrown') runtimeErrors.push(message.params.exceptionDetails.text);
    if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
      consoleErrors.push(message.params.args.map(arg => arg.value || arg.description).join(' '));
    }
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
  const assert = (condition, message) => { if (!condition) throw new Error(`ASSERTION: ${message}`); };
  const setViewport = async (width, height, theme) => {
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 });
    await evaluate(`document.documentElement.dataset.theme='${theme}'; window.dispatchEvent(new Event('resize')); true`);
    await wait(400);
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await wait(1200);

  const results = {};
  for (const [label, width, height, theme, expectedVisible] of [
    ['desktop-dark', 1440, 900, 'dark', 3],
    ['tablet-light', 768, 900, 'light', 2],
    ['mobile-light', 375, 812, 'light', 1]
  ]) {
    await setViewport(width, height, theme);
    await evaluate("document.getElementById('certifications').scrollIntoView({block:'center'}); true");
    await wait(250);
    const initial = await evaluate(`(() => {
      setCertFilter('all');
      const viewport=document.getElementById('certViewport');
      const cards=[...document.querySelectorAll('#certsList .cert-card')];
      const prev=document.getElementById('certPrev'),next=document.getElementById('certNext');
      const autoplay=document.getElementById('certAutoplayToggle');
      const dataXploreCard=cards.find(card=>card.querySelector('.cert-name')?.textContent.includes('DataXplore'));
      return {
        hasViewport:!!viewport,hasPrev:!!prev,hasNext:!!next,hasAutoplay:!!autoplay,total:cards.length,
        horizontal:viewport?viewport.scrollWidth>viewport.clientWidth:false,
        oneRow:cards.length?new Set(cards.map(card=>Math.round(card.offsetTop))).size===1:false,
        visible:viewport?cards.filter(card=>card.offsetLeft<viewport.scrollLeft+viewport.clientWidth-2&&card.offsetLeft+card.offsetWidth>viewport.scrollLeft+2).length:0,
        overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,
        before:viewport?viewport.scrollLeft:0,count:document.getElementById('certResultCount').textContent.trim(),
        dataXploreLinks:dataXploreCard?[...dataXploreCard.querySelectorAll('.cert-resource-link')].map(link=>link.href):[],
        metrics:viewport?((({step,perView,index,maxIndex,count})=>({step,perView,index,maxIndex,count}))(certCarouselMetrics())):null
      };
    })()`);
    assert(initial.hasViewport && initial.hasPrev && initial.hasNext && initial.hasAutoplay, `${label}: carousel or autoplay controls are missing`);
    assert(initial.total === 16, `${label}: expected all 16 certificate cards in the horizontal track`);
    assert(initial.horizontal && initial.oneRow, `${label}: certificates are not a one-row horizontal track`);
    assert(initial.visible === expectedVisible, `${label}: expected ${expectedVisible} visible card(s), got ${initial.visible}`);
    assert(!initial.overflow, `${label}: page has horizontal overflow`);
    const expectedDataXploreLinks=[
      'https://www.linkedin.com/posts/dinusha-ekanayake-0a0963266_dataxplore2-datascience-machinelearning-ugcPost-7469704053065777152-6B4L/?utm_source=share&utm_medium=member_desktop&rcm=ACoAAEFIBrgBN44I5NTNbC_rxLbTJbVQzQQkAXY',
      'https://github.com/Dinusha-Ekanayake/Bayesian_Minds-DataXplore_2-0_Stage_03',
      'https://github.com/Dinusha-Ekanayake/Stroke_Risk_Prediction-DataXplore_2.0-Competition-Stage_01'
    ];
    assert(initial.dataXploreLinks.length===3&&new Set(initial.dataXploreLinks).size===3&&expectedDataXploreLinks.every(url=>initial.dataXploreLinks.includes(url)), `${label}: DataXplore certificate resources are missing or duplicated`);

    await evaluate('scrollCerts(1); true');
    await wait(750);
    const afterNext = await evaluate(`(() => {
      const viewport=document.getElementById('certViewport');
      return {left:viewport.scrollLeft,count:document.getElementById('certResultCount').textContent.trim(),prevDisabled:document.getElementById('certPrev').disabled};
    })()`);
    assert(afterNext.left > initial.before, `${label}: Next did not slide toward certificates on the right; initial=${JSON.stringify(initial)} after=${JSON.stringify(afterNext)}`);
    assert(afterNext.count !== initial.count, `${label}: visible-range status did not update`);
    assert(!afterNext.prevDisabled, `${label}: Previous stayed disabled after moving right`);

    await evaluate("setCertFilter('security'); true");
    await wait(120);
    const filtered = await evaluate(`(() => {
      const viewport=document.getElementById('certViewport');
      return {cards:document.querySelectorAll('#certsList .cert-card').length,left:viewport.scrollLeft,prev:document.getElementById('certPrev').disabled,next:document.getElementById('certNext').disabled};
    })()`);
    assert(filtered.cards === 1 && filtered.left === 0, `${label}: filtering did not reset the carousel`);
    assert(filtered.prev && filtered.next, `${label}: arrows should disable for a one-card result`);
    await evaluate("setCertFilter('all'); document.getElementById('certViewport').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true})); true");
    await wait(750);
    const keyboardLeft = await evaluate("document.getElementById('certViewport').scrollLeft");
    assert(keyboardLeft > 0, `${label}: ArrowRight keyboard navigation did not advance the carousel`);
    let autoplay = null;
    if (label === 'desktop-dark') {
      await evaluate("setCertFilter('all'); document.getElementById('certifications').scrollIntoView({block:'center'}); true");
      await wait(4750);
      const movedLeft = await evaluate("document.getElementById('certViewport').scrollLeft");
      assert(movedLeft > 0, `${label}: carousel did not advance automatically after the fixed interval`);
      await evaluate("document.getElementById('certAutoplayToggle').click(); true");
      const pausedAt = await evaluate("document.getElementById('certViewport').scrollLeft");
      await wait(4350);
      const pausedAfter = await evaluate(`({left:document.getElementById('certViewport').scrollLeft,pressed:document.getElementById('certAutoplayToggle').getAttribute('aria-pressed')})`);
      assert(Math.abs(pausedAfter.left-pausedAt)<2 && pausedAfter.pressed==='true', `${label}: Pause did not stop timed movement`);
      await evaluate("const metrics=certCarouselMetrics();metrics.viewport.scrollLeft=metrics.maxIndex*metrics.step;updateCertCarousel();runCertAutoplay();true");
      await wait(120);
      const wrappedLeft = await evaluate("document.getElementById('certViewport').scrollLeft");
      assert(wrappedLeft<2, `${label}: autoplay did not loop from the final card back to the start`);
      autoplay={movedLeft,pausedAt,pausedAfter,wrappedLeft};
    }
    await evaluate("setCertFilter('all'); document.getElementById('certifications').scrollIntoView({block:'start'}); document.querySelectorAll('#certifications .rv').forEach(el=>el.classList.add('vis')); true");
    await wait(350);
    const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(path.join(shotDir, `${label}.png`), Buffer.from(shot.data, 'base64'));
    results[label] = { initial, afterNext, filtered, keyboardLeft, autoplay };
  }

  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await send('Page.reload', { ignoreCache: true });
  await wait(1200);
  const reducedMotion = await evaluate(`({
    preference:certReducedMotion,
    paused:certAutoplayPaused,
    pressed:document.getElementById('certAutoplayToggle').getAttribute('aria-pressed')
  })`);
  assert(reducedMotion.preference && reducedMotion.paused && reducedMotion.pressed==='true', 'reduced-motion preference did not disable autoplay by default');

  assert(runtimeErrors.length === 0, `runtime errors: ${runtimeErrors.join('; ')}`);
  assert(consoleErrors.length === 0, `console errors: ${consoleErrors.join('; ')}`);
  console.log(JSON.stringify({ pass: true, results, reducedMotion, runtimeErrors, consoleErrors, screenshots: shotDir }, null, 2));
  ws.close();
}

main().catch(error => { console.error(error.stack || error); process.exitCode = 1; }).finally(async () => {
  await wait(150);
  browser.kill();
  await wait(500);
  try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
});
