package com.kc.module.shared;

public class SharedFields {
    // 设备分类时类型以及子类型单位占用2个字节位置(如根类型01为机台,则普通铣床则为0101,每增加一个子类数字增加两位)
    public static final int DEVICE_CLASSFIC_UNIT_COUNT = 0x2;
    public static final String DEFAULT_LONG_DATETIME_FORMAT = "yyyy-MM-dd HH:mm:ss";
    public static final String ORACLE_DEFAULT_LONE_DATETIME_FORMAT = "yyyy-MM-dd HH24:mi:ss";
    // 默认的长日期格式YYYY-MM-DD
    public static final String DEFAULT_LONG_DATE_FORMAT = "yyyyMMdd";

    public static StringBuilder RegionBuilder;
    public static String CurrentPart;
    public static int Deepth;
}