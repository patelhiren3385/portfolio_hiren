(function (root) {
  'use strict';

  const centres = [
    ['R01', 18, 18], ['R02', 82, 18], ['R03', 35, 20], ['R04', 65, 20],
    ['R05', 14, 42], ['R06', 86, 42], ['R07', 14, 64], ['R08', 86, 64],
    ['R09', 35, 80], ['R10', 18, 82], ['R11', 65, 80], ['R12', 82, 82],
    ['R13', 50, 50]
  ];
  const offsets = [[-2.3, -2.3], [2.3, -2.3], [-2.3, 2.3], [2.3, 2.3]];
  const candidates = [];
  let sequence = 1;
  centres.forEach(([region, centreX, centreY]) => {
    offsets.forEach(([offsetX, offsetY]) => {
      candidates.push({
        id: `G${String(sequence).padStart(3, '0')}`,
        x: centreX + offsetX,
        y: centreY + offsetY,
        region
      });
      sequence += 1;
    });
  });

  root.PCB_MOUNT_APP_DATA = Object.freeze({
    appVersion: '2.0.0',
    board: Object.freeze({ minX: 0, maxX: 100, minY: 0, maxY: 100 }),
    limits: Object.freeze({
      strainMicrostrain: 1600,
      firstModeHz: 800,
      peakRatioPercent: 5
    }),
    tolerances: Object.freeze({
      strainRelativePercent: 20,
      modeRelativePercent: 5,
      peakRatioAbsolutePercent: 1
    }),
    defaultCandidateSource: Object.freeze({
      name: 'Schematic 52-candidate interaction map',
      dataScope: 'schematic',
      note: 'Mount IDs match the study naming. Coordinates and region boundaries are interaction placeholders, not reconstructed physical coordinates. Import the project candidate CSV for physical screening.',
      candidates
    }),
    projectCsvColumns: Object.freeze(['id', 'x', 'y', 'region']),
    study: Object.freeze({
      title: 'Automated identification of PCB mount layouts under process-strain and lead-dynamic-stress constraints',
      loadN: 70,
      loadArea: 'Microcontroller contact footprint',
      sampledLayouts: 400,
      staticPass: 15,
      fullPass: 5,
      strata: Object.freeze([
        { mounts: 2, sampled: 140, staticPass: 2, fullPass: 0 },
        { mounts: 3, sampled: 108, staticPass: 3, fullPass: 0 },
        { mounts: 4, sampled: 88, staticPass: 4, fullPass: 2 },
        { mounts: 5, sampled: 44, staticPass: 5, fullPass: 3 },
        { mounts: 6, sampled: 20, staticPass: 1, fullPass: 0 }
      ]),
      sourceName: 'DMC 2026 research digest',
      sourceUrl: '../../papers/dmc-2026-digest.pdf',
      evidenceUrl: '../../evidence/mount-v10/mount-evidence.json'
    }),
    references: Object.freeze({
      selected: Object.freeze({
        key: 'selected',
        layoutId: 'LAY_4_0072',
        label: 'Selected / full pass',
        mountIds: Object.freeze(['G006', 'G037', 'G047', 'G052']),
        directFe: Object.freeze({
          strainMicrostrain: 1499.2,
          firstModeHz: 823.6,
          peakRatioPercent: null,
          dynamicCriterionPass: true,
          source: 'DMC 2026 digest, Figs. 1–2',
          note: 'No PCB-dominated harmonic peak was detected. At the nearest sampled frequency, 825.9 Hz, the stress was 0.1% of the component peak; this is preserved as source context rather than relabelled as an exact peak-ratio value.'
        }),
        facts: Object.freeze([
          '100.8 με strain headroom',
          '23.6 Hz frequency headroom',
          'Smallest sufficient mount count in the sampled study'
        ])
      }),
      comparator: Object.freeze({
        key: 'comparator',
        layoutId: 'LAY_4_0002',
        label: 'Same-count comparison / strain fail',
        mountIds: null,
        directFe: Object.freeze({
          strainMicrostrain: 14387.5,
          firstModeHz: null,
          peakRatioPercent: null,
          dynamicCriterionPass: null,
          source: 'DMC 2026 digest, Fig. 1',
          note: 'The digest preserves the strain comparison for this four-mount layout. Its mount IDs and complete dynamic result are not embedded in the published evidence record used by this app.'
        }),
        facts: Object.freeze([
          'Same four-mount count',
          '9.6× the selected-layout strain',
          'Placement changes the load path'
        ])
      }),
      highMode: Object.freeze({
        key: 'highMode',
        layoutId: 'LAY_4_0004',
        label: 'High-mode alternative / narrow strain margin',
        mountIds: null,
        directFe: Object.freeze({
          strainMicrostrain: null,
          firstModeHz: 1084.4,
          peakRatioPercent: null,
          dynamicCriterionPass: null,
          source: 'DMC 2026 digest',
          note: 'The source reports 3.5 με strain headroom and a 1084.4 Hz first PCB mode. The absolute strain is not substituted here because the evidence record stores the margin, not the original field value.'
        }),
        facts: Object.freeze([
          '1084.4 Hz first PCB mode',
          'Only 3.5 με strain headroom',
          'A single-metric optimum is not the balanced choice'
        ])
      })
    }),
    caveats: Object.freeze([
      'The minimum sufficient count and selected layout apply to the sampled design space, not every possible mount pattern.',
      'A missing PCB-dominated harmonic peak does not mean zero PCB stress.',
      'The 70 N study load is distinct from the later 400 N pressing case.',
      'The browser app imports and compares FE output; it does not run an FE solver.',
      'Manufacturing-tolerance assessment remains future work.'
    ])
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
