package com.kc.module.model.form;

import java.util.ArrayList;
import java.util.List;

public class ModuleScheduleContent {
    public String getModulecode() {
        return modulecode;
    }

    public void setModulecode(String modulecode) {
        this.modulecode = modulecode;
    }

    public String getPiccode() {
        return piccode;
    }

    public void setPiccode(String piccode) {
        this.piccode = piccode;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public String getMaterial() {
        return material;
    }

    public void setMaterial(String material) {
        this.material = material;
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

    public String getStarttime() {
        return starttime;
    }

    public void setStarttime(String starttime) {
        this.starttime = starttime;
    }

    public String getInittrytime() {
        return inittrytime;
    }

    public void setInittrytime(String inittrytime) {
        this.inittrytime = inittrytime;
    }

    public List<ModuleScheduleCell> getCell() {
        return cell;
    }

    public void setCell(List<ModuleScheduleCell> cell) {
        this.cell = cell;
    }

    public String getPartlistcode() {
        return partlistcode;
    }

    public void setPartlistcode(String partlistcode) {
        this.partlistcode = partlistcode;
    }

    public String getIntro() {
        return intro;
    }

    public void setIntro(String intro) {
        this.intro = intro;
    }

    // 模具号
    private String modulecode;
    // 零件号
    private String partlistcode;
    // 图号
    private String piccode;
    // 数量
    private int quantity;
    // 材料
    private String material;
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
    // 标改
    private int reform;
    // 零件说明
    private String intro;
    // 订单日期
    private String starttime;
    // 订单交期
    private String inittrytime;
    // 排程明细
    private List<ModuleScheduleCell> cell = new ArrayList<ModuleScheduleCell>();
}
