package com.kc.module.interceptor.validator;

import com.jfinal.core.Controller;
import com.jfinal.validate.Validator;

/**
 * 模具工件加工管理验证拦截器
 * 
 * @author xuwei
 * 
 */
public class ModuleProcessValidator extends Validator {

    @Override
    protected void validate(Controller c) {
        String key = getActionKey();

        // 读取本单位模具的工件信息
        if (key.indexOf("groupPartListInfo") > 0) {
            validateRequiredString("moduleResumeId", "msg", "您没有选择模具!");
            return;
        }
    }

    @Override
    protected void handleError(Controller c) {
        c.setAttr("success", false);
        c.renderJson(new String[]{"success", "msg"});
    }

}
