'use strict';
/*global $:false */
/*global google:false */

var restoNameTrimmed = '';
var geocoder;
var map;

function initialize() {
  geocoder = new google.maps.Geocoder();
}

google.maps.event.addDomListener(window, 'load', initialize);



// angular.module('restaurants').controller('CreateRestaurantsController',
//       ['$scope', '$stateParams', '$location', 'Authentication', 'Restaurants',
// function($scope, $stateParams, $location, Authentication, Restaurants) {

  angular.module('restaurants').controller('RestaurantsController',
      ['$scope', '$stateParams', '$location', 'Authentication', 'Restaurants', 'RMenus',
  function($scope, $stateParams, $location, Authentication, Restaurants, RMenus ) {
    $scope.authentication = Authentication;

    }
]);
