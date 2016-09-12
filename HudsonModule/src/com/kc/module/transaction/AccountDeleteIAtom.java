package com.kc.module.transaction;

import java.sql.SQLException;

import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.IAtom;
import com.kc.module.model.Account;
import com.kc.module.model.Employee;

/**
 * 删除员工账号讯息
 * 
 * @author Rock
 * 
 */
public class AccountDeleteIAtom implements IAtom {

    private Controller controller;
    private String error;
    private String major;

    public String getMajor() {
        return major;
    }

    public void setMajor(String major) {
        this.major = major;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public Controller getController() {
        return controller;
    }

    public void setController(Controller controller) {
        this.controller = controller;
    }

    @Override
    public boolean run() throws SQLException {
        // 获取员工唯一号
        String accoutnId = this.controller.getPara("accountId");
        // 获取是删除账号还是全部删除的标识
        boolean allInfo = this.controller.getParaToBoolean("allInfo");
        // 获取用户角色
        String role = Account.dao.findUserRole(accoutnId);

        boolean rst = false;
        // 如果角色为管理员,返回不能删除提示
        if (this.major.equals(role)) {
            this.setError("系统管理员账号不能删除!");
            return false;
        }

        // 如果要删除员工讯息
        if (allInfo) {
            Employee emp = Employee.dao.findById(accoutnId);
            // 如果员工不为空,则删除之
            if (emp != null) {
                emp.set("ISENABLE", "1");

                rst = emp.update();

                if (!rst) {
                    this.setError("删除员工讯息失败!");
                    return rst;
                }
            }
        }

        rst = Account.dao.deleteById(accoutnId);
        if (!rst) {
            this.setError("删除员工讯息失败!");
            return rst;
        }

        return (true);
    }
}
