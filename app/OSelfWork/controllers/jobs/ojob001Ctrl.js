"use strict";

angular.module('app.oselfwork').controller('OJob001Ctrl', function ($scope, $stateParams, $state, AuthApi, Session, toaster, $uibModal, $templateCache, RestfulApi, ToolboxApi, uiGridConstants, $filter, $q, bool) {
    // console.log('Job001Ctrl:', $stateParams, $state);

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
        loading : {
            calculateNetWieghtBalance : false,
            calculateCrossWieghtBalance : false
        },
        profile : Session.Get(),
        gridMethod : {
            // 改單
            changeNature : function(row){
                console.log(row);

                row.entity.loading = true;
                ToolboxApi.ChangeONature({
                    ID : $vm.profile.U_ID,
                    PW : $vm.profile.U_PW,
                    NATURE : row.entity.O_IL_NATURE,
                    NATURE_NEW : row.entity.O_IL_NATURE_NEW
                }).then(function (res) {
                    var _returnData = JSON.parse(res["returnData"]),
                        needToUpdate = false;
                    // console.log(_returnData);

                    if(!angular.isUndefined(_returnData["O_IL_NATURE_NEW"])){
                        row.entity.O_IL_NATURE_NEW = _returnData["O_IL_NATURE_NEW"];
                        needToUpdate = true;
                    }
                    if(!angular.isUndefined(_returnData["O_IL_NEWPCS"]) && _returnData["O_IL_NEWPCS"] != ""){
                        row.entity.O_IL_NEWPCS = _returnData["O_IL_NEWPCS"];
                        needToUpdate = true;
                    }
                    if(!angular.isUndefined(_returnData["O_IL_TAX2"]) && _returnData["O_IL_TAX2"] != ""){
                        row.entity.O_IL_TAX2 = _returnData["O_IL_TAX2"];
                        needToUpdate = true;
                    }
                    // if(!angular.isUndefined(_returnData["O_IL_TAXRATE2"]) && _returnData["O_IL_TAXRATE2"] != ""){
                    //     row.entity.O_IL_TAXRATE2 = _returnData["O_IL_TAXRATE2"];
                    //     needToUpdate = true;
                    // }

                    if(needToUpdate){
                        $vm.job001GridApi.rowEdit.setRowsDirty([row.entity]);
                    }

                }).finally(function() {
                    row.entity.loading = false;
                });
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
                                table: 41,
                                params: {
                                    O_IL_SEQ         : $vm.job001GridApi.selection.getSelectedRows()[i].O_IL_SEQ,
                                    O_IL_NEWSMALLNO  : $vm.job001GridApi.selection.getSelectedRows()[i].O_IL_NEWSMALLNO,
                                    O_IL_SMALLNO     : $vm.job001GridApi.selection.getSelectedRows()[i].O_IL_SMALLNO
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
            // 單筆拉貨
            pullGoods : function(row){
                console.log(row.entity);

                var modalInstance = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'opullGoodsModalContent.html',
                    controller: 'OPullGoodsModalInstanceCtrl',
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
                        table: 45,
                        params: {
                            O_PG_SEQ         : selectedItem.O_IL_SEQ,
                            O_PG_SMALLNO     : selectedItem.O_IL_SMALLNO,
                            O_PG_NEWSMALLNO  : selectedItem.O_IL_NEWSMALLNO,
                            O_PG_REASON      : selectedItem.O_PG_REASON,
                            O_PG_CR_USER     : $vm.profile.U_ID,
                            O_PG_CR_DATETIME : $filter('date')(new Date, 'yyyy-MM-dd HH:mm:ss')
                        }
                    });

                    RestfulApi.CRUDMSSQLDataByTask(_task).then(function (res){

                        if(res["returnData"].length > 0){
                            
                            for(var i in $vm.job001Data){
                                if($vm.job001Data[i].O_IL_NEWSMALLNO == selectedItem.O_IL_NEWSMALLNO){
                                    $vm.job001Data[i].O_PG_PULLGOODS = true;
                                }
                            }

                        }
                    });

                }, function() {
                    // $log.info('Modal dismissed at: ' + new Date());
                });
            },
            // 特貨
            specialGoods : function(row){
                console.log(row);
                
                var modalInstance = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'ospecialGoodsModalContent.html',
                    controller: 'OSpecialGoodsModalInstanceCtrl',
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

                    if(selectedItem.O_SPG_TYPE == null){
                        RestfulApi.DeleteMSSQLData({
                            deletename: 'Delete',
                            table: 44,
                            params: {
                                O_SPG_SEQ         : selectedItem.O_IL_SEQ,
                                O_SPG_SMALLNO     : selectedItem.O_IL_SMALLNO,
                                O_SPG_NEWSMALLNO  : selectedItem.O_IL_NEWSMALLNO
                            }
                        }).then(function (res) {
                            // 變更特貨類型
                            row.entity.O_SPG_SPECIALGOODS = 0;
                        });
                    }else{
                        RestfulApi.UpsertMSSQLData({
                            upsertname: 'Upsert',
                            table: 44,
                            params: {
                                O_SPG_TYPE        : selectedItem.O_SPG_TYPE,
                                O_SPG_CR_USER     : $vm.profile.U_ID,
                                O_SPG_CR_DATETIME : $filter('date')(new Date, 'yyyy-MM-dd HH:mm:ss')
                            },
                            condition: {
                                O_SPG_SEQ         : selectedItem.O_IL_SEQ,
                                O_SPG_SMALLNO     : selectedItem.O_IL_SMALLNO,
                                O_SPG_NEWSMALLNO  : selectedItem.O_IL_NEWSMALLNO
                            }
                        }).then(function (res) {
                            // 變更特貨類型
                            row.entity.O_SPG_SPECIALGOODS = selectedItem.O_SPG_TYPE;
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
                { name: 'O_IL_SUPPLEMENT_COUNT' , displayName: '補件', width: 50, pinnedLeft:true, enableCellEdit: false },
                { name: 'Index'                 , displayName: '序列', width: 50, pinnedLeft:true, enableFiltering: false, enableCellEdit: false },
                { name: 'O_IL_REMARK'           , displayName: '備註', width: 100, headerCellClass: 'text-primary' },
                { name: 'O_IL_G1'               , displayName: '報關種類', width: 80, headerCellClass: 'text-primary' },
                // { name: 'O_IL_MERGENO'          , displayName: '併票號', width: 80, headerCellClass: 'text-primary' },
                { name: 'O_IL_SMALLNO'          , displayName: '小號', width: 110, enableCellEdit: false },
                { name: 'O_IL_POSTNO'           , displayName: '艙單號碼', width: 110, enableCellEdit: false },
                { name: 'O_IL_CUSTID'           , displayName: '快遞業者統一編號', width: 110, enableCellEdit: false },
                { name: 'O_IL_PRICECONDITON'    , displayName: '單價條件', width: 110, enableCellEdit: false },
                { name: 'O_IL_CURRENCY'         , displayName: '單價幣別代碼', width: 110, enableCellEdit: false },
                { name: 'O_IL_CROSSWEIGHT'      , displayName: '毛重', width: 110, enableCellEdit: false },
                { name: 'O_IL_NEWCROSSWEIGHT'   , displayName: '新毛重', width: 110, headerCellClass: 'text-primary' },
                { name: 'O_IL_CTN'              , displayName: '件數', width: 110, enableCellEdit: false },
                { name: 'O_IL_NEWCTN'           , displayName: '新件數', width: 110, headerCellClass: 'text-primary' },
                { name: 'O_IL_CTNUNIT'          , displayName: '件數單位', width: 110, enableCellEdit: false },
                { name: 'O_IL_MARK'             , displayName: '標記', width: 110, enableCellEdit: false },
                { name: 'O_IL_SMALLNO_ID'       , displayName: '貨物編號', width: 110, headerCellClass: 'text-primary' },
                { name: 'O_IL_NATURE'           , displayName: '貨物名稱', width: 110, enableCellEdit: false, cellTooltip: cellTooltip},
                { name: 'O_IL_NATURE_NEW'       , displayName: '新貨物名稱', width: 110, headerCellClass: 'text-primary', cellTooltip: cellTooltip},
                { name: 'ChangeNature'          , displayName: '改單', width: 66, enableCellEdit: false, enableSorting:false, cellTemplate: $templateCache.get('accessibilityToChangeNature'), cellClass: 'cell-class-no-style' },
                { name: 'O_IL_TAX'              , displayName: '稅則', width: 110, enableCellEdit: false },
                { name: 'O_IL_TAX2'             , displayName: '新稅則', width: 110, headerCellClass: 'text-primary' },
                // { name: 'O_IL_TAXRATE'          , displayName: '稅率', width: 110, enableCellEdit: false },
                // { name: 'O_IL_TAXRATE2'         , displayName: '新稅率', width: 110, headerCellClass: 'text-primary' },
                { name: 'O_IL_BRAND'            , displayName: '商標', width: 110, enableCellEdit: false },
                { name: 'O_IL_FORMAT'           , displayName: '成分及規格', width: 110, enableCellEdit: false },
                { name: 'O_IL_NETWEIGHT'        , displayName: '淨重', width: 110, enableCellEdit: false },
                { name: 'O_IL_NETWEIGHT_NEW'    , displayName: '新淨重', width: 110, headerCellClass: 'text-primary' },
                { name: 'O_IL_COUNT'            , displayName: '數量', width: 110, enableCellEdit: false },
                { name: 'O_IL_NEWCOUNT'         , displayName: '新數量', width: 110, headerCellClass: 'text-primary' },
                { name: 'O_IL_PRICEUNIT'        , displayName: '單價', width: 110, enableCellEdit: false },
                { name: 'O_IL_NEWPRICEUNIT'     , displayName: '新單價', width: 110, headerCellClass: 'text-primary' },
                { name: 'O_IL_PCS'              , displayName: '數量單位', width: 110, enableCellEdit: false, filters: [
                    {
                        condition: uiGridConstants.filter.GREATER_THAN,
                        placeholder: '最小'
                    },
                    {
                        condition: uiGridConstants.filter.LESS_THAN,
                        placeholder: '最大'
                    }
                ]},
                { name: 'O_IL_NEWPCS'           , displayName: '新數量單位', width: 110, headerCellClass: 'text-primary', filters: [
                    {
                        condition: uiGridConstants.filter.GREATER_THAN,
                        placeholder: '最小'
                    },
                    {
                        condition: uiGridConstants.filter.LESS_THAN,
                        placeholder: '最大'
                    }
                ]},
                { name: 'O_IL_INVOICECOST'      , displayName: '發票總金額', width: 110, enableCellEdit: false },
                { name: 'O_IL_INVOICECOST2'     , displayName: '新發票總金額', width: 110, headerCellClass: 'text-primary' },
                { name: 'O_IL_FINALCOST'        , displayName: '完稅價格', width: 110, enableCellEdit: false, filters: [
                    {
                        condition: uiGridConstants.filter.GREATER_THAN,
                        placeholder: '最小'
                    },
                    {
                        condition: uiGridConstants.filter.LESS_THAN,
                        placeholder: '最大'
                    }
                ]},
                { name: 'O_IL_VOLUME'           , displayName: '體積', width: 110, enableCellEdit: false },
                { name: 'O_IL_VOLUMEUNIT'       , displayName: '體積單位', width: 110, enableCellEdit: false },
                { name: 'O_IL_COUNTRY'          , displayName: '生產國別', width: 110, enableCellEdit: false },
                { name: 'O_IL_SENDENAME'        , displayName: '出口人英文名稱', width: 110, enableCellEdit: false },
                { name: 'O_IL_NEWSENDENAME'     , displayName: '新出口人英文名稱', width: 110, headerCellClass: 'text-primary' },
                { name: 'O_IL_COUNTRYID'        , displayName: '出口人國家代碼', width: 110, enableCellEdit: false },
                { name: 'O_IL_NEWCOUNTRYID'     , displayName: '新出口人國家代碼', width: 110, headerCellClass: 'text-primary' },
                { name: 'O_IL_SENDADDRESS'      , displayName: '出口人英文地址', width: 110, enableCellEdit: false },
                { name: 'O_IL_NEWSENDADDRESS'   , displayName: '新出口人英文地址', width: 110, headerCellClass: 'text-primary' },
                { name: 'O_IL_GETID'            , displayName: '進口人身分識別碼', width: 110, enableCellEdit: false },
                { name: 'O_IL_GETNO'            , displayName: '進口人統一編號', width: 110, headerCellClass: 'text-primary' },
                { name: 'O_IL_GETENAME'         , displayName: '進口人英文名稱', width: 110, headerCellClass: 'text-primary' },
                { name: 'O_IL_GETPHONE'         , displayName: '進口人電話', width: 110, headerCellClass: 'text-primary' },
                { name: 'O_IL_GETADDRESS'       , displayName: '進口人英文地址', width: 110, headerCellClass: 'text-primary' },
                { name: 'O_IL_DWKIND'           , displayName: '貨櫃種類', width: 110, enableCellEdit: false },
                { name: 'O_IL_DWNUMBER'         , displayName: '貨櫃號碼', width: 110, enableCellEdit: false },
                { name: 'O_IL_DWTYPE'           , displayName: '貨櫃裝運方式', width: 110, enableCellEdit: false },
                { name: 'O_IL_SEALNUMBER'       , displayName: '封條號碼', width: 110, enableCellEdit: false },
                { name: 'O_IL_DECLAREMEMO1'     , displayName: '其他申報事項1', width: 110, enableCellEdit: false },
                { name: 'O_IL_DECLAREMEMO2'     , displayName: '其他申報事項2', width: 110, headerCellClass: 'text-primary' },
                { name: 'O_IL_TAXPAYMENTMEMO'   , displayName: '主動申報繳納稅款註記', width: 110, headerCellClass: 'text-primary' },
                { name: 'Options'       , displayName: '操作', width: 120, enableCellEdit: false, enableSorting:false, enableFiltering: false, cellTemplate: $templateCache.get('accessibilityToOJob001'), pinnedRight:true, cellClass: 'cell-class-no-style' }
            ],
            rowTemplate: '<div> \
                            <div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{\'cell-class-pull\' : row.entity.O_PG_PULLGOODS == true, \'cell-class-special\' : row.entity.O_SPG_SPECIALGOODS != 0}" ui-grid-cell></div> \
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

                // 海運尚未詳談此部分
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
        // 計算淨重
        CalculateNetWieghtBalance: function(){

            var _totalNetWeight = 0,
                _totalNewNetWeight = 0;
            for(var i in $vm.job001Data){
                // 規則如Procedure NetWeightBalance
                if(['G1', 'X3', '移倉'].indexOf($vm.job001Data[i]["O_IL_G1"]) == -1 &&
                    $vm.job001Data[i]["O_IL_NETWEIGHT"] > 1 &&
                    $vm.job001Data[i]["O_PG_PULLGOODS"] != 1){
                    if($vm.job001Data[i]["O_IL_NETWEIGHT"]){
                        _totalNetWeight += $vm.job001Data[i]["O_IL_NETWEIGHT"];
                    }
                    if($vm.job001Data[i]["O_IL_NETWEIGHT_NEW"]){
                        _totalNewNetWeight += $vm.job001Data[i]["O_IL_NETWEIGHT_NEW"];
                    }
                }
            }

            $vm.vmData["totalNetWeight"] = _totalNetWeight.toFixed(2);
            $vm.vmData["totalNewNetWeight"] = _totalNewNetWeight.toFixed(2);

            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'calculateNetWieghtBalanceModalContent.html',
                // controller如毛重
                controller: 'CalculateCrossWieghtBalanceModalInstanceCtrl',
                controllerAs: '$ctrl',
                // size: 'lg',
                resolve: {
                    vmData: function() {
                        return $vm.vmData;
                    }
                }
            });

            modalInstance.result.then(function(selectedItem) {

                console.log(selectedItem);

                // 如果輸入的值小於等於0
                if(selectedItem.O_OL_FLIGHT_TOTALNETWEIGHT <= 0){
                    toaster.pop('warning', '警告', '請輸入大於等於0的數值。', 3000);
                    return;
                }

                var _maxRatio = 1.5,
                    _minRatio = 0.5,
                    _ratio = (selectedItem.O_OL_FLIGHT_TOTALNETWEIGHT / selectedItem.totalNetWeight).toFixed(2);
                if(_ratio < _minRatio || _maxRatio < _ratio){
                    toaster.pop('warning', '警告', '請勿輸入對於報機單總重量(淨重)差距過小或過大的數值。', 3000);
                    return;
                }

                $vm.loading.calculateNetWieghtBalance = true;
                
                var _task = [];

                _task.push({
                    crudType: 'Update',
                    table: 40,
                    params: {
                        O_OL_FLIGHT_TOTALNETWEIGHT : selectedItem.O_OL_FLIGHT_TOTALNETWEIGHT,
                        O_OL_UP_USER            : $vm.profile.U_ID,
                        O_OL_UP_DATETIME        : $filter('date')(new Date, 'yyyy-MM-dd HH:mm:ss')
                    },
                    condition: {
                        O_OL_SEQ : $vm.vmData.O_OL_SEQ
                    }
                });

                _task.push({
                    crudType: 'Select',
                    querymain: 'ojob001',
                    queryname: 'CalculateNetWieghtBalance',
                    params: {
                        O_IL_SEQ: $vm.vmData.O_OL_SEQ
                    }
                });

                RestfulApi.CRUDMSSQLDataByTask(_task).then(function (res){

                    console.log(res);

                    var _data = res["returnData"] || [];

                    if(_data.length > 0){

                        if(_data[1][0].ReturnValue == 1){
                            toaster.pop('success', '訊息', '平衡淨重完成。', 3000);
                            $vm.vmData.O_OL_FLIGHT_TOTALNETWEIGHT = selectedItem.O_OL_FLIGHT_TOTALNETWEIGHT;
                        }else if(_data[1][0].ReturnValue == 0){
                            toaster.pop('info', '訊息', '淨重已平衡。', 3000);
                        }else{
                            toaster.pop('error', '失敗', '平衡淨重有誤，請聯絡系統管理員。', 3000);
                        }

                        LoadItemList();
                    }

                }).finally(function() {
                    $vm.loading.calculateNetWieghtBalance = false;
                });

            }, function() {
                // $log.info('Modal dismissed at: ' + new Date());
            });

        },
        // 計算毛重
        CalculateCrossWieghtBalance: function(){

            var _totalCrossWeight = 0,
                _totalNewCrossWeight = 0;
            for(var i in $vm.job001Data){
                // 規則如Procedure CrossWeightBalance
                if(['G1', 'X3', '移倉'].indexOf($vm.job001Data[i]["O_IL_G1"]) == -1 &&
                    $vm.job001Data[i]["O_IL_CROSSWEIGHT"] > 1 &&
                    $vm.job001Data[i]["O_PG_PULLGOODS"] != 1){
                    if($vm.job001Data[i]["O_IL_CROSSWEIGHT"]){
                        _totalCrossWeight += $vm.job001Data[i]["O_IL_CROSSWEIGHT"];
                    }
                    if($vm.job001Data[i]["O_IL_NEWCROSSWEIGHT"]){
                        _totalNewCrossWeight += $vm.job001Data[i]["O_IL_NEWCROSSWEIGHT"];
                    }
                }
            }

            $vm.vmData["totalCrossWeight"] = _totalCrossWeight.toFixed(2);
            $vm.vmData["totalNewCrossWeight"] = _totalNewCrossWeight.toFixed(2);

            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'calculateCrossWieghtBalanceModalContent.html',
                controller: 'CalculateCrossWieghtBalanceModalInstanceCtrl',
                controllerAs: '$ctrl',
                // size: 'lg',
                resolve: {
                    vmData: function() {
                        return $vm.vmData;
                    }
                }
            });

            modalInstance.result.then(function(selectedItem) {

                console.log(selectedItem);

                // 如果輸入的值小於等於0
                if(selectedItem.O_OL_FLIGHT_TOTALCROSSWEIGHT <= 0){
                    toaster.pop('warning', '警告', '請輸入大於等於0的數值。', 3000);
                    return;
                }

                var _maxRatio = 1.5,
                    _minRatio = 0.5,
                    _ratio = (selectedItem.O_OL_FLIGHT_TOTALCROSSWEIGHT / selectedItem.totalCrossWeight).toFixed(2);
                if(_ratio < _minRatio || _maxRatio < _ratio){
                    toaster.pop('warning', '警告', '請勿輸入對於報機單總重量(毛重)差距過小或過大的數值。', 3000);
                    return;
                }

                $vm.loading.calculateCrossWieghtBalance = true;
                
                var _task = [];

                _task.push({
                    crudType: 'Update',
                    table: 40,
                    params: {
                        O_OL_FLIGHT_TOTALCROSSWEIGHT : selectedItem.O_OL_FLIGHT_TOTALCROSSWEIGHT,
                        O_OL_UP_USER            : $vm.profile.U_ID,
                        O_OL_UP_DATETIME        : $filter('date')(new Date, 'yyyy-MM-dd HH:mm:ss')
                    },
                    condition: {
                        O_OL_SEQ : $vm.vmData.O_OL_SEQ
                    }
                });

                _task.push({
                    crudType: 'Select',
                    querymain: 'ojob001',
                    queryname: 'CalculateCrossWieghtBalance',
                    params: {
                        O_IL_SEQ: $vm.vmData.O_OL_SEQ
                    }
                });

                RestfulApi.CRUDMSSQLDataByTask(_task).then(function (res){

                    console.log(res);

                    var _data = res["returnData"] || [];

                    if(_data.length > 0){

                        if(_data[1][0].ReturnValue == 1){
                            toaster.pop('success', '訊息', '平衡毛重完成。', 3000);
                            $vm.vmData.O_OL_FLIGHT_TOTALCROSSWEIGHT = selectedItem.O_OL_FLIGHT_TOTALCROSSWEIGHT;
                        }else if(_data[1][0].ReturnValue == 0){
                            toaster.pop('info', '訊息', '毛重已平衡。', 3000);
                        }else{
                            toaster.pop('error', '失敗', '平衡毛重有誤，請聯絡系統管理員。', 3000);
                        }

                        LoadItemList();
                    }

                }).finally(function() {
                    $vm.loading.calculateCrossWieghtBalance = false;
                });

            }, function() {
                // $log.info('Modal dismissed at: ' + new Date());
            });

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
                templateUrl: 'ospecialGoodsModalContent.html',
                controller: 'MultiOSpecialGoodsModalInstanceCtrl',
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
                            table: 44,
                            params: {
                                O_SPG_SEQ         : $vm.job001GridApi.selection.getSelectedRows()[i].O_IL_SEQ,
                                O_SPG_SMALLNO     : $vm.job001GridApi.selection.getSelectedRows()[i].O_IL_SMALLNO,
                                O_SPG_NEWSMALLNO  : $vm.job001GridApi.selection.getSelectedRows()[i].O_IL_NEWSMALLNO
                            }
                        });
                    }else{
                        _task.push({
                            crudType: 'Upsert',
                            table: 44,
                            params: {
                                O_SPG_TYPE        : selectedItem.O_SPG_TYPE,
                                O_SPG_CR_USER     : $vm.profile.U_ID,
                                O_SPG_CR_DATETIME : $filter('date')(new Date, 'yyyy-MM-dd HH:mm:ss')
                            },
                            condition: {
                                O_SPG_SEQ         : $vm.job001GridApi.selection.getSelectedRows()[i].O_IL_SEQ,
                                O_SPG_SMALLNO     : $vm.job001GridApi.selection.getSelectedRows()[i].O_IL_SMALLNO,
                                O_SPG_NEWSMALLNO  : $vm.job001GridApi.selection.getSelectedRows()[i].O_IL_NEWSMALLNO
                            }
                        });
                    }

                }

                RestfulApi.CRUDMSSQLDataByTask(_task).then(function (res){

                    if(res["returnData"].length > 0){
                        // 變更特貨類型
                        for(var i in $vm.job001GridApi.selection.getSelectedRows()){
                            if(angular.isUndefined(selectedItem)){
                                $vm.job001GridApi.selection.getSelectedRows()[i].O_SPG_SPECIALGOODS = 0;
                            }else{
                                $vm.job001GridApi.selection.getSelectedRows()[i].O_SPG_SPECIALGOODS = selectedItem.O_SPG_TYPE;
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
         * [PullGoods description] 多筆拉貨
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
                templateUrl: 'opullGoodsModalContent.html',
                controller: 'OPullGoodsModalInstanceCtrl',
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

                var _task = [];

                for(var i in $vm.job001GridApi.selection.getSelectedRows()){

                    _task.push({
                        crudType: 'Insert',
                        table: 45,
                        params: {
                            O_PG_SEQ         : $vm.job001GridApi.selection.getSelectedRows()[i].O_IL_SEQ,
                            O_PG_SMALLNO     : $vm.job001GridApi.selection.getSelectedRows()[i].O_IL_SMALLNO,
                            O_PG_NEWSMALLNO  : $vm.job001GridApi.selection.getSelectedRows()[i].O_IL_NEWSMALLNO,
                            O_PG_REASON      : selectedItem.O_PG_REASON,
                            O_PG_CR_USER     : $vm.profile.U_ID,
                            O_PG_CR_DATETIME : $filter('date')(new Date, 'yyyy-MM-dd HH:mm:ss')
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
         * [RepeatGet description] 檢查重複進口人
         */
        RepeatGet : function(){

            RestfulApi.SearchMSSQLData({
                querymain: 'ojob001',
                queryname: 'RepeatGet',
                params: {
                    O_IL_SEQ: $vm.vmData.O_OL_SEQ
                }
            }).then(function (res){
                console.log(res["returnData"]);

                var _data = res["returnData"] || [];

                if(_data.length > 0){
                    var modalInstance = $uibModal.open({
                        animation: true,
                        ariaLabelledBy: 'modal-title',
                        ariaDescribedBy: 'modal-body',
                        templateUrl: 'repeatGetModalContent.html',
                        controller: 'RepeatGetModalInstanceCtrl',
                        controllerAs: '$ctrl',
                        backdrop: 'static',
                        size: 'lg',
                        // appendTo: parentElem,
                        resolve: {
                            repeatGet: function() {
                                return _data;
                            }
                        }
                    });

                    modalInstance.result.then(function(selectedItem) {
                        console.log(selectedItem);

                        if(selectedItem.length > 0){

                            var _getDirtyData = [];
                            for(var i in selectedItem){

                                var _beUpdate = $filter('filter')($vm.job001Data, { 
                                    O_IL_SEQ : selectedItem[i].entity.O_IL_SEQ,
                                    O_IL_NEWSMALLNO : selectedItem[i].entity.O_IL_NEWSMALLNO,
                                    O_IL_SMALLNO : selectedItem[i].entity.O_IL_SMALLNO
                                });

                                if(_beUpdate.length > 0){
                                    var _index = _beUpdate[0].Index - 1;

                                    // 更新收件者相同的值
                                    for(var j in $vm.job001GridApi.grid.columns){
                                        var _colDef = $vm.job001GridApi.grid.columns[j].colDef;
                                        if(_colDef.enableCellEdit){
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
                    toaster.pop('info', '訊息', '無重複進口人', 3000);
                }
            }); 
        },
        ExportExcel: function(){
            
            console.log($vm.vmData);

            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'oexcelMenu.html',
                controller: 'OExcelMenuModalInstanceCtrl',
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
                    _exportName = $filter('date')($vm.vmData.O_OL_IMPORTDT, 'yyyyMMdd', 'GMT') + ' ' + 
                                  $filter('ocompyFilter')($vm.vmData.O_OL_CO_CODE) + ' ' + 
                                  $vm.vmData.O_OL_COUNT + '件 ' +
                                  $vm.vmData.O_OL_PULL_COUNT + '件',
                    _queryname = null,
                    _params = {
                        O_OL_MASTER : $vm.vmData.O_OL_MASTER,
                        O_OL_PASSCODE : $vm.vmData.O_OL_PASSCODE,
                        O_OL_VOYSEQ : $vm.vmData.O_OL_VOYSEQ,
                        O_OL_MVNO : $vm.vmData.O_OL_MVNO,
                        O_OL_COMPID : $vm.vmData.O_OL_COMPID,
                        O_OL_ARRLOCATIONID : $vm.vmData.O_OL_ARRLOCATIONID,
                        O_OL_POST : $vm.vmData.O_OL_POST,
                        O_OL_PACKAGELOCATIONID : $vm.vmData.O_OL_PACKAGELOCATIONID,
                        O_OL_BOATID : $vm.vmData.O_OL_BOATID,
                        O_IL_SEQ : $vm.vmData.O_OL_SEQ
                    };

                switch(selectedItem){
                    // 關貿格式(G1)
                    case "0G1":
                        _templates = "18";
                        _queryname = "SelectOItemListForEx0";
                        _params["O_IL_G1"] = "'G1'";
                        break;
                    // 關貿格式(X2)
                    case "0X2":
                        _templates = "18";
                        _queryname = "SelectOItemListForEx12";
                        _params["O_IL_G1"] = "'','X2','Y'";
                        // // 不包含併X3(也就是mergeno是null)
                        // _params["IL_MERGENO"] = null;
                        // _params["OL_CO_NAME"] = $filter('ocompyFilter')($vm.vmData.OL_CO_CODE);
                        break;
                    // 關貿格式(X3)
                    case "0X3":
                        _templates = "18";
                        _queryname = "SelectOItemListForEx0";
                        _params["O_IL_G1"] = "'X3'";
                        break;
                    // 關貿格式(ALL)
                    case "ALL":
                        _templates = "18";
                        _queryname = "SelectOItemListForEx0";
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
                        querymain: 'ojob001',
                        queryname: _queryname,
                        params: _params
                    }).then(function (res) {
                        // console.log(res);
                    
                        $vm.vmData.TRADE_EXPORT += 1;

                        RestfulApi.InsertMSSQLData({
                            insertname: 'Insert',
                            table: 46,
                            params: {
                                O_ILE_SEQ : $vm.vmData.O_OL_SEQ,
                                O_ILE_TYPE : selectedItem,
                                O_ILE_CR_DATETIME : $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                                O_ILE_CR_USER : $vm.profile.U_ID
                            }
                        }).then(function (res) {
                            
                        });
                    });
                }

            }, function() {
                // $log.info('Modal dismissed at: ' + new Date());
            });
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
                    table: 43,
                    params: {
                        O_OE_FDATETIME : $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss')
                    },
                    condition: {
                        O_OE_SEQ : $vm.vmData.O_OL_SEQ,
                        O_OE_TYPE : 'R',
                        O_OE_PRINCIPAL : $vm.profile.U_ID
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
            // console.log(entity);

            // create a fake promise - normally you'd use the promise returned by $http or $resource
            var deferred = $q.defer();
            $vm.job001GridApi.rowEdit.setSavePromise( entity, deferred.promise );
         
            RestfulApi.UpdateMSSQLData({
                updatename: 'Update',
                table: 41,
                params: {
                    O_IL_REMARK         : entity.O_IL_REMARK,
                    O_IL_G1             : entity.O_IL_G1,
                    O_IL_MERGENO        : entity.O_IL_MERGENO,
                    O_IL_NEWCROSSWEIGHT : isNaN(parseFloat(entity.O_IL_NEWCROSSWEIGHT)) ? null : entity.O_IL_NEWCROSSWEIGHT,
                    O_IL_NEWCTN         : isNaN(parseInt(entity.O_IL_NEWCTN)) ? null : entity.O_IL_NEWCTN,
                    O_IL_NATURE_NEW     : entity.O_IL_NATURE_NEW,
                    O_IL_TAX2           : entity.O_IL_TAX2,
                    // O_IL_TAXRATE2       : entity.O_IL_TAXRATE2,
                    O_IL_NETWEIGHT_NEW  : isNaN(parseFloat(entity.O_IL_NETWEIGHT_NEW)) ? null : entity.O_IL_NETWEIGHT_NEW,
                    O_IL_NEWCOUNT       : isNaN(parseInt(entity.O_IL_NEWCOUNT)) ? null : entity.O_IL_NEWCOUNT,
                    O_IL_NEWPRICEUNIT   : isNaN(parseFloat(entity.O_IL_NEWPRICEUNIT)) ? null : entity.O_IL_NEWPRICEUNIT,
                    O_IL_NEWPCS         : isNaN(parseInt(entity.IL_NEWPCS)) ? null : entity.IL_NEWPCS,
                    O_IL_INVOICECOST2   : isNaN(parseFloat(entity.O_IL_INVOICECOST2)) ? null : entity.O_IL_INVOICECOST2,
                    O_IL_FINALCOST      : isNaN(parseFloat(entity.IL_FINALCOST)) ? null : entity.IL_FINALCOST,
                    O_IL_NEWSENDENAME   : entity.O_IL_NEWSENDENAME,
                    O_IL_NEWCOUNTRYID   : entity.O_IL_NEWCOUNTRYID,
                    O_IL_NEWSENDADDRESS : entity.O_IL_NEWSENDADDRESS,
                    O_IL_UP_DATETIME     : $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                    O_IL_UP_USER         : $vm.profile.U_ID
                },
                condition: {
                    O_IL_SEQ        : entity.O_IL_SEQ,
                    O_IL_NEWSMALLNO : entity.O_IL_NEWSMALLNO,
                    O_IL_SMALLNO    : entity.O_IL_SMALLNO
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
            querymain: 'ojob001',
            queryname: 'SelectOItemList',
            params: {
                O_IL_SEQ: $vm.vmData.O_OL_SEQ
            }
        }).then(function (res){
            console.log(res["returnData"]);
            for(var i=0;i<res["returnData"].length;i++){
                res["returnData"][i]["Index"] = i+1;
            }
            $vm.job001Data = angular.copy(res["returnData"]);
        }); 
    };

    function CalculationFinalCost(rowEntity, colDef, newValue, oldValue){

        // 編輯為 進口人統編
        if(colDef.name == 'O_IL_GETNO'){
            // 當有輸入值時
            if(newValue != ''){
                var _getnoOverSix = $filter('filter')($vm.job001Data, { O_IL_GETNO: newValue, O_PG_PULLGOODS: 0, O_IL_G1: '' }, true);
                
                // 進口人統編 在該單 >=6次
                if(_getnoOverSix.length >= 6){
                    for(var i in _getnoOverSix){
                        _getnoOverSix[i]['O_IL_G1'] = 'Y';
                    }
                    $vm.job001GridApi.rowEdit.setRowsDirty(_getnoOverSix);
                    return;
                }

                // 清除如果先編輯後才拉貨的統編
                var _getnoOverSix = $filter('filter')($vm.job001Data, { O_IL_GETNO: newValue, O_IL_G1: 'Y' }, true);
                for(var i in _getnoOverSix){
                    _getnoOverSix[i]['O_IL_G1'] = '';
                }

                $vm.job001GridApi.rowEdit.setRowsDirty(_getnoOverSix);
                return;
            }else{
                // 當沒輸入值時 清空原本的Y
                var _getnoOverSix = $filter('filter')($vm.job001Data, { O_IL_GETNO: oldValue, O_PG_PULLGOODS: 0, O_IL_G1: 'Y' }, true);

                _getnoOverSix.push(rowEntity);
                for(var i in _getnoOverSix){
                    _getnoOverSix[i]['O_IL_G1'] = '';
                }
            }
        }

        // 一律為大寫
        if(colDef.name == 'O_IL_G1') {
            try {
                rowEntity["O_IL_G1"] = newValue.toUpperCase();
            }
            catch (e) {
                console.log(e);
            }
        }

        // try {
            // if(newValue.toUpperCase() == "Y"){
            //     rowEntity.IL_WEIGHT_NEW = rowEntity.IL_WEIGHT;
            //     rowEntity.IL_NEWPCS = rowEntity.IL_PCS;
            //     rowEntity.IL_UNIVALENT_NEW = rowEntity.IL_UNIVALENT;
            //     rowEntity.IL_NEWSENDNAME = rowEntity.IL_SENDNAME;
            //     rowEntity.IL_FINALCOST = null;
            // }
        // }
        // catch (e) {
        //     console.log(e);
        // }

        // if(colDef.name == 'IL_GETNAME_NEW'){
        //     var _temp = encodeURI(rowEntity.IL_GETNAME_NEW),
        //         regex = /%09/gi;

        //     _temp = _temp.replace(regex, "%20");
        //     rowEntity.IL_GETNAME_NEW = decodeURI(_temp);
        // }

        // // 新單價 = 新重量 * 100 / 新數量
        // if(colDef.name == 'IL_WEIGHT_NEW' || colDef.name == 'IL_NEWPCS'){
        //     var _weight = parseFloat(rowEntity.IL_WEIGHT_NEW).toFixed(2),
        //         _pcs = parseInt(rowEntity.IL_NEWPCS);

        //     // 如果都不是空值 才開始計算
        //     if(!isNaN(_weight) && !isNaN(_pcs)){
        //         // 如果數量不為0
        //         if(parseInt(_pcs) != 0){
        //             rowEntity.IL_UNIVALENT_NEW = (_weight * 100) / _pcs;
        //         }else{
        //             rowEntity.IL_UNIVALENT_NEW = 0;
        //         }
        //     }
        // }

        // 計算發票總金額
        var _count = parseInt(rowEntity.O_IL_NEWCOUNT),
            _priceUnit = parseInt(rowEntity.O_IL_NEWPRICEUNIT),
            _invoiceCost = parseInt(rowEntity.O_IL_INVOICECOST2),
            start = 0;

        if(!isNaN(_count)){
            start += 1;
        }
        if(!isNaN(_priceUnit)){
            start += 1;
        }
        if(!isNaN(_invoiceCost)){
            start += 1;
        }

        // 表示可以開始計算
        if(start >= 2){
            // 新單價
            if(colDef.name == 'O_IL_NEWPRICEUNIT'){
                //如果數量有值
                if(!isNaN(_count)){
                    _invoiceCost = _count * _priceUnit;
                }
            }

            // 新數量
            if(colDef.name == 'O_IL_NEWCOUNT'){
                if(!isNaN(_priceUnit)){
                    _invoiceCost = _count * _priceUnit;
                }
            }

            // // 當完稅價格小於100
            // if(_finalcost < 100 && _finalcost != 0){
            //     // 給個新值 100~125
            //     var maxNum = 125;  
            //     var minNum = 100;  
            //     _finalcost = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum; 
            // }

            // // 當完稅價格超過2000 提醒使用者
            // if(_finalcost > 2000){
            //     toaster.pop('warning', '警告', '完稅價格超過2000元，請注意', 3000);
            // }
            
            // 當數量不為空 帶出單價 (會與新單價衝突)
            if(colDef.name == 'O_IL_NEWCOUNT' || colDef.name == 'O_IL_NEWPRICEUNIT' || colDef.name == 'O_IL_INVOICECOST2'){
                if(!isNaN(_count)){
                    if(parseInt(_count) != 0){
                        _priceUnit = Math.round(_invoiceCost / _count);
                    }else{
                        _priceUnit = 0;
                    }
                }
            }

            // 發票總金額
            if(colDef.name == 'O_IL_INVOICECOST2'){
                // 避免帳不平 再次計算完稅價格
                if(!isNaN(_count) && !isNaN(_priceUnit)){
                    _invoiceCost = _count * _priceUnit;
                }
            }

            // console.log("_invoiceCost:", _invoiceCost," _count:" , _count," _priceUnit:" , _priceUnit);
            rowEntity.O_IL_INVOICECOST2 = isNaN(_invoiceCost) ? null : _invoiceCost;
            rowEntity.O_IL_NEWCOUNT = isNaN(_count) ? null : _count;
            rowEntity.O_IL_NEWPRICEUNIT = isNaN(_priceUnit) ? null : _priceUnit;
        }

        $vm.job001GridApi.rowEdit.setRowsDirty([rowEntity]);

        // // console.log('edited row id:' + rowEntity.Index + ' Column:' + colDef.name + ' newValue:' + newValue + ' oldValue:' + oldValue);
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
.controller('OExcelMenuModalInstanceCtrl', function ($uibModalInstance) {
    var $ctrl = this;
    
    $ctrl.ok = function(pType) {
        $uibModalInstance.close(pType);
    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
})
.controller('OPullGoodsModalInstanceCtrl', function ($uibModalInstance, vmData) {
    var $ctrl = this;
    $ctrl.mdData = vmData;

    $ctrl.ok = function() {
        $uibModalInstance.close($ctrl.mdData);
    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
})
.controller('OSpecialGoodsModalInstanceCtrl', function ($uibModalInstance, items, specialGoods) {
    var $ctrl = this;

    $ctrl.Init = function(){
        $ctrl.mdData = items;
        $ctrl.specialGoodsData = specialGoods;

        if($ctrl.mdData.O_SPG_SPECIALGOODS != 0){
            $ctrl.mdData['O_SPG_TYPE'] = $ctrl.mdData.O_SPG_SPECIALGOODS.toString();
        }
    }


    $ctrl.ok = function() {
        $uibModalInstance.close($ctrl.mdData);
    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
})
.controller('MultiOSpecialGoodsModalInstanceCtrl', function ($uibModalInstance, specialGoods) {
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
.controller('CalculateCrossWieghtBalanceModalInstanceCtrl', function ($uibModalInstance, vmData) {
    var $ctrl = this;
    $ctrl.mdData = angular.copy(vmData);

    $ctrl.ok = function() {
        $uibModalInstance.close($ctrl.mdData);
    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
})
.controller('RepeatGetModalInstanceCtrl', function ($uibModalInstance, $q, $scope, repeatGet) {
    var $ctrl = this;
    $ctrl.mdData = repeatGet;

    $ctrl.repeatGetOption = {
        data: '$ctrl.mdData',
        columnDefs: [
            { name: 'O_IL_SENDENAME'        , displayName: '出口人英文名稱', width: 110, enableCellEdit: false },
            { name: 'O_IL_NEWSENDENAME'     , displayName: '新出口人英文名稱', width: 110, headerCellClass: 'text-primary' },
            { name: 'O_IL_GETNO'            , displayName: '進口人統一編號', width: 110, headerCellClass: 'text-primary' },
            { name: 'O_IL_G1'               , displayName: '報關種類', width: 80, headerCellClass: 'text-primary' },
            { name: 'O_IL_SMALLNO'          , displayName: '小號', width: 110, enableCellEdit: false },
            { name: 'O_IL_POSTNO'           , displayName: '艙單號碼', width: 110, enableCellEdit: false },
            { name: 'O_IL_CUSTID'           , displayName: '快遞業者統一編號', width: 110, enableCellEdit: false },
            { name: 'O_IL_PRICECONDITON'    , displayName: '單價條件', width: 110, enableCellEdit: false },
            { name: 'O_IL_CURRENCY'         , displayName: '單價幣別代碼', width: 110, enableCellEdit: false },
            { name: 'O_IL_CROSSWEIGHT'      , displayName: '毛重', width: 110, enableCellEdit: false },
            { name: 'O_IL_NEWCROSSWEIGHT'   , displayName: '新毛重', width: 110, headerCellClass: 'text-primary' },
            { name: 'O_IL_CTN'              , displayName: '件數', width: 110, enableCellEdit: false },
            { name: 'O_IL_NEWCTN'           , displayName: '新件數', width: 110, headerCellClass: 'text-primary' },
            { name: 'O_IL_CTNUNIT'          , displayName: '件數單位', width: 110, enableCellEdit: false },
            { name: 'O_IL_MARK'             , displayName: '標記', width: 110, enableCellEdit: false },
            { name: 'O_IL_SMALLNO_ID'       , displayName: '貨物編號', width: 110, headerCellClass: 'text-primary' },
            { name: 'O_IL_NATURE'           , displayName: '貨物名稱', width: 110, enableCellEdit: false, cellTooltip: cellTooltip},
            { name: 'O_IL_NATURE_NEW'       , displayName: '新貨物名稱', width: 110, headerCellClass: 'text-primary', cellTooltip: cellTooltip},
            { name: 'O_IL_TAX'              , displayName: '稅則', width: 110, enableCellEdit: false },
            { name: 'O_IL_TAX2'             , displayName: '新稅則', width: 110, headerCellClass: 'text-primary' },
            { name: 'O_IL_BRAND'            , displayName: '商標', width: 110, enableCellEdit: false },
            { name: 'O_IL_FORMAT'           , displayName: '成分及規格', width: 110, enableCellEdit: false },
            { name: 'O_IL_NETWEIGHT'        , displayName: '淨重', width: 110, enableCellEdit: false },
            { name: 'O_IL_NETWEIGHT_NEW'    , displayName: '新淨重', width: 110, headerCellClass: 'text-primary' },
            { name: 'O_IL_COUNT'            , displayName: '數量', width: 110, enableCellEdit: false },
            { name: 'O_IL_NEWCOUNT'         , displayName: '新數量', width: 110, headerCellClass: 'text-primary' },
            { name: 'O_IL_PRICEUNIT'        , displayName: '單價', width: 110, enableCellEdit: false },
            { name: 'O_IL_NEWPRICEUNIT'     , displayName: '新單價', width: 110, headerCellClass: 'text-primary' },
            { name: 'O_IL_PCS'              , displayName: '數量單位', width: 110, enableCellEdit: false},
            { name: 'O_IL_NEWPCS'           , displayName: '新數量單位', width: 110, headerCellClass: 'text-primary'},
            { name: 'O_IL_INVOICECOST'      , displayName: '發票總金額', width: 110, enableCellEdit: false },
            { name: 'O_IL_INVOICECOST2'     , displayName: '新發票總金額', width: 110, headerCellClass: 'text-primary' },
            { name: 'O_IL_FINALCOST'        , displayName: '完稅價格', width: 110, enableCellEdit: false},
            { name: 'O_IL_VOLUME'           , displayName: '體積', width: 110, enableCellEdit: false },
            { name: 'O_IL_VOLUMEUNIT'       , displayName: '體積單位', width: 110, enableCellEdit: false },
            { name: 'O_IL_COUNTRY'          , displayName: '生產國別', width: 110, enableCellEdit: false },
            { name: 'O_IL_COUNTRYID'        , displayName: '出口人國家代碼', width: 110, enableCellEdit: false },
            { name: 'O_IL_NEWCOUNTRYID'     , displayName: '新出口人國家代碼', width: 110, headerCellClass: 'text-primary' },
            { name: 'O_IL_SENDADDRESS'      , displayName: '出口人英文地址', width: 110, enableCellEdit: false },
            { name: 'O_IL_NEWSENDADDRESS'   , displayName: '新出口人英文地址', width: 110, headerCellClass: 'text-primary' },
            { name: 'O_IL_GETID'            , displayName: '進口人身分識別碼', width: 110, enableCellEdit: false },
            { name: 'O_IL_GETENAME'         , displayName: '進口人英文名稱', width: 110, headerCellClass: 'text-primary' },
            { name: 'O_IL_GETPHONE'         , displayName: '進口人電話', width: 110, headerCellClass: 'text-primary' },
            { name: 'O_IL_GETADDRESS'       , displayName: '進口人英文地址', width: 110, headerCellClass: 'text-primary' },
            { name: 'O_IL_DWKIND'           , displayName: '貨櫃種類', width: 110, enableCellEdit: false },
            { name: 'O_IL_DWNUMBER'         , displayName: '貨櫃號碼', width: 110, enableCellEdit: false },
            { name: 'O_IL_DWTYPE'           , displayName: '貨櫃裝運方式', width: 110, enableCellEdit: false },
            { name: 'O_IL_SEALNUMBER'       , displayName: '封條號碼', width: 110, enableCellEdit: false },
            { name: 'O_IL_DECLAREMEMO1'     , displayName: '其他申報事項1', width: 110, enableCellEdit: false },
            { name: 'O_IL_DECLAREMEMO2'     , displayName: '其他申報事項2', width: 110, headerCellClass: 'text-primary' },
            { name: 'O_IL_TAXPAYMENTMEMO'   , displayName: '主動申報繳納稅款註記', width: 110, headerCellClass: 'text-primary' }
        ],
        enableFiltering: false,
        enableSorting: true,
        enableColumnMenus: false,
        // enableVerticalScrollbar: false,
        paginationPageSizes: [50, 100, 150, 200, 250, 300],
        paginationPageSize: 100,
        rowEditWaitInterval: -1,
        onRegisterApi: function(gridApi){
            $ctrl.repeatGetGridApi = gridApi;
        }
    }

    $ctrl.ok = function() {
        $uibModalInstance.close($ctrl.repeatGetGridApi.rowEdit.getDirtyRows());
    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
});