package com.kc.module.transaction;

import java.sql.SQLException;
import java.util.List;

import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.IAtom;
import com.kc.module.base.Barcode;
import com.kc.module.model.ModuleEstSchedule;
import com.kc.module.utils.StringUtils;

/**
 * 新增工艺排程
 * 
 * @author Rock
 * 
 */
public class CreateCraftPlanIAtom implements IAtom {
    private Controller controller;
    private Object schId;
    private String msg;

    public String getMsg() {
        return msg;
    }

    public void setMsg(String error) {
        this.msg = error;
    }

    public Controller getController() {
        return controller;
    }

    public void setController(Controller controller) {
        this.controller = controller;
    }

    public Object getSchId() {
        return schId;
    }

    public void setSchId(Object schId) {
        this.schId = schId;
    }

    @Override
    public boolean run() throws SQLException {
        try {
            boolean success = true;
            boolean isEnd = this.getController().getParaToBoolean("isEnd");

            String partBarCode = this.getController().getPara("partBarCode");// 工件汇总条码
            // 如果部件号为空,则不允许添加排程讯息
            if (StringUtils.isEmpty(partBarCode)) {
                this.setMsg("没有选择要操作的零部件!");
                return false;
            }

            String[] partListIds = (this.getController().getPara("partListId") + partBarCode).split(";");
            ModuleEstSchedule mes = this.getController().getModel(ModuleEstSchedule.class, "mes");

            // 先移动位置
            if (!isEnd) {
                success = planMoveLocation(mes.get("MODULERESUMEID"), partListIds, mes.get("RANKNUM"), 1);
            }

            // 再新增工艺
            if (success) {
                ModuleEstSchedule me;
                String parentId = Barcode.MODULE_EST_SCHEDULE.nextVal(true);

                for (String partId : partListIds) {
                    me = new ModuleEstSchedule();

                    if (partId.equals(partBarCode)) {
                        me.set("id", parentId);
                        this.setSchId(me.get("id"));
                    } else {
                        me.set("id", Barcode.MODULE_EST_SCHEDULE.nextVal());
                        me.set("parentid", parentId);
                    }

                    me.set("moduleResumeId", mes.get("moduleResumeId"));
                    me.set("partId", partId);
                    me.set("craftId", mes.get("craftId"));
                    me.set("rankNum", mes.get("rankNum"));

                    success = success && me.save();
                }

            }

            this.setMsg("添加工艺成功!");
            return success;
        }
        catch (Exception e) {
            this.setMsg("新增工艺时出现异常,请重试!");
            return false;
        }
    }

    /**
     * 新增工艺排程之后的排程往前或往后移动一个位置
     * 
     * @param mri
     *            模具加工履历ID
     * @param mplb
     *            工件清单ID
     * @param direction
     *            前:-1 或后: 1
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
