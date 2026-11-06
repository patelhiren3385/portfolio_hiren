(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.PCBMountModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DEFAULT_LIMITS = Object.freeze({
    strainMicrostrain: 1600,
    firstModeHz: 800,
    peakRatioPercent: 5
  });

  const DEFAULT_TOLERANCES = Object.freeze({
    strainRelativePercent: 20,
    modeRelativePercent: 5,
    peakRatioAbsolutePercent: 1
  });

  const METRICS = Object.freeze([
    {
      key: 'strainMicrostrain',
      label: 'Worst-zone strain',
      unit: 'με',
      direction: 'max',
      limitKey: 'strainMicrostrain',
      toleranceKey: 'strainRelativePercent',
      toleranceMode: 'relative'
    },
    {
      key: 'firstModeHz',
      label: 'First PCB mode',
      unit: 'Hz',
      direction: 'min',
      limitKey: 'firstModeHz',
      toleranceKey: 'modeRelativePercent',
      toleranceMode: 'relative'
    },
    {
      key: 'peakRatioPercent',
      label: 'PCB / component peak ratio',
      unit: '%',
      direction: 'max',
      limitKey: 'peakRatioPercent',
      toleranceKey: 'peakRatioAbsolutePercent',
      toleranceMode: 'absolute'
    }
  ]);

  function isFiniteNumber(value) {
    return typeof value === 'number' && Number.isFinite(value);
  }

  function toFiniteNumber(value) {
    if (value === '' || value === null || value === undefined) return null;
    const parsed = typeof value === 'number' ? value : Number(String(value).trim().replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : null;
  }

  function round(value, digits = 3) {
    if (!Number.isFinite(value)) return null;
    const factor = 10 ** digits;
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function normalizeMountId(value) {
    const raw = String(value ?? '').trim().toUpperCase();
    const match = /^G?0*(\d{1,3})$/.exec(raw);
    if (!match) return null;
    const number = Number(match[1]);
    if (!Number.isInteger(number) || number < 1 || number > 999) return null;
    return `G${String(number).padStart(3, '0')}`;
  }

  function candidateMap(candidates) {
    return new Map((candidates || []).map((candidate) => [normalizeMountId(candidate.id), candidate]));
  }

  function validateSelection(ids, candidates, options = {}) {
    const min = Number.isInteger(options.min) ? options.min : 2;
    const max = Number.isInteger(options.max) ? options.max : 6;
    const targetCount = Number.isInteger(options.targetCount) ? options.targetCount : null;
    const onePerRegion = options.onePerRegion !== false;
    const known = candidateMap(candidates);
    const normalized = [];
    const invalidTokens = [];

    for (const id of ids || []) {
      const normalizedId = normalizeMountId(id);
      if (!normalizedId) invalidTokens.push(String(id));
      else normalized.push(normalizedId);
    }

    const seen = new Set();
    const duplicates = [];
    for (const id of normalized) {
      if (seen.has(id)) duplicates.push(id);
      seen.add(id);
    }

    const uniqueIds = [...seen];
    const unknownIds = known.size ? uniqueIds.filter((id) => !known.has(id)) : [];
    const regions = new Map();
    for (const id of uniqueIds) {
      const region = known.get(id)?.region;
      if (!region) continue;
      if (!regions.has(region)) regions.set(region, []);
      regions.get(region).push(id);
    }
    const regionConflicts = [...regions.entries()]
      .filter(([, regionIds]) => regionIds.length > 1)
      .map(([region, regionIds]) => ({ region, ids: regionIds }));

    const errors = [];
    if (invalidTokens.length) errors.push({
      code: 'invalid-id',
      message: `Invalid mount ID${invalidTokens.length > 1 ? 's' : ''}: ${invalidTokens.join(', ')}`,
      values: invalidTokens
    });
    if (duplicates.length) errors.push({
      code: 'duplicate-id',
      message: `Duplicate mount ID${duplicates.length > 1 ? 's' : ''}: ${[...new Set(duplicates)].join(', ')}`,
      values: [...new Set(duplicates)]
    });
    if (unknownIds.length) errors.push({
      code: 'unknown-id',
      message: `Mount ID${unknownIds.length > 1 ? 's are' : ' is'} not present in the active candidate set: ${unknownIds.join(', ')}`,
      values: unknownIds
    });
    if (uniqueIds.length < min) errors.push({
      code: 'too-few-mounts',
      message: `Select at least ${min} mounts.`,
      actual: uniqueIds.length,
      expected: min
    });
    if (uniqueIds.length > max) errors.push({
      code: 'too-many-mounts',
      message: `Select no more than ${max} mounts.`,
      actual: uniqueIds.length,
      expected: max
    });
    if (targetCount !== null && uniqueIds.length !== targetCount) errors.push({
      code: 'target-count-mismatch',
      message: `Select exactly ${targetCount} mounts for the current layout.`,
      actual: uniqueIds.length,
      expected: targetCount
    });
    if (onePerRegion && regionConflicts.length) errors.push({
      code: 'region-conflict',
      message: regionConflicts.map((item) => `${item.region}: ${item.ids.join(' + ')}`).join('; '),
      conflicts: regionConflicts
    });

    return {
      valid: errors.length === 0,
      normalizedIds: uniqueIds,
      errors,
      duplicateIds: [...new Set(duplicates)],
      unknownIds,
      regionConflicts,
      regions: [...regions.keys()]
    };
  }

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function cross(o, a, b) {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  }

  function convexHull(points) {
    const clean = (points || [])
      .filter((point) => isFiniteNumber(point.x) && isFiniteNumber(point.y))
      .map((point) => ({ x: point.x, y: point.y }))
      .sort((a, b) => a.x - b.x || a.y - b.y);
    if (clean.length <= 1) return clean;
    const lower = [];
    for (const point of clean) {
      while (lower.length >= 2 && cross(lower.at(-2), lower.at(-1), point) <= 0) lower.pop();
      lower.push(point);
    }
    const upper = [];
    for (let index = clean.length - 1; index >= 0; index -= 1) {
      const point = clean[index];
      while (upper.length >= 2 && cross(upper.at(-2), upper.at(-1), point) <= 0) upper.pop();
      upper.push(point);
    }
    lower.pop();
    upper.pop();
    return lower.concat(upper);
  }

  function polygonArea(points) {
    if (!points || points.length < 3) return 0;
    let sum = 0;
    for (let index = 0; index < points.length; index += 1) {
      const next = points[(index + 1) % points.length];
      sum += points[index].x * next.y - next.x * points[index].y;
    }
    return Math.abs(sum) / 2;
  }

  function quadrant(x, y, centreX, centreY) {
    const horizontal = x < centreX ? 'L' : 'R';
    const vertical = y < centreY ? 'T' : 'B';
    return `${vertical}${horizontal}`;
  }

  function screenLayout(ids, candidates, options = {}) {
    const board = options.board || { minX: 0, maxX: 100, minY: 0, maxY: 100 };
    const selection = validateSelection(ids, candidates, options);
    const byId = candidateMap(candidates);
    const selected = selection.normalizedIds.map((id) => byId.get(id)).filter(Boolean);
    const centreX = (board.minX + board.maxX) / 2;
    const centreY = (board.minY + board.maxY) / 2;
    const boardWidth = Math.max(1e-9, board.maxX - board.minX);
    const boardHeight = Math.max(1e-9, board.maxY - board.minY);
    const boardArea = boardWidth * boardHeight;
    const boardDiagonal = Math.hypot(boardWidth, boardHeight);

    const centroid = selected.length ? {
      x: selected.reduce((sum, point) => sum + point.x, 0) / selected.length,
      y: selected.reduce((sum, point) => sum + point.y, 0) / selected.length
    } : { x: centreX, y: centreY };

    const centroidOffsetPercent = selected.length
      ? (distance(centroid, { x: centreX, y: centreY }) / (boardDiagonal / 2)) * 100
      : 0;
    const hull = convexHull(selected);
    const spreadAreaPercent = (polygonArea(hull) / boardArea) * 100;

    let minSpacingPercent = 0;
    if (selected.length >= 2) {
      let minDistance = Number.POSITIVE_INFINITY;
      for (let i = 0; i < selected.length; i += 1) {
        for (let j = i + 1; j < selected.length; j += 1) {
          minDistance = Math.min(minDistance, distance(selected[i], selected[j]));
        }
      }
      minSpacingPercent = (minDistance / boardDiagonal) * 100;
    }

    const quadrantCoverage = new Set(selected.map((point) => quadrant(point.x, point.y, centreX, centreY))).size;
    const regionCoverage = new Set(selected.map((point) => point.region).filter(Boolean)).size;
    const targetQuadrants = Math.min(4, selected.length);

    const spreadContribution = Math.min(1, spreadAreaPercent / 45) * 40;
    const centringContribution = Math.max(0, 1 - centroidOffsetPercent / 70) * 25;
    const spacingContribution = Math.min(1, minSpacingPercent / 18) * 20;
    const quadrantContribution = targetQuadrants ? (quadrantCoverage / targetQuadrants) * 15 : 0;
    const geometryScore = round(Math.max(0, Math.min(100,
      spreadContribution + centringContribution + spacingContribution + quadrantContribution
    )), 1);

    const warnings = [];
    if (selected.length >= 2 && minSpacingPercent < 7) warnings.push('Two or more mounts are tightly clustered on the schematic map.');
    if (selected.length >= 3 && quadrantCoverage < 3) warnings.push('The selected mounts cover fewer than three board quadrants.');
    if (selected.length && centroidOffsetPercent > 35) warnings.push('The mount centroid is far from the board centre on the schematic map.');

    const grade = geometryScore >= 75 ? 'broad' : geometryScore >= 50 ? 'moderate' : 'clustered';
    return {
      geometryOnly: true,
      valid: selection.valid,
      selection,
      selected,
      centroid: { x: round(centroid.x, 2), y: round(centroid.y, 2) },
      centroidOffsetPercent: round(centroidOffsetPercent, 1),
      spreadAreaPercent: round(spreadAreaPercent, 1),
      minSpacingPercent: round(minSpacingPercent, 1),
      quadrantCoverage,
      regionCoverage,
      geometryScore,
      grade,
      warnings
    };
  }

  function statusForMetric(value, metric, limits) {
    if (!isFiniteNumber(value)) return 'missing';
    const limit = limits[metric.limitKey];
    if (!isFiniteNumber(limit)) return 'missing';
    if (metric.direction === 'min') return value >= limit ? 'pass' : 'fail';
    return value <= limit ? 'pass' : 'fail';
  }

  function evaluateResult(result = {}, limits = DEFAULT_LIMITS) {
    const criteria = {};
    for (const metric of METRICS) {
      const value = toFiniteNumber(result[metric.key]);
      criteria[metric.key] = {
        ...metric,
        value,
        limit: limits[metric.limitKey],
        status: statusForMetric(value, metric, limits),
        source: value === null ? null : 'numeric'
      };
    }

    if (criteria.peakRatioPercent.status === 'missing' && typeof result.dynamicCriterionPass === 'boolean') {
      criteria.peakRatioPercent.status = result.dynamicCriterionPass ? 'pass' : 'fail';
      criteria.peakRatioPercent.source = 'status-only';
    }

    const statuses = Object.values(criteria).map((criterion) => criterion.status);
    const overall = statuses.includes('fail') ? 'fail' : statuses.every((status) => status === 'pass') ? 'pass' : 'partial';
    return { overall, criteria };
  }

  function compareMetric(metric, predictionValue, feValue, tolerances) {
    const prediction = toFiniteNumber(predictionValue);
    const fe = toFiniteNumber(feValue);
    if (prediction === null || fe === null) {
      return {
        key: metric.key,
        label: metric.label,
        unit: metric.unit,
        prediction,
        fe,
        comparable: false,
        withinTolerance: null,
        absoluteError: null,
        relativeErrorPercent: null,
        tolerance: tolerances[metric.toleranceKey],
        toleranceMode: metric.toleranceMode
      };
    }

    const absoluteError = Math.abs(prediction - fe);
    const relativeErrorPercent = Math.abs(fe) > Number.EPSILON ? (absoluteError / Math.abs(fe)) * 100 : null;
    const tolerance = toFiniteNumber(tolerances[metric.toleranceKey]);
    let withinTolerance = null;
    if (tolerance !== null) {
      withinTolerance = metric.toleranceMode === 'relative'
        ? relativeErrorPercent !== null && relativeErrorPercent <= tolerance
        : absoluteError <= tolerance;
    }

    return {
      key: metric.key,
      label: metric.label,
      unit: metric.unit,
      prediction,
      fe,
      comparable: true,
      withinTolerance,
      absoluteError: round(absoluteError, 3),
      relativeErrorPercent: round(relativeErrorPercent, 2),
      tolerance,
      toleranceMode: metric.toleranceMode
    };
  }

  function comparePredictionToFe(
    prediction = {},
    fe = {},
    tolerances = DEFAULT_TOLERANCES,
    limits = DEFAULT_LIMITS
  ) {
    const predictionEvaluation = evaluateResult(prediction, limits);
    const feEvaluation = evaluateResult(fe, limits);
    const metrics = METRICS.map((metric) => compareMetric(
      metric,
      prediction[metric.key],
      fe[metric.key],
      { ...DEFAULT_TOLERANCES, ...(tolerances || {}) }
    ));

    const classification = METRICS.map((metric) => {
      const predicted = predictionEvaluation.criteria[metric.key].status;
      const directFe = feEvaluation.criteria[metric.key].status;
      const comparable = predicted !== 'missing' && directFe !== 'missing';
      return {
        key: metric.key,
        predicted,
        fe: directFe,
        comparable,
        match: comparable ? predicted === directFe : null
      };
    });

    const comparableMetrics = metrics.filter((metric) => metric.comparable);
    const comparableClassifications = classification.filter((item) => item.comparable);
    const hasComparison = comparableMetrics.length > 0 || comparableClassifications.length > 0;
    const classificationMismatch = comparableClassifications.some((item) => item.match === false);
    const toleranceFailure = comparableMetrics.some((metric) => metric.withinTolerance === false);
    const requiredKeys = METRICS.map((metric) => metric.key);
    const complete = requiredKeys.every((key) => {
      const item = classification.find((entry) => entry.key === key);
      return Boolean(item?.comparable);
    });

    let verdict = 'not-ready';
    if (hasComparison && classificationMismatch) verdict = 'classification-mismatch';
    else if (hasComparison && toleranceFailure) verdict = 'outside-tolerance';
    else if (hasComparison && complete) verdict = 'verified';
    else if (hasComparison) verdict = 'partial';

    return {
      verdict,
      complete,
      hasComparison,
      predictionEvaluation,
      feEvaluation,
      metrics,
      classification,
      summary: {
        comparableNumericMetrics: comparableMetrics.length,
        comparableCriteria: comparableClassifications.length,
        classificationMismatch,
        toleranceFailure
      }
    };
  }

  function splitCsvLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    for (let index = 0; index < line.length; index += 1) {
      const character = line[index];
      if (character === '"') {
        if (inQuotes && line[index + 1] === '"') {
          current += '"';
          index += 1;
        } else inQuotes = !inQuotes;
      } else if (character === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else current += character;
    }
    values.push(current.trim());
    return values;
  }

  function parseCandidateCsv(text) {
    const lines = String(text ?? '')
      .replace(/^\uFEFF/, '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'));
    if (!lines.length) return { candidates: [], errors: ['The CSV file is empty.'] };

    const headers = splitCsvLine(lines[0]).map((header) => header.trim().toLowerCase());
    const aliases = {
      id: ['id', 'mount_id', 'mountid'],
      x: ['x', 'x_mm', 'x_norm'],
      y: ['y', 'y_mm', 'y_norm'],
      region: ['region', 'region_id', 'zone']
    };
    const indexes = {};
    for (const [key, names] of Object.entries(aliases)) indexes[key] = headers.findIndex((header) => names.includes(header));
    const missing = Object.entries(indexes).filter(([, index]) => index < 0).map(([key]) => key);
    if (missing.length) return {
      candidates: [],
      errors: [`Missing required column${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}`]
    };

    const candidates = [];
    const errors = [];
    const ids = new Set();
    for (let lineNumber = 1; lineNumber < lines.length; lineNumber += 1) {
      const cells = splitCsvLine(lines[lineNumber]);
      const id = normalizeMountId(cells[indexes.id]);
      const x = toFiniteNumber(cells[indexes.x]);
      const y = toFiniteNumber(cells[indexes.y]);
      const region = String(cells[indexes.region] ?? '').trim();
      const displayLine = lineNumber + 1;
      if (!id) errors.push(`Line ${displayLine}: invalid mount ID.`);
      if (x === null || y === null) errors.push(`Line ${displayLine}: x and y must be finite numbers.`);
      if (!region) errors.push(`Line ${displayLine}: region is required.`);
      if (id && ids.has(id)) errors.push(`Line ${displayLine}: duplicate mount ID ${id}.`);
      if (id && x !== null && y !== null && region && !ids.has(id)) {
        ids.add(id);
        candidates.push({ id, x, y, region });
      }
    }
    return { candidates, errors };
  }

  function normalizeResult(result = {}) {
    return {
      strainMicrostrain: toFiniteNumber(result.strainMicrostrain),
      firstModeHz: toFiniteNumber(result.firstModeHz),
      peakRatioPercent: toFiniteNumber(result.peakRatioPercent),
      dynamicCriterionPass: typeof result.dynamicCriterionPass === 'boolean' ? result.dynamicCriterionPass : null,
      source: result.source ? String(result.source) : null,
      note: result.note ? String(result.note) : null
    };
  }

  function createReport({
    selection = [],
    candidates = [],
    targetCount = null,
    prediction = {},
    fe = {},
    tolerances = DEFAULT_TOLERANCES,
    limits = DEFAULT_LIMITS,
    source = {},
    generatedAt = new Date().toISOString()
  } = {}) {
    const validation = validateSelection(selection, candidates, {
      targetCount: Number.isInteger(targetCount) ? targetCount : null,
      min: 2,
      max: 6,
      onePerRegion: true
    });
    const screening = screenLayout(validation.normalizedIds, candidates, {
      targetCount: Number.isInteger(targetCount) ? targetCount : null,
      min: 2,
      max: 6,
      onePerRegion: true
    });
    const normalizedPrediction = normalizeResult(prediction);
    const normalizedFe = normalizeResult(fe);
    const comparison = comparePredictionToFe(normalizedPrediction, normalizedFe, tolerances, limits);
    const selectedCandidates = validation.normalizedIds.map((id) => candidateMap(candidates).get(id)).filter(Boolean);

    return {
      schema: 'pcb-mount-verification-report/v1',
      appVersion: '2.0.0',
      generatedAt,
      dataScope: source.dataScope || 'user-supplied-or-schematic',
      provenance: {
        sourceName: source.sourceName || null,
        sourceUrl: source.sourceUrl || null,
        note: source.note || null
      },
      limits: { ...DEFAULT_LIMITS, ...(limits || {}) },
      tolerances: { ...DEFAULT_TOLERANCES, ...(tolerances || {}) },
      layout: {
        targetCount,
        mountIds: validation.normalizedIds,
        candidates: selectedCandidates.map(({ id, x, y, region }) => ({ id, x, y, region })),
        valid: validation.valid,
        validationErrors: validation.errors
      },
      geometricScreening: {
        scope: 'Geometry-only descriptor; not an FE prediction.',
        score: screening.geometryScore,
        grade: screening.grade,
        spreadAreaPercent: screening.spreadAreaPercent,
        centroidOffsetPercent: screening.centroidOffsetPercent,
        minSpacingPercent: screening.minSpacingPercent,
        quadrantCoverage: screening.quadrantCoverage,
        warnings: screening.warnings
      },
      prediction: normalizedPrediction,
      directFe: normalizedFe,
      comparison
    };
  }

  return Object.freeze({
    DEFAULT_LIMITS,
    DEFAULT_TOLERANCES,
    METRICS,
    normalizeMountId,
    validateSelection,
    convexHull,
    polygonArea,
    screenLayout,
    evaluateResult,
    comparePredictionToFe,
    parseCandidateCsv,
    createReport,
    normalizeResult,
    toFiniteNumber,
    round
  });
});
