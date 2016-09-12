package com.kc.module.interceptor.validator;

import com.jfinal.core.Controller;
import com.jfinal.validate.Validator;
import com.kc.module.utils.ConstUtils;

public class ModuleManageValidator extends Validator {

    @Override
    protected void validate(Controller c) {
        String key = getActionKey();
        String errorMessage = "您提交的数据不全!";

        if (key.indexOf("queryGuestFactory") > 0) {
            validateRequiredString("type", "msg", errorMessage);
            validateRequiredString("query", "msg", errorMessage);

            return;
        }

        // 验证提交的排程时间
        if (key.indexOf("estimateModuleCode") > 0) {
            validateRequiredString("mc.style", "msg", errorMessage);
            validateRequiredString("mc.guest", "msg", errorMessage);
            validateRequiredString("mc.guestId", "msg", errorMessage);
            validateRequiredString("mc.guestName", "msg", errorMessage);

            validateRegex("mc.num", ConstUtils.POSITIVE_INT, "msg", errorMessage);
            validateRegex("mc.moduleYear", ConstUtils.POSITIVE_INT, "msg", errorMessage);
            validateRegex("mc.moduleMonth", ConstUtils.POSITIVE_INT, "msg", errorMessage);

            return;
        }

        /**
         * 新模信息
         */
        if (key.indexOf("saveNewModuleData") > 0) {
            validateRequiredString("modules", "msg", errorMessage);
            return;
        }

        /**
         * 新模工件建立
         */
        if (key.indexOf("createModuleNewParts") > 0) {
            validateRequiredString("parts", "msg", errorMessage);
            return;
        }

        /**
         * 更新模具信息
         */
        if (key.indexOf("updateModuleIntroduce") > 0) {
            validateRequiredString("module", "msg", errorMessage);
            return;
        }
    }

    @Override
    protected void handleError(Controller c) {
        c.setAttr("success", false);
        c.renderJson(new String[]{"success", "msg"});
    }

}
