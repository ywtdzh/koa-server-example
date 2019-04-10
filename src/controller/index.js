const path = require('path');
const utils = require('../utils.js');

const pendingController = utils.autoImport(__dirname, {excludedPath: [__filename]}).then(controllers => {
  return controllers.reduce((accumulator, currentController, currentIndex) => {
    if (currentController && currentController.name) {
      accumulator[currentController.name] = currentController;
    } else {
      accumulator['_controller_' + currentIndex] = currentController;
    }
    return accumulator;
  }, {});
});

module.exports = pendingController;