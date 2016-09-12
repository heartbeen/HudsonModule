package com.kc.module.model.form;

import java.util.ArrayList;
import java.util.List;

import com.kc.module.model.ModelFinal;

public class DefaultScheduleSettings {
    public String getSetid() {
        return setid;
    }

    public void setSetid(String setid) {
        this.setid = setid;
    }

    public String getSetname() {
        return setname;
    }

    public void setSetname(String setname) {
        this.setname = setname;
    }

    @SuppressWarnings("rawtypes")
    public List<ModelFinal> getChildren() {
        return children;
    }

    public void setChildren(@SuppressWarnings("rawtypes") List<ModelFinal> children) {
        this.children = children;
    }

    private String setid;
    private String setname;

    @SuppressWarnings("rawtypes")
    private List<ModelFinal> children = new ArrayList<ModelFinal>();
}
