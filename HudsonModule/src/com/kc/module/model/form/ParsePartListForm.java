package com.kc.module.model.form;

import java.util.ArrayList;
import java.util.List;

public class ParsePartListForm {
    public String getPartcode() {
        return partcode;
    }

    public void setPartcode(String partcode) {
        this.partcode = partcode;
    }

    public String getPartname() {
        return partname;
    }

    public void setPartname(String partname) {
        this.partname = partname;
    }

    public String getPartcount() {
        return partcount;
    }

    public void setPartcount(String partcount) {
        this.partcount = partcount;
    }

    public boolean getIsmerge() {
        return ismerge;
    }

    public void setIsmerge(boolean ismerge) {
        this.ismerge = ismerge;
    }

    public boolean getIsmeasure() {
        return ismeasure;
    }

    public void setIsmeasure(boolean ismeasure) {
        this.ismeasure = ismeasure;
    }

    public String getMaterial() {
        return material;
    }

    public void setMaterial(String material) {
        this.material = material;
    }

    public String getNorms() {
        return norms;
    }

    public void setNorms(String norms) {
        this.norms = norms;
    }

    public boolean isIsshop() {
        return isshop;
    }

    public void setIsshop(boolean isshop) {
        this.isshop = isshop;
    }

    public List<BasePartListForm> getPlist() {
        return plist;
    }

    public void setPlist(List<BasePartListForm> plist) {
        this.plist = plist;
    }

    public String getPartbarcode() {
        return partbarcode;
    }

    public void setPartbarcode(String partbarcode) {
        this.partbarcode = partbarcode;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    private String partcode;
    private String partname;
    private String partcount;
    private String material;
    private String norms;
    private boolean ismerge;
    private boolean ismeasure;
    private boolean isshop;
    private String partbarcode;
    private String remark;

    // 客户需求变更20151230 Rock
    // 图号
    private String piccode;
    private int fixed;

    public int getFixed() {
        return fixed;
    }

    public void setFixed(int fixed) {
        this.fixed = fixed;
    }

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

    public String getTolerance() {
        return tolerance;
    }

    public void setTolerance(String tolerance) {
        this.tolerance = tolerance;
    }

    public int getReform() {
        return reform;
    }

    public void setReform(int reform) {
        this.reform = reform;
    }

    // 硬度
    private String hardness;
    // 表面处理
    private String buffing;
    // 材料来源
    private int materialsrc;
    // 材料类型
    private int materialtype;
    // 公差
    private String tolerance;
    // 标准件改造
    private int reform;

    private List<BasePartListForm> plist = new ArrayList<BasePartListForm>();
}
