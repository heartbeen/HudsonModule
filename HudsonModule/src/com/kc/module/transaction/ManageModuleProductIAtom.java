package com.kc.module.transaction;

import java.sql.SQLException;
import java.sql.Timestamp;

import com.kc.module.base.Barcode;
import com.kc.module.dao.BaseIAtom;
import com.kc.module.model.ModuleProductInfo;
import com.kc.module.utils.ControlUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.StringUtils;

public class ManageModuleProductIAtom extends BaseIAtom {

    @Override
    public boolean run() throws SQLException {
        String modulebarcode = this.getController().getPara("modulebarcode");
        if (StringUtils.isEmpty(modulebarcode)) {
            this.setMsg("没有任何模具讯息");
            return false;
        }

        String id = this.getController().getPara("id");
        String empbarcode = ControlUtils.getEmpBarCode(this.getController());
        Timestamp stampNow = DateUtils.getNowStampTime();

        String productcode = this.getController().getPara("productcode");

        if (!StringUtils.isRegex("^(\\w|[-+*\\/()])+$", productcode)) {
            this.setMsg("客户番号不合法");
            return false;
        }

        String productname = StringUtils.trimBlank(this.getController().getPara("productname"), "\t|\r|\n");

        ModuleProductInfo mpi = new ModuleProductInfo();
        boolean result = false;
        if (StringUtils.isEmpty(id)) {

            ModuleProductInfo query = ModuleProductInfo.dao.getProductInfoByModuleInfo(modulebarcode, productcode);
            if (query != null) {
                this.setMsg("该客户番号的产品已经存在了");
                return false;
            }

            result = mpi.set("ID", Barcode.MD_PRODUCT_INFO.nextVal())
                        .set("MODULEBARCODE", modulebarcode)
                        .set("PRODUCTCODE", productcode)
                        .set("PRODUCTNAME", productname)
                        .set("QUANTITY", getParaToInt("quantity", 1))
                        .set("EMPID", empbarcode)
                        .set("ACTIONTIME", stampNow)
                        .save();
            if (!result) {
                this.setMsg("添加产品讯息失败");
                return false;
            }

            this.setMsg("添加产品信息成功");
        } else {
            result = mpi.set("ID", id)
                        .set("PRODUCTCODE", productcode)
                        .set("PRODUCTNAME", productname)
                        .set("QUANTITY", getParaToInt("quantity", 1))
                        .update();
            if (!result) {
                this.setMsg("更新产品讯息失败");
                return false;
            }

            this.setMsg("更新产品信息成功");
        }

        return true;
    }

    /**
     * 获取产品取数
     * 
     * @param param
     * @param def
     * @return
     */
    private int getParaToInt(String param, int def) {
        Object para = this.getController().getPara(param);
        if (para != null) {
            int count = this.getController().getParaToInt(param);
            return count < 1 ? 1 : count;
        } else {
            return def;
        }
    }

}
