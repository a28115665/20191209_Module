module.exports = function(pQueryname, pParams){
	var _SQLCommand = "";

	switch(pQueryname){
		case "SelectDeliveryItemList":
			_SQLCommand += "SELECT * \
							FROM Delivery_Item_List \
							WHERE 1=1";
							
			if(pParams["DIL_SEQ"] !== undefined){
				_SQLCommand += " AND DIL_SEQ = @DIL_SEQ";
			}
			
			_SQLCommand += " ORDER BY DIL_BAGNO, DIL_DRIVER ";
		
			break;
	}

	return _SQLCommand;
};