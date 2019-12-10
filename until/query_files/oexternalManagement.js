module.exports = function(pQueryname, pParams){
	var _SQLCommand = "";

	switch(pQueryname){
		case "SelectOCustInfo":
			_SQLCommand += "EXEC OpenKeys;";
			_SQLCommand += "SELECT O_CI_ID, \
								   O_CI_COMPY, \
								   O_CI_NAME, \
								   dbo.Decrypt(O_CI_PW) AS 'O_CI_PW', \
								   O_CI_STS \
							FROM O_CUST_INFO \
							ORDER BY O_CI_CR_DATETIME DESC";
		
			break;
		case "SelectOCompyInfo":
			_SQLCommand += "SELECT O_CO_ID, \
								   O_CO_CODE, \
								   O_CO_NUMBER, \
								   O_CO_NAME, \
								   O_CO_ADDR, \
								   O_CO_STS, \
								   O_CO_WEIGHTS, \
								   O_CO_AREA \
							FROM O_COMPY_INFO \
							WHERE 1=1 ";
							
			if(pParams["O_CO_STS"] !== undefined){
				_SQLCommand += " AND O_CO_STS = @O_CO_STS";
			}
			_SQLCommand += " ORDER BY O_CO_CR_DATETIME DESC ";
			break;
		case "SelectOCompyInfo2":
			_SQLCommand += "SELECT O_CO_ID, \
								   O_CO_CODE, \
								   O_CO_NUMBER, \
								   O_CO_NAME, \
								   O_CO_ADDR, \
								   O_CO_STS, \
								   O_CO_WEIGHTS, \
								   O_CO_AREA \
							FROM O_COMPY_INFO \
							WHERE 1=1 ";
							
			if(pParams["O_CO_STS"] !== undefined){
				_SQLCommand += " AND O_CO_STS = @O_CO_STS";
			}
			_SQLCommand += " ORDER BY O_CO_CODE ASC ";
			break;
		case "SelectMaxOCompy":
			_SQLCommand += "SELECT TOP 1 O_CO_ID+1 AS 'O_CO_ID' \
							FROM O_COMPY_INFO \
							ORDER BY O_CO_ID DESC ";
							
			break;
	}

	return _SQLCommand;
};