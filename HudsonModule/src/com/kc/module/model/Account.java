package com.kc.module.model;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.List;

import com.jfinal.kit.StrKit;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;

/**
 * 负责对用户账号讯息表的相关操作<br>
 * 
 * @author Administrator
 * 
 */
public class Account extends ModelFinal<Account> {

    private static final long serialVersionUID = -3998967248761332676L;

    public static Account dao = new Account();

    public Account login() {
        return login(this.get("USERNAME"), this.get("PASSWORD"));
    }

    /**
     * 获取用户基本信息
     * 
     * @param userName
     * @param password
     * @return
     */
    public Account login(Object userName, Object password) {
        StringBuilder sql = new StringBuilder();

        sql.append("SELECT A.ACCOUNTID, E.POSID, A.USERNAME, A.VALID, A.ROLEID,A.NEWAUTH     ");
        sql.append("    , E.WORKNUMBER, E.EMPNAME, E.PHONE, E.SHORTNUMBER, R.NAME AS POSNAME ");
        sql.append("    , R.STEPID AS EMPPOSID, (                                            ");
        sql.append("        SELECT ID                                                        ");
        sql.append("        FROM REGION_DEPART                                               ");
        sql.append("        WHERE STEPID = SUBSTR(R.STEPID, 0, 2)                            ");
        sql.append("        ) AS FACTORYPOSID, (                                             ");
        sql.append("        SELECT ID                                                        ");
        sql.append("        FROM REGION_DEPART                                               ");
        sql.append("        WHERE STEPID = SUBSTR(R.STEPID, 0, 4)                            ");
        sql.append("        ) AS DEPTPOSID,(                                                 ");
        sql.append("        SELECT ID                                                        ");
        sql.append("        FROM REGION_DEPART                                               ");
        sql.append("        WHERE STEPID = SUBSTR(R.STEPID ,0 ,6)                            ");
        sql.append("        ) AS DEPTREGIONPOSID, E.ID AS EMPBARCODE                         ");
        sql.append("FROM (                                                                   ");
        sql.append("    SELECT ACCOUNTID, USERNAME, VALID, ROLEID,NEWAUTH                    ");
        sql.append("    FROM ACCOUNT_INFO                                                    ");
        sql.append("    WHERE USERNAME = ? AND PASSWORD = ?                                  ");
        sql.append(") A                                                                      ");
        sql.append("LEFT JOIN EMPLOYEE_INFO E ON A.ACCOUNTID = E.ID                          ");
        sql.append("    LEFT JOIN REGION_DEPART R ON R.ID = E.POSID                          ");

        return findFirst(sql.toString(), userName, password);
    }

    /**
     * 获取权限路径
     */
    public List<Account> loginInterce(String userName) {
        return find("SELECT I.AUTHNAME FROM ACCOUNT_INFO A LEFT JOIN ROLE_POS B ON A.ROLEID = B.ROLEID LEFT JOIN ITEM_AUTHORITY I ON B.AUTHID = I.AUTHID WHERE A.USERNAME= ? ",
                    userName);
    }

    /**
     * 获取权限分配列表信息
     * 
     * @return
     */
    public List<Record> accountInfoData(String colName, String value) {
        StringBuilder builder = new StringBuilder();

        builder.append("SELECT A.ACCOUNTID, A.USERNAME, EI.EMPNAME, A.ROLEID, A.CREATETIME ");
        builder.append(", A.VALID, R.ROLENAME FROM ACCOUNT_INFO A ");
        builder.append("LEFT JOIN ROLE R ON A.ROLEID = R.ROLEID ");
        builder.append("LEFT JOIN EMPLOYEE_INFO EI ON EI.ID = A.ACCOUNTID WHERE EI.ISENABLE IS NULL");

        if (StrKit.notBlank(colName)) {
            // 如果搜索的值为空,则返回一个空的查询集合
            if (!StrKit.notBlank(value)) {
                return new ArrayList<Record>();
            }

            String encodeVal = "";

            try {
                encodeVal = URLDecoder.decode(value, "UTF-8");
            }
            catch (UnsupportedEncodingException e) {
                return new ArrayList<Record>();
            }

            builder.append(" AND ").append(colName).append(" LIKE '%'||?||'%'");
            return Db.find(builder.toString(), encodeVal);

        }

        return Db.find(builder.toString());
    }

    /**
     * find deleted user's roleid
     * 
     * @return
     */
    public String findUserRole() {
        Account a = findFirst("select roleid from " + tableName() + " where accountid=?",
                              get("accountid"));

        return a == null ? "" : a.getStr("roleid");
    }

    /**
     * find deleted user's roleid
     * 
     * @return
     */
    public String findUserRole(String accountid) {
        Account a = findFirst("select roleid from " + tableName() + " where accountid=?", accountid);

        return a == null ? "" : a.getStr("roleid");
    }
}
