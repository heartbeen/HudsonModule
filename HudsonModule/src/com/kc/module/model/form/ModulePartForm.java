package com.kc.module.model.form;

import com.kc.module.model.ModulePart;

/**
 * 模具工件汇总前台数据bean
 * 
 * @author David
 * @email xuweissh@163.com
 * 
 */
public class ModulePartForm extends FormBean<ModulePart> {

    public ModulePartForm() {
        super(ModulePart.class);
    }

    private String modulebarcode;
    private String partcode;
    private String cnames;
    private String enames;
    private String raceid;
    private String norms;
    private String material;
    private String applierid;
    private String quantity;
    private String isfirmware;
    private String isbatch;

    @DropOut
    private String childIndex;

    public String getModulebarcode() {
        return modulebarcode;
    }

    public void setModulebarcode(String modulebarcode) {
        this.modulebarcode = modulebarcode;
    }

    public String getPartcode() {
        return partcode;
    }

    public void setPartcode(String partcode) {
        this.partcode = partcode;
    }

    public String getIsbatch() {
        return isbatch;
    }

    public void setIsbatch(String isbatch) {
        this.isbatch = isbatch;
    }

    public String getCnames() {
        return cnames;
    }

    public void setCnames(String cnames) {
        this.cnames = cnames;
    }

    public String getEnames() {
        return enames;
    }

    public void setEnames(String enames) {
        this.enames = enames;
    }

    public String getRaceid() {
        return raceid;
    }

    public void setRaceid(String raceid) {
        this.raceid = raceid;
    }

    public String getNorms() {
        return norms;
    }

    public void setNorms(String norms) {
        this.norms = norms;
    }

    public String getMaterial() {
        return material;
    }

    public void setMaterial(String material) {
        this.material = material;
    }

    public String getApplierid() {
        return applierid;
    }

    public void setApplierid(String applierid) {
        this.applierid = applierid;
    }

    public String getQuantity() {
        return quantity;
    }

    public void setQuantity(String quantity) {
        this.quantity = quantity;
    }

    public String getIsfirmware() {
        return isfirmware;
    }

    public void setIsfirmware(String isfirmware) {
        this.isfirmware = isfirmware;
    }

    public String getChildIndex() {
        return childIndex;
    }

    public void setChildIndex(String childIndex) {
        this.childIndex = childIndex;
    }

    @Override
    public boolean validator() {
        return false;
    }

}
