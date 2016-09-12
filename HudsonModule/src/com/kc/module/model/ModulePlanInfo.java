package com.kc.module.model;

import com.kc.module.databean.ResultBean;

public class ModulePlanInfo extends ModelFinal<ModulePlanInfo> {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;
    public static ModulePlanInfo dao = new ModulePlanInfo();

    /**
     * 获取某套模具指定种类的金型计划
     * 
     * @param kind
     * @return
     */
    public ResultBean getModulePlanResultByKind(String modulebarcode, int kind) {
        ModulePlanInfo ml = getModulePlanInfoByKind(modulebarcode, kind);
        // 如果查询结果为空,则表示还未安排模具金型计划
        if (ml == null) {
            ml = new ModulePlanInfo();
            ml.set("MODULEBARCODE", modulebarcode).set("KIND", kind);
        }

        ResultBean resultBean = new ResultBean();
        resultBean.setSuccess(true);
        resultBean.setData(ml);

        return resultBean;
    }

    /**
     * 获取某套模具指定种类的金型计划
     * 
     * @param modulebarcode
     * @param kind
     * @return
     */
    public ModulePlanInfo getModulePlanInfoByKind(String modulebarcode, int kind) {
        return this.findFirst("SELECT * FROM MD_PLAN_INFO WHERE MODULEBARCODE = ? AND KIND = ?", modulebarcode, kind);
    }
}
