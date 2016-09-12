package com.kc.module.model;

import java.util.List;

public class DesignStateInfo extends ModelFinal<DesignStateInfo> {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;
    public static DesignStateInfo dao = new DesignStateInfo();

    /**
     * 获取设计状态类型
     */
    public List<DesignStateInfo> getStateInfo() {
        return this.find("SELECT * FROM DS_STATE_INFO WHERE SCRAPPED = ? AND HIDDEN = ? ORDER BY KIND,ID", 0, 0);
    }

    /**
     * 获取设计状态类型
     */
    public List<DesignStateInfo> getStateInfo(int kind) {
        return this.find("SELECT * FROM DS_STATE_INFO WHERE SCRAPPED = ? AND KIND = ? ORDER BY KIND,ID", 0, kind);
    }
}
