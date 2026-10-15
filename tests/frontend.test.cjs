const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
test('el remaster visual se carga después de todos los estilos heredados',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const marker='href="remaster.css"';
 assert.equal(html.split(marker).length-1,1);
 assert.ok(html.indexOf(marker)>html.lastIndexOf('</style>'),'Los estilos antiguos no deben sobrescribir el remaster');
 assert.ok(html.indexOf('src="config.js"')<html.indexOf('src="remaster.js"'));
});
function frontend(){
 const elements=new Map(),local=new Map(),session=new Map();
 const classes=()=>{const s=new Set();return {add:x=>s.add(x),remove:x=>s.delete(x),contains:x=>s.has(x),toggle:(x,on)=>on?s.add(x):s.delete(x)};};
 function element(id){if(elements.has(id))return elements.get(id);const e={id,innerHTML:'',textContent:'',value:'',style:{setProperty(k,v){this[k]=v;}},classList:classes(),children:[],appendChild(x){this.children.push(x);},remove(){},setAttribute(){},removeAttribute(){},querySelector(){return null;},querySelectorAll(){return [];},focus(){},isConnected:true};elements.set(id,e);return e;}
 const document={getElementById:element,createElement:()=>element('created-'+Math.random()),querySelectorAll:()=>[],querySelector:()=>null,addEventListener(){},activeElement:null,body:element('body'),head:element('head')};
 const storage=map=>({getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)});
 const c={console,document,window:{BIODEX_CONFIG:{endpoint:'https://script.google.com/macros/s/TEST/exec',version:'2.0'},addEventListener(){}},localStorage:storage(local),sessionStorage:storage(session),setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},AbortController,URL,Blob,confirm:()=>true,navigator:{},btoa:v=>Buffer.from(v,'binary').toString('base64'),atob:v=>Buffer.from(v,'base64').toString('binary'),fetch:async()=>({ok:true,json:async()=>({ok:true,progreso:JSON.parse(vm.runInContext('JSON.stringify(progreso)',c))})})};
 vm.createContext(c);const html=fs.readFileSync(path.join(root,'index.html'),'utf8');for(const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g))vm.runInContext(m[1],c);for(const file of ['remaster.js','retro.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),c);
 const evaluate=s=>vm.runInContext(s,c);return {c,evaluate,elements,element,local,session};
}
test('carga todos los scripts sin errores y genera las 10 pantallas',()=>{const f=frontend();f.evaluate('startPreview()');for(const view of ['panel','biodex','codigo','mapa','gimnasios','lineas','inventario','logros','respaldo','ayuda']){f.evaluate('go('+JSON.stringify(view)+')');assert.ok(f.element('view').innerHTML.length>100,view);}assert.equal((f.evaluate('renderBioformaCards()').match(/<article/g)||[]).length,30);});
test('captura de muestra conserva animación, no abre preguntas y bloquea etapas posteriores',()=>{const f=frontend();f.evaluate('startPreview();previewCapture()');assert.equal(f.element('captureOverlay').style.display,'flex');assert.ok(f.element('captureOverlay').children.some(x=>x.className==='cap-stage'));assert.equal(f.evaluate('progreso.capturadas[0]'),'B001');assert.equal(f.evaluate('canCaptureEvolution(BIOFORMAS[1])'),true);assert.equal(f.evaluate('canCaptureEvolution(BIOFORMAS[2])'),false);assert.ok(!f.element('modalContent').innerHTML.includes('metacog-card'));});
test('no se altera progreso local heredado; acceso exige seis dígitos',()=>{const f=frontend();f.local.set('biodex_bionova_alumno_v15','original');f.evaluate('startPreview();previewCapture()');assert.equal(f.local.get('biodex_bionova_alumno_v15'),'original');assert.ok(f.evaluate('renderRegistro()').includes('pattern="[0-9]{6}"'));});
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
test('vista previa sigue operativa sin almacenamiento y sin modificar el respaldo antiguo',()=>{
 const f=frontend();f.local.set('biodex_bionova_alumno_v15','intacto');
 f.c.sessionStorage.getItem=()=>{throw Error('Storage blocked');};
 f.c.sessionStorage.setItem=()=>{throw Error('Storage blocked');};
 assert.doesNotThrow(()=>f.evaluate('startPreview();previewCapture()'));
 assert.equal(f.element('captureOverlay').style.display,'flex');
 assert.equal(f.local.get('biodex_bionova_alumno_v15'),'intacto');
});
test('la capa FIELD-02 se carga al final, con cuatro avatares y cuatro paisajes',()=>{
 const f=frontend(),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 assert.ok(html.indexOf('href="retro.css"')>html.indexOf('href="remaster.css"'));
 assert.ok(html.indexOf('src="retro.js"')>html.indexOf('src="remaster.js"'));
 assert.equal(f.evaluate('AVATARS.length'),4);assert.equal(f.evaluate('LANDSCAPES.length'),4);
 const welcome=f.evaluate('renderRegistro()');assert.match(welcome,/Crear personaje/);assert.match(welcome,/data-avatar="terra"/);assert.match(welcome,/data-landscape="bruma"/);
 f.evaluate('startPreview();go("perfil")');assert.match(f.element('view').innerHTML,/PERSONALIZA TU EXPEDICIÓN/);assert.match(f.element('app').innerHTML,/explorer-sidebar/);
});
test('nombre, avatar, paisaje y colección persisten en una demo sin guardar el PIN',async()=>{
 const f=frontend();f.element('regNombre').value='Exploradora Ada';f.element('regClave').value='098765';
 f.evaluate('startPreview();previewCapture()');
 await f.evaluate('chooseProfile("avatarId","prisma","profile")');await f.evaluate('chooseProfile("landscapeId","bruma","profile")');
 const raw=f.local.get('biodex_field_preview_v3');assert.ok(!raw.includes('098765'));assert.ok(raw.includes('B001'));
 await f.evaluate('logout()');f.element('regNombre').value='';f.evaluate('startPreview()');
 assert.equal(f.evaluate('progreso.jugador'),'Exploradora Ada');assert.equal(f.evaluate('progreso.configuracion.avatarId'),'prisma');assert.equal(f.evaluate('progreso.configuracion.landscapeId'),'bruma');assert.equal(f.evaluate('progreso.capturadas.length'),1);
 assert.equal(f.local.get('biodex_field_profile_v3'),JSON.stringify({avatarId:'prisma',landscapeId:'bruma'}));
});
test('los 47 códigos de la demo mantienen orden, idempotencia y activaciones',()=>{
 const f=frontend(),codes=JSON.parse(fs.readFileSync(path.join(__dirname,'original-codes.json'),'utf8'));f.evaluate('startPreview()');
 assert.throws(()=>f.evaluate('redeemLocal("CAP-AURALIS-216")'),/Nimbel/);assert.equal(f.evaluate('progreso.codigosUsados.length'),0);
 for(const code of codes)assert.doesNotThrow(()=>f.evaluate('redeemLocal('+JSON.stringify(code)+')'),code);
 assert.equal(f.evaluate('progreso.capturadas.length'),30);assert.equal(f.evaluate('progreso.codigosUsados.length'),47);assert.equal(f.evaluate('progreso.intentos.length'),47);
 assert.equal(f.evaluate('Object.keys(progreso.sectores.abiertos).length'),7);assert.equal(f.evaluate('Object.keys(progreso.gimnasios.abiertos).length'),10);assert.equal(f.evaluate('progreso.logros.length'),12);
 assert.equal(f.evaluate('redeemLocal("cap nimbel 104").duplicate'),true);assert.equal(f.evaluate('redeemLocal("SEC-AURORA-001").duplicate'),true);assert.equal(f.evaluate('progreso.intentos.length'),47);
 assert.throws(()=>f.evaluate('redeemLocal("CAP-FALSO")'),/no reconocido/);
});
test('captura usa PNG transparente y la BioDex capturada mantiene ilustración completa',()=>{
 const f=frontend();f.evaluate('startPreview();previewCapture()');
 const stage=f.element('captureOverlay').children.find(c=>c.className==='cap-stage');assert.match(stage.innerHTML,/assets\/cutouts\/B001\.png/);assert.ok(!stage.innerHTML.includes('assets/bioformas'));
 assert.match(f.evaluate('bioformaCard(BIOFORMAS[0])'),/assets\/bioformas\/B001\.webp/);assert.match(f.evaluate('bioformaCard(BIOFORMAS[1])'),/assets\/cutouts\/B002\.png/);
 f.evaluate('renderFicha("B001")');assert.match(f.element('modalContent').innerHTML,/assets\/bioformas\/B001\.webp/);
});
test('si todo el almacenamiento está bloqueado, la demo avisa y sigue en memoria',()=>{
 const f=frontend();for(const storage of [f.c.localStorage,f.c.sessionStorage]){storage.getItem=()=>{throw Error('blocked');};storage.setItem=()=>{throw Error('blocked');};}
 assert.doesNotThrow(()=>f.evaluate('startPreview();previewCapture()'));assert.match(f.evaluate('cloudStatus'),/bloqueado/);assert.equal(f.evaluate('progreso.capturadas[0]'),'B001');
});
test('la personalización remota solo se acredita al confirmarla el servidor',async()=>{
 const f=frontend();f.evaluate('sesion={token:"test"};progreso=defaultProgress();progreso.jugador="Cuenta"');
 const requests=[];f.c.fetch=async(_url,options)=>{requests.push(JSON.parse(options.body));return {ok:true,json:async()=>({ok:true,progreso:{jugador:'Cuenta',capturadas:['B001'],logros:['L01'],intentos:[],sectores:{abiertos:{}},gimnasios:{abiertos:{}},codigosUsados:[],configuracion:{crt:true,avatarId:'terra',landscapeId:'arcana'}}})};};
 await f.evaluate('chooseProfile("avatarId","terra","profile")');assert.equal(requests[0].action,'settings');assert.equal(requests[0].avatarId,'terra');assert.equal(f.evaluate('progreso.configuracion.avatarId'),'terra');assert.equal(f.evaluate('progreso.configuracion.crt'),true);
 f.c.fetch=async()=>{throw Error('Sin red');};await f.evaluate('chooseProfile("avatarId","nexo","profile")');assert.equal(f.evaluate('progreso.configuracion.avatarId'),'terra');
});
