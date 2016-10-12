package com.kc.module.model;

import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.plugin.SqlManager;

public class SubFunction extends ModelFinal<SubFunction> {

    private static final long serialVersionUID = -3998967248761332676L;

    public static SubFunction dao = new SubFunction();

    /**
     * 获取模块列表信息
     * 
     * @return
     */
    public List<Record> subFunctionData(String locale) {
        StringBuilder sql = new StringBuilder();

        sql.append("select sf.id, nvl(slc.lang_value, sf.text) text ");
        sql.append("  from sub_function sf ");
        sql.append("  left join sys_locale_content_t slc ");
        sql.append("    on slc.lang_code = sf.lang_code ");
        sql.append("   and slc.locale_key = 'zh_CN' ");

        return Db.find(sql.toString(), sql);
    }

    /**
     * 得到子模块的功能
     * 
     * @param projectid
     * @return
     */
    public List<Record> findSubModuleFunction(String projectid) {
        return Db.find(SqlManager.sql(sqlKey("findsubmodulefunction")), projectid);
    }
}
