"use strict";

angular.module('app.settings').controller('BillboardEditorCtrl', function ($scope, $stateParams, $state, AuthApi, Session, toaster, $uibModal, $templateCache, RestfulApi, bool, ioType, uiGridConstants) {

    var $vm = this;

    angular.extend(this, {
        Init : function(){
            LoadBillboardEditor();
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
                    LoadBillboardEditor();
                    break;
                case 'hr2':
                    LoadBillboardHistory();
                    break;
            }
        },
        gridMethod : {
            //編輯
            modifyData : function(row){
                // console.log(row);
                $state.transitionTo("app.settings.billboardeditor.news", {
                    data: row.entity
                });
            }
        },
        billboardEditorOptions : {
            data: '$vm.billboardEditorData',
            columnDefs: [
                { name: 'BB_STICK_TOP'   , displayName: '置頂', cellFilter: 'booleanFilter', filter: 
                    {
                        term: null,
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: bool
                    }
                },
                { name: 'BB_POST_FROM'   , displayName: '開始日期', cellFilter: 'dateFilter' },
                { name: 'BB_POST_TOXX'   , displayName: '結束日期', cellFilter: 'dateFilter' },
                { name: 'BB_TITLE'       , displayName: '標題' },
                { name: 'BB_CONTENT'     , visible: false },
                { name: 'BB_IO_TYPE'     , displayName: '公佈類型', cellFilter: 'ioTypeFilter', filter: 
                    {
                        term: null,
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: ioType
                    }
                },
                { name: 'BB_CR_USER'     , visible: false},
                { name: 'BB_CR_DATETIME' , displayName: '建立時間', cellFilter: 'datetimeFilter' },
                { name: 'Options'        , displayName: '操作', width: '7%', enableFiltering: false, cellTemplate: $templateCache.get('accessibilityToM') }
            ],
            enableFiltering: true,
            enableSorting: false,
            enableColumnMenus: false,
            enableRowSelection: true,
            enableSelectAll: true,
            paginationPageSizes: [10, 25, 50, 100],
            paginationPageSize: 100,
            onRegisterApi: function(gridApi){
                $vm.billboardEditorGridApi = gridApi;
            }
        },
        AddNews : function(){
            ChangeToAddNewsPage();
        },
        DeleteNews : function(){
            console.log($vm.billboardEditorGridApi.selection.getSelectedRows());

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
                        return $vm.billboardEditorGridApi.selection.getSelectedRows();
                    },
                    show: function(){
                        return {
                            title : "是否刪除"
                        };
                    }
                }
            });

            modalInstance.result.then(function(selectedItem) {
                console.log(selectedItem);

                var _tasks = [];

                for(var i in selectedItem){
                    _tasks.push({
                        crudType: 'Update',
                        table: 1,
                        params: {
                            BB_SOFT_DELETE : true
                        },
                        condition: {
                            BB_CR_USER : selectedItem[i].BB_CR_USER,
                            BB_CR_DATETIME : selectedItem[i].BB_CR_DATETIME
                        }
                    });
                }

                RestfulApi.CRUDMSSQLDataByTask(_tasks).then(function (res) {
                    toaster.pop('success', '訊息', '公佈區刪除成功', 3000);
                    LoadBillboardEditor();
                }, function (err) {

                });
            }, function() {
                // $log.info('Modal dismissed at: ' + new Date());
            });
        },
        billboardHistoryOptions : {
            data: '$vm.billboardHistoryData',
            columnDefs: [
                { name: 'BB_STICK_TOP'   , displayName: '置頂', cellFilter: 'booleanFilter', filter: 
                    {
                        term: null,
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: bool
                    }
                },
                { name: 'BB_POST_FROM'   , displayName: '開始日期', cellFilter: 'dateFilter' },
                { name: 'BB_POST_TOXX'   , displayName: '結束日期', cellFilter: 'dateFilter' },
                { name: 'BB_TITLE'       , displayName: '標題' },
                { name: 'BB_IO_TYPE'     , displayName: '公佈類型', cellFilter: 'ioTypeFilter', filter: 
                    {
                        term: null,
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: ioType
                    }
                },
                { name: 'BB_CR_USER'     , visible: false},
                { name: 'BB_CR_DATETIME' , displayName: '建立時間', cellFilter: 'datetimeFilter' },
                { name: 'Options'        , displayName: '操作', width: '7%', enableFiltering: false, cellTemplate: $templateCache.get('accessibilityToM') }
            ],
            enableFiltering: true,
            enableSorting: false,
            enableColumnMenus: false,
            enableRowSelection: true,
            enableSelectAll: true,
            paginationPageSizes: [10, 25, 50, 100],
            paginationPageSize: 100,
            onRegisterApi: function(gridApi){
                $vm.billboardHistoryGridApi = gridApi;
            }
        },
        DeleteHistoryNews : function(){
            console.log($vm.billboardHistoryGridApi.selection.getSelectedRows());

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
                        return $vm.billboardHistoryGridApi.selection.getSelectedRows();
                    },
                    show: function(){
                        return {
                            title : "是否刪除"
                        };
                    }
                }
            });

            modalInstance.result.then(function(selectedItem) {
                console.log(selectedItem);

                var _tasks = [];

                for(var i in selectedItem){
                    _tasks.push({
                        crudType: 'Update',
                        table: 1,
                        params: {
                            BB_SOFT_DELETE : true
                        },
                        condition: {
                            BB_CR_USER : selectedItem[i].BB_CR_USER,
                            BB_CR_DATETIME : selectedItem[i].BB_CR_DATETIME
                        }
                    });
                }

                RestfulApi.CRUDMSSQLDataByTask(_tasks).then(function (res) {
                    toaster.pop('success', '訊息', '歷史區刪除成功', 3000);
                    LoadBillboardHistory();
                }, function (err) {

                });
            }, function() {
                // $log.info('Modal dismissed at: ' + new Date());
            });
            
        }
    });

    function LoadBillboardEditor(){
        RestfulApi.SearchMSSQLData({
            querymain: 'billboardEditor',
            queryname: 'SelectBBWithOK'
        }).then(function (res){
            console.log(res["returnData"]);
            $vm.billboardEditorData = res["returnData"];
        }).finally(function() {
            HandleWindowResize($vm.billboardEditorGridApi);
        });    
    };

    function LoadBillboardHistory(){
        RestfulApi.SearchMSSQLData({
            querymain: 'billboardEditor',
            queryname: 'SelectBBWithHistory'
        }).then(function (res){
            console.log(res["returnData"]);
            $vm.billboardHistoryData = res["returnData"];
        }).finally(function() {
            HandleWindowResize($vm.billboardHistoryGridApi);
        });    
    };

    function ChangeToAddNewsPage(){
        $state.transitionTo("app.settings.billboardeditor.news");
    };
})