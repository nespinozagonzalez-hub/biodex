/* BioDex 2.5 · Capa audiovisual opcional. No escribe progreso ni llama al servidor. */
(() => {
  'use strict';
  const KEY = 'biodex_audiovisual_v1';
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const defaults = {music:false, effects:false, musicVolume:0.28, effectsVolume:0.4, motion:'system'};
  let prefs = {...defaults};
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    for (const k of ['music','effects']) if (typeof saved[k] === 'boolean') prefs[k] = saved[k];
    for (const k of ['musicVolume','effectsVolume']) if (Number.isFinite(saved[k])) prefs[k] = Math.max(0,Math.min(1,saved[k]));
    if (['system','reduce'].includes(saved.motion)) prefs.motion = saved.motion;
  } catch (_) { /* Funciona también sin almacenamiento. */ }
  const $ = s => document.querySelector(s);
  const make = (tag,cls,text) => {const el=document.createElement(tag);if(cls)el.className=cls;if(text)el.textContent=text;return el;};
  function button(label,fn,cls='ghost') {const b=make('button',cls,label);b.type='button';b.addEventListener('click',fn);return b;}
  function savePrefs(){try{localStorage.setItem(KEY,JSON.stringify(prefs));}catch(_){}applyPrefs();}
  function reduced(){return prefs.motion==='reduce'||media.matches;}
  const scores = Object.freeze({
    refuge:{notes:[60,64,67,71,67,64,62,67,60,64,69,67,64,62,59,62],chords:[[48,55,64],[45,52,60],[41,48,57],[43,50,59]],step:0.52},
    journey:{notes:[62,69,74,77,74,69,65,72,62,65,69,72,67,65,60,65],chords:[[50,57,65],[46,53,62],[48,55,64],[45,52,60]],step:0.46},
    legend:{notes:[57,64,69,71,76,71,69,64,53,60,65,69,72,69,65,60],chords:[[45,52,60],[41,48,57],[48,55,64],[43,50,59]],step:0.65}
  });
  let ctx=null, musicGain=null, effectsGain=null, musicTimer=null, nextNote=0, beat=0, theme='refuge',unlocked=false;
  let audioUnavailable=false, hiddenPaused=false, lastEffect=0, duckTimer=null;
  const musicNodes = new Set();
  function statusAudio(message){const el=$('#fxAudioStatus');if(el)el.textContent=message;}
  async function unlockAudio(){
    const Audio=window.AudioContext||window.webkitAudioContext;
    if(!Audio){audioUnavailable=true;statusAudio('Este navegador no ofrece audio. La aventura continúa con sus señales visuales.');return false;}
    try {
      if(!ctx){
        ctx=new Audio();
        const limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-14;limiter.ratio.value=5;limiter.connect(ctx.destination);
        musicGain=ctx.createGain();effectsGain=ctx.createGain();musicGain.gain.value=0;effectsGain.gain.value=prefs.effectsVolume*0.36;
        musicGain.connect(limiter);effectsGain.connect(limiter);
        ctx.addEventListener('statechange',()=>{if(ctx.state!=='running')stopMusic();else if(unlocked&&!document.hidden)startMusic();});
      }
      await ctx.resume();unlocked=ctx.state==='running';
      if(!unlocked){statusAudio('Pulsa Activar sonido para iniciar la reproducción.');return false;}
      statusAudio('Audio listo. Estas opciones se guardan solo en este dispositivo.');
      startMusic();return true;
    } catch(_){statusAudio('No se pudo iniciar el audio. Puedes volver a activarlo cuando quieras.');return false;}
  }
  function tone(note,when,duration,gain,type='sine',bus='music'){
    if(!ctx||ctx.state!=='running')return;
    const osc=ctx.createOscillator(),env=ctx.createGain();
    osc.type=type;osc.frequency.value=440*Math.pow(2,(note-69)/12);
    env.gain.setValueAtTime(0,when);env.gain.linearRampToValueAtTime(gain,when+Math.min(0.12,duration/5));
    env.gain.exponentialRampToValueAtTime(0.0001,when+duration);
    osc.connect(env);env.connect(bus==='music'?musicGain:effectsGain);
    if(bus==='music')musicNodes.add(osc);
    osc.onended=()=>{musicNodes.delete(osc);osc.disconnect();env.disconnect();};osc.start(when);osc.stop(when+duration+0.04);
  }
  function scheduleMusic(){
    if(!ctx||!unlocked||!prefs.music||document.hidden||ctx.state!=='running')return;
    const score=scores[theme];
    while(nextNote<ctx.currentTime+0.65){
      const n=beat%score.notes.length;
      tone(score.notes[n],nextNote,1.15,0.11,'sine');
      if(beat%8===0)score.chords[Math.floor(beat/8)%4].forEach(note=>tone(note,nextNote,score.step*7.8,0.055,'triangle'));
      nextNote+=score.step;beat++;
    }
  }
  function startMusic(){
    if(!ctx||!unlocked||!prefs.music||document.hidden||ctx.state!=='running')return;
    musicGain.gain.setTargetAtTime(prefs.musicVolume*0.48,ctx.currentTime,0.5);
    if(musicTimer)return;
    nextNote=ctx.currentTime+0.08;scheduleMusic();musicTimer=setInterval(scheduleMusic,180);
  }
  function stopMusic(){
    clearInterval(musicTimer);musicTimer=null;
    if(!ctx)return;
    musicGain.gain.setTargetAtTime(0,ctx.currentTime,0.15);
    for(const osc of musicNodes){try{osc.stop(ctx.currentTime+0.65);}catch(_){}}
  }
  function setTheme(value){if(theme===value)return;theme=value;beat=0;stopMusic();startMusic();}
  function sound(kind='tap',rare=false){
    if(!ctx||!unlocked||!prefs.effects||document.hidden||ctx.state!=='running')return;
    const now=ctx.currentTime;if(kind==='tap'&&now-lastEffect<0.07)return;lastEffect=now;
    const melodies={tap:[76],scan:[48,55,60],success:[60,64,67,72],medal:[67,72,76,79],capture:rare?[48,60,67,72,76,79,84]:[60,64,67,72],error:[52,48]};
    const notes=melodies[kind]||melodies.success,step=kind==='tap'?0.04:0.095;
    notes.forEach((n,i)=>tone(n,now+i*step,kind==='tap'?0.09:0.4,kind==='tap'?0.22:0.28,'sine','effects'));
    if(notes.length>2&&prefs.music){musicGain.gain.setTargetAtTime(prefs.musicVolume*0.14,now,0.06);clearTimeout(duckTimer);duckTimer=setTimeout(()=>{if(prefs.music&&!document.hidden)musicGain.gain.setTargetAtTime(prefs.musicVolume*0.48,ctx.currentTime,0.4);},1100);}
  }
  const dock=make('nav','fx-dock');dock.setAttribute('aria-label','Ambiente de BioNova');
  const audioButton=button('Sonido',()=>openSound(),'fx-dock-button');audioButton.setAttribute('aria-haspopup','dialog');
  const storyButton=button('Historia',()=>openStory(),'fx-dock-button');storyButton.setAttribute('aria-haspopup','dialog');
  dock.append(audioButton,storyButton);document.body.append(dock);
  const ambient=make('div','fx-ambient');ambient.setAttribute('aria-hidden','true');
  for(let i=0;i<8;i++){const mote=make('i');mote.style.setProperty('--i',i);ambient.append(mote);}document.body.append(ambient);
  let activeDialog=null,dialogReturn=null;
  function closeFxDialog(){if(!activeDialog)return;const old=activeDialog;activeDialog=null;old.close();old.remove();if(dialogReturn?.isConnected)dialogReturn.focus();}
  function newDialog(label,cls=''){
    if(activeDialog)closeFxDialog();dialogReturn=document.activeElement;
    const d=make('dialog','fx-dialog '+cls);d.setAttribute('aria-label',label);
    d.addEventListener('cancel',e=>{e.preventDefault();closeFxDialog();});d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeFxDialog();}});
    document.body.append(d);activeDialog=d;return d;
  }
  function openSound(){
    const d=newDialog('Sonido y movimiento','fx-sound');
    d.innerHTML='<span class="eyebrow">AJUSTES DEL DISPOSITIVO</span><h2>El ambiente de tu aventura.</h2><p>Música suave y señales de campo. Tú eliges cómo acompañar tu expedición.</p>';
    const activate=button('Activar sonido',async()=>{if(await unlockAudio()){prefs.music=true;prefs.effects=true;savePrefs();syncSoundControls();sound('success');}},'primary');activate.id='fxActivateAudio';d.append(activate);
    for(const [key,label]of [['music','Música ambiental'],['effects','Efectos de sonido']]){
      const row=make('div','fx-setting'),lbl=make('label','',label),toggle=make('input');toggle.type='checkbox';toggle.checked=prefs[key];toggle.id='fx-'+key;lbl.htmlFor=toggle.id;
      toggle.addEventListener('change',async()=>{if(toggle.checked&&!(await unlockAudio())){toggle.checked=false;return;}prefs[key]=toggle.checked;savePrefs();syncSoundControls();if(key==='effects')sound('tap');});row.append(lbl,toggle);d.append(row);
      const vr=make('div','fx-volume'),vl=make('label','','Volumen de '+label.toLowerCase()),range=make('input');range.type='range';range.min='0';range.max='100';range.value=String(Math.round(prefs[key+'Volume']*100));range.id='fx-'+key+'-volume';vl.htmlFor=range.id;
      const output=make('output','',range.value+' %');output.htmlFor=range.id;
      range.addEventListener('input',()=>{prefs[key+'Volume']=Number(range.value)/100;output.textContent=range.value+' %';savePrefs();});vr.append(vl,range,output);d.append(vr);
    }
    const row=make('div','fx-setting'),label=make('label','','Movimiento suave'),select=make('select');select.id='fx-motion';label.htmlFor=select.id;
    for(const [v,t]of [['system','Seguir mi dispositivo'],['reduce','Reducir movimiento']]){const o=make('option','',t);o.value=v;select.append(o);}select.value=prefs.motion;
    select.addEventListener('change',()=>{prefs.motion=select.value;savePrefs();});row.append(label,select);d.append(row);
    const status=make('p','fx-local-note',audioUnavailable?'Este navegador no ofrece audio.':'Preferencias locales. El sonido empieza al activarlo; puedes silenciarlo cuando quieras.');status.id='fxAudioStatus';status.setAttribute('role','status');d.append(status);
    const actions=make('div','fx-dialog-actions');actions.append(button('Silenciar todo',()=>{prefs.music=false;prefs.effects=false;savePrefs();syncSoundControls();}),button('Listo',closeFxDialog,'primary'));d.append(actions);d.showModal();
    syncSoundControls();
  }
  function syncSoundControls(){for(const key of ['music','effects']){const el=$('#fx-'+key);if(el)el.checked=prefs[key];}const b=$('#fxActivateAudio');if(b)b.hidden=unlocked&&(prefs.music||prefs.effects);}
  const scenes=Object.freeze([
    {tag:'01 / LA SEÑAL',title:'Un mundo que todavía guarda secretos.',image:'assets/territories/S01.webp',text:'Al amanecer, una señal cruza los bosques de BioNova. Entre senderos, ruinas y lagos de cristal viven bioformas que pocos han llegado a conocer. Cada una guarda una historia distinta.'},
    {tag:'02 / EL DISPOSITIVO',title:'Tu FIELD-02 está listo.',image:'assets/landscapes/bruma.webp',text:'En tus manos, el dispositivo de campo despierta. Sus archivos están llenos de siluetas y caminos por descubrir. Los códigos que encuentres durante tu travesía revelarán nuevas bioformas y abrirán otros horizontes.'},
    {tag:'03 / TU EXPEDICIÓN',title:'La siguiente página la escribes tú.',image:'assets/territories/S07.webp',text:'Regresa al refugio, consulta tu BioDex y sigue las rutas del atlas. No necesitas conocer todo el mapa para dar el primer paso. Reúne tus códigos, activa el escáner y deja que comience la expedición.'}
  ]);
  function openStory(){
    const d=newDialog('El origen de tu expedición','fx-story');let page=0;
    function paint(){
      const s=scenes[page];d.replaceChildren();const cover=make('div','fx-story-cover'),img=make('img');img.src=s.image;img.alt=['Amanecer entre los senderos de BioNova','Estación entre la niebla','Archivo tallado en las montañas de BioNova'][page];cover.append(img);
      const badge=make('span','eyebrow',s.tag);cover.append(badge);d.append(cover);
      const content=make('div','fx-story-copy'),title=make('h2','',s.title);title.tabIndex=-1;content.append(title,make('p','',s.text));
      const dots=make('div','fx-story-dots');dots.setAttribute('aria-label','Escena '+(page+1)+' de 3');scenes.forEach((_,i)=>{const dot=make('span',i===page?'active':'');dot.setAttribute('aria-hidden','true');dots.append(dot);});content.append(dots);
      const actions=make('div','fx-dialog-actions');if(page>0)actions.append(button('Anterior',()=>{page--;paint();}));else actions.append(button('Omitir',closeFxDialog));
      actions.append(button(page===2?'Comenzar mi travesía':'Continuar →',()=>{if(page===2)closeFxDialog();else{page++;paint();sound('tap');}},'primary'));content.append(actions);d.append(content);if(d.open)title.focus();
    }
    paint();d.showModal();sound('tap');
  }
  function showArtwork(id){
    const b=getBioforma(id);if(!b||!progreso?.capturadas?.includes(id))return;
    const d=newDialog('Ilustración de '+b.nombre,'fx-artwork');
    const header=make('div','fx-art-header');header.append(make('h2','',b.nombre),button('Cerrar',closeFxDialog));
    const img=make('img');img.src='assets/bioformas/'+id+'.webp';img.alt='Ilustración completa de '+b.nombre;d.append(header,img,make('p','',b.tipo+' · '+b.rareza));d.showModal();
  }
  function applyPrefs(){
    document.body.classList.toggle('fx-reduced',reduced());
    audioButton.textContent=prefs.music||prefs.effects?'Sonido · activo':'Sonido · apagado';
    audioButton.setAttribute('aria-label','Ajustar sonido y movimiento. '+(prefs.music||prefs.effects?'Sonido activado':'Sonido desactivado'));
    if(ctx){effectsGain.gain.setTargetAtTime(prefs.effectsVolume*0.36,ctx.currentTime,0.05);if(!prefs.music)stopMusic();else startMusic();}
  }
  media.addEventListener?.('change',applyPrefs);applyPrefs();
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){hiddenPaused=unlocked;stopMusic();if(ctx?.state==='running')ctx.suspend().catch(()=>{});}
    else if(hiddenPaused&&ctx){hiddenPaused=false;ctx.resume().then(startMusic).catch(()=>statusAudio('Pulsa Activar sonido para continuar.'));}
  });
  // Interacciones de presentación; nunca interceptan los manejadores del juego.
  function resumeFromGesture(){if((prefs.music||prefs.effects)&&!unlocked&&!audioUnavailable)void unlockAudio();}
  document.addEventListener('pointerdown',resumeFromGesture,{passive:true});
  document.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' ')resumeFromGesture();});
  document.addEventListener('click',event=>{
    const target=event.target.closest('button');if(!target)return;
    if(target.closest('.fx-dialog'))return;
    sound(target.matches('.capture-terminal button[type="submit"],.guild-unlock button[type="submit"]')?'scan':'tap');
  });
  document.addEventListener('keydown',event=>{
    if(activeDialog&&event.key==='Escape'){event.stopImmediatePropagation();event.preventDefault();closeFxDialog();return;}
    if(activeDialog||$('#captureOverlay')?.style.display!=='flex')return;
    if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();$('#captureOverlay .fx-skip-capture')?.click();}
    if(event.key==='Tab'){
      const items=[...document.querySelectorAll('#captureOverlay button:not(:disabled)')].filter(b=>!b.closest('.cap-cta')||Number(getComputedStyle(b.parentElement).opacity)>.1);
      if(!items.length)return;const first=items[0],last=items[items.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
  },{capture:true});
  const notices=make('div','fx-notices');notices.setAttribute('aria-label','Noticias de tu expedición');document.body.append(notices);
  const live=make('div','sr-only');live.setAttribute('role','status');live.setAttribute('aria-live','polite');document.body.append(live);
  let noticeQueue=[],noticeActive=null,noticeTimer=null;
  function queueNotice(item){noticeQueue.push(item);pumpNotices();}
  function clearNotices(){noticeQueue=[];clearTimeout(noticeTimer);notices.replaceChildren();noticeActive=null;}
  function pumpNotices(){
    if(noticeActive||!noticeQueue.length||document.hidden||activeDialog||$('#captureOverlay')?.style.display==='flex'||$('#cloudLoading')?.open||$('#modalBack.show'))return;
    const item=noticeQueue.shift(),box=make('aside','fx-notice');noticeActive=box;
    if(item.image){const img=make('img');img.src=item.image;img.alt='';box.append(img);}
    const content=make('div');content.append(make('small','eyebrow',item.tag),make('strong','',item.title));if(item.detail)content.append(make('p','',item.detail));box.append(content);
    const dismiss=()=>{clearTimeout(noticeTimer);box.remove();noticeActive=null;pumpNotices();};box.append(button('Cerrar',dismiss,'fx-notice-close'));notices.append(box);live.textContent=item.tag+'. '+item.title;sound(item.tag==='MEDALLA OBTENIDA'?'medal':'success');noticeTimer=setTimeout(dismiss,8500);
  }
  document.addEventListener('visibilitychange',pumpNotices);setInterval(pumpNotices,700);
  let baseline=null,lastView=null,frame=null,lastBusy=false,lastToast='';
  const captureStages=new WeakSet();
  function stateSnapshot(){
    if(typeof sesion==='undefined'||!sesion?.token||!progreso?.jugador)return null;
    return {token:sesion.token,captures:[...progreso.capturadas],medals:[...progreso.logros],sectors:Object.keys(progreso.sectores?.abiertos||{}),gyms:Object.keys(progreso.gimnasios?.abiertos||{})};
  }
  function observeProgress(){
    const next=stateSnapshot();
    if(!next){baseline=null;clearNotices();return;}
    if(!baseline||baseline.token!==next.token){clearNotices();baseline=next;return;}
    const before=baseline;baseline=next;
    for(const id of next.sectors.filter(x=>!before.sectors.includes(x))){const sector=SECTORES_CIUDAD.find(s=>s.id===id);if(sector)queueNotice({tag:'NUEVO TERRITORIO',title:sector.nombre,image:'assets/territories/'+id+'.webp',detail:'Un nuevo horizonte se abre en tu atlas.'});}
    for(const id of next.gyms.filter(x=>!before.gyms.includes(x))){const gym=GIMNASIOS_BIONOVA.find(g=>g.id===id);if(gym)queueNotice({tag:'RUTA ABIERTA',title:gym.nombre,detail:'Tu siguiente camino ya aparece en la Liga.'});}
    for(const id of next.medals.filter(x=>!before.medals.includes(x))){const medal=LOGROS.find(l=>l.id===id);if(medal)queueNotice({tag:'MEDALLA OBTENIDA',title:medal.nombre,detail:medal.desc});}
    for(const line of [...new Set(BIOFORMAS.map(b=>b.linea))]){const members=lineaBioformas(line);if(members.every(b=>next.captures.includes(b.id))&&!members.every(b=>before.captures.includes(b.id)))queueNotice({tag:'LINAJE COMPLETO',title:members[0].zona,detail:'Tres formas. Una historia reunida en tu BioDex.',image:'assets/bioformas/'+members[2].id+'.webp'});}
  }
  function enhanceCapture(){
    const overlay=$('#captureOverlay'),stage=overlay?.querySelector('.cap-stage'),open=overlay?.style.display==='flex';document.body.classList.toggle('fx-capturing',open);
    if(!open||!stage||captureStages.has(stage))return;
    captureStages.add(stage);
    const id=stage.querySelector('[data-bioforma]')?.dataset.bioforma,b=id?getBioforma(id):null;if(!b)return;
    const rare=['Rara','Épica','Legendaria','Mega legendaria'].includes(b.rareza);overlay.dataset.fxRarity=b.mega?'mega':rare?'rare':'common';
    overlay.dataset.fxGrade=({'Común':'common','Poco común':'uncommon','Rara':'rare','Épica':'epic','Legendaria':'legendary','Mega legendaria':'mega'})[b.rareza]||'common';
    const subtitle=make('span','fx-capture-subtitle',b.mega?'UN VÍNCULO IRREPETIBLE':rare?'UNA SEÑAL EXTRAORDINARIA':'NUEVO HALLAZGO REGISTRADO');stage.prepend(subtitle);
    const skip=button('Continuar sin animación',()=>{skip.disabled=true;cerrarCapturaOverlay(id);},'fx-skip-capture');overlay.append(skip);
    skip.focus({preventScroll:true});
    // El recurso confirmado se solicita de inmediato; el respaldo original permanece.
    const image=stage.querySelector('.portrait img');if(image){image.loading='eager';image.fetchPriority='high';}
    sound('capture',rare);
  }
  function enhanceModal(){
    const box=$('#modalContent'),portrait=box?.querySelector('.portrait.revealed[data-bioforma]');if(!portrait||box.querySelector('.fx-expand-art'))return;
    const id=portrait.dataset.bioforma;if(!progreso?.capturadas?.includes(id))return;
    const expand=button('Ampliar ilustración ↗',()=>showArtwork(id),'ghost fx-expand-art');portrait.closest('.bio-svg-wrap')?.after(expand);
    portrait.classList.add('fx-breathing');
  }
  function enhanceLineages(){
    if(typeof view==='undefined'||view!=='lineas')return;
    document.querySelectorAll('#view .grid.two > .card').forEach((card,i)=>{
      if(card.classList.contains('fx-lineage'))return;
      const line=[...new Set(BIOFORMAS.map(b=>b.linea))][i];if(!line)return;
      const members=lineaBioformas(line),complete=members.every(b=>progreso.capturadas.includes(b.id));card.classList.add('fx-lineage');card.classList.toggle('fx-lineage-complete',complete);
      card.append(make('div','fx-lineage-seal',complete?'✓ LINAJE COMPLETO':'◈ HISTORIA EN EXPLORACIÓN'));
    });
  }
  function enhance(){
    frame=null;
    try {
      observeProgress();enhanceCapture();enhanceModal();enhanceLineages();
      const current=typeof view==='undefined'?'':view;
      const legendVisible=$('#modalBack.show .mega-ficha')||($('#captureOverlay')?.style.display==='flex'&&$('#captureOverlay')?.dataset.fxRarity==='mega');
      setTheme(legendVisible?'legend':['mapa','gimnasios','lineas'].includes(current)?'journey':'refuge');
      if(current!==lastView){lastView=current;const main=$('#view');if(main){main.classList.remove('fx-view-enter');void main.offsetWidth;main.classList.add('fx-view-enter');}}
      const terminal=$('.capture-terminal'),validating=typeof busy!=='undefined'&&busy&&!!terminal&&$('#cloudStatus')?.textContent==='Validando y guardando…';
      terminal?.classList.toggle('fx-scanning',validating);
      if(terminal&&!terminal.querySelector('.fx-scan-status')){const s=make('p','fx-scan-status');s.setAttribute('role','status');terminal.querySelector('.capture-signal')?.after(s);}
      const scanStatus=$('.fx-scan-status');if(scanStatus){const text=validating?'Buscando señal y confirmando tu hallazgo…':'';if(scanStatus.textContent!==text)scanStatus.textContent=text;}
      if(lastBusy&&!validating){const t=$('#toast.show');if(t&&t.textContent!==lastToast){lastToast=t.textContent;sound(/error|incorrect|inválid|sin conex|no se|agotad/i.test(lastToast)?'error':'success');}}
      lastBusy=validating;
      document.querySelectorAll('.nav button').forEach(b=>{if(b.classList.contains('active'))b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
      pumpNotices();
    } catch(error){console.warn('BioDex: la capa audiovisual no pudo actualizarse.',error);}
  }
  function queueEnhance(){if(frame===null)frame=requestAnimationFrame(enhance);}
  for(const id of ['app','modalContent','captureOverlay','toast']){
    const el=document.getElementById(id),options={childList:true,subtree:true};
    if(id==='captureOverlay'||id==='toast'){options.attributes=true;options.attributeFilter=['style','class'];}
    if(el)new MutationObserver(queueEnhance).observe(el,options);
  }
  // busy termina sin mutar siempre el DOM: este pulso solo actualiza la presentación.
  setInterval(queueEnhance,350);queueEnhance();
})();
