package com.kc.module.model;

import java.util.List;

import com.jfinal.plugin.activerecord.Db;

public class CraftBuffer extends ModelFinal<CraftBuffer> {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;
    public static CraftBuffer dao = new CraftBuffer();

    public boolean isExist(String posId, String partListBarcode) {
        StringBuilder sql = new StringBuilder();
        sql.append("select count(id) from ");
        sql.append(tableName());
        sql.append("where posId=? and partListBarcode=?");

        return dao.findFirst(sql.toString(), posId, partListBarcode) != null ? true : false;
    }

    /**
     * 查找ID范围内的工件
     * 
     * @param bufferIds
     * @return
     */
    public List<CraftBuffer> getCraftBufferInScope(String bufferIds) {
        StringBuilder sql = selectSql();
        sql.append("id in (").append(bufferIds).append(")");
        return dao.find(sql.toString());
    }

    /**
     * 取消指定工单的所有工件安排
     * 
     * @param schBarcode
     *            工单条码号
     * @return
     */
    public int cancleAllArranage(String schBarcode, int partState) {
        StringBuilder sql = updateSql();
        sql.append("schbarcode='',partstate=? where schbarcode=?");

        return Db.update(sql.toString(), partState, schBarcode);
    }


    /**
     * 保存工单与工件的关系
     * 
     * @param schBarcode
     * @return
     */
    public boolean saveRelation(String schBarcode) {
        OrderRelation or = new OrderRelation();
        or.set("schBarcode", schBarcode);
        or.set("bufferid", get("id"));

        return or.save();
    }
}
