var app = angular.module('myApp', ['ngRoute']);

app.config(function($routeProvider) {
    $routeProvider
        .when('/Home', {
            templateUrl: 'Home.html',
            controller: 'homeController'
        })
        .when('/AboutUs', {
            templateUrl: 'AboutUs.html',
            controller: 'aboutUsController'
        })
        .when('/Treatment', {
            templateUrl: 'Treatment.html',
            controller: 'treatmentController'
        })
        .when('/Photogallery', {
            templateUrl: 'Photogallery.html',
            controller: 'photoGalleryController'
        })
        .when('/ContactUs', {
            templateUrl: 'ContactUs.html',
            controller: 'contactUsController'
        })
        .otherwise({
            redirectTo: '/Home'
        });

       
});

app.controller('homeController', function($scope,$rootScope) {
    // Controller for Home.html

  
});

app.controller('aboutUsController', function($scope,$rootScope) {
   
   $rootScope.CurrentPage="About Us";
    
});

app.controller('treatmentController', function($scope) {
    // Controller for Treatment.html
});

app.controller('photoGalleryController', function($scope) {
    // Controller for Photogallery.html
});

app.controller('contactUsController', function($scope) {
    // Controller for ContactUs.html
    console.log('ContactUsController initialized');
});

// Common function to run after view content is loaded
app.run(function($rootScope) {
    $rootScope.$on('$viewContentLoaded', function() 
    {
     
        Appcommon.InitAOS_d_1000();
        Appcommon.InitIsotope();

    });













    
});





