angular.module('app')
.factory('Session', function () {
    var session = {};

    return {
        Set: function(pSession) {
            session = pSession;
        },

        Get: function() {
            return session;
        },

        Destroy: function() {
            session = {};
        }
    }

})
.factory('Resource', function ($resource){
    return {
        CRUD : $resource('/restful/crud', null,
            {
                'update': { method: 'PUT' },
                'upsert': { method: 'PATCH' },
                'insert': { method: 'POST' }
            }
        ),
        CRUDBYTASK : $resource('/restful/crudByTask'),
        LOGIN : $resource('/auth/login', null, 
            {
                'insert': { method: 'POST' }
            }
        ),
        LOGOUT : $resource('/auth/logout', null, 
            {
                'insert': { method: 'POST' }
            }
        ),
        VERSION : $resource('/auth/version'),
        RELOADSESSION : $resource('/auth/reLoadSession'),
        EXPORTEXCELBYVAR : $resource('/toolbox/exportExcelByVar', null, 
            {
                'postByArraybuffer': { 
                    method: 'GET',
                    responseType : 'arraybuffer',
                    transformResponse: function(data) {
                        return {
                            response: new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
                        };
                    }
                }
            }
        ),
        EXPORTEXCELBYSQL : $resource('/toolbox/exportExcelBySql', null, 
            {
                'postByArraybuffer': { 
                    method: 'GET',
                    responseType : 'arraybuffer',
                    transformResponse: function(data) {
                        return {
                            response: new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
                        };
                    }
                }
            }
        ),
        EXPORTEXCELBYMULTISQL : $resource('/toolbox/exportExcelByMultiSql', null, 
            {
                'postByArraybuffer': { 
                    method: 'GET',
                    responseType : 'arraybuffer',
                    transformResponse: function(data) {
                        return {
                            response: new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
                        };
                    }
                }
            }
        ),
        EXPORTCSVBYMULTISQL : $resource('/toolbox/exportCsvByMultiSql', null, 
            {
                'postByArraybuffer': { 
                    method: 'GET',
                    responseType : 'arraybuffer',
                    transformResponse: function(data, headers, status, config) {
                        return {
                            response : new Blob([data], { type: 'text/csv' }),
                            headers  : headers,
                            status   : status,
                            config   : config
                        };
                    }
                }
            }
        ),
        DOWNLOADFILES : $resource('/toolbox/downloadFiles', null, 
            {
                'postByArraybuffer': { 
                    method: 'GET',
                    responseType : 'arraybuffer',
                    transformResponse: function(data) {
                        return {
                            response: new Blob([data], { type: 'application/zip, application/octet-stream' })
                        };
                    }
                }
            }
        ),
        SENDMAIL : $resource('/toolbox/sendMail'),
        CHANGENATURE : $resource('/toolbox/changeNature'),
        DOTAX : $resource('/toolbox/doTax'),
        CHANGEONATURE : $resource('/toolbox/changeONature'),
        COMPOSEMENU : $resource('/toolbox/composeMenu')
    };
})
.factory('SysCode', SysCodeResolve)
.factory('Compy', CompyResolve)
.factory('OCompy', OCompyResolve)
.factory('UserGrade', UserGradeResolve)
.factory('UserInfoByGrade', UserInfoByGradeResolve)
.factory('UserInfoByCompyDistribution', UserInfoByCompyDistributionResolve)
.factory('UserInfoByOCompyDistribution', UserInfoByOCompyDistributionResolve)
.factory('UserInfo', UserInfoResolve)
// 伺服器連線狀況
.factory('ServiceStopModal', ServiceStopModalResolve)
// 航班貨況
.factory('OrderStatus', function ($window, toaster) {

    return {
        Get: function(row) {
            if(!angular.isUndefined(row.entity.OL_FLIGHTNO) && !angular.isUndefined(row.entity.OL_MASTER)){

                var _flightNo = row.entity.OL_FLIGHTNO.toUpperCase().split(" "),
                    _master = row.entity.OL_MASTER.split("-");

                switch(_flightNo[0]){
                    case "BR":
                        $window.open('http://www.brcargo.com/ec_web/Default.aspx?TNT_FLAG=Y&AWB_CODE='+_master[0]+'&MAWB_NUMBER='+_master[1]);
                        break;
                    case "CI":
                        $window.open('https://cargo.china-airlines.com/CCNetv2/content/manage/ShipmentTracking.aspx?AwbPfx='+_master[0]+'&AwbNum='+_master[1]+'&checkcode=*7*upHGj');
                        break;
                    case "CX":
                        $window.open('http://www.cathaypacificcargo.com/ManageYourShipment/TrackYourShipment/tabid/108/SingleAWBNo/'+row.entity.OL_MASTER+'/language/en-US/Default.aspx');
                        break;
                    case "HX":
                        $window.open('http://www.hkairlinescargo.com/CargoPortal/sreachYun/zh_TW/'+_master[0]+'/'+_master[1]+'/1/');
                        break;
                    default:
                        toaster.pop('info', '訊息', '此航班代號不在設定內', 3000);
                        break;
                }
            }else{
                toaster.pop('info', '訊息', '航班或主號不存在', 3000);
            }
        }
    }

})
