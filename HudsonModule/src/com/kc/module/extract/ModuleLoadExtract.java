package com.kc.module.extract;

import com.kc.module.dao.ExtractDao;

public class ModuleLoadExtract extends ExtractDao {

    private String[] craftStepSet;
    private String outStateid;

    public String getOutStateid() {
        return outStateid;
    }

    public void setOutStateid(String outStateid) {
        this.outStateid = outStateid;
    }

    public String[] getCraftStepSet() {
        return craftStepSet;
    }

    public void setCraftStepSet(String[] craftStepSet) {
        this.craftStepSet = craftStepSet;
    }

    @Override
    public Object extract() {
        return null;
    }

}
