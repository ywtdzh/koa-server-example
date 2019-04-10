const assert = require('assert');
const axios = require('axios');
const pendingControllers = require('../controller');
const url = 'http://127.0.0.1:8000', user = (api) => url + `/api/user/${api}`;

describe('Api test', function () {
  describe('User api', function () {
    const
      username = Math.random().toString(36).substr(2),
      password = Math.random().toString(36).substr(2),
      description = Math.random().toString(36).substr(2),
      identifier = Math.random().toString(36).substr(2);
    let token;
    it('Create user', async function () {
      const response = (await axios.post(user('register'), {
        username, password, description, identifier,
      })).data;
      assert.strictEqual(response.status, 0);
      assert.ok(response.data);
      token = response.data.token;
      assert.ok(token);
    });
    it('Logout', async function () {
      let loginResponse = (await axios.get(user('hello'), {
        headers: {token, identifier},
      })).data;
      assert.strictEqual(loginResponse.status, 0);
      loginResponse = (await axios.get(user('hello'), {
        headers: {token, identifier: identifier + 'a'},
      })).data;
      assert.strictEqual(loginResponse.status, 102);
      await axios.get(user('logout'), {
        headers: {token, identifier},
      });
      loginResponse = (await axios.get(user('hello'), {
        headers: {token, identifier},
      })).data;
      assert.strictEqual(loginResponse.status, 102);
    });
    it('login', async function () {
      const loginResponse = (await axios.post(user('login'), {username, password, identifier})).data;
      token = loginResponse && loginResponse.data && loginResponse.data.token;
      assert.ok(token);
      const checkResponse = (await axios.get(user('hello'), {
        headers: {token, identifier},
      })).data;
      assert.strictEqual(checkResponse.status, 0);
    });
    after(async function () {
      const {user: User} = await pendingControllers;
      await User.dropUser({username});
    });
  });
});