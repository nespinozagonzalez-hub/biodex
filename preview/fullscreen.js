/* Pantalla completa nativa; sin escala, bloqueo de scroll ni gestión del teclado. */
(()=>{'use strict';
 const bar=document.createElement('nav');bar.className='screen-tools';bar.setAttribute('aria-label','Opciones de visualización');
 const button=document.createElement('button');button.type='button';button.className='screen-full-button';button.textContent='⛶ Pantalla completa';button.setAttribute('aria-pressed','false');bar.append(button);document.getElementById('app').before(bar);
 const help=document.createElement('dialog');help.className='screen-full-help';help.setAttribute('aria-labelledby','screenFullTitle');
 const title=document.createElement('h2');title.id='screenFullTitle';title.textContent='Más espacio para tu aventura';
 const message=document.createElement('p');const close=document.createElement('button');close.type='button';close.textContent='Continuar';close.className='primary';close.onclick=()=>help.close();help.append(title,message,close);document.body.append(help);
 function fullscreenElement(){return document.fullscreenElement||document.webkitFullscreenElement;}
 function refresh(){const active=!!fullscreenElement();button.textContent=active?'⛶ Salir de pantalla completa':'⛶ Pantalla completa';button.setAttribute('aria-pressed',String(active));}
 function showHelp(){
  const apple=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const standalone=navigator.standalone===true||matchMedia('(display-mode:standalone)').matches;
  message.textContent=standalone?'Ya estás usando BioDex como una app. Puedes continuar tu aventura.':apple?'Este navegador limita la pantalla completa. Para abrir BioDex como una app, usa Safari: Compartir → Añadir a pantalla de inicio. Si aparece «Abrir como app web», déjalo activado. Después abre BioDex desde su icono.':'Este navegador no permite activar la pantalla completa aquí. Abre BioDex en una pestaña independiente o usa el modo de pantalla completa del navegador. Puedes continuar jugando con el desplazamiento normal.';
  if(!help.open)help.showModal();
 }
 button.onclick=async()=>{
  button.disabled=true;
  try{
   if(fullscreenElement()){const exit=document.exitFullscreen||document.webkitExitFullscreen;if(exit)await exit.call(document);}
   else{const root=document.documentElement,request=root.requestFullscreen||root.webkitRequestFullscreen;
    if(request&&document.fullscreenEnabled!==false&&document.webkitFullscreenEnabled!==false)await request.call(root);else showHelp();}
  }catch(_){showHelp();}finally{button.disabled=false;refresh();}
 };
 document.addEventListener('fullscreenchange',refresh);document.addEventListener('webkitfullscreenchange',refresh);document.addEventListener('fullscreenerror',showHelp);document.addEventListener('webkitfullscreenerror',showHelp);refresh();
})();
