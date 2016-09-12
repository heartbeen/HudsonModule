package com.kc.module.extract;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.dao.ExtractDao;
import com.kc.module.model.form.PartCraftForm;
import com.kc.module.model.form.PartEstScheForm;
import com.kc.module.model.form.PartScheForm;
import com.kc.module.utils.StringUtils;

public class ModulePartProgressExtract extends ExtractDao {
    public double getRate() {
        return rate;
    }

    public void setRate(double rate) {
        this.rate = (rate > 1 ? 1 : rate);
    }

    // 设置已经完成加工时间而未完成加工的零件为标准时间的完成百分比
    private double rate;

    @Override
    public Object extract() {
        ModuleEstimateLoadExtract mele = new ModuleEstimateLoadExtract();
        mele.setController(getController());

        @SuppressWarnings("unchecked")
        Map<String, PartEstScheForm> map = (HashMap<String, PartEstScheForm>) mele.extract();

        int classid = this.getController().getParaToInt("classid");

        // 获取工艺讯息
        List<Record> craftQuery = Db.find("SELECT MCC.CRAFTID,MC.CRAFTNAME FROM MD_CRAFT_CLASSIFY MCC LEFT JOIN "
                                          + "MD_CRAFT MC ON MCC.CRAFTID = MC.ID WHERE MCC.CLASSID = ? ORDER BY CRAFTID", classid);
        // 统计工艺加工的集合
        List<String> craftList = new ArrayList<String>();
        for (Record rcd : craftQuery) {
            String n_craftid = rcd.getStr("craftid");
            if (!StringUtils.isEmpty(n_craftid)) {
                craftList.add(n_craftid);
            }
        }

        Map<String, TaskInfo> partload = new HashMap<String, TaskInfo>();
        for (String key : map.keySet()) {
            PartEstScheForm pesf = map.get(key);

            TaskInfo ti = null;
            if (!partload.containsKey(key)) {
                ti = new TaskInfo();
                ti.setFinish(pesf.isFinish());

                partload.put(key, ti);
            } else {
                ti = partload.get(key);
            }

            for (String cf : pesf.getCraftmap().keySet()) {
                // 如果零件的工艺包含指定的工艺,则统计时间否则跳过
                if (craftList.contains(cf)) {
                    PartCraftForm pcf = pesf.getCraftmap().get(cf);

                    for (PartScheForm psf : pcf.getCraftlist()) {
                        ti.setTotaltime(ti.getTotaltime() + psf.getEvaluate());

                        if (psf.getStatus() == 2) {
                            ti.setFinishtime(ti.getFinishtime() + psf.getEvaluate());
                        } else {
                            double lefttime = psf.getEvaluate() - psf.getUsehour();
                            ti.setFinishtime(ti.getFinishtime() + (lefttime < 0 ? psf.getEvaluate() * this.getRate() : psf.getUsehour()));
                        }
                    }
                }
            }
        }

        return partload;
    }

}
