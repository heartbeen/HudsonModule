package com.kc.module.model;

import java.util.List;

import com.jfinal.plugin.activerecord.Db;

public class ModuleCraftSet extends ModelFinal<ModuleCraftSet> {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;
    public static ModuleCraftSet dao = new ModuleCraftSet();

    /**
     * 查询相应的工艺集合信息
     * 
     * @param roleId
     * @return
     */
    public List<ModuleCraftSet> findCraftSetName(String roleId) {
        String sql = "SELECT ID SETID,SETNAME TEXT, 1 AS LEAF FROM MD_CRAFT_SET WHERE SETID IS NULL";
        return this.find(sql);
    }

    /**
     * 得到工艺集合所包含的工艺
     * 
     * @param setId
     *            工艺集合ID
     * @return
     */
    public List<ModuleCraftSet> findCraftSetContent(String setId) {
        StringBuilder sql = new StringBuilder();

        sql.append("SELECT S.*, C.CRAFTNAME || '(' || C.CRAFTCODE || ')' AS CRAFTNAME ");
        sql.append("FROM (SELECT ID AS SETID, CRAFTID, DURATION, INTRO, GAP, RANKNUM  ");
        sql.append("FROM MD_CRAFT_SET WHERE SETID = ? ORDER BY RANKNUM                ");
        sql.append(") S LEFT JOIN MD_CRAFT C ON S.CRAFTID = C.ID                      ");

        return find(sql.toString(), setId);
    }

    /**
     * 得到模具工艺集合
     * 
     * @param setId
     * @return
     */
    public List<ModuleCraftSet> findCraftSetById(String setId) {
        return find("SELECT * FROM MD_CRAFT_SET WHERE ID=? OR SETID=?", setId, setId);

    }

    /**
     * 得到当前工艺和之后的工艺
     * 
     * @param setId
     * @param ranknum
     * @return
     */
    public List<ModuleCraftSet> findSelfAfterCraft(String setId, int ranknum) {
        return find("SELECT * FROM MD_CRAFT_SET WHERE SETID=? AND RANKNUM >=? ORDER BY RANKNUM", setId, ranknum);
    }

    /**
     * 
     * @param setId
     * @param ranknum
     * @return
     */
    public boolean updateCraftLocation(String setId, int ranknum, int loc) {
        String sql = "UPDATE MD_CRAFT_SET SET RANKNUM=RANKNUM+? WHERE SETID=? AND RANKNUM >=?";
        return Db.update(sql, loc, setId, ranknum) >= 0;
    }

    /**
     * 删除指工艺集合ID的所有预设工艺排程
     * 
     * @param setId
     * @return
     */
    public boolean deleteAllCraftById(String setId) {
        return Db.update("DELETE MD_CRAFT_SET WHERE ID=? OR SETID=?", setId, setId) >= 0;
    }

    /**
     * 得到所有预设流程集合
     * 
     * @return
     */
    public List<ModuleCraftSet> findAllCraftSet() {
        StringBuilder sql = new StringBuilder();

        sql.append("SELECT M. * ,C.CRAFTID,C.DURATION ,C.GAP INTERVAL, C.INTRO,          ");
        sql.append("MC.CRAFTNAME || '(' || MC.CRAFTCODE || ')' CRAFTNAME FROM            ");
        sql.append("( SELECT ID SETID, SETNAME FROM MD_CRAFT_SET WHERE SETID IS NULL ) M ");
        sql.append("LEFT JOIN MD_CRAFT_SET C ON C.SETID = M.SETID                        ");
        sql.append("LEFT JOIN MD_CRAFT MC ON MC.ID = C.CRAFTID                           ");
        sql.append("ORDER BY M.SETNAME,C.RANKNUM                                         ");

        return find(sql.toString());
    }

    /**
     * 获取指定工艺集合的子集合
     * 
     * @param setid
     * @return
     */
    public List<ModuleCraftSet> getCraftSet(String setid) {
        return this.find("SELECT * FROM MD_CRAFT_SET WHERE SETID = ? ORDER BY RANKNUM", setid);
    }
}
