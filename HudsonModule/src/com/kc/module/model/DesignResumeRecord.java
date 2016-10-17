package com.kc.module.model;

import java.util.List;

public class DesignResumeRecord extends ModelFinal<DesignResumeRecord> {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;
    public static DesignResumeRecord dao = new DesignResumeRecord();

    /**
     * 获取模具的所有设计加工记录
     * 
     * @param moduleid
     * @return
     */
    public List<DesignResumeRecord> getModuleDesignResume(String moduleid) {
        StringBuilder builder = new StringBuilder();

        builder.append("SELECT DRR.*, DR.ID AS DRID, MPS.NAME AS STATENAME,(SELECT NAME FROM DS_STATE_INFO DSI WHERE ID = DRR.WORKSTATE) AS WSNAME,DRR.GROUPID FROM ");
        builder.append("DS_RESUME_RECORD DRR LEFT JOIN DS_RESUME DR ON DRR.MODULEBARCODE = DR.MODULEBARCODE LEFT JOIN MD_PROCESS_STATE MPS ON DRR.STATEID = MPS.ID ");
        builder.append(" WHERE DRR.MODULEBARCODE = ? ORDER BY DRR.ID DESC");

        return this.find(builder.toString(), moduleid);
    }

    /**
     * 通过设计履历ID获取履历信息
     * 
     * @param resumeid
     * @return
     */
    public DesignResumeRecord getModuleDesignResumeById(String resumeid) {
        StringBuilder builder = new StringBuilder();

        builder.append("SELECT ML.GUESTCODE,ML.MODULECODE,FY.SHORTNAME,DRR.ORDERDATE,DRR.GROUPID,");
        builder.append("DRR.DUEDATE, (SELECT NAME FROM MD_PROCESS_STATE WHERE ID = DRR.STATEID) AS RESUMESTATE,");
        builder.append("(SELECT NAME FROM DS_STATE_INFO WHERE ID = DRR.WORKSTATE) AS WORKSTATENAME,");
        builder.append("DRR.STARTDATE,DRR.ENDDATE,DRR.ACTUALSTART,DRR.ACTUALEND,DRR.DEVISER,DRR.TAKEON,DRR.REPAIRNO,DRR.REMARK ");
        builder.append("FROM DS_RESUME_RECORD DRR LEFT JOIN MODULELIST ML ON DRR.MODULEBARCODE ");
        builder.append("= ML.MODULEBARCODE LEFT JOIN FACTORY FY ON ML.GUESTID = FY.ID WHERE DRR.ID = ?");

        return this.findFirst(builder.toString(), resumeid);
    }

    /**
     * 获取正在设计的履历信息
     * 
     * @param isall
     * @param empid
     * @return
     */
    public List<DesignResumeRecord> getProcessModuleInfo(boolean isall, String empid) {
        StringBuilder builder = new StringBuilder();
        
        System.out.println(empid);

        builder.append("SELECT DRR.ID,ML.MODULEBARCODE,ML.MODULECODE,ML.GUESTID,ML.GUESTCODE,FY.SHORTNAME, ");
        builder.append("ML.MODULECLASS,ML.PRODUCTNAME,ML.WORKPRESSURE,ML.UNITEXTRAC,DRR.DEVISER,(SELECT NAME FROM REGION_DEPART WHERE ID = DRR.GROUPID) AS GROUPNAME, ");
        builder.append("(SELECT IMAGEPATH FROM MD_PRODUCT_INFO WHERE ID = (SELECT MIN(ID) FROM MD_PRODUCT_INFO WHERE MODULEBARCODE = ML.MODULEBARCODE))");
        builder.append(" AS IMAGEPATH,DRR.TAKEON,DRR.STARTDATE,DRR.ENDDATE,DRR.ORDERDATE,DRR.DUEDATE,DRR.ACTUALSTART, ");
        builder.append("(SELECT COUNT(*) FROM DS_SCHEDULE_INFO WHERE DESIGNRESUMEID = DRR.ID AND PLANSTART IS NOT NULL AND FACTSTART ");
        builder.append("IS NULL AND SYSDATE > PLANSTART) AS ECNT, (SELECT COUNT(*) FROM DS_SCHEDULE_INFO WHERE DESIGNRESUMEID = DRR.ID");
        builder.append(" AND SCRAPPED = 0 AND STATEID NOT IN ('40205','40207')) AS FCNT FROM ");

        if (!isall) {
            builder.append("(SELECT DISTINCT DESIGNRESUMEID AS RESUMEID FROM DS_PROCESS_INFO WHERE EMPID = ?");
            builder.append(") DPI LEFT JOIN DS_RESUME_RECORD DRR  ON DPI.RESUMEID = DRR.ID LEFT JOIN MODULELIST ML");
            builder.append(" ON DRR.MODULEBARCODE = ML.MODULEBARCODE LEFT JOIN FACTORY FY ON ML.GUESTID = FY.ID ORDER BY ML.MODULECODE");

            return this.find(builder.toString(), empid);
        } else {
            builder.append("(SELECT ID AS RESUMEID FROM DS_RESUME UNION (SELECT DISTINCT DESIGNRESUMEID AS RESUMEID FROM DS_PROCESS_INFO))");
            builder.append(" DPI LEFT JOIN DS_RESUME_RECORD DRR ON DPI.RESUMEID = DRR.ID LEFT JOIN MODULELIST ML ON DRR.MODULEBARCODE = ");
            builder.append(" ML.MODULEBARCODE LEFT JOIN FACTORY FY ON ML.GUESTID = FY.ID ORDER BY ML.MODULECODE");

            return this.find(builder.toString());
        }
    }

}
