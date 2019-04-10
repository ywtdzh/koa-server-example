const {redisClient} = require('../utils');
const assert = require('assert');

describe('Redis Module', function () {
  const key = Math.random().toString(36).substr(2),
    value = Math.random().toString(36).substr(2),
    field = Math.random().toString(36).substr(2);
  it('Redis set', async function () {
    await redisClient.set(key, value);
    await redisClient.hashSet(key + key, field, value + value);
  });
  it('Redis get', async function () {
    assert.strictEqual(await redisClient.get(key), value);
    assert.strictEqual(await redisClient.hashGet(key + key, field), value + value);
  });
  it('Redis expire', async function () {
    await redisClient.expire(key, 0);
    await redisClient.expire(key + key, 0);
    assert.strictEqual(await redisClient.get(key), null);
    assert.strictEqual(await redisClient.hashGet(key + key, field), null);
  });
});