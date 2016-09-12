package com.kc.module.model;

import java.util.List;

import com.kc.module.base.Barcode;
import com.kc.module.utils.StringUtils;

public class MeasureTools extends ModelFinal<MeasureTools> {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;
    public static MeasureTools dao = new MeasureTools();

    public List<MeasureTools> getMeasureToolInfo() {
        return this.find("SELECT ID AS TOOLID,CODE AS TOOLCODE,NAME AS TOOLNAME FROM MEASURETOOLS ORDER BY ID");
    }

    public int AddMeasureTools(String code, String name) {
        // 如果代号为空,则返回
        if (StringUtils.isEmpty(code)) {
            return -1;
        }

        // 工具代号只能是1-5个字符类型
        String pattern = "^[A-Z]{1,5}$";
        // 将代码转换为大写
        String upperCode = code.toUpperCase();
        if (!upperCode.matches(pattern)) {
            return -2;
        }

        // 查询工具表是否含有该工号代号
        List<MeasureTools> list = this.find("SELECT * FROM MEASURETOOLS WHERE CODE = '"
                                            + code
                                            + "'");

        // 如果查询的结果不包含该代号,则进行保存
        if (list == null || list.size() == 0) {
            MeasureTools tool = new MeasureTools();
            boolean rs = tool.set("ID", Barcode.MEASURE_TOOLS.nextVal())
                             .set("NAME", name)
                             .set("CODE", code)
                             .save();
            // 如果保存失败,则提醒
            if (!rs) {
                return -4;
            }

            return 1;
        } else {
            return -3;
        }

    }
}
