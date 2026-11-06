'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const model = require('../model.js');
require('../data.js');

const data = globalThis.PCB_MOUNT_APP_DATA;
const candidates = data.defaultCandidateSource.candidates;


test('normalizes mount IDs without accepting malformed values', () => {
  assert.equal(model.normalizeMountId('g37'), 'G037');
  assert.equal(model.normalizeMountId(' 006 '), 'G006');
  assert.equal(model.normalizeMountId('G000'), null);
  assert.equal(model.normalizeMountId('mount-6'), null);
});


test('accepts the published selected layout under exact-count and region rules', () => {
  const validation = model.validateSelection(data.references.selected.mountIds, candidates, {
    min: 2,
    max: 6,
    targetCount: 4,
    onePerRegion: true
  });
  assert.equal(validation.valid, true);
  assert.deepEqual(validation.normalizedIds, ['G006', 'G037', 'G047', 'G052']);
  assert.equal(validation.regions.length, 4);
});


test('rejects duplicate IDs, same-region selections, and wrong target count', () => {
  const validation = model.validateSelection(['G005', 'G006', 'G006'], candidates, {
    targetCount: 4,
    onePerRegion: true
  });
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.some((error) => error.code === 'duplicate-id'));
  assert.ok(validation.errors.some((error) => error.code === 'region-conflict'));
  assert.ok(validation.errors.some((error) => error.code === 'target-count-mismatch'));
});


test('geometric screening remains explicitly geometry-only', () => {
  const screening = model.screenLayout(data.references.selected.mountIds, candidates, {
    targetCount: 4,
    onePerRegion: true
  });
  assert.equal(screening.geometryOnly, true);
  assert.equal(screening.valid, true);
  assert.ok(screening.geometryScore >= 0 && screening.geometryScore <= 100);
  assert.equal(typeof screening.spreadAreaPercent, 'number');
  assert.equal(typeof screening.minSpacingPercent, 'number');
});


test('evaluates source-status dynamic acceptance without inventing a numeric ratio', () => {
  const evaluation = model.evaluateResult(data.references.selected.directFe, data.limits);
  assert.equal(evaluation.overall, 'pass');
  assert.equal(evaluation.criteria.strainMicrostrain.status, 'pass');
  assert.equal(evaluation.criteria.firstModeHz.status, 'pass');
  assert.equal(evaluation.criteria.peakRatioPercent.status, 'pass');
  assert.equal(evaluation.criteria.peakRatioPercent.value, null);
  assert.equal(evaluation.criteria.peakRatioPercent.source, 'status-only');
});


test('marks a complete, within-tolerance model-to-FE comparison as verified', () => {
  const prediction = {
    strainMicrostrain: 1480,
    firstModeHz: 820,
    peakRatioPercent: 3.5
  };
  const comparison = model.comparePredictionToFe(
    prediction,
    data.references.selected.directFe,
    data.tolerances,
    data.limits
  );
  assert.equal(comparison.complete, true);
  assert.equal(comparison.verdict, 'verified');
  assert.equal(comparison.summary.classificationMismatch, false);
  assert.equal(comparison.summary.toleranceFailure, false);
});


test('prioritizes engineering classification mismatch over numerical tolerance', () => {
  const prediction = {
    strainMicrostrain: 1480,
    firstModeHz: 790,
    peakRatioPercent: 3.5
  };
  const comparison = model.comparePredictionToFe(
    prediction,
    data.references.selected.directFe,
    data.tolerances,
    data.limits
  );
  assert.equal(comparison.verdict, 'classification-mismatch');
  assert.ok(comparison.classification.some((item) => item.key === 'firstModeHz' && item.match === false));
});


test('detects outside-tolerance values even when both methods pass the design limit', () => {
  const prediction = {
    strainMicrostrain: 1000,
    firstModeHz: 820,
    peakRatioPercent: 3.5
  };
  const comparison = model.comparePredictionToFe(
    prediction,
    data.references.selected.directFe,
    data.tolerances,
    data.limits
  );
  assert.equal(comparison.verdict, 'outside-tolerance');
  const strain = comparison.metrics.find((metric) => metric.key === 'strainMicrostrain');
  assert.equal(strain.withinTolerance, false);
});


test('parses candidate CSV with required columns and catches duplicate IDs', () => {
  const valid = model.parseCandidateCsv('id,x,y,region\nG001,1.2,3.4,R1\ng2,5.6,7.8,R2\n');
  assert.deepEqual(valid.errors, []);
  assert.deepEqual(valid.candidates[1], { id: 'G002', x: 5.6, y: 7.8, region: 'R2' });

  const invalid = model.parseCandidateCsv('id,x,y,region\nG001,1,2,R1\nG001,3,4,R2\n');
  assert.ok(invalid.errors.some((error) => error.includes('duplicate mount ID G001')));
});


test('report preserves provenance and labels geometric screening correctly', () => {
  const report = model.createReport({
    selection: data.references.selected.mountIds,
    candidates,
    targetCount: 4,
    prediction: { strainMicrostrain: 1480, firstModeHz: 820, peakRatioPercent: 3.5, source: 'unit-test-model' },
    fe: data.references.selected.directFe,
    tolerances: data.tolerances,
    limits: data.limits,
    source: { sourceName: 'test candidate set', dataScope: 'test', note: 'fixture' },
    generatedAt: '2026-11-06T12:00:00.000Z'
  });
  assert.equal(report.schema, 'pcb-mount-verification-report/v1');
  assert.equal(report.generatedAt, '2026-11-06T12:00:00.000Z');
  assert.equal(report.layout.valid, true);
  assert.equal(report.geometricScreening.scope, 'Geometry-only descriptor; not an FE prediction.');
  assert.equal(report.comparison.verdict, 'verified');
  assert.equal(report.provenance.sourceName, 'test candidate set');
});
