package com.kc.module.model.form;

import java.util.List;

public class ModuleSectionForm {
    public String getSecid() {
        return secid;
    }

    public void setSecid(String secid) {
        this.secid = secid;
    }

    public String getStateid() {
        return stateid;
    }

    public void setStateid(String stateid) {
        this.stateid = stateid;
    }

    public String getStartdate() {
        return startdate;
    }

    public void setStartdate(String startdate) {
        this.startdate = startdate;
    }

    public String getEnddate() {
        return enddate;
    }

    public void setEnddate(String enddate) {
        this.enddate = enddate;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    public List<PartSectionForm> getPlist() {
        return plist;
    }

    public void setPlist(List<PartSectionForm> plist) {
        this.plist = plist;
    }

    private String modulebarcode;

    public String getModulebarcode() {
        return modulebarcode;
    }

    public void setModulebarcode(String modulebarcode) {
        this.modulebarcode = modulebarcode;
    }

    public String getInstaller() {
        return installer;
    }

    public void setInstaller(String installer) {
        this.installer = installer;
    }

    public String getDeviser() {
        return deviser;
    }

    public void setDeviser(String deviser) {
        this.deviser = deviser;
    }

    private String secid;
    private String stateid;
    private String startdate;
    private String enddate;
    private String remark;
    private String installer;
    private String deviser;

    private List<PartSectionForm> plist;
}
