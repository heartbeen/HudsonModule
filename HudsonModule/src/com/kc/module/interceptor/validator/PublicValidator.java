package com.kc.module.interceptor.validator;

import com.jfinal.core.Controller;
import com.jfinal.validate.Validator;

public class PublicValidator extends Validator {

    @Override
    protected void validate(Controller c) {
        String actionKey = getActionKey();

        // 得到各种加工状态下的模具工号
        if (actionKey.indexOf("moduleCodeFromState") > 0) {
            validateInteger("isFinish", 0, 1, "msg", "超出范围");
            validateInteger("schType", 0, 1, "msg", "没有这个排程状态");
            return;
        }

        if (actionKey.indexOf("moduleResumePart") > 0) {
            validateRequired("moduleResumeId", "msg", "[]");
            return;
        }

        if (actionKey.indexOf("moduleForResume") > 0) {
            validateRegex("isNew", "^true$|^false$", "msg", "");
            return;
        }

        /**
         * 查询条件
         */
        if (actionKey.indexOf("queryModulePartDeadLine") > 0) {
            validateRegex("query", "^[1-4]{1}$", "msg", "没有指定查询项目");
            validateRequiredString("time", "msg", "没有工作时间");
            return;
        }

    }

    @Override
    protected void handleError(Controller c) {

        c.setAttr("success", false);
        c.renderJson(new String[]{"success", "msg"});

    }

}
