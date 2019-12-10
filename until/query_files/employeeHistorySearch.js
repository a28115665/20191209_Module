module.exports = function(pQueryname, pParams){
	var _SQLCommand = "";

	switch(pQueryname){
		case "SelectSearch":
			_SQLCommand += "SELECT TOP 1000 OL_SEQ, \
									OL_CO_CODE, \
									OL_MASTER, \
									OL_FLIGHTNO, \
									OL_IMPORTDT, \
									OL_COUNTRY, \
									OL_REASON, \
									OL_CR_USER, \
									OL_CR_DATETIME, \
									OL_REAL_IMPORTDT, \
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
									CONVERT(varchar, OL_IMPORTDT, 23 ) AS 'OL_IMPORTDT_EX', \
									CONVERT(varchar, OL_REAL_IMPORTDT, 23 ) AS 'OL_REAL_IMPORTDT_EX', \
									CO_NAME \
							FROM ( \
								SELECT * \
								FROM ORDER_LIST \
								/*行家中文名稱*/ \
								OUTTER JOIN COMPY_INFO ON CO_CODE = OL_CO_CODE \
							) ORDER_LIST \
							LEFT JOIN ITEM_LIST ON IL_SEQ = OL_SEQ \
							/*報機單*/ \
							LEFT JOIN V_ORDER_EDITOR_BY_R W2_OE ON W2_OE.OE_SEQ = ORDER_LIST.OL_SEQ \
							/*銷艙單只有完成時間*/ \
							LEFT JOIN V_ORDER_EDITOR_BY_W W3_OE ON W3_OE.OE_SEQ = ORDER_LIST.OL_SEQ \
							/*派送單*/ \
							LEFT JOIN V_ORDER_EDITOR_BY_D W1_OE ON W1_OE.OE_SEQ = ORDER_LIST.OL_SEQ \
							WHERE 1=1 ";
						
			if(pParams["CRDT_FROM"] !== undefined){
				_SQLCommand += " AND OL_CR_DATETIME >= '" + pParams["CRDT_FROM"] + "'";
				delete pParams["CRDT_FROM"];
			}
			if(pParams["CRDT_TOXX"] !== undefined){
				_SQLCommand += " AND OL_CR_DATETIME <= '" + pParams["CRDT_TOXX"] + "'";
				delete pParams["CRDT_TOXX"];
			}						
			if(pParams["IMPORTDT_FROM"] !== undefined){
				_SQLCommand += " AND OL_IMPORTDT >= '" + pParams["IMPORTDT_FROM"] + "'";
				delete pParams["IMPORTDT_FROM"];
			}
			if(pParams["IMPORTDT_TOXX"] !== undefined){
				_SQLCommand += " AND OL_IMPORTDT <= '" + pParams["IMPORTDT_TOXX"] + "'";
				delete pParams["IMPORTDT_TOXX"];
			}
			if(pParams["CO_CODE"] !== undefined){
				pParams["OL_CO_CODE"] = pParams["CO_CODE"];
				_SQLCommand += " AND OL_CO_CODE = @OL_CO_CODE";
				delete pParams["CO_CODE"];
			}
			if(pParams["FLIGHTNO_START"] !== undefined && pParams["FLIGHTNO_END"] !== undefined){
				pParams["OL_FLIGHTNO"] = pParams["FLIGHTNO_START"] + ' ' + pParams["FLIGHTNO_END"];
				_SQLCommand += " AND OL_FLIGHTNO = @OL_FLIGHTNO";
				delete pParams["FLIGHTNO_START"];
				delete pParams["FLIGHTNO_END"];
			}
			if(pParams["MASTER_START"] !== undefined && pParams["MASTER_END"] !== undefined){
				pParams["OL_MASTER"] = pParams["MASTER_START"] + '-' + pParams["MASTER_END"];
				_SQLCommand += " AND OL_MASTER = @OL_MASTER";
				delete pParams["MASTER_START"];
				delete pParams["MASTER_END"];
			}
			if(pParams["COUNTRY"] !== undefined){
				pParams["OL_COUNTRY"] = pParams["COUNTRY"];
				_SQLCommand += " AND OL_COUNTRY = @OL_COUNTRY";
				delete pParams["COUNTRY"];
			}
			if(pParams["FINISH"] !== undefined){
				if(pParams["FINISH"]){
					_SQLCommand += " AND OL_FDATETIME IS NOT NULL";
				}else{
					_SQLCommand += " AND OL_FDATETIME IS NULL";
				}
				delete pParams["FINISH"];
			}

			if(pParams["BAGNO"] !== undefined && pParams["BAGNO_VIP"] == undefined){
				_SQLCommand += " AND IL_BAGNO LIKE '" + pParams["BAGNO"] + "%'";
				delete pParams["BAGNO"];
				delete pParams["BAGNO_VIP"];
			}
			if(pParams["BAGNO"] !== undefined && pParams["BAGNO_VIP"] !== undefined){
				_SQLCommand += " AND IL_BAGNO = '" + pParams["BAGNO"] + "-" + pParams["BAGNO_VIP"] + "'";
				delete pParams["BAGNO"];
				delete pParams["BAGNO_VIP"];
			}
			if(pParams["BAGNO_LAST5"] !== undefined){
				_SQLCommand += " AND IL_BAGNO LIKE '%" + pParams["BAGNO_LAST5"] + "'";
				delete pParams["BAGNO_LAST5"];
			}
			if(pParams["BAGNO_RANGE3"] !== undefined && pParams["BAGNO_RANGE5_START"] !== undefined && pParams["BAGNO_RANGE5_END"] !== undefined){
				var _bagnoStart = pParams["BAGNO_RANGE3"] + pParams["BAGNO_RANGE5_START"],
					_bagnoEnd = pParams["BAGNO_RANGE3"] + pParams["BAGNO_RANGE5_END"];
				console.log(_bagnoStart, _bagnoEnd);
				_SQLCommand += " AND IL_BAGNO BETWEEN '" + _bagnoStart + "' AND '" + _bagnoEnd + "'";
				
				delete pParams["BAGNO_RANGE3"];
				delete pParams["BAGNO_RANGE5_START"];
				delete pParams["BAGNO_RANGE5_END"];
			}
			if(pParams["SMALLNO"] !== undefined){
				pParams["IL_SMALLNO"] = '%'+pParams["SMALLNO"]+'%';
				_SQLCommand += " AND IL_SMALLNO LIKE @IL_SMALLNO";
				delete pParams["SMALLNO"];
				
			}
			if(pParams["GETNAME"] !== undefined){
				pParams["IL_GETNAME"] = '%'+pParams["GETNAME"]+'%';
				_SQLCommand += " AND IL_GETNAME LIKE @IL_GETNAME";
				delete pParams["GETNAME"];
				
			}
			if(pParams["GETADDRESS"] !== undefined){
				pParams["IL_GETADDRESS"] = '%'+pParams["GETADDRESS"]+'%';
				_SQLCommand += " AND IL_GETADDRESS LIKE @IL_GETADDRESS";
				delete pParams["GETADDRESS"];
				
			}
			if(pParams["GETTEL"] !== undefined){
				pParams["IL_GETTEL"] = pParams["GETTEL"];
				_SQLCommand += " AND IL_GETTEL = @IL_GETTEL";
				delete pParams["GETTEL"];
			}
			if(pParams["NATURE"] !== undefined){
				pParams["IL_NATURE"] = '%'+pParams["NATURE"]+'%';
				_SQLCommand += " AND IL_NATURE LIKE @IL_NATURE";
				delete pParams["NATURE"];
			}

			_SQLCommand += " GROUP BY OL_SEQ, \
									 OL_CO_CODE, \
									 OL_MASTER, \
									 OL_FLIGHTNO, \
									 OL_IMPORTDT, \
									 OL_COUNTRY, \
									 OL_REASON, \
									 OL_CR_USER, \
									 OL_CR_DATETIME, \
									 OL_REAL_IMPORTDT, \
									 W2_OE.OE_PRINCIPAL, \
									 W2_OE.OE_EDATETIME, \
									 W2_OE.OE_FDATETIME, \
									 W3_OE.OE_PRINCIPAL, \
									 W3_OE.OE_EDATETIME, \
									 W3_OE.OE_FDATETIME, \
									 W1_OE.OE_PRINCIPAL, \
									 W1_OE.OE_EDATETIME, \
									 W1_OE.OE_FDATETIME, \
									 CO_NAME \
							ORDER BY OL_REAL_IMPORTDT DESC ";
			break;
	}

	return _SQLCommand;
};