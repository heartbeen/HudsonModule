package com.kc.module.interceptor.validator;

import com.jfinal.core.Controller;
import com.jfinal.validate.Validator;

public class ModuleBaseValidator extends Validator {
    @Override
    protected void validate(Controller c) {
        String key = getActionKey();

        // 新增厂商资料
        if (key.indexOf("insertFactory") > 0) {
            validateRequiredString("factory", "msg", "您没有提交模具资料!");
            return;
        }

        if (key.indexOf("insertRole") > 0) {
            validateRequiredString("role.roleId", "msg", "没有角色Id");
            validateRequiredString("role.roleName", "msg", "没有角色名称");
            return;
        }
        // 更新厂商资料
        if (key.indexOf("updateFactory") > 0) {
            validateRequiredString("factory", "msg", "您没有提交模具资料!");
            return;
        }

        // 删除厂商资料
        if (key.indexOf("deleteFactory") > 0) {
            validateRequiredString("id", "msg", "您没有选择模具!");
            validateRegex("factoryType", "^[123]$", "msg", "您没有选择模具!");
            return;
        }

        if (key.indexOf("insertAccountInfo") > 0) {
            validateRequiredString("account.username", "msg", "没有用户名");
            validateRequiredString("account.password", "msg", "没有设置密码");
            validateRequiredString("account.roleId", "msg", "没有设置角色");
            validateRequiredString("account.valid", "msg", "没有设置账号是否有效");

            return;
        }

        // 新增功能
        if (key.indexOf("insertAuthority") > 0) {
            validateRequiredString("auth.authName", "msg", "没有功能的名称");
            validateRequiredString("auth.userPathName", "msg", "没有路径名称");
            validateRequiredString("auth.authType", "msg", "没有功能的类型");
            validateRequiredString("auth.moduleId", "msg", "没有功能所属的模块号");
            return;
        }

        if (key.indexOf("insertRolePos") > 0) {
            validateRequiredString("roleId", "msg", "没有角色的ID号");
            validateRequiredString("authId", "msg", "没有权限ID");
            return;
        }

        // 删除账号信息
        if (key.indexOf("deleteAccountInfo") > 0) {
            validateRequiredString("accountId", "msg", "没有选择要删除的账户");
            validateRegex("allInfo", "true|false", "msg", "删除条件错误");
            return;
        }
    }

    @Override
    protected void handleError(Controller c) {
        c.setAttr("success", false);
        c.renderJson();
    }

}
