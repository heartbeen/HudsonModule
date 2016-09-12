package com.kc.module.model.form;

import java.util.ArrayList;
import java.util.List;

/**
 * 工件工艺清单
 * 
 * @author ASUS
 * 
 */
public class PartCraftForm {
    public String getCraftid() {
        return craftid;
    }

    public void setCraftid(String craftid) {
        this.craftid = craftid;
    }

    public String getCraftname() {
        return craftname;
    }

    // 获取游标
    private int cursorid;

    public int getCursorid() {
        return cursorid;
    }

    public void setCursorid(int cursorid) {
        this.cursorid = cursorid;
    }

    public void setCraftname(String craftname) {
        this.craftname = craftname;
    }

    public List<PartScheForm> getCraftlist() {
        return craftlist;
    }

    public void setCraftlist(List<PartScheForm> craftlist) {
        this.craftlist = craftlist;
    }

    private String craftid;
    private String craftname;
    private List<PartScheForm> craftlist = new ArrayList<PartScheForm>();
}
