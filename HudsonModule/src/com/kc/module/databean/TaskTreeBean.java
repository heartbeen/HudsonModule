package com.kc.module.databean;

/**
 * 用于设置单位树结构
 * 
 * @author ASUS
 * 
 */
public class TaskTreeBean {
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public boolean isChecked() {
        return checked;
    }

    public void setChecked(boolean checked) {
        this.checked = checked;
    }

    public boolean isLeaf() {
        return leaf;
    }

    public void setLeaf(boolean leaf) {
        this.leaf = leaf;
    }

    public String getStepid() {
        return stepid;
    }

    public void setStepid(String stepid) {
        this.stepid = stepid;
    }

    public String getStructid() {
        return structid;
    }

    public void setStructid(String structid) {
        this.structid = structid;
    }

    public String getGroupid() {
        return groupid;
    }

    public void setGroupid(String groupid) {
        this.groupid = groupid;
    }

    private String id;
    private String structid;
    private String groupid;
    private String text;
    private boolean checked;
    private boolean leaf;
    private String stepid;
}
