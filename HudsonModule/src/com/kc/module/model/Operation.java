package com.kc.module.model;

import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;

public class Operation {

    /**
     * 得到相应模块的所有功能
     * 
     * @return
     */
    public static String getProjectFunction(String projectId) {
        StringBuilder json = new StringBuilder();
        String sql = "SELCTE SUB.NAME,F.ID,F.TEXT,F.PATH,F.ICONCLS FROM SUB_FUNCTION F RIGHT JOIN "
                     + "(SELECT ID,NAME FROM PROJECT_MODULE WHERE PARENTID=?) SUB "
                     + "ON SUB.ID= F.PROJECTID";

        List<Record> list = Db.find(sql, projectId);
        
        for(Record r:list){
        }

        return json.toString();
    }

}
