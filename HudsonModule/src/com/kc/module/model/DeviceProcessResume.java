package com.kc.module.model;

import java.util.Date;
import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.model.form.MachineWorkForm;

public class DeviceProcessResume extends ModelFinal<DeviceProcessResume> {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;

    public static DeviceProcessResume dao = new DeviceProcessResume();

    /**
     * 
     * @param workForm
     * @return
     */
    public List<Record> findDeviceLoadOfCraft(MachineWorkForm workForm) {
        StringBuilder sql = new StringBuilder();

        sql.append("SELECT DPR.*, ");
        sql.append("       MC.CRAFTCODE AS KEYNAME, TO_CHAR(DPR.ACTIONDATE, 'YYYY-MM-DD') AS WORKDATE,");
        sql.append("       TO_CHAR(DPR.ACTIONDATE, '");
        sql.append(workForm.getSqlDateForamt());
        sql.append("') AS GROUPKEY   FROM (SELECT DEVICEPARTID, CRAFTID, ACTIONDATE, ");
        sql.append("       STATEID,MACLOAD   FROM DEVICE_PROCESS_RESUME DPR ");
        sql.append("         WHERE ACTIONDATE >= TO_DATE(?||' 00:00:00','YYYY-MM-DD HH24:MI:SS') ");
        sql.append("           AND ACTIONDATE <= TO_DATE(?||' 23:59:59','YYYY-MM-DD HH24:MI:SS')  ");
        // sql.append("           AND (STATEID = 20301 OR STATEID = 20302) ");
        sql.append("           AND EXISTS (SELECT 1 ");
        sql.append("                  FROM MD_CRAFT_CLASSIFY M ");
        sql.append("                 WHERE M.CLASSID = ? ");
        sql.append("                   AND DPR.CRAFTID = M.CRAFTID) ");
        sql.append("         ORDER BY CRAFTID, DEVICEPARTID, ACTIONDATE) DPR ");
        sql.append("  LEFT JOIN MD_CRAFT MC ");
        sql.append("    ON MC.ID = DPR.CRAFTID ");

        return Db.find(sql.toString(),
                       workForm.getStartTime(),
                       workForm.getEndTime(),
                       workForm.getClassId());
    }

    /**
     * 
     * @param workForm
     * @return
     */
    public List<Record> findDeptDeviceLoad(MachineWorkForm workForm) {
        StringBuilder sql = new StringBuilder();

        sql.append("SELECT DPR.*,  ");
        sql.append("       RD.NAME AS KEYNAME, TO_CHAR(DPR.ACTIONDATE, 'YYYY-MM-DD') AS WORKDATE,");
        sql.append("       TO_CHAR(DPR.ACTIONDATE, '");
        sql.append(workForm.getSqlDateForamt());
        sql.append("') AS GROUPKEY  ");
        sql.append("FROM (SELECT DEVICEPARTID, ACTIONDATE, STATEID,MACLOAD  ");
        sql.append("       FROM DEVICE_PROCESS_RESUME DPR  ");
        sql.append("         WHERE ACTIONDATE >= TO_DATE(?||' 00:00:00','YYYY-MM-DD HH24:MI:SS') ");
        sql.append("           AND ACTIONDATE <= TO_DATE(?||' 23:59:59','YYYY-MM-DD HH24:MI:SS')  ");
        sql.append("           AND EXISTS (SELECT 1 ");
        sql.append("                  FROM MD_CRAFT_CLASSIFY M ");
        sql.append("                 WHERE M.CLASSID = ? ");
        sql.append("                   AND DPR.CRAFTID = M.CRAFTID) ");
        sql.append("   ) DPR  LEFT JOIN DEVICE_DEPART DD  ");
        sql.append(" ON DD.ID = DPR.DEVICEPARTID  ");
        sql.append("LEFT JOIN REGION_DEPART RD  ");
        sql.append(" ON RD.ID = DD.PARTID  ");
        sql.append("ORDER BY RD.NAME, DPR.DEVICEPARTID, DPR.ACTIONDATE  ");

        return Db.find(sql.toString(),
                       workForm.getStartTime(),
                       workForm.getEndTime(),
                       workForm.getClassId());
    }

    /**
     * 按选择的部门统计各机台统计负荷
     * 
     * @param workForm
     * @return
     */
    public List<Record> findSelectDeptDeviceLoad(MachineWorkForm workForm) {
        StringBuilder sql = new StringBuilder();

        sql.append("select dpr.*,                                             ");
        sql.append("     de.batchno as keyname,  ");
        sql.append("     to_char(dpr.actiondate, 'YYYY-MM-DD') as workdate,  ");
        sql.append("       TO_CHAR(DPR.ACTIONDATE, '");
        sql.append(workForm.getSqlDateForamt());
        sql.append("') AS GROUPKEY  ");
        sql.append(" FROM (SELECT DEVICEPARTID, ACTIONDATE, STATEID, MACLOAD  ");
        sql.append("        from DEVICE_PROCESS_RESUME dpr  ");
        sql.append("         WHERE ACTIONDATE >= TO_DATE(?||' 00:00:00','YYYY-MM-DD HH24:MI:SS') ");
        sql.append("           AND ACTIONDATE <= TO_DATE(?||' 23:59:59','YYYY-MM-DD HH24:MI:SS')  ");
        sql.append("         and exists (select 1  ");
        sql.append("                from MD_CRAFT_CLASSIFY m  ");
        sql.append("               where m.classid = ? ");
        sql.append("                 and dpr.craftid = m.craftid)  ");
        sql.append("         and exists  ");
        sql.append("       (select 1  ");
        sql.append("                from (select dd.id  ");
        sql.append("                        from DEVICE_DEPART dd  ");
        sql.append("                       where exists (select 1  ");
        sql.append("                                from REGION_DEPART r  ");
        sql.append("                               where r.id = dd.partid  ");
        sql.append("                                 and r.id = ?)) dr  ");
        sql.append("               where dr.id = dpr.devicepartid)) dpr  ");
        sql.append(" left join DEVICE_DEPART de  ");
        sql.append("  on de.id = dpr.devicepartid  ");
        sql.append(" order by dpr.devicepartid, dpr.actiondate  ");

        return Db.find(sql.toString(),
                       workForm.getStartTime(),
                       workForm.getEndTime(),
                       workForm.getClassId(),
                       workForm.getDeptId());
    }

    public Record findUpMachineStartResume(String dateFormat,
                                           String devicePartId,
                                           String craftId,
                                           Date actionDate) {

        StringBuilder sql = new StringBuilder();

        sql.append("SELECT DPR.*,  ");
        sql.append("  MC.CRAFTCODE AS KEYNAME,  ");
        sql.append("  TO_CHAR(DPR.ACTIONDATE, 'YYYY-MM-DD') AS WORKDATE,  ");
        sql.append("  TO_CHAR(DPR.ACTIONDATE, '");
        sql.append(dateFormat);
        sql.append("') AS GROUPKEY   FROM (SELECT *  ");
        sql.append("     FROM (SELECT DEVICEPARTID, CRAFTID, ACTIONDATE, STATEID, MACLOAD  ");
        sql.append("             FROM DEVICE_PROCESS_RESUME  ");
        sql.append("            WHERE DEVICEPARTID = ?  ");
        sql.append("              AND CRAFTID = ?  ");
        sql.append("              AND ACTIONDATE < ?  ");
        sql.append("            ORDER BY ACTIONDATE DESC)  ");
        sql.append("    WHERE ROWNUM <= 1) DPR  ");
        sql.append("  LEFT JOIN MD_CRAFT MC  ");
        sql.append("  ON MC.ID = DPR.CRAFTID  ");

        return Db.findFirst(sql.toString(), devicePartId, craftId, actionDate);
    }

}
