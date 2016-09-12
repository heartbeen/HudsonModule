package com.kc.module.model;

import java.util.List;

import com.kc.module.utils.StringUtils;

public class PartOutBound extends ModelFinal<PartOutBound> {
    /**
     * 
     */
    private static final long serialVersionUID = 1L;
    public static PartOutBound dao = new PartOutBound();

    /**
     * 获取外发工件讯息
     * 
     * @param stateid
     * @param modulecode
     * @param partid
     * @param startdate
     * @param enddate
     * @return
     */
    public List<PartOutBound> getOutBoundPartInfo(String stateid, String modulecode, String partid, String startdate, String enddate) {
        StringBuilder builder = new StringBuilder();

        builder.append("SELECT PO.ID AS PID, ML.MODULECODE,ML.GUESTCODE, MPL.PARTLISTCODE, MP.CNAMES, FY.SHORTNAME,");
        builder.append("PO.MODULERESUMEID, MPS.NAME AS STATENAME, PO.OUTGUESTNAME, PO.OUTCRAFTNAME, ");
        builder.append("PO.PARTLISTBARCODE, PO.APPLYCOMMENT, PO.OUTCRAFTCODE, TO_CHAR(PO.APPLYTIME, 'yyyy-MM-dd hh24') AS APPLYTIME,");
        builder.append("EI.EMPNAME, PO.CHARGES, TO_CHAR(PO.BACKTIME, 'yyyy-mm-dd hh24') AS BACKTIME, ");
        builder.append("TO_CHAR(PO.PLANOUTTIME, 'yyyy-mm-dd') AS PLANOUTTIME, TO_CHAR(PO.PLANBACKTIME, 'yyyy-mm-dd') AS PLANBACKTIME ");
        builder.append("FROM PART_OUTBOUND PO LEFT JOIN MD_PROCESS_STATE MPS ON PO.STATEID = MPS.ID ");
        builder.append("LEFT JOIN MD_PART_LIST MPL ON PO.PARTLISTBARCODE = MPL.PARTBARLISTCODE ");
        builder.append("LEFT JOIN MD_PART MP ON MPL.PARTBARCODE = MP.PARTBARCODE ");
        builder.append("LEFT JOIN MODULELIST ML ON MPL.MODULEBARCODE = ML.MODULEBARCODE ");
        builder.append("LEFT JOIN FACTORY FY ON ML.GUESTID = FY.ID ");
        builder.append("LEFT JOIN EMPLOYEE_INFO EI ON PO.APPLIER = EI.ID WHERE 1 = 1");

        final String dateformat = "yyyy-MM-dd hh24:mi:ss";

        // 外发状态
        if (!StringUtils.isEmpty(stateid)) {
            builder.append(" AND PO.STATEID = '").append(stateid).append("'");
        }

        if (!StringUtils.isEmpty(modulecode)) {
            builder.append(" AND ML.MODULECODE LIKE '").append(modulecode).append("%'");
        }

        if (!StringUtils.isEmpty(partid)) {
            builder.append(" AND MPL.PARTLISTCODE LIKE '").append(partid).append("%'");
        }

        if (!StringUtils.isEmpty(startdate)) {
            builder.append(" AND PO.APPLYTIME BETWEEN TO_DATE('")
                   .append(startdate + " 00:00:00")
                   .append("','")
                   .append(dateformat)
                   .append("') AND TO_DATE('")
                   .append(enddate + " 23:59:59")
                   .append("','")
                   .append(dateformat)
                   .append("')");
        }

        builder.append("ORDER BY ML.MODULECODE,PO.APPLYTIME");

        return find(builder.toString());
    }
}
