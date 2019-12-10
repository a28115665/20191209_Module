/**
 * 日誌級別對應規則
 * http response 3xx, level = WARN
 * http response 4xx & 5xx, level = ERROR
 * else, level = INFO
 */

const log4js = require('log4js');

// log setting
// log4js.configure({
//     appenders: [
//         { 
//             type: 'console' //控制台输出
//         }, 
//         {
//             type: 'file', //文件输出
//             filename: 'log/restful.log', 
//             maxLogSize: 10*1024*1024, // = 10Mb
//             backups: 10,
//             category: 'restful' 
//         }, 
//         {
//             type: 'file', //文件输出
//             filename: 'log/toolbox.log', 
//             maxLogSize: 10*1024*1024, // = 10Mb
//             backups: 10,
//             category: 'toolbox' 
//         }
//     ],
//     replaceConsole: true
// });

log4js.configure({ 
    appenders: {
        out: { type: 'console' }, 
        auth: { 
            type: 'file', //文件输出
            filename: 'log/auth.log', 
            maxLogSize: 10*1024*1024, // = 10Mb
            backups: 10,
            category: 'auth'
        }, 
        restful: { 
            type: 'file', //文件输出
            filename: 'log/restful.log', 
            maxLogSize: 10*1024*1024, // = 10Mb
            backups: 10,
            category: 'restful'
        }, 
        toolbox: { 
            type: 'file', //文件输出
            filename: 'log/toolbox.log', 
            maxLogSize: 10*1024*1024, // = 10Mb
            backups: 10,
            category: 'toolbox'
        }, 
        winstonByMssql: { 
            type: 'file', //文件输出
            filename: 'log/winstonByMssql.log', 
            maxLogSize: 10*1024*1024, // = 10Mb
            backups: 10,
            category: 'winstonByMssql'
        }
    },
    categories: {
        default: { appenders: ['out'], level: 'info' },
        auth: { appenders: ['auth'], level: 'info'},
        // restful: { appenders: ['restful'], level: 'info'},
        toolbox: { appenders: ['toolbox'], level: 'info' },
        winstonByMssql: { appenders: ['winstonByMssql'], level: 'error' }
    }
});

// var logger4js = log4js.getLogger('normal');
// logger4js.setLevel('INFO');
// app.use(log4js.connectLogger('auto', {level:log4js.levels.AUTO}));

exports.logger = function(name){
	var logger = log4js.getLogger(name);
	// logger.setLevel('INFO');
	return logger;
}

exports.connectLogger = function(logger, options){
    return log4js.connectLogger(logger, options);
}