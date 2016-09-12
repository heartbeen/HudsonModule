package com.kc.module.model.form;

/**
 * 机台设备的相关资料
 * 
 * @author Rock
 * 
 */
public class DeviceForm {
    public boolean isUsetype() {
        return usetype;
    }

    public void setUsetype(boolean usetype) {
        this.usetype = usetype;
    }

    public String getDevpartid() {
        return devpartid;
    }

    public void setDevpartid(String devpartid) {
        this.devpartid = devpartid;
    }

    public String getDeviceid() {
        return deviceid;
    }

    public void setDeviceid(String deviceid) {
        this.deviceid = deviceid;
    }

    public String getDevicetype() {
        return devicetype;
    }

    public void setDevicetype(String devicetype) {
        this.devicetype = devicetype;
    }

    public String getAssetnumber() {
        return assetnumber;
    }

    public void setAssetnumber(String assetnumber) {
        this.assetnumber = assetnumber;
    }

    public boolean isVirtual() {
        return virtual;
    }

    public void setVirtual(boolean virtual) {
        this.virtual = virtual;
    }

    public String getPartid() {
        return partid;
    }

    public void setPartid(String partid) {
        this.partid = partid;
    }

    public String getBatchno() {
        return batchno;
    }

    public void setBatchno(String batchno) {
        this.batchno = batchno;
    }

    public String getCraftid() {
        return craftid;
    }

    public void setCraftid(String craftid) {
        this.craftid = craftid;
    }

    public double getMacload() {
        return macload;
    }

    public void setMacload(double macload) {
        this.macload = macload;
    }

    // 判断前台传来的数据是新增还是更新
    private boolean usetype;
    // 设备部分唯一号
    private String devpartid;
    // 设备唯一号
    private String deviceid;
    // 设备类型
    private String devicetype;
    // 资产编号
    private String assetnumber;
    // 是否虚拟设备
    private boolean virtual;
    // 部门唯一号
    private String partid;
    // 机台编号
    private String batchno;
    // 工艺编号
    private String craftid;
    // 机台负荷
    private double macload;
}
