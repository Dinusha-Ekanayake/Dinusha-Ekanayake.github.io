const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-footer-volunteer-qa-'));
const shots = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-footer-volunteer-shots-'));
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

  const expectedVolunteerRecords = [
    {
      role: 'Volunteer',
      org: 'Sasnaka Sansada Foundation',
      date: '2023 — 2024',
      href: 'https://www.linkedin.com/in/dinusha-ekanayake-0a0963266/details/volunteer-experiences/edit/forms/675017542/'
    },
    {
      role: 'Head of Media Unit · Member · Tech Support · Photographer · Graphic Designer',
      org: "Badulla District Engineering Students' Association (BDESA)",
      href: 'https://www.linkedin.com/in/dinusha-ekanayake-0a0963266/details/volunteer-experiences/edit/forms/1331830445/'
    }
  ];
  const summaries = {};
  for (const [label, width, height, theme] of [
    ['desktop-dark', 1440, 900, 'dark'],
    ['tablet-light', 768, 900, 'light'],
    ['mobile-dark', 375, 812, 'dark']
  ]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 });
    await evaluate(`(()=>{document.documentElement.dataset.theme=${JSON.stringify(theme)};document.querySelectorAll('#experience .rv,footer .rv').forEach(node=>node.classList.add('vis'));renderExp();document.documentElement.style.scrollBehavior='auto';document.getElementById('experience').scrollIntoView({block:'start'});window.dispatchEvent(new Event('resize'));return true})()`);
    await wait(650);
    const experience = await evaluate(`(()=>({
      items:[...document.querySelectorAll('#expList .exp-item')].map(item=>({role:item.querySelector('.exp-role')?.childNodes[0]?.textContent.trim()||'',org:item.querySelector('.exp-org')?.textContent.trim()||'',date:item.querySelector('.exp-date')?.textContent.trim()||'',href:item.querySelector('.exp-link')?.href||'',target:item.querySelector('.exp-link')?.target||'',rel:item.querySelector('.exp-link')?.rel||''})),
      overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth
    }))()`);
    const experienceShot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 80, captureBeyondViewport: false });
    fs.writeFileSync(path.join(shots, `${label}-volunteering.jpg`), Buffer.from(experienceShot.data, 'base64'));

    for (const expected of expectedVolunteerRecords) {
      const matches=experience.items.filter(item=>item.role===expected.role&&item.org===expected.org);
      assert(matches.length===1, `${label}: ${expected.org} should appear exactly once`);
      assert(!expected.date||matches[0].date===expected.date, `${label}: ${expected.org} date is incorrect`);
      assert(matches[0].href===expected.href&&matches[0].target==='_blank'&&matches[0].rel.includes('noopener'), `${label}: ${expected.org} LinkedIn record is missing or unsafe`);
    }
    assert(!experience.overflow, `${label}: volunteering causes horizontal overflow`);
    await evaluate(`(()=>{document.querySelector('#expList .exp-item:last-child')?.scrollIntoView({block:'end'});return true})()`);
    await wait(350);
    const newVolunteerShot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 80, captureBeyondViewport: false });
    fs.writeFileSync(path.join(shots, `${label}-volunteering-new.jpg`), Buffer.from(newVolunteerShot.data, 'base64'));

    await evaluate(`(()=>{document.querySelector('footer')?.scrollIntoView({block:'start'});return true})()`);
    await wait(450);
    const footer = await evaluate(`(()=>{
      const footers=[...document.querySelectorAll('footer')],footer=footers[0],hrefs=[...footer.querySelectorAll('a')].map(link=>link.href),text=footer.innerText;
      const count=prefix=>hrefs.filter(href=>href.startsWith(prefix)).length;
      const contact=footer.querySelector('#contact');
      return {count:footers.length,contactInside:!!contact,contactOutsideMain:!document.querySelector('main')?.contains(contact),legacyLinks:footer.querySelectorAll('.ft-links').length,nameCount:(text.match(/Dinusha Ekanayake/g)||[]).length,github:count('https://github.com/Dinusha-Ekanayake'),linkedin:count('https://linkedin.com/in/dinusha-ekanayake-0a0963266'),email:count('mailto:dinushabawantha2003@gmail.com'),phone:count('tel:+94701650424'),theme:document.documentElement.dataset.theme,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth};
    })()`);
    const footerShot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 80, captureBeyondViewport: false });
    fs.writeFileSync(path.join(shots, `${label}-footer.jpg`), Buffer.from(footerShot.data, 'base64'));

    assert(footer.count===1&&footer.contactInside&&footer.contactOutsideMain, `${label}: contact and sign-off are not one site-footer landmark`);
    assert(footer.legacyLinks===0, `${label}: duplicate legacy footer links remain`);
    assert(footer.nameCount===1, `${label}: footer repeats the portfolio owner name`);
    for (const [name,count] of Object.entries({GitHub:footer.github,LinkedIn:footer.linkedin,Email:footer.email,Phone:footer.phone})) assert(count===1, `${label}: ${name} should appear exactly once in the merged footer`);
    assert(footer.theme===theme, `${label}: requested theme was not applied`);
    assert(!footer.overflow, `${label}: merged footer causes horizontal overflow`);
    await evaluate(`(()=>{document.querySelector('footer')?.scrollIntoView({block:'end'});return true})()`);
    await wait(300);
    const endGeometry = await evaluate(`(()=>{const button=document.getElementById('btt')?.getBoundingClientRect(),signoff=document.querySelector('.footer-signoff')?.getBoundingClientRect();return {overlap:!!button&&!!signoff&&button.left<signoff.right&&button.right>signoff.left&&button.top<signoff.bottom&&button.bottom>signoff.top}})()`);
    assert(!endGeometry.overlap, `${label}: back-to-top button overlaps the footer sign-off`);
    const footerEndShot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 80, captureBeyondViewport: false });
    fs.writeFileSync(path.join(shots, `${label}-footer-end.jpg`), Buffer.from(footerEndShot.data, 'base64'));
    summaries[label]={experiences:experience.items.length,footerCount:footer.count,overflow:footer.overflow};
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
