package com.kc.module.transaction;

import java.sql.SQLException;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.dao.BaseIAtom;
import com.kc.module.utils.ControlUtils;
import com.kc.module.utils.StringUtils;

public class DeleteLocaleEmployeeIAtom extends BaseIAtom {
    @Override
    public boolean run() throws SQLException {

        // 如果前台传来的员工唯一ID号为空,则返回TRUE
        String empbarid = this.getController().getPara("empid");
        if (StringUtils.isEmpty(empbarid)) {
            this.setMsg("员工资料不能为空");
            return (true);
        }

        String empid = ControlUtils.getEmpBarCode(this.getController());

        // 生成员工基本以及账号讯息的SQL
        StringBuilder builder = new StringBuilder();

        builder.append("SELECT EI.ID, AI.ACCOUNTID, AI.VALID FROM EMPLOYEE_INFO EI LEFT JOIN ");
        builder.append("ACCOUNT_INFO AI ON EI.ID = AI.EMPID WHERE EI.ID = ? AND EI.ISENABLE IS NULL");

        // 如果查询的结果为数据为空,则返回TRUE
        Record rcd = Db.findFirst(builder.toString(), empbarid);
        if (rcd == null) {
            this.setMsg("员工资料不能为空");
            return (false);
        }

        String t_empid = rcd.getStr("ID");
        String t_accountid = rcd.getStr("ACCOUNTID");
        String t_valid = rcd.getStr("VALID");

        // 如果待删除讯息为系统登录本人讯息,则返回FALSE
        if (empid.equals(t_empid)) {
            this.setMsg("不能删除本人讯息");
            return (false);
        }

        // 设置员工讯息为不可用
        Record empRcd = new Record();
        empRcd.set("ID", t_empid).set("ISENABLE", "1");

        boolean empRst = Db.update("EMPLOYEE_INFO", empRcd);
        if (!empRst) {
            this.setMsg("删除员工讯息失败");
            return empRst;
        }

        // 如果员工账号的可用状态为可用1,则将其调整为不可用0
        if (!StringUtils.isEmpty(t_valid) && t_valid.equals("1")) {
            empRcd = new Record();
            empRcd.set("ACCOUNTID", t_accountid).set("VALID", "0");

            empRst = Db.update("ACCOUNT_INFO", "ACCOUNTID", empRcd);
            if (!empRst) {
                this.setMsg("删除账号讯息失败");
                return (false);
            }
        }

        return (true);
    }

}
