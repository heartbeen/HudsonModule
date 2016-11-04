package com.kc.module.transaction;

import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.dao.BaseIAtom;
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.StringUtils;

public class SetCraftPlanIAtom extends BaseIAtom {

    @Override
    public boolean run() throws SQLException {
        try {
            // 计划排程唯一号
            String sid = this.getController().getPara("sid");
            // 开始时间
            String start = this.getController().getPara("start");
            // 时间间隔
            int duration = this.getController().getParaToInt("duration");
            // 预估时间
            double evaluate = ArithUtils.parseDouble(this.getController().getPara("evaluate"), 0);

            if (StringUtils.isEmpty(sid)) {
                this.setMsg("排程信息不完整");
                return false;
            }

            if (StringUtils.isEmpty(start)) {
                this.setMsg("开始时间不能设置为空");
                return false;
            }

            if (duration < evaluate) {
                this.setMsg("预计用时不能大于间隔时间");
                return false;
            }

            StringBuilder builder = new StringBuilder();

            builder.append("SELECT * FROM MD_EST_SCHEDULE WHERE (MODULERESUMEID,PARTID) IN (SELECT MODULERESUMEID,");
            builder.append("PARTID FROM MD_EST_SCHEDULE WHERE ID = ?) AND TYPEID IS NULL ORDER BY RANKNUM");

            List<Record> schelist = Db.find(builder.toString(), sid);
            if (schelist.size() == 0) {
                this.setMsg("零件排程已经不存在了");
                return false;
            }

            // 获取零件排程中指定排程所在的顺序位置
            int currIndex = getIndexById(schelist, "ID", sid);
            if (currIndex == -1) {
                this.setMsg("该排程信息已经不存在了");
                return false;
            }

            // 开始时间和结束时间
            Timestamp startStamp = DateUtils.parseTimeStamp(start);
            System.out.println(duration);
            Timestamp endStamp = new Timestamp(startStamp.getTime() + duration * 1000 * 3600);

            // 判断钱一个排程的结束时间和当前排程的开始时间的大小关系
            int previous = currIndex - 1;
            if (previous > -1) {
                Timestamp preEnd = schelist.get(previous).getTimestamp("ENDTIME");
                System.out.println(startStamp.getTime() + " - " + preEnd.getTime());
                if (preEnd != null && startStamp.getTime() < preEnd.getTime()) {
                    this.setMsg("开始时间不能小于上一个排程的结束时间");
                    return false;
                }
            }

            // 判断后一个排程的开始时间和当前排程的结束时间的大小关系
            int next = currIndex + 1;
            if (next < schelist.size()) {
                Timestamp nextStart = schelist.get(next).getTimestamp("STARTTIME");
                System.out.println(DateUtils.getTimeStampString(startStamp, null));
                System.out.println(DateUtils.getTimeStampString(endStamp, null));
                System.out.println(DateUtils.getTimeStampString(nextStart, null));
                System.out.println(endStamp.getTime() + " - " + nextStart.getTime());
                if (nextStart != null && endStamp.getTime() > nextStart.getTime()) {
                    this.setMsg("结束时间不能大于下一个排程的开始时间");
                    return false;
                }
            }

            Record record = schelist.get(currIndex);
            System.out.println(record.getStr("ID"));
            record.set("STARTTIME", startStamp).set("ENDTIME", endStamp).set("DURATION", duration).set("EVALUATE", evaluate);

            boolean success = Db.update("MD_EST_SCHEDULE", record);
            if (!success) {
                this.setMsg("修改计划排程失败");
                return false;
            }

            this.setMsg("更新排程计划成功");
            return true;
        }
        catch (Exception e) {
            e.printStackTrace();
            this.setMsg("修改计划排程失败");
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
