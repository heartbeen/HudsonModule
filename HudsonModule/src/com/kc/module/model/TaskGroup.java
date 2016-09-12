package com.kc.module.model;

import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.kc.module.base.Barcode;
import com.kc.module.utils.ArithUtils;
import com.kc.module.utils.StringUtils;

/**
 * 任务组讯息
 * 
 * @author ROCK
 * 
 */
public class TaskGroup extends ModelFinal<TaskGroup> {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;

    public static TaskGroup dao = new TaskGroup();

    /**
     * 获取系统工件的最大阶梯ID值
     * 
     * @param stepid
     * @return
     */
    public String getMaxStepId(String stepid) {
        String stepIdVal = "";
        String queryCase = (StringUtils.isEmpty(stepid) ? "__" : stepid + "__");

        TaskGroup taskGroup = this.findFirst("SELECT MAX(STEPID) AS MAXSTEPID FROM TASK_GROUP WHERE STEPID LIKE ?",
                                             queryCase);

        String maxStepid = taskGroup.getStr("MAXSTEPID");
        if (StringUtils.isEmpty(maxStepid)) {
            stepIdVal = stepid + "01";
        } else {
            int appendMaxId = ArithUtils.parseInt(maxStepid) + 1;
            stepIdVal = StringUtils.leftPad(appendMaxId, maxStepid.length(), "0");
        }

        return stepIdVal;
    }

    public List<TaskGroup> getAllTaskGroup() {
        return this.find("SELECT NAME AS TEXT,ID,STEPID FROM TASK_GROUP ORDER BY STEPID");
    }

    public List<TaskGroup> getAnsyTaskTree(String stepid) {
        String queryCase = (StringUtils.isEmpty(stepid) ? "__" : stepid + "__");
        return this.find("SELECT ID, NAME AS TEXT,STEPID FROM TASK_GROUP WHERE ISUSED = 0 AND STEPID LIKE ? ORDER BY STEPID",
                         queryCase);
    }

    /**
     * 更新任务组织单位[0为新增1更新其他删除]
     * 
     * @param id
     * @param name
     * @param stepid
     * @param type
     * @return
     */
    public boolean operateTaskGroup(String id, String name, String stepid, int type) {
        if (type == 0) {
            return new TaskGroup().set("ID", Barcode.TASK_GROUP.nextVal())
                                  .set("NAME", name)
                                  .set("STEPID", getMaxStepId(stepid))
                                  .set("ISUSED", 0)
                                  .save();
        } else if (type == 1) {
            return new TaskGroup().set("ID", id).set("NAME", name).update();
        } else {
            if (!StringUtils.isEmpty(stepid)) {
                int result = Db.update("UPDATE TASK_GROUP SET ISUSED = 1 WHERE STEPID LIKE ?",
                                       stepid + "%");
                if (result < 0) {
                    return (false);
                }

                result = Db.update("DELETE FROM TASK_STRUCT WHERE GROUPID IN (SELECT ID FROM TASK_GROUP WHERE STEPID LIKE ?)",
                                   stepid + "%");

                return (result > -1);
            }

            return (false);
        }
    }
}
