package com.kc.module.extract;

import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.dao.ExtractDao;
import com.kc.module.utils.ArithUtils;

public class EffcientUnitExtract extends ExtractDao {

    @Override
    public Object extract() {
        String empid = this.getController().getPara("empid");

        String start = this.getController().getPara("startdate");
        String end = this.getController().getPara("enddate");
        String format = "yyyy-MM-dd";

        StringBuilder builder = new StringBuilder();

        builder.append("SELECT MPE.*, MC.CRAFTNAME, MC.CRAFTCODE, MPL.PARTLISTCODE, ML.MODULECODE , (SELECT SUM(EVALUATE) FROM MD_EST_SCHEDULE ");
        builder.append("WHERE MODULERESUMEID = MPE.MODULERESUMEID AND PARTID = MPE.PARTBARLISTCODE ) AS EVALUATE, ( ");
        builder.append("SELECT ROUND(SUM((NVL(NRCDTIME, SYSDATE) - LRCDTIME) / TO_NUMBER(PARTCOUNT)) * 24, 2) FROM MD_PROCESS_RESUME ");
        builder.append("WHERE ISTIME = ? AND RSMID = MPE.MODULERESUMEID AND PARTBARLISTCODE = MPE.PARTBARLISTCODE AND LPROCRAFTID = MPE.LPROCRAFTID ) AS TOTALTIME FROM (");
        builder.append("SELECT MPF.MODULERESUMEID, MPF.PARTBARLISTCODE, MPR.LPROCRAFTID, MPR.LEMPID, ROUND(SUM((NVL(MPR.NRCDTIME, SYSDATE) - MPR.LRCDTIME) / TO_NUMBER(MPR.PARTCOUNT)) * 24, 2) AS ACTTIME ");
        builder.append("FROM MD_PROCESS_FINISH MPF LEFT JOIN MD_PROCESS_RESUME MPR ON MPF.MODULERESUMEID = MPR.RSMID AND MPF.PARTBARLISTCODE = MPR.PARTBARLISTCODE ");
        builder.append("WHERE MPF.FINISHDATE BETWEEN TO_DATE(?,?) AND TO_DATE(?,?) AND MPR.ISTIME = ? AND MPR.LEMPID = ? GROUP BY MPF.MODULERESUMEID, MPF.PARTBARLISTCODE, MPR.LPROCRAFTID ,MPR.LEMPID ) MPE ");
        builder.append("LEFT JOIN MD_PART_LIST MPL ON MPE.PARTBARLISTCODE = MPL.PARTBARLISTCODE LEFT JOIN MODULELIST ML ON MPL.MODULEBARCODE = ML.MODULEBARCODE ");
        builder.append("LEFT JOIN MD_CRAFT MC ON MPE.LPROCRAFTID = MC.ID ORDER BY MPE.MODULERESUMEID,MPE.PARTBARLISTCODE");

        List<Record> query = Db.find(builder.toString(), "0", start, format, end, format, "0", empid);
        if (query.size() > 0) {
            for (Record item : query) {
                double acttime = ArithUtils.parseDouble(item.get("acttime"), 0);
                double totaltime = ArithUtils.parseDouble(item.get("totaltime"), 0);
                double evaluate = ArithUtils.parseDouble(item.get("evaluate"), 0);

                double last = ArithUtils.round((totaltime == 0 ? 0 : evaluate * (acttime / totaltime)), 1);

                item.set("evaluate", last);
            }
        }

        return query;
    }

}
