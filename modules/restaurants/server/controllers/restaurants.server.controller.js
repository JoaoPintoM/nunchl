'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),
	mongoose = require('mongoose'),
	Restaurant = mongoose.model('Restaurant'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a Restaurant
 */
exports.create = function(req, res) {
	var restaurant = new Restaurant(req.body);
	restaurant.user = req.user;
	restaurant.users.push(req.user);

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