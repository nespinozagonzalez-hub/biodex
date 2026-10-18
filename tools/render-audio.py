from pathlib import Path
import numpy as np, subprocess, wave
OUT=Path(__file__).resolve().parents[1]/'assets'/'audio';SR=22050
OUT.mkdir(parents=True,exist_ok=True)
SCORES={
'refuge':([60,64,67,71,67,64,62,67,60,64,69,67,64,62,59,62],[[48,55,64],[45,52,60],[41,48,57],[43,50,59]],.52),
'journey':([62,69,74,77,74,69,65,72,62,65,69,72,67,65,60,65],[[50,57,65],[46,53,62],[48,55,64],[45,52,60]],.46),
'legend':([57,64,69,71,76,71,69,64,53,60,65,69,72,69,65,60],[[45,52,60],[41,48,57],[48,55,64],[43,50,59]],.65)}
def note(n,dur,amp,pad=False):
 t=np.arange(int(dur*SR))/SR;f=440*2**((n-69)/12)
 signal=np.sin(2*np.pi*f*t)+(.12 if pad else .22)*np.sin(2*np.pi*f*2*t)
 env=(1-np.exp(-t/(.18 if pad else .025)))*np.exp(-t/(dur*.5))
 env*=np.clip((dur-t)/(.4 if pad else .12),0,1)
 return signal*env*amp
def write(name,x):
 x=x/(max(np.max(np.abs(x)),.001))*0.87
 wav=Path('/tmp/biodex-'+name+'.wav')
 with wave.open(str(wav),'wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes((x*32767).astype('<i2').tobytes())
 subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),'-codec:a','libmp3lame','-b:a','64k','-map_metadata','-1',str(OUT/(name+'.mp3'))],check=True)
for name,(notes,chords,step) in SCORES.items():
 length=int(64*step*SR);x=np.zeros(length)
 def add(y,pos):
  idx=(np.arange(len(y))+int(pos*SR))%length;np.add.at(x,idx,y)
 for b in range(64):
  add(note(notes[b%16],1.7,.22),b*step)
  if b%8==0:
   for n in chords[(b//8)%4]:add(note(n,step*8,.11,True),b*step)
  if b%16==12:add(note(notes[b%16]+12,2.1,.055),b*step)
 write(name,x)
FX={'tap':[76],'scan':[48,55,60],'success':[60,64,67,72],'medal':[67,72,76,79],'capture':[60,64,67,72],'rare':[48,60,67,72,76,79,84],'error':[52,48],'test':[60,64,67,72]}
for name,notes in FX.items():
 step=.12;dur=.16 if name=='tap' else .55;x=np.zeros(int((len(notes)*step+dur)*SR))
 for i,n in enumerate(notes):
  y=note(n,dur,.4);p=int(i*step*SR);x[p:p+len(y)]+=y
 write(name,x)
print('Pistas y efectos:',len(list(OUT.glob('*.mp3'))),'· bytes:',sum(p.stat().st_size for p in OUT.glob('*.mp3')))

PREVIEW=OUT.parents[1]/"preview"/"assets"/"audio"
PREVIEW.mkdir(parents=True,exist_ok=True)
for p in OUT.glob("*.mp3"):(PREVIEW/p.name).write_bytes(p.read_bytes())
