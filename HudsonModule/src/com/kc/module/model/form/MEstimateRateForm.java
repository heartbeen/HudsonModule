package com.kc.module.model.form;

import java.sql.Timestamp;

public class MEstimateRateForm {
    public String getModulecode() {
        return modulecode;
    }

    public void setModulecode(String modulecode) {
        this.modulecode = modulecode;
    }

    public String getPartlistcode() {
        return partlistcode;
    }

    public void setPartlistcode(String partlistcode) {
        this.partlistcode = partlistcode;
    }

    public String getCraftid() {
        return craftid;
    }

    public void setCraftid(String craftid) {
        this.craftid = craftid;
    }

    public String getCraftname() {
        return craftname;
    }

    public void setCraftname(String craftname) {
        this.craftname = craftname;
    }

    public String getEmpid() {
        return empid;
    }

    public void setEmpid(String empid) {
        this.empid = empid;
    }

    public String getEmpname() {
        return empname;
    }

    public void setEmpname(String empname) {
        this.empname = empname;
    }

    public double getEsthour() {
        return esthour;
    }

    public void setEsthour(double esthour) {
        this.esthour = esthour;
    }

    public double getActhour() {
        return acthour;
    }

    public void setActhour(double acthour) {
        this.acthour = acthour;
    }

    public boolean isFinish() {
        return finish;
    }

    public void setFinish(boolean finish) {
        this.finish = finish;
    }

    public double getAllhour() {
        return allhour;
    }

    public void setAllhour(double allhour) {
        this.allhour = allhour;
    }

    public double getMillhour() {
        return millhour;
    }

    public void setMillhour(double millhour) {
        this.millhour = millhour;
    }

    public Timestamp getStart() {
        return start;
    }

    public void setStart(Timestamp start) {
        this.start = start;
    }

    public Timestamp getEnd() {
        return end;
    }

    public void setEnd(Timestamp end) {
        this.end = end;
    }

    // 模具工号
    private String modulecode;
    // 零件名称
    private String partlistcode;
    // 工艺ID号
    private String craftid;
    // 工艺名称
    private String craftname;
    private String empid;
    // 员工姓名
    private String empname;
    // 预计用时
    private double esthour;
    // 所有预估时间
    private double millhour;
    // 实际用时
    private double acthour;
    // 全部用时
    private double allhour;
    // 是否完成
    private boolean finish;
    // 开始加工时间
    private Timestamp start;
    // 结束加工时间
    private Timestamp end;
    // 模具履历加工讯息
    private String rinfo;

    public String getRinfo() {
        return rinfo;
    }

    public void setRinfo(String rinfo) {
        this.rinfo = rinfo;
    }
}
