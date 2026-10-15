const {chromium}=require('playwright');
const assert=require('node:assert/strict');
async function run(){
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const errors=[];
 for(const viewport of [{width:1440,height:1050},{width:390,height:844},{width:320,height:740}]){
  const page=await browser.newPage({viewport});page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8000/');await page.getByRole('button',{name:'Explorar vista previa',exact:true}).waitFor();
  assert.equal(await page.locator('.access-submit').isDisabled(),true);
  assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()),'#092d2c','La paleta FIELD-02 debe prevalecer sobre los estilos antiguos');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.getByRole('button',{name:'Explorar vista previa',exact:true}).click();
  for(const target of ['biodex','mapa','gimnasios','lineas','inventario','logros','respaldo','ayuda','perfil','codigo']){
   await page.evaluate(v=>go(v),target);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'horizontal overflow '+target+' '+viewport.width);
  }
  await page.getByRole('button',{name:'Probar animación con Nimbel'}).click();
  await page.locator('#captureOverlay').waitFor({state:'visible'});
  assert.equal(await page.locator('.metacog-card').count(),0);
  assert.equal(await page.locator('.cap-name').innerText(),'Nimbel');
  await page.waitForTimeout(2850);await page.locator('#captureOverlay button').click();
  await page.locator('#modalBack').waitFor({state:'visible'});await page.keyboard.press('Escape');await page.evaluate(()=>go('biodex'));
  assert.equal(await page.locator('.bioforma').count(),30);
  assert.equal(await page.evaluate(()=>canCaptureEvolution(BIOFORMAS[1])),true);
  assert.equal(await page.evaluate(()=>canCaptureEvolution(BIOFORMAS[2])),false);
  await page.evaluate(()=>go('panel'));await page.waitForTimeout(400);
  const output=require('node:path').join(require('node:os').tmpdir(),'biodex-'+viewport.width+'.png');
  await page.screenshot({path:output,fullPage:true});await page.close();
 }
 assert.deepEqual(errors,[]);
 const page=await browser.newPage({viewport:{width:390,height:844}});page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/config.js',route=>route.fulfill({contentType:'text/javascript',body:'window.BIODEX_CONFIG={endpoint:"https://script.google.com/macros/s/TEST/exec",version:"2.0.0"}'}));
 let saved={jugador:'Cuenta Prueba',capturadas:[],codigosUsados:[],intentos:[],logros:[],sectores:{abiertos:{}},gimnasios:{abiertos:{}},configuracion:{crt:false}},fail=false;
 await page.route('https://script.google.com/**',async route=>{
  const data=route.request().postDataJSON();if(fail){await route.abort();return;}
  let r={ok:true,progreso:saved};if(['login','register'].includes(data.action))r.token='token-test';
  if(data.action==='redeem'){
   if(data.code==='CAP-AURALIS-216'&&!saved.capturadas.includes('B001'))r={ok:false,error:'Primero necesitas capturar a Nimbel.'};
   else{saved={...saved,capturadas:['B001'],ultimaBioforma:'B001',logros:['L01']};r={ok:true,progreso:saved,kind:'capture',bioforma:'B001'};}
  }
  await route.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(r)});
 });
 await page.goto('http://127.0.0.1:8000/');await page.locator('#regNombre').waitFor();await page.locator('#regNombre').fill('Cuenta Prueba');await page.locator('#regClave').fill('000123');await page.locator('.access-submit').click();await page.locator('#view').waitFor();
 await page.evaluate(()=>go('codigo'));await page.locator('#codigoInput').fill('CAP-AURALIS-216');await page.locator('button[type="submit"]').click();await page.waitForTimeout(150);
 assert.equal(await page.locator('#captureOverlay').isVisible(),false);assert.match(await page.locator('#toast').innerText(),/Nimbel/);
 fail=true;await page.locator('#codigoInput').fill('CAP-NIMBEL-104');await page.locator('button[type="submit"]').click();await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>progreso.capturadas.length),0);assert.equal(await page.locator('#captureOverlay').isVisible(),false);
 fail=false;await page.locator('button[type="submit"]').click();await page.locator('#captureOverlay').waitFor({state:'visible'});assert.equal(await page.evaluate(()=>progreso.capturadas.length),1);assert.match(await page.locator('#cloudStatus').innerText(),/Guardado/);
 assert.equal(await page.evaluate(()=>JSON.stringify(sessionStorage).includes('000123')),false);assert.deepEqual(errors,[]);
 await browser.close();console.log('UI OK: 3 tamaños, 10 pantallas, captura animada, bloqueo evolutivo, fallo de red y confirmación de guardado.');
}
run().catch(e=>{console.error(e);process.exit(1);});
