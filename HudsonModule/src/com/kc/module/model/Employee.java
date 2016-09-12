package com.kc.module.model;

import java.util.ArrayList;
import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.base.Barcode;
import com.kc.module.utils.StringUtils;

public class Employee extends ModelFinal<Employee> {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;
    public static Employee dao = new Employee();

    public List<Employee> getEmployeeInfo() {
        return find("SELECT worknumber,empname FROM EMPLOYEE_INFO");
    }

    public List<Employee> getEmployeeForName(Object query) {
        return find("SELECT worknumber,empname FROM EMPLOYEE_INFO where empname like '%'||?||'%'", query);
    }

    /**
     * 得到模具加工者信息
     * 
     * @param posId
     * @return
     */
    public List<Employee> getModuleProcesser(String posId) {
        String sql = "select worknumber,empname from EMPLOYEE_INFO where posid=? ORDER BY ID";

        return find(sql, posId);
    }

    /**
     * 得到模具加工者信息
     * 
     * @param posId
     * @return
     */
    public List<Employee> getEmployeeInfo(String posId) {
        String sql = "select id AS eid,empname||'['||worknumber||']' AS ename from EMPLOYEE_INFO where posid=? ORDER BY id";
        return find(sql, posId);
    }

    /**
     * 得到单位的所有员工,用于打印条码
     * 
     * @param deptStepId
     * @return
     */
    public List<Record> findEmployeeForDept(String deptStepId) {
        return Db.find("SELECT ID BARCODE,EMPNAME TEXT,EMPNAME,WORKNUMBER FROM  EMPLOYEE_INFO WHERE POSID IN (SELECT ID FROM REGION_DEPART WHERE STEPID LIKE ?||'%') AND ISENABLE IS NULL ORDER BY WORKNUMBER",
                       deptStepId);
    }

    /**
     * 通过工号匹配搜索员工的基本讯息
     * 
     * @param worknumber
     * @return
     */
    public List<Employee> findEmployeeByWorkNumber(String worknumber) {
        if (StringUtils.isEmpty(worknumber)) {
            return new ArrayList<Employee>();
        }

        StringBuilder builder = new StringBuilder();

        builder.append("SELECT ID AS USERID, EMPNAME, WORKNUMBER, PHONE, SHORTNUMBER ");
        builder.append(", POSID, STATIONID FROM EMPLOYEE_INFO WHERE WORKNUMBER LIKE ? ");

        return this.find(builder.toString(), worknumber + "%");
    }

    public boolean saveEmployeeInfo(String... info) {
        String uniqueid = null;
        boolean insert = false, result = false;
        if (StringUtils.isEmpty(info[0])) {
            uniqueid = Barcode.EMP.nextVal();
            insert = true;
        } else {
            uniqueid = info[0];
        }
        // 初始化一个Employee Bean并保存资料
        Employee emp = new Employee();
        emp.set("ID", uniqueid)
           .set("WORKNUMBER", info[1])
           .set("EMPNAME", info[2])
           .set("POSID", info[3])
           .set("STATIONID", info[4])
           .set("PHONE", info[5])
           .set("SHORTNUMBER", info[6]);

        // 判断insert标签是否为TRUE,如果为TRUE则表示新增用户,FALSE为更新用户
        if (insert) {
            result = emp.save();
        } else {
            result = emp.update();
        }

        return (result);
    }

    /**
     * 获取部门员工的相关讯息资料<br>
     * STEPID为阶梯号
     * 
     * @param match
     * @return
     */
    public List<Employee> getLocaleEmployeeInfo(String stepid) {
        // 如果部门阶梯号为空,则返回一个空的部门员工集合
        if (StringUtils.isEmpty(stepid)) {
            return new ArrayList<Employee>();
        }

        StringBuilder builder = new StringBuilder();

        builder.append("SELECT EI.ID,EI.WORKNUMBER,EI.EMPNAME,RD.ID AS DEPTID,RD.NAME AS DEPTNAME, EI.EMAIL, SN.ID AS STATIONID, SN.STATIONNAME,");
        builder.append("NVL(EI.SHORTNUMBER, EI.PHONE) AS PHONE, AI.ACCOUNTID FROM EMPLOYEE_INFO EI LEFT JOIN REGION_DEPART RD ON EI.POSID = RD.ID ");
        builder.append("LEFT JOIN STATION SN ON EI.STATIONID = SN.ID LEFT JOIN ACCOUNT_INFO AI ON EI.ID = AI.EMPID WHERE RD.STEPID LIKE ?||'%' ");
        builder.append("AND EI.ISENABLE IS NULL ORDER BY RD.ID, EI.WORKNUMBER");

        return this.find(builder.toString(), stepid);
    }

    /**
     * 判断一个用户工号是否存在
     * 
     * @param worknumber
     * @return
     */
    public boolean isExsit(String worknumber) {
        Employee emp = this.findFirst("SELECT * FROM EMPLOYEE_INFO WHERE WORKNUMBER = ?", worknumber.trim());
        return (emp != null);
    }

    /**
     * 用模糊查询的方式获取员工的基本讯息
     * 
     * @param msg
     * @return
     */
    public List<Employee> getEmployeeByVague(String msg) {
        StringBuilder builder = new StringBuilder();

        msg = StringUtils.decode(msg);

        builder.append("SELECT * FROM (SELECT ID,WORKNUMBER,EMPNAME,EMPNAME||'['||WORKNUMBER||']' ");
        builder.append("AS MERGENAME FROM EMPLOYEE_INFO WHERE ISENABLE IS NULL) WHERE MERGENAME LIKE '%'||?||'%'");

        return this.find(builder.toString(), msg);
    }

    /**
     * 获取部门员工资料
     * 
     * @param stepid
     * @return
     */
    public List<Employee> getEmployeeInfoByStepid(String stepid) {
        StringBuilder builder = new StringBuilder();

        builder.append("SELECT EI.ID, EI.EMPNAME, EI.WORKNUMBER, RD.NAME AS REGIONNAME FROM EMPLOYEE_INFO EI ");
        builder.append("LEFT JOIN REGION_DEPART RD ON EI.POSID = RD.ID WHERE EI.ISENABLE IS NULL AND RD.STEPID LIKE ?");

        return this.find(builder.toString(), stepid + "%");
    }
}
