package com.kc.module.report;

import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.jfinal.plugin.activerecord.Record;
import com.kc.module.base.RegularState;
import com.kc.module.model.DeviceProcessResume;
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.DateUtils;

/**
 * 机台稼动率数据处理类
 * 
 * @author xuwei
 * 
 */
public class MachineWorkPrecent {

    /**
     * 统计结果
     */
    private Map<String, Map<String, Record>> collectResultmap = new LinkedHashMap<String, Map<String, Record>>();

    private Map<String, Record> dateMap = null;

    private List<Record> workList;

    private String dateFormat;

    public MachineWorkPrecent(List<Record> workList, String dataFormat) {
        this.workList = workList != null ? workList : new ArrayList<Record>();
        this.dateFormat = dataFormat;
    }

    public Map<String, Map<String, Record>> collect() {

        boolean isStart = false;

        // 机台上机工作记录
        Record openResume = null;

        String machineStartIndex = RegularState.MACHINE_START.getIndex();
        String stateId = "";
        int counter = 0;

        for (Record closeResume : this.workList) {
            stateId = closeResume.get("STATEID");

            // 得到开机记录
            if (machineStartIndex.equals(stateId)) {
                isStart = true;

                openResume = closeResume;

            } else if (counter == 0 && !isStart) {
                // 如果为第一条记录，并且第一条记录不是开机记录
                openResume = DeviceProcessResume.dao.findUpMachineStartResume(this.dateFormat,
                                                                              closeResume.getStr("devicepartid"),
                                                                              closeResume.getStr("craftid"),
                                                                              closeResume.getDate("actiondate"));

                if (openResume != null && machineStartIndex.equals(openResume.get("STATEID"))) {
                    openResume.set("workdate", closeResume.get("workdate"));
                    openResume.set("groupkey", closeResume.get("groupkey"));
                    openResume.set("actiondate", DateUtils.strToDate(closeResume.getStr("workdate"), DateUtils.DEFAULT_SHORT_DATE));

                    computeWorkHourSetp(openResume, closeResume);
                }

            } else if (isStart && !machineStartIndex.equals(stateId)) {

                computeWorkHourSetp(openResume, closeResume);

                isStart = false;
            } else {
                isStart = false;
                openResume = null;
            }

            ++counter;
        }

        // 最后记录如果为开机时
        if (openResume != null && dateMap != null) {

            String macEndDate = openResume.get("workdate") + " 23:59:59";
            String afterDate = DateUtils.dateToStr(openResume.getDate("actiondate"), null);

            computeWorkHours(openResume.getStr("groupkey"), afterDate, macEndDate);
        }

        return collectResultmap;

    }

    /**
     * 通过开机与关机记录计算出开机小时数
     * 
     * @param openResume
     *            开机记录
     * @param closeResume
     *            关机记录
     */
    private void computeWorkHourSetp(Record openResume, Record closeResume) {
        String keyName = closeResume.getStr("keyname");
        dateMap = collectResultmap.get(keyName);

        if (dateMap == null) {
            dateMap = new LinkedHashMap<String, Record>();
            collectResultmap.put(keyName, dateMap);
        }

        if (openResume.get("workdate").equals(closeResume.get("workdate"))) {
            String startdate = DateUtils.dateToStr(openResume.getDate("actiondate"), null);
            String enddate = DateUtils.dateToStr(closeResume.getDate("actiondate"), null);
            // 表示为机台在当天停机
            computeWorkHours(openResume.getStr("groupkey"), startdate, enddate);

        } else {
            // 表示机台工作跨天了
            int intervalDays = (int) DateUtils.getDateTimeFieldInternal(openResume.getStr("workdate"), closeResume.getStr("workdate"), 5, 0);
            compteBeforeAndAfter(openResume, closeResume);

            // 如果没有跨两天及以上时
            if (intervalDays > 1) {
                computeGapDayWorkHour(intervalDays, openResume.getDate("actiondate"));
            }

        }
    }

    /**
     * 
     * @param intervalDays
     * @param workDate
     */
    private void computeGapDayWorkHour(int intervalDays, Date workDate) {
        for (int day = 1; day <= intervalDays - 1; day++) {
            String dateKey = DateUtils.addDateToStr(workDate, day, this.dateFormat);

            saveWorkHours(dateKey, 24);

        }
    }

    /**
     * 
     * @param upResume
     * @param resume
     */
    private void compteBeforeAndAfter(Record upResume, Record resume) {
        // 计算开头的时间
        String startDate = DateUtils.dateToStr(upResume.getDate("actiondate"), null);
        String endDate = upResume.get("workdate") + " 23:59:59";

        computeWorkHours(upResume.getStr("groupkey"), startDate, endDate);

        // 计算后结束的时间
        String afterDate = resume.getStr("workdate") + "00:00:00";
        String macEndDate = DateUtils.dateToStr(resume.getDate("actiondate"), null);

        computeWorkHours(resume.getStr("groupkey"), afterDate, macEndDate);
    }

    /**
     * 计算开机时间，并保存
     * 
     * @param groupKey
     *            时间KEY
     * @param sDate
     * @param eDate
     */
    private void computeWorkHours(String groupKey, String sDate, String eDate) {
        double workHours = DateUtils.getDateTimeFieldInternal(sDate, eDate, 10, 1);

        saveWorkHours(groupKey, workHours);
    }

    /**
     * 保存开机时间数
     * 
     * @param groupKey
     *            时间KEY
     * @param workHours
     *            机台开机小时数
     */
    private void saveWorkHours(String groupKey, double workHours) {

        Record record = dateMap.get(groupKey);

        if (record == null) {
            record = new Record();
            dateMap.put(groupKey, record);
        } else {
            workHours = ArithUtils.add(record.getNumber("workHours").doubleValue(), workHours);
        }

        record.set("workHours", workHours);
    }

}
