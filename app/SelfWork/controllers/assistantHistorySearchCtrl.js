"use strict";

angular.module('app.selfwork').controller('AssistantHistorySearchCtrl', function ($scope, $stateParams, $state, AuthApi, Session, toaster, $uibModal, $templateCache, RestfulApi, $filter, bool, compy, uiGridConstants, localStorageService, ToolboxApi, OrderStatus) {
    
    var $vm = this;

	angular.extend(this, {
        Init : function(){
            // console.log(localStorageService.get("AssistantHistorySearch"));
            
            // 帶入LocalStorage資料
            if(localStorageService.get("AssistantHistorySearch") == null){
                $vm.vmData = {};
            }else{
                $vm.vmData = localStorageService.get("AssistantHistorySearch");

                SearchData();
            }
        },
        profile : Session.Get(),
        boolData : bool,
        compyData : compy,
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
                        LoadFlightItem();
                    });

                }, function() {
                    // $log.info('Modal dismissed at: ' + new Date());
                });
            },
            // 寄信
            sendMail : function(row){
                console.log(row);
            },
            // 貨物查看
            viewOrder : function(row){
                OrderStatus.Get(row);
            }
        },
        gridMethodForJob002 : {
            // 檢視
            viewData : function(row){
                $state.transitionTo("app.selfwork.assistanthistorysearch.resultjob002", {
                    data: row.entity
                });
            }
        },
        resultOptions : {
            data:  '$vm.resultData',
            columnDefs: [
                { name: 'OL_IMPORTDT'            ,  displayName: '進口日期', width: 80, cellFilter: 'dateFilter' },
                { name: 'OL_CO_CODE'             ,  displayName: '行家', width: 80, cellFilter: 'compyFilter', filter: 
                    {
                        term: null,
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: compy
                    }
                },
                { name: 'OL_FLIGHTNO'            ,  displayName: '航班' },
                // { name: 'FA_SCHEDL_ARRIVALTIME'  ,  displayName: '預計抵達時間', cellFilter: 'datetimeFilter' },
                // { name: 'FA_ACTL_ARRIVALTIME'    ,  displayName: '真實抵達時間', cellFilter: 'datetimeFilter' },
                // { name: 'FA_ARRIVAL_REMK'        ,  displayName: '狀態', width: 80, cellTemplate: $templateCache.get('accessibilityToArrivalRemark') },
                { name: 'OL_MASTER'              ,  displayName: '主號', width: 110, cellTemplate: $templateCache.get('accessibilityToMasterForViewOrder') },
                { name: 'OL_COUNTRY'             ,  displayName: '起運國別' },
                { name: 'OL_REASON'              ,  displayName: '描述', cellTooltip: function (row, col) 
                    {
                        return row.entity.OL_REASON
                    } 
                },
                { name: 'FLIGHT_ITEM_LIST'       ,  displayName: '銷艙單', enableFiltering: false, width: '8%', cellTemplate: $templateCache.get('accessibilityToOperaForJob002') },
                { name: 'Options'                ,  displayName: '操作', width: '12%', enableCellEdit: false, enableFiltering: false, cellTemplate: $templateCache.get('accessibilityToMSForAssistantJobs') }
                // 保留寫法
                // { name: 'Options'                ,  displayName: '操作', width: '9%', enableCellEdit: false, enableFiltering: false, cellTemplate: $templateCache.get('accessibilityToMSForAssistantJobsSearch') }
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
                templates : 1,
                filename : _exportName,
                querymain: 'assistantHistorySearch',
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
        localStorageService.set("AssistantHistorySearch", $vm.vmData);
        
        // console.log($vm._params);

        RestfulApi.SearchMSSQLData({
            querymain: 'assistantHistorySearch',
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
        localStorageService.remove("AssistantHistorySearch");
        $vm.vmData = {};
    }

});