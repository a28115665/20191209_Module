"use strict";

angular.module('app.oselfwork').controller('OAssistantJobsCtrl', function ($scope, $stateParams, $state, AuthApi, Session, toaster, $uibModal, $templateCache, RestfulApi, $filter, uiGridConstants, ocompy, bool, opType, userInfo, OrderStatus, ToolboxApi, localStorageService) {
    
    var $vm = this;

	angular.extend(this, {
        Init : function(){
            $scope.ShowTabs = true;
            
            // 帶入LocalStorage資料
            if(localStorageService.get("OAssistantJobs") == null){
                $vm.defaultTab = 'hr5';
            }else{
                $vm.defaultTab = localStorageService.get("OAssistantJobs");
            }

            $vm.LoadData();
        },
        profile : Session.Get(),
        TabSwitch : function(pTabID){
            return pTabID == $vm.defaultTab ? 'active' : '';
        },
        LoadData : function(){
            // console.log($vm.defaultTab);
            // 紀錄tab
            localStorageService.set("OAssistantJobs", $vm.defaultTab);

            switch($vm.defaultTab){
                case 'hr4':
                    LoadMasterToBeFilled();
                    break;
                case 'hr5':
                    LoadPullGoods();
                    break;
            }
        },
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
            // 各單的修改
            modifyData : function(row){
                console.log(row);
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
                        LoadMasterToBeFilled();
                    });

                }, function() {
                    // $log.info('Modal dismissed at: ' + new Date());
                });
            },
            // 寄信
            // sendMail : function(row){
            //     console.log(row);

            //     ToolboxApi.SendMail({
            //         // ID : $vm.profile.U_ID,
            //         // PW : $vm.profile.U_PW,
            //         // NATURE : row.entity.IL_NATURE
            //     }).then(function (res) {
            //         console.log(res["returnData"]);

            //     });
            // },
        },
        gridMethodForJob001 : {
            // 檢視(報機單)
            viewData : function(row){
                console.log(row);

                // 表示為拉貨
                if(!angular.isUndefined(row.entity.O_PG_SEQ)){
                    row.entity["O_OL_SEQ"] = row.entity.O_PG_SEQ;
                }

                $state.transitionTo("app.oselfwork.oassistantjobs.ojob001", {
                    data: row.entity
                });
            }
        },
        masterToBeFilledOptions : {
            data:  '$vm.masterToBeFilledData',
            columnDefs: [
                { name: 'Index'                  ,  displayName: '序列', width: 66, enableFiltering: false },
                { name: 'O_OL_IMPORTDT'          ,  displayName: '報機日期', width: 91, cellFilter: 'dateFilter', cellTooltip: cellTooltip },
                { name: 'O_CO_NAME'              ,  displayName: '行家', width: 66, cellTooltip: cellTooltip },
                { name: 'O_OL_MASTER'            ,  displayName: '主號', width: 133, cellTooltip: cellTooltip },
                { name: 'O_OL_PASSCODE'          ,  displayName: '通關號碼', width: 91, cellTooltip: cellTooltip },
                { name: 'O_OL_VOYSEQ'            ,  displayName: '航次', width: 66, cellTooltip: cellTooltip },
                { name: 'O_OL_MVNO'              ,  displayName: '呼號', width: 66, cellTooltip: cellTooltip },
                { name: 'O_OL_COMPID'            ,  displayName: '船公司代碼', width: 103, cellTooltip: cellTooltip },
                { name: 'O_OL_ARRLOCATIONID'     ,  displayName: '卸存地點', width: 91, cellTooltip: cellTooltip },
                { name: 'O_OL_POST'              ,  displayName: '裝貨港', width: 78, cellTooltip: cellTooltip },
                { name: 'O_OL_PACKAGELOCATIONID' ,  displayName: '暫存地點', width: 91, cellTooltip: cellTooltip },
                { name: 'O_OL_BOATID'            ,  displayName: '船機代碼', width: 91, cellTooltip: cellTooltip },
                { name: 'O_OL_REASON'            ,  displayName: '描述', cellTooltip: cellTooltip },
                { name: 'ITEM_LIST'              ,  displayName: '報機單', width: 79, enableFiltering: false, enableSorting: false, cellTemplate: $templateCache.get('accessibilityToOperaForJob001') },
                { name: 'Options'                ,  displayName: '操作', width: 68, enableCellEdit: false, enableFiltering: false, cellTemplate: $templateCache.get('accessibilityToM') }
            ],
            enableFiltering: true,
            enableSorting: true,
            enableColumnMenus: false,
            // enableVerticalScrollbar: false,
            paginationPageSizes: [10, 25, 50, 100],
            paginationPageSize: 100,
            onRegisterApi: function(gridApi){
                $vm.masterToBeFilledGridApi = gridApi;
            }
        },
        gridMethodForPullGoods : {
            // 原因
            viewData : function(row){
                var modalInstance = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'viewOReasonModalContent.html',
                    controller: 'ViewOReasonModalInstanceCtrl',
                    controllerAs: '$ctrl',
                    // size: 'lg',
                    resolve: {
                        items: function () {
                            return row.entity;
                        }
                    }
                });

                modalInstance.result.then(function(selectedItem) {
                    console.log(selectedItem);

                    RestfulApi.UpdateMSSQLData({
                        updatename: 'Update',
                        table: 47,
                        params: {
                            O_PG_REASON      : selectedItem.O_PG_REASON,
                            O_PG_UP_USER     : $vm.profile.U_ID,
                            O_PG_UP_DATETIME : $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss')
                        },
                        condition: {
                            O_PG_SEQ         : selectedItem.O_PG_SEQ,
                            O_PG_NEWSMALLNO  : selectedItem.O_PG_NEWSMALLNO,
                            O_PG_SMALLNO     : selectedItem.O_PG_SMALLNO
                        }
                    }).then(function (res) {
                        toaster.pop('success', '訊息', '更新成功', 3000);
                        LoadPullGoods();
                    }, function (err) {
                        toaster.pop('error', '錯誤', '更新失敗', 3000);
                    });
                }, function() {
                    // $log.info('Modal dismissed at: ' + new Date());
                });
            },
            // 明細
            detailData : function(row){
                var modalInstance = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'viewODetailModalContent.html',
                    controller: 'ViewODetailModalInstanceCtrl',
                    controllerAs: '$ctrl',
                    size: 'lg',
                    resolve: {
                        items: function () {
                            return row.entity;
                        }
                    }
                });

                modalInstance.result.then(function(selectedItem) {

                }, function() {
                    // $log.info('Modal dismissed at: ' + new Date());
                });
            },
            // 編輯
            modifyData : function(){
                var _data = $vm.pullGoodsGridApi.selection.getSelectedRows();
                if(_data.length == 0) {
                    toaster.pop('info', '訊息', '尚未勾選資料。', 3000);
                    return;
                }

                var _emptyMoved = false;
                for(var i in _data){
                    // 檢查移船是否為否
                    if(_data[i].O_PG_MOVED){
                        _emptyMoved = true;
                        break;
                    }
                }

                if(_emptyMoved){
                    toaster.pop('warning', '警告', '有資料已被移船', 3000);
                    return;
                }

                var modalInstance = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'modifyOPullGoodsModalContent.html',
                    controller: 'ModifyOPullGoodsModalInstanceCtrl',
                    controllerAs: '$ctrl'
                    // size: 'lg',
                });

                modalInstance.result.then(function(selectedItem) {
                    console.log(selectedItem);

                    var _d = new Date(),
                        _tasks = [];

                    for(var i in _data){
                        _tasks.push({
                            crudType: 'Update',
                            table: 45,
                            params: {
                                O_PG_MASTER            : selectedItem.O_PG_MASTER,
                                O_PG_PASSCODE          : selectedItem.O_PG_PASSCODE,
                                O_PG_VOYSEQ            : selectedItem.O_PG_VOYSEQ,
                                O_PG_MVNO              : selectedItem.O_PG_MVNO,
                                O_PG_COMPID            : selectedItem.O_PG_COMPID,
                                O_PG_ARRLOCATIONID     : selectedItem.O_PG_ARRLOCATIONID,
                                O_PG_POST              : selectedItem.O_PG_POST,
                                O_PG_PACKAGELOCATIONID : selectedItem.O_PG_PACKAGELOCATIONID,
                                O_PG_BOATID            : selectedItem.O_PG_BOATID,
                                O_PG_UP_USER           : $vm.profile.U_ID,
                                O_PG_UP_DATETIME       : $filter('date')(_d, 'yyyy-MM-dd HH:mm:ss')
                            },
                            condition: {
                                O_PG_SEQ        : _data[i].PG_SEQ,
                                O_PG_NEWSMALLNO : _data[i].O_PG_NEWSMALLNO,
                                O_PG_SMALLNO    : _data[i].O_PG_SMALLNO
                            }
                        });
                    }

                    RestfulApi.CRUDMSSQLDataByTask(_tasks).then(function (res){
                        toaster.pop('success', '訊息', '更新成功', 3000);
                        LoadPullGoods();
                    }, function (err) {
                        toaster.pop('error', '錯誤', '更新失敗', 3000);
                    });  

                }, function() {
                    // $log.info('Modal dismissed at: ' + new Date());
                });
            },
            /**
             * [cancelPullGoodsData description] 取消拉貨
             * 刪除PullGoods資料
             */
            cancelPullGoodsData : function(){
                var _data = $vm.pullGoodsGridApi.selection.getSelectedRows();
                if(_data.length == 0) {
                    toaster.pop('info', '訊息', '尚未勾選資料。', 3000);
                    return;
                }

                var _emptyMoved = false;
                for(var i in _data){
                    // 檢查移船是否為否
                    if(_data[i].O_PG_MOVED){
                        _emptyMoved = true;
                        break;
                    }
                }

                if(_emptyMoved){
                    toaster.pop('warning', '警告', '有資料已被移船', 3000);
                    return;
                }

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
                            return {};
                        },
                        show: function(){
                            return {
                                title : "是否取消拉貨"
                            };
                        }
                    }
                });

                modalInstance.result.then(function(selectedItem) {
                    console.log(selectedItem);

                    var _d = new Date(),
                        _tasks = [];

                    for(var i in _data){
                        _tasks.push({
                            crudType: 'Delete',
                            table: 47,
                            params: {
                                O_PG_SEQ : _data[i].O_PG_SEQ,
                                O_PG_NEWSMALLNO : _data[i].O_PG_NEWSMALLNO,
                                O_PG_SMALLNO : _data[i].O_PG_SMALLNO
                            }
                        });
                    }

                    RestfulApi.CRUDMSSQLDataByTask(_tasks).then(function (res){
                        toaster.pop('success', '訊息', '取消成功', 3000);
                        LoadPullGoods();
                    }, function (err) {
                        toaster.pop('error', '錯誤', '取消失敗', 3000);
                    });  

                }, function() {
                    // $log.info('Modal dismissed at: ' + new Date());
                });
            },
            /**
             * [movedData description] 移船
             * 新增ORDER_LIST
             * 複製ITEM_LIST
             * 複製SPECIAL_GOODS
             * 更新PULL_GODDS
             */
            movedData : function(){
                var _data = $vm.pullGoodsGridApi.selection.getSelectedRows();
                // console.log(_data);
                if(_data.length == 0) {
                    toaster.pop('info', '訊息', '尚未勾選資料。', 3000);
                    return;
                }

                var _duplicatValue = {},
                    _itemListPK = [],
                    _smallNo = [];
                for(var i in _data){

                    // 檢查主號(改)是否為空
                    if(_data[i].O_PG_MASTER == null || _data[i].O_PG_MASTER == ""){
                        toaster.pop('warning', '警告', '尚有資料 主號(改) 為空', 3000);
                        return;
                    }
                    // 檢查通關號碼(改)是否為空
                    if(_data[i].O_PG_PASSCODE == null || _data[i].O_PG_PASSCODE == ""){
                        toaster.pop('warning', '警告', '尚有資料 通關號碼(改) 為空', 3000);
                        return;
                    }
                    // 檢查航次(改)是否為空
                    if(_data[i].O_PG_VOYSEQ == null || _data[i].O_PG_VOYSEQ == ""){
                        toaster.pop('warning', '警告', '尚有資料 航次(改) 為空', 3000);
                        return;
                    }
                    // 檢查呼號(改)是否為空
                    if(_data[i].O_PG_MVNO == null || _data[i].O_PG_MVNO == ""){
                        toaster.pop('warning', '警告', '尚有資料 呼號(改) 為空', 3000);
                        return;
                    }
                    // 檢查船公司代碼(改)是否為空
                    if(_data[i].O_PG_COMPID == null || _data[i].O_PG_COMPID == ""){
                        toaster.pop('warning', '警告', '尚有資料 船公司代碼(改) 為空', 3000);
                        return;
                    }
                    // 檢查卸存地點(改)是否為空
                    if(_data[i].O_PG_ARRLOCATIONID == null || _data[i].O_PG_ARRLOCATIONID == ""){
                        toaster.pop('warning', '警告', '尚有資料 卸存地點(改) 為空', 3000);
                        return;
                    }
                    // 檢查裝貨港(改)是否為空
                    if(_data[i].O_PG_POST == null || _data[i].O_PG_POST == ""){
                        toaster.pop('warning', '警告', '尚有資料 裝貨港(改) 為空', 3000);
                        return;
                    }
                    // 檢查暫存地點(改)是否為空
                    if(_data[i].O_PG_PACKAGELOCATIONID == null || _data[i].O_PG_PACKAGELOCATIONID == ""){
                        toaster.pop('warning', '警告', '尚有資料 暫存地點(改) 為空', 3000);
                        return;
                    }
                    // 檢查船機代碼(改)是否為空
                    if(_data[i].O_PG_BOATID == null || _data[i].O_PG_BOATID == ""){
                        toaster.pop('warning', '警告', '尚有資料 船機代碼(改) 為空', 3000);
                        return;
                    }

                    // 第一筆資料keep
                    if(i == 0){
                        _duplicatValue = angular.copy(_data[i]);
                    }
                    // 第二筆資料開始檢查
                    else{
                        // 檢查主號(改)是否重複
                        if(_data[i].O_PG_MASTER != _duplicatValue.O_PG_MASTER){
                            toaster.pop('warning', '警告', '主號(改) 資料不一致', 3000);
                            return;
                        }
                        // 檢查通關號碼(改)是否重複
                        if(_data[i].O_PG_PASSCODE != _duplicatValue.O_PG_PASSCODE){
                            toaster.pop('warning', '警告', '通關號碼(改) 資料不一致', 3000);
                            return;
                        }
                        // 檢查航次(改)是否重複
                        if(_data[i].O_PG_VOYSEQ != _duplicatValue.O_PG_VOYSEQ){
                            toaster.pop('warning', '警告', '航次(改) 資料不一致', 3000);
                            return;
                        }
                        // 檢查呼號(改)是否重複
                        if(_data[i].O_PG_MVNO != _duplicatValue.O_PG_MVNO){
                            toaster.pop('warning', '警告', '呼號(改) 資料不一致', 3000);
                            return;
                        }
                        // 檢查船公司代碼(改)是否重複
                        if(_data[i].O_PG_COMPID != _duplicatValue.O_PG_COMPID){
                            toaster.pop('warning', '警告', '船公司代碼(改) 資料不一致', 3000);
                            return;
                        }
                        // 檢查卸存地點(改)是否重複
                        if(_data[i].O_PG_ARRLOCATIONID != _duplicatValue.O_PG_ARRLOCATIONID){
                            toaster.pop('warning', '警告', '卸存地點(改) 資料不一致', 3000);
                            return;
                        }
                        // 檢查裝貨港(改)是否重複
                        if(_data[i].O_PG_POST != _duplicatValue.O_PG_POST){
                            toaster.pop('warning', '警告', '裝貨港(改) 資料不一致', 3000);
                            return;
                        }
                        // 檢查暫存地點(改)是否重複
                        if(_data[i].O_PG_PACKAGELOCATIONID != _duplicatValue.O_PG_PACKAGELOCATIONID){
                            toaster.pop('warning', '警告', '暫存地點(改) 資料不一致', 3000);
                            return;
                        }
                        // 檢查船機代碼(改)是否重複
                        if(_data[i].O_PG_BOATID != _duplicatValue.O_PG_BOATID){
                            toaster.pop('warning', '警告', '船機代碼(改) 資料不一致', 3000);
                            return;
                        }
                    }

                    // 檢查移船是否為否
                    if(_data[i].O_PG_MOVED){
                        toaster.pop('warning', '警告', '有資料已被移船', 3000);
                        return;
                    }

                    if(_data[i].OW2_PRINCIPAL == null){
                        toaster.pop('warning', '警告', '有資料尚未被作業員編輯', 3000);
                        return;
                    }

                    _itemListPK.push({
                        SEQ : _data[i].O_PG_SEQ,
                        NEWSMALLNO : _data[i].O_PG_NEWSMALLNO,
                        SMALLNO : _data[i].O_PG_SMALLNO
                    });

                    _smallNo.push(_data[i].O_PG_SMALLNO);
                }

                // 取得報機單類型的值
                var _oeType = null;
                for(var i in opType){
                    if(opType[i].label == '報機單'){
                        _oeType = opType[i].value;
                    }
                }

                var modalInstance = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'addOOrderListModalContent.html',
                    controller: 'AddOOrderListModalInstanceCtrl',
                    controllerAs: '$ctrl',
                    backdrop: 'static',
                    // size: 'lg',
                    // appendTo: parentElem,
                    resolve: {
                        items: function() {
                            var _text = "拉貨("+_smallNo.join(", ")+")";
                            return {
                                O_OL_IMPORTDT          : _data[0].O_OL_IMPORTDT, 
                                O_OL_CO_CODE           : _data[0].O_OL_CO_CODE, 
                                O_OL_MASTER            : _duplicatValue.O_PG_MASTER, 
                                O_OL_PASSCODE          : _duplicatValue.O_PG_PASSCODE, 
                                O_OL_VOYSEQ            : _duplicatValue.O_PG_VOYSEQ, 
                                O_OL_MVNO              : _duplicatValue.O_PG_MVNO, 
                                O_OL_COMPID            : _duplicatValue.O_PG_COMPID, 
                                O_OL_ARRLOCATIONID     : _duplicatValue.O_PG_ARRLOCATIONID, 
                                O_OL_POST              : _duplicatValue.O_PG_POST, 
                                O_OL_PACKAGELOCATIONID : _duplicatValue.O_PG_PACKAGELOCATIONID, 
                                O_OL_BOATID            : _duplicatValue.O_PG_BOATID, 
                                O_OL_REASON            : _text.length > 300 ? "拉貨" : _text, 
                                O_OE_PRINCIPAL           : _data[0].OW2_PRINCIPAL
                            };
                        },
                        ocompy: function() {
                            return ocompy;
                        }
                    }
                });

                modalInstance.result.then(function(selectedItem) {
                    console.log(selectedItem);

                    var _d = new Date,
                        _tasks = [],
                        _newSeq = $vm.profile.U_ID+selectedItem.O_OL_CO_CODE+$filter('date')(_d, 'yyyyMMddHHmmss');

                    // 新增ORDER_LIST
                    _tasks.push({
                        crudType: 'Insert',
                        table: 40,
                        params: {
                            O_OL_SEQ                : _newSeq,
                            O_OL_CO_CODE            : selectedItem.O_OL_CO_CODE,
                            O_OL_MASTER             : selectedItem.O_OL_MASTER,
                            O_OL_PASSCODE           : selectedItem.O_OL_PASSCODE,
                            O_OL_VOYSEQ             : selectedItem.O_OL_VOYSEQ,
                            O_OL_MVNO               : selectedItem.O_OL_MVNO,
                            O_OL_COMPID             : selectedItem.O_OL_COMPID,
                            O_OL_ARRLOCATIONID      : selectedItem.O_OL_ARRLOCATIONID,
                            O_OL_POST               : selectedItem.O_OL_POST,
                            O_OL_PACKAGELOCATIONID  : selectedItem.O_OL_PACKAGELOCATIONID,
                            O_OL_BOATID             : selectedItem.O_OL_BOATID,
                            O_OL_IMPORTDT           : selectedItem.O_OL_IMPORTDT,
                            O_OL_CR_DATETIME        : $filter('date')(_d, 'yyyy-MM-dd HH:mm:ss'),
                            O_OL_CR_USER            : $vm.profile.U_ID,
                            O_OL_REASON             : selectedItem.O_OL_REASON
                        }
                    })

                    if(_oeType != null){
                        // 新增EDITOR
                        _tasks.push({
                            crudType: 'Insert',
                            table: 43,
                            params: {
                                O_OE_SEQ : _newSeq,
                                O_OE_TYPE : _oeType,
                                O_OE_PRINCIPAL : selectedItem.O_OE_PRINCIPAL,
                                O_OE_EDATETIME : $filter('date')(_d, 'yyyy-MM-dd HH:mm:ss'),
                                O_OE_FDATETIME : $filter('date')(_d, 'yyyy-MM-dd HH:mm:ss')
                            }
                        })
                    }

                    // 複製ITEM_LIST
                    _tasks.push({
                        crudType: 'Copy',
                        querymain: 'oassistantJobs',
                        queryname: 'CopyOItemList',
                        table: 41,
                        params: {
                            O_IL_SEQ : _newSeq,
                            ItemListPK : _itemListPK
                        }
                    })

                    // 複製SPECIAL_GOODS
                    _tasks.push({
                        crudType: 'Copy',
                        querymain: 'oassistantJobs',
                        queryname: 'CopyOSpecialGoods',
                        table: 44,
                        params: {
                            O_SPG_SEQ : _newSeq,
                            ItemListPK : _itemListPK
                        }
                    })

                    // 更新PULL_GOODS
                    for(var i in _itemListPK){
                        _tasks.push({
                            crudType: 'Update',
                            table: 45,
                            params: {
                                O_PG_MOVED : true,
                                O_PG_MOVED_SEQ : _newSeq,
                                O_PG_MOVE_USER : $vm.profile.U_ID,
                                O_PG_MOVE_DATETIME : $filter('date')(_d, 'yyyy-MM-dd HH:mm:ss')
                            },
                            condition: {
                                O_PG_SEQ : _itemListPK[i].SEQ,
                                O_PG_NEWSMALLNO : _itemListPK[i].NEWSMALLNO,
                                O_PG_SMALLNO : _itemListPK[i].SMALLNO
                            }
                        })
                    }

                    RestfulApi.CRUDMSSQLDataByTask(_tasks).then(function (res){
                        toaster.pop('success', '訊息', '移船成功', 3000);
                        LoadPullGoods();
                    }, function (err) {
                        toaster.pop('error', '錯誤', '移船失敗', 3000);
                    });  

                }, function() {
                    // $log.info('Modal dismissed at: ' + new Date());
                });

            },
            /**
             * [cancelMovedData description] 取消移船
             * 刪除ORDER_LIST
             * 刪除SPECIAL_GOODS
             * 更新PULL_GOODS
             */
            cancelMovedData : function(){
                
                var _data = $vm.pullGoodsGridApi.selection.getSelectedRows();
                if(_data.length == 0) {
                    toaster.pop('info', '訊息', '尚未勾選資料。', 3000);
                    return;
                }

                for(var i in _data){
                    // 檢查移船是否為否
                    if(!_data[i].O_PG_MOVED){
                        toaster.pop('warning', '警告', '有資料未被移船', 3000);
                        return;
                    }
                }

                var _oeType = null;
                for(var i in opType){
                    if(opType[i].label == '報機單'){
                        _oeType = opType[i].value;
                    }
                }

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
                            return {};
                        },
                        show: function(){
                            return {
                                title : "是否取消移船"
                            };
                        }
                    }
                });

                modalInstance.result.then(function(selectedItem) {
                    // console.log(_data, _oeType);

                    var _tasks = [],
                        _d = new Date;

                    for(var i in _data){
                        _tasks.push({
                            crudType: 'Delete',
                            table: 40,
                            params: {
                                O_OL_SEQ : _data[i].O_PG_MOVED_SEQ
                            }
                        });

                        _tasks.push({
                            crudType: 'Delete',
                            table: 44,
                            params: {
                                O_SPG_SEQ : _data[i].O_PG_MOVED_SEQ
                            }
                        });

                        // 刪除EDITOR
                        _tasks.push({
                            crudType: 'Delete',
                            table: 43,
                            params: {
                                O_OE_SEQ : _data[i].O_PG_MOVED_SEQ,
                                O_OE_TYPE : _oeType,
                                O_OE_PRINCIPAL : _data[i].OW2_PRINCIPAL
                            }
                        })

                        _tasks.push({
                            crudType: 'Update',
                            table: 45,
                            params: {
                                O_PG_MASTER            : null,
                                O_PG_PASSCODE          : null,
                                O_PG_VOYSEQ            : null,
                                O_PG_MVNO              : null,
                                O_PG_COMPID            : null,
                                O_PG_ARRLOCATIONID     : null,
                                O_PG_POST              : null,
                                O_PG_PACKAGELOCATIONID : null,
                                O_PG_BOATID            : null,
                                O_PG_MOVED             : false,
                                O_PG_MOVED_SEQ         : null,
                                O_PG_UP_USER           : $vm.profile.U_ID,
                                O_PG_UP_DATETIME       : $filter('date')(_d, 'yyyy-MM-dd HH:mm:ss'),
                                O_PG_MOVE_USER         : null,
                                O_PG_MOVE_DATETIME     : null
                            },
                            condition: {
                                O_PG_SEQ : _data[i].O_PG_SEQ,
                                O_PG_NEWSMALLNO : _data[i].O_PG_NEWSMALLNO,
                                O_PG_SMALLNO : _data[i].O_PG_SMALLNO
                            }
                        });
                    }

                    RestfulApi.CRUDMSSQLDataByTask(_tasks).then(function (res){
                        toaster.pop('success', '訊息', '取消移船成功', 3000);
                        LoadPullGoods();
                    }, function (err) {
                        toaster.pop('error', '錯誤', '取消移船失敗', 3000);
                    });  

                }, function() {
                    // $log.info('Modal dismissed at: ' + new Date());
                });
            },
            // 匯出Excel
            exportExcel : function(){
                
                var _data = $vm.pullGoodsGridApi.selection.getSelectedRows(),
                    _exportName = $filter('date')(new Date(), 'yyyyMMdd') + ' 拉貨明細',
                    _params = {};

                // 選擇筆數匯出
                if(_data.length > 0){
                    var _Seq = [],
                        _NewSmallNo = [],
                        _SmallNo = [];

                    for(var i in _data){
                        _Seq.push(_data[i].O_PG_SEQ);
                        _NewSmallNo.push(_data[i].O_PG_NEWSMALLNO);
                        _SmallNo.push(_data[i].O_PG_SMALLNO);
                    }

                    _params = {
                        Seq: "'"+_Seq.join("','")+"'",
                        NewSmallNo: "'"+_NewSmallNo.join("','")+"'",
                        SmallNo: "'"+_SmallNo.join("','")+"'"
                    };
                }

                ToolboxApi.ExportExcelBySql({
                    templates : 19,
                    filename : _exportName,
                    querymain: 'oassistantJobs',
                    queryname: 'SelectOPullGoods',
                    params: _params
                }).then(function (res) {
                    // console.log(res);
                });
            }
        },
        pullGoodsOptions : {
            data:  '$vm.pullGoodsData',
            columnDefs: [
                { name: 'isSelected'    , displayName: '選擇', width: 66, pinnedLeft:true, pinnedLeft:true, enableCellEdit: false, cellFilter: 'booleanFilter', filter: 
                    {
                        term: null,
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: bool
                    }
                },
                { name: 'O_OL_IMPORTDT' ,  displayName: '報機日期', width: 91, pinnedLeft:true, pinnedLeft:true, cellFilter: 'dateFilter', cellTooltip: cellTooltip },
                { name: 'O_CO_NAME'     ,  displayName: '行家', width: 66, pinnedLeft:true, pinnedLeft:true, cellTooltip: cellTooltip },
                { name: 'O_OL_MASTER'   ,  displayName: '主號', width: 133, pinnedLeft:true, pinnedLeft:true, cellTooltip: cellTooltip },
                // { name: 'O_OL_PASSCODE'          ,  displayName: '通關號碼', width: 91, cellTooltip: cellTooltip },
                { name: 'O_OL_VOYSEQ'            ,  displayName: '航次', width: 66, cellTooltip: cellTooltip },
                // { name: 'O_OL_MVNO'              ,  displayName: '呼號', width: 66, cellTooltip: cellTooltip },
                // { name: 'O_OL_COMPID'            ,  displayName: '船公司代碼', width: 103, cellTooltip: cellTooltip },
                // { name: 'O_OL_ARRLOCATIONID'     ,  displayName: '卸存地點', width: 91, cellTooltip: cellTooltip },
                // { name: 'O_OL_POST'              ,  displayName: '裝貨港', width: 78, cellTooltip: cellTooltip },
                // { name: 'O_OL_PACKAGELOCATIONID' ,  displayName: '暫存地點', width: 91, cellTooltip: cellTooltip },
                // { name: 'O_OL_BOATID'            ,  displayName: '船機代碼', width: 91, cellTooltip: cellTooltip },
                { name: 'O_PG_SMALLNO'      , displayName: '小號', width: 103, cellTooltip: cellTooltip },
                { name: 'O_PG_MOVED'        , displayName: '移船', width: 66, cellFilter: 'booleanFilter', filter: 
                    {
                        term: null,
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: bool
                    }
                },
                { name: 'O_PG_MASTER'            ,  displayName: '主號(改)', width: 87 },
                { name: 'O_PG_PASSCODE'          ,  displayName: '通關號碼(改)', width: 113, cellTooltip: cellTooltip },
                { name: 'O_PG_VOYSEQ'            ,  displayName: '航次(改)', width: 88, cellTooltip: cellTooltip },
                { name: 'O_PG_MVNO'              ,  displayName: '呼號(改)', width: 88, cellTooltip: cellTooltip },
                { name: 'O_PG_COMPID'            ,  displayName: '船公司代碼(改)', width: 125, cellTooltip: cellTooltip },
                { name: 'O_PG_ARRLOCATIONID'     ,  displayName: '卸存地點(改)', width: 113, cellTooltip: cellTooltip },
                { name: 'O_PG_POST'              ,  displayName: '裝貨港(改)', width: 100, cellTooltip: cellTooltip },
                { name: 'O_PG_PACKAGELOCATIONID' ,  displayName: '暫存地點(改)', width: 113, cellTooltip: cellTooltip },
                { name: 'O_PG_BOATID'            ,  displayName: '船機代碼(改)', width: 113, cellTooltip: cellTooltip },
                { name: 'O_PG_REASON'     , displayName: '拉貨原因', width: 91, cellTooltip: cellTooltip },
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
                { name: 'ITEM_LIST'     , displayName: '報機單', enableFiltering: false, enableSorting: false, width: 78, pinnedRight:true, cellTemplate: $templateCache.get('accessibilityToOperaForJob001') },
                { name: 'Options'       , displayName: '操作', width: 101, pinnedRight:true, enableFiltering: false, enableSorting: false, cellTemplate: $templateCache.get('accessibilityToVForPullGoods') }
            ],
            enableFiltering: true,
            enableSorting: true,
            enableColumnMenus: false,
            enableRowSelection: true,
            enableSelectAll: true,
            // enableVerticalScrollbar: false,
            paginationPageSizes: [10, 25, 50, 100],
            paginationPageSize: 100,
            onRegisterApi: function(gridApi){
                $vm.pullGoodsGridApi = gridApi;

                gridApi.selection.on.rowSelectionChanged($scope, function(rowEntity, colDef, newValue, oldValue){
                    rowEntity.entity["isSelected"] = rowEntity.isSelected;
                });

                gridApi.selection.on.rowSelectionChangedBatch($scope, function(rowEntity, colDef, newValue, oldValue){
                    for(var i in rowEntity){
                        rowEntity[i].entity["isSelected"] = rowEntity[i].isSelected;
                    }
                });
            }
        }
    });

    function LoadMasterToBeFilled(){
        RestfulApi.SearchMSSQLData({
            querymain: 'oassistantJobs',
            queryname: 'SelectMasterToBeFilled',
            params: {
                U_ID : $vm.profile.U_ID,
                U_GRADE : $vm.profile.U_GRADE
                // DEPTS : $vm.profile.DEPTS
            }
        }).then(function (res){
            // console.log(res["returnData"]);
            for(var i=0;i<res["returnData"].length;i++){
                res["returnData"][i]["Index"] = i+1;
            }
            $vm.masterToBeFilledData = res["returnData"];
        }); 
    };

    function LoadPullGoods(){
        RestfulApi.SearchMSSQLData({
            querymain: 'oassistantJobs',
            queryname: 'SelectOPullGoods'
        }).then(function (res){
            // console.log(res["returnData"]);
            $vm.pullGoodsData = res["returnData"] || [];
        }); 
    };

    /**
     * [ClearSelectedColumn description] isSelected設為否
     */
    function ClearSelectedColumn(){
        for(var i in $vm.pullGoodsData){
            $vm.pullGoodsData[i].isSelected = false;
        }
    }

})
.controller('ModifyOPullGoodsModalInstanceCtrl', function ($uibModalInstance) {
    var $ctrl = this;
    // $ctrl.mdData = angular.copy(items);
    $ctrl.mdData = {};

    $ctrl.ok = function() {
        $uibModalInstance.close($ctrl.mdData);
    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
})
.controller('ViewOReasonModalInstanceCtrl', function ($uibModalInstance, items) {
    var $ctrl = this;
    $ctrl.mdData = angular.copy(items);

    $ctrl.ok = function() {
        $uibModalInstance.close($ctrl.mdData);
    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
})
.controller('ViewODetailModalInstanceCtrl', function ($uibModalInstance, RestfulApi, items) {
    var $ctrl = this;

    $ctrl.Init = function(){
        RestfulApi.SearchMSSQLData({
            querymain: 'oassistantJobs',
            queryname: 'SelectSmallNoDetail',
            params: {
                O_IL_SEQ: items.O_PG_SEQ,
                O_IL_NEWSMALLNO: items.O_PG_NEWSMALLNO,
                O_IL_SMALLNO: items.O_PG_SMALLNO
            }
        }).then(function (res){
            for(var i=0;i<res["returnData"].length;i++){
                res["returnData"][i]["Index"] = i+1;
            }
            $ctrl.mdData = angular.copy(res["returnData"]);
        }); 
    }

    $ctrl.mdDataOption = {
        data: '$ctrl.mdData',
        columnDefs: [
            { name: 'Index'                 , displayName: '序列', width: 66},
            { name: 'O_IL_G1'               , displayName: '報關種類', width: 80 },
            { name: 'O_IL_SMALLNO'          , displayName: '小號', width: 110 },
            { name: 'O_IL_POSTNO'           , displayName: '艙單號碼', width: 110 },
            { name: 'O_IL_CUSTID'           , displayName: '快遞業者統一編號', width: 110 },
            { name: 'O_IL_PRICECONDITON'    , displayName: '單價條件', width: 110 },
            { name: 'O_IL_CURRENCY'         , displayName: '單價幣別代碼', width: 110 },
            { name: 'O_IL_CROSSWEIGHT'      , displayName: '毛重', width: 110 },
            { name: 'O_IL_NEWCROSSWEIGHT'   , displayName: '新毛重', width: 110 },
            { name: 'O_IL_CTN'              , displayName: '件數', width: 110 },
            { name: 'O_IL_NEWCTN'           , displayName: '新件數', width: 110 },
            { name: 'O_IL_CTNUNIT'          , displayName: '件數單位', width: 110 },
            { name: 'O_IL_MARK'             , displayName: '標記', width: 110 },
            { name: 'O_IL_NATURE'           , displayName: '貨物名稱', width: 110, cellTooltip: cellTooltip},
            { name: 'O_IL_NATURE_NEW'       , displayName: '新貨物名稱', width: 110, cellTooltip: cellTooltip},
            { name: 'O_IL_TAX2'             , displayName: '新稅則', width: 110 },
            { name: 'O_IL_TAXRATE'          , displayName: '稅率', width: 110 },
            { name: 'O_IL_TAXRATE2'         , displayName: '新稅率', width: 110 },
            { name: 'O_IL_BRAND'            , displayName: '商標', width: 110 },
            { name: 'O_IL_FORMAT'           , displayName: '成分及規格', width: 110 },
            { name: 'O_IL_NETWEIGHT'        , displayName: '淨重', width: 110 },
            { name: 'O_IL_NETWEIGHT_NEW'    , displayName: '新淨重', width: 110 },
            { name: 'O_IL_COUNT'            , displayName: '數量', width: 110 },
            { name: 'O_IL_NEWCOUNT'         , displayName: '新數量', width: 110 },
            { name: 'O_IL_PRICEUNIT'        , displayName: '單價', width: 110 },
            { name: 'O_IL_NEWPRICEUNIT'     , displayName: '新單價', width: 110 },
            { name: 'O_IL_PCS'              , displayName: '數量單位', width: 110},
            { name: 'O_IL_NEWPCS'           , displayName: '新數量單位', width: 110},
            { name: 'O_IL_INVOICECOST'      , displayName: '發票總金額', width: 110 },
            { name: 'O_IL_INVOICECOST2'     , displayName: '新發票總金額', width: 110 },
            { name: 'O_IL_FINALCOST'        , displayName: '完稅價格', width: 110},
            { name: 'O_IL_VOLUME'           , displayName: '體積', width: 110 },
            { name: 'O_IL_VOLUMEUNIT'       , displayName: '體積單位', width: 110 },
            { name: 'O_IL_COUNTRY'          , displayName: '生產國別', width: 110 },
            { name: 'O_IL_SENDENAME'        , displayName: '出口人英文名稱', width: 110 },
            { name: 'O_IL_NEWSENDENAME'     , displayName: '新出口人英文名稱', width: 110 },
            { name: 'O_IL_COUNTRYID'        , displayName: '出口人國家代碼', width: 110 },
            { name: 'O_IL_NEWCOUNTRYID'     , displayName: '新出口人國家代碼', width: 110 },
            { name: 'O_IL_SENDADDRESS'      , displayName: '出口人英文地址', width: 110 },
            { name: 'O_IL_NEWSENDADDRESS'   , displayName: '新出口人英文地址', width: 110 },
            { name: 'O_IL_GETID'            , displayName: '進口人身分識別碼', width: 110 },
            { name: 'O_IL_GETNO'            , displayName: '進口人統一編號', width: 110 },
            { name: 'O_IL_GETENAME'         , displayName: '進口人英文名稱', width: 110 },
            { name: 'O_IL_GETPHONE'         , displayName: '進口人電話', width: 110 },
            { name: 'O_IL_GETADDRESS'       , displayName: '進口人英文地址', width: 110 },
            { name: 'O_IL_DWKIND'           , displayName: '貨櫃種類', width: 110 },
            { name: 'O_IL_DWNUMBER'         , displayName: '貨櫃號碼', width: 110 },
            { name: 'O_IL_DWTYPE'           , displayName: '貨櫃裝運方式', width: 110 },
            { name: 'O_IL_SEALNUMBER'       , displayName: '封條號碼', width: 110 },
            { name: 'O_IL_DECLAREMEMO1'     , displayName: '其他申報事項1', width: 110 },
            { name: 'O_IL_DECLAREMEMO2'     , displayName: '其他申報事項2', width: 110 },
            { name: 'O_IL_TAXPAYMENTMEMO'   , displayName: '主動申報繳納稅款註記', width: 110 }
        ],
        enableFiltering: false,
        enableSorting: true,
        enableColumnMenus: false,
        // enableVerticalScrollbar: false,
        paginationPageSizes: [50, 100, 150, 200, 250, 300],
        paginationPageSize: 100,
        onRegisterApi: function(gridApi){
            $ctrl.mdDataGridApi = gridApi;
            // HandleWindowResize($ctrl.job001DataNotMergeNoGridApi);
        }
    }

    $ctrl.ok = function() {
        $uibModalInstance.close();
    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
})
.controller('AddOOrderListModalInstanceCtrl', function ($uibModalInstance, items, ocompy) {
    var $ctrl = this;

    $ctrl.Init = function(){
        $ctrl.mdData = angular.copy(items);
        $ctrl.ocompy = ocompy;
    }

    $ctrl.ok = function() {

        // 改為大寫
        if($ctrl.mdData.O_OL_PASSCODE != null){
            $ctrl.mdData.O_OL_PASSCODE = $ctrl.mdData.O_OL_PASSCODE.toUpperCase();
        }
        if($ctrl.mdData.O_OL_MASTER != null){
            $ctrl.mdData.O_OL_MASTER = $ctrl.mdData.O_OL_MASTER.toUpperCase();
        }
        if($ctrl.mdData.O_OL_MVNO != null){
            $ctrl.mdData.O_OL_MVNO = $ctrl.mdData.O_OL_MVNO.toUpperCase();
        }
        if($ctrl.mdData.O_OL_COMPID != null){
            $ctrl.mdData.O_OL_COMPID = $ctrl.mdData.O_OL_COMPID.toUpperCase();
        }
        if($ctrl.mdData.O_OL_ARRLOCATIONID != null){
            $ctrl.mdData.O_OL_ARRLOCATIONID = $ctrl.mdData.O_OL_ARRLOCATIONID.toUpperCase();
        }
        if($ctrl.mdData.O_OL_POST != null){
            $ctrl.mdData.O_OL_POST = $ctrl.mdData.O_OL_POST.toUpperCase();
        }
        if($ctrl.mdData.O_OL_PACKAGELOCATIONID != null){
            $ctrl.mdData.O_OL_PACKAGELOCATIONID = $ctrl.mdData.O_OL_PACKAGELOCATIONID.toUpperCase();
        }

        $uibModalInstance.close($ctrl.mdData);
    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
});