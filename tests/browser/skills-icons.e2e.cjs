const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-skills-icons-qa-'));
const shots = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-skills-icons-shots-'));
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
  await wait(1400);
  await evaluate("localStorage.clear(); location.reload(); true");
  await wait(1400);

  const expectedAssets = {
    Python: 'assets/icons/python.svg',
    PyTorch: 'assets/icons/pytorch.svg',
    TensorFlow: 'assets/icons/tensorflow.svg',
    'Scikit-learn': 'assets/icons/scikitlearn.svg',
    'Hugging Face': 'assets/icons/huggingface.svg',
    FastAPI: 'assets/icons/fastapi.svg',
    React: 'assets/icons/react.svg',
    'Next.js': 'assets/icons/nextjs.svg',
    PostgreSQL: 'assets/icons/postgresql.svg',
    NumPy: 'assets/icons/numpy.svg'
  };
  const summaries = {};
  for (const [label, width, height, theme] of [
    ['desktop-dark', 1440, 900, 'dark'],
    ['tablet-light', 768, 900, 'light'],
    ['mobile-dark', 375, 812, 'dark']
  ]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 });
    const available = await evaluate(`typeof enhanceSkillTags==='function'`);
    assert(available, 'enhanceSkillTags is missing');
    await evaluate(`(()=>{document.documentElement.dataset.theme=${JSON.stringify(theme)};enhanceSkillTags();enhanceSkillTags();document.querySelectorAll('#skills .rv').forEach(node=>node.classList.add('vis'));document.documentElement.style.scrollBehavior='auto';const section=document.getElementById('skills');window.scrollTo(0,window.scrollY+section.getBoundingClientRect().top);window.dispatchEvent(new Event('resize'));return true})()`);
    await wait(700);
    const state = await evaluate(`(()=>{
      const tags=[...document.querySelectorAll('#skills .skill-tag')].map(tag=>{
        const icon=tag.querySelector('.skill-tool-icon'),image=icon?.querySelector('img'),label=tag.querySelector('.skill-tool-label')?.textContent.trim()||'';
        const rect=icon?.getBoundingClientRect();
        return {label,aria:tag.getAttribute('aria-label')||'',iconCount:tag.querySelectorAll('.skill-tool-icon').length,kind:icon?.dataset.kind||'',mark:icon?.textContent.trim()||'',src:image?.getAttribute('src')||'',loaded:image?image.complete&&image.naturalWidth>0:true,width:rect?.width||0,height:rect?.height||0};
      });
      const cards=[...document.querySelectorAll('#skills .skill-card')].map(card=>({title:card.querySelector('.skill-title')?.textContent.trim()||'',tools:[...card.querySelectorAll('.skill-tool-label')].map(node=>node.textContent.trim())}));
      return {tags,cards,theme:document.documentElement.dataset.theme,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth};
    })()`);
    assert(state.tags.length===62, `${label}: expected 62 skills and tools, received ${state.tags.length}`);
    assert(state.tags.every(tag=>tag.label&&tag.aria===tag.label&&tag.iconCount===1), `${label}: every skill must have one accessible icon and label`);
    assert(state.tags.every(tag=>tag.loaded&&Math.abs(tag.width-18)<=1&&Math.abs(tag.height-18)<=1), `${label}: skill icons are missing, unloaded, or incorrectly sized`);
    for (const [name, asset] of Object.entries(expectedAssets)) {
      const matches=state.tags.filter(tag=>tag.label===name);
      assert(matches.length&&matches.every(tag=>tag.kind==='asset'&&tag.src===asset), `${label}: ${name} should use ${asset}`);
    }
    assert(state.tags.filter(tag=>tag.kind==='mark').every(tag=>tag.mark.length>=1&&tag.mark.length<=3), `${label}: fallback tool marks are unclear`);
    const toolsFor=title=>state.cards.find(card=>card.title===title)?.tools||[];
    const models=toolsFor('Machine Learning & Deep Learning'),agents=toolsFor('LLMs & Agentic AI'),product=toolsFor('Full-Stack & APIs'),platform=toolsFor('Data, Cloud & Deployment'),analysis=toolsFor('Analysis & Experimentation');
    for(const tool of ['Fine-Tuning','CatBoost','Kaggle'])assert(models.includes(tool),`${label}: ${tool} is missing from ML & DL`);
    for(const tool of ['Groq','OpenAI Models','Gemini','Claude'])assert(agents.includes(tool),`${label}: ${tool} is missing from LLMs & Agentic AI`);
    for(const removed of ['Groq API','Multi-Agent Systems','Fine-Tuning'])assert(!agents.includes(removed),`${label}: ${removed} should not remain in LLMs & Agentic AI`);
    for(const tool of ['shadcn/ui','Streamlit'])assert(product.includes(tool),`${label}: ${tool} is missing from Full-Stack & APIs`);
    assert(platform.includes('SQLite'),`${label}: SQLite is missing from Data, Cloud & Deployment`);
    assert(platform.filter(tool=>tool==='Render').length===1,`${label}: Render should appear once in Data, Cloud & Deployment`);
    assert(analysis.includes('Colab'),`${label}: Colab is missing from Analysis & Experimentation`);
    assert(!state.tags.some(tag=>['Groq API','Multi-Agent Systems'].includes(tag.label)),`${label}: removed skill labels are still rendered`);
    assert(state.theme===theme, `${label}: requested theme was not applied`);
    assert(!state.overflow, `${label}: skills section causes horizontal overflow`);
    const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 78, captureBeyondViewport: false });
    fs.writeFileSync(path.join(shots, `${label}.jpg`), Buffer.from(shot.data, 'base64'));
    summaries[label]={tags:state.tags.length,assets:state.tags.filter(tag=>tag.kind==='asset').length,marks:state.tags.filter(tag=>tag.kind==='mark').length,overflow:state.overflow};
  }
  assert(runtimeErrors.length===0, `runtime errors: ${runtimeErrors.join('; ')}`);
  console.log(JSON.stringify({ pass: true, summaries, screenshots: shots }));
  ws.close();
}

main().catch(error => { console.error(error.stack || error); process.exitCode = 1; }).finally(async () => {
  await wait(150);
  browser.kill();
  await wait(500);
  try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
});
