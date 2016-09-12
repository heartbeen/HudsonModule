package com.kc.module.extract;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.jfinal.plugin.activerecord.Record;
import com.kc.module.dao.ExtractDao;
import com.kc.module.model.DeviceDepart;
import com.kc.module.utils.StringUtils;

public class MachineRateExtract extends ExtractDao {

    private int typeid;
    private String classid;
    private int iscal;

    public int getIscal() {
        return iscal;
    }

    public void setIscal(int iscal) {
        this.iscal = iscal;
    }

    public String getClassid() {
        return classid;
    }

    public void setClassid(String classid) {
        this.classid = classid;
    }

    public int getTypeid() {
        return typeid;
    }

    public void setTypeid(int typeid) {
        this.typeid = typeid;
    }

    @Override
    public Object extract() {
        // 获取部门ID号
        String partid = this.getController().getPara("deptid");
        // 获取机台的基本状态
        // List<ModuleProcessState> pState =
        // ModuleProcessState.dao.getReferenceStates(this.getClassid(), 0);
        List<DeviceDepart> deviceDepart = DeviceDepart.dao.getMachineWorkSituation(partid, this.getTypeid(), this.getIscal());

        Map<String, Record> mState = new LinkedHashMap<String, Record>();
        List<Record> mRecord = new ArrayList<Record>();
        // for (ModuleProcessState mps : pState) {
        // String stateid = mps.getStr("stateid");
        // if (StringUtils.isEmpty(stateid)) {
        // continue;
        // }
        //
        // String statename = mps.getStr("statename");
        //
        // if (!mState.containsKey(stateid)) {
        // Record record = new Record();
        // record.set("sid", stateid).set("name", statename);
        //
        // mState.put(stateid, record);
        // }
        // }

        for (DeviceDepart dd : deviceDepart) {
            String stateid = dd.getStr("stateid");
            String statename = dd.getStr("statename");

            if (StringUtils.isEmpty(stateid)) {
                continue;
            }

            Number scount = dd.getNumber("scount");

            if (!mState.containsKey(stateid)) {
                Record record = new Record();
                record.set("stateid", stateid).set("name", statename).set("scount", scount == null ? 0 : scount.intValue());

                mState.put(stateid, record);
            }
        }

        for (String key : mState.keySet()) {
            mRecord.add(mState.get(key));
        }

        return mRecord;
    }
}
