package com.kc.module.model;

import java.util.ArrayList;
import java.util.List;

import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.StringUtils;

public class DesignScheduleInfo extends ModelFinal<DesignScheduleInfo> {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;
    public static DesignScheduleInfo dao = new DesignScheduleInfo();

    /**
     * 获取制程安排计划
     * 
     * @param resumeid
     * @return
     */
    public List<DesignScheduleInfo> getScheduleInfo(String resumeid) {
        StringBuilder builder = new StringBuilder();

        builder.append("SELECT DSI.*, DCI.CRAFTNAME, SI.NAME AS STATENAME FROM DS_SCHEDULE_INFO DSI LEFT JOIN DS_CRAFT_INFO DCI ON ");
        builder.append("DSI.CRAFTID = DCI.ID LEFT JOIN DS_STATE_INFO SI ON DSI.STATEID = SI.ID WHERE DSI.DESIGNRESUMEID = ? AND DSI.SCRAPPED = 0 ORDER BY DSI.RANKNUM");

        return this.find(builder.toString(), resumeid);
    }

    /**
     * 更新制程计划信息
     * 
     * @param idCol
     * @param idVal
     * @param txtCol
     * @param txtVal
     * @return
     */
    public boolean updateScheduleInfoByColumn(String idCol, String idVal, String txtCol, String txtVal) {
        Object finalVal = (StringUtils.isEmpty(txtVal) ? txtVal : (ArithUtils.isDouble(txtVal) ? ArithUtils.parseDouble(txtVal, 0) : txtVal));
        return new DesignScheduleInfo().set(idCol, idVal).set(txtCol, finalVal).update();
    }

    /**
     * 获取履历制程信息
     * 
     * @param resumeid
     * @return
     */
    public List<DesignScheduleInfo> getResumeScheduleInfo(String resumeid) {
        return this.find("SELECT * FROM DS_SCHEDULE_INFO WHERE SCRAPPED = ? AND DESIGNRESUMEID = ?", 0, resumeid);
    }

    /**
     * 获取制程加工详情
     * 
     * @param resumeid
     * @return
     */
    public List<DesignScheduleInfo> getScheduleProcessInfo(String resumeid) {
        if (StringUtils.isEmpty(resumeid)) {
            return new ArrayList<DesignScheduleInfo>();
        }

        StringBuilder builder = new StringBuilder();

        builder.append("SELECT DSI.ID,DCI.CRAFTNAME,SI.NAME AS STATENAME,DSI.PLANSTART,DSI.PLANEND,DSI.PLANHOUR,");
        builder.append("DSI.FACTSTART,DSI.FACTEND,DSI.KIND,(SELECT ROUND(SUM((NVL(NRCDTIME,SYSDATE) - LRCDTIME) * 24),2) FROM DS_PROCESS_RESUME WHERE ISTIME = 0 ");
        builder.append("AND SCHEDULEID  = DSI.ID) AS ACTHOUR,(CASE WHEN SYSDATE > DSI.PLANSTART AND FACTSTART IS NULL THEN 1 ELSE 0 END) AS RELAY ");
        builder.append("FROM DS_SCHEDULE_INFO DSI LEFT JOIN DS_CRAFT_INFO DCI ON DSI.CRAFTID = DCI.ID LEFT JOIN DS_STATE_INFO SI ON DSI.STATEID = SI.ID ");
        builder.append("WHERE DSI.SCRAPPED = 0 AND DSI.DESIGNRESUMEID = ? ORDER BY DSI.RANKNUM");

        return this.find(builder.toString(), resumeid);
    }
}
