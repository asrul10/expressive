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

        this.addUser = function(data) {
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
	});