"use strict";

angular.module('app.selfwork').controller('Job001Ctrl', function ($scope, $stateParams, $state, AuthApi, Session, toaster, $uibModal, $templateCache, RestfulApi, ToolboxApi, uiGridConstants, $filter, $q, bool) {
    // console.log($stateParams, $state);

    var $vm = this,
        cellClassEditabled = [];

    angular.extend(this, {
        Init : function(){
            // 不正常登入此頁面
            if($stateParams.data == null){
                ReturnToEmployeejobsPage();
            }else{

                $vm.bigBreadcrumbsItems = $state.current.name.split(".");
                $vm.bigBreadcrumbsItems.shift();

                $vm.vmData = $stateParams.data;

                // 測試用
                // if($vm.vmData == null){
                //     $vm.vmData = {
                //         OL_SEQ : 'AdminTest20170525190758',
                //         OL_IMPORTDT : '2017-04-19T10:10:47.906Z'
                //     };
                // }
                
                LoadItemList();
            }
        },
        profile : Session.Get(),
        gridMethod : {
            // 改單
            changeNature : function(row){
                console.log(row);
                
                row.entity.loading = true;
                ToolboxApi.ChangeNature({
                    ID : $vm.profile.U_ID,
                    PW : $vm.profile.U_PW,
                    NATURE : row.entity.IL_NATURE,
                    NATURE_NEW : row.entity.IL_NATURE_NEW
                }).then(function (res) {
                    var _returnData = JSON.parse(res["returnData"]),
                        needToUpdate = false;
                    // console.log(_returnData);

                    if(!angular.isUndefined(_returnData["IL_NATURE_NEW"])){
                        row.entity.IL_NATURE_NEW = _returnData["IL_NATURE_NEW"];
                        needToUpdate = true;
                    }
                    if(!angular.isUndefined(_returnData["IL_NEWUNIT"]) && _returnData["IL_NEWUNIT"] != ""){
                        row.entity.IL_NEWUNIT = _returnData["IL_NEWUNIT"];
                        needToUpdate = true;
                    }
                    if(!angular.isUndefined(_returnData["IL_NEWPLACE"]) && _returnData["IL_NEWPLACE"] != ""){
                        row.entity.IL_NEWPLACE = _returnData["IL_NEWPLACE"];
                        needToUpdate = true;
                    }
                    if(!angular.isUndefined(_returnData["IL_TAX2"]) && _returnData["IL_TAX2"] != ""){
                        row.entity.IL_TAX2 = _returnData["IL_TAX2"];
                        needToUpdate = true;
                    }
                    if(!angular.isUndefined(_returnData["IL_TAXRATE"]) && _returnData["IL_TAXRATE"] != ""){
                        row.entity.IL_TAXRATE = _returnData["IL_TAXRATE"];
                        needToUpdate = true;
                    }

                    if(needToUpdate){
                        $vm.job001GridApi.rowEdit.setRowsDirty([row.entity]);
                    }

                }).finally(function() {
                    row.entity.loading = false;
                });
            },
            // 加入黑名單
            banData : function(){

                if($vm.job001GridApi.selection.getSelectedRows().length > 0){

                    if($vm.job001GridApi.selection.getSelectedRows().length > 100){
                        toaster.pop('warning', '警告', '超過100筆，請重新選擇', 3000);
                        return;
                    }

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
                                return {};
                            },
                            show: function(){
                                return {
                                    title : "是否加入黑名單"
                                }
                            }
                        }
                    });

                    modalInstance.result.then(function(selectedItem) {

                        var _tasks = [],
                            _d = new Date();

                        // Insert黑名單
                        for(var i in $vm.job001GridApi.selection.getSelectedRows()){
                            // 如果不是黑名單的Row才需要被加入
                            if($vm.job001GridApi.selection.getSelectedRows()[i].BLFO_TRACK != true){
                                _tasks.push({
                                    crudType: 'Insert',
                                    table: 13,
                                    params: {
                                        BLFO_SEQ         : $vm.job001GridApi.selection.getSelectedRows()[i].IL_SEQ,
                                        BLFO_NEWBAGNO    : $vm.job001GridApi.selection.getSelectedRows()[i].IL_NEWBAGNO,
                                        BLFO_NEWSMALLNO  : $vm.job001GridApi.selection.getSelectedRows()[i].IL_NEWSMALLNO,
                                        BLFO_ORDERINDEX  : $vm.job001GridApi.selection.getSelectedRows()[i].IL_ORDERINDEX,
                                        BLFO_CR_USER     : $vm.profile.U_ID,
                                        BLFO_CR_DATETIME : $filter('date')(new Date, 'yyyy-MM-dd HH:mm:ss')
                                    }
                                });
                            }
                        }

                        RestfulApi.CRUDMSSQLDataByTask(_tasks).then(function (res){
                            if(res["returnData"].length > 0){

                                for(var i in $vm.job001GridApi.selection.getSelectedRows()){
                                    if($vm.job001GridApi.selection.getSelectedRows()[i].BLFO_TRACK != true){
                                        $vm.job001GridApi.selection.getSelectedRows()[i].BLFO_TRACK = true;
                                    }
                                }
                                toaster.pop('success', '訊息', '加入黑名單成功', 3000);
                            }
                        }, function (err) {
                            toaster.pop('error', '錯誤', '加入黑名單失敗', 3000);
                        }).finally(function(){
                            $vm.job001GridApi.selection.clearSelectedRows();
                            ClearSelectedColumn();
                        });  

                    }, function() {
                        // $log.info('Modal dismissed at: ' + new Date());
                    });
                }

                // console.log(row);
                // var modalInstance = $uibModal.open({
                //     animation: true,
                //     ariaLabelledBy: 'modal-title',
                //     ariaDescribedBy: 'modal-body',
                //     templateUrl: 'opAddBanModalContent.html',
                //     controller: 'OPAddBanModalInstanceCtrl',
                //     controllerAs: '$ctrl',
                //     // size: 'lg',
                //     // appendTo: parentElem,
                //     resolve: {
                //         vmData: function() {
                //             return row.entity;
                //         }
                //     }
                // });

                // modalInstance.result.then(function(selectedItem) {
                //     // $ctrl.selected = selectedItem;
                //     console.log(selectedItem);
                //     RestfulApi.InsertMSSQLData({
                //         insertname: 'Insert',
                //         table: 13,
                //         params: {
                //             BLFO_SEQ         : selectedItem.IL_SEQ,
                //             BLFO_NEWBAGNO    : selectedItem.IL_NEWBAGNO,
                //             BLFO_NEWSMALLNO  : selectedItem.IL_NEWSMALLNO,
                //             BLFO_ORDERINDEX  : selectedItem.IL_ORDERINDEX,
                //             BLFO_CR_USER     : $vm.profile.U_ID,
                //             BLFO_CR_DATETIME : $filter('date')(new Date, 'yyyy-MM-dd HH:mm:ss')
                //         }
                //     }).then(function(res) {
                //         // 加入後需要Disabled
                //         row.entity.BLFO_TRACK = true;
                //     });

                // }, function() {
                //     // $log.info('Modal dismissed at: ' + new Date());
                // });
            },
            // 刪除
            deleteData : function(){

                if($vm.job001GridApi.selection.getSelectedRows().length > 0){

                    if($vm.job001GridApi.selection.getSelectedRows().length > 100){
                        toaster.pop('warning', '警告', '超過100筆，請重新選擇', 3000);
                        return;
                    }

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
                                return {};
                            },
                            show: function(){
                                return {
                                    title : "是否刪除"
                                }
                            }
                        }
                    });

                    modalInstance.result.then(function(selectedItem) {

                        var _tasks = [],
                            _d = new Date();

                        // Delete資料
                        for(var i in $vm.job001GridApi.selection.getSelectedRows()){
                            _tasks.push({
                                crudType: 'Delete',
                                table: 9,
                                params: {
                                    IL_SEQ         : $vm.job001GridApi.selection.getSelectedRows()[i].IL_SEQ,
                                    IL_NEWBAGNO    : $vm.job001GridApi.selection.getSelectedRows()[i].IL_NEWBAGNO,
                                    IL_NEWSMALLNO  : $vm.job001GridApi.selection.getSelectedRows()[i].IL_NEWSMALLNO,
                                    IL_ORDERINDEX  : $vm.job001GridApi.selection.getSelectedRows()[i].IL_ORDERINDEX
                                }
                            });
                        }

                        RestfulApi.CRUDMSSQLDataByTask(_tasks).then(function (res){
                            if(res["returnData"].length > 0){
                                toaster.pop('success', '訊息', '刪除資料成功', 3000);
                            }
                        }, function (err) {
                            toaster.pop('error', '錯誤', '刪除資料失敗', 3000);
                        }).finally(function(){
                            $vm.job001GridApi.selection.clearSelectedRows();
                            // ClearSelectedColumn();
                            LoadItemList();
                        });  

                    }, function() {
                        // $log.info('Modal dismissed at: ' + new Date());
                    });
                }
            },
            // 拉貨
            pullGoods : function(row){
                console.log(row.entity);

                var modalInstance = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'pullGoodsModalContent.html',
                    controller: 'PullGoodsModalInstanceCtrl',
                    controllerAs: '$ctrl',
                    backdrop: 'static',
                    // size: 'lg',
                    // appendTo: parentElem,
                    resolve: {
                        vmData: function() {
                            return row.entity;
                        }
                    }
                });

                modalInstance.result.then(function(selectedItem) {
                    console.log(selectedItem);
                    
                    var _task = [];

                    // 儲存拉貨資料
                    _task.push({
                        crudType: 'Insert',
                        table: 19,
                        params: {
                            PG_SEQ         : selectedItem.IL_SEQ,
                            PG_BAGNO       : selectedItem.IL_BAGNO,
                            PG_REASON      : selectedItem.PG_REASON,
                            PG_CR_USER     : $vm.profile.U_ID,
                            PG_CR_DATETIME : $filter('date')(new Date, 'yyyy-MM-dd HH:mm:ss')
                        }
                    });

                    RestfulApi.CRUDMSSQLDataByTask(_task).then(function (res){

                        if(res["returnData"].length > 0){
                            
                            for(var i in $vm.job001Data){
                                if($vm.job001Data[i].IL_BAGNO == selectedItem.IL_BAGNO){
                                    $vm.job001Data[i].PG_PULLGOODS = true;
                                }
                            }

                        }
                    });

                    // RestfulApi.InsertMSSQLData({
                    //     insertname: 'Insert',
                    //     table: 19,
                    //     params: {
                    //         PG_SEQ         : selectedItem.IL_SEQ,
                    //         PG_BAGNO       : selectedItem.IL_BAGNO,
                    //         PG_REASON      : selectedItem.PG_REASON,
                    //         PG_CR_USER     : $vm.profile.U_ID,
                    //         PG_CR_DATETIME : $filter('date')(new Date, 'yyyy-MM-dd HH:mm:ss')
                    //     }
                    // }).then(function (res) {
                    //     for(var i in $vm.job001Data){
                    //         if($vm.job001Data[i].IL_BAGNO == selectedItem.IL_BAGNO){
                    //             $vm.job001Data[i].PG_PULLGOODS = true;
                    //         }
                    //     }
                    //     // LoadItemList();
                    // });

                }, function() {
                    // $log.info('Modal dismissed at: ' + new Date());
                });
            },
            // // 取消拉貨
            // cancelPullGoods : function(row){
            //     console.log(row.entity);
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
            //                 return {};
            //             }
            //         }
            //     });

            //     modalInstance.result.then(function(selectedItem) {
            //         // $ctrl.selected = selectedItem;
            //         console.log(selectedItem);
                    
            //         RestfulApi.DeleteMSSQLData({
            //             deletename: 'Delete',
            //             table: 19,
            //             params: {
            //                 PG_SEQ         : selectedItem.IL_SEQ,
            //                 PG_BAGNO       : selectedItem.IL_BAGNO
            //             }
            //         }).then(function (res) {
            //             LoadItemList();
            //         });

            //     }, function() {
            //         // $log.info('Modal dismissed at: ' + new Date());
            //     });
            // }
            // 特貨
            specialGoods : function(row){
                console.log(row);
                
                var modalInstance = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'specialGoodsModalContent.html',
                    controller: 'SpecialGoodsModalInstanceCtrl',
                    controllerAs: '$ctrl',
                    size: 'sm',
                    backdrop: 'static',
                    // appendTo: parentElem,
                    resolve: {
                        items: function() {
                            return row.entity;
                        },
                        specialGoods: function(SysCode) {
                            return SysCode.get('SpecialGoods');
                        }
                    }
                });

                modalInstance.result.then(function(selectedItem) {

                    console.log(selectedItem);

                    if(selectedItem.SPG_TYPE == null){
                        RestfulApi.DeleteMSSQLData({
                            deletename: 'Delete',
                            table: 20,
                            params: {
                                SPG_SEQ         : selectedItem.IL_SEQ,
                                SPG_NEWBAGNO    : selectedItem.IL_NEWBAGNO,
                                SPG_NEWSMALLNO  : selectedItem.IL_NEWSMALLNO,
                                SPG_ORDERINDEX  : selectedItem.IL_ORDERINDEX
                            }
                        }).then(function (res) {
                            // 變更特貨類型
                            row.entity.SPG_SPECIALGOODS = 0;
                        });
                    }else{
                        RestfulApi.UpsertMSSQLData({
                            upsertname: 'Upsert',
                            table: 20,
                            params: {
                                SPG_TYPE        : selectedItem.SPG_TYPE,
                                SPG_CR_USER     : $vm.profile.U_ID,
                                SPG_CR_DATETIME : $filter('date')(new Date, 'yyyy-MM-dd HH:mm:ss')
                            },
                            condition: {
                                SPG_SEQ         : selectedItem.IL_SEQ,
                                SPG_NEWBAGNO    : selectedItem.IL_NEWBAGNO,
                                SPG_NEWSMALLNO  : selectedItem.IL_NEWSMALLNO,
                                SPG_ORDERINDEX  : selectedItem.IL_ORDERINDEX
                            }
                        }).then(function (res) {
                            // 變更特貨類型
                            row.entity.SPG_SPECIALGOODS = selectedItem.SPG_TYPE;
                        });
                    }

                }, function() {
                    // $log.info('Modal dismissed at: ' + new Date());
                });
            }
        },
        job001Options : {
            data: '$vm.job001Data',
            columnDefs: [
                { name: 'isSelected'    , displayName: '選擇', width: 50, pinnedLeft:true, enableCellEdit: false, cellFilter: 'booleanFilter', filter: 
                    {
                        term: null,
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: bool
                    }
                },
                { name: 'IL_SUPPLEMENT_COUNT', displayName: '補件', width: 50, pinnedLeft:true, enableCellEdit: false },
                { name: 'Index'         , displayName: '序列', width: 50, pinnedLeft:true, enableFiltering: false, enableCellEdit: false },
                { name: 'IL_REMARK'     , displayName: '備註', width: 100, headerCellClass: 'text-primary' },
                { name: 'IL_G1'         , displayName: '報關種類', width: 80, headerCellClass: 'text-primary' },
                { name: 'IL_MERGENO'    , displayName: '併票號', width: 80, headerCellClass: 'text-primary' },
                { name: 'BAGNO_MATCH'   , displayName: '內貨', width: 50, enableCellEdit: false, cellTemplate: $templateCache.get('accessibilityToInternalGoods'), filter: 
                    {
                        term: null,
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: [
                            {label:'否', value: '0'},
                            {label:'是', value: '1'}
                        ]
                    }
                },
                { name: 'IL_BAGNO'      , displayName: '袋號', width: 80, headerCellClass: 'text-primary' },
                { name: 'IL_SMALLNO'    , displayName: '小號', width: 110, headerCellClass: 'text-primary' },
                { name: 'IL_NATURE'     , displayName: '品名', width: 120, enableCellEdit: false, cellTooltip: function (row, col) 
                    {
                        return row.entity.IL_NATURE
                    } 
                },
                { name: 'IL_NATURE_NEW' , displayName: '新品名', width: 120, headerCellClass: 'text-primary', cellTooltip: function (row, col) 
                    {
                        return row.entity.IL_NATURE_NEW
                    } 
                },
                { name: 'IL_TAX2'       , displayName: '稅則', width: 100, headerCellClass: 'text-primary' },
                { name: 'ChangeNature'  , displayName: '改單', width: 50, enableCellEdit: false, enableSorting:false, cellTemplate: $templateCache.get('accessibilityToChangeNature'), cellClass: 'cell-class-no-style' },
                { name: 'IL_CTN'        , displayName: '件數', width: 50, headerCellClass: 'text-primary' },
                { name: 'IL_PLACE'      , displayName: '產地', width: 50, enableCellEdit: false },
                { name: 'IL_NEWPLACE'   , displayName: '新產地', width: 70, headerCellClass: 'text-primary' },
                { name: 'IL_WEIGHT'     , displayName: '重量', width: 70, enableCellEdit: false, filters: [
                    {
                        condition: uiGridConstants.filter.GREATER_THAN,
                        placeholder: '最小'
                    },
                    {
                        condition: uiGridConstants.filter.LESS_THAN,
                        placeholder: '最大'
                    }
                ]},
                { name: 'IL_WEIGHT_NEW' , displayName: '新重量', width: 70, headerCellClass: 'text-primary', filters: [
                    {
                        condition: uiGridConstants.filter.GREATER_THAN,
                        placeholder: '最小'
                    },
                    {
                        condition: uiGridConstants.filter.LESS_THAN,
                        placeholder: '最大'
                    }
                ]},
                { name: 'IL_PCS'        , displayName: '數量', width: 70, enableCellEdit: false, filters: [
                    {
                        condition: uiGridConstants.filter.GREATER_THAN,
                        placeholder: '最小'
                    },
                    {
                        condition: uiGridConstants.filter.LESS_THAN,
                        placeholder: '最大'
                    }  
                ]},
                { name: 'IL_NEWPCS'     , displayName: '新數量', width: 70, headerCellClass: 'text-primary', filters: [
                    {
                        condition: uiGridConstants.filter.GREATER_THAN,
                        placeholder: '最小'
                    },
                    {
                        condition: uiGridConstants.filter.LESS_THAN,
                        placeholder: '最大'
                    }
                ]},
                { name: 'IL_UNIVALENT'  , displayName: '單價', width: 70, enableCellEdit: false, filters: [
                    {
                        condition: uiGridConstants.filter.GREATER_THAN,
                        placeholder: '最小'
                    },
                    {
                        condition: uiGridConstants.filter.LESS_THAN,
                        placeholder: '最大'
                    }
                ]},
                { name: 'IL_UNIVALENT_NEW', displayName: '新單價', width: 70, headerCellClass: 'text-primary', filters: [
                    {
                        condition: uiGridConstants.filter.GREATER_THAN,
                        placeholder: '最小'
                    },
                    {
                        condition: uiGridConstants.filter.LESS_THAN,
                        placeholder: '最大'
                    }
                ]},
                { name: 'IL_FINALCOST'  , displayName: '完稅價格', width: 80, headerCellClass: 'text-primary', filters: [
                    {
                        condition: uiGridConstants.filter.GREATER_THAN,
                        placeholder: '最小'
                    },
                    {
                        condition: uiGridConstants.filter.LESS_THAN,
                        placeholder: '最大'
                    }
                ]},
                { name: 'IL_UNIT'       , displayName: '單位', width: 70, enableCellEdit: false },
                { name: 'IL_NEWUNIT'    , displayName: '新單位', width: 70, headerCellClass: 'text-primary' },
                { name: 'IL_GETNO'      , displayName: '收件者統編', width: 100, headerCellClass: 'text-primary' },
                { name: 'IL_EXNO'       , displayName: '匯出統編', width: 80, headerCellClass: 'text-primary' },
                { name: 'IL_SENDNAME'   , displayName: '寄件人', width: 80, enableCellEdit: false },
                { name: 'IL_NEWSENDNAME', displayName: '新寄件人', width: 80, headerCellClass: 'text-primary' },
                { name: 'IL_TAX'        , displayName: '稅費歸屬', width: 80, headerCellClass: 'text-primary' },
                { name: 'IL_GETNAME'    , displayName: '收件人公司', width: 100, enableCellEdit: false },
                { name: 'IL_GETNAME_NEW', displayName: '新收件人公司', width: 100, headerCellClass: 'text-primary' },
                { name: 'IL_GETADDRESS' , displayName: '收件地址', width: 300, headerCellClass: 'text-primary' },
                { name: 'IL_GETADDRESS_NEW' , displayName: '新收件地址', width: 300, headerCellClass: 'text-primary' },
                { name: 'IL_GETTEL'     , displayName: '收件電話', width: 100, headerCellClass: 'text-primary' },
                { name: 'IL_EXTEL'      , displayName: '匯出電話', width: 100, headerCellClass: 'text-primary' },
                { name: 'IL_TRCOM'      , displayName: '派送公司', width: 100, headerCellClass: 'text-primary' },
                { name: 'Options'       , displayName: '操作', width: 120, enableCellEdit: false, enableSorting:false, enableFiltering: false, cellTemplate: $templateCache.get('accessibilityToJob001'), pinnedRight:true, cellClass: 'cell-class-no-style' }
            ],
            // rowTemplate: '<div> \
            //                 <div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="row.entity.BLFO_TRACK != null ? \'cell-class-pull cell-class-ban\' : \'\'" ui-grid-cell></div> \
            //               </div>',
            rowTemplate: '<div> \
                            <div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{\'cell-class-ban\' : row.entity.BLFO_TRACK != null, \'cell-class-pull\' : row.entity.PG_PULLGOODS == true, \'cell-class-special\' : row.entity.SPG_SPECIALGOODS != 0}" ui-grid-cell></div> \
                          </div>',
            enableFiltering: true,
            enableSorting: true,
            enableColumnMenus: false,
            // enableVerticalScrollbar: false,
		    enableRowSelection: true,
    		enableSelectAll: true,
            paginationPageSizes: [50, 100, 150, 200, 250, 300],
            paginationPageSize: 100,
            // rowEditWaitInterval: -1,
            onRegisterApi: function(gridApi){
                $vm.job001GridApi = gridApi;

                gridApi.rowEdit.on.saveRow($scope, $vm.Update);

                gridApi.edit.on.afterCellEdit($scope, CalculationFinalCost);

                gridApi.selection.on.rowSelectionChanged($scope, function(rowEntity, colDef, newValue, oldValue){
                    rowEntity.entity["isSelected"] = rowEntity.isSelected;
                });

                gridApi.selection.on.rowSelectionChangedBatch($scope, function(rowEntity, colDef, newValue, oldValue){
                    for(var i in rowEntity){
                        rowEntity[i].entity["isSelected"] = rowEntity[i].isSelected;
                    }
                });
            }
        },
        // 整理報關種類為Y
        SortoutG1ForY: function(){

            var _g1ForY = $filter('filter')($vm.job001Data, {IL_G1: 'Y'});

            if(_g1ForY.length > 0){

                for(var i in _g1ForY){
                    G1ForY(_g1ForY[i]);
                }

                $vm.job001GridApi.rowEdit.setRowsDirty(_g1ForY);
            }

        },
        // 併票
        MergeNo: function(){
            if($vm.job001GridApi.selection.getSelectedRows().length == 0) {
                toaster.pop('info', '訊息', '尚未勾選資料。', 3000);
                return;
            }

            // 取得第一個袋號當併票號
            var _mergeNo = $vm.job001GridApi.selection.getSelectedRows()[0].IL_BAGNO,
                _natureNew = [],
                _ilTax2 = [],
                _bagNo = [];

            // 塞入新品名
            for(var i in $vm.job001GridApi.selection.getSelectedRows()){
                // console.log($vm.job001GridApi.selection.getSelectedRows()[i].IL_NATURE_NEW);
                if($vm.job001GridApi.selection.getSelectedRows()[i].IL_NATURE_NEW){
                    _natureNew.push($vm.job001GridApi.selection.getSelectedRows()[i].IL_NATURE_NEW);
                }

                if($vm.job001GridApi.selection.getSelectedRows()[i].IL_TAX2){
                    _ilTax2.push($vm.job001GridApi.selection.getSelectedRows()[i].IL_TAX2);
                }

                // 算出袋數 重複不塞入
                if($filter('filter')(_bagNo, $vm.job001GridApi.selection.getSelectedRows()[i].IL_BAGNO).length == 0){
                    _bagNo.push($vm.job001GridApi.selection.getSelectedRows()[i].IL_BAGNO);
                }

            }
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'mergeNoModalContent.html',
                controller: 'MergeNoModalInstanceCtrl',
                controllerAs: '$ctrl',
                backdrop: 'static',
                // size: 'lg',
                // appendTo: parentElem,
                resolve: {
                    mergeNo: function() {
                        return _mergeNo;
                    },
                    natureNew: function() {
                        return _natureNew;
                    },
                    ilTax2: function() {
                        return _ilTax2;
                    },
                    bagNo: function(){
                        return _bagNo;
                    }
                }
            });

            modalInstance.result.then(function(selectedItem) {
                // $ctrl.selected = selectedItem;
                console.log(selectedItem);

                // 變更併票號與新品名
                for(var i in $vm.job001GridApi.selection.getSelectedRows()){
                    var _index = $vm.job001GridApi.selection.getSelectedRows()[i].Index;
                    $vm.job001Data[_index-1].IL_MERGENO = selectedItem.mergeNo;
                    $vm.job001Data[_index-1].IL_NATURE_NEW = selectedItem.natureNew;
                    $vm.job001Data[_index-1].IL_TAX2 = selectedItem.ilTax2;
                }

                $vm.job001GridApi.rowEdit.setRowsDirty($vm.job001GridApi.selection.getSelectedRows());
                $vm.job001GridApi.selection.clearSelectedRows();
                ClearSelectedColumn();
            }, function() {
                // $log.info('Modal dismissed at: ' + new Date());
            });
        },
        // 取消併票
        CancelNo: function(){
            if($vm.job001GridApi.selection.getSelectedRows().length == 0) {
                toaster.pop('info', '訊息', '尚未勾選資料。', 3000);
                return;
            }

            for(var i in $vm.job001GridApi.selection.getSelectedRows()){
                var _index = $vm.job001GridApi.selection.getSelectedRows()[i].Index;
                $vm.job001Data[_index-1].IL_MERGENO = null;
                // $vm.job001Data[_index-1].IL_NATURE_NEW = null;
            }

            $vm.job001GridApi.rowEdit.setRowsDirty($vm.job001GridApi.selection.getSelectedRows());
            $vm.job001GridApi.selection.clearSelectedRows();
            ClearSelectedColumn();
        },
        // 特貨註記
        MultiSpecialGoods: function(){
            if($vm.job001GridApi.selection.getSelectedRows().length == 0) {
                toaster.pop('info', '訊息', '尚未勾選資料。', 3000);
                return;
            }
            if($vm.job001GridApi.selection.getSelectedRows().length > 100) {
                toaster.pop('info', '訊息', '超過100筆，請重新選擇筆數', 3000);
                return;
            }

            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'specialGoodsModalContent.html',
                controller: 'MultiSpecialGoodsModalInstanceCtrl',
                controllerAs: '$ctrl',
                size: 'sm',
                backdrop: 'static',
                // appendTo: parentElem,
                resolve: {
                    specialGoods: function(SysCode) {
                        return SysCode.get('SpecialGoods');
                    }
                }
            });

            modalInstance.result.then(function(selectedItem) {

                // console.log(selectedItem);

                var _task = [];

                for(var i in $vm.job001GridApi.selection.getSelectedRows()){

                    if(angular.isUndefined(selectedItem)){
                        _task.push({
                            crudType: 'Delete',
                            table: 20,
                            params: {
                                SPG_SEQ         : $vm.job001GridApi.selection.getSelectedRows()[i].IL_SEQ,
                                SPG_NEWBAGNO    : $vm.job001GridApi.selection.getSelectedRows()[i].IL_NEWBAGNO,
                                SPG_NEWSMALLNO  : $vm.job001GridApi.selection.getSelectedRows()[i].IL_NEWSMALLNO,
                                SPG_ORDERINDEX  : $vm.job001GridApi.selection.getSelectedRows()[i].IL_ORDERINDEX
                            }
                        });
                    }else{
                        _task.push({
                            crudType: 'Upsert',
                            table: 20,
                            params: {
                                SPG_TYPE        : selectedItem.SPG_TYPE,
                                SPG_CR_USER     : $vm.profile.U_ID,
                                SPG_CR_DATETIME : $filter('date')(new Date, 'yyyy-MM-dd HH:mm:ss')
                            },
                            condition: {
                                SPG_SEQ         : $vm.job001GridApi.selection.getSelectedRows()[i].IL_SEQ,
                                SPG_NEWBAGNO    : $vm.job001GridApi.selection.getSelectedRows()[i].IL_NEWBAGNO,
                                SPG_NEWSMALLNO  : $vm.job001GridApi.selection.getSelectedRows()[i].IL_NEWSMALLNO,
                                SPG_ORDERINDEX  : $vm.job001GridApi.selection.getSelectedRows()[i].IL_ORDERINDEX
                            }
                        });
                    }

                }

                RestfulApi.CRUDMSSQLDataByTask(_task).then(function (res){

                    if(res["returnData"].length > 0){
                        // 變更特貨類型
                        for(var i in $vm.job001GridApi.selection.getSelectedRows()){
                            if(angular.isUndefined(selectedItem)){
                                $vm.job001GridApi.selection.getSelectedRows()[i].SPG_SPECIALGOODS = 0;
                            }else{
                                $vm.job001GridApi.selection.getSelectedRows()[i].SPG_SPECIALGOODS = selectedItem.SPG_TYPE;
                            }
                        }

                        $vm.job001GridApi.selection.clearSelectedRows();
                        ClearSelectedColumn();
                    }
                });

            }, function() {
                // $log.info('Modal dismissed at: ' + new Date());
            });
        },
        /**
         * [PullGoods description] 拉貨
         */
        PullGoods: function(){
            if($vm.job001GridApi.selection.getSelectedRows().length == 0) {
                toaster.pop('info', '訊息', '尚未勾選資料。', 3000);
                return;
            }
            if($vm.job001GridApi.selection.getSelectedRows().length > 100) {
                toaster.pop('info', '訊息', '超過100筆，請重新選擇筆數', 3000);
                return;
            }

            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'pullGoodsModalContent.html',
                controller: 'PullGoodsModalInstanceCtrl',
                controllerAs: '$ctrl',
                backdrop: 'static',
                // size: 'lg',
                // appendTo: parentElem,
                resolve: {
                    vmData: function() {
                        return {};
                    }
                }
            });

            modalInstance.result.then(function(selectedItem) {
                // console.log(selectedItem);

                var _seq = $vm.job001GridApi.selection.getSelectedRows()[0].IL_SEQ,
                    _bagNo = [];

                for(var i in $vm.job001GridApi.selection.getSelectedRows()){
                    if($vm.job001GridApi.selection.getSelectedRows()[i].IL_BAGNO.length != 8){
                        toaster.pop('warning', '警告', '序列'+$vm.job001GridApi.selection.getSelectedRows()[i].Index+'的袋號異常，拉貨中止。', 3000);
                        return;
                    }

                    if(_bagNo.indexOf($vm.job001GridApi.selection.getSelectedRows()[i].IL_BAGNO) == -1){
                        _bagNo.push($vm.job001GridApi.selection.getSelectedRows()[i].IL_BAGNO);
                    }
                }

                var _task = [];

                for(var i in _bagNo){

                    _task.push({
                        crudType: 'Insert',
                        table: 19,
                        params: {
                            PG_SEQ         : _seq,
                            PG_BAGNO       : _bagNo[i],
                            PG_REASON      : selectedItem.PG_REASON,
                            PG_CR_USER     : $vm.profile.U_ID,
                            PG_CR_DATETIME : $filter('date')(new Date, 'yyyy-MM-dd HH:mm:ss')
                        }
                    });

                }

                RestfulApi.CRUDMSSQLDataByTask(_task).then(function (res){

                    if(res["returnData"].length > 0){
                        LoadItemList();

                        // $vm.job001GridApi.selection.clearSelectedRows();
                        // ClearSelectedColumn();
                    }
                });

            }, function() {
                // $log.info('Modal dismissed at: ' + new Date());
            });

        },
        /**
         * [DoTax description] 稅則
         */
        DoTax: function(){
            if($vm.job001GridApi.selection.getSelectedRows().length == 0) {
                toaster.pop('info', '訊息', '尚未勾選資料。', 3000);
                return;
            }

            $vm.DoTaxLoading = true;

            var _natureNewList = [];
            for(var i in $vm.job001GridApi.selection.getSelectedRows()){
                if($vm.job001GridApi.selection.getSelectedRows()[i].IL_NATURE_NEW != null && $vm.job001GridApi.selection.getSelectedRows()[i].IL_NATURE_NEW != ''){
                    _natureNewList.push({
                        "Nature_NEW": $vm.job001GridApi.selection.getSelectedRows()[i].IL_NATURE_NEW,
                        "RowIndex": $vm.job001GridApi.selection.getSelectedRows()[i].Index
                    });
                }
            }

            if(_natureNewList.length == 0){
                toaster.pop('info', '訊息', '無新品名資料。', 3000);
                return;
            }

            ToolboxApi.DoTax({
                ID : $vm.profile.U_ID,
                PW : $vm.profile.U_PW,
                NATURE_NEW_LIST : _natureNewList
            }).then(function (res) {
                var _returnData = JSON.parse(res["returnData"]);
                // console.log(_returnData);

                for(var i in _returnData){
                    $vm.job001Data[parseInt(_returnData[i].RowIndex) - 1].IL_TAX2 = _returnData[i].Tax;
                    $vm.job001Data[parseInt(_returnData[i].RowIndex) - 1].IL_TAXRATE = _returnData[i].TaxRate;
                    $vm.job001GridApi.rowEdit.setRowsDirty([$vm.job001Data[parseInt(_returnData[i].RowIndex) - 1]]);
                }

                $vm.job001GridApi.selection.clearSelectedRows();

            }).finally(function() {
                $vm.DoTaxLoading = false;
            });
        },
        ExportExcel: function(){
            console.log($vm.vmData);

            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'excelMenu.html',
                controller: 'ExcelMenuModalInstanceCtrl',
                controllerAs: '$ctrl',
                // scope: $scope,
                size: 'sm',
                // windowClass: 'center-modal',
                // appendTo: parentElem
            });

            modalInstance.result.then(function(selectedItem) {
                // $ctrl.selected = selectedItem;
                console.log(selectedItem);

                var _templates = angular.copy(selectedItem),
                    _exportName = $filter('date')($vm.vmData.OL_IMPORTDT, 'yyyyMMdd', 'GMT') + ' ' + 
                                  $filter('compyFilter')($vm.vmData.OL_CO_CODE) + ' ' + 
                                  $vm.vmData.OL_FLIGHTNO + ' ' +
                                  $vm.vmData.OL_COUNT + '袋 ' +
                                  $vm.vmData.OL_PULL_COUNT + '袋',
                    _queryname = null,
                    _params = {
                        OL_MASTER : $vm.vmData.OL_MASTER,
                        OL_IMPORTDT : $filter('date')($vm.vmData.OL_IMPORTDT, 'yyyy-MM-dd', 'GMT'),
                        OL_FLIGHTNO : $vm.vmData.OL_FLIGHTNO,
                        OL_COUNTRY : $vm.vmData.OL_COUNTRY,                
                        IL_SEQ : $vm.vmData.OL_SEQ
                    };

                switch(selectedItem){
                    // 關貿格式(G1)
                    case "0G1":
                        _templates = "0";
                        _queryname = "SelectItemListForEx0";
                        _params["IL_G1"] = "'G1'";
                        break;
                    // 關貿格式(X2)
                    case "0X2":
                        _templates = "13";
                        _queryname = "SelectItemListForEx12";
                        _params["IL_G1"] = "'','X2','Y'";
                        // 不包含併X3(也就是mergeno是null)
                        _params["IL_MERGENO"] = null;
                        _params["OL_CO_NAME"] = $filter('compyFilter')($vm.vmData.OL_CO_CODE);
                        break;
                    // 關貿格式(X3)
                    case "0X3":
                        _templates = "0";
                        _queryname = "SelectItemListForEx0";
                        _params["IL_G1"] = "'X3'";
                        break;
                    // 關貿格式(併X3)
                    case "0MX3":
                        _templates = "10";
                        _queryname = "SelectItemListForEx0MX3";
                        _params["CO_NAME"] = $vm.vmData.CO_NAME
                        break;
                    // 介宏格式
                    case "8":
                        _templates = "8";
                        _queryname = "SelectItemListForEx8";
                        break;
                }

                if(_queryname != null){

                    // 選擇筆數匯出
                    if($vm.job001GridApi.selection.getSelectedRows().length > 0){
                        var _newSmallNo = [];
                        for(var i in $vm.job001GridApi.selection.getSelectedRows()){
                            _newSmallNo.push($vm.job001GridApi.selection.getSelectedRows()[i].IL_NEWSMALLNO);
                        }

                        // 加入選擇的筆數至SQL條件
                        _params["NewSmallNo"] = "'"+_newSmallNo.join("','")+"'";

                    }

                    ToolboxApi.ExportExcelBySql({
                        templates : _templates,
                        filename : _exportName,
                        querymain: 'job001',
                        queryname: _queryname,
                        params: _params
                    }).then(function (res) {
                        // console.log(res);
                    
                        $vm.vmData.TRADE_EXPORT += 1;

                        RestfulApi.InsertMSSQLData({
                            insertname: 'Insert',
                            table: 33,
                            params: {
                                ILE_SEQ : $vm.vmData.OL_SEQ,
                                ILE_TYPE : selectedItem,
                                ILE_CR_DATETIME : $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                                ILE_CR_USER : $vm.profile.U_ID
                            }
                        }).then(function (res) {
                            
                        });
                    });
                }

            }, function() {
                // $log.info('Modal dismissed at: ' + new Date());
            });
        },
        // 匯出班機表欄位
        ExportAirportSchema : function(){
            var _exportName = $filter('date')($vm.vmData.OL_IMPORTDT, 'yyyyMMdd', 'GMT') + ' ' + 
                              $filter('compyFilter')($vm.vmData.OL_CO_CODE) + ' ' +
                              $vm.vmData.OL_FLIGHTNO + ' ' +
                              // ($vm.vmData.OL_COUNT - $vm.vmData.OL_PULL_COUNT) + '袋';
                              $vm.vmData.OL_COUNT + '袋 ' +
                              $vm.vmData.OL_PULL_COUNT + '袋';

            // 如果是拉貨 最後要補上原報機日期
            if($vm.vmData.ORI_OL_IMPORTDT != null){
                _exportName += ' ' + $filter('date')($vm.vmData.ORI_OL_IMPORTDT, 'yyyyMMdd', 'GMT')
            }

            // 選擇筆數匯出
            if($vm.job001GridApi.selection.getSelectedRows().length > 0){

                // if($vm.job001GridApi.selection.getSelectedRows().length < 1000){

                    var _newSmallNo = [];
                    for(var i in $vm.job001GridApi.selection.getSelectedRows()){
                        _newSmallNo.push($vm.job001GridApi.selection.getSelectedRows()[i].IL_NEWSMALLNO);
                    }

                    ToolboxApi.ExportExcelBySql({
                        templates : 11,
                        filename : _exportName,
                        querymain: 'job001',
                        queryname: 'SelectItemListForFlight',
                        params: {
                            OL_MASTER : $vm.vmData.OL_MASTER,
                            OL_IMPORTDT : $filter('date')($vm.vmData.OL_IMPORTDT, 'yyyy-MM-dd', 'GMT'),
                            OL_FLIGHTNO : $vm.vmData.OL_FLIGHTNO,
                            OL_COUNTRY : $vm.vmData.OL_COUNTRY,               
                            IL_SEQ : $vm.vmData.OL_SEQ,
                            NewSmallNo : "'"+_newSmallNo.join("','")+"'"
                        }
                    }).then(function (res) {
                        // console.log(res);
                        
                        $vm.vmData.FLIGHT_EXPORT += 1;
                    
                        RestfulApi.InsertMSSQLData({
                            insertname: 'Insert',
                            table: 33,
                            params: {
                                ILE_SEQ : $vm.vmData.OL_SEQ,
                                ILE_TYPE : 11,
                                ILE_CR_DATETIME : $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                                ILE_CR_USER : $vm.profile.U_ID
                            }
                        }).then(function (res) {
                            
                        });
                    });
                // }else{
                //     toaster.pop('info', '訊息', '超過300筆，請重新選擇筆數', 3000);
                // }
            }
            // 全部匯出
            else{
                ToolboxApi.ExportExcelBySql({
                    templates : 11,
                    filename : _exportName,
                    querymain: 'job001',
                    queryname: 'SelectItemListForFlight',
                    params: {
                        OL_MASTER : $vm.vmData.OL_MASTER,
                        OL_IMPORTDT : $filter('date')($vm.vmData.OL_IMPORTDT, 'yyyy-MM-dd', 'GMT'),
                        OL_FLIGHTNO : $vm.vmData.OL_FLIGHTNO,
                        OL_COUNTRY : $vm.vmData.OL_COUNTRY,               
                        IL_SEQ : $vm.vmData.OL_SEQ
                    }
                }).then(function (res) {
                    // console.log(res);
                    
                    $vm.vmData.FLIGHT_EXPORT += 1;
                    
                    RestfulApi.InsertMSSQLData({
                        insertname: 'Insert',
                        table: 33,
                        params: {
                            ILE_SEQ : $vm.vmData.OL_SEQ,
                            ILE_TYPE : 11,
                            ILE_CR_DATETIME : $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                            ILE_CR_USER : $vm.profile.U_ID
                        }
                    }).then(function (res) {
                        
                    });
                });
            }
        },
        // 顯示併票結果
        MergeNoResult : function(){
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'mergeNoResultModalContent.html',
                controller: 'MergeNoResultModalInstanceCtrl',
                controllerAs: '$ctrl',
                backdrop: 'static',
                size: 'lg',
                // appendTo: parentElem,
                resolve: {
                    job001Data: function() {
                        return $vm.job001Data;
                    }
                }
            });

            modalInstance.result.then(function(selectedItem) {
                // $ctrl.selected = selectedItem;
            }, function() {
                // $log.info('Modal dismissed at: ' + new Date());
            });
        },
        /**
         * 依類型找出相同
         * N : 收件人
         * A : 地址
         * N+A : 收件人 + 地址
         */
        RepeatData : function(pType){

            var _queryname = null;
            switch(pType){
                case "N":
                    _queryname = 'SelectRepeatName';
                    break;
                case "A":
                    _queryname = 'SelectRepeatAddress';
                    break;
                case "N+A":
                    _queryname = 'SelectRepeatNameAndAddress';
                    break;
            }

            if (_queryname != null){ 
                RestfulApi.SearchMSSQLData({
                    querymain: 'job001',
                    queryname: _queryname,
                    params: {
                        IL_SEQ: $vm.vmData.OL_SEQ
                    }
                }).then(function (res){
                    // console.log(res["returnData"]);
                    if(res["returnData"].length > 0){
                        var modalInstance = $uibModal.open({
                            animation: true,
                            ariaLabelledBy: 'modal-title',
                            ariaDescribedBy: 'modal-body',
                            templateUrl: 'repeatDataModalContent.html',
                            controller: 'RepeatDataModalInstanceCtrl',
                            controllerAs: '$ctrl',
                            backdrop: 'static',
                            size: 'lg',
                            // appendTo: parentElem,
                            resolve: {
                                repeatData: function() {
                                    return res["returnData"];
                                }
                            }
                        });

                        modalInstance.result.then(function(selectedItem) {
                            console.log(selectedItem);

                            if(selectedItem.length > 0){
                                var _getDirtyData = [];
                                for(var i in selectedItem){

                                    var _beUpdate = $filter('filter')($vm.job001Data, { 
                                        IL_SEQ : selectedItem[i].entity.IL_SEQ,
                                        IL_NEWBAGNO : selectedItem[i].entity.IL_NEWBAGNO,
                                        IL_NEWSMALLNO : selectedItem[i].entity.IL_NEWSMALLNO,
                                        IL_ORDERINDEX : selectedItem[i].entity.IL_ORDERINDEX
                                    });

                                    if(_beUpdate.length > 0){
                                        var _index = _beUpdate[0].Index - 1;

                                        // 更新收件者相同的值
                                        for(var j in $vm.job001GridApi.grid.columns){
                                            var _colDef = $vm.job001GridApi.grid.columns[j].colDef;
                                            if(_colDef.enableCellEdit){
                                                console.log(_colDef.name);
                                                $vm.job001Data[_index][_colDef.name] = selectedItem[i].entity[_colDef.name];
                                            }
                                        }

                                        _getDirtyData.push($vm.job001Data[_index]);
                                    }
                                }
                                $vm.job001GridApi.rowEdit.setRowsDirty(_getDirtyData);
                            }

                        }, function() {
                            // $log.info('Modal dismissed at: ' + new Date());
                        });
                    }else{
                        toaster.pop('info', '訊息', '無重複收件者名稱', 3000);
                    }
                }); 
            }
        },
        /**
         * 篩選出收件人 收件地址 收件電話 超過六次的資料
         * N|A : 收件人 | 地址
         * N+A : 收件人 + 地址
         */
        OverSix : function(pType){
            if(!angular.isUndefined($vm.vmData.OL_IMPORTDT)){
                var _year = $filter('date')($vm.vmData.OL_IMPORTDT, 'yyyy', 'GMT'),
                    _queryname = null,
                    _type = null;

                if($vm.vmData.OL_IMPORTDT < _year+'-06-30T23:59:59.999Z'){
                    console.log('上半年');
                    _type = '上半年';
                    // _queryname = 'SelectOverSixFirst';

                    switch(pType){
                        case "N|A":
                            _queryname = 'SelectOverSixFirst';
                            break;
                        case "N+A":
                            _queryname = 'SelectOverSixCompoundFirst';
                            break;
                    }
                }
                if(_year+'-07-01T00:00:00.000Z' < $vm.vmData.OL_IMPORTDT){
                    console.log('下半年');
                    _type = '下半年';
                    // _queryname = 'SelectOverSixSecond';

                    switch(pType){
                        case "N|A":
                            _queryname = 'SelectOverSixSecond';
                            break;
                        case "N+A":
                            _queryname = 'SelectOverSixCompoundSecond';
                            break;
                    }
                }

                if(_queryname != null){
                    RestfulApi.SearchMSSQLData({
                        querymain: 'job001',
                        queryname: _queryname,
                        params: {
                            IL_SEQ: $vm.vmData.OL_SEQ
                        }
                    }).then(function (res){
                        console.log(res["returnData"]);
                        if(res["returnData"].length > 0){
                            var modalInstance = $uibModal.open({
                                animation: true,
                                ariaLabelledBy: 'modal-title',
                                ariaDescribedBy: 'modal-body',
                                templateUrl: 'overSixModalContent.html',
                                controller: 'OverSixModalInstanceCtrl',
                                controllerAs: '$ctrl',
                                backdrop: 'static',
                                size: 'lg',
                                // appendTo: parentElem,
                                resolve: {
                                    overSixData: function() {
                                        return res["returnData"];
                                    },
                                    type: function(){
                                        return _type;
                                    },
                                    calculationFinalCost: function () {
                                        return CalculationFinalCost;
                                    }
                                }
                            });

                            modalInstance.result.then(function(selectedItem) {
                                console.log(selectedItem);

                                if(selectedItem.length > 0){
                                    var _getDirtyData = [];
                                    for(var i in selectedItem){

                                        var _beUpdate = $filter('filter')($vm.job001Data, { 
                                            IL_SEQ : selectedItem[i].entity.IL_SEQ,
                                            IL_NEWBAGNO : selectedItem[i].entity.IL_NEWBAGNO,
                                            IL_NEWSMALLNO : selectedItem[i].entity.IL_NEWSMALLNO,
                                            IL_ORDERINDEX : selectedItem[i].entity.IL_ORDERINDEX
                                        });

                                        if(_beUpdate.length > 0){
                                            var _index = _beUpdate[0].Index - 1;

                                            // 更新超過六次的值
                                            for(var j in $vm.job001GridApi.grid.columns){
                                                var _colDef = $vm.job001GridApi.grid.columns[j].colDef;
                                                if(_colDef.enableCellEdit){
                                                    console.log(_colDef.name);
                                                    $vm.job001Data[_index][_colDef.name] = selectedItem[i].entity[_colDef.name];
                                                }
                                            }

                                            _getDirtyData.push($vm.job001Data[_index]);
                                        }
                                    }
                                    console.log($vm.job001GridApi);
                                    $vm.job001GridApi.rowEdit.setRowsDirty(_getDirtyData);
                                }

                            }, function() {
                                // $log.info('Modal dismissed at: ' + new Date());
                            });
                        }else{
                            toaster.pop('info', '訊息', '無 收件人、收件地址、收件電話 超過六次的資料', 3000);
                        }
                    }); 
                }
            }
        },
        Return : function(){
            ReturnToEmployeejobsPage();
        },
        Close : function(){
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
                        return {};
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

                RestfulApi.UpdateMSSQLData({
                    updatename: 'Update',
                    table: 22,
                    params: {
                        OE_FDATETIME : $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss')
                    },
                    condition: {
                        OE_SEQ : $vm.vmData.OL_SEQ,
                        OE_TYPE : 'R',
                        OE_PRINCIPAL : $vm.profile.U_ID
                    }
                }).then(function (res) {
                    ReturnToEmployeejobsPage();
                });

            }, function() {
                // $log.info('Modal dismissed at: ' + new Date());
            });
        },
        Update : function(entity){
            // console.log($vm.job001GridApi.rowEdit);
            // console.log($vm.job001GridApi.rowEdit.getDirtyRows($vm.job001GridApi.grid));
            console.log(entity, angular.isNumber(parseFloat(entity.IL_WEIGHT_NEW)), parseFloat(entity.IL_WEIGHT_NEW));

            // create a fake promise - normally you'd use the promise returned by $http or $resource
            var deferred = $q.defer();
            $vm.job001GridApi.rowEdit.setSavePromise( entity, deferred.promise );
         
            RestfulApi.UpdateMSSQLData({
                updatename: 'Update',
                table: 9,
                params: {
                    IL_G1              : entity.IL_G1,
                    IL_MERGENO         : entity.IL_MERGENO,
                    IL_BAGNO           : entity.IL_BAGNO,
                    IL_SMALLNO         : entity.IL_SMALLNO,
                    IL_NATURE_NEW      : entity.IL_NATURE_NEW,
                    IL_NEWPLACE        : entity.IL_NEWPLACE,
                    IL_CTN             : isNaN(parseInt(entity.IL_CTN)) ? null : entity.IL_CTN,
                    IL_NEWPCS          : isNaN(parseInt(entity.IL_NEWPCS)) ? null : entity.IL_NEWPCS,
                    IL_NEWUNIT         : entity.IL_NEWUNIT,
                    IL_WEIGHT_NEW      : isNaN(parseFloat(entity.IL_WEIGHT_NEW)) ? null : entity.IL_WEIGHT_NEW,
                    IL_GETNO           : entity.IL_GETNO,
                    IL_NEWSENDNAME     : entity.IL_NEWSENDNAME,
                    IL_GETNAME_NEW     : entity.IL_GETNAME_NEW,
                    IL_GETADDRESS      : entity.IL_GETADDRESS,
                    IL_GETADDRESS_NEW  : entity.IL_GETADDRESS_NEW,
                    IL_GETTEL          : entity.IL_GETTEL,
                    IL_UNIVALENT_NEW   : isNaN(parseFloat(entity.IL_UNIVALENT_NEW)) ? null : entity.IL_UNIVALENT_NEW,
                    IL_FINALCOST       : isNaN(parseFloat(entity.IL_FINALCOST)) ? null : entity.IL_FINALCOST,
                    IL_TAX             : entity.IL_TAX,
                    IL_TRCOM           : entity.IL_TRCOM,
                    IL_REMARK          : entity.IL_REMARK,
                    IL_EXTEL           : entity.IL_EXTEL,
                    IL_EXNO            : entity.IL_EXNO,
                    IL_TAX2            : entity.IL_TAX2,
                    IL_TAXRATE         : angular.isNumber(entity.IL_TAXRATE) ? entity.IL_TAXRATE : null,
                    IL_UP_DATETIME     : $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                    IL_UP_USER         : $vm.profile.U_ID
                },
                condition: {
                    IL_SEQ        : entity.IL_SEQ,
                    IL_NEWBAGNO   : entity.IL_NEWBAGNO,
                    IL_NEWSMALLNO : entity.IL_NEWSMALLNO,
                    IL_ORDERINDEX : entity.IL_ORDERINDEX
                }
            }).then(function (res) {
                // console.log(res);
                deferred.resolve();
            }, function (err) {
                toaster.pop('error', '錯誤', '更新失敗', 3000);
                deferred.reject();
            });
            
        }
    });

    function LoadItemList(){
        RestfulApi.SearchMSSQLData({
            querymain: 'job001',
            queryname: 'SelectItemList',
            params: {
                IL_SEQ: $vm.vmData.OL_SEQ
            }
        }).then(function (res){
            // console.log(res["returnData"]);
            for(var i=0;i<res["returnData"].length;i++){
                res["returnData"][i]["Index"] = i+1;
            }
            $vm.job001Data = angular.copy(res["returnData"]);
        }); 
    };

    function CalculationFinalCost(rowEntity, colDef, newValue, oldValue){
        
        // 一律為大寫
        if(colDef.name == 'O_IL_G1') {
            try {
                rowEntity["O_IL_G1"] = newValue.toUpperCase();
            }
            catch (e) {
                console.log(e);
            }
        }

        try {
            if(newValue.toUpperCase() == "Y"){
                G1ForY(rowEntity)
                // rowEntity.IL_WEIGHT_NEW = rowEntity.IL_WEIGHT;
                // rowEntity.IL_NEWPCS = rowEntity.IL_PCS;
                // rowEntity.IL_UNIVALENT_NEW = rowEntity.IL_UNIVALENT;
                // rowEntity.IL_NEWSENDNAME = rowEntity.IL_SENDNAME;
                // rowEntity.IL_FINALCOST = null;
            }
        } catch (e) {
            console.log(e);
        }

        if(colDef.name == 'IL_GETNAME_NEW'){
            var _temp = encodeURI(rowEntity.IL_GETNAME_NEW),
                regex = /%09/gi;

            _temp = _temp.replace(regex, "%20");
            rowEntity.IL_GETNAME_NEW = decodeURI(_temp);
        }

        // 新單價 = 新重量 * 100 / 新數量
        if(colDef.name == 'IL_WEIGHT_NEW' || colDef.name == 'IL_NEWPCS'){
            var _weight = parseFloat(rowEntity.IL_WEIGHT_NEW).toFixed(2),
                _pcs = parseInt(rowEntity.IL_NEWPCS);

            // 如果都不是空值 才開始計算
            if(!isNaN(_weight) && !isNaN(_pcs)){
                // 如果數量不為0
                if(parseInt(_pcs) != 0){
                    rowEntity.IL_UNIVALENT_NEW = (_weight * 100) / _pcs;
                }else{
                    rowEntity.IL_UNIVALENT_NEW = 0;
                }
            }
        }

        // 計算稅
        var _univalent = parseInt(rowEntity.IL_UNIVALENT_NEW),
            _pcs = parseInt(rowEntity.IL_NEWPCS),
            _finalcost = parseInt(rowEntity.IL_FINALCOST),
            start = 0;

        if(!isNaN(_univalent)){
            start += 1;
        }
        if(!isNaN(_pcs)){
            start += 1;
        }
        if(!isNaN(_finalcost)){
            start += 1;
        }

        // 表示可以開始計算
        if(start >= 2){
            // 新單價
            if(colDef.name == 'IL_UNIVALENT_NEW'){
                //如果數量有值
                if(!isNaN(_pcs)){
                    _finalcost = _pcs * _univalent;
                }
            }

            // 新數量
            if(colDef.name == 'IL_NEWPCS'){
                if(!isNaN(_univalent)){
                    _finalcost = _pcs * _univalent;
                }
            }

            // 當完稅價格小於100
            if(_finalcost < 100 && _finalcost != 0){
                // 給個新值 100~125
                var maxNum = 125;  
                var minNum = 100;  
                _finalcost = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum; 
            }

            // 當完稅價格超過2000 提醒使用者
            if(_finalcost > 2000){
                toaster.pop('warning', '警告', '完稅價格超過2000元，請注意', 3000);
            }
            
            // 當數量不為空 帶出單價 (會與新單價衝突)
            if(colDef.name == 'IL_FINALCOST' || colDef.name == 'IL_NEWPCS' || colDef.name == 'IL_UNIVALENT_NEW'){
                if(!isNaN(_pcs)){
                    if(parseInt(_pcs) != 0){
                        _univalent = Math.round(_finalcost / _pcs);
                    }else{
                        _univalent = 0;
                    }
                }
            }

            // 完稅價格
            if(colDef.name == 'IL_FINALCOST' || colDef.name == 'IL_WEIGHT_NEW'){
                // 避免帳不平 再次計算完稅價格
                if(!isNaN(_pcs) && !isNaN(_univalent)){
                    _finalcost = _pcs * _univalent;
                }
            }

            // console.log("_univalent:", _univalent," _pcs:" , _pcs," _finalcost:" , _finalcost);
            rowEntity.IL_UNIVALENT_NEW = isNaN(_univalent) ? null : _univalent;
            rowEntity.IL_NEWPCS = isNaN(_pcs) ? null : _pcs;
            rowEntity.IL_FINALCOST = isNaN(_finalcost) ? null : _finalcost;
        }

        $vm.job001GridApi.rowEdit.setRowsDirty([rowEntity]);

        // console.log('edited row id:' + rowEntity.Index + ' Column:' + colDef.name + ' newValue:' + newValue + ' oldValue:' + oldValue);
    }

    /**
     * [G1ForY description] 報關類型為Y的處理方法
     * @param {[type]} rowEntity [description]
     */
    function G1ForY (rowEntity){
        rowEntity.IL_WEIGHT_NEW = rowEntity.IL_WEIGHT;
        rowEntity.IL_NEWPCS = rowEntity.IL_PCS;
        rowEntity.IL_UNIVALENT_NEW = rowEntity.IL_UNIVALENT;
        rowEntity.IL_NEWSENDNAME = rowEntity.IL_SENDNAME;
        rowEntity.IL_FINALCOST = null;
    }

    /**
     * [ClearSelectedColumn description] isSelected設為否
     */
    function ClearSelectedColumn(){
        for(var i in $vm.job001Data){
            $vm.job001Data[i].isSelected = false;
        }
    }

    function ReturnToEmployeejobsPage(){
        $state.transitionTo($state.current.parent);
    };

})
.controller('ExcelMenuModalInstanceCtrl', function ($uibModalInstance) {
    var $ctrl = this;
    
    $ctrl.ok = function(pType) {
        $uibModalInstance.close(pType);
    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
})
.controller('MergeNoModalInstanceCtrl', function ($uibModalInstance, mergeNo, natureNew, ilTax2, bagNo) {
    var $ctrl = this;
    $ctrl.natureNew = natureNew;
    $ctrl.ilTax2 = ilTax2;

    $ctrl.mdData = {
        mergeNo : mergeNo,
        natureNew : null,
        ilTax2 : null,
        bagNo : bagNo
    };

    $ctrl.Init = function(){
        $ctrl.mergeNoNature = '1';
        $ctrl.mergeNoIlTax2 = '1';
    };

    $ctrl.ok = function() {
        $uibModalInstance.close($ctrl.mdData);
    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
})
.controller('OPAddBanModalInstanceCtrl', function ($uibModalInstance, vmData) {
    var $ctrl = this;
    $ctrl.mdData = vmData;

    $ctrl.ok = function() {
        $uibModalInstance.close($ctrl.mdData);
    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
})
.controller('PullGoodsModalInstanceCtrl', function ($uibModalInstance, vmData) {
    var $ctrl = this;
    $ctrl.mdData = vmData;

    $ctrl.ok = function() {
        $uibModalInstance.close($ctrl.mdData);
    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
})
.controller('SpecialGoodsModalInstanceCtrl', function ($uibModalInstance, items, specialGoods) {
    var $ctrl = this;

    $ctrl.Init = function(){
        $ctrl.mdData = items;
        $ctrl.specialGoodsData = specialGoods;

        if($ctrl.mdData.SPG_SPECIALGOODS != 0){
            $ctrl.mdData['SPG_TYPE'] = $ctrl.mdData.SPG_SPECIALGOODS.toString();
        }
    }


    $ctrl.ok = function() {
        $uibModalInstance.close($ctrl.mdData);
    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
})
.controller('MultiSpecialGoodsModalInstanceCtrl', function ($uibModalInstance, specialGoods) {
    var $ctrl = this;

    $ctrl.Init = function(){
        $ctrl.specialGoodsData = specialGoods;
    }

    $ctrl.ok = function() {
        $uibModalInstance.close($ctrl.mdData);
    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
})
.controller('MergeNoResultModalInstanceCtrl', function ($uibModalInstance, job001Data, uiGridGroupingConstants) {
    var $ctrl = this;
    $ctrl.items = job001Data;

    $ctrl.MdInit = function(){
        DoMergeNoSplit();
        // console.log($ctrl.job001DataHaveMergeNo);
        // console.log($ctrl.job001DataNotMergeNo);
    };

    $ctrl.job001DataHaveMergeNoOption = {
        data: '$ctrl.job001DataHaveMergeNo',
        columnDefs: [
            { name: 'Index'           , displayName: '序列', width: 50},
            { name: 'IL_G1'           , displayName: '報關種類', width: 115 },
            { name: 'IL_MERGENO'      , displayName: '併票號', width: 129, grouping: { groupPriority: 0 } },
            { name: 'IL_BAGNO'        , displayName: '袋號', width: 129 },
            { name: 'IL_SMALLNO'      , displayName: '小號', width: 115 },
            { name: 'IL_NATURE'    , displayName: '品名', width: 115 },
            { name: 'IL_NATURE_NEW'   , displayName: '新品名', width: 115, treeAggregationType: uiGridGroupingConstants.aggregation.MAX, 
                customTreeAggregationFinalizerFn: function( aggregation ) {
                    aggregation.rendered = aggregation.value;
                }
            },
            { name: 'IL_CTN'          , displayName: '件數', width: 115, treeAggregationType: uiGridGroupingConstants.aggregation.SUM, 
                customTreeAggregationFinalizerFn: function( aggregation ) {
                    aggregation.rendered = aggregation.value;
                }
            },
            { name: 'IL_PLACE'        , displayName: '產地', width: 115 },
            { name: 'IL_NEWPLACE'     , displayName: '新產地', width: 115 },
            { name: 'IL_WEIGHT'       , displayName: '重量', width: 115, treeAggregationType: uiGridGroupingConstants.aggregation.SUM, 
                customTreeAggregationFinalizerFn: function( aggregation ) {
                    aggregation.rendered = Math.round(aggregation.value * 100) / 100;
                }
            },
            { name: 'IL_WEIGHT_NEW'   , displayName: '新重量', width: 115, treeAggregationType: uiGridGroupingConstants.aggregation.SUM, 
                customTreeAggregationFinalizerFn: function( aggregation ) {
                    // console.log(aggregation);
                    aggregation.rendered = Math.round(aggregation.value * 100) / 100;
                }
            },
            { name: 'IL_PCS'       , displayName: '數量', width: 115, treeAggregationType: uiGridGroupingConstants.aggregation.SUM, 
                customTreeAggregationFinalizerFn: function( aggregation ) {
                    aggregation.rendered = aggregation.value;
                }
            },
            { name: 'IL_NEWPCS'       , displayName: '新數量', width: 115, treeAggregationType: uiGridGroupingConstants.aggregation.SUM, 
                customTreeAggregationFinalizerFn: function( aggregation ) {
                    // console.log(aggregation);
                    aggregation.rendered = aggregation.value;
                }
            },
            { name: 'IL_UNIVALENT'    , displayName: '單價', width: 115 },
            { name: 'IL_UNIVALENT_NEW', displayName: '新單價', width: 115 },
            { name: 'IL_FINALCOST'    , displayName: '完稅價格', width: 115 },
            { name: 'IL_UNIT'         , displayName: '單位', width: 115 },
            { name: 'IL_NEWUNIT'      , displayName: '新單位', width: 115 },
            { name: 'IL_GETNO'        , displayName: '收件者統編', width: 115 },
            { name: 'IL_EXNO'         , displayName: '匯出統編', width: 115 },
            { name: 'IL_SENDNAME'     , displayName: '寄件人', width: 115 },
            { name: 'IL_NEWSENDNAME'  , displayName: '新寄件人', width: 115 },
            { name: 'IL_TAX'          , displayName: '稅費歸屬', width: 115 },
            { name: 'IL_GETNAME'      , displayName: '收件人公司', width: 115 },
            { name: 'IL_GETNAME_NEW'  , displayName: '新收件人公司', width: 115 },
            { name: 'IL_GETADDRESS'   , displayName: '收件地址', width: 300 },
            { name: 'IL_GETADDRESS_NEW', displayName: '新收件地址', width: 300 },
            { name: 'IL_GETTEL'       , displayName: '收件電話', width: 115 },
            { name: 'IL_EXTEL'        , displayName: '匯出電話', width: 115 },
            { name: 'IL_TRCOM'        , displayName: '派送公司', width: 115 },
            { name: 'IL_REMARK'       , displayName: '備註', width: 115 },
            { name: 'IL_TAX2'         , displayName: '稅則', width: 115 }
        ],
        enableFiltering: false,
        enableSorting: true,
        enableColumnMenus: false,
        groupingShowCounts: false,
        // enableVerticalScrollbar: false,
        paginationPageSizes: [50, 100, 150, 200, 250, 300],
        paginationPageSize: 100,
        onRegisterApi: function(gridApi){
            $ctrl.job001DataHaveMergeNoGridApi = gridApi;
            // HandleWindowResize($ctrl.job001DataHaveMergeNoGridApi);
        }
    };

    $ctrl.job001DataNotMergeNoOption = {
        data: '$ctrl.job001DataNotMergeNo',
        columnDefs: [
            { name: 'Index'           , displayName: '序列', width: 50},
            { name: 'IL_G1'           , displayName: '報關種類', width: 80 },
            { name: 'IL_MERGENO'      , displayName: '併票號', width: 80 },
            { name: 'IL_BAGNO'        , displayName: '袋號', width: 80 },
            { name: 'IL_SMALLNO'      , displayName: '小號', width: 110 },
            { name: 'IL_NATURE'       , displayName: '品名', width: 120 },
            { name: 'IL_NATURE_NEW'   , displayName: '新品名', width: 120 },
            { name: 'IL_CTN'          , displayName: '件數', width: 50 },
            { name: 'IL_PLACE'        , displayName: '產地', width: 50 },
            { name: 'IL_NEWPLACE'     , displayName: '新產地', width: 70 },
            { name: 'IL_WEIGHT'       , displayName: '重量', width: 70 },
            { name: 'IL_WEIGHT_NEW'   , displayName: '新重量', width: 70 },
            { name: 'IL_PCS'          , displayName: '數量', width: 70 },
            { name: 'IL_NEWPCS'       , displayName: '新數量', width: 70 },
            { name: 'IL_UNIVALENT'    , displayName: '單價', width: 70 },
            { name: 'IL_UNIVALENT_NEW', displayName: '新單價', width: 70 },
            { name: 'IL_FINALCOST'    , displayName: '完稅價格', width: 80 },
            { name: 'IL_UNIT'         , displayName: '單位', width: 70 },
            { name: 'IL_NEWUNIT'      , displayName: '新單位', width: 70 },
            { name: 'IL_GETNO'        , displayName: '收件者統編', width: 100 },
            { name: 'IL_EXNO'         , displayName: '匯出統編', width: 80 },
            { name: 'IL_SENDNAME'     , displayName: '寄件人', width: 80 },
            { name: 'IL_NEWSENDNAME'  , displayName: '新寄件人', width: 80 },
            { name: 'IL_TAX'          , displayName: '稅費歸屬', width: 80 },
            { name: 'IL_GETNAME'      , displayName: '收件人公司', width: 100 },
            { name: 'IL_GETNAME_NEW'  , displayName: '新收件人公司', width: 100 },
            { name: 'IL_GETADDRESS'   , displayName: '收件地址', width: 300 },
            { name: 'IL_GETADDRESS_NEW', displayName: '新收件地址', width: 300 },
            { name: 'IL_GETTEL'       , displayName: '收件電話', width: 100 },
            { name: 'IL_EXTEL'        , displayName: '匯出電話', width: 100 },
            { name: 'IL_TRCOM'        , displayName: '派送公司', width: 100 },
            { name: 'IL_REMARK'       , displayName: '備註', width: 100 },
            { name: 'IL_TAX2'         , displayName: '稅則', width: 100 }
        ],
        enableFiltering: false,
        enableSorting: true,
        enableColumnMenus: false,
        // enableVerticalScrollbar: false,
        paginationPageSizes: [50, 100, 150, 200, 250, 300],
        paginationPageSize: 100,
        onRegisterApi: function(gridApi){
            $ctrl.job001DataNotMergeNoGridApi = gridApi;
            // HandleWindowResize($ctrl.job001DataNotMergeNoGridApi);
        }
    }

    function DoMergeNoSplit(){
        $ctrl.job001DataHaveMergeNo = [];
        $ctrl.job001DataNotMergeNo = [];

        for(var i in job001Data){
            if(job001Data[i].IL_MERGENO){
                $ctrl.job001DataHaveMergeNo.push(job001Data[i]);
            }else{
                $ctrl.job001DataNotMergeNo.push(job001Data[i]);
            }
        }
    }

    $ctrl.ok = function() {
        $uibModalInstance.close($ctrl.selected.item);
    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
})
.controller('RepeatDataModalInstanceCtrl', function ($uibModalInstance, $q, $scope, repeatData) {
    var $ctrl = this;
    $ctrl.mdData = repeatData;

    $ctrl.repeatDataOption = {
        data: '$ctrl.mdData',
        columnDefs: [
            { name: 'IL_G1'           , displayName: '報關種類', width: 80, headerCellClass: 'text-primary' },
            { name: 'IL_MERGENO'      , displayName: '併票號', width: 80, headerCellClass: 'text-primary' },
            { name: 'IL_BAGNO'        , displayName: '袋號', width: 80, headerCellClass: 'text-primary' },
            { name: 'IL_SMALLNO'      , displayName: '小號', width: 110, headerCellClass: 'text-primary' },
            { name: 'IL_NATURE'       , displayName: '品名', width: 120, enableCellEdit: false },
            { name: 'IL_NATURE_NEW'   , displayName: '新品名', width: 120, headerCellClass: 'text-primary' },
            { name: 'IL_CTN'          , displayName: '件數', width: 50, headerCellClass: 'text-primary' },
            { name: 'IL_PLACE'        , displayName: '產地', width: 50, enableCellEdit: false },
            { name: 'IL_NEWPLACE'     , displayName: '新產地', width: 70, headerCellClass: 'text-primary' },
            { name: 'IL_WEIGHT'       , displayName: '重量', width: 70, enableCellEdit: false },
            { name: 'IL_WEIGHT_NEW'   , displayName: '新重量', width: 70, headerCellClass: 'text-primary' },
            { name: 'IL_PCS'          , displayName: '數量', width: 70, enableCellEdit: false },
            { name: 'IL_NEWPCS'       , displayName: '新數量', width: 70, headerCellClass: 'text-primary' },
            { name: 'IL_UNIVALENT'    , displayName: '單價', width: 70, enableCellEdit: false },
            { name: 'IL_UNIVALENT_NEW', displayName: '新單價', width: 70, headerCellClass: 'text-primary' },
            { name: 'IL_FINALCOST'    , displayName: '完稅價格', width: 80, headerCellClass: 'text-primary' },
            { name: 'IL_UNIT'         , displayName: '單位', width: 70, enableCellEdit: false },
            { name: 'IL_NEWUNIT'      , displayName: '新單位', width: 70, headerCellClass: 'text-primary' },
            { name: 'IL_GETNO'        , displayName: '收件者統編', width: 100, headerCellClass: 'text-primary' },
            { name: 'IL_EXNO'         , displayName: '匯出統編', width: 80, headerCellClass: 'text-primary' },
            { name: 'IL_SENDNAME'     , displayName: '寄件人', width: 80, enableCellEdit: false },
            { name: 'IL_NEWSENDNAME'  , displayName: '新寄件人', width: 80, headerCellClass: 'text-primary' },
            { name: 'IL_TAX'          , displayName: '稅費歸屬', width: 80, headerCellClass: 'text-primary' },
            { name: 'IL_GETNAME'      , displayName: '收件人公司', width: 100, enableCellEdit: false },
            { name: 'IL_GETNAME_NEW'  , displayName: '新收件人公司', width: 100, headerCellClass: 'text-primary' },
            { name: 'IL_GETADDRESS'   , displayName: '收件地址', width: 300, enableCellEdit: false },
            { name: 'IL_GETADDRESS_NEW', displayName: '新收件地址', width: 300, headerCellClass: 'text-primary' },
            { name: 'IL_GETTEL'       , displayName: '收件電話', width: 100, headerCellClass: 'text-primary' },
            { name: 'IL_EXTEL'        , displayName: '匯出電話', width: 100, headerCellClass: 'text-primary' },
            { name: 'IL_TRCOM'        , displayName: '派送公司', width: 100, headerCellClass: 'text-primary' },
            { name: 'IL_REMARK'       , displayName: '備註', width: 100, headerCellClass: 'text-primary' },
            { name: 'IL_TAX2'         , displayName: '稅則', width: 100, headerCellClass: 'text-primary' }

            // { name: 'IL_G1'         , displayName: '報關種類', width: 115, headerCellClass: 'text-primary' },
            // { name: 'IL_MERGENO'    , displayName: '併票號', width: 129, headerCellClass: 'text-primary' },
            // { name: 'IL_BAGNO'      , displayName: '袋號', width: 129, headerCellClass: 'text-primary' },
            // { name: 'IL_SMALLNO'    , displayName: '小號', width: 115, headerCellClass: 'text-primary' },
            // { name: 'IL_NATURE'     , displayName: '品名', width: 115, enableCellEdit: false },
            // { name: 'IL_NATURE_NEW' , displayName: '新品名', width: 115, headerCellClass: 'text-primary' },
            // { name: 'IL_CTN'        , displayName: '件數', width: 115, headerCellClass: 'text-primary' },
            // { name: 'IL_PLACE'      , displayName: '產地', width: 115, enableCellEdit: false },
            // { name: 'IL_NEWPLACE'   , displayName: '新產地', width: 115, headerCellClass: 'text-primary' },
            // { name: 'IL_WEIGHT'     , displayName: '重量', width: 115, enableCellEdit: false },
            // { name: 'IL_WEIGHT_NEW' , displayName: '新重量', width: 115, headerCellClass: 'text-primary' },
            // { name: 'IL_PCS'        , displayName: '數量', width: 115, enableCellEdit: false },
            // { name: 'IL_NEWPCS'     , displayName: '新數量', width: 115, headerCellClass: 'text-primary' },
            // { name: 'IL_UNIVALENT'  , displayName: '單價', width: 115, enableCellEdit: false },
            // { name: 'IL_UNIVALENT_NEW', displayName: '新單價', width: 115, headerCellClass: 'text-primary' },
            // { name: 'IL_FINALCOST'  , displayName: '完稅價格', width: 115, headerCellClass: 'text-primary' },
            // { name: 'IL_UNIT'       , displayName: '單位', width: 115, enableCellEdit: false },
            // { name: 'IL_NEWUNIT'    , displayName: '新單位', width: 115, headerCellClass: 'text-primary' },
            // { name: 'IL_GETNO'      , displayName: '收件者統編', width: 115, headerCellClass: 'text-primary' },
            // { name: 'IL_EXNO'       , displayName: '匯出統編', width: 115, headerCellClass: 'text-primary' },
            // { name: 'IL_SENDNAME'   , displayName: '寄件人', width: 115, enableCellEdit: false },
            // { name: 'IL_NEWSENDNAME', displayName: '新寄件人', width: 115, headerCellClass: 'text-primary' },
            // { name: 'IL_TAX'        , displayName: '稅費歸屬', width: 115, headerCellClass: 'text-primary' },
            // { name: 'IL_GETNAME'    , displayName: '收件人公司', width: 115, enableCellEdit: false },
            // { name: 'IL_GETNAME_NEW', displayName: '新收件人公司', width: 115, headerCellClass: 'text-primary' },
            // { name: 'IL_GETADDRESS' , displayName: '收件地址', width: 300, enableCellEdit: false },
            // { name: 'IL_GETADDRESS_NEW' , displayName: '新收件地址', width: 300, headerCellClass: 'text-primary' },
            // { name: 'IL_GETTEL'     , displayName: '收件電話', width: 115, headerCellClass: 'text-primary' },
            // { name: 'IL_EXTEL'      , displayName: '匯出電話', width: 115, headerCellClass: 'text-primary' },
            // { name: 'IL_TRCOM'      , displayName: '派送公司', width: 115, headerCellClass: 'text-primary' },
            // { name: 'IL_REMARK'     , displayName: '備註', width: 115, headerCellClass: 'text-primary' },
            // { name: 'IL_TAX2'       , displayName: '稅則', width: 115, headerCellClass: 'text-primary' }
        ],
        enableFiltering: false,
        enableSorting: true,
        enableColumnMenus: false,
        // enableVerticalScrollbar: false,
        paginationPageSizes: [50, 100, 150, 200, 250, 300],
        paginationPageSize: 100,
        rowEditWaitInterval: -1,
        onRegisterApi: function(gridApi){
            $ctrl.repeatDataGridApi = gridApi;
        }
    }

    $ctrl.ok = function() {
        $uibModalInstance.close($ctrl.repeatDataGridApi.rowEdit.getDirtyRows());
    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
})
.controller('OverSixModalInstanceCtrl', function ($uibModalInstance, $q, $scope, $templateCache, overSixData, type, calculationFinalCost) {
    var $ctrl = this;
    $ctrl.type = type;
    $ctrl.mdData = overSixData;

    $ctrl.overSixOption = {
        data: '$ctrl.mdData',
        columnDefs: [
            { name: 'IL_G1'           , displayName: '報關種類', width: 80, headerCellClass: 'text-primary' },
            { name: 'IL_MERGENO'      , displayName: '併票號', width: 80, headerCellClass: 'text-primary' },
            { name: 'IL_BAGNO'        , displayName: '袋號', width: 80, headerCellClass: 'text-primary' },
            { name: 'IL_SMALLNO'      , displayName: '小號', width: 110, headerCellClass: 'text-primary' },
            { name: 'IL_NATURE'       , displayName: '品名', width: 120, enableCellEdit: false },
            { name: 'IL_NATURE_NEW'   , displayName: '新品名', width: 120, headerCellClass: 'text-primary' },
            { name: 'IL_CTN'          , displayName: '件數', width: 50, headerCellClass: 'text-primary' },
            { name: 'IL_PLACE'        , displayName: '產地', width: 50, enableCellEdit: false },
            { name: 'IL_NEWPLACE'     , displayName: '新產地', width: 70, headerCellClass: 'text-primary' },
            { name: 'IL_WEIGHT'       , displayName: '重量', width: 70, enableCellEdit: false },
            { name: 'IL_WEIGHT_NEW'   , displayName: '新重量', width: 70, headerCellClass: 'text-primary' },
            { name: 'IL_PCS'          , displayName: '數量', width: 70, enableCellEdit: false },
            { name: 'IL_NEWPCS'       , displayName: '新數量', width: 70, headerCellClass: 'text-primary' },
            { name: 'IL_UNIVALENT'    , displayName: '單價', width: 70, enableCellEdit: false },
            { name: 'IL_UNIVALENT_NEW', displayName: '新單價', width: 70, headerCellClass: 'text-primary' },
            { name: 'IL_FINALCOST'    , displayName: '完稅價格', width: 80, headerCellClass: 'text-primary' },
            { name: 'IL_UNIT'         , displayName: '單位', width: 70, enableCellEdit: false },
            { name: 'IL_NEWUNIT'      , displayName: '新單位', width: 70, headerCellClass: 'text-primary' },
            { name: 'IL_GETNO'        , displayName: '收件者統編', width: 100, headerCellClass: 'text-primary' },
            { name: 'IL_EXNO'         , displayName: '匯出統編', width: 80, headerCellClass: 'text-primary' },
            { name: 'IL_SENDNAME'     , displayName: '寄件人', width: 80, enableCellEdit: false },
            { name: 'IL_NEWSENDNAME'  , displayName: '新寄件人', width: 80, headerCellClass: 'text-primary' },
            { name: 'IL_TAX'          , displayName: '稅費歸屬', width: 80, headerCellClass: 'text-primary' },
            { name: 'IL_GETNAME'      , displayName: '收件人公司', width: 100, enableCellEdit: false },
            { name: 'IL_GETNAME_NEW'  , displayName: '新收件人公司', width: 100, headerCellClass: 'text-primary' },
            { name: 'IL_GETADDRESS'   , displayName: '收件地址', width: 300, enableCellEdit: false },
            { name: 'IL_GETADDRESS_NEW', displayName: '新收件地址', width: 300, headerCellClass: 'text-primary' },
            { name: 'IL_GETTEL'       , displayName: '收件電話', width: 100, headerCellClass: 'text-primary' },
            { name: 'IL_EXTEL'        , displayName: '匯出電話', width: 100, headerCellClass: 'text-primary' },
            { name: 'IL_TRCOM'        , displayName: '派送公司', width: 100, headerCellClass: 'text-primary' },
            { name: 'IL_REMARK'       , displayName: '備註', width: 100, headerCellClass: 'text-primary' },
            { name: 'IL_TAX2'         , displayName: '稅則', width: 100, headerCellClass: 'text-primary' },
            { name: 'GETNAME_COUNT'   , displayName: '收件人公司', width: 100, headerCellClass: 'text-danger', enableCellEdit: false, pinnedRight:true, cellTemplate: $templateCache.get('accessibilityToOverSixName') },
            { name: 'GETADDRESS_COUNT', displayName: '收件地址', width: 100, headerCellClass: 'text-danger', enableCellEdit: false, pinnedRight:true, cellTemplate: $templateCache.get('accessibilityToOverSixAddress') }
            
            // { name: 'IL_G1'         , displayName: '報關種類', width: 115, headerCellClass: 'text-primary' },
            // { name: 'IL_MERGENO'    , displayName: '併票號', width: 129, headerCellClass: 'text-primary' },
            // { name: 'IL_BAGNO'      , displayName: '袋號', width: 129, headerCellClass: 'text-primary' },
            // { name: 'IL_SMALLNO'    , displayName: '小號', width: 115, headerCellClass: 'text-primary' },
            // { name: 'IL_NATURE'     , displayName: '品名', width: 115, enableCellEdit: false },
            // { name: 'IL_NATURE_NEW' , displayName: '新品名', width: 115, headerCellClass: 'text-primary' },
            // { name: 'IL_CTN'        , displayName: '件數', width: 115, headerCellClass: 'text-primary' },
            // { name: 'IL_PLACE'      , displayName: '產地', width: 115, enableCellEdit: false },
            // { name: 'IL_NEWPLACE'   , displayName: '新產地', width: 115, headerCellClass: 'text-primary' },
            // { name: 'IL_WEIGHT'     , displayName: '重量', width: 115, enableCellEdit: false },
            // { name: 'IL_WEIGHT_NEW' , displayName: '新重量', width: 115, headerCellClass: 'text-primary' },
            // { name: 'IL_PCS'        , displayName: '數量', width: 115, enableCellEdit: false },
            // { name: 'IL_NEWPCS'     , displayName: '新數量', width: 115, headerCellClass: 'text-primary' },
            // { name: 'IL_UNIVALENT'  , displayName: '單價', width: 115, enableCellEdit: false },
            // { name: 'IL_UNIVALENT_NEW', displayName: '新單價', width: 115, headerCellClass: 'text-primary' },
            // { name: 'IL_FINALCOST'  , displayName: '完稅價格', width: 115, headerCellClass: 'text-primary' },
            // { name: 'IL_UNIT'       , displayName: '單位', width: 115, enableCellEdit: false },
            // { name: 'IL_NEWUNIT'    , displayName: '新單位', width: 115, headerCellClass: 'text-primary' },
            // { name: 'IL_GETNO'      , displayName: '收件者統編', width: 115, headerCellClass: 'text-primary' },
            // { name: 'IL_EXNO'       , displayName: '匯出統編', width: 115, headerCellClass: 'text-primary' },
            // { name: 'IL_SENDNAME'   , displayName: '寄件人', width: 115, enableCellEdit: false },
            // { name: 'IL_NEWSENDNAME', displayName: '新寄件人', width: 115, headerCellClass: 'text-primary' },
            // { name: 'IL_TAX'        , displayName: '稅費歸屬', width: 115, headerCellClass: 'text-primary' },
            // { name: 'IL_GETNAME'    , displayName: '收件人公司', width: 115, enableCellEdit: false },
            // { name: 'IL_GETNAME_NEW', displayName: '新收件人公司', width: 115, headerCellClass: 'text-primary' },
            // { name: 'IL_GETADDRESS' , displayName: '收件地址', width: 300, enableCellEdit: false },
            // { name: 'IL_GETADDRESS_NEW' , displayName: '新收件地址', width: 300, headerCellClass: 'text-primary' },
            // { name: 'IL_GETTEL'     , displayName: '收件電話', width: 115, headerCellClass: 'text-primary' },
            // { name: 'IL_EXTEL'      , displayName: '匯出電話', width: 115, headerCellClass: 'text-primary' },
            // { name: 'IL_TRCOM'      , displayName: '派送公司', width: 115, headerCellClass: 'text-primary' },
            // { name: 'IL_REMARK'     , displayName: '備註', width: 115, headerCellClass: 'text-primary' },
            // { name: 'IL_TAX2'       , displayName: '稅則', width: 115, headerCellClass: 'text-primary' },
            // { name: 'GETNAME_COUNT'   , displayName: '收件人公司', width: 115, headerCellClass: 'text-danger', enableCellEdit: false, pinnedRight:true },
            // { name: 'GETADDRESS_COUNT', displayName: '收件地址', width: 115, headerCellClass: 'text-danger', enableCellEdit: false, pinnedRight:true }

        ],
        enableFiltering: false,
        enableSorting: true,
        enableColumnMenus: false,
        // enableVerticalScrollbar: false,
        paginationPageSizes: [50, 100, 150, 200, 250, 300],
        paginationPageSize: 100,
        rowEditWaitInterval: -1,
        onRegisterApi: function(gridApi){
            $ctrl.overSixGridApi = gridApi;

            gridApi.edit.on.afterCellEdit($scope, calculationFinalCost);
        }
    }

    $ctrl.ok = function() {
        $uibModalInstance.close($ctrl.overSixGridApi.rowEdit.getDirtyRows());
    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
});