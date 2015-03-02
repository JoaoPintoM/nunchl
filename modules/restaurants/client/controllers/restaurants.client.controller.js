'use strict';

// Restaurants controller
angular.module('restaurants').controller('RestaurantsController',
			['$scope', '$stateParams', '$location', 'Authentication', 'Restaurants', 'RMenus',
	function($scope, $stateParams, $location, Authentication, Restaurants, RMenus ) {
		$scope.authentication = Authentication;

		$scope.currentPage = $stateParams.pageNum;

		// Create new Restaurant
		$scope.create = function() {
			// Create new Restaurant object
			console.log('creating restaurant..');
			var restaurant = new Restaurants ({
				name: this.name
			});

			console.log(restaurant);
			// Redirect after save
			restaurant.$save(function(response) {
				$location.path('restaurants/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Restaurant
		$scope.remove = function( restaurant ) {
			if ( restaurant ) { restaurant.$remove();

				for (var i in $scope.restaurants ) {
					if ($scope.restaurants [i] === restaurant ) {
						$scope.restaurants.splice(i, 1);
					}
				}
			} else {
				$scope.restaurant.$remove(function() {
					$location.path('restaurants');
				});
			}
		};

		// Update existing Restaurant
		$scope.update = function() {
			var restaurant = $scope.restaurant ;

			restaurant.$update(function() {
				$location.path('restaurants/' + restaurant._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Restaurants
		$scope.find = function() {
			$scope.restaurants = Restaurants.query();
		};

		// Find existing Restaurant
		$scope.findOne = function() {
			$scope.restaurant = Restaurants.get({
				restaurantId: $stateParams.restaurantId
			});
		};


		$scope.createMenu = function() {
			var menu = new RMenus({
				name: $scope.newMenuName
			});

			menu.$save({restaurantId: $stateParams.restaurantId}, function(menu) {
				$scope.newMenuName = '';
				$scope.newSection = false;

				$scope.restaurant.menus.push(menu);

			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
				alert($scope.error);
			});
		};

		$scope.removeMenu = function(menu){

			var m = new RMenus(menu);

			if ( menu ) { 
	            m.$remove({
	                restaurantId: $stateParams.restaurantId,
	                menuId: m._id
	            }, function(data){
	                console.log('before data');
	                console.log(data);

		            for (var i in $scope.restaurant.menus ) {
						if ($scope.restaurant.menus [i] === menu ) {
							$scope.restaurant.menus.splice(i, 1);
						}
					}
	            });
	        }
		};

		$scope.setAsActive = function(m){
			var res = RMenus.setactive({
						restaurantId: $stateParams.restaurantId,
						menuId: m._id});

			res.$promise.then(function(data) {
				$scope.findOne(); // a changer !!! </ \ lo^l
			});
		};
	}
]);
