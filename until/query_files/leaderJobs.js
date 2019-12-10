module.exports = function(pQueryname, pParams){
	var _SQLCommand = "";

	switch(pQueryname){
		case "SelectOrderList":
			_SQLCommand += "SELECT OL_SEQ, \
									OL_CO_CODE, \
									OL_MASTER, \
									OL_FLIGHTNO, \
									OL_IMPORTDT, \
									OL_REAL_IMPORTDT, \
									OL_CR_DATETIME, \
									OL_COUNTRY, \
									OL_REASON, \
									OL_ILSTATUS, \
									OL_FLLSTATUS, \
									OL_DILSTATUS, \
									( \
										( \
											SELECT COUNT(1) \
											FROM ( \
												SELECT IL_BAGNO \
												FROM ITEM_LIST \
												WHERE IL_SEQ = OL_SEQ \
												AND IL_BAGNO IS NOT NULL AND IL_BAGNO != '' \
												GROUP BY IL_BAGNO \
											) A \
										) - \
										( \
											SELECT COUNT(1) \
											FROM PULL_GOODS \
											WHERE PG_SEQ = OL_SEQ \
										) \
									) AS 'OL_COUNT', \
									( \
										SELECT COUNT(1) \
										FROM PULL_GOODS \
										WHERE PG_SEQ = OL_SEQ \
									) AS 'OL_PULL_COUNT', \
									( \
										SELECT COUNT(1) \
										FROM ( \
											SELECT FLL_IL_NEWBAGNO \
											FROM FLIGHT_ITEM_LIST \
											WHERE FLL_SEQ = OL_SEQ \
										) A \
									) AS 'OL_FLL_COUNT', \
									( \
										SELECT MAX(IL_SUPPLEMENT_COUNT) \
										FROM ITEM_LIST \
										WHERE IL_SEQ = OL_SEQ \
									) AS 'OL_SUPPLEMENT_COUNT', \
									OL_CR_USER, \
									( \
										CASE WHEN ( \
											/*表示已有完成者*/ \
											SELECT COUNT(1) \
											FROM V_ORDER_W2_STATUS3 \
											WHERE OP_SEQ = OL_SEQ \
										) > 0 THEN '3' \
										WHEN ( \
											/*表示已有完成者，但非作業員*/ \
											SELECT COUNT(1) \
											FROM V_ORDER_W2_STATUS4 \
											WHERE OP_SEQ = OL_SEQ \
										) > 0 OR W2_OE.OE_FDATETIME IS NOT NULL THEN '4' \
										WHEN ( \
											/*表示未有完成者，但有編輯者*/ \
											SELECT COUNT(1) \
											FROM V_ORDER_W2_STATUS2 \
											WHERE OP_SEQ = OL_SEQ \
										) > 0 THEN '2' \
										WHEN ( \
											/*表示未有完成者，未有編輯者，但有負責人(已派單)*/ \
											SELECT COUNT(1) \
											FROM V_ORDER_W2_STATUS1 \
											WHERE OP_SEQ = OL_SEQ \
										) > 0 THEN '1' \
										/*表示尚未派單*/ \
										ELSE '0' END \
									) AS 'W2_STATUS', \
									( \
										CASE WHEN ( \
											/*表示已有完成者*/ \
											SELECT COUNT(1) \
											FROM V_ORDER_W3_STATUS3 \
											WHERE OP_SEQ = OL_SEQ \
										) > 0 THEN '3' \
										WHEN ( \
											/*表示已有完成者，但非作業員*/ \
											SELECT COUNT(1) \
											FROM V_ORDER_W3_STATUS4 \
											WHERE OP_SEQ = OL_SEQ \
										) > 0 OR W3_OE.OE_FDATETIME IS NOT NULL THEN '4' \
										WHEN ( \
											/*表示未有完成者，但有編輯者*/ \
											SELECT COUNT(1) \
											FROM V_ORDER_W3_STATUS2 \
											WHERE OP_SEQ = OL_SEQ \
										) > 0 THEN '2' \
										WHEN ( \
											/*表示未有完成者，未有編輯者，但有負責人(已派單)*/ \
											SELECT COUNT(1) \
											FROM V_ORDER_W3_STATUS1 \
											WHERE OP_SEQ = OL_SEQ \
										) > 0 THEN '1' \
										/*表示尚未派單*/ \
										ELSE '0' END \
									) AS 'W3_STATUS', \
									( \
										CASE WHEN ( \
											/*表示已有完成者*/ \
											SELECT COUNT(1) \
											FROM V_ORDER_W1_STATUS3 \
											WHERE OP_SEQ = OL_SEQ \
										) > 0 THEN '3' \
										WHEN ( \
											/*表示已有完成者，但非作業員*/ \
											SELECT COUNT(1) \
											FROM V_ORDER_W1_STATUS4 \
											WHERE OP_SEQ = OL_SEQ \
										) > 0 OR W1_OE.OE_FDATETIME IS NOT NULL THEN '4' \
										WHEN ( \
											/*表示未有完成者，但有編輯者*/ \
											SELECT COUNT(1) \
											FROM V_ORDER_W1_STATUS2 \
											WHERE OP_SEQ = OL_SEQ \
										) > 0 THEN '2' \
										WHEN ( \
											/*表示未有完成者，未有編輯者，但有負責人(已派單)*/ \
											SELECT COUNT(1) \
											FROM V_ORDER_W1_STATUS1 \
											WHERE OP_SEQ = OL_SEQ \
										) > 0 THEN '1' \
										/*表示尚未派單*/ \
										ELSE '0' END \
									) AS 'W1_STATUS', \
									W2_OE.OE_PRINCIPAL AS 'W2_PRINCIPAL', \
									W2_OE.OE_EDATETIME AS 'W2_EDATETIME', \
									W2_OE.OE_FDATETIME AS 'W2_FDATETIME', \
									W3_OE.OE_PRINCIPAL AS 'W3_PRINCIPAL', \
									W3_OE.OE_EDATETIME AS 'W3_EDATETIME', \
									W3_OE.OE_FDATETIME AS 'W3_FDATETIME', \
									W1_OE.OE_PRINCIPAL AS 'W1_PRINCIPAL', \
									W1_OE.OE_EDATETIME AS 'W1_EDATETIME', \
									W1_OE.OE_FDATETIME AS 'W1_FDATETIME', \
									( \
										SELECT CO_NAME \
										FROM COMPY_INFO \
										WHERE OL_CO_CODE = CO_CODE \
									) AS 'CO_NAME' \
							FROM ORDER_LIST \
							/*報機單*/ \
							LEFT JOIN V_ORDER_EDITOR_BY_R W2_OE ON W2_OE.OE_SEQ = ORDER_LIST.OL_SEQ \
							/*銷艙單只有完成時間*/ \
							LEFT JOIN V_ORDER_EDITOR_BY_W W3_OE ON W3_OE.OE_SEQ = ORDER_LIST.OL_SEQ \
							/*派送單*/ \
							LEFT JOIN V_ORDER_EDITOR_BY_D W1_OE ON W1_OE.OE_SEQ = ORDER_LIST.OL_SEQ \
							WHERE OL_FDATETIME IS NULL \
							ORDER BY OL_CR_DATETIME DESC";
			break;

		case "SelectOrderPrinpl":
			_SQLCommand += "SELECT OP_SEQ, \
								   OP_DEPT, \
								   OP_TYPE, \
								   OP_PRINCIPAL, \
								   OE_EDATETIME, \
								   OE_FDATETIME \
							FROM ORDER_PRINPL \
							LEFT JOIN ORDER_EDITOR ON OE_SEQ = OP_SEQ AND OE_TYPE = OP_TYPE AND OE_PRINCIPAL = OP_PRINCIPAL \
							WHERE 1=1 ";
							
			if(pParams["OP_DEPT"] !== undefined){
				_SQLCommand += " AND OP_DEPT = @OP_DEPT";
			}
			if(pParams["OP_MULTI_SEQ"] !== undefined){
				_SQLCommand += " AND OP_SEQ IN ('" + pParams["OP_MULTI_SEQ"].replace(/,/g, "','") + "')";
			}
		
			break;

		case "WhoPrincipal":
			_SQLCommand += "SELECT CO_NAME, \
								   COD_CODE, \
								   COD_PRINCIPAL, \
								   DL_IS_LEAVE, \
								   AS_AGENT, \
								   AS_IS_LEAVE, \
								   CASE WHEN DL_IS_LEAVE = 0 THEN COD_PRINCIPAL \
								   WHEN AS_IS_LEAVE = 0 THEN AS_AGENT \
								   ELSE NULL END AS 'WHO_PRINCIPAL' \
							FROM ( \
								/*負責人是否有請假*/ \
								SELECT CO_NAME, \
									   COD_CODE, \
									   COD_PRINCIPAL, \
									   CASE WHEN DL_ID IS NOT NULL THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS 'DL_IS_LEAVE', \
									   A.AS_AGENT, \
									   A.AS_IS_LEAVE \
								FROM COMPY_DISTRIBUTION \
								LEFT JOIN DAILY_LEAVE ON DL_ID = COD_PRINCIPAL \
								LEFT JOIN COMPY_INFO ON COD_CODE = CO_CODE \
								LEFT JOIN ( \
									/*代理人是否有請假*/ \
									SELECT AS_PRINCIPAL, \
										   AS_CODE, \
										   AS_AGENT, \
										   CASE WHEN DL_ID IS NOT NULL THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS 'AS_IS_LEAVE' \
									FROM AGENT_SETTING \
									LEFT JOIN DAILY_LEAVE ON DL_ID = AS_AGENT \
									WHERE AS_DEPT = @AS_DEPT \
								) A ON COD_CODE = A.AS_CODE AND COD_PRINCIPAL = A.AS_PRINCIPAL \
								WHERE COD_DEPT = @AS_DEPT \
							) B"; 
			break;
		case "SelectCompyStatistics":
			_SQLCommand += "SELECT CO_NAME, \
								( \
									SELECT COUNT(1) \
									FROM ( \
										SELECT IL_BAGNO \
										FROM ITEM_LIST \
										JOIN ORDER_LIST ON OL_SEQ = IL_SEQ AND OL_CO_CODE = CO_CODE \
										WHERE IL_SEQ = OL_SEQ \
										AND IL_BAGNO IS NOT NULL AND IL_BAGNO != '' \
										AND '"+pParams["REAL_IMPORTDT_FROM"]+"' <= OL_REAL_IMPORTDT AND OL_REAL_IMPORTDT <= '"+pParams["REAL_IMPORTDT_TOXX"]+"' \
										GROUP BY IL_BAGNO \
									) A \
								) AS 'W2_BAG_COUNT', \
								( \
									SELECT COUNT(1) \
									FROM ITEM_LIST \
									JOIN ORDER_LIST ON OL_SEQ = IL_SEQ AND OL_CO_CODE = CO_CODE \
									/*只抓今天*/ \
									WHERE '"+pParams["REAL_IMPORTDT_FROM"]+"' <= OL_REAL_IMPORTDT AND OL_REAL_IMPORTDT <= '"+pParams["REAL_IMPORTDT_TOXX"]+"' \
								) AS 'W2_COUNT', \
								( \
									SELECT COUNT(1) \
									FROM ORDER_LIST \
									JOIN ( \
										SELECT IL_SEQ \
										FROM ITEM_LIST \
										GROUP BY IL_SEQ \
									) ITEM_LIST ON OL_SEQ = IL_SEQ AND OL_CO_CODE = CO_CODE \
									/*只抓今天*/ \
									WHERE '"+pParams["REAL_IMPORTDT_FROM"]+"' <= OL_REAL_IMPORTDT AND OL_REAL_IMPORTDT <= '"+pParams["REAL_IMPORTDT_TOXX"]+"' \
								) AS 'OL_W2_COUNT', \
								( \
									SELECT COUNT(1) \
									FROM ORDER_LIST \
									JOIN ( \
										SELECT FLL_SEQ \
										FROM FLIGHT_ITEM_LIST \
										GROUP BY FLL_SEQ \
									) ITEM_LIST ON OL_SEQ = FLL_SEQ AND OL_CO_CODE = CO_CODE \
									/*只抓今天*/ \
									WHERE '"+pParams["REAL_IMPORTDT_FROM"]+"' <= OL_REAL_IMPORTDT AND OL_REAL_IMPORTDT <= '"+pParams["REAL_IMPORTDT_TOXX"]+"' \
								) AS 'OL_W3_COUNT' \
								/*( \
									SELECT COUNT(1) \
									FROM FLIGHT_ITEM_LIST \
									JOIN ORDER_LIST ON OL_SEQ = FLL_SEQ AND OL_CO_CODE = CO_CODE \
									/*只抓今天*/ \
									WHERE '"+pParams["REAL_IMPORTDT_FROM"]+"' <= OL_REAL_IMPORTDT AND OL_REAL_IMPORTDT <= '"+pParams["REAL_IMPORTDT_TOXX"]+"' \
								) AS 'W3_COUNT', \
								( \
									SELECT COUNT(FLL_BAGNO) \
									FROM FLIGHT_ITEM_LIST \
									JOIN ORDER_LIST ON OL_SEQ = FLL_SEQ AND OL_CO_CODE = CO_CODE \
									WHERE FLL_SEQ = OL_SEQ \
									AND FLL_BAGNO IS NOT NULL AND FLL_BAGNO != '' \
									AND '"+pParams["REAL_IMPORTDT_FROM"]+"' <= OL_REAL_IMPORTDT AND OL_REAL_IMPORTDT <= '"+pParams["REAL_IMPORTDT_TOXX"]+"' \
								) AS 'W3_BAG_COUNT', \
								( \
									SELECT COUNT(1) \
									FROM Delivery_Item_List \
									JOIN ORDER_LIST ON OL_SEQ = DIL_SEQ AND OL_CO_CODE = CO_CODE \
									/*只抓今天*/ \
									WHERE '"+pParams["REAL_IMPORTDT_FROM"]+"' <= OL_REAL_IMPORTDT AND OL_REAL_IMPORTDT <= '"+pParams["REAL_IMPORTDT_TOXX"]+"' \
								) AS 'W1_COUNT', \
								( \
									SELECT COUNT(1) \
									FROM ( \
										SELECT DIL_BAGNO \
										FROM Delivery_Item_List \
										JOIN ORDER_LIST ON OL_SEQ = DIL_SEQ AND OL_CO_CODE = CO_CODE \
										WHERE DIL_SEQ = OL_SEQ \
										AND DIL_BAGNO IS NOT NULL AND DIL_BAGNO != '' \
										AND '"+pParams["REAL_IMPORTDT_FROM"]+"' <= OL_REAL_IMPORTDT AND OL_REAL_IMPORTDT <= '"+pParams["REAL_IMPORTDT_TOXX"]+"' \
										GROUP BY DIL_BAGNO \
									) A \
								) AS 'W1_BAG_COUNT'*/ \
							FROM ( \
								SELECT * \
								FROM COMPY_INFO \
								WHERE CO_STS = 0 \
							) COMPY_INFO";
			
			// delete pParams["REAL_IMPORTDT_FROM"];
			// delete pParams["REAL_IMPORTDT_TOXX"];
			break;


		case "SelectOrderListForExcel":
			_SQLCommand += "SELECT OL_SEQ, \
									OL_CO_CODE, \
									OL_MASTER, \
									OL_FLIGHTNO, \
									OL_IMPORTDT, \
									OL_REAL_IMPORTDT, \
									OL_COUNTRY, \
									OL_CR_USER, \
									( \
										CASE WHEN ( \
											/*表示已有完成者*/ \
											SELECT COUNT(1) \
											FROM V_ORDER_W2_STATUS3 \
											WHERE OP_SEQ = OL_SEQ \
										) > 0 THEN '3' \
										WHEN ( \
											/*表示已有完成者，但非作業員*/ \
											SELECT COUNT(1) \
											FROM V_ORDER_W2_STATUS4 \
											WHERE OP_SEQ = OL_SEQ \
										) > 0 OR W2_OE.OE_FDATETIME IS NOT NULL THEN '4' \
										WHEN ( \
											/*表示未有完成者，但有編輯者*/ \
											SELECT COUNT(1) \
											FROM V_ORDER_W2_STATUS2 \
											WHERE OP_SEQ = OL_SEQ \
										) > 0 THEN '2' \
										WHEN ( \
											/*表示未有完成者，未有編輯者，但有負責人(已派單)*/ \
											SELECT COUNT(1) \
											FROM V_ORDER_W2_STATUS1 \
											WHERE OP_SEQ = OL_SEQ \
										) > 0 THEN '1' \
										/*表示尚未派單*/ \
										ELSE '0' END \
									) AS 'W2_STATUS', \
									( \
										CASE WHEN ( \
											/*表示已有完成者*/ \
											SELECT COUNT(1) \
											FROM V_ORDER_W3_STATUS3 \
											WHERE OP_SEQ = OL_SEQ \
										) > 0 THEN '3' \
										WHEN ( \
											/*表示已有完成者，但非作業員*/ \
											SELECT COUNT(1) \
											FROM V_ORDER_W3_STATUS4 \
											WHERE OP_SEQ = OL_SEQ \
										) > 0 OR W3_OE.OE_FDATETIME IS NOT NULL THEN '4' \
										WHEN ( \
											/*表示未有完成者，但有編輯者*/ \
											SELECT COUNT(1) \
											FROM V_ORDER_W3_STATUS2 \
											WHERE OP_SEQ = OL_SEQ \
										) > 0 THEN '2' \
										WHEN ( \
											/*表示未有完成者，未有編輯者，但有負責人(已派單)*/ \
											SELECT COUNT(1) \
											FROM V_ORDER_W3_STATUS1 \
											WHERE OP_SEQ = OL_SEQ \
										) > 0 THEN '1' \
										/*表示尚未派單*/ \
										ELSE '0' END \
									) AS 'W3_STATUS', \
									( \
										CASE WHEN ( \
											/*表示已有完成者*/ \
											SELECT COUNT(1) \
											FROM V_ORDER_W1_STATUS3 \
											WHERE OP_SEQ = OL_SEQ \
										) > 0 THEN '3' \
										WHEN ( \
											/*表示已有完成者，但非作業員*/ \
											SELECT COUNT(1) \
											FROM V_ORDER_W1_STATUS4 \
											WHERE OP_SEQ = OL_SEQ \
										) > 0 OR W1_OE.OE_FDATETIME IS NOT NULL THEN '4' \
										WHEN ( \
											/*表示未有完成者，但有編輯者*/ \
											SELECT COUNT(1) \
											FROM V_ORDER_W1_STATUS2 \
											WHERE OP_SEQ = OL_SEQ \
										) > 0 THEN '2' \
										WHEN ( \
											/*表示未有完成者，未有編輯者，但有負責人(已派單)*/ \
											SELECT COUNT(1) \
											FROM V_ORDER_W1_STATUS1 \
											WHERE OP_SEQ = OL_SEQ \
										) > 0 THEN '1' \
										/*表示尚未派單*/ \
										ELSE '0' END \
									) AS 'W1_STATUS', \
									CONVERT(varchar, OL_IMPORTDT, 23 ) AS 'OL_IMPORTDT_EX', \
									CONVERT(varchar, OL_REAL_IMPORTDT, 23 ) AS 'OL_REAL_IMPORTDT_EX', \
									CO_NAME, \
									( \
										( \
											SELECT COUNT(1) \
											FROM ( \
												SELECT IL_BAGNO \
												FROM ITEM_LIST \
												WHERE IL_SEQ = OL_SEQ \
												AND IL_BAGNO IS NOT NULL AND IL_BAGNO != '' \
												GROUP BY IL_BAGNO \
											) A \
										) - \
										( \
											SELECT COUNT(1) \
											FROM PULL_GOODS \
											WHERE PG_SEQ = OL_SEQ \
										) \
									) AS 'OL_COUNT', \
									( \
										SELECT COUNT(1) \
										FROM PULL_GOODS \
										WHERE PG_SEQ = OL_SEQ \
									) AS 'OL_PULL_COUNT', \
									( \
										SELECT COUNT(1) \
										FROM ( \
											SELECT FLL_IL_NEWBAGNO \
											FROM FLIGHT_ITEM_LIST \
											WHERE FLL_SEQ = OL_SEQ \
										) A \
									) AS 'OL_FLL_COUNT', \
									(\
										SELECT U_NAME\
										FROM USER_INFO\
										WHERE U_ID = W2_OE.OE_PRINCIPAL\
									) AS 'W2_PRINCIPAL' \
							FROM ( \
								SELECT * \
								FROM ORDER_LIST \
								OUTTER JOIN COMPY_INFO ON CO_CODE = OL_CO_CODE \
							) ORDER_LIST \
							/*報機單*/ \
							LEFT JOIN V_ORDER_EDITOR_BY_R W2_OE ON W2_OE.OE_SEQ = ORDER_LIST.OL_SEQ \
							/*銷艙單只有完成時間*/ \
							LEFT JOIN V_ORDER_EDITOR_BY_W W3_OE ON W3_OE.OE_SEQ = ORDER_LIST.OL_SEQ \
							/*派送單*/ \
							LEFT JOIN V_ORDER_EDITOR_BY_D W1_OE ON W1_OE.OE_SEQ = ORDER_LIST.OL_SEQ \
							WHERE OL_FDATETIME IS NULL \
							ORDER BY OL_CR_DATETIME DESC";
			break;

		// case "SelectParm":
		// 	_SQLCommand = "SELECT SPA_AUTOPRIN \
		// 				   FROM SYS_PARM";
		// 	break;

		case "SelectOrderSupplement":
			_SQLCommand += "SELECT * \
							FROM ORDER_LIST_SUPPLEMENT \
							WHERE 1=1 ";
							
			if(pParams["OLS_SEQ"] !== undefined){
				_SQLCommand += " AND OLS_SEQ = @OLS_SEQ";
			}
		
			break;
	}

	return _SQLCommand;
};