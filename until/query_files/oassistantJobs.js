module.exports = function(pQueryname, pParams){
	var _SQLCommand = "";

	switch(pQueryname){
		case "SelectOPullGoods":
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
									O_OL_ILSTATUS, \
									O_PG_SEQ, \
									O_PG_NEWSMALLNO, \
									O_PG_SMALLNO, \
									O_PG_MOVED, \
									O_PG_MOVED_SEQ, \
									O_PG_MASTER, \
									O_PG_PASSCODE, \
									O_PG_VOYSEQ,\
									O_PG_MVNO, \
									O_PG_COMPID, \
									O_PG_ARRLOCATIONID, \
									O_PG_POST, \
									O_PG_PACKAGELOCATIONID, \
									O_PG_BOATID, \
									O_PG_REASON, \
									O_PG_MOVE_USER, \
									O_PG_MOVE_DATETIME, \
									CONVERT(varchar, O_OL_IMPORTDT, 23 ) AS 'O_OL_IMPORTDT_EX', \
									O_CO_NAME, \
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
									W2_OE.O_OE_PRINCIPAL AS 'OW2_PRINCIPAL', \
									CAST(0 AS BIT) AS isSelected, \
									( \
										SELECT COUNT(O_ILE_ID) \
										FROM O_ITEM_LIST_EXPORTER \
										WHERE O_ILE_SEQ = O_OL_SEQ \
										AND O_ILE_TYPE != '11' \
									) AS 'TRADE_EXPORT' \
							FROM ( \
								SELECT * \
								FROM O_ORDER_LIST \
								OUTTER JOIN O_COMPY_INFO ON O_CO_CODE = O_OL_CO_CODE \
							) O_ORDER_LIST \
							JOIN O_PULL_GOODS ON O_PG_SEQ = O_OL_SEQ \
							/*報機單*/ \
							LEFT JOIN V_O_ORDER_EDITOR_BY_R W2_OE ON W2_OE.O_OE_SEQ = O_ORDER_LIST.O_OL_SEQ \
						    WHERE 1=1";
							
			if(pParams["Seq"] !== undefined){
				_SQLCommand += " AND O_PG_SEQ IN ("+pParams["Seq"]+") ";
				delete pParams["Seq"];
			}
							
			if(pParams["NewSmallNo"] !== undefined){
				_SQLCommand += " AND O_PG_NEWSMALLNO IN ("+pParams["NewSmallNo"]+") ";
				delete pParams["NewSmallNo"];
			}
							
			if(pParams["SmallNo"] !== undefined){
				_SQLCommand += " AND O_PG_SMALLNO IN ("+pParams["SmallNo"]+") ";
				delete pParams["SmallNo"];
			}

			_SQLCommand += " ORDER BY O_PG_CR_DATETIME DESC ";

			break;

		case "SelectMasterToBeFilled":
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
									( \
										SELECT O_CO_NAME \
										FROM O_COMPY_INFO \
										WHERE O_OL_CO_CODE = O_CO_CODE \
									) AS 'O_CO_NAME' \
							FROM O_ORDER_LIST ";
							
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
							AND (O_OL_MASTER = '' OR O_OL_MASTER IS NULL) ";

			break;

		case "SelectSmallNoDetail":
			_SQLCommand += "SELECT * \
							FROM O_ITEM_LIST \
						    WHERE 1=1";

			if(pParams["O_IL_SEQ"] !== undefined){
				_SQLCommand += " AND O_IL_SEQ = @O_IL_SEQ ";
			}

			if(pParams["O_IL_NEWSMALLNO"] !== undefined){
				_SQLCommand += " AND O_IL_NEWSMALLNO = @O_IL_NEWSMALLNO ";
			}

			if(pParams["O_IL_SMALLNO"] !== undefined){
				_SQLCommand += " AND O_IL_SMALLNO = @O_IL_SMALLNO ";
			}

			// _SQLCommand += " ORDER BY IL_BAGNO ";

			break;

		case "CopyOItemList":
			_SQLCommand += "SELECT @O_IL_SEQ AS O_IL_SEQ, \
									O_IL_G1, \
									O_IL_NEWSMALLNO, \
									O_IL_POSTNO, \
									O_IL_CUSTID, \
									O_IL_MERGENO, \
									O_IL_SMALLNO, \
									O_IL_PRICECONDITON, \
									O_IL_CURRENCY, \
									O_IL_CROSSWEIGHT, \
									O_IL_NEWCROSSWEIGHT, \
									O_IL_CTN, \
									O_IL_NEWCTN, \
									O_IL_CTNUNIT, \
									O_IL_MARK, \
									O_IL_SMALLNO_ID, \
									O_IL_NATURE, \
									O_IL_NATURE_NEW, \
									O_IL_TAX, \
									O_IL_TAX2, \
									O_IL_TAXRATE, \
									O_IL_TAXRATE2, \
									O_IL_BRAND, \
									O_IL_FORMAT, \
									O_IL_NETWEIGHT, \
									O_IL_NETWEIGHT_NEW, \
									O_IL_COUNT, \
									O_IL_NEWCOUNT, \
									O_IL_PRICEUNIT, \
									O_IL_NEWPRICEUNIT, \
									O_IL_PCS, \
									O_IL_NEWPCS, \
									O_IL_INVOICECOST, \
									O_IL_INVOICECOST2, \
									O_IL_FINALCOST, \
									O_IL_VOLUME, \
									O_IL_VOLUMEUNIT, \
									O_IL_COUNTRY, \
									O_IL_SENDENAME, \
									O_IL_NEWSENDENAME, \
									O_IL_COUNTRYID, \
									O_IL_NEWCOUNTRYID, \
									O_IL_SENDADDRESS, \
									O_IL_NEWSENDADDRESS, \
									O_IL_GETID, \
									O_IL_GETNO, \
									O_IL_GETENAME, \
									O_IL_GETPHONE, \
									O_IL_GETADDRESS, \
									O_IL_DWKIND, \
									O_IL_DWNUMBER, \
									O_IL_DWTYPE, \
									O_IL_SEALNUMBER, \
									O_IL_DECLAREMEMO1, \
									O_IL_DECLAREMEMO2, \
									O_IL_TAXPAYMENTMEMO, \
									O_IL_CR_DATETIME, \
									O_IL_CR_USER, \
									O_IL_UP_DATETIME, \
									O_IL_UP_USER, \
									O_IL_ORDERINDEX, \
									O_IL_REMARK, \
									O_IL_SUPPLEMENT_COUNT \
							FROM O_ITEM_LIST \
						    WHERE 1=1";

			if(pParams["ItemListPK"] !== undefined){

				var _sql = [];

				for(var i in pParams["ItemListPK"]){
					_sql.push("(  O_IL_SEQ='" + pParams["ItemListPK"][i].SEQ + "' \
									AND O_IL_NEWSMALLNO='" + pParams["ItemListPK"][i].NEWSMALLNO + "' \
									AND O_IL_SMALLNO='" + pParams["ItemListPK"][i].SMALLNO + "')");
				}

				_SQLCommand += " AND (" + _sql.join(" OR ") +") ";
			}

			break;

		case "CopyOSpecialGoods":
			_SQLCommand += "SELECT @O_SPG_SEQ AS O_SPG_SEQ, \
									O_SPG_SMALLNO, \
									O_SPG_NEWSMALLNO, \
									O_SPG_TYPE, \
									O_SPG_CR_USER, \
									O_SPG_CR_DATETIME, \
									O_SPG_UP_USER, \
									O_SPG_UP_DATETIME \
							FROM O_SPECIAL_GOODS \
							INNER JOIN O_ITEM_LIST ON \
							O_IL_SEQ = O_SPG_SEQ AND \
							O_IL_NEWSMALLNO = O_SPG_NEWSMALLNO AND \
							O_IL_SMALLNO = O_SPG_SMALLNO \
						    WHERE 1=1";

			if(pParams["ItemListPK"] !== undefined){

				var _sql = [];

				for(var i in pParams["ItemListPK"]){
					_sql.push("(  O_IL_SEQ='" + pParams["ItemListPK"][i].SEQ + "' \
									AND O_IL_NEWSMALLNO='" + pParams["ItemListPK"][i].NEWSMALLNO + "' \
									AND O_IL_SMALLNO='" + pParams["ItemListPK"][i].SMALLNO + "')");
				}

				_SQLCommand += " AND (" + _sql.join(" OR ") +") ";
			}

			break;
	}

	return _SQLCommand;
};