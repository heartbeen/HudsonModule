package com.kc.module.model.form;

import java.util.Date;

import com.kc.module.model.sys.SysLocaleTag;

public class SysLocaleTagForm extends FormBean<SysLocaleTag> {

    @Table(name = "lang_code")
    private String langCode;

    @Table(name = "project_id")
    private Integer projectId;

    private String category;

    @Table(name = "category")
    private String createBy;

    @Table(name = "create_date")
    private Date createDate;

    @Table(name = "modify_by")
    private String modifyBy;

    @Table(name = "modify_date")
    private Date modifyDate;

    public SysLocaleTagForm(Class<SysLocaleTag> modelClass) {
        super(SysLocaleTag.class);
    }

    public String getLangCode() {
        return langCode;
    }

    public void setLangCode(String langCode) {
        this.langCode = langCode;
    }

    public Integer getProjectId() {
        return projectId;
    }

    public void setProjectId(Integer projectId) {
        this.projectId = projectId;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getCreateBy() {
        return createBy;
    }

    public void setCreateBy(String createBy) {
        this.createBy = createBy;
    }

    public Date getCreateDate() {
        return createDate;
    }

    public void setCreateDate(Date createDate) {
        this.createDate = createDate;
    }

    public String getModifyBy() {
        return modifyBy;
    }

    public void setModifyBy(String modifyBy) {
        this.modifyBy = modifyBy;
    }

    public Date getModifyDate() {
        return modifyDate;
    }

    public void setModifyDate(Date modifyDate) {
        this.modifyDate = modifyDate;
    }

    @Override
    public boolean validator() {
        return true;
    }

}
