package com.kc.module.transaction;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.IAtom;
import com.kc.module.base.Barcode;
import com.kc.module.model.ModuleCraftClassify;
import com.kc.module.utils.StringUtils;

/**
 * 设定不同作用下指定不同的工艺
 * 
 * @author ASUS
 * 
 */
public class AddCraftClassifyIAtom implements IAtom {
    public Controller getController() {
        return controller;
    }

    public void setController(Controller controller) {
        this.controller = controller;
    }

    public int getFlag() {
        return flag;
    }

    public void setFlag(int flag) {
        this.flag = flag;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    private Controller controller;
    private int flag;
    private String msg;

    @Override
    public boolean run() throws SQLException {
        // 获取工艺集合
        String craftset = this.getController().getPara("craftset");
        // 设置工艺的具体类型
        this.setFlag(this.getController().getParaToInt("flag"));
        // 获取需要的工艺种类
        List<String> craftList = new ArrayList<String>();
        if (!StringUtils.isEmpty(craftset)) {
            String[] crafts = craftset.split(",", -1);
            for (String ct : crafts) {
                craftList.add(ct);
            }
        }

        // 删除指定类型的所有工件
        boolean result = deleteAllByTypeId(this.getFlag());
        if (!result) {
            this.setMsg("设置工艺资料失败!");
            return false;
        }

        ModuleCraftClassify mcc = null;
        for (String item : craftList) {
            mcc = new ModuleCraftClassify();
            result = mcc.set("ID", Barcode.MD_CRAFT_CLASSIFY.nextVal()).set("CRAFTID", item).set("CLASSID", this.getFlag()).save();
            if (!result) {
                this.setMsg("设置工艺资料失败!");
                return false;
            }
        }

        return true;
    }

    /**
     * 清空MD_CRAFT_CLASSIFY工艺表中指定类型的所有工艺资料
     * 
     * @param typeid
     * @return
     */
    private boolean deleteAllByTypeId(int typeid) {
        int result = Db.update("DELETE FROM MD_CRAFT_CLASSIFY WHERE CLASSID = ?", typeid);
        return (result > -1);
    }

}
