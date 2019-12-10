angular.module('app')
.run(function ($templateCache){
	$templateCache.put('accessibilityIsTop', '<div class="ui-grid-cell-contents text-center">\
                                          			<i class="fa fa-lock" ng-if="row.entity.BB_STICK_TOP"></i>\
                                       		  </div>');
    $templateCache.put('accessibilityTitleURL', '<div class="ui-grid-cell-contents">\
                                                <a href="javascript:void(0);" style="text-decoration:none" ng-click="grid.appScope.$vm.gridMethod.showNews(row)">{{row.entity.BB_TITLE}}</a>\
                                              </div>');
    $templateCache.put('accessibilityFileCounts', '<div class="ui-grid-cell-contents text-center">\
                                                <span class="badge bg-color-orange">{{row.entity.BBAF_COUNTS}}</span>\
                                              </div>');
    $templateCache.put('accessibilityToOnceDownload', '<div class="ui-grid-cell-contents text-center">\
                                                <a href="javascript:void(0);" class="btn btn-default txt-color-pink btn-xs" href="#" ng-click="grid.appScope.$vm.gridMethod.downloadFiles(row)"><i class="fa fa-download fa-lg"></i></a>\
                                            </div>');
    
	$templateCache.put('accessibilityToS', '<div class="ui-grid-cell-contents text-center">\
                                      			<a href="javascript:void(0);" class="btn btn-warning btn-xs" ng-click="grid.appScope.$vm.gridMethod.selectData(row)"> 領單</a>\
                                   		  	</div>');
    $templateCache.put('accessibilityLightStatus', '<div class="ui-grid-cell-contents">\
	                                          			<i class="fa fa-circle text-warning" ng-if="!row.entity.g"> 作業中</i>\
	                                          			<i class="fa fa-circle text-success" ng-if="row.entity.g"> 完成</i>\
	                                       		    </div>');
    $templateCache.put('accessibilityToMC', '<div class="ui-grid-cell-contents text-center">\
                                                    <a href="javascript:void(0);" class="btn btn-warning btn-xs" ng-click="grid.appScope.$vm.gridMethod.modifyData(row)"> 編輯</a>\
                                                    <a href="javascript:void(0);" class="btn btn-danger btn-xs" ng-click="grid.appScope.$vm.gridMethod.cancelData(row)"> 取消</a>\
                                              </div>');

    $templateCache.put('accessibilityToDepartRemark', '\
                        <div class="ui-grid-cell-contents text-center" ng-switch="row.entity.FA_DEPART_REMK">\
                            <span class="label bg-color-green" ng-switch-when="出發">{{row.entity.FA_DEPART_REMK}}</span>\
                            <span class="label bg-color-orange" ng-switch-when="檢查">{{row.entity.FA_DEPART_REMK}}</span>\
                            <span class="label bg-color-blue" ng-switch-when="準時">{{row.entity.FA_DEPART_REMK}}</span>\
                            <span class="label bg-color-red" ng-switch-when="延誤">{{row.entity.FA_DEPART_REMK}}</span>\
                            <span class="label bg-color-blueDark" ng-switch-when="取消">{{row.entity.FA_DEPART_REMK}}</span>\
                            <span class="label bg-color-magenta" ng-switch-when="報到">{{row.entity.FA_DEPART_REMK}}</span>\
                            <span class="label bg-color-redLight" ng-switch-when="已飛">{{row.entity.FA_DEPART_REMK}}</span>\
                            <span ng-switch-default>{{row.entity.FA_DEPART_REMK}}</span>\
                      </div>');

    $templateCache.put('accessibilityToArrivalRemark', '\
                        <div class="ui-grid-cell-contents text-center" ng-switch="row.entity.FA_ARRIVAL_REMK">\
                            <span class="label bg-color-green" ng-switch-when="抵達">{{row.entity.FA_ARRIVAL_REMK}}</span>\
                            <span class="label bg-color-green" ng-switch-when="已到ARRIVED">{{row.entity.FA_ARRIVAL_REMK}}</span>\
                            <span class="label bg-color-orange" ng-switch-when="時間更改">{{row.entity.FA_ARRIVAL_REMK}}</span>\
                            <span class="label bg-color-orange" ng-switch-when="時間更改SCHEDULE CHANGE">{{row.entity.FA_ARRIVAL_REMK}}</span>\
                            <span class="label bg-color-blue" ng-switch-when="準時">{{row.entity.FA_ARRIVAL_REMK}}</span>\
                            <span class="label bg-color-blue" ng-switch-when="準時ON TIME">{{row.entity.FA_ARRIVAL_REMK}}</span>\
                            <span class="label bg-color-red" ng-switch-when="延誤">{{row.entity.FA_ARRIVAL_REMK}}</span>\
                            <span class="label bg-color-red" ng-switch-when="延遲DELAY">{{row.entity.FA_ARRIVAL_REMK}}</span>\
                            <span class="label bg-color-blueDark" ng-switch-when="取消">{{row.entity.FA_ARRIVAL_REMK}}</span>\
                            <span class="label bg-color-magenta" ng-switch-when="提早">{{row.entity.FA_ARRIVAL_REMK}}</span>\
                            <span class="label bg-color-redLight" ng-switch-when="加班">{{row.entity.FA_ARRIVAL_REMK}}</span>\
                            <span ng-switch-default>{{row.entity.FA_ARRIVAL_REMK}}</span>\
                      </div>');

    $templateCache.put('accessibilityToInternalGoods', '\
                        <div class="ui-grid-cell-contents text-center">\
                            <i class="fa fa-remove text-danger" ng-if="row.entity.BAGNO_MATCH == 0"> </i> \
                            <i class="fa fa-check text-success" ng-if="row.entity.BAGNO_MATCH == 1"> </i> \
                        </div>');

    $templateCache.put('accessibilityToSuppleMent', '\
                        <div class="ui-grid-cell-contents text-center">\
                            <span class="label bg-color-red">{{row.entity.OL_SUPPLEMENT_COUNT | suppleMentFilter}}</span>\
                        </div>');

    $templateCache.put('accessibilityToVForPullGoods', '\
                        <div class="ui-grid-cell-contents">\
                            <a href="javascript:void(0);" class="btn btn-info btn-xs" ng-click="grid.appScope.$vm.gridMethodForPullGoods.viewData(row)"> 原因</a>\
                            <a href="javascript:void(0);" class="btn btn-primary btn-xs" ng-click="grid.appScope.$vm.gridMethodForPullGoods.detailData(row)"> 明細</a>\
                      </div>');
    $templateCache.put('accessibilityToMSForAssistantJobs', '\
                        <div class="ui-grid-cell-contents text-center">\
                            <a href="javascript:void(0);" class="btn btn-warning btn-xs" ng-click="grid.appScope.$vm.gridMethod.modifyData(row)"> 修改</a>\
                            <!-- <a href="javascript:void(0);" class="btn btn-info btn-xs" ng-click="grid.appScope.$vm.gridMethod.sendMail(row)"> 寄信</a> -->\
                            <!-- <a href="javascript:void(0);" class="btn btn-primary btn-xs" ng-click="grid.appScope.$vm.gridMethod.viewOrder(row)"> 航班</a> -->\
                      </div>');
    $templateCache.put('accessibilityToMSForAssistantJobsSearch', '\
                        <div class="ui-grid-cell-contents text-center">\
                            <a href="javascript:void(0);" class="btn btn-info btn-xs" ng-click="grid.appScope.$vm.gridMethod.sendMail(row)"> 寄信</a>\
                            <a href="javascript:void(0);" class="btn btn-primary btn-xs" ng-click="grid.appScope.$vm.gridMethod.viewOrder(row)"> 航班</a>\
                      </div>');

    // 主號可直接航班檢視
    $templateCache.put('accessibilityToMasterForViewOrder', '\
                        <div class="ui-grid-cell-contents text-center" ng-switch="row.entity.OL_MASTER">\
                            <span ng-switch-when="">{{row.entity.OL_MASTER}}</span>\
                            <a href="javascript:void(0);" ng-switch-default ng-click="grid.appScope.$vm.gridMethod.viewOrder(row)"> {{row.entity.OL_MASTER}}</a>\
                        </div>');

	$templateCache.put('accessibilityToRMC', '\
                        <div class="ui-grid-cell-contents text-center">\
            				<a href="javascript:void(0);" class="btn btn-danger btn-xs" ng-click="grid.appScope.$vm.gridMethod.rejectData(row)" ng-disabled="row.entity.g"> 退單</a>\
            				<a href="javascript:void(0);" class="btn btn-warning btn-xs" ng-click="grid.appScope.$vm.gridMethod.modifyData(row)"> 編輯</a>\
            				<a href="javascript:void(0);" class="btn btn-primary btn-xs" ng-click="grid.appScope.$vm.gridMethod.closeData(row)" ng-disabled="row.entity.g"> 完成</a>\
                        </div>');
    $templateCache.put('accessibilityToOperaForJob001', '\
                    <div class="ui-grid-cell-contents">\
                        <a href="javascript:void(0);" class="btn btn-success btn-xs" ng-click="grid.appScope.$vm.gridMethod.gridOperation(row, \'報機單\')"> 工作選項</a>\
                    </div>');
    $templateCache.put('accessibilityToOperaForJob002', '\
                    <div class="ui-grid-cell-contents text-center">\
                        <a href="javascript:void(0);" class="btn btn-success btn-xs" ng-click="grid.appScope.$vm.gridMethod.gridOperation(row, \'銷艙單\')"> 工作選項</a>\
                    </div>');
    $templateCache.put('accessibilityToOperaForJob003', '\
                    <div class="ui-grid-cell-contents text-center">\
                        <a href="javascript:void(0);" class="btn btn-success btn-xs" ng-click="grid.appScope.$vm.gridMethod.gridOperation(row, \'派送單\')"> 工作選項</a>\
                    </div>');
  
    $templateCache.put('accessibilityToChangeNature', '\
                    <div class="ui-grid-cell-contents">\
                        <a href="javascript:void(0);" class="btn btn-warning btn-xs" ng-click="grid.appScope.$vm.gridMethod.changeNature(row)" ng-hide="row.entity[\'loading\']"> 改單</a>\
                        <a href="javascript:void(0);" class="btn btn-warning btn-xs disabled" ng-show="row.entity[\'loading\']"> <i class="fa fa-refresh fa-spin"></i></a>\
                    </div>');

	$templateCache.put('accessibilityToJob001', '\
                    <div class="ui-grid-cell-contents">\
                        <!--<a href="javascript:void(0);" class="btn btn-warning btn-xs" ng-click="grid.appScope.$vm.gridMethod.changeNature(row)" ng-hide="row.entity[\'loading\']"> 改單</a>-->\
                        <!--<a href="javascript:void(0);" class="btn btn-warning btn-xs disabled" ng-show="row.entity[\'loading\']"> <i class="fa fa-refresh fa-spin"></i></a>-->\
        				<!--<a href="javascript:void(0);" class="btn btn-danger btn-xs" ng-click="grid.appScope.$vm.gridMethod.banData(row)" ng-class="row.entity.BLFO_TRACK != null ? \'disabled\' : \'\'"> 加入黑名單</a>-->\
                        <button class="btn btn-primary btn-xs" ng-click="grid.appScope.$vm.gridMethod.pullGoods(row)" ng-class="row.entity.PG_PULLGOODS ? \'disabled\' : \'\'"> 拉貨</button>\
                        <!--<a href="javascript:void(0);" class="btn btn-primary btn-xs" ng-click="grid.appScope.$vm.gridMethod.cancelPullGoods(row)" ng-show="row.entity.PG_PULLGOODS && !row.entity.PG_MOVED"> 恢復</a>-->\
                        <!--<a href="javascript:void(0);" class="btn btn-success btn-xs" ng-click="grid.appScope.$vm.gridMethod.specialGoods(row)" ng-class="row.entity.SPG_SPECIALGOODS != 0 ? \'disabled\' : \'\'"> 特貨</a>-->\
                        <button class="btn btn-default btn-xs" ng-click="grid.appScope.$vm.gridMethod.specialGoods(row)" ng-if="row.entity.SPG_SPECIALGOODS == 0"> 特貨</button>\
                        <button class="btn btn-warning btn-xs" ng-click="grid.appScope.$vm.gridMethod.specialGoods(row)" ng-if="row.entity.SPG_SPECIALGOODS == 1"> 普特貨</button>\
                        <button class="btn btn-success btn-xs" ng-click="grid.appScope.$vm.gridMethod.specialGoods(row)" ng-if="row.entity.SPG_SPECIALGOODS == 2"> 特特貨</button>\
   		  		    </div>');
    $templateCache.put('accessibilityToOJob001', '\
                    <div class="ui-grid-cell-contents">\
                        <button class="btn btn-primary btn-xs" ng-click="grid.appScope.$vm.gridMethod.pullGoods(row)" ng-class="row.entity.O_PG_PULLGOODS ? \'disabled\' : \'\'"> 拉貨</button>\
                        <button class="btn btn-default btn-xs" ng-click="grid.appScope.$vm.gridMethod.specialGoods(row)" ng-if="row.entity.O_SPG_SPECIALGOODS == 0"> 特貨</button>\
                        <button class="btn btn-warning btn-xs" ng-click="grid.appScope.$vm.gridMethod.specialGoods(row)" ng-if="row.entity.O_SPG_SPECIALGOODS == 1"> 普特貨</button>\
                        <button class="btn btn-success btn-xs" ng-click="grid.appScope.$vm.gridMethod.specialGoods(row)" ng-if="row.entity.O_SPG_SPECIALGOODS == 2"> 特特貨</button>\
                    </div>');

    $templateCache.put('accessibilityToExportExcelStaus', '\
                        <div class="my-ui-grid-cell-contents">\
                            <a href="javascript:void(0);" class="btn btn-info btn-xs" ng-click="grid.appScope.$vm.gridMethod.exportDetail(row)"> 紀錄</a>\
                            <i class="fa fa-check text-success" title="班機表已匯" ng-if="row.entity.FLIGHT_EXPORT >= 1"> </i> \
                            <i class="fa fa-question" title="班機表未匯" ng-if="row.entity.FLIGHT_EXPORT == 0"> </i> \
                            <i class="fa fa-check text-success" title="關貿已匯" ng-if="row.entity.TRADE_EXPORT >= 1"> </i> \
                            <i class="fa fa-question" title="關貿未匯" ng-if="row.entity.TRADE_EXPORT == 0"> </i> \
                        </div>');

    $templateCache.put('accessibilityToOverSixName', '\
                    <div class="ui-grid-cell-contents text-center">\
                        <span class="label bg-color-red" ng-if="row.entity.GETNAME_COUNT == -1">自訂</span>\
                        <span class="text-danger" ng-if="row.entity.GETNAME_COUNT != -1">{{row.entity.GETNAME_COUNT}}</span>\
                    </div>');

    $templateCache.put('accessibilityToOverSixAddress', '\
                    <div class="ui-grid-cell-contents text-center">\
                        <span class="label bg-color-red" ng-if="row.entity.GETADDRESS_COUNT == -1">自訂</span>\
                        <span class="text-danger" ng-if="row.entity.GETADDRESS_COUNT != -1">{{row.entity.GETADDRESS_COUNT}}</span>\
                    </div>');

    $templateCache.put('accessibilityToMForCompound', '\
                        <div class="ui-grid-cell-contents text-center">\
                            <a href="javascript:void(0);" class="btn btn-warning btn-xs" ng-click="grid.appScope.$vm.gridMethodForCompound.modifyData(row)"> {{$parent.$root.getWord(\'Modify\')}}</a>\
                        </div>');

    $templateCache.put('accessibilityToMForBLFO', '<div class="ui-grid-cell-contents text-center">\
                                            <a href="javascript:void(0);" class="btn btn-warning btn-xs" ng-click="grid.appScope.$vm.gridMethodForBLFO.modifyData(row)"> {{$parent.$root.getWord(\'Modify\')}}</a>\
                                          </div>');
    $templateCache.put('accessibilityToMForBLFL', '<div class="ui-grid-cell-contents text-center">\
                                            <a href="javascript:void(0);" class="btn btn-warning btn-xs" ng-click="grid.appScope.$vm.gridMethodForBLFL.modifyData(row)"> {{$parent.$root.getWord(\'Modify\')}}</a>\
                                          </div>');
    $templateCache.put('accessibilityToMDForAccount', '<div class="ui-grid-cell-contents text-center">\
                                            <a href="javascript:void(0);" class="btn btn-warning btn-xs" ng-click="grid.appScope.$vm.gridAccountMethod.modifyData(row)"> {{$parent.$root.getWord(\'Modify\')}}</a>\
                                            <a href="javascript:void(0);" class="btn btn-danger btn-xs" ng-click="grid.appScope.$vm.gridAccountMethod.deleteData(row)"> {{$parent.$root.getWord(\'Delete\')}}</a>\
                                          </div>');
    $templateCache.put('accessibilityToMDForGroup', '<div class="ui-grid-cell-contents text-center">\
                                            <a href="javascript:void(0);" class="btn btn-warning btn-xs" ng-click="grid.appScope.$vm.gridGroupMethod.modifyData(row)"> {{$parent.$root.getWord(\'Modify\')}}</a>\
                                            <a href="javascript:void(0);" class="btn btn-danger btn-xs" ng-click="grid.appScope.$vm.gridGroupMethod.deleteData(row)"> {{$parent.$root.getWord(\'Delete\')}}</a>\
                                          </div>');
    $templateCache.put('accessibilityToMDForCustInfo', '<div class="ui-grid-cell-contents text-center">\
                                            <a href="javascript:void(0);" class="btn btn-warning btn-xs" ng-click="grid.appScope.$vm.gridCustInfoMethod.modifyData(row)"> {{$parent.$root.getWord(\'Modify\')}}</a>\
                                            <a href="javascript:void(0);" class="btn btn-danger btn-xs" ng-click="grid.appScope.$vm.gridCustInfoMethod.deleteData(row)"> {{$parent.$root.getWord(\'Delete\')}}</a>\
                                          </div>');
    $templateCache.put('accessibilityToMForCompyInfo', '\
                        <div class="ui-grid-cell-contents text-center">\
                            <a href="javascript:void(0);" class="btn btn-warning btn-xs" ng-click="grid.appScope.$vm.gridCompyInfoMethod.modifyData(row)"> {{$parent.$root.getWord(\'Modify\')}}</a>\
                            <!-- <a href="javascript:void(0);" class="btn btn-danger btn-xs" ng-click="grid.appScope.$vm.gridCompyInfoMethod.deleteData(row)"> {{$parent.$root.getWord(\'Delete\')}}</a> -->\
                        </div>');
    $templateCache.put('accessibilityToMD', '\
                        <div class="ui-grid-cell-contents text-center">\
                            <a href="javascript:void(0);" class="btn btn-warning btn-xs" ng-click="grid.appScope.$vm.gridMethod.modifyData(row)"> {{$parent.$root.getWord(\'Modify\')}}</a>\
                            <a href="javascript:void(0);" class="btn btn-danger btn-xs" ng-click="grid.appScope.$vm.gridMethod.deleteData(row)"> {{$parent.$root.getWord(\'Delete\')}}</a>\
                        </div>');
    $templateCache.put('accessibilityToM', '\
                        <div class="ui-grid-cell-contents">\
                            <a href="javascript:void(0);" class="btn btn-warning btn-xs" ng-click="grid.appScope.$vm.gridMethod.modifyData(row)"> {{$parent.$root.getWord(\'Modify\')}}</a>\
                        </div>');
    $templateCache.put('accessibilityToD', '\
                        <div class="ui-grid-cell-contents text-center">\
                            <a href="javascript:void(0);" class="btn btn-danger btn-xs" ng-click="grid.appScope.$vm.gridMethod.deleteData(row)"> {{$parent.$root.getWord(\'Delete\')}}</a>\
                        </div>');
    $templateCache.put('accessibilityToForW2', '\
                        <div class="ui-grid-cell-contents text-center">\
                            <i class="fa fa-circle-o" title="{{row.entity.W2_PRINCIPAL | userInfoFilter}}" ng-if="row.entity.W2_STATUS == \'1\' && row.entity.OL_COUNT > 0"> </i> \
                            <i class="fa fa-circle text-warning" title="{{row.entity.W2_PRINCIPAL | userInfoFilter}}" ng-if="row.entity.W2_STATUS == \'2\' && row.entity.OL_COUNT > 0"> </i> \
                            <i class="fa fa-circle text-success" title="{{row.entity.W2_PRINCIPAL | userInfoFilter}}" ng-if="row.entity.W2_STATUS == \'3\' && row.entity.OL_COUNT > 0"> </i> \
                            <i class="fa fa-circle txt-color-magenta" title="{{row.entity.W2_PRINCIPAL | userInfoFilter}}" ng-if="row.entity.W2_STATUS == \'4\' && row.entity.OL_COUNT > 0"> </i> \
                        </div>');
    $templateCache.put('accessibilityToForOW2', '\
                        <div class="ui-grid-cell-contents text-center">\
                            <i class="fa fa-circle-o" title="{{row.entity.OW2_PRINCIPAL | userInfoFilter}}" ng-if="row.entity.OW2_STATUS == \'1\' && row.entity.O_OL_COUNT > 0"> </i> \
                            <i class="fa fa-circle text-warning" title="{{row.entity.OW2_PRINCIPAL | userInfoFilter}}" ng-if="row.entity.OW2_STATUS == \'2\' && row.entity.O_OL_COUNT > 0"> </i> \
                            <i class="fa fa-circle text-success" title="{{row.entity.OW2_PRINCIPAL | userInfoFilter}}" ng-if="row.entity.OW2_STATUS == \'3\' && row.entity.O_OL_COUNT > 0"> </i> \
                            <i class="fa fa-circle txt-color-magenta" title="{{row.entity.OW2_PRINCIPAL | userInfoFilter}}" ng-if="row.entity.OW2_STATUS == \'4\' && row.entity.O_OL_COUNT > 0"> </i> \
                        </div>');
    $templateCache.put('accessibilityToForW3', '\
                        <div class="ui-grid-cell-contents text-center">\
                            <i class="fa fa-circle-o" title="{{row.entity.W3_PRINCIPAL | userInfoFilter}}" ng-if="row.entity.W3_STATUS == \'1\' && row.entity.OL_FLL_COUNT > 0"> </i> \
                            <i class="fa fa-circle text-warning" title="{{row.entity.W3_PRINCIPAL | userInfoFilter}}" ng-if="row.entity.W3_STATUS == \'2\' && row.entity.OL_FLL_COUNT > 0"> </i> \
                            <i class="fa fa-circle text-success" title="{{row.entity.W3_PRINCIPAL | userInfoFilter}}" ng-if="row.entity.W3_STATUS == \'3\' && row.entity.OL_FLL_COUNT > 0"> </i> \
                            <i class="fa fa-circle txt-color-magenta" title="{{row.entity.W3_PRINCIPAL | userInfoFilter}}" ng-if="row.entity.W3_STATUS == \'4\' && row.entity.OL_FLL_COUNT > 0"> </i> \
                        </div>');
    $templateCache.put('accessibilityToForW1', '\
                        <div class="ui-grid-cell-contents text-center">\
                            <i class="fa fa-circle-o" title="{{row.entity.W1_PRINCIPAL | userInfoFilter}}" ng-if="row.entity.W1_STATUS == \'1\'"> </i> \
                            <i class="fa fa-circle text-warning" title="{{row.entity.W1_PRINCIPAL | userInfoFilter}}" ng-if="row.entity.W1_STATUS == \'2\'"> </i> \
                            <i class="fa fa-circle text-success" title="{{row.entity.W1_PRINCIPAL | userInfoFilter}}" ng-if="row.entity.W1_STATUS == \'3\'"> </i> \
                            <i class="fa fa-circle txt-color-magenta" title="{{row.entity.W1_PRINCIPAL | userInfoFilter}}" ng-if="row.entity.W1_STATUS == \'4\'"> </i> \
                        </div>');
    $templateCache.put('accessibilityToForUpload', '\
                        <div class="my-ui-grid-cell-contents text-center">\
                            <i class="fa fa-archive text-warning" ng-if="row.entity.OL_ILSTATUS == 1"> </i> \
                            <i class="fa fa-archive text-success" ng-if="row.entity.OL_ILSTATUS == 2"> </i> \
                            <i class="fa fa-plane text-warning" ng-if="row.entity.OL_FLLSTATUS == 1"> </i> \
                            <i class="fa fa-plane text-success" ng-if="row.entity.OL_FLLSTATUS == 2"> </i> \
                        </div>');
    $templateCache.put('accessibilityToForOUpload', '\
                        <div class="my-ui-grid-cell-contents text-center">\
                            <i class="fa fa-ship text-warning" ng-if="row.entity.O_OL_ILSTATUS == 1"> </i> \
                            <i class="fa fa-ship text-success" ng-if="row.entity.O_OL_ILSTATUS == 2"> </i> \
                        </div>');
    $templateCache.put('accessibilityToDMCForLeader', '\
                        <div class="ui-grid-cell-contents text-center">\
                            <!-- <a href="javascript:void(0);" class="btn btn-danger btn-xs" ng-click="grid.appScope.$vm.gridMethod.deleteData(row)"> 刪除</a> -->\
                            <button type="button" class="btn btn-danger btn-xs" ng-click="grid.appScope.$vm.gridMethod.gridOperation(row)"> 刪除</button>\
                            <button type="button" class="btn btn-warning btn-xs" ng-click="grid.appScope.$vm.gridMethod.modifyData(row)"> 修改</button>\
                            <!-- <a href="javascript:void(0);" class="btn btn-primary btn-xs" ng-click="grid.appScope.$vm.gridMethod.closeData(row)" ng-class="(row.entity.W1_STATUS == \'3\' && row.entity.W2_STATUS == \'3\' && row.entity.W3_STATUS == \'3\') ? \'\' : \'disabled\'"> 結單</a> -->\
                            <button type="button" class="btn btn-primary btn-xs" ng-click="grid.appScope.$vm.gridMethod.closeData(row)" ng-class="(row.entity.W2_STATUS == \'3\' || row.entity.W2_STATUS == \'4\' || row.entity.W3_STATUS == \'3\' || row.entity.W3_STATUS == \'4\') ? \'\' : \'disabled\'"> 結單</button>\
                        </div>');
    $templateCache.put('accessibilityToDMCForOLeader', '\
                        <div class="ui-grid-cell-contents">\
                            <button type="button" class="btn btn-danger btn-xs" ng-click="grid.appScope.$vm.gridMethod.gridOperation(row)"> 刪除</button>\
                            <button type="button" class="btn btn-warning btn-xs" ng-click="grid.appScope.$vm.gridMethod.modifyData(row)"> 修改</button>\
                            <button type="button" class="btn btn-primary btn-xs" ng-click="grid.appScope.$vm.gridMethod.closeData(row)" ng-class="grid.appScope.$vm.OrderListOptionClass(row.entity)"> 結單</button>\
                        </div>');
    $templateCache.put('accessibilityToMForLeaderSearch', '\
                        <div class="ui-grid-cell-contents text-center">\
                            <a href="javascript:void(0);" class="btn btn-warning btn-xs" ng-click="grid.appScope.$vm.gridMethod.modifyData(row)"> 修改</a>\
                            <a href="javascript:void(0);" class="btn btn-danger btn-xs" ng-click="grid.appScope.$vm.gridMethod.releaseData(row)" ng-if="grid.appScope.$vm.profile.U_GRADE < 10" ng-class="{\'disabled\' : row.entity.OL_FDATETIME == null}"> 解案</a>\
                        </div>');
    $templateCache.put('accessibilityToMForOLeaderSearch', '\
                        <div class="ui-grid-cell-contents text-center">\
                            <a href="javascript:void(0);" class="btn btn-warning btn-xs" ng-click="grid.appScope.$vm.gridMethod.modifyData(row)"> 修改</a>\
                            <a href="javascript:void(0);" class="btn btn-danger btn-xs" ng-click="grid.appScope.$vm.gridMethod.releaseData(row)" ng-if="grid.appScope.$vm.profile.U_GRADE < 10" ng-class="{\'disabled\' : row.entity.O_OL_FDATETIME == null}"> 解案</a>\
                        </div>');
    $templateCache.put('accessibilityToEdited', '\
                        <div class="ui-grid-cell-contents text-center">\
                            <i class="fa fa-check text-primary" ng-if="row.entity.OE_EDATETIME != null"> </i> \
                        </div>');
    $templateCache.put('accessibilityToOEdited', '\
                        <div class="ui-grid-cell-contents text-center">\
                            <i class="fa fa-check text-primary" ng-if="row.entity.O_OE_EDATETIME != null"> </i> \
                        </div>');
    $templateCache.put('accessibilityToHistoryCount', '\
                        <div class="ui-grid-cell-contents text-center">\
                            <a href-void="" class="btn btn-danger btn-xs" href="#" ng-class="row.entity.IL_COUNT > 0 ? \'\' : \'disabled\'" ng-click="grid.appScope.$vm.gridMethod.showHistoryCount(row)">{{row.entity.IL_COUNT}}</a> \
                        </div>');
    $templateCache.put('accountManagementOnlineStatue', '\
                        <div class="ui-grid-cell-contents text-center">\
                            <i class="fa fa-circle text-danger" ng-if="!row.entity.onlineStatue"> </i> \
                            <i class="fa fa-circle text-success" ng-if="row.entity.onlineStatue"> </i> \
                        </div>');

    $templateCache.put('accessibilityToSysLevel', '\
                        <div class="ui-grid-cell-contents text-center" ng-switch="row.entity.SDL_LEVEL">\
                            <span class="label bg-color-blue" ng-switch-when="info">{{row.entity.SDL_LEVEL}}</span>\
                            <span class="label bg-color-red" ng-switch-when="error">{{row.entity.SDL_LEVEL}}</span>\
                            <span ng-switch-default>{{row.entity.SDL_LEVEL}}</span>\
                        </div>');

    $templateCache.put('isChecked', '\
                        <div class="modal-header bg-color-blueLight">\
                            <h3 class="modal-title text-center">\
                                <strong class=" txt-color-white">{{$ctrl.data.title}}</strong>\
                            </h3>\
                        </div>\
                        <div class="modal-footer text-center"> \
                            <button class="btn btn-primary" type="button" ng-click="$ctrl.ok()">{{getWord(\'OK\')}}</button> \
                            <button class="btn btn-default" type="button" ng-click="$ctrl.cancel()">{{getWord(\'Cancel\')}}</button> \
                        </div>');

    $templateCache.put('modifyOrderList', '\
                        <div class="modal-header"> \
                            <h3 class="modal-title" id="modal-title">修改</h3> \
                        </div> \
                        <div class="modal-body" id="modal-body"> \
                            <form class="form-horizontal" name="modifyForm"> \
                                <fieldset> \
                                    <div class="form-group"> \
                                        <label class="col-md-2 control-label">進口日期</label> \
                                        <div class="col-md-10"> \
                                            <input class="form-control" name="OL_IMPORTDT" type="text" ng-model="$ctrl.mdData.OL_IMPORTDT" ui-mask="9999-99-99" ui-mask-placeholder ui-mask-placeholder-char="_" placeholder="請輸入進口日期 (西元 年-月-日)" model-view-value="true"/> \
                                        </div> \
                                    </div> \
                                    <div class="form-group"> \
                                        <label class="col-md-2 control-label">報機日期</label> \
                                        <div class="col-md-10"> \
                                            <input class="form-control" name="OL_REAL_IMPORTDT" type="text" ng-model="$ctrl.mdData.OL_REAL_IMPORTDT" ui-mask="9999-99-99" ui-mask-placeholder ui-mask-placeholder-char="_" placeholder="請輸入報機日期 (西元 年-月-日)" model-view-value="true"/> \
                                        </div> \
                                    </div> \
                                    <div class="form-group"> \
                                        <label class="col-md-2 control-label"><code>*</code>行家</label> \
                                        <div class="col-md-10"> \
                                            <select class="form-control" name="OL_CO_CODE" ng-model="$ctrl.mdData.OL_CO_CODE" ng-options="data.value as data.label for data in $ctrl.compy" ng-disabled="$ctrl.compy.length == 0" required> \
                                            </select> \
                                        </div> \
                                    </div> \
                                    <div class="form-group"> \
                                        <label class="col-md-2 control-label">航班</label> \
                                        <!-- <div class="col-md-10"> \
                                            <input class="form-control" name="OL_FLIGHTNO" placeholder="請輸入航班" ng-model="$ctrl.mdData.OL_FLIGHTNO" type="text" ui-mask="AA 9999" ui-mask-placeholder> \
                                        </div> --> \
                                        <div class="col-md-3" ng-class="$ctrl.mdData.FLIGHTNO_END.length && !$ctrl.mdData.FLIGHTNO_START.length ? \' has-error\' : \'\'"> \
                                            <input class="form-control" ng-model="$ctrl.mdData.FLIGHTNO_START" placeholder="代碼" type="text" ui-mask="**" ui-mask-placeholder ng-required="$ctrl.mdData.FLIGHTNO_END.length"> \
                                        </div> \
                                        <div class="col-md-7" ng-class="$ctrl.mdData.FLIGHTNO_START.length && !$ctrl.mdData.FLIGHTNO_END.length ? \' has-error\' : \'\'"> \
                                            <input class="form-control" ng-model="$ctrl.mdData.FLIGHTNO_END" placeholder="號碼" type="text" maxlength="4" ng-required="$ctrl.mdData.FLIGHTNO_START.length"> \
                                        </div> \
                                    </div> \
                                    <!--<div class="form-group"> \
                                        <label class="col-md-2 control-label">主號</label> \
                                        <div class="col-md-10"> \
                                            <input class="form-control" name="OL_MASTER" placeholder="請輸入主號" model-view-value="true" ng-model="$ctrl.mdData.OL_MASTER" type="text" ui-mask="999-99999999" ui-mask-placeholder> \
                                        </div> \
                                    </div>--> \
                                    <div class="form-group"> \
                                        <label class="col-md-2 control-label">主號</label> \
                                        <div class="col-md-10"> \
                                            <div class="input-group"> \
                                                <input class="form-control" name="OL_MASTER" placeholder="請輸入主號" model-view-value="true" ng-model="$ctrl.mdData.OL_MASTER" type="text" ui-mask="999-99999999" ui-mask-placeholder> \
                                                <div class="input-group-btn"> \
                                                    <button class="btn btn-info" type="button" ng-click="$ctrl.ClearMaster()" ng-disabled="$ctrl.firstBagNo == null"> \
                                                        主號清空 \
                                                    </button> \
                                                </div> \
                                            </div> \
                                            <div class="note"> \
                                                點擊按鈕「主號清空」時，描述會帶入報機單的第一袋袋號。 \
                                            </div> \
                                        </div> \
                                    </div> \
                                    <div class="form-group"> \
                                        <label class="col-md-2 control-label">起運國別</label> \
                                        <div class="col-md-10"> \
                                            <input class="form-control" name="OL_COUNTRY" placeholder="請輸入起運國別" ng-model="$ctrl.mdData.OL_COUNTRY" type="text" ui-mask="AA" ui-mask-placeholder> \
                                        </div> \
                                    </div> \
                                    <div class="form-group"> \
                                        <label class="col-md-2 control-label">描述</label> \
                                        <div class="col-md-10"> \
                                            <textarea class="form-control" rows="3" maxlength="300" ng-model="$ctrl.mdData.OL_REASON" placeholder="字數限制 300字"></textarea> \
                                        </div> \
                                    </div> \
                                </fieldset> \
                            </form> \
                        </div> \
                        <div class="modal-footer"> \
                            <button class="btn btn-primary" type="button" ng-click="$ctrl.ok()" ng-disabled="!modifyForm.$valid">{{getWord(\'OK\')}}</button> \
                            <button class="btn btn-default" type="button" ng-click="$ctrl.cancel()">{{getWord(\'Cancel\')}}</button> \
                        </div>');

    $templateCache.put('modifyOOrderList', '\
                        <div class="modal-header"> \
                            <h3 class="modal-title" id="modal-title">修改</h3> \
                        </div> \
                        <div class="modal-body" id="modal-body"> \
                            <form class="form-horizontal" name="modifyForm"> \
                                <fieldset> \
                                    <div class="form-group"> \
                                        <label class="col-md-3 control-label">報機日期</label> \
                                        <div class="col-md-9"> \
                                            <input class="form-control" name="O_OL_IMPORTDT" type="text" ng-model="$ctrl.mdData.O_OL_IMPORTDT" ui-mask="9999-99-99" ui-mask-placeholder ui-mask-placeholder-char="_" placeholder="請輸入報機日期 (西元 年-月-日)" model-view-value="true"/> \
                                        </div> \
                                    </div> \
                                    <div class="form-group"> \
                                        <label class="col-md-3 control-label"><code>*</code>行家</label> \
                                        <div class="col-md-9"> \
                                            <select class="form-control" name="O_OL_CO_CODE" ng-model="$ctrl.mdData.O_OL_CO_CODE" ng-options="data.value as data.label for data in $ctrl.ocompy" ng-disabled="$ctrl.compy.length == 0" required> \
                                            </select> \
                                        </div> \
                                    </div> \
                                    <div class="form-group"> \
                                        <label class="col-md-3 control-label">主號</label> \
                                        <div class="col-md-9"> \
                                            <input class="form-control" name="O_OL_MASTER" placeholder="請輸入主號" model-view-value="true" ng-model="$ctrl.mdData.O_OL_MASTER" type="text"> \
                                        </div> \
                                    </div> \
                                    <div class="form-group"> \
                                        <label class="col-md-3 control-label">通關號碼</label> \
                                        <div class="col-md-9"> \
                                            <input class="form-control" name="O_OL_PASSCODE" ng-model="$ctrl.mdData.O_OL_PASSCODE" placeholder="請輸入海關通關號碼" type="text" maxlength="15"> \
                                        </div> \
                                    </div> \
                                    <div class="form-group"> \
                                        <label class="col-md-3 control-label">航次</label> \
                                        <div class="col-md-9"> \
                                            <input class="form-control" name="O_OL_VOYSEQ" ng-model="$ctrl.mdData.O_OL_VOYSEQ" placeholder="請輸入航次" type="text" maxlength="15"> \
                                        </div> \
                                    </div> \
                                    <div class="form-group"> \
                                        <label class="col-md-3 control-label">呼號</label> \
                                        <div class="col-md-9"> \
                                            <input class="form-control" name="O_OL_MVNO" ng-model="$ctrl.mdData.O_OL_MVNO" placeholder="請輸入呼號" type="text" maxlength="15"> \
                                        </div> \
                                    </div> \
                                    <div class="form-group"> \
                                        <label class="col-md-3 control-label">船公司代碼</label> \
                                        <div class="col-md-9"> \
                                            <input class="form-control" name="O_OL_COMPID" ng-model="$ctrl.mdData.O_OL_COMPID" placeholder="請輸入船公司代碼" type="text" maxlength="15"> \
                                        </div> \
                                    </div> \
                                    <div class="form-group"> \
                                        <label class="col-md-3 control-label">卸存地點</label> \
                                        <div class="col-md-9"> \
                                            <input class="form-control" name="O_OL_ARRLOCATIONID" ng-model="$ctrl.mdData.O_OL_ARRLOCATIONID" placeholder="請輸入卸存地點" type="text" maxlength="15"> \
                                        </div> \
                                    </div> \
                                    <div class="form-group"> \
                                        <label class="col-md-3 control-label">裝貨港</label> \
                                        <div class="col-md-9"> \
                                            <input class="form-control" name="O_OL_POST" placeholder="請輸入裝貨港" ng-model="$ctrl.mdData.O_OL_POST" type="text"> \
                                        </div> \
                                    </div> \
                                    <div class="form-group"> \
                                        <label class="col-md-3 control-label">暫存地點</label> \
                                        <div class="col-md-9"> \
                                            <input class="form-control" name="O_OL_PACKAGELOCATIONID" placeholder="請輸入暫存地點" ng-model="$ctrl.mdData.O_OL_PACKAGELOCATIONID" type="text"> \
                                        </div> \
                                    </div> \
                                    <div class="form-group"> \
                                        <label class="col-md-3 control-label">船機代碼</label> \
                                        <div class="col-md-9"> \
                                            <input class="form-control" ng-model="$ctrl.mdData.O_OL_BOATID" placeholder="請輸入船機代碼" type="text" maxlength="15"> \
                                        </div> \
                                    </div> \
                                    <div class="form-group"> \
                                        <label class="col-md-3 control-label">描述</label> \
                                        <div class="col-md-9"> \
                                            <textarea class="form-control" rows="3" maxlength="300" ng-model="$ctrl.mdData.O_OL_REASON" placeholder="字數限制 300字"></textarea> \
                                        </div> \
                                    </div> \
                                </fieldset> \
                            </form> \
                        </div> \
                        <div class="modal-footer"> \
                            <button class="btn btn-primary" type="button" ng-click="$ctrl.ok()" ng-disabled="!modifyForm.$valid">{{getWord(\'OK\')}}</button> \
                            <button class="btn btn-default" type="button" ng-click="$ctrl.cancel()">{{getWord(\'Cancel\')}}</button> \
                        </div>');

    /**
     * [grid description] Show offline
     * @type {String}
     */
    $templateCache.put('showOffline', '\
                        <div class="modal-body text-center text-danger">\
                            <strong>伺服器異常，{{$ctrl.progress}}秒後自動重新連線，尚還無法連線時，請聯絡系統管理員。</strong>\
                        </div>\
                        <style type="text/css">\
                            .modal-content {\
                                background-color: #ffffffde\
                            }\
                            .modal-backdrop {\
                                position: fixed;\
                                top: 0;\
                                right: 0;\
                                bottom: 0;\
                                left: 0;\
                                background-color: orange;\
                                opacity: 0.6;\
                                width: 100%;\
                                height: 100%;\
                                z-index: 1040;\
                            }\
                        </style>');
})
.controller('IsDeleteModalInstanceCtrl', function ($uibModalInstance, items) {
    var $ctrl = this;
    
    $ctrl.ok = function() {
        $uibModalInstance.close(items);
    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
})
.controller('IsCheckedModalInstanceCtrl', function ($uibModalInstance, items, show) {
    var $ctrl = this;

    show['title'] = angular.isUndefined(show['title']) ? "操作提示" : show['title'];

    $ctrl.data = show;
    
    $ctrl.ok = function() {
        $uibModalInstance.close(items);
    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
})
.controller('ModifyOrderListModalInstanceCtrl', function ($uibModalInstance, vmData, compy, RestfulApi) {
    var $ctrl = this,
        _flightNo = vmData.OL_FLIGHTNO != null ? vmData.OL_FLIGHTNO.split(' ') : [];

    if(_flightNo.length == 2){
        vmData.FLIGHTNO_START = _flightNo[0];
        vmData.FLIGHTNO_END = _flightNo[1];
    }
    $ctrl.mdData = angular.copy(vmData);
    $ctrl.compy = compy;
    $ctrl.firstBagNo = null;

    // 取得此單的第一筆袋號
    RestfulApi.SearchMSSQLData({
        querymain: 'job001',
        queryname: 'GetFirstBagNo',
        params: {
            IL_SEQ : $ctrl.mdData.OL_SEQ
        }
    }).then(function (res){         
        var _data = res["returnData"] || [];

        if(_data.length > 0){
            $ctrl.firstBagNo = _data[0].IL_BAGNO;
        }
    }); 
    
    $ctrl.ClearMaster = function(){
        $ctrl.mdData.OL_MASTER = null;

        if($ctrl.mdData.OL_REASON != null){
            $ctrl.mdData.OL_REASON += $ctrl.firstBagNo;
        }else{
            $ctrl.mdData.OL_REASON = $ctrl.firstBagNo;
        }
    }

    $ctrl.ok = function() {
        if($ctrl.mdData.FLIGHTNO_START != null && $ctrl.mdData.FLIGHTNO_END != null){
            $ctrl.mdData.FLIGHTNO_START = $ctrl.mdData.FLIGHTNO_START.toUpperCase();
            $ctrl.mdData.OL_FLIGHTNO = $ctrl.mdData.FLIGHTNO_START + ' ' + $ctrl.mdData.FLIGHTNO_END;
        }

        if($ctrl.mdData.OL_COUNTRY != null){
            $ctrl.mdData.OL_COUNTRY = $ctrl.mdData.OL_COUNTRY.toUpperCase();
        }
        $ctrl.mdData.OL_IMPORTDT = $ctrl.mdData.OL_IMPORTDT == "" ? null : $ctrl.mdData.OL_IMPORTDT;
        $ctrl.mdData.OL_REAL_IMPORTDT = $ctrl.mdData.OL_REAL_IMPORTDT == "" ? null : $ctrl.mdData.OL_REAL_IMPORTDT;
        $uibModalInstance.close($ctrl.mdData);
    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
})

.controller('ModifyOOrderListModalInstanceCtrl', function ($uibModalInstance, vmData, ocompy, RestfulApi) {
    var $ctrl = this;

    $ctrl.mdData = angular.copy(vmData);
    $ctrl.ocompy = ocompy;

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

        $ctrl.mdData.O_OL_IMPORTDT = $ctrl.mdData.O_OL_IMPORTDT == "" ? null : $ctrl.mdData.O_OL_IMPORTDT;
        $uibModalInstance.close($ctrl.mdData);
    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
})
.controller('OpWorkMenuModalInstanceCtrl', function ($scope, $uibModalInstance, items) {
    var $ctrl = this;
    $ctrl.appScope = $scope.$parent.$vm;
    $ctrl.row = items;
    console.log($ctrl);
    
    $ctrl.ok = function() {
        $uibModalInstance.close(items);
    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
})
.controller("ShowOffline", ["$scope", "$uibModalInstance", "$interval", "$timeout", "Resource", "toaster",
    function($scope, $uibModalInstance, $interval, $timeout, Resource, toaster) {
        var $ctrl = this;
        $ctrl.progress = 5;

        $interval(function() {
            // 倒數 
            if ($ctrl.progress > 0) $ctrl.progress -= 1 
        }, 1000);

        $scope.$watch(function() {
            return $ctrl.progress
        }, function() {
            // 當秒數小於0時關閉
            if ($ctrl.progress <= 0) {
                Resource.VERSION.get({},
                    function (pSResponse){
                        $timeout(function() {
                            toaster.pop('success', "成功", "重新連線成功", 3000);
                            $uibModalInstance.dismiss('cancel');
                        }, 1000)
                    },
                    function (pFResponse){
                        $timeout(function() {
                            $ctrl.progress = 5;
                        }, 1000)
                    });

            }
        })

    }
]);