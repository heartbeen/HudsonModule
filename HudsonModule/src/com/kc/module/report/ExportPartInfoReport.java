package com.kc.module.report;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFCellStyle;
import org.apache.poi.hssf.usermodel.HSSFFont;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;

import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.utils.JsonUtils;
import com.kc.module.utils.StringUtils;

public class ExportPartInfoReport extends Report {

    public ExportPartInfoReport(Controller controller) throws IOException {
        super(controller);
    }

    @Override
    public void exportReport() {

        String partlist = this.controller.getPara("partlist");
        String[] columnNames = {"零件序号", "零件编号", "模具编号", "客户番号", "客户名称", "外发时间", "完成时间", "加工工序"};
        int[] columnWidth = {4000, 4000, 4000, 4000, 4000, 4000, 4000, 6000};

        PartInfoForm[] parter = JsonUtils.josnToBean(partlist, PartInfoForm[].class);
        if (parter == null || parter.length == 0) {
            return;
        }

        Map<String, String[]> maplist = new HashMap<String, String[]>();

        String sqlIn = "(";
        for (PartInfoForm pif : parter) {
            String m_part = pif.getPartbarlistcode();

            if (!maplist.containsKey(m_part)) {
                String[] m_info = new String[columnNames.length];

                m_info[0] = m_part;
                m_info[5] = pif.getPlanouttime();
                m_info[6] = pif.getPlanbacktime();
                m_info[7] = pif.getCraftname();

                maplist.put(m_part, m_info);
            }

            sqlIn += ("'" + m_part + "',");
        }

        sqlIn = sqlIn.substring(0, sqlIn.length() - 1) + ")";

        StringBuilder builder = new StringBuilder();

        builder.append("SELECT MPL.PARTBARLISTCODE, MPL.PARTLISTCODE, ML.MODULECODE, ML.GUESTCODE, FY.SHORTNAME FROM MD_PART_LIST MPL ");
        builder.append("LEFT JOIN MODULELIST ML ON MPL.MODULEBARCODE = ML.MODULEBARCODE LEFT JOIN FACTORY FY ON ML.GUESTID = FY.ID ");
        builder.append("WHERE MPL.ISENABLE = 0 AND MPL.PARTBARLISTCODE IN ").append(sqlIn).append(" ORDER BY MPL.PARTLISTCODE");

        List<Record> querys = Db.find(builder.toString());
        if (querys.size() == 0) {
            return;
        }

        for (Record record : querys) {
            String partbarlistcode = record.getStr("PARTBARLISTCODE");

            if (StringUtils.isEmpty(partbarlistcode)) {
                continue;
            }

            String[] m_info = null;
            if (maplist.containsKey(partbarlistcode)) {
                m_info = maplist.get(partbarlistcode);
            }

            if (m_info == null) {
                continue;
            }

            m_info[1] = record.getStr("PARTLISTCODE");
            m_info[2] = record.getStr("MODULECODE");
            m_info[3] = record.getStr("GUESTCODE");
            m_info[4] = record.getStr("SHORTNAME");
        }

        HSSFWorkbook book = new HSSFWorkbook();

        // 单元格格式
        HSSFCellStyle cellStyle = initCellStyle(book,
                                                "隶书",
                                                (short) 10,
                                                false,
                                                (short) 8,
                                                (short) 1,
                                                (short) 2,
                                                (short) 1,
                                                false,
                                                (short) 0,
                                                (short) 0);
        // 表头格式
        HSSFCellStyle headerStyle = initCellStyle(book,
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

        // 创建第一个SHEET表
        HSSFSheet sheet = book.createSheet();

        createRow(sheet, 0, 28, headerStyle, columnNames);

        int counter = 1;
        for (String key : maplist.keySet()) {
            createRow(sheet, counter, 20.25f, cellStyle, maplist.get(key));
            counter++;
        }

        setSheetColumnWidth(sheet, columnWidth);

        this.setWorkBook(book);
    }

    private void setSheetColumnWidth(HSSFSheet sheet, int[] wid) {
        for (int i = 0; i < wid.length; i++) {
            sheet.setColumnWidth(i, wid[i]);
        }
    }

    private void createRow(HSSFSheet sheet, int rowIndex, float height, HSSFCellStyle style, String[] data) {
        // 创建表头行
        HSSFRow sheetRow = sheet.createRow(rowIndex);
        // 设置行的高度
        sheetRow.setHeightInPoints(height);

        for (int i = 0; i < data.length; i++) {
            HSSFCell cell = sheetRow.createCell(i);
            cell.setCellStyle(style);
            cell.setCellValue(data[i]);
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

class PartInfoForm {
    public String getPartbarlistcode() {
        return partbarlistcode;
    }

    public void setPartbarlistcode(String partbarlistcode) {
        this.partbarlistcode = partbarlistcode;
    }

    public String getPlanouttime() {
        return planouttime;
    }

    public void setPlanouttime(String planouttime) {
        this.planouttime = planouttime;
    }

    public String getPlanbacktime() {
        return planbacktime;
    }

    public void setPlanbacktime(String planbacktime) {
        this.planbacktime = planbacktime;
    }

    public String getGuestname() {
        return guestname;
    }

    public void setGuestname(String guestname) {
        this.guestname = guestname;
    }

    public String getModulecode() {
        return modulecode;
    }

    public void setModulecode(String modulecode) {
        this.modulecode = modulecode;
    }

    public String getPartlistcode() {
        return partlistcode;
    }

    public void setPartlistcode(String partlistcode) {
        this.partlistcode = partlistcode;
    }

    public String getGuestcode() {
        return guestcode;
    }

    public void setGuestcode(String guestcode) {
        this.guestcode = guestcode;
    }

    private String partbarlistcode;
    private String partlistcode;
    private String planouttime;
    private String planbacktime;
    private String guestname;
    private String modulecode;
    private String guestcode;
    private String craftname;

    public String getCraftname() {
        return craftname;
    }

    public void setCraftname(String craftname) {
        this.craftname = craftname;
    }
}
