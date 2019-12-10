module.exports = function(pQueryname, pParams){
	var _SQLCommand = "";

	switch(pQueryname){
		case "SelectItemList":
			_SQLCommand += "SELECT BLFO_TRACK, \
									CASE WHEN PG_SEQ IS NULL THEN 0 ELSE 1 END AS 'PG_PULLGOODS', \
									CASE WHEN SPG_SEQ IS NULL OR SPG_TYPE IS NULL THEN 0 ELSE SPG_TYPE END AS 'SPG_SPECIALGOODS', \
									PG_MOVED, \
									CASE WHEN DF.FLL_BAGNO IS NULL THEN 0 ELSE 1 END AS BAGNO_MATCH, \
									CAST(0 AS BIT) AS isSelected, \
									ITEM_LIST.* \
							FROM ITEM_LIST \
							LEFT JOIN ( \
								SELECT DISTINCT(FLL_BAGNO) \
								FROM FLIGHT_ITEM_LIST \
								WHERE FLL_SEQ = @IL_SEQ \
								AND FLL_BAGNO != '' \
							) DF ON IL_BAGNO LIKE DF.FLL_BAGNO + \'%\' \
							LEFT JOIN BLACK_LIST_FROM_OP ON \
							IL_SEQ = BLFO_SEQ AND \
							IL_NEWBAGNO = BLFO_NEWBAGNO AND \
							IL_NEWSMALLNO = BLFO_NEWSMALLNO AND \
							IL_ORDERINDEX = BLFO_ORDERINDEX \
							LEFT JOIN PULL_GOODS ON \
							IL_SEQ = PG_SEQ AND \
							IL_BAGNO = PG_BAGNO \
							LEFT JOIN SPECIAL_GOODS ON \
							IL_SEQ = SPG_SEQ AND \
							IL_NEWBAGNO = SPG_NEWBAGNO AND \
							IL_NEWSMALLNO = SPG_NEWSMALLNO AND \
							IL_ORDERINDEX = SPG_ORDERINDEX \
							WHERE 1=1 \
							AND IL_SEQ = @IL_SEQ \
							ORDER BY IL_BAGNO";
		
			break;
		case "SelectRepeatName":
			_SQLCommand += "SELECT ITEM_LIST.* \
							FROM ITEM_LIST \
							JOIN ( \
								SELECT IL_GETNAME_NEW \
								FROM ITEM_LIST \
								WHERE IL_SEQ = @IL_SEQ \
								AND IL_G1 NOT IN ('G1','移倉') \
								GROUP BY IL_GETNAME_NEW \
								HAVING COUNT(*) > 1 \
							) REPEAT_NAME ON REPEAT_NAME.IL_GETNAME_NEW = ITEM_LIST.IL_GETNAME_NEW \
							WHERE ITEM_LIST.IL_SEQ = @IL_SEQ \
							AND IL_G1 = '' \
							AND IL_MERGENO IS NULL \
							ORDER BY IL_GETNAME_NEW, IL_BAGNO";
			
			break;
		case "SelectRepeatAddress":
			_SQLCommand += "SELECT ITEM_LIST.* \
							FROM ITEM_LIST \
							JOIN ( \
								SELECT IL_GETADDRESS_NEW \
								FROM ITEM_LIST \
								WHERE IL_SEQ = @IL_SEQ \
								AND IL_G1 NOT IN ('G1','移倉') \
								GROUP BY IL_GETADDRESS_NEW \
								HAVING COUNT(*) > 1 \
							) REPEAT_ADDRESS ON REPEAT_ADDRESS.IL_GETADDRESS_NEW = ITEM_LIST.IL_GETADDRESS_NEW \
							WHERE ITEM_LIST.IL_SEQ = @IL_SEQ \
							AND IL_G1 = '' \
							AND IL_MERGENO IS NULL \
							ORDER BY IL_GETADDRESS_NEW, IL_BAGNO";
			
			break;
		case "SelectRepeatNameAndAddress":
			_SQLCommand += "SELECT ITEM_LIST.* \
							FROM ITEM_LIST \
							JOIN ( \
								SELECT IL_GETNAME_NEW, IL_GETADDRESS_NEW \
								FROM ITEM_LIST \
								WHERE IL_SEQ = @IL_SEQ \
								AND IL_GETNAME_NEW IS NOT NULL \
								AND IL_GETADDRESS_NEW IS NOT NULL \
								AND IL_G1 NOT IN ('G1','移倉') \
								GROUP BY IL_GETNAME_NEW, IL_GETADDRESS_NEW \
								HAVING COUNT(*) > 1 \
							) REPEAT_ADDRESS \
							ON REPEAT_ADDRESS.IL_GETNAME_NEW = ITEM_LIST.IL_GETNAME_NEW \
							AND REPEAT_ADDRESS.IL_GETADDRESS_NEW = ITEM_LIST.IL_GETADDRESS_NEW \
							WHERE ITEM_LIST.IL_SEQ = @IL_SEQ \
							AND IL_G1 = '' \
							AND IL_MERGENO IS NULL \
							ORDER BY IL_GETNAME_NEW, IL_GETADDRESS_NEW, IL_BAGNO";
			
			break;
		case "SelectItemListForFlight":
			_SQLCommand += "SELECT BLFO_TRACK, \
									CASE WHEN PG_SEQ IS NULL THEN 0 ELSE 1 END AS 'PG_PULLGOODS', \
									CASE WHEN SPG_SEQ IS NULL OR SPG_TYPE IS NULL THEN NULL ELSE \
										CASE WHEN SPG_TYPE = 1 THEN '普特貨'\
										ELSE '特特貨' END \
									END AS 'SPG_SPECIALGOODS', \
									CASE WHEN IL_MERGENO IS NOT NULL AND IL_MERGENO != '' THEN '併X3-' + MERGENO + '-' + CONVERT(VARCHAR, IL_MERGENO_COUNT) + '袋' ELSE IL_G1 END AS 'IL_G1EX', \
									PG_MOVED, \
									ITEM_LIST.* \
							FROM ITEM_LIST \
							LEFT JOIN ( \
								SELECT IL_MERGENO AS MERGENO, COUNT(IL_BAGNO) AS IL_MERGENO_COUNT \
								FROM ( \
									SELECT DISTINCT IL_MERGENO, IL_BAGNO \
									FROM ITEM_LIST \
									WHERE IL_SEQ = @IL_SEQ \
									AND IL_MERGENO IS NOT NULL \
								) MERGENO \
								GROUP BY IL_MERGENO \
							) ITEM_LIST2 ON ITEM_LIST2.MERGENO = ITEM_LIST.IL_MERGENO \
							LEFT JOIN BLACK_LIST_FROM_OP ON \
							IL_SEQ = BLFO_SEQ AND \
							IL_NEWBAGNO = BLFO_NEWBAGNO AND \
							IL_NEWSMALLNO = BLFO_NEWSMALLNO AND \
							IL_ORDERINDEX = BLFO_ORDERINDEX \
							LEFT JOIN PULL_GOODS ON \
							IL_SEQ = PG_SEQ AND \
							IL_BAGNO = PG_BAGNO \
							LEFT JOIN SPECIAL_GOODS ON \
							IL_SEQ = SPG_SEQ AND \
							IL_NEWBAGNO = SPG_NEWBAGNO AND \
							IL_NEWSMALLNO = SPG_NEWSMALLNO AND \
							IL_ORDERINDEX = SPG_ORDERINDEX \
							WHERE 1=1 \
							/*拉貨不匯出*/ \
							AND PG_SEQ IS NULL \
							AND IL_SEQ = @IL_SEQ ";
							
			if(pParams["NewSmallNo"] !== undefined){
				_SQLCommand += " AND IL_NEWSMALLNO IN ("+pParams["NewSmallNo"]+") ";
				delete pParams["NewSmallNo"];
			}

			_SQLCommand += "ORDER BY IL_BAGNO";
		
			break;



		case "SelectItemListForEx0MX3":
			_SQLCommand += "SELECT *, \
									@CO_NAME AS 'CO_NAME', \
									IL_UNIVALENT_NEW * IL_NEWPCS_NOREPEAT AS 'IL_FINALCOST_NOREPEAT' \
							FROM ( \
								SELECT BLFO_TRACK, \
										CASE WHEN PG_SEQ IS NULL THEN 0 ELSE 1 END AS 'PG_PULLGOODS', \
										CASE WHEN SPG_SEQ IS NULL OR SPG_TYPE IS NULL THEN NULL ELSE \
											CASE WHEN SPG_TYPE = 1 THEN '普特貨' \
											ELSE '特特貨' END \
										END AS 'SPG_SPECIALGOODS', \
										PG_MOVED, \
										OUT_IL.*, \
										CASE WHEN ROW_NUMBER() OVER(PARTITION BY IL_MERGENO ORDER BY IL_MERGENO) = 1 \
										THEN IL_MERGENO ELSE NULL END AS 'IL_BAGNOEX_NOREPEAT', \
										CASE WHEN ROW_NUMBER() OVER(PARTITION BY IL_MERGENO ORDER BY IL_MERGENO) = 1 \
										THEN( \
											SELECT SUM(IL_CTN) \
											FROM ITEM_LIST IN_IL \
											LEFT JOIN PULL_GOODS ON \
											IN_IL.IL_SEQ = PG_SEQ AND \
											IN_IL.IL_BAGNO = PG_BAGNO \
											WHERE IN_IL.IL_MERGENO = OUT_IL.IL_MERGENO \
											AND IN_IL.IL_SEQ = @IL_SEQ \
											/*拉貨不匯出*/ \
											AND PG_SEQ IS NULL \
										) ELSE NULL END AS 'IL_CTN_NOREPEAT', \
										CASE WHEN ROW_NUMBER() OVER(PARTITION BY IL_MERGENO ORDER BY IL_MERGENO) = 1 \
										THEN( \
											SELECT SUM(IL_WEIGHT_NEW) \
											FROM ITEM_LIST IN_IL \
											LEFT JOIN PULL_GOODS ON \
											IN_IL.IL_SEQ = PG_SEQ AND \
											IN_IL.IL_BAGNO = PG_BAGNO \
											WHERE IN_IL.IL_MERGENO = OUT_IL.IL_MERGENO \
											AND IN_IL.IL_SEQ = @IL_SEQ \
											/*拉貨不匯出*/ \
											AND PG_SEQ IS NULL \
										) ELSE NULL END AS 'IL_WEIGHT_NEW_NOREPEAT', \
										CASE WHEN ROW_NUMBER() OVER(PARTITION BY IL_MERGENO ORDER BY IL_MERGENO) = 1 \
										THEN( \
											SELECT SUM(IL_NEWPCS) \
											FROM ITEM_LIST IN_IL \
											LEFT JOIN PULL_GOODS ON \
											IN_IL.IL_SEQ = PG_SEQ AND \
											IN_IL.IL_BAGNO = PG_BAGNO \
											WHERE IN_IL.IL_MERGENO = OUT_IL.IL_MERGENO \
											AND IN_IL.IL_SEQ = @IL_SEQ \
											/*拉貨不匯出*/ \
											AND PG_SEQ IS NULL \
										) ELSE NULL END AS 'IL_NEWPCS_NOREPEAT' \
								FROM ITEM_LIST OUT_IL \
								LEFT JOIN BLACK_LIST_FROM_OP ON \
								IL_SEQ = BLFO_SEQ AND \
								IL_NEWBAGNO = BLFO_NEWBAGNO AND \
								IL_NEWSMALLNO = BLFO_NEWSMALLNO AND \
								IL_ORDERINDEX = BLFO_ORDERINDEX \
								LEFT JOIN PULL_GOODS ON \
								IL_SEQ = PG_SEQ AND \
								IL_BAGNO = PG_BAGNO \
								LEFT JOIN SPECIAL_GOODS ON \
								IL_SEQ = SPG_SEQ AND \
								IL_NEWBAGNO = SPG_NEWBAGNO AND \
								IL_NEWSMALLNO = SPG_NEWSMALLNO AND \
								IL_ORDERINDEX = SPG_ORDERINDEX \
								WHERE 1=1 \
								/*拉貨不匯出*/ \
								AND PG_SEQ IS NULL \
								AND IL_SEQ = @IL_SEQ \
								AND IL_MERGENO IS NOT NULL ";
				
			if(pParams["NewSmallNo"] !== undefined){
				_SQLCommand += " AND IL_NEWSMALLNO IN ("+pParams["NewSmallNo"]+") ";
				delete pParams["NewSmallNo"];
			}
			
			_SQLCommand += ") A \
							WHERE A.IL_BAGNOEX_NOREPEAT IS NOT NULL \
							ORDER BY IL_MERGENO ";
		
			break;

		case "SelectItemListForEx0":
			_SQLCommand += "SELECT BLFO_TRACK, \
									CASE WHEN PG_SEQ IS NULL THEN 0 ELSE 1 END AS 'PG_PULLGOODS', \
									CASE WHEN SPG_SEQ IS NULL OR SPG_TYPE IS NULL THEN NULL ELSE \
										CASE WHEN SPG_TYPE = 1 THEN '普特貨'\
										ELSE '特特貨' END \
									END AS 'SPG_SPECIALGOODS', \
									PG_MOVED, \
									ITEM_LIST.*, \
									REPLACE(( \
										CASE WHEN LEFT(IL_GETTEL, 3) = '886' THEN '0' + SUBSTRING(IL_GETTEL, 4, LEN(IL_GETTEL)) \
										WHEN LEN(IL_GETTEL) = 9 THEN '0' + IL_GETTEL \
										ELSE IL_GETTEL END \
									), '-', '') AS IL_GETTEL_EX, \
									CASE WHEN ROW_NUMBER() OVER(PARTITION BY IL_BAGNO ORDER BY IL_BAGNO) = 1 \
									THEN IL_BAGNO ELSE NULL END AS 'IL_BAGNOEX_NOREPEAT' \
							FROM ITEM_LIST \
							LEFT JOIN BLACK_LIST_FROM_OP ON \
							IL_SEQ = BLFO_SEQ AND \
							IL_NEWBAGNO = BLFO_NEWBAGNO AND \
							IL_NEWSMALLNO = BLFO_NEWSMALLNO AND \
							IL_ORDERINDEX = BLFO_ORDERINDEX \
							LEFT JOIN PULL_GOODS ON \
							IL_SEQ = PG_SEQ AND \
							IL_BAGNO = PG_BAGNO \
							LEFT JOIN SPECIAL_GOODS ON \
							IL_SEQ = SPG_SEQ AND \
							IL_NEWBAGNO = SPG_NEWBAGNO AND \
							IL_NEWSMALLNO = SPG_NEWSMALLNO AND \
							IL_ORDERINDEX = SPG_ORDERINDEX \
							WHERE 1=1 \
							/*拉貨不匯出*/ \
							AND PG_SEQ IS NULL ";
			
			if(pParams["IL_G1"] !== undefined){
				_SQLCommand += " AND IL_G1 IN ("+pParams["IL_G1"]+")";
				delete pParams["IL_G1"];
			}
			
			if(pParams["IL_MERGENO"] !== undefined && pParams["IL_MERGENO"] == null){
				_SQLCommand += " AND IL_MERGENO IS NULL";
			}

			if(pParams["IL_SEQ"] !== undefined){
				_SQLCommand += " AND IL_SEQ = @IL_SEQ";
			}
							
			if(pParams["NewSmallNo"] !== undefined){
				_SQLCommand += " AND IL_NEWSMALLNO IN ("+pParams["NewSmallNo"]+") ";
				delete pParams["NewSmallNo"];
			}

			_SQLCommand += " ORDER BY IL_BAGNO ";
		
			break;

		case "SelectItemListForEx12":
			_SQLCommand += "SELECT BLFO_TRACK,  \
									CASE WHEN PG_SEQ IS NULL THEN 0 ELSE 1 END AS 'PG_PULLGOODS', \
									CASE WHEN SPG_SEQ IS NULL OR SPG_TYPE IS NULL THEN NULL ELSE \
										CASE WHEN SPG_TYPE = 1 THEN '普特貨'\
										ELSE '特特貨' END \
									END AS 'SPG_SPECIALGOODS', \
									PG_MOVED, \
									CASE WHEN ITEM_LIST.IL_G1 = 'Y' THEN '' ELSE ITEM_LIST.IL_G1 END AS 'IL_G1_X2', \
									CASE WHEN ITEM_LIST.IL_G1 = 'Y' THEN 'Y' ELSE '' END AS 'IL_G1_ONLY_Y', \
									CASE WHEN ITEM_LIST.IL_G1 = 'Y' THEN '" + pParams["OL_CO_NAME"] + "' ELSE IL_NEWSENDNAME END AS 'IL_NEWSENDNAME_X2', \
									CASE WHEN ITEM_LIST.IL_G1 = 'Y' THEN IL_GETNO ELSE IL_EXNO END AS 'IL_GETNO_X2', \
									CASE WHEN ITEM_LIST.IL_WEIGHT_NEW < 0.1 THEN '0.1' ELSE ITEM_LIST.IL_WEIGHT_NEW END AS 'IL_WEIGHT_NEW_X2',\
									ITEM_LIST.*, \
									REPLACE(( \
										CASE WHEN LEFT(IL_GETTEL, 3) = '886' THEN '0' + SUBSTRING(IL_GETTEL, 4, LEN(IL_GETTEL)) \
										WHEN LEN(IL_GETTEL) = 9 THEN '0' + IL_GETTEL \
										ELSE IL_GETTEL END \
									), '-', '') AS IL_GETTEL_EX, \
									CASE WHEN ROW_NUMBER() OVER(PARTITION BY IL_BAGNO ORDER BY IL_BAGNO) = 1 \
									THEN IL_BAGNO ELSE NULL END AS 'IL_BAGNOEX_NOREPEAT' \
							FROM ITEM_LIST \
							LEFT JOIN BLACK_LIST_FROM_OP ON \
							IL_SEQ = BLFO_SEQ AND \
							IL_NEWBAGNO = BLFO_NEWBAGNO AND \
							IL_NEWSMALLNO = BLFO_NEWSMALLNO AND \
							IL_ORDERINDEX = BLFO_ORDERINDEX \
							LEFT JOIN PULL_GOODS ON \
							IL_SEQ = PG_SEQ AND \
							IL_BAGNO = PG_BAGNO \
							LEFT JOIN SPECIAL_GOODS ON \
							IL_SEQ = SPG_SEQ AND \
							IL_NEWBAGNO = SPG_NEWBAGNO AND \
							IL_NEWSMALLNO = SPG_NEWSMALLNO AND \
							IL_ORDERINDEX = SPG_ORDERINDEX \
							WHERE 1=1 \
							/*拉貨不匯出*/ \
							AND PG_SEQ IS NULL ";
			
			if(pParams["IL_G1"] !== undefined){
				_SQLCommand += " AND IL_G1 IN ("+pParams["IL_G1"]+")";
				delete pParams["IL_G1"];
			}
			
			if(pParams["IL_MERGENO"] !== undefined && pParams["IL_MERGENO"] == null){
				_SQLCommand += " AND IL_MERGENO IS NULL";
			}

			if(pParams["IL_SEQ"] !== undefined){
				_SQLCommand += " AND IL_SEQ = @IL_SEQ";
			}
							
			if(pParams["NewSmallNo"] !== undefined){
				_SQLCommand += " AND IL_NEWSMALLNO IN ("+pParams["NewSmallNo"]+") ";
				delete pParams["NewSmallNo"];
			}

			_SQLCommand += " ORDER BY IL_BAGNO ";

			break;

		case "SelectItemListForEx8":
			_SQLCommand += "SELECT BLFO_TRACK, \
									CASE WHEN PG_SEQ IS NULL THEN 0 ELSE 1 END AS 'PG_PULLGOODS', \
									CASE WHEN SPG_SEQ IS NULL OR SPG_TYPE IS NULL THEN NULL ELSE \
										CASE WHEN SPG_TYPE = 1 THEN '普特貨' \
										ELSE '特特貨' END \
									END AS 'SPG_SPECIALGOODS', \
									PG_MOVED, \
									ITEM_LIST.*, \
									CASE WHEN ROW_NUMBER() OVER(PARTITION BY IL_BAGNO ORDER BY IL_BAGNO) = 1 \
									THEN IL_BAGNO ELSE NULL END AS 'IL_BAGNOEX_NOREPEAT', \
									/*淨重 ROUND(IF(G5-0.5>0,G5-0.5,G5-0.1),2)*/ \
									CASE WHEN ITEM_LIST.IL_WEIGHT_NEW - 0.5 > 0 THEN ROUND(ITEM_LIST.IL_WEIGHT_NEW - 0.5, 2) ELSE ROUND(ITEM_LIST.IL_WEIGHT_NEW - 0.1, 2) END AS 'NW', \
									/*稅別辦法*/ \
									'31' AS 'TAX_METHOD', \
									/*小號*/ \
									CASE WHEN LEN(ITEM_LIST.IL_SMALLNO) > 13 THEN 'X' ELSE '' END AS 'SMALLNO', \
									/*地址 IF(LENB($P5)>32,\"X\",\"\")*/ \
									CASE WHEN DATALENGTH(ITEM_LIST.IL_GETADDRESS) > 32 THEN 'X' ELSE '' END AS 'ADDRESS' \
							FROM ITEM_LIST \
							LEFT JOIN BLACK_LIST_FROM_OP ON \
							IL_SEQ = BLFO_SEQ AND \
							IL_NEWBAGNO = BLFO_NEWBAGNO AND \
							IL_NEWSMALLNO = BLFO_NEWSMALLNO AND \
							IL_ORDERINDEX = BLFO_ORDERINDEX \
							LEFT JOIN PULL_GOODS ON \
							IL_SEQ = PG_SEQ AND \
							IL_BAGNO = PG_BAGNO \
							LEFT JOIN SPECIAL_GOODS ON \
							IL_SEQ = SPG_SEQ AND \
							IL_NEWBAGNO = SPG_NEWBAGNO AND \
							IL_NEWSMALLNO = SPG_NEWSMALLNO AND \
							IL_ORDERINDEX = SPG_ORDERINDEX \
							WHERE 1=1 \
							/*拉貨不匯出*/ \
							AND PG_SEQ IS NULL \
							/*匯出X2*/ \
							AND IL_G1 IN ('', 'X2') ";
							
			if(pParams["IL_SEQ"] !== undefined){
				_SQLCommand += " AND IL_SEQ = @IL_SEQ";
			}
							
			if(pParams["NewSmallNo"] !== undefined){
				_SQLCommand += " AND IL_NEWSMALLNO IN ("+pParams["NewSmallNo"]+") ";
				delete pParams["NewSmallNo"];
			}

			_SQLCommand += " ORDER BY IL_BAGNO ";
		
			break;
		case "SelectOverSixFirst":
			_SQLCommand += "SELECT ITEM_LIST.*, \
								   GETNAME_COUNT, \
								   GETADDRESS_COUNT \
								   /*GETTEL_COUNT*/ \
							FROM ITEM_LIST \
							LEFT JOIN V_FIRST_HALF_YEAR_NAME VFHYN ON VFHYN.IL_GETNAME_NEW = ITEM_LIST.IL_GETNAME_NEW \
							LEFT JOIN V_FIRST_HALF_YEAR_ADDRESS VFHYA ON VFHYA.IL_GETADDRESS_NEW = ITEM_LIST.IL_GETADDRESS_NEW \
							/*LEFT JOIN V_FIRST_HALF_YEAR_TEL VFHYT ON VFHYT.IL_GETTEL = ITEM_LIST.IL_GETTEL*/ \
							WHERE 1=1 \
							/*不包含G1 X2 X3*/ \
							AND IL_G1 = '' \
							AND IL_MERGENO IS NULL";
							
			if(pParams["IL_SEQ"] !== undefined){
				_SQLCommand += " AND IL_SEQ = @IL_SEQ";
			}

			_SQLCommand += " AND ( GETADDRESS_COUNT IS NOT NULL \
							OR GETNAME_COUNT IS NOT NULL \
							/*OR GETTEL_COUNT IS NOT NULL*/ ) ";
			
			break;
		case "SelectOverSixSecond":
			_SQLCommand += "SELECT ITEM_LIST.*, \
								   GETNAME_COUNT, \
								   GETADDRESS_COUNT \
								   /*GETTEL_COUNT*/ \
							FROM ITEM_LIST \
							LEFT JOIN V_SECOND_HALF_YEAR_NAME VSHYN ON VSHYN.IL_GETNAME_NEW = ITEM_LIST.IL_GETNAME_NEW \
							LEFT JOIN V_SECOND_HALF_YEAR_ADDRESS VSHYA ON VSHYA.IL_GETADDRESS_NEW = ITEM_LIST.IL_GETADDRESS_NEW \
							/*LEFT JOIN V_SECOND_HALF_YEAR_TEL VSHYT ON VSHYT.IL_GETTEL = ITEM_LIST.IL_GETTEL*/ \
							WHERE 1=1 \
							/*不包含G1 X2 X3*/ \
							AND IL_G1 = '' \
							AND IL_MERGENO IS NULL";
							
			if(pParams["IL_SEQ"] !== undefined){
				_SQLCommand += " AND IL_SEQ = @IL_SEQ";
			}

			_SQLCommand += " AND ( GETADDRESS_COUNT IS NOT NULL \
							OR GETNAME_COUNT IS NOT NULL \
							/*OR GETTEL_COUNT IS NOT NULL*/ ) ";
			
			break;
		case "SelectOverSixCompoundFirst":
			_SQLCommand += "SELECT ITEM_LIST.*, \
								   GETNAME_COUNT, \
								   GETADDRESS_COUNT \
								   /*GETTEL_COUNT*/ \
							FROM ITEM_LIST \
							LEFT JOIN V_FIRST_HALF_YEAR_ADDRESS_AND_NAME VFHYAAN ON \
							VFHYAAN.IL_GETNAME_NEW  = ITEM_LIST.IL_GETNAME_NEW AND \
							VFHYAAN.IL_GETADDRESS_NEW  = ITEM_LIST.IL_GETADDRESS_NEW \
							WHERE 1=1 \
							/*不包含G1 X2 X3*/ \
							AND IL_G1 = '' \
							AND IL_MERGENO IS NULL";
							
			if(pParams["IL_SEQ"] !== undefined){
				_SQLCommand += " AND IL_SEQ = @IL_SEQ";
			}

			_SQLCommand += " AND ( GETADDRESS_COUNT IS NOT NULL \
							OR GETNAME_COUNT IS NOT NULL \
							/*OR GETTEL_COUNT IS NOT NULL*/ ) ";
			
			break;
		case "SelectOverSixCompoundSecond":
			_SQLCommand += "SELECT ITEM_LIST.*, \
								   GETNAME_COUNT, \
								   GETADDRESS_COUNT \
								   /*GETTEL_COUNT*/ \
							FROM ITEM_LIST \
							LEFT JOIN V_SECOND_HALF_YEAR_ADDRESS_AND_NAME VSHYAAN ON \
							VSHYAAN.IL_GETNAME_NEW  = ITEM_LIST.IL_GETNAME_NEW AND \
							VSHYAAN.IL_GETADDRESS_NEW  = ITEM_LIST.IL_GETADDRESS_NEW \
							WHERE 1=1 \
							/*不包含G1 X2 X3*/ \
							AND IL_G1 = '' \
							AND IL_MERGENO IS NULL";
							
			if(pParams["IL_SEQ"] !== undefined){
				_SQLCommand += " AND IL_SEQ = @IL_SEQ";
			}

			_SQLCommand += " AND ( GETADDRESS_COUNT IS NOT NULL \
							OR GETNAME_COUNT IS NOT NULL \
							/*OR GETTEL_COUNT IS NOT NULL*/ ) ";
			
			break;

		case "GetFirstBagNo":
			_SQLCommand += "SELECT TOP 1 IL_BAGNO \
						    FROM ITEM_LIST \
						    WHERE 1=1 \
						    AND IL_SEQ = @IL_SEQ \
						    ORDER BY IL_BAGNO";
			break;
	}

	return _SQLCommand;
};