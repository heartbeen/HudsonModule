package com.kc.module.controller;

import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.Date;
import java.util.List;

import com.jfinal.aop.Before;
import com.jfinal.aop.ClearInterceptor;
import com.jfinal.core.Controller;
import com.jfinal.kit.JsonKit;
import com.jfinal.kit.StrKit;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.IAtom;
import com.kc.module.base.Barcode;
import com.kc.module.base.RegularState;
import com.kc.module.interceptor.AuthInterceptor;
import com.kc.module.interceptor.validator.ModulePartValidator;
import com.kc.module.model.DeviceDepart;
import com.kc.module.model.ExchangeRate;
import com.kc.module.model.Factory;
import com.kc.module.model.ModuleEstSchedule;
import com.kc.module.model.ModuleList;
import com.kc.module.model.ModulePart;
import com.kc.module.model.ModuleProcessInfo;
import com.kc.module.model.ModuleResume;
import com.kc.module.model.ModuleResumeRecord;
import com.kc.module.model.ModuleResumeSection;
import com.kc.module.model.PartOutBound;
import com.kc.module.model.RegionDepartment;
import com.kc.module.model.form.ModuleProcessInfoForm;
import com.kc.module.model.form.ModuleProcessInfoListForm;
import com.kc.module.transaction.DelPartInfoIAtom;
import com.kc.module.transaction.ModuleCopyIAtom;
import com.kc.module.transaction.ModuleSectionIAtom;
import com.kc.module.transaction.SaveOutBoundApply;
import com.kc.module.transaction.UpdateOutBoundAboard;
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.ControlUtils;
import com.kc.module.utils.JsonUtils;

/**
 * 模具工件管理控制器
 * 
 * @author xuwei
 * @date 2013-10-17
 * 
 */
@Before(AuthInterceptor.class)
public class ModulePartController extends Controller {

    // /**
    // * 得到工艺的关联关系
    // */
    // public void craftDependencies() {
    // String moduleBarcode = getPara("moduleBarcode");
    //
    // // List<CraftSchedule> csList =
    // // CraftSchedule.dao.getDependencies(moduleBarcode);
    // //
    // // renderJson(JsonKit.listToJson(csList, 2)
    // // .replace("craftschbarcode", "From")
    // // .replace("nextcscode", "To"));
    // }

    /**
     * 增加工件信息
     */
    public void addPartAuth() {
        renderJson("{\"auth\":true");
    }

    /**
     * <h2>提交修模工件并且工件已经存在</h2><br>
     * 前台文件:ModuleModifyPart.js
     */
    @Before(ModulePartValidator.class)
    public void modifyExitsPart() {

        boolean succeed = Db.tx(new IAtom() {
            public boolean run() throws SQLException {
                return addModuleModifyResume();
            }
        });

        setAttr("success", succeed);
        setAttr("msg", succeed ? "修模或设变信息保存成功!是否要对工件进行排程?" : "");

        renderJson();

    }

    /**
     * 增加修模或设变履历信息
     * 
     * @return
     */
    private boolean addModuleModifyResume() {
        boolean success = true;
        ModuleResumeRecord mrr = getModel(ModuleResumeRecord.class, "mrr");

        String id = Barcode.MODULE_RESUME.nextVal();
        String remark = mrr.get("remark");

        mrr.set("RESUMEEMPID", ControlUtils.getAccountWorkNumber(this));
        mrr.set("RESUMETIME", new Timestamp(new Date().getTime()));

        if (remark != null) {
            // 备注信息只能为500长度
            if (remark.length() > 500) {
                mrr.set("remark", remark.substring(0, 500));
            }
        }

        if (mrr.get("id") == null) {
            mrr.set(mrr.getPrimaryKey(), id);
            success = mrr.save();// 保存履历记录
        } else {
            success = mrr.update();// 保存履历记录
        }

        // 保存最新的履历记录
        if (success) {
            ModuleResume mr = getModel(ModuleResume.class, "mr");

            mr.set("RESUMEEMPID", ControlUtils.getAccountWorkNumber(this));
            mr.set("CURESTATE", "1");

            if (mr.get("id") == null) {
                mr.set("id", id);
                success = mr.save();
            } else {
                success = mr.update();// 保存履历记录
            }
        } else {
            setAttr("msg", "模具加工履历信息保存失败!请您重新提交一次!");
        }

        if (success) {
            success = addModuleModifyPart(id);
        } else {
            setAttr("msg", "模具加工履历信息保存失败!请您重新提交一次!");
        }

        return success;
    }

    /**
     * 增加修模或设变工件信息
     * 
     * @return
     */
    private boolean addModuleModifyPart(String resumeId) {

        List<ModuleProcessInfoForm> list = null;
        try {
            list = JsonUtils.josnToBean(getPara("parts"), ModuleProcessInfoListForm.class).getParts();
        }
        catch (Exception e) {
            setAttr("msg", "工件提交数据JSON格式错误,请重新提交!");
            return false;
        }

        ModuleProcessInfo mpi;

        Barcode.MD_PROCESS_INFO.nextVal(true);

        for (ModuleProcessInfoForm p : list) {
            String t_barcode = Barcode.MD_PROCESS_INFO.nextVal();

            mpi = p.toModel();

            if (mpi.get("id") == null) {
                mpi.set("MODULERESUMEID", resumeId);
                mpi.set("id", t_barcode);

                if (!mpi.save()) {
                    setAttr("msg", "选择修模或设变的工件信息保存失败,请重新提交!");
                    return false;
                }
            } else {
                if (!mpi.update()) {
                    setAttr("msg", "选择修模或设变的工件信息更新失败,请重新提交!");
                    return false;
                }
            }

        }

        return true;
    }

    /**
     * 查询当前加工单位的工件加工时间轴数据
     */
    public void deptPartTimeline() {
        String moduleResumeId = getPara("moduleResumeId");
        String moduleState = getPara("moduleState");
        String posId = getPara("posId");

        posId = StrKit.notBlank(posId) ? posId : ControlUtils.getDeptRegionPosid(this);

        List<ModuleProcessInfo> list = ModuleProcessInfo.dao.modulePartList(posId, moduleResumeId, moduleState);

        renderJson("{\"success\":true,\"parts\":" + JsonKit.toJson(list, 2).replace("starttime", "start") + "}");

    }

    /**
     * 加工单位有的加工工艺所对应的工件<br>
     * 前台调的文件:ModulePartTimeEvaluation.js
     */
    @ClearInterceptor
    public void deptPartSchedule() {
        String moduleResumeId = getPara("moduleResumeId");
        String craftId = getPara("craftId");

        List<ModuleEstSchedule> list = ModuleEstSchedule.dao.findPartScheduleForCraft(moduleResumeId, craftId);
        renderJson("{\"success\":true,\"parts\":" + (list == null ? "[]" : JsonKit.toJson(list, 2).replace("starttime", "start")) + "}");
    }

    /**
     * 保存预估工时
     */
    public void saveEvaluation() {

        boolean succeed = Db.tx(new IAtom() {
            public boolean run() throws SQLException {
                ModuleEstSchedule mes = getModel(ModuleEstSchedule.class, "mes");

                List<ModuleEstSchedule> list = ModuleEstSchedule.dao.findPartListSchedule(mes.get("id"));

                // 如果有多个工件时,就对工时进行平分
                double time = 0;
                if (list.size() > 0) {
                    time = ArithUtils.div(mes.getNumber("evaluate").doubleValue(), list.size());
                }

                for (ModuleEstSchedule m : list) {
                    m.set("evaluate", time);

                    if (!m.update()) {
                        return false;
                    }
                }
                return mes.update();
            }
        });

        setAttr("success", succeed);
        setAttr("msg", succeed ? "工时修改成功!" : "工时修改失败,请再试一次!");

        renderJson();
    }

    /**
     * 获取币别讯息(包括基本讯息以及汇率)
     */
    public void getExchangeRate() {
        renderJson(ExchangeRate.dao.getExchangeRate());
    }

    /**
     * 保存外发厂商
     */
    public void saveOutBoundFactoryInfo() {
        renderJson("result", Factory.dao.saveFactoryInfo(ControlUtils.getParaList(this, new String[]{"code", "name", "contact", "addr", "phone"})));
    }

    /**
     * 保存外发申请
     */
    public void saveOutBoundApply() {
        SaveOutBoundApply.iAtom.setController(this);
        boolean rs = SaveOutBoundApply.iAtom.runTx(SaveOutBoundApply.iAtom);

        setAttr("error", SaveOutBoundApply.iAtom.getError());
        setAttr("result", SaveOutBoundApply.iAtom.getResult());
        setAttr("success", rs);

        renderJson();
    }

    /**
     * 保存外发申请
     */
    public void saveOutBoundApplyCheck() {
        SaveOutBoundApply.iAtom.setController(this);
        boolean rs = SaveOutBoundApply.iAtom.runTx(SaveOutBoundApply.iAtom);

        setAttr("error", SaveOutBoundApply.iAtom.getError());
        setAttr("result", SaveOutBoundApply.iAtom.getResult());
        setAttr("success", rs);

        renderJson();
    }

    /**
     * 保存外发申请
     */
    public void saveOutBoundApplyUncheck() {
        SaveOutBoundApply.iAtom.setController(this);
        boolean rs = SaveOutBoundApply.iAtom.runTx(SaveOutBoundApply.iAtom);

        setAttr("error", SaveOutBoundApply.iAtom.getError());
        setAttr("result", SaveOutBoundApply.iAtom.getResult());
        setAttr("success", rs);

        renderJson();
    }

    /**
     * 保存外发申请
     */
    public void saveOutBoundApplyCancel() {
        SaveOutBoundApply.iAtom.setController(this);
        boolean rs = SaveOutBoundApply.iAtom.runTx(SaveOutBoundApply.iAtom);

        setAttr("error", SaveOutBoundApply.iAtom.getError());
        setAttr("result", SaveOutBoundApply.iAtom.getResult());
        setAttr("success", rs);

        renderJson();
    }

    /**
     * 保存外发申请
     */
    public void saveOutBoundApplyOut() {
        SaveOutBoundApply.iAtom.setController(this);
        boolean rs = SaveOutBoundApply.iAtom.runTx(SaveOutBoundApply.iAtom);

        setAttr("error", SaveOutBoundApply.iAtom.getError());
        setAttr("result", SaveOutBoundApply.iAtom.getResult());
        setAttr("success", rs);

        renderJson();
    }

    /**
     * 保存外发申请
     */
    public void saveOutBoundApplyBack() {
        SaveOutBoundApply.iAtom.setController(this);
        boolean rs = SaveOutBoundApply.iAtom.runTx(SaveOutBoundApply.iAtom);

        setAttr("error", SaveOutBoundApply.iAtom.getError());
        setAttr("result", SaveOutBoundApply.iAtom.getResult());
        setAttr("success", rs);

        renderJson();
    }

    public void getRegionDepartOfMetal() {
        renderJson(RegionDepartment.dao.queryRegionDepartByStepid(ControlUtils.getFactoryStepid(this)));
    }

    /**
     * 更新工件外发
     */
    public void updateOutBoundAboard() {
        UpdateOutBoundAboard.iAtom.setController(this);
        UpdateOutBoundAboard.iAtom.setAjaxAttr(new String[]{"data", "timecol", "ori", "est", "outemp"});

        boolean rs = UpdateOutBoundAboard.iAtom.runTx(UpdateOutBoundAboard.iAtom);
        renderJson("{\"result\":" + rs + "}");
    }

    public void getCurrencyDepartmentMachineInfo() {
        // renderJson(DeviceDepart.dao.getCurrencyDeptMachineInfo(ControlUtils.getUserPosition(this)));
        renderJson(DeviceDepart.dao.getCurrencyDeptMachineInfo(ControlUtils.getStepId(this)));
    }

    /**
     * 集中关闭某个部门的相关机台设备
     */

    public void pauseCurrencyDepartMachine() {
        renderJson("result", DeviceDepart.dao.pauseCurrentMachineListActionData(RegularState.MACHINE_START.getIndex(),
                                                                                ControlUtils.getEmpBarCode(this),
                                                                                getPara("device")));
    }

    /**
     * 获取机台的加工部件讯息
     */
    public void getCurrentProcessMachinePartInfo() {
        renderJson(DeviceDepart.dao.getCurrentProcessMachinePartInfo(getPara("departid")));
    }

    /**
     * 查询已导入零件清单的模具工号讯息
     */
    public void getMatchModuleInfo() {
        renderJson(ModuleList.dao.getMatchModuleInfo(getPara("match")));
    }

    /**
     * 复制增番模具的讯息
     */
    public void copyModulePartInfo() {
        ModuleCopyIAtom mci = new ModuleCopyIAtom();
        mci.setController(this);
        boolean success = Db.tx(mci);

        setAttr("result", mci.getResult());
        setAttr("success", success);

        renderJson();
    }

    /**
     * 删除工件讯息
     */
    public void delModulePartInfo() {
        DelPartInfoIAtom dpii = new DelPartInfoIAtom();
        dpii.setController(this);

        boolean result = Db.tx(dpii);

        setAttr("success", result);
        setAttr("msg", dpii.getMsg());

        renderJson();
    }

    /**
     * 获取模具工号数据
     */
    public void getModuleListData() {
        setAttr("children", ModuleList.dao.findModuleListData());
        renderJson();
    }

    /**
     * 根据模具工号,查询工件
     */
    public void getModulePartData() {
        setAttr("children", ModulePart.dao.findModulePartData(getPara("moduleBarcode")));
        renderJson();
    }

    /**
     * 获取外发工件的相关资料
     */
    public void getOutBoundPartInfo() {
        renderJson(PartOutBound.dao.getOutBoundPartInfo(getPara("stateid"),
                                                        getPara("modulecode"),
                                                        getPara("partid"),
                                                        getPara("startdate"),
                                                        getPara("enddate")));
    }

    /**
     * 获取模具履历的加工时段讯息(修模/设变)
     */
    public void getModuleSectionInfo() {
        renderJson(ModuleResume.dao.findModuleSectionInfo(getPara("moduleinfo")));
    }

    /**
     * 获取模具履历阶段性的工件讯息
     */
    public void getModuleResumeSectionInfo() {
        renderJson(ModuleResumeSection.dao.getModuleResumeSectionInfo(getPara("secid")));
    }

    /**
     * 保存模具履历的加工阶段
     */
    public void saveModuleSectionInfo() {
        ModuleSectionIAtom msi = new ModuleSectionIAtom();
        msi.setControl(this);
        boolean success = Db.tx(msi);
        setAttr("success", success);
        setAttr("result", msi.getResult());

        renderJson();
    }
}
