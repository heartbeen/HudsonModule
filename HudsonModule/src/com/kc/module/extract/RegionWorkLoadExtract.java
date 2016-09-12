package com.kc.module.extract;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.dao.ExtractDao;
import com.kc.module.model.form.WorkLoadForm;

public class RegionWorkLoadExtract extends ExtractDao {

    @Override
    public Object extract() {

        StringBuilder builder = new StringBuilder();

        // 分类ID号
        String classid = this.getController().getPara("classid");
        // 相关类型COLUMN
        String typeid = this.getController().getPara("typeid");
        String typename = this.getController().getPara("typename");
        // 开机状态ID
        String stateid = this.getController().getPara("stateid");

        builder.append("SELECT RD.ID AS REGIONID, DD.CRAFTID, DD.STATEID, RD.NAME AS REGIONNAME, MC.CRAFTNAME, DI.MACLOAD ");
        builder.append("FROM REGION_DEPART_CLASSIFY RDC LEFT JOIN REGION_DEPART RD ON RDC.DEPARTID = RD.ID ");
        builder.append("LEFT JOIN DEVICE_DEPART DD ON RD.ID = DD.PARTID LEFT JOIN DEVICE_INFO DI ON DD.DEVICEID = DI.ID ");
        builder.append("LEFT JOIN MD_CRAFT MC ON DD.CRAFTID = MC.ID WHERE RDC.CLASSID = ? AND DI.ISVIRTUAL = ?");

        List<Record> querys = Db.find(builder.toString(), classid, 0);
        // 设置机台类型负荷
        Map<String, WorkLoadForm> map = new HashMap<String, WorkLoadForm>();

        for (Record record : querys) {
            // 类型ID
            String m_typeid = record.getStr(typeid);
            // 类型名称
            String m_typename = record.getStr(typename);
            // 机台状态
            String m_stateid = record.getStr("STATEID");

            WorkLoadForm workload = null;

            if (map.containsKey(m_typename)) {
                workload = map.get(m_typename);
            } else {
                workload = new WorkLoadForm();

                workload.setTypeId(m_typeid);
                workload.setTypeName(m_typename);

                map.put(m_typename, workload);
            }

            workload.setTotalCount(workload.getTotalCount() + 1);

            if (stateid.equals(m_stateid)) {
                workload.setStartCount(workload.getStartCount() + 1);
            } else {
                workload.setStopCount(workload.getStopCount() + 1);
            }
        }

        // List<WorkLoad> array = new ArrayList<WorkLoad>();
        // for (String key : map.keySet()) {
        // array.add(map.get(key));
        // }

        return map;
    }
}
