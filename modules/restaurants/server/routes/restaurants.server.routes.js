'use strict';

module.exports = function(app) {
	var restaurants = require('../controllers/restaurants.server.controller');
	var restaurantsPolicy = require('../policies/restaurants.server.policy');

	// Restaurants Routes
	app.route('/api/restaurants').all()
		.get(restaurants.list).all(restaurantsPolicy.isAllowed)
		.post(restaurants.create);

	app.route('/api/restaurants/:restaurantId').all(restaurantsPolicy.isAllowed)
		.get(restaurants.read)
		.put(restaurants.update)
		.delete(restaurants.delete);

	// Finish by binding the Restaurant middleware
	app.param('restaurantId', restaurants.restaurantByID);
};