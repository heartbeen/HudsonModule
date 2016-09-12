package com.kc.module.model;

import java.util.List;

public class DesignCraftInfo extends ModelFinal<DesignCraftInfo> {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;
    public static DesignCraftInfo dao = new DesignCraftInfo();

    /**
     * 按种类获取制程信息
     * 
     * @param kind
     * @return
     */
    public List<DesignCraftInfo> getCraftInfoByKind(int kind) {
        return this.find("SELECT DCI.*, DSI.ID AS STATEID, DSI.NAME AS STATENAME FROM DS_CRAFT_INFO DCI "
                         + "LEFT JOIN DS_STATE_INFO DSI ON DCI.STATUS = DSI.ID WHERE DCI.KIND = ? AND DCI.SCRAPPED = ? ORDER BY DCI.ID", kind, 0);
    }

    /**
     * 报废制程
     * 
     * @param id
     * @return
     */
    public boolean scrapCraftInfo(String id) {
        DesignCraftInfo dci = this.findById(id);
        if (dci == null) {
            return true;
        }

        dci.set("SCRAPPED", 1);

        return dci.update();
    }

    /**
     * 获取制程信息并过滤隐藏项
     * 
     * @param kind
     * @return
     */
    public List<DesignCraftInfo> getCraftInfoByKindAndHidden(int kind) {
        return this.find("SELECT * FROM DS_CRAFT_INFO WHERE KIND = ? AND SCRAPPED = ? AND HIDDEN = ? ORDER BY ID", kind, 0, 0);
    }

}
