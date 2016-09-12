package com.kc.module.upload;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.util.ArrayList;
import java.util.List;

import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.poifs.filesystem.POIFSFileSystem;

import com.kc.module.model.form.ParsePartListForm;
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.ExcelUtils;
import com.kc.module.utils.StringUtils;

/**
 * 对谷崧厂上传模具资料进行处理
 * 
 * @author David
 * @email xuweissh@163.com
 * 
 */
public class ModuleUploadFileHandling {
    // 获取工件文件的解析状态
    public static int PARSE_STATE;

    public static List<ParsePartListForm> parseExcelFile(File file, int start) {
        List<ParsePartListForm> partInfo = new ArrayList<ParsePartListForm>();
        try {
            // 将解析的IO流放入POI处理类
            POIFSFileSystem fs = new POIFSFileSystem(new BufferedInputStream(new FileInputStream(file)));
            HSSFWorkbook wb = new HSSFWorkbook(fs);

            // 判断SHEET个数是否大于1,如果为0个则返回NULL
            int sheetCount = wb.getNumberOfSheets();
            if (sheetCount < 1) {
                PARSE_STATE = -1;
                wb.close();
                return (partInfo);
            }

            // 获取第一个SHEET工作表,模板默认就是一个
            HSSFSheet sheet = wb.getSheetAt(0);
            int rowCount = sheet.getLastRowNum();

            for (int x = start; x <= rowCount; x++) {

                // 获取工件资料行,如果值为空,则跳过
                HSSFRow dataRow = sheet.getRow(x);
                if (dataRow == null) {
                    continue;
                }

                String partcode = parseIntString(getCellValue(dataRow.getCell(1)));

                // 如果工件的讯息为空,则跳过这个列
                if (StringUtils.isEmpty(partcode)) {
                    continue;
                }

                ParsePartListForm partform = new ParsePartListForm();

                // 设置零件代号
                partform.setPartcode(partcode);
                // 设置零件名称
                partform.setPartname(getCellValue(dataRow.getCell(2)));
                // 设置素材
                partform.setMaterial(getCellValue(dataRow.getCell(3)));
                // 读取并设置零件数量
                partform.setPartcount(ArithUtils.parseIntNumber(getCellValue(dataRow.getCell(4)), 1) + "");
                // 设置零件规格
                partform.setNorms(getCellValue(dataRow.getCell(5)));

                // 读取零件备注 2016/06/25
                partform.setRemark(getCellValue(dataRow.getCell(11)));

                partInfo.add(partform);
            }

            wb.close();

            PARSE_STATE = 1;
            return partInfo;
        }
        catch (Exception e) {
            return partInfo;
        }
    }

    // /**
    // * 设置公差格式
    // *
    // * @param tolerance
    // * @param ref
    // * @return
    // */
    // private static String toleranceFormat(String tolerance, String ref) {
    // if (StringUtils.isEmpty(tolerance)) {
    // return ref;
    // }
    // if (ArithUtils.isDouble(tolerance)) {
    // double toler = ArithUtils.parseDouble(tolerance, 0);
    // if (toler > 0) {
    // return "+" + tolerance;
    // }
    //
    // return tolerance;
    // } else {
    // return tolerance;
    // }
    // }

    // /**
    // * 将科学计数法转化为一般的数字
    // *
    // * @param val
    // * @return
    // */
    // private static String parseBigDecimalString(String val) {
    // try {
    // BigDecimal bd = new BigDecimal(val);
    // return bd.toPlainString();
    // }
    // catch (Exception e) {
    // return val;
    // }
    // }

    // private static String getNeedPiccode(String val, int len) {
    // if (val == null) {
    // return val;
    // }
    //
    // if (val.length() > len) {
    // return parseBigDecimalString(val);
    // }
    //
    // // 如果是数字则去除小数位
    // if (ArithUtils.isDouble(val)) {
    // return (long) ArithUtils.parseDouble(val, 0) + "";
    // }
    //
    // return val;
    // }
    //
    /**
     * 将一个字符串转化为整形如DOUBLE型则转化为整形如非数字直接返回
     * 
     * @param val
     * @return
     */
    private static String parseIntString(String val) {
        // 如果零件为整型直接返回
        if (ArithUtils.isInt(val)) {
            return val;
        }
        if (!ArithUtils.isDouble(val, true)) {
            return val;
        }

        return (int) ArithUtils.parseDouble(val, 0) + "";
    }

    private static String getCellValue(HSSFCell cell) {
        String strCell = "";
        if (cell == null) {
            return "";
        }

        switch (cell.getCellType()) {
        case HSSFCell.CELL_TYPE_STRING:
            strCell = cell.getStringCellValue();
            break;
        case HSSFCell.CELL_TYPE_NUMERIC:
            strCell = String.valueOf(cell.getNumericCellValue());
            break;
        case HSSFCell.CELL_TYPE_BOOLEAN:
            strCell = String.valueOf(cell.getBooleanCellValue());
            break;
        case HSSFCell.CELL_TYPE_BLANK:
            break;
        default:
            break;
        }

        if (strCell == null) {
            strCell = "";
        }

        // 清除制表符,回车,换行符
        strCell = StringUtils.trimBlank(strCell, null);
        // 清除EXCEL中的硬回车
        strCell = ExcelUtils.removeHardEnter(strCell);

        return strCell;
    }
}
