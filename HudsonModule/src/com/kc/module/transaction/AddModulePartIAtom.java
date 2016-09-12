package com.kc.module.transaction;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.IAtom;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.base.Barcode;
import com.kc.module.model.form.AddModulePartForm;
import com.kc.module.model.form.CreatePartListForm;
import com.kc.module.model.form.ParsePartcodeForm;
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.JsonUtils;
import com.kc.module.utils.StringUtils;

public class AddModulePartIAtom implements IAtom {

    private Controller controller;
    private final String charRegex = "^[a-zA-Z]+$";
    private final String batchRegex = "^(\\d{1,2}|(\\((\\d{1,2}|(\\d{1,2}-\\d{1,2}))(,(\\d{1,2}|(\\d{1,2}-\\d{1,2})))*\\)))?(\\([a-zA-Z]+\\))?(\\[[a-zA-Z]+\\])?$";
    private ParsePartcodeForm partForm;

    public ParsePartcodeForm getPartForm() {
        return partForm;
    }

    public void setPartForm(ParsePartcodeForm partForm) {
        this.partForm = partForm;
    }

    public Controller getController() {
        return controller;
    }

    public void setController(Controller controller) {
        this.controller = controller;
    }

    @Override
    public boolean run() throws SQLException {
        AddModulePartForm ampf = getModulePartForm("info");
        String flag = this.getController().getPara("flag");
        partForm = new ParsePartcodeForm();
        // 如果解析的结果为空,则返回FALSE
        if (ampf == null) {
            partForm.setBflag(-1);
            return (false);
        }

        // 如果模具工号为空,则返回FALSE
        if (StringUtils.isEmpty(ampf.getModulebarcode())) {
            partForm.setBflag(-2);
            return (false);
        }
        // 如果工件编号为空,则返回FALSE
        if (StringUtils.isEmpty(ampf.getParttypecode())) {
            partForm.setBflag(-3);
            return (false);
        }
        // 如果统计工件数量的字符串为空,则返回FALSE
        if (StringUtils.isEmpty(ampf.getParttypecount())) {
            partForm.setBflag(-4);
            return (false);
        }
        // 如果工件数量表达式不符合正则表达式要求,则返回FALSE
        if (!StringUtils.isRegex(this.batchRegex, ampf.getParttypecount())) {
            partForm.setBflag(-5);
            return (false);
        }

        // 如果编号规则不符合要求,则将其默认设置为0
        if (StringUtils.isEmpty(ampf.getParttypesplit())) {
            ampf.setParttypesplit("0");
        }

        String splitFlag = ampf.getParttypesplit();

        // 如果工件为合并编号,并且数量不为数字,则返回FALSE
        if (!isNotMergeBatch(splitFlag, ampf.getParttypecount())) {
            partForm.setBflag(-11);
            return (false);
        }

        // TODO DDDDDDD

        Map<String, CreatePartListForm> partlist = getPartNumber(splitFlag,
                                                                 ampf.getParttypecode(),
                                                                 ampf.getParttypecount(),
                                                                 ampf.getPiccode(),
                                                                 ampf.getHardness(),
                                                                 ampf.getBuffing(),
                                                                 toleranceFormat(ampf.getTolerance(), "±0.3"),
                                                                 ampf.getParttypebasic());
        String modulecode = null;

        StringBuilder sql = new StringBuilder();

        sql.append("SELECT A.MODULEBARCODE, A.OPERATEFLAG, B.ID, B.RESUMESTATE, A.MODULECODE, ");
        sql.append("(SELECT MAX(ID) FROM MD_RESUME_SECTION WHERE RESUMEID = B.ID) AS SECID FROM MODULELIST A  ");
        sql.append("    LEFT JOIN MD_RESUME B ON A.MODULEBARCODE = B.MODULEBARCODE WHERE A.MODULEBARCODE = ? ");
        sql.append("    AND A.MODULESTATE = ?");

        // 查询模具的相关讯息
        Record rcd = Db.findFirst(sql.toString(), ampf.getModulebarcode(), "0");
        if (rcd == null) {
            partForm.setBflag(-6);
            return (false);
        }

        // 模具工号
        modulecode = rcd.getStr("MODULECODE");

        sql = new StringBuilder();

        sql.append("SELECT A.*,B.PARTCODE,B.QUANTITY,B.CNAMES,                     ");
        sql.append("B.RACEID,B.NORMS,B.MATERIAL,B.ISFIRMWARE,C.* FROM   ");
        sql.append("MODULELIST A LEFT JOIN MD_PART B ON A.MODULEBARCODE ");
        sql.append(" = B.MODULEBARCODE LEFT JOIN MD_PART_LIST C         ");
        sql.append("  ON B.PARTBARCODE = C.PARTBARCODE WHERE            ");
        sql.append("A.MODULESTATE = ?                                   ");
        sql.append("AND A.MODULEBARCODE = ? AND B.PARTCODE = ?          ");
        sql.append("AND C.ISENABLE = ?   ORDER BY C.PARTLISTCODE        ");

        List<Record> rlist = Db.find(sql.toString(), "0", ampf.getModulebarcode(), ampf.getParttypecode(), "0");

        String t_partcode = null;
        String t_partcodeid = null;
        // 缓存数据库中的工件数量
        int o_count = 0;
        // 缓存数据库中已经存在的工件数量
        int t_pcount = 0;

        for (Record r : rlist) {
            String partbarlistcode = r.getStr("PARTBARLISTCODE");

            String pcode = r.getStr("PARTLISTCODE");
            String ncodeid = r.getStr("PARTBARCODE");
            Object oricount = r.get("QUANTITY");

            // 检测是否存在该部件号
            String ncode = r.getStr("PARTCODE");
            if (StringUtils.isEmpty(t_partcode) && !StringUtils.isEmpty(ncode)) {
                t_partcode = ncode;
                t_partcodeid = ncodeid;
                o_count = ArithUtils.parseInt(StringUtils.parseString(oricount));
            }

            // 如果工件号数据已经存在,则标记为已经存在
            if (!StringUtils.isEmpty(pcode) && partlist.containsKey(pcode)) {

                partlist.get(pcode).setPartbarlistcode(partbarlistcode);
                partlist.get(pcode).setIsexist(1);

                t_pcount++;

                // ROCK 150807 之前此处为区分编号的话设置为已经存在,现在改为全部情况下只要存在就不允许重新编号
                // if (splitFlag.equals("1")) {
                // partlist.get(pcode).setIsexist(1);
                // t_pcount++;
                // }
            }
        }

        List<CreatePartListForm> flist = new ArrayList<CreatePartListForm>();

        for (String key : partlist.keySet()) {
            flist.add(partlist.get(key));
        }

        String t_resumestate = rcd.getStr("RESUMESTATE");
        // String t_firm = ampf.getParttypefit();

        String t_firm = (getBasicData(ampf.getParttypebasic(), 5)[4] + "");

        // 模具当前的履历号
        String t_resumeid = rcd.getStr("ID");
        // 设置为履历分段ID
        String secid = rcd.getStr("SECID");
        // 模具新增工件时,将履历所对应的工件列表缓存清除

        boolean rst = false;

        int fcount = 0;
        if (splitFlag.equals("0")) {
            fcount = o_count + ArithUtils.parseInt(ampf.getParttypecount());
        } else {
            fcount = o_count + partlist.size() - t_pcount;
        }

        if (flag.equals("1")) {
            Record saveRcd = new Record();
            String partCodeKey = (StringUtils.isEmpty(t_partcodeid) ? Barcode.MODULE_PART.nextVal() : t_partcodeid);
            if (StringUtils.isEmpty(t_partcode)) {
                saveRcd.set("PARTBARCODE", partCodeKey)
                       .set("MODULEBARCODE", ampf.getModulebarcode())
                       .set("PARTCODE", ampf.getParttypecode())
                       .set("CNAMES", ampf.getParttypename())
                       .set("RACEID", ampf.getParttypetxt())
                       .set("NORMS", ampf.getParttypenorms())
                       .set("MATERIAL", ampf.getParttypesource())
                       .set("QUANTITY", fcount)
                       .set("ISFIRMWARE", t_firm)
                       .set("ISBATCH", "0")
                       .set("ISPROCESS", 0)
                       .set("MEASURE", 0);
                rst = Db.save("MD_PART", "PARTBARCODE", saveRcd);
                if (!rst) {
                    partForm.setBflag(-7);
                    return (false);
                }
            } else {
                saveRcd.set("PARTBARCODE", partCodeKey)
                       .set("QUANTITY", fcount)
                       .set("ISFIRMWARE", t_firm)
                       .set("CNAMES", ampf.getParttypename())
                       .set("RACEID", ampf.getParttypetxt())
                       .set("NORMS", ampf.getParttypenorms())
                       .set("MATERIAL", ampf.getParttypesource());
                rst = Db.update("MD_PART", "PARTBARCODE", saveRcd);
                if (!rst) {
                    partForm.setBflag(-8);
                    return (false);
                }
            }

            String t_partlistbarcode = Barcode.MODULE_PART_LIST.nextVal(true);
            String t_moduleprocessid = Barcode.MD_PROCESS_INFO.nextVal(true);

            boolean isStart = false;

            for (CreatePartListForm cpf : flist) {

                int isexsit = cpf.getIsexist();
                if (isexsit < 1) {
                    if (!isStart) {
                        isStart = true;
                    } else {
                        t_partlistbarcode = Barcode.MODULE_PART_LIST.nextVal();
                        t_moduleprocessid = Barcode.MD_PROCESS_INFO.nextVal();
                    }
                    // 保存到MD_PART_LIST
                    saveRcd = new Record();
                    saveRcd.set("PARTBARLISTCODE", t_partlistbarcode)
                           .set("MODULEBARCODE", ampf.getModulebarcode())
                           .set("PARTBARCODE", partCodeKey)
                           .set("PARTLISTCODE", cpf.getPartlistcode())
                           .set("PARTROOTCODE", ampf.getParttypecode())
                           .set("PARTLISTBATCH", cpf.getPartbatch())
                           .set("ISENABLE", "0")
                           .set("QUANTITY", cpf.getQuantity())
                           .set("PICCODE", cpf.getPiccode())
                           .set("HARDNESS", cpf.getHardness())
                           .set("BUFFING", cpf.getBuffing())
                           .set("TOLERANCE", cpf.getTolerance())
                           .set("MATERIALSRC", cpf.getMaterialsrc())
                           .set("MATERIALTYPE", cpf.getMaterialtype())
                           .set("ISFIXED", cpf.getIsfixed())
                           .set("REFORM", cpf.getReform())
                           .set("MODULECODE", modulecode);

                    rst = Db.save("MD_PART_LIST", "PARTBARLISTCODE", saveRcd);
                    if (!rst) {
                        partForm.setBflag(-9);
                        return (false);
                    }
                    // 保存到MD_PROCESS_INFO
                    if (!StringUtils.isEmpty(t_resumestate)) {
                        saveRcd = new Record();
                        saveRcd.set("ID", t_moduleprocessid)
                               .set("PARTBARLISTCODE", t_partlistbarcode)
                               .set("MODULERESUMEID", t_resumeid)
                               .set("ACTIONTIME", DateUtils.parseTimeStamp(DateUtils.getDateNow()))
                               .set("ISFIXED", cpf.getIsfixed())
                               .set("ISMAJOR", 1);

                        rst = Db.save("MD_PROCESS_INFO", saveRcd);
                        if (!rst) {
                            partForm.setBflag(-10);
                            return (false);
                        }
                    }

                    // 保存到MD_PART_SECTION
                    if (!StringUtils.isEmpty(secid)) {
                        saveRcd = new Record();
                        saveRcd.set("ID", Barcode.MD_PART_SECTION.nextVal()).set("SECTIONID", secid).set("PARTBARLISTCODE", t_partlistbarcode);

                        rst = Db.save("MD_PART_SECTION", saveRcd);
                        if (!rst) {
                            partForm.setBflag(-10);
                            return (false);
                        }
                    }
                } else {
                    saveRcd = new Record();

                    saveRcd.set("PARTBARLISTCODE", cpf.getPartbarlistcode())
                           .set("QUANTITY", cpf.getQuantity())
                           .set("PICCODE", cpf.getPiccode())
                           .set("HARDNESS", cpf.getHardness())
                           .set("BUFFING", cpf.getBuffing())
                           .set("TOLERANCE", cpf.getTolerance())
                           .set("MATERIALSRC", cpf.getMaterialsrc())
                           .set("MATERIALTYPE", cpf.getMaterialtype())
                           // .set("ISFIXED", cpf.getIsfixed())
                           .set("REFORM", cpf.getReform())
                           .set("MODULECODE", modulecode);

                    rst = Db.update("MD_PART_LIST", "PARTBARLISTCODE", saveRcd);
                    if (!rst) {
                        partForm.setBflag(-10);
                        return (false);
                    }
                }
            }
        } else {
            partForm.setQueryList(flist);
        }

        partForm.setResult(true);
        partForm.setResumeid(t_resumeid);
        partForm.setResumestate(t_resumestate);
        partForm.setBflag(1);
        return (true);
    }

    /**
     * 将前台传来的工件讯息转换为JavaBean
     * 
     * @param name
     * @return
     */
    private AddModulePartForm getModulePartForm(String name) {
        ObjectMapper mapper = new ObjectMapper();
        String content = this.getController().getPara(name);
        // 如果解析的参数内容为空,则返回(NULL)
        if (content == null) {
            return (null);
        }

        try {
            return mapper.readValue(content, AddModulePartForm.class);
        }
        catch (Exception e) {
            e.printStackTrace();
            return (null);
        }
    }

    /**
     * 解析一个字符串对应的工件编号<br>
     * flag参数0为合并编号1为区分编号,batch参数为工件部品号,list为数量编号
     * 
     * @param list
     * @return
     */
    private Map<String, CreatePartListForm> getPartNumber(String flag,
                                                          String batch,
                                                          String list,
                                                          String piccode,
                                                          String hardness,
                                                          String buffing,
                                                          String tolerance,
                                                          String basic) {
        Map<String, CreatePartListForm> rlist = new LinkedHashMap<String, CreatePartListForm>();
        if (StringUtils.isEmpty(list)) {
            return rlist;
        }

        batch = batch.toUpperCase();
        list = list.toUpperCase();

        int[] data = getBasicData(basic, 5);

        if (flag.equals("0")) {
            int pCnt = ArithUtils.parseInt(list);
            CreatePartListForm cpf = new CreatePartListForm();
            if (pCnt == 1) {
                cpf.setPartlistcode(batch);
                cpf.setIsexist(0);

                cpf.setHardness(hardness);
                cpf.setPiccode(piccode);
                cpf.setBuffing(buffing);
                cpf.setTolerance(tolerance);
                cpf.setQuantity(1);

                cpf.setIsfixed(data[0]);
                cpf.setMaterialsrc(data[1]);
                cpf.setMaterialtype(data[2]);
                cpf.setReform(data[3]);

                rlist.put(batch, cpf);
            } else {
                String s_str = batch + "(" + list + ")";
                cpf.setPartlistcode(s_str);

                cpf.setHardness(hardness);
                cpf.setPiccode(piccode);
                cpf.setBuffing(buffing);
                cpf.setTolerance(tolerance);

                cpf.setQuantity(pCnt);

                cpf.setIsfixed(data[0]);
                cpf.setMaterialsrc(data[1]);
                cpf.setMaterialtype(data[2]);
                cpf.setReform(data[3]);

                cpf.setIsexist(0);

                rlist.put(s_str, cpf);
            }

            return rlist;
        } else {
            try {
                if (list.contains("[")) {
                    int s_index = list.indexOf("[");
                    String s_str = list.substring(s_index + 1, list.length() - 1);
                    for (int x = 0; x < s_str.length(); x++) {
                        String s_char = batch + s_str.charAt(x);
                        if (!rlist.containsKey(s_char)) {
                            CreatePartListForm cpf = new CreatePartListForm();
                            cpf.setPartlistcode(s_char);
                            cpf.setIsexist(0);

                            cpf.setHardness(hardness);
                            cpf.setPiccode(piccode);
                            cpf.setBuffing(buffing);
                            cpf.setTolerance(tolerance);
                            cpf.setQuantity(1);

                            cpf.setIsfixed(data[0]);
                            cpf.setMaterialsrc(data[1]);
                            cpf.setMaterialtype(data[2]);
                            cpf.setReform(data[3]);

                            rlist.put(s_char, cpf);
                        }
                    }

                    list = list.substring(0, s_index);
                }

                String[] ritem = list.split("\\(", -1);
                for (String unit : ritem) {
                    if (StringUtils.isEmpty(unit)) {
                        continue;
                    }
                    if (ArithUtils.isInt(unit)) {
                        int rcount = ArithUtils.parseInt(unit);
                        if (rcount < 1) {
                            continue;
                        } else if (rcount == 1) {
                            if (!rlist.containsKey(batch)) {
                                CreatePartListForm cpf = new CreatePartListForm();
                                cpf.setPartlistcode(batch);
                                cpf.setPartbatch("");
                                cpf.setIsexist(0);

                                cpf.setHardness(hardness);
                                cpf.setPiccode(piccode);
                                cpf.setBuffing(buffing);
                                cpf.setTolerance(tolerance);
                                cpf.setQuantity(1);

                                cpf.setIsfixed(data[0]);
                                cpf.setMaterialsrc(data[1]);
                                cpf.setMaterialtype(data[2]);
                                cpf.setReform(data[3]);

                                rlist.put(batch, cpf);
                            }
                        } else {
                            for (int x = 1; x < rcount + 1; x++) {
                                String t_char = batch + "-" + x;
                                if (!rlist.containsKey(t_char)) {
                                    CreatePartListForm cpf = new CreatePartListForm();
                                    cpf.setPartlistcode(t_char);
                                    cpf.setIsexist(0);

                                    cpf.setHardness(hardness);
                                    cpf.setPiccode(piccode);
                                    cpf.setBuffing(buffing);
                                    cpf.setTolerance(tolerance);
                                    cpf.setQuantity(1);

                                    cpf.setIsfixed(data[0]);
                                    cpf.setMaterialsrc(data[1]);
                                    cpf.setMaterialtype(data[2]);
                                    cpf.setReform(data[3]);

                                    cpf.setPartbatch("-" + x);
                                    rlist.put(t_char, cpf);
                                }
                            }
                        }
                    } else {
                        unit = unit.replace(")", "");
                        if (StringUtils.isRegex(charRegex, unit)) {
                            for (int x = 0; x < unit.length(); x++) {
                                String f_char = batch + "-" + unit.charAt(x);
                                if (!rlist.containsKey(f_char)) {
                                    CreatePartListForm cpf = new CreatePartListForm();
                                    cpf.setPartlistcode(f_char);
                                    cpf.setIsexist(0);

                                    cpf.setHardness(hardness);
                                    cpf.setPiccode(piccode);
                                    cpf.setBuffing(buffing);
                                    cpf.setTolerance(tolerance);
                                    cpf.setQuantity(1);

                                    cpf.setIsfixed(data[0]);
                                    cpf.setMaterialsrc(data[1]);
                                    cpf.setMaterialtype(data[2]);
                                    cpf.setReform(data[3]);

                                    cpf.setPartbatch("-" + unit.charAt(x));

                                    rlist.put(f_char, cpf);
                                }
                            }
                        } else {
                            String[] cells = unit.split(",", -1);
                            for (String cell : cells) {
                                if (cell.contains("-")) {
                                    String[] dis = cell.split("-", -1);

                                    int min = ArithUtils.parseInt(dis[0]);
                                    int max = ArithUtils.parseInt(dis[1]);

                                    if (min < 1 && max < 1) {
                                        continue;
                                    }

                                    if (min == max) {
                                        String l_char = batch + "-" + min;
                                        if (!rlist.containsKey(l_char)) {
                                            CreatePartListForm cpf = new CreatePartListForm();
                                            cpf.setPartlistcode(l_char);
                                            cpf.setIsexist(0);

                                            cpf.setHardness(hardness);
                                            cpf.setPiccode(piccode);
                                            cpf.setBuffing(buffing);
                                            cpf.setTolerance(tolerance);
                                            cpf.setQuantity(1);

                                            cpf.setIsfixed(data[0]);
                                            cpf.setMaterialsrc(data[1]);
                                            cpf.setMaterialtype(data[2]);
                                            cpf.setReform(data[3]);

                                            cpf.setPartbatch("-" + min);

                                            rlist.put(l_char, cpf);
                                        }
                                    }

                                    if (min < 1) {
                                        min = 1;
                                    }

                                    if (max < 1) {
                                        max = 1;
                                    }

                                    int temp = 0;

                                    if (min > max) {
                                        temp = max;
                                        max = min;
                                        min = temp;
                                    }

                                    for (int x = min; x <= max; x++) {
                                        String m_char = batch + "-" + x;
                                        if (!rlist.containsKey(m_char)) {
                                            CreatePartListForm cpf = new CreatePartListForm();
                                            cpf.setPartlistcode(m_char);
                                            cpf.setIsexist(0);

                                            cpf.setHardness(hardness);
                                            cpf.setPiccode(piccode);
                                            cpf.setBuffing(buffing);
                                            cpf.setTolerance(tolerance);
                                            cpf.setQuantity(1);

                                            cpf.setIsfixed(data[0]);
                                            cpf.setMaterialsrc(data[1]);
                                            cpf.setMaterialtype(data[2]);
                                            cpf.setReform(data[3]);

                                            cpf.setPartbatch("-" + x);
                                            rlist.put(m_char, cpf);
                                        }
                                    }
                                } else {
                                    String n_char = batch + "-" + cell;
                                    if (!rlist.containsKey(n_char)) {
                                        CreatePartListForm cpf = new CreatePartListForm();
                                        cpf.setPartlistcode(n_char);
                                        cpf.setIsexist(0);

                                        cpf.setHardness(hardness);
                                        cpf.setPiccode(piccode);
                                        cpf.setBuffing(buffing);
                                        cpf.setTolerance(tolerance);
                                        cpf.setQuantity(1);

                                        cpf.setIsfixed(data[0]);
                                        cpf.setMaterialsrc(data[1]);
                                        cpf.setMaterialtype(data[2]);
                                        cpf.setReform(data[3]);

                                        cpf.setPartbatch("-" + cell);

                                        rlist.put(n_char, cpf);
                                    }
                                }
                            }
                        }
                    }
                }

                return rlist;
            }
            catch (Exception e) {
                return new HashMap<String, CreatePartListForm>();
            }
        }

    }

    /**
     * 获取基础数据资料
     * 
     * @param json
     * @param base
     * @return
     */
    private int[] getBasicData(String json, int base) {
        int[] data = new int[base];
        if (StringUtils.isEmpty(json)) {
            return data;
        }

        String[] items = JsonUtils.parseJsArray(json);
        for (String it : items) {
            if (ArithUtils.isInt(it)) {
                data[ArithUtils.parseInt(it)] = 1;
            }
        }

        return data;
    }

    /**
     * 设置公差格式
     * 
     * @param tolerance
     * @param ref
     * @return
     */
    private String toleranceFormat(String tolerance, String ref) {
        if (StringUtils.isEmpty(tolerance)) {
            return ref;
        }
        if (ArithUtils.isDouble(tolerance)) {
            double toler = ArithUtils.parseDouble(tolerance, 0);
            if (toler > 0) {
                return "+" + tolerance;
            }

            return tolerance;
        } else {
            return tolerance;
        }
    }

    /**
     * 判断工件合并编号时,数量是否为数字
     * 
     * @param flag
     * @param cnt
     * @return
     */
    private boolean isNotMergeBatch(String flag, String cnt) {
        // 如果工件不是合并编号则直接跳过返回TRUE
        if (!flag.trim().equals("0")) {
            return (true);
        }

        return ArithUtils.isPlusInt(cnt, true);
    }
}
