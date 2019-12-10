"use strict";

angular.module('app.oselfwork', [
        'ui.router',
        'app.oselfwork.oleaderoption'
    ]);

angular.module('app.oselfwork').config(function ($stateProvider){

    $stateProvider
    .state('app.oselfwork', {
        abstract: true,
        data: {
            title: 'OSelfWork',
            backgroundClass: 'lightblue'
        }
    })

    .state('app.oselfwork.oleaderjobs', {
        url: '/oselfwork/oleaderjobs',
        data: {
            title: 'OLeaderJobs'
        },
        views: {
            "content@app" : {
                templateUrl: 'app/OSelfWork/views/oleaderJobs.html',
                controller: 'OLeaderJobsCtrl',
                controllerAs: '$vm',
                resolve: {
                    userInfoByGrade : function(UserInfoByGrade, Session){
                        return UserInfoByGrade.get(Session.Get().U_ID, Session.Get().U_GRADE, Session.Get().DEPTS);
                    },
                    ocompy : function(OCompy){
                        return OCompy.get();
                    },
                    opType : function (SysCode){
                        return SysCode.get('OpType');
                    }
                }
            }
        }
    })

    .state('app.oselfwork.oleaderhistorysearch', {
        url: '/oselfwork/oleaderhistorysearch',
        data: {
            title: 'OLeaderHistorySearch'
        },
        views: {
            "content@app" : {
                templateUrl: 'app/OSelfWork/views/oleaderHistorySearch.html',
                controller: 'OLeaderHistorySearchCtrl',
                controllerAs: '$vm',
                resolve: {
                    ocompy : function(OCompy){
                        return OCompy.get();
                    },
                    bool: function (SysCode){
                        return SysCode.get('Boolean');
                    },
                    userInfo: function(UserInfo){
                        return UserInfo.get();
                    }
                }
            }
        }
    })

    .state('app.oselfwork.oassistantjobs', {
        url: '/oselfwork/oassistantjobs',
        data: {
            title: 'OAssistantJobs'
        },
        views: {
            "content@app" : {
                templateUrl: 'app/OSelfWork/views/oassistantJobs.html',
                controller: 'OAssistantJobsCtrl',
                controllerAs: '$vm',
                resolve: {
                    ocompy : function(OCompy){
                        return OCompy.get();
                    },
                    bool: function (SysCode){
                        return SysCode.get('Boolean');
                    },
                    opType : function (SysCode){
                        return SysCode.get('OpType');
                    },
                    userInfo: function(UserInfo){
                        return UserInfo.get();
                    }
                }
            }
        }
    })

    .state('app.oselfwork.oassistantjobs.ojob001', {
        url: '/ojob001',
        data: {
            title: 'OJob001'
        },
        params: { 
            data: null
        },
        parent: 'app.oselfwork.oassistantjobs',
        views: {
            "content@app" : {
                templateUrl: 'app/OSelfWork/views/jobs/ojob001.html',
                controller: 'OJob001Ctrl',
                controllerAs: '$vm',
                resolve: {
                    bool: function (SysCode){
                        return SysCode.get('Boolean');
                    }
                }
            }
        }
    })

    .state('app.oselfwork.oemployeejobs', {
        url: '/oselfwork/oemployeejobs',
        data: {
            title: 'OEmployeeJobs'
        },
        views: {
            "content@app" : {
                templateUrl: 'app/OSelfWork/views/oemployeeJobs.html',
                controller: 'OEmployeeJobsCtrl',
                controllerAs: '$vm',
                resolve: {
                    ocompy: function(OCompy){
                        return OCompy.get();
                    },
                    userInfo: function(UserInfo){
                        return UserInfo.get();
                    }
                }
            }
        }
    })

    .state('app.oselfwork.oemployeejobs.ojob001', {
        url: '/ojob001',
        data: {
            title: 'OJob001'
        },
        params: { 
            data: null
        },
        parent: 'app.oselfwork.oemployeejobs',
        views: {
            "content@app" : {
                templateUrl: 'app/OSelfWork/views/jobs/ojob001.html',
                controller: 'OJob001Ctrl',
                controllerAs: '$vm',
                resolve: {
                    bool: function (SysCode){
                        return SysCode.get('Boolean');
                    }
                }
            }
        }
    })

    .state('app.oselfwork.oemployeehistorysearch', {
        url: '/oselfwork/oemployeehistorysearch',
        data: {
            title: 'OEmployeeHistorySearch'
        },
        views: {
            "content@app" : {
                templateUrl: 'app/OSelfWork/views/oemployeeHistorySearch.html',
                controller: 'OEmployeeHistorySearchCtrl',
                controllerAs: '$vm',
                resolve: {
                    ocompy: function(OCompy){
                        return OCompy.get();
                    },
                    bool: function (SysCode){
                        return SysCode.get('Boolean');
                    },
                    userInfo: function(UserInfo){
                        return UserInfo.get();
                    }
                }
            }
        }
    })

    .state('app.oselfwork.oemployeehistorysearch.resultojob001', {
        url: '/resultojob001',
        data: {
            title: 'OEmployeeHistorySearchResultOJob001'
        },
        params: { 
            data: null
        },
        parent: 'app.oselfwork.oemployeehistorysearch',
        views: {
            "content@app" : {
                templateUrl: 'app/OSelfWork/views/jobs/ojob001.html',
                controller: 'OJob001Ctrl',
                controllerAs: '$vm',
                resolve: {
                    bool: function (SysCode){
                        return SysCode.get('Boolean');
                    }
                }
            }
        }
    })


});