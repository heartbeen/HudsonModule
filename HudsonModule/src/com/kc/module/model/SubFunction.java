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
    public List<Record> subFunctionData() {
        String sql = "select id,text from sub_function";
        return Db.find(sql);
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
