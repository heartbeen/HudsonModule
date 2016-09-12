package com.kc.module.base;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.model.Authority;
import com.kc.module.model.BarcodePaper;
import com.kc.module.model.Craft;
import com.kc.module.model.DesignCraftInfo;
import com.kc.module.model.DesignCraftList;
import com.kc.module.model.DesignCraftSet;
import com.kc.module.model.DesignProcessInfo;
import com.kc.module.model.DesignProcessResume;
import com.kc.module.model.DesignResume;
import com.kc.module.model.DesignScheduleInfo;
import com.kc.module.model.DesignStateInfo;
import com.kc.module.model.DeviceDepart;
import com.kc.module.model.DeviceDepartResume;
import com.kc.module.model.DeviceInfo;
import com.kc.module.model.DeviceProcessResume;
import com.kc.module.model.Employee;
import com.kc.module.model.Factory;
import com.kc.module.model.MdDeviceCraft;
import com.kc.module.model.MdDeviceCraftResume;
import com.kc.module.model.MeasureTools;
import com.kc.module.model.ModelFinal;
import com.kc.module.model.ModuleActionRecord;
import com.kc.module.model.ModuleCraftClassify;
import com.kc.module.model.ModuleCraftSet;
import com.kc.module.model.ModuleEstSchedule;
import com.kc.module.model.ModuleList;
import com.kc.module.model.ModulePart;
import com.kc.module.model.ModulePartList;
import com.kc.module.model.ModulePartSection;
import com.kc.module.model.ModulePlanInfo;
import com.kc.module.model.ModuleProcessFinish;
import com.kc.module.model.ModuleProcessInfo;
import com.kc.module.model.ModuleProcessResume;
import com.kc.module.model.ModuleProductInfo;
import com.kc.module.model.ModuleResumeRecord;
import com.kc.module.model.ModuleResumeSection;
import com.kc.module.model.ModuleThreeMeasure;
import com.kc.module.model.ModuleTolerance;
import com.kc.module.model.ModuleToleranceRecord;
import com.kc.module.model.ModuleWorkLoad;
import com.kc.module.model.PartOutBound;
import com.kc.module.model.RegionDepartClassify;
import com.kc.module.model.RegionDepartment;
import com.kc.module.model.Role;
import com.kc.module.model.Station;
import com.kc.module.model.TaskCareer;
import com.kc.module.model.TaskClassic;
import com.kc.module.model.TaskFix;
import com.kc.module.model.TaskGroup;
import com.kc.module.model.TaskInfo;
import com.kc.module.model.TaskStruct;
import com.kc.module.model.TaskStuff;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.StringUtils;

/**
 * 条码分类枚举类
 * 
 * @author David
 * @email xuweissh@163.com
 * 
 */
public enum Barcode {

    /** 员工条码 */
    EMP("101", true, "000", Employee.dao),

    /** 设备条码 */
    DEVICE("102", false, "0000", DeviceInfo.dao),

    /** 设备部门条码 */
    DEVICE_DEPT("103", false, "0000", DeviceDepart.dao),

    /** 模具加工工艺条码 */
    MACHINE_TASK("104", true, "0000", MdDeviceCraft.dao),

    /** 模具条码 */
    MODULE("105", true, "000", ModuleList.dao),

    /** 模具工件条码 */
    MODULE_PART("106", true, "0000", ModulePart.dao),

    /** 模具工件清单条码 */
    MODULE_PART_LIST("107", true, "0000", ModulePartList.dao),

    /** 厂商条码 */
    FACTORY("108", false, "0000", Factory.dao),

    /** 工件种类条码 */
    // PART_CLASS("110", true, "000"),

    /** 岗位分配条码 */
    STATION("111", false, "000", Station.dao),

    /** 模具加工工艺条码 */
    MODULE_CRAFT("112", false, "00", Craft.dao),

    /** 区域代码(包括:分厂,部门,单位) */
    REGION_DEPART("113", false, "0000", RegionDepartment.dao),
    /** 模具履历,对应表:MD_RESUME 字段:ID */
    MODULE_RESUME("", true, "0000", ModuleResumeRecord.dao),

    /** 模具加工履历,对应表:MD_PROCESS_RESUME 字段:ID */
    MODULE_PROCESS_RESUME("", true, "000000", ModuleProcessResume.dao),

    /** 工件加工排程,对应表:MD_EST_SCHEDULE 字段:ID */
    MODULE_EST_SCHEDULE("", true, "00000", ModuleEstSchedule.dao),

    /** 模具工艺集合,对就表:MD_CRAFT_SET 字段:ID */
    MODULE_CRAFT_SET("", true, "0000", ModuleCraftSet.dao),

    /** 部门设备记录, 字段:ID */
    DEVICE_DEPART_RESUME("", true, "0000", DeviceDepartResume.dao),

    /** 设备状态记录, 字段ID */
    DEVICE_PROCESS_RESUME("", true, "0000", DeviceProcessResume.dao),

    /** 部门设备记录, 字段:ID */
    MACHINE_TASK_RESUME("", false, "0000", MdDeviceCraftResume.dao),
    /** 外发记录ID号 */
    OUTBOUND_RESUME("", true, "0000", PartOutBound.dao),
    /** 条码纸ID */
    BARCODE_PAPER("", false, "00", BarcodePaper.dao),
    /** 测量工具ID号 */
    MEASURE_TOOLS("", false, "000", MeasureTools.dao),
    /** 测量表ID号 */
    MD_TOLARANCE("", true, "00000", ModuleTolerance.dao),
    /** 测量记录表ID号 */
    MD_TOLERANCE_RECORD("", true, "00000", ModuleToleranceRecord.dao),
    /** 模具三次元测量ID */
    MD_THREE_MEASURE("", true, "0000", ModuleThreeMeasure.dao),
    /** 模具工号的加工进度表 */
    MD_PROCESS_INFO("", true, "00000", ModuleProcessInfo.dao),
    /** 权限ID */
    AUTHORITY("", false, "00000", Authority.dao),
    /** 模具履历分段 */
    MD_RESUME_SECTION("", true, "00000", ModuleResumeSection.dao),
    /** 工件履历分段 */
    MD_PART_SECTION("", true, "00000", ModulePartSection.dao),
    /** 用户角色 */
    ROLE("", false, "000", Role.dao),
    /** 任务项目职位 */
    TASK_CAREER("", false, "00", TaskCareer.dao),
    /** 任务项目模具属性 */
    TASK_CLASSIC("", false, "00", TaskClassic.dao),
    /** 任务项目时模情况 */
    TASK_FIX("", true, "000", TaskFix.dao),
    /** 任务项目组别 */
    TASK_GROUP("", false, "00", TaskGroup.dao),
    /** 任务项目主要资料表 */
    TASK_INFO("", true, "0000", TaskInfo.dao),
    /** 任务项目成员表 */
    TASK_STRUCT("", false, "0000", TaskStruct.dao),
    /** 任务项目成员表 */
    TASK_STUFF("", false, "0000", TaskStuff.dao),
    /** 任务项目成员表 */
    MD_CRAFT_CLASSIFY("", false, "000000", ModuleCraftClassify.dao),
    /** 加工记录动作表 */
    MD_ACTION_RECORD("", true, "0000", ModuleActionRecord.dao),
    /** 加工记录动作表 */
    MD_WORK_LOAD("", false, "00", ModuleWorkLoad.dao),
    /** 零件加工完成表 */
    MD_PROCESS_FINISH("", true, "00000", ModuleProcessFinish.dao),
    /** 部门用途分类 */
    REGION_DEPART_CLASSIFY("", false, "0000", RegionDepartClassify.dao),
    // TODO 设计模块的ID生成器
    DS_CRAFT_INFO("201", false, "0000", DesignCraftInfo.dao),
    /** 设计加工 */
    DS_PROCESS_INFO("", true, "000000", DesignProcessInfo.dao),
    /** 设计加工记录 */
    DS_PROCESS_RESUME("", true, "000000", DesignProcessResume.dao),
    /** 设计履历 */
    DS_RESUME("", true, "0000", DesignResume.dao), 
    /** 设计制程排程 */
    DS_SCHEDULE_INFO("", true, "0000", DesignScheduleInfo.dao),
    /** 设计状态表 */
    DS_STATE_INFO("", false, "0000", DesignStateInfo.dao),
    /** 模具设计进程表 */
    MD_PLAN_INFO("", true, "0000", ModulePlanInfo.dao),
    /** 设计产品表 */
    MD_PRODUCT_INFO("", true, "0000", ModuleProductInfo.dao),
    /** 制程集合表 */
    DS_CRAFT_SET("", false, "0000", DesignCraftSet.dao),
    /** 制程集合清单表 */
    DS_CRAFT_LIST("", true, "0000", DesignCraftList.dao);

    /** 用于存放最大的行号 */
    private long maxRowId;
    /** 用于设置编号的条码代号 */
    private String code;
    /** 是否包含日期 */
    private boolean includeDate;
    /** 尾数长度(每一位用0替代,如末尾为4位编号,则为0000) */
    private String presicion;
    /** 关联到的表名 */
    private String tabName;
    /** 要查询的列名 */
    private String keyName;

    private boolean load;

    public boolean isLoad() {
        return load;
    }

    public void setLoad(boolean load) {
        this.load = load;
    }

    public String getTabName() {
        return tabName;
    }

    public void setTabName(String tabName) {
        this.tabName = tabName;
    }

    public String getKeyName() {
        return keyName;
    }

    public void setKeyName(String keyName) {
        this.keyName = keyName;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public boolean isIncludeDate() {
        return this.includeDate;
    }

    public void setIncludeDate(boolean includeDate) {
        this.includeDate = includeDate;
    }

    public String getPresicion() {
        return presicion;
    }

    public void setPresicion(String presicion) {
        this.presicion = presicion;
    }

    public long getMaxRowId() {
        return maxRowId;
    }

    public void setMaxRowId(long maxRowId) {
        this.maxRowId = maxRowId;
    }

    private Barcode(String code, boolean includeDate, String precision, ModelFinal<?> model) {
        this.setBarCode(code, includeDate, precision, model.tableName(), model.getPrimaryKey());
    }

    /**
     * 获取数据库库表中的主键号
     */
    public synchronized long getTableIndex() {
        // 用于存放从数据库读取的数据库ID值
        String sid = "0";
        // 获取短日期格式yyMMdd
        String date = getBarDateNow();
        // 用于缓存读取的最大ID号
        String tableId = null;
        // 用于存放查询数据库的SQL语句
        StringBuilder sql = new StringBuilder();
        sql.append("SELECT MAX(").append(this.keyName).append(")");
        sql.append(this.keyName).append(" FROM ").append(this.tabName);
        // 如果需要时间做判断,则添加日期LIKE匹配
        Record data;
        if (this.includeDate) {
            sql.append(" WHERE ").append(this.keyName).append(" LIKE ?||'%'");
            // 将最大值查询出来
            data = Db.findFirst(sql.toString(), this.code + date);
        } else {
            data = Db.findFirst(sql.toString());
        }

        // 如果获取的最大值是NULL,则是否需要包含日期并将日期和尾数进行组合
        if ((tableId = data.get(this.keyName)) == null) {
            sid = (this.includeDate ? date : "") + this.presicion;
        } else {
            // 如果包含日期
            if (!this.includeDate || tableId.indexOf(date) > -1) {
                // 将读取的最大值的条码编号替换为空
                sid = tableId.substring(this.code.length());
            } else {
                sid = date + this.presicion;
            }
        }

        // 判断是否已加载最新数据
        this.load = true;
        return Long.valueOf(sid);
    }

    /**
     * 设置条码的基本参数
     */
    public void setBarCode(String code, boolean inculdedate, String precision, String tabname, String keyname) {
        this.setCode(code);
        this.setPresicion(precision);
        this.setIncludeDate(inculdedate);
        this.setTabName(tabname);
        this.setKeyName(keyname);
    }

    /**
     * 获取一个新的ID号(reload为true为重新从数据库加载否则读取本缓存中的ID号)
     * 
     * @param reload
     */
    public String nextVal(boolean reload) {
        // 如果未执行数据库操作,则执行该操作。如果之前已经执行了该操作则根据reload为true来重新加载新的操作
        long maxRowIndex = 0;
        if (!this.load || reload) {
            maxRowIndex = getTableIndex();
            // 如果获取的值中不含日期,且值不为0,则将其加1
            if (maxRowIndex != 0) {
                maxRowIndex++;
            }
            this.setMaxRowId(maxRowIndex);
        } else {
            maxRowIndex = ++this.maxRowId;
        }

        String date = getBarDateNow();

        // 判断条码是否要加入日期,如果需要加入日期则判断日期是否在同一天,不在同一天则将日期起重新排成[日期+尾数]的形式
        // 如从昨天跳转至今天(140812),尾数为(0000),则今天的第一笔数据(1408120000)
        // 如果不包含日期,则需要将Long型的值左补0至与尾数同位,如原来的尾数为4位,处理后转换为Long型为11
        // 最后需要获取一个新的尾数,则需要加1至12,最后转换成字符串的时候,同样需要左补0至4位0012
        // 所有处理过的数据都需要添加条码代号(如001)组合成最后的ID号001(140812)0012,其中括号为包含日期
        if (this.includeDate) {
            if (String.valueOf(maxRowIndex).indexOf(date) == -1) {// 判断日期是否更新
                maxRowIndex = Long.valueOf(date + this.presicion);
                this.setMaxRowId(maxRowIndex);
            }

            return this.code + maxRowIndex;
        } else {
            return this.code + StringUtils.leftPad(maxRowIndex, this.presicion.length(), "0");
        }
    }

    /**
     * 获取指定的日期格式
     * 
     * @return
     */
    private String getBarDateNow() {
        return includeDate ? DateUtils.getDateNow("yyMMdd") : "";
    }

    /**
     * 获取一个新的ID号
     */
    public synchronized String nextVal() {
        return nextVal(false);
    }
}
