(function () {
  'use strict';

  const model = window.PCBMountModel;
  const data = window.PCB_MOUNT_APP_DATA;
  if (!model || !data) {
    document.body.innerHTML = '<main style="padding:3rem;font-family:system-ui"><h1>Application files did not load.</h1><p>Reload the page or verify that model.js and data.js are available.</p></main>';
    return;
  }

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const byId = (id) => document.getElementById(id);
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));

  const state = {
    candidates: clone(data.defaultCandidateSource.candidates),
    candidateSource: {
      name: data.defaultCandidateSource.name,
      dataScope: data.defaultCandidateSource.dataScope,
      note: data.defaultCandidateSource.note
    },
    targetCount: 4,
    selected: [],
    prediction: {
      strainMicrostrain: null,
      firstModeHz: null,
      peakRatioPercent: null,
      dynamicCriterionPass: null,
      source: null,
      note: null
    },
    fe: {
      strainMicrostrain: null,
      firstModeHz: null,
      peakRatioPercent: null,
      dynamicCriterionPass: null,
      source: null,
      note: null
    },
    tolerances: { ...data.tolerances },
    activeReference: null,
    highlightedMount: null
  };

  let toastTimer = null;

  function toast(message) {
    const element = byId('toast');
    element.textContent = message;
    element.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => element.classList.remove('is-visible'), 2800);
  }

  function boardBounds(candidates = state.candidates) {
    if (!candidates.length) return { minX: 0, maxX: 100, minY: 0, maxY: 100 };
    const xs = candidates.map((candidate) => candidate.x).filter(Number.isFinite);
    const ys = candidates.map((candidate) => candidate.y).filter(Number.isFinite);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const padX = Math.max((maxX - minX) * 0.08, 1);
    const padY = Math.max((maxY - minY) * 0.08, 1);
    return { minX: minX - padX, maxX: maxX + padX, minY: minY - padY, maxY: maxY + padY };
  }

  function displayPosition(candidate, bounds) {
    const width = Math.max(bounds.maxX - bounds.minX, 1e-9);
    const height = Math.max(bounds.maxY - bounds.minY, 1e-9);
    return {
      x: 5 + ((candidate.x - bounds.minX) / width) * 90,
      y: 5 + ((candidate.y - bounds.minY) / height) * 90
    };
  }

  function candidateById(id) {
    return state.candidates.find((candidate) => candidate.id === id) || null;
  }

  function selectedRegions() {
    return new Set(state.selected.map((id) => candidateById(id)?.region).filter(Boolean));
  }

  function selectionValidation() {
    return model.validateSelection(state.selected, state.candidates, {
      min: 2,
      max: 6,
      targetCount: state.targetCount,
      onePerRegion: true
    });
  }

  function activeSource() {
    return {
      sourceName: state.candidateSource.name,
      sourceUrl: data.study.evidenceUrl,
      dataScope: state.candidateSource.dataScope,
      note: state.candidateSource.note
    };
  }

  function syncReferenceFromSelection() {
    const selectedReference = data.references.selected;
    const current = [...state.selected].sort().join('|');
    const reference = [...selectedReference.mountIds].sort().join('|');
    if (current === reference) state.activeReference = 'selected';
    else if (state.activeReference === 'selected') state.activeReference = null;
  }

  function renderBoard() {
    const board = byId('board');
    board.querySelectorAll('.mount-node').forEach((node) => node.remove());
    const bounds = boardBounds();
    const selectedRegionSet = selectedRegions();

    state.candidates.forEach((candidate) => {
      const position = displayPosition(candidate, bounds);
      const selected = state.selected.includes(candidate.id);
      const blocked = !selected && selectedRegionSet.has(candidate.region);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `mount-node${selected ? ' is-selected' : ''}${blocked ? ' is-blocked' : ''}${state.highlightedMount === candidate.id ? ' is-highlighted' : ''}`;
      button.style.setProperty('--x', `${position.x}%`);
      button.style.setProperty('--y', `${position.y}%`);
      button.dataset.mountId = candidate.id;
      button.setAttribute('aria-pressed', String(selected));
      button.setAttribute('aria-label', `${selected ? 'Remove' : blocked ? 'Replace the selected mount in region with' : 'Select'} ${candidate.id}, region ${candidate.region}`);
      button.title = `${candidate.id} · ${candidate.region}`;
      button.innerHTML = `<span>${escapeHtml(candidate.id)} · ${escapeHtml(candidate.region)}</span>`;
      button.addEventListener('click', () => toggleMount(candidate.id));
      board.append(button);
    });
  }

  function toggleMount(id) {
    const candidate = candidateById(id);
    if (!candidate) {
      toast(`${id} is not in the active candidate set.`);
      return;
    }

    if (state.selected.includes(id)) {
      state.selected = state.selected.filter((mountId) => mountId !== id);
      state.highlightedMount = null;
      syncReferenceFromSelection();
      renderSelection();
      return;
    }

    const sameRegion = state.selected.find((mountId) => candidateById(mountId)?.region === candidate.region);
    if (sameRegion) {
      state.selected = state.selected.filter((mountId) => mountId !== sameRegion);
      state.selected.push(id);
      toast(`Replaced ${sameRegion} with ${id} in ${candidate.region}.`);
    } else if (state.selected.length >= state.targetCount) {
      toast(`The current target is ${state.targetCount} mounts. Remove one or increase the target count.`);
      return;
    } else state.selected.push(id);

    state.highlightedMount = null;
    syncReferenceFromSelection();
    renderSelection();
  }

  function addMountFromSearch() {
    const input = byId('mount-search');
    const normalized = model.normalizeMountId(input.value);
    if (!normalized) {
      toast('Enter a valid mount ID, for example G037.');
      input.focus();
      return;
    }
    const candidate = candidateById(normalized);
    if (!candidate) {
      toast(`${normalized} is not in the active candidate set.`);
      input.select();
      return;
    }
    state.highlightedMount = normalized;
    toggleMount(normalized);
    input.value = '';
    requestAnimationFrame(() => {
      state.highlightedMount = normalized;
      renderBoard();
      document.querySelector(`[data-mount-id="${normalized}"]`)?.focus({ preventScroll: true });
      setTimeout(() => {
        if (state.highlightedMount === normalized) {
          state.highlightedMount = null;
          renderBoard();
        }
      }, 1800);
    });
  }

  function renderSelection() {
    byId('candidate-source-name').textContent = state.candidateSource.name;
    byId('candidate-source-note').textContent = state.candidateSource.note;
    const sourceBadge = byId('candidate-source-badge');
    sourceBadge.textContent = state.candidateSource.dataScope === 'schematic' ? 'SCHEMATIC' : 'IMPORTED';

    byId('selection-count').textContent = String(state.selected.length);
    byId('target-count-display').textContent = String(state.targetCount);
    byId('target-count').value = String(state.targetCount);

    const validation = selectionValidation();
    const status = byId('selection-status');
    status.className = `status-pill ${validation.valid ? 'pass' : state.selected.length > state.targetCount ? 'fail' : 'neutral'}`;
    status.textContent = validation.valid ? 'VALID' : state.selected.length > state.targetCount ? 'INVALID' : 'INCOMPLETE';

    const chips = byId('selected-mounts');
    if (!state.selected.length) chips.innerHTML = '<p class="empty-state">No mounts selected.</p>';
    else chips.innerHTML = state.selected.map((id) => {
      const candidate = candidateById(id);
      return `<span class="mount-chip">${escapeHtml(id)} <small>${escapeHtml(candidate?.region || '')}</small><button type="button" data-remove-mount="${escapeHtml(id)}" aria-label="Remove ${escapeHtml(id)}">×</button></span>`;
    }).join('');
    chips.querySelectorAll('[data-remove-mount]').forEach((button) => button.addEventListener('click', () => toggleMount(button.dataset.removeMount)));

    const messages = [];
    const difference = state.targetCount - state.selected.length;
    if (difference > 0) messages.push({ type: 'info', text: `Select ${difference} more mount${difference === 1 ? '' : 's'} to complete this layout.` });
    if (difference < 0) messages.push({ type: 'error', text: `Remove ${Math.abs(difference)} mount${difference === -1 ? '' : 's'} to match the target count.` });
    validation.errors.filter((error) => !['too-few-mounts', 'too-many-mounts', 'target-count-mismatch'].includes(error.code)).forEach((error) => messages.push({ type: 'error', text: error.message }));
    byId('selection-errors').innerHTML = messages.map((message) => `<p class="message${message.type === 'info' ? ' info' : ''}">${escapeHtml(message.text)}</p>`).join('');

    const screening = model.screenLayout(state.selected, state.candidates, {
      board: boardBounds(),
      min: 2,
      max: 6,
      targetCount: state.targetCount,
      onePerRegion: true
    });
    const hasMetrics = state.selected.length >= 2;
    byId('geometry-grade').textContent = hasMetrics ? screening.grade : 'Not ready';
    byId('geometry-score').textContent = hasMetrics ? `${screening.geometryScore}/100` : '—';
    byId('metric-spread').textContent = hasMetrics ? `${screening.spreadAreaPercent}%` : '—';
    byId('metric-centroid').textContent = hasMetrics ? `${screening.centroidOffsetPercent}%` : '—';
    byId('metric-spacing').textContent = hasMetrics ? `${screening.minSpacingPercent}% diag.` : '—';
    byId('metric-quadrants').textContent = hasMetrics ? `${screening.quadrantCoverage} / 4` : '—';
    byId('screening-warnings').innerHTML = screening.warnings.map((warning) => `<p>△ ${escapeHtml(warning)}</p>`).join('');

    byId('export-solver-request').disabled = !validation.valid;
    byId('copy-mount-ids').disabled = !validation.valid;
    renderBoard();
    renderReferences();
  }

  function loadPaperSelectedLayout() {
    const reference = data.references.selected;
    const missing = reference.mountIds.filter((id) => !candidateById(id));
    if (missing.length) {
      toast(`The active candidate file does not include ${missing.join(', ')}.`);
      return;
    }
    state.targetCount = reference.mountIds.length;
    state.selected = [...reference.mountIds];
    state.activeReference = 'selected';
    renderSelection();
    toast(`${reference.layoutId} loaded.`);
  }

  function clearSelection() {
    state.selected = [];
    state.activeReference = null;
    state.highlightedMount = null;
    renderSelection();
  }

  function importCandidateCsv(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = model.parseCandidateCsv(reader.result);
      if (parsed.errors.length) {
        toast(`Candidate CSV rejected: ${parsed.errors[0]}`);
        return;
      }
      if (parsed.candidates.length < 2) {
        toast('Candidate CSV must contain at least two valid candidates.');
        return;
      }
      state.candidates = parsed.candidates;
      state.candidateSource = {
        name: file.name,
        dataScope: 'imported-project-coordinates',
        note: `${parsed.candidates.length} candidates imported locally from ${file.name}. Coordinates and regions are included in exported solver requests; the file is not uploaded.`
      };
      state.selected = [];
      state.activeReference = null;
      renderSelection();
      toast(`${parsed.candidates.length} candidates imported.`);
    };
    reader.onerror = () => toast('The candidate CSV could not be read.');
    reader.readAsText(file);
  }

  function candidateCsv() {
    const rows = ['id,x,y,region'];
    state.candidates.forEach((candidate) => rows.push([candidate.id, candidate.x, candidate.y, candidate.region].join(',')));
    return `${rows.join('\n')}\n`;
  }

  function solverRequest() {
    const validation = selectionValidation();
    if (!validation.valid) return null;
    return {
      schema: 'pcb-mount-solver-request/v1',
      appVersion: data.appVersion,
      generatedAt: new Date().toISOString(),
      candidateSource: activeSource(),
      studyContext: {
        loadN: data.study.loadN,
        loadArea: data.study.loadArea,
        note: 'Study context only. Confirm the solver load case before execution.'
      },
      constraints: {
        exactMountCount: state.targetCount,
        oneMountPerRegion: true,
        uniqueMountIds: true
      },
      layout: {
        mountIds: [...state.selected],
        mounts: state.selected.map((id) => {
          const candidate = candidateById(id);
          return { id, x: candidate.x, y: candidate.y, region: candidate.region };
        })
      },
      requestedOutputs: [
        'worst-zone equivalent elastic strain in microstrain',
        'first PCB-dominated mode in Hz',
        'PCB-to-component lead-hotspot peak-stress ratio or explicit dynamic criterion status'
      ]
    };
  }

  function downloadBlob(content, filename, type = 'application/json') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function copyText(value) {
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(value);
      else {
        const textarea = document.createElement('textarea');
        textarea.value = value;
        textarea.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
        document.body.append(textarea);
        textarea.select();
        if (!document.execCommand('copy')) throw new Error('Copy failed');
        textarea.remove();
      }
      toast('Copied to clipboard.');
    } catch {
      toast('Clipboard access failed. Select and copy the mount IDs manually.');
    }
  }

  function renderReferences() {
    const container = byId('reference-list');
    container.innerHTML = Object.values(data.references).map((reference) => {
      const active = state.activeReference === reference.key;
      const action = reference.mountIds ? 'Load layout + FE' : 'Load available FE fields';
      return `<article class="reference-card${active ? ' is-active' : ''}">
        <div class="ref-top"><div><span class="tiny-label">${escapeHtml(reference.label.toUpperCase())}</span><h3>${escapeHtml(reference.layoutId)}</h3></div><span class="ref-id">${reference.mountIds ? `${reference.mountIds.length} MOUNTS` : 'PARTIAL RECORD'}</span></div>
        <ul>${reference.facts.map((fact) => `<li>${escapeHtml(fact)}</li>`).join('')}</ul>
        <button type="button" class="text-button" data-reference="${escapeHtml(reference.key)}">${escapeHtml(action)}</button>
      </article>`;
    }).join('');
    container.querySelectorAll('[data-reference]').forEach((button) => button.addEventListener('click', () => loadReference(button.dataset.reference)));
  }

  function loadReference(key) {
    const reference = data.references[key];
    if (!reference) return;
    state.activeReference = key;
    if (reference.mountIds) {
      const missing = reference.mountIds.filter((id) => !candidateById(id));
      if (!missing.length) {
        state.targetCount = reference.mountIds.length;
        state.selected = [...reference.mountIds];
      } else toast(`FE reference loaded, but the active candidate set is missing ${missing.join(', ')}.`);
    }
    state.fe = model.normalizeResult(reference.directFe);
    syncResultInputs();
    renderSelection();
    renderVerification();
    byId('verify').scrollIntoView({ behavior: 'smooth', block: 'start' });
    toast(`${reference.layoutId} evidence loaded.`);
  }

  function valueFromInput(id) {
    return model.toFiniteNumber(byId(id).value);
  }

  function readResultInputs() {
    state.prediction = {
      ...state.prediction,
      strainMicrostrain: valueFromInput('prediction-strain'),
      firstModeHz: valueFromInput('prediction-mode'),
      peakRatioPercent: valueFromInput('prediction-ratio'),
      dynamicCriterionPass: null,
      source: byId('prediction-source').value.trim() || null
    };
    const dynamicStatus = byId('fe-dynamic-status').value;
    state.fe = {
      ...state.fe,
      strainMicrostrain: valueFromInput('fe-strain'),
      firstModeHz: valueFromInput('fe-mode'),
      peakRatioPercent: valueFromInput('fe-ratio'),
      dynamicCriterionPass: dynamicStatus === 'pass' ? true : dynamicStatus === 'fail' ? false : null,
      source: byId('fe-source').value.trim() || null
    };
    state.tolerances = {
      strainRelativePercent: valueFromInput('tol-strain') ?? data.tolerances.strainRelativePercent,
      modeRelativePercent: valueFromInput('tol-mode') ?? data.tolerances.modeRelativePercent,
      peakRatioAbsolutePercent: valueFromInput('tol-ratio') ?? data.tolerances.peakRatioAbsolutePercent
    };
  }

  function setInputValue(id, value) {
    byId(id).value = value === null || value === undefined ? '' : String(value);
  }

  function syncResultInputs() {
    setInputValue('prediction-strain', state.prediction.strainMicrostrain);
    setInputValue('prediction-mode', state.prediction.firstModeHz);
    setInputValue('prediction-ratio', state.prediction.peakRatioPercent);
    setInputValue('prediction-source', state.prediction.source);
    setInputValue('fe-strain', state.fe.strainMicrostrain);
    setInputValue('fe-mode', state.fe.firstModeHz);
    setInputValue('fe-ratio', state.fe.peakRatioPercent);
    byId('fe-dynamic-status').value = state.fe.dynamicCriterionPass === true ? 'pass' : state.fe.dynamicCriterionPass === false ? 'fail' : '';
    setInputValue('fe-source', state.fe.source);
    setInputValue('tol-strain', state.tolerances.strainRelativePercent);
    setInputValue('tol-mode', state.tolerances.modeRelativePercent);
    setInputValue('tol-ratio', state.tolerances.peakRatioAbsolutePercent);
    byId('fe-source-note').textContent = state.fe.note || '';
  }

  function normalizeImportedResult(payload) {
    const source = payload?.prediction || payload?.modelPrediction || payload?.directFe || payload?.fe || payload?.result || payload || {};
    const dynamicRaw = source.dynamicCriterionPass ?? source.dynamic_pass ?? source.dynamicPass;
    return model.normalizeResult({
      strainMicrostrain: source.strainMicrostrain ?? source.worstZoneStrainMicrostrain ?? source.worst_zone_strain_microstrain ?? source.strain,
      firstModeHz: source.firstModeHz ?? source.firstPcbModeHz ?? source.first_PCB_mode_Hz ?? source.modeHz ?? source.mode,
      peakRatioPercent: source.peakRatioPercent ?? source.pcbToComponentPeakRatioPercent ?? source.PCB_to_component_peak_ratio_percent ?? source.ratio,
      dynamicCriterionPass: typeof dynamicRaw === 'boolean' ? dynamicRaw : String(dynamicRaw).toLowerCase() === 'pass' ? true : String(dynamicRaw).toLowerCase() === 'fail' ? false : null,
      source: source.source ?? source.runId ?? payload?.source ?? null,
      note: source.note ?? payload?.note ?? null
    });
  }

  function importResultJson(file, type) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(reader.result);
        const result = normalizeImportedResult(payload);
        state[type] = result;
        if (type === 'fe') state.activeReference = null;
        syncResultInputs();
        renderReferences();
        renderVerification();
        toast(`${type === 'fe' ? 'Direct FE' : 'Prediction'} result imported from ${file.name}.`);
      } catch (error) {
        toast(`JSON import failed: ${error.message}`);
      }
    };
    reader.onerror = () => toast('The JSON file could not be read.');
    reader.readAsText(file);
  }

  function formatNumber(value, unit = '') {
    if (value === null || value === undefined || !Number.isFinite(Number(value))) return '—';
    const number = Number(value);
    const digits = Math.abs(number) >= 1000 ? 1 : Math.abs(number) >= 100 ? 1 : Math.abs(number) >= 10 ? 2 : 3;
    return `${number.toLocaleString(undefined, { maximumFractionDigits: digits })}${unit ? ` ${unit}` : ''}`;
  }

  function criterionLabel(status) {
    return status === 'pass' ? 'PASS' : status === 'fail' ? 'FAIL' : 'MISSING';
  }

  function verdictContent(verdict, comparison) {
    const messages = {
      'not-ready': { className: 'neutral', icon: '↔', title: 'Add prediction and FE results.', text: 'The tool will compare numerical errors and engineering pass/fail classifications.' },
      partial: { className: 'partial', icon: '◐', title: 'Partial comparison only.', text: 'Some fields can be compared, but a complete verification decision requires all three engineering criteria.' },
      verified: { className: 'pass', icon: '✓', title: 'Agreement gates are satisfied.', text: 'Available numerical errors are within the configured tolerances and the model reaches the same pass/fail decisions as direct FE.' },
      'outside-tolerance': { className: 'fail', icon: '!', title: 'Numerical agreement is outside tolerance.', text: 'The engineering classifications may match, but at least one model-to-FE error exceeds the configured agreement gate.' },
      'classification-mismatch': { className: 'fail', icon: '×', title: 'Model and FE reach different decisions.', text: 'At least one engineering criterion is classified differently. Investigate before accepting the predicted layout.' }
    };
    const content = messages[verdict] || messages['not-ready'];
    if (verdict === 'verified' && !comparison.complete) return messages.partial;
    return content;
  }

  function renderVerification() {
    readResultInputs();
    const comparison = model.comparePredictionToFe(state.prediction, state.fe, state.tolerances, data.limits);
    const verdict = verdictContent(comparison.verdict, comparison);
    const card = byId('comparison-verdict');
    card.className = `verdict-card ${verdict.className}`;
    card.innerHTML = `<span class="verdict-icon" aria-hidden="true">${verdict.icon}</span><div><span class="tiny-label">AGREEMENT CHECK</span><h3>${escapeHtml(verdict.title)}</h3><p>${escapeHtml(verdict.text)}</p></div>`;

    byId('comparison-body').innerHTML = comparison.metrics.map((metric) => {
      const classification = comparison.classification.find((item) => item.key === metric.key);
      let agreementText = 'Not compared';
      let agreementClass = 'neutral';
      if (classification?.match === false) {
        agreementText = 'Decision mismatch';
        agreementClass = 'fail';
      } else if (metric.comparable && metric.withinTolerance === false) {
        agreementText = 'Outside tolerance';
        agreementClass = 'fail';
      } else if (metric.comparable && metric.withinTolerance === true) {
        agreementText = 'Within tolerance';
        agreementClass = 'pass';
      } else if (classification?.match === true) {
        agreementText = 'Decision match';
        agreementClass = 'pass';
      }

      const errorText = metric.comparable
        ? metric.toleranceMode === 'relative'
          ? `${formatNumber(metric.relativeErrorPercent, '%')} rel.`
          : `${formatNumber(metric.absoluteError, metric.unit)} abs.`
        : classification?.comparable ? 'Status only' : '—';
      const toleranceText = metric.tolerance === null
        ? '—'
        : metric.toleranceMode === 'relative'
          ? `≤ ${formatNumber(metric.tolerance, '%')}`
          : `≤ ${formatNumber(metric.tolerance, 'pp')}`;
      return `<tr><th scope="row">${escapeHtml(metric.label)}</th><td>${formatNumber(metric.prediction, metric.unit)}</td><td>${formatNumber(metric.fe, metric.unit)}</td><td>${errorText}</td><td>${toleranceText}</td><td><span class="metric-status ${agreementClass}">${escapeHtml(agreementText)}</span></td></tr>`;
    }).join('');

    const metricLimitLabels = {
      strainMicrostrain: `≤ ${data.limits.strainMicrostrain.toLocaleString()} με`,
      firstModeHz: `≥ ${data.limits.firstModeHz.toLocaleString()} Hz`,
      peakRatioPercent: `≤ ${data.limits.peakRatioPercent}%`
    };
    byId('criteria-grid').innerHTML = model.METRICS.map((metric) => {
      const predictedStatus = comparison.predictionEvaluation.criteria[metric.key].status;
      const feStatus = comparison.feEvaluation.criteria[metric.key].status;
      return `<article class="limit-card"><span>${escapeHtml(metric.label.toUpperCase())}</span><strong>${escapeHtml(metricLimitLabels[metric.key])}</strong><div class="method-decisions"><span class="${predictedStatus === 'missing' ? '' : predictedStatus}">MODEL ${criterionLabel(predictedStatus)}</span><span class="${feStatus === 'missing' ? '' : feStatus}">FE ${criterionLabel(feStatus)}</span></div></article>`;
    }).join('');
    byId('fe-source-note').textContent = state.fe.note || '';
  }

  function report() {
    readResultInputs();
    return model.createReport({
      selection: state.selected,
      candidates: state.candidates,
      targetCount: state.targetCount,
      prediction: state.prediction,
      fe: state.fe,
      tolerances: state.tolerances,
      limits: data.limits,
      source: activeSource()
    });
  }

  function resetResults() {
    state.prediction = model.normalizeResult({});
    state.fe = model.normalizeResult({});
    state.tolerances = { ...data.tolerances };
    state.activeReference = null;
    syncResultInputs();
    renderReferences();
    renderVerification();
  }

  function renderCaveats() {
    byId('caveat-grid').innerHTML = data.caveats.map((caveat, index) => `<article class="caveat"><span>${String(index + 1).padStart(2, '0')}</span><p>${escapeHtml(caveat)}</p></article>`).join('');
  }

  function bindEvents() {
    byId('target-count').addEventListener('change', (event) => {
      state.targetCount = Number(event.target.value);
      if (state.selected.length > state.targetCount) {
        state.selected = state.selected.slice(0, state.targetCount);
        toast(`Selection trimmed to ${state.targetCount} mounts.`);
      }
      syncReferenceFromSelection();
      renderSelection();
    });
    byId('add-mount').addEventListener('click', addMountFromSearch);
    byId('mount-search').addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        addMountFromSearch();
      }
    });
    byId('load-selected-layout').addEventListener('click', loadPaperSelectedLayout);
    byId('clear-selection').addEventListener('click', clearSelection);
    byId('import-candidates').addEventListener('click', () => byId('candidate-csv-input').click());
    byId('candidate-csv-input').addEventListener('change', (event) => {
      importCandidateCsv(event.target.files?.[0]);
      event.target.value = '';
    });
    byId('download-template').addEventListener('click', () => downloadBlob(candidateCsv(), 'pcb-mount-candidate-template.csv', 'text/csv'));
    byId('export-solver-request').addEventListener('click', () => {
      const request = solverRequest();
      if (!request) return;
      downloadBlob(`${JSON.stringify(request, null, 2)}\n`, `pcb-mount-solver-request-${state.selected.join('-')}.json`);
      toast('Solver request exported.');
    });
    byId('copy-mount-ids').addEventListener('click', () => copyText(state.selected.join(', ')));

    byId('import-prediction').addEventListener('click', () => byId('prediction-json-input').click());
    byId('prediction-json-input').addEventListener('change', (event) => {
      importResultJson(event.target.files?.[0], 'prediction');
      event.target.value = '';
    });
    byId('import-fe').addEventListener('click', () => byId('fe-json-input').click());
    byId('fe-json-input').addEventListener('change', (event) => {
      importResultJson(event.target.files?.[0], 'fe');
      event.target.value = '';
    });

    [
      'prediction-strain', 'prediction-mode', 'prediction-ratio', 'prediction-source',
      'fe-strain', 'fe-mode', 'fe-ratio', 'fe-source', 'fe-dynamic-status',
      'tol-strain', 'tol-mode', 'tol-ratio'
    ].forEach((id) => byId(id).addEventListener(id === 'fe-dynamic-status' ? 'change' : 'input', () => {
      if (id.startsWith('fe-') && id !== 'fe-source' && state.activeReference) state.activeReference = null;
      renderReferences();
      renderVerification();
    }));

    byId('export-report').addEventListener('click', () => {
      const output = report();
      downloadBlob(`${JSON.stringify(output, null, 2)}\n`, `pcb-mount-verification-${Date.now()}.json`);
      toast('Verification report exported.');
    });
    byId('reset-results').addEventListener('click', resetResults);
  }

  function initialise() {
    bindEvents();
    renderCaveats();
    renderSelection();
    syncResultInputs();
    renderVerification();
  }

  window.PCBMountApp = Object.freeze({
    version: data.appVersion,
    loadPrediction(result) {
      state.prediction = normalizeImportedResult(result);
      syncResultInputs();
      renderVerification();
    },
    loadFeResult(result) {
      state.fe = normalizeImportedResult(result);
      state.activeReference = null;
      syncResultInputs();
      renderReferences();
      renderVerification();
    },
    getReport: report,
    getSolverRequest: solverRequest,
    getState() {
      return clone({
        selected: state.selected,
        targetCount: state.targetCount,
        candidateSource: state.candidateSource,
        prediction: state.prediction,
        fe: state.fe,
        tolerances: state.tolerances
      });
    }
  });

  initialise();
})();
