package com.kc.module.model.form;

import java.util.Date;

import com.kc.module.model.ModuleList;

/**
 * 模具资料更新前台提交formbean
 * 
 * @author David
 * @email xuweissh@163.com
 * 
 */
public class ModuleUpdateForm extends FormBean<ModuleList> {

    public String getPictureurl() {
        return pictureurl;
    }

    public void setPictureurl(String pictureurl) {
        this.pictureurl = pictureurl;
    }

    private String guestcode;
    private String guestid;
    private Date inittrytime;
    private String modulebarcode;
    private String moduleclass;
    private String modulecode;
    private String moduleintro;
    private String posid;
    private String productname;
    private Date starttime;
    private String takeon;
    private String unitextrac;
    private String workpressure;
    private String plastic;
    private String pictureurl;

    @DropOut
    private String guestname;

    @DropOut
    private String moduletaker;

    public ModuleUpdateForm() {
        super(ModuleList.class);
    }

    public String getGuestcode() {
        return guestcode;
    }

    public void setGuestcode(String guestcode) {
        this.guestcode = guestcode;
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

    public Date getInittrytime() {
        return inittrytime;
    }

    public void setInittrytime(Date inittrytime) {
        this.inittrytime = inittrytime;
    }

    public String getModulebarcode() {
        return modulebarcode;
    }

    public void setModulebarcode(String modulebarcode) {
        this.modulebarcode = modulebarcode;
    }

    public String getModuleclass() {
        return moduleclass;
    }

    public void setModuleclass(String moduleclass) {
        this.moduleclass = moduleclass;
    }

    public String getModulecode() {
        return modulecode;
    }

    public void setModulecode(String modulecode) {
        this.modulecode = modulecode;
    }

    public String getModuleintro() {
        return moduleintro;
    }

    public void setModuleintro(String moduleintro) {
        this.moduleintro = moduleintro;
    }

    public String getModuletaker() {
        return moduletaker;
    }

    public void setModuletaker(String moduletaker) {
        this.moduletaker = moduletaker;
    }

    public String getPosid() {
        return posid;
    }

    public void setPosid(String posid) {
        this.posid = posid;
    }

    public String getProductname() {
        return productname;
    }

    public void setProductname(String productname) {
        this.productname = productname;
    }

    public Date getStarttime() {
        return starttime;
    }

    public void setStarttime(Date starttime) {
        this.starttime = starttime;
    }

    public String getTakeon() {
        return takeon;
    }

    public void setTakeon(String takeon) {
        this.takeon = takeon;
    }

    public String getUnitextrac() {
        return unitextrac;
    }

    public void setUnitextrac(String unitextrac) {
        this.unitextrac = unitextrac;
    }

    public String getWorkpressure() {
        return workpressure;
    }

    public void setWorkpressure(String workpressure) {
        this.workpressure = workpressure;
    }

    public String getPlastic() {
        return plastic;
    }

    public void setPlastic(String plastic) {
        this.plastic = plastic;
    }

    @Override
    public boolean validator() {
        return true;
    }

}
