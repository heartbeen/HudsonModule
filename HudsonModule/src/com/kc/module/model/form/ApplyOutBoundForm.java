package com.kc.module.model.form;

import java.util.Date;
import java.util.List;

public class ApplyOutBoundForm {
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

    public String getFactorycode() {
        return factorycode;
    }

    public void setFactorycode(String factorycode) {
        this.factorycode = factorycode;
    }

    public String getFactoryid() {
        return factoryid;
    }

    public void setFactoryid(String factoryid) {
        this.factoryid = factoryid;
    }

    public String getFactoryname() {
        return factoryname;
    }

    public void setFactoryname(String factoryname) {
        this.factoryname = factoryname;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getContactor() {
        return contactor;
    }

    public void setContactor(String contactor) {
        this.contactor = contactor;
    }

    public String getOutphone() {
        return outphone;
    }

    public void setOutphone(String outphone) {
        this.outphone = outphone;
    }

    public String getApplycomment() {
        return applycomment;
    }

    public void setApplycomment(String applycomment) {
        this.applycomment = applycomment;
    }

    public String getCraftname() {
        return craftname;
    }

    public void setCraftname(String craftname) {
        this.craftname = craftname;
    }

    public String getFee() {
        return fee;
    }

    public void setFee(String fee) {
        this.fee = fee;
    }

    public String getIntro() {
        return intro;
    }

    public void setIntro(String intro) {
        this.intro = intro;
    }

    public List<String> getCraftid() {
        return craftid;
    }

    public void setCraftid(List<String> craftid) {
        this.craftid = craftid;
    }

    public List<String> getCraftcode() {
        return craftcode;
    }

    public void setCraftcode(List<String> craftcode) {
        this.craftcode = craftcode;
    }

    private String partbarlistcode;
    private String partlistcode;
    private String modulebarcode;
    private String modulecode;
    private String resumeid;
    private String factorycode;
    private String factoryid;
    private String factoryname;
    private String address;
    private String contactor;
    private String outphone;
    private String applycomment;
    private List<String> craftid;
    private List<String> craftcode;
    private String craftname;
    private String fee;
    private String intro;

    public Date getPlanouttime() {
        return planouttime;
    }

    public void setPlanouttime(Date planouttime) {
        this.planouttime = planouttime;
    }

    public Date getPlanbacktime() {
        return planbacktime;
    }

    public void setPlanbacktime(Date planbacktime) {
        this.planbacktime = planbacktime;
    }

    // 计划外发时间
    private Date planouttime;
    // 计划回厂时间
    private Date planbacktime;
}
