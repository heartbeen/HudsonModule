package com.kc.module.extract;

import java.util.Iterator;
import java.util.List;
import java.util.Map;

import com.kc.module.dao.ExtractDao;
import com.kc.module.model.ProjectModule;
import com.kc.module.utils.ControlUtils;
import com.kc.module.utils.DataUtils;

public class MainProjectExtract extends ExtractDao {

    @Override
    public Object extract() {

        String roleId = ControlUtils.getRoleId(this.getController());
        String projectId = this.getController().getPara("projectId");

        StringBuilder json = new StringBuilder();
        List<ProjectModule> list = ProjectModule.dao.findProjectFunction(roleId, projectId, 0);

        Map<String, List<ProjectModule>> map = DataUtils.moduleClassific(list, "name");

        list = null;
        String key;

        Iterator<String> keys = map.keySet().iterator();
        Iterator<ProjectModule> records;
        ProjectModule r;
        String[] fields = null;
        String[] tmp;

        json.append("{\"subproject\":[");

        while (keys.hasNext()) {
            key = keys.next();
            tmp = key.split(";");

            json.append("{").append("\"name\":\"").append(tmp[0]).append("\",");
            json.append("\"iconcls\":\"").append(tmp[1]).append("\",");
            json.append("\"children\":[");

            records = map.get(key).iterator();
            while (records.hasNext()) {
                json.append("{");
                r = records.next();
                fields = fields == null ? r.getAttrNames() : fields;

                for (int i = 0; i < fields.length; i++) {
                    json.append("\"").append(fields[i].toLowerCase()).append("\":\"");
                    json.append(r.get(fields[i]) == null ? "" : r.get(fields[i]));
                    json.append(i == fields.length - 1 ? "\"" : "\",");
                }
                json.append(records.hasNext() ? ",\"leaf\":true}," : ",\"leaf\":true}");
            }
            json.append(keys.hasNext() ? "]}," : "]}");
        }
        json.append("]}");

        map = null;
        
        return json.toString();
    }

}
