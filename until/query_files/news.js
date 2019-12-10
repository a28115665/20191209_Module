module.exports = function(pQueryname, pParams){
	var _SQLCommand = "";

	switch(pQueryname){
		case "SelectSysGroup":
			_SQLCommand += "SELECT SG_GCODE AS 'CODE', \
					     		   SG_TITLE AS 'NAME', \
					     		   'In' AS 'IO_TYPE' \
			     		    FROM SYS_GROUP WHERE SG_STS = 0 ";
			break;
		case "SelectCompyInfo":
			_SQLCommand += "SELECT CO_CODE AS 'CODE', \
								   CO_NAME AS 'NAME', \
								   'Out' AS 'IO_TYPE' \
						    FROM COMPY_INFO WHERE CO_STS = 0 ";
			break;
		case "SelectSysGroupUnionCompyInfo":
			_SQLCommand += "SELECT SG_GCODE AS 'CODE', \
					     		   SG_TITLE AS 'NAME', \
					     		   'In' AS 'IO_TYPE' \
			     		    FROM SYS_GROUP WHERE SG_STS = 0 ";
			_SQLCommand += " Union All ";
			_SQLCommand += "SELECT CO_CODE AS 'CODE', \
								   CO_NAME AS 'NAME', \
								   'Out' AS 'IO_TYPE' \
						    FROM COMPY_INFO WHERE CO_STS = 0 ";
			break;
		case "SelectBBPG":
			_SQLCommand += "SELECT BBPG_GOAL_ID AS 'CODE', \
								   CASE WHEN CO.CO_CODE IS NULL THEN SG.SG_TITLE ELSE CO.CO_NAME END AS 'NAME', \
								   CASE WHEN CO.CO_CODE IS NULL THEN 'In' ELSE 'Out' END AS 'IO_TYPE' \
							FROM BILLBOARD_POST_GOAL BBPG \
							LEFT JOIN COMPY_INFO CO ON CO.CO_CODE = BBPG.BBPG_GOAL_ID \
							LEFT JOIN SYS_GROUP SG ON SG.SG_GCODE = BBPG.BBPG_GOAL_ID WHERE 1=1 ";
			if(pParams["BBPG_CR_USER"] !== undefined){
				_SQLCommand += " AND BBPG_CR_USER = @BBPG_CR_USER ";
			}
			if(pParams["BBPG_CR_DATETIME"] !== undefined){
				_SQLCommand += " AND BBPG_CR_DATETIME = @BBPG_CR_DATETIME ";
			}

			break;
		case "SelectBBAF":
			_SQLCommand += "SELECT BBAF_ID, \
								   BBAF_O_FILENAME, \
								   BBAF_R_FILENAME, \
								   BBAF_FILESIZE, \
								   BBAF_FILEPATH \
							FROM BILLBOARD_ATTACHED_FILE \
							WHERE BBAF_SOFT_DELETE = 0 ";
			if(pParams["BBAF_CR_USER"] !== undefined){
				_SQLCommand += " AND BBAF_CR_USER = @BBAF_CR_USER ";
			}
			if(pParams["BBAF_CR_DATETIME"] !== undefined){
				_SQLCommand += " AND BBAF_CR_DATETIME = @BBAF_CR_DATETIME ";
			}

			break;

	}

	return _SQLCommand;
};