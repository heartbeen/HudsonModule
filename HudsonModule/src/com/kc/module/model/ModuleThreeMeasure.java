package com.kc.module.model;

import java.util.List;

import com.jfinal.kit.StrKit;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;

public class ModuleThreeMeasure extends ModelFinal<ModuleThreeMeasure> {

    public static ModuleThreeMeasure dao = new ModuleThreeMeasure();

    /**
     * 得到工件的三次元图片记录
     * 
     * @param partBarcode
     * @return
     */
    public List<Record> findPartOfMeasure(String partBarcode, String measureDate) {
        StringBuilder sql = new StringBuilder();

        sql.append("SELECT ML.MODULECODE, MP.PARTCODE, MTM.ID, MTM.PARTBARCODE, MTM.MODULEBARCODE ");
        sql.append("    , MTM.MEASURENAME, MTM.MEASURETIME, MTM.PICTUREPATH, MTM.CRAFTID, MTM.REMARK ");
        sql.append("    , MC.CRAFTNAME, EI.EMPNAME ");
        sql.append("FROM ( SELECT * FROM MD_TD_MEASURE WHERE PARTBARCODE = ?");

        if (StrKit.notBlank(measureDate)) {
            sql.append(" and to_char(measuretime,'YYYY-mm-dd')='").append(measureDate).append("'");
        }

        sql.append(" ) MTM LEFT JOIN MD_PART MP ON MP.PARTBARCODE = MTM.PARTBARCODE  ");
        sql.append("LEFT JOIN MODULELIST ML ON ML.MODULEBARCODE = MTM.MODULEBARCODE  ");
        sql.append("LEFT JOIN MD_CRAFT MC ON MC.ID = MTM.CRAFTID  ");
        sql.append("    LEFT JOIN EMPLOYEE_INFO EI ON EI.ID = MTM.EMPID  ");

        return Db.find(sql.toString(), partBarcode);
    }
}
