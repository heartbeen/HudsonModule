package com.kc.module.extract;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.dao.ExtractDao;

public class DeviserModuleInfoExtract extends ExtractDao {
    private boolean success;

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    @Override
    public Object extract() {
        // 数据处理标识
        int flag = this.getController().getParaToInt("flag");
        // 模具唯一号
        String modulebarcode = this.getController().getPara("modulebarcode");
        boolean isplan = this.getController().getParaToBoolean("isplan");
        boolean iscopy = this.getController().getParaToBoolean("iscopy");

        StringBuilder builder = new StringBuilder();

        builder.append("SELECT DR.ID AS DESIGNRESUMEID, ML.MODULEBARCODE, ML.GUESTCODE, ML.MODULECODE, ML.PRODUCTNAME ");
        builder.append(", ML.MODULECLASS, ML.UNITEXTRAC, ML.PLASTIC, ML.COMBINE, ML.STARTTIME, ML.GUESTID ");
        builder.append(", ML.INITTRYTIME, ML.TAKEON, ML.PICTUREURL AS DEVISER, DR.STARTDATE, DR.ENDDATE ");
        builder.append(", ML.MODULEINTRO AS REMARK FROM MODULELIST ML ");

        builder.append("LEFT JOIN DS_RESUME DR ON ML.MODULEBARCODE = DR.MODULEBARCODE  ");
        builder.append("LEFT JOIN FACTORY FY ON ML.GUESTID = FY.ID WHERE ML.MODULEBARCODE = ? AND ML.MODULESTATE = 0");

        Record record = Db.findFirst(builder.toString(), modulebarcode);

        if (record == null) {
            return null;
        }

        if (flag == 1) {
            record.set("flag", flag).set("isplan", isplan).set("iscopy", iscopy);
            this.setSuccess(true);
        } else if (flag == 2) {
            record.set("flag", flag).set("isplan", isplan).set("iscopy", iscopy).set("modulebarcode", "").set("designresumeid", "");
            this.setSuccess(true);
        } else {
            record = null;
        }

        return record;
    }
}
