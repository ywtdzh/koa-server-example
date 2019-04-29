const Router = require('koa-router'), path = require('path');
const pendingControllers = require('../controller');
const {autoImport} = require('../utils');
const router = new Router;

Promise.all([
  pendingControllers,
  autoImport(path.resolve(__dirname), {excludedPath: [__filename]}),
]).then(([controllers, routes]) => {
  routes.forEach(route => {
    route(router, controllers);
  });
});

module.exports = router;