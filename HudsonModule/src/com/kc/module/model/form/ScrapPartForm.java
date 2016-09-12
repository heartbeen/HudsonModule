package com.kc.module.model.form;

/**
 * 删除工件的相关讯息<br>
 * 
 * @author Administrator
 * 
 */
public class ScrapPartForm {
    public String getPartbarlistcode() {
        return partbarlistcode;
    }

    public void setPartbarlistcode(String partbarlistcode) {
        this.partbarlistcode = partbarlistcode;
    }

    public boolean getIsnew() {
        return isnew;
    }

    public void setIsnew(boolean isnew) {
        this.isnew = isnew;
    }

    private String partbarlistcode;
    private boolean isnew;
}
