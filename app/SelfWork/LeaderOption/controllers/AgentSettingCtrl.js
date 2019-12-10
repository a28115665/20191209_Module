"use strict";

angular.module('app.selfwork.leaderoption').controller('AgentSettingCtrl', function ($scope, $stateParams, $state, AuthApi, Session, toaster, $uibModal, $templateCache, $filter, uiGridConstants, RestfulApi, userInfoByCompyDistribution, compy, $q, uiGridGroupingConstants, coWeights) {
    
    var $vm = this;

	angular.extend(this, {
        Init : function(){
            if(userInfoByCompyDistribution[0].length == 0){
                toaster.pop('info', '訊息', '請先設定行家分配', 3000);
                $vm.vmData = [];
            }else{
                $vm.selectAssignDept = userInfoByCompyDistribution[0][0].value;
                LoadCompyAgent();
            }
        },
        profile : Session.Get(),
        assignGradeData : userInfoByCompyDistribution[0],
        assignAgentData : userInfoByCompyDistribution[1],
        agentSettingOptions : {
            data:  '$vm.vmData',
            columnDefs: [
                { name: 'COD_PRINCIPAL',  displayName: '負責人', cellFilter: 'userInfoFilter', grouping: { groupPriority: 0 }, filter: 
                    {
                        term: null,
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: userInfoByCompyDistribution[0].length == 0 ? [] : userInfoByCompyDistribution[1][userInfoByCompyDistribution[0][0].value]
                    }
                },
                { name: 'COD_CODE'      ,  displayName: '行家', cellFilter: 'compyFilter', filter: 
                    {
                        term: null,
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: compy
                    }, 
                    treeAggregationType: uiGridGroupingConstants.aggregation.COUNT, 
                    customTreeAggregationFinalizerFn: function( aggregation ) {
                        aggregation.rendered = aggregation.value;
                    }
                },
                { name: 'CO_WEIGHTS',  displayName: '權重', cellFilter: 'coWeightsFilter', filter: 
                    {
                        term: null,
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: coWeights
                    }
                },
                { name: 'AGENT_COUNT'   ,  displayName: '代理人數' , treeAggregationType: uiGridGroupingConstants.aggregation.SUM, 
                    customTreeAggregationFinalizerFn: function( aggregation ) {
                        aggregation.rendered = aggregation.value;
                    }
                }
                // { name: 'AS_AGENT'     ,  displayName: '職務代理人', cellFilter: 'userInfoFilter', filter: 
                //     {
                //         term: null,
                //         type: uiGridConstants.filter.SELECT,
                //         selectOptions: userInfoByCompyDistribution[0].length == 0 ? [] : userInfoByCompyDistribution[1][userInfoByCompyDistribution[0][0].value]
                //     }
                // }
            ],
            enableFiltering: true,
            enableSorting: false,
            enableColumnMenus: false,
            groupingShowCounts: false,
            // enableVerticalScrollbar: false,
            paginationPageSizes: [10, 25, 50, 100],
            paginationPageSize: 100,
            expandableRowTemplate: 'expandableRowTemplate.html',
            expandableRowHeight: 150,
            enableCellEdit: false,
            enableGroupHeaderSelection: true,
            expandableRowScope: {
                $vm : {
                    gridMethod : {
                        deleteData : function(row){
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
                                            title : "是否刪除"
                                        };
                                    }
                                }
                            });

                            modalInstance.result.then(function(selectedItem) {
                                // $ctrl.selected = selectedItem;
                                console.log(selectedItem);

                                RestfulApi.DeleteMSSQLData({
                                    deletename: 'Delete',
                                    table: 17,
                                    params: {
                                        AS_CODE : row.entity.AS_CODE,
                                        AS_DEPT : row.entity.AS_DEPT,
                                        AS_AGENT : row.entity.AS_AGENT,
                                        AS_PRINCIPAL : row.entity.AS_PRINCIPAL
                                    }
                                }).then(function (res) {
                                    for(var i in $vm.vmData){
                                        if($vm.vmData[i].COD_PRINCIPAL == row.entity.AS_PRINCIPAL && 
                                            $vm.vmData[i].COD_CODE == row.entity.AS_CODE){
                                            $vm.vmData[i].AGENT_COUNT -= 1;

                                            var foundItem = $filter('filter')($vm.vmData[i].subGridOptions.data, {
                                                AS_CODE : row.entity.AS_CODE,
                                                AS_DEPT : row.entity.AS_DEPT,
                                                AS_AGENT : row.entity.AS_AGENT,
                                                AS_PRINCIPAL : row.entity.AS_PRINCIPAL
                                            })[0];

                                            var itemIndex = $vm.vmData[i].subGridOptions.data.indexOf(foundItem);

                                            $vm.vmData[i].subGridOptions.data.splice(itemIndex, 1);

                                            $vm.agentSettingGridApi.grid.refresh();
                                            break;
                                        }
                                    }

                                });

                            }, function() {
                                // $log.info('Modal dismissed at: ' + new Date());
                            });
                        }
                    }
                }
            },
            onRegisterApi: function(gridApi){
                $vm.agentSettingGridApi = gridApi;

                gridApi.rowEdit.on.saveRow($scope, $vm.Update);

                gridApi.selection.on.rowSelectionChanged( $scope, function ( rowChanged ) {
                    if ( typeof(rowChanged.treeLevel) !== 'undefined' && rowChanged.treeLevel > -1 ) {
                        // this is a group header
                        var children = $vm.agentSettingGridApi.treeBase.getRowChildren( rowChanged );
                        children.forEach( function ( child ) {
                            if ( rowChanged.isSelected ) {
                                $vm.agentSettingGridApi.selection.selectRow( child.entity );
                            } else {
                                $vm.agentSettingGridApi.selection.unSelectRow( child.entity );
                            }
                        });
                    }
                });
            }
        },
        AssignAgent : function(){
            if($vm.agentSettingGridApi.selection.getSelectedRows().length > 0){
                var _getSelectedRows = $vm.agentSettingGridApi.selection.getSelectedRows(),
                    _getDirtyData = [];

                for(var i in _getSelectedRows){
                    // 負責人不等於代理人 和 沒有相同代理人才塞入
                    if((_getSelectedRows[i].COD_PRINCIPAL != $vm.selectAssignAgent) && 
                        $filter('filter')(_getSelectedRows[i].subGridOptions.data, { AS_AGENT : $vm.selectAssignAgent }).length == 0 && 
                        $filter('filter')(_getSelectedRows[i].subGridOptions.data, { AS_PRINCIPAL : $vm.selectAssignAgent }).length == 0){
                        
                        _getSelectedRows[i].subGridOptions.data.push({
                            AS_CODE : _getSelectedRows[i].COD_CODE,
                            AS_DEPT : $vm.selectAssignDept,
                            AS_AGENT : $vm.selectAssignAgent,
                            AS_PRINCIPAL : _getSelectedRows[i].COD_PRINCIPAL
                        });

                        // _getSelectedRows[i].AGENT_COUNT = _getSelectedRows[i].subGridOptions.data.length;
                        _getDirtyData.push(_getSelectedRows[i]);

                        // 表示需要更新
                        // _getDirty = true;
                    }
                }

                if(_getDirtyData.length > 0){
                    $vm.agentSettingGridApi.rowEdit.setRowsDirty(_getDirtyData);
                }else{
                    toaster.pop('info', '訊息', '負責人或代理人重複', 3000);
                }
                
                $vm.agentSettingGridApi.selection.clearSelectedRows();
                // 清除group的Select
                $vm.agentSettingGridApi.grid.treeBase.tree.forEach(function(entity){
                    entity.row.isSelected = false;
                });
            }
        },
        CancelAgent : function(){
            if($vm.agentSettingGridApi.selection.getSelectedRows().length > 0){
                var _getSelectedRows = $vm.agentSettingGridApi.selection.getSelectedRows(),
                    _getDirtyData = [];
                for(var i in _getSelectedRows){
                    if(_getSelectedRows[i].subGridOptions.data.length > 0){
                        _getDirtyData.push(_getSelectedRows[i]);
                    }

                    // 把代理人清空
                    _getSelectedRows[i].subGridOptions.data = [];

                    // _getSelectedRows[i].AGENT_COUNT = _getSelectedRows[i].subGridOptions.data.length;
                }
                
                // $vm.agentSettingGridApi.grid.refresh();
                if(_getDirtyData.length > 0){
                    $vm.agentSettingGridApi.rowEdit.setRowsDirty(_getDirtyData);
                }
                $vm.agentSettingGridApi.selection.clearSelectedRows();
            }
        },
        // Save : function(){

        //     var _tasks = [],
        //         _d = new Date();

        //     // Delete此Leader管理的行家代理人
        //     _tasks.push({
        //         crudType: 'Delete',
        //         table: 17,
        //         params: {
        //             AS_DEPT : $vm.selectAssignDept,
        //             // AS_CR_USER : $vm.profile.U_ID
        //         }
        //     });

        //     // Insert此Leader管理的行家代理人
        //     for(var i in $vm.vmData){
        //         if($vm.vmData[i].AS_AGENT != null){
        //             _tasks.push({
        //                 crudType: 'Insert',
        //                 table: 17,
        //                 params: {
        //                     AS_CODE : $vm.vmData[i].COD_CODE,
        //                     AS_DEPT : $vm.selectAssignDept,
        //                     AS_AGENT : $vm.vmData[i].AS_AGENT,
        //                     AS_CR_USER : $vm.profile.U_ID,
        //                     AS_CR_DATETIME : $filter('date')(_d, 'yyyy-MM-dd HH:mm:ss')
        //                 }
        //             });
        //         }
        //     }

        //     RestfulApi.CRUDMSSQLDataByTask(_tasks).then(function (res){
        //         console.log(res["returnData"]);
        //         toaster.pop('success', '訊息', '代理人設定儲存成功', 3000);
        //     });    
        // },
        Update : function(entity){
            // console.log(entity);

            // create a fake promise - normally you'd use the promise returned by $http or $resource
            var promise = $q.defer();
            $vm.agentSettingGridApi.rowEdit.setSavePromise( entity, promise.promise );
        
            var _tasks = [],
                _d = new Date();

            // Delete此負責人的代理人
            _tasks.push({
                crudType: 'Delete',
                table: 17,
                params: {
                    AS_CODE : entity.COD_CODE,
                    AS_DEPT : entity.COD_DEPT,
                    AS_PRINCIPAL :  entity.COD_PRINCIPAL
                }
            });

            // Insert此負責人的代理人
            for(var i in entity.subGridOptions.data){
                _tasks.push({
                    crudType: 'Insert',
                    table: 17,
                    params: {
                        AS_CODE : entity.subGridOptions.data[i].AS_CODE,
                        AS_DEPT : entity.subGridOptions.data[i].AS_DEPT,
                        AS_AGENT : entity.subGridOptions.data[i].AS_AGENT,
                        AS_PRINCIPAL : entity.subGridOptions.data[i].AS_PRINCIPAL,
                        AS_CR_USER : $vm.profile.U_ID,
                        AS_CR_DATETIME : $filter('date')(_d, 'yyyy-MM-dd HH:mm:ss')
                    }
                });
            }

            RestfulApi.CRUDMSSQLDataByTask(_tasks).then(function (res){
                promise.resolve();
            }, function (err) {
                toaster.pop('error', '錯誤', '更新失敗', 3000);
                promise.reject();
            }).finally(function(){
                if($vm.agentSettingGridApi.rowEdit.getDirtyRows().length == 0){
                    LoadCompyAgent();
                }
            });    
        },
        LoadCompyAgent : function(){
            LoadCompyAgent();
        }
    });

    function LoadCompyAgent(){

        RestfulApi.CRUDMSSQLDataByTask([
            {  
                crudType: 'Select',
                querymain: 'agentSetting',
                queryname: 'SelectCompyDistribution',
                params: {
                    COD_DEPT : $vm.selectAssignDept
                }
            },
            {
                crudType: 'Select',
                querymain: 'agentSetting',
                queryname: 'SelectAgentSetting',
                params: {
                    COD_DEPT : $vm.selectAssignDept
                }
            }
        ]).then(function (res){
            console.log(res["returnData"]);

            for(var i in res["returnData"][0]){

                var _data =[];

                for(var j in res["returnData"][1]){
                    if(res["returnData"][0][i].COD_PRINCIPAL == res["returnData"][1][j].AS_PRINCIPAL &&
                        res["returnData"][0][i].COD_CODE == res["returnData"][1][j].AS_CODE){
                        _data.push(res["returnData"][1][j]);
                    }
                }

                res["returnData"][0][i].subGridOptions = {
                    data: _data,
                    columnDefs: [ 
                        {field: "AS_AGENT", name: "代理人", cellFilter: 'userInfoFilter', filter: 
                            {
                                term: null,
                                type: uiGridConstants.filter.SELECT,
                                selectOptions: userInfoByCompyDistribution[0].length == 0 ? [] : userInfoByCompyDistribution[1][userInfoByCompyDistribution[0][0].value]
                            }
                        },
                        { name: 'Options'     , displayName: '操作', width: '5%', enableFiltering: false, cellTemplate: $templateCache.get('accessibilityToD') }
                    ],
                    enableFiltering: true,
                    enableSorting: true,
                    enableColumnMenus: false
                };
                res["returnData"][0][i]["AGENT_COUNT"] = _data.length;
            }

            $vm.vmData = res["returnData"][0];

        }).finally(function() {
            console.log($vm.agentSettingOptions);
            // 更新filter selectOptions的值
            $vm.agentSettingOptions.columnDefs[0].filter.selectOptions = userInfoByCompyDistribution[1][$vm.selectAssignDept];
            for(var i in $vm.vmData){
                $vm.vmData[i].subGridOptions.columnDefs[0].filter.selectOptions = userInfoByCompyDistribution[1][$vm.selectAssignDept];
            }
        });

        // RestfulApi.SearchMSSQLData({
        //     querymain: 'agentSetting',
        //     queryname: 'SelectCompyAgent',
        //     params: {
        //         COD_DEPT : $vm.selectAssignDept
        //     }
        // }).then(function (res){
        //     console.log(res["returnData"]);
        //     $vm.vmData = res["returnData"];
        // }).finally(function() {
        //     // 更新filter selectOptions的值
        //     $vm.agentSettingGridApi.grid.columns[2].filter.selectOptions = userInfoByCompyDistribution[1][$vm.selectAssignDept];
        //     $vm.agentSettingGridApi.grid.columns[3].filter.selectOptions = userInfoByCompyDistribution[1][$vm.selectAssignDept];
        // });    
    }

})