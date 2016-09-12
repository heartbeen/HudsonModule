package com.kc.module.model.form;

/**
 * 统计参数表单
 * 
 * @author xuwei
 * 
 */
public class MachineWorkForm {

    /**
     * 时间段
     */
    private String startTime;
    private String endTime;

    /* 以工艺汇总 */
    /**
     * 汇总类型：0：天，1：月，2：周，3：年
     */
    private int collectType = 0;

    /* 以工艺汇总 */
    /**
     * 自定义汇总ID
     */
    private int classId;

    /**
     * 部门ID
     * 
     */
    private int deptId;

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }

    public int getCollectType() {
        return collectType;
    }

    public void setCollectType(int collectType) {
        this.collectType = collectType;
    }

    public int getClassId() {
        return classId;
    }

    public void setClassId(int classId) {
        this.classId = classId;
    }

    public int getDeptId() {
        return deptId;
    }

    public void setDeptId(int deptId) {
        this.deptId = deptId;
    }

    public String getSqlDateForamt() {

        switch (collectType) {
        case 0: {
            return "YYYY-MM-DD";
        }

        case 1: {
            return "YYYY-MM";
        }

        case 2: {
            return "";
        }

        case 3: {
            return "YYYY";
        }
        }

        return "YYYY-MM-DD";
    }

    public String getCollectDateForamt() {
        switch (collectType) {
        case 0: {
            return "yyyy-MM-dd";
        }

        case 1: {
            return "yyyy-MM";
        }

        case 2: {
            return "";
        }

        case 3: {
            return "yyyy";
        }
        }

        return "yyyy-MM-dd";
    }

}
