package com.kc.module.transaction;

import java.sql.Timestamp;
import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.base.Barcode;
import com.kc.module.base.RegularState;
import com.kc.module.model.DeviceDepart;
import com.kc.module.utils.ControlUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.StringUtils;

/**
 * 该类主要执行对部门设备机台执行删除操作<br>
 * 删除过程中涉及6个表
 * 
 * @author Administrator
 * 
 */
public class DeleteDevicesIAtom extends SqlTranscation {

    public static DeleteDevicesIAtom iAtom = new DeleteDevicesIAtom();
    public static int SQL_RS = -1;

    @Override
    public boolean run() {
        // 获取前台传送的设备参数
        String devid = this.ctrl.getPara(this.ajaxAttr[0]);
        if (devid == null || devid.equals("")) {
            SQL_RS = -1;
            return (false);
        }

        // 更新DEVICE_INFO设备表将ISENABLE标识设置为1代表已经报废
        int df = Db.update("UPDATE DEVICE_INFO SET ISENABLE = ? WHERE ID = ?", "1", devid);
        if (df < 0) {
            SQL_RS = -2;
            return (false);
        }

        // 删除MD_DEVICE_CRAFT设备工艺表中的该机台的工艺讯息
        int delDd = Db.update("DELETE FROM DEVICE_DEPART WHERE DEVICEID = ?", devid);
        if (delDd < 0) {
            SQL_RS = -2;
            return (false);
        }

        // 删除MD_DEVICE_CRAFT设备工艺表中的该机台的工艺讯息
        int delMdc = Db.update("DELETE FROM MD_DEVICE_CRAFT WHERE DEVICEID = ?", devid);
        if (delMdc < 0) {
            SQL_RS = -2;
            return (false);
        }

        // 删除MD_MACHINE_INFO机台明细表中的该机台的工艺讯息
        int delMmi = Db.update("DELETE FROM MD_MACHINE_INFO WHERE ID = ?", devid);
        if (delMmi < 0) {
            SQL_RS = -2;
            return (false);
        }

        // 获取该机台的加工讯息
        List<Record> devProcess = DeviceDepart.dao.getDeviceProcessInfo(devid);

        String t_barcode = null;
        boolean rst = false;

        Timestamp t_date = DateUtils.parseTimeStamp(DateUtils.getDateNow());

        Record t_record = null;

        if (devProcess != null) {
            for (Record r : devProcess) {
                String id = r.get("ID");
                // String partmergeid = r.get("PARTMERGEID");
                String partbarlistcode = r.get("PARTBARLISTCODE");
                // String devicepartid = r.get("DEVICEPARTID");

                // String devicestateid = r.get("DEVICESTATEID");
                String moduleresumeid = r.get("MODULERESUMEID");
                String currentdeptid = r.get("CURRENTDEPTID");
                // 原始记录游标ID号
                String cursorid = r.getStr("CURSORID");
                // 判断重新生成一个加工记录ID号是否要重新从数据库加载
                if (!rst) {
                    t_barcode = Barcode.MODULE_PROCESS_RESUME.nextVal(true);
                    rst = true;
                } else {
                    t_barcode = Barcode.MODULE_PROCESS_RESUME.nextVal();
                }

                // 将该工件的部门设备号,开工时间清空,将工件状态设置为停工
                t_record = new Record();
                t_record.set("ID", id)
                        .set("PARTMERGEID", "")
                        .set("DEVICEPARTID", "")
                        .set("PARTSTATEID", RegularState.PART_STATE_STOP.getIndex())
                        .set("DEVICELAUNCHDATE", "")
                        .set("PARTCOUNT", "1")
                        .set("ACTIONTIME", t_date)
                        .set("CURSORID", t_barcode);
                boolean t_rst = Db.update("MD_PROCESS_INFO", t_record);
                if (!t_rst) {
                    SQL_RS = -2;
                    return (false);
                }

                // 如果游标编号不为空,则需要将MD_PROCESS_RESUME中的原始记录补齐,并且再插入一笔新记录
                if (!StringUtils.isEmpty(cursorid)) {
                    // 更新原始的记录
                    t_record = new Record();
                    String t_empid = ControlUtils.getAccountId(this.ctrl);
                    t_record.set("NPARTSTATEID", RegularState.PART_STATE_STOP.getIndex())
                            .set("NEMPID", t_empid)
                            .set("NEMPACTID", RegularState.EMP_ACTION_DOWN.getIndex())
                            .set("NDEPTID", currentdeptid)
                            .set("NRCDTIME", t_date);
                    t_rst = Db.update("MD_PROCESS_RESUME", t_record);
                    if (!t_rst) {
                        SQL_RS = -2;
                        return (false);
                    }
                    // 插入一笔新的加工记录
                    t_record = new Record();
                    t_record.set("ID", t_barcode)
                            .set("PARTBARLISTCODE", partbarlistcode)
                            .set("LPARTSTATEID", RegularState.PART_STATE_STOP.getIndex())
                            .set("LEMPID", t_empid)
                            .set("LEMPACTID", RegularState.EMP_ACTION_DOWN.getIndex())
                            .set("LDEPTID", currentdeptid)
                            .set("LRCDTIME", t_date)
                            .set("PARTCOUNT", "1")
                            .set("MID", id)
                            .set("RSMID", moduleresumeid)
                            .set("ISTIME", "1");
                    t_rst = Db.save("MD_PROCESS_RESUME", t_record);
                    if (!t_rst) {
                        SQL_RS = -2;
                        return (false);
                    }
                }
            }
        }

        SQL_RS = 1;
        return (true);
    }
}
