package com.kc.module.model.form;

import java.util.ArrayList;
import java.util.List;

/**
 * 用于存放预计加工排程讯息
 * 
 * @author ASUS
 * 
 */
public class MScheduleForm {
    public String getModuleresumeid() {
        return moduleresumeid;
    }

    public void setModuleresumeid(String moduleresumeid) {
        this.moduleresumeid = moduleresumeid;
    }

    public String getPartbarlistcode() {
        return partbarlistcode;
    }

    public void setPartbarlistcode(String partbarlistcode) {
        this.partbarlistcode = partbarlistcode;
    }

    public List<MScheduleEstForm> getCraftlist() {
        return craftlist;
    }

    public void setCraftlist(List<MScheduleEstForm> craftlist) {
        this.craftlist = craftlist;
    }

    // 模具履历号
    private String moduleresumeid;
    // 零件唯一号
    private String partbarlistcode;
    // 排程集合
    private List<MScheduleEstForm> craftlist = new ArrayList<MScheduleEstForm>();
}
