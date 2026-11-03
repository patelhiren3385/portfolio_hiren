/* Original numerical fields from the DMC research digest. No generated geometry or response. */
(function () {
  'use strict';

  const base = 'assets/evidence/mount-v10/';
  const arrow = '<svg class="ms-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>';

  function html() {
    return `<section class="mount-showcase" aria-label="Original PCB mount-layout results">
      <div class="ms-topline"><span>THE DECISION IN TWO MAPS</span><span>4 mounts each <b aria-hidden="true">·</b> Same 70 N load</span></div>

      <div class="ms-comparison">
        <div class="ms-outcome ms-pass"><span class="ms-outcome-label">SELECTED / PASS</span><strong>1,499.2 <small>με</small></strong><span>Below the 1,600 με limit</span></div>
        <div class="ms-ratio"><strong>9.6×</strong><span>different strain.<br> Same mount count.</span></div>
        <div class="ms-outcome ms-fail"><span class="ms-outcome-label">COMPARISON / FAIL</span><strong>14,387.5 <small>με</small></strong><span>Placement changes the load path</span></div>
      </div>

      <figure class="ms-main-figure">
        <a class="ms-image-link" href="${base}dmc-four-mount-strain-comparison.png" target="_blank" rel="noopener noreferrer" aria-label="Inspect the original two PCB strain maps at full resolution">
          <img src="${base}dmc-four-mount-strain-comparison.png" width="4295" height="2032" loading="lazy" alt="Original DMC finite-element results compare two four-mount PCB layouts under the same 70 N load. Selected LAY_4_0072 reaches 1499.2 microstrain, while LAY_4_0002 reaches 14387.5 microstrain. Orange dots mark active mounts; both maps use the same colour scale.">
        </a>
        <figcaption><span>Original FE results · shared colour scale · orange dots = active mounts.</span><a href="assets/papers/dmc-2026-digest.pdf#page=4" target="_blank" rel="noopener noreferrer">DMC digest, Fig. 1 ↗</a></figcaption>
      </figure>

      <div class="ms-decision-row">
        <ol class="ms-funnel" aria-label="400 sampled layouts, 15 static-strain passes, 5 full-criteria passes">
          <li><strong>400</strong><span>layouts sampled</span></li>
          <li><strong>15</strong><span>strain passes</span></li>
          <li><strong>5</strong><span>full passes</span></li>
        </ol>
        <div class="ms-acceptance" aria-label="Selected layout acceptance margins">
          <div><strong>100.8 <small>με</small></strong><span>strain headroom</span></div>
          <div><strong>823.6 <small>Hz</small></strong><span>23.6 Hz above the mode limit</span></div>
        </div>
      </div>

      <div class="ms-footer">
        <p>Four mounts: smallest sufficient count in the sampled study.</p>
        <button type="button" class="ms-detail-button" data-research="mount-layout-dmc-2026">Method &amp; study details ${arrow}</button>
      </div>

      <details class="ms-evidence">
        <summary>See the dynamic result &amp; source</summary>
        <div class="ms-evidence-body">
          <p><strong>Why strain alone was not enough.</strong> All 15 static passes underwent modal and harmonic assessment. The selected layout clears the 800 Hz first-PCB-mode requirement and the 5% PCB-to-component peak-stress criterion.</p>
          <figure>
            <a href="${base}dmc-dynamic-acceptance.png" target="_blank" rel="noopener noreferrer" aria-label="Open the original dynamic acceptance plots"><img src="${base}dmc-dynamic-acceptance.png" width="4727" height="1797" loading="lazy" alt="DMC Figure 2 acceptance plots compare the statically feasible layouts against PCB-to-component stress ratio, first PCB-mode frequency and assembly-strain limits. Five layouts satisfy all criteria."></a>
            <figcaption>Original Fig. 2 · The selected four-mount layout balances the two margins.</figcaption>
          </figure>
          <figure>
            <a href="${base}dmc-selected-layout-response.png" target="_blank" rel="noopener noreferrer" aria-label="Open the selected layout’s original lead-hotspot response"><img src="${base}dmc-selected-layout-response.png" width="4729" height="1728" loading="lazy" alt="The selected layout’s normalized lead-hotspot harmonic response has a component-dominated peak at 228.9 Hz. Modal strain-energy partitions distinguish the 229.5 Hz lead-dominated mode from the 823.6 Hz PCB-dominated mode."></a>
            <figcaption>Original Fig. 2 · Lead-hotspot response and the modal energy used for classification.</figcaption>
          </figure>
          <p class="ms-source-note">Numerical study from the DMC research digest, pp. 4–5. The result applies to the sampled layouts, with a 70 N process load and study-specific limits. No detected PCB-dominated harmonic peak does not mean zero PCB stress. Manufacturing-tolerance assessment remains future work.</p>
          <div class="ms-source-links"><a href="assets/papers/dmc-2026-digest.pdf" target="_blank" rel="noopener noreferrer">Read the research digest ↗</a><a href="${base}mount-evidence.json" target="_blank" rel="noopener noreferrer">Results &amp; source record ↗</a></div>
        </div>
      </details>
    </section>`;
  }

  window.MountShowcase = Object.freeze({ html });
})();
