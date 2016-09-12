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
import com.kc.module.utils.DBUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.JsonUtils;

/**
 * 处理零件完工操作
 * 
 * @author ASUS
 * 
 */
public class ProcessPartFinishIAtom extends BaseIAtom {

    @Override
    public boolean run() throws SQLException {
        String ids = this.getController().getPara("ids");
        if (StringUtils.isEmpty(ids)) {
            return false;
        }

        String empid = ControlUtils.getEmpBarCode(this.getController());

        List<String> idList = JsonUtils.parseJsArrayList(ids);

        StringBuilder builder = new StringBuilder();

        builder.append("SELECT MPI.ID AS MPIID, MPI.PARTBARLISTCODE, MPI.MODULERESUMEID, MPI.DEVICEPARTID, MPI.CURSORID, MPF.ID AS MPFID, ");
        builder.append(" MPI.CURRENTDEPTID, MPR.OUTID FROM MD_PROCESS_INFO MPI LEFT JOIN MD_PROCESS_RESUME MPR ON MPI.CURSORID = ");
        builder.append(" MPR.ID LEFT JOIN MD_PROCESS_FINISH MPF ON MPI.MODULERESUMEID = MPF.MODULERESUMEID ");
        builder.append("AND MPI.PARTBARLISTCODE = MPF.PARTBARLISTCODE WHERE MPI.ISFIXED = ? AND MPI.ID IN ").append(DBUtils.sqlIn(idList));

        List<Record> querys = Db.find(builder.toString(), 0);

        if (querys.size() > 0) {
            boolean rst = false;
            Record updateRecord = null;
            Timestamp stamp = DateUtils.getNowStampTime();
            // 机台讯息集合
            List<String> maclist = new ArrayList<String>();
            // 模具零件集合
            List<Record> partlist = new ArrayList<Record>();

            for (Record rec : querys) {
                // 部门机台唯一号
                String devicepartid = rec.getStr("DEVICEPARTID");
                // 零件完成标识唯一号
                String mpfid = rec.getStr("MPFID");
                // 如果完成标识不为空则删除之(已经完工的重新设置为加工状态)
                if (!StringUtils.isEmpty(mpfid)) {
                    rst = Db.deleteById("MD_PROCESS_FINISH", mpfid);
                    if (!rst) {
                        this.setMsg("设置零件为加工状态失败!");
                        return (false);
                    }
                }

                // 如果没有记录该模具的相关资料,则跳过
                if (!StringUtils.isEmpty(devicepartid)) {
                    if (!maclist.contains(devicepartid)) {
                        maclist.add(devicepartid);
                    }
                } else {
                    partlist.add(rec);
                }
            }

            if (maclist.size() > 0) {
                Map<String, DeviceOtherPartInfo> mac = new HashMap<String, DeviceOtherPartInfo>();

                builder = new StringBuilder();

                builder.append("SELECT MPI.ID AS MPIID, MPI.PARTBARLISTCODE, MPI.CURSORID, MPI.DEVICEPARTID, MPI.PARTCOUNT ");
                builder.append(", MPR.OUTID, MPI.PARTMERGEID, MPI.CURRENTDEPTID, MPI.MODULERESUMEID, MPF.ID AS MPFID ");
                builder.append(", MPI.PARTBARLISTCODE, MPR.LPROCRAFTID, MPR.LDEVDEPARTID, MPR.LPARTSTATEID, MPR.LDEVSTATEID ");
                builder.append(", MPR.LEMPID, MPR.LSCHEID, MPR.LEMPACTID, MPR.ISTIME, MPI.ISFIXED ");
                builder.append("FROM MD_PROCESS_INFO MPI ");
                builder.append("LEFT JOIN MD_PROCESS_RESUME MPR ON MPI.CURSORID = MPR.ID  ");
                builder.append("LEFT JOIN MD_PROCESS_FINISH MPF ON MPI.MODULERESUMEID = MPF.MODULERESUMEID ");
                builder.append("AND MPI.PARTBARLISTCODE = MPF.PARTBARLISTCODE ");
                builder.append("WHERE MPI.DEVICEPARTID IN ").append(DBUtils.sqlIn(maclist));

                List<Record> mills = Db.find(builder.toString());
                for (Record rcd : mills) {
                    // 零件加工唯一号
                    String mid = rcd.getStr("MPIID");
                    // 部门机台唯一号
                    String devicepartid = rcd.getStr("DEVICEPARTID");
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
                        if (idList.contains(mid)) {
                            dopi.setPartcount(dopi.getPartcount() - 1);
                            partlist.add(rcd);
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

            // 设置将要完工的零件
            if (partlist.size() > 0) {
                for (Record rcd : partlist) {
                    String mpiid = rcd.getStr("MPIID");
                    String partbarlistcode = rcd.getStr("PARTBARLISTCODE");
                    String moduleresumeid = rcd.getStr("MODULERESUMEID");
                    String cursorid = rcd.getStr("CURSORID");
                    String deptid = rcd.getStr("CURRENTDEPTID");
                    String mpfid = rcd.getStr("MPFID");
                    String outid = rcd.getStr("OUTID");

                    // 更新MD_PROCESS_INFO表的零件讯息
                    updateRecord = new Record();
                    updateRecord.set("ID", mpiid)
                                .set("DEVICEPARTID", "")
                                .set("PARTSTATEID", RegularState.PART_STATE_OVER.getIndex())
                                .set("DEVICEEMPID", "")
                                .set("SCHEDULEID", "")
                                .set("CURSORID", "")
                                .set("ACTIONTIME", stamp);

                    rst = Db.update("MD_PROCESS_INFO", updateRecord);
                    if (!rst) {
                        this.setMsg("保存零件加工讯息失败!");
                        return (false);
                    }

                    // 将MD_PROCESS_RESUME表中的记录补充完毕
                    if (!StringUtils.isEmpty(cursorid)) {
                        updateRecord = new Record();
                        updateRecord.set("ID", cursorid)
                                    .set("NPARTSTATEID", RegularState.PART_STATE_OVER.getIndex())
                                    .set("NEMPID", empid)
                                    .set("NEMPACTID", RegularState.EMP_ACTION_DOWN.getIndex())
                                    .set("NDEPTID", deptid)
                                    .set("NRCDTIME", stamp);

                        rst = Db.update("MD_PROCESS_RESUME", updateRecord);
                        if (!rst) {
                            this.setMsg("保存零件加工讯息失败!");
                            return (false);
                        }
                    }

                    // 如果PART_OUTBOUND表的外发资料不为空,则将外发资料设置为回厂
                    if (!StringUtils.isEmpty(outid)) {
                        updateRecord = new Record();
                        updateRecord.set("ID", outid)
                                    .set("STATEID", RegularState.OUT_STATE_FINISH.getIndex())
                                    .set("RECEVIER", empid)
                                    .set("BACKTIME", stamp)
                                    .set("ISFINISH", 1);
                        rst = Db.update("PART_OUTBOUND", updateRecord);
                        if (!rst) {
                            this.setMsg("更新零件加工讯息失败!");
                            return (false);
                        }
                    }

                    // 更新MD_PROCESS_FINISH表
                    if (StringUtils.isEmpty(mpfid)) {
                        updateRecord = new Record();
                        updateRecord.set("ID", Barcode.MD_PROCESS_FINISH.nextVal())
                                    .set("MID", mpiid)
                                    .set("MODULERESUMEID", moduleresumeid)
                                    .set("PARTBARLISTCODE", partbarlistcode)
                                    .set("FINISHDATE", stamp);

                        rst = Db.save("MD_PROCESS_FINISH", updateRecord);
                        if (!rst) {
                            this.setMsg("保存零件加工完成讯息失败!");
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
