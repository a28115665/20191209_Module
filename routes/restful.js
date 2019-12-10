var express = require('express');
var router = express.Router();
var dbCommand = require('../until/dbCommand.js');
var dbCommandByTask = require('../until/dbCommandByTask.js');
var async = require('async');
var setting = require('../app.setting.json');
var until = require('../until/until.js');
var tables = require('../until/table.json');
var dbLogObject = require('../until/dbLog.js');
var basicAuth = require('basic-auth');
var logger = require('../until/log4js.js').logger('restful');

// /**
//  * [description] 權限控管
//  */
// router.use('/crud', function (req, res, next) {

//     // 由前端檢查session 或 後端傳送auth解析
//     let _id = until.FindID(req.session) || basicAuth(req).name;

//     if(_id == null){
//         // res.status(403).json({
//         //     "returnData": '尚無權限'
//         // });
//         res.status(403).send('超時已登出');
//     }else{
//         next()
//     }
// })

/**
 * Restful 查詢
 */
router.get('/crud', function(req, res) {

    try{
    
        let id = until.FindID(req.session),
            action = "查詢",
            querymain = req.query["querymain"],
            queryname = req.query["queryname"],
            params = req.query["params"],
            ip = req.ip;

        // console.log("GET: ", req.query);
        dbCommand.SelectMethod(querymain, queryname, params, function(err, recordset, sql) {

            let log = new dbLogObject(id, querymain, queryname, params, sql, ip, err)
            log.writeLog(action);

            if (err) {
                console.error("查詢失敗錯誤訊息:", err);

                // Do something with your error...
                res.status(403).send('查詢失敗');
            } else {
                
                res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')
                .status(200)
                .json({
                    "returnData": recordset
                });
            }
        })

    } catch(e) {
        logger.error(e);
    }

});

/**
 * Restful 新增
 */
router.post('/crud', function(req, res) {

    try{

        let id = until.FindID(req.session),
            action = "新增",
            insertname = req.query["insertname"],
            table = req.query["table"],
            params = req.query["params"],
            ip = req.ip;

        // console.log("POST: ", req.body);
        dbCommand.InsertMethod(insertname, table, params, function(err, affected, sql) {

            // Log紀錄
            let log = new dbLogObject(id, insertname, tables[table], params, sql, ip, err)
            log.writeLog(action);

            if (err) {
                console.error("新增失敗錯誤訊息:", err);

                // console.log(err);
                // Do something with your error...
                res.status(403).send('新增失敗');
            } else {

                res.json({
                    "returnData": affected
                });
            }
        })

    } catch(e) {
        logger.error(e);
    }
    
});

/**
 * Restful 更新
 */
router.put('/crud', function(req, res) {

    try{

        let id = until.FindID(req.session),
            action = "更新",
            updatename = req.query["updatename"],
            table = req.query["table"],
            params = req.query["params"],
            condition = req.query["condition"],
            ip = req.ip;

        // console.log("PUT: ", req.body);
        dbCommand.UpdateMethod(updatename, table, params, condition, function(err, affected, sql) {

            // Log紀錄
            let log = new dbLogObject(id, updatename, tables[table], JSON.stringify(params) + ', ' + JSON.stringify(condition), sql, ip, err)
            log.writeLog(action);

            if (err) {
                console.error("更新失敗錯誤訊息:", err);

                // console.log(err);
                // Do something with your error...
                res.status(403).send('更新失敗');
            } else {

                res.json({
                    "returnData": affected
                });
            }
        })

    } catch(e) {
        logger.error(e);
    }
    
});

/**
 * Restful 插入
 */
router.patch('/crud', function(req, res) {

    try{

        let id = until.FindID(req.session),
            action = "插入",
            upsertname = req.query["upsertname"],
            table = req.query["table"],
            params = req.query["params"],
            condition = req.query["condition"],
            ip = req.ip;

        // console.log("PATCH: ", req.query);
        dbCommand.UpsertMethod(upsertname, table, params, condition, function(err, affected, sql) {
            
            // Log紀錄
            let log = new dbLogObject(id, upsertname, tables[table], JSON.stringify(params) + ', ' + JSON.stringify(condition), sql, ip, err)
            log.writeLog(action);

            if (err) {
                console.error("插入失敗錯誤訊息:", err);

                // console.log(err);
                // Do something with your error...
                res.status(403).send('插入失敗');
            } else {

                res.json({
                    "returnData": affected
                });
            }
        })

    } catch(e) {
        logger.error(e);
    }
    
});

/**
 * Restful 刪除
 */
router.delete('/crud', function(req, res) {

    try{

        let id = until.FindID(req.session),
            action = "刪除",
            deletename = req.query["deletename"],
            table = req.query["table"],
            params = req.query["params"],
            ip = req.ip;

        // console.log("DELETE: ", req.query);
        dbCommand.DeleteMethod(deletename, table, params, function(err, affected, sql) {

            // Log紀錄
            let log = new dbLogObject(id, deletename, tables[table], params, sql, ip, err)
            log.writeLog(action);

            if (err) {
                console.error("刪除失敗錯誤訊息:", err);

                // Do something with your error...
                res.status(403).send('刪除失敗');
            } else {

                res.json({
                    "returnData": affected
                });
            }
        })

    } catch(e) {
        logger.error(e);
    }
    
});


/**
 * Restful By Task 查詢
 * 參考 http://qiita.com/mima_ita/items/dc867fa4f316d85533b1
 */
router.get('/crudByTask', function(req, res) {

    try{

        let id = until.FindID(req.session),
            ip = req.ip;

        var tasks = [];
        tasks.push(dbCommandByTask.Connect);
        tasks.push(dbCommandByTask.TransactionBegin);

        for(var i in req.query){
            var _task = JSON.parse(req.query[i]);
            switch(_task.crudType){
                case "Select":
                    tasks.push(async.apply(dbCommandByTask.SelectRequestWithTransaction, _task));
                    break;
                case "Insert":
                    tasks.push(async.apply(dbCommandByTask.InsertRequestWithTransaction, _task));
                    break;
                case "Update":
                    tasks.push(async.apply(dbCommandByTask.UpdateRequestWithTransaction, _task));
                    break;
                case "Delete":
                    tasks.push(async.apply(dbCommandByTask.DeleteRequestWithTransaction, _task));
                    break;
                case "Upsert":
                    tasks.push(async.apply(dbCommandByTask.UpsertRequestWithTransaction, _task));
                    break;
                case "Copy":
                    tasks.push(async.apply(dbCommandByTask.CopyRequestWithTransaction, _task));
                    break;
                default:
                    break;
            }
        }

        tasks.push(dbCommandByTask.TransactionCommit);
        // tasks.push(dbCommandByTask.DisConnect);
        // console.log(tasks);

        async.waterfall(tasks, function (err, args) {

            // Log紀錄
            for(let i in args.tasks){
                switch(args.tasks[i].crudType){
                    case "Select":
                        new dbLogObject(id, args.tasks[i].querymain, args.tasks[i].queryname, JSON.stringify(args.tasks[i].params), args.statement[i], ip, err).writeLog("查詢");
                        break;
                    case "Insert":
                        new dbLogObject(id, args.tasks[i].insertname, tables[args.tasks[i].table], JSON.stringify(args.tasks[i].params), args.statement[i], ip, err).writeLog("新增");
                        break;
                    case "Update":
                        new dbLogObject(id, args.tasks[i].updatename, tables[args.tasks[i].table], JSON.stringify(args.tasks[i].params) + ', ' + JSON.stringify(args.tasks[i].condition), args.statement[i], ip, err).writeLog("更新");
                        break;
                    case "Delete":
                        new dbLogObject(id, args.tasks[i].upsertname, tables[args.tasks[i].table], JSON.stringify(args.tasks[i].params), args.statement[i], ip, err).writeLog("刪除");
                        break;
                    case "Upsert":
                        new dbLogObject(id, args.tasks[i].deletename, tables[args.tasks[i].table], JSON.stringify(args.tasks[i].params) + ', ' + JSON.stringify(args.tasks[i].condition), args.statement[i], ip, err).writeLog("插入");
                        break;
                    case "Copy":
                        new dbLogObject(id, args.tasks[i].querymain, args.tasks[i].queryname, JSON.stringify(args.tasks[i].params), args.statement[i], ip, err).writeLog("複製");
                        break;
                    default:
                        break;
                }
            }

            if (err) {
                // 如果連線失敗就不做Rollback
                if(Object.keys(args).length !== 0){
                    dbCommandByTask.TransactionRollback(args, function (err, result){
                        
                    });
                }

                console.error("任務失敗錯誤訊息:", err);

                res.status(403).send('任務失敗');
                // process.exit();
            }else{
                // console.log("args:", args);
                res.json({
                    "returnData": args.result
                });
            }
        });

    } catch(e) {
        logger.error(e);
    }

});

module.exports = router;
