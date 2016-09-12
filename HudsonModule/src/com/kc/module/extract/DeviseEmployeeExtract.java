package com.kc.module.extract;

import java.util.Properties;

import com.alibaba.druid.util.StringUtils;
import com.jfinal.plugin.activerecord.Db;
import com.kc.module.dao.ExtractDao;
import com.kc.module.utils.DataUtils;

/**
 * 获取设计单位的相关信息
 * 
 * @author ASUS
 * 
 */
public class DeviseEmployeeExtract extends ExtractDao {

    private String defRegion;

    public String getDefRegion() {
        return defRegion;
    }

    public void setDefRegion(String defRegion) {
        this.defRegion = defRegion;
    }

    @Override
    public Object extract() {
        // 获取设计单位的唯一号
        Properties properties = DataUtils.getProperties("config.properties");
        String regionid = properties.getProperty("designregion");

        String query = this.getController().getPara("query");

        StringBuilder builder = new StringBuilder();

        Object[] params = null;

        builder.append("SELECT * FROM EMPLOYEE_INFO WHERE POSID IN (SELECT ID FROM REGION_DEPART ");
        builder.append("WHERE STEPID LIKE (NVL((SELECT STEPID FROM REGION_DEPART WHERE ID = ? ), ?) || '%'))");
        if (!StringUtils.isEmpty(query)) {
            builder.append(" AND EMPNAME LIKE ? || '%'");
            params = new Object[]{regionid, this.defRegion, query};
        } else {
            params = new Object[]{regionid, this.defRegion};
        }

        return Db.find(builder.toString(), params);
    }

}
