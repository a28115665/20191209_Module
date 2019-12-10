"use strict";

angular.module('app.selfwork').controller('Job003Ctrl', function ($scope, $stateParams, $state, AuthApi, Session, toaster, $uibModal, $templateCache, RestfulApi, uiGridConstants, $filter, $q, ToolboxApi) {
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
                //         OL_SEQ : 'AdminTest20170418195141'
                //     };
                // }
                
                LoadFlightItemList();
            }
        },
        profile : Session.Get(),
        defaultChoice : 'Left',
        job003Options : {
            data: '$vm.job003Data',
            columnDefs: [
                { name: 'Index'         , displayName: '序列', width: 50, enableCellEdit: false, enableFiltering: false},
                { name: 'DIL_DRIVER'    , displayName: '司機' },
                { name: 'DIL_BAGNO'     , displayName: '袋號' },
                { name: 'DIL_ORDERNO'   , displayName: '提單號' },
                { name: 'DIL_BARCODE'   , displayName: '條碼號' },
                { name: 'DIL_CTN'       , displayName: '件數' },
                { name: 'DIL_WEIGHT'    , displayName: '重量' },
                { name: 'DIL_GETNAME'   , displayName: '收件人公司' },
                { name: 'DIL_GETADDRESS', displayName: '收件地址' },
                { name: 'DIL_GETTEL'    , displayName: '收件人電話' },
                { name: 'DIL_INCOME'    , displayName: '代收款' },
                { name: 'DIL_REMARK'    , displayName: '備註' }
            ],
            enableFiltering: true,
            enableSorting: true,
            enableColumnMenus: false,
            // enableVerticalScrollbar: false,
		    enableRowSelection: true,
    		enableSelectAll: true,
            paginationPageSizes: [50, 100, 150, 200, 250, 300],
            paginationPageSize: 100,
            onRegisterApi: function(gridApi){
                $vm.job003GridApi = gridApi;

                // gridApi.rowEdit.on.saveRow($scope, $vm.Update);
            }
        },
        ExportExcel: function(){
            var _exportName = $filter('date')($vm.vmData.OL_IMPORTDT, 'yyyyMMdd', 'GMT') + ' ' + 
                              $filter('compyFilter')($vm.vmData.OL_CO_CODE) + ' ' + 
                              $vm.vmData.OL_FLIGHTNO;

            ToolboxApi.ExportExcelBySql({
                templates : 4,
                filename : _exportName,
                querymain: 'job003',
                queryname: 'SelectDeliveryItemList',
                params: {
                    OL_MASTER : $vm.vmData.OL_MASTER,
                    OL_IMPORTDT : $filter('date')($vm.vmData.OL_IMPORTDT, 'yyyy-MM-dd', 'GMT'),
                    OL_FLIGHTNO : $vm.vmData.OL_FLIGHTNO,
                    OL_COUNTRY : $vm.vmData.OL_COUNTRY,                
                    DIL_SEQ: $vm.vmData.OL_SEQ
                }
            }).then(function (res) {
                // console.log(res);
            });
        },
        Return : function(){
            ReturnToEmployeejobsPage();
        },
        Update : function(entity){
            // create a fake promise - normally you'd use the promise returned by $http or $resource
            var promise = $q.defer();
            $vm.job003GridApi.rowEdit.setSavePromise( entity, promise.promise );
         
            RestfulApi.UpdateMSSQLData({
                updatename: 'Update',
                table: 11,
                params: {
                    DIL_DRIVER : entity.DIL_DRIVER,
                    DIL_BAGNO : entity.DIL_BAGNO,
                    DIL_ORDERNO : entity.DIL_ORDERNO,
                    DIL_BARCODE : entity.DIL_BARCODE,
                    DIL_CTN : entity.DIL_CTN,
                    DIL_WEIGHT : entity.DIL_WEIGHT,
                    DIL_GETNAME : entity.DIL_GETNAME,
                    DIL_GETADDRESS : entity.DIL_GETADDRESS,
                    DIL_GETTEL : entity.DIL_GETTEL,
                    DIL_INCOME : entity.DIL_INCOME,
                    DIL_REMARK : entity.DIL_REMARK
                },
                condition: {
                    DIL_SEQ           : entity.DIL_SEQ,
                    DIL_IL_NEWBAGNO   : entity.DIL_IL_NEWBAGNO,
                    DIL_IL_NEWSMALLNO : entity.DIL_IL_NEWSMALLNO
                }
            }).then(function (res) {
                promise.resolve();
            }, function (err) {
                toaster.pop('error', '錯誤', '更新失敗', 3000);
                promise.reject();
            });
        }
    });

    function LoadFlightItemList(){
        RestfulApi.SearchMSSQLData({
            querymain: 'job003',
            queryname: 'SelectDeliveryItemList',
            params: {
                DIL_SEQ: $vm.vmData.OL_SEQ
            }
        }).then(function (res){
            console.log(res["returnData"]);
            for(var i=0;i<res["returnData"].length;i++){
                res["returnData"][i]["Index"] = i+1;
            }
            $vm.job003Data = res["returnData"];
        }).finally(function() {
            HandleWindowResize($vm.job003GridApi);
        }); 
    };

    function ReturnToEmployeejobsPage(){
        $state.transitionTo($state.current.parent);
    };

});