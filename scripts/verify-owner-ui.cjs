// Presentation regressions. No network or database calls.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const Module = require('node:module');
const path = require('node:path');

function loadTS(filename) {
  const fullPath = path.resolve(filename);
  const code = ts.transpileModule(fs.readFileSync(fullPath, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = new Module(fullPath, module);
  mod.filename = fullPath;
  mod.paths = Module._nodeModulePaths(path.dirname(fullPath));
  mod._compile(code, fullPath);
  return mod.exports;
}
const ui = loadTS('lib/owner-ui.ts');
const { ownerEn, ownerHi } = loadTS('lib/locales/owner.ts');
assert.deepEqual(Object.keys(ownerEn).sort(), Object.keys(ownerHi).sort());
for (const value of Object.values(ownerHi)) assert(value.trim());
assert.equal(ui.money(125000), '₹1,25,000');
assert.equal(ui.daysLeft('2026-10-30', new Date(2026, 9, 26, 22)), 4);
assert.equal(ui.daysLeft('2026-10-26', new Date(2026, 9, 26, 22)), 0);
assert.equal(ui.daysLeft('bad-date'), null);
assert.equal(ui.shortDate('2026-10-30'), '30 Oct');
assert.equal(ui.noticeTone({ status: 'closed', deadline: '2000-01-01' }), 'closed');
assert.equal(ui.noticeTone({ status: 'filed', deadline: '2000-01-01' }), 'fine');
assert.equal(ui.noticeTone({ status: 'open', deadline: '2000-01-01' }), 'overdue');
assert.equal(ui.noticeTone({ status: 'open', deadline: null }), 'neutral');
assert.equal(ui.noticeGroup({ status: 'closed' }), 'closed');
assert.equal(ui.noticeGroup({ status: 'filed' }), 'withCA');
assert.equal(ui.noticeGroup({ status: 'open' }), 'needsAction');
assert.deepEqual(ui.nearestFirst([{ id: 'none' }, { id: 'later', deadline: '2026-10-30' }, { id: 'first', deadline: '2026-10-20' }]).map(n => n.id), ['first', 'later', 'none']);
// Preserve every existing financial expression verbatim, with only the input scope changed.
const oldCost = fs.readFileSync('components/DynamicPenaltyDesk.tsx', 'utf8');
const newCost = fs.readFileSync('components/owner/OwnerCost.tsx', 'utf8');
const calculations = oldCost.slice(oldCost.indexOf('  const today ='), oldCost.indexOf('  return ('));
assert(newCost.includes(calculations), 'Financial calculations must stay unchanged');
assert(newCost.includes('const notices = [notice]'), 'Cost estimates must use one notice');
assert(!fs.readFileSync('components/owner/OwnerPages.tsx','utf8').includes('OwnerCost'), 'No business-wide cost simulator');
console.log('PASS: owner translations, Indian formatting, deadline boundaries, closed-state priority, filters, sorting and unchanged notice-only calculations');
