/*
 * Service module
 */
(function(window, angular, undefined) {
'use strict';

angular.module('Service', [])
	// Initial page
	.factory('Page', [function () {
		var title = 'Expressive';

		return {
			title: function() {
				return title;
			},
			setTitle: function(newTitle) {
				title = newTitle;
			}
		};
	}])

	// Auth
	.factory('Auth', function($resource) {
		return $resource('/api/auth');
	})

	// User
	.factory('User', function($resource) {
		return $resource('/api/user/:id', { id: '@_id' }, {
			update: {
				method: 'PUT'
			}
		});
	})

	// Group
	.factory('Group', function($resource) {
		return $resource('/api/group/:id', { id: '@_id' }, {
			update: {
				method: 'PUT'
			}
		});
	})
	
	.service('group', function($http) {
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