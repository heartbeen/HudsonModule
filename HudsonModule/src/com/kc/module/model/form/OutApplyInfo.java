package com.kc.module.model.form;

public class OutApplyInfo extends FormBean {
    public String partbarlistcode;
    public String partlistcode;
    public String modulebarcode;
    public String modulecode;
    public String resumeid;

    public OutApplyInfo() {
        super(null);
    }

    public String getPartbarlistcode() {
        return partbarlistcode;
    }

    public void setPartbarlistcode(String partbarlistcode) {
        this.partbarlistcode = partbarlistcode;
    }

    public String getPartlistcode() {
        return partlistcode;
    }

    public void setPartlistcode(String partlistcode) {
        this.partlistcode = partlistcode;
    }

    public String getModulebarcode() {
        return modulebarcode;
    }

    public void setModulebarcode(String modulebarcode) {
        this.modulebarcode = modulebarcode;
    }

    public String getModulecode() {
        return modulecode;
    }

    public void setModulecode(String modulecode) {
        this.modulecode = modulecode;
    }

    public String getResumeid() {
        return resumeid;
    }

    public void setResumeid(String resumeid) {
        this.resumeid = resumeid;
    }

    @Override
    public boolean validator() {
        // TODO Auto-generated method stub
        return false;
    }

}
