module.exports = function(pQueryname, pParams){
	var _SQLCommand = "",
		/**
		 * 組合A
		 * 收件人或公司
		 * 收件人地址
		 */
		_CaseA = "SELECT '通報' AS BAN_TYPE, \
						   IL.* \
					FROM ( \
						SELECT IL_GETNAME, IL_GETADDRESS \
						FROM V_BLFO_JOIN_IL \
						GROUP BY IL_GETNAME, IL_GETADDRESS \
					) V_BLFO_JOIN_IL \
					JOIN ( \
						SELECT *, \
						   	   CONVERT(varchar, OL_IMPORTDT, 23 ) AS 'OL_IMPORTDT_EX' \
						FROM ITEM_LIST \
						JOIN ORDER_LIST ON OL_SEQ = IL_SEQ \
						/*只抓今天*/ \
						WHERE '"+pParams["IMPORTDT_FROM"]+"' <= OL_IMPORTDT AND OL_IMPORTDT <= '"+pParams["IMPORTDT_TOXX"]+"' \
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
						JOIN ORDER_LIST ON OL_SEQ = IL_SEQ \
						/*只抓今天*/ \
						WHERE '"+pParams["IMPORTDT_FROM"]+"' <= OL_IMPORTDT AND OL_IMPORTDT <= '"+pParams["IMPORTDT_TOXX"]+"' \
					) IL ON \
					IL.IL_GETNAME = BLFL.BLFL_GETNAME AND \
					IL.IL_GETADDRESS = BLFL.BLFL_GETADDRESS \
					WHERE BLFL.BLFL_TRACK = 1 ",
		/**
		 * 組合B
		 * 收件人地址
		 * 收件人電話
		 */
		_CaseB = "SELECT '通報' AS BAN_TYPE, \
						   IL.* \
					FROM ( \
						SELECT IL_GETADDRESS, IL_GETTEL \
						FROM V_BLFO_JOIN_IL \
						GROUP BY IL_GETADDRESS, IL_GETTEL \
					) V_BLFO_JOIN_IL \
					JOIN ( \
						SELECT *, \
						   	   CONVERT(varchar, OL_IMPORTDT, 23 ) AS 'OL_IMPORTDT_EX' \
						FROM ITEM_LIST \
						JOIN ORDER_LIST ON OL_SEQ = IL_SEQ \
						/*只抓今天*/ \
						WHERE '"+pParams["IMPORTDT_FROM"]+"' <= OL_IMPORTDT AND OL_IMPORTDT <= '"+pParams["IMPORTDT_TOXX"]+"' \
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
						JOIN ORDER_LIST ON OL_SEQ = IL_SEQ \
						/*只抓今天*/ \
						WHERE '"+pParams["IMPORTDT_FROM"]+"' <= OL_IMPORTDT AND OL_IMPORTDT <= '"+pParams["IMPORTDT_TOXX"]+"' \
					) IL ON \
					IL.IL_GETADDRESS = BLFL.BLFL_GETADDRESS AND \
					IL.IL_GETTEL = BLFL.BLFL_GETTEL \
					WHERE BLFL.BLFL_TRACK = 1 ",
		/**
		 * 組合C
		 * 收件人或公司
		 * 收件人電話
		 */
		_CaseC = "SELECT '通報' AS BAN_TYPE, \
						   IL.* \
					FROM ( \
						SELECT IL_GETNAME, IL_GETTEL \
						FROM V_BLFO_JOIN_IL \
						GROUP BY IL_GETNAME, IL_GETTEL \
					) V_BLFO_JOIN_IL \
					JOIN ( \
						SELECT *, \
						   	   CONVERT(varchar, OL_IMPORTDT, 23 ) AS 'OL_IMPORTDT_EX' \
						FROM ITEM_LIST \
						JOIN ORDER_LIST ON OL_SEQ = IL_SEQ \
						/*只抓今天*/ \
						WHERE '"+pParams["IMPORTDT_FROM"]+"' <= OL_IMPORTDT AND OL_IMPORTDT <= '"+pParams["IMPORTDT_TOXX"]+"' \
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
						JOIN ORDER_LIST ON OL_SEQ = IL_SEQ \
						/*只抓今天*/ \
						WHERE '"+pParams["IMPORTDT_FROM"]+"' <= OL_IMPORTDT AND OL_IMPORTDT <= '"+pParams["IMPORTDT_TOXX"]+"' \
					) IL ON \
					IL.IL_GETNAME = BLFL.BLFL_GETNAME AND \
					IL.IL_GETTEL = BLFL.BLFL_GETTEL \
					WHERE BLFL.BLFL_TRACK = 1 ",
		/**
		 * 組合D
		 * 收件人或公司
		 * 收件人地址
		 * 收件人電話
		 */
		_CaseD = "SELECT '通報' AS BAN_TYPE, \
						   IL.* \
					FROM ( \
						SELECT IL_GETNAME, IL_GETADDRESS, IL_GETTEL \
						FROM V_BLFO_JOIN_IL \
						GROUP BY IL_GETNAME, IL_GETADDRESS, IL_GETTEL \
					) V_BLFO_JOIN_IL \
					JOIN ( \
						SELECT *, \
						   	   CONVERT(varchar, OL_IMPORTDT, 23 ) AS 'OL_IMPORTDT_EX' \
						FROM ITEM_LIST \
						JOIN ORDER_LIST ON OL_SEQ = IL_SEQ \
						/*只抓今天*/ \
						WHERE '"+pParams["IMPORTDT_FROM"]+"' <= OL_IMPORTDT AND OL_IMPORTDT <= '"+pParams["IMPORTDT_TOXX"]+"' \
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
						JOIN ORDER_LIST ON OL_SEQ = IL_SEQ \
						/*只抓今天*/ \
						WHERE '"+pParams["IMPORTDT_FROM"]+"' <= OL_IMPORTDT AND OL_IMPORTDT <= '"+pParams["IMPORTDT_TOXX"]+"' \
					) IL ON \
					IL.IL_GETNAME = BLFL.BLFL_GETNAME AND \
					IL.IL_GETADDRESS = BLFL.BLFL_GETADDRESS AND \
					IL.IL_GETTEL = BLFL.BLFL_GETTEL \
					WHERE BLFL.BLFL_TRACK = 1 ",
		/**
		 * 組合E
		 * 收件人或公司
		 */
		_CaseE = "SELECT '通報' AS BAN_TYPE, \
						   IL.* \
					FROM ( \
						SELECT IL_GETNAME \
						FROM V_BLFO_JOIN_IL \
						GROUP BY IL_GETNAME \
					) V_BLFO_JOIN_IL \
					JOIN ( \
						SELECT *, \
						   	   CONVERT(varchar, OL_IMPORTDT, 23 ) AS 'OL_IMPORTDT_EX' \
						FROM ITEM_LIST \
						JOIN ORDER_LIST ON OL_SEQ = IL_SEQ \
						/*只抓今天*/ \
						WHERE '"+pParams["IMPORTDT_FROM"]+"' <= OL_IMPORTDT AND OL_IMPORTDT <= '"+pParams["IMPORTDT_TOXX"]+"' \
					) IL ON \
					IL.IL_GETNAME = V_BLFO_JOIN_IL.IL_GETNAME \
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
						JOIN ORDER_LIST ON OL_SEQ = IL_SEQ \
						/*只抓今天*/ \
						WHERE '"+pParams["IMPORTDT_FROM"]+"' <= OL_IMPORTDT AND OL_IMPORTDT <= '"+pParams["IMPORTDT_TOXX"]+"' \
					) IL ON \
					IL.IL_GETNAME = BLFL.BLFL_GETNAME \
					WHERE BLFL.BLFL_TRACK = 1 ",
		/**
		 * 組合F
		 * 收件人或公司
		 */
		_CaseF = "SELECT '通報' AS BAN_TYPE, \
						   IL.* \
					FROM ( \
						SELECT IL_GETNAME_NEW \
						FROM V_BLFO_JOIN_IL \
						GROUP BY IL_GETNAME_NEW \
					) V_BLFO_JOIN_IL \
					JOIN ( \
						SELECT *, \
						   	   CONVERT(varchar, OL_IMPORTDT, 23 ) AS 'OL_IMPORTDT_EX' \
						FROM ITEM_LIST \
						JOIN ORDER_LIST ON OL_SEQ = IL_SEQ \
						/*只抓今天*/ \
						WHERE '"+pParams["IMPORTDT_FROM"]+"' <= OL_IMPORTDT AND OL_IMPORTDT <= '"+pParams["IMPORTDT_TOXX"]+"' \
					) IL ON \
					IL.IL_GETNAME_NEW = V_BLFO_JOIN_IL.IL_GETNAME_NEW \
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
						JOIN ORDER_LIST ON OL_SEQ = IL_SEQ \
						/*只抓今天*/ \
						WHERE '"+pParams["IMPORTDT_FROM"]+"' <= OL_IMPORTDT AND OL_IMPORTDT <= '"+pParams["IMPORTDT_TOXX"]+"' \
					) IL ON \
					IL.IL_GETNAME_NEW = BLFL.BLFL_GETNAME \
					WHERE BLFL.BLFL_TRACK = 1 ",
		/**
		 * 組合G
		 * 收件人或公司
		 */
		_CaseG = "SELECT '通報' AS BAN_TYPE, \
						   IL.* \
					FROM ( \
						SELECT IL_GETADDRESS \
						FROM V_BLFO_JOIN_IL \
						GROUP BY IL_GETADDRESS \
					) V_BLFO_JOIN_IL \
					JOIN ( \
						SELECT *, \
						   	   CONVERT(varchar, OL_IMPORTDT, 23 ) AS 'OL_IMPORTDT_EX' \
						FROM ITEM_LIST \
						JOIN ORDER_LIST ON OL_SEQ = IL_SEQ \
						/*只抓今天*/ \
						WHERE '"+pParams["IMPORTDT_FROM"]+"' <= OL_IMPORTDT AND OL_IMPORTDT <= '"+pParams["IMPORTDT_TOXX"]+"' \
					) IL ON \
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
						JOIN ORDER_LIST ON OL_SEQ = IL_SEQ \
						/*只抓今天*/ \
						WHERE '"+pParams["IMPORTDT_FROM"]+"' <= OL_IMPORTDT AND OL_IMPORTDT <= '"+pParams["IMPORTDT_TOXX"]+"' \
					) IL ON \
					IL.IL_GETADDRESS = BLFL.BLFL_GETADDRESS \
					WHERE BLFL.BLFL_TRACK = 1 ",
		/**
		 * 組合H
		 * 收件人或公司
		 */
		_CaseH = "SELECT '通報' AS BAN_TYPE, \
						   IL.* \
					FROM ( \
						SELECT IL_GETADDRESS_NEW \
						FROM V_BLFO_JOIN_IL \
						GROUP BY IL_GETADDRESS_NEW \
					) V_BLFO_JOIN_IL \
					JOIN ( \
						SELECT *, \
						   	   CONVERT(varchar, OL_IMPORTDT, 23 ) AS 'OL_IMPORTDT_EX' \
						FROM ITEM_LIST \
						JOIN ORDER_LIST ON OL_SEQ = IL_SEQ \
						/*只抓今天*/ \
						WHERE '"+pParams["IMPORTDT_FROM"]+"' <= OL_IMPORTDT AND OL_IMPORTDT <= '"+pParams["IMPORTDT_TOXX"]+"' \
					) IL ON \
					IL.IL_GETADDRESS_NEW = V_BLFO_JOIN_IL.IL_GETADDRESS_NEW \
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
						JOIN ORDER_LIST ON OL_SEQ = IL_SEQ \
						/*只抓今天*/ \
						WHERE '"+pParams["IMPORTDT_FROM"]+"' <= OL_IMPORTDT AND OL_IMPORTDT <= '"+pParams["IMPORTDT_TOXX"]+"' \
					) IL ON \
					IL.IL_GETADDRESS_NEW = BLFL.BLFL_GETADDRESS \
					WHERE BLFL.BLFL_TRACK = 1 ";

	switch(pQueryname){
		case "SelectCaseACount":
			_SQLCommand += "SELECT COUNT(1) AS COUNT \
							FROM ( "+ _CaseA + " ) A \
							WHERE 1 = 1 ";

			delete pParams["IMPORTDT_FROM"];
			delete pParams["IMPORTDT_TOXX"];
			break;
		case "SelectCaseBCount":
			_SQLCommand += "SELECT COUNT(1) AS COUNT \
							FROM ( "+ _CaseB + " ) B \
							WHERE 1 = 1 ";

			delete pParams["IMPORTDT_FROM"];
			delete pParams["IMPORTDT_TOXX"];
			break;
		case "SelectCaseCCount":
			_SQLCommand += "SELECT COUNT(1) AS COUNT \
							FROM ( "+ _CaseC + " ) C \
							WHERE 1 = 1 ";

			delete pParams["IMPORTDT_FROM"];
			delete pParams["IMPORTDT_TOXX"];
			break;
		case "SelectCaseDCount":
			_SQLCommand += "SELECT COUNT(1) AS COUNT \
							FROM ( "+ _CaseD + " ) D \
							WHERE 1 = 1 ";

			delete pParams["IMPORTDT_FROM"];
			delete pParams["IMPORTDT_TOXX"];
			break;
		case "SelectCaseECount":
			_SQLCommand += "SELECT COUNT(1) AS COUNT \
							FROM ( "+ _CaseE + " ) E \
							WHERE 1 = 1 ";

			delete pParams["IMPORTDT_FROM"];
			delete pParams["IMPORTDT_TOXX"];
			break;
		case "SelectCaseFCount":
			_SQLCommand += "SELECT COUNT(1) AS COUNT \
							FROM ( "+ _CaseF + " ) F \
							WHERE 1 = 1 ";

			delete pParams["IMPORTDT_FROM"];
			delete pParams["IMPORTDT_TOXX"];
			break;
		case "SelectCaseGCount":
			_SQLCommand += "SELECT COUNT(1) AS COUNT \
							FROM ( "+ _CaseG + " ) G \
							WHERE 1 = 1 ";

			delete pParams["IMPORTDT_FROM"];
			delete pParams["IMPORTDT_TOXX"];
			break;
		case "SelectCaseHCount":
			_SQLCommand += "SELECT COUNT(1) AS COUNT \
							FROM ( "+ _CaseH + " ) H \
							WHERE 1 = 1 ";

			delete pParams["IMPORTDT_FROM"];
			delete pParams["IMPORTDT_TOXX"];
			break;
		case "SelectILCount":
			_SQLCommand += "SELECT COUNT(1) AS COUNT \
							FROM ( \
								SELECT * \
								FROM ITEM_LIST \
								JOIN ORDER_LIST ON OL_SEQ = IL_SEQ \
								/*只抓今天*/ \
								WHERE '"+pParams["IMPORTDT_FROM"]+"' <= OL_IMPORTDT AND OL_IMPORTDT <= '"+pParams["IMPORTDT_TOXX"]+"' \
							) IN_IL ";

			delete pParams["IMPORTDT_FROM"];
			delete pParams["IMPORTDT_TOXX"];
			break;
		case "SelectCaseA":
			_SQLCommand += "SELECT \
									( \
										SELECT COUNT(1) \
										FROM ( \
											SELECT * \
											FROM ITEM_LIST \
											JOIN ORDER_LIST ON OL_SEQ = IL_SEQ \
											/*不包含今天*/ \
											WHERE OL_IMPORTDT < '"+pParams["IMPORTDT_FROM"]+"' \
										) IN_IL \
										WHERE IN_IL.IL_GETNAME = OUT_IL.IL_GETNAME AND IN_IL.IL_GETADDRESS = OUT_IL.IL_GETADDRESS \
									) AS 'IL_COUNT', \
									OUT_IL.*, \
						   			CO_NAME \
							FROM ( " + _CaseA + " ) OUT_IL \
							/*行家中文名稱*/ \
							LEFT JOIN COMPY_INFO ON CO_CODE = OUT_IL.OL_CO_CODE \
							ORDER BY OUT_IL.IL_GETNAME DESC ";

			delete pParams["IMPORTDT_FROM"];
			delete pParams["IMPORTDT_TOXX"];
			break;
		case "SelectCaseB":
			_SQLCommand += "SELECT \
									( \
										SELECT COUNT(1) \
										FROM ( \
											SELECT * \
											FROM ITEM_LIST \
											JOIN ORDER_LIST ON OL_SEQ = IL_SEQ \
											/*不包含今天*/ \
											WHERE OL_IMPORTDT < '"+pParams["IMPORTDT_FROM"]+"' \
										) IN_IL \
										WHERE IN_IL.IL_GETADDRESS = OUT_IL.IL_GETADDRESS AND IN_IL.IL_GETTEL = OUT_IL.IL_GETTEL \
									) AS 'IL_COUNT', \
									OUT_IL.*, \
						   			CO_NAME \
							FROM ( " + _CaseB + " ) OUT_IL \
							/*行家中文名稱*/ \
							LEFT JOIN COMPY_INFO ON CO_CODE = OUT_IL.OL_CO_CODE \
							ORDER BY OUT_IL.IL_GETNAME DESC ";
							
			delete pParams["IMPORTDT_FROM"];
			delete pParams["IMPORTDT_TOXX"];
			break;
		case "SelectCaseC":
			_SQLCommand += "SELECT \
									( \
										SELECT COUNT(1) \
										FROM  ( \
											SELECT * \
											FROM ITEM_LIST \
											JOIN ORDER_LIST ON OL_SEQ = IL_SEQ \
											/*不包含今天*/ \
											WHERE OL_IMPORTDT < '"+pParams["IMPORTDT_FROM"]+"' \
										) IN_IL \
										WHERE IN_IL.IL_GETNAME = OUT_IL.IL_GETNAME AND IN_IL.IL_GETTEL = OUT_IL.IL_GETTEL \
									) AS 'IL_COUNT', \
									OUT_IL.*, \
						   			CO_NAME \
							FROM ( " + _CaseC + " ) OUT_IL \
							/*行家中文名稱*/ \
							LEFT JOIN COMPY_INFO ON CO_CODE = OUT_IL.OL_CO_CODE \
							ORDER BY OUT_IL.IL_GETNAME DESC ";
							
			delete pParams["IMPORTDT_FROM"];
			delete pParams["IMPORTDT_TOXX"];
			break;
		case "SelectCaseD":
			_SQLCommand += "SELECT \
									( \
										SELECT COUNT(1) \
										FROM  ( \
											SELECT * \
											FROM ITEM_LIST \
											JOIN ORDER_LIST ON OL_SEQ = IL_SEQ \
											/*不包含今天*/ \
											WHERE OL_IMPORTDT < '"+pParams["IMPORTDT_FROM"]+"' \
										) IN_IL \
										WHERE IN_IL.IL_GETNAME = OUT_IL.IL_GETNAME AND IN_IL.IL_GETADDRESS = OUT_IL.IL_GETADDRESS AND IN_IL.IL_GETTEL = OUT_IL.IL_GETTEL \
									) AS 'IL_COUNT', \
									OUT_IL.*, \
						   			CO_NAME \
							FROM ( " + _CaseD + " ) OUT_IL \
							/*行家中文名稱*/ \
							LEFT JOIN COMPY_INFO ON CO_CODE = OUT_IL.OL_CO_CODE \
							ORDER BY OUT_IL.IL_GETNAME DESC ";
							
			delete pParams["IMPORTDT_FROM"];
			delete pParams["IMPORTDT_TOXX"];
			break;
		case "SelectCaseE":
			_SQLCommand += "SELECT \
									( \
										SELECT COUNT(1) \
										FROM  ( \
											SELECT * \
											FROM ITEM_LIST \
											JOIN ORDER_LIST ON OL_SEQ = IL_SEQ \
											/*不包含今天*/ \
											WHERE OL_IMPORTDT < '"+pParams["IMPORTDT_FROM"]+"' \
										) IN_IL \
										WHERE IN_IL.IL_GETNAME = OUT_IL.IL_GETNAME \
									) AS 'IL_COUNT', \
									OUT_IL.*, \
						   			CO_NAME \
							FROM ( " + _CaseE + " ) OUT_IL \
							/*行家中文名稱*/ \
							LEFT JOIN COMPY_INFO ON CO_CODE = OUT_IL.OL_CO_CODE \
							ORDER BY OUT_IL.IL_GETNAME DESC ";
							
			delete pParams["IMPORTDT_FROM"];
			delete pParams["IMPORTDT_TOXX"];
			break;
		case "SelectCaseF":
			_SQLCommand += "SELECT \
									( \
										SELECT COUNT(1) \
										FROM  ( \
											SELECT * \
											FROM ITEM_LIST \
											JOIN ORDER_LIST ON OL_SEQ = IL_SEQ \
											/*不包含今天*/ \
											WHERE OL_IMPORTDT < '"+pParams["IMPORTDT_FROM"]+"' \
										) IN_IL \
										WHERE IN_IL.IL_GETNAME_NEW = OUT_IL.IL_GETNAME_NEW \
									) AS 'IL_COUNT', \
									OUT_IL.*, \
						   			CO_NAME \
							FROM ( " + _CaseF + " ) OUT_IL \
							/*行家中文名稱*/ \
							LEFT JOIN COMPY_INFO ON CO_CODE = OUT_IL.OL_CO_CODE \
							ORDER BY OUT_IL.IL_GETNAME DESC ";
							
			delete pParams["IMPORTDT_FROM"];
			delete pParams["IMPORTDT_TOXX"];
			break;
		case "SelectCaseG":
			_SQLCommand += "SELECT \
									( \
										SELECT COUNT(1) \
										FROM  ( \
											SELECT * \
											FROM ITEM_LIST \
											JOIN ORDER_LIST ON OL_SEQ = IL_SEQ \
											/*不包含今天*/ \
											WHERE OL_IMPORTDT < '"+pParams["IMPORTDT_FROM"]+"' \
										) IN_IL \
										WHERE IN_IL.IL_GETADDRESS = OUT_IL.IL_GETADDRESS \
									) AS 'IL_COUNT', \
									OUT_IL.*, \
						   			CO_NAME \
							FROM ( " + _CaseG + " ) OUT_IL \
							/*行家中文名稱*/ \
							LEFT JOIN COMPY_INFO ON CO_CODE = OUT_IL.OL_CO_CODE \
							ORDER BY OUT_IL.IL_GETNAME DESC ";
							
			delete pParams["IMPORTDT_FROM"];
			delete pParams["IMPORTDT_TOXX"];
			break;
		case "SelectCaseH":
			_SQLCommand += "SELECT \
									( \
										SELECT COUNT(1) \
										FROM  ( \
											SELECT * \
											FROM ITEM_LIST \
											JOIN ORDER_LIST ON OL_SEQ = IL_SEQ \
											/*不包含今天*/ \
											WHERE OL_IMPORTDT < '"+pParams["IMPORTDT_FROM"]+"' \
										) IN_IL \
										WHERE IN_IL.IL_GETADDRESS_NEW = OUT_IL.IL_GETADDRESS_NEW \
									) AS 'IL_COUNT', \
									OUT_IL.*, \
						   			CO_NAME \
							FROM ( " + _CaseH + " ) OUT_IL \
							/*行家中文名稱*/ \
							LEFT JOIN COMPY_INFO ON CO_CODE = OUT_IL.OL_CO_CODE \
							ORDER BY OUT_IL.IL_GETNAME DESC ";
							
			delete pParams["IMPORTDT_FROM"];
			delete pParams["IMPORTDT_TOXX"];
			break;
		case "SelectItemList":
			_SQLCommand += "SELECT * \
							FROM ( \
								SELECT * \
								FROM ITEM_LIST \
								JOIN ORDER_LIST ON OL_SEQ = IL_SEQ \
								/*不包含今天*/ \
								WHERE OL_IMPORTDT < '"+pParams["IMPORTDT_FROM"]+"' \
							) IN_IL \
							WHERE 1=1 ";
							
			if(pParams["IL_GETADDRESS"] !== undefined){
				_SQLCommand += " AND IL_GETADDRESS = @IL_GETADDRESS";
			}
			if(pParams["IL_GETADDRESS_NEW"] !== undefined){
				_SQLCommand += " AND IL_GETADDRESS_NEW = @IL_GETADDRESS_NEW";
			}
			if(pParams["IL_GETTEL"] !== undefined){
				_SQLCommand += " AND IL_GETTEL = @IL_GETTEL";
			}
			if(pParams["IL_GETNAME"] !== undefined){
				_SQLCommand += " AND IL_GETNAME = @IL_GETNAME";
			}
			if(pParams["IL_GETNAME_NEW"] !== undefined){
				_SQLCommand += " AND IL_GETNAME_NEW = @IL_GETNAME_NEW";
			}

			_SQLCommand += " ORDER BY IL_GETNAME DESC ";
			
			delete pParams["IMPORTDT_FROM"];

			break;
			
	}

	return _SQLCommand;
};