"use strict";

angular.module('app.selfwork').controller('EmployeeHistorySearchCtrl', function ($scope, $stateParams, $state, AuthApi, Session, toaster, $uibModal, $templateCache, RestfulApi, $filter, compy, userInfo, bool, uiGridConstants, localStorageService, ToolboxApi, OrderStatus) {
    
    var $vm = this;

	angular.extend(this, {
        Init : function(){
            // console.log(localStorageService.get("EmployeeHistorySearch"));
            
            // 帶入LocalStorage資料
            if(localStorageService.get("EmployeeHistorySearch") == null){
                $vm.vmData = {};
            }else{
                $vm.vmData = localStorageService.get("EmployeeHistorySearch");

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
            // 貨物查看
            viewOrder : function(row){
                OrderStatus.Get(row)
            }
        },
        gridMethodForJob001 : {
            // 修改
            // 已編輯且完成就可以讓所有人修改
            fixData : function(row){
                console.log(row);
                if(row.entity.W2_FDATETIME != null){
                    $state.transitionTo("app.selfwork.employeehistorysearch.resultjob001", {
                        data: row.entity
                    });
                }
            }
        },
        gridMethodForJob002 : {
            // 檢視
            viewData : function(row){
                console.log(row);
                $state.transitionTo("app.selfwork.employeehistorysearch.resultjob002", {
                    data: row.entity
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
                { name: 'OL_MASTER'   ,  displayName: '主號', width: 110, cellTemplate: $templateCache.get('accessibilityToMasterForViewOrder') },
                { name: 'OL_COUNT'    ,  displayName: '報機單(袋數)', width: 80, enableCellEdit: false },
                { name: 'OL_PULL_COUNT',  displayName: '拉貨(袋數)', width: 80, enableCellEdit: false },
                { name: 'OL_COUNT'    ,  displayName: '報機單(袋數)', enableCellEdit: false },
                { name: 'OL_COUNTRY'  ,  displayName: '起運國別' },
                { name: 'OL_REASON'   ,  displayName: '描述', cellTooltip: function (row, col) 
                    {
                        return row.entity.OL_REASON
                    } 
                },
                { name: 'W2_STATUS'              ,  displayName: '狀態', width: 80, cellTemplate: $templateCache.get('accessibilityToForW2'), filter: 
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
                { name: 'W2_PRINCIPAL',  displayName: '負責人', cellFilter: 'userInfoFilter', filter: 
                    {
                        term: null,
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: userInfo
                    }
                },
                { name: 'ITEM_LIST'          ,  displayName: '報機單', enableFiltering: false, width: '8%', cellTemplate: $templateCache.get('accessibilityToOperaForJob001') },
                { name: 'FLIGHT_ITEM_LIST'   ,  displayName: '銷艙單', enableFiltering: false, width: '8%', cellTemplate: $templateCache.get('accessibilityToOperaForJob002') },
                // { name: 'Options'       , displayName: '下載', width: '5%', enableCellEdit: false, enableFiltering: false, cellTemplate: $templateCache.get('accessibilityToOnceDownload') }
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
                templates : 2,
                filename : _exportName,
                querymain: 'employeeHistorySearch',
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
        localStorageService.set("EmployeeHistorySearch", $vm.vmData);
        
        // console.log($vm._params);

        RestfulApi.SearchMSSQLData({
            querymain: 'employeeHistorySearch',
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
        localStorageService.remove("EmployeeHistorySearch");
        $vm.vmData = {};
    }

});