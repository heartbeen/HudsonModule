package com.kc.module.model;

import java.util.ArrayList;
import java.util.List;

import com.jfinal.kit.StrKit;
import com.jfinal.plugin.activerecord.Page;
import com.kc.module.databean.PaginationBean;
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.StringUtils;

public class ModuleList extends ModelFinal<ModuleList> {

    /**
     * 
     */
    private static final long serialVersionUID = -6517721022529615189L;

    public static ModuleList dao = new ModuleList();

    /**
     * 模糊查找用户在权限的工号
     * 
     * @param posIds
     * @param condition
     * @return
     */
    public List<ModuleList> findModuleNumber(String posId, String condition) {
        StringBuilder sql = new StringBuilder();

        sql.append("SELECT M.*,MR.ID RESUMEID,mr.REMARK,mr.STARTTIME,");
        sql.append("mr.ENDTIME,mr.RESUMESTATE FROM (SELECT ML.MODULECODE ");
        sql.append(" AS TEXT ,ML.MODULEBARCODE, ML.MODULEBARCODE AS ID,'l' ");
        sql.append("FROM MODULELIST ML WHERE ");

        if (StrKit.notBlank(condition)) {
            sql.append(" ML.MODULECODE LIKE '%'||?||'%' AND ");
        }

        sql.append(" ML.POSID=?) M LEFT JOIN MD_RESUME MR ON MR.MODULEBARCODE = M.ID");

        if (StrKit.notBlank(condition)) {
            return find(sql.toString(), condition.trim().toUpperCase(), posId);
        } else {
            return dao.find(sql.toString(), posId);
        }

    }

    /**
     * 得到有预排加工履历的工号
     * 
     * @param posId
     * @param condition
     * @return
     */
    public List<ModuleList> findResumeAllModule(String posId, String condition) {
        StringBuilder sql = new StringBuilder();
        sql.append("SELECT mc.modulecode || '(' || mp.name || ')' AS text, mc.modulebarcode, mc.id,'l',");
        sql.append("mc.starttime,mc.endtime ");
        sql.append("FROM (SELECT mm.modulecode, mm.modulebarcode, mr.ID, mr.RESUMESTATE,mr.starttime,  ");
        sql.append("mr.endtime FROM (SELECT ml.modulecode, ml.modulebarcode                            ");
        sql.append("FROM modulelist ml WHERE ");

        if (StrKit.notBlank(condition)) {
            sql.append("ml.modulecode LIKE '%'||?||'%' and ");
        }

        sql.append("ml.posid = ?) mm, md_resume mr WHERE mm.MODULEBARCODE = mr.MODULEBARCODE                       ");
        sql.append(") mc LEFT JOIN MD_PROCESS_STATE mp ON mp.ID = mc.RESUMESTATE                                   ");

        if (StrKit.notBlank(condition)) {
            return find(sql.toString(), condition.trim().toUpperCase(), posId);
        } else {
            return find(sql.toString(), posId);
        }

    }

    /**
     * 得到新模或修模/设变模具工号
     * 
     * @param isNew
     * @param posId
     * @return
     */
    public List<ModuleList> findResumeModule(boolean isNew, String posId) {
        StringBuilder sql = new StringBuilder();
        sql.append(" SELECT ml.modulecode || '(' || mps.name || ')' AS text, md.*, 'l' ");
        sql.append(" FROM (SELECT id, starttime, endtime, MODULEBARCODE, RESUMESTATE ");
        sql.append("    FROM md_resume WHERE RESUMESTATE  ");
        sql.append(isNew ? "=" : "<>");
        sql.append("'20401') md, modulelist ml, MD_PROCESS_STATE mps ");
        sql.append(" WHERE ml.MODULEBARCODE = md.MODULEBARCODE ");
        sql.append("    AND ml.POSID = ? ");
        sql.append("    AND MPS.ID = MD.RESUMESTATE ORDER BY  ML.MODULECODE");

        return dao.find(sql.toString(), posId);
    }

    /**
     * 得到模具工号
     * 
     * @param posId
     *            厂别ID
     * @param isFinish
     *            模具是否加工完
     * @param schType
     *            模具排程类型: 0为新模,1为修模
     * @return
     */
    public List<ModuleList> getModuleNumber(String posId, int isFinish, int schType) {
        StringBuilder sql = new StringBuilder();
        sql.append("select mr.id ||';'|| mr.modulebarcode id,ml.modulecode text,");
        sql.append("'l' from MD_RESUME mr right join MODULELIST ml ");
        sql.append("on ml.modulebarcode = mr.modulebarcode where mr.isfinish=? ");
        sql.append("and mr.schtype=?");
        sql.append("  and ml.posid=?");

        return dao.find(sql.toString(), isFinish, schType, posId);
    }

    public List<ModuleList> getExsitModuleCode(List<String> list) {
        if (list == null || list.size() == 0) {
            return (null);
        }

        StringBuilder builder = new StringBuilder("SELECT MODULECODE FROM MODULELIST WHERE MODULECODE IN ('");
        for (String moldno : list) {
            builder.append(moldno).append("','");
        }
        return dao.find(builder.substring(0, builder.length() - 2) + ")");
    }

    /**
     * 得到指定客户某年某月的模具最多套数<br>
     * KC客户用
     * 
     * @param guest
     * @param styleNo
     * @param year
     * @param month
     * @return
     */
    public int getGuestModuleMaxOfMonth(String guest, String styleNo, String year, String month) {
        String sql = "select nvl(max(monthno),0) maxno from modulelist where guestid = ?"
                     + " and modulestyle = ? and createYear =? and createMonth = ?";

        ModuleList module = findFirst(sql, guest, styleNo, year, month);

        return module.getNumber("maxno").intValue();
    }

    /**
     * 得到所有新模的工号
     * 
     * @param state
     * @return
     */
    public List<ModuleList> findModlueNewCode(String state) {

        String sql = "SELECT MR.*, ML.MODULECODE FROM (SELECT MODULEBARCODE, ID AS MODULERESUMEID FROM MD_RESUME WHERE RESUMESTATE = ?) MR LEFT JOIN MODULELIST ML ON MR.MODULEBARCODE = ML.MODULEBARCODE";
        return find(sql, state);
    }

    /**
     * 分页查找模具相关信息,用于KC
     * 
     * @param style
     * @param guest
     * @param year
     * @param month
     * @param batch
     * @param page
     * @param start
     * @param limit
     * @return
     */
    public Page<ModuleList> pageFindModuleInfo(String style, String guest, String year, String month, String batch, int page, int start, int limit) {
        StringBuilder sql = new StringBuilder();
        StringBuilder sqlExceptSelect = new StringBuilder();

        sql.append("SELECT a.MODULECODE ,a.GUESTCODE ,a.GUESTID ,      ");
        sql.append("b.SHORTNAME guestname ,a.PRODUCTNAME ,a.MODULECLASS ,");
        sql.append("a.UNITEXTRAC ,a.WORKPRESSURE, a.PLASTIC,        ");
        sql.append("a.STARTTIME  ,a.INITTRYTIME  ,             ");
        sql.append("a.TAKEON  ,c.EMPNAME moduletaker ,                ");
        sql.append("a.MODULEINTRO  ,a.MODULEBARCODE  ,a.POSID  ");

        sqlExceptSelect.append("FROM MODULELIST a LEFT JOIN factory b           ");
        sqlExceptSelect.append("ON a.GUESTID = b.id LEFT JOIN EMPLOYEE_INFO c        ");
        sqlExceptSelect.append("ON a.TAKEON = c.WORKNUMBER WHERE 1 = 1                        ");

        if (StrKit.notBlank(style)) {
            sqlExceptSelect.append(" and a.MODULESTYLE = '").append(style).append("'");
        }
        if (StrKit.notBlank(guest)) {
            sqlExceptSelect.append(" AND a.GUESTID = '").append(guest.toUpperCase()).append("'");
        }
        if (StrKit.notBlank(year)) {
            sqlExceptSelect.append(" AND a.CREATEYEAR = '").append(year.substring(2)).append("'");
        }
        if (StrKit.notBlank(month)) {
            sqlExceptSelect.append(" AND a.CREATEMONTH = '").append(month).append("'");
        }
        if (StrKit.notBlank(batch) && !batch.equals("[]")) {
            sqlExceptSelect.append(" AND a.MONTHNO IN ").append(batch.replace("[", "(").replace("\"", "").replace("]", ")"));
        }
        sqlExceptSelect.append(" order by a.GUESTID,a.MODULECODE");

        return paginate(page, limit, sql.toString(), sqlExceptSelect.toString());
    }

    /**
     * 分页查找模具相关信息,用于Coxon
     * 
     * @param queryField
     * @param condition
     * @param page
     * @param start
     * @param limit
     * @return
     */
    public List<ModuleList> pageFindModuleInfo(String condition) {
        StringBuilder sqlExceptSelect = new StringBuilder();

        sqlExceptSelect.append("SELECT A.*,B.SHORTNAME GUESTNAME ,C.EMPNAME MODULETAKER,D.STARTTIME AS STARTDATE,");
        sqlExceptSelect.append(" D.ENDTIME AS ENDDATE, D.ID AS RID, D.DEVISER, D.INSTALLER ");
        sqlExceptSelect.append("FROM MODULELIST A LEFT JOIN FACTORY B ON A.GUESTID = B.ID LEFT JOIN EMPLOYEE_INFO C ");
        sqlExceptSelect.append("ON A.TAKEON = C.WORKNUMBER LEFT JOIN MD_RESUME D ON A.MODULEBARCODE = D.MODULEBARCODE ");

        if (StrKit.notBlank(condition)) {
            sqlExceptSelect.append("WHERE A.MODULECODE LIKE '%").append(condition.trim().toUpperCase()).append("%'");
        }

        sqlExceptSelect.append(" ORDER BY A.MODULEBARCODE DESC");

        return this.find(sqlExceptSelect.toString());
    }

    public PaginationBean getPagination(String condition, int page, int limit) {
        PaginationBean pb = new PaginationBean();

        List<ModuleList> rows = pageFindModuleInfo(condition);
        if (rows != null && rows.size() > 0) {
            int maxSize = rows.size();

            @SuppressWarnings("rawtypes")
            List<ModelFinal> queryR = new ArrayList<ModelFinal>();

            int startIndex = (page - 1) * limit;
            int endIndex = page * limit;

            // 如果开始索引比查询的记录数量还多返回空
            if (startIndex >= maxSize) {
                pb.setSuccess(false);
                pb.setInfo(queryR);
                pb.setTotalCount(0);

                return pb;
            }

            // 获取要查询的列
            endIndex = (endIndex < maxSize ? endIndex : maxSize);
            for (int m = startIndex; m < endIndex; m++) {
                queryR.add(rows.get(m));
            }

            pb.setInfo(queryR);
            pb.setTotalCount(maxSize);
        }

        pb.setSuccess(true);

        return pb;
    }

    /**
     * 查询相应的单位所有工件所对应的模具信息
     * 
     * @param posId
     *            模具制造厂Id
     * 
     * @param moduleResumeId
     *            查询指定模具信息
     * 
     * @param all
     *            是否为所有模具制造厂模具信息
     * @return
     */
    public List<ModuleList> findGroupModuleInfo(String posId, String moduleResumeId, boolean all) {
        StringBuilder sql = new StringBuilder();

        sql.append("SELECT MR.*, ML.MODULECODE, ML.GUESTID, ML.MODULECLASS, ML.PICTUREURL AS DESIGNER           ");
        sql.append("    , ML.TAKEON, ML.PRODUCTNAME, ML.MODULEINTRO, ML.WORKPRESSURE, ML.UNITEXTRAC             ");
        sql.append("    , ML.PLASTIC, F.SHORTNAME AS GUESTNAME, MS.NAME AS MODULESTATE, ML.PICTUREURL,          ");
        sql.append("(SELECT EMPNAME FROM EMPLOYEE_INFO WHERE WORKNUMBER = ML.CREATOR) AS DETECTOR, ML.TAKEON    ");
        sql.append("AS EXECUTIVE FROM (SELECT ID MODULERESUMEID ,CURESTATE,RESUMESTATE,RESUMEEMPID,STARTTIME,   ");
        sql.append(" ENDTIME,REMARK,MODULEBARCODE FROM MD_RESUME MR                                             ");
        if (!all) {
            sql.append("    WHERE ID IN (SELECT DISTINCT MODULERESUMEID   FROM MD_PROCESS_INFO      ");
            sql.append("    WHERE CURRENTDEPTID in (SELECT ID FROM REGION_DEPART WHERE STEPID LIKE  ");
            sql.append("(SELECT STEPID ||'%' FROM REGION_DEPART WHERE ID = '").append(posId).append("')))");
        }

        if (StrKit.notBlank(moduleResumeId)) {
            sql.append(" WHERE MR.ID='").append(moduleResumeId).append("'");

        }
        sql.append("  ) MR LEFT JOIN MODULELIST ML ON ML.MODULEBARCODE = MR.MODULEBARCODE LEFT JOIN FACTORY F ");
        sql.append("  ON F.ID = ML.GUESTID LEFT JOIN MD_PROCESS_STATE MS ON MS.ID = MR.RESUMESTATE            ");

        return find(sql.toString());
    }

    /**
     * 通过模具工号查找模具信息
     * 
     * @param moduleCode
     * @return
     */
    public ModuleList findModuleForModuleCode(Object moduleCode) {
        return findFirst("SELECT * FROM " + tableName() + " WHERE MODULECODE=?", moduleCode);
    }

    /**
     * 统计模具进度
     * 
     * @param posid
     * @return
     */
    public List<ModuleList> findModuleSchedule(Object posid, String stateid) {
        StringBuilder sql = new StringBuilder();

        // sql.append("SELECT F.SHORTNAME, ML.MODULECODE, ML.GUESTID, ML.MODULECLASS, ML.STARTTIME ");
        // sql.append(", ML.INITTRYTIME, ML.MODULESTATE, ML.PRODUCTNAME, ML.MODULEINTRO, ML.WORKPRESSURE ");
        // sql.append(", ML.UNITEXTRAC, ML.MODULEBARCODE, MR.ID, ML.PLASTIC, MPS.NAME AS RSENAME, (");
        // sql.append("    SELECT CASE WHEN SUM(NVL(DURATION, 0)) = 0 THEN 0 ELSE ROUND(SUM(CASE WHEN STARTTIME <= SYSDATE              ");
        // sql.append("        AND ENDTIME <= SYSDATE THEN NVL(DURATION, 0) WHEN STARTTIME <= SYSDATE                                   ");
        // sql.append("        AND ENDTIME > SYSDATE THEN (SYSDATE - STARTTIME) * 24 ELSE 0 END) / SUM(NVL(DURATION, 0)) * 100, 1) END  ");
        // sql.append("    FROM MD_EST_SCHEDULE                                                                                         ");
        // sql.append("    WHERE MODULERESUMEID = MR.ID                                                                                 ");
        // sql.append("        AND PARENTID IS NOT NULL                                                                                 ");
        // sql.append("        AND TYPEID IS NULL                                                                                       ");
        // sql.append("    ) AS SCHEDULE, (                                                                                             ");
        //
        // sql.append("    SELECT CASE WHEN NVL((                                                                                       ");
        // sql.append("            SELECT NVL(SUM(NVL(EVALUATE, DURATION)), 0)                                                          ");
        // sql.append("            FROM MD_EST_SCHEDULE                                                                                 ");
        // sql.append("            WHERE MODULERESUMEID = MR.ID                                                                         ");
        // sql.append("                AND PARENTID IS NOT NULL                                                                         ");
        // sql.append("                AND TYPEID IS NULL                                                                               ");
        // sql.append("            ), 0) = 0 THEN 0 ELSE NVL(ROUND((                                                                    ");
        // sql.append("            SELECT SUM((NVL(NRCDTIME, SYSDATE) - LRCDTIME) * 24)                                                 ");
        // sql.append("            FROM MD_PROCESS_RESUME                                                                               ");
        // sql.append("            WHERE RSMID = MR.ID                                                                                  ");
        // sql.append("                AND ISTIME = 0                                                                                   ");
        // sql.append("                AND LRCDTIME IS NOT NULL                                                                         ");
        // sql.append("            ) / (                                                                                                ");
        // sql.append("            SELECT NVL(SUM(NVL(EVALUATE, DURATION)), 0)                                                          ");
        // sql.append("            FROM MD_EST_SCHEDULE                                                                                 ");
        // sql.append("            WHERE MODULERESUMEID = MR.ID                                                                         ");
        // sql.append("                AND PARENTID IS NOT NULL                                                                         ");
        // sql.append("                AND TYPEID IS NULL                                                                               ");
        // sql.append("            ) * 100, 1), 0) END                                                                                  ");
        // sql.append("    FROM DUAL                                                                                                    ");
        // sql.append("    ) AS ACTUAL ,");
        // sql.append(" ROUND((MR.ENDTIME - SYSDATE) * 24 , 1) AS DELAYHOUR");
        // sql.append(" FROM MD_RESUME MR ");
        // sql.append("LEFT JOIN MODULELIST ML ON ML.MODULEBARCODE = MR.MODULEBARCODE ");
        // // sql.append("AND ML.POSID = ? ");
        // sql.append("    LEFT JOIN FACTORY F ON F.ID = ML.GUESTID LEFT JOIN MD_PROCESS_STATE MPS ON MR.RESUMESTATE = MPS.ID  ");
        // sql.append("ORDER BY ML.GUESTID, ML.MODULECODE ");
        //
        // return find(sql.toString());

        sql.append("SELECT MLI.*, NVL(ROUND(CASE WHEN EHOUR = 0 THEN 0 WHEN AHOUR > EHOUR THEN 100 ELSE AHOUR * 100 / EHOUR END, 1),0) AS ACTUAL,");
        sql.append("  NVL(ROUND(CASE WHEN SPER > 1 THEN 100 ELSE SPER * 100 END, 1),0) AS SCHEDULE FROM ( ");
        sql.append("    SELECT MR.ID, MR.RESUMESTATE, MR.MODULEBARCODE, (SELECT COUNT(*) FROM MD_RESUME_RECORD WHERE RESUMESTATE IN ('20402','20403') AND MODULEBARCODE = MR.MODULEBARCODE) AS MCOUNT, ML.MODULECODE, FY.SHORTNAME, ML.MODULECLASS, ML.GUESTCODE ");
        sql.append("      ,MR.INSTALLER,MR.ISURGENT, ML.PRODUCTNAME,TO_CHAR(MR.FITDATE,'yyyy-mm-dd') AS FITDATE, ML.UNITEXTRAC, ML.WORKPRESSURE, ML.PLASTIC, MRR.REMARK AS MODULEINTRO, ");
        sql.append("      MR.DEVISER, MR.PROCESSED, MRR.STARTTIME, MRR.ENDTIME AS INITTRYTIME, MPS.NAME AS RSENAME, 0 AS EHOUR, 0 AS AHOUR, ");
        sql.append(" (CASE WHEN SYSDATE > MRR.STARTTIME THEN SYSDATE - MRR.STARTTIME ELSE 0 END) / ");
        sql.append("  (MRR.ENDTIME - MRR.STARTTIME) AS SPER ,ROUND((MRR.ENDTIME - SYSDATE) * 24, 1) AS DELAYHOUR ");
        sql.append("  FROM (SELECT * FROM MD_RESUME ");

        if (!StringUtils.isEmpty(stateid)) {
            sql.append("WHERE RESUMESTATE IN (");
            sql.append(stateid);
            sql.append(")");
        }
        sql.append("  ) MR LEFT JOIN MD_RESUME_RECORD MRR ON MR.ID = MRR.ID  ");
        sql.append("  LEFT JOIN MODULELIST ML ON MR.MODULEBARCODE = ML.MODULEBARCODE ");
        sql.append("  LEFT JOIN MD_PROCESS_STATE MPS ON MR.RESUMESTATE = MPS.ID ");
        sql.append("  LEFT JOIN FACTORY FY ON ML.GUESTID = FY.ID) MLI ORDER BY RESUMESTATE");

        return find(sql.toString());
    }

    /**
     * 通过客户代码得到客户模具机种
     * 
     * @param guestCode
     * @return
     */
    public List<ModuleList> findModuleClass(String guestid) {
        return find("SELECT DISTINCT ML.MODULECLASS FROM MODULELIST ML WHERE ML.GUESTID = ?", guestid);
    }

    /**
     * 获取模具工号数据
     * 
     * @return
     */
    public List<ModuleList> findModuleListData() {
        return find("SELECT * FROM MODULELIST ");
    }

    /**
     * 得到所有正加工模具的机种名
     * 
     * @return
     */
    public List<ModuleList> findMoudleClassProcess() {
        return find("SELECT DISTINCT MODULECLASS  FROM MODULELIST WHERE   MODULEBARCODE IN  (SELECT MODULEBARCODE FROM MD_RESUME) ");
    }

    /**
     * 查找匹配的模具訊息
     * 
     * @param mold
     * @return
     */
    public List<ModuleList> getModuleCodeList(String mold) {
        return this.find("SELECT MODULEBARCODE AS BARCODE,MODULECODE FROM MODULELIST WHERE MODULECODE LIKE ?",
                         StringUtils.isEmpty(mold) ? mold : mold.toUpperCase() + "%");
    }

    /**
     * 查询匹配的模具是否已经安排排程
     * 
     * @param match
     * @return
     */
    public List<ModuleList> getScheduleModuleInfo(String match) {

        if (StringUtils.isEmpty(match)) {
            return new ArrayList<ModuleList>();
        }
        StringBuilder builder = new StringBuilder();
        builder.append("SELECT * FROM (SELECT A.MODULEBARCODE, A.MODULECODE, (                        ");
        builder.append("        SELECT COUNT(*)                                                       ");
        builder.append("        FROM MD_EST_SCHEDULE MES                                              ");
        builder.append("            LEFT JOIN MD_PART_LIST MPL ON MES.PARTID = MPL.PARTBARLISTCODE    ");
        builder.append("        WHERE NVL(MES.TYPEID, ?) = ?                                          ");
        builder.append("            AND MPL.MODULEBARCODE = A.MODULEBARCODE                           ");
        builder.append("        ) AS SCHECOUNT                                                        ");
        builder.append("FROM MODULELIST A                                                             ");
        builder.append("WHERE A.MODULESTATE = ? AND A.MODULECODE LIKE ? ) WHERE SCHECOUNT > 0         ");

        return this.find(builder.toString(), "0", "0", "0", match.toUpperCase() + "%");
    }

    /**
     * 查找已经导入工件的模具工号,当查找的模具工件数量大于0时,则为已经导入工件
     * 
     * @param match
     * @return
     */
    public List<ModuleList> getMatchModuleInfo(String match) {
        if (StringUtils.isEmpty(match)) {
            return new ArrayList<ModuleList>();
        }

        StringBuilder builder = new StringBuilder();

        builder.append("SELECT * FROM (SELECT MODULEBARCODE, MODULECODE, (   ");
        builder.append("        SELECT COUNT(*)                             ");
        builder.append("        FROM MD_PART_LIST MPL                       ");
        builder.append("        WHERE MPL.MODULEBARCODE = ML.MODULEBARCODE  ");
        builder.append("            AND MPL.ISENABLE = ?                    ");
        builder.append("        ) AS PARTCOUNT                              ");
        builder.append("FROM MODULELIST ML                                  ");
        builder.append("WHERE MODULECODE LIKE ? ) WHERE PARTCOUNT > 0       ");

        return this.find(builder.toString(), "0", match.toUpperCase() + "%");
    }

    /**
     * 按条件查询模具工号讯息
     * 
     * @param stype
     * @param content
     * @return
     */
    public List<ModuleList> queryModuleInfoByCase(String stype, String content) {
        // 如果类型为空或者非数字或者内容为空,则返回一个空的集合
        if (StringUtils.isEmpty(stype) || !ArithUtils.isPlusInt(stype, false) || StringUtils.isEmpty(content)) {
            return new ArrayList<ModuleList>();
        }

        StringBuilder builder = new StringBuilder();
        builder.append("SELECT A.MODULEBARCODE, A.MODULECODE, A.MODULESTATE FROM MODULELIST A ");
        if (stype.equals("0")) {
            builder.append("WHERE A.MODULECODE LIKE ?||'%' ORDER BY A.MODULECODE");
            return this.find(builder.toString(), content.toUpperCase());
        } else if (stype.equals("1")) {
            builder.append("LEFT JOIN FACTORY B ON A.GUESTID = B.ID WHERE ");
            builder.append("B.FACTORYCODE = ? ORDER BY A.MODULECODE");
            return this.find(builder.toString(), content.toUpperCase());
        } else if (stype.equals("2")) {
            builder.append("WHERE A.MODULECLASS LIKE ?||'%' ORDER BY A.MODULECODE");
            return this.find(builder.toString(), content);
        } else {
            return new ArrayList<ModuleList>();
        }
    }

    /**
     * 通模具履历号得到模具信息
     * 
     * @param resumeId
     *            履历号
     * @return
     */
    public ModuleList findModuleForResume(Object resumeId) {
        StringBuilder sql = new StringBuilder();
        sql.append("SELECT F.SHORTNAME, M.*                                  ");
        sql.append("  FROM MODULELIST M                                      ");
        sql.append("  LEFT JOIN FACTORY F                                    ");
        sql.append("    ON F.ID = M.GUESTID                                  ");
        sql.append(" WHERE MODULEBARCODE =                                   ");
        sql.append("       (SELECT MODULEBARCODE FROM MD_RESUME WHERE ID = ?)");

        return findFirst(sql.toString(), resumeId);
    }

    /**
     * 通模具履历号得到模具信息
     * 
     * @param resumeId
     *            履历号
     * @return
     */
    public List<ModuleList> findModuleForResumes(Object[] resumeIds) {
        StringBuilder sql = new StringBuilder();

        sql.append("SELECT ML.MODULECODE, ML.GUESTCODE, FY.SHORTNAME, MR.STARTTIME, MR.ENDTIME ");
        sql.append(", MPS.NAME FROM MD_RESUME_RECORD MR ");
        sql.append("LEFT JOIN MODULELIST ML ON MR.MODULEBARCODE = ML.MODULEBARCODE ");
        sql.append("LEFT JOIN FACTORY FY ON ML.GUESTID = FY.ID ");
        sql.append("LEFT JOIN MD_PROCESS_STATE MPS ON MR.RESUMESTATE = MPS.ID ");
        sql.append("WHERE MR.ID IN (");

        for (int i = 0; i < resumeIds.length; i++) {
            sql.append("?").append(i == resumeIds.length - 1 ? ")" : ",");
        }

        return find(sql.toString(), resumeIds);
    }

    /**
     * 获取模糊查询的模具资料
     * 
     * @param vague
     * @param isAll
     * @return
     */
    public List<ModuleList> getModuleListByVague(String vague, boolean isAll) {
        String queryCase = null;
        if (StringUtils.isEmpty(vague) && !isAll) {
            queryCase = "";
        } else {
            queryCase = vague.toUpperCase() + "%";
        }

        return this.find("SELECT MR.MODULEBARCODE,ML.MODULECODE FROM MD_RESUME MR LEFT JOIN MODULELIST ML ON MR.MODULEBARCODE = ML.MODULEBARCODE WHERE ML.MODULESTATE = 0 AND ML.MODULECODE LIKE ? ORDER BY MODULECODE",
                         queryCase);
    }

    /**
     * 获取模糊查询的模具资料
     * 
     * @param vague
     * @param isAll
     * @return
     */
    public List<ModuleList> getModuleListByVague(String vague, String stateid, boolean isAll) {
        String queryCase = null;
        if (StringUtils.isEmpty(vague) && !isAll) {
            queryCase = "";
        } else {
            queryCase = StringUtils.parseString(vague) + "%";
        }

        String sql = "SELECT MR.MODULEBARCODE,ML.MODULECODE FROM MD_RESUME MR LEFT JOIN MODULELIST ML ON MR.MODULEBARCODE"
                     + " = ML.MODULEBARCODE WHERE MR.RESUMESTATE = ? AND ML.MODULESTATE = 0 AND ML.MODULECODE LIKE ? ORDER BY MODULECODE";

        return this.find(sql, stateid, queryCase);
    }

    /**
     * 通过对应的列以及值查找该模具资料
     * 
     * @param col
     * @param val
     * @param isAll
     * @return
     */
    public ModuleList findModuleByColumn(String col, String val, boolean isAll) {
        return this.findFirst("SELECT ML.*, MR.ID AS RESUMEID FROM MODULELIST ML "
                              + "LEFT JOIN MD_RESUME MR ON ML.MODULEBARCODE = MR.MODULEBARCODE WHERE "
                              + col
                              + " = ? "
                              + (isAll ? " AND MODULESTATE = 0" : ""), val);
    }

    /**
     * 获取设计模块的模具信息
     * 
     * @param match
     * @return
     */
    public List<ModuleList> getDeviserModuleInfo(String match, boolean ds) {
        StringBuilder builder = new StringBuilder();
        builder.append("SELECT ML.MODULEBARCODE, FY.SHORTNAME AS GUESTNAME, ML.MODULECLASS,ML.GUESTID, ML.GUESTCODE, ML.PRODUCTNAME, ML.MODULECODE, ML.UNITEXTRAC, MPS.NAME AS RESUMESTATE,");
        builder.append("(SELECT IMAGEPATH FROM MD_PRODUCT_INFO WHERE ID = (SELECT MIN(ID) FROM MD_PRODUCT_INFO WHERE MODULEBARCODE = ML.MODULEBARCODE)) AS IMAGEURL,");
        builder.append("ML.TAKEON,ML.PICTUREURL, ML.MODULEINTRO,ML.WORKPRESSURE, ML.ENSURE FROM MODULELIST ML LEFT JOIN DS_RESUME DR ON ML.MODULEBARCODE = ");
        builder.append("DR.MODULEBARCODE LEFT JOIN FACTORY FY ON ML.GUESTID = FY.ID LEFT JOIN MD_PROCESS_STATE MPS ON DR.STATEID = MPS.ID WHERE 1 = 1 ");
        if (!StringUtils.isEmpty(match)) {
            builder.append(" AND (ML.GUESTCODE LIKE '").append(match).append("%' OR ML.MODULECODE LIKE '").append(match).append("%')");
        }

        if (ds) {
            builder.append(" AND DR.ID IS NOT NULL");
        }

        builder.append(" ORDER BY ML.CREATETIME DESC");

        return this.find(builder.toString());
    }

    /**
     * 获取设计模具条码讯息
     * 
     * @param type
     * @param chk
     * @param match
     * @param states
     * @return
     */
    public List<ModuleList> getDeviseModuleByCase(int type, boolean chk, String match, String states) {
        String sql = null;
        if (type == 0) {
            sql = "SELECT ML.MODULEBARCODE,ML.MODULECODE,ML.GUESTCODE FROM MODULELIST ML WHERE MODULESTATE = 0 "
                  + (chk ? "AND ML.GUESTCODE LIKE ?" : " AND ML.MODULECODE LIKE ?");

            return this.find(sql, StringUtils.isEmpty(match) ? match : match.toUpperCase() + "%");
        } else {
            sql = "SELECT ML.MODULEBARCODE,ML.MODULECODE,ML.GUESTCODE FROM DS_RESUME DR LEFT JOIN MODULELIST "
                  + "ML ON DR.MODULEBARCODE = ML.MODULEBARCODE WHERE MODULESTATE = 0 AND DR.STATEID IN "
                  + states;

            return this.find(sql);
        }
    }
}
