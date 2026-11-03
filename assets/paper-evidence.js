/* Paper-specific evidence. Published, résumé-reported and working-draft results
   are identified at the point of use. No invented response histories. */
(function () {
  'use strict';
  const p = window.PORTFOLIO;
  const asset = name => 'assets/evidence/' + name;
  p.paperCases = {
    'serep-control-2020': {
      label: 'MASTER’S PAPER 01 / IIT MADRAS / IFAC 2020',
      headline: 'Keep the physics.\nShrink the model.',
      takeaway: 'A 38-DOF model controlled the beam more effectively than a 96-DOF model. The difference was knowing which coordinates mattered.',
      problem: 'Large flexible-structure models make feedback design expensive. Reducing the wrong coordinates can lose the actuator–structure interaction the controller needs.',
      solution: 'Formulate the electromechanical FE model, retain selected physical coordinates with SEREP, and design an LQR in the reduced space.',
      novelty: 'An integrated reduction-and-control workflow that demonstrates why retaining the actuator junctions matters more than simply keeping more coordinates.',
      result: 'The physically informed 38-DOF selection retained the actuator junctions and gave a controlled response close to full-order LQR. The paper reports a 97.5% reduction in computation cost for this numerical example.',
      metrics: [
        {value: '402 → 38', label: 'Full → reduced mechanical DOFs'},
        {value: '97.5%', label: 'Reported computation-cost reduction'},
        {value: 'Full-model', label: 'Dynamics and control-response checks'}
      ],
      capability: ['Electromechanical FE', 'SEREP + LQR', 'Physics-aware reduction'],
      mainVisual: {src: asset('serep-published-control.png'), title: 'Published result · controlled displacement', alt: 'Original Figure 12 compares full-order LQR and two SEREP coordinate selections. The 38-DOF response closely follows full-order control; the 96-DOF response decays more slowly.', caption: 'Patel, Kumar & Ali (2020), Fig. 12, p. 55. Cyan: 38 DOF; red: 96 DOF; magenta: full-order LQR. Original numerical result, with its axes and legend preserved.'},
      visualAside: {label: 'THE MODELLING DECISION', title: 'Actuator junctions are not optional.', text: 'The 96-DOF model used a uniform coordinate selection that missed critical junctions. The smaller 38-DOF model kept them. This is evidence of modelling judgment, followed by a full-system check.'},
      methodVisual: {src: asset('serep-formulation.svg'), title: 'From coupled mechanics to reduced feedback', alt: 'Mathematical summary of electromechanical finite elements, SEREP projection, reduced LQR synthesis and full-model numerical evaluation.', caption: 'Formulation summary of Sections 2–4 of the original IFAC paper. SEREP and LQR are established methods; this work integrates them and examines coordinate selection.'},
      figures: [{src: asset('serep-published-frf.png'), title: 'Verify the dynamics before designing control', alt: 'Published full-FE and SEREP frequency-response functions, with the first five natural frequencies compared in an inset.', caption: 'Patel, Kumar & Ali (2020), Fig. 6, p. 54. The paper also reports the first 30 Modal Assurance Criterion values close to one. No exact error threshold is inferred from the plot.'}],
      equations: [
        {label: 'Physical-coordinate reduction', formula: 'q ≈ Tqᵣ;  Mᵣ = TᵀMT;  Cᵣ = TᵀCT;  Kᵣ = TᵀKT', note: 'The transformation preserves selected physical coordinates and modal information. Actuator junctions are included in the successful selection.'},
        {label: 'Reduced control objective', formula: 'J = ∫₀∞ (xᵣᵀQxᵣ + uᵀRu) dt', note: 'Solve the reduced Riccati problem, then evaluate the reduced-designed actuator feedback on the original numerical model.'}
      ],
      sections: [
        ['My contribution', 'Developed the electromechanical FE and reduced-control workflow with my coauthors. The work connects beam formulation, physical-coordinate selection, reduced controller synthesis and numerical verification. My MATLAB electromechanical FE work was also checked against Abaqus, as documented in my résumé.'],
        ['Model and comparison', 'The numerical cantilever has two bonded piezoelectric actuators. Its 200-element model has 402 DOF and 804 first-order states. Case 1 retains approximately 48 nodes / 96 DOF; Case 2 retains 19 nodes / 38 DOF. The reported computation-cost reductions are 95% and 97.5%, respectively.'],
        ['What the result establishes', 'The smaller model is more useful because the retained coordinates preserve the actuator coupling. Frequency responses, natural frequencies, modal correspondence and controlled time histories provide complementary fidelity checks.'],
        ['Boundary of the evidence', 'The reported control results are numerical. The 97.5% figure is neither a vibration-reduction percentage nor a universal runtime guarantee. Full-model eigenanalysis remains a preprocessing cost. The dSPACE experimental facility is presented separately.']
      ],
      industries: ['Precision equipment', 'Flexible machine structures', 'Smart panels'],
      industryText: 'Useful when repeated controller design needs a compact structural model that still captures how an actuator moves the structure. Application to a new product requires its own geometry, actuation and validation.',
      sourceNote: 'Original paper: IFAC-PapersOnLine 53(1), 51–56, Sections 2–5.1 and Figures 6, 7, 12; © IFAC. Its two-actuator numerical model is distinct from the three-pair thesis benchmark shown in the main overview. Thesis: Reduced order model integrated control of beams (June 2021), Chapter 4, Figs. 4.1, 4.9–4.11. Both sources are explicitly labelled.',
      url: 'https://doi.org/10.1016/j.ifacol.2020.06.009',
      related: ['stochastic-control-2020']
    },
    'stochastic-control-2020': {
      label: 'MASTER’S / STOCHASTIC CONTROL / THESIS + ASSOCIATED SICE PAPER',
      headline: 'Real structures vary.\nThe model should, too.',
      takeaway: 'Carry material variability through reduced-model control and inspect the response distribution.',
      problem: 'A nominal material model hides the effect of specimen-to-specimen stiffness variation on vibration.',
      solution: 'Sample lognormal Young’s modulus, build the electromechanical model and design LQR feedback for each realization; compare full and reduced predictions over 1,000 Monte Carlo realizations.',
      novelty: 'Connect physical model reduction, controller synthesis and uncertainty propagation in one numerical workflow.',
      result: 'The thesis reports about 35% reduction in mean maximum displacement for its controlled stochastic example. Its 320-active-DOF case reports 45.60% time saved. The plots below are the original uncontrolled and controlled distributions, with their original axes; each realization receives its own calculated gain.',
      metrics: [
        {value: '1,000', label: 'Monte Carlo realizations · thesis Chapter 5'},
        {value: '≈35%', label: 'Reported mean peak-displacement reduction'},
        {value: '45.60%', label: 'Time saved · 320 active mechanical DOFs'}
      ],
      capability: ['Electromechanical uncertainty', 'Reduced LQR design', 'Statistical response assessment'],
      mainVisual: {src: asset('thesis/stochastic-impulse-controlled-pdf.png'), title: 'Controlled peak-displacement distribution', alt: 'Original thesis Figure 5.5b compares full finite-element and reduced-model probability densities of maximum displacement with LQR feedback.', caption: 'Thesis Fig. 5.5b, printed p. 70 / PDF p. 92. Numerical Monte Carlo results.'},
      comparisonFigures: [
        {src: asset('thesis/stochastic-impulse-uncontrolled-pdf.png'), title: '01 / Without control', alt: 'Original probability density of maximum displacement before feedback control, from thesis Figure 5.3b.', caption: 'Thesis Fig. 5.3b · PDF p. 91. Original axes and full-FE/ROM comparison retained.'},
        {src: asset('thesis/stochastic-impulse-controlled-pdf.png'), title: '02 / With LQR feedback', alt: 'Original probability density of maximum displacement under per-realization LQR control, from thesis Figure 5.5b.', caption: 'Thesis Fig. 5.5b · PDF p. 92. Original axes differ from the uncontrolled panel; compare the numerical horizontal-axis values.'}
      ],
      sections: [
        ['My contribution', 'Extended reduced-model vibration-control analysis to material variability, connecting the electromechanical FE model, SEREP, LQR synthesis and a Monte Carlo response assessment.'],
        ['The numerical benchmark', 'Chapter 5 samples lognormal Young’s modulus with a mean of 210 GPa. It uses 1,000 realizations and a 320-active-DOF reduced system for the plotted stochastic response comparisons. The thesis geometry uses three collocated piezoelectric sensor/actuator pairs on a 0.5 m cantilever.'],
        ['What is controlled', 'An LQR gain is calculated for each sampled realization. This demonstrates an uncertainty-aware analysis workflow; it does not establish that one fixed gain controls every possible specimen.'],
        ['Computational evidence', 'Table 5.1 reports time savings for several active-DOF counts, including 45.60% at 320 DOFs. Its separately listed L² quantity is retained in the source table without being relabelled as a prediction-error guarantee.'],
        ['Scope and publication relationship', 'The numerical figures shown here come from the supplied June 2021 M.S. thesis, Chapter 5. The related SICE 2020 paper is linked separately. The thesis results are not represented as new experiments or as digitized figures from the SICE publication.']
      ],
      equations: [],
      figures: [
        {src: asset('thesis/stochastic-impulse-uncontrolled-response.png'), title: 'Uncontrolled time response', alt: 'Original thesis Figure 5.3a shows full-FE and reduced-model displacement responses for the stochastic impulse example.', caption: 'Thesis Fig. 5.3a · PDF p. 91.'},
        {src: asset('thesis/stochastic-impulse-controlled-response.png'), title: 'Controlled time response', alt: 'Original thesis Figure 5.5a shows the response with LQR control for the stochastic impulse example.', caption: 'Thesis Fig. 5.5a · PDF p. 92.'},
        {src: asset('thesis/stochastic-compute-table.png'), title: 'Original computation-time evidence', alt: 'Thesis Table 5.1 reports active degrees of freedom, an L squared metric and percentage time saved for the reduced stochastic calculation.', caption: 'Thesis Table 5.1 · PDF p. 94. The 320-active-DOF row reports 45.60% time saved.'}
      ],
      industries: ['Robotics', 'Precision machinery', 'Aerospace structures', 'Automotive and rail'],
      industryText: 'Potential uses include assessing stiffness variation in flexible mechanisms, repeated control design for lightweight structures, and sensitivity studies before product-specific tests. These are transfers of the method, not claims of deployment in every sector.',
      sourceNote: 'Primary numerical source: Hiren Patel, Reduced order model integrated control of beams, M.S. thesis, IIT Madras, June 2021, Chapter 5, PDF pp. 89–94 / printed pp. 67–72. Original Figs. 5.3, 5.5 and Table 5.1. Associated publication: SICE 2020, DOI below.',
      pdf: 'assets/papers/patel-thesis.pdf#page=89',
      pdfLabel: 'Open the thesis source',
      url: 'https://doi.org/10.23919/SICE48898.2020.9240388',
      related: ['serep-control-2020']
    },
    'pth-fatigue-2026': {
      label: 'PHD PAPER / GRUNDFOS × AALBORG / PUBLISHED 2026',
      headline: 'Find the failure.\nBuild the right model.',
      takeaway: 'Actual broken leads, measured damping, a controlled FE hierarchy, and fatigue predictions checked against ten tested PCB assemblies.',
      problem: 'Heavy through-hole components bend their leads during vibration. A good global board model can still miss the local stress that causes the lead to fail.',
      solution: 'Instrument failure events, compare board and lead model fidelity, identify damping with DIC, and calculate fatigue from FE stress spectra in Python.',
      novelty: 'A traceable PTH lead-failure benchmark and controlled model comparison that shows which local geometric detail and measured inputs change the life prediction.',
      result: 'Three of four high-excitation Dirlik comparisons lie within a factor of two of measured mean life. The lower-excitation case is still 4.56–7.27× high, making the remaining validation boundary explicit.',
      metrics: [
        {value: '10 PCBs', label: 'Two loading cases · five repeats each'},
        {value: '3 of 4', label: 'High-excitation Dirlik comparisons within 2×'},
        {value: '4.56–7.27×', label: 'Remaining overprediction in Y–0.05'}
      ],
      capability: ['Test design + DIC', 'Local FE fidelity', 'Python spectral fatigue'],
      mainVisual: {src: asset('figure-04-published-before-after.png'), title: 'Actual hardware · before and after the test', alt: 'Original paper photographs show the pump PCB and cracked leads at the VDR3 varistor and C14 capacitor after vibration testing.', caption: 'Patel, Sorokin & Nielsen (2026), Fig. 4, p. 3. The observed failure is a lead fracture near the solder-side transition. CC BY 4.0.'},
      visualAside: {label: 'A COMPLETE TEST–MODEL LOOP', title: 'The lead broke. That sets the modelling question.', text: 'I connected the physical failure event to lead-bend geometry, measured damping and a reproducible stress-to-life calculation. This establishes what the model must resolve before its fatigue result is useful.'},
      resultVisual: {src: asset('fatigue-actual-life-ratios.svg'), title: 'Actual results · all six calibrated comparisons', alt: 'A log-scale chart compares predicted and measured fatigue life. Three of four high-excitation Dirlik points fall in the 0.5–2 ratio band, while low-excitation Dirlik predictions and all six Steinberg predictions overpredict.', caption: 'Replotted from Tables 2.1 and 5.3, using the published lifetimes and recomputed ratios. A ratio of 1 is exact agreement. The factor-two band is a visual reference, not a qualification criterion.'},
      methodVisual: {src: asset('figure-05-published-model-hierarchy.png'), title: 'Original FE hierarchy · global and local fidelity', alt: 'Published finite-element hierarchy compares multilayer M0, homogenised solid M1, shell M3 and detailed lead configurations.', caption: 'Patel, Sorokin & Nielsen (2026), Fig. 5, p. 5. The selected detailed lead model keeps the bend but omits explicit solder geometry after the local comparison. CC BY 4.0.'},
      equations: [
        {label: 'Material fatigue relation', formula: 'N = A S⁻ᵇ;  A = 1.7 × 10¹⁷;  b = 5.0', note: 'Adopted annealed-copper S–N relation, with stress S in MPa. These material parameters were not fitted from a new component-specific S–N test series.'},
        {label: 'Traceable life comparison', formula: 'D = Ḋ × t;  E = Tmodel / Tmeasured', note: 'ANSYS hotspot stress PSDs → equivalent stress spectrum → Python spectral damage → predicted life. Compare with the first electrical failure event, using the measured mean of five tests.'}
      ],
      sections: [
        ['My contribution', 'First and corresponding author. The paper credits my conceptualization, methodology, finite-element modelling, software, validation, investigation, formal analysis, data curation, visualization and original writing. The work was developed with Sergey Sorokin and Kim Martin Nielsen.'],
        ['Experiment and failure definition', 'Ten assemblies were tested over 100–1700 Hz. X–0.20 used 0.20 g²/Hz (17.9 GRMS); Y–0.05 used 0.05 g²/Hz (8.95 GRMS). A 10 Vpp, 100 kHz electrical signal monitored VDR3 and C14 on separate channels. The first zero or near-zero voltage event defined failure; later intermittent re-contact did not reset that time. The two cases change both direction and magnitude.'],
        ['The modelling decision', 'A seven-layer FR-4/copper model was compared with homogenised solid and shell representations. Local lead configurations isolated the effect of lead-bend geometry. In the selected comparison, keeping or omitting explicit solder geometry changed the governing bend stress by approximately 1.5%; the refined models retained the bend without the extra solder detail.'],
        ['Measured inputs, not a blanket damping value', 'Contactless Digital Image Correlation and half-power bandwidth identification gave 3.89% damping at 230.0 Hz for VDR3, 1.80% at 533.6 Hz for C14, and 1.01% at 937.5 Hz for the PCB. These measured values replaced the uniform 1% baseline in the calibrated comparison.'],
        ['Actual outcome and remaining mismatch', 'Measured means were 9.0 min for X–VDR3, 19.6 min for X–C14 and 34.6 min for Y–VDR3. Refined Dirlik predictions for the high-excitation cases ranged from 0.40 to 1.50 times those means. The M3_C/C14 prediction was 2.48× too short. Y–VDR3 remained 4.56–7.27× too long. C14–Y did not fail within 90 minutes and is treated as a run-out.'],
        ['Sensitivity and model judgement', 'The study also examined uncertainty in the adopted copper S–N parameters. Sobol total-effect indices of 0.81 for b and 0.77 for log₁₀(A), versus first-order values of 0.24 and 0.18, show substantial interaction in the investigated ranges. These are sensitivity measures, not prediction confidence intervals.'],
        ['How to read the numbers', 'The chart recomputes model/measured ratios from the published lifetimes. Table 5.3 prints 0.7 for M1_C/C14, whereas its 11.2 min prediction divided by the 19.6 min measured mean gives 0.5714. The portfolio preserves the reported times and exposes the calculation. Calibration and comparison use the study’s test-informed damping; no independent blind-validation claim is made.']
      ],
      figures: [
        {src: asset('figure-01-published-test-setup.png'), title: 'Original instrumentation · shaker and failure monitoring', alt: 'Original test schematic shows the shaker, control accelerometer, amplifier, controller and electrical failure-monitoring circuit.', caption: 'Patel, Sorokin & Nielsen (2026), Fig. 1, p. 3. Shaker feedback controls excitation; separate electrical channels identify lead failure. CC BY 4.0.'},
        {src: asset('figure-07-published-dic-fe-comparison.png'), title: 'Measured response versus finite-element models', alt: 'Original Figure 7 overlays DIC-measured and predicted response spectra for VDR3, C14 and the PCB.', caption: 'Patel, Sorokin & Nielsen (2026), Fig. 7, p. 7. Frequency and amplitude mismatches remain visible. This is a test–model comparison, not a claim of perfect correlation. CC BY 4.0.'}
      ],
      table: {
        caption: 'Published lifetimes · refined leads with measured damping',
        heads: ['Case / component', 'Model', 'Measured mean', 'Dirlik', 'Ratio', 'Steinberg'],
        rows: [
          ['X–0.20 / VDR3', 'M1_C', '9.0 min', '12.1 min', '1.34×', '223.1 min'],
          ['X–0.20 / VDR3', 'M3_C', '9.0 min', '13.5 min', '1.50×', '107.1 min'],
          ['X–0.20 / C14', 'M1_C', '19.6 min', '11.2 min', '0.57×', '132.9 min'],
          ['X–0.20 / C14', 'M3_C', '19.6 min', '7.9 min', '0.40×', '44.2 min'],
          ['Y–0.05 / VDR3', 'M1_C', '34.6 min', '157.8 min', '4.56×', '3283.7 min'],
          ['Y–0.05 / VDR3', 'M3_C', '34.6 min', '251.4 min', '7.27×', '1553.5 min']
        ],
        note: 'Tables 2.1 and 5.3. “Ratio” is the Dirlik prediction divided by measured mean life, recomputed from the displayed lifetimes. Each measured mean represents five boards. C14–Y: five run-outs at the 90-minute test limit; no measured mean failure life.',
        download: 'assets/data/calibrated-predictions.csv'
      },
      industries: ['Pump electronics · demonstrated', 'Industrial drives', 'Power electronics', 'Machine controllers'],
      industryText: 'Transfer the test-to-model workflow to electronics exposed to vibration: identify the failure mechanism, choose the necessary local fidelity, measure sensitive inputs and quantify residual error. Each new product needs its own load, component and material evidence.',
      sourceNote: 'Full uploaded paper, Microelectronics Reliability 182 (2026), 116158. Results from Tables 2.1, 5.2, 5.3 and Figures 4, 5, 7, 9. Original figure crops retain the published annotations. CC BY 4.0.',
      url: 'https://doi.org/10.1016/j.microrel.2026.116158',
      pdf: 'assets/papers/patel-2026-pth-fatigue.pdf'
    },
    'mount-layout-dmc-2026': {
      label: 'DMC CONFERENCE STUDY / SUBMITTED RESEARCH DIGEST',
      headline: '400 possibilities.\nA defensible choice.',
      takeaway: 'Screen assembly strain first, then check component-lead dynamics. Mount position matters as much as mount count.',
      problem: 'A mount pattern that raises a board’s natural frequency can still overload a strain-sensitive zone or transmit motion to a heavy component lead.',
      solution: 'Automate a staged FE screen: geometric feasibility → worst-zone process strain → modal and harmonic lead-stress checks.',
      novelty: 'Connect assembly strain, mode-specific lead stress and frequency constraints in one traceable mount-selection process, with explicit margins for the final choice.',
      result: 'Of 400 sampled layouts, 15 passed the static screen and five passed all criteria. Four mounts was the smallest sufficient count in this study. Selected layout LAY_4_0072 achieved 1499.2 με and 823.6 Hz.',
      metrics: [
        {value: '400 → 15 → 5', label: 'Sampled → static passes → full passes'},
        {value: '4 mounts', label: 'Minimum sufficient count in the sampled DOE'},
        {value: '100.8 με', label: 'Selected layout’s static-strain headroom'}
      ],
      capability: ['Automated Ansys studies', 'Multi-constraint selection', 'Engineering margins'],
      mainVisual: {src: asset('mount-v10/dmc-four-mount-strain-comparison.png'), title: 'Original study results · identical count, different load path', alt: 'Original DMC digest strain fields compare two four-mount layouts under the same 70 N load, at 1499.2 and 14387.5 microstrain on a shared colour scale.', caption: 'DMC research digest, Fig. 1. Two four-mount layouts under the same 70 N load differ by approximately 9.6× in worst-zone strain. Submitted work; numerical study.'},
      methodVisual: {src: asset('mount-screening.svg'), title: 'The decision process · constraints and selected margins', alt: 'Visual brief showing the sequential strain and dynamic criteria and the selected four-mount layout’s margins.', caption: 'Explanatory visual using the numerical results of the earlier DMC research digest.'},
      equations: [
        {label: 'Process-strain requirement', formula: 'Jᴸ(z) = maxzone maxx εeqv(x; z) ≤ 1600 με', note: 'A 70 N quasi-static load is distributed over the microcontroller footprint. The maximum in protected zones controls acceptance.'},
        {label: 'Dynamic requirements', formula: 'ρPCB = 100 σ̂PCB / σ̂component ≤ 5%;  fPCB,1 > 800 Hz', note: 'A 1g harmonic base-acceleration sweep covers 10–2000 Hz with 1% damping. Peaks are linked to classified PCB-, component- and coupled modes.'}
      ],
      sections: [
        ['My contribution', 'Developed an automated FE screening workflow that turns a constrained set of mounting candidates into a smaller set of explainable engineering choices. The analysis evaluates local assembly strain and the dynamic response at a critical VDR3 lead hotspot.'],
        ['How the selection works', 'A stratified maximin design of experiments samples layouts with two to six active mounts. The static screen rejects layouts above 1600 με before the remaining 15 undergo modal and harmonic assessment. Mode classification uses strain-energy partitions to distinguish PCB and component behaviour.'],
        ['Why this particular layout', 'LAY_4_0072 uses G006, G037, G047 and G052. At 1499.2 με it has 100.8 με (6.30%) static headroom; at 823.6 Hz it has 23.6 Hz (2.95%) frequency headroom. A competing four-mount layout reaches 1084.4 Hz but leaves only 3.5 με static headroom. The comparison makes the tradeoff explicit.'],
        ['What the outcome does not prove', 'The minimum of four mounts is established within the 400 sampled layouts, not over every feasible location. No detected PCB-dominated harmonic peak means the peak-based criterion found none; it does not mean zero board contribution to stress. The narrow frequency margin motivates a future tolerance study.'],
        ['Application: spacecraft electronics', 'For a PCB whose screw towers carry most of its conducted heat into a spacecraft chassis, mount placement affects both the cooling path and the restraint on thermal expansion. This motivates a coupled thermal and mechanical layout search. The structural screening results shown here do not include thermal acceptance criteria; a spacecraft assessment also requires thermal-contact, radiation and mission boundary models.'],
        ['Source version', 'The numerical evidence shown here comes from the earlier DMC2026 research digest, with submission recorded in the current career record. Final publication metadata is not established in this portfolio.']
      ],
      figures: [],
      industries: ['Electronics assembly', 'Fixture design', 'Drive and control enclosures'],
      industryText: 'Useful where mounting decisions must satisfy several physical requirements at once. The transferable method is an automated, staged design screen; the 70 N load and numerical limits belong to this PCB study.',
      sourceNote: 'DMC2026_digest.pdf, Sections II–III and Figure 1. Results refer to the earlier research digest. This is separate from the 400 N pin-supported assembly-process study.',
      pdf: 'assets/papers/dmc-2026-digest.pdf',
      pdfLabel: 'Open the DMC digest',
      related: ['spatial-rom-manuscript']
    },
    'spatial-rom-manuscript': {
      label: 'PHD RESEARCH / INFLUENCE-LIBRARY ROM / WORKING MANUSCRIPT',
      headline: 'Build the library.\nReuse the physics.',
      takeaway: 'Use an invariant FE model and a library of physical responses to evaluate changing support layouts with a small reconstruction system.',
      problem: 'Repeating a full FE solve for every support combination slows layout studies. A commercial solver may not expose the structural matrices needed for direct algebraic reanalysis.',
      solution: 'Record process-load, unit-action and prescribed-motion responses through rigid pilot interfaces. Solve for added-mount actions and released-support motions, then reconstruct the strain tensor field.',
      novelty: 'A solver-output-based influence library that preserves physical interface quantities and checks reciprocity. Interpolation to unsampled positions is the ongoing extension.',
      result: 'A nontrivial two-mount case with all reference supports removed reports a field RMSE of 9.5 × 10⁻⁴ με against direct FE. The draft reports 0.92 s for one full-field layout evaluation. These are discrete reconstruction results.',
      metrics: [
        {value: '9.5 × 10⁻⁴ με', label: 'Draft-reported field RMSE versus direct FE'},
        {value: '0.92 s', label: 'Draft-reported full-field layout evaluation'},
        {value: '6 DOF', label: 'Force/moment and motion at each interface'}
      ],
      capability: ['Structural reanalysis', 'Influence operators', 'Tensor-field verification'],
      mainVisual: {src: asset('spatial-direct-fe.png'), title: 'Original direct-FE comparison · discrete reconstruction', alt: 'Working manuscript figure compares direct finite-element and reconstructed strain fields for sampled support layouts.', caption: 'Working manuscript, Fig. 3. The demanding G001 | G004 case removes all reference supports. The separate scalar discrepancy reflects shell-face export conventions explained in the manuscript; the field RMSE compares corresponding fields.'},
      methodVisual: {src: asset('spatial-reconstruction.svg'), title: 'From a reusable library to a new support layout', alt: 'Reference load, unit actions and prescribed support motions build an influence library, which feeds a small layout system and strain reconstruction.', caption: 'Explanatory brief of the earlier working manuscript. Exact discrete reconstruction and ongoing spatial interpolation are distinct claims.'},
      equations: [
        {label: 'Physics at the interface', formula: 'q = [ux, uy, uz, θx, θy, θz]ᵀ;  r = [Fx, Fy, Fz, Mx, My, Mz]ᵀ', note: 'Six work-conjugate generalized motions and actions at each rigid pilot. Unit-response runs share one invariant structure.'},
        {label: 'Consistency before interpolation', formula: 'Z[a;b] = Z[b;a]ᵀ;  Kc = Kcᵀ;  ρ[d;b] = −W[b;d]ᵀ', note: 'Reciprocity and symmetry check the recorded influence blocks. Superpose strain tensors first; compute equivalent strain only after reconstruction.'}
      ],
      sections: [
        ['My contribution', 'Developing an influence-library workflow for changing PCB supports without extracting the commercial solver’s global stiffness matrix. The work links physical interface definitions, reusable FE experiments, reconstruction software and direct-FE checks.'],
        ['Library and reconstruction', 'R0 records the actual process-load response with reference mounts fixed. A runs apply unit actions at candidate interfaces. B runs impose unit motions at reference interfaces. For a target layout, the small mixed system enforces zero motion at added supports and zero reaction at released supports.'],
        ['What was actually checked', 'The draft’s sampled interface set contains 11 candidate pads across five regions. The G001 | G004 comparison changes the support topology and removes all reference mounts, so its near-zero field error is more informative than simply reproducing the unchanged reference state. Timing is draft-reported for the documented implementation.'],
        ['Why tensor reconstruction matters', 'Equivalent strain is not additive. The six strain components must be superposed before the scalar equivalent strain is computed. Comparing like-for-like shell faces and field exports is part of the verification, not an optional plotting detail.'],
        ['What is still being developed', 'Accurate predictions at arbitrary unsampled mount positions remain under investigation. The discrete results do not establish continuous-position accuracy, performance for nonlinear contact, or unchanged accuracy after modifying geometry or material laws.']
      ],
      figures: [],
      industries: ['PCB and enclosure supports', 'Linear fixture studies', 'Rapid design screening'],
      industryText: 'Potentially useful when many support configurations must be compared on the same linear structure. The reusable operator depends on consistent geometry, materials, interfaces and analysis conventions.',
      sourceNote: 'Earlier working manuscript: Strain prediction for arbitrary mount positions on printed circuit boards by spatial interpolation of a measured influence library. Discrete results are draft-reported. Continuous spatial validation remains active research.',
      related: ['mount-layout-dmc-2026']
    }
  };

  const sourceLinks = [{"title": "Piezoelectric actuator coupling", "url": "https://github.com/patelhiren3385/ROM_Control/blob/2ec4c072b876b1b01a581205c74718ddc02b02b5/lib/get_actuator_matrices.m#L11-L17", "language": "MATLAB", "description": "Piezoelectric stiffness, mass and actuation coupling in the beam finite-element implementation."}, {"title": "SEREP matrix projection", "url": "https://github.com/patelhiren3385/ROM_Control/blob/2ec4c072b876b1b01a581205c74718ddc02b02b5/main_MCs_with_25dof.m#L228-L240", "language": "MATLAB", "description": "Physical-coordinate transformation and projection of mass, stiffness and damping matrices.", "scope": "Related implementation: the repository’s default case differs from the paper’s reported benchmark."}, {"title": "Full and reduced LQR", "url": "https://github.com/patelhiren3385/ROM_Control/blob/2ec4c072b876b1b01a581205c74718ddc02b02b5/main_MCs_with_25dof.m#L277-L318", "language": "MATLAB", "description": "Full and reduced first-order models, LQR gains and controlled-response evaluation."}, {"title": "Lognormal material sampling", "url": "https://github.com/patelhiren3385/ROM_Control/blob/2ec4c072b876b1b01a581205c74718ddc02b02b5/lib/get_log_normal_distribution.m#L1-L8", "language": "MATLAB", "description": "Lognormal Young’s-modulus sampling used by the Monte Carlo scripts."}];
  p.paperCases['serep-control-2020'].code = sourceLinks.slice(0,3);
  p.paperCases['stochastic-control-2020'].code = [sourceLinks[2],sourceLinks[3]];
  p.paperCases['stochastic-control-2020'].equations = [{label:'Material variability in the public implementation',formula:'E = exp(μ + σZ);  Z ∼ N(0, 1)',note:'The thesis Chapter 5 and the public MATLAB helper use lognormal Young’s modulus. Repository settings and the thesis benchmark are identified separately.'}];

  // Keep project entry points and paper-specific views in agreement.
  const c = p.cases;
  Object.assign(c['industrial-intelligence'], {
    label: 'CATERPILLAR R&D / SENIOR ASSOCIATE ENGINEER / 2021–2024',
    headline: 'From an engineering idea to production software.',
    takeaway: 'I owned a CNN application for grading journal-bearing wear from ideation to production, alongside powertrain modelling, gear diagnostics and damper assessment.',
    artifact: asset('caterpillar-delivery.svg'),
    artifactAlt: 'Caterpillar delivery map: journal-bearing wear imagery, CNN, 1–10 wear grade and idea-to-production ownership; separate ROM, gear diagnosis and damper assessment workstreams.',
    metrics: [{value:'1–10',label:'Journal-bearing wear grading scale'},{value:'Production',label:'Application ownership from ideation to deployment'},{value:'1 intern',label:'Mentored through development'}],
    sections: [
      ['My role', 'Senior Associate Engineer, Caterpillar R&D, 2021–2024. I connected powertrain mechanics, data-driven diagnosis and engineering software, with responsibility for developing methods and delivering usable applications.'],
      ['Production CNN application', 'Owned a condition-monitoring application from ideation to production deployment. Its CNN grades journal-bearing wear on a 1–10 scale. I mentored one intern and coordinated engineering requirements across functions. The scale is an output definition, not an accuracy percentage.'],
      ['Powertrain and driveline ROMs', 'Built reduced-order representations using Caterpillar’s proprietary tools to support bearing performance and durability analysis. This work connected component dynamics to downstream powertrain decisions.'],
      ['Machine-learning workstreams', 'Developed deep-learning gear-fault diagnosis from vibration and acoustic data, and machine-learning methods for damper acceptability. These are separate engineering applications, not assumed modules in the bearing-wear product.'],
      ['Engineering tools', 'Built Python GUIs and Django web tools around analysis and surrogate-modelling workflows. This is a broader software-delivery capability; the résumé does not identify Django as the bearing-wear application’s production stack.'],
      ['Industrial relevance', 'The demonstrated work sits in engine and machinery development. The transferable capability is carrying a physical engineering question through data, modelling, implementation and delivery, while coordinating with the people who use the result.']
    ],
    source: 'Current and earlier Hiren Patel résumés. The visual is a reconstructed contribution map; its bearing illustration is not proprietary training data or a production screenshot. No unreported accuracy, savings or architecture is inferred.'
  });
  Object.assign(c['pcb-digital-twin'], {artifact:asset('fatigue-actual-life-ratios.svg'),artifactAlt:p.paperCases['pth-fatigue-2026'].resultVisual.alt,metrics:p.paperCases['pth-fatigue-2026'].metrics,source:p.paperCases['pth-fatigue-2026'].sourceNote});
  c['masters-rom-control'].artifact = asset('serep-formulation.svg');
  c['masters-rom-control'].artifactAlt = p.paperCases['serep-control-2020'].methodVisual.alt;
  c['pcb-insight'].label = 'HALT VANTAGE / VIRTUAL TEST BENCH / ACTIVE DEVELOPMENT';
  c['pcb-insight'].artifactAlt = 'HALT VANTAGE workflow from Sherlock import through supports, loading, Ansys solving and strain–stress review; static and thermo-mechanical execution documented, random-vibration automation in development.';
  c['pcb-insight'].headline = 'HALT VANTAGE: make specialist analysis repeatable.';
  c['pcb-insight'].source = 'Current résumé and ongoing virtual-test-bench project documentation. The workflow is shown schematically; static and thermo-mechanical execution are documented, while random-vibration automation remains in development.';
  const industry = p.projects.find(x=>x.id==='industrial-intelligence');
  Object.assign(industry,{title:'Engineering intelligence. Delivered.',short:'Production CNN bearing-wear grading, powertrain ROMs, gear diagnostics and engineering software.'});
  p.researchProjectLinks = {'masters-rom-control':'serep-control-2020','pcb-digital-twin':'pth-fatigue-2026','mount-intelligence':'mount-layout-dmc-2026'};
})();
