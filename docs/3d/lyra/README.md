# Eudora Lyra — procedural 3D reconstruction

The bottle on the landing page is rebuilt in code (no downloaded mesh) with the
[img2threejs](https://github.com/img2threejs/img2threejs) pipeline, from a single front photo.

- `image-analysis.md` — 8-layer observation of the reference (form, parts, materials, unknowns).
- `object-sculpt-spec.json` — validated sculpt spec (`validate_sculpt_spec.py --strict-quality` PASS),
  with the review history of all 8 build passes (blockout → optimization).
- Runtime code: `src/app/shared/three/lyra-bottle.ts` (model) and `lyra-scene.ts` (lighting, camera story).

Units: girdle diameter = 1.0, Y up, base at Y = 0, front = +Z. Body, liquid and cap are 8-segment
lathes of the silhouette measured from the photo; the collar knurl is 4 × 24 instanced dots.

Known limits (single view): the back is assumed 8-fold symmetric, the dip tube is omitted, the
wordmark typography is approximate, and glass caustics / internal facet reflections are not simulated.
When changing dimensions or materials, update the spec too — the code must not be the only record.
