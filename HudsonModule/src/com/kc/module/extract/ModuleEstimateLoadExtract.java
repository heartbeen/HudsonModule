package com.kc.module.extract;

import java.sql.Timestamp;
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
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.JsonUtils;
import com.kc.module.utils.StringUtils;

public class ModuleEstimateLoadExtract extends ExtractDao {

    /**
     * 外发全加工工艺ID
     */
    private String doAll;
    // 设置分割符
    private String separator;

    public String getSeparator() {
        return separator;
    }

    public void setSeparator(String separator) {
        this.separator = separator;
    }

    /**
     * 实际的加工状态ID
     */
    private List<String> actStateid;

    public List<String> getActStateid() {
        return actStateid;
    }

    public void setActStateid(List<String> actStateid) {
        this.actStateid = actStateid;
    }

    public List<String> getFinishStateid() {
        return finishStateid;
    }

    public void setFinishStateid(List<String> finishStateid) {
        this.finishStateid = finishStateid;
    }

    /**
     * 完成加工状态ID
     */
    private List<String> finishStateid;

    public String getDoAll() {
        return doAll;
    }

    public void setDoAll(String doAll) {
        this.doAll = doAll;
    }

    private int classid;

    public int getClassid() {
        return classid;
    }

    public void setClassid(int classid) {
        this.classid = classid;
    }

    @Override
    public Object extract() {
        // 开始状态
        this.setActStateid(JsonUtils.parseJsArrayList(this.getController().getPara("astateid")));
        // 完成状态
        this.setFinishStateid(JsonUtils.parseJsArrayList(this.getController().getPara("fstateid")));
        // 工艺类型
        this.setClassid(this.getController().getParaToInt("classid"));
        // 全加工工艺
        this.setDoAll(this.getController().getPara("doall"));

        StringBuilder builder = new StringBuilder();

        String rsmid = this.getController().getPara("resumeid");

        builder.append("SELECT MPI.PARTBARLISTCODE, MPI.MODULERESUMEID, DD.BATCHNO, EI.EMPNAME, RD.NAME AS REGIONNAME, MPL.PARTLISTCODE ");
        builder.append(", ML.MODULECODE, MR.RESUMESTATE, (SELECT CRAFTNAME FROM MD_CRAFT WHERE ID = DD.CRAFTID ");
        builder.append(") AS DCRAFTNAME, DD.CRAFTID AS DCRAFTID, MPI.PARTSTATEID, (SELECT NAME FROM MD_PROCESS_STATE WHERE ID = MPI.PARTSTATEID ");
        builder.append(") AS STATENAME, MES.ID AS EID, MES.CRAFTID, MES.STARTTIME, MES.ENDTIME, MES.EVALUATE, MES.DURATION, MC.CRAFTNAME, MPF.ID AS FID ");
        builder.append("FROM MD_PROCESS_INFO MPI LEFT JOIN MD_RESUME MR ON MPI.MODULERESUMEID = MR.ID LEFT JOIN DEVICE_DEPART DD ON MPI.DEVICEPARTID = DD.ID  ");
        builder.append("LEFT JOIN EMPLOYEE_INFO EI ON DD.EMPID = EI.ID LEFT JOIN REGION_DEPART RD ON MPI.CURRENTDEPTID = RD.ID ");
        builder.append("LEFT JOIN MD_PART_LIST MPL ON MPI.PARTBARLISTCODE = MPL.PARTBARLISTCODE LEFT JOIN MODULELIST ML ON ");
        builder.append(" MPL.MODULEBARCODE = ML.MODULEBARCODE LEFT JOIN MD_EST_SCHEDULE MES ON MPI.MODULERESUMEID = MES.MODULERESUMEID ");
        builder.append("AND MES.PARTID = MPI.PARTBARLISTCODE LEFT JOIN MD_CRAFT MC ON MES.CRAFTID = MC.ID  ");
        builder.append("LEFT JOIN MD_PROCESS_FINISH MPF ON MPI.MODULERESUMEID = MPF.MODULERESUMEID AND MPI.PARTBARLISTCODE = MPF.PARTBARLISTCODE WHERE 1 = 1 ");

        if (!StringUtils.isEmpty(rsmid)) {
            builder.append("AND MPI.MODULERESUMEID = '").append(rsmid).append("' ");
        }

        builder.append(" AND MPI.PARTBARLISTCODE IS NOT NULL AND MES.TYPEID IS NULL AND MES.ID IS NOT NULL ");
        builder.append("ORDER BY MPI.PARTBARLISTCODE, MES.RANKNUM ");

        Map<String, PartEstScheForm> partMap = new HashMap<String, PartEstScheForm>();

        List<Record> estQuery = Db.find(builder.toString());
        for (Record rcd : estQuery) {
            // 零件唯一号
            String partbarlistcode = rcd.getStr("PARTBARLISTCODE");
            // 机台编号
            String batchno = rcd.getStr("BATCHNO");
            // 操作人员
            String empname = rcd.getStr("EMPNAME");
            String resumeid = rcd.getStr("MODULERESUMEID");
            // 机台工艺号
            String dcraftid = StringUtils.parseString(rcd.getStr("DCRAFTID"));
            // 零件状态唯一号
            String partstateid = StringUtils.parseString(rcd.getStr("PARTSTATEID"));
            // 当前工艺
            String dcraftname = rcd.getStr("DCRAFTNAME");
            // 所在单位
            String regionname = rcd.getStr("REGIONNAME");
            // 零件编号
            String partlistcode = rcd.getStr("PARTLISTCODE");
            // 模具编号
            String modulecode = rcd.getStr("MODULECODE");
            // 零件状态
            String statename = rcd.getStr("STATENAME");
            // 模具履历加工状态代号
            String resumestate = rcd.getStr("RESUMESTATE");
            // 排程唯一号
            String eid = rcd.getStr("EID");
            // 排程的工艺ID
            String craftid = StringUtils.parseString(rcd.getStr("CRAFTID"));
            // 排程开始时间
            Timestamp starttime = rcd.getTimestamp("STARTTIME");
            // 排程结束时间
            Timestamp endtime = rcd.getTimestamp("ENDTIME");
            // 排程预计时间
            Number evaluate = rcd.getNumber("EVALUATE");
            // 排程时间间隔
            Number duration = rcd.getNumber("DURATION");
            // 排程工艺名称
            String craftname = rcd.getStr("CRAFTNAME");
            // 加工完成标识
            String fid = rcd.getStr("FID");

            PartEstScheForm pesf = null;

            if (partMap.containsKey(partbarlistcode)) {
                pesf = partMap.get(partbarlistcode);
            } else {
                pesf = new PartEstScheForm();

                pesf.setBatchno(batchno);
                pesf.setCraftname(dcraftname);
                pesf.setDepartment(regionname);
                pesf.setModulecode(modulecode);
                pesf.setResumeid(resumeid);
                pesf.setOperator(empname);
                pesf.setPartlistcode(partlistcode);
                pesf.setStatename(statename);
                pesf.setResumestate(resumestate);
                pesf.setFinish(!StringUtils.isEmpty(fid));

                partMap.put(partbarlistcode, pesf);
            }

            if (!StringUtils.isEmpty(craftid)) {
                PartCraftForm pcf = null;
                if (pesf.getCraftmap().containsKey(craftid)) {
                    pcf = pesf.getCraftmap().get(craftid);
                } else {
                    pcf = new PartCraftForm();
                    pcf.setCraftid(craftid);
                    pcf.setCraftname(craftname);

                    pesf.getCraftmap().put(craftid, pcf);
                }

                PartScheForm psf = new PartScheForm();

                psf.setId(eid);
                // 设置开始时间
                psf.setStartdate(starttime);
                // 设置结束时间
                psf.setEnddate(endtime);
                // 设置预计用时
                psf.setEvaluate(evaluate == null ? 0 : evaluate.doubleValue());
                psf.setDuration(duration == null ? 0 : duration.doubleValue());

                if (dcraftid.equals(craftid) && this.getActStateid().contains(partstateid)) {
                    psf.setProceed(true);
                }
                // 该排程工艺是否完成加工
                if (!StringUtils.isEmpty(fid)) {
                    psf.setStatus(2);
                }

                pcf.getCraftlist().add(psf);
            }
        }

        builder = new StringBuilder();

        builder.append("SELECT MPI.PARTBARLISTCODE, MPR.LPARTSTATEID, NVL(PO.OUTCRAFTID, MPR.LPROCRAFTID) AS MCRAFTID, MPR.LRCDTIME, ");
        builder.append("MPR.NRCDTIME, MPR.PARTCOUNT, MPR.ISTIME, PO.ISFINISH FROM MD_PROCESS_INFO MPI ");
        builder.append("LEFT JOIN MD_PROCESS_RESUME MPR ON MPI.MODULERESUMEID = MPR.RSMID ");
        builder.append("AND MPI.PARTBARLISTCODE = MPR.PARTBARLISTCODE LEFT JOIN PART_OUTBOUND PO ON MPR.OUTID = PO.ID WHERE 1 = 1 ");

        if (!StringUtils.isEmpty(rsmid)) {
            builder.append("AND MPI.MODULERESUMEID = '").append(rsmid).append("' ");
        }

        builder.append("AND MPR.ID IS NOT NULL ORDER BY MPI.PARTBARLISTCODE, MPR.LRCDTIME ");

        List<Record> actQuery = Db.find(builder.toString());

        for (Record rcd : actQuery) {
            String act_partid = rcd.getStr("PARTBARLISTCODE");

            // 如果工件唯一号为空,跳过这条记录
            if (StringUtils.isEmpty(act_partid)) {
                continue;
            }

            String act_stateid = rcd.getStr("LPARTSTATEID");

            String act_craftid = rcd.getStr("MCRAFTID");

            Timestamp act_start = rcd.getTimestamp("LRCDTIME");
            Timestamp act_end = rcd.getTimestamp("NRCDTIME");

            String pcount = rcd.getStr("PARTCOUNT");
            // 是否计时|0计时|1不计时
            int istime = ArithUtils.parseInt(rcd.getStr("ISTIME"), 1);

            // 是否外发
            boolean isout = (rcd.getNumber("ISFINISH") != null);

            // 如果预计排程里不含有该零件的排程,跳过
            if (!partMap.containsKey(act_partid)) {
                continue;
            }

            PartEstScheForm pesf = partMap.get(act_partid);

            if (isout) {
                // 如果工艺为空,则返回
                if (StringUtils.isEmpty(act_craftid)) {
                    continue;
                }

                // 如果工艺为全加工,则工件的所有工艺设置为完工
                if (this.getDoAll().equals(act_craftid)) {
                    for (String key : pesf.getCraftmap().keySet()) {
                        PartCraftForm pcf = pesf.getCraftmap().get(key);
                        for (PartScheForm psf : pcf.getCraftlist()) {
                            psf.setStatus(2);
                        }
                    }
                } else {
                    // 找到工艺集合,工艺用逗号隔开,将其分开,与预估工序进行比对
                    String[] m_craft = act_craftid.split(",", -1);
                    for (String mct : m_craft) {
                        // 如果找不到这个工艺类型，将其跳过
                        PartCraftForm pcf = pesf.getCraftmap().get(mct);
                        if (pcf == null) {
                            continue;
                        }
                        if (pcf.getCraftlist().size() > pcf.getCursorid()) {
                            PartScheForm psf = pcf.getCraftlist().get(pcf.getCursorid());
                            psf.setStatus(2);

                            // 将工艺中顺序游标+1
                            pcf.setCursorid(pcf.getCursorid() + 1);
                        }
                    }
                }
            } else {
                if (istime == 0) {

                    PartCraftForm pcf = pesf.getCraftmap().get(act_craftid);
                    if (pcf == null) {
                        continue;
                    }

                    if (pcf.getCraftlist().size() > pcf.getCursorid()) {
                        PartScheForm psf = pcf.getCraftlist().get(pcf.getCursorid());
                        if (psf.getActstart() == null) {
                            psf.setActstart(act_start);
                        }

                        psf.setUsehour(psf.getUsehour() + getActHour(act_start, act_end, pcount));
                        // 设置零件的加工状态加工中1完成2
                        psf.setStatus(pesf.isFinish() ? 2 : 1);
                    }
                }

                if (this.getFinishStateid().contains(act_stateid)) {
                    PartCraftForm pcf = pesf.getCraftmap().get(act_craftid);
                    if (pcf == null) {
                        continue;
                    }
                    if (pcf.getCraftlist().size() > pcf.getCursorid()) {
                        PartScheForm psf = pcf.getCraftlist().get(pcf.getCursorid());
                        // 设置实际完工时间
                        if (psf.getActend() == null) {
                            psf.setActend(act_end);
                        }

                        psf.setStatus(2);

                        // 将工艺中顺序游标+1
                        pcf.setCursorid(pcf.getCursorid() + 1);
                    }
                }
            }
        }

        return partMap;
    }

    /**
     * 计算加工工时
     * 
     * @param start
     * @param end
     * @param partcount
     * @return
     */
    private double getActHour(Timestamp start, Timestamp end, String partcount) {
        if (start == null) {
            return 0d;
        }

        end = (end == null ? DateUtils.getNowStampTime() : end);

        int pcount = ArithUtils.parseInt(partcount, 1);
        double hours = ((double) (end.getTime() - start.getTime()) / 1000 / 3600 / pcount);

        return ArithUtils.round(hours, 3);
    }
}
