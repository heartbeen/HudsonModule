package com.kc.module.transaction;

import java.sql.Timestamp;
import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.base.Barcode;
import com.kc.module.utils.ControlUtils;
import com.kc.module.utils.DBUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.JsonUtils;
import com.kc.module.utils.StringUtils;

public class OutBoundBackDone extends SqlTranscation {
    public static OutBoundBackDone iAtom = new OutBoundBackDone();

    @Override
    public boolean run() {
        // 获取工件资料行讯息
        String list = this.ctrl.getPara(this.ajaxAttr[0]);
        // 获取改变前的状态
        String ostateid = this.ctrl.getPara(this.ajaxAttr[1]);
        // 获取改变后的状态
        String rstateid = this.ctrl.getPara(this.ajaxAttr[2]);
        // 获取人员列名
        String rencol = this.ctrl.getPara(this.ajaxAttr[3]);

        String empid = ControlUtils.getAccountId(this.ctrl);
        // 获取时间列名
        String timecol = this.ctrl.getPara(this.ajaxAttr[4]);

        String markcol = this.ctrl.getPara(this.ajaxAttr[5]);

        String remark = this.ctrl.getPara(this.ajaxAttr[6]);

        Timestamp time = DateUtils.parseTimeStamp(DateUtils.getDateNow());

        boolean isRuin = false;
        String prostateid = null;
        String empactid = null;

//        if (rstateid.equals(RegularState.out.getIndex())) {
//            isRuin = true;
//            prostateid = RegularState.PART_STATE_RUIN.getIndex();
//            empactid = RegularState.EMP_ACTION_RUIN.getIndex();
//        } else {
//            prostateid = RegularState.PART_STATE_CHECK.getIndex();
//            empactid = RegularState.EMP_ACTION_CHECK.getIndex();
//        }

        // 获取前台的所有不重复的工件
        String[] parts = JsonUtils.parseUniqueJsArray(list);
        StringBuilder builder = new StringBuilder("SELECT a.*,b.ID AS RID,b.CURSORID AS MID ");
        builder.append(",b.MODULERESUMEID AS RSMID FROM PART_OUTBOUND a LEFT JOIN MD_PROCESS_INFO b ");
        builder.append("ON a.PARTLISTBARCODE = b.PARTBARLISTCODE WHERE a.ID IN ");
        builder.append(DBUtils.sqlIn(parts));
        List<Record> record = Db.find(builder.toString());
        // 如果查询记录为空.返回TRUE
        if (record == null || record.size() == 0) {
            return (true);
        }

        // 遍历查询的记录
        Record sRecord = null;

        for (Record r : record) {
            // PART_OUTBOUND表的ID号
            String id = r.getStr("ID");
            // 状态ID号
            String stateid = r.getStr("STATEID");
            // 工件号
            String partcode = r.getStr("PARTLISTBARCODE");
            // 履历ID号
            String resumeid = r.getStr("MODULERESUMEID");
            // MD_PROCESS_INFO的ID号
            String rid = r.getStr("RID");
            // MD_PROCESS_RESUME表的ID号
            String mid = r.getStr("MID");

            String t_barcode = null;
            boolean rst = false;
            for (String item : parts) {
                if (item.equals(id) && stateid.equals(ostateid)) {
                    // 更新PART_OUTBOUND表的状态
                    sRecord = new Record();
                    sRecord.set("ID", id)
                           .set("STATEID", rstateid)
                           .set(timecol, time)
                           .set(markcol, remark)
                           .set(rencol, empid);
                    boolean rs = Db.update("PART_OUTBOUND", sRecord);
                    if (!rs) {
                        return (rs);
                    }

                    // 如果MD_PROCESS_RESUME的工件MID不为空,更新表
                    if (StringUtils.isEmpty(mid)) {
                        sRecord = new Record();
                        sRecord.set("ID", mid)
                               .set("NPARTSTATEID", prostateid)
                               .set("NEMPID", empid)
                               .set("NEMPACTID", empactid)
                               .set("NDEPTID", ControlUtils.getDeptPosid(this.ctrl))
                               .set("NRCDTIME", time);
                        rs = Db.update("MD_PROCESS_RESUME", sRecord);
                        if (!rs) {
                            return rs;
                        }

                    }

                    if (!rst) {
                        t_barcode = Barcode.MODULE_PROCESS_RESUME.nextVal(true);
                        rst = true;
                    } else {
                        t_barcode = Barcode.MODULE_PROCESS_RESUME.nextVal();
                    }

                    // 如果不为报废,则执行签收动作.否则,执行报废动作
                    if (!isRuin) {
                        sRecord = new Record();
                        sRecord.set("ID", rid)
                               .set("PARTSTATEID", prostateid)
                               .set("ACTIONTIME", time)
                               .set("CURRENTDEPTID", ControlUtils.getDeptPosid(this.ctrl))
                               .set("CURSORID", t_barcode);
                        rs = Db.update("MD_PROCESS_INFO", sRecord);
                        if (!rs) {
                            return rs;
                        }

                        sRecord = new Record();
                        sRecord.set("ID", t_barcode)
                               .set("PARTBARLISTCODE", partcode)
                               .set("LPARTSTATEID", prostateid)
                               .set("LEMPID", empid)
                               .set("LEMPACTID", empactid)
                               .set("LDEPTID", ControlUtils.getDeptPosid(this.ctrl))
                               .set("LRCDTIME", time)
                               .set("PARTCOUNT", "1")
                               .set("MID", rid)
                               .set("RSMID", resumeid)
                               .set("ISTIME", "1");

                        rs = Db.save("MD_PROCESS_RESUME", sRecord);
                        if (!rs) {
                            return rs;
                        }

                    } else {
                        rs = Db.deleteById("MD_PROCESS_INFO", rid);
                        if (!rs) {
                            return rs;
                        }

                        sRecord = new Record();
                        sRecord.set("PARTBARLISTCODE", partcode).set("ISENABLE", "1");

                        rs = Db.update("MD_PART_LIST", sRecord);
                        if (!rs) {
                            return rs;
                        }
                    }

                    break;
                }
            }
        }

        return true;
    }
}
