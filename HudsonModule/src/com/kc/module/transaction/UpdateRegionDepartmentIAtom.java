package com.kc.module.transaction;

import java.sql.SQLException;
import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.dao.BaseIAtom;
import com.kc.module.utils.StringUtils;

public class UpdateRegionDepartmentIAtom extends BaseIAtom {

    @Override
    public boolean run() throws SQLException {

        String para = this.getController().getPara("stepid");
        if (StringUtils.isEmpty(para)) {
            this.setMsg("未选择任何有效部门!");
            return false;
        }

        StringBuilder builder = new StringBuilder();
        builder.append("SELECT * FROM REGION_DEPART WHERE ISAVA = 0 AND STEPID LIKE ?");

        List<Record> query = Db.find(builder.toString(), para + "%");

        Record record = null;
        boolean result = false;

        if (query.size() > 0) {
            for (Record rd : query) {

                record = new Record();
                record.set("ID", rd.get("ID")).set("ISAVA", 1);
                result = Db.update("REGION_DEPART", record);

                if (!result) {
                    this.setMsg("删除部门资料失败!");
                    return false;
                }
            }
        }

        return (true);
    }
}
