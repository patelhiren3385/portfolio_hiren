'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');


test('every static DOM ID referenced by app.js exists exactly once in index.html', () => {
  const referenced = [...app.matchAll(/byId\('([^']+)'\)/g)].map((match) => match[1]);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const counts = new Map(ids.map((id) => [id, ids.filter((candidate) => candidate === id).length]));

  assert.equal(new Set(ids).size, ids.length, 'index.html contains duplicate IDs');
  for (const id of new Set(referenced)) {
    assert.equal(counts.get(id), 1, `Expected exactly one #${id} element`);
  }
});


test('runtime scripts load in dependency order and local app files exist', () => {
  const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(scripts, ['model.js', 'data.js', 'app.js']);
  for (const file of [...scripts, 'style.css', 'package.json']) {
    assert.equal(fs.existsSync(path.join(root, file)), true, `${file} is missing`);
  }
});


test('critical interaction controls have explicit button types', () => {
  const criticalIds = [
    'add-mount', 'load-selected-layout', 'clear-selection', 'import-candidates',
    'download-template', 'export-solver-request', 'copy-mount-ids',
    'import-prediction', 'import-fe', 'export-report', 'reset-results'
  ];
  for (const id of criticalIds) {
    const expression = new RegExp(`<button[^>]*id="${id}"[^>]*type="button"|<button[^>]*type="button"[^>]*id="${id}"`);
    assert.match(html, expression, `#${id} must be type=button`);
  }
});
