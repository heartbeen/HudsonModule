package com.kc.module.transaction;

import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.base.Barcode;
import com.kc.module.base.RegularState;
import com.kc.module.dao.BaseIAtom;
import com.kc.module.model.form.MachineExtraForm;
import com.kc.module.model.form.MachineExtraPartForm;
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.ControlUtils;
import com.kc.module.utils.DBUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.StringUtils;

public class ModuleResumeRemoveIAtom extends BaseIAtom {

    @Override
    public boolean run() throws SQLException {
        // 获取模具唯一号
        String modulebarcode = this.getController().getPara("modulebarcode");

        StringBuilder builder = new StringBuilder();

        builder.append("SELECT ML.MODULEBARCODE, ML.MODULESTATE, MPI.ID AS MID, MPI.DEVICEPARTID, MR.ID AS RID");
        builder.append(" FROM MODULELIST ML LEFT JOIN MD_RESUME MR ON ML.MODULEBARCODE = MR.MODULEBARCODE ");
        builder.append("LEFT JOIN MD_PROCESS_INFO MPI ON MR.ID = MPI.MODULERESUMEID  WHERE ML.MODULEBARCODE = ?");

        List<Record> querys = Db.find(builder.toString(), modulebarcode);
        // 判断模具资料是否存在
        if (querys.size() == 0) {
            this.setMsg("模具资料已经不存在");
            return false;
        }

        Record fstR = querys.get(0);

        // 如果模具状态为1即报废状态，不存在模具履历
        int modulestate = ArithUtils.parseInt(fstR.getStr("MODULESTATE"), 1);
        if (modulestate > 0) {
            this.setMsg("模具已经报废，没有加工履历");
            return false;
        }

        // 判断模具是否正在加工中
        String rid = fstR.getStr("RID");
        if (StringUtils.isEmpty(rid)) {
            this.setMsg("模具未加工，不需要移除履历");
            return false;
        }

        // 获取操作员工讯息
        String empid = ControlUtils.getEmpBarCode(this.getController());
        // 获取当前的ORACLE时间格式
        Timestamp sdate = DateUtils.getNowStampTime();
        // 获取所有的机台部门唯一号
        List<String> devices = new ArrayList<String>();
        for (Record rcd : querys) {
            String devicepartid = StringUtils.parseString(rcd.getStr("DEVICEPARTID"));
            if (!StringUtils.isEmpty(devicepartid) && !devices.contains(devicepartid)) {
                devices.add(devicepartid);
            }
        }

        boolean result = false;
        int rst = 0;

        if (devices.size() > 0) {
            builder = new StringBuilder();

            builder.append("SELECT MPI.*, DD.CRAFTID, DD.STATEID, MPR.ISTIME, MPR.INVISIBLE, MPR.ISFIXED, MPR.LEMPACTID ");
            builder.append("FROM MD_PROCESS_INFO MPI LEFT JOIN DEVICE_DEPART DD ON MPI.DEVICEPARTID = DD.ID ");
            builder.append("LEFT JOIN MD_PROCESS_RESUME MPR ON MPI.CURSORID = MPR.ID WHERE MPI.DEVICEPARTID IN ");
            builder.append(DBUtils.sqlIn(devices));

            List<Record> details = Db.find(builder.toString());
            // 判断模具资料是否存在
            if (details.size() > 0) {
                Map<String, MachineExtraForm> mac = new HashMap<String, MachineExtraForm>();
                for (Record mc : details) {
                    // MD_PROCESS_INFO表的ID
                    String id = mc.getStr("ID");
                    String partbarlistcode = mc.getStr("PARTBARLISTCODE");
                    String partstateid = mc.getStr("PARTSTATEID");
                    String moduleresumeid = mc.getStr("MODULERESUMEID");
                    String deptid = mc.getStr("CURRENTDEPTID");
                    String scheduleid = mc.getStr("SCHEDULEID");
                    String cursorid = mc.getStr("CURSORID");
                    String istime = mc.getStr("ISTIME");
                    int invisible = mc.getNumber("INVISIBLE").intValue();

                    Number fixedNumber = mc.getNumber("ISFIXED");
                    int isfixed = (fixedNumber == null ? 0 : fixedNumber.intValue());
                    
                    String empactid = mc.getStr("LEMPACTID");
                    String devicedepartid = mc.getStr("DEVICEPARTID");
                    String craftid = mc.getStr("CRAFTID");
                    String deviceempid = mc.getStr("DEVICEEMPID");
                    String mergeid = mc.getStr("PARTMERGEID");
                    String stateid = mc.getStr("STATEID");
                    int partcount = ArithUtils.parseInt(mc.getStr("PARTCOUNT"), 1);

                    MachineExtraForm mef = null;
                    boolean isContain = (rid.equals(moduleresumeid));
                    if (!mac.containsKey(devicedepartid)) {
                        mef = new MachineExtraForm();

                        mef.setDevicepartid(devicedepartid);
                        mef.setCraftid(craftid);
                        mef.setEmpid(deviceempid);
                        mef.setStateid(stateid);
                        mef.setMergeid(mergeid);

                        mef.setPartcount(isContain ? (partcount - 1) : partcount);

                        mac.put(devicedepartid, mef);
                    } else {
                        mef = mac.get(devicedepartid);
                        mef.setPartcount(isContain ? (mef.getPartcount() - 1) : mef.getPartcount());
                    }

                    // 如果模具履历和工件履历一致，则表示为该模具资料，后续会删除掉，不是则要操作工件记录添加至集合汇中
                    if (!isContain) {
                        MachineExtraPartForm mepf = new MachineExtraPartForm();
                        // MD_PROCESS_INFO表ID
                        mepf.setId(id);
                        mepf.setCursorid(cursorid);
                        mepf.setDeptid(deptid);
                        mepf.setEmpactid(empactid);
                        mepf.setInvisible(invisible);
                        mepf.setIsmajor(isfixed);
                        mepf.setIstime(istime);
                        mepf.setPartbarlistcode(partbarlistcode);
                        mepf.setScheduleid(scheduleid);
                        mepf.setRsmid(moduleresumeid);
                        // MD_PROCESS_INFO表的PARTSTATEID
                        mepf.setStateid(partstateid);

                        mef.getMap().put(id, mepf);
                    }
                }

                if (mac.size() > 0) {
                    // 将DEVICE_PROCESS_RESUME表的ID号重新刷新一次
                    Barcode.DEVICE_PROCESS_RESUME.nextVal(true);
                    // 将MD_PROCESS_RESUME表的ID号重新刷新一次
                    Barcode.MODULE_PROCESS_RESUME.nextVal(true);
                    for (String key : mac.keySet()) {
                        MachineExtraForm k_mef = mac.get(key);

                        String k_mergeid = ((k_mef.getPartcount() > 1) ? k_mef.getMergeid() : "");
                        // 如果工件数量小于1表示机台没有工件了，需要将机台关闭
                        if (k_mef.getPartcount() < 1) {
                            // 更新DEVICE_DEPART表
                            fstR = new Record();

                            fstR.set("ID", key).set("STATEID", RegularState.MACHINE_STOP.getIndex()).set("EMPID", "").set("LAUNCH", "");
                            result = Db.update("DEVICE_DEPART", fstR);
                            if (!result) {
                                this.setMsg("保存设备资料失败");
                                return false;
                            }
                            // 更新DEVICE_PROCESS_RESUME表
                            fstR = new Record();
                            fstR.set("ID", Barcode.DEVICE_PROCESS_RESUME.nextVal())
                                .set("DEVICEPARTID", key)
                                .set("STATEID", RegularState.MACHINE_STOP.getIndex())
                                .set("EMPID", empid)
                                .set("ACTIONDATE", sdate)
                                .set("ACTIONTYPE", RegularState.EMP_ACTION_DOWN.getIndex());

                            result = Db.save("DEVICE_PROCESS_RESUME", fstR);
                            if (!result) {
                                this.setMsg("保存设备异动资料失败");
                                return false;
                            }
                        } else {
                            for (String idx : k_mef.getMap().keySet()) {
                                MachineExtraPartForm k_mepf = k_mef.getMap().get(idx);

                                fstR = new Record();
                                fstR.set("ID", k_mepf.getCursorid())
                                    .set("NDEVDEPARTID", key)
                                    .set("NPROCRAFTID", k_mef.getCraftid())
                                    .set("NPARTSTATEID", k_mepf.getStateid())
                                    .set("NDEVSTATEID", k_mef.getStateid())
                                    .set("NEMPID", k_mef.getEmpid())
                                    .set("NEMPACTID", k_mepf.getEmpactid())
                                    .set("NDEPTID", k_mepf.getDeptid())
                                    .set("NSCHEID", k_mepf.getScheduleid())
                                    .set("NRCDTIME", sdate);

                                result = Db.update("MD_PROCESS_RESUME", fstR);
                                if (!result) {
                                    this.setMsg("完善零件异动资料失败");
                                    return false;
                                }

                                String k_cursorid = Barcode.MODULE_PROCESS_RESUME.nextVal();

                                fstR = new Record();
                                fstR.set("ID", k_cursorid)
                                    .set("PARTMERGEID", k_mergeid)
                                    .set("PARTBARLISTCODE", k_mepf.getPartbarlistcode())
                                    .set("LDEVDEPARTID", key)
                                    .set("LPROCRAFTID", k_mef.getCraftid())
                                    .set("LPARTSTATEID", k_mepf.getStateid())
                                    .set("LDEVSTATEID", k_mef.getStateid())
                                    .set("LEMPID", k_mef.getEmpid())
                                    .set("LEMPACTID", k_mepf.getEmpactid())
                                    .set("LDEPTID", k_mepf.getDeptid())
                                    .set("LSCHEID", k_mepf.getScheduleid())
                                    .set("LRCDTIME", sdate)
                                    .set("PARTCOUNT", k_mef.getPartcount() + "")
                                    .set("MID", k_mepf.getId())
                                    .set("RSMID", k_mepf.getRsmid())
                                    .set("ISTIME", k_mepf.getIstime())
                                    .set("INVISIBLE", k_mepf.getInvisible())
                                    .set("ISFIXED", k_mepf.getIsmajor());

                                result = Db.save("MD_PROCESS_RESUME", fstR);
                                if (!result) {
                                    this.setMsg("保存零件异动资料失败");
                                    return false;
                                }

                                fstR = new Record();
                                fstR.set("ID", k_mepf.getId())
                                    .set("PARTMERGEID", k_mergeid)
                                    .set("ACTIONTIME", sdate)
                                    .set("PARTCOUNT", k_mef.getPartcount() + "")
                                    .set("CURSORID", k_cursorid);

                                result = Db.update("MD_PROCESS_INFO", fstR);
                                if (!result) {
                                    this.setMsg("保存零件加工资料失败");
                                    return false;
                                }
                            }
                        }
                    }
                }
            }
        }

        // 删除PART_OUTBOUND中的外发记录
        rst = Db.update("DELETE FROM PART_OUTBOUND WHERE ID IN (SELECT OUTID FROM MD_PROCESS_RESUME WHERE RSMID = ? AND OUTID IS NOT NULL)", rid);
        if (rst < 0) {
            this.setMsg("删除外发资料失败");
            return false;
        }
        // 删除MD_PROCESS_RESUME表中所有的加工讯息
        rst = Db.update("DELETE FROM MD_PROCESS_RESUME WHERE RSMID = ?", rid);
        if (rst < 0) {
            this.setMsg("删除零件异动资料失败");
            return false;
        }

        // 删除MD_PROCESS_INFO表中的模具零件讯息
        rst = Db.update("DELETE FROM MD_PROCESS_INFO WHERE MODULERESUMEID = ?", rid);
        if (rst < 0) {
            this.setMsg("删除零件加工资料失败");
            return false;
        }

        // 删除MD_PROCESS_RESUME表中的资料
        rst = Db.update("DELETE FROM MD_PROCESS_FINISH WHERE MODULERESUMEID = ?", rid);
        if (rst < 0) {
            this.setMsg("删除零件完成资料失败");
            return false;
        }

        // 删除MD_EST_SCHEDULE表中的资料
        rst = Db.update("DELETE FROM MD_EST_SCHEDULE WHERE MODULERESUMEID = ?", rid);
        if (rst < 0) {
            this.setMsg("删除零件排程资料失败");
            return false;
        }

        // 删除MD_RESUME_SECTION表中的资料
        rst = Db.update("DELETE FROM MD_RESUME_SECTION WHERE RESUMEID = ?", rid);
        if (rst < 0) {
            this.setMsg("删除模具履历明细失败");
            return false;
        }

        // 删除MD_PART_SECTION表中的资料
        rst = Db.update("DELETE FROM MD_PART_SECTION WHERE SECTIONID IN (SELECT ID FROM MD_RESUME_SECTION WHERE RESUMEID = ?)", rid);
        if (rst < 0) {
            this.setMsg("删除工件明细失败");
            return false;
        }

        // 删除MD_RESUME_RECORD的模具履历讯息
        fstR = new Record().set("ID", rid);
        result = Db.delete("MD_RESUME_RECORD", fstR);
        if (!result) {
            this.setMsg("删除模具履历清单失败");
            return false;
        }
        // 删除MD_RESUME的模具履历讯息
        result = Db.delete("MD_RESUME", fstR);
        if (!result) {
            this.setMsg("删除模具加工履历失败");
            return false;
        }

        return (true);
    }
}
