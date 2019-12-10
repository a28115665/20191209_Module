module.exports = function(pQueryname, pParams){
	var _SQLCommand = "";

	switch(pQueryname){
		case "SelectFlightMail":

			_SQLCommand += "SELECT * \
							FROM FLIGHT_MAIL \
							ORDER BY FM_CR_DATETIME DESC ";
							
			break;

		case "SelectFlightMailPair":

			_SQLCommand += "SELECT *, \
								   CASE WHEN FMP_CR_USER IS NULL THEN 0 ELSE 1 END AS 'isChoice' \
							FROM FLIGHT_MAIL \
							LEFT JOIN ( \
								SELECT FMP_CR_DATETIME, \
									   FMP_CR_USER  \
								FROM FLIGHT_MAIL_PAIR  \
								WHERE 1=1 \
								AND FMP_FLIGHTNO = @FMP_FLIGHTNO \
								GROUP BY FMP_CR_DATETIME, FMP_CR_USER \
							) FLIGHT_MAIL_PAIR ON FMP_CR_USER = FM_CR_USER AND FMP_CR_DATETIME = FM_CR_DATETIME \
							ORDER BY FM_CR_DATETIME DESC ";
							
			break;

		case "SelectMailAccount":

			_SQLCommand += "EXEC OpenKeys;";
			_SQLCommand += "SELECT MA_USER, \
								   dbo.Decrypt(MA_PASS) AS 'MA_PASS' \
							FROM MAIL_ACCOUNT \
							WHERE MA_STS = 0 ";

			if(pParams["MA_USER"] !== undefined){
				_SQLCommand += " AND MA_USER = @MA_USER";
			}
							
			break;
	}

	return _SQLCommand;
};