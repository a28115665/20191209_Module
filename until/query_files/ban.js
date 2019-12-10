module.exports = function(pQueryname, pParams){
	var _SQLCommand = "";

	switch(pQueryname){
		case "SelectBLFL":
			_SQLCommand += "SELECT * \
						    FROM BLACK_LIST_FROM_LEADER \
						    WHERE 1=1 ";

			_SQLCommand += " ORDER BY BLFL_CR_DATETIME DESC ";
			break;
		case "SelectBLFO":
			_SQLCommand += "SELECT IL.IL_SENDNAME, \
								   IL.IL_GETNAME, \
								   IL.IL_GETADDRESS, \
								   IL.IL_GETTEL, \
								   BLFO.* \
							FROM BLACK_LIST_FROM_OP BLFO \
							LEFT JOIN ITEM_LIST IL ON IL.IL_SEQ = BLFO.BLFO_SEQ AND \
							IL.IL_NEWBAGNO = BLFO.BLFO_NEWBAGNO AND \
							IL.IL_NEWSMALLNO = BLFO.BLFO_NEWSMALLNO AND \
							IL.IL_ORDERINDEX = BLFO.BLFO_ORDERINDEX \
						    WHERE 1=1 ";

			_SQLCommand += " ORDER BY BLFO_CR_DATETIME DESC ";
			break;
	}

	return _SQLCommand;
};