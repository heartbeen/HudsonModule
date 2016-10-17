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
    public List<Record> findAuthorityData(String loacle) {
        StringBuilder sql = new StringBuilder();

        sql.append("SELECT I.AUTHID, ");
        sql.append("       I.AUTHNAME, ");
        sql.append("       nvl(slc.lang_value, I.USERPATHNAME) USERPATHNAME, ");
        sql.append("       I.AUTHTYPE, ");
        sql.append("       I.MODULEID, ");
        sql.append("       nvl(sl.lang_value, s.text) text ");
        sql.append("  FROM ITEM_AUTHORITY I ");
        sql.append("  left join SUB_FUNCTION S ");
        sql.append("    on I.MODULEID = S.ID ");
        sql.append("  left join sys_locale_content_t slc ");
        sql.append("    on slc.lang_code = i.lang_code ");
        sql.append("   and slc.locale_key = ? ");
        sql.append("  left join sys_locale_content_t sl ");
        sql.append("    on sl.lang_code = s.lang_code ");
        sql.append("   and sl.locale_key = ? ");
        sql.append(" ORDER BY AUTHID ");
        return Db.find(sql.toString(), loacle, loacle);
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
