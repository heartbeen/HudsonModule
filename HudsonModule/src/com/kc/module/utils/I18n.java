package com.kc.module.utils;

import java.text.MessageFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import com.jfinal.core.Controller;
import com.kc.module.model.sys.SysLocaleContent;

/**
 * 国际化工具
 * 
 * @author xuwei
 * 
 */
public class I18n {

    /**
     * 国际化数据缓存
     */
    private static Map<String, Map<String, String>> i18n = new HashMap<String, Map<String, String>>();

    /**
     * 
     */
    public static void cacheLocaleContent() {
        List<SysLocaleContent> contentList = SysLocaleContent.dao.cacheLocaleContent();

        Map<String, List<SysLocaleContent>> contentMap = DataUtils.moduleClassific(contentList,
                                                                                   "locale_key");

        for (Entry<String, List<SysLocaleContent>> entry : contentMap.entrySet()) {
            i18n.put(entry.getKey(),
                     DataUtils.modelToMap(entry.getValue(), "lang_code", "lang_value"));
        }
    }

    public static String get(Controller control, String localeKey) {
        return get(control, localeKey, null);

    }

    public static String get(Controller control, String localeKey, Object... params) {
        String locale = ControlUtils.getLocale(control);

        if (i18n.get(locale) == null || i18n.get(locale).get(localeKey) == null) {
            return localeKey;
        }

        return params == null ? i18n.get(locale).get(localeKey)
                             : MessageFormat.format(i18n.get(locale).get(localeKey), params);

    }

    /**
     * 前台得到国际化数据
     * 
     * @param control
     * @return
     */
    public static Map<String, String> getLocaleContent(Controller control) {
        return getLocaleContent(ControlUtils.getLocale(control));

    }

    /**
     * 前台得到国际化数据
     * 
     * @param control
     * @return
     */
    public static Map<String, String> getLocaleContent(String locale) {
        return i18n.get(locale);
    }

    /**
     * 增加或更新国际化内容
     * 
     * @param locale
     * @param key
     * @param value
     */
    public static void put(String locale, String key, String value) {
        i18n.get(locale).put(key, value);
    }

    /**
     * 更新国际化编码
     * 
     * @param control
     * @param oldKey
     * @param newKey
     */
    public static synchronized void update(String oldKey, String newKey) {

        for (Entry<String, Map<String, String>> entry : i18n.entrySet()) {
            String value = i18n.get(entry.getKey()).get(oldKey);
            i18n.get(entry.getKey()).put(newKey, value);
            i18n.get(entry.getKey()).remove(oldKey);
        }

    }
}
