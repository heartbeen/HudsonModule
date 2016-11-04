package com.kc.module.extract;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import com.kc.module.dao.ExtractDao;
import com.kc.module.model.ModuleEstSchedule;
import com.kc.module.model.form.ModuleScheduleGanttForm;
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.JsonUtils;

public class ModuleScheduleInquireExtract extends ExtractDao {

    @Override
    public Object extract() {
        SchGanttForm mgf = new SchGanttForm();
        try {
            List<ModuleEstSchedule> list = this.getController().getModel(ModuleEstSchedule.class, "mes").findCraftPlanGanttData();
            Iterator<ModuleEstSchedule> iterator = list.iterator();
            ModuleEstSchedule mes;

            List<ModuleScheduleGanttForm> rlist = new ArrayList<ModuleScheduleGanttForm>();

            while (iterator.hasNext()) {

                mes = iterator.next();

                ModuleScheduleGanttForm msgf = new ModuleScheduleGanttForm();

                msgf.setId(mes.getStr("id"));
                msgf.setDuration(ArithUtils.parseIntNumber(mes.getNumber("duration"), 0));
                msgf.setDurationUnit("h");
                msgf.setLeaf(true);
                msgf.setName(mes.getStr("craft"));
                msgf.setIndex(ArithUtils.parseIntNumber(mes.getNumber("RANKNUM"), 0));
                msgf.setTypeid(mes.getStr("TYPEID"));
                msgf.setEvaluate(ArithUtils.parseDouble(mes.getNumber("EVALUATE"), 0));
                msgf.setCraftId(mes.getStr("CRAFTID"));
                msgf.setStartDate(DateUtils.formatStamp(mes.getTimestamp("starttime"), null));
                msgf.setEndDate(DateUtils.formatStamp(mes.getTimestamp("endtime"), null));
                msgf.setRemark(mes.getStr("REMARK"));

                rlist.add(msgf);
            }

            mgf.setSuccess(true);
            mgf.setGantt(rlist);
            mgf.setMsg("查询排程失败");
        }
        catch (Exception e) {
            mgf.setSuccess(false);
            mgf.setMsg("查询排程失败");
        }

        return JsonUtils.bean2Json(mgf);
    }
}

class SchGanttForm {
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    private boolean success;
    private String msg;
    private List<ModuleScheduleGanttForm> gantt;

    public List<ModuleScheduleGanttForm> getGantt() {
        return gantt;
    }

    public void setGantt(List<ModuleScheduleGanttForm> gantt) {
        this.gantt = gantt;
    }
}
