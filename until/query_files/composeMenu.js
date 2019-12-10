module.exports = function(pQueryname, pParams){
	var _SQLCommand = "";

	switch(pQueryname){
		case "SelectMaxLvl":
			_SQLCommand += "SELECT MAX(SS_LVL) AS MAXLVL FROM SYS_SUBSYS \
							WHERE SS_STS = 0; ";
			break;
		case "SelectProgm":
			_SQLCommand += "SELECT \
							SYS_SUBSYS.SS_SYSID,SYS_SUBSYS.SS_NAME,SYS_SUBSYS.SS_LVL,SYS_SUBSYS.SS_SEQ, \
							SYS_SUBSYS.SS_ICON,SYS_SUBSYS.SS_PATH, \
							SYS_PROGM.SP_PROG,SYS_PROGM.SP_SEQ,SYS_PROGM.SP_PNAME,SYS_PROGM.SP_ICON, \
							(SYS_SUBSYS.SS_PATH + '.' + SYS_PROGM.SP_PROG) AS PROG_PATH, \
							(SS_LVL + 1) AS SP_LVL \
							FROM ( \
							SELECT DISTINCT SP_PSYSID FROM SYS_PROGM \
							WHERE SP_STS = 0 ) AS TMP \
							JOIN SYS_SUBSYS ON TMP.SP_PSYSID = SS_SYSID AND SS_STS = 0 \
							LEFT JOIN SYS_PROGM ON SYS_PROGM.SP_PSYSID = SYS_SUBSYS.SS_SYSID AND SYS_PROGM.SP_STS = 0 \
							ORDER BY SYS_SUBSYS.SS_LVL,SYS_SUBSYS.SS_SEQ,SYS_PROGM.SP_SEQ ASC; ";
			break;
		case "SelectSubsys":
			_SQLCommand += "SELECT * FROM ( \
							SELECT DISTINCT SP_PSYSID FROM SYS_PROGM \
							WHERE SP_STS = 0 ) AS TMP \
							JOIN SYS_SUBSYS ON TMP.SP_PSYSID = SS_SYSID AND SS_STS = 0 \
							ORDER BY SS_LVL, SS_SEQ ASC; ";
			break;
		case "GetUserRight":
			_SQLCommand += "EXEC GetUserRight @U_ID";
			break;
	}

	return _SQLCommand;
};