package com.kc.module.dao;

import com.jfinal.core.Controller;

/**
 * 提取关键区域
 * 
 * @author ASUS
 * 
 */
public abstract class ExtractDao {
    private Controller controller;

    public Controller getController() {
        return controller;
    }

    public void setController(Controller controller) {
        this.controller = controller;
    }
    
    public abstract Object extract();
}
