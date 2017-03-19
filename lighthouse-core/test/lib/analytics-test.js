
'use strict';

const Analytics = require('../../lib/analytics');
const assert = require('assert');

/* global describe, it, beforeEach */
describe('Analytics', () => {
  let analytics;

  beforeEach(() => {
    analytics = new Analytics();
  });

  it('can authenticate', () => {
    assert.notEqual(process.env.GOOGLE_APPLICATION_CREDENTIALS, '');

    analytics.authClient().then(data => {
      assert.ok(data.constructor.name === 'JWT');
      assert.equal(data.scopes[0], 'https://www.googleapis.com/auth/spreadsheets');
    });
  });

  it('calculates ranges', () => {
    const range1 = Analytics.calculateRange([Array(1).fill('')]);
    const range2 = Analytics.calculateRange([Array(20).fill('')]);
    const range3 = Analytics.calculateRange([Array(30).fill('')]);
    const range4 = Analytics.calculateRange([Array(60).fill('')]);

    assert.equal(range1, 'A1:A1');
    assert.equal(range2, 'A1:T1');
    assert.equal(range3, 'A1:AD1');
    assert.equal(range4, 'A1:BH1');
  });
});
