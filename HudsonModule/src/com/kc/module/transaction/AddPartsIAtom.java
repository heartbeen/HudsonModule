package com.kc.module.transaction;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.base.Barcode;
import com.kc.module.model.ModulePart;
import com.kc.module.model.ModulePartList;
import com.kc.module.utils.JsonUtils;

public class AddPartsIAtom extends SqlTranscation {
    public static AddPartsIAtom iAtom = new AddPartsIAtom();

    @Override
    public boolean run() {
        try {
            String modules_msg = this.ctrl.getPara(this.ajaxAttr[0]);
            String parts_msg = this.ctrl.getPara(this.ajaxAttr[1]);
            Map<?, ?>[] modules_map = JsonUtils.fromJsonStrToList(modules_msg);
            Map<?, ?>[] parts_map = JsonUtils.fromJsonStrToList(parts_msg);
            HashMap<String, String> moduleInfo = new HashMap<String, String>();
            StringBuilder builder = new StringBuilder();
            builder.append("SELECT a.modulebarcode, a.modulecode, b.partbarcode, b.partcode, b.raceid");
            builder.append(", c.partlistcode");
            builder.append(" FROM modulelist a");
            builder.append(" LEFT JOIN md_part b ON a.modulebarcode = b.modulebarcode");
            builder.append(" AND a.modulebarcode = b.modulebarcode");
            builder.append(" LEFT JOIN (");
            builder.append("SELECT *");
            builder.append(" FROM md_part_list");
            builder.append(" WHERE isenable = '0'");
            builder.append(") c ON b.partbarcode = c.partbarcode");
            builder.append(" WHERE a.modulestate <> '1'");
            builder.append(" AND a.modulecode in (");

            for (Map<?, ?> item : modules_map) {
                if (item.get("modulecode") != null) {
                    builder.append("'").append(item.get("modulecode").toString()).append("',");
                    moduleInfo.put(item.get("modulecode").toString(), item.get("modulebarcode")
                                                                          .toString());
                }
            }

            List<Record> record = Db.find(builder.substring(0, builder.length() - 1) + ")");
            HashMap<String, ModulePart> addPartStack = new HashMap<String, ModulePart>();
            HashMap<String, ModulePartList> addPartUnit = new HashMap<String, ModulePartList>();
            HashMap<String, Integer> partTotalCount = new HashMap<String, Integer>();
            HashMap<String, String[]> partInDbMsg = new HashMap<String, String[]>();
            HashMap<String, String> partBatchList = new HashMap<String, String>();
            HashMap<String, Integer> standardBatchCount = new HashMap<String, Integer>();
            HashMap<String, String> alreadyExsitModule = new HashMap<String, String>();

            for (String module : moduleInfo.keySet()) {
                String module_bar_code = moduleInfo.get(module);

                if (record != null && record.size() > 0) {
                    for (Record r : record) {
                        String data_module = r.getStr("modulecode");
                        String data_bar_module = r.getStr("modulebarcode");
                        if (module.equals(data_module)) {
                            if (!alreadyExsitModule.containsKey(module)) {
                                alreadyExsitModule.put(module, data_bar_module);
                            }
                        }
                    }
                }

                for (Map<?, ?> part : parts_map) {
                    // 声明存放模具工件资料
                    ModulePart part_code = new ModulePart();
                    // 模具工号唯一号
                    part_code.set("MODULEBARCODE", module_bar_code);
                    // 模具工号
                    part_code.set("MODULECODE", module);

                    // 模具工件号
                    String part_bar_code = Barcode.MODULE_PART.nextVal();
                    String part_temp_id = part.get("bodytxt").toString();
                    String part_temp_type = part.get("type").toString();
                    if (!part_temp_type.equals("9")) {
                        ModulePartList part_unit = new ModulePartList();
                        String temp_part_bar_code = null;
                        if (!partBatchList.containsKey(module + part_temp_id)) {
                            temp_part_bar_code = part_bar_code;
                            partBatchList.put(module + part_temp_id, part_bar_code);
                        } else {
                            temp_part_bar_code = partBatchList.get(module + part_temp_id);
                        }
                        String part_list_bar_code = Barcode.MODULE_PART_LIST.nextVal();
                        part_unit.set("MODULEBARCODE", module_bar_code);
                        part_unit.set("MODULECODE", module);
                        // 工件唯一号
                        part_code.set("PARTBARCODE", temp_part_bar_code);
                        part_unit.set("PARTBARCODE", temp_part_bar_code);
                        // 工件编号
                        part_code.set("PARTCODE", part_temp_id);
                        part_unit.set("PARTROOTCODE", part_temp_id);

                        // 工件名称
                        part_code.set("CNAMES", part.get("text").toString());
                        // 工件材质
                        part_code.set("MATERIAL", part.get("source").toString());
                        // 是否固件
                        boolean fit_rs = Boolean.valueOf(part.get("isfit").toString());
                        part_code.set("ISFIRMWARE", fit_rs ? "0" : "1");
                        // 工件规格
                        part_code.set("NORMS", part.get("norms").toString());
                        // 工件类别
                        part_code.set("RACEID", part_temp_type);
                        // 工件供应商
                        part_code.set("APPLIERID", "");

                        part_code.set("QUANTITY", 0);

                        // 工件单元件唯一号
                        part_unit.set("PARTBARLISTCODE", part_list_bar_code);
                        // 工件单元件是否可用 0为可用,1为作废
                        part_unit.set("ISENABLE", "0");

                        part_unit.set("ISSCHEDULE", "0");
                        // 工件单元件编号
                        String part_temp_list_id = part.get("id").toString();
                        part_unit.set("PARTLISTCODE", part_temp_list_id);
                        // 工件单元件后缀编号
                        part_unit.set("PARTLISTBATCH", part.get("suffix").toString());

                        if (!addPartStack.containsKey(module + part_temp_id)) {
                            addPartStack.put(module + part_temp_id, part_code);
                        }

                        addPartUnit.put(module + part_temp_list_id, part_unit);
                    } else {
                        // 工件编号,由于此处是标准工件,不需要编号,所以自动生成一个流水UUID号以便存储
                        String part_standard_code = UUID.randomUUID().toString();
                        part_code.set("PARTBARCODE", part_bar_code);
                        part_code.set("PARTCODE", "");
                        // 工件名称
                        part_code.set("CNAMES", part.get("text").toString());
                        // 工件材质
                        part_code.set("MATERIAL", part.get("source").toString());
                        // 是否固件
                        part_code.set("ISFIRMWARE", "1");
                        // 工件规格
                        part_code.set("NORMS", part.get("norms").toString());
                        // 工件类别
                        part_code.set("RACEID", part_temp_type);
                        // 工件供应商
                        part_code.set("APPLIERID", "");

                        part_code.set("QUANTITY", 0);

                        addPartStack.put(module + part_standard_code, part_code);
                        standardBatchCount.put(module + part_standard_code,
                                               Integer.valueOf(part.get("count").toString()));
                    }
                }
            }

            if (record != null && record.size() > 0) {
                for (Record r : record) {
                    String data_module = r.getStr("modulecode");
                    String data_part = r.getStr("partcode");
                    String data_bar_part = r.getStr("partbarcode");
                    String data_bar_module = r.getStr("modulebarcode");
                    if (partTotalCount.containsKey(data_module + data_part)) {
                        partInDbMsg.put(data_module + data_part, new String[]{data_bar_module,
                                                                              data_bar_part});
                        partTotalCount.put(data_module + data_part,
                                           partTotalCount.get(data_module + data_part) + 1);
                    } else {
                        partTotalCount.put(data_module + data_part, 1);
                    }
                }
            }

            // 遍历工件单元件并保存至数据库
            for (String key : addPartUnit.keySet()) {
                // 遍历新建的工件的资料,来统计实际的该工件的总数量
                ModulePartList module_part_list = addPartUnit.get(key);
                String temp_module_code = module_part_list.getStr("MODULECODE");
                String temp_part_code = module_part_list.getStr("PARTROOTCODE");

                if (partTotalCount.containsKey(temp_module_code + temp_part_code)) {
                    partTotalCount.put(temp_module_code + temp_part_code,
                                       partTotalCount.get(temp_module_code + temp_part_code) + 1);
                } else {
                    partTotalCount.put(temp_module_code + temp_part_code, 1);
                }

                if (record != null && record.size() > 0) {
                    boolean isProcess = false;
                    for (Record r : record) {
                        String data_module = r.getStr("modulecode");
                        String data_part_list = r.getStr("partlistcode");
                        if (key.equals(data_module + data_part_list)) {
                            partTotalCount.put(temp_module_code + temp_part_code,
                                               partTotalCount.get(temp_module_code + temp_part_code) - 1);
                            isProcess = true;
                            break;
                        }
                    }
                    if (!isProcess) {
                        boolean rs = addPartUnit.get(key).save();
                        if (!rs) {
                            return rs;
                        }
                    }
                } else {
                    boolean rs = addPartUnit.get(key).save();
                    if (!rs) {
                        return rs;
                    }
                }
            }

            for (String key : addPartStack.keySet()) {
                ModulePart module_part = addPartStack.get(key);
                if (partInDbMsg.containsKey(key)) {
                    int total = partTotalCount.get(key) + module_part.getInt("quantity");
                    String[] msg = partInDbMsg.get(key);
                    int rs = Db.update("update md_part set quantity = "
                                       + total
                                       + " where modulebarcode = '"
                                       + msg[0]
                                       + "' and partbarcode = '"
                                       + msg[1]
                                       + "'");
                    if (rs < 1) {
                        return false;
                    }
                } else {
                    // 判断是否为标准件,如果未标准件则统计完整数量,其他则按实际数量统计
                    if (standardBatchCount.containsKey(key)) {
                        module_part.set("QUANTITY", standardBatchCount.get(key));
                    } else {
                        module_part.set("QUANTITY", partTotalCount.get(key));
                    }

                    boolean rs = module_part.save();
                    if (!rs) {
                        return rs;
                    }
                }
            }

            for (String key : alreadyExsitModule.keySet()) {
                int rs = Db.update("update modulelist set operateflag = '1' where modulebarcode = '"
                                   + alreadyExsitModule.get(key)
                                   + "'");
                if (rs < 1) {
                    return false;
                }
            }

            return true;
        }
        catch (Exception e) {
            return false;
        }
    }
}
