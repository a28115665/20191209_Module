angular.module('app')
.directive('action', function($rootScope, $filter, $state, AuthApi, SocketApi) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            /*
             * SMART ACTIONS
             */
            var smartActions = {
    
                // LOGOUT MSG 
                userLogout: function($this){
            
                    // ask verification
                    $.SmartMessageBox({
                        title : "<i class='fa fa-sign-out txt-color-orangeDark'></i> 登出 <span class='txt-color-orangeDark'><strong>" + $('#show-shortcut').text() + "</strong></span> ?",
                        content : $this.data('logout-msg'),
                        buttons : '[否][是]'
            
                    }, function(ButtonPressed) {
                        if (ButtonPressed == "是") {
                            // $.root_.addClass('animated fadeOutUp');
                            // setTimeout(logout, 1000);
                            if(SocketApi.Connected()){
                                SocketApi.Disconnect();
                            }
                            AuthApi.Logout().then(function (res){
                                // console.log(res);
                                // $state.transitionTo("login");
                                $state.reload();
                            });
                        }
                    });

                    // function logout() {
                    //     window.location = $this.attr('href');
                    // }
            
                },

                // RESET WIDGETS
                resetWidgets: function($this){
                    $.widresetMSG = $this.data('reset-msg');
                    
                    $.SmartMessageBox({
                        title : "<i class='fa fa-refresh' style='color:green'></i> Clear Local Storage",
                        content : $.widresetMSG || "Would you like to RESET all your saved widgets and clear LocalStorage?",
                        buttons : '[No][Yes]'
                    }, function(ButtonPressed) {
                        if (ButtonPressed == "Yes" && localStorage) {
                            localStorage.clear();
                            location.reload();
                        }
            
                    });
                },
                
                // LAUNCH FULLSCREEN 
                launchFullscreen: function(element){
            
                    if (!$.root_.hasClass("full-screen")) {
                
                        $.root_.addClass("full-screen");
                
                        if (element.requestFullscreen) {
                            element.requestFullscreen();
                        } else if (element.mozRequestFullScreen) {
                            element.mozRequestFullScreen();
                        } else if (element.webkitRequestFullscreen) {
                            element.webkitRequestFullscreen();
                        } else if (element.msRequestFullscreen) {
                            element.msRequestFullscreen();
                        }
                
                    } else {
                        
                        $.root_.removeClass("full-screen");
                        
                        if (document.exitFullscreen) {
                            document.exitFullscreen();
                        } else if (document.mozCancelFullScreen) {
                            document.mozCancelFullScreen();
                        } else if (document.webkitExitFullscreen) {
                            document.webkitExitFullscreen();
                        }
                
                    }
            
               },
            
               // MINIFY MENU
                minifyMenu: function($this){
                    if (!$.root_.hasClass("menu-on-top")){
                        $.root_.toggleClass("minified");
                        $.root_.removeClass("hidden-menu");
                        $('html').removeClass("hidden-menu-mobile-lock");
                        $this.effect("highlight", {}, 500);
                    }
                },
                
                // TOGGLE MENU 
                toggleMenu: function(){
                    if (!$.root_.hasClass("menu-on-top")){
                        $('html').toggleClass("hidden-menu-mobile-lock");
                        $.root_.toggleClass("hidden-menu");
                        $.root_.removeClass("minified");
                    } else if ( $.root_.hasClass("menu-on-top") && $.root_.hasClass("mobile-view-activated") ) {
                        $('html').toggleClass("hidden-menu-mobile-lock");
                        $.root_.toggleClass("hidden-menu");
                        $.root_.removeClass("minified");
                    }
                },     
            
                // TOGGLE SHORTCUT 
                toggleShortcut: function(){
                    
                    if (shortcut_dropdown.is(":visible")) {
                        shortcut_buttons_hide();
                    } else {
                        shortcut_buttons_show();
                    }

                    // SHORT CUT (buttons that appear when clicked on user name)
                    shortcut_dropdown.find('a').click(function(e) {
                        e.preventDefault();
                        window.location = $(this).attr('href');
                        setTimeout(shortcut_buttons_hide, 300);
                
                    });
                
                    // SHORTCUT buttons goes away if mouse is clicked outside of the area
                    $(document).mouseup(function(e) {
                        if (!shortcut_dropdown.is(e.target) && shortcut_dropdown.has(e.target).length === 0) {
                            shortcut_buttons_hide();
                        }
                    });
                    
                    // SHORTCUT ANIMATE HIDE
                    function shortcut_buttons_hide() {
                        shortcut_dropdown.animate({
                            height : "hide"
                        }, 300, "easeOutCirc");
                        $.root_.removeClass('shortcut-on');
                
                    }
                
                    // SHORTCUT ANIMATE SHOW
                    function shortcut_buttons_show() {
                        shortcut_dropdown.animate({
                            height : "show"
                        }, 200, "easeOutCirc");
                        $.root_.addClass('shortcut-on');
                    }
            
                }  
               
            };
            
            var actionEvents = {
                userLogout: function(e) {
                    smartActions.userLogout(element);
                },
                resetWidgets: function(e) {
                    smartActions.resetWidgets(element);
                },
                launchFullscreen: function(e) {
                    smartActions.launchFullscreen(document.documentElement);
                },
                minifyMenu: function(e) {
                    smartActions.minifyMenu(element);
                },
                toggleMenu: function(e) {
                    smartActions.toggleMenu();
                },
                toggleShortcut: function(e) {
                    smartActions.toggleShortcut();
                }
            };

            if (angular.isDefined(attrs.action) && attrs.action != '') {
                var actionEvent = actionEvents[attrs.action];
                if (typeof actionEvent === 'function') {
                    element.on('click', function(e) {
                        actionEvent(e);
                        e.preventDefault();
                    });
                }
            }

        }
    };
})
.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });
 
                event.preventDefault();
            }
        });
    };
})
.directive('isDate', function ($filter) {
    return {
        restrict: 'A',
        require: '^ngModel',
        link: function (scope, element, attrs, ctrl) {
            ctrl.$parsers.unshift(function (viewValue) {
                var _d = new Date(viewValue);
                // Check valid
                if(_d && _d != 'Invalid Date'){
                    ctrl.$setValidity('isDate', true);
                    return $filter('date')(_d, 'yyyy-MM-dd');
                }else{
                    ctrl.$setValidity('isDate', false);
                    return undefined;
                }
            });
        }
    };
})
/**
 * String to Number
 */
.directive('stringToNumber', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
            ngModel.$parsers.push(function(value) {
                return '' + value;
            });
            ngModel.$formatters.push(function(value) {
                return parseFloat(value, 10);
            });
        }
    };
})
.directive('alanTreeviewContent', function ($compile) {
    return {
        restrict: 'E',
        link: function (scope, element) {

            var $content = $(scope.item.content);

            function handleExpanded(){
                $content.find('>i')
                    .toggleClass('fa-plus-circle', !scope.item.expanded)
                    .toggleClass('fa-minus-circle', !!scope.item.expanded)

            }

            if (scope.item.children && scope.item.children.length) {
                $content.on('click', function(){
                    scope.$apply(function(){
                        scope.item.expanded = !scope.item.expanded;
                        handleExpanded();
                    });
                });
                handleExpanded();
            } else{
                $content.on('change', function(){
                    scope.$apply(function(){
                        scope.item.isChecked = !scope.item.isChecked;
                    });
                });
            }

            element.replaceWith($content);
        }
    }
})
.directive('alanTreeview', function ($compile, $sce) {
    return {
        restrict: 'A',
        scope: {
            'items': '='
        },
        template: '<li ng-class="{parent_li: item.children.length}" ng-repeat="item in items" role="treeitem">' +
            '<alan-treeview-content></alan-treeview-content>' +
            '<ul ng-if="item.children.length" alan-treeview ng-show="item.expanded"  items="item.children" role="group" class="smart-treeview-group" ></ul>' +
            '</li>',
        compile: function (element) {
            // Break the recursion loop by removing the contents
            var contents = element.contents().remove();
            var compiledContents;
            return {
                post: function (scope, element) {
                    // Compile the contents
                    if (!compiledContents) {
                        compiledContents = $compile(contents);
                    }
                    // Re-add the compiled contents to the element
                    compiledContents(scope, function (clone) {
                        element.append(clone);
                    });
                }
            };
        }
    };
});