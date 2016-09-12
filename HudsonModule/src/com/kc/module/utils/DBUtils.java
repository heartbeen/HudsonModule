package com.kc.module.utils;

import java.util.List;

/**
 * 处理有关数据库的相关操作类
 * 
 * @author Administrator
 * 
 */
public class DBUtils {
    public static String ORACLE_DATE_FORMAT_DEFAULT = "yyyy-mm-dd hh24:mi:ss";
    public static String ORACLE_DATE_FORMAT_DATE = "yyyy-mm-dd";

    /**
     * 将日期的字符串转化为制定格式的日期
     * 
     * @param date
     * @param format
     * @return
     */
    public static String toFormatDate(String date, String format) {
        return "TO_DATE('" + date + "','" + format + "')";
    }

    public static String toDateString(String col, String format) {
        return "TO_CHAR(" + col + ",'" + format + "')";
    }

    public static String toFormatDate(String date) {
        return toFormatDate(date, ORACLE_DATE_FORMAT_DEFAULT);
    }

    public static String toDateString(String col) {
        return toDateString(col, ORACLE_DATE_FORMAT_DEFAULT);
    }

    public static String toBetweenString(String start, String end) {
        return "BETWEEN '" + start + "' AND '" + end + "'";
    }

    /**
     * 用于生成全部字符串的SQL
     * 
     * @param tabName
     * @param items
     * @return
     */
    public static String packageInsertSql(String tabName, String[] items) {
        StringBuilder builder = new StringBuilder("INSERT INTO ");

        builder.append(tabName);
        builder.append("VALUES");
        builder.append(sqlIn(items));

        return builder.toString();
    }

    /**
     * 将字符串数组处理为一个SQL的IN条件串<br>
     * 如('a','b','c')
     * 
     * @param items
     * @return
     */
    public static String sqlIn(String[] items) {
        StringBuilder builder = new StringBuilder();
        if (items == null || items.length < 1) {
            return "('')";
        }

        builder.append("('");
        for (String s : items) {
            builder.append(s).append("','");
        }

        return builder.substring(0, builder.length() - 2) + ")";
    }

    /**
     * 将字符串数组处理为一个SQL的IN条件串<br>
     * 如('a','b','c')
     * 
     * @param items
     * @return
     */
    public static String sqlIn(List<String> items) {
        StringBuilder builder = new StringBuilder();
        if (items == null || items.size() < 1) {
            return "('')";
        }

        builder.append("('");
        for (String s : items) {
            builder.append(s).append("','");
        }

        return builder.substring(0, builder.length() - 2) + ")";
    }
}
