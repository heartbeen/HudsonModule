package com.kc.module.transaction;

import java.sql.Timestamp;
import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.utils.ControlUtils;
import com.kc.module.utils.DBUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.JsonUtils;
import com.kc.module.utils.StringUtils;

/**
 * 
 * @author Administrator
 * 
 */
public class OutBoundCancel extends SqlTranscation {
    public static OutBoundCancel iAtom = new OutBoundCancel();

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
        // 时间列
        String timecol = this.ctrl.getPara(this.ajaxAttr[4]);
        // 员工工号
        String empid = ControlUtils.getAccountId(this.ctrl);
        // 获取当前的时间
        Timestamp time = DateUtils.parseTimeStamp(DateUtils.getDateNow());

        // 获取前台的所有不重复的工件
        String[] parts = JsonUtils.parseUniqueJsArray(list);
        String[] states = JsonUtils.parseUniqueJsArray(ostateid);
        StringBuilder builder = new StringBuilder("SELECT * FROM PART_OUTBOUND WHERE ID IN ");
        builder.append(DBUtils.sqlIn(parts));
        List<Record> record = Db.find(builder.toString());
        // 如果查询记录为空.返回TRUE
        if (record == null || record.size() == 0) {
            return (true);
        }

        Record rcd = null;

        for (Record r : record) {
            String id = r.getStr("ID");
            String stateid = r.getStr("STATEID");

            for (String s : parts) {
                if (s.equals(id) && StringUtils.strInArray(states, stateid)) {
                    rcd = new Record();
                    rcd.set("ID", id)
                       .set("STATEID", rstateid)
                       .set(timecol, time)
                       .set(rencol, empid);

                    boolean rs = Db.update("PART_OUTBOUND", rcd);
                    if (!rs) {
                        return rs;
                    }
                }
            }
        }

        return (true);
    }
}
