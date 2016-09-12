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
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.ControlUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.JsonUtils;
import com.kc.module.utils.StringUtils;

public class UpdateOutBoundAboard extends SqlTranscation {
    public static UpdateOutBoundAboard iAtom = new UpdateOutBoundAboard();

    @Override
    public boolean run() {
        String data = this.ctrl.getPara(this.ajaxAttr[0]);
        String timecol = this.ctrl.getPara(this.ajaxAttr[1]);
        String ostateid = this.ctrl.getPara(this.ajaxAttr[2]);
        String estateid = this.ctrl.getPara(this.ajaxAttr[3]);
        String outemp = this.ctrl.getPara(this.ajaxAttr[4]);

        String empid = ControlUtils.getAccountId(this.ctrl);

        Timestamp nowTime = DateUtils.parseTimeStamp(DateUtils.getDateNow());

        String[] list = JsonUtils.parseUniqueJsArray(data);

        // 如果资料解析后内容为空,则直接返回TRUE
        if (data == null) {
            return (true);
        }

        StringBuilder builder = new StringBuilder("SELECT ID,PARTLISTBARCODE,STATEID FROM PART_OUTBOUND WHERE ID IN ('");
        for (String s : list) {
            builder.append(s).append("','");
        }
        String sql = builder.substring(0, builder.length() - 2) + ")";

        List<Record> queryRecord = Db.find(sql);
        List<String> partBarList = new ArrayList<String>();
        Map<String, String> listRecord = new HashMap<String, String>();
        List<Record> sqlRecord = new ArrayList<Record>();

        if (queryRecord != null) {
            for (Record rcd : queryRecord) {
                String rid = rcd.getStr("ID");
                String pst = rcd.getStr("PARTLISTBARCODE");
                String sid = rcd.getStr("STATEID");

                // 如果工具讯息状态不是指定状态,则跳过
                if (!sid.equals(ostateid)) {
                    continue;
                }

                // 将工件添加至缓冲池以备后边调用
                if (!partBarList.contains(pst)) {
                    partBarList.add(pst);
                }

                if (!listRecord.containsKey(rid)) {
                    listRecord.put(rid, sid);
                }
            }
        }

        if (partBarList.size() > 0) {
            // 查询缓冲池中的关于工件的讯息
            builder = new StringBuilder();
            builder.append("SELECT a.*, b.ID AS MID, b.PARTID, b.DEVICEID, b.BATCHNO ");
            builder.append(", b.STATEID, b.CRAFTID, b.EMPID, b.LAUNCH ");
            builder.append("FROM MD_PROCESS_INFO a ");
            builder.append("LEFT JOIN DEVICE_DEPART b ON a.DEVICEPARTID = b.ID WHERE PARTBARLISTCODE IN ('");

            for (String s : partBarList) {
                builder.append(s).append("','");
            }

            sql = builder.substring(0, builder.length() - 2) + ")";

            List<Record> bufferRecord = Db.find(sql);

            Map<String, MacRow> partCountMap = new HashMap<String, MacRow>();

            if (bufferRecord.size() > 0) {
                for (Record item : bufferRecord) {
                    String macid = item.getStr("DEVICEPARTID");
                    String stateid = StringUtils.nvl(item.getStr("STATEID"),
                                                     RegularState.MACHINE_STOP.getIndex());
                    int cnt = ArithUtils.parseInt(item.getStr("PARTCOUNT"), 1);

                    if (StringUtils.isEmpty(macid)) {
                        continue;
                    }

                    // 如果不存在机台的相关讯息,增加机台讯息
                    if (!partCountMap.containsKey(macid)) {
                        partCountMap.put(macid, new MacRow(macid, stateid, cnt));
                    }
                }

                boolean rst = false;
                String t_barcode = null;

                for (Record item : bufferRecord) {
                    String id = item.getStr("ID");
                    String macid = item.getStr("DEVICEPARTID");
                    String rsmid = item.getStr("MODULERESUMEID");
                    String partbarlistcode = item.getStr("PARTBARLISTCODE");
                    String cursorid = item.getStr("CURSORID");

                    if (!rst) {
                        t_barcode = Barcode.MODULE_PROCESS_RESUME.nextVal(true);
                        rst = true;
                    } else {
                        t_barcode = Barcode.MODULE_PROCESS_RESUME.nextVal();
                    }

                    // 如果工件
                    if (!partCountMap.containsKey(macid)) {
                        // 将MD_PROCESS_INFO表中的记录更新
                        Record record = new Record();
                        record.set("PARTMERGEID", "")
                              .set("PARTSTATEID", RegularState.PART_STATE_OUT.getIndex())
                              .set("SCHEDULEID", "")
                              .set("ACTIONTIME", nowTime)
                              .set("CURRENTDEPTID", "")
                              .set("CURSORID", t_barcode)
                              .set("ID", id);

                        boolean rs = Db.update("MD_PROCESS_INFO", record);
                        if (!rs) {
                            return rs;
                        }

                        if (!StringUtils.isEmpty(cursorid)) {
                            // 将MD_PROCESS_RESUME表的旧记录更新
                            record = new Record();
                            record.set("NPARTSTATEID", RegularState.PART_STATE_OUT.getIndex())
                                  .set("NEMPID", empid)
                                  .set("NEMPACTID", RegularState.EMP_ACTION_OUT.getIndex())
                                  .set("NRCDTIME", nowTime)
                                  .set("ID", cursorid);
                            rs = Db.update("MD_PROCESS_RESUME", record);
                            if (!rs) {
                                return rs;
                            }
                        }

                        // 在MD_PROCESS_RESUME表中新增一笔记录
                        record = new Record();
                        record.set("ID", t_barcode)
                              .set("PARTBARLISTCODE", partbarlistcode)
                              .set("LPARTSTATEID", RegularState.PART_STATE_OUT.getIndex())
                              .set("LEMPID", empid)
                              .set("LEMPACTID", RegularState.EMP_ACTION_OUT.getIndex())
                              .set("LRCDTIME", nowTime)
                              .set("PARTCOUNT", "1")
                              .set("MID", id)
                              .set("RSMID", rsmid)
                              .set("ISTIME", "1");

                        rs = Db.save("MD_PROCESS_RESUME", record);
                        if (!rs) {
                            return rs;
                        }

                    } else {
                        MacRow tempRow = partCountMap.get(macid);

                        Record record = new Record();
                        record.set("DEVICEPARTID", "")
                              .set("PARTSTATEID", RegularState.PART_STATE_OUT.getIndex())
                              .set("SCHEDULEID", "")
                              .set("ACTIONTIME", nowTime)
                              .set("CURRENTDEPTID", "")
                              .set("CURSORID", t_barcode)
                              .set("ID", id)
                              .set("DEVICELAUNCHDATE", null);

                        boolean rs = Db.update("MD_PROCESS_INFO", record);
                        if (!rs) {
                            return rs;
                        }

                        if (!StringUtils.isEmpty(cursorid)) {
                            // 将MD_PROCESS_RESUME表的旧记录更新
                            record = new Record();
                            record.set("NDEVDEPARTID", "")
                                  .set("NPARTSTATEID", RegularState.PART_STATE_OUT.getIndex())
                                  .set("NPROCRAFTID", "")
                                  .set("NEMPID", empid)
                                  .set("NEMPACTID", RegularState.EMP_ACTION_OUT.getIndex())
                                  .set("NRCDTIME", nowTime)
                                  .set("ID", cursorid);
                            rs = Db.update("MD_PROCESS_RESUME", record);
                            if (!rs) {
                                return rs;
                            }
                        }

                        // 在MD_PROCESS_RESUME表中新增一笔记录
                        record = new Record();
                        record.set("ID", t_barcode)
                              .set("PARTBARLISTCODE", partbarlistcode)
                              .set("LPARTSTATEID", RegularState.PART_STATE_OUT.getIndex())
                              .set("LEMPID", empid)
                              .set("LEMPACTID", RegularState.EMP_ACTION_OUT.getIndex())
                              .set("LRCDTIME", nowTime)
                              .set("PARTCOUNT", tempRow.getCount() + "")
                              .set("MID", id)
                              .set("RSMID", rsmid)
                              .set("ISTIME", "1");

                        rs = Db.save("MD_PROCESS_RESUME", record);
                        if (!rs) {
                            return rs;
                        }

                        tempRow.setCount(tempRow.getCount() - 1);
                    }
                }

                /** 处理机台的相关讯息 */
                for (String key : partCountMap.keySet()) {
                    Record rcd = new Record();
                    int cnt = partCountMap.get(key).getCount();
                    if (cnt < 1) {
                        rcd.set("ID", key)
                           .set("STATEID", RegularState.MACHINE_STOP.getIndex())
                           .set("EMPID", "")
                           .set("LAUNCH", "");
                        boolean rs = Db.update("DEVICE_DEPART", rcd);
                        if (!rs) {
                            return rs;
                        }

                        rcd = new Record();
                        rcd.set("ID", Barcode.DEVICE_PROCESS_RESUME.nextVal())
                           .set("DEVICEPARTID", key)
                           .set("STATEID", RegularState.MACHINE_STOP.getIndex())
                           .set("CRAFTID", "")
                           .set("EMPID", empid)
                           .set("ACTIONDATE", nowTime)
                           .set("ACTIONTYPE", RegularState.EMP_ACTION_OUT.getIndex());
                        rs = Db.save("DEVICE_PROCESS_RESUME", rcd);
                        if (!rs) {
                            return rs;
                        }
                    } else if (cnt == 1) {
                        int rs = Db.update("UPDATE MD_PROCESS_INFO SET PARTMERGEID = '',PARTCOUNT = '1' WHERE DEVICEPARTID ='"
                                           + key
                                           + "'");
                        if (rs < 0) {
                            return (false);
                        }

                    } else {

                        int rs = Db.update("UPDATE MD_PROCESS_INFO SET PARTCOUNT = '"
                                           + cnt
                                           + "' WHERE DEVICEPARTID ='"
                                           + key
                                           + "'");
                        if (rs < 0) {
                            return (false);
                        }
                    }
                }
            }
        }

        for (String s : list) {
            if (listRecord.containsKey(s) && listRecord.get(s).equals(ostateid)) {
                Record record = new Record();
                record.set("STATEID", estateid)
                      .set(timecol, DateUtils.parseTimeStamp(DateUtils.getDateNow()))
                      .set("OUTMAN", outemp)
                      .set("ID", s);
                sqlRecord.add(record);
            }
        }

        for (Record r : sqlRecord) {
            boolean rs = Db.update("PART_OUTBOUND", r);
            if (!rs) {
                return rs;
            }
        }

        return (true);
    }
}

class MacRow {
    public MacRow(String macid, String stateid, int count) {
        this.macid = macid;
        this.stateid = stateid;
        this.count = count;
    }

    private String macid;

    public String getMacid() {
        return macid;
    }

    public void setMacid(String macid) {
        this.macid = macid;
    }

    public String getStateid() {
        return stateid;
    }

    public void setStateid(String stateid) {
        this.stateid = stateid;
    }

    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }

    private String stateid;
    private int count;
}
