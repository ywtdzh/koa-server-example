const pendingControllers = require('../../controller');
const {reply} = require('../../utils');
module.exports = function route(router) {
  function get(api, middleware) {
    router.get.call(router, `/api/user/${api}`.replace(/\/+/g, '/'), middleware);
  }

  function post(api, middleware) {
    router.post.call(router, `/api/user/${api}`.replace(/\/+/g, '/'), middleware);
  }

  post('login', async ctx => {
    const {username, password, identifier} = ctx.request.body;
    if (!username || !password) return reply(ctx, null, new Error('Username & password required'), 1);
    const {user: User} = await pendingControllers;
    const token = await User.login(username, password, identifier || '0');
    if (!token) reply(ctx, null, new Error('Authentication failed'), 100);
    else reply(ctx, {token});
  });

  post('logout', async ctx => {
    const {token, identifier} = ctx.request.header;
    if (token) {
      const {user: User} = await pendingControllers;
      await User.logout(token, identifier);
    }
    reply(ctx, null);
  });

  post('register', async ctx => {
    const {username, password, identifier, description} = ctx.request.body;
    if (!username || !password) return reply(ctx, null, new Error('Username & password required'), 1);
    const {user: User} = await pendingControllers;
    const user = await User.createUser({username, password, description});
    if (user === null) return reply(ctx, null, new Error('Username exist'), 101);
    const token = await User.login(username, password, identifier);
    if (!token) reply(ctx, null, new Error('Authentication failed'), 100);
    else reply(ctx, {token});
  });

  post('change_password', async ctx => {
    const {username, previous, expected} = ctx.request.body;
    const {user: User} = await pendingControllers;
    const user = await User.getUser({username});
    if (!user) return reply(ctx, null, Error('Wrong username or password'), 100);
    if (user.password === await User.hashPassword(username, previous)) {
      user.password = await User.hashPassword(username, expected);
      await user.save();
      reply(ctx);
    } else {
      reply(ctx, null, Error('Wrong username or password'), 100);
    }
  });

  get('hello', async ctx => {
    const {token, identifier} = ctx.request.header;
    if (token) {
      const {user: User} = await pendingControllers;
      const theUser = await User.getUserByToken(token, identifier || '0');
      if (theUser) return reply(ctx, {message: 'success'});
    }
    reply(ctx, null, new Error('Login status check failed'), 2);
  });
};