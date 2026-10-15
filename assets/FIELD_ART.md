# FIELD-02 · Recursos de la edición retro

Generados con la herramienta de imágenes integrada, no mediante un servicio CLI.
Los archivos originales de `bioformas/` no se reemplazaron. Las imágenes finales
se optimizaron para web conservando el canal alfa de las salidas transparentes.

## Archivos y usos

- `cutouts/B001.png` a `cutouts/B030.png`: recortes transparentes, 480 × 480,
  para pantalla de campo, siluetas y animación de captura.
- `bioformas/B001.webp` a `bioformas/B030.webp`: arte completo de la edición
  anterior, conservado en las tarjetas capturadas y fichas.
- `avatars/{aurora,nexo,prisma,terra}.png`: cuatro avatares transparentes,
  320 × 320, compartiendo dirección de exploración retro.
- `landscapes/{bosque,prisma,bruma,arcana}.webp`: cuatro paisajes pixel art,
  1280 × 720, para inicio, refugio y entorno del dispositivo.

## Prompts finales

Se realizó una llamada independiente por recurso (38 llamadas).

### Recortes (30 ediciones)

Entrada: ilustración local correspondiente de `bioformas/Bxxx.webp`.

> Use case: background-extraction. Edit target: the attached BioDex creature
> illustration Bxxx. Remove ONLY the surrounding scenery and background,
> producing the exact same single creature as a clean full-body PNG cutout on
> genuine transparent alpha. Preserve its identity, anatomy, pose, original
> detailed painterly rendering, colors, wings, antennae, tails, attached
> accessories, internal lighting and creature-bound glow. Keep the entire
> creature inside the canvas with a small transparent margin. Remove landscape,
> floor, trees and environmental particles unrelated to the creature. For a
> creature carrying moss or ecosystems on its own body, retain those body
> features. No redesign, no text, no border, no shadow rectangle, no checkerboard
> pattern. True transparent background.

### Avatares (cuatro generaciones)

Prompt común:

> Use case: stylized-concept. Asset type: selectable explorer avatar for a retro
> nature creature-collection game. One [subject]. Full-body centered standing
> friendly confident pose, entire head and boots visible, square canvas,
> generous clear margins. Beautiful premium 32-bit pixel art sprite illustration,
> crisp pixel clusters, readable silhouette, compact proportions with slightly
> larger head, detailed fabric, warm rim light. Cohesive emerald/cream/amber
> expedition-game art direction. Genuine transparent alpha background. No floor,
> no scenery, no text, no logo, no watermark, no recognizable franchise.

Sujetos:

- Aurora: female explorer with warm brown skin, short curly dark hair,
  terracotta jacket, teal scarf, compact field capture device.
- Nexo: male explorer with medium olive skin, wavy dark hair, teal utility coat,
  amber shoulder satchel and field scanner.
- Prisma: female explorer with light skin, short silver hair, violet field
  jacket, botanical sample bag, small capture device.
- Terra: male explorer with dark skin, close cropped hair, mustard field
  jacket, green backpack, field notebook.

### Paisajes (cuatro generaciones)

Prompt común:

> Use case: stylized-concept. Asset type: wide landscape background for a retro
> handheld creature exploration game. Scene: [scene]. Premium detailed 32-bit
> pixel art environment, crisp readable pixel clusters, cinematic depth,
> painterly color design built from pixels. Wide 16:9 composition, no characters
> or creatures, foreground framing and open center. Cohesive emerald/cream/amber
> expedition-game palette. No UI, no text, no logos, no watermark.

Escenas:

- Bosque: ancient emerald forest at dawn, sunbeams, mossy stepping stones beside
  a winding stream, small glowing plants.
- Prisma: luminous turquoise lake surrounded by violet quartz outcrops and dense
  emerald woodland, tranquil twilight.
- Bruma: small abandoned brass-and-stone field observatory in a misty pine
  forest, warm window light, mountain silhouettes.
- Arcana: volcanic mountain highlands at sunset, copper grass, slate rocks,
  distant lava glow, dramatic violet sky.


## Gremio de exploradores (2.3)

Archivo: `assets/landscapes/gremio.webp`. Generado con la herramienta integrada
image_gen; convertido a WebP sin cambios en la composición para la web.
Prompt: Panoramic pixel art exploration guild sanctuary in an ancient forest,
central copper-and-emerald glass observatory atrium, luminous crystal doorway,
stone terraces, ivy, brass lanterns, waterfalls and blue mountains. Architectural
hero on the right, darker foliage on the left for HTML headings. Golden afternoon
light, emerald / parchment gold / turquoise. No people, creatures, text, logos,
interface, frames or collage. Master: 1536 × 1024.
## Tres mega legendarias (2.4)

Generadas mediante image_gen como activos originales para BioDex. Arte completo
optimizado a WebP de 640 px; PNG con alpha real para la animación de captura.
Solo conversión de formato, reducción de tamaño y compresión después de generar.

### B031 · Astrael

- Arte: `assets/bioformas/B031.webp`.
- Recorte: `assets/cutouts/B031.png`.
- Prompt de ilustración:

> Use case: stylized-concept. Asset type: square full-art portrait for an original mega legendary creature in BioDex fantasy collectible game. Astrael, guardian of dawn: majestic white-and-navy celestial gryphon with six broad luminous feathered wings in a royal fan, elegant leonine body, elegant avian face, golden crystal crest shaped like an eclipse, flowing comet-like tail and small star freckles, brass-gold and pearlescent blue accents. Entire creature clearly visible with wings and feet inside canvas, three-quarter hero pose on an ancient floating stone platform above luminous clouds and astronomical ruins at sunrise. Premium highly detailed painterly fantasy creature art, natural coherent anatomy, epic cinematic lighting, jewel-like textures, magical elegance, polished collectible-card illustration. Original design, not based on any existing game character. No humans, no text, numbers, logos, card frame or UI. Square 1024x1024.

### B032 · Thalúmor

- Arte: `assets/bioformas/B032.webp`.
- Recorte: `assets/cutouts/B032.png`.
- Prompt de ilustración:

> Use case: stylized-concept. Asset type: square full-art portrait for an original mega legendary creature in BioDex fantasy collectible game. Thalumor, guardian of the deep: enormous elegant manta-and-sea-dragon hybrid with one coherent body, broad sweeping ray fins, long curled serpentine tail, crown of coral-like sapphire crystal horns, calm intelligent eyes, dark teal skin with glowing cyan constellations, polished pearl and amethyst armor ridges, three pairs of luminous ribbon whiskers. Entire creature fully visible, gracefully floating above an ancient submerged stone sanctuary in a bioluminescent abyss, underwater sunbeams, tiny glowing plankton, no other animals. Premium highly detailed painterly fantasy creature art, coherent anatomy, majestic not frightening, epic deep turquoise and violet cinematic lighting, polished collectible-card illustration. Original design not based on existing characters. No humans, text, numbers, logos, card frames or UI. Square 1024x1024.

### B033 · Ignivar

- Arte: `assets/bioformas/B033.webp`.
- Recorte: `assets/cutouts/B033.png`.
- Prompt de ilustración:

> Use case: stylized-concept. Asset type: square full-art portrait for an original mega legendary creature in BioDex fantasy collectible game. Ignivar, guardian of the primordial forge: majestic armored volcanic lion-dragon with strong quadruped anatomy, dark obsidian crystal plates, a regal flowing mane of amber molten light, two curved bronze horns, translucent ruby wing membranes held high, long tail ending in a luminous geode, intense golden eyes. Entire powerful creature clearly visible including all four feet, horns, wings and tail, three-quarter royal pose on an ancient black stone volcanic arch, distant lava waterfall and sunrise through ash clouds. Premium highly detailed painterly fantasy creature art, coherent anatomy, noble guardian rather than horror, warm gold, ruby and black palette, cinematic epic lighting, polished collectible-card illustration. Original design not based on any existing game character. No humans, text, numbers, logos, card frames or UI. Square 1024x1024.

Prompt de edición para los tres recortes: Create a clean transparent PNG cutout of exactly the single central fantasy creature in the provided reference. Preserve the exact character design, colors, intricate painterly rendering, pose and facial expression. Include the whole creature with all wings, fins, horns, whiskers, tail and feet. Remove scenery, ground, platform and particles outside the body. Genuine transparent alpha background; no background color, checkerboard, white outline or ground shadow.
