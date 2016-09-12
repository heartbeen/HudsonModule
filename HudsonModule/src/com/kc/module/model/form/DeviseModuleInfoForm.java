package com.kc.module.model.form;

import java.sql.Date;

/**
 * 设计模块模具信息POJO
 * 
 * @author ASUS
 * 
 */
public class DeviseModuleInfoForm {
    public String getDesignresumeid() {
        return designresumeid;
    }

    public void setDesignresumeid(String designresumeid) {
        this.designresumeid = designresumeid;
    }

    public String getModulebarcode() {
        return modulebarcode;
    }

    public void setModulebarcode(String modulebarcode) {
        this.modulebarcode = modulebarcode;
    }

    public int getFlag() {
        return flag;
    }

    public void setFlag(int flag) {
        this.flag = flag;
    }

    public String getGuestid() {
        return guestid;
    }

    public void setGuestid(String guestid) {
        this.guestid = guestid;
    }

    public String getGuestcode() {
        return guestcode;
    }

    public void setGuestcode(String guestcode) {
        this.guestcode = guestcode;
    }

    public String getModulecode() {
        return modulecode;
    }

    public void setModulecode(String modulecode) {
        this.modulecode = modulecode;
    }

    public String getProductname() {
        return productname;
    }

    public void setProductname(String productname) {
        this.productname = productname;
    }

    public String getModuleclass() {
        return moduleclass;
    }

    public void setModuleclass(String moduleclass) {
        this.moduleclass = moduleclass;
    }

    public String getPlastic() {
        return plastic;
    }

    public void setPlastic(String plastic) {
        this.plastic = plastic;
    }

    public String getUnitextrac() {
        return unitextrac;
    }

    public void setUnitextrac(String unitextrac) {
        this.unitextrac = unitextrac;
    }

    public int getCombine() {
        return combine;
    }

    public void setCombine(int combine) {
        this.combine = combine;
    }

    public int getWorkpressure() {
        return workpressure;
    }

    public void setWorkpressure(int workpressure) {
        this.workpressure = workpressure;
    }

    public Date getOrderdate() {
        return orderdate;
    }

    public void setOrderdate(Date orderdate) {
        this.orderdate = orderdate;
    }

    public Date getDuedate() {
        return duedate;
    }

    public void setDuedate(Date duedate) {
        this.duedate = duedate;
    }

    public String getTakeon() {
        return takeon;
    }

    public void setTakeon(String takeon) {
        this.takeon = takeon;
    }

    public String getDeviser() {
        return deviser;
    }

    public void setDeviser(String deviser) {
        this.deviser = deviser;
    }

    public Date getStartdate() {
        return startdate;
    }

    public void setStartdate(Date startdate) {
        this.startdate = startdate;
    }

    public Date getEnddate() {
        return enddate;
    }

    public void setEnddate(Date enddate) {
        this.enddate = enddate;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    public String getIsplan() {
        return isplan;
    }

    public void setIsplan(String isplan) {
        this.isplan = isplan;
    }

    public String getIscopy() {
        return iscopy;
    }

    public void setIscopy(String iscopy) {
        this.iscopy = iscopy;
    }

    // 设计履历ID
    private String designresumeid;
    // 模具唯一号
    private String modulebarcode;

    // 操作标签0新增1修改2增番
    private int flag;
    // 客户唯一号
    private String guestid;
    // 模号/品番
    private String guestcode;
    // 模具编号
    private String modulecode;
    // 产品名称
    private String productname;
    // 机种名
    private String moduleclass;
    // 材料
    private String plastic;
    // 取数
    private String unitextrac;
    // 成型方式1单射2双射
    private int combine;
    // 成型吨位
    private int workpressure;
    // 预计起工日期
    private Date orderdate;
    // 预计客户纳期
    private Date duedate;
    // 打合担当
    private String takeon;
    // 设计担当
    private String deviser;
    // 设计预计开始日期
    private Date startdate;
    // 预计设计完成日期
    private Date enddate;
    // 备注说明
    private String remark;
    // 设计计划
    private String isplan;
    // 是否复制
    private String iscopy;
}
