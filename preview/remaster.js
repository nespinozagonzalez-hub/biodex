/* BioDex 2 · Sin cuestionarios. El servidor es la fuente de verdad. */
"use strict";
let sesion = null, busy = false, accessMode = 'login', cloudStatus = 'Sin sesión';
const CONFIG = window.BIODEX_CONFIG || {endpoint:''};
const originalBioformaSVG = renderBioformaSVG;
const originalCaptureSequence=secuenciaCaptura, originalCaptureClose=cerrarCapturaOverlay;
secuenciaCaptura=function(b){
  const overlay=document.getElementById('captureOverlay');overlay.innerHTML='';
  document.getElementById('app').setAttribute('inert','');
  originalCaptureSequence(b);overlay.setAttribute('role','dialog');overlay.setAttribute('aria-label','Bioforma capturada: '+b.nombre);overlay.querySelector('button')?.focus();
};
cerrarCapturaOverlay=function(id){document.getElementById('app').removeAttribute('inert');originalCaptureClose(id);};
// Los territorios conservan su identidad, pero no imponen un programa de Ciencias.
SECTORES_CIUDAD.forEach(sector=>sector.gimnasios.forEach(gym=>{
  gym.objetivo='Completa el desafío acordado con tu docente. La actividad puede pertenecer a cualquier asignatura; su código reconoce tu avance.';
}));
GIMNASIOS_BIONOVA.forEach(gym=>{gym.objetivo='Desafío definido por tu docente. Completa la actividad y recibe los códigos de las bioformas correspondientes.';});

// Las ilustraciones mantienen el SVG original como respaldo de carga.
renderBioformaSVG = function(input, captured=false, size='card', opts={}) {
  const b = getBioformaSVGData(input), px = typeof size === 'number' ? size : 160, art=opts.art===true&&captured;
  return `<div class="portrait ${captured?'revealed':'silhouette'} ${art?'full-art':'cutout'}" style="--portrait-size:${px}px" data-bioforma="${b.id}">
    <div class="portrait-fallback">${originalBioformaSVG(input,captured,size,opts)}</div>
    <img src="assets/${art?'bioformas/'+b.id+'.webp':'cutouts/'+b.id+'.png'}" alt="${captured?escapeHtml(b.nombre):'Silueta de '+escapeHtml(b.nombre)}" loading="lazy" onload="this.parentElement.classList.add('image-ready')" onerror="this.remove()">
  </div>`;
};

function sessionKey(){return 'biodex_session_v2';}
function rememberSession(){
  try{sessionStorage.setItem(sessionKey(),JSON.stringify(sesion));return true;}
  catch(e){return false;}
}
function forgetSession(){try{sessionStorage.removeItem(sessionKey());}catch(e){}}
function setStatus(message) {
  cloudStatus=message;
  const el=document.getElementById('cloudStatus');
  if(el)el.textContent=message;
}
let cloudLoadingTimer=null, cloudLoadingFocus=null;
function showCloudLoading(action){
  let box=document.getElementById('cloudLoading');
  if(!box){
    box=document.createElement('dialog');box.id='cloudLoading';box.className='cloud-loading';
    box.setAttribute('aria-labelledby','cloudLoadingTitle');box.setAttribute('aria-describedby','cloudLoadingMessage');
    box.addEventListener('cancel',event=>event.preventDefault());
    box.innerHTML='<div class="loading-topline"><span class="power-led"></span> BIONOVA / ENLACE DE CAMPO <span>●</span></div><div class="loading-radar" aria-hidden="true"><i></i><b>✦</b></div><span class="eyebrow">ARCHIVO DE EXPLORADORES</span><h2 id="cloudLoadingTitle"></h2><p id="cloudLoadingMessage" role="status" aria-live="polite"></p><div class="loading-track" aria-hidden="true"><span></span></div><p class="loading-footnote">COLECCIÓN · IDENTIDAD · TERRITORIOS</p>';
    document.body.appendChild(box);
  }
  cloudLoadingFocus=document.activeElement;
  document.getElementById('cloudLoadingTitle').textContent=action==='register'?'Preparando tu expedición…':'Recuperando tu expedición…';
  document.getElementById('cloudLoadingMessage').textContent=action==='register'?'Creando tu pasaporte y guardando tu identidad de explorador.':'Verificando tu acceso y buscando tu colección, avatar y paisaje.';
  if(!box.open){if(box.showModal)box.showModal();else box.setAttribute('open','');}
  clearTimeout(cloudLoadingTimer);
  cloudLoadingTimer=setTimeout(()=>{document.getElementById('cloudLoadingMessage').textContent='El archivo sigue respondiendo. Mantén esta ventana abierta unos instantes más.';},8000);
}
function hideCloudLoading(){
  clearTimeout(cloudLoadingTimer);
  const box=document.getElementById('cloudLoading');
  if(box?.close)box.close();else box?.removeAttribute('open');
  if(cloudLoadingFocus?.isConnected)cloudLoadingFocus.focus?.();
  cloudLoadingFocus=null;
}
async function api(action, fields={}) {
  if(!CONFIG.endpoint)throw new Error('Falta conectar Google Sheets. Puedes explorar la vista previa.');
  if(!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(CONFIG.endpoint))throw new Error('La URL de conexión no es una implementación /exec válida.');
  const loading=['login','register','load'].includes(action);
  if(loading)showCloudLoading(action);
  const controller=new AbortController(), timer=setTimeout(()=>controller.abort(),45000);
  try {
    const response=await fetch(CONFIG.endpoint, {
      method:'POST', redirect:'follow', signal:controller.signal,
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify({action,token:sesion?.token,...fields})
    });
    if(!response.ok)throw new Error('El servidor no pudo atender la solicitud.');
    const data=await response.json();
    if(!data.ok)throw new Error(data.error||'No se pudo completar la operación.');
    return data;
  } catch(error) {
    if(error.name==='AbortError')throw new Error('La conexión tardó demasiado. Reintenta: los códigos no se duplican.');
    if(error instanceof TypeError)throw new Error('Sin conexión con BioDex. No se confirmó ningún cambio; vuelve a intentar.');
    throw error;
  } finally {clearTimeout(timer);if(loading)hideCloudLoading();}
}
function applyCloud(data) {
  progreso={...defaultProgress(),...data.progreso};
  progreso.configuracion={crt:false,...data.progreso.configuracion};
  const remembered=rememberSession();
  setStatus(remembered?'Guardado en BioNova':'Guardado en BioNova · ingresa otra vez al recargar');
  document.body.classList.toggle('crt',progreso.configuracion.crt===true);
}
function cargarProgreso(){progreso=defaultProgress();}
// Esta función se conserva para las pantallas heredadas. Nunca sube un snapshot
// del navegador: capturas y activaciones solo se escriben mediante acciones validadas.
function guardarProgreso(){
  if(sesion?.preview){try{sessionStorage.setItem('biodex_preview_v2',JSON.stringify(progreso));}catch(e){/* La vista previa puede funcionar solo en memoria. */}}
}
async function init(){
  injectBioformaSVGStyles(); progreso=defaultProgress();
  document.body.classList.remove('crt');
  try {sesion=JSON.parse(sessionStorage.getItem(sessionKey()));}catch(e){sesion=null;}
  if(sesion?.token && CONFIG.endpoint) {
    renderLoading();
    try{applyCloud(await api('load'));render();return;}
    catch(e){sesion=null;forgetSession();render();toast(e.message,'warn');return;}
  }
  sesion=null;render();
}
function renderLoading(){document.getElementById('app').innerHTML='<section class="hero"><div class="rpg-window"><span class="rpg-title">BIONOVA / FIELD-02</span><h2>Conectando tu dispositivo…</h2><p>Tu expedición está a un paso de continuar.</p></div></section>';}
function changeAccess(mode){if(busy)return;accessMode=mode;render();}
function renderRegistro(){
  const create=accessMode==='register';
  return `<section class="access-layout"><div class="access-art"><span class="eyebrow">CRÓNICAS DE BIONOVA · VOL. II</span><h1>Todo gran hallazgo<br>comienza con<br><em>tu curiosidad.</em></h1><p>Un mundo por descubrir. Treinta bioformas por encontrar.<br>Tu próxima aventura comienza en el aula.</p><div class="access-creature">${renderBioformaSVG(BIOFORMAS[0],true,260)}</div><span class="art-caption">NIMBEL · EL PRIMER DESTELLO</span></div>
  <div class="register rpg-window"><span class="rpg-title">Tu pasaporte de exploración</span><h2>${create?'Comienza tu expedición':'Regresa a BioNova'}</h2><p class="muted">Tu nombre y tu clave de seis dígitos recuperan tu colección en cualquier dispositivo.</p>
  <div class="access-tabs"><button class="${!create?'active':'ghost'}" onclick="changeAccess('login')">Ingresar</button><button class="${create?'active':'ghost'}" onclick="changeAccess('register')">Crear cuenta</button></div>
  <form onsubmit="event.preventDefault();registrarJugador()"><label for="regNombre">Nombre de explorador/a</label><input id="regNombre" autocomplete="username" placeholder="Nombre y apellido o alias acordado" maxlength="60" required><p class="small muted">Usa un nombre único. No necesitas correo ni RUT.</p><label for="regClave">Clave de 6 dígitos</label><input id="regClave" type="password" inputmode="numeric" pattern="[0-9]{6}" minlength="6" maxlength="6" autocomplete="${create?'new-password':'current-password'}" placeholder="••••••" required>
  ${create?'<label for="regConfirmar">Repite tu clave</label><input id="regConfirmar" type="password" inputmode="numeric" pattern="[0-9]{6}" minlength="6" maxlength="6" autocomplete="new-password" required>':''}
  <button class="primary access-submit" type="submit" ${!CONFIG.endpoint?'disabled':''}>${create?'Crear mi pasaporte':'Continuar mi aventura'} →</button><p id="authError" class="form-error" role="alert"></p></form>
  ${!CONFIG.endpoint?'<div class="connection-note">La conexión con Google Sheets está pendiente. Esta versión permite explorar la interfaz, pero aún no crear cuentas ni guardar en la nube.</div>':''}
  <button class="ghost" onclick="startPreview()">Explorar vista previa</button><p class="footer-note">Actividad del docente → código → captura animada.<br>Si olvidas tu clave, solicita ayuda a tu docente.</p></div></section>`;
}
async function registrarJugador(){
  if(busy)return;
  const name=document.getElementById('regNombre').value.trim().replace(/\s+/g,' '), pin=document.getElementById('regClave').value;
  const err=document.getElementById('authError');err.textContent='';
  if(name.length<2||!/^\d{6}$/.test(pin)){err.textContent='Escribe un nombre y una clave de exactamente seis dígitos.';return;}
  if(accessMode==='register'&&pin!==document.getElementById('regConfirmar').value){err.textContent='Las claves no coinciden.';return;}
  document.getElementById('regClave').value='';
  const confirmPin=document.getElementById('regConfirmar');if(confirmPin)confirmPin.value='';
  busy=true;const submit=document.querySelector('.access-submit');if(submit){submit.disabled=true;submit.textContent='Consultando el archivo…';}
  try{
    const data=await api(accessMode,{name,pin,...(accessMode==='register'?profileDraft:{})});
    sesion={token:data.token,name:data.progreso.jugador};applyCloud(data);view='panel';render();
  }catch(e){err.textContent=e.message;}finally{busy=false;if(submit?.isConnected){submit.disabled=false;submit.textContent=accessMode==='register'?'Crear mi pasaporte →':'Continuar mi aventura →';}}
}
function startPreview(){
  if(busy)return;
  sesion={preview:true};progreso=defaultProgress();
  try{const saved=JSON.parse(sessionStorage.getItem('biodex_preview_v2'));if(saved)progreso={...progreso,...saved};}catch(e){}
  progreso.jugador='Explorador de muestra';setStatus('Vista previa · sin guardado en nube');view='panel';render();
}
async function logout(){
  if(busy){toast('Espera a que termine el guardado.','warn');return;}
  if(sesion?.token){busy=true;try{await api('logout');}catch(e){/* El token local se elimina aunque no haya red. */}finally{busy=false;}}
  sesion=null;progreso=defaultProgress();forgetSession();closeModal();closeDialogue();view='panel';render();
}
function renderShell(){return `<header class="topbar"><div class="brand"><div class="logo">B<span>✧</span></div><div><h1>BioDex<span class="brand-dot">.</span></h1><div class="subtitle">CRÓNICAS DE BIONOVA</div></div></div><div class="account"><span>${escapeHtml(progreso.jugador)}</span><small id="cloudStatus">${escapeHtml(cloudStatus)}</small><button class="ghost" onclick="refreshCloud()">Actualizar</button><button class="ghost" onclick="logout()">Salir</button></div></header>
  ${sesion?.preview?'<aside class="preview-banner">VISTA PREVIA · Sin cuenta ni guardado en Google Sheets. Las capturas de muestra no son progreso real.</aside>':''}
  <nav class="nav" aria-label="Exploración">${navButton('panel','⌂ Refugio')}${navButton('biodex','▦ BioDex')}${navButton('codigo','✧ Capturar')}${navButton('mapa','⌖ Territorios')}${navButton('gimnasios','◇ Gimnasios')}${navButton('lineas','⇄ Evoluciones')}${navButton('inventario','▣ Mochila')}${navButton('logros','★ Logros')}${navButton('respaldo','↯ Archivo')}${navButton('ayuda','? Guía')}</nav><main id="view"></main><footer class="expedition-footer">BIODEX · Un mismo mundo, infinitas formas de aprender.<span>Expedición 02 / ${CONFIG.version||'2.0'}</span></footer>`;}
const legacyRenderView=renderView;
renderView=function(){if(view==='gimnasios')document.getElementById('view').innerHTML=renderGimnasiosBioNova();else legacyRenderView();};
const legacyPanel=renderPanel;
renderPanel=function(){return `<section class="expedition-hero"><div class="hero-copy"><span class="eyebrow">TU DIARIO DE EXPEDICIÓN</span><h2>El mundo guarda secretos.<br><em>Sal a descubrirlos.</em></h2><p>Aprende, colabora y supera los desafíos de tu docente.<br>Cada código abre una nueva historia en tu colección.</p><button class="primary" onclick="go('codigo')">Registrar un hallazgo <span>→</span></button></div><div class="hero-specimen">${renderBioformaSVG(getBioforma(progreso.ultimaBioforma)||BIOFORMAS[0],true,300)}<span class="specimen-label">${escapeHtml((getBioforma(progreso.ultimaBioforma)||BIOFORMAS[0]).nombre)} / ARCHIVO BIONOVA</span></div></section>${legacyPanel()}`;};
function renderCodigo(){return `<section class="rpg-window capture-terminal"><span class="rpg-title">El portal de los hallazgos</span><h2>Un código. Una nueva historia.</h2><p class="muted">Tu docente decide qué actividades permiten obtener códigos, en cualquier asignatura. No hay cuestionarios ni reflexiones obligatorias.</p><div class="terminal-orb">${renderBioformaSVG(getBioforma(progreso.ultimaBioforma)||BIOFORMAS[0],true,160)}</div><form onsubmit="event.preventDefault();validarCodigo()"><label for="codigoInput">Código entregado por tu docente</label><input id="codigoInput" autocomplete="off" placeholder="CAP-… / SEC-… / GYM-…" maxlength="80" required><div class="modal-actions"><button type="submit" class="primary" ${busy?'disabled':''}>Abrir el portal →</button><button type="reset" class="ghost">Limpiar</button></div></form><div class="terminal-lines"><div class="info">✧ Los códigos originales se mantienen.</div><div class="ok">✧ Cada captura confirmada queda guardada antes de la animación.</div><div class="warn">✧ Para evolucionar, necesitas la bioforma anterior.</div></div>${sesion?.preview?'<button class="ghost" onclick="previewCapture()">Probar animación con Nimbel</button>':''}</section>`;}
async function refreshCloud(){
  if(sesion?.preview){toast('Esta es una vista previa, sin cuenta conectada.','warn');return;}
  if(busy)return;busy=true;setStatus('Consultando…');
  try{applyCloud(await api('load'));render();}catch(e){setStatus('Sin confirmar · reintenta');toast(e.message,'warn');}finally{busy=false;}
}
async function redeem(inputId){
  if(busy)return;
  const input=document.getElementById(inputId), code=input?.value.trim();
  if(!code){toast('Ingresa el código de tu docente.','warn');return;}
  if(sesion?.preview){toast('Los códigos reales se activan al ingresar con tu cuenta. Usa la captura de muestra para ver la animación.','warn');return;}
  busy=true;setStatus('Validando y guardando…');
  document.querySelectorAll('button[type="submit"]').forEach(b=>b.disabled=true);
  try{
    const data=await api('redeem',{code});applyCloud(data);render();
    if(data.kind==='capture'&&!data.duplicate){const b=getBioforma(data.bioforma);secuenciaCaptura(b);}
    else toast(data.message||'Activación guardada.');
  }catch(e){setStatus('Sin cambio confirmado');toast(e.message,'warn');}
  finally{busy=false;document.querySelectorAll('button[type="submit"]').forEach(b=>b.disabled=false);}
}
function validarCodigo(){return redeem('codigoInput');}
function validarCodigoSector(){return redeem('sectorCodeInput');}
function validarCodigoGimnasio(){return redeem('gymCodeInput');}
function canCaptureEvolution(b){return !b.evolucionaDe||progreso.capturadas.includes(b.evolucionaDe);}
function previewCapture(){
  if(!sesion?.preview||busy)return;
  const b=BIOFORMAS[0];if(!progreso.capturadas.includes(b.id))progreso.capturadas.push(b.id);
  progreso.ultimaBioforma=b.id;actualizarLogros(false);guardarProgreso();render();secuenciaCaptura(b);
}
async function toggleCRT(){
  if(busy)return;
  const crt=!progreso.configuracion.crt;
  if(sesion?.preview){progreso.configuracion.crt=crt;guardarProgreso();document.body.classList.toggle('crt',crt);return;}
  busy=true;try{applyCloud(await api('settings',{crt}));render();}catch(e){toast(e.message,'warn');}finally{busy=false;}
}
function renderRespaldo(){return `<section class="rpg-window"><span class="rpg-title">Archivo de expedición</span><h2>Tu historia permanece.</h2><p class="muted">Al iniciar sesión se recuperan tus capturas, sectores, gimnasios, logros y preferencias. Cada activación se guarda al confirmarse.</p><div class="grid two"><div class="card"><div class="card-title">Copia de consulta</div><p>Puedes conservar una copia de tu colección. No contiene tu clave ni tu sesión.</p><button onclick="exportarProgreso()">Generar respaldo</button><textarea id="exportBox" rows="6" aria-label="Respaldo generado" readonly></textarea><div class="modal-actions"><button onclick="copiarExport()">Copiar</button><button onclick="descargarExport()">Descargar</button></div></div><div class="card"><div class="card-title">¿Tienes una colección anterior?</div><p>Tu progreso local antiguo no se borró. Exporta el respaldo y entrégalo a tu docente para que revise su incorporación. No se sobrescribe la colección de una cuenta con un archivo sin validar.</p><button onclick="exportLegacy()">Recuperar respaldo anterior</button><textarea id="importBox" rows="4" aria-label="Respaldo antiguo para revisión" placeholder="También puedes pegar un respaldo anterior"></textarea><button class="ghost" onclick="importarProgreso()">Solicitar revisión al docente</button></div></div><div class="card" style="margin-top:16px"><h3>Sesión y privacidad</h3><p>Salir no borra tu colección. No compartas tu clave. En equipos compartidos, cierra la sesión al terminar.</p><button class="ghost" onclick="logout()">Cerrar sesión</button></div></section>`;}
function exportLegacy(){
  let old;try{old=JSON.parse(localStorage.getItem(STORAGE_KEY));}catch(e){}
  if(!old?.jugador){toast('No se encontró una colección antigua en este navegador.','warn');return;}
  document.getElementById('importBox').value=btoa(unescape(encodeURIComponent(JSON.stringify({version:'legacy',progreso:old}))));toast('Respaldo anterior recuperado. Puedes enviarlo a revisión.');
}
async function importarProgreso(){
  if(busy)return;
  try{
    const raw=document.getElementById('importBox').value.trim();
    const payload=JSON.parse(decodeURIComponent(escape(atob(raw))));
    if(!payload.progreso||!Array.isArray(payload.progreso.capturadas))throw new Error('El respaldo no tiene el formato esperado.');
    if(sesion?.preview)throw new Error('Ingresa con tu cuenta para solicitar la revisión.');
    if(!confirm('Enviar al docente una solicitud para revisar esta colección anterior?'))return;
    busy=true;await api('migration',{legacy:payload.progreso});toast('Solicitud guardada. Tu colección actual no se ha modificado.');
  }catch(e){toast(e.message||'Respaldo inválido.','warn');}finally{busy=false;}
}
function reiniciarProgreso(){toast('Tu colección está protegida. Solicita cualquier reinicio a tu docente.','warn');}
function renderAyuda(){return `<section class="rpg-window"><span class="rpg-title">Guía del explorador</span><h2>Aprender abre caminos.</h2><div class="grid two"><article class="card"><h3>01 / Completa una actividad</h3><p>Tu docente propone el desafío, en la asignatura que corresponda. BioDex no evalúa respuestas.</p></article><article class="card"><h3>02 / Recibe tu código</h3><p>Ingresa el código de captura, sector o gimnasio. Conservamos los códigos de la edición original.</p></article><article class="card"><h3>03 / Descubre y evoluciona</h3><p>La captura se guarda antes de reproducir la animación. Las etapas dos y tres requieren la bioforma anterior; un intento bloqueado no consume el código.</p></article><article class="card"><h3>04 / Recupera tu expedición</h3><p>Usa el mismo nombre y clave de seis dígitos. Pulsa Actualizar si avanzaste desde otro dispositivo. Si pierdes la clave, tu docente puede restablecerla sin perder tu colección.</p></article><article class="card"><h3>Conexión y guardado</h3><p>Sin conexión no se confirman capturas. Si una solicitud tarda, vuelve a intentarlo: los códigos son idempotentes y no duplican recompensas.</p></article><article class="card"><h3>Efecto retro opcional</h3><p>Las animaciones de captura se mantienen. Puedes alternar la textura de pantalla clásica.</p><button onclick="toggleCRT()">Alternar textura CRT</button></article></div></section>`;}

// Accesibilidad: foco al abrir/cerrar una ficha y Escape para salir del diálogo.
let returnFocus=null;
const oldOpenModal=openModal, oldCloseModal=closeModal;
openModal=function(html){returnFocus=document.activeElement;oldOpenModal(html);const box=document.getElementById('modalContent');box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.querySelector('button,input')?.focus();};
closeModal=function(event){if(event&&event.target.id!=='modalBack')return;oldCloseModal(event);returnFocus?.focus?.();};
document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeModal();closeDialogue();}if(event.key==='Tab'&&document.getElementById('modalBack').classList.contains('show')){const items=[...document.getElementById('modalContent').querySelectorAll('button,input,select,textarea,[tabindex="0"]')];const first=items[0],last=items[items.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}});
