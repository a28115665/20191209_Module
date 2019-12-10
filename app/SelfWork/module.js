"use strict";

angular.module('app.selfwork', [
        'ui.router',
        'app.selfwork.leaderoption'
    ]);

angular.module('app.selfwork').config(function ($stateProvider){

    $stateProvider
    .state('app.selfwork', {
        abstract: true,
        data: {
            title: 'SelfWork',
            backgroundClass: 'darkseagreen'
        }
    })

    .state('app.selfwork.customoversix', {
        url: '/selfwork/customoversix',
        data: {
            title: 'CustomOverSix'
        },
        views: {
            "content@app" : {
                templateUrl: 'app/SelfWork/views/customOverSix.html',
                controller: 'CustomOverSixCtrl',
                controllerAs: '$vm',
                resolve: {
                    overSix: function(SysCode) {
                        return SysCode.get('OverSix');
                    },
                    userInfo: function(UserInfo){
                        return UserInfo.get();
                    }
                }
            }
        }
    })

    .state('app.selfwork.leaderjobs', {
        url: '/selfwork/leaderjobs',
        data: {
            title: 'LeaderJobs'
        },
        views: {
            "content@app" : {
                templateUrl: 'app/SelfWork/views/leaderJobs.html',
                controller: 'LeaderJobsCtrl',
                controllerAs: '$vm',
                resolve: {
                    userInfoByGrade : function(UserInfoByGrade, Session){
                        return UserInfoByGrade.get(Session.Get().U_ID, Session.Get().U_GRADE, Session.Get().DEPTS);
                    },
                    compy : function(Compy){
                        return Compy.get();
                    },
                    opType : function (SysCode){
                        return SysCode.get('OpType');
                    }
                }
            }
        }
    })

    .state('app.selfwork.leaderhistorysearch', {
        url: '/selfwork/leaderhistorysearch',
        data: {
            title: 'LeaderHistorySearch'
        },
        views: {
            "content@app" : {
                templateUrl: 'app/SelfWork/views/leaderHistorySearch.html',
                controller: 'LeaderHistorySearchCtrl',
                controllerAs: '$vm',
                resolve: {
                    compy: function(Compy){
                        return Compy.get();
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

    .state('app.selfwork.assistantjobs', {
        url: '/selfwork/assistantjobs',
        data: {
            title: 'AssistantJobs'
        },
        views: {
            "content@app" : {
                templateUrl: 'app/SelfWork/views/assistantJobs.html',
                controller: 'AssistantJobsCtrl',
                controllerAs: '$vm',
                resolve: {
                    compy : function(Compy){
                        return Compy.get();
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

    .state('app.selfwork.assistantjobs.job001', {
        url: '/job001',
        data: {
            title: 'Job001'
        },
        params: { 
            data: null
        },
        parent: 'app.selfwork.assistantjobs',
        views: {
            "content@app" : {
                templateUrl: 'app/SelfWork/views/jobs/job001.html',
                controller: 'Job001Ctrl',
                controllerAs: '$vm',
                resolve: {
                    bool: function (SysCode){
                        return SysCode.get('Boolean');
                    }
                }
            }
        }
    })

    .state('app.selfwork.assistantjobs.job002', {
        url: '/job002',
        data: {
            title: 'Job002'
        },
        params: { 
            data: null
        },
        parent: 'app.selfwork.assistantjobs',
        views: {
            "content@app" : {
                templateUrl: 'app/SelfWork/views/jobs/job002.html',
                controller: 'Job002Ctrl',
                controllerAs: '$vm',
                resolve: {
                    srcipts: function(lazyScript){
                        return lazyScript.register([
                            'build/vendor.ui.js'
                        ])

                    }
                }
            }
        }
    })

    .state('app.selfwork.assistanthistorysearch', {
        url: '/selfwork/assistanthistorysearch',
        data: {
            title: 'AssistantHistorySearch'
        },
        views: {
            "content@app" : {
                templateUrl: 'app/SelfWork/views/assistantHistorySearch.html',
                controller: 'AssistantHistorySearchCtrl',
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

    .state('app.selfwork.assistanthistorysearch.resultjob002', {
        url: '/resultjob002',
        data: {
            title: 'AssistanthistorysearchResultJob002'
        },
        params: { 
            data: null
        },
        parent: 'app.selfwork.assistanthistorysearch',
        views: {
            "content@app" : {
                templateUrl: 'app/SelfWork/views/jobs/job002.html',
                controller: 'Job002Ctrl',
                controllerAs: '$vm',
                resolve: {

                }
            }
        }
    })

    .state('app.selfwork.employeejobs', {
        url: '/selfwork/employeejobs',
        data: {
            title: 'EmployeeJobs'
        },
        views: {
            "content@app" : {
                templateUrl: 'app/SelfWork/views/employeeJobs.html',
                controller: 'EmployeeJobsCtrl',
                controllerAs: '$vm',
                resolve: {
                    compy: function(Compy){
                        return Compy.get();
                    },
                    userInfo: function(UserInfo){
                        return UserInfo.get();
                    }
                }
            }
        }
    })

    .state('app.selfwork.employeejobs.job001', {
        url: '/job001',
        data: {
            title: 'Job001'
        },
        params: { 
            data: null
        },
        parent: 'app.selfwork.employeejobs',
        views: {
            "content@app" : {
                templateUrl: 'app/SelfWork/views/jobs/job001.html',
                controller: 'Job001Ctrl',
                controllerAs: '$vm',
                resolve: {
                    bool: function (SysCode){
                        return SysCode.get('Boolean');
                    }
                }
            }
        }
    })

    .state('app.selfwork.employeejobs.job002', {
        url: '/job002',
        data: {
            title: 'Job002'
        },
        params: { 
            data: null
        },
        parent: 'app.selfwork.employeejobs',
        views: {
            "content@app" : {
                templateUrl: 'app/SelfWork/views/jobs/job002.html',
                controller: 'Job002Ctrl',
                controllerAs: '$vm',
                resolve: {

                }
            }
        }
    })

    .state('app.selfwork.employeejobs.job003', {
        url: '/job003',
        data: {
            title: 'Job003'
        },
        params: { 
            data: null
        },
        parent: 'app.selfwork.employeejobs',
        views: {
            "content@app" : {
                templateUrl: 'app/SelfWork/views/jobs/job003.html',
                controller: 'Job003Ctrl',
                controllerAs: '$vm',
                resolve: {

                }
            }
        }
    })

    .state('app.selfwork.employeehistorysearch', {
        url: '/selfwork/employeehistorysearch',
        data: {
            title: 'EmployeeHistorySearch'
        },
        views: {
            "content@app" : {
                templateUrl: 'app/SelfWork/views/employeeHistorySearch.html',
                controller: 'EmployeeHistorySearchCtrl',
                controllerAs: '$vm',
                resolve: {
                    compy: function(Compy){
                        return Compy.get();
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

    .state('app.selfwork.employeehistorysearch.resultjob001', {
        url: '/resultjob001',
        data: {
            title: 'EmployeeHistorySearchResultJob001'
        },
        params: { 
            data: null
        },
        parent: 'app.selfwork.employeehistorysearch',
        views: {
            "content@app" : {
                templateUrl: 'app/SelfWork/views/jobs/job001.html',
                controller: 'Job001Ctrl',
                controllerAs: '$vm',
                resolve: {
                    bool: function (SysCode){
                        return SysCode.get('Boolean');
                    }
                }
            }
        }
    })

    .state('app.selfwork.employeehistorysearch.resultjob002', {
        url: '/resultjob002',
        data: {
            title: 'EmployeeHistorySearchResultJob002'
        },
        params: { 
            data: null
        },
        parent: 'app.selfwork.employeehistorysearch',
        views: {
            "content@app" : {
                templateUrl: 'app/SelfWork/views/jobs/job002.html',
                controller: 'Job002Ctrl',
                controllerAs: '$vm',
                resolve: {

                }
            }
        }
    })

    .state('app.selfwork.deliveryjobs', {
        url: '/selfwork/deliveryjobs',
        data: {
            title: 'DeliveryJobs'
        },
        views: {
            "content@app" : {
                templateUrl: 'app/SelfWork/views/deliveryJobs.html',
                controller: 'DeliveryJobsCtrl',
                controllerAs: '$vm',
                resolve: {
                    compy: function(Compy){
                        return Compy.get();
                    }
                }
            }
        }
    })

    .state('app.selfwork.deliveryjobs.job003', {
        url: '/job003',
        data: {
            title: 'Job003'
        },
        params: { 
            data: null
        },
        parent: 'app.selfwork.deliveryjobs',
        views: {
            "content@app" : {
                templateUrl: 'app/SelfWork/views/jobs/job003.html',
                controller: 'Job003Ctrl',
                controllerAs: '$vm',
                resolve: {

                }
            }
        }
    })

    .state('app.selfwork.deliveryhistorysearch', {
        url: '/selfwork/deliveryhistorysearch',
        data: {
            title: 'DeliveryHistorySearch'
        },
        views: {
            "content@app" : {
                templateUrl: 'app/SelfWork/views/deliveryHistorySearch.html',
                controller: 'DeliveryHistorySearchCtrl',
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

    .state('app.selfwork.deliveryhistorysearch.resultjob003', {
        url: '/resultjob003',
        data: {
            title: 'DeliveryhistorysearchResultJob003'
        },
        params: { 
            data: null
        },
        parent: 'app.selfwork.deliveryhistorysearch',
        views: {
            "content@app" : {
                templateUrl: 'app/SelfWork/views/jobs/job003.html',
                controller: 'Job003Ctrl',
                controllerAs: '$vm',
                resolve: {

                }
            }
        }
    })
});