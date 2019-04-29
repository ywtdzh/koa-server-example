const pendingModels = require('../models');
const assert = require('assert');

describe('Database module', function () {
  let models;
  before(async function () {
    models = await pendingModels;
  });
  it('Model User exists', async function () {
    assert.ok(models.User);
  });
});