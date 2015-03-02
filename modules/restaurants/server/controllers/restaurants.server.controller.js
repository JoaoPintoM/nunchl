'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),
	mongoose = require('mongoose'),
	Restaurant = mongoose.model('Restaurant'),
	User = mongoose.model('User'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a Restaurant
 */
// exports.create = function(req, res) {
// 	var restaurant = new Restaurant(req.body);
// 	restaurant.user = req.user;
// 	restaurant.users.push(req.user);
//
// 	restaurant.save(function(err) {
// 		if (err) {
// 			return res.status(400).send({
// 				message: errorHandler.getErrorMessage(err)
// 			});
// 		} else {
// 			res.jsonp(restaurant);
// 		}
// 	});
// };

exports.create = function(req, res) {
	console.log('OI TO ERASE CREATE RESTAURANIZOR');
	var restaurant = new Restaurant(req.body);
	restaurant.users.push(req.user);
	restaurant.user = req.user;

	restaurant.menus.push({
		name: 'first menu',
		active: true,
		categories: []
	});

	// console.log(restaurant.menus);

	restaurant.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {

			User.findById(req.user._id)
				.select('restaurants restaurateur')
				.exec(function(err, user){

				if (err)
					return errorHandler.dealWithError500(err, 'restaurants.create 2', res);

				if (!user)
					return res.status(404).send({message: 'user Not found'});

				user.restaurants.push({restaurant:restaurant, role:10});
				user.restaurateur = true;

				user.save(function(err){

					if (err)
						return errorHandler.dealWithError500(err, 'restaurants.create 3', res);

					res.jsonp(restaurant);
				});
			});
		}
	});
};

/**
 * Show the current Restaurant
 */
exports.read = function(req, res) {
	res.jsonp(req.restaurant);
};

/**
 * Update a Restaurant
 */
exports.update = function(req, res) {
	var restaurant = req.restaurant ;

	restaurant = _.extend(restaurant , req.body);

	restaurant.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(restaurant);
		}
	});
};

/**
 * Delete an Restaurant
 */
exports.delete = function(req, res) {
	var restaurant = req.restaurant ;

	restaurant.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(restaurant);
		}
	});
};

/**
 * List of Restaurants
 */
exports.list = function(req, res) { Restaurant.find().sort('-created').populate('user', 'displayName').exec(function(err, restaurants) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(restaurants);
		}
	});
};

/**
 * Restaurant middleware
 */
exports.restaurantByID = function(req, res, next, id) { Restaurant.findById(id).populate('user', 'displayName').exec(function(err, restaurant) {
		if (err) return next(err);
		if (! restaurant) return next(new Error('Failed to load Restaurant ' + id));
		req.restaurant = restaurant ;
		next();
	});
};



/*$$$$$$$$$$$*** MENUS $$$$$$$$$$***/

exports.menuList = function (req, res){
	Restaurant.findById(req.param('restaurantId')).exec(function(err, restaurant){
		if (err)
			return errorHandler.dealWithError500(err, 'menus.list 1', res);

		if (!restaurant)
			return res.status(404).send({message: 'Not found'});

		if(restaurant){
			return res.jsonp(restaurant.menus);
		}
	});
};

// Create a new menu for the restaurant specified in the url
// add only the menu to the menus list
exports.createMenu = function (req, res){

	Restaurant.findById(req.param('restaurantId'))
		.exec(function(err, restaurant) {

		if (err)
			return errorHandler.dealWithError500(err, 'menus.create 1', res);

		if (!restaurant)
			return res.status(404).send({message: 'Not found'});

			restaurant.menus.push({
				name: req.body.name,
				categories: []
			});

			restaurant.save(function (err){
				if (err) {
					return res.status(500).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					// we return the last element (new one)
					return res.jsonp(restaurant.menus[restaurant.menus.length -1]);
				}
			});
	});
};


exports.deleteMenu = function(req, res){

  	var menuId = req.param('menuId');

  	Restaurant.findOne({_id: req.param('restaurantId')}, function (err, restaurant){

	    if (err) {
	      console.log('categories.delete : ' + err);
	      return res.status(500).send({
	        message: 'something went wrong'
	      });
	    }

	    if (!restaurant)
	      return res.status(404).send({
	        message: 'Not found'
	      });

	    if(restaurant){

	    	var i = 0;
	    	var toRemove = null;
	    	var categoriesToDelete = [];

	    	//that small code remove the menu reference in menus and menu (if active)
	    	_(restaurant.menus).forEach(function(m) {
	    		if(m._id.toString() === menuId){
	    			toRemove = i;
	    			categoriesToDelete = m.categories;

	    			if(m.active)
	    				restaurant.menu = [];
	    		}

	    		i++;
	    	});

	    	if(toRemove !== null){
	    		restaurant.menus.splice(toRemove, 1);
	    	}

	    	//we have the categoriesTodelete; then we save the restaurant first
	    	restaurant.save(function (err){

			   	if (err) {
			      console.log('categories.delete 2 : ' + err);
			      return res.status(500).send({
			        message: 'something went wrong'
			      });
			    }


	    		return res.jsonp(restaurant);
	    	});


	      
	    }
  });
};


exports.setActive = function(req, res){
	var me = require('./restaurants.server.controller');
	me.setMainMenu(req.param('restaurantId'), req.param('menuId'), function(result){
		console.log('omg why did i make that async double call again ? ');
		console.log(result);
		return res.jsonp(result);
	});
};


exports.setMainMenu = function(restoId, menuId, callback){
	Restaurant.findById(restoId)
						.select('menu menus').exec(function(err, restaurant){

			if (err) {
				console.log('Restaurants.setMainMenu : ' + err);
				return err;
			}

			if (!restaurant)
				return {
					message: 'restaurant not found'
				};

			console.log('BEFORE');
			console.log(restaurant);

			//first each to put everything as not active.
			var i = 0;
			_(restaurant.menus).forEach(function(m) {
				restaurant.menus[i].active = false;
				i++;
			});


			restaurant.save(function (err){
				if (err) {
					console.log('categories.setMainMenu 2 : ' + err);
					return err;
				}


				console.log('AFTER');
				console.log(restaurant);

				console.log(menuId + '=======');
				i = 0;
				//for each to find the correct menu (workaround..)
				_(restaurant.menus).forEach(function(m) {
						if(m._id.toString() === menuId){
							console.log('here ;)');

							//doing our stuff :)
							restaurant.menu = m.categories;
							restaurant.menus[i].active = true;

							console.log('BEFORE SAVE');
							console.log(restaurant);

							restaurant.save(function (err){
									if (err) {
										console.log('categories.setMainMenu 2 : ' + err);
										return err;
									}

									console.log('after save');
									console.log(restaurant);
									callback(restaurant);
							});
						}
						i++;
				});
			});
	});
};
