package com.kc.module.report;

import java.io.IOException;

import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFCellStyle;
import org.apache.poi.hssf.usermodel.HSSFFont;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;

import com.jfinal.core.Controller;
import com.kc.module.model.form.ExportEffientForm;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.JsonUtils;

/**
 * 模具加工排程导出报表
 * 
 * @author David
 * 
 */
public class EmployeeEffientReport extends Report {

    public EmployeeEffientReport(Controller controller) throws IOException {
        super(controller);
    }

    @Override
    public void exportReport() {
        HSSFWorkbook book = new HSSFWorkbook();
        try {
            // 获取模具的履历集合
            ExportEffientForm[] datarow = JsonUtils.josnToBean(this.controller.getPara("datarow"), ExportEffientForm[].class);
            // 如果讯息为空则返回
            if (datarow == null || datarow.length == 0) {
                this.setWorkBook(book);
                return;
            }

            int[] columnWidth = {5300, 5300, 5000, 5000, 4800, 6000, 6000, 4500, 4500, 4500, 4500, 4500};
            String[] columnNames = {"模具工号", "履历讯息", "加工人员", "零件编号", "工艺名称", "开始时间", "结束时间", "实际用时", "全部用时", "预计用时", "安排用时", "是否完成"};

            HSSFCellStyle headerStyle = initCellStyle(book,
                                                      "微软雅黑",
                                                      (short) 14,
                                                      false,
                                                      (short) 8,
                                                      (short) 1,
                                                      (short) 2,
                                                      (short) 1,
                                                      false,
                                                      (short) 0,
                                                      (short) 0);

            HSSFCellStyle cellStyle = initCellStyle(book,
                                                    "微软雅黑",
                                                    (short) 12,
                                                    false,
                                                    (short) 8,
                                                    (short) 1,
                                                    (short) 2,
                                                    (short) 1,
                                                    false,
                                                    (short) 0,
                                                    (short) 0);

            // 创建SHEET表
            HSSFSheet sheet = book.createSheet(DateUtils.getDateNow("yyyyMMddHHmmss"));

            // 声明行索引
            int rowIndex = 0;
            HSSFRow headerRow = sheet.createRow(rowIndex);

            for (int i = 0; i < columnNames.length; i++) {
                HSSFCell headerCell = headerRow.createCell(i);

                headerCell.setCellStyle(headerStyle);
                headerCell.setCellValue(columnNames[i]);
            }

            rowIndex++;

            for (ExportEffientForm eef : datarow) {
                HSSFRow appendRow = sheet.createRow(rowIndex);

                appendCell(appendRow, 0, cellStyle, eef.getModulecode());
                appendCell(appendRow, 1, cellStyle, eef.getRinfo());
                appendCell(appendRow, 2, cellStyle, eef.getEmpname());
                appendCell(appendRow, 3, cellStyle, eef.getPartlistcode());

                appendCell(appendRow, 4, cellStyle, eef.getCraftname());
                appendCell(appendRow, 5, cellStyle, eef.getStart());
                appendCell(appendRow, 6, cellStyle, eef.getEnd());
                appendCell(appendRow, 7, cellStyle, eef.getActhour());

                appendCell(appendRow, 8, cellStyle, eef.getAllhour());
                appendCell(appendRow, 9, cellStyle, eef.getEsthour());
                appendCell(appendRow, 10, cellStyle, eef.getMillhour());
                appendCell(appendRow, 11, cellStyle, (toBoolean(eef.getFinish()) ? "已完成" : "未完成"));

                rowIndex++;
            }

            setSheetColumnWidth(sheet, columnWidth);

            this.setWorkBook(book);
        }
        catch (Exception e) {
            this.setWorkBook(book);
        }
    }

    /**
     * 生成单元格
     * 
     * @param row
     * @param colIndex
     * @param style
     * @param val
     */
    private void appendCell(HSSFRow row, int colIndex, HSSFCellStyle style, String val) {
        HSSFCell cell = row.createCell(colIndex);
        cell.setCellStyle(style);

        cell.setCellValue(val);
    }

    private void setSheetColumnWidth(HSSFSheet sheet, int[] wid) {
        for (int i = 0; i < wid.length; i++) {
            sheet.setColumnWidth(i, wid[i]);
        }
    }

    private boolean toBoolean(String val) {
        try {
            return Boolean.parseBoolean(val);
        }
        catch (Exception e) {
            return (false);
        }
    }

    private HSSFCellStyle initCellStyle(HSSFWorkbook book,
                                        String fontName,
                                        short fontsize,
                                        boolean bold,
                                        short color,
                                        short borderWidth,
                                        short align,
                                        short vertial,
                                        boolean isback,
                                        short pattern,
                                        short bgcolor) {
        HSSFFont font = book.createFont();
        font.setFontName(fontName);
        font.setBold(bold);
        font.setFontHeightInPoints(fontsize);
        font.setColor(color);

        HSSFCellStyle style = book.createCellStyle();
        style.setFont(font);
        style.setAlignment(align);
        style.setVerticalAlignment(vertial);

        style.setBorderTop(borderWidth);
        style.setBorderLeft(borderWidth);
        style.setBorderRight(borderWidth);
        style.setBorderBottom(borderWidth);

        if (isback) {
            style.setFillForegroundColor(bgcolor);
            style.setFillPattern(pattern);
        }

        return style;
    }
}
