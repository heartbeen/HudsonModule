package com.kc.module.transaction;

import java.sql.SQLException;

import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.IAtom;
import com.kc.module.model.form.AddTaskForm;
import com.kc.module.utils.JsonUtils;

public class AddTaskInfoIAtom implements IAtom {

    private Controller controller;

    public Controller getController() {
        return controller;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    private String error;

    public void setController(Controller controller) {
        this.controller = controller;
    }

    @Override
    public boolean run() throws SQLException {
        String data = this.getController().getPara("data");

        AddTaskForm form = JsonUtils.josnToBean(data, AddTaskForm.class);

        if (form == null) {
            this.setError("任务资料不完整或者不正确!");
            return false;
        }

        return false;
    }

}
