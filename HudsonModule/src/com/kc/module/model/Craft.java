package com.kc.module.model;

import java.util.ArrayList;
import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.base.Barcode;
import com.kc.module.utils.StringUtils;

/**
 * 机台的相关工艺操作
 * 
 * @author Administrator
 * 
 */
public class Craft extends ModelFinal<Craft> {

    public static Craft dao = new Craft();

    private static final long serialVersionUID = -3998967248761332676L;

    public List<Record> craftName(String posid) {
        String sql = "select craftId,craftName from md_craft where posid=?";
        return Db.find(sql, posid);
    }

    /**
     * 获取最高层级的工艺ID以及工艺名称
     * 
     * @return
     */
    public List<Craft> getModuleCrafts(String rank) {
        return this.find("select ID AS CRAFTBARID,CRAFTID,CRAFTNAME,craftcode,(craftname||'['||craftcode||']') AS MERGENAME,KINDID from md_craft "
                         + (rank == null ? " ORDER BY CRAFTID" : "where craftrank = '" + rank + "' ORDER BY CRAFTID"));
    }

    public List<Craft> getStyleCrafts(String rank) {
        return this.find("select id as partid,craftid AS stepid,craftname AS sname,craftcode,craftname||'('||craftcode||')' AS name,nvl(craftinfo,'0') as hprice,kindid from md_craft "
                         + (rank == null ? " ORDER BY CRAFTID" : "where craftrank = '" + rank + "' ORDER BY CRAFTID"));
    }

    public boolean addCrafts(String id, String code, String name, String price, int typeid) {
        // 读取数据库中的工艺数据
        List<Craft> list = getModuleCrafts(null);
        if (id.isEmpty()) {
            String addId = null;
            if (list == null) {
                addId = "01";
            } else {

                // 判断有无代号重复的情况,有则返回FALSE
                for (Craft craft : list) {
                    String craftcode = craft.getStr("CRAFTCODE");
                    if (craftcode.equals(code)) {
                        return (false);
                    }
                }

                // 如果ID为空,则表示添加的为主工艺,否则为添加新工艺
                int localMax = -1;
                if (StringUtils.isEmpty(id)) {
                    // 遍历所有工艺,找到主工艺的最大值
                    for (Craft craft : list) {
                        String craftid = craft.getStr("CRAFTID");
                        if (craftid != null && craftid.length() == 2) {
                            int val = Integer.valueOf(craftid);
                            if (val > localMax) {
                                localMax = val;
                            }
                        }
                    }

                    if (localMax == -1) {
                        addId = "01";
                    } else {
                        addId = StringUtils.leftPad((localMax + 1) + "", 2, "0");
                    }

                } else {
                    int slen = id.length() + 2;
                    for (Craft craft : list) {
                        String craftid = craft.getStr("CRAFTID");
                        int len = craftid.length();
                        int index = craftid.indexOf(id);
                        if (craftid != null && (len == slen) && index == 0) {
                            int val = Integer.valueOf(craftid);
                            if (val > localMax) {
                                localMax = val;
                            }
                        }
                    }

                    if (localMax > 0) {
                        addId = StringUtils.leftPad((localMax + 1) + "", slen, "0");
                    } else {
                        addId = id + "01";
                    }
                }
            }

            Craft craft = new Craft();
            boolean rs = craft.set("CRAFTCODE", code)
                              .set("CRAFTNAME", name)
                              .set("CRAFTINFO", price)
                              .set("KINDID", typeid)
                              .set("ID", Barcode.MODULE_CRAFT.nextVal())
                              .set("CRAFTID", addId)
                              .save();
            return rs;
        } else {
            if (list == null) {
                return (false);
            }

            boolean repeat = false;

            // 查询是否存在代号重复的情况
            for (Craft cr : list) {
                String tempid = cr.getStr("CRAFTBARID");
                String tempcode = cr.getStr("CRAFTCODE");
                if (!tempid.equals(id)) {
                    if (tempcode.equals(code)) {
                        repeat = true;
                    }
                }

            }

            if (repeat) {
                return (!repeat);
            }

            Craft craft = new Craft();

            boolean rs = craft.set("CRAFTCODE", code).set("CRAFTNAME", name).set("KINDID", typeid).set("CRAFTINFO", price).set("ID", id).update();
            return rs;
        }
    }

    /**
     * 获取工艺列表信息
     * 
     * @return
     */
    public List<Record> craftData() {
        String sql = "select * from md_craft m,position_info p where " + "m.posId = p.posId(+) order by m.craftId desc";
        return Db.find(sql);
    }

    /**
     * 得到排程的工艺
     * 
     * @return
     */
    public List<Craft> planCraft() {
        return find("select c.CRAFTNAME ||'('||c.CRAFTCODE||')' name,c.ID from MD_CRAFT c");
    }

    public List<Craft> getClassifyCrafts(int classid) {
        StringBuilder builder = new StringBuilder();

        builder.append("SELECT MC.ID, MC.CRAFTNAME || '(' || MC.CRAFTCODE || ')' AS NAME FROM MD_CRAFT_CLASSIFY MCC ");
        builder.append("LEFT JOIN MD_CRAFT MC ON MCC.CRAFTID = MC.ID WHERE MCC.CLASSID = ? ORDER BY MC.ID");

        return find(builder.toString(), classid);
    }

    /**
     * 根据ID,删除工艺列表信息
     * 
     * @param id
     * @return
     */
    public Boolean deleteCraftData(String id) {
        return Craft.dao.deleteById(id);
    }

    /**
     * 得到当前用户所在模具部可以加工的工艺
     */
    public List<Craft> findDeptModuleCraft(String stepId) {
        StringBuilder sql = new StringBuilder();
        sql.append("SELECT MC.CRAFTNAME || '(' || MC.CRAFTCODE || ')' CRAFTNAME, MC.ID AS CRAFTID ");
        sql.append(" FROM MD_CRAFT MC ");
        sql.append(" WHERE ID IN (SELECT DISTINCT DD.CRAFTID ");
        sql.append("             FROM DEVICE_DEPART DD ");
        sql.append("            WHERE DD.PARTID IN (SELECT ID ");
        sql.append("              FROM REGION_DEPART RD ");
        sql.append("               WHERE RD.STEPID LIKE ?||'%'))");

        return find(sql.toString(), stepId);

    }

    /**
     * 获取分类的工艺讯息
     * 
     * @param classid
     * @return
     */
    public List<Craft> getClassifyCraftInfo(int classid) {
        StringBuilder builder = new StringBuilder();

        builder.append("SELECT MC.ID,MC.CRAFTNAME,MCC.ID AS MCCID, CRAFTCODE FROM MD_CRAFT MC LEFT JOIN (SELECT ");
        builder.append("* FROM MD_CRAFT_CLASSIFY WHERE CLASSID = ?) MCC ON MC.ID = MCC.CRAFTID ORDER BY MC.ID");

        return this.find(builder.toString(), classid);
    }

    /**
     * 获取指定的工艺讯息
     * 
     * @param classid
     * @return
     */
    public List<Record> getClassifyCraftList(int classid) {
        List<Craft> craftList = getClassifyCraftInfo(classid);
        List<Record> craftRecord = new ArrayList<Record>();

        for (Craft c : craftList) {
            Record rcd = new Record();

            rcd.set("ID", c.getStr("ID"));
            rcd.set("CRAFTNAME", c.getStr("CRAFTNAME"));
            rcd.set("CRAFTCODE", c.getStr("CRAFTCODE"));
            rcd.set("MACCID", c.getStr("MCCID"));
            rcd.set("CHECKED", (c.get("MCCID") != null));

            craftRecord.add(rcd);
        }

        return craftRecord;
    }

    /**
     * 获取标准工艺日加工负荷
     */
    public List<Craft> getStandardWorkLoad(String craftid, String kindid) {
        StringBuilder builder = new StringBuilder();

        if (StringUtils.isEmpty(kindid)) {
            return new ArrayList<Craft>();
        }

        builder.append("SELECT MC.ID, MC.CRAFTNAME, MC.CRAFTCODE, MWL.ID AS NWLID, MWL.USEHOUR FROM MD_CRAFT MC LEFT JOIN ( ");
        builder.append("SELECT * FROM MD_WORK_LOAD WHERE KINDID = ").append(kindid);
        builder.append(" ) MWL ON MC.ID = MWL.CRAFTID ");
        builder.append("WHERE MC.CRAFTID IN (").append(craftid).append(") ORDER BY MC.ID");

        return this.find(builder.toString());
    }

    public List<Craft> getCraftInfoById() {
        return this.find("SELECT ID, CRAFTNAME FROM MD_CRAFT ORDER BY ID");
    }
}
