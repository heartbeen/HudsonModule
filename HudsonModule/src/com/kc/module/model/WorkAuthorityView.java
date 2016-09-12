package com.kc.module.model;

import java.util.List;

import com.jfinal.kit.JsonKit;

/**
 * 用户功能与权限bean
 * 
 * @author 徐维
 * @email xuwei@sinyon.com.cn
 */
public class WorkAuthorityView extends ModelFinal<WorkAuthorityView> {

    /**
     * 得到用户相应角色的功能
     * @param roleId
     * @param userId
     * @return
     */
    public String getAuthorityJson(Object roleId) {
        String sql = "select * from " + tableName() + " WHERE authid =? ";
        List<WorkAuthorityView> list = find(sql, roleId);

        return JsonKit.toJson(list, 2);
    }
}
