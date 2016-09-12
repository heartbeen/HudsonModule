package com.kc.module.model;

import java.util.List;

/**
 * 用于存放项目任务成员
 * 
 * @author ROCK
 * 
 */
public class TaskStuff extends ModelFinal<TaskStuff> {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;

    public static TaskStuff dao = new TaskStuff();

    public List<TaskStuff> getTaskStuff(String taskid) {
        StringBuilder builder = new StringBuilder();

        builder.append("SELECT TS.*,TG.NAME AS DEPTNAME,EI.EMPNAME FROM TASK_STUFF TS LEFT JOIN TASK_GROUP TG ON TS.GROUPID ");
        builder.append("= TG.ID LEFT JOIN EMPLOYEE_INFO EI ON TS.EMPID = EI.ID WHERE TS.TASKID = ? ORDER BY TG.STEPID");

        return this.find(builder.toString(), taskid);
    }
}
