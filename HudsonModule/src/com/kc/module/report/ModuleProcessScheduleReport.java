package com.kc.module.report;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFCellStyle;
import org.apache.poi.hssf.usermodel.HSSFFont;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.util.CellRangeAddress;

import com.jfinal.core.Controller;
import com.kc.module.model.ModuleResume;
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.StringUtils;

/**
 * 模具加工排程导出报表
 * 
 * @author David
 * 
 */
public class ModuleProcessScheduleReport extends Report {

    public ModuleProcessScheduleReport(Controller controller) throws IOException {
        super(controller);
    }

    @Override
    public void exportReport() {
        HSSFWorkbook book = new HSSFWorkbook();
        try {
            // 获取模具的履历集合
            String[] moduleArray = this.controller.getPara("moduleArray").split(",");
            // 获取模具的加工讯息
            List<ModuleResume> mls = ModuleResume.dao.getScheduleInfoForExport(moduleArray);

            // 如果待查询的模具资料为空，则返回
            if (mls.size() == 0) {
                this.setWorkBook(book);
                return;
            }
            // 声明用于存放模具讯息的变量
            Map<String, ModuleScheduleForm> lmsf = new HashMap<String, ModuleScheduleForm>();

            for (ModuleResume mr : mls) {
                // 如果模具唯一号为空，返回
                String resumeid = mr.getStr("id");
                if (StringUtils.isEmpty(resumeid)) {
                    continue;
                }

                // 如果零件唯一号为空，则返回
                String partid = mr.getStr("partbarlistcode");
                if (StringUtils.isEmpty(partid)) {
                    continue;
                }

                //
                String partlistcode = mr.getStr("partlistcode");

                if (lmsf.containsKey(resumeid)) {
                    ModuleScheduleForm msf = lmsf.get(resumeid);

                    if (msf.getPartlist().containsKey(partid)) {
                        msf.getPartlist().get(partid).getScheduler().add(mr.getStr("craftcode"));
                    } else {
                        PartScheduleForm psf = new PartScheduleForm();

                        int lastIndex = partlistcode.lastIndexOf("(");
                        psf.setPartcode(lastIndex > -1 ? partlistcode.substring(0, lastIndex) : partlistcode);
                        psf.setQuantity(lastIndex > -1 ? partlistcode.substring(lastIndex + 1, partlistcode.length() - 1) : "1");

                        psf.setPartname(mr.getStr("cnames"));
                        psf.getScheduler().add(mr.getStr("craftcode"));
                        psf.setIntro(mr.getStr("remark"));

                        msf.getPartlist().put(partid, psf);
                    }

                } else {
                    ModuleScheduleForm msf = new ModuleScheduleForm();

                    msf.setModulecode(mr.getStr("modulecode"));
                    msf.setGuestcode(mr.getStr("guestcode"));
                    msf.setGuestname(mr.getStr("shortname"));
                    msf.setResumestate(mr.getStr("name"));

                    msf.setStarttime(mr.getStr("starttime"));
                    msf.setEndtime(mr.getStr("endtime"));

                    PartScheduleForm psf = new PartScheduleForm();

                    int lastIndex = partlistcode.lastIndexOf("(");
                    psf.setPartcode(lastIndex > -1 ? partlistcode.substring(0, lastIndex) : partlistcode);
                    psf.setQuantity(lastIndex > -1 ? partlistcode.substring(lastIndex + 1, partlistcode.length() - 1) : "1");

                    psf.setPartname(mr.getStr("cnames"));
                    psf.getScheduler().add(mr.getStr("craftcode"));
                    psf.setIntro(mr.getStr("remark"));

                    msf.getPartlist().put(partid, psf);

                    lmsf.put(resumeid, msf);
                }
            }

            if (lmsf.size() == 0) {
                this.setWorkBook(book);
                return;
            }

            int[] columnWidth = {5300, 2500, 2000, 2000, 2500, 1700, 1700, 2500, 1900, 2100, 2100, 2600, 2600};

            HSSFCellStyle moduleStyle = initCellStyle(book,
                                                      "微软雅黑",
                                                      (short) 18,
                                                      false,
                                                      (short) 8,
                                                      (short) 1,
                                                      (short) 2,
                                                      (short) 1,
                                                      false,
                                                      (short) 0,
                                                      (short) 0);
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

            HSSFCellStyle seaGreenStyle = initCellStyle(book,
                                                        "仿宋",
                                                        (short) 10,
                                                        true,
                                                        (short) 57,
                                                        (short) 1,
                                                        (short) 2,
                                                        (short) 1,
                                                        false,
                                                        (short) 0,
                                                        (short) 0);

            HSSFCellStyle orchidStyle = initCellStyle(book,
                                                      "仿宋",
                                                      (short) 10,
                                                      true,
                                                      (short) 28,
                                                      (short) 1,
                                                      (short) 2,
                                                      (short) 1,
                                                      false,
                                                      (short) 0,
                                                      (short) 0);

            HSSFCellStyle darkRedStyle = initCellStyle(book,
                                                       "仿宋",
                                                       (short) 10,
                                                       true,
                                                       (short) 16,
                                                       (short) 1,
                                                       (short) 2,
                                                       (short) 1,
                                                       false,
                                                       (short) 0,
                                                       (short) 0);

            HSSFCellStyle columnStyle = initCellStyle(book,
                                                      "微软雅黑",
                                                      (short) 12,
                                                      false,
                                                      (short) 8,
                                                      (short) 1,
                                                      (short) 2,
                                                      (short) 1,
                                                      true,
                                                      (short) 1,
                                                      (short) 44);
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
            HSSFCellStyle scheduleStyle = initCellStyle(book,
                                                        "宋体",
                                                        (short) 9,
                                                        true,
                                                        (short) 8,
                                                        (short) 1,
                                                        (short) 1,
                                                        (short) 1,
                                                        false,
                                                        (short) 0,
                                                        (short) 0);

            for (String item : lmsf.keySet()) {
                ModuleScheduleForm cell = lmsf.get(item);
                // TODO 设置SHEET表的表名
                HSSFSheet sheet = book.createSheet(getSheetNameFilter(cell.getModulecode()));

                // 设置表格的表头资料
                HSSFRow hsfone = sheet.createRow(0);
                HSSFRow hsftwo = sheet.createRow(1);

                hsfone.setHeightInPoints(28);
                hsftwo.setHeightInPoints(28);

                HSSFCell h0 = hsfone.createCell(0);
                h0.setCellValue(cell.getModulecode());

                CellRangeAddress cra = new CellRangeAddress(0, 1, 0, 0);

                sheet.addMergedRegion(cra);

                setRegionStyle(moduleStyle, cra, sheet);

                HSSFCell h1 = hsfone.createCell(1);
                h1.setCellValue("客户名称");
                HSSFCell h2 = hsftwo.createCell(1);
                h2.setCellValue("客户番号");

                CellRangeAddress cra1 = new CellRangeAddress(0, 0, 1, 2);
                CellRangeAddress cra2 = new CellRangeAddress(1, 1, 1, 2);
                sheet.addMergedRegion(cra1);
                sheet.addMergedRegion(cra2);

                setRegionStyle(headerStyle, cra1, sheet);
                setRegionStyle(headerStyle, cra2, sheet);

                HSSFCell h3 = hsfone.createCell(3);
                h3.setCellValue(cell.getGuestname());
                HSSFCell h4 = hsftwo.createCell(3);
                h4.setCellValue(cell.getGuestcode());

                CellRangeAddress cra3 = new CellRangeAddress(0, 0, 3, 4);
                CellRangeAddress cra4 = new CellRangeAddress(1, 1, 3, 4);
                sheet.addMergedRegion(cra3);
                sheet.addMergedRegion(cra4);

                setRegionStyle(headerStyle, cra3, sheet);
                setRegionStyle(headerStyle, cra4, sheet);

                HSSFCell h5 = hsfone.createCell(5);
                h5.setCellValue("开始时间");
                HSSFCell h6 = hsftwo.createCell(5);
                h6.setCellValue("完成时间");

                CellRangeAddress cra5 = new CellRangeAddress(0, 0, 5, 6);
                CellRangeAddress cra6 = new CellRangeAddress(1, 1, 5, 6);
                sheet.addMergedRegion(cra5);
                sheet.addMergedRegion(cra6);

                setRegionStyle(headerStyle, cra5, sheet);
                setRegionStyle(headerStyle, cra6, sheet);

                HSSFCell h7 = hsfone.createCell(7);
                h7.setCellValue(cell.getStarttime());
                HSSFCell h8 = hsftwo.createCell(7);
                h8.setCellValue(cell.getEndtime());

                CellRangeAddress cra7 = new CellRangeAddress(0, 0, 7, 8);
                CellRangeAddress cra8 = new CellRangeAddress(1, 1, 7, 8);
                sheet.addMergedRegion(cra7);
                sheet.addMergedRegion(cra8);

                setRegionStyle(seaGreenStyle, cra7, sheet);
                setRegionStyle(orchidStyle, cra8, sheet);

                HSSFCell h9 = hsfone.createCell(9);
                h9.setCellValue("加工状态");
                HSSFCell h10 = hsftwo.createCell(9);
                h10.setCellValue("组立担当");

                CellRangeAddress cra9 = new CellRangeAddress(0, 0, 9, 10);
                CellRangeAddress cra10 = new CellRangeAddress(1, 1, 9, 10);
                sheet.addMergedRegion(cra9);
                sheet.addMergedRegion(cra10);

                setRegionStyle(headerStyle, cra9, sheet);
                setRegionStyle(headerStyle, cra10, sheet);

                HSSFCell h11 = hsfone.createCell(11);
                h11.setCellValue(cell.getResumestate());
                // HSSFCell h12 = hsfone.createCell(12);

                CellRangeAddress cra11 = new CellRangeAddress(0, 0, 11, 12);
                CellRangeAddress cra12 = new CellRangeAddress(1, 1, 11, 12);
                sheet.addMergedRegion(cra11);
                sheet.addMergedRegion(cra12);

                setRegionStyle(darkRedStyle, cra11, sheet);
                setRegionStyle(headerStyle, cra12, sheet);

                HSSFRow hsfthree = sheet.createRow(2);

                hsfthree.setHeightInPoints(20);

                HSSFCell h16 = hsfthree.createCell(0);
                h16.setCellValue("零件编号");
                h16.setCellStyle(columnStyle);

                HSSFCell h17 = hsfthree.createCell(1);
                h17.setCellValue("数量");
                h17.setCellStyle(columnStyle);

                HSSFCell h18 = hsfthree.createCell(2);
                h18.setCellValue("备注");
                h18.setCellStyle(columnStyle);

                HSSFCell h19 = hsfthree.createCell(4);
                h19.setCellValue("排程");

                CellRangeAddress cra13 = new CellRangeAddress(2, 2, 2, 3);
                CellRangeAddress cra14 = new CellRangeAddress(2, 2, 4, 12);
                sheet.addMergedRegion(cra13);
                sheet.addMergedRegion(cra14);

                setRegionStyle(columnStyle, cra13, sheet);
                setRegionStyle(columnStyle, cra14, sheet);

                if (cell.getPartlist().size() > 0) {
                    int start = 3;
                    for (String attr : cell.getPartlist().keySet()) {
                        PartScheduleForm unit = cell.getPartlist().get(attr);

                        HSSFRow hsfany = sheet.createRow(start);
                        hsfany.setHeightInPoints(17);

                        HSSFCell h20 = hsfany.createCell(0);
                        h20.setCellValue(unit.getPartcode());
                        h20.setCellStyle(cellStyle);

                        HSSFCell h21 = hsfany.createCell(1);
                        h21.setCellValue(ArithUtils.parseInt(unit.getQuantity(), 1));
                        h21.setCellStyle(cellStyle);

                        HSSFCell h22 = hsfany.createCell(2);
                        h22.setCellValue(unit.getIntro());
                        h22.setCellStyle(cellStyle);

                        HSSFCell h23 = hsfany.createCell(4);
                        h23.setCellValue(listMerge(unit.getScheduler()));
                        h23.setCellStyle(cellStyle);

                        CellRangeAddress cra15 = new CellRangeAddress(start, start, 2, 3);
                        CellRangeAddress cra16 = new CellRangeAddress(start, start, 4, 12);
                        sheet.addMergedRegion(cra15);
                        sheet.addMergedRegion(cra16);

                        setRegionStyle(cellStyle, cra15, sheet);
                        setRegionStyle(scheduleStyle, cra16, sheet);

                        start++;
                    }
                }

                setSheetColumnWidth(sheet, columnWidth);

                this.setWorkBook(book);
            }
        }
        catch (Exception e) {
            e.printStackTrace();
            this.setWorkBook(book);
        }
    }

    /**
     * 获取模具号并去除特殊符号[\/*?[]]
     * 
     * @param name
     * @return
     */
    private String getSheetNameFilter(String name) {
        if (name == null) {
            return name;
        }

        return name.replaceAll("[\\/\\\\\\[\\]?*]", "#");
    }

    private String listMerge(List<String> list) {
        if (list == null || list.size() == 0) {
            return "";
        }

        String craftStr = "";
        for (String craft : list) {
            craftStr += ("  " + craft + "  →");
        }

        return craftStr.substring(0, craftStr.length() - 3);
    }

    private void setSheetColumnWidth(HSSFSheet sheet, int[] wid) {
        for (int i = 0; i < wid.length; i++) {
            sheet.setColumnWidth(i, wid[i]);
        }
    }

    private void setRegionStyle(HSSFCellStyle cs, CellRangeAddress region, HSSFSheet sheet) {

        for (int i = region.getFirstRow(); i <= region.getLastRow(); i++) {

            HSSFRow row = sheet.getRow(i);
            if (row == null)
                row = sheet.createRow(i);
            for (int j = region.getFirstColumn(); j <= region.getLastColumn(); j++) {
                HSSFCell cell = row.getCell(j);
                if (cell == null) {
                    cell = row.createCell(j);
                    cell.setCellValue("");
                }
                cell.setCellStyle(cs);
            }
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

class ModuleScheduleForm {
    public String getModulecode() {
        return modulecode;
    }

    public void setModulecode(String modulecode) {
        this.modulecode = modulecode;
    }

    public String getGuestname() {
        return guestname;
    }

    public void setGuestname(String guestname) {
        this.guestname = guestname;
    }

    public String getGuestcode() {
        return guestcode;
    }

    public void setGuestcode(String guestcode) {
        this.guestcode = guestcode;
    }

    public String getStarttime() {
        return starttime;
    }

    public void setStarttime(String starttime) {
        this.starttime = starttime;
    }

    public String getEndtime() {
        return endtime;
    }

    public void setEndtime(String endtime) {
        this.endtime = endtime;
    }

    public String getResumestate() {
        return resumestate;
    }

    public void setResumestate(String resumestate) {
        this.resumestate = resumestate;
    }

    public String getTakeon() {
        return takeon;
    }

    public void setTakeon(String takeon) {
        this.takeon = takeon;
    }

    public Map<String, PartScheduleForm> getPartlist() {
        return partlist;
    }

    public void setPartlist(Map<String, PartScheduleForm> partlist) {
        this.partlist = partlist;
    }

    private String modulecode;
    private String guestname;
    private String guestcode;
    private String starttime;
    private String endtime;
    private String resumestate;
    private String takeon;

    private Map<String, PartScheduleForm> partlist = new LinkedHashMap<String, PartScheduleForm>();
}

class PartScheduleForm {
    public String getPartcode() {
        return partcode;
    }

    public void setPartcode(String partcode) {
        this.partcode = partcode;
    }

    public String getQuantity() {
        return quantity;
    }

    public void setQuantity(String quantity) {
        this.quantity = quantity;
    }

    public List<String> getScheduler() {
        return scheduler;
    }

    public void setScheduler(List<String> scheduler) {
        this.scheduler = scheduler;
    }

    public String getIntro() {
        return intro;
    }

    public void setIntro(String intro) {
        this.intro = intro;
    }

    public String getPartname() {
        return partname;
    }

    public void setPartname(String partname) {
        this.partname = partname;
    }

    private String partcode;
    private String partname;
    private String quantity;
    private List<String> scheduler = new ArrayList<String>();
    private String intro;
}
