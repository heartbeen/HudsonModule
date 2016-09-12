package com.kc.module.model;

import java.util.List;

/**
 * 制程集合清单表
 * 
 * @author ASUS
 * 
 */
public class DesignCraftList extends ModelFinal<DesignCraftList> {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;
    public static DesignCraftList dao = new DesignCraftList();

    /**
     * 获取制程集合清单
     * 
     * @param setid
     * @return
     */
    public List<DesignCraftList> getCraftListBySetid(String setid) {
        return this.find("SELECT DCL.*, DCI.STATUS FROM DS_CRAFT_LIST DCL LEFT JOIN DS_CRAFT_INFO DCI ON "
                         + "DCL.CRAFTID = DCI.ID WHERE DCI.SCRAPPED = 0 AND DCL.SETID = ?", setid);
    }
}
