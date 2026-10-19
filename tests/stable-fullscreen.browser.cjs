/* Regresión del diseño restaurado. No utiliza cuentas ni servicios reales. */
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
(async()=>{
 const root=path.resolve(__dirname,'..'),out='/tmp/biodex-stable-qa';fs.mkdirSync(out,{recursive:true});
 const server=http.createServer((req,res)=>{let f=path.join(root,req.url.split('?')[0]);if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,b)=>{if(e){res.writeHead(404);return res.end();}res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.ttf':'font/ttf','.webp':'image/webp','.mp3':'audio/mpeg'})[path.extname(f)]||'application/octet-stream');res.end(b);});});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'/tmp/biodex-chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const context=await browser.newContext({viewport:{width:1280,height:800},reducedMotion:'reduce'}),page=await context.newPage(),errors=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
 await context.route('https://script.google.com/**',r=>r.abort());
 const base='http://127.0.0.1:'+server.address().port;
 await page.goto(base+'/');await page.locator('#regNombre').waitFor();
 assert(!requests.some(u=>/\/console\.(js|css)/.test(u)));assert.equal(await page.locator('.console-tools').count(),0);
 await page.getByRole('button',{name:'Pantalla completa',exact:false}).click();await page.waitForFunction(()=>!!document.fullscreenElement);
 assert.equal(await page.getByRole('button',{name:'Salir de pantalla completa',exact:false}).getAttribute('aria-pressed'),'true');
 await page.getByRole('button',{name:'Salir de pantalla completa',exact:false}).click();await page.waitForFunction(()=>!document.fullscreenElement);
 await page.evaluate(()=>{document.documentElement.requestFullscreen=()=>Promise.reject(new Error('denied for test'));});
 await page.getByRole('button',{name:'Pantalla completa',exact:false}).click();await page.locator('.screen-full-help[open]').waitFor();await page.getByRole('button',{name:'Continuar',exact:true}).click();
 // La página de juego vuelve a ser alta, sin restricción ni escala del contenedor.
 await page.evaluate(()=>{sesion={token:'restored-fixture'};progreso=defaultProgress();progreso.jugador='Prueba de aula';view='codigo';render();});
 for(const [width,height]of [[390,700],[844,390],[844,180],[390,320]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(100);await page.locator('#codigoInput').fill('CAP-ESCRITURA');
  await page.keyboard.type('-OK');assert.equal(await page.locator('#codigoInput').inputValue(),'CAP-ESCRITURA-OK');
  const d=await page.evaluate(()=>({scroll:document.documentElement.scrollHeight,h:innerHeight,input:document.getElementById('codigoInput').getBoundingClientRect().height}));
  assert(d.scroll>height);assert(d.input>=44);assert.equal(await page.locator('#app').evaluate(e=>getComputedStyle(e).transform),'none');
  assert.notEqual(await page.locator('html').evaluate(e=>getComputedStyle(e).overflowY),'hidden');
  assert.equal(await page.locator('.console-edit-bar').count(),0);
 }
 const before=await page.evaluate(()=>JSON.stringify(progreso));await page.evaluate(()=>{Object.defineProperty(visualViewport,'height',{configurable:true,get:()=>130});Object.defineProperty(visualViewport,'offsetTop',{configurable:true,get:()=>70});visualViewport.dispatchEvent(new Event('resize'));visualViewport.dispatchEvent(new Event('scroll'));});
 await page.keyboard.type('-GIRO');await page.setViewportSize({width:844,height:390});assert.equal(await page.locator('#codigoInput').inputValue(),'CAP-ESCRITURA-OK-GIRO');
 assert.equal(await page.evaluate(()=>JSON.stringify(progreso)),before);assert.equal(await page.locator('html').evaluate(e=>e.style.getPropertyValue('--console-height')),'');
 await page.screenshot({path:out+'/restored-capture-844.png',fullPage:true});
 // Ausencia de API: ayuda en iPhone, con el diseño intacto.
 const mobile=await context.newPage();mobile.on('pageerror',e=>errors.push(e.message));await mobile.addInitScript(()=>{Object.defineProperty(navigator,'userAgent',{get:()=>'iPhone Safari'});});
 await mobile.goto(base+'/');await mobile.locator('#regNombre').waitFor();await mobile.evaluate(()=>{document.documentElement.requestFullscreen=undefined;Object.defineProperty(document,'fullscreenEnabled',{get:()=>false});});await mobile.getByRole('button',{name:'Pantalla completa',exact:false}).click();await mobile.locator('.screen-full-help[open]').waitFor();assert.match(await mobile.locator('.screen-full-help p').textContent(),/Añadir a pantalla de inicio/);await mobile.getByRole('button',{name:'Continuar',exact:true}).click();assert.equal(await mobile.locator('#app').evaluate(e=>getComputedStyle(e).transform),'none');
 await mobile.close();await page.goto(base+'/preview/');await page.locator('#regNombre').waitFor();assert.equal(await page.locator('.screen-full-button').count(),1);
 assert(!requests.some(u=>u.includes('script.google.com')));assert.deepEqual(errors,[]);
 await browser.close();server.close();console.log('PASS stable document scrolling, typing and rotation; native fullscreen enter/exit, denied and unavailable fallbacks; no console layer or API calls');
})().catch(e=>{console.error(e);process.exit(1);});
