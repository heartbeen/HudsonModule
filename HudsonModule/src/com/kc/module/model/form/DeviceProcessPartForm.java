package com.kc.module.model.form;

public class DeviceProcessPartForm {
    public String getPartcode() {
        return partcode;
    }

    public void setPartcode(String partcode) {
        this.partcode = partcode;
    }

    public String getResumeid() {
        return resumeid;
    }

    public void setResumeid(String resumeid) {
        this.resumeid = resumeid;
    }

    public String getStateid() {
        return stateid;
    }

    public void setStateid(String stateid) {
        this.stateid = stateid;
    }

    public String getPartcount() {
        return partcount;
    }

    public void setPartcount(String partcount) {
        this.partcount = partcount;
    }

    public String getScheid() {
        return scheid;
    }

    public void setScheid(String scheid) {
        this.scheid = scheid;
    }

    public String getCursorid() {
        return cursorid;
    }

    public void setCursorid(String cursorid) {
        this.cursorid = cursorid;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public String getMergeid() {
        return mergeid;
    }

    public void setMergeid(String mergeid) {
        this.mergeid = mergeid;
    }

    public int getIsfixed() {
        return isfixed;
    }

    public void setIsfixed(int isfixed) {
        this.isfixed = isfixed;
    }

    public int getIsmajor() {
        return ismajor;
    }

    public void setIsmajor(int ismajor) {
        this.ismajor = ismajor;
    }

    private String uuid;
    private String partcode;
    private String resumeid;
    private String stateid;
    private String partcount;
    private String scheid;
    private String cursorid;
    private String mergeid;
    private int isfixed;
    private int ismajor;
}
