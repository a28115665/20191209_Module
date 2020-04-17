"use strict";

angular.module('app.settings', [
        'ui.router',
        'app.settings.externalmanagement.sub',
        'app.settings.oexternalmanagement.sub'
    ]);

angular.module('app.settings').config(function ($stateProvider){

	$stateProvider
    .state('app.settings', {
        abstract: true,
        data: {
            title: 'Settings'
        }
    })

	.state('app.settings.profile', {
		url: '/settings/profile',
        data: {
            title: 'Profile'
        },
		views: {
			"content@app" : {
				templateUrl: 'app/Settings/views/profile.html',
                controller: 'ProfileCtrl',
                controllerAs: '$vm',
                resolve: {
                }
			}
		}
	})

    .state('app.settings.accountmanagement', {
        url: '/settings/accountmanagement',
        data: {
            title: 'AccountManagement'
        },
        views: {
            "content@app" : {
                templateUrl: 'app/Settings/views/accountManagement.html',
                controller: 'AccountManagementCtrl',
                controllerAs: '$vm',
                resolve: {
                    // Grid的篩選條件
                    bool: function (SysCode){
                        return SysCode.get('Boolean');
                    },
                    role: function (SysCode){
                        return SysCode.get('Role');
                    },
                    userGrade: function (UserGrade){
                        return UserGrade.get();
                    }
                }
            }
        }
    })

    .state('app.settings.accountmanagement.account', {
        url: '/account',
        data: {
            title: 'Account'
        },
        params: { 
            data: null
        },
        views: {
            "content@app" : {
                templateUrl: 'app/Settings/views/accountmanagement/account.html',
                controller: 'AccountCtrl',
                controllerAs: '$vm',
                resolve: {
                    bool: function (SysCode, $q){
                        return SysCode.get('Boolean');
                    },
                    role : function (SysCode){
                        return SysCode.get('Role');
                    },
                    userGrade : function (UserGrade){
                        return UserGrade.get();
                    }
                }
            }
        }
    })

    .state('app.settings.accountmanagement.group', {
        url: '/group',
        data: {
            title: 'Group'
        },
        params: { 
            data: null
        },
        views: {
            "content@app" : {
                templateUrl: 'app/Settings/views/accountmanagement/group.html',
                controller: 'GroupCtrl',
                controllerAs: '$vm',
                resolve: {
                    bool: function (SysCode, $q){
                        return SysCode.get('Boolean');
                    }
                }
            }
        }
    })

    .state('app.settings.billboardeditor', {
        url: '/settings/billboardeditor',
        data: {
            title: 'BillboardEditor'
        },
        views: {
            "content@app" : {
                templateUrl: 'app/Settings/views/billboardEditor.html',
                controller: 'BillboardEditorCtrl',
                controllerAs: '$vm',
                resolve: {
                    bool: function (SysCode){
                        return SysCode.get('Boolean');
                    },
                    ioType: function (SysCode){
                        return SysCode.get('IOType');
                    }
                }
            }
        }
    })

    .state('app.settings.billboardeditor.news', {
        url: '/news',
        data: {
            title: 'News'
        },
        params: { 
            data: null
        },
        views: {
            "content@app" : {
                templateUrl: 'app/Settings/views/news.html',
                controller: 'NewsCtrl',
                controllerAs: '$vm',
                resolve: {
                    bool: function (SysCode, $q){
                        return SysCode.get('Boolean');
                    },
                    ioType: function (SysCode){
                        return SysCode.get('IOType');
                    },
                    srcipts: function(lazyScript){
                        return lazyScript.register([
                            'build/vendor.ui.js'
                        ])

                    }
                }
            }
        }
    })

    .state('app.settings.externalmanagement', {
        url: '/settings/externalmanagement',
        data: {
            title: 'ExternalManagement'
        },
        views: {
            "content@app" : {
                templateUrl: 'app/Settings/views/externalManagement.html',
                controller: 'ExternalManagementCtrl',
                controllerAs: '$vm',
                resolve: {
                    bool: function (SysCode){
                        return SysCode.get('Boolean');
                    },
                    compy: function(Compy){
                        return Compy.get();
                    },
                    coWeights: function (SysCode){
                        return SysCode.get('CoWeights');
                    }
                }
            }
        }
    })

    .state('app.settings.oexternalmanagement', {
        url: '/settings/oexternalmanagement',
        data: {
            title: 'OExternalManagement'
        },
        views: {
            "content@app" : {
                templateUrl: 'app/Settings/views/oexternalManagement.html',
                controller: 'OExternalManagementCtrl',
                controllerAs: '$vm',
                resolve: {
                    bool: function (SysCode){
                        return SysCode.get('Boolean');
                    },
                    ocompy: function(OCompy){
                        return OCompy.get();
                    },
                    coWeights: function (SysCode){
                        return SysCode.get('CoWeights');
                    }
                }
            }
        }
    })

    .state('app.settings.aviationmail', {
        url: '/settings/aviationmail',
        data: {
            title: 'AviationMail'
        },
        views: {
            "content@app" : {
                templateUrl: 'app/Settings/views/aviationMail.html',
                controller: 'AviationMailCtrl',
                controllerAs: '$vm',
                resolve: {
                    
                }
            }
        }
    })

    .state('app.settings.aviationmail.targeteditor', {
        url: '/targeteditor',
        data: {
            title: 'TargetEditor'
        },
        params: { 
            data: null
        },
        parent: 'app.settings.aviationmail',
        views: {
            "content@app" : {
                templateUrl: 'app/Settings/views/aviationMail/targetEditor.html',
                controller: 'TargetEditorCtrl',
                controllerAs: '$vm',
                resolve: {
                    srcipts: function(lazyScript){
                        return lazyScript.register([
                            'build/vendor.ui.js'
                        ])

                    },
                    bool: function (SysCode){
                        return SysCode.get('Boolean');
                    }
                }
            }
        }
    })

    .state('app.settings.excompybagno', {
        url: '/settings/excompybagno',
        data: {
            title: 'ExcompyBagno'
        },
        views: {
            "content@app" : {
                templateUrl: 'app/Settings/views/excompyBagno.html',
                controller: 'ExcompyBagnoCtrl',
                controllerAs: '$vm',
                resolve: {
                    bool: function (SysCode){
                        return SysCode.get('Boolean');
                    }
                }
            }
        }
    })

    .state('app.settings.bagnocount', {
        url: '/settings/bagnocount',
        data: {
            title: 'BagnoCount'
        },
        views: {
            "content@app" : {
                templateUrl: 'app/Settings/views/bagnoCount.html',
                controller: 'BagnoCountCtrl',
                controllerAs: '$vm',
                resolve: {
                    userInfo: function(UserInfo){
                        return UserInfo.get();
                    }
                }
            }
        }
    })

    .state('app.settings.syslogs', {
        url: '/settings/syslogs',
        data: {
            title: 'SysLogs'
        },
        views: {
            "content@app" : {
                templateUrl: 'app/Settings/views/sysLogs.html',
                controller: 'SysLogsCtrl',
                controllerAs: '$vm',
                resolve: {
                    userInfo: function(UserInfo){
                        return UserInfo.get();
                    }
                }
            }
        }
    })

});