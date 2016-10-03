package com.kc.module.model.sys;

import com.jfinal.plugin.activerecord.Page;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.model.ModelFinal;
import com.kc.module.utils.StringUtils;

/**
 * 
 * @author xuwei
 * 
 */
public class SysLocaleTag extends ModelFinal<SysLocaleTag> {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;
    public static SysLocaleTag dao = new SysLocaleTag();

    /**
     * 
     * @param field
     * @param condition
     * @return
     */
    public Page<SysLocaleTag> findLocaleTag(Record tag, String locale, int page, int start, int limit) {

        String sql = "select slt.*,slc.lang_value as project_name ";
        String sqlExceptSelect = "from SYS_LOCALE_TAG_T slt left join SYS_LOCALE_CONTENT_T slc "
                                 + "on slc.lang_code=slt.lang_code where slc.locale_key='"
                                 + locale
                                 + "'";
        if (tag != null) {

            if (!StringUtils.isEmpty(tag.get("project_id"))) {
                sqlExceptSelect += " and slt.project_id=" + tag.get("project_id");
            }

            if (!StringUtils.isEmpty(tag.get("lang_code"))) {
                sqlExceptSelect += " and lower(slc.lang_code) like '%" + tag.getStr("lang_code").trim().toLowerCase() + "%'";
            }

            if (!StringUtils.isEmpty(tag.get("lang_value"))) {
                sqlExceptSelect += " and lower(slc.lang_value) like '%" + tag.getStr("lang_value").trim().toLowerCase() + "%'";
            }

            if (!StringUtils.isEmpty(tag.get("category"))) {
                sqlExceptSelect += " and slt.category='" + tag.get("category") + "'";
            }

        }

        return paginate(page, limit, sql, sqlExceptSelect);
    }

}
