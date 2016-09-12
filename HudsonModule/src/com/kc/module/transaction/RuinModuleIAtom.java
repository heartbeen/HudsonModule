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
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.ControlUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.StringUtils;

public class RuinModuleIAtom extends BaseIAtom {
    private String disabledFlag;

    public String getDisabledFlag() {
        return disabledFlag;
    }

    public void setDisabledFlag(String disabledFlag) {
        this.disabledFlag = disabledFlag;
    }

    @Override
    public boolean run() throws SQLException {
        // 获取模具履历
        String modulebarcode = this.getController().getPara("modulebarcode");
        String empid = ControlUtils.getEmpBarCode(this.getController());

        // 用于更新记录
        Record updateRecord = null;
        // 获取当前的ORACLE格式时间
        Timestamp stampNow = DateUtils.getNowStampTime();

        StringBuilder builder = new StringBuilder();

        builder.append("SELECT ML.MODULEBARCODE, ML.MODULESTATE, MR.ID AS RID FROM MODULELIST ML ");
        builder.append("LEFT JOIN MD_RESUME MR ON ML.MODULEBARCODE = MR.MODULEBARCODE WHERE ML.MODULEBARCODE = ?");

        Record ml = Db.findFirst(builder.toString(), modulebarcode);

        if (ml == null) {
            this.setMsg("该模具资料已经不存在");
            return (false);
        }

        // 获取模具状态
        int state = ArithUtils.parseInt(ml.getStr("MODULESTATE"), 0);
        if (state == 1) {
            this.setMsg("该模具资料已经报废");
            return (false);
        }

        // 将这套模具的所有零件设置为报废状态
        int result = Db.update("UPDATE MD_PART_LIST SET ISENABLE = ? WHERE MODULEBARCODE = ?", this.getDisabledFlag(), modulebarcode);
        if (result < 0) {
            this.setMsg("报废模具零件资料失败");
            return (false);
        }

        result = Db.update("UPDATE MODULELIST SET MODULESTATE = ? WHERE MODULEBARCODE = ?", this.getDisabledFlag(), modulebarcode);
        if (result < 0) {
            return (false);
        }

        // 获取模具履历号,如果模具号为空,则表示这套模具没有进行加工
        String resumeid = ml.getStr("RID");
        if (StringUtils.isEmpty(resumeid)) {
            return (true);
        }

        // 删除模具履历
        boolean rst = false;
        rst = Db.deleteById("MD_RESUME", resumeid);
        if (!rst) {
            this.setMsg("删除模具加工履历失败!");
            return (false);
        }

        // 更新MD_RESUME_RECORD
        updateRecord = new Record();
        updateRecord.set("ID", resumeid).set("FINISHTIME", stampNow);
        rst = Db.update("MD_RESUME_RECORD", updateRecord);
        if (!rst) {
            this.setMsg("更新模具加工履历记录失败!");
            return (false);
        }

        builder = new StringBuilder();

        builder.append("SELECT MPI.ID AS MID, MPI.PARTBARLISTCODE, MPI.CURSORID, MPI.DEVICEPARTID, MPI.PARTCOUNT, MPR.OUTID ");
        builder.append(", MPI.PARTMERGEID, MPI.CURRENTDEPTID, MPI.MODULERESUMEID, MPF.ID AS FID, MPI.PARTBARLISTCODE, ");
        builder.append("MPR.LPROCRAFTID, MPR.LDEVDEPARTID, MPR.LPARTSTATEID, MPR.LDEVSTATEID, MPR.LEMPID, ");
        builder.append("MPR.LSCHEID, MPR.LEMPACTID, MPR.ISTIME, MPI.ISFIXED FROM MD_PROCESS_INFO MPI ");
        builder.append("LEFT JOIN MD_PROCESS_RESUME MPR ON MPI.CURSORID = MPR.ID ");
        builder.append("LEFT JOIN MD_PROCESS_FINISH MPF ON MPI.MODULERESUMEID = MPF.MODULERESUMEID ");
        builder.append("AND MPI.PARTBARLISTCODE = MPF.PARTBARLISTCODE WHERE MPI.MODULERESUMEID = ? ");
        builder.append("OR DEVICEPARTID IN (SELECT DISTINCT DEVICEPARTID FROM MD_PROCESS_INFO ");
        builder.append("WHERE MODULERESUMEID = ? AND DEVICEPARTID IS NOT NULL) ");

        List<Record> querys = Db.find(builder.toString(), resumeid, resumeid);

        if (querys.size() == 0) {
            return (true);
        }

        // 用于存放正在某台机台上加工的某个零件的其他合并零件的讯息
        Map<String, DeviceOtherPartInfo> deviceMap = new HashMap<String, DeviceOtherPartInfo>();

        for (Record rcd : querys) {
            String mid = rcd.getStr("MID");
            String cursorid = rcd.getStr("CURSORID");
            String devicepartid = rcd.getStr("DEVICEPARTID");
            String partbarlistcode = rcd.getStr("PARTBARLISTCODE");
            int partcount = ArithUtils.parseInt(rcd.getStr("PARTCOUNT"), 1);
            String outid = rcd.getStr("OUTID");
            String deptid = rcd.getStr("CURRENTDEPTID");
            Number isfixed = rcd.getNumber("ISFIXED");

            String rsmid = rcd.getStr("MODULERESUMEID");
            String fid = rcd.getStr("FID");

            // 如果设备代号不为空,则统计设备的机台零件讯息
            if (!StringUtils.isEmpty(devicepartid)) {

                DeviceOtherPartInfo dopi = null;
                if (!deviceMap.containsKey(devicepartid)) {
                    dopi = new DeviceOtherPartInfo();
                    dopi.setPartcount(partcount);

                    deviceMap.put(devicepartid, dopi);
                } else {
                    dopi = deviceMap.get(devicepartid);
                }

                // 如果是本套模具的零件,则将合并的零件数扣掉1,否则将此零件增加一笔资料
                if (resumeid.equals(rsmid)) {
                    dopi.setPartcount(dopi.getPartcount() - 1);
                } else {
                    dopi.getPartlist().add(rcd);
                }
            }

            // 如果零件为本模具零件，则执行以下操作
            if (resumeid.equals(rsmid)) {
                // 如果MD_PROCESS_RESUME表的ID号不为空,则将该资料记录更新
                if (!StringUtils.isEmpty(cursorid)) {
                    updateRecord = new Record();
                    updateRecord.set("ID", cursorid)
                                .set("NPARTSTATEID", RegularState.PART_STATE_RUIN.getIndex())
                                .set("NEMPID", empid)
                                .set("NDEPTID", deptid)
                                .set("NRCDTIME", stampNow);
                    rst = Db.update("MD_PROCESS_RESUME", updateRecord);
                    if (!rst) {
                        this.setMsg("更新零件加工讯息失败!");
                        return (false);
                    }
                }

                // 如果PART_OUTBOUND表的外发资料不为空,则将外发资料设置为回厂
                if (!StringUtils.isEmpty(outid)) {
                    updateRecord = new Record();
                    updateRecord.set("ID", outid)
                                .set("STATEID", RegularState.OUT_STATE_FINISH.getIndex())
                                .set("RECEVIER", empid)
                                .set("BACKTIME", stampNow)
                                .set("ISFINISH", 1);
                    rst = Db.update("PART_OUTBOUND", updateRecord);
                    if (!rst) {
                        this.setMsg("更新零件加工讯息失败!");
                        return (false);
                    }
                }

                // 如果加工完成讯息为空并且零件为固件(1为固件0为一般件)
                if (StringUtils.isEmpty(fid) && (isfixed != null && isfixed.intValue() == 0)) {

                    updateRecord = new Record();
                    updateRecord.set("ID", Barcode.MD_PROCESS_FINISH.nextVal())
                                .set("MID", mid)
                                .set("MODULERESUMEID", rsmid)
                                .set("PARTBARLISTCODE", partbarlistcode)
                                .set("FINISHDATE", stampNow);

                    rst = Db.save("MD_PROCESS_FINISH", updateRecord);
                    if (!rst) {
                        this.setMsg("保存零件加工完成讯息失败!");
                        return (false);
                    }
                }

                // 删除MD_PROCESS_INFO表的记录
                rst = Db.deleteById("MD_PROCESS_INFO", mid);
                if (!rst) {
                    this.setMsg("删除零件加工讯息失败!");
                    return (false);
                }
            }
        }

        if (deviceMap.size() > 0) {
            Barcode.DEVICE_PROCESS_RESUME.nextVal(true);
            Barcode.MODULE_PROCESS_RESUME.nextVal(true);

            for (String key : deviceMap.keySet()) {

                DeviceOtherPartInfo temp = deviceMap.get(key);

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
                                .set("ACTIONDATE", stampNow)
                                .set("ACTIONTYPE", RegularState.EMP_ACTION_DOWN.getIndex());

                    rst = Db.save("DEVICE_PROCESS_RESUME", updateRecord);
                    if (!rst) {
                        this.setMsg("保存机台异动记录失败!");
                        return (false);
                    }
                } else {
                    for (Record ak : temp.getPartlist()) {

                        String mid = ak.getStr("MID");
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
                                        .set("NRCDTIME", stampNow);

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
                                    .set("LRCDTIME", stampNow)
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
                        updateRecord.set("ID", mid).set("PARTMERGEID", mergeid).set("PARTCOUNT", temp.getPartcount() + "").set("CURSORID", appendid);

                        rst = Db.update("MD_PROCESS_INFO", updateRecord);
                        if (!rst) {
                            this.setMsg("保存零件加工讯息失败!");
                            return (false);
                        }
                    }
                }
            }
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
