"use strict";

angular.module('app.settings').controller('AviationMailCtrl', function ($scope, $stateParams, $state, AuthApi, Session, toaster, $uibModal, $templateCache, RestfulApi, $filter) {
    
    var $vm = this;

	angular.extend(this, {
        Init : function(){
            LoadFlightMail();
        },
        profile : Session.Get(),
        gridMethod : {
            // 編輯
            modifyData : function(row){
                console.log(row);
                $state.transitionTo("app.settings.aviationmail.targeteditor", {
                    data: row.entity
                });
            },
            // 刪除
            deleteData : function(row){
                console.log(row);

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
                            return row.entity;
                        },
                        show: function(){
                            return {
                                title : "是否刪除"
                            };
                        }
                    }
                });

                modalInstance.result.then(function(selectedItem) {
                    // $ctrl.selected = selectedItem;
                    console.log(selectedItem);

                    RestfulApi.DeleteMSSQLData({
                        deletename: 'Delete',
                        table: 24,
                        params: {
                            FM_CR_DATETIME : selectedItem.FM_CR_DATETIME,
                            FM_CR_USER : selectedItem.FM_CR_USER
                        }
                    }).then(function (res) {
                        toaster.pop('success', '訊息', '刪除成功', 3000);
                        LoadFlightMail();
                    });

                }, function() {
                    // $log.info('Modal dismissed at: ' + new Date());
                });
            }
        },
        vmDataOptions : {
            data:  '$vm.vmData',
            columnDefs: [
                { name: 'FM_TARGET', displayName: '目標名稱', width: '100' },
                { name: 'FM_MAIL'  , displayName: '信箱' },
                { name: 'Options'  , displayName: '操作', width: '9%', cellTemplate: $templateCache.get('accessibilityToMD') }
            ],
            enableFiltering: false,
            enableSorting: false,
            enableColumnMenus: false,
            // enableVerticalScrollbar: false,
            paginationPageSizes: [10, 25, 50, 100],
            paginationPageSize: 100
        },
        AddTarget : function(){

            $state.transitionTo("app.settings.aviationmail.targeteditor");

        }
    });

    function LoadFlightMail(){
        RestfulApi.SearchMSSQLData({
            querymain: 'aviationMail',
            queryname: 'SelectFlightMail'
        }).then(function (res){
            console.log(res["returnData"]);
            $vm.vmData = res["returnData"];
        }); 
    };

});