angular.module('Controller', [])
    // Controller
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

    .controller('DashboardCtrl', function($scope, $location) {
        // $location.path('/login');
    })

    .controller('LoginCtrl', function($scope, $window, auth, $cookies, $location) {
        if (checkAuth($cookies, auth)) {
            $location.path('/home');
        }
        $scope.promise = false;
    	$scope.doLogin = function() {
            $scope.promise = true;
            auth.doLogin(this.user).then(function(res) {
                $cookies.put('token', res.data.token);
                console.log('tes');
                if (res.data.success) {
                    $window.location.href = '/home';
                } else {
                    $scope.promise = false;
                    $scope.message = res.data.message;
                }
            }, function(err) {
                $scope.promise = false;
                console.log(err);
            });
    	};
        var height = $window.innerHeight;
        $scope.top = height/6;
    })

    .controller('TableCtrl', function($scope, $location, $q, user) {
        $scope.pagination = {
            page: 1,
            limit: 5
        };

        function getUser(params) {
            var deferred = $q.defer();
            $scope.promise = deferred.promise;

            user.getUsers(params).then(function(res) {
                $scope.users = res.data.users;
                $scope.pagination.total = res.data.countAll;
                deferred.resolve();

                $scope.onReorder = function (order) {
                    console.log(order);
                };
            }, function(err) {
                $location.path('/login');
            });
        }
        getUser({limit: $scope.pagination.limit});

        $scope.onPaginate = function (page, limit) {
            var offset = (page - 1) * limit;
            getUser({
                limit: limit, 
                offset: offset
            });
        };
    });