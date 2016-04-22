/*
 * App To-do module
 */
(function(window, angular, undefined) {
    'use strict';

    var toDo = angular.module('exvTodo', []);
    toDo.run(function($templateCache) {
        $templateCache.put('todo-form.html', ['<md-card class="todo-card">',
            '<div class="todo-trigger" layout="row">',
            '<span class="todo-title" flex>',
            '<md-tooltip md-direction="down">',
            'New Image',
            '</md-tooltip>',
            'New To Do</span>',
            '<div flex layout="row" layout-align="end center">',
            '<md-button class="md-icon-button todo-check-new">',
            '<md-tooltip md-direction="down">',
            'New Checklist',
            '</md-tooltip>',
            '<md-icon md-font-icon="zmdi-format-list-bulleted" class="zmdi zmdi-hc-lg"></md-icon>',
            '</md-button>',
            '<md-button class="md-icon-button todo-image-new">',
            '<md-tooltip md-direction="down">',
            'New Image',
            '</md-tooltip>',
            '<md-icon md-font-icon="zmdi-image" class="zmdi zmdi-hc-lg exv-menu-icon"></md-icon>',
            '</md-button>',
            '</div>',
            '</div>',
            '<div class="todo-form">',
            '<form><div class="form-padding"><md-input-container md-no-float class="md-block">',
            '<input class="todo-title-card" ng-model="todo.title" placeholder="Title">',
            '</md-input-container>',
            '<exv-todo-text></exv-todo-text>',
            '<exv-todo-list></exv-todo-list>',
            '<md-card-actions layout="row">',
            '<exv-todo-tools flex>as</exv-todo-tools>',
            '<div flex layout="row" layout-align="end center">',
            '<md-button class="cancel-todo">Cancel</md-button>',
            '<md-button type="submit">Add</md-button>',
            '</div>',
            '</md-card-actions></div></form>',
            '</div>',
            '</md-card>'].join('')
        );

        $templateCache.put('todo-text.html', ['<md-input-container class="md-block todo-text">',
            '<label>To-do</label>',
            '<textarea class="todo-content" ng-model="todo.todo" md-maxlength="150" rows="5" md-select-on-focus></textarea>',
            '</md-input-container>'].join('')
        );

        $templateCache.put('todo-list.html', ['<ul class="todo-list">',
            '<li ng-repeat="item in checkList" layout="row" class="todo-check-item">',
            '<md-checkbox aria-label="check-item" ng-click="checked($index)" ng-class="item.item === \'done\' ? \'md-checked\' : \'\'">',
            '</md-checkbox><md-input-container flex md-no-float class="md-block">',
            '<input value="{{item.item}}" ng-class="item.item === \'done\' ? \'todo-done\' : \'\'" class="todo-item" placeholder="List item">',
            '</md-input-container>',
            '<md-button class="md-icon-button todo-delete-check" ng-click="deleteCheck($index)">',
            '<md-icon md-font-icon="zmdi-close" class="zmdi zmdi-hc-lg"></md-icon>',
            '</md-button>',
            '</li>',
            '<div class="todo-new-list">',
            '<md-icon md-font-icon="zmdi-plus" class="zmdi zmdi-hc-lg"></md-icon>',
            'New list</div></ul>'].join('')
        );

        $templateCache.put('todo-tools.html', ['<md-menu>',
            '<md-button aria-label="Open demo menu" class="md-icon-button" ng-click="$mdOpenMenu()">',
            '<md-tooltip md-direction="down">',
            'Change Color',
            '</md-tooltip>',
            '<md-icon md-font-icon="zmdi-palette" class="zmdi zmdi-hc-lg"></md-icon>',
            '</md-button>',
            '<md-menu-content width="3">',
            '<md-menu-item class="todo-palette-list">',
            '<div class="todo-color" ng-repeat="color in palette.first" style="background-color: {{color}}" ng-click="changeColor(color)">',
            '</div>',
            '</md-menu-item>',
            '<md-menu-item class="todo-palette-list">',
            '<div class="todo-color" ng-repeat="color in palette.second" style="background-color: {{color}}" ng-click="changeColor(color)">',
            '</div>',
            '</md-menu-item>',
            '</md-menu-content>',
            '</md-menu>'].join('')
        );

        $templateCache.put('todo-card.html', ['<md-card class="todo-card" layout-padding ng-repeat="todo in todos track by $index" style="background-color: {{todo.color}}">',
            '<div class="todo-container" ng-click="todoEdit($event, todo)">',
            '<div class="todo-title-card">',
            '{{todo.title}}',
            '</div>',
            '<div class="todo-form">',
            '<p ng-if="todo.todo != \'\'" ng-bind="todo.todo"></p>',
            '<ul ng-if="todo.check.length !== 0" ng-repeat="check in todo.check track by $index">',
            '<li ng-bind="check"></li>',
            '</ul></div></div>',
            '<div layout="row" class="todo-card-tool">',
            '<exv-todo-tools></exv-todo-tools>',
            '<md-button aria-label="Open demo menu" class="md-icon-button" ng-click="todoArchive(todo)">',
            '<md-tooltip md-direction="down">',
            'Archive',
            '</md-tooltip>',
            '<md-icon md-font-icon="zmdi-archive" class="zmdi zmdi-hc-lg"></md-icon>',
            '</md-button>',
            '</div>',
            '</md-card>'].join("")
        );

        $templateCache.put('todo-edit-form.html', ['<md-dialog aria-label="Todo dialog">',
            '<md-dialog-content class="todo-dialog">',
            '<form><div class="form-padding"><md-input-container md-no-float class="md-block">',
            '<input class="todo-title-card" ng-model="todo.title" placeholder="Title">',
            '</md-input-container>',
            '<exv-todo-text></exv-todo-text>',
            '<exv-todo-list></exv-todo-list>',
            '<exv-todo-tools flex>as</exv-todo-tools>',
            '</div></form>',
            '</md-dialog-content>',
            '</md-dialog>'].join("")
        );
    });

    toDo.directive('exvTodoForm', function($templateCache) {
        return {
            restrict: 'E',
            scope: {
                todoSubmit: '='
            },
            templateUrl: 'todo-form.html',
            link: function(scope, element, attrs) {
                var form = element.find('form');
                var todoTrigger = element.find('.todo-trigger');
                var todoText = form.find('.todo-text');
                var todoCheckList = form.find('.todo-list');
                scope.todo = {
                    title: '',
                    todo: '',
                    check: [],
                    color: '',
                };

                form.hide();
                form.submit(function() {
                    var item = element.find('.todo-item');
                    var todoItem = [];
                    var card = element.children().attr('style');
                    var color = false;
                    item.each(function(index, el) {
                        var value = $(el).val();
                        if (value !== '') {
                            scope.todo.check.push(value);
                        }
                    });
                    if (card) {
                        card = card.replace(" ", "");
                        color = card.split(':');
                        color = color[1].replace(";","");
                    }
                    scope.todo.color = color;
                    cancelTodo();
                    scope.todoSubmit(angular.copy(scope.todo));
                    scope.todo = {check: []};
                });

                element.find('.todo-title').click(function() {
                    todoTrigger.hide();
                    form.show();
                    form.find('exv-todo-text').show();
                    form.find('exv-todo-list').hide();
                    form.find('.todo-content').focus();
                });
                element.find('.todo-check-new').click(function(event) {
                    todoTrigger.hide();
                    form.show();
                    form.find('exv-todo-text').hide();
                    form.find('exv-todo-list').show();
                    form.find('.todo-content').focus();
                    form.find('.todo-check-item:last').find('input').focus();
                });
                element.find('.todo-image-new').click(function(event) {
                    todoTrigger.hide();
                    form.show();
                });
                element.find('.cancel-todo').click(cancelTodo);
                function cancelTodo() {
                    form.hide();
                    form.find('input').val('');
                    form.find('textarea').val('');
                    element.children().removeAttr('style');
                    scope.checkList = [1];
                    todoTrigger.show();
                }
            }
        };
    });

    toDo.directive('exvTodoText', function() {
        return {
            restrict: 'E',
            templateUrl: 'todo-text.html'
        };
    });

    toDo.directive('exvTodoList', function($templateCache) {
        return {
            restrict: 'E',
            templateUrl: 'todo-list.html',
            link: function(scope, element, attrs) {
                scope.checkList = [{item: '', value: ''}];
                element.find('.todo-trigger').hide();
                element.find('.todo-new-list').bind('click', function(event) {
                    scope.checkList.push({item: '', value: ''});
                    scope.$apply();
                    element.find('.todo-check-item').find('input').focus();
                });
                scope.checked = function(index) {
                    var check = element.find('.todo-check-item:eq(' + index + ')');
                    if (!check.find('md-checkbox').hasClass('md-checked')) {
                        check.find('input').addClass('todo-done');
                    } else {
                        check.find('input').removeClass('todo-done');
                    }
                };
                scope.deleteCheck = function(index) {
                    scope.checkList.splice(index, 1);
                };
            }
        };
    });

    toDo.directive('exvTodoTools', function() {
        return {
            restrict: 'E',
            templateUrl: 'todo-tools.html',
            link: function(scope, element, attrs) {
                scope.palette = {
                    'first': [
                        '#fff',
                        '#FFF176',
                        '#64B5F6'
                    ],
                    'second': [
                        '#E57373',
                        '#90A4AE',
                        '#81C784'
                    ]
                };

                scope.changeColor = function(color) {
                    element.closest('.todo-card').css('background-color', color);
                };
            }
        };
    });

    toDo.directive('exvTodoCard', function($mdDialog) {
        return {
            restrict: 'E',
            templateUrl: 'todo-card.html',
            scope: {
                todos: '=',
                todoUpdate: '=',
                todoDelete: '='
            },
            link: function(scope, element, attrs) {
                scope.todoEdit = function(ev, todo) {
                    $mdDialog.show({
                        templateUrl: 'todo-edit-form.html',
                        targetEvent: ev,
                        clickOutsideToClose: true,
                        controller: todoData
                    });
                    function todoData($scope, $mdDialog) {
                        $scope.todo = todo;
                    }
                    scope.todoUpdate(todo);
                };

                scope.todoArchive = function(todo) {
                    scope.todoDelete(todo);
                };
            }
        };
    });
})(window, angular);
