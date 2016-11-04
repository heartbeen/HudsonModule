package com.kc.module.transaction;

import java.sql.SQLException;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.dao.BaseIAtom;
import com.kc.module.utils.ControlUtils;
import com.kc.module.utils.MD5Utils;
import com.kc.module.utils.StringUtils;

public class AlertUserInfoIAtom extends BaseIAtom {

    @Override
    public boolean run() throws SQLException {
        try {
            String accountId = ControlUtils.getAccountId(this.getController());

            String security_old = this.getController().getPara("security_old");
            String security_new = this.getController().getPara("security_new");
            String security_repeat = this.getController().getPara("security_repeat");

            if (StringUtils.isEmpty(security_old)) {
                this.setMsg("旧密码不能为空");
                return false;
            }

            if (StringUtils.isEmpty(security_new)) {
                this.setMsg("新密码不能为空");
                return false;
            }

            if (!StringUtils.isRegex("^\\w{3,20}$", security_new)) {
                this.setMsg("新密码必须为3-20位的字母数字或者下划线");
                return false;
            }

            if (!security_new.equals(security_repeat)) {
                this.setMsg("新密码和重复密码不一致");
                return false;
            }

            if (security_new.equals(security_old)) {
                this.setMsg("新密码和旧密码不能相同");
                return false; 
            }

            Record record = Db.findFirst("SELECT * FROM ACCOUNT_INFO WHERE ACCOUNTID = ? AND VALID = ?", accountId, "1");
            if (record == null) {
                this.setMsg("账号信息不存在或者已经无效");
                return false;
            }

            String md5_code = MD5Utils.getMD5(security_old);
            System.out.println(md5_code);

            // 获取当前账号密码
            String current_password = record.getStr("PASSWORD");
            if (!md5_code.equals(current_password)) {
                this.setMsg("旧密码输入不正确");
                return false;
            }

            String fresh_code = MD5Utils.getMD5(security_new);
            record.set("PASSWORD", fresh_code);

            boolean result = Db.update("ACCOUNT_INFO", "ACCOUNTID", record);
            if (!result) {
                this.setMsg("修改密码失败");
                return false;
            }

            return true;
        }
        catch (Exception e) {
            e.printStackTrace();
            this.setMsg("操作失败请重试");
            return false;
        }
    }

}
