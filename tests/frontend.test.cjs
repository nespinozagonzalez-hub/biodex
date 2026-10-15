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
 function element(id){if(elements.has(id))return elements.get(id);const e={id,innerHTML:'',textContent:'',value:'',style:{},classList:classes(),children:[],appendChild(x){this.children.push(x);},remove(){},setAttribute(){},removeAttribute(){},querySelector(){return null;},querySelectorAll(){return [];},focus(){},isConnected:true};elements.set(id,e);return e;}
 const document={getElementById:element,createElement:()=>element('created-'+Math.random()),querySelectorAll:()=>[],querySelector:()=>null,addEventListener(){},activeElement:null,body:element('body'),head:element('head')};
 const storage=map=>({getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)});
 const c={console,document,window:{BIODEX_CONFIG:{endpoint:'https://script.google.com/macros/s/TEST/exec',version:'2.0'},addEventListener(){}},localStorage:storage(local),sessionStorage:storage(session),setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},AbortController,URL,Blob,confirm:()=>true,navigator:{},btoa:v=>Buffer.from(v,'binary').toString('base64'),atob:v=>Buffer.from(v,'base64').toString('binary'),fetch:async()=>({ok:true,json:async()=>({ok:true,progreso:JSON.parse(vm.runInContext('JSON.stringify(progreso)',c))})})};
 vm.createContext(c);const html=fs.readFileSync(path.join(root,'index.html'),'utf8');for(const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g))vm.runInContext(m[1],c);vm.runInContext(fs.readFileSync(path.join(root,'remaster.js'),'utf8'),c);
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
