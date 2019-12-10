module.exports = function(pQueryname, pParams){
	var _SQLCommand = "";

	switch(pQueryname){
		case "SelectOCompyDistribution":
			_SQLCommand += "SELECT O_COD_PRINCIPAL, \
								   O_COD_CODE, \
								   O_COD_DEPT, \
								   O_CO_WEIGHTS \
							FROM O_COMPY_DISTRIBUTION \
							LEFT JOIN O_COMPY_INFO ON O_CO_CODE = O_COD_CODE \
							WHERE 1=1 ";

			if(pParams["O_COD_DEPT"] !== undefined){
				_SQLCommand += " AND O_COD_DEPT = @O_COD_DEPT";
			}

			_SQLCommand += " ORDER BY O_COD_PRINCIPAL, O_COD_CODE ";
			
			break;

		case "SelectOAgentSetting":
			_SQLCommand += "SELECT O_AS_PRINCIPAL, \
								   O_AS_CODE, \
								   O_AS_DEPT, \
								   O_AS_AGENT \
							FROM O_AGENT_SETTING \
							WHERE 1=1 ";

			if(pParams["O_AS_DEPT"] !== undefined){
				_SQLCommand += " AND O_AS_DEPT = @O_AS_DEPT";
			}

			_SQLCommand += " ORDER BY O_AS_PRINCIPAL ";

			break;

		case "SelectOCompyAgent":
			_SQLCommand += "SELECT O_COD.COD_PRINCIPAL, \
								   O_COD.COD_CODE, \
								   O_CO.CO_NAME, \
								   CASE WHEN O_COD_PRINCIPAL = O_AS_AGENT THEN NULL ELSE O_AS_AGENT END AS 'O_AS_AGENT' \
							FROM O_COMPY_DISTRIBUTION COD \
							LEFT JOIN O_COMPY_INFO CO ON O_COD.COD_CODE = CO.O_CO_CODE \
							LEFT JOIN O_AGENT_SETTING ON COD.O_COD_CODE = O_AS_CODE AND O_AS_DEPT = @O_COD_DEPT \
							WHERE 1=1 ";

			if(pParams["O_COD_CR_USER"] !== undefined){
				_SQLCommand += " AND COD.O_COD_CR_USER = @O_COD_CR_USER";
			}
			if(pParams["O_COD_DEPT"] !== undefined){
				_SQLCommand += " AND COD.O_COD_DEPT = @O_COD_DEPT";
			}

			_SQLCommand += " ORDER BY O_COD_CR_DATETIME DESC, O_COD_PRINCIPAL ASC ";

			break;

		case "SelectUserInfoByOCompyDistribution":
			_SQLCommand += "SELECT O_COD_PRINCIPAL, \
								   U_NAME, \
								   O_COD_DEPT, \
								   SUD_NAME \
							FROM O_COMPY_DISTRIBUTION \
							JOIN SYS_USER_DEPT ON SUD_DEPT = O_COD_DEPT \
							LEFT JOIN USER_INFO ON U_ID = O_COD_PRINCIPAL \
							WHERE 1=1 ";
											
			// if(pParams["COD_CR_USER"] !== undefined){
			// 	_SQLCommand += " AND COD_CR_USER = @COD_CR_USER";
			// }
			if(pParams["O_COD_DEPT"] !== undefined){
				_SQLCommand += " AND O_COD_DEPT = @O_COD_DEPT";
			}

			break;
	}

	return _SQLCommand;
};