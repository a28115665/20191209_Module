"use strict";

angular.module('app.oselfwork').controller('OEmployeeHistorySearchCtrl', function ($scope, $stateParams, $state, AuthApi, Session, toaster, $uibModal, $templateCache, RestfulApi, $filter, ocompy, userInfo, bool, uiGridConstants, localStorageService, ToolboxApi, OrderStatus) {
    
    var $vm = this;

	angular.extend(this, {
        Init : function(){
            // console.log(localStorageService.get("OEmployeeHistorySearch"));
            
            // 帶入LocalStorage資料
            if(localStorageService.get("OEmployeeHistorySearch") == null){
                $vm.vmData = {};
            }else{
                $vm.vmData = localStorageService.get("OEmployeeHistorySearch");

                SearchData();
            }
        },
        profile : Session.Get(),
        boolData : bool,
        compyData : ocompy,
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
                if(row.entity.OW2_FDATETIME != null){
                    $state.transitionTo("app.oselfwork.oemployeehistorysearch.resultojob001", {
                        data: row.entity
                    });
                }
            }
        },
        resultOptions : {
            data:  '$vm.resultData',
            columnDefs: [
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
                { name: 'OW2_PRINCIPAL',  displayName: '負責人', width: 91, pinnedRight:true, cellFilter: 'userInfoFilter', filter: 
                    {
                        term: null,
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: userInfo
                    }
                },
                { name: 'ITEM_LIST'          ,  displayName: '報機單', enableFiltering: false, width: 93, pinnedRight:true, cellTemplate: $templateCache.get('accessibilityToOperaForJob001') },
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
                templates : 17,
                filename : _exportName,
                querymain: 'oemployeeHistorySearch',
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
        localStorageService.set("OEmployeeHistorySearch", $vm.vmData);
        
        // console.log($vm._params);

        RestfulApi.SearchMSSQLData({
            querymain: 'oemployeeHistorySearch',
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
                    if(i == "O_IMPORTDT_FROM"){
                        _conditions[i] = pObject[i] + ' 00:00:00';
                    }else if(i == "O_IMPORTDT_TOXX"){
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
        localStorageService.remove("OEmployeeHistorySearch");
        $vm.vmData = {};
    }

});