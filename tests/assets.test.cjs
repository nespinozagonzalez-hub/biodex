const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
test('las 30 bioformas tienen una ilustración WebP propia optimizada',()=>{
 const shas=new Set();const crypto=require('node:crypto');let total=0;
 for(let n=1;n<=30;n++){
  const id='B'+String(n).padStart(3,'0'),file=path.join(__dirname,'../assets/bioformas',id+'.webp');
  assert.ok(fs.existsSync(file),'Falta '+id);
  const bytes=fs.readFileSync(file);assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');
  assert.ok(bytes.length>5000&&bytes.length<300000,'Tamaño fuera de rango '+id);total+=bytes.length;
  shas.add(crypto.createHash('sha256').update(bytes).digest('hex'));
 }
 assert.equal(shas.size,30,'Cada bioforma debe tener su propia imagen');assert.ok(total<6000000,'Colección demasiado pesada');
});
