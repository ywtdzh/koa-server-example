const pendingModel = require('../src/models');

pendingModel.then(model => {
  model.database.sync({force: (process.argv[2] || '').includes('-f')})
    .then(() => {
      return model.user.findOrCreate({
        where: {username: 'root'},
        defaults: {password: 'default', description: 'Administrator of the application'},
      });
    })
    .then(() => process.exit(0));
});