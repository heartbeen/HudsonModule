package com.kc.module.model;

import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;

/**
 * 负责系统的相关的权限操作
 * 
 * @author Administrator
 * 
 */
public class Authority extends ModelFinal<Authority> {

    private static final long serialVersionUID = -3998967248761332676L;

    public static Authority dao = new Authority();

    /**
     * 获取对应路径列表信息
     * 
     * @return
     */
    public List<Record> findAuthorityData() {
        return Db.find("SELECT I.AUTHID,I.AUTHNAME,I.USERPATHNAME,I.AUTHTYPE,I.MODULEID,S.TEXT FROM ITEM_AUTHORITY I left join SUB_FUNCTION S on I.MODULEID=S.ID  ORDER BY AUTHID");
    }

    /**
     * 获取用户所有的角色和路径权限
     * 
     * @param userName
     * @param password
     * @return
     */
    public List<Authority> allAuthority(Object roleId, Object accountId) {

        return find("SELECT AUTHNAME , i.authid FROM (SELECT DISTINCT authid "
                    + "FROM role_pos WHERE ROLEID = ? OR ROLEID = ? "
                    + ") rp LEFT JOIN ITEM_AUTHORITY i ON i.AUTHID = rp.authid", roleId, accountId);
    }

    /**
     * 得到角所拥有功能的权限
     * 
     * @param fid
     *            功能ID
     * @param roldId
     *            角色ID
     * @return
     */
    public List<Record> findFunctionAuthority(String fid, String roleId) {
        StringBuilder sql = new StringBuilder();
        sql.append("SELECT T.*, R.AUTHPOSID FROM (SELECT AUTHID, USERPATHNAME AS NAME ");
        sql.append("    FROM ITEM_AUTHORITY WHERE MODULEID = ? ) T ");
        sql.append("     LEFT JOIN ROLE_POS R ON R.AUTHID = T.AUTHID ");
        sql.append(" AND R.ROLEID = ?");

        return Db.find(sql.toString(), fid, roleId);
    }

}
