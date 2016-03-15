angular.module('App', [
    "ngRoute", 
    "ngCookies", 
    "ngMaterial", 
    "ngMessages", 
    "Service", 
    "Function", 
    "Controller",
    "md.data.table"
])

    // Route
    .config(function($routeProvider, $locationProvider) {
        $routeProvider
            .when('/dashboard', {
                templateUrl: '/templates/dashboard.html',
                controller: 'DashboardCtrl'
            })
        	.when('/login', {
        		templateUrl: "/templates/login.html",
        		controller: "LoginCtrl"
        	})
            .when('/users', {
                templateUrl: '/templates/users.html',
                controller: 'UsersCtrl'
            })
            .otherwise({
                redirectTo : '/dashboard'
            });

        $locationProvider.html5Mode(true);
    })

    // Material Design
    .config(function($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('blue')
            .accentPalette('pink');
    })

    // Navigation
    .directive('navMenu', function () {
        return {
            restrict: 'E',
            templateUrl: 'templates/side-menu.html'
        };
    });