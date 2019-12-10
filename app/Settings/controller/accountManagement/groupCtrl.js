"use strict";

angular.module('app.settings').controller('GroupCtrl', function ($scope, $stateParams, $state, AuthApi, ToolboxApi, Session, toaster, $uibModal, $templateCache, $filter, SysCode, UserGrade, RestfulApi, bool) {
    // console.log($stateParams);

	var $vm = this,
        _task = [];

	angular.extend(this, {
        Init : function(){
            // 不正常登入此頁面
            if($stateParams.data == null) ReturnToBillboardEditorPage();
            // 撈UserGroup資料
            else {
                LoadUserGroup();
            }
        },
        profile : Session.Get(),
        boolData : bool,
        vmData : $stateParams.data,
        groupMenu : [
            {"content": "<span><i class=\"fa fa-lg fa-folder-open\"></i> 根目錄</span>", "expanded": true, "children": []}
        ],
        checkedData : [],
        AddGroupPeople : function(){
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'addGroupPeople.html',
                controller: 'AddGroupPeopleModalInstanceCtrl',
                controllerAs: '$ctrl',
                size: 'lg',
                resolve: {
                    vmData: function () {
                        return $vm.vmData;
                    },
                    depart: function() {
                        return SysCode.get('Depart');
                    },
                    userGrade: function(){
                        return UserGrade.get();
                    }
                }
            });

            modalInstance.result.then(function(selectedItem) {
                console.log(selectedItem);

                $vm.vmData.UserGroup = angular.copy(selectedItem);

                // 初始化
                _task = [];

                // Delete此Group相關人員
                _task.push({
                    crudType: 'Delete',
                    table: 4,
                    params: {
                        UG_GROUP : $vm.vmData.SG_GCODE
                    }
                });

                // Insert此Group相關人員
                for(var i in selectedItem){
                    _task.push({
                        crudType: 'Insert',
                        table: 4,
                        params: {
                            UG_ID : selectedItem[i].U_ID,
                            UG_GROUP : $vm.vmData.SG_GCODE
                        }
                    });
                }

            }, function() {
                // $log.info('Modal dismissed at: ' + new Date());
            });
        },
        Return : function(){
            ReturnToBillboardEditorPage();
        },
        Update : function(){

            // 找出GroupMenu已被Checked
            _.forEach($vm.groupMenu, function(item){
                FindChecked(item, 1);
            })

            var _tasks = [];

            _tasks.push({
                crudType: 'Update',
                table: 6,
                params: {
                    SG_TITLE       : $vm.vmData.SG_TITLE,
                    SG_DESC        : $vm.vmData.SG_DESC,
                    SG_STS         : $vm.vmData.SG_STS,
                    SG_UP_DATETIME : $filter('date')(new Date, 'yyyy-MM-dd HH:mm:ss')
                },
                condition: {
                    SG_GCODE : $vm.vmData.SG_GCODE
                }
            });

            // 把群組人員塞入
            for(var i in _task){
                _tasks.push(_task[i]);
            }

            _tasks.push({
                crudType: 'Delete',
                table: 5,
                params: {
                    UR_GROUP : $vm.vmData.SG_GCODE
                }
            });

            // 把GroupMenu Checked塞入
            for(var i in $vm.checkedData){
                _tasks.push({
                    crudType: 'Insert',
                    table: 5,
                    params: {
                        UR_GROUP : $vm.vmData.SG_GCODE,
                        UR_SYSID : $vm.checkedData[i].sysId,
                        UR_PROG  : $vm.checkedData[i].name.toLowerCase()
                    }
                });
            }

            RestfulApi.CRUDMSSQLDataByTask(_tasks).then(function (res){
                console.log(res);

                ReturnToBillboardEditorPage();

            }, function (err){
                
            });
        }
	})

    // 產生GroupMenu
    function DoGroupMenu(){
        ToolboxApi.ComposeMenu().then(function(res){ 
            console.log(res);
            _.forEach(res.items, function(item) {
                CreateItem(item, $vm.groupMenu[0], 1);
            })    
        })    
    }

    // 遞迴的方式產生GroupMenu的Item
    function CreateItem(item, parent, level){
        var rowData = null;

        // 當為子目錄時
        if(item.items){
            rowData = {
                "content": "<span><i class=\"fa fa-lg fa-plus-circle\"></i> "+$scope.getWord(item.title)+"</span>", 
                "expanded": true, 
                "children": []
            };

            _.forEach(item.items, function(child) {
                CreateItem(child, rowData, level+1);
            })
        }
        // 當為子項目時
        else{
            // 是否在DB資料庫有這筆資料
            if(($filter('filter')($vm.groupMenuData, {"UR_PROG" : item.title})).length > 0){
                rowData = {
                    "content": "<span> <label class=\"checkbox inline-block\"><input type=\"checkbox\" checked=\"checked\" name=\"checkbox-inline\"><i></i>"+$scope.getWord(item.title)+"</label> </span>",
                    "isChecked": true,
                    "name": item.title,
                    "sysId": item.sysId
                };
            }else{
                rowData = {
                    "content": "<span> <label class=\"checkbox inline-block\"><input type=\"checkbox\" name=\"checkbox-inline\"><i></i>"+$scope.getWord(item.title)+"</label> </span>",
                    "isChecked": false,
                    "name": item.title,
                    "sysId": item.sysId
                };
            }
        } 

        parent.children.push(rowData);
    }

    // 找出已經被Checked的item
    function FindChecked(item, level){
        if(item.children){
            _.forEach(item.children, function(child) {
                FindChecked(child, level+1);
            })
        }else{
            if(item.isChecked){
                $vm.checkedData.push(item);
            }
        }
    }

    function LoadUserGroup(){

        RestfulApi.CRUDMSSQLDataByTask([
            {
                crudType: 'Select',
                querymain: 'group',
                queryname: 'SelectUserGroup',
                params: {
                    UG_GROUP : $vm.vmData.SG_GCODE
                }
            },
            {
                crudType: 'Select',
                querymain: 'group',
                queryname: 'SelectUserGRight',
                params: {
                    UR_GROUP : $vm.vmData.SG_GCODE
                }
            }
        ]).then(function (res){
            console.log(res);

            $vm.vmData.UserGroup = res["returnData"][0];
            $vm.groupMenuData = res["returnData"][1];

            DoGroupMenu();

        }, function (err){
            
        });
    };

	function ReturnToBillboardEditorPage(){
        $state.transitionTo("app.settings.accountmanagement");
    };

})
.controller('AddGroupPeopleModalInstanceCtrl', function ($uibModalInstance, RestfulApi, vmData, $filter, $timeout, uiGridConstants, depart, userGrade) {
    var $ctrl = this;
    $ctrl.vmData = vmData;
    $ctrl.gradeFilter = userGrade;
    $ctrl.depart = depart;

    $ctrl.mdData = [];

    $ctrl.MdInit = function(){
        RestfulApi.SearchMSSQLData({
            querymain: 'group',
            queryname: 'SelectAllUserInfoNotWithAdmin'
        }).then(function (res){
            console.log(res["returnData"]);
            // console.log(res);
            // 顯示所有帳號
            $ctrl.mdData = res["returnData"];
            // 把已被選取的帳號打勾
            $timeout(function() {
                if($ctrl.mdDataGridApi.selection.selectRow){
                    // console.log($ctrl.vmData["UserGroup"]);
                    for(var i in $ctrl.vmData["UserGroup"]){
                        $ctrl.mdDataGridApi.selection.selectRow($filter('filter')($ctrl.mdData, {U_ID: $ctrl.vmData["UserGroup"][i].U_ID}, true)[0]);
                    }
                }
            });
        });
    };

    $ctrl.mdDataOptions = {
        data:  '$ctrl.mdData',
        columnDefs: [
            { name: 'U_ID'     ,  displayName: '帳號' },
            { name: 'U_NAME'   ,  displayName: '名稱' },
            { name: 'U_GRADE'  ,  displayName: '職稱', cellFilter: 'gradeFilter', filter: 
                {
                    term: null,
                    type: uiGridConstants.filter.SELECT,
                    selectOptions: $ctrl.gradeFilter
                }
            }
        ],
        enableSorting: false,
        enableColumnMenus: false,
        enableFiltering: true,
        enableRowSelection: true,
        enableSelectAll: true,
        selectionRowHeaderWidth: 35,
        paginationPageSizes: [10, 25, 50, 100],
        paginationPageSize: 100,
        onRegisterApi: function(gridApi){ 
            $ctrl.mdDataGridApi = gridApi;
        } 
    };

    $ctrl.ok = function() {
        $uibModalInstance.close($ctrl.mdDataGridApi.selection.getSelectedRows());
    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
});