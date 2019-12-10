"use strict";

angular.module('app.concerns').controller('BanHistorySearchCtrl', function ($scope, $stateParams, $state, AuthApi, Session, toaster, $uibModal, $templateCache, RestfulApi, $filter, compy, bool, uiGridConstants, localStorageService) {
    
    var $vm = this;

	angular.extend(this, {
        Init : function(){
            // console.log(localStorageService.get("BanHistorySearch"));
            
            // 帶入LocalStorage資料
            if(localStorageService.get("BanHistorySearch") == null){
                $vm.vmData = {};
            }else{
                $vm.vmData = localStorageService.get("BanHistorySearch");
            }
        },
        profile : Session.Get(),
        boolData : bool,
        compyData : compy,
        Cancel : function(){
            ClearSearchCondition();
        },
        Search : function(){
            // console.log($vm.vmData);
            $vm.resultData = [];

            if(IsConditionsHaveValue($vm.vmData)){
                SearchData();
            }else{
                toaster.pop('info', '訊息', '請輸入查詢條件', 3000);
            }
        }
    });

    function SearchData () {
        var _params = {};

        _params = CombineConditions($vm.vmData);
        // 紀錄查詢條件
        localStorageService.set("BanHistorySearch", $vm.vmData);
        
        console.log(_params);
        
        RestfulApi.CRUDMSSQLDataByTask([
            {
                crudType: 'Select',
                querymain: 'banHistorySearch',
                queryname: 'SelectCaseACount',
                params: _params
            },
            {  
                crudType: 'Select',
                querymain: 'banHistorySearch',
                queryname: 'SelectCaseBCount',
                params: _params
            },
            {  
                crudType: 'Select',
                querymain: 'banHistorySearch',
                queryname: 'SelectCaseCCount',
                params: _params
            },
            {  
                crudType: 'Select',
                querymain: 'banHistorySearch',
                queryname: 'SelectCaseDCount',
                params: _params
            }
        ]).then(function (res){
            console.log(res["returnData"]);

            var _count = res["returnData"][0][0].COUNT + res["returnData"][1][0].COUNT + res["returnData"][2][0].COUNT + res["returnData"][3][0].COUNT;

            if(_count > 0){
                console.log(_count);
                $state.transitionTo("app.concerns.banhistorysearch.resultban", {
                    data: {
                        SelectCaseACount : res["returnData"][0][0].COUNT,
                        SelectCaseBCount : res["returnData"][1][0].COUNT,
                        SelectCaseCCount : res["returnData"][2][0].COUNT,
                        SelectCaseDCount : res["returnData"][3][0].COUNT
                    }
                });
            }else{
                toaster.pop('info', '訊息', '查無資料', 3000);
            }

        });
    }

    /**
     * IsConditionsHaveValue 檢查查詢條件是否為空
     * @param {[type]} true 表示有值, false 表示空值
     */
    function IsConditionsHaveValue(pObject){
        var _result = true,
            _isClear = true;

        if(pObject == {}){
            _result = false;
        }else{
            // 檢查所有值是否都是空的
            for(var i in pObject){
                if(pObject[i] != ""){
                    _isClear = false;
                    break;
                }
            }

            // 如果都是空的 回傳false
            if(_isClear){
                _result = false;
            }
        }

        return _result;
    }

    /**
     * CombineConditions 條件組合
     * @param {[type]}
     */
    function CombineConditions(pObject){
        var _conditions = {};

        for(var i in pObject){
            if(pObject[i] != ""){
                if(i == "CRDT_FROM"){
                    _conditions[i] = pObject[i] + ' 00:00:00';
                }else if(i == "CRDT_TOXX"){
                    _conditions[i] = pObject[i] + ' 23:59:59';
                }else{
                    _conditions[i] = pObject[i];
                }
            }
        }

        return _conditions;
    }

    /**
     * [ClearSearchCondition description] 清除查詢條件
     */
    function ClearSearchCondition(){
        localStorageService.remove("BanHistorySearch");
        $vm.vmData = {};
    }

})