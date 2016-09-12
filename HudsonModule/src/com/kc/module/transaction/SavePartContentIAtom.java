package com.kc.module.transaction;

import java.sql.SQLException;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.dao.BaseIAtom;
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.StringUtils;

public class SavePartContentIAtom extends BaseIAtom {

    @Override
    public boolean run() throws SQLException {
        String partbarlistcode = this.getController().getPara("partbarlistcode");
        if (StringUtils.isEmpty(partbarlistcode)) {
            this.setMsg("零件编号不能为空!");
            return false;
        }

        boolean result = false;

        String partbarcode = this.getController().getPara("partbarcode");
        String material = StringUtils.parseString(this.getController().getPara("material"));
        String piccode = StringUtils.parseString(this.getController().getPara("piccode"));
        String hardness = StringUtils.parseString(this.getController().getPara("hardness"));
        String buffing = StringUtils.parseString(this.getController().getPara("buffing"));
        String tolerance = StringUtils.parseString(this.getController().getPara("tolerance"));
        int materialsrc = this.getController().getParaToInt("materialsrc");
        int materialtype = this.getController().getParaToInt("materialtype");
        int reform = ArithUtils.parseIntNumber(this.getController().getPara("reform"), 0);
        String remark = StringUtils.parseString(this.getController().getPara("remark"));

        Record record = new Record();
        record.set("PARTBARCODE", partbarcode).set("MATERIAL", material);
        result = Db.update("MD_PART", "PARTBARCODE", record);
        if (!result) {
            this.setMsg("保存零件资料失败!");
            return false;
        }

        record = new Record();
        record.set("PARTBARLISTCODE", partbarlistcode)
              .set("PICCODE", piccode)
              .set("HARDNESS", hardness)
              .set("BUFFING", buffing)
              .set("MATERIALSRC", materialsrc)
              .set("MATERIALTYPE", materialtype)
              .set("REFORM", reform)
              .set("REMARK", remark)
              .set("TOLERANCE", tolerance);
        result = Db.update("MD_PART_LIST", "PARTBARLISTCODE", record);
        if (!result) {
            this.setMsg("保存零件资料失败!");
            return false;
        }
        
        return true;
    }

}
