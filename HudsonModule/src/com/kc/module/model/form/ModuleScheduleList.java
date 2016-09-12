package com.kc.module.model.form;

import java.util.List;

/**
 * 自动生成排程时前台提交的数据结构bean
 * 
 * @author Davie
 * @email xuweissh@163.com
 * 
 */
public class ModuleScheduleList {

    private List<ModuleSchedule> mainPart;

    private List<ModuleSchedule> partList;

    private String[] planIds;

    public List<ModuleSchedule> getMainPart() {
        return mainPart;
    }

    public void setMainPart(List<ModuleSchedule> mainPart) {
        this.mainPart = mainPart;
    }

    public List<ModuleSchedule> getPartList() {
        return partList;
    }

    public void setPartList(List<ModuleSchedule> partList) {
        this.partList = partList;
    }

    public String[] getPlanIds() {
        return planIds;
    }

    public void setPlanIds(String[] planIds) {
        this.planIds = planIds;
    }

}
