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
		case "SelectUserDept":
			_SQLCommand += "SELECT SUD_DEPT, \
								   SUD_DLVL \
							FROM USER_DEPT \
							JOIN SYS_USER_DEPT ON SUD_DEPT = UD_DEPT \
							WHERE 1=1 ";
			if(pParams["UD_ID"] !== undefined){
				_SQLCommand += " AND UD_ID = @UD_ID";
			}
			break;
	}

	return _SQLCommand;
};