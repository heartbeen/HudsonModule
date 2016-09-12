package com.kc.module.transaction;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.base.Barcode;
import com.kc.module.base.RegularState;
import com.kc.module.model.form.ApplyOutBoundForm;
import com.kc.module.utils.ControlUtils;
import com.kc.module.utils.DBUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.JsonUtils;
import com.kc.module.utils.StringUtils;

public class SaveOutBoundApply extends SqlTranscation {
    public static SaveOutBoundApply iAtom = new SaveOutBoundApply();

    // 返回结果
    public int result;
    // 连接字符串
    private final String sline = "****";
    // 错误讯息
    private String error = "";

    // 原始的工件状态

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public String getSline() {
        return sline;
    }

    public int getResult() {
        return result;
    }

    private void setResult(int result) {
        this.result = result;
    }

    /**
     * 将集合元素合并
     * 
     * @param coll
     * @param sep
     * @return
     */
    private String mergeList(List<String> coll, String sep) {
        if (coll == null || coll.size() == 0) {
            return "";
        }

        if (StringUtils.isEmpty(sep)) {
            sep = "";
        }

        String merge = "";
        for (String s : coll) {
            merge += (s + sep);
        }

        return merge.substring(0, merge.length() - sep.length());
    }

    /**
     * 用指定的分割符分割字符串
     * 
     * @param seq
     * @param sep
     * @return
     */
    private List<String> splitSequence(String seq, String sep) {
        // 判断是否为一个字符串,如果不是返回空的集合
        if (seq == null) {
            return new ArrayList<String>();
        }

        // 将字符串用分隔符分割
        String[] sequence = seq.split(sep, -1);
        List<String> arrayRow = new ArrayList<String>();
        // 将分割后的字符装入集合中
        for (String r : sequence) {
            arrayRow.add(r);
        }

        return arrayRow;
    }

    @Override
    public boolean run() {
        try {
            // 获取待提交的资料行
            String data = this.ctrl.getPara("data");
            // 原始的工件状态ID
            String ostateid = StringUtils.parseString(this.ctrl.getPara("ostateid"));
            // 要转化成的工件状态ID
            String fstateid = StringUtils.parseString(this.ctrl.getPara("fstateid"));
            // 在外发情况下工件要具备的状态
            String pstateid = StringUtils.parseString(this.ctrl.getPara("pstateid"));
            // 保存时间的列名
            String timecol = StringUtils.parseString(this.ctrl.getPara("timecol"));
            // 保存员工讯息的列名
            String empcol = StringUtils.parseString(this.ctrl.getPara("empcol"));
            // 员工ID唯一号
            String empid = ControlUtils.getEmpBarCode(this.ctrl);
            // 系统操作者所在的部门ID编号
            String regionid = ControlUtils.getDeptRegionPosid(this.ctrl);
            // 是否操作工件加工记录
            boolean isresume = this.ctrl.getParaToBoolean("isresume");
            // 是否标记工件外发完成
            boolean isfinish = this.ctrl.getParaToBoolean("isfinish");
            // 是否标记部门编号
            boolean isdept = this.ctrl.getParaToBoolean("isdept");
            // 解析每行的数据
            ApplyOutBoundForm[] info = JsonUtils.josnToBean(data, ApplyOutBoundForm[].class);
            // 如果解析资料行为0则返回
            if (info == null || info.length == 0) {
                this.setResult(-1);
                return (false);
            }
            // 用于存放解析后的工件资料
            List<String> arr = new ArrayList<String>();
            Map<String, ApplyOutBoundForm> mapping = new HashMap<String, ApplyOutBoundForm>();

            for (ApplyOutBoundForm abf : info) {
                arr.add(abf.getPartbarlistcode());
                mapping.put(abf.getPartbarlistcode(), abf);
            }

            List<String> stateArr = splitSequence(ostateid, ",");
            // 设置对前台发送的工件讯息的查询SQL语句
            StringBuilder builder = new StringBuilder();

            builder.append("SELECT ML.MODULECODE, MPL.PARTBARLISTCODE, MPL.PARTLISTCODE, ");
            builder.append("PO.ID AS PID, MPI.ID AS MID, MPI.PARTSTATEID, MPI.CURSORID, ");
            builder.append("PO.STATEID FROM MD_PART_LIST MPL ");
            builder.append("LEFT JOIN MODULELIST ML ON MPL.MODULEBARCODE = ML.MODULEBARCODE ");
            builder.append("LEFT JOIN MD_PROCESS_INFO MPI ON MPL.PARTBARLISTCODE = MPI.PARTBARLISTCODE ");
            builder.append("LEFT JOIN (SELECT * FROM PART_OUTBOUND WHERE ISFINISH = 0) PO ON ");
            builder.append("MPL.PARTBARLISTCODE = PO.PARTLISTBARCODE WHERE MPL.ISENABLE = 0 ");
            builder.append("AND MPL.PARTBARLISTCODE IN ");

            builder.append(DBUtils.sqlIn(arr));
            // 执行对SQL语句的查询并且遍历其中的讯息
            List<Record> queryRecord = Db.find(builder.toString());
            if (queryRecord.size() > 0) {
                // 执行对数据库进行操作的类
                Record record = null;
                // 声明操作数据库类的执行结果变量
                boolean success = false;
                // 刷新工件的MD_PROCESS_RESUME记录表
                Barcode.MODULE_PROCESS_RESUME.nextVal(true);
                // 获取当前的SQL格式的时间
                Timestamp sdate = DateUtils.getNowStampTime();

                for (Record r : queryRecord) {
                    String partbarlistcode = StringUtils.parseString(r.get("PARTBARLISTCODE"));
                    String stateid = StringUtils.parseString(r.get("STATEID"));
                    String pid = StringUtils.parseString(r.get("PID"));
                    String cursorid = StringUtils.parseString(r.get("CURSORID"));
                    String mid = StringUtils.parseString(r.get("MID"));
                    String modulecode = StringUtils.parseString(r.get("MODULECODE"));
                    String partlistcode = StringUtils.parseString(r.get("PARTLISTCODE"));
                    String partstateid = StringUtils.parseString(r.get("PARTSTATEID"));

                    if (partstateid.equals(RegularState.PART_STATE_PROCESS.getIndex())) {
                        this.setError(modulecode + this.sline + partlistcode);
                        this.setResult(-2);
                        return (false);
                    }

                    // 加载工件的相关内容
                    ApplyOutBoundForm aobf = mapping.get(partbarlistcode);
                    // 如果外发讯息不存在,则新增外发资料
                    if (StringUtils.isEmpty(pid)) {
                        // 如果原始工艺与数据库中的工艺相同,则更新成新的状态
                        if (stateArr.contains(stateid)) {
                            // 新增一个外发操作
                            record = new Record();
                            // 生成外发的ID号
                            String toutid = Barcode.OUTBOUND_RESUME.nextVal();

                            record.set("ID", toutid)
                                  .set("PARTLISTBARCODE", partbarlistcode)
                                  .set("STATEID", fstateid)
                                  .set(empcol, empid)
                                  .set(timecol, sdate)
                                  .set("APPLYTIME", sdate)
                                  .set("OUTCRAFTID", mergeList(aobf.getCraftid(), ","))
                                  .set("OUTCRAFTNAME", aobf.getCraftname())
                                  .set("CHARGES", aobf.getFee())
                                  .set("OUTFACTORYID", aobf.getFactoryid())
                                  .set("OUTGUESTNAME", aobf.getFactoryname())
                                  .set("OUTADDRESS", aobf.getAddress())
                                  .set("APPLYCOMMENT", StringUtils.trimBlank(aobf.getIntro(), null))
                                  .set("MODULERESUMEID", aobf.getResumeid())
                                  .set("OUTPHONE", aobf.getOutphone())
                                  .set("CONTACTOR", aobf.getContactor())
                                  .set("PLANOUTTIME", DateUtils.parseTimeStamp(aobf.getPlanouttime()))
                                  .set("PLANBACKTIME", DateUtils.parseTimeStamp(aobf.getPlanbacktime()))
                                  .set("OUTCRAFTCODE", mergeList(aobf.getCraftcode(), ","));

                            success = Db.save("PART_OUTBOUND", record);
                            if (!success) {
                                this.setResult(-3);
                                return (false);
                            }

                            if (isresume) {
                                if (!StringUtils.isEmpty(cursorid)) {
                                    record = new Record();

                                    record.set("ID", cursorid)
                                          .set("NPARTSTATEID", pstateid)
                                          .set("NEMPID", empid)
                                          .set("NRCDTIME", sdate)
                                          .set("NDEPTID", isdept ? regionid : "");

                                    success = Db.update("MD_PROCESS_RESUME", record);
                                    if (!success) {
                                        this.setResult(-3);
                                        return (false);
                                    }
                                }

                                // 新生成一个MD_PROCESS_INFO表的ID号
                                String mprid = Barcode.MODULE_PROCESS_RESUME.nextVal();
                                // 新增一个加工记录至MD_PROCESS_RESUME表
                                record = new Record();
                                record.set("ID", mprid)
                                      .set("PARTBARLISTCODE", partbarlistcode)
                                      .set("LPARTSTATEID", pstateid)
                                      .set("LEMPID", empid)
                                      .set("LDEPTID", isdept ? regionid : "")
                                      .set("LRCDTIME", sdate)
                                      .set("PARTCOUNT", "1")
                                      .set("MID", mid)
                                      .set("RSMID", aobf.getResumeid())
                                      .set("ISTIME", "1")
                                      .set("OUTID", toutid);

                                success = Db.save("MD_PROCESS_RESUME", record);
                                if (!success) {
                                    this.setResult(-3);
                                    return (false);
                                }

                                record = new Record();
                                record.set("ID", mid)
                                      .set("PARTBARLISTCODE", partbarlistcode)
                                      .set("PARTSTATEID", pstateid)
                                      .set("MODULERESUMEID", aobf.getResumeid())
                                      .set("CURRENTDEPTID", isdept ? regionid : "")
                                      .set("ACTIONTIME", sdate)
                                      .set("PARTCOUNT", "1")
                                      .set("CURSORID", mprid);

                                // 将MD_PROCESS_INFO表的记录进行更新
                                success = Db.update("MD_PROCESS_INFO", record);
                                if (!success) {
                                    this.setResult(-3);
                                    return (false);
                                }
                            }
                        }
                    } else {
                        if (stateArr.contains(stateid)) {
                            record = new Record();
                            record.set("ID", pid).set("STATEID", fstateid).set(timecol, sdate).set(empcol, empid).set("ISFINISH", isfinish ? 1 : 0);

                            success = Db.update("PART_OUTBOUND", record);
                            if (!success) {
                                this.setResult(-3);
                                return (false);
                            }
                            /** Rock 2015-05-15 原本为需要审核才能外发修改为现在的直接外发 */
                            // 如果需要生成MD_PROCESS_INFO加工记录则执行以下代码
                            if (isresume) {
                                if (!StringUtils.isEmpty(cursorid)) {
                                    record = new Record();

                                    record.set("ID", cursorid)
                                          .set("NPARTSTATEID", pstateid)
                                          .set("NEMPID", empid)
                                          .set("NRCDTIME", sdate)
                                          .set("NDEPTID", isdept ? regionid : "");

                                    success = Db.update("MD_PROCESS_RESUME", record);
                                    if (!success) {
                                        this.setResult(-3);
                                        return (false);
                                    }
                                }

                                // 新生成一个MD_PROCESS_INFO表的ID号
                                String mprid = Barcode.MODULE_PROCESS_RESUME.nextVal();
                                // 新增一个加工记录至MD_PROCESS_RESUME表
                                record = new Record();
                                record.set("ID", mprid)
                                      .set("PARTBARLISTCODE", partbarlistcode)
                                      .set("LPARTSTATEID", pstateid)
                                      .set("LEMPID", empid)
                                      .set("LDEPTID", isdept ? regionid : "")
                                      .set("LRCDTIME", sdate)
                                      .set("PARTCOUNT", "1")
                                      .set("MID", mid)
                                      .set("RSMID", aobf.getResumeid())
                                      .set("ISTIME", "1");

                                success = Db.save("MD_PROCESS_RESUME", record);
                                if (!success) {
                                    this.setResult(-3);
                                    return (false);
                                }

                                // 如果已经
                                if (!StringUtils.isEmpty(mid)) {
                                    record = new Record();
                                    record.set("ID", mid)
                                          .set("PARTBARLISTCODE", partbarlistcode)
                                          .set("PARTSTATEID", pstateid)
                                          .set("MODULERESUMEID", aobf.getResumeid())
                                          .set("CURRENTDEPTID", isdept ? regionid : "")
                                          .set("ACTIONTIME", sdate)
                                          .set("PARTCOUNT", "1")
                                          .set("CURSORID", mprid);

                                    // 将MD_PROCESS_INFO表的记录进行更新
                                    success = Db.update("MD_PROCESS_INFO", record);
                                    if (!success) {
                                        this.setResult(-3);
                                        return (false);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            this.setResult(1);
            return (true);
        }
        catch (Exception e) {
            this.setResult(-4);
            return (false);
        }
    }
}