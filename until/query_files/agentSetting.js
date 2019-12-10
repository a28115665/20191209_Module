module.exports = function(pQueryname, pParams){
	var _SQLCommand = "";

	switch(pQueryname){
		case "SelectCompyDistribution":
			_SQLCommand += "SELECT COD_PRINCIPAL, \
								   COD_CODE, \
								   COD_DEPT, \
								   CO_WEIGHTS \
							FROM COMPY_DISTRIBUTION \
							LEFT JOIN COMPY_INFO ON CO_CODE = COD_CODE \
							WHERE 1=1 ";

			if(pParams["COD_DEPT"] !== undefined){
				_SQLCommand += " AND COD_DEPT = @COD_DEPT";
			}

			_SQLCommand += " ORDER BY COD_PRINCIPAL, COD_CODE ";
			
			break;

		case "SelectAgentSetting":
			_SQLCommand += "SELECT AS_PRINCIPAL, \
								   AS_CODE, \
								   AS_DEPT, \
								   AS_AGENT \
							FROM AGENT_SETTING \
							WHERE 1=1 ";

			if(pParams["AS_DEPT"] !== undefined){
				_SQLCommand += " AND AS_DEPT = @AS_DEPT";
			}

			_SQLCommand += " ORDER BY AS_PRINCIPAL ";

			break;

		case "SelectCompyAgent":
			_SQLCommand += "SELECT COD.COD_PRINCIPAL, \
								   COD.COD_CODE, \
								   CO.CO_NAME, \
								   CASE WHEN COD_PRINCIPAL = AS_AGENT THEN NULL ELSE AS_AGENT END AS 'AS_AGENT' \
							FROM COMPY_DISTRIBUTION COD \
							LEFT JOIN COMPY_INFO CO ON COD.COD_CODE = CO.CO_CODE \
							LEFT JOIN AGENT_SETTING ON COD.COD_CODE = AS_CODE AND AS_DEPT = @COD_DEPT \
							WHERE 1=1 ";

			if(pParams["COD_CR_USER"] !== undefined){
				_SQLCommand += " AND COD.COD_CR_USER = @COD_CR_USER";
			}
			if(pParams["COD_DEPT"] !== undefined){
				_SQLCommand += " AND COD.COD_DEPT = @COD_DEPT";
			}

			_SQLCommand += " ORDER BY COD_CR_DATETIME DESC, COD_PRINCIPAL ASC ";

			break;

		case "SelectUserInfoByCompyDistribution":
			_SQLCommand += "SELECT COD_PRINCIPAL, \
								   U_NAME, \
								   COD_DEPT, \
								   SUD_NAME \
							FROM COMPY_DISTRIBUTION \
							JOIN SYS_USER_DEPT ON SUD_DEPT = COD_DEPT \
							LEFT JOIN USER_INFO ON U_ID = COD_PRINCIPAL \
							WHERE 1=1 ";
											
			// if(pParams["COD_CR_USER"] !== undefined){
			// 	_SQLCommand += " AND COD_CR_USER = @COD_CR_USER";
			// }
			if(pParams["COD_DEPT"] !== undefined){
				_SQLCommand += " AND COD_DEPT = @COD_DEPT";
			}

			break;
	}

	return _SQLCommand;
};