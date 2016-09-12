package com.kc.module.transaction;

import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.Date;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.base.Barcode;
import com.kc.module.base.RegularState;
import com.kc.module.dao.BaseIAtom;
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.ControlUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.StringUtils;

public class ManageDesignResumeIAtom extends BaseIAtom {

    @Override
    public boolean run() throws SQLException {
        try {
            boolean append = this.getController().getParaToBoolean("append");
            // 模具唯一号
            String modulebarcode = this.getController().getPara("modulebarcode");
            // 设计履历唯一号
            String id = this.getController().getPara("id");
            // 打和担当
            String takeon = this.getController().getPara("takeon");
            // 设计担当
            String deviser = this.getController().getPara("deviser");
            // 修模单号
            String repairno = this.getController().getPara("repairno");
            // 设计备注
            String remark = this.getController().getPara("remark");
            // 是否属于新模修正
            boolean amend = !StringUtils.isEmpty(this.getController().getPara("amend"));

            // 设置项目小组，如果小组为空则返回
            String groupid = this.getController().getPara("groupid");
            if (StringUtils.isEmpty(groupid)) {
                this.setMsg("请选择项目小组");
                return false;
            }

            String empid = ControlUtils.getEmpBarCode(this.getController());

            StringBuilder builder = new StringBuilder();

            builder.append("SELECT ML.MODULEBARCODE,(SELECT COUNT(*) FROM DS_RESUME WHERE MODULEBARCODE = ML.MODULEBARCODE) AS RCOUNT,");
            builder.append("(SELECT ID FROM MD_RESUME WHERE MODULEBARCODE = ML.MODULEBARCODE) AS MRID, ");
            builder.append("(SELECT ID FROM DS_RESUME WHERE MODULEBARCODE = ML.MODULEBARCODE) AS DRID ");
            builder.append("FROM MODULELIST ML WHERE ML.MODULEBARCODE = ? AND ML.MODULESTATE = ?");

            Record record = Db.findFirst(builder.toString(), modulebarcode, 0);
            // 模具资料不存在或者已经报废了
            if (record == null) {
                this.setMsg("模具资料已经不存在了");
                return false;
            }

            // 获取模具生产加工履历ID
            String mrid = record.getStr("MRID");
            String drid = record.getStr("DRID");

            boolean result = false;

            Timestamp t_start = getStamp("startdate"), t_end = getStamp("enddate"), t_order = getStamp("orderdate"), t_due = getStamp("duedate");

            if (t_start != null && t_end != null) {
                if (t_start.getTime() > t_end.getTime()) {
                    this.setMsg("计划开始时间不能大于结束时间");
                    return false;
                }
            }

            if (t_order != null && t_due != null) {
                if (t_order.getTime() > t_due.getTime()) {
                    this.setMsg("订单日期不能大于纳期");
                    return false;
                }
            }

            if (append) {
                int rcount = ArithUtils.toInt(record.getNumber("RCOUNT"), 0);
                if (rcount > 0) {
                    this.setMsg("该模具的设计计划中在进行中");
                    return false;
                }

                record = new Record();
                record.set("ID", Barcode.DS_RESUME.nextVal())
                      .set("MODULEBARCODE", modulebarcode)
                      .set("STATEID", RegularState.MODULE_RESUME_MEND.getIndex())
                      .set("STARTDATE", t_start)
                      .set("ENDDATE", t_end)
                      .set("TAKEON", takeon)
                      .set("MODULERESUMEID", mrid)
                      .set("EMPID", empid)
                      .set("ACTIONTIME", DateUtils.getNowStampTime())
                      .set("REPAIRNO", repairno)
                      .set("REMARK", StringUtils.trimBlank(remark, null))
                      .set("ORDERDATE", t_order)
                      .set("DUEDATE", t_due)
                      .set("WORKSTATE", RegularState.DESIGN_RESUME_READY.getIndex())
                      .set("DEVISER", deviser)
                      .set("GROUPID", groupid)
                      .set("AMEND", amend ? 1 : 0);

                result = Db.save("DS_RESUME", record);
                if (!result) {
                    this.setMsg("保存设计履历失败");
                    return false;
                }

                result = Db.save("DS_RESUME_RECORD", record);
                if (!result) {
                    this.setMsg("保存设计履历失败");
                    return false;
                }
            } else {
                if (StringUtils.isEmpty(id)) {
                    this.setMsg("没有可更新的设计计划");
                    return false;
                }

                record = new Record();
                record.set("ID", id)
                      .set("STARTDATE", t_start)
                      .set("ENDDATE", t_end)
                      .set("TAKEON", takeon)
                      .set("REPAIRNO", repairno)
                      .set("REMARK", StringUtils.trimBlank(remark, null))
                      .set("ORDERDATE", t_order)
                      .set("DUEDATE", t_due)
                      .set("DEVISER", deviser)
                      .set("GROUPID", groupid);

                // 如果设计履历
                if (!StringUtils.isEmpty(drid)) {
                    result = Db.update("DS_RESUME", record);
                    if (!result) {
                        this.setMsg("保存设计履历失败");
                        return false;
                    }
                }

                result = Db.update("DS_RESUME_RECORD", record);
                if (!result) {
                    this.setMsg("保存设计履历失败");
                    return false;
                }
            }

            return true;
        }
        catch (Exception e) {
            return false;
        }
    }

    /**
     * 将日期格式转化为ORACLE时间格式
     * 
     * @param para
     * @return
     */
    private Timestamp getStamp(String para) {
        String sdate = this.getController().getPara(para);
        if (!StringUtils.isEmpty(sdate)) {
            Date tdate = this.getController().getParaToDate(para);
            return DateUtils.parseTimeStamp(tdate);
        }

        return (null);
    }
}
