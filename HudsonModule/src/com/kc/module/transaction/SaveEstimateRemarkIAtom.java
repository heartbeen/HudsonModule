package com.kc.module.transaction;

import java.sql.SQLException;
import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.dao.BaseIAtom;
import com.kc.module.utils.StringUtils;

public class SaveEstimateRemarkIAtom extends BaseIAtom {

    @Override
    public boolean run() throws SQLException {
        String id = this.getController().getPara("id");
        String remark = StringUtils.trimBlank(StringUtils.parseString(this.getController().getPara("remark")), null);
        if (StringUtils.isEmpty(id)) {
            return false;
        }

        boolean result = false;
        List<Record> sqlList = Db.find("SELECT ID, REMARK FROM MD_EST_SCHEDULE WHERE PARENTID = ?", id);
        if (sqlList.size() > 0) {
            for (Record rcd : sqlList) {
                String m_remark = rcd.getStr("remark");
                if (StringUtils.isEmpty(m_remark)) {
                    rcd.set("remark", remark);
                    result = Db.update("MD_EST_SCHEDULE", rcd);
                    if (!result) {
                        return false;
                    }
                }
            }
        }

        Record record = new Record();
        record.set("ID", id).set("REMARK", remark);
        result = Db.update("MD_EST_SCHEDULE", record);
        if (!result) {
            return false;
        }

        return true;
    }

}
