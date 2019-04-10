const Router = require('koa-router'), path = require('path');
const {autoImport} = require('../utils');
const router = new Router;

autoImport(path.resolve(__dirname), {excludedPath: [__filename]}).then(routes => {
  routes.forEach(route => {
    route(router);
  });
});

module.exports = router;