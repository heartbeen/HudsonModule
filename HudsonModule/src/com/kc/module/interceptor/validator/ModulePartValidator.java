package com.kc.module.interceptor.validator;

import com.jfinal.core.Controller;
import com.jfinal.validate.Validator;

public class ModulePartValidator extends Validator {

    @Override
    protected void validate(Controller c) {

        String key = getActionKey();
        String errorMessage = "您没有提交工件信息!";
        // 提交修模与设变工件信息
        if (key.indexOf("modifyExitsPart") > 0) {
            validateRequiredString("parts", "msg", errorMessage);

            return;
        }
    }

    @Override
    protected void handleError(Controller c) {
        c.setAttr("success", false);
        c.renderJson(new String[]{"success", "msg"});

    }

}
