const pendingModel = require('../src/models');

pendingModel.then(model => {
  model.database.sync({force: (process.argv[2] || '').includes('-f')}).then(() => process.exit(0));
});