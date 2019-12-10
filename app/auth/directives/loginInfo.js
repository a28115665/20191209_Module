"use strict";

angular.module('app.auth').directive('loginInfo', function(User, Session){

    return {
        restrict: 'A',
        templateUrl: 'app/auth/directives/login-info.tpl.html',
        link: function(scope, element){
            // User.initialized.then(function(){
            //     scope.user = User
            // });
			scope.user = angular.copy(Session.Get());
			scope.user["picture"] = scope.sysParm.SPA_AVATARS;
        }
    }
})
