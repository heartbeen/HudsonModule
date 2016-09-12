package com.kc.module.model;

import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Page;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.utils.DBUtils;
import com.kc.module.utils.StringUtils;

public class ModulePartList extends ModelFinal<ModulePartList> {
    /**
     * 
     */
    private static final long serialVersionUID = 1L;
    public static ModulePartList dao = new ModulePartList();

    /**
     * 查找模具的工件清单
     * 
     * @param moduleBarcode
     * @return
     */
    public List<ModulePartList> modulePartList(String moduleBarcode) {
        StringBuilder sql = new StringBuilder();

        sql.append("SELECT p.*, d.CNAMES, mp.ID infoid, mp.REMARK FROM (SELECT m.PARTBARLISTCODE, m.PARTLISTCODE, ");
        sql.append("m.PARTBARCODE FROM md_part_list m WHERE m.MODULEBARCODE = ? ) p LEFT JOIN md_part d ");
        sql.append("ON d.PARTBARCODE = p.PARTBARCODE LEFT JOIN md_process_info mp ON ");
        sql.append("mp.PARTBARLISTCODE = p.PARTBARLISTCODE ORDER BY p.PARTLISTCODE");

        return find(sql.toString(), moduleBarcode);
    }

    /**
     * 得到要打印条码的工件
     * 
     * @param moduleBarcode
     * @return
     */
    public List<ModulePartList> findPartBarcode(String moduleBarcode) {
        StringBuilder sql = new StringBuilder();
        sql.append("SELECT ML.MODULECODE , MPL.PARTLISTCODE , MPL.PARTBARLISTCODE ");
        sql.append("FROM MD_PART_LIST MPL , MODULELIST ML ");
        sql.append("WHERE MPL.MODULEBARCODE = ? AND ML.MODULEBARCODE = MPL.MODULEBARCODE ");
        sql.append("AND MPL.ISENABLE = 0 ORDER BY MPL.PARTBARLISTCODE");

        return find(sql.toString(), moduleBarcode);
    }

    /**
     * 分页得到要加工工件的信息
     * 
     * @param moduleResumeId
     * @param page
     * @param start
     * @param limit
     * @return
     */
    public Page<Record> findProcessPart(Object moduleResumeId, int page, int start, int limit, Object pcode, boolean chk) {
        StringBuilder sqlExceptSelect = new StringBuilder();

        String sql = "SELECT MPI.PARTBARLISTCODE,(SELECT REMARK FROM MD_PART_SECTION WHERE ID = (SELECT MAX(ID) FROM MD_PART_SECTION WHERE PARTBARLISTCODE = MPI.PARTBARLISTCODE)) AS"
                     + " REMARK,(CASE WHEN MP.CNAMES IS NULL THEN MPL.PARTLISTCODE ELSE (MPL.PARTLISTCODE || '(' || MP.CNAMES || ')') END) AS PARTNAME ";

        sqlExceptSelect.append("FROM ");

        if (!chk) {
            sqlExceptSelect.append("(SELECT * FROM (SELECT AA.*,(SELECT COUNT(*) FROM  MD_EST_SCHEDULE ");
            sqlExceptSelect.append("WHERE MODULERESUMEID = AA.MODULERESUMEID  AND PARTID = AA.PARTBARLISTCODE ");
            sqlExceptSelect.append(") AS ECOUNT FROM MD_PROCESS_INFO AA) WHERE ECOUNT > 0)");

        } else {
            sqlExceptSelect.append("MD_PROCESS_INFO");
        }

        sqlExceptSelect.append(" MPI , MD_PART_LIST MPL, MD_PART MP ");
        sqlExceptSelect.append("WHERE MPI.MODULERESUMEID = '").append(moduleResumeId);

        // 如果工件编号不为空,则表示要搜索工件编号的排程
        if (!StringUtils.isEmpty(pcode)) {
            sqlExceptSelect.append("' AND MPL.PARTLISTCODE LIKE '").append(pcode).append("%");
        }

        sqlExceptSelect.append("'    AND MPL.PARTBARLISTCODE = MPI.PARTBARLISTCODE ");
        sqlExceptSelect.append("    AND MP.PARTBARCODE = MPL.PARTBARCODE ORDER BY MPI.PARTBARLISTCODE");

        return Db.paginate(page, limit, sql, sqlExceptSelect.toString());
    }

    /**
     * 得到模具履历相应要加工工件的信息
     * 
     * @param moduleResumeId
     * @return
     */
    public List<Record> findProcessPart(Object moduleResumeId) {
        StringBuilder sql = new StringBuilder();
        sql.append("SELECT MPI.PARTBARLISTCODE,                                   ");
        sql.append("(CASE WHEN MP.CNAMES IS NULL THEN MPL.PARTLISTCODE ELSE MPL.PARTLISTCODE || '(' || MP.CNAMES || ')' END) AS PARTNAME");
        sql.append("  FROM MD_PROCESS_INFO MPI, MD_PART_LIST MPL, MD_PART MP      ");
        sql.append(" WHERE MPI.MODULERESUMEID = ?                                 ");
        sql.append("       AND MPL.PARTBARLISTCODE = MPI.PARTBARLISTCODE          ");
        sql.append("       AND MP.PARTBARCODE = MPL.PARTBARCODE                   ");
        sql.append(" ORDER BY MPI.PARTBARLISTCODE                                 ");

        return Db.find(sql.toString(), moduleResumeId);
    }

    public List<ModulePartList> findPartList(List<String> mlist) {
        String sql = "SELECT * FROM MD_PART_LIST WHERE ISENABLE = '0' AND MODULEBARCODE IN " + DBUtils.sqlIn(mlist);
        return this.find(sql);
    }

    /**
     * 获取模具的工件讯息
     * 
     * @param mbarid
     * @return
     */
    public List<ModulePartList> getModulePartInformation(String mbarid) {
        StringBuilder builder = new StringBuilder();

        // builder.append("SELECT A.MODULEBARCODE, A.PARTBARCODE, A.PARTBARLISTCODE, A.PICCODE, TO_NUMBER(B.ISFIRMWARE) AS ISFIRMWARE, ");
        // builder.append("    A.MATERIALSRC, A.MATERIALTYPE, A.TOLERANCE, A.REFORM, A.BUFFING, ");
        // builder.append("A.PARTLISTCODE, A.PARTLISTBATCH AS PARTSUFFIX, A.MATERIALSRC, B.RACEID, B.PARTCODE  ");
        // builder.append(",A.HARDNESS, B.CNAMES AS PARTNAME, B.NORMS, B.MATERIAL, CASE WHEN C.ID        ");
        // builder.append(" IS NULL THEN 0 ELSE 1 END AS ISUSE, A.ISFIXED FROM MD_PART_LIST A            ");
        // builder.append("LEFT JOIN MD_PART B ON A.PARTBARCODE = B.PARTBARCODE LEFT JOIN     ");
        // builder.append(" (SELECT * FROM MD_PROCESS_INFO WHERE ISMAJOR = 1) C ON A.PARTBARLISTCODE = C.PARTBARLISTCODE WHERE  ");
        // builder.append("A.MODULEBARCODE = ? AND ");
        //
        // builder.append("A.ISENABLE = 0 ORDER BY A.PARTLISTCODE ");

        builder.append("SELECT MPL.MODULEBARCODE, MPL.PARTBARCODE, MPL.PARTBARLISTCODE, MPL.PICCODE, TO_NUMBER(MP.ISFIRMWARE) AS ISFIRMWARE ");
        builder.append("    , MPL.MATERIALSRC, MPL.MATERIALTYPE, MPL.TOLERANCE, MPL.REFORM, MPL.BUFFING ");
        builder.append("    , MPL.PARTLISTCODE, MPL.PARTLISTBATCH AS PARTSUFFIX, MPL.MATERIALSRC, MP.RACEID, MP.PARTCODE ");
        builder.append("    , MPL.HARDNESS, MP.CNAMES AS PARTNAME, MP.NORMS, MP.MATERIAL, CASE WHEN MPI.ID IS NULL THEN 0 ELSE 1 END AS ISUSE ");
        builder.append("    , MPL.ISFIXED, MPS.NAME AS PSTNAME, NVL(PO.OUTGUESTNAME, RD.NAME) AS DEPTNAME, MR.ID AS RID, DD.BATCHNO ");
        builder.append("    , EI.EMPNAME ");
        builder.append("FROM MD_PART_LIST MPL ");
        builder.append("LEFT JOIN MD_PART MP ON MPL.PARTBARCODE = MP.PARTBARCODE  ");
        builder.append("LEFT JOIN (SELECT * FROM MD_PROCESS_INFO WHERE ISMAJOR = 1) MPI ON MPL.PARTBARLISTCODE =   ");
        builder.append("MPI.PARTBARLISTCODE LEFT JOIN MD_PROCESS_STATE MPS ON MPI.PARTSTATEID = MPS.ID  ");
        builder.append("LEFT JOIN MD_PROCESS_RESUME MPR ON MPI.CURSORID = MPR.ID  ");
        builder.append("LEFT JOIN PART_OUTBOUND PO ON MPR.OUTID = PO.ID  ");
        builder.append("LEFT JOIN MD_RESUME MR ON MPL.MODULEBARCODE = MR.MODULEBARCODE  ");
        builder.append("LEFT JOIN REGION_DEPART RD ON MPI.CURRENTDEPTID = RD.ID  ");
        builder.append("LEFT JOIN DEVICE_DEPART DD ON MPI.DEVICEPARTID = DD.ID  ");
        builder.append("    LEFT JOIN EMPLOYEE_INFO EI ON DD.EMPID = EI.ID  ");
        builder.append("WHERE MPL.MODULEBARCODE = ? AND MPL.ISENABLE = 0 ORDER BY MPL.PARTLISTCODE ");

        return this.find(builder.toString(), mbarid);
    }

    /**
     * 获取模具加工履历范围内的加工零件的清单
     * 
     * @param resumeid
     * @return
     */
    public List<ModulePartList> getModuleProcessedDetails(String resumeid) {
        StringBuilder builder = new StringBuilder();

        builder.append("SELECT MEP.PARTID, MEP.MODULERESUMEID, MPL.PARTLISTCODE FROM (SELECT DISTINCT PARTID, ");
        builder.append("MODULERESUMEID FROM MD_EST_SCHEDULE WHERE MODULERESUMEID = ? ) MEP ");

        builder.append("LEFT JOIN MD_PART_LIST MPL ON MEP.PARTID = MPL.PARTBARLISTCODE ");
        builder.append("WHERE MPL.PARTBARLISTCODE IS NOT NULL ORDER BY MPL.PARTLISTCODE");

        return this.find(builder.toString(), resumeid);
    }

    /**
     * 获取零件的基本材料详情
     * 
     * @param partid
     * @return
     */
    public ModulePartList getPartContent(String partid) {
        StringBuilder builder = new StringBuilder();

        builder.append("SELECT MPL.PARTBARLISTCODE,MPL.PARTBARCODE,MP.MATERIAL,MPL.PICCODE, MPL.HARDNESS, MPL.BUFFING, MPL.TOLERANCE, MPL.MATERIALSRC , MPL.MATERIALTYPE, MPL.REFORM, ");
        builder.append("MPL.REMARK,(MPL.PICCODE || MPL.HARDNESS || MPL.BUFFING || MPL.TOLERANCE || MPL.REMARK) AS CONTENT  FROM MD_PART_LIST MPL ");
        builder.append("LEFT JOIN MD_PART MP ON MPL.PARTBARCODE = MP.PARTBARCODE WHERE MPL.PARTBARLISTCODE = ? AND MPL.ISENABLE = 0");

        return this.findFirst(builder.toString(), partid);
    }
}
