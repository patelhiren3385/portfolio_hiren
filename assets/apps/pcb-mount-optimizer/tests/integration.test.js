'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const model = require('../model.js');
require('../data.js');

const data = globalThis.PCB_MOUNT_APP_DATA;


test('published-layout workflow: select, validate, compare, and export', () => {
  const selected = [...data.references.selected.mountIds];
  const validation = model.validateSelection(selected, data.defaultCandidateSource.candidates, {
    targetCount: 4,
    onePerRegion: true
  });
  assert.equal(validation.valid, true);

  const prediction = {
    strainMicrostrain: 1510,
    firstModeHz: 812,
    peakRatioPercent: 4.2,
    source: 'Stage-2 reconstruction integration fixture'
  };
  const report = model.createReport({
    selection: selected,
    candidates: data.defaultCandidateSource.candidates,
    targetCount: 4,
    prediction,
    fe: data.references.selected.directFe,
    tolerances: data.tolerances,
    limits: data.limits,
    source: {
      sourceName: data.defaultCandidateSource.name,
      dataScope: data.defaultCandidateSource.dataScope,
      note: data.defaultCandidateSource.note
    },
    generatedAt: '2026-11-06T15:00:00.000Z'
  });

  assert.deepEqual(report.layout.mountIds, selected);
  assert.equal(report.layout.candidates.length, 4);
  assert.equal(report.prediction.source, prediction.source);
  assert.equal(report.directFe.source, data.references.selected.directFe.source);
  assert.equal(report.comparison.verdict, 'verified');
  assert.equal(report.comparison.complete, true);
  assert.equal(report.comparison.predictionEvaluation.overall, 'pass');
  assert.equal(report.comparison.feEvaluation.overall, 'pass');
});


test('same-count comparator workflow exposes the static-strain failure and incomplete dynamic evidence', () => {
  const comparison = model.comparePredictionToFe(
    { strainMicrostrain: 1500, firstModeHz: 900, peakRatioPercent: 4 },
    data.references.comparator.directFe,
    data.tolerances,
    data.limits
  );

  assert.equal(comparison.feEvaluation.criteria.strainMicrostrain.status, 'fail');
  assert.equal(comparison.feEvaluation.overall, 'fail');
  assert.equal(comparison.verdict, 'classification-mismatch');
  assert.equal(comparison.complete, false);
});


test('imported physical candidate coordinates remain usable in the same report pipeline', () => {
  const csv = [
    'id,x_mm,y_mm,region',
    'G101,0,0,A',
    'G102,80,0,B',
    'G103,0,80,C',
    'G104,80,80,D'
  ].join('\n');
  const parsed = model.parseCandidateCsv(csv);
  assert.deepEqual(parsed.errors, []);

  const report = model.createReport({
    selection: ['G101', 'G102', 'G103', 'G104'],
    candidates: parsed.candidates,
    targetCount: 4,
    prediction: {},
    fe: {},
    generatedAt: '2026-11-06T15:00:00.000Z',
    source: { sourceName: 'physical.csv', dataScope: 'imported-project-coordinates' }
  });

  assert.equal(report.layout.valid, true);
  assert.equal(report.layout.candidates[3].x, 80);
  assert.equal(report.dataScope, 'imported-project-coordinates');
  assert.equal(report.comparison.verdict, 'not-ready');
});
