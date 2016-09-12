package com.kc.module.model.form;

import java.util.ArrayList;
import java.util.List;

public class MachineProcessInfo {
    public String getStateid() {
        return stateid;
    }

    public void setStateid(String stateid) {
        this.stateid = stateid;
    }

    public String getMergeid() {
        return mergeid;
    }

    public void setMergeid(String mergeid) {
        this.mergeid = mergeid;
    }

    public int getPartcount() {
        return partcount;
    }

    public void setPartcount(int partcount) {
        this.partcount = partcount;
    }

    public List<String> getList() {
        return list;
    }

    public void setList(List<String> list) {
        this.list = list;
    }

    public String getCraftid() {
        return craftid;
    }

    public void setCraftid(String craftid) {
        this.craftid = craftid;
    }

    // 机台状态
    private String stateid;
    // 合并编号
    private String mergeid;
    private String craftid;

    // 机台上的零件个数
    private int partcount;
    private List<String> list = new ArrayList<String>();
}
