package com.kc.module.transaction;

import java.sql.SQLException;
import java.sql.Timestamp;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.dao.BaseIAtom;
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.StringUtils;

public class AlertModuleInfoIAtom extends BaseIAtom {

    @Override
    public boolean run() throws SQLException {

        StringBuilder builder = new StringBuilder();

        String modulebarcode = getParams("modulebarcode");
        final String format = "yyyy-MM-dd";

        builder.append("SELECT ML.*, MR.ID AS RID, MR.STARTTIME AS STARTDATE, MR.ENDTIME AS ENDDATE, MR.INSTALLER , MR.DEVISER ");
        builder.append(" FROM MODULELIST ML LEFT JOIN MD_RESUME MR ON ML.MODULEBARCODE = MR.MODULEBARCODE WHERE ML.MODULEBARCODE = ?");

        Record query = Db.findFirst(builder.toString(), modulebarcode);
        if (query == null) {
            this.setMsg("模具资料不存在");
            return false;
        }

        // 如果模具状态为1则表示模具已经报废
        int modulestate = ArithUtils.parseInt(query.getStr("MODULESTATE"), 0);
        if (modulestate == 1) {
            this.setMsg("模具已经报废不能编辑!");
            return false;
        }

        boolean result = false;

        // 更新模具资料
        Record record = new Record();
        record.set("modulebarcode", modulebarcode)
              .set("moduleclass", getParams("moduleclass"))
              .set("productname", getParams("productname"))
              .set("guestcode", getParams("guestcode"))
              .set("starttime", parseStamp(getParams("starttime"), format))
              .set("inittrytime", parseStamp(getParams("inittrytime"), format))
              .set("plastic", getParams("plastic"))
              .set("unitextrac", getParams("unitextrac"))
              .set("workpressure", ArithUtils.parseInt(getParams("workpressure"), 0));

        result = Db.update("MODULELIST", "MODULEBARCODE", record);
        if (!result) {
            this.setMsg("更新模具资料失败!");
            return false;
        }

        String rid = query.getStr("RID");

        if (!StringUtils.isEmpty(rid)) {
            // 更新模具履历
            record = new Record();
            record.set("ID", rid)
                  .set("STARTTIME", parseStamp(getParams("startdate"), format))
                  .set("ENDTIME", parseStamp(getParams("enddate"), format))
                  .set("DEVISER", getParams("deviser"))
                  .set("INSTALLER", getParams("installer"));

            result = Db.update("MD_RESUME", record);
            if (!result) {
                this.setMsg("更新模具资料失败!");
                return false;
            }

            result = Db.update("MD_RESUME_RECORD", record);
            if (!result) {
                this.setMsg("更新模具资料失败!");
                return false;
            }
        }

        return true;
    }

    private String getParams(String name) {
        return StringUtils.parseString(this.getController().getPara(name));
    }

    private Timestamp parseStamp(String date, String format) {
        final String formatLong = "yyyy-MM-dd HH:mm:ss";
        return DateUtils.parseTimeStamp(DateUtils.translate(date, format, formatLong));
    }

}
