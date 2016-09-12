package com.kc.module.model;

import java.util.List;

public class PartRace extends ModelFinal<PartRace> {
    /**
     * 
     */
    private static final long serialVersionUID = 1L;

    public static PartRace dao = new PartRace();

    /**
     * 获取模具分类的编号以及中文名称
     * 
     * @return
     */
    public List<PartRace> getPartRace() {
        return this.find("select id,classcode,chinaname from partrace order by classcode");
    }
}
