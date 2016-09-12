package com.kc.module.model.form;

import com.kc.module.model.ModuleProcessInfo;

public class ModuleProcessInfoForm extends FormBean<ModuleProcessInfo> {

    private String id;
    private String partbarlistcode;
    private String remark;

    public ModuleProcessInfoForm() {
        super(ModuleProcessInfo.class);
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    public String getPartbarlistcode() {
        return partbarlistcode;
    }

    public void setPartbarlistcode(String partbarlistcode) {
        this.partbarlistcode = partbarlistcode;
    }

    @Override
    public boolean validator() {
        return true;
    }

}
