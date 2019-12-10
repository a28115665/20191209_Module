"use strict";

angular.module('app.settings').controller('OExAccountCtrl', function ($scope, $stateParams, $state, AuthApi, Session, toaster, $uibModal, $templateCache, $filter, SysCode, RestfulApi, bool, ocompy, sysParm) {

	var $vm = this;
    // console.log(Account.get());

	angular.extend(this, {
        Init : function(){
            if($stateParams.data == null){
                $vm.vmData = {
                	O_CI_STS : false,
                    IU : "Add"
                }
            }else{
                $vm.vmData = $stateParams.data;
                $vm.vmData["IU"] = "Update";

                console.log($vm.vmData);
            }
        },
        profile : Session.Get(),
        boolData : bool,
        compyData : ocompy,
        ForgetPW : function(){

            // var _defaultPass = "Eastwind@168";
                
            var _defaultPass = sysParm.SPA_DEFAULT_PASSWORD;

            if(_defaultPass){

                var modalInstance = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    template: $templateCache.get('isChecked'),
                    controller: 'IsCheckedModalInstanceCtrl',
                    controllerAs: '$ctrl',
                    size: 'sm',
                    windowClass: 'center-modal',
                    // appendTo: parentElem,
                    resolve: {
                        items: function() {
                            return _defaultPass;
                        },
                        show: function(){
                            return {
                                title : "即將設定為預設密碼" + _defaultPass
                            };
                        }
                    }
                });

                modalInstance.result.then(function(selectedItem) {
                    // console.log(selectedItem);
                    
                    $vm.vmData.O_CI_PW = selectedItem;

                }, function() {
                    // $log.info('Modal dismissed at: ' + new Date());
                });
                
            }else{
                toaster.danger("錯誤", "查無預設密碼，請聯絡系統管理員。");
                return;
            }
        },
        Return : function(){
        	ReturnToExternalManagementPage();
        },
        Add : function(){
            RestfulApi.InsertMSSQLData({
                insertname: 'InsertByEncrypt',
                table: 38,
                params: {
                    O_CI_ID          : $vm.vmData.O_CI_ID,
                    O_CI_PW          : $vm.vmData.O_CI_PW,
                    O_CI_NAME        : $vm.vmData.O_CI_NAME,
                    O_CI_COMPY       : $vm.vmData.O_CI_COMPY,
                    O_CI_STS         : $vm.vmData.O_CI_STS,
                    O_CI_CR_USER     : $vm.profile.U_ID,
                    O_CI_CR_DATETIME : $filter('date')(new Date, 'yyyy-MM-dd HH:mm:ss')
                }
            }).then(function(res) {
                // console.log(res);
                toaster.pop('success', '訊息', '新增外部帳號成功', 3000);

                ReturnToExternalManagementPage();

                // $state.reload()
            });
        },
        Update : function(){

            RestfulApi.UpdateMSSQLData({
                updatename: 'UpdateByEncrypt',
                table: 38,
                params: {
                    O_CI_PW          : $vm.vmData.O_CI_PW,
                    O_CI_NAME        : $vm.vmData.O_CI_NAME,
                    O_CI_COMPY       : $vm.vmData.O_CI_COMPY,
                    O_CI_STS         : $vm.vmData.O_CI_STS,
                    O_CI_UP_USER     : $vm.profile.U_ID,
                    O_CI_UP_DATETIME : $filter('date')(new Date, 'yyyy-MM-dd HH:mm:ss')
                },
                condition: {
                    O_CI_ID         : $vm.vmData.O_CI_ID
                }
            }).then(function (res) {
                toaster.pop('success', '訊息', '更新外部帳號成功', 3000);

                ReturnToExternalManagementPage();

            }, function (err) {

            });
        }
	})

    function ReturnToExternalManagementPage(){
        $state.transitionTo($state.current.parent);
    };

});