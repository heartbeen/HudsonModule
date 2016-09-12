package com.kc.module.model;

import java.util.HashMap;
import java.util.Map;

public class WeekWorkLoadForm {

    public String getDeptname() {
        return deptname;
    }

    public void setDeptname(String deptname) {
        this.deptname = deptname;
    }

    public double getActhour() {
        return acthour;
    }

    public void setActhour(double acthour) {
        this.acthour = acthour;
    }

    public int getEsthour() {
        return esthour;
    }

    public void setEsthour(int esthour) {
        this.esthour = esthour;
    }

    public Map<String, Integer> getMap() {
        return map;
    }

    public void setMap(Map<String, Integer> map) {
        this.map = map;
    }

    public String getTaskid() {
        return taskid;
    }

    public void setTaskid(String taskid) {
        this.taskid = taskid;
    }

    private String taskid;
    private String deptname;
    private double acthour;
    private int esthour;

    private Map<String, Integer> map = new HashMap<String, Integer>();

}
