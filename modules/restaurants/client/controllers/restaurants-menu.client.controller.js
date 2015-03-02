'use strict';
/*global $:false */

var rightMenuIsOpen = false;
var firstClickToOpen = false;


var MEALIMAGE_WIDTH = 310 ;
var MEALIMAGE_HEIGHT = 140 ;

angular.module('restaurants').controller('MenuController', ['$scope', '$stateParams', '$location', 'Authentication', 'Restaurants', 'Categories',
  function($scope, $stateParams, $location, Authentication, Restaurants, Categories) {
    $scope.authentication = Authentication;

    $scope.selectedCategory = -1;
    $scope.selectedMeal = -1;

    $scope.firstTime = true;
    $scope.loading = false;

    $scope.find = function() {
      $scope.restaurants = Restaurants.query();
    };

    $scope.findOne = function() {
      // $scope.categories = Restaurants.getmenu();

      $scope.categories = Categories.query({
        restaurantId: $stateParams.restaurantId,
        menuId:  $stateParams.menuId //'545631a2782f3f1ab60c6b47'
      });
      //
      // result.$promise.then(function(data) {
      //    $scope.categories = data.categories;
      //    console.log($scope.categories);
      //    console.log($scope.categories[0]);
      //    console.log($scope.categories[0].name);
      // });


    };

    $scope.create = function() {

      var restaurants = new Restaurants({
        name: this.name,
        description: this.description
      });

      restaurants.$save(function(response) {
        $location.path('restaurants/' + response._id);

        $scope.name = '';
        $scope.description = '';

      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };


    $scope.selectCategory = function ($index) {
        $scope.selectedCategory = $index;
        $scope.firstTime = false;

        // $('html, body').animate({
        //     scrollTop: $('#id_meals').offset().top
        // }, 500);

        // $('#id_meals').blur();

        $scope.selectedMeal = -1;
    };

    $scope.selectMeal = function ($index, MealID) {
        $scope.selectedMeal = $index;
    };


    $scope.addCategory = function (categoryName, categoryOrder) {
        console.log(categoryName + 'oi '+ categoryOrder);
        if (categoryName === null || !categoryName) {
            alert('Name cannot be null');
        }
        else {
            $scope.loading = true;

            var category = new Categories({
              name: categoryName
            });

            console.log(category);
            console.log($stateParams.restaurantId + ':' + $stateParams.menuId);

            category.$save({
                    restaurantId:$stateParams.restaurantId,
                    menuId:$stateParams.menuId}, function(data) {
                console.log(data);

                $scope.categories.push(data);

                $scope.categoryName = '';
                $scope.selectedCategory = -1;

                categoryName = null;
                $scope.loading = false;
                // $scope.$apply();

            }, function(errorResponse) {
              alert(errorResponse.data.message);
              $scope.error = errorResponse.data.message;
            });
        }
    };

    $scope.editCategory = function (category) {
        $scope.loading = true;

        category.$update({
          restaurantId: $stateParams.restaurantId,
          menuId:$stateParams.menuId,
          categoryId: category._id}, function(data) {

          $scope.loading = false;
          $scope.categories[$scope.selectedCategory] = data;
          // $scope.$apply();

        }, function(errorResponse) {
          alert(errorResponse.data.message);
          $scope.error = errorResponse.data.message;
        });
    };

    // Remove existing Restaurant
    $scope.removeCategory = function( category ) {
        if ( category ) { 
            category.$remove({
                restaurantId: $stateParams.restaurantId,
                menuId:$stateParams.menuId,
                categoryId: category._id
            }, function(data){
                console.log('before data');
                console.log(data);
            });

            // for (var i in $scope.restaurants ) {
            //     if ($scope.restaurants [i] === restaurant ) {
            //         $scope.restaurants.splice(i, 1);
            //     }
            // }
        } else {
            console.log('else');
            // $scope.restaurant.$remove(function() {
            //     $location.path('restaurants');
            // });
        }
    };

    // $scope.addMeal = function (mealName, catId, mealPrice,  mealOrder) {

    //     if (mealName === null || !mealName) {
    //         alert('Name cannot be null');
    //     }
    //     else {
    //         $scope.loading = true;

    //         var meal = new Meals({
    //           name: mealName,
    //           price: mealPrice
    //         });

    //         meal.$save({categoryId:catId}, function(data) {

    //             $scope.categories[$scope.selectedCategory].meals.push(data);

    //             // categoryName = null;
    //             $scope.loading = false;
    //             // $scope.$apply();

    //         }, function(errorResponse) {
    //           alert(errorResponse.data.message);
    //           $scope.error = errorResponse.data.message;
    //         });
    //     }
    // };


    // $scope.editMealFunction = function(m){

    //   var meal = new Meals(m);

    //   meal.$update({
    //     categoryId:$scope.categories[$scope.selectedCategory]._id,
    //     mealId: m._id}, function(data) {

    //       $scope.loading = false;
    //       $scope.categories[$scope.selectedCategory].meals[$scope.selectedMeal] = data;
    //       // $scope.$apply();

    //   }, function(errorResponse) {
    //     alert(errorResponse.data.message);
    //     $scope.error = errorResponse.data.message;
    //   });
    // };

    var isEditingMealImage = false; // special case for meal image

    // $scope.editOptionsMeals = function (searchName, $index, meal) {
    //     isEditingMealImage = true;
    //     showRightMenu();

    //     if (!meal.Image)
    //         $('#rightTab a[href="#image"]').tab('show'); // Select tab by name
    //     else
    //         $('#rightTab a[href="#options"]').tab('show'); // Select tab by name

    //     $scope.selectedMeal = $index;
    //     $scope.editingImage = true;
    //     $scope.searchInput = $scope.categories[$scope.selectedCategory].name;
    //     // $scope.SeachForImages();
    // };


    // $scope.editOptionsCats = function (searchName, $index) {
    //     showRightMenu();
    //     $('#rightTab a[href="#image"]').tab('show'); // Select tab by name
    //     $scope.selectedCategory = $index;
    //     isEditingMealImage = false;
    //     $scope.editingImage = true;
    //     $scope.searchInput = searchName;
    //     // $scope.SeachForImages();
    // };

    var showRightMenu = function () {
        $('.nunchl-right-menuCreation').css({
            background: 'rgba(255, 255, 255, 1)',
            'visibility': 'visible'
            //height: 'auto'
        }).animate({ width: '800px' });

        rightMenuIsOpen = true;
    };

    var hideRightMenu = function () {
        $('.nunchl-right-menuCreation').css({
            'visibility': 'hidden',
            background: 'none',

        }).animate({ width: '0' });

        rightMenuIsOpen = false;
    };

  }
]);
