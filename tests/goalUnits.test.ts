import test from 'node:test';
import assert from 'node:assert/strict';
import { goalMinutes, goalAmount } from '../src/goalUnits';

test('daily minutes and monthly hours preserve existing minute totals', () => {
  assert.equal(goalMinutes('30', 'daily'), 30);
  assert.equal(goalMinutes('1,5', 'monthly'), 90);
  assert.equal(goalMinutes(String(31 / 60), 'monthly'), 31);
  assert.equal(goalAmount(90, 'monthly'), '1,5 h');
  assert.equal(goalAmount(30, 'daily'), '30 min');
});
test('rejects zero, invalid and excessive targets', () => {
  for (const value of ['', '0', '-1', 'NaN', '0,001']) assert.equal(goalMinutes(value, 'monthly'), null);
  assert.equal(goalMinutes('1,5', 'daily'), null);
  assert.equal(goalMinutes('1441', 'daily'), null);
  assert.equal(goalMinutes('745', 'monthly'), null);
});
