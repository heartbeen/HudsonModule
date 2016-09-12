package com.kc.module.transaction;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.shared.SharedFields;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.JsonUtils;
import com.kc.module.utils.StringUtils;

public class SaveDeviceClassficIAtom extends SqlTranscation {
    public static SaveDeviceClassficIAtom iAtom = new SaveDeviceClassficIAtom();
    public static int SQL_RESULT;

    @Override
    public boolean run() {
        try {
            String classfic = this.ctrl.getPara(this.ajaxAttr[0]);
            Map<?, ?>[] classficMap = JsonUtils.fromJsonStrToList(classfic);
            if (classficMap == null || classficMap.length == 0) {
                SQL_RESULT = 1;
                return (true);
            }
            List<Record> list = Db.find("SELECT SUBSTR(ID,5) CLASSID,NAME CLASSNAME FROM DEVICE_TYPE WHERE ID LIKE '0101__'");
            List<String> oriClassfic = new ArrayList<String>();
            // 获取种类同级的最大值
            int counter = 0;
            if (list != null) {
                for (Record row : list) {
                    int classid = Integer.valueOf(row.getStr("CLASSID"));
                    if (classid > counter) {
                        counter = classid;
                    }

                    String classname = row.getStr("CLASSNAME");
                    if (!oriClassfic.contains(classname)) {
                        oriClassfic.add(classname);
                    }
                }
            }

            Record record = null;
            // 将新的种类添加至服务器
            for (Map<?, ?> map : classficMap) {
                String classname = (map.get("classname") == null ? "" : map.get("classname")
                                                                           .toString());
                if (oriClassfic.contains(classname)) {
                    SQL_RESULT = -2;
                    return false;
                }
                counter++;
                record = new Record();
                record.set("ID", "0101" + StringUtils.leftPad(counter + "", 2, "0"))
                      .set("NAME", classname)
                      .set("CREATEDATE",
                           Timestamp.valueOf(DateUtils.getDateNow(SharedFields.DEFAULT_LONG_DATETIME_FORMAT)))
                      .set("CREATOR", "");

                boolean rs = Db.save("DEVICE_TYPE", record);
                if (!rs) {
                    SQL_RESULT = -1;
                    return false;
                }
            }

            SQL_RESULT = 1;
            return true;
        }
        catch (Exception e) {
            SQL_RESULT = -3;
            return (false);
        }
    }
}
