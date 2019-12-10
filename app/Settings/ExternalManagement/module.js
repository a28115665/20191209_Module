"use strict";

angular.module('app.settings.externalmanagement.sub', ['ui.router']);

angular.module('app.settings.externalmanagement.sub').config(function ($stateProvider){

    $stateProvider
    .state('app.settings.externalmanagement.sub', {
        abstract: true,
        data: {
            title: 'ExternalManagement'
        }
    })

    .state('app.settings.externalmanagement.exaccount', {
        url: '/exaccount',
        data: {
            title: 'ExAccount'
        },
        params: { 
            data: null
        },
        parent: 'app.settings.externalmanagement',
        views: {
            "content@app" : {
                templateUrl: 'app/Settings/Externalmanagement/views/exAccount.html',
                controller: 'ExAccountCtrl',
                controllerAs: '$vm',
                resolve: {
                    bool: function (SysCode, $q){
                        return SysCode.get('Boolean');
                    },
                    compy: function(Compy){
                        return Compy.get();
                    }
                }
            }
        }
    })

    .state('app.settings.externalmanagement.excompy', {
        url: '/excompy',
        data: {
            title: 'ExCompy'
        },
        params: { 
            data: null
        },
        parent: 'app.settings.externalmanagement',
        views: {
            "content@app" : {
                templateUrl: 'app/Settings/Externalmanagement/views/exCompy.html',
                controller: 'ExCompyCtrl',
                controllerAs: '$vm',
                resolve: {
                    bool: function (SysCode, $q){
                        return SysCode.get('Boolean');
                    },
                    coWeights: function (SysCode){
                        return SysCode.get('CoWeights');
                    }
                }
            }
        }
    })
});