angular.module('App', [
    "ngRoute", 
    "ngResource",
    "ngCookies", 
    "ngMaterial", 
    "ngMessages", 
    "md.data.table",
    "Service", 
    "Controller"
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
            .when('/groups', {
                templateUrl: '/templates/groups.html',
                controller: 'GroupsCtrl'
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
    .directive('sideNav', function () {
        return {
            restrict: 'E',
            templateUrl: 'templates/side-nav.html'
        };
    });