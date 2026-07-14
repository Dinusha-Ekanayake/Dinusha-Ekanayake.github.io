const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-hero-qa-'));
const shots = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-hero-shots-'));
const port = 9347;
const pageUrl = `file:///${path.resolve('index.html').replace(/\\/g, '/')}`;
const browser = spawn(edge, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank'
], { stdio: 'ignore', windowsHide: true });

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
    if (response.exceptionDetails) throw new Error(response.exceptionDetails.text);
    return response.result.value;
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await wait(1500);
  await evaluate("localStorage.clear(); location.reload(); true");
  await wait(1500);

  const liveUpdate = await evaluate(`(async()=>{
    if(typeof refreshGitHubHeroStats!=='function'||typeof applyGitHubHeroStats!=='function')return {available:false,calls:[],commit:'',repos:''};
    const calls=[];
    const originalFetch=window.fetch;
    window.fetch=async url=>{
      calls.push(String(url));
      if(String(url).includes('/users/'))return {ok:true,json:async()=>({public_repos:42})};
      if(String(url).includes('/search/commits'))return {ok:true,json:async()=>({total_count:1234})};
      throw new Error('Unexpected URL '+url);
    };
    try{
      localStorage.removeItem('de4_github_stats_v1');
      await refreshGitHubHeroStats(true);
      return {
        available:true,
        calls,
        commit:document.getElementById('githubCommitCount')?.textContent.trim()||'',
        repos:document.getElementById('githubRepoCount')?.textContent.trim()||''
      };
    }finally{window.fetch=originalFetch}
  })()`);
  assert(liveUpdate.available, 'live GitHub hero-stat functions are missing');
  assert(liveUpdate.calls.length===2, 'live GitHub stats should use exactly two requests');
  assert(liveUpdate.calls.some(url=>url.includes('/users/Dinusha-Ekanayake')), 'GitHub user endpoint was not requested');
  assert(liveUpdate.calls.some(url=>url.includes('/search/commits')), 'GitHub commit search endpoint was not requested');
  assert(liveUpdate.commit==='1,234+'&&liveUpdate.repos==='42', 'live GitHub response was not rendered correctly');

  const cachedFallback = await evaluate(`(async()=>{
    const originalFetch=window.fetch;
    window.fetch=async()=>{throw new Error('Simulated offline state')};
    try{
      await refreshGitHubHeroStats(true);
      return {
        commit:document.getElementById('githubCommitCount')?.textContent.trim()||'',
        repos:document.getElementById('githubRepoCount')?.textContent.trim()||''
      };
    }finally{window.fetch=originalFetch}
  })()`);
  assert(cachedFallback.commit==='1,234+'&&cachedFallback.repos==='42', 'cached GitHub stats should survive an offline refresh');

  const summaries = {};
  for (const [label, width, height] of [['desktop', 1440, 900], ['tablet', 768, 900], ['mobile', 375, 812]]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 });
    await evaluate("window.dispatchEvent(new Event('resize')); true");
    await wait(400);
    const state = await evaluate(`(()=>{
      const rect=element=>{const r=element.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height,cx:r.left+r.width/2,cy:r.top+r.height/2}};
      const hero=document.getElementById('hero'),inner=document.querySelector('.hero-inner'),left=document.querySelector('.hero-left'),right=document.querySelector('.hero-right'),stats=document.querySelector('.hero-stats'),statInner=document.querySelector('.hero-stats-inner');
      const controls=[...document.querySelectorAll('.hero-ctas>a')].map(node=>({text:node.textContent.trim(),...rect(node)}));
      const statItems=[...document.querySelectorAll('.hero-stats .hs')].map(node=>({label:node.querySelector('.hs-l').textContent.trim(),value:node.querySelector('.hs-n').textContent.trim(),...rect(node)}));
      return {hero:rect(hero),inner:rect(inner),left:rect(left),right:rect(right),stats:rect(stats),statInner:rect(statInner),controls,statItems,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth};
    })()`);
    assert(state.statItems.map(item=>item.label).join('|')==='AI Journey Began|GitHub Commits|Featured Systems|Repositories', `${label}: hero stat order is incorrect`);
    assert(state.statItems[0].value==='2024'&&state.statItems[1].value==='1,234+'&&state.statItems[2].value==='10'&&state.statItems[3].value==='42', `${label}: hero stat values are incorrect (${state.statItems.map(item=>item.value).join(' / ')})`);
    assert(state.controls.length===4, `${label}: expected four hero controls`);
    const heights=state.controls.map(item=>item.height);
    assert(Math.max(...heights)-Math.min(...heights)<=1.5, `${label}: hero control heights are inconsistent`);
    const github=state.controls.find(item=>item.text==='GitHub'),linkedin=state.controls.find(item=>item.text==='LinkedIn');
    assert(github&&linkedin&&Math.abs(github.width-linkedin.width)<=1.5, `${label}: GitHub and LinkedIn widths do not match`);
    assert(state.inner.left>=0&&state.inner.right<=width+1&&!state.overflow, `${label}: hero overflows horizontally`);
    if(width>900){
      assert(Math.abs(state.left.cy-state.right.cy)<=28, `${label}: hero columns are not vertically centered`);
      assert(state.inner.bottom<=state.stats.top+1, `${label}: hero content overlaps the stats row`);
      const widths=state.controls.map(item=>item.width);
      assert(Math.max(...widths)-Math.min(...widths)<=1.5, `${label}: desktop hero control widths are inconsistent`);
    }else{
      assert(state.right.bottom<=state.stats.top+1, `${label}: mobile hero visual overlaps the stats grid`);
    }
    summaries[label]={controls:state.controls.map(({text,width,height})=>({text,width:Math.round(width),height:Math.round(height)})),stats:state.statItems.map(({label,value})=>({label,value})),overflow:state.overflow};
    const heroHeight=await evaluate("Math.ceil(document.getElementById('hero').getBoundingClientRect().height)");
    const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width,height:heroHeight,scale:1}});
    fs.writeFileSync(path.join(shots,`${label}.png`),Buffer.from(shot.data,'base64'));
  }

  assert(runtimeErrors.length===0, `runtime errors: ${runtimeErrors.join('; ')}`);
  console.log(JSON.stringify({pass:true,summaries,screenshots:shots}));
  ws.close();
}

main().catch(error=>{console.error(error.stack||error);process.exitCode=1}).finally(async()=>{
  await wait(150);
  browser.kill();
  await wait(400);
  try{fs.rmSync(profile,{recursive:true,force:true})}catch{}
});
