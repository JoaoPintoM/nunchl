'use strict';
/*global $:false */

angular.module('restaurants').controller('Restaurants-nchl-Controller', ['$scope', '$stateParams', '$location', 'Authentication', 'Restaurants', 'Preorders',
  function($scope, $stateParams, $location, Authentication, Restaurants, Preorders) {
    $scope.authentication = Authentication;

    $scope.find = function() {

      $scope.restaurants = Restaurants.query(function(){});
    };

    $scope.findOne = function() {
      $scope.restaurant = Restaurants.getmenu({
        restaurantId: $stateParams.restaurantId
      });
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

    $scope.findMyRestaurants = function(){
      $scope.restaurants = Restaurants.mine();
    };


    // '' nunchl adaptations..  ''
    // ---------------------------
    $scope.selectedCategory = -1;
    $scope.selectedMeal = -1;

    $scope.firstTime = true;

    $scope.preorder = {total: 0, meals:[]};

    $scope.selectCategory = function ($index) {
        $scope.selectedCategory = $index;
        $scope.firstTime = false;

        //scroll
        $scope.scrollBackCategories();
    };

    $scope.selectMeal = function ($index, MealID) {
        //if the user change the Meal we need to reset the mealItems
        if ($scope.selectedMeal !== $index) {
            $scope.mealItems = [];
        }
        $scope.selectedMeal = $index;
    };

    $scope.resetCategory = function () {

        $scope.firstTime = true;
        $scope.selectedCategory = -1;

        //reset all
        $scope.mealItems = [];
        $scope.selectedMeal = -1;

    };


    $scope.AddPreOrder = function () {

        this.$hide();

        // var category = $scope.menu.Categories[$scope.selectedCategory].Id;
        // var _categoryName = $scope.menu.Categories[$scope.selectedCategory].Name;
        // var item_ID = $scope.menu.Categories[$scope.selectedCategory].Meals[$scope.selectedMeal].Id;
        // var item_Name = $scope.menu.Categories[$scope.selectedCategory].Meals[$scope.selectedMeal].Name;
        // var price = $scope.menu.Categories[$scope.selectedCategory].Meals[$scope.selectedMeal].Price; //WTF, plz change it. Wrong.
        //
        // var mealItems = [];
        //
        // $.each($scope.mealItems, function (key, val) {
        //
        //     if ($.isNumeric(val)) { //Normal Case
        //         var mealsubItemID = $scope.menu.Categories[$scope.selectedCategory].Meals[$scope.selectedMeal].MealItems[val].Id;
        //         var mealsubItemName = $scope.menu.Categories[$scope.selectedCategory].Meals[$scope.selectedMeal].MealItems[val].Name;
        //         var mealsubItemPrice = $scope.menu.Categories[$scope.selectedCategory].Meals[$scope.selectedMeal].MealItems[val].Price;
        //         //calculte Price
        //         price += mealsubItemPrice;
        //
        //         //js_* prefix is only for the client side, no need of theses values on the server.
        //         mealItems.push({ MealItemId: mealsubItemID, js_SubItem: mealsubItemName, js_SubItemPrice: mealsubItemPrice });
        //     } else { //Choice Case
        //         var mealsubItemID = $scope.menu.Categories[$scope.selectedCategory].Meals[$scope.selectedMeal].MealItems[val._index].Id;
        //         var mealsubItemName = $scope.menu.Categories[$scope.selectedCategory].Meals[$scope.selectedMeal].MealItems[val._index].Name;
        //
        //         //alert(val._selectedChoice.Price); //Choice Item Price
        //         price += val._selectedChoice.Price;
        //
        //         mealItems.push({
        //             MealItemId: mealsubItemID,
        //             choiceID: val._selectedChoice.Id,
        //             js_SubItem: mealsubItemName,
        //             js_choiceName: val._selectedChoice.Name,
        //             js_choicePrice: val._selectedChoice.Price
        //         });
        //     }
        // });


        //js_* prefix is only for the client side, no need of theses values on the server.
        $scope.preorder.meals.push({
            category: $scope.restaurant.menu[$scope.selectedCategory]._id,
            meal: $scope.restaurant.menu[$scope.selectedCategory].meals[$scope.selectedMeal]._id,
            price: $scope.restaurant.menu[$scope.selectedCategory].meals[$scope.selectedMeal].price,
            unityPrice: $scope.restaurant.menu[$scope.selectedCategory].meals[$scope.selectedMeal].price,
            quantity: 1,
            js_MealName: $scope.restaurant.menu[$scope.selectedCategory].meals[$scope.selectedMeal].name,
            js_DisplayTotal: $scope.restaurant.menu[$scope.selectedCategory].meals[$scope.selectedMeal].price,
            js_CategoryName: $scope.restaurant.menu[$scope.selectedCategory].name
        });
        // $scope.preorder.total += 69.00;

        setTimeout(function () {
            $scope.firstTime = true;
            $scope.selectedCategory = -1;

            ////reset all
            $scope.selectedMeal = -1;
            $scope.$apply();
            $scope.scrollTOP();
            console.log('DONE :D');
        }, 500);
    };


    $scope.scrollTOP = function () {
        $('html, body').animate({
            scrollTop: 0
        }, 500);
    };

    $scope.scrollBackCategories = function () {
        $('html, body').animate({
            scrollTop: $('#backCategoryButton').offset().top
        }, 500);

        $('#backCategoryButton').blur();
    };

    $scope.ValidatePreOrder = function () {

        // userId:{
        //   type: Schema.ObjectId,
        //   ref: 'User'
        // },
        //
        // userName:{type: String, required: 'Please fill UserName', trim:true},
        // pickUpTime:{type: Date, required: 'Please fill pickUpTime'},
        // total:{type: Number, default: 0, required: 'total is required'},
        // status: {type: Number, default: 0},
        //
        // items:[{
        //   categoryId:{type: Schema.ObjectId, ref: 'Category'},
        //   categoryName:{type: String},
        //   mealId:{type: Schema.ObjectId, ref: 'Meal'},
        //   mealName:{type: String, required: 'mealName is required'},
        //   mealPrice:{type: Number, default: 0, required: 'mealPrice is required'},
        //   mealItems:[String]
        // }],

        var _items = [];

        angular.forEach(this.preorder.meals, function(m, key) {
          _items.push({
            categoryId : m.category,
            categoryName : m.js_CategoryName,
            mealId: m.meal,
            mealName: m.js_MealName,
            mealPrice: m.unityPrice
          });
        });

        var preorder = new Preorders ({
          restaurantId: $stateParams.restaurantId,
          name: 'playing with nunchl',
          pickUpTime : new Date(),
          userId: this.authentication.user._id,
          userName : this.authentication.user.username,
          total : this.preorder.total,
          items : _items
        });

        // Redirect after save
        preorder.$save(function(response) {
          $location.path('preorders/' + response._id);
        }, function(errorResponse) {
          alert(errorResponse.data.message);
        });
    };

  }
]);
