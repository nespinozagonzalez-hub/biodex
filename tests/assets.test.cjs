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
function transparentPNG(file){
 const b=fs.readFileSync(file);assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 let alpha=false;for(let i=8;i<b.length;){const n=b.readUInt32BE(i),type=b.toString('ascii',i+4,i+8);if(type==='IHDR')alpha=[4,6].includes(b[i+17]);if(type==='tRNS'&&b.subarray(i+8,i+8+n).some(v=>v<255))alpha=true;i+=n+12;}
 assert.ok(alpha,'PNG debe contener transparencia: '+file);return b;
}
test('los 30 recortes PNG son propios, transparentes y optimizados',()=>{
 const hashes=new Set(),crypto=require('node:crypto');let total=0;
 for(let n=1;n<=30;n++){const b=transparentPNG(path.join(__dirname,'../assets/cutouts/B'+String(n).padStart(3,'0')+'.png'));assert.ok(b.length>10000&&b.length<250000);total+=b.length;hashes.add(crypto.createHash('sha256').update(b).digest('hex'));}
 assert.equal(hashes.size,30);assert.ok(total<6000000);
});
test('hay cuatro avatares PNG transparentes y cuatro paisajes WebP',()=>{
 for(const id of ['aurora','nexo','prisma','terra'])transparentPNG(path.join(__dirname,'../assets/avatars',id+'.png'));
 for(const id of ['bosque','prisma','bruma','arcana']){const b=fs.readFileSync(path.join(__dirname,'../assets/landscapes',id+'.webp'));assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WEBP');assert.ok(b.length>10000&&b.length<500000);}
});
test('las tres mega legendarias tienen arte completo y recorte transparente propios',()=>{
 const hashes=new Set(),crypto=require('node:crypto');
 for(const id of ['B031','B032','B033']){
  const webp=fs.readFileSync(path.join(__dirname,'../assets/bioformas',id+'.webp'));
  assert.equal(webp.toString('ascii',0,4),'RIFF');assert.equal(webp.toString('ascii',8,12),'WEBP');assert.ok(webp.length>10000&&webp.length<300000);
  const png=transparentPNG(path.join(__dirname,'../assets/cutouts',id+'.png'));assert.ok(png.length>10000&&png.length<250000);
  hashes.add(crypto.createHash('sha256').update(webp).digest('hex'));hashes.add(crypto.createHash('sha256').update(png).digest('hex'));
 }
 assert.equal(hashes.size,6);
});
