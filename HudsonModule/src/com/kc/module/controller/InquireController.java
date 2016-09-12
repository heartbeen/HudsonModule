package com.kc.module.controller;

import com.jfinal.core.Controller;
import com.kc.module.model.ModuleEstSchedule;
import com.kc.module.model.ModuleList;
import com.kc.module.model.ModuleProcessInfo;
import com.kc.module.model.ModuleProcessResume;
import com.kc.module.model.ModuleResume;
import com.kc.module.model.ModuleResumeRecord;
import com.kc.module.model.RegionDepartment;
import com.kc.module.utils.ControlUtils;

public class InquireController extends Controller {

    /**
     * 獲取查詢的指定類型或者客戶的匹配模具集合
     * 
     * @param mold
     */
    public void getModuleCodeList() {
        renderJson(ModuleList.dao.getModuleCodeList(getPara("mold")));
    }

    public void getModuleResumeInfo() {
        renderJson(ModuleResumeRecord.dao.getModuleResumeInfo(getPara("modulebarcode"), false));
    }

    public void getModuleResumePartList() {
        renderJson(ModuleProcessResume.dao.getModuleResumePartList(getPara("resumeid")));
    }

    public void getTotalPartProcessInfo() {
        renderText(ModuleEstSchedule.dao.getTotalPartProcessInfo(getPara("partbarcode"), getPara("resumeid")));
    }

    public void getModuleProcessDetails() {
        renderJson(ModuleProcessResume.dao.getModuleProcessDetails(getPara("rsmid"), getPara("partbarcode"), getPara("start"), getPara("end")));
    }

    public void getProcessModuleCodeList() {
        renderJson(ModuleProcessInfo.dao.getProcessModuleCodeList(getParaToBoolean("chk"), getPara("query")));
    }

    public void getCurrentProcessModuleInfo() {
        renderText(ModuleProcessInfo.dao.getCurrentProcessModuleInfo(getPara("resumeid")));
    }

    public void getUserCurrentRegionDepartment() {
        renderJson(RegionDepartment.dao.getUserRegionDepartment(ControlUtils.getFactoryStepid(this), "01"));
    }

    /**
     * 查询员工加工明细
     */
    public void getEmployeeProcessInformation() {
        renderJson(ModuleProcessResume.dao.getEmployeeProcessInfo(getPara("deptid"), getPara("start"), getPara("end")));
    }

    /**
     * 查询员工工件明细
     */
    public void getEmployeeProcessPartInformation() {
        renderJson(ModuleProcessResume.dao.getEmployeeProcessPartInfo(getPara("empid"), getPara("start"), getPara("end")));
    }

    public void findPartInfo() {
        renderJson(ModuleResume.dao.findPartInfo(getPara("moldid"), getPara("partid")));
    }

    public void getLocalePartInfo() {
        renderJson(ModuleProcessInfo.dao.getLocalePartInfo(ControlUtils.getStepId(this)));
    }

    public void getLocalePartSchedule() {
        renderJson(ModuleEstSchedule.dao.getLocalePartSchedule(getPara("partid"), getPara("resumeid")));
    }

    /**
     * 獲取模具的加工成本
     */
    public void getModuleProcessCost() {

        renderJson(ModuleEstSchedule.dao.getModuleProcessCost(getPara("resumeid")));
    }

    public void queryModuleInfoByCase() {
        renderJson(ModuleList.dao.queryModuleInfoByCase(getPara("stype"), getPara("content")));
    }

    public void getCurrentModuleInformation() {
        renderJson(ModuleResume.dao.getCurrentModuleInformation());
    }

    public void getAllModuleResumeInfo() {
        renderJson(ModuleResumeRecord.dao.getAllModuleResumeInfo(getPara("modulebarcode")));
    }
}
