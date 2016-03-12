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

	.service('user', function($http, $cookies) {
		var url = '/api/user';
        var token = $cookies.get('token');
	    var pathToken = token ? '?token=' + token : '';

		this.getUsers = function(params) {
			return $http.get(url + pathToken, {
				params: params
			});
		};

		this.getUser = function(id) {
			return $http.get(url + '/' + id + pathToken);
		};

		this.countUser = function(params) {
			return $http.get(url, {
				params: params
			});
		};
	});