package com.kc.module.transaction;

import java.sql.SQLException;

import com.kc.module.base.Barcode;
import com.kc.module.dao.BaseIAtom;
import com.kc.module.model.ModuleWorkLoad;
import com.kc.module.model.form.SaveWorkLoadForm;
import com.kc.module.utils.JsonUtils;
import com.kc.module.utils.StringUtils;

/**
 * 保存加工负荷的相关资料
 * 
 * @author ASUS
 * 
 */
public class SaveWorkLoadIAtom extends BaseIAtom {

    private String error;

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    @Override
    public boolean run() throws SQLException {
        String kindid = this.getController().getPara("kindid");
        if (StringUtils.isEmpty(kindid)) {
            this.setError("未选择模具加工类型!");
            return false;
        }

        String senddata = this.getController().getPara("senddata");
        if (StringUtils.isEmpty(kindid)) {
            this.setError("没有任何有效的资料!");
            return false;
        }

        boolean result = false;

        SaveWorkLoadForm[] jsonR = JsonUtils.josnToBean(senddata, SaveWorkLoadForm[].class);
        for (SaveWorkLoadForm slf : jsonR) {
            String nwlid = slf.getNwlid();
            String id = slf.getId();
            int usehour = slf.getUsehour();
            ModuleWorkLoad mwl = new ModuleWorkLoad();
            if (StringUtils.isEmpty(nwlid)) {
                if (usehour > 0) {
                    result = mwl.set("ID", Barcode.MD_WORK_LOAD.nextVal()).set("KINDID", kindid).set("CRAFTID", id).set("USEHOUR", usehour).save();
                    if (!result) {
                        this.setError("保存负荷讯息失败!");
                        return false;
                    }
                }
            } else {
                if (usehour > 0) {
                    result = mwl.set("ID", nwlid).set("USEHOUR", usehour).update();
                } else {
                    result = mwl.set("ID", nwlid).delete();
                }
                if (!result) {
                    this.setError("保存负荷讯息失败!");
                    return false;
                }
            }
        }

        return true;
    }

}
