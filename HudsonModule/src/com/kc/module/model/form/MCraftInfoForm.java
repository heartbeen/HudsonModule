package com.kc.module.model.form;

import java.util.ArrayList;
import java.util.List;

/**
 * 工艺加工列表(同一种工艺不同的加工时段)
 * 
 * @author ASUS
 * 
 */
public class MCraftInfoForm {
    // 工艺唯一号
    private String craftid;
    // 工艺名称
    private String craftname;

    public String getCraftname() {
        return craftname;
    }

    public void setCraftname(String craftname) {
        this.craftname = craftname;
    }

    // 顺序号
    private int streamid;
    // 工艺清单
    private List<MCraftForm> crafthouse = new ArrayList<MCraftForm>();

    public String getCraftid() {
        return craftid;
    }

    public void setCraftid(String craftid) {
        this.craftid = craftid;
    }

    public int getStreamid() {
        return streamid;
    }

    public void setStreamid(int streamid) {
        this.streamid = streamid;
    }

    public List<MCraftForm> getCrafthouse() {
        return crafthouse;
    }

    public void setCrafthouse(List<MCraftForm> crafthouse) {
        this.crafthouse = crafthouse;
    }
}
