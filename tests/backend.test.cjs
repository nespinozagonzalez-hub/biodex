const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const path=require('node:path');
const root=path.join(__dirname,'..');

function backend(){
  const sheets=new Map(),properties=new Map(),cache=new Map();let locked=false;
  class Sheet{
    constructor(){this.data=[];}
    getLastRow(){return this.data.length;}
    appendRow(row){this.data.push([...row]);return this;}
    setFrozenRows(){return this;}
    deleteRow(row){this.data.splice(row-1,1);}
    getRange(r,c,n=1,m=1){const self=this;return {
      getValues:()=>Array.from({length:n},(_,i)=>Array.from({length:m},(_,j)=>self.data[r+i-1]?.[c+j-1]??'')),
      setValues(values){values.forEach((row,i)=>row.forEach((value,j)=>{self.data[r+i-1]??=[];self.data[r+i-1][c+j-1]=value;}));return this;},
      setValue(value){return this.setValues([[value]]);},
      setBackground(){return this;},setFontColor(){return this;},setFontWeight(){return this;}
    };}
  }
  const ss={getId:()=> 'sheet-test',getSheetByName:name=>sheets.get(name),insertSheet:name=>{const s=new Sheet();sheets.set(name,s);return s;}};
  const props={getProperty:key=>properties.get(key)||null,setProperty:(key,value)=>{properties.set(key,value);}};
  const lock={tryLock(){if(locked)return false;locked=true;return true;},waitLock(){if(locked)throw Error('Locked');locked=true;},hasLock:()=>locked,releaseLock(){locked=false;}};
  const context={console,SpreadsheetApp:{getActiveSpreadsheet:()=>ss,openById:()=>ss},PropertiesService:{getScriptProperties:()=>props},CacheService:{getScriptCache:()=>({get:key=>cache.get(key),put:(key,value)=>cache.set(key,value),remove:key=>cache.delete(key)})},LockService:{getScriptLock:()=>lock},Utilities:{getUuid:()=>crypto.randomUUID(),DigestAlgorithm:{SHA_256:'sha256'},Charset:{UTF_8:'utf8'},computeDigest:(_,text)=>[...crypto.createHash('sha256').update(text).digest()],computeHmacSha256Signature:(text,key)=>[...crypto.createHmac('sha256',key).update(text).digest()]},ContentService:{MimeType:{JSON:'json'},createTextOutput:text=>({text,setMimeType(){return this;}})}};
  vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,'backend/Code.gs'),'utf8'),context);
  context.instalarBioDex();
  const call=data=>JSON.parse(context.doPost({postData:{contents:JSON.stringify(data)}}).text);
  const register=(name='Prueba Uno',pin='000123')=>call({action:'register',name,pin});
  return {call,register,context,sheets,properties,cache};
}
test('instalación idempotente, sin borrado de datos',()=>{const b=backend();b.register();const before=JSON.stringify(b.sheets.get('Usuarios').data);b.context.instalarBioDex();assert.equal(JSON.stringify(b.sheets.get('Usuarios').data),before);});
test('nombre + PIN con ceros iniciales; HMAC y sesión sin PIN legible',()=>{const b=backend(),r=b.register();assert.equal(r.ok,true);assert.equal(r.progreso.jugador,'Prueba Uno');assert.equal(r.token.length,72);const row=b.sheets.get('Usuarios').data[1];assert.notEqual(row[3],'000123');assert.equal(row[3].length,64);assert.ok(!JSON.stringify(row).includes('000123'));assert.equal(b.call({action:'login',name:' prueba   uno ',pin:'000123'}).ok,true);assert.equal(b.call({action:'register',name:'Prueba Uno',pin:'123456'}).ok,false);});
test('rechaza PIN inválido e inyección de fórmulas',()=>{const b=backend();for(const pin of ['12345','1234567','12a456','123 45'])assert.equal(b.register('Otra Cuenta',pin).ok,false);assert.equal(b.register('=IMPORTXML("x")').ok,false);});
test('captura libre sin etapas ni gimnasio, con códigos originales e idempotencia',()=>{const b=backend(),a=b.register(),token=a.token;assert.equal(a.features.captureMode,'code-only');for(const code of ['CAP-PRISMARA-337','cap auralis 216','CAP-NIMBEL-104'])assert.equal(b.call({action:'redeem',token,code}).ok,true);const r=b.call({action:'redeem',token,code:'CAP-NIMBEL-104'});assert.equal(r.duplicate,true);assert.deepEqual(r.progreso.capturadas,['B003','B002','B001']);assert.deepEqual(r.progreso.gimnasios.abiertos,{});assert.ok(r.progreso.logros.includes('L09'));assert.equal(r.progreso.intentos.length,3);});
test('guarda SEC, GYM, preferencias y recupera desde otra sesión',()=>{const b=backend(),a=b.register(),token=a.token;assert.equal(b.call({action:'redeem',token,code:'SEC-AURORA-001'}).kind,'sector');assert.equal(b.call({action:'redeem',token,code:'GYM-AURORA-001'}).kind,'gimnasio');assert.equal(b.call({action:'settings',token,crt:true}).ok,true);const other=b.call({action:'login',name:'Prueba Uno',pin:'000123'});assert.ok(other.progreso.sectores.abiertos.S01);assert.ok(other.progreso.gimnasios.abiertos.GYM01);assert.equal(other.progreso.configuracion.crt,true);assert.equal(b.call({action:'redeem',token,code:'SEC-AURORA-001'}).duplicate,true);});
test('cuentas aisladas, rechazo de snapshots y logout revoca token',()=>{const b=backend(),a=b.register(),c=b.register('Otra Cuenta');b.call({action:'redeem',token:a.token,code:'CAP-NIMBEL-104'});assert.equal(b.call({action:'load',token:c.token}).progreso.capturadas.length,0);assert.equal(b.call({action:'save',token:c.token,progreso:{capturadas:['B030']}}).ok,false);assert.equal(b.call({action:'load',token:'falso'}).ok,false);assert.equal(b.call({action:'logout',token:a.token}).ok,true);assert.equal(b.call({action:'load',token:a.token}).ok,false);});
test('cinco fallos bloquean; recuperación docente conserva colección y revoca sesiones',()=>{const b=backend(),a=b.register();b.call({action:'redeem',token:a.token,code:'CAP-NIMBEL-104'});for(let i=0;i<5;i++)assert.equal(b.call({action:'login',name:'Prueba Uno',pin:'111111'}).ok,false);assert.equal(b.call({action:'login',name:'Prueba Uno',pin:'000123'}).ok,false);b.context.restablecerClaveDocente('Prueba Uno','000456');assert.equal(b.call({action:'load',token:a.token}).ok,false);const r=b.call({action:'login',name:'Prueba Uno',pin:'000456'});assert.equal(r.ok,true);assert.deepEqual(r.progreso.capturadas,['B001']);});
test('migración docente acepta cualquier etapa y nunca concede premios mega',()=>{const b=backend(),a=b.register();assert.equal(b.call({action:'migration',token:a.token,legacy:{jugador:'Antes',capturadas:['B001','B002','B003','B030','B031','B032','B033'],sectores:{abiertos:{S01:{abierto:true}}}}}).ok,true);assert.equal(b.call({action:'load',token:a.token}).progreso.capturadas.length,0);b.context.aprobarMigracionDocente(2);const p=b.call({action:'load',token:a.token}).progreso;assert.deepEqual(p.capturadas,['B001','B002','B003','B030']);assert.ok(p.sectores.abiertos.S01);assert.equal(b.sheets.get('Migraciones').data[1][2],'APROBADA');assert.ok(!b.sheets.get('Migraciones').data[1][3].includes('B031'));});
test('los 47 códigos originales se mantienen en el backend',()=>{const b=backend(),original=JSON.parse(fs.readFileSync(path.join(__dirname,'original-codes.json'),'utf8'));const actual=JSON.parse(vm.runInContext('JSON.stringify([...CATALOGO_BIODEX,...SECTORES_BIODEX,...GIMNASIOS_BIODEX].map(b=>b.codigo))',b.context));assert.equal(actual.length,47);assert.deepEqual(actual.sort(),original.sort());});
test('las 30 bioformas se capturan en orden inverso y conservan los 12 logros',()=>{const b=backend(),a=b.register();const cat=JSON.parse(vm.runInContext('JSON.stringify(CATALOGO_BIODEX)',b.context));for(const entry of cat.reverse())assert.equal(b.call({action:'redeem',token:a.token,code:entry.codigo}).ok,true,entry.id);const p=b.call({action:'load',token:a.token}).progreso;assert.equal(p.capturadas.length,30);assert.equal(p.logros.length,12);});
test('sesiones vencidas no recuperan datos y cerrar registro no bloquea cuentas existentes',()=>{const b=backend(),a=b.register();b.properties.set('REGISTRO_ABIERTO','false');assert.equal(b.register('Nueva Cuenta').ok,false);assert.equal(b.call({action:'login',name:'Prueba Uno',pin:'000123'}).ok,true);b.sheets.get('Sesiones').data[1][2]=Date.now()-1;assert.equal(b.call({action:'load',token:a.token}).ok,false);});
test('cada activación y preferencia sobrevive al reingreso sin perder las anteriores',()=>{const b=backend(),a=b.register();const codes=JSON.parse(fs.readFileSync(path.join(__dirname,'original-codes.json'),'utf8'));for(const code of codes)assert.equal(b.call({action:'redeem',token:a.token,code}).ok,true,code);b.call({action:'settings',token:a.token,crt:true});const r=b.call({action:'login',name:'Prueba Uno',pin:'000123'});assert.equal(r.progreso.capturadas.length,30);assert.equal(Object.keys(r.progreso.sectores.abiertos).length,7);assert.equal(Object.keys(r.progreso.gimnasios.abiertos).length,10);assert.equal(r.progreso.intentos.length,47);assert.equal(r.progreso.codigosUsados.length,47);assert.equal(r.progreso.configuracion.crt,true);});
test('avatar y paisaje se guardan al registrar y se recuperan al ingresar',()=>{
 const b=backend(),r=b.call({action:'register',name:'Exploradora Nueva',pin:'000123',avatarId:'prisma',landscapeId:'arcana'});
 assert.equal(r.ok,true);assert.equal(r.progreso.configuracion.avatarId,'prisma');assert.equal(r.progreso.configuracion.landscapeId,'arcana');
 b.call({action:'redeem',token:r.token,code:'CAP-NIMBEL-104'});
 assert.equal(b.call({action:'settings',token:r.token,crt:true,avatarId:'terra',landscapeId:'bruma'}).ok,true);
 const p=b.call({action:'login',name:'Exploradora Nueva',pin:'000123'}).progreso;
 assert.deepEqual(p.configuracion,{crt:true,avatarId:'terra',landscapeId:'bruma'});assert.deepEqual(p.capturadas,['B001']);
 assert.equal(b.call({action:'settings',token:r.token,avatarId:'aurora'}).progreso.configuracion.landscapeId,'bruma');
});
test('solo acepta personalización permitida, sin aceptar snapshots',()=>{
 const b=backend(),r=b.register();
 for(const fields of [{avatarId:'../../x'},{landscapeId:'https://otro.test'},{crt:'true'},{}])assert.equal(b.call({action:'settings',token:r.token,...fields}).ok,false);
 assert.equal(b.call({action:'register',name:'Inválida',pin:'000123',avatarId:'<img>'}).ok,false);
 assert.equal(b.call({action:'load',token:r.token}).progreso.configuracion.avatarId,'aurora');
 assert.equal(b.call({action:'settings',token:r.token,avatarId:'nexo',capturadas:['B030']}).ok,true);
 assert.equal(b.call({action:'load',token:r.token}).progreso.capturadas.length,0);
});
test('tres códigos privados, tres ganadores y una mega por cuenta',()=>{
 const b=backend(),prizes=b.sheets.get('PremiosMega').data.slice(1),accounts=['Primero','Segundo','Tercero','Cuarto'].map(n=>b.register(n));
 assert.equal(prizes.length,3);assert.equal(new Set(prizes.map(r=>r[2])).size,3);
 for(let i=0;i<3;i++){
  const r=b.call({action:'redeem',token:accounts[i].token,code:prizes[i][2]});assert.equal(r.ok,true);assert.equal(r.mega,true);assert.deepEqual(r.progreso.capturadas,[prizes[i][0]]);
  assert.ok(!JSON.stringify(r).includes(prizes[i][2]));assert.ok(!JSON.stringify(r.progreso).includes(b.context.norm_(prizes[i][2])));
  assert.equal(b.call({action:'redeem',token:accounts[3].token,code:prizes[i][2]}).ok,false);
  assert.equal(b.call({action:'redeem',token:accounts[i].token,code:prizes[(i+1)%3][2]}).ok,false);
  const repeat=b.call({action:'redeem',token:accounts[i].token,code:prizes[i][2]});assert.equal(repeat.duplicate,true);assert.equal(repeat.progreso.intentos.length,1);
  assert.equal(b.sheets.get('PremiosMega').data[i+1][4],['primero','segundo','tercero'][i]);
  const recovered=b.call({action:'login',name:['Primero','Segundo','Tercero'][i],pin:'000123'});assert.deepEqual(recovered.progreso.capturadas,[prizes[i][0]]);
 }
 assert.equal(b.call({action:'load',token:accounts[3].token}).progreso.capturadas.length,0);
});
test('premio reservado para un nombre y datos privados conservados al reinstalar',()=>{
 const b=backend(),one=b.register('Mejor Alumna'),other=b.register('Otra Alumna'),prize=b.sheets.get('PremiosMega').data[1];
 prize[3]=' MEJOR   ALUMNA ';const before=JSON.stringify(b.sheets.get('Usuarios').data),pepper=b.properties.get('BIODEX_PEPPER'),code=prize[2];
 b.context.instalarBioDex();assert.equal(JSON.stringify(b.sheets.get('Usuarios').data),before);assert.equal(b.properties.get('BIODEX_PEPPER'),pepper);assert.equal(b.sheets.get('PremiosMega').data[1][2],code);
 assert.equal(b.call({action:'redeem',token:other.token,code}).ok,false);assert.equal(b.call({action:'redeem',token:one.token,code}).ok,true);
 const claimed=JSON.stringify(b.sheets.get('PremiosMega').data);b.context.instalarBioDex();assert.equal(JSON.stringify(b.sheets.get('PremiosMega').data),claimed);
});
test('reserva exclusiva se repara tras un fallo de escritura, sin duplicar el premio',()=>{
 const b=backend(),one=b.register('Ganador'),other=b.register('Aspirante'),prize=b.sheets.get('PremiosMega').data[1],users=b.sheets.get('Usuarios'),original=users.getRange;
 let fail=true;users.getRange=function(...args){const range=original.apply(this,args),set=range.setValues;range.setValues=function(values){if(fail&&args[1]===1){fail=false;throw Error('Fallo transitorio');}return set.call(this,values);};return range;};
 assert.equal(b.call({action:'redeem',token:one.token,code:prize[2]}).ok,false);assert.equal(prize[4],'ganador');
 assert.equal(b.call({action:'redeem',token:other.token,code:prize[2]}).ok,false);
 assert.equal(b.call({action:'redeem',token:one.token,code:b.sheets.get('PremiosMega').data[2][2]}).ok,false);
 const repaired=b.call({action:'redeem',token:one.token,code:prize[2]});assert.equal(repaired.ok,true);assert.deepEqual(repaired.progreso.capturadas,['B031']);assert.equal(repaired.progreso.intentos.length,1);
 assert.equal(b.call({action:'redeem',token:one.token,code:prize[2]}).duplicate,true);
});
test('los premios son adicionales: no suman capturas para completar la colección de 30',()=>{
 const b=backend(),a=b.register(),cat=JSON.parse(vm.runInContext('JSON.stringify(CATALOGO_BIODEX)',b.context));
 b.call({action:'redeem',token:a.token,code:b.sheets.get('PremiosMega').data[1][2]});
 assert.deepEqual(b.call({action:'load',token:a.token}).progreso.logros,[]);
 for(const entry of cat.slice(0,29))b.call({action:'redeem',token:a.token,code:entry.codigo});
 let p=b.call({action:'load',token:a.token}).progreso;assert.equal(p.capturadas.length,30);assert.ok(!p.logros.includes('L07'));
 p=b.call({action:'redeem',token:a.token,code:cat[29].codigo}).progreso;assert.equal(p.capturadas.length,31);assert.ok(p.logros.includes('L07'));
 assert.equal(b.call({action:'prepararPremiosMega',token:a.token}).ok,false);
 assert.equal(b.call({action:'save',token:a.token,progreso:{capturadas:['B032']}}).ok,false);
});
