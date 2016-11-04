package com.kc.module.controller;

import com.jfinal.core.Controller;
import com.kc.module.databean.ResultBean;
import com.kc.module.extract.DeviseDepartmentExtract;
import com.kc.module.extract.DeviseEmployeeExtract;
import com.kc.module.extract.DeviseFinishQueryExtract;
import com.kc.module.extract.DeviseModuleInQueryExtract;
import com.kc.module.extract.DeviserModuleInfoExtract;
import com.kc.module.model.DesignCraftInfo;
import com.kc.module.model.DesignCraftSet;
import com.kc.module.model.DesignProcessResume;
import com.kc.module.model.DesignResume;
import com.kc.module.model.DesignResumeRecord;
import com.kc.module.model.DesignScheduleInfo;
import com.kc.module.model.DesignStateInfo;
import com.kc.module.model.ModuleList;
import com.kc.module.model.ModulePlanInfo;
import com.kc.module.model.ModuleProductInfo;
import com.kc.module.utils.ControlUtils;
import com.kc.module.utils.DataUtils;

/**
 * 设计模块的共享控制器
 * 
 * @author ASUS
 * 
 */
public class DeviseShareController extends Controller {
    public void getDeviserModuleInfo() {
        renderJson(DataUtils.getPagination(ModuleList.dao.getDeviserModuleInfo(getPara("match"), getPara("ds") != null),
                                           getParaToInt("start"),
                                           getParaToInt("limit")));
    }

    public void getDeviserModuleMessage() {
        DeviserModuleInfoExtract dmie = new DeviserModuleInfoExtract();
        dmie.setController(this);

        Object data = dmie.extract();

        setAttr("data", data);
        setAttr("success", dmie.isSuccess());

        renderJson();
    }

    /**
     * 获取模具指定类型的金型日程
     */
    public void getModulePlan() {
        ResultBean bean = ModulePlanInfo.dao.getModulePlanResultByKind(getPara("modulebarcode"), getParaToInt("kind"));

        setAttr("success", bean.isSuccess());
        setAttr("data", bean.getData());

        renderJson();
    }

    /**
     * 通过模具唯一号获取产品信息
     */
    public void getModuleProductInfo() {
        renderJson(ModuleProductInfo.dao.getProductInfoByModule(getPara("modulebarcode")));
    }

    /**
     * 获取服务器的图片
     */
    public void requestScaleImage() {
        ControlUtils.downLoadImage(this, "filename", "images\\none.jpg", 48, 48, "JPEG");
        renderNull();
    }

    /**
     * 获取模具的所有设计加工信息
     */
    public void getModuleDesignResume() {
        renderJson(DesignResumeRecord.dao.getModuleDesignResume(getPara("modulebarcode")));
    }

    /**
     * 获取设计制程信息
     */
    public void getSchduleInfo() {
        renderJson(DesignScheduleInfo.dao.getScheduleInfo(getPara("resumeid")));
    }

    /**
     * 通过制程类型获取制程信息
     */
    public void getCrafInfoByKind() {
        renderJson(DesignCraftInfo.dao.getCraftInfoByKind(getParaToInt("kind")));
    }

    /**
     * 获取指定种类的制程集合
     */
    public void getCraftSetInfo() {
        renderJson(DesignCraftSet.dao.getCraftSetByKind(getParaToInt("kind")));
    }

    /**
     * 获取设计模块的条形码模具信息
     */
    public void getDeviseModuleByCase() {
        renderJson(ModuleList.dao.getDeviseModuleByCase(getParaToInt("type"), getParaToBoolean("chk"), getPara("match"), getPara("states")));
    }

    /**
     * 获取指定种类的制程信息并过滤掉隐藏项
     */
    public void getCraftInfoByKindAndHidden() {
        renderJson(DesignCraftInfo.dao.getCraftInfoByKindAndHidden(getParaToInt("kind")));
    }

    public void getStateInfo() {
        renderJson(DesignStateInfo.dao.getStateInfo());
    }

    /**
     * 获取正在设计当中的模具信息
     */
    public void getProcessModuleInfo() {
        renderJson(DesignResumeRecord.dao.getProcessModuleInfo(getPara("isall") == null ? false : getParaToBoolean("isall"),
                                                               ControlUtils.getEmpBarCode(this)));
    }

    /**
     * 通过ID号查询设计履历信息
     */
    public void getModuleResumeById() {
        setAttr("success", true);
        setAttr("data", DesignResumeRecord.dao.getModuleDesignResumeById(getPara("resumeid")));

        renderJson();
    }

    /**
     * 获取设计组别信息
     */
    public void getGroupInfo() {
        DeviseDepartmentExtract dde = new DeviseDepartmentExtract();
        dde.setController(this);

        renderJson(dde.extract());
    }

    /**
     * 获取模具设计制程的基本信息
     */
    public void getProcessScheduleInfo() {
        renderJson(DesignScheduleInfo.dao.getScheduleProcessInfo(getPara("resumeid")));
    }

    /**
     * 获取设计制程的详细情况
     */
    public void getScheduleTaskInfo() {
        renderJson(DesignProcessResume.dao.getScheduleTaskInfo(getPara("scheid")));
    }

    /**
     * 获取小组设计动态
     */
    public void getGroupDesignInfo() {
        renderJson(DesignResume.dao.getGroupDesignInfo(getPara("groupid")));
    }

    /**
     * 查找指定类型设计状态
     * 
     * @param kind
     */
    public void getStateInfoByKind() {
        renderJson(DesignStateInfo.dao.getStateInfo(getParaToInt("kind")));
    }

    /**
     * 获取设计部门人员信息
     */
    public void getDesignEmployeeInfo() {
        DeviseEmployeeExtract dee = new DeviseEmployeeExtract();
        dee.setController(this);
        dee.setDefRegion("0000000");

        renderJson(dee.extract());
    }

    /**
     * 按条件查找设计信息
     */
    public void queryDeviseInfoByCase() {
        DeviseModuleInQueryExtract dmie = new DeviseModuleInQueryExtract();
        dmie.setController(this);

        renderJson(dmie.extract());
    }

    /**
     * 获取设计完成信息
     */
    public void getDeviseFinishInfo() {
        DeviseFinishQueryExtract dfqe = new DeviseFinishQueryExtract();
        dfqe.setController(this);

        renderJson(dfqe.extract());
    }

    /**
     * 通过模具唯一号查找设计履历信息
     */
    public void getDeviseResumeByModule() {
        renderJson(DesignResumeRecord.dao.getDeviseResumeByModuleCode(getPara("modulebarcode")));
    }
}
