"use strict";

angular.module('app.selfwork').controller('Job002Ctrl', function ($scope, $stateParams, $state, AuthApi, Session, toaster, $uibModal, $templateCache, RestfulApi, uiGridConstants, $filter, $q, ToolboxApi) {
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
                //         OL_SEQ : 'Co0001Co000120170712205825'
                //     };
                // }
                
                LoadFlightItemList();
            }
        },
        profile : Session.Get(),
        defaultChoice : 'Left',
        job002Options : {
            data: '$vm.job002Data',
            columnDefs: [
                // { name: 'Index'           , displayName: '序列', width: 50, enableCellEdit: false, enableFiltering: false, headerCellClass: 'text-muted'},
                { name: 'FLL_ITEM'        , displayName: '序號', enableCellEdit: false },
                { name: 'BAGNO_MATCH'     , displayName: '內貨', enableCellEdit: false, cellTemplate: $templateCache.get('accessibilityToInternalGoods'), filter: 
                    {
                        term: null,
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: [
                            {label:'否', value: '0'},
                            {label:'是', value: '1'}
                        ]
                    }
                },
                { name: 'FLL_BAGNO'       , displayName: '袋號', headerCellClass: 'text-primary' },
                { name: 'FLL_CTN'         , displayName: '件數', headerCellClass: 'text-primary', aggregationType: uiGridConstants.aggregationTypes.sum },
                { name: 'FLL_WEIGHT'      , displayName: '重量', headerCellClass: 'text-primary', aggregationType: uiGridConstants.aggregationTypes.sum, footerCellFilter: 'number: 2' },
                { name: 'FLL_DESCRIPTION' , displayName: '品名', headerCellClass: 'text-primary' },
                { name: 'FLL_DECLAREDNO'  , displayName: '宣告序號', headerCellClass: 'text-primary' },
                { name: 'FLL_REMARK'      , displayName: '備註', headerCellClass: 'text-primary' }
            ],
            enableFiltering: true,
            enableSorting: true,
            enableColumnMenus: false,
            // enableVerticalScrollbar: false,
		    enableRowSelection: true,
    		enableSelectAll: true,
            showColumnFooter: true,
            // paginationPageSizes: [50, 100, 150, 200, 250, 300],
            // paginationPageSize: 100,
            onRegisterApi: function(gridApi){
                $vm.job002GridApi = gridApi;

                gridApi.rowEdit.on.saveRow($scope, $vm.Update);
            }
        },
        // 修改品名
        ModifyDescription: function(){

            if($vm.job002GridApi.selection.getSelectedRows().length > 0){
                var modalInstance = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'modifyDescriptionModalContent.html',
                    controller: 'ModifyDescriptionModalInstanceCtrl',
                    controllerAs: '$ctrl',
                    // size: 'lg',
                    // appendTo: parentElem,
                });

                modalInstance.result.then(function(selectedItem) {
                    // console.log(selectedItem);

                    var _tasks = [];

                    for(var i in $vm.job002GridApi.selection.getSelectedRows()){
                        _tasks.push({
                            crudType: 'Update',
                            table: 10,
                            params: {
                                FLL_DESCRIPTION : selectedItem.FLL_DESCRIPTION,
                                FLL_UP_USER     : $vm.profile.U_ID,
                                FLL_UP_DATETIME : $filter('date')(new Date, 'yyyy-MM-dd HH:mm:ss')
                            },
                            condition: {
                                FLL_SEQ         : $vm.job002GridApi.selection.getSelectedRows()[i].FLL_SEQ,
                                FLL_IL_NEWBAGNO : $vm.job002GridApi.selection.getSelectedRows()[i].FLL_IL_NEWBAGNO
                            }
                        })
                    }
                    console.log(_tasks);

                    RestfulApi.CRUDMSSQLDataByTask(_tasks).then(function (res){
                        if(res["returnData"].length > 0){

                            LoadFlightItemList();
                            toaster.pop('success', '訊息', '更新成功', 3000);
                        }
                    }, function (err) {
                        toaster.pop('error', '錯誤', '更新失敗', 3000);
                    }).finally(function(){
                        $vm.job002GridApi.selection.clearSelectedRows();
                    }); 

                }, function() {
                    // $log.info('Modal dismissed at: ' + new Date());
                });
            }else{
                toaster.pop('info', '訊息', '未選擇需要被更新的項目', 3000);
            }
        },
        // 新增
        Add: function(){

            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'addItemModalContent.html',
                controller: 'AddItemModalInstanceCtrl',
                controllerAs: '$ctrl',
                // size: 'lg',
                // appendTo: parentElem,
                resolve: {
                    items: function() {
                        return $vm.job002Data;
                    }
                }
            });

            modalInstance.result.then(function(selectedItem) {
                // console.log(selectedItem);

                selectedItem["FLL_CR_USER"] = $vm.profile.U_ID;
                selectedItem["FLL_CR_DATETIME"] = $filter('date')(new Date, 'yyyy-MM-dd HH:mm:ss');
                
                RestfulApi.InsertMSSQLData({
                    insertname: 'Insert',
                    table: 10,
                    params: selectedItem
                }).then(function (res) {
                    if(res["returnData"] == 1){
                        LoadFlightItemList();
                        toaster.pop('success', '訊息', '新增成功', 3000);
                    }
                });

            }, function() {
                // $log.info('Modal dismissed at: ' + new Date());
            });
        },
        // 刪除
        Delete: function(){
            if($vm.job002GridApi.selection.getSelectedRows().length > 0){

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
                                title : "是否刪除"
                            }
                        }
                    }
                });

                modalInstance.result.then(function(selectedItem) {

                    var _tasks = [];

                    for(var i in $vm.job002GridApi.selection.getSelectedRows()){
                        _tasks.push({
                            crudType: 'Delete',
                            table: 10,
                            params: {
                                FLL_SEQ         : $vm.job002GridApi.selection.getSelectedRows()[i].FLL_SEQ,
                                FLL_IL_NEWBAGNO : $vm.job002GridApi.selection.getSelectedRows()[i].FLL_IL_NEWBAGNO
                            }
                        })
                    }

                    RestfulApi.CRUDMSSQLDataByTask(_tasks).then(function (res){
                        if(res["returnData"].length > 0){

                            LoadFlightItemList();
                            toaster.pop('success', '訊息', '刪除成功', 3000);
                        }
                    }, function (err) {
                        toaster.pop('error', '錯誤', '刪除失敗', 3000);
                    }).finally(function(){
                        $vm.job002GridApi.selection.clearSelectedRows();
                    }); 

                }, function() {
                    // $log.info('Modal dismissed at: ' + new Date());
                });
            }else{
                toaster.pop('info', '訊息', '未選擇需要被刪除的項目', 3000);
            }
        },
        // 匯出Excel
        ExportExcel: function(){

            var _exportName = $filter('date')($vm.vmData.OL_IMPORTDT, 'yyyyMMdd', 'GMT') + ' ' + 
                              $vm.vmData.OL_MASTER + ' ' + 
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
                    OL_IMPORTDT    : $filter('date')($vm.vmData.OL_IMPORTDT, 'yyyy/MM/dd', 'GMT'),
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

        },
        // 底部編輯
        EditorRemark: function(){

            RestfulApi.SearchMSSQLData({
                querymain: 'job002',
                queryname: 'SelectRemark',
                params: {               
                    FLL_SEQ: $vm.vmData.OL_SEQ
                }
            }).then(function (res){
                console.log(res["returnData"]);
            
                var modalInstance = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'editorRemarkModalContent.html',
                    controller: 'EditorRemarkModalInstanceCtrl',
                    controllerAs: '$ctrl',
                    // size: 'sm',
                    // appendTo: parentElem,
                    resolve: {
                        items: function() {
                            return res["returnData"];
                        }
                    }
                });

                modalInstance.result.then(function(selectedItem) {

                    console.log(selectedItem);

                    var _tasks = [];

                    _tasks.push({
                        crudType: 'Delete',
                        table: 28,
                        params: {
                            FLLR_SEQ : $vm.vmData.OL_SEQ
                        }
                    })

                    for(var i in selectedItem){
                        _tasks.push({
                            crudType: 'Insert',
                            table: 28,
                            params: {
                                FLLR_SEQ         : $vm.vmData.OL_SEQ,
                                FLLR_ROWINDEX    : i,
                                FLLR_REMARK      : selectedItem[i].text,
                                FLLR_CR_USER     : $vm.profile.U_ID,
                                FLLR_CR_DATETIME : $filter('date')(new Date, 'yyyy-MM-dd HH:mm:ss')
                            }
                        })
                    }

                    RestfulApi.CRUDMSSQLDataByTask(_tasks).then(function (res){
                        if(res["returnData"].length > 0){

                            toaster.pop('success', '訊息', '底部編輯成功', 3000);
                        }
                    }, function (err) {
                        toaster.pop('error', '錯誤', '底部編輯失敗', 3000);
                    });

                }, function() {
                    // $log.info('Modal dismissed at: ' + new Date());
                });
            }); 
        },
        // 寄信
        SendMail: function(){

            RestfulApi.SearchMSSQLData({
                querymain: 'aviationMail',
                queryname: 'SelectFlightMailPair',
                params: {
                    FMP_FLIGHTNO : $vm.vmData.OL_FLIGHTNO
                }
            }).then(function (res){
                // console.log(res["returnData"]);

                var modalInstance = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'choiceMailModalContent.html',
                    controller: 'ChoiceMailModalInstanceCtrl',
                    controllerAs: '$ctrl',
                    size: 'lg',
                    backdrop: 'static',
                    resolve: {
                        items: function() {
                            return res["returnData"];
                        }
                    }
                });

                modalInstance.result.then(function(selectedItem) {
                    // console.log(selectedItem);
                    var _flightMail = selectedItem;

                    modalInstance = $uibModal.open({
                        animation: true,
                        ariaLabelledBy: 'modal-title',
                        ariaDescribedBy: 'modal-body',
                        templateUrl: 'sendMailModalContent.html',
                        controller: 'SendMailModalInstanceCtrl',
                        controllerAs: '$ctrl',
                        size: 'lg',
                        backdrop: 'static',
                        resolve: {
                            items: function() {
                                return _flightMail;
                            },
                            data: function(){

                                var _exportName = $filter('date')($vm.vmData.OL_IMPORTDT, 'yyyyMMdd', 'GMT') + ' ' + 
                                                  $filter('compyFilter')($vm.vmData.OL_CO_CODE) + ' ' + 
                                                  $vm.vmData.OL_FLIGHTNO;

                                $vm.vmData["_exportName"] = _exportName;
                                $vm.vmData["OL_IMPORTDT"] = $filter('date')($vm.vmData.OL_IMPORTDT, 'yyyy-MM-dd', 'GMT');
                                $vm.vmData["OL_TOTALBAG"] = $vm.job002GridApi.grid.columns[4].getAggregationValue();
                                $vm.vmData["OL_TOTALWEIGHT"] = $vm.job002GridApi.grid.columns[5].getAggregationValue().toFixed(2);

                                return $vm.vmData;
                            },
                            profile: function(){
                                return $vm.profile
                            }
                        }
                    });

                    modalInstance.result.then(function(selectedItem) {
                        console.log(_flightMail);

                        if(selectedItem == "ok"){

                            RestfulApi.InsertMSSQLData({
                                insertname: 'Insert',
                                table: 31,
                                params: {
                                    FML_SEQ : $vm.vmData.OL_SEQ,
                                    FML_SENDER  : $vm.profile.U_ID,
                                    FML_SEND_DATETIME : $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                                    FML_CR_USER : _flightMail[0].FM_CR_USER,
                                    FML_CR_DATETIME : _flightMail[0].FM_CR_DATETIME
                                }
                            }).then(function(_res) {

                                if(_res["returnData"] == 1){
                                    toaster.pop('success', '訊息', '寄信成功', 3000);
                                }

                            });
                            
                        }else{
                            toaster.pop('error', '錯誤', '寄信失敗', 3000);
                        }
                    }, function() {
                        // $log.info('Modal dismissed at: ' + new Date());
                    });

                }, function() {
                    // $log.info('Modal dismissed at: ' + new Date());
                });
            }); 
        },
        Return : function(){
            ReturnToEmployeejobsPage();
        },
        Update : function(entity){
            // create a fake promise - normally you'd use the promise returned by $http or $resource
            var promise = $q.defer();
            $vm.job002GridApi.rowEdit.setSavePromise( entity, promise.promise );
         
            RestfulApi.UpdateMSSQLData({
                updatename: 'Update',
                table: 10,
                params: {
                    // FLL_ITEM         : entity.FLL_ITEM,
                    FLL_BAGNO        : entity.FLL_BAGNO,
                    FLL_CTN          : entity.FLL_CTN,
                    FLL_WEIGHT       : entity.FLL_WEIGHT,
                    FLL_DESCRIPTION  : entity.FLL_DESCRIPTION,
                    FLL_DECLAREDNO   : entity.FLL_DECLAREDNO,
                    FLL_REMARK       : entity.FLL_REMARK
                },
                condition: {
                    FLL_SEQ         : entity.FLL_SEQ,
                    FLL_IL_NEWBAGNO : entity.FLL_IL_NEWBAGNO
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
            querymain: 'job002',
            queryname: 'SelectFlightItemList',
            params: {
                FLL_SEQ: $vm.vmData.OL_SEQ
            }
        }).then(function (res){
            console.log(res["returnData"]);
            // for(var i=0;i<res["returnData"].length;i++){
            //     res["returnData"][i]["Index"] = i+1;
            // }
            $vm.job002Data = res["returnData"];
        }).finally(function() {
            HandleWindowResize($vm.job002GridApi);
        }); 
    };

    function ReturnToEmployeejobsPage(){
        $state.transitionTo($state.current.parent);
    };

})
.controller('ModifyDescriptionModalInstanceCtrl', function ($uibModalInstance) {
    var $ctrl = this;

    $ctrl.Init = function(){
        $ctrl.mdData = {
            FLL_DESCRIPTION : "CHANDLERY"
        };
    }

    $ctrl.ok = function() {
        $uibModalInstance.close($ctrl.mdData);
    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
})
.controller('AddItemModalInstanceCtrl', function ($uibModalInstance, items) {
    var $ctrl = this;

    $ctrl.Init = function(){
        var _length = items.length;
        if(_length > 0){
            var _temp = items[_length-1];
            $ctrl.mdData = {
                FLL_SEQ : _temp.FLL_SEQ,
                FLL_ITEM : parseInt(_temp.FLL_ITEM) + 1,
                FLL_IL_NEWBAGNO : _temp.FLL_SEQ + padLeft("0" + parseInt(_temp.FLL_ITEM), 3),
                FLL_DESCRIPTION : "CHANDLERY",
                FLL_DECLAREDNO : "",
                FLL_REMARK : "請進遠雄快遞倉"
            };
        }
    }

    $ctrl.ok = function() {
        $uibModalInstance.close($ctrl.mdData);
    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
})
.controller('EditorRemarkModalInstanceCtrl', function ($uibModalInstance, items) {
    var $ctrl = this;

    $ctrl.Init = function(){
        $ctrl.mdData = [];

        for(var i in items){
            $ctrl.mdData.push({
                id : i,
                text : items[i].FLLR_REMARK
            });
        }
    }

    $ctrl.ok = function() {
        $uibModalInstance.close($ctrl.mdData);
    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
})
.controller('ChoiceMailModalInstanceCtrl', function ($uibModalInstance, $filter, $timeout, items) {
    var $ctrl = this;
    $ctrl.mdData = items;

    // 把已被選取的郵件目標打勾
    $timeout(function() {
        if($ctrl.mdDataGridApi.selection.selectRow){
            $ctrl.mdDataGridApi.selection.selectRow($filter('filter')($ctrl.mdData, {isChoice: 1}, true)[0]);
        }
    });

    $ctrl.mdDataOptions = {
        data:  '$ctrl.mdData',
        columnDefs: [
            { name: 'FM_TARGET', displayName: '目標名稱', width: '100' },
            { name: 'FM_MAIL'  , displayName: '信箱' }
        ],
        enableFiltering: true,
        enableSorting: true,
        enableColumnMenus: false,
        multiSelect: false,
        // enableVerticalScrollbar: false,
        paginationPageSizes: [10, 25, 50, 100],
        paginationPageSize: 100,
        onRegisterApi: function(gridApi){
            $ctrl.mdDataGridApi = gridApi;
        }
    }

    $ctrl.ok = function() {
        $uibModalInstance.close($ctrl.mdDataGridApi.selection.getSelectedRows());
    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
})
.controller('SendMailModalInstanceCtrl', function ($uibModalInstance, RestfulApi, ToolboxApi, SUMMERNOT_CONFIG, $filter, FileUploader, items, data, profile) {
    var $ctrl = this,
        _d = new Date(),
        _filepath = _d.getFullYear() + '\\' + ("0" + (_d.getMonth()+1)).slice(-2) + '\\' + ("0" + _d.getDate()).slice(-2) + '\\';

    $ctrl.Init = function(){
        var _mail = angular.copy(items[0].FM_MAIL.split(";"));
        items[0].FM_MAIL = [];
        for(var i in _mail){
            items[0].FM_MAIL.push({
                text : _mail[i]
            });
        }

        $ctrl.mdData = angular.copy(items[0]);
        $ctrl.snOptions = SUMMERNOT_CONFIG;

        LoadFMAF();
    }

    $ctrl.uploader = new FileUploader({
        url: '/toolbox/uploadFile?filePath='+_filepath
    })

    // Upload Filters
    $ctrl.uploader.filters.push({
        name: 'queueFilter',
        fn: function(item /*{File|FileLikeObject}*/, options) {
            // return this.queue.length < $scope.optionParam.UploadQueue;
            return this.queue.length < 10;
        }
    });

    $ctrl.uploader.filters.push({
        name: 'sizeFilter',
        fn: function(item /*{File|FileLikeObject}*/, options) {
            // return item.size < $scope.optionParam.UploadSize * 1000 * 1000;
            return item.size < 10 * 1000 * 1000;
        }
    });

    // 處理已上傳的部分 : 當相同檔名時，不可上傳
    $ctrl.uploader.filters.push({
        name: 'nameFilter',
        fn: function(item /*{File|FileLikeObject}*/, options) {
            var uploadedDataLength = ($filter('filter')($ctrl.mdData.UploadedData, {FMAF_O_FILENAME: item.name})).length;
            
            if(uploadedDataLength > 0){
                toaster.pop('info', "訊息", "已上傳過相同的檔名。", 3000);
                return false;
            }else{
                return true;
            }
        }
    });

    // 處理未上傳的部分 : 當相同檔名時，不可上傳
    FileUploader.FileSelect.prototype.isEmptyAfterSelection = function() {
        return false;
    };

    // $ctrl.uploader.filters.push({
    //     name: 'fileFilter',
    //     fn: function(item /*{File|FileLikeObject}*/, options) {
    //         var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|',
    //             typeStr = "|";
    //         for(var i in $scope.optionParam.UploadType){
    //             typeStr += $scope.optionParam.UploadType[i] + "|";
    //         }
    //         return typeStr.indexOf(type) !== -1;
    //     }
    // });

    // Upload Callback Methods
    $ctrl.uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
        console.info('onWhenAddingFileFailed', item, filter, options);
        // var title = "", msg;
        // switch(filter.name){
        //     case "fileFilter":
        //         title = item.name;
        //         msg = "檔案類型錯誤。";
        //         break;
        //     case "sizeFilter":
        //         title = item.name;
        //         msg = "上傳檔案超過" + $scope.optionParam.UploadSize + "Mb。";
        //         break;
        //     case "queueFilter":
        //         msg = "上傳數量超過" + $scope.optionParam.UploadQueue + "個。";
        //         break;
        // }
        // toaster.pop('info', title, msg, 3000);
    };
    $ctrl.uploader.onAfterAddingFile = function(fileItem) {
        console.info('onAfterAddingFile', fileItem);
        var reader = new FileReader();

        reader.onload = function(readerEvt) {
            var data = readerEvt.target.result;
            var fileNameArray = fileItem.file.name.split(".");
            var queueIndex = $ctrl.uploader.queue.indexOf(fileItem);
            var rename = angular.copy(CryptoJS.MD5(data).toString() + "." + fileNameArray[fileNameArray.length-1]);
            
            // Duplicate File
            // if($filter('filter')($scope.duplicateFile, rename).length > 0){
            //     $ctrl.uploader.queue[queueIndex].remove();
            //     toaster.pop('info', '上傳檔案重複', fileItem.file["name"], 3000);
            // }else{
                // $scope.duplicateFile.push(rename);
                // $scope.queueFile.push(rename);
                fileItem.url += '&rFilename='+rename;
            // }
            // var dataFile = forumService.b64toBlob(btoa(data), fileItem.file.type);
            // fileItem.file = dataFile;
        };

        reader.readAsBinaryString(fileItem._file);
    };
    $ctrl.uploader.onAfterAddingAll = function(addedFileItems) {
        console.info('onAfterAddingAll', addedFileItems);
    };
    $ctrl.uploader.onBeforeUploadItem = function(item) {
        console.info('onBeforeUploadItem', item);
    };
    $ctrl.uploader.onProgressItem = function(fileItem, progress) {
        console.info('onProgressItem', fileItem, progress);
    };
    $ctrl.uploader.onProgressAll = function(progress) {
        console.info('onProgressAll', progress);
    };
    $ctrl.uploader.onSuccessItem = function(fileItem, response, status, headers) {
        console.info('onSuccessItem', fileItem, response, status, headers);
    };
    $ctrl.uploader.onErrorItem = function(fileItem, response, status, headers) {
        console.info('onErrorItem', fileItem, response, status, headers);
    };
    $ctrl.uploader.onCancelItem = function(fileItem, response, status, headers) {
        console.info('onCancelItem', fileItem, response, status, headers);
    };
    $ctrl.uploader.onCompleteItem = function(fileItem, response, status, headers) {
        console.info('onCompleteItem', fileItem, response, status, headers);
        if(status == 200){
            // 儲存使用者每個上傳檔案的資訊
            $ctrl.mdData.UserUploadedData.push({
                FMAF_O_FILENAME : response.oFilename,
                FMAF_R_FILENAME : response.rFilename,
                FMAF_FILEPATH : response.Filepath,
                FMAF_FILESIZE : response.Filesize,
                FMAF_CR_USER : profile.U_ID,
                FMAF_CR_DATETIME : $filter('date')(_d, 'yyyy-MM-dd HH:mm:ss')
            });
        }else{
            toaster.pop('error', "檔案上傳失敗", response.oFilename, 3000);
        }
    };
    $ctrl.uploader.onCompleteAll = function() {
        console.info('onCompleteAll');

        SendMail();
    };
    
    function LoadFMAF(){
        RestfulApi.SearchMSSQLData({
            querymain: 'targetEditor',
            queryname: 'SelectFMAF',
            params: {
                FMAF_CR_USER: $ctrl.mdData.FM_CR_USER,
                FMAF_CR_DATETIME: $ctrl.mdData.FM_CR_DATETIME
            }
        }).then(function (res){
            // console.log(res["returnData"]);
            // 信件預設檔案
            $ctrl.mdData.UploadedData = res["returnData"];

            // 使用者上傳檔案
            $ctrl.mdData.UserUploadedData = [];
        });
    }; 
    
    function SendMail(){
        ToolboxApi.SendMail({
            mailContent : $ctrl.mdData
            // queryContent : data
        }).then(function (res) {
            // console.log(res["returnData"]);
            $uibModalInstance.close(res["returnData"]);
        }).finally(function(){
            $ctrl.sending = false;
        });
    }

    $ctrl.ok = function() {

        $ctrl.sending = true;

        // 有上傳檔案 先上傳檔案之後再寄信
        if($ctrl.uploader.getNotUploadedItems().length > 0){
            $ctrl.uploader.uploadAll();
        }
        // 無上傳檔案 直接寄信
        else{
            SendMail();
        }

    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
});