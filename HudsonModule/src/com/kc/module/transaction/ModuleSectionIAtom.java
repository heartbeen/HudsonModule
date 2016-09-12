package com.kc.module.transaction;

import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.IAtom;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.base.Barcode;
import com.kc.module.base.RegularState;
import com.kc.module.model.form.ModuleSectionForm;
import com.kc.module.model.form.PartSectionForm;
import com.kc.module.utils.ControlUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.JsonUtils;
import com.kc.module.utils.StringUtils;

/**
 * 保存工件的模具阶段加工讯息
 * 
 * @author Rock And David
 * 
 */
public class ModuleSectionIAtom implements IAtom {

    private Controller control;
    private int result;

    public int getResult() {
        return result;
    }

    public void setResult(int result) {
        this.result = result;
    }

    public Controller getControl() {
        return control;
    }

    public void setControl(Controller control) {
        this.control = control;
    }

    @Override
    public boolean run() throws SQLException {
        try {
            // 读取前台发送的参数讯息
            String paraData = this.control.getPara("secdata");
            // 将参数转化为bean
            ModuleSectionForm msf = JsonUtils.josnToBean(paraData, ModuleSectionForm.class);

            if (StringUtils.isEmpty(msf.getStateid())) {
                this.setResult(-10001);
                return (false);
            }

            Timestamp startdate = DateUtils.parseTimeStamp(msf.getStartdate());
            Timestamp enddate = DateUtils.parseTimeStamp(msf.getEnddate());
            String empid = ControlUtils.getEmpBarCode(this.getControl());
            // 如果日期格式解析后为空,则表示日期未输入完整
            if (startdate == null || enddate == null) {
                this.setResult(-10002);
                return (false);
            }

            if (startdate.getTime() >= enddate.getTime()) {
                this.setResult(-10006);
                return (false);
            }

            // 前台传送的工件不能为空
            if (msf.getPlist() == null || msf.getPlist().size() == 0) {
                this.setResult(-10003);
                return (false);
            }

            StringBuilder builder = new StringBuilder();
            List<Record> record = null;
            Record rcd = null;
            boolean success = false;
            String moduleResume = null;

            builder.append("SELECT MR.ID AS MID, MRS.ID AS SID, MPS.ID AS PID, MR.*, MRS.* ");
            builder.append(", MPS.*, NVL(MPL.ISENABLE,'0') AS ISENABLE, MPI.ID AS EID FROM MD_RESUME MR ");
            builder.append("LEFT JOIN MD_RESUME_SECTION MRS ON MRS.RESUMEID = MR.ID ");
            builder.append("LEFT JOIN MD_PART_SECTION MPS ON MRS.ID = MPS.SECTIONID ");
            builder.append("LEFT JOIN MD_PART_LIST MPL ON MPS.PARTBARLISTCODE = ");
            builder.append("MPL.PARTBARLISTCODE LEFT JOIN MD_PROCESS_INFO MPI ON ");
            builder.append("MPL.PARTBARLISTCODE = MPI.PARTBARLISTCODE WHERE MR.MODULEBARCODE = ? ");

            Barcode.MD_PROCESS_INFO.nextVal(true);

            if (StringUtils.isEmpty(msf.getSecid())) {
                // 查询模具加工阶段的资料明细
                record = Db.find(builder.toString(), msf.getModulebarcode());
                // 用于判断工件是否正在加工状态
                List<String> tlist = new ArrayList<String>();
                // 如果查询的资料行为空,则表示模具新模已经完成
                if (record.size() == 0) {
                    moduleResume = Barcode.MODULE_RESUME.nextVal();

                    rcd = new Record();
                    rcd.set("ID", moduleResume)
                       .set("CURESTATE", "1")
                       .set("RESUMEEMPID", empid)
                       .set("RESUMESTATE", msf.getStateid())
                       .set("STARTTIME", startdate)
                       .set("ENDTIME", enddate)
                       .set("INSTALLER", msf.getInstaller())
                       .set("DEVISER", msf.getDeviser())
                       .set("REMARK", msf.getRemark())
                       .set("MODULEBARCODE", msf.getModulebarcode());

                    success = Db.save("MD_RESUME", rcd);
                    if (!success) {
                        this.setResult(-10004);
                        return (false);
                    }

                    rcd = new Record();
                    rcd.set("ID", moduleResume)
                       .set("MODULEBARCODE", msf.getModulebarcode())
                       .set("RESUMEEMPID", empid)
                       .set("RESUMESTATE", msf.getStateid())
                       .set("STARTTIME", startdate)
                       .set("ENDTIME", enddate)
                       .set("INSTALLER", msf.getInstaller())
                       .set("DEVISER", msf.getDeviser())
                       .set("REMARK", msf.getRemark())
                       .set("RESUMETIME", DateUtils.getNowStampTime());

                    success = Db.save("MD_RESUME_RECORD", rcd);
                    if (!success) {
                        this.setResult(-10004);
                        return (false);
                    }

                } else {
                    // 如果模具履历的状态为新模,则提示并返回操作
                    rcd = record.get(0);
                    // 获取模具的加工状态
                    String moduleState = rcd.getStr("RESUMESTATE");
                    moduleResume = rcd.getStr("MID");

                    if (moduleState.equals(RegularState.MODULE_RESUME_NEW.getIndex())) {
                        this.setResult(-10005);
                        return (false);
                    }

                    for (Record r : record) {
                        String tpartbar = r.getStr("PARTBARLISTCODE");
                        String eid = r.getStr("EID");
                        if (!tlist.contains(tpartbar) && !StringUtils.isEmpty(eid)) {
                            tlist.add(tpartbar);
                        }
                    }

                    rcd = new Record();
                    rcd.set("ID", moduleResume)
                       .set("STARTTIME", startdate)
                       .set("RESUMESTATE", msf.getStateid())
                       .set("INSTALLER", msf.getInstaller())
                       .set("DEVISER", msf.getDeviser())
                       .set("ENDTIME", enddate)
                       .set("REMARK", msf.getRemark());

                    success = Db.update("MD_RESUME", rcd);
                    if (!success) {
                        this.setResult(-10004);
                        return (false);
                    }

                    rcd = new Record();
                    rcd.set("ID", moduleResume)
                       .set("STARTTIME", startdate)
                       .set("RESUMESTATE", msf.getStateid())
                       .set("ENDTIME", enddate)
                       .set("INSTALLER", msf.getInstaller())
                       .set("DEVISER", msf.getDeviser())
                       .set("REMARK", msf.getRemark());

                    success = Db.update("MD_RESUME_RECORD", rcd);
                    if (!success) {
                        this.setResult(-10004);
                        return (false);
                    }
                }

                String mrsid = Barcode.MD_RESUME_SECTION.nextVal();
                rcd = new Record();
                rcd.set("ID", mrsid)
                   .set("RESUMEID", moduleResume)
                   .set("STATEID", msf.getStateid())
                   .set("STARTDATE", startdate)
                   .set("ENDDATE", enddate)
                   .set("REMARK", msf.getRemark());

                success = Db.save("MD_RESUME_SECTION", rcd);
                if (!success) {
                    this.setResult(-10004);
                    return (false);
                }

                List<PartSectionForm> partlist = msf.getPlist();
                for (PartSectionForm psf : partlist) {
                    // 如果MD_PROCESS_INFO表中已经有该工件的资料就跳过,否则增加该工件的资料
                    if (!tlist.contains(psf.getPartbarlistcode())) {
                        rcd = new Record();
                        rcd.set("ID", Barcode.MD_PROCESS_INFO.nextVal())
                           .set("PARTBARLISTCODE", psf.getPartbarlistcode())
                           .set("MODULERESUMEID", moduleResume)
                           .set("ACTIONTIME", DateUtils.getNowStampTime())
                           .set("ISFIXED", psf.getIsfixed())
                           .set("ISMAJOR", 1);

                        success = Db.save("MD_PROCESS_INFO", rcd);
                        if (!success) {
                            this.setResult(-10004);
                            return (false);
                        }
                    }

                    // 新增MD_PART_SECTION表中一条记录
                    rcd = new Record();
                    rcd.set("ID", Barcode.MD_PART_SECTION.nextVal())
                       .set("SECTIONID", mrsid)
                       .set("PARTBARLISTCODE", psf.getPartbarlistcode())
                       .set("REMARK", psf.getRemark());

                    success = Db.save("MD_PART_SECTION", rcd);
                    if (!success) {
                        this.setResult(-10004);
                        return (false);
                    }
                }

            } else {
                // 如果阶段号不为空
                // builder.append("AND MRS.ID = ?");
                record = Db.find(builder.toString(), msf.getModulebarcode());

                // 如果模具履历的状态为新模,则提示并返回操作
                rcd = record.get(0);
                String moduleState = rcd.getStr("RESUMESTATE");
                moduleResume = rcd.getStr("MID");
                String sid = rcd.getStr("SID");

                if (moduleState.equals(RegularState.MODULE_RESUME_NEW.getIndex())) {
                    this.setResult(-10005);
                    return (false);
                }

                rcd = new Record();
                rcd.set("ID", moduleResume)
                   .set("STARTTIME", startdate)
                   .set("INSTALLER", msf.getInstaller())
                   .set("DEVISER", msf.getDeviser())
                   .set("RESUMESTATE", msf.getStateid())
                   .set("ENDTIME", enddate)
                   .set("REMARK", msf.getRemark());

                success = Db.update("MD_RESUME", rcd);
                if (!success) {
                    this.setResult(-10004);
                    return (false);
                }

                // rcd = new Record();
                // rcd.set("ID", moduleResume)
                // .set("STARTTIME", startdate)
                // .set("INSTALLER", msf.getInstaller())
                // .set("DEVISER", msf.getDeviser())
                // .set("RESUMESTATE", msf.getStateid())
                // .set("ENDTIME", enddate)
                // .set("REMARK", msf.getRemark());

                success = Db.update("MD_RESUME_RECORD", rcd);
                if (!success) {
                    this.setResult(-10004);
                    return (false);
                }

                rcd = new Record();
                rcd.set("ID", sid).set("STARTDATE", startdate).set("ENDDATE", enddate).set("REMARK", msf.getRemark());

                success = Db.update("MD_RESUME_SECTION", rcd);
                if (!success) {
                    this.setResult(-10004);
                    return (false);
                }

                // 过滤出没有报废的工件讯息
                Map<String, Record> mapping = new HashMap<String, Record>();
                List<String> processPartList = new ArrayList<String>();
                for (Record r : record) {
                    String partbarlistcode = r.getStr("PARTBARLISTCODE");
                    String mrsid = StringUtils.parseString(r.getStr("SID"));
                    // MD_PROCESS_INFO表的ID
                    String eid = StringUtils.parseString(r.getStr("EID"));
                    String isenable = r.getStr("ISENABLE");

                    // 如果零件没有在MD_PROCESS_INFO表中存在加工记录,则记录之
                    if (!StringUtils.isEmpty(eid) && !processPartList.contains(eid)) {
                        processPartList.add(partbarlistcode);
                    }

                    if (!mapping.containsKey(partbarlistcode) && msf.getSecid().equals(mrsid) && isenable.equals("0")) {
                        mapping.put(partbarlistcode, r);
                    }
                }

                for (PartSectionForm psf : msf.getPlist()) {
                    if (mapping.containsKey(psf.getPartbarlistcode())) {
                        // 如果存在该工件的讯息则将该工件资料进行更新
                        rcd = new Record();
                        rcd.set("ID", psf.getSecid()).set("REMARK", psf.getRemark());

                        success = Db.update("MD_PART_SECTION", rcd);
                        if (!success) {
                            this.setResult(-10004);
                            return (false);
                        }
                    } else {

                        // 如果MD_PROCESS_INFO表中不含有零件ID号则新增一个
                        if (!processPartList.contains(psf.getPartbarlistcode())) {

                            rcd = new Record();
                            rcd.set("ID", Barcode.MD_PROCESS_INFO.nextVal())
                               .set("PARTBARLISTCODE", psf.getPartbarlistcode())
                               .set("MODULERESUMEID", moduleResume)
                               .set("ACTIONTIME", DateUtils.getNowStampTime())
                               .set("ISFIXED", psf.getIsfixed())
                               .set("ISMAJOR", 1);

                            success = Db.save("MD_PROCESS_INFO", rcd);
                            if (!success) {
                                this.setResult(-10004);
                                return (false);
                            }
                        }

                        // 新增MD_PART_SECTION表中一条记录
                        rcd = new Record();
                        rcd.set("ID", Barcode.MD_PART_SECTION.nextVal())
                           .set("SECTIONID", sid)
                           .set("PARTBARLISTCODE", psf.getPartbarlistcode())
                           .set("REMARK", psf.getRemark());

                        success = Db.save("MD_PART_SECTION", rcd);
                        if (!success) {
                            this.setResult(-10004);
                            return (false);
                        }
                    }
                }
            }

            return true;
        }
        catch (Exception e) {
            this.setResult(-10007);
            return false;
        }
    }
}
