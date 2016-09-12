package com.kc.module.model;

import java.util.List;

/**
 * 加工单位可以做的加工工艺表
 * 
 * @author xuwei
 * 
 */
public class PositionCraft extends ModelFinal<PositionCraft> {

    public static PositionCraft dao = new PositionCraft();

    /**
     * 得到当前加工单位可以做的工艺
     * 
     * @param posId
     * @return
     */
    public List<PositionCraft> getPositionCraft(String posId) {
        String sql = "select mp.craftid,mc.craftname from "
                     + tableName()
                     + "  mp , md_craft mc where mc.craftid= mp.craftid and mp.posid=?";

        return dao.find(sql, posId);
    }
}
