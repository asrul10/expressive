angular.module('Function', []);
// Native Function
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