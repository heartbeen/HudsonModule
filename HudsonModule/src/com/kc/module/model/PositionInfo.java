package com.kc.module.model;

import java.util.Date;
import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;

public class PositionInfo extends ModelFinal<PositionInfo> {

    public static PositionInfo dao = new PositionInfo();

    private static final long serialVersionUID = -3998967248761332676L;

    public List<Record> positionName() {
        String sql = "select posId,posName from position_info";
        return Db.find(sql);
    }

    /**
     * 新增部门与单位信息
     * 
     * @param posId
     * @param posName
     * @param creator
     * @return
     */
    public Boolean insertPositonInfo(String posId, String posName, String creator, String posiType) {

        return new PositionInfo().set("posId", posId)
                                 .set("posName", posName)
                                 .set("creator", creator)
                                 .set("posiType", posiType)
                                 .set("createTime", new java.sql.Timestamp(new Date().getTime()))
                                 .save();
    }

    /**
     * 获取部门信息表中的部门
     * 
     * @return
     */
    public List<Record> positionData() {
        String sql = "select * from position_info where posiType='2' order by posid desc";
        return Db.find(sql);
    }

    /**
     * 根据ID删除部门列表记录
     * 
     * @param id
     * @return
     */
    public Boolean deletePosition(String posid) {
        return PositionInfo.dao.deleteById(posid);
    }

    /**
     * 得到本单位以外的其它单位
     * 
     * @param posId
     * @return
     */
    public List<PositionInfo> getPositionList(String posId) {
        String sql = "SELECT posid id, posname text FROM POSITION_INFO "
                     + "WHERE posid LIKE (substr('?', 1, 4) || '%')   "
                     + "AND posid NOT IN (substr('?', 1, 4), '?')";
        return dao.find(sql.replace("?", posId));
    }
}
