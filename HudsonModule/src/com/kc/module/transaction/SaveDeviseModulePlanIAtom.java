package com.kc.module.transaction;

import java.sql.SQLException;
import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.base.Barcode;
import com.kc.module.dao.BaseIAtom;
import com.kc.module.model.form.ModulePlanForm;
import com.kc.module.utils.JsonUtils;
import com.kc.module.utils.StringUtils;

public class SaveDeviseModulePlanIAtom extends BaseIAtom {

    @Override
    public boolean run() throws SQLException {
        String modulebarcode = this.getController().getPara("modulebarcode");
        String datalist = this.getController().getPara("datalist");

        ModulePlanForm[] mpf = JsonUtils.josnToBean(datalist, ModulePlanForm[].class);

        if (StringUtils.isEmpty(modulebarcode)) {
            this.setMsg("没有任何模具资料");
        }

        List<Record> listSche = Db.find("SELECT * FROM MD_PLAN_INFO WHERE MODULEBARCODE = ?", modulebarcode);

        boolean result = false;

        for (ModulePlanForm item : mpf) {
            if (isExsist(listSche, modulebarcode, item.getKind())) {
                result = item.update();
                if (!result) {
                    this.setMsg("保存金型日程失败");
                    return result;
                }
            } else {
                item.setId(Barcode.MD_PLAN_INFO.nextVal());
                result = item.save();
                if (!result) {
                    this.setMsg("保存金型日程失败");
                    return result;
                }
            }
        }

        this.setMsg("保存金型日程成功");
        return (true);
    }

    /**
     * 判断金型日程是否存在
     * 
     * @param list
     * @param modulebarcode
     * @param kind
     * @return
     */
    private boolean isExsist(List<Record> list, String modulebarcode, int kind) {
        for (Record rec : list) {
            String moduleid = rec.getStr("MODULEBARCODE");
            int classid = rec.getNumber("KIND").intValue();

            if (modulebarcode.equals(moduleid) && kind == classid) {
                return (true);
            }
        }

        return (false);
    }

}
