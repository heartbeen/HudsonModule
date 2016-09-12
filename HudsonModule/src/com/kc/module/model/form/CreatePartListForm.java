package com.kc.module.model.form;

public class CreatePartListForm {
    public String getPartlistcode() {
        return partlistcode;
    }

    public void setPartlistcode(String partlistcode) {
        this.partlistcode = partlistcode;
    }

    public int getIsexist() {
        return isexist;
    }

    public void setIsexist(int isexist) {
        this.isexist = isexist;
    }

    public String getPartbatch() {
        return partbatch;
    }

    public void setPartbatch(String partbatch) {
        this.partbatch = partbatch;
    }

    private String partlistcode;
    private int isexist;

    public String getPiccode() {
        return piccode;
    }

    public void setPiccode(String piccode) {
        this.piccode = piccode;
    }

    public String getHardness() {
        return hardness;
    }

    public void setHardness(String hardness) {
        this.hardness = hardness;
    }

    public String getBuffing() {
        return buffing;
    }

    public void setBuffing(String buffing) {
        this.buffing = buffing;
    }

    public String getTolerance() {
        return tolerance;
    }

    public void setTolerance(String tolerance) {
        this.tolerance = tolerance;
    }

    public int getMaterialsrc() {
        return materialsrc;
    }

    public void setMaterialsrc(int materialsrc) {
        this.materialsrc = materialsrc;
    }

    public int getMaterialtype() {
        return materialtype;
    }

    public void setMaterialtype(int materialtype) {
        this.materialtype = materialtype;
    }

    public int getIsfixed() {
        return isfixed;
    }

    public void setIsfixed(int isfixed) {
        this.isfixed = isfixed;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public int getReform() {
        return reform;
    }

    public void setReform(int reform) {
        this.reform = reform;
    }

    private String partbatch;
    private String piccode;
    private String hardness;
    private String buffing;
    private String tolerance;
    private int materialsrc;
    private int materialtype;
    private int isfixed;
    private int quantity;
    private int reform;

    private String partbarlistcode;

    public String getPartbarlistcode() {
        return partbarlistcode;
    }

    public void setPartbarlistcode(String partbarlistcode) {
        this.partbarlistcode = partbarlistcode;
    }
}
