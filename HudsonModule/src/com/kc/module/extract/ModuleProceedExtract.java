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
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.StringUtils;

public class ModuleProceedExtract extends ExtractDao {
    public double getRate() {
        return rate;
    }

    public void setRate(double rate) {
        this.rate = (rate > 1 ? 1 : rate);
    }

    private double rate;

    @Override
    public Object extract() {
        try {
            ModuleEstimateLoadExtract mele = new ModuleEstimateLoadExtract();
            mele.setController(getController());
            @SuppressWarnings("unchecked")
            Map<String, PartEstScheForm> map = (HashMap<String, PartEstScheForm>) mele.extract();
            // 查询待统计的工艺类型
            int classid = this.getController().getParaToInt("classid");
            String stateid = getController().getPara("stateid");

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

            Map<String, TaskInfo> moduleload = new HashMap<String, TaskInfo>();
            for (String key : map.keySet()) {
                PartEstScheForm pesf = map.get(key);

                String resumeid = pesf.getResumeid();
                TaskInfo ti = null;
                if (!moduleload.containsKey(resumeid)) {
                    ti = new TaskInfo();
                    moduleload.put(resumeid, ti);
                } else {
                    ti = moduleload.get(resumeid);
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

            StringBuilder sql = new StringBuilder();

            sql.append("SELECT MLI.*, NVL(ROUND(CASE WHEN EHOUR = 0 THEN 0 WHEN AHOUR > EHOUR THEN 100 ELSE AHOUR * 100 / EHOUR END, 1),0) AS ACTUAL,");
            sql.append("  NVL(ROUND(CASE WHEN SPER > 1 THEN 100 ELSE SPER * 100 END, 1),0) AS SCHEDULE FROM ( ");
            sql.append("    SELECT MR.ID, MR.RESUMESTATE, MR.MODULEBARCODE, (SELECT COUNT(*) FROM MD_RESUME_RECORD WHERE RESUMESTATE IN ('20402','20403') AND MODULEBARCODE = MR.MODULEBARCODE) AS MCOUNT, ML.MODULECODE, FY.SHORTNAME, ML.MODULECLASS, ML.GUESTCODE ");
            sql.append("      ,MR.INSTALLER,MR.ISURGENT, ML.PRODUCTNAME,TO_CHAR(MR.FITDATE,'yyyy-mm-dd') AS FITDATE, ML.UNITEXTRAC, ML.WORKPRESSURE, ML.PLASTIC, MRR.REMARK AS MODULEINTRO, ");
            sql.append("      MR.DEVISER, MR.PROCESSED, MRR.STARTTIME, MRR.ENDTIME AS INITTRYTIME, MPS.NAME AS RSENAME, 0 AS EHOUR, 0 AS AHOUR, ");
            sql.append(" ROUND((CASE WHEN SYSDATE > MRR.STARTTIME THEN SYSDATE - MRR.STARTTIME ELSE 0 END) / ");
            sql.append("  (MRR.ENDTIME - MRR.STARTTIME) * 100,1) AS SPER ,ROUND((MRR.ENDTIME - SYSDATE) * 24, 1) AS DELAYHOUR ");
            sql.append("  FROM (SELECT * FROM MD_RESUME ");

            if (!StringUtils.isEmpty(stateid)) {
                sql.append("WHERE RESUMESTATE IN (");
                sql.append(stateid);
                sql.append(")");
            }
            sql.append("  ) MR LEFT JOIN MD_RESUME_RECORD MRR ON MR.ID = MRR.ID  ");
            sql.append("  LEFT JOIN MODULELIST ML ON MR.MODULEBARCODE = ML.MODULEBARCODE ");
            sql.append("  LEFT JOIN MD_PROCESS_STATE MPS ON MR.RESUMESTATE = MPS.ID ");
            sql.append("  LEFT JOIN FACTORY FY ON ML.GUESTID = FY.ID) MLI ORDER BY RESUMESTATE");

            List<Record> modulelist = Db.find(sql.toString());

            for (Record ml : modulelist) {
                String id = ml.getStr("ID");
                if (!StringUtils.isEmpty(id) && moduleload.containsKey(id)) {
                    TaskInfo ts = moduleload.get(id);

                    double real = (ts.getTotaltime() == 0 ? 0 : (ts.getFinishtime() / ts.getTotaltime() * 100));
                    ml.set("ACTUAL", ArithUtils.round(real, 1));
                }
            }

            return modulelist;
        }
        catch (Exception e) {
            return (null);
        }
    }
}

/**
 * 任务完成讯息统计
 * 
 * @author ASUS
 * 
 */
class TaskInfo {
    public double getFinishtime() {
        return finishtime;
    }

    public void setFinishtime(double finishtime) {
        this.finishtime = finishtime;
    }

    public double getTotaltime() {
        return totaltime;
    }

    public void setTotaltime(double totaltime) {
        this.totaltime = totaltime;
    }

    public boolean isFinish() {
        return finish;
    }

    public void setFinish(boolean finish) {
        this.finish = finish;
    }

    private double finishtime;
    private double totaltime;
    private boolean finish;
}
