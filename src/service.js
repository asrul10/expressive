var app = angular.module('Service', ['ngCookies']);

app
	.service('auth', function($http) {
		var url = '/api/auth';

		this.doLogin = function(user) {
			return $http.post(url, user);
		};

		this.checkLogin = function(token) {
			return $http.get('/api/authenticated/?token=' + token);
		};
	})

	// User
	.service('user', function($http, $cookies) {
		var url = '/api/user';
        var token = $cookies.get('token');

        this.saveUser = function(data) {
        	data.token = token;
        	return $http.post(url, data);
        };

		this.getUsers = function(params) {
			params.token = token;
			return $http.get(url, {
				params: params
			});
		};

		this.getUser = function(id) {
			return $http.get(url + '/' + id, {
				params: {
					token: token
				}
			});
		};

		this.deleteUser = function(params) {
			params.token = token;
			return $http.delete(url, {
				params: params
			});
		};
	})

	// Group
	.service('group', function($http, $cookies) {
		var url = '/api/group';
        var token = $cookies.get('token');

        this.saveGroup = function(data) {
        	data.token = token;
        	return $http.post(url, data);
        };

		this.getGroups = function(params) {
			if (!params) {
				params = [];
			}
			params.token = token;
			return $http.get(url, {
				params: params
			});
		};

		this.getGroup = function(id) {
			return $http.get(url + '/' + id, {
				params: {
					token: token
				}
			});
		};

		this.deleteGroup = function(params) {
			params.token = token;
			return $http.delete(url, {
				params: params
			});
		};
	});