package com.kc.module.controller;

import java.io.File;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jfinal.aop.Before;
import com.jfinal.aop.ClearInterceptor;
import com.jfinal.core.Controller;
import com.jfinal.kit.JsonKit;
import com.jfinal.log.Logger;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.IAtom;
import com.jfinal.plugin.activerecord.Page;
import com.jfinal.plugin.activerecord.Record;
import com.jfinal.upload.UploadFile;
import com.kc.module.base.Barcode;
import com.kc.module.base.ModuleState;
import com.kc.module.interceptor.AuthInterceptor;
import com.kc.module.interceptor.validator.ModuleManageValidator;
import com.kc.module.model.Craft;
import com.kc.module.model.DeviceDepart;
import com.kc.module.model.DeviceType;
import com.kc.module.model.Factory;
import com.kc.module.model.ModuleList;
import com.kc.module.model.ModulePart;
import com.kc.module.model.ModulePartList;
import com.kc.module.model.ModuleProcessInfo;
import com.kc.module.model.ModuleResume;
import com.kc.module.model.ModuleResumeRecord;
import com.kc.module.model.RegionDepartment;
import com.kc.module.model.form.ModuleCode;
import com.kc.module.model.form.ModuleNewPartForm;
import com.kc.module.model.form.ParsePartListForm;
import com.kc.module.shared.SharedMethods;
import com.kc.module.transaction.AddDevicesIAtom;
import com.kc.module.transaction.AddModulePartIAtom;
import com.kc.module.transaction.AlertModuleInfoIAtom;
import com.kc.module.transaction.CreateModuleIAtom;
import com.kc.module.transaction.DeleteDevicesIAtom;
import com.kc.module.transaction.ModifyPartCountIAtom;
import com.kc.module.transaction.ModuleResumeRemoveIAtom;
import com.kc.module.transaction.ProceedModuleFinishIAtom;
import com.kc.module.transaction.ProcessModuleHandleIAtom;
import com.kc.module.transaction.ProcessPartFinishIAtom;
import com.kc.module.transaction.RemoveModuleIAtom;
import com.kc.module.transaction.RuinModuleIAtom;
import com.kc.module.transaction.SaveDeviceClassficIAtom;
import com.kc.module.transaction.SaveExcelPartInfo;
import com.kc.module.transaction.SaveNewModuleIAtom;
import com.kc.module.transaction.SaveScheduleIAtom;
import com.kc.module.transaction.SaveWorkLoadIAtom;
import com.kc.module.transaction.SetFitDateIAtom;
import com.kc.module.transaction.UpdateModuleInfo;
import com.kc.module.transaction.UploadExchangeFileIAtom;
import com.kc.module.upload.ModuleUploadFileHandling;
import com.kc.module.upload.UploadFileHandling;
import com.kc.module.utils.ControlUtils;
import com.kc.module.utils.ModelUtils;
import com.kc.module.utils.StringUtils;

/**
 * 模具管理控制器
 * 
 * @author xuwei
 * @date 2013-10-17
 * 
 */
@Before(AuthInterceptor.class)
public class ModuleManageController extends Controller {

    private Logger logger = Logger.getLogger(this.getClass());

    public void uploadBinaryPicture() {
        try {
            // 加载并接收图片文件
            UploadFile load = getFile();
            // 获取下载的文件
            File file = load.getFile();
            // 获取本系统的物理路径
            String path = getSession().getServletContext().getRealPath("/");
            // 获取原始的图片
            String oriUrl = getPara("imgUrl").trim();
            File oriFile = new File(path + oriUrl);

            if (oriFile.exists() && oriFile.isFile()) {
                oriFile.delete();
            }

            renderText("{success:true,errors:{},result:{url:\"" + file.getAbsolutePath().replace(path, "").replace("\\", "\\\\") + "\"}}");
        }
        catch (Exception e) {
            renderText("{success:false,errors:{err:'-1'},result:{}}");
        }
    }

    public void clearSelectImages() {
        try {
            // 获取本系统的物理路径
            String path = getSession().getServletContext().getRealPath("/");
            // 获取原始的图片
            String oriUrl = getPara("imgUrl").trim();
            File oriFile = new File(path + oriUrl);

            if (oriFile.exists() && oriFile.isFile()) {
                oriFile.delete();
            }

            Barcode.DEVICE_PROCESS_RESUME.nextVal();

            renderText("1");
        }
        catch (Exception e) {
            renderText("-1");
        }
    }

    /**
     * 根据系统中某个客户本月度的模具讯息回馈模具预计生成的模具工号树{id:'',text:'',leaf:true}, <br>
     * 用于KC客户模具工号的创建,
     * 
     * 
     */
    @Before(ModuleManageValidator.class)
    public void estimateModuleCode() {
        final Controller controller = this;

        boolean success = Db.tx(new IAtom() {
            public boolean run() throws SQLException {

                ModuleCode mc = getModel(ModuleCode.class, "mc");

                // 查询某客户本月模具的套数
                int maxno = ModuleList.dao.getGuestModuleMaxOfMonth(mc.getGuestId(), mc.getStyle(), mc.getModuleYear(), mc.getModuleMonth());

                // 获取某客户本月最大模具套数,如果为空,则模具套数为0
                List<Record> list = new ArrayList<Record>();
                Record record;
                StringBuilder moldno = new StringBuilder();

                String posid = ControlUtils.getFactoryPosid(controller);
                String creator = ControlUtils.getAccountWorkNumber(controller);
                String creatorname = ControlUtils.getAccountName(controller);

                for (int x = maxno + 1; x <= maxno + mc.getNum(); x++) {

                    String monthNo = StringUtils.leftPad(x + "", 2, "0");
                    moldno.append(mc.getStyle()).append(mc.getModuleYear()).append(mc.getModuleMonth());
                    moldno.append(mc.getGuest()).append(monthNo);
                    record = new Record();

                    record.set("posid", posid).set("modulecode", moldno.toString());
                    record.set("guestname", mc.getGuestName()).set("guestid", mc.getGuestId());
                    record.set("createyear", mc.getModuleYear()).set("createmonth", mc.getModuleMonth());
                    record.set("creator", creator).set("takeon", creator);
                    record.set("takeonname", creatorname).set("creatorname", creatorname);
                    record.set("modulestate", "0").set("monthno", monthNo);
                    record.set("modulestyle", mc.getStyle());
                    record.set("modulebarcode", Barcode.MODULE.nextVal());
                    record.set("issave", false);
                    moldno.delete(0, moldno.length());

                    list.add(record);
                }

                setAttr("modules", list);

                return true;
            }
        });
        setAttr("success", success);
        setAttr("msg", getAttr("success") ? "生成工号成功!" : "生成工号失败!请再操作一次!");
        renderJson(new String[]{"success", "modules", "msg"});

    }

    /**
     * 根据系统中某个客户本月度的模具讯息回馈模具预计生成的模具工号树{id:'',text:'',leaf:true}, <br>
     * 用于Coxon客户模具工号的创建,
     * 
     * 
     */
    @ClearInterceptor
    public void generateModuleCode() {
        // CreateModuleIAtom cmi = new CreateModuleIAtom();
        // cmi.setController(this);
        // cmi.setTopCount(30);
        //
        // boolean success = Db.tx(cmi);
        //
        // setAttr("success", success);
        // setAttr("msg", cmi.getMsg());
        // setAttr("module", cmi.getModuleRecord());
        //
        // renderJson();

        CreateModuleIAtom cmi = new CreateModuleIAtom();
        cmi.setController(this);
        cmi.setTopCount(30);

        boolean success = Db.tx(cmi);

        setAttr("success", success);
        setAttr("backstr", cmi.getBackStr());
        setAttr("flag", cmi.getRst());
        setAttr("modules", cmi.getRlist());

        renderJson(new String[]{"success", "modules", "flag", "backstr"});
    }

    /**
     * 将新增模具讯息保存至服务器
     */
    @Before(ModuleManageValidator.class)
    public void saveNewModuleData() {
        SaveNewModuleIAtom snmi = new SaveNewModuleIAtom();
        snmi.setController(this);
        boolean success = Db.tx(snmi);

        setAttr("success", success);
        setAttr("flag", snmi.getResult());
        renderJson(new String[]{"success", "flag"});

    }

    /**
     * 用于对外客户模具查询:KC 查询模具资料
     */
    public void queryModuleByCase() {

        Page<ModuleList> pageList = ModuleList.dao.pageFindModuleInfo(getPara("style"),
                                                                      getPara("guest"),
                                                                      getPara("year"),
                                                                      getPara("month"),
                                                                      getPara("batch"),
                                                                      getParaToInt("page"),
                                                                      getParaToInt("start"),
                                                                      getParaToInt("limit"));

        setAttr("success", pageList.getPageSize() > 0);
        setAttr("info", pageList.getList());
        setAttr("totalCount", pageList.getTotalRow());

        renderJson(new String[]{"success", "info", "totalCount"});
    }

    /**
     * 用于Coxon模具查询
     */
    @ClearInterceptor
    public void queryModuleByCondition() {
        renderJson(ModuleList.dao.getPagination(getPara("condition"), getParaToInt("page"), getParaToInt("limit")));
    }

    /**
     * 更新模具讯息
     */
    @Before(ModuleManageValidator.class)
    public void updateModuleIntroduce() {
        UpdateModuleInfo umi = new UpdateModuleInfo();
        umi.setController(this);

        boolean success = Db.tx(umi);
        setAttr("success", success);
        setAttr("msg", getAttr("success") ? "模具资料更新成功!" : "模具资料更新失败!请再操作一次!");
        renderJson(new String[]{"success", "msg"});
    }

    /**
     * 得到新模工号
     */
    @ClearInterceptor
    public void getNewModuleForPart() {

        List<ModuleList> list = ModuleList.dao.findModlueNewCode(ModuleState.MODULE_NEW.getIndex());

        setAttr("success", list.size() > 0);
        setAttr("msg", list.size() > 0 ? "" : "");
        setAttr("modules", list);

        renderJson(new String[]{"success", "msg", "modules"});

    }

    /**
     * 新模增加工件清单
     */
    @Before(ModuleManageValidator.class)
    public void createModuleNewParts() {

        boolean success = Db.tx(new IAtom() {
            public boolean run() throws SQLException {

                ObjectMapper mapper = new ObjectMapper();

                try {
                    return mapper.readValue(getPara("parts"), ModuleNewPartForm.class).save();
                }
                catch (Exception e) {

                    logger.error("前台提交json无法解析", e);
                    return false;
                }

            }
        });
        setAttr("success", success);
        setAttr("msg", getAttr("success") ? "工件清单保存成功!" : "工件清单保存失败!请再操作一次!");
        renderJson(new String[]{"success", "msg"});

        /**
         * 以下暂时不用这种查询方式 2014-3-31 设置控制器 AddPartsIAtom.iAtom.setController(this);
         * // 设置将要解析的参数名称数组 AddPartsIAtom.iAtom.setAjaxAttr(new
         * String[]{"modules", "parts"}); // 执行SqlTranscation boolean rs =
         * AddPartsIAtom.iAtom.runTx(AddPartsIAtom.iAtom); renderText(rs + "");
         */
    }

    /**
     * 从文件批量导入模具资料
     */
    @ClearInterceptor
    public void uploadModuleInfo() {
        try {
            UploadFile file = getFile("filePath", ControlUtils.getModuleRealPath(this));

            if (file.getFileName().lastIndexOf(".xls") < 0 && file.getFileName().lastIndexOf(".xlsx") < 0) {
                throw new RuntimeException("上传的文件不是excel文件");
            }

            List<Record> moduleList = null;

            if (file.getFileName().lastIndexOf(".xls") > 0) {
                moduleList = UploadFileHandling.moduleInfoXls(this, file.getFile());
            }

            if (file.getFileName().lastIndexOf(".xlsx") > 0) {

            }

            boolean success = moduleListProcess(moduleList);

            setAttr("success", success);

            if (success) {
                setAttr("msg", "文件导入成功!");
            }

            setAttr("module", success ? moduleList : "[]");
        }
        catch (Exception e) {
            logger.error("文件导入失败,请重新输入!", e);
            setAttr("success", false);
            setAttr("msg", "文件导入失败,请重新输入!");
        }
        finally {
            renderJson(new String[]{"success", "msg", "module"});
        }

    }

    /**
     * 模具资料处理
     * 
     * @param moduleList
     * @return
     */
    private boolean moduleListProcess(final List<Record> moduleList) {
        final Controller me = this;
        return Db.tx(new IAtom() {
            public boolean run() throws SQLException {

                boolean success = moduleList.size() > 0;
                ModuleList module;
                ModuleList exitsModule;
                ModuleResume mr;
                ModuleResumeRecord mrr;
                Timestamp now = new Timestamp(new Date().getTime());

                for (Record record : moduleList) {
                    module = ModelUtils.recordToModel(record, ModuleList.class);

                    exitsModule = ModuleList.dao.findModuleForModuleCode(module.get("MODULECODE"));

                    // 模具如果已经存在时,就对模具资料进行更新
                    if (exitsModule == null) {

                        mr = new ModuleResume();
                        mrr = new ModuleResumeRecord();
                        mr.set("ID", Barcode.MODULE_RESUME.nextVal());
                        mr.set("CURESTATE", "1");
                        mr.set("RESUMESTATE", ModuleState.MODULE_NEW.getIndex());
                        mr.set("RESUMEEMPID", ControlUtils.getAccountWorkNumber(me));
                        mr.set("STARTTIME", module.get("STARTTIME"));
                        mr.set("ENDTIME", module.get("INITTRYTIME"));
                        mr.set("REMARK", module.get("MODULEINTRO"));
                        mr.set("MODULEBARCODE", module.get("MODULEBARCODE"));

                        mrr.set("ID", mr.get("id"));
                        mrr.set("RESUMESTATE", ModuleState.MODULE_NEW.getIndex());
                        mrr.set("RESUMEEMPID", mr.get("RESUMEEMPID"));
                        mrr.set("STARTTIME", module.get("STARTTIME"));
                        mrr.set("ENDTIME", module.get("INITTRYTIME"));
                        mrr.set("REMARK", module.get("MODULEINTRO"));
                        mrr.set("MODULEBARCODE", module.get("MODULEBARCODE"));
                        mrr.set("resumetime", now);

                        success = module.save() && mr.save() && mrr.save();

                    } else {
                        module.set("MODULEBARCODE", exitsModule.get("MODULEBARCODE"));
                        success = module.update();
                    }

                    if (!success) {
                        setAttr("msg", "模具信息保存失败,请重新导入一次!");
                        return false;
                    }
                }

                return success;

            }
        });

    }

    /**
     * 上传模具零件 KC 模具零件
     */
    @ClearInterceptor
    public void uploadModulePart() {

        try {
            boolean success = true;
            UploadFile file = getFile("filePath", ControlUtils.getModuleRealPath(this));

            if (file.getFileName().lastIndexOf(".xls") < 0 && file.getFileName().lastIndexOf(".xlsx") < 0) {
                throw new RuntimeException("上传的文件不是excel文件");
            }

            // String moduleBarcodes = getPara("moduleBarcodes");

            List<Record> partList = null;

            if (file.getFileName().lastIndexOf(".xls") > 0) {
                partList = UploadFileHandling.modulePartXls(this, file.getFile());

            }

            if (file.getFileName().lastIndexOf(".xlsx") > 0) {

            }

            success = partListProcess(partList);

            setAttr("success", success);
            if (success) {
                setAttr("msg", "文件导入成功!");
            }
            setAttr("part", success ? partList : "[]");
        }
        catch (Exception e) {
            logger.error("文件导入失败,请重新输入!", e);
            setAttr("success", false);
            setAttr("msg", "文件导入失败,请重新输入!");
        }
        finally {
            renderJson(new String[]{"success", "msg", "part"});
        }

    }

    /**
     * 上传模具零件 Coxon模具零件
     */
    @ClearInterceptor
    public void uploadModulePartBom() {
        List<ParsePartListForm> plist = ModuleUploadFileHandling.parseExcelFile(getFile("filePath").getFile(), 6);

        setAttr("success", (ModuleUploadFileHandling.PARSE_STATE > 0));
        setAttr("list", plist);

        renderJson(new String[]{"success", "list"});
    }

    /**
     * 处理前中上传的模具零件,处理KC模具清单
     * 
     * @param partList
     * @return
     */
    private boolean partListProcess(final List<Record> partList) {

        final Controller me = this;
        return Db.tx(new IAtom() {
            public boolean run() throws SQLException {
                ModulePart mp;
                ModulePartList mpl;
                ModuleProcessInfo mpi;
                double count = 0;

                for (Record record : partList) {
                    mp = ModelUtils.recordToModel(record, ModulePart.class);

                    // 保存工件清单
                    if (mp.getInt("ISPROCESS") == 1) {
                        count = mp.getDouble("QUANTITY");

                        Barcode.MD_PROCESS_INFO.nextVal(true);
                        for (int i = 1; i <= count; i++) {
                            String t_barcode = Barcode.MD_PROCESS_INFO.nextVal();

                            mpl = new ModulePartList();
                            mpl.set("PARTBARLISTCODE", Barcode.MODULE_PART_LIST.nextVal());
                            mpl.set("MODULEBARCODE", mp.get("MODULEBARCODE"));
                            mpl.set("PARTBARCODE", mp.get("PARTBARCODE"));
                            mpl.set("PARTLISTCODE", mp.get("PARTCODE") + (count == 1 ? "" : "-" + i));
                            mpl.set("PARTROOTCODE", mp.get("PARTCODE"));
                            mpl.set("PARTLISTBATCH", count == 1 ? "" : "-" + i);
                            mpl.set("ISENABLE", "0");
                            // mp.set("MODULECODE",mp.get(""));
                            // mp.set("ISSCHEDULE" ,mp.get(""));

                            // 保存工件加工信息
                            mpi = new ModuleProcessInfo();
                            mpi.set("ID", t_barcode);
                            mpi.set("PARTBARLISTCODE", mpl.get("PARTBARLISTCODE"));
                            mpi.set("MODULERESUMEID", record.get("MODULERESUMEID"));
                            mpi.set("REMARK", record.get("REMARK"));

                            if (!(mpl.save() && mpi.save())) {
                                me.setAttr("msg", "保存零件清单失败，请重新导入！");
                                return false;
                            }
                        }
                    }

                    if (!mp.getStr("PARTCODE").equals("1")) {

                        // 表示为模板，将名称中的模板代码找出
                        if (mp.getStr("PARTCODE").equals("")) {

                            mp.set("PARTCODE", mp.getStr("CNAMES").substring(1, 4));
                        }

                        // TODO 本厂不一样
                        // 工件编号长度大于2时为工件要加工1,否则为不加工
                        // mp.set("ISPROCESS", mp.getStr("PARTCODE").length() >
                        // 2 ? 1 : 0);

                        if (!mp.save()) {
                            me.setAttr("msg", "保存零件清单失败，请重新导入！");
                            return false;
                        }
                    }

                }

                return partList.size() > 0;
            }
        });
    }

    public void getPartsOfModule() {
        // SQL查询语句
        StringBuilder builder = new StringBuilder();
        builder.append("SELECT a.RACEID,b.PARTLISTCODE, d.CHINANAME, a.PARTCODE, a.CNAMES, a.NORMS");
        builder.append(",b.PARTLISTBATCH, a.MATERIAL, a.QUANTITY, a.ISFIRMWARE");
        builder.append(" FROM md_part a");
        builder.append(" LEFT JOIN (");
        builder.append(" SELECT *");
        builder.append(" FROM md_part_list");
        builder.append(" WHERE isenable = '0'");
        builder.append(") b ON a.partbarcode = b.partbarcode");
        builder.append(" LEFT JOIN modulelist c ON a.modulebarcode = c.modulebarcode");
        builder.append(" LEFT JOIN partrace d ON a.raceid = d.classcode");
        builder.append(" WHERE c.modulestate = '0'");
        builder.append(" AND a.modulebarcode = '");
        builder.append(getPara("para"));
        builder.append("' AND c.operateflag = '1'");
        builder.append(" ORDER BY a.PARTCODE,b.PARTLISTCODE");

        List<Record> record = Db.find(builder.toString());
        StringBuilder json = new StringBuilder();
        if (record == null || record.size() == 0) {
            json.append("{parts:[],scount:0}");
        } else {
            String tempRace = "", tempGroup = "";
            boolean raceFirst = true, isStandard = false;
            int gCount = 0, sCount = 0;
            json.append("{parts:[");
            for (Record r : record) {
                String raceId = r.getStr("RACEID");
                String raceName = r.getStr("CHINANAME");
                String partCode = r.getStr("PARTCODE");
                String partListCode = r.getStr("PARTLISTCODE");
                String suffix = r.getStr("PARTLISTBATCH");
                String cNames = r.getStr("CNAMES");
                String norms = r.getStr("NORMS");
                String material = r.getStr("MATERIAL");
                Number quantity = r.getNumber("QUANTITY");
                String isFirmWare = (r.getStr("ISFIRMWARE").equals("1") ? "false" : "true");
                if (tempRace.equals(raceId)) {
                    if (raceId.equals("9")) {
                        json.append("{\"id\":\"").append(partListCode).append("\",");
                        json.append("\"text\":\"").append(cNames).append("\",");
                        json.append("\"source\":\"").append(material).append("\",");

                        json.append("\"isfit\":").append(isFirmWare).append(",");
                        json.append("\"bodytxt\":\"").append("").append("\",");
                        json.append("\"suffix\":\"").append("").append("\",");

                        json.append("\"norms\":\"").append(norms).append("\",");
                        json.append("\"count\":").append(quantity.intValue()).append(",");
                        json.append("\"type\":\"").append(raceId).append("\",leaf:true},");

                        sCount++;
                    } else {
                        if (tempGroup.equals(partCode)) {
                            json.append("{\"id\":\"").append(partListCode).append("\",");
                            json.append("\"text\":\"").append(cNames).append("\",");
                            json.append("\"source\":\"").append(material).append("\",");

                            json.append("\"isfit\":").append(isFirmWare).append(",");
                            json.append("\"bodytxt\":\"").append(partCode).append("\",");
                            json.append("\"suffix\":\"").append(suffix).append("\",");

                            json.append("\"norms\":\"").append(norms).append("\",");
                            json.append("\"count\":").append("\"\"").append(",");
                            json.append("\"type\":\"").append(raceId).append("\",leaf:true},");

                            gCount++;
                        } else {
                            // 将之前的其他种类的工件的JSON补充完整
                            json = new StringBuilder(json.substring(0, json.length() - 1) + "],\"count\":");
                            json.append(gCount + "},");

                            // 将同一工件的数量的变量清空
                            gCount = 0;

                            json.append("{\"id\":\"").append(partCode).append("\",");
                            json.append("\"text\":\"").append(cNames).append("\",");
                            json.append("\"source\":\"").append(material).append("\",");

                            json.append("\"isfit\":").append(isFirmWare).append(",");
                            json.append("\"bodytxt\":\"").append("").append("\",");
                            json.append("\"suffix\":\"").append("").append("\",");

                            json.append("\"norms\":\"").append(norms).append("\",");
                            json.append("\"type\":\"").append(raceId).append("\",");

                            json.append("children:[");
                            json.append("{\"id\":\"").append(partListCode).append("\",");
                            json.append("\"text\":\"").append(cNames).append("\",");
                            json.append("\"source\":\"").append(material).append("\",");

                            json.append("\"isfit\":").append(isFirmWare).append(",");
                            json.append("\"bodytxt\":\"").append(partCode).append("\",");
                            json.append("\"suffix\":\"").append(suffix).append("\",");

                            json.append("\"norms\":\"").append(norms).append("\",");
                            json.append("\"count\":").append("\"\"").append(",");
                            json.append("\"type\":\"").append(raceId).append("\",leaf:true},");

                            gCount++;

                            // 将是否为标准工件的旗标清空
                            isStandard = false;
                            tempRace = raceId;
                            tempGroup = partCode;
                        }
                    }
                } else {
                    if (raceId.equals("9")) {
                        if (raceFirst) {
                            json.append("{\"id\":\"").append(raceId).append("\",");
                            json.append("\"text\":\"").append(raceName).append("\",");
                            json.append("children:[");
                            json.append("{\"id\":\"").append(partListCode).append("\",");
                            json.append("\"text\":\"").append(cNames).append("\",");
                            json.append("\"source\":\"").append(material).append("\",");

                            json.append("\"isfit\":").append(isFirmWare).append(",");
                            json.append("\"bodytxt\":\"").append("").append("\",");
                            json.append("\"suffix\":\"").append("").append("\",");

                            json.append("\"norms\":\"").append(norms).append("\",");
                            json.append("\"count\":").append(quantity.intValue()).append(",");
                            json.append("\"type\":\"").append(raceId).append("\",leaf:true},");

                            isStandard = true;
                            tempRace = raceId;
                            sCount++;
                            tempGroup = "";
                            raceFirst = false;
                        } else {
                            // 将之前的其他种类的工件的JSON补充完整
                            json = new StringBuilder(json.substring(0, json.length() - 1) + "],\"count\":");
                            json.append(gCount + "}]},");

                            // 将同一工件的数量的变量清空
                            gCount = 0;

                            json.append("{\"id\":\"").append(raceId).append("\",");
                            json.append("\"text\":\"").append(raceName).append("\",");

                            json.append("children:[");
                            json.append("{\"id\":\"").append(raceId + StringUtils.leftPad(sCount + "", 2, "0")).append("\",");
                            json.append("\"text\":\"").append(cNames).append("\",");
                            json.append("\"source\":\"").append(material).append("\",");

                            json.append("\"isfit\":").append(isFirmWare).append(",");
                            json.append("\"bodytxt\":\"").append(partCode).append("\",");
                            json.append("\"suffix\":\"").append(suffix).append("\",");

                            json.append("\"norms\":\"").append(norms).append("\",");
                            json.append("\"count\":").append(quantity.intValue()).append(",");
                            json.append("\"type\":\"").append(raceId).append("\",leaf:true},");

                            sCount++;

                            // 将是否为标准工件的旗标清空
                            isStandard = true;
                            tempRace = raceId;
                            tempGroup = "";
                            raceFirst = false;
                        }
                    } else {
                        if (raceFirst) {
                            json.append("{\"id\":\"").append(raceId).append("\",");
                            json.append("\"text\":\"").append(raceName).append("\",");
                            json.append("children:[");
                            json.append("{\"id\":\"").append(partCode).append("\",");
                            json.append("\"text\":\"").append(cNames).append("\",");
                            json.append("\"source\":\"").append(material).append("\",");

                            json.append("\"isfit\":").append(isFirmWare).append(",");
                            json.append("\"bodytxt\":\"").append("").append("\",");
                            json.append("\"suffix\":\"").append("").append("\",");

                            json.append("\"norms\":\"").append(norms).append("\",");
                            // json.append("\"count\":").append("").append(",");
                            json.append("\"type\":\"").append(raceId).append("\",");

                            json.append("children:[");
                            json.append("{\"id\":\"").append(partListCode).append("\",");
                            json.append("\"text\":\"").append(cNames).append("\",");
                            json.append("\"source\":\"").append(material).append("\",");

                            json.append("\"isfit\":").append(isFirmWare).append(",");
                            json.append("\"bodytxt\":\"").append(partCode).append("\",");
                            json.append("\"suffix\":\"").append(suffix).append("\",");

                            json.append("\"norms\":\"").append(norms).append("\",");
                            json.append("\"count\":").append("\"\"").append(",");
                            json.append("\"type\":\"").append(raceId).append("\",leaf:true},");

                            gCount++;
                            tempRace = raceId;
                            tempGroup = partCode;
                            raceFirst = false;
                            isStandard = false;
                        } else {
                            if (isStandard) {
                                json = new StringBuilder(json.substring(0, json.length() - 1) + "]}]},");
                            } else {
                                json = new StringBuilder(json.substring(0, json.length() - 1) + "],\"count\":");
                                json.append(gCount + "}]},");
                            }

                            gCount = 0;

                            json.append("{\"id\":\"").append(raceId).append("\",");
                            json.append("\"text\":\"").append(raceName).append("\",");
                            json.append("children:[");
                            json.append("{\"id\":\"").append(partCode).append("\",");
                            json.append("\"text\":\"").append(cNames).append("\",");
                            json.append("\"source\":\"").append(material).append("\",");

                            json.append("\"isfit\":").append(isFirmWare).append(",");
                            json.append("\"bodytxt\":\"").append("").append("\",");
                            json.append("\"suffix\":\"").append("").append("\",");

                            json.append("\"norms\":\"").append(norms).append("\",");
                            // json.append("\"count\":").append("").append(",");
                            json.append("\"type\":\"").append(raceId).append("\",");

                            json.append("children:[");
                            json.append("{\"id\":\"").append(partListCode).append("\",");
                            json.append("\"text\":\"").append(cNames).append("\",");
                            json.append("\"source\":\"").append(material).append("\",");

                            json.append("\"isfit\":").append(isFirmWare).append(",");
                            json.append("\"bodytxt\":\"").append(partCode).append("\",");
                            json.append("\"suffix\":\"").append(suffix).append("\",");

                            json.append("\"norms\":\"").append(norms).append("\",");
                            json.append("\"count\":").append("\"\"").append(",");
                            json.append("\"type\":\"").append(raceId).append("\",leaf:true},");

                            gCount++;
                            tempGroup = partCode;
                            tempRace = raceId;
                            raceFirst = false;
                            isStandard = false;
                        }
                    }
                }
            }

            if (isStandard) {
                json = new StringBuilder(json.substring(0, json.length() - 1) + "]}],\"scount\":" + sCount + "}");
            } else {
                json = new StringBuilder(json.substring(0, json.length() - 1) + "],\"count\":");
                json.append(gCount + "}]}],\"scount\":");
                json.append(sCount + "}");
            }
        }

        renderText(json.toString());
    }

    public void getPartsForSchedule() {
        String modulebarcode = getPara("para");
        String json = null;
        if (modulebarcode == null || modulebarcode.trim().equals("")) {
            json = "[]";
        } else {
            StringBuilder builder = new StringBuilder();
            builder.append("select a.PARTBARLISTCODE,a.PARTLISTCODE,b.CNAMES,c.CHINANAME from");
            builder.append(" md_part_list a left join md_part b on a.PARTBARCODE = b.PARTBARCODE");
            builder.append(" left join partrace c on b.raceid = c.classcode where a.modulebarcode = '");
            builder.append(getPara("para"));
            builder.append("' and a.ISENABLE = '0' and a.ISSCHEDULE = '0'");
            builder.append(" order by b.RACEID,a.PARTBARCODE,a.PARTBARLISTCODE");
            List<Record> list = Db.find(builder.toString());
            json = JsonKit.toJson(list);
        }

        renderText(json);
    }

    /**
     * 保存模具工件排程
     */
    public void setModuleEstimateSchedule() {
        // 设置控制器
        SaveScheduleIAtom.iAtom.setController(this);
        // 设置将要解析的参数名称数组
        SaveScheduleIAtom.iAtom.setAjaxAttr(new String[]{"part", "sch"});
        // 执行SqlTranscation
        boolean rs = SaveScheduleIAtom.iAtom.runTx(SaveScheduleIAtom.iAtom);
        renderText("{\"result\":" + rs + ",\"flag\":" + SaveScheduleIAtom.SQL_RESULT + "}");
    }

    public void saveDeviceClassfic() {
        SaveDeviceClassficIAtom.iAtom.setController(this);
        SaveDeviceClassficIAtom.iAtom.setAjaxAttr(new String[]{"classfic"});
        boolean rs = SaveDeviceClassficIAtom.iAtom.runTx(SaveDeviceClassficIAtom.iAtom);
        renderText("{\"result\":" + rs + ",\"flag\":" + SaveDeviceClassficIAtom.SQL_RESULT + "}");
    }

    /**
     * 得到部门信息
     */
    public void getRegionPartForAddition() {
        // List<Record> record =
        // Db.find("SELECT ID DEPTID,NAME DEPTNAME FROM REGION_DEPART WHERE SUBSTRC(ID,3) LIKE '01%' ORDER BY ID");
        // renderText("{\"classfic\":" + JsonKit.toJson(record) + "}");

        String stepId = ControlUtils.getStepId(this);
        List<Record> list = null;
        int len = stepId.length();

        switch (len) {
        case 2: {
            list = RegionDepartment.dao.findDeptForFactory(stepId);
            break;
        }
        case 4: {
            list = RegionDepartment.dao.findRegionForDept(stepId);
            break;
        }
        case 6: {
            list = RegionDepartment.dao.findDeptForStepId(stepId);
            break;
        }
        }
        renderJson(list);

    }

    /**
     * 查询指定部门的机台
     */
    public void queryDevicesByPart() {
        renderJson(DeviceDepart.dao.findDeptMachine(getPara("partid")));
    }

    public void getDeviceFacotry() {
        renderJson("devices", Factory.dao.getRegion(getPara("type")));
    }

    /**
     * 查询所有的厂区机台讯息
     */
    public void getAllFactoryDevice() {
        renderJson(DeviceDepart.dao.mergeAllDeviceByFactroryJson(getPara("factoryId")));
    }

    /**
     * 新增或者更新设备讯息
     */
    public void updateDevices() {
        AddDevicesIAtom.iAtom.setController(this);
        AddDevicesIAtom.iAtom.setAjaxAttr(new String[]{"useType", "data"});
        boolean rs = AddDevicesIAtom.iAtom.runTx(AddDevicesIAtom.iAtom);

        setAttr("success", rs);
        setAttr("error", AddDevicesIAtom.iAtom.getError());

        renderJson();
    }

    public void delDevices() {
        DeleteDevicesIAtom.iAtom.setController(this);
        DeleteDevicesIAtom.iAtom.setAjaxAttr(new String[]{"macbarcode"});
        boolean rs = DeleteDevicesIAtom.iAtom.runTx(DeleteDevicesIAtom.iAtom);
        renderText("{\"success\":" + rs + ",\"flag\":" + DeleteDevicesIAtom.SQL_RS + "}");
    }

    public void addDeviceType() {
        renderJson("result", DeviceType.dao.addDeviceType("01", getPara("type"), getPara("name")));
    }

    public void getPackageRegionDeparment() {
        renderText(SharedMethods.packageRegionDepartment(RegionDepartment.dao.getRegionDepartment(null, 0), 2));
    }

    public void addRegionPartment() {
        renderJson("result", RegionDepartment.dao.addRegionDepartment(getPara("stepid"), getPara("deptname")));
    }

    public void getPackageCrafts() {
        renderText(SharedMethods.packageCrafts(Craft.dao.getStyleCrafts(null), 2));
    }

    public void addCrafts() {
        renderJson("result", Craft.dao.addCrafts(getPara("mainid"), getPara("code"), getPara("name"), getPara("price"), getParaToInt("typeid")));
    }

    public void getModulePartInformation() {
        renderJson(ModulePartList.dao.getModulePartInformation(getPara("modulebarcode")));
    }

    public void getModuleWorkPieces() {
        AddModulePartIAtom api = new AddModulePartIAtom();
        api.setController(this);
        Db.tx(api);
        renderJson(api.getPartForm());
    }

    public void modifyModuleInformation() {

        Db.tx(new IAtom() {
            public boolean run() throws SQLException {

                setAttr("msg", "修模/设变资料保存成功");
                setAttr("success", true);
                return true;
            }
        });

        renderJson();

    }

    public void saveExcelPartInfo() {

        SaveExcelPartInfo info = new SaveExcelPartInfo();
        info.setController(this);
        boolean rst = Db.tx(info);
        setAttr("result", info.getError());
        setAttr("success", rst);
        setAttr("list", info.getModuleUsed());

        renderJson();
    }

    /**
     * 獲取待完工模具的工件訊息
     */
    public void getFinishModulePartInfo() {
        renderJson(ModuleProcessInfo.dao.getFinishPartInfo(getPara("resumeid"), getParaToBoolean("chk")));
    }

    public void proceedModuleFinish() {
        ProceedModuleFinishIAtom pmfi = new ProceedModuleFinishIAtom();
        pmfi.setController(this);

        boolean success = Db.tx(pmfi);

        setAttr("success", success);
        setAttr("msg", pmfi.getMsg());

        renderJson();

    }

    /**
     * 用于修改单个或者合并工件的数量
     */
    public void onModifyPartCount() {
        ModifyPartCountIAtom mpci = new ModifyPartCountIAtom();
        mpci.setController(this);

        boolean success = Db.tx(mpci);

        setAttr("success", success);
        setAttr("result", mpci.getFlag());

        renderJson(new String[]{"success", "result"});
    }

    /**
     * 控制模具的加工状态
     */
    public void alertControlModuleState() {
        renderJson(ModuleResume.dao.alertModuleState(getPara("resumeid")));
    }

    /**
     * 处理模具加工完成
     */
    public void processModuleHandle() {
        ProcessModuleHandleIAtom pmi = new ProcessModuleHandleIAtom();
        pmi.setController(this);

        boolean success = Db.tx(pmi);

        setAttr("success", success);
        setAttr("msg", pmi.getMsg());

        renderJson();
    }

    /**
     * 设置紧急加工标记
     */
    public void setModuleUrgent() {
        renderJson("success", ModuleResume.dao.setModuleProcessedUrgent(getPara("urgent")));
    }

    /**
     * ====设置组立完成的时间====
     */
    public void setOrClearFitDate() {
        SetFitDateIAtom sfdi = new SetFitDateIAtom();
        sfdi.setController(this);
        boolean success = Db.tx(sfdi);

        setAttr("success", success);
        setAttr("msg", sfdi.getMsg());

        renderJson();
    }

    /**
     * 设置机台预计负荷
     */
    public void saveStandardWorkLoad() {
        SaveWorkLoadIAtom swli = new SaveWorkLoadIAtom();
        swli.setController(this);

        boolean success = Db.tx(swli);
        setAttr("success", success);
        setAttr("msg", swli.getError());

        renderJson();
    }

    public void processPartFinish() {
        ProcessPartFinishIAtom ppfi = new ProcessPartFinishIAtom();
        ppfi.setController(this);

        boolean success = Db.tx(ppfi);

        renderJson("success", success);
    }

    // 移除模具履历
    public void deleteModuleResume() {
        ModuleResumeRemoveIAtom mrri = new ModuleResumeRemoveIAtom();
        mrri.setController(this);

        boolean success = Db.tx(mrri);

        setAttr("success", success);
        setAttr("msg", mrri.getMsg());

        renderJson();
    }

    public void updateModuleInfo() {
        AlertModuleInfoIAtom amii = new AlertModuleInfoIAtom();
        amii.setController(this);
        boolean success = Db.tx(amii);

        setAttr("success", success);
        setAttr("msg", amii.getMsg());

        renderJson();

    }

    /**
     * 报废模具资料
     */
    public void ruinModuleInfo() {
        RuinModuleIAtom rmi = new RuinModuleIAtom();
        rmi.setController(this);
        rmi.setDisabledFlag("1");

        boolean success = Db.tx(rmi);

        setAttr("success", success);
        setAttr("msg", rmi.getMsg());

        renderJson();
    }

    /**
     * 删除模具资料
     */
    public void deleteModuleInfo() {
        RemoveModuleIAtom rmi = new RemoveModuleIAtom();
        rmi.setController(this);

        boolean success = Db.tx(rmi);

        setAttr("success", success);
        setAttr("msg", rmi.getMsg());

        renderJson();
    }
    
    /**
     * 导入模具信息
     */
    public void uploadExchangeModuleInfo() {
        UploadExchangeFileIAtom uefi = new UploadExchangeFileIAtom();
        uefi.setFilter(new String[]{".xls", ".xlsx"});
        uefi.setController(this);

        boolean result = Db.tx(uefi);

        setAttr("success", result);
        setAttr("msg", uefi.getMsg());

        renderJson();
    }
}
