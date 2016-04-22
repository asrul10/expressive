/*
 * Controller module
 */
(function(window, angular, undefined) {
    'use strict';

    var app = angular.module('Controller', []);
    app.controller('MainCtrl', function($scope, $mdSidenav, $location, $cookies, $window, $timeout, Auth) {
        $scope.height = $window.innerHeight;

        Auth.get(function(res) {
            var adminUser = JSON.parse(res.user.groups);
            var adminId = 1;
            var username = res.user.name.split(' ');

            $scope.loggedin = true;
            $scope.username = username[0];
            if (adminUser.indexOf(adminId) < 0) {
                $scope.admin = false;
            } else {
                $scope.admin = true;
            }
        }, function(err) {
            $scope.loggedin = false;
        });

        $scope.searchButton = function() {
            $scope.searchToolbar = true;
            $timeout(function() {
                document.getElementById('searchToolbarFocus').focus();
            }, 100);
        };

        $scope.toggleLeft = function() {
            $mdSidenav('left').toggle();
        };

        $scope.close = function() {
            $mdSidenav('left').close();
        };

        $scope.logout = function() {
            $cookies.remove('token');
            $window.location.href = '/signin';
        };
    });

    app.controller('IntroductionCtrl', function($scope) {
        // Do magic think here
    });

    app.controller('DashboardCtrl', function($scope) {
        // Do magic think here
    });

    app.controller('ToDoCtrl', function($scope) {
        var todos = [
            {
                id: 1,
                title: 'Title',
                todo: 'Lorem',
                color: '#64B5F6',
                check: []
            },
            {
                id: 2,
                title: 'Title 2',
                todo: 'Lorem',
                color: '#fff',
                check: []
            },
            {
                id: 3,
                title: 'Title 3',
                todo: '',
                color: '#FFF176',
                check: [
                    'Test baru sadjlk uwhau',
                    "asdklj wljawd",
                    "awdjlakwd"
                ]
            }
        ];

        $scope.todos = todos.reverse();

        $scope.todoSubmit = function(todo) {
            $scope.todos.unshift(todo);
            $scope.$apply();
        };

        $scope.todoUpdate = function(todo) {
            console.log(todo);
        };

        $scope.todoDelete = function(todo) {
            var id = $scope.todos.indexOf(todo);
            $scope.todos.splice(id, 1);
        };
    });

    app.controller('SignInCtrl', function($scope, $window, $cookies, $location, Auth) {
        $scope.promise = false;
        $scope.noNav = true;

        $scope.doLogin = function() {
            $scope.message = false;
            $scope.promise = true;
            Auth.save(this.user, function(res) {
                $cookies.put('token', res.token);
                if (res.success) {
                    $window.location.href = '/';
                } else {
                    $scope.promise = false;
                    $scope.message = res.message;
                }
            }, function(err) {
                $scope.promise = false;
                console.log(err);
            });
        };
    });

    app.controller('SignUpCtrl', function($scope, $window, $cookies, $location, User, Auth) {
        $scope.doSignUp = function() {
            $scope.message = false;
            User.save(this.user, function(res) {
                if (res.success) {
                    $scope.promise = true;
                    Auth.save($scope.user, function(res) {
                        $cookies.put('token', res.token);
                        if (res.success) {
                            $window.location.href = '/dashboard';
                        } else {
                            $scope.promise = false;
                            $scope.message = res.message;
                        }
                    }, function(err) {
                        $scope.promise = false;
                        console.log(err);
                    });
                } else {
                    $scope.message = res.message;
                }
            });
        };
    });

    app.controller('SandboxCtrl', function($scope, $window, $q, $mdDialog, Sandbox) {
        $scope.pagination = {
            page: 1,
            limit: 5
        };
        $scope.order = 'name';
        $scope.selected = [];
        var offset = 0;
        var sort = 'ASC';

        function getSandbox(params) {
            var deferred = $q.defer();
            $scope.promise = deferred.promise;

            params.attributes = ['name', 'id', 'address', 'gender'];
            if (!params.order) {
                params.order = 'name';
            }
            Sandbox.get(params, function(res) {
                $scope.sandbox = res.sandbox;
                $scope.pagination.total = res.countAll;
                deferred.resolve();
            }, function(err) {
                $window.location.href = '/signin';
            });
        }

        function reloadSandbox() {
            getSandbox({
                limit: $scope.pagination.limit,
                offset: offset,
                order: $scope.order.replace('-', ''),
                sort: sort,
                search: $scope.searchModel
            });
            $scope.selected = [];
        }

        $scope.onReorder = function(order) {
            sort = 'ASC';
            if (!order.indexOf('-')) {
                sort = 'DESC';
                order = order.replace('-', '');
            }
            getSandbox({
                limit: $scope.pagination.limit,
                offset: offset,
                order: order,
                sort: sort,
                search: $scope.searchModel
            });
        };

        $scope.onPaginate = function(page, limit) {
            offset = (page - 1) * limit;
            getSandbox({
                limit: limit,
                offset: offset,
                order: $scope.order.replace('-', ''),
                sort: sort,
                search: $scope.searchModel
            });
        };

        $scope.delete = function() {
            var id = [];
            $scope.selected.forEach(function(element, index) {
                id.push(element.id);
            });
            var params = {
                ids: id
            };

            Sandbox.delete(params, function(res) {
                reloadSandbox();
            });
        };

        $scope.$watch('searchModel', function() {
            if ($scope.searchModel) {
                getSandbox({
                    limit: $scope.pagination.limit,
                    order: $scope.order.replace('-', ''),
                    sort: sort,
                    search: $scope.searchModel
                });
                $scope.pagination.page = 1;
            } else {
                getSandbox({
                    limit: $scope.pagination.limit,
                    order: $scope.order.replace('-', ''),
                    sort: sort,
                    search: $scope.searchModel
                });
                $scope.pagination.page = 1;
            }
        });

        $scope.addSandbox = function(ev) {
            $mdDialog.show({
                controller: function($scope, $mdDialog) {
                    $scope.title = 'Add Sandbox';
                    $scope.save = function() {
                        Sandbox.save(this.sandbox, function(res) {
                            if (res.success) {
                                reloadSandbox();
                                $mdDialog.hide();
                            } else {
                                $scope.formMessage = res.message;
                            }
                        });
                    };

                    $scope.close = function() {
                        $mdDialog.cancel();
                    };
                },
                templateUrl: 'templates/form-sandbox.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            });
        };

        $scope.editSandbox = function(ev, id) {
            $mdDialog.show({
                controller: function($scope, $mdDialog) {
                    $scope.title = 'Edit Sandbox';
                    Sandbox.get({
                        id: id
                    }, function(res) {
                        $scope.sandbox = res;
                    }, function(err) {
                        console.log(err);
                    });

                    $scope.save = function() {
                        var id = this.sandbox.id;
                        Sandbox.update({
                            id: id
                        }, this.sandbox, function(res) {
                            if (res.success) {
                                reloadSandbox();
                                $mdDialog.hide();
                            } else {
                                $scope.formMessage = res.message;
                            }
                        });
                    };

                    $scope.close = function() {
                        $mdDialog.cancel();
                    };
                },
                templateUrl: 'templates/form-sandbox.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            });
        };
    });

    app.controller('UsersCtrl', function($scope, $window, $q, $mdDialog, User, Group) {
        $scope.pagination = {
            page: 1,
            limit: 5
        };
        $scope.order = 'name';
        $scope.selected = [];
        var offset = 0;
        var sort = 'ASC';

        function getUser(params) {
            var deferred = $q.defer();
            $scope.promise = deferred.promise;

            params.attributes = ['name', 'email', 'id'];
            if (!params.order) {
                params.order = 'name';
            }
            User.get(params, function(res) {
                $scope.users = res.users;
                $scope.pagination.total = res.countAll;
                deferred.resolve();
            }, function(err) {
                $window.location.href = '/signin';
            });
        }

        function reloadUser() {
            getUser({
                limit: $scope.pagination.limit,
                offset: offset,
                order: $scope.order.replace('-', ''),
                sort: sort,
                search: $scope.searchModel
            });
            $scope.selected = [];
        }

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
                sort: sort,
                search: $scope.searchModel
            });
        };

        $scope.onPaginate = function(page, limit) {
            offset = (page - 1) * limit;
            getUser({
                limit: limit,
                offset: offset,
                order: $scope.order.replace('-', ''),
                sort: sort,
                search: $scope.searchModel
            });
        };

        $scope.delete = function() {
            var id = [];
            $scope.selected.forEach(function(element, index) {
                id.push(element.id);
            });
            var params = {
                ids: id
            };

            User.delete(params, function(res) {
                reloadUser();
            });
        };

        $scope.$watch('searchModel', function() {
            if ($scope.searchModel) {
                getUser({
                    limit: $scope.pagination.limit,
                    order: $scope.order.replace('-', ''),
                    sort: sort,
                    search: $scope.searchModel
                });
            } else {
                getUser({
                    limit: $scope.pagination.limit
                });
            }
        });

        $scope.addUser = function(ev) {
            $mdDialog.show({
                controller: function($scope, $mdDialog) {
                    $scope.title = 'Add User';
                    $scope.selected = [1];
                    $scope.user = {
                        groups: '[1]'
                    };

                    Group.get(function(res) {
                        $scope.groups = res.groups;
                    });

                    $scope.toggle = function(item, list) {
                        var idx = list.indexOf(item);
                        if (idx > -1) list.splice(idx, 1);
                        else list.push(item);
                        $scope.user.groups = JSON.stringify(list);
                    };

                    $scope.exists = function(item, list) {
                        return list.indexOf(item) > -1;
                    };

                    $scope.save = function() {
                        User.save(this.user, function(res) {
                            if (res.success) {
                                reloadUser();
                                $mdDialog.hide();
                            } else {
                                $scope.formMessage = res.message;
                            }
                        });
                    };

                    $scope.close = function() {
                        $mdDialog.cancel();
                    };
                },
                templateUrl: 'templates/form-user.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            });
        };

        $scope.editUser = function(ev, id) {
            $mdDialog.show({
                controller: function($scope, $mdDialog) {
                    $scope.title = 'Edit User';
                    $scope.password = true;
                    $scope.selected = [];

                    Group.get(function(res) {
                        $scope.groups = res.groups;
                    });

                    $scope.toggle = function(item, list) {
                        var idx = list.indexOf(item);
                        if (idx > -1) list.splice(idx, 1);
                        else list.push(item);
                        $scope.user.groups = JSON.stringify(list);
                    };

                    $scope.exists = function(item, list) {
                        return list.indexOf(item) > -1;
                    };

                    User.get({
                        id: id
                    }, function(res) {
                        res.password = null;
                        $scope.user = res;
                        $scope.selected = JSON.parse(res.groups);
                    }, function(err) {
                        console.log(err);
                    });

                    $scope.save = function() {
                        var id = this.user.id;

                        User.update({
                            id: id
                        }, this.user, function(res) {
                            if (res.success) {
                                reloadUser();
                                $mdDialog.hide();
                            } else {
                                $scope.formMessage = res.message;
                            }
                        });
                    };

                    $scope.close = function() {
                        $mdDialog.cancel();
                    };
                },
                templateUrl: 'templates/form-user.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            });
        };
    });

    app.controller('GroupsCtrl', function($scope, $window, $q, $mdDialog, Group) {
        $scope.pagination = {
            page: 1,
            limit: 5
        };
        $scope.order = 'groupName';
        $scope.selected = [];
        var offset = 0;
        var sort = 'ASC';

        function getGroup(params) {
            var deferred = $q.defer();
            $scope.promise = deferred.promise;

            params.attributes = ['groupName', 'id'];
            if (!params.order) {
                params.order = 'groupName';
            }
            Group.get(params, function(res) {
                $scope.groups = res.groups;
                $scope.pagination.total = res.countAll;
                deferred.resolve();
            }, function(err) {
                $window.location.href = '/signin';
            });
        }

        function reloadGroup() {
            getGroup({
                limit: $scope.pagination.limit,
                offset: offset,
                order: $scope.order.replace('-', ''),
                sort: sort,
                search: $scope.searchModel
            });
            $scope.selected = [];
        }

        $scope.onReorder = function(order) {
            sort = 'ASC';
            if (!order.indexOf('-')) {
                sort = 'DESC';
                order = order.replace('-', '');
            }
            getGroup({
                limit: $scope.pagination.limit,
                offset: offset,
                order: order,
                sort: sort,
                search: $scope.searchModel
            });
        };

        $scope.onPaginate = function(page, limit) {
            offset = (page - 1) * limit;
            getGroup({
                limit: limit,
                offset: offset,
                order: $scope.order.replace('-', ''),
                sort: sort,
                search: $scope.searchModel
            });
        };

        $scope.delete = function() {
            var id = [];
            $scope.selected.forEach(function(element, index) {
                id.push(element.id);
            });
            var params = {
                ids: id
            };

            Group.delete(params, function(res) {
                reloadGroup();
            });
        };

        $scope.$watch('searchModel', function() {
            if ($scope.searchModel) {
                getGroup({
                    limit: $scope.pagination.limit,
                    order: $scope.order.replace('-', ''),
                    sort: sort,
                    search: $scope.searchModel
                });
                $scope.pagination.page = 1;
            } else {
                getGroup({
                    limit: $scope.pagination.limit,
                    order: $scope.order.replace('-', ''),
                    sort: sort,
                    search: $scope.searchModel
                });
                $scope.pagination.page = 1;
            }
        });

        $scope.addGroup = function(ev) {
            $mdDialog.show({
                controller: function($scope, $mdDialog) {
                    $scope.title = 'Add Group';
                    $scope.save = function() {
                        Group.save(this.group, function(res) {
                            if (res.success) {
                                reloadGroup();
                                $mdDialog.hide();
                            } else {
                                $scope.formMessage = res.message;
                            }
                        });
                    };

                    $scope.close = function() {
                        $mdDialog.cancel();
                    };
                },
                templateUrl: 'templates/form-group.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            });
        };

        $scope.editGroup = function(ev, id) {
            $mdDialog.show({
                controller: function($scope, $mdDialog) {
                    $scope.title = 'Edit Group';
                    Group.get({
                        id: id
                    }, function(res) {
                        $scope.group = res;
                    }, function(err) {
                        console.log(err);
                    });

                    $scope.save = function() {
                        var id = this.group.id;
                        Group.update({
                            id: id
                        }, this.group, function(res) {
                            if (res.success) {
                                reloadGroup();
                                $mdDialog.hide();
                            } else {
                                $scope.formMessage = res.message;
                            }
                        });
                    };

                    $scope.close = function() {
                        $mdDialog.cancel();
                    };
                },
                templateUrl: 'templates/form-group.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            });
        };
    });
})(window, angular);
