"use strict";

angular.module('app.settings').controller('ProfileCtrl', function ($scope, $stateParams, $state, AuthApi, Session, toaster, $uibModal, RestfulApi, $filter) {

    var $vm = this;

    angular.extend(this, {
        profile : Session.Get(),
        Editor : function (){

            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'myModalContent.html',
                controller: 'ModalInstanceCtrl',
                controllerAs: '$ctrl',
                size: 'lg',
                // appendTo: parentElem,
                resolve: {
                    profile: function() {
                        return $vm.profile;
                    }
                }
            });

            modalInstance.result.then(function(selectedItem) {
                // $ctrl.selected = selectedItem;
                // console.log(selectedItem);

                RestfulApi.UpdateMSSQLData({
                    updatename: 'UpdateByEncrypt',
                    table: 0,
                    params: {
                        U_PW          : selectedItem.C_PW,
                        U_EMAIL       : selectedItem.U_EMAIL,
                        U_UP_USER     : $vm.profile.U_ID,
                        U_UP_DATETIME : $filter('date')(new Date, 'yyyy-MM-dd HH:mm:ss')
                    },
                    condition: {
                        U_ID          : selectedItem.U_ID
                    }
                }).then(function (res) {

                    toaster.success("狀態", "更新成功並重新登入", 3000);

                    Session.Destroy();
                    $state.transitionTo("login");
                }, function (err) {

                });
            }, function() {
                // $log.info('Modal dismissed at: ' + new Date());
            });

        }
    });

})
.controller('ModalInstanceCtrl', function ($uibModalInstance, profile) {
    var $ctrl = this;
    $ctrl.mdData = profile;

    /**
     * [CheckPW description]
     * N_PW : 當前密碼
     * M_PW : 更改密碼
     * C_PW : 確認密碼
     */
    $ctrl.CheckPW = function(){
        var _check = true;

        // N_PW必須輸入且正確
        if(!angular.isUndefined($ctrl.mdData['N_PW']) && $ctrl.mdData['N_PW'] == profile.U_PW){
            if(!angular.isUndefined($ctrl.mdData['M_PW']) && !angular.isUndefined($ctrl.mdData['C_PW'])){
                // 更改密碼 等於 確認密碼
                if($ctrl.mdData['M_PW'] == $ctrl.mdData['C_PW']){
                    _check = false;
                }
            }
        }

        return _check;
    };

    $ctrl.ok = function() {
        $uibModalInstance.close($ctrl.mdData);
    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
});
