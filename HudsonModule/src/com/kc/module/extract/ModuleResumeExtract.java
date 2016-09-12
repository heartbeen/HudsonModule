package com.kc.module.extract;

import java.sql.Timestamp;
import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.dao.ExtractDao;
import com.kc.module.utils.DateUtils;

public class ModuleResumeExtract extends ExtractDao {
    public Object extract() {
        String modulebarcode = getController().getPara("modulebarcode");

        StringBuilder builder = new StringBuilder();

        builder.append("SELECT FL.*,ROUND((NVL(FL.FINISHTIME,SYSDATE) - FL.LAUNCH),2) AS TOTALDAY FROM (SELECT MRR.*, ML.MODULECODE, ");
        builder.append("ML.GUESTCODE, MPS.NAME AS STATENAME, ( SELECT MIN(LRCDTIME) FROM MD_PROCESS_RESUME WHERE RSMID = MRR.ID ) ");
        builder.append("AS LAUNCH , (SELECT ROUND(SUM((NVL(NRCDTIME, SYSDATE) - LRCDTIME) / NVL(PARTCOUNT, 1)), 2) FROM MD_PROCESS_RESUME ");
        builder.append("WHERE RSMID = MRR.ID AND ISTIME = ? ) AS USEDAY FROM MD_RESUME_RECORD MRR ");
        builder.append("LEFT JOIN MD_PROCESS_STATE MPS ON MRR.RESUMESTATE = MPS.ID ");
        builder.append("LEFT JOIN MODULELIST ML ON MRR.MODULEBARCODE = ML.MODULEBARCODE ");
        builder.append("WHERE MRR.MODULEBARCODE = ?) FL ORDER BY LAUNCH");

        List<Record> query = Db.find(builder.toString(), new Object[]{Integer.valueOf(0), modulebarcode});

        Timestamp fore = null;
        for (Record record : query) {
            Timestamp start = record.getTimestamp("LAUNCH");
            start = (start == null ? DateUtils.getNowStampTime() : start);
            Timestamp finish = record.getTimestamp("FINISHTIME");
            if (fore != null) {
                long mill = (start.getTime() - fore.getTime()) / 1000L;
                record.set("DISTANCE", Long.valueOf(mill));
            }
            fore = finish;
        }
        return query;
    }
}
