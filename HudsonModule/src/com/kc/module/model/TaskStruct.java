package com.kc.module.model;

import java.util.ArrayList;
import java.util.List;

import com.kc.module.base.Barcode;
import com.kc.module.utils.DBUtils;
import com.kc.module.utils.JsonUtils;
import com.kc.module.utils.StringUtils;

/**
 * 用于存放项目任务结构图
 * 
 * @author ROCK
 * 
 */
public class TaskStruct extends ModelFinal<TaskStruct> {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;

    public static TaskStruct dao = new TaskStruct();

    /**
     * 获取组织成员清单
     * 
     * @param stepid
     * @return
     */
    public List<TaskStruct> getTaskStructInfo(String stepid) {
        if (StringUtils.isEmpty(stepid)) {
            return new ArrayList<TaskStruct>();
        }
        StringBuilder builder = new StringBuilder();

        builder.append("SELECT TS.ID, EI.EMPNAME, TG.NAME AS DEPTNAME, TS.ISGENERAL, TS.ISMAJOR ");
        builder.append(", TS.ISGROUP, TS.ISCHECKER, TS.ISSUM, TS.ISSPECIFIC FROM TASK_STRUCT TS ");
        builder.append("LEFT JOIN EMPLOYEE_INFO EI ON TS.EMPID = EI.ID ");
        builder.append("LEFT JOIN TASK_GROUP TG ON TS.GROUPID = TG.ID ");
        builder.append("WHERE TG.STEPID LIKE ?");

        return this.find(builder.toString(), stepid + "%");

    }

    /**
     * 将TASK_STRUCT表中的资料更新
     * 
     * @param uniqueCol
     * @param uniqueVal
     * @param updateCol
     * @param upVal
     * @return
     */
    public boolean updateTaskStruct(String uniqueCol,
                                    String uniqueVal,
                                    String updateCol,
                                    boolean upVal) {
        return new TaskStruct().set(updateCol, upVal ? 1 : 0).set(uniqueCol, uniqueVal).update();
    }

    /**
     * 删除TASK_STRUCT表中的员工讯息
     * 
     * @param uniqueCol
     * @param uniqueVal
     * @return
     */
    public boolean deleteTaskStruct(String uniqueCol, String uniqueVal) {
        return new TaskStruct().set(uniqueCol, uniqueVal).delete();
    }

    /**
     * 新增任务组织成员
     * 
     * @param groupid
     * @param empid
     * @return
     */
    public boolean addTaskStruct(String groupid, String empid) {
        if (!StringUtils.isEmpty(groupid) && !StringUtils.isEmpty(empid)) {

            TaskStruct task = this.findFirst("SELECT * FROM TASK_STRUCT WHERE EMPID = ?", empid);
            if (task != null) {
                return (true);
            } else {
                return new TaskStruct().set("ID", Barcode.TASK_STRUCT.nextVal())
                                       .set("GROUPID", groupid)
                                       .set("EMPID", empid)
                                       .save();
            }
        }

        return false;
    }

    /**
     * 获取任务单位下的人员明细
     * 
     * @param groupid
     * @return
     */
    public List<TaskStruct> getTaskStructByStepid(String stepid) {
        StringBuilder builder = new StringBuilder();

        builder.append("SELECT TS.ID, EI.EMPNAME FROM TASK_STRUCT TS LEFT JOIN EMPLOYEE_INFO EI");
        builder.append(" ON TS.EMPID = EI.ID LEFT JOIN TASK_GROUP TG ON TS.GROUPID = TG.ID WHERE TG.STEPID = ?");

        return this.find(builder.toString(), stepid);
    }
    
    /**
     * 获取任务树节点的对应的单位成员
     * @param treeid
     * @return
     */
    public List<TaskStruct> getJoinTaskStuff(String treeid) {

        List<TaskStruct> stuff = new ArrayList<TaskStruct>();

        String[] treeItems = JsonUtils.parseUniqueJsArray(treeid);
        if (treeItems == null || treeItems.length == 0) {
            return stuff;
        }

        List<String> empInfo = new ArrayList<String>();
        List<String> groupInfo = new ArrayList<String>();

        for (String tree : treeItems) {
            if (tree.contains("g-")) {
                groupInfo.add(tree.replace("g-", ""));
            } else {
                empInfo.add(tree.replace("s-", ""));
            }
        }

        StringBuilder builder = new StringBuilder();

        builder.append("SELECT TS.*, TG.NAME AS DEPTNAME, EI.EMPNAME FROM TASK_STRUCT TS LEFT JOIN TASK_GROUP TG ON ");
        builder.append("TS.GROUPID = TG.ID LEFT JOIN EMPLOYEE_INFO EI ON TS.EMPID = EI.ID WHERE 1 = 1");
        if (empInfo.size() > 0) {
            builder.append(" AND TS.ID IN ");
            builder.append(DBUtils.sqlIn(empInfo));
        }

        if (groupInfo.size() > 0) {
            String groupPart = " OR (";
            for (String gp : groupInfo) {
                groupPart += (" TG.STEPID LIKE '" + gp + "%' OR");
            }

            groupPart = groupPart.substring(0, groupPart.length() - 3) + ")";

            builder.append(groupPart);
        }

        return this.find(builder.toString());
    }
}
