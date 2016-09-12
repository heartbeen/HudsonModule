package com.kc.module.transaction;

import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;

import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.IAtom;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.base.Barcode;
import com.kc.module.base.ModuleState;
import com.kc.module.model.ModuleList;
import com.kc.module.model.ModuleResume;
import com.kc.module.model.ModuleResumeRecord;
import com.kc.module.model.form.ModuleForm;
import com.kc.module.model.form.ModuleFormList;
import com.kc.module.utils.ControlUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.JsonUtils;

public class SaveNewModuleIAtom implements IAtom {

    private Controller controller;
    private int result;

    public int getResult() {
        return result;
    }

    public void setResult(int result) {
        this.result = result;
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
            // 将前台提交的JSON进行解析
            ModuleFormList modules = JsonUtils.josnToBean(this.getController().getPara("modules"), ModuleFormList.class);
            // 获取前台传递的模具讯息并进行解析,如果模具资料为空,则返回FALSE
            List<ModuleForm> t_list = modules.getModules();
            if (t_list == null || t_list.size() == 0) {
                this.setResult(-1);
                return (false);
            }

            // 获取模具讯息,因为只有一个模具,所以获取第一个即可
            ModuleForm mlf = t_list.get(0);
            // 判断数据库是否存在一个非报废的相同的模具工号,如果包含则返回FALSE
            Record f_module = Db.findFirst("SELECT * FROM MODULELIST WHERE MODULESTATE = ? AND MODULECODE = ?", "0", mlf.getModulecode());

            String f_empid = ControlUtils.getEmpBarCode(this.getController());

            Timestamp nowStamp = DateUtils.getNowStampTime();

            // 初始化待保存的资料的三个事例分别对应在ModuleList,ModuleResumeRecord,ModuleResume三个表
            // 以在三个表中各新增一笔资料
            ModuleList ml = mlf.toModel();
            boolean rst = false;
            // 如果服务器中的模具讯息不存在,则新增模具资料,否则更新模具资料
            if (f_module == null) {
                ModuleResumeRecord mrr = new ModuleResumeRecord();
                ModuleResume mr = new ModuleResume();

                ml.set("OPERATEFLAG", "0").set("CREATETIME", nowStamp).set("CREATOR", f_empid);

                // 生成一个模具履历记录号(ID)
                String rsmid = Barcode.MODULE_RESUME.nextVal();

                mrr.set(mrr.getPrimaryKey(), rsmid);
                mrr.set("MODULEBARCODE", ml.get("modulebarcode"));
                mrr.set("RESUMESTATE", ModuleState.MODULE_NEW.getIndex());
                mrr.set("RESUMEEMPID", f_empid);
                mrr.set("RESUMETIME", nowStamp);
                mrr.set("STARTTIME", ml.get("starttime"));
                mrr.set("ENDTIME", ml.get("inittrytime"));
                mrr.set("REMARK", ml.get("moduleintro"));
                mr.set("INSTALLER", ml.get("takeon"));
                mr.set("DEVISER", ml.get("pictureurl"));

                mr.set(mr.getPrimaryKey(), rsmid);
                mr.set("MODULEBARCODE", ml.get("modulebarcode"));
                mr.set("RESUMEEMPID", f_empid);
                mr.set("CURESTATE", "1");
                mr.set("RESUMESTATE", ModuleState.MODULE_NEW.getIndex());
                mr.set("STARTTIME", ml.get("starttime"));
                mr.set("ENDTIME", ml.get("inittrytime"));
                mr.set("REMARK", ml.get("moduleintro"));
                mr.set("INSTALLER", ml.get("takeon"));
                mr.set("DEVISER", ml.get("pictureurl"));

                rst = ml.save() && mrr.save() && mr.save();
            } else {
                ml.set(ml.getPrimaryKey(), f_module.getStr("MODULEBARCODE"));
                rst = ml.update();
            }

            this.setResult(rst ? 1 : -2);
            return rst;
        }
        catch (Exception e) {
            this.setResult(-3);
            return (false);
        }
    }
}
