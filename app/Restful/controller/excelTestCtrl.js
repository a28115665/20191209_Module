"use strict";

angular.module('app.restful').controller('ExcelTestCtrl', function ($scope, $stateParams, $state, ToolboxApi, Session, toaster, $uibModal) {

    var $vm = this;

    ToolboxApi.ExportExcelByVar({
    	
    }).then(function (res) {
        console.log("s", res);
    }, function (err) {
        console.log("f", res);
    });
});
