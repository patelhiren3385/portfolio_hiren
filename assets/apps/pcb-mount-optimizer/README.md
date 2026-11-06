# PCB Mount Layout Studio

A static browser application for the Paper 2 mount-layout workflow. It improves the earlier prototype in three places:

1. **Mount selection** — click the board map, add a mount by ID, enforce an exact count, and prevent more than one mount from the same region.
2. **Prediction-to-FE verification** — import model and direct-FE JSON, compare numerical errors, and check whether both methods reach the same engineering pass/fail decision.
3. **Portfolio integration** — the app uses the portfolio’s light visual system and runs directly on GitHub Pages without a backend or build step.

## Evidence boundary

The embedded Paper 2 values are copied from the repository evidence record. The default 52-candidate map is deliberately labelled **schematic**: the IDs match the study naming, but its coordinates and region boundaries are interaction placeholders. Import the physical project CSV before using geometric descriptors for engineering work.

The geometric score is not a strain, modal-frequency, or fatigue prediction. The browser does not run an FE solver. It exports a solver request and compares returned FE output against a prediction.

## Run locally

Open `index.html` through any static server, for example:

```bash
python -m http.server 8000
```

Then open the app directory in the browser.

## Test

No package installation is required. Node.js 20 or newer is sufficient.

```bash
npm run check
```

The suite includes numerical unit tests, the published-layout integration workflow, CSV import, report generation, and a DOM contract test that checks every static element used by `app.js`.

## Candidate CSV

Required columns:

```csv
id,x,y,region
G001,12.4,8.2,R01
G002,18.1,8.2,R02
```

Accepted aliases include `mount_id`, `x_mm`, `y_mm`, and `region_id`. Each mount ID must be unique. The UI enforces one selected mount per region.

## Prediction or FE JSON

The simplest supported structure is:

```json
{
  "strainMicrostrain": 1510,
  "firstModeHz": 812,
  "peakRatioPercent": 4.2,
  "dynamicCriterionPass": true,
  "source": "Direct FE job 2026-11-06-01",
  "note": "Optional provenance note"
}
```

`dynamicCriterionPass` is useful when the source establishes pass/fail but does not preserve an exact peak-ratio value. The app never converts that status into a fabricated number.

The importer also accepts the result nested under `prediction`, `modelPrediction`, `directFe`, `fe`, or `result`.

## Solver request

A valid layout exports `pcb-mount-solver-request/v1`, containing:

- selected mount IDs, coordinates, and regions;
- exact-count and one-per-region constraints;
- the study load context;
- the three requested FE outputs.

It contains no response prediction.

## Browser integration API

A parent page or future FE adapter can use:

```js
window.PCBMountApp.loadPrediction({...});
window.PCBMountApp.loadFeResult({...});
window.PCBMountApp.getSolverRequest();
window.PCBMountApp.getReport();
```

## Files

- `model.js` — pure validation, geometric descriptors, engineering-limit evaluation, comparison, CSV parsing, and report generation.
- `data.js` — immutable Paper 2 evidence and the labelled schematic candidate set.
- `app.js` — browser state and interactions.
- `style.css` — responsive portfolio-compatible visual system.
- `tests/` — unit, integration, and DOM-contract tests.
