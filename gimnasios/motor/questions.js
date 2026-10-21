(function(root){
'use strict';
// Banco de ensayo transversal. Las respuestas no se marcan en la interfaz
// antes de confirmar. El motor cambia su orden en cada pregunta.
const BANK=typeof module==='object'&&module.exports?require('../bancos/umbral.js'):root.BioDexQuestionBank;

function shuffle(a,rng=Math.random){const b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
function create(rng,bank=BANK){if(!Array.isArray(bank)||!bank.length||new Set(bank.map(q=>q.id)).size!==bank.length||bank.some(q=>!q.id||!q.stem||!q.explain||!Array.isArray(q.options)||q.options.length!==4||!Number.isInteger(q.answer)||q.answer<0||q.answer>3))throw Error('Banco de preguntas no válido.');return {bank:JSON.parse(JSON.stringify(bank)),deck:shuffle(bank.map(q=>q.id),rng),cursor:0,current:null,history:[],cycle:0};}
function present(state,mode,rng){
 if(!['attack','skill','guard'].includes(mode))throw Error('Estrategia no válida.');
 if(state.current)return state.current;
 if(state.cursor>=state.deck.length){const missed=state.history.filter(x=>!x.correct).map(x=>x.id);state.deck=shuffle(state.bank.map(q=>q.id),rng).sort((a,b)=>Number(missed.includes(b))-Number(missed.includes(a)));state.cursor=0;state.cycle++;}
 const base=state.bank.find(q=>q.id===state.deck[state.cursor]),order=shuffle([0,1,2,3],rng);
 state.current={id:base.id,topic:base.topic,stem:base.stem,figure:base.figure||null,options:order.map(i=>base.options[i]),answer:order.indexOf(base.answer),explain:base.explain,mode,selected:null,graded:false,applied:false};return state.current;
}
function choose(state,index){const q=state.current;if(!q||q.graded||!Number.isInteger(index)||index<0||index>3)return false;q.selected=index;return true;}
function grade(state){const q=state.current;if(!q||q.graded||q.selected===null)return null;q.graded=true;q.correct=q.selected===q.answer;state.history.push({id:q.id,correct:q.correct,mode:q.mode});state.cursor++;return {correct:q.correct,explain:q.explain,answer:q.answer,selected:q.selected,mode:q.mode};}
function consume(state){const q=state.current;if(!q||!q.graded||q.applied)return null;q.applied=true;const result={correct:q.correct,mode:q.mode};state.current=null;return result;}
const api={BANK,create,present,choose,grade,consume,shuffle};if(typeof module==='object'&&module.exports)module.exports=api;else root.MissionQuestions=api;
})(typeof window!=='undefined'?window:this);
