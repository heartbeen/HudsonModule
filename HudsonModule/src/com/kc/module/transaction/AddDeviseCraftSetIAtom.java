package com.kc.module.transaction;

import java.sql.SQLException;
import java.util.List;

import com.kc.module.base.Barcode;
import com.kc.module.dao.BaseIAtom;
import com.kc.module.model.DesignCraftList;
import com.kc.module.model.DesignCraftSet;
import com.kc.module.model.DesignScheduleInfo;
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.StringUtils;

/**
 * 添加制程集合
 * 
 * @author ASUS
 * 
 */
public class AddDeviseCraftSetIAtom extends BaseIAtom {

    @Override
    public boolean run() throws SQLException {
        try {
            // 集合名称
            String setname = this.getController().getPara("setname");
            // 集合履历ID
            String resumeid = this.getController().getPara("resumeid");
            // 制程集合类型
            int kind = this.getController().getParaToInt("kind");

            // 过滤集合中的特殊字符
            setname = StringUtils.trimSpecial(setname);
            if (StringUtils.isEmpty(setname)) {
                this.setMsg("集合名称不能为空");
                return false;
            }

            // 如果该制程集合已经存在则查询资料
            DesignCraftSet dcs = DesignCraftSet.dao.getCraftSetByName(kind, setname);
            if (dcs != null) {
                this.setMsg("制程集合已经存在");
                return false;
            }

            boolean result = false;

            DesignCraftSet t_dcs = new DesignCraftSet();

            String setId = Barcode.DS_CRAFT_SET.nextVal();

            result = t_dcs.set("ID", setId).set("NAME", setname).set("KIND", kind).save();
            if (!result) {
                this.setMsg("保存集合信息失败");
                return false;
            }

            // 读取指定模具的计划排程
            List<DesignScheduleInfo> dlist = DesignScheduleInfo.dao.getResumeScheduleInfo(resumeid);
            if (dlist.size() == 0) {
                this.setMsg("没有安排计划制程");
                return false;
            }

            DesignCraftList dcl = new DesignCraftList();

            for (DesignScheduleInfo dsi : dlist) {
                String craftid = StringUtils.parseString(dsi.getStr("CRAFTID"));
                int ranknum = ArithUtils.toInt(dsi.getNumber("RANKNUM"), -1);
                if (ranknum < 0) {
                    continue;
                }

                result = dcl.set("ID", Barcode.DS_CRAFT_LIST.nextVal()).set("SETID", setId).set("CRAFTID", craftid).set("RANKNUM", ranknum).save();
                if (!result) {
                    this.setMsg("保存集合信息失败");
                    return false;
                }
            }

            this.setMsg("添加制程集合成功");
            return true;
        }
        catch (Exception e) {
            this.setMsg("添加制程出现异常");
            return false;
        }
    }
}
