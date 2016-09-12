package com.kc.module.transaction;

import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;

import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.IAtom;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.utils.DateUtils;

/**
 * 模具系统加工完成
 * 
 * @author ASUS
 * 
 */
public class ProcessModuleHandleIAtom implements IAtom {

    private Controller controller;
    private String msg;

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public Controller getController() {
        return controller;
    }

    public void setController(Controller controller) {
        this.controller = controller;
    }

    @Override
    public boolean run() throws SQLException {
        try {
            // 获取模具履历号
            String resumeid = this.getController().getPara("resumeid");
            // 获取当前数据库时间
            Timestamp nowtime = DateUtils.getNowStampTime();

            List<Record> rList = Db.find("SELECT ID,PROCESSED FROM MD_RESUME WHERE ID IN (" + resumeid + ")");

            boolean result = false;

            for (Record record : rList) {
                record.set("PROCESSED", record.getTimestamp("PROCESSED") == null ? nowtime : null);
                result = Db.update("MD_RESUME", record);
                if (!result) {
                    this.setMsg("更新加工完成时间失败!");
                    return false;
                }

                result = Db.update("MD_RESUME_RECORD", record);
                if (!result) {
                    this.setMsg("更新加工完成时间失败!");
                    return false;
                }
            }

            this.setMsg("设置加工时间完成");
            return true;
        }
        catch (Exception e) {
            this.setMsg("出现异常,请及时报告系统管理员");
            return false;
        }
    }

}
