module.exports = function(pQueryname, pParams){
	var _SQLCommand = "";

	switch(pQueryname){
		case "SelectBagnoCount":
			_SQLCommand += "SELECT * \
							FROM ITEM_LIST_COUNT \
							WHERE ILC_ID = '1' ";
			break;
	}

	return _SQLCommand;
};