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
import com.kc.module.model.form.ScrapPartForm;
import com.kc.module.utils.DBUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.JsonUtils;
import com.kc.module.utils.StringUtils;

public class DelPartInfoIAtom extends BaseIAtom {
    @Override
    public boolean run() throws SQLException {
        try {
            // 解析前台发送的要取消或者报废的工件讯息
            ScrapPartForm[] spf = JsonUtils.josnToBean(this.getController().getPara("info"), ScrapPartForm[].class);
            // 如果解析后的数据为空,则返回
            if (spf == null || spf.length == 0) {
                this.setMsg("没有删除报废的零件讯息");
                return (false);
            }

            // 生成用于存放前台工件讯息的变量
            List<String> pArr = new ArrayList<String>();
            Map<String, ScrapPartForm> pMap = new HashMap<String, ScrapPartForm>();
            // 遍历前台传来的工件编号
            for (ScrapPartForm sf : spf) {
                pArr.add(sf.getPartbarlistcode());
                pMap.put(sf.getPartbarlistcode(), sf);
            }

            StringBuilder builder = new StringBuilder();

            builder.append("SELECT MP.PARTBARCODE, MPL.PARTBARLISTCODE, MPL.PARTLISTCODE,MPI.CURRENTDEPTID, MPL.ISFIXED, MPI.ID AS MPIID, MR.ID AS RID, MPI.PARTSTATEID ");
            builder.append(", MPI.CURSORID, MPI.ISMAJOR, MPF.ID AS MPFID, MP.QUANTITY AS PTY, MPL.QUANTITY AS MTY, (SELECT COUNT(*) FROM MD_PROCESS_RESUME ");
            builder.append("WHERE PARTBARLISTCODE = MPL.PARTBARLISTCODE) AS PCOUNT,(SELECT MAX(ID) FROM MD_RESUME_SECTION WHERE RESUMEID = MR.ID) AS SID FROM MD_PART_LIST MPL ");
            builder.append("LEFT JOIN MD_RESUME MR ON MPL.MODULEBARCODE = MR.MODULEBARCODE LEFT JOIN MD_PART MP ON MPL.PARTBARCODE = MP.PARTBARCODE ");
            builder.append("LEFT JOIN MD_PROCESS_INFO MPI ON MPL.PARTBARLISTCODE = MPI.PARTBARLISTCODE ");
            builder.append("LEFT JOIN MD_PROCESS_FINISH MPF ON MPI.MODULERESUMEID = MPF.MODULERESUMEID ");
            builder.append("AND MPI.PARTBARLISTCODE = MPF.PARTBARLISTCODE WHERE MPL.ISENABLE = ? AND MPL.PARTBARLISTCODE IN ");

            // 处理工件号为IN语句
            builder.append(DBUtils.sqlIn(pArr));
            // 用于存储工件的查询结果
            List<Record> queryRecord = Db.find(builder.toString(), 0);
            // 如果查询结果为0则返回TRUE
            if (queryRecord.size() == 0) {
                this.setMsg("没有报废零件的相关讯息");
                return (true);
            }

            Record record = null;
            boolean success = false;

            Map<String, Integer> partCount = new HashMap<String, Integer>();
            // 获取当前时间
            Timestamp sdate = DateUtils.getNowStampTime(); 
            // MD_PROCESS_FINISH表重新加载
            Barcode.MD_PROCESS_FINISH.nextVal(true);
            Barcode.MD_PROCESS_INFO.nextVal(true);
            Barcode.MODULE_PART_LIST.nextVal(true);
            Barcode.MODULE_EST_SCHEDULE.nextVal(true);

            for (Record mPart : queryRecord) {
                String partbarcode = mPart.getStr("PARTBARCODE");
                String partbarlistcode = mPart.getStr("PARTBARLISTCODE");
                String partlistcode = mPart.getStr("PARTLISTCODE");

                String mpiid = mPart.getStr("MPIID");
                String rid = mPart.getStr("RID");
                String cursorid = mPart.getStr("CURSORID");
                String mpfid = mPart.getStr("mpfid");
                String partstateid = mPart.getStr("PARTSTATEID");
                String deptid = mPart.getStr("CURRENTDEPTID");
                String sid = mPart.getStr("SID");

                if (RegularState.PART_STATE_PROCESS.getIndex().equals(partstateid)) {
                    this.setMsg(partlistcode + "正在加工中，请先下机");
                    return (false);
                }

                if (RegularState.PART_STATE_OUT.getIndex().equals(partstateid)) {
                    this.setMsg(partlistcode + "现在外发中，请先确认回厂");
                    return (false);
                }

                // 是否为固件(1基件0非基件)
                int isfixed = getInt(mPart.getNumber("ISFIXED"), 0);
                int ismajor = getInt(mPart.getNumber("ISMAJOR"), 1);
                int pty = getInt(mPart.getNumber("PTY"), 0);
                int mty = getInt(mPart.getNumber("MTY"), 0);
                int pcount = getInt(mPart.getNumber("PCOUNT"), 0);

                if (!partCount.containsKey(partbarcode)) {
                    partCount.put(partbarcode, pty);
                }

                ScrapPartForm k_spf = pMap.get(partbarlistcode);
                if (k_spf == null) {
                    continue;
                }

                // 判断零件对应的模具是否处于加工状态(TRUE为非加工状态FALSE为加工状态)
                if (StringUtils.isEmpty(rid) || StringUtils.isEmpty(mpiid)) {
                    // 是否新规零件
                    if (!k_spf.getIsnew()) {
                        // 如果加工记录为空则删除零件讯息;否则修改零件为报废状态
                        if (pcount == 0) {
                            // 删除MD_PART表中的资料
                            success = Db.deleteById("MD_PART", "PARTBARCODE", partbarcode);
                            if (!success) {
                                this.setMsg("删除部件讯息失败");
                                return success;
                            }
                            // 删除MD_PART_LIST表中的资料
                            success = Db.deleteById("MD_PART_LIST", "PARTBARLISTCODE", partbarlistcode);
                            if (!success) {
                                this.setMsg("删除零件讯息失败");
                                return success;
                            }
                        } else {

                            int leftCount = partCount.get(partbarcode) - mty;
                            leftCount = (leftCount < 0 ? 0 : leftCount);
                            partCount.put(partbarcode, leftCount);

                            // MD_PART
                            record = new Record();
                            record.set("PARTBARCODE", partbarcode).set("QUANTITY", leftCount);
                            success = Db.update("MD_PART", "PARTBARCODE", record);
                            if (!success) {
                                this.setMsg("更新部件讯息失败");
                                return success;
                            }

                            // MD_PART_LIST
                            record = new Record();
                            record.set("PARTBARLISTCODE", partbarlistcode).set("ISENABLE", "1");
                            success = Db.update("MD_PART_LIST", "PARTBARLISTCODE", record);
                            if (!success) {
                                this.setMsg("更新零件讯息失败");
                                return success;
                            }
                        }
                    } else {
                        // 如果零件包含加工记录则新增一个否则保持不变
                        if (pcount > 0) {
                            record = Db.findById("MD_PART_LIST", "PARTBARLISTCODE", partbarlistcode, "*");
                            if (record == null) {
                                continue;
                            }

                            // 新增一个新的零件编号
                            record.set("PARTBARLISTCODE", Barcode.MODULE_PART_LIST.nextVal()).set("ISENABLE", "0");
                            success = Db.save("MD_PART_LIST", "PARTBARLISTCODE", record);
                            if (!success) {
                                this.setMsg("新增零件讯息失败");
                                return success;
                            }

                            // 将之前的零件编号设置为报废状态
                            record = new Record();
                            record.set("PARTBARLISTCODE", partbarlistcode).set("ISENABLE", "1");
                            success = Db.update("MD_PART_LIST", "PARTBARLISTCODE", record);
                            if (!success) {
                                this.setMsg("报废零件讯息失败");
                                return success;
                            }
                        }
                    }

                } else {
                    if (pcount > 0) {
                        if (ismajor == 1) {
                            if (!k_spf.getIsnew()) {
                                record = new Record();
                                int leftCount = partCount.get(partbarcode) - mty;
                                leftCount = (leftCount < 0 ? 0 : leftCount);
                                partCount.put(partbarcode, leftCount);

                                record.set("PARTBARCODE", partbarcode).set("QUANTITY", leftCount);
                                success = Db.update("MD_PART", "PARTBARCODE", record);
                                if (!success) {
                                    this.setMsg("更新部件讯息失败");
                                    return success;
                                }
                            } else {
                                String k_partbarlistcode = Barcode.MODULE_PART_LIST.nextVal();
                                record = Db.findById("MD_PART_LIST", "PARTBARLISTCODE", partbarlistcode, "*");
                                record.set("PARTBARLISTCODE", k_partbarlistcode);

                                // 新增零件至MD_PART_LIST
                                success = Db.save("MD_PART_LIST", "PARTBARLISTCODE", record);
                                if (!success) {
                                    this.setMsg("新增零件讯息失败");
                                    return success;
                                }

                                record = new Record();
                                record.set("ID", Barcode.MD_PROCESS_INFO.nextVal())
                                      .set("PARTBARLISTCODE", k_partbarlistcode)
                                      .set("MODULERESUMEID", rid)
                                      .set("ACTIONTIME", sdate)
                                      .set("PARTCOUNT", "1")
                                      .set("ISFIXED", isfixed)
                                      .set("ISMAJOR", 1);

                                // 新增零件至MD_PROCESS_INFO
                                success = Db.save("MD_PROCESS_INFO", record);
                                if (!success) {
                                    this.setMsg("新增零件加工讯息失败");
                                    return success;
                                }

                                // 新增零件加工明细至MD_PART_SECTION
                                if (!StringUtils.isEmpty(sid)) {
                                    record = new Record();
                                    record.set("ID", Barcode.MD_PART_SECTION.nextVal())
                                          .set("SECTIONID", sid)
                                          .set("PARTBARLISTCODE", k_partbarlistcode);

                                    success = Db.save("MD_PART_SECTION", record);
                                    if (!success) {
                                        this.setMsg("新增零件明细失败");
                                        return success;
                                    }
                                }

                                // 将旧的零件的排程讯息查询出来，复制到新的零件上
                                List<Record> querys = Db.find("SELECT * FROM MD_EST_SCHEDULE WHERE MODULERESUMEID = ? AND PARTID = ? AND TYPEID IS NULL",
                                                              rid,
                                                              partbarlistcode);

                                for (Record est : querys) {
                                    est.set("ID", Barcode.MODULE_EST_SCHEDULE.nextVal()).set("PARTID", k_partbarlistcode);

                                    success = Db.save("MD_EST_SCHEDULE", est);

                                    if (!success) {
                                        this.setMsg("新增零件排程失败");
                                        return success;
                                    }
                                }
                            }

                            // 删除MD_PROCESS_INFO加工记录
                            success = Db.deleteById("MD_PROCESS_INFO", mpiid);
                            if (!success) {
                                this.setMsg("删除零件加工讯息失败");
                                return success;
                            }

                            // 将之前的零件编号设置为报废状态
                            record = new Record();
                            record.set("PARTBARLISTCODE", partbarlistcode).set("ISENABLE", "1");
                            success = Db.update("MD_PART_LIST", "PARTBARLISTCODE", record);
                            if (!success) {
                                this.setMsg("更新零件讯息失败");
                                return success;
                            }

                            // 如果零件未完成则设置为完成状态
                            if (StringUtils.isEmpty(mpfid)) {
                                record = new Record();
                                record.set("ID", Barcode.MD_PROCESS_FINISH.nextVal())
                                      .set("MID", mpiid)
                                      .set("MODULERESUMEID", rid)
                                      .set("PARTBARLISTCODE", partbarlistcode)
                                      .set("FINISHDATE", sdate);

                                success = Db.save("MD_PROCESS_FINISH", record);
                                if (!success) {
                                    this.setMsg("更新零件完工讯息失败");
                                    return success;
                                }
                            }

                            // 如果CURSORID不为空则将记录补全
                            if (!StringUtils.isEmpty(cursorid)) {
                                record = new Record();
                                record.set("ID", cursorid)
                                      .set("NPARTSTATEID", RegularState.PART_STATE_RUIN.getIndex())
                                      .set("NDEPTID", deptid)
                                      .set("NRCDTIME", sdate);

                                success = Db.update("MD_PROCESS_RESUME", record);
                                if (!success) {
                                    this.setMsg("更新零件加工记录失败");
                                    return success;
                                }
                            }

                        } else {
                            success = Db.deleteById("MD_PROCESS_INFO", mpiid);
                            if (!success) {
                                this.setMsg("删除零件加工讯息失败");
                                return success;
                            }

                            // 如果CURSORID不为空则将记录补全
                            if (!StringUtils.isEmpty(cursorid)) {
                                record = new Record();
                                record.set("ID", cursorid)
                                      .set("NPARTSTATEID", RegularState.PART_STATE_RUIN.getIndex())
                                      .set("NDEPTID", deptid)
                                      .set("NRCDTIME", sdate);

                                success = Db.update("MD_PROCESS_RESUME", record);
                                if (!success) {
                                    this.setMsg("更新零件加工记录失败");
                                    return success;
                                }
                            }
                        }
                    } else {
                        // 如果为基件则执行如下代码否则删除加工讯息即可
                        if (ismajor == 1) {
                            if (!k_spf.getIsnew()) {
                                // 删除工件讯息
                                success = Db.deleteById("MD_PART_LIST", "PARTBARLISTCODE", partbarlistcode);
                                if (!success) {
                                    this.setMsg("删除零件讯息失败");
                                    return success;
                                }

                                int leftCount = partCount.get(partbarcode) - mty;
                                leftCount = (leftCount < 0 ? 0 : leftCount);

                                if (leftCount > 0) {
                                    partCount.put(partbarcode, leftCount);

                                    record = new Record();
                                    record.set("PARTBARCODE", partbarcode).set("QUANTITY", leftCount);
                                    success = Db.update("MD_PART", "PARTBARCODE", record);
                                    if (!success) {
                                        this.setMsg("更新部件讯息失败");
                                        return success;
                                    }
                                } else {
                                    success = Db.deleteById("MD_PART", "PARTBARCODE", partbarcode);
                                    if (!success) {
                                        this.setMsg("删除零件讯息失败");
                                        return success;
                                    }
                                }

                                success = Db.deleteById("MD_PROCESS_INFO", mpiid);
                                if (!success) {
                                    this.setMsg("删除零件加工讯息失败");
                                    return success;
                                }
                            }
                        } else {
                            success = Db.deleteById("MD_PROCESS_INFO", mpiid);
                            if (!success) {
                                this.setMsg("删除零件加工讯息失败");
                                return success;
                            }
                        }
                    }
                }
            }

            return (true);
        }
        catch (Exception e) {
            return (false);
        }
    }

    private int getInt(Number number, int def) {
        return (number == null ? def : number.intValue());
    }
}
