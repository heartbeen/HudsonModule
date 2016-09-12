package com.kc.module.model.form;

import java.sql.Timestamp;

/**
 * 实际的工件加工流程
 * 
 * @author Rock 150420
 * 
 */
public class ActualFlowForm {
    public String getPartbarlistcode() {
        return partbarlistcode;
    }

    public void setPartbarlistcode(String partbarlistcode) {
        this.partbarlistcode = partbarlistcode;
    }

    public String getPartstateid() {
        return partstateid;
    }

    public void setPartstateid(String partstateid) {
        this.partstateid = partstateid;
    }

    public String getDepartname() {
        return departname;
    }

    public void setDepartname(String departname) {
        this.departname = departname;
    }

    public String getNcraft() {
        return ncraft;
    }

    public void setNcraft(String ncraft) {
        this.ncraft = ncraft;
    }

    public Timestamp getNrcdtime() {
        return nrcdtime;
    }

    public void setNrcdtime(Timestamp nrcdtime) {
        this.nrcdtime = nrcdtime;
    }

    public String getLprocraftid() {
        return lprocraftid;
    }

    public void setLprocraftid(String lprocraftid) {
        this.lprocraftid = lprocraftid;
    }

    public String getLpartstateid() {
        return lpartstateid;
    }

    public void setLpartstateid(String lpartstateid) {
        this.lpartstateid = lpartstateid;
    }

    public String getLdeptid() {
        return ldeptid;
    }

    public void setLdeptid(String ldeptid) {
        this.ldeptid = ldeptid;
    }

    public boolean isFlag() {
        return flag;
    }

    public void setFlag(boolean flag) {
        this.flag = flag;
    }

    public boolean isLog() {
        return log;
    }

    public void setLog(boolean log) {
        this.log = log;
    }
    
    public boolean isIsout() {
        return isout;
    }

    public void setIsout(boolean isout) {
        this.isout = isout;
    }
    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    private String partbarlistcode;
    private String partstateid;
    private String departname;
    private String ncraft;
    private Timestamp nrcdtime;
    private String lprocraftid;
    private String lpartstateid;
    private String ldeptid;
    private boolean flag;
    private boolean log;
    private boolean isout;
    private String region;
}
