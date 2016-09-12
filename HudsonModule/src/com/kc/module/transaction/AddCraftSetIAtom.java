package com.kc.module.transaction;

import java.sql.SQLException;
import java.util.List;

import com.kc.module.base.Barcode;
import com.kc.module.dao.BaseIAtom;
import com.kc.module.model.ModuleCraftSet;

public class AddCraftSetIAtom extends BaseIAtom {

    private ModuleCraftSet set;
    private String itemId;

    public String getItemId() {
        return itemId;
    }

    public void setItemId(String itemId) {
        this.itemId = itemId;
    }

    public void setSet(ModuleCraftSet set) {
        this.set = set;
    }

    @Override
    public boolean run() throws SQLException {
        try {
            boolean success = false;

            String id = Barcode.MODULE_CRAFT_SET.nextVal();
            set.set("ID", id);
            this.setItemId(id);

            // 增加工艺集合子排程
            if (this.getController().getPara("type").equals("child")) {
                int insertNum = set.getNumber("ranknum").intValue();
                String setId = set.getStr("SETID");

                List<ModuleCraftSet> craftSet = ModuleCraftSet.dao.getCraftSet(setId);

                for (int i = 0; i < craftSet.size(); i++) {
                    ModuleCraftSet msc = craftSet.get(i);

                    int rownum = 0;

                    if (i < insertNum) {
                        rownum = i;
                    } else {
                        rownum = i + 1;
                    }

                    success = msc.set("ranknum", rownum).update();
                    if (!success) {
                        return success;
                    }
                }
            }

            return set.save();
        }
        catch (Exception e) {
            return false;
        }
    }

}
