package com.kc.module.model.form;

/**
 * 解析工件
 * 
 * @author Administrator
 * 
 */
public class BasePartListForm {
    public String getPartlistcode() {
        return partlistcode;
    }

    public void setPartlistcode(String partlistcode) {
        this.partlistcode = partlistcode;
    }

    public String getPartcode() {
        return partcode;
    }

    public void setPartcode(String partcode) {
        this.partcode = partcode;
    }

    public String getSuffix() {
        return suffix;
    }

    public void setSuffix(String suffix) {
        this.suffix = suffix;
    }

    public String getRootcode() {
        return rootcode;
    }

    public void setRootcode(String rootcode) {
        this.rootcode = rootcode;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    public boolean isIsmerge() {
        return ismerge;
    }

    public void setIsmerge(boolean ismerge) {
        this.ismerge = ismerge;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public String partlistcode;
    public String partcode;
    public String suffix;
    public String rootcode;
    public String remark;
    // 区分编号
    private boolean ismerge;
    // 零件数量
    private int quantity;
}
