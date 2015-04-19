'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Preorder Schema
 */

var PreorderSchema = new Schema({

  userId:{
    type: Schema.ObjectId,
    ref: 'User'
  },

  restaurantId: {type: String, required: 'Please fill restaurantId'},

  userName:{type: String, required: 'Please fill UserName', trim:true},
  pickUpTime:{type: Date, required: 'Please fill pickUpTime'},
  total:{type: Number, default: 0, required: 'total is required'},
  status: {type: String, enum: ['alive', 'validated', 'rejected', 'ready', 'delay'], default:'alive'},

  items:[{
    categoryId:{type: Schema.ObjectId, ref: 'Category'},
    categoryName:{type: String},
    mealId:{type: Schema.ObjectId, ref: 'Meal'},
    mealName:{type: String, required: 'mealName is required'},
    mealPrice:{type: Number, default: 0, required: 'mealPrice is required'},
    mealItems:[String]
  }],

  name: {
    type: String,
    default: '',
    required: 'Please fill Preorder name',
    trim: true
  },
  created: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('Preorder', PreorderSchema);
