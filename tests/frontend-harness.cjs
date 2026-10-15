const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
function frontend(){
 const elements=new Map(),local=new Map(),session=new Map();
 const classes=()=>{const s=new Set();return {add:x=>s.add(x),remove:x=>s.delete(x),contains:x=>s.has(x),toggle:(x,on)=>on?s.add(x):s.delete(x)};};
 function element(id){if(elements.has(id))return elements.get(id);const e={id,innerHTML:'',textContent:'',value:'',style:{setProperty(k,v){this[k]=v;}},classList:classes(),children:[],appendChild(x){this.children.push(x);},remove(){},setAttribute(k,v){this[k]=v;},removeAttribute(k){delete this[k];},showModal(){this.open=true;},close(){this.open=false;},addEventListener(){},querySelector(){return null;},querySelectorAll(){return [];},focus(){},scrollIntoView(){},isConnected:true};elements.set(id,e);return e;}
 const document={getElementById:element,createElement:()=>element('created-'+Math.random()),querySelectorAll:()=>[],querySelector:()=>null,addEventListener(){},activeElement:null,body:element('body'),head:element('head')};
 const storage=map=>({getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)});
 const c={console,document,window:{BIODEX_CONFIG:{endpoint:'https://script.google.com/macros/s/TEST/exec',version:'2.0'},addEventListener(){}},localStorage:storage(local),sessionStorage:storage(session),setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},AbortController,URL,Blob,confirm:()=>true,navigator:{},btoa:v=>Buffer.from(v,'binary').toString('base64'),atob:v=>Buffer.from(v,'base64').toString('binary'),fetch:async()=>({ok:true,json:async()=>({ok:true,progreso:JSON.parse(vm.runInContext('JSON.stringify(progreso)',c))})})};
 vm.createContext(c);const html=fs.readFileSync(path.join(root,'index.html'),'utf8');for(const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g))vm.runInContext(m[1],c);for(const file of ['remaster.js','retro.js','megas.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),c);
 const evaluate=s=>vm.runInContext(s,c);return {c,evaluate,elements,element,local,session};
}

function account(f){f.evaluate('sesion={token:"test"};progreso=defaultProgress();progreso.jugador="Exploradora Ada";render()');return f;}
module.exports={frontend,account};
