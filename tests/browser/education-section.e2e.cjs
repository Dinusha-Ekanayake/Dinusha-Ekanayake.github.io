const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-education-qa-'));
const shots = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-education-shots-'));
const port = 9347;
const pageUrl = `file:///${path.resolve('index.html').replace(/\\/g, '/')}`;
const browser = spawn(edge, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank'
], { stdio: 'ignore', windowsHide: true });

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const assert = (condition, message) => { if (!condition) throw new Error(`ASSERTION: ${message}`); };
async function json(url, options) { return (await fetch(url, options)).json(); }

async function main() {
  let version;
  for (let attempt = 0; attempt < 60; attempt++) {
    try { version = await json(`http://127.0.0.1:${port}/json/version`); break; } catch { await wait(100); }
  }
  if (!version) throw new Error('Edge CDP did not start');
  const target = await json(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(pageUrl)}`, { method: 'PUT' });
  const ws = new WebSocket(target.webSocketDebuggerUrl);
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
    if (response.exceptionDetails) throw new Error(response.exceptionDetails.text || 'Browser evaluation failed');
    return response.result.value;
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await wait(1200);
  await evaluate("localStorage.clear(); location.reload(); true");
  await wait(1200);

  const expected = [
    {
      title: 'B.Sc. (Hons.) in Artificial Intelligence',
      src: 'assets/education/university-of-moratuwa.jpg',
      href: 'https://uom.lk/'
    },
    {
      title: 'G.C.E. Advanced Level',
      src: 'assets/education/st-thomas-college-bandarawela.png',
      href: 'https://stcb.edu.lk/'
    }
  ];
  const summaries = {};
  for (const [label, width, height, theme] of [
    ['desktop-dark', 1440, 900, 'dark'],
    ['tablet-light', 768, 900, 'light'],
    ['mobile-dark', 375, 812, 'dark']
  ]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 });
    await evaluate(`(()=>{document.documentElement.dataset.theme=${JSON.stringify(theme)};document.querySelectorAll('#education .rv').forEach(node=>node.classList.add('vis'));document.documentElement.style.scrollBehavior='auto';document.getElementById('education').scrollIntoView({block:'start'});window.dispatchEvent(new Event('resize'));return true})()`);
    await wait(650);
    const state = await evaluate(`(()=>{
      const cards=[...document.querySelectorAll('#education .edu-card')].map(card=>{
        const rect=card.getBoundingClientRect(),logo=card.querySelector('.edu-logo'),logoRect=logo?.getBoundingClientRect(),image=logo?.querySelector('img'),link=card.querySelector('.edu-logo-link');
        return {
          title:card.querySelector('.edu-degree')?.textContent.trim()||'',
          rect:{top:rect.top,left:rect.left,right:rect.right,bottom:rect.bottom,width:rect.width,height:rect.height},
          logoRect:logoRect?{width:logoRect.width,height:logoRect.height}:null,
          src:image?.getAttribute('src')||'',alt:image?.getAttribute('alt')||'',loaded:image?image.complete&&image.naturalWidth>0:false,
          href:link?.href||'',labelledBy:card.getAttribute('aria-labelledby')||'',headingId:card.querySelector('.edu-degree')?.id||''
        };
      });
      const label=document.querySelector('#education > .label')?.getBoundingClientRect(),nav=document.querySelector('nav')?.getBoundingClientRect();
      return {cards,labelTop:label?.top||0,navBottom:nav?.bottom||0,theme:document.documentElement.dataset.theme,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth};
    })()`);
    const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 80, captureBeyondViewport: false });
    fs.writeFileSync(path.join(shots, `${label}.jpg`), Buffer.from(shot.data, 'base64'));

    assert(state.cards.length===2, `${label}: expected two education cards`);
    for (const item of expected) {
      const card=state.cards.find(candidate=>candidate.title===item.title);
      assert(card, `${label}: missing ${item.title} card`);
      assert(card.src===item.src&&card.loaded, `${label}: ${item.title} logo is missing or unloaded`);
      assert(card.alt.length>5, `${label}: ${item.title} logo needs useful alternative text`);
      assert(card.href===item.href, `${label}: ${item.title} logo should link to the institution`);
      assert(card.labelledBy&&card.labelledBy===card.headingId, `${label}: ${item.title} card is not labelled by its heading`);
      assert(card.logoRect&&card.logoRect.width>=62&&card.logoRect.height>=62, `${label}: ${item.title} logo is too small`);
    }
    const [first,second]=state.cards;
    assert(Math.abs(first.rect.width-second.rect.width)<=2, `${label}: card widths are misaligned`);
    assert(state.labelTop>=state.navBottom+6, `${label}: fixed navigation obscures the education heading`);
    if(width>=1000){
      assert(Math.abs(first.rect.top-second.rect.top)<=2&&Math.abs(first.rect.height-second.rect.height)<=2, `${label}: desktop cards are not aligned to equal height`);
      assert(first.rect.right<second.rect.left, `${label}: desktop cards overlap`);
    }else{
      assert(first.rect.bottom<second.rect.top, `${label}: stacked cards overlap or render out of order`);
    }
    assert(state.theme===theme, `${label}: requested theme was not applied`);
    assert(!state.overflow, `${label}: education section causes horizontal overflow`);
    summaries[label]={cards:state.cards.length,equalWidth:Math.abs(first.rect.width-second.rect.width)<=2,overflow:state.overflow};
  }
  assert(runtimeErrors.length===0, `runtime errors: ${runtimeErrors.join('; ')}`);
  console.log(JSON.stringify({pass:true,summaries,screenshots:shots}));
  ws.close();
}

main().catch(error => { console.error(error.stack || error); process.exitCode = 1; }).finally(async () => {
  await wait(150);
  browser.kill();
  await wait(500);
  try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
});
