package com.kc.module.transaction;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.kc.module.base.Barcode;
import com.kc.module.model.ModuleList;
import com.kc.module.model.ModuleResume;
import com.kc.module.utils.ControlUtils;
import com.kc.module.utils.DateUtils;

public class SaveModuleIAtom extends SqlTranscation {
    public static SaveModuleIAtom iAtom = new SaveModuleIAtom();

    @Override
    public boolean run() {
        try {
            String ajaxText = ctrl.getPara(ajaxAttr[0]);
            if (ajaxText.equals("")) {
                return (false);
            }
            // 将前台提交的模具资料解析成数组以备写入数据库
            String[] rows = ajaxText.split("<TR>", -1);
            // 将前台传送的JSON串进行解析,并获取模具工号以备对数据库模具工号进行比对
            List<String> ajaxList = new ArrayList<String>();

            for (String item : rows) {
                String[] cells = item.split("<TD>", -1);
                if (!ajaxList.contains(cells[1])) {
                    ajaxList.add(cells[1]);
                }
            }

            // 获取模具所在的厂区代号
            String possessId = ControlUtils.getFactoryPosid(ctrl);
            // 查询所有模具工号是否已经被创建
            List<ModuleList> query = ModuleList.dao.getExsitModuleCode(ajaxList);

            list.clear();
            if (query != null && query.size() > 0) {
                for (ModuleList mm : query) {
                    list.add(mm.getStr("MODULECODE"));
                }

                return false;
            }

            ModuleList moduleList = new ModuleList();
            ModuleResume moduleResume = new ModuleResume();
            for (String item : rows) {

                moduleList.clear();
                moduleResume.clear();

                String[] cells = item.split("<TD>", -1);
                // 模具工号产生的UUID
                String moduleUuid = UUID.randomUUID().toString().replace("-", "");
                // 模具工号产生的扫描ID
                String moduleBarId = Barcode.MODULE.nextVal();

                // 模具工号履历ID
                String moduleResumeId = Barcode.MODULE_RESUME.nextVal();
                boolean listRs = moduleList.set("ID", moduleUuid)
                                           .set("POSID", possessId)
                                           .set("MODULECODE", cells[1])
                                           .set("MODULEBARCODE", moduleBarId)
                                           .set("GUESTID", cells[2])
                                           .set("MODULECLASS", cells[5])
                                           .set("INITTRYTIME", Timestamp.valueOf(cells[8]))
                                           .set("FACTTRYTIME", null)
                                           .set("CREATEYEAR", cells[10])
                                           .set("CREATEMONTH", cells[11])
                                           .set("CREATETIME",
                                                Timestamp.valueOf(DateUtils.getDateNow("yyyy-MM-dd HH:mm:ss")))
                                           .set("CREATOR", "")
                                           .set("MODULESTATE", "0")
                                           .set("TAKEON", cells[9])
                                           .set("STARTTIME", Timestamp.valueOf(cells[7]))
                                           .set("MONTHNO", cells[12])
                                           .set("PICTUREURL", "")
                                           .set("MODULESTYLE", cells[0])
                                           .set("PRODUCTNAME", cells[4])
                                           .set("MODULEINTRO", cells[15])
                                           .set("GUESTCODE", cells[3])
                                           .set("WORKPRESSURE", Integer.valueOf(cells[13]))
                                           .set("UNITEXTRAC", cells[14])
                                           .set("OPERATEFLAG", "0")
                                           .save();
                boolean resumeRs = moduleResume.set("ID", moduleResumeId)
                                               .set("MODULEBARCODE", moduleBarId)
                                               .set("RESUMESTATE", "0")
                                               .set("RESUMETIME",
                                                    Timestamp.valueOf(DateUtils.getDateNow("yyyy-MM-dd HH:mm:ss")))
                                               .save();
                if (!listRs || !resumeRs) {
                    return (false);
                }

            }

            return true;
        }
        catch (Exception e) {
            e.printStackTrace();
            return (false);
        }
    }

}
