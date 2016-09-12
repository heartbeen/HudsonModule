package com.kc.module.interceptor.validator;

import com.jfinal.core.Controller;
import com.jfinal.validate.Validator;

/**
 * 模具测量模块验证
 * 
 * @author David
 * @email xuweissh@163.com
 * 
 */
public class SystemValidator extends Validator {

    @Override
    protected void validate(Controller c) {
        String key = getActionKey();

        // 提交修模与设变工件信息
        if (key.indexOf("cropMeasurePicture") > 0) {
            validateRequiredString("cmf.imgType", "msg", "没有图片类型");
            validateRequiredString("cmf.imgSrc", "msg", "没有图片数据");
            validateInteger("cmf.x", 0, 4000, "msg", "坐标超出图片范围");
            validateInteger("cmf.y", 0, 4000, "msg", "坐标超出图片范围");
            validateInteger("cmf.width", 1, 4000, "msg", "裁剪图片宽度不正确");
            validateInteger("cmf.height", 1, 4000, "msg", "裁剪图片高度不正确");

            return;
        }

        // 查询三次元测量图片
        if (key.indexOf("queryPartThreeMeasure") > 0) {
            validateRequiredString("partBarcode", "msg", "没有选择工件");
            return;
        }

        // 删除三次元测量图片
        if (key.indexOf("deleteMeasurePicture") > 0) {
            validateRequiredString("id", "msg", "没有选择测量图片");
            return;
        }

    }

    @Override
    protected void handleError(Controller c) {
        c.setAttr("success", false);
        c.renderJson(new String[]{"success", "msg"});

    }

}
