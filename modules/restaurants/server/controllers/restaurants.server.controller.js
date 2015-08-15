'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),
	mongoose = require('mongoose'),
	Restaurant = mongoose.model('Restaurant'),
  Meal = mongoose.model('Meal'),
	User = mongoose.model('User'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
	categoryCtrl = require(path.resolve('./modules/restaurants/server/controllers/categories.server.controller')),
  colors = require('colors');

/**
 * Create a Restaurant
 */
exports.create = function(req, res) {
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
 * Show the current restaurant's Menu
 */
exports.menu = function(req, res) {

  console.log('get that menu plz :)' .red);

  Meal.populate(req.restaurant,{
        path: 'menu.meals'
        // select: 'name price mealItems'
        // model: Meal // <== We are populating phones so we need to use the correct model, not User
      }, function (err, meals) {

    return res.jsonp(meals);
  });
};


/**
 * Update a Restaurant
 */
exports.update = function(req, res) {
	var restaurant = req.restaurant;

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
exports.restaurantByID = function(req, res, next, id) {
  console.log('hello' .red);
  console.log(id);
  Restaurant.findById(id)
            .populate('user', 'displayName')
            .populate('menu')
            .exec(function(err, restaurant) {
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
	      console.log('restaurant.deleteMenu : ' + err);
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
	    	_.forEach(restaurant.menus, function(m) {
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
			      console.log('restaurant.deleteMenu 2 : ' + err);
			      return res.status(500).send({
			        message: 'something went wrong'
			      });
			    }

			    //there i NEED to delete the categories..
			    //I can't let them on the database for nothing.
			    //IMPORTANT !!!! \\

			    if(categoriesToDelete.length > 0){
				    categoryCtrl.deleteCategories(categoriesToDelete, function (err, cats){

					    if (err) {
					      console.log('restaurant.deleteMenu 3 : ' + err);
					      return res.status(500).send({
					        message: 'something went wrong'
					      });
					    }

					    if(cats){
					    	return res.jsonp(restaurant);
					    }

				    });
			    }else{
			    	return res.jsonp(restaurant);
			    }
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

		//first each to put everything as not active.
		var i = 0;
    _.forEach(restaurant.menus, function(m) {
			restaurant.menus[i].active = false;
			i++;
		});

		restaurant.save(function (err){
			if (err) {
				console.log('categories.setMainMenu 2 : ' + err);
				return err;
			}

			i = 0;
			//for each to find the correct menu (workaround..)
      _.forEach(restaurant.menus, function(m) {
				if(m._id.toString() === menuId){

					//doing our stuff :)
					restaurant.menu = m.categories;
					restaurant.menus[i].active = true;

					restaurant.save(function (err){
						if (err) {
							console.log('categories.setMainMenu 2 : ' + err);
							return err;
						}

						callback(restaurant);
					});
				}
				i++;
			});
		});
	});
};

exports.deleteCategoryFromMenu = function(req, categoryId, callback){

  // active means if the category is duplicated into the 'menu' field
  var isActive = false;

  //find the category on the menus and delete it
  _.forEach(req.restaurant.menus, function(menu, key) {
    var catToDELETE = -1;
    _.forEach(menu.categories, function(cat, _i) {
      if(cat.toString() === categoryId.toString()){

        catToDELETE = _i;

        if(menu.active)
          isActive = true;
      }
    });

    if(catToDELETE !== -1){
      menu.categories.splice(catToDELETE, 1);
    }

    if(isActive){
      catToDELETE = -1;

      _.forEach(req.restaurant.menu, function(cat, _i) {
        if(cat.toString() === categoryId.toString())
          catToDELETE = _i;
      });

      if(catToDELETE !== -1){
        req.restaurant.menu.splice(catToDELETE, 1);
      }
    }

  });

  req.restaurant.save(function(err){
    if(err)
      callback(err);
    else
      callback(null, true);
  });
};
