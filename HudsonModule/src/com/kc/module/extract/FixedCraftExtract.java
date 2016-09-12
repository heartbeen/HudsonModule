package com.kc.module.extract;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.dao.ExtractDao;
import com.kc.module.model.form.FixedCraftForm;
import com.kc.module.model.form.FixedScheForm;
import com.kc.module.model.form.PartCraftForm;
import com.kc.module.model.form.PartEstScheForm;
import com.kc.module.model.form.PartScheForm;
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.StringUtils;

public class FixedCraftExtract extends ExtractDao {

    // 设置不要显示该模具履历加工状态的零件负荷讯息
    private String hideStateId;

    public String getHideStateId() {
        return hideStateId;
    }

    public void setHideStateId(String hideStateId) {
        this.hideStateId = hideStateId;
    }

    @Override
    public Object extract() {
        ModuleEstimateLoadExtract extra = new ModuleEstimateLoadExtract();
        extra.setController(this.getController());
        // 获取查询的工艺类型
        int classid = this.getController().getParaToInt("classid");
        // 统计所有的加工讯息
        boolean isall = this.getController().getParaToBoolean("isall");
        // 每天约定小时数
        int dayhour = this.getController().getParaToInt("dayhour");
        int day = this.getController().getParaToInt("day");
        // 今天日期
        Timestamp nowDay = DateUtils.parseTimeStamp(DateUtils.getDateNow("yyyy-MM-dd") + " 00:00:00");
        // 结尾日期
        Timestamp nextDay = DateUtils.parseTimeStamp(DateUtils.getNextFiledOfToday("yyyy-MM-dd", 5, day + 1) + " 00:00:00");
        @SuppressWarnings("unchecked")
        Map<String, PartEstScheForm> partMap = (HashMap<String, PartEstScheForm>) extra.extract();
        // 查询指定的工艺排程计划
        List<Record> craftQuery = Db.find("SELECT MCC.CRAFTID,MC.CRAFTNAME FROM MD_CRAFT_CLASSIFY MCC LEFT JOIN "
                                          + "MD_CRAFT MC ON MCC.CRAFTID = MC.ID WHERE MCC.CLASSID = ? ORDER BY CRAFTID", classid);

        Map<String, FixedCraftForm> mFixed = new HashMap<String, FixedCraftForm>();

        for (Record rcd : craftQuery) {
            String craftid = rcd.getStr("CRAFTID");
            String craftname = rcd.getStr("CRAFTNAME");

            FixedCraftForm fcf = null;
            if (mFixed.containsKey(craftid)) {
                fcf = mFixed.get(craftid);
            } else {
                fcf = new FixedCraftForm();
                fcf.setCraftid(craftid);
                fcf.setCraftname(craftname);

                mFixed.put(craftid, fcf);
            }

            for (String key : partMap.keySet()) {
                PartEstScheForm pesf = partMap.get(key);
                // 如果该零件的模具加工履历为不能显示，则跳过
                if (!StringUtils.isEmpty(pesf.getResumestate()) && this.getHideStateId().equals(pesf.getResumestate())) {
                    continue;
                }

                if (pesf.getCraftmap().containsKey(craftid)) {
                    PartCraftForm pcf = pesf.getCraftmap().get(craftid);
                    for (PartScheForm psf : pcf.getCraftlist()) {
                        if (psf.getStatus() == 1
                            || (psf.getStatus() == 0 && (isall || InDistance(psf.getStartdate(), psf.getEnddate(), nowDay, nextDay)))) {
                            FixedScheForm fsf = new FixedScheForm();
                            double calhours = getUseHour(psf.getEvaluate(), psf.getUsehour(), psf.getDuration(), dayhour * (day + 1), isall);

                            fsf.setId(psf.getId());
                            fsf.setCraftname(pcf.getCraftname());
                            fsf.setEmpname(pesf.getOperator());
                            fsf.setEnddate(psf.getEnddate());
                            fsf.setEvaluate(calhours);
                            fsf.setModulecode(pesf.getModulecode());
                            fsf.setPartlistcode(pesf.getPartlistcode());
                            fsf.setRegionname(pesf.getDepartment());
                            fsf.setResumeid(pesf.getResumeid());
                            fsf.setStartdate(psf.getStartdate());
                            fsf.setStatename(pesf.getStatename());
                            fsf.setUsehour(fsf.getUsehour());
                            fsf.setProceed(psf.getStatus() == 1);
                            fsf.setExecute(psf.isProceed());
                            fsf.setBatchno(pesf.getBatchno());

                            fcf.setEvaluate(fcf.getEvaluate() + calhours);
                            fcf.getList().add(fsf);
                        }
                    }
                }
            }
        }

        StringBuilder builder = new StringBuilder();

        builder.append("SELECT MCC.CRAFTID, SUM(DI.MACLOAD) AS TOTAL ");
        builder.append("FROM MD_CRAFT_CLASSIFY MCC LEFT JOIN DEVICE_DEPART DD ON MCC.CRAFTID = DD.CRAFTID  ");
        builder.append("LEFT JOIN DEVICE_INFO DI ON DI.ID = DD.DEVICEID WHERE MCC.CLASSID = ? AND DI.ISENABLE = 0 ");
        builder.append("GROUP BY MCC.CRAFTID");

        List<Record> loadQuery = Db.find(builder.toString(), classid);
        for (Record rcd : loadQuery) {
            String l_craftid = rcd.getStr("CRAFTID");
            Number total = rcd.getNumber("TOTAL");
            // 设置机台工艺负荷
            double l_num = (total == null ? 0 : total.doubleValue());
            if (mFixed.containsKey(l_craftid)) {
                mFixed.get(l_craftid).setMacload(isall ? 0 : l_num * (day + 1));
            }
        }

        List<FixedCraftForm> lFixed = new ArrayList<FixedCraftForm>();
        for (String key : mFixed.keySet()) {
            FixedCraftForm fcf = mFixed.get(key);
            Collections.sort(fcf.getList(), new Comparator<FixedScheForm>() {
                @Override
                public int compare(FixedScheForm fsf1, FixedScheForm fsf2) {
                    if (fsf1.getStartdate() == null) {
                        fsf1.setStartdate(fsf2.getStartdate());
                    }

                    return fsf1.getStartdate().compareTo(fsf2.getStartdate());
                }
            });
            lFixed.add(fcf);
        }

        return lFixed;
    }

    private boolean InDistance(Timestamp startdate, Timestamp enddate, Timestamp now, Timestamp next) {
        if (startdate == null) {
            return false;
        }
        return !(next.getTime() < startdate.getTime());
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
    private double getUseHour(double eval, double act, double duration, int dayhour, boolean isall) {
        if (eval == 0 || duration == 0) {
            return 0;
        }

        double left = ((eval - act < 0) ? 0 : (eval - act));
        // 如果为全部，则统计全部用时
        if (isall) {
            return left;
        }

        return ArithUtils.round(((left) / eval * duration > dayhour ? (dayhour / duration * eval) : left), 2);
    }
}
