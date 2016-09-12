package com.kc.module.model.form;

/**
 * 任务清单细节
 * 
 * @author ASUS
 * 
 */
public class ProjectTaskStuffForm {
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTaskid() {
        return taskid;
    }

    public void setTaskid(String taskid) {
        this.taskid = taskid;
    }

    public String getGroupid() {
        return groupid;
    }

    public void setGroupid(String groupid) {
        this.groupid = groupid;
    }

    public String getEmpid() {
        return empid;
    }

    public void setEmpid(String empid) {
        this.empid = empid;
    }

    public String getEmpname() {
        return empname;
    }

    public void setEmpname(String empname) {
        this.empname = empname;
    }

    public String getDeptname() {
        return deptname;
    }

    public void setDeptname(String deptname) {
        this.deptname = deptname;
    }

    public boolean getIsgeneral() {
        return isgeneral;
    }

    public void setIsgeneral(boolean isgeneral) {
        this.isgeneral = isgeneral;
    }

    public boolean getIsmajor() {
        return ismajor;
    }

    public void setIsmajor(boolean ismajor) {
        this.ismajor = ismajor;
    }

    public boolean getIsgroup() {
        return isgroup;
    }

    public void setIsgroup(boolean isgroup) {
        this.isgroup = isgroup;
    }

    public boolean getIssum() {
        return issum;
    }

    public void setIssum(boolean issum) {
        this.issum = issum;
    }

    public boolean getIschecker() {
        return ischecker;
    }

    public void setIschecker(boolean ischecker) {
        this.ischecker = ischecker;
    }

    public boolean getIsspecific() {
        return isspecific;
    }

    public void setIsspecific(boolean isspecific) {
        this.isspecific = isspecific;
    }

    private String id;
    private String taskid;
    private String groupid;
    private String empid;
    private String empname;
    private String deptname;
    private boolean isgeneral;
    private boolean ismajor;
    private boolean isgroup;
    private boolean issum;
    private boolean ischecker;
    private boolean isspecific;
}
