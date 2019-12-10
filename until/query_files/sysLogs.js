module.exports = function(pQueryname, pParams){
	var _SQLCommand = "";

	switch(pQueryname){
		case "SelectSysLogs":
			_SQLCommand += "SELECT TOP 10000 * \
							FROM SYS_DBLOGS \
							ORDER BY SDL_ID DESC ";
			break;
	}

	return _SQLCommand;
};