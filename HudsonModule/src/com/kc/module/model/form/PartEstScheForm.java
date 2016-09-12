package com.kc.module.model.form;

import java.util.HashMap;

/**
 * 零件工艺排程
 * 
 * @author ASUS
 * 
 */
public class PartEstScheForm {
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

    public String getCraftname() {
        return craftname;
    }

    public void setCraftname(String craftname) {
        this.craftname = craftname;
    }

    public String getStatename() {
        return statename;
    }

    public void setStatename(String statename) {
        this.statename = statename;
    }

    public String getBatchno() {
        return batchno;
    }

    public void setBatchno(String batchno) {
        this.batchno = batchno;
    }

    public String getOperator() {
        return operator;
    }

    public void setOperator(String operator) {
        this.operator = operator;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public HashMap<String, PartCraftForm> getCraftmap() {
        return craftmap;
    }

    public void setCraftmap(HashMap<String, PartCraftForm> craftmap) {
        this.craftmap = craftmap;
    }

    // 模具工号
    private String modulecode;
    // 零件编号
    private String partlistcode;
    // 当前工艺
    private String craftname;
    // 工件状态
    private String statename;
    // 机台编号
    private String batchno;
    // 操机员
    private String operator;
    // 单位部门
    private String department;
    // 模具履历ID
    private String resumeid;
    // 模具履历加工状态
    private String resumestate;

    public String getResumestate() {
        return resumestate;
    }

    public void setResumestate(String resumestate) {
        this.resumestate = resumestate;
    }

    public String getResumeid() {
        return resumeid;
    }

    public void setResumeid(String resumeid) {
        this.resumeid = resumeid;
    }

    // 是否完成
    private boolean finish;

    public boolean isFinish() {
        return finish;
    }

    public void setFinish(boolean finish) {
        this.finish = finish;
    }

    // 零件排程
    private HashMap<String, PartCraftForm> craftmap = new HashMap<String, PartCraftForm>();
}
