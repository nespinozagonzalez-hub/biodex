/* Pruebas de navegador aisladas: interceptan todas las solicitudes a Apps Script. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
let BASE=process.env.BIODEX_TEST_URL;
let localServer;
const OUT=process.env.BIODEX_QA_DIR||'/tmp/biodex-experiencia-qa';
fs.mkdirSync(OUT,{recursive:true});
const checks=[],errors=[];
function ok(text){checks.push(text);console.log('PASS',text);}
(async()=>{
 if(!BASE){localServer=http.createServer((req,res)=>{const file=path.join(__dirname,'..',decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!file.startsWith(path.resolve(__dirname,'..')+path.sep)){res.writeHead(403);return res.end();}fs.readFile(file,(e,b)=>{if(e){res.writeHead(404);return res.end();}const ext=path.extname(file);res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp'})[ext]||'application/octet-stream');res.end(b);});});await new Promise(r=>localServer.listen(0,'127.0.0.1',r));BASE='http://127.0.0.1:'+localServer.address().port+'/';}
 const browser=await chromium.launch({headless:true,executablePath:process.env.BIODEX_BROWSER_EXECUTABLE||undefined,args:['--no-sandbox','--autoplay-policy=user-gesture-required','--disable-dev-shm-usage']});
 const context=await browser.newContext({viewport:{width:1280,height:1000}});
 await context.addInitScript(()=>{
   const Native=window.AudioContext;window.__audio=[];
   if(Native)window.AudioContext=class extends Native{
     constructor(...args){super(...args);window.__audio.push(this);this.__oscillators=0;this.__analyser=this.createAnalyser();this.__analyser.fftSize=2048;}
     createOscillator(){this.__oscillators++;return super.createOscillator();}
     createDynamicsCompressor(){const node=super.createDynamicsCompressor();node.connect(this.__analyser);return node;}
   };
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='warning'&&m.text().startsWith('BioDex:')){errors.push(m.text());console.error(m.text());}});
 let server={jugador:'Exploradora QA',capturadas:['B001','B002'],codigosUsados:[],logros:['L01'],ultimaBioforma:'B002',configuracion:{crt:false,avatarId:'aurora',landscapeId:'bosque'},gimnasios:{abiertos:{}},sectores:{abiertos:{}}};
 const requests=[];
 await context.route('https://script.google.com/**',async route=>{
   const data=route.request().postDataJSON();requests.push(data);let extra={};
   if(data.action==='redeem'){
     await new Promise(r=>setTimeout(r,650));
     if(data.code==='QA-INVALID'){return route.fulfill({json:{ok:false,error:'Código incorrecto. Revisa tu señal.'}});}
     if(data.code==='QA-FAIL'){return route.abort('failed');}
     if(data.code==='QA-SEC'){server.sectores.abiertos.S01=true;extra={kind:'sector',message:'Territorio abierto.'};}
     else if(data.code==='QA-GYM'){server.gimnasios.abiertos.GYM01=true;extra={kind:'gym',message:'Gimnasio abierto.'};}
     else{const id={'QA-COMMON':'B003','QA-RARE':'B030','QA-MEGA':'B031'}[data.code];const duplicate=server.capturadas.includes(id);if(!duplicate){server.capturadas.push(id);server.ultimaBioforma=id;if(id==='B003')server.logros.push('L09');}extra={kind:'capture',bioforma:id,duplicate,message:duplicate?'Ya estaba registrada.':'Captura confirmada.'};}
   }
   await route.fulfill({json:{ok:true,token:'qa-local-token',features:{captureMode:'code-only',megaPrizes:3},progreso:server,...extra}});
 });
 await page.goto(BASE);await page.locator('#regNombre').waitFor();
 assert.equal(await page.evaluate(()=>window.__audio.length),0);ok('Sin reproducción ni contexto de audio antes de un gesto');
 await page.locator('#regNombre').fill('Exploradora QA');await page.locator('#regClave').fill('123456');await page.locator('.access-submit').click();await page.locator('.field-hero').waitFor();await page.waitForTimeout(450);
 assert.equal(await page.locator('.fx-notice').count(),0);ok('Ingreso conserva colección y no vuelve a celebrar logros antiguos');
 const state=()=>page.evaluate(()=>JSON.stringify({progreso,sesion,serverFeatures}));
 const initial=await state(),before=requests.length;
 await page.getByRole('button',{name:/Ajustar sonido/}).click();await page.locator('#fxActivateAudio').click();await page.waitForTimeout(800);
 assert.equal(await page.evaluate(()=>window.__audio.length),1);
 assert.equal(await page.evaluate(()=>window.__audio[0].state),'running');
 assert(await page.evaluate(()=>window.__audio[0].__oscillators)>0);
 const rms=await page.evaluate(()=>{const a=window.__audio[0].__analyser,x=new Float32Array(a.fftSize);a.getFloatTimeDomainData(x);return Math.sqrt(x.reduce((s,v)=>s+v*v,0)/x.length);});
 assert(rms>0.000001,'La mezcla debe producir una señal audible');ok('Música sintetizada produce señal de audio real y efectos habilitados');
 await page.locator('#fx-music-volume').fill('31');await page.locator('#fx-effects-volume').fill('42');await page.locator('#fx-motion').selectOption('reduce');assert(await page.locator('body').evaluate(e=>e.classList.contains('fx-reduced')));
 await page.getByRole('button',{name:'Listo',exact:true}).click();await page.getByRole('button',{name:'Historia',exact:true}).click();
 for(let n=1;n<=3;n++){assert.equal(await page.locator('.fx-story-dots').getAttribute('aria-label'),`Escena ${n} de 3`);await page.locator('.fx-story .primary').click();}
 assert.equal(await page.locator('.fx-story').count(),0);
 await page.evaluate(()=>renderFicha('B001'));await page.waitForTimeout(500);await page.screenshot({path:path.join(OUT,'ficha-1280.png')});await page.locator('.fx-expand-art').waitFor({timeout:4000});await page.locator('.fx-expand-art').click();await page.locator('.fx-artwork>img').waitFor();assert(await page.locator('.fx-artwork>img').evaluate(img=>img.complete&&img.naturalWidth>0));await page.keyboard.press('Escape');assert.equal(await page.locator('#modalBack.show').count(),1);await page.evaluate(()=>closeModal());
 assert.equal(await state(),initial);assert.equal(requests.length,before);ok('Audio, volúmenes, movimiento, prólogo y visor no escriben progreso ni hacen solicitudes');
 await page.evaluate(()=>go('mapa'));await page.waitForTimeout(400);assert.equal(await page.evaluate(()=>window.__audio.length),1);await page.evaluate(()=>go('panel'));ok('Un solo reproductor persiste al navegar');
 await page.evaluate(()=>Object.defineProperty(document,'hidden',{configurable:true,get:()=>true}));await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));await page.waitForTimeout(120);assert.equal(await page.evaluate(()=>window.__audio[0].state),'suspended');
 await page.evaluate(()=>Object.defineProperty(document,'hidden',{configurable:true,get:()=>false}));await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>window.__audio[0].state),'running');ok('Música se suspende en segundo plano y continúa al volver');
 await page.evaluate(()=>go('codigo'));await page.locator('#codigoInput').fill('QA-COMMON');await page.locator('.capture-terminal button[type=submit]').click();await page.locator('.fx-scanning').waitFor();assert.match(await page.locator('.fx-scan-status').textContent(),/Buscando/);
 await page.locator('#captureOverlay[data-fx-rarity=common]').waitFor();assert(await page.evaluate(()=>progreso.capturadas.includes('B003')));await page.locator('.fx-skip-capture').click();await page.locator('#modalBack.show').waitFor();await page.evaluate(()=>closeModal());await page.locator('.fx-notice').waitFor();
 assert.match(await page.locator('.fx-notice').textContent(),/MEDALLA OBTENIDA/);await page.locator('.fx-notice-close').click();await page.locator('.fx-notice').waitFor();assert.match(await page.locator('.fx-notice').textContent(),/LINAJE COMPLETO/);await page.locator('.fx-notice-close').click();ok('Escáner, captura rápida, medalla y linaje aparecen tras confirmación');
 for(const [code,rarity]of [['QA-RARE','rare'],['QA-MEGA','mega']]){await page.evaluate(()=>go('codigo'));await page.locator('#codigoInput').fill(code);await page.locator('.capture-terminal button[type=submit]').click();await page.locator(`#captureOverlay[data-fx-rarity=${rarity}]`).waitFor();await page.locator('#captureOverlay .portrait.image-ready').waitFor();assert.equal(await page.locator('#captureOverlay .portrait-fallback').evaluate(e=>Number(getComputedStyle(e).opacity)),0);await page.screenshot({path:path.join(OUT,`captura-${rarity}.png`)});if(rarity==='mega')await page.keyboard.press('Escape');else await page.locator('.fx-skip-capture').click();await page.locator('#modalBack.show').waitFor();await page.evaluate(()=>closeModal());}
 await page.waitForTimeout(800);for(let i=0;i<12&&await page.locator('.fx-notice').count();i++){await page.locator('.fx-notice-close').click();await page.waitForTimeout(120);}ok('Capturas raras y mega tienen presentación propia');
 await page.evaluate(()=>go('codigo'));await page.locator('#codigoInput').fill('QA-COMMON');await page.locator('.capture-terminal button[type=submit]').click();await page.waitForTimeout(1000);assert.equal(await page.locator('#captureOverlay:visible').count(),0);assert.equal(await page.locator('.fx-notice').count(),0);ok('Código repetido no repite captura ni recompensas');
 const confirmed=await state();for(const code of ['QA-INVALID','QA-FAIL']){await page.locator('#codigoInput').fill(code);await page.locator('.capture-terminal button[type=submit]').click();await page.waitForTimeout(1000);assert.equal(await state(),confirmed);assert.equal(await page.locator('#captureOverlay:visible').count(),0);}ok('Error y corte de red no conceden ni celebran capturas');
 for(const [code,text]of [['QA-SEC','NUEVO TERRITORIO'],['QA-GYM','RUTA ABIERTA']]){await page.locator('#codigoInput').fill(code);await page.locator('.capture-terminal button[type=submit]').click();await page.locator('.fx-notice').waitFor();assert.match(await page.locator('.fx-notice').textContent(),new RegExp(text));await page.locator('.fx-notice-close').click();}ok('Territorios y gimnasios celebran aperturas confirmadas');
 await page.evaluate(()=>go('lineas'));await page.locator('.fx-lineage-complete').waitFor();assert.equal(await page.locator('.fx-lineage').count(),10);ok('Diez linajes mantienen miembros y progreso, con sello de colección completa');
 const layout=[];
 for(const width of [320,390,768,1280]){
   await page.setViewportSize({width,height:1000});
   for(const view of ['panel','biodex','codigo','mapa','gimnasios','lineas','inventario','logros','ayuda','perfil']){
     await page.evaluate(v=>go(v),view);await page.waitForTimeout(90);
     const m=await page.evaluate(()=>({w:innerWidth,scroll:document.documentElement.scrollWidth,off:[...document.querySelectorAll('button,input,select')].filter(e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden').filter(e=>{const b=e.getBoundingClientRect();return b.left< -1||b.right>innerWidth+1;}).map(e=>e.textContent.slice(0,40))}));
     assert(m.scroll<=width+1,`${view} ${width}: overflow ${m.scroll}`);assert.deepEqual(m.off,[],`${view} ${width}: control fuera de pantalla`);layout.push({width,view,overflow:0});
   }
   await page.evaluate(()=>go('panel'));await page.screenshot({path:path.join(OUT,`refugio-${width}.png`),fullPage:true});
   await page.getByRole('button',{name:/Ajustar sonido/}).click();await page.screenshot({path:path.join(OUT,`sonido-${width}.png`)});await page.getByRole('button',{name:'Listo',exact:true}).click();
   await page.getByRole('button',{name:'Historia',exact:true}).click();await page.screenshot({path:path.join(OUT,`historia-${width}.png`)});await page.keyboard.press('Escape');
 }
 ok('40 pantallas sin desbordamiento a 320, 390, 768 y 1280 px');
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>go('biodex'));await page.waitForTimeout(150);await page.screenshot({path:path.join(OUT,'coleccion-390.png')});await page.evaluate(()=>go('lineas'));await page.waitForTimeout(150);await page.screenshot({path:path.join(OUT,'linajes-390.png')});await page.emulateMedia({reducedMotion:'reduce'});assert(await page.locator('body').evaluate(e=>e.classList.contains('fx-reduced')));ok('Se respeta la preferencia de movimiento reducido');
 await page.reload();await page.locator('.field-hero').waitFor();await page.waitForTimeout(400);assert.equal(await page.evaluate(()=>window.__audio.length),0);assert.equal(await page.locator('.fx-notice').count(),0);
 await page.getByRole('button',{name:/Ajustar sonido/}).click();assert(await page.locator('#fx-music').isChecked());assert.equal(await page.locator('#fx-music-volume').inputValue(),'31');await page.getByRole('button',{name:'Silenciar todo',exact:true}).click();assert(!await page.locator('#fx-music').isChecked());ok('Preferencias locales sobreviven a recarga sin reproducir audio automáticamente');
 assert.equal(errors.length,0,errors.join('\n'));assert(!requests.some(r=>r.action==='settings'));ok('Cero errores de JavaScript y cero escrituras remotas desde la capa estética');
 const fallback=await context.newPage();await fallback.addInitScript(()=>{Object.defineProperty(window,'AudioContext',{value:undefined});Object.defineProperty(window,'webkitAudioContext',{value:undefined});Storage.prototype.setItem=function(){throw new Error('storage unavailable');};});await fallback.goto(BASE);await fallback.locator('#regNombre').waitFor();await fallback.getByRole('button',{name:/Ajustar sonido/}).click();await fallback.locator('#fxActivateAudio').click();assert.match(await fallback.locator('#fxAudioStatus').textContent(),/no ofrece audio/);await fallback.locator('#fx-motion').selectOption('reduce');ok('Sin audio o almacenamiento, la interfaz continúa funcionando');
 fs.writeFileSync(path.join(OUT,'resultado.json'),JSON.stringify({checks,layout,errors,rms,requests:requests.map(r=>r.action)},null,2));await browser.close();if(localServer)localServer.close();console.log(`${checks.length} comprobaciones aprobadas. Evidencia: ${OUT}`);
})().catch(e=>{console.error(e);process.exit(1);});
