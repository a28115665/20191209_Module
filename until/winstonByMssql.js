const util = require('util');
const winston = require('winston');
const sql = require('mssql');
const moment = require('moment');
const logger = require('../until/log4js.js').logger('winstonByMssql');
const until = require('../until/until.js');
const schemaType = require('./schemaType.js');

/**
 * @constructs MSSQL
 * @param {Object} options
 * @api private
 */
var mssql = exports.mssql = function (options) {
    winston.Transport.call(this, options);

    options = options || {};

    this.name = 'mssql';
    this.connectionString = options.connectionString || 'mssql://username:password@localhost/database';
    this.table = options.table || 'dbo.NodeLogs';
}

/**
 * @extends winston.Transport
 */
util.inherits(mssql, winston.Transport);

/**
* Define a getter so that `winston.transports.SQLServer`
* is available and thus backwards compatible.
*/
winston.transports.mssql = mssql;

/**
 * Expose the name of this transport on the prototype
 */
mssql.prototype.name = 'mssql';

/**
 * Core Winston logging method
 *
 * @level {String} level to log at
 * @msg {String} message to log
 * @api public
 */
mssql.prototype.log = function (pLevel, pData) {
    let self = this;
    try {
        var connection = new sql.Connection(this.connectionString, function (Error) {  
            if (Error) {
                logger.error('sql connection error:', Error);
                return;
            }

            var ps = new sql.PreparedStatement(connection),
                _params = until.isJson(pData) ? JSON.parse(pData) : pData,
                SQLCommand = "",
                Schema = [],
                Values = [];

            _params["SDL_DATETIME"] = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
            _params["SDL_LEVEL"] = pLevel;

            for(var key in _params){
                Schema.push(key);
                Values.push(_params[key]);
            }

            SQLCommand += "INSERT INTO " + self.table + " ("+Schema.join()+") VALUES (@"+Schema.join(",@")+")";

            // sql長度太長 無法寫入資料庫
            if(_params.SDL_QCONDITION != undefined && _params.SDL_QCONDITION.length > 60000){
                logger.error('sql長度太長 無法寫入資料庫: SDL_QMAIN=>', _params.SDL_QMAIN, ', SDL_QNAME=>', _params.SDL_QNAME);
                return;
            }

            schemaType.SchemaType(_params, ps, sql);

            // 執行SQL，並且回傳值
            ps.prepare(SQLCommand, function(err) {
                // ... error checks
                if (err) logger.error('ps prepare error:', err);
                
                /*
                    recordset -> 回傳值
                    affected -> Returns number of affected rows in case of INSERT, UPDATE or DELETE statement.
                 */
                ps.execute(_params, function(err, recordset, affected) {
                    // console.log(err, recordset, affected);
                    // ... error checks
                    if (err) logger.error('ps execute error:', err);

                    ps.unprepare(function(err) {
                        // ... error checks
                        if (err) logger.error('db unprepare error:', err);

                        // callback(null, affected, preparedToStatement.PrintSql(SQLCommand, _params));  
                    });
                });
            });


        });
    }
    catch(err) {
        logger.error('other error:', err);
    }
};