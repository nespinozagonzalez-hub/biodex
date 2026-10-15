const test=require('node:test');
const assert=require('node:assert/strict');
const {frontend,account}=require('./frontend-harness.cjs');
test('el atlas muestra siete paisajes antes de abrir y no expone códigos de activación',()=>{
 const f=account(frontend()),html=f.evaluate('renderMapa()');
 assert.equal((html.match(/data-territory=/g)||[]).length,7);assert.equal((html.match(/assets\/territories\/S\d{2}\.webp/g)||[]).length,7);
 assert.ok(!html.includes('gym-zone-svg'));assert.ok(!/SEC-[A-Z]+-\d{3}/.test(html));assert.ok(!/GYM-[A-Z]+-\d{3}/.test(html));
 assert.match(html,/Los diez <b>gimnasios/);assert.ok(!html.includes('Laboratorio Nimbel'));
});
test('los filtros y detalles de territorio respetan la apertura y los hallazgos guardados',()=>{
 const f=account(frontend());f.evaluate("go('mapa');progreso.capturadas=['B001','B002','B003','B004','B005'];changeTerritoryFilter('completado')");
 assert.ok(!f.element('view').innerHTML.includes('data-territory='));assert.equal(f.evaluate("getSectorEstado(SECTORES_CIUDAD[0])"),'bloqueado');
 f.evaluate("verDetalleTerritorio('S01')");assert.equal(f.element('modalContent').innerHTML,'');
 f.evaluate("progreso.sectores.abiertos.S01={abierto:true};changeTerritoryFilter('completado')");assert.equal((f.element('view').innerHTML.match(/data-territory=/g)||[]).length,1);
 f.evaluate("verDetalleTerritorio('S01')");const html=f.element('modalContent').innerHTML;assert.match(html,/Laboratorio Nimbel/);assert.equal((html.match(/PARAJE DE EXPLORACIÓN/g)||[]).length,3);assert.match(html,/bioformas\/B001.webp/);assert.match(html,/5 \/ 5/);
 assert.equal(f.evaluate('progreso.gimnasios.abiertos.GYM01'),undefined);
});
test('abrir territorio requiere confirmación del servidor y se recupera su estado sin cambios locales',async()=>{
 const f=account(frontend());f.evaluate("go('mapa')");f.element('sectorCodeInput').value='prueba-de-red';
 f.c.fetch=async()=>{throw Error('Sin red');};await f.evaluate('validarCodigoSector()');assert.equal(f.evaluate('Object.keys(progreso.sectores.abiertos).length'),0);
 f.c.fetch=async()=>({ok:true,json:async()=>({ok:true,kind:'sector',progreso:{jugador:'Ada',capturadas:['B001'],logros:[],codigosUsados:[],sectores:{abiertos:{S01:{abierto:true}}},gimnasios:{abiertos:{}},configuracion:{crt:false}}})});
 await f.evaluate('validarCodigoSector()');assert.equal(f.evaluate("getSectorEstado(SECTORES_CIUDAD[0])"),'progreso');assert.match(f.element('view').innerHTML,/Laboratorio Nimbel/);
 assert.equal(f.evaluate('progreso.capturadas.length'),1);
});
test('localizar territorio restablece el filtro sin conceder capturas ni accesos',()=>{
 const f=account(frontend());f.evaluate("go('mapa');territoryFilter='completado';locateTerritory('S07')");
 assert.equal(f.evaluate('territoryFilter'),'todos');assert.equal(f.evaluate('territoryFocus'),'S07');assert.match(f.element('view').innerHTML,/data-territory="S07"/);
 assert.equal(f.evaluate('progreso.capturadas.length'),0);assert.equal(f.evaluate('Object.keys(progreso.sectores.abiertos).length'),0);
 f.evaluate("locateTerritory('inventado')");assert.equal(f.evaluate('territoryFocus'),'S07');
});

test('el HTML nuevo no distribuye códigos funcionales; la validación usa el servidor',()=>{
 const fs=require('node:fs'),path=require('node:path');const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 assert.ok(!/(?:CAP|SEC|GYM)-[A-Z]+-\d{3}/.test(html));
 const f=account(frontend());assert.equal(f.evaluate("typeof validarCodigoSector"),'function');assert.equal(f.evaluate("typeof validarCodigoGimnasio"),'function');
});
