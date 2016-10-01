package com.kc.module.model.sys;

import java.net.URLDecoder;

import com.jfinal.kit.StrKit;
import com.jfinal.plugin.activerecord.Page;
import com.kc.module.model.Factory;
import com.kc.module.model.ModelFinal;

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
    public Page<SysLocaleTag> findLocaleTag(SysLocaleTag tag, int page, int start, int limit) {

        String sql = "select * ";
        String sqlExceptSelect = "";
        if (tag != null) {
            sqlExceptSelect = "from SYS_LOCALE_TAG_T ";

            // if(tag.)
        } else {
            sqlExceptSelect = "from SYS_LOCALE_TAG_T ";
        }

        return paginate(page, limit, sql, sqlExceptSelect);
    }

}
