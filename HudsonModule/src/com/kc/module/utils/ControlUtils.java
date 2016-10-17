package com.kc.module.utils;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;
import java.util.Locale;

import javax.imageio.ImageIO;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;

import org.apache.poi.hssf.usermodel.HSSFWorkbook;

import com.jfinal.core.Controller;
import com.jfinal.kit.StrKit;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.IAtom;
import com.kc.module.model.Account;

/**
 * 读取用户session信息得到相关方法
 * 
 * @author xuwei
 * 
 */
public class ControlUtils {

    /**
     * 得到当前用户的厂别POSID,主要用于创建数据库ID号
     * 
     * @param c
     *            请求控制器
     * @return
     */
    public static String getFactoryPosid(Controller c) {
        Account a = c.getSessionAttr(ConstUtils.USER_BASE_INFO);

        return a.getStr(ConstUtils.FACTORY_POSID);
    }

    /**
     * 得到当前用户的部门POSID,主要用于创建数据库ID号
     * 
     * @param c
     *            请求控制器
     * @return
     */
    public static String getDeptPosid(Controller c) {
        Account a = c.getSessionAttr(ConstUtils.USER_BASE_INFO);

        return a.getStr(ConstUtils.DEPT_POSID);
    }

    /**
     * 用户所在部门下属单位ID
     * 
     * @param c
     * @return
     */
    public static String getDeptRegionPosid(Controller c) {
        Account a = c.getSessionAttr(ConstUtils.USER_BASE_INFO);
        return a.getStr(ConstUtils.DEPT_REGION_POSID);
    }

    /**
     * 得到用户的位置ID
     * 
     * @param c
     *            请求控制器
     * @return
     */
    public static String getUserPosition(Controller c) {
        Account a = c.getSessionAttr(ConstUtils.USER_BASE_INFO);

        return a.getStr(ConstUtils.POSID_COLUNM_NAME);
    }

    /**
     * 得到用户当前所在部门的层级
     * 
     * @param c
     *            请求控制器
     * @return
     */
    public static String getStepId(Controller c) {
        Account a = c.getSessionAttr(ConstUtils.USER_BASE_INFO);
        return a.getStr("EMPPOSID");
    }

    /**
     * 获取厂区的阶梯代号
     * 
     * @param c
     * @return
     */
    public static String getFactoryStepid(Controller c) {
        String stepid = getStepId(c);
        if (stepid == null || stepid.length() < 2) {
            return "";
        }

        return stepid.substring(0, 2);
    }

    /**
     * 得到用户当前所在部门的层级
     * 
     * @param c
     *            请求控制器
     * @return
     */
    public static String getRoleId(Controller c) {
        Account a = c.getSessionAttr(ConstUtils.USER_BASE_INFO);

        return a.getStr("ROLEID");
    }

    /**
     * 用户所在部门下属单位的层级
     * 
     * @param c
     * @return
     */
    public static String getUserTeamStepId(Controller c) {
        String step = getStepId(c);
        if (step == null || step.length() < 7) {
            return step;
        }

        return step.length() < 6 ? step : step.substring(0, 6);

    }

    /**
     * 用户所在部门的层级
     * 
     * @param c
     * @return
     */
    public static String getUserDeptStepId(Controller c) {
        String step = getStepId(c);

        return step.length() < 4 ? step : step.substring(0, 4);
    }

    /**
     * 得到用户账号Id
     * 
     * @param c
     * @return
     */
    public static String getAccountId(Controller c) {
        Account a = c.getSessionAttr(ConstUtils.USER_BASE_INFO);
        return a.getStr("ACCOUNTID");
    }

    /**
     * 得到用户账号Id
     * 
     * @param c
     * @return
     */
    public static String getAccountWorkNumber(Controller c) {
        Account a = c.getSessionAttr(ConstUtils.USER_BASE_INFO);
        return a.getStr("worknumber");
    }

    /**
     * 得到当前账号名称
     * 
     * @param c
     * @return
     */
    public static String getAccountName(Controller c) {
        Account a = c.getSessionAttr(ConstUtils.USER_BASE_INFO);
        return a.getStr("empname");
    }

    /**
     * 得到应用的真实路径
     * 
     * @param c
     * @return
     */
    public static String getAppRealPath(Controller c) {
        if (StrKit.isBlank(ConstUtils.APP_REAL_PATH)) {
            ConstUtils.APP_REAL_PATH = c.getRequest().getServletContext().getRealPath("");
        }
        return ConstUtils.APP_REAL_PATH;
    }

    /**
     * 得到上传文件保存真实路径
     * 
     * @param c
     * @return
     */
    public static String getUploadRealPath(Controller c) {
        if (StrKit.isBlank(ConstUtils.UPLOAD_REAL_PATH)) {
            ConstUtils.UPLOAD_REAL_PATH = getAppRealPath(c).concat(File.separator)
                                                           .concat("WEB-INF")
                                                           .concat(File.separator)
                                                           .concat("upload");
        }
        return ConstUtils.UPLOAD_REAL_PATH;
    }

    /**
     * 得到保存模具信息的真实路径
     * 
     * @param c
     * @return
     */
    public static String getModuleRealPath(Controller c) {
        if (StrKit.isBlank(ConstUtils.MODULE_REAL_PATH)) {

            ConstUtils.MODULE_REAL_PATH = getUploadRealPath(c).concat(File.separator)
                                                              .concat("module");
        }
        return ConstUtils.MODULE_REAL_PATH;
    }

    /**
     * 得到模具成形产品图片存放地址
     * 
     * @param c
     * @return
     */
    public static String getModuleProductRealPath(Controller c) {
        if (StrKit.isBlank(ConstUtils.MODULE_PRODUCT_PICTURE)) {

            ConstUtils.MODULE_PRODUCT_PICTURE = getModuleRealPath(c).concat(File.separator)
                                                                    .concat("pic");
        }
        return ConstUtils.MODULE_PRODUCT_PICTURE;
    }

    /**
     * 得到保存模具信息的真实路径
     * 
     * @param c
     * @return
     */
    public static String getModulePartRealPath(Controller c) {
        if (StrKit.isBlank(ConstUtils.MODULE_PART_REAL_PATH)) {

            ConstUtils.MODULE_PART_REAL_PATH = getModuleRealPath(c).concat(File.separator)
                                                                   .concat("part");
        }
        return ConstUtils.MODULE_PART_REAL_PATH;
    }

    /**
     * 得到模具三次元测量图片上传存放路径
     * 
     * @param c
     * @return
     */
    public static String getModuleMeasureRealPath(Controller c) {
        if (StrKit.isBlank(ConstUtils.MODULE_MEASURE_PICTURE)) {
            ConstUtils.MODULE_PART_REAL_PATH = getModuleRealPath(c).concat(File.separator)
                                                                   .concat("measure");
        }
        return ConstUtils.MODULE_PART_REAL_PATH;
    }

    /**
     * 获取非JSON格式的参数集合
     * 
     * @param c
     * @param list
     * @return
     */
    public static List<String> getParaList(Controller c, String[] list) {
        if (c == null) {
            return (null);
        }

        if (list == null || list.length == 0) {
            return (null);
        }

        List<String> arr = new ArrayList<String>();

        for (String s : list) {
            arr.add(c.getPara(s));
        }

        return arr;
    }

    /**
     * 获取本人的唯一ID号
     * 
     * @param c
     * @return
     */
    public static String getEmpBarCode(Controller c) {
        Account a = c.getSessionAttr(ConstUtils.USER_BASE_INFO);
        return a.getStr(ConstUtils.USER_EMP_BARCODE);
    }

    /**
     * 导出报告文件
     * 
     * @param workBook
     * @param response
     * @param fileName
     */
    public static void exportFile(HSSFWorkbook workBook,
                                  HttpServletResponse response,
                                  String fileName) {

        response.setCharacterEncoding("utf-8");
        response.reset();// 清空输出流
        response.setContentType("application/vnd.ms-excel;charset=utf-8");// 定义输出类型
        response.setHeader("Content-disposition",
                           "attachment; filename=" + StringUtils.toUTF8String(fileName) + ".xls");// 设定输出文件头

        try {
            ServletOutputStream out = response.getOutputStream();
            // workBook.getCreationHelper().createFormulaEvaluator().evaluateAll();
            workBook.write(out);
            out.flush();
            out.close();

        }
        catch (IllegalArgumentException e) {
            e.printStackTrace();
        }
        catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * 执行数据库的事务操作
     * 
     * @param iAtom
     * @return
     */
    public static boolean doIAtom(IAtom iAtom) {
        return Db.tx(iAtom);
    }

    /**
     * 将控制器请求中的参数转化为JSON字符串
     * 
     * @param control
     * @return
     */
    public static String fromParamterToJson(Controller control) {
        StringBuilder jsonBuilder = new StringBuilder("{");

        Enumeration<String> enu = control.getRequest().getParameterNames();
        int counter = 0;
        while (enu.hasMoreElements()) {
            // 获取参数名字
            String paraName = enu.nextElement();
            String paraVal = StringUtils.parseString(control.getPara(paraName));

            jsonBuilder.append("\"").append(paraName).append("\":\"").append(paraVal).append("\",");

            counter++;
        }

        if (counter > 0) {
            return jsonBuilder.substring(0, jsonBuilder.length() - 1) + "}";
        }

        return "";
    }

    public void getImageByUrl(Controller control, String path) throws IOException {
        FileInputStream hFile = new FileInputStream(path);
        // 得到文件大小
        int i = hFile.available();
        byte data[] = new byte[i];
        // 读数据
        hFile.read(data);

        // 得到向客户端输出二进制数据的对象
        OutputStream toClient = control.getResponse().getOutputStream();
        // 输出数据
        toClient.write(data);

        toClient.flush();
        toClient.close();
        hFile.close();
    }

    /**
     * 导出报告文件
     * 
     * @param workBook
     * @param response
     * @param fileName
     */
    public synchronized static void downLoadImage(Controller controller,
                                                  String param,
                                                  String none,
                                                  int width,
                                                  int height,
                                                  String format) {
        // 如果文件不存在直接返回
        String root = controller.getSession().getServletContext().getRealPath("/");
        //
        String fileName = controller.getPara(param);
        String filePath = null;

        if (StringUtils.isEmpty(fileName)) {
            filePath = root + none;
        } else {
            filePath = root + fileName;

            if (!FileUtils.isExsist(filePath)) {
                filePath = root + none;
            }
        }

        HttpServletResponse resp = controller.getResponse();
        resp.reset();

        // 设置请求头
        resp.setContentType("image/jpeg");
        resp.setHeader("Pragma", "No-cache");
        resp.setHeader("Cache-Control", "no-cache");
        resp.setDateHeader("Expires", 0);

        try {
            BufferedImage image = ImageUtils.getScaleBuffer(filePath, width, height);

            if (image != null) {
                ServletOutputStream out = resp.getOutputStream();
                ImageIO.write(image, format, out);
                out.flush();
                out.close();
            }
        }
        catch (Exception e) {}
    }

    /**
     * 获取布尔型参数值
     * 
     * @param control
     * @param para
     * @param def
     * @return
     */
    public static boolean getParaToBoolean(Controller control, String para, boolean def) {
        Object obj = control.getPara(para);
        if (obj == null) {
            return def;
        }

        return control.getParaToBoolean(para);
    }

    /**
     * 得到用户所选择的语言
     * 
     * @param control
     * @return
     */
    public static String getLocale(Controller control) {
        String locale = Locale.getDefault().getLanguage() + "_" + Locale.getDefault().getCountry();

        String lang = control.getCookie("lang");

        if (StrKit.notBlank(lang)) {
            // 处理旧cookie
            if (!lang.startsWith("zh") && !lang.startsWith("en")) {
                lang = "zh_" + lang;
            }
        } else {
            // 只要不是中文国家，就统一为英文
            lang = locale.startsWith("zh") ? locale : "en_US";

        }

        return lang;
    }
}
