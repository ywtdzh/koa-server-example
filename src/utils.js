const fs = require('fs'), path = require('path'), crypto = require('crypto');
const {promisify} = require('util');

const config = require('../config');

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

function reply(ctx, data, error = null, status = 0) {
  ctx.body = {
    status, error: error ? error.toString() : null, data: error ? {
      message: error.message,
      trace: error.stack,
    } : data,
  };
}

// function customPromisify(func) {
//   if (typeof func !== "function") {
//     throw new TypeError("expecting a function but got " + typeof func);
//   }
//   return function (...args) {
//     return new Promise((resolve, reject) => {
//       func.call(this, ...args, (err, result) => {
//         if (err) reject(err);
//         else resolve(result);
//       });
//     });
//   };
// }

module.exports = {
  autoImport,
  redisClient,
  secretHash,
  reply,
};