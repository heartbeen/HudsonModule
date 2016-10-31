package com.kc.module.utils;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;

import org.apache.log4j.Logger;
import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFPrintSetup;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.hssf.util.Region;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jfinal.kit.JsonKit;
import com.jfinal.kit.StrKit;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.databean.PaginationBean;
import com.kc.module.model.ModelFinal;
import com.kc.module.model.ModulePart;
import com.kc.module.model.form.ActualFlowForm;
import com.kc.module.model.form.DefaultScheduleSettings;
import com.kc.module.model.form.DropOut;
import com.spreada.utils.chinese.ZHConverter;

/**
 * 数据处理类
 * 
 * @author 徐维
 * 
 */
public class DataUtils {

    private static Logger logger = Logger.getLogger(DataUtils.class);

    /**
     * 多条记录的分割标记
     */
    private static String RECORD_SPLIT_MARK = "##";

    /**
     * javabean字段名与值的分割标记
     */
    private static String VALUE_SPLIT_MARK = "::";

    /**
     * 字段间的分隔标记
     */
    private static String FIELD_SPLIT_MARK = ",";

    /**
     * 通过中文语言的地区对字符进行简繁体转换
     * 
     * @param local
     *            中文地区
     * @param data
     *            要转换的数据
     * @return
     */
    public static String convertLocal(String data, String local) {

        if (local == null)
            return data;

        return local.equals("CN") ? simplified(data) : traditional(data);

    }

    /**
     * 转换成繁体
     * 
     * @param data
     *            要转换的数据
     * @return
     */
    public static String traditional(String data) {
        return ZHConverter.convert(data, ZHConverter.TRADITIONAL);

    }

    /**
     * 转换成简体
     * 
     * @param data
     * @return
     */
    public static String simplified(String data) {
        return ZHConverter.convert(data, ZHConverter.SIMPLIFIED);

    }

    /**
     * <h2>用于对浏览器发送过来的数据进行处理,生成相应的javabean集合</h2><br>
     * 注意发送过来的数据格式要满足如下原则:
     * <code style='margin-left:30px;'>field1:value1,field2:value2<i style='color:red;'>##</i>field1:value3,field2:value4 ...</code>
     * <br>
     * 其中'##'用于分割多个javabean数据
     * 
     * @param clazz
     *            javabean class
     * @param requestText
     *            数据
     * @return
     */
    public static <E> List<E> convertRequestToList(Class<E> clazz, String requestText) {
        List<E> dataList = new ArrayList<E>();

        String[] requestArray = requestText.split(RECORD_SPLIT_MARK);

        try {
            for (String b : requestArray) {
                dataList.add(convertRequestToBean(clazz, b));
            }
        }
        catch (Exception e) {
            e.printStackTrace();
        }

        return dataList;
    }

    /**
     * 用于将浏览器发送过来的数据生成单个javabean对象
     * 
     * @param clazz
     *            javabean class
     * @param beanstr
     *            格式化数据
     * @return javabean对象
     */
    public static <E> E convertRequestToBean(Class<E> clazz, String beanstr) {
        E dataObj = null;

        if (beanstr == null || beanstr.equals(""))
            return dataObj;

        Method method;
        String[] fields;

        String[] beans = beanstr.split(FIELD_SPLIT_MARK);

        Class<?> dataType;

        try {
            dataObj = clazz.newInstance();

            for (String field : beans) {
                fields = field.split(VALUE_SPLIT_MARK);

                // 通过得到getter方法,再得到返回值的类型,然后通过返回值的类型对设置值的类型进行转换
                method = clazz.getMethod("get" + StringUtils.initialUpperCase(fields[0]));
                dataType = method.getReturnType();

                method = clazz.getMethod("set" + StringUtils.initialUpperCase(fields[0]), dataType);

                if (fields.length != 1) {

                    if (dataType == String.class) {
                        method.invoke(dataObj, fields[1]);
                    }

                    if (dataType == Integer.class) {
                        method.invoke(dataObj, Integer.valueOf(fields[1]));
                    }

                    if (dataType == Float.class) {
                        method.invoke(dataObj, Float.valueOf(fields[1]));
                    }

                    if (dataType == Double.class) {
                        method.invoke(dataObj, Double.valueOf(fields[1]));
                    }

                    if (dataType == Date.class) {
                        method.invoke(dataObj, Integer.valueOf(fields[1]));
                    }
                }
            }
        }
        catch (Exception e) {
            logger.error("字段无法对应！", e);
        }

        return dataObj;

    }

    // /**
    // * 得到数据库属性文件
    // *
    // * @return
    // */
    // public static Properties getProperties(String filename) {
    // Properties properties = new Properties();
    //
    // String path =
    // DataUtils.class.getClassLoader().getResource("oracle.properties").getPath().replace("%20",
    // " ");
    //
    // try {
    // properties.load(new FileInputStream(new File(path)));
    // }
    // catch (Exception e) {
    // properties = null;
    // }
    //
    // return properties;
    // }

    /**
     * 对记录进行分类
     * 
     * @param list
     * @param key
     * @return
     */
    public static <E extends ModelFinal<E>> Map<String, List<E>> moduleClassific(List<E> list, String key) {
        Map<String, List<E>> map = new LinkedHashMap<String, List<E>>();
        List<E> vList;

        for (E r : list) {
            vList = map.get(r.getStr(key));

            vList = vList == null ? new ArrayList<E>() : vList;

            vList.add(r);

            map.put(r.getStr(key), vList);
        }

        return map;
    }

    /**
     * 对记录进行分类
     * 
     * @param list
     * @param key
     * @return
     */
    public static <E extends Record> Map<String, List<E>> recordClassific(List<E> list, String key) {

        Map<String, List<E>> map = new LinkedHashMap<String, List<E>>();
        List<E> vList;

        for (E r : list) {
            vList = map.get(r.getStr(key));

            vList = vList == null ? new ArrayList<E>() : vList;

            vList.add(r);

            map.put(r.getStr(key), vList);
        }

        return map;
    }

    public static Map<String, List<ActualFlowForm>> recordActualRank(List<Record> list) {
        Map<String, List<ActualFlowForm>> map = new LinkedHashMap<String, List<ActualFlowForm>>();

        List<ActualFlowForm> record = null;
        String tpartbar = "", tdepartname = "", tstateid = "", tcraftid = "", tdeptname = "";
        ActualFlowForm aff = null;
        boolean start = false;

        for (Record r : list) {
            String apartbar = StringUtils.parseString(r.getStr("PARTBARLISTCODE"));
            String adepartname = StringUtils.parseString(r.getStr("DEPARTNAME"));
            String astateid = StringUtils.parseString(r.getStr("PARTSTATEID"));
            String acraftid = StringUtils.parseString(r.getStr("LPROCRAFTID"));
            String acraftcode = StringUtils.parseString(r.getStr("CRAFTCODE"));
            String outcraftid = StringUtils.parseString(r.getStr("OUTCRAFTID"));
            String outcraftcode = StringUtils.parseString(r.getStr("OUTCRAFTCODE"));
            String outfactoryid = StringUtils.parseString(r.getStr("OUTFACTORYID"));
            String outguestname = StringUtils.parseString(r.getStr("OUTGUESTNAME"));
            // 用于保存真实的工件当前位置
            String region = adepartname;
            // String out
            tdeptname = StringUtils.isEmpty(adepartname) ? "外发回厂" : adepartname;
            boolean isIn = StringUtils.isEmpty(outcraftid);

            acraftid = isIn ? acraftid : outcraftid;
            String mcraftid = isIn ? acraftid : ConstUtils.SCH_OUT_FLAG + outcraftid;

            acraftcode = isIn ? acraftcode : outguestname + (StringUtils.isEmpty(outcraftcode) ? "" : "[" + outcraftcode + "]");
            adepartname = isIn ? adepartname : outguestname + (StringUtils.isEmpty(outcraftcode) ? "" : "[" + outcraftcode + "]");

            if (!start) {
                tpartbar = apartbar;
                tdepartname = adepartname;
                tstateid = astateid;

                tcraftid = acraftid;

                record = new ArrayList<ActualFlowForm>();

                aff = new ActualFlowForm();

                aff.setDepartname(tdepartname);
                aff.setPartbarlistcode(tpartbar);
                aff.setPartstateid(tstateid);

                aff.setLdeptid(isIn ? r.getStr("LDEPTID") : outfactoryid);
                aff.setLpartstateid(r.getStr("LPARTSTATEID"));
                aff.setNrcdtime(r.getTimestamp("NRCDTIME"));
                aff.setIsout(!isIn);

                aff.setNcraft(acraftcode);
                aff.setLprocraftid(acraftid);

                aff.setRegion(region);

                start = true;

            } else {
                // 如果工件的ID发生了变化
                if (!tpartbar.equals(apartbar)) {

                    // 如果工件是未签收或者签收状态
                    if ((tstateid.equals("20208") || tstateid.equals("20205"))
                        && aff.getLpartstateid() != null
                        && !tstateid.equals(aff.getLpartstateid())) {

                        record.add(aff);

                        String tempDeptName = (tstateid.equals("20205") ? tdeptname : aff.getRegion());

                        aff = new ActualFlowForm();

                        aff.setPartbarlistcode(tpartbar);
                        aff.setPartstateid(tstateid);

                        // 此处的部门讯息有本来要设置为上一个零件的部门的，三十
                        // aff.setDepartname(tdeptname);
                        aff.setDepartname(tempDeptName);
                        aff.setFlag(true);

                        record.add(aff);
                    } else {
                        aff.setFlag(true);
                        record.add(aff);
                    }

                    map.put(tpartbar, record);

                    tpartbar = apartbar;
                    tdepartname = adepartname;
                    tstateid = astateid;

                    tcraftid = acraftid;

                    record = new ArrayList<ActualFlowForm>();

                    aff = new ActualFlowForm();

                    aff.setDepartname(tdepartname);
                    aff.setPartbarlistcode(tpartbar);
                    aff.setPartstateid(tstateid);

                    aff.setLdeptid(isIn ? r.getStr("LDEPTID") : outfactoryid);
                    aff.setLpartstateid(r.getStr("LPARTSTATEID"));
                    aff.setNrcdtime(r.getTimestamp("NRCDTIME"));
                    aff.setIsout(!isIn);

                    aff.setNcraft(acraftcode);
                    aff.setLprocraftid(acraftid);
                    aff.setRegion(region);

                } else {
                    if (tcraftid.equals(mcraftid)) {
                        aff.setNrcdtime(r.getTimestamp("NRCDTIME"));
                    } else {
                        record.add(aff);

                        aff = new ActualFlowForm();

                        tdepartname = adepartname;

                        aff.setDepartname(tdepartname);
                        aff.setPartbarlistcode(tpartbar);
                        aff.setPartstateid(tstateid);

                        aff.setLdeptid(isIn ? r.getStr("LDEPTID") : outfactoryid);
                        aff.setLpartstateid(r.getStr("LPARTSTATEID"));
                        aff.setNrcdtime(r.getTimestamp("NRCDTIME"));
                        aff.setIsout(!isIn);

                        aff.setNcraft(acraftcode);
                        aff.setLprocraftid(acraftid);
                        aff.setRegion(region);

                        tcraftid = mcraftid;
                    }
                }
            }
        }

        if ((tstateid.equals("20208") || tstateid.equals("20205"))
            && aff.getLpartstateid() != null
            && (!StringUtils.isEmpty(aff.getLpartstateid()) && !tstateid.equals(aff.getLpartstateid()))) {

            record.add(aff);

            String tempDeptName = (tstateid.equals("20205") ? tdeptname : aff.getRegion());

            aff = new ActualFlowForm();

            aff.setPartbarlistcode(tpartbar);
            aff.setPartstateid(tstateid);
            aff.setDepartname(tempDeptName);
            aff.setFlag(true);

            record.add(aff);
        } else {
            if (aff != null) {
                aff.setFlag(true);
                record.add(aff);
            }
        }

        map.put(tpartbar, record);

        return map;
    }

    /**
     * 对模具加工记录进行分类
     * 
     * @param list
     * @return
     */
    public static Map<String, List<Record>> recordActualClassific(List<Record> list) {
        Map<String, List<Record>> map = new LinkedHashMap<String, List<Record>>();

        Record up = null;
        Record current = null;

        Object upCraftid, currentCraftid;

        for (int i = 0; i < list.size(); i++) {
            if (up == null) {
                up = list.get(i);

                // 表示工件没有被另何单位签收,或者只有一条记录时
                if (up.get("LDEPTID") == null || list.size() == 1) {
                    createNewRecrodList(map, up, true);
                    up = null;
                }

                continue;
            }

            current = list.get(i);

            if (current.get("LDEPTID") == null) {
                // 表示工件下一条记录没有被另何单位签收
                addActualRecord(map, up, true);
                createNewRecrodList(map, current, true);
                up = null;
                continue;
            }

            // 表示工件为完工,当前记录就不需要了
            if ("20209".equals(current.get("LPARTSTATEID"))) {
                // current = null;
                continue;
            }

            if (current.get("PARTBARLISTCODE").equals(up.get("PARTBARLISTCODE"))) {
                // 如果同一工件的实际加工记录时

                if (current.get("LDEPTID").equals(up.get("LDEPTID"))) {
                    // 表示工件在同一单位
                    // 工件为同一单位并且为同一工艺时,表示current为最新记录
                    upCraftid = up.get("lprocraftid");
                    currentCraftid = current.get("lprocraftid");

                    if (upCraftid != null && currentCraftid != null && !currentCraftid.equals(upCraftid)) {
                        addActualRecord(map, up, false);
                    }

                    up = current;

                } else {
                    // 同时为空表示为两条记录都为签收,或者前一个排程为签收动作
                    if (up.get("lprocraftid") == null && current.get("lprocraftid") == null || "20208".equals(up.get("lpartstateid"))) {
                        up = current;
                        continue;
                    }

                    addActualRecord(map, up, false);
                    up = current;
                }
            } else {

                // 不为同一工件,将加工记录增加了集合中
                addActualRecord(map, up, true);
                up = current;
            }

        }

        if (current != null) {
            // 有示当前记录为最后一条
            addActualRecord(map, current, true);
        }

        return map;
    }

    /**
     * 将归类好的记录加到map中
     * 
     * @param map
     * @param record
     * @param flag
     *            此条记录是否为工件加工記錄的最后一条
     */
    private static void addActualRecord(Map<String, List<Record>> map, Record record, boolean flag) {
        List<Record> actualList = map.get(record.getStr("PARTBARLISTCODE"));

        if (actualList == null) {
            createNewRecrodList(map, record, flag);
        } else {
            record.set("flag", flag);
            actualList.add(record);
        }
    }

    /**
     * 建立新的实际排程集合
     * 
     * @param map
     * @param record
     * @param flag
     *            此条记录是否为工件加工記錄的最后一条
     */
    private static void createNewRecrodList(Map<String, List<Record>> map, Record record, boolean flag) {
        List<Record> actualList = new ArrayList<Record>();
        record.set("flag", flag);
        actualList.add(record);
        map.put(record.getStr("PARTBARLISTCODE"), actualList);
    }

    /**
     * 对记录进行分类
     * 
     * @param list
     * @param key
     * @return
     */
    public static Map<String, List<Record>> recordClassificData(List<Record> list, String key) {
        Map<String, List<Record>> map = new LinkedHashMap<String, List<Record>>();
        List<Record> vList;

        for (Record r : list) {
            vList = map.get(r.getStr(key));

            vList = vList == null ? new ArrayList<Record>() : vList;

            vList.add(r);

            map.put(r.getStr(key), vList);
        }

        return map;
    }

    /**
     * 对集合数据进行二层树形结构分类
     * 
     * @param list
     * @param mainField
     *            记录所要比较相同的字段名
     * @param correlation
     *            主干所要显示的字段
     * @return
     */
    public static <E extends ModelFinal<E>> Map<Record, List<E>> modelTwoLayout(List<E> list, String mainField, String... correlation) {
        Map<Record, List<E>> partMap = new LinkedHashMap<Record, List<E>>();

        Map<Object, Record> swt = new HashMap<Object, Record>();

        for (E mp : list) {
            Object partbarcode = mp.get(mainField);

            if (partbarcode == null) {
                continue;
            }

            List<E> mplist = null;

            if (!swt.containsKey(partbarcode)) {
                Record record = new Record();

                for (String field : correlation) {
                    record.set(field, mp.get(field));
                }

                mplist = new ArrayList<E>();

                swt.put(partbarcode, record);

                partMap.put(record, mplist);

            } else {
                mplist = partMap.get(swt.get(partbarcode));
            }

            // 移除列
            mp.remove(correlation);
            // 新增子项
            mplist.add(mp);
        }

        return partMap;
    }

    public static <E extends ModelFinal<E>> Map<String, DefaultScheduleSettings> getDefaultScheduleSettings(List<E> list) {
        Map<String, DefaultScheduleSettings> partMap = new LinkedHashMap<String, DefaultScheduleSettings>();

        for (E mp : list) {
            String setid = StringUtils.parseString(mp.get("setid"));
            String setname = StringUtils.parseString(mp.get("setname"));

            DefaultScheduleSettings dss = null;

            if (!partMap.containsKey(setid)) {
                dss = new DefaultScheduleSettings();
                dss.setSetid(setid);
                dss.setSetname(setname);
            } else {
                dss = partMap.get(setid);
            }
            // 子节移除
            mp.remove(new String[]{"setid", "setname"});
            dss.getChildren().add(mp);

            partMap.put(setid, dss);
        }

        return partMap;
    }

    /**
     * 对集合数据进行二层树形结构分类
     * 
     * @param list
     * @param mainField
     *            记录所要比较相同的字段名
     * 
     * @param leafFile
     *            如果给定的叶子节点为空时就移除
     * @param correlation
     *            主干所要显示的字段
     * @return
     */
    public static Map<Record, List<Record>> recordTwoLayout(List<Record> list, String mainField, String leafFile, String... correlation) {
        Map<Record, List<Record>> partMap = new LinkedHashMap<Record, List<Record>>();
        Record record = new Record();
        List<Record> mpList;

        for (Record mp : list) {
            if (!mp.get(mainField).equals(record.get(mainField))) {
                record = new Record();

                for (String field : correlation) {
                    record.set(field, mp.get(field));// 主干
                }

                mpList = new ArrayList<Record>();

            } else {
                mpList = partMap.get(record);
            }

            // 子节点移除主干的内容
            mp.remove(correlation);

            // 移除空叶子
            if (mp.get(leafFile) != null) {
                mpList.add(mp);
            }

            partMap.put(record, mpList);
        }
        return partMap;
    }

    /**
     * 对模具履历加工工件信息生成JSON
     * 
     * @param map
     * @return
     */
    public static String moduleResumePartJson(Map<Record, List<ModulePart>> map) {
        StringBuilder json = new StringBuilder();
        json.append("[");
        Iterator<Record> iterator = map.keySet().iterator();
        Record r;
        while (iterator.hasNext()) {
            r = iterator.next();
            json.append("{");

            String cnames = r.get("CNAMES");

            json.append("\"moduleResumeId\":\"").append(r.get("MODULERESUMEID")).append("\",");
            json.append("\"partBarCode\":\"").append(r.get("PARTBARCODE")).append("\",");
            json.append("\"text\":\"").append(r.get("PARTCODE"));
            json.append("(").append(cnames == null ? "" : cnames);
            json.append("[").append(r.get("QUANTITY")).append("件])\",");
            json.append("\"cls\":\"").append(r.get("cls")).append("\",");
            json.append("\"checked\": false,");
            json.append("\"children\":");
            json.append(JsonKit.toJson(map.get(r), 2).replace("partlistcode", "text").replace("\"'l'\":\"l\"", "\"leaf\":true"));
            json.append("}").append(iterator.hasNext() ? "," : "");
        }

        json.append("]");

        return json.toString();
    }

    /**
     * 对两层树形结构的数据生成JSON
     * 
     * @param map
     * @return
     */
    public static <E extends ModelFinal<E>> String modelMapToJson(Map<Record, List<E>> map) {
        StringBuilder json = new StringBuilder();
        json.append("[");
        Iterator<Record> iterator = map.keySet().iterator();
        Record r;
        String tmp;
        while (iterator.hasNext()) {
            r = iterator.next();
            tmp = JsonKit.toJson(r);
            tmp = tmp.substring(0, tmp.length() - 1);

            json.append(tmp).append(",\"children\":");

            json.append(JsonKit.toJson(map.get(r), 2));
            json.append("}").append(iterator.hasNext() ? "," : "");
        }

        json.append("]");

        return json.toString();
    }

    /**
     * 对两层树形结构的数据生成JSON
     * 
     * @param map
     * @return
     */
    public static String recordMapToJson(Map<Record, List<Record>> map) {
        StringBuilder json = new StringBuilder();
        json.append("[");
        Iterator<Record> iterator = map.keySet().iterator();
        List<Record> rList;
        Record r;
        String tmp;
        while (iterator.hasNext()) {
            r = iterator.next();
            tmp = JsonKit.toJson(r);
            tmp = tmp.substring(0, tmp.length() - 1);

            json.append(tmp).append(",\"children\":");

            rList = map.get(r);
            for (Record record : rList) {// 标记为叶子节点
                record.set("leaf", true);
            }

            json.append(JsonKit.toJson(map.get(r), 2));
            json.append("}").append(iterator.hasNext() ? "," : "");
        }

        json.append("]");

        return json.toString();
    }

    /**
     * model 数据中文简繁体转换
     * 
     * @param model
     * @param local
     *            CN or TW
     */
    public static void convertCharset(ModelFinal<?> model, String local) {

        String[] attrs = model.getAttrNames();
        String value;

        for (int i = 0; i < attrs.length; i++) {
            if (model.getColumnType(attrs[i]) == String.class) {
                value = model.getStr(attrs[i]);
                if (StrKit.notBlank(value) && ConstUtils.CHINESE_PATTERN.matcher(value).find()) {
                    model.set(attrs[i], convertLocal(value, local));
                }
            }
        }
    }

    /**
     * 将前台提交的formbean数据转换成model
     * 
     * @param clazz
     *            model class
     * @param obj
     *            formbean 数据对象
     * @return model
     */
    @SuppressWarnings("unchecked")
    public static <E extends ModelFinal<E>> E beanToModel(Class<E> clazz, Object obj) {
        E model = null;
        try {
            model = clazz.newInstance();

            Class<Object> objClass = (Class<Object>) obj.getClass();
            Method method;
            String fieldName;
            Object res;

            Field[] fields = objClass.getDeclaredFields();

            for (Field field : fields) {
                // 找出要转换的字段
                if (field.getAnnotation(DropOut.class) == null) {
                    fieldName = StrKit.firstCharToUpperCase(field.getName());
                    method = objClass.getMethod("get" + fieldName);
                    res = method.invoke(obj);
                    if (method.getReturnType() == Date.class) {
                        model.set(fieldName, res != null ? new Timestamp(((Date) res).getTime()) : res);
                    } else {
                        model.set(fieldName, res);
                    }

                }
            }
        }
        catch (Exception e) {
            e.printStackTrace();
        }

        return model;
    }

    /**
     * 根据源Sheet样式copy新Sheet
     * 
     * @param fromsheetname
     * @param newsheetname
     * @param targetFile
     */
    public static HSSFSheet cloneHSSFSheet(HSSFSheet fromsheet, String newsheetname, HSSFWorkbook wb) {

        HSSFSheet newsheet = null;
        try {

            if (fromsheet != null && wb.getSheet(newsheetname) == null) {

                newsheet = wb.createSheet(newsheetname);
                // 设置打印参数
                newsheet.setMargin(HSSFSheet.TopMargin, fromsheet.getMargin(HSSFSheet.TopMargin));// 页边距（上）
                newsheet.setMargin(HSSFSheet.BottomMargin, fromsheet.getMargin(HSSFSheet.BottomMargin));// 页边距（下）
                newsheet.setMargin(HSSFSheet.LeftMargin, fromsheet.getMargin(HSSFSheet.LeftMargin));// 页边距（左）
                newsheet.setMargin(HSSFSheet.RightMargin, fromsheet.getMargin(HSSFSheet.RightMargin));// 页边距（右

                fromsheet.getDrawingEscherAggregate();

                HSSFPrintSetup ps = newsheet.getPrintSetup();
                ps.setLandscape(false); // 打印方向，true：横向，false：纵向(默认)
                ps.setVResolution((short) 600);
                ps.setPaperSize(HSSFPrintSetup.A4_PAPERSIZE); // 纸张类型

                copyRows(fromsheet, newsheet, fromsheet.getFirstRowNum(), fromsheet.getLastRowNum());
            }
        }
        catch (Exception e) {
            e.printStackTrace();
        }

        return newsheet;
    }

    /**
     * 拷贝Excel行
     * 
     * @param wb
     * @param fromsheet
     * @param newsheet
     * @param firstrow
     * @param lastrow
     */
    public static void copyRows(HSSFSheet fromsheet, HSSFSheet newsheet, int firstrow, int lastrow) {
        if ((firstrow == -1) || (lastrow == -1) || lastrow < firstrow) {
            return;
        }

        // 拷贝合并的单元格
        Region region = null;
        for (int i = 0; i < fromsheet.getNumMergedRegions(); i++) {
            region = fromsheet.getMergedRegionAt(i);
            if ((region.getRowFrom() >= firstrow) && (region.getRowTo() <= lastrow)) {
                newsheet.addMergedRegion(region);
            }
        }

        HSSFRow fromRow = null;
        HSSFRow newRow = null;
        HSSFCell newCell = null;
        HSSFCell fromCell = null;
        // 设置列宽
        for (int i = firstrow; i <= lastrow; i++) {
            fromRow = fromsheet.getRow(i);
            if (fromRow != null) {
                for (int j = fromRow.getLastCellNum(); j >= fromRow.getFirstCellNum(); j--) {
                    int colnum = fromsheet.getColumnWidth(j);
                    if (colnum > 100) {
                        newsheet.setColumnWidth(j, colnum);
                    }
                    if (colnum == 0) {
                        newsheet.setColumnHidden(j, true);
                    } else {
                        newsheet.setColumnHidden(j, false);
                    }
                }
                break;
            }
        }
        // 拷贝行并填充数据
        for (int i = 0; i <= lastrow; i++) {
            fromRow = fromsheet.getRow(i);
            if (fromRow == null) {
                continue;
            }
            newRow = newsheet.createRow(i - firstrow);
            newRow.setHeight(fromRow.getHeight());
            for (int j = fromRow.getFirstCellNum(); j < fromRow.getPhysicalNumberOfCells(); j++) {
                fromCell = fromRow.getCell(j);
                if (fromCell == null) {
                    continue;
                }
                newCell = newRow.createCell(j);
                newCell.getCellStyle().cloneStyleFrom(fromCell.getCellStyle());
                // newCell.setCellStyle(fromCell.getCellStyle());
                int cType = fromCell.getCellType();
                newCell.setCellType(cType);
                switch (cType) {
                case HSSFCell.CELL_TYPE_STRING:
                    newCell.setCellValue(fromCell.getRichStringCellValue());
                    break;
                case HSSFCell.CELL_TYPE_NUMERIC:
                    newCell.setCellValue(fromCell.getNumericCellValue());
                    break;
                case HSSFCell.CELL_TYPE_FORMULA:
                    newCell.setCellFormula(fromCell.getCellFormula());
                    break;
                case HSSFCell.CELL_TYPE_BOOLEAN:
                    newCell.setCellValue(fromCell.getBooleanCellValue());
                    break;
                case HSSFCell.CELL_TYPE_ERROR:
                    newCell.setCellValue(fromCell.getErrorCellValue());
                    break;
                default:
                    newCell.setCellValue(fromCell.getRichStringCellValue());
                    break;
                }
            }
        }
    }

    /**
     * 获取目标路径Properties文件的内容,查找不到返回NULL<br>
     * 
     * @file Properties文件对应的文件名(必须在src目录下有效)
     * @param file
     * @return
     */
    public static Properties getProperties(String file) {
        // 声明存放properties内容的类
        Properties properties = new Properties();
        // 获取文件对应的路径
        String path = DataUtils.class.getClassLoader().getResource(file).getPath().replace("%20", " ");

        try {
            // 加载文件内容
            properties.load(new FileInputStream(new File(path)));
        }
        catch (Exception e) {
            properties = null;
        }

        return properties;
    }

    /**
     * 获取指定的Property文件中的某个指定Key的值
     * 
     * @param file
     * @param key
     * @return
     */
    public static String getPropertyValue(String file, String key) {
        Properties proper = getProperties(file);
        return proper.getProperty(key);
    }

    /**
     * 获取目标路径Properties文件的内容,查找不到返回NULL<br>
     * 
     * @file Properties文件对应的文件名(必须在src目录下有效)
     * @param file
     * @return
     * @throws FileNotFoundException
     */
    public static InputStream getInputStream(String file) {

        InputStream input = null;

        String path = DataUtils.class.getClassLoader().getResource(file).getPath().replace("%20", " ");

        try {
            input = new FileInputStream(path);
        }
        catch (FileNotFoundException e) {
            e.printStackTrace();
        }

        return input;
    }

    /**
     * 对数据对象集合进行树结构三层分类
     * 
     * @param classlist
     *            数据
     * @param rootField
     *            根节点字段名
     * @param rootContext
     *            根节点Record所要存在的值字段名
     * @param secondField
     *            第二节点字段名
     * @param secondContext
     *            第二节点Record所要存在的值字段名
     * @return
     */
    public static <E extends ModelFinal<E>> Map<Record, Map<Record, List<E>>> modelListThreeClassify(List<E> classlist,
                                                                                                     String rootField,
                                                                                                     String[] rootContext,
                                                                                                     String secondField,
                                                                                                     String[] secondContext) {
        Map<Record, Map<Record, List<E>>> rootMap = new LinkedHashMap<Record, Map<Record, List<E>>>();
        Map<Record, List<E>> secondMap;

        List<E> leafList = null;
        Record rootKey = new Record();
        Record secondKey = new Record();

        for (E model : classlist) {

            // 指到已存在的根节点,如果存在就查找第二节点
            if (model.get(rootField).equals(rootKey.get(rootField))) {
                secondMap = rootMap.get(rootKey);

                if (model.get(secondField).equals(secondKey.get(secondField))) {
                    secondMap.get(secondKey).add(model);
                } else {

                    // 第二节点---------------
                    secondKey = new Record();
                    for (String field : secondContext) {
                        secondKey.set(field, model.get(field));// 主干
                    }
                    secondKey.set(secondField, model.get(secondField));

                    // 叶子--------------------------------
                    leafList = new ArrayList<E>();
                    leafList.add(model);

                    // 将叶子加入到第二节点----------------------
                    secondMap.put(secondKey, leafList);

                    // 将第二节点加入到根节点----------------------
                    rootMap.put(rootKey, secondMap);

                }

            } else {
                // 创建新的分支
                // 根节点-->第二节点-->叶子
                rootKey = new Record();

                // 根节点---------------
                for (String field : rootContext) {
                    rootKey.set(field, model.get(field));
                }
                rootKey.set(rootField, model.get(rootField));

                // 第二节点---------------
                secondKey = new Record();
                for (String field : secondContext) {
                    secondKey.set(field, model.get(field));// 主干
                }
                secondKey.set(secondField, model.get(secondField));

                // 叶子--------------------------------
                leafList = new ArrayList<E>();
                leafList.add(model);

                // 将叶子加入到第二节点----------------------
                secondMap = new LinkedHashMap<Record, List<E>>();
                secondMap.put(secondKey, leafList);

                // 将第二节点加入到根节点----------------------
                rootMap.put(rootKey, secondMap);

            }

        }
        return rootMap;
    }

    /**
     * 将JSON数组串转换为HashMap数组
     * 
     * @param jsonStr
     * @return
     */
    public static Map<?, ?>[] fromJsonStrToList(String jsonStr) {
        ObjectMapper mapper = new ObjectMapper();
        try {
            Map<?, ?>[] map = mapper.readValue(jsonStr, Map[].class);
            return map;
        }
        catch (Exception e) {
            return null;
        }
    }

    /**
     * 将JSON数组串转换为HashMap数组
     * 
     * @param jsonStr
     * @return
     */
    public static <E> E fromJsonStrToBean(String jsonStr, Class<E> clazz) {
        ObjectMapper mapper = new ObjectMapper();
        try {

            E map = (E) mapper.readValue(jsonStr, clazz);
            return map;
        }
        catch (Exception e) {
            return null;
        }
    }

    public static List<Record> recordMapToList(Map<Record, List<Record>> map) {
        if (map == null) {
            return null;
        }

        List<Record> list = new ArrayList<Record>();

        Set<Record> keySet = map.keySet();

        for (Record key : keySet) {
            key.set("children", map.get(key));

            list.add(key);
        }

        return list;
    }

    public static <E extends ModelFinal<E>> List<Record> modelMapToList(Map<Record, List<E>> map) {
        if (map == null) {
            return null;
        }

        List<Record> list = new ArrayList<Record>();

        Set<Record> keySet = map.keySet();

        for (Record key : keySet) {
            key.set("children", map.get(key));

            list.add(key);
        }

        return list;
    }

    /**
     * 获取分页的页信息
     * 
     * @param list
     * @param start
     * @param limit
     * @return
     */
    public static <T> PaginationBean<T> getPagination(List<T> list, int start, int limit) {
        int end = start + limit;

        int lSize = list.size();
        PaginationBean<T> page = new PaginationBean<T>();

        if (lSize > start) {
            end = lSize > end ? end : lSize;

            List<T> pageList = new ArrayList<T>();

            for (int m = start; m < end; m++) {
                pageList.add(list.get(m));
            }

            page.setInfo(pageList);
        }

        page.setTotalCount(list.size());
        page.setSuccess(true);

        return page;
    }

    /**
     * 将指定类型的数字转化为List
     * 
     * @param t
     * @return
     */
    public static <T> List<T> fromArrayToList(T[] arr) {
        if (arr == null || arr.length == 0) {
            return null;
        }

        List<T> list = new ArrayList<T>();
        for (T i : arr) {
            list.add(i);
        }

        return list;
    }

    /**
     * 将List转换为数组
     * 
     * @param list
     * @return
     */
    @SuppressWarnings("unchecked")
    public static <T> T[] fromListToArray(List<T> list) {
        if (list == null || list.size() == 0) {
            return null;
        }

        T[] arr = (T[]) new Object[list.size()];
        arr = list.toArray(arr);

        return arr;
    }

    /**
     * 合并两个List数组
     * 
     * @param tt
     * @param ss
     * @return
     */
    public static <T> List<T> mergeList(List<T> tt, List<T> ss) {
        // 声明一个新的List
        List<T> cc = new ArrayList<T>();
        // 复制数组TT
        for (T i : tt) {
            cc.add(i);
        }
        // 复制数组SS
        for (T m : ss) {
            cc.add(m);
        }

        return cc;
    }

    /**
     * model转换成Key-value
     * 
     * @param list
     * @param keyField
     * @param valueField
     * @return
     */
    public static <T extends ModelFinal<T>> Map<String, String> modelToMap(List<T> list, String keyField, String valueField) {
        Map<String, String> map = new HashMap<String, String>();

        for (int i = 0; i < list.size(); i++) {
            map.put(list.get(i).getStr(keyField), list.get(i).getStr(valueField));
        }

        return map;
    }
}
