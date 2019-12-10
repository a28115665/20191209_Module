"use strict";

angular.module('app.settings').controller('BagnoCountCtrl', function ($scope, $stateParams, $state, AuthApi, Session, toaster, $uibModal, $templateCache, RestfulApi, uiGridConstants, $filter) {
    // console.log($stateParams, $state);

    var $vm = this;

    angular.extend(this, {
        Init : function(){
            LoadBagnoCount();
        },
        profile : Session.Get(),
        // 更新
        Update: function(){

            RestfulApi.UpdateMSSQLData({
                updatename: 'Update',
                table: 32,
                params: {
                    ILC_CURRENT     : $vm.vmData.ILC_CURRENT,
                    ILC_MAX         : $vm.vmData.ILC_MAX,
                    ILC_UP_USER     : $vm.profile.U_ID,
                    ILC_UP_DATETIME : $filter('date')(new Date, 'yyyy-MM-dd HH:mm:ss')
                },
                condition: {
                    ILC_ID         : $vm.vmData.ILC_ID
                }
            }).then(function (res) {
                toaster.pop('success', '訊息', '更新新寄件人編碼成功', 3000);
            }, function (err) {

            });

        }
    });

    function LoadBagnoCount(){
        RestfulApi.SearchMSSQLData({
            querymain: 'bagnoCount',
            queryname: 'SelectBagnoCount'
        }).then(function (res){
            // console.log(res["returnData"]);
            $vm.vmData = res["returnData"][0];
        }); 
    };

})