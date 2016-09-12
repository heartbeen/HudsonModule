package com.kc.module.model;

import java.util.List;

import com.kc.module.base.Barcode;

public class Station extends ModelFinal<Station> {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;
    public static Station dao = new Station();

    /**
     * 获取部门职位
     * 
     * @return
     */
    public List<Station> getCareerInfo() {
        return this.find("SELECT ID AS SID,STATIONNAME AS SNAME FROM STATION");
    }

    /**
     * 新增工作职位
     * 
     * @param pname
     * @return
     */
    public boolean addStationInfo(String pname) {
        // 創建station的實例化類
        Station station = new Station();
        station.set("ID", Barcode.STATION.nextVal()).set("STATIONNAME", pname);
        // 將資料保存至數據庫
        boolean rs = station.save();
        return rs;
    }
}
