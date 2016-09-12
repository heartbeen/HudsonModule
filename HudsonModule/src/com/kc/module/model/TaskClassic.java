package com.kc.module.model;

import java.util.List;

/**
 * 模具的属性列表
 * 
 * @author ROCK
 * 
 */
public class TaskClassic extends ModelFinal<TaskClassic> {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;

    public static TaskClassic dao = new TaskClassic();

    /**
     * 获取指定类型的模具属性
     * 
     * @param typeid
     * @return
     */
    public List<TaskClassic> getTaskClassicByType(Integer typeid) {
        return this.find("SELECT * FROM TASK_CLASSIC WHERE ISUSED = 0 AND TYPID = ? ORDER BY CODE", typeid);
    }

    /**
     * 用ID查找模具属性
     * 
     * @param id
     * @return
     */
    public TaskClassic getTaskClassicById(String id) {
        return this.findFirst("SELECT * FROM TASK_CLASSIC WHERE ID = ?", id);
    }
}
