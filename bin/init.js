const pendingModels = require('../src/models'),
  pendingControllers = require('../src/controllers');

Promise.all([pendingControllers, pendingModels])
  .then(([controller, model]) => {
    return model.database.sync({force: (process.argv[2] || '').includes('-f')})
      .then(() => {
        return controller.user.createUser({
          username: 'root',
          password: 'default',
          description: 'Administrator of the application',
        });
      })
      .then(() => process.exit(0));
  });