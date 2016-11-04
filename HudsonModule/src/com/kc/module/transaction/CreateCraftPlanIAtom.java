package com.kc.module.transaction;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.IAtom;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.base.Barcode;
import com.kc.module.model.Craft;
import com.kc.module.model.form.ModuleScheduleGanttForm;
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.StringUtils;

/**
 * 新增工艺排程
 * 
 * @author Rock
 * 
 */
public class CreateCraftPlanIAtom implements IAtom {
    private Controller controller;
    private Object schId;
    private String msg;

    public String getMsg() {
        return msg;
    }

    public void setMsg(String error) {
        this.msg = error;
    }

    public Controller getController() {
        return controller;
    }

    public void setController(Controller controller) {
        this.controller = controller;
    }

    public Object getSchId() {
        return schId;
    }

    public void setSchId(Object schId) {
        this.schId = schId;
    }

    @Override
    public boolean run() throws SQLException {
        try {
            // 零件唯一号
            String partbarlistcode = this.getController().getPara("partbarlistcode");
            // 新增工艺唯一号
            String craftid = this.getController().getPara("craftid");
            // 排程唯一号
            String sid = this.getController().getPara("sid");

            if (StringUtils.isEmpty(partbarlistcode)) {
                this.setMsg("零件信息无效");
                return false;
            }

            if (StringUtils.isEmpty(craftid)) {
                this.setMsg("工艺信息已经失效");
                return false;
            }

            // 获取工艺信息
            List<Craft> clist = Craft.dao.listAll();
            Map<String, String> cmap = new HashMap<String, String>();
            for (Craft c : clist) {
                String cid = c.getStr("ID");
                if (StringUtils.isEmpty(cid)) {
                    continue;
                }

                String craftname = c.getStr("CRAFTNAME");
                String craftcode = c.getStr("CRAFTCODE");

                String txt = craftname + (StringUtils.isEmpty(craftcode) ? "" : craftcode);

                if (!cmap.containsKey(cid)) {
                    cmap.put(cid, txt);
                }
            }

            StringBuilder builder = new StringBuilder();

            builder.append("SELECT MPI.PARTBARLISTCODE AS MRID, MP.PARTBARCODE AS MRPD, MPI.MODULERESUMEID AS MRMD, MES.* FROM ");
            builder.append("MD_PROCESS_INFO MPI LEFT JOIN MD_PART_LIST MPL ON MPI.PARTBARLISTCODE = MPL.PARTBARLISTCODE LEFT JOIN MD_PART MP ");
            builder.append("ON MPL.PARTBARCODE = MP.PARTBARCODE LEFT JOIN MD_EST_SCHEDULE MES ON MPI.PARTBARLISTCODE = MES.PARTID AND MES.MODULERESUMEID = ");
            builder.append("MPI.MODULERESUMEID WHERE MPL.ISFIXED = ? AND MPI.PARTBARLISTCODE = ? AND MES.TYPEID IS NULL ORDER BY MES.RANKNUM");

            List<Record> qlist = Db.find(builder.toString(), 0, partbarlistcode);
            if (qlist.size() == 0) {
                this.setMsg("零件信息无效");
                return false;
            }

            SchInfo si = null;
            boolean start = false;

            for (Record rd : qlist) {
                String mrid = rd.getStr("MRID");
                String mrpd = rd.getStr("MRPD");
                String mrmd = rd.getStr("MRMD");

                String id = rd.getStr("ID");

                if (StringUtils.isEmpty(mrpd)) {
                    this.setMsg("零件信息不完整");
                    return false;
                }

                if (!start) {
                    si = new SchInfo();

                    si.setPartbarlistcode(mrid);
                    si.setPartbarcode(mrpd);
                    si.setModuleresumeid(mrmd);

                    List<Record> sl = new ArrayList<Record>();

                    if (!StringUtils.isEmpty(id)) {
                        sl.add(rd);
                    }

                    si.setList(sl);

                    start = true;
                } else {
                    if (!StringUtils.isEmpty(id)) {
                        si.getList().add(rd);
                    }
                }
            }

            Record record = null;
            List<Record> ssl = si.getList();

            if (StringUtils.isEmpty(sid)) {
                if (ssl.size() > 0) {
                    Record ahead = ssl.get(ssl.size() - 1);
                    String acraftid = ahead.getStr("CRAFTID");
                    if (craftid.equals(acraftid)) {
                        this.setMsg("前后工序不能一样");
                        return false;
                    }
                }

                record = new Record();

                record.set("MRID", "")
                      .set("MRPD", "")
                      .set("MRMD", "")
                      .set("PARTID", si.getPartbarlistcode())
                      .set("CRAFTID", craftid)
                      .set("MODULERESUMEID", si.getModuleresumeid())
                      .set("PARENTID", si.getPartbarcode());

                ssl.add(record);
            } else {

                int currIndex = -1;
                if (ssl.size() > 0) {
                    currIndex = getIndexById(ssl, "ID", sid);
                    if (currIndex == -1) {
                        this.setMsg("请重新加载数据");
                        return false;
                    }

                    if (currIndex > 0) {
                        Record ahead = ssl.get(currIndex - 1);
                        String acraftid = ahead.getStr("CRAFTID");
                        if (craftid.equals(acraftid)) {
                            this.setMsg("前后工序不能一样");
                            return false;
                        }
                    }

                    Record back = ssl.get(currIndex);
                    String bcraftid = back.getStr("CRAFTID");
                    if (craftid.equals(bcraftid)) {
                        this.setMsg("前后工序不能一样");
                        return false;
                    }
                }

                record = new Record();

                record.set("MRID", "")
                      .set("MRPD", "")
                      .set("MRMD", "")
                      .set("PARTID", si.getPartbarlistcode())
                      .set("CRAFTID", craftid)
                      .set("MODULERESUMEID", si.getModuleresumeid())
                      .set("PARENTID", si.getPartbarcode());

                ssl.add(currIndex == -1 ? 0 : currIndex, record);
            }

            Barcode.MODULE_EST_SCHEDULE.nextVal(true);
            boolean success = false;

            List<ModuleScheduleGanttForm> rlist = new ArrayList<ModuleScheduleGanttForm>();

            for (int m = 0; m < ssl.size(); m++) {
                record = ssl.get(m);

                String id = record.getStr("ID");

                if (StringUtils.isEmpty(id)) {
                    record.set("ID", Barcode.MODULE_EST_SCHEDULE.nextVal()).set("RANKNUM", m);
                    record.remove(new String[]{"MRID", "MRPD", "MRMD"});

                    success = Db.save("MD_EST_SCHEDULE", record);
                    if (!success) {
                        this.setMsg("操作失败");
                        return false;
                    }
                } else {
                    record.remove(new String[]{"MRID", "MRPD", "MRMD"});
                    // 重新设置排程顺序
                    record.set("RANKNUM", m);

                    success = Db.update("MD_EST_SCHEDULE", record);
                    if (!success) {
                        this.setMsg("操作失败");
                        return false;
                    }
                }

                ModuleScheduleGanttForm msgf = new ModuleScheduleGanttForm();

                String k_craftid = record.getStr("CRAFTID");

                msgf.setId(record.getStr("ID"));
                msgf.setDuration(ArithUtils.parseIntNumber(record.getNumber("DURATION"), 0));
                msgf.setDurationUnit("h");
                msgf.setLeaf(true);
                msgf.setName(cmap.get(k_craftid));
                msgf.setIndex(ArithUtils.parseIntNumber(record.getNumber("RANKNUM"), 0));
                msgf.setTypeid(record.getStr("TYPEID"));
                msgf.setEvaluate(ArithUtils.parseDouble(record.getNumber("EVALUATE"), 0));
                msgf.setCraftId(k_craftid);
                msgf.setStartDate(DateUtils.formatStamp(record.getTimestamp("STARTTIME"), null));
                msgf.setEndDate(DateUtils.formatStamp(record.getTimestamp("ENDTIME"), null));
                msgf.setRemark(StringUtils.escapeString(record.getStr("REMARK")));

                rlist.add(msgf);
            }

            this.setSchId(rlist);

            this.setMsg("操作成功");
            return true;
        }
        catch (Exception e) {
            e.printStackTrace();
            this.setMsg("操作异常");
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

/**
 * 排程信息
 * 
 * @author ASUS
 * 
 */
class SchInfo {
    public String getPartbarlistcode() {
        return partbarlistcode;
    }

    public void setPartbarlistcode(String partbarlistcode) {
        this.partbarlistcode = partbarlistcode;
    }

    public String getPartbarcode() {
        return partbarcode;
    }

    public void setPartbarcode(String partbarcode) {
        this.partbarcode = partbarcode;
    }

    public String getModuleresumeid() {
        return moduleresumeid;
    }

    public void setModuleresumeid(String moduleresumeid) {
        this.moduleresumeid = moduleresumeid;
    }

    public List<Record> getList() {
        return list;
    }

    public void setList(List<Record> list) {
        this.list = list;
    }

    private String partbarlistcode;
    private String partbarcode;
    private String moduleresumeid;
    private List<Record> list;
}
