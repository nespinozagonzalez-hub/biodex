/* BioDex 2 · Sin cuestionarios. El servidor es la fuente de verdad. */
"use strict";
let sesion = null, busy = false, accessMode = 'login', cloudStatus = 'Sin sesión';
const CONFIG = window.BIODEX_CONFIG || {endpoint:''};
let serverFeatures={captureMode:'ordered',megaPrizes:0};
function captureRuleText(){return serverFeatures.captureMode==='code-only'?'Puedes capturar cualquier bioforma con su código, sin etapas previas ni gimnasios abiertos.':'Para evolucionar, necesitas la etapa anterior.';}
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
  if(!CONFIG.endpoint)throw new Error('No se pudo conectar el archivo de BioDex. Intenta nuevamente más tarde.');
  if(!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(CONFIG.endpoint))throw new Error('La URL de conexión no es una implementación /exec válida.');
  const loading=['login','register','load'].includes(action);
  if(loading)showCloudLoading(action);
  const controller=new AbortController(), timer=setTimeout(()=>controller.abort(),60000);
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
    if(error.name==='AbortError')throw new Error(action==='register'?'La confirmación tardó demasiado. Prueba Ingresar con el mismo nombre y clave: tu cuenta puede haberse creado.':'La conexión tardó demasiado. Vuelve a intentar; tu progreso confirmado se conserva y los códigos no se duplican.');
    if(error instanceof TypeError)throw new Error(action==='register'?'Se interrumpió la conexión. Prueba Ingresar con el nombre y la clave que acabas de crear antes de registrar otra cuenta.':'Sin conexión con BioDex. No se confirmó ningún cambio; vuelve a intentar.');
    throw error;
  } finally {clearTimeout(timer);if(loading)hideCloudLoading();}
}
function applyCloud(data) {
  serverFeatures={captureMode:'ordered',megaPrizes:0,...data.features};
  if(serverFeatures.captureMode==='code-only'&&filterStatus==='evo')filterStatus='todos';
  progreso={...defaultProgress(),...data.progreso};
  progreso.configuracion={crt:false,...data.progreso.configuracion};
  const remembered=rememberSession();
  setStatus(remembered?'Guardado en BioNova':'Guardado en BioNova · ingresa otra vez al recargar');
  document.body.classList.toggle('crt',progreso.configuracion.crt===true);
}
function cargarProgreso(){progreso=defaultProgress();}
// Esta función se conserva para las pantallas heredadas. Nunca sube un snapshot
// del navegador: capturas y activaciones solo se escriben mediante acciones validadas.
function guardarProgreso(){/* El servidor confirma cada cambio de la cuenta. */}
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
function renderRegistro(){return "";} // La portada FIELD-02 se define en retro.js.
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
  }catch(e){err.textContent=e.message;}finally{busy=false;if(submit?.isConnected){submit.disabled=false;submit.textContent=accessMode==='register'?'Crear mi pasaporte →':'Ingresar a BioNova →';}}
}
async function logout(){
  if(busy){toast('Espera a que termine el guardado.','warn');return;}
  if(sesion?.token){busy=true;try{await api('logout');}catch(e){/* El token local se elimina aunque no haya red. */}finally{busy=false;}}
  sesion=null;progreso=defaultProgress();forgetSession();closeModal();closeDialogue();view='panel';render();
}
function renderShell(){return "";} // Carcasa FIELD-02 en retro.js.
const legacyRenderView=renderView;
renderView=function(){if(view==='gimnasios')document.getElementById('view').innerHTML=renderGimnasiosBioNova();else legacyRenderView();};
function renderScanSymbol(){return `<div class="capture-signal" role="img" aria-label="Señal de bioforma desconocida"><div class="signal-ring"></div><div class="signal-orb"><svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 16 76 32 84 60 64 83 35 83 16 60 24 32Z"/><path d="M50 16v67M24 32l40 51M76 32 35 83M16 60h68"/></svg><span>?</span></div><span class="signal-coordinate">SEÑAL SIN IDENTIFICAR</span></div>`;}
function renderCodigo(){return `<section class="rpg-window capture-terminal"><span class="rpg-title">ESCÁNER DE CAMPO</span><h2>Un código.<br>Un nuevo hallazgo.</h2><p class="muted">Completa el desafío de tu docente e ingresa su código para descubrir qué espera al otro lado.</p>${renderScanSymbol()}<form onsubmit="event.preventDefault();validarCodigo()"><label for="codigoInput">Código entregado por tu docente</label><input id="codigoInput" autocomplete="off" placeholder="CAP-… / SEC-… / GYM-…" maxlength="80" required><div class="modal-actions"><button type="submit" class="primary" ${busy?'disabled':''}>Activar escáner →</button><button type="reset" class="ghost">Limpiar</button></div></form><div class="capture-rules"><span>01 / Ingresa tu código</span><span>02 / Confirma tu hallazgo</span><span>03 / Amplía tu colección</span></div><p class="small muted">Cada hallazgo se guarda en tu cuenta antes de la animación. ${captureRuleText()}</p></section>`;}
async function refreshCloud(){
  if(busy)return;busy=true;setStatus('Consultando…');
  try{applyCloud(await api('load'));render();}catch(e){setStatus('Sin confirmar · reintenta');toast(e.message,'warn');}finally{busy=false;}
}
async function redeem(inputId){
  if(busy)return;
  const input=document.getElementById(inputId), code=input?.value.trim();
  if(!code){toast('Ingresa el código de tu docente.','warn');return;}
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
function canCaptureEvolution(b){return serverFeatures.captureMode==='code-only'||!b.evolucionaDe||progreso.capturadas.includes(b.evolucionaDe);}
async function toggleCRT(){
  if(busy)return;
  const crt=!progreso.configuracion.crt;
  busy=true;try{applyCloud(await api('settings',{crt}));render();}catch(e){toast(e.message,'warn');}finally{busy=false;}
}
function reiniciarProgreso(){toast('Tu colección está protegida. Solicita cualquier reinicio a tu docente.','warn');}
function renderAyuda(){return `<section class="rpg-window"><span class="rpg-title">Guía del explorador</span><h2>Aprender abre caminos.</h2><div class="grid two"><article class="card"><h3>01 / Completa una actividad</h3><p>Tu docente propone el desafío, en la asignatura que corresponda. BioDex no evalúa respuestas.</p></article><article class="card"><h3>02 / Recibe tu código</h3><p>Ingresa el código de captura, sector o gimnasio. Conservamos los códigos de la edición original.</p></article><article class="card"><h3>03 / Descubre y evoluciona</h3><p>La captura se guarda antes de reproducir la animación. ${captureRuleText()}</p></article><article class="card"><h3>04 / Recupera tu expedición</h3><p>Usa el mismo nombre y clave de seis dígitos. Pulsa Actualizar si avanzaste desde otro dispositivo. Si pierdes la clave, tu docente puede restablecerla sin perder tu colección.</p></article><article class="card"><h3>Conexión y guardado</h3><p>Sin conexión no se confirman capturas. Si una solicitud tarda, vuelve a intentarlo: los códigos son idempotentes y no duplican recompensas.</p></article><article class="card"><h3>Efecto retro opcional</h3><p>Las animaciones de captura se mantienen. Puedes alternar la textura de pantalla clásica.</p><button onclick="toggleCRT()">Alternar textura CRT</button></article></div></section>`;}

// Accesibilidad: foco al abrir/cerrar una ficha y Escape para salir del diálogo.
let returnFocus=null;
const oldOpenModal=openModal, oldCloseModal=closeModal;
openModal=function(html){returnFocus=document.activeElement;oldOpenModal(html);const box=document.getElementById('modalContent');box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.querySelector('button,input')?.focus();};
closeModal=function(event){if(event&&event.target.id!=='modalBack')return;oldCloseModal(event);returnFocus?.focus?.();};
document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeModal();closeDialogue();}if(event.key==='Tab'&&document.getElementById('modalBack').classList.contains('show')){const items=[...document.getElementById('modalContent').querySelectorAll('button,input,select,textarea,[tabindex="0"]')];const first=items[0],last=items[items.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}});
