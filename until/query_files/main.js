module.exports = function(pQueryname, pParams){
	var _SQLCommand = "";

	switch(pQueryname){
		case "SelectAllBillboard":
			_SQLCommand += "SELECT BB.BB_STICK_TOP, \
								   BB.BB_POST_FROM, \
								   BB.BB_POST_TOXX, \
								   BB.BB_TITLE, \
								   BB.BB_CONTENT, \
	   							   BB.BB_CR_USER, \
	   							   BB.BB_CR_DATETIME, \
								   ISNULL(BBAF.BBAF_COUNTS, 0) AS 'BBAF_COUNTS', \
								   U.U_NAME \
							FROM BILLBOARD BB \
							LEFT JOIN USER_INFO U ON U.U_ID = BB.BB_CR_USER \
							LEFT JOIN ( \
								SELECT COUNT(1) AS 'BBAF_COUNTS', BBAF_CR_USER, BBAF_CR_DATETIME \
								FROM BILLBOARD_ATTACHED_FILE \
								WHERE BBAF_SOFT_DELETE = 0 \
								GROUP BY BBAF_CR_USER, BBAF_CR_DATETIME \
							) BBAF ON BBAF.BBAF_CR_USER = BB.BB_CR_USER AND BBAF.BBAF_CR_DATETIME = BB.BB_CR_DATETIME \
							WHERE 1=1 AND BB.BB_IO_TYPE IN ('In', 'All') AND BB.BB_SOFT_DELETE = 0 \
							AND CAST(GETDATE() AS DATE) >= BB.BB_POST_FROM \
							AND CAST(GETDATE() AS DATE) <= BB.BB_POST_TOXX \
							ORDER BY BB.BB_STICK_TOP DESC, BB.BB_POST_FROM DESC";
			break;
		case "SelectBBAF":
			_SQLCommand += "SELECT BBAF.BBAF_FILEPATH, \
								   BBAF.BBAF_R_FILENAME, \
								   BBAF.BBAF_O_FILENAME, \
								   BBAF.BBAF_FILESIZE \
							FROM BILLBOARD_ATTACHED_FILE BBAF \
							WHERE BBAF.BBAF_SOFT_DELETE = 0";
			if(pParams["BBAF_CR_USER"] !== undefined){
				_SQLCommand += " AND BBAF.BBAF_CR_USER = @BBAF_CR_USER";
			}
			if(pParams["BBAF_CR_DATETIME"] !== undefined){
				_SQLCommand += " AND BBAF.BBAF_CR_DATETIME = @BBAF_CR_DATETIME";
			}
			break;
	}

	return _SQLCommand;
};