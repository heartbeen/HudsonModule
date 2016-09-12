package com.kc.module.model.form;

public class AddTaskForm {
    public String getModuleId() {
        return moduleId;
    }

    public void setModuleId(String moduleId) {
        this.moduleId = moduleId;
    }

    public String getModuleCode() {
        return moduleCode;
    }

    public void setModuleCode(String moduleCode) {
        this.moduleCode = moduleCode;
    }

    public String getPreciousId() {
        return preciousId;
    }

    public void setPreciousId(String preciousId) {
        this.preciousId = preciousId;
    }

    public String getStructId() {
        return structId;
    }

    public void setStructId(String structId) {
        this.structId = structId;
    }

    public String getTonId() {
        return tonId;
    }

    public void setTonId(String tonId) {
        this.tonId = tonId;
    }

    public String getTaskProperty() {
        return taskProperty;
    }

    public void setTaskProperty(String taskProperty) {
        this.taskProperty = taskProperty;
    }

    public int getTaskScore() {
        return taskScore;
    }

    public void setTaskScore(int taskScore) {
        this.taskScore = taskScore;
    }

    public int getTaskStandard() {
        return taskStandard;
    }

    public void setTaskStandard(int taskStandard) {
        this.taskStandard = taskStandard;
    }

    public int getTaskChange() {
        return taskChange;
    }

    public void setTaskChange(int taskChange) {
        this.taskChange = taskChange;
    }

    public boolean isTaskDouble() {
        return taskDouble;
    }

    public void setTaskDouble(boolean taskDouble) {
        this.taskDouble = taskDouble;
    }

    private String moduleId;
    private String moduleCode;
    private String preciousId;
    private String structId;
    private String tonId;
    private String taskProperty;
    private int taskScore;
    private int taskStandard;
    private int taskChange;
    private boolean taskDouble;
}
