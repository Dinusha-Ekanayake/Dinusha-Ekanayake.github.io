const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-project-catalog-qa-'));
const port = 9347;
const pageUrl = `file:///${path.resolve('index.html').replace(/\\/g, '/')}`;
const shotDir = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-project-catalog-shots-'));
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
  const assert = (condition, message) => { if (!condition) throw new Error(`ASSERTION: ${message}`); };

  await send('Page.enable');
  await send('Runtime.enable');
  await wait(1300);
  await evaluate("localStorage.clear(); location.reload(); true");
  await wait(1300);

  const expectedRepo = 'https://github.com/Dinusha-Ekanayake/PageTurn_Educational_Bookstore';
  const expectedPortfolio = {
    title: 'AI/ML Engineering Portfolio',
    repo: 'https://github.com/Dinusha-Ekanayake/Dinusha-Ekanayake.github.io',
    demo: 'https://dinusha-ekanayake.github.io',
    detail: 'pointer-responsive 3D technology sphere',
    tech: ['HTML5', 'CSS3', 'JavaScript', 'Canvas API', 'GitHub Pages']
  };
  const expectedDetailedProjects = [
    {
      title: 'SmartFlow – Intelligent Human-Tracking Smart Fan',
      period: 'May 2024 – Aug 2025',
      detail: 'up to three people',
      tech: ['ESP32', 'ESPHome', 'HLK-LD2450', 'MG995 Servo', 'DHT22', 'Home Assistant', 'Custom PCB']
    },
    {
      title: 'Research Assistant – Multi-Agent AI System',
      period: 'Dec 2025 – Present',
      detail: 'Fact-Checking Agent',
      tech: ['LangChain', 'Tool Calling', 'OpenAI GPT-4o-mini', 'Claude 3.5 Sonnet', 'Pydantic', 'DuckDuckGo Search', 'Streamlit', 'DOCX']
    }
  ];
  const expectedMiniProjects = [
    {
      title: 'CG Algorithm Visualizer',
      repo: 'https://github.com/Dinusha-Ekanayake/cg-visualizer',
      detail: 'step by step',
      tech: ['C++', 'OpenGL', 'GLFW', 'Dear ImGui', 'CMake']
    },
    {
      title: 'Algorithm Selection Expert System',
      repo: 'https://github.com/Dinusha-Ekanayake/Algorithm_Selection_Expert_System-Prolog',
      detail: '36 algorithms',
      tech: ['SWI-Prolog', 'Expert Systems', 'Rule-Based AI', 'Dynamic KB']
    },
    {
      title: 'AI Prompt Quality Analyzer',
      repo: 'https://github.com/Dinusha-Ekanayake/AI_Prompt_Quality_Assurance_Expert_System-Prolog',
      detail: 'score out of 100',
      tech: ['SWI-Prolog', 'Expert Systems', 'Rule-Based AI', 'Scoring']
    }
  ];
  const expectedBanners = {
    'PredictiX': 'assets/projects/predictix.png',
    'Research Assistant – Multi-Agent AI System': 'assets/projects/research-assistant.png',
    'CV Mate': 'assets/projects/cv-mate.png',
    'ReClaim': 'assets/projects/reclaim.png',
    'PageTurn': 'assets/projects/pageturn.png',
    'SmartFlow – Intelligent Human-Tracking Smart Fan': 'assets/projects/smartflow.png',
    'CG Algorithm Visualizer': 'assets/projects/cg-visualizer.png',
    'Algorithm Selection Expert System': 'assets/projects/algorithm-selection-expert-system.png',
    'AI Prompt Quality Analyzer': 'assets/projects/ai-prompt-quality-analyzer.png',
    'AI/ML Engineering Portfolio': 'assets/projects/ai-ml-portfolio.jpg'
  };
  for (const [title, asset] of Object.entries(expectedBanners)) {
    const file = path.resolve(asset);
    assert(fs.existsSync(file), `${title}: banner asset is missing`);
    assert(fs.statSync(file).size > 10_000, `${title}: banner asset is unexpectedly small`);
  }
  const results = {};
  for (const [label, width, height] of [['desktop', 1440, 900], ['tablet', 768, 900], ['mobile', 375, 812]]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 });
    await evaluate("window.dispatchEvent(new Event('resize')); true");
    await wait(350);
    await evaluate("applyProjectFilter('all'); true");
    await wait(350);
    const state = await evaluate(`(() => {
      const index=projs.findIndex(project=>project.title==='PageTurn');
      const project=index>=0?projs[index]:null;
      const portfolio=projs.find(project=>project.title===${JSON.stringify('AI/ML Engineering Portfolio')})||null;
      const detailedProjects=projs.filter(project=>project.title.startsWith('SmartFlow')||project.title.startsWith('Research Assistant'));
      const banners=projs.map(item=>{
        const card=[...document.querySelectorAll('#projGrid .proj-card[data-copy="1"]')].find(node=>node.querySelector('.pj-title')?.textContent.trim()===item.title);
        const image=card?.querySelector('.pj-thumb img');
        return {title:item.title,path:item.img||'',rendered:!!image,loaded:!!image?.complete&&image.naturalWidth>0,src:image?.getAttribute('src')||''};
      });
      const allReadout=document.getElementById('projectReadout').textContent.trim();
      applyProjectFilter('Full Stack');
      const filteredTitles=[...document.querySelectorAll('#projGrid .pj-title')].map(node=>node.textContent.trim());
      const fullStackReadout=document.getElementById('projectReadout').textContent.trim();
      applyProjectFilter('Frontend');
      const frontendReadout=document.getElementById('projectReadout').textContent.trim();
      const frontendTitles=[...document.querySelectorAll('#projGrid .pj-title')].map(node=>node.textContent.trim());
      applyProjectFilter('Mini Projects');
      const miniReadout=document.getElementById('projectReadout').textContent.trim();
      const miniTitles=[...document.querySelectorAll('#projGrid .pj-title')].map(node=>node.textContent.trim());
      const minis=projs.filter(item=>item.category==='Mini Projects');
      const captureTitle=${JSON.stringify(['CG Algorithm Visualizer', 'Algorithm Selection Expert System', 'AI Prompt Quality Analyzer'][[['desktop', 1440, 900], ['tablet', 768, 900], ['mobile', 375, 812]].findIndex(item=>item[0]===label)])};
      const captureIndex=projs.findIndex(item=>item.title===captureTitle);
      if(captureIndex>=0)openProj(captureIndex);
      const heroCount=[...document.querySelectorAll('.hs')].find(item=>item.querySelector('.hs-l')?.textContent.includes('Featured Systems'))?.querySelector('.hs-n')?.textContent.trim()||'';
      return {
        index,total:projs.length,unique:new Set(projs.map(item=>item.title)).size,project,portfolio,detailedProjects,
        filtered:filteredTitles.includes('PageTurn'),heroCount,fullStackReadout,
        allReadout,frontendReadout,frontendTitles,miniReadout,miniTitles,minis,
        banners,
        frontendFilterExists:!!document.querySelector('[data-filter="Frontend"]'),
        miniFilterExists:!!document.querySelector('[data-filter="Mini Projects"]'),
        modalTitle:document.getElementById('mTitle').textContent.trim(),
        modalDescription:document.getElementById('mDesc').textContent.trim(),
        modalTechs:[...document.querySelectorAll('#mTechs span')].map(node=>node.textContent.trim()),
        modalImage:{exists:!!document.querySelector('#modalImgWrap .modal-img'),loaded:document.querySelector('#modalImgWrap .modal-img')?.naturalWidth>0,alt:document.querySelector('#modalImgWrap .modal-img')?.alt||''},
        repoHref:document.querySelector('#mLinks a')?.href||'',
        overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth
      };
    })()`);
    assert(state.index>=0, `${label}: PageTurn is missing from the project catalog`);
    assert(state.total===10&&state.unique===10, `${label}: expected ten unique projects, received ${state.total} total / ${state.unique} unique`);
    for (const [title, asset] of Object.entries(expectedBanners)) {
      const banner=state.banners.find(item=>item.title===title);
      assert(banner?.path===asset&&banner.src===asset, `${label}: ${title} does not use its local GitHub banner`);
      assert(banner.rendered&&banner.loaded, `${label}: ${title} banner did not render`);
    }
    assert(state.project.category==='Full Stack'&&state.filtered, `${label}: PageTurn is missing from the Full Stack filter`);
    assert(state.project.desc.includes('1,010+')&&state.project.fullDesc.includes('12 academic categories'), `${label}: README-backed PageTurn details are incomplete`);
    for (const tech of ['React','Node.js','Express','SQLite']) assert(state.project.tech.includes(tech), `${label}: missing ${tech} technology`);
    assert(state.project.gh===expectedRepo, `${label}: PageTurn GitHub destination is incorrect`);
    assert(state.portfolio&&state.portfolio.category==='Frontend'&&state.frontendTitles.includes(expectedPortfolio.title), `${label}: portfolio is missing from the Frontend filter`);
    assert(state.portfolio.gh===expectedPortfolio.repo&&state.portfolio.demo===expectedPortfolio.demo, `${label}: portfolio repository or live demo destination is incorrect`);
    assert(state.portfolio.fullDesc.includes(expectedPortfolio.detail), `${label}: README-backed portfolio details are incomplete`);
    for (const tech of expectedPortfolio.tech) assert(state.portfolio.tech.includes(tech), `${label}: portfolio is missing ${tech}`);
    for (const expected of expectedDetailedProjects) {
      const project=state.detailedProjects.find(item=>item.title===expected.title);
      assert(project?.period===expected.period, `${label}: ${expected.title} period is missing or incorrect`);
      assert(project.fullDesc.includes(expected.detail), `${label}: ${expected.title} detailed description is incomplete`);
      for (const tech of expected.tech) assert(project.tech.includes(tech), `${label}: ${expected.title} is missing ${tech}`);
    }
    assert(state.frontendFilterExists&&/\/ 01$/.test(state.frontendReadout), `${label}: Frontend filter should contain the portfolio project`);
    assert(state.miniFilterExists&&/\/ 03$/.test(state.miniReadout), `${label}: Mini Projects filter should contain three projects`);
    assert(/\/ 02$/.test(state.fullStackReadout), `${label}: Full Stack filter total should be 02`);
    for (const expected of expectedMiniProjects) {
      const project=state.minis.find(item=>item.title===expected.title);
      assert(project&&state.miniTitles.includes(expected.title), `${label}: ${expected.title} is missing from Mini Projects`);
      assert(project.gh===expected.repo, `${label}: ${expected.title} repository is incorrect`);
      assert(project.fullDesc.toLowerCase().includes(expected.detail.toLowerCase()), `${label}: ${expected.title} README-backed detail is missing`);
      for (const tech of expected.tech) assert(project.tech.includes(tech), `${label}: ${expected.title} is missing ${tech}`);
    }
    const captured=expectedMiniProjects.find(item=>item.title===state.modalTitle);
    assert(captured&&state.repoHref===captured.repo, `${label}: mini-project modal or GitHub destination is incorrect`);
    assert(state.modalImage.exists&&state.modalImage.loaded&&state.modalImage.alt===state.modalTitle, `${label}: project modal banner is missing or inaccessible`);
    assert(state.heroCount==='10'&&/\/ 10$/.test(state.allReadout), `${label}: overall project totals were not updated to 10`);
    assert(!state.overflow, `${label}: page has horizontal overflow`);
    const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(path.join(shotDir, `${label}.png`), Buffer.from(shot.data, 'base64'));
    const detailFilter=label==='desktop'?'Agentic AI':'Embedded';
    await evaluate(`(()=>{closeModal();applyProjectFilter(${JSON.stringify(detailFilter)});document.querySelectorAll('#projects .rv').forEach(node=>node.classList.add('vis'));document.documentElement.style.scrollBehavior='auto';const section=document.getElementById('projects');window.scrollTo(0,window.scrollY+section.getBoundingClientRect().top);return true})()`);
    await wait(900);
    const cardShot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(path.join(shotDir, `${label}-cards.png`), Buffer.from(cardShot.data, 'base64'));
    results[label] = state;
  }

  const portfolioModal = await evaluate(`(() => {
    applyProjectFilter('all');
    const index=projs.findIndex(project=>project.title===${JSON.stringify('AI/ML Engineering Portfolio')});
    if(index>=0)openProj(index);
    const image=document.querySelector('#modalImgWrap .modal-img');
    return {
      title:document.getElementById('mTitle').textContent.trim(),
      links:[...document.querySelectorAll('#mLinks a')].map(node=>node.href),
      image:{loaded:!!image&&image.complete&&image.naturalWidth>0,alt:image?.alt||''}
    };
  })()`);
  assert(portfolioModal.title===expectedPortfolio.title, 'portfolio modal did not open');
  const normalizedPortfolioLinks=portfolioModal.links.map(url=>url.replace(/\/$/,''));
  assert(normalizedPortfolioLinks.includes(expectedPortfolio.repo.replace(/\/$/,''))&&normalizedPortfolioLinks.includes(expectedPortfolio.demo.replace(/\/$/,'')), 'portfolio modal is missing repository or live-demo link');
  assert(portfolioModal.image.loaded&&portfolioModal.image.alt===expectedPortfolio.title, 'portfolio modal preview is missing or inaccessible');

  await evaluate(`(() => {
    const required=['PageTurn','CG Algorithm Visualizer','Algorithm Selection Expert System','AI Prompt Quality Analyzer','AI/ML Engineering Portfolio'];
    const legacy=projs.filter(project=>!required.includes(project.title)).map(project=>({...project,img:''}));
    legacy.push({title:'Custom Project',type:'Personal',category:'Full Stack',desc:'Preserve me',tech:[]});
    localStorage.setItem('de4_proj',JSON.stringify(legacy));
    localStorage.removeItem('de4_project_version');
    location.reload();
    return true;
  })()`);
  await wait(1200);
  const migration = await evaluate(`({
    pageTurn:projs.filter(project=>project.title==='PageTurn').length,
    cg:projs.filter(project=>project.title==='CG Algorithm Visualizer').length,
    algorithm:projs.filter(project=>project.title==='Algorithm Selection Expert System').length,
    prompt:projs.filter(project=>project.title==='AI Prompt Quality Analyzer').length,
    portfolio:projs.filter(project=>project.title==='AI/ML Engineering Portfolio').length,
    custom:projs.filter(project=>project.title==='Custom Project').length,
    banners:projs.filter(project=>project.title!=='Custom Project').every(project=>{const image=String(project.img||'').toLowerCase();return image.startsWith('assets/projects/')&&['.png','.jpg','.jpeg'].some(extension=>image.endsWith(extension))}),
    unique:new Set(projs.map(project=>project.title)).size,
    total:projs.length
  })`);
  assert(migration.pageTurn===1&&migration.cg===1&&migration.algorithm===1&&migration.prompt===1&&migration.portfolio===1&&migration.custom===1&&migration.banners&&migration.unique===11&&migration.total===11, 'project migration did not add required projects, refresh canonical banners, and preserve custom projects');

  assert(runtimeErrors.length===0, `runtime errors: ${runtimeErrors.join('; ')}`);
  console.log(JSON.stringify({ pass: true, results, migration, runtimeErrors, screenshots: shotDir }, null, 2));
  ws.close();
}

main().catch(error => { console.error(error.stack || error); process.exitCode = 1; }).finally(async () => {
  await wait(150);
  browser.kill();
  await wait(500);
  try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
});
