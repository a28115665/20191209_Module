"use strict";

angular.module('app.settings').controller('ExternalManagementCtrl', function ($scope, $stateParams, $state, AuthApi, Session, toaster, $uibModal, RestfulApi, uiGridConstants, $templateCache, $filter, bool, compy, coWeights) {

    var $vm = this;

    angular.extend(this, {
        Init : function(){
            $scope.ShowTabs = true;
            $vm.LoadData();
        },
        profile : Session.Get(),
        defaultTab : 'hr1',
        TabSwitch : function(pTabID){
            return pTabID == $vm.defaultTab ? 'active' : '';
        },
        LoadData : function(){
            console.log($vm.defaultTab);
            switch($vm.defaultTab){
                case 'hr1':
                    LoadCustInfo();
                    break;
                case 'hr2':
                    LoadCompyInfo();
                    break;
            }
        },
        gridCustInfoMethod : {
            //編輯
            modifyData : function(row){
                console.log(row);
                $state.transitionTo("app.settings.externalmanagement.exaccount", {
                    data: row.entity
                });
            },
            //刪除
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
                    console.log(selectedItem);

                    RestfulApi.DeleteMSSQLData({
                        deletename: 'Delete',
                        table: 7,
                        params: {
                            CI_ID : selectedItem.CI_ID
                        }
                    }).then(function (res) {
                        toaster.pop('success', '訊息', '刪除外部帳號成功', 3000);
                        LoadCustInfo();
                    });
                }, function() {
                    // $log.info('Modal dismissed at: ' + new Date());
                });
            }
        },
        custInfoOptions : {
            data: '$vm.custInfoData',
            columnDefs: [
                { name: 'CI_STS'    ,  displayName: '離職', cellFilter: 'booleanFilter', filter: 
                    {
                        term: null,
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: bool
                    }
                },
                { name: 'CI_ID'    ,  displayName: '帳號' },
                { name: 'CI_NAME'  ,  displayName: '名稱' },
                { name: 'CI_COMPY' ,  displayName: '公司名稱', cellFilter: 'compyFilter', filter: 
                    {
                        term: null,
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: compy
                    }
                },
                { name: 'Options'  ,  displayName: '操作', enableFiltering: false, cellTemplate: $templateCache.get('accessibilityToMDForCustInfo') }
            ],
            enableFiltering: true,
            enableSorting: false,
            enableColumnMenus: false,
            // enableVerticalScrollbar: false,
            paginationPageSizes: [10, 25, 50, 100],
            paginationPageSize: 100,
            onRegisterApi: function(gridApi){
                $vm.custInfoGridApi = gridApi;
            }
        },
        gridCompyInfoMethod : {
            //編輯
            modifyData : function(row){
                console.log(row);
                $state.transitionTo("app.settings.externalmanagement.excompy", {
                    data: row.entity
                });
            },
            //刪除
            // deleteData : function(row){
            //     console.log(row);

            //     var modalInstance = $uibModal.open({
            //         animation: true,
            //         ariaLabelledBy: 'modal-title',
            //         ariaDescribedBy: 'modal-body',
            //         template: $templateCache.get('isChecked'),
            //         controller: 'IsCheckedModalInstanceCtrl',
            //         controllerAs: '$ctrl',
            //         size: 'sm',
            //         windowClass: 'center-modal',
            //         // appendTo: parentElem,
            //         resolve: {
            //             items: function() {
            //                 return row.entity;
            //             },
            //             show: function(){
            //                 return {
            //                     title : "是否刪除"
            //                 };
            //             }
            //         }
            //     });

            //     modalInstance.result.then(function(selectedItem) {
            //         console.log(selectedItem);

            //         RestfulApi.DeleteMSSQLData({
            //             deletename: 'Delete',
            //             table: 8,
            //             params: {
            //                 CO_CODE : selectedItem.CO_CODE
            //             }
            //         }).then(function (res) {
            //             toaster.pop('success', '訊息', '刪除行家成功', 3000);
            //             LoadCompyInfo();
            //         });
            //     }, function() {
            //         // $log.info('Modal dismissed at: ' + new Date());
            //     });
            // }
        },
        compyInfoOptions : {
            data: '$vm.compyInfoData',
            columnDefs: [
                { name: 'CO_STS'    ,  displayName: '作廢', cellFilter: 'booleanFilter', filter: 
                    {
                        term: null,
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: bool
                    }
                },
                { name: 'CO_CODE'   ,  displayName: '行家代號' },
                { name: 'CO_AREA'   ,  displayName: '行家區域' },
                { name: 'CO_NAME'   ,  displayName: '行家名稱' },
                { name: 'CO_WEIGHTS',  displayName: '行家權重', cellFilter: 'coWeightsFilter', filter: 
                    {
                        term: null,
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: coWeights
                    }
                },
                { name: 'CO_NUMBER' ,  displayName: '行家統編' },
                { name: 'CO_ADDR'   ,  displayName: '行家地址' },
                { name: 'Options'   ,  displayName: '操作', width: '5%', enableFiltering: false, cellTemplate: $templateCache.get('accessibilityToMForCompyInfo') }
            ],
            enableFiltering: true,
            enableSorting: false,
            enableColumnMenus: false,
            // enableVerticalScrollbar: false,
            paginationPageSizes: [10, 25, 50, 100],
            paginationPageSize: 100,
            onRegisterApi: function(gridApi){
                $vm.compyInfoGridApi = gridApi;
            }
        },
        AddAccount : function(){

            $state.transitionTo("app.settings.externalmanagement.exaccount");

        },
        AddCompy : function(){
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'addCompyModalContent.html',
                controller: 'AddCompyModalInstanceCtrl',
                controllerAs: '$ctrl',
                resolve: {
                    coWeights: function() {
                        return coWeights;
                    }
                }
            });

            modalInstance.result.then(function(selectedItem) {
                // console.log(selectedItem);

                // 找出最大ID
                RestfulApi.SearchMSSQLData({
                    querymain: 'externalManagement',
                    queryname: 'SelectMaxCompy'
                }).then(function (res){
                    RestfulApi.InsertMSSQLData({
                        insertname: 'Insert',
                        table: 8,
                        params: {
                            CO_ID : res["returnData"].length == 0 ? 1 : res["returnData"][0].CO_ID,
                            CO_NAME : selectedItem.CO_NAME,
                            CO_AREA : selectedItem.CO_AREA,
                            CO_NUMBER : selectedItem.CO_NUMBER,
                            CO_ADDR : selectedItem.CO_ADDR,
                            CO_WEIGHTS : selectedItem.CO_WEIGHTS,
                            CO_CR_USER : $vm.profile.U_ID,
                            CO_CR_DATETIME : $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss')
                        }
                    }).then(function(res) {
                        console.log(res);

                        if(res["returnData"] == 1){
                            LoadCompyInfo();

                            // 新增成功後，更新compy的值
                            $filter('compyFilter')({}, true);

                            toaster.pop('success', '訊息', '新增行家成功', 3000);
                        }

                        // $state.reload()
                    });
                });
            }, function() {
                // $log.info('Modal dismissed at: ' + new Date());
            });
        }
    });

    function LoadCustInfo(){
        RestfulApi.SearchMSSQLData({
            querymain: 'externalManagement',
            queryname: 'SelectCustInfo'
        }).then(function (res){
            $vm.custInfoData = res["returnData"];
        });
    }

    function LoadCompyInfo(){
        RestfulApi.SearchMSSQLData({
            querymain: 'externalManagement',
            queryname: 'SelectCompyInfo'
        }).then(function (res){
            console.log(res["returnData"]);
            $vm.compyInfoData = res["returnData"];
        });
    }

})
.controller('AddCompyModalInstanceCtrl', function ($uibModalInstance, coWeights) {
    var $ctrl = this;
    $ctrl.coWeightsData = coWeights;

    $ctrl.ok = function() {
        $uibModalInstance.close($ctrl.items);
    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
});