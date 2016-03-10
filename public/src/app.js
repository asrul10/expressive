var app = angular.module('App', ["ngRoute", "ngMaterial"]);

// Route
app
.config(function($routeProvider, $locationProvider) {
    $routeProvider
    	.when('/login', {
    		templateUrl: "/template/login.html",
    		controller: "LoginCtrl"
    	})
        .when('/home', {
            template: '<h1>Home Page</h1>',
            controller: 'HomeCtrl'
        })
        .when('/about', {
            template: '<h1>About Page</h1>',
            controller: 'AboutCtrl'
        })
        .otherwise({
            redirectTo : '/home'
        });

    $locationProvider.html5Mode(true);
});

// Controller
app
.controller('NavCtrl', function($scope, $mdSidenav) {
    $scope.toggleLeft = function() {
	    $mdSidenav('left').toggle();
	};
	$scope.close = function () {
		$mdSidenav('left').close()
	};
})

.controller('LoginCtrl', function($scope) {
	$scope.doLogin = function() {
		console.log(this.user);
	}
	console.log('Login page');
})

.controller('HomeCtrl', function($scope, $location) {
	// $location.path('/login');
    console.log("Hallo");
})

.controller('AboutCtrl', function($scope) {
	console.log("About");
});
