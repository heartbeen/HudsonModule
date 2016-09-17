package com.kc.module.model;

import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.plugin.SqlManager;

public class ProjectModule extends ModelFinal<ProjectModule> {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;
    public static ProjectModule dao = new ProjectModule();

    /**
     * 得到相应模块的所有功能
     * 
     * @return
     */
    public List<ProjectModule> findProjectFunction(Object roleid, Object projectId, int typeId, String lang) {
        return find(SqlManager.sql(sqlKey("findprojectfunction")), roleid, roleid, lang, projectId, typeId);
    }

    /**
     * 查找用户所有的模块
     * 
     * @param roleid
     * @return
     */
    public List<ProjectModule> findModule(Object roleid, String locale) {
        return find(SqlManager.sql(sqlKey("findmodule")), roleid, roleid, locale);
    }

    /**
     * 主模块列表
     * 
     * @return
     */
    public List<Record> findMainModule() {
        return Db.find("SELECT ID,NAME FROM PROJECT_MODULE WHERE PARENTID IS NULL");
    }

    /**
     * 查找所有的子模块
     * 
     * @return
     */
    public List<Record> findSubModule(String mainId) {
        return Db.find(SqlManager.sql(sqlKey("findsubmodule")), mainId);
    }

}
