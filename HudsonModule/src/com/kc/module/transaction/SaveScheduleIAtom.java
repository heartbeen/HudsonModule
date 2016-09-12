package com.kc.module.transaction;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.model.ModuleEstSchedule;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.JsonUtils;

public class SaveScheduleIAtom extends SqlTranscation {
    public static SaveScheduleIAtom iAtom = new SaveScheduleIAtom();
    public static int SQL_RESULT = -1;

    @Override
    public boolean run() {
        SQL_RESULT = -1;
        try {
            if (this.ajaxAttr == null || this.ajaxAttr.length == 0) {
                SQL_RESULT = -1;
                return (false);
            }

            // 读取前台传送的模具工件排程的字符串讯息并解析成为Map集合
            Map<?, ?>[] partMap = JsonUtils.fromJsonStrToList(this.ctrl.getPara(this.ajaxAttr[0]));
            Map<?, ?>[] schMap = JsonUtils.fromJsonStrToList(this.ctrl.getPara(this.ajaxAttr[1]));
            // 判定Map集合是否为空
            if (!isMapArrayEmpty(partMap) || !isMapArrayEmpty(schMap)) {
                SQL_RESULT = -2;
                return (false);
            }

            // 获取工件编号以及排程数组
            List<String[]> partItems = getMapArrayToArray(partMap), schItems = getMapArrayToArray(schMap);

            // 查询数据库中对应工件的排程(条件)
            StringBuilder partCase = new StringBuilder();
            for (String[] items : partItems) {
                partCase.append(items[0]).append("','");
            }

            List<Record> partOriSch = getDbRecords(new String[]{"SELECT a.PARTBARLISTCODE,b.PARTID, b.STARTTIME, b.ENDTIME,",
                                                                " b.CRAFTID,a.ISENABLE, a.ISSCHEDULE",
                                                                " FROM md_part_list a ",
                                                                " LEFT JOIN md_est_schedule b ON a.PARTBARLISTCODE = b.PARTID",
                                                                " WHERE a.PARTBARLISTCODE in ('",
                                                                partCase.substring(0,
                                                                                   partCase.length() - 2),
                                                                ") ORDER BY a.PARTBARLISTCODE,b.STARTTIME"});

            // 获取查询后工件的实际个数
            Map<String, String> partDistinct = getRecordDistinctItems(partOriSch,
                                                                      "PARTBARLISTCODE",
                                                                      "ISENABLE",
                                                                      "ISSCHEDULE");
            // 如果查询的工件为空,则出现问题
            if (partDistinct == null) {
                SQL_RESULT = -3;
                return (false);
            } else {
                // 更新工件中的是否排程排程旗标
                for (String key : partDistinct.keySet()) {
                    if (partDistinct.get(key).equals("0")) {
                        Record updateRecord = new Record();
                        updateRecord.set("PARTBARLISTCODE", key).set("ISSCHEDULE", "1");
                        boolean up_rs = Db.update("MD_PART_LIST", "PARTBARLISTCODE", updateRecord);
                        if (!up_rs) {
                            SQL_RESULT = -5;
                            return up_rs;
                        }
                    }
                }
            }

            // 将工件排程保存至服务器
            ModuleEstSchedule est_sch = null;
            for (String[] items : schItems) {
                String mergeId = UUID.randomUUID().toString();

                for (String key : partDistinct.keySet()) {
                    String aloneId = UUID.randomUUID().toString();
                    if (partOriSch == null) {
                        continue;
                    } else {
                        if (!valErrorDateTime(key,
                                              "PARTBARLISTCODE",
                                              items[0],
                                              filterEmptyRecords(partOriSch,
                                                                 new String[]{"CRAFTID"}),
                                              "STARTTIME",
                                              "ENDTIME",
                                              "yyyy-MM-dd HH:mm:ss")) {
                            SQL_RESULT = -4;
                            return (false);
                        }
                        est_sch = new ModuleEstSchedule();
                        boolean est_sch_rs = est_sch.set("ID", aloneId)
                                                    .set("SCHID", mergeId)
                                                    .set("PARTID", key)
                                                    .set("STARTTIME",
                                                         Timestamp.valueOf(items[0] + ":00"))
                                                    .set("ENDTIME",
                                                         Timestamp.valueOf(items[1] + ":00"))
                                                    .set("CRAFTID", items[2])
                                                    .set("ISMERGE",
                                                         (schItems.size() == 1 ? "0" : "1"))
                                                    .save();
                        if (!est_sch_rs) {
                            SQL_RESULT = -5;
                            return (false);
                        }
                    }
                }
            }

            SQL_RESULT = 1;
            return (true);
        }
        catch (Exception e) {
            e.printStackTrace();
            SQL_RESULT = -6;
            return (false);
        }
    }

    /**
     * 获取数据库查询数据中的某个列的不重复值
     * 
     * @param record
     * @param col
     * @return
     */
    private Map<String, String> getRecordDistinctItems(List<Record> record,
                                                       String col,
                                                       String enable,
                                                       String sch) {
        // 如果数据库集合为空,则返回空
        if (record == null) {
            return (null);
        }

        Map<String, String> map = new HashMap<String, String>();
        for (Record r : record) {
            String partcode = r.getStr(col);
            String isenable = r.getStr(enable);
            String partsch = r.getStr(sch);

            if (isenable.equals("1")) {
                continue;
            }

            if (partcode != null && !partcode.trim().equals("")) {
                if (!map.containsKey(partcode)) {
                    map.put(partcode, partsch);
                }
            }
        }

        return map;
    }

    /**
     * 过滤指定数据库集合中列为空的数据
     * 
     * @param record
     * @param cols
     * @return
     */
    private List<Record> filterEmptyRecords(List<Record> record, String[] cols) {
        if (record == null || cols == null) {
            return (null);
        }

        // 过滤掉指定列为空的数据
        List<Record> list = new ArrayList<Record>();
        for (Record r : record) {
            boolean rs_flag = false;
            for (String col : cols) {
                Object item = r.get(col);
                if (item == null || item.toString().trim().equals("")) {
                    rs_flag = true;
                    break;
                }
            }

            if (!rs_flag) {
                list.add(r);
            }
        }
        return list;
    }

    /**
     * 判定某个工件的排程工艺安排过程中时间是否与之前已经排程过的时间冲突
     * 
     * @param partcode
     * @param colname
     * @param starttime
     * @param record
     * @param startdate
     * @param enddate
     * @param format
     * @return
     */
    private boolean valErrorDateTime(String partcode,
                                     String colname,
                                     String starttime,
                                     List<Record> record,
                                     String startdate,
                                     String enddate,
                                     String format) {
        if (record == null) {
            return (true);
        }
        try {
            long datetime = DateUtils.strToDate(starttime + ":00", format).getTime();
            for (int x = 0; x < record.size(); x++) {
                if (record.get(x).getStr(colname).equals(partcode)) {
                    long start = record.get(x).getTimestamp(startdate).getTime();
                    long end = record.get(x).getTimestamp(enddate).getTime();
                    if (datetime > start && datetime < end) {
                        return (false);
                    }
                }
            }

            return (true);
        }
        catch (Exception e) {
            return (false);
        }
    }

    /**
     * 获取数据库中已经存在的工件排程
     * 
     * @param sql
     * @return
     */
    private List<Record> getDbRecords(String... sql) {
        StringBuilder builder = new StringBuilder();
        for (String s : sql) {
            builder.append(s);
        }
        return Db.find(builder.toString());
    }

    /**
     * 获取Map数组的值并存放至ArrayList数组
     * 
     * @param craft
     * @return
     */
    private List<String[]> getMapArrayToArray(Map<?, ?>[] craft) {
        if (craft == null || craft.length == 0) {
            return (null);
        }

        List<String[]> arr = new ArrayList<String[]>();
        for (Map<?, ?> item : craft) {
            arr.add(JsonUtils.fromMapToStringArray(item));
        }
        return arr;
    }

    /**
     * 判定Map资料是否为空
     * 
     * @param map
     * @return
     */
    private boolean isMapArrayEmpty(Map<?, ?>[] map) {
        if (map != null && map.length > 0) {
            return (true);
        }
        return (false);
    }
}
