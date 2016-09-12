package com.kc.module.model;

import java.util.Date;
import java.util.List;

import com.jfinal.kit.JsonKit;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;

public class Role extends ModelFinal<Role> {

    private static final long serialVersionUID = -3998967248761332676L;

    public static Role dao = new Role();

    public Role getRole(String userId) {
        String sql = "SELECT ra.roleid, r.rolename, ra.accountid FROM "
                     + "ROLE_ASSIGN ra, "
                     + tableName()
                     + " r WHERE ra.accountid = ? AND r.id = ra.roleid";

        return findFirst(sql, userId);
    }

    public String getRoleJson(String userId) {
        return JsonKit.toJson(getRole(userId));
    }

    public String getRoleJson(Role role) {
        return JsonKit.toJson(role);
    }

    public Role findByName(String name) {
        return findFirst("select * from " + tableName() + " where rolename = ?", name.trim());
    }

    /**
     * 获取角色列表信息
     * 
     * @return
     */
    public List<Record> roleDataTree() {
        return Db.find("SELECT ROLEID AS ID,ROLENAME AS TEXT FROM ROLE ORDER BY ROLEID");
    }

    /**
     * 获取角色列表信息
     * 
     * @return
     */
    public List<Role> roleData() {
        return find("SELECT * FROM ROLE ORDER BY ROLEID");
    }

    /**
     * 根据ID,删除角色数据
     * 
     * @param roleId
     * @return
     */
    public Boolean deleteRoleData(String roleId) {
        return Role.dao.deleteById(roleId);
    }
}
