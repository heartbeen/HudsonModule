package com.kc.module.transaction;

import com.kc.module.base.Barcode;
import com.kc.module.dao.BaseIAtom;
import com.kc.module.model.DesignCraftInfo;
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.StringUtils;

public class ManageCraftInfoIAtom extends BaseIAtom {
    @Override
    public boolean run() {
        try {
            // 制程ID号
            String id = this.getController().getPara("id");

            // 制程代号
            String craftcode = this.getController().getPara("craftcode");
            if (StringUtils.isEmpty(craftcode)) {
                this.setMsg("制程编号不能为空");
                return false;
            }

            // 制程名称
            String craftname = this.getController().getPara("craftname");
            if (StringUtils.isEmpty(craftname)) {
                this.setMsg("制程名称不能为空");
                return false;
            }

            String stateid = this.getController().getPara("stateid");
            if (StringUtils.isEmpty(stateid)) {
                this.setMsg("制程状态不能为空");
                return false;
            }

            // 设置制程类型
            int kind = this.getController().getParaToInt("kind");

            // 获取制程单位费用
            double unitcost = ArithUtils.round(ArithUtils.parseDouble(this.getController().getPara("unitcost"), 0), 1);

            DesignCraftInfo dci = new DesignCraftInfo();
            dci.set("CRAFTCODE", craftcode).set("CRAFTNAME", craftname).set("UNITCOST", unitcost).set("KIND", kind).set("STATUS", stateid);

            boolean result = false;
            // 如果唯一号不为空为新增制程否则为更新制程
            if (StringUtils.isEmpty(id)) {
                // 重新加载数据库表中的索引值
                dci.set("ID", Barcode.DS_CRAFT_INFO.nextVal());
                result = dci.save();
            } else {
                dci.set("ID", id);
                result = dci.update();
            }

            if (!result) {
                this.setMsg("保存制程信息失败");
                return false;
            }

            return (true);
        }
        catch (Exception e) {
            this.setMsg("保存制程出现异常");
            return false;
        }
    }

}
