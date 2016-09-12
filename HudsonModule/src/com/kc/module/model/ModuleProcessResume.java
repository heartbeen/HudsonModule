package com.kc.module.model;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.model.form.EmployeeProcessForm;
import com.kc.module.model.form.EmployeeProcessPartForm;
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.StringUtils;

public class ModuleProcessResume extends ModelFinal<ModuleProcessResume> {

    /**
         * 
         */
    private static final long serialVersionUID = 1L;
    public static ModuleProcessResume dao = new ModuleProcessResume();

    /**
     * 得到指定模具的工件所有的实际加工流程
     * 
     * @param moduleResumeId
     * @param page
     * @param start
     * @param limit
     * @return
     */
    public List<Record> findActualProcessFlow(Object moduleResumeId, int page, int start, int limit, Object pcode, boolean chk) {
        StringBuilder sql = new StringBuilder();

        // sql.append("SELECT *                                                         ");
        // sql.append(" FROM (SELECT M.PARTBARLISTCODE,                                 ");
        // sql.append("              M.PARTSTATEID,                                     ");
        // sql.append("              M.DEPARTNAME,                                      ");
        // sql.append("              (SELECT MC.CRAFTCODE                               ");
        // sql.append("                 FROM MD_CRAFT MC                                ");
        // sql.append("                WHERE MC.ID = MPR.LPROCRAFTID) AS NCRAFT,        ");
        // sql.append("              MPR.NRCDTIME,                                      ");
        // sql.append("              MPR.LPROCRAFTID,                                   ");
        // sql.append("              MPR.LPARTSTATEID,                                  ");
        // sql.append("              (SELECT SUBSTR(STEPID,0,6) FROM REGION_DEPART  WHERE ID=MPR.LDEPTID) AS LDEPTID  ");
        // sql.append("         FROM (SELECT PARTBARLISTCODE,                           ");
        // sql.append("                      MODULERESUMEID,                            ");
        // sql.append("                      PARTSTATEID,                               ");
        // sql.append("                      DEPARTNAME                                 ");
        // sql.append("                 FROM (SELECT A.*, ROWNUM AS RN                  ");
        // sql.append("                         FROM (SELECT S.PARTBARLISTCODE,         ");
        // sql.append("                                      S.MODULERESUMEID,          ");
        // sql.append("                                      S.PARTSTATEID,             ");
        // sql.append("                                      N.NAME AS DEPARTNAME       ");
        // sql.append("                                 FROM MD_PROCESS_INFO S          ");
        // sql.append("                                 LEFT JOIN REGION_DEPART N       ");
        // sql.append("                                   ON S.CURRENTDEPTID = N.ID     ");
        // sql.append("                                WHERE MODULERESUMEID = ?         ");
        // sql.append("                                ORDER BY PARTBARLISTCODE) A      ");
        // sql.append("                        WHERE ROWNUM <= ? * ?)                   ");
        // sql.append("                WHERE RN > (? - 1) * ?) M                        ");
        // sql.append("         LEFT JOIN MD_PROCESS_RESUME MPR                         ");
        // sql.append("           ON MPR.PARTBARLISTCODE = M.PARTBARLISTCODE            ");
        // sql.append("          AND MPR.RSMID = M.MODULERESUMEID)                      ");
        // sql.append("ORDER BY PARTBARLISTCODE, NRCDTIME                               ");

        Object[] params = null;

        sql.append("SELECT MP.*, MPR.LPROCRAFTID, MPR.LPARTSTATEID, MPR.LDEPTID, LRCDTIME, POD.OUTFACTORYID, POD.OUTGUESTNAME ");
        sql.append(", NVL(NRCDTIME,BACKTIME) AS NRCDTIME, MC.CRAFTCODE, POD.OUTCRAFTID, POD.OUTCRAFTCODE FROM ( ");
        if (StringUtils.isEmpty(pcode)) {
            sql.append(" SELECT PARTBARLISTCODE, MODULERESUMEID, PARTSTATEID, DEPARTNAME FROM ( ");
            sql.append(" SELECT A.*, ROWNUM AS RN FROM ( ");
            sql.append(" SELECT S.PARTBARLISTCODE, S.MODULERESUMEID, S.PARTSTATEID, N.NAME AS DEPARTNAME FROM ");

            if (!chk) {
                sql.append("(SELECT * FROM (SELECT AA.*,(SELECT COUNT(*) FROM  MD_EST_SCHEDULE ");
                sql.append("WHERE MODULERESUMEID = AA.MODULERESUMEID  AND PARTID = AA.PARTBARLISTCODE ");
                sql.append(") AS ECOUNT FROM MD_PROCESS_INFO AA) WHERE ECOUNT > 0)");

            } else {
                sql.append(" MD_PROCESS_INFO ");
            }

            sql.append("                S LEFT JOIN REGION_DEPART N ON S.CURRENTDEPTID = N.ID  ");
            sql.append("            WHERE MODULERESUMEID = ? ");
            sql.append("            ORDER BY PARTBARLISTCODE ) A ");
            sql.append("        WHERE ROWNUM <= ? * ? )");
            sql.append("    WHERE RN > (? - 1) * ?");

            params = new Object[]{moduleResumeId, page, limit, page, limit};
        } else {
            sql.append("SELECT S.PARTBARLISTCODE, S.MODULERESUMEID, S.PARTSTATEID, N.NAME AS DEPARTNAME FROM ");

            if (!chk) {
                sql.append("(SELECT * FROM (SELECT AA.*,(SELECT COUNT(*) FROM  MD_EST_SCHEDULE ");
                sql.append("WHERE MODULERESUMEID = AA.MODULERESUMEID  AND PARTID = AA.PARTBARLISTCODE ");
                sql.append(") AS ECOUNT FROM MD_PROCESS_INFO AA) WHERE ECOUNT > 0)");

            } else {
                sql.append(" MD_PROCESS_INFO ");
            }
            sql.append(" S LEFT JOIN REGION_DEPART N ON S.CURRENTDEPTID = N.ID LEFT JOIN MD_PART_LIST K ");
            sql.append("ON S.PARTBARLISTCODE = K.PARTBARLISTCODE ");
            sql.append("WHERE S.MODULERESUMEID = ? AND K.PARTLISTCODE LIKE ?||'%' ORDER BY S.PARTBARLISTCODE ");

            params = new Object[]{moduleResumeId, pcode};
        }

        sql.append(") MP LEFT JOIN (SELECT * FROM MD_PROCESS_RESUME WHERE (ISTIME = 0 OR OUTID IS NOT NULL) AND INVISIBLE = 0) MPR ");
        sql.append(" ON MP.MODULERESUMEID = MPR.RSMID AND MP.PARTBARLISTCODE = MPR.PARTBARLISTCODE  ");
        sql.append("    LEFT JOIN MD_CRAFT MC ON MPR.LPROCRAFTID = MC.ID LEFT JOIN PART_OUTBOUND POD ON MPR.OUTID = POD.ID ");
        sql.append("ORDER BY MP.PARTBARLISTCODE, MPR.LRCDTIME");

        return Db.find(sql.toString(), params);
    }

    /**
     * 得到指定模具的工件所有的实际加工流程
     * 
     * @param moduleResumeId
     * @param page
     * @param start
     * @param limit
     * @return
     */
    public List<Record> findActualProcessFlow(Object moduleResumeId) {
        StringBuilder sql = new StringBuilder();

        sql.append("SELECT *                                                         ");
        sql.append(" FROM (SELECT M.PARTBARLISTCODE,                                 ");
        sql.append("              M.PARTSTATEID,                                     ");
        sql.append("              M.DEPARTNAME,                                      ");
        sql.append("              (SELECT MC.CRAFTCODE                               ");
        sql.append("                 FROM MD_CRAFT MC                                ");
        sql.append("                WHERE MC.ID = MPR.LPROCRAFTID) AS NCRAFT,        ");
        sql.append("              MPR.NRCDTIME,                                      ");
        sql.append("              MPR.LPROCRAFTID,                                   ");
        sql.append("              MPR.LPARTSTATEID,                                  ");
        sql.append("              (SELECT SUBSTR(STEPID,0,6) FROM REGION_DEPART  WHERE ID=MPR.LDEPTID) AS LDEPTID  ");
        sql.append("         FROM (SELECT PARTBARLISTCODE,                           ");
        sql.append("                      MODULERESUMEID,                            ");
        sql.append("                      PARTSTATEID,                               ");
        sql.append("                      DEPARTNAME                                 ");
        sql.append("                 FROM (SELECT A.*, ROWNUM AS RN                  ");
        sql.append("                         FROM (SELECT S.PARTBARLISTCODE,         ");
        sql.append("                                      S.MODULERESUMEID,          ");
        sql.append("                                      S.PARTSTATEID,             ");
        sql.append("                                      N.NAME AS DEPARTNAME       ");
        sql.append("                                 FROM MD_PROCESS_INFO S          ");
        sql.append("                                 LEFT JOIN REGION_DEPART N       ");
        sql.append("                                   ON S.CURRENTDEPTID = N.ID     ");
        sql.append("                                WHERE MODULERESUMEID = ?         ");
        sql.append("                                ORDER BY PARTBARLISTCODE) A )) M ");
        sql.append("         LEFT JOIN MD_PROCESS_RESUME MPR                         ");
        sql.append("           ON MPR.PARTBARLISTCODE = M.PARTBARLISTCODE            ");
        sql.append("          AND MPR.RSMID = M.MODULERESUMEID)                      ");
        sql.append("ORDER BY PARTBARLISTCODE, NRCDTIME                               ");

        return Db.find(sql.toString(), moduleResumeId);
    }

    /**
     * 查找模具的所有工艺加工工艺
     * 
     * @param resumeIds
     * @return
     */
    public List<Record> findModuleWorktime(String[] resumeIds) {

        StringBuilder sql = new StringBuilder();
        sql.append("SELECT MC.CRAFTNAME, C.WORKTIMES, MC.CRAFTINFO ");
        sql.append("FROM (SELECT MPP.LPROCRAFTID, NVL(SUM((NVL(MPP.NRCDTIME, SYSDATE) -  ");
        sql.append("MPP.LRCDTIME) * 24), 0) AS WORKTIMES ");
        sql.append("FROM MD_PROCESS_RESUME MPP WHERE  ");

        if (!resumeIds.equals(null)) {
            sql.append("MPP.RSMID IN (");
            for (int i = 0; i < resumeIds.length; i++) {
                sql.append("'").append(resumeIds[i]).append(i == resumeIds.length - 1 ? "'" : "',");
            }
            sql.append(") AND  ");
        }

        sql.append(" MPP.ISTIME = '0' GROUP BY MPP.LPROCRAFTID ");
        sql.append(") C LEFT JOIN MD_CRAFT MC ON MC.ID = C.LPROCRAFTID  ");
        sql.append("ORDER BY MC.ID ");

        return Db.find(sql.toString());
    }

    /**
     * 得到指定模具或指定时间区间内,模具加工人员所有工时
     * 
     * @param resumeIds
     * @return
     */
    public List<Record> findEmployeeWorktime(String[] resumeIds, Date[] dateSpan) {

        StringBuilder sql = new StringBuilder();

        sql.append("SELECT MPP.LEMPID, MPP.LPROCRAFTID, NVL(SUM((NVL(MPP.NRCDTIME, SYSDATE) - MPP.LRCDTIME) * 24), 0) AS WORKTIMES ");
        sql.append("FROM MD_PROCESS_RESUME MPP WHERE  ");

        if (!resumeIds.equals(null)) {
            sql.append("MPP.RSMID IN (");
            for (int i = 0; i < resumeIds.length; i++) {
                sql.append("'").append(resumeIds[i]).append(i == resumeIds.length - 1 ? "'" : "',");
            }
            sql.append(") AND  ");
        }

        if (!dateSpan.equals(null)) {
            sql.append("MPP.NRCDTIME BETWEEN TO_DATE('");
            sql.append(DateUtils.dateToStr(dateSpan[0], DateUtils.DEFAULT_DATE_FORMAT));
            sql.append("', 'YYYY-MM-DD HH24:MI:SS') AND TO_DATE('");
            sql.append(DateUtils.dateToStr(dateSpan[1], DateUtils.DEFAULT_DATE_FORMAT));
            sql.append("', 'YYYY-MM-DD HH24:MI:SS') AND  ");
        }

        sql.append("MPP.ISTIME = '0' GROUP BY MPP.LEMPID, MPP.LPROCRAFTID ");

        return Db.find(sql.toString());
    }

    public List<ModuleProcessResume> getModuleResumePartList(String resumeid) {
        StringBuilder builder = new StringBuilder();
        builder.append("SELECT a.PARTBARLISTCODE, c.PARTLISTCODE, CASE WHEN b.PARTBARLISTCODE IS NOT NULL THEN '0' ELSE '1' END AS PFLAG ");
        builder.append(" ,b.MODULERESUMEID AS RESUMEID FROM ( ");
        builder.append("SELECT DISTINCT PARTBARLISTCODE AS PARTBARLISTCODE ");
        builder.append("FROM MD_PROCESS_RESUME ");
        builder.append("WHERE RSMID = ?");
        builder.append(") a ");
        builder.append("LEFT JOIN MD_PROCESS_INFO b ON a.PARTBARLISTCODE = b.PARTBARLISTCODE  ");
        builder.append("LEFT JOIN MD_PART_LIST c ON a.PARTBARLISTCODE = c.PARTBARLISTCODE  ");
        builder.append("ORDER BY c.PARTLISTCODE ");

        return this.find(builder.toString(), resumeid);
    }

    /**
     * 获取工件的加工明细
     * 
     * @param resumeid
     * @param partbarlistcode
     * @param start
     * @param end
     * @return
     */
    public List<ModuleProcessResume> getModuleProcessDetails(String resumeid, String partbarlistcode, String start, String end) {
        StringBuilder builder = new StringBuilder();

        builder.append("SELECT b.PARTLISTCODE, d.NAME AS DEPARTMENT, c.BATCHNO, e.EMPNAME, e.WORKNUMBER ");
        builder.append(",(SELECT NAME FROM MD_PROCESS_STATE WHERE ID = a.LDEVSTATEID) AS DEVSTATE ");
        builder.append(",(SELECT NAME FROM MD_PROCESS_STATE WHERE ID = a.LEMPACTID) AS EMPSTATE ");
        builder.append(", TO_CHAR(a.LRCDTIME,'yyyy-MM-dd hh24:mi:ss') AS STARTTIME, ");
        builder.append("TO_CHAR(NVL(a.NRCDTIME,SYSDATE),'yyyy-MM-dd hh24:mi:ss') AS ENDTIME");
        builder.append(", a.PARTMERGEID, ROUND((NVL(a.NRCDTIME,SYSDATE) - a.LRCDTIME) * 24 / ");
        builder.append("TO_NUMBER(NVL(a.PARTCOUNT, '0')), 2) AS USEHOUR, a.ISTIME ");
        builder.append("FROM MD_PROCESS_RESUME a ");
        builder.append("LEFT JOIN MD_PART_LIST b ON a.PARTBARLISTCODE = b.PARTBARLISTCODE ");
        builder.append("LEFT JOIN DEVICE_DEPART_RESUME c ON a.LDEVDEPARTID = c.DEVPARTID ");
        builder.append("LEFT JOIN REGION_DEPART d ON a.LDEPTID = d.ID ");
        builder.append("LEFT JOIN EMPLOYEE_INFO e ON a.LEMPID = e.ID ");
        builder.append("WHERE a.PARTBARLISTCODE = ? AND a.RSMID = ? ");
        builder.append("AND a.LRCDTIME >= TO_DATE(?,'yyyy-MM-dd hh24:mi:ss') AND a.LRCDTIME < ");
        builder.append("TO_DATE(?,'yyyy-MM-dd hh24:mi:ss') ORDER BY a.LRCDTIME");

        return this.find(builder.toString(), partbarlistcode, resumeid, start, end);
    }

    /**
     * 按时间查询部门员工的加工工时等讯息
     * 
     * @param deptid
     * @param start
     * @param end
     * @return
     */
    public List<Record> getEmployeeProcessRows(String deptid, String start, String end) {
        StringBuilder builder = new StringBuilder();

        builder.append("SELECT a.*, b.POSID, b.EMPNAME||'['||b.WORKNUMBER||']' AS EMPNAME, ( ");
        builder.append("        SELECT NAME ");
        builder.append("        FROM REGION_DEPART ");
        builder.append("        WHERE ID = a.LDEPTID ");
        builder.append("        ) AS LNAME, ( ");
        builder.append("        SELECT NAME ");
        builder.append("        FROM REGION_DEPART ");
        builder.append("        WHERE ID = b.POSID ");
        builder.append("        ) AS PNAME ");
        builder.append("FROM ( ");
        builder.append("    SELECT CASE WHEN LRCDTIME < TO_DATE(?, 'yyyy-MM-dd hh24:mi:ss') ");
        builder.append("THEN TO_DATE(?, 'yyyy-MM-dd hh24:mi:ss') ELSE LRCDTIME END AS STARTTIME,");
        builder.append(" CASE WHEN NVL(NRCDTIME, SYSDATE) > TO_DATE(?, 'yyyy-MM-dd hh24:mi:ss')");
        builder.append(" THEN TO_DATE(?, 'yyyy-MM-dd hh24:mi:ss') ELSE NVL(NRCDTIME, SYSDATE) ");
        builder.append(" END AS ENDTIME, LEMPID, LDEPTID, CASE WHEN NVL(NRCDTIME, SYSDATE) <= TO_DATE(?, ");
        builder.append("'yyyy-MM-dd hh24:mi:ss') THEN 0 WHEN LRCDTIME >= TO_DATE(?, 'yyyy-MM-dd hh24:mi:ss')");
        builder.append("  THEN 0 ELSE 1 END AS RFLAG FROM MD_PROCESS_RESUME m ");
        builder.append("        LEFT JOIN REGION_DEPART r ON m.LDEPTID = r.ID ");
        builder.append("    WHERE m.ISTIME = '0' ");
        builder.append("        AND r.STEPID LIKE ? ");
        builder.append(") a ");
        builder.append("    LEFT JOIN EMPLOYEE_INFO b ON a.LEMPID = b.ID ");
        builder.append("WHERE RFLAG = 1 ");
        builder.append("ORDER BY a.STARTTIME ");

        return Db.find(builder.toString(), start, start, end, end, start, end, deptid + "%");
    }

    /**
     * 获取查询范围内的员工加工讯息
     * 
     * @param rcd
     * @return
     */
    public List<Object> getEmployeeProcessInfo(String deptid, String startdate, String enddate) {
        // 获取从数据库获取的资料的相关明细
        List<Record> rcd = this.getEmployeeProcessRows(deptid, startdate, enddate);

        // 如果查询记录为空或者内容长度为0则直接返回结果
        if (rcd == null || rcd.size() == 0) {
            return new ArrayList<Object>();
        }
        // 初始化Record集合用于获取员工明细
        LinkedHashMap<Object, Object> eRcd = new LinkedHashMap<Object, Object>();
        // 获取开始时间和结束时间的间隔小时数
        double interal = DateUtils.getDateTimeFieldInternal(startdate, enddate, null, 10, 2);
        for (Record r : rcd) {
            String empid = StringUtils.parseString(r.get("LEMPID"));
            // 判断EMPID是否为空,如果为空,则跳过该项
            if (StringUtils.isEmpty(empid)) {
                continue;
            }

            String empname = StringUtils.parseString(r.get("EMPNAME"));
            String start = DateUtils.getTimeStampString((Timestamp) r.get("STARTTIME"), null);
            String end = DateUtils.getTimeStampString((Timestamp) r.get("ENDTIME"), null);
            String lname = StringUtils.parseString(r.get("LNAME"));
            String pname = StringUtils.parseString(r.get("PNAME"));

            if (eRcd.containsKey(empid)) {
                EmployeeProcessForm frm = (EmployeeProcessForm) eRcd.get(empid);
                double rStart = DateUtils.getDateTimeFieldInternal(frm.getEndTime(), start, null, 10, 2);
                double rEnd = DateUtils.getDateTimeFieldInternal(frm.getEndTime(), end, null, 10, 2);
                if (rStart > 0 && rEnd > 0) {
                    frm.setEndTime(end);
                    frm.setAppendActHour(rEnd - rStart);
                } else if (rStart <= 0 && rEnd > 0) {
                    frm.setEndTime(end);
                    frm.setAppendActHour(rEnd + rStart);
                }
            } else {
                // 设置员工的相关讯息
                EmployeeProcessForm frm = new EmployeeProcessForm();
                double rTime = DateUtils.getDateTimeFieldInternal(start, end, null, 10, 2);

                frm.setEmpId(empid);
                frm.setEmpName(empname);
                frm.setStartTime(start);
                frm.setActHour(rTime);
                frm.setEndTime(end);
                frm.setlName(lname);
                frm.setpName(pname);
                frm.setTotalHour(interal);

                eRcd.put(empid, frm);
            }
        }

        return transMapToList(eRcd);
    }

    /**
     * 将Map的Value转存到List集合中
     * 
     * @param map
     * @return
     */
    private List<Object> transMapToList(Map<Object, Object> map) {
        List<Object> list = new ArrayList<Object>();
        if (map == null) {
            return (null);
        }

        for (Object key : map.keySet()) {
            list.add(map.get(key));
        }

        return list;
    }

    public List<ModuleProcessResume> getEmployeeProcessPartRows(String empid, String start, String end) {
        StringBuilder builder = new StringBuilder();
        builder.append("SELECT a.*, (a.ENDTIME - a.STARTTIME) * 24 AS USEHOUR, b.PARTLISTCODE, c.PARTCODE, d.MODULECODE ");
        builder.append("    , ( ");
        builder.append("        SELECT NAME ");
        builder.append("        FROM REGION_DEPART ");
        builder.append("        WHERE ID = a.LDEPTID ");
        builder.append("        ) AS DEPTNAME, ( ");
        builder.append("        SELECT NAME ");
        builder.append("        FROM MD_PROCESS_STATE ");
        builder.append("        WHERE ID = a.STATEID ");
        builder.append("        ) AS STATENAME ");
        builder.append("FROM ( ");
        builder.append("    SELECT CASE WHEN LRCDTIME < TO_DATE(?, 'yyyy-MM-dd hh24:mi:ss') ");
        builder.append(" THEN TO_DATE(?, 'yyyy-MM-dd hh24:mi:ss') ELSE LRCDTIME END AS STARTTIME,");
        builder.append(" CASE WHEN NVL(NRCDTIME, SYSDATE) > TO_DATE(?, 'yyyy-MM-dd hh24:mi:ss') ");
        builder.append(" THEN TO_DATE(?, 'yyyy-MM-dd hh24:mi:ss') ELSE NVL(NRCDTIME, SYSDATE)");
        builder.append(" END AS ENDTIME, PARTBARLISTCODE, NVL(NPARTSTATEID, LPARTSTATEID) AS STATEID, LDEPTID ");
        builder.append("        , CASE WHEN NVL(NRCDTIME, SYSDATE) <= TO_DATE(?, 'yyyy-MM-dd hh24:mi:ss') ");
        builder.append(" THEN 0 WHEN LRCDTIME >= TO_DATE(?, 'yyyy-MM-dd hh24:mi:ss') THEN 0 ELSE 1 END AS RFLAG ");
        builder.append("    FROM MD_PROCESS_RESUME m ");
        builder.append("        LEFT JOIN REGION_DEPART r ON m.LDEPTID = r.ID  ");
        builder.append("    WHERE m.ISTIME = '0' ");
        builder.append("        AND LEMPID = ? ");
        builder.append(") a ");
        builder.append("LEFT JOIN MD_PART_LIST b ON a.PARTBARLISTCODE = b.PARTBARLISTCODE ");
        builder.append("LEFT JOIN MD_PART c ON b.PARTBARCODE = c.PARTBARCODE ");
        builder.append("    LEFT JOIN MODULELIST d ON b.MODULEBARCODE = d.MODULEBARCODE ");
        builder.append("WHERE RFLAG = 1 ");
        builder.append("ORDER BY a.STARTTIME ");

        return this.find(builder.toString(), start, start, end, end, start, end, empid);
    }

    /**
     * 按时间查询员工加工工件的相关讯息
     * 
     * @param empid
     * @param start
     * @param end
     * @return
     */
    public List<Object> getEmployeeProcessPartInfo(String empid, String start, String end) {
        // 查询的员工加工机台部件资料
        List<ModuleProcessResume> rcd = this.getEmployeeProcessPartRows(empid, start, end);
        // 初始化缓存集合.如果数据为空,则返回一个空的集合
        LinkedHashMap<Object, Object> list = new LinkedHashMap<Object, Object>();
        if (rcd == null) {
            return new ArrayList<Object>();
        }

        for (ModuleProcessResume mpr : rcd) {
            // 获取查询的工件条码号,如果为空,则跳过该行
            String partbarlistcode = StringUtils.parseString(mpr.get("PARTBARLISTCODE"));
            if (StringUtils.isEmpty(partbarlistcode)) {
                continue;
            }

            String partlistcode = StringUtils.parseString(mpr.get("PARTLISTCODE"));
            String partcode = StringUtils.parseString(mpr.get("PARTCODE"));
            String modulecode = StringUtils.parseString(mpr.get("MODULECODE"));
            String deptname = StringUtils.parseString(mpr.get("DEPTNAME"));
            double usehour = ArithUtils.parseDouble(StringUtils.parseString(mpr.get("USEHOUR")), 0);
            String statename = StringUtils.parseString(mpr.get("STATENAME"));
            String starttime = DateUtils.getTimeStampString((Timestamp) mpr.get("STARTTIME"), null);
            String endtime = DateUtils.getTimeStampString((Timestamp) mpr.get("ENDTIME"), null);

            if (list.containsKey(partbarlistcode)) {
                EmployeeProcessPartForm r = (EmployeeProcessPartForm) list.get(partbarlistcode);
                // 重置工件的状态
                r.setStatename(statename);
                // 增加加工时长
                r.setAppendUsehour(usehour);
                // 设置加工部门
                r.setDeptname(deptname);
                // 重置完成时间
                r.setEndtime(endtime);
            } else {
                EmployeeProcessPartForm r = new EmployeeProcessPartForm();

                r.setPartlistcode(partlistcode);
                r.setPartcode(partcode);
                r.setModulecode(modulecode);
                r.setDeptname(deptname);
                r.setUsehour(usehour);
                r.setStatename(statename);
                r.setStarttime(starttime);
                r.setEndtime(endtime);

                list.put(partbarlistcode, r);
            }
        }

        return transMapToList(list);
    }

    public List<WeekWorkLoadForm> getWeekMacLoad(String stateid) {
        StringBuilder builder = new StringBuilder();

        final String format = "yyyy-MM-dd";

        Map<String, Integer> craftMacLoad = new HashMap<String, Integer>();

        // CNC
        craftMacLoad.put("1130005", 20 * 7);
        // 2DCNC
        craftMacLoad.put("1130006", 20 * 7);
        // 磨床
        craftMacLoad.put("1130004", 18 * 7);
        // 线割
        craftMacLoad.put("1130007", 20 * 7);
        // 放电
        craftMacLoad.put("1130008", 18 * 3 * 7);
        // 铣床
        craftMacLoad.put("1130003", 16 * 7);

        String startdate = DateUtils.getMondayOfLastWeek("yyyy-MM-dd");
        String enddate = DateUtils.getSundayOfLastWeek("yyyy-MM-dd");

        String enddate2 = DateUtils.getNextField(enddate, format, format, 5, 1);

        builder.append("SELECT MPR.LDEPTID, RD.NAME AS DEPTNAME, CASE WHEN PARTCOUNT = 0 THEN 0 ELSE (NVL(NRCDTIME, ");
        builder.append("SYSDATE) - LRCDTIME) / TO_NUMBER(PARTCOUNT) * 24 END AS ACTLOAD, PARTCOUNT, DD.DEVICEID ");
        builder.append(", MMI.MACLOAD * 7 AS MACLOAD FROM MD_PROCESS_RESUME MPR LEFT JOIN DEVICE_DEPART DD ON MPR.LDEVDEPARTID = DD.ID ");
        builder.append("LEFT JOIN MD_MACHINE_INFO MMI ON DD.DEVICEID = MMI.ID LEFT JOIN REGION_DEPART RD ON MPR.LDEPTID = RD.ID ");
        builder.append(" LEFT JOIN MD_RESUME_RECORD MRR ON MPR.RSMID = MRR.ID WHERE ISTIME = 0 ");
        builder.append(" AND MRR.RESUMESTATE IN ('20402','20403') ");
        // if (!StringUtils.isEmpty(stateid)) {
        // builder.append(" AND MRR.RESUMESTATE IN (" + stateid + ") ");
        // }
        builder.append("AND MPR.LRCDTIME > to_date(?, 'yyyy-mm-dd') AND MPR.LRCDTIME < TO_DATE(?, 'yyyy-mm-dd')");

        List<ModuleProcessResume> rlist = this.find(builder.toString(), startdate, enddate2);
        Map<String, WeekWorkLoadForm> mlist = new HashMap<String, WeekWorkLoadForm>();
        for (ModuleProcessResume mpr : rlist) {
            String partid = mpr.getStr("LDEPTID");

            if (StringUtils.isEmpty(partid)) {
                continue;
            }

            String deptname = mpr.getStr("DEPTNAME");
            // String deviceid = mpr.getStr("DEVICEID");
            // Number macload = mpr.getNumber("MACLOAD");
            Number actload = mpr.getNumber("ACTLOAD");

            if (!mlist.containsKey(partid)) {
                WeekWorkLoadForm wlf = new WeekWorkLoadForm();

                wlf.setTaskid(partid);
                wlf.setDeptname(deptname);
                wlf.setActhour(actload.doubleValue());

                if (craftMacLoad.containsKey(partid)) {
                    wlf.setEsthour(craftMacLoad.get(partid));
                }
                // wlf.setEsthour(macload.intValue());

                // wlf.getMap().put(deviceid, macload.intValue());

                mlist.put(partid, wlf);
            } else {
                WeekWorkLoadForm wlf = mlist.get(partid);

                wlf.setActhour(wlf.getActhour() + actload.doubleValue());

                // if (!wlf.getMap().containsKey(deviceid)) {
                // wlf.setEsthour(wlf.getEsthour() + macload.intValue());
                // wlf.getMap().put(deviceid, macload.intValue());
                // }
            }
        }

        List<WeekWorkLoadForm> blist = new ArrayList<WeekWorkLoadForm>();
        for (String key : mlist.keySet()) {
            blist.add(mlist.get(key));
        }

        return blist;
    }

    /**
     * 
     * @param partbarcode
     * @param resumeid
     * @return
     */
    public List<ModuleProcessResume> getActualPartProcessInfo(String partbarcode, String resumeid) {
        StringBuilder builder = new StringBuilder();

        builder.append("SELECT a.LPROCRAFTID,a.RSMID,a.PARTBARLISTCODE, b.CRAFTNAME || '[' || b.CRAFTCODE || ']' AS CRAFTNAME,");
        builder.append("TO_CHAR(a.LRCDTIME, 'yyyy-MM-dd hh24:mi:ss') AS STARTTIME, TO_CHAR(NVL(a.NRCDTIME, SYSDATE), ");
        builder.append("'yyyy-MM-dd hh24:mi:ss') AS ENDTIME,ROUND(((NVL(a.NRCDTIME, SYSDATE) - a.LRCDTIME) * 24) / ");
        builder.append("TO_NUMBER(NVL(a.PARTCOUNT,'1')),2) AS USEHOUR FROM MD_PROCESS_RESUME a ");
        builder.append("LEFT JOIN MD_CRAFT b ON a.LPROCRAFTID = b.ID ");
        builder.append("LEFT JOIN EMPLOYEE_INFO c ON a.LEMPID = c.ID ");
        builder.append("WHERE a.ISTIME = '0' AND a.PARTBARLISTCODE = ? AND a.RSMID = ? ");
        builder.append("ORDER BY a.LRCDTIME");

        return this.find(builder.toString(), partbarcode, resumeid);
    }

    /**
     * 获取实际加工流程
     * 
     * @param partbarcode
     * @param resumeid
     * @return
     */
    public List<Record> getActualWorkSchedule(String partbarcode, String resumeid) {
        List<ModuleProcessResume> act = this.getActualPartProcessInfo(partbarcode, resumeid);

        // 將實際的加工排程進行組合
        List<Record> gatherActRcd = new ArrayList<Record>();
        // 初始化待解析的工藝耗時
        String craftid = null, craftname = null, start = null, end = null;
        double actHour = 0d;
        // 開始統計的符號
        boolean isStart = false;
        for (ModuleProcessResume rcd : act) {
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

        return gatherActRcd;
    }

    /**
     * 获取加工明细
     * 
     * @param resumeid
     * @param partid
     * @return
     */
    public List<ModuleProcessResume> getPartProcessInfo(String partid, String resumeid) {
        StringBuilder builder = new StringBuilder();

        builder.append("SELECT MPL.PARTLISTCODE, MP.CNAMES AS PARTNAME, (CASE WHEN PO.ID IS NOT NULL THEN PO.OUTGUESTNAME ELSE RD.NAME END) AS REGIONNAME, MC.CRAFTNAME, MC.CRAFTCODE ");
        builder.append(", DD.BATCHNO, MPS.NAME AS STATENAME, EI.EMPNAME, TO_CHAR(MPR.LRCDTIME, 'yyyy-mm-dd hh24:mi:ss') AS LRCDTIME ");
        builder.append("FROM MD_PROCESS_RESUME MPR LEFT JOIN REGION_DEPART RD ON MPR.LDEPTID = RD.ID ");
        builder.append(" LEFT JOIN MD_PART_LIST MPL ON MPR.PARTBARLISTCODE = MPL.PARTBARLISTCODE ");
        builder.append(" LEFT JOIN MD_PART MP ON MPL.PARTBARCODE = MP.PARTBARCODE ");
        builder.append(" LEFT JOIN MD_CRAFT MC ON MPR.LPROCRAFTID = MC.ID ");
        builder.append(" LEFT JOIN MD_PROCESS_STATE MPS ON MPR.LPARTSTATEID = MPS.ID ");
        builder.append(" LEFT JOIN EMPLOYEE_INFO EI ON MPR.LEMPID = EI.ID ");
        builder.append(" LEFT JOIN DEVICE_DEPART DD ON MPR.LDEVDEPARTID = DD.ID LEFT JOIN PART_OUTBOUND PO ON MPR.OUTID = PO.ID ");
        builder.append(" WHERE MPR.RSMID = ? AND MPR.PARTBARLISTCODE = ? ORDER BY LRCDTIME DESC");

        return this.find(builder.toString(), resumeid, partid);
    }

    /**
     * 获取员工的加工明细
     * 
     * @param partbarlistcode
     * @param empid
     * @param craftid
     * @param resumeid
     * @return
     */
    public List<ModuleProcessResume> getEmployeeEffientInfo(String partbarlistcode, String empid, String craftid, String resumeid) {

        StringBuilder builder = new StringBuilder();

        builder.append("SELECT RD.NAME AS DEPTNAME, DD.BATCHNO, MPR.LRCDTIME, NVL(MPR.NRCDTIME, SYSDATE) AS NRCDTIME, ROUND((NVL(MPR.NRCDTIME, SYSDATE) - MPR.LRCDTIME) * 24, 2) AS TOTAL ");
        builder.append(", ROUND((NVL(MPR.NRCDTIME, SYSDATE) - MPR.LRCDTIME) * 24 / TO_NUMBER(MPR.PARTCOUNT), 2) AS USEHOUR, MPR.PARTCOUNT FROM MD_PROCESS_RESUME MPR ");
        builder.append("LEFT JOIN DEVICE_DEPART DD ON MPR.LDEVDEPARTID = DD.ID LEFT JOIN REGION_DEPART RD ON MPR.LDEPTID = RD.ID WHERE ISTIME = ? ");
        builder.append("AND RSMID = ? AND PARTBARLISTCODE = ? AND LEMPID = ? AND LPROCRAFTID = ? ORDER BY MPR.LRCDTIME");

        return this.find(builder.toString(), "0", resumeid, partbarlistcode, empid, craftid);
    }
}
