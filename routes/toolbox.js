var express = require('express');
var router = express.Router();
var mkdirp = require('mkdirp');
var dbCommand = require('../until/dbCommand.js');
var dbCommandByTask = require('../until/dbCommandByTask.js');
var async = require('async');
var xlsx = require('xlsx');
var tmpXlsObj = require('../until/tmpXlsObj.js');
var setting = require('../app.setting.json');
var templates = require('../templates/templates.json');
var archiver = require('archiver');
var http = require('http');
const querystring = require('querystring');
const nodemailer = require('nodemailer');
var logger = require('../until/log4js.js').logger('toolbox');
var dbLogObject = require('../until/dbLog.js');
var until = require('../until/until.js');

var dateFormat = require('dateformat');

const path = require('path');
const fs = require('fs');
var fsExtra = require('fs-extra');
var busboy = require('connect-busboy');

/**
 * ExportExcelByVar 經由前端參數匯出Excel
 * 測試API
 */
router.get('/exportExcelByVar', function(req, res) {

    var _params = typeof req.query["params"] == "string" ? JSON.parse(req.query["params"]) : req.query["params"]

    var testObj = {
        firstTitle: '人員檔案',
        secondTitle: '個人基本信息',
        thirdTitle: '工作基本信息',
        
        col: [
            {name: "登入名", value: _params["ID"]},
            {name: "部門", value: "門診部"},
            {name: "姓名", value: "王大明"},
            {name: "民族", value: "維吾爾族"},
            {name: "籍貫", value: "蒙古"},
            
        ],
        col2:[
            {name: "畢業學校", value: "清華大學"},
            {name: "職務", value: "主治醫生"},
            {name: "性別", value: "男"},
            {name: "生日", value: dateFormat(new Date('1980-08-09'),"yyyy-MM-dd")},
            {name: "文化程度", value: "博士後"}
        ],
        col3:[
            {name: "入伍時間", value: dateFormat(new Date('1980-08-09'),"yyyy-MM-dd")},
            {name: "現專業技術職務", value: "主治醫生"}                
        ],
        col4:[                    
            {name: "臨床/非臨床專業", value: "臨床"},
            {name: "參加工作時間", value: dateFormat(new Date('1988-07-01'),"yyyy-MM-dd")}                    
        ]
    };

    var testStr = JSON.stringify(testObj);

    tmpXlsObj.GetXls({
        JsonXlsStr : testStr,
        TmpXlsFilePath : path.join(path.dirname(module.parent.filename), 'templates', 'aa.xlsx'), //template xls 路徑(含檔名)
        // OutputXlsPath : path.join(path.dirname(module.parent.filename), 'templates', 'test2.xlsx'),
        SheetNumber : 1
    }, function (err, result){
        if (err) {
            console.log(err);
            // Do something with your error...
            res.status(403).send("匯出失敗");
        } else {

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Length', result.length);
            res.setHeader('Expires', '0');
            // res.setHeader('Content-Disposition', 'attachment; filename=test.xls');
            res.setHeader('Content-Encoding', 'UTF-8');
            res.status(200);

            var buffer = new Buffer(result, "binary");

            res.end(toArrayBuffer(buffer));
        }
    });
});

/**
 * ExportExcelBySql 經由Sql匯出Excel
 */
router.get('/exportExcelBySql', function(req, res) {

    // console.log(req.session.key);
    if(req.query["templates"] == undefined){
        res.status(post_res.statusCode).send('匯出失敗');
    }

    let id = until.FindID(req.session),
        action = "查詢",
        querymain = req.query["querymain"],
        queryname = req.query["queryname"],
        params = req.query["params"],
        ip = req.ip;

    dbCommand.SelectMethod(querymain, queryname, params, function(err, recordset, sql) {

        let log = new dbLogObject(id, querymain, queryname, params, sql, ip, err)
        log.writeLog(action);

        if (err) {
            console.error("匯出失敗錯誤訊息:", err);

            // Do something with your error...
            res.status(403).send('匯出失敗');
        } else {

            try {

                let _params = typeof req.query["params"] == "string" ? JSON.parse(req.query["params"]) : req.query["params"];
                
                // 如果undefined則先宣告物件
                if(_params == undefined){
                    _params = {};
                }

                _params["data"] = recordset;

                // console.log(_params);

                tmpXlsObj.GetXls({
                    JsonXls : _params,
                    TmpXlsFilePath : path.join(path.dirname(module.parent.filename), 'templates', templates[req.query["templates"]]), //template xls 路徑(含檔名)
                    // OutputXlsPath : path.join(path.dirname(module.parent.filename), 'templates', 'test2.xlsx'),
                    SheetNumber : 1
                }, function (err, result){

                    if (err) {
                        // Do something with your error...
                        logger.error('匯出失敗', req.ip, __line+'行', err);
                        res.status(403).send("匯出失敗");
                    } else {

                        try {
                            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                            res.setHeader('Content-Length', result.length);
                            res.setHeader('Expires', '0');
                            // res.setHeader('Content-Disposition', 'attachment; filename=test.xls');
                            res.setHeader('Content-Encoding', 'UTF-8');
                            res.status(200);

                            var buffer = new Buffer(result, "binary");

                            // res.end(toArrayBuffer(buffer));
                            res.end(buffer);
                        } catch(err){
                            logger.error('匯出失敗', req.ip, __line+'行', err);
                            res.status(403).send("匯出失敗");
                        }
                    }
                });
            } 
            catch(err) {
                logger.error('匯出失敗', req.ip, __line+'行', err);
                res.status(403).send("匯出失敗");
            }  
        }
    })
});

/**
 * ExportExcelByMultiSql 經由MultiSql匯出Excel
 */
router.get('/exportExcelByMultiSql', function(req, res) {

    var _query = []
    for(var i in req.query){
        _query.push(req.query[i]);
    }

    if(_query.length == 0){
        res.status(post_res.statusCode).send('匯出失敗');
    }

    // 主要的參數
    var _params = JSON.parse(_query.shift());

    if(_params["templates"] == undefined){
        res.status(post_res.statusCode).send('匯出失敗');
    }
    
    try{

        var tasks = [];
        tasks.push(dbCommandByTask.Connect);
        tasks.push(dbCommandByTask.TransactionBegin);
        for(var i in _query){
            tasks.push(async.apply(dbCommandByTask.SelectRequestWithTransaction, JSON.parse(_query[i])));
        }
        tasks.push(dbCommandByTask.TransactionCommit);
        async.waterfall(tasks, function (err, args) {

            if (err) {
                // 如果連線失敗就不做Rollback
                if(Object.keys(args).length !== 0){
                    dbCommandByTask.TransactionRollback(args, function (err, result){
                        
                    });
                }

                console.error("匯出Excel錯誤訊息:", err);

                res.status(403).send('匯出Excel失敗');
                // process.exit();
            }else{
                for(var i in args.result){
                    _params["data" + i] = args.result[i];
                }

                tmpXlsObj.GetXls({
                    JsonXls : _params,
                    TmpXlsFilePath : path.join(path.dirname(module.parent.filename), 'templates', templates[_params["templates"]]), //template xls 路徑(含檔名)
                    // OutputXlsPath : path.join(path.dirname(module.parent.filename), 'templates', 'test2.xlsx'),
                    SheetNumber : 1
                }, function (err, result){
                    if (err) {
                        // Do something with your error...
                        logger.error('匯出失敗', req.ip, __line+'行', err);
                        res.status(403).send("匯出失敗");
                    } else {

                        try {
                            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                            res.setHeader('Content-Length', result.length);
                            res.setHeader('Expires', '0');
                            // res.setHeader('Content-Disposition', 'attachment; filename=test.xls');
                            res.setHeader('Content-Encoding', 'UTF-8');
                            res.status(200);

                            var buffer = new Buffer(result, "binary");

                            // res.end(toArrayBuffer(buffer));
                            res.end(buffer);
                        } catch(err){
                            logger.error('匯出失敗', req.ip, __line+'行', err);
                            res.status(403).send("匯出失敗");
                        }
                    }
                });
            }
        });

    } catch(err){
        logger.error(err);
        res.status(403).send('匯出Excel error');
    }
});

/**
 * ExportCsvByMultiSql 經由MultiSql匯出Excel
 */
router.get('/exportCsvByMultiSql', function(req, res) {

    var _query = []
    for(var i in req.query){
        _query.push(req.query[i]);
    }

    if(_query.length == 0){
        res.status(post_res.statusCode).send('匯出失敗');
    }

    // 主要的參數
    var _params = JSON.parse(_query.shift());

    if(_params["templates"] == undefined){
        res.status(post_res.statusCode).send('匯出失敗');
    }
    
    try{

        var tasks = [];
        tasks.push(dbCommandByTask.Connect);
        tasks.push(dbCommandByTask.TransactionBegin);
        for(var i in _query){
            tasks.push(async.apply(dbCommandByTask.SelectRequestWithTransaction, JSON.parse(_query[i])));
        }
        tasks.push(dbCommandByTask.TransactionCommit);
        async.waterfall(tasks, function (err, args) {

            if (err) {
                // 如果連線失敗就不做Rollback
                if(Object.keys(args).length !== 0){
                    dbCommandByTask.TransactionRollback(args, function (err, result){
                        
                    });
                }

                console.error("匯出csv錯誤訊息:", err);

                res.status(403).send('匯出csv失敗');
                // process.exit();
            }else{
                for(var i in args.result){
                    _params["data" + i] = args.result[i];
                }

                tmpXlsObj.GetXls({
                    JsonXls : _params,
                    TmpXlsFilePath : path.join(path.dirname(module.parent.filename), 'templates', templates[_params["templates"]]), //template xls 路徑(含檔名)
                    // OutputXlsPath : path.join(path.dirname(module.parent.filename), 'templates', 'test2.xlsx'),
                    SheetNumber : 1
                }, function (err, result){
                    if (err) {
                        // Do something with your error...
                        logger.error('匯出失敗', req.ip, __line+'行', err);
                        res.status(403).send("匯出失敗");
                    } else {

                        try {
                            var buffer = new Buffer(result, "binary");

                            // 再利用js-xlsx元件轉製成csv檔
                            var workbook = xlsx.read(buffer);
                            var csv;
                            workbook.SheetNames.forEach(function(sheetName) {
                                csv = xlsx.utils.sheet_to_csv(workbook.Sheets[sheetName]);
                            });

                            res.setHeader('Content-Type', 'text/csv');
                            // res.setHeader('Content-Length', until.stringBytes(csv));
                            res.setHeader('Expires', '0');
                            res.setHeader("Content-Disposition", "attachment;filename="+_params.filename+".csv");
                            res.setHeader('Content-Encoding', 'UTF-8');
                            res.status(200);

                            // 避免中文亂碼，需轉換成有BOM的樣式
                            var buffer = Buffer.from("\ufeff"+csv, 'utf8');

                            res.end(buffer);
                        } catch(err){
                            logger.error('匯出失敗', req.ip, __line+'行', err);
                            res.status(403).send("匯出失敗");
                        }
                    }
                });
            }
        });

    } catch(err){
        logger.error(err);
        res.status(403).send('匯出csv error');
    }
});

/**
 * Upload 檔案上傳
 */
router.post('/uploadFile', function(req, res) {

    try{
        req.pipe(req.busboy);
        req.busboy.on('file', function(fieldname, file, filename) {

            if(!req.query["filePath"]){
                var _d = new Date();
                req.query["filePath"] = _d.getFullYear() + '\\' + ("0" + (_d.getMonth()+1)).slice(-2) + '\\' + ("0" + _d.getDate()).slice(-2) + '\\';
            }

            var _filepath =  '\\upload\\file\\' + req.query["filePath"],
                _dir = path.dirname(module.parent.filename) + _filepath;

            mkdirp(_dir, function(err) { 
                // path exists unless there was an error
                if(err) throw err;

                var _filename = filename;
                if(req.query["rFilename"]){
                    _filename = req.query["rFilename"];
                }
                var stream = fsExtra.createWriteStream(_dir + _filename);
                file.pipe(stream);
                var _filesize = file._readableState.length;
                stream.on('close', function() {
                    // console.log('File ' + filename + ' is uploaded');
                    res.json({
                        oFilename: filename,
                        rFilename: _filename,
                        Filepath: _dir,
                        Filesize: _filesize
                    });
                });
            });
        });
    } catch(err) {
        logger.error(err);
        res.status(403).send('上傳失敗');
    }

});

/**
 * Download files and zip 壓縮並下載
 */
router.get('/downloadFiles', function(req, res) {

    try{
        var archive = archiver('zip');

        // 發生錯誤時
        archive.on('error', function(err) {
            throw err;
        });

        var _params = JSON.parse(req.query["params"]);
        // 塞入檔案
        for(var i in _params){

            var _param = null;
            // 判斷是不是json
            try {
                _param = JSON.parse(_params[i]);
            } catch (e) {
                _param = _params[i];
            }
            
            archive.append(fs.createReadStream(_param.Filepath + _param.rFilename), { name: _param.oFilename });
        }

        // finalize the archive
        archive.finalize();

        archive.pipe(res);
    } catch(err) {
        logger.error(err);
        res.status(403).send('下載失敗');
    }

});

/**
 * SendMail 寄信
 * 1. 取得帳號密碼
 * 2. 開始寄信
 */
router.get('/sendMail', function(req, res) {

    let id = until.FindID(req.session),
        action = "查詢",
        querymain = 'aviationMail',
        queryname = 'SelectMailAccount',
        params = JSON.stringify({
            MA_USER : setting.GMail.account
        }),
        ip = req.ip;

    dbCommand.SelectMethod(querymain, queryname, params, function(err, recordset, sql) {

        let log = new dbLogObject(id, querymain, queryname, params, sql, ip, err)
        log.writeLog(action);

        if (err) {
            console.error("匯出失敗錯誤訊息:", err);

            // Do something with your error...
            res.status(403).send('匯出失敗');
        } else {

            try {

                var account = recordset;
                // console.warn(account);
                // console.warn(req.query);

                if(account.length > 0){

                    // 撈取銷倉單Excel
                    // var _queryContent = typeof req.query["queryContent"] == "string" ? JSON.parse(req.query["queryContent"]) : {};
                    var _mailContent = typeof req.query["mailContent"] == "string" ? JSON.parse(req.query["mailContent"]) : {};
                    
                    /**
                     * 開始寄信
                     * 宣告發信物件
                     */
                    var transporter = nodemailer.createTransport({
                        service: 'Gmail',
                        auth: {
                            user: account[0].MA_USER,
                            pass: account[0].MA_PASS
                        }
                    });

                    var _to = [],
                        _attchments = [];

                    for(var i in _mailContent.FM_MAIL){
                        _to.push(_mailContent.FM_MAIL[i].text);
                    }

                    // 信件預設檔案
                    for(var i in _mailContent.UploadedData){
                        _attchments.push({
                            // file on disk as an attachment
                            filename: _mailContent.UploadedData[i].FMAF_O_FILENAME,
                            path: _mailContent.UploadedData[i].FMAF_FILEPATH + _mailContent.UploadedData[i].FMAF_R_FILENAME
                        });
                    }

                    // 使用者上傳檔案
                    for(var i in _mailContent.UserUploadedData){
                        _attchments.push({
                            // file on disk as an attachment
                            filename: _mailContent.UserUploadedData[i].FMAF_O_FILENAME,
                            path: _mailContent.UserUploadedData[i].FMAF_FILEPATH + _mailContent.UserUploadedData[i].FMAF_R_FILENAME
                        });
                    }

                    var options = {
                        //寄件者
                        from: account[0].MA_USER,
                        //收件者
                        to: _to.join(";"), 
                        //副本
                        // cc: 'dongfengexpress@gmail.com',
                        //密件副本
                        // bcc: 'dongfengexpress@gmail.com',
                        //主旨
                        subject: _mailContent.FM_TITLE, // Subject line
                        //純文字
                        // text: 'Hello world2', // plaintext body
                        //嵌入 html 的內文
                        html: _mailContent.FM_CONTENT, 
                        //附件檔案
                        attachments: _attchments
                    };

                    //發送信件方法
                    transporter.sendMail(options, function(error, info){
                        if(error){
                            logger.error('寄信失敗', req.ip, __line+'行', error);
                            res.status(403).send('寄信失敗');
                        }else{

                            res.json({
                                "returnData": "ok"
                            });
                            // console.log('訊息發送: ' + info.response);
                        }
                    });
                }else{
                    res.status(403).send('查無寄件人帳號密碼');
                }
            } 
            catch(err) {
                logger.error('寄信失敗', req.ip, __line+'行', err);
                res.status(403).send("寄信失敗");
            }  
        }
    })
});

/**
 * ChangeNature 改單
 */
router.get('/changeNature', function(req, res) {

    try{        
        // console.log(res.statusCode, req.query);

        // Build the post string from an object
        var post_data = querystring.stringify({
            'strJson' : JSON.stringify([
                {
                    "UserId": req.query.ID,
                    "UserPW": req.query.PW,
                    "Nature": req.query.NATURE,
                    "Nature_NEW": req.query.NATURE_NEW == undefined ? "" : req.query.NATURE_NEW
                }
            ])
        });

        // An object of options to indicate where to post to
        var post_options = {
            host: setting.WebService.changeNature.host,
            port: setting.WebService.changeNature.port,
            path: setting.WebService.changeNature.url,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(post_data)
            }
        };

        // Set up the request
        var post_req = http.request(post_options, function (post_res) {

            // console.log("statusCode: ", post_res.statusCode);
            //console.log("headers: ", post_res.headers);
            if(post_res.statusCode == 200){
                var content = '';

                post_res.setEncoding('utf8');

                post_res.on('data', function(chunk) {
                    content += chunk;
                });

                post_res.on('end', function() {
                    // console.log(content);

                    res.json({
                        "returnData": content
                    });
                });
            }else{
                res.status(post_res.statusCode).send('改單失敗');
            }
        });

        // console.log(post_data);
        // post the data
        post_req.write(post_data);

        post_req.on('error', function(err) {
            console.error(err);
            // Handle error
            res.status(403).send('改單失敗');
        });

        post_req.end(); 

    } catch(err) {
        console.error(err);
        res.status(403).send('改單失敗');
    }

});

/**
 * DoTax 稅則
 */
router.get('/doTax', function(req, res) {

    try{        
        // console.log(res.statusCode, req.query);
        var _taxData = [];
        if(req.query.NATURE_NEW_LIST instanceof Array){
            _taxData = req.query.NATURE_NEW_LIST.map(function(value, index, fullArray){
                            return JSON.parse(fullArray[index]);
                        })
        } else{
            _taxData = [JSON.parse(req.query.NATURE_NEW_LIST)];
        }

        // Build the post string from an object
        var post_data = querystring.stringify({
            'strJson' : JSON.stringify([
                {
                    "UserId": req.query.ID,
                    "UserPW": req.query.PW,
                    "Nature_NEW_List": _taxData
                }
            ])
        });

        // An object of options to indicate where to post to
        var post_options = {
            host: setting.WebService.doTax.host,
            port: setting.WebService.doTax.port,
            path: setting.WebService.doTax.url,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(post_data)
            }
        };

        // Set up the request
        var post_req = http.request(post_options, function (post_res) {

            // console.log("statusCode: ", post_res.statusCode);
            //console.log("headers: ", post_res.headers);
            if(post_res.statusCode == 200){
                var content = '';

                post_res.setEncoding('utf8');

                post_res.on('data', function(chunk) {
                    content += chunk;
                });

                post_res.on('end', function() {
                    // console.log(content);

                    res.json({
                        "returnData": content
                    });
                });
            }else{
                res.status(post_res.statusCode).send('稅則失敗');
            }
        });

        // console.log(post_data);
        // post the data
        post_req.write(post_data);

        post_req.on('error', function(err) {
            console.error(err);
            // Handle error
            res.status(403).send('稅則失敗');
        });

        post_req.end(); 

    } catch(err) {
        console.error(err);
        res.status(403).send('稅則失敗');
    }

});

/**
 * ChangeONature 改單(海運)
 */
router.get('/changeONature', function(req, res) {

    try{        
        // console.log(res.statusCode, req.query);

        // Build the post string from an object
        var post_data = querystring.stringify({
            'strJson' : JSON.stringify([
                {
                    "UserId": req.query.ID,
                    "UserPW": req.query.PW,
                    "O_Nature": req.query.NATURE,
                    "O_Nature_NEW": req.query.NATURE_NEW == undefined ? "" : req.query.NATURE_NEW
                }
            ])
        });

        // An object of options to indicate where to post to
        var post_options = {
            host: setting.WebService.changeONature.host,
            port: setting.WebService.changeONature.port,
            path: setting.WebService.changeONature.url,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(post_data)
            }
        };

        // Set up the request
        var post_req = http.request(post_options, function (post_res) {

            // console.log("statusCode: ", post_res.statusCode);
            //console.log("headers: ", post_res.headers);
            if(post_res.statusCode == 200){
                var content = '';

                post_res.setEncoding('utf8');

                post_res.on('data', function(chunk) {
                    content += chunk;
                });

                post_res.on('end', function() {
                    // console.log(content);

                    res.json({
                        "returnData": content
                    });
                });
            }else{
                res.status(post_res.statusCode).send('改單失敗');
            }
        });

        // console.log(post_data);
        // post the data
        post_req.write(post_data);

        post_req.on('error', function(err) {
            console.error(err);
            // Handle error
            res.status(403).send('改單失敗');
        });

        post_req.end(); 

    } catch(err) {
        console.error(err);
        res.status(403).send('改單失敗');
    }

});

/*
 * 組成menu
 * 當有U_ID時會產生該ID的menu，如果沒有就產生所有menu
 */
router.get('/composeMenu', function(req, res) {
    
    try{

        var tasks = [];
        tasks.push(dbCommandByTask.Connect);
        tasks.push(dbCommandByTask.TransactionBegin);
        tasks.push(async.apply(dbCommandByTask.SelectRequestWithTransaction, {
            crudType : 'Select',
            querymain : 'composeMenu',
            queryname : 'SelectMaxLvl'
        }));
        tasks.push(async.apply(dbCommandByTask.SelectRequestWithTransaction, {
            crudType : 'Select',
            querymain : 'composeMenu',
            queryname : 'SelectSubsys'
        }));
        tasks.push(async.apply(dbCommandByTask.SelectRequestWithTransaction, {
            crudType : 'Select',
            querymain : 'composeMenu',
            queryname : 'SelectProgm'
        }));
        if(req.query["U_ID"] != undefined){
            tasks.push(async.apply(dbCommandByTask.SelectRequestWithTransaction, {
                crudType : 'Select',
                querymain : 'composeMenu',
                queryname : 'GetUserRight',
                params : {
                    U_ID : req.query["U_ID"]
                }
            }));
        }
        tasks.push(dbCommandByTask.TransactionCommit);
        async.waterfall(tasks, function (err, args) {

            if (err) {
                // 如果連線失敗就不做Rollback
                if(Object.keys(args).length !== 0){
                    dbCommandByTask.TransactionRollback(args, function (err, result){
                        
                    });
                }

                console.error("Compose Menu 失敗錯誤訊息:", err);

                res.status(403).send('Compose Menu 失敗');
                // process.exit();
            }else{
                var sqlData = args.result;
                var maxLvlObj = sqlData[0];
                var subsysObj = sqlData[1];
                var progmObj = sqlData[2];
                var gRight = req.query["U_ID"] != undefined ? sqlData[3] : null;

                var finalObj;

                if(maxLvlObj != undefined){
                    //取得menu目前最深的階層
                    var iMaxLvl = parseInt(maxLvlObj[0].MAXLVL);
                    //有幾個子系統
                    var sysCount = subsysObj.length;
                    var progmCount = progmObj.length;

                    //程式與系統物件
                    var progItem = { items:[] };
                    var sysItem = { items:[] };
                    var tempItem ;
                    //權限
                    var gRightItem = {};

                    //權限轉換物件
                    for(var igRight in gRight){
                        gRightItem[gRight[igRight].PROG_PATH] = (gRight[igRight].USER_RIGHT == 'true');
                    }

                    //是否有包含權限功能    
                    if(req.query["U_ID"] != undefined){
                        var tempProgmObj = [];
                        for(var iProgmObj in progmObj){
                            // 如果有就新增到temp
                            if(gRightItem[progmObj[iProgmObj].PROG_PATH]){
                                tempProgmObj.push(progmObj[iProgmObj]);
                            }
                        }
                        progmObj = tempProgmObj
                        progmCount = progmObj.length;
                    }
                    
                    //1.取得程式Array
                    for(var iProgm = 0 ; iProgm < progmCount; iProgm++){
                        tempItem = {};
                        tempItem = {
                                        "title": progmObj[iProgm].SP_PNAME,
                                        "sref": progmObj[iProgm].PROG_PATH.toLowerCase(),
                                        "icon": progmObj[iProgm].SP_ICON,
                                        "lvl": progmObj[iProgm].SP_LVL,
                                        "exsysId": progmObj[iProgm].SS_SYSID,
                                        "sort": progmObj[iProgm].SP_SEQ //將順序納入判斷
                                    };
                        progItem.items.push(tempItem);
                    }
                    
                    //2.取得系統Array(資料夾的概念)
                    var tmpExSubsys = '';
                    for(var iSys = 0 ; iSys < sysCount; iSys++){
                        //找出上一層的子系統
                        tmpExSubsys = '';
                        var lvl = parseInt(subsysObj[iSys].SS_LVL);
                        var tmpSplitObj = subsysObj[iSys].SS_PATH.split('.');
                        //若split後的長度與lvl相等，且長度大於1，取得前一層的子系統
                        if(tmpSplitObj.length == lvl && tmpSplitObj.length > 1){
                            tmpExSubsys = tmpSplitObj[lvl-2];
                        }

                        tempItem = {};
                        tempItem = {
                                        "title": subsysObj[iSys].SS_NAME,
                                        "href": "#",
                                        "icon": subsysObj[iSys].SS_ICON,
                                        "lvl": subsysObj[iSys].SS_LVL,
                                        "sysId": subsysObj[iSys].SS_SYSID,
                                        "exsysId": tmpExSubsys,
                                        "sort": subsysObj[iSys].SS_SEQ, //將順序納入判斷
                                        "items":[]
                                    };
                        sysItem.items.push(tempItem);
                    }

                    //3.將程式塞入對應的子系統(資料夾)
                    var outputObj;
                    //最大層級往回推(含最深之子層級或程式)
                    for(var iLvl = iMaxLvl + 1 ; iLvl >= 1 ; iLvl--){
                        for(var iProg = 0; iProg < progmCount ; iProg++){
                            for(var iSys = 0 ; iSys < sysCount; iSys++){
                                //找出最小的lvl 往上加，找出該層的prog
                                if(progItem.items[iProg].lvl == iLvl){
                                    //若lvl-1等於前一子系統之lvl，且程式附屬的系統ID=系統ID，則將程式加入該系統
                                    if((progItem.items[iProg].lvl - 1) == sysItem.items[iSys].lvl && 
                                        progItem.items[iProg].exsysId == sysItem.items[iSys].sysId){
                                            var tmpObj = {
                                                    "title": progItem.items[iProg].title,
                                                    "sref": progItem.items[iProg].sref,
                                                    "icon": progItem.items[iProg].icon,
                                                    "sysId": progItem.items[iProg].exsysId                                                          
                                                };
                                            sysItem.items[iSys].items.push(tmpObj);
                                        }
                                }//if end
                            }//for iSys end
                        }//for iProg end
                    }

                    //4.將子系統塞入對應之item下，從最小的開始往上塞
                    for(var iLvl = iMaxLvl ; iLvl >= 1 ; iLvl--){
                        for(var iSys = 0 ; iSys < sysCount; iSys++){
                            for(var iSubsys = 0 ; iSubsys < sysCount; iSubsys++){
                                //從最小的開始往上塞 和 此資料夾下要有資料
                                if(sysItem.items[iSubsys].lvl == iLvl && sysItem.items[iSubsys].items.length > 0){
                                    if((sysItem.items[iSubsys].lvl - 1) == sysItem.items[iSys].lvl &&
                                        sysItem.items[iSubsys].exsysId == sysItem.items[iSys].sysId){
                                            var tmpObj = {
                                                    "title": sysItem.items[iSubsys].title,
                                                    "href": "#",
                                                    "icon": sysItem.items[iSubsys].icon,
                                                    "items": sysItem.items[iSubsys].items
                                                };
                                            if(sysItem.items[iSubsys].sort > 0){
                                                //因撈出的prog已經照順序放，只要照資料夾需擺放的位置插入陣列中即可。
                                                sysItem.items[iSys].items.splice(sysItem.items[iSubsys].sort - 1,0,tmpObj);
                                            }
                                            else{
                                                sysItem.items[iSys].items.splice(0,0,tmpObj);
                                            }
                                            
                                            //sysItem.items[iSys].items.push(tmpObj);
                                        }
                                }

                            }//for iSubsys End
                        }//for iSys End
                    }//for lvl end

                    //5.最後output資料
                    finalObj = { "items":sysItem.items[0].items};
                 }

                 // //6.output 至 menu-items.js
                 // var path = require("path");
                 // var menuPath = path.resolve(__dirname, '../public/api/menu-items.json');
                 // //寫檔
                 // var fs = require('fs');
                 // fs.writeFile(menuPath, JSON.stringify(finalObj), function(err) {
                 //    if(err) {
                 //        console.log(err);
                 //    } else {
                 //        console.log("The file was saved!");
                 //    }
                 // });

                res.json(finalObj);

            }
        });

    } catch(err){
        logger.error(err);
        res.status(403).send('Compose Menu error');
    }

});

function toArrayBuffer(buf) {
    var ab = new ArrayBuffer(buf.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
    }
    return ab;
}

module.exports = router;