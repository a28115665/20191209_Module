"use strict";

angular.module('app.concerns', ['ui.router']);

angular.module('app.concerns').config(function ($stateProvider){

    $stateProvider
    .state('app.concerns', {
        abstract: true,
        data: {
            title: 'Concerns'
        }
    })

    .state('app.concerns.ban', {
        url: '/concerns/ban',
        data: {
            title: 'Ban'
        },
        views: {
            "content@app" : {
                templateUrl: 'app/Concerns/views/ban.html',
                controller: 'BanCtrl',
                controllerAs: '$vm',
                resolve: {
                    bool: function (SysCode){
                        return SysCode.get('Boolean');
                    },
                    compy: function(Compy){
                        return Compy.get();
                    }
                }
            }
        }
    })

    .state('app.concerns.dailyalert', {
        url: '/concerns/dailyalert',
        data: {
            title: 'DailyAlert'
        },
        views: {
            "content@app" : {
                templateUrl: 'app/Concerns/views/dailyAlert.html',
                controller: 'DailyAlertCtrl',
                controllerAs: '$vm',
                resolve: {
                    compy: function(Compy){
                        return Compy.get();
                    }
                }
            }
        }
    })

    .state('app.concerns.banhistorysearch', {
        url: '/concerns/banhistorysearch',
        data: {
            title: 'BanHistorySearch'
        },
        views: {
            "content@app" : {
                templateUrl: 'app/Concerns/views/banHistorySearch.html',
                controller: 'BanHistorySearchCtrl',
                controllerAs: '$vm',
                resolve: {
                    compy: function(Compy){
                        return Compy.get();
                    },
                    bool: function (SysCode){
                        return SysCode.get('Boolean');
                    }
                }
            }
        }
    })

    .state('app.concerns.banhistorysearch.resultban', {
        url: '/resultban',
        data: {
            title: 'BanHistorySearchResultBan'
        },
        params: { 
            data: null
        },
        parent: 'app.concerns.banhistorysearch',
        views: {
            "content@app" : {
                templateUrl: 'app/Concerns/views/banHistorySearch/resultBan.html',
                controller: 'ResultBanCtrl',
                controllerAs: '$vm',
                resolve: {
                    compy: function(Compy){
                        return Compy.get();
                    },
                    bool: function (SysCode){
                        return SysCode.get('Boolean');
                    }
                }
            }
        }
    })
})