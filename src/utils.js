const fs = require('fs'), path = require('path'), crypto = require('crypto');
const {promisify} = require('util');

String.prototype.mix = function (str) {
  const [shorter, longer] = [this, str.toString()].sort((a, b) => a.length - b.length);
  return Array.from(longer).reduce((previousValue, currentValue, currentIndex) => {
    return previousValue + currentValue + (shorter[currentIndex] || '');
  }, '');
};

function autoImport(pathLike, {excludedName, excludedPath}) {
  return new Promise((resolve, reject) => {
    if (!path.isAbsolute(pathLike)) {
      return reject(new Error('pathLike must be absolute path'));
    }
    fs.readdir(pathLike, (err, files) => {
      if (err) reject(err);
      const modules = [];
      Promise.all(files.map(fileName => {
        return new Promise((resolve1, reject1) => {
          const filePath = path.join(pathLike, fileName);
          if ([].concat(excludedName).includes(fileName) || [].concat(excludedPath).includes(filePath)) {
            return resolve1(null);
          }
          fs.stat(filePath, (err1, stats) => {
            if (err1) reject1(err1);
            if (stats.isFile() && /\.m?js$/.test(fileName))
              resolve1(modules.push(require(filePath)));
            else if (stats.isDirectory())
              autoImport(filePath, {excludedName, excludedPath}).then(list => {
                resolve1(modules.push(...list));
              });
            else resolve1(null);
          });
        });
      })).then(() => {
        resolve(modules);
      });
    });
  });
}

crypto.scryptAsync = crypto.scryptAsync || promisify(crypto.scrypt);

async function secretHash(data, salt) {
  const cipher = crypto.createHash('sha1');
  cipher.update(data.mix(salt));
  return cipher.digest('hex');
}

const client = require('redis').createClient();
const redisClient = {
  get: promisify(client.get).bind(client),
  hashGet: promisify(client.hget).bind(client),
  set: promisify(client.set).bind(client),
  hashSet: promisify(client.hset).bind(client),
  expire: promisify(client.expire).bind(client),
};

const {ErrorWithStatus, reply} = (function () {
  const statusDescMap = {
    [-1]: 'Unknown server error',
    [1]: 'Necessary parameter required',
    [2]: 'Login required',
    [3]: 'Unique constraint is violated',
    [4]: 'Specified object doesn\'t exist',
    [100]: 'Authentication Failed',
    [101]: 'Username has existed',
  }, statusKey = Symbol('status');

  function reply(ctx, data = null, error = null) {
    const status = error && error.getErrorStatus() || 0;
    if (status === -1) console.error(error.stack);
    ctx.body = {
      status, error: error ? error.toString() : null,
      data: error ? {
        message: statusDescMap[status] + error.message ? `: ${error.message}` : '',
        trace: error.stack,
      } : data,
    };
  }

  const prototype = Object.assign(
    Object.create(Error.prototype),
    {
      constructor: ErrorWithStatus,
      getErrorStatus() {
        return this[statusKey];
      },
    },
  );

  function ErrorWithStatus(message = '', status = -1) {
    const error = new Error(message);
    error.name = 'ErrorWithStatus';
    error[statusKey] = status;
    Error.captureStackTrace(error, ErrorWithStatus);
    Object.setPrototypeOf(error, prototype);
    return error;
  }

  Error.prototype.getErrorStatus = () => -1;

  return {ErrorWithStatus, reply};
})();

async function requireLogin(ctx, controllers) {
  const {token, identifier} = ctx.request.header;
  if (token) {
    const {User} = controllers;
    const user = await User.getUserByToken(token, identifier);
    if (user) return user;
  }
  throw new ErrorWithStatus('', 2);
}

module.exports = {
  autoImport,
  redisClient,
  secretHash,
  reply,
  ErrorWithStatus,
  requireLogin,
};