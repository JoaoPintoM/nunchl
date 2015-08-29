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


angular.module('restaurants').controller('CreateRestaurantsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Restaurants',
function($scope, $stateParams, $location, Authentication, Restaurants) {
    $scope.authentication = Authentication;

    $scope.create = function() {

      var restaurants = new Restaurants({
        name: this.name,
        description: this.description,
        logo: this.logo
      });

      restaurants.$save(function(response) {
        $scope.authentication.user.restaurateur = true;
        $location.path('restaurants/my');

        $scope.name = '';
        $scope.description = '';

      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };


    $scope.mainInfoFilled = false;
    $scope.imageUploaded = false;
    $scope._selectedCountry = '';
    $scope._restoNameTrimmed = '';
    $scope._extension = '';
    $scope._now = '';
    $scope.picValidated = false;

    $scope.geoCodeResult = [];

    $scope.CheckMainInfo = function () {
      return $scope.mainInfoFilled;
    };

    $scope.toggleImageUploaded = function () {
      $scope.imageUploaded = true;
      return $scope.imageUploaded;
    };

    $scope.isImageUploaded = function () {
      //$scope.imageUploaded = $scope.imageUploaded;
      return $scope.imageUploaded;
    };

    // $scope.createRestaurant = function () {
    //   $.post("/Uploads/CropImageRestaurant",
    //   {
    //     imageCroppedUrl: urlToPost
    //   })
    //   .done(function (data) {
    //     toastr.success(data);
    //   }).error(function (data) {
    //     toastr.error("error : " + data);
    //   });
    // };


    //toggle between true or false
    $scope.toggleInfoFilled = function () {
      // if ($(':checkbox:checked').length === 4) {
      //   if ($scope.mainInfoFilled) {
      //     $scope.mainInfoFilled = false;
      //   }
      //   else {
          if ($('#restaurantName').val() && $('#AddressName').val() && $scope.selectedResult) {
            $scope.mainInfoFilled = true;
            $('#fieldset').prop('disabled', true);
          }
          else {
            alert('Please fill all the fields');
          }
        // }
      // } else {
      //   alert('You must select 3 categories');
      // }
      return $scope.mainInfoFilled;
    };

    $scope.UpdateTrim = function () {
      restoNameTrimmed = $scope.name.replace(/[^a-z0-9\s]/gi, '').toLowerCase();
      restoNameTrimmed = restoNameTrimmed.replace(/[_\s]/g, '_');
      $scope._restoNameTrimmed = restoNameTrimmed;
    };


    //geocoding
    //if the address field lose the focus ->
    //If Contains info -> GeoCode
    $('#AddressName').focusout(function () {
      $scope.validateAddress();
    });

    $('#AddressName').keypress(function (e) {
      if (e.which === 13) {
        $('#AddressName').blur(); // Removing the focus from AddressName will call validateAddress Cause already defined
      }
    });

    $scope.validateAddress = function () {
      if ($('#AddressName').val()) {

        $('#group-address').removeClass('has-error');
        $scope.geoCode();

      } else {
        $('#group-address').addClass('has-error');
      }
    };

    $scope.geoCode = function () {
      var address = document.getElementById('AddressName').value;

      if (address) {

        //address += ' ' + $('#ZipCode').val();
        address += ' ' + $('#Countries option:selected').text();

        geocoder.geocode({ 'address': address }, function (results, status) {
          if (status === google.maps.GeocoderStatus.OK) {

            $scope.geoCodeResult = results;
            $scope.$apply();

          } else {
            // if address invalid
            alert('Address Invalid : ' + status);
            $('#group-address').addClass('has-error');
            $scope.geoCodeResult = [];
          }
        });
      } else {
        $('#group-address').addClass('has-error');
        alert('Address not filled');
      }
    };


    $scope.selectedResult = false;

    //Select from the Geocode results provided by Google.
    $scope.selectResult = function ($index) {

      $('#AddressName').val($scope.geoCodeResult[$index].formatted_address);
      $('#location').val($scope.geoCodeResult[$index].geometry.location);

      //pour chaque comp
      $.each($scope.geoCodeResult[$index].address_components, function (iComp, component) {
        switch (component.types[0]) {
          case 'street_number':
            $('#street_number').val(component.long_name);
          break;
          case 'route':
            $('#route').val(component.long_name);
          break;
          case 'locality':
            $('#locality').val(component.long_name);
          break;
          case 'administrative_area_level_1':
            $('#administrative_area_level_1').val(component.long_name);
          break;
          case 'administrative_area_level_2':
            $('#administrative_area_level_2').val(component.long_name);
          break;
          case 'country':
          break;
          case 'postal_code':
            $('#ZipCode').val(component.long_name); // change the actual zipcode..
          break;
          case 'sublocality':
          break;
          case 'subpremise':
          break;
          case 'etablishment':
          break;
          case 'point_of_interest':
          break;
          case 'administrative_area_level_3':
          break;
          default:
          console.log(component.types[0] + ' not managed : value = ' + component.long_name);
        }
      });

      $scope.geoCodeResult = [];

      //$('#group-zipcode').addClass('has-success');
      $('#group-address').addClass('has-success');

      $scope.selectedResult = true;

      setTimeout(function () { //small animation
      //$('#group-zipcode').removeClass('has-success');
        $('#group-address').removeClass('has-success');
      }, 2000);

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

var image = ''; //needed for the jcrop thing
var jcroptedOnce = false;


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

        if (w >= 260 && h >= 150) {
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
} //readfile


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
}//upload



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
      var rx = 260 / coords.w;
      var ry = 150 / coords.h;

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
      setSelect: [0, 0, 260, 150],
      aspectRatio: 260 / 150,
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

          $.post('/file-upload/resize/restaurants',
          {
            cropInfo: cropInfo
            // item_Id: $scope.categories[$scope.selectedCategory]._id

          }).done(function (result, status, msg) {

            // alert(result);
            $scope.logo = result;
            // //Reset JCROP
            var JcropAPI = image.data('Jcrop');
            JcropAPI.destroy();

            // //clear the file (workaround)
            var control = $('#iUpload');
            control.replaceWith(control = control.clone(true));
            control.val('');
            //
            $scope.imageUploaded = false;


            $scope.$apply();

          }).fail(function (data) {
            alert(data.statusText);
          });

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






//
// var image = ''; //needed for the jcrop thing
// var jcroptedOnce = false;
// var JcropAPI;
//
//
// function ImageCropTraitment() {
//   //Using the 'each' pattern allows multiple cropping image/link pairs per page.
//   $('.image-cropper').each(function (unusedIndex, container) {
//     container = $(container); //We were passed a DOM reference, convert it to a jquery object
//
//     //Find the image inside 'container' by class ("image")
//     var image = container.find('img.image');
//
//     //Trim the querystring off the image URL.
//     var path = image.attr('src'); if (path.indexOf('?') > 0) path = path.substr(0, path.indexOf('?'));
//
//     //Define a function to execute when the cropping rectangle changes.
//     var update = function (coords) {
//       if (parseInt(coords.w) <= 0 || parseInt(coords.h) <= 0) return; //Require valid width and height
//
//         //Build the URL based on the coordiantes. The resizing module will handle everything else.
//         var url = path + '?crop=(' + coords.x + ',' + coords.y + ',' + coords.x2 + ',' + coords.y2 +
//         ')&cropxunits=' + image.width() + '&cropyunits=' + image.height();
//
//         //Now, update the link 'href' (you could update a hidden field just as easily)
//         container.find('a.result').attr('href', url);
//
//         urlToPost = url;
//
//         var rx = 260 / coords.w;
//         var ry = 150 / coords.h;
//
//         photoX = $('#photoCrop').width();
//         photoY = $('#photoCrop').height();
//
//         jcroptedOnce = true;
//
//         $('#preview').css({
//           width: Math.round(rx * photoX) + 'px',
//           height: Math.round(ry * photoY) + 'px',
//           marginLeft: '-' + Math.round(rx * coords.x) + 'px',
//           marginTop: '-' + Math.round(ry * coords.y) + 'px'
//         });
//       };
//
//       //Start up jCrop on the image, specifying our function be called when the selection rectangle changes,
//       // and that a 60% black shadow should cover the cropped regions.
//       image.Jcrop({
//         setSelect: [0, 0, 260, 150],
//         aspectRatio: 260 / 150,
//         allowSelect: false,
//         allowMove: true,
//         //allowResize: false,
//         onChange: update,
//         onSelect: update,
//         bgColor: 'black',
//         bgOpacity: 0.5
//         //addClass: 'jcrop-dark'
//       });
//
//
//     });
//
//     $('#validateCrop').click(function (event) {
//       event.preventDefault();
//
//       $.post('/Uploads/CropImageRestaurant',
//       {
//         imageCroppedUrl: urlToPost
//       }).done(function (result, status, msg) {
//         toastr.success('Image cropped posted :' + msg.statusText);
//         $('#Logo').val(msg.statusText);
//         //$('#btnSubmitForm').prop('disabled', false);
//         $scope.picValidated = true;
//         $('#fieldset').prop('disabled', false);
//         $scope.$apply();
//         $('#btnSubmitForm').click();
//
//       }).fail(function (data) {
//         toastr.error(data.statusText);
//       });
//     });
//   }
//
//
//   $scope.editMainInfo = function () {
//
//     JcropAPI = $('#photoCrop').data('Jcrop');
//     if (JcropAPI)
//       JcropAPI.destroy();
//
//       $scope.imageUploaded = false;
//       $scope.showUpBtn = false;
//
//       $('#fieldset').prop('disabled', false);
//       $scope.mainInfoFilled = false;
//     };
//
//     //FILE UPLOAD STUFFF
//     //-------------------------------------------------
//     //-------------------------------------------------
//     //-------------------------------------------------
//     // var url = window.URL || window.webkitURL; // alternate use
//
//     $scope.showUpBtn = false;
//     $scope.showUploadButton = function () {
//       return $scope.showUpBtn;
//     };
//
//     $(':file').change(function () {
//
//       var file = this.files[0];
//       var filename = file.name;
//       var size = file.size;
//       var type = file.type;
//
//       readImage(file);
//       $scope._now = $.now();
//
//       selectedCountry = $('#Countries option:selected').val();// will be needed to store image in tempfile prefixed by Country ISO : eg. FR/myImage.jpg
//       $scope._selectedCountry = selectedCountry;
//       filename = selectedCountry + '/' + $scope._now + '_' + restoNameTrimmed;
//       $('#filename').val(filename);
//       //Your validation
//
//       //reset jcrop
//       if (jcroptedOnce) {
//         //JcropAPI = image.data('Jcrop');
//
//         JcropAPI = $('#photoCrop').data('Jcrop');
//         JcropAPI.destroy();
//
//         $scope.imageUploaded = false;
//         $scope.$apply();
//       }
//
//     });
//
//
//     $('#buttonUpload').click(function () {
//       //var formData = new FormData($('form')[0]);
//       var formData = new FormData($('#myform')[0]);
//
//       $.ajax({
//         url: '/Uploads/UploadTempRestaurant',  //Server script to process data
//         type: 'POST',
//         xhr: function () {  // Custom XMLHttpRequest
//           var myXhr = $.ajaxSettings.xhr();
//           if (myXhr.upload) { // Check if upload property exists
//             //myXhr.upload.addEventListener('progress', progressHandlingFunction, false); // For handling the progress of the upload
//           }
//           return myXhr;
//         },
//         //Ajax events
//         beforeSend: function () {
//
//         },
//         success: function (response, status, data) {
//
//           var fileName = data.statusText;
//
//           var index = fileName.indexOf(".");
//           $scope._extension = fileName.substring(index);
//
//           $scope.toggleImageUploaded();
//
//           $scope.$apply();
//           ImageCropTraitment();
//         },
//         error: function () {
//
//         },
//         // Form data
//         data: formData,
//         //Options to tell jQuery not to process data or worry about content-type.
//         cache: false,
//         contentType: false,
//         processData: false
//       });
//     });
//
//
//     function progressHandlingFunction(e) {
//       if (e.lengthComputable) {
//         $('progress').attr({ value: e.loaded, max: e.total });
//       }
//     }
//
//
//     function readImage(file) {
//
//       var reader = new FileReader();
//       var image = new Image();
//
//       reader.readAsDataURL(file);
//       reader.onload = function (_file) {
//         image.src = _file.target.result;              // url.createObjectURL(file);
//         image.onload = function () {
//           var w = this.width,
//           h = this.height,
//           t = file.type,                           // ext only: // file.type.split('/')[1],
//           n = file.name,
//           s = ~~(file.size / 1024) + 'KB';
//
//           if (w >= 260 && h >= 150) {
//             //toastr.error('<img src="' + this.src + '"> ' + w + 'x' + h + ' ' + s + ' ' + t + ' ' + n);
//             $('#uploadPreview').html('<img src="' + this.src + '"> ' + w + 'x' + h + ' ' + s + ' ' + t + ' ' + n);
//             $scope.showUpBtn = true;
//             $scope.$apply();
//           }
//           else {
//             $('#uploadPreview').html('<h4>Image to small! Min Size 260x150 </h4>');
//           }
//
//
//         };
//         image.onerror = function () {
//           alert('Invalid file type: ' + file.type);
//         };
//       };
//
//     };
//
//     $('#choose').change(function (e) {
//       if (this.disabled) return alert('File upload not supported!');
//       var F = this.files;
//       if (F && F[0]) for (var i = 0; i < F.length; i++) readImage(F[i]);
//     });
//


//END FILE UPLOAD STUFF
}
]);
