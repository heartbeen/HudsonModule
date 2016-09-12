package com.kc.module.transaction;

import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import com.kc.module.dao.BaseIAtom;
import com.kc.module.model.ModuleEstSchedule;
import com.kc.module.utils.ConstUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.StringUtils;

public class SetCraftPlanIAtom extends BaseIAtom {

    @Override
    public boolean run() throws SQLException {
        try {
            boolean success = true;

            String timeLoc = this.getController().getPara("timeLoc");

            String planId = this.getController().getPara("planId");
            long interval = this.getController().getParaToLong("interval");
            boolean isNeed = this.getController().getParaToBoolean("isNeed");

            int duration = 0;
            Object dur = this.getController().getPara("duration");
            if (!StringUtils.isEmpty(dur)) {
                duration = this.getController().getParaToInt("duration");
            }

            String time = this.getController().getPara("time");
            
            if ("d".equals(timeLoc)) {
                // 调整加工时长
                success = craftDuration(planId, duration);
            } else {
                // 如果时间为空,则返回不做任何修改
                if (StringUtils.isEmpty(time)) {
                    return false;
                }
                // 调整开完工时间
                success = craftOrigination(planId, time, timeLoc);
            }
            
            if (isNeed) {
                success = success && adjustFollowUpPlan(planId, timeLoc, interval);
            }

            return success;
        }
        catch (Exception e) {
            return false;
        }
    }

    /**
     * 调整后续工艺时间和时长<br>
     * 当前面工艺调时间和时长时,那么后的工艺时间和时长就要同时调整
     * 
     * @return
     */
    private boolean adjustFollowUpPlan(String planId, String timeLoc, long interval) {

        List<ModuleEstSchedule> list = getNeedAdjustPlan(planId);

        for (ModuleEstSchedule mes : list) {

            // 设整开工时间时,只是对时间进行平移
            if (mes.get("starttime") != null) {
                mes.set("starttime", new Timestamp(mes.getTimestamp("starttime").getTime() + interval));
            }

            if (mes.get("endtime") != null) {
                mes.set("endtime", new Timestamp(mes.getTimestamp("endtime").getTime() + interval));
            }

            if (!mes.update()) {
                list = null;
                return false;
            }
        }

        list = null;
        return true;
    }

    /**
     * 修改工艺的加工时长
     */
    private boolean craftDuration(String planId, int duration) {

        Timestamp startTime;
        boolean isSuccess = true;

        List<ModuleEstSchedule> list = ModuleEstSchedule.dao.findCraftPlanById(planId);

        for (ModuleEstSchedule mes : list) {

            startTime = mes.getTimestamp("starttime");
            // 按加工时长平移开工时间与完工时间
            if (startTime != null) {
                mes.set("endtime", new Timestamp(startTime.getTime() + duration * ConstUtils.HOUR_MILLISECOND));
                mes.set("duration", duration);

                isSuccess = isSuccess && mes.update();
            } else {
                isSuccess = false;
            }
        }

        return isSuccess;
    }

    /**
     * 更改工件工艺开工与完工时间
     * 
     * @param time
     * @param timeLoc
     * @param planId
     * @return
     * 
     */
    private boolean craftOrigination(String planId, String time, String timeLoc) {
        boolean success = true;
        // String time = getPara("time");

        Date date = DateUtils.strToDate(time, "yyyy-MM-dd H");
        Timestamp tmp;
        Number duration = 0;
        long times = date.getTime();

        List<ModuleEstSchedule> list = ModuleEstSchedule.dao.findCraftPlanById(planId);

        for (ModuleEstSchedule mes : list) {
            if (timeLoc.equals("s")) {
                mes.set("starttime", new Timestamp(times));
                duration = mes.getNumber("duration");

                // 按加工时长平移开工时间与完工时间
                if (duration != null && duration.intValue() > 0) {
                    mes.set("endtime", new Timestamp(duration.intValue() * ConstUtils.HOUR_MILLISECOND + times));
                }
            }

            if (timeLoc.equals("e")) {
                mes.set("endtime", new Timestamp(times));
                tmp = mes.getTimestamp("starttime");

                // 延长完工时间
                if (tmp != null) {
                    mes.set("duration", (date.getTime() - tmp.getTime()) / ConstUtils.HOUR_MILLISECOND);
                }
            }

            success = success && mes.update();
        }

        return success;
    }

    /**
     * 通过传递过的排程ID得到其后续需要调整时间和时长的排程集合
     * 
     * @param planId
     * @return
     */
    private List<ModuleEstSchedule> getNeedAdjustPlan(String planId) {
        List<ModuleEstSchedule> list = ModuleEstSchedule.dao.findCraftPlanById(planId);
        List<Object> mplb = new ArrayList<Object>();
        List<ModuleEstSchedule> planList;

        for (ModuleEstSchedule m : list) {
            mplb.add(m.get("PARTID"));
        }
        
        planList = ModuleEstSchedule.dao.getFollowUpPlanNotNull(list.get(0).get("MODULERESUMEID"), mplb.toArray(), list.get(0).get("RANKNUM"));

        return planList;
    }

}
