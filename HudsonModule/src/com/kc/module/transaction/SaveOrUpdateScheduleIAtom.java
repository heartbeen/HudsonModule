package com.kc.module.transaction;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.IAtom;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.base.Barcode;
import com.kc.module.utils.DBUtils;
import com.kc.module.utils.JsonUtils;
import com.kc.module.utils.StringUtils;

public class SaveOrUpdateScheduleIAtom implements IAtom {
    private Controller controller;

    public Controller getController() {
        return controller;
    }

    public void setController(Controller controller) {
        this.controller = controller;
    }

    public int result;

    public int getMaxDay() {
        return maxDay;
    }

    public void setMaxDay(int maxDay) {
        this.maxDay = maxDay;
    }

    public int getMinDay() {
        return minDay;
    }

    public void setMinDay(int minDay) {
        this.minDay = minDay;
    }

    public int getMaxHour() {
        return maxHour;
    }

    public void setMaxHour(int maxHour) {
        this.maxHour = maxHour;
    }

    public int getMinHour() {
        return minHour;
    }

    public void setMinHour(int minHour) {
        this.minHour = minHour;
    }

    private int maxDay;
    private int minDay;
    private int maxHour;
    private int minHour;

    public int getResult() {
        return result;
    }

    public void setResult(int result) {
        this.result = result;
    }

    private List<String> backInfo;

    public List<String> getBackInfo() {
        if (this.backInfo == null) {
            this.backInfo = new ArrayList<String>();
        }
        return backInfo;
    }

    public void setBackInfo(List<String> backInfo) {
        this.backInfo = backInfo;
    }

    @Override
    public boolean run() throws SQLException {

        // 获取模具ID号的数组
        String modulelist = this.getController().getPara("modulelist");
        // 获取模具排程的时间更新状态(提前或者推迟)
        String r_mode = this.getController().getPara("rb-mode");
        // 排程安排的更改天数
        int modify_day = this.getController().getParaToInt("modify-day");
        // 排程更改的小时数
        int modify_hour = this.getController().getParaToInt("modify-hour");
        // 参考的安排排程的模具工号
        String refer_module = this.getController().getPara("refer-module");

        // 如果模具资料为空,则返回FALSE
        if (StringUtils.isEmpty(modulelist)) {
            this.setResult(-1);
            return (false);
        }

        // 如果模具资料为空,则返回FALSE
        if (StringUtils.isEmpty(r_mode)) {
            this.setResult(-2);
            return (false);
        }

        // 如果天数大于最大值或者小于最小值,则返回FALSE
        if (modify_day < this.minDay || modify_day > this.maxDay) {
            this.setResult(-3);
            return (false);
        }
        // 如果小时数大于最大值或者小于最小值,则返回FALSE
        if (modify_hour < this.minHour || modify_hour > this.maxHour) {
            this.setResult(-4);
            return (false);
        }

        // 将获取的JSON数组解析为JAVA数组
        String[] m_list = JsonUtils.parseJsArray(modulelist);

        // 用于查询参考模具是否存在,如果存在则为添加排程,否则为更新排程
        StringBuilder builder = new StringBuilder();

        builder.append("SELECT A.MODULEBARCODE, A.MODULECODE, B.ID AS RSMID FROM MODULELIST A ");
        builder.append("LEFT JOIN MD_RESUME_RECORD B ON A.MODULEBARCODE = B.MODULEBARCODE ");
        builder.append("WHERE A.MODULECODE = ? AND A.MODULESTATE = ? AND B.RESUMESTATE = ?");

        Record referRecord = Db.findFirst(builder.toString(), refer_module, "0", "20401");

        String refer_barcode = null;

        builder = new StringBuilder();

        builder.append("SELECT A.MODULEBARCODE, A.MODULECODE, B.ID AS RSMID, (");
        builder.append("SELECT COUNT(*) FROM MD_EST_SCHEDULE WHERE MODULERESUMEID = B.ID ");
        builder.append("AND TYPEID IS NULL ) AS SCHECOUNT FROM MODULELIST A ");
        builder.append("LEFT JOIN MD_RESUME B ON A.MODULEBARCODE = B.MODULEBARCODE ");
        builder.append("WHERE A.MODULESTATE = ? AND B.RESUMESTATE = ? AND A.MODULEBARCODE IN ");

        builder.append(DBUtils.sqlIn(m_list));

        // 从数据库中查询前台传来的模具工号是否已经安排排程
        List<Record> moduleInfo = Db.find(builder.toString(), "0", "20401");
        // 如果查询的资料为空,则表示这些模具的资料不存在,返回FALSE
        if (moduleInfo.size() == 0) {
            this.setResult(-5);
            return (false);
        }

        // 如果参考模具工号不为空,则检索查询出的工件是否已经安排排程,如果已经安排了排程,则将其放入返回变量backInfo中
        List<String> f_list = new ArrayList<String>();
        List<String> rsm_list = new ArrayList<String>();

        for (Record r : moduleInfo) {
            String modulebarcode = r.getStr("modulebarcode");
            String modulecode = r.getStr("modulecode");
            String resumeid = r.getStr("rsmid");

            if (referRecord != null) {
                int schecount = r.getNumber("schecount").intValue();
                if (schecount > 0) {
                    this.getBackInfo().add(modulecode);
                } else {
                    f_list.add(modulebarcode);
                    rsm_list.add(resumeid);
                }
            } else {
                f_list.add(modulebarcode);
                rsm_list.add(resumeid);
            }
        }

        // 如果前台传来的所有的模具都已经安排了排程,返回FALSE
        if (f_list.size() == 0) {
            this.setResult(-6);
            return (false);
        }

        // 如果参考的模具号为空,则表示为更新模具号
        if (referRecord == null) {
            if (modify_day == 0 && modify_hour == 0) {
                this.setResult(-7);
                return (false);
            } else {
                for (String m : rsm_list) {
                    String part_sql = getUpdateDate("STARTTIME",
                                                    "ENDTIME",
                                                    modify_day,
                                                    modify_hour,
                                                    r_mode,
                                                    m);
                    // 更新部件在MD_EST_SCHEDULE表中的排程
                    int part_rst = Db.update(part_sql);
                    if (part_rst < 0) {
                        this.setResult(-8);
                        return (false);
                    }
                }
            }
        } else {
            // 获取模具的唯一号
            refer_barcode = referRecord.getStr("MODULEBARCODE");

            builder = new StringBuilder();

            int sffix = (r_mode.equals("1") ? 1 : -1);
            String d_modify = (modify_day > 0 ? " + (INTERVAL '" + (sffix * modify_day) + "' DAY)"
                                             : "");
            String h_modify = (modify_hour > 0 ? " + (INTERVAL '"
                                                 + (sffix * modify_hour)
                                                 + "' HOUR)" : "");
            builder.append("SELECT ID, SCHID, PARTID, STARTTIME, ENDTIME, CRAFTID, ISMERGE, MODULERESUMEID ");
            builder.append(", RANKNUM , DURATION , PARENTID, EVALUATE, ISFINISH, ISUSED, TYPEID FROM (");
            builder.append("SELECT MSC.ID, MSC.SCHID, MPR.BARID AS PARTID, (MSC.STARTTIME ");
            builder.append(d_modify);
            builder.append(h_modify);
            builder.append(") AS STARTTIME");
            builder.append(", (MSC.ENDTIME ");
            builder.append(d_modify);
            builder.append(h_modify);
            builder.append(") AS ENDTIME");
            builder.append("    , MSC.CRAFTID, MSC.ISMERGE, MPR.RSMID AS MODULERESUMEID, MSC.RANKNUM, MSC.DURATION        ");
            builder.append(", MSC.PARENTID, MSC.EVALUATE,MSC.ISFINISH, MSC.ISUSED,MSC.TYPEID, NVL(MSC.PARENTID,MSC.ID)    ");
            builder.append(" AS PID, MSC.FLAG FROM (                                                                      ");
            builder.append("    SELECT A.PARTLIST,FLAG, B.*                                                               ");
            builder.append("    FROM (                                                                                    ");
            builder.append("        SELECT PARTBARCODE AS BARID, MODULEBARCODE, PARTCODE AS PARTLIST,0 AS FLAG            ");
            builder.append("        FROM MD_PART                                                                          ");
            builder.append("        WHERE MODULEBARCODE = ? AND QUANTITY > 0                                              ");
            builder.append("        UNION                                                                                 ");
            builder.append("        SELECT PARTBARLISTCODE AS BARID, MODULEBARCODE, PARTLISTCODE AS PARTLIST,1 AS FLAG    ");
            builder.append("        FROM MD_PART_LIST                                                                     ");
            builder.append("        WHERE MODULEBARCODE = ?                                                               ");
            builder.append("            AND ISENABLE = '0'                                                                ");
            builder.append("    ) A, MD_EST_SCHEDULE B                                                                    ");
            builder.append("    WHERE A.BARID = B.PARTID                                                                  ");
            builder.append("        AND B.TYPEID IS NULL                                                                  ");
            builder.append(") MSC, (                                                                                      ");
            builder.append("    SELECT A.UNITID, B.ID AS RSMID, BARID ,FLAG                                               ");
            builder.append("    FROM (                                                                                    ");
            builder.append("        SELECT PARTBARCODE AS BARID, PARTCODE AS UNITID, MP.MODULEBARCODE ,0 AS FLAG          ");
            builder.append(" FROM MD_PART MP                                                                              ");
            builder.append("        WHERE MP.MODULEBARCODE IN                                                             ");
            builder.append(DBUtils.sqlIn(f_list));
            builder.append("        UNION                                                                                 ");
            builder.append("        SELECT MPL.PARTBARLISTCODE AS BARID, MPL.PARTLISTCODE AS UNITID, MPL.MODULEBARCODE    ");
            builder.append("        , 1 AS FLAG FROM MD_PART_LIST MPL                                                     ");
            builder.append("        WHERE MPL.MODULEBARCODE IN                                                            ");
            builder.append(DBUtils.sqlIn(f_list));
            builder.append("            AND ISENABLE = '0'                                                                ");
            builder.append("    ) A                                                                                       ");
            builder.append("        LEFT JOIN MD_RESUME B ON A.MODULEBARCODE = B.MODULEBARCODE                            ");
            builder.append(") MPR                                                                                         ");
            builder.append("WHERE MSC.PARTLIST = MPR.UNITID AND MSC.FLAG = MPR.FLAG ) ORDER BY PID,CRAFTID,FLAG           ");

            // 按照参考模具的要求将所有的模具排程按要求合并查询出来
            List<Record> saveRecord = Db.find(builder.toString(), refer_barcode, refer_barcode);
            // 保存资料标识
            boolean fRst = false;
            if (saveRecord.size() > 0) {
                // 刷新数据库中最新的排程ID号
                Barcode.MODULE_EST_SCHEDULE.nextVal(true);
                // 声明部件ID号变量
                String t_ori = "", t_curr = "";
                // 将生成的排程讯息保存至数据库中
                for (Record rcd : saveRecord) {
                    String t_parent = rcd.get("PARENTID");
                    String t_id = rcd.get("ID");
                    // 分析出原始的父部件与当前父部件的差异,如果父部件已经发生改变则将已改变的部件ID设置为父部件
                    String t_pid = (StringUtils.isEmpty(t_parent) ? t_id : t_parent);
                    // 如果原始的流水号
                    String t_child = Barcode.MODULE_EST_SCHEDULE.nextVal();
                    // 将父部件的讯息设置起来
                    String t_super = t_curr;
                    if (!t_ori.equals(t_pid)) {
                        // 如果是部件ID号,则将其PARENTID设置为空
                        t_super = "";
                        // 将原先的部件讯息缓存起来以供对比
                        t_ori = t_pid;
                        // 将部件的ID缓存起来以供分部件参考为父部件
                        t_curr = t_child;
                    }

                    rcd.set("ID", t_child).set("PARENTID", t_super);

                    fRst = Db.save("MD_EST_SCHEDULE", rcd);
                    if (!fRst) {
                        this.setResult(-9);
                        return (false);
                    }
                }
            }

        }

        this.setResult(1);
        return (true);
    }

    private String getUpdateDate(String start,
                                 String end,
                                 int day,
                                 int hour,
                                 String mode,
                                 String rsmid) {
        int sffix = (mode.equals("1") ? 1 : -1);
        String d_modify = (day > 0 ? " + (INTERVAL '" + (sffix * day) + "' DAY)" : "");
        String h_modify = (hour > 0 ? " + (INTERVAL '" + (sffix * hour) + "' HOUR)" : "");

        String u_start = start + d_modify + h_modify;
        String u_end = end + d_modify + h_modify;

        // String bycase = (ispart ?
        // ("(SELECT PARTBARLISTCODE FROM MD_PART_LIST WHERE ISENABLE = '0' AND MODULEBARCODE = "
        // + module + ")")
        // : ("(SELECT PARTBARCODE FROM MD_PART WHERE MODULEBARCODE = "
        // + module + ")"));

        String sql = "UPDATE MD_EST_SCHEDULE SET "
                     + start
                     + " = "
                     + u_start
                     + ","
                     + end
                     + " = "
                     + u_end
                     + " WHERE TYPEID IS NULL AND MODULERESUMEID = '"
                     + rsmid
                     + "'";
        return sql;
    }
}
