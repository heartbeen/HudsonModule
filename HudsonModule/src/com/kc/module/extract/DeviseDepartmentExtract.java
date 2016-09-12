package com.kc.module.extract;

import java.util.List;
import java.util.Properties;

import com.alibaba.druid.util.StringUtils;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.dao.ExtractDao;
import com.kc.module.utils.DataUtils;

public class DeviseDepartmentExtract extends ExtractDao {

    @Override
    public Object extract() {
        Object incObj = this.getController().getPara("inc");
        boolean inc = (incObj == null ? false : this.getController().getParaToBoolean("inc"));

        Properties properties = DataUtils.getProperties("config.properties");
        String regionid = properties.getProperty("designregion");

        // 如果部门ID为空返回
        if (StringUtils.isEmpty(regionid)) {
            return (null);
        }

        StringBuilder builder = new StringBuilder();

        builder.append("SELECT ID,NAME,STEPID FROM REGION_DEPART WHERE ISAVA = 0 AND STEPID LIKE (SELECT STEPID ");
        builder.append("FROM REGION_DEPART WHERE ID = ?) || '%' ORDER BY STEPID");

        List<Record> rlist = Db.find(builder.toString(), regionid);
        if (rlist == null || rlist.size() == 0) {
            return (null);
        }

        // 如果指定为不包括则删除跟部门
        int rowIndex = getRootIndex(rlist, "ID", regionid);
        if (rowIndex > -1) {
            if (!inc) {
                rlist.remove(rowIndex);
            }
        } else {
            rlist.clear();
        }

        return rlist;
    }

    private int getRootIndex(List<Record> records, String col, String val) {
        //
        int rowIndex = -1;
        if (records == null) {
            return rowIndex;
        }

        for (int i = 0; i < records.size(); i++) {
            String t_val = records.get(i).getStr(col);
            if (t_val.equals(val)) {
                return i;
            }
        }

        return rowIndex;
    }
}
