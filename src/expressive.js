(function(window, angular, undefined) {
    'use strict';

    // Custom script
    $('.menu-list').each(function() {
        if ($(this).parent().find('exv-sidenav-child').length) {
            $(this).append('<i class="zmdi zmdi-chevron-down zmdi-hc-lg exv-arrow-menu"></i>');
        }
    });

    var app = angular.module('Expressive', []);
    /**
     * Initialize Page
     */
    app.run(function($rootScope, $route) {
        $rootScope.$on('$routeChangeSuccess', function() {
            var currPath = window.location.pathname.replace('#', '');
            var menuList = document.getElementsByClassName('menu-list');
            var content = $('#mainContent').children();
            content.scrollTop(0);

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
    });

    /**
     * Sidenav
     */
    app.directive('exvSidenavTitle', function() {
        return {
            restrict: 'E',
            transclude: true,
            template: '<div class="exv-sidenav-title" ng-transclude></div>'
        };
    });

    app.directive('exvSidenavParent', function() {
        return {
            restrict: 'E',
            transclude: true,
            template: '<ul class="exv-sidenav-content" ng-transclude></ul>'
        };
    });

    app.directive('exvSidenavChild', function() {
        return {
            restrict: 'E',
            transclude: true,
            template: '<ul class="exv-sidenav-child" ng-transclude></ul>'
        };
    });

    app.directive('exvSidenavItem', function() {
        return {
            restrict: 'E',
            transclude: true,
            link: function(scope, element) {
                element.bind('click', function() {
                    var contentScroller = document.getElementsByClassName("exv-sidenav-item");
                    var collapsed = false;
                    if (element.hasClass('collapsed')) {
                        collapsed = true;
                    }
                    angular.element(contentScroller).parent().removeClass('collapsed');

                    var childrend = element.find('exv-sidenav-child');
                    if (childrend.length !== 0) {
                        if (!collapsed) {
                            element.addClass('collapsed');
                        }
                    }
                });
            },
            template: [
                '<li class="exv-sidenav-item" ng-transclude>',
                '</li>'
            ].join('')
        };
    });

    /**
     * Element Scroll
     */
    app.directive('exvFullHeight', function($window) {
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
    });

    app.directive('exvScroll', function() {
        var height = '100%';
        return {
            restrict: 'E',
            transclude: true,
            template: '<div class="elm-scroll" ng-transclude></div>',
            link: function(scope, element, attrs) {
                if (attrs.mainContent === 'true') {
                    element.attr('id', 'mainContent');
                }
            }
        };
    });

    /**
     * Background top
     */
    app.directive('exvBackgroundTop', function() {
        return {
            restrict: 'E',
            transclude: true,
            template: '<div class="exv-background-top" ng-transclude></div>',
            link: function(scope, element, attrs) {
                if (attrs.background) {
                    element.children().css('background', attrs.background);
                }
                if (attrs.color) {
                    element.children().css('color', attrs.color);
                }
            }
        };
    });

    app.directive('exvTitle', function() {
        return {
            restrict: 'E',
            transclude: true,
            template: '<h1 class="exv-title" ng-transclude></h1>',
            link: function(scope, element, attrs) {
                var subTitle = $('exv-sub-title').children();
                subTitle.text(element.text());
                $(element).closest('exv-scroll').children().scroll(function() {
                    if ($(this).scrollTop() >= 70) {
                        if (!subTitle.hasClass('active')) {
                            subTitle.addClass('active');
                        }
                    } else if ($(this).scrollTop() <= 70) {
                        if (subTitle.hasClass('active')) {
                            subTitle.removeClass('active');
                        }
                    }
                });
            }
        };
    });

    app.directive('exvSubTitle', function() {
        return {
            restrict: 'E',
            template: '<span class="exv-sub-title"></span>'
        };
    });
})(window, angular);
