'use strict';

angular.module('SmartAdmin.Layout').directive('stateBreadcrumbs', function ($rootScope, $state) {


    return {
        restrict: 'EA',
        replace: true,
        template: '<ol class="breadcrumb"><li>{{getWord(\'Home\')}}</li></ol>',
        // transclude: true,
        link: function (scope, element) {

            function setBreadcrumbs(breadcrumbs) {
                if(angular.isFunction($rootScope.getWord)){
                    var html = '<li>'+$rootScope.getWord('Home')+'</li>';
                    angular.forEach(breadcrumbs, function (crumb) {
                        html += '<li>' + $rootScope.getWord(crumb) + '</li>'
                    });
                    element.html(html)
                }else{
                    element.html('')
                }
            }

            function fetchBreadcrumbs(stateName, breadcrunbs) {

                var state = $state.get(stateName);

                if (state && state.data && state.data.title && breadcrunbs.indexOf(state.data.title) == -1) {
                    breadcrunbs.unshift(state.data.title)
                }

                var parentName = stateName.replace(/.?\w+$/, '');
                if (parentName) {
                    return fetchBreadcrumbs(parentName, breadcrunbs);
                } else {
                    return breadcrunbs;
                }
            }

            function processState(state) {
                var breadcrumbs;
                if (state.data && state.data.breadcrumbs) {
                    breadcrumbs = state.data.breadcrumbs;
                } else {
                    breadcrumbs = fetchBreadcrumbs(state.name, []);
                }
                setBreadcrumbs(breadcrumbs);
            }

            // processState($state.current);
            
            $rootScope.$watch('lang', function(newVal, oldVal){
                if(!angular.equals(newVal, {}) && !angular.isUndefined(newVal)){
                    processState($state.current);
                }
            });

            $rootScope.$on('$stateChangeStart', function (event, state) {
                processState(state);
            })
        }
    }
});