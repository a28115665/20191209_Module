var express = require('express');
var router = express.Router();
var dbcommand = require('../until/dbCommand.js');
var dbCommandByTask = require('../until/dbCommandByTask.js');
var async = require('async');
var setting = require('../app.setting.json');
var http = require('http');
var querystring = require('querystring');
var until = require('../until/until.js');
var dbLogObject = require('../until/dbLog.js');
var logger = require('../until/log4js.js').logger('auth');

/**
 * 重新讀取Session
 * 有資料回傳 session
 * 沒資料回傳 null
 */
router.get('/reLoadSession', function(req, res) {
    try{
        // console.log(new Date() +': '+ req.session.key.U_ID);
        res.json({
            "returnData" : req.session.key
        });
    } catch(e) {
        logger.error(e);
        res.status(403).send('讀取Session失敗');
    }
});

/**
 * 登入
 */
router.post('/login', function(req, res) {
    // console.log(req.body);
    // req.session.key = {
    //     username: req.body.email,
    //     password: req.body.password
    // }

    // req.session.save(function(err) {
    //     // session saved
    //     console.log(err);
    // });

    let id = req.body.U_ID,
        ip = req.ip;

    try{        
        // console.log(res.statusCode, req.query);

        // Build the post string from an object
        // var post_data = querystring.stringify([
        //     JSON.stringify({
        //         crudType : 'Select',
        //         querymain : 'login',
        //         queryname : 'SelectAllUserInfo',
        //         params : {
        //             U_ID : req.body.U_ID,
        //             U_PW : req.body.U_PW
        //         }
        //     }),
        //     JSON.stringify({
        //         crudType : 'Select',
        //         querymain : 'login',
        //         queryname : 'SelectUserDept',
        //         params : {
        //             UD_ID : req.body.U_ID
        //         }
        //     }),
        //     JSON.stringify({
        //         crudType : 'Select',
        //         querymain : 'composeMenu',
        //         queryname : 'GetUserRight',
        //         params : {
        //             U_ID : req.body.U_ID
        //         }
        //     })
        // ]);
        
        // // An object of options to indicate where to post to
        // var post_options = {
        //     host: '127.0.0.1',
        //     port: setting.NodeJs.port,
        //     path: '/restful/crudByTask?'+post_data,
        //     method: 'GET'
        // };

        // // Set up the request
        // var post_req = http.request(post_options, function (post_res) {

        //     // console.log("statusCode: ", post_res.statusCode);
        //     //console.log("headers: ", post_res.headers);
            
        //     if(post_res.statusCode == 200){
        //         var content = '';

        //         post_res.setEncoding('utf8');

        //         post_res.on('data', function(chunk) {
        //             content += chunk;
        //         });

        //         post_res.on('end', function() {
        //             var _content = JSON.parse(content);
        //             // console.log(_content.returnData[0]);
        //             // console.log(_content.returnData[1]);

        //             if(req.session != undefined){
                        
        //                 if(_content.returnData[0].length > 0){
        //                     // 塞入部門資訊
        //                     _content.returnData[0][0]["DEPTS"] = _content.returnData[1];

        //                     // 權限
        //                     var gRight = _content.returnData[2],
        //                         gRightItem = {
        //                             "app.default" : true // 前端預設頁面
        //                         };

        //                     // 權限轉換物件
        //                     for(var igRight in gRight){
        //                         gRightItem[gRight[igRight].PROG_PATH] = (gRight[igRight].USER_RIGHT == 'true');
        //                     }

        //                     // 塞入個人Menu權限
        //                     _content.returnData[0][0]["GRIGHT"] = gRightItem;

        //                     // 資料塞入Session
        //                     req.session.key = _content.returnData[0][0]

        //                     req.session.save(function(err) {
        //                         // session saved
        //                         if(err) throw err; //console.log(err);
        //                     });

        //                 }

        //                 new dbLogObject(id, null, null, null, null, ip, null).writeLog("登入");

        //                 // res.redirect('/#/dashboard');
        //                 res.json({
        //                     "returnData": _content.returnData[0]
        //                 });

        //             }else{
        //                 res.status(403).send('Session未開啟');
        //             }
        //         });
        //     }else{
        //         new dbLogObject(id, null, null, null, null, ip, "登入失敗").writeLog("登入");
        //         res.status(403).send('登入失敗');
        //     }
        // });

        // post_req.end(); 

        var tasks = [];
        tasks.push(dbCommandByTask.Connect);
        tasks.push(dbCommandByTask.TransactionBegin);
        tasks.push(async.apply(dbCommandByTask.SelectRequestWithTransaction, {
            crudType : 'Select',
            querymain : 'login',
            queryname : 'SelectAllUserInfo',
            params : {
                U_ID : req.body.U_ID,
                U_PW : req.body.U_PW
            }
        }));
        tasks.push(async.apply(dbCommandByTask.SelectRequestWithTransaction, {
            crudType : 'Select',
            querymain : 'login',
            queryname : 'SelectUserDept',
            params : {
                UD_ID : req.body.U_ID
            }
        }));
        tasks.push(async.apply(dbCommandByTask.SelectRequestWithTransaction, {
            crudType : 'Select',
            querymain : 'composeMenu',
            queryname : 'GetUserRight',
            params : {
                U_ID : req.body.U_ID
            }
        }));
        tasks.push(dbCommandByTask.TransactionCommit);
        async.waterfall(tasks, function (err, args) {

            if (err) {
                // 如果連線失敗就不做Rollback
                if(Object.keys(args).length !== 0){
                    dbCommandByTask.TransactionRollback(args, function (err, result){
                        
                    });
                }

                console.error("登入失敗錯誤訊息:", err);

                res.status(403).send('登入失敗');
                // process.exit();
            }else{
                // console.log("args:", args);
                // res.json({
                //     "returnData": args.result
                // });

                if(req.session != undefined){

                    var _content = args.result;
                        
                    if(_content[0].length > 0){
                        // 塞入部門資訊
                        _content[0][0]["DEPTS"] = _content[1];

                        // 權限
                        var gRight = _content[2],
                            gRightItem = {
                                "app.default" : true // 前端預設頁面
                            };

                        // 權限轉換物件
                        for(var igRight in gRight){
                            gRightItem[gRight[igRight].PROG_PATH] = (gRight[igRight].USER_RIGHT == 'true');
                        }

                        // 塞入個人Menu權限
                        _content[0][0]["GRIGHT"] = gRightItem;

                        // 資料塞入Session
                        req.session.key = _content[0][0]

                        req.session.save(function(err) {
                            // session saved
                            if(err) throw err; //console.log(err);
                        });

                    }

                    new dbLogObject(id, null, null, null, null, ip, null).writeLog("登入");

                    // res.redirect('/#/dashboard');
                    res.json({
                        "returnData": _content[0]
                    });

                }else{
                    res.status(403).send('Session未開啟');
                }
            }
        });

    } catch(e) {
        new dbLogObject(id, null, null, null, null, ip, e).writeLog("登入");
        logger.error(e);
        res.status(403).send('登入失敗');
    }
});

/**
 * 登出
 */
router.post('/logout', function(req, res) {

    let id = until.FindID(req.session),
        ip = req.ip;

    try {

        req.session.destroy(function(err) {

            if(!err) return;

            // session saved
            // console.log("LogoutError: "+err);
            logger.error("Session Logout Error: "+err);
        });

        new dbLogObject(id, null, null, null, null, ip, null).writeLog("登出");

        res.json({
            "returnData": "登出成功"
        });
    } catch (e) {
        new dbLogObject(id, null, null, null, null, ip, null).writeLog("登出");
        logger.error(e);
        res.status(403).send('登出失敗');
    }

});

/**
 * 版本
 */
router.get('/version', function(req, res) {

    try {
        var version = until.getConfig('../version.json');

        res.json({
            "returnData": version.version
        });
    } catch (e) {
        logger.error(e);
    }

});

module.exports = router;
