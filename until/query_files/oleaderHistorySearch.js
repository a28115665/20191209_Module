module.exports = function(pQueryname, pParams){
	var _SQLCommand = "";

	switch(pQueryname){
		case "SelectSearch":
			_SQLCommand += "SELECT TOP 1000 O_OL_SEQ, \
									O_OL_CO_CODE, \
									O_OL_MASTER, \
									O_OL_IMPORTDT, \
									O_OL_PASSCODE, \
									O_OL_VOYSEQ, \
									O_OL_MVNO, \
									O_OL_COMPID, \
									O_OL_ARRLOCATIONID, \
									O_OL_POST, \
									O_OL_PACKAGELOCATIONID, \
									O_OL_BOATID, \
									O_OL_CR_USER, \
									O_OL_CR_DATETIME, \
									O_OL_REASON, \
									O_OL_FDATETIME, \
									O_OL_FUSER, \
									( \
										(\
											SELECT COUNT(1) \
											FROM O_ITEM_LIST \
											WHERE O_IL_SEQ = O_OL_SEQ\
										) -\
										( \
											SELECT COUNT(1) \
											FROM O_PULL_GOODS \
											WHERE O_PG_SEQ = O_OL_SEQ \
										)\
									) AS 'O_OL_COUNT', \
									( \
										SELECT COUNT(1) \
										FROM O_PULL_GOODS \
										WHERE O_PG_SEQ = O_OL_SEQ \
									) AS 'O_OL_PULL_COUNT', \
									W2_OE.O_OE_PRINCIPAL AS 'OW2_PRINCIPAL', \
									( \
										SELECT U_NAME \
										FROM USER_INFO \
										WHERE U_ID = W2_OE.O_OE_PRINCIPAL \
									) AS 'U_NAME', \
									W2_OE.O_OE_EDATETIME AS 'OW2_EDATETIME', \
									W2_OE.O_OE_FDATETIME AS 'OW2_FDATETIME', \
									\
									( \
										CASE WHEN ( \
											/*表示已有完成者*/ \
											SELECT COUNT(1)\
											FROM V_O_ORDER_OW2_STATUS3\
											WHERE O_OP_SEQ = O_OL_SEQ\
										) > 0 THEN '3' \
										WHEN ( \
											/*表示已有完成者，但非作業員*/ \
											SELECT COUNT(1)\
											FROM V_O_ORDER_OW2_STATUS4\
											WHERE O_OP_SEQ = O_OL_SEQ\
										) > 0 OR W2_OE.O_OE_FDATETIME IS NOT NULL THEN '4' \
										WHEN ( \
											/*表示未有完成者，但有編輯者*/ \
											SELECT COUNT(1)\
											FROM V_O_ORDER_OW2_STATUS2\
											WHERE O_OP_SEQ = O_OL_SEQ\
										) > 0 THEN '2' \
										WHEN ( \
											/*表示未有完成者，未有編輯者，但有負責人(已派單)*/ \
											SELECT COUNT(1)\
											FROM V_O_ORDER_OW2_STATUS1\
											WHERE O_OP_SEQ = O_OL_SEQ\
										) > 0 THEN '1' \
										/*表示尚未派單*/ \
										ELSE '0' END \
									) AS 'OW2_STATUS', \
									W3_OE.O_OE_PRINCIPAL AS 'OW3_PRINCIPAL', \
									W3_OE.O_OE_EDATETIME AS 'OW3_EDATETIME', \
									W3_OE.O_OE_FDATETIME AS 'OW3_FDATETIME', \
									W1_OE.O_OE_PRINCIPAL AS 'OW1_PRINCIPAL', \
									W1_OE.O_OE_EDATETIME AS 'OW1_EDATETIME', \
									W1_OE.O_OE_FDATETIME AS 'OW1_FDATETIME', \
									CONVERT(varchar, O_OL_IMPORTDT, 23 ) AS 'O_OL_IMPORTDT_EX', \
									O_CO_NAME \
							FROM ( \
								SELECT * \
								FROM O_ORDER_LIST \
								/*行家中文名稱*/ \
								OUTTER JOIN O_COMPY_INFO ON O_CO_CODE = O_OL_CO_CODE \
							) O_ORDER_LIST \
							/*報機單*/ \
							LEFT JOIN V_O_ORDER_EDITOR_BY_R W2_OE ON W2_OE.O_OE_SEQ = O_ORDER_LIST.O_OL_SEQ\
							/*銷艙單只有完成時間*/ \
							LEFT JOIN V_O_ORDER_EDITOR_BY_W W3_OE ON W3_OE.O_OE_SEQ = O_ORDER_LIST.O_OL_SEQ\
							/*派送單*/ \
							LEFT JOIN V_O_ORDER_EDITOR_BY_D W1_OE ON W1_OE.O_OE_SEQ = O_ORDER_LIST.O_OL_SEQ \
							WHERE 1=1 ";
						
			// if(pParams["CRDT_FROM"] !== undefined){
			// 	_SQLCommand += " AND OL_CR_DATETIME >= '" + pParams["CRDT_FROM"] + "'";
			// 	delete pParams["CRDT_FROM"];
			// }
			// if(pParams["CRDT_TOXX"] !== undefined){
			// 	_SQLCommand += " AND OL_CR_DATETIME <= '" + pParams["CRDT_TOXX"] + "'";
			// 	delete pParams["CRDT_TOXX"];
			// }
			if(pParams["O_IMPORTDT_FROM"] !== undefined){
				_SQLCommand += " AND O_OL_IMPORTDT >= '" + pParams["O_IMPORTDT_FROM"] + "'";
				delete pParams["O_IMPORTDT_FROM"];
			}
			if(pParams["O_IMPORTDT_TOXX"] !== undefined){
				_SQLCommand += " AND O_OL_IMPORTDT <= '" + pParams["O_IMPORTDT_TOXX"] + "'";
				delete pParams["O_IMPORTDT_TOXX"];
			}
			if(pParams["O_CO_CODE"] !== undefined){
				pParams["O_OL_CO_CODE"] = pParams["O_CO_CODE"];
				_SQLCommand += " AND O_OL_CO_CODE = @O_OL_CO_CODE";
				delete pParams["O_CO_CODE"];
			}
			if(pParams["O_OL_VOYSEQ"] !== undefined){
				pParams["O_OL_VOYSEQ"] = '%'+pParams["O_OL_VOYSEQ"]+'%';
				_SQLCommand += " AND O_OL_VOYSEQ LIKE @O_OL_VOYSEQ";
			}
			if(pParams["O_OL_PASSCODE"] !== undefined){
				_SQLCommand += " AND O_OL_PASSCODE = @O_OL_PASSCODE";
			}
			if(pParams["O_OL_BOATID"] !== undefined){
				_SQLCommand += " AND O_OL_BOATID = @O_OL_BOATID";
			}
			if(pParams["O_OL_MASTER"] !== undefined){
				_SQLCommand += " AND O_OL_MASTER = @O_OL_MASTER";
			}
			if(pParams["O_OL_POST"] !== undefined){
				_SQLCommand += " AND O_OL_POST = @O_OL_POST";
			}
			if(pParams["O_FINISH"] !== undefined){
				if(pParams["O_FINISH"]){
					_SQLCommand += " AND O_OL_FDATETIME IS NOT NULL";
				}else{
					_SQLCommand += " AND O_OL_FDATETIME IS NULL";
				}
				delete pParams["O_FINISH"];
			}

			_SQLCommand += " GROUP BY O_OL_SEQ, \
									O_OL_CO_CODE, \
									O_OL_MASTER, \
									O_OL_IMPORTDT, \
									O_OL_PASSCODE, \
									O_OL_VOYSEQ, \
									O_OL_MVNO, \
									O_OL_COMPID, \
									O_OL_ARRLOCATIONID, \
									O_OL_POST, \
									O_OL_PACKAGELOCATIONID, \
									O_OL_BOATID, \
									O_OL_CR_USER, \
									O_OL_CR_DATETIME, \
									O_OL_REASON, \
									O_OL_FDATETIME, \
									O_OL_FUSER, \
									W2_OE.O_OE_PRINCIPAL, \
									W2_OE.O_OE_EDATETIME, \
									W2_OE.O_OE_FDATETIME, \
									W3_OE.O_OE_PRINCIPAL, \
									W3_OE.O_OE_EDATETIME, \
									W3_OE.O_OE_FDATETIME, \
									W1_OE.O_OE_PRINCIPAL, \
									W1_OE.O_OE_EDATETIME, \
									W1_OE.O_OE_FDATETIME, \
									O_CO_NAME \
							ORDER BY O_OL_IMPORTDT DESC ";
			break;

	}

	return _SQLCommand;
};