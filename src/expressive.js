(function(window, angular, undefined) {
  'use strict';

  // Custom script
  window.onload = function() {
    var menuListItem = document.getElementsByClassName('menu-list');
    var eleListItem = angular.element(menuListItem);
    [].forEach.call(eleListItem, function(el) {
      if (angular.element(el).parent().find('exv-sidenav-child').length) {
        angular.element(el).append('<i class="zmdi zmdi-chevron-down zmdi-hc-lg exv-arrow-menu"></i>');
      }
    });
  };

  angular.module('Expressive', [])
    /**
     * Initialize Page
     */
    .run(function($rootScope, $route) {
      $rootScope.$on('$routeChangeSuccess', function() {
        var currPath = window.location.pathname.replace('#', '');
        var menuList = document.getElementsByClassName('menu-list');

        if (typeof($route.current.title) !== 'undefined') {
          document.title = $route.current.title;
        }

        [].forEach.call(menuList, function(el) {
          if (typeof(angular.element(el).attr('href')) !== 'undefined') {
            var href = angular.element(el).attr('href').replace('#', '');
            if (currPath === href) {
              angular.element(el).addClass('active');
              angular.element(el).parent('exv-sidenav-item')
                .parent().parent()
                .parent().parent()
                .parent().addClass('collapsed');
            } else {
              angular.element(el).removeClass('active');
            }
          }
        });
      });
    })

	  /**
	   * Sidenav
	   */
    .directive('exvSidenavTitle', function() {
      return {
        restrict: 'E',
        transclude: true,
        template: '<div class="exv-sidenav-title" ng-transclude></div>'
      };
    })

	  .directive('exvSidenavParent', function() {
	    return {
	      restrict: 'E',
	      transclude: true,
	      template: '<ul class="exv-sidenav-content" ng-transclude></ul>'
	    };
	  })

	  .directive('exvSidenavChild', function() {
	    return {
	      restrict: 'E',
	      transclude: true,
	      template: '<ul class="exv-sidenav-child" ng-transclude></ul>'
	    };
	  })

	  .directive('exvSidenavItem', function() {
	    return {
	      restrict: 'E',
	      transclude: true,
	      controller: function($scope, $element) {
	        $scope.clickMenu = function() {
            var contentScroller = document.getElementsByClassName("exv-sidenav-item");
	          var collapsed = false;
	          if ($element.hasClass('collapsed')) {
	            collapsed = true;
	          }
	          angular.element(contentScroller).parent().removeClass('collapsed');

	          var childrend = $element.find('exv-sidenav-child');
	          if (childrend.length !== 0) {
              if (!collapsed) {
	              $element.addClass('collapsed');
	            }
	          }
	        };
	      },
	      template: [
	        '<li class="exv-sidenav-item" ng-click="clickMenu()" ng-transclude>',
	        '</li>'
	      ].join('')
	    };
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

	        angular.element($window).bind('resize', function() {
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
