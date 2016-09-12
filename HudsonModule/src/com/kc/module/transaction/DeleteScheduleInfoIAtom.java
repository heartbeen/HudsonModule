package com.kc.module.transaction;

import java.sql.SQLException;
import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.kc.module.dao.BaseIAtom;
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.StringUtils;

public class DeleteScheduleInfoIAtom extends BaseIAtom {

    @Override
    public boolean run() throws SQLException {
        String id = this.getController().getPara("id");
        String resumeid = this.getController().getPara("resumeid");
        // 如果制程计划ID为空并且设计履历ID为空则返回
        if (StringUtils.isEmpty(id) || StringUtils.isEmpty(resumeid)) {
            this.setMsg("资料信息不完善");
            return false;
        }

        StringBuilder builder = new StringBuilder();

        builder.append("SELECT DSI.ID,DSI.DESIGNRESUMEID,DSI.RANKNUM,(SELECT COUNT(*) FROM DS_PROCESS_INFO ");
        builder.append("WHERE SCHEDULEID = DSI.ID ) AS MCOUNT FROM DS_SCHEDULE_INFO DSI ");
        builder.append("WHERE DESIGNRESUMEID = ? AND DSI.SCRAPPED = ? ORDER BY DSI.RANKNUM");

        List<Record> scheList = Db.find(builder.toString(), resumeid, 0);
        // 找到当前制程计划的顺序号
        int delIndex = getScheIndex(scheList, id, "ID");
        if (delIndex < 0) {
            this.setMsg("制程计划资料已经不存在了");
            return false;
        }

        return updateScheduleRanknum(scheList, delIndex, "DS_SCHEDULE_INFO");
    }

    /**
     * 获取制程计划索引
     * 
     * @param list
     * @param scheid
     * @param idcol
     * @param rankcol
     * @return
     */
    private int getScheIndex(List<Record> list, String scheid, String idcol) {
        for (int i = 0; i < list.size(); i++) {
            String id = list.get(i).getStr(idcol);
            if (scheid.equals(id)) {
                return i;
            }
        }

        return -1;
    }

    /**
     * 删除未处于加工任务的制程计划并且将剩余计划重新排序
     * 
     * @param list
     * @param index
     * @param nindex
     * @return
     */
    private boolean updateScheduleRanknum(List<Record> list, int index, String table) {
        Record sdata = list.get(index);

        // 判断制程是否正在进行中
        int rcount = ArithUtils.toInt(sdata.getNumber("MCOUNT"), 0);
        if (rcount > 0) {
            this.setMsg("正在加工环节不能删除");
            return false;
        }

        Record t_dsi = null, u_dsi = null;
        boolean success = false;
        // 将制程计划设置为报废
        u_dsi = new Record();
        u_dsi.set("ID", sdata.getStr("ID")).set("SCRAPPED", 1);
        success = Db.update(table, u_dsi);
        if (!success) {
            this.setMsg("删除制程计划失败");
            return false;
        }

        // 将原来的资料删除掉
        list.remove(index);

        if (list.size() > 0) {
            for (int m = 0; m < list.size(); m++) {
                t_dsi = list.get(m);
                String t_id = t_dsi.getStr("ID");

                u_dsi = new Record();
                u_dsi.set("ID", t_id).set("RANKNUM", m + 1);

                success = Db.update(table, u_dsi);
                if (!success) {
                    this.setMsg("删除制程计划失败");
                    return false;
                }
            }
        }

        return true;
    }
}
