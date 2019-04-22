const assert = require('assert');
const axios = require('axios');
const pendingControllers = require('../controller');
const url = 'http://127.0.0.1:8000', userApi = (api) => url + `/api/user/${api}`;

describe('Api test', function () {
  let token, userId;
  const
    username = Math.random().toString(36).substr(2),
    password = Math.random().toString(36).substr(2),
    description = Math.random().toString(36).substr(2),
    identifier = Math.random().toString(36).substr(2);
  describe('User api', function () {
    it('Create user', async function () {
      const response = (await axios.post(userApi('register'), {
        username, password: 'previous', description, identifier,
      })).data;
      assert.strictEqual(response.status, 0);
      assert.ok(response.data);
      token = response.data.token;
      userId = response.data.userId;
      assert.ok(token);
    });
    it('Logout', async function () {
      let loginResponse = (await axios.get(userApi('hello'), {
        headers: {token, identifier},
      })).data;
      assert.strictEqual(loginResponse.status, 0);
      loginResponse = (await axios.get(userApi('hello'), {
        headers: {token, identifier: identifier + 'a'},
      })).data;
      assert.strictEqual(loginResponse.status, 2);
      await axios.post(userApi('logout'), {}, {
        headers: {token, identifier},
      });
      loginResponse = (await axios.get(userApi('hello'), {
        headers: {token, identifier},
      })).data;
      assert.strictEqual(loginResponse.status, 2);
    });
    it('Change password', async function () {
      const {data: response} = await axios.post(userApi('change_password'), {
        username, previous: 'previous', expected: password,
      });
      assert.strictEqual(response.status, 0);
    });
    it('login', async function () {
      const loginResponse = (await axios.post(userApi('login'), {username, password, identifier})).data;
      token = loginResponse && loginResponse.data && loginResponse.data.token;
      assert.ok(token);
      const checkResponse = (await axios.get(userApi('hello'), {
        headers: {token, identifier},
      })).data;
      assert.strictEqual(checkResponse.status, 0);
    });
  });
});