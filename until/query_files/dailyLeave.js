module.exports = function(pQueryname, pParams){
	var _SQLCommand = "";

	switch(pQueryname){
		case "SelectUserLeavebyGrade":
			_SQLCommand += "SELECT U_ID, \
								   U_NAME, \
								   U_GRADE, \
								   UD_DEPT, \
								   CASE WHEN DL.DL_ID IS NOT NULL THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS 'DL_IS_LEAVE' \
							FROM USER_DEPT \
							JOIN USER_INFO ON U_ID = UD_ID \
							LEFT JOIN DAILY_LEAVE DL ON DL.DL_ID = UD_ID AND DL_DEPT = UD_DEPT \
							WHERE U_STS = 0 ";
							
			if(pParams["DEPTS"] !== undefined){
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
			if(pParams["UD_DEPT"] !== undefined){
				_SQLCommand += " AND UD_DEPT = @UD_DEPT";
			}							
			if(pParams["U_GRADE"] !== undefined){
				_SQLCommand += " AND U_GRADE > @U_GRADE";
			}

			break;
	}

	return _SQLCommand;
};