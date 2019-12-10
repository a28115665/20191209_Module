module.exports = function(pQueryname, pParams){
	var _SQLCommand = "";

	switch(pQueryname){
		case "SelectSearch":
			_SQLCommand += "SELECT OL_SEQ, \
									OL_CO_CODE, \
									OL_MASTER, \
									OL_FLIGHTNO, \
									OL_IMPORTDT, \
									OL_COUNTRY, \
									OL_REASON, \
									OL_CR_USER, \
									OL_CR_DATETIME, \
									W2_OE.OE_PRINCIPAL AS 'W2_PRINCIPAL', \
									W2_OE.OE_EDATETIME AS 'W2_EDATETIME', \
									W2_OE.OE_FDATETIME AS 'W2_FDATETIME', \
									W3_OE.OE_PRINCIPAL AS 'W3_PRINCIPAL', \
									W3_OE.OE_EDATETIME AS 'W3_EDATETIME', \
									W3_OE.OE_FDATETIME AS 'W3_FDATETIME', \
									W1_OE.OE_PRINCIPAL AS 'W1_PRINCIPAL', \
									W1_OE.OE_EDATETIME AS 'W1_EDATETIME', \
									W1_OE.OE_FDATETIME AS 'W1_FDATETIME', \
									CONVERT(varchar, OL_IMPORTDT, 23 ) AS 'OL_IMPORTDT_EX', \
									CO_NAME \
							FROM ( \
								SELECT * \
								FROM ORDER_LIST \
								/*行家中文名稱*/ \
								OUTTER JOIN COMPY_INFO ON CO_CODE = OL_CO_CODE \
							) ORDER_LIST \
							LEFT JOIN Delivery_Item_List ON DIL_SEQ = OL_SEQ \
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

			_SQLCommand += " GROUP BY OL_SEQ, \
									 OL_CO_CODE, \
									 OL_MASTER, \
									 OL_FLIGHTNO, \
									 OL_IMPORTDT, \
									 OL_COUNTRY, \
									 OL_REASON, \
									 OL_CR_USER, \
									 OL_CR_DATETIME, \
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
							ORDER BY OL_CR_DATETIME DESC ";
			break;
	}

	return _SQLCommand;
};