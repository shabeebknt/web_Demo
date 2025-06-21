var app = angular.module('myApp', ['ui.router']);
 
app.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('home', {
            url: '/',
            views: {
                'homeView': {
                    templateUrl: 'pages/Home.html',
                    controller: 'homeController'
                }
            }
        })
        .state('aboutUs', {
            url: '/AboutUs',
            views: {
                'mainView': {
                    templateUrl: 'pages/AboutUs.html',
                    controller: 'aboutUsController'
                }
            }
        })
        .state('treatment', {
            url: '/Treatment',
            views: {
                'mainView': {
                    templateUrl: 'pages/Treatment.html',
                    controller: 'treatmentController'
                }
            }
        })
        .state('photogallery', {
            url: '/Photogallery',
            views: {
                'mainView': {
                    templateUrl: 'pages/Photogallery.html',
                    controller: 'photoGalleryController'
                }
            }
        })
        .state('contactUs', {
            url: '/ContactUs',
            views: {
                'mainView': {
                    templateUrl: 'pages/ContactUs.html',
                    controller: 'contactUsController'
                }
            }
        });
 
    $urlRouterProvider.otherwise('/');
});




app.controller('homeController', function($scope,$rootScope) {
    // Controller for Home.html
 
   
});

app.controller('aboutUsController', function($scope,$rootScope) {
   
   $rootScope.CurrentPage="About Us";
    
});

app.controller('treatmentController', function($scope,$rootScope) {
   $rootScope.CurrentPage="Our Treatment";
});

app.controller('photoGalleryController', function($scope,$rootScope) {
     $rootScope.CurrentPage="Photogallery";
});

app.controller('contactUsController', function($scope,$rootScope) {
    // Controller for ContactUs.html
   $rootScope.CurrentPage="Contact uS";
});

// Common function to run after view content is loaded
app.run(function($rootScope) {


  $rootScope.$on('$locationChangeStart', function(event, newUrl, oldUrl) {
       $('.navbar-collapse').removeClass('show');
  $("#loadingSpinner").removeClass("d-none");
   

    });

    $rootScope.$on('$viewContentLoaded', function()
    {
    
     $("#loadingSpinner").addClass("d-none");
   

       
        Appcommon.InitAOS_d_1000();
        Appcommon.InitIsotope();


    });
    
    // Attach a click event listener to all navigation links to show the loading spinner immediately.
    // This handles cases where the state might not change, but the user expects visual feedback on click.
  

    
});





 
