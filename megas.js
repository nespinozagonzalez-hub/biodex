/* BioDex 2.4 · Tres distinciones únicas. Ningún código privado en el cliente. */
'use strict';
const MEGA_BIOFORMAS=Object.freeze([
  {id:'B031',num:'031',nombre:'Astrael',slug:'ASTRAEL',tipo:'Astral',rareza:'Mega legendaria',zona:'Santuario del Alba',oa:'Distinción del curso',linea:'mega-astrael',etapa:1,evolucionaDe:null,evolucionaA:null,nivel:99,mega:true,titulo:'Guardián del alba',habilidad:'Horizonte de estrellas',descN:'Sus alas guardan la luz de una primera pregunta. Aparece donde la curiosidad se convierte en una forma de mirar el mundo.',descE:'Distinción excepcional a una trayectoria de aprendizaje. Sus seis alas representan curiosidad, constancia, colaboración, creatividad, reflexión y compromiso.',stats:{vida:100,analisis:99,evidencia:97,comunicacion:100,energia:98},colors:{primary:'#e4edff',secondary:'#c9aa65',accent:'#85a9df',glow:'#f1d59b'}},
  {id:'B032',num:'032',nombre:'Thalúmor',slug:'THALUMOR',tipo:'Abisal',rareza:'Mega legendaria',zona:'Archivo de las Profundidades',oa:'Distinción del curso',linea:'mega-thalumor',etapa:1,evolucionaDe:null,evolucionaA:null,nivel:99,mega:true,titulo:'Custodio del abismo',habilidad:'Memoria de las mareas',descN:'Entre ruinas sumergidas conserva preguntas que nadie se ha atrevido a formular. Su luz guía a quienes investigan más allá de lo evidente.',descE:'Distinción excepcional a una trayectoria de aprendizaje. Representa profundidad, paciencia y la capacidad de encontrar sentido donde otros solo ven oscuridad.',stats:{vida:100,analisis:100,evidencia:99,comunicacion:97,energia:98},colors:{primary:'#0d6172',secondary:'#8c72d1',accent:'#7aeee2',glow:'#4fd4e7'}},
  {id:'B033',num:'033',nombre:'Ignivar',slug:'IGNIVAR',tipo:'Primordial',rareza:'Mega legendaria',zona:'Forja del Primer Fuego',oa:'Distinción del curso',linea:'mega-ignivar',etapa:1,evolucionaDe:null,evolucionaA:null,nivel:99,mega:true,titulo:'Corazón primordial',habilidad:'Voluntad de la forja',descN:'En la primera montaña aprendió a convertir la presión en cristal y los errores en nuevos caminos. Su fuego ilumina sin destruir.',descE:'Distinción excepcional a una trayectoria de aprendizaje. Representa perseverancia, iniciativa y la voluntad de transformar cada dificultad en una oportunidad.',stats:{vida:100,analisis:97,evidencia:98,comunicacion:99,energia:100},colors:{primary:'#423739',secondary:'#cf6b38',accent:'#f1bc5d',glow:'#edb957'}}
]);
function baseCaptureCount(){return BIOFORMAS.filter(b=>progreso?.capturadas?.includes(b.id)).length;}
function ownsMega(){return MEGA_BIOFORMAS.find(b=>progreso?.capturadas?.includes(b.id));}
function megasEnabled(){return serverFeatures.megaPrizes===3;}
const baseGetBioforma=getBioforma;
getBioforma=function(id){return baseGetBioforma(id)||MEGA_BIOFORMAS.find(b=>b.id===id);};
const baseMegaPortrait=renderBioformaSVG;
renderBioformaSVG=function(input,captured=false,size='card',opts={}){
  const b=typeof input==='string'?getBioforma(input):input;if(!b?.mega)return baseMegaPortrait(input,captured,size,opts);
  const px=typeof size==='number'?size:160,art=opts.art===true&&captured;
  return `<div class="portrait ${captured?'revealed':'silhouette'} ${art?'full-art':'cutout'} mega-portrait" style="--portrait-size:${px}px" data-bioforma="${b.id}"><div class="portrait-fallback">${renderScanSymbol()}</div><img src="assets/${art?'bioformas/'+b.id+'.webp':'cutouts/'+b.id+'.png'}" alt="${captured?escapeHtml(b.nombre):'Silueta mega legendaria'}" loading="lazy" onload="this.parentElement.classList.add('image-ready')" onerror="this.remove()"></div>`;
};
function megaCard(b){
  const captured=progreso.capturadas.includes(b.id);
  return `<article class="mega-card ${captured?'claimed':'unclaimed'}" data-mega="${b.id}"><div class="mega-card-art">${renderBioformaSVG(b,captured,220,{art:captured})}<span class="mega-edition">DISTINCIÓN ÚNICA / ${b.num}</span></div><div class="mega-card-copy"><span class="eyebrow">MEGA LEGENDARIA</span><h3>${escapeHtml(b.nombre)}</h3><p>${escapeHtml(b.titulo)}</p><span class="mega-state">${captured?'✦ TU DISTINCIÓN':'UNA SOLA ENTREGA'}</span><button class="ghost" onclick="renderFicha('${b.id}')">Ver leyenda ↗</button></div></article>`;
}
const commonCards=renderBioformaCards;
renderBioformaCards=function(){
  let html=commonCards();if(!megasEnabled())return html;
  const term=searchTerm.trim().toLocaleLowerCase('es');
  const list=MEGA_BIOFORMAS.filter(b=>{
    const captured=progreso.capturadas.includes(b.id);
    if(filterStatus==='capturada'&&!captured||filterStatus==='disponible'&&captured||filterStatus==='evo')return false;
    if(filterTipo!=='todos'&&filterTipo!==b.tipo||filterOA!=='todos'&&filterOA!==b.oa)return false;
    return !term||[b.nombre,b.tipo,b.zona,b.oa,b.titulo,'mega legendaria'].some(s=>s.toLocaleLowerCase('es').includes(term));
  });
  if(!list.length)return html;
  if(html.includes('No hay resultados con esos filtros.'))html='';
  return html+`<section class="mega-gallery"><div class="mega-gallery-heading"><span class="eyebrow">LAS TRES LEYENDAS DE BIONOVA</span><h2>Más allá de la expedición.</h2><p>Tres leyendas, tres vínculos irrepetibles. Un código especial puede unir una de ellas a tu expedición: solo una mega legendaria por explorador.</p><small>Son premios adicionales. La colección principal se completa con sus 30 bioformas.</small></div><div class="mega-grid">${list.map(megaCard).join('')}</div></section>`;
};
const commonBiodex=renderBiodex;
renderBiodex=function(){
  let html=commonBiodex();
  if(serverFeatures.captureMode==='code-only')html=html.replace(/<option value="evo"[^>]*>[\s\S]*?<\/option>/,'');
  if(megasEnabled()){
    html=html.replace(/(<select onchange="filterTipo=[\s\S]*?)(<\/select>)/,(_,start,end)=>start+MEGA_BIOFORMAS.map(b=>opt(b.tipo,b.tipo,filterTipo)).join('')+end);
    html=html.replace(/(<select onchange="filterOA=[\s\S]*?)(<\/select>)/,(_,start,end)=>start+opt('Distinción del curso','Distinción del curso',filterOA)+end);
  }
  return html;
};
const commonFicha=renderFicha;
renderFicha=function(id){
  const b=getBioforma(id);if(!b?.mega)return commonFicha(id);
  if(!megasEnabled()&&!progreso.capturadas.includes(id))return;
  const captured=progreso.capturadas.includes(id);
  openModal(`<section class="mega-ficha"><span class="eyebrow">LEYENDA ÚNICA DE BIONOVA</span><h2>${escapeHtml(b.nombre)}</h2><p class="mega-ficha-title">${escapeHtml(b.titulo)}</p><div class="bio-svg-wrap">${renderBioformaSVG(b,captured,290,{art:captured})}</div><p><span class="pill">${b.tipo}</span><span class="pill">Mega legendaria</span></p><p>${escapeHtml(b.descN)}</p>${captured?`<p>${escapeHtml(b.descE)}</p><p><b>Habilidad:</b> ${escapeHtml(b.habilidad)}</p>${renderStats(b.stats)}`:'<p class="muted">Esta leyenda solo puede acompañar a un explorador. Sigue tu travesía hasta encontrar su código especial.</p>'}<div class="modal-actions"><button class="primary" onclick="closeModal();go('codigo')">Ir al escáner →</button><button class="ghost" onclick="closeModal()">Cerrar</button></div></section>`);
};
const ordinaryPanel=renderPanel;
renderPanel=function(){const b=ownsMega();return ordinaryPanel()+(b?`<aside class="mega-owned"><span>✦</span><div><small>VÍNCULO LEGENDARIO</small><strong>${escapeHtml(b.nombre)} · ${escapeHtml(b.titulo)}</strong></div><button class="ghost" onclick="renderFicha('${b.id}')">Ver premio ↗</button></aside>`:'');};
