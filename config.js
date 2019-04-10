const config = {
  protocol: 'http',
  host: '127.0.0.1',
  port: 8000,
  corsOrigin: true,
  sessionKeys: ['asd5e4a3Sd58s_d'],
  database: {
    host: '127.0.0.1',
    port: 5432,
    dialect: 'postgres',
    database: 'example',
    username: 'default_user',
    password: 'default_password',
    logging: false,
    key: '7f2ynuse76e', // random key for hash
    salt: (identifier) => new Promise(resolve => {
      const charCode = Array.prototype.reduce.call(identifier.toString(), (accumulator, current) => {
        return accumulator * 10 + current.charCodeAt(0);
      }, 0);
      let salt = require('crypto').createHash('sha1').update(parseInt(charCode).toString(36)).digest('hex');
      resolve(salt);
    }), // String or Function(identifier) -> Promise[String]
  },
  staticOpt: {
    dir: './public',
    maxage: 60000 * 60 * 24,
  },
};

module.exports = config;