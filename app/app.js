'use strict';

/**
 * @ngdoc overview
 * @name app [smartadminApp]
 * @description
 * # app [smartadminApp]
 *
 * Main module of the application.
 */

angular.module('app', [
    'ngSanitize',
    'ngAnimate',
    'ngResource',
    'restangular',
    'ui.router',
    'ui.bootstrap',
    'toaster',
    'ui.grid',
    'ui.grid.resizeColumns',
    'ui.grid.edit',
    'ui.grid.rowEdit',
    'ui.grid.selection',
    'ui.grid.exporter',
    'ui.grid.pagination',
    'ui.grid.grouping',
    'ui.grid.expandable',
    'ui.grid.pinning',
    'ui.grid.autoResize',
    'ui.mask',
    'angularFileUpload',
    'ngTagsInput',
    'summernote',
    'LocalStorageModule',
    'btford.socket-io',

    // Smartadmin Angular Common Module
    'SmartAdmin',

    // App
    'app.auth',
    'app.layout',
    'app.chat',
    'app.dashboard',
    'app.calendar',
    'app.inbox',
    'app.graphs',
    'app.tables',
    'app.forms',
    'app.ui',
    'app.widgets',
    'app.maps',
    'app.appViews',
    'app.misc',
    'app.smartAdmin',
    'app.eCommerce',

    // Project
    'app.restful',
    'app.mainwork',
    'app.selfwork',
    'app.oselfwork',
    'app.concerns',
    'app.settings'
])
.config(function ($provide, $httpProvider, RestangularProvider) {


    // Intercept http calls.
    $provide.factory('HttpInterceptor', function ($q, toaster, ServiceStopModal) {
        var errorCounter = 0;

        function notifyError(rejection) {
            // console.log(rejection);
            // $.bigBox({
            //     title: rejection.status + ' ' + rejection.statusText,
            //     content: rejection.data,
            //     color: "#C46A69",
            //     icon: "fa fa-warning shake animated",
            //     number: ++errorCounter,
            //     timeout: 6000
            // });

            // 表示Service未啟動
            if(rejection.status == -1){

                if(!ServiceStopModal.isOpen()){
                    ServiceStopModal.open();
                }

                // canceller.resolve('Cancel Request'); 
            }else{
                toaster.error(rejection.status + ' ' + rejection.statusText, rejection.data, 6000);
            }
        }

        return {
            // On request success
            request: function(config) {
                // Return config.
                return config;
            },

            // On response success
            response: function(response) {
                // Return response.
                return response;
            },

            // On request failure
            requestError: function(rejection) {
                // show notification
                notifyError(rejection);

                // Return the promise rejection.
                return $q.reject(rejection);
            },

            // On response failure
            responseError: function(rejection) {
                // show notification
                notifyError(rejection);
                // Return the promise rejection.
                return $q.reject(rejection);
            }
        };
    });

    // Add the interceptor to the $httpProvider.
    $httpProvider.interceptors.push('HttpInterceptor');

    RestangularProvider.setBaseUrl(location.pathname.replace(/[^\/]+?$/, ''));

})
.constant('APP_CONFIG', window.appConfig)
.constant('SUMMERNOT_CONFIG', {
    lang: 'zh-TW',
    height: 300,
    toolbar: [
        ['style', ['style']],
        ['font', ['bold', 'italic', 'underline', 'clear']],
        ['fontname', ['fontname']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['table', ['table']],
        ['height', ['height']],
        ['view', ['help']]
    ]
})
.config(function (localStorageServiceProvider) {
    localStorageServiceProvider.setStorageType('localStorage');
})

.run(function ($rootScope, $state, $stateParams, Session, $http, AuthApi, localStorageService, SocketApi) {
    // $rootScope.$state = $state;
    // $rootScope.$stateParams = $stateParams;
    // editableOptions.theme = 'bs3';
    
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
        // track the state the user wants to go to; 
        // authorization service needs this

        console.log(toState, toParams, fromState, fromParams);

        if(toState.name != "login"){
            AuthApi.ReLoadSession().then(function(res){
                // console.log(res);
                // 表示逾時
                if(angular.isUndefined(res["returnData"])){
                    $state.transitionTo("login");
                    // event.preventDefault(); 
                }else{
                    if(!SocketApi.Connected()){
                        SocketApi.Connect();
                    }
                }
            }, function(err){
                // 失敗
                $state.transitionTo("login");
            });
        }

    });

    $rootScope.$on('$stateChangeSuccess', function (event, toState, roParams, fromState, fromParams) {
        // 檢視此頁是否有權限進入
        // 無權限就導到default頁面
        // console.log(Session.Get().GRIGHT[toState.name], toState.name);
        if(!angular.isUndefined(Session.Get()) && Session.Get()["GRIGHT"] !== undefined){
            if(!Session.Get().GRIGHT[toState.name]){
                // event.preventDefault();
                $state.transitionTo("app.default");
            }

            AuthApi.Version().then(function (res){
                var _version = res["returnData"];

                // 如果沒有版本
                if(localStorageService.get("LocalVersion") == null){
                    // 加入版本
                    localStorageService.set("LocalVersion", _version);
                }

                // 如果版本較舊
                if(parseInt(localStorageService.get("LocalVersion")) < _version){
                    // 加入版本
                    localStorageService.set("LocalVersion", _version);
                    // 更新畫面
                    window.location.reload();
                }
            });
        }
    });

});
