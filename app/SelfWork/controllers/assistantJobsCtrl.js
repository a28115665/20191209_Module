"use strict";

angular.module('app.selfwork').controller('AssistantJobsCtrl', function ($scope, $stateParams, $state, AuthApi, Session, toaster, $uibModal, $templateCache, RestfulApi, $filter, uiGridConstants, compy, bool, opType, userInfo, OrderStatus, ToolboxApi, localStorageService) {
    
    var $vm = this;

	angular.extend(this, {
        Init : function(){
            $scope.ShowTabs = true;
            
            // 帶入LocalStorage資料
            if(localStorageService.get("AssistantJobs") == null){
                $vm.defaultTab = 'hr2';
            }else{
                $vm.defaultTab = localStorageService.get("AssistantJobs");
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
            localStorageService.set("AssistantJobs", $vm.defaultTab);

            switch($vm.defaultTab){
                case 'hr1':
                    LoadFlightArrival();
                    break;
                case 'hr2':
                    LoadFlightItem();
                    break;
                case 'hr3':
                    // LoadPullGoods();
                    break;
                case 'hr4':
                    LoadMasterToBeFilled();
                    break;
                case 'hr5':
                    LoadPullGoods();
                    break;
            }
        },
        flightArrivalOptions : {
            data:  '$vm.flightArrivalData',
            columnDefs: [
                { name: 'Index'                  ,  displayName: '序列', width: 50, enableFiltering: false },
                { name: 'FA_FLIGHTDATE'          ,  displayName: '起飛日期', cellFilter: 'dateFilter', width: 80 },
                { name: 'FA_AIR_LINEID'          ,  displayName: '航空代號', width: 80 },
                { name: 'FA_FLIGHTNUM'           ,  displayName: '貨機號碼', width: 80 },
                { name: 'FA_DEPART_AIRTID'       ,  displayName: '起飛來源', width: 80 },
                { name: 'FA_ARRIVAL_AIRPTID'     ,  displayName: '抵達目的', width: 80 },
                { name: 'FA_SCHEDL_DEPARTTIME'   ,  displayName: '預計起飛時間', cellFilter: 'datetimeFilter' },
                { name: 'FA_ACTL_DEPARTTIME'     ,  displayName: '真實起飛時間', cellFilter: 'datetimeFilter' },
                { name: 'FA_DEPART_REMK'         ,  displayName: '起飛狀態', width: 80, cellTemplate: $templateCache.get('accessibilityToDepartRemark') },
                { name: 'FA_DEPART_GATE'         ,  displayName: '起飛登機口', width: 80 },
                { name: 'FA_SCHEDL_ARRIVALTIME'  ,  displayName: '預計抵達時間', cellFilter: 'datetimeFilter' },
                { name: 'FA_ACTL_ARRIVALTIME'    ,  displayName: '真實抵達時間', cellFilter: 'datetimeFilter' },
                { name: 'FA_ARRIVAL_REMK'        ,  displayName: '抵達狀態', width: 80, cellTemplate: $templateCache.get('accessibilityToArrivalRemark') },
                { name: 'FA_ARRIVAL_GATE'        ,  displayName: '抵達登機口', width: 80 },
                { name: 'FA_UP_DATETIME'         ,  displayName: '資料更新時間', cellFilter: 'datetimeFilter' }
            ],
            enableFiltering: true,
            enableSorting: true,
            enableColumnMenus: false,
            // enableVerticalScrollbar: false,
            // paginationPageSizes: [10, 25, 50, 100],
            // paginationPageSize: 100,
            onRegisterApi: function(gridApi){
                $vm.flightArrivalGridApi = gridApi;
            }
        },
        ReloadFlightArrival : function(){
            LoadFlightArrival();
            toaster.pop('success', '訊息', '重新整理完成', 3000);
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
                    templateUrl: 'opWorkMenu.html',
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
                    template: $templateCache.get('modifyOrderList'),
                    controller: 'ModifyOrderListModalInstanceCtrl',
                    controllerAs: '$ctrl',
                    // size: 'sm',
                    // windowClass: 'center-modal',
                    // appendTo: parentElem,
                    resolve: {
                        vmData: function() {
                            return row.entity;
                        },
                        compy: function() {
                            return compy;
                        }
                    }
                });

                modalInstance.result.then(function(selectedItem) {
                    // $ctrl.selected = selectedItem;
                    console.log(selectedItem);

                    RestfulApi.UpdateMSSQLData({
                        updatename: 'Update',
                        table: 18,
                        params: {
                            OL_IMPORTDT : selectedItem.OL_IMPORTDT,
                            OL_REAL_IMPORTDT : selectedItem.OL_REAL_IMPORTDT,
                            OL_CO_CODE  : selectedItem.OL_CO_CODE,
                            OL_FLIGHTNO : selectedItem.OL_FLIGHTNO,
                            OL_MASTER   : selectedItem.OL_MASTER,
                            OL_COUNTRY  : selectedItem.OL_COUNTRY,
                            OL_REASON   : selectedItem.OL_REASON
                        },
                        condition: {
                            OL_SEQ : selectedItem.OL_SEQ
                        }
                    }).then(function (res) {
                        LoadFlightItem();
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
            // 貨物查看
            viewOrder : function(row){
                OrderStatus.Get(row)
            }
        },
        gridMethodForJob002 : {
            // 檢視
            // viewData : function(row){
            //     $state.transitionTo("app.selfwork.assistantjobs.job002", {
            //         data: row.entity
            //     });
            // },
            // 修改
            fixData : function(row){
                $state.transitionTo("app.selfwork.assistantjobs.job002", {
                    data: row.entity
                });
            },
            // 完成
            closeData : function(row){
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
                                title : "是否完成"
                            }
                        }
                    }
                });

                modalInstance.result.then(function(selectedItem) {
                    // $ctrl.selected = selectedItem;
                    console.log(selectedItem);

                    RestfulApi.InsertMSSQLData({
                        insertname: 'Insert',
                        table: 22,
                        params: {
                            OE_SEQ : selectedItem.OL_SEQ,
                            OE_TYPE : 'W', // 銷艙單
                            OE_PRINCIPAL : $vm.profile.U_ID,
                            OE_FDATETIME : $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss')
                        }
                    }).then(function (res) {
                        toaster.pop('success', '訊息', '銷艙單已完成', 3000);
                        LoadFlightItem();
                    });

                }, function() {
                    // $log.info('Modal dismissed at: ' + new Date());
                });
            },
            // 刪除
            deleteData : function(row){

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
                            }
                        }
                    }
                });

                modalInstance.result.then(function(selectedItem) {
                    // $ctrl.selected = selectedItem;
                    console.log(selectedItem);

                    // RestfulApi.DeleteMSSQLData({
                    //     deletename: 'Delete',
                    //     table: 10,
                    //     params: {
                    //         FLL_SEQ : selectedItem.OL_SEQ
                    //     }
                    // }).then(function (res) {
                    //     toaster.pop('info', '訊息', '銷倉單刪除成功', 3000);
                    //     LoadFlightItem();
                    // });

                    var _tasks = [];

                    // 刪除銷倉單
                    _tasks.push({
                        crudType: 'Delete',
                        table: 10,
                        params: {
                            FLL_SEQ : selectedItem.OL_SEQ
                        }
                    });

                    // 刪除銷倉單標記
                    _tasks.push({
                        crudType: 'Delete',
                        table: 28,
                        params: {
                            FLLR_SEQ : selectedItem.OL_SEQ
                        }
                    });

                    RestfulApi.CRUDMSSQLDataByTask(_tasks).then(function (res) {
                        toaster.pop('info', '訊息', '銷倉單刪除成功', 3000);
                        LoadFlightItem();
                    }, function (err) {

                    });

                }, function() {
                    // $log.info('Modal dismissed at: ' + new Date());
                });
            }
        },
        flightItemOptions : {
            data:  '$vm.flightItemData',
            columnDefs: [
                { name: 'Index'                  ,  displayName: '序列', width: 50, enableFiltering: false },
                { name: 'OL_IMPORTDT'            ,  displayName: '進口日期', width: 80, cellFilter: 'dateFilter' },
                // { name: 'OL_CO_CODE'             ,  displayName: '發銷艙單行家', width: 110, cellFilter: 'compyFilter', filter: 
                //     {
                //         term: null,
                //         type: uiGridConstants.filter.SELECT,
                //         selectOptions: compy
                //     }
                // },
                { name: 'CO_NAME'                ,  displayName: '發銷艙單行家', width: 110 },
                { name: 'OL_FLIGHTNO'            ,  displayName: '航班', width: 80 },
                { name: 'FA_ACTL_DEPARTTIME'     ,  displayName: '真實起飛時間', cellFilter: 'datetimeFilter' },
                { name: 'FA_SCHEDL_ARRIVALTIME'  ,  displayName: '預計抵達時間', cellFilter: 'datetimeFilter' },
                // { name: 'FA_ACTL_ARRIVALTIME'    ,  displayName: '真實抵達時間', cellFilter: 'datetimeFilter' },
                { name: 'FA_ARRIVAL_REMK'        ,  displayName: '狀態', width: 80, cellTemplate: $templateCache.get('accessibilityToArrivalRemark') },
                { name: 'OL_MASTER'              ,  displayName: '主號', width: 110, cellTemplate: $templateCache.get('accessibilityToMasterForViewOrder') },
                { name: 'OL_FLL_COUNT'           ,  displayName: '袋數', width: 40 },
                { name: 'OL_FLL_CTN_COUNT'       ,  displayName: '件數', width: 40 },
                { name: 'MAIL_COUNT'             ,  displayName: '寄信次數', width: 40 },
                { name: 'OL_COUNTRY'             ,  displayName: '起運國別', width: 40 },
                { name: 'OL_REASON'              ,  displayName: '描述', cellTooltip: function (row, col) 
                    {
                        return row.entity.OL_REASON
                    } 
                },
                { name: 'W3_STATUS'              ,  displayName: '狀態', width: 60, cellTemplate: $templateCache.get('accessibilityToForW3'), filter: 
                    {
                        term: null,
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: [
                            // {label:'未派單', value: '0'},
                            {label:'已派單', value: '1'},
                            {label:'已編輯', value: '2'},
                            {label:'已完成', value: '3'},
                            {label:'非作業員'  , value: '4'}
                        ]
                    }
                },
                { name: 'W3_PRINCIPAL'           ,  displayName: '負責人', width: 80, cellFilter: 'userInfoFilter', filter: 
                    {
                        term: null,
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: userInfo
                    }
                },
                // { name: 'ITEM_LIST'           ,  displayName: '報機單', enableFiltering: false, width: '8%', cellTemplate: $templateCache.get('accessibilityToOperaForJob001') },
                { name: 'FLIGHT_ITEM_LIST'       ,  displayName: '銷艙單', enableFiltering: false, width: '8%', cellTemplate: $templateCache.get('accessibilityToOperaForJob002') },
                // { name: 'DELIVERY_ITEM_LIST'  ,  displayName: '派送單', enableFiltering: false, width: '8%', cellTemplate: $templateCache.get('accessibilityToOperaForJob003') },
                { name: 'Options'                ,  displayName: '操作', width: '5%', enableCellEdit: false, enableFiltering: false, cellTemplate: $templateCache.get('accessibilityToMSForAssistantJobs') }
            ],
            enableFiltering: true,
            enableSorting: true,
            enableColumnMenus: false,
            // enableVerticalScrollbar: false,
            paginationPageSizes: [10, 25, 50, 100],
            paginationPageSize: 100,
            onRegisterApi: function(gridApi){
                $vm.flightItemGridApi = gridApi;
            }
        },
        masterToBeFilledOptions : {
            data:  '$vm.masterToBeFilledData',
            columnDefs: [
                { name: 'Index'                  ,  displayName: '序列', width: 50, enableFiltering: false },
                { name: 'OL_IMPORTDT'            ,  displayName: '進口日期', width: 80, cellFilter: 'dateFilter' },
                // { name: 'OL_CO_CODE'             ,  displayName: '行家', cellFilter: 'compyFilter', filter: 
                //     {
                //         term: null,
                //         type: uiGridConstants.filter.SELECT,
                //         selectOptions: compy
                //     }
                // },
                { name: 'CO_NAME'                ,  displayName: '行家', width: 160 },
                { name: 'OL_FLIGHTNO'            ,  displayName: '航班', width: 80 },
                { name: 'OL_MASTER'              ,  displayName: '主號', width: 110 },
                { name: 'OL_COUNT'               ,  displayName: '報機單(袋數)', width: 80, enableCellEdit: false },
                { name: 'OL_PULL_COUNT'          ,  displayName: '拉貨(袋數)', width: 80 },
                { name: 'OL_COUNTRY'             ,  displayName: '起運國別', width: 110 },
                { name: 'OL_REASON'              ,  displayName: '描述', cellTooltip: function (row, col) 
                    {
                        return row.entity.OL_REASON
                    } 
                },
                { name: 'ITEM_LIST'              ,  displayName: '報機單', width: 87, enableFiltering: false, enableSorting: false, cellTemplate: $templateCache.get('accessibilityToOperaForJob001') },
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
        gridMethodForJob001 : {
            // 檢視(報機單)
            viewData : function(row){
                console.log(row);

                // 表示為拉貨
                if(!angular.isUndefined(row.entity.PG_SEQ)){
                    row.entity["OL_SEQ"] = row.entity.PG_SEQ;
                }

                $state.transitionTo("app.selfwork.assistantjobs.job001", {
                    data: row.entity
                });
            }
        },
        gridMethodForPullGoods : {
            // 原因
            viewData : function(row){
                var modalInstance = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'viewReasonModalContent.html',
                    controller: 'ViewReasonModalInstanceCtrl',
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
                        table: 19,
                        params: {
                            PG_REASON      : selectedItem.PG_REASON,
                            PG_UP_USER     : $vm.profile.U_ID,
                            PG_UP_DATETIME : $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss')
                        },
                        condition: {
                            PG_SEQ         : selectedItem.PG_SEQ,
                            PG_BAGNO       : selectedItem.PG_BAGNO
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
                    templateUrl: 'viewDetailModalContent.html',
                    controller: 'ViewDetailModalInstanceCtrl',
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
                    // 檢查移機是否為否
                    if(_data[i].PG_MOVED){
                        _emptyMoved = true;
                        break;
                    }
                }

                if(_emptyMoved){
                    toaster.pop('warning', '警告', '有資料已被移機', 3000);
                    return;
                }

                var modalInstance = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'modifyPullGoodsModalContent.html',
                    controller: 'ModifyPullGoodsModalInstanceCtrl',
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
                            table: 19,
                            params: {
                                // PG_MOVED : true,
                                PG_MASTER : selectedItem.PG_MASTER,
                                PG_FLIGHTNO : selectedItem.PG_FLIGHTNO,
                                PG_UP_USER : $vm.profile.U_ID,
                                PG_UP_DATETIME : $filter('date')(_d, 'yyyy-MM-dd HH:mm:ss')
                            },
                            condition: {
                                PG_SEQ : _data[i].PG_SEQ,
                                PG_BAGNO : _data[i].PG_BAGNO
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
                    // 檢查移機是否為否
                    if(_data[i].PG_MOVED){
                        _emptyMoved = true;
                        break;
                    }
                }

                if(_emptyMoved){
                    toaster.pop('warning', '警告', '有資料已被移機', 3000);
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
                            table: 19,
                            params: {
                                PG_SEQ : _data[i].PG_SEQ,
                                PG_BAGNO : _data[i].PG_BAGNO
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
             * [movedData description] 移機
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

                var _emptyFlightNo = false,
                    _emptyMaster = false,
                    _emptyMoved = false,
                    _duplicatFlightNo = false,
                    _duplicatMaster = false,
                    _duplicatFlightNoValue = "",
                    _duplicatMasterValue = "",
                    _sourceMaster = [],
                    _seqAndBagno = [],
                    _seq = [],
                    _bagno = [];
                for(var i in _data){

                    // 檢查航班(改)是否為空
                    if(_data[i].PG_FLIGHTNO == null || _data[i].PG_FLIGHTNO == ""){
                        _emptyFlightNo = true;
                        break;
                    }
                    // 檢查主號(改)是否為空
                    if(_data[i].PG_MASTER == null || _data[i].PG_MASTER == ""){
                        _emptyMaster = true;
                        break;
                    }

                    // 第一筆資料keep
                    if(i == 0){
                        _duplicatFlightNoValue = _data[i].PG_FLIGHTNO;
                        _duplicatMasterValue = _data[i].PG_MASTER;
                    }
                    // 第二筆資料開始檢查
                    else{
                        // 檢查航班(改)是否重複
                        if(_data[i].PG_FLIGHTNO != _duplicatFlightNoValue){
                            _duplicatFlightNo = true;
                            break;
                        }
                        // 檢查主號(改)是否重複
                        if(_data[i].PG_MASTER != _duplicatMasterValue){
                            _duplicatMaster = true;
                            break;
                        }
                    }

                    // 檢查移機是否為否
                    if(_data[i].PG_MOVED){
                        _emptyMoved = true;
                        break;
                    }

                    _seqAndBagno.push({
                        SEQ : _data[i].PG_SEQ,
                        BAGNO : _data[i].PG_BAGNO
                    });

                    // _seq.push(_data[i].PG_SEQ);

                    _bagno.push(_data[i].PG_BAGNO);
                }

                if(_emptyFlightNo){
                    toaster.pop('warning', '警告', '尚有資料 航班(改) 為空', 3000);
                    return;
                }

                if(_emptyMaster){
                    toaster.pop('warning', '警告', '尚有資料 主號(改) 為空', 3000);
                    return;
                }

                if(_duplicatFlightNo){
                    toaster.pop('warning', '警告', '航班(改) 資料不一致', 3000);
                    return;
                }

                if(_duplicatMaster){
                    toaster.pop('warning', '警告', '主號(改) 資料不一致', 3000);
                    return;
                }

                if(_emptyMoved){
                    toaster.pop('warning', '警告', '有資料已被移機', 3000);
                    return;
                }

                if(_data[0].W2_PRINCIPAL == null){
                    toaster.pop('warning', '警告', '有資料尚未被中班作業員編輯', 3000);
                    return;
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
                    templateUrl: 'addOrderListModalContent.html',
                    controller: 'AddOrderListModalInstanceCtrl',
                    controllerAs: '$ctrl',
                    backdrop: 'static',
                    // size: 'lg',
                    // appendTo: parentElem,
                    resolve: {
                        items: function() {
                            var _text = "拉貨("+_bagno.join(", ")+")";
                            return {
                                OL_CO_CODE : _data[0].OL_CO_CODE,
                                OL_MASTER : _duplicatMasterValue,
                                OL_FLIGHTNO : _duplicatFlightNoValue,
                                // OL_IMPORTDT : $filter('date')(new Date, 'yyyy-MM-dd'),
                                OL_IMPORTDT : _data[0].OL_CR_DATETIME,
                                OL_COUNTRY : _data[0].OL_COUNTRY,
                                OL_REASON : _text.length > 300 ? "拉貨" : _text,
                                OE_PRINCIPAL : _data[0].W2_PRINCIPAL
                            };
                        },
                        compy: function() {
                            return compy;
                        }
                    }
                });

                modalInstance.result.then(function(selectedItem) {
                    console.log(selectedItem);
                    
                    var _d = new Date,
                        _tasks = [],
                        _newSeq = $vm.profile.U_ID+selectedItem.OL_CO_CODE+$filter('date')(_d, 'yyyyMMddHHmmss');

                    // 新增ORDER_LIST
                    _tasks.push({
                        crudType: 'Insert',
                        table: 18,
                        params: {
                            OL_SEQ : _newSeq,
                            OL_CO_CODE : selectedItem.OL_CO_CODE,
                            OL_MASTER : selectedItem.OL_MASTER,
                            OL_FLIGHTNO : selectedItem.OL_FLIGHTNO,
                            OL_IMPORTDT : selectedItem.OL_IMPORTDT,
                            OL_COUNTRY : selectedItem.OL_COUNTRY,
                            OL_CR_DATETIME : $filter('date')(_d, 'yyyy-MM-dd HH:mm:ss'),
                            OL_CR_USER : $vm.profile.U_ID,
                            OL_REASON : selectedItem.OL_REASON
                        }
                    })

                    if(_oeType != null){
                        // 新增EDITOR
                        _tasks.push({
                            crudType: 'Insert',
                            table: 22,
                            params: {
                                OE_SEQ : _newSeq,
                                OE_TYPE : _oeType,
                                OE_PRINCIPAL : selectedItem.OE_PRINCIPAL,
                                OE_EDATETIME : $filter('date')(_d, 'yyyy-MM-dd HH:mm:ss'),
                                OE_FDATETIME : $filter('date')(_d, 'yyyy-MM-dd HH:mm:ss')
                            }
                        })
                    }

                    // 複製ITEM_LIST
                    _tasks.push({
                        crudType: 'Copy',
                        querymain: 'assistantJobs',
                        queryname: 'CopyItemList',
                        table: 9,
                        params: {
                            IL_SEQ : _newSeq,
                            SeqAndBagno : _seqAndBagno
                        }
                    })

                    // 複製SPECIAL_GOODS
                    _tasks.push({
                        crudType: 'Copy',
                        querymain: 'assistantJobs',
                        queryname: 'CopySpecialGoods',
                        table: 20,
                        params: {
                            SPG_SEQ : _newSeq,
                            SeqAndBagno : _seqAndBagno
                        }
                    })

                    // 更新PULL_GOODS
                    for(var i in _seqAndBagno){
                        _tasks.push({
                            crudType: 'Update',
                            table: 19,
                            params: {
                                PG_MOVED : true,
                                PG_MOVED_SEQ : _newSeq,
                                PG_MOVE_USER : $vm.profile.U_ID,
                                PG_MOVE_DATETIME : $filter('date')(_d, 'yyyy-MM-dd HH:mm:ss')
                            },
                            condition: {
                                // PG_MASTER : selectedItem.OL_MASTER,
                                // PG_FLIGHTNO : selectedItem.OL_FLIGHTNO
                                PG_SEQ : _seqAndBagno[i].SEQ,
                                PG_BAGNO : _seqAndBagno[i].BAGNO
                            }
                        })
                    }

                    RestfulApi.CRUDMSSQLDataByTask(_tasks).then(function (res){
                        toaster.pop('success', '訊息', '移機成功', 3000);
                        LoadPullGoods();
                    }, function (err) {
                        toaster.pop('error', '錯誤', '移機失敗', 3000);
                    });  

                }, function() {
                    // $log.info('Modal dismissed at: ' + new Date());
                });

            },
            /**
             * [cancelMovedData description] 取消移機
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

                var _emptyMoved = false;
                for(var i in _data){
                    // 檢查移機是否為否
                    if(!_data[i].PG_MOVED){
                        _emptyMoved = true;
                        break;
                    }
                }

                if(_emptyMoved){
                    toaster.pop('warning', '警告', '有資料未被移機', 3000);
                    return;
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
                                title : "是否取消移機"
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
                            table: 18,
                            params: {
                                OL_SEQ : _data[i].PG_MOVED_SEQ
                            }
                        });

                        _tasks.push({
                            crudType: 'Delete',
                            table: 20,
                            params: {
                                SPG_SEQ : _data[i].PG_MOVED_SEQ
                            }
                        });

                        // 刪除EDITOR
                        _tasks.push({
                            crudType: 'Delete',
                            table: 22,
                            params: {
                                OE_SEQ : _data[i].PG_MOVED_SEQ,
                                OE_TYPE : _oeType,
                                OE_PRINCIPAL : _data[i].W2_PRINCIPAL
                            }
                        })

                        _tasks.push({
                            crudType: 'Update',
                            table: 19,
                            params: {
                                PG_MASTER : null,
                                PG_FLIGHTNO : null,
                                PG_MOVED : false,
                                PG_MOVED_SEQ : null,
                                PG_UP_USER : $vm.profile.U_ID,
                                PG_UP_DATETIME : $filter('date')(_d, 'yyyy-MM-dd HH:mm:ss'),
                                PG_MOVE_USER : null,
                                PG_MOVE_DATETIME : null
                            },
                            condition: {
                                PG_SEQ : _data[i].PG_SEQ,
                                PG_BAGNO : _data[i].PG_BAGNO
                            }
                        });
                    }

                    RestfulApi.CRUDMSSQLDataByTask(_tasks).then(function (res){
                        toaster.pop('success', '訊息', '取消移機成功', 3000);
                        LoadPullGoods();
                    }, function (err) {
                        toaster.pop('error', '錯誤', '取消移機失敗', 3000);
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
                        _Bagno = [];

                    for(var i in _data){
                        _Seq.push(_data[i].PG_SEQ);
                        _Bagno.push(_data[i].PG_BAGNO);
                    }

                    _params = {
                        Seq: "'"+_Seq.join("','")+"'",
                        Bagno: "'"+_Bagno.join("','")+"'"
                    };
                }

                ToolboxApi.ExportExcelBySql({
                    templates : 9,
                    filename : _exportName,
                    querymain: 'assistantJobs',
                    queryname: 'SelectPullGoods',
                    params: _params
                }).then(function (res) {
                    // console.log(res);
                });
            }
        },
        pullGoodsOptions : {
            data:  '$vm.pullGoodsData',
            columnDefs: [
                { name: 'isSelected'    , displayName: '選擇', width: 50, pinnedLeft:true, enableCellEdit: false, cellFilter: 'booleanFilter', filter: 
                    {
                        term: null,
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: bool
                    }
                },
                { name: 'OL_IMPORTDT'   , displayName: '進口日期', cellFilter: 'dateFilter' },
                // { name: 'OL_CO_CODE'    , displayName: '行家', cellFilter: 'compyFilter', cellFilter: 'compyFilter', filter: 
                //     {
                //         term: null,
                //         type: uiGridConstants.filter.SELECT,
                //         selectOptions: compy
                //     }
                // },
                { name: 'CO_NAME'       , displayName: '行家' },
                { name: 'OL_FLIGHTNO'   , displayName: '航班' },
                { name: 'OL_MASTER'     , displayName: '主號' },
                { name: 'OL_COUNTRY'    , displayName: '起運國別' },
                { name: 'PG_BAGNO'      , displayName: '袋號' },
                { name: 'PG_MOVED'      , displayName: '移機', cellFilter: 'booleanFilter', filter: 
                    {
                        term: null,
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: bool
                    }
                },
                // { name: 'PG_MOVE_USER'  , displayName: '移機人員', cellFilter: 'userInfoFilter', cellTooltip: function (row, col) 
                //     {
                //         return '移機時間:' + $filter('datetimeFilter')(row.entity.PG_MOVE_DATETIME)
                //     }, 
                //     filter: {
                //         term: null,
                //         type: uiGridConstants.filter.SELECT,
                //         selectOptions: userInfo
                //     } 
                // },
                { name: 'PG_FLIGHTNO'   , displayName: '航班(改)' },
                { name: 'PG_MASTER'     , displayName: '主號(改)' },
                { name: 'PG_REASON'     , displayName: '拉貨原因', cellTooltip: function (row, col) 
                    {
                        return row.entity.PG_REASON
                    } 
                },
                { name: 'W2_STATUS'   ,  displayName: '報機單狀態', cellTemplate: $templateCache.get('accessibilityToForW2'), filter: 
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
                { name: 'ITEM_LIST'     , displayName: '報機單', enableFiltering: false, enableSorting: false, width: '8%', cellTemplate: $templateCache.get('accessibilityToOperaForJob001') },
                { name: 'Options'       , displayName: '操作', width: '8%', enableFiltering: false, enableSorting: false, cellTemplate: $templateCache.get('accessibilityToVForPullGoods') }
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

    function LoadFlightArrival(){
        RestfulApi.SearchMSSQLData({
            querymain: 'assistantJobs',
            queryname: 'SelectFlightArrival',
            params: {
                FA_FLIGHTDATE : $filter('date')(new Date(), 'yyyy-MM-dd')
            }
        }).then(function (res){
            // console.log(res["returnData"]);
            for(var i=0;i<res["returnData"].length;i++){
                res["returnData"][i]["Index"] = i+1;
            }
            $vm.flightArrivalData = res["returnData"];
        }); 
    };

    function LoadFlightItem(){
        RestfulApi.SearchMSSQLData({
            querymain: 'assistantJobs',
            queryname: 'SelectOrderList'
        }).then(function (res){
            // console.log(res["returnData"]);
            for(var i=0;i<res["returnData"].length;i++){
                res["returnData"][i]["Index"] = i+1;
            }
            $vm.flightItemData = res["returnData"];

            // var _showFixMaster = false,
            //     _fixMasterCount = 0;
            // for(var i in $vm.flightItemData){
            //     if($vm.flightItemData[i].OL_MASTER == "" || $vm.flightItemData[i].OL_MASTER == null){
            //         _showFixMaster = true;
            //         _fixMasterCount += 1;
            //     }
            // }

            // if(_showFixMaster){
            //     toaster.pop('info', '訊息', '尚有 '+_fixMasterCount+' 單需主號待補', 3000);
            // }
        }); 
    };

    function LoadMasterToBeFilled(){
        RestfulApi.SearchMSSQLData({
            querymain: 'assistantJobs',
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
            querymain: 'assistantJobs',
            queryname: 'SelectPullGoods'
        }).then(function (res){
            // console.log(res["returnData"]);
            $vm.pullGoodsData = [];
            $vm.pullGoodsData = res["returnData"];
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
.controller('ModifyPullGoodsModalInstanceCtrl', function ($uibModalInstance) {
    var $ctrl = this;
    // $ctrl.mdData = angular.copy(items);
    $ctrl.mdData = {};

    $ctrl.ok = function() {
        $ctrl.mdData.FLIGHTNO_START = $ctrl.mdData.FLIGHTNO_START.toUpperCase();
        $ctrl.mdData.PG_FLIGHTNO = $ctrl.mdData.FLIGHTNO_START + ' ' + $ctrl.mdData.FLIGHTNO_END;

        $uibModalInstance.close($ctrl.mdData);
    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
})
.controller('ViewReasonModalInstanceCtrl', function ($uibModalInstance, items) {
    var $ctrl = this;
    $ctrl.mdData = angular.copy(items);

    $ctrl.ok = function() {
        $uibModalInstance.close($ctrl.mdData);
    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
})
.controller('ViewDetailModalInstanceCtrl', function ($uibModalInstance, RestfulApi, items) {
    var $ctrl = this;

    $ctrl.Init = function(){
        RestfulApi.SearchMSSQLData({
            querymain: 'assistantJobs',
            queryname: 'SelectBagNoDetail',
            params: {
                IL_SEQ: items.PG_SEQ,
                IL_BAGNO: items.PG_BAGNO
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
            { name: 'Index'           , displayName: '序列', width: 50},
            { name: 'IL_G1'           , displayName: '報關種類', width: 80 },
            { name: 'IL_MERGENO'      , displayName: '併票號', width: 80 },
            { name: 'IL_BAGNO'        , displayName: '袋號', width: 80 },
            { name: 'IL_SMALLNO'      , displayName: '小號', width: 110 },
            { name: 'IL_NATURE'       , displayName: '品名', width: 120 },
            { name: 'IL_NATURE_NEW'   , displayName: '新品名', width: 120 },
            { name: 'IL_CTN'          , displayName: '件數', width: 50 },
            { name: 'IL_PLACE'        , displayName: '產地', width: 50 },
            { name: 'IL_NEWPLACE'     , displayName: '新產地', width: 70 },
            { name: 'IL_WEIGHT'       , displayName: '重量', width: 70 },
            { name: 'IL_WEIGHT_NEW'   , displayName: '新重量', width: 70 },
            { name: 'IL_PCS'          , displayName: '數量', width: 70 },
            { name: 'IL_NEWPCS'       , displayName: '新數量', width: 70 },
            { name: 'IL_UNIVALENT'    , displayName: '單價', width: 70 },
            { name: 'IL_UNIVALENT_NEW', displayName: '新單價', width: 70 },
            { name: 'IL_FINALCOST'    , displayName: '完稅價格', width: 80 },
            { name: 'IL_UNIT'         , displayName: '單位', width: 70 },
            { name: 'IL_NEWUNIT'      , displayName: '新單位', width: 70 },
            { name: 'IL_GETNO'        , displayName: '收件者統編', width: 100 },
            { name: 'IL_EXNO'         , displayName: '匯出統編', width: 80 },
            { name: 'IL_SENDNAME'     , displayName: '寄件人', width: 80 },
            { name: 'IL_NEWSENDNAME'  , displayName: '新寄件人', width: 80 },
            { name: 'IL_TAX'          , displayName: '稅費歸屬', width: 80 },
            { name: 'IL_GETNAME'      , displayName: '收件人公司', width: 100 },
            { name: 'IL_GETNAME_NEW'  , displayName: '新收件人公司', width: 100 },
            { name: 'IL_GETADDRESS'   , displayName: '收件地址', width: 300 },
            { name: 'IL_GETADDRESS_NEW', displayName: '新收件地址', width: 300 },
            { name: 'IL_GETTEL'       , displayName: '收件電話', width: 100 },
            { name: 'IL_EXTEL'        , displayName: '匯出電話', width: 100 },
            { name: 'IL_TRCOM'        , displayName: '派送公司', width: 100 },
            { name: 'IL_REMARK'       , displayName: '備註', width: 100 },
            { name: 'IL_TAX2'         , displayName: '稅則', width: 100 }
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
.controller('AddOrderListModalInstanceCtrl', function ($uibModalInstance, items, compy) {
    var $ctrl = this;

    $ctrl.Init = function(){
        var _flightNo = items.OL_FLIGHTNO != null ? items.OL_FLIGHTNO.split(' ') : [];

        if(_flightNo.length == 2){
            items.FLIGHTNO_START = _flightNo[0];
            items.FLIGHTNO_END = _flightNo[1];
        }

        $ctrl.mdData = angular.copy(items);
        $ctrl.compy = compy;
    }

    $ctrl.ok = function() {

        if($ctrl.mdData.FLIGHTNO_START && $ctrl.mdData.FLIGHTNO_END){
            $ctrl.mdData.FLIGHTNO_START = $ctrl.mdData.FLIGHTNO_START.toUpperCase();
            $ctrl.mdData.OL_FLIGHTNO = $ctrl.mdData.FLIGHTNO_START + ' ' + $ctrl.mdData.FLIGHTNO_END;
        }


        if($ctrl.mdData.OL_COUNTRY){
            $ctrl.mdData.OL_COUNTRY = $ctrl.mdData.OL_COUNTRY.toUpperCase();
        }

        $uibModalInstance.close($ctrl.mdData);
    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
});