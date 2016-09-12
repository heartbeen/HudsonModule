package com.kc.module.model.form;

public class EmployeeProcessForm {
    public String getEmpId() {
        return empId;
    }

    public void setEmpId(String empId) {
        this.empId = empId;
    }

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

    public double getTotalHour() {
        return totalHour;
    }

    public void setTotalHour(double totalHour) {
        this.totalHour = totalHour;
    }

    public double getActHour() {
        return actHour;
    }

    public void setActHour(double actHour) {
        this.actHour = actHour;
    }

    // 在原来的基础上+=actHour
    public void setAppendActHour(double actHour) {
        this.actHour += actHour;
    }

    public String getEmpName() {
        return empName;
    }

    public void setEmpName(String empName) {
        this.empName = empName;
    }

    public String getlName() {
        return lName;
    }

    public void setlName(String lName) {
        this.lName = lName;
    }

    public String getpName() {
        return pName;
    }

    public void setpName(String pName) {
        this.pName = pName;
    }

    // 员工ID号
    public String empId;
    // 员工姓名
    public String empName;
    // 员工对工件进行加工的部门
    public String lName;
    // 员工部门
    public String pName;
    // 开始加工的时间
    public String startTime;
    // 查询的最后时间
    public String endTime;
    // 总加工时长(小时)
    public double totalHour;
    // 有效加工时间(小时)
    public double actHour;
}
