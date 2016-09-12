package com.kc.module.transaction;

import java.sql.Timestamp;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.base.Barcode;
import com.kc.module.base.RegularState;
import com.kc.module.model.DeviceDepart;
import com.kc.module.model.DeviceDepartResume;
import com.kc.module.model.DeviceInfo;
import com.kc.module.model.form.DeviceForm;
import com.kc.module.utils.ControlUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.JsonUtils;
import com.kc.module.utils.StringUtils;

/**
 * 该类主要是对机台的相关讯息进行新增更新操作<br>
 * 相关讯息主要涉及到机台的录入,部门机台的录入,机台部门记录的录入<br>
 * 机台工艺的录入,机台工艺记录的录入,机台加工讯息的更新,机台特性的录入
 * 
 * @author Administrator
 * 
 */
public class AddDevicesIAtom extends SqlTranscation {
    public static AddDevicesIAtom iAtom = new AddDevicesIAtom();

    private String pattern = "^(\\w|[-])+$";
    private String error;

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    @Override
    public boolean run() {
        try {

            String data = this.ctrl.getPara("data");
            if (StringUtils.isEmpty(data)) {
                this.setError("前台传来无效的数据!");
                return (false);
            }

            // 将前台传来的数据转换为指定的设备讯息类
            DeviceForm deviceForm = JsonUtils.josnToBean(data, DeviceForm.class);

            if (StringUtils.isEmpty(deviceForm.getPartid())) {
                this.setError("请选择机台部门!");
                return (false);
            }

            if (StringUtils.isEmpty(deviceForm.getDevicetype())) {
                this.setError("请选择机台类型!");
                return (false);
            }

            if (StringUtils.isEmpty(deviceForm.getBatchno())) {
                this.setError("机台或者设备编号不能为空!");
                return (false);
            }

            if (!deviceForm.getBatchno().matches(this.pattern)) {
                this.setError("机台或者设备编号只支持字母数字中线的组合!");
                return (false);
            }

            if (StringUtils.isEmpty(deviceForm.getCraftid())) {
                this.setError("请选择加工工艺!");
                return (false);
            }

            // 资产编号只能支持部分字符的组合
            if (!StringUtils.isEmpty(deviceForm.getAssetnumber()) && !deviceForm.getAssetnumber().matches(this.pattern)) {
                this.setError("资产编号只支持字母数字中线的组合!");
                return (false);
            }

            // 获取员工的唯一号
            String empid = ControlUtils.getAccountId(this.ctrl);

            // 获取当前时间格式为(yyyy-MM-dd HH:mm:ss)
            Timestamp dateNow = Timestamp.valueOf(DateUtils.getDateNow(DateUtils.DEFAULT_DATE_FORMAT));

            // 将该机台的讯息查询出来
            Record record = DeviceDepart.dao.getDeviceByCase(deviceForm.getPartid(), deviceForm.getBatchno());
            StringBuilder builder = null;
            // false为新增机台讯息,其他为更新机台讯息
            if (deviceForm.isUsetype()) {

                builder = new StringBuilder("UPDATE DEVICE_INFO SET DEVICETYPE = ?,ASSETNUMBER = ?,ISVIRTUAL = ?, MACLOAD = ? WHERE ID = ?");
                int result = Db.update(builder.toString(),
                                       deviceForm.getDevicetype(),
                                       deviceForm.getAssetnumber(),
                                       deviceForm.isVirtual(),
                                       deviceForm.getMacload(),
                                       deviceForm.getDeviceid());
                if (result < 0) {
                    this.setError("更新机台讯息失败!");
                    return (false);
                }

                // 设置更新机台的稼动时间
                // builder = new
                // StringBuilder("UPDATE MD_MACHINE_INFO SET MACLOAD = ? WHERE ID = ?");
                //
                // result = Db.update(builder.toString(),
                // deviceForm.getMacload(), deviceForm.getDeviceid());
                //
                // if (result < 0) {
                // this.setError("更新机台讯息失败!");
                // return (false);
                // }

                // 更新设备位置表(DEVICE_DEPART)中的部门资料,编号资料
                Object[] devDepartParamter = null;
                builder = new StringBuilder("UPDATE DEVICE_DEPART SET PARTID = ?,BATCHNO = ?,CRAFTID = ? WHERE ID = ?");

                devDepartParamter = new String[]{deviceForm.getPartid(), deviceForm.getBatchno(), deviceForm.getCraftid(), deviceForm.getDevpartid()};

                result = Db.update(builder.toString(), devDepartParamter);
                if (result < 0) {
                    this.setError("更新机台讯息失败!");
                    return (false);
                }

                // 将设备位置记录表中新增一笔记录
                DeviceDepartResume deviceDepartResume = new DeviceDepartResume();

                deviceDepartResume.set("ID", Barcode.DEVICE_DEPART_RESUME.nextVal())
                                  .set("DEVPARTID", deviceForm.getDevpartid())
                                  .set("PARTID", deviceForm.getPartid())
                                  .set("DEVICEID", deviceForm.getDeviceid())
                                  .set("BATCHNO", deviceForm.getBatchno())
                                  .set("OPERATOR", empid)
                                  .set("OPERDATE", dateNow)
                                  .set("OPERFLAG", "1");

                boolean ddrRs = deviceDepartResume.save();
                if (!ddrRs) {
                    this.setError("更新机台讯息失败!");
                    return (false);
                }

                // 更新加工表中的设备位置讯息
                builder = new StringBuilder("UPDATE MD_PROCESS_INFO SET CURRENTDEPTID = ? WHERE DEVICEPARTID = ?");
                result = Db.update(builder.toString(), deviceForm.getPartid(), deviceForm.getDevpartid());
                if (result < 0) {
                    this.setError("更新机台讯息失败!");
                    return (false);
                }
            } else {
                if (record != null) {
                    this.setError("该机台讯息已经存在了!");
                    return (false);
                }
                // 获取设备唯一号
                String machineBarCode = Barcode.DEVICE.nextVal();

                // 新增设备讯息
                DeviceInfo deviceInfo = new DeviceInfo();
                deviceInfo.set("ID", machineBarCode)
                          .set("DEVICETYPE", deviceForm.getDevicetype())
                          .set("ASSETNUMBER", deviceForm.getAssetnumber())
                          .set("CREATEDATE", dateNow)
                          .set("ISENABLE", "0")
                          .set("MACLOAD", deviceForm.getMacload())
                          .set("ISVIRTUAL", deviceForm.isVirtual() ? 1 : 0);

                boolean di = deviceInfo.save();
                if (!di) {
                    this.setError("新增机台讯息失败!");
                    return (false);
                }

                // 新增部门设备讯息

                String machineDeptDeviceCode = Barcode.DEVICE_DEPT.nextVal();

                DeviceDepart deviceDepartment = new DeviceDepart();
                deviceDepartment.set("ID", machineDeptDeviceCode);
                deviceDepartment.set("PARTID", deviceForm.getPartid());
                deviceDepartment.set("DEVICEID", machineBarCode);
                deviceDepartment.set("BATCHNO", deviceForm.getBatchno());
                deviceDepartment.set("CRAFTID", deviceForm.getCraftid());
                deviceDepartment.set("STATEID", RegularState.MACHINE_STOP.getIndex());

                boolean ddt = deviceDepartment.save();
                if (!ddt) {
                    this.setError("新增机台讯息失败!");
                    return (false);
                }

                // 新增部门设备记录
                DeviceDepartResume deviceDepartResume = new DeviceDepartResume();
                String ddrId = Barcode.DEVICE_DEPART_RESUME.nextVal();

                deviceDepartResume.set("ID", ddrId);
                deviceDepartResume.set("DEVPARTID", machineDeptDeviceCode);
                deviceDepartResume.set("PARTID", deviceForm.getPartid());
                deviceDepartResume.set("DEVICEID", machineBarCode);
                deviceDepartResume.set("BATCHNO", deviceForm.getBatchno());
                deviceDepartResume.set("OPERATOR", empid);
                deviceDepartResume.set("OPERDATE", dateNow);
                deviceDepartResume.set("OPERFLAG", "0");

                boolean ddr = deviceDepartResume.save();
                if (!ddr) {
                    this.setError("新增机台讯息失败!");
                    return (false);
                }

                // 设置机台的相关讯息(如稼动时间等)
                // ModuleMachine moduleMachine = new ModuleMachine();
                // moduleMachine.set("ID", machineBarCode).set("MACLOAD",
                // deviceForm.getMacload());
                //
                // boolean mm = moduleMachine.save();
                // if (!mm) {
                // this.setError("新增机台讯息失败!");
                // return (false);
                // }
            }

            // 执行成功
            return true;
        }
        catch (Exception e) {
            e.printStackTrace();
            this.setError("操作机台讯息时出现异常!");
            return (false);
        }
    }
}
