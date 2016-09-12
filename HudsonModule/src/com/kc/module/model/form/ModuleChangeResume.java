package com.kc.module.model.form;

import java.util.Date;
import java.util.List;

import com.kc.module.model.ModuleResume;

/**
 * 模具设变/修模信息类
 * 
 * @author David
 * 
 */
public class ModuleChangeResume extends FormBean<ModuleResume> {

    private String id;
    private String curestate;
    private String resumestate;
    private Date starttime;
    private Date endtime;
    private String remark;
    private String modulebarcode;

    private List<PartChangeResume> partResume;

    public ModuleChangeResume() {
        super(ModuleResume.class);
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCurestate() {
        return curestate;
    }

    public void setCurestate(String curestate) {
        this.curestate = curestate;
    }

    public String getResumestate() {
        return resumestate;
    }

    public void setResumestate(String resumestate) {
        this.resumestate = resumestate;
    }

    public Date getStarttime() {
        return starttime;
    }

    public void setStarttime(Date starttime) {
        this.starttime = starttime;
    }

    public Date getEndtime() {
        return endtime;
    }

    public void setEndtime(Date endtime) {
        this.endtime = endtime;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    public String getModulebarcode() {
        return modulebarcode;
    }

    public void setModulebarcode(String modulebarcode) {
        this.modulebarcode = modulebarcode;
    }

    public List<PartChangeResume> getPartResume() {
        return partResume;
    }

    public void setPartResume(List<PartChangeResume> partResume) {
        this.partResume = partResume;
    }

    @Override
    public boolean validator() {
        return true;
    }

}
