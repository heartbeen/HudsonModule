package com.kc.module.transaction;

import java.sql.SQLException;

import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.IAtom;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.utils.StringUtils;

/**
 * 用于单个或者合并部号的工件的数量
 * 
 * @author ROCK
 * 
 */
public class ModifyPartCountIAtom implements IAtom {

    public Controller getController() {
        return controller;
    }

    public void setController(Controller controller) {
        this.controller = controller;
    }

    public int getFlag() {
        return flag;
    }

    public void setFlag(int flag) {
        this.flag = flag;
    }

    private Controller controller;
    private int flag;

    // private final String VAL_SIGN = "-";
    private final String VAL_FORE = "(";
    private final String VAL_BACK = ")";

    @Override
    public boolean run() throws SQLException {

        try {
            String partid = this.controller.getPara("pcode");
            // 如果前台传送的数据为空,则返回-1
            if (StringUtils.isEmpty(partid)) {
                this.setFlag(-1);
                return false;
            }

            // 如果工件数量小于2,则返回提示
            int pcount = this.controller.getParaToInt("pcount");
            if (pcount < 1 || pcount > 200) {
                this.setFlag(-2);
                return false;
            }

            StringBuilder builder = new StringBuilder();

            builder.append("SELECT MPL.PARTBARCODE, MPL.PARTBARLISTCODE, MPL.PARTLISTCODE  ");
            builder.append(",MP.PARTCODE, MPL.ISDIVIED, MP.QUANTITY AS PTY, MPL.QUANTITY AS LTY ");
            builder.append("FROM MD_PART_LIST MPL LEFT JOIN MD_PART MP ON MPL.PARTBARCODE = MP.PARTBARCODE ");
            builder.append("WHERE MPL.PARTBARLISTCODE = ?   AND MPL.ISENABLE = 0 ");

            Record record = Db.findFirst(builder.toString(), partid);
            if (record == null) {
                this.setFlag(-3);
                return false;
            }

            // 0为合并1为区分
            int isDiv = getIntNumber(record.getNumber("ISDIVIED"), 0);
            if (isDiv > 0) {
                this.setFlag(-3);
                return false;
            }

            // 全部数量
            int totalCount = getIntNumber(record.getNumber("PTY"), 0);
            // 零件数量
            int unitCount = getIntNumber(record.getNumber("LTY"), 0);

            int fcount = totalCount - unitCount + pcount;

            String partcode = StringUtils.parseString(record.get("PARTCODE"));
            String partbarcode = StringUtils.parseString(record.get("PARTBARCODE"));

            String mergecode = (pcount == 1 ? partcode : partcode + VAL_FORE + pcount + VAL_BACK);

            record = new Record();
            record.set("PARTBARLISTCODE", partid).set("PARTLISTCODE", mergecode).set("PARTROOTCODE", mergecode).set("QUANTITY", pcount);

            boolean isUpdate = Db.update("MD_PART_LIST", "PARTBARLISTCODE", record);
            if (!isUpdate) {
                this.setFlag(-4);
                return false;
            }

            // ======================修改MD_PART的数量===================================
            record = new Record();
            record.set("PARTBARCODE", partbarcode).set("QUANTITY", fcount);

            isUpdate = Db.update("MD_PART", "PARTBARCODE", record);
            if (!isUpdate) {
                this.setFlag(-4);
                return false;
            }

            this.setFlag(1);
            return true;
        }
        catch (Exception e) {
            this.setFlag(-5);
            return false;
        }
    }

    private int getIntNumber(Number num, int def) {
        return num == null ? def : num.intValue();
    }
}
