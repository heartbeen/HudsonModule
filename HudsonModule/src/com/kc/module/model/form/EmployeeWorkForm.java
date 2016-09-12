package com.kc.module.model.form;

import java.sql.Timestamp;

/**
 * 员工工时统计
 * 
 * @author ASUS
 * 
 */
public class EmployeeWorkForm {
    public Timestamp getStart() {
        return start;
    }

    public void setStart(Timestamp start) {
        this.start = start;
    }

    public Timestamp getEnd() {
        return end;
    }

    public void setEnd(Timestamp end) {
        this.end = end;
    }

    public double getWorktime() {
        return worktime;
    }

    public void setWorktime(double worktime) {
        this.worktime = worktime;
    }

    private Timestamp start;
    private Timestamp end;
    private double worktime;
}
