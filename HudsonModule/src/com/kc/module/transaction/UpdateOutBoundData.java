package com.kc.module.transaction;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.utils.ControlUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.JsonUtils;
import com.kc.module.utils.StringUtils;

public class UpdateOutBoundData extends SqlTranscation {
    public static UpdateOutBoundData iAtom = new UpdateOutBoundData();

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

        // 获取备注讯息
        String remark = this.ctrl.getPara(this.ajaxAttr[5]);

        Map<?, ?>[] comment = JsonUtils.fromJsonStrToList(remark);
        boolean isRemark = false;
        String commentCol = "", commentVal = "";
        if (comment != null) {
            isRemark = true;
            commentCol = StringUtils.parseString(comment[0].get("col"));
            commentVal = comment[0].get("content").toString();
        }

        // 将前台传过来的外发工件讯息数组转化为Java数组
        String[] updateRows = JsonUtils.parseUniqueJsArray(list);
        // 如果前台数据为空,直接返回1
        if (updateRows == null) {
            return (true);
        }

        StringBuilder builder = new StringBuilder("SELECT * FROM PART_OUTBOUND WHERE ID IN ('");
        for (String s : updateRows) {
            builder.append(s).append("','");
        }

        String sql = builder.substring(0, builder.length() - 2) + ")";

        List<Record> outRecord = Db.find(sql);
        List<Record> sqlList = new ArrayList<Record>();
        if (outRecord == null || outRecord.size() == 0) {
            return (true);
            // for (String r : updateRows) {
            // Record rcd = new Record().set("ID", r)
            // .set("STATEID", rstateid)
            // .set(rencol, empid)
            // .set(timecol,
            // DateUtil.parseTimeStamp(DateUtil.getDateNow()));
            // if (isRemark) {
            // rcd.set(commentCol, commentVal);
            // }
            //
            // sqlList.add(rcd);
            // }
        } else {
            HashMap<String, String> dbr = new HashMap<String, String>();
            for (Record row : outRecord) {
                String rid = StringUtils.parseString(row.get("ID"));
                String partstateid = StringUtils.parseString(row.get("STATEID"));
                // 如果工件的状态不为原始状态,则跳过该讯息
                if (!partstateid.equals(ostateid)) {
                    continue;
                }

                if (!dbr.containsKey(rid)) {
                    dbr.put(rid, partstateid);
                }
            }

            for (String s : updateRows) {
                if (dbr.containsKey(s) && dbr.get(s).equals(ostateid)) {
                    Record rcd = new Record().set("ID", s)
                                             .set("STATEID", rstateid)
                                             .set(rencol, empid)
                                             .set(timecol,
                                                  DateUtils.parseTimeStamp(DateUtils.getDateNow()));
                    if (isRemark) {
                        rcd.set(commentCol, commentVal);
                    }

                    sqlList.add(rcd);
                }
            }
        }

        if (sqlList.size() > 0) {
            for (Record rcd : sqlList) {
                boolean rs = Db.update("PART_OUTBOUND", rcd);
                if (!rs) {
                    return (false);
                }
            }
        }

        return (true);
    }
}
