(function(window, angular, undefined) {
'use strict';

angular.module('Expressive', [])
	
    // Navigation
    .directive('exvTopnav', function () {
        return {
            restrict: 'E',
            template: [
				'<nav layout="row" flex>',
				'<md-toolbar>',
				'<div class="md-toolbar-tools">',
				'<md-button hide-gt-sm class="md-icon-button" aria-label="menu" ng-click="toggleLeft()">',
				'<md-icon md-font-icon="zmdi-menu" class="zmdi zmdi-hc-lg"></md-icon>',
				'</md-button>',
				'<h2>',
				'<span><a href="home">Expressive</a></span>',
				'</h2>',
				'<span flex></span>',
				'<md-menu ng-if="loggedin" md-position-mode="target-right target">',
				'<md-button class="md-icon-button" aria-label="More" ng-click="$mdOpenMenu($event)">',
				'<md-icon md-font-icon="zmdi-more-vert" class="zmdi zmdi-hc-lg"></md-icon>',
				'</md-button>',
				'<md-menu-content width="4">',
				'<md-menu-item>',
				'<md-button ng-click="logout()"> Logout </md-button>',
				'</md-menu-item>',
				'</md-menu-content>',
				'</md-menu>',
				'</div>',
				'</md-toolbar>',
				'</nav>' ].join('')
        };
    })

	// Sidenav
	.directive('exvSidenav', function($mdSidenav, $window) {
		var height = $window.innerHeight;
		return {
			restrict: 'E',
			template: [
				'<md-sidenav class="md-sidenav-left exv-sidenav" md-component-id="left" md-is-locked-open="$mdMedia(\'gt-sm\')" md-disable-backdrop style="min-height: ' + height + 'px">',
				'<md-toolbar class="no-shadow">',
				'<h1 class="md-toolbar-tools">MENU</h1>',
				'</md-toolbar>',
				'<md-content>',
				'<md-list>',
				'<md-list-item ng-if="!loggedin">',
				'<md-button class="menu-list" href="login" ng-click="close()"> login </md-button>',
				'</md-list-item>',
				'<md-list-item>',
				'<md-button class="menu-list" href="dashboard" ng-click="close()"> dashboard </md-button>',
				'</md-list-item>',
				'<md-list-item ng-if="loggedin">',
				'<md-button class="menu-list" href="users" ng-click="close()"> users </md-button>',
				'</md-list-item>',
				'<md-list-item ng-if="loggedin">',
				'<md-button class="menu-list" href="groups" ng-click="close()"> groups </md-button>',
				'</md-list-item>',
				'</md-list>',
				'</md-content>',
				'</md-sidenav>',].join('')
		};
	});

})(window, angular);