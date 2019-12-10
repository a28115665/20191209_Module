"use strict";

angular.module('app.settings').controller('ExcompyBagnoCtrl', function ($scope, $stateParams, $state, AuthApi, Session, toaster, $uibModal, $templateCache, RestfulApi, $filter, bool, uiGridConstants) {
    
    var $vm = this;

	angular.extend(this, {
        Init : function(){
            $scope.ShowTabs = true;
            
            $vm.LoadData();
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
                    LoadBagNo3Need();
                    break;
                case 'hr2':
                    LoadBagNo5NotNeed();
                    break;
            }
        },
        gridMethod : {
            modifyData : function(row){

                var modalInstance = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'modifyBagNoModalContent.html',
                    controller: 'ModifyBagNoModalInstanceCtrl',
                    controllerAs: '$ctrl',
                    resolve: {
                        bool: function(){
                            return bool;
                        },
                        mdData: function(){
                            return row.entity;
                        }
                    }
                });

                modalInstance.result.then(function(selectedItem) {
                    console.log(selectedItem);

                    switch($vm.defaultTab){
                        case 'hr1':
                            RestfulApi.UpdateMSSQLData({
                                updatename: 'Update',
                                table: 25,
                                params: {
                                    SC_DESC : selectedItem.SC_DESC,
                                    SC_STS  : selectedItem.SC_STS,
                                    SC_UP_DATETIME : $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss')
                                },
                                condition: {
                                    SC_TYPE : 'BagNo3Need',
                                    SC_CODE : selectedItem.SC_CODE
                                }
                            }).then(function(res) {
                                console.log(res);

                                if(res["returnData"] == 1){
                                    toaster.pop('success', '訊息', '更新前三碼成功', 3000);
                                    LoadBagNo3Need();
                                }

                                // $state.reload()
                            });
                            break;
                        case 'hr2':
                            RestfulApi.UpdateMSSQLData({
                                updatename: 'Update',
                                table: 25,
                                params: {
                                    SC_DESC : selectedItem.SC_DESC,
                                    SC_STS  : selectedItem.SC_STS,
                                    SC_UP_DATETIME : $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss')
                                },
                                condition: {
                                    SC_TYPE : 'BagNo5NotNeed',
                                    SC_CODE : selectedItem.SC_CODE
                                }
                            }).then(function(res) {
                                console.log(res);

                                if(res["returnData"] == 1){
                                    toaster.pop('success', '訊息', '更新後五碼成功', 3000);
                                    LoadBagNo5NotNeed();
                                }

                                // $state.reload()
                            });
                            break;
                    }
                }, function() {
                    // $log.info('Modal dismissed at: ' + new Date());
                });
            }
        },
        bagNo3NeedOptions : {
            data: '$vm.bagNo3NeedData',
            columnDefs: [
                { name: 'SC_STS'          ,  displayName: '作廢', cellFilter: 'booleanFilter', filter: 
                    {
                        term: null,
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: bool
                    }
                },
                { name: 'SC_CODE'         ,  displayName: '代號' },
                { name: 'SC_DESC'         ,  displayName: '代號描述' },
                { name: 'SC_CR_DATETIME'  ,  displayName: '新增時間', cellFilter: 'datetimeFilter' },
                { name: 'SC_UP_DATETIME'  ,  displayName: '更新時間', cellFilter: 'datetimeFilter' },
                { name: 'Options'         ,  displayName: '操作', enableFiltering: false, cellTemplate: $templateCache.get('accessibilityToM') }
            ],
            enableFiltering: true,
            enableSorting: false,
            enableColumnMenus: false,
            // enableVerticalScrollbar: false,
            paginationPageSizes: [10, 25, 50, 100],
            paginationPageSize: 100,
            onRegisterApi: function(gridApi){
                $vm.bagNo3NeedGridApi = gridApi;
            }
        },
        AddBagNo3Need : function(){
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'addBagNo3NeedModalContent.html',
                controller: 'AddBagNo3NeedModalInstanceCtrl',
                controllerAs: '$ctrl',
                resolve: {
                    bool: function(){
                        return bool;
                    },
                    originBagNo3: function(){
                        var _data = [];

                        for(var i in $vm.bagNo3NeedData){
                            _data.push($vm.bagNo3NeedData[i].SC_CODE);
                        }

                        return _data
                    }
                }
            });

            modalInstance.result.then(function(selectedItem) {
                console.log(selectedItem);

                RestfulApi.InsertMSSQLData({
                    insertname: 'Insert',
                    table: 25,
                    params: {
                        SC_TYPE : 'BagNo3Need',
                        SC_CODE : selectedItem.SC_CODE,
                        SC_DESC : selectedItem.SC_DESC,
                        SC_STS  : selectedItem.SC_STS,
                        SC_CR_DATETIME : $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                    }
                }).then(function(res) {
                    console.log(res);

                    if(res["returnData"] == 1){
                        toaster.pop('success', '訊息', '新增前三碼成功', 3000);
                        LoadBagNo3Need();
                    }

                    // $state.reload()
                });
            }, function() {
                // $log.info('Modal dismissed at: ' + new Date());
            });
        },
        bagNo5NotNeedOptions : {
            data: '$vm.bagNo5NotNeedData',
            columnDefs: [
                { name: 'SC_STS'          ,  displayName: '作廢', cellFilter: 'booleanFilter', filter: 
                    {
                        term: null,
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: bool
                    }
                },
                { name: 'SC_CODE'         ,  displayName: '代號' },
                { name: 'SC_DESC'         ,  displayName: '代號描述' },
                { name: 'SC_CR_DATETIME'  ,  displayName: '新增時間', cellFilter: 'datetimeFilter' },
                { name: 'SC_UP_DATETIME'  ,  displayName: '更新時間', cellFilter: 'datetimeFilter' },
                { name: 'Options'         ,  displayName: '操作', enableFiltering: false, cellTemplate: $templateCache.get('accessibilityToM') }
            ],
            enableFiltering: true,
            enableSorting: false,
            enableColumnMenus: false,
            // enableVerticalScrollbar: false,
            paginationPageSizes: [10, 25, 50, 100],
            paginationPageSize: 100,
            onRegisterApi: function(gridApi){
                $vm.bagNo5NotNeedGridApi = gridApi;
            }
        },
        AddBagNo5NotNeed : function(){
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'addBagNo5NotNeedModalContent.html',
                controller: 'AddBagNo5NotNeedModalInstanceCtrl',
                controllerAs: '$ctrl',
                resolve: {
                    bool: function(){
                        return bool;
                    },
                    originBagNo5: function(){
                        var _data = [];

                        for(var i in $vm.bagNo5NotNeedData){
                            _data.push($vm.bagNo5NotNeedData[i].SC_CODE);
                        }

                        return _data
                    }
                }
            });

            modalInstance.result.then(function(selectedItem) {
                console.log(selectedItem);

                RestfulApi.InsertMSSQLData({
                    insertname: 'Insert',
                    table: 25,
                    params: {
                        SC_TYPE : 'BagNo5NotNeed',
                        SC_CODE : selectedItem.SC_CODE,
                        SC_DESC : selectedItem.SC_DESC,
                        SC_STS  : selectedItem.SC_STS,
                        SC_CR_DATETIME : $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                    }
                }).then(function(res) {
                    console.log(res);

                    if(res["returnData"] == 1){
                        toaster.pop('success', '訊息', '新增後五碼成功', 3000);
                        LoadBagNo5NotNeed();
                    }

                    // $state.reload()
                });
            }, function() {
                // $log.info('Modal dismissed at: ' + new Date());
            });
        }
    });

    function LoadBagNo3Need(){
        RestfulApi.SearchMSSQLData({
            querymain: 'excompyBagno',
            queryname: 'SelectAllSysCode',
            params: {
                SC_TYPE : "BagNo3Need"
            }
        }).then(function (res){
            console.log(res["returnData"]);
            $vm.bagNo3NeedData = res["returnData"];
        });    
    }

    function LoadBagNo5NotNeed(){
        RestfulApi.SearchMSSQLData({
            querymain: 'excompyBagno',
            queryname: 'SelectAllSysCode',
            params: {
                SC_TYPE : "BagNo5NotNeed"
            }
        }).then(function (res){
            console.log(res["returnData"]);
            $vm.bagNo5NotNeedData = res["returnData"];
        });    
    }

})
.controller('AddBagNo3NeedModalInstanceCtrl', function ($uibModalInstance, bool, originBagNo3, $scope, $filter) {
    var $ctrl = this;
    $ctrl.mdData = {};
    $ctrl.mdData['SC_STS'] = false;
    $ctrl.boolData = bool;
    $ctrl.originBagNo3Data = originBagNo3;
    $ctrl.scCodeRegex = '^((?!'+originBagNo3.join("|")+').)*$';

    $scope.$watch('$ctrl.mdData[\'SC_CODE\']', function(val) {
        $ctrl.mdData['SC_CODE'] = $filter('uppercase')(val);
        if(!angular.isUndefined($filter('uppercase')(val))){
            $ctrl.mdData['SC_DESC'] = '袋號前三碼須包含' + $filter('uppercase')(val);
        }
    }, true);

    $ctrl.ok = function() {
        $uibModalInstance.close($ctrl.mdData);
    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
})
.controller('ModifyBagNoModalInstanceCtrl', function ($uibModalInstance, bool, mdData) {
    var $ctrl = this;
    $ctrl.mdData = mdData;
    $ctrl.boolData = bool;

    $ctrl.ok = function() {
        $uibModalInstance.close($ctrl.mdData);
    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
})
.controller('AddBagNo5NotNeedModalInstanceCtrl', function ($uibModalInstance, bool, originBagNo5, $scope, $filter) {
    var $ctrl = this;
    $ctrl.mdData = {};
    $ctrl.mdData['SC_STS'] = false;
    $ctrl.boolData = bool;
    $ctrl.originBagNo5Data = originBagNo5;
    $ctrl.scCodeRegex = '^((?!'+originBagNo5.join("|")+').)*$';

    $scope.$watch('$ctrl.mdData[\'SC_CODE\']', function(val) {
        $ctrl.mdData['SC_CODE'] = $filter('uppercase')(val);
        if(!angular.isUndefined($filter('uppercase')(val))){
            $ctrl.mdData['SC_DESC'] = '袋號前五碼不能包含' + $filter('uppercase')(val);
        }
    }, true);

    $ctrl.ok = function() {
        $uibModalInstance.close($ctrl.mdData);
    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
});