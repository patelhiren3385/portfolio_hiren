# Hiren Patel — GitHub Pages portfolio

A static portfolio: HTML, CSS, JavaScript, images, research figures and paper assets. No npm install, compilation, server or API keys are required.

## What is included

The portfolio presents five engineering questions and a STEP-to-simulation feature, with original research figures, concise results, supporting formulations and source documents. The opening uses authentic Smart Material MFC photography, Caterpillar product imagery and a photograph from Hiren's published PCB test.

The master's section places both studies together: original thesis geometry and control-response figures for the nominal system, followed by the stochastic response distribution. A short animation explains coordinate retention and feedback. The three-pair numerical thesis benchmark is distinguished from the associated two-actuator IFAC paper and from Hiren's separate dSPACE/MicroLabBox hardware experience. The complete thesis is included at `assets/papers/patel-thesis.pdf`.

Structural support selection shows original DMC strain maps comparing two four-mount layouts under the same 70 N load, followed by the 400 → 15 → 5 screening results and dynamic acceptance evidence. The source is included at `assets/papers/dmc-2026-digest.pdf`.

The thermomechanical section displays recorded temperature and cold-strain fields. Its dedicated page is `assets/apps/thermal-mount-search/index.html`, which embeds the supplied mount-search replay, convergence plots and field controls. The compatible `artifact.html` loads the original script bytes from `artifact.js`; the unchanged source remains available as `thermo_mechanical_mount_search.html`. These are recorded study results, not a new FE solve in the browser. Strain acceptance concerns three monitored zones. The example includes convection; spacecraft screw-tower cooling is a potential application requiring mission-specific thermal boundary conditions.

The STEP converter feature uses credited public reference imagery to explain component geometry/lead enrichment and retention of Sherlock's structured FE mesh. Its dedicated page is `assets/apps/step-converter/index.html`. Compact application links connect the methods to robotics, mobility, energy, aerospace, manufacturing and industrial equipment; these are potential transfers beyond demonstrated work.

The bearing story showcases **Bearing Insight**, a complete browser-local image-to-report application, replacing the previous binary bearing benchmark. The bundled app is at `assets/apps/bearing-insight/index.html`; it includes image input, a trained CNN, six ranked surface-pattern classes, engineering follow-up checks, downloadable results, model metrics and `research-package.zip`. A return link connects it to the portfolio, and the evidence table stays inside its mobile scroll area. No separate app server or API key is required.

The model is trained from scratch on **2,400 procedural synthetic images**, with **480 validation** and **600 final test images**. Its recorded final synthetic test accuracy is **87.2%** and macro-F1 is **86.6%**. The six outputs are smooth surface, scratch / scoring, pitting-like texture, corrosion-like texture, smearing / wiping and crack-like line. These are simplified appearances rather than validated failure mechanisms.

No real photographs were used for training or testing. Same-generator synthetic results do not establish real-bearing diagnostic accuracy. Scores are uncalibrated, the inconclusive threshold is a provisional interface heuristic, and the app does not determine root cause, remaining life or serviceability. The application is an independent portfolio demonstration; the résumé-grounded Caterpillar production application and its 1–10 wear-grading output remain a separate career record.

The model weights, inference implementation and research package come from the [Bearing Insight source app](https://bearing-insight-hiren.patelhiren3385.chatgpt.site), source commit `e9cf0661c1b1868764d1c4ca90ecae5a5f86c8c1`. Hosting the portfolio and running browser inference require no Python or machine-learning dependencies. Those dependencies are needed only to reproduce the training process described in the research package.

## Repository and address

| Option | Repository under `patelhiren3385` | Published address |
|---|---|---|
| Personal homepage | `patelhiren3385.github.io` | `https://patelhiren3385.github.io/` |
| Project site | For example, `portfolio` | `https://patelhiren3385.github.io/portfolio/` |

This export is prepared for **patelhiren3385.github.io** at **https://patelhiren3385.github.io/**. The address becomes live only after deployment succeeds.

## Publish

1. Create the chosen repository on GitHub. A public repository supports GitHub Pages on GitHub Free.
2. Put **the contents of this export** at the repository root: `index.html`, `assets/`, `.nojekyll`, `README.md` and `.github/workflows/pages.yml`. Include the hidden `.github` directory; do not upload the enclosing folder or just the ZIP.
3. Commit the files to `main`.
4. Open **Settings → Pages → Build and deployment → Source**, and choose **GitHub Actions**. The included workflow is ready to use.
5. Open **Actions → Publish portfolio to GitHub Pages → Run workflow** on `main` for the first deployment. Later pushes to `main` deploy automatically.
6. Use the URL shown by the successful deployment or **Settings → Pages**.

The workflow uploads the repository root directly. `.git` and `.github` are excluded from the published artifact by the upload action. The README is public content. The empty `.nojekyll` is included for static-site compatibility.

## Preview and edit

From this folder, run `python3 -m http.server 8000` and visit `http://localhost:8000/`. Edit `index.html` and the files in `assets/`; commit and push the changes. Keep asset references relative (`assets/...`) so they also work under a project URL. If you change the repository name, update the `og:url` and `og:image` URLs in `index.html` to the new Pages address.

Use `main` for this workflow, or update both branch references in `.github/workflows/pages.yml` if you choose another branch.

## Evidence and attribution

Preserve source and scope notes alongside reused figures, papers, data and photographs:

- **Bearing Insight:** preserve the model card, synthetic-data labels, model metrics, research references and training/parity code in its research package. The CNN is trained from scratch; it does not use the former benchmark’s pretrained MobileNetV2 model.
- **Synthetic samples:** the six app examples are procedural texture images. Do not relabel them as photographs of actual damage. No third-party research photographs are redistributed by this app. A downloaded candidate archive was excluded because labels and reuse permissions were not established.
- **Research figures and papers:** retain their existing author, venue, DOI and licence notices. A figure's presence in this repository does not grant a new licence beyond its original terms.
- **Hardware imagery:** preserve `assets/photography/IMAGE_CREDITS.md`, `sources.json` and the visible source captions. Manufacturer photographs and product imagery are hardware references, not Hiren's exact apparatus or an endorsement. Manufacturer rights remain reserved; they are not presented as open licensed.
- **Thesis and DMC evidence:** preserve the original figure captions, source links and numerical-study scope. Computation savings are specific reported benchmarks; minimum mount count is scoped to the sampled layouts.
- **Thermal artifact:** preserve `assets/apps/thermal-mount-search/compatibility-manifest.json` and the provenance files in `assets/evidence/thermal-v10/`. The main-page fields reproduce stored quantized display data; their lossless WebP encoding preserves the plotted pixels. Keep the unchanged original HTML and its compatibility presentation together. Do not relabel the convection benchmark as a vacuum spacecraft case or imply global optimality or independent full-FE validation.
- **Converter references:** preserve `assets/evidence/converter/IMAGE_CREDITS.md`, its provenance record and visible captions. The public images are assembly/component references, not results generated by the converter.

Use Bearing Insight’s bundled `metrics.json` for that app’s numerical outputs and its research package when reproducing model training. Research-study metrics come from their linked thesis, paper or recorded-artifact source. Keep model weights and inference code together. Do not manually improve displayed scores or infer severity, remaining life, real-image accuracy or Caterpillar performance from synthetic testing.

## Official references

- [GitHub Pages site types and URL rules](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- [Choose GitHub Actions as the publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [Custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Checkout v7 release](https://github.com/actions/checkout/releases/tag/v7.0.1) · [Pages artifact v5 release](https://github.com/actions/upload-pages-artifact/releases)

Action versions checked against official GitHub sources on 2 November 2026: `checkout@v7`, `configure-pages@v5`, `upload-pages-artifact@v5`, `deploy-pages@v4`.
