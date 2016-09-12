package com.kc.module.transaction;

import java.sql.SQLException;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.IAtom;
import com.kc.module.model.ModuleList;
import com.kc.module.model.ModuleResume;
import com.kc.module.model.ModuleResumeRecord;
import com.kc.module.model.form.ModuleUpdateForm;

public class UpdateModuleInfo implements IAtom {
    public Controller getController() {
        return controller;
    }

    public void setController(Controller controller) {
        this.controller = controller;
    }

    private Controller controller;

    @Override
    public boolean run() throws SQLException {

        ObjectMapper mapper = new ObjectMapper();
        try {
            // 更新模具信息
            ModuleList module = mapper.readValue(this.controller.getPara("module"),
                                                 ModuleUpdateForm.class).toModel();
            // 更新模具履历信息
            ModuleResume mr = ModuleResume.dao.findFristCondition(new String[]{"moduleBarcode"},
                                                                  module.get("moduleBarcode"));
            // 如果履历讯息为空则返回模具讯息的更新结果
            if (mr == null) {
                return (true);
            }

            mr.set("starttime", module.get("starttime"));
            mr.set("endtime", module.get("inittrytime"));

            ModuleResumeRecord mrr = ModuleResumeRecord.dao.findFristCondition(new String[]{"id"},
                                                                               mr.get("id"));
            if (mrr == null) {
                return (true);
            }

            mrr.set("starttime", module.get("starttime"));
            mrr.set("endtime", module.get("inittrytime"));

            return module.update() && mr.update() && mrr.update();
        }
        catch (Exception e) {
            return (false);
        }
    }
}
