const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const {frontend,account}=require('./frontend-harness.cjs');const root=path.join(__dirname,'..');
const visible=html=>html.replace(/<[^>]*>/g,' ');
const classroom=/\b(?:ciencias?|cient[ií]fic\w*|docentes?|profesor\w*|asignaturas?|aula|cuestionarios?|did[aá]ctic\w*)\b/i;
function adventure(f){f.evaluate("serverFeatures={captureMode:'code-only',megaPrizes:3}");return f;}
test('las 33 bioformas tienen relatos y habilidades propios sin explicaciones didácticas',()=>{
 const f=frontend(),rows=JSON.parse(f.evaluate('JSON.stringify([...BIOFORMAS,...MEGA_BIOFORMAS].map(b=>({id:b.id,historia:b.descN,rasgo:b.descE,habilidad:b.habilidad})))'));
 assert.equal(rows.length,33);assert.equal(new Set(rows.map(b=>b.historia)).size,33);
 for(const b of rows){assert.ok(b.historia.length>70,b.id);assert.ok(b.rasgo.length>40,b.id);assert.ok(b.habilidad.length>5,b.id);assert.ok(!classroom.test(b.historia+' '+b.rasgo+' '+b.habilidad),b.id);assert.ok(!/representa|trayectoria de aprendizaje/i.test(b.rasgo),b.id);}
});
test('la capa narrativa conserva identificadores, valores, reglas, sesiones y progreso',()=>{
 const f=frontend({narrative:false});f.evaluate("sesion={token:'test'};progreso=defaultProgress();progreso.jugador='Explorador';progreso.capturadas=['B015'];progreso.logros=['L01'];progreso.sectores.abiertos.S01={abierto:true}");
 const snapshot="JSON.stringify({bioformas:[...BIOFORMAS,...MEGA_BIOFORMAS].map(({descN,descE,habilidad,...b})=>b),gyms:GIMNASIOS_BIONOVA.map(({narrativa,objetivo,...g})=>g),sectores:SECTORES_CIUDAD.map(s=>({id:s.id,gimnasios:s.gimnasios.map(({objetivo,...g})=>g)})),progreso,sesion,features:serverFeatures,logros:LOGROS.map(l=>l.id)})";
 const before=f.evaluate(snapshot);let requests=0;f.c.fetch=async()=>{requests++;throw Error('No debería conectarse');};
 vm.runInContext(fs.readFileSync(path.join(root,'narrativa.js'),'utf8'),f.c);
 assert.equal(f.evaluate(snapshot),before);assert.equal(requests,0);
});
test('todas las fichas, reveladas y pendientes, se presentan como relatos de aventura',()=>{
 const f=adventure(account(frontend()));
 for(const captured of [false,true]){
  f.evaluate('progreso.capturadas='+(captured?'[...BIOFORMAS,...MEGA_BIOFORMAS].map(b=>b.id)':'[]'));
  for(const id of JSON.parse(f.evaluate('JSON.stringify([...BIOFORMAS,...MEGA_BIOFORMAS].map(b=>b.id))'))){f.evaluate('renderFicha('+JSON.stringify(id)+')');const html=f.element('modalContent').innerHTML;assert.ok(!classroom.test(visible(html)),id);assert.ok(!/Descripción narrativa|Esencia de la bioforma/i.test(visible(html)),id);}
 }
});
test('la ficha de Spirel invita a seguir explorando y conserva su arte completo',()=>{
 const f=adventure(account(frontend()));f.evaluate("progreso.capturadas=['B015'];renderFicha('B015')");const html=f.element('modalContent').innerHTML;
 assert.match(html,/Sendero de esporas/);assert.match(html,/Sigue tu camino, reúne nuevos códigos/);assert.match(html,/journey-note/);assert.match(html,/Seguir explorando/);assert.match(html,/bioformas\/B015.webp/);assert.match(html,/Cerrar/);
});
test('los rótulos de atributos son jueguiles y sus valores permanecen intactos',()=>{
 const f=frontend(),html=f.evaluate('renderStats({vida:76,analisis:78,evidencia:72,comunicacion:64,energia:76})');
 for(const label of ['Vitalidad','Ingenio','Percepción','Vínculo','Energía'])assert.ok(html.includes(label),label);
 assert.deepEqual([...html.matchAll(/<span>(\d+)<\/span>/g)].map(m=>Number(m[1])),[76,78,72,64,76]);
});
test('refugio, atlas, gimnasios, mochila, linajes y logros no rompen la ficción',()=>{
 const f=adventure(account(frontend()));f.evaluate("progreso.capturadas=BIOFORMAS.map(b=>b.id);GIMNASIOS_BIONOVA.forEach(g=>progreso.gimnasios.abiertos[g.id]={abierto:true});SECTORES_CIUDAD.forEach(s=>progreso.sectores.abiertos[s.id]={abierto:true})");
 for(const page of ['panel','biodex','codigo','mapa','gimnasios','lineas','inventario','logros']){f.evaluate('go('+JSON.stringify(page)+')');assert.ok(!classroom.test(visible(f.element('view').innerHTML)),page);}
 for(const id of ['GYM01','GYM05','GYM10']){f.evaluate('verDetalleGym('+JSON.stringify(id)+')');assert.ok(!classroom.test(visible(f.element('modalContent').innerHTML)),id);}
 f.evaluate("verDetalleTerritorio('S05')");assert.ok(!classroom.test(visible(f.element('modalContent').innerHTML)));
});
test('la ayuda de acceso conserva instrucciones claras para recuperar una clave',()=>{
 const f=frontend();assert.match(f.evaluate('renderRegistro()'),/docente puede restablecerla sin borrar tu colección/);
 const help=f.evaluate('renderAyuda()');assert.match(help,/clave de seis dígitos/);assert.match(help,/Sin conexión/);assert.ok(!/no evalúa respuestas|asignatura|cuestionario/i.test(help));
});
test('la narrativa se carga al final y los scripts modificados tienen revisión anticaché',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');assert.ok(html.indexOf('src="narrativa.js?')>html.indexOf('src="territorios.js?'));
 assert.ok(html.includes('narrativa.css?v=2.4.2'));for(const file of ['remaster.js','retro.js','megas.js','territorios.js'])assert.ok(new RegExp(file.replace('.','\\.')+'\\?[^"\\s]+rev=2.4.2').test(html),file);
});
