package com.kc.module.utils;

import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;

/**
 * 字符串处理工具类
 * 
 * @author 徐维
 * @email xuwei@sinyon.com.cn
 * 
 */
public class StringUtils {

    /**
     * 首字母大写
     * 
     * @param s
     *            单词
     * @return
     */
    public static String initialUpperCase(String s) {
        if (s == null)
            return "";

        return s.substring(0, 1).toUpperCase() + s.substring(1);
    }

    /**
     * 得到getter方法名
     * 
     * @param s
     * @return
     */
    public static String getGetMethod(String s) {
        return "get" + initialUpperCase(s);
    }

    /**
     * 得到setter方法名
     * 
     * @param s
     * @return
     */
    public static String getSetMethod(String s) {
        return "set" + initialUpperCase(s);
    }

    /**
     * 对URL路径进行url编码
     * 
     * @param path
     *            路径
     * @return
     */
    public static String urlEncoder(String path) {

        try {
            return URLEncoder.encode(path, "utf-8");
        }
        catch (Exception e) {
            return path;
        }
    }

    /**
     * 得到应用地址
     * 
     * @param request
     * @return
     */
    public static String getBasePath(HttpServletRequest request) {
        String path = request.getContextPath();
        String basePath = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort() + path + "/";
        return basePath;
    }

    /**
     * 左补字符串
     * 
     * @param str
     * @param padSize
     * @param padStr
     * @return
     */
    public static String leftPad(Object str, int padSize, String padStr) {
        // 字符串或者匹配串为NULL,则返回字符串本身
        if (str == null || padStr == null) {
            return str.toString();
        }

        int len = str.toString().length();
        if (padSize <= len) {
            return str.toString();
        } else {
            // 左补数据资料
            StringBuffer buffer = new StringBuffer();
            for (int i = 0; i < padSize - len; i++) {
                buffer.append(padStr);
            }

            // 左补字符串本身
            buffer.append(str);
            return buffer.toString();
        }
    }

    /**
     * 右补字符串
     * 
     * @param str
     * @param padSize
     * @param padStr
     * @return
     */
    public static String rightPad(String str, int padSize, String padStr) {
        // 字符串或者匹配串为NULL,则返回字符串本身
        if (str == null || padStr == null) {
            return str;
        }

        int len = str.length();
        if (padSize <= len) {
            return str;
        } else {
            // 左补数据资料
            StringBuffer buffer = new StringBuffer();

            // 左补字符串本身
            buffer.append(str);

            for (int i = 0; i < padSize - len; i++) {
                buffer.append(padStr);
            }

            return buffer.toString();
        }
    }

    /**
     * 判断字符串是否为空,若为空则返回TRUE,否则返回FALSE
     * 
     * @param str
     * @return
     */
    public static boolean isEmpty(String str) {
        if (str == null || str.trim().equals("")) {
            return (true);
        }

        return (false);
    }

    /**
     * 判断字符串是否为空,若为空则返回TRUE,否则返回FALSE
     * 
     * @param str
     * @return
     */
    public static boolean isEmpty(Object str) {
        if (str == null || str.toString().trim().equals("")) {
            return (true);
        }

        return (false);
    }

    /**
     * 将OBJECT类型的值转换为String
     * 
     * @param obj
     * @return
     */
    public static String parseString(Object obj) {
        if (obj == null) {
            return "";
        }

        return obj.toString();
    }

    /**
     * 判断是字符串是否为空,如果为空则被一个设置的值replace代替
     * 
     * @param txt
     * @param replace
     * @return
     */
    public static String nvl(String txt, String replace) {
        if (isEmpty(txt)) {
            return replace;
        }

        return txt;
    }

    /**
     * 判断如果字符串为空,则被一个replace的值代替,否则用一个process处理后的值代替
     * 
     * @param txt
     * @param replace
     * @param process
     * @return
     */
    public static String nvl(String txt, String replace, String process) {
        if (isEmpty(txt)) {
            return replace;
        }

        return process;
    }

    /**
     * 判断一个字符串数组中是否含有某个值
     * 
     * @param arr
     * @param val
     * @return
     */
    public static boolean strInArray(String[] arr, String val) {
        if (arr == null || arr.length < 1) {
            return (false);
        }

        for (String s : arr) {
            if (s.equals(val)) {
                return (true);
            }
        }

        return (false);
    }

    /**
     * 判断一个字符串是否符合正则表达式<br>
     * 
     * @param regex
     * @param input
     * @return
     */
    public static boolean isRegex(String regex, String input) {
        if (StringUtils.isEmpty(input)) {
            return (false);
        }
        return Pattern.matches(regex, input);
    }

    /**
     * 判断一个字符串是否包含一个字符串<br>
     * 
     * @param str
     * @param chr
     * @return
     */
    public static boolean strContain(String str, String chr) {
        int idx = str.indexOf(chr);
        return (idx > 0);
    }

    /**
     * 
     * @param s
     * @return
     */
    public static String toUTF8String(String s) {
        StringBuffer sb = new StringBuffer();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c >= 0 && c <= 255) {
                sb.append(c);
            } else {
                byte[] b;
                try {
                    b = Character.toString(c).getBytes("utf-8");
                }
                catch (Exception ex) {
                    b = new byte[0];
                }
                for (int j = 0; j < b.length; j++) {
                    int k = b[j];
                    if (k < 0)
                        k += 256;
                    sb.append("%" + Integer.toHexString(k).toUpperCase());
                }
            }
        }
        return sb.toString();
    }

    /**
     * 将字符串解译成一般的文本
     * 
     * @param msg
     * @return
     */
    public static String decode(String msg) {
        try {
            return URLDecoder.decode(msg, "utf-8");
        }
        catch (Exception e) {
            return msg;
        }
    }

    /**
     * 清除所有的空格
     * 
     * @param str
     * @param pattern
     * @return
     */
    public static String trimBlank(String str, String pattern) {
        // 清除所有空格
        final String regex = "\\s*|\t|\r|\n";
        String dest = "";
        if (str != null) {
            Pattern p = Pattern.compile(pattern == null ? regex : pattern);
            Matcher m = p.matcher(str);
            dest = m.replaceAll("");
        }

        return dest;
    }

    /**
     * 分割字符串
     * 
     * @param str
     * @param regex
     * @param limit
     * @return
     */
    public static String[] split(String str, String regex, int limit) {
        if (str == null) {
            return (null);
        }

        return str.split(regex, limit);
    }

    /**
     * 分割字符串,limit为-1
     * 
     * @param str
     * @param regex
     * @return
     */
    public static String[] split(String str, String regex) {
        return split(str, regex, -1);
    }

    /**
     * 分割字符串,limit为-1
     * 
     * @param str
     * @param regex
     * @return
     */
    public static List<String> splitToList(String str, String regex) {
        String[] strArr = split(str, regex, -1);

        List<String> list = null;
        // 如果截取的结果为空,则返回空
        if (strArr == null) {
            return list;
        }

        list = new ArrayList<String>();
        for (String item : strArr) {
            list.add(item);
        }

        return list;
    }

    /**
     * 过滤特殊字符  
     * 
     * @param str
     * @return
     */
    public static String trimSpecial(String str) {
        return trimBlank(str, "[\\pP|~|$|^|<|>|\\||\\+|=]*");
    }
}
