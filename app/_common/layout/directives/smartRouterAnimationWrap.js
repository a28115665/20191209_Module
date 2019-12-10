'use strict';

angular.module('SmartAdmin.Layout').directive('smartRouterAnimationWrap', function ($rootScope, $timeout, $state) {
    return {
        restrict: 'A',
        compile: function (element, attributes) {
            element.removeAttr('smart-router-animation-wrap data-smart-router-animation-wrap wrap-for data-wrap-for');

            element.addClass('router-animation-container');
            element.css({
                background: $state.current.data.backgroundClass
            });

            var $loader = $('<div class="router-animation-loader"><i class="fa fa-gear fa-4x fa-spin"></i></div>')
                .css({
                    position: 'absolute',
                    top: 50,
                    left: 10
                }).hide().appendTo(element);


            var animateElementSelector = attributes.wrapFor;
            var viewsToMatch = attributes.smartRouterAnimationWrap.split(/\s/);

            var needRunContentViewAnimEnd = false;
            function contentViewAnimStart() {

                var css = {
                    height: element.height() + 'px',
                    overflow: 'hidden'
                };
                checkBackgroundColor(css);

                needRunContentViewAnimEnd = true;
                element.css(css).addClass('active');
                $loader.fadeIn();

                $(animateElementSelector).addClass('animated faster fadeOutDown');
            }

            function contentViewAnimEnd() {
                if(needRunContentViewAnimEnd){

                    var css = {
                        height: 'auto',
                        overflow: 'visible'
                    };
                    checkBackgroundColor(css);

                    element.css(css).removeClass('active');

                    $(animateElementSelector).addClass('animated faster fadeInUp');

                    needRunContentViewAnimEnd = false;

                    $timeout(function(){
                        $(animateElementSelector).removeClass('animated');
                    },10);
                }
                $loader.fadeOut();
            }

            function checkBackgroundColor(css){
                if($state.current.data.backgroundClass) {
                    css["background"] = $state.current.data.backgroundClass;
                }else{
                    css["background"] = '';
                }
            }


            var destroyForStart = $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                var isAnimRequired = _.any(viewsToMatch, function(view){
                   return _.has(toState.views, view) || _.has(fromState.views, view);
                });
                if(isAnimRequired){
                    contentViewAnimStart()
                }
            });

            var destroyForEnd = $rootScope.$on('$viewContentLoaded', function (event) {
                contentViewAnimEnd();
            });

            element.on('$destroy', function(){
                destroyForStart();
                destroyForEnd();

            });



        }
    }
});