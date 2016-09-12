package com.kc.module.transaction;

import java.util.List;
import java.util.Map;

import com.jfinal.plugin.activerecord.IAtom;
import com.kc.module.base.Barcode;
import com.kc.module.model.DeviceDepart;
import com.kc.module.model.DeviceProcessResume;
import com.kc.module.model.ModuleProcessInfo;
import com.kc.module.model.ModuleProcessResume;
import com.kc.module.model.form.DeviceProcessPartForm;
import com.kc.module.model.form.QueryCurrentMachineInfo;
import com.kc.module.utils.DateUtils;

public class PauseMachineIAtom implements IAtom {

    private Map<String, QueryCurrentMachineInfo> info;

    public void setInfo(Map<String, QueryCurrentMachineInfo> info) {
        this.info = info;
    }

    @Override
    public boolean run() {
        // 如果集合为空或者集合不含有内容,则返回TRUE
        if (this.info.size() == 0) {
            return (true);
        }
        // 加Try...Catch防止出来Update失败动作
        try {
            // 将DEVICE_PROCESS_RESUME这个表的ID主键更新
            Barcode.DEVICE_PROCESS_RESUME.nextVal(true);
            // 从数据库中重新加载MD_PROCESS_RESUME表的ID号
            Barcode.MODULE_PROCESS_RESUME.nextVal(true);

            for (String key : this.info.keySet()) {
                QueryCurrentMachineInfo mac = this.info.get(key);

                // 更新机台部门表中机台的状态等讯息
                DeviceDepart departInstance = new DeviceDepart();
                departInstance.set("ID", mac.getDepartid());
                departInstance.set("STATEID", mac.getStateid());
                departInstance.set("EMPID", "");
                departInstance.set("LAUNCH", "");
                boolean result = departInstance.update();
                if (!result) {
                    return result;
                }

                // 将机台加工讯息表中的机台异动讯息增加一条
                DeviceProcessResume dprInstance = new DeviceProcessResume();
                dprInstance.set("ID", Barcode.DEVICE_PROCESS_RESUME.nextVal());
                dprInstance.set("DEVICEPARTID", mac.getDepartid());
                dprInstance.set("STATEID", mac.getStateid());
                dprInstance.set("CRAFTID", mac.getCraftid());
                dprInstance.set("EMPID", mac.getUpdateman());
                dprInstance.set("ACTIONDATE", DateUtils.parseTimeStamp(DateUtils.getDateNow()));
                dprInstance.set("ACTIONTYPE", mac.getActionid());

                boolean dprRs = dprInstance.save();
                if (!dprRs) {
                    return dprRs;
                }

                List<DeviceProcessPartForm> partinfo = mac.getParts();
                String t_barcode = null;

                for (DeviceProcessPartForm info : partinfo) {
                    // 获取MD_PROCESS_RESUME新的ID号
                    t_barcode = Barcode.MODULE_PROCESS_RESUME.nextVal();

                    ModuleProcessInfo mpiInstance = new ModuleProcessInfo();

                    // 判断是否为固件衍生件
                    boolean isDel = (info.getIsfixed() == 1 && info.getIsmajor() == 0);
                    // 如果为衍生出来的固件,则将其删除
                    if (isDel) {
                        mpiInstance.set("ID", info.getUuid());
                        boolean mpiRs = mpiInstance.delete();

                        if (!mpiRs) {
                            return mpiRs;
                        }
                    } else {

                        mpiInstance.set("ID", info.getUuid());
                        // mpiInstance.set("DEVICEPARTID", "");
                        mpiInstance.set("PARTSTATEID", info.getStateid());
                        mpiInstance.set("ACTIONTIME", DateUtils.parseTimeStamp(DateUtils.getDateNow()));
                        mpiInstance.set("CURSORID", t_barcode);

                        boolean mpiRs = mpiInstance.update();

                        if (!mpiRs) {
                            return mpiRs;
                        }
                    }

                    ModuleProcessResume mprInstance = new ModuleProcessResume();
                    mprInstance.set("ID", info.getCursorid());
                    mprInstance.set("NDEVDEPARTID", key);
                    mprInstance.set("NPROCRAFTID", mac.getCraftid());
                    mprInstance.set("NPARTSTATEID", info.getStateid());
                    mprInstance.set("NDEVSTATEID", mac.getStateid());
                    mprInstance.set("NEMPID", mac.getUpdateman());
                    mprInstance.set("NEMPACTID", mac.getActionid());
                    mprInstance.set("NDEPTID", mac.getPosid());
                    mprInstance.set("NSCHEID", info.getScheid());
                    mprInstance.set("NRCDTIME", DateUtils.parseTimeStamp(DateUtils.getDateNow()));

                    boolean mprRs = mprInstance.update();
                    if (!mprRs) {
                        return mprRs;
                    }

                    // 如果不是固件衍生记录增加记录
                    if (!isDel) {
                        // 新增一个工件加工的记录资料到MD_PROCESS_RESUME
                        ModuleProcessResume nprInstance = new ModuleProcessResume();
                        nprInstance.set("ID", t_barcode);
                        nprInstance.set("LDEVDEPARTID", key);
                        nprInstance.set("LPROCRAFTID", mac.getCraftid());
                        nprInstance.set("LPARTSTATEID", info.getStateid());
                        nprInstance.set("LDEVSTATEID", mac.getStateid());
                        nprInstance.set("LEMPID", mac.getUpdateman());
                        nprInstance.set("LEMPACTID", mac.getActionid());
                        nprInstance.set("LDEPTID", mac.getPosid());
                        nprInstance.set("LSCHEID", info.getScheid());
                        nprInstance.set("LRCDTIME", DateUtils.parseTimeStamp(DateUtils.getDateNow()));
                        nprInstance.set("PARTMERGEID", info.getMergeid());
                        nprInstance.set("PARTCOUNT", info.getPartcount());
                        nprInstance.set("MID", info.getUuid());
                        nprInstance.set("RSMID", info.getResumeid());
                        nprInstance.set("ISTIME", "1");

                        boolean nprRs = nprInstance.save();
                        if (!nprRs) {
                            return nprRs;
                        }
                    }
                }

            }

            return (true);
        }
        catch (Exception e) {
            return (false);
        }
    }

}
