/*
 * App module
 */
(function(window, angular, undefined) {
  'use strict';

  angular.module('App', [
    "ngRoute",
    "ngResource",
    "ngCookies",
    "ngMaterial",
    "ngMessages",
    "md.data.table",
    "Expressive",
    "Service",
    "Controller"
  ])

  // Route
  .config(function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/dashboard', {
        title: 'Expressive : Dashboard',
        templateUrl: '/templates/dashboard.html',
        controller: 'DashboardCtrl'
      })
      .when('/login', {
        title: 'Expressive : Login',
        templateUrl: "/templates/login.html",
        controller: "LoginCtrl"
      })
      .when('/users', {
        title: 'Expressive : Users',
        templateUrl: '/templates/users.html',
        controller: 'UsersCtrl'
      })
      .when('/groups', {
        title: 'Expressive : Groups',
        templateUrl: '/templates/groups.html',
        controller: 'GroupsCtrl'
      })
      .otherwise({
        redirectTo: '/dashboard'
      });

    $locationProvider.html5Mode(true);
  })

  // Material Design
  .config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('blue')
      .accentPalette('pink');
  });
})(window, angular);
