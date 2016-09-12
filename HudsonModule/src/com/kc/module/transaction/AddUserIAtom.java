package com.kc.module.transaction;

import java.sql.SQLException;

import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.IAtom;
import com.kc.module.base.Barcode;
import com.kc.module.model.Employee;
import com.kc.module.model.form.AddUserForm;
import com.kc.module.utils.JsonUtils;
import com.kc.module.utils.StringUtils;

public class AddUserIAtom implements IAtom {

    public Controller getController() {
        return controller;
    }

    public void setController(Controller controller) {
        this.controller = controller;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    private Controller controller;
    private String error;

    @Override
    public boolean run() throws SQLException {
        try {
            AddUserForm user = JsonUtils.josnToBean(this.controller.getPara("data"), AddUserForm.class);
            if (user == null) {
                this.setError("没有任何有效的用户讯息!");
                return false;
            }

            if (StringUtils.isEmpty(user.getWorknumber())) {
                this.setError("用户工号不能为空!");
                return false;
            }

            if (!StringUtils.isRegex("^\\w{3,10}$", user.getWorknumber())) {
                this.setError("用户工号必须为3-10位的字母数字组成!");
                return false;
            }

            if (Employee.dao.isExsit(user.getWorknumber())) {
                this.setError("用户工号已经存在了!");
                return false;
            }

            user.setId(Barcode.EMP.nextVal());

            boolean result = user.save();
            if (!result) {
                this.setError("保存用户讯息失败!");
            } else {
                this.setError("用户讯息保存成功!");
            }

            return result;
        }
        catch (Exception e) {
            this.setError("保存用户讯息异常!");
            return false;
        }
    }

}
