module.exports = function(pQueryname, pParams){
	var _SQLCommand = "";

	switch(pQueryname){
		case "SelectUserDept":
			_SQLCommand += "SELECT UD_DEPT AS 'SUD_DEPT' \
						    FROM USER_DEPT \
						    WHERE 1=1 ";

			if(pParams["UD_ID"] !== undefined){
				_SQLCommand += " AND UD_ID = @UD_ID ";
			}
			break;
		case "SelectSysUserGrade":
			_SQLCommand += "SELECT SUG_GRADE, \
								   SUG_NAME \
						    FROM SYS_USER_GRADE \
						    WHERE 1=1 ";

			if(pParams["SUG_STS"] !== undefined){
				_SQLCommand += " AND SUG_STS = @SUG_STS ";
			}

			_SQLCommand += " ORDER BY SUG_GRADE ASC ";
			break;
		case "SelectSysUserDept":
			_SQLCommand += "SELECT SUD_DEPT, \
								   SUD_DLVL, \
								   SUD_DPATH, \
								   SUD_NAME \
							FROM SYS_USER_DEPT \
						    WHERE 1=1 ";

			if(pParams["SUD_STS"] !== undefined){
				_SQLCommand += " AND SUD_STS = @SUD_STS ";
			}

			_SQLCommand += " ORDER BY SUD_DLVL ASC, SUD_DEPT ASC ";
			break;
		case "SelectSysParm":
			_SQLCommand += "EXEC OpenKeys; \
							SELECT SPA_AUTOPRIN, \
								O_SPA_AUTOPRIN, \
								dbo.Decrypt(SPA_DEFAULT_PASSWORD) AS 'SPA_DEFAULT_PASSWORD', \
								SPA_FAVICON, \
								SPA_HEADER, \
								SPA_HEADER_PNG, \
								SPA_AVATARS, \
								SPA_AVATARS_BIG, \
								SPA_FOOTER, \
								SPA_LOGIN_LOGO, \
								SPA_LOGIN_LOGO1_TXT, \
								SPA_LOGIN_LOGO2_TXT, \
								SPA_LOGIN_LOGO_BG, \
								SPA_LOGIN_BOTTOM1, \
								SPA_LOGIN_BOTTOM2 \
							FROM SYS_PARM ";
			break;
	}

	return _SQLCommand;
};