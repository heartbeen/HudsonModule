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
import com.kc.module.model.form.MachineProcessInfo;
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.ControlUtils;
import com.kc.module.utils.DBUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.StringUtils;

public class ProceedModuleFinishIAtom implements IAtom {

    private Controller controller;
    private String msg;

    public Controller getController() {
        return controller;
    }

    public void setController(Controller controller) {
        this.controller = controller;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    @Override
    public boolean run() throws SQLException {
        String resumeid = this.getController().getPara("resumeid");
        // 如果模具履历号为空,则返回FALSE
        if (StringUtils.isEmpty(resumeid)) {
            this.setMsg("模具资料不能为空!");
            return (false);
        }

        // 获取当前用户讯息
        String userid = ControlUtils.getAccountId(this.controller);
        // 获取当前部门别
        String deptid = ControlUtils.getDeptPosid(this.controller);

        Timestamp sdatetime = DateUtils.parseTimeStamp(DateUtils.getDateNow());

        StringBuilder builder = new StringBuilder();

        builder.append("SELECT MPI.ID AS MPIID,MPI.PARTMERGEID, DD.*, MPR.ID AS MPRID, MR.MODULEBARCODE   ");
        builder.append(", MR.PROCESSED, MPI.ISFIXED, MPF.ID AS FID, MPI.PARTBARLISTCODE, MPI.PARTCOUNT    ");
        builder.append("FROM MD_RESUME MR LEFT JOIN MD_PROCESS_INFO MPI ON MR.ID = MPI.MODULERESUMEID     ");
        builder.append("LEFT JOIN DEVICE_DEPART DD ON MPI.DEVICEPARTID = DD.ID                            ");
        builder.append("LEFT JOIN MD_PROCESS_RESUME MPR ON MPI.CURSORID = MPR.ID LEFT JOIN                ");
        builder.append(" MD_PROCESS_FINISH MPF ON MPI.ID = MPF.MID WHERE MR.ID = ?                        ");

        // 如果查询的模具的加工记录为空,则不存在该模具加工履历讯息,返回FALSE
        List<Record> rsmRcd = Db.find(builder.toString(), resumeid);
        if (rsmRcd.size() == 0) {
            this.setMsg("模具的加工讯息不存在!");
            return (false);
        }

        // 用于存放已经修改过讯息的机台编号ID
        Map<String, MachineProcessInfo> machineMap = new HashMap<String, MachineProcessInfo>();
        List<String> machineList = new ArrayList<String>();
        List<String> deleteList = new ArrayList<String>();

        String modulebarcode = null;
        Record operRcd = null;
        boolean rst = false;

        // 获取加工完成时间
        Timestamp processed = null;

        // 将DEVICE_PROCESS_RESUME表的最大索引进行更新
        Barcode.DEVICE_PROCESS_RESUME.nextVal(true);

        for (Record r : rsmRcd) {
            // 获取MD_PROCESS_INFO表的ID号
            String mpiid = r.getStr("MPIID");
            // 如果零件的MD_PROCESS_INFO的ID为空,则跳过这列
            if (StringUtils.isEmpty(mpiid)) {
                continue;
            }

            String devpartid = r.getStr("ID");
            String devstateid = r.getStr("STATEID");
            String mprid = r.getStr("MPRID");
            String partbarlistcode = r.getStr("PARTBARLISTCODE");
            String mergeid = r.getStr("PARTMERGEID");

            int isfixed = r.getNumber("ISFIXED").intValue();
            String fid = r.getStr("FID");
            String craftid = r.getStr("CRAFTID");

            int partcount = ArithUtils.parseInt(r.getStr("PARTCOUNT"), 1);

            if (processed == null) {
                processed = r.getTimestamp("PROCESSED");
            }

            // 判断原始的模具唯一号是否为空,如果为空,填充一个从数据库读取的数据
            if (StringUtils.isEmpty(modulebarcode)) {
                modulebarcode = r.getStr("MODULEBARCODE");
            }

            // 将MD_PROCESS_INFO加工表中工件对应的记录删除,表示已经加工完成
            if (!StringUtils.isEmpty(mpiid) && !deleteList.contains(mpiid)) {
                deleteList.add(mpiid);
            }

            // 将PART_OUTBOUND外发表中的零件内容更新
            if (!StringUtils.isEmpty(partbarlistcode)) {
                int result = Db.update("UPDATE PART_OUTBOUND SET ISFINISH = ?,STATEID = ?, BACKTIME = SYSDATE WHERE PARTLISTBARCODE = ? AND ISFINISH = ?",
                                       1,
                                       RegularState.OUT_STATE_FINISH.getIndex(),
                                       partbarlistcode,
                                       0);
                if (result < 0) {
                    this.setMsg("设置模具完成失败!");
                    return (false);
                }
            }

            // 如果DEVICE_DEPART表的ID不为空,并且MacList集合中不包含该ID号,则执行该动作
            if (!StringUtils.isEmpty(devpartid)) {
                if (!machineMap.containsKey(devpartid)) {
                    MachineProcessInfo tmp = new MachineProcessInfo();
                    tmp.setMergeid(mergeid);
                    tmp.setStateid(devstateid);
                    tmp.setCraftid(craftid);
                    tmp.setPartcount(partcount - 1);

                    tmp.getList().add(mprid);
                } else {
                    MachineProcessInfo tmp = machineMap.get(devpartid);
                    tmp.setPartcount(tmp.getPartcount() - 1);

                    tmp.getList().add(mprid);
                }
            } else {
                // 如果加工记录ID号不为空,则将其中的加工记录进行更新操作
                if (!StringUtils.isEmpty(mprid)) {
                    operRcd = new Record();
                    operRcd.set("ID", mprid)
                           .set("NPARTSTATEID", RegularState.PART_STATE_OVER.getIndex())
                           .set("NDEPTID", deptid)
                           .set("NRCDTIME", sdatetime);

                    rst = Db.update("MD_PROCESS_RESUME", operRcd);
                    if (!rst) {
                        this.setMsg("设置模具完成失败!");
                        return (false);
                    }
                }
            }

            // 如果是基件并且MD_PROCESS_FINISH中没有完成记录,则新增一个完成记录
            if (isfixed == 0 && StringUtils.isEmpty(fid)) {              
                operRcd = new Record();
                operRcd.set("ID", Barcode.MD_PROCESS_FINISH.nextVal())
                       .set("MID", mpiid)
                       .set("MODULERESUMEID", resumeid)
                       .set("PARTBARLISTCODE", partbarlistcode)
                       .set("FINISHDATE", sdatetime);

                rst = Db.save("MD_PROCESS_FINISH", operRcd);
                if (!rst) {
                    this.setMsg("设置模具完成失败!");
                    return (false);
                }
            }
        }

        for (String key : machineMap.keySet()) {
            MachineProcessInfo m_mpi = machineMap.get(key);
            if (m_mpi.getPartcount() < 1) {
                if (RegularState.MACHINE_START.getIndex().equals(m_mpi.getStateid())) {
                    operRcd = new Record();
                    operRcd.set("ID", key).set("STATEID", RegularState.MACHINE_STOP.getIndex()).set("EMPID", "").set("LAUNCH", "");

                    rst = Db.update("DEVICE_DEPART", operRcd);
                    if (!rst) {
                        this.setMsg("设置模具完成失败!");
                        return (false);
                    }

                    operRcd = new Record();
                    operRcd.set("ID", Barcode.DEVICE_PROCESS_RESUME.nextVal())
                           .set("DEVICEPARTID", key)
                           .set("STATEID", RegularState.MACHINE_STOP.getIndex())
                           .set("CRAFTID", m_mpi.getCraftid())
                           .set("EMPID", userid)
                           .set("ACTIONDATE", sdatetime)
                           .set("ACTIONTYPE", RegularState.EMP_ACTION_DOWN.getIndex());

                    rst = Db.save("DEVICE_PROCESS_RESUME", operRcd);
                    if (!rst) {
                        this.setMsg("设置模具完成失败!");
                        return (false);
                    }
                }
            } else {
                machineList.add(key);
            }
        }

        if (machineList.size() > 0) {

            Barcode.MODULE_PROCESS_RESUME.nextVal(true);

            builder = new StringBuilder();

            builder.append("SELECT MPI.ID AS MID, MPI.DEVICEPARTID AS DEVID, MPR.* FROM MD_PROCESS_INFO MPI ");
            builder.append("LEFT JOIN MD_PROCESS_RESUME MPR ON MPI.CURSORID = MPR.ID WHERE MPI.DEVICEPARTID IN ");
            builder.append(DBUtils.sqlIn(machineList));

            List<Record> processList = Db.find(builder.toString());

            for (Record m_record : processList) {
                String m_mid = m_record.getStr("MID");
                String m_devid = m_record.getStr("DEVID");
                // MD_PROCESS_RESUME表的ID
                String m_rid = m_record.getStr("ID");

                if (StringUtils.isEmpty(m_mid)) {
                    continue;
                }

                if (StringUtils.isEmpty(m_devid)) {
                    continue;
                }

                MachineProcessInfo m_macid = machineMap.get(m_devid);
                if (!m_macid.getList().contains(m_mid)) {
                    if (!StringUtils.isEmpty(m_rid)) {
                        operRcd = new Record();
                        operRcd.set("ID", m_rid)
                               .set("NDEVDEPARTID", m_record.getStr("LDEVDEPARTID"))
                               .set("NPROCRAFTID", m_record.getStr("LPROCRAFTID"))
                               .set("NPARTSTATEID", m_record.getStr("LPARTSTATEID"))
                               .set("NDEVSTATEID", m_record.getStr("LDEVSTATEID"))
                               .set("NEMPID", m_record.getStr("LEMPID"))
                               .set("NEMPACTID", m_record.getStr("LEMPACTID"))
                               .set("NDEPTID", m_record.getStr("LDEPTID"))
                               .set("NSCHEID", m_record.getStr("LSCHEID"))
                               .set("NRCDTIME", sdatetime);
                        rst = Db.update("MD_PROCESS_RESUME", operRcd);
                        if (!rst) {
                            return rst;
                        }

                        String nextid = Barcode.MODULE_PROCESS_RESUME.nextVal();
                        operRcd = new Record();
                        operRcd.set("ID", nextid)
                               .set("MERGEID", m_macid.getPartcount() == 1 ? "" : m_macid.getMergeid())
                               .set("PARTBARLISTCODE", m_record.getStr("PARTBARLISTCODE"))
                               .set("LDEVDEPARTID", m_record.getStr("LDEVDEPARTID"))
                               .set("LPROCRAFTID", m_record.getStr("LPROCRAFTID"))
                               .set("LPARTSTATEID", m_record.getStr("LPARTSTATEID"))
                               .set("LDEVSTATEID", m_record.getStr("LDEVSTATEID"))
                               .set("LEMPID", m_record.getStr("LEMPID"))
                               .set("LEMPACTID", m_record.getStr("LEMPACTID"))
                               .set("LDEPTID", m_record.getStr("LDEPTID"))
                               .set("LSCHEID", m_record.getStr("LSCHEID"))
                               .set("LRCDTIME", sdatetime)
                               .set("PARTCOUNT", m_macid.getPartcount() + "")
                               .set("MID", m_record.getStr("MID"))
                               .set("RSMID", m_record.getStr("RSMID"))
                               .set("ISTIME", m_record.getStr("ISTIME"))
                               .set("INVISIBLE", m_record.getNumber("INVISIBLE").intValue())
                               .set("OUTID", m_record.getStr("OUTID"))
                               .set("ISFIXED", m_record.getNumber("ISFIXED").intValue());

                        rst = Db.save("MD_PROCESS_RESUME", operRcd);
                        if (!rst) {
                            return rst;
                        }

                        operRcd = new Record();
                        operRcd.set("ID", m_mid).set("PARTCOUNT", m_macid.getPartcount() + "").set("ACTIONTIME", sdatetime).set("CURSORID", nextid);
                        if (m_macid.getPartcount() == 1) {
                            operRcd.set("MERGEID", "");
                        }

                        rst = Db.update("MD_PROCESS_INFO", operRcd);
                        if (!rst) {
                            return rst;
                        }
                    }
                }
            }
        }

        for (String item : deleteList) {
            operRcd = new Record();
            operRcd.set("ID", item);

            rst = Db.delete("MD_PROCESS_INFO", operRcd);
            if (!rst) {
                this.setMsg("设置模具完成失败!");
                return (false);
            }
        }

        // 更新MODULELIST模具表中的模具讯息
        if (!StringUtils.isEmpty(modulebarcode)) {
            operRcd = new Record();
            // 将OPERATEFLAG字段设置为1,表示加工完成
            operRcd.set("MODULEBARCODE", modulebarcode).set("OPERATEFLAG", "1");

            rst = Db.update("MODULELIST", "MODULEBARCODE", operRcd);
            if (!rst) {
                this.setMsg("设置模具完成失败!");
                return (false);
            }
        }

        // 将MD_RESUME表中该模具对应的加工履历清空
        operRcd = new Record();
        operRcd.set("ID", resumeid);
        rst = Db.delete("MD_RESUME", operRcd);
        if (!rst) {
            this.setMsg("设置模具完成失败!");
            return (false);
        }

        // 将MD_RESUME_RECORD表的履历资料中的完成时间更新
        operRcd = new Record();
        operRcd.set("ID", resumeid).set("FINISHTIME", sdatetime);
        // 如果加工完成时间为空,则将核准完工的时间设置为完成时间
        if (processed == null) {
            operRcd.set("PROCESSED", sdatetime);
        }
        rst = Db.update("MD_RESUME_RECORD", operRcd);
        if (!rst) {
            this.setMsg("设置模具完成失败!");
            return (false);
        }

        this.setMsg("设置模具完成成功!");
        return (true);
    }

}
