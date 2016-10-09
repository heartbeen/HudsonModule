package com.kc.module.model.sys;

import java.util.ArrayList;
import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.model.ModelFinal;

/**
 * 
 * @author xuwei
 * 
 */
public class SysLocaleContent extends ModelFinal<SysLocaleContent> {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;
    public static SysLocaleContent dao = new SysLocaleContent();

    /**
     * 通过国际化编号标签得到所对应的所有语言
     * 
     * @param tag
     * @return
     */
    public List<Record> findLocaleContentByTag(String tag) {
        StringBuilder sql = new StringBuilder();

        sql.append("select sl.locale_name,sl.locale_key, slc.id,slc.lang_code,slc.lang_value,");
        sql.append("slc.create_by,slc.create_date,slc.modify_by,slc.modify_date ");
        sql.append("from sys_locale sl ");
        sql.append("left join (select * ");
        sql.append("             from SYS_LOCALE_CONTENT_T ");
        sql.append("            where lang_code = ?) slc ");
        sql.append(" on slc.locale_key = sl.locale_key order by sl.locale_key");

        return Db.find(sql.toString(), tag);
    }

    /**
     * 
     * @param tags
     * @return
     */
    public boolean deleteLocaleContent(String[] tags) {
        List<String> sqlList = new ArrayList<String>();

        for (String tag : tags) {
            sqlList.add("delete SYS_LOCALE_CONTENT_T where lang_code='" + tag + "'");
        }

        int[] res = Db.batch(sqlList, sqlList.size());

        for (int r : res) {
            if (r < 0) {
                return false;
            }
        }

        return true;
    }

    /**
     * 更新国际化内容的国际化编码
     * 
     * @return
     */
    public boolean upateLocaleContentCode(String newCode, String oldCode) {
        return Db.update("update SYS_LOCALE_CONTENT_T set lang_code=? where lang_code=?",
                         newCode,
                         oldCode) >= 0;
    }

    /**
     * 缓存国际化
     * 
     * @param locale
     * @return
     */
    public List<SysLocaleContent> cacheLocaleContent() {
        return find("select locale_key,lang_code, lang_value from sys_locale_content_t");
    }

}
