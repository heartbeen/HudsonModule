package com.kc.module.upload;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.apache.poi.EncryptedDocumentException;
import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFClientAnchor;
import org.apache.poi.hssf.usermodel.HSSFPatriarch;
import org.apache.poi.hssf.usermodel.HSSFPicture;
import org.apache.poi.hssf.usermodel.HSSFPictureData;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFShape;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.PictureData;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import com.jfinal.core.Controller;
import com.jfinal.log.Logger;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.base.Barcode;
import com.kc.module.base.ModuleState;
import com.kc.module.model.Factory;
import com.kc.module.model.ModuleList;
import com.kc.module.model.ModuleResume;
import com.kc.module.model.ModuleResumeRecord;
import com.kc.module.utils.ConstUtils;
import com.kc.module.utils.ControlUtils;
import com.kc.module.utils.DateUtils;

public class UploadFileHandling {

    private static Logger logger = Logger.getLogger(UploadFileHandling.class);

    /**
     * 将EXCEL表格中的图片数据进行分类保存到Map
     * 
     * @param pictures
     * @param sheet
     * @return
     */
    private static Map<String, PictureData> parsePicture(List<HSSFPictureData> pictures,
                                                         HSSFSheet sheet) {

        Map<String, PictureData> prctureMap = new HashMap<String, PictureData>();
        PictureData picData;
        for (HSSFShape shape : sheet.getDrawingPatriarch().getChildren()) {
            HSSFClientAnchor anchor = (HSSFClientAnchor) shape.getAnchor();

            if (shape instanceof HSSFPicture) {
                HSSFPicture pic = (HSSFPicture) shape;
                picData = pictures.get(pic.getPictureIndex() - 1);

                if (!picData.suggestFileExtension().equals("dib")) {
                    prctureMap.put(anchor.getRow1() + "" + anchor.getCol1(), picData);
                }
            }
        }

        return prctureMap;
    }

    /**
     * 处理xls文件
     * 
     * @param file
     * @return
     */
    private static List<HSSFSheet> handlingXls(Controller c, HSSFWorkbook book) {

        List<HSSFSheet> list = new ArrayList<HSSFSheet>();

        try {

            for (int i = 0; i < book.getNumberOfSheets(); i++) {
                list.add(book.getSheetAt(i));
            }
        }
        catch (EncryptedDocumentException e) {
            logger.error("您上传的文件加密了,无法读取!");
            c.setAttr("msg", "您上传的文件加密了,无法读取!");
        }

        return list;
    }

    /**
     * 处理xls文件
     * 
     * @param file
     * @return
     */
    private static List<XSSFSheet> handlingXlsx(Controller c, File file) {

        List<XSSFSheet> list = new ArrayList<XSSFSheet>();

        try {
            XSSFWorkbook book = new XSSFWorkbook(new FileInputStream(file));

            for (int i = 0; i < book.getNumberOfSheets(); i++) {
                list.add(book.getSheetAt(i));
            }
        }
        catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }

    /**
     * 保存模具产品图片
     * 
     * @param pic
     * @param path
     * @throws IOException
     * @throws Exception
     */
    private static void saveProductPic(PictureData pic, String path) throws IOException {

        FileOutputStream out = new FileOutputStream(path);
        out.write(pic.getData());
        out.close();
    }

    /**
     * 对EXCEL文件中的模具信息进行分类
     * 
     * @param c
     * @param file
     */
    public static List<Record> moduleInfoXls(Controller c, File file) {
        HSSFWorkbook book;

        List<Record> moduleList = new ArrayList<Record>();

        try {
            book = new HSSFWorkbook(new FileInputStream(file));
            List<HSSFSheet> list = handlingXls(c, book);

            Record ml;
            Date date;
            HSSFRow row;
            String moduleCode;

            String creator = ControlUtils.getAccountWorkNumber(c);
            String creatorname = ControlUtils.getAccountName(c);
            String filename = file.getName();
            String guest = null;
            String guestId = null;
            String ton = "";
            List<HSSFPictureData> pictures = book.getAllPictures();
            int index = -1;
            for (HSSFSheet sheet : list) {
                row = sheet.getRow(0);
                ++index;
                if (getCellValue(row.getCell(0)).toString().indexOf("起工") < 0) {
                    c.setAttr("msg", "您上传的不是模具起工通知书!");
                    break;
                }

                // HSSFWorkbook moduleBook = new HSSFWorkbook();
                // DataHandleUtils.cloneHSSFSheet(sheet, "模具起工通知书", moduleBook);

                Map<String, PictureData> map = parsePicture(pictures, sheet);

                // 模具信息从12行开始
                for (int i = 11; i < sheet.getLastRowNum(); i++) {
                    row = sheet.getRow(i);

                    if (row != null) {// 表示没有模具信息 //

                        if (getCellValue(row.getCell(4)).toString().equals("")) {
                            break;
                        }
                        PictureData picData = map.get(i + "" + 5);
                        ml = new Record();

                        ml.set("POSID", ControlUtils.getFactoryPosid(c));
                        ml.set("MODULEBARCODE", Barcode.MODULE.nextVal());
                        ml.set("GUESTNAME", getCellValue(row.getCell(1)));
                        ml.set("MODULECLASS", getCellValue(row.getCell(2)));
                        ml.set("GUESTCODE", getCellValue(row.getCell(3)));
                        ml.set("MODULECODE", getCellValue(row.getCell(4)));

                        // 生成模具产品图片名称
                        ml.set("PICTUREURL",
                               ml.get("MODULECODE") + "." + picData.suggestFileExtension());

                        // 保存模具产品图片---------------------------------------------------
                        saveProductPic(picData, ControlUtils.getModuleProductRealPath(c)
                                                + File.separator
                                                + ml.get("PICTUREURL"));

                        // 将图片
                        // insertPicture(moduleBook, picData, (short) 5, (short)
                        // i);

                        ml.set("PRODUCTNAME", getCellValue(row.getCell(6)));
                        ml.set("PLASTIC", getCellValue(row.getCell(7)));

                        ml.set("UNITEXTRAC",
                               Integer.valueOf(numberToString(getCellValue(row.getCell(8)))));

                        ton = getCellValue(row.getCell(9)).toString().toUpperCase();
                        ml.set("WORKPRESSURE", Integer.valueOf(ton.replace("T", "")));

                        date = convertDate(getCellValue(row.getCell(10)));
                        ml.set("STARTTIME", new Timestamp(date.getTime()));

                        date = convertDate(getCellValue(row.getCell(11)));
                        ml.set("INITTRYTIME", new Timestamp(date.getTime()));

                        ml.set("TAKEON", getCellValue(row.getCell(12)));
                        ml.set("MODULEINTRO", getCellValue(row.getCell(13)));

                        moduleCode = ml.get("MODULECODE");
                        ml.set("CREATEYEAR", moduleCode.substring(2, 4));
                        ml.set("CREATEMONTH", moduleCode.substring(4, 6));
                        ml.set("MONTHNO", Integer.valueOf(moduleCode.substring(7, 9)));
                        ml.set("MODULESTYLE", moduleCode.substring(0, 2));
                        ml.set("CREATOR", creator);
                        ml.set("TAKEON", creator);
                        ml.set("TAKEONNAME", creatorname);
                        ml.set("CREATORNAME", creatorname);
                        ml.set("MODULESTATE", "0");
                        ml.set("FILENAME", filename);
                        ml.set("EXCELINDEX", index);

                        // 得到客户ID
                        if (guest == null) {
                            guest = moduleCode.substring(6, 7);
                            guestId = Factory.dao.findFactoryId(guest);
                        } else {
                            if (guest != moduleCode.substring(6, 7)) {
                                guest = moduleCode.substring(6, 7);
                                guestId = Factory.dao.findFactoryId(guest);
                            }
                        }

                        ml.set("GUESTID", guestId);
                        moduleList.add(ml);

                    }
                }
                map = null;

                // write(moduleBook, "");

            }

            book = null;
            list = null;

        }
        catch (FileNotFoundException e) {
            logger.error("您上传的文件保存失败!", e);
            c.setAttr("msg", "您上传的文件保存失败!");
        }
        catch (IOException e) {
            logger.error("您上传的文件有错误!", e);
            c.setAttr("msg", "您上传的文件有错误!");
        }

        return moduleList;
    }

    /**
     * 
     * @param cell
     * @return
     */
    private static Object getCellValue(HSSFCell cell) {

        if (cell == null) {
            return new Object();
        }

        Object obj = new String("");

        int type = cell.getCellType();

        switch (type) {
        case HSSFCell.CELL_TYPE_BLANK: {
            obj = new String("");
            break;
        }

        case HSSFCell.CELL_TYPE_BOOLEAN: {
            obj = cell.getBooleanCellValue();
            break;
        }

        case HSSFCell.CELL_TYPE_NUMERIC: {
            obj = cell.getNumericCellValue();
            break;
        }

        case HSSFCell.CELL_TYPE_STRING: {
            obj = cell.getStringCellValue().trim();
            break;
        }

        default: {
            obj = cell.getDateCellValue();
            break;
        }
        }

        return obj;
    }

    private static void write(HSSFWorkbook moduleBook, String fileName) throws IOException {

        // moduleBook.getCreationHelper().createFormulaEvaluator().evaluateAll();
        FileOutputStream out = new FileOutputStream(ConstUtils.MODULE_REAL_PATH
                                                    + File.separator
                                                    + UUID.randomUUID()
                                                    + ".xls");
        moduleBook.write(out);
        out.close();
        moduleBook = null;
    }

    /**
     * 
     * @param dataObj
     * @return
     */
    private static Date convertDate(Object dataObj) {
        return DateUtils.addDate(new Date(0, 0, -1),
                                Integer.valueOf(dataObj.toString().replace(".0", "")));

    }

    /**
     * 
     * @param wbook
     * @param picData
     * @param x
     * @param y
     */
    private static void insertPicture(HSSFWorkbook wbook, PictureData picData, short x, short y) {

        HSSFPatriarch patriarch = wbook.getSheetAt(0).createDrawingPatriarch();
        HSSFClientAnchor anchor = new HSSFClientAnchor(0, // 第1个单元格中x轴的偏移量
                                                       0, // 第1个单元格中y轴的偏移量
                                                       0, // 第2个单元格中x轴的偏移量，最大值1023
                                                       0, // 第2个单元格中y轴的偏移量，最大值255
                                                       x, // 第1个单元格的列号
                                                       y, // 第1个单元格的行号
                                                       x, // 第2个单元格的列号
                                                       y); // 第2个单元格的行号

        // 如果要放多张图要设置 anchor.setAnchorType(2);

        // 参数设置第几张，插入一张不用设置 //插入图片
        patriarch.createPicture(anchor,
                                wbook.addPicture(picData.getData(), HSSFWorkbook.PICTURE_TYPE_PNG));
    }

    private static String numberToString(Object obj) {
        return obj.toString().toString().replace(".0", "");
    }

    /**
     * 模具零件信息导入
     * 
     * @param c
     * @param file
     * @return
     */
    public static List<Record> modulePartXls(Controller c, File file) {
        List<Record> partList = new ArrayList<Record>();
        HSSFWorkbook book;

        try {
            book = new HSSFWorkbook(new FileInputStream(file));
            List<HSSFSheet> sheetList = handlingXls(c, book);

            HSSFRow row;
            String modulecode;
            Record record;
            ModuleList module;
            String moduleResumeId;
            String posId = ControlUtils.getFactoryPosid(c);

            for (HSSFSheet sheet : sheetList) {

                row = sheet.getRow(0);
                if (row == null) {
                    break;
                }

                if (getCellValue(row.getCell(0)).toString().indexOf("零件清单") < 0) {
                    throw new IOException();
                }

                modulecode = getCellValue(row.getCell(8)).toString();

                module = ModuleList.dao.findModuleForModuleCode(modulecode);

                // 模具信息没有先期导入时,临时创建模具信息，但后要加入
                if (module == null) {
                    module = new ModuleList();

                    module.set("MODULEBARCODE", Barcode.MODULE.nextVal());
                    module.set("MODULECODE", modulecode);
                    module.set("POSID", posId);
                    module.set("CREATEYEAR", modulecode.substring(2, 4));
                    module.set("CREATEMONTH", modulecode.substring(4, 6));
                    module.set("MONTHNO", Integer.valueOf(modulecode.substring(7, 9)));
                    module.set("MODULESTYLE", modulecode.substring(0, 2));
                    module.set("GUESTID", Factory.dao.findFactoryId(modulecode.substring(6, 7)));

                    // 创建模具履历
                    ModuleResume mr = new ModuleResume();
                    ModuleResumeRecord mrr = new ModuleResumeRecord();

                    moduleResumeId = Barcode.MODULE_RESUME.nextVal();
                    mr.set("ID", moduleResumeId);
                    mr.set("CURESTATE", "1");
                    mr.set("RESUMESTATE", ModuleState.MODULE_NEW.getIndex());
                    mr.set("RESUMEEMPID", ControlUtils.getAccountWorkNumber(c));
                    mr.set("MODULEBARCODE", module.get("MODULEBARCODE"));

                    mrr.set("ID", moduleResumeId);
                    mrr.set("RESUMESTATE", ModuleState.MODULE_NEW.getIndex());
                    mrr.set("RESUMEEMPID", mr.get("RESUMEEMPID"));
                    mrr.set("MODULEBARCODE", module.get("MODULEBARCODE"));

                    if (!(module.save() && mr.save() && mrr.save())) {
                        return partList;
                    }
                } else {
                    ModuleResume mr = ModuleResume.dao.findModuleResumeByModuleBarcode(module.get("MODULEBARCODE"));
                    moduleResumeId = mr.get("ID");
                }

                for (int i = 6; i < sheet.getLastRowNum(); i++) {

                    row = sheet.getRow(i);

                    if (row == null) {
                        continue;
                    }

                    if (!getCellValue(row.getCell(2)).equals("")) {
                        record = new Record();

                        record.set("PARTBARCODE", Barcode.MODULE_PART.nextVal());
                        record.set("MODULEBARCODE", module.get("MODULEBARCODE"));
                        record.set("ISPROCESS", getCellValue(row.getCell(0)).equals("") ? 0 : 1);
                        record.set("PARTCODE", numberToString(getCellValue(row.getCell(1))));
                        record.set("CNAMES", getCellValue(row.getCell(2)));
                        // record.set("ENAMES", getCellValue(row.getCell()));
                        // record.set("RACEID", getCellValue(row.getCell()));
                        record.set("NORMS", getCellValue(row.getCell(6)));
                        record.set("MATERIAL", getCellValue(row.getCell(3)));
                        record.set("QUANTITY", getCellValue(row.getCell(4)));
                        record.set("REMARK", getCellValue(row.getCell(9)));
                        record.set("MODULERESUMEID", moduleResumeId);

                        partList.add(record);
                    }

                }

            }

        }
        catch (FileNotFoundException e) {
            logger.error("没有零件清单!");
            c.setAttr("msg", "没有找到你导入的清单文件!");
        }
        catch (IOException e) {
            logger.error("不是零件清单!");
            c.setAttr("msg", "您导入的不是零件清单,请重新导入!");
        }
        catch (NullPointerException e) {
            logger.error("空指针错误!", e);
            c.setAttr("msg", "数据读取空指针错误,请联系管理员!");
        }

        return partList;
    }
}
