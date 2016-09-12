package com.kc.module.transaction;

import java.sql.SQLException;
import java.util.List;

import com.kc.module.base.Barcode;
import com.kc.module.dao.BaseIAtom;
import com.kc.module.model.DesignCraftList;
import com.kc.module.model.DesignScheduleInfo;
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.StringUtils;

public class ExportDeviseCraftSetIAtom extends BaseIAtom {

    @Override
    public boolean run() throws SQLException {
        try {
            // 制程集合ID
            String setid = this.getController().getPara("setid");
            // 设计履历ID
            String resumeid = this.getController().getPara("resumeid");

            List<DesignScheduleInfo> ldsi = DesignScheduleInfo.dao.getResumeScheduleInfo(resumeid);
            if (ldsi.size() > 0) {
                this.setMsg("模具已经安排了设计排程");
                return false;
            }

            List<DesignCraftList> ldcl = DesignCraftList.dao.getCraftListBySetid(setid);
            if (ldcl.size() == 0) {
                this.setMsg("该集合没有任何制程信息");
                return false;
            }

            // 重载设计履历制程清单表
            Barcode.DS_SCHEDULE_INFO.nextVal(true);

            DesignScheduleInfo dsi = null;
            boolean result = false;

            for (DesignCraftList item : ldcl) {
                // 制程ID
                String craftid = StringUtils.parseString(item.getStr("CRAFTID"));
                // 制程默认状态
                String stateid = StringUtils.parseString(item.getStr("STATUS"));
                // 制程序号
                int ranknum = ArithUtils.toInt(item.getNumber("RANKNUM"), -1);

                if (ranknum < 0) {
                    continue;
                }

                dsi = new DesignScheduleInfo();

                dsi.set("ID", Barcode.DS_SCHEDULE_INFO.nextVal())
                   .set("DESIGNRESUMEID", resumeid)
                   .set("CRAFTID", craftid)
                   .set("KIND", 0)
                   .set("RANKNUM", ranknum)
                   .set("ACTIONTIME", DateUtils.getNowStampTime())
                   .set("SCRAPPED", 0)
                   .set("STATEID", stateid);

                result = dsi.save();
                if (!result) {
                    this.setMsg("该集合没有任何制程信息");
                    return false;
                }
            }

            return (true);
        }
        catch (Exception e) {
            this.setMsg("导入制程集合信息失败");
            return false;
        }
    }

}
