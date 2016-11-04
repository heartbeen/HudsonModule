package com.kc.module.interceptor.validator;

import com.jfinal.core.Controller;
import com.jfinal.validate.Validator;
import com.kc.module.utils.ConstUtils;

/**
 * 工艺排程
 * 
 * @author Administrator
 * 
 */
public class CraftPlanValidator extends Validator {

    @Override
    protected void validate(Controller c) {
        String key = getActionKey();
        String errorMessage = "您提交的数据不全!";

        // 查询工艺集合验证
        if (key.indexOf("craftSet") > 0) {
            validateRequiredString("condition", "msg", errorMessage);
            validateRegex("setMethod", "findCraftSetName|findCraftSetContent", "msg", errorMessage);

            return;
        }

        // 建立工艺集合
        if (key.indexOf("createCraftSet") > 0) {
            validateRegex("type", "root|child", "msg", errorMessage);
            return;
        }

        // 删除工艺集合
        if (key.indexOf("deleteCraftSet") > 0) {
            validateRequiredString("setId", "msg", errorMessage);
            validateRegex("ranknum", ConstUtils.INT_OR_ZERO_REGEX, "msg", errorMessage);
            validateRegex("type", "root|child", "msg", errorMessage);

            return;
        }

        if (key.indexOf("craftPlanGantt") > 0) {
            validateRequiredString("mes.planId", "msg", errorMessage);
            validateRequiredString("mes.moduleResumeId", "msg", errorMessage);
            return;
        }

        // 验证工时
        if (key.indexOf("evaluateTime") > 0) {
            validateRequiredString("mes.id", "msg", errorMessage);
            // validateInteger("mes.evaluate", 0, 9999999, "msg", errorMessage);
            return;
        }
    }

    protected void validateMultiple(Controller c, String errorKey, String errorMessage, String... fields) {

        String value;
        for (String r : fields) {
            value = c.getPara(r);
            if (value != null && !"".equals(value.trim())) {
                return;
            }
        }
        addError(errorKey, errorMessage);
    }

    /**
     * 验证指定的字段值是否包在所给定的值数组内
     * 
     * @param c
     * @param field
     *            字段
     * @param errorKey
     * @param errorMessage
     * @param include
     *            值数组
     */
    protected void validateInclude(Controller c, String field, String errorKey, String errorMessage, String... include) {

        String value = c.getPara(field);
        if (value == null || "".equals(value.trim())) {
            addError(errorKey, errorMessage);
            return;
        }

        for (String r : include) {
            if (r.equals(value)) {
                return;
            }
        }

        addError(errorKey, errorMessage);

    }

    @Override
    protected void handleError(Controller c) {

        c.setAttr("success", false);
        c.renderJson();

    }

}
