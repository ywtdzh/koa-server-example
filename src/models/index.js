const Sequelize = require('sequelize');
const path = require('path');

const config = require('../../config');
const utils = require('../utils');

const database = new Sequelize(config.database);
const pendingModels = utils.autoImport(__dirname, {excludedPath: [__filename]}).then(tableDefinitions => {
  tableDefinitions.forEach(tableDefinition => tableDefinition(database));
  return Object.assign({database}, database.models);
});
module.exports = pendingModels;
