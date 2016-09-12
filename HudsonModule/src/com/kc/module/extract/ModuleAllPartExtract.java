package com.kc.module.extract;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.dao.ExtractDao;
import com.kc.module.model.ModuleProcessInfo;
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.StringUtils;

public class ModuleAllPartExtract extends ExtractDao {

    public double getRate() {
        return rate;
    }

    public void setRate(double rate) {
        this.rate = (rate > 1 ? 1 : rate);
    }

    // 设置已经完成加工时间而未完成加工的零件为标准时间的完成百分比
    private double rate;

    @SuppressWarnings("unchecked")
    @Override
    public Object extract() {

        String resumeid = this.getController().getPara("resumeid");
        boolean used = this.getController().getParaToBoolean("used");
        boolean chk = this.getController().getParaToBoolean("chk");

        if (StringUtils.isEmpty(resumeid)) {
            return new ArrayList<ModuleProcessInfo>();
        }

        Map<String, TaskInfo> parts = new HashMap<String, TaskInfo>();

        StringBuilder builder = new StringBuilder();

        // 获取零件查询数据集合
        List<Record> queryList = new ArrayList<Record>();

        if (!used) {

            ModulePartProgressExtract mppe = new ModulePartProgressExtract();

            mppe.setRate(this.getRate());
            mppe.setController(this.getController());

            parts = (Map<String, TaskInfo>) mppe.extract();

            builder.append("SELECT * FROM (SELECT MPI.ID AS MID,MPI.ISFIXED,MPI.ISMAJOR,MPF.ID AS FID,MPL.PARTLISTCODE,MPI.PARTBARLISTCODE,MPI.MODULERESUMEID, MP.CNAMES AS PARTNAME, NVL(PO.OUTGUESTNAME,RD.NAME) AS REGIONNAME ");
            builder.append(", MPS.NAME AS STATENAME, DD.BATCHNO, NVL(PO.OUTCRAFTNAME, MC.CRAFTNAME) AS CRAFTNAME, NVL(PO.OUTCRAFTCODE, MC.CRAFTCODE) AS CRAFTCODE , MPI.ACTIONTIME, ");
            builder.append("TO_CHAR(PO.PLANBACKTIME,'yyyy/mm/dd') AS PLANBACKTIME,(SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END FROM MD_EST_SCHEDULE WHERE MODULERESUMEID = MPI.MODULERESUMEID         ");
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
            if (!chk) {
                builder.append("WHERE ECOUNT > 0");
            }

            builder.append(" ORDER BY ECOUNT DESC,PARTLISTCODE");

            queryList = Db.find(builder.toString(), resumeid, "0");
        } else {
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
            builder.append("        ) AS SCHER FROM (SELECT DISTINCT RSMID,PARTBARLISTCODE ");
            builder.append(" FROM MD_PROCESS_RESUME WHERE RSMID = ?) MPS LEFT JOIN MD_RESUME_RECORD MRR ON MPS.RSMID = MRR.ID ");
            builder.append(" LEFT JOIN MD_PART_LIST MPL ON MPS.PARTBARLISTCODE = MPL.PARTBARLISTCODE ");
            builder.append(" LEFT JOIN MD_PROCESS_FINISH MPF ON MRR.ID = MPF.MODULERESUMEID ");
            builder.append(" AND MPS.PARTBARLISTCODE = MPF.PARTBARLISTCODE ORDER BY PARTLISTCODE ");

            queryList = Db.find(builder.toString(), resumeid);
        }

        for (Record record : queryList) {
            String partbarlistcode = record.getStr("PARTBARLISTCODE");
            // =============================================================================================================

            if (!StringUtils.isEmpty(partbarlistcode) && parts.containsKey(partbarlistcode)) {
                TaskInfo ts = parts.get(partbarlistcode);

                double real = (ts.isFinish() ? 100 : (ts.getTotaltime() == 0 ? 0 : (ts.getFinishtime() / ts.getTotaltime() * 100)));
                record.set("PER", ArithUtils.round(real, 1));
            }

            // 设置完工状态为100%
            if (used) {
                record.set("PER", 100);
            }
        }

        return queryList;
    }
}
