package com.kc.module.model;

import java.util.List;

/**
 * 获取模具的加工负荷
 * 
 * @author ASUS
 * 
 */
public class ModuleWorkLoad extends ModelFinal<ModuleWorkLoad> {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;

    public static ModuleWorkLoad dao = new ModuleWorkLoad();

    /**
     * 获取机台的预计加工负荷时间
     * 
     * @param kindid
     * @return
     */
    public List<ModuleWorkLoad> getAcutalWorkLoad(int kindid) {
        StringBuilder sql = new StringBuilder();

        sql.append("SELECT SUM(MWL.USEHOUR) AS USEHOUR, MC.CRAFTID FROM MD_WORK_LOAD MWL LEFT JOIN MD_CRAFT MC ON MWL.CRAFTID = MC.ID ");
        if (kindid > 0) {
            sql.append("WHERE MWL.KINDID = ").append(kindid);
        }

        sql.append("GROUP BY MC.CRAFTID");

        return this.find(sql.toString());
    }
}
