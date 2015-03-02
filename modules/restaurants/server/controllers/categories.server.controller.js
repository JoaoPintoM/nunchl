'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  Restaurant = mongoose.model('Restaurant'),
  Category = mongoose.model('Category'),
  Meal = mongoose.model('Meal'),
  _ = require('lodash');


//Categories!!

//retrieve categories from a restaurant
exports.list = function (req, res){

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
      var i = 0; //find the correct menu.
      _(restaurant.menus).forEach(function(m) {
          if(m._id.toString() === req.param('menuId')){

              // // return res.jsonp(restaurant.menus);
              Meal.populate(restaurant.menus[i],{
                path: 'categories.meals'
                // select: 'name price mealItems'
                // model: Meal // <== We are populating phones so we need to use the correct model, not User
              }, function (err, o) {

                return res.jsonp(o.categories);
              });

              // return res.jsonp(m.categories);
          }
          i++;
      });
    // // its obliously the first one cause we only have a menu by ID
    // return res.jsonp(restaurant.menus[0].categories);
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
        _(restaurant.menus).forEach(function(m) {

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
  console.log(req.param('restaurantId'));
  console.log(req.param('categoryId'));

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

      return res.jsonp(restaurant);
    }

  });

  // var restaurant = req.restaurant;

  // restaurant.remove(function(err) {
  //   if (err) {
  //     return res.status(400).send({
  //       message: errorHandler.getErrorMessage(err)
  //     });
  //   } else {
  //     res.jsonp(restaurant);
  //   }
  // });
};


