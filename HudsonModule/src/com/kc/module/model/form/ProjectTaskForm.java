package com.kc.module.model.form;

import java.util.ArrayList;
import java.util.List;

public class ProjectTaskForm {
    private String taskid;
    private String moduleid;
    private String preciousid;
    private String structid;
    private String tonid;
    private String property;
    private int score;
    private int standardcount;
    private int changecount;
    private boolean doublescore;
    private List<ProjectTaskStuffForm> newrecord = new ArrayList<ProjectTaskStuffForm>();
    private List<ProjectTaskStuffForm> updaterecord = new ArrayList<ProjectTaskStuffForm>();
    private List<ProjectTaskStuffForm> removerecord = new ArrayList<ProjectTaskStuffForm>();

    public String getTaskid() {
        return taskid;
    }

    public void setTaskid(String taskid) {
        this.taskid = taskid;
    }

    public String getModuleid() {
        return moduleid;
    }

    public void setModuleid(String moduleid) {
        this.moduleid = moduleid;
    }

    public String getPreciousid() {
        return preciousid;
    }

    public void setPreciousid(String preciousid) {
        this.preciousid = preciousid;
    }

    public String getStructid() {
        return structid;
    }

    public void setStructid(String structid) {
        this.structid = structid;
    }

    public String getTonid() {
        return tonid;
    }

    public void setTonid(String tonid) {
        this.tonid = tonid;
    }

    public String getProperty() {
        return property;
    }

    public void setProperty(String property) {
        this.property = property;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public int getStandardcount() {
        return standardcount;
    }

    public void setStandardcount(int standardcount) {
        this.standardcount = standardcount;
    }

    public int getChangecount() {
        return changecount;
    }

    public void setChangecount(int changecount) {
        this.changecount = changecount;
    }

    public boolean getDoublescore() {
        return doublescore;
    }

    public void setDoublescore(boolean doublescore) {
        this.doublescore = doublescore;
    }

    public List<ProjectTaskStuffForm> getNewrecord() {
        return newrecord;
    }

    public void setNewrecord(List<ProjectTaskStuffForm> newrecord) {
        this.newrecord = newrecord;
    }

    public List<ProjectTaskStuffForm> getUpdaterecord() {
        return updaterecord;
    }

    public void setUpdaterecord(List<ProjectTaskStuffForm> updaterecord) {
        this.updaterecord = updaterecord;
    }

    public List<ProjectTaskStuffForm> getRemoverecord() {
        return removerecord;
    }

    public void setRemoverecord(List<ProjectTaskStuffForm> removerecord) {
        this.removerecord = removerecord;
    }

    public List<ProjectTaskStuffForm> getAllrecord() {
        return allrecord;
    }

    public void setAllrecord(List<ProjectTaskStuffForm> allrecord) {
        this.allrecord = allrecord;
    }

    private List<ProjectTaskStuffForm> allrecord = new ArrayList<ProjectTaskStuffForm>();
}
