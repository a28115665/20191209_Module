module.exports = function(pQueryname, pParams){
	var _SQLCommand = "";

	switch(pQueryname){
		case "SelectItemList":
			_SQLCommand += "SELECT BLFO_TRACK, \
									CASE WHEN PG_SEQ IS NULL THEN 0 ELSE 1 END AS 'PG_PULLGOODS', \
									CASE WHEN SPG_SEQ IS NULL OR SPG_TYPE IS NULL THEN 0 ELSE SPG_TYPE END AS 'SPG_SPECIALGOODS', \
									CASE WHEN SDG_SEQ IS NULL THEN 0 ELSE 1 END AS 'SDG_SOFTDELETEGOODS', \
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
							LEFT JOIN SOFTDELETE_GOODS ON \
							IL_SEQ = SDG_SEQ AND \
							IL_NEWBAGNO = SDG_NEWBAGNO AND \
							IL_NEWSMALLNO = SDG_NEWSMALLNO AND \
							IL_ORDERINDEX = SDG_ORDERINDEX \
							WHERE 1=1 \
							AND IL_SEQ = @IL_SEQ \
							ORDER BY IL_BAGNO";
		
			break;
		case "SelectRepeatName":
			_SQLCommand += "SELECT V_ITEM_LIST_EXIST_ITEM.* \
							FROM V_ITEM_LIST_EXIST_ITEM \
							JOIN ( \
								SELECT IL_GETNAME_NEW \
								FROM V_ITEM_LIST_EXIST_ITEM \
								WHERE IL_SEQ = @IL_SEQ \
								AND IL_G1 NOT IN ('G1','移倉') \
								GROUP BY IL_GETNAME_NEW \
								HAVING COUNT(*) > 1 \
							) REPEAT_NAME ON REPEAT_NAME.IL_GETNAME_NEW = V_ITEM_LIST_EXIST_ITEM.IL_GETNAME_NEW \
							WHERE V_ITEM_LIST_EXIST_ITEM.IL_SEQ = @IL_SEQ \
							AND IL_G1 = '' \
							AND IL_MERGENO IS NULL \
							ORDER BY IL_GETNAME_NEW, IL_BAGNO";
			
			break;
		case "SelectRepeatAddress":
			_SQLCommand += "SELECT V_ITEM_LIST_EXIST_ITEM.* \
							FROM V_ITEM_LIST_EXIST_ITEM \
							JOIN ( \
								SELECT IL_GETADDRESS_NEW \
								FROM V_ITEM_LIST_EXIST_ITEM \
								WHERE IL_SEQ = @IL_SEQ \
								AND IL_G1 NOT IN ('G1','移倉') \
								GROUP BY IL_GETADDRESS_NEW \
								HAVING COUNT(*) > 1 \
							) REPEAT_ADDRESS ON REPEAT_ADDRESS.IL_GETADDRESS_NEW = V_ITEM_LIST_EXIST_ITEM.IL_GETADDRESS_NEW \
							WHERE V_ITEM_LIST_EXIST_ITEM.IL_SEQ = @IL_SEQ \
							AND IL_G1 = '' \
							AND IL_MERGENO IS NULL \
							ORDER BY IL_GETADDRESS_NEW, IL_BAGNO";
			
			break;
		case "SelectRepeatNameAndAddress":
			_SQLCommand += "SELECT V_ITEM_LIST_EXIST_ITEM.* \
							FROM V_ITEM_LIST_EXIST_ITEM \
							JOIN ( \
								SELECT IL_GETNAME_NEW, IL_GETADDRESS_NEW \
								FROM V_ITEM_LIST_EXIST_ITEM \
								WHERE IL_SEQ = @IL_SEQ \
								AND IL_GETNAME_NEW IS NOT NULL \
								AND IL_GETADDRESS_NEW IS NOT NULL \
								AND IL_G1 NOT IN ('G1','移倉') \
								GROUP BY IL_GETNAME_NEW, IL_GETADDRESS_NEW \
								HAVING COUNT(*) > 1 \
							) REPEAT_ADDRESS \
							ON REPEAT_ADDRESS.IL_GETNAME_NEW = V_ITEM_LIST_EXIST_ITEM.IL_GETNAME_NEW \
							AND REPEAT_ADDRESS.IL_GETADDRESS_NEW = V_ITEM_LIST_EXIST_ITEM.IL_GETADDRESS_NEW \
							WHERE V_ITEM_LIST_EXIST_ITEM.IL_SEQ = @IL_SEQ \
							AND IL_G1 = '' \
							AND IL_MERGENO IS NULL \
							ORDER BY IL_GETNAME_NEW, IL_GETADDRESS_NEW, IL_BAGNO";
			
			break;
		case "SelectRepeatNameWithOneBagno":
			_SQLCommand += "SELECT V_ITEM_LIST_EXIST_ITEM.* \
							FROM V_ITEM_LIST_EXIST_ITEM \
							INNER JOIN ( \
								SELECT IL_BAGNO, IL_GETNAME_NEW \
								FROM V_ITEM_LIST_EXIST_ITEM \
								WHERE IL_SEQ = @IL_SEQ \
								GROUP BY IL_BAGNO, IL_GETNAME_NEW \
								HAVING COUNT(IL_BAGNO) > 1 AND COUNT(IL_GETNAME_NEW) > 1 \
							) IL2 ON IL2.IL_BAGNO = V_ITEM_LIST_EXIST_ITEM.IL_BAGNO AND IL2.IL_GETNAME_NEW = V_ITEM_LIST_EXIST_ITEM.IL_GETNAME_NEW \
							ORDER BY V_ITEM_LIST_EXIST_ITEM.IL_BAGNO";
			
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
									V_ITEM_LIST_EXIST_ITEM.* \
							FROM V_ITEM_LIST_EXIST_ITEM \
							LEFT JOIN ( \
								SELECT IL_MERGENO AS MERGENO, COUNT(IL_BAGNO) AS IL_MERGENO_COUNT \
								FROM ( \
									SELECT DISTINCT IL_MERGENO, IL_BAGNO \
									FROM V_ITEM_LIST_EXIST_ITEM \
									WHERE IL_SEQ = @IL_SEQ \
									AND IL_MERGENO IS NOT NULL \
								) MERGENO \
								GROUP BY IL_MERGENO \
							) V_ITEM_LIST_EXIST_ITEM2 ON V_ITEM_LIST_EXIST_ITEM2.MERGENO = V_ITEM_LIST_EXIST_ITEM.IL_MERGENO \
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

			_SQLCommand += "ORDER BY ( \
							    CASE IL_G1 \
							    WHEN 'G1' \
							    THEN 10 \
								END \
							) DESC, IL_MERGENO DESC, IL_BAGNO";
		
			break;



		case "SelectItemListForEx0MX3":
			_SQLCommand += "SELECT *, \
									@CO_NAME AS 'CO_NAME', \
									IL_UNIVALENT_NEW * IL_NEWPCS_NOREPEAT AS 'IL_FINALCOST_NOREPEAT', \
									CONVERT(VARCHAR, IL_TAXRATE) + '%' AS 'IL_TAXRATEEX', \
									ROUND(CASE WHEN IL_WEIGHT_NEW - 0.5 > 0 THEN IL_WEIGHT_NEW - 0.5 ELSE IL_WEIGHT_NEW - 0.1 END, 2) AS 'IL_NETWEIGHT',  \
									ROUND(IL_TAXRATE/100 * (IL_UNIVALENT_NEW * IL_NEWPCS_NOREPEAT), 1) AS 'IL_A10', \
									ROUND(((IL_UNIVALENT_NEW * IL_NEWPCS_NOREPEAT) + (IL_TAXRATE/100 * (IL_UNIVALENT_NEW * IL_NEWPCS_NOREPEAT))) * 0.05, 1) AS 'IL_B40', \
									ROUND((IL_TAXRATE/100 * (IL_UNIVALENT_NEW * IL_NEWPCS_NOREPEAT)) + (((IL_UNIVALENT_NEW * IL_NEWPCS_NOREPEAT) + (IL_TAXRATE/100 * (IL_UNIVALENT_NEW * IL_NEWPCS_NOREPEAT))) * 0.05), 1) AS 'IL_A10AndB40' \
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
											FROM V_ITEM_LIST_EXIST_ITEM IN_IL \
											LEFT JOIN PULL_GOODS ON \
											IN_IL.IL_SEQ = PG_SEQ AND \
											IN_IL.IL_BAGNO = PG_BAGNO \
											WHERE IN_IL.IL_MERGENO = OUT_IL.IL_MERGENO \
											AND IN_IL.IL_SEQ = @IL_SEQ \
											/*拉貨不匯出*/ \
											AND PG_SEQ IS NULL \
										) ELSE NULL END AS 'IL_CTN_NOREPEAT', \
										CASE WHEN ROW_NUMBER() OVER(PARTITION BY IL_MERGENO ORDER BY IL_MERGENO) = 1 \
										/*THEN( \
											SELECT SUM(IL_WEIGHT_NEW) \
											FROM V_ITEM_LIST_EXIST_ITEM IN_IL \
											LEFT JOIN PULL_GOODS ON \
											IN_IL.IL_SEQ = PG_SEQ AND \
											IN_IL.IL_BAGNO = PG_BAGNO \
											WHERE IN_IL.IL_MERGENO = OUT_IL.IL_MERGENO \
											AND IN_IL.IL_SEQ = @IL_SEQ \
											/*拉貨不匯出*/ \
											AND PG_SEQ IS NULL \
										) ELSE NULL END AS 'IL_WEIGHT_NEW_NOREPEAT',*/ \
										THEN ISNULL(IL_WEIGHT_NEW, 0) ELSE NULL END AS 'IL_WEIGHT_NEW_NOREPEAT', \
										CASE WHEN ROW_NUMBER() OVER(PARTITION BY IL_MERGENO ORDER BY IL_MERGENO) = 1 \
										/*THEN( \
											SELECT SUM(IL_NEWPCS) \
											FROM V_ITEM_LIST_EXIST_ITEM IN_IL \
											LEFT JOIN PULL_GOODS ON \
											IN_IL.IL_SEQ = PG_SEQ AND \
											IN_IL.IL_BAGNO = PG_BAGNO \
											WHERE IN_IL.IL_MERGENO = OUT_IL.IL_MERGENO \
											AND IN_IL.IL_SEQ = @IL_SEQ \
											/*拉貨不匯出*/ \
											AND PG_SEQ IS NULL \
										) ELSE NULL END AS 'IL_NEWPCS_NOREPEAT'*/ \
										THEN ISNULL(IL_NEWPCS, 0) ELSE NULL END AS 'IL_NEWPCS_NOREPEAT' \
								FROM V_ITEM_LIST_EXIST_ITEM OUT_IL \
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
									V_ITEM_LIST_EXIST_ITEM.*, \
									REPLACE(( \
										CASE WHEN LEFT(IL_GETTEL, 3) = '886' THEN '0' + SUBSTRING(IL_GETTEL, 4, LEN(IL_GETTEL)) \
										WHEN LEN(IL_GETTEL) = 9 THEN '0' + IL_GETTEL \
										ELSE IL_GETTEL END \
									), '-', '') AS IL_GETTEL_EX, \
									CASE WHEN ROW_NUMBER() OVER(PARTITION BY IL_BAGNO ORDER BY IL_BAGNO) = 1 \
									THEN IL_BAGNO ELSE NULL END AS 'IL_BAGNOEX_NOREPEAT' \
							FROM V_ITEM_LIST_EXIST_ITEM \
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
									CASE WHEN V_ITEM_LIST_EXIST_ITEM.IL_G1 = 'Y' THEN '' ELSE V_ITEM_LIST_EXIST_ITEM.IL_G1 END AS 'IL_G1_X2', \
									CASE WHEN V_ITEM_LIST_EXIST_ITEM.IL_G1 = 'Y' THEN 'Y' ELSE '' END AS 'IL_G1_ONLY_Y', \
									CASE WHEN V_ITEM_LIST_EXIST_ITEM.IL_G1 = 'Y' THEN '" + pParams["OL_CO_NAME"] + "' ELSE IL_NEWSENDNAME END AS 'IL_NEWSENDNAME_X2', \
									/*CASE WHEN V_ITEM_LIST_EXIST_ITEM.IL_G1 = 'Y' THEN IL_GETNO ELSE IL_EXNO END AS 'IL_GETNO_X2',*/ \
									CASE WHEN V_ITEM_LIST_EXIST_ITEM.IL_G1 = '上稅' THEN IL_TAX2 ELSE '' END AS 'IL_TAX2_X2', \
									CASE WHEN V_ITEM_LIST_EXIST_ITEM.IL_G1 = '上稅' THEN CONVERT(varchar, IL_TAXRATE) ELSE '' END AS 'IL_TAXRATE_X2', \
									CASE WHEN V_ITEM_LIST_EXIST_ITEM.IL_G1 = '上稅' THEN IL_GETNO ELSE '' END AS 'IL_GETNO_X2', \
									CASE WHEN V_ITEM_LIST_EXIST_ITEM.IL_WEIGHT_NEW < 0.1 THEN '0.1' ELSE V_ITEM_LIST_EXIST_ITEM.IL_WEIGHT_NEW END AS 'IL_WEIGHT_NEW_X2',\
									V_ITEM_LIST_EXIST_ITEM.*, \
									REPLACE(( \
										CASE WHEN LEFT(IL_GETTEL, 3) = '886' THEN '0' + SUBSTRING(IL_GETTEL, 4, LEN(IL_GETTEL)) \
										WHEN LEN(IL_GETTEL) = 9 THEN '0' + IL_GETTEL \
										ELSE IL_GETTEL END \
									), '-', '') AS IL_GETTEL_EX, \
									CASE WHEN ROW_NUMBER() OVER(PARTITION BY IL_BAGNO ORDER BY IL_BAGNO) = 1 \
									THEN IL_BAGNO ELSE NULL END AS 'IL_BAGNOEX_NOREPEAT', \
									CONVERT(VARCHAR, IL_TAXRATE) + '%' AS 'IL_TAXRATEEX', \
									ROUND(CASE WHEN V_ITEM_LIST_EXIST_ITEM.IL_WEIGHT_NEW - 0.5 > 0 THEN V_ITEM_LIST_EXIST_ITEM.IL_WEIGHT_NEW - 0.5 ELSE V_ITEM_LIST_EXIST_ITEM.IL_WEIGHT_NEW - 0.1 END, 2) AS 'IL_NETWEIGHT', \
									ROUND(IL_TAXRATE/100 * IL_FINALCOST, 1) AS 'IL_A10', \
									ROUND((IL_FINALCOST + (IL_TAXRATE/100 * IL_FINALCOST)) * 0.05, 1) AS 'IL_B40', \
									ROUND((IL_TAXRATE/100 * IL_FINALCOST) + ((IL_FINALCOST + (IL_TAXRATE/100 * IL_FINALCOST)) * 0.05), 1) AS 'IL_A10AndB40' \
							FROM V_ITEM_LIST_EXIST_ITEM \
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
				_SQLCommand += " AND (IL_G1 IN ("+pParams["IL_G1"]+") OR IL_G1 IS NULL)";
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
									V_ITEM_LIST_EXIST_ITEM.*, \
									CASE WHEN ROW_NUMBER() OVER(PARTITION BY IL_BAGNO ORDER BY IL_BAGNO) = 1 \
									THEN IL_BAGNO ELSE NULL END AS 'IL_BAGNOEX_NOREPEAT', \
									/*淨重 ROUND(IF(G5-0.5>0,G5-0.5,G5-0.1),2)*/ \
									CASE WHEN V_ITEM_LIST_EXIST_ITEM.IL_WEIGHT_NEW - 0.5 > 0 THEN ROUND(V_ITEM_LIST_EXIST_ITEM.IL_WEIGHT_NEW - 0.5, 2) ELSE ROUND(V_ITEM_LIST_EXIST_ITEM.IL_WEIGHT_NEW - 0.1, 2) END AS 'NW', \
									/*稅別辦法*/ \
									'31' AS 'TAX_METHOD', \
									/*小號*/ \
									CASE WHEN LEN(V_ITEM_LIST_EXIST_ITEM.IL_SMALLNO) > 13 THEN 'X' ELSE '' END AS 'SMALLNO', \
									/*地址 IF(LENB($P5)>32,\"X\",\"\")*/ \
									CASE WHEN DATALENGTH(V_ITEM_LIST_EXIST_ITEM.IL_GETADDRESS) > 32 THEN 'X' ELSE '' END AS 'ADDRESS' \
							FROM V_ITEM_LIST_EXIST_ITEM \
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
			_SQLCommand += "SELECT V_ITEM_LIST_EXIST_ITEM.*, \
								   GETNAME_COUNT, \
								   GETADDRESS_COUNT \
								   /*GETTEL_COUNT*/ \
							FROM V_ITEM_LIST_EXIST_ITEM \
							LEFT JOIN V_FIRST_HALF_YEAR_NAME VFHYN ON VFHYN.IL_GETNAME_NEW = V_ITEM_LIST_EXIST_ITEM.IL_GETNAME_NEW \
							LEFT JOIN V_FIRST_HALF_YEAR_ADDRESS VFHYA ON VFHYA.IL_GETADDRESS_NEW = V_ITEM_LIST_EXIST_ITEM.IL_GETADDRESS_NEW \
							/*LEFT JOIN V_FIRST_HALF_YEAR_TEL VFHYT ON VFHYT.IL_GETTEL = V_ITEM_LIST_EXIST_ITEM.IL_GETTEL*/ \
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
			_SQLCommand += "SELECT V_ITEM_LIST_EXIST_ITEM.*, \
								   GETNAME_COUNT, \
								   GETADDRESS_COUNT \
								   /*GETTEL_COUNT*/ \
							FROM V_ITEM_LIST_EXIST_ITEM \
							LEFT JOIN V_SECOND_HALF_YEAR_NAME VSHYN ON VSHYN.IL_GETNAME_NEW = V_ITEM_LIST_EXIST_ITEM.IL_GETNAME_NEW \
							LEFT JOIN V_SECOND_HALF_YEAR_ADDRESS VSHYA ON VSHYA.IL_GETADDRESS_NEW = V_ITEM_LIST_EXIST_ITEM.IL_GETADDRESS_NEW \
							/*LEFT JOIN V_SECOND_HALF_YEAR_TEL VSHYT ON VSHYT.IL_GETTEL = V_ITEM_LIST_EXIST_ITEM.IL_GETTEL*/ \
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
			_SQLCommand += "SELECT V_ITEM_LIST_EXIST_ITEM.*, \
								   GETNAME_COUNT, \
								   GETADDRESS_COUNT \
								   /*GETTEL_COUNT*/ \
							FROM V_ITEM_LIST_EXIST_ITEM \
							LEFT JOIN V_FIRST_HALF_YEAR_ADDRESS_AND_NAME VFHYAAN ON \
							VFHYAAN.IL_GETNAME_NEW  = V_ITEM_LIST_EXIST_ITEM.IL_GETNAME_NEW AND \
							VFHYAAN.IL_GETADDRESS_NEW  = V_ITEM_LIST_EXIST_ITEM.IL_GETADDRESS_NEW \
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
			_SQLCommand += "SELECT V_ITEM_LIST_EXIST_ITEM.*, \
								   GETNAME_COUNT, \
								   GETADDRESS_COUNT \
								   /*GETTEL_COUNT*/ \
							FROM V_ITEM_LIST_EXIST_ITEM \
							LEFT JOIN V_SECOND_HALF_YEAR_ADDRESS_AND_NAME VSHYAAN ON \
							VSHYAAN.IL_GETNAME_NEW  = V_ITEM_LIST_EXIST_ITEM.IL_GETNAME_NEW AND \
							VSHYAAN.IL_GETADDRESS_NEW  = V_ITEM_LIST_EXIST_ITEM.IL_GETADDRESS_NEW \
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

		// case "GetFirstBagNo":
		// 	_SQLCommand += "SELECT TOP 1 IL_BAGNO \
		// 				    FROM ITEM_LIST \
		// 				    WHERE 1=1 \
		// 				    AND IL_SEQ = @IL_SEQ \
		// 				    ORDER BY IL_BAGNO";
		// 	break;

		case "ReCalculateBag":
			_SQLCommand += "EXEC	[dbo].[ItemListReCalculateBag] \
							@Seq = @IL_SEQ, \
							@Bagno = @IL_BAGNO";
			break;

		case "SelectItemListBangoNumber":
			_SQLCommand += "SELECT IL_BAGNO, COUNT(1) AS Number \
							FROM V_ITEM_LIST_EXIST_ITEM \
							WHERE IL_SEQ = @IL_SEQ \
							GROUP BY IL_BAGNO";
			break;

		case "SelectItemListMergeNumber":
			_SQLCommand += "SELECT IL_MERGENO, COUNT(IL_MERGENO) AS Number \
							FROM V_ITEM_LIST_EXIST_ITEM \
							WHERE IL_MERGENO IS NOT NULL \
							AND IL_SEQ = @IL_SEQ \
							GROUP BY IL_MERGENO";
			break;
	}

	return _SQLCommand;
};