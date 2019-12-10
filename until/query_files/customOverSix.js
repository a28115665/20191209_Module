module.exports = function(pQueryname, pParams){
	var _SQLCommand = "";

	switch(pQueryname){
		case "SelectOverSix":
			_SQLCommand += "SELECT * \
							FROM CUSTOM_OVERSIX \
							WHERE 1=1 ";	

			break;
		case "SelectOverSixCompound":
			_SQLCommand += "SELECT * \
							FROM CUSTOM_OVERSIX_COMPOUND \
							WHERE 1=1 ";	

			break;
	}

	return _SQLCommand;
};