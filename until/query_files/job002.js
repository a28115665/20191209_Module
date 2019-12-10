module.exports = function(pQueryname, pParams){
	var _SQLCommand = "";

	switch(pQueryname){
		case "SelectFlightItemList":
			_SQLCommand += "SELECT ROW_NUMBER() OVER(PARTITION BY FLL_SEQ ORDER BY cast(FLL_ITEM as int) ASC) AS FLL_INDEX, \
								   *, \
								   CASE WHEN DI.IL_BAGNO IS NULL THEN 0 ELSE 1 END AS BAGNO_MATCH \
							FROM FLIGHT_ITEM_LIST \
							LEFT JOIN ( \
								SELECT DISTINCT(SUBSTRING(IL_BAGNO, 0, 9)) AS IL_BAGNO \
								FROM ITEM_LIST \
								WHERE IL_SEQ = @FLL_SEQ \
								AND IL_BAGNO != '' \
							) DI ON IL_BAGNO LIKE FLL_BAGNO \
							WHERE 1=1 AND FLL_SEQ = @FLL_SEQ \
							ORDER BY cast(FLL_ITEM as int) ASC";

			break;
		case "SelectRemark":
			_SQLCommand += "SELECT FLLR_REMARK, \
								   '' AS SPACE \
							FROM FLL_REMARK \
							WHERE FLLR_SEQ = @FLL_SEQ \
							ORDER BY FLLR_ROWINDEX";

			break;
	}

	return _SQLCommand;
};