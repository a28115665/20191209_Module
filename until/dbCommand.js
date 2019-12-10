var sql = require('mssql');
var setting = require('../app.setting.json');
var tables = require('./table.json');
var schemaType = require('./schemaType.js');
var preparedToStatement = require('./preparedToStatement.js');
var until = require('../until/until.js');

/**
 * [將query_files底下所有的statement集中到queryMethods裡]
 * @param {[type]} queryMethods [依照檔名對應Methods]
 */
var queryMethods = {},
	queryFilesPath = require("path").join(__dirname, "query_files");
require("fs").readdirSync(queryFilesPath).forEach(function(file) {
	var _target = file.split(".")[0],
		_method = require("./query_files/" + file);

	queryMethods[_target] = _method;
});

/**
 * [SelectMethod 單筆資料Select]
 * @param {[type]}   querymain [查詢序目標檔名]
 * @param {[type]}   queryname [查詢序名稱]
 * @param {[type]}   params    [查詢參數]
 * @param {Function} callback  [回拋]
 */
var SelectMethod = function (querymain, queryname, params, callback){

	try {
		var connection = new sql.Connection(setting.MSSQL, function (Error) {  
		    if (Error) return callback(err, null);

			var ps = new sql.PreparedStatement(connection),
				_params = until.isJson(params) ? JSON.parse(params) : {},
				SQLCommand = "";

			// 依querymain至各檔案下查詢method
			if(querymain == undefined) return callback("異常的querymain", null);
			SQLCommand = queryMethods[querymain](queryname, _params);
			
			// schema所需的orm
			schemaType.SchemaType(_params, ps, sql);

			// 執行SQL，並且回傳值
		    ps.prepare(SQLCommand, function(err) {
			    // ... error checks
			    if(err) return callback(err, null, preparedToStatement.PrintSql(SQLCommand, _params));

			    /*
			    	recordset -> 回傳值
					affected -> Returns number of affected rows in case of INSERT, UPDATE or DELETE statement.
			     */
				ps.execute(_params, function(err, recordset, affected) {
					// ... error checks
					if(err) return callback(err, null, preparedToStatement.PrintSql(SQLCommand, _params));

					ps.unprepare(function(err) {
					    // ... error checks
					    if(err) return callback(err, null, preparedToStatement.PrintSql(SQLCommand, _params));

					    callback(null, recordset, preparedToStatement.PrintSql(SQLCommand, _params));  
					});
				});
			});

		});
	}
	catch(err) {
		return callback(err, null);
	}  
};

/**
 * [InsertMethod 單筆資料Insert]
 * @param {[type]}   insertname [新增序名稱]
 * @param {[type]}   table      [資料表名稱]
 * @param {[type]}   params     [新增參數]
 * @param {Function} callback   [回拋]
 */
var InsertMethod = function (insertname, table, params, callback){
	
	try {
		var connection = new sql.Connection(setting.MSSQL, function (Error) {  
		    if (Error) return;

			var ps = new sql.PreparedStatement(connection),
				_params = until.isJson(params) ? JSON.parse(params) : params,
				SQLCommand = "",
				Schema = [],
				Values = [];

		    switch(insertname){
				case "Insert":
					for(var key in _params){
						Schema.push(key);
						Values.push(_params[key]);
					}

					SQLCommand += "INSERT INTO " + tables[table] + " ("+Schema.join()+") VALUES (@"+Schema.join(",@")+")";
					
					break;
				// Insert時密碼需要加金鑰
				// 參考 https://dotblogs.com.tw/dc690216/2009/09/10/10558
				case "InsertByEncrypt":
					for(var key in _params){
						Schema.push(key);
						Values.push(_params[key]);
					}
					SQLCommand += "EXEC OpenKeys;";

					SQLCommand += "INSERT INTO " + tables[table] + " ("+Schema.join()+") VALUES (@"+Schema.join(",@")+")";
					
					if(SQLCommand.match(/@U_PW/gi)){
						SQLCommand = SQLCommand.replace(/@U_PW/gi, 'dbo.Encrypt(@U_PW)');
					}
					if(SQLCommand.match(/@CI_PW/gi)){
						SQLCommand = SQLCommand.replace(/@CI_PW/gi, 'dbo.Encrypt(@CI_PW)');
					}
					if(SQLCommand.match(/@O_CI_PW/gi)){
						SQLCommand = SQLCommand.replace(/@O_CI_PW/gi, 'dbo.Encrypt(@O_CI_PW)');
					}
					if(SQLCommand.match(/@MA_PASS/gi)){
						SQLCommand = SQLCommand.replace(/@MA_PASS/gi, 'dbo.Encrypt(@MA_PASS)');
					}
					
					break;
				default:
					return callback("無此InsertName", null);
					break;
			}	    
			schemaType.SchemaType(_params, ps, sql);

			// 執行SQL，並且回傳值
		    ps.prepare(SQLCommand, function(err) {
			    // ... error checks
			    if(err) return callback(err, null, preparedToStatement.PrintSql(SQLCommand, _params));
			    
			    /*
			    	recordset -> 回傳值
					affected -> Returns number of affected rows in case of INSERT, UPDATE or DELETE statement.
			     */
				ps.execute(_params, function(err, recordset, affected) {
					// console.log(err, recordset, affected);
					// ... error checks
					if(err) return callback(err, null, preparedToStatement.PrintSql(SQLCommand, _params));

					ps.unprepare(function(err) {
					    // ... error checks
					    if(err) return callback(err, null, preparedToStatement.PrintSql(SQLCommand, _params));

					    callback(null, affected, preparedToStatement.PrintSql(SQLCommand, _params));  
					});
				});
			});


		});
	}
	catch(err) {
		return callback(err, null);
	}
}

/**
 * [UpdateMethod 單筆資料Update] 
 * @param {[type]}   updatetname [更新序名稱]
 * @param {[type]}   table       [資料表名稱]
 * @param {[type]}   params      [更新參數]
 * @param {[type]}   condition   [更新條件]
 * @param {Function} callback    [回拋]
 */
var UpdateMethod = function (updatetname, table, params, condition, callback){
	
	try {
		var connection = new sql.Connection(setting.MSSQL, function (Error) {  
		    if (Error) return;

			var ps = new sql.PreparedStatement(connection),
				_params = until.isJson(params) ? JSON.parse(params) : params,
				_condition = JSON.parse(condition),
				_psParams = until.extend({}, _params, _condition),
				SQLCommand = "",
				Schema = [],
				Condition = [];

		    switch(updatetname){
				case "Update":
					for(var key in _params){
						Schema.push(key + "=@" + key);
					}
					for(var key in _condition){
						if(_condition[key] == null){
							Condition.push(" AND "+key + "is @" + key);
						}else{
							Condition.push(" AND "+key + "=@" + key);
						}
					}

					SQLCommand += "UPDATE " + tables[table] + " SET "+Schema.join()+" WHERE 1=1 "+Condition.join(" ");
					
					break;
				// Update時密碼需要加金鑰
				case "UpdateByEncrypt":
					for(var key in _params){
						switch(key){
							case 'U_PW':
							case 'CI_PW':
							case 'O_CI_PW':
								Schema.push(key + "=dbo.Encrypt(@" + key + ")");
								break;
							default:
								Schema.push(key + "=@" + key);
								break;
						}
					}
					for(var key in _condition){
						if(_condition[key] == null){
							Condition.push(" AND "+key + " is null");
						}else{
							Condition.push(" AND "+key + "=@" + key);
						}
					}
					SQLCommand += "EXEC OpenKeys;";

					SQLCommand += "UPDATE " + tables[table] + " SET "+Schema.join()+" WHERE 1=1 "+Condition.join(" ");
					
					break;
				default:
					return callback("無此UpdateName", null);
					break;
			}	    
			schemaType.SchemaType(_psParams, ps, sql);

			// 執行SQL，並且回傳值
		    ps.prepare(SQLCommand, function(err) {
			    // ... error checks
			    if(err) return callback(err, null, preparedToStatement.PrintSql(SQLCommand, _psParams)); 
			    
			    /*
			    	recordset -> 回傳值
					affected -> Returns number of affected rows in case of INSERT, UPDATE or DELETE statement.
			     */
				ps.execute(_psParams, function(err, recordset, affected) {
					// console.log(err, recordset, affected);
					// ... error checks
					if(err) return callback(err, null, preparedToStatement.PrintSql(SQLCommand, _psParams)); 

					ps.unprepare(function(err) {
					    // ... error checks
					    if(err) return callback(err, null, preparedToStatement.PrintSql(SQLCommand, _psParams));
					    
					    callback(null, affected, preparedToStatement.PrintSql(SQLCommand, _psParams)); 
					});
				});
			});

		});
	}
	catch(err) {
		return callback(err, null);
	}
}

/**
 * [UpsertMethod 單筆資料Upsert]
 * @param {[type]}   upsertname [插入序名稱]
 * @param {[type]}   table      [資料表名稱]
 * @param {[type]}   params     [插入參數]
 * @param {[type]}   condition  [插入條件]
 * @param {Function} callback   [回拋]
 */
var UpsertMethod = function (upsertname, table, params, condition, callback){

	try {
		var connection = new sql.Connection(setting.MSSQL, function (Error) {  
		    if (Error) return;

			var ps = new sql.PreparedStatement(connection),
				_params = until.isJson(params) ? JSON.parse(params) : params,
				_condition = JSON.parse(condition),
				_psParams = until.extend({}, _params, _condition),
				SQLCommand = "",
				ParamsValues = [],
				ParamsSchema = [],
				ParamsTargetSource = [],
				ConditionValues = [],
				ConditionSchema = [],
				ConditionTarget = [];

		    switch(upsertname){
				case "Upsert":
					// 即將更新的值
					for(var key in _params){
						if(_params[key] == null){
							ParamsValues.push("null");
						}else{
							ParamsValues.push("@" + key);
						}
						ParamsSchema.push(key);
						ParamsTargetSource.push("TARGET." + key + "= SOURCE." + key);
					}

					// 條件
					for(var key in _condition){
						if(_condition[key] == null){
							ConditionValues.push("null");
						}else{
							ConditionValues.push("@" + key);
						}
						ConditionSchema.push(key);
						ConditionTarget.push("TARGET." + key + "= @" + key);
					}

					SQLCommand += "MERGE " + tables[table] + " AS TARGET \
								   USING (VALUES (" + ParamsValues.join(", ") + ")) \
								        AS SOURCE (" + ParamsSchema.join(", ") + ") \
								        ON " + ConditionTarget.join(" and ") + " \
								   WHEN MATCHED THEN \
								   		UPDATE \
								   		SET " + ParamsTargetSource.join(", ") + " \
								   WHEN NOT MATCHED THEN \
								   		INSERT (" + ConditionSchema.join(", ") + ", " + ParamsSchema.join(", ") + ") \
								   		VALUES (" + ConditionValues.join(", ") + ", " + ParamsValues.join(", ") + ");";
					
					break;
				default:
					return callback("無此UpdateName", null);
					break;
			}	    
			schemaType.SchemaType(_psParams, ps, sql);

			// 執行SQL，並且回傳值
		    ps.prepare(SQLCommand, function(err) {
			    // ... error checks
			    if(err) return callback(err, null, preparedToStatement.PrintSql(SQLCommand, _psParams)); 
			    
			    /*
			    	recordset -> 回傳值
					affected -> Returns number of affected rows in case of INSERT, UPDATE or DELETE statement.
			     */
				ps.execute(_psParams, function(err, recordset, affected) {
					// console.log(err, recordset, affected);
					// ... error checks
					if(err) return callback(err, null, preparedToStatement.PrintSql(SQLCommand, _psParams)); 

					ps.unprepare(function(err) {
					    // ... error checks
					    if(err) return callback(err, null, preparedToStatement.PrintSql(SQLCommand, _psParams));

					    callback(null, affected, preparedToStatement.PrintSql(SQLCommand, _psParams));  
					});
				});
			});

		});
	}
	catch(err) {
		return callback(err, null);
	}
}

/**
 * [DeleteMethod 單筆資料Delete]
 * @param {[type]}   deletename [刪除序名稱]
 * @param {[type]}   table      [資料表名稱]
 * @param {[type]}   params     [刪除參數]
 * @param {Function} callback   [回拋]
 */
var DeleteMethod = function (deletename, table, params, callback){
	
	try {
		var connection = new sql.Connection(setting.MSSQL, function (Error) {  
		    if (Error) return;

			var ps = new sql.PreparedStatement(connection),
				_params = until.isJson(params) ? JSON.parse(params) : params,
				SQLCommand = "",
				Condition = [];

		    switch(deletename){
				case "Delete":
					for(var key in _params){
						if(_params[key] == null){
							Condition.push(" AND "+key + " is null");
						}else{
							Condition.push(" AND "+key + "=@" + key);
						}
					}

					SQLCommand += "DELETE FROM " + tables[table] + " WHERE 1=1 "+Condition.join("");
					
					break;
				default:
					return callback("無此DeleteName", null);
					break;
			}	    
			schemaType.SchemaType(_params, ps, sql);

			// 執行SQL，並且回傳值
		    ps.prepare(SQLCommand, function(err) {
			    // ... error checks
			    if(err) return callback(err, null, preparedToStatement.PrintSql(SQLCommand, _params));
			    
			    /*
			    	recordset -> 回傳值
					affected -> Returns number of affected rows in case of INSERT, UPDATE or DELETE statement.
			     */
				ps.execute(_params, function(err, recordset, affected) {
					// console.log(err, recordset, affected);
					// ... error checks
					if(err) return callback(err, null, preparedToStatement.PrintSql(SQLCommand, _params));

					ps.unprepare(function(err) {
					    // ... error checks
					    if(err) return callback(err, null, preparedToStatement.PrintSql(SQLCommand, _params));

						callback(null, affected, preparedToStatement.PrintSql(SQLCommand, _params));
					});
				});
			});


		});
	}
	catch(err) {
		return callback(err, null);
	}
}

module.exports.SelectMethod = SelectMethod;
module.exports.InsertMethod = InsertMethod;
module.exports.UpdateMethod = UpdateMethod;
module.exports.UpsertMethod = UpsertMethod;
module.exports.DeleteMethod = DeleteMethod;