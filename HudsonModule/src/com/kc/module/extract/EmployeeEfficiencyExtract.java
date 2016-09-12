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
import com.kc.module.model.form.EmployeeWorkForm;
import com.kc.module.model.form.MCraftForm;
import com.kc.module.model.form.MCraftInfoForm;
import com.kc.module.model.form.MEstimateRateForm;
import com.kc.module.model.form.MPartInfoForm;
import com.kc.module.model.form.MScheduleEstForm;
import com.kc.module.model.form.MScheduleForm;
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.StringUtils;

public class EmployeeEfficiencyExtract extends ExtractDao {

    public String getStart() {
        return start;
    }

    public void setStart(String start) {
        this.start = start;
    }

    public String getEnd() {
        return end;
    }

    public void setEnd(String end) {
        this.end = end;
    }

    public int getMax() {
        return max;
    }

    public void setMax(int max) {
        this.max = max;
    }

    private String start;
    private String end;
    private int max;

    @Override
    public Object extract() {
        String format = this.getController().getPara("format");
        String empbarcode = this.getController().getPara("empbarcode");
        String states = this.getController().getPara("states");
        // 是否按月度统计
        boolean ismonth = this.getController().getParaToBoolean("ismonth");
        // 是否统计所有员工
        boolean istotal = this.getController().getParaToBoolean("istotal");

        // 部门唯一号
        String stepid = this.getController().getPara("stepid");

        String monthStart = this.getController().getPara("startdate");
        String monthEnd = this.getController().getPara("enddate");

        String javaFormat = "yyyy-MM-dd";

        if (ismonth) {
            monthStart = DateUtils.getFristOfMonth(monthStart, javaFormat);
            monthEnd = DateUtils.getLastOfMonth(monthStart, javaFormat);
            monthEnd = DateUtils.getNextField(monthEnd, javaFormat, javaFormat, 5, 1);
        }

        this.setStart(monthStart);
        this.setEnd(monthEnd);

        if (StringUtils.isEmpty(this.getStart()) || StringUtils.isEmpty(this.getEnd())) {
            return (false);
        }

        // 查询的开始和结束时间最长为60天
        if (!DateUtils.setSpace(this.getStart(), this.getEnd(), javaFormat, 5, this.getMax())) {
            return (false);
        }

        // 查询开始时间
        Timestamp queryStart = DateUtils.parseTimeStamp(this.getStart() + " 00:00:00");
        // 查询结束时间
        Timestamp queryEnd = DateUtils.parseTimeStamp(this.getEnd() + " 00:00:00");

        Timestamp nowTime = DateUtils.getNowStampTime();

        if (queryStart.getTime() > queryEnd.getTime()) {
            return (false);
        }

        // 获取零件工艺排程
        Map<String, MScheduleForm> mEstForm = new HashMap<String, MScheduleForm>();

        StringBuilder builder = new StringBuilder();

        builder.append("SELECT ID, MODULERESUMEID, PARTID, CRAFTID, TO_CHAR(STARTTIME, ?) AS STARTTIME ");
        builder.append(", TO_CHAR(ENDTIME, ?) AS ENDTIME, RANKNUM, EVALUATE FROM MD_EST_SCHEDULE ");
        builder.append("WHERE (MODULERESUMEID, PARTID) IN (SELECT DISTINCT RSMID, PARTBARLISTCODE FROM ( ");
        builder.append("SELECT MPR.*, CASE WHEN LRCDTIME >= TO_DATE(?, ?) OR NRCDTIME < TO_DATE(?, ?) THEN 0 ELSE 1 END AS SIG ");
        builder.append("FROM MD_PROCESS_RESUME MPR WHERE ISTIME = ?) WHERE SIG > 0) AND TYPEID IS NULL ");
        builder.append("ORDER BY MODULERESUMEID, PARTID, RANKNUM ");

        List<Record> estimate = Db.find(builder.toString(), format, format, this.getEnd(), format, this.getStart(), format, 0);
        for (Record rcd : estimate) {
            // ID号
            String id = rcd.getStr("ID");
            // 履历号
            String resumeid = rcd.getStr("MODULERESUMEID");
            // 工件号
            String partid = rcd.getStr("PARTID");
            // 工艺号
            String craftid = rcd.getStr("CRAFTID");
            // 开始时间
            String starttime = rcd.getStr("STARTTIME");
            // 结束时间
            String endtime = rcd.getStr("ENDTIME");
            // 排程顺序
            int ranknum = (rcd.getNumber("RANKNUM") == null ? 0 : rcd.getNumber("RANKNUM").intValue());
            // 所用时间
            double evaluate = (rcd.getNumber("EVALUATE") == null ? 0 : rcd.getNumber("EVALUATE").doubleValue());

            if (StringUtils.isEmpty(id) || StringUtils.isEmpty(resumeid)) {
                continue;
            }

            // 创建合并号
            String mergeid = resumeid + "-" + partid;

            MScheduleForm msf = null;

            MScheduleEstForm msef = new MScheduleEstForm();
            // 设置模具排程ID
            msef.setId(id);
            // 设置工艺代号
            msef.setCraftid(craftid);
            // 设置开始时间
            msef.setStarttime(starttime);
            // 设置结束时间
            msef.setEndtime(endtime);
            // 设置有效时间
            msef.setEvaluate(evaluate);
            // 设置加工顺序
            msef.setRanknum(ranknum);

            if (!mEstForm.containsKey(mergeid)) {
                msf = new MScheduleForm();

                msf.setPartbarlistcode(partid);
                msf.setModuleresumeid(resumeid);

                msf.getCraftlist().add(msef);

                mEstForm.put(mergeid, msf);
            } else {
                msf = mEstForm.get(mergeid);
                msf.getCraftlist().add(msef);
            }
        }

        builder = new StringBuilder();

        builder.append("SELECT DD.PARTBARLISTCODE, MPL.PARTLISTCODE, ML.MODULECODE, MC.CRAFTNAME, EI.EMPNAME, MPS.NAME AS RSTATE, TO_CHAR(MRR.STARTTIME,'yymmdd') AS RDATE ");
        builder.append(", DD.RSMID, DD.LPROCRAFTID, DD.LEMPID, DD.LPARTSTATEID, ROUND((NVL(DD.NRCDTIME,MPF.FINISHDATE) - DD.LRCDTIME) * 24, 3) AS UHOUR ");
        builder.append(", DD.PARTCOUNT, DD.ISTIME, MPL.ISFIXED, MPF.ID AS MPFID, DD.LRCDTIME, NVL(DD.NRCDTIME,MPF.FINISHDATE) AS NRCDTIME FROM (SELECT * FROM ");
        builder.append("MD_PROCESS_RESUME WHERE (RSMID, PARTBARLISTCODE, LPROCRAFTID) IN (SELECT DISTINCT RSMID, PARTBARLISTCODE, LPROCRAFTID FROM ( ");
        builder.append("SELECT MPR.*, CASE WHEN LRCDTIME >= TO_DATE(?,?) ");
        builder.append("OR NRCDTIME < TO_DATE(?,?) THEN 0 ELSE 1 END AS SIG FROM MD_PROCESS_RESUME MPR WHERE ISTIME = 0) WHERE SIG > 0)) DD ");
        builder.append("LEFT JOIN MD_PART_LIST MPL ON DD.PARTBARLISTCODE = MPL.PARTBARLISTCODE  ");
        builder.append("LEFT JOIN MODULELIST ML ON MPL.MODULEBARCODE = ML.MODULEBARCODE  ");
        builder.append("LEFT JOIN MD_CRAFT MC ON DD.LPROCRAFTID = MC.ID  ");
        builder.append("LEFT JOIN MD_RESUME_RECORD MRR ON DD.RSMID = MRR.ID  ");
        builder.append("LEFT JOIN MD_PROCESS_STATE MPS ON MRR.RESUMESTATE = MPS.ID  ");
        builder.append("LEFT JOIN EMPLOYEE_INFO EI ON DD.LEMPID = EI.ID  ");
        builder.append("LEFT JOIN MD_PROCESS_FINISH MPF ON DD.RSMID = MPF.MODULERESUMEID ");
        builder.append("AND DD.PARTBARLISTCODE = MPF.PARTBARLISTCODE ORDER BY DD.RSMID, DD.PARTBARLISTCODE, DD.LRCDTIME");

        List<Record> querys = Db.find(builder.toString(), this.getEnd(), format, this.getStart(), format);

        // 获取员工讯息
        Map<String, String> mEmp = new HashMap<String, String>();
        // 存放零件加工讯息
        Map<String, MPartInfoForm> mPartInfo = new HashMap<String, MPartInfoForm>();

        for (Record record : querys) {
            // 模具履历号
            String resumeid = record.getStr("RSMID");
            // 零件唯一号
            String partbarlistcode = record.getStr("PARTBARLISTCODE");
            // 如果模具履历号或者零件唯一号为空,则返回
            if (StringUtils.isEmpty(resumeid) || StringUtils.isEmpty(partbarlistcode)) {
                continue;
            }

            // 零件编号
            String partlistcode = record.getStr("PARTLISTCODE");
            // 模具编号
            String modulecode = record.getStr("MODULECODE");
            // 工艺名称
            String craftname = record.getStr("CRAFTNAME");
            // 员工姓名
            String empname = record.getStr("EMPNAME");
            // 工艺代号
            String craftid = record.getStr("LPROCRAFTID");
            // 员工代号
            String empid = record.getStr("LEMPID");
            // 零件状态号
            String partstateid = record.getStr("LPARTSTATEID");
            // 用时
            double uhour = (record.getNumber("UHOUR") == null ? 0 : record.getNumber("UHOUR").doubleValue());
            // 零件个数
            int partcount = ArithUtils.parseInt(record.getStr("PARTCOUNT"), 1);

            double unithour = (uhour / partcount);

            //
            Timestamp startdate = record.getTimestamp("LRCDTIME");

            Timestamp enddate = record.getTimestamp("NRCDTIME");

            // 如果查询结束时间对比当前时间，则依据当前时间为准
            enddate = (enddate == null ? (queryEnd.getTime() > nowTime.getTime() ? nowTime : queryEnd) : enddate);

            // 是否计时
            int istime = ArithUtils.parseInt(record.getStr("ISTIME"), 1);
            // 是否固件
            int isfixed = record.getNumber("ISFIXED").intValue();
            // 是否完工的标识
            String mpfid = record.getStr("MPFID");
            // 履历状态
            String rstate = record.getStr("RSTATE");

            String rdate = record.getStr("RDATE");

            String rinfo = "";
            if (!StringUtils.isEmpty(rstate) && !StringUtils.isEmpty(rdate)) {
                rinfo = rstate + "[" + rdate + "]";
            }

            String hotid = resumeid + "-" + partbarlistcode;

            // 统计员工讯息
            if (!mEmp.containsKey(empid)) {
                mEmp.put(empid, empname);
            }

            MPartInfoForm mpif = null;
            if (!mPartInfo.containsKey(hotid)) {
                mpif = new MPartInfoForm();

                mpif.setModulecode(modulecode);
                mpif.setPartbarlistcode(partbarlistcode);
                mpif.setPartlistcode(partlistcode);
                mpif.setResumeid(resumeid);
                mpif.setResumeinfo(rinfo);
                mpif.setFixed(isfixed);

                mPartInfo.put(hotid, mpif);
            } else {
                mpif = mPartInfo.get(hotid);
            }
            // ====================================================================================
            MCraftInfoForm mif = null;
            if (!mpif.getCraftmap().containsKey(craftid)) {
                mif = new MCraftInfoForm();

                mif.setCraftname(craftname);
                mif.setCraftid(craftid);

                mpif.getCraftmap().put(craftid, mif);
            } else {
                mif = mpif.getCraftmap().get(craftid);
            }
            // ====================================================================================
            MCraftForm mcf = null;
            int craftcount = mif.getCrafthouse().size();
            if ((craftcount <= mif.getStreamid()) && (istime < 1)) {
                mcf = new MCraftForm();
                // 找到预计加工中对应的工艺讯息,获取预计加工需要的时间
                double esthour = getEstimateHour(mEstForm, hotid, craftid, mif.getStreamid());
                mcf.setEsthour(esthour);

                mif.getCrafthouse().add(mcf);
            } else {
                if (craftcount > mif.getStreamid()) {
                    mcf = mif.getCrafthouse().get(mif.getStreamid());
                } else {
                    continue;
                }
            }

            // // 设置实际加工时间
            if (istime < 1) {
                // 设置总的累积加工时间
                mcf.setActhour(mcf.getActhour() + unithour);
                // 获取间隔时间
                double regtime = getDistanceHour(queryStart, queryEnd, startdate, enddate, partcount);
                // 获取结束时间
                double fistime = getFinishedHour(queryStart, queryEnd, startdate, enddate, partcount);

                // 将人员加工时间累积
                if (mcf.getOpermap().containsKey(empid)) {
                    // 获取员工所用工时
                    EmployeeWorkForm ewf = mcf.getOpermap().get(empid);
                    // 设置加工结束时间
                    ewf.setEnd(enddate);

                    ewf.setWorktime(ewf.getWorktime() + regtime);
                    // 获取结束时间
                    mcf.getOvermap().put(empid, mcf.getOvermap().get(empid) + fistime);
                } else {
                    EmployeeWorkForm ewf = new EmployeeWorkForm();

                    ewf.setStart(startdate);
                    ewf.setEnd(enddate);
                    ewf.setWorktime(regtime);

                    mcf.getOpermap().put(empid, ewf);
                    // 获取结束时间
                    mcf.getOvermap().put(empid, fistime);
                }
            }

            if (stateIn(states, partstateid)) {
                if (!mcf.isFinish()) {
                    mcf.setFinish(true);
                    mif.setStreamid(mif.getStreamid() + 1);
                }
            }

            if (!StringUtils.isEmpty(mpfid)) {
                if (!mcf.isFinish()) {
                    mcf.setFinish(true);
                }
            }
        }

        List<Record> empRecord = null;

        // 如果是全部统计并且部门阶梯号不为空,则查询部门的员工讯息
        if (istotal && !StringUtils.isEmpty(stepid)) {

            builder = new StringBuilder();
            builder.append("SELECT EI.ID, EI.EMPNAME, EI.WORKNUMBER, RD.NAME AS REGIONNAME FROM EMPLOYEE_INFO EI")
                   .append(" LEFT JOIN REGION_DEPART RD ON EI.POSID = RD.ID WHERE ISENABLE IS NULL AND RD.STEPID LIKE ?");

            empRecord = Db.find(builder.toString(), stepid + "%");
        }

        List<MEstimateRateForm> estlist = new ArrayList<MEstimateRateForm>();
        for (String key : mPartInfo.keySet()) {

            MPartInfoForm mpif = mPartInfo.get(key);

            for (String msf_key : mpif.getCraftmap().keySet()) {
                MCraftInfoForm mcif = mpif.getCraftmap().get(msf_key);
                for (MCraftForm mcf : mcif.getCrafthouse()) {
                    for (String emp_key : mcf.getOpermap().keySet()) {
                        // 如果为全部统计或者与指定员工相同的工艺加工讯息
                        if ((istotal && toSelect(empRecord, emp_key)) || emp_key.equals(empbarcode)) {
                            MEstimateRateForm merf = new MEstimateRateForm();

                            double allH = ArithUtils.round(mcf.getActhour(), 2);
                            // 获取单个时间
                            EmployeeWorkForm h_ewf = mcf.getOpermap().get(emp_key);

                            double mills = ((mcf.isFinish() && ismonth) ? mcf.getOvermap().get(emp_key) : h_ewf.getWorktime());
                            double useH = ArithUtils.round(mills, 2);
                            double estH = ArithUtils.round(mcf.getEsthour(), 2);
                            double estC = (allH == 0 ? 0 : ArithUtils.round(mcf.getEsthour() * (useH / allH), 2));

                            if (useH > 0) {
                                merf.setActhour(useH);
                                merf.setAllhour(allH);
                                merf.setMillhour(estH);
                                merf.setEsthour(estC);
                                merf.setCraftid(mcif.getCraftid());
                                merf.setCraftname(mcif.getCraftname());
                                merf.setEmpid(emp_key);
                                merf.setEmpname(mEmp.get(emp_key));
                                merf.setFinish(mcf.isFinish());
                                merf.setModulecode(mpif.getModulecode());
                                merf.setPartlistcode(mpif.getPartlistcode());
                                merf.setStart(h_ewf.getStart());
                                merf.setEnd(h_ewf.getEnd());
                                merf.setRinfo(mpif.getResumeinfo());

                                estlist.add(merf);
                            }
                        }
                    }
                }
            }
        }

        // 对List中的零件加工讯息按开始结束时间进行排序
        Collections.sort(estlist, new Comparator<MEstimateRateForm>() {
            public int compare(MEstimateRateForm arg0, MEstimateRateForm arg1) {
                return arg0.getStart().compareTo(arg1.getStart());
            }
        });

        return estlist;
    }

    /**
     * 用于匹配在查询的员工记录当中有没有记录
     * 
     * @param elist
     * @param ebar
     * @return
     */
    private boolean toSelect(List<Record> elist, String ebar) {
        if (elist == null || StringUtils.isEmpty(ebar)) {
            return (false);
        }

        for (Record rcd : elist) {
            String eid = rcd.getStr("ID");
            if (!StringUtils.isEmpty(eid) && eid.equals(ebar)) {
                return (true);
            }
        }

        return (false);
    }

    private double getEstimateHour(Map<String, MScheduleForm> map, String mergeid, String craftid, int cnt) {
        // 返回-1表示没有该零件讯息
        if (!map.containsKey(mergeid)) {
            return 0d;
        }

        MScheduleForm msf = map.get(mergeid);
        // 零件预计工艺的集合
        List<MScheduleEstForm> craftlist = msf.getCraftlist();

        int counter = -1;
        for (MScheduleEstForm msef : craftlist) {
            // 如果工艺排程中的工艺与要查找的工艺相同,则返回预计的工艺排程时间
            if (msef.getCraftid().equals(craftid)) {
                counter++;

                if (counter == cnt) {
                    return msef.getEvaluate();
                }
            }
        }

        return 0d;
    }

    /**
     * 用于判断零件加工状态是否为某种状态
     * 
     * @param states
     * @param stateid
     * @return
     */
    private boolean stateIn(String states, String stateid) {
        String[] statelist = states.split(",", -1);
        for (String s : statelist) {
            if (s.equals(stateid)) {
                return (true);
            }
        }

        return (false);
    }

    private double getDistanceHour(Timestamp start, Timestamp end, Timestamp lrcd, Timestamp nrcd, int partcount) {
        // 如果开始时间或者结束时间为空,则返回0
        if (lrcd == null) {
            return 0d;
        }

        boolean tooBig = (nrcd.getTime() < start.getTime());
        boolean tooSmall = (lrcd.getTime() >= end.getTime());

        // 时间过大或者过小都将返回0
        if (tooBig || tooSmall) {
            return 0d;
        }

        Timestamp uStart = (lrcd.getTime() > start.getTime() ? lrcd : start);
        Timestamp uEnd = (nrcd.getTime() > end.getTime() ? end : nrcd);

        return ArithUtils.round(((double) (uEnd.getTime() - uStart.getTime())) / 3600 / 1000 / partcount, 3);
    }

    /**
     * 获取实际完成的时间
     * 
     * @param start
     * @param end
     * @param lrcd
     * @param nrcd
     * @param partcount
     * @return
     */
    private double getFinishedHour(Timestamp start, Timestamp end, Timestamp lrcd, Timestamp nrcd, int partcount) {
        // 如果开始时间和结束时间为空,则返回0
        if (nrcd == null || lrcd == null) {
            return 0d;
        }

        boolean result = (nrcd.getTime() >= end.getTime() || nrcd.getTime() < start.getTime());
        return (result ? 0 : ArithUtils.round(((double) (nrcd.getTime() - lrcd.getTime())) / 3600 / 1000 / partcount, 3));
    }
}
