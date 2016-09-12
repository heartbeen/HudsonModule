package com.kc.module.model.form;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.kc.module.base.Barcode;
import com.kc.module.model.ModulePart;
import com.kc.module.model.ModulePartList;
import com.kc.module.model.ModuleProcessInfo;
import com.kc.module.utils.StringUtils;

/**
 * 前台提交新模工件json解析bean
 * 
 * @author David
 * @email xuweissh@163.com
 * 
 */
@SuppressWarnings({"unchecked", "rawtypes"})
public class ModuleNewPartForm extends FormBean {

    private List<ModulePartForm> moduleParts;

    private List<ModulePartListForm> modulePartLists;

    public ModuleNewPartForm() {
        super(null);
    }

    public List<ModulePartForm> getModuleParts() {
        return moduleParts;
    }

    public void setModuleParts(List<ModulePartForm> moduleParts) {
        this.moduleParts = moduleParts;
    }

    public List<ModulePartListForm> getModulePartLists() {
        return modulePartLists;
    }

    public void setModulePartLists(List<ModulePartListForm> modulePartLists) {
        this.modulePartLists = modulePartLists;
    }

    @Override
    public boolean validator() {
        return true;
    }

    /**
     * 保存新模工件汇总
     * 
     * @param list
     * @return
     */
    @Override
    public boolean save() {

        String[] childIndexs;
        ModulePart mp;
        ModulePartList mpl;
        ModulePartListForm mplf;

        List<String> t_module = new ArrayList<String>();
        List<ModulePartList> t_list = null;

        Map<String, String> t_partRoot = new HashMap<String, String>();
        List<String> t_partList = new ArrayList<String>();

        for (ModulePartForm root : moduleParts) {
            String p_moduleid = root.getModulebarcode();
            if (StringUtils.isEmpty(p_moduleid)) {
                continue;
            }

            t_module.add(p_moduleid);
        }

        t_list = ModulePartList.dao.findPartList(t_module);

        for (ModulePartList cell : t_list) {
            String k_mbc = cell.getStr("MODULEBARCODE");
            String k_prc = cell.getStr("PARTROOTCODE");
            String k_pbc = cell.getStr("PARTBARCODE");
            String k_plc = cell.getStr("PARTLISTCODE");

            if (!t_partRoot.containsKey(k_mbc + k_prc)) {
                t_partRoot.put(k_mbc + k_prc, k_pbc);
            }

            if (!t_partList.contains(k_mbc + k_plc)) {
                t_partList.add(k_mbc + k_plc);
            }
        }

        Barcode.MD_PROCESS_INFO.nextVal(true);

        for (ModulePartForm mpf : moduleParts) {
            // 1------工件汇总保存--------------
            String l_mbc = mpf.getModulebarcode();
            String l_prc = mpf.getPartcode();

            String partBarcode = null;

            if (t_partRoot.containsKey(l_mbc + l_prc)) {

                mp = mpf.toModel();
                partBarcode = Barcode.MODULE_PART.nextVal();
                mp.set(mp.getPrimaryKey(), partBarcode);
                if (!mp.save()) {
                    return false;
                }
            } else {
                partBarcode = t_partRoot.get(l_mbc + l_prc);
            }

            childIndexs = mpf.getChildIndex().split(";");

            for (String index : childIndexs) {
                mplf = modulePartLists.get(Integer.valueOf(index));

                String l_plc = mplf.getPartlistcode();
                if (t_partList.contains(l_mbc + l_plc)) {
                    continue;
                }

                // 2-----工件清单保存------------
                mpl = mplf.toModel();
                mpl.set(mpl.getPrimaryKey(), Barcode.MODULE_PART_LIST.nextVal());
                mpl.set("PARTBARCODE", partBarcode);

                if (!mpl.save()) {
                    return false;
                }

                // 3-----工件加工信息建立----------------
                String processKeyId = Barcode.MD_PROCESS_INFO.nextVal();
                ModuleProcessInfo info = new ModuleProcessInfo();

                info.set(info.getPrimaryKey(), processKeyId);
                info.set("PARTBARLISTCODE", mpl.get(mpl.getPrimaryKey()));
                info.set("MODULERESUMEID", mplf.getModuleresumeid());

                if (!info.save()) {
                    return false;
                }
            }
        }

        return true;
    }

}
