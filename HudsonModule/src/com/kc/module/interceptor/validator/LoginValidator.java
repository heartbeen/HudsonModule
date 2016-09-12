package com.kc.module.interceptor.validator;

import com.jfinal.core.Controller;
import com.jfinal.validate.Validator;

public class LoginValidator extends Validator {

    @Override
    protected void validate(Controller c) {

        validateRequiredString("userName", "msg", "用户名或密码不能为空!");
        validateRequiredString("localdata", "msg", "用户名或密码不能为空!");
        String password = c.getPara("password");

        if (password != null
            && (password.equals("D41D8CD98F00B204E9800998ECF8427E") || password.trim().length() == 0)) {
            addError("msg", "用户名或密码不能为空!");
        }

    }

    @Override
    protected void handleError(Controller c) {
        c.setAttr("success", false);

        c.renderJson(new String[]{"success", "msg"});
    }

}
