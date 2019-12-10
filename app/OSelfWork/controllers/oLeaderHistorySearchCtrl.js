"use strict";

angular.module('app.oselfwork').controller('OLeaderHistorySearchCtrl', function ($scope, $stateParams, $state, AuthApi, Session, toaster, $uibModal, $templateCache, RestfulApi, $filter, ocompy, userInfo, bool, uiGridConstants, localStorageService, ToolboxApi) {
    
    var $vm = this;

	angular.extend(this, {
        Init : function(){
            // console.log(localStorageService.get("OLeaderHistorySearch"));
            
            // 帶入LocalStorage資料
            if(localStorageService.get("OLeaderHistorySearch") == null){
                $vm.vmData = {};
            }else{
                $vm.vmData = localStorageService.get("OLeaderHistorySearch");

                SearchData();
            }
        },
        profile : Session.Get(),
        boolData : bool,
        ocompyData : ocompy,
        gridMethod : {
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
                        table: 40,
                        params: {
                            O_OL_FDATETIME : null,
                            O_OL_FUSER     : null
                        },
                        condition: {
                            O_OL_SEQ : selectedItem.O_OL_SEQ
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
                { name: 'O_OL_REASON'   ,  displayName: '描述', width: 100, cellTooltip: function (row, col) 
                    {
                        return row.entity.O_OL_REASON
                    } 
                },
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
                { name: 'OW2_PRINCIPAL',  displayName: '編輯者', width: 103, pinnedRight:true, cellFilter: 'userInfoFilter', filter: 
                    {
                        term: null,
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: userInfo
                    }
                },
                { name: 'Options'     ,  displayName: '功能', enableFiltering: false, width: 125, pinnedRight:true, cellTemplate: $templateCache.get('accessibilityToMForOLeaderSearch') }
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
                templates : 16,
                filename : _exportName,
                querymain: 'oleaderHistorySearch',
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
        localStorageService.set("OLeaderHistorySearch", $vm.vmData);
        
        console.log($vm._params);

        RestfulApi.SearchMSSQLData({
            querymain: 'oleaderHistorySearch',
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
        localStorageService.remove("OLeaderHistorySearch");
        $vm.vmData = {};
    }

});