package com.kc.module.model;

import java.util.List;

/**
 * 项目任务书明细
 * 
 * @author ROCK
 * 
 */
public class TaskInfo extends ModelFinal<TaskInfo> {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;

    public static TaskInfo dao = new TaskInfo();

    /**
     * 获取任务清单中的某个属性对应的行
     * 
     * @param id
     * @return
     */
    public List<TaskInfo> getTaskInfoByType(String id) {
        return this.find("SELECT * FROM TASK_INFO WHERE TONID = ? OR PRECIOUSID = ? OR STRUCTID = ?",
                         id,
                         id,
                         id);
    }

    /**
     * 根据制定的列来查找项目任务讯息
     * 
     * @param colName
     * @param value
     * @return
     */
    public TaskInfo getTaskInfoByColumn(String colName, String value) {
        return this.findFirst("SELECT * FROM TASK_INFO WHERE ? = ?", colName, value);
    }

    /**
     * 
     * 
     * @param colName
     * @param value
     * @return
     */
    public boolean getModuleExsistByColumn(String colName, String value) {
        TaskInfo task = this.findFirst("SELECT * FROM TASK_INFO WHERE " + colName + " = ?", value);
        if (task == null) {
            return false;
        }

        return true;
    } 

    /**
     * 获取模具任务讯息
     * 
     * @param start
     * @param limit
     * @return
     */
    public List<TaskInfo> getTaskInfo(int start, int limit) {
        StringBuilder builder = new StringBuilder();

        int min = start * limit;
        int max = (start + 1) * limit;

        builder.append("SELECT * FROM (SELECT TI.*,ML.MODULECODE,ML.GUESTCODE,rownum AS RNUM FROM ");
        builder.append("TASK_INFO TI LEFT JOIN MODULELIST ML ON TI.MODULEBARCODE = ML.MODULEBARCODE)");
        builder.append("WHERE RNUM > ? AND RNUM < ? ORDER BY CREATEDATE DESC");

        return this.find(builder.toString(), min, max);
    }
}
