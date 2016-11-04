package com.kc.module.model.form;

import com.fasterxml.jackson.annotation.JsonIgnore;

public class ModuleScheduleGanttForm {

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    @JsonIgnore
    public String getPercentDone() {
        return PercentDone;
    }

    @JsonIgnore
    public void setPercentDone(String percentDone) {
        PercentDone = percentDone;
    }

    @JsonIgnore
    public double getDuration() {
        return Duration;
    }

    @JsonIgnore
    public void setDuration(double duration) {
        Duration = duration;
    }

    @JsonIgnore
    public String getDurationUnit() {
        return DurationUnit;
    }

    @JsonIgnore
    public void setDurationUnit(String durationUnit) {
        DurationUnit = durationUnit;
    }

    public boolean getLeaf() {
        return leaf;
    }

    public void setLeaf(boolean leaf) {
        this.leaf = leaf;
    }

    @JsonIgnore
    public String getName() {
        return Name;
    }

    @JsonIgnore
    public void setName(String name) {
        Name = name;
    }

    public int getIndex() {
        return index;
    }

    public void setIndex(int index) {
        this.index = index;
    }

    public String getTypeid() {
        return typeid;
    }

    public void setTypeid(String typeid) {
        this.typeid = typeid;
    }

    public double getEvaluate() {
        return evaluate;
    }

    public void setEvaluate(double evaluate) {
        this.evaluate = evaluate;
    }

    @JsonIgnore
    public String getCraftId() {
        return craftId;
    }

    @JsonIgnore
    public void setCraftId(String craftId) {
        this.craftId = craftId;
    }

    @JsonIgnore
    public String getStartDate() {
        return StartDate;
    }

    @JsonIgnore
    public void setStartDate(String startDate) {
        StartDate = startDate;
    }

    @JsonIgnore
    public String getEndDate() {
        return EndDate;
    }

    @JsonIgnore
    public void setEndDate(String endDate) {
        EndDate = endDate;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    public String id;
    public String PercentDone;
    public double Duration;
    public String DurationUnit;
    public boolean leaf;
    public String Name;
    public int index;
    public String typeid;
    public double evaluate;
    public String craftId;
    public String StartDate;
    public String EndDate;
    public String remark;
}
