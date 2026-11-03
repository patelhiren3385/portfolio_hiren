/* Fixed engineering story. Public reference imagery illustrates assembly and lead detail. */
(function () {
  'use strict';

  const arrow = '<svg class="cv-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>';

  function html() {
    return `<div class="cv-heading">
      <div><p class="eyebrow">ENGINEERING SOFTWARE / STEP CONVERTER</p><h2 id="converter-title">How do CAD files become a <span class="muted">simulation-ready PCB?</span></h2></div>
      <p class="cv-intro">Connect the component detail in STEP with the placement data in ODB++, then carry the Sherlock mesh into analysis.</p>
    </div>

    <div class="cv-overview">
      <div class="cv-photo-pair">
        <figure class="cv-photo cv-photo-board"><a href="assets/evidence/converter/kicad-pcb-reference.png" target="_blank" rel="noopener noreferrer" aria-label="Open the public KiCad PCB assembly reference"><div class="cv-photo-frame"><img src="assets/evidence/converter/kicad-pcb-reference.png" width="1280" height="845" alt="KiCad’s public 3D Viewer screenshot showing a populated purple circuit board, component bodies, connectors and the layer panel" loading="lazy"></div></a><figcaption><strong>The complete assembly</strong><span>Public reference · <a href="https://www.kicad.org/blog/2024/02/Version-8.0.0-Released/" target="_blank" rel="noopener noreferrer">KiCad 3D Viewer</a></span><span>KiCad project · <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener noreferrer">CC BY 3.0</a></span></figcaption></figure>
        <figure class="cv-photo cv-photo-leads"><a href="assets/evidence/converter/lqfp-leads-reference.jpg" target="_blank" rel="noopener noreferrer" aria-label="Open the public component and lead photograph"><div class="cv-photo-frame"><img src="assets/evidence/converter/lqfp-leads-reference.jpg" width="1280" height="1280" alt="Real STM32 chip on a circuit board, with its square component body, four rows of gull-wing leads and solder pads clearly visible" loading="lazy"></div></a><figcaption><strong>Body, leads and connections</strong><span>Public hardware reference</span><span>© Raimond Spekking / <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a> (via <a href="https://commons.wikimedia.org/wiki/File:STMicroelectronics_STM32F303-4570.jpg" target="_blank" rel="noopener noreferrer">Wikimedia Commons</a>)</span></figcaption></figure>
      </div>
      <div class="cv-capabilities">
        <article><span class="cv-number">01</span><div><h3>Recover the component detail.</h3><p>Match STEP solids to the ODB++-derived Sherlock part list. Measure body geometry and supported leads; flag estimates and uncertain matches for review.</p></div></article>
        <article><span class="cv-number">02</span><div><h3>Keep the mesh you already built.</h3><p>Carry Sherlock’s generated mesh—including structured regions where present—through CDB and Workbench External Model into Mechanical.</p></div></article>
        <p class="cv-value"><strong>Why this matters</strong> Connect electronics design data to thermal and structural assessment without rebuilding the assembly by hand.</p>
      </div>
    </div>

    <div class="cv-flow" aria-label="PCB preparation and analysis workflow">
      <div class="cv-flow-heading"><h3>From design files to analysis</h3><span>Automation, review and Ansys integration</span></div>
      <ol class="cv-pipeline">
        <li><span class="cv-stage-kind">INPUTS</span><strong>STEP + placement</strong><p>CAD solids + the Sherlock part list from ODB++.</p></li>
        <li class="cv-stage-auto"><span class="cv-stage-kind">AUTOMATIC</span><strong>Align &amp; enrich</strong><p>Body dimensions, supported leads and field-level evidence.</p></li>
        <li class="cv-stage-review"><span class="cv-stage-kind">ENGINEERING REVIEW</span><strong>Review &amp; import</strong><p>Resolve flagged data; import the updated part list.</p></li>
        <li><span class="cv-stage-kind">SHERLOCK</span><strong>Generate the mesh</strong><p>Build the FE model with the reviewed component data.</p></li>
        <li><span class="cv-stage-kind">ANSYS INTEGRATION</span><strong>CDB → Mechanical</strong><p>External Model retains the mesh. Set up the analysis.</p></li>
      </ol>
    </div>

    <div class="cv-bottom"><p><strong>Built for engineering teams</strong> PCB assemblies in industrial equipment, power electronics and space hardware.</p><a class="cv-link" href="assets/apps/step-converter/index.html">See the method &amp; evidence ${arrow}</a></div>`;
  }

  window.ConverterShowcase = Object.freeze({ html });
})();
