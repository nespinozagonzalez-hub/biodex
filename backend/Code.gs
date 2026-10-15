/**
 * BioDex 2.4 · Backend vinculado a una hoja de Google Sheets.
 * Ejecuta instalarBioDex() una vez. Despliega como app web, ejecutada por ti.
 * La hoja y el editor del script NO deben compartirse con estudiantes.
 */
const CATALOGO_BIODEX = [
  {
    "id": "B001",
    "nombre": "Nimbel",
    "codigo": "CAP-NIMBEL-104",
    "prev": null,
    "etapa": 1,
    "linea": "sexualidad-integral",
    "rareza": "Común",
    "tipo": "Aurora"
  },
  {
    "id": "B002",
    "nombre": "Auralis",
    "codigo": "CAP-AURALIS-216",
    "prev": "B001",
    "etapa": 2,
    "linea": "sexualidad-integral",
    "rareza": "Poco común",
    "tipo": "Aurora"
  },
  {
    "id": "B003",
    "nombre": "Prismara",
    "codigo": "CAP-PRISMARA-337",
    "prev": "B002",
    "etapa": 3,
    "linea": "sexualidad-integral",
    "rareza": "Rara",
    "tipo": "Aurora"
  },
  {
    "id": "B004",
    "nombre": "Lunor",
    "codigo": "CAP-LUNOR-441",
    "prev": null,
    "etapa": 1,
    "linea": "formacion-vida",
    "rareza": "Común",
    "tipo": "Prisma"
  },
  {
    "id": "B005",
    "nombre": "Orbelix",
    "codigo": "CAP-ORBELIX-512",
    "prev": "B004",
    "etapa": 2,
    "linea": "formacion-vida",
    "rareza": "Poco común",
    "tipo": "Prisma"
  },
  {
    "id": "B006",
    "nombre": "Solvian",
    "codigo": "CAP-SOLVIAN-633",
    "prev": "B005",
    "etapa": 3,
    "linea": "formacion-vida",
    "rareza": "Rara",
    "tipo": "Prisma"
  },
  {
    "id": "B007",
    "nombre": "Vireon",
    "codigo": "CAP-VIREON-745",
    "prev": null,
    "etapa": 1,
    "linea": "prevencion-its",
    "rareza": "Común",
    "tipo": "Nexo"
  },
  {
    "id": "B008",
    "nombre": "Nexora",
    "codigo": "CAP-NEXORA-856",
    "prev": "B007",
    "etapa": 2,
    "linea": "prevencion-its",
    "rareza": "Poco común",
    "tipo": "Nexo"
  },
  {
    "id": "B009",
    "nombre": "Clyrion",
    "codigo": "CAP-CLYRION-967",
    "prev": "B008",
    "etapa": 3,
    "linea": "prevencion-its",
    "rareza": "Rara",
    "tipo": "Nexo"
  },
  {
    "id": "B010",
    "nombre": "Terral",
    "codigo": "CAP-TERRAL-178",
    "prev": null,
    "etapa": 1,
    "linea": "defensa-cuerpo",
    "rareza": "Común",
    "tipo": "Nova"
  },
  {
    "id": "B011",
    "nombre": "Valtrix",
    "codigo": "CAP-VALTRIX-289",
    "prev": "B010",
    "etapa": 2,
    "linea": "defensa-cuerpo",
    "rareza": "Poco común",
    "tipo": "Nova"
  },
  {
    "id": "B012",
    "nombre": "Aegira",
    "codigo": "CAP-AEGIRA-390",
    "prev": "B011",
    "etapa": 3,
    "linea": "defensa-cuerpo",
    "rareza": "Rara",
    "tipo": "Nova"
  },
  {
    "id": "B013",
    "nombre": "Myrka",
    "codigo": "CAP-MYRKA-402",
    "prev": null,
    "etapa": 1,
    "linea": "microorganismos",
    "rareza": "Común",
    "tipo": "Bruma"
  },
  {
    "id": "B014",
    "nombre": "Zephor",
    "codigo": "CAP-ZEPHOR-513",
    "prev": "B013",
    "etapa": 2,
    "linea": "microorganismos",
    "rareza": "Poco común",
    "tipo": "Bruma"
  },
  {
    "id": "B015",
    "nombre": "Spirel",
    "codigo": "CAP-SPIREL-624",
    "prev": "B014",
    "etapa": 3,
    "linea": "microorganismos",
    "rareza": "Rara",
    "tipo": "Bruma"
  },
  {
    "id": "B016",
    "nombre": "Embera",
    "codigo": "CAP-EMBERA-735",
    "prev": null,
    "etapa": 1,
    "linea": "biotecnologia",
    "rareza": "Común",
    "tipo": "Lumen"
  },
  {
    "id": "B017",
    "nombre": "Cylar",
    "codigo": "CAP-CYLAR-846",
    "prev": "B016",
    "etapa": 2,
    "linea": "biotecnologia",
    "rareza": "Poco común",
    "tipo": "Lumen"
  },
  {
    "id": "B018",
    "nombre": "Orynx",
    "codigo": "CAP-ORYNX-957",
    "prev": "B017",
    "etapa": 3,
    "linea": "biotecnologia",
    "rareza": "Rara",
    "tipo": "Lumen"
  },
  {
    "id": "B019",
    "nombre": "Altor",
    "codigo": "CAP-ALTOR-167",
    "prev": null,
    "etapa": 1,
    "linea": "fuerzas",
    "rareza": "Común",
    "tipo": "Vector"
  },
  {
    "id": "B020",
    "nombre": "Dravik",
    "codigo": "CAP-DRAVIK-278",
    "prev": "B019",
    "etapa": 2,
    "linea": "fuerzas",
    "rareza": "Poco común",
    "tipo": "Vector"
  },
  {
    "id": "B021",
    "nombre": "Velion",
    "codigo": "CAP-VELION-389",
    "prev": "B020",
    "etapa": 3,
    "linea": "fuerzas",
    "rareza": "Rara",
    "tipo": "Vector"
  },
  {
    "id": "B022",
    "nombre": "Umbrin",
    "codigo": "CAP-UMBRIN-490",
    "prev": null,
    "etapa": 1,
    "linea": "presion",
    "rareza": "Común",
    "tipo": "Umbral"
  },
  {
    "id": "B023",
    "nombre": "Caelix",
    "codigo": "CAP-CAELIX-601",
    "prev": "B022",
    "etapa": 2,
    "linea": "presion",
    "rareza": "Poco común",
    "tipo": "Umbral"
  },
  {
    "id": "B024",
    "nombre": "Nuvora",
    "codigo": "CAP-NUVORA-712",
    "prev": "B023",
    "etapa": 3,
    "linea": "presion",
    "rareza": "Rara",
    "tipo": "Umbral"
  },
  {
    "id": "B025",
    "nombre": "Lithor",
    "codigo": "CAP-LITHOR-823",
    "prev": null,
    "etapa": 1,
    "linea": "geologia-dinamica",
    "rareza": "Común",
    "tipo": "Arcana"
  },
  {
    "id": "B026",
    "nombre": "Quarza",
    "codigo": "CAP-QUARZA-934",
    "prev": "B025",
    "etapa": 2,
    "linea": "geologia-dinamica",
    "rareza": "Poco común",
    "tipo": "Arcana"
  },
  {
    "id": "B027",
    "nombre": "Pyronix",
    "codigo": "CAP-PYRONIX-145",
    "prev": "B026",
    "etapa": 3,
    "linea": "geologia-dinamica",
    "rareza": "Épica",
    "tipo": "Arcana"
  },
  {
    "id": "B028",
    "nombre": "Strata",
    "codigo": "CAP-STRATA-256",
    "prev": null,
    "etapa": 1,
    "linea": "rocas-clima",
    "rareza": "Común",
    "tipo": "Terra"
  },
  {
    "id": "B029",
    "nombre": "Borelia",
    "codigo": "CAP-BORELIA-367",
    "prev": "B028",
    "etapa": 2,
    "linea": "rocas-clima",
    "rareza": "Rara",
    "tipo": "Terra"
  },
  {
    "id": "B030",
    "nombre": "Gaian",
    "codigo": "CAP-GAIAN-478",
    "prev": "B029",
    "etapa": 3,
    "linea": "rocas-clima",
    "rareza": "Legendaria",
    "tipo": "Terra"
  }
];
const SECTORES_BIODEX = [
  {
    "id": "S01",
    "nombre": "Sector Aurora",
    "codigo": "SEC-AURORA-001"
  },
  {
    "id": "S02",
    "nombre": "Santuario Prisma",
    "codigo": "SEC-PRISMA-002"
  },
  {
    "id": "S03",
    "nombre": "Distrito Nexo",
    "codigo": "SEC-NEXO-003"
  },
  {
    "id": "S04",
    "nombre": "Muralla Nova",
    "codigo": "SEC-NOVA-004"
  },
  {
    "id": "S05",
    "nombre": "Laboratorio Bruma",
    "codigo": "SEC-BRUMA-005"
  },
  {
    "id": "S06",
    "nombre": "Campo Vector",
    "codigo": "SEC-VECTOR-006"
  },
  {
    "id": "S07",
    "nombre": "Archivo Terra",
    "codigo": "SEC-TERRA-007"
  }
];
const GIMNASIOS_BIODEX = [
  {
    "id": "GYM01",
    "nombre": "Gimnasio Aurora",
    "codigo": "GYM-AURORA-001"
  },
  {
    "id": "GYM02",
    "nombre": "Gimnasio Prisma",
    "codigo": "GYM-PRISMA-002"
  },
  {
    "id": "GYM03",
    "nombre": "Gimnasio Nexo",
    "codigo": "GYM-NEXO-003"
  },
  {
    "id": "GYM04",
    "nombre": "Gimnasio Nova",
    "codigo": "GYM-NOVA-004"
  },
  {
    "id": "GYM05",
    "nombre": "Gimnasio Bruma",
    "codigo": "GYM-BRUMA-005"
  },
  {
    "id": "GYM06",
    "nombre": "Gimnasio Lumen",
    "codigo": "GYM-LUMEN-006"
  },
  {
    "id": "GYM07",
    "nombre": "Gimnasio Vector",
    "codigo": "GYM-VECTOR-007"
  },
  {
    "id": "GYM08",
    "nombre": "Gimnasio Umbral",
    "codigo": "GYM-UMBRAL-008"
  },
  {
    "id": "GYM09",
    "nombre": "Gimnasio Arcana",
    "codigo": "GYM-ARCANA-009"
  },
  {
    "id": "GYM10",
    "nombre": "Gimnasio Terra",
    "codigo": "GYM-TERRA-010"
  }
];
const MEGAS_BIODEX = Object.freeze([
  {id:'B031',nombre:'Astrael',titulo:'Guardián del alba'},
  {id:'B032',nombre:'Thalúmor',titulo:'Custodio del abismo'},
  {id:'B033',nombre:'Ignivar',titulo:'Corazón primordial'}
]);
const BD_FEATURES = Object.freeze({version:'2.4.0',captureMode:'code-only',megaPrizes:3,oneMegaPerAccount:true});
const BD_HEADERS = {
  Usuarios:['nombre_clave','nombre','sal','pin_hmac','creado','actualizado','progreso_json','fallos','bloqueo_hasta'],
  Sesiones:['token_hash','nombre_clave','vence'],
  Bitacora:['fecha','nombre_clave','accion','detalle'],
  Migraciones:['fecha','nombre_clave','estado','respaldo_json'],
  PremiosMega:['id','bioforma','codigo_privado','ganador_opcional','cuenta_canjeo','fecha_canjeo']
};

function instalarBioDex() {
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  if(!ss)throw new Error('Abre Apps Script desde Extensiones de una hoja de cálculo.');
  const props=PropertiesService.getScriptProperties();
  props.setProperty('BIODEX_SHEET_ID',ss.getId());
  if(!props.getProperty('BIODEX_PEPPER'))props.setProperty('BIODEX_PEPPER',Utilities.getUuid()+Utilities.getUuid());
  if(!props.getProperty('REGISTRO_ABIERTO'))props.setProperty('REGISTRO_ABIERTO','true');
  Object.keys(BD_HEADERS).forEach(name=>{
    const sheet=ss.getSheetByName(name)||ss.insertSheet(name);
    if(sheet.getLastRow()===0) {
      sheet.appendRow(BD_HEADERS[name]);
      sheet.setFrozenRows(1);
      sheet.getRange(1,1,1,BD_HEADERS[name].length).setBackground('#183f35').setFontColor('#f3e8cd').setFontWeight('bold');
    } else {
      const current=sheet.getRange(1,1,1,BD_HEADERS[name].length).getValues()[0];
      if(JSON.stringify(current)!==JSON.stringify(BD_HEADERS[name]))throw new Error('Cabeceras incompatibles en '+name+'. No se borró ningún dato.');
    }
  });
  prepararPremiosMega_();
  return 'BioDex 2.4 instalado. Conserva tu implementación /exec; los tres códigos privados están en PremiosMega.';
}
function db_(){const id=PropertiesService.getScriptProperties().getProperty('BIODEX_SHEET_ID');if(!id)throw new Error('El docente debe ejecutar instalarBioDex antes de comenzar.');return SpreadsheetApp.openById(id);}
function sheet_(name){return db_().getSheetByName(name);}
function rows_(name){const s=sheet_(name);return s.getLastRow()<2?[]:s.getRange(2,1,s.getLastRow()-1,BD_HEADERS[name].length).getValues();}
function norm_(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]/g,'');}
function nameKey_(name){return String(name||'').normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase('es');}
function bytesHex_(bytes){return bytes.map(x=>('0'+((x+256)%256).toString(16)).slice(-2)).join('');}
function hash_(text){return bytesHex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(text),Utilities.Charset.UTF_8));}
function pinHash_(pin,salt){
  const pepper=PropertiesService.getScriptProperties().getProperty('BIODEX_PEPPER');
  if(!pepper)throw new Error('Configuración incompleta del servidor.');
  return bytesHex_(Utilities.computeHmacSha256Signature(salt+':'+pin,pepper,Utilities.Charset.UTF_8));
}
function same_(a,b){a=String(a);b=String(b);let d=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)d|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return d===0;}
function empty_(name){return {jugador:name,fechaRegistro:new Date().toISOString(),capturadas:[],codigosUsados:[],preguntasUsadas:{},intentos:[],logros:[],configuracion:{crt:false,avatarId:'aurora',landscapeId:'bosque'},ultimaBioforma:null,bienvenidaVista:true,gimnasios:{abiertos:{}},sectores:{abiertos:{}}};}
function profileFields_(data){
  const clean={};
  const allowed={avatarId:['aurora','nexo','prisma','terra'],landscapeId:['bosque','prisma','bruma','arcana']};
  Object.keys(allowed).forEach(key=>{if(data[key]!==undefined){if(!allowed[key].includes(data[key]))throw new Error('Personalización no válida.');clean[key]=data[key];}});
  if(data.crt!==undefined){if(typeof data.crt!=='boolean')throw new Error('Preferencia inválida.');clean.crt=data.crt;}
  return clean;
}
function achievements_(p) {
  const caps=CATALOGO_BIODEX.filter(b=>p.capturadas.includes(b.id)), n=caps.length, ids=[];
  [1,5,10,15,20,25,30].forEach((count,i)=>{if(n>=count)ids.push('L0'+(i+1));});
  if(caps.some(b=>b.etapa===2))ids.push('L08');
  if([...new Set(CATALOGO_BIODEX.map(b=>b.linea))].some(l=>CATALOGO_BIODEX.filter(b=>b.linea===l).every(b=>p.capturadas.includes(b.id))))ids.push('L09');
  if(caps.some(b=>b.rareza==='Épica'))ids.push('L10');
  if(caps.some(b=>b.rareza==='Legendaria'))ids.push('L11');
  if(caps.some(b=>['Aurora','Prisma','Nexo','Nova','Bruma','Lumen'].includes(b.tipo))&&caps.some(b=>['Vector','Umbral','Arcana','Terra'].includes(b.tipo)))ids.push('L12');
  p.logros=ids;return p;
}
function audit_(key,action,detail){sheet_('Bitacora').appendRow([new Date().toISOString(),key,action,String(detail)]);}
function user_(key){const rows=rows_('Usuarios');const i=rows.findIndex(r=>r[0]===key);return i<0?null:{row:i+2,data:rows[i]};}
function session_(token) {
  if(typeof token!=='string'||token.length<50||token.length>200)throw new Error('Sesión no válida. Vuelve a ingresar.');
  const digest=hash_(token), found=rows_('Sesiones').find(r=>same_(r[0],digest)&&Number(r[2])>Date.now());
  if(!found)throw new Error('La sesión venció. Sal e ingresa otra vez para recuperar tu colección.');
  const user=user_(found[1]);if(!user)throw new Error('Cuenta no disponible.');return user;
}
function createSession_(key){const token=Utilities.getUuid()+Utilities.getUuid();sheet_('Sesiones').appendRow([hash_(token),key,Date.now()+8*60*60*1000]);return token;}
function result_(u,extra){return Object.assign({ok:true,features:BD_FEATURES,progreso:JSON.parse(u.data[6])},extra||{});}
function write_(u,p,action,detail) {
  achievements_(p);
  u.data[5]=new Date().toISOString();u.data[6]=JSON.stringify(p);
  sheet_('Usuarios').getRange(u.row,1,1,9).setValues([u.data]);
  // El snapshot guarda el evento; una caída de la bitácora no revierte una captura.
  try{audit_(u.data[0],action,detail);}catch(e){console.error('Bitácora: '+e.message);}
  return result_(u);
}
function credentialFields_(data){
  const name=String(data.name||'').normalize('NFKC').trim().replace(/\s+/g,' '),pin=String(data.pin||'');
  if(name.length<2||name.length>60||/^[=+@-]/.test(name)||/[\u0000-\u001f]/.test(name)||!/^\d{6}$/.test(pin))throw new Error('Nombre o clave no válidos. La clave debe tener seis dígitos.');
  return {name,pin,key:nameKey_(name)};
}
function auth_(data) {
  const f=credentialFields_(data),u=user_(f.key),now=Date.now(),cache=CacheService.getScriptCache(),key='login_'+hash_(f.key);
  if(Number(cache.get(key)||0)>=5)throw new Error('Demasiados intentos. Espera 15 minutos antes de volver a intentar.');
  if(data.action==='register') {
    if(PropertiesService.getScriptProperties().getProperty('REGISTRO_ABIERTO')!=='true')throw new Error('El registro de nuevas cuentas está cerrado. Consulta a tu docente.');
    if(u)throw new Error('Ese nombre ya está registrado. Ingresa con tu clave o elige un nombre distinto.');
    const profile=profileFields_(data),salt=Utilities.getUuid(),p=empty_(f.name);
    p.configuracion=Object.assign(p.configuracion,profile);
    const row=[f.key,f.name,salt,pinHash_(f.pin,salt),new Date().toISOString(),new Date().toISOString(),JSON.stringify(p),0,0];
    sheet_('Usuarios').appendRow(row);
    return {ok:true,features:BD_FEATURES,token:createSession_(f.key),progreso:p};
  }
  if(u&&Number(u.data[8])>now)throw new Error('Demasiados intentos. Espera 15 minutos o consulta a tu docente.');
  if(!u||!same_(u.data[3],pinHash_(f.pin,u.data[2]))) {
    const tries=Number(cache.get(key)||0)+1;cache.put(key,String(tries),900);
    if(u){u.data[7]=Number(u.data[7]||0)+1;if(u.data[7]>=5)u.data[8]=now+15*60*1000;sheet_('Usuarios').getRange(u.row,8,1,2).setValues([[u.data[7],u.data[8]]]);}
    throw new Error('Nombre o clave incorrectos.');
  }
  u.data[7]=0;u.data[8]=0;sheet_('Usuarios').getRange(u.row,8,1,2).setValues([[0,0]]);cache.remove(key);
  return result_(u,{token:createSession_(f.key)});
}
function redeem_(u,code) {
  const normalized=norm_(code);if(!normalized||String(code).length>100)throw new Error('Ingresa un código válido.');
  const p=JSON.parse(u.data[6]),b=CATALOGO_BIODEX.find(x=>norm_(x.codigo)===normalized),now=new Date().toISOString();
  if(b){
    if(p.capturadas.includes(b.id))return result_(u,{kind:'capture',bioforma:b.id,duplicate:true,message:b.nombre+' ya forma parte de tu colección.'});
    p.capturadas.push(b.id);p.codigosUsados.push(normalized);p.ultimaBioforma=b.id;
    p.intentos.push({accion:'captura',bioforma:b.id,fecha:now});
    return Object.assign(write_(u,p,'captura',b.id),{kind:'capture',bioforma:b.id,duplicate:false});
  }
  const sector=SECTORES_BIODEX.find(x=>norm_(x.codigo)===normalized),gym=GIMNASIOS_BIODEX.find(x=>norm_(x.codigo)===normalized),entity=sector||gym;
  if(!entity){const mega=canjearMega_(u,p,normalized,now);if(mega)return mega;throw new Error('Código no reconocido. Revisa el código entregado por tu docente.');}
  const kind=sector?'sector':'gimnasio',target=sector?p.sectores.abiertos:p.gimnasios.abiertos;
  if(target[entity.id])return result_(u,{kind,duplicate:true,message:entity.nombre+' ya estaba activado.'});
  target[entity.id]={abierto:true,fecha:now,codigo:entity.codigo};
  p.intentos.push({accion:kind,id:entity.id,fecha:now});
  if(!p.codigosUsados.includes(normalized))p.codigosUsados.push(normalized);
  return Object.assign(write_(u,p,kind,entity.id),{kind,duplicate:false,message:entity.nombre+' activado y guardado.'});
}
/** Códigos generados en la hoja privada, nunca incluidos en el catálogo público. */
function prepararPremiosMega_(){
  const table=sheet_('PremiosMega'),existing=rows_('PremiosMega');
  MEGAS_BIODEX.forEach(mega=>{
    if(existing.some(row=>row[0]===mega.id))return;
    const secret=Utilities.getUuid().replace(/-/g,'').slice(0,20).toUpperCase();
    const label=norm_(mega.nombre);
    table.appendRow([mega.id,mega.nombre,'MEGA-'+label+'-'+secret,'','','']);
  });
}
function canjearMega_(u,p,normalized,now){
  const table=sheet_('PremiosMega');if(!table)return null;
  const prizes=rows_('PremiosMega'),index=prizes.findIndex(row=>String(row[2]||'').trim()&&norm_(row[2])===normalized);
  if(index<0)return null;
  const row=prizes[index],mega=MEGAS_BIODEX.find(m=>m.id===row[0]);if(!mega)return null;
  const owner=String(row[4]||''),account=u.data[0],designated=String(row[3]||'').trim();
  if(owner&&owner!==account)throw new Error('Esta mega legendaria ya fue entregada a otro explorador.');
  if(designated&&nameKey_(designated)!==account)throw new Error('Este premio está reservado para otro explorador.');
  if(prizes.some(r=>r[0]!==mega.id&&String(r[4]||'')===account)||MEGAS_BIODEX.some(m=>m.id!==mega.id&&p.capturadas.includes(m.id)))throw new Error('Cada explorador puede recibir una sola mega legendaria del curso.');
  // Reservar primero permite reparar un guardado interrumpido al reintentar.
  // doPost mantiene el bloqueo de script durante la reserva y la escritura.
  if(!owner)table.getRange(index+2,5,1,2).setValues([[account,now]]);
  if(p.capturadas.includes(mega.id))return result_(u,{kind:'capture',mega:true,bioforma:mega.id,duplicate:true,message:mega.nombre+' ya forma parte de tu colección.'});
  p.capturadas.push(mega.id);p.ultimaBioforma=mega.id;
  if(!p.codigosUsados.includes('PREMIO:'+mega.id))p.codigosUsados.push('PREMIO:'+mega.id);
  p.premios=p.premios||{};p.premios[mega.id]={titulo:mega.titulo,fecha:now};
  p.intentos.push({accion:'premio_mega',bioforma:mega.id,fecha:now});
  return Object.assign(write_(u,p,'premio_mega',mega.id),{kind:'capture',mega:true,bioforma:mega.id,duplicate:false});
}
function handle_(data){
  if(!data||typeof data!=='object')throw new Error('Solicitud no válida.');
  if(data.action==='login'||data.action==='register')return auth_(data);
  const u=session_(data.token);
  if(data.action==='load')return result_(u);
  if(data.action==='redeem')return redeem_(u,data.code);
  if(data.action==='settings'){
    const fields=profileFields_(data);if(!Object.keys(fields).length)throw new Error('Preferencia inválida.');
    const p=JSON.parse(u.data[6]);p.configuracion=Object.assign({crt:false,avatarId:'aurora',landscapeId:'bosque'},p.configuracion||{},fields);return write_(u,p,'preferencias',JSON.stringify(fields));
  }
  if(data.action==='logout'){
    const rows=rows_('Sesiones'),digest=hash_(data.token);
    for(let i=rows.length-1;i>=0;i--)if(same_(rows[i][0],digest))sheet_('Sesiones').deleteRow(i+2);
    return {ok:true};
  }
  if(data.action==='migration'){
    const source=data.legacy;
    if(!source||!Array.isArray(source.capturadas)||source.capturadas.length>100)throw new Error('Respaldo no válido.');
    const clean={jugador:String(source.jugador||'').slice(0,60),capturadas:source.capturadas.filter(id=>CATALOGO_BIODEX.some(b=>b.id===id)),sectores:source.sectores||{},gimnasios:source.gimnasios||{}};
    const json=JSON.stringify(clean);if(json.length>20000)throw new Error('Respaldo demasiado extenso.');
    sheet_('Migraciones').appendRow([new Date().toISOString(),u.data[0],'PENDIENTE',json]);
    return {ok:true,message:'Solicitud pendiente de revisión del docente.'};
  }
  throw new Error('Acción no permitida.');
}
function doPost(e){
  const lock=LockService.getScriptLock();
  let result;
  try{
    if(!e||!e.postData||e.postData.contents.length>30000)throw new Error('Solicitud no válida.');
    if(!lock.tryLock(15000))throw new Error('El archivo está ocupado. Intenta nuevamente.');
    result=handle_(JSON.parse(e.postData.contents));
  }catch(error){result={ok:false,error:error.message||'Error de servidor.'};}
  finally{if(lock.hasLock())lock.releaseLock();}
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}
function doGet(){return ContentService.createTextOutput(JSON.stringify({ok:true,service:'BioDex',version:'2.4.0',features:BD_FEATURES})).setMimeType(ContentService.MimeType.JSON);}

/** Solo desde el editor del docente. Nunca se expone mediante doPost. */
function restablecerClaveDocente(nombre,nuevaClave) {
  if(arguments.length===0)throw new Error('Crea una función privada que invoque restablecerClaveDocente("Nombre", "123456"). No publiques la clave en GitHub.');
  if(!/^\d{6}$/.test(String(nuevaClave)))throw new Error('Usa exactamente seis dígitos.');
  const lock=LockService.getScriptLock();lock.waitLock(15000);
  try{
    const u=user_(nameKey_(nombre));if(!u)throw new Error('Cuenta no encontrada.');
    u.data[2]=Utilities.getUuid();u.data[3]=pinHash_(String(nuevaClave),u.data[2]);u.data[7]=0;u.data[8]=0;
    sheet_('Usuarios').getRange(u.row,1,1,9).setValues([u.data]);
    const sessions=rows_('Sesiones');for(let i=sessions.length-1;i>=0;i--)if(sessions[i][1]===u.data[0])sheet_('Sesiones').deleteRow(i+2);
    CacheService.getScriptCache().remove('login_'+hash_(u.data[0]));audit_(u.data[0],'restablecer_clave','sesiones revocadas');
  }finally{lock.releaseLock();}
}
/** Aprueba SOLO la fila revisada de Migraciones, conservando el avance existente. */
function aprobarMigracionDocente(fila) {
  if(!Number.isInteger(fila)||fila<2)throw new Error('Indica una fila de Migraciones revisada por el docente.');
  const lock=LockService.getScriptLock();lock.waitLock(15000);
  try{
    const s=sheet_('Migraciones'),r=s.getRange(fila,1,1,4).getValues()[0];
    if(r[2]!=='PENDIENTE')throw new Error('La solicitud no está pendiente.');
    const u=user_(r[1]);if(!u)throw new Error('Cuenta no encontrada.');
    const p=JSON.parse(u.data[6]),legacy=JSON.parse(r[3]);
    [...new Set(legacy.capturadas)].forEach(id=>{
      if(CATALOGO_BIODEX.some(b=>b.id===id)&&!p.capturadas.includes(id))p.capturadas.push(id);
    });
    for(const pair of [['sectores',SECTORES_BIODEX],['gimnasios',GIMNASIOS_BIODEX]])pair[1].forEach(x=>{
      if(legacy[pair[0]]&&legacy[pair[0]].abiertos&&legacy[pair[0]].abiertos[x.id])p[pair[0]].abiertos[x.id]={abierto:true,fecha:new Date().toISOString(),origen:'migracion_revisada'};
    });
    p.ultimaBioforma=p.ultimaBioforma||p.capturadas[p.capturadas.length-1]||null;
    p.intentos.push({accion:'migracion_docente',fecha:new Date().toISOString(),fila});
    write_(u,p,'migracion',String(fila));s.getRange(fila,3).setValue('APROBADA');
  }finally{lock.releaseLock();}
}

