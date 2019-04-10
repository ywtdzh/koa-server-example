const Koa = require('koa');
const BodyParser = require('koa-bodyparser');
const Static = require('koa-static');
const Cors = require('koa-cors');
const convert = require('koa-convert');

const router = require('../src/router');
const config = require('../config');
const {reply} = require('../src/utils');

const app = new Koa;

app.use(async (context, next) => {
  try {
    await next();
  } catch (e) {
    reply(context, e, null, -1);
  }
});
app.use(convert(Cors({
  origin: config.corsOrigin,
})));
app.keys = config.sessionKeys;
app.use(BodyParser());
app.use(Static(config.staticOpt.dir || './public', config.staticOpt));
app.use(router.routes()).use(router.allowedMethods());

app.listen(config.port);
module.exports = app;