module.exports = function(pQueryname, pParams){
	var _SQLCommand = "";

	switch(pQueryname){
		case "SelectPullGoods":
			_SQLCommand += "SELECT TOP 1000 OL_CO_CODE, \
								   OL_MASTER, \
								   OL_FLIGHTNO, \
								   OL_IMPORTDT, \
								   OL_CR_DATETIME, \
								   OL_COUNTRY, \
								   PG_SEQ, \
								   PG_BAGNO, \
								   PG_MOVED, \
								   PG_MOVED_SEQ, \
								   PG_MASTER, \
								   PG_FLIGHTNO, \
								   PG_REASON, \
								   PG_MOVE_USER, \
								   PG_MOVE_DATETIME, \
								   CONVERT(varchar, OL_IMPORTDT, 23 ) AS 'OL_IMPORTDT_EX', \
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
									W2_OE.OE_PRINCIPAL AS 'W2_PRINCIPAL', \
									CAST(0 AS BIT) AS isSelected, \
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
							FROM ( \
								SELECT * \
								FROM ORDER_LIST \
								OUTTER JOIN COMPY_INFO ON CO_CODE = OL_CO_CODE \
							) ORDER_LIST \
							JOIN PULL_GOODS ON \
							PG_SEQ = OL_SEQ \
							/*報機單*/ \
							LEFT JOIN V_ORDER_EDITOR_BY_R W2_OE ON W2_OE.OE_SEQ = ORDER_LIST.OL_SEQ \
						    WHERE 1=1";
							
			if(pParams["Seq"] !== undefined){
				_SQLCommand += " AND PG_SEQ IN ("+pParams["Seq"]+") ";
				delete pParams["Seq"];
			}
							
			if(pParams["Bagno"] !== undefined){
				_SQLCommand += " AND PG_BAGNO IN ("+pParams["Bagno"]+") ";
				delete pParams["Bagno"];
			}

			_SQLCommand += " ORDER BY PG_CR_DATETIME DESC ";

			break;

		case "SelectOrderList":
			_SQLCommand += "SELECT OL_SEQ, \
									OL_CO_CODE, \
									OL_MASTER, \
									OL_FLIGHTNO, \
									OL_IMPORTDT, \
									OL_COUNTRY, \
									OL_CR_USER, \
									OL_CR_DATETIME, \
									OL_TEL, \
									OL_FAX, \
									OL_REASON, \
									( \
										SELECT COUNT(1) \
										FROM ( \
											SELECT FLL_BAGNO \
											FROM FLIGHT_ITEM_LIST \
											WHERE FLL_SEQ = OL_SEQ \
											AND FLL_BAGNO IS NOT NULL AND FLL_BAGNO != '' \
										) A \
									) AS 'OL_FLL_COUNT', \
									( \
										SELECT SUM(FLL_CTN) \
										FROM FLIGHT_ITEM_LIST \
										WHERE FLL_SEQ = OL_SEQ \
										AND FLL_BAGNO IS NOT NULL AND FLL_BAGNO != '' \
									) AS 'OL_FLL_CTN_COUNT', \
									( \
										SELECT COUNT(1) \
										FROM FLIGHT_MAIL_LOGS \
										WHERE FML_SEQ = OL_SEQ \
									) AS 'MAIL_COUNT', \
									W2_OE.OE_PRINCIPAL AS 'W2_PRINCIPAL', \
									W2_OE.OE_EDATETIME AS 'W2_EDATETIME', \
									W2_OE.OE_FDATETIME AS 'W2_FDATETIME', \
									W3_OE.OE_PRINCIPAL AS 'W3_PRINCIPAL', \
									W3_OE.OE_EDATETIME AS 'W3_EDATETIME', \
									W3_OE.OE_FDATETIME AS 'W3_FDATETIME', \
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
									W1_OE.OE_PRINCIPAL AS 'W1_PRINCIPAL', \
									W1_OE.OE_EDATETIME AS 'W1_EDATETIME', \
									W1_OE.OE_FDATETIME AS 'W1_FDATETIME', \
									( \
										SELECT CO_NAME \
										FROM COMPY_INFO \
										WHERE OL_CO_CODE = CO_CODE \
									) AS 'CO_NAME', \
									FA_SCHEDL_ARRIVALTIME, \
									FA_ACTL_DEPARTTIME, \
									FA_ACTL_ARRIVALTIME, \
									FA_ARRIVAL_REMK \
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
									SELECT FLL_BAGNO \
									FROM FLIGHT_ITEM_LIST \
									WHERE FLL_SEQ = OL_SEQ \
									AND FLL_BAGNO IS NOT NULL AND FLL_BAGNO != '' \
									GROUP BY FLL_BAGNO \
								) A ) > 0 \
							 ORDER BY CASE WHEN FA_SCHEDL_ARRIVALTIME IS NULL THEN 1 ELSE 0 END, FA_SCHEDL_ARRIVALTIME, OL_FLIGHTNO ";

			break;

		case "SelectMasterToBeFilled":
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
										SELECT COUNT(1) \
										FROM ( \
											SELECT IL_BAGNO \
											FROM ITEM_LIST \
											WHERE IL_SEQ = OL_SEQ \
											AND IL_BAGNO IS NOT NULL AND IL_BAGNO != '' \
											GROUP BY IL_BAGNO \
										) A \
									) AS 'OL_COUNT', \
									ISNULL(( \
										SELECT COUNT \
										FROM V_PULL_GOODS_GROUP_BY_SEQ \
										WHERE PG_SEQ = OL_SEQ \
									), 0) AS 'OL_PULL_COUNT', \
									( \
										SELECT CO_NAME \
										FROM COMPY_INFO \
										WHERE OL_CO_CODE = CO_CODE \
									) AS 'CO_NAME' \
							FROM ORDER_LIST ";
							
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
							 AND (OL_MASTER = '' OR OL_MASTER IS NULL) ";

			break;

		case "SelectFlightArrival":
			_SQLCommand += "SELECT * \
							FROM FLIGHT_ARRIVAL \
						    WHERE 1=1";

			if(pParams["FA_FLIGHTDATE"] !== undefined){
				_SQLCommand += " AND FA_FLIGHTDATE = @FA_FLIGHTDATE ";
			}

			_SQLCommand += " ORDER BY FA_SCHEDL_ARRIVALTIME ";
			
			break;

		case "SelectBagNoDetail":
			_SQLCommand += "SELECT * \
							FROM ITEM_LIST \
						    WHERE 1=1";

			if(pParams["IL_SEQ"] !== undefined){
				_SQLCommand += " AND IL_SEQ = @IL_SEQ ";
			}

			if(pParams["IL_BAGNO"] !== undefined){
				_SQLCommand += " AND IL_BAGNO = @IL_BAGNO ";
			}

			_SQLCommand += " ORDER BY IL_BAGNO ";

			break;

		case "CopyItemList":
			_SQLCommand += "SELECT @IL_SEQ AS IL_SEQ, \
									IL_G1, \
									IL_NEWBAGNO, \
									IL_NEWSMALLNO, \
									IL_BAGNO, \
									IL_MERGENO, \
									IL_SMALLNO, \
									IL_NATURE, \
									IL_NATURE_NEW, \
									IL_CTN, \
									IL_PLACE, \
									IL_NEWPLACE, \
									IL_WEIGHT, \
									IL_WEIGHT_NEW, \
									IL_PCS, \
									IL_NEWPCS, \
									IL_UNIT, \
									IL_NEWUNIT, \
									IL_GETNO, \
									IL_SENDNAME, \
									IL_NEWSENDNAME, \
									IL_GETNAME, \
									IL_GETADDRESS, \
									IL_GETTEL, \
									IL_UNIVALENT, \
									IL_UNIVALENT_NEW, \
									IL_FINALCOST, \
									IL_TAX, \
									IL_TRCOM, \
									IL_CR_DATETIME, \
									IL_CR_USER, \
									IL_UP_DATETIME, \
									IL_UP_USER, \
									IL_ORDERINDEX, \
									IL_RANDOMTYPE, \
									IL_RANDOMNATURE, \
									IL_REMARK, \
									IL_EXTEL, \
									IL_EXNO, \
									IL_TAX2, \
									IL_GETNAME_NEW, \
									IL_GETADDRESS_NEW, \
									IL_HASUNIVALENT, \
									IL_SUPPLEMENT_COUNT, \
									IL_TAXRATE \
							FROM ITEM_LIST \
						    WHERE 1=1";

			if(pParams["SeqAndBagno"] !== undefined){

				var _sql = [];

				for(var i in pParams["SeqAndBagno"]){
					_sql.push("(  IL_SEQ='" + pParams["SeqAndBagno"][i].SEQ + "' AND IL_BAGNO='" + pParams["SeqAndBagno"][i].BAGNO + "')");
				}

				_SQLCommand += " AND (" + _sql.join(" OR ") +") ";
			}

			break;

		case "CopySpecialGoods":
			_SQLCommand += "SELECT @SPG_SEQ AS SPG_SEQ, \
									SPG_NEWBAGNO, \
									SPG_NEWSMALLNO, \
									SPG_ORDERINDEX, \
									SPG_TYPE, \
									SPG_CR_USER, \
									SPG_CR_DATETIME, \
									SPG_UP_USER, \
									SPG_UP_DATETIME \
							FROM SPECIAL_GOODS \
							INNER JOIN ITEM_LIST ON \
							IL_SEQ = SPG_SEQ AND \
							IL_NEWBAGNO = SPG_NEWBAGNO AND \
							IL_NEWSMALLNO = SPG_NEWSMALLNO AND \
							IL_ORDERINDEX = SPG_ORDERINDEX \
						    WHERE 1=1";

			if(pParams["SeqAndBagno"] !== undefined){

				var _sql = [];

				for(var i in pParams["SeqAndBagno"]){
					_sql.push("(  SPG_SEQ='" + pParams["SeqAndBagno"][i].SEQ + "' AND IL_BAGNO='" + pParams["SeqAndBagno"][i].BAGNO + "')");
				}

				_SQLCommand += " AND (" + _sql.join(" OR ") +") ";
			}

			break;
	}

	return _SQLCommand;
};