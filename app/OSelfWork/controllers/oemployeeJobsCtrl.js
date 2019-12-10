"use strict";

angular.module('app.oselfwork').controller('OEmployeeJobsCtrl', function ($scope, $stateParams, $state, AuthApi, Session, toaster, $uibModal, $templateCache, $filter, uiGridConstants, RestfulApi, ocompy, userInfo, $q) {
    
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
                    templateUrl: 'oopWorkMenu.html',
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
                    template: $templateCache.get('modifyOOrderList'),
                    controller: 'ModifyOOrderListModalInstanceCtrl',
                    controllerAs: '$ctrl',
                    backdrop: 'static',
                    // size: 'sm',
                    // windowClass: 'center-modal',
                    // appendTo: parentElem,
                    resolve: {
                        vmData: function() {
                            return row.entity;
                        },
                        ocompy: function() {
                            return ocompy;
                        }
                    }
                });

                modalInstance.result.then(function(selectedItem) {
                    // $ctrl.selected = selectedItem;
                    console.log(selectedItem);

                    RestfulApi.UpdateMSSQLData({
                        updatename: 'Update',
                        table: 40,
                        params: {
                            O_OL_IMPORTDT          : selectedItem.O_OL_IMPORTDT,
                            O_OL_CO_CODE           : selectedItem.O_OL_CO_CODE,
                            O_OL_MASTER            : selectedItem.O_OL_MASTER,
                            O_OL_PASSCODE          : selectedItem.O_OL_PASSCODE,
                            O_OL_VOYSEQ            : selectedItem.O_OL_VOYSEQ,
                            O_OL_MVNO              : selectedItem.O_OL_MVNO,
                            O_OL_COMPID            : selectedItem.O_OL_COMPID,
                            O_OL_ARRLOCATIONID     : selectedItem.O_OL_ARRLOCATIONID,
                            O_OL_POST              : selectedItem.O_OL_POST,
                            O_OL_PACKAGELOCATIONID : selectedItem.O_OL_PACKAGELOCATIONID,
                            O_OL_BOATID            : selectedItem.O_OL_BOATID,
                            O_OL_REASON            : selectedItem.O_OL_REASON
                        },
                        condition: {
                            O_OL_SEQ : selectedItem.O_OL_SEQ
                        }
                    }).then(function (res) {
                        LoadOrderList();
                    });

                }, function() {
                    // $log.info('Modal dismissed at: ' + new Date());
                });
            },
            // 匯出紀錄
            exportDetail : function(row){
                console.log(row.entity);

                RestfulApi.SearchMSSQLData({
                    querymain: 'oemployeeJobs',
                    queryname: 'SelectOExportDetail',
                    params: {
                        O_ILE_SEQ : row.entity.O_OL_SEQ
                    }
                }).then(function (res){

                    console.log(res);

                    var modalInstance = $uibModal.open({
                        animation: true,
                        ariaLabelledBy: 'modal-title',
                        ariaDescribedBy: 'modal-body',
                        templateUrl: 'oexportDetailModalContent.html',
                        controller: 'OExportDetailModalInstanceCtrl',
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
                    $state.transitionTo("app.oselfwork.oemployeejobs.ojob001", {
                        data: row.entity
                    });
                }
            },
            // 編輯
            modifyData : function(row){
                console.log(row);

                // 如果是第一次編輯 會先記錄編輯時間
                if(row.entity.OW2_EDATETIME == null){
                    // 檢查是否有人編輯
                    RestfulApi.SearchMSSQLData({
                        querymain: 'oemployeeJobs',
                        queryname: 'SelectOOrderEditor',
                        params: {
                            O_OE_SEQ : row.entity.O_OL_SEQ,
                            O_OE_TYPE : 'R'
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
                                table: 43,
                                params: {
                                    O_OE_SEQ : row.entity.O_OL_SEQ,
                                    O_OE_TYPE : 'R', // 報機單
                                    O_OE_PRINCIPAL : $vm.profile.U_ID,
                                    O_OE_EDATETIME : $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss')
                                }
                            }).then(function (res) {
                                // 讓中班作業區的完成鈕可以亮起
                                row.entity.OW2_PRINCIPAL = $vm.profile.U_ID;
                                $state.transitionTo("app.oselfwork.oemployeejobs.ojob001", {
                                    data: row.entity
                                });
                            });
                        }
                    });
                }else{
                    $state.transitionTo("app.oselfwork.oemployeejobs.ojob001", {
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
                        table: 43,
                        params: {
                            O_OE_FDATETIME : $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss')
                        },
                        condition: {
                            O_OE_SEQ : selectedItem.O_OL_SEQ,
                            O_OE_TYPE : 'R',
                            O_OE_PRINCIPAL : $vm.profile.U_ID
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
                if(row.entity.OW2_FDATETIME != null){
                    $state.transitionTo("app.oselfwork.oemployeejobs.ojob001", {
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
                        table: 41,
                        params: {
                            O_IL_SEQ : selectedItem.O_OL_SEQ
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
        orderListOptions : {
            data:  '$vm.selfWorkData',
            columnDefs: [
                { name: 'O_OL_SUPPLEMENT_COUNT'    ,  displayName: '補件', width: 65, pinnedLeft:true, cellTemplate: $templateCache.get('accessibilityToSuppleMent') },
                { name: 'O_OL_IMPORTDT' ,  displayName: '報機日期', width: 91, pinnedLeft:true, cellFilter: 'dateFilter', cellTooltip: cellTooltip },
                { name: 'O_CO_NAME'     ,  displayName: '行家', width: 66, pinnedLeft:true, cellTooltip: cellTooltip },
                { name: 'O_OL_MASTER'   ,  displayName: '主號', width: 133, pinnedLeft:true, cellTooltip: cellTooltip },
                { name: 'O_OL_PASSCODE'          ,  displayName: '通關號碼', width: 91, cellTooltip: cellTooltip },
                { name: 'O_OL_VOYSEQ'            ,  displayName: '航次', width: 66, cellTooltip: cellTooltip },
                { name: 'O_OL_MVNO'              ,  displayName: '呼號', width: 66, cellTooltip: cellTooltip },
                { name: 'O_OL_COMPID'            ,  displayName: '船公司代碼', width: 103, cellTooltip: cellTooltip },
                { name: 'O_OL_ARRLOCATIONID'     ,  displayName: '卸存地點', width: 91, cellTooltip: cellTooltip },
                { name: 'O_OL_POST'              ,  displayName: '裝貨港', width: 78, cellTooltip: cellTooltip },
                { name: 'O_OL_PACKAGELOCATIONID' ,  displayName: '暫存地點', width: 91, cellTooltip: cellTooltip },
                { name: 'O_OL_BOATID'            ,  displayName: '船機代碼', width: 91, cellTooltip: cellTooltip },
                { name: 'O_OL_COUNT'    ,  displayName: '報機單(件數)', width: 80, enableCellEdit: false },
                { name: 'O_OL_PULL_COUNT' ,  displayName: '拉貨(件數)', width: 80, enableCellEdit: false },
                { name: 'O_OL_REASON'   ,  displayName: '描述', width: 100, cellTooltip: cellTooltip },
                { name: 'OW2_STATUS'            ,  displayName: '報機單狀態', width: 103, pinnedRight:true, cellTemplate: $templateCache.get('accessibilityToForOW2'), filter: 
                    {
                        term: null,
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: [
                            {label:'未派單', value: '0'},
                            {label:'已派單', value: '1'},
                            {label:'已編輯', value: '2'},
                            {label:'已完成', value: '3'},
                            {label:'非作業員'  , value: '4'}
                        ]
                    }
                },
                { name: 'OW2_PRINCIPAL'           ,  displayName: '編輯者', width: 80, pinnedRight:true, cellTooltip: cellTooltip, cellFilter: 'userInfoFilter', filter: 
                    {
                        term: null,
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: userInfo
                    }
                },
                { name: 'EXPORT'                 ,  displayName: '匯出', width: 85, pinnedRight:true, enableCellEdit: false, enableFiltering: false, cellTemplate: $templateCache.get('accessibilityToExportExcelStaus') },
                { name: 'ITEM_LIST'              ,  displayName: '報機單', enableFiltering: false, width: 86, pinnedRight:true, cellTemplate: $templateCache.get('accessibilityToOperaForJob001') },
                // { name: 'DELIVERY_ITEM_LIST'  ,  displayName: '派送單', enableFiltering: false, width: '8%', cellTemplate: $templateCache.get('accessibilityToOperaForJob003') },
                { name: 'Options'                ,  displayName: '操作', width: 67, pinnedRight:true, enableCellEdit: false, enableFiltering: false, cellTemplate: $templateCache.get('accessibilityToM') }
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
            querymain: 'oemployeeJobs',
            queryname: 'SelectOOrderList',
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
.controller('OExportDetailModalInstanceCtrl', function ($uibModalInstance, item, vmData) {
    var $ctrl = this;

    $ctrl.MdInit = function(){
        $ctrl.item = item;
        $ctrl.mdData = vmData;
    }

    $ctrl.mdDataOptions = {
        data:  '$ctrl.mdData',
        columnDefs: [
            { name: 'O_ILE_TYPE'         , displayName: '匯出類型' },
            { name: 'O_ILE_CR_USER'      , displayName: '匯出人員', cellFilter: 'userInfoFilter' },
            { name: 'O_ILE_CR_DATETIME'  , displayName: '匯出時間', cellFilter: 'datetimeFilter' }
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