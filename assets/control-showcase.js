/* Thesis-based visual evidence. Animation explains coordinate retention and feedback;
   every response curve is an unaltered crop of the supplied research thesis. */
(function () {
  'use strict';
  let serial = 0;
  const instances = new Set();
  const mounted = new WeakMap();
  const asset = 'assets/evidence/thesis/';
  const thesis = 'assets/papers/patel-thesis.pdf';
  const icon = kind => '<svg class="cr-icon" viewBox="0 0 24 24" aria-hidden="true">' + ({
    play: '<path d="m8 5 11 7-11 7z"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    replay: '<path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/>',
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    expand: '<path d="M14 4h6v6M20 4l-7 7M10 20H4v-6m0 6 7-7"/>'
  })[kind] + '</svg>';

  function diagram(id) {
    const denseNodes = Array.from({length:201}, (_, i) => '<line x1="' + (70 + i * 2.18).toFixed(2) + '" y1="84" x2="' + (70 + i * 2.18).toFixed(2) + '" y2="103"/>').join('');
    const junctions = [111,181,242,312,373,443].map(x => '<circle cx="' + x + '" cy="93.5" r="5.8"/>').join('');
    return `<svg class="cr-loop-schematic" viewBox="0 0 560 270" role="img" aria-labelledby="${id}-diagram-title ${id}-diagram-desc">
      <title id="${id}-diagram-title">Reduce a piezoelectric beam model while retaining actuator interfaces.</title>
      <desc id="${id}-diagram-desc">A beam has three paired actuator and sensor patches. The full finite-element mesh fades to highlight the patch junction coordinates. SEREP supplies reduced coordinates to LQR, and feedback returns to the actuators. This is an explanatory schematic, not simulated motion.</desc>
      <defs><marker id="${id}-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="#466453"/></marker></defs>
      <text class="cr-svg-note" x="70" y="27">3 ACTUATOR–SENSOR PAIRS</text>
      <g fill="#b26b43" class="cr-actuator-patches"><rect x="111" y="69" width="70" height="15" rx="1"/><rect x="242" y="69" width="70" height="15" rx="1"/><rect x="373" y="69" width="70" height="15" rx="1"/></g>
      <g fill="#7e9e77" class="cr-sensor-patches"><rect x="111" y="103" width="70" height="11" rx="1"/><rect x="242" y="103" width="70" height="11" rx="1"/><rect x="373" y="103" width="70" height="11" rx="1"/></g>
      <rect x="70" y="84" width="436" height="19" fill="#e5e6d8" stroke="#76836e" stroke-width="1"/>
      <g class="cr-dense-nodes" data-cr-dense stroke="#929d88" stroke-width=".8">${denseNodes}</g>
      <g class="cr-retained-nodes" data-cr-retained fill="#294d3c" stroke="#f8f7ef" stroke-width="1.5">${junctions}</g>
      <path d="M70 64v65m-12-57 12-8m-12 21 12-8m-12 21 12-8m-12 21 12-8m-12 21 12-8" fill="none" stroke="#586653" stroke-width="1.5"/>
      <path d="M506 42v30" stroke="#466453" stroke-width="1.6" marker-end="url(#${id}-arrow)"/><text class="cr-svg-label" x="506" y="30" text-anchor="middle">Load</text>
      <text class="cr-svg-number" x="146" y="59" text-anchor="middle">1</text><text class="cr-svg-number" x="277" y="59" text-anchor="middle">2</text><text class="cr-svg-number" x="408" y="59" text-anchor="middle">3</text>
      <text class="cr-svg-label" x="288" y="144" text-anchor="middle" data-cr-diagram-label>200 elements · 402 mechanical DOFs</text>
      <g class="cr-feedback" data-cr-feedback>
        <path class="cr-feedback-base" d="M277 114v45h215v55H81V47h65v22" fill="none" stroke="#c4ceba" stroke-width="2"/>
        <path class="cr-feedback-path" data-cr-path d="M277 114v45h215v55H81V47h65v22" fill="none" stroke="#466453" stroke-width="2" marker-end="url(#${id}-arrow)"/>
        <rect class="cr-loop-box" x="305" y="188" width="138" height="53" rx="3"/><text class="cr-svg-box-title" x="374" y="210" text-anchor="middle">SEREP</text><text class="cr-svg-box-note" x="374" y="228" text-anchor="middle">Retained coordinates</text>
        <rect class="cr-loop-box cr-loop-gain" x="123" y="188" width="138" height="53" rx="3"/><text class="cr-svg-box-title" x="192" y="210" text-anchor="middle">Reduced LQR</text><text class="cr-svg-box-note" x="192" y="228" text-anchor="middle">Feedback gain</text>
        <circle data-cr-signal class="cr-signal-dot" r="5" cx="277" cy="114"/>
      </g>
    </svg>`;
  }

  function html() {
    const id = 'thesis-control-' + (++serial);
    return `<section class="control-showcase" data-control-showcase aria-label="Two master's studies with original thesis results">
      <div class="cr-method-heading"><div><span class="cr-kicker">THE THESIS BENCHMARK</span><h4>Reduce the model around the actuators.</h4></div><div class="cr-player" aria-label="Method animation controls"><button type="button" data-cr-play><span data-cr-play-icon>${icon('pause')}</span><span data-cr-play-label>Pause</span></button><button type="button" data-cr-replay aria-label="Replay the coordinate-selection and control explanation">${icon('replay')}<span>Replay</span></button></div></div>
      <div class="cr-method" data-cr-method>
        <figure class="cr-beam-figure"><a href="${asset}beam-collocated-pairs.png" target="_blank" rel="noopener noreferrer" aria-label="Open the original thesis beam and piezoelectric-pair schematic"><img src="${asset}beam-collocated-pairs.png" width="1000" height="505" alt="Original thesis schematic of a cantilever beam with three collocated piezoelectric actuator and sensor pairs, external tip load and patch cross section" loading="lazy"></a><figcaption>Sense deformation. Apply corrective actuation.<br><a href="${thesis}#page=72" target="_blank" rel="noopener noreferrer">Thesis Fig. 4.1 · original benchmark ${icon('arrow')}</a></figcaption></figure>
        <div class="cr-sequence" data-cr-phase="0"><ol class="cr-steps" aria-label="Reduction and control stages"><li data-cr-step="0"><span>01</span> Model</li><li data-cr-step="1"><span>02</span> Retain</li><li data-cr-step="2"><span>03</span> Control</li></ol>${diagram(id)}<p class="cr-reading" data-cr-reading aria-live="polite">Build the coupled beam, actuator and sensor model.</p><span class="cr-schematic-note">Coordinate-selection schematic · positions indicative</span></div>
      </div>

      <div class="cr-studies" id="control-thesis-results">
        <article class="cr-study cr-study-nominal">
          <header><span class="cr-kicker">01 / NOMINAL SYSTEM · THESIS CH. 4</span><h4>Fewer coordinates.<br>Better control.</h4></header>
          <div class="cr-metrics"><div><strong>402 <span>→</span> 38</strong><span>Mechanical DOFs</span></div><div><strong>97.5<small>%</small></strong><span>Reported computational-cost saving</span></div></div>
          <p class="cr-result-copy">Retaining actuator junctions lets 38 DOFs follow full FE control more closely than 96 uniformly selected DOFs.</p>
          <figure class="cr-result"><a class="cr-result-image" href="${asset}deterministic-control-comparison.png" target="_blank" rel="noopener noreferrer" aria-label="Open original thesis Figure 4.11 comparing full FE and reduced control"><img src="${asset}deterministic-control-comparison.png" width="756" height="616" alt="Original thesis Figure 4.11: the red 38-DOF closed-loop response closely follows the black full FE response, while the blue 96-DOF response differs" loading="lazy"></a><figcaption><span><b>Actual response comparison</b> · Thesis Fig. 4.11</span><a href="${thesis}#page=81" target="_blank" rel="noopener noreferrer">Source p. 59 ${icon('arrow')}</a></figcaption></figure>
          <div class="cr-study-links"><button type="button" data-research="serep-control-2020">IFAC paper &amp; method ${icon('arrow')}</button><a href="${asset}nodes-critical-38dof.png" target="_blank" rel="noopener noreferrer">See retained nodes ${icon('expand')}</a></div>
        </article>

        <article class="cr-study cr-study-stochastic">
          <header><span class="cr-kicker">02 / MATERIAL VARIABILITY · THESIS CH. 5</span><h4>What if material<br>stiffness varies?</h4></header>
          <div class="cr-metrics"><div><strong>≈35<small>%</small></strong><span>Lower mean peak displacement · impulse</span></div><div><strong>45.6<small>%</small></strong><span>Reported computation-time saving</span></div></div>
          <p class="cr-result-copy">1,000 material realizations. 320 active DOFs. Full and reduced models closely agree on the response distribution.</p>
          <figure class="cr-result"><a class="cr-result-image" href="${asset}stochastic-impulse-controlled-pdf.png" target="_blank" rel="noopener noreferrer" aria-label="Open original thesis Figure 5.5b showing the controlled peak displacement distribution"><img src="${asset}stochastic-impulse-controlled-pdf.png" width="564" height="452" alt="Original thesis Figure 5.5b: full FE and SEREP probability-density curves of controlled maximum tip displacement closely overlap near 2.4 millimetres" loading="lazy"></a><figcaption><span><b>Actual peak-response distribution</b> · Fig. 5.5b</span><a href="${thesis}#page=92" target="_blank" rel="noopener noreferrer">Source p. 70 ${icon('arrow')}</a></figcaption></figure>
          <div class="cr-study-links"><button type="button" data-research="stochastic-control-2020">SICE paper &amp; method ${icon('arrow')}</button><a href="${asset}stochastic-impulse-uncontrolled-pdf.png" target="_blank" rel="noopener noreferrer">Before control ${icon('expand')}</a></div>
        </article>
      </div>
      <p class="cr-source-note">Numerical thesis benchmarks. Timing and reduction values: <a href="${thesis}#page=82" target="_blank" rel="noopener noreferrer">p. 60</a>, <a href="${thesis}#page=93" target="_blank" rel="noopener noreferrer">p. 71</a> and <a href="${thesis}#page=94" target="_blank" rel="noopener noreferrer">Table 5.1</a>. The stochastic study computes a gain for each realization. The associated IFAC paper uses two actuators; the thesis geometry above uses three pairs. <a href="${asset}provenance.json" target="_blank" rel="noopener noreferrer">Figure sources &amp; scope</a>.</p>
      <p class="cr-motion-note" data-cr-motion hidden>Animation is paused for your reduced-motion preference. All results remain visible.</p>
    </section>`;
  }

  function mount(scope) {
    const root = scope || document;
    for (const instance of instances) if (!instance.element.isConnected) instance.dispose();
    const elements = root.matches?.('[data-control-showcase]') ? [root] : [...root.querySelectorAll('[data-control-showcase]')];
    elements.forEach(element => {
      if (mounted.has(element)) return;
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      const sequence = element.querySelector('.cr-sequence');
      const steps = [...element.querySelectorAll('[data-cr-step]')];
      const dense = element.querySelector('[data-cr-dense]');
      const retained = element.querySelector('[data-cr-retained]');
      const feedback = element.querySelector('[data-cr-feedback]');
      const path = element.querySelector('[data-cr-path]');
      const signal = element.querySelector('[data-cr-signal]');
      const label = element.querySelector('[data-cr-diagram-label]');
      const reading = element.querySelector('[data-cr-reading]');
      const play = element.querySelector('[data-cr-play]');
      const playLabel = element.querySelector('[data-cr-play-label]');
      const playIcon = element.querySelector('[data-cr-play-icon]');
      const motion = element.querySelector('[data-cr-motion]');
      const length = path.getTotalLength();
      const duration = 12500;
      let progress = media.matches ? 1 : 0;
      let wantsPlay = !media.matches;
      let visible = false;
      let frame = 0;
      let lastTime = 0;
      let lastStage = -1;
      let disposed = false;
      let lastButton = '';
      path.style.strokeDasharray = String(length);
      const clamp = n => Math.max(0, Math.min(1, n));
      function paint() {
        const stage = Math.min(2, Math.floor(progress * 3));
        const retention = clamp((progress - 1/3) * 3);
        const control = clamp((progress - 2/3) * 3);
        sequence.dataset.crPhase = String(stage);
        dense.style.opacity = String(1 - retention * .87);
        retained.style.opacity = String(.08 + retention * .92);
        feedback.style.opacity = String(.16 + control * .84);
        path.style.strokeDashoffset = String(length * (1 - control));
        const point = path.getPointAtLength(length * control);
        signal.setAttribute('cx', point.x.toFixed(2));
        signal.setAttribute('cy', point.y.toFixed(2));
        signal.style.opacity = control > 0 && control < 1 ? '1' : '0';
        if (stage !== lastStage) {
          lastStage = stage;
          steps.forEach((step, i) => {step.classList.toggle('is-active', i === stage);step.classList.toggle('is-complete',i < stage);});
          label.textContent = ['200 elements · 402 mechanical DOFs','Retain the actuator-interface coordinates','Reduced coordinates → gain → actuation'][stage];
          reading.textContent = ['Build the coupled beam, actuator and sensor model.','Keep the junctions that transmit sensing and actuation.','Compute feedback in the reduced space; apply it to the full system.'][stage];
        }
        const button = wantsPlay ? 'Pause' : progress >= 1 ? 'Play again' : 'Play';
        if (button !== lastButton) {
          lastButton = button;
          playLabel.textContent = button;
          playIcon.innerHTML = icon(wantsPlay ? 'pause' : 'play');
          play.setAttribute('aria-label',button + ' the coordinate-selection and control explanation');
        }
        element.classList.toggle('cr-is-playing',wantsPlay && visible && !document.hidden);
      }
      function canRun() {return !disposed && wantsPlay && visible && !document.hidden;}
      function tick(now) {
        frame = 0;
        if (!element.isConnected) {dispose();return;}
        if (!canRun()) {lastTime = 0;return;}
        if (lastTime) progress = Math.min(1,progress + Math.min(now-lastTime,150)/duration);
        lastTime = now;
        if (progress >= 1) wantsPlay = false;
        paint();
        if(canRun()) frame = window.requestAnimationFrame(tick); else lastTime = 0;
      }
      function sync() {
        if(frame) window.cancelAnimationFrame(frame);
        frame = 0;lastTime = 0;paint();
        if(canRun()) frame = window.requestAnimationFrame(tick);
      }
      function onClick(event) {
        if(event.target.closest('[data-cr-replay]')) {progress=0;wantsPlay=true;lastStage=-1;motion.hidden=true;sync();}
        else if(event.target.closest('[data-cr-play]')) {if(progress>=1){progress=0;lastStage=-1;}wantsPlay=!wantsPlay;motion.hidden=true;sync();}
      }
      function onVisibility() {sync();}
      function onMotion() {if(media.matches){wantsPlay=false;progress=1;motion.hidden=false;}else motion.hidden=true;sync();}
      function dispose() {
        if(disposed)return;disposed=true;
        if(frame)window.cancelAnimationFrame(frame);
        observer?.disconnect();element.removeEventListener('click',onClick);document.removeEventListener('visibilitychange',onVisibility);media.removeEventListener('change',onMotion);instances.delete(instance);mounted.delete(element);
      }
      const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries=>{visible=entries[0].isIntersecting && entries[0].intersectionRatio >= .12;sync();},{threshold:0.12}) : null;
      const instance={element,dispose};mounted.set(element,instance);instances.add(instance);
      element.addEventListener('click',onClick);document.addEventListener('visibilitychange',onVisibility);media.addEventListener('change',onMotion);motion.hidden=!media.matches;
      if(observer)observer.observe(element.querySelector('[data-cr-method]'));else visible=true;
      sync();
    });
  }
  window.ControlShowcase=Object.freeze({html,mount});
})();
