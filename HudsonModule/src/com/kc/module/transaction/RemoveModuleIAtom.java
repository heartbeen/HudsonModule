package com.kc.module.transaction;

import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.alibaba.druid.util.StringUtils;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.base.Barcode;
import com.kc.module.base.RegularState;
import com.kc.module.dao.BaseIAtom;
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.ControlUtils;
import com.kc.module.utils.DateUtils;

/**
 * 删除所有的模具讯息，包括零件资料，计划排程，零件资料
 * 
 * @author ASUS
 * 
 */
public class RemoveModuleIAtom extends BaseIAtom {

    @Override
    public boolean run() throws SQLException {

        // 获取前台传来的唯一号
        String modulebarcode = this.getController().getPara("modulebarcode");
        // 获取员工工号
        String empid = ControlUtils.getEmpBarCode(this.getController());

        StringBuilder builder = new StringBuilder();
        builder.append("SELECT ML.MODULEBARCODE, ML.MODULESTATE, MR.ID AS RESUMEID FROM MODULELIST ML LEFT JOIN MD_RESUME MR ");
        builder.append("ON ML.MODULEBARCODE = MR.MODULEBARCODE WHERE ML.MODULEBARCODE = ?");

        Record record = Db.findFirst(builder.toString(), modulebarcode);
        if (record == null) {
            this.setMsg("该模具资料不存在了");
            return (false);
        }

        // 模具加工履历
        String resumeid = record.getStr("RESUMEID");

        // 用于更新记录
        Record updateRecord = null;
        boolean rst = false;
        // 获取当前的ORACLE格式时间
        Timestamp stamp = DateUtils.getNowStampTime();

        // 如果加工履历不为空，则执行履历的相关操作
        if (!StringUtils.isEmpty(resumeid)) {
            builder = new StringBuilder();

            builder.append("SELECT MPI.ID AS MPIID, MPI.PARTBARLISTCODE, MPI.CURSORID, MPI.DEVICEPARTID, MPI.PARTCOUNT ");
            builder.append(", MPR.OUTID, MPI.PARTMERGEID, MPI.CURRENTDEPTID, MPI.MODULERESUMEID, MPF.ID AS MPFID ");
            builder.append(", MPI.PARTBARLISTCODE, MPR.LPROCRAFTID, MPR.LDEVDEPARTID, MPR.LPARTSTATEID, MPR.LDEVSTATEID ");
            builder.append(", MPR.LEMPID, MPR.LSCHEID, MPR.LEMPACTID, MPR.ISTIME, MPI.ISFIXED ");
            builder.append("FROM MD_PROCESS_INFO MPI ");
            builder.append("LEFT JOIN MD_PROCESS_RESUME MPR ON MPI.CURSORID = MPR.ID ");
            builder.append("LEFT JOIN MD_PROCESS_FINISH MPF ON MPI.MODULERESUMEID = MPF.MODULERESUMEID ");
            builder.append("AND MPI.PARTBARLISTCODE = MPF.PARTBARLISTCODE WHERE MPI.DEVICEPARTID IN ");
            builder.append("(SELECT DISTINCT DEVICEPARTID FROM MD_PROCESS_INFO WHERE MODULERESUMEID = ? AND DEVICEPARTID IS NOT NULL)");

            List<Record> mills = Db.find(builder.toString(), resumeid);
            if (mills.size() > 0) {
                // 用于存放正在某台机台上加工的某个零件的其他合并零件的讯息
                Map<String, DeviceOtherPartInfo> mac = new HashMap<String, DeviceOtherPartInfo>();

                for (Record rcd : mills) {
                    // 部门机台唯一号
                    String devicepartid = rcd.getStr("DEVICEPARTID");
                    // 模具履历ID
                    String rsmid = rcd.getStr("MODULERESUMEID");
                    // 如果模具履历为空跳过这条记录
                    if (StringUtils.isEmpty(rsmid)) {
                        continue;
                    }
                    // 零件合并数量
                    int partcount = ArithUtils.parseInt(rcd.getStr("PARTCOUNT"), 1);
                    // 判断零件是否已经标记加工完成
                    String fid = rcd.getStr("FID");

                    // 如果完成标记不为空,则表示零件已经加工完成
                    if (!StringUtils.isEmpty(fid)) {
                        continue;
                    }

                    // 如果设备代号不为空,则统计设备的机台零件讯息
                    if (!StringUtils.isEmpty(devicepartid)) {
                        DeviceOtherPartInfo dopi = null;

                        if (!mac.containsKey(devicepartid)) {
                            dopi = new DeviceOtherPartInfo();
                            dopi.setPartcount(partcount);

                            mac.put(devicepartid, dopi);
                        } else {
                            dopi = mac.get(devicepartid);
                        }

                        // 如果是本套模具的零件,则将合并的零件数扣掉1,否则将此零件增加一笔资料
                        if (resumeid.equals(rsmid)) {
                            dopi.setPartcount(dopi.getPartcount() - 1);
                        } else {
                            dopi.getPartlist().add(rcd);
                        }
                    }
                }

                if (mac.size() > 0) {
                    Barcode.DEVICE_PROCESS_RESUME.nextVal(true);
                    Barcode.MODULE_PROCESS_RESUME.nextVal(true);

                    for (String key : mac.keySet()) {
                        DeviceOtherPartInfo temp = mac.get(key);

                        if (temp.getPartcount() < 1) {
                            updateRecord = new Record();
                            updateRecord.set("ID", key).set("STATEID", RegularState.MACHINE_STOP.getIndex()).set("EMPID", "").set("LAUNCH", "");
                            rst = Db.update("DEVICE_DEPART", updateRecord);
                            if (!rst) {
                                this.setMsg("保存机台资料失败!");
                                return (false);
                            }

                            updateRecord = new Record();
                            updateRecord.set("ID", Barcode.DEVICE_PROCESS_RESUME.nextVal())
                                        .set("DEVICEPARTID", key)
                                        .set("STATEID", RegularState.MACHINE_STOP.getIndex())
                                        .set("EMPID", empid)
                                        .set("ACTIONDATE", stamp)
                                        .set("ACTIONTYPE", RegularState.EMP_ACTION_DOWN.getIndex());

                            rst = Db.save("DEVICE_PROCESS_RESUME", updateRecord);
                            if (!rst) {
                                this.setMsg("保存机台异动记录失败!");
                                return (false);
                            }
                        } else {
                            for (Record ak : temp.getPartlist()) {

                                String mid = ak.getStr("MPIID");
                                String cursorid = ak.getStr("CURSORID");
                                String rsmid = ak.getStr("MODULERESUMEID");
                                String outid = ak.getStr("OUTID");
                                String partmergeid = ak.getStr("PARTMERGEID");

                                String partbarlistcode = ak.getStr("PARTBARLISTCODE");
                                String lprocraftid = ak.getStr("LPROCRAFTID");
                                String ldevdepartid = ak.getStr("LDEVDEPARTID");
                                String lpartstateid = ak.getStr("LPARTSTATEID");
                                String ldevstateid = ak.getStr("LDEVSTATEID");
                                String lempid = ak.getStr("LEMPID");
                                String lscheid = ak.getStr("LSCHEID");
                                String ldeptid = ak.getStr("LDEPTID");
                                String lempactid = ak.getStr("LEMPACTID");
                                String istime = ak.getStr("ISTIME");
                                Number isfixed = ak.getNumber("ISFIXED");

                                if (!StringUtils.isEmpty(cursorid)) {
                                    updateRecord = new Record();
                                    updateRecord.set("ID", cursorid)
                                                .set("NDEVDEPARTID", ldevdepartid)
                                                .set("NPROCRAFTID", lprocraftid)
                                                .set("NPARTSTATEID", lpartstateid)
                                                .set("NDEVSTATEID", ldevstateid)
                                                .set("NEMPID", lempid)
                                                .set("NEMPACTID", lempactid)
                                                .set("NDEPTID", ldeptid)
                                                .set("NSCHEID", lscheid)
                                                .set("NRCDTIME", stamp);

                                    rst = Db.update("MD_PROCESS_RESUME", updateRecord);
                                    if (!rst) {
                                        this.setMsg("保存零件加工讯息失败!");
                                        return (false);
                                    }
                                }

                                String appendid = Barcode.MODULE_PROCESS_RESUME.nextVal();
                                String mergeid = (temp.getPartcount() > 1 ? partmergeid : "");

                                updateRecord = new Record();
                                updateRecord.set("ID", appendid)
                                            .set("PARTMERGEID", mergeid)
                                            .set("PARTBARLISTCODE", partbarlistcode)
                                            .set("LDEVDEPARTID", ldevdepartid)
                                            .set("LPROCRAFTID", lprocraftid)
                                            .set("LPARTSTATEID", lpartstateid)
                                            .set("LDEVSTATEID", ldevstateid)
                                            .set("LEMPID", lempid)
                                            .set("LEMPACTID", lempactid)
                                            .set("LDEPTID", ldeptid)
                                            .set("LSCHEID", lscheid)
                                            .set("LRCDTIME", stamp)
                                            .set("PARTCOUNT", temp.getPartcount() + "")
                                            .set("MID", mid)
                                            .set("RSMID", rsmid)
                                            .set("ISTIME", istime)
                                            .set("OUTID", outid)
                                            .set("ISFIXED", isfixed == null ? 0 : isfixed.intValue());

                                rst = Db.save("MD_PROCESS_RESUME", updateRecord);
                                if (!rst) {
                                    this.setMsg("保存零件加工讯息失败!");
                                    return (false);
                                }

                                // MD_PROCESS_INFO表更新
                                updateRecord = new Record();
                                updateRecord.set("ID", mid)
                                            .set("PARTMERGEID", mergeid)
                                            .set("PARTCOUNT", temp.getPartcount() + "")
                                            .set("CURSORID", appendid);

                                rst = Db.update("MD_PROCESS_INFO", updateRecord);
                                if (!rst) {
                                    this.setMsg("保存零件加工讯息失败!");
                                    return (false);
                                }
                            }
                        }
                    }
                }
            }
        }

        // 删除模具部件MD_PART表中的讯息
        int result = Db.update("DELETE FROM MD_PART WHERE MODULEBARCODE = ?", modulebarcode);
        if (result < 0) {
            this.setMsg("删除零件加工讯息失败!");
            return (false);
        }
        // 删除模具零件MD_PART_LIST表中的讯息
        result = Db.update("DELETE FROM MD_PART_LIST WHERE MODULEBARCODE = ?", modulebarcode);
        if (result < 0) {
            this.setMsg("删除零件加工讯息失败!");
            return (false);
        }
        // 删除模具零件MD_PROCESS_INFO表中的讯息
        result = Db.update("DELETE FROM MD_PROCESS_INFO WHERE MODULERESUMEID = ?", resumeid);
        if (result < 0) {
            this.setMsg("删除零件加工即时讯息失败!");
            return (false);
        }
        result = Db.update("DELETE FROM PART_OUTBOUND WHERE ID IN (SELECT MPR.OUTID FROM MD_RESUME_RECORD MRR "
                           + "LEFT JOIN MD_PROCESS_RESUME MPR ON MRR.ID = MPR.RSMID WHERE "
                           + "MRR.MODULEBARCODE = ? AND MPR.OUTID IS NOT NULL)", modulebarcode);
        if (result < 0) {
            this.setMsg("删除外发零件加工讯息失败!");
            return (false);
        }
        result = Db.update("DELETE FROM MD_PART_SECTION WHERE SECTIONID IN (SELECT MRS.ID FROM MD_RESUME_RECORD MRR "
                           + "LEFT JOIN MD_RESUME_SECTION MRS ON MRR.ID = MRS.RESUMEID WHERE MRR.MODULEBARCODE = ?)", modulebarcode);
        if (result < 0) {
            this.setMsg("删除零件分段加工讯息失败!");
            return (false);
        }
        result = Db.update("DELETE FROM MD_RESUME_SECTION WHERE RESUMEID IN (SELECT ID FROM MD_RESUME_RECORD MRR WHERE MODULEBARCODE  = ?)",
                           modulebarcode);
        if (result < 0) {
            this.setMsg("删除模具分段加工讯息失败!");
            return (false);
        }
        result = Db.update("DELETE FROM MD_PROCESS_RESUME WHERE RSMID IN (SELECT ID FROM MD_RESUME_RECORD WHERE MODULEBARCODE = ?)", modulebarcode);
        if (result < 0) {
            this.setMsg("删除模具加工记录讯息失败!");
            return (false);
        }
        result = Db.update("DELETE FROM MD_EST_SCHEDULE WHERE MODULERESUMEID IN (SELECT ID FROM MD_RESUME_RECORD WHERE MODULEBARCODE = ?)",
                           modulebarcode);
        if (result < 0) {
            this.setMsg("删除模具排程讯息失败!");
            return (false);
        }
        result = Db.update("DELETE FROM MD_PROCESS_FINISH WHERE MODULERESUMEID IN (SELECT ID FROM MD_RESUME_RECORD WHERE MODULEBARCODE = ?)",
                           modulebarcode);
        if (result < 0) {
            this.setMsg("删除模具排程讯息失败!");
            return (false);
        }

        result = Db.update("DELETE FROM MD_RESUME WHERE MODULEBARCODE = ?", modulebarcode);
        if (result < 0) {
            this.setMsg("删除模具履历失败!");
            return (false);
        }

        result = Db.update("DELETE FROM MD_RESUME_RECORD WHERE MODULEBARCODE = ?", modulebarcode);
        if (result < 0) {
            this.setMsg("删除模具履历记录失败!");
            return (false);
        }

        result = Db.update("DELETE FROM MODULELIST WHERE MODULEBARCODE = ?", modulebarcode);
        if (result < 0) {
            this.setMsg("删除模具资料失败!");
            return (false);
        }

        return (true);
    }

    /**
     * 用于保存正在加工该工件的机台上的其他合并零件的讯息
     * 
     * @author ASUS
     * 
     */
    class DeviceOtherPartInfo {
        public int getPartcount() {
            return partcount;
        }

        public void setPartcount(int partcount) {
            this.partcount = partcount;
        }

        public List<Record> getPartlist() {
            return partlist;
        }

        public void setPartlist(List<Record> partlist) {
            this.partlist = partlist;
        }

        private int partcount;
        private List<Record> partlist = new ArrayList<Record>();
    }

}
