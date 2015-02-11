'use strict';

(function() {
	// Restaurants Controller Spec
	describe('Restaurants Controller Tests', function() {
		// Initialize global variables
		var RestaurantsController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Restaurants controller.
			RestaurantsController = $controller('RestaurantsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Restaurant object fetched from XHR', inject(function(Restaurants) {
			// Create sample Restaurant using the Restaurants service
			var sampleRestaurant = new Restaurants({
				name: 'New Restaurant'
			});

			// Create a sample Restaurants array that includes the new Restaurant
			var sampleRestaurants = [sampleRestaurant];

			// Set GET response
			$httpBackend.expectGET('api/restaurants').respond(sampleRestaurants);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.restaurants).toEqualData(sampleRestaurants);
		}));

		it('$scope.findOne() should create an array with one Restaurant object fetched from XHR using a restaurantId URL parameter', inject(function(Restaurants) {
			// Define a sample Restaurant object
			var sampleRestaurant = new Restaurants({
				name: 'New Restaurant'
			});

			// Set the URL parameter
			$stateParams.restaurantId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/api\/restaurants\/([0-9a-fA-F]{24})$/).respond(sampleRestaurant);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.restaurant).toEqualData(sampleRestaurant);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Restaurants) {
			// Create a sample Restaurant object
			var sampleRestaurantPostData = new Restaurants({
				name: 'New Restaurant'
			});

			// Create a sample Restaurant response
			var sampleRestaurantResponse = new Restaurants({
				_id: '525cf20451979dea2c000001',
				name: 'New Restaurant'
			});

			// Fixture mock form input values
			scope.name = 'New Restaurant';

			// Set POST response
			$httpBackend.expectPOST('api/restaurants', sampleRestaurantPostData).respond(sampleRestaurantResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Restaurant was created
			expect($location.path()).toBe('/restaurants/' + sampleRestaurantResponse._id);
		}));

		it('$scope.update() should update a valid Restaurant', inject(function(Restaurants) {
			// Define a sample Restaurant put data
			var sampleRestaurantPutData = new Restaurants({
				_id: '525cf20451979dea2c000001',
				name: 'New Restaurant'
			});

			// Mock Restaurant in scope
			scope.restaurant = sampleRestaurantPutData;

			// Set PUT response
			$httpBackend.expectPUT(/api\/restaurants\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/restaurants/' + sampleRestaurantPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid restaurantId and remove the Restaurant from the scope', inject(function(Restaurants) {
			// Create new Restaurant object
			var sampleRestaurant = new Restaurants({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Restaurants array and include the Restaurant
			scope.restaurants = [sampleRestaurant];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/api\/restaurants\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleRestaurant);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.restaurants.length).toBe(0);
		}));
	});
}());