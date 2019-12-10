"use strict";


angular.module('app.layout', ['ui.router'])

.config(function ($stateProvider, $urlRouterProvider) {


    $stateProvider
        .state('app', {
            abstract: true,
            views: {
                root: {
                    templateUrl: 'app/layout/layout.tpl.html',
                    controller: function ($rootScope, $stateParams, $state, i18nService) {
                        i18nService.setCurrentLang('zh-tw');
                    }
                }
            },
            resolve: {
                // 預防網頁不斷重新整理且其他resolve執行速度快於stateChangeStart的session抓取
                reLoadSession : function(AuthApi){
                    return AuthApi.ReLoadSession();
                },
                // 系統參數
                sysParm : function($rootScope, RestfulApi){
                    return RestfulApi.SearchMSSQLData({
                        querymain: 'account',
                        queryname: 'SelectSysParm'
                    }).then(function(res){
                        // console.log('sysParm:', res);
                        $rootScope.sysParm = res["returnData"][0];
                        return res["returnData"][0];
                    });
                }
            }
        })

        .state('app.default', {
            url: '/',
            data: {
                title: ''
            },
            views: {
                "content@app" : {
                    templateUrl: 'app/Template/views/default.html'
                }
            }
        });

    $urlRouterProvider.otherwise('/');

})

