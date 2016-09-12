package com.kc.module.model;

import java.util.ArrayList;
import java.util.List;

import com.jfinal.kit.JsonKit;
import com.jfinal.kit.StrKit;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.StringUtils;

public class ModuleProcessInfo extends ModelFinal<ModuleProcessInfo> {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;

    public static ModuleProcessInfo dao = new ModuleProcessInfo();

    /**
     * 查找模具的工件清单，已经有机台的工件
     * 
     * @param moduleBarcode
     * @return
     */
    public List<ModuleProcessInfo> moduleMacPartList(String moduleResumeId, String posid) {
        StringBuilder sql = new StringBuilder();
        // TODO 可以做成视图
        sql.append("SELECT MI.ID AS INFOID, DD.BATCHNO, MC.CRAFTNAME, ML.PARTLISTCODE, MPS.NAME AS MACSTATE, ");
        sql.append("MI.PARTBARLISTCODE,MI.MODULERESUMEID,                                                    ");
        sql.append("NVL(MPSI.NAME, '待加工') AS PARTSTATE, EI.EMPNAME");// MES.STARTTIME,
                                                                     // MES.ENDTIME,
                                                                     // MES.EVALUATE
        sql.append(" FROM ( SELECT ID, PARTBARLISTCODE, MODULERESUMEID , DEVICEPARTID, PARTSTATEID          ");
        sql.append("        , REMARK FROM MD_PROCESS_INFO M WHERE MODULERESUMEID = ?                        ");
        sql.append("        AND M.CURRENTDEPTID IN (SELECT ID FROM REGION_DEPART WHERE STEPID LIKE ");
        sql.append("(SELECT STEPID ||'%' FROM REGION_DEPART WHERE ID=?))");
        sql.append(") MI  LEFT JOIN MD_PART_LIST ML ON ML.PARTBARLISTCODE = MI.PARTBARLISTCODE                   ");
        sql.append(" LEFT JOIN DEVICE_DEPART DD ON DD.ID = MI.DEVICEPARTID                                  ");
        // sql.append(" LEFT JOIN DEVICE_INFO DI ON DI.ID = DD.DEVICEID                                        ");
        sql.append(" LEFT JOIN MD_PROCESS_STATE MPS ON MPS.ID = DD.STATEID                                  ");
        sql.append(" LEFT JOIN MD_PROCESS_STATE MPSI ON MPSI.ID = MI.PARTSTATEID                            ");
        sql.append(" LEFT JOIN EMPLOYEE_INFO EI ON EI.ID = DD.EMPID                                         ");
        sql.append(" LEFT JOIN MD_DEVICE_CRAFT MDC ON MDC.DEVICEID = DD.DEVICEID                            ");
        sql.append(" LEFT JOIN MD_CRAFT MC ON MC.ID = MDC.CRAFTID                                           ");
        // sql.append("     LEFT JOIN MD_EST_SCHEDULE MES ON MES.PARTID = MI.PARTBARLISTCODE                   ");
        // sql.append(" AND MDC.CRAFTID = MES.CRAFTID                                                          ");
        // sql.append(" AND MES.MODULERESUMEID = MI.MODULERESUMEID ORDER BY ML.PARTLISTCODE                    ");

        sql.append("  ORDER BY ML.PARTLISTCODE                    ");

        return find(sql.toString(), moduleResumeId, posid);
    }

    /**
     * 得到本单位的未安排机台的所有工件
     * 
     * @param moduleResumeId
     * @param posid
     * @return
     */
    public List<ModuleProcessInfo> modulePartList(String moduleResumeId, String posid) {
        StringBuilder sql = new StringBuilder();
        // TODO 可以做成视图
        // sql.append("SELECT MPL.PARTLISTCODE, MES.STARTTIME, MES.ENDTIME, MES.EVALUATE, MES.CRAFTNAME");
        // sql.append("   , MI.INFOID, MPS.NAME AS PARTSTATE FROM (");
        // sql.append("      SELECT ID AS INFOID, PARTBARLISTCODE, MODULERESUMEID, PARTSTATEID, REMARK");
        // sql.append("      FROM MD_PROCESS_INFO M WHERE MODULERESUMEID = ?  AND M.CURRENTDEPTID = ? ");
        // sql.append("         AND M.DEVICEPARTID IS NULL ) MI ");
        // sql.append(" LEFT JOIN MD_PROCESS_STATE MPS ON MPS.ID = MI.PARTSTATEID  ");
        // sql.append(" JOIN MD_PART_LIST MPL ON MPL.PARTBARLISTCODE = MI.PARTBARLISTCODE  ");
        // sql.append("    LEFT JOIN ( SELECT ME.*, MC.CRAFTNAME ");
        // sql.append("       FROM MD_EST_SCHEDULE ME, MD_CRAFT MC ");
        // sql.append("      WHERE ME.MODULERESUMEID = ? ");
        // sql.append("           AND ME.CRAFTID IN (SELECT DISTINCT CRAFTID ");
        // sql.append("              FROM MD_DEVICE_CRAFT ");
        // sql.append("              WHERE DEVICEID IN (SELECT DEVICEID ");
        // sql.append("                  FROM DEVICE_DEPART ");
        // sql.append("                  WHERE PARTID = ?)) ");
        // sql.append("          AND ME.CRAFTID = MC.ID ");
        // sql.append("  ) MES ON MES.PARTID = MI.PARTBARLISTCODE  ");
        // sql.append(" ORDER BY MPL.PARTLISTCODE, MES.STARTTIME ");

        sql.append("SELECT MPL.PARTLISTCODE, MI.INFOID, nvl(MPS.NAME, '待加工') AS PARTSTATE ");
        sql.append("FROM (SELECT ID AS INFOID, PARTBARLISTCODE, MODULERESUMEID, PARTSTATEID, REMARK ");
        sql.append("    FROM MD_PROCESS_INFO M ");
        sql.append("    WHERE MODULERESUMEID = ? ");
        sql.append("        AND M.CURRENTDEPTID = ? ");
        sql.append("        AND M.DEVICEPARTID IS NULL ");
        sql.append("    ) MI LEFT JOIN MD_PROCESS_STATE MPS ON MPS.ID = MI.PARTSTATEID LEFT JOIN  ");
        sql.append("    MD_PART_LIST MPL ON MPL.PARTBARLISTCODE = MI.PARTBARLISTCODE ");
        sql.append("ORDER BY MPL.PARTLISTCODE ");

        return find(sql.toString(), moduleResumeId, posid);
    }

    /**
     * 查询工件排程信息
     * 
     * @param posId
     *            加工单位
     * @param moduleCode
     *            模具工号
     * @param moduleState
     *            模具状态
     * @param partListbarcode
     *            工件条码号
     * @return
     */
    public List<ModuleProcessInfo> modulePartList(String posId, String moduleResumeId, String moduleState) {
        List<String> params = new ArrayList<String>();
        StringBuilder sql = new StringBuilder();

        sql.append("SELECT M.MODULECODE,M.PARTLISTCODE,M.INFOID,");
        sql.append("M.PARTBARLISTCODE,M.PARTSTATEID,M.DEVICEEMPID,M.MODULERESUMEID,");
        sql.append("NVL(M.STARTTIME,SYSDATE) STARTTIME,");// 如果开始为空时表示为没有指定单排程
        sql.append("NVL(M.ENDTIME,SYSDATE) ENDTIME,");
        sql.append("NVL(M.DURATION,-1) DURATION,M.CRAFTID,M.CRAFTNAME,nvl(m.name,'待加工') name,M.RESUMESTATE");

        sql.append("   FROM ( SELECT ML.MODULECODE, MPL.PARTLISTCODE, mm.*, MC.CRAFTNAME || '(' ||");
        sql.append("     MC.CRAFTCODE || ')' AS CRAFTNAME, MPS.NAME, MR.RESUMESTATE");
        sql.append("    FROM (");
        sql.append("        SELECT MPI.*, MES.STARTTIME, MES.ENDTIME, MES.DURATION, mes.craftid");
        sql.append("        FROM (");
        sql.append("            SELECT ID AS INFOID, PARTBARLISTCODE, PARTSTATEID, DEVICEEMPID, MODULERESUMEID");
        sql.append("            FROM MD_PROCESS_INFO ");

        assignDeptOrPart(params, sql, posId, moduleResumeId);

        sql.append("        ) MPI");
        sql.append("            LEFT JOIN MD_EST_SCHEDULE MES ON MES.PARTID = MPI.PARTBARLISTCODE");
        sql.append("        AND MES.MODULERESUMEID = MPI.MODULERESUMEID ");

        // 如果指定了加工单位,可以查找出在本单位并有可能没有排程的工件
        sql.append(StrKit.notBlank(posId) ? "" : " WHERE MES.STARTTIME IS NOT NULL");

        sql.append("    ) mm");

        if (StrKit.notBlank(posId)) {

            sql.append(" RIGHT JOIN (SELECT * FROM MD_CRAFT WHERE ID IN (SELECT DISTINCT CRAFTID ");
            sql.append("FROM MD_DEVICE_CRAFT WHERE DEVICEID IN (SELECT DD.DEVICEID  ");
            sql.append("FROM DEVICE_DEPART DD WHERE DD.PARTID = ? ))) MC ");

            params.add(posId);

        } else {
            sql.append("    LEFT JOIN MD_CRAFT MC");
        }

        sql.append("    ON MC.ID = mm.CRAFTID  ");

        // 如果指定了加工单位,可以查找出在本单位并有可能没有排程的工件
        sql.append(StrKit.notBlank(posId) ? " or mm.STARTTIME is null " : "");

        sql.append(" LEFT JOIN MD_PART_LIST MPL ON MPL.PARTBARLISTCODE = mm.PARTBARLISTCODE ");
        sql.append("    LEFT JOIN MD_RESUME MR ON MR.ID = mm.MODULERESUMEID ");

        // 指定模具状态查询
        if (StrKit.notBlank(moduleState)) {
            String[] states = moduleState.split(";|,|&");

            sql.append("AND MR.RESUMESTATE in (");

            for (int i = 0; i < states.length; i++) {
                sql.append("?").append(i == states.length - 1 ? "" : ",");
                params.add(states[i]);
            }

            sql.append(")");

        }

        sql.append("    LEFT JOIN MODULELIST ML ON ML.MODULEBARCODE = MR.MODULEBARCODE ");
        sql.append("        LEFT JOIN MD_PROCESS_STATE MPS ON MPS.ID = mm.PARTSTATEID ");
        sql.append(") M WHERE M.modulecode IS NOT NULL");

        if (params.size() == 0) {
            return find(sql.toString());
        } else {
            return find(sql.toString(), params.toArray());
        }

    }

    /**
     * 查询指定单或工件信息
     * 
     * @param posId
     * @param partListbarcode
     * @param params
     * @param sql
     */
    private void assignDeptOrPart(List<String> params, StringBuilder sql, String posId, String moduleResumeId) {
        if (StrKit.notBlank(posId) && StrKit.notBlank(moduleResumeId)) {
            sql.append("    WHERE CURRENTDEPTID =?  and MODULERESUMEID in (");
            params.add(posId);
            String[] modules = moduleResumeId.split(";|,|&");

            for (int i = 0; i < modules.length; i++) {
                sql.append("?").append(i == modules.length - 1 ? "" : ",");
                params.add(modules[i]);
            }
            sql.append(")");
        } else {
            // 指定加工单位查询
            if (StrKit.notBlank(posId)) {
                sql.append("    WHERE CURRENTDEPTID = ?");
                params.add(posId);
            }

            // 指定工号查询
            if (StrKit.notBlank(moduleResumeId)) {
                sql.append(" where MODULERESUMEID in (");

                String[] modules = moduleResumeId.split(";|,|&");

                for (int i = 0; i < modules.length; i++) {
                    sql.append("?").append(i == modules.length - 1 ? "" : ",");
                    params.add(modules[i]);
                }
                sql.append(")");
            }
        }
    }

    /**
     * 查找指定单位要规定时间内没有开工的工件<br>
     * 
     * query的取值与说明:
     * <ol>
     * <li>工件离开工时间</li>
     * <li>工件离完工时间</li>
     * <li>错过开工时间</li>
     * <li>错过完工时间</li>
     * </ol>
     * 
     * @param deptId
     * @param time
     * @return
     */
    public List<ModuleProcessInfo> findModulePartDeadLine(String deptId, int query, int time) {

        StringBuilder sql = new StringBuilder();

        sql.append("SELECT ML.MODULECODE, MPL.PARTLISTCODE, MC.* ");
        sql.append("FROM (SELECT MP.*, MES.STARTTIME, MES.ENDTIME, MES.DURATION, MES.EVALUATE ");
        sql.append("        , ( SELECT MCR.CRAFTNAME FROM MD_CRAFT MCR ");
        sql.append("            WHERE MCR.ID = MES.CRAFTID ");
        sql.append("            ) AS CRAFTNAME, ROUND((SYSDATE - MES.STARTTIME) * 24,0) AS DELAYTIME ");
        sql.append("    FROM ( SELECT MPI.PARTBARLISTCODE, MPI.MODULERESUMEID, CR.CRAFTID ");
        sql.append("        FROM (SELECT MPP.PARTBARLISTCODE, MPP.MODULERESUMEID, MPP.CURRENTDEPTID ");
        sql.append("            FROM (SELECT PARTBARLISTCODE, MODULERESUMEID, CURSORID, CURRENTDEPTID ");
        sql.append("                FROM MD_PROCESS_INFO WHERE CURRENTDEPTID IN (SELECT ID ");
        sql.append("                    FROM REGION_DEPART ");
        sql.append("                    WHERE STEPID LIKE ( ");
        sql.append("                        SELECT STEPID || '%' ");
        sql.append("                        FROM REGION_DEPART ");
        sql.append("                         WHERE ID = ?)) ");
        sql.append("            ) MPP LEFT JOIN MD_PROCESS_RESUME MPR ON MPR.ID = MPP.CURSORID  ");
        sql.append("            WHERE  ");

        switch (query) {
        case 1: {
            sql.append("MPR.LPARTSTATEID <> '20201'");
            break;
        }
        case 2: {
            sql.append("MPR.LPARTSTATEID = '20201' AND MPR.NPARTSTATEID IS NULL");
            break;
        }
        case 3: {
            sql.append("MPR.LPARTSTATEID <> '20201'");
            break;
        }
        case 4: {
            sql.append("MPR.LPARTSTATEID = '20201' AND MPR.NPARTSTATEID IS NULL");
            break;
        }
        }

        sql.append("        ) MPI, (SELECT DISTINCT CRAFTID, PARTID ");
        sql.append("            FROM DEVICE_DEPART ");
        sql.append("            WHERE PARTID IN (SELECT ID ");
        sql.append("                FROM REGION_DEPART ");
        sql.append("                WHERE STEPID LIKE ( ");
        sql.append("                    SELECT STEPID || '%' ");
        sql.append("                    FROM REGION_DEPART ");
        sql.append("                    WHERE ID = ? ");
        sql.append("                    )) ");
        sql.append("        ) CR WHERE CR.PARTID = MPI.CURRENTDEPTID ");
        sql.append("    ) MP LEFT JOIN MD_EST_SCHEDULE MES ON MES.PARTID = MP.PARTBARLISTCODE ");
        sql.append("    AND MES.CRAFTID = MP.CRAFTID ");
        sql.append("    AND MES.MODULERESUMEID = MP.MODULERESUMEID  ");

        switch (query) {
        case 1: {// 开工
            sql.append("    WHERE SYSDATE - MES.STARTTIME >= ? AND SYSDATE - MES.STARTTIME <=0");
            break;
        }
        case 2: {// 完工
            sql.append("    WHERE SYSDATE - MES.ENDTIME >= ? AND SYSDATE - MES.ENDTIME <=0");
            break;
        }
        case 3: {// 开工
            sql.append("    WHERE SYSDATE - MES.STARTTIME >= ? ");
            break;
        }
        case 4: {// 完工
            sql.append("    WHERE SYSDATE - MES.ENDTIME >= ? ");
            break;
        }
        }

        sql.append(") MC LEFT JOIN MD_PART_LIST MPL ON MPL.PARTBARLISTCODE = MC.PARTBARLISTCODE  ");
        sql.append("    LEFT JOIN MODULELIST ML ON ML.MODULEBARCODE = MPL.MODULEBARCODE  ");

        return find(sql.toString(), deptId, deptId, time);
    }

    /**
     * 获取正在加工的模具工号
     * 
     * @param modulecode
     * @return
     */
    public List<Record> getProcessModuleCodeList(boolean chk, String query) {
        StringBuilder builder = new StringBuilder();

        builder.append("SELECT c.MODULEBARCODE, c.MODULECODE, b.ID AS RESUMEID, d.NAME AS RESUMENAME ");
        builder.append("FROM MD_PROCESS_INFO a ");
        builder.append("LEFT JOIN MD_RESUME b ON a.MODULERESUMEID = b.ID ");
        builder.append("LEFT JOIN MODULELIST c ON b.MODULEBARCODE = c.MODULEBARCODE ");
        builder.append("LEFT JOIN MD_PROCESS_STATE d ON b.RESUMESTATE = d.ID WHERE c.MODULECODE ");
        builder.append(chk ? "c.GUESTCODE" : "c.MODULECODE");
        builder.append(" LIKE ?");

        List<Record> record = new ArrayList<Record>();

        Object modulebarcode = "";
        List<Record> rlist = Db.find(builder.toString(), (StringUtils.isEmpty(query) ? "" : query.toUpperCase() + "%"));
        for (Record r : rlist) {
            Object tmodulebarcode = r.get("MODULEBARCODE");
            if (StringUtils.isEmpty(tmodulebarcode)) {
                continue;
            }

            if (modulebarcode.equals(tmodulebarcode)) {
                continue;
            } else {
                Record rcd = new Record();
                rcd.set("MODULEBARCODE", tmodulebarcode)
                   .set("TEXT", StringUtils.parseString(r.get("MODULECODE")))
                   .set("ID", StringUtils.parseString(r.get("RESUMEID")))
                   .set("RESUMENAME", StringUtils.parseString(r.get("RESUMENAME")));

                record.add(rcd);
                modulebarcode = tmodulebarcode;
            }
        }

        return record;
    }

    public String getCurrentProcessModuleInfo(String resumeid) {
        // 初始化查询的SQL
        StringBuilder builder = new StringBuilder();

        builder.append("SELECT b.PARTLISTCODE AS PARTCODE, c.CNAMES AS PARTNAME, NVL((                 ");
        builder.append("        SELECT NAME                                                            ");
        builder.append("        FROM REGION_DEPART                                                     ");
        builder.append("        WHERE ID = d.CURRENTDEPTID                                             ");
        builder.append("        ), '未接收') AS PARTPLACE, NVL((                                         ");
        builder.append("        SELECT NAME                                                            ");
        builder.append("        FROM MD_PROCESS_STATE                                                  ");
        builder.append("        WHERE ID = d.PARTSTATEID                                               ");
        builder.append("        ), '未签收') AS PARTSTATE, NVL(a.ACTHOUR, 0) AS ACTHOUR                   ");
        builder.append("    , NVL(e.ESTHOUR, 0) AS ESTHOUR, NVL(CASE WHEN NVL(e.ESTHOUR, 0)            ");
        builder.append(" = 0 THEN 0 ELSE ROUND(a.ACTHOUR / e.ESTHOUR * 100, 3) END, 0) AS PER          ");
        builder.append("FROM (                                                                         ");
        builder.append("    SELECT MPI.PARTBARLISTCODE, MPR.ACTHOUR                                    ");
        builder.append("    FROM MD_PROCESS_INFO MPI                                                   ");
        builder.append("        LEFT JOIN (                                                            ");
        builder.append("            SELECT PARTBARLISTCODE, SUM(USEHOUR) AS ACTHOUR                    ");
        builder.append("            FROM (                                                             ");
        builder.append("                SELECT PARTBARLISTCODE, ROUND((NVL(NRCDTIME,                   ");
        builder.append("SYSDATE) - LRCDTIME) * 24 / TO_NUMBER(NVL(PARTCOUNT, '1')), 2) AS USEHOUR      ");
        builder.append("                FROM MD_PROCESS_RESUME                                         ");
        builder.append("                WHERE RSMID = ?                                                ");
        builder.append("                    AND ISTIME = '0'                                           ");
        builder.append("            )                                                                  ");
        builder.append("            GROUP BY PARTBARLISTCODE                                           ");
        builder.append("        ) MPR ON MPI.PARTBARLISTCODE = MPR.PARTBARLISTCODE                     ");
        builder.append("    WHERE MPI.MODULERESUMEID = ?                                               ");
        builder.append(") a                                                                            ");
        builder.append("LEFT JOIN MD_PART_LIST b ON a.PARTBARLISTCODE = b.PARTBARLISTCODE              ");
        builder.append("LEFT JOIN MD_PART c ON b.PARTBARCODE = c.PARTBARCODE                           ");
        builder.append("LEFT JOIN MD_PROCESS_INFO d ON a.PARTBARLISTCODE = d.PARTBARLISTCODE           ");
        builder.append("    LEFT JOIN (                                                                ");
        builder.append("        SELECT ROUND(SUM(NVL(EVALUATE, DURATION)), 2) AS ESTHOUR, PARTID       ");
        builder.append("        FROM MD_EST_SCHEDULE                                                   ");
        builder.append("        WHERE MODULERESUMEID = ?                                               ");
        builder.append("            AND TYPEID IS NULL                                                 ");
        builder.append("        GROUP BY PARTID                                                        ");
        builder.append("    ) e ON b.PARTBARLISTCODE = e.PARTID   ORDER BY a.PARTBARLISTCODE           ");

        List<Record> rlist = Db.find(builder.toString(), resumeid, resumeid, resumeid);

        double moduleEst = 0, moduleAct = 0;

        StringBuilder moduleBuilder = new StringBuilder("{");

        for (Record rcd : rlist) {
            moduleEst += ArithUtils.parseDouble(rcd.get("ESTHOUR"), 0);
            moduleAct += ArithUtils.parseDouble(rcd.get("ACTHOUR"), 0);
        }

        moduleBuilder.append("\"esthour\":");
        moduleBuilder.append(ArithUtils.round(moduleEst, 2));
        moduleBuilder.append(",\"acthour\":");
        moduleBuilder.append(ArithUtils.round(moduleAct, 2));
        moduleBuilder.append(",\"detail\":");
        moduleBuilder.append(JsonKit.toJson(rlist));
        moduleBuilder.append("}");

        return moduleBuilder.toString();
    }

    /**
     * 獲取待完工模具的工件訊息 CHK是否显示标准件
     * 
     * @param resumeid
     * @return
     */
    public List<ModuleProcessInfo> getFinishPartInfo(String resumeid, boolean chk) {
        if (StringUtils.isEmpty(resumeid)) {
            return new ArrayList<ModuleProcessInfo>();
        }

        StringBuilder builder = new StringBuilder();
        builder.append("SELECT * FROM (SELECT MPI.ID AS MID,MPI.ISFIXED,MPI.ISMAJOR,MPF.ID AS FID,MPL.PARTLISTCODE,MPI.PARTBARLISTCODE,MPI.MODULERESUMEID, MP.CNAMES AS PARTNAME, NVL(PO.OUTGUESTNAME,RD.NAME) AS REGIONNAME    ");
        builder.append(", MPS.NAME AS STATENAME, DD.BATCHNO, NVL(PO.OUTCRAFTNAME, MC.CRAFTNAME) AS CRAFTNAME, NVL(PO.OUTCRAFTCODE, MC.CRAFTCODE) AS CRAFTCODE , MPI.ACTIONTIME, ");
        builder.append("(SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END FROM MD_EST_SCHEDULE WHERE MODULERESUMEID = MPI.MODULERESUMEID         ");
        builder.append(" AND PARTID = MPI.PARTBARLISTCODE) AS ECOUNT,EI.EMPNAME, (SELECT REPLACE(WMSYS.WM_CONCAT(TMC.CRAFTCODE),',',' → ') FROM (SELECT * FROM MD_EST_SCHEDULE ORDER BY RANKNUM) ");
        builder.append(" MES LEFT JOIN MD_CRAFT TMC ON MES.CRAFTID = TMC.ID WHERE TYPEID IS NULL AND MES.MODULERESUMEID = MPI.MODULERESUMEID AND MES.PARTID = MPI.PARTBARLISTCODE) AS SCHER,");
        builder.append("(SELECT REMARK FROM MD_PART_SECTION WHERE ID = (SELECT MAX(ID) FROM MD_PART_SECTION WHERE PARTBARLISTCODE = MPI.PARTBARLISTCODE)) AS REMARK FROM MD_PROCESS_INFO MPI ");
        builder.append("LEFT JOIN MD_PROCESS_RESUME MPR ON MPI.CURSORID = MPR.ID LEFT JOIN MD_PART_LIST MPL ON MPI.PARTBARLISTCODE = MPL.PARTBARLISTCODE  ");
        builder.append("LEFT JOIN MD_PART MP ON MPL.PARTBARCODE = MP.PARTBARCODE                 ");
        builder.append("LEFT JOIN MD_PROCESS_STATE MPS ON MPI.PARTSTATEID = MPS.ID               ");
        builder.append("LEFT JOIN REGION_DEPART RD ON MPI.CURRENTDEPTID = RD.ID                  ");
        builder.append("LEFT JOIN DEVICE_DEPART DD ON MPI.DEVICEPARTID = DD.ID                   ");
        builder.append("LEFT JOIN MD_CRAFT MC ON MC.ID = DD.CRAFTID LEFT JOIN EMPLOYEE_INFO      ");
        builder.append("EI ON MPR.LEMPID = EI.ID LEFT JOIN PART_OUTBOUND PO ON MPR.OUTID = PO.ID LEFT JOIN MD_PROCESS_FINISH MPF ON MPI.ID = MPF.MID ");
        builder.append(" WHERE MPI.MODULERESUMEID = ? AND MPL.ISENABLE = ?)");

        // 如果TRUE为显示标准件
        if (!chk) {
            builder.append("WHERE ECOUNT > 0");
        }

        builder.append(" ORDER BY ECOUNT DESC,PARTLISTCODE");

        return this.find(builder.toString(), resumeid, "0");
    }

    public List<ModuleProcessInfo> getLocalePartInfo(String posid) {
        if (StringUtils.isEmpty(posid)) {
            return new ArrayList<ModuleProcessInfo>();
        }

        int len = posid.length();
        if (len > 6) {
            posid = posid.substring(0, 6);
        }

        StringBuilder builder = new StringBuilder();

        builder.append("SELECT A.PARTBARLISTCODE, D.MODULECODE, A.MODULERESUMEID AS RESUMEID, ");
        builder.append("B.PARTLISTCODE, C.CNAMES AS PARTNAME , E.BATCHNO ,G.NAME AS STATENAME ");
        builder.append("FROM MD_PROCESS_INFO A                                                ");
        builder.append("LEFT JOIN MD_PART_LIST B ON A.PARTBARLISTCODE = B.PARTBARLISTCODE     ");
        builder.append("LEFT JOIN MD_PART C ON B.PARTBARCODE = C.PARTBARCODE                  ");
        builder.append("LEFT JOIN MODULELIST D ON C.MODULEBARCODE = D.MODULEBARCODE           ");
        builder.append("    LEFT JOIN DEVICE_DEPART E ON A.DEVICEPARTID = E.ID                ");
        builder.append("LEFT JOIN REGION_DEPART F ON A.CURRENTDEPTID = F.ID                   ");
        builder.append("LEFT JOIN MD_PROCESS_STATE G ON A.PARTSTATEID = G.ID                  ");
        builder.append("WHERE B.ISENABLE = ?                                                  ");
        builder.append("    AND F.STEPID = ?                                                  ");

        return this.find(builder.toString(), "0", posid);
    }

    /**
     * 查询当前指定时间工件的最新动态
     * 
     * @param deptId
     *            加工单位
     * @param time
     *            当前时间
     * @param partStateId
     *            工件状态
     * @return
     */
    public List<Record> findCurrentTimePartState(Object deptId, Object time, Object partStateId) {
        StringBuilder sql = new StringBuilder();
        sql.append("SELECT ML.MODULECODE,                                               ");
        sql.append("      MPL.PARTLISTCODE,                                            ");
        sql.append("      MC.CRAFTCODE || '[' || MC.CRAFTNAME || ']' CRAFTNAME,        ");
        sql.append("      MES.STARTTIME,                                               ");
        sql.append("      MES.ENDTIME                                                  ");
        sql.append(" FROM (SELECT T.PARTBARLISTCODE, T.MODULERESUMEID, T.CURRENTDEPTID ");
        sql.append("         ,T.ACTIONTIME FROM MD_PROCESS_INFO T                      ");
        sql.append("        WHERE T.ACTIONTIME >=?                                     ");
        sql.append("          AND T.CURRENTDEPTID = ?                                  ");
        sql.append("          AND T.PARTSTATEID = ?) MPI                               ");
        sql.append(" LEFT JOIN MD_EST_SCHEDULE MES                                     ");
        sql.append("   ON MES.PARTID = MPI.PARTBARLISTCODE                             ");
        sql.append("  AND MES.MODULERESUMEID = MPI.MODULERESUMEID                      ");
        sql.append(" LEFT JOIN MD_PART_LIST MPL                                        ");
        sql.append("   ON MPL.PARTBARLISTCODE = MPI.PARTBARLISTCODE                    ");
        sql.append(" LEFT JOIN MODULELIST ML                                           ");
        sql.append("   ON MPL.MODULEBARCODE = ML.MODULEBARCODE                         ");
        sql.append(" LEFT JOIN MD_CRAFT MC                                             ");
        sql.append("   ON MC.ID = MES.CRAFTID                                          ");
        sql.append("WHERE MES.CRAFTID IN                                               ");
        sql.append("      (SELECT DISTINCT CRAFTID FROM DEVICE_DEPART WHERE PARTID = ?)");
        sql.append("      ORDER BY  MPI.ACTIONTIME                                     ");
        return Db.find(sql.toString(), time, deptId, partStateId, deptId);
    }

    /**
     * 获取加工工件讯息
     * 
     * @param resumeid
     * @param partid
     * @return
     */
    public List<ModuleProcessInfo> getWorkPartInformation(String partid, String resumeid) {
        StringBuilder builder = new StringBuilder();

        builder.append("SELECT MPL.PARTLISTCODE, MP.CNAMES AS PARTNAME, MPS.NAME AS STATENAME, RD.NAME AS REGIONNAME, DD.BATCHNO ");
        builder.append(", MC.CRAFTNAME, (SELECT SUM(EVALUATE) FROM MD_EST_SCHEDULE WHERE PARTID = MPL.PARTBARLISTCODE ");
        builder.append(" AND MODULERESUMEID = MPI.MODULERESUMEID) AS ESTHOUR, ( ");
        builder.append("SELECT ROUND(SUM((NVL(NRCDTIME, SYSDATE) - LRCDTIME) * 24 / TO_NUMBER(PARTCOUNT)), 1) FROM MD_PROCESS_RESUME ");
        builder.append("WHERE ISTIME = 0 AND PARTBARLISTCODE = MPL.PARTBARLISTCODE AND RSMID = ? ) AS ACTHOUR, ( ");
        builder.append("SELECT ROUND(SUM((NVL(KK.NRCDTIME, SYSDATE) - KK.LRCDTIME) * 24 * MM.CRAFTINFO / TO_NUMBER(KK.PARTCOUNT)), 1) ");
        builder.append("FROM MD_PROCESS_RESUME KK LEFT JOIN MD_CRAFT MM ON KK.LPROCRAFTID = MM.ID WHERE KK.ISTIME = 0 ");
        builder.append("AND KK.PARTBARLISTCODE = MPL.PARTBARLISTCODE AND KK.RSMID = ? ) AS TOTALFEE, ");
        builder.append("MPL.PICCODE,MPL.HARDNESS, MPL.BUFFING,MPL.MATERIALSRC,MPL.MATERIALTYPE,MPL.TOLERANCE,MPL.REMARK,MPL.REFORM,MPL.ISFIXED ");
        builder.append("FROM MD_PART_LIST MPL LEFT JOIN MD_PROCESS_INFO MPI ON MPI.PARTBARLISTCODE = MPL.PARTBARLISTCODE ");
        builder.append("LEFT JOIN MD_PART MP ON MPL.PARTBARCODE = MP.PARTBARCODE LEFT JOIN DEVICE_DEPART DD ON MPI.DEVICEPARTID = DD.ID ");
        builder.append("LEFT JOIN DEVICE_INFO DI ON DD.DEVICEID = DI.ID LEFT JOIN REGION_DEPART RD ON MPI.CURRENTDEPTID = RD.ID ");
        builder.append("LEFT JOIN MD_CRAFT MC ON DD.CRAFTID = MC.ID LEFT JOIN MD_PROCESS_STATE MPS ON MPI.PARTSTATEID = MPS.ID ");
        builder.append("WHERE MPL.PARTBARLISTCODE = ?");

        return this.find(builder.toString(), resumeid, resumeid, partid);
    }

    /**
     * 获取机台加工的工件讯息
     * 
     * @param devicepartid
     * @return
     */
    public List<ModuleProcessInfo> getMachineWorkPartDetails(String devicepartid) {
        StringBuilder builder = new StringBuilder();

        if (StringUtils.isEmpty(devicepartid)) {
            return new ArrayList<ModuleProcessInfo>();
        }

        builder.append("SELECT ML.MODULECODE, ML.GUESTCODE, MPS.NAME AS RESUMESTATE, FY.SHORTNAME AS GUESTNAME, MPL.PARTLISTCODE ");
        builder.append("FROM MD_PROCESS_INFO MPI LEFT JOIN MD_PART_LIST MPL ON MPI.PARTBARLISTCODE = MPL.PARTBARLISTCODE ");
        builder.append("LEFT JOIN MODULELIST ML ON MPL.MODULEBARCODE = ML.MODULEBARCODE LEFT JOIN FACTORY FY ON ML.GUESTID = FY.ID ");
        builder.append("LEFT JOIN MD_RESUME MR ON MPI.MODULERESUMEID = MR.ID LEFT JOIN MD_PROCESS_STATE MPS ON MR.RESUMESTATE = MPS.ID ");
        builder.append("WHERE MPI.DEVICEPARTID = ?");

        return this.find(builder.toString(), devicepartid);
    }

    // /**
    // * 查询待加工的零件负荷讯息
    // *
    // * @param rstateid
    // * @param stepid
    // * @return
    // */
    // public List<ModuleProcessInfo> getEstimateLoadInfo(String rstateid,
    // String stepid) {
    // StringBuilder sql = new StringBuilder();
    //
    // sql.append("SELECT INQ.*, MPS.NAME AS STATENAME, RD.NAME AS REGIONNAME, MPL.PARTLISTCODE, MP.CNAMES , ML.MODULECODE, FY.SHORTNAME, MC.CRAFTNAME FROM (");
    // sql.append("SELECT MPI.MODULERESUMEID AS RSMID, MPI.PARTBARLISTCODE, MPI.PARTSTATEID, MPI.CURRENTDEPTID AS DEPARTID, MES.STARTTIME ");
    // sql.append(", MES.ENDTIME, DD.CRAFTID AS NCRAFTID, ROUND((SYSDATE - TO_DATE(DD.LAUNCH, 'yyyy-mm-dd hh24:mi:ss')) * 24, 2) AS LHOURS, MES.CRAFTID, NVL(MES.EVALUATE, 0) AS EVALUATE ");
    // sql.append(", SUBSTR(MC.CRAFTID, 0, 2) AS STEPID, NVL(MES.TYPEID, 0) AS TYPEID FROM MD_PROCESS_INFO MPI LEFT JOIN DEVICE_DEPART DD ON MPI.DEVICEPARTID = DD.ID ");
    // sql.append("LEFT JOIN MD_EST_SCHEDULE MES ON MPI.MODULERESUMEID = MES.MODULERESUMEID AND MPI.PARTBARLISTCODE = MES.PARTID ");
    // sql.append("LEFT JOIN MD_CRAFT MC ON MES.CRAFTID = MC.ID LEFT JOIN MD_RESUME MR ON MPI.MODULERESUMEID = MR.ID WHERE MES.PARTID LIKE '107%') INQ ");
    // sql.append("LEFT JOIN MD_PROCESS_STATE MPS ON INQ.PARTSTATEID = MPS.ID LEFT JOIN MD_PART_LIST MPL ON INQ.PARTBARLISTCODE = MPL.PARTBARLISTCODE  ");
    // sql.append("LEFT JOIN MD_PART MP ON MPL.PARTBARCODE = MP.PARTBARCODE LEFT JOIN MODULELIST ML ON MP.MODULEBARCODE = ML.MODULEBARCODE ");
    // sql.append("LEFT JOIN FACTORY FY ON ML.GUESTID = FY.ID LEFT JOIN REGION_DEPART RD ON INQ.DEPARTID = RD.ID LEFT JOIN MD_CRAFT MC ON INQ.CRAFTID = MC.ID ");
    // sql.append("LEFT JOIN MD_RESUME MR ON INQ.RSMID = MR.ID ");
    // sql.append("WHERE INQ.STEPID IN (").append(stepid).append(")");
    //
    // if (!StringUtils.isEmpty(rstateid)) {
    // sql.append(" AND INQ.RSMID IN (").append(rstateid).append(")");
    // }
    //
    // sql.append(" ORDER BY INQ.TYPEID, INQ.PARTBARLISTCODE, INQ.STARTTIME");
    //
    // return this.find(sql.toString());
    // }

    /**
     * 查询待加工的零件负荷讯息
     * 
     * @param rstateid
     * @param stepid
     * @return
     */
    public List<ModuleProcessInfo> getEstimateLoadInfo(String rstateid, String stepid) {
        StringBuilder sql = new StringBuilder();

        sql.append("SELECT INQ.*, MPS.NAME AS STATENAME, RD.NAME AS REGIONNAME, MPL.PARTLISTCODE, MP.CNAMES ");
        sql.append(", ML.MODULECODE, FY.SHORTNAME, MC.CRAFTNAME, REPLACE((SELECT WMSYS.WM_CONCAT(FK.CRAFTCODE) FROM MD_EST_SCHEDULE TK LEFT JOIN");
        sql.append(" MD_CRAFT FK ON TK.CRAFTID = FK.ID WHERE TK.PARTID = INQ.PARTBARLISTCODE AND TK.MODULERESUMEID = INQ.RSMID),',',' → ') AS ");
        sql.append("SCHEDULER FROM ( SELECT MPI.MODULERESUMEID AS RSMID, MPI.PARTBARLISTCODE, MPI.PARTSTATEID, MPI.CURRENTDEPTID AS DEPARTID, MES.STARTTIME ");
        sql.append(", MES.ENDTIME, DD.CRAFTID AS NCRAFTID, ROUND((SYSDATE - TO_DATE(DD.LAUNCH, 'yyyy-mm-dd hh24:mi:ss')) * 24, 2) AS LHOURS, ");
        sql.append("MES.CRAFTID, NVL(MES.EVALUATE, 0) AS EVALUATE , SUBSTR(MC.CRAFTID, 0, 2) AS STEPID FROM MD_PROCESS_INFO MPI ");

        sql.append("LEFT JOIN DEVICE_DEPART DD ON MPI.DEVICEPARTID = DD.ID LEFT JOIN MD_EST_SCHEDULE MES ON MPI.MODULERESUMEID = MES.MODULERESUMEID ");
        sql.append("AND MPI.PARTBARLISTCODE = MES.PARTID LEFT JOIN MD_CRAFT MC ON MES.CRAFTID = MC.ID ");
        sql.append("LEFT JOIN MD_RESUME MR ON MPI.MODULERESUMEID = MR.ID WHERE MES.PARTID LIKE '107%' AND MES.TYPEID IS NULL ) INQ ");
        sql.append("LEFT JOIN MD_PROCESS_STATE MPS ON INQ.PARTSTATEID = MPS.ID LEFT JOIN MD_PART_LIST MPL ON INQ.PARTBARLISTCODE = MPL.PARTBARLISTCODE ");

        sql.append("LEFT JOIN MD_PART MP ON MPL.PARTBARCODE = MP.PARTBARCODE LEFT JOIN MODULELIST ML ON MP.MODULEBARCODE = ML.MODULEBARCODE ");
        sql.append("LEFT JOIN FACTORY FY ON ML.GUESTID = FY.ID LEFT JOIN REGION_DEPART RD ON INQ.DEPARTID = RD.ID ");
        sql.append("LEFT JOIN MD_CRAFT MC ON INQ.CRAFTID = MC.ID LEFT JOIN MD_RESUME MR ON INQ.RSMID = MR.ID ");
        sql.append("WHERE INQ.STEPID IN (").append(stepid).append(")");

        if (!StringUtils.isEmpty(rstateid)) {
            sql.append(" AND MR.RESUMESTATE IN (").append(rstateid).append(")");
        }

        sql.append(" ORDER BY INQ.PARTBARLISTCODE, INQ.STARTTIME");

        return this.find(sql.toString());
    }

    // /**
    // * 获取外发工件的加工工艺讯息
    // *
    // * @return
    // */
    // public List<ModuleProcessInfo> getOutBoundPartCrafts() {
    // StringBuilder sql = new StringBuilder();
    //
    // sql.append("SELECT MPI.PARTBARLISTCODE, PO.OUTCRAFTID FROM MD_PROCESS_INFO MPI ");
    // sql.append("LEFT JOIN MD_PROCESS_RESUME MPR ON MPI.MODULERESUMEID = MPR.RSMID AND MPI.PARTBARLISTCODE = MPR.PARTBARLISTCODE  ");
    // sql.append("LEFT JOIN PART_OUTBOUND PO ON MPR.OUTID = PO.ID WHERE MPR.OUTID IS NOT NULL");
    //
    // return this.find(sql.toString());
    // }

    /**
     * 获取外发工件的加工工艺讯息
     * 
     * @param stateid
     * @return
     */
    public List<ModuleProcessInfo> getActualPartCrafts(String stateid) {
        StringBuilder sql = new StringBuilder();

        sql.append("SELECT MPI.PARTBARLISTCODE AS PARTID, MPI.MODULERESUMEID AS RSMID, NVL(MPR.LPROCRAFTID, PO.OUTCRAFTID) AS CRAFTID ");
        sql.append("FROM MD_PROCESS_INFO MPI LEFT JOIN MD_PROCESS_RESUME MPR ON MPI.MODULERESUMEID = MPR.RSMID ");
        sql.append("AND MPI.PARTBARLISTCODE = MPR.PARTBARLISTCODE LEFT JOIN PART_OUTBOUND PO ON MPR.OUTID = PO.ID ");
        sql.append("WHERE MPR.LPARTSTATEID IN (").append(stateid).append(") ORDER BY MPR.PARTBARLISTCODE, MPR.LRCDTIME");

        return this.find(sql.toString());
    }
}
