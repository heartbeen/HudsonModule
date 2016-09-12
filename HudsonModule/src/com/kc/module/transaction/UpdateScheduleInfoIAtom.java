package com.kc.module.transaction;

import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.Date;

import com.kc.module.dao.BaseIAtom;
import com.kc.module.model.DesignScheduleInfo;
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.DateUtils;
import com.kc.module.utils.StringUtils;

public class UpdateScheduleInfoIAtom extends BaseIAtom {

    @Override
    public boolean run() throws SQLException {
        try {
            String id = this.getController().getPara("id");
            String planstart = this.getController().getPara("planstart");
            String planend = this.getController().getPara("planend");
            String planhour = this.getController().getPara("planhour");

            String factstart = this.getController().getPara("factstart");
            String factend = this.getController().getPara("factend");

            if (StringUtils.isEmpty(id)) {
                this.setMsg("制程信息不完整");
                return (false);
            }

            Timestamp ts_start = null, ts_end = null, ft_start = null, ft_end = null;

            // 判断开始时间
            if (!StringUtils.isEmpty(planstart)) {
                Date startdate = this.getController().getParaToDate("planstart");
                ts_start = DateUtils.parseTimeStamp(startdate);
            }

            // 判断结束时间
            if (!StringUtils.isEmpty(planend)) {
                Date enddate = this.getController().getParaToDate("planend");
                ts_end = DateUtils.parseTimeStamp(enddate);
            }

            if (ts_start != null && ts_end != null) {
                if (ts_start.getTime() > ts_end.getTime()) {
                    this.setMsg("开始日期不能大于结束日期");
                    return (false);
                }
            }

            // TODO 实际时间判定

            // 判断开始时间
            if (!StringUtils.isEmpty(factstart)) {
                Date startdate = this.getController().getParaToDate("factstart");
                ft_start = DateUtils.parseTimeStamp(startdate);
            }

            // 判断结束时间
            if (!StringUtils.isEmpty(factend)) {
                Date enddate = this.getController().getParaToDate("factend");
                ft_end = DateUtils.parseTimeStamp(enddate);
            }

            if (ft_start != null && ft_end != null) {
                if (ft_start.getTime() > ft_end.getTime()) {
                    this.setMsg("开始日期不能大于结束日期");
                    return (false);
                }
            }

            DesignScheduleInfo dsi = new DesignScheduleInfo();
            boolean result = dsi.set("ID", id)
                                .set("PLANSTART", ts_start)
                                .set("PLANEND", ts_end)
                                .set("FACTSTART", ft_start)
                                .set("FACTEND", ft_end)
                                .set("PLANHOUR", StringUtils.isEmpty(planhour) ? planhour : ArithUtils.parseDouble(planhour, 0))
                                .update();
            if (!result) {
                this.setMsg("更新制程计划失败");
                return (false);
            }

            return true;
        }
        catch (Exception e) {
            this.setMsg("保存资料出现异常");
            return (false);
        }
    }

}
