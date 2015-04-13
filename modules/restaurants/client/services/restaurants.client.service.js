'use strict';

//Restaurants service used to communicate Restaurants REST endpoints
angular.module('restaurants')

.factory('Restaurants', ['$resource',
function($resource) {
	return $resource('api/restaurants/:restaurantId', { restaurantId: '@_id'
	}, {
		update: {
			method: 'PUT'
		}
	});
}])

.factory('Meals', ['$resource',
  function($resource) {
    return $resource('api/categories/:categoryId/meals/:mealId', {
      categoryId: '@_catId',
      mealId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
])


.factory('Categories', ['$resource',
  function($resource) {
    return $resource('api/restaurants/:restaurantId/menus/:menuId/categories/:categoryId', {
      restaurantId: '@_id',
      menuId: '@_menuId',
      categoryId: '@_catId'
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
