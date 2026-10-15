const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
test('el remaster visual se carga después de todos los estilos heredados',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const marker='href="remaster.css';
 assert.equal(html.split(marker).length-1,1);
 assert.ok(html.indexOf(marker)>html.lastIndexOf('</style>'),'Los estilos antiguos no deben sobrescribir el remaster');
 assert.ok(html.indexOf('src="config.js?')<html.indexOf('src="remaster.js?'));
 for(const file of ['config.js','remaster.js','retro.js','remaster.css','retro.css'])assert.ok(html.includes(file+'?v=2.3.1'),'El runtime necesita versión anticaché: '+file);
});
const {frontend,account}=require('./frontend-harness.cjs');
test('fallo de red no acredita captura ni dispara animación',async()=>{const f=frontend();f.evaluate('sesion={token:"test"};progreso=defaultProgress();progreso.jugador="Prueba"');f.element('codigoInput').value='CAP-NIMBEL-104';f.c.fetch=async()=>{throw vm.runInContext('new TypeError("network")',f.c);};await f.evaluate('validarCodigo()');assert.equal(f.evaluate('progreso.capturadas.length'),0);assert.notEqual(f.element('captureOverlay').style.display,'flex');assert.match(f.element('toast').textContent,/conexión/);});

test('captura remota aplica respuesta antes de animar, sin cuestionario',async()=>{const f=frontend();f.evaluate('sesion={token:"test"};progreso=defaultProgress();progreso.jugador="Prueba"');f.element('codigoInput').value='CAP-NIMBEL-104';f.c.fetch=async()=>({ok:true,json:async()=>({ok:true,kind:'capture',bioforma:'B001',progreso:{jugador:'Prueba',capturadas:['B001'],logros:['L01'],intentos:[],sectores:{abiertos:{}},gimnasios:{abiertos:{}},codigosUsados:[],configuracion:{crt:false},ultimaBioforma:'B001'}})});await f.evaluate('validarCodigo()');assert.equal(f.evaluate('progreso.capturadas[0]'),'B001');assert.equal(f.element('captureOverlay').style.display,'flex');assert.equal(f.evaluate('cloudStatus'),'Guardado en BioNova');});

test('bloqueo de almacenamiento del navegador no impide mostrar una captura guardada',async()=>{
 const f=frontend();f.evaluate('sesion={token:"test"};progreso=defaultProgress();progreso.jugador="Prueba"');
 f.c.sessionStorage.setItem=()=>{throw Error('Storage blocked');};
 f.element('codigoInput').value='CAP-NIMBEL-104';
 f.c.fetch=async()=>({ok:true,json:async()=>({ok:true,kind:'capture',bioforma:'B001',progreso:{jugador:'Prueba',capturadas:['B001'],logros:['L01'],intentos:[],sectores:{abiertos:{}},gimnasios:{abiertos:{}},codigosUsados:[],configuracion:{crt:false},ultimaBioforma:'B001'}})});
 await f.evaluate('validarCodigo()');assert.equal(f.element('captureOverlay').style.display,'flex');
 assert.match(f.evaluate('cloudStatus'),/Guardado/);assert.match(f.evaluate('cloudStatus'),/recargar/);
});

test('la personalización remota solo se acredita al confirmarla el servidor',async()=>{
 const f=frontend();f.evaluate('sesion={token:"test"};progreso=defaultProgress();progreso.jugador="Cuenta"');
 const requests=[];f.c.fetch=async(_url,options)=>{requests.push(JSON.parse(options.body));return {ok:true,json:async()=>({ok:true,progreso:{jugador:'Cuenta',capturadas:['B001'],logros:['L01'],intentos:[],sectores:{abiertos:{}},gimnasios:{abiertos:{}},codigosUsados:[],configuracion:{crt:true,avatarId:'terra',landscapeId:'arcana'}}})};};
 await f.evaluate('chooseProfile("avatarId","terra","profile")');assert.equal(requests[0].action,'settings');assert.equal(requests[0].avatarId,'terra');assert.equal(f.evaluate('progreso.configuracion.avatarId'),'terra');assert.equal(f.evaluate('progreso.configuracion.crt'),true);
 f.c.fetch=async()=>{throw Error('Sin red');};await f.evaluate('chooseProfile("avatarId","nexo","profile")');assert.equal(f.evaluate('progreso.configuracion.avatarId'),'terra');
});


test('el acceso muestra la ventana de espera y recupera el progreso sin guardar la clave',async()=>{
 const f=frontend();f.element('regNombre').value='Exploradora Remota';f.element('regClave').value='001234';
 let finish;f.c.fetch=()=>new Promise(resolve=>finish=resolve);
 const request=f.evaluate('registrarJugador()');
 assert.equal(f.element('cloudLoading').open,true);assert.match(f.element('cloudLoadingTitle').textContent,/Recuperando/);
 assert.equal(f.element('regClave').value,'');assert.equal(f.evaluate('busy'),true);
 finish({ok:true,json:async()=>({ok:true,token:'synthetic-test-token',progreso:{jugador:'Exploradora Remota',capturadas:['B001'],logros:['L01'],intentos:[],sectores:{abiertos:{}},gimnasios:{abiertos:{}},codigosUsados:[],configuracion:{crt:false,avatarId:'terra',landscapeId:'bruma'}}})});
 await request;assert.equal(f.element('cloudLoading').open,false);assert.equal(f.evaluate('busy'),false);
 assert.equal(f.evaluate('progreso.jugador'),'Exploradora Remota');assert.equal(f.evaluate('progreso.capturadas[0]'),'B001');assert.equal(f.evaluate('progreso.configuracion.avatarId'),'terra');
 assert.ok(!JSON.stringify([...f.session,...f.local]).includes('001234'));
});

test('clave incorrecta cierra la espera y permite volver a ingresar',async()=>{
 const f=frontend();f.evaluate('progreso=defaultProgress()');f.element('regNombre').value='Cuenta';f.element('regClave').value='001234';
 f.c.fetch=async()=>({ok:true,json:async()=>({ok:false,error:'Nombre o clave incorrectos.'})});
 await f.evaluate('registrarJugador()');assert.equal(f.element('cloudLoading').open,false);assert.equal(f.evaluate('busy'),false);
 assert.match(f.element('authError').textContent,/incorrectos/);assert.equal(f.evaluate('sesion'),null);assert.equal(f.evaluate('progreso.capturadas.length'),0);
});

test('la recuperación al recargar muestra la espera y descarta una sesión vencida',async()=>{
 const f=frontend();f.session.set('biodex_session_v2',JSON.stringify({token:'expired'}));
 let finish;f.c.fetch=()=>new Promise(resolve=>finish=resolve);const request=f.evaluate('init()');
 assert.equal(f.element('cloudLoading').open,true);
 finish({ok:true,json:async()=>({ok:false,error:'Sesión vencida. Ingresa nuevamente.'})});await request;
 assert.equal(f.element('cloudLoading').open,false);assert.equal(f.evaluate('sesion'),null);assert.equal(f.session.has('biodex_session_v2'),false);assert.match(f.element('app').innerHTML,/regClave/);
});

test('todas las pantallas definitivas se renderizan con una cuenta',()=>{
 const f=account(frontend());for(const view of ['panel','biodex','codigo','mapa','gimnasios','lineas','inventario','logros','ayuda','perfil']){f.evaluate('go('+JSON.stringify(view)+')');assert.ok(f.element('view').innerHTML.length>100,view);}
 assert.equal((f.evaluate('renderBioformaCards()').match(/<article/g)||[]).length,30);
});
test('sin cuenta y con sesión antigua de demo se muestra solo el ingreso',async()=>{
 const f=frontend();f.local.set('biodex_field_preview_v3',JSON.stringify({jugador:'Demo',capturadas:['B030']}));f.session.set('biodex_session_v2',JSON.stringify({preview:true}));
 await f.evaluate('init()');assert.equal(f.evaluate('sesion'),null);assert.match(f.element('app').innerHTML,/regClave/);
 for(const view of ['codigo','gimnasios','perfil']){f.evaluate('go('+JSON.stringify(view)+')');assert.match(f.element('app').innerHTML,/regClave/);}
 assert.equal(f.local.get('biodex_field_preview_v3'),JSON.stringify({jugador:'Demo',capturadas:['B030']}));
});
test('no hay rutas de captura local ni controles de prueba o respaldo en el producto',()=>{
 const f=account(frontend());
 assert.equal(f.evaluate('typeof startPreview'),'undefined');assert.equal(f.evaluate('typeof previewCapture'),'undefined');assert.equal(f.evaluate('typeof redeemLocal'),'undefined');
 assert.doesNotMatch(f.evaluate('renderRegistro()+renderShell()+renderCodigo()+renderProfile()+renderInventario()'),/Probar|vista previa|preview-start|DEMO|Generar respaldo|exportBox|importBox|Solicitar revisión|Registro local/);
 f.evaluate('go("respaldo")');assert.equal(f.evaluate('view'),'perfil');assert.match(f.element('view').innerHTML,/PERSONALIZA TU EXPEDICIÓN/);
});
test('el escáner permanece genérico antes y después de capturar',()=>{
 const f=account(frontend());for(const id of [null,'B001','B030']){f.evaluate('progreso.ultimaBioforma='+JSON.stringify(id));const html=f.evaluate('renderCodigo()');assert.match(html,/Señal de bioforma desconocida/);assert.doesNotMatch(html,/cutouts|bioformas\/|Nimbel|B001/);}
});
test('captura animada mantiene PNG y las fichas conservan la ilustración completa',()=>{
 const f=account(frontend());f.evaluate('progreso.capturadas=["B001"];secuenciaCaptura(BIOFORMAS[0])');
 const stage=f.element('captureOverlay').children.find(c=>c.className==='cap-stage');assert.match(stage.innerHTML,/assets\/cutouts\/B001\.png/);assert.ok(!stage.innerHTML.includes('assets/bioformas'));
 assert.match(f.evaluate('bioformaCard(BIOFORMAS[0])'),/assets\/bioformas\/B001\.webp/);f.evaluate('renderFicha("B001")');assert.match(f.element('modalContent').innerHTML,/assets\/bioformas\/B001\.webp/);
});
test('gimnasios muestran diez rutas, estados, filtros y solo abren detalles activados',()=>{
 const f=account(frontend());assert.equal((f.evaluate('renderGimnasiosBioNova()').match(/data-gym=/g)||[]).length,10);
 f.evaluate('go("gimnasios");changeGymFilter("completado")');assert.match(f.element('view').innerHTML,/Una nueva ruta/);
 f.evaluate('progreso.gimnasios.abiertos.GYM01={abierto:true};progreso.capturadas=["B001","B002","B003"];changeGymFilter("completado")');assert.match(f.element('view').innerHTML,/data-gym="GYM01"/);assert.equal((f.element('view').innerHTML.match(/data-gym=/g)||[]).length,1);
 f.evaluate('verDetalleGym("GYM02")');assert.equal(f.element('modalContent').innerHTML,'');
 f.evaluate('verDetalleGym("GYM01")');assert.match(f.element('modalContent').innerHTML,/gym-detail/);
});
test('medallas respetan los logros guardados, muestran progreso y no acreditan logros al dibujar',()=>{
 const f=account(frontend());assert.equal((f.evaluate('renderLogros()').match(/data-achievement=/g)||[]).length,12);
 f.evaluate('progreso.capturadas=["B001","B002","B003"]');assert.equal(f.evaluate('achievementProgress(8).value'),3);assert.equal(f.evaluate('achievementProgress(1).value'),3);
 const html=f.evaluate('renderLogros()');assert.equal(f.evaluate('progreso.logros.length'),0);assert.equal((html.match(/honor-card pending/g)||[]).length,12);
 f.evaluate('progreso.logros=["L01","L08","L09"]');assert.equal((f.evaluate('renderLogros()').match(/honor-card earned/g)||[]).length,3);
});
test('la bienvenida conserva cuatro avatares y paisajes, y no expone la clave en almacenamiento',()=>{
 const f=frontend();assert.equal(f.evaluate('AVATARS.length'),4);assert.equal(f.evaluate('LANDSCAPES.length'),4);
 assert.ok(f.evaluate('renderRegistro()').includes('pattern="[0-9]{6}"'));assert.ok(f.evaluate('renderRegistro()').includes('</form>'));f.evaluate('accessMode="register"');assert.match(f.evaluate('renderRegistro()'),/data-avatar="terra"/);
 f.element('regClave').value='012345';f.evaluate('chooseProfile("avatarId","prisma","welcome")');assert.ok(!JSON.stringify([...f.local]).includes('012345'));
});
