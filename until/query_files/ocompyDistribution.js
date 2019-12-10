module.exports = function(pQueryname, pParams){
	var _SQLCommand = "";

	switch(pQueryname){
		case "SelectOCompy":
			_SQLCommand += "SELECT CO.O_CO_CODE, \
									CO.O_CO_NUMBER, \
									CO.O_CO_NAME, \
									CO.O_CO_ADDR, \
									CO.O_CO_WEIGHTS \
							FROM O_COMPY_INFO CO \
							WHERE O_CO_STS = 0 \
							ORDER BY O_CO_CR_DATETIME DESC ";	

			break;
		case "SelectOCompyDistribution":
			_SQLCommand += "SELECT O_COD_CODE, \
								   O_COD_DEPT, \
								   O_COD_PRINCIPAL \
							FROM O_COMPY_DISTRIBUTION \
							WHERE 1=1 ";	

			if(pParams["O_COD_DEPT"] !== undefined){
				_SQLCommand += " AND O_COD_DEPT = @O_COD_DEPT";
			}

			_SQLCommand += " ORDER BY O_COD_CR_DATETIME DESC ";

			break;
	}

	return _SQLCommand;
};