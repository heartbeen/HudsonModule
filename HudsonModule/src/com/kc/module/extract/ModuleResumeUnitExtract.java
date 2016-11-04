package com.kc.module.extract;

import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.dao.ExtractDao;
import com.kc.module.utils.StringUtils;

public class ModuleResumeUnitExtract extends ExtractDao {

    @Override
    public Object extract() {
        // 获取模具加工履历
        String resumeid = this.getController().getPara("resumeid");
        // 零件匹配编号
        String partcode = this.getController().getPara("partcode");

        StringBuilder builder = new StringBuilder();

        builder.append("SELECT MP.PARTBARCODE,MPI.MODULERESUMEID, MPI.PARTBARLISTCODE, MP.PARTCODE, MPL.PARTLISTCODE, MP.CNAMES,MPL.QUANTITY, ");
        builder.append("(SELECT CASE  WHEN COUNT(ID)>0 THEN 'craft-schedule-exits' ELSE 'only-font-bold' END FROM MD_EST_SCHEDULE WHERE PARTID = ");
        builder.append("MPL.PARTBARLISTCODE AND MODULERESUMEID = MPI.MODULERESUMEID AND TYPEID IS NULL) CLS FROM MD_PROCESS_INFO MPI LEFT JOIN MD_PART_LIST MPL ");
        builder.append("ON MPI.PARTBARLISTCODE = MPL.PARTBARLISTCODE LEFT JOIN MD_PART MP ON MPL.PARTBARCODE = MP.PARTBARCODE ");
        builder.append("WHERE MPI.MODULERESUMEID = ? AND MPL.ISFIXED = ? AND MPL.ISENABLE = ? AND MPL.PARTLISTCODE LIKE ? ||'%' ORDER BY MPL.PARTLISTCODE");

        List<Record> querys = Db.find(builder.toString(), resumeid, 0, 0, partcode == null ? "" : partcode);

        if (querys.size() > 0) {
            for (Record rd : querys) {
                String partlistcode = rd.getStr("PARTLISTCODE");
                String cnames = rd.getStr("CNAMES");

                String text = partlistcode + (StringUtils.isEmpty(cnames) ? "" : " [ " + cnames + " ]");

                rd.set("TEXT", text);
                rd.set("LEAF", true);
                rd.set("CHECKED", false);
            }
        }

        return querys;
    }
}
