module.exports = function(pQueryname, pParams){
	var _SQLCommand = "";

	switch(pQueryname){
		case "SelectOrderList":	
			_SQLCommand += "SELECT OL_SEQ, \
									OL_CO_CODE, \
									OL_MASTER, \
									OL_FLIGHTNO, \
									OL_IMPORTDT, \
									OL_COUNTRY, \
									OL_REASON, \
									OL_CR_USER, \
									OL_CR_DATETIME, \
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
									) AS 'OL_COUNT',  \
									ISNULL(( \
										SELECT COUNT \
										FROM V_PULL_GOODS_GROUP_BY_SEQ \
										WHERE PG_SEQ = OL_SEQ \
									), 0) AS 'OL_PULL_COUNT', \
									( \
										SELECT MAX(MAX_SUPPLEMENT_COUNT)  \
										FROM V_MAX_SUPPLEMENT_COUNT \
										WHERE IL_SEQ = OL_SEQ \
									) AS 'OL_SUPPLEMENT_COUNT', \
									W2_OE.OE_PRINCIPAL AS 'W2_PRINCIPAL', \
									W2_OE.OE_EDATETIME AS 'W2_EDATETIME', \
									W2_OE.OE_FDATETIME AS 'W2_FDATETIME', \
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
									) AS 'CO_NAME', \
									FA_SCHEDL_ARRIVALTIME, \
									FA_ACTL_ARRIVALTIME, \
									FA_ARRIVAL_REMK, \
									( \
										SELECT COUNT(ILE_ID) \
										FROM ITEM_LIST_EXPORTER \
										WHERE ILE_SEQ = OL_SEQ \
										AND ILE_TYPE = '11' \
									) AS 'FLIGHT_EXPORT', \
									( \
										SELECT COUNT(ILE_ID) \
										FROM ITEM_LIST_EXPORTER \
										WHERE ILE_SEQ = OL_SEQ \
										AND ILE_TYPE != '11' \
									) AS 'TRADE_EXPORT' \
									/*( \
										SELECT OL_IMPORTDT \
										FROM ( \
											SELECT PG_SEQ, PG_MOVED_SEQ \
											FROM PULL_GOODS \
											WHERE PG_MOVED_SEQ = OL_SEQ \
											GROUP BY PG_SEQ, PG_MOVED_SEQ \
										) A \
										LEFT JOIN ORDER_LIST ON OL_SEQ = PG_SEQ \
									) AS 'ORI_OL_IMPORTDT'*/ \
							FROM ORDER_LIST \
							/*報機單*/ \
							LEFT JOIN V_ORDER_EDITOR_BY_R W2_OE ON W2_OE.OE_SEQ = ORDER_LIST.OL_SEQ \
							/*銷艙單只有完成時間*/ \
							LEFT JOIN V_ORDER_EDITOR_BY_W W3_OE ON W3_OE.OE_SEQ = ORDER_LIST.OL_SEQ \
							/*派送單*/ \
							LEFT JOIN V_ORDER_EDITOR_BY_D W1_OE ON W1_OE.OE_SEQ = ORDER_LIST.OL_SEQ \
							/*航班資訊*/ \
							LEFT JOIN FLIGHT_ARRIVAL ON FA_AIR_LINEID + ' ' + REPLICATE('0',4-LEN(FA_FLIGHTNUM)) + RTRIM(CAST(FA_FLIGHTNUM AS CHAR)) = ORDER_LIST.OL_FLIGHTNO AND FA_FLIGHTDATE = ORDER_LIST.OL_IMPORTDT ";
							
			if(pParams["U_ID"] !== undefined && pParams["U_GRADE"] !== undefined){

				// 早中晚班員工的Grade
				var _OpGrade = 11;

				// Grade等於11表示員工 則需要組SQL
				if(pParams["U_GRADE"] == 11){
					_SQLCommand += "/*負責人(owner)*/ \
									JOIN ( \
										SELECT * \
										FROM ORDER_PRINPL \
										WHERE OP_PRINCIPAL = @U_ID \
									) ORDER_PRINPL ON OP_SEQ = ORDER_LIST.OL_SEQ ";
				}
			}

			_SQLCommand += " WHERE OL_FDATETIME IS NULL \
							 AND ( SELECT COUNT(1) \
								FROM ( \
									SELECT IL_BAGNO \
									FROM ITEM_LIST \
									WHERE IL_SEQ = OL_SEQ \
									AND IL_BAGNO IS NOT NULL AND IL_BAGNO != '' \
									GROUP BY IL_BAGNO \
								) A ) > 0 \
							 ORDER BY CASE WHEN FA_SCHEDL_ARRIVALTIME IS NULL THEN 1 ELSE 0 END, FA_SCHEDL_ARRIVALTIME, OL_FLIGHTNO ";
		
			break;
		case "SelectOrderEditor":
			_SQLCommand += "SELECT * \
							FROM ORDER_EDITOR \
							WHERE 1=1 ";

			if(pParams["OE_SEQ"] !== undefined){
				_SQLCommand += " AND OE_SEQ = @OE_SEQ ";
			}
			if(pParams["OE_TYPE"] !== undefined){
				_SQLCommand += " AND OE_TYPE = @OE_TYPE ";
			}

			break;
		case "SelectExportDetail":
			_SQLCommand += "SELECT  ( \
										SELECT SC_DESC \
										FROM SYS_CODE \
										WHERE SC_CODE = ILE_TYPE \
										AND SC_TYPE = 'excelType' \
									) AS ILE_TYPE, \
									ILE_CR_USER, \
									ILE_CR_DATETIME \
							FROM ITEM_LIST_EXPORTER \
							WHERE 1=1 ";

			if(pParams["ILE_SEQ"] !== undefined){
				_SQLCommand += " AND ILE_SEQ = @ILE_SEQ ";
			}
			
			_SQLCommand += " ORDER BY ILE_CR_DATETIME DESC";

			break;
	}

	return _SQLCommand;
};