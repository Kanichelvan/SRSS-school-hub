# SRSS Photo Intake and Editing

Use this workflow whenever the user attaches new photographs, supplies readable local image paths, asks to add images to a page or gallery, or requests SRSS-compliant image editing.

## How users provide photographs

For a Codex task, invite the user to attach one image or a batch of images directly to the task, or to provide readable local file paths. Accept batches and organise them; do not require the user to send images one at a time.

Useful prompts include:

- `$srssdesign: Add these photos to the SRSS gallery and prepare web versions.`
- `$srssdesign: Use these new teacher and pupil photos to replace the homepage hero.`
- `$srssdesign: Process this batch using the SRSS photo edit guide; do not publish yet.`

Do not present a decorative or nonfunctional upload control in a website mock-up. If the user explicitly requests staff-managed uploads in the live website, implement a genuine authenticated media-library or CMS workflow with storage, validation, permissions and error states. Otherwise, use the local asset workflow below.

## Preserve and catalogue

Never overwrite or delete an original image. Create a predictable project structure, adapting the `public/` prefix to the framework:

```text
public/assets/photos/originals/
public/assets/photos/processed/
public/assets/photos/photo-manifest.md
```

Copy incoming files to `originals/` without modifying their bytes. Export edited derivatives to `processed/` with descriptive, placement-aware names such as:

- `hero-reading-1600x900.webp`
- `gallery-science-1200x800.webp`
- `team-teachers-1200x960.webp`

Record every accepted image in the manifest with:

- original filename and processed output path;
- subject or event, only when supplied by the user;
- whether children or identifiable people are present;
- consent or publication status: approved, pending, restricted or unknown;
- intended page, component and focal point;
- target aspect ratio and output dimensions;
- edits performed;
- factual alt text;
- notes about privacy, cropping or replacement.

Do not infer personal names, event names, consent or publication rights. For a private design mock-up, mark uncertain images `publication approval pending`. Before public deployment, surface unknown or restricted status to the user.

## Intake inspection

Inspect each original before editing. Check:

- pixel dimensions, orientation and usable crop area;
- sharpness, motion blur, noise and compression damage;
- exposure, white balance, skin tones and colour casts;
- face and hand visibility at the intended crop;
- SRSS uniform accuracy;
- distracting objects and background clutter;
- name tags, certificates, student work, screens, vehicle plates or other personal information;
- unintended religious or decorative symbols, incorrect signage and invented school marks.

Do not identify people from their faces. Do not transmit images outside the user-authorised editing workflow.

## Edit to the destination

Measure the destination component before choosing a crop or edit. Create separate derivatives when one photograph serves materially different placements.

### Public homepage hero

- Use the measured hero ratio, normally near 16:9.
- Keep teacher or pupil subjects on the right and create calm negative space on the left.
- Blend the image into Navy 950 `#06162F` at image level so the transition reads as one editorial composition.
- Avoid visible rectangular photo edges, halos, CSS gradient masks and hard cut-outs.
- Do not place the school logo or anniversary mark inside the hero image.

### Learning panorama

- Use an extra-wide ratio near 3:1.
- Use one documentary scene or two to three coherent learning moments with consistent light and perspective.
- Fade the top and bottom into Off-white `#FBFAF7` inside the raster asset.
- Keep faces and hands clear at desktop and mobile focal positions.

### News and student galleries

- Prefer 4:3 or 3:2 crops and preserve the candid activity.
- Keep exposure, white balance, contrast and crop logic consistent across the set.
- Use the approved expressive gradients in surrounding gallery cards or category modules, not as filters over documentary faces.
- Do not apply the homepage navy treatment unless the destination specifically calls for an editorial navy blend.

### Staff and leadership portraits

- Prefer 4:5 or 1:1 crops with calm, uncluttered backgrounds.
- Preserve recognisable identity and natural skin texture.
- Avoid glamour retouching, body reshaping or artificial background spectacle.

## Permitted corrections

Use restrained editorial corrections:

- exposure, white balance, tonal balance and natural colour;
- crop, rotation, perspective and horizon correction;
- careful noise reduction and sharpening;
- output resizing and web compression;
- removal of minor background clutter when it does not change the event or evidence in the photograph;
- background blending or removal when required by the approved component and when edges remain natural;
- privacy blur or removal of identifiable information when the user requests it or publication safety requires it.

For real documentary photographs, preserve facial identity, body shape, ethnicity, age, expressions, uniform, awards, certificates, school signage and event context. Do not replace faces, manufacture achievements, add people, change uniforms or turn a non-SRSS uniform into an SRSS uniform. Do not add fake badges, readable names, logos or text.

Correct small colour casts in the real lavender-and-aubergine SRSS uniform, but retain the fabric's natural variation. When generating fictional images, follow `imagery-and-uniform.md` and clearly treat the result as illustrative rather than documentary.

## Editing tools

Inspect the local image before using an image-editing tool. For generative edits, use the approved image editing capability and provide the original as a reference. Edit one image or a visually coherent batch at a time with a shared art direction. Prefer conventional resizing and compression tools for purely mechanical derivatives.

Do not use generative editing when crop, colour correction, background removal or compression will achieve the result more faithfully.

## Web export

- Homepage hero: normally 1600–2400 px wide.
- Gallery and feature image: normally 1200–1600 px wide.
- Card thumbnail: normally 600–900 px wide.
- Prefer WebP for photographs; use high-quality JPEG as fallback.
- Use PNG only for genuine transparency, the official logo or artwork that requires lossless edges.
- Start photographic compression around quality 78–88 and inspect the result rather than assuming a value.
- Generate responsive sizes and `srcset` when implementing the website.
- Write factual alt text describing the visible activity. Include names only when supplied and approved.

## Quality assurance

Compare the original and processed derivative side by side. Verify:

- faces, hands and important activity remain sharp and naturally proportioned;
- skin tones and uniform colours remain credible;
- crop and focal point work on desktop and mobile;
- background removal or blending has no halo or cut-out edge;
- signs, certificates and personal information are handled intentionally;
- no invented logo, name, badge, symbol or text has appeared;
- file type, dimensions and file size match the destination;
- manifest entry and alt text match the actual derivative.

Keep the originals until the user explicitly authorises deletion.
