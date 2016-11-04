package com.kc.module.model;

import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.utils.StringUtils;

public class ModulePart extends ModelFinal<ModulePart> {

    /**
     * 
     */
    private static final long serialVersionUID = -4875854112666987229L;

    public static ModulePart dao = new ModulePart();

    public List<ModulePart> getModulePartList(String moduleBarcode) {
        String sql = "".concat("SELECT P.PARTLISTBARCODE,ML.MODULECODE,P.PARTLISTCODE,P.QUANTITY　")
                       .concat("FROM MD_PART_LIST P,MODULELIST ML WHERE P.ISCOLLECT <>'1' ")
                       .concat("AND ML.MODULEBARCODE=P.MODULEBARCODE AND ML.MODULEBARCODE=? ")
                       .concat("ORDER BY P.PARTLISTBARCODE");

        return dao.find(sql, moduleBarcode);
    }

    /**
     * 通过模具履历ID得到相应要加工的工件信息
     * 
     * @param moduleResumeId
     *            模具履历ID
     * @return
     */
    public List<ModulePart> moduleResumePart(String moduleResumeId, String query) {
        StringBuilder sql = new StringBuilder();

        Object[] params = null;

        if (!StringUtils.isEmpty(query)) {
            sql.append("SELECT * FROM (");
        }
        // TODO - 可以做成视图和缓存
        sql.append("SELECT                                                                    ");
        sql.append("    MP.MODULERESUMEID ,MP.PARTBARCODE ,MPA.PARTCODE ,                     ");
        sql.append("    MPA.CNAMES ,MP.PARTBARLISTCODE ,MP.PARTLISTCODE ,                     ");
        sql.append("    MPS.NAME,(SELECT SUM(QUANTITY) FROM MD_PART_LIST WHERE PARTBARCODE = MPA.PARTBARCODE) AS QUANTITY, 'l',                                          ");
        sql.append("( SELECT CASE  WHEN COUNT(ID)>0 THEN 'craft-schedule-exits' ELSE ");
        sql.append("'craft-schedule-noexits' END FROM MD_EST_SCHEDULE WHERE PARTID=MP.PARTBARCODE AND MODULERESUMEID = ? ) cls");
        sql.append(" FROM ( SELECT                                                            ");
        sql.append("            MI.MODULERESUMEID ,MI.PARTBARLISTCODE ,                       ");
        sql.append("            MPL.PARTBARCODE ,MI.PARTSTATEID ,                             ");
        sql.append("            MPL.PARTLISTCODE                                              ");
        sql.append("        FROM                                                              ");
        sql.append("          MD_PART_LIST MPL LEFT JOIN MD_PROCESS_INFO MI                   ");
        sql.append("                ON MPL.PARTBARLISTCODE = MI.PARTBARLISTCODE               ");
        sql.append("            WHERE MI.MODULERESUMEID = ? AND MPL.ISENABLE=0  AND MPL.ISFIXED = 0 ");
        sql.append("    ) MP LEFT JOIN MD_PART MPA                                            ");
        sql.append("        ON MPA.PARTBARCODE = MP.PARTBARCODE LEFT JOIN MD_PROCESS_STATE MPS");
        sql.append("        ON MPS.ID = MP.PARTSTATEID ORDER BY MP.PARTBARLISTCODE            ");

        if (!StringUtils.isEmpty(query)) {
            sql.append(") WHERE PARTCODE LIKE ?||'%'");
            params = new Object[]{moduleResumeId, moduleResumeId, query};

        } else {
            params = new Object[]{moduleResumeId, moduleResumeId};
        }

        return find(sql.toString(), params);
    }

    /**
     * 查询模具是否要测量的工件清单
     * 
     * @param moduleBarcode
     *            模具条码
     * @param measure
     *            模具工件是否要测量 1:要测量,0:不要测量
     * @return
     */
    public List<Record> findMeasureListForModule(String moduleBarcode, int measure) {
        StringBuilder sql = new StringBuilder();

        sql.append("SELECT PARTCODE || '(' || CNAMES || '[' || QUANTITY || '件])' AS TEXT,");
        sql.append("PARTBARCODE, MODULEBARCODE, PARTCODE FROM MD_PART ");
        sql.append("WHERE MODULEBARCODE = ?  AND MEASURE=?");

        return Db.find(sql.toString(), moduleBarcode, measure);
    }

    /**
     * 根据模具工号,查询工件
     * 
     * @param moduleBarcode
     * @param measure
     * @return
     */
    public List<ModulePart> findModulePartData(String moduleBarcode) {
        return find("SELECT t.partbarcode,t.partcode|| '/' || t.cnames || '/' || t.material as partData FROM  MD_PART t where t.modulebarcode=?",
                    moduleBarcode);
    }

    /**
     * 通过模具工号和工件工编号得到工件信息
     * 
     * @param partCode
     * @param moduleBarcode
     * @return
     */
    public ModulePart findPartFromPartCode(String moduleBarcode, String partCode) {
        return findFirst("SELECT PARTBARCODE FROM MD_PART  WHERE PARTCODE=? AND MODULEBARCODE=?", partCode, moduleBarcode);
    }

}
