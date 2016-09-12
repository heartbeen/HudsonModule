package com.kc.module.model.form;

/**
 * 用于新模工号的生成,封装前台生成工号提交的数据
 * 
 * @author David
 * @email xuweissh@163.com
 * 
 */
public class ModuleCode {

    private String style;
    private String guest;
    private String moduleYear;
    private String moduleMonth;
    private String guestName;
    private String guestId;
    private int num;

    public String getStyle() {
        return style;
    }

    public void setStyle(String style) {
        this.style = style;
    }

    public String getGuest() {
        return guest;
    }

    public void setGuest(String guest) {
        this.guest = guest;
    }

    public String getModuleYear() {
        return moduleYear;
    }

    public void setModuleYear(String moduleYear) {
        if (moduleYear.length() == 4) {
            moduleYear = moduleYear.substring(2);
        }

        this.moduleYear = moduleYear;
    }

    public String getModuleMonth() {
        return moduleMonth;
    }

    public void setModuleMonth(String moduleMonth) {
        if (moduleMonth.length() == 1) {
            moduleMonth = "0" + moduleMonth;
        }

        this.moduleMonth = moduleMonth;
    }

    public String getGuestName() {
        return guestName;
    }

    public void setGuestName(String guestName) {
        this.guestName = guestName;
    }

    public String getGuestId() {
        return guestId;
    }

    public void setGuestId(String guestId) {
        this.guestId = guestId;
    }

    public int getNum() {
        return num;
    }

    public void setNum(int num) {
        this.num = num;
    }

}
