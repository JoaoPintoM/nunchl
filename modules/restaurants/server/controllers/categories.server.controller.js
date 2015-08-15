'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  path = require('path'),
  async = require('async'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  restoCtrl = require(path.resolve('./modules/restaurants/server/controllers/restaurants.server.controller')),
  Restaurant = mongoose.model('Restaurant'),
  Category = mongoose.model('Category'),
  Meal = mongoose.model('Meal'),
  _ = require('lodash');


//Categories!!

/**
 * Category middleware
 */
exports.categoryByID = function(req, res, next, id) { Category.findById(id).exec(function(err, category) {
    if (err) return next(err);
    if (! category) return next(new Error('Failed to load category ' + id));
    req.category = category ;
    next();
  });
};


//retrieve categories from a restaurant
exports.list = function (req, res){
  console.log( 'HIST LIST ');
  console.log(req.param('restaurantId'));
  console.log('menu');
  console.log(req.param('menuId'));

  Restaurant.findOne({_id: req.param('restaurantId')})
    .where('menus._id').equals(req.param('menuId'))
    .populate('menus.categories')
    .select('menus')
    .exec(function(err, restaurant) {

    if (err) {
      console.log('Restaurants.read : ' + err);
      return res.status(500).send({
        message: 'something went wrong'
      });
    }

    if (!restaurant){
      return res.status(404).send({
        message: 'Not found'
      });
    }else{
      console.log(restaurant.menus.length);
      var i = 0; //find the correct menu.

      _.forEach(restaurant.menus, function(m) {
        console.log(m);
        console.log('serieux...,?');

          if(m._id.toString() === req.param('menuId')){

              // // return res.jsonp(restaurant.menus);
              Meal.populate(restaurant.menus[i],{
                path: 'categories.meals'
                // select: 'name price mealItems'
                // model: Meal // <== We are populating phones so we need to use the correct model, not User
              }, function (err, o) {

                if(err) {
                  console.log('Error Menus : ', err);
                  return res.status(500).send({
                    message: 'something went wrong'
                  });
                }

                return res.jsonp(o.categories);
              });

              // return res.jsonp(m.categories);
          }
          i++;
      });
    }
  });
};


exports.update = function(req, res){

  console.log('Hello dear Cecile <3');

  //we remove
  delete req.body.meals;

  Category.findById(req.param('categoryId'))
          .populate('meals')
          .exec(function(err, category){

    if (err) {
      console.log('category.update : ' + err);
      return res.status(500).send({
        message: 'something went wrong'
      });
    }

    if (!category)
      return res.status(404).send({
        message: 'Not found'
      });

    category = _.extend(category, req.body);
    category.save(function(err){
      if (err) {
        console.log('category.update 2 : ' + err);
        return res.status(500).send({
          message: 'something went wrong'
        });
      }

      return res.jsonp(category);
    });
  });
};


exports.create = function(req, res) {
  console.log('Oi');
  console.log(req.body);
  var category = new Category(req.body);

  category.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {

      // saved
      //then we add at the correct menu.
      Restaurant.findOne({_id: req.param('restaurantId')})
        .exec(function(err, restaurant) {

        if (err) {
          console.log('categories.create 1 : ' + err);
          return res.status(500).send({
            message: 'something went wrong'
          });
        }

        if (!restaurant)
          return res.status(404).send({
            message: 'Not found'
          });

        //update the correct menu
        // callback hell
        var i = 0;
        // _(restaurant.menus).forEach(function(m) {
        _.forEach(restaurant.menus, function(m) {

            if(m._id.toString() === req.param('menuId')){

              restaurant.menus[i].categories.push(category);

              //check if actif menu
              if(restaurant.menus[i].active)
                restaurant.menu.push(category);

              restaurant.save(function (err){
                  if (err) {
                    console.log('categories.create 2 : ' + err);
                    return res.status(500).send({
                      message: 'something went wrong'
                    });
                  }

                  return res.jsonp(category);
              });
            }
            i++;
        });
      });
    }
  });
};


exports.read = function (req, res){

  Restaurant.findOne({_id: req.param('restaurantId')})
    .where('menus._id').equals(req.param('menuId'))
    .populate('menu')
    // .where('categories._id').equals('5454c4edc8fecfee88fa6472')
    .exec(function(err, restaurant) {

    if (err) {
      console.log('Restaurants.read : ' + err);
      return res.status(500).send({
        message: 'something went wrong'
      });
    }

    if (!restaurant)
      return res.status(404).send({
        message: 'Not found'
      });

    return res.jsonp(restaurant);
  });
};

/**
 * Delete a Category
 */
exports.delete = function(req, res) {
  console.log(' = = = = = = = = ');
  var restaurantId  = req.param('restaurantId');

  restoCtrl.deleteCategoryFromMenu(req, req.category._id,
    function (_err, result){

      if(result){

        req.category.remove(function (err){
          return res.jsonp(req.category);
        });

      }
  });
};

exports.deleteCategories = function(categoriesIds, callback){

  Category.find()
          .where('_id')
          .in(categoriesIds)
          .exec(function (err, categories){

    if(err)
      return callback(err);

    if(!categories)
      return callback('not found');

    if(categories){
      console.log('my categories here');
      console.log(categories);

      //we delete all the categories one by one
      async.each(categories, function (cat, _cb) {

        cat.remove(function(err) {
          if (err) {
           return _cb(err);
          } else {
            return _cb();
          }
        });

      }, function(err){
          // if any of the file processing produced an error, err would equal that error
          if( err ) {
            // One of the iterations produced an error.
            // All processing will now stop.
            console.log('error when deleting categories ' + err);
          } else {
            console.log('everything deleted');
            callback(null, true);
          }
      });
    }
  });
};

