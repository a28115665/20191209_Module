module.exports = function(pQueryname, pParams){
	var _SQLCommand = "";

	switch(pQueryname){
		case "SelectCaseACount":
			_SQLCommand += "SELECT COUNT(1) AS COUNT \
							FROM ( "+ CaseA(pParams) + " ) A \
							WHERE 1 = 1 ";
			break;
		case "SelectCaseBCount":
			_SQLCommand += "SELECT COUNT(1) AS COUNT \
							FROM ( "+ CaseB(pParams) + " ) B \
							WHERE 1 = 1 ";
			break;
		case "SelectCaseCCount":
			_SQLCommand += "SELECT COUNT(1) AS COUNT \
							FROM ( "+ CaseC(pParams) + " ) C \
							WHERE 1 = 1 ";
			break;
		case "SelectCaseDCount":
			_SQLCommand += "SELECT COUNT(1) AS COUNT \
							FROM ( "+ CaseD(pParams) + " ) D \
							WHERE 1 = 1 ";
			break;
		case "SelectCaseA":
			_SQLCommand += "SELECT \
									( \
										SELECT COUNT(1) \
										FROM ( \
											SELECT IL_GETNAME, \
												   IL_GETADDRESS, \
												   IL_GETTEL \
											FROM ITEM_LIST \
											LEFT JOIN ORDER_LIST ON OL_SEQ = IL_SEQ \
											/*不包含此筆資料*/ \
											WHERE IL_SEQ != OUT_IL.IL_SEQ \
											OR IL_NEWBAGNO != OUT_IL.IL_NEWBAGNO \
											OR IL_NEWSMALLNO != OUT_IL.IL_NEWSMALLNO \
											OR IL_ORDERINDEX != OUT_IL.IL_ORDERINDEX \
										) IN_IL \
										WHERE IN_IL.IL_GETNAME = OUT_IL.IL_GETNAME AND IN_IL.IL_GETADDRESS = OUT_IL.IL_GETADDRESS \
									) AS 'IL_COUNT', \
									OUT_IL.*, \
						   			CO_NAME \
							FROM ( " + CaseA(pParams) + " ) OUT_IL \
							/*行家中文名稱*/ \
							LEFT JOIN COMPY_INFO ON CO_CODE = OUT_IL.OL_CO_CODE \
							ORDER BY OUT_IL.IL_GETNAME DESC ";
			break;
		case "SelectCaseB":
			_SQLCommand += "SELECT \
									( \
										SELECT COUNT(1) \
										FROM ( \
											SELECT IL_GETNAME, \
												   IL_GETADDRESS, \
												   IL_GETTEL \
											FROM ITEM_LIST \
											LEFT JOIN ORDER_LIST ON OL_SEQ = IL_SEQ \
											/*不包含此筆資料*/ \
											WHERE IL_SEQ != OUT_IL.IL_SEQ \
											OR IL_NEWBAGNO != OUT_IL.IL_NEWBAGNO \
											OR IL_NEWSMALLNO != OUT_IL.IL_NEWSMALLNO \
											OR IL_ORDERINDEX != OUT_IL.IL_ORDERINDEX \
										) IN_IL \
										WHERE IN_IL.IL_GETADDRESS = OUT_IL.IL_GETADDRESS AND IN_IL.IL_GETTEL = OUT_IL.IL_GETTEL \
									) AS 'IL_COUNT', \
									OUT_IL.*, \
						   			CO_NAME \
							FROM ( " + CaseB(pParams) + " ) OUT_IL \
							/*行家中文名稱*/ \
							LEFT JOIN COMPY_INFO ON CO_CODE = OUT_IL.OL_CO_CODE \
							ORDER BY OUT_IL.IL_GETNAME DESC ";
			console.log(_SQLCommand);
			break;
		case "SelectCaseC":
			_SQLCommand += "SELECT \
									( \
										SELECT COUNT(1) \
										FROM  ( \
											SELECT IL_GETNAME, \
												   IL_GETADDRESS, \
												   IL_GETTEL \
											FROM ITEM_LIST \
											LEFT JOIN ORDER_LIST ON OL_SEQ = IL_SEQ \
											/*不包含此筆資料*/ \
											WHERE IL_SEQ != OUT_IL.IL_SEQ \
											OR IL_NEWBAGNO != OUT_IL.IL_NEWBAGNO \
											OR IL_NEWSMALLNO != OUT_IL.IL_NEWSMALLNO \
											OR IL_ORDERINDEX != OUT_IL.IL_ORDERINDEX \
										) IN_IL \
										WHERE IN_IL.IL_GETNAME = OUT_IL.IL_GETNAME AND IN_IL.IL_GETTEL = OUT_IL.IL_GETTEL \
									) AS 'IL_COUNT', \
									OUT_IL.*, \
						   			CO_NAME \
							FROM ( " + CaseC(pParams) + " ) OUT_IL \
							/*行家中文名稱*/ \
							LEFT JOIN COMPY_INFO ON CO_CODE = OUT_IL.OL_CO_CODE \
							ORDER BY OUT_IL.IL_GETNAME DESC ";
			break;
		case "SelectCaseD":
			_SQLCommand += "SELECT \
									( \
										SELECT COUNT(1) \
										FROM  ( \
											SELECT IL_GETNAME, \
												   IL_GETADDRESS, \
												   IL_GETTEL \
											FROM ITEM_LIST \
											LEFT JOIN ORDER_LIST ON OL_SEQ = IL_SEQ \
											/*不包含此筆資料*/ \
											WHERE IL_SEQ != OUT_IL.IL_SEQ \
											OR IL_NEWBAGNO != OUT_IL.IL_NEWBAGNO \
											OR IL_NEWSMALLNO != OUT_IL.IL_NEWSMALLNO \
											OR IL_ORDERINDEX != OUT_IL.IL_ORDERINDEX \
										) IN_IL \
										WHERE IN_IL.IL_GETNAME = OUT_IL.IL_GETNAME AND IN_IL.IL_GETADDRESS = OUT_IL.IL_GETADDRESS AND IN_IL.IL_GETTEL = OUT_IL.IL_GETTEL \
									) AS 'IL_COUNT', \
									OUT_IL.*, \
						   			CO_NAME \
							FROM ( " + CaseD(pParams) + " ) OUT_IL \
							/*行家中文名稱*/ \
							LEFT JOIN COMPY_INFO ON CO_CODE = OUT_IL.OL_CO_CODE \
							ORDER BY OUT_IL.IL_GETNAME DESC ";
			break;
		case "SelectItemList":
			_SQLCommand += "SELECT * \
							FROM ( \
								SELECT * \
								FROM ITEM_LIST \
								LEFT JOIN ORDER_LIST ON OL_SEQ = IL_SEQ \
								/*不包含此筆資料*/ \
								WHERE IL_SEQ != @IL_SEQ \
								OR IL_NEWBAGNO != @IL_NEWBAGNO \
								OR IL_NEWSMALLNO != @IL_NEWSMALLNO \
								OR IL_ORDERINDEX != @IL_ORDERINDEX \
							) IN_IL \
							WHERE 1=1 ";
							
			if(pParams["IL_GETADDRESS"] !== undefined){
				_SQLCommand += " AND IL_GETADDRESS = @IL_GETADDRESS";
			}
			if(pParams["IL_GETTEL"] !== undefined){
				_SQLCommand += " AND IL_GETTEL = @IL_GETTEL";
			}
			if(pParams["IL_GETNAME"] !== undefined){
				_SQLCommand += " AND IL_GETNAME = @IL_GETNAME";
			}

			_SQLCommand += " ORDER BY IL_GETNAME DESC ";

			break;
			
	}

	return _SQLCommand;
};

/**
 * 組合A
 * 收件人或公司
 * 收件人地址
 */
function CaseA(pParams){
	return "SELECT '通報' AS BAN_TYPE, \
						   IL.* \
					FROM V_BLFO_JOIN_IL \
					JOIN ( \
						SELECT *, \
						   	   CONVERT(varchar, OL_IMPORTDT, 23 ) AS 'OL_IMPORTDT_EX' \
						FROM ITEM_LIST \
						LEFT JOIN ORDER_LIST ON OL_SEQ = IL_SEQ \
						/*條件*/ \
						WHERE 1=1 "+Conditions(pParams, false)+" \
					) IL ON \
					IL.IL_GETNAME = V_BLFO_JOIN_IL.IL_GETNAME AND \
					IL.IL_GETADDRESS = V_BLFO_JOIN_IL.IL_GETADDRESS \
					\
					UNION ALL \
					\
					SELECT '自訂' AS BAN_TYPE, \
						   IL.* \
					FROM BLACK_LIST_FROM_LEADER BLFL \
					JOIN ( \
						SELECT *, \
						   	   CONVERT(varchar, OL_IMPORTDT, 23 ) AS 'OL_IMPORTDT_EX' \
						FROM ITEM_LIST \
						LEFT JOIN ORDER_LIST ON OL_SEQ = IL_SEQ \
						/*條件*/ \
						WHERE 1=1 "+Conditions(pParams, true)+" \
					) IL ON \
					IL.IL_GETNAME = BLFL.BLFL_GETNAME AND \
					IL.IL_GETADDRESS = BLFL.BLFL_GETADDRESS \
					WHERE BLFL.BLFL_TRACK = 1 ";
}

/**
 * 組合B
 * 收件人地址
 * 收件人電話
 */
function CaseB(pParams){
	return "SELECT '通報' AS BAN_TYPE, \
						   IL.* \
					FROM V_BLFO_JOIN_IL \
					JOIN ( \
						SELECT *, \
						   	   CONVERT(varchar, OL_IMPORTDT, 23 ) AS 'OL_IMPORTDT_EX' \
						FROM ITEM_LIST \
						LEFT JOIN ORDER_LIST ON OL_SEQ = IL_SEQ \
						/*條件*/ \
						WHERE 1=1 "+Conditions(pParams, false)+" \
					) IL ON \
					IL.IL_GETADDRESS = V_BLFO_JOIN_IL.IL_GETADDRESS AND \
					IL.IL_GETTEL = V_BLFO_JOIN_IL.IL_GETTEL \
					\
					UNION ALL \
					\
					SELECT '自訂' AS BAN_TYPE, \
						   IL.* \
					FROM BLACK_LIST_FROM_LEADER BLFL \
					JOIN ( \
						SELECT *, \
						   	   CONVERT(varchar, OL_IMPORTDT, 23 ) AS 'OL_IMPORTDT_EX' \
						FROM ITEM_LIST \
						LEFT JOIN ORDER_LIST ON OL_SEQ = IL_SEQ \
						/*條件*/ \
						WHERE 1=1 "+Conditions(pParams, true)+" \
					) IL ON \
					IL.IL_GETADDRESS = BLFL.BLFL_GETADDRESS AND \
					IL.IL_GETTEL = BLFL.BLFL_GETTEL \
					WHERE BLFL.BLFL_TRACK = 1 ";
}

/**
 * 組合C
 * 收件人或公司
 * 收件人電話
 */
function CaseC(pParams){
	return "SELECT '通報' AS BAN_TYPE, \
						   IL.* \
					FROM V_BLFO_JOIN_IL \
					JOIN ( \
						SELECT *, \
						   	   CONVERT(varchar, OL_IMPORTDT, 23 ) AS 'OL_IMPORTDT_EX' \
						FROM ITEM_LIST \
						LEFT JOIN ORDER_LIST ON OL_SEQ = IL_SEQ \
						/*條件*/ \
						WHERE 1=1 "+Conditions(pParams, false)+" \
					) IL ON \
					IL.IL_GETNAME = V_BLFO_JOIN_IL.IL_GETNAME AND \
					IL.IL_GETTEL = V_BLFO_JOIN_IL.IL_GETTEL \
					\
					UNION ALL \
					\
					SELECT '自訂' AS BAN_TYPE, \
						   IL.* \
					FROM BLACK_LIST_FROM_LEADER BLFL \
					JOIN ( \
						SELECT *, \
						   	   CONVERT(varchar, OL_IMPORTDT, 23 ) AS 'OL_IMPORTDT_EX' \
						FROM ITEM_LIST \
						LEFT JOIN ORDER_LIST ON OL_SEQ = IL_SEQ \
						/*條件*/ \
						WHERE 1=1 "+Conditions(pParams, true)+" \
					) IL ON \
					IL.IL_GETNAME = BLFL.BLFL_GETNAME AND \
					IL.IL_GETTEL = BLFL.BLFL_GETTEL \
					WHERE BLFL.BLFL_TRACK = 1 ";
}

/**
 * 組合D
 * 收件人或公司
 * 收件人地址
 * 收件人電話
 */
function CaseD(pParams){
	return "SELECT '通報' AS BAN_TYPE, \
						   IL.* \
					FROM V_BLFO_JOIN_IL \
					JOIN ( \
						SELECT *, \
						   	   CONVERT(varchar, OL_IMPORTDT, 23 ) AS 'OL_IMPORTDT_EX' \
						FROM ITEM_LIST \
						LEFT JOIN ORDER_LIST ON OL_SEQ = IL_SEQ \
						/*條件*/ \
						WHERE 1=1 "+Conditions(pParams, false)+" \
					) IL ON \
					IL.IL_GETNAME = V_BLFO_JOIN_IL.IL_GETNAME AND \
					IL.IL_GETADDRESS = V_BLFO_JOIN_IL.IL_GETADDRESS AND \
					IL.IL_GETTEL = V_BLFO_JOIN_IL.IL_GETTEL \
					\
					UNION ALL \
					\
					SELECT '自訂' AS BAN_TYPE, \
						   IL.* \
					FROM BLACK_LIST_FROM_LEADER BLFL \
					JOIN ( \
						SELECT *, \
						   	   CONVERT(varchar, OL_IMPORTDT, 23 ) AS 'OL_IMPORTDT_EX' \
						FROM ITEM_LIST \
						LEFT JOIN ORDER_LIST ON OL_SEQ = IL_SEQ \
						/*條件*/ \
						WHERE 1=1 "+Conditions(pParams, true)+" \
					) IL ON \
					IL.IL_GETNAME = BLFL.BLFL_GETNAME AND \
					IL.IL_GETADDRESS = BLFL.BLFL_GETADDRESS AND \
					IL.IL_GETTEL = BLFL.BLFL_GETTEL \
					WHERE BLFL.BLFL_TRACK = 1 ";
}

function Conditions(pParams, pDelete){
	var _SQLCommand = "";
						
	if(pParams["CRDT_FROM"] !== undefined){
		_SQLCommand += " AND OL_CR_DATETIME >= '" + pParams["CRDT_FROM"] + "'";
		if(pDelete){
			delete pParams["CRDT_FROM"];
		}
	}
	if(pParams["CRDT_TOXX"] !== undefined){
		_SQLCommand += " AND OL_CR_DATETIME <= '" + pParams["CRDT_TOXX"] + "'";
		if(pDelete){
			delete pParams["CRDT_TOXX"];
		}
	}
	if(pParams["IMPORTDT_FROM"] !== undefined){
		_SQLCommand += " AND OL_IMPORTDT >= '" + pParams["IMPORTDT_FROM"] + "'";
		if(pDelete){
			delete pParams["IMPORTDT_FROM"];
		}
	}
	if(pParams["IMPORTDT_TOXX"] !== undefined){
		_SQLCommand += " AND OL_IMPORTDT <= '" + pParams["IMPORTDT_TOXX"] + "'";
		if(pDelete){
			delete pParams["IMPORTDT_TOXX"];
		}
	}
	if(pParams["CO_CODE"] !== undefined){
		pParams["OL_CO_CODE"] = pParams["CO_CODE"];
		_SQLCommand += " AND OL_CO_CODE = @OL_CO_CODE";
		if(pDelete){
			delete pParams["CO_CODE"];
		}
	}
	if(pParams["FLIGHTNO_START"] !== undefined && pParams["FLIGHTNO_END"] !== undefined){
		pParams["OL_FLIGHTNO"] = pParams["FLIGHTNO_START"] + ' ' + pParams["FLIGHTNO_END"];
		_SQLCommand += " AND OL_FLIGHTNO = @OL_FLIGHTNO";
		if(pDelete){
			delete pParams["FLIGHTNO_START"];
			delete pParams["FLIGHTNO_END"];
		}
	}
	if(pParams["MASTER_START"] !== undefined && pParams["MASTER_END"] !== undefined){
		pParams["OL_MASTER"] = pParams["MASTER_START"] + '-' + pParams["MASTER_END"];
		_SQLCommand += " AND OL_MASTER = @OL_MASTER";
		if(pDelete){
			delete pParams["MASTER_START"];
			delete pParams["MASTER_END"];
		}
	}
	if(pParams["COUNTRY"] !== undefined){
		pParams["OL_COUNTRY"] = pParams["COUNTRY"];
		_SQLCommand += " AND OL_COUNTRY = @OL_COUNTRY";
		if(pDelete){
			delete pParams["COUNTRY"];
		}
	}
	if(pParams["FINISH"] !== undefined){
		if(pParams["FINISH"]){
			_SQLCommand += " AND OL_FDATETIME IS NOT NULL";
		}else{
			_SQLCommand += " AND OL_FDATETIME IS NULL";
		}
		if(pDelete){
			delete pParams["FINISH"];
		}
	}

	if(pParams["BAGNO"] !== undefined){
		_SQLCommand += " AND IL_BAGNO = '" + pParams["BAGNO"] + "'";
		if(pDelete){
			delete pParams["BAGNO"];
		}
	}
	if(pParams["BAGNO_LAST5"] !== undefined){
		_SQLCommand += " AND IL_BAGNO LIKE '%" + pParams["BAGNO_LAST5"] + "'";
		if(pDelete){
			delete pParams["BAGNO_LAST5"];
		}
	}
	if(pParams["BAGNO_RANGE5"] !== undefined && pParams["BAGNO_RANGE3_START"] !== undefined && pParams["BAGNO_RANGE3_END"] !== undefined){
		var _bagnoStart = pParams["BAGNO_RANGE5"] + pParams["BAGNO_RANGE3_START"],
			_bagnoEnd = pParams["BAGNO_RANGE5"] + pParams["BAGNO_RANGE3_END"];

		_SQLCommand += " AND IL_BAGNO BETWEEN '" + _bagnoStart + "' AND '" + _bagnoEnd + "'";

		if(pDelete){
			delete pParams["BAGNO_RANGE5"];
			delete pParams["BAGNO_RANGE3_START"];
			delete pParams["BAGNO_RANGE3_END"];
		}
		
	}
	if(pParams["GETNAME"] !== undefined){
		pParams["IL_GETNAME"] = '%'+pParams["GETNAME"]+'%';
		_SQLCommand += " AND IL_GETNAME LIKE @IL_GETNAME";

		if(pDelete){
			delete pParams["GETNAME"];
		}
		
	}
	if(pParams["GETADDRESS"] !== undefined){
		pParams["IL_GETADDRESS"] = '%'+pParams["GETADDRESS"]+'%';
		_SQLCommand += " AND IL_GETADDRESS LIKE @IL_GETADDRESS";

		if(pDelete){
			delete pParams["GETADDRESS"];
		}
		
	}
	if(pParams["GETTEL"] !== undefined){
		pParams["IL_GETTEL"] = pParams["GETTEL"];
		_SQLCommand += " AND IL_GETTEL = @IL_GETTEL";

		if(pDelete){
			delete pParams["GETTEL"];
		}
	}
	if(pParams["NATURE"] !== undefined){
		pParams["IL_NATURE"] = '%'+pParams["NATURE"]+'%';
		_SQLCommand += " AND IL_NATURE LIKE @IL_NATURE";

		if(pDelete){
			delete pParams["NATURE"];
		}
	}
	if(pParams["WEIGHT"] !== undefined){
		pParams["IL_WEIGHT"] = pParams["WEIGHT"];
		_SQLCommand += " AND IL_WEIGHT = @IL_WEIGHT";

		if(pDelete){
			delete pParams["WEIGHT"];
		}
	}
	if(pParams["PCS"] !== undefined){
		pParams["IL_PCS"] = pParams["PCS"];
		_SQLCommand += " AND IL_PCS = @IL_PCS";

		if(pDelete){
			delete pParams["PCS"];
		}
	}

	return _SQLCommand;
}