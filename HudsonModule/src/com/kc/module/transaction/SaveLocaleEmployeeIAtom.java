package com.kc.module.transaction;

import java.sql.SQLException;

import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.base.Barcode;
import com.kc.module.dao.BaseIAtom;
import com.kc.module.utils.StringUtils;

public class SaveLocaleEmployeeIAtom extends BaseIAtom {
    private Controller controller;
    private int result;

    public Controller getController() {
        return controller;
    }

    public void setController(Controller controller) {
        this.controller = controller;
    }

    public int getResult() {
        return result;
    }

    public void setResult(int result) {
        this.result = result;
    }

    @Override
    public boolean run() throws SQLException {

        String id = this.getController().getPara("id");
        String empname = this.getController().getPara("empname");
        String worknumber = this.getController().getPara("worknumber");

        String deptid = this.getController().getPara("deptid");
        String phone = this.getController().getPara("phone");
        String shortnumber = this.getController().getPara("shortnumber");
        String stationid = this.getController().getPara("stationid");
        String email = this.getController().getPara("email");

        if (StringUtils.isEmpty(worknumber)) {
            this.setMsg("员工工号不能为空");
            return (false);
        }

        if (StringUtils.isEmpty(empname)) {
            this.setMsg("员工姓名不能为空");
            return (false);
        }

        if (StringUtils.isEmpty(deptid)) {
            this.setMsg("所在单位不能为空");
            return (false);
        }

        Record record = null;
        boolean rst = false;

        if (StringUtils.isEmpty(id)) {
            // 进行插入员工讯息的资料准备
            record = new Record();
            record.set("ID", Barcode.EMP.nextVal())
                  .set("WORKNUMBER", worknumber)
                  .set("EMPNAME", empname)
                  .set("POSID", deptid)
                  .set("STATIONID", stationid)
                  .set("PHONE", phone)
                  .set("SHORTNUMBER", shortnumber)
                  .set("EMAIL", email);

            rst = Db.save("EMPLOYEE_INFO", record);
            if (!rst) {
                this.setMsg("新增员工讯息失败");
                return (false);
            }
        } else {
            // 从数据库中判断是否存在该员工的工号讯息,如果已经存在则返回员工讯息已经存在的讯息
            record = Db.findFirst("SELECT * FROM EMPLOYEE_INFO WHERE ID = ? AND ISENABLE IS NULL", id);
            if (record == null) {
                this.setMsg("员工讯息已经不存在了");
                return (false);
            }

            record = new Record();
            record.set("ID", id)
                  .set("EMPNAME", empname)
                  .set("POSID", deptid)
                  .set("STATIONID", stationid)
                  .set("PHONE", phone)
                  .set("SHORTNUMBER", shortnumber)
                  .set("EMAIL", email);

            rst = Db.update("EMPLOYEE_INFO", record);

            if (!rst) {
                this.setMsg("更新员工讯息失败");
                return (false);
            }
        }

        return (true);
    }
}
