module.exports = function(pQueryname, pParams){
	var _SQLCommand = "";

	switch(pQueryname){
		case "SelectBBWithOK":
			_SQLCommand += "SELECT BB_STICK_TOP, \
									BB_POST_FROM, \
									BB_POST_TOXX, \
									BB_TITLE, \
									BB_CONTENT, \
									BB_IO_TYPE, \
									BB_CR_USER, \
									BB_CR_DATETIME \
							FROM BILLBOARD BB \
							WHERE BB.BB_SOFT_DELETE = 0 AND CAST(GETDATE() AS DATE) >= BB.BB_POST_FROM AND CAST(GETDATE() AS DATE) <= BB.BB_POST_TOXX \
							ORDER BY BB.BB_STICK_TOP DESC, BB.BB_CR_DATETIME DESC";
		
			break;
		case "SelectBBWithHistory":
			_SQLCommand += "SELECT BB_STICK_TOP, \
									BB_SOFT_DELETE, \
									BB_POST_FROM, \
									BB_POST_TOXX, \
									BB_TITLE, \
									BB_IO_TYPE, \
									BB_CR_USER, \
									BB_CR_DATETIME \
							FROM BILLBOARD BB \
							WHERE BB_SOFT_DELETE = 0 AND (CAST(GETDATE() AS DATE) < BB.BB_POST_FROM OR CAST(GETDATE() AS DATE) > BB.BB_POST_TOXX) \
							ORDER BY BB_UP_DATETIME DESC,BB_CR_DATETIME DESC";
		
			break;
	}

	return _SQLCommand;
};