# Image analysis — Eudora Lyra perfume bottle (lyra.png, 1151x1200)

## L1 Identification
- Work type: eau-de-parfum spray bottle (flacon). Broad class: glass cosmetic container. primaryDomain: object. Confidence 0.97.

## L2 Form & silhouette
- Radial symmetry (8-facet octagonal cross-section) about the vertical axis. Geometric shape language.
- Bounding volume ≈ W 1.0 : H 1.25 (body width = reference unit). Body = inverted "diamond/gem" solid:
  a narrow octagonal shoulder top (~0.40 W) flaring out along conical facets to a widest girdle at
  ~22% height from the base, then a short chamfered pavilion tapering into a flat base (~0.72 W).
- Collar: short cylinder (~0.25 W diameter, ~0.10 H tall). Atomizer: slim cylinder rising above collar.
- Cap: octagonal faceted crystal "gem" (~0.33 W across, ~0.16 H tall), table facet on top, crown facets.

## L3 Decomposition
- Macro: body (glass shell), liquid (inner volume), collar, cap.
- Meso: body shoulder facets (8), body lower pavilion facets (8), girdle edge ring, flat base,
  inner glass thickness; collar knurl band, collar top lip; atomizer stem + spray actuator w/ nozzle;
  cap table facet, cap crown facets, cap pavilion/skirt.
- Micro: collar dot-knurl rows (4 rows × ~24 dots), nozzle orifice (dark dot), front printed wordmark
  "EUDORA" + "LYRA" (white), dip tube (inferred), liquid meniscus line near shoulder.

## L4 Spatial relationships
- <collar, attached-to, body shoulder top> butt contact, collar sits on neck.
- <atomizer, inside, cap> the stem is visible through transparent cap; cap overlaps collar top.
- <liquid, inside, body> fills to ~85% of body height, meniscus below shoulder.
- <wordmark, printed-on, body front shoulder facet> flush.

## L5 Materials (PBR)
- body-glass: transparent dielectric, roughness ~0.02, IOR 1.5, thickness high; clear with faint
  pink transmission from liquid.
- liquid: translucent pink volume, attenuation color ~#f2a7b8, low roughness.
- cap-crystal: transparent clear acrylic/glass, roughness ~0.03, strong faceted refraction, faint cool tint.
- collar-metal: metallic 1.0, roughness ~0.25, bright silver (albedo ~#d8d8dc), dot knurl.
- atomizer: chrome metal (collar top) + clear stem.
- print: white opaque ink, matte.

## L6 Color & finish
- Liquid: pale pink (hue ~345°, low-mid saturation, high value) gradient deeper toward base/pavilion
  (stop 0 base #e98aa3 → stop 1 top #f7c6d2).
- Glass: gloss, colorless. Collar: polished silver, satin dots. Print: white, sans/serif caps.

## L7 Identity-defining features
1. Inverted diamond body silhouette with widest girdle low (critical).
2. Octagonal faceted crystal cap (critical).
3. Silver dot-knurl collar band (critical).
4. Pink liquid seen through clear glass (critical).
5. "EUDORA / LYRA" white wordmark on front (important).

## L8 Uncertainty
- Back side hidden: assumed radially symmetric (8-fold). Exact facet count on the lower pavilion
  inferred (8) from refraction pattern. Dip tube not visible (hidden by refraction). Exact cap
  interior geometry uncertain. Output is an approximate procedural reconstruction, not exact.
