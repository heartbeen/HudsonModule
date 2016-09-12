package com.kc.module.transaction;

import java.sql.SQLException;
import java.util.List;

import com.kc.module.dao.BaseIAtom;
import com.kc.module.model.DesignScheduleInfo;
import com.kc.module.utils.StringUtils;

public class AlertScheduleOrderIAtom extends BaseIAtom {

    @Override
    public boolean run() throws SQLException {
        try {
            String id = this.getController().getPara("id");
            if (StringUtils.isEmpty(id)) {
                this.setMsg("制程计划信息不完整");
                return false;
            }

            String resumeid = this.getController().getPara("resumeid");
            int operate = this.getController().getParaToInt("operate");

            List<DesignScheduleInfo> scheList = DesignScheduleInfo.dao.getScheduleInfo(resumeid);
            // 如果查询的结果为一条信息，不需要更新
            if (scheList.size() < 2) {
                return (true);
            }

            // 获取当前更新的索引资料行
            int currIndex = getScheIndex(scheList, id, "ID");

            // 首位
            if (operate == 0) {
                if (currIndex == 0) {
                    this.setMsg("已经是第一行了");
                    return false;
                }

                updateScheduleRanknum(scheList, currIndex, 0);
            } else if (operate == 1) {
                if (currIndex == 0) {
                    this.setMsg("已经是第一行了");
                    return false;
                }

                updateScheduleRanknum(scheList, currIndex, currIndex - 1);
            } else if (operate == 2) {
                if (currIndex == scheList.size() - 1) {
                    this.setMsg("已经是最后一行了");
                    return false;
                }

                updateScheduleRanknum(scheList, currIndex, currIndex + 1);
            } else {
                if (currIndex == scheList.size() - 1) {
                    this.setMsg("已经是最后一行了");
                    return false;
                }

                updateScheduleRanknum(scheList, currIndex, scheList.size() - 1);
            }
        }
        catch (Exception e) {
            e.printStackTrace();
            this.setMsg("调整顺序时出现异常");
            return false;
        }

        return true;
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
    private int getScheIndex(List<DesignScheduleInfo> list, String scheid, String idcol) {
        for (int i = 0; i < list.size(); i++) {
            String id = list.get(i).getStr(idcol);
            if (scheid.equals(id)) {
                return i;
            }
        }

        return -1;
    }

    /**
     * 更改制程计划的排序
     * 
     * @param list
     * @param index
     * @param nindex
     * @return
     */
    private boolean updateScheduleRanknum(List<DesignScheduleInfo> list, int index, int nindex) {
        DesignScheduleInfo sdata = list.get(index);
        // 将原来的资料删除掉
        list.remove(index);
        // 将资料插入新的位置
        if (nindex < list.size()) {
            list.add(nindex, sdata);
        } else {
            list.add(sdata);
        }

        DesignScheduleInfo t_dsi = null, u_dsi = null;
        boolean success = false;

        for (int m = 0; m < list.size(); m++) {
            t_dsi = list.get(m);
            String t_id = t_dsi.getStr("ID");

            u_dsi = new DesignScheduleInfo();
            u_dsi.set("ID", t_id).set("RANKNUM", m + 1);
            success = u_dsi.update();
            if (!success) {
                return false;
            }
        }

        return true;
    }
}
