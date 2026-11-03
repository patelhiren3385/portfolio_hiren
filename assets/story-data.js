/* Short question-led entry points; original evidence remains in paper-evidence.js. */
window.PORTFOLIO.stories = {
  "pth-fatigue-2026": {
    "id": "pth-fatigue-2026",
    "type": "paper",
    "question": "Why do component leads fail under vibration?",
    "solution": "Vibration bends the leads of heavy components. I combined failure monitoring, measured damping and local finite-element models to predict when those leads break.",
    "results": [
      "10 PCB assemblies tested across two loading cases.",
      "Three of four high-excitation Dirlik comparisons were within 2× of measured mean life; the lower-excitation case still overpredicted."
    ],
    "short_result": "10 boards. A failure mechanism traced from test to model.",
    "novelty": "The observed fracture guided local model detail; measured damping informed the life prediction.",
    "industry_application": "Helps teams choose model fidelity and validation tests for vibration-exposed pump electronics, drives and machine controllers.",
    "status": "Published · 2026",
    "details_label": "See the test-to-model evidence"
  },
  "industrial-intelligence": {
    "id": "industrial-intelligence",
    "type": "industry",
    "question": "How do bearing images become an engineering decision?",
    "solution": "At Caterpillar, I owned a CNN application that turns journal-bearing images into a 1–10 wear grade, from ideation through production.",
    "results": [
      "Production application delivered.",
      "One intern mentored through development."
    ],
    "short_result": "Idea → model → production application.",
    "novelty": "End-to-end ownership: turning a diagnosis model into software engineers can use.",
    "industry_application": "Connects component condition assessment with practical decisions in engine and machinery development.",
    "status": "Delivered at Caterpillar · 2021–2024",
    "details_label": "See the app & model evidence"
  },
  "serep-control-2020": {
    "id": "serep-control-2020",
    "type": "paper",
    "question": "Can a smaller model control vibration better?",
    "solution": "I retained the actuator junctions in a SEREP model, designed reduced-space LQR feedback and checked the response on the full numerical beam.",
    "results": [
      "402 → 38 mechanical degrees of freedom, with 97.5% reported computation-cost reduction.",
      "The physically informed 38-DOF model controlled the beam more effectively than a 96-DOF selection."
    ],
    "short_result": "402 → 38 DOF. The actuator coupling stayed.",
    "novelty": "Keeping the actuator junctions mattered more than keeping more coordinates.",
    "industry_application": "Supports repeated controller design for flexible machinery, precision equipment and smart structures.",
    "status": "Published · IFAC 2020",
    "details_label": "See the control result"
  },
  "mount-layout-dmc-2026": {
    "id": "mount-layout-dmc-2026",
    "type": "paper",
    "question": "Where should a PCB be supported?",
    "solution": "I screened candidate mounts for assembly strain, then checked board modes and component-lead stress to find layouts that satisfy both demands.",
    "results": [
      "400 sampled layouts → 15 static passes → 5 full passes.",
      "The selected four-mount layout reached 1499.2 με and 823.6 Hz, with both acceptance margins made explicit."
    ],
    "short_result": "400 layouts → 5 defensible candidates.",
    "novelty": "One mounting decision brings assembly and vibration requirements together.",
    "industry_application": "Useful for PCB supports, assembly fixtures and enclosures with competing strain and vibration requirements.",
    "status": "DMC research digest · submitted",
    "details_label": "See how the layout was selected"
  },
  "stochastic-control-2020": {
    "id": "stochastic-control-2020",
    "type": "paper",
    "question": "What changes when the material properties vary?",
    "solution": "I sampled material stiffness, designed feedback for each realization and compared full and reduced response distributions across 1,000 numerical cases.",
    "results": [
      "The thesis reports about 35% lower mean peak displacement in its stochastic control example.",
      "The thesis reports 45.60% time saved at 320 active DOFs across 1,000 Monte Carlo realizations."
    ],
    "short_result": "Reduced-order control with uncertainty in the loop.",
    "novelty": "Uncertain material and system inputs are assessed statistically within the reduced-control workflow.",
    "industry_application": "Supports analysis of manufacturing and measurement variation in vibration-sensitive structures.",
    "status": "Published · SICE 2020",
    "details_label": "See the uncertainty method"
  },
  "spatial-rom-manuscript": {
    "id": "spatial-rom-manuscript",
    "type": "paper",
    "question": "Can a new support layout be assessed without another full FE solve?",
    "solution": "I built an influence-library method that solves a small interface system and reconstructs the strain tensor field for changed support layouts.",
    "results": [
      "The draft reports 0.92 s for one full-field layout evaluation.",
      "A two-mount case with all reference supports removed reports a 9.5 × 10⁻⁴ με field RMSE against direct FE."
    ],
    "short_result": "Reuse the physics. Reconstruct the full strain field.",
    "novelty": "The method works from exported solver responses and physical interface quantities, without extracting the global stiffness matrix.",
    "industry_application": "Can accelerate repeated support and fixture comparisons on the same linear structure.",
    "status": "Working manuscript · ongoing",
    "details_label": "See the reconstruction check"
  },
  "experimental-control": {
    "id": "experimental-control",
    "type": "experiment",
    "question": "How do we close the loop around a vibrating structure?",
    "solution": "I set up a dSPACE-based active-vibration-control facility linking real-time control, actuation, motion sensing and measured feedback.",
    "results": [
      "A complete experimental signal path around a flexible structure.",
      "Experience with dSPACE / MicroLabBox, piezoelectric actuation and MFC smart composites."
    ],
    "short_result": "Controller → actuator → structure → measured feedback.",
    "novelty": "The contribution is hardware and feedback-path integration alongside electromechanical modelling.",
    "industry_application": "Connects simulation and testing when developing vibration-sensitive machinery and smart structures.",
    "status": "Experimental capability · IIT Madras",
    "details_label": "See the experimental loop"
  },
  "pcb-insight": {
    "id": "pcb-insight",
    "type": "tool",
    "name": "HALT VANTAGE",
    "question": "Can a reliability analysis become a repeatable workflow?",
    "solution": "I am building a Python environment that joins Sherlock model import, boundary conditions, Ansys execution and strain–stress review.",
    "results": [
      "Static and thermo-mechanical workflows run end to end.",
      "Manual random-vibration analysis works; solve-sequence automation remains in development."
    ],
    "short_result": "Static + thermo-mechanical analysis, end to end.",
    "novelty": "A reusable engineering workflow preserves model-selection and boundary-condition intent from input to result review.",
    "industry_application": "Helps electronics reliability teams repeat analysis consistently and transfer prepared workflows between engineers.",
    "status": "Active development",
    "details_label": "See the implemented workflow"
  },
  "geometry-intelligence": {
    "id": "geometry-intelligence",
    "type": "tool",
    "question": "Does the imported model include the connections that can fail?",
    "solution": "I match component identities, STEP bodies and PCB placement data, then enrich body and lead representations while exposing uncertain matches for review.",
    "results": [
      "Improved body descriptions and lead representations for many SMT components.",
      "Through-hole leads, unusual shapes and ambiguous rotations remain in development."
    ],
    "short_result": "Better component geometry, with uncertain matches visible.",
    "novelty": "Identity, geometric alignment and lead reconstruction are treated as separate checks rather than accepting a plausible body match as sufficient.",
    "industry_application": "Improves the input models used for structural reliability assessment of electronics.",
    "status": "Active development",
    "details_label": "See the geometry workflow"
  },
  "assembly-strain": {
    "id": "assembly-strain",
    "type": "tool",
    "question": "Could the highest strain occur before the board is fully seated?",
    "solution": "I am studying the pin-supported pressing stage and how support stiffness and contact progression change the PCB load path.",
    "results": [
      "Study setup: 400 N total load, seven support pins and a 4 mm initial gap.",
      "The work defines a candidate critical intermediate state for validation."
    ],
    "short_result": "Follow the assembly load path before final seating.",
    "novelty": "The analysis examines the changing support state during assembly rather than assuming the final mounted configuration carries every process load.",
    "industry_application": "Supports assembly-process and fixture design where transient support conditions can damage electronics.",
    "status": "Ongoing study",
    "details_label": "See the assembly load path"
  }
};
