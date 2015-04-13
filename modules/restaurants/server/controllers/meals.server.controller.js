'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  Category = mongoose.model('Category'),
  Meal = mongoose.model('Meal'),
  _ = require('lodash');


//Meals!!

/**
 * Meal middleware
 */
exports.mealByID = function(req, res, next, id) { Meal.findById(id).exec(function(err, meal) {
    if (err) return next(err);
    if (! meal) return next(new Error('Failed to load meal ' + id));
    req.meal = meal ;
    next();
  });
};

exports.read = function(req, res){
  return res.jsonp(req.meal);
};


exports.update = function(req, res){

  console.log('NUNCHL ROCKS !');

  var meal = _.extend(req.meal, req.body);
  meal.save(function(err){
    if (err)
      return errorHandler.dealWithError500(err, 'meals.create 2', res);

    return res.jsonp(meal);
  });

};


exports.create = function(req, res) {

  var meal = new Meal(req.body);

  meal.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      // saved
      //then we add at the correct category.
      req.category.meals.push(meal);

      req.category.save(function(err){
        if (err) {
          console.log('meals.create 2 : ' + err);
          return res.status(500).send({
            message: 'something went wrong'
          });
        }

        return res.jsonp(meal);
      });
    }
  });

};


/**
 * Delete a Category
 */
exports.delete = function(req, res) {
  console.log(' = = = = = = = = ');

  req.meal.remove(function (err){
    return res.jsonp(req.meal);
  });

  // restoCtrl.deleteCategoryFromMenu(req, req.category._id,
  //   function (_err, result){

  //     if(result)
  //       return res.jsonp(req.category);

  // });
};
