package com.kc.module.model.form;

public class MScheduleEstForm {
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getStarttime() {
        return starttime;
    }

    public void setStarttime(String starttime) {
        this.starttime = starttime;
    }

    public String getEndtime() {
        return endtime;
    }

    public void setEndtime(String endtime) {
        this.endtime = endtime;
    }

    public String getCraftid() {
        return craftid;
    }

    public void setCraftid(String craftid) {
        this.craftid = craftid;
    }

    public int getRanknum() {
        return ranknum;
    }

    public void setRanknum(int ranknum) {
        this.ranknum = ranknum;
    }

    public double getEvaluate() {
        return evaluate;
    }

    public void setEvaluate(double evaluate) {
        this.evaluate = evaluate;
    }

    // 排程ID
    private String id;
    // 开始时间
    private String starttime;
    // 结束时间
    private String endtime;
    // 工艺代号
    private String craftid;
    // 排程序号
    private int ranknum;
    // 预计用时
    private double evaluate;
}
