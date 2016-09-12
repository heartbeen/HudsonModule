package com.kc.module.transaction;

import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.Date;
import java.util.List;

import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.IAtom;
import com.kc.module.model.ModuleResume;
import com.kc.module.model.ModuleResumeRecord;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.StringUtils;

/**
 * 用于设置组立完成的时间
 * 
 * @author ASUS
 * 
 */
public class SetFitDateIAtom implements IAtom {

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
            // 履历ID
            String resumeid = this.controller.getPara("resumeid");
            if (StringUtils.isEmpty(resumeid)) {
                this.setMsg("没有可以设置的模具讯息!");
                return false;
            }
            // 是否将时间设置为空
            boolean isNull = this.getController().getParaToBoolean("isnull");

            // 获取要设置的时间
            Date dateSet = this.getController().getParaToDate("setdate");
            if (!isNull && dateSet == null) {
                this.setMsg("设置组立时间方式不正确!");
                return false;
            }

            Timestamp dateStamp = (dateSet == null ? null : DateUtils.parseTimeStamp(dateSet));
            // 依据前台的模具履历号查找对应的模具讯息
            List<ModuleResume> mrList = ModuleResume.dao.getResumeById(resumeid);
            if (mrList.size() == 0) {
                this.setMsg("没有可以设置的模具讯息!");
                return false;
            }

            boolean result = false;
            ModuleResumeRecord mrr = null;

            for (ModuleResume mr : mrList) {
                String rid = mr.getStr("id");

                result = mr.set("fitdate", isNull ? null : dateStamp).update();
                if (!result) {
                    this.setMsg("保存组立时间失败!");
                    return false;
                }

                mrr = new ModuleResumeRecord();
                result = mrr.set("ID", rid).set("fitdate", isNull ? null : dateStamp).update();

                if (!result) {
                    this.setMsg("保存组立时间失败!");
                    return false;
                }
            }

            return true;
        }
        catch (Exception e) {
            this.setMsg("保存组立时间失败!");
            return false;
        }
    }

}
