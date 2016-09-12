package com.kc.module.utils;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.DbKit;
import com.jfinal.plugin.activerecord.Record;
import com.jfinal.plugin.activerecord.dialect.Dialect;
import com.jfinal.plugin.activerecord.dialect.OracleDialect;

public class ConstUtils {

    /**
     * 模具部门默认ID
     */
    public static final String MODULE_DEPT_CODE = "01";

    public static final int HOUR_MILLISECOND = 3600000;

    /**
     * 用户请求
     */
    public static final String REQUEST_TIME_ATTR = "requestTime";

    /**
     * 用户请求间隙限制毫秒数
     */
    public static final int REQUEST_TIME = 700;

    /**
     * 整数正则表达式,包括:0
     */
    public static final String INT_OR_ZERO_REGEX = "^-?[1-9]\\d*$|0";

    /**
     * 整数正则表达式
     */
    public static final String INT_REGEX = "^-?[1-9]\\d*$";

    /**
     * 负整数正则表达式
     */
    public static final String NEGATIVE_INT = "^-[1-9]\\d*$";

    /**
     * 正整数正则表达式
     */
    public static final String POSITIVE_INT = "^[1-9]\\d*$";

    /** 基本信息,一条记录 */
    public static final String USER_BASE_INFO = "baseInfo";
    /** 员工唯一ID号 **/
    public static final String USER_EMP_BARCODE = "empbarcode";

    /** 基本信息,多条记录 */
    public static final String USER_POSITION = "basePathInfo";

    /** 用于拦截器 */
    public static final String USER_AUTH_PATH = "interInfo";

    public static final String FACTORY_POSID = "factoryposid";

    public static final String DEPT_POSID = "deptposid";

    public static final String SCH_OUT_FLAG = "OUT";

    /** 用户作用位置字段名称 */
    public static final String POSID_COLUNM_NAME = "posid";

    /**
     * 用户所在部门下属单位
     */
    public static final String DEPT_REGION_POSID = "deptregionposid";

    public static String DATE_FORMAT = "yyMMdd";

    /**
     * 应用的真实路径
     */
    public static String APP_REAL_PATH = "";

    /**
     * 上传文件保存路径
     */
    public static String UPLOAD_REAL_PATH = "";

    /**
     * 上传的模具信息保存真实路径
     */
    public static String MODULE_REAL_PATH = "";

    /**
     * 上传的模具零件保存真实路径
     */
    public static String MODULE_PART_REAL_PATH = "";

    /**
     * 模具成形产品图片存放地址
     */
    public static String MODULE_PRODUCT_PICTURE = "";

    /**
     * 模具三次元测量图片上传存放路径
     */
    public static String MODULE_MEASURE_PICTURE = "";

    /**
     * 模具序号的长度
     */
    public static int MODULE_SEQUENCE_LENGTH = 3;

    /**
     * 匹配中文
     */
    public static Pattern CHINESE_PATTERN = Pattern.compile("[\u4e00-\u9fa5]");

    /**
     * 匹配模具加工中的螺丝
     */
    public static Pattern SCREW_PATTERN = Pattern.compile("[\u87BA\u7D72\u4E1D]");

    /**
     * 匹配('模具清单')或('模具清單')
     */
    public static Pattern MODULE_BOM_PATTERN = Pattern.compile("(\u6A21\u5177\u6E05\u55AE)|(\u6A21\u5177\u6E05\u5355)");

    /**
     * 匹配('测量清单')或('測量清單')
     */
    public static Pattern MODULE_MEASURE_PATTERN = Pattern.compile("(\u6E2C\u91CF\u6E05\u55AE)|(\u6D4B\u91CF\u6E05\u5355)");

    /**
     * 数据库字符集
     */
    public static String DATABASE_CHARSET = "";

    public static final int FACTORY_LAYOUT = 2;

    public static final int DEPT_LAYOUT = 4;

    public static final int DEPT_SUB_LAYOUT = 6;

    public static String DOALL = "11215";

    /**
     * 客户模具进度格式行坐标
     */
    public static final Map<String, Integer> CUSTOMER_SCHEDULE = new HashMap<String, Integer>();

    public static final Map<String, String> PART_STATE = new HashMap<String, String>();

    public static final String CUSTOMER_SCHEDULE_PATH = "/com/kc/module/reportexcel/customer_schedule.xls";

    public static final String MODULE_PROCESS_PATH = "/com/kc/module/reportexcel/module_process.xls";

    static {
        // 计划排程坐标
        CUSTOMER_SCHEDULE.put("100M-S", 3);
        CUSTOMER_SCHEDULE.put("100H-S", 7);
        CUSTOMER_SCHEDULE.put("100SG-S", 11);
        CUSTOMER_SCHEDULE.put("100CNC-S", 17);
        CUSTOMER_SCHEDULE.put("100WE-S", 23);
        CUSTOMER_SCHEDULE.put("100NCE-S", 27);
        CUSTOMER_SCHEDULE.put("100EDM-S", 31);
        CUSTOMER_SCHEDULE.put("100QM-S", 35);
        CUSTOMER_SCHEDULE.put("100GT-S", 40);

        CUSTOMER_SCHEDULE.put("200M-S", 5);
        CUSTOMER_SCHEDULE.put("200H-S", 9);
        CUSTOMER_SCHEDULE.put("200SG-S", 13);
        CUSTOMER_SCHEDULE.put("200CNC-S", 19);
        CUSTOMER_SCHEDULE.put("200WE-S", 25);
        CUSTOMER_SCHEDULE.put("200NCE-S", 29);
        CUSTOMER_SCHEDULE.put("200EDM-S", 33);
        CUSTOMER_SCHEDULE.put("200QM-S", 37);
        CUSTOMER_SCHEDULE.put("200GT", 42);

        // 实际加工坐标
        CUSTOMER_SCHEDULE.put("100M-A", 4);
        CUSTOMER_SCHEDULE.put("100H-A", 8);
        CUSTOMER_SCHEDULE.put("100SG-A", 12);
        CUSTOMER_SCHEDULE.put("100CNC-A", 18);
        CUSTOMER_SCHEDULE.put("100WE-A", 24);
        CUSTOMER_SCHEDULE.put("100NCE-A", 28);
        CUSTOMER_SCHEDULE.put("100EDM-A", 32);
        CUSTOMER_SCHEDULE.put("100QM-A", 36);
        CUSTOMER_SCHEDULE.put("100GT-A", 41);

        CUSTOMER_SCHEDULE.put("200M-A", 6);
        CUSTOMER_SCHEDULE.put("200H-A", 10);
        CUSTOMER_SCHEDULE.put("200SG-A", 14);
        CUSTOMER_SCHEDULE.put("200CNC-A", 20);
        CUSTOMER_SCHEDULE.put("200WE-A", 26);
        CUSTOMER_SCHEDULE.put("200NCE-A", 30);
        CUSTOMER_SCHEDULE.put("200EDM-A", 34);
        CUSTOMER_SCHEDULE.put("200QM-A", 38);
        CUSTOMER_SCHEDULE.put("200GT-A", 43);

        //
        PART_STATE.put("20209", "加工完");
        PART_STATE.put("20208", "待加工");
        PART_STATE.put("20201", "加工中");
        PART_STATE.put("20202", "暂停");
        PART_STATE.put("20203", "暂停");

    }

    /**
     * 服务启动初始相关ID号
     */
    public static void initConst() {

        DATABASE_CHARSET = dataBaseCharset();
    }

    /**
     * 得到数据库的字符集<br>
     * 
     * ZHT16MSWIN950 为繁体
     * 
     * @return
     */
    private static String dataBaseCharset() {
        Dialect dialect = DbKit.getConfig().getDialect();
        Record r = null;
        if (dialect instanceof OracleDialect) {
            r = Db.findFirst("select userenv('language') lang from dual");
        }

        return r.get("lang").toString();
    }

    /**
     * 从数据库中得到指表和编号列的最大值
     * 
     * @param tableName
     * @param colnum
     * @param includeDate
     *            编号是否要包含日期
     * @param count
     *            位数
     * @return
     */
    public static long getBarcode(String tableName, String colnum, boolean includeDate, String count) {
        String id = "0";
        StringBuilder sql = new StringBuilder();
        String date = DateUtils.dateToStr(new Date(), DATE_FORMAT);
        String tableId;

        sql.append("select max(").append(colnum).append(")");
        sql.append(colnum).append(" from ").append(tableName);

        if (includeDate) {
            sql.append(" where ").append(colnum).append(" like '%");
            sql.append(date).append("%'");
        }

        Record data = Db.findFirst(sql.toString());

        id = (includeDate ? date : "") + count;
        if ((tableId = data.get(colnum)) == null) {
            id = (includeDate ? date : "") + count;
        } else {

            // 判断条码是否要包含日期
            if (includeDate) {
                if (tableId.indexOf(date) != -1) {
                    id = tableId.substring(tableId.indexOf(date));
                } else {
                    id = date + count;
                }
            } else {
                id = tableId;
            }

        }

        return Long.valueOf(id);
    }
}
