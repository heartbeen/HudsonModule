package com.kc.module.extract;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.kc.module.dao.ExtractDao;
import com.kc.module.model.ModuleEstSchedule;
import com.kc.module.model.form.ModuleScheduleCell;
import com.kc.module.model.form.ModuleScheduleContent;
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.JsonUtils;
import com.kc.module.utils.StringUtils;

/**
 * 获取模具排程明细
 * 
 * @author ASUS
 * 
 */
public class ModuleScheduleExtract extends ExtractDao {

    @Override
    public Object extract() {
        String resumeid = this.getController().getPara("resumeid");
        List<String> parts = JsonUtils.parseJsArrayList(this.getController().getPara("parts"));

        List<ModuleEstSchedule> schelist = ModuleEstSchedule.dao.getModuleScheduleContent(resumeid, parts);

        Map<String, ModuleScheduleContent> scheMap = new HashMap<String, ModuleScheduleContent>();

        for (ModuleEstSchedule mes : schelist) {
            String partbarlistcode = mes.getStr("PARTBARLISTCODE");
            if (StringUtils.isEmpty(partbarlistcode)) {
                continue;
            }

            if (!scheMap.containsKey(partbarlistcode)) {
                ModuleScheduleContent msc = new ModuleScheduleContent();

                msc.setModulecode(StringUtils.parseString(mes.getStr("MODULECODE")));
                msc.setPartlistcode(StringUtils.parseString(mes.getStr("PARTLISTCODE")));
                msc.setPiccode(StringUtils.parseString(mes.getStr("PICCODE")));
                msc.setQuantity(ArithUtils.parseIntNumber(mes.get("QUANTITY"), 1));

                msc.setMaterial(StringUtils.parseString(mes.getStr("MATERIAL")));
                msc.setHardness(StringUtils.parseString(mes.getStr("HARDNESS")));
                msc.setBuffing(StringUtils.parseString(mes.getStr("BUFFING")));
                msc.setIntro(StringUtils.parseString(mes.getStr("INTRO")));

                msc.setStarttime(format(StringUtils.parseString(mes.getStr("STARTTIME")), true));
                msc.setInittrytime(format(StringUtils.parseString(mes.getStr("INITTRYTIME")), true));
                msc.setMaterialsrc(ArithUtils.parseIntNumber(mes.get("MATERIALSRC"), 0));

                msc.setMaterialtype(ArithUtils.parseIntNumber(mes.get("MATERIALTYPE"), 0));
                msc.setTolerance(StringUtils.parseString(mes.getStr("TOLERANCE")));
                msc.setReform(ArithUtils.parseIntNumber(mes.get("REFORM"), 0));

                ModuleScheduleCell mscell = new ModuleScheduleCell();

                mscell.setRanknum(mes.getNumber("RANKNUM").intValue() + 1);
                mscell.setCraftname(StringUtils.parseString(mes.getStr("CRAFTNAME")));
                mscell.setEndtime(format(StringUtils.parseString(mes.getStr("ENDTIME")), false));

                mscell.setRemark(StringUtils.parseString(StringUtils.parseString(mes.getStr("REMARK"))));
                mscell.setFee(ArithUtils.parseIntNumber(mes.get("FEE"), 0));

                msc.getCell().add(mscell);

                scheMap.put(partbarlistcode, msc);

            } else {
                ModuleScheduleContent msc = scheMap.get(partbarlistcode);

                ModuleScheduleCell mscell = new ModuleScheduleCell();

                mscell.setRanknum(mes.getNumber("RANKNUM").intValue() + 1);
                mscell.setCraftname(StringUtils.parseString(mes.getStr("CRAFTNAME")));
                mscell.setEndtime(format(StringUtils.parseString(mes.getStr("ENDTIME")), false));
                mscell.setRemark(StringUtils.parseString(mes.getStr("REMARK")));
                mscell.setFee(ArithUtils.parseIntNumber(mes.get("FEE"), 0));

                msc.getCell().add(mscell);
            }
        }

        List<ModuleScheduleContent> backlist = new ArrayList<ModuleScheduleContent>();
        if (scheMap.size() > 0) {
            for (String key : scheMap.keySet()) {
                backlist.add(scheMap.get(key));
            }
        }

        return backlist;
    }

    private String format(String date, boolean more) {
        if (StringUtils.isEmpty(date)) {
            return date;
        }

        if (more) {
            int fdx = date.indexOf("/");
            int ldx = date.lastIndexOf("/");

            int year = ArithUtils.parseInt(date.substring(0, fdx));
            int month = ArithUtils.parseInt(date.substring(fdx + 1, ldx));
            int day = ArithUtils.parseInt(date.substring(ldx + 1));

            return year + "年" + month + "月" + day + "日";
        } else {
            int index = date.indexOf("/");
            int month = ArithUtils.parseInt(date.substring(0, index));
            int day = ArithUtils.parseInt(date.substring(index + 1));

            return month + "月" + day + "日";
        }
    }

}
