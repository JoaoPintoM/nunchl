'use strict';

module.exports = function(app) {
	var restaurants = require('../controllers/restaurants.server.controller');
	var categories = require('../controllers/categories.server.controller');
	var meals = require('../controllers/meals.server.controller');
	var restaurantsPolicy = require('../policies/restaurants.server.policy');


	// Restaurants Routes
	app.route('/api/restaurants').all()
		.get(restaurants.list).all(restaurantsPolicy.isAllowed)
		.post(restaurants.create);

	app.route('/api/restaurants/:restaurantId').all(restaurantsPolicy.isAllowed)
		.get(restaurants.read)
		.put(restaurants.update)
		.delete(restaurants.delete);

	//MENUS============||||||
	app.route('/api/restaurants/:restaurantId/menus').all(restaurantsPolicy.isAllowed)
		.get(restaurants.menuList)
		.post(restaurants.createMenu);
		// .delete(restaurants.deleteMenu);

	app.route('/api/restaurants/:restaurantId/menus/:menuId')
		.delete(restaurants.deleteMenu);

	app.route('/api/restaurants/:restaurantId/menus/:menuId/setactive').all(restaurantsPolicy.isAllowed)
		.get(restaurants.setActive);
	//MENUS============||||||


	//CATEGORIES============||||||
	app.route('/api/restaurants/:restaurantId/menus/:menuId/categories')
		 .get(categories.list)
		 .post(categories.create);

	app.route('/api/restaurants/:restaurantId/menus/:menuId/categories/:categoryId')
		 .get(categories.read)
		 .put(categories.update)
		 .delete(categories.delete);
	//CATEGORIES============||||||


	// Finish by binding the Restaurant middleware
	app.param('restaurantId', restaurants.restaurantByID);
};
