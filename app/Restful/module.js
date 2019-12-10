"use strict";

angular.module('app.restful', ['ui.router']);

angular.module('app.restful').config(function ($stateProvider){

	$stateProvider
        .state('app.restful', {
            abstract: true,
            data: {
                title: 'Restful'
            }
        })

		.state('app.restful.alantest', {
			url: '/alantest',
            data: {
                title: 'AlanTest'
            },
			views: {
				"content@app" : {
					templateUrl: 'app/Restful/views/test.html',
                    controller: function ($scope, config, RestfulApi, ToolboxApi, Session, $filter) {

                        var $vm = this;

                        angular.extend(this, {
                            // data : config["returnData"],
                            testData : {
                                ID : "",
                                Name : "",
                                Filename : "",
                                Nature : ""
                            },
                            restful : {
                                queryTest : {
                                    status : "",
                                    result : ""
                                },
                                insertTest : {
                                    status : "",
                                    result : ""
                                },
                                updateTest : {
                                    status : "",
                                    result : ""
                                },
                                upsertTest : {
                                    status : "",
                                    result : ""
                                },
                                deleteTest : {
                                    status : "",
                                    result : ""
                                },
                                exportExcelByVarTest : {
                                    status : "",
                                    result : ""
                                },
                                queryTestByTask : {
                                    status : "",
                                    result : ""
                                },
                                changeNatureTest : {
                                    status : "",
                                    result : ""
                                }
                            }
                        });

                        /**
                         * Query Sample
                         */
                        $vm.QueryTest = function(){
                            RestfulApi.SearchMSSQLData({
                                querymain: 'accountManagement',
                                queryname: 'SelectAllUserInfo',
                                params: {
                                    U_ID : $vm.testData.ID
                                }
                            }).then(function (res){
                                $vm.restful.queryTest.status = "成功";
                                if(res["returnData"].length > 0){
                                    $vm.restful.queryTest.result = {
                                        ID : res["returnData"][0]["U_ID"],
                                        Name : res["returnData"][0]["U_Name"]
                                    };
                                }
                            }, function (err){
                                $vm.restful.queryTest.status = "失敗";
                                $vm.restful.queryTest.result = err;
                            });
                        };

                        /**
                         * Insert Sample
                         */
                        $vm.InsertTest = function(){
                            RestfulApi.InsertMSSQLData({
                                insertname: 'Insert',
                                table: 0,
                                params: {
                                    U_ID : $vm.testData.ID,
                                    U_Name : $vm.testData.Name,
                                    U_PW : "TEST",
                                    U_Check : true,
                                    U_CR_User : Session.Get().U_ID,
                                    U_CR_DateTime : $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss')
                                }
                            }).then(function (res) {
                                $vm.restful.insertTest.status = "成功";
                                $vm.restful.insertTest.result = res["returnData"];
                            }, function (err) {
                                $vm.restful.insertTest.status = "失敗";
                                $vm.restful.insertTest.result = err;
                            });
                        };

                        /**
                         * Update Sample
                         */
                        $vm.UpdateTest = function(){
                            RestfulApi.UpdateMSSQLData({
                                updatename: 'Update',
                                table: 0,
                                params: {
                                    U_NAME : $vm.testData.Name,
                                    U_UP_USER : Session.Get().U_ID,
                                    U_UP_DATETIME : $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss')
                                },
                                condition: {
                                    U_ID : $vm.testData.ID
                                }
                            }).then(function (res) {
                                $vm.restful.updateTest.status = "成功";
                                $vm.restful.updateTest.result = res["returnData"];
                            }, function (err) {
                                $vm.restful.updateTest.status = "失敗";
                                $vm.restful.updateTest.result = err;
                            });
                        };

                        /**
                         * Upsert Sample
                         */
                        $vm.UpsertTest = function(){
                            RestfulApi.UpsertMSSQLData({
                                upsertname: 'Upsert',
                                table: 0,
                                params: {
                                    U_NAME : $vm.testData.Name,
                                    U_UP_USER : Session.Get().U_ID,
                                    U_UP_DATETIME : $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss')
                                },
                                condition: {
                                    U_ID : $vm.testData.ID
                                }
                            }).then(function (res) {
                                $vm.restful.upsertTest.status = "成功";
                                $vm.restful.upsertTest.result = res["returnData"];
                            }, function (err) {
                                $vm.restful.upsertTest.status = "失敗";
                                $vm.restful.upsertTest.result = err;
                            });
                        };

                        /**
                         * Delete Sample
                         */
                        $vm.DeleteTest = function(){
                            RestfulApi.DeleteMSSQLData({
                                deletename: 'Delete',
                                table: 0,
                                params: {
                                    U_ID : $vm.testData.ID
                                }
                            }).then(function (res) {
                                $vm.restful.deleteTest.status = "成功";
                                $vm.restful.deleteTest.result = res["returnData"];
                            }, function (err) {
                                $vm.restful.deleteTest.status = "失敗";
                                $vm.restful.deleteTest.result = err;
                            });
                        };

                        /**
                         * ExportExcelByVar Sample
                         */
                        $vm.ExportExcelByVarTest = function(){
                            ToolboxApi.ExportExcelByVar({
                                filename : $vm.testData.Filename,
                                params: {
                                    ID : $vm.testData.ID
                                }
                            }).then(function (res) {
                                $vm.restful.exportExcelByVarTest.status = "成功";
                                $vm.restful.exportExcelByVarTest.result = "匯出成功";
                            }, function (err) {
                                $vm.restful.exportExcelByVarTest.status = "失敗";
                                $vm.restful.exportExcelByVarTest.result = "匯出失敗";
                            });
                        };

                        /**
                         * Query By Task Sample
                         */
                        $vm.QueryTestByTask = function(){
                            RestfulApi.CRUDMSSQLDataByTask([
                                {
                                    crudType: 'Select',
                                    querymain: 'accountManagement',
                                    queryname: 'SelectAllUserInfo',
                                    params: {
                                        U_ID : $vm.testTask.ID1
                                    }
                                },
                                {  
                                    crudType: 'Select',
                                    querymain: 'accountManagement',
                                    queryname: 'SelectAllUserInfo',
                                    params: {
                                        U_ID : $vm.testTask.ID2
                                    }
                                }
                            ]).then(function (res){
                                $vm.restful.queryTestByTask.status = "成功";
                                if(res["returnData"].length > 0){
                                    console.log(res["returnData"]);
                                    $vm.restful.queryTestByTask.result = [
                                        {
                                            data : res["returnData"][0]
                                        },
                                        {
                                            data : res["returnData"][1]
                                        }
                                    ];
                                }
                            }, function (err){
                                $vm.restful.queryTestByTask.status = "失敗";
                                $vm.restful.queryTestByTask.result = err;
                            });
                        };

                        /**
                         * Change Nature Sample
                         */
                        $vm.ChangeNatureTest = function(){
                            ToolboxApi.ChangeNature({
                                ID : "Administrator",
                                PW : "Admin#1",
                                NATURE : $vm.testData.Nature
                            }).then(function (res) {
                                $vm.restful.changeNatureTest.status = "成功";
                                $vm.restful.changeNatureTest.result = res["returnData"];
                            }, function (err) {
                                $vm.restful.changeNatureTest.status = "失敗";
                                $vm.restful.changeNatureTest.result = err;
                            });
                        };

                    },
                    controllerAs: '$vm',
                    resolve: {
                        config: function (RestfulApi) {
                          //   return RestfulApi.SearchMSSQLData({
                          //       queryname: 'SelectAllUserInfo',
		                        // params: {
		                        //     U_ID : "Admin",
		                        //     U_Name : "系統管理員"
		                        // }
                          //   });
                        }
                    }
				}
			}
		})

		.state('app.restful.gridtest', {
			url: '/gridtest',
            data: {
                title: 'GridTest'
            },
			views: {
				"content@app" : {
					templateUrl: 'app/Restful/views/grid.html',
                    controller: function ($scope, RestfulApi) {
                    	this.gridOpts = {
							columnDefs: [
								{ name: 'firstName' },
							    { name: 'lastName' },
							    { name: 'company' },
							    { name: 'gender' }
							],
							data: [
								{
								  "firstName": "Cox",
								  "lastName": "Carney",
								  "company": "Enormo",
								  "gender": "male"
								},
								{
								  "firstName": "Lorraine",
								  "lastName": "Wise",
								  "company": "Comveyer",
								  "gender": "female"
								},
								{
								  "firstName": "Nancy",
								  "lastName": "Waters",
								  "company": "Fuelton",
								  "gender": "female"
								},
								{
								  "firstName": "Misty",
								  "lastName": "Oneill",
								  "company": "Letpro",
								  "gender": "female"
								}
							]
						};
                    },
                    controllerAs: 'gtVM',
                    // resolve: {
                    //     config: function (RestfulApi) {
                    //     	/**
                    //     	 * Select Sample
                    //     	 */
                    //         return RestfulApi.SearchMSSQLData({
                    //             queryname: 'SelectAllUserInfo',
		                  //       params: {
		                  //           U_ID : "Admin",
		                  //           U_Name : "系統管理員"
		                  //       }
                    //         });
                    //     }
                    // }
				}
			}
		})

        .state('app.restful.exceltest', {
            url: '/exceltest',
            data: {
                title: 'ExcelTest'
            },
            views: {
                "content@app" : {
                    templateUrl: 'app/Restful/views/excel.html',
                    controller: 'ExcelTestCtrl',
                    controllerAs: '$vm',
                    resolve: {
                        config: function (RestfulApi) {
                            /**
                             * Select Sample
                             */
                            // return RestfulApi.SearchMSSQLData({
                            //     queryname: 'SelectAllUserInfo',
                            //     params: {
                            //         U_ID : "Admin",
                            //         U_Name : "系統管理員"
                            //     }
                            // });
                        }
                    }
                }
            }
        })
})