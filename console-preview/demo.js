/* Solo se carga en esta propuesta; ningún archivo de producción cambia. */
(()=>{
 const originalRender=render;
 render=function(){document.body.dataset.previewView=view;originalRender();const panel=document.getElementById('view');if(panel){panel.tabIndex=0;panel.setAttribute('aria-label','Contenido de la sección; desplazamiento vertical');}};
 init=function(){injectBioformaSVGStyles();sesion={token:'DEMO-SIN-CONEXION'};serverFeatures={captureMode:'code-only',megaPrizes:3};progreso=defaultProgress();progreso.jugador='Nicolás';progreso.capturadas=['B001','B002','B003','B004','B005','B027','B030'];progreso.logros=['L01','L02','L08','L09','L10','L11'];progreso.sectores.abiertos={S01:true};progreso.gimnasios.abiertos={GYM01:true};progreso.configuracion={crt:false,avatarId:'aurora',landscapeId:'bosque'};progreso.bienvenidaVista=true;cloudStatus='DEMO · SIN CONEXIÓN';view='panel';render();};
 api=async function(){throw new Error('Esta vista previa no modifica cuentas ni progreso.');};
 logout=function(){init();toast('Vista previa reiniciada. Tu cuenta real no se ha utilizado.');};
 refreshCloud=function(){toast('Estás viendo datos ficticios. No hay conexión con las cuentas.');};
 const bar=document.createElement('div');bar.className='preview-bar';bar.innerHTML='<b>VISTA PREVIA · CONSOLA ADAPTABLE</b><small>Personaje de demostración · sin conexión a cuentas</small>';document.body.append(bar);
 const hint=document.createElement('aside');hint.className='rotate-hint';hint.setAttribute('aria-label','Sugerencia de orientación');hint.innerHTML='<span>Gira tu dispositivo para disfrutar mejor la BioDex.<br><small>También puedes continuar en vertical.</small></span><button type="button" aria-label="Cerrar sugerencia">×</button>';hint.querySelector('button').onclick=()=>hint.hidden=true;document.body.append(hint);
 // La carcasa no cambia de posición al abrir otra sección.
 const oldGo=go;go=function(v){oldGo(v);document.getElementById('view')?.scrollTo(0,0);};
})();
