package com.kc.module.utils;

/**
 * 主要用于处理EXCEL中的相关操作
 * 
 * @author Rock
 * 
 */
public class ExcelUtils {
    /**
     * 删除EXCEL读取的字符串中的硬回车ALT+ENTER
     * 
     * @param str
     * @return
     */
    public static String removeHardEnter(String str) {
        if (str == null) {
            return str;
        }

        for (int i = 10; i < 14; i++) {
            str = str.replaceAll(String.valueOf((char) i), "");
        }

        return str;
    }
}
