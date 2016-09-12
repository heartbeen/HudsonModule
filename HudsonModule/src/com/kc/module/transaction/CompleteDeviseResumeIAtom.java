package com.kc.module.transaction;

import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.base.Barcode;
import com.kc.module.base.RegularState;
import com.kc.module.dao.BaseIAtom;
import com.kc.module.model.DesignProcessInfo;
import com.kc.module.model.DesignResumeRecord;
import com.kc.module.model.DesignScheduleInfo;
import com.kc.module.model.ModuleList;
import com.kc.module.utils.ControlUtils;
import com.kc.module.utils.DataUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.StringUtils;

/**
 * 完成设计履历信息(包括完成、结案等)
 * 
 * @author ASUS
 * 
 */
public class CompleteDeviseResumeIAtom extends BaseIAtom {

    @Override
    public boolean run() throws SQLException {
        try {
            String resumeid = this.getController().getPara("resumeid");
            String modulecode = this.getController().getPara("modulecode");
            boolean finish = this.getController().getParaToBoolean("finish");

            String empid = ControlUtils.getEmpBarCode(this.getController());
            String deptid = ControlUtils.getDeptPosid(this.getController());

            if (StringUtils.isEmpty(resumeid)) {
                this.setMsg("设计履历信息不完善");
                return false;
            }

            // 设置设计履历状态
            String fstateid = RegularState.DESIGN_RESUME_FINISH.getIndex();
            String estateid = RegularState.DESIGN_RESUME_END.getIndex();
            String modulestate = (finish ? fstateid : estateid);

            // 完成状态和完结状态
            String m_finish_state = RegularState.DESIGN_SCHEDULE_FINISH.getIndex();
            String m_over_state = RegularState.DESIGN_SCHEDULE_OVER.getIndex();

            // 制程加工状态
            String m_sche_state = (finish ? m_finish_state : m_over_state);

            // 查询设计履历信息
            DesignResumeRecord drr = DesignResumeRecord.dao.findById(resumeid);
            if (drr == null) {
                this.setMsg("设计履历信息不完善");
                return false;
            }

            if (StringUtils.strInArray(new String[]{fstateid, estateid}, drr.getStr("WORKSTATE"))) {
                this.setMsg("设计履历已经完成或者结案");
                return false;
            }

            // 获取模具唯一号
            String modulebarcode = drr.getStr("MODULEBARCODE");
            // 获取模具状态
            String rstateid = drr.getStr("STATEID");
            // 订单开始日期
            Timestamp orderdate = drr.getTimestamp("ORDERDATE");
            // 订单纳期
            Timestamp duedate = drr.getTimestamp("DUEDATE");
            // 设计担当
            String deviser = drr.getStr("DEVISER");

            // 零件信息
            String[] states = {RegularState.DESIGN_SCHEDULE_FINISH.getIndex(), RegularState.DESIGN_SCHEDULE_OVER.getIndex()};
            // 查询设计制程排程信息
            List<DesignScheduleInfo> ldsi = DesignScheduleInfo.dao.getResumeScheduleInfo(resumeid);
            // 用于存放数据库查询的结果状态
            boolean result = false;
            Record zRecord = null;

            if (ldsi.size() > 0) {
                for (DesignScheduleInfo dsi : ldsi) {
                    String scheduleid = StringUtils.parseString(dsi.getStr("ID"));
                    String stateid = StringUtils.parseString(dsi.getStr("STATEID"));
                    // 如果状态为空则返回
                    if (StringUtils.isEmpty(stateid)) {
                        continue;
                    }

                    // 如果状态为完成或者完结跳过
                    if (StringUtils.strInArray(states, stateid)) {
                        continue;
                    }

                    // 如果状态为开工则提醒
                    if (stateid.equals(RegularState.DESIGN_SCHEDULE_PROCESS.getIndex())) {
                        this.setMsg("有制程正在设计中");
                        return false;
                    }

                    // 更新制程的加工状态
                    zRecord = new Record();
                    zRecord.set("ID", scheduleid).set("STATEID", m_sche_state);
                    result = Db.update("DS_SCHEDULE_INFO", zRecord);
                    if (!result) {
                        this.setMsg("更新制程资料信息失败");
                        return false;
                    }
                }
            }

            List<DesignProcessInfo> ldpi = DesignProcessInfo.dao.getProcessInfoByResume(resumeid);
            if (ldpi.size() > 0) {
                // 刷新DS_PROCESS_RESUME表的ID主键值
                Barcode.DS_PROCESS_RESUME.nextVal(true);
                // 获取当前ORACLE日期
                Timestamp nowStamp = DateUtils.getNowStampTime();
                for (DesignProcessInfo dpi : ldpi) {
                    //
                    String p_id = StringUtils.parseString(dpi.getStr("ID"));
                    String p_stateid = StringUtils.parseString(dpi.getStr("STATEID"));
                    String p_cursorid = StringUtils.parseString(dpi.getStr("CURSORID"));

                    // 如果状态为开工则提醒
                    if (p_stateid.equals(RegularState.DESIGN_SCHEDULE_PROCESS.getIndex())) {
                        this.setMsg("有制程正在设计中");
                        return false;
                    }

                    if (!StringUtils.isEmpty(p_cursorid)) {
                        zRecord = new Record();
                        zRecord.set("ID", p_cursorid).set("NSTATEID", m_sche_state).set("NRCDTIME", nowStamp);
                        result = Db.update("DS_PROCESS_RESUME", zRecord);
                        if (!result) {
                            this.setMsg("更新制程资料信息失败");
                            return false;
                        }
                    }

                    // 新增一条DS_PROCESS_RESUME表记录
                    zRecord = new Record();
                    zRecord.set("ID", Barcode.DS_PROCESS_RESUME.nextVal())
                           .set("DESIGNRESUMEID", dpi.getStr("DESIGNRESUMEID"))
                           .set("SCHEDULEID", dpi.getStr("SCHEDULEID"))
                           .set("EMPID", empid)
                           .set("LSTATEID", m_sche_state)
                           .set("LRCDTIME", nowStamp)
                           .set("NSTATEID", m_sche_state)
                           .set("NRCDTIME", nowStamp)
                           .set("POSID", deptid)
                           .set("ISTIME", 1);
                    result = Db.save("DS_PROCESS_RESUME", zRecord);
                    if (!result) {
                        this.setMsg("更新制程资料信息失败");
                        return false;
                    }

                    // 删除DS_PROCESS_INFO表的记录
                    result = Db.deleteById("DS_PROCESS_INFO", p_id);
                    if (!result) {
                        this.setMsg("删除制程资料信息失败");
                        return false;
                    }
                }
            }

            // 设置完工或者结案信息并且设置为已发图
            drr.set("WORKSTATE", modulestate).set("ACTUALEND", DateUtils.getNowStampTime()).set("ISIMG", 1);
            result = drr.update();
            if (!result) {
                this.setMsg("更新资料失败");
                return false;
            }

            result = Db.deleteById("DS_RESUME", resumeid);
            if (!result) {
                this.setMsg("更新资料失败");
                return false;
            }

            // 如果模具唯一号和模具社内编号都不为空则将其社内番号更新
            if (!StringUtils.isEmpty(modulebarcode) && rstateid.equals(RegularState.MODULE_RESUME_NEW.getIndex())) {
                // 判断社内番号的命名是否正确
                String moduleregex = DataUtils.getPropertyValue("config.properties", "moduleregex");
                if (!StringUtils.isRegex(moduleregex, modulecode)) {
                    this.setMsg("模具社内编号不合法");
                    return (false);
                }

                // 查询除了本模具之外的其他模具是否存在该社内编号
                Record moduleR = Db.findFirst("SELECT * FROM MODULELIST WHERE MODULESTATE = ? AND MODULECODE = ? AND MODULEBARCODE <> ?",
                                              0,
                                              modulecode,
                                              modulebarcode);
                if (moduleR != null) {
                    this.setMsg("输入的社内编号已经存在了");
                    return false;
                }

                ModuleList ml = new ModuleList();
                result = ml.set("MODULEBARCODE", modulebarcode).set("MODULECODE", modulecode.toUpperCase()).update();
                if (!result) {
                    this.setMsg("更新资料失败");
                    return false;
                }
            }

            // 查询MD_RESUME表中是否存在正在加工的新模履历，如果含有则返回
            Record resumeR = Db.findFirst("SELECT * FROM MD_RESUME WHERE MODULEBARCODE = ?", modulebarcode);
            if (RegularState.MODULE_RESUME_NEW.getIndex().equals(rstateid) && finish && resumeR == null) {

                String mloneid = Barcode.MODULE_RESUME.nextVal();

                Record mRecord = new Record();
                mRecord.set("ID", mloneid)
                       .set("MODULEBARCODE", modulebarcode)
                       .set("RESUMESTATE", rstateid)
                       .set("RESUMEEMPID", empid)
                       .set("STARTTIME", orderdate)
                       .set("DEVISER", deviser)
                       .set("ENDTIME", duedate)
                       .set("RESUMETIME", DateUtils.getNowStampTime());

                // 保存MD_RESUME_RECORD
                result = Db.save("MD_RESUME_RECORD", mRecord);
                if (!result) {
                    this.setMsg("模具设计完成失败");
                    return false;
                }

                // 更新MD_RESUME表
                mRecord = new Record();
                mRecord.set("ID", mloneid)
                       .set("MODULEBARCODE", modulebarcode)
                       .set("RESUMESTATE", rstateid)
                       .set("RESUMEEMPID", empid)
                       .set("STARTTIME", orderdate)
                       .set("DEVISER", deviser)
                       .set("ENDTIME", duedate)
                       .set("ISURGENT", 0);

                // 保存MD_RESUME
                result = Db.save("MD_RESUME", mRecord);
                if (!result) {
                    this.setMsg("模具设计完成失败");
                    return false;
                }
            }

            return true;
        }
        catch (Exception e) {
            this.setMsg("更新资料异常");
            return false;
        }
    }
}
