package com.kc.module.model;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.databean.ResultBean;
import com.kc.module.model.form.ModelCurrentProcessForm;
import com.kc.module.utils.DBUtils;
import com.kc.module.utils.JsonUtils;
import com.kc.module.utils.StringUtils;

public class ModuleResume extends ModelFinal<ModuleResume> {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;

    public static ModuleResume dao = new ModuleResume();

    /**
     * 通过模具条码号得到模具履历记录
     * 
     * @param moduleBarcode
     * @return
     */
    public ModuleResume findModuleResumeByModuleBarcode(Object moduleBarcode) {
        return findFirst("select * from " + tableName() + " where modulebarcode=?", moduleBarcode);
    }

    /**
     * 查找所有與匹配項相同的加工工件的相關訊息
     * 
     * @param match
     * @return
     */
    public List<ModuleResume> findPartInfo(String moldid, String partid) {
        StringBuilder builder = new StringBuilder();
        // 如果模具号和工件号全部为空,则返回NULL
        if (StringUtils.isEmpty(moldid) && StringUtils.isEmpty(partid)) {
            return new ArrayList<ModuleResume>();
        }

        builder.append("SELECT C.PARTLISTCODE, D.PARTCODE, H.MODULECODE, D.CNAMES AS PARTNAME, E.NAME AS DEPARTNAME        ");
        builder.append(", F.NAME AS STATENAME, G.BATCHNO  FROM MD_RESUME A ");
        builder.append("LEFT JOIN MD_PROCESS_INFO B ON A.ID = B.MODULERESUMEID                                             ");
        builder.append("LEFT JOIN MD_PART_LIST C ON B.PARTBARLISTCODE = C.PARTBARLISTCODE                                  ");
        builder.append("LEFT JOIN MD_PART D ON C.PARTBARCODE = D.PARTBARCODE                                               ");
        builder.append("LEFT JOIN REGION_DEPART E ON B.CURRENTDEPTID = E.ID                                                ");
        builder.append("LEFT JOIN MD_PROCESS_STATE F ON B.PARTSTATEID = F.ID                                               ");
        builder.append("LEFT JOIN DEVICE_DEPART G ON B.DEVICEPARTID = G.ID                                                 ");
        builder.append("    LEFT JOIN MODULELIST H ON C.MODULEBARCODE = H.MODULEBARCODE                                    ");
        builder.append("WHERE C.ISENABLE = '0'                                                                             ");

        if (!StringUtils.isEmpty(moldid)) {
            builder.append(" AND A.MODULEBARCODE = '");
            builder.append(moldid);
            builder.append("'");
        }

        if (!StringUtils.isEmpty(partid)) {
            builder.append(" AND C.PARTLISTCODE LIKE '");
            builder.append(partid + "%");
            builder.append("'");
        }

        return this.find(builder.toString());
    }

    /**
     * 获取当前的加工模具相关讯息资料
     * 
     * @return
     */
    public List<ModuleResume> getCurrentModuleInformation() {
        StringBuilder builder = new StringBuilder();
        builder.append("SELECT B.MODULECODE, B.MODULECLASS, C.SHORTNAME, TO_CHAR(A.STARTTIME, ");
        builder.append(" 'yyyy-MM-dd hh24') AS ESTART, TO_CHAR(A.ENDTIME, 'yyyy-MM-dd hh24')  ");
        builder.append("AS EEND, ROUND((                                                      ");
        builder.append("SELECT SUM(NVL(EVALUATE, DURATION))                                   ");
        builder.append("FROM MD_EST_SCHEDULE                                                  ");
        builder.append("WHERE MODULERESUMEID = A.ID                                           ");
        builder.append("    AND TYPEID IS NULL                                                ");
        builder.append("), 1) AS ESTHOUR, ROUND((                                             ");
        builder.append("SELECT SUM((NVL(NRCDTIME, SYSDATE) - LRCDTIME) * 24)                  ");
        builder.append("FROM MD_PROCESS_RESUME                                                ");
        builder.append("WHERE ISTIME = 0                                                      ");
        builder.append("    AND RSMID = A.ID                                                  ");
        builder.append("), 1) AS ACTHOUR, TO_CHAR((                                           ");
        builder.append("SELECT MIN(LRCDTIME)                                                  ");
        builder.append("FROM MD_PROCESS_RESUME                                                ");
        builder.append("WHERE ISTIME = 0                                                      ");
        builder.append("    AND RSMID = A.ID                                                  ");
        builder.append("), 'yyyy-MM-dd hh24') AS ASTART, TO_CHAR((                            ");
        builder.append("SELECT MAX(LRCDTIME)                                                  ");
        builder.append("FROM MD_PROCESS_RESUME                                                ");
        builder.append("WHERE ISTIME = 0                                                      ");
        builder.append("    AND RSMID = A.ID                                                  ");
        builder.append("), 'yyyy-MM-dd hh24') AS AEND, 0 AS MODULESTATE, D.NAME AS RNAME      ");
        builder.append("FROM MD_RESUME A                                                      ");
        builder.append("LEFT JOIN MODULELIST B ON A.MODULEBARCODE = B.MODULEBARCODE           ");
        builder.append("LEFT JOIN FACTORY C ON B.GUESTID = C.ID LEFT JOIN MD_PROCESS_STATE D  ");
        builder.append("ON A.RESUMESTATE = D.ID                                               ");

        return this.find(builder.toString());
    }

    /**
     * 获取所有的正在加工的模具清单
     * 
     * @param module
     * @return
     */
    public List<ModuleResume> getAllProcessModuleInfo(String module) {
        StringBuilder builder = new StringBuilder();
        builder.append("SELECT MR.MODULEBARCODE, ML.MODULECODE ");
        builder.append("FROM MD_RESUME MR ");
        builder.append("LEFT JOIN MODULELIST ML ON MR.MODULEBARCODE = ML.MODULEBARCODE ");

        if (!StringUtils.isEmpty(module)) {
            builder.append("WHERE ML.MODULECODE LIKE '");
            builder.append(module.toUpperCase());
            builder.append("%'");
        }

        return this.find(builder.toString());
    }

    /**
     * 查询指模具已有的修模/设变工件信息
     * 
     * @param modulebarcode
     * @return
     */
    public List<Record> findHistoryResumePart(Object modulebarcode) {
        StringBuilder sql = new StringBuilder();
        sql.append("SELECT MR.ID RESUMEID,                                               ");
        sql.append("       TO_CHAR(MR.STARTTIME,'MM/DD')||'開始['||MPS.NAME||']' RESUMENAME,");
        sql.append("       MR.STARTTIME,MR.RESUMESTATE,MR.RESUMESTATE,                         ");
        sql.append("       MR.ENDTIME,                                          ");
        sql.append("       MR.REMARK MDREMARK,                                           ");
        sql.append("       MPR.PARTLISTCODE,                                    ");
        sql.append("       MP.CNAMES PARTNAME,MPI.ID,                           ");
        sql.append("       MPI.PARTBARLISTCODE,                                 ");
        sql.append("       MPI.REMARK                                           ");
        sql.append("  FROM (SELECT * FROM MD_RESUME WHERE MODULEBARCODE = ? AND RESUMESTATE <> '20401') MR ");
        sql.append("  LEFT JOIN MD_PROCESS_STATE MPS                            ");
        sql.append("    ON MPS.ID = MR.RESUMESTATE                              ");
        sql.append("  LEFT JOIN MD_PROCESS_INFO MPI                             ");
        sql.append("    ON MPI.MODULERESUMEID = MR.ID                           ");
        sql.append("  LEFT JOIN MD_PART_LIST MPR                                ");
        sql.append("    ON MPR.PARTBARLISTCODE = MPI.PARTBARLISTCODE            ");
        sql.append("  LEFT JOIN MD_PART MP                                      ");
        sql.append("    ON MP.PARTBARCODE = MPR.PARTBARCODE                     ");

        return Db.find(sql.toString(), modulebarcode);
    }

    /**
     * 获取工件的履历分段加工讯息
     * 
     * @param modulebarcode
     * @return
     */
    public List<Record> findModuleSectionInfo(String modulebarcode) {
        StringBuilder sql = new StringBuilder();

        sql.append("SELECT MR.ID AS MID, MRS.ID AS MRSID, MRS.STATEID, ");
        sql.append("TO_CHAR(MRS.STARTDATE, 'MM/dd') || '/' || MPS.NAME AS DISPLAYNAME,");
        sql.append(" MRS.STARTDATE, MRS.ENDDATE, MRS.REMARK FROM MD_RESUME MR ");
        sql.append("LEFT JOIN MD_RESUME_SECTION MRS ON MR.ID = MRS.RESUMEID ");
        sql.append("LEFT JOIN MD_PROCESS_STATE MPS ON MRS.STATEID = MPS.ID ");
        sql.append("WHERE MR.MODULEBARCODE = ? AND MRS.ID IS NOT NULL ORDER BY MRS.STARTDATE DESC");

        return Db.find(sql.toString(), modulebarcode);
    }

    /**
     * [修改加工模具的相关动态]
     * 
     * @param modulebarcode
     * @param stateid
     * @return
     */
    public ResultBean alertModuleState(String resumeid) {
        StringBuilder builder = new StringBuilder();
        ResultBean result = new ResultBean();

        try {
            builder.append("SELECT MR.ID, MR.RESUMESTATE AS MSTATE, MRR.RESUMESTATE AS RSTATE ");
            builder.append("FROM MD_RESUME MR LEFT JOIN MD_RESUME_RECORD MRR ON MR.ID = MRR.ID ");
            builder.append("WHERE MR.ID IN (");
            builder.append(resumeid);
            builder.append(")");

            // 将模具的加工状态查询出来
            List<ModuleResume> moduleList = this.find(builder.toString());
            if (moduleList.size() == 0) {
                result.setMsg("模具记录已经不存在了!");
                result.setSuccess(false);
            }

            boolean success = false;

            for (ModuleResume mr : moduleList) {
                String rid = StringUtils.parseString(mr.get("ID"));
                String mstate = StringUtils.parseString(mr.get("MSTATE"));
                String rstate = StringUtils.parseString(mr.get("RSTATE"));

                mr = new ModuleResume();
                mr.set("ID", rid).set("RESUMESTATE", mstate.equals("20404") ? rstate : "20404");

                success = mr.update();
                if (!success) {
                    result.setSuccess(false);
                    result.setMsg("修改失败!");

                    return result;
                }
            }

            result.setSuccess(true);
            result.setMsg("修改成功!");

            return result;
        }
        catch (Exception e) {
            result.setSuccess(false);
            result.setMsg("修改失败!");

            return result;
        }
    }

    /**
     * 根据条件查询模具履历讯息 <br>
     * CHK为是按社内编号还是客户番号查询 QUERY为查询内容 STATES为履历状态
     * 
     * @param chk
     * @param query
     * @param states
     * @return
     */
    public List<ModuleResume> getModuleForResumeCase(boolean chk, String query, String states, String emptyText) {
        StringBuilder builder = new StringBuilder();

        builder.append("SELECT MR.ID, MR.STARTTIME, MR.ENDTIME,MR.INSTALLER, MR.DEVISER, ML.MODULEBARCODE, MR.RESUMESTATE, (CASE WHEN MPS.NAME IS NULL THEN '"
                       + emptyText
                       + "' ELSE MPS.NAME END) AS RESUMENAME, (ML.MODULECODE ");
        builder.append("|| '('|| (CASE WHEN MPS.NAME IS NULL THEN '"
                       + emptyText
                       + "' ELSE MPS.NAME END) || ')') AS TEXT,");
        builder.append("ML.GUESTCODE, ML.MODULECODE,'TRUE' AS LEAF FROM MODULELIST ML LEFT JOIN MD_RESUME MR ON MR.MODULEBARCODE = ML.MODULEBARCODE ");

        builder.append("LEFT JOIN MD_PROCESS_STATE MPS ON MR.RESUMESTATE = MPS.ID WHERE ML.MODULESTATE = 0 ");

        boolean isCase = false;
        // 如果状态为空,则跳过该条件搜索
        if (!StringUtils.isEmpty(states)) {
            isCase = true;
            builder.append(" AND MR.RESUMESTATE IN ");
            builder.append(DBUtils.sqlIn(JsonUtils.parseJsArrayList(states)));
        }

        if (!StringUtils.isEmpty(query)) {
            // 如果查询条件为空则跳过查询条件搜索
            builder.append(" AND ");
            builder.append(!chk ? "ML.MODULECODE" : "ML.GUESTCODE");
            builder.append(" LIKE '").append(query.toUpperCase()).append("%'");
        } else {
            // 如果前边没有条件,则返回一个空的集合
            if (!isCase) {
                return new ArrayList<ModuleResume>();
            }
        }

        return this.find(builder.toString());
    }

    public List<ModuleResume> getScheduleInfoForExport(Object[] resumeIds) {
        StringBuilder sql = new StringBuilder();

        sql.append("SELECT MR.ID, ML.MODULECODE, ML.GUESTCODE, FY.SHORTNAME, TO_CHAR(MR.STARTTIME, 'yyyy/mm/dd') AS STARTTIME ");
        sql.append(", TO_CHAR(MR.ENDTIME, 'yyyy/mm/dd') AS ENDTIME, MPS.NAME, MPL.PARTBARLISTCODE, MPL.PARTLISTCODE, MP.CNAMES ");
        sql.append(", MC.CRAFTCODE, AA.REMARK FROM MD_RESUME_RECORD MR ");
        sql.append("LEFT JOIN MODULELIST ML ON MR.MODULEBARCODE = ML.MODULEBARCODE ");
        sql.append("LEFT JOIN FACTORY FY ON ML.GUESTID = FY.ID ");
        sql.append("LEFT JOIN MD_PROCESS_STATE MPS ON MR.RESUMESTATE = MPS.ID ");
        sql.append("LEFT JOIN MD_EST_SCHEDULE MES ON MR.ID = MES.MODULERESUMEID ");
        sql.append("LEFT JOIN (SELECT * FROM MD_PART_LIST WHERE ISENABLE = 0) MPL ON MES.PARTID = MPL.PARTBARLISTCODE ");
        sql.append("LEFT JOIN MD_PART MP ON MPL.PARTBARCODE = MP.PARTBARCODE ");
        sql.append("LEFT JOIN MD_CRAFT MC ON MES.CRAFTID = MC.ID ");
        sql.append("LEFT JOIN (SELECT * FROM MD_PART_SECTION WHERE ID IN (SELECT MAX(ID) FROM MD_PART_SECTION ");
        sql.append("GROUP BY PARTBARLISTCODE)) AA ON MPL.PARTBARLISTCODE = AA.PARTBARLISTCODE WHERE MR.ID IN (");

        for (int i = 0; i < resumeIds.length; i++) {
            sql.append("?").append(i == resumeIds.length - 1 ? ")" : ",");
        }

        sql.append(" AND MPL.PARTBARLISTCODE IS NOT NULL AND MES.TYPEID IS NULL");
        sql.append(" ORDER BY MR.ID, MPL.PARTLISTCODE, MES.RANKNUM ");

        return find(sql.toString(), resumeIds);
    }

    /**
     * 统计加工模具类型的数量
     * 
     * @return
     */
    public List<ModuleResume> queryProcessModuleTypeCount() {
        StringBuilder builder = new StringBuilder();
        builder.append("SELECT MR.*, MPS.NAME FROM (SELECT COUNT(*) AS SCOUNT, RESUMESTATE FROM MD_RESUME ");
        builder.append("GROUP BY RESUMESTATE ) MR LEFT JOIN MD_PROCESS_STATE MPS ON MR.RESUMESTATE = MPS.ID");

        return this.find(builder.toString());
    }

    /**
     * 设置模具是否为紧急加工状态
     * 
     * @param urgent
     * @return
     */
    public boolean setModuleProcessedUrgent(String urgent) {
        List<ModuleResume> list = this.find("SELECT * FROM MD_RESUME WHERE ID IN (" + urgent + ")");
        boolean result = false;
        if (list.size() > 0) {
            for (ModuleResume mr : list) {
                Number isUrgent = mr.getNumber("ISURGENT");

                mr.set("ISURGENT", (isUrgent == null || isUrgent.intValue() > 0) ? 0 : 1);
                result = mr.update();

                if (!result) {
                    return false;
                }
            }
        }

        return true;
    }

    public List<ModuleResume> getCurrentProcessInfo(String stateid) {
        StringBuilder builder = new StringBuilder();

        builder.append("SELECT ML.GUESTID, FY.SHORTNAME AS GUESTNAME, MPS.ID AS STATEID, MPS.NAME AS STATENAME, MRR.PROCESSED ");
        // (SELECTSUM((NVL(UMPR.NRCDTIME,SYSDATE) - UMPR.LRCDTIME) * 24 /
        // TO_NUMBER(NVL(UMPR.PARTCOUNT,1)) * TO_NUMBER(NVL(UMC.CRAFTINFO,0)))
        // FROM MD_PROCESS_RESUME UMPR LEFT JOIN MD_CRAFT UMC ON
        // UMPR.LPROCRAFTID = UMC.ID WHERE UMPR.ISTIME = 0 AND UMPR.RSMID =
        // MRR.ID) AS FEE
        builder.append("FROM MD_RESUME_RECORD MRR ");
        builder.append("LEFT JOIN MODULELIST ML ON MRR.MODULEBARCODE = ML.MODULEBARCODE ");
        builder.append("LEFT JOIN FACTORY FY ON ML.GUESTID = FY.ID ");
        builder.append("LEFT JOIN MD_PROCESS_STATE MPS ON MRR.RESUMESTATE = MPS.ID ");
        builder.append("WHERE MRR.FINISHTIME IS NULL ");

        if (!StringUtils.isEmpty(stateid)) {
            builder.append("AND MRR.RESUMESTATE IN (" + stateid + ")");
        }

        return this.find(builder.toString());
    }

    /**
     * 获取当前的工件加工情况
     * 
     * @param sid
     * @return
     */
    public List<ModelCurrentProcessForm> getCurrentProcessContent(String sid) {
        List<ModuleResume> list = getCurrentProcessInfo(sid);
        Map<String, ModelCurrentProcessForm> plist = new HashMap<String, ModelCurrentProcessForm>();

        for (ModuleResume mr : list) {
            String guestid = mr.getStr("GUESTID");
            String stateid = mr.getStr("STATEID");
            String guestname = mr.getStr("GUESTNAME");
            String statename = mr.getStr("STATENAME");
            Timestamp process = mr.getTimestamp("PROCESSED");
            // Number fee = mr.getNumber("fee");

            String mergeid = guestid + stateid;

            if (plist.containsKey(mergeid)) {

                ModelCurrentProcessForm frm = plist.get(mergeid);
                frm.setTcount(frm.getTcount() + 1);
                // frm.setFee(frm.getFee() + (fee == null ? 0 :
                // fee.doubleValue()));

                if (process == null) {
                    frm.setPcount(frm.getPcount() + 1);
                } else {
                    frm.setFcount(frm.getFcount() + 1);
                }
            } else {
                ModelCurrentProcessForm frm = new ModelCurrentProcessForm();
                frm.setTaskid(mergeid);
                frm.setGuestid(guestid);
                frm.setGuestname(guestname);
                frm.setStateid(stateid);
                frm.setStatename(statename);

                frm.setTcount(frm.getTcount() + 1);
                // frm.setFee((fee == null ? 0 : fee.doubleValue()));

                if (process == null) {
                    frm.setPcount(frm.getPcount() + 1);
                } else {
                    frm.setFcount(frm.getFcount() + 1);
                }

                plist.put(mergeid, frm);
            }
        }

        List<ModelCurrentProcessForm> mlist = new ArrayList<ModelCurrentProcessForm>();
        for (String key : plist.keySet()) {
            mlist.add(plist.get(key));
        }

        return mlist;
    }

    /**
     * 查找指定的数据
     * 
     * @param resumeid
     * @return
     */
    public List<ModuleResume> getResumeById(String resumeid) {
        return this.find("select * from md_resume where id in (" + resumeid + ")");
    }
}
