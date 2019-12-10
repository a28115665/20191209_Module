"use strict";

angular.module('app.settings').controller('ExCompyCtrl', function ($scope, $stateParams, $state, AuthApi, Session, toaster, $uibModal, $filter, RestfulApi, bool, coWeights) {

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
                table: 8,
                params: {
                    CO_ID          : $vm.vmData.CO_ID,
		        	CO_STS         : $vm.vmData.CO_STS,
					CO_NAME        : $vm.vmData.CO_NAME,
					CO_NUMBER      : $vm.vmData.CO_NUMBER,
					CO_ADDR        : $vm.vmData.CO_ADDR,
                    CO_AREA        : $vm.vmData.CO_AREA,
                    CO_WEIGHTS     : $vm.vmData.CO_WEIGHTS,
                    CO_UP_USER     : $vm.profile.U_ID,
                    CO_UP_DATETIME : $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss')
                },
                condition: {
                    CO_CODE : $vm.vmData.CO_CODE
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