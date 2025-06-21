var app = angular.module('myApp', ['ui.router']);
 
app.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('home', {
            url: '/Home',
            views: {
                'homeView': {
                    templateUrl: 'Home.html',
                    controller: 'homeController'
                }
            }
        })
        .state('aboutUs', {
            url: '/AboutUs',
            views: {
                'mainView': {
                    templateUrl: 'AboutUs.html',
                    controller: 'aboutUsController'
                }
            }
        })
        .state('treatment', {
            url: '/Treatment',
            views: {
                'mainView': {
                    templateUrl: 'Treatment.html',
                    controller: 'treatmentController'
                }
            }
        })
        .state('photogallery', {
            url: '/Photogallery',
            views: {
                'mainView': {
                    templateUrl: 'Photogallery.html',
                    controller: 'photoGalleryController'
                }
            }
        })
        .state('contactUs', {
            url: '/ContactUs',
            views: {
                'mainView': {
                    templateUrl: 'ContactUs.html',
                    controller: 'contactUsController'
                }
            }
        });
 
    $urlRouterProvider.otherwise('/AboutUs');
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
    $rootScope.$on('$viewContentLoaded', function() 
    {
     
        
        Appcommon.InitAOS_d_1000();
        Appcommon.InitIsotope();

    });













    
});





