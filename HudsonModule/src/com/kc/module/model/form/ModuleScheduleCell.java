package com.kc.module.model.form;

/**
 * 排程明细
 * 
 * @author ASUS
 * 
 */
public class ModuleScheduleCell {
    public int getRanknum() {
        return ranknum;
    }

    public void setRanknum(int ranknum) {
        this.ranknum = ranknum;
    }

    public String getCraftname() {
        return craftname;
    }

    public void setCraftname(String craftname) {
        this.craftname = craftname;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    public String getEndtime() {
        return endtime;
    }

    public void setEndtime(String endtime) {
        this.endtime = endtime;
    }

    public int getFee() {
        return fee;
    }

    public void setFee(int fee) {
        this.fee = fee;
    }

    // 工序顺序
    private int ranknum;
    // 工序名称
    private String craftname;
    // 工序说明
    private String remark;
    // 工序交期
    private String endtime;
    // 成本预算
    private int fee;
}
