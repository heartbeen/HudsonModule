package com.kc.module.model.form;

import java.util.ArrayList;
import java.util.List;

import com.kc.module.model.ModuleProcessInfo;

/**
 * 预计负荷的计划安排数量
 * 
 * @author ASUS
 * 
 */
public class EstimateLoadForm {
    public String getCraftname() {
        return craftname;
    }

    public void setCraftname(String craftname) {
        this.craftname = craftname;
    }

    public double getWorkload() {
        return workload;
    }

    public void setWorkload(double workload) {
        this.workload = workload;
    }

    public List<ModuleProcessInfo> getEstimate() {
        return estimate;
    }

    public void setEstimate(List<ModuleProcessInfo> estimate) {
        this.estimate = estimate;
    }

    public int getRecordcount() {
        return recordcount;
    }

    public void setRecordcount(int recordcount) {
        this.recordcount = recordcount;
    }

    public double getMacload() {
        return macload;
    }

    public void setMacload(double macload) {
        this.macload = macload;
    }

    private String craftname;
    private double workload;
    private int recordcount;
    private double macload;

    private List<ModuleProcessInfo> estimate = new ArrayList<ModuleProcessInfo>();
}
