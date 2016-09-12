package com.kc.module.model;

import java.util.List;
import java.util.UUID;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.plugin.SqlManager;

public class RolePosition extends ModelFinal<RolePosition> {

    private static final long serialVersionUID = -3998967248761332676L;

    public static RolePosition dao = new RolePosition();

    /**
     * 获取权限分配列表信息
     * 
     * @return
     */
    public List<Record> getRolePosData(String roleId) {
        String sql = "select r.authok,authposid,e.roleid,e.rolename,a.authid,a.userpathname from role_pos r,"
                     + "role e,item_authority a where r.roleid = e.roleid(+) and "
                     + "r.authid = a.authid(+)  and r.roleid= ? order by r.roleId";
        return Db.find(sql, roleId);
    }

    public List<Record> projectModuleData(String id) {
        String sql = "select t.* from project_module t where t.id=?";
        return Db.find(sql, id);
    }

    public List<Record> getRoleposData(String roleId, String authId) {
        String sql = "select t.* from role_pos t where t.roleid = ? and t.authid = ?";
        return Db.find(sql, roleId, authId);
    }

    /**
     * 删除角色所分配权根
     * 
     * @param authId
     * @return
     */
    public int deleteRoldAuth(String authId) {
        return Db.update(SqlManager.sql(sqlKey("deleteRoldAuth")), authId);
    }

}
