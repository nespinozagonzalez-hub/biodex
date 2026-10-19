"""UI-native FIELD-02 lens. Produces SVG and PNG icons without changing game art."""
from pathlib import Path
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets'/'pixel';OUT.mkdir(parents=True,exist_ok=True)
shapes=[
('#173f35',[(7,0),(25,0),(25,2),(29,2),(29,6),(31,6),(31,26),(29,26),(29,30),(25,30),(25,32),(7,32),(7,30),(3,30),(3,26),(1,26),(1,6),(3,6),(3,2),(7,2)]),
('#e4e1bb',[(8,2),(24,2),(24,4),(28,4),(28,28),(24,28),(24,30),(8,30),(8,28),(4,28),(4,4),(8,4)]),
('#94ac82',[(6,6),(26,6),(26,26),(6,26)]),
('#284f40',[(11,5),(21,5),(21,7),(25,7),(25,11),(27,11),(27,21),(25,21),(25,25),(21,25),(21,27),(11,27),(11,25),(7,25),(7,21),(5,21),(5,11),(7,11),(7,7),(11,7)]),
('#4d9b82',[(12,8),(20,8),(20,10),(23,10),(23,13),(25,13),(25,19),(23,19),(23,23),(19,23),(19,25),(13,25),(13,23),(9,23),(9,19),(7,19),(7,13),(9,13),(9,10),(12,10)]),
('#78ccaa',[(12,9),(19,9),(19,11),(22,11),(22,18),(20,18),(20,21),(12,21),(12,19),(9,19),(9,12),(12,12)]),
('#c5efd0',[(12,10),(18,10),(18,12),(20,12),(20,16),(17,16),(17,19),(12,19),(12,17),(10,17),(10,12),(12,12)]),
('#f4f7d6',[(12,11),(17,11),(17,15),(12,15)]),
('#356c58',[(20,18),(24,18),(24,21),(22,21),(22,24),(18,24),(18,22),(20,22)])]
im=Image.new('RGBA',(32,32),(0,0,0,0));d=ImageDraw.Draw(im)
parts=[]
for color,points in shapes:
 d.polygon(points,fill=color)
 parts.append('<polygon fill="'+color+'" points="'+' '.join(f'{x},{y}' for x,y in points)+'"/>')
svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" shape-rendering="crispEdges"><title>BioDex FIELD-02</title>'+''.join(parts)+'</svg>'
(OUT/'favicon.svg').write_text(svg)
im.save(OUT/'favicon-32.png');im.resize((180,180),Image.Resampling.NEAREST).save(OUT/'apple-touch-icon.png')
