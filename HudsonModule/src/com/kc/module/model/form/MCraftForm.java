package com.kc.module.model.form;

import java.util.HashMap;
import java.util.Map;

/**
 * 用于记录模具加工履历中的单个工艺的明细
 * 
 * @author ASUS
 * 
 */
public class MCraftForm {
    // 预计用时
    private double esthour;
    // 实际用时
    private double acthour;
    // MD_EST_SCHEDULE表的ID号
    private String estmateid;
    // 判断是否加工完成
    private boolean finish;

    public boolean isFinish() {
        return finish;
    }

    public void setFinish(boolean finish) {
        this.finish = finish;
    }

    // 每个员工所用的有效时间
    private Map<String, EmployeeWorkForm> opermap = new HashMap<String, EmployeeWorkForm>();
    // 获取完成时间段
    private Map<String, Double> overmap = new HashMap<String, Double>();

    public Map<String, Double> getOvermap() {
        return overmap;
    }

    public void setOvermap(Map<String, Double> overmap) {
        this.overmap = overmap;
    }

    public double getEsthour() {
        return esthour;
    }

    public void setEsthour(double esthour) {
        this.esthour = esthour;
    }

    public double getActhour() {
        return acthour;
    }

    public void setActhour(double acthour) {
        this.acthour = acthour;
    }

    public String getEstmateid() {
        return estmateid;
    }

    public void setEstmateid(String estmateid) {
        this.estmateid = estmateid;
    }

    public Map<String, EmployeeWorkForm> getOpermap() {
        return opermap;
    }

    public void setOpermap(Map<String, EmployeeWorkForm> opermap) {
        this.opermap = opermap;
    }
}
