package com.kc.module.transaction;

import java.sql.SQLException;

import com.jfinal.plugin.activerecord.Db;
import com.kc.module.dao.BaseIAtom;

/**
 * 删除制程集合
 * 
 * @author ASUS
 * 
 */
public class DeleteDeviseCraftSetIAtom extends BaseIAtom {

    @Override
    public boolean run() throws SQLException {
        try {
            // 制程集合ID
            String setId = this.getController().getPara("setid");

            // 删除DS_CRAFT_LIST表中的集合制程
            int result = Db.update("DELETE FROM DS_CRAFT_LIST WHERE SETID = ?", setId);
            if (result < 0) {
                this.setMsg("删除制程集合失败");
                return false;
            }

            // 删除DS_CRAFT_SET表中的集合信息
            boolean res = Db.deleteById("DS_CRAFT_SET", setId);
            if (!res) {
                this.setMsg("删除制程集合失败");
                return false;
            }

            return true;
        }
        catch (Exception e) {
            this.setMsg("删除制程集合失败");
            return false;
        }
    }

}
