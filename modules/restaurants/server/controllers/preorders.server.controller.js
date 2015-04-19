'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    Preorder = mongoose.model('Preorder'),
    _ = require('lodash');
var colors = require('colors');

/**
 * Create a Preorder
 */
exports.create = function(req, res) {
  console.log('CREATING FUCKING ROLLING NUNCHL STUFF :D');
  var preorder = new Preorder(req.body);

  preorder.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {

      //SOCKET IO </!!\>

      res.jsonp(preorder);
    }
  });
};

/**
 * Show the current Preorder
 */
exports.read = function(req, res) {
  res.jsonp(req.preorder);
};

/**
 * Update a Preorder
 */
exports.update = function(req, res) {
  console.log('=====//+++++++UPDATING++++++//========');
  console.log(req.preorder.pickUpTime);
  var preorder = req.preorder ;

  preorder = _.extend(preorder , req.body);

  preorder.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {

      var socketio = req.app.get('socketio'); // tacke out socket instance from the app container
      socketio.to(preorder.userId).emit('preorder.update', preorder); // emit an event for all connected clients

      res.jsonp(preorder);
    }
  });
};

/**
 * Delete an Preorder
 */
exports.delete = function(req, res) {
  var preorder = req.preorder ;

  preorder.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(preorder);
    }
  });
};

/**
 * List of Preorders
 */
exports.list = function(req, res) {
  Preorder.find().sort('-created').populate('user', 'displayName').exec(function(err, preorders) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(preorders);
    }
  });
};

exports.listByRestaurant = function(req, res){

    Preorder
      .find({restaurantId : req.param('restaurantId')})
      .sort('-created')
      .exec(function (err, preorders){

      if (err)
        return errorHandler.dealWithError500(err, 'preorders.listbyResto 1', res);

      if (!preorders)
        return res.status(404).send({message: 'Not found'});

      if(preorders)
        return res.jsonp(preorders);
      });
};


/**
* Preorder middleware
*/
exports.preorderByID = function(req, res, next, id) {
  Preorder.findById(id).exec(function(err, preorder) {
    if (err) return next(err);
    if (! preorder) return next(new Error('Failed to load Preorder ' + id));
    req.preorder = preorder ;
    next();
  });
};

/**
* Preorder authorization middleware
*/
exports.hasAuthorization = function(req, res, next) {

  var restos = _.pluck(req.user.restaurants, 'restaurant');
  var auth = false;

  _.forEach(restos, function(resto){
    if(resto.toString() === req.preorder.restaurantId)
      auth = true;
  });

  if(!auth){
      return res.status(403).send('User is not authorized');
  }

  next();
};



exports.hasAuthForThisRestaurant = function(req, res, next){

  console.log(colors.red(req.param('restaurantId')));

  var restos = _.pluck(req.user.restaurants, 'restaurant');
  var auth = false;

  _.forEach(restos, function(resto){
    if(resto.toString() === req.param('restaurantId'))
      auth = true;
    });

    if(!auth){
      return res.status(403).send('User is not authorized');
    }

    next();
};
