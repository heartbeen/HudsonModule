package com.kc.module.report;

import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFCellStyle;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;

import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.model.ModuleEstSchedule;
import com.kc.module.model.ModuleList;
import com.kc.module.utils.ConstUtils;
import com.kc.module.utils.DataUtils;
import com.kc.module.utils.DateUtils;

/**
 * 按客户模具进度格式进行生成报表
 * 
 * @author David
 * @email xuweissh@163.com
 * 
 */
public class CustomerScheduleReport extends Report {

    private final int TIME_LINE_START = 3;

    /**
     * 计划排程样式
     */
    private HSSFCellStyle planStyle;

    /**
     * 实际加工样式
     */
    private HSSFCellStyle actulaStyle;

    /**
     * 落后于预定计划但没有风险样式
     */
    private HSSFCellStyle noRiskStyle;

    /**
     * 落后于预定计划但有风险样式
     */
    private HSSFCellStyle riskStyle;

    private short todayStyle;

    private HSSFWorkbook workBook;

    /**
     * 完成样式
     */
    private HSSFCellStyle completedStyle;

    public CustomerScheduleReport(Controller controller) throws IOException {
        super(controller);
    }

    @Override
    public void exportReport() {
        String[] moduleArray = this.controller.getPara("moduleArray").split(",");

        List<ModuleList> mls = ModuleList.dao.findModuleForResumes(moduleArray);

        ModuleList ml;
        HSSFSheet sheet;

        for (int i = 0; i < moduleArray.length - 1; i++) {
            this.workBook.cloneSheet(0);
        }

        for (int i = 0; i < mls.size(); i++) {
            ml = mls.get(i);

            Date startDate = DateUtils.addDate(ml.getDate("starttime"), 2 - DateUtils.getDayOfWeek(ml.getDate("starttime")));

            Date endDate = DateUtils.addDate(ml.getDate("inittrytime"), 9 - DateUtils.getDayOfWeek(ml.getDate("inittrytime")));

            sheet = this.workBook.getSheetAt(i);

            // 取得
            planStyle = sheet.getRow(54).getCell(1).getCellStyle();
            actulaStyle = sheet.getRow(55).getCell(1).getCellStyle();
            noRiskStyle = sheet.getRow(56).getCell(1).getCellStyle();
            riskStyle = sheet.getRow(57).getCell(1).getCellStyle();
            completedStyle = sheet.getRow(58).getCell(1).getCellStyle();
            todayStyle = sheet.getRow(59).getCell(1).getCellStyle().getFillBackgroundColor();

            // 0.生成模具信息
            createModuleInformation(sheet, ml, i);

            // 1.生成时间轴
            createScheduleTimeline(sheet, startDate, endDate);

            // 2.生成计划排程
            createScheduleStyle(sheet, startDate, ml.get("moduleResumeId"));
        }

    }

    /**
     * 生成模具基本信息
     * 
     * @param moduleList
     */
    private void createModuleInformation(HSSFSheet sheet, ModuleList moduleList, int index) {
        HSSFRow row = sheet.getRow(0);
        row.getCell(1).setCellValue("Mold No.：" + moduleList.get("modulecode"));
        row.getCell(3).setCellValue("Customer：" + moduleList.get("shortname"));
        row.getCell(11).setCellValue("Part Name：" + moduleList.get("productname"));
        row.getCell(24).setCellValue("Part NO.：" + moduleList.get("guestcode"));
        row.getCell(31).setCellValue("Start Date:" + DateUtils.dateToStr(moduleList.getDate("starttime"), DateUtils.DEFAULT_SHORT_DATE));
        row.getCell(39).setCellValue("End Date: " + DateUtils.dateToStr(moduleList.getDate("inittrytime"), DateUtils.DEFAULT_SHORT_DATE));

        workBook.setSheetName(index, moduleList.getStr("modulecode"));
    }

    /**
     * 生成排行时间轴
     * 
     * @param workBook
     * @param startDate
     * @param endDate
     */
    private void createScheduleTimeline(HSSFSheet sheet, Date startDate, Date endDate) {
        int days = DateUtils.dateIntervalDay(startDate, endDate);

        HSSFRow weekRow = sheet.getRow(1);// 星期轴
        HSSFRow dateRow = sheet.getRow(2);// 时间轴
        HSSFCell dateCell;
        HSSFCell weekCell;

        int today = new Date().getDate();

        Date timeLine;

        for (int i = 0; i < days; i++) {
            dateCell = dateRow.getCell(TIME_LINE_START + i);
            timeLine = DateUtils.addDate(startDate, i);
            dateCell.setCellValue(timeLine);

            // 今天所在位置
            if (today == timeLine.getDate()) {
                today = i;
            }

            if (DateUtils.getDayOfWeek(timeLine) == 2) {
                weekCell = weekRow.getCell(TIME_LINE_START + i);
                weekCell.setCellValue("W" + DateUtils.getWeekOfYear(timeLine));
            }
        }

        for (int i = 3; i < 51; i++) {
            dateCell = sheet.getRow(i).getCell(TIME_LINE_START + today);
            dateCell.getCellStyle().setFillBackgroundColor(todayStyle);
        }
    }

    /**
     * 生成排程计划图表
     * 
     * @param planMap
     * @param startDate
     */
    private void createScheduleStyle(HSSFSheet sheet, Date startDate, Object moduleResumeId) {

        // 计划排程数据
        Map<String, List<Record>> planMap = DataUtils.recordClassific(ModuleEstSchedule.dao.findModuleScheduleOfCustomer(moduleResumeId), "PARTCODE");
        // 实际加工数据
        Map<String, List<Record>> actualMap = DataUtils.recordClassific(ModuleEstSchedule.dao.findModuleActualOfCustomer(moduleResumeId), "LPROCRAFT");

        Set<String> keySet = planMap.keySet();
        List<Record> planList;
        Record plan;

        HSSFRow planRow;
        HSSFCell planCell;

        int planStartCol = -1;// 工艺排程开始时间所在的列号
        int planInterval = -1;// 工艺排程的时间间隔

        for (String key : keySet) {
            planList = planMap.get(key);

            for (int index = 0; index < planList.size(); index++) {
                plan = planList.get(index);

                // 得到模仁排程所有行
                planRow = sheet.getRow(ConstUtils.CUSTOMER_SCHEDULE.get(key.concat(plan.getStr("FLOWCRAFTCODE")).concat("-S")));

                planStartCol = DateUtils.dateIntervalDay(startDate, plan.getDate("STARTTIME"));

                planInterval = DateUtils.dateIntervalDay(plan.getDate("STARTTIME"), plan.getDate("ENDTIME")) + 1;

                // 绘制时间区域
                for (int i = 0; i < planInterval; i++) {
                    planCell = planRow.getCell(planStartCol + i + TIME_LINE_START);
                    planCell.setCellStyle(planStyle);
                }

                // 3.生成实际加工样式
                if (actualMap.get(plan.get("FLOWCRAFTCODE")) != null) {
                    createActualStyle(sheet, actualMap.get(plan.get("FLOWCRAFTCODE")), key, startDate);
                }

            }
        }
    }

    /**
     * 生成实际加工样式
     * 
     * @param sheet
     * @param actualList
     * @param startDate
     */
    public void createActualStyle(HSSFSheet sheet, List<Record> actualList, String key, Date startDate) {
        Record actual;
        HSSFRow actualRow;
        HSSFCell actualCell;

        int actualStartCol = -1;// 工艺排程开始时间所在的列号
        int actualInterval = -1;// 工艺排程的时间间隔

        for (int index = 0; index < actualList.size(); index++) {
            actual = actualList.get(index);

            // 得到模仁排程所有行
            actualRow = sheet.getRow(ConstUtils.CUSTOMER_SCHEDULE.get(key.concat(actual.getStr("LPROCRAFT")).concat("-A")));

            actualStartCol = DateUtils.dateIntervalDay(startDate, actual.getDate("LRCDTIME"));

            if (actual.getDate("NRCDTIME") != null) {
                // 已完工
                actualInterval = DateUtils.dateIntervalDay(actual.getDate("LRCDTIME"), actual.getDate("NRCDTIME")) + 1;

                // 绘制时间区域
                for (int i = 0; i < actualInterval; i++) {
                    actualCell = actualRow.getCell(actualStartCol + i + TIME_LINE_START);
                    actualCell.setCellStyle(completedStyle);
                }
            } else {

                // 正在开工中
                actualCell = actualRow.getCell(actualStartCol + TIME_LINE_START);
                actualCell.setCellStyle(actulaStyle);
            }
        }
    }
}
