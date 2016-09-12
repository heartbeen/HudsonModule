package com.kc.module.model.form;

import java.util.ArrayList;
import java.util.List;

public class QueryCurrentMachineInfo {
    public String getDepartid() {
        return departid;
    }

    public void setDepartid(String departid) {
        this.departid = departid;
    }

    public String getDeviceid() {
        return deviceid;
    }

    public void setDeviceid(String deviceid) {
        this.deviceid = deviceid;
    }

    public String getCraftid() {
        return craftid;
    }

    public void setCraftid(String craftid) {
        this.craftid = craftid;
    }

    public String getStateid() {
        return stateid;
    }

    public void setStateid(String stateid) {
        this.stateid = stateid;
    }

    public String getEmpid() {
        return empid;
    }

    public void setEmpid(String empid) {
        this.empid = empid;
    }

    public List<DeviceProcessPartForm> getParts() {
        return parts;
    }

    public void setParts(List<DeviceProcessPartForm> parts) {
        this.parts = parts;
    }

    public String getActionid() {
        return actionid;
    }

    public void setActionid(String actionid) {
        this.actionid = actionid;
    }

    public String getPosid() {
        return posid;
    }

    public void setPosid(String posid) {
        this.posid = posid;
    }

    public String getUpdateman() {
        return updateman;
    }

    public void setUpdateman(String updateman) {
        this.updateman = updateman;
    }

    private String departid;
    private String deviceid;
    private String craftid;
    private String stateid;
    private String empid;
    private String actionid;
    private String posid;
    private String updateman;
    private List<DeviceProcessPartForm> parts = new ArrayList<DeviceProcessPartForm>();
}
