package com.kc.module.model;

import java.util.List;

public class DesignProcessInfo extends ModelFinal<DesignProcessInfo> {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;
    public static DesignProcessInfo dao = new DesignProcessInfo();

    /**
     * 获取设计履历加工动态
     * 
     * @param resumeid
     * @return
     */
    public List<DesignProcessInfo> getProcessInfoByResume(String resumeid) {
        return this.find("SELECT * FROM DS_PROCESS_INFO WHERE DESIGNRESUMEID = ?", resumeid);
    }
}
