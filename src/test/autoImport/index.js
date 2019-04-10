const path = require('path');
const {autoImport: index} = require('../../utils');
const assert = require('assert');

describe('Auto Import Function', function () {
  it('import other module', async function () {
    const list = await index(path.resolve(__dirname, '.'), {
      // excludedName: ['node_modules', '1.js'],
      excludedPath: [__filename],
    });
    assert.strictEqual(JSON.stringify(list), '[{"data":3},{"data":1},{"data":2}]');
  });
});

