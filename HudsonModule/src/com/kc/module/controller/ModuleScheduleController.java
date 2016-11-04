package com.kc.module.controller;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.jfinal.aop.Before;
import com.jfinal.aop.ClearInterceptor;
import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.IAtom;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.extract.ModuleScheduleInquireExtract;
import com.kc.module.interceptor.AuthInterceptor;
import com.kc.module.interceptor.validator.CraftPlanValidator;
import com.kc.module.model.ModuleCraftSet;
import com.kc.module.model.ModuleEstSchedule;
import com.kc.module.model.ModuleList;
import com.kc.module.model.form.GanttExportForm;
import com.kc.module.model.form.GanttExportFormList;
import com.kc.module.transaction.AddCraftClassifyIAtom;
import com.kc.module.transaction.AddCraftSetIAtom;
import com.kc.module.transaction.CopyPartScheduleIAtom;
import com.kc.module.transaction.CreateCraftPlanIAtom;
import com.kc.module.transaction.QuotePartScheduleIAtom;
import com.kc.module.transaction.RemoveCraftPlanIAtom;
import com.kc.module.transaction.SaveEstimateRemarkIAtom;
import com.kc.module.transaction.SaveOrUpdateScheduleIAtom;
import com.kc.module.transaction.SavePartContentIAtom;
import com.kc.module.transaction.SetCraftPlanIAtom;
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.ControlUtils;
import com.kc.module.utils.DataUtils;
import com.kc.module.utils.JsonUtils;
import com.kc.module.utils.StringUtils;

/**
 * 模具进度管理控制器
 * 
 * @author xuwei
 * @date 2013-10-17
 * 
 */
@Before(AuthInterceptor.class)
public class ModuleScheduleController extends Controller {

    /**
     * 得到模具的加工排程
     */
    @ClearInterceptor
    public void moduleResumePlanGantt() {
        String mri = getPara("mri");
        String startTime = getPara("s");
        String endTime = getPara("e");
        String moduleCode = getPara("m");

        List<ModuleEstSchedule> list = ModuleEstSchedule.dao.findModuleResumeSchedule(mri);

        Map<Record, List<ModuleEstSchedule>> map = DataUtils.modelTwoLayout(list, "PARTBARLISTCODE", new String[]{"PARTLISTCODE"}, null);

        Iterator<Record> iterator = map.keySet().iterator();
        Record keyRecord;
        Iterator<ModuleEstSchedule> mesIterator;
        ModuleEstSchedule mes;
        int count = 0;
        Timestamp s = null;
        Timestamp e = null;

        StringBuilder json = new StringBuilder();

        json.append("{\"success\":").append(list.size() > 0);

        json.append(",\"gantt\":[{").append("\"PercentDone\" : 0");
        json.append(",\"DurationUnit\" : \"h\"").append(",\"Name\" :\"");
        json.append(moduleCode).append("\",\"BaselineStartDate\" :\"");
        json.append(startTime == null ? "" : startTime);
        json.append("\",\"BaselineEndDate\" :\"").append(endTime == null ? "" : endTime);
        json.append("\",\"StartDate\" :\"");
        json.append(startTime == null ? "" : startTime);
        json.append("\",\"EndDate\" :\"").append(endTime == null ? "" : endTime);
        json.append("\",\"expanded\" : true").append(",\"children\":[");

        while (iterator.hasNext()) {
            keyRecord = iterator.next();
            json.append("{\"PercentDone\" : 69");
            json.append(",\"DurationUnit\" : \"h\"").append(",\"Name\" :\"");
            json.append(keyRecord.get("PARTLISTCODE"));
            json.append("\",\"expanded\" : false").append(",\"children\":[");

            count = map.get(keyRecord).size();
            mesIterator = map.get(keyRecord).iterator();

            while (mesIterator.hasNext()) {
                mes = mesIterator.next();
                // json.append("{\"id\" :\"").append(mes.get("id"));

                if (mes.getNumber("RANKNUM").intValue() == 0) {
                    s = mes.get("STARTTIME");// 第一个工艺排程的开始时间
                }

                if (mes.getNumber("RANKNUM").intValue() == count - 1) {
                    e = mes.get("ENDTIME");// 最后一个工艺排程的结束时间
                }

                json.append("{\"PercentDone\" : 33,\"DurationUnit\" : \"h\"");
                json.append(",\"Duration\" : ");
                json.append(mes.get("DURATION")).append(",\"leaf\" : true");
                json.append(",\"Name\" :\"").append(mes.getStr("CRAFTNAME"));
                json.append("\",\"index\" :").append(mes.get("RANKNUM"));
                json.append(",\"BaselineStartDate\" :\"");
                json.append(mes.get("STARTTIME") == null ? "" : mes.get("STARTTIME"));
                json.append("\",\"BaselineEndDate\" :\"");
                json.append(mes.get("ENDTIME") == null ? "" : mes.get("ENDTIME"));
                json.append("\",\"StartDate\" :\"");
                json.append(mes.get("STARTTIME") == null ? "" : mes.get("STARTTIME"));
                json.append("\",\"EndDate\" :\"");
                json.append(mes.get("ENDTIME") == null ? "" : mes.get("ENDTIME"));
                json.append("\"").append(mesIterator.hasNext() ? "}," : "}");

            }

            json.append("],\"BaselineStartDate\" :\"").append(s);
            json.append("\",\"BaselineEndDate\" :\"").append(e);
            json.append("\",\"StartDate\" :\"").append(s);
            json.append("\",\"EndDate\" :\"").append(e);
            json.append(iterator.hasNext() ? "\"}," : "\"}");

        }

        json.append("]}],\"msg\":").append(list.size() > 0 ? "\"\"}" : "\"没有排程数据!\"}");

        map = null;

        renderJson(json.toString());

    }

    @ClearInterceptor
    public void exportSchedule() throws IOException {
        String html = getPara("html");
        String format = getPara("format");
        String orientation = getPara("orientation");

        GanttExportFormList ganttExportFormList = JsonUtils.josnToBean("{\"htmls\":" + html + "}", GanttExportFormList.class);

        List<GanttExportForm> htmls = ganttExportFormList.getHtmls();

        File[] files = new File[3];

        String savePath = getRequest().getServletContext().getRealPath("/");

        for (int i = 0; i < htmls.size(); i++) {
            files[i] = writeSchedule(htmls.get(i).getHtml(), savePath);
        }

        File p = new File(savePath + File.separator + "phantomjs.exe");
        File r = new File(savePath + File.separator + "render.js");

        String requestRoot = this.getRequest().getRequestURL().toString().replace(this.getRequest().getServletPath(), "/");

        if (p.isFile() && r.isFile()) {
            StringBuilder command = new StringBuilder();

            command.append("phantomjs.exe");
            command.append(" " + r.getAbsolutePath()).append(" '");

            for (int i = 0; i < files.length; i++) {
                command.append(requestRoot).append(files[i].getName()).append(i == files.length - 1 ? "" : "|");
            }

            command.append("' '").append(savePath).append("' '");
            command.append(format).append("' '").append(orientation);
            command.append("' 2>&1");
        }

        renderText("sf");

    }

    private File writeSchedule(String html, String savePath) {
        File file = new File(savePath + File.separator + System.currentTimeMillis() + ".html");
        BufferedWriter writer = null;
        try {
            writer = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(file)));

            writer.write(html);

            writer.flush();
            writer.close();
        }
        catch (Exception e) {
            e.printStackTrace();
        }
        return file;
    }

    /**
     * 得到工件的排程Gantt信息
     */
    public void craftPlanGantt() {
        ModuleScheduleInquireExtract msie = new ModuleScheduleInquireExtract();
        msie.setController(this);

        renderText(StringUtils.parseString(msie.extract()));
    }

    /**
     * 新增工艺排程,并且在之之后的排程位置要往后移动一个位置
     */
    public void createCraftPlan() {

        CreateCraftPlanIAtom ccpi = new CreateCraftPlanIAtom();
        ccpi.setController(this);
        boolean succeed = ControlUtils.doIAtom(ccpi);

        setAttr("gantt", ccpi.getSchId());
        setAttr("success", succeed);
        setAttr("msg", ccpi.getMsg());

        renderJson();
    }

    /**
     * 删除工艺排程,并且在之之后的排程位置要往前移动一个位置
     */
    public void removeCraftPlan() {
        RemoveCraftPlanIAtom rcpi = new RemoveCraftPlanIAtom();
        rcpi.setController(this);

        boolean succeed = ControlUtils.doIAtom(rcpi);

        setAttr("success", succeed);
        setAttr("msg", rcpi.getMsg());
        setAttr("gantt", rcpi.getScheduleId());

        renderJson();
    }

    /**
     * 工艺安排开工时间与完工时间
     */
    @Before(CraftPlanValidator.class)
    public void craftTime() {
        SetCraftPlanIAtom scpi = new SetCraftPlanIAtom();
        scpi.setController(this);

        boolean success = ControlUtils.doIAtom(scpi);

        setAttr("success", success);
        setAttr("msg", scpi.getMsg());

        renderJson();
    }

    /**
     * 工件工时设置
     */
    @Before(CraftPlanValidator.class)
    public void evaluateTime() {
        boolean success = Db.tx(new IAtom() {
            public boolean run() throws SQLException {
                ModuleEstSchedule mes = getModel(ModuleEstSchedule.class, "mes");

                List<ModuleEstSchedule> list = ModuleEstSchedule.dao.findPartListSchedule(mes.get("id"));

                // 如果有多个工件时,就对工时进行平分
                double time = 0;
                if (list.size() > 0) {
                    time = ArithUtils.div(mes.getNumber("evaluate").doubleValue(), list.size());
                }

                for (ModuleEstSchedule m : list) {
                    m.set("evaluate", time);

                    if (!m.update()) {
                        return false;
                    }
                }
                return mes.update();
            }
        });

        setAttr("success", success);
        setAttr("msg", success ? "工时安排成功!" : "工时更改失败!");
        renderJson();
    }

    /**
     * 部门安排工件加工工时
     */
    public void deptEvaluateTime() {
        evaluateTime();
    }

    /**
     * 自动生成模具工艺排程
     * 
     * @throws JsonParseException
     * @throws JsonMappingException
     * @throws IOException
     */
    @ClearInterceptor
    public void autoCraftPlan() {
        QuotePartScheduleIAtom qpsi = new QuotePartScheduleIAtom();
        qpsi.setController(this);

        boolean success = Db.tx(qpsi);

        setAttr("success", success);
        setAttr("msg", qpsi.getMsg());
        setAttr("gantt", qpsi.getSchedule());

        renderJson();
    }

    /**
     * 获取工艺集合内容
     * 
     * @throws NoSuchMethodException
     * @throws SecurityException
     * @throws InvocationTargetException
     * @throws IllegalAccessException
     * @throws IllegalArgumentException
     */
    @SuppressWarnings("unchecked")
    @Before(CraftPlanValidator.class)
    public void craftSet() throws Exception {
        String set = getPara("setMethod");
        String condition = getPara("condition");

        Class<ModuleCraftSet> clazz = (Class<ModuleCraftSet>) ModuleCraftSet.dao.getClass();

        // 根据请求的方法名来读取相应的结果
        // 1.findCraftSetName
        // 2.findCraftSetContent
        Method method = clazz.getMethod(set, String.class);

        List<ModuleCraftSet> list = (List<ModuleCraftSet>) method.invoke(ModuleCraftSet.dao, condition);
        renderJson(list);
    }

    /**
     * 新增模具工艺集合
     */
    @Before(CraftPlanValidator.class)
    public void createCraftSet() {

        AddCraftSetIAtom asi = new AddCraftSetIAtom();
        asi.setController(this);
        asi.setSet(getModel(ModuleCraftSet.class, "mcs"));

        boolean success = Db.tx(asi);

        setAttr("setId", asi.getItemId());
        setAttr("success", success);
        setAttr("msg", getAttr("success") ? "新增集合成功!" : "新增集合失败,请重试!");

        renderJson();
    }

    /**
     * 删除集合工艺
     */
    @Before(CraftPlanValidator.class)
    public void deleteCraftSet() {
        boolean success = Db.tx(new IAtom() {
            public boolean run() throws SQLException {

                boolean success = true;
                String setId = getPara("setId");

                if (getPara("type").equals("root")) {

                    success = ModuleCraftSet.dao.deleteAllCraftById(setId);
                } else {
                    // 当前工艺的位置往前一个工艺
                    success = ModuleCraftSet.dao.updateCraftLocation(setId, getParaToInt("ranknum"), -1);

                    success = success && ModuleCraftSet.dao.findById(setId).delete();
                }

                return success;
            }
        });

        setAttr("success", success);
        setAttr("msg", getAttr("success") ? "删除工艺集合成功!" : "删除工艺集合失败,请重试!");

        renderJson();
    }

    /**
     * 更改集合工艺
     */
    public void updateCraftSet() {

        boolean success = Db.tx(new IAtom() {
            public boolean run() throws SQLException {
                return getModel(ModuleCraftSet.class, "mcs").update();
            }
        });

        setAttr("success", success);
        setAttr("msg", getAttr("success") ? "更改工艺集合成功!" : "更改工艺集合失败,请重试!");

        renderJson();
    }

    /**
     * 查詢預計開工的工件工藝排程訊息
     */
    public void queryPredictCraftSchedule() {
        renderJson(ModuleEstSchedule.dao.queryPredictCraftSchedule(getPara("craftid"), getPara("day")));
    }

    /**
     * 查询匹配的已经安排排程的模具
     */
    public void getScheduleModuleInfo() {
        renderJson(ModuleList.dao.getScheduleModuleInfo(getPara("match")));
    }

    public void saveOrUpateScheduleInfo() {
        SaveOrUpdateScheduleIAtom saveSche = new SaveOrUpdateScheduleIAtom();
        saveSche.setController(this);
        // 设置日期的最大和最小限制日期
        saveSche.setMinDay(0);
        saveSche.setMaxDay(30);
        // 设置小时的最大值和最小值
        saveSche.setMinHour(0);
        saveSche.setMaxHour(23);
        // 执行对排程的操作
        boolean rst = Db.tx(saveSche);
        setAttr("success", rst);
        setAttr("list", saveSche.getBackInfo());
        setAttr("result", saveSche.getResult());

        renderJson();
    }

    public void addModuleCraftClassify() {
        AddCraftClassifyIAtom acci = new AddCraftClassifyIAtom();

        acci.setController(this);

        boolean result = Db.tx(acci);

        setAttr("success", result);
        setAttr("msg", acci.getMsg());

        renderJson();
    }

    /**
     * 保存工艺排程说明
     */
    public void saveEstimateRemark() {
        SaveEstimateRemarkIAtom seri = new SaveEstimateRemarkIAtom();
        seri.setController(this);

        renderJson("success", Db.tx(seri));
    }

    public void getModuleScheduleInfo() {
        renderJson(ModuleEstSchedule.dao.getModuleScheduleInfo(getPara("resumeid")));
    }

    public void savePartContent() {
        SavePartContentIAtom spci = new SavePartContentIAtom();
        spci.setController(this);

        boolean success = Db.tx(spci);

        setAttr("msg", spci.getMsg());
        setAttr("success", success);

        renderJson();
    }

    public void copyPartSchedule() {
        CopyPartScheduleIAtom cpsi = new CopyPartScheduleIAtom();
        cpsi.setController(this);

        boolean success = Db.tx(cpsi);

        setAttr("success", success);
        setAttr("msg", cpsi.getMsg());
        setAttr("gantt", cpsi.getSchedule());

        renderJson();
    }
}
