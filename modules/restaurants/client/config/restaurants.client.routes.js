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
		}).
		state('restaurants.view', {
			url: '/:restaurantId',
			templateUrl: 'modules/restaurants/views/view-restaurant.client.view.html'
		}).
		state('restaurants.edit', {
			url: '/:restaurantId/edit',
			templateUrl: 'modules/restaurants/views/edit-restaurant.client.view.html'
		}).
		state('adminMenuRestaurant', {
			url: '/:restaurantId/menu/:menuId/adminMenu',
			templateUrl: 'modules/restaurants/views/menu-admin.client.view.html'
		});
	}
]);