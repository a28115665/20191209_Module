module.exports = function(pQueryname, pParams){
	var _SQLCommand = "";

	switch(pQueryname){
		case "SelectOOrderList":	
			_SQLCommand += "SELECT O_OL_SEQ, \
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
									O_OL_ILSTATUS, \
									O_OL_FLIGHT_TOTALCROSSWEIGHT, \
									O_OL_FLIGHT_TOTALNETWEIGHT, \
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
									) AS 'O_OL_PULL_COUNT',\
									( \
										SELECT MAX(O_IL_SUPPLEMENT_COUNT) \
										FROM O_ITEM_LIST \
										WHERE O_IL_SEQ = O_OL_SEQ \
									) AS 'O_OL_SUPPLEMENT_COUNT', \
									W2_OE.O_OE_PRINCIPAL AS 'OW2_PRINCIPAL', \
									W2_OE.O_OE_EDATETIME AS 'OW2_EDATETIME', \
									W2_OE.O_OE_FDATETIME AS 'OW2_FDATETIME', \
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
									( \
										SELECT O_CO_NAME \
										FROM O_COMPY_INFO \
										WHERE O_OL_CO_CODE = O_CO_CODE \
									) AS 'O_CO_NAME', \
									( \
										SELECT COUNT(O_ILE_ID) \
										FROM O_ITEM_LIST_EXPORTER \
										WHERE O_ILE_SEQ = O_OL_SEQ \
										AND O_ILE_TYPE != '11' \
									) AS 'TRADE_EXPORT' \
							FROM O_ORDER_LIST \
							/*報機單*/ \
							LEFT JOIN V_O_ORDER_EDITOR_BY_R W2_OE ON W2_OE.O_OE_SEQ = O_ORDER_LIST.O_OL_SEQ\
							/*銷艙單只有完成時間*/ \
							LEFT JOIN V_O_ORDER_EDITOR_BY_W W3_OE ON W3_OE.O_OE_SEQ = O_ORDER_LIST.O_OL_SEQ\
							/*派送單*/ \
							LEFT JOIN V_O_ORDER_EDITOR_BY_D W1_OE ON W1_OE.O_OE_SEQ = O_ORDER_LIST.O_OL_SEQ ";
							
			if(pParams["U_ID"] !== undefined && pParams["U_GRADE"] !== undefined){

				// 早中晚班員工的Grade
				var _OpGrade = 11;

				// Grade等於11表示員工 則需要組SQL
				if(pParams["U_GRADE"] == 11){
					_SQLCommand += "/*負責人(owner)*/ \
									JOIN ( \
										SELECT * \
										FROM O_ORDER_PRINPL \
										WHERE O_OP_PRINCIPAL = @U_ID \
									) O_ORDER_PRINPL ON O_OP_SEQ = O_ORDER_LIST.O_OL_SEQ ";
				}
			}

			_SQLCommand += " WHERE O_OL_FDATETIME IS NULL \
								AND ( \
									SELECT COUNT(1) \
									FROM O_ITEM_LIST \
									WHERE O_IL_SEQ = O_OL_SEQ \
								) > 0 ";
		
			break;
		case "SelectOOrderEditor":
			_SQLCommand += "SELECT * \
							FROM O_ORDER_EDITOR \
							WHERE 1=1 ";

			if(pParams["O_OE_SEQ"] !== undefined){
				_SQLCommand += " AND O_OE_SEQ = @O_OE_SEQ ";
			}
			if(pParams["O_OE_TYPE"] !== undefined){
				_SQLCommand += " AND O_OE_TYPE = @O_OE_TYPE ";
			}

			break;
		case "SelectOExportDetail":
			_SQLCommand += "SELECT  ( \
									SELECT SC_DESC \
									FROM SYS_CODE \
									WHERE SC_CODE = O_ILE_TYPE \
									AND SC_TYPE = 'excelType' \
								) AS O_ILE_TYPE, \
								O_ILE_CR_USER, \
								O_ILE_CR_DATETIME \
							FROM O_ITEM_LIST_EXPORTER \
							WHERE 1=1 ";

			if(pParams["O_ILE_SEQ"] !== undefined){
				_SQLCommand += " AND O_ILE_SEQ = @O_ILE_SEQ ";
			}
			
			_SQLCommand += " ORDER BY O_ILE_CR_DATETIME DESC";

			break;
	}

	return _SQLCommand;
};