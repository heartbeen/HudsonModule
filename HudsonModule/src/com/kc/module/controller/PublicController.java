package com.kc.module.controller;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.jfinal.aop.Before;
import com.jfinal.core.Controller;
import com.jfinal.kit.JsonKit;
import com.jfinal.kit.StrKit;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Page;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.base.RegularState;
import com.kc.module.databean.TaskTreeBean;
import com.kc.module.extract.ArtifactWorkLoadExtract;
import com.kc.module.extract.EffcientUnitExtract;
import com.kc.module.extract.EmployeeEfficiencyExtract;
import com.kc.module.extract.FixedCraftExtract;
import com.kc.module.extract.MachineCraftExtract;
import com.kc.module.extract.MachineRateExtract;
import com.kc.module.extract.MainProjectExtract;
import com.kc.module.extract.ModuleAllPartExtract;
import com.kc.module.extract.ModulePartInfoExtract;
import com.kc.module.extract.ModuleProceedExtract;
import com.kc.module.extract.ModuleResumeExtract;
import com.kc.module.extract.ModuleScheduleExtract;
import com.kc.module.extract.PartContentExtract;
import com.kc.module.extract.RegionRootExtract;
import com.kc.module.extract.RegionWorkLoadExtract;
import com.kc.module.interceptor.PublicInterceptorStack;
import com.kc.module.interceptor.validator.ModuleManageValidator;
import com.kc.module.model.BarcodePaper;
import com.kc.module.model.Craft;
import com.kc.module.model.CraftSplit;
import com.kc.module.model.DeviceDepart;
import com.kc.module.model.DeviceType;
import com.kc.module.model.Employee;
import com.kc.module.model.Factory;
import com.kc.module.model.MachineWorktype;
import com.kc.module.model.ModuleCraftSet;
import com.kc.module.model.ModuleEstSchedule;
import com.kc.module.model.ModuleList;
import com.kc.module.model.ModuleMachine;
import com.kc.module.model.ModulePart;
import com.kc.module.model.ModulePartList;
import com.kc.module.model.ModuleProcessInfo;
import com.kc.module.model.ModuleProcessResume;
import com.kc.module.model.ModuleProcessState;
import com.kc.module.model.ModuleResume;
import com.kc.module.model.ModuleResumeRecord;
import com.kc.module.model.PartRace;
import com.kc.module.model.PositionInfo;
import com.kc.module.model.RegionDepartment;
import com.kc.module.model.Role;
import com.kc.module.model.Station;
import com.kc.module.model.SubFunction;
import com.kc.module.model.TaskClassic;
import com.kc.module.model.TaskGroup;
import com.kc.module.model.TaskInfo;
import com.kc.module.model.TaskStruct;
import com.kc.module.model.TaskStuff;
import com.kc.module.model.form.ActualFlowForm;
import com.kc.module.report.CustomerScheduleReport;
import com.kc.module.report.EmployeeEffientReport;
import com.kc.module.report.ExportModuleReport;
import com.kc.module.report.ExportPartInfoReport;
import com.kc.module.report.ModuleProcessScheduleReport;
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.ConstUtils;
import com.kc.module.utils.ControlUtils;
import com.kc.module.utils.DataUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.I18n;
import com.kc.module.utils.StringUtils;

@Before(PublicInterceptorStack.class)
public class PublicController extends Controller {

    /**
     * 读取功能模块及相关功能
     */
    public void moduleProject() {
        MainProjectExtract mpe = new MainProjectExtract();
        mpe.setController(this);

        renderJson(mpe.extract().toString());
    }

    /**
     * 读取客户讯息,为模具提供客户讯息
     */
    @Before(ModuleManageValidator.class)
    public void queryGuestOfModuleCode() {
        renderJson(Factory.dao.queryGuestFactory(getPara("type"), getPara("query")));
    }

    /**
     * 读取员工资料为模具担当提供数据
     */
    public void querySaleEmployeeInfo() {
        renderJson(Employee.dao.getEmployeeForName(getPara("query")));
    }

    /**
     * 获取零件的类别
     */
    public void getPartRaceInfo() {
        renderJson("races", PartRace.dao.getPartRace());
    }

    /**
     * 获取工厂列表信息
     */
    public void getFactoryData() {
        renderJson("auth", Factory.dao.factoryData());
    }

    /**
     * 得到服务器当前时间
     */
    public void currentTimeMillis() {
        renderJson("nowttime", System.currentTimeMillis());
    }

    /**
     * 通过客户代码得到客户模具机种
     */
    public void queryModuleClass() {
        renderJson(ModuleList.dao.findModuleClass(getPara("guestid")));
    }

    /**
     * 模糊查找工号<br>
     * 
     * condition:工号的模糊查询条件<br>
     * isResume:区分查询的工号为所有工号或只是查询有加工履历的工号
     */
    public void module() {
        // TODO 结果可以缓存
        String condition = getPara("condition");
        Boolean isResume = getParaToBoolean("isResume");
        String json = "";

        String posId = ControlUtils.getFactoryPosid(this);
        List<ModuleList> list = null;
        if (isResume == null || !isResume) {
            // 查询的是所有工号
            list = ModuleList.dao.findModuleNumber(posId, condition);
        } else {
            // 查询的是当前有加工履历的工号
            list = ModuleList.dao.findResumeAllModule(posId, condition);
        }

        json = JsonKit.toJson(list, 2).replace("\"'l'\":\"l\"", "\"leaf\":true");

        renderJson("{\"children\":" + json + "}");
    }

    public void moduleForResume() {
        boolean isNew = getParaToBoolean("isNew");
        String posId = ControlUtils.getFactoryPosid(this);
        List<ModuleList> list = ModuleList.dao.findResumeModule(isNew, posId);
        String json = JsonKit.toJson(list, 2).replace("\"'l'\":\"l\"", "\"leaf\":true");

        renderJson("{\"children\":" + json + "}");
    }

    /**
     * 得到相应模具履历所要加工的工件信息
     */
    public void moduleResumePart() {
        final String moduleResumeId = getPara("moduleResumeId");

        // 对模具工件列表进行缓存,以模具履历號为key,增加新工件时相应的缓存要删除
        // String parts = CacheKit.get("moduleResumePart", moduleResumeId, new
        // IDataLoader() {
        // @Override
        // public Object load() {
        //
        // return "{\"children\":" + DataUtil.moduleResumePartJson(map) + "}";
        // }
        // });

        List<ModulePart> list = ModulePart.dao.moduleResumePart(moduleResumeId);

        Map<Record, List<ModulePart>> map = DataUtils.modelTwoLayout(list,
                                                                     "PARTBARCODE",
                                                                     "PARTCODE",
                                                                     "PARTBARCODE",
                                                                     "MODULERESUMEID",
                                                                     "QUANTITY",
                                                                     "CNAMES",
                                                                     "cls");

        renderJson("{\"children\":" + DataUtils.moduleResumePartJson(map) + "}");

    }

    /**
     * 测量工件的清单
     */
    public void moduleMeasureList() {
        int measure = StrKit.notBlank(getPara("measure")) ? getParaToInt("measure") : 0;

        List<Record> list = ModulePart.dao.findMeasureListForModule(getPara("moduleBarcode"),
                                                                    measure);
        for (Record r : list) {
            r.set("leaf", true);
            r.set("iconCls", "brick-16");
        }
        renderJson("{\"children\":" + JsonKit.toJson(list, 2).replace("iconcls", "iconCls") + "}");
    }

    /**
     * 工艺安排菜单项
     */
    public void craftItem() {
        List<Craft> list = Craft.dao.planCraft();

        setAttr("success", list.size() > 0);
        setAttr("crafts", list);

        renderJson();
    }

    /**
     * 工艺安排菜单项
     */
    public void getClassifyCrafts() {
        List<Craft> list = Craft.dao.getClassifyCrafts(getParaToInt("classid"));

        setAttr("success", list.size() > 0);
        setAttr("crafts", list);

        renderJson();
    }

    /**
     * 预设工艺集合菜单项
     */
    public void craftSetMenuitem() {

        List<ModuleCraftSet> list = ModuleCraftSet.dao.findAllCraftSet();

        setAttr("success", list.size());
        setAttr("item", DataUtils.getDefaultScheduleSettings(list));
        renderJson();
    }

    /**
     * 查找模具的工件清单
     */
    public void modulePartList() {
        renderJson(ModulePartList.dao.modulePartList(getPara("moduleBarcode")));
    }

    /**
     * 得到加工工艺排程
     */
    public void getSchedualCrafts() {
        renderJson("craft", Craft.dao.getModuleCrafts(getPara("rank")));
    }

    /**
     * 得到相应的状态
     */
    public void processState() {
        renderJson(ModuleProcessState.dao.getProcessState(getPara("type")));
    }

    /**
     * 获取部门列表信息
     */
    public void getPositionData() {
        renderJson("auth", PositionInfo.dao.positionData());
    }

    /**
     * 得到机台类型
     */
    public void getDeviceClassfic() {
        renderJson(Db.find("SELECT ID CLASSID,NAME CLASSNAME FROM DEVICE_TYPE WHERE ID LIKE '0101__'"));
    }

    /**
     * 得到指定厂的部门信息
     */
    public void getRegularRegionDepart() {
        String factory = getPara("factoryId");

        factory = StrKit.isBlank(factory) ? ControlUtils.getFactoryStepid(this) : factory;

        renderJson("department", RegionDepartment.dao.getRegionDepartment(factory, 0));
    }

    /**
     * 查询部门下面的子部门
     */
    public void queryDeptChildren() {
        String factory = getPara("factoryId");
        factory = StrKit.isBlank(factory) ? ControlUtils.getFactoryStepid(this) : factory;

        renderJson("department",
                   RegionDepartment.dao.getRegionDepartment(factory, ConstUtils.DEPT_SUB_LAYOUT));
    }

    /**
     * 得到设备类型信息
     */
    public void getDeviceTypes() {
        renderJson("devicetype", DeviceType.dao.getDeviceType(getPara("type")));
    }

    /**
     * 获取厂名
     */
    public void getPositionName() {
        renderJson("position", PositionInfo.dao.positionData());
    }

    /**
     * 获取厂名
     */
    public void getFactoryName() {
        renderJson("factorys", Factory.dao.factoryName());
    }

    /**
     * 获取单位
     */
    public void getPositionNames() {
        renderJson("postionNames", PositionInfo.dao.positionName());
    }

    /**
     * 获取工艺名称
     */
    public void getCraftName() {
        renderJson("crafts", Craft.dao.craftName("0101"));
    }

    /**
     * 获取加工分类名称
     */
    public void getMachineWorkTypeName() {
        renderJson("workTypes", MachineWorktype.dao.machineWorkTypeName());
    }

    /**
     * 获取工艺名称
     */
    public void getMachineList() {
        renderJson("auth", ModuleMachine.dao.machineData());
    }

    /**
     * 得到角色树结构数据
     */
    public void queryRoleTree() {
        renderJson("children", Role.dao.roleDataTree());
    }

    /**
     * 获取角色列表信息
     */
    public void getRoleDataList() {
        renderJson(Role.dao.roleData());
    }

    /**
     * 获取模块分类列表信息
     */
    public void getSubFunctionList() {
        renderJson(SubFunction.dao.subFunctionData(ControlUtils.getLocale(this)));
    }

    /**
     * 当前加工单位得到其它单位名称
     */
    public void sendDept() {
        renderJson("children", PositionInfo.dao.getPositionList("010101"));
    }

    /**
     * 获取工艺拆分的工作<br>
     * 如:CNC加工时拆分为:编程和机加工
     */
    public void craftSplit() {
        String craftId = getPara("craftId");

        List<CraftSplit> list = CraftSplit.dao.getCraftSplit(craftId);

        setAttr("success", list.size() > 0 ? true : false);
        setAttr("split", list);

        renderJson();
    }

    /**
     * 获取加工单位工件加工者
     */
    public void moduleProcesser() {
        renderJson("processer",
                   Employee.dao.getModuleProcesser(ControlUtils.getDeptRegionPosid(this)));
    }

    /**
     * 查询工艺
     */
    public void deptModuleCraft() {
        String isAll = getPara("isAll");// 有值时表示为查找所有工艺
        String step = StrKit.notBlank(isAll) ? ControlUtils.getUserDeptStepId(this)
                                            : ControlUtils.getUserTeamStepId(this);
        List<Craft> list = Craft.dao.findDeptModuleCraft(step);

        setAttr("success", list.size());
        setAttr("craft", list);

        renderJson();
    }

    /**
     * 模具加工单工作量统计
     */
    public void workloadStatistics() {

        try {
            String d = getPara("date");
            String craftId = getPara("craftId");
            List<ModuleEstSchedule> list = ModuleEstSchedule.dao.findSchedule(craftId);

            int workTime = 22;// 机台每天有效工时
            Map<String, Integer> workload = new HashMap<String, Integer>();
            Map<String, Integer> parts = new HashMap<String, Integer>();

            Integer evaluate;
            Integer count;
            Integer eval;
            String date;
            int times;
            Date now;

            for (ModuleEstSchedule m : list) {
                date = m.getStr("STARTTIME");

                evaluate = (workload.get(date) != null ? workload.get(date) : 0);
                count = (parts.get(date) != null ? parts.get(date) : 0);

                eval = m.getNumber("EVALUATE").intValue();

                if (eval > workTime) {
                    now = DateUtils.strToDate(date, DateUtils.DEFAULT_SHORT_DATE);
                    times = eval / workTime;
                    int i = 0;

                    for (; i < times; i++) {
                        date = DateUtils.addDateToStr(now, i, DateUtils.DEFAULT_SHORT_DATE);
                        evaluate = (workload.get(date) != null ? workload.get(date) : 0);
                        count = (parts.get(date) != null ? parts.get(date) : 0);

                        workload.put(date, evaluate + workTime);
                        parts.put(date, count + 1);
                    }

                    date = DateUtils.addDateToStr(now, i, DateUtils.DEFAULT_SHORT_DATE);
                    evaluate = (workload.get(date) != null ? workload.get(date) : 0);
                    count = (parts.get(date) != null ? parts.get(date) : 0);

                    workload.put(date, evaluate + (eval % workTime));
                    parts.put(date, count + 1);

                } else {
                    workload.put(date, evaluate + eval);
                    parts.put(date, count + 1);
                }

            }

            int load = ModuleMachine.dao.findMachineLoad(craftId);

            List<Record> workList = new ArrayList<Record>();
            List<Integer> partList = new ArrayList<Integer>();

            int days = DateUtils.getMaxDayOfMonth(StrKit.notBlank(d) ? DateUtils.strToDate(d,
                                                                                           DateUtils.YEAR_AND_MONTH)
                                                                    : new Date());
            String tmp = "";

            for (int i = 1; i <= days; i++) {
                tmp = d + "-" + (i < 10 ? "0" + i : i);
                Record r = new Record();
                r.set("y", workload.get(tmp) != null ? workload.get(tmp) : 0);
                r.set("color", r.getInt("y") > load ? "#EE3B3B" : "#008B8B");// 当天的工时大于机台负载时显示为红色
                workList.add(r);

                partList.add(parts.get(tmp) != null ? parts.get(tmp) : 0);
            }
            setAttr("success", true);
            setAttr("parts", partList);
            setAttr("times", workList);
            setAttr("load", load);
        }
        catch (Exception e) {
            e.printStackTrace();
            setAttr("success", false);
        }
        renderJson();
    }

    /**
     * 查询模具进度
     */
    // @Before(CacheInterceptor.class)
    // @CacheName("moduleSchedule")
    public void moduleSchedule() {
        ModuleProceedExtract mpe = new ModuleProceedExtract();
        mpe.setController(this);
        mpe.setRate(0.9);
        renderJson(mpe.extract());
    }

    /**
     * 得到当前模具的所有机种名
     */
    public void currentModuleClass() {
        List<ModuleList> list = ModuleList.dao.findMoudleClassProcess();
        setAttr("success", list.size() > 0);
        setAttr("item", list);

        renderJson();
    }

    /**
     * 查询模具工件的计划与实际加工流程
     */
    public void queryModulePartFlow() {
        Object moduleResumeId = getPara("id");
        int page = getParaToInt("page");
        int start = getParaToInt("start");
        int limit = getParaToInt("limit");
        Object pcode = getPara("pcode");
        // 是否显示全部排程
        boolean isall = getParaToBoolean("isall");

        Page<Record> partPage = ModulePartList.dao.findProcessPart(moduleResumeId,
                                                                   page,
                                                                   start,
                                                                   limit,
                                                                   pcode,
                                                                   isall);

        List<Record> flowList = ModuleEstSchedule.dao.findPlanProcessFlow(moduleResumeId,
                                                                          page,
                                                                          start,
                                                                          limit,
                                                                          pcode,
                                                                          isall);

        List<Record> actualList = ModuleProcessResume.dao.findActualProcessFlow(moduleResumeId,
                                                                                page,
                                                                                start,
                                                                                limit,
                                                                                pcode,
                                                                                isall);

        Map<String, List<Record>> planMap = DataUtils.recordClassific(flowList, "partbarlistcode");
        // Map<String, List<Record>> actualMap =
        // DataUtil.recordActualClassific(actualList);
        Map<String, List<ActualFlowForm>> actualMap = DataUtils.recordActualRank(actualList);

        List<Record> partList = partPage.getList();

        for (Record r : partList) {
            r.set("partflow", planMap.get(r.get("partbarlistcode")));
            r.set("actualflow", actualMap.get(r.get("partbarlistcode")));
        }

        setAttr("success", partPage.getPageNumber() > 0);
        setAttr("parts", partList);
        setAttr("total", partPage.getTotalRow());

        renderJson();
    }

    /**
     * 查询工件的最新动态
     */
    public void queryPartDynamic() {
        long nowTime = getParaToLong("nowTime");
        String partState = getPara("partState");
        String deptId = ControlUtils.getDeptRegionPosid(this);
        // String time = DateUtil.dateToStr(new Date(nowTime),
        // DateUtil.DEFAULT_DATE_FORMAT);
        setAttr("nowtime", System.currentTimeMillis());
        setAttr("parts", ModuleProcessInfo.dao.findCurrentTimePartState(deptId,
                                                                        new Timestamp(nowTime),
                                                                        partState));

        renderJson();
    }

    /**
     * 得到模具加工单位,依据用户的不同
     */
    public void moduleProcessDept() {
        renderJson(RegionDepartment.dao.findDeptForUser(ControlUtils.getUserTeamStepId(this)));
    }

    /**
     * <h3>查找指定单位加工工件提醒</h3>
     * 
     * query的取值与说明:
     * 
     * <ol>
     * <li>工件离开工时间</li>
     * <li>工件离完工时间</li>
     * <li>错过开工时间</li>
     * <li>错过完工时间</li>
     * </ol>
     */
    public void queryModulePartDeadLine() {
        String deptId = StrKit.notBlank(getPara("deptId")) ? getPara("deptId")
                                                          : ControlUtils.getDeptPosid(this);
        int query = getParaToInt("query");
        int time = getParaToInt("time");

        List<ModuleProcessInfo> list = ModuleProcessInfo.dao.findModulePartDeadLine(deptId,
                                                                                    query,
                                                                                    time);

        renderJson(list);
    }

    /**
     * 查询打印纸格式
     */
    public void queryPrintPaperFormat() {
        renderJson(BarcodePaper.dao.findUsedPaper(getPara("moduleId")));
    }

    /**
     * 查询所指定加工单位的机台稼动率
     */
    public void moduleMachineRate() {
        String deptStepId = getPara("deptStepId");
        boolean present = getParaToBoolean("present", false);
        String startTime = getPara("startTime");
        String endTime = getPara("endTime");

        String splitFormat = DateUtils.getDateNow(DateUtils.DEFAULT_SHORT_DATE) + " 08:00:00";
        // 为当天的机台稼动率
        if (present) {
            // 分为白班和夜班两个时间段
            Date now = new Date();
            Date split = DateUtils.strToDate(splitFormat, DateUtils.DEFAULT_DATE_FORMAT);
            if (now.getTime() <= split.getTime()) {
                startTime = DateUtils.addDateToStr(now, -1, DateUtils.DEFAULT_SHORT_DATE)
                            + " 08:00:00";
            } else {
                startTime = splitFormat;
            }

            endTime = DateUtils.getDateNow(DateUtils.DEFAULT_DATE_FORMAT);
        } else {
            // 选择时间段稼动率时,如果只选择的开始时,那表示只查当前选择这一天的稼动率
            if (StrKit.isBlank(endTime)) {
                // 如果选择的开始时间刚好为当天的,那么就统计当天时间段的稼动率
                if (startTime.equals(splitFormat)) {
                    Date now = new Date();
                    Date split = DateUtils.strToDate(splitFormat, DateUtils.DEFAULT_DATE_FORMAT);
                    if (now.getTime() <= split.getTime()) {
                        startTime = DateUtils.addDateToStr(now, -1, DateUtils.DEFAULT_DATE_FORMAT);
                    } else {
                        startTime = splitFormat;
                    }

                    endTime = DateUtils.getDateNow(DateUtils.DEFAULT_DATE_FORMAT);
                } else {
                    Date start = DateUtils.strToDate(startTime, DateUtils.DEFAULT_DATE_FORMAT);
                    endTime = DateUtils.addDateToStr(start, 1, DateUtils.DEFAULT_DATE_FORMAT);
                }
            }
        }

        double useTime = DateUtils.getDateTimeFieldInternal(startTime, endTime, Calendar.MINUTE, 2);

        List<Record> list = DeviceDepart.dao.findMachineRate(deptStepId, startTime, endTime);
        for (Record r : list) {
            r.set("RATE",
                  ArithUtils.mul(ArithUtils.div(r.getNumber("RATE").longValue(), useTime, 2), 100));
        }

        renderJson(list);
    }

    /**
     * 獲取當前的服務器時間
     */
    public void getDateTimeNow() {
        renderJson("datetime", DateUtils.getDateNow());
    }

    /**
     * 导出为客户格式模具进度
     * 
     * @throws IOException
     */
    public void exportCustomerSchedule() throws IOException {
        new CustomerScheduleReport(this).exportExcel();
    }

    /**
     * 导出为客户格式模具进度
     * 
     * @throws IOException
     */
    public void exportEmployeeEffient() throws IOException {
        new EmployeeEffientReport(this).exportExcel();
    }

    /**
     * 导出为客户格式模具进度
     * 
     * @throws IOException
     */
    public void exportProcessSchedule() throws IOException {
        new ModuleProcessScheduleReport(this).exportExcel();
    }

    /**
     * 查找模具组立单位
     */
    public void queryModuleAssemble() {
        renderJson(RegionDepartment.dao.findModuleAssemble());
    }

    public void getAllProcessModuleInfo() {
        renderJson(ModuleResume.dao.getAllProcessModuleInfo(getPara("query")));
    }

    /**
     * 得到指定模具修模/设变信息
     */
    public void historyResumePart() {
        Map<Record, List<Record>> map = DataUtils.recordTwoLayout(ModuleResume.dao.findHistoryResumePart(getPara("m")),
                                                                  "resumeid",
                                                                  "partlistcode",
                                                                  "resumeid",
                                                                  "resumename",
                                                                  "starttime",
                                                                  "endtime",
                                                                  "mdremark",
                                                                  "resumestate");
        renderJson(DataUtils.recordMapToList(map));
    }

    /**
     * 获取外发工件的状态
     */
    public void getOutBoundStates() {
        renderJson(ModuleProcessState.dao.getReferenceStates("206", 1));
    }

    /**
     * 获取职位相关的讯息
     */
    public void getCareerInfo() {
        renderJson(Station.dao.getCareerInfo());
    }

    public void getTaskPropertyByType() {
        renderJson(TaskClassic.dao.getTaskClassicByType(getParaToInt("typeid")));
    }

    public void getTaskGroupList() {
        renderJson("children", TaskGroup.dao.getAnsyTaskTree(getPara("stepid")));
    }

    public void getTaskStructInfo() {
        renderJson(TaskStruct.dao.getTaskStructInfo(getPara("stepid")));
    }

    /**
     * 用模糊查询的方式员工讯息 vague[模糊]
     */
    public void getEmployeeByVague() {
        renderJson(Employee.dao.getEmployeeByVague(getPara("query")));
    }

    public void getModuleListByVague() {
        renderJson(ModuleList.dao.getModuleListByVague(getPara("query"),
                                                       RegularState.MODULE_RESUME_NEW.getIndex(),
                                                       getParaToBoolean("isall")));
    }

    public void getTaskGroupChildAndMember() {
        List<TaskTreeBean> treeBean = new ArrayList<TaskTreeBean>();
        List<TaskGroup> taskGroup = TaskGroup.dao.getAnsyTaskTree(getPara("stepid"));
        if (taskGroup.size() > 0) {
            for (TaskGroup tg : taskGroup) {
                String groupid = tg.getStr("ID");
                String text = tg.getStr("TEXT");
                String stepUniqueId = tg.getStr("STEPID");

                TaskTreeBean tree = new TaskTreeBean();

                tree.setId("g-" + stepUniqueId);
                tree.setChecked(false);
                tree.setLeaf(false);
                tree.setGroupid(groupid);
                tree.setStepid(stepUniqueId);
                tree.setText(text);

                treeBean.add(tree);
            }
        }

        List<TaskStruct> taskStruct = TaskStruct.dao.getTaskStructByStepid(getPara("stepid"));

        if (taskStruct.size() > 0) {
            for (TaskStruct ts : taskStruct) {
                String structid = ts.getStr("ID");
                String text = ts.getStr("EMPNAME");

                TaskTreeBean tree = new TaskTreeBean();

                tree.setId("s-" + structid);
                tree.setChecked(false);
                tree.setLeaf(true);
                tree.setText(text);

                treeBean.add(tree);
            }
        }

        renderJson(treeBean);
    }

    /**
     * 获取任务树对应的单位成员
     */
    public void getJoinTaskStuff() {
        renderJson(TaskStruct.dao.getJoinTaskStuff(getPara("treeid")));
    }

    /**
     * 获取加工任务讯息
     */
    public void getTaskInfo() {
        renderJson(TaskInfo.dao.getTaskInfo(getParaToInt("start"), getParaToInt("limit")));
    }

    /**
     * 获取任务成员
     */
    public void getTaskStuff() {
        renderJson(TaskStuff.dao.getTaskStuff(getPara("taskid")));
    }

    /**
     * 按条件查询模具履历
     */
    public void getModuleResumeInfoByCase() {
        renderJson(ModuleResume.dao.getModuleForResumeCase(getParaToBoolean("chk"),
                                                           getPara("query"),
                                                           getPara("states"),
                                                           "完成"));
    }

    /**
     * 获取所有的零件资料
     */
    public void getAllPartsProcessInfo() {
        ModuleAllPartExtract mape = new ModuleAllPartExtract();
        mape.setRate(0.9);

        mape.setController(this);

        renderJson(mape.extract());
    }

    /**
     * 获取加工模具的类型数量
     */
    public void getProcessModuleTypeCount() {
        renderJson(ModuleResume.dao.queryProcessModuleTypeCount());
    }

    public void getCurrentProcessInfo() {
        renderJson(ModuleResume.dao.getCurrentProcessContent(getPara("stateid")));
    }

    public void getFinishOfLastWeek() {
        renderJson(ModuleResumeRecord.dao.getLastWeekProcessInfo(getPara("stateid"),
                                                                 getPara("typeid") == null ? false
                                                                                          : getParaToInt("typeid") > 0));
    }

    public void getWeekLoadReport() {
        renderJson(ModuleProcessResume.dao.getWeekMacLoad(getPara("stateid")));
    }

    public void getScheduleCrafts() {
        renderJson(Craft.dao.getClassifyCraftList(getParaToInt("classid")));
    }

    public void getAvaliableRegion() {
        renderJson(RegionDepartment.dao.getPackageClassifyRegion(getParaToInt("classid"),
                                                                 getParaToInt("isava")));
    }

    public void getRegularEstimateSchedule() {
        renderJson(ModuleEstSchedule.dao.getRegularEstimateSchedule(getPara("partid"),
                                                                    getPara("resumeid")));
    }

    public void getActualWorkSchedule() {
        renderJson(ModuleProcessResume.dao.getActualWorkSchedule(getPara("partid"),
                                                                 getPara("resumeid")));
    }

    public void getWorkPartInformation() {
        renderJson(ModuleProcessInfo.dao.getWorkPartInformation(getPara("partid"),
                                                                getPara("resumeid")));
    }

    public void getModuleProcessDetails() {
        renderJson(ModuleProcessResume.dao.getPartProcessInfo(getPara("partid"),
                                                              getPara("resumeid")));
    }

    /**
     * 获取机台的开机比率
     */
    public void getMachineWorkRate() {
        MachineRateExtract mre = new MachineRateExtract();

        mre.setController(this);
        mre.setClassid("201");
        mre.setTypeid(0);
        mre.setIscal(0);

        renderJson(mre.extract());
    }

    /**
     * 获取金型部门的根节点
     */
    public void getRootRegion() {
        RegionRootExtract rre = new RegionRootExtract();
        rre.setMatch("0101__");

        renderJson(rre.extract());
    }

    /**
     * 获取机台明细
     */
    public void getMachineWorkDetails() {
        renderJson(DeviceDepart.dao.getMachineWorkDetails(getPara("deptid"), getPara("stateid"), 0));
    }

    /**
     * 获取机台的种类讯息
     */
    public void getMachineCraftInfo() {
        MachineCraftExtract mce = new MachineCraftExtract();
        mce.setController(this);

        renderJson(mce.extract());
    }

    public void getMachineWorkPartDetails() {
        renderJson(ModuleProcessInfo.dao.getMachineWorkPartDetails(getPara("departid")));
    }

    /**
     * 获取模具加工履历范围内的加工零件的清单
     */
    public void getModuleProcessedDetails() {
        renderJson(ModulePartList.dao.getModuleProcessedDetails(getPara("resumeid")));
    }

    public void getModuleResumeInfo() {
        renderJson(ModuleResumeRecord.dao.getModuleResumeInfo(getPara("modulebarcode"), true));
    }

    /**
     * 获取零件加工负荷
     */
    public void getResumeWorkLoad() {

        FixedCraftExtract fce = new FixedCraftExtract();
        fce.setHideStateId(RegularState.MODULE_RESUME_STOP.getIndex());
        fce.setController(this);

        renderJson(fce.extract());

    }

    /**
     * 获取机台工艺的最大日加工负荷
     */
    public void getStandardWorkLoad() {
        renderJson(Craft.dao.getStandardWorkLoad(getPara("stepid"), getPara("kindid")));
    }

    /**
     * 获取模具排程讯息
     */
    public void getModuleScheduleContent() {
        ModuleScheduleExtract mse = new ModuleScheduleExtract();
        mse.setController(this);

        renderJson(mse.extract());
    }

    public void getPartContent() {
        PartContentExtract pce = new PartContentExtract();
        pce.setController(this);

        Object result = pce.extract();

        setAttr("success", pce.isSuccess());
        setAttr("empty", pce.isEmpty());
        setAttr("msg", pce.getMsg());
        setAttr("data", result);

        renderJson();
    }

    public void getModuleResumeAssemble() {
        ModuleResumeExtract mre = new ModuleResumeExtract();
        mre.setController(this);

        renderJson(mre.extract());
    }

    /**
     * 获取进行加工的工人明细
     */
    public void getEffientEmployee() {

        EmployeeEfficiencyExtract eee = new EmployeeEfficiencyExtract();
        // 设置最高的查询上限天数
        eee.setMax(90);
        eee.setController(this);

        renderJson(eee.extract());
    }

    public void getEffientUnit() {
        EffcientUnitExtract eue = new EffcientUnitExtract();
        eue.setController(this);

        renderJson(eue.extract());
    }

    public void getEffientInfo() {
        renderJson(ModuleProcessResume.dao.getEmployeeEffientInfo(getPara("partbarlistcode"),
                                                                  getPara("empid"),
                                                                  getPara("craftid"),
                                                                  getPara("resumeid")));
    }

    public void getRegionEmployeeInfoByStepid() {
        renderJson(Employee.dao.getEmployeeInfoByStepid(getPara("stepid")));
    }

    /**
     * 获得本人所在单位的
     */
    public void getEmployeeRegionDepart() {
        renderJson("department",
                   RegionDepartment.dao.getRegionDepartment(ControlUtils.getStepId(this), 0));
    }

    public void getModuleResumeList() {
        renderJson(ModuleResumeRecord.dao.getModuleResumeListByResumeId(getPara("resumeid"),
                                                                        getPara("format")));
    }

    /**
     * 获取当前的机台工作负荷
     */
    public void getCurrentMahineWorkLoad() {
        RegionWorkLoadExtract rwle = new RegionWorkLoadExtract();
        rwle.setController(this);

        renderJson(rwle.extract());
    }

    /**
     * 获取工件预计负荷
     */
    public void getArtifactEstWorkLoad() {
        ArtifactWorkLoadExtract awle = new ArtifactWorkLoadExtract();
        awle.setHideStateId(RegularState.MODULE_RESUME_STOP.getIndex());
        awle.setController(this);

        renderJson(awle.extract());
    }

    /**
     * 获取模具履历零件明细
     */
    public void getModuleResumePartInfo() {
        ModulePartInfoExtract mpie = new ModulePartInfoExtract();
        mpie.setController(this);

        renderJson(mpie.extract());
    }

    /**
     * 导出为客户格式模具进度
     * 
     * @throws IOException
     */
    public void exportPartInfo() throws IOException {
        new ExportPartInfoReport(this).exportExcel();
    }

    /**
     * 系统握手
     */
    public void handShake() {
        renderJson("success", !StringUtils.isEmpty(ControlUtils.getAccountId(this)));
    }

    /**
     * 导出模具信息
     * 
     * @throws IOException
     */
    public void exportModuleReport() throws IOException {
        new ExportModuleReport(this).exportExcel();
    }

    /**
     * 得到国际化内容
     */
    public void getLocaleContent() {
        renderJson(I18n.getLocaleContent(this));
    }
}
