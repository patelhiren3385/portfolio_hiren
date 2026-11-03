# Thermomechanical mount-search evidence

Source: the user-supplied `thermo_mechanical_mount_search.html`, hosted unchanged at `../../apps/thermal-mount-search/thermo_mechanical_mount_search.html`.

The dedicated page embeds the compatible `artifact.html` presentation. It places the original head/body markup inside a complete HTML document and loads the exact original inline script bytes from `artifact.js`. This avoids host HTML instrumentation interfering with SVG markup inside script literals. Data, calculations, drawing and playback logic are unchanged. The uploaded HTML remains available unchanged through **Download original HTML**. Source/script hashes and compatibility verification are in `../../apps/thermal-mount-search/compatibility-manifest.json`.

The two lossless WebP images are plots of the embedded mesh and the final accepted fields for subset **1+2+3+5**, after 20 region sweeps. Field indices are 95 (hot temperature) and 99 (cold combined mechanical equivalent strain). The source stores one unsigned byte per element on the ranges 60–110 °C and 0–3000 µε; these quantized visualization fields are preserved without inventing or smoothing results. Mounts, source positions, interest-zone boundaries, geometry and colours follow the source data. Display scales saturate at their stated maxima. The field images are scientific replots, not photographs or AI images.

`thermal-summary.json` contains the original HTML hash, accepted mount positions, numerical metrics, exact timing totals, conditions and validation scope. The convergence SVG derives each constraint margin from the accepted-layout numerical records, not from the quantized fields.

The HTML replays recorded results and display fields; it does not rerun an FE solver in the browser. All recorded timings are source-reported one-core measurements. No independent full-FE error study is bundled. The benchmark includes convection on both faces, 60 °C air, 70 °C housing and 2.66 W power; it is not a vacuum spacecraft thermal case. The final 0.836 W through the mounts is about 31.4% of total source power. Spacecraft mounting is a transfer application requiring revised thermal boundaries and mission validation.

Managed-preview verification on 3 November 2026 confirmed populated subset choices, a running recorded search, rendered mesh canvas, updating convergence plots and no artifact console errors. Field and pause control checks are handled separately in the site-level validation.

The field plots use lossless WebP encoding to keep the portable download within the host asset-size limit. Decoded RGBA pixels were verified identical to the source PNG plots; `image-encoding.json` records sizes and hashes. The supplied HTML and externalized JavaScript are untouched.
