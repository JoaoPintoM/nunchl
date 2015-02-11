'use strict';

var should = require('should'),
	request = require('supertest'),
	path = require('path'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Restaurant = mongoose.model('Restaurant'),
	express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, restaurant;

/**
 * Restaurant routes tests
 */
describe('Restaurant CRUD tests', function() {
	before(function(done) {
		// Get application
		app = express.init(mongoose);
		agent = request.agent(app);

		done();
	});

	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new Restaurant
		user.save(function() {
			restaurant = {
				name: 'Restaurant Name'
			};

			done();
		});
	});

	it('should be able to save Restaurant instance if logged in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Restaurant
				agent.post('/api/restaurants')
					.send(restaurant)
					.expect(200)
					.end(function(restaurantSaveErr, restaurantSaveRes) {
						// Handle Restaurant save error
						if (restaurantSaveErr) done(restaurantSaveErr);

						// Get a list of Restaurants
						agent.get('/api/restaurants')
							.end(function(restaurantsGetErr, restaurantsGetRes) {
								// Handle Restaurant save error
								if (restaurantsGetErr) done(restaurantsGetErr);

								// Get Restaurants list
								var restaurants = restaurantsGetRes.body;

								// Set assertions
								(restaurants[0].user._id).should.equal(userId);
								(restaurants[0].name).should.match('Restaurant Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Restaurant instance if not logged in', function(done) {
		agent.post('/api/restaurants')
			.send(restaurant)
			.expect(403)
			.end(function(restaurantSaveErr, restaurantSaveRes) {
				// Call the assertion callback
				done(restaurantSaveErr);
			});
	});

	it('should not be able to save Restaurant instance if no name is provided', function(done) {
		// Invalidate name field
		restaurant.name = '';

		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Restaurant
				agent.post('/api/restaurants')
					.send(restaurant)
					.expect(400)
					.end(function(restaurantSaveErr, restaurantSaveRes) {
						// Set message assertion
						(restaurantSaveRes.body.message).should.match('Please fill Restaurant name');
						
						// Handle Restaurant save error
						done(restaurantSaveErr);
					});
			});
	});

	it('should be able to update Restaurant instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Restaurant
				agent.post('/api/restaurants')
					.send(restaurant)
					.expect(200)
					.end(function(restaurantSaveErr, restaurantSaveRes) {
						// Handle Restaurant save error
						if (restaurantSaveErr) done(restaurantSaveErr);

						// Update Restaurant name
						restaurant.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Restaurant
						agent.put('/api/restaurants/' + restaurantSaveRes.body._id)
							.send(restaurant)
							.expect(200)
							.end(function(restaurantUpdateErr, restaurantUpdateRes) {
								// Handle Restaurant update error
								if (restaurantUpdateErr) done(restaurantUpdateErr);

								// Set assertions
								(restaurantUpdateRes.body._id).should.equal(restaurantSaveRes.body._id);
								(restaurantUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Restaurants if not signed in', function(done) {
		// Create new Restaurant model instance
		var restaurantObj = new Restaurant(restaurant);

		// Save the Restaurant
		restaurantObj.save(function() {
			// Request Restaurants
			request(app).get('/api/restaurants')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Restaurant if not signed in', function(done) {
		// Create new Restaurant model instance
		var restaurantObj = new Restaurant(restaurant);

		// Save the Restaurant
		restaurantObj.save(function() {
			request(app).get('/api/restaurants/' + restaurantObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', restaurant.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Restaurant instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Restaurant
				agent.post('/api/restaurants')
					.send(restaurant)
					.expect(200)
					.end(function(restaurantSaveErr, restaurantSaveRes) {
						// Handle Restaurant save error
						if (restaurantSaveErr) done(restaurantSaveErr);

						// Delete existing Restaurant
						agent.delete('/api/restaurants/' + restaurantSaveRes.body._id)
							.send(restaurant)
							.expect(200)
							.end(function(restaurantDeleteErr, restaurantDeleteRes) {
								// Handle Restaurant error error
								if (restaurantDeleteErr) done(restaurantDeleteErr);

								// Set assertions
								(restaurantDeleteRes.body._id).should.equal(restaurantSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Restaurant instance if not signed in', function(done) {
		// Set Restaurant user 
		restaurant.user = user;

		// Create new Restaurant model instance
		var restaurantObj = new Restaurant(restaurant);

		// Save the Restaurant
		restaurantObj.save(function() {
			// Try deleting Restaurant
			request(app).delete('/api/restaurants/' + restaurantObj._id)
			.expect(403)
			.end(function(restaurantDeleteErr, restaurantDeleteRes) {
				// Set message assertion
				(restaurantDeleteRes.body.message).should.match('User is not authorized');

				// Handle Restaurant error error
				done(restaurantDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Restaurant.remove().exec();
		done();
	});
});