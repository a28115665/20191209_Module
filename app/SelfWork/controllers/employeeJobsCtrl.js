"use strict";

angular.module('app.selfwork').controller('EmployeeJobsCtrl', function ($scope, $stateParams, $state, AuthApi, Session, toaster, $uibModal, $templateCache, $filter, uiGridConstants, RestfulApi, compy, userInfo, $q, OrderStatus) {
    
    var $vm = this;

	angular.extend(this, {
        Init : function(){
            LoadOrderList();
        },
        profile : Session.Get(),
        gridMethod : {
            // 各單的工作選項
            gridOperation : function(row, name){
                // 給modal知道目前是哪個欄位操作
                row.entity['name'] = name;

                var modalInstance = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'opWorkMenu.html',
                    controller: 'OpWorkMenuModalInstanceCtrl',
                    controllerAs: '$ctrl',
                    scope: $scope,
                    size: 'sm',
                    // windowClass: 'center-modal',
                    // appendTo: parentElem,
                    resolve: {
                        items: function() {
                            return row;
                        }
                    }
                });

                modalInstance.result.then(function(selectedItem) {
                    // $ctrl.selected = selectedItem;
                    console.log(selectedItem);

                }, function() {
                    // $log.info('Modal dismissed at: ' + new Date());
                });
            },
            // 各單的修改
            modifyData : function(row){
                console.log(row);
                var modalInstance = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    template: $templateCache.get('modifyOrderList'),
                    controller: 'ModifyOrderListModalInstanceCtrl',
                    controllerAs: '$ctrl',
                    backdrop: 'static',
                    // size: 'sm',
                    // windowClass: 'center-modal',
                    // appendTo: parentElem,
                    resolve: {
                        vmData: function() {
                            return row.entity;
                        },
                        compy: function() {
                            return compy;
                        }
                    }
                });

                modalInstance.result.then(function(selectedItem) {
                    // $ctrl.selected = selectedItem;
                    console.log(selectedItem);

                    RestfulApi.UpdateMSSQLData({
                        updatename: 'Update',
                        table: 18,
                        params: {
                            OL_IMPORTDT : selectedItem.OL_IMPORTDT,
                            OL_REAL_IMPORTDT : selectedItem.OL_REAL_IMPORTDT,
                            OL_CO_CODE  : selectedItem.OL_CO_CODE,
                            OL_FLIGHTNO : selectedItem.OL_FLIGHTNO,
                            OL_MASTER   : selectedItem.OL_MASTER,
                            OL_COUNTRY  : selectedItem.OL_COUNTRY,
                            OL_REASON   : selectedItem.OL_REASON
                        },
                        condition: {
                            OL_SEQ : selectedItem.OL_SEQ
                        }
                    }).then(function (res) {
                        LoadOrderList();
                    });

                }, function() {
                    // $log.info('Modal dismissed at: ' + new Date());
                });
            },
            // 貨物查看
            viewOrder : function(row){
                OrderStatus.Get(row)
            },
            // 匯出紀錄
            exportDetail : function(row){
                console.log(row.entity);

                RestfulApi.SearchMSSQLData({
                    querymain: 'employeeJobs',
                    queryname: 'SelectExportDetail',
                    params: {
                        ILE_SEQ : row.entity.OL_SEQ
                    }
                }).then(function (res){

                    console.log(res);

                    var modalInstance = $uibModal.open({
                        animation: true,
                        ariaLabelledBy: 'modal-title',
                        ariaDescribedBy: 'modal-body',
                        templateUrl: 'exportDetailModalContent.html',
                        controller: 'ExportDetailModalInstanceCtrl',
                        controllerAs: '$ctrl',
                        // backdrop: 'static',
                        size: 'lg',
                        // appendTo: parentElem,
                        resolve: {
                            item: function(){
                                return row.entity;
                            },
                            vmData: function() {
                                return res["returnData"];
                            }
                        }
                    });

                    modalInstance.result.then(function(selectedItem) {
                        // $ctrl.selected = selectedItem;
                    }, function() {
                        // $log.info('Modal dismissed at: ' + new Date());
                    });

                }); 
            }
        },
        gridMethodForJob001 : {
            // 檢視(組長職位以上)
            viewData : function(row){
                console.log(row);

                if($vm.profile.U_GRADE <= 9){
                    $state.transitionTo("app.selfwork.employeejobs.job001", {
                        data: row.entity
                    });
                }
            },
            // 編輯
            modifyData : function(row){
                console.log(row);

                // 如果是第一次編輯 會先記錄編輯時間
                if(row.entity.W2_EDATETIME == null){
                    // 檢查是否有人編輯
                    RestfulApi.SearchMSSQLData({
                        querymain: 'employeeJobs',
                        queryname: 'SelectOrderEditor',
                        params: {
                            OE_SEQ : row.entity.OL_SEQ,
                            OE_TYPE : 'R'
                        }
                    }).then(function (res){
                        // 有 警告並且重Load資料
                        // 沒有 新增資料到DB
                        if(res["returnData"].length > 0){
                            LoadOrderList();
                            toaster.pop('warning', '警告', '此單已有人編輯', 3000);
                        }else{
                            RestfulApi.InsertMSSQLData({
                                insertname: 'Insert',
                                table: 22,
                                params: {
                                    OE_SEQ : row.entity.OL_SEQ,
                                    OE_TYPE : 'R', // 報機單
                                    OE_PRINCIPAL : $vm.profile.U_ID,
                                    OE_EDATETIME : $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss')
                                }
                            }).then(function (res) {
                                // 讓中班作業區的完成鈕可以亮起
                                row.entity.W2_PRINCIPAL = $vm.profile.U_ID;
                                $state.transitionTo("app.selfwork.employeejobs.job001", {
                                    data: row.entity
                                });
                            });
                        }
                    });
                }else{
                    $state.transitionTo("app.selfwork.employeejobs.job001", {
                        data: row.entity
                    });
                }
            },
            // 完成
            closeData : function(row){
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
                                title : "是否完成"
                            }
                        }
                    }
                });

                modalInstance.result.then(function(selectedItem) {
                    // $ctrl.selected = selectedItem;
                    console.log(selectedItem);

                    RestfulApi.UpdateMSSQLData({
                        updatename: 'Update',
                        table: 22,
                        params: {
                            OE_FDATETIME : $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss')
                        },
                        condition: {
                            OE_SEQ : selectedItem.OL_SEQ,
                            OE_TYPE : 'R',
                            OE_PRINCIPAL : $vm.profile.U_ID
                        }
                    }).then(function (res) {
                        LoadOrderList();
                    });

                }, function() {
                    // $log.info('Modal dismissed at: ' + new Date());
                });
            },
            // 修改
            // 已編輯且完成就可以讓所有人修改
            fixData : function(row){
                console.log(row);
                if(row.entity.W2_FDATETIME != null){
                    $state.transitionTo("app.selfwork.employeejobs.job001", {
                        data: row.entity
                    });
                }
            },
            // 刪除報機單
            deleteData : function(row){
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
                            }
                        }
                    }
                });

                modalInstance.result.then(function(selectedItem) {
                    // $ctrl.selected = selectedItem;
                    console.log(selectedItem);

                    RestfulApi.DeleteMSSQLData({
                        deletename: 'Delete',
                        table: 9,
                        params: {
                            IL_SEQ : selectedItem.OL_SEQ
                        }
                    }).then(function (res) {
                        toaster.pop('info', '訊息', '報機單刪除成功', 3000);
                        LoadOrderList();
                    });

                }, function() {
                    // $log.info('Modal dismissed at: ' + new Date());
                });
            }
        },
        gridMethodForJob002 : {
            // 檢視
            // viewData : function(row){
            //     console.log(row);
            //     $state.transitionTo("app.selfwork.employeejobs.job002", {
            //         data: row.entity
            //     });
            // }
            // 修改
            fixData : function(row){
                $state.transitionTo("app.selfwork.employeejobs.job002", {
                    data: row.entity
                });
            }
        },
        orderListOptions : {
            data:  '$vm.selfWorkData',
            columnDefs: [
                { name: 'OL_SUPPLEMENT_COUNT'    ,  displayName: '補件', width: 65, cellTemplate: $templateCache.get('accessibilityToSuppleMent') },
                { name: 'OL_IMPORTDT'            ,  displayName: '進口日期', width: 80, cellFilter: 'dateFilter' },
                // { name: 'OL_CO_CODE'             ,  displayName: '行家', width: 80, cellFilter: 'compyFilter', filter: 
                //     {
                //         term: null,
                //         type: uiGridConstants.filter.SELECT,
                //         selectOptions: compy
                //     }
                // },
                { name: 'CO_NAME'                ,  displayName: '行家', width: 80 },
                { name: 'OL_FLIGHTNO'            ,  displayName: '航班', width: 80 },
                { name: 'FA_SCHEDL_ARRIVALTIME'  ,  displayName: '預計抵達時間', cellFilter: 'datetimeFilter' },
                // { name: 'FA_ACTL_ARRIVALTIME'    ,  displayName: '真實抵達時間', cellFilter: 'datetimeFilter' },
                { name: 'FA_ARRIVAL_REMK'        ,  displayName: '狀態', width: 60, cellTemplate: $templateCache.get('accessibilityToArrivalRemark') },
                { name: 'OL_MASTER'              ,  displayName: '主號', width: 110, cellTemplate: $templateCache.get('accessibilityToMasterForViewOrder') },
                { name: 'OL_COUNT'               ,  displayName: '報機單(袋數)' },
                { name: 'OL_PULL_COUNT'          ,  displayName: '拉貨(袋數)' },
                { name: 'OL_COUNTRY'             ,  displayName: '起運國別' },
                { name: 'OL_REASON'              ,  displayName: '描述', cellTooltip: function (row, col) 
                    {
                        return row.entity.OL_REASON
                    } 
                },
                { name: 'W2_STATUS'              ,  displayName: '狀態', width: 47, cellTemplate: $templateCache.get('accessibilityToForW2'), filter: 
                    {
                        term: null,
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: [
                            // {label:'未派單', value: '0'},
                            {label:'已派單', value: '1'},
                            {label:'已編輯', value: '2'},
                            {label:'已完成', value: '3'},
                            {label:'非作業員'  , value: '4'}
                        ]
                    }
                },
                { name: 'W2_PRINCIPAL'           ,  displayName: '編輯者', width: 80, cellFilter: 'userInfoFilter', filter: 
                    {
                        term: null,
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: userInfo
                    }
                },
                { name: 'EXPORT'                 ,  displayName: '匯出', width: 85, enableCellEdit: false, enableFiltering: false, cellTemplate: $templateCache.get('accessibilityToExportExcelStaus') },
                { name: 'ITEM_LIST'              ,  displayName: '報機單', enableFiltering: false, width: 86, cellTemplate: $templateCache.get('accessibilityToOperaForJob001') },
                { name: 'FLIGHT_ITEM_LIST'       ,  displayName: '銷艙單', enableFiltering: false, width: 86, cellTemplate: $templateCache.get('accessibilityToOperaForJob002') },
                // { name: 'DELIVERY_ITEM_LIST'  ,  displayName: '派送單', enableFiltering: false, width: '8%', cellTemplate: $templateCache.get('accessibilityToOperaForJob003') },
                { name: 'Options'                ,  displayName: '操作', width: 54, enableCellEdit: false, enableFiltering: false, cellTemplate: $templateCache.get('accessibilityToM') }
            ],
            enableFiltering: true,
            enableSorting: true,
            enableColumnMenus: false,
            // enableVerticalScrollbar: false,
            paginationPageSizes: [10, 25, 50, 100],
            paginationPageSize: 100,
            onRegisterApi: function(gridApi){
                $vm.selfWorkGridApi = gridApi;
            }
        },
        // 檢查是否為晚班
        IsW3 : function(){
            var _flag = false;

            for(var i in $vm.profile.DEPTS){
                if($vm.profile.DEPTS[i].SUD_DEPT == "W3"){
                    _flag = true;
                }
            }

            return _flag;
        }
        // Update : function(entity){
        //     // create a fake promise - normally you'd use the promise returned by $http or $resource
        //     var promise = $q.defer();
        //     $vm.selfWorkGridApi.rowEdit.setSavePromise( entity, promise.promise );
         
        //     RestfulApi.UpdateMSSQLData({
        //         updatename: 'Update',
        //         table: 18,
        //         params: {
        //             OL_IMPORTDT   : entity.OL_IMPORTDT,
        //             OL_CO_CODE    : entity.OL_CO_CODE,
        //             OL_FLIGHTNO   : entity.OL_FLIGHTNO,
        //             OL_MASTER     : entity.OL_MASTER,
        //             OL_COUNTRY    : entity.OL_COUNTRY
        //         },
        //         condition: {
        //             OL_SEQ        : entity.OL_SEQ
        //         }
        //     }).then(function (res) {
        //         promise.resolve();
        //     }, function (err) {
        //         toaster.pop('danger', '錯誤', '更新失敗', 3000);
        //         promise.reject();
        //     });
        // }
    });

    function LoadOrderList(){

        RestfulApi.SearchMSSQLData({
            querymain: 'employeeJobs',
            queryname: 'SelectOrderList',
            params: {
                U_ID : $vm.profile.U_ID,
                U_GRADE : $vm.profile.U_GRADE
                // DEPTS : $vm.profile.DEPTS
            }
        }).then(function (res){
            console.log(res["returnData"]);
            $vm.selfWorkData = res["returnData"];
        });    
    };

})
.controller('ExportDetailModalInstanceCtrl', function ($uibModalInstance, item, vmData) {
    var $ctrl = this;

    $ctrl.MdInit = function(){
        $ctrl.item = item;
        $ctrl.mdData = vmData;
    }

    $ctrl.mdDataOptions = {
        data:  '$ctrl.mdData',
        columnDefs: [
            { name: 'ILE_TYPE'         , displayName: '匯出類型' },
            { name: 'ILE_CR_USER'      , displayName: '匯出人員', cellFilter: 'userInfoFilter' },
            { name: 'ILE_CR_DATETIME'  , displayName: '匯出時間', cellFilter: 'datetimeFilter' }
        ],
        enableFiltering: true,
        enableSorting: true,
        enableColumnMenus: false,
        multiSelect: false,
        // enableVerticalScrollbar: false,
        paginationPageSizes: [10, 25, 50, 100],
        paginationPageSize: 100,
        onRegisterApi: function(gridApi){
            $ctrl.mdDataGridApi = gridApi;
        }
    }

    $ctrl.ok = function() {
        $uibModalInstance.close();
    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
});