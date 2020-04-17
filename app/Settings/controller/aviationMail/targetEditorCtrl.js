"use strict";

angular.module('app.settings').controller('TargetEditorCtrl', function ($scope, $stateParams, $state, AuthApi, Session, toaster, $uibModal, $templateCache, RestfulApi, $filter, $q, FileUploader, SUMMERNOT_CONFIG, bool) {
    
    var $vm = this,
        _tasks = [],
        _d = new Date(),
        _filepath = _d.getFullYear() + '\\' + ("0" + (_d.getMonth()+1)).slice(-2) + '\\' + ("0" + _d.getDate()).slice(-2) + '\\';

	angular.extend(this, {
        Init : function(){
            if($stateParams.data == null){
                $vm.vmData = {
                    "IU" : "Add",
                    FM_DEFAULT_MASTER : false
                }
            }else{
                $vm.vmData = $stateParams.data;
                $vm.vmData["IU"] = "Update";

                var _mail = angular.copy($vm.vmData.FM_MAIL.split(";"));
                $vm.vmData.FM_MAIL = [];
                for(var i in _mail){
                    $vm.vmData.FM_MAIL.push({
                        text : _mail[i]
                    });
                }

                _d = $vm.vmData["FM_CR_DATETIME"].replace(/\Z/g, '');

                // 航空班機
                LoadFMP();

                // 附件
                LoadFMAF();

            }
            console.log($vm.vmData);
        },
        profile : Session.Get(),
        boolData : bool,
        snOptions : SUMMERNOT_CONFIG,
        uploader : new FileUploader({
            url: '/toolbox/uploadFile?filePath='+_filepath
        }),
        /**
         * [OnTagAdding description] 新增前檢查此航班是否已加入別的目標名稱
         * @param {[type]} $tag [description]
         */
        OnTagAdding : function($tag){
            // console.log($tag);

            return $q(function(resolve, reject) {

                RestfulApi.SearchMSSQLData({
                    querymain: 'targetEditor',
                    queryname: 'SelectFMP',
                    params: {
                        FMP_FLIGHTNO: $tag.text
                    }
                }).then(function (res){
                    var _data = res["returnData"] || [];
                    
                    if(_data.length > 0){
                        toaster.pop('warning', '警告', "郵件目標名稱「"+_data[0].FM_TARGET+"」已有航班「"+$tag.text+"」。", 3000);
                        reject(false);
                    }else{
                        resolve(true);
                    }

                });
            });
        },
        OnInvalidTag : function(){
            toaster.pop('warning', '警告', "航班輸入規則錯誤。", 3000);
        },
        Return : function(){
            ReturnToAviationMail();
        },
        Add : function(){
            var _mail = angular.copy($vm.vmData.FM_MAIL),
                _mailObjectToArray = [];
            for(var i in _mail){
                _mailObjectToArray.push(_mail[i].text);
            }

            // 檢查信件是否有資料
            if(_mailObjectToArray.length > 0){
                
                // Insert 主表
                _tasks.push({
                    crudType: 'Insert',
                    table: 24,
                    params: {
                        FM_TARGET : $vm.vmData.FM_TARGET,
                        FM_MAIL : _mailObjectToArray.join(";"),
                        FM_TITLE : $vm.vmData.FM_TITLE,
                        FM_CONTENT : $vm.vmData.FM_CONTENT,
                        FM_CR_USER : $vm.profile.U_ID,
                        FM_CR_DATETIME : $filter('date')(_d, 'yyyy-MM-dd HH:mm:ss')
                    }
                });

                // Insert 航空班機
                for(var i in $vm.vmData.FMP_FLIGHTNO){
                    _tasks.push({
                        crudType: 'Insert',
                        table: 34,
                        params: {
                            FMP_FLIGHTNO : $vm.vmData.FMP_FLIGHTNO[i].text,
                            // FMP_CR_USER : $vm.vmData.FM_CR_USER,
                            FMP_CR_USER : $vm.profile.U_ID,
                            FMP_CR_DATETIME : $filter('date')(_d, 'yyyy-MM-dd HH:mm:ss')
                        }
                    });
                }

                // 有上傳檔案 先上傳檔案之後再Insert DB
                if($vm.uploader.getNotUploadedItems().length > 0){
                    $vm.uploader.uploadAll();
                }
                // 無上傳檔案 直接Insert DB
                else{
                    RestfulApi.CRUDMSSQLDataByTask(_tasks).then(function (res) {
                        // console.log(res);
                        ReturnToAviationMail();

                        toaster.pop('success', '訊息', '新增目標成功', 3000);
                    }, function (err) {
                        console.log(err);
                    });
                }

                // RestfulApi.InsertMSSQLData({
                //     insertname: 'Insert',
                //     table: 24,
                //     params: {
                //         FM_TARGET : $vm.vmData.FM_TARGET,
                //         FM_MAIL : _mailObjectToArray.join(";"),
                //         FM_TITLE : $vm.vmData.FM_TITLE,
                //         FM_CONTENT : $vm.vmData.FM_CONTENT,
                //         FM_CR_USER : $vm.profile.U_ID,
                //         FM_CR_DATETIME : $filter('date')(_d, 'yyyy-MM-dd HH:mm:ss')
                //     }
                // }).then(function(res) {
                //     console.log(res);

                //     if(res["returnData"] == 1){
                //         ReturnToAviationMail();

                //         toaster.pop('success', '訊息', '新增目標成功', 3000);
                //     }

                // });
            }else{
                toaster.pop('error', '失敗', '沒有任何信件', 3000);
            }
        },
        Update : function(){
            console.log($vm.vmData);

            var _mail = angular.copy($vm.vmData.FM_MAIL),
                _mailObjectToArray = [];
            for(var i in _mail){
                _mailObjectToArray.push(_mail[i].text);
            }

            // 檢查信件是否有資料
            if(_mailObjectToArray.length > 0){

                // Update 主表
                _tasks.push({
                    crudType: 'Update',
                    table: 24,
                    params: {
                        FM_TARGET : $vm.vmData.FM_TARGET,
                        FM_MAIL : _mailObjectToArray.join(";"),
                        FM_TITLE : $vm.vmData.FM_TITLE,
                        FM_CONTENT : $vm.vmData.FM_CONTENT,
                        FM_DEFAULT_MASTER : $vm.vmData.FM_DEFAULT_MASTER,
                        FM_UP_USER : $vm.profile.U_ID,
                        FM_UP_DATETIME : $filter('date')(_d, 'yyyy-MM-dd HH:mm:ss')
                    },
                    condition: {
                        FM_CR_USER : $vm.vmData.FM_CR_USER,
                        FM_CR_DATETIME : $vm.vmData.FM_CR_DATETIME
                    }
                });

                // Delete 航空班機
                _tasks.push({
                    crudType: 'Delete',
                    table: 34,
                    params: {
                        FMP_CR_USER : $vm.vmData.FM_CR_USER,
                        FMP_CR_DATETIME : $filter('date')(_d, 'yyyy-MM-dd HH:mm:ss')
                    }
                });

                // Insert 航空班機
                for(var i in $vm.vmData.FMP_FLIGHTNO){
                    _tasks.push({
                        crudType: 'Insert',
                        table: 34,
                        params: {
                            FMP_FLIGHTNO : $vm.vmData.FMP_FLIGHTNO[i].text,
                            FMP_CR_USER : $vm.vmData.FM_CR_USER,
                            FMP_CR_DATETIME : $filter('date')(_d, 'yyyy-MM-dd HH:mm:ss')
                        }
                    });
                }

                // 有上傳檔案 先上傳檔案之後再Insert DB
                if($vm.uploader.getNotUploadedItems().length > 0){
                    $vm.uploader.uploadAll();
                }
                // 無上傳檔案 直接Insert DB
                else{
                    RestfulApi.CRUDMSSQLDataByTask(_tasks).then(function (res) {
                        console.log(res);

                        ReturnToAviationMail();

                        toaster.pop('success', '訊息', '更新目標成功', 3000);
                    }, function (err) {
                        console.log(err);
                    });
                }

                // RestfulApi.UpdateMSSQLData({
                //     updatename: 'Update',
                //     table: 24,
                //     params: {
                //         FM_TARGET : $vm.vmData.FM_TARGET,
                //         FM_MAIL : _mailObjectToArray.join(";"),
                //         FM_TITLE : $vm.vmData.FM_TITLE,
                //         FM_CONTENT : $vm.vmData.FM_CONTENT,
                //         FM_UP_USER : $vm.profile.U_ID,
                //         FM_UP_DATETIME : $filter('date')(_d, 'yyyy-MM-dd HH:mm:ss')
                //     },
                //     condition: {
                //         FM_CR_USER : $vm.vmData.FM_CR_USER,
                //         FM_CR_DATETIME : $vm.vmData.FM_CR_DATETIME
                //     }
                // }).then(function(res) {
                //     console.log(res);

                //     if(res["returnData"] == 1){
                //         ReturnToAviationMail();

                //         toaster.pop('success', '訊息', '更新目標成功', 3000);
                //     }

                // });
            }else{
                toaster.pop('error', '失敗', '沒有任何信件', 3000);
            }
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
                    table: 30,
                    params: {
                        FMAF_SOFT_DELETE : true
                    },
                    condition: {
                        FMAF_ID : selectedItem.BBAF_ID
                    }
                }).then(function (res) {
                    $vm.vmData.UploadedData.splice(pIndex, 1);
                }, function (err) {

                });
            }, function() {
                // $log.info('Modal dismissed at: ' + new Date());
            });
        },
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
            var uploadedDataLength = ($filter('filter')($vm.vmData.UploadedData, {FMAF_O_FILENAME: item.name})).length;
            
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
                table: 30,
                params: {
                    FMAF_O_FILENAME : response.oFilename,
                    FMAF_R_FILENAME : response.rFilename,
                    FMAF_FILEPATH : response.Filepath,
                    FMAF_FILESIZE : response.Filesize,
                    FMAF_CR_USER : $vm.profile.U_ID,
                    FMAF_CR_DATETIME : $filter('date')(_d, 'yyyy-MM-dd HH:mm:ss')
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
            ReturnToAviationMail();
        }, function (err) {
            console.log(err);
        });
    };

    function LoadFMAF(){
        RestfulApi.SearchMSSQLData({
            querymain: 'targetEditor',
            queryname: 'SelectFMAF',
            params: {
                FMAF_CR_USER: $vm.vmData.FM_CR_USER,
                FMAF_CR_DATETIME: $vm.vmData.FM_CR_DATETIME
            }
        }).then(function (res){
            console.log(res["returnData"]);
            $vm.vmData.UploadedData = res["returnData"];
        });
    };

    function LoadFMP(){

        RestfulApi.SearchMSSQLData({
            querymain: 'targetEditor',
            queryname: 'SelectFMP',
            params: {
                FMP_CR_USER: $vm.vmData.FM_CR_USER,
                FMP_CR_DATETIME: $vm.vmData.FM_CR_DATETIME
            }
        }).then(function (res){
            console.log(res["returnData"]);

            var _flightNo = res["returnData"];
            $vm.vmData.FMP_FLIGHTNO = [];
            for(var i in _flightNo){
                $vm.vmData.FMP_FLIGHTNO.push({
                    text : _flightNo[i].FMP_FLIGHTNO
                });
            }
        });
    };

    function ReturnToAviationMail(){
        $state.transitionTo($state.current.parent);
    };

})