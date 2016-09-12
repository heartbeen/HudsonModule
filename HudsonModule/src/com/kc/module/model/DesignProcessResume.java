package com.kc.module.model;

import java.util.ArrayList;
import java.util.List;

import com.kc.module.utils.StringUtils;

public class DesignProcessResume extends ModelFinal<DesignProcessResume> {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;
    public static DesignProcessResume dao = new DesignProcessResume();

    /**
     * 获取制程加工明细
     * 
     * @param resumeid
     * @return
     */
    public List<DesignProcessResume> getScheduleTaskInfo(String scheduleid) {
        if (StringUtils.isEmpty(scheduleid)) {
            return new ArrayList<DesignProcessResume>();
        }

        StringBuilder builder = new StringBuilder();

        builder.append("SELECT EI.EMPNAME,EI.WORKNUMBER,RD.NAME AS REGIONNAME,DCI.CRAFTNAME,SI.NAME AS STATENAME, ");
        builder.append("DPR.LRCDTIME,DPR.NRCDTIME,ROUND((NVL(DPR.NRCDTIME,SYSDATE) - DPR.LRCDTIME) * 24,2) AS ACTHOUR,DPR.ISTIME FROM ");
        builder.append("DS_PROCESS_RESUME DPR LEFT JOIN EMPLOYEE_INFO EI ON DPR.EMPID = EI.ID LEFT JOIN DS_SCHEDULE_INFO DSI ");
        builder.append("ON DPR.SCHEDULEID = DSI.ID LEFT JOIN DS_CRAFT_INFO DCI ON DSI.CRAFTID = DCI.ID LEFT JOIN DS_STATE_INFO SI ON ");
        builder.append("DPR.LSTATEID = SI.ID LEFT JOIN REGION_DEPART RD ON DPR.POSID = RD.ID WHERE DPR.SCHEDULEID = ? ORDER BY DPR.LRCDTIME DESC");

        return this.find(builder.toString(), scheduleid);
    }
}
