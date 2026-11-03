(function () {
  'use strict';
  const data = window.PORTFOLIO;
  if (!data) return;
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon = (name, cls = '') => `<svg class="icon ${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const external = (url, label, cls = 'text-link') => `<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ${icon('arrow')}</a>`;
  const dialog = $('#detail-dialog'), content = $('#dialog-content');
  let priorFocus = null, toastTimer;
  function notify(message) {
    const n = $('#toast'); n.textContent = message; n.classList.add('visible');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => n.classList.remove('visible'), 2800);
  }
  function openDialog(html, wide = false) {
    if (!dialog.open) priorFocus = document.activeElement;
    content.innerHTML = html; dialog.classList.toggle('wide', wide);
    if (!dialog.open) dialog.showModal();
    document.body.classList.add('modal-open'); dialog.scrollTop = 0;
    $('.dialog-close').focus({preventScroll:true});
  }
  $('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); priorFocus?.focus({preventScroll:true}); });
  dialog.addEventListener('click', e => {
    if (e.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
  });
  async function copyText(value) {
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(value);
      else {
        const f = document.createElement('textarea'); f.value = value;
        f.style.cssText = 'position:fixed;opacity:0;width:1px;height:1px';
        (dialog.open ? content : document.body).append(f); f.select();
        const ok = document.execCommand('copy'); f.remove(); if (!ok) throw new Error();
      }
      notify('Copied to clipboard.');
    } catch {
      openDialog(`<p class="eyebrow">READY TO COPY</p><h2 id="dialog-title">Copy the text below.</h2><textarea class="copy-fallback" rows="6" readonly aria-label="Text to copy">${esc(value)}</textarea>`);
      $('.copy-fallback').select();
    }
  }
  function metricHTML(c) {
    return `<div class="evidence-metrics">${c.metrics.map(m => `<div><strong>${esc(m.value)}</strong><span>${esc(m.label)}</span></div>`).join('')}</div>`;
  }
  function capabilityHTML(c) {
    return `<div class="capability-tags">${c.capability.map(s => `<span>${icon('check')}${esc(s)}</span>`).join('')}</div>`;
  }
  function artifactHTML(src, alt, title, caption = '') {
    const size = window.EVIDENCE_SIZES?.[src];
    const dimensions = size ? ` width="${size.width}" height="${size.height}"` : '';
    return `<figure class="artifact-figure"><div class="artifact-toolbar"><span>${esc(title)}</span>${external(src, 'Open full size', 'artifact-open')}</div><a href="${esc(src)}" target="_blank" rel="noopener noreferrer" aria-label="Open full-size visual: ${esc(title)}"><img src="${esc(src)}" alt="${esc(alt)}"${dimensions} loading="lazy"></a>${caption ? `<figcaption>${esc(caption)}</figcaption>` : ''}</figure>`;
  }
  const figure = f => artifactHTML(f.src, f.alt, f.title, f.caption);
  function briefHTML(c) {
    return `<div class="case-brief-grid">${[['01 / THE PROBLEM', c.problem], ['02 / HOW I SOLVED IT', c.solution], ['03 / WHAT THE WORK ADDS', c.novelty]].map(([h,t]) => `<section><h4>${esc(h)}</h4><p>${esc(t)}</p></section>`).join('')}</div>`;
  }
  function industryHTML(c) {
    return `<aside class="industry-use"><div><span class="tiny-label">WHERE THIS CAPABILITY CAN HELP</span><div class="industry-tags">${c.industries.map(t => `<span>${esc(t)}</span>`).join('')}</div></div><p>${esc(c.industryText)}</p></aside>`;
  }
  function codeHTML(c) {
    if (!c.code?.length) return '';
    return `<section class="code-evidence"><p class="eyebrow">FROM PAPER TO IMPLEMENTATION</p><h3>Inspect the code.</h3>${c.code.map(r => `<article><div><h4>${external(r.url, r.title)}</h4><p>${esc(r.description)}</p>${r.scope ? `<p class="code-scope">${esc(r.scope)}</p>` : ''}</div><span class="code-language">${esc(r.language)}</span></article>`).join('')}</section>`;
  }
  function tableHTML(t) {
    if (!t) return '';
    return `<section class="result-table-section"><h3>${esc(t.caption)}</h3><div class="result-table-scroll" tabindex="0" role="region" aria-label="Published fatigue lifetime results; scroll horizontally on smaller screens"><table><thead><tr>${t.heads.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${t.rows.map(row=>`<tr>${row.map((cell,i)=>i===0?`<th scope="row">${esc(cell)}</th>`:`<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="table-note">${esc(t.note)}</p>${t.download ? `<a class="text-link" href="${esc(t.download)}" download>Download the source data (CSV) ${icon('down')}</a>` : ''}</section>`;
  }
  function disclosure(title, subtitle, body) {
    return `<details class="technical-disclosure"><summary><span>${esc(title)}<small>${esc(subtitle)}</small></span><span aria-hidden="true">+</span></summary><div class="disclosure-body">${body}</div></details>`;
  }
  function openResearch(id) {
    const c = data.paperCases[id], p = data.publications.find(x => x.id === id), story = data.stories[id];
    if (!c || !p || !story) return;
    const formulas = c.equations?.length ? `<section class="formulation-section"><p class="eyebrow">THE FORMULATION</p>${c.equations.map(e => `<div class="equation-card"><h3>${esc(e.label)}</h3><p class="equation">${esc(e.formula)}</p><p>${esc(e.note)}</p></div>`).join('')}</section>` : '';
    const technical = `${briefHTML(c)}${formulas}${c.methodVisual ? figure(c.methodVisual) : ''}<div class="technical-case">${c.sections.map(([h,t]) => `<section class="dialog-section"><h3>${esc(h)}</h3><p>${esc(t)}</p></section>`).join('')}</div>`;
    const related = c.related?.length ? `<section class="related-research"><p class="eyebrow">CONNECTED RESEARCH</p>${c.related.map(key => `<button class="text-link" data-research="${esc(key)}">${esc(data.stories[key]?.question || key)} ${icon('arrow')}</button>`).join('')}</section>` : '';
    openDialog(`<p class="eyebrow">${esc(c.label)}</p><h2 id="dialog-title">${esc(story.question)}</h2><p class="dialog-lead">${esc(story.solution)}</p><p class="dialog-meta">${esc(p.title)}<br>${esc(p.authors)} · ${esc(p.venue)}</p>${metricHTML(c)}<div class="dialog-contribution"><span class="tiny-label">WHAT THIS WORK ADDS</span><p>${esc(story.novelty)}</p></div>${c.comparisonFigures ? `<div class="research-figure-pair">${c.comparisonFigures.map(figure).join('')}</div>` : figure(c.mainVisual)}<div class="result-takeaway"><span class="tiny-label">WHAT THE RESULT SHOWS</span><p>${esc(c.result)}</p></div>${c.resultVisual ? figure(c.resultVisual) : ''}${tableHTML(c.table)}${disclosure('How the method works','Formulation, modelling decisions & validation',technical)}${(c.figures?.length || c.code?.length) ? disclosure('Supporting evidence & source code','Original figures and implementation',`${(c.figures || []).map(figure).join('')}${codeHTML(c)}`) : ''}${industryHTML(c)}${related}<div class="dialog-actions">${c.url ? external(c.url,'Read the paper','button button-dark') : '<a class="button button-dark" href="mailto:patelhiren3385@gmail.com">Discuss the research '+icon('arrow')+'</a>'}${c.pdf ? `<a class="button button-outline" href="${esc(c.pdf)}" target="_blank" rel="noopener noreferrer">${esc(c.pdfLabel || 'Open full paper PDF')} ${icon('arrow')}</a>` : ''}${p.url ? `<button class="button button-outline" data-cite="${esc(id)}">Copy citation ${icon('copy')}</button>` : ''}</div><p class="dialog-source-note"><strong>Evidence and scope.</strong> ${esc(c.sourceNote)}</p>`, true);
  }
  function openProject(id) {
    if (id === 'geometry-intelligence') { location.href = 'assets/apps/step-converter/index.html'; return; }
    if (data.researchProjectLinks[id]) return openResearch(data.researchProjectLinks[id]);
    const p = data.projects.find(x=>x.id===id), c = data.cases[id], story = data.stories[id]; if (!p || !c || !story) return;
    openDialog(`<p class="eyebrow">${esc(c.label)}</p><h2 id="dialog-title">${esc(story.question)}</h2><p class="dialog-lead">${esc(story.solution)}</p>${metricHTML(c)}<div class="dialog-contribution"><span class="tiny-label">THE CONTRIBUTION</span><p>${esc(story.novelty)}</p></div>${artifactHTML(c.artifact,c.artifactAlt,'The work at a glance')}<div class="result-takeaway"><span class="tiny-label">WHAT HAS BEEN DONE</span><p>${story.results.map(esc).join(' ')}</p></div>${disclosure('How I built it','Implementation, ownership & current scope',`<div class="technical-case">${c.sections.map(([h,t])=>`<section class="dialog-section"><h3>${esc(h)}</h3><p>${esc(t)}</p></section>`).join('')}</div>${(c.figures||[]).map(figure).join('')}`)}<div class="dialog-contribution"><span class="tiny-label">INDUSTRIAL RELEVANCE</span><p>${esc(story.industry_application)}</p></div><div class="dialog-actions"><a class="button button-dark" href="mailto:patelhiren3385@gmail.com">Discuss this work ${icon('arrow')}</a><a class="button button-outline" href="${esc(c.artifact)}" download>Download visual brief ${icon('down')}</a></div><p class="dialog-source-note"><strong>Evidence and scope.</strong> ${esc(c.source)}</p>`,true);
  }
  function openExperiment() {
    const c = data.stories['experimental-control'];
    openDialog(`<p class="eyebrow">EXPERIMENTAL CAPABILITY / IIT MADRAS</p><h2 id="dialog-title">${esc(c.question)}</h2><p class="dialog-lead">${esc(c.solution)}</p><div class="source-hardware"><figure><img src="assets/photography/mfc-cantilevers.jpg" width="1024" height="768" alt="Photograph of two Smart Material FR4 cantilevers with bonded MFC patches" loading="lazy"><figcaption>MFC cantilevers for energy harvesting. <a href="https://smart-material.com/piezoelectric-products/macro-fiber-composite-mfc-custom-design/" target="_blank" rel="noopener noreferrer">Photo: Smart Material ↗</a> · Manufacturer hardware reference.</figcaption></figure><div><h3>Smart-material hardware.</h3><p>MFC composites connect electrical input and structural strain. My experience brings smart-material actuation together with real-time control and measured feedback.</p></div></div>${disclosure('Control-loop architecture','Controller, drive, flexible structure and measured feedback',artifactHTML('assets/evidence/closed-loop-control.svg','Functional closed-loop vibration control: reference, dSPACE MicroLabBox, drive amplifier, smart-material actuator, flexible structure, sensing and measured feedback.','The closed-loop experiment','Functional reconstruction of the documented dSPACE facility and my stated MicroLabBox experience. The specimen is illustrative.'))}<div class="experiment-notes"><section><h3>Coupled physics</h3><p>Electrical input becomes material strain and structural motion. My experience includes piezoelectric actuation and MFC smart composites.</p></section><section><h3>Hardware integration</h3><p>Connect the real-time controller, actuator drive and signal acquisition to close the feedback path around a flexible structure.</p></section><section><h3>Where it helps</h3><p>Bring modelling and testing together for vibration-sensitive machinery, flexible structures and precision equipment.</p></section></div><div class="dialog-actions"><a class="button button-dark" href="assets/evidence/closed-loop-control.png" download>Download the control-loop image ${icon('down')}</a><button class="button button-outline" data-research="serep-control-2020">Explore the numerical control study ${icon('arrow')}</button></div><p class="dialog-source-note"><strong>Evidence and scope.</strong> Facility development follows my résumé; MicroLabBox and MFC experience are user-stated. This is a functional schematic, not an apparatus photograph. The SEREP paper’s numerical validation is separate; no measured suppression percentage, sampling rate or MFC specimen is inferred.</p>`,true);
  }
  const percent = value => (value * 100).toFixed(1) + '%';
  const insightPath = 'assets/apps/bearing-insight/';
  function insightScore(value) { return value > 0 && value < .001 ? '<0.1%' : percent(value); }
  function bearingInsightPreview() {
    const e = window.BEARING_INSIGHT, sample = e.example;
    return `<figure class="answer-visual insight-preview"><div class="insight-heading"><div><span class="visual-eyebrow">INDEPENDENT APP / WORKING CNN</span><h4>Bearing <span>Insight</span></h4></div><span class="insight-version">${esc(e.model)}</span></div><div class="insight-flow" aria-label="Image input, CNN pattern ranking, inspection report"><span><b>01</b> Image</span>${icon('right')}<span><b>02</b> CNN ranking</span>${icon('right')}<span><b>03</b> Report</span></div><div class="insight-assessment"><div class="insight-input"><img src="${insightPath}${esc(sample.file)}" width="64" height="64" alt="Procedurally generated pitting-like surface texture used in the Bearing Insight app" loading="lazy"><span>SYNTHETIC INPUT</span></div><div class="insight-ranking"><p class="tiny-label">ACTUAL APP OUTPUT</p><strong>${esc(sample.app_suggestion)}</strong><div class="insight-scores">${sample.top_three.map(x=>`<div class="insight-score"><div><span>${esc(x.label)}</span><b>${esc(insightScore(x.score))}</b></div><span class="insight-track"><i style="width:${x.score*100}%"></i></span></div>`).join('')}</div><p class="insight-score-note">Uncalibrated model scores</p></div></div><div class="insight-next"><span class="tiny-label">THE ENGINEERING FOLLOW-UP</span><p>${esc(sample.next_check)}</p></div><div class="insight-capabilities"><span>6 surface patterns</span><span>Local inference</span><span>JSON report</span></div><div class="insight-actions"><a class="button button-dark" href="${insightPath}index.html">Open Bearing Insight ${icon('arrow')}</a><button class="text-link" data-bearing-insight>Model &amp; evidence ${icon('right')}</button></div><figcaption>Independent demonstration, separate from the Caterpillar production application. Trained and tested on synthetic textures; real-photo performance is unvalidated.</figcaption></figure>`;
  }
  function openBearingInsight() {
    const e = window.BEARING_INSIGHT;
    const rows = e.classes.map((label,i)=>`<tr><th scope="row">${esc(label)}</th><td>${e.confusion_matrix[i][i]} / ${e.confusion_matrix[i].reduce((a,b)=>a+b,0)}</td><td>${percent(e.per_class_f1[i])}</td></tr>`).join('');
    const technical = `<div class="technical-case"><section class="dialog-section"><h3>From pixels to a pattern ranking</h3><p>A 64 × 64 RGB image enters three 3 × 3 convolutional layers (8, 16 and 24 channels), with ReLU activations, two max-pooling layers and adaptive 4 × 4 average pooling. A 384 → 6 linear layer produces the six class scores. The browser uses the same trained weights and architecture as the PyTorch model.</p></section><section class="dialog-section"><h3>Training and model selection</h3><p>${e.train_count.toLocaleString()} procedural images for training, ${e.validation_count} for validation and ${e.test_count} for the final test. Adam, learning rate 0.001, batch size 64, 70 epochs. The lowest validation cross-entropy checkpoint was selected at epoch ${e.best_epoch}. Independent random seeds separate the splits; all use the same texture generator.</p></section><section class="dialog-section"><h3>A result that can be inspected</h3><p>The JSON report records the model version, image name, input type, six scores, suggested pattern and follow-up check. The app marks low top scores as inconclusive using a provisional 0.65 threshold. Scores are uncalibrated; there is no validated unknown-object or mixed-damage detector.</p></section></div><section class="result-table-section"><h3>Final synthetic test · 100 images per class</h3><div class="result-table-scroll" tabindex="0" role="region" aria-label="Per-class synthetic test results"><table class="insight-test-table"><thead><tr><th scope="col">Reference pattern</th><th scope="col">Correct / tested</th><th scope="col">Class F1</th></tr></thead><tbody>${rows}</tbody></table></div><p class="table-note">523 of 600 examples classified correctly. The 54/100 result for scratch / scoring exposes a weaker class that the overall score alone conceals. The full confusion matrix is available in the app and downloadable metrics.</p></section>`;
    openDialog(`<p class="eyebrow">BEARING INSIGHT / INDEPENDENT APPLICATION</p><h2 id="dialog-title">How can an image classifier become a usable inspection tool?</h2><p class="dialog-lead">A complete image-to-report workflow: select a surface image, run a trained CNN locally, inspect the ranked patterns and export a traceable assessment.</p><p class="insight-scope">This is the app developed in the Bearing Failure Classifier project. It demonstrates implementation capability separately from my Caterpillar production work.</p><div class="insight-workflow"><section><span>01 / INPUT</span><h3>Bring in the image.</h3><p>Image upload and six built-in synthetic examples. Preprocessing and inference run in the browser.</p></section><section><span>02 / INTERPRET</span><h3>Make the output visible.</h3><p>Six ranked surface patterns, explicit model scores and suggested engineering follow-up checks.</p></section><section><span>03 / RECORD</span><h3>Keep the evidence.</h3><p>Download a JSON assessment with the model version, input type, scores and next inspection step.</p></section></div><div class="dialog-actions insight-dialog-actions"><a class="button button-dark" href="${insightPath}index.html">Open Bearing Insight ${icon('arrow')}</a><a class="button button-outline" href="${insightPath}research-package.zip" download>Training code, weights &amp; model card ${icon('down')}</a></div><section class="insight-validation"><p class="eyebrow">EXECUTED TRAINING RUN / SYNTHETIC DATA ONLY</p><h3>What was actually measured?</h3><div class="evidence-metrics"><div><strong>${percent(e.test_accuracy)}</strong><span>Final synthetic test accuracy</span></div><div><strong>${percent(e.macro_f1)}</strong><span>Final synthetic test macro-F1</span></div><div><strong>${e.test_count}</strong><span>Held-out synthetic test images</span></div></div><p>The model was trained from scratch on generated textures. These scores measure recognition within the same generator family. No real bearing photographs were used for training, validation or testing.</p></section>${disclosure('Model architecture & class-by-class results','Training, inference, report structure and measured errors',technical)}<div class="dialog-contribution"><span class="tiny-label">INDUSTRIAL VALUE</span><p>Demonstrates how to package a vision model into a consistent inspection workflow: an image becomes a reviewable pattern ranking, a targeted follow-up check and an exportable record. This workflow is relevant to component quality, engine development and machinery investigations.</p></div><p class="insight-scope">Current scope: simplified surface-pattern classification. The app does not establish a failure mechanism, root cause, remaining life or serviceability. Real-photo validation is the next evidence requirement.</p><div class="dialog-actions"><button class="text-link" data-project="industrial-intelligence">Caterpillar delivery &amp; ownership ${icon('arrow')}</button>${external(insightPath+'MODEL_CARD.md','Read the model card')}${external(insightPath+'metrics.json','Recorded metrics')}</div><p class="dialog-source-note"><strong>Provenance.</strong> Original Bearing Insight model ${esc(e.model)}, source commit <code>${esc(e.source_commit.slice(0,12))}</code>. The model, inference and research package are preserved from that app. The displayed example was executed with those weights; its scores are not calibrated failure probabilities.</p>`, true);
  }
  function applicationsStrip(items) {
    return `<div class="case-transfers"><span class="tiny-label">POTENTIAL INDUSTRIAL USE</span><ul>${items.map(([sector,use])=>`<li><strong>${esc(sector)}</strong><span>${esc(use)}</span></li>`).join('')}</ul><a href="#applications">Explore applications ${icon('right')}</a></div>`;
  }
  function spaceMountHTML() {
    return `<article class="question-story research-story thermal-story" id="space-mounts"><div class="research-intro"><div><p class="story-kicker"><span>05</span>PHD / THERMO-MECHANICAL REANALYSIS</p><h3>Where should a PCB be mounted when its supports also carry away heat?</h3></div><p>Reuse a response library to search mount positions against temperature, thermal strain and stiffness.</p></div>${window.ThermalShowcase.html()}${applicationsStrip([['Space electronics','Screw-tower cooling paths'],['Power conversion','Heat + mounting constraints'],['Industrial hardware','Thermal distortion + dynamics']])}</article>`;
  }
  function storyVisual(id) {
    if (id === 'pth-fatigue-2026') return `<figure class="answer-visual fatigue-answer"><div class="visual-eyebrow">TEST → MODEL → LIFE PREDICTION</div><a class="result-image" href="assets/evidence/fatigue-results-compact.svg" target="_blank" rel="noopener noreferrer" aria-label="Open full-size fatigue life comparison"><picture><source media="(max-width:600px)" srcset="assets/evidence/fatigue-results-compact-mobile.svg" width="400" height="440"><img src="assets/evidence/fatigue-results-compact.svg" width="650" height="400" alt="All six calibrated Dirlik life ratios: high-excitation predictions 0.40 to 1.50 times measured mean life; lower-excitation predictions 4.56 and 7.27 times measured life." loading="lazy"></picture></a><figcaption><strong>10 tested assemblies.</strong> Solid- and shell-PCB models with refined leads and measured damping. All six Dirlik comparisons; lower-excitation mismatch remains visible.<span>Patel et al., 2026 · Tables 2.1 & 5.3</span></figcaption></figure>`;
    if (id === 'industrial-intelligence') return bearingInsightPreview();
    if (id === 'serep-control-2020') return window.ControlShowcase.html();
    return window.MountShowcase.html();
  }
  function renderEvidence() {
    const entries = [
      ['pth-fatigue-2026','01','evidence-pcb-digital-twin','PHD / ELECTRONICS RELIABILITY'],
      ['industrial-intelligence','02','evidence-industrial-intelligence','INDUSTRY / CATERPILLAR'],
      ['serep-control-2020','03','evidence-masters-rom-control','MASTER’S / TWO CONTROL STUDIES'],
      ['mount-layout-dmc-2026','04','evidence-mount-intelligence','PHD / DESIGN AUTOMATION']
    ];
    $('#evidence-stories').innerHTML = entries.map(([id,n,anchor,label]) => {
      const c = data.stories[id];
      const isControl = id === 'serep-control-2020';
      const isMount = id === 'mount-layout-dmc-2026';
      if (isControl || isMount) {
        const intro = isControl ? 'Retain actuator coupling. Design on a smaller model. Check the nominal response, then material variability.' : 'Screen support positions against assembly strain, board dynamics and component stress—then show why a layout passes.';
        const transfers = isControl ? [['Robotics & precision','Flexible-arm vibration'],['Aerospace structures','Repeated controller design'],['Automotive & rail','Parameter-variation studies']] : [['Electronics packages','Support placement'],['Assembly fixtures','Strain control'],['Lightweight structures','Stiffness + dynamics']];
        return `<article class="question-story research-story" id="${anchor}"><div class="research-intro"><div><p class="story-kicker"><span>${n}</span>${label}</p><h3>${esc(c.question)}</h3></div><p>${esc(intro)}</p></div>${storyVisual(id)}${applicationsStrip(transfers)}</article>`;
      }
      const action = id === 'industrial-intelligence' ? 'bearing-insight' : 'research';
      return `<article class="question-story" id="${anchor}"><div class="question-copy"><p class="story-kicker"><span>${n}</span>${label}</p><h3>${esc(c.question)}</h3><div class="story-answer"><span class="tiny-label">HOW I SOLVED IT</span><p>${esc(c.solution)}</p></div><p class="story-insight">${esc(c.novelty)}</p><p class="story-industry"><span>INDUSTRIAL VALUE</span>${esc(c.industry_application)}</p><button class="text-link evidence-link" data-${action}="${id}">${esc(c.details_label)} ${icon('arrow')}</button></div><div class="question-proof">${storyVisual(id)}</div></article>`;
    }).join('') + spaceMountHTML();
  }

  function renderQuestions() {
    const ids=['experimental-control','spatial-rom-manuscript','pcb-insight','assembly-strain'];
    $('#question-grid').innerHTML=ids.map((id,i)=>{
      const c=data.stories[id], action=c.type==='paper'?'research':c.type==='experiment'?'experiment':'project';
      const anchor=id==='experimental-control'?id:c.type==='paper'?'paper-'+id:'project-'+id;
      return `<article class="question-card" id="${anchor}"><p class="question-meta"><span>${c.name?esc(c.name):c.type==='experiment'?'CONTROL HARDWARE':c.type==='paper'?'RESEARCH':'ENGINEERING TOOL'}</span><span>${esc(c.status)}</span></p><h3><button data-${action}="${id}">${esc(c.question)} ${icon('arrow')}</button></h3><p>${esc(c.short_result)}</p><span class="question-open">${esc(c.details_label)} ${icon('right')}</span></article>`;
    }).join('');
  }
  function renderPapers() {
    $('#paper-list').innerHTML=data.publications.map(p=>`<article class="paper-row"><div class="paper-meta"><span class="paper-year">${p.year}</span><span class="paper-phase">${p.phase==='masters'?'Master’s':'PhD'}</span></div><div class="paper-main"><h3><button data-research="${esc(p.id)}">${esc(p.title)}</button></h3><p class="paper-venue">${esc(p.venue)}</p><span class="paper-status ${p.status==='Published'?'':'pending'}">${esc(p.status)}</span></div><div class="paper-actions"><button data-research="${esc(p.id)}" aria-label="Read the evidence for ${esc(p.title)}">View evidence ${icon('arrow')}</button>${p.url ? external(p.url,'Paper','') : ''}</div></article>`).join('');
  }
  document.addEventListener('click',e=>{
    const insight=e.target.closest('[data-bearing-insight]'); if(insight){ openBearingInsight(); return; }
    const experiment=e.target.closest('[data-experiment]'); if(experiment){ openExperiment(); return; }
    const research=e.target.closest('[data-research]'); if(research){ openResearch(research.dataset.research); return; }
    const project=e.target.closest('[data-project]'); if(project){ openProject(project.dataset.project); return; }
    const cite=e.target.closest('[data-cite]'); if(cite){ const p=data.publications.find(x=>x.id===cite.dataset.cite); if(p?.url)copyText(p.citation); }
  });
  $('.nav-toggle').addEventListener('click',e=>{
    e.stopPropagation(); const b=$('.nav-toggle'), open=b.getAttribute('aria-expanded')!=='true';
    b.setAttribute('aria-expanded',String(open)); b.setAttribute('aria-label',open?'Close navigation':'Open navigation');
    $('#main-nav').classList.toggle('open',open); b.innerHTML=icon(open?'close':'menu');
  });
  $$('.main-nav a').forEach(a=>a.addEventListener('click',()=>{ if($('.nav-toggle').getAttribute('aria-expanded')==='true')$('.nav-toggle').click(); }));
  document.addEventListener('keydown',e=>{ if(e.key==='Escape' && $('.nav-toggle').getAttribute('aria-expanded')==='true')$('.nav-toggle').click(); });
  document.addEventListener('click',e=>{ if(!e.target.closest('.site-header') && $('.nav-toggle').getAttribute('aria-expanded')==='true')$('.nav-toggle').click(); });
  if('IntersectionObserver' in window){
    const o=new IntersectionObserver(entries=>entries.forEach(n=>{if(n.isIntersecting)$$('.main-nav a').forEach(a=>a.classList.toggle('is-current',a.getAttribute('href')==='#'+n.target.id));}),{rootMargin:'-15% 0px -65% 0px'});
    $$('section[id]').forEach(s=>o.observe(s));
  }
  $('#copy-email').addEventListener('click',()=>copyText(data.profile.email));
  $('#sources-button').addEventListener('click',()=>openDialog(`<p class="eyebrow">RESEARCH, WITH A PAPER TRAIL</p><h2 id="dialog-title">Sources & credits.</h2><p class="dialog-lead">Original research figures, traceable result tables, documented industry work and clearly labelled ongoing research.</p><div class="sources-list">${external('https://doi.org/10.1016/j.ifacol.2020.06.009','SEREP control · IFAC-PapersOnLine','')}${external('https://doi.org/10.23919/SICE48898.2020.9240388','Stochastic ROM control · SICE / IEEE','')}${external('https://doi.org/10.1016/j.microrel.2026.116158','PTH fatigue · Microelectronics Reliability','')}${external('assets/papers/patel-2026-pth-fatigue.pdf','Full fatigue paper · CC BY 4.0','')}${external('assets/papers/patel-thesis.pdf','Master’s thesis · original numerical figures','')}${external('assets/papers/dmc-2026-digest.pdf','DMC digest · original mount results','')}${external('assets/apps/thermal-mount-search/index.html','Thermo-Mechanical Mount Search · artifact page','')}${external('https://www.heu-apriori.eu/fellows/','Biography and portrait · APRIORI','')}${external('assets/photography/IMAGE_CREDITS.md','Hardware photographs · sources & credits','')}${external('assets/evidence/converter/IMAGE_CREDITS.md','STEP converter imagery · public sources & licences','')}${external('https://github.com/patelhiren3385','Hiren Patel · GitHub','')}${external(insightPath+'MODEL_CARD.md','Bearing Insight · model card & validation scope','')}${external('https://orcid.org/0000-0002-2419-9099','Publication identity · ORCID','')}</div><div class="dialog-sections"><section class="dialog-section"><h3>Original paper evidence</h3><p>SEREP Figures 6 and 12 retain the original axes and legends. Attribution: Patel, Kumar & Ali, IFAC-PapersOnLine 53(1), 51–56 (2020), © IFAC. Fatigue Figures 1, 4, 5 and 7 are credited to Patel, Sorokin & Nielsen (2026), CC BY 4.0. The fatigue chart is replotted from Tables 2.1 and 5.3 with ratios recomputed from reported lifetimes.</p></section><section class="dialog-section"><h3>Research still in progress</h3><p>The DMC and spatial cases use original figures and numerical results from the earlier research digest and working manuscript. They are identified as submitted / in preparation. Discrete reconstruction does not establish accuracy at arbitrary unsampled positions.</p></section><section class="dialog-section"><h3>Experiments and career</h3><p>Career sequence and Caterpillar contributions follow my uploaded résumés. The closed-loop image reconstructs the documented dSPACE facility using my stated MicroLabBox experience; it is a functional schematic, not a photograph. MFC experience is stated separately from the paper’s piezoelectric-actuator specimen. The master’s overview uses original thesis figures from Chapters 4 and 5. The nominal IFAC paper has two actuators; the thesis benchmark has three collocated sensor/actuator pairs. The thesis reports 45.60% time saving for the 320-active-DOF stochastic case. Its 1,000-realization assessment designs a gain for each sampled system. The new animation explains coordinate selection; numerical response plots remain the original source figures.</p></section><section class="dialog-section"><h3>Bearing Insight application</h3><p>The complete app, trained model and research package come from the separate Bearing Failure Classifier project. Its six synthetic texture classes, 600-image final test and recorded sample predictions are independent of Caterpillar work. The app includes the original training code, model card, metrics and numerical parity check. Real-photo performance has not been validated.</p></section><section class="dialog-section"><h3>Hardware photography and product imagery</h3><p>MFC patch and cantilever photographs come from Smart Material. The Cat engine/transmission visualization comes from Caterpillar. The STEP workflow uses a public KiCad 3D Viewer screenshot (KiCad project, CC BY 3.0) and a real component photograph (© Raimond Spekking / CC BY-SA 4.0, via Wikimedia Commons). Captions identify them as public references illustrating assembly and lead detail. These manufacturer references illustrate relevant hardware families; they are not photographs of my apparatus and do not establish work on the exact pictured models. Copyright remains with the respective rights holders. The PCB test photographs are extracted from Figure 4 of my 2026 fatigue paper, © The Authors, CC BY 4.0; its original raster is shown without the PDF’s overlaid annotations.</p></section><section class="dialog-section"><h3>Thermo-mechanical mount artifact</h3><p>The uploaded thermo_mechanical_mount_search.html is preserved unchanged as a download. A compatible web presentation embeds the same original JavaScript and data on its own page, with the script moved to an external file to avoid hosting instrumentation inside inline SVG strings. Main-page field plots are replotted from its embedded mesh and stored accepted-layout results. Its recorded benchmark includes convection; spacecraft screw-tower cooling is a transfer application. Search timings and acceptance checks are stored study results, not a new full-FE validation or a global-optimality guarantee.</p></section><section class="dialog-section"><h3>Industrial applications</h3><p>Examples beyond the demonstrated pump-electronics, powertrain and numerical-beam cases describe transferable methods and potential uses. They are not claims of deployment or qualification in every listed industry.</p></section></div>`,true));
  renderEvidence(); renderQuestions(); renderPapers();
  window.ControlShowcase.mount(document);
  window.ThermalShowcase.mount?.(document);
  $('#step-converter').innerHTML = window.ConverterShowcase.html();
  $$('a[href="#publications"]').forEach(a => a.addEventListener('click', () => { $('#publications').open = true; }));
  window.addEventListener('load', () => {
    if (!location.hash) return;
    let id; try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    if(id==='publications' || id==='code') $('#publications').open = true;
    if (id === 'thermo-mechanical' || id === 'thermal-mount-search') id = 'space-mounts';
    if (id === 'project-geometry-intelligence') id = 'step-converter';
    if (id === 'paper-stochastic-control-2020') id = 'evidence-masters-rom-control';
    document.getElementById(id)?.scrollIntoView({block:'start'});
  }, {once:true});
})();
