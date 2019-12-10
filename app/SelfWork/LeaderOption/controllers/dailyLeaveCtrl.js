"use strict";

angular.module('app.selfwork.leaderoption').controller('DailyLeaveCtrl', function ($scope, $stateParams, $state, AuthApi, Session, toaster, $uibModal, $templateCache, $filter, uiGridConstants, RestfulApi, userInfoByGrade, bool, $q) {
    
    var $vm = this;

	angular.extend(this, {
        Init : function(){
            // 檢查是否有部門人員
            if(userInfoByGrade[0].length == 0){
                toaster.pop('info', '訊息', '請先設定帳號所屬的部門', 3000);
                $vm.vmData = [];
            }else{
                $vm.selectAssignDept = userInfoByGrade[0][0].value;
                $vm.isLeave = bool[0].value;
                LoadDailyLeave();
            }
        },
        profile : Session.Get(),
        assignGradeData : userInfoByGrade[0],
        boolData : bool,
        dailyLeaveOptions : {
            data:  '$vm.vmData',
            columnDefs: [
                { name: 'U_NAME'     ,  displayName: '人員姓名' },
                { name: 'DL_IS_LEAVE',  displayName: '是否請假', cellFilter: 'booleanFilter', filter: 
                    {
                        term: null,
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: bool
                    }
                }
            ],
            enableFiltering: true,
            enableSorting: false,
            enableColumnMenus: false,
            // enableVerticalScrollbar: false,
            paginationPageSizes: [10, 25, 50, 100],
            paginationPageSize: 100,
            enableCellEdit: false,
            onRegisterApi: function(gridApi){
                $vm.dailyLeaveGridApi = gridApi;

                gridApi.rowEdit.on.saveRow($scope, $vm.Update);
            }
        },
        ChangeLeave : function(){
            if($vm.dailyLeaveGridApi.selection.getSelectedRows().length > 0){
                var _getSelectedRows = $vm.dailyLeaveGridApi.selection.getSelectedRows(),
                    _getDirtyData = [];

                for(var i in _getSelectedRows){
                    // 表示假不一樣需要被更新
                    if(_getSelectedRows[i].DL_IS_LEAVE != $vm.isLeave){
                        _getDirtyData.push(_getSelectedRows[i]);
                        _getSelectedRows[i].DL_IS_LEAVE = $vm.isLeave;
                    }
                }

                if(_getDirtyData.length > 0){
                    $vm.dailyLeaveGridApi.rowEdit.setRowsDirty(_getDirtyData);
                }else{
                    toaster.pop('info', '訊息', '沒有資料需要被更新', 3000);
                }
                
                $vm.dailyLeaveGridApi.selection.clearSelectedRows();
            }
        },
        // Save : function(){

        //     var _tasks = [],
        //         _d = new Date();

        //     // Delete此Leader的每日請假
        //     _tasks.push({
        //         crudType: 'Delete',
        //         table: 16,
        //         params: {
        //             DL_DEPT : $vm.selectAssignDept,
        //             DL_CR_USER : $vm.profile.U_ID
        //         }
        //     });

        //     // Insert此Leader的每日請假
        //     for(var i in $vm.vmData){
        //         console.log($vm.vmData[i]);
        //         if($vm.vmData[i].DL_IS_LEAVE){
        //             _tasks.push({
        //                 crudType: 'Insert',
        //                 table: 16,
        //                 params: {
        //                     DL_ID : $vm.vmData[i].U_ID,
        //                     DL_DEPT : $vm.selectAssignDept,
        //                     DL_CR_USER : $vm.profile.U_ID,
        //                     DL_CR_DATETIME : $filter('date')(_d, 'yyyy-MM-dd HH:mm:ss')
        //                 }
        //             });
        //         }
        //     }

        //     RestfulApi.CRUDMSSQLDataByTask(_tasks).then(function (res){
        //         console.log(res["returnData"]);
        //         toaster.pop('success', '訊息', '請假設定儲存成功', 3000);
        //     });    
        // },
        Update : function(entity){
            // console.log(entity);
            // create a fake promise - normally you'd use the promise returned by $http or $resource
            var promise = $q.defer();
            $vm.dailyLeaveGridApi.rowEdit.setSavePromise( entity, promise.promise );
        
            var _tasks = [],
                _d = new Date();

            // Delete此班所有人的假
            _tasks.push({
                crudType: 'Delete',
                table: 16,
                params: {
                    DL_ID : entity.U_ID,
                    DL_DEPT : $vm.selectAssignDept
                }
            });

            // Insert此有被設定為請假的人
            if(entity.DL_IS_LEAVE){
                _tasks.push({
                    crudType: 'Insert',
                    table: 16,
                    params: {
                        DL_ID : entity.U_ID,
                        DL_DEPT : entity.UD_DEPT,
                        DL_CR_USER : $vm.profile.U_ID,
                        DL_CR_DATETIME : $filter('date')(_d, 'yyyy-MM-dd HH:mm:ss')
                    }
                });
            }

            RestfulApi.CRUDMSSQLDataByTask(_tasks).then(function (res){
                promise.resolve();
            }, function (err) {
                toaster.pop('error', '錯誤', '更新失敗', 3000);
                promise.reject();
            }).finally(function(){
                if($vm.dailyLeaveGridApi.rowEdit.getDirtyRows().length == 0){
                    LoadDailyLeave();
                }
            }); 
        },
        LoadDailyLeave : function(){
            LoadDailyLeave();
        }
    });

    function LoadDailyLeave(){
        RestfulApi.SearchMSSQLData({
            querymain: 'dailyLeave',
            queryname: 'SelectUserLeavebyGrade',
            params: {
                U_GRADE : $vm.profile.U_GRADE,
                DEPTS : $vm.profile.DEPTS,
                UD_DEPT : $vm.selectAssignDept
            }
        }).then(function (res){
            console.log(res["returnData"]);
            $vm.vmData = res["returnData"];
        });    
    }

})