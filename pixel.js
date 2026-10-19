/* BioDex 2.6 · Decoración de interfaz. No lee ni escribe el progreso. */
(() => {
  'use strict';
  const shapes=Object.freeze({
    panel:'M1 7h2V5h2V3h2V1h2v2h2v2h2v2h2v7h-5V9H6v5H1Z',
    biodex:'M2 1h11v2h2v11H2V1Zm2 2v9h9V4h-2V3Zm1 2h5v2H5Zm0 4h6v1H5Z',
    codigo:'M1 1h5v2H3v3H1Zm9 0h5v5h-2V3h-3ZM1 10h2v3h3v2H1Zm12 0h2v5h-5v-2h3ZM5 5h6v6H5Zm2 2v2h2V7Z',
    mapa:'M1 3h4V1h6v2h4v11h-4v1H5v-1H1Zm2 2v7h2V4H3Zm4-2v10h2V3Zm4 2v7h2V5Z',
    gimnasios:'M2 2h12v2h-1v8h2v2H1v-2h2V4H2Zm3 2v8h2V4Zm4 0v8h2V4Z',
    lineas:'M1 6h4V4h4V1h2v3h3v4h-3v2h3v4h-4v-2H8V9H5v1H1Zm2 2h1V7H3Zm8-2h1V5h-1Zm0 6h1v-1h-1Z',
    inventario:'M5 1h6v3h2v2h2v8H1V6h2V4h2Zm2 2v1h2V3ZM5 6v2h6V6ZM3 10v2h10v-2Z',
    logros:'M4 1h8v2h3v6h-3v2h-3v2h3v2H4v-2h3v-2H4V9H1V3h3Zm0 4H3v2h1Zm8 0v2h1V5ZM6 3v5h4V3Z',
    ayuda:'M5 1h6v2h2v4h-2v2H9v2H7V7h2V5h2V3H5v2H3V3h2ZM7 13h2v2H7Z',
    perfil:'M5 1h6v6H5Zm-2 8h10v2h2v4H1v-4h2Z'
  });
  function icon(key){
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 16 16');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');svg.setAttribute('class','px-icon');
    const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',shapes[key]||shapes.codigo);path.setAttribute('fill','currentColor');path.setAttribute('fill-rule','evenodd');svg.append(path);return svg;
  }
  const scenery=document.createElement('div');scenery.id='pxScenery';scenery.setAttribute('aria-hidden','true');
  for(const cls of ['px-horizon','px-haze','px-ground']){const layer=document.createElement('div');layer.className=cls;scenery.append(layer);}document.body.prepend(scenery);
  function decorate(){
    for(const b of document.querySelectorAll('.nav button:not(.px-nav-ready)')){
      const route=/go\('([a-z]+)'\)/.exec(b.getAttribute('onclick')||'')?.[1];if(!shapes[route])continue;
      const label=document.createElement('span');label.className='px-nav-label';label.textContent=b.textContent.replace(/^[^\p{L}\p{N}]+/u,'').trim();
      b.replaceChildren(icon(route),label);b.classList.add('px-nav-ready');
    }
    for(const b of document.querySelectorAll('.physical-buttons button:not(.px-control-ready)')){b.classList.add('px-control-ready');}
    for(const title of document.querySelectorAll('.rpg-title:not(.px-label-ready)'))title.classList.add('px-label-ready');
  }
  let queued=false;
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;decorate();});}
  for(const id of ['app','modalContent']){const el=document.getElementById(id);if(el)new MutationObserver(schedule).observe(el,{childList:true,subtree:true});}
  decorate();
  // El paralaje solo desplaza capas decorativas y se desactiva en táctil/reducción.
  const finePointer=matchMedia('(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)');
  let frame=0,x=0,y=0;
  window.addEventListener('pointermove',event=>{
    if(!finePointer.matches||document.body.classList.contains('fx-reduced'))return;
    x=(event.clientX/innerWidth-.5)*12;y=(event.clientY/innerHeight-.5)*8;
    if(!frame)frame=requestAnimationFrame(()=>{frame=0;scenery.style.setProperty('--px-x',x+'px');scenery.style.setProperty('--px-y',y+'px');});
  },{passive:true});
  document.documentElement.addEventListener('pointerleave',()=>{scenery.style.setProperty('--px-x','0px');scenery.style.setProperty('--px-y','0px');});
})();
