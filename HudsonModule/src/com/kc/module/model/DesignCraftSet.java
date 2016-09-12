package com.kc.module.model;

import java.util.List;

/**
 * 制程集合表
 * 
 * @author ASUS
 * 
 */
public class DesignCraftSet extends ModelFinal<DesignCraftSet> {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;
    public static DesignCraftSet dao = new DesignCraftSet();

    /**
     * 按种类获取设计集合
     * 
     * @param kind
     * @return
     */
    public List<DesignCraftSet> getCraftSetByKind(int kind) {
        return this.find("SELECT * FROM DS_CRAFT_SET WHERE KIND = ?", kind);
    }

    /**
     * 获取指定类型的指定名称的制程类型
     * 
     * @param kind
     * @param name
     * @return
     */
    public DesignCraftSet getCraftSetByName(int kind, String name) {
        return this.findFirst("SELECT * FROM DS_CRAFT_SET WHERE KIND = ? AND NAME = ?", kind, name);
    }
}
