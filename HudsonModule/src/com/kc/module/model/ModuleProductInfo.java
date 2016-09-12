package com.kc.module.model;

import java.util.List;

public class ModuleProductInfo extends ModelFinal<ModuleProductInfo> {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;
    public static ModuleProductInfo dao = new ModuleProductInfo();

    /**
     * 通过模具唯一号获取产品信息
     * 
     * @param moduleid
     * @return
     */
    public List<ModuleProductInfo> getProductInfoByModule(String moduleid) {
        return this.find("SELECT * FROM MD_PRODUCT_INFO WHERE MODULEBARCODE = ?", moduleid);
    }

    /**
     * 通过产品品号查找产品信息
     * 
     * @param guestcode
     * @return
     */
    public ModuleProductInfo getProductInfoByModuleInfo(String moduleid, String guestcode) {
        return this.findFirst("SELECT * FROM MD_PRODUCT_INFO WHERE MODULEBARCODE = ? AND PRODUCTCODE = ?", moduleid, guestcode);
    }
}
