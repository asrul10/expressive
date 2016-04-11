/*
 * Service module
 */
(function(window, angular, undefined) {
    'use strict';

    var app = angular.module('Service', []);
    // Auth
    app.factory('Auth', function($resource) {
        return $resource('/api/auth');
    });

    // Sandbox
    app.factory('Sandbox', function($resource) {
        return $resource('/api/sandbox/:id', {
            id: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    });

    // User
    app.factory('User', function($resource) {
        return $resource('/api/user/:id', {
            id: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    });

    // Group
    app.factory('Group', function($resource) {
        return $resource('/api/group/:id', {
            id: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    });

    app.service('group', function($http) {
        var url = '/api/group';

        this.saveGroup = function(data) {
            return $http.post(url, data);
        };

        this.getGroups = function(params) {
            return $http.get(url, {
                params: params
            });
        };

        this.getGroup = function(id) {
            return $http.get(url + '/' + id);
        };

        this.deleteGroup = function(params) {
            return $http.delete(url, {
                params: params
            });
        };
    });
})(window, angular);
