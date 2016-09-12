package com.kc.module.model;

import java.util.List;

import com.jfinal.kit.StringKit;
import com.jfinal.plugin.activerecord.Db;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.StringUtils;

public class DeviceType extends ModelFinal<DeviceType> {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;
    public static DeviceType dao = new DeviceType();

    public List<DeviceType> getDeviceType(String type) {
        StringBuilder builder = new StringBuilder("SELECT ID AS TYPEID,NAME FROM DEVICE_TYPE WHERE 1=1");
        if (StringKit.notBlank(type)) {
            builder.append(" AND ID LIKE '");
            builder.append(type);
            builder.append("%'");
        }
        return this.find(builder.toString());
    }

    /**
     * 新增设备种类 use(用途01为金型服务)
     * 
     * @param use
     * @param type
     * @param name
     * @return
     */
    public int addDeviceType(String use, String type, String name) {
        StringBuilder builder = new StringBuilder("SELECT MAX(TO_NUMBER(ID)) MID FROM DEVICE_TYPE WHERE ID LIKE '");
        builder.append(use + type);
        builder.append("%'");
        List<DeviceType> maxRecord = this.find(builder.toString());
        builder = new StringBuilder("INSERT INTO DEVICE_TYPE VALUES('");
        if (maxRecord == null) {
            builder.append(use + type + "01");
        } else {
            if (maxRecord.get(0).get("MID") != null) {
                int newid = Integer.valueOf(maxRecord.get(0).get("MID").toString()) + 1;
                String newStr = StringUtils.leftPad(newid + "", 6, "0");
                builder.append(newStr);
            } else {
                builder.append(use + type + "01");
            }
        }

        builder.append("','");
        builder.append(name);
        builder.append("',to_date('");
        builder.append(DateUtils.getDateNow("yyyy-MM-dd HH:mm:ss"));
        builder.append("','yyyy-MM-dd HH24:mi:ss'),'')");

        return Db.update(builder.toString());
    }
}
