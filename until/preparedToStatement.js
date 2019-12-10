/**
 * [PrintSql 置換Prepared SQL]
 * @param {[type]}   sql [SQL語句]
 * @param {[type]}   params [變數]
 */
var PrintSql = function (sql, params){
	var _sql = sql,
        regex = null;

    // 取代不正常空白
    _sql = encodeURI(_sql);
    _sql = _sql.replace(/%09/gi, "");
    _sql = decodeURI(_sql);

	for(var key in params){
		if(params[key] !== undefined){
			
			regex = new RegExp("@"+key,"gi");

			if(params[key] == null){
				regex = new RegExp("=@"+key,"gi");
        		_sql = _sql.replace(regex, " IS NULL");
			}
			if(typeof params[key] == "string"){
        		_sql = _sql.replace(regex, "'" + params[key] + "'");
			}
			if(typeof params[key] == "number"){
        		_sql = _sql.replace(regex, params[key]);
			}
			if(typeof params[key] == "boolean"){
        		_sql = _sql.replace(regex, params[key] ? 1 : 0);
			}
		}
	}

	return _sql;
};

module.exports.PrintSql = PrintSql;