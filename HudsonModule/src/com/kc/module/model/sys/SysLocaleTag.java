package com.kc.module.model.sys;

import com.jfinal.plugin.activerecord.Db;
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
    public Page<SysLocaleTag> findLocaleTag(Record tag,
                                            String locale,
                                            int page,
                                            int start,
                                            int limit) {
        StringBuilder sqlExceptSelect = new StringBuilder();

        String sql = "select locale.*, pm.project_name ";

        sqlExceptSelect.append("from (select slt.* from SYS_LOCALE_TAG_T slt left join SYS_LOCALE_CONTENT_T slc ");
        sqlExceptSelect.append("on slc.lang_code=slt.lang_code where (slc.locale_key='");
        sqlExceptSelect.append(locale);
        sqlExceptSelect.append("' or slc.locale_key is null) ");

        if (tag != null) {

            if (!StringUtils.isEmpty(tag.get("project_id"))) {
                sqlExceptSelect.append(" and slt.project_id=").append(tag.get("project_id"));
            }

            if (!StringUtils.isEmpty(tag.get("lang_code"))) {
                sqlExceptSelect.append(" and lower(slc.lang_code) like '%")
                               .append(tag.getStr("lang_code").trim().toLowerCase())
                               .append("%'");

            }

            if (!StringUtils.isEmpty(tag.get("lang_value"))) {
                sqlExceptSelect.append(" and lower(slc.lang_value) like '%")
                               .append(tag.getStr("lang_value").trim().toLowerCase())
                               .append("%'");
            }

            if (!StringUtils.isEmpty(tag.get("category"))) {
                sqlExceptSelect.append(" and slt.category='")
                               .append(tag.get("category"))
                               .append("'");
            }
        }

        sqlExceptSelect.append(") locale left join (select pm.id, sc.lang_value as project_name");
        sqlExceptSelect.append(" from project_module pm left join SYS_LOCALE_CONTENT_T sc");
        sqlExceptSelect.append(" on sc.lang_code = pm.lang_code where sc.locale_key = '");
        sqlExceptSelect.append(locale);
        sqlExceptSelect.append("') pm");
        sqlExceptSelect.append(" on pm.id = locale.project_id order by locale.MODIFY_DATE desc");

        return paginate(page, limit, sql, sqlExceptSelect.toString());
    }

    /**
     * 删除国际化编码
     * 
     * @param tags
     * @return
     */
    public boolean deleteLocaleTag(String[] tags) {
        for (String tag : tags) {
            if (!dao.deleteById(tag)) {
                return false;
            }
        }

        return true;
    }

    /**
     * 
     * @param newCode
     * @return
     */
    public boolean updateLocaleTag(String newCode) {
        return Db.update("update SYS_LOCALE_TAG_T set lang_code=? where lang_code = ?",
                         newCode,
                         get("lang_code")) > 0;
    }
}
