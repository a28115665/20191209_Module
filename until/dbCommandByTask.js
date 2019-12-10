var sql = require('mssql');
var setting = require('../app.setting.json');
var tables = require('./table.json');
var schemaType = require('./schemaType.js');
var preparedToStatement = require('./preparedToStatement.js');

/**
 * [Connect description] SQL連線
 * @param {Function} callback [description]
 */
var Connect = function(callback) {
	var args = {};

  	sql.connect(setting.MSSQL, function(err) {
		if(err) callback(err, {});
		else callback(null, args);
	});
};

/**
 * [TransactionBegin description] Transaction Begin
 * @param {[type]}   args     [description]
 * @param {Function} callback [description]
 */
var TransactionBegin = function(args, callback){
	// console.log("TransactionBegin:");
	var transaction = new sql.Transaction();
	transaction.begin(function(err) {
		args["transaction"] = transaction;
		// 回傳結果
		args["result"] = [];
		// 任務條件
		args["tasks"] = [];
		// SQL Statement
		args["statement"] = [];
		if(err) callback(err, {});
		else callback(null, args);
	});
}; 

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
 * [SelectRequestWithTransaction description] Transaction For Select
 * @param {[type]}   task     [description]
 * @param {[type]}   args     [description]
 * @param {Function} callback [description]
 */
var SelectRequestWithTransaction = function(task, args, callback) {
	// console.log("SelectRequestWithTransaction:");
	var request = new sql.Request(args.transaction),
		SQLCommand = "";

	// 依querymain至各檔案下查詢method
	SQLCommand = queryMethods[task.querymain](task.queryname, task.params);

	schemaType.SchemaType2(task.params, request, sql);

	requestSql(request, SQLCommand, task.params, function(err, ret, sql) {
		args.result.push(ret);
		args.tasks.push(task);
		args.statement.push(sql);
		if(err) callback(err, args);
		else callback(null, args);
	});
};

/**
 * [InsertRequestWithTransaction description] Transaction For Insert
 * @param {[type]}   task     [description]
 * @param {[type]}   args     [description]
 * @param {Function} callback [description]
 */
var InsertRequestWithTransaction = function(task, args, callback) {
	// console.log("InsertRequestWithTransaction:");
	var request = new sql.Request(args.transaction),
		SQLCommand = "",
		Schema = [],
		Values = [];

	switch(task.insertname){
		case "Insert":
			for(var key in task.params){
				Schema.push(key);
				Values.push(task.params[key]);
			}

			SQLCommand += "INSERT INTO " + tables[task.table] + " ("+Schema.join()+") VALUES (@"+Schema.join(",@")+")";
			
			break;
		// Insert時密碼需要加金鑰
		// 參考 https://dotblogs.com.tw/dc690216/2009/09/10/10558
		case "InsertByEncrypt":
			for(var key in task.params){
				Schema.push(key);
				Values.push(task.params[key]);
			}
			SQLCommand += "EXEC OpenKeys;";

			SQLCommand += "INSERT INTO " + tables[task.table] + " ("+Schema.join()+") VALUES (@"+Schema.join(",@")+")";
			
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
			for(var key in task.params){
				Schema.push(key);
				Values.push(task.params[key]);
			}

			SQLCommand += "INSERT INTO " + tables[task.table] + " ("+Schema.join()+") VALUES (@"+Schema.join(",@")+")";
			
			break;
	}	 

	schemaType.SchemaType2(task.params, request, sql);

	requestSql(request, SQLCommand, task.params, function(err, ret, sql) {
		args.result.push(ret);
		args.tasks.push(task);
		args.statement.push(sql);
		if(err) callback(err, args);
		else callback(null, args);
	});
};

/**
 * [UpdateRequestWithTransaction description] Transaction For Update
 * @param {[type]}   task     [description]
 * @param {[type]}   args     [description]
 * @param {Function} callback [description]
 */
var UpdateRequestWithTransaction = function(task, args, callback) {
	// console.log("UpdateRequestWithTransaction:");
	var request = new sql.Request(args.transaction),
		SQLCommand = "",
		psParams = extend({}, task.params, task.condition),
		Schema = [],
		Condition = [];

	switch(task.updatename){
		case "Update":
			for(var key in task.params){
				Schema.push(key + "=@" + key);
			}
			for(var key in task.condition){
				if(task.condition[key] == null){
					Condition.push(" AND "+key + " is null");
				}else{
					Condition.push(" AND "+key + "=@" + key);
				}
			}

			SQLCommand += "UPDATE " + tables[task.table] + " SET "+Schema.join()+" WHERE 1=1 "+Condition.join(" ");
			
			break;
		// Update時密碼需要加金鑰
		case "UpdateByEncrypt":
			for(var key in task.params){
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
			for(var key in task.condition){
				if(task.condition[key] == null){
					Condition.push(" AND "+key + " is null");
				}else{
					Condition.push(" AND "+key + "=@" + key);
				}
			}
			SQLCommand += "EXEC OpenKeys;";

			SQLCommand += "UPDATE " + tables[task.table] + " SET "+Schema.join()+" WHERE 1=1 "+Condition.join(" ");
			
			break;
		default:
			for(var key in task.params){
				Schema.push(key + "=@" + key);
			}
			for(var key in task.condition){
				if(task.condition[key] == null){
					Condition.push(" AND "+key + " is null");
				}else{
					Condition.push(" AND "+key + "=@" + key);
				}
			}

			SQLCommand += "UPDATE " + tables[task.table] + " SET "+Schema.join()+" WHERE 1=1 "+Condition.join(" ");
			
			break;
	}	

	schemaType.SchemaType2(psParams, request, sql);
	
	requestSql(request, SQLCommand, psParams, function(err, ret, sql) {
		args.result.push(ret);
		args.tasks.push(task);
		args.statement.push(sql);
		if(err) callback(err, args);
		else callback(null, args);
	});
};

/**
 * [DeleteRequestWithTransaction description] Transaction For Delete
 * @param {[type]}   task     [description]
 * @param {[type]}   args     [description]
 * @param {Function} callback [description]
 */
var DeleteRequestWithTransaction = function(task, args, callback) {
	// console.log("DeleteRequestWithTransaction:");
	var request = new sql.Request(args.transaction),
		SQLCommand = "",
		Condition = [];

	switch(task.deletename){
		case "DeleteOrderPrinplWithEditor":

			if(task.params["OP_SEQ"] !== undefined && task.params["OP_DEPT"] !== undefined){
				SQLCommand += "DELETE "+tables[task.table]+" FROM "+tables[task.table]+" \
							   LEFT JOIN ORDER_EDITOR ON OE_SEQ = OP_SEQ AND OE_TYPE = OP_TYPE AND OE_PRINCIPAL = OP_PRINCIPAL \
							   WHERE OP_SEQ = @OP_SEQ AND OP_DEPT = @OP_DEPT AND OE_EDATETIME IS NULL";
			}
			
			break;
		case "DeleteOOrderPrinplWithEditor":

			if(task.params["O_OP_SEQ"] !== undefined && task.params["O_OP_DEPT"] !== undefined){
				SQLCommand += "DELETE "+tables[task.table]+" FROM "+tables[task.table]+" \
							   LEFT JOIN O_ORDER_EDITOR ON O_OE_SEQ = O_OP_SEQ AND O_OE_TYPE = O_OP_TYPE AND O_OE_PRINCIPAL = O_OP_PRINCIPAL \
							   WHERE O_OP_SEQ = @O_OP_SEQ AND O_OP_DEPT = @O_OP_DEPT AND O_OE_EDATETIME IS NULL";
			}
			
			break;
		default:
			for(var key in task.params){
				if(task.params[key] == null){
					Condition.push(" AND "+key + " is null");
				}else{
					Condition.push(" AND "+key + "=@" + key);
				}
			}

			SQLCommand += "DELETE FROM " + tables[task.table] + " WHERE 1=1 "+Condition.join("");
			
			break;
	}

	schemaType.SchemaType2(task.params, request, sql);
	
	requestSql(request, SQLCommand, task.params, function(err, ret, sql) {
		args.result.push(ret);
		args.tasks.push(task);
		args.statement.push(sql);
		if(err) callback(err, args);
		else callback(null, args);
	});
};

/**
 * [UpsertRequestWithTransaction description] Transaction For Upsert
 * @param {[type]}
 * @param {[type]}
 * @param {Function}
 */
var UpsertRequestWithTransaction = function(task, args, callback) {
	// console.log("DeleteRequestWithTransaction:");
	var request = new sql.Request(args.transaction),
		psParams = extend({}, task.params, task.condition),
		SQLCommand = "",
		ParamsValues = [],
		ParamsSchema = [],
		ParamsTargetSource = [],
		ConditionValues = [],
		ConditionSchema = [],
		ConditionTarget = [];

	schemaType.SchemaType2(psParams, request, sql);

	// MERGE FLIGHT_ARRIVAL WITH(HOLDLOCK) AS TARGET
	// USING (VALUES (2))
	//     AS SOURCE (FA_AIR_ROTETYPE)
	//     ON TARGET.FA_FLIGHTDATE = '2017-06-12' and TARGET.FA_FLIGHTNUM = '1234' and TARGET.FA_AIR_LINEID = 'CI'
	// WHEN MATCHED THEN
	//     UPDATE
	//     SET TARGET.FA_AIR_ROTETYPE = SOURCE.FA_AIR_ROTETYPE
	// WHEN NOT MATCHED THEN
	//     INSERT ( FA_FLIGHTDATE, FA_FLIGHTNUM, FA_AIR_ROTETYPE, FA_AIR_LINEID)
	//     VALUES ( '2017-06-12', '1234', 1, 'CI')

	switch(task.upsertname){
		default:
			// 即將更新的值
			for(var key in task.params){
				if(task.params[key] == null){
					ParamsValues.push("null");
				}else{
					ParamsValues.push("@" + key);
				}
				ParamsSchema.push(key);
				ParamsTargetSource.push("TARGET." + key + "= SOURCE." + key);
			}

			// 條件
			for(var key in task.condition){
				if(task.condition[key] == null){
					ConditionValues.push("null");
				}else{
					ConditionValues.push("@" + key);
				}
				ConditionSchema.push(key);
				ConditionTarget.push("TARGET." + key + "= @" + key);
			}

			SQLCommand += "MERGE " + tables[task.table] + " AS TARGET \
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
	}
	
	requestSql(request, SQLCommand, psParams, function(err, ret, sql) {
		args.result.push(ret);
		args.tasks.push(task);
		args.statement.push(sql);
		if(err) callback(err, args);
		else callback(null, args);
	});
};

/**
 * [CopyRequestWithTransaction description] Transaction for copy
 * @param {[type]}   task     [description]
 * @param {[type]}   args     [description]
 * @param {Function} callback [description]
 */
var CopyRequestWithTransaction = function(task, args, callback) {
	// console.log("DeleteRequestWithTransaction:");
	var request = new sql.Request(args.transaction),
		SQLCommand = "";

	// INSERT INTO table2
	// SELECT column1, column2, column3, ...
	// FROM table1
	// WHERE params;

	// 依querymain至各檔案下查詢method
	SQLCommand = "INSERT INTO " + tables[task.table] + " " + queryMethods[task.querymain](task.queryname, task.params);
	
	schemaType.SchemaType2(task.params, request, sql);
	
	requestSql(request, SQLCommand, task.params, function(err, ret, sql) {
		args.result.push(ret);
		args.tasks.push(task);
		args.statement.push(sql);
		if(err) callback(err, args);
		else callback(null, args);
	});
};

/**
 * [TransactionCommit description] Transaction Commit
 * @param {[type]}   args     [description]
 * @param {Function} callback [description]
 */
var TransactionCommit = function(args, callback){
	// console.log("TransactionCommit:");
	args.transaction.commit(function(err, ret) {
		if(err) callback(err, {});
		else callback(null, args);
	});
};

/**
 * [TransactionRollback description] Transaction Rollback
 * @param {[type]}   args     [description]
 * @param {Function} callback [description]
 */
var TransactionRollback = function(args, callback){
	// console.log("TransactionRollback:");
	args.transaction.rollback(function(err, ret) {
		if(err) callback(err, {});
		else callback(null, args);
	});
}; 

/**
 * [DisConnect description] SQL中斷連線
 * @param {[type]}   args     [description]
 * @param {Function} callback [description]
 */
var DisConnect = function(args, callback) {
	// console.log("DisConnect:");
	callback(null, args);
	sql.close();
};

function requestSql(request, sql, params, callback) {
    var errors = [];
    var result = [];
    var records = [];
    // console.log(sql);
    request.query(sql);
    request.stream = true;
    request.on('recordset', function(columns) {
        // Emitted once for each recordset in a query
        //console.log(columns);
        var rec = {
            columns: columns,
            records: []
        };
        result.push(rec);
    });

    request.on('row', function(row) {
        // Emitted for each row in a recordset
        result[result.length - 1].records.push(row);
    });

    request.on('error', function(err) {
        // May be emitted multiple times
        errors.push(err);
    });

    request.on('done', function(returnValue) {
        // console.log(errors.length, result.length);
        // Always emitted as the last one
        if (errors.length == 0) {
        	// 如果returnValue為0 表示delete
        	if(result.length == 0){
            	callback(null, result, preparedToStatement.PrintSql(sql, params));
        	}else{
            	callback(null, result[0].records, preparedToStatement.PrintSql(sql, params));
        	}
        } else {
    		console.log("SQL錯誤:", errors);
            callback(errors, {}, preparedToStatement.PrintSql(sql, params));
        }
    });
}

/**
 * [extend 合併Object]
 * @param  {[type]} target [需要被合併的Objects]
 * @return {[type]}        [回傳合併後的Object]
 */
function extend(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function (source) {
        for (var prop in source) {
            target[prop] = source[prop];
        }
    });
    return target;
}

module.exports = {
    Connect : Connect,
    TransactionBegin : TransactionBegin,
    SelectRequestWithTransaction : SelectRequestWithTransaction,
    InsertRequestWithTransaction : InsertRequestWithTransaction,
    UpdateRequestWithTransaction : UpdateRequestWithTransaction,
	DeleteRequestWithTransaction : DeleteRequestWithTransaction,
	UpsertRequestWithTransaction : UpsertRequestWithTransaction,
	CopyRequestWithTransaction : CopyRequestWithTransaction,
	TransactionCommit : TransactionCommit,
	TransactionRollback : TransactionRollback,
	DisConnect : DisConnect
};
