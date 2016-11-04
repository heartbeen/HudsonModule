package com.kc.module.model;

import java.util.List;

public class DesignResume extends ModelFinal<DesignResume> {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;
    public static DesignResume dao = new DesignResume();

    /**
     * 获取组别设计信息
     * 
     * @param groupid
     * @return
     */
    public List<DesignResume> getGroupDesignInfo(String groupid) {

        StringBuilder builder = new StringBuilder();

        builder.append("SELECT DRR.ID,ML.MODULEBARCODE,ML.MODULECODE,ML.GUESTID,ML.GUESTCODE,FY.SHORTNAME, ML.MODULECLASS,ML.PRODUCTNAME,ML.WORKPRESSURE,MPS.NAME AS RESUMESTATE,");
        builder.append("ML.UNITEXTRAC,DRR.DEVISER, (SELECT IMAGEPATH FROM MD_PRODUCT_INFO WHERE ID = (SELECT MIN(ID) FROM MD_PRODUCT_INFO WHERE MODULEBARCODE ");
        builder.append("= ML.MODULEBARCODE)) AS IMAGEPATH,DRR.TAKEON,DRR.STARTDATE,DRR.ENDDATE,DRR.ORDERDATE,DRR.DUEDATE,DRR.ACTUALSTART, (SELECT COUNT(*) FROM ");
        builder.append("DS_SCHEDULE_INFO WHERE DESIGNRESUMEID = DRR.ID AND PLANSTART IS NOT NULL AND FACTSTART IS NULL AND SYSDATE > PLANSTART) AS ECNT, ");
        builder.append("(SELECT COUNT(*) FROM DS_SCHEDULE_INFO WHERE DESIGNRESUMEID = DRR.ID AND SCRAPPED = 0 AND STATEID NOT IN ('40205','40207')) AS FCNT FROM ");
        builder.append("DS_RESUME DR LEFT JOIN DS_RESUME_RECORD DRR ON DR.ID = DRR.ID LEFT JOIN MODULELIST ML ON DRR.MODULEBARCODE = ML.MODULEBARCODE LEFT JOIN ");
        builder.append("FACTORY FY ON ML.GUESTID = FY.ID LEFT JOIN MD_PROCESS_STATE MPS ON DRR.STATEID = MPS.ID WHERE DR.GROUPID = ? ORDER BY ML.MODULECODE");

        return this.find(builder.toString(), groupid);
    }
}
