var setting = require('../app.setting.json');
var http = require('http');
var moment = require('moment');
const querystring = require('querystring');
const dbCommandByTask = require('../until/dbCommandByTask.js');
const async = require('async');

/**
 * GetCargoAircraftTime 背景不斷取得貨機起降時間
 */
var GetCargoAircraftTime = function (){

	var post_options = {
        host: 'ptx.transportdata.tw',
	    // $filter=startswith(ArrivalGate, '5') and (ArrivalAirportID eq 'TPE' or ArrivalAirportID eq 'TSA') and ArrivalTerminal eq '1'&$top=100&$format=JSON
	    // AirlineID B7 BR CA CI CX CZ HX IT KA MU NH NX VJ ZH
	    // $filter=(ArrivalAirportID eq 'TPE' or ArrivalAirportID eq 'TSA') and (AirlineID eq 'B7' or AirlineID eq 'BR' or AirlineID eq 'CA' or AirlineID eq 'CI' or AirlineID eq 'CX' or AirlineID eq 'CZ' or AirlineID eq 'HX' or AirlineID eq 'IT' or AirlineID eq 'KA' or AirlineID eq 'MU' or AirlineID eq 'NH' or AirlineID eq 'NX' or AirlineID eq 'VJ' or AirlineID eq 'ZH')&$top=100&$format=JSON
	    path: "/MOTC/v2/Air/FIDS/Flight?$filter=(ArrivalAirportID%20eq%20%27TPE%27%20or%20ArrivalAirportID%20eq%20%27TSA%27)%20and%20(AirlineID%20eq%20%27B7%27%20or%20AirlineID%20eq%20%27BR%27%20or%20AirlineID%20eq%20%27CA%27%20or%20AirlineID%20eq%20%27CI%27%20or%20AirlineID%20eq%20%27CX%27%20or%20AirlineID%20eq%20%27CZ%27%20or%20AirlineID%20eq%20%27HX%27%20or%20AirlineID%20eq%20%27IT%27%20or%20AirlineID%20eq%20%27KA%27%20or%20AirlineID%20eq%20%27MU%27%20or%20AirlineID%20eq%20%27NH%27%20or%20AirlineID%20eq%20%27NX%27%20or%20AirlineID%20eq%20%27VJ%27%20or%20AirlineID%20eq%20%27ZH%27)&$top=700&$format=JSON",
	    method: 'GET',
        headers: { 
        	'Content-Type': 'application/json; charset=utf-8',
			"Connection": 'keep-alive',
			"Cache-Control": 'max-age=0',
			"Upgrade-Insecure-Requests": 1,
			"User-Agent": 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.89 Safari/537.36 Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
        }
    };

    var Do = function(){

		var post_req = http.request(post_options, function (post_res) {
			
			
			if(post_res.statusCode == 200){
                var content = '';

				post_res.setEncoding('utf8');

	            post_res.on('data', function (chunk){
	                content += chunk;
	            });

		        post_res.on('error', function(err) {
		            // Handle error
		            // console.log(err);
		        });

	            post_res.on('end', function(){
	            	var upsertData = JSON.parse(content),
	            		_conditions = 0,
	            		_noFlightDate = 0;
	            	console.log(moment().format('YYYY-MM-DD HH:mm:ss'), ",航班資訊總筆數:", upsertData.length);

	            	// 有資料再request
	            	if(upsertData.length > 0){
						        
				        var tasks = [];
				        tasks.push(dbCommandByTask.Connect);
				        tasks.push(dbCommandByTask.TransactionBegin);
		            	for(var i in upsertData){
		            		// console.log("ScheduleArrivalTime=>",moment(upsertData[i].ScheduleArrivalTime).format('YYYY-MM-DD HH:mm:ss'));
		            		// console.log("ActualArrivalTime=>",moment(upsertData[i].ActualArrivalTime).format('YYYY-MM-DD HH:mm:ss'));
		            		// console.log("UpdateTime=>",moment(upsertData[i].UpdateTime).format('YYYY-MM-DD HH:mm:ss'));
		            		
		            		// 某些資料會沒有起飛日期
		            		if(upsertData[i].FlightDate){
						        tasks.push(async.apply(dbCommandByTask.UpsertRequestWithTransaction, {
					                crudType : 'Upsert',
									table : 23,
					                params : {
					                	FA_AIR_ROTETYPE       : upsertData[i].AirRouteType,
					                	FA_DEPART_AIRTID      : upsertData[i].DepartureAirportID,
										FA_ARRIVAL_AIRPTID    : upsertData[i].ArrivalAirportID,
										FA_SCHEDL_ARRIVALTIME : upsertData[i].ScheduleArrivalTime == undefined ? null : moment(upsertData[i].ScheduleArrivalTime).format('YYYY-MM-DD HH:mm:ss'),
										FA_SCHEDL_DEPARTTIME  : upsertData[i].ScheduleDepartureTime == undefined ? null : moment(upsertData[i].ScheduleDepartureTime).format('YYYY-MM-DD HH:mm:ss'),
										FA_ACTL_ARRIVALTIME   : upsertData[i].ActualArrivalTime == undefined ? null : moment(upsertData[i].ActualArrivalTime).format('YYYY-MM-DD HH:mm:ss'),
										FA_ACTL_DEPARTTIME    : upsertData[i].ActualDepartureTime == undefined ? null : moment(upsertData[i].ActualDepartureTime).format('YYYY-MM-DD HH:mm:ss'),
										FA_ARRIVAL_REMK       : upsertData[i].ArrivalRemark,
										FA_DEPART_REMK        : upsertData[i].DepartureRemark,
										FA_ARRIVAL_TERNL      : upsertData[i].ArrivalTerminal,
										FA_DEPART_TERNL       : upsertData[i].DepartureTerminal,
										FA_ARRIVAL_GATE       : upsertData[i].ArrivalGate == "" ? null : upsertData[i].ArrivalGate,
										FA_DEPART_GATE        : upsertData[i].DepartureGate == "" ? null : upsertData[i].DepartureGate,
										FA_UP_DATETIME        : moment(upsertData[i].UpdateTime).format('YYYY-MM-DD HH:mm:ss')
					                },
									condition : {
										FA_FLIGHTDATE : upsertData[i].FlightDate,
										FA_FLIGHTNUM  : upsertData[i].FlightNumber,
										FA_AIR_LINEID : upsertData[i].AirlineID
									}
			            		}));
			            		_conditions++;
		            		}else{
		            			_noFlightDate++;
		            		}
		            	}
	            		tasks.push(dbCommandByTask.TransactionCommit);

					    async.waterfall(tasks, function (err, args) {

					        if (err) {
					            // 如果連線失敗就不做Rollback
					            if(Object.keys(args).length !== 0){
					                dbCommandByTask.TransactionRollback(args, function (err, result){
					                    
					                });
					            }

					            console.error("航班更新失敗訊息:", err);
					            // process.exit();
					        }else{
		        				console.log("航班資訊筆數(更新):", _conditions, ",無起飛日期筆數(不更新):", _noFlightDate);
					        }
					    });
					    
	            	}
	            })
	        }
		});

        post_req.on('error', function(err) {
            // Handle error
            console.log('抓取航班失敗，原因:', err);
        });


		post_req.end();

    	// 每隔一段時間之後就撈一次
		setTimeout(Do, setting.MOTC.timer);
    }

    // 先撈第一次
    Do();
}

module.exports.GetCargoAircraftTime = GetCargoAircraftTime;
