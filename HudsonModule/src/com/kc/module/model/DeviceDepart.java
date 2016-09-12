package com.kc.module.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.jfinal.kit.JsonKit;
import com.jfinal.kit.StrKit;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.base.RegularState;
import com.kc.module.model.form.DeviceProcessPartForm;
import com.kc.module.model.form.QueryCurrentMachineInfo;
import com.kc.module.transaction.PauseMachineIAtom;
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.DBUtils;
import com.kc.module.utils.JsonUtils;
import com.kc.module.utils.StringUtils;

public class DeviceDepart extends ModelFinal<DeviceDepart> {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;

    public static DeviceDepart dao = new DeviceDepart();

    /**
     * 获取所有的机台讯息
     * 
     * @return
     */
    public List<Record> getDepartmentDevices() {
        // 如果部门ID为空,则返回一个空的结果
        StringBuilder builder = new StringBuilder();
        builder.append("SELECT t.*,s.DEVICETYPE,s.ASSETNUMBER FROM DEVICE_DEPART t   ");
        builder.append("LEFT JOIN DEVICE_INFO s ON t.DEVICEID = s.ID                 ");
        return Db.find(builder.toString());
    }

    /**
     * 按条件查找设备的相关资讯
     * 
     * @param deptid
     * @param batchno
     * @return
     */
    public Record getDeviceByCase(String deptid, String batchno) {
        return Db.findFirst("SELECT * FROM DEVICE_DEPART WHERE PARTID = ? AND BATCHNO = ?", deptid, batchno);
    }

    /**
     * 获取指定厂区的设备讯息(包括机台和设备)
     * 
     * @param factoryId
     * @return
     */
    private List<Record> getAllDeviceById(String factoryId) {

        StringBuilder builder = new StringBuilder();
        builder.append("SELECT a.ID, a.PARTID, e.NAME AS PARTNAME, a.DEVICEID, a.BATCHNO                 ");
        builder.append(", b.ASSETNUMBER, b.DEVICETYPE, c.NAME AS TYPENAME, b.MACLOAD, a.STATEID          ");
        builder.append(", f.NAME AS STATENAME, h.CRAFTNAME,h.CRAFTCODE                                   ");
        builder.append(",h.ID AS CRAFTBARID,(h.CRAFTNAME||'['||h.CRAFTCODE||']') AS MERGENAME            ");
        builder.append(",f.ID AS STATEID, a.CRAFTID AS CURRENTCRAFT,b.ISVIRTUAL FROM DEVICE_DEPART a     ");
        builder.append("LEFT JOIN DEVICE_INFO b ON a.DEVICEID = b.ID                                     ");
        builder.append("LEFT JOIN DEVICE_TYPE c ON b.DEVICETYPE = c.ID                                   ");
        builder.append("LEFT JOIN REGION_DEPART e ON a.PARTID = e.ID                                     ");
        builder.append("LEFT JOIN MD_PROCESS_STATE f ON a.STATEID = f.ID                                 ");
        builder.append("LEFT JOIN MD_CRAFT h ON a.CRAFTID = h.ID ORDER BY a.DEVICEID,a.CRAFTID           ");
        // builder.append("WHERE e.STEPID like ? ORDER BY a.DEVICEID,a.CRAFTID                           ");

        // return Db.find(builder.toString(), factoryId + "%");
        return Db.find(builder.toString());
    }

    /**
     * 获取条码和名称
     * 
     * @param userName
     * @return
     */
    public List<DeviceDepart> getDepartCode() {
        return find("SELECT T.*,S.CRAFTNAME FROM DEVICE_DEPART T LEFT JOIN MD_CRAFT S ON T.CRAFTID = S.ID");
    }

    /**
     * 合并所有的有关厂区部门的设备JSON
     * 
     * @return
     */
    public String mergeAllDeviceByFactroryJson(String factoryId) {

        List<Record> record = getAllDeviceById(factoryId);
        if (record == null || record.size() == 0) {
            return "";
        } else {
            // 存放机台的相关讯息
            List<Object> list = new ArrayList<Object>();
            // 存放单台机的相关讯息
            HashMap<String, Object> mergeMap = null;

            // 获取单台机的所有讯息
            for (Record r : record) {
                Object itemDev = r.get("DEVICEID");
                if (itemDev == null) {
                    continue;
                }

                mergeMap = new HashMap<String, Object>();
                mergeMap.put("devpartid", r.get("ID"));
                mergeMap.put("deptid", r.get("PARTID"));
                mergeMap.put("deptname", r.get("PARTNAME"));
                mergeMap.put("macbarcode", itemDev);
                mergeMap.put("macbatch", r.get("BATCHNO"));
                mergeMap.put("assetnumber", r.get("ASSETNUMBER"));
                mergeMap.put("typeid", r.get("DEVICETYPE"));
                mergeMap.put("typename", r.get("TYPENAME"));
                mergeMap.put("macload", r.get("MACLOAD"));
                mergeMap.put("macstatus", r.get("STATEID"));
                mergeMap.put("stateid", r.get("STATEID"));
                mergeMap.put("statusname", r.get("STATENAME"));
                mergeMap.put("currentcraft", r.get("CURRENTCRAFT"));
                mergeMap.put("craftname", r.get("MERGENAME"));
                mergeMap.put("istrue", r.get("ISVIRTUAL"));

                list.add(mergeMap);
            }

            return JsonKit.toJson(list);
        }
    }

    /**
     * 获取部门机台工艺的讯息
     * 
     * @param devid
     * @return
     */
    public List<Record> getDeviceCrafts(String devid) {
        StringBuilder builder = new StringBuilder();
        builder.append("SELECT a.ID, a.PARTID, a.DEVICEID, a.BATCHNO,          ");
        builder.append("b.ID AS DEVCRAFTID,b.CRAFTID FROM DEVICE_DEPART a      ");
        builder.append("LEFT JOIN MD_DEVICE_CRAFT b ON a.DEVICEID = b.DEVICEID ");
        builder.append("WHERE a.DEVICEID = ? ORDER BY a.ID                     ");
        return Db.find(builder.toString(), devid);
    }

    /**
     * 获取部门机台加工讯息
     * 
     * @param devid
     * @return
     */
    public List<Record> getDeviceProcessInfo(String devid) {
        StringBuilder builder = new StringBuilder();
        builder.append("SELECT b.*                                           ");
        builder.append("FROM DEVICE_DEPART a                                 ");
        builder.append("LEFT JOIN MD_PROCESS_INFO b ON a.ID = b.DEVICEPARTID ");
        builder.append("WHERE a.DEVICEID = ?                                 ");
        return Db.find(builder.toString(), devid);
    }

    /**
     * 得到部门机台条码
     * 
     * @param deptId
     * @return
     */
    public List<DeviceDepart> findMachineBarcode(String stepId) {
        StringBuilder sql = new StringBuilder();
        sql.append("SELECT DD.DEVICEID BARCODE, DD.BATCHNO, DT.NAME ");
        sql.append("FROM (SELECT DEVICEID, ");
        sql.append("BATCHNO FROM DEVICE_DEPART  ");
        if (StrKit.notBlank(stepId)) {
            sql.append("WHERE PARTID in (select id from region_depart where stepid like '");
            sql.append(stepId).append("%')  ");
        }
        sql.append(") DD LEFT JOIN DEVICE_INFO DI ");
        sql.append("ON DI.ID = DD.DEVICEID LEFT JOIN DEVICE_TYPE DT ");
        sql.append("ON DT.ID = DI.DEVICETYPE ORDER BY DT.NAME,DD.BATCHNO ");

        return find(sql.toString());
    }

    /**
     * 得到指定模具加单位的所有机台
     * 
     * @param partId
     * @return
     */
    public List<DeviceDepart> findDeptMachine(String partId) {
        StringBuilder builder = new StringBuilder();
        builder.append("SELECT A.ID AS SID,A.PARTID,C.NAME AS DEPTNAME,A.DEVICEID,F.ID AS TYPEID,F.NAME AS MACTYPE");
        builder.append(",E.ASSETNUMBER,A.BATCHNO,B.CRAFTID,D.CRAFTNAME,G.MACLOAD FROM DEVICE_DEPART A");
        builder.append(" LEFT JOIN  MD_DEVICE_CRAFT B ON A.DEVICEID = B.DEVICEID  LEFT JOIN REGION_DEPART C");
        builder.append(" ON A.PARTID = C.ID LEFT JOIN MD_CRAFT D ON B.CRAFTID = D.CRAFTID LEFT JOIN DEVICE_INFO");
        builder.append(" E ON A.DEVICEID = E.ID LEFT JOIN DEVICE_TYPE F ON E.DEVICETYPE = ");
        builder.append("F.ID LEFT JOIN MD_MACHINE_INFO G ON A.DEVICEID = G.ID WHERE  A.PARTID =? ORDER BY A.PARTID,A.BATCHNO");

        return find(builder.toString(), partId);
    }

    /**
     * 查询所指定加工单位的机台稼动率
     * 
     * @param deptStepId
     *            部门
     * @param startTime
     * @param endTime
     * @return
     */
    public List<Record> findMachineRate(String deptStepId, String startTime, String endTime) {

        StringBuilder sql = new StringBuilder();

        sql.append("SELECT A.BATCHNO ,A.ID, B.NAME ,C.EMPNAME ,(SELECT NAME FROM MD_PROCESS_STATE WHERE                    ");
        sql.append("   ID = A.STATEID ) AS MACSTATE , NVL( D.PTIME , 0 ) RATE                                              ");
        sql.append("FROM DEVICE_DEPART A LEFT JOIN REGION_DEPART B                                                         ");
        sql.append("    ON A.PARTID = B.ID LEFT JOIN EMPLOYEE_INFO C                                                       ");
        sql.append("    ON A.EMPID = C.ID LEFT JOIN(                                                                       ");
        sql.append("    SELECT SUM(DOTIME) AS PTIME , DEVICEID                                                             ");
        sql.append("    FROM ( SELECT                                                                                      ");
        sql.append("           ROUND((( CASE WHEN NVL( NRCDTIME ,SYSDATE ) > TO_DATE( ? ,'YYYY-MM-DD HH24:MI:SS' )         ");
        sql.append("                THEN TO_DATE( ? ,'YYYY-MM-DD HH24:MI:SS' )                                             ");
        sql.append("                ELSE NVL( NRCDTIME ,SYSDATE ) END ) -(                                                 ");
        sql.append("                    CASE WHEN LRCDTIME < TO_DATE( ? ,'YYYY-MM-DD HH24:MI:SS' )                         ");
        sql.append("                    THEN TO_DATE( ? ,'YYYY-MM-DD HH24:MI:SS' )                                         ");
        sql.append("                    ELSE LRCDTIME END ) ) * 24*60 / TO_NUMBER( NVL( M.PARTCOUNT ,'1' )),2 ) AS DOTIME, ");
        sql.append("                N.DEVICEID                                                                             ");
        sql.append("            FROM (SELECT * FROM (                                                                      ");
        sql.append("                            SELECT LDEVDEPARTID , LRCDTIME , NRCDTIME , PARTCOUNT ,                    ");
        sql.append("                                CASE WHEN NRCDTIME < = TO_DATE(                                        ");
        sql.append("                                        ? ,'YYYY-MM-DD HH24:MI:SS')                                    ");
        sql.append("                                    THEN 0 WHEN LRCDTIME >= TO_DATE(                                   ");
        sql.append("                                        ? ,'YYYY-MM-DD HH24:MI:SS')                                    ");
        sql.append("                                    THEN 0 ELSE 1 END AS PFLAG                                         ");
        sql.append("                            FROM MD_PROCESS_RESUME WHERE ISTIME = '0'                                  ");
        sql.append("                        ) WHERE PFLAG = 1                                                              ");
        sql.append("                ) M LEFT JOIN DEVICE_DEPART_RESUME N ON M.LDEVDEPARTID = N.DEVPARTID                   ");
        sql.append("        ) GROUP BY DEVICEID ) D ON A.DEVICEID = D.DEVICEID                                             ");
        sql.append("WHERE B.STEPID LIKE ?||'%' ORDER BY A.PARTID , A.BATCHNO                                               ");

        return Db.find(sql.toString(), endTime, endTime, startTime, startTime, startTime, endTime, deptStepId);
    }

    /**
     * 获取当前本部门机台的相关讯息
     * 
     * @param deptid
     * @return
     */
    public List<DeviceDepart> getCurrencyDeptMachineInfo(String deptid) {

        // 如果检测到部门的ID为空,返回一个空的查询集合
        if (StringUtils.isEmpty(deptid)) {
            return new ArrayList<DeviceDepart>();
        }

        StringBuilder builder = new StringBuilder();

        builder.append("SELECT a.ID AS DEPARTID, a.DEVICEID, b.NAME AS DEPTNAME, a.BATCHNO, (  ");
        builder.append("        SELECT NAME                                                    ");
        builder.append("        FROM DEVICE_TYPE                                               ");
        builder.append("        WHERE ID = f.DEVICETYPE                                        ");
        builder.append("        ) AS TYPENAME                                                  ");
        builder.append("    , c.CRAFTNAME, d.NAME AS STATENAME, e.EMPNAME, a.LAUNCH,           ");
        builder.append("ROUND(case when a.LAUNCH IS NULL THEN 0 ELSE (SYSDATE - TO_DATE(       ");
        builder.append("a.LAUNCH,'yyyy-mm-dd hh24:mi:ss')) * 24 end,2) AS USEHOUR FROM         ");
        builder.append("DEVICE_DEPART a LEFT JOIN REGION_DEPART b ON a.PARTID = b.ID           ");
        builder.append("LEFT JOIN MD_CRAFT c ON a.CRAFTID = c.ID                               ");
        builder.append("LEFT JOIN MD_PROCESS_STATE d ON a.STATEID = d.ID                       ");
        builder.append("LEFT JOIN EMPLOYEE_INFO e ON a.EMPID = e.ID                            ");
        builder.append("    LEFT JOIN DEVICE_INFO f ON a.DEVICEID = f.ID                       ");
        builder.append(" LEFT JOIN REGION_DEPART g ON a.PARTID = g.ID                          ");
        builder.append("WHERE g.STEPID LIKE ? ORDER BY b.STEPID, a.ID                          ");
        // builder.append("WHERE a.PARTID = ? ORDER BY b.STEPID, a.ID                             ");

        // return this.find(builder.toString(), deptid);
        return this.find(builder.toString(), deptid + "%");
    }

    /**
     * 获取当前的机台集合的相关讯息
     * 
     * @param stateid
     * @param list
     * @return
     */
    private List<DeviceDepart> getCurrentMachineListInfo(String stateid, String[] list) {
        StringBuilder sql = new StringBuilder();

        sql.append("SELECT a.ID, a.PARTID, a.DEVICEID, a.STATEID, a.CRAFTID                    ");
        sql.append(", a.EMPID, b.ID AS PID, b.PARTBARLISTCODE, b.PARTSTATEID, b.MODULERESUMEID ");
        sql.append(", b.SCHEDULEID, b.PARTCOUNT, b.CURSORID, b.PARTMERGEID,b.ISFIXED,b.ISMAJOR ");
        sql.append("FROM DEVICE_DEPART a                                                       ");
        sql.append("LEFT JOIN MD_PROCESS_INFO b ON a.ID = b.DEVICEPARTID WHERE a.STATEID = ?   ");
        sql.append("AND a.ID IN                                                                ");
        sql.append(DBUtils.sqlIn(list));

        return this.find(sql.toString(), stateid);
    }

    /**
     * 更新某个部门的多个机台和机台工件的状态讯息
     * 
     * @return
     */
    public boolean pauseCurrentMachineListActionData(String stateid, String updateman, String dev) {

        // 将前台传来的JS数组解析成Java数组,如果解析为空,则返回TRUE
        String[] list = JsonUtils.parseJsArray(dev);
        if (list == null || list.length == 0) {
            return (true);
        }

        // 将某种状态的机台查询出来
        List<DeviceDepart> rowList = getCurrentMachineListInfo(stateid, list);
        if (rowList.size() == 0) {
            return (true);
        }

        // 获取员工的动作(下机)
        final String actionType = RegularState.EMP_ACTION_DOWN.getIndex();
        // 获取工件停工状态
        final String rPartStateid = RegularState.PART_STATE_PAUSE.getIndex();
        // 获取机台停止状态
        final String rDeviceStateid = RegularState.MACHINE_STOP.getIndex();

        Map<String, QueryCurrentMachineInfo> macData = new HashMap<String, QueryCurrentMachineInfo>();

        for (DeviceDepart r : rowList) {
            // 声明用于存放机台讯息的FORM类
            QueryCurrentMachineInfo info = null;

            // 机台部门唯一号
            String departid = StringUtils.parseString(r.get("ID"));
            // 如果机台的唯一号为空,则跳过这条记录
            if (StringUtils.isEmpty(departid)) {
                continue;
            }

            // 当前部门代号
            String posid = StringUtils.parseString(r.get("PARTID"));
            // 设备唯一号
            String deviceid = StringUtils.parseString(r.get("DEVICEID"));
            // 合并号
            String mergeid = StringUtils.parseString(r.get("PARTMERGEID"));
            // 工艺唯一号
            String craftid = StringUtils.parseString(r.get("CRAFTID"));
            // 员工代号
            String empid = StringUtils.parseString(r.get("EMPID"));

            // MD_PROCESS_INFO表ID号
            String pid = StringUtils.parseString(r.get("PID"));
            // 工件唯一号MD_PROCESS_INFO表PARTBARLISTCODE列
            String partcode = StringUtils.parseString(r.get("PARTBARLISTCODE"));
            // 加工表工件模具履历号
            String resumeid = StringUtils.parseString(r.get("MODULERESUMEID"));
            // 加工排程
            String scheid = StringUtils.parseString(r.get("SCHEDULEID"));
            // 合并工件数量
            String partcount = StringUtils.parseString(r.get("PARTCOUNT"));
            // 工件加工记录表MD_PROCESS_RESUME表ID号
            String cursorid = StringUtils.parseString(r.get("CURSORID"));
            // 是否为固件
            int isfixed = ArithUtils.parseIntNumber(r.get("ISFIXED"), 0);
            // 是否属于基件
            int ismajor = ArithUtils.parseIntNumber(r.get("ISMAJOR"), 0);

            // 如果部门设备ID为空,则跳过解析此条数据
            if (StringUtils.isEmpty(departid)) {
                continue;
            }

            if (macData.containsKey(departid)) {
                // 获取某个已经存在的机台讯息
                info = macData.get(departid);

                // 如果MD_PROCESS_INFO表的ID为空,则表示该工件讯息为空，跳过这条记录
                if (StringUtils.isEmpty(pid)) {
                    continue;
                }

                // 如果工件工件中包含了这个工件的讯息资料，则跳过
                // if (info.getParts().containsKey(partcode)) {
                // continue;
                // }

                // 设置工件的相关讯息
                DeviceProcessPartForm partinfo = new DeviceProcessPartForm();

                partinfo.setUuid(pid);
                partinfo.setPartcode(partcode);
                partinfo.setStateid(rPartStateid);
                partinfo.setResumeid(resumeid);
                partinfo.setScheid(scheid);
                partinfo.setCursorid(cursorid);
                partinfo.setPartcount(partcount);
                partinfo.setMergeid(mergeid);
                partinfo.setIsfixed(isfixed);
                partinfo.setIsmajor(ismajor);

                info.getParts().add(partinfo);

            } else {
                // 如果机台讯息表中不含该机台的讯息,将该机台讯息添加进去
                info = new QueryCurrentMachineInfo();

                info.setDepartid(departid);
                info.setDeviceid(deviceid);
                info.setEmpid(empid);
                info.setStateid(rDeviceStateid);
                info.setCraftid(craftid);
                info.setActionid(actionType);
                info.setPosid(posid);
                info.setUpdateman(updateman);

                // 如果MD_PROCESS_INFO表的ID不为空,即工件存在,则将其放入缓存
                if (!StringUtils.isEmpty(pid)) {
                    // 设置工件的相关讯息
                    DeviceProcessPartForm partinfo = new DeviceProcessPartForm();

                    partinfo.setUuid(pid);
                    partinfo.setPartcode(partcode);
                    partinfo.setStateid(rPartStateid);
                    partinfo.setResumeid(resumeid);
                    partinfo.setScheid(scheid);
                    partinfo.setCursorid(cursorid);
                    partinfo.setPartcount(partcount);
                    partinfo.setMergeid(mergeid);
                    partinfo.setIsfixed(isfixed);
                    partinfo.setIsmajor(ismajor);

                    // 初始化机台的工件讯息集合并将该工件讯息添加进去
                    List<DeviceProcessPartForm> partlist = info.getParts();

                    partlist.add(partinfo);
                }

                // 将机台讯息添加至机台集合中
                macData.put(departid, info);
            }
        }

        // 声明事务控制的类
        PauseMachineIAtom pauseMachine = new PauseMachineIAtom();
        pauseMachine.setInfo(macData);

        return Db.tx(pauseMachine);
    }

    /**
     * 获取加工机台加工的部件讯息
     * 
     * @param departid
     * @return
     */
    public List<DeviceDepart> getCurrentProcessMachinePartInfo(String departid) {
        StringBuilder sql = new StringBuilder();

        sql.append("SELECT e.MODULECODE,e.GUESTCODE,c.PARTLISTCODE, (");
        sql.append("SELECT CNAMES FROM MD_PART WHERE PARTBARCODE = c.PARTBARCODE ");
        sql.append(") AS PARTNAME, d.NAME AS STATENAME FROM DEVICE_DEPART a ");
        sql.append("LEFT JOIN MD_PROCESS_INFO b ON a.ID = b.DEVICEPARTID ");
        sql.append("LEFT JOIN MD_PART_LIST c ON b.PARTBARLISTCODE = c.PARTBARLISTCODE ");
        sql.append("LEFT JOIN MD_PROCESS_STATE d ON b.PARTSTATEID = d.ID LEFT JOIN MODULELIST e ");
        sql.append("ON e.MODULEBARCODE = c.MODULEBARCODE WHERE a.ID = ? AND b.ID IS NOT NULL");

        return this.find(sql.toString(), departid);
    }

    /**
     * 获取部门的
     * 
     * @param partid
     * @param virtual
     * @return
     */
    public List<DeviceDepart> getMachineWorkSituation(String partid, int virtual, int iscal) {
        StringBuilder builder = new StringBuilder();

        Object[] params = null;

        builder.append("SELECT MS.*,MPS.NAME AS STATENAME FROM (SELECT COUNT(*) AS SCOUNT, DD.STATEID FROM DEVICE_DEPART DD ");
        builder.append("LEFT JOIN DEVICE_INFO DI ON DD.DEVICEID = DI.ID ");
        builder.append("WHERE DI.ISVIRTUAL = ? AND DD.ISCAL = ?");
        // 如果部门编号为空,则表示为所有部门机台
        if (!StringUtils.isEmpty(partid)) {
            builder.append(" AND DD.PARTID = ? ");
            params = new Object[]{virtual, iscal, partid};
        } else {
            params = new Object[]{virtual, iscal};
        }

        builder.append("GROUP BY DD.STATEID) MS LEFT JOIN MD_PROCESS_STATE MPS ON MS.STATEID = MPS.ID");

        return this.find(builder.toString(), params);
    }

    /**
     * 获取机台的开工停工明细
     * 
     * @param deptid
     * @param stateid
     * @param virtual
     * @return
     */
    public List<DeviceDepart> getMachineWorkDetails(String deptid, String stateid, int virtual) {

        StringBuilder builder = new StringBuilder();
        List<Object> plist = new ArrayList<Object>();

        builder.append("SELECT DD.ID,DD.DEVICEID, RD.NAME AS DEPTNAME, DD.BATCHNO, MPS.NAME AS STATENAME, EI.EMPNAME ");
        builder.append(", CASE WHEN DD.LAUNCH IS NULL THEN 0 ELSE ROUND((SYSDATE - TO_DATE(DD.LAUNCH, 'yyyy-mm-dd hh24:mi:ss')) * 24, 1) END AS ACTHOUR ");
        builder.append("FROM DEVICE_DEPART DD LEFT JOIN DEVICE_INFO DI ON DD.DEVICEID = DI.ID ");
        builder.append("LEFT JOIN REGION_DEPART RD ON DD.PARTID = RD.ID LEFT JOIN EMPLOYEE_INFO EI ON DD.EMPID = EI.ID ");
        builder.append("LEFT JOIN MD_PROCESS_STATE MPS ON DD.STATEID = MPS.ID WHERE DI.ISVIRTUAL = ? ");

        plist.add(virtual);

        if (!StringUtils.isEmpty(deptid)) {
            builder.append(" AND DD.PARTID = ?");
            plist.add(deptid);
        }

        if (!StringUtils.isEmpty(stateid)) {
            builder.append(" AND DD.STATEID = ?");
            plist.add(stateid);
        }

        builder.append(" ORDER BY DD.PARTID, DD.DEVICEID");

        Object[] params = new Object[plist.size()];
        params = plist.toArray(params);

        return this.find(builder.toString(), params);
    }

    /**
     * 获取加工机台的加工种类讯息
     * 
     * @param deptid
     * @param virtual
     * @return
     */
    public List<DeviceDepart> getMachineWorkInformation(String deptid, int virtual, int iscal) {
        StringBuilder builder = new StringBuilder();

        builder.append("SELECT DD.STATEID, DD.CRAFTID, MC.CRAFTNAME FROM DEVICE_DEPART DD ");
        builder.append("LEFT JOIN DEVICE_INFO DI ON DD.DEVICEID = DI.ID LEFT JOIN ");
        builder.append("MD_CRAFT MC ON DD.CRAFTID = MC.ID WHERE DI.ISVIRTUAL = ? AND DD.ISCAL = ?");

        Object[] params = null;

        if (!StringUtils.isEmpty(deptid)) {
            builder.append(" AND DD.PARTID = ?");
            params = new Object[]{virtual, iscal, deptid};
        } else {
            params = new Object[]{virtual, iscal};
        }

        return this.find(builder.toString(), params);
    }
}
