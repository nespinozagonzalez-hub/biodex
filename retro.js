/* BioDex FIELD-02 · Identidad de explorador y cuentas conectadas. Edición definitiva. */
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
const DRAFT_KEY='biodex_field_profile_v3';
const profileDefaults={avatarId:'aurora',landscapeId:'bosque'};
function cleanProfile(value={}){
  return {avatarId:AVATARS.some(a=>a.id===value.avatarId)?value.avatarId:'aurora',landscapeId:LANDSCAPES.some(s=>s.id===value.landscapeId)?value.landscapeId:'bosque'};
}
function readLocal(key){try{return JSON.parse(localStorage.getItem(key));}catch(e){return null;}}
function writeLocal(key,data){try{localStorage.setItem(key,JSON.stringify(data));return true;}catch(e){return false;}}
let profileDraft=cleanProfile(readLocal(DRAFT_KEY)||{});
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
  busy=true;try{applyCloud(await api('settings',valid));render();toast('Personalización guardada.');}catch(e){toast(e.message,'warn');}finally{busy=false;}
}

renderRegistro=function(){
  const create=accessMode==='register';applyLandscape(profileDraft.landscapeId);
  return `<div class="welcome-device"><div class="device-badge"><span class="power-led"></span> BIONOVA / FIELD-02 <span>ARCHIVO DE BIOFORMAS</span></div>
  <section class="access-layout"><div class="access-art"><div class="welcome-landscape"><div class="scene-topline"><span>SEÑAL ENCONTRADA</span><span>30 ESPECIES / 10 RUTAS</span></div><div class="welcome-title"><span class="eyebrow">TU EXPEDICIÓN EMPIEZA AQUÍ</span><h1>Un pequeño dispositivo.<br>Un mundo por descubrir.</h1></div><div class="welcome-trainer" aria-label="Tu personaje entrenador"><div id="welcomeAvatar">${avatarImage(profileDraft.avatarId)}</div></div><div class="scene-bottomline"><span>⌖ ${LANDSCAPES.find(s=>s.id===profileDraft.landscapeId).name}</span><span>● SISTEMA LISTO</span></div></div><div class="welcome-caption"><span>EXPLORA · DESCUBRE · COLECCIONA</span><p>Tu docente propone el desafío. Tú escribes la aventura.</p></div></div>
  <div class="register rpg-window"><span class="rpg-title">PASAPORTE DE CAMPO</span><h2>${create?'Elige quién serás.':'Bienvenido a BioNova.'}</h2><p class="access-hint">${create?'Crea tu nombre único y una clave de seis dígitos.':'Tu expedición continúa donde la dejaste. Ingresa con tu nombre y tu clave.'}</p>
  <div class="access-tabs"><button type="button" class="${!create?'active':'ghost'}" onclick="changeAccess('login')">Ingresar</button><button type="button" class="${create?'active':'ghost'}" onclick="changeAccess('register')">Crear personaje</button></div>
  <form onsubmit="event.preventDefault();registrarJugador()"><label for="regNombre">Nombre de explorador/a</label><input id="regNombre" autocomplete="username" maxlength="60" minlength="2" placeholder="Tu nombre o alias acordado" required><label for="regClave">Clave de 6 dígitos</label><input id="regClave" type="password" inputmode="numeric" pattern="[0-9]{6}" minlength="6" maxlength="6" autocomplete="${create?'new-password':'current-password'}" placeholder="••••••" required>
  ${create?'<label for="regConfirmar">Repite tu clave</label><input id="regConfirmar" type="password" inputmode="numeric" pattern="[0-9]{6}" minlength="6" maxlength="6" autocomplete="new-password" required>':''}
  ${create?`<p class="small muted">Elige la identidad de tu expedición. Podrás cambiarla desde tu perfil.</p>${renderProfileChoices('welcome')}`:''}
  <button class="primary access-submit" type="submit" ${!CONFIG.endpoint?'disabled':''}>${create?'Crear mi pasaporte':'Ingresar a BioNova'} →</button><p id="authError" class="form-error" role="alert"></p></form>
  ${!create?'<div class="passport-note"><span>'+fieldGlyph(3)+'</span><p>Tu colección, avatar y paisaje te esperan en tu cuenta. Cada hallazgo queda guardado automáticamente.</p></div>':''}
  <p class="footer-note">¿Olvidaste tu clave? Tu docente puede restablecerla sin borrar tu colección.</p></div></section><div class="device-bottom"><span>◧ BIODEX / EXPEDITION SYSTEM</span><span class="speaker-grille" aria-hidden="true">||||||||</span></div></div>`;
};

const baseApplyCloud=applyCloud;
applyCloud=function(data){baseApplyCloud(data);progreso.configuracion={...progreso.configuracion,...cleanProfile(progreso.configuracion)};applyLandscape(progreso.configuracion.landscapeId);};
const baseLogout=logout;
logout=async function(){const result=await baseLogout();if(!sesion)document.body.classList.remove('crt');return result;};

renderShell=function(){
  const profile=currentProfile(),avatar=AVATARS.find(a=>a.id===profile.avatarId),land=LANDSCAPES.find(s=>s.id===profile.landscapeId),count=baseCaptureCount();
  applyLandscape(profile.landscapeId);
  return `<div class="field-device"><header class="device-header"><div class="brand"><div class="device-lens" aria-hidden="true"><i></i></div><div><h1>BioDex<span> FIELD-02</span></h1><div class="subtitle">DISPOSITIVO DE EXPLORACIÓN / BIONOVA</div></div></div><div class="header-signals"><span><i class="power-led"></i> EN LÍNEA</span><button class="ghost" onclick="logout()">Salir ↗</button></div></header><div class="device-layout"><aside class="explorer-sidebar"><button class="explorer-card" onclick="go('perfil')" aria-label="Personalizar explorador"><div class="avatar-monitor">${avatarImage(profile.avatarId)}<span class="avatar-coordinates">ID / ${avatar.id.toUpperCase()}</span></div><strong>${escapeHtml(progreso.jugador)}</strong><small>${escapeHtml(getRango(count))}</small><span class="edit-profile">EDITAR PERFIL ↗</span></button><nav class="nav" aria-label="Exploración">${navButton('panel','⌂ Refugio')}${navButton('biodex','▦ BioDex')}${navButton('codigo','✧ Capturar')}${navButton('mapa','⌖ Territorios')}${navButton('gimnasios','◇ Gimnasios')}${navButton('lineas','⇄ Evoluciones')}${navButton('inventario','▣ Mochila')}${navButton('logros','★ Logros')}${navButton('ayuda','? Guía')}</nav><div class="sidebar-counter"><b>${String(count).padStart(2,'0')}</b><span>/ 30<br>BIOFORMAS</span><div class="progress"><div style="width:${Math.round(count/30*100)}%"></div></div></div></aside><section class="device-screen"><div class="screen-status"><span>⌖ ${land.name}</span><span id="cloudStatus" role="status">${escapeHtml(cloudStatus)}</span><button class="ghost" onclick="refreshCloud()" aria-label="Actualizar progreso">↻</button></div><main id="view"></main></section></div><footer class="device-bottom"><div class="device-controls"><span class="dpad" aria-hidden="true">✚</span><span>BIODEX / FIELD SYSTEM<br><small>APRENDE · DESBLOQUEA · DESCUBRE</small></span></div><div class="physical-buttons"><button onclick="go('codigo')" aria-label="Capturar bioforma">A</button><button onclick="go('biodex')" aria-label="Abrir BioDex">B</button></div><span class="speaker-grille" aria-hidden="true">||||||||</span></footer></div>`;
};
const fieldRenderView=renderView;
renderView=function(){if(view==='perfil'||view==='respaldo')document.getElementById('view').innerHTML=renderProfile();else fieldRenderView();};
const fieldGo=go;
go=function(target){fieldGo(target==='respaldo'?'perfil':target);window.scrollTo?.(0,0);};
function renderProfile(){
  const p=currentProfile();return `<section class="rpg-window profile-page"><span class="rpg-title">PERSONALIZA TU EXPEDICIÓN</span><h2>Tu identidad de campo.</h2><p class="muted">El avatar te acompaña en toda la BioDex. El paisaje cambia el inicio, el refugio y el entorno del dispositivo. Son elecciones estéticas: no modifican códigos ni recompensas.</p><div class="profile-preview">${avatarImage(p.avatarId)}<div><h3>${escapeHtml(progreso.jugador)}</h3><p>${escapeHtml(getRango(baseCaptureCount()))}</p><span class="pill">CUENTA DE EXPLORADOR</span></div></div>${renderProfileChoices('profile')}<button class="ghost" onclick="toggleCRT()" aria-pressed="${progreso.configuracion.crt===true}">Textura CRT: ${progreso.configuracion.crt?'activada':'desactivada'}</button><p class="small muted">Tus preferencias se guardan junto a tu colección.</p><div class="account-footer"><span>Tu progreso se guarda en tu cuenta. Ingresa con el mismo nombre y clave para continuar en otro equipo.</span><button class="ghost" onclick="logout()">Cerrar sesión ↗</button></div></section>`;
}
renderPanel=function(){
  const p=currentProfile(),land=LANDSCAPES.find(s=>s.id===p.landscapeId),count=baseCaptureCount();
  return `<section class="field-hero"><div class="scene-topline"><span>EXPLORACIÓN EN CURSO</span><span>FIELD-02 / ${String(count).padStart(2,'0')}:30</span></div><div class="field-hero-copy"><span class="eyebrow">${land.name.toUpperCase()}</span><h2>${escapeHtml(progreso.jugador)}</h2><p>Tu aventura comienza contigo.<br>Cada aprendizaje, un nuevo hallazgo.</p><button class="primary" onclick="go('codigo')">✧ Registrar hallazgo →</button></div><div class="field-trainer" aria-label="Tu personaje entrenador">${avatarImage(p.avatarId)}</div><span class="field-trainer-label">TU IDENTIDAD / ${AVATARS.find(a=>a.id===p.avatarId).name.toUpperCase()}</span></section><div class="field-summary">${stat('Colección',`${count} / 30`)}${stat('Territorios',`${Object.keys(progreso.sectores?.abiertos||{}).length} / 7`)}${stat('Gimnasios',`${Object.keys(progreso.gimnasios?.abiertos||{}).length} / 10`)}${stat('Logros',`${progreso.logros.length} / 12`)}</div><div class="grid two field-actions"><article class="card"><span class="rpg-title">01 / ARCHIVO VIVO</span><h3>Tu BioDex, página a página.</h3><p class="muted">Siluetas por reconocer, historias por revelar. Revisa tus hallazgos y las diez líneas evolutivas.</p><button class="ghost" onclick="go('biodex')">Abrir colección →</button></article><article class="card"><span class="rpg-title">02 / TU PRÓXIMA MISIÓN</span><h3>La aventura también está en el aula.</h3><p class="muted">Completa la actividad que proponga tu docente, en cualquier asignatura. Sin preguntas dentro del dispositivo.</p><button class="ghost" onclick="go('mapa')">Explorar territorios →</button></article></div>`;
};

// La colección y las fichas conservan el arte completo. El escáner y la captura
// usan los recortes PNG, sin un rectángulo de paisaje alrededor de la criatura.
function withDetailedArt(html){
  return html.replace(/class="portrait revealed cutout( mega-portrait)?"([\s\S]*?)src="assets\/cutouts\/(B\d{3})\.png"/g,(_m,extra,attrs,id)=>`class="portrait revealed full-art${extra||''}"${attrs}src="assets/bioformas/${id}.webp"`);
}
const fieldBioformaCard=bioformaCard;
bioformaCard=function(b){return withDetailedArt(fieldBioformaCard(b));};
const fieldOpenModal=openModal;
openModal=function(html){fieldOpenModal(withDetailedArt(html));};

// Toda pantalla de colección requiere una cuenta autenticada.
const accountRender=render;
render=function(){if(!sesion?.token){progreso=defaultProgress();view='panel';}accountRender();};
const fieldRenderAyuda=renderAyuda;
renderAyuda=function(){return fieldRenderAyuda()+`<section class="card" style="margin-top:16px"><h3>Tu identidad de explorador</h3><p>Cambia tu avatar, paisaje y textura de pantalla desde Perfil. Cada elección se guarda en tu cuenta.</p><button onclick="go('perfil')">Personalizar explorador →</button></section>`;};

/* Iconografía de campo: emblemas vectoriales del dispositivo. */
function fieldGlyph(index){
  const shapes=[
    '<circle cx="50" cy="50" r="19"/><path d="M50 23v12m0 30v12M23 50h12m30 0h12"/>',
    '<path d="m50 21 20 29-20 29-20-29Z M30 50h40M50 21v58"/>',
    '<circle cx="50" cy="50" r="27"/><path d="m60 36-7 20-20 8 8-21Z"/>',
    '<path d="M26 28h48v47H26zM35 40h30M35 50h30M35 60h18"/>',
    '<path d="m50 20 8 19 21 2-16 14 5 23-18-12-18 12 5-23-16-14 21-2Z"/>',
    '<path d="M29 29h42v18c0 17-42 17-42 0Zm21 30v16M36 78h28M29 35H18v11c0 10 12 10 12 10m41-21h11v11c0 10-12 10-12 10"/>',
    '<path d="m23 38 13-12 14 12 14-12 13 12-9 34H32Z M28 54h44"/>',
    '<path d="m29 57 21-25 21 25M50 32v44M29 31h42"/>',
    '<circle cx="25" cy="63" r="9"/><circle cx="50" cy="39" r="9"/><circle cx="75" cy="63" r="9"/><path d="m32 56 12-11m12 0 12 11M34 63h32"/>',
    '<path d="m50 18 8 20 22 8-22 9-8 24-8-24-22-9 22-8Z"/>',
    '<path d="m50 20 27 17-10 33-17 12-17-12-10-33ZM23 37h54M33 70l17-50 17 50"/>',
    '<path d="M29 31c28 0 14 38 42 38M29 69c28 0 14-38 42-38M32 42h36M32 58h36"/>'
  ];
  return `<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${shapes[index%shapes.length]}</g></svg>`;
}
function fieldMedal(index){return `<div class="field-medal" aria-hidden="true"><span class="medal-ribbon"></span><div class="medal-face"><span>${fieldGlyph(index)}</span></div></div>`;}
const GYM_SCENES=['bosque','prisma','bruma','arcana','bruma','arcana','prisma','bruma','arcana','bosque'];
let gymFilter='todos';
function changeGymFilter(key){if(!['todos','cerrado','activo','completado'].includes(key))return;gymFilter=key;renderView();}
function gymMatches(gym){const state=getGymEstado(gym);return gymFilter==='todos'||(gymFilter==='activo'?['abierto','progreso'].includes(state):state===gymFilter);}
renderGimnasiosBioNova=function(){
  ensureGymProgress();
  const open=GIMNASIOS_BIONOVA.filter(g=>getGymEstado(g)!=='cerrado').length,complete=GIMNASIOS_BIONOVA.filter(g=>getGymEstado(g)==='completado').length;
  const gyms=GIMNASIOS_BIONOVA.filter(gymMatches);
  return `<section class="guild-page"><header class="guild-hero"><div><span class="eyebrow">LA LIGA DE EXPLORADORES</span><h2>Diez rutas.<br>Tu propia aventura.</h2><p>Cada gimnasio guarda un nuevo desafío.<br>Tu docente te entrega la llave para entrar.</p></div><span class="guild-coordinate">BIONOVA / GREMIO DE CAMPO</span></header><div class="guild-stats"><span><b>${String(open).padStart(2,'0')}</b> / 10 abiertos</span><span><b>${String(complete).padStart(2,'0')}</b> completados</span><span><b>${String(progreso.capturadas.length).padStart(2,'0')}</b> hallazgos</span></div><form class="guild-unlock" onsubmit="event.preventDefault();validarCodigoGimnasio()"><div><span class="eyebrow">TU PRÓXIMO DESTINO</span><label for="gymCodeInput">Activa un gimnasio</label></div><div class="guild-code-entry"><input id="gymCodeInput" placeholder="Código de tu docente" autocomplete="off" maxlength="80" required><button type="submit" class="primary" ${busy?'disabled':''}>Activar →</button></div></form><div class="guild-filter" role="group" aria-label="Filtrar gimnasios">${[['todos','Todas las rutas'],['cerrado','Por abrir'],['activo','En ruta'],['completado','Completados']].map(([key,label])=>`<button class="ghost ${gymFilter===key?'selected':''}" aria-pressed="${gymFilter===key}" onclick="changeGymFilter('${key}')">${label}</button>`).join('')}</div><div class="guild-grid">${gyms.map(renderGymCard).join('')}</div>${gyms.length?'':'<div class="guild-empty"><span>'+fieldGlyph(2)+'</span><h3>Una nueva ruta te espera.</h3><p>Aquí aparecerán los gimnasios de esta categoría cuando avances.</p><button class="ghost" onclick="changeGymFilter(\'todos\')">Ver todas las rutas</button></div>'}</section>`;
};
renderGymCard=function(gym){
  const index=GIMNASIOS_BIONOVA.findIndex(g=>g.id===gym.id),state=getGymEstado(gym),open=state!=='cerrado',p=getGymProgress(gym);
  return `<article class="guild-card ${state}" data-gym="${gym.id}"><div class="guild-card-scene" style="--gym-scene:url('assets/landscapes/${GYM_SCENES[index]}.webp')"><span class="guild-route">RUTA ${String(index+1).padStart(2,'0')}</span><span class="guild-state">${state==='cerrado'?'POR DESCUBRIR':gymEstadoLabel(state)}</span><span class="guild-insignia">${fieldGlyph(index)}</span></div><div class="guild-card-body"><span class="eyebrow">${escapeHtml(gym.zona)}</span><h3>${escapeHtml(gym.nombre)}</h3><p class="guild-story">${escapeHtml(gym.narrativa)}</p><div class="guild-progress-label"><span>${open?'Colección de esta ruta':'Esperando tu código'}</span><b>${open?p.count:0} / ${p.total}</b></div><div class="progress" role="progressbar" aria-label="Progreso de ${escapeHtml(gym.nombre)}" aria-valuenow="${open?p.count:0}" aria-valuemin="0" aria-valuemax="${p.total}"><div style="width:${open?p.pct:0}%"></div></div><div class="guild-specimens" aria-label="${open?'Hallazgos de esta ruta':'Tres hallazgos por descubrir'}">${open?gym.bioformas.map(id=>{const b=getBioforma(id),done=progreso.capturadas.includes(id);return `<span class="guild-specimen ${done?'found':''}">${done?renderBioformaSVG(b,true,66):'<i aria-hidden="true">◇</i>'}<small>${done?escapeHtml(b.nombre):'Por descubrir'}</small></span>`;}).join(''):'<span class="guild-secret">◇</span><span class="guild-secret">◇</span><span class="guild-secret">◇</span>'}</div><button class="${open?'primary':'ghost'}" onclick="${open?`verDetalleGym('${gym.id}')`:'enfocarCodigoGimnasio()'}">${state==='completado'?'Revisar expedición':open?'Explorar gimnasio':'Ingresar código'} <span>↗</span></button></div></article>`;
};
verDetalleGym=function(id){
  const gym=GIMNASIOS_BIONOVA.find(g=>g.id===id);if(!gym||getGymEstado(gym)==='cerrado'){enfocarCodigoGimnasio();return;}
  const i=GIMNASIOS_BIONOVA.indexOf(gym),p=getGymProgress(gym);
  openModal(`<div class="gym-detail"><div class="gym-detail-cover" style="background-image:linear-gradient(0deg,#102d26,transparent),url('assets/landscapes/${GYM_SCENES[i]}.webp')"><span class="eyebrow">RUTA ${String(i+1).padStart(2,'0')} / ${gymEstadoLabel(getGymEstado(gym))}</span><h2>${escapeHtml(gym.nombre)}</h2></div><p>${escapeHtml(gym.narrativa)}</p><p class="muted">Completa el desafío de tu docente y registra sus códigos en el escáner. Tu progreso en esta ruta: <b>${p.count} / ${p.total}</b>.</p><div class="gym-detail-bios">${gym.bioformas.map(id=>{const b=getBioforma(id),done=progreso.capturadas.includes(id);return `<article>${done?renderBioformaSVG(b,true,120,{art:true}):renderScanSymbol()}<h3>${done?escapeHtml(b.nombre):'Hallazgo pendiente'}</h3><span class="pill">${done?'Registrada':`Etapa ${b.etapa}`}</span></article>`;}).join('')}</div><div class="modal-actions"><button class="primary" onclick="closeModal();go('codigo')">Ir al escáner →</button><button class="ghost" onclick="closeModal()">Cerrar</button></div></div>`);
};
function achievementProgress(index){
  const caps=BIOFORMAS.filter(b=>progreso.capturadas.includes(b.id)),targets=[1,5,10,15,20,25,30];
  if(index<7)return {value:Math.min(caps.length,targets[index]),total:targets[index]};
  if(index===7)return {value:Number(caps.some(b=>b.etapa===2)),total:1};
  if(index===8)return {value:Math.max(0,...[...new Set(BIOFORMAS.map(b=>b.linea))].map(l=>caps.filter(b=>b.linea===l).length)),total:3};
  if(index===9||index===10)return {value:Number(caps.some(b=>b.rareza===(index===9?'Épica':'Legendaria'))),total:1};
  return {value:Number(caps.some(b=>['Aurora','Prisma','Nexo','Nova','Bruma','Lumen'].includes(b.tipo)))+Number(caps.some(b=>['Vector','Umbral','Arcana','Terra'].includes(b.tipo))),total:2};
}
renderLogros=function(){
  const count=progreso.logros.length;
  return `<section class="honors-page"><header class="honors-hero"><div><span class="eyebrow">EL MÉRITO DE EXPLORAR</span><h2>Pequeños hallazgos.<br>Grandes historias.</h2><p>Cada medalla cuenta una parte de tu expedición.</p><div class="honors-total"><b>${String(count).padStart(2,'0')}</b><span>/ 12<br>MEDALLAS OBTENIDAS</span></div></div><div class="honors-crest">${fieldMedal(5)}<span>BIONOVA / DISTINCIONES</span></div></header><div class="honors-grid">${LOGROS.map((l,i)=>{const done=progreso.logros.includes(l.id),p=achievementProgress(i);return `<article class="honor-card ${done?'earned':'pending'}" data-achievement="${l.id}" style="--medal-accent:${i<4?'#d4b785':i<8?'#acccbf':'#e7c16c'}">${fieldMedal(i)}<span class="honor-status">${done?'✓ OBTENIDA':'POR DESCUBRIR'}</span><h3>${escapeHtml(l.nombre)}</h3><p>${escapeHtml(l.desc)}</p><div class="honor-progress"><div class="progress" role="progressbar" aria-label="${escapeHtml(l.nombre)}" aria-valuenow="${p.value}" aria-valuemin="0" aria-valuemax="${p.total}"><div style="width:${Math.round(p.value/p.total*100)}%"></div></div><span>${p.value} / ${p.total}</span></div></article>`;}).join('')}</div></section>`;
};
renderInventario=function(){
  const items=[['Orbe de captura','Cada código de tu docente puede revelar un nuevo hallazgo.',0],['Núcleo evolutivo',serverFeatures.captureMode==='code-only'?'Las líneas cuentan la historia de cada forma; puedes capturarlas en cualquier orden.':'Las bioformas evolucionan cuando ya tienes su etapa anterior.',1],['Brújula BioNova','Sigue tus rutas y descubre nuevos territorios de exploración.',2],['Pasaporte de campo','Tu nombre y clave conservan tu colección, identidad y avances.',3],['Insignias de ruta','Diez gimnasios para acompañar los desafíos de tu docente.',4],['Medallas de expedición','Doce distinciones que cuentan tus descubrimientos.',5]];
  return `<section class="kit-page"><header class="kit-heading"><span class="eyebrow">SIEMPRE CONTIGO</span><h2>Tu equipo de campo.</h2><p class="muted">Todo lo que acompaña a una buena expedición.</p></header><div class="kit-grid">${items.map(([name,desc,index])=>`<article class="kit-card"><span class="kit-icon">${fieldGlyph(index)}</span><div><span class="eyebrow">EQUIPO / 0${index+1}</span><h3>${name}</h3><p>${desc}</p></div></article>`).join('')}</div></section>`;
};
