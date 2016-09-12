package com.kc.module.model;

import java.util.List;

import com.kc.module.model.form.PartDetailed;

public class PartLocation extends ModelFinal<PartLocation> {

    public static PartLocation dao = new PartLocation();

    /**
     * 得到所有在指定加工单位的模具工号
     * 
     * @param posId
     *            加工单位ID
     * @return
     */
    public List<PartLocation> getDeptModule(String posId) {
        StringBuilder sql = new StringBuilder();

        sql.append("SELECT DISTINCT m.modulecode AS text, mpl.modulebarcode || ';'");
        sql.append("|| ml.resumeid AS id ,'l' FROM PART_LOCATION ml LEFT JOIN     ");
        sql.append("md_part_list mpl ON mpl.partlistbarcode = ml.partlistbarcode  ");
        sql.append("AND ml.posid =? LEFT JOIN modulelist m ON                     ");
        sql.append("m.modulebarcode = mpl.modulebarcode                           ");

        return dao.find(sql.toString(), posId);
    }

    /**
     * 得到指定加工单位,指定履历和工艺的工件清单
     * 
     * @param posId
     * @param partDetailed
     * @return
     */
    public List<PartLocation> getDeptPartDetailed(String posId, PartDetailed partDetailed) {
        StringBuilder sql = new StringBuilder();

        sql.append("SELECT p.*, mp.partlistcode, mc.craftschbarcode, mc.starttime, mc.endtime");
        sql.append("  , md.schname                                                           ");
        sql.append("FROM (                                                                   ");
        sql.append("  SELECT pl.partlistbarcode, pl.resumeid, pl.partstate                   ");
        sql.append("  FROM PART_LOCATION pl                                                  ");
        sql.append("  WHERE pl.posid = ?                                                     ");
        sql.append("    AND pl.resumeid = ?                                                  ");
        sql.append(") p                                                                      ");
        sql.append("LEFT JOIN md_part_list mp ON mp.partlistbarcode = p.partlistbarcode      ");
        sql.append("LEFT JOIN md_craftschedule mc ON mc.resumeid = p.resumeid                ");
        sql.append("AND p.partlistbarcode = mc.partlistbarcode                               ");
        sql.append("AND mc.craftid = ?                                                       ");
        sql.append("  LEFT JOIN md_sch_declare md ON md.id = mc.schtype                      ");

        return dao.find(sql.toString(),
                        posId,
                        partDetailed.getResumeId(),
                        partDetailed.getCraftId());
    }

    /**
     * 得到加工单位待安排工件信息
     * 
     * @param posId
     * @param partDetailed
     * @return
     */
    public List<PartLocation> getWaitProcessPart(String posId, PartDetailed partDetailed) {
        // TODO 加工单待安排工件信息
        StringBuilder sql = new StringBuilder();
        sql.append("SELECT mpl.partlistcode, mpl.partlistbarcode, mpl.quantity, pm.partlistbarcode,       ");
        sql.append("   pm.resumeid , pm.machinebarcode, mc.id, mc.intime, mc.partstate, pm.resumeid       ");
        sql.append("  , mcs.duration, mcs.starttime, mcs.endtime, mcs.schtype, mcs.craftschbarcode        ");
        sql.append("  , mc.schbarcode, CASE WHEN pm.machinebarcode IS NULL THEN NULL ELSE mm.machinecode  ");
        sql.append("  || '号机' END AS machinecode                                                        ");
        sql.append("FROM (                                                                                ");
        sql.append("  SELECT pl.partlistbarcode, pl.bufferid, pl.resumeid, pl.machinebarcode              ");
        sql.append("  FROM PART_LOCATION pl                                                               ");
        sql.append("  WHERE pl.posid = ?                                                                  ");
        sql.append("     AND pl.resumeid = ?                                                              ");
        sql.append(" ) pm                                                                                 ");
        sql.append(" LEFT JOIN md_craftbuffer mc ON mc.id = pm.bufferid                                   ");
        sql.append(" LEFT JOIN md_craftschedule mcs ON mcs.partlistbarcode = pm.partlistbarcode           ");
        sql.append(" AND mcs.resumeid = pm.resumeid                                                       ");
        sql.append(" AND mcs.craftid = ?                                                                  ");
        sql.append(" LEFT JOIN md_part_list mpl ON mpl.partlistbarcode = pm.partlistbarcode               ");
        sql.append("   LEFT JOIN md_machine mm ON mm.machinebarcode = pm.machinebarcode                   ");

        return dao.find(sql.toString(),
                        posId,
                        partDetailed.getResumeId(),
                        partDetailed.getCraftId());

    }
}
