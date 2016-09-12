package com.kc.module.model;

import java.util.List;

/**
 * 模具工件加工工时与工艺类
 * 
 * @author xuwei
 * 
 */
public class CraftSchedule extends ModelFinal<CraftSchedule> {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;
    public static CraftSchedule dao = new CraftSchedule();

    /**
     * 得到指定模具的加工工时与工艺<br>
     * 
     * listtype取值:<br>
     * 0:工件为正常<br>
     * 1:工件为报废或取消<br>
     * <p>
     * schType取值说明: <code>
     * <table>
     * <tr><td>0</td><td>新模排程</td></tr>
     * <tr><td>1</td><td>修模排程</td></tr>
     * <tr><td>2</td><td>设变排程</td></tr>
     * </table>
     * </code>
     * 
     * @param moduleBarcode
     *            模具barcode
     * @param schType
     * @param partListBarcode
     *            指定要查找的工件
     * @return
     */
    public List<CraftSchedule> getCraftSchedule(String moduleBarcode,
                                                int schType,
                                                String partListBarcode,
                                                String resumeid) {
        boolean isPart = partListBarcode != null && partListBarcode.trim().length() > 0;
        StringBuilder sql = new StringBuilder();

        sql.append(isPart ? "select * from (" : "");
        sql.append("SELECT mpa.partBarcode, mpa.partCode, mpa.parts, mpa.maind, mpa.partListBarcode         ");
        sql.append("  , mpa.partListCode, mpa.partLists, mpa.pld,mpa.iscollect, mcs.craftschbarcode         ");
        sql.append(" , mc.craftcode , mc.craftname, mcs.starttime, mcs.endtime, mcs.ranknum, mcs.duration   ");
        sql.append("FROM ( SELECT mp.*, mpl.partlistbarcode, mpl.partlistcode,mpl.iscollect, mpl.quantity AS");
        sql.append(" partlists, mpl.duration AS pld FROM md_part_list mpl, (                                ");
        sql.append("    SELECT partbarcode, partcode, quantity AS parts, duration AS maind                  ");
        sql.append("    FROM md_part WHERE modulebarcode = ? ) mp                                           ");
        sql.append("  WHERE mpl.partbarcode = mp.partbarcode and listtype=0 ) mpa                           ");
        sql.append("LEFT JOIN MD_CRAFTSCHEDULE mcs ON mpa.partlistbarcode = mcs.partlistbarcode             ");
        sql.append("  LEFT JOIN md_craft mc ON mc.craftid = mcs.craftid and mcs.schtype=? and resumeid=?    ");
        sql.append("order by mpa.partBarcode, mpa.partListBarcode                                           ");
        sql.append(isPart ? ")   mm where mm.partlistbarcode=?  " : "");

        return isPart ? dao.find(sql.toString(), moduleBarcode, schType, resumeid, partListBarcode)
                     : dao.find(sql.toString(), moduleBarcode, schType, resumeid);
    }

    /**
     * 通过工艺工时条码得到工艺信息
     * 
     * @param barcode
     * @return
     */
    public CraftSchedule getCraftByBarcode(String barcode) {
        return dao.findFirst("select * from " + tableName() + " where craftschbarcode=?", barcode);
    }

    /**
     * 得到工艺的关联关系
     * 
     * @param moduleBarcode
     * @return
     */
    public List<CraftSchedule> getDependencies(String moduleBarcode) {

        return dao.find("select craftschbarcode ,nextcscode  from  "
                        + tableName()
                        + " where modulebarcode=?", moduleBarcode);
    }
}
