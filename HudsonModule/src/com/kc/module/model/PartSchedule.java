package com.kc.module.model;

import java.util.List;

public class PartSchedule extends ModelFinal<PartSchedule> {

    /**
     * 
     */
    private static final long serialVersionUID = -2576659394841238654L;

    public static PartSchedule dao = new PartSchedule();

    /**
     * 得到工单所安排的工件信息
     * 
     * @return
     */
    public List<CraftBuffer> getScheduleBufferParts() {
        StringBuilder sql = CraftBuffer.dao.selectSql();
        sql.append("schbarcode=?");
        return CraftBuffer.dao.find(sql.toString(), get("schbarcode"));
    }

}
