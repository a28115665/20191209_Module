"use strict";

angular.module('app.settings.oexternalmanagement.sub', ['ui.router']);

angular.module('app.settings.oexternalmanagement.sub').config(function ($stateProvider){

    $stateProvider
    .state('app.settings.oexternalmanagement.sub', {
        abstract: true,
        data: {
            title: 'OExternalManagement'
        }
    })

    .state('app.settings.oexternalmanagement.oexaccount', {
        url: '/oexaccount',
        data: {
            title: 'OExAccount'
        },
        params: { 
            data: null
        },
        parent: 'app.settings.oexternalmanagement',
        views: {
            "content@app" : {
                templateUrl: 'app/Settings/OExternalmanagement/views/oexAccount.html',
                controller: 'OExAccountCtrl',
                controllerAs: '$vm',
                resolve: {
                    bool: function (SysCode, $q){
                        return SysCode.get('Boolean');
                    },
                    ocompy: function(OCompy){
                        return OCompy.get();
                    }
                }
            }
        }
    })

    .state('app.settings.oexternalmanagement.oexcompy', {
        url: '/oexcompy',
        data: {
            title: 'OExCompy'
        },
        params: { 
            data: null
        },
        parent: 'app.settings.oexternalmanagement',
        views: {
            "content@app" : {
                templateUrl: 'app/Settings/OExternalmanagement/views/oexCompy.html',
                controller: 'OExCompyCtrl',
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