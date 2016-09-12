package com.kc.module.transaction;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import com.kc.module.dao.BaseIAtom;
import com.kc.module.model.ModuleEstSchedule;

/**
 * 清除计划排程
 * 
 * @author ASUS
 * 
 */
public class RemoveCraftPlanIAtom extends BaseIAtom {

    @Override
    public boolean run() throws SQLException {
        boolean success = true;
        try {
            List<ModuleEstSchedule> list = ModuleEstSchedule.dao.findCraftPlanById(this.getController().getPara("id"));
            List<Object> mplb = new ArrayList<Object>();

            for (ModuleEstSchedule m : list) {
                success = success && m.delete();
                mplb.add(m.get("PARTID"));
            }

            if (success) {
                success = planMoveLocation(list.get(0).get("MODULERESUMEID"), mplb.toArray(), list.get(0).get("RANKNUM"), -1);
            }

            this.setMsg("成功删除加工工艺!");
            return success;
        }
        catch (Exception e) {
            this.setMsg("删除加工工艺失败!");
            return false;
        }
    }

    /**
     * 新增工艺排程之后的排程往前或往后移动一个位置
     * 
     * @param mri
     * @param mplb
     * @param direction
     * 
     */
    private boolean planMoveLocation(Object mri, Object[] mplb, Object index, int direction) {
        boolean success = true;

        List<ModuleEstSchedule> list = ModuleEstSchedule.dao.getFollowUpPlan(mri, mplb, index);

        for (ModuleEstSchedule m : list) {
            m.set("RANKNUM", m.getNumber("RANKNUM").intValue() + direction);
            success = success && m.update();

            if (!success) {
                return false;
            }
        }

        return success;

    }

}
