package com.kc.module.extract;

import java.sql.Timestamp;
import java.util.Enumeration;

import com.alibaba.druid.util.StringUtils;
import com.kc.module.base.Barcode;
import com.kc.module.dao.ExtractDao;
import com.kc.module.model.ModuleActionRecord;
import com.kc.module.utils.ControlUtils;
import com.kc.module.utils.DateUtils;

public class ModuleActionExtract extends ExtractDao {
    public String getMethodName() {
        return methodName;
    }

    public void setMethodName(String methodName) {
        this.methodName = methodName;
    }

    private String methodName;
    private int maxParaLength;
    public int allParaLength;

    public int getMaxParaLength() {
        return maxParaLength;
    }

    public void setMaxParaLength(int maxParaLength) {
        this.maxParaLength = maxParaLength;
    }

    public int getAllParaLength() {
        return allParaLength;
    }

    public void setAllParaLength(int allParaLength) {
        this.allParaLength = allParaLength;
    }

    @Override
    public Object extract() {

        String controlName = this.getController().getClass().getName();
        String userid = ControlUtils.getEmpBarCode(this.getController());
        Timestamp acttime = DateUtils.getNowStampTime();

        StringBuilder builder = new StringBuilder("{");
        Enumeration<String> paraNames = this.getController().getParaNames();
        while (paraNames.hasMoreElements()) {
            String cName = paraNames.nextElement();
            String cValue = this.getController().getPara(cName);
            if (!StringUtils.isEmpty(cValue) && cValue.length() > this.maxParaLength) {
                cValue = cValue.substring(0, this.getMaxParaLength());
            }

            builder.append(cName).append(":").append(cValue).append(",");
        }

        builder.append("}");

        return new ModuleActionRecord().set("ID", Barcode.MD_ACTION_RECORD.nextVal())
                                       .set("CONTROLLER", controlName)
                                       .set("METHOD", this.methodName)
                                       .set("PARAMS", builder.toString())
                                       .set("EMPID", userid)
                                       .set("ACTIONTIME", acttime)
                                       .save();

    }
}
