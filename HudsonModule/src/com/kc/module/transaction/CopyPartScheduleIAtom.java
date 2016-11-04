package com.kc.module.transaction;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
public class CopyPartScheduleIAtom extends BaseIAtom {

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
        String resumeid = this.getController().getPara("resumeid");
        // 获取参考零件的唯一ID
        String reference = this.getController().getPara("reference");
        // 选择的零件编号
        String selpart = this.getController().getPara("selpart");
        // 获取工件模具履历号
        String copies = this.getController().getPara("copies");

        if (StringUtils.isEmpty(resumeid) || StringUtils.isEmpty(reference)) {
            this.setMsg("没有设置参考零件");
            return false;
        }

        List<String> parts = JsonUtils.parseJsArrayList(copies);
        if (parts == null || parts.size() == 0) {
            this.setMsg("没有要复制的零件资料");
            return false;
        }

        StringBuilder builder = new StringBuilder();
        builder.append("SELECT * FROM MD_EST_SCHEDULE WHERE MODULERESUMEID = ? AND PARTID = ? AND TYPEID IS NULL ORDER BY RANKNUM");

        // 查询参考零件的计划排程
        List<Record> schlist = Db.find(builder.toString(), resumeid, reference);
        if (schlist.size() == 0) {
            this.setMsg("参考零件排程不能为空");
            return false;
        }

        List<Record> crafts = Db.find("SELECT ID,(CASE WHEN CRAFTCODE IS NULL THEN CRAFTNAME ELSE CRAFTNAME || '(' || CRAFTCODE || ')' END) AS CRAFTNAME FROM MD_CRAFT");
        // 将工艺从RECORD转换为HASHMAP格式
        Map<String, String> craftMap = recordToMap(crafts);

        builder = new StringBuilder();

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

            for (Record sc : schlist) {

                String k_id = Barcode.MODULE_EST_SCHEDULE.nextVal();

                if (partbarlistcode.equals(selpart)) {

                    ModuleScheduleGanttForm msgf = new ModuleScheduleGanttForm();

                    String k_craftid = sc.getStr("CRAFTID");

                    msgf.setId(k_id);
                    msgf.setDuration(ArithUtils.parseIntNumber(sc.getNumber("DURATION"), 0));
                    msgf.setDurationUnit("h");
                    msgf.setLeaf(true);
                    msgf.setName(craftMap.get(k_craftid));
                    msgf.setIndex(ArithUtils.parseIntNumber(sc.getNumber("RANKNUM"), 0));
                    msgf.setTypeid(sc.getStr("TYPEID"));
                    msgf.setEvaluate(ArithUtils.parseDouble(sc.getNumber("EVALUATE"), 0));
                    msgf.setCraftId(k_craftid);
                    msgf.setStartDate(DateUtils.formatStamp(sc.getTimestamp("STARTTIME"), null));
                    msgf.setEndDate(DateUtils.formatStamp(sc.getTimestamp("ENDTIME"), null));
                    msgf.setRemark(StringUtils.escapeString(sc.getStr("REMARK")));

                    rlist.add(msgf);
                }

                sc.set("ID", k_id)
                  .set("PARTID", partbarlistcode)
                  .set("MODULERESUMEID", moduleresumeid)
                  .set("ISFINISH", "")
                  .set("PARENTID", partbarcode);

                result = Db.save("MD_EST_SCHEDULE", sc);
                if (!result) {
                    this.setMsg("复制零件排程失败");
                    return false;
                }
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

    /**
     * 将RECORD转换为MAP
     * 
     * @param list
     * @return
     */
    private Map<String, String> recordToMap(List<Record> list) {
        Map<String, String> map = new HashMap<String, String>();
        if (list == null || list.size() == 0) {
            return map;
        }

        for (Record record : list) {
            String id = record.getStr("ID");
            if (StringUtils.isEmpty(id)) {
                continue;
            }

            String craftname = record.getStr("CRAFTNAME");

            map.put(id, craftname);
        }

        return map;
    }
}
