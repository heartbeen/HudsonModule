package com.kc.module.extract;

import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.dao.ExtractDao;
import com.kc.module.model.form.ModulePartMessageForm;
import com.kc.module.utils.StringUtils;

public class ModulePartInfoExtract extends ExtractDao {

    @Override
    public Object extract() {

        // 声明用于返回数据的缓存类
        ModulePartMessageForm mpmf = new ModulePartMessageForm();
        try {
            // 是否统计标准件
            // boolean chk = this.getController().getParaToBoolean("chk");
            boolean init = this.getController().getParaToBoolean("init");
            // 模具唯一编号
            String modulebarcode = this.getController().getPara("modulebarcode");
            // 模具加工履历号
            String resumeid = this.getController().getPara("resumeid");
            // 日期格式
            String format = this.getController().getPara("format");
            // 模具履历代号格式
            String style = this.getController().getPara("style");
            // 选中的模具加工履历索引
            int selIndex = this.getController().getParaToInt("index");
            // 用于存取查询结果集的List
            List<Record> queryList = null, resumeList = null;

            String columnValue = null;

            StringBuilder builder = new StringBuilder();

            builder.append("SELECT MRR.ID, MRR.MODULEBARCODE, MRR.RESUMESTATE, MPS.NAME AS RESUMENAME,TO_CHAR(MRR.STARTTIME, ?) || ' | ' || MPS.NAME AS RCODE,TO_CHAR(MRR.FINISHTIME, ?) AS FINISHTIME,");
            builder.append("TO_CHAR(MRR.STARTTIME, ?) AS STARTTIME, TO_CHAR(MRR.ENDTIME, ?) AS ENDTIME, TO_CHAR(MRR.PROCESSED, ?) AS PROCESSED, MRR.DEVISER,");
            builder.append("MRR.INSTALLER, MR.ID AS MRID, ML.MODULECODE, ML.GUESTCODE FROM MD_RESUME_RECORD MRR LEFT JOIN MD_RESUME MR ON MRR.ID = MR.ID ");
            builder.append("LEFT JOIN MODULELIST ML ON MRR.MODULEBARCODE = ML.MODULEBARCODE LEFT JOIN MD_PROCESS_STATE MPS ON MRR.RESUMESTATE = MPS.ID ");
            builder.append("LEFT JOIN FACTORY FY ON ML.GUESTID = FY.ID ");

            if (init) {
                builder.append("WHERE MRR.MODULEBARCODE = ? ORDER BY MRR.RESUMETIME DESC");
                columnValue = modulebarcode;
            } else {
                builder.append("WHERE MRR.ID = ? ORDER BY MRR.RESUMETIME DESC");
                columnValue = resumeid;
            }

            resumeList = Db.find(builder.toString(), style, format, format, format, format, columnValue);
            if (resumeList.size() == 0) {
                mpmf.setSuccess(false);
                mpmf.setMsg("没有该模具的加工讯息!");

                return mpmf;
            }

            // 模具履历ID号
            resumeid = getRecordStringValue(resumeList, selIndex, "ID");
            // 模具是否处于加工状态的履历ID号
            String mrid = getRecordStringValue(resumeList, selIndex, "MRID");

            String selectId = null;

            builder = new StringBuilder();

            if (!StringUtils.isEmpty(mrid)) {

                selectId = mrid;

                builder.append("SELECT * FROM (SELECT MPI.ID AS MID,MPI.ISFIXED,MPI.ISMAJOR,MPF.ID AS FID,MPL.PARTLISTCODE,MPI.PARTBARLISTCODE,MPI.MODULERESUMEID, MP.CNAMES AS PARTNAME, NVL(PO.OUTGUESTNAME,RD.NAME) AS REGIONNAME ");
                builder.append(", MPS.NAME AS STATENAME, DD.BATCHNO, NVL(PO.OUTCRAFTNAME, MC.CRAFTNAME) AS CRAFTNAME, NVL(PO.OUTCRAFTCODE, MC.CRAFTCODE) AS CRAFTCODE , MPI.ACTIONTIME, ");
                builder.append("TO_CHAR(PO.PLANBACKTIME,'yyyy/mm/dd') AS PLANBACKTIME, (SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END FROM MD_EST_SCHEDULE WHERE MODULERESUMEID = MPI.MODULERESUMEID ");
                builder.append(" AND PARTID = MPI.PARTBARLISTCODE) AS ECOUNT,EI.EMPNAME, (SELECT REPLACE(WMSYS.WM_CONCAT(TMC.CRAFTCODE),',',' → ') FROM (SELECT * FROM MD_EST_SCHEDULE ORDER BY RANKNUM) ");
                builder.append(" MES LEFT JOIN MD_CRAFT TMC ON MES.CRAFTID = TMC.ID WHERE TYPEID IS NULL AND MES.MODULERESUMEID = MPI.MODULERESUMEID AND MES.PARTID = MPI.PARTBARLISTCODE) AS SCHER,");
                builder.append("(SELECT REMARK FROM MD_PART_SECTION WHERE ID = (SELECT MAX(ID) FROM MD_PART_SECTION WHERE PARTBARLISTCODE = MPI.PARTBARLISTCODE)) AS REMARK FROM MD_PROCESS_INFO MPI ");
                builder.append("LEFT JOIN MD_PROCESS_RESUME MPR ON MPI.CURSORID = MPR.ID LEFT JOIN MD_PART_LIST MPL ON MPI.PARTBARLISTCODE = MPL.PARTBARLISTCODE  ");
                builder.append("LEFT JOIN MD_PART MP ON MPL.PARTBARCODE = MP.PARTBARCODE                 ");
                builder.append("LEFT JOIN MD_PROCESS_STATE MPS ON MPI.PARTSTATEID = MPS.ID               ");
                builder.append("LEFT JOIN REGION_DEPART RD ON MPI.CURRENTDEPTID = RD.ID                  ");
                builder.append("LEFT JOIN DEVICE_DEPART DD ON MPI.DEVICEPARTID = DD.ID                   ");
                builder.append("LEFT JOIN MD_CRAFT MC ON MC.ID = DD.CRAFTID LEFT JOIN EMPLOYEE_INFO      ");
                builder.append("EI ON MPR.LEMPID = EI.ID LEFT JOIN PART_OUTBOUND PO ON MPR.OUTID = PO.ID LEFT JOIN MD_PROCESS_FINISH MPF ON MPI.ID = MPF.MID ");
                builder.append(" WHERE MPI.MODULERESUMEID = ? AND MPL.ISENABLE = ?)");

                // 如果TRUE为显示标准件
                // if (!chk) {
                // builder.append("WHERE ECOUNT > 0");
                // }

                builder.append(" ORDER BY ECOUNT DESC,PARTLISTCODE");

                queryList = Db.find(builder.toString(), resumeid, "0");
            } else {

                selectId = resumeid;

                builder.append("SELECT MRR.ID AS MODULERESUMEID, MRR.FINISHTIME, MPS.PARTBARLISTCODE, MPL.PARTLISTCODE, '/' AS BATCHNO ");
                builder.append("    , '/' AS STATENAME, '/' AS REGIONNAME, '/' AS CRAFTNAME, '' AS CRAFTCODE, '/' AS EMPNAME ");
                builder.append("    , NVL(MPF.FINISHDATE, MRR.FINISHTIME) AS ACTIONDATE, '' AS PLANBACKTIME, ( ");
                builder.append("        SELECT REPLACE(WMSYS.WM_CONCAT(TMC.CRAFTCODE), ',', ' → ') ");
                builder.append("        FROM ( ");
                builder.append("            SELECT * ");
                builder.append("            FROM MD_EST_SCHEDULE ");
                builder.append("            ORDER BY RANKNUM ");
                builder.append("        ) MES ");
                builder.append("            LEFT JOIN MD_CRAFT TMC ON MES.CRAFTID = TMC.ID  ");
                builder.append("        WHERE TYPEID IS NULL ");
                builder.append("            AND MES.MODULERESUMEID = MRR.ID ");
                builder.append("            AND MES.PARTID = MPS.PARTBARLISTCODE ");
                builder.append("        ) AS SCHER ");
                builder.append("FROM (SELECT DISTINCT RSMID,PARTBARLISTCODE FROM MD_PROCESS_RESUME WHERE RSMID = ?) MPS LEFT JOIN MD_RESUME_RECORD MRR ");
                builder.append("ON MPS.RSMID = MRR.ID LEFT JOIN MD_PART_LIST MPL ON MPS.PARTBARLISTCODE = MPL.PARTBARLISTCODE LEFT JOIN MD_PROCESS_FINISH ");
                builder.append("MPF ON MRR.ID = MPF.MODULERESUMEID AND MPS.PARTBARLISTCODE = MPF.PARTBARLISTCODE ORDER BY PARTLISTCODE ");

                queryList = Db.find(builder.toString(), resumeid);
            }

            mpmf.setSelIndex(selectId);
            mpmf.setResumeList(resumeList);
            mpmf.setQueryList(queryList);
            mpmf.setSuccess(true);
        }
        catch (Exception e) {
            mpmf.setSuccess(false);
            mpmf.setMsg("读取模具资料失败!");
        }

        return mpmf;
    }

    private String getRecordStringValue(List<Record> records, int index, String column) {
        return records.get(index).getStr(column);
    }

}
