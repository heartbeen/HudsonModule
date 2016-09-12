package com.kc.module.extract;

import com.jfinal.plugin.activerecord.Db;
import com.kc.module.dao.ExtractDao;
import com.kc.module.utils.ControlUtils;
import com.kc.module.utils.DateUtils;

public class DeviseFinishQueryExtract extends ExtractDao {

    @Override
    public Object extract() {
        // 判断是否为月度
        boolean ismonth = ControlUtils.getParaToBoolean(getController(), "ismonth", false);
        // 声明开始时间和结束时间
        String startdate = null, enddate = null;
        // 获取上周的星期一
        String format = "yyyyMMdd";

        if (ismonth) {
            startdate = DateUtils.getLastMonthStartDate(format);
            enddate = DateUtils.getLastMonthEndDate(format);
        } else {
            startdate = DateUtils.getMondayOfLastWeek(format);
            enddate = DateUtils.getNextField(startdate, format, format, 5, 7);
        }

        StringBuilder builder = new StringBuilder();

        builder.append("SELECT DRR.ID,ML.MODULEBARCODE,ML.MODULECODE,ML.GUESTID,ML.GUESTCODE,FY.SHORTNAME,");
        builder.append("ML.MODULECLASS, ML.PRODUCTNAME,ML.WORKPRESSURE,ML.UNITEXTRAC,DRR.DEVISER,DRR.TAKEON,DRR.STARTDATE,");
        builder.append("DRR.ENDDATE,DRR.ORDERDATE,DRR.DUEDATE,DRR.ACTUALSTART,DRR.ISIMG,DRR.AMEND,");
        builder.append("(SELECT NAME FROM REGION_DEPART WHERE ID = DRR.GROUPID) AS GROUPNAME,");
        builder.append("(SELECT IMAGEPATH FROM MD_PRODUCT_INFO WHERE ID =(SELECT MIN(ID) FROM MD_PRODUCT_INFO WHERE ");
        builder.append("MODULEBARCODE = ML.MODULEBARCODE)) AS IMAGEPATH,(SELECT COUNT(*) FROM DS_SCHEDULE_INFO WHERE DESIGNRESUMEID = DRR.ID ");
        builder.append("AND PLANSTART IS NOT NULL AND FACTSTART IS NULL AND SYSDATE > PLANSTART) AS ECNT,(SELECT COUNT(*) FROM DS_SCHEDULE_INFO ");
        builder.append("WHERE DESIGNRESUMEID = DRR.ID AND SCRAPPED = 0 AND STATEID NOT IN ('40205','40207')) AS FCNT ");
        // builder.append("FROM (SELECT ID AS RESUMEID FROM DS_RESUME UNION (SELECT DISTINCT DESIGNRESUMEID AS RESUMEID FROM DS_PROCESS_INFO ");
        builder.append("FROM DS_RESUME_RECORD DRR LEFT JOIN MODULELIST ML ON DRR.MODULEBARCODE = ");
        builder.append("ML.MODULEBARCODE LEFT JOIN FACTORY FY ON ML.GUESTID = FY.ID ");
        builder.append("WHERE DRR.ACTUALEND BETWEEN TO_DATE(?,?) AND TO_DATE(?,?) ORDER BY ML.MODULECODE");

        return Db.find(builder.toString(), startdate, format, enddate, format);
    }
}
