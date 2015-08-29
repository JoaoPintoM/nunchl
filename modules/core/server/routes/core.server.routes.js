'use strict';

module.exports = function (app) {
  // Root routing
  var core = require('../controllers/core.server.controller');
  // var uploads = require('../../../uploads/server/controllers/uploads.server.controller');
  //
  //
  // //uploads..
  //
  // app.route('/file-upload/resize/restaurants').post(uploads.restaurants);
  // app.route('/file-upload/resize/meals').post(uploads.meals);
  // app.route('/file-upload/resize/categories').post(uploads.categories);
  // app.route('/file-upload').post(uploads.root);


  // Define error pages
  app.route('/server-error').get(core.renderServerError);

  // Return a 404 for all undefined api, module or lib routes
  app.route('/:url(api|modules|lib)/*').get(core.renderNotFound);

  // Define application route
  app.route('/*').get(core.renderIndex);
};
