package com.kc.module.model.form;

import java.util.HashMap;
import java.util.Map;

/**
 * 用于统计模具的零件工艺讯息
 * 
 * @author ASUS 20160307
 * 
 */
public class MPartInfoForm {
    // 模具履历唯一号
    private String resumeid;
    // 工件唯一号
    private String partbarlistcode;
    // 工件编号
    private String partlistcode;
    // 模具履历讯息(包括加工状态和日期)
    private String resumeinfo;

    public String getResumeinfo() {
        return resumeinfo;
    }

    public void setResumeinfo(String resumeinfo) {
        this.resumeinfo = resumeinfo;
    }

    public String getRsmdate() {
        return rsmdate;
    }

    public void setRsmdate(String rsmdate) {
        this.rsmdate = rsmdate;
    }

    public String getRsmstate() {
        return rsmstate;
    }

    public void setRsmstate(String rsmstate) {
        this.rsmstate = rsmstate;
    }

    // 履历日期
    private String rsmdate;
    // 履历状态
    private String rsmstate;
    // 是否固件
    private int fixed;

    public int getFixed() {
        return fixed;
    }

    public void setFixed(int fixed) {
        this.fixed = fixed;
    }

    public String getResumeid() {
        return resumeid;
    }

    public void setResumeid(String resumeid) {
        this.resumeid = resumeid;
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

    public String getModulecode() {
        return modulecode;
    }

    public void setModulecode(String modulecode) {
        this.modulecode = modulecode;
    }

    public Map<String, MCraftInfoForm> getCraftmap() {
        return craftmap;
    }

    public void setCraftmap(Map<String, MCraftInfoForm> craftmap) {
        this.craftmap = craftmap;
    }

    // 模具编号
    private String modulecode;
    // 零件工艺集合
    private Map<String, MCraftInfoForm> craftmap = new HashMap<String, MCraftInfoForm>();
}
