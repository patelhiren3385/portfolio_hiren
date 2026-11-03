/* Recorded thermomechanical results. The original supplied HTML is hosted unchanged. */
(function () {
  'use strict';
  function html() {
    return `<div class="thermal-showcase">
      <div class="tm-result-grid">
        <div class="tm-fields">
          <figure><a href="assets/evidence/thermal-v10/thermal-temperature.webp" target="_blank" rel="noopener" aria-label="Open the accepted layout’s recorded hot temperature field"><img src="assets/evidence/thermal-v10/thermal-temperature.webp" width="1400" height="1500" alt="Recorded hot temperature field on the PCB mesh with the four accepted mounts G077, G058, G036 and G048" loading="lazy"></a></figure>
          <figure><a href="assets/evidence/thermal-v10/thermal-strain-cold.webp" target="_blank" rel="noopener" aria-label="Open the accepted layout’s recorded cold strain field"><img src="assets/evidence/thermal-v10/thermal-strain-cold.webp" width="1400" height="1500" alt="Recorded combined mechanical strain field in the cold condition, showing mount locations and the three monitored zones" loading="lazy"></a></figure>
          <p class="tm-field-source">Recorded fields · accepted four-mount layout · subset 1+2+3+5</p>
        </div>
        <div class="tm-decision">
          <p class="tm-kicker">THREE REQUIREMENTS. ONE LAYOUT.</p>
          <dl class="tm-checks">
            <div><dt>First mode</dt><dd>1,597.9 <span>Hz</span></dd><p><span aria-hidden="true">✓</span> Minimum 1,500 Hz</p></div>
            <div><dt>Worst monitored strain</dt><dd>1,422.7 <span>µε</span></dd><p><span aria-hidden="true">✓</span> Hot / cold limit 1,500 µε</p></div>
            <div><dt>Hottest source</dt><dd>91.8 <span>°C</span></dd><p><span aria-hidden="true">✓</span> Maximum 110 °C</p></div>
          </dl>
          <p class="tm-method">Build the response library once. Reuse small systems to evaluate each mount position.</p>
          <a class="tm-open" href="assets/apps/thermal-mount-search/index.html">Open thermal mount search <span aria-hidden="true">↗</span></a>
        </div>
      </div>
      <div class="tm-benchmark" aria-label="Recorded benchmark for subset 1+2+3+5">
        <div><strong>650</strong><span>online evaluations</span></div>
        <div><strong>21.8 <small>ms</small></strong><span>mean online evaluation</span></div>
        <div><strong>259.1 <small>s</small> + 3.0 <small>s</small></strong><span>offline preparation + one library</span></div>
        <a href="assets/evidence/thermal-v10/thermal-summary.json" target="_blank" rel="noopener">Recorded case &amp; data ↗</a>
      </div>
      <p class="tm-transfer"><strong>Spacecraft electronics</strong> Apply the method to screw-tower cooling. The recorded benchmark includes air cooling; space use requires mission-specific thermal boundaries.</p>
    </div>`;
  }
  window.ThermalShowcase = Object.freeze({html});
})();
