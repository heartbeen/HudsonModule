package com.kc.module.model.form;

import com.kc.module.model.ModuleProcessInfo;

/**
 * 工件设变/修模信息类
 * 
 * @author David
 * 
 */
public class PartChangeResume extends FormBean<ModuleProcessInfo> {

    private String id;
    private String partbarlistcode;
    private String remark;
    private String moduleresumeid;

    public PartChangeResume() {
        super(ModuleProcessInfo.class);
    }

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

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    public String getModuleresumeid() {
        return moduleresumeid;
    }

    public void setModuleresumeid(String moduleresumeid) {
        this.moduleresumeid = moduleresumeid;
    }

    @Override
    public boolean validator() {
        return true;
    }

}
