package com.kc.module.dao;

import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.IAtom;

/**
 * 基础的IAtom类
 * 
 * @author ROCK
 * 
 */
public abstract class BaseIAtom implements IAtom {
    private Controller controller;
    private String msg;

    public Controller getController() {
        return controller;
    }

    public void setController(Controller controller) {
        this.controller = controller;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }
}
