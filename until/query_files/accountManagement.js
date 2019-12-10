module.exports = function(pQueryname, pParams){
	var _SQLCommand = "";

	switch(pQueryname){
		case "SelectAllUserInfo":
			_SQLCommand += "EXEC OpenKeys;";
			_SQLCommand += "SELECT U_EMAIL, \
								   U_ID, \
								   U_GRADE, \
								   U_NAME, \
								   U_PHONE, \
								   U_ROLE, \
								   U_STS, \
								   dbo.Decrypt(U_PW) AS 'U_PW', \
								   U_CR_DATETIME, \
								   U_UP_DATETIME \
							From USER_INFO \
						    WHERE 1=1"
			if(pParams["U_ID"] !== undefined){
				_SQLCommand += " AND U_ID = @U_ID";
			}
			if(pParams["U_NAME"] !== undefined){
				_SQLCommand += " AND U_NAME = @U_NAME";
			}
			if(pParams["U_PW"] !== undefined){
				_SQLCommand += " AND dbo.Decrypt(U_PW) = @U_PW";
			}
			break;
		case "SelectAllUserInfoNotWithAdmin":
			_SQLCommand += "EXEC OpenKeys;";
			_SQLCommand += "SELECT U_EMAIL, \
								   U_ID, \
								   U_GRADE, \
								   U_NAME, \
								   U_PHONE, \
								   U_ROLE, \
								   U_STS, \
								   dbo.Decrypt(U_PW) AS 'U_PW' \
						   FROM USER_INFO \
						   WHERE U_ID != 'Administrator' \
						   ORDER BY U_CR_DATETIME Desc";
			break;
		case "SelectUserInfoForFilter":
			_SQLCommand += "SELECT U_ID, \
								   U_NAME \
						   FROM USER_INFO \
						   WHERE U_ID != 'Administrator' \
						   ORDER BY U_CR_DATETIME Desc";
			break;
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
			break;
		case "SelectAllGroup":
			_SQLCommand += "SELECT SG_GCODE, \
								   SG_TITLE, \
								   SG_DESC,  \
								   SG_STS    \
						   FROM SYS_GROUP \
						   WHERE 1=1";
			if(pParams["SC_TYPE"] !== undefined){
				_SQLCommand += " AND SC_TYPE = @SC_TYPE";
			}
			_SQLCommand += " ORDER BY SG_CR_DATETIME DESC ";
			break;
	}

	return _SQLCommand;
};