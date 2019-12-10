const setting = require('../app.setting.json');
const winston = require('winston');
require('../until/winstonByMssql.js');

winston.add(winston.transports.mssql, {
    connectionString: setting.MSSQL,
    table: "SYS_DBLOGS"
});
winston.remove(winston.transports.Console);

/**
 * [dbLogObject description] DB Log物件
 * @param  {[type]} User       [description]
 * @param  {[type]} QMain      [description]
 * @param  {[type]} QName      [description]
 * @param  {[type]} QCondition [description]
 * @param  {[type]} Sql        [description]
 * @param  {[type]} Ip         [description]
 * @param  {[type]} Error      [description]
 */
module.exports = function (User, QMain, QName, QCondition, Sql, Ip, Error) {

    this.SDL_USER = User;
    this.SDL_QMAIN = QMain;
    this.SDL_QNAME = QName;
    this.SDL_QCONDITION = QCondition;
    this.SDL_SQL = Sql;
    this.SDL_IP = Ip;

    this.writeLog = function (Action) {
        if(!this.SDL_USER) return;

        this.SDL_ACTION = Action;
        if(Error){
            this.SDL_SQL = Sql ? Error.stack + ', sql:' + Sql : Error.stack;
            winston.log("error", JSON.stringify(this));
        }else{
            winston.log("info", JSON.stringify(this));
        }
    }

}