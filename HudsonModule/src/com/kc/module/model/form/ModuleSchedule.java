package com.kc.module.model.form;

import java.util.Date;

/**
 * 工艺排程表单Bean
 * 
 * @author David
 * @emil xuweissh@163.com
 * 
 */
public class ModuleSchedule {

    private String partId;

    private Date startTime;

    private Date endTime;

    private String craftid;

    private String moduleRId;

    private int rankNum;

    private int duration;

    private String parentId;

    private String remark;

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    public String getPartId() {
        return partId;
    }

    public void setPartId(String partId) {
        this.partId = partId;
    }

    public Date getStartTime() {
        return startTime;
    }

    public void setStartTime(Date startTime) {
        this.startTime = startTime;
    }

    public Date getEndTime() {
        return endTime;
    }

    public void setEndTime(Date endTime) {
        this.endTime = endTime;
    }

    public String getCraftid() {
        return craftid;
    }

    public void setCraftid(String craftid) {
        this.craftid = craftid;
    }

    public String getModuleRId() {
        return moduleRId;
    }

    public void setModuleRId(String moduleRId) {
        this.moduleRId = moduleRId;
    }

    public int getRankNum() {
        return rankNum;
    }

    public void setRankNum(int rankNum) {
        this.rankNum = rankNum;
    }

    public int getDuration() {
        return duration;
    }

    public void setDuration(int duration) {
        this.duration = duration;
    }

    public String getParentId() {
        return parentId;
    }

    public void setParentId(String parentId) {
        this.parentId = parentId;
    }

}
