(function(window, angular, undefined) {
'use strict';

// Custom script
window.onload = function() {
	var classExvScroll = document.querySelectorAll('.elm-scroll');
    [].forEach.call(classExvScroll, function(el) {
		Ps.initialize(el);
    });

    var contentScroller = document.getElementById("contentScroller");
    if (contentScroller) {
		var scope = angular.element(contentScroller).scope();
	    Ps.initialize(contentScroller);
		scope.$on('$routeChangeStart', function(next, current) { 
			contentScroller.scrollTop = 0;
			Ps.update(contentScroller);
		});
    }
};

// Default module
angular.module('Expressive', [])

.directive('exvScroll', function () {
	var height = '100%';
	return {
		restrict: 'E',
		transclude: true,
		template: '<div class="elm-scroll" ng-transclude></div>'
	};
});

})(window, angular);