/* Solo presentación: usa estado ficticio y bloquea todas las peticiones a Sheets. */
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'..'),OUT=process.env.BIODEX_PIXEL_QA||'/tmp/biodex-pixel-qa';fs.mkdirSync(OUT,{recursive:true});
const sizes=[[320,568],[360,640],[390,844],[430,932],[600,800],[768,1024],[820,1180],[1024,768],[1280,800],[1440,900],[1920,1080],[2560,1440],[568,320],[667,375],[844,390],[1024,600]];
const views=['panel','biodex','codigo','mapa','gimnasios','lineas','inventario','logros','ayuda','perfil'];
const results=[],errors=[],apiCalls=[];
(async()=>{
 const server=http.createServer((req,res)=>{const f=path.join(ROOT,decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!f.startsWith(ROOT+path.sep)){res.writeHead(403);return res.end();}fs.readFile(f,(e,b)=>{if(e){res.writeHead(404);return res.end();}res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.ttf':'font/ttf','.mp3':'audio/mpeg'})[path.extname(f)]||'application/octet-stream');res.end(b);});});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,executablePath:process.env.BIODEX_BROWSER_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 const context=await browser.newContext({reducedMotion:'reduce'});await context.route('https://script.google.com/**',route=>{apiCalls.push(route.request().postData());return route.abort();});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='warning'&&m.text().startsWith('BioDex:'))errors.push(m.text());});
 await page.goto('http://127.0.0.1:'+server.address().port+'/');await page.locator('#regNombre').waitFor();await page.evaluate(()=>document.fonts.ready);
 assert(await page.evaluate(()=>document.fonts.check('20px FieldPixel')),'Fuente pixel local disponible');
 const fixture=()=>page.evaluate(()=>{sesion={token:'pixel-fixture'};serverFeatures={captureMode:'code-only',megaPrizes:3};progreso=defaultProgress();progreso.jugador='Nicolás Explorador de los Siete Horizontes de BioNova';progreso.capturadas=['B001','B002','B003','B004','B005','B027','B030'];progreso.logros=['L01','L02','L08','L09','L10','L11'];progreso.sectores.abiertos={S01:true};progreso.gimnasios.abiertos={GYM01:true};progreso.configuracion={crt:false,avatarId:'aurora',landscapeId:'bosque'};view='panel';render();});
 async function inspect(label){
  await page.waitForTimeout(45);
  const data=await page.evaluate(()=>{
   const root=document.documentElement,visible=e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden';
   const controls=[...document.querySelectorAll('button,input,select,textarea')].filter(visible);
   return {width:innerWidth,height:innerHeight,scroll:root.scrollWidth,controls:controls.length,off:controls.filter(e=>{const r=e.getBoundingClientRect();return r.left< -1||r.right>innerWidth+1;}).map(e=>(e.id||e.textContent).slice(0,60)),internal:[...document.querySelectorAll('#view>.rpg-window,.device-screen,.register,.modal,.fx-dialog')].filter(visible).filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>e.className)};
  });
  results.push({label,...data});if(label.startsWith('access-')){const boxes=await page.evaluate(()=>{const a=document.querySelector('.welcome-title').getBoundingClientRect(),b=document.querySelector('.welcome-trainer').getBoundingClientRect();return {titleBottom:a.bottom,avatarTop:b.top};});assert(boxes.titleBottom<=boxes.avatarTop+1,label+' title/avatar overlap '+JSON.stringify(boxes));}if(data.scroll>data.width+1||data.off.length||data.internal.length){await page.screenshot({path:path.join(OUT,'failure.png'),fullPage:true});throw new Error(label+' '+JSON.stringify(data));}
 }
 for(const [width,height]of sizes){
  await page.setViewportSize({width,height});
  for(const mode of ['login','register']){await page.evaluate(mode=>{sesion=null;progreso=defaultProgress();accessMode=mode;render();},mode);await inspect('access-'+mode);}
  await fixture();
  for(const view of views){await page.evaluate(v=>go(v),view);await inspect(view);}
  await page.evaluate(()=>go('panel'));if([320,390,768,1280,1920].includes(width)&&height>600)await page.screenshot({path:path.join(OUT,`panel-${width}.png`),fullPage:true});
  if([320,390,768,1280].includes(width)&&height>500){
   await page.getByRole('button',{name:'Historia',exact:true}).click();for(let n=0;n<3;n++){await inspect('story-'+n);if(n===0)await page.screenshot({path:path.join(OUT,`story-${width}.png`)});await page.locator('.fx-story .primary').click();}
   await page.getByRole('button',{name:/Ajustar sonido/}).click();await inspect('audio');await page.getByRole('button',{name:'Listo',exact:true}).click();
   await page.evaluate(()=>renderFicha('B001'));await page.locator('.fx-expand-art').waitFor();await inspect('bioform-modal');await page.evaluate(()=>closeModal());
  }
  console.log('PASS layout',width+'×'+height);
 }
 // Las decoraciones no alteran los manejadores de navegación ni el estado.
 await page.setViewportSize({width:1280,height:900});await fixture();await page.waitForTimeout(100);
 const state=()=>page.evaluate(()=>JSON.stringify({progreso,sesion,serverFeatures}));const before=await state();
 const handlers=await page.locator('.nav button').evaluateAll(bs=>bs.map(b=>b.getAttribute('onclick')));
 assert.equal(await page.locator('.nav button .px-icon').count(),9);
 for(const view of views.slice(0,9)){await page.locator(`.nav button[onclick="go('${view}')"]`).click();assert.equal(await page.evaluate(()=>view),view);}
 assert.deepEqual(await page.locator('.nav button').evaluateAll(bs=>bs.map(b=>b.getAttribute('onclick'))),handlers);
 await page.evaluate(()=>go('panel'));await page.emulateMedia({reducedMotion:'no-preference'});await page.mouse.move(50,50);await page.mouse.move(1100,750);await page.waitForTimeout(100);assert.equal(await state(),before);assert.notEqual(await page.locator('#pxScenery').evaluate(e=>e.style.getPropertyValue('--px-x')),'');await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.px-horizon').evaluate(e=>getComputedStyle(e).transform),'none');
 for(const land of ['bosque','prisma','bruma','arcana']){await page.evaluate(id=>applyLandscape(id),land);await page.waitForTimeout(150);assert((await page.locator('body').evaluate(e=>getComputedStyle(e).getPropertyValue('--px-world'))).includes(land+'.webp'));await page.screenshot({path:path.join(OUT,'landscape-'+land+'.png')});}
 await page.evaluate(()=>applyLandscape('bosque'));
 // Texto aumentado, nombre largo y ventana intermedia: conservar lectura y campos.
 await page.setViewportSize({width:768,height:1024});await page.evaluate(()=>go('ayuda'));
 await page.addStyleTag({content:'#view p,#view li{font-size:21px!important;line-height:1.75!important}'});await inspect('text-140-percent');
 assert.equal(apiCalls.length,0,'La presentación no envía peticiones a Sheets');assert.deepEqual(errors,[]);
 const favicon=await page.evaluate(()=>[...document.querySelectorAll('link[rel=icon]')].map(e=>e.href));assert(favicon.some(s=>s.endsWith('favicon.svg?v=2.6.1')));
 await page.goto('http://127.0.0.1:'+server.address().port+'/preview/index.html');await page.locator('#regNombre').waitFor();assert.equal(await page.locator('#pxScenery').count(),1);await inspect('preview-login');
 const touchContext=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:3,reducedMotion:'reduce'});await touchContext.route('https://script.google.com/**',r=>{apiCalls.push('unexpected-touch-request');return r.abort();});const touch=await touchContext.newPage();await touch.goto('http://127.0.0.1:'+server.address().port+'/');await touch.locator('#regNombre').waitFor();await touch.getByRole('button',{name:'Crear personaje',exact:true}).tap();await touch.locator('#regNombre').fill('Prueba táctil');assert.equal(await touch.locator('#regNombre').evaluate(e=>getComputedStyle(e).fontSize),'16px');await touch.screenshot({path:path.join(OUT,'touch-register-390.png'),fullPage:true});assert.equal(await touch.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await touchContext.close();assert.equal(apiCalls.length,0);
 fs.writeFileSync(path.join(OUT,'layout.json'),JSON.stringify({results,apiCalls:apiCalls.length,errors,checks:['local-font','navigation-handlers','state-unchanged','four-landscapes','text-140-percent','favicon','preview','parallax','reduced-motion','touch-form']},null,2));
 await browser.close();server.close();console.log('PASS',results.length,'layout cases; unchanged state and handlers; 0 API calls.');
})().catch(e=>{console.error(e);process.exit(1);});
