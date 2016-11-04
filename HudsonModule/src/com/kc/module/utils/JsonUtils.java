package com.kc.module.utils;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.log4j.Logger;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * JSON 生成方法类
 * 
 * @author 徐维
 * 
 */
public class JsonUtils {

    private static Logger logger = Logger.getLogger(JsonUtils.class);

    private static String TREE_NODE_NAME = "text";

    private static String TREE_TABLE_NODE_NAME = "name";

    /**
     * 通过数据对象集合生成JSON
     * 
     * @param jsonFields
     *            JSON属性数组
     * @param fields
     *            数据对象的属性数组
     * @param index
     *            index之前不用从数据对象获取数据
     * @param clazz
     *            数据对象
     * @param lists
     *            数据对象集合
     * @return
     */
    public static <E> String createJsonObject(String[] jsonFields, String[] fields, int index, Class<E> clazz, List<E> lists) {

        StringBuffer json = new StringBuffer();
        Method method;

        if (jsonFields.length != fields.length) {
            logger.error("无法生成JSON对象");
        }

        json.append("[");
        try {
            for (E dao : lists) {

                json.append("{");

                for (int i = 0; i < jsonFields.length; i++) {

                    json.append("\"" + jsonFields[i] + "\":\"");
                    // index 之前的JSON 数据从 fields[i]中获取
                    if (i < index) {
                        json.append(fields[i]);
                    } else {
                        method = clazz.getMethod("get" + StringUtils.initialUpperCase(fields[i]));
                        json.append(method.invoke(dao));
                    }

                    json.append("\"" + (i != jsonFields.length - 1 ? "," : ""));
                }

                json.append("},");
            }

        }
        catch (Exception e) {
            e.printStackTrace();
        }

        json.append("]");

        return json.toString().replace(",]", "]");
    }

    /**
     * <h2>将字符串集合格式化成JSON</h2><br>
     * 
     * @param list
     *            集合
     * @param fields
     *            字段数组
     * @return JSON
     */
    public static String listToJsonString(List<String[]> list, String... fields) {
        if (list == null) {
            return "[]";
        }

        StringBuilder json = new StringBuilder();

        Iterator<String[]> iterator = list.iterator();// 得到集合迭代器
        String[] res;

        json.append("[");

        while (iterator.hasNext()) {
            res = iterator.next();

            json.append("{");
            for (int i = 0; i < fields.length; i++) {
                json.append("\"" + fields[i] + "\":\"");
                json.append(res[i] == null ? "" : res[i]);
                json.append("\"" + (i == fields.length - 1 ? "" : ","));
            }

            json.append("}" + (iterator.hasNext() ? "," : ""));
        }

        json.append("]");

        return json.toString();
    }

    /**
     * <h2>生成EXT树表的三层结构JSON</h2>
     * 
     * +rootnode<br>
     * |--+secondnode<br>
     * &nbsp;&nbsp;&nbsp;|--leafName<br>
     * 
     * @param map
     *            树结构Map
     * @param clazz
     *            数据对象
     * @param leafName
     *            指定做叶子节点显示名称的属性名
     * @return
     */
    public static <E> String extThreeLayoutTree(Map<Object, Map<Object, List<E>>> map, Class<E> clazz, String leafName) {
        StringBuilder json = new StringBuilder();

        Field[] fields = clazz.getDeclaredFields();
        Map<Object, List<E>> leafMap;
        Iterator<E> iterator;
        Iterator<Object> rootSet = map.keySet().iterator();
        Iterator<Object> leafSet;
        E bean;
        String fieldName;
        Object rootkey = "";
        Object leafkey = "";
        Object value;
        Method method;

        json.append("{children:[");
        try {
            while (rootSet.hasNext()) {
                rootkey = rootSet.next();
                leafMap = map.get(rootkey);
                leafSet = leafMap.keySet().iterator();

                json.append("{text:'");
                json.append(rootkey);
                json.append("',children:[");
                while (leafSet.hasNext()) {
                    leafkey = leafSet.next();

                    iterator = leafMap.get(leafkey).iterator();

                    json.append("{text:'");
                    json.append(leafkey);
                    json.append("',children:[");

                    while (iterator.hasNext()) {
                        bean = iterator.next();
                        json.append("{");
                        for (int i = 0; i < fields.length; i++) {
                            fieldName = fields[i].getName();

                            if (fieldName.equals("serialVersionUID")) {
                                continue;
                            }
                            method = clazz.getMethod("get" + StringUtils.initialUpperCase(fieldName));

                            value = method.invoke(bean);

                            // if ((value instanceof BasePojo)) {
                            // continue;
                            // }

                            // 指定某个属性为叶子节点的名称
                            if (fieldName.equals(leafName)) {
                                fieldName = "text";
                            }

                            json.append(fieldName + ":'");
                            json.append(value == null ? "" : value);
                            json.append("',leaf:true,");

                        }

                        json.append(iterator.hasNext() ? "}," : "}");
                    }

                    json.append(leafSet.hasNext() ? "]}," : "]}");
                }
                json.append(rootSet.hasNext() ? "]}," : "]}");
            }
        }
        catch (Exception e) {
            logger.error("反射错误--", e);
        }

        json.append("]}");

        return json.toString().replace(",}", "}");
    }

    /**
     * 生成EXT树表的两层结构
     * 
     * @param map
     * @return
     */
    public static <E> String extTwoLayoutTreeTable(Map<Object, List<E>> map, Class<E> clazz, String leafName) {
        return extTwoLayoutTree(map, clazz, TREE_TABLE_NODE_NAME, leafName);
    }

    /**
     * 生成EXT树表的两层结构
     * 
     * @param map
     * @return
     */
    public static <E> String extTwoLayoutTree(Map<Object, List<E>> map, Class<E> clazz, String leafName) {
        return extTwoLayoutTree(map, clazz, TREE_NODE_NAME, leafName);
    }

    /**
     * 生成EXT树的两层结构
     * 
     * @param map
     * @return
     */
    public static <E> String extTwoLayoutTree(Map<Object, List<E>> map, Class<E> clazz, String nodeName, String leafName) {
        StringBuilder json = new StringBuilder();

        Field[] fields = clazz.getDeclaredFields();
        Iterator<E> iterator;
        Iterator<Object> rootSet = map.keySet().iterator();
        E bean;
        String fieldName;
        Object leafkey = "";
        Object value;
        Method method;

        json.append("{children:[");
        try {

            while (rootSet.hasNext()) {
                leafkey = rootSet.next();

                iterator = map.get(leafkey).iterator();

                json.append("{" + nodeName + ":'");
                json.append(leafkey);
                json.append("',children:[");

                while (iterator.hasNext()) {
                    bean = iterator.next();
                    json.append("{");
                    for (int i = 0; i < fields.length; i++) {
                        fieldName = fields[i].getName();

                        if (fieldName.equals("serialVersionUID")) {
                            continue;
                        }
                        method = clazz.getMethod("get" + StringUtils.initialUpperCase(fieldName));

                        value = method.invoke(bean);

                        // if ((value instanceof BasePojo)) {
                        // continue;
                        // }

                        // 指定某个属性为叶子节点的名称
                        if (fieldName.equals(leafName)) {
                            fieldName = nodeName;
                        }

                        json.append(fieldName + ":'");
                        json.append(value == null ? "" : value);
                        json.append("',leaf:true,");

                    }

                    json.append(iterator.hasNext() ? "}," : "}");
                }

                json.append(rootSet.hasNext() ? "]}," : "]}");
            }
        }
        catch (Exception e) {
            logger.error("反射错误--", e);
        }

        json.append("]}");

        return json.toString().replace(",}", "}");
    }

    /**
     * 将数据对象集合转换为JSON
     * 
     * @param clazz
     *            数据字节码
     * @param list
     *            数据集合
     * @param fields
     *            指定转换的属性,null表示为所有的属性都转换
     * @return JSON
     */
    public static <E> String beanListToJson(Class<E> clazz, List<E> list, String... fields) {
        StringBuilder json = new StringBuilder();
        Iterator<E> iterator = list.iterator();
        E bean;
        String[] names = getFieldArray(clazz, fields);

        json.append("[");

        try {
            while (iterator.hasNext()) {
                bean = iterator.next();
                json.append("{");
                beanToJson(clazz, json, names, bean);
                json.append(iterator.hasNext() ? "}," : "}");
            }
        }
        catch (Exception e) {
            logger.error("集合转JSON错误" + clazz.getName(), e);
        }

        json.append("]");
        return json.toString();
    }

    /**
     * 数据对象转JSON,并指定要转的字段
     * 
     * @param clazz
     *            数据对象字节码
     * @param bean
     *            数据对象
     * @param fields
     *            字段数组
     * @return
     */
    public static <E> String beanToJson(Class<E> clazz, E bean, String... fields) {
        StringBuilder json = new StringBuilder();
        String[] names = getFieldArray(clazz, fields);

        json.append("{");
        try {
            beanToJson(clazz, json, names, bean);
        }
        catch (Exception e) {
            logger.error("转JSON错误" + clazz.getName(), e);
        }
        json.append("}");

        return json.toString();
    }

    /**
     * 得到要生成JSON的字段名,
     * 
     * @param clazz
     * @param fields
     * @return
     */
    private static <E> String[] getFieldArray(Class<E> clazz, String[] fields) {
        Field[] fs = clazz.getDeclaredFields();
        String[] names;

        if (fields == null || fields.length == 0) {
            names = new String[fs.length];

            for (int i = 0; i < names.length; i++) {
                names[i] = fs[i].getName();
            }
        } else {
            names = fields;
        }

        return names;
    }

    /**
     * 
     * @param clazz
     * @param json
     * @param names
     * @param bean
     * @throws Exception
     */
    private static <E> void beanToJson(Class<E> clazz, StringBuilder json, String[] names, E bean) throws Exception {

        Method method;
        Object value;
        for (int i = 0; i < names.length; i++) {
            if (!names[i].equals("serialVersionUID")) {
                method = clazz.getMethod("get" + StringUtils.initialUpperCase(names[i]));
                value = method.invoke(bean);
                json.append("\"" + names[i] + "\":\"");
                json.append(value == null ? "" : value);
                json.append(i == names.length - 1 ? "\"" : "\",");
            }
        }
    }

    /**
     * 集合生成EXT树
     * 
     * @param clazz
     * @param list
     * @param leafName
     *            要用树显示的字段
     * @param fields
     *            要生JSON的字段名
     * @return
     */
    public static <E> String extTree(Class<E> clazz, List<E> list, String leafName, String... fields) {
        StringBuilder json = new StringBuilder();

        String[] names = getFieldArray(clazz, fields);

        Iterator<E> iterator = list.iterator();
        E bean;
        Method method;
        Object value;

        json.append("{children:[");
        try {

            while (iterator.hasNext()) {
                bean = iterator.next();
                json.append("{");
                for (int i = 0; i < names.length; i++) {

                    if (names[i].equals("serialVersionUID")) {
                        continue;
                    }
                    method = clazz.getMethod(StringUtils.initialUpperCase(names[i]));

                    value = method.invoke(bean);

                    // if ((value instanceof BasePojo)) {
                    // continue;
                    // }

                    // 指定某个属性为叶子节点的名称

                    json.append((names[i].equals(leafName) ? "text" : names[i]) + ":'");
                    json.append(value == null ? ",'" : value + "',");

                }

                json.append("leaf:true").append(iterator.hasNext() ? "}," : "}");
            }

        }
        catch (Exception e) {
            logger.error("反射错误--", e);
        }

        json.append("]}");

        return json.toString();
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
     * 
     * @param json
     * @param clazz
     * @return
     */
    public static <E> E josnToBean(String json, Class<E> clazz) {
        ObjectMapper mapper = new ObjectMapper();
        E bean = null;

        try {
            bean = mapper.readValue(json, clazz);
        }
        catch (Exception e) {
            logger.error("json to bean error!", e);
            try {
                bean = clazz.newInstance();
            }
            catch (Exception e1) {
                return (null);
            }
        }

        return bean;

    }

    /**
     * 将MAP转换为数组
     * 
     * @param map
     * @return
     */
    public static String[] fromMapToStringArray(Map<?, ?> map) {
        if (map != null && map.size() > 0) {
            List<String> arr = new ArrayList<String>();
            for (Object key : map.keySet()) {
                arr.add(map.get(key).toString());
            }

            // 将List集合转换为字符串数组
            String[] mapArr = new String[map.size()];
            mapArr = arr.toArray(mapArr);
            return mapArr;
        }

        return (null);
    }

    /**
     * 将JSON数组串中的一行第N行记录转化为字符串数组
     * 
     * @param json
     * @param row
     * @return
     */
    public static String[] parseJsonToArray(String json, int row) {
        Map<?, ?>[] maplist = fromJsonStrToList(json);
        if (maplist == null || maplist.length == 0) {
            return (null);
        }

        if (row > maplist.length - 1) {
            return (null);
        }

        return fromMapToStringArray(maplist[row]);
    }

    /**
     * 解析JavaScript数组
     * 
     * @param arr
     * @return
     */
    public static String[] parseJsArray(String arr) {
        try {
            if (arr == null || arr.length() == 0) {
                return (null);
            }
            return arr.trim().replaceAll("[\\[\\]'\"]", "").split(",", -1);
        }
        catch (Exception e) {
            return (null);
        }
    }

    /**
     * 将JS数组解析为Java的List集合
     * 
     * @param arr
     * @return
     */
    public static List<String> parseJsArrayList(String arr) {
        // 初始化一个集合用于存放解析后的元素值
        List<String> list = null;
        try {
            // 如果字符串为空或者长度为零
            if (StringUtils.isEmpty(arr)) {
                return (null);
            }

            String[] arritem = arr.trim().replaceAll("[\\[\\]'\"]", "").split(",", -1);
            // 如果ARRITEM数组的元素个数不为空,则将其添加至List集合中去
            if (arritem != null && arritem.length > 0) {
                list = new ArrayList<String>();

                for (String s : arritem) {
                    list.add(s);
                }
            }

            return list;
        }
        catch (Exception e) {
            return (null);
        }
    }

    /**
     * 将JavaScript数组解析为元素不重复的Java数组
     * 
     * @return
     */
    public static String[] parseUniqueJsArray(String arr) {
        String[] list = parseJsArray(arr);
        // 如果解析的数组为空或者解析的数组长度小于2返回数组本身
        if (list == null || list.length < 2) {
            return list;
        }

        // 过滤数组中的重复值,如果已经存在,则跳过,否则记录一笔
        List<String> unique = new ArrayList<String>();
        for (String s : list) {
            if (!unique.contains(s)) {
                unique.add(s);
            }
        }

        // 将List转化为一个值不重复的数组
        String[] pro = new String[unique.size()];
        pro = unique.toArray(pro);

        return pro;
    }

    public String fromRequestParaToJson(HttpServletRequest req) {
        return (null);
    }
    
    /**
     * 将一个JSON字符串转换为MAP集合
     * 
     * @param jsonStr
     * @return
     */
    public static Map<?, ?> fromJsonToMap(String jsonStr) {
        ObjectMapper mapper = new ObjectMapper();
        try {
            Map<?, ?> map = mapper.readValue(jsonStr, Map.class);
            return map;
        }
        catch (Exception e) {
            return null;
        }
    }
    
    /**
     * 将BEAN转换为JSON
     * 
     * @param bean
     * @return
     */
    public static <T> String bean2Json(T bean) {
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            return objectMapper.writeValueAsString(bean);
        }
        catch (Exception e) {
            return "{}";
        }

    }

    /**
     * 将LIST转换为JSON
     * 
     * @param t
     * @return
     */
    public static <T> String listToJson(List<T> t) {
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            return objectMapper.writeValueAsString(t);
        }
        catch (Exception e) {
            return "[]";
        }
    }
}
