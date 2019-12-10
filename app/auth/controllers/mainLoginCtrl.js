"use strict";

angular.module('app.auth').controller('MainLoginCtrl', function ($scope, $stateParams, $state, AuthApi, Session, toaster, RestfulApi, SocketApi) {

    var $vm = this;

    $vm.Init = function(){
        RestfulApi.SearchMSSQLData({
            querymain: 'account',
            queryname: 'SelectSysParm'
        }).then(function(res){
            console.log('sysParm:', res);
            $scope.sysParm = res["returnData"][0];
        });
    }

    // console.log(Session.Get());
    $scope.Login = function($vm){
        // console.log($vm);
        AuthApi.Login({
            U_ID : $vm.userid,
            U_PW : $vm.password
        }).then(function(res) {
            // console.log(res);
            if(res["returnData"] && res["returnData"].length > 0){

                AuthApi.ReLoadSession().then(function(res){
                    SocketApi.Connect();
                    SocketApi.Emit('userLogin', {}, function(err, data){
                        if(!err){
                            toaster.success("狀態", "登入成功", 3000);
                            $state.transitionTo("app.default");
                        }else{
                            toaster.error("錯誤", err, 3000);
                        }
                    });
                    
                    // toaster.success("狀態", "登入成功", 3000);
                    // $state.transitionTo("app.default");
                });

            }else{                
                toaster.error("錯誤", "帳號密碼錯誤", 3000);
            }
        });
        
    }
})
