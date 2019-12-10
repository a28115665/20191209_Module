module.exports = function(pQueryname, pParams){
	var _SQLCommand = "";

	switch(pQueryname){
		case "SelectFMAF":

			_SQLCommand += "SELECT FMAF_ID, \
								   FMAF_O_FILENAME, \
								   FMAF_R_FILENAME, \
								   FMAF_FILESIZE, \
								   FMAF_FILEPATH \
							FROM FLIGHT_MAIL_ATTACHED_FILE \
							WHERE FMAF_SOFT_DELETE = 0";

			if(pParams["FMAF_CR_USER"] !== undefined){
				_SQLCommand += " AND FMAF_CR_USER = @FMAF_CR_USER ";
			}
			if(pParams["FMAF_CR_DATETIME"] !== undefined){
				_SQLCommand += " AND FMAF_CR_DATETIME = @FMAF_CR_DATETIME ";
			}
							
			break;

		case "SelectFMP":

			_SQLCommand += "SELECT FMP_FLIGHTNO, \
								   FM_TARGET \
							FROM FLIGHT_MAIL_PAIR \
							LEFT JOIN FLIGHT_MAIL ON FMP_CR_USER = FM_CR_USER AND FMP_CR_DATETIME = FM_CR_DATETIME \
							WHERE 1=1";

			if(pParams["FMP_FLIGHTNO"] !== undefined){
				_SQLCommand += " AND FMP_FLIGHTNO = @FMP_FLIGHTNO ";
			}
			if(pParams["FMP_CR_USER"] !== undefined){
				_SQLCommand += " AND FMP_CR_USER = @FMP_CR_USER ";
			}
			if(pParams["FMP_CR_DATETIME"] !== undefined){
				_SQLCommand += " AND FMP_CR_DATETIME = @FMP_CR_DATETIME ";
			}
							
			break;
	}

	return _SQLCommand;
};