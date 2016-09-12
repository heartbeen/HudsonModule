package com.kc.module.controller;

import java.util.List;

import com.jfinal.aop.ClearInterceptor;
import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.model.DeviceProcessResume;
import com.kc.module.model.form.MachineWorkForm;
import com.kc.module.report.MachineWorkPrecent;

@ClearInterceptor
public class ReportController extends Controller {

    /**
     * 按工艺统计机台负荷
     */
    public void machineLoadOfCraft() {
        MachineWorkForm workForm = getModel(MachineWorkForm.class, "workForm");
        List<Record> list = DeviceProcessResume.dao.findDeviceLoadOfCraft(workForm);

        collectMachine(list, workForm.getCollectDateForamt());
    }

    /**
     * 按工艺部门机台负荷
     */
    public void machineLoadOfDept() {
        MachineWorkForm workForm = getModel(MachineWorkForm.class, "workForm");
        List<Record> list = DeviceProcessResume.dao.findDeptDeviceLoad(workForm);

        collectMachine(list, workForm.getCollectDateForamt());
    }

    /**
     * 按选择部门统计各机台负荷
     */
    public void machineLoadOfSelectDept() {
        MachineWorkForm workForm = getModel(MachineWorkForm.class, "workForm");
        List<Record> list = DeviceProcessResume.dao.findSelectDeptDeviceLoad(workForm);

        collectMachine(list, workForm.getCollectDateForamt());
    }

    /**
     * 统一计算方法
     * 
     * @param list
     * @param dateFormat
     *            统计格式时间格式
     */
    private void collectMachine(List<Record> list, String dateFormat) {
        MachineWorkPrecent machineWorkPrecent = new MachineWorkPrecent(list, dateFormat);
        renderJson(machineWorkPrecent.collect());
    }
}
