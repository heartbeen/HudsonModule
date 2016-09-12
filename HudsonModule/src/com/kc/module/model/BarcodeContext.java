package com.kc.module.model;

import java.util.List;

import com.jfinal.kit.StrKit;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;

/**
 * 条码所要打印的内容格式
 * 
 * @author David
 * @email xuweissh@163.com
 * 
 */
public class BarcodeContext extends ModelFinal<BarcodeContext> {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;
    public static BarcodeContext dao = new BarcodeContext();

    /**
     * 根据模块ID得到相应模块所可以打印的条码内容
     * 
     * @param moduleId
     *            模块ID
     * @return
     */
    public List<Record> findBarcodeContextForModule(String moduleId, String barTypeId) {
        StringBuilder sql = new StringBuilder();

        sql.append("SELECT BT.BARNAME, BT.BARTYPEID, BC.ID AS CONTEXTID, BC.PRINTNAME, BC.PRINTCOL ");
        sql.append("    , BC.PRINTTYPE, BC.XSEAT, BC.YSEAT, BC.PRINTWIDTH, BC.PRINTHEIGHT ");
        sql.append("    , BC.BARCODETYPE, BC.RECTLINE, BC.RECTLINEWIDTH, BC.FONTSIZE ,");
        sql.append("BC.PRINTTEXT FROM BARCODE_TYPE BT ");
        sql.append("    LEFT JOIN BARCODE_CONTEXT BC ON BC.BARTYPEID = BT.BARTYPEID  ");
        sql.append("WHERE BT.MODULEID = ? ");

        if (StrKit.notBlank(barTypeId)) {
            sql.append("AND BC.BARTYPEID='").append(barTypeId).append("'");
        }
        
        sql.append(" ORDER BY BT.BARTYPEID ,BC.ID");

        return Db.find(sql.toString(), moduleId);
    }
}
