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

angular.module('Expressive', [])
	/**
	 * Set title
	 */
	.run(function($rootScope, $route) {
	    $rootScope.$on('$routeChangeSuccess', function() {
	    	if (typeof($route.current.title) !== 'undefined') {
		        document.title = $route.current.title;
	    	}
	    });
	})

	/**
	 * Custom Directive
	 */
	.directive('exvFullHeight', function($window) {
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {
				var d = 0;
				if (attrs.exvFullHeight) {
					d = parseInt(attrs.exvFullHeight);
				}

				element.css('height', [$window.innerHeight + d, 'px'].join(''));

				angular.element($window).bind('resize', function(){
					element.css('height', [$window.innerHeight + d, 'px'].join(''));
				});
			}
		};
	})

	.directive('exvScroll', function() {
		var height = '100%';
		return {
			restrict: 'E',
			transclude: true,
			template: '<div class="elm-scroll" ng-transclude></div>'
		};
	});

})(window, angular);