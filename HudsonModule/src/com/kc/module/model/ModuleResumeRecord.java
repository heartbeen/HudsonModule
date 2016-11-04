package com.kc.module.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.kc.module.model.form.ModelCurrentProcessForm;
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.StringUtils;

/**
 * 模具履历记录
 * 
 * @author David
 * @email xuweissh@163.com
 * 
 */
public class ModuleResumeRecord extends ModelFinal<ModuleResumeRecord> {

    private static final long serialVersionUID = 1L;
    public static ModuleResumeRecord dao = new ModuleResumeRecord();

    public List<ModuleResumeRecord> getModuleResumeInfo(String barcode, boolean desc) {
        // 初始化查询模具履历的相关讯息
        StringBuilder builder = new StringBuilder();
        builder.append("SELECT a.ID AS RESUMEID, b.NAME || '[' || TO_CHAR(a.STARTTIME, 'yyMMdd') || ']' AS RESUMENAME ");
        builder.append("FROM MD_RESUME_RECORD a ");
        builder.append("LEFT JOIN MD_PROCESS_STATE b ON a.RESUMESTATE = b.ID WHERE a.MODULEBARCODE = ? ");
        builder.append("ORDER BY RESUMETIME ").append(desc ? "DESC" : "");

        return this.find(builder.toString(), barcode);
    }

    public List<ModuleResumeRecord> getAllModuleResumeInfo(String modulebarcode) {
        StringBuilder builder = new StringBuilder();

        builder.append("SELECT B.MODULECODE, B.MODULECLASS, C.SHORTNAME, TO_CHAR(A.STARTTIME,             ");
        builder.append("'yyyy-MM-dd hh24') AS ESTART, TO_CHAR(A.ENDTIME, 'yyyy-MM-dd hh24') AS EEND       ");
        builder.append(", ROUND((                                                                         ");
        builder.append("    SELECT SUM(NVL(EVALUATE, DURATION))                                           ");
        builder.append("    FROM MD_EST_SCHEDULE                                                          ");
        builder.append("    WHERE MODULERESUMEID = A.ID                                                   ");
        builder.append("        AND TYPEID IS NULL                                                        ");
        builder.append("    ), 1) AS ESTHOUR, ROUND((                                                     ");
        builder.append("    SELECT SUM((NVL(NRCDTIME, SYSDATE) - LRCDTIME) * 24)                          ");
        builder.append("    FROM MD_PROCESS_RESUME                                                        ");
        builder.append("    WHERE ISTIME = 0                                                              ");
        builder.append("        AND RSMID = A.ID                                                          ");
        builder.append("    ), 1) AS ACTHOUR, TO_CHAR((                                                   ");
        builder.append("    SELECT MIN(LRCDTIME)                                                          ");
        builder.append("    FROM MD_PROCESS_RESUME                                                        ");
        builder.append("    WHERE ISTIME = 0                                                              ");
        builder.append("        AND RSMID = A.ID                                                          ");
        builder.append("    ), 'yyyy-MM-dd hh24') AS ASTART, TO_CHAR((                                    ");
        builder.append("    SELECT MAX(LRCDTIME)                                                          ");
        builder.append("    FROM MD_PROCESS_RESUME                                                        ");
        builder.append("    WHERE ISTIME = 0                                                              ");
        builder.append("        AND RSMID = A.ID                                                          ");
        builder.append("    ), 'yyyy-MM-dd hh24') AS AEND, CASE WHEN A.FINISHTIME IS NULL THEN 0 ELSE 1   ");
        builder.append(" END AS MODULESTATE, D.NAME AS RNAME                                              ");
        builder.append(" FROM MD_RESUME_RECORD A                                                          ");
        builder.append(" LEFT JOIN MODULELIST B ON A.MODULEBARCODE = B.MODULEBARCODE                      ");
        builder.append(" LEFT JOIN FACTORY C ON B.GUESTID = C.ID                                          ");
        builder.append(" LEFT JOIN MD_PROCESS_STATE D ON A.RESUMESTATE = D.ID                             ");
        builder.append(" WHERE A.MODULEBARCODE = ?  ORDER BY A.STARTTIME DESC                             ");

        return this.find(builder.toString(), modulebarcode);
    }

    /**
     * 获取上周的加工完成报告
     */
    public List<ModelCurrentProcessForm> getLastWeekProcessInfo(String sid, boolean ismonth) {
        StringBuilder builder = new StringBuilder();

        String dateFormat = DateUtils.DEFAULT_SHORT_DATE;
        String startdate = ismonth ? DateUtils.getLastMonthStartDate(dateFormat) : DateUtils.getMondayOfLastWeek(dateFormat);
        String enddate = ismonth ? DateUtils.getLastMonthEndDate(dateFormat) : DateUtils.getSundayOfLastWeek(dateFormat);

        enddate = DateUtils.getNextField(enddate, dateFormat, dateFormat, 5, 1);

        final String format = "yyyy-mm-dd";

        builder.append("SELECT ML.GUESTID, FY.SHORTNAME AS GUESTNAME, MPS.ID AS STATEID, ");
        builder.append("MPS.NAME AS STATENAME, MRR.PROCESSED, MRR.FINISHTIME, ROUND((    ");
        builder.append("SELECT SUM((NVL(UMPR.NRCDTIME,(SELECT NVL(FINISHDATE,SYSDATE) FROM MD_PROCESS_FINISH WHERE MODULERESUMEID = UMPR.RSMID AND PARTBARLISTCODE = UMPR.PARTBARLISTCODE)) - UMPR.LRCDTIME) * 24 / ");
        builder.append("TO_NUMBER(NVL(UMPR.PARTCOUNT,1)) * TO_NUMBER(NVL(UMC.CRAFTINFO,0))) ");
        builder.append("FROM MD_PROCESS_RESUME UMPR LEFT JOIN MD_CRAFT UMC ON UMPR.LPROCRAFTID");
        builder.append(" = UMC.ID WHERE UMPR.ISTIME = 0 AND MRR.ID = UMPR.RSMID),2) AS FEE FROM MD_RESUME_RECORD MRR ");
        builder.append("LEFT JOIN MODULELIST ML ON MRR.MODULEBARCODE = ML.MODULEBARCODE ");
        builder.append("LEFT JOIN FACTORY FY ON ML.GUESTID = FY.ID ");
        builder.append("LEFT JOIN MD_PROCESS_STATE MPS ON MRR.RESUMESTATE = MPS.ID ");
        builder.append("WHERE MRR.FINISHTIME BETWEEN to_date(?,?) AND TO_DATE(?,?)");

        if (!StringUtils.isEmpty(sid)) {
            builder.append(" AND MRR.RESUMESTATE IN (" + sid + ")");
        }

        List<ModuleResumeRecord> rlist = this.find(builder.toString(), startdate, format, enddate, format);

        Map<String, ModelCurrentProcessForm> plist = new HashMap<String, ModelCurrentProcessForm>();

        for (ModuleResumeRecord mr : rlist) {
            String guestid = mr.getStr("GUESTID");
            String stateid = mr.getStr("STATEID");
            String guestname = mr.getStr("GUESTNAME");
            String statename = mr.getStr("STATENAME");
            Number fee = mr.getNumber("fee");

            String mergeid = guestid + stateid;

            if (plist.containsKey(mergeid)) {
                ModelCurrentProcessForm frm = plist.get(mergeid);
                frm.setMcount(frm.getMcount() + 1);
                frm.setFee(frm.getFee() + (fee == null ? 0 : fee.doubleValue()));
            } else {
                ModelCurrentProcessForm frm = new ModelCurrentProcessForm();

                frm.setTaskid(mergeid);
                frm.setGuestid(guestid);
                frm.setGuestname(guestname);
                frm.setStateid(stateid);
                frm.setStatename(statename);
                // 设置客户模具加工的总费用
                frm.setFee(fee == null ? 0 : fee.doubleValue());
                // 统计某个客户的某种类型的模具数量
                frm.setMcount(frm.getMcount() + 1);

                plist.put(mergeid, frm);
            }
        }

        List<ModelCurrentProcessForm> mlist = new ArrayList<ModelCurrentProcessForm>();
        for (String key : plist.keySet()) {
            ModelCurrentProcessForm tmcp = plist.get(key);
            tmcp.setFee(ArithUtils.round(tmcp.getFee(), 2));

            mlist.add(tmcp);
        }

        return mlist;
    }

    /**
     * 通过模具当前的加工履历获取模具的所有加工履历记录
     * 
     * @param resumeid
     * @param format
     * @return
     */
    public List<ModuleResumeRecord> getModuleResumeListByResumeId(String resumeid, String format) {
        StringBuilder builder = new StringBuilder();

        builder.append("SELECT MRR.ID, (MPS.NAME || '[' || TO_CHAR(MRR.STARTTIME, ?) || ']') AS RNAME, MRR.FINISHTIME FROM MD_RESUME_RECORD MRR ");
        builder.append("LEFT JOIN MD_PROCESS_STATE MPS ON MRR.RESUMESTATE = MPS.ID WHERE MRR.MODULEBARCODE IN (SELECT MODULEBARCODE ");
        builder.append("FROM MD_RESUME WHERE ID = ?) ORDER BY MRR.STARTTIME DESC");

        return this.find(builder.toString(), format, resumeid);
    }
}
