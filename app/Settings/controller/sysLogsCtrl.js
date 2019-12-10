"use strict";

angular.module('app.settings').controller('SysLogsCtrl', function ($scope, $stateParams, $state, AuthApi, Session, toaster, $uibModal, $templateCache, RestfulApi, uiGridConstants, $filter, userInfo) {
    // console.log($stateParams, $state);

    var $vm = this;

    angular.extend(this, {
        Init : function(){
            LoadSysLogs();
        },
        profile : Session.Get(),
        sysLogsOptions : {
            data: '$vm.sysLogsData',
            columnDefs: [
                { name: 'Index'        , displayName: '序列', width: 62, enableFiltering: false },
                { name: 'SDL_DATETIME' , displayName: '時間', width: 150, cellFilter: 'datetimeFilter' },
                { name: 'SDL_LEVEL'    , displayName: '等級', width: 70, cellTemplate: $templateCache.get('accessibilityToSysLevel') },
                { name: 'SDL_ACTION'   , displayName: '執行動作', width: 92, cellTooltip: function (row, col) 
                    {
                        return row.entity.SDL_ACTION
                    }, 
                    filter: {
                        term: null,
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: [
                            { label:'查詢', value: '查詢'},
                            { label:'新增', value: '新增'},
                            { label:'更新', value: '更新'},
                            { label:'刪除', value: '刪除'},
                            { label:'插入', value: '插入'},
                            { label:'複製', value: '複製'},
                        ]
                    }
                },
                { name: 'SDL_SQL'      , displayName: 'SQL', cellTooltip: function (row, col) 
                    {
                        return row.entity.SDL_SQL
                    } 
                },
                { name: 'SDL_USER'     , displayName: '人員', width: 100, cellFilter: 'userInfoFilter', filter: 
                    {
                        term: null,
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: userInfo
                    }
                },
                { name: 'SDL_IP'       , displayName: 'IP', width: 120 }
            ],
            enableFiltering: true,
            enableSorting: true,
            enableColumnMenus: false,
            // enableVerticalScrollbar: false,
            paginationPageSizes: [50, 100, 150, 200, 250, 300],
            paginationPageSize: 100,
            onRegisterApi: function(gridApi){
                $vm.sysLogsGridApi = gridApi;
            }
        },
        // 匯出Excel
        ExportExcel: function(){

            var _exportName = $filter('date')($vm.vmData.OL_IMPORTDT, 'yyyyMMdd', 'GMT') + ' ' + 
                              $filter('compyFilter')($vm.vmData.OL_CO_CODE) + ' ' + 
                              $vm.vmData.OL_FLIGHTNO;
                // _totalBag = 0,
                // _totalWeight = 0;

            // 計算件數和重量
            // for(var i in $vm.job002Data){
            //     _totalBag += $vm.job002Data[i].FLL_CTN;
            //     _totalWeight += $vm.job002Data[i].FLL_WEIGHT;
            // }

            ToolboxApi.ExportExcelByMultiSql([
                {
                    templates      : 5,
                    filename       : _exportName,
                    OL_MASTER      : $vm.vmData.OL_MASTER,
                    OL_IMPORTDT    : $filter('date')($vm.vmData.OL_IMPORTDT, 'yyyy-MM-dd', 'GMT'),
                    OL_FLIGHTNO    : $vm.vmData.OL_FLIGHTNO,
                    OL_COUNTRY     : $vm.vmData.OL_COUNTRY, 
                    OL_TEL         : $vm.vmData.OL_TEL, 
                    OL_FAX         : $vm.vmData.OL_FAX, 
                    OL_TOTALBAG    : $vm.job002GridApi.grid.columns[4].getAggregationValue(), 
                    OL_TOTALWEIGHT : $vm.job002GridApi.grid.columns[5].getAggregationValue().toFixed(2)
                },
                {
                    crudType: 'Select',
                    querymain: 'job002',
                    queryname: 'SelectFlightItemList',
                    params: {               
                        FLL_SEQ: $vm.vmData.OL_SEQ
                    }
                },
                {
                    crudType: 'Select',
                    querymain: 'job002',
                    queryname: 'SelectRemark',
                    params: {               
                        FLL_SEQ: $vm.vmData.OL_SEQ
                    }
                }
            ]).then(function (res) {
                // console.log(res);
            });

        }
    });

    function LoadSysLogs(){
        RestfulApi.SearchMSSQLData({
            querymain: 'sysLogs',
            queryname: 'SelectSysLogs'
        }).then(function (res){
            console.log(res["returnData"]);
            for(var i=0;i<res["returnData"].length;i++){
                res["returnData"][i]["Index"] = i+1;
            }
            $vm.sysLogsData = res["returnData"];
        }); 
    };

})