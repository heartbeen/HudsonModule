package com.kc.module.model.form;

import com.kc.module.model.Employee;

public class AddUserForm extends FormBean<Employee> {
    public AddUserForm() {
        super(Employee.class);
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getWorknumber() {
        return worknumber;
    }

    public void setWorknumber(String worknumber) {
        this.worknumber = worknumber;
    }

    public String getEmpname() {
        return empname;
    }

    public void setEmpname(String empname) {
        this.empname = empname;
    }

    public String getPosid() {
        return posid;
    }

    public void setPosid(String posid) {
        this.posid = posid;
    }

    public String getStationid() {
        return stationid;
    }

    public void setStationid(String stationid) {
        this.stationid = stationid;
    }

    public String getRegioncode() {
        return regioncode;
    }

    public void setRegioncode(String regioncode) {
        this.regioncode = regioncode;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getShortnumber() {
        return shortnumber;
    }

    public void setShortnumber(String shortnumber) {
        this.shortnumber = shortnumber;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDuty() {
        return duty;
    }

    public void setDuty(String duty) {
        this.duty = duty;
    }

    public String getIsenable() {
        return isenable;
    }

    public void setIsenable(String isenable) {
        this.isenable = isenable;
    }

    private String id;
    private String worknumber;
    private String empname;
    private String posid;
    private String stationid;
    private String regioncode;
    private String phone;
    private String shortnumber;
    private String email;
    private String duty;
    private String isenable;
    @Override
    public boolean validator() {
        return true;
    }
}
