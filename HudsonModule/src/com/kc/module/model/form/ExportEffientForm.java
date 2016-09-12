package com.kc.module.model.form;

public class ExportEffientForm {
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

    public String getEsthour() {
        return esthour;
    }

    public void setEsthour(String esthour) {
        this.esthour = esthour;
    }

    public String getActhour() {
        return acthour;
    }

    public void setActhour(String acthour) {
        this.acthour = acthour;
    }

    public String getAllhour() {
        return allhour;
    }

    public void setAllhour(String allhour) {
        this.allhour = allhour;
    }

    public String getMillhour() {
        return millhour;
    }

    public void setMillhour(String millhour) {
        this.millhour = millhour;
    }

    public String getFinish() {
        return finish;
    }

    public void setFinish(String finish) {
        this.finish = finish;
    }

    public String getStart() {
        return start;
    }

    public void setStart(String start) {
        this.start = start;
    }

    public String getEnd() {
        return end;
    }

    public void setEnd(String end) {
        this.end = end;
    }

    public String getRinfo() {
        return rinfo;
    }

    public void setRinfo(String rinfo) {
        this.rinfo = rinfo;
    }

    // 模具工号
    private String modulecode;
    // 零件编号
    private String partlistcode;
    // 工艺编号
    private String craftid;
    private String craftname;
    private String empid;
    private String empname;
    private String esthour;
    private String acthour;
    private String allhour;
    private String millhour;
    private String finish;
    private String start;
    private String end;
    private String rinfo;
}
