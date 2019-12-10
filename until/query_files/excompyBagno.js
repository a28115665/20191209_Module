module.exports = function(pQueryname, pParams){
	var _SQLCommand = "";

	switch(pQueryname){
		case "SelectAllSysCode":
			_SQLCommand += "SELECT * \
						   FROM SYS_CODE \
						   WHERE 1=1";
			if(pParams["SC_TYPE"] !== undefined){
				_SQLCommand += " AND SC_TYPE = @SC_TYPE";
			}
			if(pParams["SC_CODE"] !== undefined){
				_SQLCommand += " AND SC_CODE = @SC_CODE";
			}
			if(pParams["SC_PARENT_CODE"] !== undefined){
				_SQLCommand += " AND SC_PARENT_CODE = @SC_PARENT_CODE";
			}
			if(pParams["SC_DESC"] !== undefined){
				_SQLCommand += " AND SC_DESC = @SC_DESC";
			}
			if(pParams["SC_STS"] !== undefined){
				_SQLCommand += " AND SC_STS = @SC_STS";
			}

			_SQLCommand += " ORDER BY SC_CR_DATETIME DESC, SC_CODE ASC ";
			break;
	}

	return _SQLCommand;
};