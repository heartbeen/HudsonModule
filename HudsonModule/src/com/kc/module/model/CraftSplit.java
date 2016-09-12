package com.kc.module.model;

import java.util.List;

public class CraftSplit extends ModelFinal<CraftSplit> {

    /**
     * 
     */
    private static final long serialVersionUID = -5078739605437422040L;
    public static CraftSplit dao = new CraftSplit();

    /**
     * 得到工艺所拆分的工作
     * 
     * @param craftid
     * @return
     */
    public List<CraftSplit> getCraftSplit(String craftId) {
        // TODO 有可以再次拆分的可能
        String sql = "select * from " + tableName() + " where craftid=?";

        return dao.find(sql, craftId);
    }

}
