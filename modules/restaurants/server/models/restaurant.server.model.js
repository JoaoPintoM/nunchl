'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Restaurant Schema
 */
var RestaurantSchema = new Schema({

	name: {
		type: String,
		default: '',
		trim: true
	},

	description:{
		type: String,
		default: 'new restaurant @ nunchl',
		trim: true
	},

	logo:{
		type: String,
		default: 'img/demo_restaurant_medium.jpg',
		trim: true
	},

	open:{
		type: Boolean,
		default: false
	},

	types: {
		type: [{
			type: String,
			enum: ['Kebab', 'Chinese']
		}],
		default: ['Kebab']
	},

	created: {
		type: Date,
		default: Date.now
	},

	defaultMenu: {
		type: Number,
		default: 0
	},

	menu: [{
		type: Schema.ObjectId,
		ref: 'Category'
	}],

	menus:[{
		name: {type:String, default:'my menu', trim:true},
		active: {type:Boolean, default: false},
		categories:[{
				type: Schema.Types.ObjectId,
				ref: 'Category'
			}],
	}],

	users: [{
		type: Schema.ObjectId,
		ref: 'User'
	}],

	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}

	// defaultMenu : {
	// 		type: Schema.ObjectId,
	// 		ref: 'Menu'
	// },
	//
	// menus: [{
	// 		type: Schema.ObjectId,
	// 		ref: 'Menu'
	// 	}],
	//
	// users: [{
	// 	type: Schema.ObjectId,
	// 	ref: 'User'
	// }]


//         [Required]
//         public string Name { get; set; }
//         public ICollection<Menu> Menus { get; set; }
//         [Required]
//         public ICollection<RestaurantType> Types { get; set; }
//         [Required]
//         public Address Address { get; set; }
//         [Required]
//         public bool Trusted { get; set; }
//         public bool Open { get; set; }
//         public string Logo { get; set; }
//         // Add type information.
//         [DataType(DataType.PhoneNumber)]
//         public string PhoneNumber { get; set; }
//         public string Description { get; set; }
//         public string Ouverture { get; set; }
//         public bool SMSNotifActivated { get; set; }
//         public List<SMS> SMS { get; set; }
//         public int DefaultMenu { get; set; }
//         public AccountType AccountType { get; set; }
//         public int TotalPOThisMonth { get; set; }
//         public DateTime? MonthStartDate { get; set; }
//         public DateTime? MonthEndDate { get; set; }
//         public double TotalCurrentMonth { get; set; }
//         [Required]
//         public byte MinIntervalTime { get; set; }

});

mongoose.model('Restaurant', RestaurantSchema);
