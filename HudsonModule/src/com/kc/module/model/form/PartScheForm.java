package com.kc.module.model.form;

import java.sql.Timestamp;

/**
 * 工件预计排程讯息
 * 
 * @author ASUS
 * 
 */
public class PartScheForm {
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Timestamp getStartdate() {
        return startdate;
    }

    public void setStartdate(Timestamp startdate) {
        this.startdate = startdate;
    }

    public Timestamp getEnddate() {
        return enddate;
    }

    public void setEnddate(Timestamp enddate) {
        this.enddate = enddate;
    }

    public double getEvaluate() {
        return evaluate;
    }

    public void setEvaluate(double evaluate) {
        this.evaluate = evaluate;
    }

    public double getUsehour() {
        return usehour;
    }

    public void setUsehour(double usehour) {
        this.usehour = usehour;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    private String id;
    // 开始时间
    private Timestamp startdate;
    // 结束时间
    private Timestamp enddate;
    // 实际开始
    private Timestamp actstart;

    private boolean proceed;

    public boolean isProceed() {
        return proceed;
    }

    public void setProceed(boolean proceed) {
        this.proceed = proceed;
    }

    public Timestamp getActstart() {
        return actstart;
    }

    public void setActstart(Timestamp actstart) {
        this.actstart = actstart;
    }

    public Timestamp getActend() {
        return actend;
    }

    public void setActend(Timestamp actend) {
        this.actend = actend;
    }

    public double getDuration() {
        return duration;
    }

    public void setDuration(double duration) {
        this.duration = duration;
    }

    // 实际结束
    private Timestamp actend;
    // 预计用时
    private double evaluate;
    // 时间间隔
    private double duration;
    // 实际用时
    private double usehour;
    // 模具状态|0未加工|1加工中|2加工完毕
    private int status;
}
