'use strict';
/*global $:false */

var rightMenuIsOpen = false;
var firstClickToOpen = false;


var MEALIMAGE_WIDTH = 310 ;
var MEALIMAGE_HEIGHT = 140 ;

angular.module('restaurants').controller('MenuController', ['$scope', '$stateParams', '$location', 'Authentication', 'Restaurants', 'Categories', 'Meals',
  function($scope, $stateParams, $location, Authentication, Restaurants, Categories, Meals) {
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

        $('html, body').animate({
            scrollTop: $('#id_meals').offset().top
        }, 500);

        $('#id_meals').blur();

        $scope.selectedMeal = -1;
    };

    $scope.selectMeal = function ($index, MealID) {
        $scope.selectedMeal = $index;
    };


    $scope.addCategory = function (categoryName, categoryOrder) {

        if (categoryName === null || !categoryName) {
            alert('Name cannot be null');
        }
        else {
            $scope.loading = true;

            var category = new Categories({
              name: categoryName
            });

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
          menuId:'545631a2782f3f1ab60c6b47',
          categoryId: category._id}, function(data) {

          $scope.loading = false;
          $scope.categories[$scope.selectedCategory] = data;
          $scope.$apply();

        }, function(errorResponse) {
          alert(errorResponse.data.message);
          $scope.error = errorResponse.data.message;
        });

        // $.ajax({
        //     url: '/api/Category/' + category.Id,
        //     type: 'PUT',
        //     data: category,
        //     success: function (data) {
        //           $scope.categories[$scope.selectedCategory] = data;
        //           toastr.success("Category " + data.Name + " Edited");
        //
        //           $scope.loading = false;
        //           $scope.$apply();
        //     },
        //     error: function (xhr, status, error) {
        //         var err = eval("(" + xhr.responseText + ")");
        //         alert(err.Message);
        //           $scope.loading = false;
        //     }
        // });
    };

    $scope.addMeal = function (mealName, catId, mealPrice,  mealOrder) {

        if (mealName === null || !mealName) {
            alert('Name cannot be null');
        }
        else {
            $scope.loading = true;

            var meal = new Meals({
              name: mealName,
              price: mealPrice
            });

            meal.$save({categoryId:catId}, function(data) {

                $scope.categories[$scope.selectedCategory].meals.push(data);

                // categoryName = null;
                $scope.loading = false;
                // $scope.$apply();

            }, function(errorResponse) {
              alert(errorResponse.data.message);
              $scope.error = errorResponse.data.message;
            });
        }
    };


    $scope.editMealFunction = function(m){

      var meal = new Meals(m);

      meal.$update({
        categoryId:$scope.categories[$scope.selectedCategory]._id,
        mealId: m._id}, function(data) {

          $scope.loading = false;
          $scope.categories[$scope.selectedCategory].meals[$scope.selectedMeal] = data;
          // $scope.$apply();

      }, function(errorResponse) {
        alert(errorResponse.data.message);
        $scope.error = errorResponse.data.message;
      });
    };

    var isEditingMealImage = false; // special case for meal image

    $scope.editOptionsMeals = function (searchName, $index, meal) {
        isEditingMealImage = true;
        showRightMenu();

        if (!meal.Image)
            $('#rightTab a[href="#image"]').tab('show'); // Select tab by name
        else
            $('#rightTab a[href="#options"]').tab('show'); // Select tab by name

        $scope.selectedMeal = $index;
        $scope.editingImage = true;
        $scope.searchInput = $scope.categories[$scope.selectedCategory].name;
        // $scope.SeachForImages();
    };


    $scope.editOptionsCats = function (searchName, $index) {
        showRightMenu();
        $('#rightTab a[href="#image"]').tab('show'); // Select tab by name
        $scope.selectedCategory = $index;
        isEditingMealImage = false;
        $scope.editingImage = true;
        $scope.searchInput = searchName;
        // $scope.SeachForImages();
    };

    var showRightMenu = function () {
        $('.nunchl-right-menuCreation').css({
            background: 'rgba(255, 255, 255, 1)',
            'visibility': 'visible'
            //height: 'auto'
        }).animate({ width: '800px' });

        rightMenuIsOpen = true;
    };

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

    //FILE UPLOAD STUFFF
    //-------------------------------------------------
    //-------------------------------------------------
    //-------------------------------------------------
    // var url = window.URL || window.webkitURL; // alternate use

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

    $(':file').change(function () {

        var file = this.files[0];
        var filename = file.name;
        var size = file.size;
        var type = file.type;

        readImage(file);
        $scope._now = $.now();

        filename = $scope._now + '_' + filename;
        $('#filename').val(filename);

        //reset jcrop
        if (jcroptedOnce) {
            var JcropAPI = image.data('Jcrop');
            JcropAPI.destroy();
        }
        //Your validation
    });


    function Upload() {
      console.log('IMAGECROPTRAITMENT');
        //var formData = new FormData($('form')[0]);
        var formData = new FormData($('#myform')[0]);
        $('#uploadPreview').html('<h4>Uploading.. plz wait..</h4><img src="../../../Content/site_base/progress-loading.gif" />');
        $scope.loading = true;
        $scope.$apply();

        $.ajax({
            url: '/file-upload',  //Server script to process data
            type: 'POST',
            xhr: function () {  // Custom XMLHttpRequest
                var myXhr = $.ajaxSettings.xhr();
                if (myXhr.upload) { // Check if upload property exists
                    //myXhr.upload.addEventListener('progress', progressHandlingFunction, false); // For handling the progress of the upload
                    console.log(myXhr);
                }
                return myXhr;
            },
            //Ajax events
            beforeSend: function () {

            },
            success: function (stuff, status, data) {

                console.log(data);
                $scope.fileName = data.responseText;

                var index = $scope.fileName.indexOf('.');
                $scope._extension = $scope.fileName.substring(index);

                $scope.toggleImageUploaded();

                $('#uploadPreview').html('<h4>Done..</h4>');
                $scope.loading = false;
                $scope.$apply();
                new ImageCropTraitment();

            },
            error: function () {
                $('#uploadPreview').html('<h4>error during the upload.</h4>');
            },
            // Form data
            data: formData,
            //Options to tell jQuery not to process data or worry about content-type.
            cache: false,
            contentType: false,
            processData: false
        });
    }

    $scope.fileName = '';
    $scope._now = '';
    $scope.imageUploaded = false;

    $scope.toggleImageUploaded = function () {
        $scope.imageUploaded = true;
        return $scope.imageUploaded;
    };

    $scope.isImageUploaded = function () {
        return $scope.imageUploaded;
    };

    function progressHandlingFunction(e) {
        if (e.lengthComputable) {
            $('progress').attr({ value: e.loaded, max: e.total });
        }
    }


    function readImage(file) {

        console.log('reading the file');

        var reader = new FileReader();
        var image = new Image();

        reader.readAsDataURL(file);
        reader.onload = function (_file) {
            image.src = _file.target.result;              // url.createObjectURL(file);

            image.onload = function () {
                var w = this.width,
                    h = this.height,
                    t = file.type,                           // ext only: // file.type.split('/')[1],
                    n = file.name,
                    s = ~~(file.size / 1024);

                if (s > 10000) {
                    $('#uploadPreview').html('<h4>Image size too big! max size 10 MB </h4>');
                } else {

                    if (w >= MEALIMAGE_WIDTH && h >= MEALIMAGE_HEIGHT) {
                        //$('#uploadPreview').html('<img style="width:150px;" src="' + this.src + '"> ' + w + 'x' + h + ' ' + s + ' ' + t + ' ' + n);
                        new Upload();
                    }
                    else {
                        $('#uploadPreview').html('<h4>Image to small! Min Size 310x110 </h4>');
                    }

                }
            };
            image.onerror = function () {
                alert('Invalid file type: ' + file.type);
            };
        };
    }

    $('#choose').change(function (e) {
        if (this.disabled) return alert('File upload not supported!');
        var F = this.files;
        if (F && F[0]) for (var i = 0; i < F.length; i++) readImage(F[i]);
    });

    var image = ''; //needed for the jcrop thing
    var jcroptedOnce = false;

    function ImageCropTraitment() {
        var url = '';
        var cropInfo = {}; //storing crop info here

        var image = $('#photoCrop');

        //Trim the querystring off the image URL.
        var path = image.attr('src'); if (path.indexOf('?') > 0) path = path.substr(0, path.indexOf('?'));

        //Define a function to execute when the cropping rectangle changes.
        var update = function (coords) {
          console.log('in the update function');

            if (parseInt(coords.w) <= 0 || parseInt(coords.h) <= 0) return; //Require valid width and height

            //Build the URL based on the coordiantes. The resizing module will handle everything else.
            url = path + '?crop=(' + coords.x + ',' + coords.y + ',' + coords.x2 + ',' + coords.y2 +
            ')&cropxunits=' + image.width() + '&cropyunits=' + image.height();

            cropInfo.width = coords.x2;
            cropInfo.height = coords.y2;
            cropInfo.x = coords.x;
            cropInfo.y = coords.y;
            cropInfo.w = coords.w;
            cropInfo.h = coords.h;
            cropInfo.path = path;
            cropInfo.resizeWidth = image.width();
            cropInfo.resizeHeight = image.height();

            console.log('oO ' + coords.w  + ' ' + coords.h);


            // gm("img.png").crop(width, height, x, y)

            //Now, update the link 'href' (you could update a hidden field just as easily)
            // $('.image-cropper').find('a.result').attr('href', url);
            //
            // urlToPost = url;

            console.log(url);

            //preview work
            var rx = MEALIMAGE_WIDTH / coords.w;
            var ry = MEALIMAGE_HEIGHT / coords.h;

            var photoX = $('#photoCrop').width();
            var photoY = $('#photoCrop').height();

            jcroptedOnce = true;

            $('#preview').css({
                width: Math.round(rx * photoX) + 'px',
                height: Math.round(ry * photoY) + 'px',
                marginLeft: '-' + Math.round(rx * coords.x) + 'px',
                marginTop: '-' + Math.round(ry * coords.y) + 'px'
            });
          };

        //Start up jCrop on the image, specifying our function be called when the selection rectangle changes,
        //     // and that a 60% black shadow should cover the cropped regions.
        image.Jcrop({
            setSelect: [0, 0, MEALIMAGE_WIDTH, MEALIMAGE_HEIGHT],
            aspectRatio: MEALIMAGE_WIDTH / MEALIMAGE_HEIGHT,
            allowSelect: false,
            allowMove: true,
            //allowResize: false,
            onChange: update,
            onSelect: update,
            bgColor: 'black',
            bgOpacity: 0.5
            //addClass: 'jcrop-dark'
        });

        // $.Jcrop(image,{
        //     setSelect: [0, 0, 310, 110],
        //     aspectRatio: 310 / 110,
        //     allowSelect: false,
        //     allowMove: true,
        //     //allowResize: false,
        //     onChange: update,
        //     onSelect: update,
        //     bgColor: 'black',
        //     bgOpacity: 0.5
        //     //addClass: 'jcrop-dark'
        // });

        $('#validateCrop').click(function (event) {
            event.preventDefault();

            if ($scope.categories[$scope.selectedCategory].name) {
                if (!isEditingMealImage) {

                    $.post('/file-upload/resize/categories',
                        {
                            cropInfo: cropInfo,
                            item_Id: $scope.categories[$scope.selectedCategory]._id

                        }).done(function (result, status, msg) {

                            console.log(result);
                            // //Reset JCROP
                            var JcropAPI = image.data('Jcrop');
                            JcropAPI.destroy();

                            // //clear the file (workaround)
                            var control = $('#iUpload');
                            control.replaceWith(control = control.clone(true));
                            control.val('');
                            //
                            $scope.imageUploaded = false;
                            //
                            $scope.categories[$scope.selectedCategory].image = result;
                            $scope.editingImage = false;
                            firstClickToOpen = false;
                            hideRightMenu();
                            $scope.$apply();

                        }).fail(function (data) {
                            alert(data.statusText);
                        });
                }//if isEditingMealImage
                else {
                    $.post('/file-upload/resize/meals',
                    {
                        cropInfo: cropInfo,
                        item_Id: $scope.categories[$scope.selectedCategory].meals[$scope.selectedMeal]._id

                    }).done(function (result, status, msg) {

                        console.log(result);
                        // //Reset JCROP
                        var JcropAPI = image.data('Jcrop');
                        JcropAPI.destroy();

                        // //clear the file (workaround)
                        var control = $('#iUpload');
                        control.replaceWith(control = control.clone(true));
                        control.val('');
                        //
                        $scope.imageUploaded = false;
                        //
                        $scope.categories[$scope.selectedCategory].meals[$scope.selectedMeal].image = result;
                        $scope.editingImage = false;
                        firstClickToOpen = false;
                        hideRightMenu();
                        $scope.$apply();

                    }).fail(function (data) {
                        alert(data.statusText);
                    });
                }
            }
        });
    }

    var hideRightMenu = function () {
        $('.nunchl-right-menuCreation').css({
            'visibility': 'hidden',
            background: 'none',

        }).animate({ width: '0' });

        rightMenuIsOpen = false;
    };


  }
]);
