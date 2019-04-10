const types = require('sequelize');
module.exports = sequelize => {
  return sequelize.define('user', {
    username: {type: types.STRING, unique: true},
    password: {type: types.STRING, validate: {len: [6, 255]}},
    description: {type: types.STRING, defaultValue: ''},
  });
};