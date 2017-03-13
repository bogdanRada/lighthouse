
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

    analytics.authClient.then(data => {
      assert.ok(data.constructor.name === 'JWT');
      assert.equal(data.scopes[0], 'https://www.googleapis.com/auth/spreadsheets');
    });
  });
});
