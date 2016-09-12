package com.kc.module.model.form;

import java.util.HashMap;
import java.util.Map;

public class ArtifactCraftForm {
    public String getCraftid() {
        return craftid;
    }

    public void setCraftid(String craftid) {
        this.craftid = craftid;
    }

    public String getCraftname() {
        return craftname;
    }

    public void setCraftname(String craftname) {
        this.craftname = craftname;
    }

    public Map<String, ArtifactCraftDateForm> getDatelist() {
        return datelist;
    }

    public void setDatelist(Map<String, ArtifactCraftDateForm> datelist) {
        this.datelist = datelist;
    }

    // 工艺代号
    private String craftid;
    // 工艺名称
    private String craftname;
    // 每日负荷情况
    private Map<String, ArtifactCraftDateForm> datelist = new HashMap<String, ArtifactCraftDateForm>();
}
