package com.kc.module.transaction;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.dao.BaseIAtom;
import com.kc.module.model.form.ModuleScheduleGanttForm;
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.StringUtils;

/**
 * 清除计划排程
 * 
 * @author ASUS
 * 
 */
public class RemoveCraftPlanIAtom extends BaseIAtom {

    private Object scheduleId;

    public Object getScheduleId() {
        return scheduleId;
    }

    public void setScheduleId(Object scheduleId) {
        this.scheduleId = scheduleId;
    }

    @Override
    public boolean run() throws SQLException {
        try {

            StringBuilder builder = new StringBuilder();

            Record updateR = null;
            boolean result = false;

            // 删除整个零件计划排程
            String partbarlistcode = this.getController().getPara("partbarlistcode");
            if (!StringUtils.isEmpty(partbarlistcode)) {
                builder.append("DELETE FROM MD_EST_SCHEDULE WHERE (PARTID,MODULERESUMEID) IN (SELECT PARTBARLISTCODE,MODULERESUMEID ");
                builder.append("FROM MD_PROCESS_INFO WHERE PARTBARLISTCODE = ? AND ISFIXED = ?) AND TYPEID IS NULL");

                int res = Db.update(builder.toString(), partbarlistcode, 0);
                if (res < 0) {
                    this.setMsg("删除计划排程失败");
                    return false;
                }

                this.setMsg("删除计划排程成功");
                return true;
            }

            // 删除单个排程
            String sid = this.getController().getPara("sid");

            if (StringUtils.isEmpty(sid)) {
                this.setMsg("零件信息不完整");
                return false;
            }

            builder = new StringBuilder();
            builder.append("SELECT MES.*,MC.CRAFTNAME,MC.CRAFTCODE FROM MD_EST_SCHEDULE MES LEFT JOIN MD_CRAFT MC ON MES.CRAFTID = MC.ID WHERE ");
            builder.append("(MODULERESUMEID,PARTID) IN (SELECT MODULERESUMEID,PARTID FROM MD_EST_SCHEDULE WHERE ID = ?) AND TYPEID IS NULL ORDER BY MES.RANKNUM");

            List<Record> qlist = Db.find(builder.toString(), sid);

            if (qlist.size() > 0) {
                int delIndex = getIndexById(qlist, "ID", sid);
                if (delIndex > -1) {
                    qlist.remove(delIndex);
                    // 删除排程
                    result = Db.deleteById("MD_EST_SCHEDULE", sid);
                    if (!result) {
                        this.setMsg("删除计划排程失败");
                        return false;
                    }
                }
            }

            List<ModuleScheduleGanttForm> rlist = new ArrayList<ModuleScheduleGanttForm>();

            Record record = null;

            for (int m = 0; m < qlist.size(); m++) {
                record = qlist.get(m);

                String rid = record.getStr("ID");

                updateR = new Record();
                updateR.set("ID", rid).set("RANKNUM", m);

                result = Db.update("MD_EST_SCHEDULE", updateR);
                if (!result) {
                    this.setMsg("删除计划排程失败");
                    return false;
                }

                ModuleScheduleGanttForm msgf = new ModuleScheduleGanttForm();

                String k_craftid = record.getStr("CRAFTID");
                // 工艺信息
                String craftname = record.getStr("CRAFTNAME");
                String craftcode = record.getStr("CRAFTCODE");

                String craftinfo = StringUtils.isEmpty(craftname) ? craftname : craftname + "(" + craftcode + ")";

                msgf.setId(rid);
                msgf.setDuration(ArithUtils.parseIntNumber(record.getNumber("DURATION"), 0));
                msgf.setDurationUnit("h");
                msgf.setLeaf(true);
                msgf.setName(craftinfo);
                msgf.setIndex(ArithUtils.parseIntNumber(record.getNumber("RANKNUM"), 0));
                msgf.setTypeid(record.getStr("TYPEID"));
                msgf.setEvaluate(ArithUtils.parseDouble(record.getNumber("EVALUATE"), 0));
                msgf.setCraftId(k_craftid);
                msgf.setStartDate(DateUtils.formatStamp(record.getTimestamp("STARTTIME"), null));
                msgf.setEndDate(DateUtils.formatStamp(record.getTimestamp("ENDTIME"), null));
                msgf.setRemark(StringUtils.escapeString(record.getStr("REMARK")));

                rlist.add(msgf);
            }

            this.setScheduleId(rlist);
            this.setMsg("删除成功");

            return true;
        }
        catch (Exception e) {
            this.setMsg("删除加工工艺失败!");
            return false;
        }
    }

    /**
     * 通过RECORD集合中的一个列查找对应的某个值的RECORD
     * 
     * @param list
     * @param col
     * @param val
     * @return
     */
    private int getIndexById(List<Record> list, String col, String val) {
        if (list == null || list.size() == 0) {
            return -1;
        }

        for (int m = 0; m < list.size(); m++) {
            Record record = list.get(m);
            String tid = StringUtils.parseString(record.getStr(col));
            if (tid.equals(val)) {
                return m;
            }
        }

        return -1;
    }
}
