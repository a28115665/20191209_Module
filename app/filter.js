angular.module('app')
.filter('booleanFilter', function (SysCode) {

	var resData = {};

	LoadData()

	var FilterFunction = function (input, isLoad){
		if(isLoad){
			LoadData();
		}

		return angular.isUndefined(resData[input]) ? '' : resData[input];
	};
	
	function LoadData(){
		SysCode.get('Boolean').then(function (res){
			for(var i in res){
				resData[res[i].value] = res[i].label;
			}
		});
	}

	// 持續偵測
	FilterFunction.$stateful = true;

	return FilterFunction;
})
.filter('roleFilter', function (SysCode) {

	var resData = {};

	LoadData();

	var FilterFunction = function (input, isLoad){
		if(isLoad){
			LoadData();
		}

		if (!input) {
		    return '';
		} else {
		    return angular.isUndefined(resData[input]) ? input : resData[input];
		}

	};
	
	function LoadData(){
		SysCode.get('Role').then(function (res){
			for(var i in res){
				resData[res[i].value] = res[i].label;
			}
		});
	}

	// 持續偵測
	FilterFunction.$stateful = true;

	return FilterFunction;

})
.filter('opTypeFilter', function (SysCode) {

	var resData = {};

	LoadData();

	var FilterFunction = function (input, isLoad){
		if(isLoad){
			LoadData();
		}

		if (!input) {
		    return '';
		} else {
		    return angular.isUndefined(resData[input]) ? input : resData[input];
		}

	};
	
	function LoadData(){
		SysCode.get('OpType').then(function (res){
			for(var i in res){
				resData[res[i].value] = res[i].label;
			}
		});
	}

	// 持續偵測
	FilterFunction.$stateful = true;

	return FilterFunction;

})
.filter('ioTypeFilter', function (SysCode) {

	var resData = {};

	LoadData();

	var FilterFunction = function (input, isLoad){
		if(isLoad){
			LoadData();
		}

		if (!input) {
		    return '';
		} else {
		    return angular.isUndefined(resData[input]) ? input : resData[input];
		}

	};
	
	function LoadData(){
		SysCode.get('IOType').then(function (res){
			for(var i in res){
				resData[res[i].value] = res[i].label;
			}
		});
	}

	// 持續偵測
	FilterFunction.$stateful = true;

	return FilterFunction;

})
.filter('coWeightsFilter', function (SysCode) {

	var resData = {};

	LoadData();

	var FilterFunction = function (input, isLoad){
		if(isLoad){
			LoadData();
		}

		if (!input) {
		    return '';
		} else {
		    return angular.isUndefined(resData[input]) ? input : resData[input];
		}

	};
	
	function LoadData(){
		SysCode.get('CoWeights').then(function (res){
			for(var i in res){
				resData[res[i].value] = res[i].label;
			}
		});
	}

	// 持續偵測
	FilterFunction.$stateful = true;

	return FilterFunction;

})
.filter('compyFilter', function (Compy) {

	var resData = {};

	LoadData();

	var FilterFunction = function (input, isLoad){
		if(isLoad){
			LoadData();
		}

		if (!input) {
		    return '';
		} else {
		    return angular.isUndefined(resData[input]) ? input : resData[input];
		}

	};
	
	function LoadData(){
		Compy.get().then(function (res){
			for(var i in res){
				resData[res[i].value] = res[i].label.split(' ')[1];
			}
		});
	}

	// 持續偵測
	FilterFunction.$stateful = true;

	return FilterFunction;

})
.filter('ocompyFilter', function (OCompy) {

	var resData = {};

	LoadData();

	var FilterFunction = function (input, isLoad){
		if(isLoad){
			LoadData();
		}

		if (!input) {
		    return '';
		} else {
		    return angular.isUndefined(resData[input]) ? input : resData[input];
		}

	};
	
	function LoadData(){
		OCompy.get().then(function (res){
			for(var i in res){
				resData[res[i].value] = res[i].label.split(' ')[1];
			}
		});
	}

	// 持續偵測
	FilterFunction.$stateful = true;

	return FilterFunction;

})
.filter('coWeightsFilter', function (SysCode) {

	var resData = {};

	LoadData();

	var FilterFunction = function (input, isLoad){
		if(isLoad){
			LoadData();
		}

		if (!input) {
		    return '';
		} else {
		    return angular.isUndefined(resData[input]) ? input : resData[input];
		}

	};
	
	function LoadData(){
		SysCode.get('CoWeights').then(function (res){
			for(var i in res){
				resData[res[i].value] = res[i].label;
			}
		});
	}

	// 持續偵測
	FilterFunction.$stateful = true;

	return FilterFunction;

})
.filter('overSixFilter', function (SysCode) {

	var resData = {};

	LoadData();

	var FilterFunction = function (input, isLoad){
		if(isLoad){
			LoadData();
		}

		if (!input) {
		    return '';
		} else {
		    return angular.isUndefined(resData[input]) ? input : resData[input];
		}

	};
	
	function LoadData(){
		SysCode.get('OverSix').then(function (res){
			for(var i in res){
				resData[res[i].value] = res[i].label;
			}
		});
	}

	// 持續偵測
	FilterFunction.$stateful = true;

	return FilterFunction;

})
.filter('gradeFilter', function (UserGrade) {

	var resData = {};

	LoadData();

	var FilterFunction = function (input, isLoad){
		if(isLoad){
			LoadData();
		}

		if (!input) {
		    return '';
		} else {
		    return angular.isUndefined(resData[input]) ? input : resData[input];
		}

	};
	
	function LoadData(){
		UserGrade.get().then(function (res){
			for(var i in res){
				resData[res[i].value] = res[i].label;
			}
		});
	}

	// 持續偵測
	FilterFunction.$stateful = true;

	return FilterFunction;

})
.filter('userInfoFilter', function (UserInfo, Session) {

	var resData = {};

	LoadData();

	var FilterFunction = function (input, isLoad){
		if(isLoad){
			LoadData();
		}

		if (!input) {
		    return '';
		} else {
		    return angular.isUndefined(resData[input]) ? input : resData[input];
		}

	};

	function LoadData(){
		UserInfo.get().then(function (res){
			for(var i in res){
				resData[res[i].value] = res[i].label;
			}
		});
	}

	// 持續偵測
	FilterFunction.$stateful = true;

	return FilterFunction;

})
.filter('dateFilter', function ($filter) {

	return function (input){
		if (!input) {
		    return '';
		} else {
		    return $filter('date')(input, 'yyyy-MM-dd', 'GMT');
		}

	};

})
.filter('datetimeFilter', function ($filter) {

	return function (input){
		if (!input) {
		    return '';
		} else {
		    return $filter('date')(input, 'yyyy-MM-dd HH:mm:ss', 'GMT');
		}

	};

})
.filter('dataMBSize', function () {

	return function (input){
		return angular.isUndefined(input) ? '' : (parseInt(input)/1024/1024).toFixed(2) + ' MB';
	};

})
.filter('suppleMentFilter', function ($filter) {

	return function (input){
		if (input == null) {
		    return '';
		} else {
		    return '補'+input;
		}

	};

});