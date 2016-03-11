var app = angular.module('App', ["ngRoute", "ngMaterial", "Service", "ngCookies", "md.data.table"]);

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
            .when('/user', {
                templateUrl: '/template/user.html',
                controller: 'UserCtrl'
            })
            .otherwise({
                redirectTo : '/home'
            });

        $locationProvider.html5Mode(true);
    })

    .config(function($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('blue')
            .accentPalette('light-blue');
    });

// Controller
app
    .controller('NavCtrl', function($scope, $mdSidenav, auth, $cookies, $window) {
        var userAuth = checkAuth($cookies, auth);
        $scope.loggedin = false;
        if (userAuth) {
            $scope.loggedin = true;
        }
        $scope.toggleLeft = function() {
    	    $mdSidenav('left').toggle();
    	};
    	$scope.close = function() {
    		$mdSidenav('left').close();
    	};
        $scope.logout = function() {
            $cookies.remove('token');
            $window.location.href = '/home';
        };
    })

    .controller('LoginCtrl', function($scope, $window, auth, $cookies, $location) {
        if (checkAuth($cookies, auth)) {
            $location.path('/home');
        }
    	$scope.doLogin = function() {
            auth.doLogin(this.user).then(function(res) {
                $cookies.put('token', res.data.token);
                if (res.data.success) {
                    $window.location.href = '/home';
                } else {
                    $scope.message = res.data.message;
                }
            }, function(err) {
                console.log(err);
            });
    	};
        var height = $window.innerHeight;
        $scope.top = height/6;
    })

    .controller('HomeCtrl', function($scope, $location) {
    	// $location.path('/login');
    })

    .controller('UserCtrl', function($scope, $location, user) {
        $scope.promise = false;
        user.getUsers().then(function(res) {
            $scope.promise = true;
            $scope.users = res.data;

            $scope.onReorder = function (order) {
                console.log(order);
            };
        }, function(err) {
            $location.path('/login');
        });
    });

function checkAuth($cookies, auth) {
    var token = $cookies.get('token');
    if (token) {
        return auth.checkLogin(token).then(function(res) {
                if (res.data.success) {
                    return res.data.user;
                } else {
                    return false;
                }
            }, function(err) {
                return false;
            });
    } else {
        return false;
    }
}