package com.kc.module.model;

import java.sql.Timestamp;
import java.util.Date;
import java.util.List;
import java.util.UUID;

public class ProcessResume extends ModelFinal<ProcessResume> {

    /**
     * 
     */
    private static final long serialVersionUID = -2721655964596525113L;

    public static ProcessResume dao = new ProcessResume();

    /**
     * 新建一条计划加工履历
     * 
     * @param moduleBarcode
     * @param partListBarcode
     * @param resumeId
     *            履历ID
     * @param schType
     * @return
     */
    public boolean insert(String moduleBarcode, String partListBarcode, String resumeId, int schType) {
        ProcessResume pr = new ProcessResume();

        pr.set("id", UUID.randomUUID().toString());
        pr.set("moduleBarcode", moduleBarcode);
        pr.set("partListBarcode", partListBarcode);
        pr.set("resumeId", resumeId);
        pr.set("schType", schType);
        pr.set("createTime", new Timestamp(new Date().getTime()));

        return pr.save();
    }

    /**
     * 得到相应履历排程的工件信息
     * 
     * @param moduleBarcode
     *            模具条码号
     * @param resumeId
     *            履历ID
     * @return
     */
    public List<ProcessResume> getProcessResumePart(String posId,
                                                    String moduleBarcode,
                                                    String resumeId) {

        StringBuilder sql = new StringBuilder();

        sql.append("SELECT mpl.partlistcode, ms.partlistbarcode, mpl.quantity, pi.posname,    ");
        sql.append("CASE WHEN pl.posid=? THEN '已签收' ELSE '未签收' END signed,");
        sql.append("pl.partstate, mc.issend FROM ( SELECT mpr.partlistbarcode FROM            ");
        sql.append("MD_PROCESS_RESUME mpr  WHERE mpr.modulebarcode = ? AND mpr.resumeid = ? ) ");
        sql.append("ms LEFT JOIN md_part_list mpl ON mpl.partlistbarcode = ms.partlistbarcode ");
        sql.append("LEFT JOIN PART_LOCATION pl ON pl.partlistbarcode = mpl.partlistbarcode    ");
        sql.append("LEFT JOIN position_info pi ON pi.posid = pl.posid                         ");
        sql.append("LEFT JOIN MD_CRAFTBUFFER mc ON mc.id = pl.bufferid                        ");
        sql.append("WHERE mpl.iscollect = 0                                                   ");
        // iscollect =0,表示为工件为有多个工件的详细信息
        return dao.find(sql.toString(), posId, moduleBarcode, resumeId);
    }
}
