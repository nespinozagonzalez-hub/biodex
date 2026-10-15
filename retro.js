/* BioDex FIELD-02 · Personalización y laboratorio local. Sin conexión a Sheets. */
"use strict";
const AVATARS=Object.freeze([
  {id:'aurora',name:'Aurora',role:'Exploradora del bosque'},
  {id:'nexo',name:'Nexo',role:'Guardián de rutas'},
  {id:'prisma',name:'Prisma',role:'Cartógrafa de hallazgos'},
  {id:'terra',name:'Terra',role:'Rastreador de campo'}
]);
const LANDSCAPES=Object.freeze([
  {id:'bosque',name:'Bosque Aurora',detail:'Donde comienza la expedición'},
  {id:'prisma',name:'Lago Prisma',detail:'Un reflejo de otros mundos'},
  {id:'bruma',name:'Estación Bruma',detail:'Secretos entre la niebla'},
  {id:'arcana',name:'Cumbres Arcana',detail:'Al filo de lo desconocido'}
]);
const PREVIEW_KEY='biodex_field_preview_v3',DRAFT_KEY='biodex_field_profile_v3';
const profileDefaults={avatarId:'aurora',landscapeId:'bosque'};
function cleanProfile(value={}){
  return {avatarId:AVATARS.some(a=>a.id===value.avatarId)?value.avatarId:'aurora',landscapeId:LANDSCAPES.some(s=>s.id===value.landscapeId)?value.landscapeId:'bosque'};
}
function readLocal(key){try{return JSON.parse(localStorage.getItem(key));}catch(e){return null;}}
function writeLocal(key,data){try{localStorage.setItem(key,JSON.stringify(data));return true;}catch(e){return false;}}
let profileDraft=cleanProfile(readLocal(DRAFT_KEY)||readLocal(PREVIEW_KEY)?.configuracion||{}),previewStored=false;
const baseDefaultProgress=defaultProgress;
defaultProgress=function(){const p=baseDefaultProgress();p.configuracion={crt:false,...profileDefaults};return p;};
function currentProfile(){return cleanProfile(progreso?.jugador?progreso.configuracion:profileDraft);}
function avatarImage(id,cls='avatar-sprite'){
  const a=AVATARS.find(a=>a.id===id)||AVATARS[0];
  return `<img class="${cls}" src="assets/avatars/${a.id}.png" alt="Avatar ${a.name}" loading="lazy">`;
}
function applyLandscape(id){
  const valid=cleanProfile({landscapeId:id}).landscapeId;
  document.body.style.setProperty('--landscape',`url("assets/landscapes/${valid}.webp")`);
  document.body.setAttribute('data-landscape',valid);
}
function renderProfileChoices(context='welcome'){
  const selected=context==='welcome'?profileDraft:currentProfile();
  return `<div class="profile-choices" data-context="${context}"><fieldset><legend>01 / Elige tu avatar</legend><div class="avatar-options">${AVATARS.map(a=>`<button type="button" class="avatar-option ${selected.avatarId===a.id?'selected':''}" aria-pressed="${selected.avatarId===a.id}" data-avatar="${a.id}" onclick="chooseProfile('avatarId','${a.id}','${context}')">${avatarImage(a.id)}<span>${a.name}</span><span class="sr-only"> · ${a.role}</span></button>`).join('')}</div></fieldset><fieldset><legend>02 / Tu lugar de inicio</legend><div class="landscape-options">${LANDSCAPES.map(s=>`<button type="button" class="landscape-option ${selected.landscapeId===s.id?'selected':''}" aria-pressed="${selected.landscapeId===s.id}" data-landscape="${s.id}" onclick="chooseProfile('landscapeId','${s.id}','${context}')"><img src="assets/landscapes/${s.id}.webp" alt="" loading="lazy"><span>${s.name}</span></button>`).join('')}</div></fieldset></div>`;
}
async function chooseProfile(key,id,context='welcome'){
  if(!['avatarId','landscapeId'].includes(key)||busy)return;
  const proposed={...(context==='welcome'?profileDraft:currentProfile()),[key]:id};
  const valid=cleanProfile(proposed);if(valid[key]!==id)return;
  if(context==='welcome'){
    profileDraft=valid;writeLocal(DRAFT_KEY,valid);
    if(key==='landscapeId'){applyLandscape(id);const label=document.querySelector('.welcome-landscape .scene-bottomline span');if(label)label.textContent='⌖ '+LANDSCAPES.find(s=>s.id===id).name;}
    const target=document.getElementById('welcomeAvatar');if(target)target.innerHTML=avatarImage(valid.avatarId);
    document.querySelectorAll(`.profile-choices[data-context="welcome"] [data-${key==='avatarId'?'avatar':'landscape'}]`).forEach(b=>{
      const active=b.getAttribute('data-'+(key==='avatarId'?'avatar':'landscape'))===id;
      b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));
    });return;
  }
  if(sesion?.preview){progreso.configuracion={...progreso.configuracion,...valid};profileDraft=valid;writeLocal(DRAFT_KEY,valid);guardarProgreso();render();toast(previewStored?'Personalización guardada en este navegador.':'Personalización activa; guardado persistente bloqueado.','warn');return;}
  busy=true;try{applyCloud(await api('settings',valid));render();toast('Personalización guardada.');}catch(e){toast(e.message,'warn');}finally{busy=false;}
}

renderRegistro=function(){
  const create=accessMode==='register';applyLandscape(profileDraft.landscapeId);
  const saved=readLocal(PREVIEW_KEY);
  return `<div class="welcome-device"><div class="device-badge"><span class="power-led"></span> BIONOVA / FIELD-02 <span>ARCHIVO DE BIOFORMAS</span></div><section class="access-layout"><div class="access-art"><div class="welcome-landscape"><div class="scene-topline"><span>SEÑAL ENCONTRADA</span><span>30 ESPECIES / 10 RUTAS</span></div><div class="welcome-title"><span class="eyebrow">TU EXPEDICIÓN EMPIEZA AQUÍ</span><h1>Un pequeño dispositivo.<br>Un mundo por descubrir.</h1></div><div class="welcome-trainer" aria-label="Tu personaje entrenador"><div id="welcomeAvatar">${avatarImage(profileDraft.avatarId)}</div></div><div class="scene-bottomline"><span>⌖ ${LANDSCAPES.find(s=>s.id===profileDraft.landscapeId).name}</span><span>● SISTEMA LISTO</span></div></div><div class="welcome-caption"><span>EXPLORA · DESCUBRE · COLECCIONA</span><p>Tu docente propone el desafío. Tú escribes la aventura.</p></div></div><div class="register rpg-window"><span class="rpg-title">PASAPORTE DE CAMPO</span><h2>${create?'Elige quién serás.':'Bienvenido a BioNova.'}</h2><div class="access-tabs"><button type="button" class="${!create?'active':'ghost'}" onclick="changeAccess('login')">Ingresar</button><button type="button" class="${create?'active':'ghost'}" onclick="changeAccess('register')">Crear personaje</button></div><form onsubmit="event.preventDefault();registrarJugador()"><label for="regNombre">Nombre de explorador/a</label><input id="regNombre" autocomplete="username" maxlength="60" minlength="2" placeholder="Tu nombre o alias acordado" required><label for="regClave">Clave de 6 dígitos</label><input id="regClave" type="password" inputmode="numeric" pattern="[0-9]{6}" minlength="6" maxlength="6" autocomplete="${create?'new-password':'current-password'}" placeholder="••••••" required>${create?'<label for="regConfirmar">Repite tu clave</label><input id="regConfirmar" type="password" inputmode="numeric" pattern="[0-9]{6}" minlength="6" maxlength="6" autocomplete="new-password" required>':''}<button class="primary access-submit" type="submit" ${!CONFIG.endpoint?'disabled':''}>${create?'Crear mi pasaporte':'Recuperar mi expedición'} →</button><p id="authError" class="form-error" role="alert"></p></form>${!CONFIG.endpoint?'<p class="connection-note">Google Sheets pendiente: todavía no se crean cuentas ni se comprueba la clave. Prueba el dispositivo con guardado local.</p>':''}${renderProfileChoices('welcome')}<button class="primary preview-start" onclick="startPreview()">${saved?'Continuar vista previa':'Explorar vista previa'} →</button><p class="footer-note">La demo usa el nombre escrito y tu selección. Nunca guarda la clave. ${saved?'Tu colección local anterior se conserva.':''}</p></div></section><div class="device-bottom"><span>◧ BIODEX / EXPEDITION SYSTEM</span><span class="speaker-grille" aria-hidden="true">||||||||</span></div></div>`;
};

guardarProgreso=function(){
  if(!sesion?.preview)return;
  previewStored=writeLocal(PREVIEW_KEY,progreso);
  // Respaldo de pestaña si el navegador restringe el almacenamiento persistente.
  if(!previewStored){try{sessionStorage.setItem(PREVIEW_KEY,JSON.stringify(progreso));}catch(e){}}
  setStatus(previewStored?'DEMO · guardado en este navegador':'DEMO · solo sesión; guardado persistente bloqueado');
};
startPreview=function(){
  if(busy)return;
  const entered=document.getElementById('regNombre')?.value.trim().replace(/\s+/g,' ').slice(0,60);
  let saved=readLocal(PREVIEW_KEY);
  if(!saved){try{saved=JSON.parse(sessionStorage.getItem(PREVIEW_KEY)||sessionStorage.getItem('biodex_preview_v2'));}catch(e){}}
  sesion={preview:true};progreso={...defaultProgress(),...(saved&&typeof saved==='object'?saved:{})};
  progreso.configuracion={crt:false,...progreso.configuracion,...profileDraft};
  progreso.jugador=entered||progreso.jugador||'Explorador de muestra';
  progreso.fechaRegistro=progreso.fechaRegistro||new Date().toISOString();
  progreso.capturadas=Array.isArray(progreso.capturadas)?[...new Set(progreso.capturadas.filter(id=>BIOFORMAS.some(b=>b.id===id)))]:[];
  view='panel';guardarProgreso();document.body.classList.toggle('crt',progreso.configuracion.crt===true);render();window.scrollTo?.(0,0);
};
const baseApplyCloud=applyCloud;
applyCloud=function(data){baseApplyCloud(data);progreso.configuracion={...progreso.configuracion,...cleanProfile(progreso.configuracion)};applyLandscape(progreso.configuracion.landscapeId);};
const baseLogout=logout;
logout=async function(){const result=await baseLogout();if(!sesion)document.body.classList.remove('crt');return result;};

renderShell=function(){
  const profile=currentProfile(),avatar=AVATARS.find(a=>a.id===profile.avatarId),land=LANDSCAPES.find(s=>s.id===profile.landscapeId),count=progreso.capturadas.length;
  applyLandscape(profile.landscapeId);
  return `<div class="field-device"><header class="device-header"><div class="brand"><div class="device-lens" aria-hidden="true"><i></i></div><div><h1>BioDex<span> FIELD-02</span></h1><div class="subtitle">DISPOSITIVO DE EXPLORACIÓN / BIONOVA</div></div></div><div class="header-signals"><span><i class="power-led"></i> EN LÍNEA ${sesion?.preview?'LOCAL':''}</span><button class="ghost" onclick="logout()">Salir ↗</button></div></header><div class="device-layout"><aside class="explorer-sidebar"><button class="explorer-card" onclick="go('perfil')" aria-label="Personalizar explorador"><div class="avatar-monitor">${avatarImage(profile.avatarId)}<span class="avatar-coordinates">ID / ${avatar.id.toUpperCase()}</span></div><strong>${escapeHtml(progreso.jugador)}</strong><small>${escapeHtml(getRango(count))}</small><span class="edit-profile">EDITAR PERFIL ↗</span></button><nav class="nav" aria-label="Exploración">${navButton('panel','⌂ Refugio')}${navButton('biodex','▦ BioDex')}${navButton('codigo','✧ Capturar')}${navButton('mapa','⌖ Territorios')}${navButton('gimnasios','◇ Gimnasios')}${navButton('lineas','⇄ Evoluciones')}${navButton('inventario','▣ Mochila')}${navButton('logros','★ Logros')}${navButton('respaldo','↯ Archivo')}${navButton('ayuda','? Guía')}</nav><div class="sidebar-counter"><b>${String(count).padStart(2,'0')}</b><span>/ 30<br>BIOFORMAS</span><div class="progress"><div style="width:${Math.round(count/30*100)}%"></div></div></div></aside><section class="device-screen"><div class="screen-status"><span>⌖ ${land.name}</span><span id="cloudStatus" role="status">${escapeHtml(cloudStatus)}</span><button class="ghost" onclick="refreshCloud()" aria-label="Actualizar progreso">↻</button></div>${sesion?.preview?'<aside class="preview-banner"><b>LABORATORIO LOCAL</b> · Códigos y capturas de prueba. Guardado en este navegador, no en Google Sheets.</aside>':''}<main id="view"></main></section></div><footer class="device-bottom"><div class="device-controls"><span class="dpad" aria-hidden="true">✚</span><span>BIODEX / FIELD SYSTEM<br><small>APRENDE · DESBLOQUEA · DESCUBRE</small></span></div><div class="physical-buttons"><button onclick="go('codigo')" aria-label="Capturar bioforma">A</button><button onclick="go('biodex')" aria-label="Abrir BioDex">B</button></div><span class="speaker-grille" aria-hidden="true">||||||||</span></footer></div>`;
};
const fieldRenderView=renderView;
renderView=function(){if(view==='perfil')document.getElementById('view').innerHTML=renderProfile();else fieldRenderView();};
const fieldGo=go;
go=function(target){fieldGo(target);window.scrollTo?.(0,0);};
function renderProfile(){
  const p=currentProfile();return `<section class="rpg-window profile-page"><span class="rpg-title">PERSONALIZA TU EXPEDICIÓN</span><h2>Tu identidad de campo.</h2><p class="muted">El avatar te acompaña en toda la BioDex. El paisaje cambia el inicio, el refugio y el entorno del dispositivo. Son elecciones estéticas: no modifican códigos ni recompensas.</p><div class="profile-preview">${avatarImage(p.avatarId)}<div><h3>${escapeHtml(progreso.jugador)}</h3><p>${escapeHtml(getRango(progreso.capturadas.length))}</p><span class="pill">${sesion?.preview?'DEMO · LOCAL':'CUENTA DE EXPLORADOR'}</span></div></div>${renderProfileChoices('profile')}<button class="ghost" onclick="toggleCRT()" aria-pressed="${progreso.configuracion.crt===true}">Textura CRT: ${progreso.configuracion.crt?'activada':'desactivada'}</button><p class="small muted">${sesion?.preview?'Se guarda automáticamente en este navegador. Borrar sus datos elimina la demo; no afecta a la edición anterior.':'Tus preferencias se guardan junto a tu colección.'}</p></section>`;
}
renderPanel=function(){
  const p=currentProfile(),land=LANDSCAPES.find(s=>s.id===p.landscapeId),count=progreso.capturadas.length;
  return `<section class="field-hero"><div class="scene-topline"><span>EXPLORACIÓN EN CURSO</span><span>FIELD-02 / ${String(count).padStart(2,'0')}:30</span></div><div class="field-hero-copy"><span class="eyebrow">${land.name.toUpperCase()}</span><h2>${escapeHtml(progreso.jugador)}</h2><p>Tu aventura comienza contigo.<br>Cada aprendizaje, un nuevo hallazgo.</p><button class="primary" onclick="go('codigo')">✧ Registrar hallazgo →</button></div><div class="field-trainer" aria-label="Tu personaje entrenador">${avatarImage(p.avatarId)}</div><span class="field-trainer-label">TU IDENTIDAD / ${AVATARS.find(a=>a.id===p.avatarId).name.toUpperCase()}</span></section><div class="field-summary">${stat('Colección',`${count} / 30`)}${stat('Territorios',`${Object.keys(progreso.sectores?.abiertos||{}).length} / 7`)}${stat('Gimnasios',`${Object.keys(progreso.gimnasios?.abiertos||{}).length} / 10`)}${stat('Logros',`${progreso.logros.length} / 12`)}</div><div class="grid two field-actions"><article class="card"><span class="rpg-title">01 / ARCHIVO VIVO</span><h3>Tu BioDex, página a página.</h3><p class="muted">Siluetas por reconocer, historias por revelar. Revisa tus hallazgos y las diez líneas evolutivas.</p><button class="ghost" onclick="go('biodex')">Abrir colección →</button></article><article class="card"><span class="rpg-title">02 / TU PRÓXIMA MISIÓN</span><h3>La aventura también está en el aula.</h3><p class="muted">Completa la actividad que proponga tu docente, en cualquier asignatura. Sin preguntas dentro del dispositivo.</p><button class="ghost" onclick="go('mapa')">Explorar territorios →</button></article></div>`;
};

// La colección y las fichas conservan el arte completo. El escáner y la captura
// usan los recortes PNG, sin un rectángulo de paisaje alrededor de la criatura.
function withDetailedArt(html){
  return html.replace(/class="portrait revealed cutout"([\s\S]*?)src="assets\/cutouts\/(B\d{3})\.png"/g,(_m,attrs,id)=>`class="portrait revealed full-art"${attrs}src="assets/bioformas/${id}.webp"`);
}
const fieldBioformaCard=bioformaCard;
bioformaCard=function(b){return withDetailedArt(fieldBioformaCard(b));};
const fieldOpenModal=openModal;
openModal=function(html){fieldOpenModal(withDetailedArt(html));};

// Laboratorio público: los 47 códigos originales son los mismos del repositorio.
// Esta ruta NO se ejecuta con una sesión real: el servidor valida esas acciones.
const DEMO_CAPTURE_CODES=Object.freeze(['CAP-NIMBEL-104','CAP-AURALIS-216','CAP-PRISMARA-337','CAP-LUNOR-441','CAP-ORBELIX-512','CAP-SOLVIAN-633','CAP-VIREON-745','CAP-NEXORA-856','CAP-CLYRION-967','CAP-TERRAL-178','CAP-VALTRIX-289','CAP-AEGIRA-390','CAP-MYRKA-402','CAP-ZEPHOR-513','CAP-SPIREL-624','CAP-EMBERA-735','CAP-CYLAR-846','CAP-ORYNX-957','CAP-ALTOR-167','CAP-DRAVIK-278','CAP-VELION-389','CAP-UMBRIN-490','CAP-CAELIX-601','CAP-NUVORA-712','CAP-LITHOR-823','CAP-QUARZA-934','CAP-PYRONIX-145','CAP-STRATA-256','CAP-BORELIA-367','CAP-GAIAN-478']);
function normalizeDemoCode(code){return String(code).normalize('NFKC').toUpperCase().replace(/[^A-Z0-9]/g,'');}
function redeemLocal(code){
  const norm=normalizeDemoCode(code),index=DEMO_CAPTURE_CODES.findIndex(c=>normalizeDemoCode(c)===norm),b=index>=0?BIOFORMAS[index]:null,now=new Date().toISOString();
  if(b){
    if(progreso.capturadas.includes(b.id))return {kind:'capture',duplicate:true,message:b.nombre+' ya forma parte de tu colección local.'};
    if(!canCaptureEvolution(b))throw new Error('Primero necesitas capturar a '+getBioforma(b.evolucionaDe).nombre+'. El código no se ha consumido.');
    progreso.capturadas.push(b.id);progreso.ultimaBioforma=b.id;progreso.codigosUsados.push(norm);progreso.intentos.push({accion:'captura',bioforma:b.id,fecha:now});
    actualizarLogros(false);guardarProgreso();return {kind:'capture',bioforma:b.id};
  }
  const sector=SECTORES_CIUDAD.find(s=>normalizeDemoCode(s.codigoActivacion)===norm),gym=GIMNASIOS_BIONOVA.find(g=>normalizeDemoCode(g.codigoInicio)===norm),entity=sector||gym;
  if(!entity)throw new Error('Código no reconocido. Revisa el código entregado por tu docente.');
  const kind=sector?'sector':'gimnasio',key=sector?'sectores':'gimnasios';progreso[key]??={abiertos:{}};
  if(progreso[key].abiertos[entity.id])return {kind,duplicate:true,message:entity.nombre+' ya estaba activado.'};
  progreso[key].abiertos[entity.id]={abierto:true,fecha:now,codigo:sector?entity.codigoActivacion:entity.codigoInicio};progreso.codigosUsados.push(norm);progreso.intentos.push({accion:kind,id:entity.id,fecha:now});guardarProgreso();
  return {kind,message:entity.nombre+' activado en la demo local.'};
}
const fieldRedeem=redeem;
redeem=async function(inputId){
  if(!sesion?.preview)return fieldRedeem(inputId);
  if(busy)return;const code=document.getElementById(inputId)?.value.trim();if(!code){toast('Ingresa el código de tu docente.','warn');return;}
  try{const data=redeemLocal(code);render();if(data.kind==='capture'&&!data.duplicate)secuenciaCaptura(getBioforma(data.bioforma));else toast(data.message);}catch(e){toast(e.message,'warn');}
};
const fieldRenderCodigo=renderCodigo;
renderCodigo=function(){return fieldRenderCodigo().replace('Cada captura confirmada queda guardada antes de la animación.',sesion?.preview?'Las capturas de prueba se guardan en este navegador.':'Cada captura confirmada queda guardada antes de la animación.')+(sesion?.preview?`<details class="demo-lab"><summary>Códigos de ejemplo para probar</summary><p>Prueba la cadena de Nimbel: <code>CAP-NIMBEL-104</code> → <code>CAP-AURALIS-216</code> → <code>CAP-PRISMARA-337</code>. La etapa anterior es obligatoria. También puedes activar <code>SEC-AURORA-001</code> y <code>GYM-AURORA-001</code>.</p><p>Este laboratorio es local. No acredita actividades ni guarda progreso real en Sheets.</p></details>`:'');};
refreshCloud=async function(){if(sesion?.preview){guardarProgreso();toast(previewStored?'La demo está guardada en este navegador.':'Guardado persistente bloqueado. No cierres esta sesión.','warn');return;}if(busy)return;busy=true;setStatus('Consultando…');try{applyCloud(await api('load'));render();}catch(e){setStatus('Sin confirmar · reintenta');toast(e.message,'warn');}finally{busy=false;}};
previewCapture=function(){if(!sesion?.preview||busy)return;redeemLocal(DEMO_CAPTURE_CODES[0]);render();secuenciaCaptura(BIOFORMAS[0]);};
const fieldToggleCRT=toggleCRT;
toggleCRT=async function(){await fieldToggleCRT();if(sesion?.preview)render();};
const fieldRenderRespaldo=renderRespaldo,fieldRenderAyuda=renderAyuda;
renderRespaldo=function(){return (sesion?.preview?'<aside class="preview-banner">Este respaldo corresponde a una demo guardada solo en tu navegador. Las cuentas y la recuperación en otro equipo esperan la conexión con Google Sheets.</aside>':'')+fieldRenderRespaldo();};
renderAyuda=function(){return (sesion?.preview?'<aside class="preview-banner">Modo local: puedes probar los 47 códigos y las animaciones. No hay inicio de sesión real ni sincronización entre dispositivos todavía.</aside>':'')+fieldRenderAyuda()+`<section class="card" style="margin-top:16px"><h3>Tu avatar y tu paisaje</h3><p>Cambia tu identidad visual y el entorno desde tu tarjeta de explorador. Las ilustraciones completas aparecen en la BioDex; los recortes PNG animan el dispositivo.</p><button onclick="go('perfil')">Personalizar explorador →</button></section>`;};
