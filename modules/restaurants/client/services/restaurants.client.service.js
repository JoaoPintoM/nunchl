'use strict';

//Restaurants service used to communicate Restaurants REST endpoints
angular.module('restaurants').factory('Restaurants', ['$resource',
	function($resource) {
		return $resource('api/restaurants/:restaurantId', { restaurantId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);

angular.module('rmenus').factory('RMenus', ['$resource',
	function($resource) {
		return $resource('api/restaurants/:restaurantId/menus/:menuId', {
			restaurantId: '@_id',
			menuId: '@_menuId'
		}, {
			update: {
				method: 'PUT'
			},
			setactive: {
				method:'GET',
				url: 'api/restaurants/:restaurantId/menus/:menuId/setactive'
			}
		});
	}
]);
