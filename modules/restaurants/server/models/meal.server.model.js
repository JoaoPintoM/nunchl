'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Restaurant Schema
 */
var MealSchema = new Schema({

  name: {
    type: String,
    default: '',
    trim: true
  },

  price: {
    type: Number,
    default:0.0,
    required: 'Please fill in a price for the meal'
  },

  mealItems: {
    type: [String],
    default: ['Salad', 'Cheddar', 'Epinards', 'Maïs']
  },

  image:{
    type:String,
    default:''
  }
  // _menu ? ?  : { type: Number, ref: 'Menu ? ? ?' },


});

mongoose.model('Meal', MealSchema);
