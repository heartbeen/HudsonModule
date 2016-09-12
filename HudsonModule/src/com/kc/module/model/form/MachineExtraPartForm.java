package com.kc.module.model.form;

public class MachineExtraPartForm {
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPartbarlistcode() {
        return partbarlistcode;
    }

    public void setPartbarlistcode(String partbarlistcode) {
        this.partbarlistcode = partbarlistcode;
    }

    public String getScheduleid() {
        return scheduleid;
    }

    public void setScheduleid(String scheduleid) {
        this.scheduleid = scheduleid;
    }

    public String getIstime() {
        return istime;
    }

    public void setIstime(String istime) {
        this.istime = istime;
    }

    public String getDeptid() {
        return deptid;
    }

    public void setDeptid(String deptid) {
        this.deptid = deptid;
    }

    public int getIsmajor() {
        return ismajor;
    }

    public void setIsmajor(int ismajor) {
        this.ismajor = ismajor;
    }

    public String getEmpactid() {
        return empactid;
    }

    public void setEmpactid(String empactid) {
        this.empactid = empactid;
    }

    private String id;
    private String partbarlistcode;
    private String scheduleid;
    private String istime;
    private String deptid;
    private int ismajor;
    private String empactid;
    private String cursorid;
    private String rsmid;
    private String stateid;

    public String getStateid() {
        return stateid;
    }

    public void setStateid(String stateid) {
        this.stateid = stateid;
    }

    public String getRsmid() {
        return rsmid;
    }

    public void setRsmid(String rsmid) {
        this.rsmid = rsmid;
    }

    public String getCursorid() {
        return cursorid;
    }

    public void setCursorid(String cursorid) {
        this.cursorid = cursorid;
    }

    public int getInvisible() {
        return invisible;
    }

    public void setInvisible(int invisible) {
        this.invisible = invisible;
    }

    private int invisible;
}
