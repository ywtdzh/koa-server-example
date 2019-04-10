const utils = require('../utils');
const assert = require('assert');

describe('Hash module', function () {
  it('Hashed data is exact', async function () {
    const data = Math.random().toString(36).substring(2),
      salt = Math.random().toString(36).substring(2),
      computed = await utils.secretHash(data, salt),
      computedAgain = await utils.secretHash(data, salt);
    assert.notStrictEqual(data, computed);
    assert.strictEqual(computed, computedAgain);
  });
});
