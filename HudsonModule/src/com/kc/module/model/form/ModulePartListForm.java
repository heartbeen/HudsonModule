package com.kc.module.model.form;

import com.kc.module.model.ModulePartList;

/**
 * 模具工件清单前台数据bean
 * 
 * @author David
 * @email xuweissh@163.com
 * 
 */
public class ModulePartListForm extends FormBean<ModulePartList> {

    private String modulebarcode;
    private String partlistcode;
    private String partrootcode;
    private String partlistbatch;
    private String modulecode;

    @DropOut
    private String moduleresumeid;

    public ModulePartListForm() {
        super(ModulePartList.class);
    }

    public String getModulebarcode() {
        return modulebarcode;
    }

    public void setModulebarcode(String modulebarcode) {
        this.modulebarcode = modulebarcode;
    }

    public String getPartlistcode() {
        return partlistcode;
    }

    public void setPartlistcode(String partlistcode) {
        this.partlistcode = partlistcode;
    }

    public String getPartrootcode() {
        return partrootcode;
    }

    public void setPartrootcode(String partrootcode) {
        this.partrootcode = partrootcode;
    }

    public String getPartlistbatch() {
        return partlistbatch;
    }

    public void setPartlistbatch(String partlistbatch) {
        this.partlistbatch = partlistbatch;
    }

    public String getModulecode() {
        return modulecode;
    }

    public void setModulecode(String modulecode) {
        this.modulecode = modulecode;
    }

    public String getModuleresumeid() {
        return moduleresumeid;
    }

    public void setModuleresumeid(String moduleresumeid) {
        this.moduleresumeid = moduleresumeid;
    }

    @Override
    public boolean validator() {
        // TODO Auto-generated method stub
        return false;
    }

}
