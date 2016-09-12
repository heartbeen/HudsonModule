package com.kc.module.transaction;

import java.util.ArrayList;
import java.util.List;

import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.IAtom;

public class SqlTranscation implements IAtom {
    // 用于存放重复模具讯息的返回List
    public List<String> list;
    // AJAX资料暂存
    public String[] ajaxAttr;
    // 设置控制器
    public Controller ctrl;

    public List<String> getList() {
        return list;
    }

    public void setAjaxAttr(String[] ajaxAttr) {
        this.ajaxAttr = ajaxAttr;
    }

    public void setController(Controller c) {
        this.ctrl = c;
    }

    public SqlTranscation() {
        list = new ArrayList<String>();
    }

    public boolean runTx(SqlTranscation iAtom) {
        return Db.tx(iAtom);
    }

    @Override
    public boolean run() {
        return false;
    }

}
