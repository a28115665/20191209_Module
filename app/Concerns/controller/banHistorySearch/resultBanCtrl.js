"use strict";

angular.module('app.concerns').controller('ResultBanCtrl', function ($scope, $stateParams, $state, AuthApi, Session, toaster, $uibModal, $templateCache, $timeout, uiGridConstants, RestfulApi, $filter, compy, localStorageService, ToolboxApi) {
    
    var $vm = this,
        columnDefs = [
            { name: 'IL_COUNT'      , displayName: '歷史歷程', width: 75, enableFiltering: false, cellTemplate: $templateCache.get('accessibilityToHistoryCount') },
            { name: 'BAN_TYPE'      , displayName: '名單類型', width: 100, filter: 
                {
                    term: "通報",
                    type: uiGridConstants.filter.SELECT,
                    selectOptions: [
                        {label:"通報", value:"通報"},
                        {label:"自訂", value:"自訂"}
                    ]
                }
            },
            { name: 'OL_IMPORTDT'            ,  displayName: '進口日期', width: 80, cellFilter: 'dateFilter' },
            { name: 'OL_CO_CODE'             ,  displayName: '行家', width: 80, cellFilter: 'compyFilter', filter: 
                {
                    term: null,
                    type: uiGridConstants.filter.SELECT,
                    selectOptions: compy
                }
            },
            { name: 'OL_FLIGHTNO'            ,  displayName: '航班', width: 80 },
            { name: 'OL_MASTER'              ,  displayName: '主號', width: 120 },
            { name: 'OL_COUNTRY'             ,  displayName: '起運國別', width: 80 },
            { name: 'IL_G1'         , displayName: '報關種類', width: 115 },
            { name: 'IL_MERGENO'    , displayName: '併票號', width: 129 },
            { name: 'IL_BAGNO'      , displayName: '袋號', width: 129 },
            { name: 'IL_SMALLNO'    , displayName: '小號', width: 115 },
            { name: 'IL_NATURE'     , displayName: '品名', width: 115 },
            { name: 'IL_NATURE_NEW' , displayName: '新品名', width: 115 },
            { name: 'IL_CTN'        , displayName: '件數', width: 115 },
            { name: 'IL_PLACE'      , displayName: '產地', width: 115 },
            { name: 'IL_NEWPLACE'   , displayName: '新產地', width: 115 },
            { name: 'IL_WEIGHT'     , displayName: '重量', width: 115 },
            { name: 'IL_WEIGHT_NEW' , displayName: '新重量', width: 115 },
            { name: 'IL_PCS'        , displayName: '數量', width: 115 },
            { name: 'IL_NEWPCS'     , displayName: '新數量', width: 115 },
            { name: 'IL_UNIT'       , displayName: '單位', width: 115 },
            { name: 'IL_NEWUNIT'    , displayName: '新單位', width: 115 },
            { name: 'IL_GETNO'      , displayName: '收件者統編', width: 115 },
            { name: 'IL_SENDNAME'   , displayName: '寄件人或公司', width: 115 },
            { name: 'IL_NEWSENDNAME', displayName: '新寄件人或公司', width: 115 },
            { name: 'IL_GETNAME'    , displayName: '收件人公司', width: 115 },
            { name: 'IL_GETADDRESS' , displayName: '收件地址', width: 300 },
            { name: 'IL_GETTEL'     , displayName: '收件電話', width: 115 },
            { name: 'IL_UNIVALENT'  , displayName: '單價', width: 115 },
            { name: 'IL_UNIVALENT_NEW', displayName: '新單價', width: 115 },
            { name: 'IL_FINALCOST'  , displayName: '完稅價格', width: 115 },
            { name: 'IL_TAX'        , displayName: '稅則', width: 115 },
            { name: 'IL_TRCOM'      , displayName: '派送公司', width: 115 },
            { name: 'IL_REMARK'     , displayName: '備註', width: 115 }
        ];

	angular.extend(this, {
        Init : function(){

            if($stateParams.data == null){
                ReturnToBanHistorySearchPage();
            }else{
                $scope.ShowTabs = true;
                
                $vm.bigBreadcrumbsItems = $state.current.name.split(".");
                $vm.bigBreadcrumbsItems.shift();

                $vm.vmData = $stateParams.data;
                $vm.params = CombineConditions(localStorageService.get("BanHistorySearch"));

                $vm.LoadData();
                console.log($vm.params);
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
                    LoadCaseA();
                    break;
                case 'hr2':
                    LoadCaseB();
                    break;
                case 'hr3':
                    LoadCaseC();
                    break;
                case 'hr4':
                    LoadCaseD();
                    break;
            }
        },
        gridMethod : {
            // 顯示歷史黑名單
            showHistoryCount : function(row){
                console.log(row);
                var modalInstance = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'showHistoryCountForResultModalContent.html',
                    controller: 'ShowHistoryCountForResultModalInstanceCtrl',
                    controllerAs: '$ctrl',
                    size: 'lg',
                    // appendTo: parentElem,
                    resolve: {
                        item: function() {
                            return row.entity;
                        },
                        type: function(){
                            return $vm.defaultTab;   
                        },
                        compy: function(){
                            return compy;
                        }
                    }
                });

                modalInstance.result.then(function(selectedItem) {
                    // $ctrl.selected = selectedItem;
                    console.log(selectedItem);

                }, function() {
                    // $log.info('Modal dismissed at: ' + new Date());
                });
            }
        },
        caseAOptions : {
            data:  '$vm.caseAData',
            columnDefs: columnDefs,
            enableFiltering: true,
            enableSorting: true,
            enableColumnMenus: false,
            // enableVerticalScrollbar: false,
            paginationPageSizes: [10, 25, 50, 100],
            paginationPageSize: 100,
            onRegisterApi: function(gridApi){
                $vm.caseAGridApi = gridApi;
            }
        },
        caseBOptions : {
            data:  '$vm.caseBData',
            columnDefs: columnDefs,
            enableFiltering: true,
            enableSorting: true,
            enableColumnMenus: false,
            // enableVerticalScrollbar: false,
            paginationPageSizes: [10, 25, 50, 100],
            paginationPageSize: 100,
            onRegisterApi: function(gridApi){
                $vm.caseBGridApi = gridApi;
            }
        },
        caseCOptions : {
            data:  '$vm.caseCData',
            columnDefs: columnDefs,
            enableFiltering: true,
            enableSorting: true,
            enableColumnMenus: false,
            // enableVerticalScrollbar: false,
            paginationPageSizes: [10, 25, 50, 100],
            paginationPageSize: 100,
            onRegisterApi: function(gridApi){
                $vm.caseCGridApi = gridApi;
            }
        },
        caseDOptions : {
            data:  '$vm.caseDData',
            columnDefs: columnDefs,
            enableFiltering: true,
            enableSorting: true,
            enableColumnMenus: false,
            // enableVerticalScrollbar: false,
            paginationPageSizes: [10, 25, 50, 100],
            paginationPageSize: 100,
            onRegisterApi: function(gridApi){
                $vm.caseDGridApi = gridApi;
            }
        },
        Return : function(){
            ReturnToBanHistorySearchPage();
        },
        ExportExcel : function(){

            var _exportName = null,
                _queryname = null;

            switch($vm.defaultTab){
                case 'hr1':
                    _exportName = $filter('date')(new Date(), 'yyyyMMdd') + ' ' + $scope.getWord($state.current.data.title) + ' A類型';
                    _queryname = "SelectCaseA";
                    break;
                case 'hr2':
                    _exportName = $filter('date')(new Date(), 'yyyyMMdd') + ' ' + $scope.getWord($state.current.data.title) + ' B類型';
                    _queryname = "SelectCaseB";
                    break;
                case 'hr3':
                    _exportName = $filter('date')(new Date(), 'yyyyMMdd') + ' ' + $scope.getWord($state.current.data.title) + ' C類型';
                    _queryname = "SelectCaseC";
                    break;
                case 'hr4':
                    _exportName = $filter('date')(new Date(), 'yyyyMMdd') + ' ' + $scope.getWord($state.current.data.title) + ' D類型';
                    _queryname = "SelectCaseD";
                    break;
            }

            if(_exportName != null){
                ToolboxApi.ExportExcelBySql({
                    templates : 3,
                    filename : _exportName,
                    querymain: 'banHistorySearch',
                    queryname: _queryname,
                    params: $vm.params
                }).then(function (res) {
                    // console.log(res);
                });
            }
        }
    });

    function LoadCaseA(){
        RestfulApi.SearchMSSQLData({
            querymain: 'banHistorySearch',
            queryname: 'SelectCaseA',
            params: $vm.params
        }).then(function (res){
            console.log(res["returnData"]);
            $vm.caseAData = res["returnData"];
        }); 
    }

    function LoadCaseB(){
        RestfulApi.SearchMSSQLData({
            querymain: 'banHistorySearch',
            queryname: 'SelectCaseB',
            params: $vm.params
        }).then(function (res){
            console.log(res["returnData"]);
            $vm.caseBData = res["returnData"];
        }); 
    }

    function LoadCaseC(){
        RestfulApi.SearchMSSQLData({
            querymain: 'banHistorySearch',
            queryname: 'SelectCaseC',
            params: $vm.params
        }).then(function (res){
            console.log(res["returnData"]);
            $vm.caseCData = res["returnData"];
        }); 
    }

    function LoadCaseD(){
        RestfulApi.SearchMSSQLData({
            querymain: 'banHistorySearch',
            queryname: 'SelectCaseD',
            params: $vm.params
        }).then(function (res){
            console.log(res["returnData"]);
            $vm.caseDData = res["returnData"];
        }); 
    }

    /**
     * CombineConditions 條件組合
     * @param {[type]}
     */
    function CombineConditions(pObject){
        var _conditions = {};

        for(var i in pObject){
            if(pObject[i] != ""){
                _conditions[i] = pObject[i];
            }
        }

        return _conditions;
    }

    function ReturnToBanHistorySearchPage(){
        $state.transitionTo($state.current.parent);
    }
})
.controller('ShowHistoryCountForResultModalInstanceCtrl', function ($uibModalInstance, item, type, RestfulApi, uiGridConstants, compy) {
    var $ctrl = this;

    $ctrl.Init = function(){
        LoadHistoryCount(type);
    };

    $ctrl.mdDataOption = {
        data:  '$ctrl.mdData',
        columnDefs: [
            { name: 'OL_IMPORTDT'            ,  displayName: '進口日期', width: 80, cellFilter: 'dateFilter' },
            { name: 'OL_CO_CODE'             ,  displayName: '行家', width: 80, cellFilter: 'compyFilter', filter: 
                {
                    term: null,
                    type: uiGridConstants.filter.SELECT,
                    selectOptions: compy
                }
            },
            { name: 'OL_FLIGHTNO'            ,  displayName: '航班', width: 80 },
            { name: 'OL_MASTER'              ,  displayName: '主號', width: 120 },
            { name: 'OL_COUNTRY'             ,  displayName: '起運國別', width: 80 },
            { name: 'IL_G1'         , displayName: '報關種類', width: 115 },
            { name: 'IL_MERGENO'    , displayName: '併票號', width: 129 },
            { name: 'IL_BAGNO'      , displayName: '袋號', width: 129 },
            { name: 'IL_SMALLNO'    , displayName: '小號', width: 115 },
            { name: 'IL_NATURE'     , displayName: '品名', width: 115 },
            { name: 'IL_NATURE_NEW' , displayName: '新品名', width: 115 },
            { name: 'IL_CTN'        , displayName: '件數', width: 115 },
            { name: 'IL_PLACE'      , displayName: '產地', width: 115 },
            { name: 'IL_NEWPLACE'   , displayName: '新產地', width: 115 },
            { name: 'IL_WEIGHT'     , displayName: '重量', width: 115 },
            { name: 'IL_WEIGHT_NEW' , displayName: '新重量', width: 115 },
            { name: 'IL_PCS'        , displayName: '數量', width: 115 },
            { name: 'IL_NEWPCS'     , displayName: '新數量', width: 115 },
            { name: 'IL_UNIT'       , displayName: '單位', width: 115 },
            { name: 'IL_NEWUNIT'    , displayName: '新單位', width: 115 },
            { name: 'IL_GETNO'      , displayName: '收件者統編', width: 115 },
            { name: 'IL_SENDNAME'   , displayName: '寄件人或公司', width: 115 },
            { name: 'IL_NEWSENDNAME', displayName: '新寄件人或公司', width: 115 },
            { name: 'IL_GETNAME'    , displayName: '收件人公司', width: 115 },
            { name: 'IL_GETADDRESS' , displayName: '收件地址', width: 300 },
            { name: 'IL_GETTEL'     , displayName: '收件電話', width: 115 },
            { name: 'IL_UNIVALENT'  , displayName: '單價', width: 115 },
            { name: 'IL_UNIVALENT_NEW', displayName: '新單價', width: 115 },
            { name: 'IL_FINALCOST'  , displayName: '完稅價格', width: 115 },
            { name: 'IL_TAX'        , displayName: '稅則', width: 115 },
            { name: 'IL_TRCOM'      , displayName: '派送公司', width: 115 },
            { name: 'IL_REMARK'     , displayName: '備註', width: 115 }
        ],
        enableFiltering: true,
        enableSorting: true,
        enableColumnMenus: false,
        // enableVerticalScrollbar: false,
        paginationPageSizes: [10, 25, 50, 100],
        paginationPageSize: 100,
        onRegisterApi: function(gridApi){
            $ctrl.mdDataGridApi = gridApi;
        }
    }

    function LoadHistoryCount(pType){
        var _params = {};

        switch(pType){
            case 'hr1':
                _params = {
                    IL_GETNAME : item.IL_GETNAME,
                    IL_GETADDRESS : item.IL_GETADDRESS,
                    IL_SEQ : item.IL_SEQ,
                    IL_NEWBAGNO : item.IL_NEWBAGNO,
                    IL_NEWSMALLNO : item.IL_NEWSMALLNO,
                    IL_ORDERINDEX : item.IL_ORDERINDEX
                };
                break;
            case 'hr2':
                _params = {
                    IL_GETADDRESS : item.IL_GETADDRESS,
                    IL_GETTEL : item.IL_GETTEL,
                    IL_SEQ : item.IL_SEQ,
                    IL_NEWBAGNO : item.IL_NEWBAGNO,
                    IL_NEWSMALLNO : item.IL_NEWSMALLNO,
                    IL_ORDERINDEX : item.IL_ORDERINDEX
                };
                break;
            case 'hr3':
                _params = {
                    IL_GETNAME : item.IL_GETNAME,
                    IL_GETTEL : item.IL_GETTEL,
                    IL_SEQ : item.IL_SEQ,
                    IL_NEWBAGNO : item.IL_NEWBAGNO,
                    IL_NEWSMALLNO : item.IL_NEWSMALLNO,
                    IL_ORDERINDEX : item.IL_ORDERINDEX
                };
                break;
            case 'hr4':
                _params = {
                    IL_GETNAME : item.IL_GETNAME,
                    IL_GETADDRESS : item.IL_GETADDRESS,
                    IL_GETTEL : item.IL_GETTEL,
                    IL_SEQ : item.IL_SEQ,
                    IL_NEWBAGNO : item.IL_NEWBAGNO,
                    IL_NEWSMALLNO : item.IL_NEWSMALLNO,
                    IL_ORDERINDEX : item.IL_ORDERINDEX
                };
                break;
        }

        RestfulApi.SearchMSSQLData({
            querymain: 'banHistorySearch',
            queryname: 'SelectItemList',
            params: _params
        }).then(function (res){
            console.log(res["returnData"]);
            $ctrl.mdData = res["returnData"];
        }); 
    }

    $ctrl.ok = function() {
        $uibModalInstance.close($ctrl.mdData);
    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
});