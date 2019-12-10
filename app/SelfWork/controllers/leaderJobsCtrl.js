"use strict";

angular.module('app.selfwork').controller('LeaderJobsCtrl', function ($scope, $stateParams, $state, AuthApi, Session, toaster, $uibModal, $templateCache, uiGridConstants, RestfulApi, compy, opType, userInfoByGrade, $filter, $q, ToolboxApi, sysParm) {
    
    var $vm = this,
        _tasks = [];

	angular.extend(this, {
        Init : function(){
            $scope.ShowTabs = true;
            $vm.REAL_IMPORTDT_FROM = $filter('date')(new Date(), 'yyyy-MM-dd') + ' 00:00:00';
            $vm.REAL_IMPORTDT_TOXX = $filter('date')(new Date(), 'yyyy-MM-dd') + ' 23:59:59';

            if(userInfoByGrade[0].length == 0){
                toaster.pop('info', '訊息', '無員工管理', 3000);
                $vm.vmData = [];
                $vm.compyStatisticsData = [];
            }else{
                $vm.LoadData();
            }
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
                    if(userInfoByGrade[0].length == 0){
                        toaster.pop('info', '訊息', '無員工管理', 3000);
                        $vm.vmData = [];
                        $vm.compyStatisticsData = [];
                    }else{
                        $vm.selectAssignDept = userInfoByGrade[0][0].value;

                        AssignOptype();
                        LoadOrderList();
                        LoadPrincipal();
                        LoadParm();
                    }
                    break;
                case 'hr2':
                    LoadStatistics();
                    break;
            }
        },
        assignGradeData : userInfoByGrade[0],
        assignPrincipalData : userInfoByGrade[1],
        opType : opType,
        gridMethod : {
            // 刪除的選項
            gridOperation : function(row){
                // 給modal知道目前是哪個欄位操作

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
            deleteData : function(row, type){
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
                                title : "是否刪除" + type
                            }
                        }
                    }
                });

                modalInstance.result.then(function(selectedItem) {
                    // $ctrl.selected = selectedItem;
                    console.log(selectedItem);

                    switch(type){
                        case '報機單':
                            RestfulApi.DeleteMSSQLData({
                                deletename: 'Delete',
                                table: 9,
                                params: {
                                    IL_SEQ : selectedItem.OL_SEQ
                                }
                            }).then(function (res) {
                                LoadOrderList();
                                toaster.pop('success', '訊息', '刪除報機單成功', 3000);
                            });
                            break;
                        case '銷倉單':

                            var _tasks = [];

                            // 刪除銷倉單
                            _tasks.push({
                                crudType: 'Delete',
                                table: 10,
                                params: {
                                    FLL_SEQ : selectedItem.OL_SEQ
                                }
                            });

                            // 刪除銷倉單標記
                            _tasks.push({
                                crudType: 'Delete',
                                table: 28,
                                params: {
                                    FLLR_SEQ : selectedItem.OL_SEQ
                                }
                            });

                            RestfulApi.CRUDMSSQLDataByTask(_tasks).then(function (res) {
                                LoadOrderList();
                                toaster.pop('success', '訊息', '刪除銷倉單成功', 3000);
                            });
                            
                            break;
                        case '所有':

                            // 檢查是否補過單
                            RestfulApi.SearchMSSQLData({
                                querymain: 'leaderJobs',
                                queryname: 'SelectOrderSupplement',
                                params: {
                                    OLS_SEQ : selectedItem.OL_SEQ
                                }
                            }).then(function (res){
                                // console.log(res["returnData"]);

                                if(res["returnData"].length == 0){
                                    RestfulApi.DeleteMSSQLData({
                                        deletename: 'Delete',
                                        table: 18,
                                        params: {
                                            OL_SEQ : selectedItem.OL_SEQ
                                        }
                                    }).then(function (res) {
                                        LoadOrderList();
                                        toaster.pop('success', '訊息', '刪除成功', 3000);
                                    });
                                }else{
                                    toaster.pop('warning', '警告', '此單已補過單，不可直接刪除', 3000);
                                }
                            }); 
                            break;
                    }

                }, function() {
                    // $log.info('Modal dismissed at: ' + new Date());
                });
            },
            // 編輯
            modifyData : function(row){
                var modalInstance = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    template: $templateCache.get('modifyOrderList'),
                    controller: 'ModifyOrderListModalInstanceCtrl',
                    controllerAs: '$ctrl',
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
            // 結單
            closeData : function(row){

                if(row.entity.W2_STATUS == 3 || row.entity.W2_STATUS == 4 || row.entity.W3_STATUS == 3 || row.entity.W3_STATUS == 4){
                // if(row.entity.W2_STATUS == 3 && row.entity.W3_STATUS == 3 && row.entity.W1_STATUS == 3){
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
                                    title : "是否結單"
                                }
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
                                OL_FUSER : $vm.profile.U_ID,
                                OL_FDATETIME : $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss')
                            },
                            condition: {
                                OL_SEQ : selectedItem.OL_SEQ
                            }
                        }).then(function (res) {
                            LoadOrderList();
                            toaster.pop('success', '訊息', '結單完成', 3000);
                        });

                    }, function() {
                        // $log.info('Modal dismissed at: ' + new Date());
                    });
                }
            }
        },
        orderListOptions : {
            data:  '$vm.vmData',
            columnDefs: [
                { name: 'OL_SUPPLEMENT_COUNT'    ,  displayName: '補件', width: 65, cellTemplate: $templateCache.get('accessibilityToSuppleMent') },
                { name: 'OL_IMPORTDT' ,  displayName: '進口日期', cellFilter: 'dateFilter' },
                { name: 'OL_REAL_IMPORTDT' ,  displayName: '報機日期', cellFilter: 'dateFilter', cellTooltip: function (row, col) 
                    {
                        return '真實報機日期：' + $filter('dateFilter')(row.entity.OL_CR_DATETIME)
                    } 
                },
                // { name: 'OL_CO_CODE'  ,  displayName: '行家', cellFilter: 'compyFilter', filter: 
                //     {
                //         term: null,
                //         type: uiGridConstants.filter.SELECT,
                //         selectOptions: compy
                //     }
                // },
                { name: 'CO_NAME'     ,  displayName: '行家' },
                { name: 'OL_FLIGHTNO' ,  displayName: '航班' },
                { name: 'OL_MASTER'   ,  displayName: '主號' },
                { name: 'OL_COUNT'    ,  displayName: '報機單(袋數)', width: 80, enableCellEdit: false },
                { name: 'OL_PULL_COUNT',  displayName: '拉貨(袋數)', width: 80, enableCellEdit: false },
                { name: 'OL_FLL_COUNT',  displayName: '銷倉單(袋數)', width: 80, enableCellEdit: false },
                { name: 'OL_COUNTRY'  ,  displayName: '起運國別' },
                { name: 'OL_REASON'              ,  displayName: '描述', width: 100, cellTooltip: function (row, col) 
                    {
                        return row.entity.OL_REASON
                    } 
                },
                { name: 'W2_STATUS'   ,  displayName: '報機單狀態', cellTemplate: $templateCache.get('accessibilityToForW2'), filter: 
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
                // { name: 'W2'          ,  displayName: '報機單負責人', cellFilter: 'userInfoFilter' },
                { name: 'W3_STATUS'   ,  displayName: '銷倉單狀態', cellTemplate: $templateCache.get('accessibilityToForW3'), filter: 
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
                // { name: 'W3'          ,  displayName: '銷倉單負責人', cellFilter: 'userInfoFilter' },
                // { name: 'W1_STATUS'   ,  displayName: '派送單狀態', cellTemplate: $templateCache.get('accessibilityToForW1'), filter: 
                //     {
                //         term: null,
                //         type: uiGridConstants.filter.SELECT,
                //         selectOptions: [
                //             {label:'未派單', value: '0'},
                //             {label:'已派單', value: '1'},
                //             {label:'已編輯', value: '2'},
                //             {label:'已完成', value: '3'},
                //             {label:'非作業員'  , value: '4'}
                //         ]
                //     }
                // },
                // { name: 'W1'          ,  displayName: '派送單負責人', cellFilter: 'userInfoFilter' },
                { name: 'UPLOAD_STATUS' ,  displayName: '上傳狀態', cellTemplate: $templateCache.get('accessibilityToForUpload'), enableFiltering: false },
                { name: 'Options'     ,  displayName: '功能', enableFiltering: false, width: '12%', cellTemplate: $templateCache.get('accessibilityToDMCForLeader') }
            ],
            enableFiltering: true,
            enableSorting: true,
            enableColumnMenus: false,
            // enableVerticalScrollbar: false,
            paginationPageSizes: [10, 25, 50, 100],
            paginationPageSize: 100,
            expandableRowTemplate: 'expandableRowTemplate.html',
            expandableRowHeight: 150,
            enableCellEdit: false,
            onRegisterApi: function(gridApi){
                $vm.orderListGridApi = gridApi;

                gridApi.rowEdit.on.saveRow($scope, $vm.Update);
            }
        },
        AutoPrincipal : function(){
            if(!angular.isUndefined($vm.parmData['SPA_AUTOPRIN'])){
                RestfulApi.UpdateMSSQLData({
                    updatename: 'Update',
                    table: 26,
                    params: {
                        SPA_AUTOPRIN : $vm.parmData['SPA_AUTOPRIN']
                    },
                    condition: {
                        SPA_KEY : 'systemParameter'
                    }
                }).then(function (res) {
                    
                    if(res['returnData'] == 1){
                        if($vm.parmData['SPA_AUTOPRIN']){
                            toaster.pop('info', '訊息', '開啟自動派單', 3000);
                        }else{
                            toaster.pop('info', '訊息', '關閉自動派單', 3000);
                        }
                    }

                });
            }
        },
        ChangeDept : function(){
            AssignOptype();
            LoadOrderList();
            LoadPrincipal();
            SetHeaderClass();
        },
        CustomizeAssign : function(){
            if($vm.orderListGridApi.selection.getSelectedRows().length > 0){
                var _getSelectedRows = $vm.orderListGridApi.selection.getSelectedRows(),
                    _getDirtyData = [],
                    _getDirty = false;

                for(var i in _getSelectedRows){

                    // 沒有相同負責人才塞入
                    if($filter('filter')(_getSelectedRows[i].subGridOptions.data, { OP_PRINCIPAL : $vm.selectAssignPrincipal }).length == 0){
                        
                        _getSelectedRows[i].subGridOptions.data.push({
                            OP_SEQ : _getSelectedRows[i].OL_SEQ,
                            OP_DEPT : $vm.selectAssignDept,
                            OP_PRINCIPAL : $vm.selectAssignPrincipal,
                            OP_TYPE : $vm.selectAssignOptype
                        });

                        _getDirtyData.push(_getSelectedRows[i]);

                        // 表示需要更新
                        _getDirty = true;
                    }
                }

                if(_getDirty){
                    $vm.orderListGridApi.rowEdit.setRowsDirty(_getDirtyData);
                }else{
                    toaster.pop('info', '訊息', '負責人重複', 3000);
                }
                
                $vm.orderListGridApi.selection.clearSelectedRows();

            }
        },
        AutoAssign : function(){
            if($vm.principalData.length > 0){
                console.log($vm.principalData);

                var _getDirtyData = [];

                for(var i in $vm.vmData){

                    // 此負責人編輯狀態為null則刪除
                    // var _data = angular.copy($vm.vmData[i].subGridOptions.data);
                    // for(var j in _data){
                    //     if(_data[j].OE_EDATETIME == null){
                    //         $vm.vmData[i].subGridOptions.data.splice(j, 1);
                    //         console.log(j, $vm.vmData[i].subGridOptions.data);
                    //     }
                    // }

                    // 根據設定給予負責人
                    for(var j in $vm.principalData){
                        if($vm.vmData[i].OL_CO_CODE == $vm.principalData[j].COD_CODE){
                            // 此data沒有此負責人就塞入資料
                            if(($vm.principalData[j].WHO_PRINCIPAL != null) &&
                                $filter('filter')($vm.vmData[i].subGridOptions.data, { OP_PRINCIPAL : $vm.principalData[j].WHO_PRINCIPAL }).length == 0){
                                // console.log($vm.principalData[j]);
                                $vm.vmData[i].subGridOptions.data.push({
                                    OP_SEQ : $vm.vmData[i].OL_SEQ,
                                    OP_DEPT : $vm.selectAssignDept,
                                    OP_TYPE : $vm.selectAssignOptype,
                                    OP_PRINCIPAL : $vm.principalData[j].WHO_PRINCIPAL
                                });
                            }
                        }
                    }

                    // 自動分派所有單的負責人都會被更新
                    _getDirtyData.push($vm.vmData[i]);

                }

                $vm.orderListGridApi.rowEdit.setRowsDirty(_getDirtyData);
                $vm.orderListGridApi.selection.clearSelectedRows();
            }
        },
        CloseData : function(){
            if($vm.orderListGridApi.selection.getSelectedRows().length > 0){
                var _getSelectedRows = $vm.orderListGridApi.selection.getSelectedRows(),
                    _tasks = [];

                for(var i in _getSelectedRows){
                    if(_getSelectedRows[i].W2_STATUS == '3' || _getSelectedRows[i].W2_STATUS == '4' || _getSelectedRows[i].W3_STATUS == '3' || _getSelectedRows[i].W3_STATUS == '4'){
                        console.log(_getSelectedRows[i]);
                        _tasks.push({
                            crudType: 'Update',
                            table: 18,
                            params: {
                                OL_FUSER : $vm.profile.U_ID,
                                OL_FDATETIME : $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss')
                            },
                            condition: {
                                OL_SEQ : _getSelectedRows[i].OL_SEQ
                            }
                        });
                    }
                }
                
                $vm.orderListGridApi.selection.clearSelectedRows();

                if(_tasks.length == 0){
                    toaster.pop('info', '訊息', '沒有需要結單的項目', 3000);
                    return;
                }

                RestfulApi.CRUDMSSQLDataByTask(_tasks).then(function (res) {
                    LoadOrderList();
                    toaster.pop('success', '訊息', '結單完成', 3000);
                }, function (err) {

                });

            }
        },
        CancelPrincipal : function(){
            if($vm.orderListGridApi.selection.getSelectedRows().length > 0){
                var _getSelectedRows = $vm.orderListGridApi.selection.getSelectedRows(),
                    _getDirtyData = [];

                for(var i in _getSelectedRows){
                    if(_getSelectedRows[i].subGridOptions.data.length > 0){
                        _getDirtyData.push(_getSelectedRows[i]);
                    }

                    // 把負責人清空
                    _getSelectedRows[i].subGridOptions.data = [];
                }
                
                if(_getDirtyData.length > 0){
                    $vm.orderListGridApi.rowEdit.setRowsDirty(_getDirtyData);
                }
                $vm.orderListGridApi.selection.clearSelectedRows();
            }
        },
        Update : function(entity){
            console.log(entity);

            // create a fake promise - normally you'd use the promise returned by $http or $resource
            var promise = $q.defer();
            $vm.orderListGridApi.rowEdit.setSavePromise( entity, promise.promise );
        
            var _tasks = [],
                _d = new Date();

            // Delete此單的負責人
            _tasks.push({
                crudType: 'Delete',
                deletename: 'DeleteOrderPrinplWithEditor',
                table: 21,
                params: {
                    OP_SEQ : entity.OL_SEQ,
                    OP_DEPT : $vm.selectAssignDept
                }
            });

            // Insert此單的負責人
            for(var i in entity.subGridOptions.data){
                // 如果編輯狀態不是空值表示沒有被Delete，所以不重複Insert
                if(entity.subGridOptions.data[i].OE_EDATETIME == null){
                    _tasks.push({
                        crudType: 'Insert',
                        table: 21,
                        params: {
                            OP_SEQ : entity.subGridOptions.data[i].OP_SEQ,
                            OP_DEPT : entity.subGridOptions.data[i].OP_DEPT,
                            OP_TYPE : entity.subGridOptions.data[i].OP_TYPE,
                            OP_PRINCIPAL : entity.subGridOptions.data[i].OP_PRINCIPAL
                        }
                    });
                }
            }

            RestfulApi.CRUDMSSQLDataByTask(_tasks).then(function (res){
                promise.resolve();
            }, function (err) {
                toaster.pop('error', '錯誤', '更新失敗', 3000);
                promise.reject();
            }).finally(function(){
                if($vm.orderListGridApi.rowEdit.getDirtyRows().length == 0){
                    LoadOrderList();
                }
            });  
        },
        compyStatisticsOptions : {
            data:  '$vm.compyStatisticsData',
            columnDefs: [
                { name: 'CO_NAME'      ,  displayName: '行家' },
                { name: 'W2_BAG_COUNT' ,  displayName: '報機單(袋數)', filters: [
                    {
                        condition: uiGridConstants.filter.GREATER_THAN,
                        placeholder: '最小'
                    },
                    {
                        condition: uiGridConstants.filter.LESS_THAN,
                        placeholder: '最大'
                    }
                ]},
                { name: 'W2_COUNT'     ,  displayName: '報機單(小號數)', filters: [
                    {
                        condition: uiGridConstants.filter.GREATER_THAN,
                        placeholder: '最小'
                    },
                    {
                        condition: uiGridConstants.filter.LESS_THAN,
                        placeholder: '最大'
                    }
                ]},
                { name: 'OL_W2_COUNT'   ,  displayName: '報機單(份數)', filters: [
                    {
                        condition: uiGridConstants.filter.GREATER_THAN,
                        placeholder: '最小'
                    },
                    {
                        condition: uiGridConstants.filter.LESS_THAN,
                        placeholder: '最大'
                    }
                ]},
                { name: 'OL_W3_COUNT'   ,  displayName: '銷倉單(份數)', filters: [
                    {
                        condition: uiGridConstants.filter.GREATER_THAN,
                        placeholder: '最小'
                    },
                    {
                        condition: uiGridConstants.filter.LESS_THAN,
                        placeholder: '最大'
                    }
                ]},
                // { name: 'W3_COUNT'     ,  displayName: '銷倉單(件數)', filters: [
                //     {
                //         condition: uiGridConstants.filter.GREATER_THAN,
                //         placeholder: '最小'
                //     },
                //     {
                //         condition: uiGridConstants.filter.LESS_THAN,
                //         placeholder: '最大'
                //     }
                // ]},
                // { name: 'W3_BAG_COUNT' ,  displayName: '銷倉單(袋數)', filters: [
                //     {
                //         condition: uiGridConstants.filter.GREATER_THAN,
                //         placeholder: '最小'
                //     },
                //     {
                //         condition: uiGridConstants.filter.LESS_THAN,
                //         placeholder: '最大'
                //     }
                // ]},
                // { name: 'W1_COUNT'     ,  displayName: '派送單(件數)', filters: [
                //     {
                //         condition: uiGridConstants.filter.GREATER_THAN,
                //         placeholder: '最小'
                //     },
                //     {
                //         condition: uiGridConstants.filter.LESS_THAN,
                //         placeholder: '最大'
                //     }
                // ]},
                // { name: 'W1_BAG_COUNT' ,  displayName: '派送單(袋數)', filters: [
                //     {
                //         condition: uiGridConstants.filter.GREATER_THAN,
                //         placeholder: '最小'
                //     },
                //     {
                //         condition: uiGridConstants.filter.LESS_THAN,
                //         placeholder: '最大'
                //     }
                // ]}
            ],
            enableFiltering: true,
            enableSorting: true,
            enableColumnMenus: false,
            // enableVerticalScrollbar: false,
            paginationPageSizes: [10, 25, 50, 100],
            paginationPageSize: 100,
            onRegisterApi: function(gridApi){
                $vm.compyStatisticsGridApi = gridApi;
            }
        },
        LoadStatistics : function(){

            if($vm.REAL_IMPORTDT_FROM != "" && $vm.REAL_IMPORTDT_TOXX != ""){
                LoadStatistics();
            }else{
                toaster.pop('info', '訊息', '請輸入報機日期區間', 3000);
            }

        },
        ExportExcel : function(){

            var _exportName = null,
                _queryname = null,
                _templates = null,
                _params = {};

            switch($vm.defaultTab){
                case 'hr1':
                    _templates = 6;
                    _exportName = $filter('date')(new Date(), 'yyyyMMdd') + ' 派單狀態';
                    _queryname = "SelectOrderListForExcel";
                    break;
                case 'hr2':
                    _templates = 7;
                    _exportName = $filter('date')(new Date(), 'yyyyMMdd') + ' 每日行家統計';
                    _queryname = "SelectCompyStatistics";
                    _params = {
                        REAL_IMPORTDT_FROM: $vm.REAL_IMPORTDT_FROM,
                        REAL_IMPORTDT_TOXX: $vm.REAL_IMPORTDT_TOXX
                    }
                    break;
            }

            if(_exportName != null){
                ToolboxApi.ExportExcelBySql({
                    templates : _templates,
                    filename : _exportName,
                    querymain: "leaderJobs",
                    queryname: _queryname,
                    params: _params
                }).then(function (res) {
                    // console.log(res);
                });
            }
        }
    });

    function LoadOrderList(){

        RestfulApi.SearchMSSQLData({
            querymain: 'leaderJobs',
            queryname: 'SelectOrderList'
        }).then(function (resA){
            
            var _seq = [],
                _resA = resA["returnData"] || [];

            if(_resA.length > 0){
                // _seq = [];

                for(var i in _resA){
                    _seq.push(_resA[i].OL_SEQ);
                }

                RestfulApi.SearchMSSQLData({
                    querymain: 'leaderJobs',
                    queryname: 'SelectOrderPrinpl',
                    params: {
                        OP_DEPT : $vm.selectAssignDept,
                        OP_MULTI_SEQ : _seq.toString()
                    }
                }).then(function (resB){
                    
                    var _resB = resB["returnData"] || [];

                    for(var i in _resA){

                        var _data =[];

                        for(var j in _resB){
                            if(_resA[i].OL_SEQ == _resB[j].OP_SEQ &&
                                $vm.selectAssignOptype == _resB[j].OP_TYPE){
                                _data.push(_resB[j]);
                            }
                        }

                        _resA[i].subGridOptions = {
                            data: _data,
                            columnDefs: [ 
                                {field: "OP_TYPE", name: "類別", cellFilter: 'opTypeFilter' },
                                {field: "OP_PRINCIPAL", name: "負責人", cellFilter: 'userInfoFilter' },
                                {field: "OE_EDATETIME_STATUS", name: "編輯者", cellTemplate: $templateCache.get('accessibilityToEdited') }
                            ],
                            enableFiltering: false,
                            enableSorting: true,
                            enableColumnMenus: false
                        };
                        // _resA[i]["AGENT_COUNT"] = _data.length;
                    }

                    $vm.vmData = _resA;

                });  
            }

        }).finally(function() {
            SetHeaderClass();
        });  

        // RestfulApi.CRUDMSSQLDataByTask([
        //     {  
        //         crudType: 'Select',
        //         querymain: 'leaderJobs',
        //         queryname: 'SelectOrderList'
        //     },
        //     {
        //         crudType: 'Select',
        //         querymain: 'leaderJobs',
        //         queryname: 'SelectOrderPrinpl',
        //         params: {
        //             OP_DEPT : $vm.selectAssignDept
        //         }
        //     }
        // ]).then(function (res){
        //     console.log(res["returnData"]);

        //     for(var i in res["returnData"][0]){

        //         var _data =[];

        //         for(var j in res["returnData"][1]){
        //             if(res["returnData"][0][i].OL_SEQ == res["returnData"][1][j].OP_SEQ &&
        //                 $vm.selectAssignOptype == res["returnData"][1][j].OP_TYPE){
        //                 _data.push(res["returnData"][1][j]);
        //             }
        //         }

        //         res["returnData"][0][i].subGridOptions = {
        //             data: _data,
        //             columnDefs: [ 
        //                 {field: "OP_TYPE", name: "類別", cellFilter: 'opTypeFilter' },
        //                 {field: "OP_PRINCIPAL", name: "負責人", cellFilter: 'userInfoFilter' },
        //                 {field: "OE_EDATETIME_STATUS", name: "編輯者", cellTemplate: $templateCache.get('accessibilityToEdited') }
        //             ],
        //             enableFiltering: false,
        //             enableSorting: true,
        //             enableColumnMenus: false
        //         };
        //         // res["returnData"][0][i]["AGENT_COUNT"] = _data.length;
        //     }

        //     $vm.vmData = res["returnData"][0];

        // }).finally(function() {
        //     console.log($vm.vmData);
        //     SetHeaderClass();
        // });

    };

    /**
     * [ChangeStatus description] 各單負責人狀態
     * @param {[type]} pPrincipal    [description]
     * @param {[type]} pEditDatetime [description]
     * @param {[type]} pOkDatetime   [description]
     */
    function ChangeStatus(pPrincipal, pEditDatetime, pOkDatetime){
        var _value = null;

        if(pPrincipal != null && pEditDatetime == null && pOkDatetime == null){
            _value = "0";
        }
        else if(pPrincipal != null && pEditDatetime != null && pOkDatetime == null){
            _value = "1";
        }
        else if(pPrincipal != null && pEditDatetime != null && pOkDatetime != null){
            _value = "2";
        }

        return _value;
    };

    function AssignOptype(){
        // 指定何種單類
        switch($vm.selectAssignDept){
            case "W2":
                $vm.selectAssignOptype = "R";
                break;
            case "W3":
                $vm.selectAssignOptype = "W";
                break;
            case "W1":
                $vm.selectAssignOptype = "D";
                break;
            default:
                $vm.selectAssignOptype = null;
                break;
        }
    };

    function SetHeaderClass(){
        for(var i in $vm.orderListOptions.columnDefs){
            if($vm.selectAssignDept + "_STATUS" == $vm.orderListOptions.columnDefs[i].name){
                $vm.orderListOptions.columnDefs[i]['headerCellClass'] = 'txt-color-pink';
            }else{
                $vm.orderListOptions.columnDefs[i]['headerCellClass'] = null;
            }
        }
        $vm.orderListGridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
    }

    function LoadPrincipal(){
        RestfulApi.SearchMSSQLData({
            querymain: 'leaderJobs',
            queryname: 'WhoPrincipal',
            params: {
                AS_DEPT : $vm.selectAssignDept
            }
        }).then(function (res){
            console.log(res["returnData"]);
            $vm.principalData = res["returnData"];
        });  
    };

    function LoadStatistics(){
        RestfulApi.SearchMSSQLData({
            querymain: 'leaderJobs',
            queryname: 'SelectCompyStatistics',
            params: {
                REAL_IMPORTDT_FROM: $vm.REAL_IMPORTDT_FROM,
                REAL_IMPORTDT_TOXX: $vm.REAL_IMPORTDT_TOXX
            }
        }).then(function (res){
            console.log(res["returnData"]);
            $vm.compyStatisticsData = res["returnData"];

            toaster.pop('success', '訊息', '統計查詢成功', 3000);
        });  
    };

    function LoadParm(){
        // RestfulApi.SearchMSSQLData({
        //     querymain: 'leaderJobs',
        //     queryname: 'SelectParm'
        // }).then(function (res){
        //     console.log(res["returnData"]);
        //     if(res["returnData"].length > 0){
        //         $vm.parmData = res["returnData"][0];
        //     }
        // });  

        $vm.parmData = sysParm;
    };

})