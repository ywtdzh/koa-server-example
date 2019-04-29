const {reply, ErrorWithStatus, requireLogin} = require('../../utils');
module.exports = function route(router, controllers) {
  function get(api, middleware) {
    router.get.call(router, `/api/user/${api}`.replace(/\/+/g, '/'), middleware);
  }

  function post(api, middleware) {
    router.post.call(router, `/api/user/${api}`.replace(/\/+/g, '/'), middleware);
  }

  post('login', async ctx => {
    const {username, password, identifier} = ctx.request.body;
    if (!username || !password) throw ErrorWithStatus('username & password', 1);
    const {User} = controllers;
    const token = await User.login(username, password, identifier || '0');
    if (!token) throw ErrorWithStatus('', 100);
    else reply(ctx, {token});
  });

  post('logout', async ctx => {
    const {token, identifier} = ctx.request.header;
    if (token) {
      const {User} = controllers;
      await User.logout(token, identifier);
    }
    reply(ctx);
  });

  post('register', async ctx => {
    const {username, password, identifier, description} = ctx.request.body;
    if (!username || !password) throw new ErrorWithStatus('username & password', 1);
    const {User} = controllers;
    const user = await User.createUser({username, password, description});
    if (user === null) throw new ErrorWithStatus('username', 3);
    const token = await User.login(username, password, identifier);
    if (!token) throw new ErrorWithStatus('', 100);
    else reply(ctx, {token, userId: user.id});
  });

  post('change_password', async ctx => {
    const {username, previous, expected} = ctx.request.body;
    const {User} = controllers;
    const user = await User.getUser({username});
    if (!user) throw new ErrorWithStatus('', 100);
    if (user.password === await User.hashPassword(username, previous)) {
      user.password = await User.hashPassword(username, expected);
      await user.save();
      reply(ctx);
    } else {
      throw new ErrorWithStatus('', 100);
    }
  });

  get('hello', async ctx => {
    await requireLogin(ctx, controllers);
    reply(ctx, {message: 'success'});
  });
};