package com.kc.module.model;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import com.jfinal.kit.JsonKit;
import com.jfinal.kit.StringKit;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.DBUtils;
import com.kc.module.utils.StringUtils;

/**
 * 模具排程表操作主类
 * 
 * @author Administrator
 * 
 */
public class ModuleEstSchedule extends ModelFinal<ModuleEstSchedule> {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;

    public static ModuleEstSchedule dao = new ModuleEstSchedule();

    /**
     * 得到工件工艺排程指定位置之后的其它排程
     * 
     * @param mri
     * @param mplb
     * @param direction
     * @return
     */
    public List<ModuleEstSchedule> getFollowUpPlan(Object mri, Object[] mplb, Object direction) {
        StringBuilder sql = new StringBuilder();
        sql.append("SELECT * FROM MD_EST_SCHEDULE WHERE MODULERESUMEID = ?  AND PARTID IN (");

        // 合并参数
        Object[] params = new Object[mplb.length + 2];
        params[0] = mri;
        params[params.length - 1] = direction;

        for (int i = 0; i < mplb.length; i++) {
            sql.append("?").append(i == mplb.length - 1 ? "" : ",");
            params[1 + i] = mplb[i];
        }

        sql.append(") AND RANKNUM >= ?");

        return find(sql.toString(), params);
    }

    /**
     * 得到工件工艺排程指定位置之后的其它排程
     * 
     * @param mri
     * @param mplb
     * @param direction
     * @return
     */
    public List<ModuleEstSchedule> getFollowUpPlanNotNull(Object mri, Object[] mplb, Object direction) {
        StringBuilder sql = new StringBuilder();
        sql.append("SELECT * FROM MD_EST_SCHEDULE WHERE MODULERESUMEID = ?  AND PARTID IN (");

        // 合并参数
        Object[] params = new Object[mplb.length + 2];
        params[0] = mri;
        params[params.length - 1] = direction;

        for (int i = 0; i < mplb.length; i++) {
            sql.append("?").append(i == mplb.length - 1 ? "" : ",");
            params[1 + i] = mplb[i];
        }

        sql.append(")  AND RANKNUM > ? AND STARTTIME IS NOT NULL AND ENDTIME IS NOT NULL AND DURATION IS NOT NULL");

        return find(sql.toString(), params);
    }

    /**
     * 得到工艺的关联关系
     * 
     * @param moduleBarcode
     * @return
     */
    public List<ModuleEstSchedule> getDependencies(String moduleBarcode) {

        return dao.find("select craftschbarcode ,nextcscode  from  " + tableName() + " where modulebarcode=?", moduleBarcode);
    }

    /**
     * 查询当前ID排程和附属ID排程的ID
     * 
     * @param id
     * @return
     */
    public List<ModuleEstSchedule> findCraftPlanById(String id) {
        return find("select * from MD_EST_SCHEDULE where id=? or parentid=? order by PARTID", id, id);
    }

    /**
     * 查询工件的所有排程
     * 
     * @param ids
     * @return
     */
    public List<ModuleEstSchedule> findCraftPlanById(String[] planIds) {
        StringBuilder sql = new StringBuilder();

        Object[] paramArray = Arrays.copyOf(planIds, planIds.length * 2);
        String tmp = "";
        for (int i = 0; i < planIds.length; i++) {
            tmp = tmp + "?" + (i == planIds.length - 1 ? "" : ",");
            paramArray[i + planIds.length] = planIds[i];
        }

        sql.append("select * from MD_EST_SCHEDULE where id in (").append(tmp);
        sql.append(") or parentid in (").append(tmp).append(")");

        return find(sql.toString(), paramArray);
    }

    /**
     * 查询指定工件和模具履历的排程Gantt数据
     * 
     * @param mri
     * @param partId
     * @return
     */
    public List<ModuleEstSchedule> findCraftPlanGanttData() {

        StringBuilder sql = new StringBuilder();

        sql.append("SELECT MP.*, MC.CRAFTNAME || '(' || MC.CRAFTCODE || ')' AS CRAFT  ");
        sql.append("FROM (SELECT ID, STARTTIME, ENDTIME,");
        sql.append(" CRAFTID, RANKNUM ,NVL(DURATION,0) DURATION,TYPEID, REMARK, ");
        sql.append("NVL(EVALUATE,0) EVALUATE FROM MD_EST_SCHEDULE WHERE  MODULERESUMEID = ? ");
        sql.append("AND PARTID = ? AND TYPEID IS NULL) MP LEFT JOIN MD_CRAFT MC ON MC.ID = MP.CRAFTID ");

        return find(sql.toString(), get("MODULERESUMEID"), get("partid"));

    }

    /**
     * 通过模具履历号得到其工件加工预计排程
     * 
     * @param mri
     * @return
     */
    public List<ModuleEstSchedule> findModuleResumeSchedule(String mri) {

        StringBuilder sql = new StringBuilder();

        sql.append("SELECT MP.PARTLISTCODE, MC.CRAFTNAME || '(' || mc.CRAFTCODE || ')'");
        sql.append(" AS CRAFTNAME, MES.STARTTIME, MES.ENDTIME, MES.DURATION       ");
        sql.append("    , MES.RANKNUM                                             ");
        sql.append("FROM (                                                        ");
        sql.append("    SELECT STARTTIME, ENDTIME, DURATION, RANKNUM, PARTID      ");
        sql.append("        , CRAFTID                                             ");
        sql.append("    FROM MD_EST_SCHEDULE                                      ");
        sql.append("    WHERE MODULERESUMEID = ?  AND TYPEID IS NULL              ");
        sql.append("        AND PARENTID IS NOT NULL                                  ");
        sql.append(") MES                                                         ");
        sql.append("LEFT JOIN MD_PART_LIST MP ON MP.PARTBARLISTCODE = MES.PARTID           ");
        sql.append("    LEFT JOIN MD_CRAFT MC ON MC.ID = MES.CRAFTID              ");
        sql.append("ORDER BY MP.PARTLISTCODE                                          ");

        return find(sql.toString(), mri);
    }

    /**
     * 查找相应单位需要加工工件的工艺排程
     * 
     * @param moduleResumeId
     * @param craftId
     * @return
     */
    public List<ModuleEstSchedule> findPartScheduleForCraft(String moduleResumeId, String craftId) {
        List<String> params = new ArrayList<String>();
        StringBuilder sql = new StringBuilder();
        sql.append(" SELECT ML.MODULECODE, MP.PARTCODE || '(' || MP.CNAMES || '[' || ");
        sql.append(" MP.QUANTITY || '件])' AS PARTCODE, MES.*");
        sql.append(" ,mc.craftname||'('||mc.craftcode||')' craftname FROM (");
        sql.append("   SELECT *");
        sql.append("  FROM MD_EST_SCHEDULE");
        sql.append("   WHERE ");

        // 指定模具状态查询
        if (StringKit.notBlank(moduleResumeId)) {
            String[] states = moduleResumeId.split(";|,|&");
            sql.append(" MODULERESUMEID in (");
            for (int i = 0; i < states.length; i++) {
                sql.append("?").append(i == states.length - 1 ? "" : ",");
                params.add(states[i]);
            }
            sql.append(") AND");
        }

        // 指定模具状态查询
        if (StringKit.notBlank(craftId)) {
            String[] states = craftId.split(";|,|&");
            sql.append(" CRAFTID in (");
            for (int i = 0; i < states.length; i++) {
                sql.append("?").append(i == states.length - 1 ? "" : ",");
                params.add(states[i]);
            }
            sql.append(") AND");

        } else {
            return null;
        }

        sql.append("    PARENTID IS NULL");
        sql.append(") MES");
        sql.append(" LEFT JOIN MD_PART MP ON MP.PARTBARCODE = MES.PARTID ");
        sql.append("   LEFT JOIN MODULELIST ML ON ML.MODULEBARCODE = MP.MODULEBARCODE");
        sql.append(" LEFT JOIN  MD_CRAFT MC ON MC.ID=MES.CRAFTID");

        return find(sql.toString(), params.toArray());
    }

    /**
     * 
     * @param parentId
     * @return
     */
    public List<ModuleEstSchedule> findPartListSchedule(Object parentId) {
        return find("select * from " + tableName() + " where PARENTID = ?", parentId);
    }

    /**
     * 查询每天指定工艺所在加工的工件数量
     * 
     * @param craftId
     * @param month
     * @return
     */
    public List<ModuleEstSchedule> findCraftPartsEveryDay(String craftId, String month) {
        StringBuilder sql = new StringBuilder();
        sql.append(" SELECT COUNT(*) EVALUATE, M.STARTTIME ");
        sql.append(" FROM (SELECT to_char(mes.STARTTIME, 'YYYY-MM-DD') AS starttime ");
        sql.append("     FROM md_est_schedule mes ");
        sql.append("   WHERE mes.CRAFTID = ? ");
        sql.append("     AND mes.PARENTID IS NULL ");
        if (StringKit.notBlank(month)) {
            sql.append(" and to_char(mes.STARTTIME, 'YYYY-MM') ='").append(month).append("'");
        }
        sql.append(" ) m GROUP BY m.starttime ");
        return find(sql.toString(), craftId);
    }

    /**
     * 查询每天工艺所在加工的总工时
     * 
     * @param craftId
     * @param month
     * @return
     */
    public List<ModuleEstSchedule> findCraftDeptWorkLoadEveryDay(String craftId, String month) {
        StringBuilder sql = new StringBuilder();
        sql.append("SELECT SUM(M.EVALUATE) EVALUATE, M.STARTTIME ");
        sql.append("FROM (SELECT TO_CHAR(MES.STARTTIME, 'YYYY-MM-DD') AS STARTTIME, ");
        sql.append("      NVL(MES.EVALUATE, 0) AS EVALUATE ");
        sql.append("    FROM MD_EST_SCHEDULE MES ");
        sql.append("    WHERE MES.CRAFTID = ? ");
        sql.append("        AND MES.PARENTID IS NULL ");
        if (StringKit.notBlank(month)) {
            sql.append(" AND TO_CHAR(MES.STARTTIME, 'YYYY-MM') ='").append(month).append("'");
        }

        sql.append(" ) M GROUP BY M.STARTTIME ");

        return find(sql.toString(), craftId);
    }

    /**
     * 
     */
    public List<ModuleEstSchedule> findSchedule(String craftId) {
        StringBuilder sql = new StringBuilder();
        sql.append(" SELECT TO_CHAR(MES.STARTTIME, 'YYYY-MM-DD') AS STARTTIME, NVL(MES.EVALUATE, 0)  ");
        sql.append("AS EVALUATE, mes.DURATION FROM MD_EST_SCHEDULE MES ");
        sql.append("WHERE MES.CRAFTID = ? AND MES.PARENTID IS NULL AND MES.MODULERESUMEID IN(SELECT ID FROM MD_RESUME)");
        return find(sql.toString(), craftId);
    }

    /**
     * 分页得到模具计划加工排程
     * 
     * @param moduleResumeId
     *            模具履历号
     * @param page
     *            第几页
     * @param start
     *            页面的开始行号
     * @param limit
     *            页面显示的最大行数
     * @return
     */
    public List<Record> findPlanProcessFlow(Object moduleResumeId, int page, int start, int limit, Object pcode, boolean chk) {
        StringBuilder sql = new StringBuilder();

        sql.append("SELECT MPI.PARTBARLISTCODE, (");
        sql.append("        SELECT MC.CRAFTCODE ");
        sql.append("        FROM MD_CRAFT MC ");
        sql.append("        WHERE MC.ID = MES.CRAFTID ");
        sql.append("        ) AS FLOWCRAFTCODE, MES.STARTTIME,MES.ENDTIME, MES.RANKNUM, MPI.NOWCRAFTCODE ");
        sql.append("    , MPI.PARTSTATEID, ( ");
        sql.append("        SELECT NAME ");
        sql.append("        FROM MD_PROCESS_STATE ");
        sql.append("        WHERE ID = MPI.PARTSTATEID ");
        sql.append("        ) AS LSTATENAME ");
        sql.append("FROM (SELECT PARTBARLISTCODE, PARTSTATEID, MODULERESUMEID, ( ");
        sql.append("            SELECT MC.CRAFTCODE ");// 分页得到工件当前所在加工的工艺
        sql.append("            FROM MD_CRAFT MC ");
        sql.append("            WHERE MC.ID = BB.CRAFTID ");
        sql.append("            ) AS NOWCRAFTCODE FROM (");

        Object[] params = null;

        if (StringUtils.isEmpty(pcode)) {
            sql.append("    SELECT A.*, ROWNUM AS RN ");
            sql.append("        FROM (SELECT PARTBARLISTCODE, PARTSTATEID, CURSORID, MODULERESUMEID, ( ");
            sql.append("                    SELECT LPROCRAFTID ");
            sql.append("                    FROM MD_PROCESS_RESUME ");
            sql.append("                    WHERE ID = CURSORID ");
            sql.append("                    ) AS CRAFTID FROM ");
            if (!chk) {
                sql.append("(SELECT * FROM (SELECT AA.*,(SELECT COUNT(*) FROM  MD_EST_SCHEDULE ");
                sql.append("WHERE MODULERESUMEID = AA.MODULERESUMEID  AND PARTID = AA.PARTBARLISTCODE ");
                sql.append(") AS ECOUNT FROM MD_PROCESS_INFO AA) WHERE ECOUNT > 0)");

            } else {
                sql.append(" MD_PROCESS_INFO ");
            }
            sql.append("            WHERE MODULERESUMEID = ? ");
            sql.append("            ORDER BY PARTBARLISTCODE ");
            sql.append("            ) A ");
            sql.append("        WHERE ROWNUM <= ? * ? ");
            sql.append("        ) BB ");
            sql.append("    WHERE RN > (? - 1) * ? ");

            params = new Object[]{moduleResumeId, page, limit, page, limit};
        } else {
            sql.append("SELECT M.PARTBARLISTCODE,M.PARTSTATEID,M.CURSORID,M.MODULERESUMEID,( ");
            sql.append("SELECT LPROCRAFTID FROM MD_PROCESS_RESUME WHERE ID = M.CURSORID) AS CRAFTID FROM ");
            if (!chk) {
                sql.append("(SELECT * FROM (SELECT AA.*,(SELECT COUNT(*) FROM  MD_EST_SCHEDULE ");
                sql.append("WHERE MODULERESUMEID = AA.MODULERESUMEID  AND PARTID = AA.PARTBARLISTCODE ");
                sql.append(") AS ECOUNT FROM MD_PROCESS_INFO AA) WHERE ECOUNT > 0)");

            } else {
                sql.append(" MD_PROCESS_INFO ");
            }
            sql.append(" M LEFT JOIN MD_PART_LIST N ON M.PARTBARLISTCODE = N.PARTBARLISTCODE WHERE ");
            sql.append("M.MODULERESUMEID = ? AND N.PARTLISTCODE LIKE ?||'%' ORDER BY M.PARTBARLISTCODE ) BB");

            params = new Object[]{moduleResumeId, pcode};
        }

        sql.append(") MPI LEFT JOIN MD_EST_SCHEDULE MES ON MES.PARTID = MPI.PARTBARLISTCODE AND MES.MODULERESUMEID = MPI.MODULERESUMEID");
        sql.append(" WHERE MES.TYPEID IS NULL ORDER BY MPI.PARTBARLISTCODE, MES.RANKNUM ");

        return Db.find(sql.toString(), params);
    }

    /**
     * 分页得到模具计划加工排程
     * 
     * @param moduleResumeId
     *            模具履历号
     * @param page
     *            第几页
     * @param start
     *            页面的开始行号
     * @param limit
     *            页面显示的最大行数
     * @return
     */
    public List<Record> findPlanProcessFlow(Object moduleResumeId) {
        StringBuilder sql = new StringBuilder();

        sql.append("SELECT MPI.PARTBARLISTCODE, (");
        sql.append("        SELECT MC.CRAFTCODE ");
        sql.append("        FROM MD_CRAFT MC ");
        sql.append("        WHERE MC.ID = MES.CRAFTID ");
        sql.append("        ) AS FLOWCRAFTCODE, MES.ENDTIME, MES.RANKNUM ");
        sql.append("FROM (SELECT PARTBARLISTCODE, PARTSTATEID, ( ");
        sql.append("            SELECT MC.CRAFTCODE ");// 分页得到工件当前所在加工的工艺
        sql.append("            FROM MD_CRAFT MC ");
        sql.append("            WHERE MC.ID = BB.CRAFTID ");
        sql.append("            ) AS NOWCRAFTCODE ");
        sql.append("    FROM (SELECT A.*, ROWNUM AS RN ");
        sql.append("        FROM (SELECT PARTBARLISTCODE, PARTSTATEID, CURSORID, ( ");
        sql.append("                    SELECT LPROCRAFTID ");
        sql.append("                    FROM MD_PROCESS_RESUME ");
        sql.append("                    WHERE ID = CURSORID ");
        sql.append("                    ) AS CRAFTID ");
        sql.append("            FROM MD_PROCESS_INFO ");
        sql.append("            WHERE MODULERESUMEID = ? ");
        sql.append("            ORDER BY PARTBARLISTCODE ");
        sql.append("            ) A ) BB ");
        sql.append("    ) MPI LEFT JOIN MD_EST_SCHEDULE MES ON MES.PARTID = MPI.PARTBARLISTCODE ");
        sql.append(" WHERE MES.TYPEID IS NULL ORDER BY MPI.PARTBARLISTCODE, MES.RANKNUM ");

        return Db.find(sql.toString(), moduleResumeId);
    }

    /**
     * 获取工件预计加工流程
     * 
     * @param partbarcode
     * @param resumeid
     * @return
     */
    public List<Record> getRegularEstimateSchedule(String partbarcode, String resumeid) {
        StringBuilder builder = new StringBuilder();

        builder.append("SELECT ");
        builder.append("b.CRAFTNAME||'['||b.CRAFTCODE||']' AS CRAFTNAME,");
        builder.append("TO_CHAR(a.STARTTIME,'yyyy-MM-dd hh24') AS STARTHOUR,");
        builder.append("TO_CHAR(a.ENDTIME,'yyyy-MM-dd hh24') AS ENDHOUR,");
        builder.append("NVL(a.EVALUATE,0) AS ESTHOUR ");
        builder.append("FROM ");
        builder.append("MD_EST_SCHEDULE a LEFT JOIN MD_CRAFT b ");
        builder.append("ON a.CRAFTID = b.ID ");
        builder.append("WHERE PARTID = ? AND MODULERESUMEID = ? AND TYPEID IS NULL ORDER BY RANKNUM");

        return Db.find(builder.toString(), partbarcode, resumeid);
    }

    /**
     * 获取实际工件加工讯息
     * 
     * @param partbarcode
     * @param resumeid
     * @return
     */
    public List<Record> getActualPartProcessInfo(String partbarcode, String resumeid) {
        StringBuilder builder = new StringBuilder();

        builder.append("SELECT a.LPROCRAFTID,a.RSMID,a.PARTBARLISTCODE, b.CRAFTNAME || '[' || b.CRAFTCODE || ']' AS CRAFTNAME,");
        builder.append("TO_CHAR(a.LRCDTIME, 'yyyy-MM-dd hh24:mi:ss') AS STARTTIME, TO_CHAR(NVL(a.NRCDTIME, SYSDATE), ");
        builder.append("'yyyy-MM-dd hh24:mi:ss') AS ENDTIME,ROUND(((NVL(a.NRCDTIME, SYSDATE) - a.LRCDTIME) * 24) / ");
        builder.append("TO_NUMBER(NVL(a.PARTCOUNT,'1')),2) AS USEHOUR FROM MD_PROCESS_RESUME a ");
        builder.append("LEFT JOIN MD_CRAFT b ON a.LPROCRAFTID = b.ID ");
        builder.append("LEFT JOIN EMPLOYEE_INFO c ON a.LEMPID = c.ID ");
        builder.append("WHERE a.ISTIME = '0' AND a.PARTBARLISTCODE = ? AND a.RSMID = ? ");
        builder.append("ORDER BY a.LRCDTIME");

        return Db.find(builder.toString(), partbarcode, resumeid);
    }

    /**
     * 加載獲取工件的預計排程與實際排程
     * 
     * @param est
     * @param act
     * @return
     */
    public String getTotalPartProcessInfo(String partbarcode, String resumeid) {

        List<Record> est = this.getRegularEstimateSchedule(partbarcode, resumeid);
        List<Record> act = this.getActualPartProcessInfo(partbarcode, resumeid);

        // 將實際的加工排程進行組合
        List<Record> gatherActRcd = new ArrayList<Record>();
        // 初始化待解析的工藝耗時
        String craftid = null, craftname = null, start = null, end = null;
        double actHour = 0d;
        // 開始統計的符號
        boolean isStart = false;
        for (Record rcd : act) {
            // 工藝ID號
            String tCraftid = StringUtils.parseString(rcd.get("LPROCRAFTID"));
            // 工藝名稱
            String tCraftname = StringUtils.parseString(rcd.get("CRAFTNAME"));
            // 開始時間
            String tStart = StringUtils.parseString(rcd.get("STARTTIME"));
            // 結束時間
            String tEnd = StringUtils.parseString(rcd.get("ENDTIME"));
            // 加工用時
            double tActHour = ArithUtils.parseDouble(rcd.get("USEHOUR"), 0);

            if (!isStart) {
                craftid = tCraftid;
                start = tStart;
                craftname = tCraftname;
                end = tEnd;
                actHour = tActHour;

                // 將啟動符號設置為TRUE
                isStart = true;
            } else {
                if (tCraftid.equals(craftid)) {
                    end = tEnd;
                    actHour += tActHour;
                } else {
                    Record estRcd = new Record();
                    estRcd.set("craftid", craftid)
                          .set("craftname", craftname)
                          .set("starthour", start)
                          .set("endhour", end)
                          .set("usehour", ArithUtils.round(actHour, 2))
                          .set("rsmid", resumeid)
                          .set("partbarcode", partbarcode);

                    gatherActRcd.add(estRcd);

                    craftid = tCraftid;
                    craftname = tCraftname;
                    start = tStart;
                    end = tEnd;
                    actHour = tActHour;
                }
            }
        }

        // 如果最后一个工艺的实际用时大于0,则添加该工艺的记录
        if (actHour > 0) {
            Record fEstRcd = new Record();
            fEstRcd.set("craftid", craftid)
                   .set("craftname", craftname)
                   .set("starthour", start)
                   .set("endhour", end)
                   .set("usehour", ArithUtils.round(actHour, 2))
                   .set("rsmid", resumeid)
                   .set("partbarcode", partbarcode);

            gatherActRcd.add(fEstRcd);
        }

        return "{\"est\":" + JsonKit.toJson(est, 4) + ",\"act\":" + JsonKit.toJson(gatherActRcd, 4) + "}";
    }

    public List<ModuleEstSchedule> queryPredictCraftSchedule(String craftid, String day) {
        StringBuilder sql = new StringBuilder();

        if (StringUtils.isEmpty(craftid) || StringUtils.isEmpty(day)) {
            return new ArrayList<ModuleEstSchedule>();
        }

        sql.append("SELECT D.MODULECODE, B.PARTLISTCODE, C.CNAMES AS PARTNAME,              ");
        sql.append("E.CRAFTNAME, TO_CHAR(A.STARTTIME, 'yyyy-MM-dd hh24:mi') AS STARTTIME    ");
        sql.append(", TO_CHAR(A.ENDTIME, 'yyyy-MM-dd hh24:mi') AS ENDTIME,                  ");
        sql.append("NVL(A.EVALUATE, A.DURATION) AS ESTTIME, G.NAME AS DEPTNAME,             ");
        sql.append("H.NAME AS STATENAME  FROM MD_EST_SCHEDULE A                             ");
        sql.append("LEFT JOIN MD_PART_LIST B ON A.PARTID = B.PARTBARLISTCODE                ");
        sql.append("LEFT JOIN MD_PART C ON B.PARTBARCODE = C.PARTBARCODE                    ");
        sql.append("LEFT JOIN MODULELIST D ON B.MODULEBARCODE = D.MODULEBARCODE             ");
        sql.append("LEFT JOIN MD_CRAFT E ON A.CRAFTID = E.ID                                ");
        sql.append("LEFT JOIN MD_PROCESS_INFO F ON A.PARTID = F.PARTBARLISTCODE             ");
        sql.append("LEFT JOIN REGION_DEPART G ON F.CURRENTDEPTID = G.ID                     ");
        sql.append("    LEFT JOIN MD_PROCESS_STATE H ON F.PARTSTATEID = H.ID                ");
        sql.append("WHERE A.CRAFTID = ? AND TO_CHAR(A.STARTTIME,'yyyy-MM-dd') LIKE  ?       ");
        sql.append(" AND A.TYPEID IS NULL AND B.ISENABLE = ?                                ");
        sql.append("AND A.PARENTID IS NOT NULL  ORDER BY A.STARTTIME                        ");

        return this.find(sql.toString(), craftid, day, "0");
    }

    /**
     * 查詢本單位工件的排程訊息
     * 
     * @param partid
     * @param resumeid
     * @return
     */
    public List<ModuleEstSchedule> getLocalePartSchedule(String partid, String resumeid) {
        StringBuilder builder = new StringBuilder();

        builder.append("SELECT CASE WHEN B.CRAFTCODE IS NULL THEN NULL ELSE B.CRAFTNAME        ");
        builder.append("|| '[' || B.CRAFTCODE || ']' END AS CRAFTNAME, TO_CHAR(A.STARTTIME,    ");
        builder.append("'yyyy-MM-dd hh24') AS STARTTIME, TO_CHAR(A.ENDTIME,                    ");
        builder.append("'yyyy-MM-dd hh24') AS ENDTIME, NVL(A.EVALUATE, A.DURATION) AS USEHOUR  ");
        builder.append(", CASE WHEN A.TYPEID IS NULL THEN '正常' ELSE '臨時' END AS STYPE         ");
        builder.append(",A.ID AS SCHEID FROM MD_EST_SCHEDULE A                                 ");
        builder.append("LEFT JOIN MD_CRAFT B ON A.CRAFTID = B.ID                               ");
        builder.append("WHERE A.PARTID = ?                                                     ");
        builder.append("AND A.MODULERESUMEID = ?                                               ");
        builder.append("ORDER BY A.STARTTIME                                                   ");

        return this.find(builder.toString(), partid, resumeid);
    }

    /**
     * 獲取模具履歷的加工訊息
     * 
     * @param resumeid
     * @return
     */
    public List<ModuleEstSchedule> getModuleProcessCost(String resumeid) {
        StringBuilder builder = new StringBuilder();

        // builder.append("SELECT TT.*,ROUND((TT.CRAFTFEE * TT.ACTHOUR),1) AS PROFEE FROM (");
        // builder.append("SELECT CASE WHEN ISENABLE = '1' THEN B.PARTLISTCODE || '(R)' ELSE B.PARTLISTCODE END AS ");
        // builder.append(" PARTLISTCODE, CASE WHEN C.CRAFTCODE IS NULL THEN NULL ELSE C.CRAFTNAME || ");
        // builder.append("'[' || C.CRAFTCODE || ']' END AS CRAFTNAME, TO_CHAR(A.STARTTIME, 'yyyy-MM-dd hh24') ");
        // builder.append("AS STARTTIME, c.CRAFTINFO AS CRAFTFEE, CASE WHEN TYPEID = '1' THEN 0 ELSE NVL(A.EVALUATE, ");
        // builder.append(" A.DURATION) END AS ESTHOUR, A.ID AS SID, A.CRAFTID, ROUND(( ");
        // builder.append("            SELECT SUM((NVL(NRCDTIME, SYSDATE) - LRCDTIME) / TO_NUMBER(NVL(PARTCOUNT, '0')) * 24) ");
        // builder.append("            FROM MD_PROCESS_RESUME ");
        // builder.append("            WHERE ISTIME = 0 AND PARTBARLISTCODE = A.PARTID ");
        // builder.append("                AND RSMID = A.MODULERESUMEID ");
        // builder.append("                AND LSCHEID = A.ID ");
        // builder.append("            ), 1) AS ACTHOUR, NVL(A.TYPEID, '0') AS TYPEID, B.ISENABLE ");
        // builder.append("    FROM MD_EST_SCHEDULE A ");
        // builder.append("    LEFT JOIN MD_PART_LIST B ON A.PARTID = B.PARTBARLISTCODE ");
        // builder.append("        LEFT JOIN MD_CRAFT C ON A.CRAFTID = C.ID ");
        // builder.append("    WHERE A.MODULERESUMEID = ? ");
        // builder.append("        AND B.PARTBARLISTCODE IS NOT NULL  ORDER BY PARTID, STARTTIME)TT");
        /**
         * *****************************************************************
         * 修改原因:成本汇总时间太慢<br>
         * 修改人：Rock <br>
         * 修改日期:2015-03-06
         ** ***************************************************************/
        builder.append("SELECT TT.PARTLISTCODE, TT.CRAFTNAME, TT.STARTTIME, TT.CRAFTFEE, TT.ESTHOUR ");
        builder.append(", TT.SID, TT.CRAFTID, ROUND(AR.ACTHOUR , 1) AS ACTHOUR, TT.TYPEID, TT.ISENABLE ");
        builder.append(", ROUND(TT.CRAFTFEE * AR.ACTHOUR, 1) AS PROFEE, ROUND(TT.CRAFTFEE * TT.ESTHOUR, 1) AS ESTFEE ");
        builder.append("FROM ( ");
        builder.append("    SELECT CASE WHEN ISENABLE = '1' THEN B.PARTLISTCODE || '(R)' ELSE B.PARTLISTCODE END AS PARTLISTCODE, ");
        builder.append("CASE WHEN C.CRAFTCODE IS NULL THEN NULL ELSE C.CRAFTNAME || '[' || C.CRAFTCODE || ']' END AS CRAFTNAME, ");
        builder.append("            TO_CHAR(A.STARTTIME, 'yyyy-MM-dd hh24') AS STARTTIME, c.CRAFTINFO AS CRAFTFEE, CASE WHEN TYPEID = '1' THEN 0 ELSE NVL(A.EVALUATE, 0) END AS ESTHOUR ");
        builder.append("        , A.ID AS SID, A.CRAFTID, A.PARTID, A.MODULERESUMEID, NVL(A.TYPEID, '0') AS TYPEID ");
        builder.append("        , B.ISENABLE ");
        builder.append("    FROM MD_EST_SCHEDULE A ");
        builder.append("    LEFT JOIN MD_PART_LIST B ON A.PARTID = B.PARTBARLISTCODE  ");
        builder.append("        LEFT JOIN MD_CRAFT C ON A.CRAFTID = C.ID ");
        builder.append("    WHERE A.MODULERESUMEID = ? AND B.PARTBARLISTCODE IS NOT NULL ) TT LEFT JOIN ( ");
        builder.append("        SELECT SUM((NVL(MPR.NRCDTIME, MPF.FINISHDATE) - MPR.LRCDTIME) / TO_NUMBER(NVL(MPR.PARTCOUNT, '1')) * 24) AS ACTHOUR, MPR.PARTBARLISTCODE, MPR.RSMID, MPR.LSCHEID ");
        builder.append("        FROM MD_PROCESS_RESUME MPR LEFT JOIN MD_PROCESS_FINISH MPF ON MPR.RSMID = MPF.MODULERESUMEID AND MPR.PARTBARLISTCODE = MPF.PARTBARLISTCODE");
        builder.append("        WHERE MPR.RSMID = ? ");
        builder.append("            AND MPR.ISTIME = 0 ");
        builder.append("        GROUP BY MPR.PARTBARLISTCODE, MPR.RSMID, MPR.LSCHEID ");
        builder.append("    ) AR ON TT.PARTID = AR.PARTBARLISTCODE ");
        builder.append("AND TT.MODULERESUMEID = AR.RSMID ");
        builder.append("AND TT.SID = AR.LSCHEID ");
        builder.append("ORDER BY TT.PARTID, TT.STARTTIME ");

        return this.find(builder.toString(), resumeid, resumeid);
    }

    /**
     * copy main part schedule,only copy new module sch<br>
     * RESUMESTATE=20401:new module
     * 
     * @param f_list
     * @param d_modify
     * @param h_modify
     * @param referBarcode
     * @return
     */
    public List<Record> findMainPartSchedule(String f_list, String d_modify, String h_modify, String referBarcode) {
        StringBuilder builder = new StringBuilder();
        builder.append("SELECT MSC.ID, MSC.SCHID, MPR.BARID AS PARTID, (MSC.STARTTIME ");
        builder.append(d_modify);
        builder.append(h_modify);
        builder.append(") AS STARTTIME");
        builder.append(", (MSC.ENDTIME ");
        builder.append(d_modify);
        builder.append(h_modify);
        builder.append(") AS ENDTIME");
        builder.append("    , MSC.CRAFTID, MSC.ISMERGE, MPR.RSMID AS MODULERESUMEID, MSC.RANKNUM, MSC.DURATION        ");
        builder.append("    , MPR.PBARCODE AS PARENTID, MSC.EVALUATE, MSC.ISFINISH, MSC.ISUSED, MSC.TYPEID            ");
        builder.append("FROM (                                                                                        ");
        builder.append("    SELECT A.PARTLIST, B.*                                                                    ");
        builder.append("    FROM (                                                                                    ");
        builder.append("        SELECT PARTBARCODE AS BARID, MODULEBARCODE, PARTCODE AS PARTLIST                      ");
        builder.append("        FROM MD_PART                                                                          ");
        builder.append("        WHERE MODULEBARCODE = ?) A, MD_EST_SCHEDULE B                                                                    ");
        builder.append("    WHERE A.BARID = B.PARTID                                                                  ");
        builder.append("        AND NVL(B.TYPEID, '0') = '0'                                                          ");
        builder.append(") MSC RIGHT JOIN (                                                                            ");
        builder.append("    SELECT A.UNITID, B.ID AS RSMID, BARID, PBARCODE                                           ");
        builder.append("    FROM (                                                                                    ");
        builder.append("        SELECT PARTBARCODE AS BARID, PARTCODE AS UNITID, MP.MODULEBARCODE, NULL AS PBARCODE   ");
        builder.append("        FROM MD_PART MP                                                                       ");
        builder.append("        WHERE MP.MODULEBARCODE IN                                                             ");
        builder.append(f_list);
        builder.append(" ) A                                                                                          ");
        // copy new module sch:B.RESUMESTATE=20401
        builder.append("        LEFT JOIN MD_RESUME B ON A.MODULEBARCODE = B.MODULEBARCODE WHERE B.RESUMESTATE=20401  ");
        builder.append(") MPR                                                                                         ");
        builder.append("ON MSC.PARTLIST = MPR.UNITID                                                               ");

        return Db.find(builder.toString(), referBarcode);
    }

    /**
     * copy sub part schedule,only copy new module sch<br>
     * RESUMESTATE=20401:new module
     * 
     * @param f_list
     * @param d_modify
     * @param h_modify
     * @param referBarcode
     * @return
     */
    public List<Record> findSubPartSchedule(String f_list, String d_modify, String h_modify, String referBarcode) {
        StringBuilder builder = new StringBuilder();
        builder.append("SELECT MSC.ID, MSC.SCHID, MPR.BARID AS PARTID, (MSC.STARTTIME ");
        builder.append(d_modify);
        builder.append(h_modify);
        builder.append(") AS STARTTIME");
        builder.append(", (MSC.ENDTIME ");
        builder.append(d_modify);
        builder.append(h_modify);
        builder.append(") AS ENDTIME");
        builder.append("    , MSC.CRAFTID, MSC.ISMERGE, MPR.RSMID AS MODULERESUMEID, MSC.RANKNUM, MSC.DURATION        ");
        builder.append("    , MPR.PBARCODE AS PARENTID, MSC.EVALUATE, MSC.ISFINISH, MSC.ISUSED, MSC.TYPEID            ");
        builder.append("FROM (                                                                                        ");
        builder.append("    SELECT A.PARTLIST, B.*                                                                    ");
        builder.append("    FROM (                                                                                ");
        builder.append("        SELECT PARTBARLISTCODE AS BARID, MODULEBARCODE, PARTLISTCODE AS PARTLIST              ");
        builder.append("        FROM MD_PART_LIST                                                                     ");
        builder.append("        WHERE MODULEBARCODE = ?                                                               ");
        builder.append("            AND ISENABLE = '0'                                                                ");
        builder.append("    ) A, MD_EST_SCHEDULE B                                                                    ");
        builder.append("    WHERE A.BARID = B.PARTID                                                                  ");
        builder.append("        AND NVL(B.TYPEID, '0') = '0'                                                          ");
        builder.append(") MSC RIGHT JOIN (                                                                            ");
        builder.append("    SELECT A.UNITID, B.ID AS RSMID, BARID, PBARCODE                                           ");
        builder.append("    FROM (                                                                                ");
        builder.append("        SELECT MPL.PARTBARLISTCODE AS BARID, MPL.PARTLISTCODE AS UNITID, MPL.MODULEBARCODE    ");
        builder.append("        , MPL.PARTBARCODE AS PBARCODE FROM MD_PART_LIST MPL                                   ");
        builder.append("        WHERE MPL.MODULEBARCODE IN                                                            ");
        builder.append(f_list);
        builder.append("            AND ISENABLE = '0'                                                                ");
        builder.append("    ) A                                                                                       ");
        // copy new module sch:B.RESUMESTATE=20401
        builder.append("        LEFT JOIN MD_RESUME B ON A.MODULEBARCODE = B.MODULEBARCODE WHERE B.RESUMESTATE=20401  ");
        builder.append(") MPR                                                                                         ");
        builder.append("ON MSC.PARTLIST = MPR.UNITID                                                               ");

        return Db.find(builder.toString(), referBarcode);
    }

    /**
     * 得到模具相应履历的计划排程
     * 
     * @param moduleResumeId
     *            履历号
     * @return
     */
    public List<Record> findModuleResumeSchedule(Object moduleResumeId) {
        StringBuilder sql = new StringBuilder();
        sql.append("SELECT MPI.PARTBARLISTCODE,                                                                   ");
        sql.append("       (SELECT MC.CRAFTCODE FROM MD_CRAFT MC WHERE MC.ID = MES.CRAFTID) AS FLOWCRAFTCODE,     ");
        sql.append("       MES.ENDTIME,                                                                           ");
        sql.append("       MES.RANKNUM,                                                                           ");
        sql.append("       MPI.NOWCRAFTCODE,                                                                      ");
        sql.append("       MPI.PARTSTATEID,                                                                       ");
        sql.append("       (SELECT NAME FROM MD_PROCESS_STATE WHERE ID = MPI.PARTSTATEID) AS LSTATENAME           ");
        sql.append("  FROM (SELECT PARTBARLISTCODE,                                                               ");
        sql.append("               PARTSTATEID,                                                                   ");
        sql.append("               (SELECT MC.CRAFTCODE FROM MD_CRAFT MC WHERE MC.ID = BB.CRAFTID) AS NOWCRAFTCODE");
        sql.append("          FROM (SELECT PARTBARLISTCODE,                                                       ");
        sql.append("                       PARTSTATEID,                                                           ");
        sql.append("                       CURSORID,                                                              ");
        sql.append("                       (SELECT LPROCRAFTID                                                    ");
        sql.append("                          FROM MD_PROCESS_RESUME                                              ");
        sql.append("                         WHERE ID = CURSORID) AS CRAFTID                                      ");
        sql.append("                  FROM MD_PROCESS_INFO                                                        ");
        sql.append("                 WHERE MODULERESUMEID = ?                                                     ");
        sql.append("                 ORDER BY PARTBARLISTCODE) BB) MPI                                            ");
        sql.append("  LEFT JOIN MD_EST_SCHEDULE MES                                                               ");
        sql.append("    ON MES.PARTID = MPI.PARTBARLISTCODE                                                       ");
        sql.append(" WHERE MES.TYPEID IS NULL                                                                     ");
        sql.append(" ORDER BY MPI.PARTBARLISTCODE, MES.RANKNUM                                                    ");

        return Db.find(sql.toString(), moduleResumeId);
    }

    /**
     * 得到按客户格式导出的模具工件计划排程
     * 
     * @param moduleResumeId
     *            模具履历号
     * @return
     */
    public List<Record> findModuleScheduleOfCustomer(Object moduleResumeId) {
        StringBuilder sql = new StringBuilder();
        sql.append("SELECT MPI.PARTCODE,                                                            ");
        sql.append("       (SELECT CRAFTCODE FROM MD_CRAFT WHERE ID = MES.CRAFTID) AS FLOWCRAFTCODE,");
        sql.append("       MES.STARTTIME,                                                           ");
        sql.append("       MES.ENDTIME,MES.ID AS SCHID                                              ");
        sql.append("  FROM (SELECT PARTBARCODE, PARTCODE                                            ");
        sql.append("          FROM MD_PART                                                          ");
        sql.append("         WHERE MODULEBARCODE =                                                  ");
        sql.append("               (SELECT MODULEBARCODE FROM MD_RESUME WHERE ID = ?)               ");
        sql.append("           AND PARTCODE IN ('100', '200')) MPI                                  ");
        sql.append("  LEFT JOIN MD_EST_SCHEDULE MES                                                 ");
        sql.append("    ON MES.PARTID = MPI.PARTBARCODE                                             ");
        sql.append(" WHERE MES.TYPEID IS NULL AND MES.ID IS NOT NULL                                ");
        sql.append(" ORDER BY MPI.PARTBARCODE, MES.RANKNUM                                          ");
        return Db.find(sql.toString(), moduleResumeId);
    }

    /**
     * 得到按客户格式导出的模具工件实际加工赶时间
     * 
     * @param moduleResumeId
     *            模具履历号
     * @return
     */
    public List<Record> findModuleActualOfCustomer(Object moduleResumeId) {
        StringBuilder sql = new StringBuilder();

        sql.append("SELECT MPR.LSCHEID,                                                            ");
        // sql.append("     (SELECT PARTCODE                                                          ");
        // sql.append("        FROM MD_PART                                                           ");
        // sql.append("       WHERE PARTBARCODE =                                                     ");
        // sql.append("             (SELECT PARTBARCODE                                               ");
        // sql.append("                FROM MD_PART_LIST                                              ");
        // sql.append("               WHERE PARTBARLISTCODE = MPR.PARTBARLISTCODE)) PARTCODE,         ");
        sql.append("    (SELECT CRAFTCODE FROM MD_CRAFT WHERE ID = MPR.LPROCRAFTID) AS LPROCRAFT,  ");
        sql.append("    MPR.LPARTSTATEID,                                                          ");
        sql.append("    MPR.LRCDTIME,                                                              ");
        sql.append("    (SELECT CRAFTCODE FROM MD_CRAFT WHERE ID = MPR.NPROCRAFTID) AS NPROCRAFT,  ");
        sql.append("    MPR.NPARTSTATEID,                                                          ");
        sql.append("    MPR.NSCHEID,                                                               ");
        sql.append("    MPR.NRCDTIME                                                               ");
        sql.append("FROM (SELECT PARTBARLISTCODE                                                   ");
        sql.append("       FROM MD_PART_LIST                                                       ");
        sql.append("      WHERE MODULEBARCODE =                                                    ");
        sql.append("            (SELECT MODULEBARCODE FROM MD_RESUME WHERE ID = ?)                 ");
        sql.append("        AND (PARTROOTCODE LIKE '100%' OR PARTROOTCODE LIKE '200%')) MT         ");
        sql.append("LEFT JOIN MD_PROCESS_RESUME MPR                                                ");
        sql.append("    ON MPR.PARTBARLISTCODE = MT.PARTBARLISTCODE                                ");
        sql.append("WHERE MPR.RSMID = ?                                                            ");
        sql.append("    AND MPR.LPROCRAFTID IS NOT NULL                                            ");
        sql.append("ORDER BY MPR.PARTBARLISTCODE, MPR.LRCDTIME                                     ");

        return Db.find(sql.toString(), moduleResumeId, moduleResumeId);
    }

    /**
     * 查询模具安排排程的零件讯息
     * 
     * @param resumeid
     * @return
     */
    public List<ModuleEstSchedule> getModuleScheduleInfo(String resumeid) {
        StringBuilder builder = new StringBuilder();

        builder.append("SELECT MEP.PARTID AS PARTBARLISTCODE, MPL.PARTLISTCODE, MP.CNAMES FROM ( ");
        builder.append("SELECT DISTINCT PARTID FROM MD_EST_SCHEDULE WHERE MODULERESUMEID = ? AND PARTID LIKE '107%' ) MEP ");

        builder.append("LEFT JOIN MD_PART_LIST MPL ON MEP.PARTID = MPL.PARTBARLISTCODE ");
        builder.append("LEFT JOIN MD_PART MP ON MPL.PARTBARCODE = MP.PARTBARCODE WHERE MPL.ISENABLE = 0");

        return this.find(builder.toString(), resumeid);
    }

    /**
     * 获取模具排程详情
     * 
     * @param resumeid
     * @param parts
     * @return
     */
    public List<ModuleEstSchedule> getModuleScheduleContent(String resumeid, List<String> parts) {
        StringBuilder builder = new StringBuilder();

        builder.append("SELECT ML.MODULECODE, MPL.PARTBARLISTCODE, MPL.PARTLISTCODE, MPL.PICCODE, MPL.QUANTITY, MP.MATERIAL, MPL.HARDNESS, MPL.REMARK AS INTRO, MPL.BUFFING, MPL.MATERIALSRC, MPL.MATERIALTYPE, MPL.TOLERANCE, MPL.REFORM ");
        builder.append(", TO_CHAR(ML.STARTTIME,'yyyy/mm/dd') AS STARTTIME, TO_CHAR(ML.INITTRYTIME,'yyyy/mm/dd') AS INITTRYTIME, MES.RANKNUM, MC.CRAFTNAME, MES.REMARK , TO_CHAR(MES.ENDTIME,'mm/dd') AS ENDTIME, MES.EVALUATE * MC.CRAFTINFO AS FEE ");
        builder.append("FROM MD_EST_SCHEDULE MES LEFT JOIN MD_PART_LIST MPL ON MES.PARTID = MPL.PARTBARLISTCODE  ");
        builder.append("LEFT JOIN MD_PART MP ON MPL.PARTBARCODE = MP.PARTBARCODE LEFT JOIN MODULELIST ML ON MPL.MODULEBARCODE = ML.MODULEBARCODE ");
        builder.append("LEFT JOIN MD_CRAFT MC ON MES.CRAFTID = MC.ID WHERE MES.MODULERESUMEID = ? AND MES.TYPEID IS NULL AND MES.PARTID IN ")
               .append(DBUtils.sqlIn(parts))
               .append(" ORDER BY MES.PARTID, MES.RANKNUM");

        return this.find(builder.toString(), resumeid);
    }
}
