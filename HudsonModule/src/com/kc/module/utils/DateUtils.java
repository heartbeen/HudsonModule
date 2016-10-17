package com.kc.module.utils;

import java.sql.Timestamp;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;

/**
 * 本类为处理日期格式的类 在Calendar类中相关 的静态字段分别对应不同的日期段 MONTH 0x2(2) | DAY_OF_WEEK 0x7(7)
 * DAY_OF_YEAR 0x6(6) HOUR_OF_DAY 0xb(11) DAY_OF_MONTH 0x5(5) YEAR 0x1(1)
 * WEEK_OF_MONTH 0x4(4) WEEK_OF_YEAR 0x3(3) MINITE 0xc(12) SECOND 0xd(13)
 * MILLISECOND 0xe(14)
 * 
 * @author Administrator
 * 
 */
public class DateUtils {

    public final static String DEFAULT_DATE_FORMAT = "yyyy-MM-dd HH:mm:ss";

    public final static String YEAR_AND_MONTH = "yyyy-MM";

    public final static String DEFAULT_DATE_FORMAT_MI = "yyyy-MM-dd HH:mm";
    // 默认的日期格式
    public final static String DEFAULT_SHORT_DATE = "yyyy-MM-dd";

    public final static String MINI_DATE_SEPARATOR_NONE = "yyMMdd";

    public final static long HOUR_TIME_MILLIS = 3600000;

    public final static long DAY_TIME_MILLIS = 24 * HOUR_TIME_MILLIS;

    /**
     * 字符串转换成Date 类型
     * 
     * @param str
     * @param formatStr
     * @return
     */
    public static Date strToDate(String str, String formatStr) {
        Date date = null;
        SimpleDateFormat format = new SimpleDateFormat(StringUtils.isEmpty(formatStr) ? DEFAULT_DATE_FORMAT : formatStr);
        try {
            date = format.parse(str);
        }
        catch (Exception e) {}
        return date;
    }

    /**
     * 日期转换成时间字符串
     * 
     * @param date
     * @param formatStr
     * @return
     */
    public static String dateToStr(Date date, String formatStr) {
        String str = "";
        SimpleDateFormat format = null;
        if (formatStr == null || formatStr.equals("")) {
            format = new SimpleDateFormat(DEFAULT_DATE_FORMAT);
        } else {
            format = new SimpleDateFormat(formatStr);
        }
        try {
            str = format.format(date);
        }
        catch (Exception e) {}
        return str;
    }

    /**
     * 是否在今天之�?
     * 
     * @param dateStr
     * @return
     */
    public static Boolean isDateAfter(String dateStr) {
        try {
            Date date = strToDate(dateStr, "yyyy-MM-dd");
            Date nowDate = new Date();
            return nowDate.after(date);
        }
        catch (Exception e) {
            return false;
        }
    }

    /**
     * 判断是否当天
     * 
     * @param dateStr
     * @return
     */
    public static Boolean isDateNow(Date dateStr) {
        try {
            String currentTime = new SimpleDateFormat("yyyy-MM-dd").format(new Date());
            String postTime = new SimpleDateFormat("yyyy-MM-dd").format(dateStr);
            if (currentTime.equals(postTime)) {
                return true;
            } else {
                return false;
            }
        }
        catch (Exception e) {
            return false;
        }
    }

    // 日期加上天数
    public static Date addDate(Date s, int days, String formatStr) {
        GregorianCalendar cal = new GregorianCalendar();
        cal.setTime(s);
        cal.add(Calendar.DATE, days);
        Date d = cal.getTime();
        DateFormat df = DateFormat.getDateInstance();
        String a = df.format(d);
        return DateUtils.strToDate(a, formatStr);
    }

    // 日期加上天数
    public static String addDateToStr(Date s, int days, String formatStr) {
        GregorianCalendar cal = new GregorianCalendar();
        cal.setTime(s);
        cal.add(Calendar.DATE, days);
        return DateUtils.dateToStr(cal.getTime(), formatStr);
    }

    // 日期加上天数
    public static Date addDate(Date s, int days) {
        GregorianCalendar cal = new GregorianCalendar();
        cal.setTime(s);
        cal.add(Calendar.DATE, days);

        return cal.getTime();
    }

    /**
     * 得到日期在本年的第几周
     * 
     * @param date
     * @return
     */
    public static int getWeekOfYear(Date date) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        return cal.get(Calendar.WEEK_OF_YEAR);
    }

    /**
     * 得到日期的星期
     * 
     * @param date
     * @return
     */
    public static int getDayOfWeek(Date date) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        return cal.get(Calendar.DAY_OF_WEEK);
    }

    /**
     * 
     * 
     * @return
     */
    public static Date getMonthFirstDay() {
        return DateUtils.strToDate(Calendar.YEAR + "-" + Calendar.MONTH + "-01 00:00:00", DEFAULT_DATE_FORMAT);
    }

    /**
     * 
     * 
     * @return
     */
    public static Date getMonthLastDay() {
        Calendar calendar = Calendar.getInstance();
        calendar.set(Calendar.DAY_OF_MONTH, calendar.getActualMaximum(Calendar.DAY_OF_MONTH));
        return calendar.getTime();
    }

    /**
     * 對比兩個時間的大小
     * 
     * @param ori
     *            原始時間
     * @param compared
     *            對比時間
     * @return
     * @throws ParseException
     */
    public static boolean dateCompare(String ori, String compared, String format) {
        SimpleDateFormat a = new SimpleDateFormat(format);
        try {

            Date b = a.parse(ori);
            Date c = a.parse(compared);

            if (b.compareTo(c) <= 0) {
                return (true);
            } else {
                return (false);
            }

        }
        catch (ParseException e) {
            return (false);
        }
    }

    public static int getDate(Date date) {
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(date);
        return calendar.get(Calendar.DATE);
    }

    /**
     * 
     * @param ori
     * @param compared
     * @param format
     * @return 1 a小于等于b,0 a大于b -1 日期错误
     */
    public static int dateComparing(String ori, String compared, String format) {
        SimpleDateFormat a = new SimpleDateFormat(format);
        try {

            Date b = a.parse(ori);
            Date c = a.parse(compared);

            if (b.compareTo(c) <= 0) {
                return 1;
            } else {
                return 0;
            }

        }
        catch (ParseException e) {
            return -1;
        }
    }

    public static boolean dateCompared(String ori, String compared, String format) {
        SimpleDateFormat a = new SimpleDateFormat(format);
        try {

            Date b = a.parse(ori);
            Date c = a.parse(compared);

            if (b.compareTo(c) >= 0) {
                return (true);
            } else {
                return (false);
            }

        }
        catch (ParseException e) {
            return (false);
        }
    }

    /**
     * 對比兩個時間的大小
     * 
     * @param ori
     *            原始時間
     * @param compared
     *            對比時間
     * @return
     */
    public static int dateCompare(Date ori, Date compared) {
        return ori.compareTo(compared);
    }

    /**
     * 格式化時間
     * 
     * @param date
     *            要格式化的時間
     * @param format
     *            格式
     * @return
     * @throws ParseException
     */
    public static String translate(String date, String format, String translate) {

        SimpleDateFormat a = new SimpleDateFormat(format);
        SimpleDateFormat c = new SimpleDateFormat(translate);
        try {
            Date b = a.parse(date);
            return c.format(b);

        }
        catch (ParseException e) {
            return "";
        }

    }

    /**
     * 獲取兩個時間是否在指定的時間段內
     * 
     * @param date1
     *            時間1
     * @param date2
     *            時間2
     * @param field
     *            間隔時間單位(如年，月，日等)
     * @param space
     *            間隔時間單位量(如一個月，3天等)
     * @return 時間1小於等於時間2，返回true，否則返回false
     * @throws ParseException
     */
    public static boolean setSpace(String date1, String date2, String format, int field, int space) {
        SimpleDateFormat sdf = new SimpleDateFormat(format);
        try {
            Date dateOri = sdf.parse(date1);
            Date dateCpd = sdf.parse(date2);

            Calendar calOri = Calendar.getInstance();
            calOri.setTime(dateOri);
            calOri.add(field, space);

            Calendar calCpd = Calendar.getInstance();
            calCpd.setTime(dateCpd);

            if (calOri.compareTo(calCpd) < 0) {
                return (false);
            } else {
                return (true);
            }

        }
        catch (ParseException e) {
            return (false);
        }
    }

    /**
     * 获取两个时间的差值(秒)
     * 
     * @param date1
     *            時間1
     * @param date2
     *            時間2
     * @param field
     *            間隔時間單位(如年，月，日等)
     * @param space
     *            間隔時間單位量(如一個月，3天等)
     * @return 時間1小於等於時間2，返回true，否則返回false
     * @throws ParseException
     */
    public static long getTimeFieldValue(String date1, String date2, String format) {
        SimpleDateFormat sdf = new SimpleDateFormat(format);
        try {
            Date dateOri = sdf.parse(date1);
            Date dateCpd = sdf.parse(date2);

            Calendar calOri = Calendar.getInstance();
            calOri.setTime(dateOri);

            long oriSec = calOri.getTimeInMillis() / 1000;

            Calendar calCpd = Calendar.getInstance();
            calCpd.setTime(dateCpd);

            long lastSec = calCpd.getTimeInMillis() / 1000;
            return lastSec - oriSec;

        }
        catch (ParseException e) {
            return 0;
        }
    }

    /***************************************************************************
     * 2013-10-24 新增时间控制方法 Authority:XZF
     * *************************************************************************
     * 获取当前时间串
     * 
     * @param format
     * @return
     */
    public static String getDateNow(String format) {
        SimpleDateFormat sdf = new SimpleDateFormat(format);
        return sdf.format(new Date());
    }

    /**
     * 验证时间是否为某种格式
     * 
     * @return 1 正確格式,-1错误
     */
    public static Boolean validateStyle(String dateStr, String style) {
        try {
            SimpleDateFormat sdf = new SimpleDateFormat(style);
            sdf.parse(dateStr);
            return (true);
        }
        catch (Exception e) {
            return (false);
        }
    }

    /**
     * 获取时间段指定日期前或后的日期
     * 
     * @param date
     *            日期
     * @param format
     *            轉換前的日期格式
     * @param trans
     *            轉換后的日期格式
     * @param field
     *            日期位置
     * @param fuc
     *            日期位置偏移
     * @return
     */
    public static String getNextField(String date, String format, String trans, int field, int fuc) {
        SimpleDateFormat sdf = new SimpleDateFormat(format);
        SimpleDateFormat tsf = new SimpleDateFormat(trans);
        Date dt_now = null;
        try {
            dt_now = (Date) sdf.parse(date);
        }
        catch (Exception e) {
            return null;
        }

        Calendar cl = Calendar.getInstance();
        cl.setTime(dt_now);
        cl.add(field, fuc);
        return tsf.format(cl.getTime());
    }

    /**
     * get before or after fields days
     * 
     * @param trans
     *            format will be transfered
     * @param field
     *            field which will be got
     * @param fuc
     *            field length
     * @return
     */
    public static String getNextFiledOfToday(String trans, int field, int fuc) {
        SimpleDateFormat tsf = new SimpleDateFormat(trans);
        Calendar cl = Calendar.getInstance();
        cl.setTime(new Date());
        cl.add(field, fuc);
        return tsf.format(cl.getTime());
    }

    /**
     * 但当前月份的最大天数
     * 
     * @param date
     * @return
     */
    public static int getMaxDayOfMonth(Date date) {
        Calendar cl = Calendar.getInstance();
        cl.setTime(date);
        return cl.getActualMaximum(Calendar.DAY_OF_MONTH);
    }

    /**
     * 获取该月最大的一天
     * 
     * @param date
     * @return
     */
    public static String getLastOfMonth(String date, String format) {
        SimpleDateFormat sdf = new SimpleDateFormat(format);
        Date dt_now = null;
        try {
            dt_now = (Date) sdf.parse(date);
        }
        catch (Exception e) {
            return null;
        }

        Calendar cl = Calendar.getInstance();
        cl.setTime(dt_now);
        // 获取月度最大值
        int max = cl.getActualMaximum(Calendar.DAY_OF_MONTH);
        // 将日期设置为最大值
        cl.set(Calendar.DAY_OF_MONTH, max);
        return sdf.format(cl.getTime());
    }

    /**
     * 获得该月最小一天
     * 
     * @param date
     * @return
     */
    public static String getFristOfMonth(String date, String format) {
        SimpleDateFormat sdf = new SimpleDateFormat(format);
        Calendar cl = Calendar.getInstance();
        // 解析Calendar
        Date dateVal = null;
        try {
            dateVal = sdf.parse(date);
        }
        catch (ParseException e) {
            return (null);
        }

        // 将日期写入Calendar
        cl.setTime(dateVal);
        int min = cl.getActualMinimum(Calendar.DAY_OF_MONTH);
        cl.set(Calendar.DAY_OF_MONTH, min);

        return sdf.format(cl.getTime());
    }

    /**
     * 獲取日期在不同日期段下的位置例如年度第幾天,月度第幾周等
     * 
     * @param date
     * @param field
     * @param dateFormat
     * @return
     */
    public static int getDateField(String date, int field, String dateFormat) {
        SimpleDateFormat sdf = new SimpleDateFormat(dateFormat);
        Calendar cal = Calendar.getInstance();
        try {
            Date time = sdf.parse(date);
            cal.setTime(time);
            return cal.get(field);
        }
        catch (Exception e) {
            return -1;
        }
    }

    /**
     * 获取日期在一周中的位置 默认的星期天为第一天(1-7)
     * 
     * @param str
     * @return
     */
    public static int getWeekPos(String str, String format) {
        try {
            Calendar cl = Calendar.getInstance();
            SimpleDateFormat sdf = new SimpleDateFormat(format);
            Date par = sdf.parse(str);
            cl.setTime(par);
            return cl.get(Calendar.DAY_OF_WEEK);
        }
        catch (Exception e) {
            return -1;
        }
    }

    /**
     * 获取当前是一周中的第几天
     * 
     * @return
     */
    public static int getWeekNow() {
        try {
            Calendar cl = Calendar.getInstance();
            cl.setTime(new Date());
            return cl.get(Calendar.DAY_OF_WEEK);
        }
        catch (Exception e) {
            return -1;
        }
    }

    public static long getDateMillionSeconds(String date, String format) {
        try {
            SimpleDateFormat sdf = new SimpleDateFormat(format);
            return sdf.parse(date).getTime();

        }
        catch (Exception e) {
            return -1;
        }
    }

    /**
     * 得到指定月份的开始与结束日期
     * 
     * @param year
     * @param month
     * @return
     */
    public static Date[] getMonthSpan(int year, int month) {
        Date[] span = new Date[2];
        Calendar cl = Calendar.getInstance();
        cl.set(year, month - 1);
        span[0] = cl.getTime();

        cl.set(Calendar.DATE, cl.getActualMaximum(Calendar.DAY_OF_MONTH));
        span[1] = cl.getTime();
        return span;
    }

    /**
     * 将java日期格式转换为数据库的格式日期
     * 
     * @param date
     * @return
     */
    public static Timestamp parseTimeStamp(String date) {
        try {
            return Timestamp.valueOf(date);
        }
        catch (Exception e) {
            return (null);
        }
    }

    /**
     * 将ORACLE数据库的的时间格式转换为指定格式的字符串
     * 
     * @param time
     * @param format
     * @return
     */
    public static String getTimeStampString(Timestamp time, String format) {
        // 如果时间为空,则直接返回null
        if (time == null) {
            return (null);
        }

        // 如果format被设置为空,则表示使用默认的时间格式
        if (format == null) {
            format = DEFAULT_DATE_FORMAT;
        }

        // 将数据库时间转化为制定格式的字符串
        try {
            SimpleDateFormat sdf = new SimpleDateFormat(format);
            Date dt = new Date(time.getTime());
            return sdf.format(dt);
        }
        catch (Exception e) {
            return (null);
        }
    }

    /**
     * 获取当前的时间字符串<br>
     * 格式为默认格式
     * 
     * @return
     */
    public static String getDateNow() {
        return getDateNow(DEFAULT_DATE_FORMAT);
    }

    /**
     * 获取两个时间在某个时间间隔(internal)的范围内的返回值<br>
     * 如时间1和时间2的间隔小时数为3.1小时<br>
     * start 开始时间 end 结束时间 inter 时间间隔 dic 返回精度<br>
     * internal仅支持天,时,分,秒<br>
     * internal对应的inter参数值为天5,时10,分12,秒13
     * 
     * @param start
     * @param end
     * @param inter
     * @param dic
     * @return
     */
    public static double getDateTimeFieldInternal(String start, String end, int inter, int dic) {
        return getDateTimeFieldInternal(start, end, null, inter, dic);
    }

    /**
     * 获取两个时间在某个时间间隔(internal)的范围内的返回值<br>
     * 如时间1和时间2的间隔小时数为3.1小时<br>
     * start 开始时间 end 结束时间 inter 时间间隔 dic 返回精度<br>
     * internal仅支持天,时,分,秒<br>
     * internal对应的inter参数值为天5,时10,分12,秒13
     * 
     * @param start
     * @param end
     * @param inter
     * @param dic
     * @return
     */
    public static double getDateTimeFieldInternal(String start, String end, String format, int inter, int dic) {
        try {
            if (format == null) {
                format = DEFAULT_DATE_FORMAT;
            }
            // 将字符串转化为日期
            Date startDate = strToDate(start, format);
            Date endDate = strToDate(end, format);
            // 获取两个日期的毫秒差
            double dateMills = endDate.getTime() - startDate.getTime();
            // 声明返回的结果暂存
            double result = 0d;

            switch (inter) {
            case Calendar.DATE:
                result = (dateMills / 1000 / 3600 / 24);
                break;
            case Calendar.HOUR:
                result = (dateMills / 1000 / 3600);
                break;
            case Calendar.MINUTE:
                result = (dateMills / 1000 / 60);
                break;
            case Calendar.SECOND:
                result = (dateMills / 1000);
                break;
            default:
                break;
            }

            return ArithUtils.round(result, dic);
        }
        catch (Exception e) {
            return 0;
        }
    }

    /**
     * 计算两日期的相隔天数
     * 
     * @param s
     *            开始时间
     * @param e
     *            结束时间
     * @return
     */
    public static int dateIntervalDay(Date s, Date e) {
        return (int) ((e.getTime() - s.getTime()) / DAY_TIME_MILLIS);
    }

    /**
     * 获取当前的时间精确到秒
     * 
     * @return
     */
    public static Timestamp getNowStampTime() {
        return Timestamp.valueOf(getDateNow());
    }

    /**
     * 将JAVA形式的日期格式转化为ORACLE数据库格式
     * 
     * @param date
     * @return
     */
    public static Timestamp parseTimeStamp(Date date) {
        if (date == null) {
            return (null);
        }

        return Timestamp.valueOf(dateToStr(date, DEFAULT_DATE_FORMAT));
    }

    /**
     * 获取上一周的周日
     * 
     * @return
     */
    public static String getSundayOfLastWeek(String format) {
        // 获取当天所在本周的位置
        int index = getWeekNow();
        int dis = (index == 1 ? -7 : 1 - index);

        return getNextFiledOfToday("yyyy-MM-dd", 5, dis);
    }

    /**
     * 获取上一周的周一
     * 
     * @return
     */
    public static String getMondayOfLastWeek(String format) {
        int index = getWeekNow();
        int dis = (index == 1 ? -7 : 1 - index) - 6;

        return getNextFiledOfToday(format == null ? "yyyy-MM-dd" : format, 5, dis);
    }

    /**
     * 获取上个月的最后一天
     * 
     * @param format
     * @return
     */
    public static String getLastMonthEndDate(String format) {
        Calendar cla = getSpecificFieldCalendar(Calendar.MONTH, -1);
        // 获取当日位置
        final int filed = Calendar.DAY_OF_MONTH;
        int index = cla.get(filed);
        int max = cla.getActualMaximum(filed);

        cla.add(filed, max - index);

        return dateToStr(cla.getTime(), format == null ? DEFAULT_DATE_FORMAT : format);
    }

    /**
     * 获取上个月的第一天
     * 
     * @return
     */
    public static String getLastMonthStartDate(String format) {
        Calendar cla = getSpecificFieldCalendar(Calendar.MONTH, -1);
        // 获取当日位置
        final int filed = Calendar.DAY_OF_MONTH;
        int index = cla.get(filed);
        int min = cla.getActualMinimum(filed);

        cla.add(filed, min - index);

        return dateToStr(cla.getTime(), format == null ? DEFAULT_DATE_FORMAT : format);
    }

    /**
     * 获取日期的制定时间段的时间
     * 
     * @param filed
     * @param dis
     * @return
     */
    public static Calendar getSpecificFieldCalendar(int filed, int dis) {
        Calendar cla = Calendar.getInstance();
        cla.add(Calendar.MONTH, -1);
        return cla;
    }

    /**
     * 获取某个日期所在周的任意一天
     * 
     * @param day
     * @param format
     * @param pos
     * @return
     */
    public static String getSepcificWeekDayBySomeDay(String day, String format, int pos) {
        format = (format == null ? DEFAULT_SHORT_DATE : format);
        int weekpos = getWeekPos(day, format);

        int dis = (pos == 1 ? (weekpos == 1 ? 0 : (7 + pos) - weekpos) : (weekpos == 1 ? (7 - (weekpos + pos)) : (pos - weekpos)));

        return getNextField(day, format, format, Calendar.DAY_OF_WEEK, dis);
    }

    /**
     * 判断一个时间字符串是否指定格式的时间
     * 
     * @param date
     *            时间字符串
     * @param format
     *            日期格式遵循Java日期格式
     * @return
     */
    public static boolean isDate(String date, String format) {
        Date transDate = DateUtils.strToDate(date, format);
        return (transDate != null);
    }
}
