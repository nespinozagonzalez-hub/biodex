/* Reproduce el teclado reduciendo visualViewport sin cambiar la orientación CSS. */
const {chromium}=require('playwright');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'..'),OUT='/tmp/biodex-input-qa';
fs.mkdirSync(OUT,{recursive:true});
(async()=>{
 const server=http.createServer((req,res)=>{
  let file=path.join(ROOT,req.url.split('?')[0]);if(file.endsWith('/'))file+='index.html';
  fs.readFile(file,(error,data)=>{if(error){res.writeHead(404);return res.end();}res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.ttf':'font/ttf','.mp3':'audio/mpeg','.webp':'image/webp'})[path.extname(file)]||'application/octet-stream');res.end(data);});
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({executablePath:'/tmp/biodex-chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const context=await browser.newContext({viewport:{width:390,height:700},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
 const page=await context.newPage(),errors=[],requests=[],cases=[];
 page.on('pageerror',error=>errors.push(error.message));
 await context.route('https://script.google.com/**',route=>{requests.push(route.request().postDataJSON());return route.abort();});
 await page.goto('http://127.0.0.1:'+server.address().port+'/console-preview/');await page.locator('.field-device').waitFor();
 await page.locator('.rotate-hint button').evaluate(el=>el.click());
 const state=()=>page.evaluate(()=>JSON.stringify(progreso));
 async function keyboard(height,offset=0){await page.evaluate(({height,offset})=>{
  Object.defineProperty(visualViewport,'height',{configurable:true,get:()=>height});
  Object.defineProperty(visualViewport,'offsetTop',{configurable:true,get:()=>offset});
  visualViewport.dispatchEvent(new Event('resize'));visualViewport.dispatchEvent(new Event('scroll'));
 },{height,offset});await page.waitForTimeout(110);}
 async function clearKeyboard(){await page.evaluate(()=>{delete visualViewport.height;delete visualViewport.offsetTop;visualViewport.dispatchEvent(new Event('resize'));});await page.waitForTimeout(100);}
 async function visibleField(label,height,offset){const box=await page.locator('#codigoInput').boundingBox();assert(box&&box.y>=offset&&box.y+box.height<=height+offset,label+' '+JSON.stringify(box));assert.equal(await page.locator('.nav').isVisible(),false);assert.equal(await page.locator('#codigoInput').evaluate(el=>getComputedStyle(el).fontSize),'16px');}
 // Teclado en vertical/horizontal, con y sin la escala solicitada por el usuario.
 for(const [width,height,keyboardHeight,offset]of [[390,700,300,0],[390,700,280,65],[844,390,150,0],[844,390,150,55]]){
  await clearKeyboard();await page.setViewportSize({width,height});await page.waitForTimeout(120);
  for(const fit of [false,true]){
   await page.evaluate(()=>go('codigo'));await page.waitForTimeout(100);
   const isFit=await page.locator('body').evaluate(el=>el.classList.contains('console-fit'));
   if(isFit!==fit)await page.getByRole('button',{name:'Ajustar',exact:true}).click();
   const before=await state();await page.locator('#codigoInput').tap();await keyboard(keyboardHeight,offset);
   await page.keyboard.type('CAP-PRUEBA-123');await visibleField('keyboard '+width+' '+fit,keyboardHeight,offset);
   assert.equal(await page.locator('#codigoInput').inputValue(),'CAP-PRUEBA-123');assert.equal(await state(),before);
   assert.equal(await page.locator('.app').evaluate(el=>getComputedStyle(el).transform),'none');
   await page.screenshot({path:OUT+'/input-'+width+'-'+fit+'-'+offset+'.png'});
   await page.getByRole('button',{name:'Terminar de escribir',exact:true}).tap();await clearKeyboard();
   assert.equal(await page.locator('.nav').isVisible(),true);assert.equal(await page.locator('#codigoInput').inputValue(),'CAP-PRUEBA-123');
   assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('console-fit')),fit);
   cases.push({width,height,keyboardHeight,offset,fit});
  }
 }
 // Girar y cambiar el alto del teclado conserva foco, contenido y campo visible.
 await page.evaluate(()=>go('codigo'));await page.setViewportSize({width:390,height:700});await page.waitForTimeout(100);await page.locator('#codigoInput').tap();await keyboard(290,30);await page.keyboard.type('CAP-GIRO');
 await page.setViewportSize({width:844,height:390});await keyboard(145,45);await visibleField('rotate',145,45);assert.equal(await page.locator('#codigoInput').inputValue(),'CAP-GIRO');
 await page.keyboard.type('-OK');assert.equal(await page.locator('#codigoInput').inputValue(),'CAP-GIRO-OK');
 await page.getByRole('button',{name:'Terminar de escribir',exact:true}).tap();await clearKeyboard();
 // Los filtros originales siguen editando la colección, sin tocar el progreso.
 await page.evaluate(()=>go('biodex'));await page.waitForTimeout(100);await page.locator('.console-filters summary').tap();const beforeFilter=await state();
 await page.locator('.filters input').tap();await keyboard(150,30);await page.keyboard.type('Nimbel');
 assert.equal(await page.locator('.bioforma').count(),1);assert.equal(await state(),beforeFilter);
 await page.getByRole('button',{name:'Terminar de escribir',exact:true}).tap();await clearKeyboard();
 // Las tarjetas quedan acotadas por la altura del panel también al reducirlo.
 await page.locator('.console-filters summary').tap();
 for(const width of [390,844]){await page.setViewportSize({width,height:width===390?700:320});await page.waitForTimeout(120);
  for(const fit of [false,true]){const current=await page.locator('body').evaluate(el=>el.classList.contains('console-fit'));if(current!==fit)await page.getByRole('button',{name:'Ajustar',exact:true}).tap();
   for(const n of [1,2,3]){await page.getByRole('button',{name:n+' bioforma'+(n>1?'s':'')+' por fila',exact:true}).tap();await page.waitForTimeout(80);
    const data=await page.locator('#bioformaGrid .bio-svg-wrap').first().evaluate(el=>({height:el.clientHeight,panel:document.getElementById('view').clientHeight,width:el.clientWidth}));assert(data.height<=Math.max(72,data.panel*.5)+1,'image proportion '+JSON.stringify({width,fit,n,...data}));
    await page.screenshot({path:OUT+'/cards-'+width+'-'+fit+'-'+n+'.png'});
   }
  }
 }
 // Tras escribir, enviar el formulario conserva el manejador original y el código.
 await clearKeyboard();await page.setViewportSize({width:844,height:390});await page.evaluate(()=>go('codigo'));await page.waitForTimeout(100);await page.locator('#codigoInput').tap();await keyboard(150);
 await page.keyboard.type('CAP-ENVIO');
 await page.evaluate(()=>{window.__submitted=null;validarCodigo=()=>{window.__submitted=document.getElementById('codigoInput').value;};});
 await page.locator('.capture-terminal button[type=submit]').tap();assert.equal(await page.evaluate(()=>window.__submitted),'CAP-ENVIO');
 await clearKeyboard();await page.waitForTimeout(220);assert.equal(await page.locator('.nav').isVisible(),true);
 // Recorrido real del frontend de producción con respuestas remotas simuladas.
 const production=await context.newPage(),mockRequests=[];
 production.on('pageerror',error=>errors.push(error.message));
 const fixture={jugador:'Prueba de teclado',capturadas:[],codigosUsados:[],logros:[],configuracion:{crt:false,avatarId:'aurora',landscapeId:'bosque'},gimnasios:{abiertos:{}},sectores:{abiertos:{}},bienvenidaVista:true};
 await production.route('https://script.google.com/**',async route=>{
  const body=route.request().postDataJSON();mockRequests.push(body);let extra={};
  if(body.action==='redeem'){await new Promise(resolve=>setTimeout(resolve,450));fixture.capturadas.push('B003');extra={kind:'capture',bioforma:'B003',duplicate:false};}
  await route.fulfill({json:{ok:true,token:'teclado-fixture',features:{captureMode:'code-only',megaPrizes:3},progreso:fixture,...extra}});
 });
 await production.setViewportSize({width:844,height:390});await production.goto('http://127.0.0.1:'+server.address().port+'/');await production.locator('#regNombre').waitFor();
 await production.locator('#regNombre').fill('Prueba de teclado');assert.equal(await production.locator('.console-edit-bar').isVisible(),false);await production.locator('#regClave').fill('123456');await production.locator('.access-submit').tap();await production.locator('.field-device').waitFor();
 await production.evaluate(()=>go('codigo'));await production.waitForTimeout(100);await production.locator('#codigoInput').tap();
 await production.evaluate(()=>{Object.defineProperty(visualViewport,'height',{configurable:true,get:()=>150});visualViewport.dispatchEvent(new Event('resize'));});await production.waitForTimeout(100);await production.keyboard.type('CAP-EMULADA');
 await production.locator('.capture-terminal button[type=submit]').tap();assert.equal(mockRequests.at(-1).code,'CAP-EMULADA');assert.equal(await production.evaluate(()=>progreso.capturadas.length),0);
 await production.evaluate(()=>{delete visualViewport.height;visualViewport.dispatchEvent(new Event('resize'));});await production.locator('#captureOverlay:visible').waitFor();assert.equal(await production.evaluate(()=>progreso.capturadas.includes('B003')),true);
 assert.deepEqual(mockRequests.map(r=>r.action),['login','redeem']);await production.close();
 assert.deepEqual(errors,[]);assert.equal(requests.length,0);
 fs.writeFileSync(OUT+'/results.json',JSON.stringify({keyboardCases:cases,rotatedWhileTyping:true,filterWorks:true,submissionWorks:true,productionCaptureAfterMockConfirmation:true,errors,remoteRequests:requests},null,2));
 console.log('PASS',cases.length,'keyboard cases; rotation, filter, submission, production capture and 12 density/scale combinations');
 await browser.close();server.close();
})().catch(error=>{console.error(error);process.exit(1);});
