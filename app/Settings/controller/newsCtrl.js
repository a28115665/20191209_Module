"use strict";

angular.module('app.settings').controller('NewsCtrl', function ($scope, $stateParams, $state, RestfulApi, Session, toaster, $uibModal, $filter, bool, ioType, FileUploader, SUMMERNOT_CONFIG) {
    
    // console.log($stateParams);
    var $vm = this,
        _tasks = [],
        _d = new Date(),
        _filepath = _d.getFullYear() + '\\' + ("0" + (_d.getMonth()+1)).slice(-2) + '\\' + ("0" + _d.getDate()).slice(-2) + '\\';

    angular.extend(this, {
        Init : function(){
            // 不正常登入此頁面
            // if($stateParams.data == null) ReturnToBillboardEditorPage();
            if($stateParams.data == null){
                $vm.vmData = {
                    BB_STICK_TOP : false,
                    BB_IO_TYPE : "All",
                    BB_CONTENT : "",
                    UploadedData : [],
                    IU : "Add"
                }
            }else{
                $vm.vmData = $stateParams.data;
                $vm.vmData["IU"] = "Update";

                _d = $vm.vmData["BB_CR_DATETIME"].replace(/\Z/g, '');

                LoadBBPG();
                LoadBBAF();
            }
        },
        profile : Session.Get(),
        boolData : bool,
        ioTypeData : ioType,
        snOptions : SUMMERNOT_CONFIG,
        uploader : new FileUploader({
            url: '/toolbox/uploadFile?filePath='+_filepath
        }),
        AddPostGoal : function (){
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'addPostGoalModalContent.html',
                controller: 'AddPostGoalModalInstanceCtrl',
                controllerAs: '$ctrl',
                size: 'lg',
                // appendTo: parentElem,
                resolve: {
                    vmData: function(){
                        return $vm.vmData;
                    },
                    ioType: function(SysCode){
                        return SysCode.get('IOType');
                    }
                }
            });

            modalInstance.result.then(function(selectedItem) {
                // console.log(selectedItem);
                $vm.vmData.PostGoal = angular.copy(selectedItem);
                console.log($vm.vmData);
            }, function() {
                // $log.info('Modal dismissed at: ' + new Date());
            });

        },
        /**
         * [DeleteUploaded description] 刪除已上傳檔案
         * @param {[type]} pDeleteUploaded [description] 檔案
         * @param {[type]} pIndex          [description] array index
         */
        DeleteUploaded : function(pDeleteUploaded, pIndex){
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
                        return pDeleteUploaded;
                    },
                    show: function(){
                        return {
                            title : "是否刪除"
                        };
                    }
                }
            });

            modalInstance.result.then(function(selectedItem) {
                // console.log(selectedItem);

                RestfulApi.UpdateMSSQLData({
                    updatename: 'Update',
                    table: 2,
                    params: {
                        BBAF_SOFT_DELETE : true
                    },
                    condition: {
                        BBAF_ID : selectedItem.BBAF_ID
                    }
                }).then(function (res) {
                    $vm.vmData.UploadedData.splice(pIndex, 1);
                }, function (err) {

                });
            }, function() {
                // $log.info('Modal dismissed at: ' + new Date());
            });
        },
        Return : function(){
            ReturnToBillboardEditorPage();
        },
        Add : function(){
            console.log($vm.vmData);

            // Insert 主表
            _tasks.push({
                crudType: 'Insert',
                table: 1,
                params: {
                    BB_TITLE : $vm.vmData.BB_TITLE,
                    BB_CONTENT : $vm.vmData.BB_CONTENT,
                    BB_POST_FROM : $vm.vmData.BB_POST_FROM,
                    BB_POST_TOXX : $vm.vmData.BB_POST_TOXX,
                    BB_STICK_TOP : $vm.vmData.BB_STICK_TOP,
                    BB_IO_TYPE : $vm.vmData.BB_IO_TYPE,
                    BB_CR_USER : $vm.profile.U_ID,
                    BB_CR_DATETIME : $filter('date')(_d, 'yyyy-MM-dd HH:mm:ss')
                }
            });

            // Insert 公佈對象
            for(var i in DeleteAndInsertPostGoal()){
                _tasks.push(DeleteAndInsertPostGoal()[i]);
            }

            // 有上傳檔案 先上傳檔案之後再Insert DB
            if($vm.uploader.getNotUploadedItems().length > 0){
                $vm.uploader.uploadAll();
            }
            // 無上傳檔案 直接Insert DB
            else{
                RestfulApi.CRUDMSSQLDataByTask(_tasks).then(function (res) {
                    console.log(res);
                    ReturnToBillboardEditorPage();
                }, function (err) {
                    console.log(err);
                });
            }
        },
        Update : function(){
            console.log($vm.vmData);

            // Update 主表
            _tasks.push({
                crudType: 'Update',
                table: 1,
                params: {
                    BB_TITLE : $vm.vmData.BB_TITLE,
                    BB_CONTENT : $vm.vmData.BB_CONTENT,
                    BB_POST_FROM : $vm.vmData.BB_POST_FROM,
                    BB_POST_TOXX : $vm.vmData.BB_POST_TOXX,
                    BB_STICK_TOP : $vm.vmData.BB_STICK_TOP,
                    BB_IO_TYPE : $vm.vmData.BB_IO_TYPE,
                    BB_UP_USER : $vm.profile.U_ID,
                    BB_UP_DATETIME : $filter('date')(_d, 'yyyy-MM-dd HH:mm:ss')
                },
                condition: {
                    BB_CR_USER : $vm.vmData.BB_CR_USER,
                    BB_CR_DATETIME : $vm.vmData.BB_CR_DATETIME
                }
            });

            // Delete And Insert 公佈對象
            for(var i in DeleteAndInsertPostGoal()){
                _tasks.push(DeleteAndInsertPostGoal()[i]);
            }

            // 有上傳檔案 先上傳檔案之後再Insert DB
            if($vm.uploader.getNotUploadedItems().length > 0){
                $vm.uploader.uploadAll();
            }
            // 無上傳檔案 直接Insert DB
            else{
                RestfulApi.CRUDMSSQLDataByTask(_tasks).then(function (res) {
                    console.log(res);
                    ReturnToBillboardEditorPage();
                }, function (err) {
                    console.log(err);
                });
            }
        }
    });

    // Upload Filters
    $vm.uploader.filters.push({
        name: 'queueFilter',
        fn: function(item /*{File|FileLikeObject}*/, options) {
            // return this.queue.length < $scope.optionParam.UploadQueue;
            return this.queue.length < 10;
        }
    });

    $vm.uploader.filters.push({
        name: 'sizeFilter',
        fn: function(item /*{File|FileLikeObject}*/, options) {
            // return item.size < $scope.optionParam.UploadSize * 1000 * 1000;
            return item.size < 10 * 1000 * 1000;
        }
    });

    // 處理已上傳的部分 : 當相同檔名時，不可上傳
    $vm.uploader.filters.push({
        name: 'nameFilter',
        fn: function(item /*{File|FileLikeObject}*/, options) {
            var uploadedDataLength = ($filter('filter')($vm.vmData.UploadedData, {BBAF_O_FILENAME: item.name})).length;
            
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

    // $vm.uploader.filters.push({
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
    $vm.uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
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
    $vm.uploader.onAfterAddingFile = function(fileItem) {
        console.info('onAfterAddingFile', fileItem);
        var reader = new FileReader();

        reader.onload = function(readerEvt) {
            var data = readerEvt.target.result;
            var fileNameArray = fileItem.file.name.split(".");
            var queueIndex = $vm.uploader.queue.indexOf(fileItem);
            var rename = angular.copy(CryptoJS.MD5(data).toString() + "." + fileNameArray[fileNameArray.length-1]);
            
            // Duplicate File
            // if($filter('filter')($scope.duplicateFile, rename).length > 0){
            //     $vm.uploader.queue[queueIndex].remove();
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
    $vm.uploader.onAfterAddingAll = function(addedFileItems) {
        console.info('onAfterAddingAll', addedFileItems);
    };
    $vm.uploader.onBeforeUploadItem = function(item) {
        console.info('onBeforeUploadItem', item);
    };
    $vm.uploader.onProgressItem = function(fileItem, progress) {
        console.info('onProgressItem', fileItem, progress);
    };
    $vm.uploader.onProgressAll = function(progress) {
        console.info('onProgressAll', progress);
    };
    $vm.uploader.onSuccessItem = function(fileItem, response, status, headers) {
        console.info('onSuccessItem', fileItem, response, status, headers);
    };
    $vm.uploader.onErrorItem = function(fileItem, response, status, headers) {
        console.info('onErrorItem', fileItem, response, status, headers);
    };
    $vm.uploader.onCancelItem = function(fileItem, response, status, headers) {
        console.info('onCancelItem', fileItem, response, status, headers);
    };
    $vm.uploader.onCompleteItem = function(fileItem, response, status, headers) {
        console.info('onCompleteItem', fileItem, response, status, headers);
        if(status == 200){
            // 儲存每個上傳檔案的資訊
            _tasks.push({
                crudType: 'Insert',
                table: 2,
                params: {
                    BBAF_O_FILENAME : response.oFilename,
                    BBAF_R_FILENAME : response.rFilename,
                    BBAF_FILEPATH : response.Filepath,
                    BBAF_FILESIZE : response.Filesize,
                    BBAF_CR_USER : $vm.profile.U_ID,
                    BBAF_CR_DATETIME : $filter('date')(_d, 'yyyy-MM-dd HH:mm:ss')
                }
            });
        }else{
            toaster.pop('error', "檔案上傳失敗", response.oFilename, 3000);
        }
    };
    $vm.uploader.onCompleteAll = function() {
        console.info('onCompleteAll');

        RestfulApi.CRUDMSSQLDataByTask(_tasks).then(function (res) {
            console.log(res);
            ReturnToBillboardEditorPage();
        }, function (err) {
            console.log(err);
        });
    };

    var DeleteAndInsertPostGoal = function(){
        var _task = [];

        // 表示為Update
        if($vm.vmData.IU == "Update"){
            _task.push({
                crudType: 'Delete',
                table: 3,
                params: {
                    BBPG_CR_USER : $vm.vmData.BB_CR_USER,
                    BBPG_CR_DATETIME : $vm.vmData.BB_CR_DATETIME
                }
            });
        }

        for(var i in $vm.vmData["PostGoal"]){
            if($vm.vmData.BB_IO_TYPE == 'All'){
                _task.push({
                    crudType: 'Insert',
                    table: 3,
                    params: {
                        BBPG_CR_USER : $vm.profile.U_ID,
                        BBPG_CR_DATETIME : $filter('date')(_d, 'yyyy-MM-dd HH:mm:ss'),
                        BBPG_GOAL_ID : $vm.vmData.PostGoal[i].CODE
                    }
                });
            }else{
                // 當所有變成對內或對外時的判斷
                if($vm.vmData.PostGoal[i].IO_TYPE == $vm.vmData.BB_IO_TYPE){
                    _task.push({
                        crudType: 'Insert',
                        table: 3,
                        params: {
                            BBPG_CR_USER : $vm.profile.U_ID,
                            BBPG_CR_DATETIME : $filter('date')(_d, 'yyyy-MM-dd HH:mm:ss'),
                            BBPG_GOAL_ID : $vm.vmData.PostGoal[i].CODE
                        }
                    });
                }
            }
        }

        return _task;
    };

    function LoadBBPG(){
        RestfulApi.SearchMSSQLData({
            querymain: 'news',
            queryname: 'SelectBBPG',
            params: {
                BBPG_CR_USER: $vm.vmData.BB_CR_USER,
                BBPG_CR_DATETIME: $vm.vmData.BB_CR_DATETIME
            }
        }).then(function (res){
            console.log(res["returnData"]);
            $vm.vmData.PostGoal = res["returnData"];
        });
    };

    function LoadBBAF(){
        RestfulApi.SearchMSSQLData({
            querymain: 'news',
            queryname: 'SelectBBAF',
            params: {
                BBAF_CR_USER: $vm.vmData.BB_CR_USER,
                BBAF_CR_DATETIME: $vm.vmData.BB_CR_DATETIME
            }
        }).then(function (res){
            console.log(res["returnData"]);
            $vm.vmData.UploadedData = res["returnData"];
        });
    };

    function ReturnToBillboardEditorPage(){
        if(_tasks.length > 0){
            toaster.success("狀態", "資料上傳成功", 3000);    
        }
        $state.transitionTo("app.settings.billboardeditor");
    };
})
.controller('AddPostGoalModalInstanceCtrl', function ($uibModalInstance, vmData, RestfulApi, $timeout, $filter, ioType, uiGridConstants) {
    var $ctrl = this;
    $ctrl.mdData = [];

    $ctrl.MdInit = function (){
        // 拿掉All
        ioType.shift();

        var _request = null;

        switch(vmData.BB_IO_TYPE){ 
            case "In":
                _request = {
                    querymain: 'news',
                    queryname: 'SelectSysGroup'
                };
                break;
            case "Out":
                _request = {
                    querymain: 'news',
                    queryname: 'SelectCompyInfo'
                };
                break;
            case "All":
                _request = {
                    querymain: 'news',
                    queryname: 'SelectSysGroupUnionCompyInfo'
                };
                break;
        }

        if (_request == null) return;

        RestfulApi.SearchMSSQLData(_request).then(function (res){
            // console.log(res["returnData"]);
            $ctrl.mdData = res["returnData"];
            // 把已被選取的帳號打勾
            $timeout(function() {
                if($ctrl.mdDataGridApi.selection.selectRow){
                    for(var i in vmData.PostGoal){
                        $ctrl.mdDataGridApi.selection.selectRow($filter('filter')($ctrl.mdData, {CODE: vmData.PostGoal[i].CODE}, true)[0]);
                    }
                }
            });
        }).finally(function() {
            HandleWindowResize($vm.mdDataGridApi);
        });
    };

    $ctrl.mdDataOptions = {
        data:  '$ctrl.mdData',
        columnDefs: [
            { name: 'CODE'     , displayName: '系統代碼' },
            { name: 'NAME'     , displayName: '名稱' },
            { name: 'IO_TYPE'  , displayName: '公佈類型', cellFilter: 'ioTypeFilter', filter: 
                {
                    term: null,
                    type: uiGridConstants.filter.SELECT,
                    selectOptions: ioType
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