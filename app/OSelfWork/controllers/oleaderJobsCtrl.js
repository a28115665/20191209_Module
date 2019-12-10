"use strict";

angular.module('app.oselfwork').controller('OLeaderJobsCtrl', function ($scope, $stateParams, $state, AuthApi, Session, toaster, $uibModal, $templateCache, uiGridConstants, RestfulApi, ocompy, opType, userInfoByGrade, $filter, $q, ToolboxApi, sysParm) {
    
    var $vm = this,
        _tasks = [];

	angular.extend(this, {
        Init : function(){
            $scope.ShowTabs = true;
            $vm.O_IMPORTDT_FROM = $filter('date')(new Date(), 'yyyy-MM-dd') + ' 00:00:00';
            $vm.O_IMPORTDT_TOXX = $filter('date')(new Date(), 'yyyy-MM-dd') + ' 23:59:59';

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
                    templateUrl: 'oopWorkMenu.html',
                    // 與航運的controller功能相同
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
                                table: 41,
                                params: {
                                    O_IL_SEQ : selectedItem.O_OL_SEQ
                                }
                            }).then(function (res) {
                                LoadOrderList();
                                toaster.pop('success', '訊息', '刪除報機單成功', 3000);
                            });
                            break;
                        // case '銷倉單':

                        //     var _tasks = [];

                        //     // 刪除銷倉單
                        //     _tasks.push({
                        //         crudType: 'Delete',
                        //         table: 10,
                        //         params: {
                        //             FLL_SEQ : selectedItem.OL_SEQ
                        //         }
                        //     });

                        //     // 刪除銷倉單標記
                        //     _tasks.push({
                        //         crudType: 'Delete',
                        //         table: 28,
                        //         params: {
                        //             FLLR_SEQ : selectedItem.OL_SEQ
                        //         }
                        //     });

                        //     RestfulApi.CRUDMSSQLDataByTask(_tasks).then(function (res) {
                        //         LoadOrderList();
                        //         toaster.pop('success', '訊息', '刪除銷倉單成功', 3000);
                        //     });
                            
                        //     break;
                        case '所有':

                            // 檢查是否補過單
                            RestfulApi.SearchMSSQLData({
                                querymain: 'oleaderJobs',
                                queryname: 'SelectOOrderSupplement',
                                params: {
                                    O_OLS_SEQ : selectedItem.O_OL_SEQ
                                }
                            }).then(function (res){
                                // console.log(res["returnData"]);

                                if(res["returnData"].length == 0){
                                    RestfulApi.DeleteMSSQLData({
                                        deletename: 'Delete',
                                        table: 40,
                                        params: {
                                            O_OL_SEQ : selectedItem.O_OL_SEQ
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
                    template: $templateCache.get('modifyOOrderList'),
                    controller: 'ModifyOOrderListModalInstanceCtrl',
                    controllerAs: '$ctrl',
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
            // 結單
            closeData : function(row){

                $vm.CheckTypeToClose(_getSelectedRows[i], function(res){
                    if(res){
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
                                table: 40,
                                params: {
                                    O_OL_FUSER : $vm.profile.U_ID,
                                    O_OL_FDATETIME : $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss')
                                },
                                condition: {
                                    O_OL_SEQ : selectedItem.O_OL_SEQ
                                }
                            }).then(function (res) {
                                LoadOrderList();
                                toaster.pop('success', '訊息', '結單完成', 3000);
                            });

                        }, function() {
                            // $log.info('Modal dismissed at: ' + new Date());
                        });
                    }
                });

                // if(row.entity.OW2_STATUS == 3 || row.entity.OW2_STATUS == 4 || row.entity.OW3_STATUS == 3 || row.entity.OW3_STATUS == 4){
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
                //                     title : "是否結單"
                //                 }
                //             }
                //         }
                //     });

                //     modalInstance.result.then(function(selectedItem) {
                //         // $ctrl.selected = selectedItem;
                //         console.log(selectedItem);

                //         RestfulApi.UpdateMSSQLData({
                //             updatename: 'Update',
                //             table: 40,
                //             params: {
                //                 O_OL_FUSER : $vm.profile.U_ID,
                //                 O_OL_FDATETIME : $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss')
                //             },
                //             condition: {
                //                 O_OL_SEQ : selectedItem.O_OL_SEQ
                //             }
                //         }).then(function (res) {
                //             LoadOrderList();
                //             toaster.pop('success', '訊息', '結單完成', 3000);
                //         });

                //     }, function() {
                //         // $log.info('Modal dismissed at: ' + new Date());
                //     });
                // }
            }
        },
        orderListOptions : {
            data:  '$vm.vmData',
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
                { name: 'OW2_STATUS'   ,  displayName: '報機單狀態', width: 103, pinnedRight:true, cellTemplate: $templateCache.get('accessibilityToForOW2'), filter: 
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
                // { name: 'W3_STATUS'   ,  displayName: '銷倉單狀態', cellTemplate: $templateCache.get('accessibilityToForW3'), filter: 
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
                { name: 'UPLOAD_STATUS' ,  displayName: '上傳狀態', width: 91, pinnedRight:true, cellTemplate: $templateCache.get('accessibilityToForOUpload'), enableFiltering: false },
                { name: 'Options'     ,  displayName: '功能', enableFiltering: false, width: 142, pinnedRight:true, cellTemplate: $templateCache.get('accessibilityToDMCForOLeader') }
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
            if(!angular.isUndefined($vm.parmData['O_SPA_AUTOPRIN'])){
                RestfulApi.UpdateMSSQLData({
                    updatename: 'Update',
                    table: 26,
                    params: {
                        O_SPA_AUTOPRIN : $vm.parmData['O_SPA_AUTOPRIN']
                    },
                    condition: {
                        SPA_KEY : 'systemParameter'
                    }
                }).then(function (res) {
                    
                    if(res['returnData'] == 1){
                        if($vm.parmData['O_SPA_AUTOPRIN']){
                            toaster.pop('info', '訊息', '開啟自動派單', 3000);
                        }else{
                            toaster.pop('info', '訊息', '關閉自動派單', 3000);
                        }
                    }

                });
            }
        },
        /**
         * [ChangeDept description] 改變部門時，指派單類型與自動分派的人需跟著改變
         */
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
                    if($filter('filter')(_getSelectedRows[i].subGridOptions.data, { O_OP_PRINCIPAL : $vm.selectAssignPrincipal }).length == 0){
                        
                        _getSelectedRows[i].subGridOptions.data.push({
                            O_OP_SEQ : _getSelectedRows[i].O_OL_SEQ,
                            O_OP_DEPT : $vm.selectAssignDept,
                            O_OP_PRINCIPAL : $vm.selectAssignPrincipal,
                            O_OP_TYPE : $vm.selectAssignOptype
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
                        if($vm.vmData[i].O_OL_CO_CODE == $vm.principalData[j].O_COD_CODE){
                            // 此data沒有此負責人就塞入資料
                            if(($vm.principalData[j].O_WHO_PRINCIPAL != null) &&
                                $filter('filter')($vm.vmData[i].subGridOptions.data, { O_OP_PRINCIPAL : $vm.principalData[j].O_WHO_PRINCIPAL }).length == 0){
                                // console.log($vm.principalData[j]);
                                $vm.vmData[i].subGridOptions.data.push({
                                    O_OP_SEQ : $vm.vmData[i].O_OL_SEQ,
                                    O_OP_DEPT : $vm.selectAssignDept,
                                    O_OP_TYPE : $vm.selectAssignOptype,
                                    O_OP_PRINCIPAL : $vm.principalData[j].O_WHO_PRINCIPAL
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

                    $vm.CheckTypeToClose(_getSelectedRows[i], function(res){
                        if(res){
                           console.log(_getSelectedRows[i]);
                            _tasks.push({
                                crudType: 'Update',
                                table: 40,
                                params: {
                                    O_OL_FUSER : $vm.profile.U_ID,
                                    O_OL_FDATETIME : $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss')
                                },
                                condition: {
                                    O_OL_SEQ : _getSelectedRows[i].O_OL_SEQ
                                }
                            }); 
                        }
                    })

                    // if(_getSelectedRows[i].OW2_STATUS == '3' || _getSelectedRows[i].OW2_STATUS == '4' || _getSelectedRows[i].OW3_STATUS == '3' || _getSelectedRows[i].OW3_STATUS == '4'){
                    //     console.log(_getSelectedRows[i]);
                    //     _tasks.push({
                    //         crudType: 'Update',
                    //         table: 40,
                    //         params: {
                    //             O_OL_FUSER : $vm.profile.U_ID,
                    //             O_OL_FDATETIME : $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss')
                    //         },
                    //         condition: {
                    //             O_OL_SEQ : _getSelectedRows[i].O_OL_SEQ
                    //         }
                    //     });
                    // }
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
                deletename: 'DeleteOOrderPrinplWithEditor',
                table: 42,
                params: {
                    O_OP_SEQ : entity.O_OL_SEQ,
                    O_OP_DEPT : $vm.selectAssignDept
                }
            });

            // Insert此單的負責人
            for(var i in entity.subGridOptions.data){
                // 如果編輯狀態不是空值表示沒有被Delete，所以不重複Insert
                if(entity.subGridOptions.data[i].O_OE_EDATETIME == null){
                    _tasks.push({
                        crudType: 'Insert',
                        table: 42,
                        params: {
                            O_OP_SEQ : entity.subGridOptions.data[i].O_OP_SEQ,
                            O_OP_DEPT : entity.subGridOptions.data[i].O_OP_DEPT,
                            O_OP_TYPE : entity.subGridOptions.data[i].O_OP_TYPE,
                            O_OP_PRINCIPAL : entity.subGridOptions.data[i].O_OP_PRINCIPAL
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
                { name: 'O_CO_NAME'      ,  displayName: '行家' },
                // { name: 'W2_BAG_COUNT' ,  displayName: '報機單(袋數)', filters: [
                //     {
                //         condition: uiGridConstants.filter.GREATER_THAN,
                //         placeholder: '最小'
                //     },
                //     {
                //         condition: uiGridConstants.filter.LESS_THAN,
                //         placeholder: '最大'
                //     }
                // ]},
                { name: 'OW2_COUNT'     ,  displayName: '報機單(小號數)', filters: [
                    {
                        condition: uiGridConstants.filter.GREATER_THAN,
                        placeholder: '最小'
                    },
                    {
                        condition: uiGridConstants.filter.LESS_THAN,
                        placeholder: '最大'
                    }
                ]},
                { name: 'OL_OW2_COUNT'   ,  displayName: '報機單(份數)', filters: [
                    {
                        condition: uiGridConstants.filter.GREATER_THAN,
                        placeholder: '最小'
                    },
                    {
                        condition: uiGridConstants.filter.LESS_THAN,
                        placeholder: '最大'
                    }
                ]},
                // { name: 'OL_W3_COUNT'   ,  displayName: '銷倉單(份數)', filters: [
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

            if($vm.O_IMPORTDT_FROM != "" && $vm.O_IMPORTDT_TOXX != ""){
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
                    _templates = 14;
                    _exportName = $filter('date')(new Date(), 'yyyyMMdd') + ' 派單狀態(海運)';
                    _queryname = "SelectOOrderListForExcel";
                    break;
                case 'hr2':
                    _templates = 15;
                    _exportName = $filter('date')(new Date(), 'yyyyMMdd') + ' 每日行家統計(海運)';
                    _queryname = "SelectOCompyStatistics";
                    _params = {
                        O_IMPORTDT_FROM: $vm.O_IMPORTDT_FROM,
                        O_IMPORTDT_TOXX: $vm.O_IMPORTDT_TOXX
                    }
                    break;
            }

            if(_exportName != null){
                ToolboxApi.ExportExcelBySql({
                    templates : _templates,
                    filename : _exportName,
                    querymain: "oleaderJobs",
                    queryname: _queryname,
                    params: _params
                }).then(function (res) {
                    // console.log(res);
                });
            }
        },
        /**
         * [OrderListOptionClass description] 功能欄位的刪除鈕
         * @param {[type]} data [description]
         */
        OrderListOptionClass : function(data){
            return $vm.CheckTypeToClose(data, function(res){
                return res ? '' : 'disabled' ;
            })
        },
        /**
         * [CheckTypeToClose description] 當報機單為3或4的狀態下就可以結案
         * @param {[type]}   data     [description]
         * @param {Function} callback [description]
         */
        CheckTypeToClose : function(data, callback){
            var _needToClose = false;

            if(data.OW2_STATUS == 3 || data.OW2_STATUS == 4){
                _needToClose = true;
            }

            return callback(_needToClose); 
        }
    });

    function LoadOrderList(){

        // 撈取OrderList資料
        RestfulApi.SearchMSSQLData({
            querymain: 'oleaderJobs',
            queryname: 'SelectOOrderList'
        }).then(function (resA){
            console.log(resA);
            var _seq = [],
                _resA = resA["returnData"] || [];

            if(_resA.length > 0){
                // _seq = [];

                for(var i in _resA){
                    _seq.push(_resA[i].O_OL_SEQ);
                }

                // 撈取每單負責人
                RestfulApi.SearchMSSQLData({
                    querymain: 'oleaderJobs',
                    queryname: 'SelectOOrderPrinpl',
                    params: {
                        O_OP_DEPT : $vm.selectAssignDept,
                        O_OP_MULTI_SEQ : _seq.toString()
                    }
                }).then(function (resB){
                    
                    var _resB = resB["returnData"] || [];

                    for(var i in _resA){

                        var _data =[];

                        for(var j in _resB){
                            if(_resA[i].O_OL_SEQ == _resB[j].O_OP_SEQ &&
                                $vm.selectAssignOptype == _resB[j].O_OP_TYPE){
                                _data.push(_resB[j]);
                            }
                        }

                        _resA[i].subGridOptions = {
                            data: _data,
                            columnDefs: [ 
                                {field: "O_OP_TYPE", name: "類別", cellFilter: 'opTypeFilter' },
                                {field: "O_OP_PRINCIPAL", name: "負責人", cellFilter: 'userInfoFilter' },
                                {field: "O_OE_EDATETIME_STATUS", name: "編輯者", cellTemplate: $templateCache.get('accessibilityToOEdited') }
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
        //                 {field: "OE_EDATETIME_STATUS", name: "編輯者", cellTemplate: $templateCache.get('accessibilityToOEdited') }
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
            case "OW2":
                $vm.selectAssignOptype = "R";
                break;
            case "OW3":
                $vm.selectAssignOptype = "W";
                break;
            case "OW1":
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

    /**
     * [LoadPrincipal description] 當天該負責人(自動分派使用)
     */
    function LoadPrincipal(){
        RestfulApi.SearchMSSQLData({
            querymain: 'oleaderJobs',
            queryname: 'WhoPrincipal',
            params: {
                O_AS_DEPT : $vm.selectAssignDept
            }
        }).then(function (res){
            console.log(res["returnData"]);
            $vm.principalData = res["returnData"] || [];
        });  
    };

    function LoadStatistics(){
        RestfulApi.SearchMSSQLData({
            querymain: 'oleaderJobs',
            queryname: 'SelectOCompyStatistics',
            params: {
                O_IMPORTDT_FROM: $vm.O_IMPORTDT_FROM,
                O_IMPORTDT_TOXX: $vm.O_IMPORTDT_TOXX
            }
        }).then(function (res){
            console.log(res["returnData"]);
            $vm.compyStatisticsData = res["returnData"];

            toaster.pop('success', '訊息', '統計查詢成功', 3000);
        });  
    };

    function LoadParm(){
        // RestfulApi.SearchMSSQLData({
        //     querymain: 'oleaderJobs',
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