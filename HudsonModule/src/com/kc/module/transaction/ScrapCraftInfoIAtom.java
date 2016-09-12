package com.kc.module.transaction;

import java.sql.SQLException;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.dao.BaseIAtom;
import com.kc.module.utils.ArithUtils;

public class ScrapCraftInfoIAtom extends BaseIAtom {

    @Override
    public boolean run() throws SQLException {
        String id = this.getController().getPara("id");

        StringBuilder builder = new StringBuilder();

        builder.append("SELECT DCI.ID,(SELECT COUNT(*) FROM DS_SCHEDULE_INFO WHERE SCRAPPED = 0 AND ");
        builder.append("CRAFTID = DCI.ID) AS RCOUNT FROM DS_CRAFT_INFO DCI WHERE ID = ? AND SCRAPPED = ?");

        Record record = Db.findFirst(builder.toString(), id, 0);
        if (record == null) {
            this.setMsg("制程信息已经不存在了");
            return false;
        }

        int rcount = ArithUtils.toInt(record.getNumber("RCOUNT"), 0);
        if (rcount > 0) {
            this.setMsg("制程已经被使用不能删除");
            return false;
        }

        record = new Record();
        record.set("ID", id).set("SCRAPPED", 1);
        boolean success = Db.update("DS_CRAFT_INFO", record);
        if (!success) {
            this.setMsg("制程删除失败");
            return false;
        }

        return true;
    }

}
