package com.kc.module.model.form;

/**
 * 获取工艺指定日期的负荷情况
 * 
 * @author ASUS
 * 
 */
public class ArtifactCraftDateForm {

    public double getEvaluate() {
        return evaluate;
    }

    public void setEvaluate(double evaluate) {
        this.evaluate = evaluate;
    }

    public double getMacload() {
        return macload;
    }

    public void setMacload(double macload) {
        this.macload = macload;
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

    // 指定日期
    private String starttime;
    // 指定日期
    private String endtime;
    // 机台负荷
    private double macload;
    // 预计时间
    private double evaluate;
}
