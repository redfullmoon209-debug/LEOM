// Validate the free, no-registration public Statically CDN game URL in real Chromium.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 let browser;
 try{
  fs.mkdirSync('qa',{recursive:true});
  browser=await chromium.launch({headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:1200,height:760}});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',msg=>{if(msg.type()==='error')console.log('CDN console:',msg.text());});
  const url='https://cdn.statically.io/gh/redfullmoon209-debug/LEOM@main/preview/index.html';
  console.log('Public CDN test:',url);
  const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:50000});
  console.log('HTTP',response?.status(),'at',page.url());
  if(response?.status()!==200)throw Error('Public CDN failed HTTP '+response?.status());
  await page.waitForFunction(()=>!document.getElementById('start')?.disabled,{timeout:45000});
  await page.screenshot({path:'qa/free-public-entry.png'});
  await page.locator('#start').click();
  await page.waitForTimeout(650);
  assert.equal(await page.locator('#world canvas').count(),1);
  assert.ok(await page.locator('#start-screen').evaluate(el=>el.classList.contains('hidden')));
  await page.locator('[data-panel="bag"]').click();
  assert.equal(await page.locator('.slot').count(),50);
  await page.locator('[data-panel="shop"]').click();
  assert.equal(await page.locator('[data-action="chooseoffer"]').count(),21);
  await page.screenshot({path:'qa/free-public-shop.png'});
  assert.deepEqual(errors,[],'Public CDN must have zero JS runtime exceptions');
  console.log('PASS: FREE LEOM public browser CDN loads 3D game and bag/shop without sign-in.');
 }catch(error){console.error('PUBLIC LEOM URL QA:',error.stack||error);process.exitCode=1;}
 finally{if(browser)await browser.close();}
})();
