"use strict";

angular.module('app.oselfwork.oleaderoption', ['ui.router']);

angular.module('app.oselfwork.oleaderoption').config(function ($stateProvider){

    $stateProvider
    .state('app.oselfwork.oleaderoption', {
        abstract: true,
        data: {
            title: 'OLeaderOption'
        }
    })

    .state('app.oselfwork.oleaderoption.ocompydistribution', {
        url: '/oselfwork/oleaderoption/ocompydistribution',
        data: {
            title: 'OCompyDistribution'
        },
        views: {
            "content@app" : {
                templateUrl: 'app/OSelfWork/OLeaderOption/views/ocompyDistribution.html',
                controller: 'OCompyDistributionCtrl',
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

    .state('app.oselfwork.oleaderoption.oagentsetting', {
        url: '/oselfwork/oleaderoption/oagentsetting',
        data: {
            title: 'OAgentSetting'
        },
        views: {
            "content@app" : {
                templateUrl: 'app/OSelfWork/OLeaderOption/views/oagentSetting.html',
                controller: 'OAgentSettingCtrl',
                controllerAs: '$vm',
                resolve: {
                    userInfoByOCompyDistribution : function (UserInfoByOCompyDistribution, Session){
                        return UserInfoByOCompyDistribution.get(Session.Get().U_ID);
                    },
                    ocompy : function(OCompy){
                        return OCompy.get();
                    },
                    coWeights: function (SysCode){
                        return SysCode.get('CoWeights');
                    }
                }
            }
        }
    })

    .state('app.oselfwork.oleaderoption.odailyleave', {
        url: '/oselfwork/oleaderoption/odailyleave',
        data: {
            title: 'ODailyLeave'
        },
        views: {
            "content@app" : {
                templateUrl: 'app/OSelfWork/OLeaderOption/views/odailyleave.html',
                controller: 'ODailyLeaveCtrl',
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