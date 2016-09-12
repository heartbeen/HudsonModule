package com.kc.module.transaction;

import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;

import com.jfinal.core.Controller;
import com.jfinal.kit.StrKit;
import com.jfinal.plugin.activerecord.IAtom;
import com.kc.module.base.Barcode;
import com.kc.module.model.ModuleResumeRecord;
import com.kc.module.model.form.ModuleChangeResume;
import com.kc.module.model.form.ModuleChangeResumeForm;
import com.kc.module.model.form.PartChangeResume;
import com.kc.module.utils.DataUtils;

public class ModifyAndDesignIAtom implements IAtom {
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

    private String msg;
    private Controller controller;

    @Override
    public boolean run() throws SQLException {

        // 将前台传来的设变讯息进行解析
        ModuleChangeResumeForm form = DataUtils.fromJsonStrToBean(this.getController()
                                                                     .getPara("info"),
                                                                 ModuleChangeResumeForm.class);
        // 如果解析后的数据为空,则返回错误提示
        if (form == null || form.getModuleResume().size() == 0) {
            this.setMsg("提交的数据JSON错误");
            return false;
        }
        
        Barcode.MD_PROCESS_INFO.nextVal(true);

        // 获取所有解析后的工件讯息
        List<ModuleChangeResume> mcr = form.getModuleResume();
        List<PartChangeResume> pcr;

        ModuleResumeRecord mrr;

        for (ModuleChangeResume m : mcr) {
            if (StrKit.isBlank(m.getId())) {
                m.setId(Barcode.MODULE_RESUME.nextVal());

                mrr = new ModuleResumeRecord();

                mrr.set("ID", m.getId());
                mrr.set("ENDTIME", new Timestamp(m.getEndtime().getTime()));
                mrr.set("MODULEBARCODE", m.getModulebarcode());
                mrr.set("REMARK", m.getRemark());
                mrr.set("RESUMESTATE", m.getResumestate());
                mrr.set("STARTTIME", new Timestamp(m.getStarttime().getTime()));

                if (!(m.save() && mrr.save())) {
                    this.setMsg("修模/设变资料保存失败,请重试!");
                    return false;
                }
            } else {
                if (!m.update()) {
                    this.setMsg("修模/设变资料保存失败,请重试!");
                    return false;
                }
            }

            pcr = m.getPartResume();

            for (PartChangeResume p : pcr) {

                p.setModuleresumeid(m.getId());

                if (StrKit.isBlank(p.getId())) {
                    p.setId(Barcode.MD_PROCESS_INFO.nextVal());

                    if (!p.save()) {
                        this.setMsg("修模/设变资料保存失败,请重试!");
                        return false;
                    }
                } else {
                    if (!p.update()) {
                        this.setMsg("修模/设变资料保存失败,请重试!");
                        return false;
                    }
                }
            }
        }

        return false;
    }
}
