# PCB Mount Studio 3.0

A user-defined geometry and constraint editor with a three-step interface:
**Board & regions → Rules → Layout & check**.

Start with an empty project. There are no prefilled paper limits, guessed PCB shapes, schematic mount IDs or physical properties. The public URL stays at `assets/apps/pcb-mount-optimizer/index.html` for backward-compatible navigation, but this is a layout editor and external-result comparator, not an automatic FE optimizer.

## User workflow

1. Enter rectangular board dimensions and thickness in **mm**, draw a custom outline in that workspace, or import an ordered outline CSV (`x,y`). Define named **allowed mounting**, **keep-out**, **cut-out/hole**, **load** and **strain-check** polygons. Rectangles use two taps; polygons use individual vertices and Finish. Precise coordinates can be edited and regions can be deleted.
2. Enter minimum/maximum mount counts, centre-to-centre spacing, centre-to-boundary clearance, candidate-grid pitch, and whether only one mount is allowed per region. Enter the external FE model/load-case ID, total force, direction and boundary-condition description. Enable only the engineering checks needed, and supply their limits and agreement tolerances.
3. Place mounts by clicking the board, selecting admissible grid points, or entering x/y coordinates. Export the project or FE hand-off. Import separately computed prediction and FE results to compare them.

The board uses equal X/Y scales, X right and Y up. Zoom/fit and desktop Shift-drag pan are supported. Projects can be saved and reopened as JSON; no project file is sent to a server. Region or board changes reset mounts and prior comparisons. Other project-input changes clear prior comparisons. Geometry edits cannot silently retain an old verification result.

## Validation and evidence boundaries

- Simple non-self-intersecting planar outlines are supported, including concave shapes. Holes are polygon cut-outs. STEP/ODB++/3D CAD import is **not** implemented.
- Region containment is checked against the actual outline. Mount regions cannot overlap or touch. Cut-outs cannot intersect an active non-keep-out region. Keep-outs may overlay mount regions and exclude their points.
- Spacing and clearance operate on **mount centres**. Include the mount radius in the clearance value. Mechanical stability, material strength and FE mesh quality are not inferred from these geometric rules.
- Candidate generation is an admissible **grid**, not a global optimum or an automatic minimum-support solution.
- A hand-off contains geometry, regions, selected mounts, rules, enabled checks and loading context. One total force applies over the union of all load regions. It is **not a runnable solver deck**. The external FE model remains responsible for materials, meshes, connections, dynamic loading, supports and output definitions.
- Result templates use `pcb-mount-result/v3`, a method (`prediction` or `direct-fe`), a source/run ID and an exact canonical project `contextKey`. This key is a consistency check, not cryptographic authentication of a solver run. Results from another geometry, mount layout, rule set or load case are rejected.
- Missing numeric evidence is partial, not verified. Agreement of two failing predictions is labelled **FE design checks: FAIL**, never design acceptance. Each enabled strain/mode error uses relative percent; ratio error uses absolute percentage points. Both-zero relative comparisons are zero; a nonzero prediction against zero FE fails the relative-error gate.

## Running and tests

Serve the repository root:

```sh
python -m http.server 8000
```

Then open `/assets/apps/pcb-mount-optimizer/index.html`. The portfolio also has a static **Mount studio** navigation link, a **Open PCB Mount Studio** button in Selected work, and the Paper 2 showcase link. The forward entry remains present without JavaScript.

```sh
cd assets/apps/pcb-mount-optimizer
npm run check
python -m pip install playwright==1.57.0
python -m playwright install --with-deps chromium
python v3-tests/browser_smoke.py
```

The Node suite retains the earlier numerical regression tests and adds v3 geometry, rules, import/export and result-context checks. Browser tests execute the actual UI, downloads, imports, desktop/mobile-width drawing and both portfolio navigation directions. The CI workflow runs the full browser suite; local `STUDIO_INLINE_MODE=1` is only for restricted test environments and explicitly skips navigation tests. It is never enabled in CI.

The deployment workflow depends on successful tests and checks the published HTML/assets after deployment. Test fixtures contain synthetic geometry and values, never new FE measurements.

## Files and limits

`studio-core.js` contains pure geometry, project-schema and comparison logic; `studio.js` controls the UI; `studio.css` is the responsive theme. Earlier `model.js`, `data.js` and `app.js` are retained for numerical regression compatibility but are **not loaded by the v3 page**. Old v2 result JSON is not silently reassigned to a new project: export v3 result templates instead.

Editor resource limits: 500 vertices per polygon, 200 regions, 500 mounts, 100,000 sampled grid points, 10,000 displayed candidates and 2 MB import files. Excessive grid/geometry work is rejected with a message. These are software limits, not recommended engineering values.
