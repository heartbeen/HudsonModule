package com.kc.module.model.form;

/**
 * 请求加工单位对应工艺的清单
 * 
 * @author xuwei
 * 
 */
public class PartDetailed extends FormBean {
    public PartDetailed() {
        super(null);
    }

    private String moduleBarcode;
    private String resumeId;
    private String craftId;

    public String getModuleBarcode() {
        return moduleBarcode;
    }

    public void setModuleBarcode(String moduleBarcode) {
        this.moduleBarcode = moduleBarcode != null ? moduleBarcode : "";
    }

    public String getResumeId() {
        return resumeId;
    }

    public void setResumeId(String resumeId) {
        this.resumeId = resumeId != null ? resumeId : "";
    }

    public String getCraftId() {
        return craftId;
    }

    public void setCraftId(String craftId) {
        this.craftId = craftId != null ? craftId : "";
    }

    @Override
    public boolean validator() {
        return this.moduleBarcode.length() > 0
               && this.resumeId.length() > 0
               && this.craftId.length() > 0;
    }

    @Override
    public boolean save() {
        return false;
    }

}
