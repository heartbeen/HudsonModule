package com.kc.module.transaction;

import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.IAtom;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.base.Barcode;
import com.kc.module.model.ModuleList;
import com.kc.module.model.ModuleResume;
import com.kc.module.model.ModuleResumeRecord;
import com.kc.module.model.ModuleResumeSection;
import com.kc.module.model.form.BasePartListForm;
import com.kc.module.model.form.ParsePartListForm;
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.ControlUtils;
import com.kc.module.utils.DBUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.JsonUtils;
import com.kc.module.utils.StringUtils;

public class SaveExcelPartInfo implements IAtom {
    public Controller getController() {
        return controller;
    }

    public void setController(Controller controller) {
        this.controller = controller;
    }

    public int getResult() {
        return result;
    }

    public void setResult(int result) {
        this.result = result;
    }

    public List<String> getModuleUsed() {
        if (this.moduleUsed == null) {
            this.moduleUsed = new ArrayList<String>();
        }
        return moduleUsed;
    }

    public void setModuleUsed(List<String> moduleUsed) {
        this.moduleUsed = moduleUsed;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public Controller controller;
    public int result;
    public List<String> moduleUsed;
    private String error;

    @Override
    public boolean run() throws SQLException {
        try {
            // 判断是否导入的是零件
            boolean ispart = this.getController().getParaToBoolean("ispart");
            // 获取前台的零件JSON串
            String partInfo = this.controller.getPara("partInfo");
            // 如果工件获取的讯息为空,则返回
            if (StringUtils.isEmpty(partInfo)) {
                this.setError("零件资料不能为空!");
                return (false);
            }

            // 将工件字符串数组解析为类
            ParsePartListForm[] partlist = JsonUtils.josnToBean(partInfo, ParsePartListForm[].class);

            // 将工件清单从工件号中解析出来
            Map<String, ParsePartListForm> m_part = new LinkedHashMap<String, ParsePartListForm>();

            for (ParsePartListForm form : partlist) {
                String partcode = form.getPartcode();
                String partcount = form.getPartcount();
                String remark = form.getRemark();

                boolean isbatch = form.getIsmerge();

                if (!m_part.containsKey(partcode)) {
                    form.setPlist(parsePartCodeList(partcode, partcount, remark, isbatch));
                    m_part.put(partcode, form);
                }
            }

            // 声明用于存放所有待录入零件的模具讯息的变量
            Map<String, ModulePartContent> mlist = new HashMap<String, ModulePartContent>();

            // 获取模具讯息
            if (!ispart) {
                String moduleInfo = this.controller.getPara("moduleInfo");
                // 如果模具获取的讯息为空,则返回
                if (StringUtils.isEmpty(moduleInfo)) {
                    this.setError("模具讯息不完整!");
                    return (false);
                }

                String[] modulelist = JsonUtils.parseJsArray(moduleInfo);
                // 获取所有模具的相关讯息
                StringBuilder builder = new StringBuilder();

                builder.append("SELECT A.MODULEBARCODE, B.ID AS RSMID, B.RESUMESTATE, C.PARTBARCODE, C.PARTCODE ");
                builder.append(", C.QUANTITY, D.PARTBARLISTCODE, D.PARTLISTCODE, (SELECT MAX(ID) FROM MD_RESUME_SECTION ");
                builder.append("WHERE RESUMEID = B.ID ) AS SECID FROM MODULELIST A LEFT JOIN MD_RESUME B ON ");
                builder.append("A.MODULEBARCODE = B.MODULEBARCODE LEFT JOIN MD_PART C ON A.MODULEBARCODE = C.MODULEBARCODE ");
                builder.append("LEFT JOIN (SELECT * FROM MD_PART_LIST WHERE ISENABLE = 0 ) D ON C.PARTBARCODE = D.PARTBARCODE ");
                builder.append("WHERE A.MODULESTATE = 0 AND A.MODULEBARCODE IN ");
                builder.append(DBUtils.sqlIn(modulelist));

                // 如果查询出来的模具工件讯息为空,则表示模具资料还未建立完整,返回FALSE
                List<Record> modulePartList = Db.find(builder.toString());

                for (Record r : modulePartList) {
                    // 获取模具唯一号
                    String m_moldid = r.getStr("MODULEBARCODE");
                    // 获取部件唯一号
                    String m_partbarcode = r.getStr("PARTBARCODE");
                    // 获取模具加工履历号
                    String m_reusmeid = r.getStr("RSMID");
                    // 获取模具履历分支加工号
                    String m_secid = r.getStr("SECID");
                    // 获取部件号
                    String m_partcode = r.getStr("PARTCODE");

                    Number m_partcount = r.getNumber("QUANTITY");

                    ModulePartContent mpc = null;

                    if (mlist.containsKey(m_moldid)) {
                        mpc = mlist.get(m_moldid);
                    } else {
                        mpc = new ModulePartContent();
                        if (!StringUtils.isEmpty(m_reusmeid)) {
                            // 将加工状态设置为加工中
                            mpc.setProcess(true);
                            // 设置模具加工履历
                            mpc.setResumeid(m_reusmeid);
                            // 获取最新的模具加工履历分支
                            mpc.setSecid(m_secid);
                        }

                        // 先将要新增的零件加入到系统中
                        mpc.setMap(m_part);
                        // 将模具资料加入模具集合中
                        mlist.put(m_moldid, mpc);
                    }

                    // 如果零件编号为空
                    if (!StringUtils.isEmpty(m_partcode)) {
                        // 如果查询出来的零件清单中与要导入的零件号重复,则将这个零件从导入集合中删除
                        if (mpc.getMap().containsKey(m_partcode)) {
                            ParsePartListForm m_pplf = mpc.getMap().get(m_partcode);
                            // 如果部件个数为空或者为0,则将其数量补充为后来导入时的数量
                            if (m_partcount == null || m_partcount.intValue() == 0) {
                                m_pplf.setPartbarcode(m_partbarcode);
                            } else {
                                mpc.getMap().remove(m_partcode);
                            }
                        }
                    }
                }
            } else {
                // TODO 获取零件加工讯息
                String guestid = this.getController().getPara("guestid");
                String moduleguest = this.getController().getPara("moduleguest");
                String moduleinner = this.getController().getPara("moduleinner");
                String moduletype = this.getController().getPara("moduletype");
                String moduleclass = this.getController().getPara("moduleclass");
                String modulestate = this.getController().getPara("modulestate");
                String productname = this.getController().getPara("productname");

                Date modulestart = this.getController().getParaToDate("modulestart");
                Date moduleend = this.getController().getParaToDate("moduleend");

                // 如果客户编号不为空,将客户编号设置为字母大写
                moduleguest = (StringUtils.isEmpty(moduleguest) ? moduleguest : moduleguest.toUpperCase());

                // 将当天的开始日期转化为结束日期
                moduleend = getCurrentDayEnd(moduleend);
                // 保存资料结果
                boolean result = false;

                // 客户编号
                if (StringUtils.isEmpty(guestid)) {
                    this.setError("请选择有效的客户代号!");
                    return false;
                }

                if (StringUtils.isEmpty(moduleguest) && StringUtils.isEmpty(moduleinner)) {
                    this.setError("客户番号和社内编号不能同时为空!");
                    return false;
                }

                // 零件、治具、量产模具的编号规则遵循[M]KC1510A01
                String moduleunique = (StringUtils.isEmpty(moduleinner) ? moduleguest : moduleinner.toUpperCase()) + "[" + moduletype + "]";
                // 查询该客户零件番号是否存在
                ModuleList ml = ModuleList.dao.findModuleByColumn("MODULECODE", moduleunique, false);

                // 模具唯一号
                String modulebarcode = Barcode.MODULE.nextVal();
                // 加工履历ID
                String resumeid = Barcode.MODULE_RESUME.nextVal();
                // 加工履历分支ID号
                String modulesecid = Barcode.MD_RESUME_SECTION.nextVal();

                String deptid = ControlUtils.getFactoryPosid(this.controller);
                String empid = ControlUtils.getEmpBarCode(this.controller);

                Timestamp createtime = DateUtils.getNowStampTime();
                Timestamp starttime = DateUtils.parseTimeStamp(modulestart);
                Timestamp endtime = DateUtils.parseTimeStamp(moduleend);

                // 如果查询的零件加工讯息为空,则新增零件加工客户番号
                if (ml == null) {
                    // 保存模具资料至模具表
                    ModuleList modulelist = new ModuleList();
                    modulelist.set("POSID", deptid)
                              .set("MODULECODE", moduleunique)
                              .set("MODULECLASS", moduleclass)
                              .set("PRODUCTNAME", productname)
                              .set("GUESTID", guestid)
                              .set("INITTRYTIME", endtime)
                              .set("CREATOR", empid)
                              .set("MODULESTATE", 0)
                              .set("CREATETIME", createtime)
                              .set("GUESTCODE", moduleguest)
                              .set("OPERATEFLAG", "2")
                              .set("MODULEBARCODE", modulebarcode);

                    result = modulelist.save();
                    if (!result) {
                        this.setError("保存零件加工讯息失败!");
                        return false;
                    }

                    // 保存履历至ModuleResume表
                    ModuleResume moduleresume = new ModuleResume();
                    moduleresume.set("ID", resumeid)
                                .set("CURESTATE", "1")
                                .set("RESUMESTATE", modulestate)
                                .set("STARTTIME", starttime)
                                .set("ENDTIME", endtime)
                                .set("MODULEBARCODE", modulebarcode);

                    result = moduleresume.save();
                    if (!result) {
                        this.setError("保存零件加工讯息失败!");
                        return false;
                    }

                    // 保存履历记录至ModuleResumeRecord表
                    ModuleResumeRecord mrr = new ModuleResumeRecord();
                    mrr.set("ID", resumeid)
                       .set("RESUMESTATE", modulestate)
                       .set("RESUMETIME", createtime)
                       .set("STARTTIME", starttime)
                       .set("ENDTIME", endtime)
                       .set("MODULEBARCODE", modulebarcode);

                    result = mrr.save();
                    if (!result) {
                        this.setError("保存零件加工讯息失败!");
                        return false;
                    }

                    // 创建模具加工履历分支号
                    ModuleResumeSection mrs = new ModuleResumeSection();
                    mrs.set("ID", modulesecid)
                       .set("RESUMEID", resumeid)
                       .set("STATEID", modulestate)
                       .set("STARTDATE", starttime)
                       .set("ENDDATE", endtime);

                    result = mrs.save();
                    if (!result) {
                        this.setError("保存零件加工讯息失败!");
                        return false;
                    }
                } else {
                    this.setError("该零件号已经存在了,请在导入零件处完善资料!");
                    return (false);
                }

                ModulePartContent mpc = new ModulePartContent();
                // 将加工状态设置为加工中
                mpc.setProcess(true);
                // 设置模具加工履历
                mpc.setResumeid(resumeid);
                // 设置模具履历分支号
                mpc.setSecid(modulesecid);

                mpc.setMap(m_part);
                // 获取最新的模具加工履历分支

                mlist.put(modulebarcode, mpc);
            }

            if (mlist.size() > 0) {
                // 将记录表的对数据库进行更新
                Barcode.MD_PROCESS_INFO.nextVal(true);

                Record record = null;
                boolean result = false;

                for (String key : mlist.keySet()) {
                    ModulePartContent element = mlist.get(key);
                    for (String pkey : element.getMap().keySet()) {
                        ParsePartListForm pplf = element.getMap().get(pkey);

                        record = new Record();
                        int pcount = ArithUtils.parseInt(pplf.getPartcount());
                        boolean insert = StringUtils.isEmpty(pplf.getPartbarcode());

                        String t_partbarcode = (insert ? Barcode.MODULE_PART.nextVal() : pplf.getPartbarcode());

                        if (insert) {
                            record.set("PARTBARCODE", t_partbarcode);
                            record.set("MODULEBARCODE", key);
                            record.set("PARTCODE", pplf.getPartcode());
                            record.set("CNAMES", pplf.getPartname());
                            record.set("NORMS", pplf.getNorms());
                            record.set("MATERIAL", pplf.getMaterial());
                            record.set("QUANTITY", pcount);
                            record.set("MEASURE", (pplf.getIsmeasure() ? "1" : "0"));
                            record.set("ISFIRMWARE", (pplf.isIsshop() ? "1" : "0"));

                            result = Db.save("MD_PART", "PARTBARCODE", record);
                            if (!result) {
                                this.setError("保存加工记录失败!");
                                return (false);
                            }
                        } else {
                            record.set("PARTBARCODE", t_partbarcode).set("QUANTITY", pcount);
                            result = Db.update("MD_PART", "PARTBARCODE", record);
                            if (!result) {
                                this.setError("保存加工记录失败!");
                                return (false);
                            }
                        }

                        for (BasePartListForm bplf : pplf.getPlist()) {
                            // 声明工件唯一ID号
                            String t_partlistbarcode = Barcode.MODULE_PART_LIST.nextVal();
                            int mmcount = ArithUtils.parseInt(pplf.getPartcount(), 1);
                            record = new Record();

                            record.set("PARTBARLISTCODE", t_partlistbarcode);
                            record.set("MODULEBARCODE", key);
                            record.set("PARTBARCODE", t_partbarcode);
                            record.set("PARTLISTCODE", bplf.getPartlistcode());
                            record.set("PARTROOTCODE", bplf.getPartcode());
                            record.set("PARTLISTBATCH", bplf.getSuffix());
                            record.set("ISENABLE", "0");
                            // 是否区分编号1为区分编号0为合并编号
                            record.set("ISDIVIED", bplf.isIsmerge() ? (mmcount > 1 ? 1 : 0) : 0);

                            record.set("ISFIXED", pplf.getFixed());
                            record.set("QUANTITY", bplf.getQuantity());
                            record.set("PICCODE", pplf.getPiccode());
                            record.set("HARDNESS", pplf.getHardness());
                            record.set("BUFFING", pplf.getBuffing());
                            record.set("MATERIALSRC", pplf.getMaterialsrc());
                            record.set("MATERIALTYPE", pplf.getMaterialtype());
                            record.set("TOLERANCE", pplf.getTolerance());
                            record.set("REFORM", pplf.getReform());

                            result = Db.save("MD_PART_LIST", "PARTBARLISTCODE", record);
                            if (!result) {
                                this.setError("保存加工零件讯息失败!");
                                return (false);
                            }

                            if (element.isProcess()) {
                                // 添加工件的记录至工件加工记录表(MD_PROCESS_INFO)
                                record = new Record();

                                record.set("ID", Barcode.MD_PROCESS_INFO.nextVal());
                                record.set("PARTBARLISTCODE", t_partlistbarcode);
                                record.set("MODULERESUMEID", element.getResumeid());
                                record.set("ACTIONTIME", DateUtils.parseTimeStamp(DateUtils.getDateNow()));
                                record.set("ISMAJOR", 1);
                                record.set("ISFIXED", pplf.getFixed());

                                result = Db.save("MD_PROCESS_INFO", record);
                                if (!result) {
                                    this.setError("保存加工零件讯息失败!");
                                    return (false);
                                }

                                // 如果模具加工履历分支不为空,则将记录增加到零件加工分支清单中去
                                if (!StringUtils.isEmpty(element.getSecid())) {
                                    record = new Record();
                                    record.set("ID", Barcode.MD_PART_SECTION.nextVal())
                                          .set("SECTIONID", element.getSecid())
                                          .set("PARTBARLISTCODE", t_partlistbarcode)
                                          .set("REMARK", bplf.getRemark());

                                    result = Db.save("MD_PART_SECTION", record);
                                    if (!result) {
                                        this.setError("保存加工零件讯息失败!");
                                        return (false);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            this.setError("添加零件成功!");
            return (true);
        }
        catch (Exception e) {
            this.setError("导入零件资料出现异常,请联系管理员!");
            return (false);
        }
    }

    /**
     * 解析工件部件成工件清单
     * 
     * @param partcode
     * @param pcount
     * @param isbatch
     * @return
     */
    private List<BasePartListForm> parsePartCodeList(String partcode, String pcount, String remark, boolean isbatch) {
        List<BasePartListForm> p_list = new ArrayList<BasePartListForm>();
        // 将工件数量解析为double型,如果结果为小数,则将其转化为整型
        double pst_count = ArithUtils.parseDouble(pcount, 0);
        int p_count = (int) pst_count;

        if (p_count < 1) {
            return p_list;
        }

        if (p_count == 1) {
            BasePartListForm unit = new BasePartListForm();
            unit.setPartcode(partcode);
            unit.setPartlistcode(partcode);
            unit.setRootcode(partcode);
            unit.setRemark(remark);
            unit.setIsmerge(isbatch);
            unit.setQuantity(p_count);

            p_list.add(unit);
        } else {
            if (isbatch) {
                for (int i = 1; i < p_count + 1; i++) {
                    String listcode = partcode + "-" + i;
                    BasePartListForm unit = new BasePartListForm();
                    unit.setPartlistcode(listcode);
                    unit.setPartcode(partcode);
                    unit.setRootcode(partcode);
                    unit.setSuffix("-" + i);
                    unit.setRemark(remark);
                    // 编号规则
                    unit.setIsmerge(isbatch);
                    // 设置零件数量
                    unit.setQuantity(1);

                    p_list.add(unit);
                }
            } else {
                String listcode = partcode + "(" + pcount + ")";
                BasePartListForm unit = new BasePartListForm();
                unit.setPartlistcode(listcode);
                unit.setPartcode(listcode);
                unit.setRootcode(partcode);
                unit.setRemark(remark);
                // 是否合并编号
                unit.setIsmerge(isbatch);
                // 设置零件数量
                unit.setQuantity(p_count);

                p_list.add(unit);
            }
        }

        return p_list;
    }

    /**
     * 获取当天日期的末尾时间(精确到秒)
     * 
     * @param date
     * @return
     */
    private Date getCurrentDayEnd(Date date) {
        String dateStr = DateUtils.dateToStr(date, DateUtils.DEFAULT_DATE_FORMAT);
        if (StringUtils.isEmpty(dateStr)) {
            return null;
        }

        final int formatLen = 10;

        dateStr = dateStr.substring(0, formatLen) + " 23:59:59";

        return DateUtils.strToDate(dateStr, DateUtils.DEFAULT_DATE_FORMAT);
    }
}

class ModulePartContent {
    public boolean isProcess() {
        return process;
    }

    public void setProcess(boolean process) {
        this.process = process;
    }

    public String getResumeid() {
        return resumeid;
    }

    public void setResumeid(String resumeid) {
        this.resumeid = resumeid;
    }

    public String getSecid() {
        return secid;
    }

    public void setSecid(String secid) {
        this.secid = secid;
    }

    public Map<String, ParsePartListForm> getMap() {
        return map;
    }

    public void setMap(Map<String, ParsePartListForm> map) {
        this.map = map;
    }

    // 模具或者零件是否处于加工中
    private boolean process;
    // 模具履历
    private String resumeid;
    private String secid;

    // 零件部品清单
    private Map<String, ParsePartListForm> map = new HashMap<String, ParsePartListForm>();
}
