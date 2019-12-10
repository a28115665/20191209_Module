angular.module('app')
.service('RestfulApi', function ($http, $q, Resource){

	this.SearchMSSQLData = function (dataSrc) {
	    // console.log(dataSrc);
	    var deferred = $q.defer();

	    Resource.CRUD.get(dataSrc, 
	    	function (pSResponse){
				deferred.resolve(pSResponse);
			},
	    	function (pFResponse){
	    		deferred.reject(pFResponse.data);
	    	});

	    return deferred.promise
	},

	this.InsertMSSQLData = function (dataSrc) {
	    // console.log(dataSrc);
	    var deferred = $q.defer();

	    Resource.CRUD.insert(dataSrc, {}, 
	    	function (pSResponse){
				deferred.resolve(pSResponse);
			},
	    	function (pFResponse){
	    		deferred.reject(pFResponse.data);
	    	});

	    return deferred.promise
	},

	this.UpdateMSSQLData = function (dataSrc) {
	    // console.log("Update:", dataSrc);
	    var deferred = $q.defer();

	    Resource.CRUD.update(dataSrc, {}, 
	    	function (pSResponse){
				deferred.resolve(pSResponse);
			},
	    	function (pFResponse){
	    		deferred.reject(pFResponse.data);
	    	});

	    return deferred.promise
	},

	this.UpsertMSSQLData = function (dataSrc) {
	    // console.log(dataSrc);
	    var deferred = $q.defer();

	    Resource.CRUD.upsert(dataSrc, {}, 
	    	function (pSResponse){
				deferred.resolve(pSResponse);
			},
	    	function (pFResponse){
	    		deferred.reject(pFResponse.data);
	    	});

	    return deferred.promise
	},

	this.DeleteMSSQLData = function (dataSrc) {
	    // console.log(dataSrc);
	    var deferred = $q.defer();

	    Resource.CRUD.remove(dataSrc, {}, 
	    	function (pSResponse){
				deferred.resolve(pSResponse);
			},
	    	function (pFResponse){
	    		deferred.reject(pFResponse.data);
	    	});

	    return deferred.promise
	},

	this.CRUDMSSQLDataByTask = function (dataSrc) {
	    // console.log(dataSrc);
	    var deferred = $q.defer();

	    Resource.CRUDBYTASK.get(dataSrc, {}, 
	    	function (pSResponse){
				deferred.resolve(pSResponse);
			},
	    	function (pFResponse){
	    		deferred.reject(pFResponse.data);
	    	});

	    return deferred.promise
	};
})
.service('AuthApi', function ($http, $q, Resource, Session){

	this.Login = function (dataSrc) {
	    // console.log(dataSrc);
	    var deferred = $q.defer();

	    Resource.LOGIN.insert(dataSrc,
	    	function (pSResponse){
				deferred.resolve(pSResponse);
			},
	    	function (pFResponse){
	    		deferred.reject(pFResponse.data);
	    	});

	    return deferred.promise
	},

	this.Logout = function () {
	    var deferred = $q.defer();
	    
	    Resource.LOGOUT.insert({},
	    	function (pSResponse){
				deferred.resolve(pSResponse);
			},
	    	function (pFResponse){
	    		deferred.reject(pFResponse.data);
	    	});

	    return deferred.promise
	},

	this.ReLoadSession = function () {
	    var deferred = $q.defer();
	    
	    Resource.RELOADSESSION.get({},
	    	function (pSResponse){
                Session.Set(pSResponse["returnData"]);
				deferred.resolve(pSResponse);
			},
	    	function (pFResponse){
	    		Session.Destroy();
	    		deferred.reject(pFResponse.data);
	    	});

	    return deferred.promise
	},

	this.Version = function () {
	    var deferred = $q.defer();
	    
	    Resource.VERSION.get({},
	    	function (pSResponse){
				deferred.resolve(pSResponse);
			},
	    	function (pFResponse){
	    		deferred.reject(pFResponse.data);
	    	});

	    return deferred.promise
	}
})
.service('ToolboxApi', function ($http, $q, Resource){

	this.ExportExcelByVar = function (dataSrc) {
	    // console.log(dataSrc);
	    var deferred = $q.defer();

	    Resource.EXPORTEXCELBYVAR.postByArraybuffer(dataSrc,
	    	function (pSResponse){

	    		var objectUrl = URL.createObjectURL(pSResponse["response"]);
                var link = document.createElement('a');
                if (typeof link.download === 'string') {
                    // Firefox requires the link to be in the body
                    document.body.appendChild(link); 
                    link.download = angular.isUndefined(dataSrc.filename) ? '未知' : dataSrc.filename ;
                    link.href = objectUrl;
                    link.click();
                    // remove the link when done
                    document.body.removeChild(link); 
                } else {
                    location.replace(objectUrl);
                }

				deferred.resolve(pSResponse);
			},
	    	function (pFResponse){
	    		deferred.reject(pFResponse.data);
	    	});

	    return deferred.promise
	},

	this.ExportExcelBySql = function (dataSrc) {
	    // console.log(dataSrc);
	    var deferred = $q.defer();

	    Resource.EXPORTEXCELBYSQL.postByArraybuffer(dataSrc,
	    	function (pSResponse){

	    		var objectUrl = URL.createObjectURL(pSResponse["response"]);
                var link = document.createElement('a');
                if (typeof link.download === 'string') {
                    // Firefox requires the link to be in the body
                    document.body.appendChild(link); 
                    link.download = angular.isUndefined(dataSrc.filename) ? '未知' : dataSrc.filename ;
                    link.href = objectUrl;
                    link.click();
                    // remove the link when done
                    document.body.removeChild(link); 
                } else {
                    location.replace(objectUrl);
                }

				deferred.resolve(pSResponse);
			},
	    	function (pFResponse){
	    		deferred.reject(pFResponse.data);
	    	});

	    return deferred.promise
	},

	this.ExportExcelByMultiSql = function (dataSrc) {
	    // console.log(dataSrc);
	    var deferred = $q.defer();

	    Resource.EXPORTEXCELBYMULTISQL.postByArraybuffer(dataSrc,
	    	function (pSResponse){

	    		var objectUrl = URL.createObjectURL(pSResponse["response"]);
                var link = document.createElement('a');
                if (typeof link.download === 'string') {
                    // Firefox requires the link to be in the body
                    document.body.appendChild(link); 
                    link.download = angular.isUndefined(dataSrc[0].filename) ? '未知' : dataSrc[0].filename ;
                    link.href = objectUrl;
                    link.click();
                    // remove the link when done
                    document.body.removeChild(link); 
                } else {
                    location.replace(objectUrl);
                }

				deferred.resolve(pSResponse);
			},
	    	function (pFResponse){
	    		deferred.reject(pFResponse.data);
	    	});

	    return deferred.promise
	},

	this.DownloadFiles = function (dataSrc) {
	    // console.log(dataSrc);
	    var deferred = $q.defer();

	    Resource.DOWNLOADFILES.postByArraybuffer(dataSrc,
	    	function (pSResponse){

	    		var objectUrl = URL.createObjectURL(pSResponse["response"]);
                var link = document.createElement('a');
                if (typeof link.download === 'string') {
                    // Firefox requires the link to be in the body
                    document.body.appendChild(link); 
                    link.download = angular.isUndefined(dataSrc.filename) ? '未知' : dataSrc.filename ;
                    link.href = objectUrl;
                    link.click();
                    // remove the link when done
                    document.body.removeChild(link); 
                } else {
                    location.replace(objectUrl);
                }

				deferred.resolve(pSResponse);
			},
	    	function (pFResponse){
	    		deferred.reject(pFResponse.data);
	    	});

	    return deferred.promise
	},

	this.SendMail = function (dataSrc) {
	    // console.log(dataSrc);
	    var deferred = $q.defer();

	    Resource.SENDMAIL.get(dataSrc,
	    	function (pSResponse){
				deferred.resolve(pSResponse);
			},
	    	function (pFResponse){
	    		deferred.reject(pFResponse.data);
	    	});

	    return deferred.promise
	},

	this.ChangeNature = function (dataSrc) {
	    // console.log(dataSrc);
	    var deferred = $q.defer();

	    Resource.CHANGENATURE.get(dataSrc,
	    	function (pSResponse){
				deferred.resolve(pSResponse);
			},
	    	function (pFResponse){
	    		deferred.reject(pFResponse.data);
	    	});

	    return deferred.promise
	},

	this.DoTax = function (dataSrc) {
	    // console.log(dataSrc);
	    var deferred = $q.defer();

	    Resource.DOTAX.get(dataSrc,
	    	function (pSResponse){
				deferred.resolve(pSResponse);
			},
	    	function (pFResponse){
	    		deferred.reject(pFResponse.data);
	    	});

	    return deferred.promise
	},

	this.ChangeONature = function (dataSrc) {
	    // console.log(dataSrc);
	    var deferred = $q.defer();

	    Resource.CHANGEONATURE.get(dataSrc,
	    	function (pSResponse){
				deferred.resolve(pSResponse);
			},
	    	function (pFResponse){
	    		deferred.reject(pFResponse.data);
	    	});

	    return deferred.promise
	},

	this.ComposeMenu = function (dataSrc) {
	    // console.log(dataSrc);
	    var deferred = $q.defer();

	    Resource.COMPOSEMENU.get(dataSrc,
	    	function (pSResponse){
				deferred.resolve(pSResponse);
			},
	    	function (pFResponse){
	    		deferred.reject(pFResponse.data);
	    	});

	    return deferred.promise
	}
})
.service('SocketApi', function ($rootScope, APP_CONFIG, $location){

    var socket = null;

    function listenerExists(eventName) {
        return socket.hasOwnProperty("$events") && socket.$events.hasOwnProperty(eventName);
    }

	this.Connect = function () {
        socket = io.connect($location.host() + ':' + APP_CONFIG.socketPort);
    },
    this.Connected = function () {
        return socket != null;
    },
    this.On = function (eventName, callback) {
        if (!listenerExists(eventName)) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        }
    },
    this.Emit = function (eventName, data, callback) {
        socket.emit(eventName, data, function () {
            var args = arguments;
            $rootScope.$apply(function () {
                if (callback) {
                    callback.apply(socket, args);
                }
            });
        })
    },
    this.Disconnect = function(){
        socket.disconnect();
    }

});