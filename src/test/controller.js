const assert = require('assert');
const pendingControllers = require('../controller');

describe('Controller module', function () {
  let controllers;
  before(async function () {
    controllers = await pendingControllers;
  });
  it('User controller exists', async function () {
    assert.ok(controllers.User);
  });
  describe('User', function () {
    let token, User;
    const
      username = Math.random().toString(36).substr(2),
      password = Math.random().toString(36).substr(2),
      description = Math.random().toString(36).substr(2),
      deviceIdentifier = Math.random().toString(36).substr(2);
    before(async function () {
      User = controllers.User;
    });
    it('Create user', async function () {
      const theUser = await User.createUser({username, password, description});
      assert.strictEqual(theUser && theUser.description, description);
    });
    it('Validate user', async function () {
      const {status, theUser} = await User.validateUser(username, password);
      assert.ok(status);
      assert.strictEqual(theUser.description, description);
    });
    it('Login', async function () {
      token = await User.login(username, password, deviceIdentifier);
      assert.ok(token);
      const theUser = await User.getUserByToken(token, deviceIdentifier);
      assert.strictEqual(theUser && theUser.description, description);
    });
    it('Logout', async function () {
      await User.logout(token, deviceIdentifier);
      assert.strictEqual(await User.getUserByToken(token, deviceIdentifier), null);
    });
    after(async function () {
      const user = await User.getUser({username});
      user && await user.destroy();
    });
  });
});
