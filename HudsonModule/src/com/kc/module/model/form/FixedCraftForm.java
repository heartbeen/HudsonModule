package com.kc.module.model.form;

import java.util.ArrayList;
import java.util.List;

public class FixedCraftForm {
    public String getCraftid() {
        return craftid;
    }

    public void setCraftid(String craftid) {
        this.craftid = craftid;
    }

    public String getCraftname() {
        return craftname;
    }

    public void setCraftname(String craftname) {
        this.craftname = craftname;
    }

    public double getEvaluate() {
        return evaluate;
    }

    public void setEvaluate(double evaluate) {
        this.evaluate = evaluate;
    }

    public List<FixedScheForm> getList() {
        return list;
    }

    public void setList(List<FixedScheForm> list) {
        this.list = list;
    }

    private String craftid;
    private String craftname;
    private double evaluate;
    private double macload;

    public double getMacload() {
        return macload;
    }

    public void setMacload(double macload) {
        this.macload = macload;
    }

    private List<FixedScheForm> list = new ArrayList<FixedScheForm>();
}
