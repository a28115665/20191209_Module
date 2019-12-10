"use strict";

angular.module('app.settings').controller('OExCompyCtrl', function ($scope, $stateParams, $state, AuthApi, Session, toaster, $uibModal, $filter, RestfulApi, bool, coWeights) {

	var $vm = this;
    // console.log(Account.get());

	angular.extend(this, {
        Init : function(){
            // 不正常登入此頁面
            if($stateParams.data == null){
               ReturnToExternalManagementPage(); 
            } else{
                $vm.vmData = $stateParams.data;
            }
        },
        profile : Session.Get(),
        boolData : bool,
        coWeightsData : coWeights,
        Return : function(){
        	ReturnToExternalManagementPage();
        },
        Update : function(){
        	console.log($vm.vmData);
        	RestfulApi.UpdateMSSQLData({
                updatename: 'Update',
                table: 39,
                params: {
                    O_CO_ID          : $vm.vmData.O_CO_ID,
		        	O_CO_STS         : $vm.vmData.O_CO_STS,
					O_CO_NAME        : $vm.vmData.O_CO_NAME,
					O_CO_NUMBER      : $vm.vmData.O_CO_NUMBER,
					O_CO_ADDR        : $vm.vmData.O_CO_ADDR,
                    O_CO_AREA        : $vm.vmData.O_CO_AREA,
                    O_CO_WEIGHTS     : $vm.vmData.O_CO_WEIGHTS,
                    O_CO_UP_USER     : $vm.profile.U_ID,
                    O_CO_UP_DATETIME : $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss')
                },
                condition: {
                    O_CO_CODE : $vm.vmData.O_CO_CODE
                }
            }).then(function (res) {

                toaster.pop('success', '訊息', '更新行家成功', 3000);

                // 新增成功後，更新compy的值
                $filter('compyFilter')({}, true);
                
                ReturnToExternalManagementPage();

            }, function (err) {

            });
        }
	})

	function ReturnToExternalManagementPage(){
        // $state.transitionTo("app.settings.externalmanagement", null, { 
        //     reload: true, inherit: false, notify: true
        // });
        $state.transitionTo($state.current.parent);
	}

});