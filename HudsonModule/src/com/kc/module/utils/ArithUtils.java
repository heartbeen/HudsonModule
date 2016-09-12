package com.kc.module.utils;

import java.math.BigDecimal;

/**
 * 2011-11-18 创建
 * <p>
 * 由于Java的简单类型不能够精确的对浮点数进行运算，<br>
 * 这个工具类提供精确的浮点数运算，包括加减乘除和四舍五入。
 * 
 * @author 徐维
 */
public class ArithUtils {

    // 默认除法运算精度
    private static final int DEF_DIV_SCALE = 10;

    // 这个类不能实例化
    private ArithUtils() {}

    /**
     * 提供精确的加法运算。
     * 
     * @param v1
     *            被加数
     * @param v2
     *            加数
     * @return 两个参数的和
     */
    public static double add(double v1, double v2) {
        BigDecimal b1 = new BigDecimal(Double.toString(v1));
        BigDecimal b2 = new BigDecimal(Double.toString(v2));
        return b1.add(b2).doubleValue();
    }

    /**
     * 提供精确的减法运算。
     * 
     * @param v1
     *            被减数
     * @param v2
     *            减数
     * @return 两个参数的差
     */
    public static double sub(double v1, double v2) {
        BigDecimal b1 = new BigDecimal(Double.toString(v1));
        BigDecimal b2 = new BigDecimal(Double.toString(v2));
        return b1.subtract(b2).doubleValue();
    }

    /**
     * 提供精确的乘法运算。
     * 
     * @param v1
     *            被乘数
     * @param v2
     *            乘数
     * @return 两个参数的积
     */
    public static double mul(double v1, double v2) {
        BigDecimal b1 = new BigDecimal(Double.toString(v1));
        BigDecimal b2 = new BigDecimal(Double.toString(v2));
        return b1.multiply(b2).doubleValue();
    }

    /**
     * 提供精确的乘法运算。
     * 
     * @param v1
     *            被乘数
     * @param v2
     *            乘数
     * @return 两个参数的积
     */
    public static double mul(double v1, BigDecimal v2) {
        BigDecimal b1 = new BigDecimal(Double.toString(v1));
        return b1.multiply(v2).doubleValue();
    }

    /**
     * 提供（相对）精确的除法运算，当发生除不尽的情况时，精确到 小数点以后10位，以后的数字四舍五入。
     * 
     * @param v1
     *            被除数
     * @param v2
     *            除数
     * @return 两个参数的商
     */
    public static double div(double v1, double v2) {
        return div(v1, v2, DEF_DIV_SCALE);
    }

    /**
     * 提供（相对）精确的除法运算，当发生除不尽的情况时，精确到 小数点以后10位，以后的数字四舍五入。
     * 
     * @param v1
     *            被除数
     * @param v2
     *            除数
     * @return 两个参数的商
     */
    public static double div(double v1, BigDecimal v2) {
        return div(v1, v2, DEF_DIV_SCALE);
    }

    /**
     * 提供（相对）精确的除法运算，当发生除不尽的情况时，精确到 小数点以后10位，以后的数字四舍五入。
     * 
     * @param v1
     *            被除数
     * @param v2
     *            除数
     * @return 两个参数的商
     */
    public static double div(BigDecimal v1, BigDecimal v2) {
        return div(v1, v2, DEF_DIV_SCALE);
    }

    /**
     * 提供（相对）精确的除法运算。当发生除不尽的情况时，由scale参数指 定精度，以后的数字四舍五入。
     * 
     * @param v1
     *            被除数
     * @param v2
     *            除数
     * @param scale
     *            表示表示需要精确到小数点以后几位。
     * @return 两个参数的商
     */
    public static double div(double v1, double v2, int scale) {
        if (scale < 0) {
            throw new IllegalArgumentException("The   scale   must   be   a   positive   integer   or   zero");
        }
        BigDecimal b1 = new BigDecimal(Double.toString(v1));
        BigDecimal b2 = new BigDecimal(Double.toString(v2));
        return b1.divide(b2, scale, BigDecimal.ROUND_HALF_UP).doubleValue();
    }

    /**
     * 提供（相对）精确的除法运算。当发生除不尽的情况时，由scale参数指 定精度，以后的数字四舍五入。
     * 
     * @param v1
     *            被除数
     * @param v2
     *            除数
     * @param scale
     *            表示表示需要精确到小数点以后几位。
     * @return 两个参数的商
     */
    public static double div(double v1, BigDecimal v2, int scale) {
        if (scale < 0) {
            throw new IllegalArgumentException("The   scale   must   be   a   positive   integer   or   zero");
        }
        BigDecimal b1 = new BigDecimal(Double.toString(v1));
        // BigDecimal b2 = new BigDecimal(Double.toString(v2));
        return b1.divide(v2, scale, BigDecimal.ROUND_HALF_UP).doubleValue();
    }

    /**
     * 提供（相对）精确的除法运算。当发生除不尽的情况时，由scale参数指 定精度，以后的数字四舍五入。
     * 
     * @param v1
     *            被除数
     * @param v2
     *            除数
     * @param scale
     *            表示表示需要精确到小数点以后几位。
     * @return 两个参数的商
     */
    public static double div(BigDecimal v1, BigDecimal v2, int scale) {
        if (scale < 0) {
            throw new IllegalArgumentException("The   scale   must   be   a   positive   integer   or   zero");
        }
        return v1.divide(v2, scale, BigDecimal.ROUND_HALF_UP).doubleValue();
    }

    /**
     * 提供精确的小数位四舍五入处理。
     * 
     * @param v
     *            需要四舍五入的数字
     * @param scale
     *            小数点后保留几位
     * @return 四舍五入后的结果
     */
    public static double round(double v, int scale) {
        if (scale < 0) {
            throw new IllegalArgumentException("The   scale   must   be   a   positive   integer   or   zero");
        }
        BigDecimal b = new BigDecimal(Double.toString(v));
        BigDecimal one = new BigDecimal("1");
        return b.divide(one, scale, BigDecimal.ROUND_HALF_UP).doubleValue();
    }

    /**
     * 将字符串转化为整型(如果字符非数字返回0其他返回数字)
     * 
     * @param str
     * @return
     */
    public static int parseInt(String str) {
        try {
            return Integer.valueOf(str);
        }
        catch (Exception e) {
            return 0;
        }
    }

    /**
     * 将字符串转换为整形数值,当转换不成功时,返回设置的默认值DEF的值
     * 
     * @param str
     * @param def
     * @return
     */
    public static int parseInt(String str, int def) {
        try {
            return Integer.valueOf(str);
        }
        catch (Exception e) {
            return def;
        }
    }

    /**
     * 将数字转换为整形[输入参数可以是整数也可以是小数]
     * 
     * @param number
     * @param def
     * @return
     */
    public static int parseIntNumber(Object number, int def) {
        try {
            return (int) Double.parseDouble(StringUtils.parseString(number));
        }
        catch (Exception e) {
            return def;
        }
    }

    /**
     * 將Object類型轉化為Double型
     * 
     * @param str
     * @param def
     * @return
     */
    public static double parseDouble(Object str, double def) {
        try {
            return Double.parseDouble(str.toString());
        }
        catch (Exception e) {
            return def;
        }
    }

    public static boolean isInt(String val) {
        try {
            Integer.valueOf(val);
            return (true);
        }
        catch (Exception e) {
            return (false);
        }
    }

    /**
     * 判断一个字符串是否是一个正整数<br>
     * 
     * @param val
     * @param zero
     * @return
     */
    public static boolean isPlusInt(String val, boolean zero) {
        try {
            int intVal = Integer.valueOf(val);
            return (intVal > (zero ? 0 : -1));
        }
        catch (Exception e) {
            return (false);
        }
    }

    /**
     * 是否为double型数字
     * 
     * @param number
     * @return
     */
    public static boolean isDouble(String number) {
        try {
            Double.parseDouble(number);
            return true;
        }
        catch (Exception e) {
            return false;
        }
    }

    /**
     * 判断一个字符串是否DOUBLE型数字
     * 
     * @param number
     *            字符串
     * @param notsuffix
     *            该参数表示是否解析尾部带D的字符串,true为不解析,false为解析
     * @return
     */
    public static boolean isDouble(String number, boolean notsuffix) {
        try {
            if (notsuffix && number.toUpperCase().contains("D")) {
                return (false);
            }

            Double.parseDouble(number);
            return true;
        }
        catch (Exception e) {
            return false;
        }
    }

    /**
     * 将获取NUMBER类中的DOUBLE型数值
     * 
     * @param num
     * @param def
     * @return
     */
    public static double toDouble(Number num, double def) {
        return num == null ? def : num.doubleValue();
    }

    /**
     * 将获取NUMBER类中的INT型数值
     * 
     * @param num
     * @param def
     * @return
     */
    public static int toInt(Number num, int def) {
        return num == null ? def : num.intValue();
    }
};
