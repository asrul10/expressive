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

    .controller('TableCtrl', function($scope, $location, $q, $mdDialog, user) {
        $scope.pagination = {
            page: 1,
            limit: 5
        };
        $scope.order = 'firstName';
        $scope.selected = [];
        var offset = 0;
        var sort = 'ASC';

        function getUser(params) {
            var deferred = $q.defer();
            $scope.promise = deferred.promise;

            params.attributes = ['firstName', 'lastName', 'email', 'id'];
            if (!params.order) {
                params.order = 'firstName';
            }
            user.getUsers(params).then(function(res) {
                $scope.users = res.data.users;
                $scope.pagination.total = res.data.countAll;
                deferred.resolve();
            }, function(err) {
                $location.path('/login');
            });
        }

        function reloadUser() {
            getUser({
                limit: $scope.pagination.limit,
                offset: offset,
                order: $scope.order.replace('-', ''),
                sort: sort
            });
            $scope.selected = [];
        }

        getUser({limit: $scope.pagination.limit});

        $scope.onReorder = function(order) {
            sort = 'ASC';
            if (!order.indexOf('-')) {
                sort = 'DESC'; 
                order = order.replace('-', '');
            }
            getUser({
                limit: $scope.pagination.limit,
                offset: offset,
                order: order,
                sort: sort
            });
        };

        $scope.onPaginate = function(page, limit) {
            offset = (page - 1) * limit;
            getUser({
                limit: limit, 
                offset: offset,
                order: $scope.order.replace('-', ''),
                sort: sort
            });
        };

        $scope.delete = function() {
            var id = [];
            $scope.selected.forEach( function(element, index) {
                id.push(element.id);
            });
            var params = {id: id};

            user.deleteUser(params).then(function(res) {
                reloadUser();
            });
        };

        $scope.addUser = function(ev) {
            $mdDialog.show({
                controller: addFunction,
                templateUrl: 'templates/add.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            }).then(function() {
            });
        };

        function addFunction($scope, $mdDialog) {
            $scope.save = function() {
                var data = this.user;
                user.addUser(data).then(function(res) {
                    console.log(res);
                    if (res.data.success) {
                        reloadUser();
                        $mdDialog.hide();
                    } else {
                        $scope.formMessage = res.data.message;
                    }
                });
            };

            $scope.close = function() {
                $mdDialog.cancel();
            };
        }
    });