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

        sql.append("select sl.locale_name, slc.* ");
        sql.append("from sys_locale sl ");
        sql.append("left join (select * ");
        sql.append("             from SYS_LOCALE_CONTENT_T ");
        sql.append("            where lang_code = ?) slc ");
        sql.append(" on slc.locale_key = sl.locale_key ");

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
        return Db.update("update SYS_LOCALE_CONTENT_T set lang_code=? where lang_code=?", newCode, oldCode) >= 0;
    }

}
