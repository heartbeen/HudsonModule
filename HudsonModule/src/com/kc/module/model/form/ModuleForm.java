package com.kc.module.model.form;

import java.util.Date;

import com.kc.module.model.ModuleList;

/**
 * 前台提交的模具资料表单数据
 * 
 * @author David
 * @email xuweissh@163.com
 * 
 */
public class ModuleForm extends FormBean<ModuleList> {

    private String posid;

    private String modulecode;

    private String guestid;

    @DropOut
    private String guestname;

    private String moduleclass;

    private Date inittrytime;

    @DropOut
    private Date facttrytime;

    private String createyear;

    private String createmonth;

    @DropOut
    private Date createtime;

    private String creator;

    private String modulestate;

    private String takeon;

    private Date starttime;

    private String monthno;

    private String pictureurl;

    private String modulestyle;

    private String productname;

    private String moduleintro;

    private String guestcode;

    private int workpressure;

    private String unitextrac;

    private String plastic;

    private int combine;

    @DropOut
    private String operateflag;

    private String modulebarcode;

    @DropOut
    private String creatorname;

    @DropOut
    private String issave;

    @DropOut
    private String takeonname;

    public ModuleForm() {
        super(ModuleList.class);
    }

    public String getPosid() {
        return posid;
    }

    public void setPosid(String posid) {
        this.posid = posid;
    }

    public String getModulecode() {
        return modulecode;
    }

    public void setModulecode(String modulecode) {
        this.modulecode = modulecode;
    }

    public String getGuestid() {
        return guestid;
    }

    public void setGuestid(String guestid) {
        this.guestid = guestid;
    }

    public String getGuestname() {
        return guestname;
    }

    public void setGuestname(String guestname) {
        this.guestname = guestname;
    }

    public String getModuleclass() {
        return moduleclass;
    }

    public void setModuleclass(String moduleclass) {
        this.moduleclass = moduleclass;
    }

    public Date getInittrytime() {
        return inittrytime;
    }

    public void setInittrytime(Date inittrytime) {
        this.inittrytime = inittrytime;
    }

    public Date getFacttrytime() {
        return facttrytime;
    }

    public void setFacttrytime(Date facttrytime) {
        this.facttrytime = facttrytime;
    }

    public String getCreateyear() {
        return createyear;
    }

    public void setCreateyear(String createyear) {
        this.createyear = createyear;
    }

    public String getCreatemonth() {
        return createmonth;
    }

    public void setCreatemonth(String createmonth) {
        this.createmonth = createmonth;
    }

    public Date getCreatetime() {
        return createtime;
    }

    public void setCreatetime(Date createtime) {
        this.createtime = createtime;
    }

    public String getCreator() {
        return creator;
    }

    public void setCreator(String creator) {
        this.creator = creator;
    }

    public String getModulestate() {
        return modulestate;
    }

    public void setModulestate(String modulestate) {
        this.modulestate = modulestate;
    }

    public String getTakeon() {
        return takeon;
    }

    public void setTakeon(String takeon) {
        this.takeon = takeon;
    }

    public Date getStarttime() {
        return starttime;
    }

    public void setStarttime(Date starttime) {
        this.starttime = starttime;
    }

    public String getMonthno() {
        return monthno;
    }

    public void setMonthno(String monthno) {
        this.monthno = monthno;
    }

    public String getPictureurl() {
        return pictureurl;
    }

    public void setPictureurl(String pictureurl) {
        this.pictureurl = pictureurl;
    }

    public String getModulestyle() {
        return modulestyle;
    }

    public void setModulestyle(String modulestyle) {
        this.modulestyle = modulestyle;
    }

    public String getProductname() {
        return productname;
    }

    public void setProductname(String productname) {
        this.productname = productname;
    }

    public String getModuleintro() {
        return moduleintro;
    }

    public void setModuleintro(String moduleintro) {
        this.moduleintro = moduleintro;
    }

    public String getGuestcode() {
        return guestcode;
    }

    public void setGuestcode(String guestcode) {
        this.guestcode = guestcode;
    }

    public int getWorkpressure() {
        return workpressure;
    }

    public void setWorkpressure(int workpressure) {
        this.workpressure = workpressure;
    }

    public String getUnitextrac() {
        return unitextrac;
    }

    public void setUnitextrac(String unitextrac) {
        this.unitextrac = unitextrac;
    }

    public String getOperateflag() {
        return operateflag;
    }

    public void setOperateflag(String operateflag) {
        this.operateflag = operateflag;
    }

    public String getModulebarcode() {
        return modulebarcode;
    }

    public void setModulebarcode(String modulebarcode) {
        this.modulebarcode = modulebarcode;
    }

    public String getCreatorname() {
        return creatorname;
    }

    public void setCreatorname(String creatorname) {
        this.creatorname = creatorname;
    }

    public String getIssave() {
        return issave;
    }

    public void setIssave(String issave) {
        this.issave = issave;
    }

    public String getTakeonname() {
        return takeonname;
    }

    public void setTakeonname(String takeonname) {
        this.takeonname = takeonname;
    }

    public String getPlastic() {
        return plastic;
    }

    public void setPlastic(String plastic) {
        this.plastic = plastic;
    }

    public int getCombine() {
        return combine;
    }

    public void setCombine(int combine) {
        this.combine = combine;
    }

    @Override
    public boolean validator() {
        return false;
    }

}
