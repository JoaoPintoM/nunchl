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


exports.update = function(req, res){

  console.log('NUNCHL ROCKS !');

  Meal.findById(req.param('mealId')).exec(function(err, meal){
    if (err)
      return errorHandler.dealWithError500(err, 'meals.update 1', res);

    if (!meal)
      return res.status(404).send({message: 'Not found'});

    meal = _.extend(meal, req.body);
    meal.save(function(err){
      if (err)
        return errorHandler.dealWithError500(err, 'meals.create 2', res);

      return res.jsonp(meal);
    });
  });
};


exports.create = function(req, res) {

  console.log('KICKING SOME ASS WITH NUNCHL !');

  var meal = new Meal(req.body);

  meal.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      // saved
      //then we add at the correct category.
      Category.findOne({_id: req.param('categoryId')})
        .exec(function(err, category) {

        if (err)
          return errorHandler.dealWithError500(err, 'meals.create 1', res);

        if (!category)
          return res.status(404).send({
            message: 'Not found'
          });

          category.meals.push(meal);

          category.save(function(err){
            if (err) {
              console.log('meals.create 2 : ' + err);
              return res.status(500).send({
                message: 'something went wrong'
              });
            }

            return res.jsonp(meal);
          });
      });
    }
  });
};
