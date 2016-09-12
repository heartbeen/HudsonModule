package com.kc.module.config;

import java.util.Properties;

import com.jfinal.config.Constants;
import com.jfinal.config.Handlers;
import com.jfinal.config.Interceptors;
import com.jfinal.config.JFinalConfig;
import com.jfinal.config.Plugins;
import com.jfinal.config.Routes;
import com.jfinal.plugin.activerecord.ActiveRecordPlugin;
import com.jfinal.plugin.activerecord.CaseInsensitiveContainerFactory;
import com.jfinal.plugin.activerecord.dialect.MysqlDialect;
import com.jfinal.plugin.activerecord.dialect.OracleDialect;
import com.jfinal.plugin.druid.DruidPlugin;
import com.jfinal.render.ViewType;
import com.kc.module.controller.AccountController;
import com.kc.module.controller.DeviseController;
import com.kc.module.controller.DeviseShareController;
import com.kc.module.controller.InquireController;
import com.kc.module.controller.ModuleBaseController;
import com.kc.module.controller.ModuleCodeController;
import com.kc.module.controller.ModuleMachineController;
import com.kc.module.controller.ModuleManageController;
import com.kc.module.controller.ModulePartController;
import com.kc.module.controller.ModuleProcessController;
import com.kc.module.controller.ModuleQualityController;
import com.kc.module.controller.ModuleRequestController;
import com.kc.module.controller.ModuleScheduleController;
import com.kc.module.controller.ProjectController;
import com.kc.module.controller.PublicController;
import com.kc.module.controller.ReportController;
import com.kc.module.controller.SystemController;
import com.kc.module.interceptor.AuthInterceptor;
import com.kc.module.model.Account;
import com.kc.module.model.AccountLogin;
import com.kc.module.model.Authority;
import com.kc.module.model.BarcodeContext;
import com.kc.module.model.BarcodePaper;
import com.kc.module.model.BarcodeType;
import com.kc.module.model.Craft;
import com.kc.module.model.DesignCraftInfo;
import com.kc.module.model.DesignCraftList;
import com.kc.module.model.DesignCraftSet;
import com.kc.module.model.DesignProcessInfo;
import com.kc.module.model.DesignProcessResume;
import com.kc.module.model.DesignResume;
import com.kc.module.model.DesignResumeRecord;
import com.kc.module.model.DesignScheduleInfo;
import com.kc.module.model.DesignStateInfo;
import com.kc.module.model.DeviceDepart;
import com.kc.module.model.DeviceDepartResume;
import com.kc.module.model.DeviceInfo;
import com.kc.module.model.DeviceProcessResume;
import com.kc.module.model.DeviceType;
import com.kc.module.model.Duties;
import com.kc.module.model.Employee;
import com.kc.module.model.ExchangeRate;
import com.kc.module.model.Factory;
import com.kc.module.model.MdDeviceCraft;
import com.kc.module.model.MdDeviceCraftResume;
import com.kc.module.model.MeasureTools;
import com.kc.module.model.ModuleActionRecord;
import com.kc.module.model.ModuleCraftClassify;
import com.kc.module.model.ModuleCraftSet;
import com.kc.module.model.ModuleEstSchedule;
import com.kc.module.model.ModuleList;
import com.kc.module.model.ModuleMachine;
import com.kc.module.model.ModuleMeasureList;
import com.kc.module.model.ModulePart;
import com.kc.module.model.ModulePartList;
import com.kc.module.model.ModulePartSection;
import com.kc.module.model.ModulePlanInfo;
import com.kc.module.model.ModuleProcessFinish;
import com.kc.module.model.ModuleProcessInfo;
import com.kc.module.model.ModuleProcessResume;
import com.kc.module.model.ModuleProcessState;
import com.kc.module.model.ModuleProductInfo;
import com.kc.module.model.ModuleResume;
import com.kc.module.model.ModuleResumeRecord;
import com.kc.module.model.ModuleResumeSection;
import com.kc.module.model.ModuleThreeMeasure;
import com.kc.module.model.ModuleTolerance;
import com.kc.module.model.ModuleToleranceRecord;
import com.kc.module.model.ModuleWorkLoad;
import com.kc.module.model.PartOutBound;
import com.kc.module.model.PartRace;
import com.kc.module.model.ProjectModule;
import com.kc.module.model.RegionDepartClassify;
import com.kc.module.model.RegionDepartment;
import com.kc.module.model.Role;
import com.kc.module.model.RolePosition;
import com.kc.module.model.Station;
import com.kc.module.model.SubFunction;
import com.kc.module.model.TaskCareer;
import com.kc.module.model.TaskClassic;
import com.kc.module.model.TaskFix;
import com.kc.module.model.TaskGroup;
import com.kc.module.model.TaskInfo;
import com.kc.module.model.TaskStruct;
import com.kc.module.model.TaskStuff;
import com.kc.module.model.WorkItem;
import com.kc.module.plugin.SqlInXmlPlugin;
import com.kc.module.utils.ConstUtils;
import com.kc.module.utils.DataUtils;

public class ModuleConfig extends JFinalConfig {

    private boolean isOracle = true;

    /**
     * 基本设置项
     */
    @Override
    public void configConstant(Constants me) {
        me.setDevMode(true);
        me.setViewType(ViewType.JSP);
        me.setError404View("/WEB-INF/view/404.html");
    }

    @Override
    public void configHandler(Handlers me) {
        if (isOracle) {
            ConstUtils.initConst();
        }
    }

    /**
     * 全局拦截器配置
     */
    @Override
    public void configInterceptor(Interceptors me) {
        AuthInterceptor auth = new AuthInterceptor();
        auth.setAssembly(new String[]{"/public", "/devise/share"});

        me.add(auth);
    }

    /**
     * 配置数据库和表对象映射关系
     */
    @Override
    public void configPlugin(Plugins me) {
        Properties properties = DataUtils.getProperties("oracle.properties");

        if (properties == null) {
            throw new RuntimeException("数据库配置文件出错");
        }

        DruidPlugin dp = new DruidPlugin(properties.getProperty("jdbcUrl"), properties.getProperty("user"), properties.getProperty("password"));

        ActiveRecordPlugin arp = new ActiveRecordPlugin(dp);

        arp.setShowSql(true);
        arp.setContainerFactory(new CaseInsensitiveContainerFactory(true));

        String driverClass = properties.getProperty("driverClass");
        if (driverClass != null) {
            if (driverClass.indexOf("OracleDriver") > 0) {
                dp.setDriverClass(driverClass);
                arp.setDialect(new OracleDialect());
                isOracle = true;
            }

            if (driverClass.indexOf("mysql") > 0) {
                dp.setDriverClass(driverClass);
                arp.setDialect(new MysqlDialect());
                isOracle = false;
            }
        }

        me.add(dp);

        // 员工账户讯息表
        arp.addMapping("ACCOUNT_INFO", "accountid", Account.class);
        // 员工账号登陆记录表
        arp.addMapping("ACCOUNT_LOGIN", AccountLogin.class);
        // 功能权限表
        arp.addMapping("ITEM_AUTHORITY", "authid", Authority.class);
        // 模具工艺讯息表
        arp.addMapping("MD_CRAFT", Craft.class);
        arp.addMapping("DUTIES", Duties.class);
        // 员工讯息表
        arp.addMapping("EMPLOYEE_INFO", Employee.class);
        // 客户以及本集团公司讯息表
        arp.addMapping("FACTORY", Factory.class);
        // 模具工号讯息表
        arp.addMapping("MODULELIST", "MODULEBARCODE", ModuleList.class);
        // 模具机台资料明细表
        arp.addMapping("MD_MACHINE_INFO", ModuleMachine.class);
        // 模具工件表
        arp.addMapping("MD_PART", "partbarcode", ModulePart.class);
        // 模具工件清单表
        arp.addMapping("MD_PART_LIST", "partbarlistcode", ModulePartList.class);
        // 工件类型讯息表
        arp.addMapping("PARTRACE", PartRace.class);
        // 角色表
        arp.addMapping("ROLE", "roleid", Role.class);
        // 角色部门表
        arp.addMapping("ROLE_POS", "authPosId", RolePosition.class);
        arp.addMapping("STATION", Station.class);
        arp.addMapping("WORK_ITEM", "workid", WorkItem.class);
        // 模具履历表
        arp.addMapping("MD_RESUME", ModuleResume.class);

        arp.addMapping("MD_RESUME_RECORD", ModuleResumeRecord.class);

        // 项目明细表
        arp.addMapping("PROJECT_MODULE", ProjectModule.class);
        // 项目功能表
        arp.addMapping("SUB_FUNCTION", SubFunction.class);
        // 工件预计排程表
        arp.addMapping("MD_EST_SCHEDULE", ModuleEstSchedule.class);
        // 模具加工讯息表(缓冲表)
        arp.addMapping("MD_PROCESS_INFO", ModuleProcessInfo.class);

        arp.addMapping("MD_PROCESS_RESUME", ModuleProcessResume.class);
        // 模具加工机台状态表
        arp.addMapping("DEVICE_INFO", DeviceInfo.class);
        // 部门设备对应表
        arp.addMapping("DEVICE_DEPART", DeviceDepart.class);
        // 部门设备对应表
        arp.addMapping("DEVICE_DEPART_RESUME", DeviceDepartResume.class);
        // 设备类型表
        arp.addMapping("DEVICE_TYPE", DeviceType.class);
        // 厂区部门表
        arp.addMapping("REGION_DEPART", RegionDepartment.class);
        // 机台工艺表
        arp.addMapping("MD_DEVICE_CRAFT", MdDeviceCraft.class);
        // 机台工艺记录表
        arp.addMapping("MD_DEVICE_CRAFTRESUME", MdDeviceCraftResume.class);

        arp.addMapping("MD_PROCESS_STATE", ModuleProcessState.class);

        arp.addMapping("MD_CRAFT_SET", ModuleCraftSet.class);
        // 汇率表
        arp.addMapping("EXCHANGE_RATE", ExchangeRate.class);
        // 外发表
        arp.addMapping("PART_OUTBOUND", PartOutBound.class);
        // 设备状态变更记录表
        arp.addMapping("DEVICE_PROCESS_RESUME", DeviceProcessResume.class);

        // 条码
        arp.addMapping("BARCODE_CONTEXT", BarcodeContext.class);

        arp.addMapping("BARCODE_PAPER", BarcodePaper.class);
        // 条码类型表
        arp.addMapping("BARCODE_TYPE", "BARTYPEID", BarcodeType.class);
        // 测量记录表
        arp.addMapping("MD_TOLERANCE", ModuleTolerance.class);
        // 测量记录明细表
        arp.addMapping("MD_TOLERANCE_RECORD", ModuleToleranceRecord.class);
        // 精测工具表
        arp.addMapping("MEASURETOOLS", MeasureTools.class);

        // 测量
        arp.addMapping("MD_TD_MEASURE", ModuleThreeMeasure.class);
        arp.addMapping("MD_MEASURE_LIST", "PARTBARCODE", ModuleMeasureList.class);

        // 工件分段加工
        arp.addMapping("MD_RESUME_SECTION", ModuleResumeSection.class);
        arp.addMapping("MD_PART_SECTION", ModulePartSection.class);

        // 项目任务表
        arp.addMapping("TASK_CAREER", TaskCareer.class);
        arp.addMapping("TASK_CLASSIC", TaskClassic.class);
        arp.addMapping("TASK_FIX", TaskFix.class);
        arp.addMapping("TASK_GROUP", TaskGroup.class);
        arp.addMapping("TASK_INFO", TaskInfo.class);
        arp.addMapping("TASK_STRUCT", TaskStruct.class);
        arp.addMapping("TASK_STUFF", TaskStuff.class);
        // 各个模块对工艺的需求
        arp.addMapping("MD_CRAFT_CLASSIFY", ModuleCraftClassify.class);
        // 模具系统动作记录
        arp.addMapping("MD_ACTION_RECORD", ModuleActionRecord.class);
        arp.addMapping("MD_WORK_LOAD", ModuleWorkLoad.class);
        // 模具零件加工完成
        arp.addMapping("MD_PROCESS_FINISH", ModuleProcessFinish.class);
        // 部门分类表
        arp.addMapping("REGION_DEPART_CLASSIFY", RegionDepartClassify.class);
        // 缓存文件信息
        // me.add(new EhCachePlugin(DataUtils.getInputStream("ehcache.xml")));
        // 查询配置文件
        me.add(new SqlInXmlPlugin("com/kc/module/sql"));

        // TODO 设计模块 | 2016-07-05 | Rock载数据库表结构
        arp.addMapping("DS_CRAFT_INFO", DesignCraftInfo.class);
        arp.addMapping("DS_PROCESS_INFO", DesignProcessInfo.class);
        arp.addMapping("DS_PROCESS_RESUME", DesignProcessResume.class);
        arp.addMapping("DS_RESUME", DesignResume.class);

        arp.addMapping("DS_RESUME_RECORD", DesignResumeRecord.class);
        arp.addMapping("DS_SCHEDULE_INFO", DesignScheduleInfo.class);
        arp.addMapping("DS_STATE_INFO", DesignStateInfo.class);
        // 新模生产计划日程表
        arp.addMapping("MD_PLAN_INFO", ModulePlanInfo.class);
        // 产品信息表
        arp.addMapping("MD_PRODUCT_INFO", ModuleProductInfo.class);
        // 设计制程集合表
        arp.addMapping("DS_CRAFT_SET", DesignCraftSet.class);
        // 设计制程集合清单表
        arp.addMapping("DS_CRAFT_LIST", DesignCraftList.class);

        // TODO 加载数据库表结构
        me.add(arp);
    }

    /**
     * 控制器注册
     */
    @Override
    public void configRoute(Routes me) {
        me.add("/", AccountController.class);
        me.add("/project", ProjectController.class);
        me.add("/module/request", ModuleRequestController.class);
        me.add("/module/base", ModuleBaseController.class);
        me.add("/public", PublicController.class);
        me.add("/system", SystemController.class);
        me.add("/module/machine", ModuleMachineController.class);
        me.add("/module/manage", ModuleManageController.class);
        me.add("/module/part", ModulePartController.class);
        me.add("/module/process", ModuleProcessController.class);
        me.add("/module/quality", ModuleQualityController.class);
        me.add("/module/schedule", ModuleScheduleController.class);
        me.add("/module/code", ModuleCodeController.class);
        me.add("/module/inquire", InquireController.class);
        me.add("/module/report", ReportController.class);

        // 设计模块 | 2016-07-05 | Rock
        me.add("/module/devise", DeviseController.class);
        // 用于设计模块共享信息
        me.add("/devise/share", DeviseShareController.class);
    }
    //
    // public boolean waitStart(){
    // }
}
