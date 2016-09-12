package com.kc.module.extract;

import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.dao.ExtractDao;
import com.kc.module.model.form.ArtifactCraftDateForm;
import com.kc.module.model.form.ArtifactCraftForm;
import com.kc.module.model.form.PartCraftForm;
import com.kc.module.model.form.PartEstScheForm;
import com.kc.module.model.form.PartScheForm;
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.StringUtils;

public class ArtifactWorkLoadExtract extends ExtractDao {

    // 设置不要显示该模具履历加工状态的零件负荷讯息
    private String hideStateId;

    public String getHideStateId() {
        return hideStateId;
    }

    public void setHideStateId(String hideStateId) {
        this.hideStateId = hideStateId;
    }

    private double rate;

    public double getRate() {
        return rate;
    }

    public void setRate(double rate) {
        this.rate = rate;
    }

    @Override
    public Object extract() {
        ModuleEstimateLoadExtract extra = new ModuleEstimateLoadExtract();
        extra.setController(this.getController());
        // 获取查询的工艺类型
        int classid = this.getController().getParaToInt("classid");
        // 统计所有的加工讯息
        // boolean isall = this.getController().getParaToBoolean("isall");
        // 每天约定小时数
        // int dayhour = this.getController().getParaToInt("dayhour");
        int day = this.getController().getParaToInt("day");

        @SuppressWarnings("unchecked")
        Map<String, PartEstScheForm> partMap = (HashMap<String, PartEstScheForm>) extra.extract();
        // 查询指定的工艺排程计划
        List<Record> craftQuery = Db.find("SELECT MCC.CRAFTID,MC.CRAFTNAME FROM MD_CRAFT_CLASSIFY MCC LEFT JOIN "
                                          + "MD_CRAFT MC ON MCC.CRAFTID = MC.ID WHERE MCC.CLASSID = ? ORDER BY CRAFTID", classid);

        Map<String, ArtifactCraftForm> mFixed = new HashMap<String, ArtifactCraftForm>();

        for (Record rcd : craftQuery) {
            String craftid = rcd.getStr("CRAFTID");
            String craftname = rcd.getStr("CRAFTNAME");

            ArtifactCraftForm acf = null;
            if (mFixed.containsKey(craftid)) {
                acf = mFixed.get(craftid);
            } else {
                acf = new ArtifactCraftForm();

                acf.setCraftid(craftid);
                acf.setCraftname(craftname);

                String startDate = null, nextDate = null;

                for (int m = 0; m < day; m++) {
                    // 生成预计天数的开始日期和结束日期
                    startDate = DateUtils.getNextFiledOfToday("yyyy-MM-dd", 5, m);
                    nextDate = DateUtils.getNextFiledOfToday("yyyy-MM-dd", 5, m + 1);

                    // 找到每日预计工艺讯息类并加载信息
                    ArtifactCraftDateForm acdf = null;

                    if (acf.getDatelist().containsKey(startDate)) {
                        acdf = acf.getDatelist().get(startDate);
                    } else {
                        acdf = new ArtifactCraftDateForm();

                        acdf.setStarttime(startDate);
                        acdf.setEndtime(nextDate);

                        acf.getDatelist().put(startDate, acdf);
                    }
                }

                mFixed.put(craftid, acf);
            }

            // 获取最大的开始时间
            Timestamp maxDateStamp = DateUtils.parseTimeStamp(DateUtils.getNextFiledOfToday("yyyy-MM-dd", 5, day + 1) + " 00:00:00");
            // 当前时间
            Timestamp nowStamp = DateUtils.getNowStampTime();
            double passedHour = getTodayPassedHour();
            // 结尾日期

            for (String key : partMap.keySet()) {
                PartEstScheForm pesf = partMap.get(key);
                // 如果该零件的模具加工履历为不能显示，则跳过
                if (!StringUtils.isEmpty(pesf.getResumestate()) && this.getHideStateId().equals(pesf.getResumestate())) {
                    continue;
                }

                if (pesf.getCraftmap().containsKey(craftid)) {
                    PartCraftForm pcf = pesf.getCraftmap().get(craftid);
                    for (PartScheForm psf : pcf.getCraftlist()) {

                        // 过滤出工序未加工完成的工序 |2表示工序完成
                        if (psf.getStatus() < 2) {
                            // 如果未处于加工状态且查询的结束时间小于排程开始时间跳过
                            if (psf.getStatus() == 0 && stampCompareTo(psf.getStartdate(), maxDateStamp)) {
                                continue;
                            }

                            // System.out.println(pesf.getModulecode()
                            // + " | "
                            // + pesf.getPartlistcode()
                            // + " | "
                            // + psf.getStatus()
                            // + " | "
                            // + pcf.getCraftname()
                            // + " | "
                            // +
                            // DateUtils.getTimeStampString(psf.getStartdate(),
                            // "yyyy-MM-dd")
                            // + " | "
                            // + psf.getEvaluate()
                            // + " | "
                            // + psf.getDuration()
                            // + " | "
                            // + ArithUtils.round(psf.getUsehour(), 1)
                            // + " | "
                            // + passedHour);
                            Map<String, Double> parseDayHour = getUseHour(psf.getStatus(),
                                                                          psf.getStartdate(),
                                                                          nowStamp,
                                                                          psf.getEvaluate(),
                                                                          psf.getDuration(),
                                                                          psf.getUsehour(),
                                                                          this.getRate(),
                                                                          passedHour);

                            if (parseDayHour != null) {
                                for (String sdate : parseDayHour.keySet()) {
                                    if (acf.getDatelist().containsKey(sdate)) {
                                        ArtifactCraftDateForm acdf = acf.getDatelist().get(sdate);
                                        acdf.setEvaluate(acdf.getEvaluate() + parseDayHour.get(sdate));
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        StringBuilder builder = new StringBuilder();

        // builder.append("SELECT MCC.CRAFTID, SUM(DI.MACLOAD) AS TOTAL ");
        // builder.append("FROM MD_CRAFT_CLASSIFY MCC LEFT JOIN DEVICE_DEPART DD ON MCC.CRAFTID = DD.CRAFTID  ");
        // builder.append("LEFT JOIN DEVICE_INFO DI ON DI.ID = DD.DEVICEID WHERE MCC.CLASSID = ? AND DI.ISENABLE = 0 ");
        // builder.append("GROUP BY MCC.CRAFTID");

        builder.append("SELECT MCC.CRAFTID, SUM(DI.MACLOAD) AS TOTAL, ROUND(SUM(MCC.USEHOUR * DI.MACLOAD), 1) AS USEHOUR ");
        builder.append("FROM (SELECT T.*, SYSDATE - TO_DATE(TO_CHAR(SYSDATE, 'yyyy-mm-dd'), 'yyyy-mm-dd') AS USEHOUR FROM MD_CRAFT_CLASSIFY T ");
        builder.append(") MCC LEFT JOIN DEVICE_DEPART DD ON MCC.CRAFTID = DD.CRAFTID LEFT JOIN DEVICE_INFO DI ON DI.ID = DD.DEVICEID ");
        builder.append("WHERE MCC.CLASSID = ? GROUP BY MCC.CRAFTID ");

        List<Record> loadQuery = Db.find(builder.toString(), classid);
        // 获取指定格式的今天的日期
        String todayStr = DateUtils.getDateNow("yyyy-MM-dd");
        for (Record rcd : loadQuery) {
            String l_craftid = rcd.getStr("CRAFTID");
            Number total = rcd.getNumber("TOTAL");
            Number usehour = rcd.getNumber("USEHOUR");
            // 设置机台工艺负荷
            double l_num = (total == null ? 0 : total.doubleValue());
            // 当天已用负荷数
            double l_usehour = (usehour == null ? 0 : usehour.doubleValue());

            double leftload = ArithUtils.round((l_num - l_usehour), 1);

            if (mFixed.containsKey(l_craftid)) {
                ArtifactCraftForm acf = mFixed.get(l_craftid);

                for (String key : acf.getDatelist().keySet()) {
                    acf.getDatelist().get(key).setMacload(key.equals(todayStr) ? leftload : l_num);
                }
            }
        }

        return mFixed;
    }

    /**
     * 获取实际时间
     * 
     * @param eval
     * @param act
     * @param duration
     * @param dayhour
     * @return
     */
    private Map<String, Double> getUseHour(int status,
                                           Timestamp startdate,
                                           Timestamp nowdate,
                                           double eval,
                                           double duration,
                                           double act,
                                           double rate,
                                           double psthour) {
        if (eval == 0 || duration == 0) {
            return (null);
        }

        Map<String, Double> dayHours = new HashMap<String, Double>();

        // 如果排程开始时间大于当前时间则以排程时间为准，否则以当前时间为准
        startdate = (status == 1 ? nowdate : (startdate.getTime() > nowdate.getTime() ? startdate : nowdate));

        // 过滤剩余时间
        double left_eval = ((eval - act < 0) ? eval * rate : (eval - act));

        String today = DateUtils.getDateNow("yyyy-MM-dd");

        double left_hour = (24 - psthour) * (eval / duration);

        dayHours.put(today, left_hour);

        if (left_eval > left_hour) {
            // 剩余预计时间
            double rest_day = left_eval - left_hour;
            // 计算的剩余日期
            int left_day = (int) Math.ceil(((left_eval - left_hour) / eval * duration / 24));

            for (int k = 0; k < left_day; k++) {

                double std_hour = eval / duration * 24;
                double unit_hour = 0;

                if (k == left_day - 1) {
                    unit_hour = rest_day - std_hour * (left_day - 1);
                } else {
                    unit_hour = std_hour;
                }

                String foreDay = DateUtils.getNextField(today, "yyyy-MM-dd", "yyyy-MM-dd", 5, k + 1);
                dayHours.put(foreDay, unit_hour);
            }
        }

        return dayHours;
    }

    private double getTodayPassedHour() {
        String dateNow = DateUtils.getDateNow("yyyy-MM-dd");

        Timestamp todayStart = DateUtils.parseTimeStamp(dateNow + " 00:00:00");
        Timestamp todayNow = DateUtils.getNowStampTime();

        return ArithUtils.round(((double) (todayNow.getTime() - todayStart.getTime()) / 1000 / 3600), 2);
    }

    private boolean stampCompareTo(Timestamp a, Timestamp b) {
        if (a == null || b == null) {
            return false;
        }

        return (a.getTime() >= b.getTime());
    }

}
