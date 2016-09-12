package com.kc.module.extract;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import com.kc.module.base.RegularState;
import com.kc.module.dao.ExtractDao;
import com.kc.module.model.DeviceDepart;
import com.kc.module.model.form.MachineCraftForm;
import com.kc.module.utils.StringUtils;

/**
 * 
 * @author ASUS
 * 
 */
public class MachineCraftExtract extends ExtractDao {

    @Override
    public Object extract() {
        List<DeviceDepart> list = DeviceDepart.dao.getMachineWorkInformation(this.getController().getPara("deptid"), 0, 0);
        HashMap<String, MachineCraftForm> map = new HashMap<String, MachineCraftForm>();
        List<MachineCraftForm> craftlist = new ArrayList<MachineCraftForm>();

        for (DeviceDepart dd : list) {
            String craftid = dd.getStr("craftid");
            String craftname = dd.getStr("craftname");
            String stateid = dd.getStr("stateid");
            stateid = StringUtils.isEmpty(stateid) ? RegularState.MACHINE_STOP.getIndex() : stateid;

            if (StringUtils.isEmpty(craftid)) {
                continue;
            }

            if (map.containsKey(craftid)) {
                MachineCraftForm ci = map.get(craftid);
                if (stateid.equals(RegularState.MACHINE_START.getIndex())) {
                    ci.setLaunch(ci.getLaunch() + 1);
                } else {
                    ci.setStop(ci.getStop() + 1);
                }
            } else {
                MachineCraftForm ci = new MachineCraftForm();
                ci.setCraftname(craftname);

                if (stateid.equals(RegularState.MACHINE_START.getIndex())) {
                    ci.setLaunch(ci.getLaunch() + 1);
                } else {
                    ci.setStop(ci.getStop() + 1);
                }

                map.put(craftid, ci);
            }
        }

        for (String key : map.keySet()) {
            craftlist.add(map.get(key));
        }

        return craftlist;
    }

}
