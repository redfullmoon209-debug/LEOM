// Free Chromium real browser smoke test for the standalone LEOM preview.
// Run using Playwright 1.56.1 on GitHub's public-repository free runner.
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs');
(async()=>{
 let browser;
 try{
  fs.mkdirSync('qa',{recursive:true});
  browser=await chromium.launch({
   headless:true,
   args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']
  });
  const page=await browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1});
  const pageErrors=[];
  page.on('pageerror',e=>{pageErrors.push(e.message);console.log('PAGE ERROR:',e.message);});
  page.on('console',m=>{if(m.type()==='error')console.log('CONSOLE ERROR:',m.text());});
  page.on('response',r=>{if(r.status()>=400)console.log('HTTP:',r.status(),r.url());});
  await page.goto('http://127.0.0.1:8799/preview/',{waitUntil:'domcontentloaded',timeout:45000});
  await page.locator('#load-note').waitFor({timeout:30000});
  try{await page.waitForFunction(()=>document.getElementById('start').disabled===false,{timeout:80000});}
  catch(e){
   console.log('START NOTE:',await page.locator('#load-note').innerText());
   await page.screenshot({path:'qa/boot-failed.png'});
   throw e;
  }
  await page.screenshot({path:'qa/ready.png'});
  assert.ok((await page.locator('#load-note').innerText()).includes('พร้อมเล่น'));
  await page.locator('#start').click();
  await page.waitForTimeout(1000);
  assert.ok(await page.locator('#start-screen').evaluate(el=>el.classList.contains('hidden')));
  assert.equal(await page.locator('#world canvas').count(),1);
  assert.ok((await page.locator('#job').innerText()).includes('Novice'));
  assert.ok((await page.locator('#bag-stat').innerText()).includes('/40'));

  // Exercise real gameplay controls and several original migrated RPG panels.
  await page.keyboard.down('w');await page.waitForTimeout(380);await page.keyboard.up('w');
  await page.keyboard.press('t');await page.keyboard.press('j');
  await page.locator('[data-panel="bag"]').click();
  await page.waitForTimeout(200);
  assert.ok((await page.locator('#panel-title').innerText()).includes('กระเป๋า'));
  assert.equal(await page.locator('.slot').count(),50);
  await page.locator('[data-panel="bank"]').click();
  assert.ok((await page.locator('#panel-title').innerText()).includes('คลัง'));
  await page.locator('[data-panel="shop"]').click();
  assert.ok((await page.locator('#panel-title').innerText()).includes('ร้านค้า'));
  assert.equal(await page.locator('[data-action="chooseoffer"]').count(),21);
  await page.locator('[data-panel="skills"]').click();
  assert.ok((await page.locator('#panel-body').innerText()).includes('Novice'));
  await page.locator('[data-panel="map"]').click();
  assert.ok((await page.locator('#panel-body').innerText()).includes('Arena'));
  await page.locator('#close-panel').click();
  await page.screenshot({path:'qa/playable-world.png'});

  // Narrow phone viewport and a touch movement control.
  await page.setViewportSize({width:414,height:844});
  await page.waitForTimeout(500);
  assert.equal(await page.locator('[data-dir="up"]').count(),1);
  assert.equal(await page.locator('#world canvas').count(),1);
  await page.screenshot({path:'qa/mobile.png'});
  assert.deepEqual(pageErrors,[],'No JavaScript runtime errors');
  console.log('PASS: LEOM 3D rendered, player movement, bag, storage, 21 offers, skills, map and mobile UI');
 }catch(e){
  console.error('LEOM browser QA FAIL:',e?.stack||e);
  process.exitCode=1;
 }finally{if(browser)await browser.close();}
})();
