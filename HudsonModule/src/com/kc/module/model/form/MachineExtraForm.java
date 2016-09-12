package com.kc.module.model.form;

import java.util.HashMap;
import java.util.Map;

public class MachineExtraForm {
    public String getDevicepartid() {
        return devicepartid;
    }

    public void setDevicepartid(String devicepartid) {
        this.devicepartid = devicepartid;
    }

    public String getCraftid() {
        return craftid;
    }

    public void setCraftid(String craftid) {
        this.craftid = craftid;
    }

    public String getEmpid() {
        return empid;
    }

    public void setEmpid(String empid) {
        this.empid = empid;
    }

    public String getMergeid() {
        return mergeid;
    }

    public void setMergeid(String mergeid) {
        this.mergeid = mergeid;
    }

    public String getStateid() {
        return stateid;
    }

    public void setStateid(String stateid) {
        this.stateid = stateid;
    }

    public Map<String, MachineExtraPartForm> getMap() {
        return map;
    }

    public void setMap(Map<String, MachineExtraPartForm> map) {
        this.map = map;
    }

    private String devicepartid;
    private String craftid;
    private String empid;
    private String mergeid;
    private String stateid;

    public int getPartcount() {
        return partcount;
    }

    public void setPartcount(int partcount) {
        this.partcount = partcount;
    }

    private int partcount;

    private Map<String, MachineExtraPartForm> map = new HashMap<String, MachineExtraPartForm>();
}
