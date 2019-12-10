"use strict";

angular.module('app.selfwork.leaderoption', ['ui.router']);

angular.module('app.selfwork.leaderoption').config(function ($stateProvider){

    $stateProvider
    .state('app.selfwork.leaderoption', {
        abstract: true,
        data: {
            title: 'LeaderOption'
        }
    })

    .state('app.selfwork.leaderoption.compydistribution', {
        url: '/selfwork/leaderoption/compydistribution',
        data: {
            title: 'CompyDistribution'
        },
        views: {
            "content@app" : {
                templateUrl: 'app/SelfWork/LeaderOption/views/compyDistribution.html',
                controller: 'CompyDistributionCtrl',
                controllerAs: '$vm',
                resolve: {
                    userInfoByGrade : function(UserInfoByGrade, Session){
                        return UserInfoByGrade.get(Session.Get().U_ID, Session.Get().U_GRADE, Session.Get().DEPTS);
                    },
                    coWeights: function (SysCode){
                        return SysCode.get('CoWeights');
                    }
                }
            }
        }
    })

    .state('app.selfwork.leaderoption.agentsetting', {
        url: '/selfwork/leaderoption/agentsetting',
        data: {
            title: 'AgentSetting'
        },
        views: {
            "content@app" : {
                templateUrl: 'app/SelfWork/LeaderOption/views/agentSetting.html',
                controller: 'AgentSettingCtrl',
                controllerAs: '$vm',
                resolve: {
                    userInfoByCompyDistribution : function (UserInfoByCompyDistribution, Session){
                        return UserInfoByCompyDistribution.get(Session.Get().U_ID);
                    },
                    compy : function(Compy){
                        return Compy.get();
                    },
                    coWeights: function (SysCode){
                        return SysCode.get('CoWeights');
                    }
                }
            }
        }
    })

    .state('app.selfwork.leaderoption.dailyleave', {
        url: '/selfwork/leaderoption/dailyleave',
        data: {
            title: 'DailyLeave'
        },
        views: {
            "content@app" : {
                templateUrl: 'app/SelfWork/LeaderOption/views/dailyleave.html',
                controller: 'DailyLeaveCtrl',
                controllerAs: '$vm',
                resolve: {
                    userInfoByGrade : function(UserInfoByGrade, Session){
                        return UserInfoByGrade.get(Session.Get().U_ID, Session.Get().U_GRADE, Session.Get().DEPTS);
                    },
                    bool : function(SysCode){
                        return SysCode.get('Boolean');
                    }
                }
            }
        }
    })
});