package com.kc.module.transaction;

import java.sql.SQLException;
import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.base.Barcode;
import com.kc.module.dao.BaseIAtom;
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.StringUtils;

public class AddDesignScheduleIAtom extends BaseIAtom {

    @Override
    public boolean run() throws SQLException {
        // 设计履历唯一号
        String resumeid = this.getController().getPara("resumeid");
        // 工艺唯一号
        String craftid = this.getController().getPara("craftid");
        // 状态唯一号
        String stateid = this.getController().getPara("stateid");

        // 设计履历不能为空
        if (StringUtils.isEmpty(resumeid)) {
            this.setMsg("设计履历不能为空");
            return false;
        }

        // 制程信息不能为空
        if (StringUtils.isEmpty(craftid)) {
            this.setMsg("没有有效的制程信息");
            return false;
        }

        // 制程信息不能为空
        if (StringUtils.isEmpty(stateid)) {
            this.setMsg("设计状态不能为空");
            return false;
        }

        // 查询设计模具的排程信息
        List<Record> querys = Db.find("SELECT * FROM DS_SCHEDULE_INFO WHERE DESIGNRESUMEID = ? AND SCRAPPED = ? ORDER BY RANKNUM", resumeid, 0);

        boolean isExsist = false;
        // 初始化制程需要
        int rankNum = 0;

        // 如果计划制程大于0
        if (querys.size() > 0) {
            for (Record record : querys) {
                String m_craftid = record.getStr("CRAFTID");
                // 获取最大的制程顺序
                int m_ranknum = ArithUtils.toInt(record.getNumber("RANKNUM"), 0);
                if (rankNum < m_ranknum) {
                    rankNum = m_ranknum;
                }
                if (craftid.equals(m_craftid)) {
                    isExsist = true;
                }
            }

            rankNum++;
        }

        // 如果已经存在，返回
        if (isExsist) {
            this.setMsg("制程工艺已经存在了");
            return (false);
        }

        Record scheRecord = new Record();
        scheRecord.set("ID", Barcode.DS_SCHEDULE_INFO.nextVal(true))
                  .set("DESIGNRESUMEID", resumeid)
                  .set("CRAFTID", craftid)
                  .set("KIND", 0)
                  .set("RANKNUM", rankNum)
                  .set("ACTIONTIME", DateUtils.getNowStampTime())
                  .set("SCRAPPED", 0)
                  .set("STATEID", stateid);

        boolean result = Db.save("DS_SCHEDULE_INFO", scheRecord);
        if (!result) {
            this.setMsg("保存制程信息失败");
        }

        return true;
    }
}
