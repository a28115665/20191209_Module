"use strict";

angular.module('app.selfwork').controller('LeaderHistorySearchCtrl', function ($scope, $stateParams, $state, AuthApi, Session, toaster, $uibModal, $templateCache, RestfulApi, $filter, compy, userInfo, bool, uiGridConstants, localStorageService, ToolboxApi) {
    
    var $vm = this;

	angular.extend(this, {
        Init : function(){
            // console.log(localStorageService.get("LeaderHistorySearch"));
            
            // 帶入LocalStorage資料
            if(localStorageService.get("LeaderHistorySearch") == null){
                $vm.vmData = {};
            }else{
                $vm.vmData = localStorageService.get("LeaderHistorySearch");

                SearchData();
            }
        },
        profile : Session.Get(),
        boolData : bool,
        compyData : compy,
        gridMethod : {
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
                        SearchData();
                    });

                }, function() {
                    // $log.info('Modal dismissed at: ' + new Date());
                });
            },
            releaseData : function(row){
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
                                title : "是否解單"
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
                            OL_FDATETIME : null,
                            OL_FUSER     : null
                        },
                        condition: {
                            OL_SEQ : selectedItem.OL_SEQ
                        }
                    }).then(function (res) {

                        toaster.pop('success', '訊息', '解單成功。', 3000);
                        SearchData();
                    });

                }, function() {
                    // $log.info('Modal dismissed at: ' + new Date());
                });
            }
        },
        resultOptions : {
            data:  '$vm.resultData',
            columnDefs: [
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
                { name: 'OL_COUNTRY'  ,  displayName: '起運國別' },
                { name: 'OL_REASON'   ,  displayName: '描述', cellTooltip: function (row, col) 
                    {
                        return row.entity.OL_REASON
                    } 
                },
                { name: 'W2_STATUS'   ,  displayName: '狀態', width: 80, cellTemplate: $templateCache.get('accessibilityToForW2'), filter: 
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
                { name: 'W2_PRINCIPAL',  displayName: '編輯者', cellFilter: 'userInfoFilter', filter: 
                    {
                        term: null,
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: userInfo
                    }
                },
                { name: 'Options'     ,  displayName: '功能', enableFiltering: false, width: '12%', cellTemplate: $templateCache.get('accessibilityToMForLeaderSearch') }
            ],
            enableFiltering: true,
            enableSorting: false,
            enableColumnMenus: false,
            // enableVerticalScrollbar: false,
            paginationPageSizes: [10, 25, 50, 100],
            paginationPageSize: 100,
            onRegisterApi: function(gridApi){
                $vm.resultGridApi = gridApi;
            }
        },
        Cancel : function(){
            ClearSearchCondition();
        },
        Search : function(){
            // console.log($vm.vmData);
            $vm.resultData = [];

            if(IsConditionsHaveValue($vm.vmData)){
                SearchData();
            }else{
                toaster.pop('info', '訊息', '請輸入查詢條件', 3000);
            }
        },
        ExportExcel : function(){

            var _exportName = $filter('date')(new Date(), 'yyyyMMdd') + ' ' + $scope.getWord($state.current.data.title) + '結果';

            ToolboxApi.ExportExcelBySql({
                templates : 12,
                filename : _exportName,
                querymain: 'leaderHistorySearch',
                queryname: 'SelectSearch',
                params: $vm._params
            }).then(function (res) {
                // console.log(res);
            });
        }
    });

    function SearchData () {
        $vm._params = {};

        $vm._params = CombineConditions($vm.vmData);
        // 紀錄查詢條件
        localStorageService.set("LeaderHistorySearch", $vm.vmData);
        
        console.log($vm._params);

        RestfulApi.SearchMSSQLData({
            querymain: 'leaderHistorySearch',
            queryname: 'SelectSearch',
            params: $vm._params
        }).then(function (res){
            console.log(res["returnData"]);
            if(res["returnData"].length > 0){
                $vm.resultData = res["returnData"];
            }else{
                toaster.pop('info', '訊息', '查無資料', 3000);
            }
        });
    }

    /**
     * IsConditionsHaveValue 檢查查詢條件是否為空
     * @param {[type]} true 表示有值, false 表示空值
     */
    function IsConditionsHaveValue(pObject){
        var _result = true,
            _isClear = true;

        if(pObject == {}){
            _result = false;
        }else{
            // 檢查所有值是否都是空的
            for(var i in pObject){
                if(pObject[i] != null){
                    if(pObject[i].toString() != ""){
                        _isClear = false;
                        break;
                    }
                }
            }

            // 如果都是空的 回傳false
            if(_isClear){
                _result = false;
            }
        }

        return _result;
    }

    /**
     * CombineConditions 條件組合
     * @param {[type]}
     */
    function CombineConditions(pObject){
        var _conditions = {};

        for(var i in pObject){
            if(pObject[i] != null){
                if(pObject[i].toString() != ""){
                    if(i == "REAL_IMPORTDT_FROM" || i == "IMPORTDT_FROM"){
                        _conditions[i] = pObject[i] + ' 00:00:00';
                    }else if(i == "REAL_IMPORTDT_TOXX" || i == "IMPORTDT_TOXX"){
                        _conditions[i] = pObject[i] + ' 23:59:59';
                    }else{
                        _conditions[i] = pObject[i];
                    }
                }
            }
        }

        return _conditions;
    }

    /**
     * [ClearSearchCondition description] 清除查詢條件
     */
    function ClearSearchCondition(){
        localStorageService.remove("LeaderHistorySearch");
        $vm.vmData = {};
    }

});