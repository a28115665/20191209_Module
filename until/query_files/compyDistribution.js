module.exports = function(pQueryname, pParams){
	var _SQLCommand = "";

	switch(pQueryname){
		case "SelectCompy":
			_SQLCommand += "SELECT CO.CO_CODE, \
								   CO.CO_NUMBER, \
								   CO.CO_NAME, \
								   CO.CO_ADDR, \
								   CO.CO_WEIGHTS \
							FROM COMPY_INFO CO \
							WHERE CO_STS = 0 \
						    ORDER BY CO_CR_DATETIME DESC ";	

			break;
		case "SelectCompyDistribution":
			_SQLCommand += "SELECT COD_CODE, \
								   COD_DEPT, \
								   COD_PRINCIPAL \
							FROM COMPY_DISTRIBUTION \
							WHERE 1=1 ";	

			if(pParams["COD_DEPT"] !== undefined){
				_SQLCommand += " AND COD_DEPT = @COD_DEPT";
			}

			_SQLCommand += " ORDER BY COD_CR_DATETIME DESC ";

			// _SQLCommand += "SELECT CO.CO_CODE, \
			// 					   CO.CO_NUMBER, \
			// 					   CO.CO_NAME, \
			// 					   CO.CO_ADDR, \
			// 					   COD.COD_PRINCIPAL \
			// 				FROM COMPY_INFO CO \
			// 				LEFT JOIN COMPY_DISTRIBUTION COD ON COD.COD_CODE = CO.CO_CODE ";	

			// if(pParams["COD_DEPT"] !== undefined){
			// 	_SQLCommand += " AND COD_DEPT = @COD_DEPT";
			// }

			// _SQLCommand += " WHERE CO_STS = 0 \
			// 				 ORDER BY CO_CR_DATETIME DESC ";

			break;
		case "SelectUserbyGrade":
			_SQLCommand += "SELECT U_ID, \
								   U_NAME, \
								   U_GRADE, \
								   UD_DEPT, \
								   SUD_NAME \
							FROM USER_DEPT UD \
							LEFT JOIN SYS_USER_DEPT ON SUD_DEPT = UD_DEPT \
							JOIN USER_INFO ON U_ID = UD_ID \
							WHERE U_STS = 0 ";
							
			if(pParams["DEPTS"] !== undefined){
				// _SQLCommand += " AND UD_DEPT IN ( \
				// 					SELECT UD_DEPT \
				// 					FROM USER_DEPT \
				// 					WHERE UD_ID = @U_ID \
				// 				) ";

				var _Content = [];
				for(var i in pParams["DEPTS"]){
					_Content.push("SELECT SUD_DEPT \
								   FROM SYS_USER_DEPT \
								   WHERE SUD_DPATH LIKE '%"+pParams["DEPTS"][i].SUD_DEPT+"%' and SUD_DLVL >= "+pParams["DEPTS"][i].SUD_DLVL);
				}

				_SQLCommand += " AND UD_DEPT IN ( "+_Content.join(" Union ")+" ) ";
				
				// 避免PrepareStatement載入非DB裡的Schema
				delete pParams["DEPTS"];
			}							
			if(pParams["U_GRADE"] !== undefined){
				_SQLCommand += " AND U_GRADE > @U_GRADE";
			}

			_SQLCommand += " ORDER BY UD_DEPT ";

			break;
	}

	return _SQLCommand;
};