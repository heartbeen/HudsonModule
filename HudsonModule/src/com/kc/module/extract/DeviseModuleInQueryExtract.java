package com.kc.module.extract;

import com.jfinal.plugin.activerecord.Db;
import com.kc.module.dao.ExtractDao;
import com.kc.module.databean.TableParameter;
import com.kc.module.utils.JsonUtils;

public class DeviseModuleInQueryExtract extends ExtractDao {
    @Override
    public Object extract() {
        StringBuilder builder = new StringBuilder();

        TableParameter[] tablepara = JsonUtils.josnToBean(this.getController().getPara("tablepara"), TableParameter[].class);

        String tableSeq = " WHERE 1 = 1";

        // 生成查询条件
        if (tablepara != null && tablepara.length > 0) {
            for (TableParameter tp : tablepara) {
                tableSeq += (" AND " + tp.toSql());
            }
        }

        builder.append("SELECT DRR.ID,ML.MODULEBARCODE,ML.MODULECODE,ML.GUESTID,ML.GUESTCODE,FY.SHORTNAME,");
        builder.append("ML.MODULECLASS, ML.PRODUCTNAME,ML.WORKPRESSURE,ML.UNITEXTRAC,DRR.DEVISER,DRR.TAKEON,DRR.STARTDATE,");
        builder.append("DRR.ENDDATE,DRR.ORDERDATE,DRR.DUEDATE,DRR.ACTUALSTART,DRR.ISIMG,DRR.AMEND,");
        builder.append("(SELECT NAME FROM REGION_DEPART WHERE ID = DRR.GROUPID) AS GROUPNAME,");
        builder.append("(SELECT IMAGEPATH FROM MD_PRODUCT_INFO WHERE ID =(SELECT MIN(ID) FROM MD_PRODUCT_INFO WHERE ");
        builder.append("MODULEBARCODE = ML.MODULEBARCODE)) AS IMAGEPATH,(SELECT COUNT(*) FROM DS_SCHEDULE_INFO WHERE DESIGNRESUMEID = DRR.ID ");
        builder.append("AND PLANSTART IS NOT NULL AND FACTSTART IS NULL AND SYSDATE > PLANSTART) AS ECNT,(SELECT COUNT(*) FROM DS_SCHEDULE_INFO ");
        builder.append("WHERE DESIGNRESUMEID = DRR.ID AND SCRAPPED = 0 AND STATEID NOT IN ('40205','40207')) AS FCNT ");
        builder.append("FROM (SELECT ID AS RESUMEID FROM DS_RESUME UNION (SELECT DISTINCT DESIGNRESUMEID AS RESUMEID FROM DS_PROCESS_INFO ");
        builder.append(")) DPI LEFT JOIN DS_RESUME_RECORD DRR ON DPI.RESUMEID = DRR.ID LEFT JOIN MODULELIST ML ON DRR.MODULEBARCODE = ");
        builder.append("ML.MODULEBARCODE LEFT JOIN FACTORY FY ON ML.GUESTID = FY.ID ");

        builder.append(tableSeq);
        builder.append(" ORDER BY ML.MODULECODE");

        return Db.find(builder.toString());
    }

}
