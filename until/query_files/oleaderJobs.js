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
									( \
										( \
											SELECT COUNT(1) \
											FROM O_ITEM_LIST \
											WHERE O_IL_SEQ = O_OL_SEQ \
										) - \
										( \
											SELECT COUNT(1) \
											FROM O_PULL_GOODS \
											WHERE O_PG_SEQ = O_OL_SEQ \
										) \
									) AS 'O_OL_COUNT', \
									( \
										SELECT COUNT(1) \
										FROM O_PULL_GOODS \
										WHERE O_PG_SEQ = O_OL_SEQ \
									) AS 'O_OL_PULL_COUNT', \
									( \
										SELECT MAX(O_IL_SUPPLEMENT_COUNT) \
										FROM O_ITEM_LIST \
										WHERE O_IL_SEQ = O_OL_SEQ \
									) AS 'O_OL_SUPPLEMENT_COUNT', \
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
									( \
										CASE WHEN ( \
											/*表示已有完成者*/ \
											SELECT COUNT(1)\
											FROM V_O_ORDER_OW3_STATUS3\
											WHERE O_OP_SEQ = O_OL_SEQ\
										) > 0 THEN '3' \
										WHEN ( \
											/*表示已有完成者，但非作業員*/ \
											SELECT COUNT(1)\
											FROM V_O_ORDER_OW3_STATUS4\
											WHERE O_OP_SEQ = O_OL_SEQ\
										) > 0 OR W3_OE.O_OE_FDATETIME IS NOT NULL THEN '4' \
										WHEN ( \
											/*表示未有完成者，但有編輯者*/ \
											SELECT COUNT(1)\
											FROM V_O_ORDER_OW3_STATUS2\
											WHERE O_OP_SEQ = O_OL_SEQ\
										) > 0 THEN '2' \
										WHEN ( \
											/*表示未有完成者，未有編輯者，但有負責人(已派單)*/ \
											SELECT COUNT(1)\
											FROM V_O_ORDER_OW3_STATUS1\
											WHERE O_OP_SEQ = O_OL_SEQ\
										) > 0 THEN '1' \
										/*表示尚未派單*/ \
										ELSE '0' END \
									) AS 'OW3_STATUS', \
									( \
										CASE WHEN ( \
											/*表示已有完成者*/ \
											SELECT COUNT(1)\
											FROM V_O_ORDER_OW1_STATUS3\
											WHERE O_OP_SEQ = O_OL_SEQ\
										) > 0 THEN '3' \
										WHEN ( \
											/*表示已有完成者，但非作業員*/ \
											SELECT COUNT(1)\
											FROM V_O_ORDER_OW1_STATUS4\
											WHERE O_OP_SEQ = O_OL_SEQ\
										) > 0 OR W1_OE.O_OE_FDATETIME IS NOT NULL THEN '4' \
										WHEN ( \
											/*表示未有完成者，但有編輯者*/ \
											SELECT COUNT(1)\
											FROM V_O_ORDER_OW1_STATUS2\
											WHERE O_OP_SEQ = O_OL_SEQ \
										) > 0 THEN '2' \
										WHEN ( \
											/*表示未有完成者，未有編輯者，但有負責人(已派單)*/ \
											SELECT COUNT(1)\
											FROM V_O_ORDER_OW1_STATUS1\
											WHERE O_OP_SEQ = O_OL_SEQ\
										) > 0 THEN '1' \
										/*表示尚未派單*/ \
										ELSE '0' END \
									) AS 'OW1_STATUS', \
									W2_OE.O_OE_PRINCIPAL AS 'OW2_PRINCIPAL', \
									W2_OE.O_OE_EDATETIME AS 'OW2_EDATETIME', \
									W2_OE.O_OE_FDATETIME AS 'OW2_FDATETIME', \
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
									) AS 'O_CO_NAME' \
							FROM O_ORDER_LIST \
							/*報機單*/ \
							LEFT JOIN V_O_ORDER_EDITOR_BY_R W2_OE ON W2_OE.O_OE_SEQ = O_ORDER_LIST.O_OL_SEQ\
							/*銷艙單只有完成時間*/ \
							LEFT JOIN V_O_ORDER_EDITOR_BY_W W3_OE ON W3_OE.O_OE_SEQ = O_ORDER_LIST.O_OL_SEQ\
							/*派送單*/ \
							LEFT JOIN V_O_ORDER_EDITOR_BY_D W1_OE ON W1_OE.O_OE_SEQ = O_ORDER_LIST.O_OL_SEQ\
							WHERE O_OL_FDATETIME IS NULL \
							ORDER BY O_OL_CR_DATETIME DESC";
			break;

		case "SelectOOrderPrinpl":
			_SQLCommand += "SELECT O_OP_SEQ, \
									O_OP_DEPT, \
									O_OP_TYPE, \
									O_OP_PRINCIPAL, \
									O_OE_EDATETIME, \
									O_OE_FDATETIME \
							FROM O_ORDER_PRINPL \
							LEFT JOIN O_ORDER_EDITOR ON O_OE_SEQ = O_OP_SEQ AND O_OE_TYPE = O_OP_TYPE AND O_OE_PRINCIPAL = O_OP_PRINCIPAL \
							WHERE 1=1 ";
							
			if(pParams["O_OP_DEPT"] !== undefined){
				_SQLCommand += " AND O_OP_DEPT = @O_OP_DEPT";
			}
			if(pParams["O_OP_MULTI_SEQ"] !== undefined){
				_SQLCommand += " AND O_OP_SEQ IN ('" + pParams["O_OP_MULTI_SEQ"].replace(/,/g, "','") + "')";
			}
		
			break;

		case "WhoPrincipal":
			_SQLCommand += "SELECT O_CO_NAME, \
									O_COD_CODE, \
									O_COD_PRINCIPAL, \
									O_DL_IS_LEAVE, \
									O_AS_AGENT, \
									O_AS_IS_LEAVE, \
									CASE WHEN O_DL_IS_LEAVE = 0 THEN O_COD_PRINCIPAL \
									WHEN O_AS_IS_LEAVE = 0 THEN O_AS_AGENT \
									ELSE NULL END AS 'O_WHO_PRINCIPAL' \
							FROM ( \
								/*負責人是否有請假*/ \
								SELECT O_CO_NAME, \
										O_COD_CODE, \
										O_COD_PRINCIPAL, \
										CASE WHEN O_DL_ID IS NOT NULL THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS 'O_DL_IS_LEAVE', \
										A.O_AS_AGENT, \
										A.O_AS_IS_LEAVE \
								FROM O_COMPY_DISTRIBUTION \
								LEFT JOIN O_DAILY_LEAVE ON O_DL_ID = O_COD_PRINCIPAL \
								LEFT JOIN O_COMPY_INFO ON O_COD_CODE = O_CO_CODE \
								LEFT JOIN ( \
									/*代理人是否有請假*/ \
									SELECT O_AS_PRINCIPAL, \
											O_AS_CODE, \
											O_AS_AGENT, \
											CASE WHEN O_DL_ID IS NOT NULL THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS 'O_AS_IS_LEAVE' \
									FROM O_AGENT_SETTING \
									LEFT JOIN O_DAILY_LEAVE ON O_DL_ID = O_AS_AGENT \
									WHERE O_AS_DEPT = @O_AS_DEPT \
								) A ON O_COD_CODE = A.O_AS_CODE AND O_COD_PRINCIPAL = A.O_AS_PRINCIPAL \
								WHERE O_COD_DEPT = @O_AS_DEPT \
							) B"; 
			break;

		case "SelectOCompyStatistics":
			_SQLCommand += "SELECT O_CO_NAME, \
								( \
									SELECT COUNT(1) \
									FROM O_ITEM_LIST \
									JOIN O_ORDER_LIST ON O_OL_SEQ = O_IL_SEQ AND O_OL_CO_CODE = O_CO_CODE \
									/*只抓今天*/ \
									WHERE '"+pParams["O_IMPORTDT_FROM"]+"' <= O_OL_IMPORTDT AND O_OL_IMPORTDT <= '"+pParams["O_IMPORTDT_TOXX"]+"' \
								) AS 'OW2_COUNT', \
								( \
									SELECT COUNT(1) \
									FROM O_ORDER_LIST \
									JOIN ( \
										SELECT O_IL_SEQ \
										FROM O_ITEM_LIST \
										GROUP BY O_IL_SEQ \
									) ITEM_LIST ON O_OL_SEQ = O_IL_SEQ AND O_OL_CO_CODE = O_CO_CODE \
									/*只抓今天*/ \
									WHERE '"+pParams["O_IMPORTDT_FROM"]+"' <= O_OL_IMPORTDT AND O_OL_IMPORTDT <= '"+pParams["O_IMPORTDT_TOXX"]+"' \
								) AS 'OL_OW2_COUNT' \
							FROM ( \
								SELECT * \
								FROM O_COMPY_INFO \
								WHERE O_CO_STS = 0 \
							) COMPY_INFO";
			
			break;

		case "SelectOOrderListForExcel":
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
								O_OL_REASON, \
								O_OL_POST, \
								O_OL_ILSTATUS, \
								O_OL_CR_USER, \
								( \
									CASE WHEN ( \
										/*表示已有完成者*/ \
										SELECT COUNT(1)\
										FROM V_O_ORDER_OW2_STATUS3\
										WHERE O_OP_SEQ = O_OL_SEQ\
									) > 0 THEN '3' \
									WHEN ( \
										/*表示已有完成者，但非作業員*/ \
										SELECT COUNT(1) \
										FROM V_O_ORDER_OW2_STATUS4\
										WHERE O_OP_SEQ = O_OL_SEQ\
									) > 0 OR W2_OE.O_OE_FDATETIME IS NOT NULL THEN '4' \
									WHEN ( \
										/*表示未有完成者，但有編輯者*/ \
										SELECT COUNT(1) \
										FROM V_O_ORDER_OW2_STATUS2\
										WHERE O_OP_SEQ = O_OL_SEQ\
									) > 0 THEN '2' \
									WHEN ( \
										/*表示未有完成者，未有編輯者，但有負責人(已派單)*/ \
										SELECT COUNT(1) \
										FROM V_O_ORDER_OW2_STATUS1\
										WHERE O_OP_SEQ = O_OL_SEQ\
									) > 0 THEN '1' \
									/*表示尚未派單*/ \
									ELSE '0' END \
								) AS 'OW2_STATUS', \
								( \
									CASE WHEN ( \
										/*表示已有完成者*/ \
										SELECT COUNT(1)\
										FROM V_O_ORDER_OW3_STATUS3\
										WHERE O_OP_SEQ = O_OL_SEQ\
									) > 0 THEN '3' \
									WHEN ( \
										/*表示已有完成者，但非作業員*/ \
										SELECT COUNT(1)\
										FROM V_O_ORDER_OW3_STATUS4\
										WHERE O_OP_SEQ = O_OL_SEQ\
									) > 0 OR W3_OE.O_OE_FDATETIME IS NOT NULL THEN '4' \
									WHEN ( \
										/*表示未有完成者，但有編輯者*/ \
										SELECT COUNT(1)\
										FROM V_O_ORDER_OW3_STATUS2\
										WHERE O_OP_SEQ = O_OL_SEQ\
									) > 0 THEN '2' \
									WHEN ( \
										/*表示未有完成者，未有編輯者，但有負責人(已派單)*/ \
										SELECT COUNT(1)\
										FROM V_O_ORDER_OW3_STATUS1\
										WHERE O_OP_SEQ = O_OL_SEQ\
									) > 0 THEN '1' \
									/*表示尚未派單*/ \
									ELSE '0' END \
								) AS 'OW3_STATUS', \
								( \
									CASE WHEN ( \
										/*表示已有完成者*/ \
										SELECT COUNT(1)\
										FROM V_O_ORDER_OW1_STATUS3\
										WHERE O_OP_SEQ = O_OL_SEQ\
									) > 0 THEN '3' \
									WHEN ( \
										/*表示已有完成者，但非作業員*/ \
										SELECT COUNT(1)\
										FROM V_O_ORDER_OW1_STATUS4\
										WHERE O_OP_SEQ = O_OL_SEQ\
									) > 0 OR W1_OE.O_OE_FDATETIME IS NOT NULL THEN '4' \
									WHEN ( \
										/*表示未有完成者，但有編輯者*/ \
										SELECT COUNT(1)\
										FROM V_O_ORDER_OW1_STATUS2\
										WHERE O_OP_SEQ = O_OL_SEQ \
									) > 0 THEN '2' \
									WHEN ( \
										/*表示未有完成者，未有編輯者，但有負責人(已派單)*/ \
										SELECT COUNT(1)\
										FROM V_O_ORDER_OW1_STATUS1\
										WHERE O_OP_SEQ = O_OL_SEQ\
									) > 0 THEN '1' \
									/*表示尚未派單*/ \
									ELSE '0' END \
								) AS 'OW1_STATUS', \
								CONVERT(varchar, O_OL_IMPORTDT, 23 ) AS 'O_OL_IMPORTDT_EX', \
								O_CO_NAME, \
								( \
									(\
										SELECT COUNT(1) \
										FROM O_ITEM_LIST \
										WHERE O_IL_SEQ = O_OL_SEQ\
									) - \
									( \
										SELECT COUNT(1) \
										FROM O_PULL_GOODS \
										WHERE O_PG_SEQ = O_OL_SEQ \
									) \
								) AS 'O_OL_COUNT', \
								( \
									SELECT COUNT(1) \
									FROM O_PULL_GOODS \
									WHERE O_PG_SEQ = O_OL_SEQ \
								) AS 'O_OL_PULL_COUNT', \
								( \
									SELECT U_NAME \
									FROM USER_INFO \
									WHERE U_ID = W2_OE.O_OE_PRINCIPAL \
								) AS 'OW2_PRINCIPAL' \
						FROM ( \
							SELECT * \
							FROM O_ORDER_LIST \
							OUTTER JOIN O_COMPY_INFO ON O_OL_CO_CODE = O_CO_CODE \
						) ORDER_LIST \
						/*報機單*/ \
						LEFT JOIN V_O_ORDER_EDITOR_BY_R W2_OE ON W2_OE.O_OE_SEQ = ORDER_LIST.O_OL_SEQ \
						/*銷艙單只有完成時間*/ \
						LEFT JOIN V_O_ORDER_EDITOR_BY_W W3_OE ON W3_OE.O_OE_SEQ = ORDER_LIST.O_OL_SEQ \
						/*派送單*/ \
						LEFT JOIN V_O_ORDER_EDITOR_BY_D W1_OE ON W1_OE.O_OE_SEQ = ORDER_LIST.O_OL_SEQ \
						WHERE O_OL_FDATETIME IS NULL \
						ORDER BY O_OL_CR_DATETIME DESC";
			break;

		// case "SelectParm":
		// 	_SQLCommand = "SELECT O_SPA_AUTOPRIN \
		// 				   FROM SYS_PARM";
		// 	break;

		case "SelectOOrderSupplement":
			_SQLCommand += "SELECT * \
							FROM O_ORDER_LIST_SUPPLEMENT \
							WHERE 1=1 ";
							
			if(pParams["O_OLS_SEQ"] !== undefined){
				_SQLCommand += " AND O_OLS_SEQ = @O_OLS_SEQ";
			}
		
			break;
	}

	return _SQLCommand;
};