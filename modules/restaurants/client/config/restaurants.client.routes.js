'use strict';

//Setting up route
angular.module('restaurants').config(['$stateProvider',
	function($stateProvider) {
		// Restaurants state routing
		$stateProvider.
		state('restaurants', {
			abstract: true,
			url: '/restaurants',
			template: '<ui-view/>'
		}).
		state('restaurants.list', {
			url: '',
			templateUrl: 'modules/restaurants/views/list-restaurants.client.view.html'
		}).
		state('restaurants.create', {
			url: '/create',
			templateUrl: 'modules/restaurants/views/create-restaurant.client.view.html'
		})
		.state('restaurants.paginated', {
	    url: '/page-:pageNum',
	    templateUrl: 'modules/restaurants/views/list-restaurants.client.view.html'
	    // controller: function ($stateParams) {
	    //     // If we got here from a url of /contacts/page-2
	    //     expect($stateParams).toBe({pageNum: 2});
	    // }
		}).
    state('restaurants.viewNchl', {
      url: '/nchl/:restaurantId',
      templateUrl: 'modules/restaurants/views/nchl-view-restaurant.client.view.html'
    }).
		state('restaurants.view', {
			url: '/:restaurantId',
			templateUrl: 'modules/restaurants/views/view-restaurant.client.view.html'
		}).
		state('restaurants.edit', {
			url: '/:restaurantId/edit',
			templateUrl: 'modules/restaurants/views/edit-restaurant.client.view.html'
		}).
		state('restaurants.adminMenu', {
			url: '/:restaurantId/menu/:menuId/adminMenu',
			templateUrl: 'modules/restaurants/views/menu-admin.client.view.html'
		});
	}
]);
