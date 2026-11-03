/* Evidence exhibits: original published figures are identified separately from method schematics.
   Numerical claims retain source and validation scope. */
(function () {
  const p = window.PORTFOLIO;
  const asset = name => 'assets/evidence/' + name;
  p.cases = {
    'masters-rom-control': {
      label: 'IIT MADRAS / TWO PUBLISHED MASTER’S PAPERS',
      headline: '38 DOF. Better control. Because the right physics stayed.',
      takeaway: 'The smaller model performed better because it retained the actuator–beam junctions. The achievement is the model-selection judgment as much as the reduction.',
      artifact: asset('serep-method.svg'),
      artifactAlt: 'SEREP method showing a 402-DOF full model, 96-DOF uniform selection and 38-DOF selection retaining critical actuator junctions.',
      source: 'Patel, Kumar & Ali, IFAC-PapersOnLine 53(1), 51–56 (2020), §§2–5.1, Figures 6, 7 and 12. The stochastic workflow follows the SICE paper’s author-posted abstract. Project Associate facility work is documented in my CV.',
      sourceUrl: 'https://doi.org/10.1016/j.ifacol.2020.06.009',
      sourceLabel: 'Read SEREP paper',
      capability: ['Coupled FE formulation', 'Model reduction + LQR', 'Numerical verification'],
      metrics: [
        {value:'402 → 38', label:'Full and reduced degrees of freedom'},
        {value:'97.5%', label:'Reported computational-cost reduction'},
        {value:'2 papers', label:'Deterministic and stochastic control'}
      ],
      sections: [
        ['The engineering problem', 'A detailed flexible-structure model can be expensive to use for control. The challenge is to remove unnecessary coordinates while retaining the dynamics and actuator coupling that the controller needs.'],
        ['What I developed', 'A MATLAB-based electromechanical finite-element and reduced-control workflow for a cantilever with two bonded piezoelectric actuators. The study connects an Euler–Bernoulli beam formulation, SEREP reduction, and a Linear Quadratic Regulator designed in reduced space.'],
        ['How the method works', 'Discretise the beam with 200 elements (402 DOF and 804 states). Form a SEREP transformation from selected modes and retained physical coordinates. Form Mᵣ = TᵀMT, Kᵣ = TᵀKT and Cᵣ = TᵀCT, solve the reduced Riccati problem, and use the reduced-designed actuator feedback on the original numerical system.'],
        ['What the comparison proves', 'Uniformly retained coordinates produced a 96-DOF model but missed important actuator junctions. A 38-DOF selection retained those junctions and its response nearly reached zero after 10 seconds. Figure 12 compares both cases with full-order LQR; the larger reduced model did not give the better controlled response.'],
        ['How I checked fidelity', 'Frequency-response functions and the first five natural frequencies were compared against full FE (Figure 6). Modal Assurance Criterion values for the first 30 modes were reported close to one (Figure 7). Control performance was then checked using full-model time histories.'],
        ['Experimental capability alongside the papers', 'As a Project Associate at IIT Madras, I commissioned a dSPACE-based active-vibration-control facility. This is a separate contribution from the numerical validation reported in the SEREP paper.'],
        ['Scope of the result', 'The 97.5% figure is the paper’s reported computational-cost reduction for its numerical example, not a universal runtime guarantee. Full-system eigenanalysis remains a preprocessing cost. This paper does not establish experimental or embedded real-time performance.']
      ],
      figures: [
        {src:asset('serep-published-control.png'),title:'The actual controlled response',caption:'Original Figure 12, p. 55. Cyan: 38-DOF Case 2. Red: 96-DOF Case 1. Magenta: full-order FE control. The figure is cropped from the original paper with axes and legend intact.',alt:'Published displacement versus time comparison: 38-DOF SEREP Case 2 closely follows full-order control while 96-DOF Case 1 decays more slowly.'},
        {src:asset('serep-published-frf.png'),title:'Check the dynamics before using the controller',caption:'Original Figure 6, p. 54. Full FE and the Case 2 SEREP frequency-response functions; the inset compares the first five natural frequencies.',alt:'Original frequency-response comparison of full FE and SEREP with natural-frequency comparison inset.'}
      ],
      secondary: {
        title:'The second paper: control when parameters vary.',
        text:'The SICE study extends reduced-order vibration control to uncertain flexible structures. Non-Gaussian random variables represent parameter variability associated with manufacturing and measurement. A reduced-space LQR provides actuator feedback, and Monte Carlo simulation characterises the response of the numerical cantilever.',
        artifact:asset('stochastic-control.svg'),
        alt:'Verified stochastic-control workflow from parameter variability through reduced-order LQR and Monte Carlo assessment.',
        note:'Method summary based on the published abstract. Numerical distributions and sample counts are not specified here; this graphic is not a reproduction of simulation data.',
        url:'https://doi.org/10.23919/SICE48898.2020.9240388'
      }
    },
    'industrial-intelligence': {
      label:'CATERPILLAR / SENIOR ASSOCIATE ENGINEER / 2021–2024',
      headline:'From machine behaviour to tools engineers can use.',
      takeaway:'I combined structural dynamics, machine learning and software delivery—and took ownership of turning an engineering idea into a production application.',
      artifact:asset('caterpillar-delivery.svg'),
      artifactAlt:'Three Caterpillar workstreams: vibration-based gear diagnosis, machine-learning damper acceptability, reduced models for bearing analysis; plus software delivery and application ownership.',
      source:'Career record: Hiren Patel CV and documented project history. Reconstructed overview of the work; no proprietary numerical results or production screens are presented.',
      capability:['Physics + machine learning','Python engineering software','Delivery ownership'],
      metrics:[
        {value:'Diagnose',label:'Gear faults from high-frequency vibration'},
        {value:'Predict',label:'Damper acceptability using machine learning'},
        {value:'Deliver',label:'Condition-monitoring app: idea to production'}
      ],
      sections:[
        ['My role', 'Senior Associate Engineer, working across powertrain and driveline modelling, vibration-based diagnosis and engineering software. I developed methods and tools while coordinating requirements with engineering stakeholders.'],
        ['Gear-fault diagnosis', 'Developed deep-neural-network methods using high-frequency vibration data to diagnose gear failures. The contribution connects machine behaviour and signal data with a practical fault-diagnosis objective.'],
        ['Damper acceptability', 'Developed machine-learning methods to predict damper acceptability. This is a separate application from the gear-diagnosis work; its engineering outcome is an assessment method for damper behaviour.'],
        ['Reduced models for bearing analysis', 'Created reduced-order models of engine powertrain and driveline components using in-house tools to support bearing-performance analysis. The focus was a model representation useful to downstream engineering analysis.'],
        ['Engineering software', 'Built Python GUI scripts and engineering web tools around analysis workflows so that specialist methods could be used by an engineering team.'],
        ['Ownership and collaboration', 'Owned an AI condition-monitoring application from ideation to production, managed an intern, and aligned requirements across functions. This demonstrates responsibility for delivery as well as model development.'],
        ['How to read the exhibit', 'The three technical lanes describe distinct workstreams. The delivery band records broader software and ownership contributions; it does not imply all three workstreams were combined into one production platform.']
      ]
    },
    'pcb-digital-twin': {
      label:'GRUNDFOS × AALBORG / PUBLISHED PHD RESEARCH / 2026',
      headline:'From a broken lead to a defensible fatigue prediction.',
      takeaway:'Ten-board testing, local lead geometry and measured damping reveal both improved predictions and remaining model error.',
      artifact:asset('fatigue-actual-life-ratios.svg'),
      artifactAlt:'All six calibrated predictions compared with measured fatigue life, showing high-excitation agreement and lower-excitation overprediction.',
      source:'Full uploaded paper: Patel, Sorokin & Nielsen, Microelectronics Reliability182,116158(2026), Tables2.1,5.2,5.3; ratios recalculated from published lifetimes.',
      sourceUrl:'https://doi.org/10.1016/j.microrel.2026.116158',
      sourceLabel:'Read published PhD paper',
      capability:['Durability testing','Test–FE correlation','Spectral fatigue'],
      metrics:[{value:'10 PCBs',label:'Two loading cases, five repeats each'},{value:'3 of 4',label:'High-excitation Dirlik comparisons within2×'},{value:'4.56–7.27×',label:'Y-case Dirlik overprediction'}],
      sections:[
        ['The engineering problem','Heavy through-hole component leads can fracture under random vibration; global board fidelity alone does not establish local fatigue stress.'],
        ['What I developed','A controlled experimental and numerical workflow with electrical failure monitoring, local lead refinement, DIC-identified damping and Python spectral-fatigue processing.'],
        ['Actual calibrated outcome','Three of four high-excitation Dirlik comparisons fall within a factor-two band. M3_C/C14 is2.48× too short, while Y–VDR3 predictions remain4.56–7.27× too long. C14–Y tests are run-outs at90minutes.'],
        ['Detailed evidence','The paper-specific case provides original hardware and model figures, exact lifetimes, formulation, source data and validation boundaries.']
      ]
    },
    'mount-intelligence': {
      label:'INDUSTRIAL PHD / SUBMITTED DMC DIGEST + ONGOING ROM WORK',
      headline:'Choose a support layout with margins you can explain.',
      takeaway:'Screen assembly strain first, then check local lead dynamics. The highest-frequency layout is not automatically the best engineering choice.',
      artifact:asset('mount-screening.svg'),
      artifactAlt:'Mount screening results: 400 sampled layouts, 15 static passes, five full passes; selected four-mount layout with explicit strain and frequency margins.',
      source:'DMC2026_digest.pdf, research digest, numerical DOE and selected-layout results. Submission status from the September 2026 CV. The spatial influence-library manuscript is a separate ongoing extension.',
      capability:['Automated FE studies','Multi-constraint selection','Influence-operator reconstruction'],
      metrics:[
        {value:'400 → 5',label:'Sampled layouts to full-criteria passes'},
        {value:'4 mounts',label:'Smallest sufficient count in this sampled study'},
        {value:'100.8 με',label:'Selected layout’s static-strain headroom'}
      ],
      sections:[
        ['The engineering problem', 'A mount layout changes the load path during assembly and the vibration transmitted to component leads. Optimising a global natural frequency alone can overlook strain-sensitive zones and local component stress.'],
        ['What I developed', 'A staged Ansys Mechanical screening workflow: reject layouts that fail the process-strain constraint, then evaluate PCB-dominated modes and their contribution to stress peaks at the VDR3 lead hotspot.'],
        ['Study conditions', 'The digest uses a 70 N MCU-footprint assembly load, a 1600 με equivalent elastic-strain limit in protected zones, a first PCB-dominated frequency above 800 Hz, and a PCB-dominated stress-peak criterion below 5% of the component-dominated peak. These are criteria for this specific study.'],
        ['Actual screening outcome', 'Of 400 sampled layouts, 15 pass the static stage and five pass the complete criteria. Four mounts is the smallest sufficient mount count in that sampled design of experiments. Selected layout LAY_4_0072 uses G006, G037, G047 and G052.'],
        ['Why this layout', 'The selected layout reaches 1499.2 με and 823.6 Hz: margins of 100.8 με (6.30%) and 23.6 Hz (2.95%). Another four-mount layout reaches 1084.4 Hz but leaves only 3.5 με of static headroom. The selection makes the tradeoff visible instead of treating frequency as the only objective.'],
        ['The reduced-model extension', 'A separate influence-library workflow records process-load, unit-action and prescribed-motion responses on one invariant FE model. A small reconstruction system combines the tensor responses and is checked against direct FE solutions. Equivalent strain is evaluated after tensor superposition.'],
        ['What remains active', 'Exact reconstruction at sampled configurations and spatial interpolation at unseen mount positions are different claims. The continuous spatial extension remains under investigation. The digest’s sampled-layout screening does not establish a global optimum or zero PCB stress contribution.']
      ],
      figures:[{src:asset('mount-digest-results.png'),title:'Original result · same mount count, very different strain',caption:'Figure 1 from the DMC research digest. It combines the 400-layout screening results with actual strain maps. Four-mount layouts LAY_4_0002 and LAY_4_0072 differ by approximately 9.6× in worst-zone equivalent strain under the same 70 N load. Submitted work.',alt:'Original DMC study figure: strain distributions and pass counts by mount count, plus two four-mount strain maps with identical colour scales.'}],
      secondary:{
        label:'ONGOING MANUSCRIPT / SPATIAL INFLUENCE-LIBRARY RECONSTRUCTION',
        title:'Prove the reconstruction. Then extend the spatial model.',
        text:'The working manuscript checks reconstructed strain fields against direct FE, including a nontrivial two-mount configuration with all reference supports removed. That case reports a field RMSE of 9.5 × 10⁻⁴ με. One full-field layout evaluation is reported at 0.92 seconds in the draft. Those results concern discrete, sampled interfaces; accurate arbitrary-position interpolation remains an active research objective.',
        artifact:asset('spatial-reconstruction.svg'),
        alt:'Working-manuscript evidence for discrete influence-library reconstruction, including original direct-FE strain fields and an explicit ongoing spatial-interpolation boundary.',
        visualTitle:'Discrete reconstruction · direct-FE evidence',
        note:'The original figure’s separate scalar discrepancy reflects shell-face envelope versus consistent-face field-export conventions, as explained in the manuscript. The displayed field RMSE is the direct comparison of corresponding tensor-derived fields. Results and timing are draft-reported.',
        url:asset('spatial-direct-fe.png'),
        linkLabel:'Open original direct-FE comparison'
      }
    },
    'pcb-insight': {
      label:'PCB INSIGHT / VIRTUAL TEST BENCH / ACTIVE DEVELOPMENT',
      headline:'Make a specialist analysis repeatable.',
      takeaway:'A guided engineering workflow links input files, boundary conditions, solver execution and result review.',
      artifact:asset('pcb-insight-workflow.svg'),
      artifactAlt:'Implemented PCB Insight workflow from Sherlock import through supports, loading, Ansys solving and strain-stress review; static and thermo-mechanical complete, automated random vibration in development.',
      source:'Ongoing PCB Insight / Virtual HALT project documentation. The exhibit reconstructs the implemented workflow and its current delivery status.',
      capability:['Python + Ansys','Reusable boundary conditions','Engineering interface design'],
      metrics:[{value:'Static',label:'End-to-end analysis workflow'},{value:'Thermo-mechanical',label:'End-to-end analysis workflow'},{value:'Random vibration',label:'Automated solve sequence in development'}],
      sections:[
        ['The engineering problem', 'A reliability analysis requires consistent geometry, materials, supports, loads, solver settings and interpretation. Repeating these disconnected tasks manually makes analysis difficult to reuse.'],
        ['What I built', 'A Python-driven engineering environment around Sherlock ZIP / CDB exports and Ansys Mechanical. The workflow brings model import, component selection, boundary conditions and result review into one guided sequence.'],
        ['Technical depth', 'Hole and face selectors identify support and load regions. Grouped loads and saved boundary conditions preserve analysis intent. Static and thermo-mechanical execution connects to strain and stress review rather than ending at the solver.'],
        ['What has been delivered', 'Static and thermo-mechanical workflows run end to end. Manual random-vibration analysis works; automating its solve sequence is still active development.'],
        ['Next engineering step', 'Stabilise the automated random-vibration sequence, improve model-selection performance, and make prepared analysis files easier to transfer between engineers.']
      ]
    },
    'geometry-intelligence': {
      label:'PCB GEOMETRY ENRICHMENT / ACTIVE DEVELOPMENT',
      headline:'Make the input model worthy of the analysis.',
      takeaway:'Fuse identity, placement and shape information, and keep uncertain matches visible for review.',
      artifact:asset('geometry-enrichment.svg'),
      artifactAlt:'Part lists, STEP and PCB placement data feed body matching, orientation and lead enrichment, producing reviewable component models.',
      source:'Ongoing geometry-enrichment project documentation. Method and implementation status are shown schematically.',
      capability:['Geometry processing','Part and placement matching','Engineering quality control'],
      metrics:[{value:'Part list',label:'Component identity'},{value:'STEP',label:'Body geometry and dimensions'},{value:'PCB data',label:'Placement, orientation and pad evidence'}],
      sections:[
        ['The engineering problem', 'PCB exports can identify where a component is placed without providing sufficient body or lead detail for structural analysis. A convenient simplified shape can conceal a mechanically important connection.'],
        ['What I built', 'A workflow matching part-list entries to STEP bodies using position, dimensions and orientation, then enriching component descriptions and lead information using PCB and pad evidence where appropriate.'],
        ['Implemented capability', 'Improved component body descriptions and lead representations for many SMT components. Ambiguous geometries and rotations are exposed for review rather than silently accepted as exact.'],
        ['Technical judgment', 'Treat identity matching, geometric alignment and lead reconstruction as separate checks. A plausible body match alone does not establish that the lead geometry is correct.'],
        ['Active development', 'Through-hole lead reconstruction, unusual body shapes, ambiguous rotations and general matching reliability remain areas of development. No universal matching-success rate is claimed.']
      ]
    },
    'assembly-strain': {
      label:'ASSEMBLY-PROCESS MECHANICS / ONGOING STUDY',
      headline:'Model the load path before the final assembly exists.',
      takeaway:'The critical strain state may occur while pins support the board, before the final mounting regions engage.',
      artifact:asset('assembly-load-path.svg'),
      artifactAlt:'Assembly study setup with seven support pins, three mounting regions, a four millimetre initial gap and 400 newtons total force across tool-contact regions.',
      source:'Documented assembly-strain study setup. This 400 N load case is distinct from the 70 N load used in the DMC mount-layout screening study.',
      capability:['Boundary-condition reasoning','Assembly load paths','Model validation planning'],
      metrics:[{value:'400 N total',label:'Distributed across tool-contact regions'},{value:'7 pins',label:'Support before final seating'},{value:'4 mm',label:'Initial gap in the study setup'}],
      sections:[
        ['The engineering problem', 'The fully seated assembly is not necessarily the configuration carrying the pressing load earlier in the process. A different support path can produce a different strain field.'],
        ['What I am investigating', 'A pin-supported PCB state before the three final mounting regions engage. The study setup has seven support pins and an initial 4 mm gap. The machine load is 400 N in total, distributed across the tool-contact regions.'],
        ['Modelling approach', 'Begin with a simplified board model and compare support idealisations, including remote constraints and axial nonlinear springs. Examine how the assumed support stiffness and contact progression affect the strain response.'],
        ['What this establishes', 'A focused analysis setup and a testable hypothesis about a potentially critical intermediate state. It gives a clear route to checking a load path that a final-assembly model could miss.'],
        ['Validation still needed', 'Use measured process force–displacement curves and support behaviour to refine the sequence. The selected state is a candidate critical state, not yet a demonstrated upper bound on the real peak strain.']
      ]
    }
  };

  const masters=p.projects.find(x=>x.id==='masters-rom-control');
  Object.assign(masters,{title:'Smaller model. Smarter control.',short:'Two published master’s studies: physics-aware SEREP reduction, LQR control and uncertainty assessment.',outcome:'The 38-DOF SEREP model retained critical actuator junctions and controlled the beam more effectively than the 96-DOF selection. The paper reports a 97.5% computational-cost reduction.'});
  const industry=p.projects.find(x=>x.id==='industrial-intelligence');
  Object.assign(industry,{title:'From machine signals to delivered software.',short:'Gear diagnosis, damper prediction, reduced powertrain models—and ownership from application idea to production.'});
  const mount=p.projects.find(x=>x.id==='mount-intelligence');
  Object.assign(mount,{short:'400 layouts screened. Five full passes. A support decision explained through strain, dynamics and margin.'});
  const sp=p.publications.find(x=>x.id==='serep-control-2020');
  Object.assign(sp,{summary:'A 38-DOF SEREP model retains critical actuator junctions and controls the beam better than a 96-DOF selection. The paper reports 97.5% computational-cost reduction for its numerical example.',contribution:p.cases['masters-rom-control'].sections[2][1],caseId:'masters-rom-control'});
  const st=p.publications.find(x=>x.id==='stochastic-control-2020');
  Object.assign(st,{summary:'Non-Gaussian parameter variability, reduced-space LQR and Monte Carlo assessment extend vibration control beyond a single deterministic beam model.',contribution:p.cases['masters-rom-control'].secondary.text,caseId:'masters-rom-control'});
  p.publications.find(x=>x.id==='pth-fatigue-2026').caseId='pcb-digital-twin';
  const dmc=p.publications.find(x=>x.id==='mount-layout-dmc-2026');
  Object.assign(dmc,{title:'Automated Identification of Printed Circuit Board Mount Layouts Under Process-Strain and Lead Dynamic Stress Constraints',type:'Conference submission',statusNote:'Title and numerical results follow the DMC 2026 research digest. Submission is reported in the September 2026 CV; a final publication record is not established here.',summary:'A two-stage screen takes 400 sampled layouts to five full passes. The selected four-mount layout balances static strain margin with PCB-dominated dynamic response.',contribution:p.cases['mount-intelligence'].sections[3][1],caseId:'mount-intelligence'});
  p.publications.find(x=>x.id==='spatial-rom-manuscript').caseId='mount-intelligence';
})();
