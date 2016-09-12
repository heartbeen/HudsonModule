package com.kc.module.transaction;

import java.sql.SQLException;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.base.RegularState;
import com.kc.module.dao.BaseIAtom;
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.StringUtils;

public class DeleteDeviseResumeIAtom extends BaseIAtom {

    @Override
    public boolean run() throws SQLException {
        try {
            // 设计履历ID
            String resumeid = this.getController().getPara("resumeid");

            StringBuilder builder = new StringBuilder();

            builder.append("SELECT DRR.ID, DRR.STATEID, DRR.WORKSTATE,");
            builder.append("(SELECT COUNT(*) FROM DS_SCHEDULE_INFO WHERE SCRAPPED = 0 AND DESIGNRESUMEID = DRR.ID) AS SCHECOUNT,");
            builder.append("(SELECT COUNT(*) FROM DS_PROCESS_RESUME WHERE DESIGNRESUMEID = DRR.ID) DPRCOUNT FROM DS_RESUME_RECORD DRR ");
            builder.append("WHERE DRR.ID = ?");

            Record record = Db.findFirst(builder.toString(), resumeid);
            if (record != null) {
                // 模具履历
                String stateid = record.getStr("STATEID");
                // 设计状态
                String workstate = record.getStr("WORKSTATE");

                if (!StringUtils.isEmpty(stateid)) {
                    if (stateid.equals(RegularState.MODULE_RESUME_NEW.getIndex())) {
                        this.setMsg("新模不允许删除设计履历");
                        return false;
                    }
                }

                if (!StringUtils.isEmpty(workstate)
                    && StringUtils.strInArray(new String[]{RegularState.DESIGN_RESUME_FINISH.getIndex(), RegularState.DESIGN_RESUME_END.getIndex()},
                                              workstate)) {
                    this.setMsg("结案或者完成的设计履历不能删除");
                    return false;
                }

                //
                int dprcount = ArithUtils.toInt(record.getNumber("DPRCOUNT"), -1);
                if (dprcount > 0) {
                    this.setMsg("不允许删除已执行设计履历");
                    return false;
                }

                // 删除制程排程信息
                int result = Db.update("DELETE FROM DS_SCHEDULE_INFO WHERE DESIGNRESUMEID = ?", resumeid);
                if (result < 0) {
                    this.setMsg("删除设计履历信息失败");
                    return false;
                }

                // 删除设计履历表DS_RESUME
                boolean res = Db.deleteById("DS_RESUME", resumeid);
                if (!res) {
                    this.setMsg("删除设计履历信息失败");
                    return false;
                }

                // 删除设计履历表DS_RESUME_RECORD
                res = Db.deleteById("DS_RESUME_RECORD", resumeid);
                if (!res) {
                    this.setMsg("删除设计履历信息失败");
                    return false;
                }
            }

            return true;
        }
        catch (Exception e) {
            this.setMsg("删除设计履历信息失败");
            return false;
        }

    }
}
