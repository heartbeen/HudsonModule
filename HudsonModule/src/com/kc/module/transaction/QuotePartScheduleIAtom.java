package com.kc.module.transaction;

import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.base.Barcode;
import com.kc.module.dao.BaseIAtom;
import com.kc.module.model.form.ModuleScheduleGanttForm;
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.DBUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.JsonUtils;
import com.kc.module.utils.StringUtils;

/**
 * 复制零件工艺排程
 * 
 * @author ASUS
 * 
 */
public class QuotePartScheduleIAtom extends BaseIAtom {

    private List<ModuleScheduleGanttForm> schedule;

    public List<ModuleScheduleGanttForm> getSchedule() {
        return schedule;
    }

    public void setSchedule(List<ModuleScheduleGanttForm> schedule) {
        this.schedule = schedule;
    }

    @Override
    public boolean run() throws SQLException {
        // 获取模具履历号
        String setlist = this.getController().getPara("setlist");
        // 选择的零件编号
        String selpart = this.getController().getPara("selpart");
        // 获取工件模具履历号
        String quotes = this.getController().getPara("quotes");
        // 获取开始日期时间
        String seldate = this.getController().getPara("seldate");

        SetCraftInfo[] setarr = JsonUtils.josnToBean(setlist, SetCraftInfo[].class);

        if (setarr == null || setarr.length == 0) {
            this.setMsg("没有设置参考的工艺集合");
            return false;
        }

        List<String> parts = JsonUtils.parseJsArrayList(quotes);
        if (parts == null || parts.size() == 0) {
            this.setMsg("没有要引用排程的零件资料");
            return false;
        }

        Timestamp startdate = DateUtils.parseTimeStamp(seldate);
        if (startdate == null) {
            this.setMsg("开始时间设置不正确");
            return false;
        }

        StringBuilder builder = new StringBuilder();

        builder.append("SELECT MPI.PARTBARLISTCODE,MPI.MODULERESUMEID,MP.PARTBARCODE,(SELECT COUNT(*) FROM MD_EST_SCHEDULE WHERE MODULERESUMEID = MPI.MODULERESUMEID AND PARTID = ");
        builder.append("MPI.PARTBARLISTCODE AND TYPEID IS NULL) AS SCOUNT FROM MD_PROCESS_INFO MPI LEFT JOIN MD_PART_LIST MPL ON MPI.PARTBARLISTCODE =");
        builder.append("MPL.PARTBARLISTCODE LEFT JOIN MD_PART MP ON MPL.PARTBARCODE = MP.PARTBARCODE WHERE MPI.ISFIXED = 0 AND MPI.PARTBARLISTCODE IN ");
        builder.append(DBUtils.sqlIn(parts));

        List<Record> partsche = Db.find(builder.toString());
        if (partsche.size() == 0) {
            this.setMsg("没有有效待复制排程的零件");
            return false;
        }

        // 用于统计所有的排程是否都已经安排0表示全部安排
        int counter = 0;
        // 执行更新数据库
        boolean result = false;
        // 用于寄存查询零件的排程信息
        List<ModuleScheduleGanttForm> rlist = new ArrayList<ModuleScheduleGanttForm>();

        // 刷新工艺排程唯一ID号
        Barcode.MODULE_EST_SCHEDULE.nextVal(true);

        Record updateR = null;
        for (Record rcd : partsche) {

            String partbarlistcode = rcd.getStr("PARTBARLISTCODE");
            String partbarcode = rcd.getStr("PARTBARCODE");
            String moduleresumeid = rcd.getStr("MODULERESUMEID");

            if (StringUtils.isEmpty(moduleresumeid)) {
                continue;
            }

            // 如果已经安排排程了，跳过
            int k_count = ArithUtils.parseIntNumber(rcd.getNumber("SCOUNT"), 0);
            if (k_count > 0) {
                continue;
            }

            int calculator = 0;
            Timestamp eststart = startdate, estend = null;

            for (SetCraftInfo sci : setarr) {

                String k_id = Barcode.MODULE_EST_SCHEDULE.nextVal();

                int duration = sci.getDuration();
                long interval = sci.getInterval();

                long endtime = eststart.getTime() + duration * 3600 * 1000 + interval;

                estend = new Timestamp(endtime);

                if (partbarlistcode.equals(selpart)) {

                    ModuleScheduleGanttForm msgf = new ModuleScheduleGanttForm();

                    String k_craftid = sci.getCraftid();

                    msgf.setId(k_id);
                    msgf.setDuration(duration);
                    msgf.setDurationUnit("h");
                    msgf.setLeaf(true);
                    msgf.setName(sci.getCraftname());
                    msgf.setIndex(calculator);
                    msgf.setTypeid("");
                    msgf.setEvaluate(0);
                    msgf.setCraftId(k_craftid);
                    msgf.setStartDate(DateUtils.formatStamp(eststart, null));
                    msgf.setEndDate(DateUtils.formatStamp(estend, null));
                    msgf.setRemark(StringUtils.escapeString(sci.getIntro()));

                    rlist.add(msgf);
                }

                updateR = new Record();

                updateR.set("ID", k_id)
                       .set("PARTID", partbarlistcode)
                       .set("STARTTIME", eststart)
                       .set("ENDTIME", estend)
                       .set("RANKNUM", calculator)
                       .set("CRAFTID", sci.getCraftid())
                       .set("DURATION", duration)
                       .set("MODULERESUMEID", moduleresumeid)
                       .set("ISFINISH", "")
                       .set("PARENTID", partbarcode)
                       .set("REMARK", sci.getIntro());

                result = Db.save("MD_EST_SCHEDULE", updateR);
                if (!result) {
                    this.setMsg("复制零件排程失败");
                    return false;
                }

                eststart = estend;
                calculator++;
            }

            counter++;
        }

        if (counter == 0) {
            this.setMsg("所有的零件都已经安排了排程");
            return false;
        }

        // 设置工艺排程的JSON格式
        this.setSchedule(rlist);

        this.setMsg("成功复制排程");
        return true;
    }
}

/**
 * XXXX - YYYY
 * 
 * @author ASUS
 * 
 */
class SetCraftInfo {
    public String getCraftid() {
        return craftid;
    }

    public void setCraftid(String craftid) {
        this.craftid = craftid;
    }

    public String getCraftname() {
        return craftname;
    }

    public void setCraftname(String craftname) {
        this.craftname = craftname;
    }

    public int getDuration() {
        return duration;
    }

    public void setDuration(int duration) {
        this.duration = duration;
    }

    public long getInterval() {
        return interval;
    }

    public void setInterval(long interval) {
        this.interval = interval;
    }

    public String getIntro() {
        return intro;
    }

    public void setIntro(String intro) {
        this.intro = intro;
    }

    private String craftid;
    private String craftname;
    private int duration;
    private long interval;
    private String intro;
}
