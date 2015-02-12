'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Restaurant Schema
 */
var CategorySchema = new Schema({

  name: {
    type: String,
    default: '',
    trim: true
  },

  image: {
    type: String,
    default: ''
  },

  meals: [{
    type: Schema.ObjectId,
    ref: 'Meal'
  }]
  // _menu ? ?  : { type: Number, ref: 'Menu ? ? ?' },
});

mongoose.model('Category', CategorySchema);
