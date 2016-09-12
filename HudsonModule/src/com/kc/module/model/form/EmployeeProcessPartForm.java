package com.kc.module.model.form;

public class EmployeeProcessPartForm {
    public String getPartlistcode() {
        return partlistcode;
    }

    public void setPartlistcode(String partlistcode) {
        this.partlistcode = partlistcode;
    }

    public String getPartcode() {
        return partcode;
    }

    public void setPartcode(String partcode) {
        this.partcode = partcode;
    }

    public String getModulecode() {
        return modulecode;
    }

    public void setModulecode(String modulecode) {
        this.modulecode = modulecode;
    }

    public String getDeptname() {
        return deptname;
    }

    public void setDeptname(String deptname) {
        this.deptname = deptname;
    }

    public double getUsehour() {
        return usehour;
    }

    public void setUsehour(double usehour) {
        this.usehour = usehour;
    }

    public String getStatename() {
        return statename;
    }

    public void setStatename(String statename) {
        this.statename = statename;
    }

    public String getStarttime() {
        return starttime;
    }

    public void setStarttime(String starttime) {
        this.starttime = starttime;
    }

    public String getEndtime() {
        return endtime;
    }

    public void setEndtime(String endtime) {
        this.endtime = endtime;
    }

    public void setAppendUsehour(double usehour) {
        this.usehour += usehour;
    }

    private String partlistcode;
    private String partcode;
    private String modulecode;
    private String deptname;
    private double usehour;
    private String statename;
    private String starttime;
    private String endtime;
}
