package com.kc.module.model.form;

/**
 * 模具履历阶段加工的工件讯息
 * 
 * @author Administrator
 * 
 */
public class PartSectionForm {
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

    public String getMrsid() {
        return mrsid;
    }

    public void setMrsid(String mrsid) {
        this.mrsid = mrsid;
    }

    public String getSecid() {
        return secid;
    }

    public void setSecid(String secid) {
        this.secid = secid;
    }

    public String getPartname() {
        return partname;
    }

    public void setPartname(String partname) {
        this.partname = partname;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    public String getIsnew() {
        return isnew;
    }

    public void setIsnew(String isnew) {
        this.isnew = isnew;
    }

    public int getIsfixed() {
        return isfixed;
    }

    public void setIsfixed(int isfixed) {
        this.isfixed = isfixed;
    }

    private String partbarlistcode;
    private String partlistcode;
    private String mrsid;
    private String secid;
    private String partname;
    private String remark;
    private String isnew;
    private int isfixed;
}
