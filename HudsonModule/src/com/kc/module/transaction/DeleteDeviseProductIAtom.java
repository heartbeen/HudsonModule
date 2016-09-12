package com.kc.module.transaction;

import java.sql.SQLException;

import com.kc.module.dao.BaseIAtom;
import com.kc.module.model.ModuleProductInfo;
import com.kc.module.utils.FileUtils;
import com.kc.module.utils.StringUtils;

/**
 * 删除模具产品信息
 * 
 * @author ASUS
 * 
 */
public class DeleteDeviseProductIAtom extends BaseIAtom {

    @Override
    public boolean run() throws SQLException {
        try {
            String id = this.getController().getPara("id");

            ModuleProductInfo mpi = ModuleProductInfo.dao.findById(id);
            // 获取图片路径
            String imagepath = mpi.getStr("IMAGEPATH");
            // 如果存在图片路径删除图片
            if (!StringUtils.isEmpty(imagepath)) {
                String root = this.getController().getRequest().getSession().getServletContext().getRealPath("/");
                String realpath = root + imagepath;
                // 删除图片
                FileUtils.delFile(realpath);
            }

            // 删除数据库中的图片讯息
            boolean result = mpi.delete();
            if (!result) { 
                this.setMsg("删除模具产品信息失败");
                return false;
            }

            return (true);
        }
        catch (Exception e) {
            this.setMsg("删除模具产品信息异常");
            return false;
        }
    }
}
